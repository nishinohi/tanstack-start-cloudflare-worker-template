---
paths:
  - 'apps/web/src/routes/**/*.{ts,tsx}'
---

# Route File Conventions

Routes are **file-based** and live in `apps/web/src/routes/`. The route tree is generated into `apps/web/src/routeTree.gen.ts` by `@tanstack/router-plugin` — never edit that file by hand.

- `apps/web/src/routes/__root.tsx` is the root layout wrapping every page. It carries only what is identical on every page (charSet, viewport, favicon, the non-production `noindex`, the fallback title). Never add canonical or hreflang there — see `.claude/rules/frontend/seo.md`.
- API routes use the catchall `$` pattern (e.g. `api/auth.$.ts`, `api/images.$.ts`).
- **Route files must not contain UI implementations.** Define a `RouteComponent` wrapper that reads `Route.useLoaderData()` and delegates rendering to a page component in `src/components/pages/` — see `.claude/rules/frontend/component-structure.md`.
- The property order passed to `createFileRoute` matters for type inference. ESLint enforces it (`@tanstack/router/create-route-property-order`, error) and `eslint --fix` reorders it, so there is nothing to remember here.
- Data loading policy (Router cache first, TanStack Query only when needed) is in `.claude/rules/tanstack/tanstack-router-data-loading.md`.
