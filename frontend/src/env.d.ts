/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REST_SERVER_BASE_URL?: string;
  readonly VITE_OPENTEL_URL?: string;
  readonly VITE_ADMIN_EMAIL?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
