type Props = {
  error: unknown
  reset: () => void
  title: string
}

export default function StreamingErrorFallback({ error, reset, title }: Props) {
  const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました'

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
      <div className="flex items-center gap-2 text-red-600">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-semibold">{title}の読み込みに失敗しました</span>
      </div>
      <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
      <button onClick={reset} className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
        再試行
      </button>
    </div>
  )
}
