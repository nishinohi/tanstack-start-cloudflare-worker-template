import type { UseFormReturn } from 'react-hook-form'

import type { TodoFormData } from '../hooks/useTodoForm'

type Props = {
  form: UseFormReturn<TodoFormData>
  onSubmit: (data: TodoFormData) => void
  isSubmitting: boolean
}

export default function TodoForm({ form, onSubmit, isSubmitting }: Props) {
  return (
    <div className="mb-8 rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">新しいTodoを作成</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            {...form.register('title')}
            placeholder="Todoのタイトルを入力..."
            className="flex-1 rounded border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? '作成中...' : '作成'}
          </button>
        </div>
        {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
      </form>
    </div>
  )
}
