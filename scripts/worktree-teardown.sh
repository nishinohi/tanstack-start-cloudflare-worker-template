#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# worktree-teardown.sh - Git Worktree 削除
# ============================================================
# Usage: ./scripts/worktree-teardown.sh [-b] <worktree-name>
# ============================================================

MAIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREES_DIR="$MAIN_ROOT/.worktrees"

DELETE_BRANCH=false

usage() {
  echo "Usage: $0 [-b] <worktree-name>"
  echo ""
  echo "  worktree-name   .worktrees/ 内のディレクトリ名"
  echo ""
  echo "Options:"
  echo "  -b   ワークツリー削除と同時にブランチも削除する"
  exit 1
}

while getopts "b" opt; do
  case "$opt" in
    b) DELETE_BRANCH=true ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))

if [[ $# -lt 1 ]]; then
  usage
fi

WT_NAME="$1"
WORKTREE_PATH="$WORKTREES_DIR/$WT_NAME"

if [[ ! -d "$WORKTREE_PATH" ]]; then
  echo "ERROR: ワークツリーが見つかりません: $WORKTREE_PATH"
  exit 1
fi

# 現在のブランチ情報を表示
BRANCH=$(git -C "$WORKTREE_PATH" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo "ワークツリーを削除します:"
echo "  ディレクトリ: $WORKTREE_PATH"
echo "  ブランチ:     $BRANCH"
if [[ "$DELETE_BRANCH" == true ]]; then
  echo "  ブランチ削除: yes"
fi
echo ""

read -r -p "本当に削除しますか? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "キャンセルしました。"
  exit 0
fi

echo ""
echo "==> ワークツリーを削除中..."
git -C "$MAIN_ROOT" worktree remove "$WORKTREE_PATH" --force

echo "ワークツリー '$WT_NAME' を削除しました。"

# ブランチ削除
if [[ "$DELETE_BRANCH" == true && "$BRANCH" != "unknown" ]]; then
  echo ""
  echo "==> ブランチ '$BRANCH' を削除中..."
  git -C "$MAIN_ROOT" branch -D "$BRANCH"
  echo "ブランチ '$BRANCH' を削除しました。"
fi
