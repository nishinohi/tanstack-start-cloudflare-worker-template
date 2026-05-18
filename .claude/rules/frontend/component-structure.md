---
paths:
  - "apps/web/src/components/**/*.{ts,tsx}"
  - "apps/web/src/routes/**/*.{ts,tsx}"
---

## Directory Structure

```txt
src
├── routes
│   └── [File-Based Routing]
└── components
    ├── icons
    ├── atoms
    ├── molecules
    ├── organisms
    ├── composites
    ├── pages
    └── ui
```

## routes

Place TanStack Router's File-Based Routing files in `routes`.
Only implement server-side functionality such as `createFileRoute` and `createServerFn`; do not implement UI components.

Use a `RouteComponent` wrapper function to:

1. Call `Route.useLoaderData()` to get loader data
2. Pass the data as props to the page component from `src/components/pages`

### Example for src/routes/demo.customer-list.tsx path

```typescript
// src/routes/demo.customer-list.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import CustomerList from '@/components/pages/CustomerList'
import { queryAllCustomers } from '@/features/customer/queries'

const getAllCustomers = createServerFn({ method: 'GET' }).handler(async () => {
  return queryAllCustomers()
})

export const Route = createFileRoute('/demo/customer-list')({
  component: RouteComponent,
  loader: async () => {
    const customers = await getAllCustomers()
    return { customers }
  },
})

function RouteComponent() {
  const { customers } = Route.useLoaderData()
  return <CustomerList customers={customers} />
}
```

```typescript
// src/components/pages/CustomerList/index.tsx
type Props = {
  customers: Array<{ id: number; name: string }>
}

export default function CustomerList({ customers }: Props) {
  return (
    <ul>
      {customers.map((customer) => (
        <li key={customer.id}>{customer.name}</li>
      ))}
    </ul>
  )
}
```

## pages

Screen implementations within `pages` follow the structure below. Place all screen-dependent components in `pages/[PageName]`.
All components include UI, hooks, style, and test implementations within their named directory.

```txt
pages
└── [PageName]               ## Corresponds to the routes file name
     ├── index.tsx               ## Screen implementation
     ├── index.test.tsx          ## Screen unit tests
     ├── const.ts                ## Shared constants (optional)
     ├── queryKeys.ts            ## Shared TanStack Query keys (optional, only for Query integration)
     ├── styles.module.css       ## Screen styling (optional)
     ├── hooks                   ## Screen hooks (optional)
     │   ├── [hookName].ts
     │   └── [hookName].ts
     └── [ComponentName]         ## Screen-dependent components (may have multiple)
         ├── index.tsx           ## Screen-dependent component implementation
         ├── index.test.tsx      ## Screen-dependent component unit tests
         ├── const.ts            ## Shared constants (optional)
         ├── styles.module.css   ## Screen-dependent component styling (optional)
         └── hooks               ## Screen-dependent component hooks (optional)
             └── [hookName].ts   ## Screen-dependent component hooks implementation (optional)
```

## atoms, molecules, organisms

Place only components that do not contain screen-dependent logic.

```txt
[atoms, molecules, organisms]
 └── [ComponentName]
      ├── index.tsx           ## Component implementation
      ├── index.test.tsx      ## Component unit tests
      ├── const.ts            ## Shared constants (optional)
      ├── styles.module.css   ## Component styling (optional)
      └── hooks               ## Component hooks (optional)
          └── [hookName].ts   ## Component hooks implementation (optional)
```

## ui

- Location for shadcn/ui components
- Component tests are not required

## composites

Place components that contain screen-dependent implementations but are used across multiple screens in `composites`. Name them so that the dependent screens or features are clearly identifiable.

```txt
composites
└── [ComponentName]
     ├── index.tsx           ## Component implementation
     ├── index.test.tsx      ## Component unit tests
     ├── const.ts            ## Shared constants (optional)
     ├── styles.module.css   ## Component styling (optional)
     └── hooks               ## Component hooks (optional)
         └── [hookName].ts   ## Component hooks implementation (optional)
```

## Shared Query Keys (TanStack Query integration)

When SSR data loading requires TanStack Query integration (i.e., Router's built-in data loading alone is insufficient), create a `queryKeys.ts` file in `pages/[PageName]/` to define shared query keys.

- This file is **only** for cases where TanStack Query is used alongside TanStack Router's loader (e.g., `prefetchQuery` or `ensureQueryData` in loader + `useQuery` in component)
- If Router's built-in cache (`loader` + `useLoaderData`) is sufficient, do **not** create this file

```txt
pages
└── [PageName]
     ├── queryKeys.ts            ## Shared TanStack Query keys (optional, only for Query integration)
     ├── index.tsx
     └── ...
```

```typescript
// src/components/pages/Home/queryKeys.ts
export const queryKeys = {
  userSpots: ['user-spots'] as const,
} as const
```

## Shared Constants

Create `const.ts` when sharing constants across multiple files within a component directory or across multiple locations within the same component.

> **i18n Note:** All user-facing text (labels, messages, placeholders, error messages, etc.) must be placed in `apps/web/messages/ja.json` and `en.json`, not in `const.ts`. As a result, `const.ts` is primarily for non-string constants such as numeric limits, enums, and configuration values.

### What to include in `const.ts`

- Non-string constants shared across multiple files within a component directory
  - Examples: numeric limits, timeout values, enum-like objects, configuration objects
- Constants referenced in multiple locations within the same component (e.g., `index.tsx` and hooks, or parent and child components)

### What NOT to include in `const.ts`

- User-facing text strings (labels, messages, placeholders, error messages) → use `apps/web/messages/*.json` with Paraglide i18n
- Constants used in only one file should be defined directly in that file
- One-off magic numbers or strings should be defined at the top of the component file where used and not exported

## Component Props Type Naming

- Use `type` for component props type definitions and name them `Props`
- Sub-components within the same file do not need to follow this rule

```typescript
// src/components/pages/CustomerList/index.tsx

// 🆗 Correct
type Props = {
    message: string
}

// 🆖 Incorrect
// Do not use [ComponentName]Props
// However, if there are components other than the screen component within a single file,
// the props type name for those components may be [ComponentName]Props
type CustomerListProps = {
    message: string
}

export default function CustomerList({message}: Props) {
     return (<div>CustomerList</div>)
}
```
