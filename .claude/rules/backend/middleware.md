---
paths:
  - "apps/web/src/routes/**/*.{ts,tsx}"
  - "apps/web/src/middleware/**/*.{ts,tsx}"
---

## Middleware System

### TanStack Start Middleware (`apps/web/src/middleware/`)

Middleware applied to route loaders and server functions. Defined using `createMiddleware()` from `@tanstack/react-start`.

| File | Export | Purpose |
|---------|------------|------|
| `session.ts` | `sessionMiddleware` | Retrieves session and injects it into the context. Does not throw an error if unauthenticated, returning null instead. |
| `page-guard.ts` | `authPageGuardMiddleware` | Redirects to home if unauthenticated. Used for `beforeLoad` in page routes or SSR server functions. |
