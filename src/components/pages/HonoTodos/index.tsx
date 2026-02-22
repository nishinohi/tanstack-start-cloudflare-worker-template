import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useTodoForm } from './hooks/useTodoForm'
import { TODOS_QUERY_KEY, useTodoMutations } from './hooks/useTodoMutations'
import { fetchTodos } from './hooks/useTodoApi'
import TodoForm from './TodoForm'
import TodoList, { TodoListLoadingSkeleton } from './TodoList'

export default function HonoTodos() {
  const [editingId, setEditingId] = useState<number | null>(null)

  const {
    data: todos,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [...TODOS_QUERY_KEY],
    queryFn: fetchTodos,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })

  const createForm = useTodoForm()
  const editForm = useTodoForm()

  const { isSubmitting, handleCreate, handleUpdate, handleToggleComplete, handleDelete } = useTodoMutations({
    onCreateSuccess: () => {
      createForm.reset()
    },
    onUpdateSuccess: (variables) => {
      if (variables.title !== undefined) {
        setEditingId(null)
        editForm.reset()
      }
    },
  })

  const startEdit = (id: number, title: string) => {
    setEditingId(id)
    editForm.reset({ title })
  }

  const cancelEdit = () => {
    setEditingId(null)
    editForm.reset()
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Hono Todos API Demo</h1>
      <p className="mb-4 text-gray-600">
        Hono REST API (<code className="rounded bg-gray-100 px-1">/api/todos</code>) を{' '}
        <code className="rounded bg-gray-100 px-1">fetch()</code> + TanStack Query で操作する CRUD デモです。
      </p>

      <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Server Functions との違い</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            データ取得に <code className="rounded bg-white px-1">createServerFn</code> ではなく{' '}
            <code className="rounded bg-white px-1">fetch(&apos;/api/todos&apos;)</code> を使用
          </li>
          <li>REST API (GET/POST/PATCH/DELETE) を Hono で実装</li>
          <li>クライアントサイドフェッチ + TanStack Query でキャッシュ管理</li>
        </ul>
      </div>

      <TodoForm form={createForm} onSubmit={handleCreate} isSubmitting={isSubmitting} />

      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Todoリスト</h2>
          <div className="flex items-center gap-2">
            {isFetching && <span className="text-sm text-blue-500">更新中...</span>}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:bg-gray-300"
            >
              再取得
            </button>
          </div>
        </div>

        {isLoading && <TodoListLoadingSkeleton />}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-600">データの取得に失敗しました</p>
            <p className="mt-1 text-sm text-red-500">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        )}

        {todos && (
          <TodoList
            todos={todos}
            editingId={editingId}
            isSubmitting={isSubmitting}
            editForm={editForm}
            onToggleComplete={handleToggleComplete}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
          />
        )}
      </div>
    </div>
  )
}
