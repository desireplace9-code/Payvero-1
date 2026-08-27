export type WalletConnectorType = 'injected' | 'walletconnect';

export type WalletConnectionResult =
  | { success: true; session: ConnectedWalletSession }
  | { success: false; error: string; code?: string };

export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  disconnect?: () => Promise<void>;
  session?: unknown;
  accounts?: string[];
  chainId?: number | string;
}

export interface ConnectedWalletSession {
  address: string;
  chainId: number;
  connectorType: WalletConnectorType;
  provider: Eip1193Provider;
  walletId?: string;
  walletName?: string;
  approvedChains?: number[];
  approvedAccounts?: string[];
  bitcoinAddress?: string | null;
  supportedAssets?: string[];
}

export interface EvmChainMetadata {
  chainId: number;
  hexChainId: string;
  name: string;
  shortName: string;
  networkId: string;
  caipId: string; // e.g. 'eip155:137'
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  supportedTokens: string[];
}
