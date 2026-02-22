import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Counter } from './Counter'

describe('Counter', () => {
  it('renders with default initial value of 0', () => {
    render(<Counter />)

    expect(screen.getByTestId('count-value')).toHaveTextContent('0')
  })

  it('renders with custom initial value', () => {
    render(<Counter initialValue={10} />)

    expect(screen.getByTestId('count-value')).toHaveTextContent('10')
  })

  it('increments count when + button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))

    expect(screen.getByTestId('count-value')).toHaveTextContent('1')
  })

  it('decrements count when - button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initialValue={5} />)

    await user.click(screen.getByRole('button', { name: 'Decrement' }))

    expect(screen.getByTestId('count-value')).toHaveTextContent('4')
  })

  it('uses custom step value', async () => {
    const user = userEvent.setup()
    render(<Counter step={5} />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))

    expect(screen.getByTestId('count-value')).toHaveTextContent('5')
  })

  it('applies custom className', () => {
    render(<Counter className="custom-class" />)

    const container = screen.getByTestId('count-value').parentElement
    expect(container).toHaveClass('custom-class')
  })
})
