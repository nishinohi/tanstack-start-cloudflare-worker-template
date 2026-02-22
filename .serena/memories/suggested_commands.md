# Development Commands

## Package Manager
- `pnpm` (v10.27.0) - NOT npm or yarn

## Development
```bash
pnpm dev              # Dev server (port 3000, CLOUDFLARE_ENV=local)
pnpm build            # Production build
pnpm build:preview    # Preview build (local testing)
pnpm preview          # Serve production build (port 4173)
```

## Type Checking & Linting
```bash
pnpm typecheck        # TypeScript type check (tsc --noEmit)
pnpm lint             # ESLint
pnpm check            # Prettier --write + ESLint --fix (both)
```

## Testing
```bash
pnpm test                              # Run all tests (vitest run)
pnpm test src/path/to/test.test.ts    # Run specific test
pnpm test -t "pattern"                # Run tests matching pattern
pnpm vitest                           # Watch mode
pnpm test:coverage                    # Coverage report
pnpm test:ui                          # Vitest UI
```

## Database
```bash
pnpm db:generate          # Generate migrations from schema
pnpm db:migrate:local     # Run migrations (local)
pnpm db:migrate:preview   # Run migrations (preview)
pnpm db:migrate:dev       # Run migrations (develop, remote)
pnpm db:migrate:stg       # Run migrations (staging, remote)
pnpm db:migrate:prod      # Run migrations (production, remote)
pnpm db:view:local        # Drizzle Studio (local)
```

## Shadcn/ui
```bash
pnpm dlx shadcn@latest add <component-name>   # Add component
```

## Cloudflare Types
```bash
pnpm typegen:cf    # Generate Cloudflare worker types
```

## Environment Note
- IMPORTANT: Use `CLOUDFLARE_ENV` env var (NOT `--env` flag)
- Scripts in package.json already configured correctly
