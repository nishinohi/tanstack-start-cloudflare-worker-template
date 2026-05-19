import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('単一クラスをそのまま返す', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('複数クラスを結合する', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('条件付きクラスを処理する', () => {
    const isActive = false as boolean
    const isVisible = true as boolean
    expect(cn('foo', isActive && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', isVisible && 'bar')).toBe('foo bar')
  })

  it('Tailwind の競合クラスをマージする', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('undefined と null を無視する', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('引数なしで空文字列を返す', () => {
    expect(cn()).toBe('')
  })

  it('オブジェクト形式のクラスを処理する', () => {
    expect(cn({ foo: true, bar: false })).toBe('foo')
    expect(cn({ foo: true, bar: true })).toBe('foo bar')
  })

  it('配列形式のクラスを処理する', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})
