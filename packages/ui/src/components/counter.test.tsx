import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Counter } from './counter'

describe('Counter', () => {
  it('初期値 0 でレンダリングされる', () => {
    render(<Counter />)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('0')
  })

  it('initialCount を指定した場合はその値でレンダリングされる', () => {
    render(<Counter initialCount={5} />)
    expect(screen.getByTestId('counter-value')).toHaveTextContent('5')
  })

  it('インクリメントボタンをクリックするとカウントが増える', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: 'インクリメント' }))
    expect(screen.getByTestId('counter-value')).toHaveTextContent('1')
  })

  it('デクリメントボタンをクリックするとカウントが減る', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={3} />)
    await user.click(screen.getByRole('button', { name: 'デクリメント' }))
    expect(screen.getByTestId('counter-value')).toHaveTextContent('2')
  })

  it('label を指定した場合はそのテキストが表示される', () => {
    render(<Counter label="テストカウンター" />)
    expect(screen.getByText('テストカウンター')).toBeInTheDocument()
  })
})
