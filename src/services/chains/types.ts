import { Payment, PaymentStatus, WalletState, BlockchainExecutionResult, BlockchainVerificationResult } from '../../types';

export type NetworkId = 'polygon' | 'ethereum' | 'bnb' | 'tron' | 'bitcoin' | string;
export type NetworkType = 'evm' | 'tron' | 'bitcoin' | 'utxo';
export type TokenStandard = 'NATIVE' | 'ERC20' | 'TRC20' | 'BEP20' | 'UTXO';

export interface ChainConfig {
  id: NetworkId;
  name: string;
  shortName: string;
  networkType: NetworkType;
  chainId?: number; // Only for EVM networks
  nativeSymbol: string;
  nativeName: string;
  nativeDecimals: number;
  isImplemented: boolean;
  isConfigured: boolean;
  rpcUrl?: string;
  explorerBaseUrl: string;
  explorerTxUrl: (txHash: string) => string;
  explorerAddressUrl: (address: string) => string;
  color: string;
  iconBg: string;
}

export interface PaymentAsset {
  id: string; // Unique pair key e.g. 'usdt-polygon', 'pol-polygon', 'btc-bitcoin'
  symbol: string; // e.g. 'USDT', 'POL', 'VERSE', 'BTC'
  name: string;
  networkId: NetworkId;
  networkName: string;
  networkChainId?: number; // EVM chain ID e.g. 137, 1, 56
  standard: TokenStandard;
  contractAddress: string | null; // null for native gas / L1 tokens
  decimals: number;
  isNative: boolean;
  explorerUrl: string;
  enabled: boolean;
  isImplemented: boolean; // True ONLY if real wallet connect, RPC & verification are live
  walletAdapter: string;
  blockchainAdapter: string;
  color: string;
  iconBg: string;
}

export interface BlockchainAdapter {
  readonly networkId: NetworkId;
  readonly networkName: string;
  readonly networkType: NetworkType;
  readonly isImplemented: boolean;
  readonly isConfigured: boolean;

  isProviderAvailable(): boolean;
  connectWallet(): Promise<{ address: string; chainId?: number } | { error: string }>;
  disconnectWallet(): Promise<void>;
  getCurrentWalletState(): Promise<WalletState>;
  getBalance(params: { address: string; asset: PaymentAsset }): Promise<{ formatted: string; raw: string } | { error: string }>;
  sendPayment(payment: Payment, senderAddress: string, customProvider?: unknown): Promise<BlockchainExecutionResult>;
  verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult>;
  getTransaction(txHash: string): Promise<{ hash: string; blockNumber?: number; from?: string; to?: string; value?: string } | null>;
  getTransactionReceipt(txHash: string): Promise<{ status: number; blockNumber: number; transactionHash: string } | null>;
  getExplorerTxUrl(txHash: string): string;
  getExplorerAddressUrl(address: string): string;
  isValidAddress(address?: string): boolean;
  isValidTxHash(txHash?: string): boolean;
}
