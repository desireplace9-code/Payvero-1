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
import { isValidBitcoinAddress, isValidTxHash } from '../../../config/tokens';

/**
 * Bitcoin Non-EVM UTXO Blockchain Adapter (Architectural Rail).
 * Prepared with Bitcoin specific validation (P2PKH, P2SH, Bech32/Taproot addresses).
 * Safely marked isImplemented = false, isConfigured = false.
 */
export class BitcoinAdapter implements BlockchainAdapter {
  public readonly networkId: NetworkId = 'bitcoin';
  public readonly networkName: string = 'Bitcoin Network';
  public readonly networkType: NetworkType = 'bitcoin';
  public readonly isImplemented: boolean = false;
  public readonly isConfigured: boolean = false;

  public isProviderAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof (window as unknown as { unisat?: unknown; xverse?: unknown }).unisat !== 'undefined';
  }

  public async connectWallet(): Promise<{ address: string; chainId?: number } | { error: string }> {
    return {
      error: 'Bitcoin wallet provider (UniSat/Xverse) is currently in architectural preparation. Please use active Polygon payment rails.',
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
      networkId: 'bitcoin',
      isConnecting: false,
      error: null,
      providerName: null,
    };
  }

  public async getBalance(params: { address: string; asset: PaymentAsset }): Promise<{ formatted: string; raw: string } | { error: string }> {
    return {
      error: 'Bitcoin UTXO balance provider is unconfigured.',
    };
  }

  public async sendPayment(payment: Payment, senderAddress: string): Promise<BlockchainExecutionResult> {
    return {
      success: false,
      code: 'NOT_IMPLEMENTED',
      error: 'Bitcoin UTXO payment rail is currently in architectural preparation.',
    };
  }

  public async verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult> {
    return {
      isConfirmed: false,
      status: 'failed',
      txHash,
      error: 'Bitcoin mempool verification adapter is unconfigured.',
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
    return `https://mempool.space/tx/${txHash.replace(/^0x/, '')}`;
  }

  public getExplorerAddressUrl(address: string): string {
    return `https://mempool.space/address/${address}`;
  }

  public isValidAddress(address?: string): boolean {
    return isValidBitcoinAddress(address);
  }

  public isValidTxHash(txHash?: string): boolean {
    return isValidTxHash(txHash);
  }
}
