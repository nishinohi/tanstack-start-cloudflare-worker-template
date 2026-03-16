#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# worktree-sync-db.sh - メインの DB スナップショットをワークツリーに同期
# ============================================================
# Usage: ./scripts/worktree-sync-db.sh <worktree-name>
# ============================================================

MAIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREES_DIR="$MAIN_ROOT/.worktrees"

usage() {
  echo "Usage: $0 <worktree-name>"
  echo ""
  echo "  worktree-name   .worktrees/ 内のディレクトリ名"
  echo ""
  echo "  メインワークツリーの D1 SQLite スナップショットをコピーします。"
  echo "  同期先のワークツリーで dev サーバーが停止していることを確認してください。"
  exit 1
}

if [[ $# -lt 1 ]]; then
  usage
fi

WT_NAME="$1"
WORKTREE_PATH="$WORKTREES_DIR/$WT_NAME"

if [[ ! -d "$WORKTREE_PATH" ]]; then
  echo "ERROR: ワークツリーが見つかりません: $WORKTREE_PATH"
  exit 1
fi

MAIN_D1="$MAIN_ROOT/apps/web/.wrangler/state/v3/d1"
WT_D1="$WORKTREE_PATH/apps/web/.wrangler/state/v3/d1"

if [[ ! -d "$MAIN_D1" ]]; then
  echo "ERROR: メインの D1 ディレクトリが見つかりません: $MAIN_D1"
  exit 1
fi

echo "==> D1 スナップショットを同期中..."
echo "    From: $MAIN_D1"
echo "    To:   $WT_D1"

# 既存の .sqlite ファイルを削除してからコピー
if [[ -d "$WT_D1" ]]; then
  find "$WT_D1" -name '*.sqlite' -delete 2>/dev/null || true
  find "$WT_D1" -name '*.sqlite-wal' -delete 2>/dev/null || true
  find "$WT_D1" -name '*.sqlite-shm' -delete 2>/dev/null || true
fi

mkdir -p "$WT_D1"

(cd "$MAIN_D1" && find . -name '*.sqlite' -print0 | while IFS= read -r -d '' file; do
  dir="$(dirname "$file")"
  mkdir -p "$WT_D1/$dir"
  cp "$MAIN_D1/$file" "$WT_D1/$file"
done)

echo ""
echo "D1 スナップショットの同期が完了しました。"
