import { createFileRoute } from '@tanstack/react-router'

import HonoTodos from '@/components/pages/HonoTodos'

export const Route = createFileRoute('/demo/hono-todos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <HonoTodos />
}
