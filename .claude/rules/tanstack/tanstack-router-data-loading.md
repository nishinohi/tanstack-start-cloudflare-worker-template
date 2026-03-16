---
paths: apps/web/src/components/**/*.{ts,tsx}, apps/web/src/routes/**/*.{ts,tsx}
---

# TanStack Router Data Loading Implementation Rules

## Basic Principles

**Prioritize Router Cache** for data loading. Consider using TanStack Query only when the following conditions are met:

- Need to share/deduplicate the same data across the entire app
- Need to persist data to browser storage
- Need advanced cache management

---

## Using Router Cache Only

### Data Loading Classification

| Classification | Condition | Implementation |
|----------------|-----------|----------------|
| **Critical** | Essential for rendering main page content | `await` inside `loader` |
| **Deferred** | Takes time to fetch or can be delayed (sidebars, comments, etc.) | Return Promise without `await`, use `use()` + `<Suspense>` in component |

**If uncertain, ask the user to confirm.**

### Cache Parameters

| Parameter | Default | When to Change |
|-----------|---------|----------------|
| `staleTime` | 0 (always refetch) | Data with low update frequency or high fetch cost |
| `gcTime` | 30 minutes | Consider shortening for temporary sensitive data |
| `loaderDeps` | None | **Required** when caching based on URL Search Params |

**If uncertain about values, ask the user to confirm.**

### Implementation Example

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/customer-list')({
  component: RouteComponent,
  loader: async () => {
    // Deferred: no await → use use() + <Suspense> in component
    const customers = getAllCustomers()
    // Critical: await → immediately available
    const fastData = await fetchFastData()
    return { customers, fastData }
  },
})

function RouteComponent() {
  const { customers, fastData } = Route.useLoaderData()
  return <CustomerList customers={customers} fastData={fastData} />
}
```

---

## Using TanStack Query Together

### Role Separation

- **Router**: Coordinator that manages "when" to load
- **TanStack Query**: Handles cache management

### Configuration Requirements

Set `defaultPreloadStaleTime` to `0` to delegate cache management to TanStack Query.

### Data Loading Implementation

| Classification | Method | await | Purpose |
|----------------|--------|-------|---------|
| **Critical** | `queryClient.ensureQueryData()` | **Yes** | Wait for cache to be filled before transition |
| **Deferred** | `queryClient.prefetchQuery()` | **No** | Start fetch in background, complete transition immediately |

### Component Implementation

- **Critical data**: Subscribe to cache with `useSuspenseQuery()`
- **Deferred data**: Wrap with `useSuspenseQuery()` + `<Suspense>` and display fallback

### Implementation Example

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { postQueryOptions, commentsQueryOptions } from '../api/queries'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ context: { queryClient }, params: { postId } }) => {
    // Critical: await to complete loading before transition
    const postPromise = queryClient.ensureQueryData(postQueryOptions(postId))

    // Deferred: no await → start fetch in background
    queryClient.prefetchQuery(commentsQueryOptions(postId))

    await postPromise
  },
  component: PostComponent,
})

function PostComponent() {
  const { postId } = Route.useParams()
  const { data: post } = useSuspenseQuery(postQueryOptions(postId))

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
      <Suspense fallback={<div>Loading comments...</div>}>
        <CommentsSection postId={postId} />
      </Suspense>
    </div>
  )
}

function CommentsSection({ postId }: { postId: string }) {
  const { data: comments } = useSuspenseQuery(commentsQueryOptions(postId))
  return (
    <ul>
      {comments.map((comment) => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  )
}
```

---

## Decision Flowchart

1. **Is TanStack Query needed?**
   - Data sharing/persistence/advanced cache management required → Use Query together
   - Not required → Router Cache only

2. **Is the data Critical or Deferred?**
   - Essential for main content → Critical (`await`)
   - Can be delayed → Deferred (no `await` + `<Suspense>`)
   - Uncertain → **Ask the user**

3. **Cache parameter settings**
   - Set `staleTime` considering update frequency and fetch cost
   - Shorten `gcTime` for sensitive data
   - Uncertain → **Ask the user**
