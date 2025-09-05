export const Env = {
  MODE: (import.meta.env.MODE as 'development' | 'production' | 'staging') || 'development',
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,

  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  VITE_GRAPHQL_ENDPOINT: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  VITE_WEBSOCKET_ENDPOINT: import.meta.env.VITE_WEBSOCKET_ENDPOINT,

  VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Afya Papo',
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  VITE_APP_ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',

  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  VITE_ENABLE_DEBUG_LOGGING: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
  VITE_ENABLE_REAL_TIME_UPDATES: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES !== 'false',

  VITE_TOKEN_STORAGE_KEY: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'afyapapo_access_token',
  VITE_REFRESH_TOKEN_KEY: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'afyapapo_refresh_token',
  VITE_ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || 'default-secret-key',
} as const;


