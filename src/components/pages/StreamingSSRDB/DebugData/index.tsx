import { use } from 'react'

import type { Todo } from '@/db/schema/schema'

type Props = {
  promise: Promise<Todo[]>
}

export default function DebugData({ promise }: Props) {
  const data = use(promise)
  return <pre className="overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
}
