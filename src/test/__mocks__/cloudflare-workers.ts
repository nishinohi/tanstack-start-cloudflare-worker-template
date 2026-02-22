// Mock for cloudflare:workers module in test environment

export const env = {
  DB: {},
  SESSION_KV: {
    get: () => Promise.resolve(null),
    put: () => Promise.resolve(),
    delete: () => Promise.resolve(),
  },
  SESSION_SECRET: 'test-secret',
  BASE_URL: 'http://localhost:3000',
  CLIENT_ID: 'test-client-id',
  CLIENT_SECRET: 'test-client-secret',
  ENVIRONMENT: 'test',
}
