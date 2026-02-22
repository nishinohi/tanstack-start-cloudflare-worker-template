import { use } from 'react'

import type { RecentActivity as RecentActivityType } from '../types'

type Props = {
  promise: Promise<RecentActivityType>
}

export default function RecentActivity({ promise }: Props) {
  const activity = use(promise)

  if (activity.activities.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
        更新履歴がありません
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        {activity.activities.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${item.action === '完了' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
            <span className="flex-1">
              <span className="text-gray-500">{item.timestamp}:</span>{' '}
              <span className="font-medium">&quot;{item.title}&quot;</span> を{item.action}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-xs text-gray-400">取得時刻: {activity.fetchedAt}</div>
    </div>
  )
}

// ローディングスケルトン
export function RecentActivityLoadingSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-gray-200"></div>
            <div className="h-4 flex-1 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-gray-400">更新履歴を読み込み中...</div>
    </div>
  )
}
