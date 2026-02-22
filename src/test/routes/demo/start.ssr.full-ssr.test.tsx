import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithFileRoutes } from '@/test/file-route-utils'

vi.mock('@/data/demo.punk-songs', () => ({
  getPunkSongs: vi.fn(),
}))

const mockPunkSongs = [
  { id: 1, name: 'Teenage Dirtbag', artist: 'Wheatus' },
  { id: 2, name: 'Smells Like Teen Spirit', artist: 'Nirvana' },
  { id: 3, name: 'The Middle', artist: 'Jimmy Eat World' },
  { id: 4, name: 'My Own Worst Enemy', artist: 'Lit' },
  { id: 5, name: 'Fat Lip', artist: 'Sum 41' },
  { id: 6, name: 'All the Small Things', artist: 'blink-182' },
  { id: 7, name: 'Beverly Hills', artist: 'Weezer' },
]

describe('Full SSR Route (/demo/start/ssr/full-ssr)', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { getPunkSongs } = await import('@/data/demo.punk-songs')
    vi.mocked(getPunkSongs).mockResolvedValue(mockPunkSongs)
  })

  it('renders the page title', async () => {
    renderWithFileRoutes({ initialLocation: '/demo/start/ssr/full-ssr' })
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Full SSR - Punk Songs/i })).toBeInTheDocument()
    })
  })

  it('loads and displays all punk songs', async () => {
    renderWithFileRoutes({ initialLocation: '/demo/start/ssr/full-ssr' })
    await waitFor(() => {
      expect(screen.getByText('Teenage Dirtbag')).toBeInTheDocument()
    })
    for (const song of mockPunkSongs) {
      expect(screen.getByText(song.name)).toBeInTheDocument()
    }
  })

  it('displays artist names for each song', async () => {
    renderWithFileRoutes({ initialLocation: '/demo/start/ssr/full-ssr' })
    await waitFor(() => {
      expect(screen.getByText('- Wheatus')).toBeInTheDocument()
    })
    for (const song of mockPunkSongs) {
      expect(screen.getByText(`- ${song.artist}`)).toBeInTheDocument()
    }
  })

  it('renders correct number of list items', async () => {
    renderWithFileRoutes({ initialLocation: '/demo/start/ssr/full-ssr' })
    await waitFor(() => {
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(7)
    })
  })

  it('calls getPunkSongs loader function', async () => {
    const { getPunkSongs } = await import('@/data/demo.punk-songs')
    renderWithFileRoutes({ initialLocation: '/demo/start/ssr/full-ssr' })
    await waitFor(() => {
      expect(getPunkSongs).toHaveBeenCalled()
    })
  })
})
