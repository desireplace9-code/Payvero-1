import { useState, useEffect, useCallback, useRef } from 'react';
import { WalletState } from '../types';
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

export function useWallet() {
  const [walletState, setWalletState] = useState<
    WalletState & { connectorType?: WalletConnectorType | null; walletId?: string | null; walletName?: string | null }
  >({
    isConnected: false,
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
    providerName: null,
    connectorType: null,
    walletId: null,
    walletName: null,
  });

  const activeProviderRef = useRef<Eip1193Provider | null>(null);

  const connect = useCallback(async (connectorType: WalletConnectorType = 'injected', options?: ConnectOptions) => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

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

        const providerLabel =
          session.connectorType === 'walletconnect'
            ? session.walletName
              ? `${session.walletName} (WalletConnect)`
              : 'Mobile WalletConnect'
            : 'Browser Web3 Provider';

        setWalletState({
          isConnected: true,
          address: session.address,
          chainId: session.chainId,
          isConnecting: false,
          error: null,
          providerName: providerLabel,
          connectorType: session.connectorType,
          walletId: session.walletId || null,
          walletName: session.walletName || null,
        });

        return { success: true, address: session.address, chainId: session.chainId };
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to connect wallet.';
        setWalletState((prev) => ({
          ...prev,
          isConnecting: false,
          error: errorMsg,
        }));
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const errorMessage = errorObj.message || 'Failed to connect wallet.';

      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  const abortConnection = useCallback(() => {
    abortWalletConnectPairing();
    setWalletState((prev) => ({ ...prev, isConnecting: false }));
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

    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
      providerName: null,
      connectorType: null,
      walletId: null,
      walletName: null,
    });
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    if (!activeProviderRef.current) {
      return { success: false, error: 'No active wallet connection to switch networks.' };
    }

    const res = await switchWalletChain(activeProviderRef.current, targetChainId);
    if (res.success) {
      setWalletState((prev) => ({
        ...prev,
        chainId: targetChainId,
        error: null,
      }));
    } else if (res.error) {
      setWalletState((prev) => ({ ...prev, error: res.error || 'Network switch failed.' }));
    }
    return res;
  }, []);

  const clearError = useCallback(() => {
    setWalletState((prev) => ({ ...prev, error: null }));
  }, []);

  // Event listeners
  useEffect(() => {
    const provider = activeProviderRef.current;
    if (!provider || !provider.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (!accs || accs.length === 0) {
        disconnect();
      } else if (isValidEvmAddress(accs[0])) {
        setWalletState((prev) => ({
          ...prev,
          address: accs[0],
          error: null,
        }));
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const parsedChainId =
        typeof chainIdHex === 'number' ? chainIdHex : parseInt(chainIdHex as string, 16);
      setWalletState((prev) => ({
        ...prev,
        chainId: parsedChainId,
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
  }, [disconnect, walletState.isConnected]);

  return {
    ...walletState,
    connect,
    abortConnection,
    disconnect,
    switchChain,
    clearError,
    isProviderAvailable: isInjectedAvailable(),
    isWalletConnectConfigured: isWalletConnectConfigured(),
    networkName: getChainName(walletState.chainId),
  };
}
