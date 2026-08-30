import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isValidEvmAddress } from '../config/tokens';
import { 
  connectInjectedWallet, 
  connectWalletConnectSession,
  abortWalletConnectPairing,
  disconnectWalletConnectSession,
  isInjectedAvailable, 
  isWalletConnectConfigured,
  switchWalletChain,
  getActiveWalletSession
} from '../services/wallet/connector';
import { getChainName } from '../services/wallet/chains';
import { Eip1193Provider, WalletConnectorType, WalletConnectionResult } from '../services/wallet/types';
import { ConnectOptions } from '../hooks/useCustomerWallet';
import { merchantService } from '../services/merchant';

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

export interface MerchantWalletContextValue extends MerchantWalletState {
  connect: (connectorType?: WalletConnectorType, options?: ConnectOptions) => Promise<{
    success: boolean;
    address?: string;
    chainId?: number;
    networkName?: string;
    connectorType?: WalletConnectorType;
    error?: string;
  }>;
  abortConnection: () => void;
  disconnect: () => Promise<void>;
  switchChain: (targetChainId: number) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MerchantWalletContext = createContext<MerchantWalletContextValue | null>(null);

export function MerchantWalletProvider({ children }: { children: React.ReactNode }) {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeProviderRef = useRef<Eip1193Provider | null>(null);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

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
          isConnecting: false,
          error: null,
        }));
        merchantService.updateMerchant({
          walletAddress: activeSession.address,
        });
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

        // Automatically update active merchant receiving address in merchant service
        if (session.address) {
          merchantService.updateMerchant({
            walletAddress: session.address,
          });
        }

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

    merchantService.updateMerchant({
      walletAddress: '',
    });
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
        merchantService.updateMerchant({
          walletAddress: accs[0],
        });
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

  const value: MerchantWalletContextValue = {
    ...state,
    connect,
    abortConnection,
    disconnect,
    switchChain,
    clearError,
    isModalOpen,
    openModal,
    closeModal,
  };

  return (
    <MerchantWalletContext.Provider value={value}>
      {children}
    </MerchantWalletContext.Provider>
  );
}

export function useMerchantWallet() {
  const context = useContext(MerchantWalletContext);
  if (!context) {
    throw new Error('useMerchantWallet must be used within a MerchantWalletProvider');
  }
  return context;
}
