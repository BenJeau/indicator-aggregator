/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REST_SERVER_BASE_URL: string;
  readonly VITE_OPENTEL_URL: string;
  readonly VITE_ADMIN_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
