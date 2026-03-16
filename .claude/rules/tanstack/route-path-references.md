---
paths: apps/web/src/components/**/*.{ts,tsx}, apps/web/src/routes/**/*.{ts,tsx}, apps/web/src/features/**/*.{ts,tsx}, apps/web/src/middleware/**/*.{ts,tsx}
---

## Route Path References

When a file path needs to be referenced as a string (e.g., for constructing URLs or API base paths), use `Route.to` from the route file created with `createFileRoute` instead of hardcoded string constants.

### Why

- Type-safe: path changes in the route file are automatically reflected at all usage sites
- Single source of truth: no risk of path mismatches between route definitions and their consumers
- No maintenance overhead: avoids keeping separate constant files in sync

### Pattern

**Route file** — defines the path once via `createFileRoute`:

```typescript
// src/routes/api/images.ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/images')({
  component: () => null,
})
```

**Consumer** — imports `Route` and uses `Route.to` to obtain the typed path:

```typescript
// src/lib/url.ts
import { Route as ImagesRoute } from '@/routes/api/images'

export function buildImageUrl(key: string): string {
  return `${ImagesRoute.to}/${key}`
}
```

### Rules

- **Never define path strings as standalone constants** (e.g., `export const IMAGE_API_BASE_PATH = '/api/images'`) when the same path is already expressed as a `createFileRoute` argument.
- **Always import `Route` from the corresponding route file** and access `.to` to derive the path string.
- If a path is needed before a route file exists, create a minimal route file (component can be `() => null`) solely to establish the typed path.
