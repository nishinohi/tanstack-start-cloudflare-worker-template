import { use } from 'react'

import type { TodoStats as TodoStatsType } from '../types'

type Props = {
  promise: Promise<TodoStatsType>
}

export default function TodoStats({ promise }: Props) {
  const stats = use(promise)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-500">総数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">完了</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">未完了</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
          <div className="text-sm text-gray-500">完了率</div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-gray-400">取得時刻: {stats.fetchedAt}</div>
    </div>
  )
}

// ローディングスケルトン
export function TodoStatsLoadingSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto mb-2 h-8 w-16 rounded bg-gray-200"></div>
            <div className="mx-auto h-4 w-12 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-gray-400">統計情報を読み込み中...</div>
    </div>
  )
}
