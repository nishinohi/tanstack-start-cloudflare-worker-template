import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CounterProps {
  initialValue?: number
  step?: number
  className?: string
}

export function Counter({ initialValue = 0, step = 1, className }: CounterProps) {
  const [count, setCount] = useState(initialValue)

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Button onClick={() => setCount((prev) => prev - step)} aria-label="Decrement">
        -
      </Button>
      <span data-testid="count-value" className="min-w-8 text-center text-xl font-semibold">
        {count}
      </span>
      <Button onClick={() => setCount((prev) => prev + step)} aria-label="Increment">
        +
      </Button>
    </div>
  )
}
