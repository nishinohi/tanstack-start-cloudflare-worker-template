import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import { createServerOnlyFn } from '@tanstack/react-start'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { schema } from '@/db/schema'

/**
 * Drizzle ORM の DB インスタンスをキャッシュして返す
 *
 * Cloudflare Workers の isolate スコープでキャッシュされるため、
 * 同じ isolate 内の複数リクエストで再利用される
 *
 * @returns Drizzle D1 Database インスタンス
 */
let cachedDb: DrizzleD1Database<typeof schema> | null = null

export const getDb = createServerOnlyFn(() => {
  if (!cachedDb) {
    cachedDb = drizzle(env.DB, { schema })
  }
  return cachedDb
})

/**
 * Batter Auth インスタンスをキャッシュして返す
 *
 * Cloudflare Workers の isolate スコープでキャッシュされるため、
 * 同じ isolate 内の複数リクエストで再利用される
 *
 * @returns Better Auth インスタンス
 */
type Auth = ReturnType<typeof betterAuth>

let cachedAuth: Auth | null = null

export const getAuth = createServerOnlyFn(() => {
  if (cachedAuth) return cachedAuth

  const db = getDb()

  const auth = betterAuth({
    secret: env.SESSION_SECRET,
    baseURL: env.BASE_URL,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    // enabled の Better Auth デフォルトは process.env.NODE_ENV 依存のため、環境変数から明示的に決定する
    // NOTE: storage 未指定のため 'memory'（isolate ローカル）で動作する。Workers では isolate を跨いで
    // カウントが共有されないため制限は厳密には効かない。永続化先（D1 等）は別途検討する
    rateLimit: {
      enabled: env.ENVIRONMENT !== 'local',
    },
    socialProviders: {
      google: {
        clientId: env.CLIENT_ID,
        clientSecret: env.CLIENT_SECRET,
      },
    },
  }) as Auth
  cachedAuth = auth
  return auth
})
