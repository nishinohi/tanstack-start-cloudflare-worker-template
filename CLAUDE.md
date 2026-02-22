# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

**TanStack Start** full-stack React framework on **Cloudflare Workers** with:

- TanStack Router (file-based routing) + TanStack Query (server state with SSR)
- React 19, Tailwind CSS v4, Shadcn/ui (New York style, zinc, lucide-react)
- Cloudflare D1 (SQLite) + Drizzle ORM + Better Auth
- React Hook Form + Zod validation
- Vite, Vitest, Lefthook (pre-commit hooks)

## Monorepo Structure

pnpm workspace monorepo with three packages:

- **`apps/web`** — Main TanStack Start application (`web`)
- **`packages/ui`** — Shared React components (`@repo/ui`)
- **`packages/math`** — Shared math utilities (`@repo/math`)

All root-level scripts delegate to packages via `pnpm --filter`. Package imports use workspace references (`@repo/ui`, `@repo/math`).

## Common Commands

All commands are run from the **monorepo root** unless noted.

```bash
pnpm dev                      # Development server (port 3000)
pnpm build                    # Production build
pnpm build:preview            # Preview environment build (local testing with preview DB)
pnpm preview                  # Serve production build (port 4173)
pnpm build:analyze            # Bundle analysis (rollup-plugin-visualizer)
pnpm test                     # Run all tests across packages
pnpm test:watch               # Watch mode (apps/web only: cd apps/web && pnpm test:watch)
pnpm test:coverage            # Coverage report (apps/web only)
pnpm typecheck                # TypeScript type checking across all packages
pnpm lint                     # ESLint across all packages
pnpm check                    # Prettier --write + ESLint --fix

# Shadcn components — must run from apps/web/
cd apps/web && pnpm dlx shadcn@latest add <component-name>

# Database (Drizzle ORM + Cloudflare D1)
pnpm db:generate              # Generate migration files from schema
pnpm db:migrate:local         # Run migrations (local)
pnpm db:migrate:preview       # Run migrations (preview, local with separate DB)
pnpm db:migrate:dev           # Run migrations (develop, remote)
pnpm db:migrate:stg           # Run migrations (staging, remote)
pnpm db:migrate:prod          # Run migrations (production, remote)
pnpm db:view:local            # Open Drizzle Studio (local)
pnpm db:view:preview          # Open Drizzle Studio (preview)
pnpm db:view:dev              # Open Drizzle Studio (develop, remote)
pnpm db:view:stg              # Open Drizzle Studio (staging, remote)
pnpm db:view:prod             # Open Drizzle Studio (production, remote)
pnpm db:drop:local            # Drop all tables (local)
pnpm db:drop:preview          # Drop all tables (preview)
```

## Architecture

### Routing System

Routes are **file-based** in `apps/web/src/routes/`. The route tree is auto-generated in `apps/web/src/routeTree.gen.ts` by `@tanstack/router-plugin`.

- `apps/web/src/routes/__root.tsx`: Root layout wrapping all pages
- `apps/web/src/routes/api/auth/$.ts`: Better Auth API handler (GET/POST)
- Routes define `loader`, `component`, and route-level server `handlers`
- **Demo files** in `apps/web/src/routes/demo/` are examples and can be safely deleted

### Router Setup

The router (`apps/web/src/router.tsx`) creates a `getRouter()` function that:

1. Initializes TanStack Query context via `TanstackQuery.getContext()`
2. Sets up SSR-Query integration via `setupRouterSsrQueryIntegration()`
3. Configures `defaultPreload: 'intent'` for prefetching on hover/focus

The query client is passed through router context (type: `MyRouterContext`).

### Server-Side Singletons

`apps/web/src/lib/server-client.ts` provides cached server-only instances using `createServerOnlyFn`:

- `getDb()` — Returns a cached `DrizzleD1Database` instance (isolate-scoped)
- `getAuth()` — Returns a cached `betterAuth` instance with Google OAuth and KV session storage

These are the **canonical way** to access DB and Auth. Do not call `drizzle(env.DB)` directly.

### Authentication (Better Auth)

- Auth instance: `getAuth()` from `apps/web/src/lib/server-client.ts`
- Auth schema: `apps/web/src/db/schema/auth.ts`
- Auth client: `apps/web/src/lib/auth-client.ts`
- Session storage: Cloudflare KV via `SESSION_KV` binding
- OAuth provider: Google (`CLIENT_ID`, `CLIENT_SECRET` env vars)
- `BASE_URL`: Set per environment in `apps/web/wrangler.jsonc`

