#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# worktree-setup.sh - Git Worktree 並列開発環境セットアップ
# ============================================================
# Usage: ./scripts/worktree-setup.sh [-c] <branch-name> [directory-name]
#
# pnpm モノレポで git worktree を利用した並列開発環境を自動構築する。
#   - pnpm install + workspace パッケージビルド
#   - 環境ファイル (.env.*, .dev.vars.*) のコピー
#   - .wrangler DB/KV/R2 スナップショットのコピー
#   - ポート番号の自動計算
# ============================================================

MAIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREES_DIR="$MAIN_ROOT/.worktrees"

CHANGE_DIR=false

usage() {
  echo "Usage: $0 [-c] <branch-name> [directory-name]"
  echo ""
  echo "  branch-name     作成・チェックアウトするブランチ名"
  echo "  directory-name   ワークツリーのディレクトリ名 (省略時: ブランチ名の / を - に置換)"
  echo ""
  echo "Options:"
  echo "  -c   セットアップ完了後にワークツリーディレクトリで新しいシェルを起動する"
  exit 1
}

while getopts "c" opt; do
  case "$opt" in
    c) CHANGE_DIR=true ;;
    *) usage ;;
  esac
done
shift $((OPTIND - 1))

if [[ $# -lt 1 ]]; then
  usage
fi

BRANCH_NAME="$1"
DIR_NAME="${2:-$(echo "$BRANCH_NAME" | tr '/' '-')}"
WORKTREE_PATH="$WORKTREES_DIR/$DIR_NAME"

# ----------------------------------------------------------
# 1. ワークツリー作成
# ----------------------------------------------------------
echo "==> ワークツリーを作成: $WORKTREE_PATH (branch: $BRANCH_NAME)"

if [[ -d "$WORKTREE_PATH" ]]; then
  echo "ERROR: ディレクトリが既に存在します: $WORKTREE_PATH"
  exit 1
fi

mkdir -p "$WORKTREES_DIR"

if git -C "$MAIN_ROOT" show-ref --verify --quiet "refs/heads/$BRANCH_NAME" 2>/dev/null; then
  echo "    既存ブランチ '$BRANCH_NAME' を使用"
  git -C "$MAIN_ROOT" worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
else
  echo "    develop から新規ブランチ '$BRANCH_NAME' を作成"
  git -C "$MAIN_ROOT" worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" develop
fi

# ----------------------------------------------------------
# 2. pnpm install
# ----------------------------------------------------------
echo ""
echo "==> pnpm install を実行中..."
(cd "$WORKTREE_PATH" && pnpm install --frozen-lockfile)

# ----------------------------------------------------------
# 3. workspace 依存パッケージのビルド
# ----------------------------------------------------------
echo ""
echo "==> workspace パッケージをビルド中..."
(cd "$WORKTREE_PATH" && pnpm --filter @orisei/react-maplibre build)

# ----------------------------------------------------------
# 4. 環境ファイルのコピー
# ----------------------------------------------------------
echo ""
echo "==> 環境ファイルをコピー中..."

MAIN_WEB="$MAIN_ROOT/apps/web"
WT_WEB="$WORKTREE_PATH/apps/web"

copy_env_files() {
  local pattern="$1"
  local count=0
  for f in $MAIN_WEB/$pattern; do
    [[ -f "$f" ]] || continue
    local basename
    basename="$(basename "$f")"
    cp "$f" "$WT_WEB/$basename"
    echo "    $basename"
    count=$((count + 1))
  done
  echo "    -> ${count} ファイルコピー完了"
}

copy_env_files ".env.*"
copy_env_files ".dev.vars*"

# ----------------------------------------------------------
# 5. .wrangler スナップショットのコピー
# ----------------------------------------------------------
echo ""
echo "==> .wrangler スナップショットをコピー中..."

MAIN_WRANGLER="$MAIN_WEB/.wrangler"
WT_WRANGLER="$WT_WEB/.wrangler"

if [[ -d "$MAIN_WRANGLER/state/v3" ]]; then
  # D1 SQLite ファイル (.sqlite のみ、-wal/-shm は除外)
  MAIN_D1="$MAIN_WRANGLER/state/v3/d1"
  if [[ -d "$MAIN_D1" ]]; then
    WT_D1="$WT_WRANGLER/state/v3/d1"
    mkdir -p "$WT_D1"
    # ディレクトリ構造を再帰的にコピーし、.sqlite のみ含める
    (cd "$MAIN_D1" && find . -name '*.sqlite' -print0 | while IFS= read -r -d '' file; do
      dir="$(dirname "$file")"
      mkdir -p "$WT_D1/$dir"
      cp "$MAIN_D1/$file" "$WT_D1/$file"
    done)
    echo "    D1 (.sqlite) コピー完了"
  fi

  # KV
  MAIN_KV="$MAIN_WRANGLER/state/v3/kv"
  if [[ -d "$MAIN_KV" ]]; then
    WT_KV="$WT_WRANGLER/state/v3/kv"
    mkdir -p "$WT_KV"
    cp -R "$MAIN_KV/." "$WT_KV/"
    echo "    KV コピー完了"
  fi

  # R2
  MAIN_R2="$MAIN_WRANGLER/state/v3/r2"
  if [[ -d "$MAIN_R2" ]]; then
    WT_R2="$WT_WRANGLER/state/v3/r2"
    mkdir -p "$WT_R2"
    cp -R "$MAIN_R2/." "$WT_R2/"
    echo "    R2 コピー完了"
  fi
else
  echo "    WARN: メインの .wrangler/state/v3 が見つかりません。スキップします。"
fi

# ----------------------------------------------------------
# 6. ポート番号の計算
# ----------------------------------------------------------
WORKTREE_COUNT=$(git -C "$MAIN_ROOT" worktree list | wc -l | tr -d ' ')
# メインが 1 番目なので、新しいワークツリーは (count - 1) 番目
WT_INDEX=$((WORKTREE_COUNT - 1))
PORT=$((3045 + WT_INDEX * 10))

# ----------------------------------------------------------
# 7. セットアップ完了サマリー
# ----------------------------------------------------------
echo ""
echo "============================================================"
echo " Worktree セットアップ完了!"
echo "============================================================"
echo ""
echo "  ブランチ:       $BRANCH_NAME"
echo "  ディレクトリ:   $WORKTREE_PATH"
echo "  推奨ポート:     $PORT"
echo ""
echo "  開発サーバーの起動:"
echo "    cd $WORKTREE_PATH"
echo "    PORT=$PORT pnpm dev"
echo ""
echo "  削除する場合:"
echo "    ./scripts/worktree-teardown.sh $DIR_NAME"
echo "============================================================"

# ----------------------------------------------------------
# 8. ワークツリーディレクトリへ移動
# ----------------------------------------------------------
if [[ "$CHANGE_DIR" == true ]]; then
  echo ""
  echo "==> ワークツリーディレクトリで新しいシェルを起動します..."
  echo "    (exit で元のディレクトリに戻ります)"
  cd "$WORKTREE_PATH" && exec "$SHELL"
fi
