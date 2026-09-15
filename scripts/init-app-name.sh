#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# init-app-name.sh - テンプレートのアプリ名を一括置換
# ============================================================
# Usage: ./scripts/init-app-name.sh [-n] <app-name>
#
# テンプレートのプレースホルダー `your-app-name` を指定したアプリ名へ
# 一括置換する。Git の管理対象ファイルのみを対象とし、このスクリプト
# 自身は置換対象から除外する。
#
# 主な置換箇所:
#   - apps/web/wrangler.jsonc              Worker 名 / D1 名 / BASE_URL
#   - apps/web/package.json                db:drop:* スクリプト
#   - apps/web/worker-configuration.d.ts   生成済みの Cloudflare 型定義
#   - CLAUDE.md                            ドキュメント中の記述
# ============================================================

PLACEHOLDER='your-app-name'
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SELF_REL="scripts/$(basename "$0")"

DRY_RUN=false

usage() {
  echo "Usage: $0 [-n] <app-name>"
  echo ""
  echo "  app-name   置換後のアプリ名 (英小文字・数字・ハイフン、先頭と末尾はハイフン不可)"
  echo ""
  echo "Options:"
  echo "  -n   置換せず、対象ファイルと件数だけを表示する (dry-run)"
  exit 1
}

while getopts "n" opt; do
  case "$opt" in
    n) DRY_RUN=true ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))

if [[ $# -ne 1 ]]; then
  usage
fi

APP_NAME="$1"

# ----------------------------------------------------------
# 1. アプリ名の検証
# ----------------------------------------------------------
# Cloudflare Workers / D1 の命名制約に合わせる。
# 環境ごとに "-unconfigured" (13 文字) までサフィックスが付くため、
# Worker 名の上限 63 文字から逆算して 50 文字までに制限する。
if [[ ! "$APP_NAME" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]]; then
  echo "ERROR: アプリ名は英小文字・数字・ハイフンのみ使用できます (先頭と末尾はハイフン不可): $APP_NAME"
  exit 1
fi

if [[ ${#APP_NAME} -gt 50 ]]; then
  echo "ERROR: アプリ名は 50 文字以内にしてください (現在 ${#APP_NAME} 文字)"
  exit 1
fi

if [[ "$APP_NAME" == "$PLACEHOLDER" ]]; then
  echo "ERROR: プレースホルダーと同じ名前は指定できません: $PLACEHOLDER"
  exit 1
fi

# ----------------------------------------------------------
# 2. 対象ファイルの収集
# ----------------------------------------------------------
FILES=()
FILE_COUNT=0
while IFS= read -r -d '' file; do
  FILES+=("$file")
  FILE_COUNT=$((FILE_COUNT + 1))
done < <(git -C "$ROOT" grep -lIz --fixed-strings -e "$PLACEHOLDER" -- . ":(top,exclude)$SELF_REL" || true)

if [[ $FILE_COUNT -eq 0 ]]; then
  echo "'$PLACEHOLDER' を含むファイルはありません (既に初期化済みの可能性があります)"
  exit 0
fi

echo "==> '$PLACEHOLDER' -> '$APP_NAME' (${FILE_COUNT} ファイル)"
for file in "${FILES[@]}"; do
  hits="$(git -C "$ROOT" grep -c --fixed-strings -e "$PLACEHOLDER" -- "$file")"
  echo "    ${hits##*:} 行  $file"
done

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "dry-run のため置換していません。-n を外して再実行してください。"
  exit 0
fi

# ----------------------------------------------------------
# 3. 置換の実行
# ----------------------------------------------------------
(
  cd "$ROOT"
  PLACEHOLDER="$PLACEHOLDER" APP_NAME="$APP_NAME" \
    perl -pi -e 's/\Q$ENV{PLACEHOLDER}\E/$ENV{APP_NAME}/g' -- "${FILES[@]}"
)

echo ""
echo "==> 置換が完了しました"
echo ""
echo "次の手順:"
echo "  1. Cloudflare で D1 / KV を作成し、apps/web/wrangler.jsonc の"
echo "     database_id と kv_namespaces の id を実際の値へ差し替える"
echo "     (トップレベルはガード用のため、ダミー ID のままにしておく)"
echo "  2. wrangler.jsonc の BASE_URL に含まれるアカウントのサブドメインを"
echo "     自分のものへ変更する"
echo "  3. pnpm typegen:cf で Cloudflare の型定義を再生成する"
echo "  4. 必要に応じてルート package.json の name も変更する"
