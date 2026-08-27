/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK_CHAIN_ID?: string;
  readonly VITE_POLYGON_RPC_URL?: string;
  readonly APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
