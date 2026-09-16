// Mock for cloudflare:workers module in test environment

export const env = {
  DB: {},
  SESSION_SECRET: 'test-secret',
  BASE_URL: 'http://localhost:3000',
  CLIENT_ID: 'test-client-id',
  CLIENT_SECRET: 'test-client-secret',
  ENVIRONMENT: 'test',
  NODE_ENV: 'test',
}
