import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { UserMenu } from './UserMenu'

const { mockNavigate, mockSignOut, mockUseSession } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSignOut: vi.fn(),
  mockUseSession: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => mockUseSession(),
    signOut: mockSignOut,
  },
}))

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ローディング中はスケルトンを表示する', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true })
    const { container } = render(<UserMenu />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('未ログイン時はログインボタンを表示する', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })
    render(<UserMenu />)
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('ログインボタンクリックで /login へ遷移する', async () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })
    render(<UserMenu />)
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
  })

  it('ログイン済みの場合はユーザー名を表示する', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'テストユーザー', email: 'test@example.com', image: null } },
      isPending: false,
    })
    render(<UserMenu />)
    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
  })
})
