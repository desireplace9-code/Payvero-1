import { useState, useEffect, useCallback, useRef } from 'react';
import { Payment, BlockchainExecutionResult } from '../types';
import { isValidEvmAddress } from '../config/tokens';
import { blockchainService } from '../services/blockchain';
import { 
  connectInjectedWallet, 
  connectWalletConnectSession,
  connectDemoWallet,
  connectManualWallet,
  abortWalletConnectPairing,
  disconnectWalletConnectSession,
  isInjectedAvailable, 
  isWalletConnectConfigured,
  switchWalletChain,
  getActiveWalletSession
} from '../services/wallet/connector';
import { getChainName, EVM_CHAINS } from '../services/wallet/chains';
import { Eip1193Provider, WalletConnectorType, WalletConnectionResult } from '../services/wallet/types';

export interface CustomerWalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  connectorType: WalletConnectorType | null;
  walletId?: string | null;
  walletName?: string | null;
  approvedChains: number[];
  approvedAccounts: string[];
  bitcoinAddress?: string | null;
  supportedAssets: string[];
  isConnecting: boolean;
  error: string | null;
  isProviderAvailable: boolean;
  isWalletConnectConfigured: boolean;
}

export interface ConnectOptions {
  selectedWalletId?: string;
  preferredChainId?: number;
  customAddress?: string;
  onUriReceived?: (uri: string) => void;
  onStatusChange?: (status: string) => void;
}

/**
 * Dedicated hook for Customer Checkout Wallet operations.
 * Completely isolated from Merchant settings and merchant receiving profile state.
 */
