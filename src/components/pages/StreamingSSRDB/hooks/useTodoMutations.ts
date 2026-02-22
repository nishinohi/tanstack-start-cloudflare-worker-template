import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

import type { TodoFormData } from './useTodoForm'
import { createTodo, deleteTodo, updateTodo } from '@/routes/demo/start.ssr.streaming-ssr-db'

type UseTodoMutationsOptions = {
  onCreateSuccess?: () => void
  onUpdateSuccess?: (variables: { id: number; title?: string; completed?: boolean }) => void
  onDeleteSuccess?: () => void
}

export function useTodoMutations(options: UseTodoMutationsOptions = {}) {
  const router = useRouter()

  // Mutation: 新規作成
  const createMutation = useMutation({
    mutationFn: (input: { title: string }) => createTodo({ data: input }),
    onSuccess: () => {
      options.onCreateSuccess?.()
      router.invalidate()
    },
    onError: (error) => {
      console.error('Todo作成エラー:', error)
    },
  })

  // Mutation: 更新
  const updateMutation = useMutation({
    mutationFn: (input: { id: number; title?: string; completed?: boolean }) => updateTodo({ data: input }),
    onSuccess: (_, variables) => {
      options.onUpdateSuccess?.(variables)
      router.invalidate()
    },
    onError: (error, variables) => {
      console.error(`Todo更新エラー (id: ${variables.id}):`, error)
    },
  })

  // Mutation: 削除
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo({ data: { id } }),
    onSuccess: () => {
      options.onDeleteSuccess?.()
      router.invalidate()
    },
    onError: (error, id) => {
      console.error(`Todo削除エラー (id: ${id}):`, error)
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const handleCreate = (data: TodoFormData) => {
    createMutation.mutate({ title: data.title })
  }

  const handleUpdate = (id: number, data: TodoFormData) => {
    updateMutation.mutate({ id, title: data.title })
  }

  const handleToggleComplete = (id: number, completed: boolean) => {
    updateMutation.mutate({ id, completed: !completed })
  }

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  return {
    isSubmitting,
    handleCreate,
    handleUpdate,
    handleToggleComplete,
    handleDelete,
  }
}
