export const ENV_CONFIG = {
  appName: 'Payvero',
  tagline: 'Simple Crypto Payments',
  defaultChainId: Number(import.meta.env.VITE_NETWORK_CHAIN_ID || '137'),
  polygonRpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
  get walletConnectProjectId(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('payvero_wc_project_id');
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    }
    const raw = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';
    return typeof raw === 'string' ? raw.trim() : '';
  },
  setWalletConnectProjectId(id: string): void {
    if (typeof window !== 'undefined') {
      if (id && id.trim().length > 0) {
        localStorage.setItem('payvero_wc_project_id', id.trim());
      } else {
        localStorage.removeItem('payvero_wc_project_id');
      }
    }
  },
  appUrl: import.meta.env.APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://payvero.io'),
};


