declare global {
  interface Window {
    _env_: ImportMetaEnv;
  }
}

const development = {
  rest_server_base_url:
    import.meta.env.VITE_REST_SERVER_BASE_URL || "http://localhost:3456/api/v1",
  opentel_url: import.meta.env.VITE_OPENTEL_URL || "http://localhost:16686",
  admin_email: import.meta.env.VITE_ADMIN_EMAIL || "admin@localhost",
};

const production = {
  rest_server_base_url: window?._env_?.VITE_REST_SERVER_BASE_URL || "",
  opentel_url: window?._env_?.VITE_OPENTEL_URL || "",
  admin_email: window?._env_?.VITE_ADMIN_EMAIL || "",
};

export default (() => (import.meta.env.PROD ? production : development))();