### Database Layer (Drizzle ORM + Cloudflare D1)

- **Schema**: `apps/web/src/db/schema/` — Drizzle schema with `$inferSelect` / `$inferInsert` type exports; re-exported from `apps/web/src/db/schema/index.ts`
- **Migrations**: `apps/web/migrations/` — Auto-generated SQL files (committed to git)
- **Config**: `apps/web/src/db/config/drizzle-*.config.ts` — Per-environment configs using `loadD1Credentials()` from `apps/web/src/db/lib/drizzle-config-loader.ts`
- **Access pattern**: Use `getDb()` from `@/lib/server-client`

Each environment has its own D1 database in `apps/web/wrangler.jsonc`:

- `local` / `preview`: Local D1 instances (preview is for local production build testing)
- `develop` / `staging` / `production`: Remote D1 instances

### Styling

- Path alias `@/*` maps to `apps/web/src/*`
- `cn()` utility in `apps/web/src/lib/utils.ts` for Tailwind class merging

## Key Patterns

### Route Definition

```typescript
export const Route = createFileRoute('/path')({
  component: Component,
  loader: async () => {
    /* fetch data */
  },
})
```

### Server Functions with Database

```typescript
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '@/lib/server-client'
import { myTable } from '@/db/schema'

export const getData = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  return await db.select().from(myTable).all()
})
```

### Route-Level API Handlers

For REST endpoints (e.g., auth), use route `server.handlers`:

```typescript
export const Route = createFileRoute('/api/my-endpoint')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => new Response('ok'),
      POST: async ({ request }: { request: Request }) => new Response('ok'),
    },
  },
})
```

## Cloudflare Deployment

**IMPORTANT: Environment Selection with Vite Plugin**

`@cloudflare/vite-plugin` requires `CLOUDFLARE_ENV` environment variable (NOT `--env` flag):

- Correct: `CLOUDFLARE_ENV=local pnpm dev`
- Already configured in package.json scripts

Five environments in `apps/web/wrangler.jsonc`: local, preview, develop, staging, production.

Automatic deployment via GitHub Actions (`.github/workflows/deploy.yml`):

- `main` → production, `staging` → staging, `develop` → develop

Environment variables (`vars` in `wrangler.jsonc`):

- `ENVIRONMENT`: Current environment name
- `BASE_URL`: Application URL (used for auth callbacks)

Cloudflare bindings:

- `DB` (D1 Database): Data persistence
- `SESSION_KV` (KV Namespace): Session management

Secret bindings (set via `.dev.vars`):

- `SESSION_SECRET`: Better Auth secret
- `CLIENT_ID` / `CLIENT_SECRET`: Google OAuth credentials

Local env vars: `.dev.vars` or `.env` (not both; `.dev.vars` takes precedence). Environment-specific: `.dev.vars.local` / `.env.local`.

See [docs/cloudflare-environment-setup.md](./docs/cloudflare-environment-setup.md) for full setup guide.

## Project Structure

```
apps/web/
├── src/
│   ├── components/        # React components (Shadcn/ui in ui/)
│   ├── db/               # Database layer (Drizzle ORM)
│   │   ├── config/       # Per-environment Drizzle configs
│   │   ├── lib/          # drizzle-config-loader.ts
│   │   ├── schema/       # Schema definitions (auth.ts, schema.ts, index.ts)
│   │   └── seed/         # SQL seed/drop files
│   ├── integrations/     # Third-party integrations (tanstack-query/)
│   ├── lib/              # utils.ts, auth-client.ts, server-client.ts
│   ├── routes/           # File-based routes (auto-generates routeTree.gen.ts)
│   ├── router.tsx        # Router initialization
│   ├── test/             # Test setup (setup.ts)
│   └── styles.css        # Global styles (Tailwind CSS)
├── migrations/           # Auto-generated DB migration files
└── wrangler.jsonc        # Cloudflare environments config
packages/
├── ui/                   # @repo/ui — shared React components
└── math/                 # @repo/math — shared utilities
```

## Environment Variables for Database Tools

Drizzle migration/studio commands need environment-specific `.env.*` files in `apps/web/`:

- **Local/Preview** (`.env.local`, `.env.preview`): `D1_LOCAL_URL` pointing to `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`
- **Remote** (`.env.develop`, `.env.staging`, `.env.production`): `CLOUDFLARE_ACCOUNT_ID`, `D1_ID`, `CLOUDFLARE_API_TOKEN`
