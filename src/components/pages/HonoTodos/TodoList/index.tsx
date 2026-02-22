import type { UseFormReturn } from 'react-hook-form'

import type { TodoResponse } from '../hooks/useTodoApi'
import type { TodoFormData } from '../hooks/useTodoForm'

type Props = {
  todos: TodoResponse[]
  editingId: number | null
  isSubmitting: boolean
  editForm: UseFormReturn<TodoFormData>
  onToggleComplete: (id: number, completed: boolean) => void
  onUpdate: (id: number, data: TodoFormData) => void
  onDelete: (id: number) => void
  onStartEdit: (id: number, title: string) => void
  onCancelEdit: () => void
}

export default function TodoList({
  todos,
  editingId,
  isSubmitting,
  editForm,
  onToggleComplete,
  onUpdate,
  onDelete,
  onStartEdit,
  onCancelEdit,
}: Props) {
  if (todos.length === 0) {
    return <p className="py-8 text-center text-gray-500">Todoがありません。上のフォームから作成してください。</p>
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id, todo.completed)}
            disabled={isSubmitting}
            className="h-5 w-5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />

          {editingId === todo.id ? (
            <div className="flex-1">
              <input
                type="text"
                {...editForm.register('title')}
                disabled={isSubmitting}
                className="w-full rounded border border-gray-300 px-3 py-1 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
              />
              {editForm.formState.errors.title && (
                <p className="mt-1 text-xs text-red-500">{editForm.formState.errors.title.message}</p>
              )}
            </div>
          ) : (
            <span className={`flex-1 ${todo.completed ? 'text-gray-400 line-through' : ''}`}>{todo.title}</span>
          )}

          <div className="flex gap-2">
            {editingId === todo.id ? (
              <>
                <button
                  onClick={editForm.handleSubmit((data) => onUpdate(todo.id, data))}
                  disabled={isSubmitting}
                  className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600 disabled:bg-gray-300"
                >
                  保存
                </button>
                <button
                  onClick={onCancelEdit}
                  disabled={isSubmitting}
                  className="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600 disabled:bg-gray-300"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onStartEdit(todo.id, todo.title)}
                  disabled={isSubmitting}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:bg-gray-300"
                >
                  編集
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  disabled={isSubmitting}
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 disabled:bg-gray-300"
                >
                  削除
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TodoListLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="h-5 w-5 rounded bg-gray-200"></div>
          <div className="h-4 flex-1 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded bg-gray-200"></div>
            <div className="h-8 w-16 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
      <div className="mt-4 text-center text-sm text-gray-400">Todoリストを読み込み中...</div>
    </div>
  )
}
