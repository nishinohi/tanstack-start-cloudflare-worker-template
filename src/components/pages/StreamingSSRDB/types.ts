import type { Todo } from '@/db/schema/schema'

// 統計情報の型定義
export type TodoStats = {
  total: number
  completed: number
  pending: number
  completionRate: number
  fetchedAt: string
}

// 最近の更新履歴の型定義
export type RecentActivity = {
  activities: Array<{
    id: number
    action: string
    title: string
    timestamp: string
  }>
  fetchedAt: string
}

// ローダーデータの型定義
export type LoaderData = {
  todoList: Promise<Todo[]>
  stats: Promise<TodoStats>
  recentActivity: Promise<RecentActivity>
}
