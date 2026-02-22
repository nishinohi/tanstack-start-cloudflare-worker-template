import { render } from '@testing-library/react'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import * as TanstackQuery from '../integrations/tanstack-query/root-provider'
import type { QueryClient } from '@tanstack/react-query'
import type { RenderOptions } from '@testing-library/react'

interface MyRouterContext {
  queryClient: QueryClient
}

// Create test router with generated route tree
export function createTestRouterFromFiles(initialLocation = '/') {
  const { queryClient } = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialLocation],
    }),
    context: {
      queryClient,
    },
  })

  return router
}

// Custom render function for file-based routes
interface RenderWithFileRoutesOptions extends Omit<RenderOptions, 'wrapper'> {
  initialLocation?: string
  routerContext?: Partial<MyRouterContext>
}

export function renderWithFileRoutes(options: RenderWithFileRoutesOptions = {}) {
  const { initialLocation = '/', routerContext = {}, ...renderOptions } = options
  const { queryClient } = TanstackQuery.getContext()

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [initialLocation],
    }),
    context: {
      queryClient,
      ...routerContext,
    },
  })

  // RouterProvider は children を受け取らないため、直接レンダリング
  const result = render(<RouterProvider router={router} />, renderOptions)

  return {
    ...result,
    router,
  }
}

// Helper to test specific file routes
export function createMockFileRoute(path: string, component: React.ComponentType) {
  return {
    path,
    component,
  }
}
