import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import DebugData from './DebugData'
import { useTodoForm } from './hooks/useTodoForm'
import { useTodoMutations } from './hooks/useTodoMutations'
import RecentActivity, { RecentActivityLoadingSkeleton } from './RecentActivity'
import StreamingErrorFallback from './StreamingErrorFallback'
import TodoForm from './TodoForm'
import TodoList, { TodoListLoadingSkeleton } from './TodoList'
import TodoStats, { TodoStatsLoadingSkeleton } from './TodoStats'
import type { LoaderData } from './types'

type Props = {
  loaderData: LoaderData
}

export default function StreamingSSRDB({ loaderData }: Props) {
  const { todoList, stats, recentActivity } = loaderData
  const [editingId, setEditingId] = useState<number | null>(null)

  // フォーム
  const createForm = useTodoForm()
  const editForm = useTodoForm()

  // ミューテーション
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
      <h1 className="mb-2 text-3xl font-bold">⚡ Streaming SSR DB - CRUD Operations</h1>
      <p className="mb-8 text-gray-600">
        このページはストリーミングSSRを使用しています。Todoリストは即座に表示され、統計情報と更新履歴は非同期でストリーミングされます。
      </p>

      {/* 新規作成フォーム - クリティカル */}
      <TodoForm form={createForm} onSubmit={handleCreate} isSubmitting={isSubmitting} />

      {/* Todoリスト - ストリーミング */}
      <div className="mb-8 space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <span>Todoリスト</span>
        </h2>
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <StreamingErrorFallback error={error} reset={resetErrorBoundary} title="Todoリスト" />
          )}
        >
          <Suspense fallback={<TodoListLoadingSkeleton />}>
            <TodoList
              promise={todoList}
              editingId={editingId}
              isSubmitting={isSubmitting}
              editForm={editForm}
              onToggleComplete={handleToggleComplete}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* 統計情報 - ストリーミング */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <span>📊 統計情報</span>
        </h2>
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <StreamingErrorFallback error={error} reset={resetErrorBoundary} title="統計情報" />
          )}
        >
          <Suspense fallback={<TodoStatsLoadingSkeleton />}>
            <TodoStats promise={stats} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* 最近の更新履歴 - ストリーミング */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <span>📜 最近の更新履歴</span>
        </h2>
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <StreamingErrorFallback error={error} reset={resetErrorBoundary} title="更新履歴" />
          )}
        >
          <Suspense fallback={<RecentActivityLoadingSkeleton />}>
            <RecentActivity promise={recentActivity} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* デバッグ情報 */}
      <div className="mt-8 rounded-lg border border-gray-300 bg-gray-50 p-4">
        <h3 className="mb-2 font-semibold">データベース情報（ストリーミングデータ）</h3>
        <ErrorBoundary fallback={<div className="text-red-500">データの読み込みに失敗しました</div>}>
          <Suspense fallback={<div className="text-gray-400">読み込み中...</div>}>
            <DebugData promise={todoList} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
