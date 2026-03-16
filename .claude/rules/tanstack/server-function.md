---
paths: apps/web/src/features/**/*.{ts,tsx}, apps/web/src/routes/**/*.{ts,tsx}, apps/web/src/lib/**/*.{ts,tsx}
---

## Server Function

Server functions are created using `createServerFn()` from `@tanstack/react-start`.

- They can be called from client components
- Used in route loaders for SSR data fetching
- Placement rules
  - Screen-specific server functions
    - Define inline in the corresponding route file under `src/routes/`
  - Reusable screen-independent server functions
    - Place in `src/features/<domain>/server.ts` (e.g., `src/features/images/server.ts`)
