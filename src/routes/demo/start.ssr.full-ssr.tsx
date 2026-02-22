import { createFileRoute } from '@tanstack/react-router'

import FullSsr from '@/components/pages/FullSsr'
import { getPunkSongs } from '@/data/demo.punk-songs'

export const Route = createFileRoute('/demo/start/ssr/full-ssr')({
  component: RouteComponent,
  loader: async () => await getPunkSongs(),
})

function RouteComponent() {
  const punkSongs = Route.useLoaderData()
  return <FullSsr punkSongs={punkSongs} />
}
