# Code Style & Conventions

## Prettier Config
- Single quotes (`'`)
- No semicolons
- 2-space indentation
- 120 char line width
- Plugins: prettier-plugin-tailwindcss

## TypeScript
- Props type named `Props` (not `ComponentNameProps`)
- Use `type` for component props
- `$inferSelect` / `$inferInsert` for Drizzle types

## Tailwind CSS Rules
- **NEVER use numeric colors**: `bg-gray-100`, `text-red-500` → FORBIDDEN
- Use semantic colors from `src/styles.css`: `bg-muted`, `text-destructive`, etc.
- Exception: `white`, `black`, `transparent`, `current`, `inherit` allowed
- Color pairs: `bg-primary` / `text-primary-foreground`

## React Component Structure
```
src/components/
├── ui/          # shadcn/ui components (no tests required)
├── atoms/       # Smallest UI primitives
├── molecules/   # Composed atoms
├── organisms/   # Complex components
├── composites/  # Cross-screen with domain logic
├── pages/       # Screen implementations
│   └── [PageName]/
│       ├── index.tsx
│       ├── index.test.tsx
│       ├── const.ts      (optional)
│       └── hooks/
└── icons/
```

## Routes Structure
- Route files ONLY contain `createFileRoute`, `createServerFn`, loader
- UI goes in `src/components/pages/[PageName]/index.tsx`
- Use `RouteComponent` wrapper to pass loader data as props

## Immutability
- NEVER mutate objects/arrays
- Always create new objects with spread operator

## File Size
- Typical: 200-400 lines
- Maximum: 800 lines
- Extract utilities when files get large

## Error Display
- Form validation → `<FormMessage>` (inline)
- API/server errors → `toast.error()` (toast)

## useCallback Rules
- Default: DON'T use it
- Only use when passing to `React.memo` child OR in hook dependency array
- Prefer updater functions: `setCount(c => c + 1)`

## Route Path References
- Use `Route.to` from route file (NOT hardcoded strings)
- Import Route and access `.to` for type-safe paths

## Server Functions
- Screen-specific: define inline in route file
- Reusable: place in `src/features/<domain>/server.ts`
