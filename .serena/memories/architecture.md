# Architecture Patterns

## Project Structure (Monorepo)
```
/
├── apps/
│   └── web/            # TanStack Start + Cloudflare Worker アプリ
│       ├── src/
│       │   ├── components/   # React コンポーネント (Shadcn/ui は ui/)
│       │   ├── db/           # Drizzle ORM レイヤー
│       │   ├── hooks/        # カスタム React フック
│       │   ├── integrations/ # tanstack-query root provider
│       │   ├── lib/          # ユーティリティ (utils.ts, auth-client.ts)
│       │   ├── middleware/   # サーバーミドルウェア (auth.ts)
│       │   ├── routes/       # ファイルベースルート (routeTree.gen.ts を自動生成)
│       │   ├── server/       # サーバー関数
│       │   ├── router.tsx    # ルーター初期化
│       │   ├── test/         # テストセットアップ
│       │   └── styles.css    # グローバルスタイル (Tailwind CSS)
│       ├── wrangler.jsonc
│       ├── vite.config.ts
│       ├── vitest.config.ts
│       ├── tsconfig.json    # extends ../../tsconfig.base.json
│       └── package.json     # name: "web"
├── packages/
│   ├── math/           # 共有数学ライブラリ (@repo/math)
│   │   └── src/index.ts  # add() 関数
│   └── ui/             # 共有 React コンポーネント (@repo/ui)
│       └── src/components/counter.tsx  # Counter コンポーネント
├── pnpm-workspace.yaml
├── tsconfig.base.json  # 共有 TypeScript 設定
├── package.json        # ワークスペースルート
└── .npmrc              # public-hoist-pattern for vitest/@vitest/*
```

## Monorepo 設定
- pnpm workspace で apps/* と packages/* を管理
- `tsconfig.base.json` で共通 TypeScript 設定を管理
- 各パッケージの `tsconfig.json` は `../../tsconfig.base.json` を extend
- `.npmrc`: `public-hoist-pattern[]=vitest` (jest-dom のため必須)
- packages の `exports` は TypeScript ソース直接指定 (`"./src/index.ts"`)

## コマンド (ルートから実行)
```bash
pnpm dev           # pnpm --filter web dev と同じ
pnpm build         # pnpm --filter web build と同じ
pnpm test          # 全パッケージのテスト (pnpm -r test)
pnpm typecheck     # 全パッケージの型チェック (pnpm -r typecheck)
pnpm --filter @repo/math test   # 特定パッケージのテスト
pnpm --filter @repo/ui test
```

## Route Definition Pattern
```typescript
export const Route = createFileRoute('/path')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    // fetch data
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <PageComponent {...data} />
}
```

## Server Function Pattern
```typescript
import { createServerFn } from '@tanstack/react-start'
import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'

export const getData = createServerFn({ method: 'GET' }).handler(async () => {
  const db = drizzle(env.DB)
  return await db.select().from(myTable).all()
})
```

## TanStack Query Data Loading
- Router Cache FIRST (default)
- TanStack Query when: sharing data app-wide, persisting to storage, advanced cache
- Critical data: `await ensureQueryData()` in loader
- Deferred data: `prefetchQuery()` (no await) + `<Suspense>` in component

## Authentication (Better Auth)
- Config: `auth.ts` (project root) - schema generation only
- Auth schema: `apps/web/src/db/schema/auth.ts`
- Session: Cloudflare KV via `SESSION_KV` binding
- BASE_URL: per-env in `apps/web/wrangler.jsonc`

## Environments
Five environments: local, preview, develop, staging, production
- local/preview: Local D1 instances
- develop/staging/production: Remote D1 instances
- GitHub Actions auto-deploy: main→prod, staging→stg, develop→dev
