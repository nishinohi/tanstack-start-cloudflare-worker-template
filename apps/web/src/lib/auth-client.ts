import { createAuthClient } from 'better-auth/react'

// baseURL は明示しない
// ブラウザでは window.location.origin、サーバーでは Worker の BASE_URL から自動解決される
export const authClient = createAuthClient()
