import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import type { NewTodo } from '@/db/schema/schema'
import StreamingSSRDB from '@/components/pages/StreamingSSRDB'
import { todos } from '@/db/schema/schema'
import { getDb } from '@/lib/server-client'
import { authMiddleware } from '@/middleware/auth'

// Server function用のZodスキーマ
const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  completed: z.boolean().optional(),
})

const updateTodoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
})

const deleteTodoSchema = z.object({
  id: z.number().int().positive(),
})

export const Route = createFileRoute('/demo/start/ssr/streaming-ssr-db')({
  component: RouteComponent,
  loader: () => {
    // awaitしないPromiseを返すだけで自動的にストリーミングされる
    const todoList = getAllTodos()
    const stats = getTodoStats()
    const recentActivity = getRecentActivity()

    return { todoList, stats, recentActivity }
  },
  server: {
    middleware: [authMiddleware],
  },
  gcTime: 0,
  errorComponent: () => <div className="bg-green-400 text-2xl font-bold">this is error</div>,
})

function RouteComponent() {
  const loaderData = Route.useLoaderData()
  return <StreamingSSRDB loaderData={loaderData} />
}

// すべてのTodoを取得（ストリーミング対象 - 遅延あり）
export const getAllTodos = createServerFn({ method: 'GET' }).handler(async () => {
  if (Math.random() < 0.5) throw new Error('todo error')
  // 遅延シミュレーション: ストリーミングの効果を可視化
  const db = getDb()
  const allTodos = await db.select().from(todos).all()
  return allTodos
})

// 統計情報を取得（非クリティカルデータ - 遅延あり）
export const getTodoStats = createServerFn({ method: 'GET' }).handler(async () => {
  // 遅延シミュレーション: ストリーミングの効果を可視化
  const db = getDb()
  const allTodos = await db.select().from(todos).all()
  const completed = allTodos.filter((t) => t.completed).length
  const total = allTodos.length

  return {
    total,
    completed,
    pending: total - completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    fetchedAt: new Date().toLocaleTimeString('ja-JP'),
  }
})

// 最近の更新履歴を取得（非クリティカルデータ - より長い遅延）
export const getRecentActivity = createServerFn({ method: 'GET' }).handler(async () => {
  // より長い遅延シミュレーション
  const db = getDb()
  const allTodos = await db.select().from(todos).all()

  // 仮想的な更新履歴を生成（実際のアプリでは別テーブルで管理）
  const activities = allTodos.slice(-5).map((todo, index) => ({
    id: todo.id,
    action: todo.completed ? '完了' : '追加',
    title: todo.title,
    timestamp: `${(index + 1) * 2}分前`,
  }))

  return {
    activities: activities.reverse(),
    fetchedAt: new Date().toLocaleTimeString('ja-JP'),
  }
})

// 新しいTodoを作成
export const createTodo = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => createTodoSchema.parse(input))
  .handler(async ({ data }) => {
    const db = getDb()
    const result = await db
      .insert(todos)
      .values({
        title: data.title,
        completed: data.completed ?? false,
      })
      .returning()
    return result[0]
  })

// Todoを更新
export const updateTodo = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => updateTodoSchema.parse(input))
  .handler(async ({ data }) => {
    const db = getDb()
    const updateData: Partial<NewTodo> = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.completed !== undefined) updateData.completed = data.completed

    const result = await db.update(todos).set(updateData).where(eq(todos.id, data.id)).returning()
    return result[0]
  })

// Todoを削除
export const deleteTodo = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => deleteTodoSchema.parse(input))
  .handler(async ({ data }) => {
    const db = getDb()
    await db.delete(todos).where(eq(todos.id, data.id))
    return { success: true }
  })
