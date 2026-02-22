import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Zod スキーマ定義
export const todoFormSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(100, 'タイトルは100文字以内で入力してください'),
})

export type TodoFormData = z.infer<typeof todoFormSchema>

export function useTodoForm(defaultValues?: Partial<TodoFormData>) {
  return useForm<TodoFormData>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
      ...defaultValues,
    },
  })
}
