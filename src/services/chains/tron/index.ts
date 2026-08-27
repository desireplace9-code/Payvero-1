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
import { isValidTronAddress, isValidTxHash } from '../../../config/tokens';

/**
 * Tron Non-EVM Blockchain Adapter (Architectural Rail).
 * Prepared with Tron specific validation (Base58 'T...' addresses, TronLink provider checks).
 * Safely marked isImplemented = false, isConfigured = false.
 */
export class TronAdapter implements BlockchainAdapter {
  public readonly networkId: NetworkId = 'tron';
  public readonly networkName: string = 'Tron Network';
  public readonly networkType: NetworkType = 'tron';
  public readonly isImplemented: boolean = false;
  public readonly isConfigured: boolean = false;

  public isProviderAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof (window as unknown as { tronWeb?: unknown }).tronWeb !== 'undefined';
  }

  public async connectWallet(): Promise<{ address: string; chainId?: number } | { error: string }> {
    return {
      error: 'TronLink / Tron wallet adapter is currently in architectural preparation. Please use active Polygon payment rails.',
    };
  }

  public async disconnectWallet(): Promise<void> {
    return Promise.resolve();
  }

  public async getCurrentWalletState(): Promise<WalletState> {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      networkId: 'tron',
      isConnecting: false,
      error: null,
      providerName: null,
    };
  }

  public async getBalance(params: { address: string; asset: PaymentAsset }): Promise<{ formatted: string; raw: string } | { error: string }> {
    return {
      error: 'Tron node balance query is currently unconfigured.',
    };
  }

  public async sendPayment(payment: Payment, senderAddress: string): Promise<BlockchainExecutionResult> {
    return {
      success: false,
      code: 'NOT_IMPLEMENTED',
      error: 'Tron payment rail is currently in architectural preparation. On-chain TRC-20 broadcasting is not active.',
    };
  }

  public async verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult> {
    return {
      isConfirmed: false,
      status: 'failed',
      txHash,
      error: 'Tron verification adapter is not yet connected to a live TronGrid node.',
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
    return `https://tronscan.org/#/transaction/${txHash.replace(/^0x/, '')}`;
  }

  public getExplorerAddressUrl(address: string): string {
    return `https://tronscan.org/#/address/${address}`;
  }

  public isValidAddress(address?: string): boolean {
    return isValidTronAddress(address);
  }

  public isValidTxHash(txHash?: string): boolean {
    return isValidTxHash(txHash);
  }
}
