import { hc } from 'hono/client'
import type { InferResponseType } from 'hono/client'

import type { AppType } from '@/routes/api/todos/$'

const client = hc<AppType>('/')

export type TodoResponse = InferResponseType<typeof client.api.todos.$get>[number]

export async function fetchTodos() {
  const res = await client.api.todos.$get()
  if (!res.ok) throw new Error('Failed to fetch todos')
  return res.json()
}

export async function createTodo(input: { title: string }) {
  const res = await client.api.todos.$post({
    json: input,
  })
  return res.json()
}

export async function updateTodo(id: number, input: { title?: string; completed?: boolean }) {
  const res = await client.api.todos[':id'].$patch({
    param: { id: id.toString() },
    json: input,
  })
  if (!res.ok) throw new Error('Failed to update todo')
  return res.json()
}

export async function deleteTodo(id: number) {
  const res = await client.api.todos[':id'].$delete({
    param: { id: id.toString() },
  })
  if (!res.ok) throw new Error('Failed to delete todo')
}
