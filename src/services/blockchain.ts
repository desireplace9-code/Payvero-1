import { 
  BlockchainExecutionResult, 
  BlockchainVerificationResult, 
  Payment, 
  WalletState,
  TokenSymbol
} from '../types';
import { SUPPORTED_TOKENS, isValidEvmAddress, isValidTxHash } from '../config/tokens';
import { PAYMENT_ASSETS, getPaymentAssetById } from '../config/assets';
import { getBlockchainAdapter } from './chains/registry';
import { BlockchainAdapter, PaymentAsset } from './chains/types';

/**
 * Multi-Chain Blockchain Service orchestrator.
 * Routes blockchain calls to the appropriate network adapter (Polygon, Ethereum, BNB, Tron, Bitcoin).
 */
export interface IBlockchainService {
  isProviderAvailable(networkId?: string): boolean;
  connectWallet(networkId?: string): Promise<{ address: string; chainId?: number } | { error: string }>;
  disconnectWallet(networkId?: string): Promise<void>;
  getCurrentWalletState(networkId?: string): Promise<WalletState>;
  getNativeBalance(address: string, networkId?: string): Promise<{ formatted: string; raw: string } | { error: string }>;
  getTokenBalance(tokenSymbol: TokenSymbol, address: string, networkId?: string): Promise<{ formatted: string; raw: string } | { error: string }>;
  getAssetBalance(assetId: string, address: string): Promise<{ formatted: string; raw: string } | { error: string }>;
  sendPayment(payment: Payment, senderAddress: string, customProvider?: unknown): Promise<BlockchainExecutionResult>;
  verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult>;
  getTransaction(txHash: string, networkId?: string): Promise<{ hash: string; blockNumber?: number; from?: string; to?: string; value?: string } | null>;
  getTransactionReceipt(txHash: string, networkId?: string): Promise<{ status: number; blockNumber: number; transactionHash: string } | null>;
  getAdapter(networkId?: string): BlockchainAdapter;
}

class BlockchainService implements IBlockchainService {
  public getAdapter(networkId: string = 'polygon'): BlockchainAdapter {
    return getBlockchainAdapter(networkId);
  }

  public isProviderAvailable(networkId: string = 'polygon'): boolean {
    return this.getAdapter(networkId).isProviderAvailable();
  }

  public async connectWallet(networkId: string = 'polygon'): Promise<{ address: string; chainId?: number } | { error: string }> {
    return this.getAdapter(networkId).connectWallet();
  }

  public async disconnectWallet(networkId: string = 'polygon'): Promise<void> {
    return this.getAdapter(networkId).disconnectWallet();
  }

  public async getCurrentWalletState(networkId: string = 'polygon'): Promise<WalletState> {
    return this.getAdapter(networkId).getCurrentWalletState();
  }

  public async getNativeBalance(address: string, networkId: string = 'polygon'): Promise<{ formatted: string; raw: string } | { error: string }> {
    const adapter = this.getAdapter(networkId);
    const nativeAssetId = networkId === 'polygon' ? 'pol-polygon' : `${networkId}-native`;
    const asset = getPaymentAssetById(nativeAssetId) || {
      id: nativeAssetId,
      symbol: networkId === 'polygon' ? 'POL' : networkId.toUpperCase(),
      name: adapter.networkName,
      networkId,
      networkName: adapter.networkName,
      standard: 'NATIVE',
      contractAddress: null,
      decimals: 18,
      isNative: true,
      explorerUrl: '',
      enabled: true,
      isImplemented: adapter.isImplemented,
      walletAdapter: 'eip1193',
      blockchainAdapter: networkId,
      color: '#8247E5',
      iconBg: '',
    };
    return adapter.getBalance({ address, asset });
  }

  public async getTokenBalance(
    tokenSymbol: TokenSymbol, 
    address: string,
    networkId: string = 'polygon'
  ): Promise<{ formatted: string; raw: string } | { error: string }> {
    const assetId = `${tokenSymbol.toLowerCase()}-${networkId.toLowerCase()}`;
    return this.getAssetBalance(assetId, address);
  }

  public async getAssetBalance(
    assetId: string, 
    address: string
  ): Promise<{ formatted: string; raw: string } | { error: string }> {
    const asset = getPaymentAssetById(assetId);
    if (!asset) {
      return { error: `Asset ${assetId} not found in configuration.` };
    }
    const adapter = this.getAdapter(asset.networkId);
    return adapter.getBalance({ address, asset });
  }

  public async sendPayment(payment: Payment, senderAddress: string, customProvider?: unknown): Promise<BlockchainExecutionResult> {
    const networkId = payment.networkId || 'polygon';
    const adapter = this.getAdapter(networkId);
    return adapter.sendPayment(payment, senderAddress, customProvider);
  }

  public async verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult> {
    const networkId = payment.networkId || 'polygon';
    const adapter = this.getAdapter(networkId);
    return adapter.verifyPayment(txHash, payment);
  }

  public async getTransaction(txHash: string, networkId: string = 'polygon'): Promise<{ hash: string; blockNumber?: number; from?: string; to?: string; value?: string } | null> {
    const adapter = this.getAdapter(networkId);
    return adapter.getTransaction(txHash);
  }

  public async getTransactionReceipt(txHash: string, networkId: string = 'polygon'): Promise<{ status: number; blockNumber: number; transactionHash: string } | null> {
    const adapter = this.getAdapter(networkId);
    return adapter.getTransactionReceipt(txHash);
  }
}

export const blockchainService = new BlockchainService();

