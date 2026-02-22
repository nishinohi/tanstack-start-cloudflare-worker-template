# Architecture Patterns

## Project Structure
```
src/
├── components/        # React components (Shadcn/ui in ui/)
│   ├── ui/           # shadcn components
│   ├── atoms/        # Smallest primitives
│   ├── molecules/    # Composed atoms
│   ├── organisms/    # Complex components
│   ├── composites/   # Cross-screen w/ domain logic
│   └── pages/        # Screen implementations
├── db/               # Database layer (Drizzle ORM)
│   ├── config/       # Per-env drizzle configs
│   ├── lib/          # DB utilities
│   ├── schema/       # Schema definitions
│   └── seed/         # Seed files
├── hooks/            # Custom React hooks
├── integrations/     # tanstack-query root provider
├── lib/              # Utilities (utils.ts, auth-client.ts)
├── middleware/       # Server middleware (auth.ts)
├── routes/           # File-based routes (auto-generates routeTree.gen.ts)
├── server/           # Reusable server functions
├── router.tsx        # Router init
├── test/             # Test setup
└── styles.css        # Global styles (Tailwind CSS)
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
- Auth schema: `src/db/schema/auth.ts`
- Session: Cloudflare KV via `SESSION_KV` binding
- BASE_URL: per-env in `wrangler.jsonc`

## Environments
Five environments: local, preview, develop, staging, production
- local/preview: Local D1 instances
- develop/staging/production: Remote D1 instances
- GitHub Actions auto-deploy: main→prod, staging→stg, develop→dev
