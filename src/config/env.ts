export const ENV_CONFIG = {
  appName: 'Payvero',
  tagline: 'Simple Crypto Payments',
  defaultChainId: Number(import.meta.env.VITE_NETWORK_CHAIN_ID || '137'),
  polygonRpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
  get walletConnectProjectId(): string {
    const raw = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
    return typeof raw === 'string' ? raw.trim() : '';
  },
  appUrl: import.meta.env.APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://payvero.io'),
};

