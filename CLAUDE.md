# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technology Stack

**TanStack Start** full-stack React framework on **Cloudflare Workers** with:

- TanStack Router (file-based routing) + TanStack Query (server state with SSR)
- React 19, Tailwind CSS v4, Shadcn/ui (New York style, zinc, lucide-react)
- Cloudflare D1 (SQLite) + Drizzle ORM + Better Auth
- React Hook Form + Zod validation
- Vite, Vitest, Lefthook (pre-commit hooks)

## Common Commands

```bash
pnpm dev                      # Development server (port 3000)
pnpm build                    # Production build
pnpm build:preview            # Preview environment build (local testing with preview DB)
pnpm preview                  # Serve production build (port 4173)
pnpm test                     # Run tests (Vitest)
pnpm test src/path/to/test.test.ts  # Run specific test file
pnpm test -t "pattern"        # Run tests matching pattern
pnpm vitest                   # Watch mode
pnpm typecheck                # TypeScript type checking
pnpm lint                     # ESLint
pnpm check                    # Prettier --write + ESLint --fix
pnpm dlx shadcn@latest add <component-name>  # Add Shadcn components

# Database (Drizzle ORM + Cloudflare D1)
pnpm db:generate              # Generate migration files from schema
pnpm db:migrate:local         # Run migrations (local)
pnpm db:migrate:preview       # Run migrations (preview, local with separate DB)
pnpm db:migrate:dev           # Run migrations (develop, remote)
pnpm db:migrate:stg           # Run migrations (staging, remote)
pnpm db:migrate:prod          # Run migrations (production, remote)
pnpm db:view:local            # Open Drizzle Studio (local)
```

## Architecture

### Routing System

Routes are **file-based** in `src/routes/`. The route tree is auto-generated in `src/routeTree.gen.ts` by `@tanstack/router-plugin`.

- `src/routes/__root.tsx`: Root layout wrapping all pages
- Routes define `loader`, `component`, and other route options
- **Demo files** in `src/routes/demo/` are examples and can be safely deleted

### Router Setup

The router (`src/router.tsx`) creates a `getRouter()` function that:

1. Initializes TanStack Query context via `TanstackQuery.getContext()`
2. Sets up SSR-Query integration via `setupRouterSsrQueryIntegration()`
3. Configures `defaultPreload: 'intent'` for prefetching on hover/focus

The query client is passed through router context (type: `MyRouterContext`).

### Server Functions

Created using `createServerFn()` from `@tanstack/react-start`. Database operations go in `src/server/` directory. They can be called from client components and used in route loaders for SSR data fetching.

### Authentication (Better Auth)

- Config file: `auth.ts` (project root) - for schema generation only, no DB instance needed
- Auth schema: `src/db/schema/auth.ts`
- Session storage: Cloudflare KV via `SESSION_KV` binding
- BASE_URL: Set per environment in `wrangler.jsonc`, used for auth callbacks

### Database Layer (Drizzle ORM + Cloudflare D1)

- **Schema**: `src/db/schema/` - Drizzle schema with `$inferSelect` / `$inferInsert` type exports
- **Migrations**: `migrations/` - Auto-generated SQL files (committed to git)
- **Config**: `src/db/config/drizzle-*.config.ts` - Per-environment configs using `loadD1Credentials()` from `src/db/lib/drizzle-config-loader.ts`
- **Access pattern**: `drizzle(env.DB)` where `env` is imported from `cloudflare:workers`

Each environment has its own D1 database in `wrangler.jsonc`:

- `local` / `preview`: Local D1 instances (preview is for local production build testing)
- `develop` / `staging` / `production`: Remote D1 instances

### Styling

- Path alias `@/*` maps to `./src/*`
- `cn()` utility in `src/lib/utils.ts` for Tailwind class merging

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
import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import { createServerFn } from '@tanstack/react-start'
import { myTable } from '@/db/schema/schema'

export const getData = createServerFn({ method: 'GET' }).handler(async () => {
  const db = drizzle(env.DB)
  return await db.select().from(myTable).all()
})
```

## Cloudflare Deployment

**IMPORTANT: Environment Selection with Vite Plugin**

`@cloudflare/vite-plugin` requires `CLOUDFLARE_ENV` environment variable (NOT `--env` flag):

- Correct: `CLOUDFLARE_ENV=local pnpm dev`
- Already configured in package.json scripts

Five environments in `wrangler.jsonc`: local, preview, develop, staging, production.

Automatic deployment via GitHub Actions (`.github/workflows/deploy.yml`):

- `main` → production, `staging` → staging, `develop` → develop

Environment variables (`vars` in `wrangler.jsonc`):

- `ENVIRONMENT`: Current environment name
- `BASE_URL`: Application URL (used for auth callbacks)

Cloudflare bindings:

- `DB` (D1 Database): Data persistence
- `SESSION_KV` (KV Namespace): Session management

Local env vars: `.dev.vars` or `.env` (not both; `.dev.vars` takes precedence). Environment-specific: `.dev.vars.local` / `.env.local`.

See [docs/cloudflare-environment-setup.md](./docs/cloudflare-environment-setup.md) for full setup guide.

## Project Structure

```
src/
├── components/        # React components (Shadcn/ui in ui/)
├── db/               # Database layer (Drizzle ORM)
│   ├── config/       # Per-environment Drizzle configs
│   ├── lib/          # Database utilities (credential loader)
│   ├── schema/       # Schema definitions
│   └── seed/         # Seed files
├── hooks/            # Custom React hooks
├── integrations/     # Third-party integrations (tanstack-query/)
├── lib/              # Utilities (utils.ts, auth-client.ts)
├── middleware/       # Server middleware (auth.ts)
├── routes/           # File-based routes (auto-generates routeTree.gen.ts)
├── server/           # Server functions for DB operations
├── router.tsx        # Router initialization
├── test/             # Test setup (setup.ts)
└── styles.css        # Global styles (Tailwind CSS)
migrations/           # Auto-generated DB migration files
```

## Environment Variables for Database Tools

Drizzle migration/studio commands need environment-specific `.env.*` files:

- **Local/Preview** (`.env.local`, `.env.preview`): `D1_LOCAL_URL` pointing to `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`
- **Remote** (`.env.develop`, `.env.staging`, `.env.production`): `CLOUDFLARE_ACCOUNT_ID`, `D1_ID`, `CLOUDFLARE_API_TOKEN`
