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
    session: {
      // セッションは D1 の session テーブルに保存されるため、検証のたびに D1 を読むことになる。
      // 署名付き Cookie にセッションをキャッシュして読み取りを抑える。
      // トレードオフとして、キャッシュが有効な間は D1 を読まないため、Cookie を伴わない
      // 帯域外のセッション操作（revokeSession / 管理者による強制ログアウト / D1 の直接更新）の
      // 反映が最大 maxAge だけ遅れる。本人のログアウト・ログイン・updateUser は
      // Cookie も同時に更新されるため即時反映される。
      // 即時性が必要な参照では getSession に disableCookieCache: true を渡す
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    advanced: {
      ipAddress: {
        // 既定の x-forwarded-for はクライアントが自分で書けるヘッダーで、Cloudflare は
        // それを上書きせず自分の見た IP を「追記」する。つまり攻撃者が XFF を 1 行足すだけで
        // 値が 2 個になり、Better Auth は多値の XFF を信用しない（trustedProxies 未設定なら
        // `forwardedIps.length !== 1` で null）ので IP 不明に落ちる。
        // cf-connecting-ip は Cloudflare がエッジで付け直すため詐称できない。
        // レート制限のキーだけでなく session.ipAddress の記録にも効く
        ipAddressHeaders: ['cf-connecting-ip'],
      },
    },
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
        prompt: 'select_account',
      },
    },
  }) as Auth
  cachedAuth = auth
  return auth
})
