#!/usr/bin/env bash
#
# Stop フック — プロジェクト全体の静的解析（lint / typecheck）とテストを回す。
#
# 3 つ合わせて 2 分前後かかるため、実行前に git の差分を見て
# 「結果を左右しうる変更か」を判定する。
# css・md・画像・yml だけの変更なら何もせず抜ける。
#
# lint は PostToolUse で eslint を回していない分、ここで --fix 付きで走らせる
# （pnpm check は `;` 連結＋末尾 prettier のせいで常に exit 0 になり、
#  ゲートには使えないので lint:fix = `oxlint --fix && eslint --fix` を使う）。
#
# 失敗したら decision:block で Claude に差し戻す。差し戻しはセッションごとに
# MAX_BLOCKS 回まで。stop_hook_active で一律に抜けると「差し戻した後の修正が
# 検証されないまま終わる」ので、回数で頭打ちにして再検証だけは必ず通す。

set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" 2>/dev/null || exit 0

# jq が無い環境では黙って何もしない
command -v jq >/dev/null 2>&1 || exit 0
input="$(cat)"

git rev-parse --git-dir >/dev/null 2>&1 || exit 0

# 差し戻し回数をセッション単位で覚えておく。直せないエラーで
# 無限ループさせないための上限で、上限に達したら block せず警告だけ出す
MAX_BLOCKS=2
state_dir="${TMPDIR:-/tmp}/claude-stop-check"
mkdir -p "$state_dir" 2>/dev/null || exit 0
# 取り残された古いセッションの分は捨てる
find "$state_dir" -type f -mtime +1 -delete 2>/dev/null

session="$(jq -r '.session_id // "unknown"' <<<"$input")"
state="$state_dir/${session//[^A-Za-z0-9_-]/_}"
blocks="$(cat "$state" 2>/dev/null)"
case "$blocks" in
    '' | *[!0-9]*) blocks=0 ;;
esac

# 追跡ファイルの変更（staged + unstaged）と未追跡ファイルを合わせて見る。
# HEAD が無い（初回コミット前）リポジトリでは diff 側が空になるだけ。
changed="$(
    {
        git -c core.quotePath=false diff --name-only HEAD 2>/dev/null
        git -c core.quotePath=false ls-files --others --exclude-standard 2>/dev/null
    } | sort -u
)"
[ -n "$changed" ] || exit 0

# 解析・テストの対象になる変更か判定する。
#
#   拡張子   JS・TS 一族（js jsx ts tsx mjs mts cjs cts）
#            → oxlint / eslint / tsc / vitest が読むファイル
#   個別     package.json・tsconfig*.json・wrangler.jsonc・.oxlintrc.json
#            → 解析そのものの前提が変わる
#
# .claude/ や .github/ の下はアプリのコードを含まないので先に落とす。
# .css・.md・画像・.sh・.yml は拡張子で掛からないため静かに抜ける
# （整形は PostToolUse の format-file.sh と lefthook が見ている）。
relevant="$(
    printf '%s\n' "$changed" |
        grep -Ev '^(\.claude|\.github|\.vscode)/' |
        grep -E \
            -e '\.[cm]?[jt]sx?$' \
            -e '(^|/)(package\.json|tsconfig[^/]*\.json|wrangler\.jsonc|\.oxlintrc\.json)$'
)"
[ -n "$relevant" ] || exit 0

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# 失敗しても止めず、全部の結果を集めてまとめて返す — 直しの往復を減らしたい
run() {
    local name="$1" slug="${1//:/-}"
    if pnpm run "$name" >"$tmp/$slug.log" 2>&1; then
        : >"$tmp/$slug.ok"
    fi
}

# 自動修正でどのファイルが書き換わったかを見るための指紋。
# eslint --fix は差分に無いファイルも直しうるが、モデルに読み直させたいのは
# 今回触ったファイルなので対象は $relevant に絞る
fingerprint() {
    while IFS= read -r file; do
        [ -f "$file" ] && printf '%s %s\n' "$(cksum <"$file")" "$file"
    done <<<"$relevant"
}

fingerprint >"$tmp/before.txt"

# lint:fix はファイルを書き換えるので、typecheck / test と並列にはできない。
# 先に単独で走らせ、修正後の内容を後続に読ませる
run lint:fix

fingerprint >"$tmp/after.txt"
fixed="$(diff "$tmp/before.txt" "$tmp/after.txt" | sed -n 's/^< [0-9]* [0-9]* //p')"

checks=(typecheck test)
for name in "${checks[@]}"; do
    run "$name" &
done
wait

failed=""
: >"$tmp/report.txt"
for name in lint:fix "${checks[@]}"; do
    slug="${name//:/-}"
    [ -f "$tmp/$slug.ok" ] && continue
    failed="${failed}${failed:+ / }$name"
    {
        printf '===== pnpm %s =====\n' "$name"
        # 具体的なエラーはどのツールも出力の後ろに出る。長すぎる分はここで切る
        [ "$(wc -c <"$tmp/$slug.log")" -gt 4000 ] && printf '（前略）\n'
        tail -c 4000 "$tmp/$slug.log"
        printf '\n\n'
    } >>"$tmp/report.txt"
done

count="$(printf '%s\n' "$relevant" | wc -l | tr -d ' ')"

# 自動修正が入ったなら書き換えたファイルを知らせる。
# systemMessage はユーザーにしか届かない（Stop フックにモデルへ文脈を渡す口は無い）。
# モデルが読むのは block の reason だけなので、読み直しの指示はそちらにだけ書く
note=""
note_block=""
if [ -n "$fixed" ]; then
    note="$(printf '\nlint:fix が自動修正しました:\n%s\n' "$fixed")"
    note_block="$(printf '\nlint:fix が以下を自動修正しました。編集する前に読み直してください。\n%s\n' "$fixed")"
fi

if [ -z "$failed" ]; then
    rm -f "$state"
    jq -nc --arg n "$count" --arg note "$note" \
        '{ systemMessage: ("lint:fix / typecheck / test 通過（対象 " + $n + " ファイル）" + $note), suppressOutput: true }'
    exit 0
fi

# 上限に達したら差し戻さない。ただし黙って終わると落ちたまま気付けないので、
# ユーザーには見えるように systemMessage で伝える
if [ "$blocks" -ge "$MAX_BLOCKS" ]; then
    jq -nc --arg names "$failed" --arg max "$MAX_BLOCKS" --arg note "$note" \
        '{ systemMessage: ("pnpm " + $names + " が失敗したままです（" + $max + " 回差し戻したので打ち切り）。手動で確認してください。" + $note) }'
    exit 0
fi

printf '%s\n' "$((blocks + 1))" >"$state"

jq -nc --arg names "$failed" --arg note "$note_block" \
    --arg nth "$((blocks + 1))" --arg max "$MAX_BLOCKS" --rawfile out "$tmp/report.txt" '{
    decision: "block",
    reason: ("pnpm " + $names + " が失敗しました。作業を終える前に直してください（差し戻し " + $nth + "/" + $max + " 回目）。" + $note + "\n\n" + $out)
}'
exit 0