export function useCustomerWallet() {
  const [state, setState] = useState<CustomerWalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: null,
    connectorType: null,
    walletId: null,
    walletName: null,
    approvedChains: [],
    approvedAccounts: [],
    bitcoinAddress: null,
    supportedAssets: [],
    isConnecting: false,
    error: null,
    isProviderAvailable: isInjectedAvailable(),
    isWalletConnectConfigured: isWalletConnectConfigured(),
  });

  const activeProviderRef = useRef<Eip1193Provider | null>(null);

  // Synchronize state with any active or restored session
  const syncSession = useCallback(async () => {
    try {
      const activeSession = await getActiveWalletSession();
      if (activeSession && activeSession.address) {
        activeProviderRef.current = activeSession.provider;
        const networkName = getChainName(activeSession.chainId);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: activeSession.address,
          chainId: activeSession.chainId,
          networkName,
          connectorType: activeSession.connectorType,
          approvedChains: activeSession.approvedChains,
          approvedAccounts: activeSession.approvedAccounts,
          bitcoinAddress: activeSession.bitcoinAddress || null,
          supportedAssets: activeSession.supportedAssets,
          isConnecting: false,
          error: null,
        }));
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  }, []);

  // Sync session on mount and when browser returns to foreground (tab resume / app switch)
  useEffect(() => {
    syncSession();

    const handleResume = () => {
      syncSession();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', handleResume);
      window.addEventListener('pageshow', handleResume);
      window.addEventListener('focus', handleResume);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleResume);
        window.removeEventListener('pageshow', handleResume);
        window.removeEventListener('focus', handleResume);
      }
    };
  }, [syncSession]);

  // Connect customer wallet either via Injected Extension, WalletConnect Mobile, or Instant Demo Wallet
  const connect = useCallback(async (connectorType: WalletConnectorType = 'injected', options?: ConnectOptions) => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      let result: WalletConnectionResult;
      if (connectorType === 'demo') {
        result = await connectDemoWallet(options?.customAddress, options?.preferredChainId || 137);
      } else if (connectorType === 'manual') {
        result = await connectManualWallet(options?.customAddress || '', options?.preferredChainId || 137);
      } else if (connectorType === 'walletconnect') {
        result = await connectWalletConnectSession({
          selectedWalletId: options?.selectedWalletId,
          preferredChainId: options?.preferredChainId || 137,
          onUriReceived: options?.onUriReceived,
          onStatusChange: options?.onStatusChange,
        });
      } else {
        result = await connectInjectedWallet();
      }

      if (result.success) {
        const { session } = result;
        activeProviderRef.current = session.provider;

        const networkName = getChainName(session.chainId);
        const approvedChains = session.approvedChains || [session.chainId];
        const approvedAccounts = session.approvedAccounts || [session.address];
        const supportedAssets = session.supportedAssets || ['POL', 'VERSE', 'USDT', 'USDC'];

        setState({
          isConnected: true,
          address: session.address,
          chainId: session.chainId,
          networkName,
          connectorType: session.connectorType,
          walletId: session.walletId || null,
          walletName: session.walletName || null,
          approvedChains,
          approvedAccounts,
          bitcoinAddress: session.bitcoinAddress || null,
          supportedAssets,
          isConnecting: false,
          error: null,
          isProviderAvailable: isInjectedAvailable(),
          isWalletConnectConfigured: isWalletConnectConfigured(),
        });

        return {
          success: true,
          address: session.address,
          chainId: session.chainId,
          networkName,
          connectorType: session.connectorType,
          approvedChains,
          supportedAssets,
        };
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to connect customer wallet.';
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: errorMsg,
        }));
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const errorMessage = errorObj.message || 'Failed to connect customer wallet.';

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  const abortConnection = useCallback(() => {
    abortWalletConnectPairing();
    setState((prev) => ({ ...prev, isConnecting: false }));
  }, []);

  const disconnect = useCallback(async () => {
    if (activeProviderRef.current?.disconnect) {
      try {
        await activeProviderRef.current.disconnect();
      } catch {
        // Ignore disconnect cleanup errors
      }
    }
    await disconnectWalletConnectSession();
    activeProviderRef.current = null;

    setState((prev) => ({
      ...prev,
      isConnected: false,
      address: null,
      chainId: null,
      networkName: null,
      connectorType: null,
      walletId: null,
      walletName: null,
      approvedChains: [],
      approvedAccounts: [],
      bitcoinAddress: null,
      supportedAssets: [],
      isConnecting: false,
      error: null,
    }));
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    if (!activeProviderRef.current) {
      return { success: false, error: 'No active wallet connection to switch networks.' };
    }

    const res = await switchWalletChain(activeProviderRef.current, targetChainId);
    if (res.success) {
      const targetMeta = EVM_CHAINS[targetChainId];
      const newAssets = targetMeta?.supportedTokens || ['POL', 'VERSE', 'USDT', 'USDC'];

      setState((prev) => ({
        ...prev,
        chainId: targetChainId,
        networkName: getChainName(targetChainId),
        supportedAssets: Array.from(new Set([...prev.supportedAssets, ...newAssets])),
        error: null,
      }));
    } else if (res.error) {
      setState((prev) => ({ ...prev, error: res.error || 'Network switch failed.' }));
    }
    return res;
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Send payment with the connected customer provider
  const sendPayment = useCallback(
    async (payment: Payment): Promise<BlockchainExecutionResult> => {
      if (!state.isConnected || !state.address) {
        return {
          success: false,
          code: 'NOT_CONFIGURED',
          error: 'Customer wallet is not connected.',
        };
      }

      // Delegate to blockchainService which executes against active EIP-1193 provider
      return blockchainService.sendPayment(payment, state.address, activeProviderRef.current);
    },
    [state.isConnected, state.address]
  );

  // Real-time Event listeners for active customer session
  useEffect(() => {
    const provider = activeProviderRef.current;
    if (!provider || !provider.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (!accs || accs.length === 0) {
        disconnect();
      } else if (isValidEvmAddress(accs[0])) {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: accs[0],
          approvedAccounts: accs,
          error: null,
        }));
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const parsedChainId =
        typeof chainIdHex === 'number' ? chainIdHex : parseInt(chainIdHex as string, 16);
      
      const targetMeta = EVM_CHAINS[parsedChainId];
      const newAssets = targetMeta?.supportedTokens || ['POL', 'VERSE', 'USDT', 'USDC'];

      setState((prev) => ({
        ...prev,
        isConnected: true,
        chainId: parsedChainId,
        networkName: getChainName(parsedChainId),
        supportedAssets: Array.from(new Set([...prev.supportedAssets, ...newAssets])),
      }));
    };

    const handleConnect = () => {
      syncSession();
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('connect', handleConnect);
    provider.on('disconnect', handleDisconnect);

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('connect', handleConnect);
        provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [disconnect, state.isConnected, syncSession]);

  return {
    ...state,
    connect,
    abortConnection,
    disconnect,
    switchChain,
    clearError,
    sendPayment,
  };
}
