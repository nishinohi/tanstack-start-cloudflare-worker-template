#!/usr/bin/env bash
#
# PostToolUse フック — Write / Edit が触ったファイルを自動整形する。
#
# 実行順は stylelint → textlint → prettier。
# 整形の最終決定権は Prettier にあるので必ず最後に回す。
# eslint は 1 ファイルでも 7 秒前後かかるため、ここでは実行しない
# （lint は Stop フックの stop-check.sh がまとめて見る）。
#
# 標準入力にフックの JSON が来る。stdout に JSON を返すと Claude に伝わる。
# 何があっても exit 0 で抜ける — 整形の失敗でツール呼び出しを止めない。

set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$PWD}"
bin="$root/node_modules/.bin"

# jq が無い環境では黙って何もしない
command -v jq >/dev/null 2>&1 || exit 0

file="$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')"
[ -n "$file" ] || exit 0
[ -f "$file" ] || exit 0

# 絶対パスに正規化してからプロジェクト内かを見る。
# ディレクトリ部は pwd -P で解決する。文字列のまま突き合わせると
# ../other-repo/x.ts のような相対パスが "$root"/* に一致してしまい、
# プロジェクト外のファイルを整形してしまう。
# ファイル自身がシンボリックリンクの場合は実体を追わない: 二重整形は
# 各ツールの ignore 設定（.prettierignore など）に任せる。
case "$file" in
    /*) abs="$file" ;;
    *) abs="$PWD/$file" ;;
esac

# root 側も同じ方法で解決する。片方だけ物理パスにすると、
# ルートまでの経路にシンボリックリンクがあるときに全ファイルが弾かれる
dir="${abs%/*}"
[ -n "$dir" ] || dir="/"
dir="$(cd "$dir" 2>/dev/null && pwd -P)" || exit 0
abs="${dir%/}/${abs##*/}"
rootp="$(cd "$root" 2>/dev/null && pwd -P)" || exit 0

case "$abs" in
    "$rootp"/*) ;;
    *) exit 0 ;;
esac

# 生成物・依存は各ツールの ignore 設定でも弾かれるが、
# ここで落としておくとプロセス起動そのものを省ける
case "$abs" in
    */node_modules/* | */dist/* | */.wrangler/* | */.vite/* | */.git/*) exit 0 ;;
    */routeTree.gen.ts | */worker-configuration.d.ts) exit 0 ;;
esac

before="$(cksum <"$abs")"

# stylelint: CSS のみ
case "$abs" in
    *.css)
        [ -x "$bin/stylelint" ] && "$bin/stylelint" --fix "$abs" >/dev/null 2>&1
        ;;
esac

# textlint: Markdown の日本語校正
case "$abs" in
    *.md)
        [ -x "$bin/textlint" ] && "$bin/textlint" --fix "$abs" >/dev/null 2>&1
        ;;
esac

# prettier: 対象拡張子は lefthook.yml の pre-commit と同じ集合に揃える。
# 全種別に広げると、未整形のまま放置されている yml などを一度触っただけで
# 全面整形の差分が混ざる
case "$abs" in
    *.js | *.jsx | *.ts | *.tsx | *.json | *.css | *.md)
        [ -x "$bin/prettier" ] && "$bin/prettier" --write "$abs" >/dev/null 2>&1
        ;;
esac

after="$(cksum <"$abs")"
[ "$before" = "$after" ] && exit 0

# 書き換えたことをモデルに伝える。読み込み済みの内容は古くなっている
rel="${abs#"$rootp"/}"
jq -nc --arg rel "$rel" '{
    systemMessage: ("自動整形しました: " + $rel),
    suppressOutput: true,
    hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: ("stylelint / textlint / prettier が " + $rel + " を自動修正しました。編集する前に読み直してください。")
    }
}'
exit 0
