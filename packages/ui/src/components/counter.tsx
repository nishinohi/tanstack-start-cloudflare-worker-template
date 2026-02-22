import { useState } from 'react'

interface CounterProps {
  initialCount?: number
  label?: string
}

export function Counter({ initialCount = 0, label = 'カウント' }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        border: '1px solid currentColor',
        borderRadius: '8px',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>{label}</p>
      <span
        style={{ fontSize: '2rem', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}
        data-testid="counter-value"
      >
        {count}
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setCount((c) => c - 1)}
          aria-label="デクリメント"
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            border: '1px solid currentColor',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          aria-label="インクリメント"
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            border: '1px solid currentColor',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
