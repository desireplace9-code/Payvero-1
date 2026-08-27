import { useState, useEffect, useCallback, useRef } from 'react';
import { isValidEvmAddress } from '../config/tokens';
import { 
  connectInjectedWallet, 
  connectWalletConnectSession,
  abortWalletConnectPairing,
  disconnectWalletConnectSession,
  isInjectedAvailable, 
  isWalletConnectConfigured,
  switchWalletChain 
} from '../services/wallet/connector';
import { getChainName } from '../services/wallet/chains';
import { Eip1193Provider, WalletConnectorType, WalletConnectionResult } from '../services/wallet/types';
import { ConnectOptions } from './useCustomerWallet';

export interface MerchantWalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  connectorType: WalletConnectorType | null;
  walletId?: string | null;
  walletName?: string | null;
  isConnecting: boolean;
  error: string | null;
  isProviderAvailable: boolean;
  isWalletConnectConfigured: boolean;
}

/**
 * Dedicated hook for Merchant Receiving Wallet operations.
 * Strictly isolated from customer checkout wallet sessions.
 */
export function useMerchantWallet() {
  const [state, setState] = useState<MerchantWalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    networkName: null,
    connectorType: null,
    walletId: null,
    walletName: null,
    isConnecting: false,
    error: null,
    isProviderAvailable: isInjectedAvailable(),
    isWalletConnectConfigured: isWalletConnectConfigured(),
  });

  const activeProviderRef = useRef<Eip1193Provider | null>(null);

  // Connect merchant receiving wallet
  const connect = useCallback(async (connectorType: WalletConnectorType = 'injected', options?: ConnectOptions) => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const result: WalletConnectionResult =
        connectorType === 'walletconnect'
          ? await connectWalletConnectSession({
              selectedWalletId: options?.selectedWalletId,
              onUriReceived: options?.onUriReceived,
              onStatusChange: options?.onStatusChange,
            })
          : await connectInjectedWallet();

      if (result.success) {
        const { session } = result;
        activeProviderRef.current = session.provider;

        const networkName = getChainName(session.chainId);

        setState({
          isConnected: true,
          address: session.address,
          chainId: session.chainId,
          networkName,
          connectorType: session.connectorType,
          walletId: session.walletId || null,
          walletName: session.walletName || null,
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
        };
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to connect receiving wallet.';
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: errorMsg,
        }));
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const errorMessage = errorObj.message || 'Failed to connect receiving wallet.';

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
      isConnecting: false,
      error: null,
    }));
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    if (!activeProviderRef.current) {
      return { success: false, error: 'No active receiving wallet to switch networks.' };
    }

    const res = await switchWalletChain(activeProviderRef.current, targetChainId);
    if (res.success) {
      setState((prev) => ({
        ...prev,
        chainId: targetChainId,
        networkName: getChainName(targetChainId),
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

  // Listen for account and chain updates on active merchant session
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
          address: accs[0],
          error: null,
        }));
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const parsedChainId =
        typeof chainIdHex === 'number' ? chainIdHex : parseInt(chainIdHex as string, 16);
      setState((prev) => ({
        ...prev,
        chainId: parsedChainId,
        networkName: getChainName(parsedChainId),
      }));
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnect', handleDisconnect);

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
        provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [disconnect, state.isConnected]);

  return {
    ...state,
    connect,
    abortConnection,
    disconnect,
    switchChain,
    clearError,
  };
}
