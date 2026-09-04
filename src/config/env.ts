export const ENV_CONFIG = {
  appName: 'Payvero',
  tagline: 'Simple Crypto Payments',
  defaultChainId: Number(import.meta.env.VITE_NETWORK_CHAIN_ID || '137'),
  polygonRpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
  get walletConnectProjectId(): string {
    // 1. Primary authoritative source: VITE_WALLETCONNECT_PROJECT_ID from build/environment
    const envRaw = (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '').trim();
    if (envRaw.length > 0 && envRaw !== '3a8170812b534d0ff9d794f15691064f') {
      return envRaw;
    }

    // 2. Secondary fallback: Merchant/user manually configured key in browser localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('payvero_wc_project_id');
        if (stored && stored.trim().length > 0) {
          const cleanStored = stored.trim();
          // Purge stale dead placeholder ID if previously stored
          if (cleanStored === '3a8170812b534d0ff9d794f15691064f') {
            localStorage.removeItem('payvero_wc_project_id');
            return '';
          }
          return cleanStored;
        }
      } catch {
        // LocalStorage access restricted (e.g. private browsing)
      }
    }

    // No hard-coded placeholder; return empty string so missing ID is cleanly handled
    return '';
  },
  setWalletConnectProjectId(id: string): void {
    if (typeof window !== 'undefined') {
      try {
        if (id && id.trim().length > 0 && id.trim() !== '3a8170812b534d0ff9d794f15691064f') {
          localStorage.setItem('payvero_wc_project_id', id.trim());
        } else {
          localStorage.removeItem('payvero_wc_project_id');
        }
      } catch {
        // Ignore
      }
    }
  },
  appUrl: import.meta.env.APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://payvero-1.vercel.app/'),
};


