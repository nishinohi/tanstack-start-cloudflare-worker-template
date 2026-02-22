import { add } from '@repo/math'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/shared-packages')({
  component: SharedPackagesPage,
})

function SharedPackagesPage() {
  const result = add(3, 7)

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-foreground mb-8 text-2xl font-bold">共有パッケージ デモ</h1>

      <section className="mb-8">
        <h2 className="text-foreground mb-4 text-lg font-semibold">@repo/math — 加算ライブラリ</h2>
        <div className="border-border bg-card text-card-foreground rounded-lg border p-4">
          <code className="text-sm">add(3, 7)</code>
          <p className="mt-2 text-2xl font-bold">{result}</p>
        </div>
      </section>
    </main>
  )
}
