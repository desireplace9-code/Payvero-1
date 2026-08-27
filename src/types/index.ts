export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'expired';

export type TokenSymbol = 'POL' | 'USDT' | 'VERSE' | 'BTC' | 'ETH' | 'BNB' | 'TRX' | 'USDC' | string;

export interface Token {
  symbol: string;
  name: string;
  contractAddress: string;
  decimals: number;
  network: string;
  chainId?: number;
  isNative?: boolean;
  color: string;
  iconBg: string;
}

export interface Payment {
  id: string;
  merchantId: string;
  customerWallet?: string;
  merchantWallet: string;
  // Multi-chain & asset identifiers
  assetId: string; // e.g. 'usdt-polygon', 'pol-polygon', 'verse-polygon'
  token: string; // Symbol e.g. 'USDT', 'POL'
  tokenSymbol: string; // Normalized symbol
  tokenContract: string | null;
  networkId: string; // e.g. 'polygon', 'ethereum', 'tron', 'bitcoin'
  networkName: string;
  networkChainId?: number; // EVM chainId if applicable
  standard?: string; // 'NATIVE' | 'ERC20' | 'TRC20' | 'BEP20' | 'UTXO'
  merchantDestination?: string; // Explicit destination address
  amount: string;
  decimals: number;
  description: string;
  customerReference?: string;
  txHash?: string;
  status: PaymentStatus;
  createdAt: string;
  confirmedAt?: string;
  errorMessage?: string;
  expiresAt?: string;
  paymentUrl?: string;
}

export interface CreatePaymentInput {
  amount: string;
  assetId: string; // Selected asset+network identifier e.g. 'usdt-polygon'
  token?: string; // Optional convenience
  networkId?: string;
  networkName?: string;
  networkChainId?: number;
  tokenContract?: string | null;
  description: string;
  customerReference?: string;
  expiresInMinutes?: number;
}

export interface Merchant {
  id: string;
  name: string;
  walletAddress: string; // Default EVM / Polygon address
  tronWalletAddress?: string; // Non-EVM Tron address
  bitcoinWalletAddress?: string; // Non-EVM Bitcoin address
  supportedTokens: string[]; // Enabled Asset IDs e.g. ['pol-polygon', 'usdt-polygon', 'verse-polygon']
  email?: string;
  webhookUrl?: string;
  defaultToken: string;
  businessCategory?: string;
  requireCustomerReference?: boolean;
  networkPreference: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkId?: string;
  isConnecting: boolean;
  error: string | null;
  providerName: string | null;
  balance?: string;
}

export interface TokenRevenue {
  assetId: string;
  token: string;
  networkId: string;
  networkName: string;
  name: string;
  confirmedAmount: number;
  pendingAmount: number;
  transactionCount: number;
  decimals: number;
}

export interface RevenueSummary {
  tokenBreakdown: Record<string, TokenRevenue>; // Keyed by assetId (e.g. 'usdt-polygon', 'pol-polygon')
  totalTransactions: number;
  successfulPaymentsCount: number;
  pendingPaymentsCount: number;
  failedPaymentsCount: number;
}

export interface BlockchainExecutionResult {
  success: boolean;
  txHash?: string;
  error?: string;
  code?: 'PROVIDER_NOT_FOUND' | 'USER_REJECTED' | 'NETWORK_MISMATCH' | 'INSUFFICIENT_FUNDS' | 'NOT_CONFIGURED' | 'NOT_IMPLEMENTED' | 'EXECUTION_ERROR';
}

export interface BlockchainVerificationResult {
  isConfirmed: boolean;
  status: PaymentStatus;
  confirmations?: number;
  blockNumber?: number;
  txHash?: string;
  error?: string;
  checkedAt: string;
}

