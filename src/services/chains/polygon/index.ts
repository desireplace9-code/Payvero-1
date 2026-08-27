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
import { ENV_CONFIG } from '../../../config/env';
import { isValidEvmAddress, isValidTxHash } from '../../../config/tokens';
import { parseTokenUnits, encodeErc20Transfer } from '../../../utils/web3Units';

/**
 * Live, production-ready Polygon PoS (Chain ID 137) Blockchain Adapter.
 * Handles Native POL (Polygon gas token) and ERC-20 tokens (USDT, VERSE).
 */
export class PolygonAdapter implements BlockchainAdapter {
  public readonly networkId: NetworkId = 'polygon';
  public readonly networkName: string = 'Polygon PoS';
  public readonly networkType: NetworkType = 'evm';
  public readonly isImplemented: boolean = true;
  public readonly isConfigured: boolean = true;

  private rpcUrl: string = ENV_CONFIG.polygonRpcUrl;

  private async callRpc(method: string, params: unknown[] = []): Promise<unknown> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Polygon RPC request failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'Polygon RPC execution error');
    }
    return data.result;
  }

  public isProviderAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return typeof (window as unknown as { ethereum?: unknown }).ethereum !== 'undefined';
  }

  /**
   * Ensures the user's connected wallet is on Polygon PoS (Chain ID 137).
   * Prompts network switch or addition if necessary.
   */
  public async ensurePolygonChain(customProvider?: unknown): Promise<{ success: boolean; error?: string }> {
    const provider = (customProvider || (typeof window !== 'undefined' ? (window as unknown as { ethereum?: unknown }).ethereum : null)) as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } | null;

    if (!provider) {
      return { success: false, error: 'No Web3 EVM provider detected.' };
    }

    try {
      const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string;
      const currentChainId = typeof chainIdHex === 'number' ? chainIdHex : parseInt(chainIdHex, 16);

      if (currentChainId === 137) {
        return { success: true };
      }

      // Prompt switch to Polygon Mainnet (0x89)
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }],
        });
        return { success: true };
      } catch (switchError: unknown) {
        const err = switchError as { code?: number; data?: { originalError?: { code?: number } }; message?: string };
        if (err.code === 4902 || err.data?.originalError?.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'POL',
                  symbol: 'POL',
                  decimals: 18,
                },
                rpcUrls: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
                blockExplorerUrls: ['https://polygonscan.com/'],
              },
            ],
          });
          return { success: true };
        }
        if (err.code === 4001) {
          return { success: false, error: 'Please switch your wallet network to Polygon PoS to proceed.' };
        }
        return { success: false, error: err.message || 'Failed to switch to Polygon PoS network.' };
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      return { success: false, error: errorObj.message || 'Error checking network chain ID.' };
    }
  }

  public async connectWallet(): Promise<{ address: string; chainId?: number } | { error: string }> {
    if (!this.isProviderAvailable()) {
      return { 
        error: 'No Web3 EVM wallet detected. Please install MetaMask, Rabby, Coinbase Wallet, or a compatible Web3 browser extension.' 
      };
    }

    try {
      const ethereum = (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
      
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      if (!accounts || accounts.length === 0) {
        return { error: 'No accounts selected in wallet.' };
      }

      const chainIdHex = (await ethereum.request({ method: 'eth_chainId' })) as string;
      const chainId = parseInt(chainIdHex, 16);

      const address = accounts[0];
      if (!this.isValidAddress(address)) {
        return { error: 'Received an invalid EVM address from wallet provider.' };
      }

      return { address, chainId };
    } catch (err: unknown) {
      const errorObj = err as { code?: number; message?: string };
      if (errorObj.code === 4001) {
        return { error: 'Wallet connection request was rejected by the user.' };
      }
      return { error: errorObj.message || 'Failed to connect Polygon wallet.' };
    }
  }

  public async disconnectWallet(): Promise<void> {
    return Promise.resolve();
  }

  public async getCurrentWalletState(): Promise<WalletState> {
    if (!this.isProviderAvailable()) {
      return {
        isConnected: false,
        address: null,
        chainId: null,
        networkId: 'polygon',
        isConnecting: false,
        error: null,
        providerName: null,
      };
    }

    try {
      const ethereum = (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
      const accounts = (await ethereum.request({ method: 'eth_accounts' })) as string[];
      
      if (accounts && accounts.length > 0 && this.isValidAddress(accounts[0])) {
        const chainIdHex = (await ethereum.request({ method: 'eth_chainId' })) as string;
        const chainId = parseInt(chainIdHex, 16);
        return {
          isConnected: true,
          address: accounts[0],
          chainId,
          networkId: 'polygon',
          isConnecting: false,
          error: null,
          providerName: 'Polygon Web3 Provider',
        };
      }
    } catch {
      // Background query error ignore
    }

    return {
      isConnected: false,
      address: null,
      chainId: null,
      networkId: 'polygon',
      isConnecting: false,
      error: null,
      providerName: null,
    };
  }

  public async getBalance(params: { address: string; asset: PaymentAsset }): Promise<{ formatted: string; raw: string } | { error: string }> {
    const { address, asset } = params;
    if (!this.isValidAddress(address)) {
      return { error: 'Invalid EVM address for Polygon network.' };
    }

    if (asset.isNative) {
      // Native POL query via eth_getBalance
      try {
        let balanceHex: string;
        if (this.isProviderAvailable()) {
          const ethereum = (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
          balanceHex = (await ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest'],
          })) as string;
        } else {
          balanceHex = (await this.callRpc('eth_getBalance', [address, 'latest'])) as string;
        }

        const balanceWei = BigInt(balanceHex);
        const polAmount = Number(balanceWei / BigInt(1e14)) / 10000;
        return {
          formatted: polAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
          raw: balanceWei.toString(),
        };
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        return { error: errorObj.message || 'Failed to read POL balance from Polygon node.' };
      }
    }

    // ERC-20 token query (USDT / VERSE)
    if (!asset.contractAddress) {
      return { error: 'Missing token contract address on Polygon.' };
    }

    try {
      const cleanAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
      const callData = `0x70a08231${cleanAddress}`;

      let resultHex: string;
      if (this.isProviderAvailable()) {
        const ethereum = (window as unknown as { ethereum: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
        resultHex = (await ethereum.request({
          method: 'eth_call',
          params: [
            {
              to: asset.contractAddress,
              data: callData,
            },
            'latest',
          ],
        })) as string;
      } else {
        resultHex = (await this.callRpc('eth_call', [
          { to: asset.contractAddress, data: callData },
          'latest',
        ])) as string;
      }

      if (!resultHex || resultHex === '0x') {
        return { formatted: '0.00', raw: '0' };
      }

      const rawAmount = BigInt(resultHex);
      const decimals = asset.decimals;
      const divisor = BigInt(10 ** Math.min(decimals, 6));
      const formattedAmount = Number(rawAmount / (BigInt(10 ** Math.max(0, decimals - 6)))) / Number(divisor);

      return {
        formatted: formattedAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: decimals === 6 ? 2 : 4,
        }),
        raw: rawAmount.toString(),
      };
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      return { error: errorObj.message || `Failed to read ${asset.symbol} balance on Polygon.` };
    }
  }

  public async sendPayment(payment: Payment, senderAddress: string, customProvider?: unknown): Promise<BlockchainExecutionResult> {
    const provider = (customProvider || (typeof window !== 'undefined' ? (window as unknown as { ethereum?: unknown }).ethereum : null)) as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } | null;

    if (!provider) {
      return {
        success: false,
        code: 'PROVIDER_NOT_FOUND',
        error: 'No Web3 EVM wallet detected. Please connect your wallet to sign transactions.',
      };
    }

    if (!this.isValidAddress(senderAddress)) {
      return {
        success: false,
        code: 'EXECUTION_ERROR',
        error: 'Invalid sender wallet address.',
      };
    }

    if (!this.isValidAddress(payment.merchantWallet)) {
      return {
        success: false,
        code: 'EXECUTION_ERROR',
        error: 'Invalid merchant recipient wallet address on Polygon.',
      };
    }

    // Step 1: Ensure connected wallet is on Polygon Mainnet (Chain ID 137)
    const chainCheck = await this.ensurePolygonChain(provider);
    if (!chainCheck.success) {
      return {
        success: false,
        code: 'NETWORK_MISMATCH',
        error: chainCheck.error || 'Please switch your wallet network to Polygon Mainnet (Chain ID 137).',
      };
    }

    try {
      const tokenSymbolUpper = (payment.token || payment.tokenSymbol || 'POL').toUpperCase();
      const isNativePol = tokenSymbolUpper === 'POL' && (!payment.tokenContract || payment.standard === 'NATIVE');

      if (isNativePol) {
        // Native POL Payment via eth_sendTransaction
        const decimals = payment.decimals || 18;
        const amountWei = parseTokenUnits(payment.amount, decimals);

        const txParams = {
          from: senderAddress,
          to: payment.merchantWallet,
          value: '0x' + amountWei.toString(16),
        };

        const txHash = (await provider.request({
          method: 'eth_sendTransaction',
          params: [txParams],
        })) as string;

        if (!txHash || !this.isValidTxHash(txHash)) {
          return {
            success: false,
            code: 'EXECUTION_ERROR',
            error: 'Wallet did not return a valid transaction hash.',
          };
        }

        return {
          success: true,
          txHash,
        };
      }

      // ERC-20 Token Payment (e.g. USDT, VERSE, USDC on Polygon)
      let contractAddress = payment.tokenContract;
      let decimals = payment.decimals;

      if (!contractAddress) {
        if (tokenSymbolUpper === 'USDT') {
          contractAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
          decimals = 6;
        } else if (tokenSymbolUpper === 'VERSE') {
          contractAddress = '0xc708D6F2153933DAA50B2D0758955Be0A93A8FEc';
          decimals = 18;
        } else {
          return {
            success: false,
            code: 'EXECUTION_ERROR',
            error: `Missing token contract configuration for ${payment.token} on Polygon.`,
          };
        }
      }

      if (!decimals) {
        decimals = tokenSymbolUpper === 'USDT' ? 6 : 18;
      }

      const amountUnits = parseTokenUnits(payment.amount, decimals);
      const callData = encodeErc20Transfer(payment.merchantWallet, amountUnits);

      const txParams = {
        from: senderAddress,
        to: contractAddress,
        data: callData,
        value: '0x0',
      };

      const txHash = (await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      })) as string;

      if (!txHash || !this.isValidTxHash(txHash)) {
        return {
          success: false,
          code: 'EXECUTION_ERROR',
          error: 'Wallet did not return a valid transaction hash.',
        };
      }

      return {
        success: true,
        txHash,
      };
    } catch (err: unknown) {
      const errorObj = err as { code?: number; message?: string };
      if (errorObj.code === 4001) {
        return {
          success: false,
          code: 'USER_REJECTED',
          error: 'Payment transaction was rejected in your wallet.',
        };
      }

      return {
        success: false,
        code: 'EXECUTION_ERROR',
        error: errorObj.message || 'Transaction signing failed in wallet provider.',
      };
    }
  }

  public async verifyPayment(txHash: string, payment: Payment): Promise<BlockchainVerificationResult> {
    const checkedAt = new Date().toISOString();

    if (!this.isValidTxHash(txHash)) {
      return {
        isConfirmed: false,
        status: 'failed',
        txHash,
        error: 'Invalid Polygon transaction hash format. Must be a 66-character hex string starting with 0x.',
        checkedAt,
      };
    }

    try {
      const receipt = await this.getTransactionReceipt(txHash);
      if (!receipt) {
        return {
          isConfirmed: false,
          status: 'pending',
          txHash,
          error: 'Transaction is currently waiting for inclusion in a Polygon block (0 confirmations).',
          checkedAt,
        };
      }

      if (receipt.status === 1 || receipt.status === 0x1) {
        return {
          isConfirmed: true,
          status: 'confirmed',
          blockNumber: receipt.blockNumber,
          txHash: receipt.transactionHash || txHash,
          confirmations: 1,
          checkedAt,
        };
      } else {
        return {
          isConfirmed: false,
          status: 'failed',
          txHash,
          error: 'Transaction execution reverted on Polygon PoS (status: 0).',
          checkedAt,
        };
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      return {
        isConfirmed: false,
        status: 'pending',
        txHash,
        error: errorObj.message || 'Awaiting block confirmation on Polygon.',
        checkedAt,
      };
    }
  }

  public async getTransaction(txHash: string): Promise<{ hash: string; blockNumber?: number; from?: string; to?: string; value?: string } | null> {
    if (!this.isValidTxHash(txHash)) return null;

    try {
      let tx: { hash: string; blockNumber?: string; from?: string; to?: string; value?: string } | null = null;
      if (this.isProviderAvailable()) {
        const ethereum = (window as unknown as { ethereum: { request: (args: { method: string; params: unknown[] }) => Promise<unknown> } }).ethereum;
        tx = (await ethereum.request({
          method: 'eth_getTransactionByHash',
          params: [txHash],
        })) as typeof tx;
      } else {
        tx = (await this.callRpc('eth_getTransactionByHash', [txHash])) as typeof tx;
      }

      if (!tx) return null;
      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : undefined,
        from: tx.from,
        to: tx.to,
        value: tx.value,
      };
    } catch {
      return null;
    }
  }

  public async getTransactionReceipt(txHash: string): Promise<{ status: number; blockNumber: number; transactionHash: string } | null> {
    if (!this.isValidTxHash(txHash)) return null;

    try {
      let receipt: { status: string; blockNumber: string; transactionHash: string } | null = null;
      if (this.isProviderAvailable()) {
        const ethereum = (window as unknown as { ethereum: { request: (args: { method: string; params: unknown[] }) => Promise<unknown> } }).ethereum;
        receipt = (await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })) as typeof receipt;
      } else {
        receipt = (await this.callRpc('eth_getTransactionReceipt', [txHash])) as typeof receipt;
      }

      if (!receipt) return null;
      return {
        status: parseInt(receipt.status, 16),
        blockNumber: parseInt(receipt.blockNumber, 16),
        transactionHash: receipt.transactionHash,
      };
    } catch {
      return null;
    }
  }

  public getExplorerTxUrl(txHash: string): string {
    return `https://polygonscan.com/tx/${txHash}`;
  }

  public getExplorerAddressUrl(address: string): string {
    return `https://polygonscan.com/address/${address}`;
  }

  public isValidAddress(address?: string): boolean {
    return isValidEvmAddress(address);
  }

  public isValidTxHash(txHash?: string): boolean {
    return isValidTxHash(txHash);
  }
}
