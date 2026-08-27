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
 * BNB Smart Chain EVM Adapter (Architectural Rail).
 * Safely marked isImplemented = false, isConfigured = false.
 */
export class BnbAdapter implements BlockchainAdapter {
  public readonly networkId: NetworkId = 'bnb';
  public readonly networkName: string = 'BNB Smart Chain';
  public readonly networkType: NetworkType = 'evm';
  public readonly isImplemented: boolean = false;
  public readonly isConfigured: boolean = false;

  public isProviderAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof (window as unknown as { ethereum?: unknown }).ethereum !== 'undefined';
  }

  public async connectWallet(): Promise<{ address: string; chainId?: number } | { error: string }> {
    return {
      error: 'BNB Smart Chain wallet connection is currently unconfigured.',
    };
  }

  public async disconnectWallet(): Promise<void> {
    return Promise.resolve();
  }

  public async getCurrentWalletState(): Promise<WalletState> {
    return {
      isConnected: false,
      address: null,
      chainId: 56,
      networkId: 'bnb',
      isConnecting: false,
      error: null,
      providerName: null,
    };
  }

  public async getBalance(params: { address: string; asset: PaymentAsset }): Promise<{ formatted: string; raw: string } | { error: string }> {
    return {
      error: 'BNB Smart Chain balance provider is not yet active.',
    };
  }

  public async sendPayment(payment: Payment, senderAddress: string): Promise<BlockchainExecutionResult> {
    return {
      success: false,
      code: 'NOT_IMPLEMENTED',
      error: 'BNB Smart Chain payment rail is in architectural preparation.',
    };
  }

  public async verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult> {
    return {
      isConfirmed: false,
      status: 'failed',
      txHash,
      error: 'BNB Smart Chain verification is unconfigured.',
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
    return `https://bscscan.com/tx/${txHash}`;
  }

  public getExplorerAddressUrl(address: string): string {
    return `https://bscscan.com/address/${address}`;
  }

  public isValidAddress(address?: string): boolean {
    return isValidEvmAddress(address);
  }

  public isValidTxHash(txHash?: string): boolean {
    return isValidTxHash(txHash);
  }
}
