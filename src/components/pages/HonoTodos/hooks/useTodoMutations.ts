import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTodo, deleteTodo, updateTodo } from './useTodoApi'
import type { TodoFormData } from './useTodoForm'

const TODOS_QUERY_KEY = ['hono-todos'] as const

type UseTodoMutationsOptions = {
  onCreateSuccess?: () => void
  onUpdateSuccess?: (variables: { id: number; title?: string; completed?: boolean }) => void
  onDeleteSuccess?: () => void
}

export function useTodoMutations(options: UseTodoMutationsOptions = {}) {
  const queryClient = useQueryClient()

  const invalidateTodos = () => {
    queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY })
  }

  const createMutation = useMutation({
    mutationFn: (input: { title: string }) => createTodo(input),
    onSuccess: () => {
      invalidateTodos()
      options.onCreateSuccess?.()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; title?: string; completed?: boolean }) => updateTodo(input.id, input),
    onSuccess: (_, variables) => {
      invalidateTodos()
      options.onUpdateSuccess?.(variables)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      invalidateTodos()
      options.onDeleteSuccess?.()
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

export { TODOS_QUERY_KEY }
