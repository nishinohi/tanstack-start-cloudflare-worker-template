import { HeadContent, Link, Scripts, createRootRouteWithContext } from '@tanstack/react-router'

import Header from '../components/Header'
import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-6xl font-bold text-gray-300">404</h1>
      <p className="mb-8 text-xl text-gray-600">ページが見つかりませんでした</p>
      <Link to="/" className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600">
        ホームに戻る
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      {/*
        ブラウザ拡張（ColorZilla の cz-shortcut-listen など）が React の hydration 前に
        body へ属性を注入するため mismatch 警告が出る。suppressHydrationWarning は
        "one level deep"、つまり body 自身の属性と直下のテキストにしか効かないため、
        子要素の hydration mismatch は引き続き検出される
      */}
      <body suppressHydrationWarning>
        <Header />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
