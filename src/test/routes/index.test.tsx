import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from '@/routes/index'

describe('Index Route (/)', () => {
  it('renders the hero section with correct title', () => {
    render(<App />)

    expect(screen.getByText('TANSTACK')).toBeInTheDocument()
    expect(screen.getByText('START')).toBeInTheDocument()
  })

  it('displays the tagline', () => {
    render(<App />)

    expect(screen.getByText('The framework for next generation AI applications')).toBeInTheDocument()
  })

  it('renders all 6 feature cards', () => {
    render(<App />)

    const featureTitles = [
      'Powerful Server Functions',
      'Flexible Server Side Rendering',
      'API Routes',
      'Strongly Typed Everything',
      'Full Streaming Support',
      'Next Generation Ready',
    ]

    featureTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('displays feature titles correctly', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 3, name: 'Powerful Server Functions' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'API Routes' })).toBeInTheDocument()
  })

  it('has documentation link with correct href', () => {
    render(<App />)

    const docLink = screen.getByRole('link', { name: /documentation/i })
    expect(docLink).toHaveAttribute('href', 'https://tanstack.com/start')
    expect(docLink).toHaveAttribute('target', '_blank')
  })

  it('shows the code path hint', () => {
    render(<App />)

    expect(screen.getByText('/src/routes/index.tsx')).toBeInTheDocument()
  })

  it('displays the TanStack logo image', () => {
    render(<App />)

    const logo = screen.getByAltText('TanStack Logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/tanstack-circle-logo.png')
  })
})
