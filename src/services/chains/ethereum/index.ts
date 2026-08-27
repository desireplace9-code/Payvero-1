import { 
  BlockchainAdapter, 
  NetworkId, 
  NetworkType, 
  PaymentAsset 
} from '../types';
import { 
  Payment, 
  WalletState, 
  BlockchainExecutionResult, 
  BlockchainVerificationResult 
} from '../../../types';
import { isValidEvmAddress, isValidTxHash } from '../../../config/tokens';

/**
 * Ethereum Mainnet EVM Adapter (Architectural Rail).
 * Safely marked isImplemented = false, isConfigured = false.
 * Prevents simulated transactions or false success.
 */
export class EthereumAdapter implements BlockchainAdapter {
  public readonly networkId: NetworkId = 'ethereum';
  public readonly networkName: string = 'Ethereum Mainnet';
  public readonly networkType: NetworkType = 'evm';
  public readonly isImplemented: boolean = false;
  public readonly isConfigured: boolean = false;

  public isProviderAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof (window as unknown as { ethereum?: unknown }).ethereum !== 'undefined';
  }

  public async connectWallet(): Promise<{ address: string; chainId?: number } | { error: string }> {
    return {
      error: 'Ethereum Mainnet wallet adapter is in the architectural preparation phase. Please use active Polygon payment rails.',
    };
  }

  public async disconnectWallet(): Promise<void> {
    return Promise.resolve();
  }

  public async getCurrentWalletState(): Promise<WalletState> {
    return {
      isConnected: false,
      address: null,
      chainId: 1,
      networkId: 'ethereum',
      isConnecting: false,
      error: null,
      providerName: null,
    };
  }

  public async getBalance(params: { address: string; asset: PaymentAsset }): Promise<{ formatted: string; raw: string } | { error: string }> {
    return {
      error: 'Ethereum live balance query is not yet active. Please use supported Polygon assets.',
    };
  }

  public async sendPayment(payment: Payment, senderAddress: string): Promise<BlockchainExecutionResult> {
    return {
      success: false,
      code: 'NOT_IMPLEMENTED',
      error: 'Ethereum payment rail is currently in architectural preparation. On-chain broadcasting is not active.',
    };
  }

  public async verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult> {
    return {
      isConfirmed: false,
      status: 'failed',
      txHash,
      error: 'Ethereum verification adapter is not yet connected to a live RPC provider.',
      checkedAt: new Date().toISOString(),
    };
  }

  public async getTransaction(txHash: string): Promise<null> {
    return null;
  }

  public async getTransactionReceipt(txHash: string): Promise<null> {
    return null;
  }

  public getExplorerTxUrl(txHash: string): string {
    return `https://etherscan.io/tx/${txHash}`;
  }

  public getExplorerAddressUrl(address: string): string {
    return `https://etherscan.io/address/${address}`;
  }

  public isValidAddress(address?: string): boolean {
    return isValidEvmAddress(address);
  }

  public isValidTxHash(txHash?: string): boolean {
    return isValidTxHash(txHash);
  }
}
