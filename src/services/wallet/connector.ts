import { ENV_CONFIG } from '../../config/env';
import { isValidEvmAddress, isValidBitcoinAddress } from '../../config/tokens';
import { EVM_CHAINS, BITCOIN_CHAIN_CONFIG } from './chains';
import { getMobileWalletById, isMobileDevice, openMobileWalletDeepLink } from './mobileWallets';
import { ConnectedWalletSession, Eip1193Provider, WalletConnectorType, WalletConnectionResult } from './types';

// Module-level singleton provider and init promise to avoid duplicate initialization
let activeWalletConnectProvider: any = null;
let walletConnectInitPromise: Promise<any> | null = null;
let currentPairingAbortController: (() => void) | null = null;

export function isInjectedAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as unknown as { ethereum?: unknown }).ethereum !== 'undefined';
}

export function getInjectedProvider(): Eip1193Provider | null {
  if (!isInjectedAvailable()) return null;
  return (window as unknown as { ethereum: Eip1193Provider }).ethereum;
}

export function isWalletConnectConfigured(): boolean {
  return Boolean(ENV_CONFIG.walletConnectProjectId && ENV_CONFIG.walletConnectProjectId.trim().length > 0);
}

/**
 * Connects to an injected desktop browser wallet (MetaMask, Rabby, Coinbase Wallet, Brave, etc.)
 */
export async function connectInjectedWallet(): Promise<WalletConnectionResult> {
  const provider = getInjectedProvider();
  if (!provider) {
    return {
      success: false,
      code: 'NO_INJECTED_PROVIDER',
      error: 'No Web3 EVM wallet extension was detected in this browser. Please install MetaMask, Rabby, or Coinbase Wallet, or choose the Mobile WalletConnect option.',
    };
  }

  try {
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        code: 'NO_ACCOUNTS',
        error: 'No account was authorized in the wallet.',
      };
    }

    const chainIdHex = (await provider.request({ method: 'eth_chainId' })) as string;
    const chainId = parseInt(chainIdHex, 16);
    const address = accounts[0];

    if (!isValidEvmAddress(address)) {
      return {
        success: false,
        code: 'INVALID_ADDRESS',
        error: 'Received an invalid EVM address from the wallet provider.',
      };
    }

    // Determine approved/supported chains for injected wallet
    const supportedAssets = chainId === 137
      ? ['POL', 'VERSE', 'USDT', 'USDC']
      : chainId === 1
      ? ['ETH', 'USDT', 'USDC']
      : chainId === 56
      ? ['BNB', 'USDT']
      : ['POL', 'ETH', 'BNB'];

    return {
      success: true,
      session: {
        address,
        chainId,
        connectorType: 'injected',
        provider,
        approvedChains: [chainId],
        approvedAccounts: accounts,
        supportedAssets,
      },
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: number; message?: string };
    if (errorObj.code === 4001) {
      return {
        success: false,
        code: 'USER_REJECTED',
        error: 'Wallet connection request was rejected in your wallet.',
      };
    }
    return {
      success: false,
      code: 'CONNECTION_FAILED',
      error: errorObj.message || 'Failed to establish connection with injected browser wallet.',
    };
  }
}

/**
 * Initializes and caches the singleton EthereumProvider instance.
 * Advertises Polygon PoS (137), Ethereum Mainnet (1), BNB Smart Chain (56), Arbitrum, Base, Optimism in proposal configuration.
 */
export async function getOrCreateWalletConnectProvider(preferredChainId: number = 137): Promise<any> {
  if (activeWalletConnectProvider) {
    return activeWalletConnectProvider;
  }
  if (walletConnectInitPromise) {
    return walletConnectInitPromise;
  }

  walletConnectInitPromise = (async () => {
    const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
    
    // Official redirect URL: use the clean current page URL so mobile wallets return seamlessly upon approval
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://payvero.io';
    const appUrl = typeof window !== 'undefined'
      ? (window.location.origin + window.location.pathname).replace(/\/$/, '')
      : 'https://payvero.io';

    // Primary chain is Polygon PoS (137), with Ethereum (1) and BNB Smart Chain (56) in proposal configuration
    const primaryChain = preferredChainId || 137;
    const allSupportedChains = [137, 1, 56, 80002];
    const optionalChainsList = allSupportedChains.filter((c) => c !== primaryChain);

    const provider = await EthereumProvider.init({
      projectId: ENV_CONFIG.walletConnectProjectId,
      relayUrl: 'wss://relay.walletconnect.org',
      chains: [primaryChain],
      optionalChains: optionalChainsList,
      methods: [
        'eth_sendTransaction',
        'personal_sign',
      ],
      optionalMethods: [
        'eth_signTransaction',
        'eth_signTypedData',
        'eth_signTypedData_v3',
        'eth_signTypedData_v4',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain',
        'wallet_watchAsset',
        'eth_accounts',
        'eth_requestAccounts',
      ],
      events: [
        'chainChanged',
        'accountsChanged',
      ],
      optionalEvents: [
        'disconnect',
        'session_event',
        'message',
      ],
      showQrModal: false,
      metadata: {
        name: 'Payvero',
        description: 'Multi-Chain Non-Custodial Crypto Payments & Checkout',
        url: appOrigin,
        icons: [`${appOrigin}/icon.png`],
        redirect: {
          native: 'payvero://',
          universal: appUrl,
        },
      },
      rpcMap: {
        137: ENV_CONFIG.polygonRpcUrl || 'https://polygon-rpc.com',
        1: 'https://eth.llamarpc.com',
        56: 'https://bsc-dataseed.binance.org',
        80002: 'https://rpc-amoy.polygon.technology',
        10: 'https://mainnet.optimism.io',
        42161: 'https://arb1.arbitrum.io/rpc',
        8453: 'https://mainnet.base.org',
      },
    });

    activeWalletConnectProvider = provider;
    return provider;
  })();

  try {
    const provider = await walletConnectInitPromise;
    return provider;
  } catch (err) {
    walletConnectInitPromise = null;
    activeWalletConnectProvider = null;
    throw err;
  }
}

export interface ConnectWalletConnectOptions {
  selectedWalletId?: string;
  preferredChainId?: number;
  onUriReceived?: (uri: string) => void;
  onStatusChange?: (status: string) => void;
}

/**
 * Aborts any pending pairing attempt immediately to prevent infinite loading spinners.
 */
export function abortWalletConnectPairing(): void {
  if (currentPairingAbortController) {
    try {
      currentPairingAbortController();
    } catch {
      // Ignore abort errors
    }
    currentPairingAbortController = null;
  }

  if (activeWalletConnectProvider) {
    try {
      const p = activeWalletConnectProvider as { signer?: { abortPairingAttempt?: () => void } };
      p?.signer?.abortPairingAttempt?.();
    } catch {
      // Ignore cleanup error
    }
  }
}

/**
 * Connects via WalletConnect v2 / Reown protocol to mobile crypto wallets
 * (Bitcoin.com Wallet, Trust Wallet, MetaMask Mobile, Rainbow, Zerion, etc.)
 * Generates the real connection proposal URI, launches the mobile wallet app,
 * awaits the authentic session approval event, and extracts multichain accounts & assets.
 */
export async function connectWalletConnectSession(
  options: ConnectWalletConnectOptions = {}
): Promise<WalletConnectionResult> {
  const { selectedWalletId, preferredChainId = 137, onUriReceived, onStatusChange } = options;
  const targetWallet = getMobileWalletById(selectedWalletId);

  if (!isWalletConnectConfigured()) {
    return {
      success: false,
      code: 'MISSING_PROJECT_ID',
      error:
        'WalletConnect requires a free Project ID from Reown (https://cloud.reown.com). Please configure VITE_WALLETCONNECT_PROJECT_ID in your environment variables.',
    };
  }

  let provider: any = null;

  try {
    onStatusChange?.(`Connecting to WalletConnect relay for ${targetWallet.name}...`);
    provider = await getOrCreateWalletConnectProvider(preferredChainId);

    // If an existing authenticated session is already active in provider, verify and return
    if (provider.session && provider.accounts && provider.accounts.length > 0) {
      const address = provider.accounts[0];
      const chainId = Number(provider.chainId) || preferredChainId || 137;

      if (isValidEvmAddress(address)) {
        const approvedChains = extractApprovedChains(provider.session);
        const supportedAssets = extractSupportedAssets(approvedChains);

        return {
          success: true,
          session: {
            address,
            chainId,
            connectorType: 'walletconnect',
            provider: provider as unknown as Eip1193Provider,
            walletId: selectedWalletId,
            walletName: targetWallet.name,
            approvedChains,
            approvedAccounts: provider.accounts,
            supportedAssets,
          },
        };
      }
    }

    // Capture the real pairing URI emitted from WalletConnect relay
    let receivedUri = '';
    const uriHandler = (uri: string) => {
      receivedUri = uri;
      onUriReceived?.(uri);
      onStatusChange?.(`Opening ${targetWallet.name}... Please approve connection proposal.`);

      // Automatically trigger deep link to target mobile wallet
      if (selectedWalletId && selectedWalletId !== 'generic') {
        openMobileWalletDeepLink(targetWallet, uri);
      }
    };

    provider.once('display_uri', uriHandler);

    // Foreground listener: when mobile browser returns to foreground from wallet app,
    // ensure relay transport is actively running and consuming queued session approvals.
    const handleForegroundResume = () => {
      try {
        if (provider?.signer?.client?.core?.relayer) {
          provider.signer.client.core.relayer.restartTransport?.();
        }
      } catch {
        // Ignore
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', handleForegroundResume);
      window.addEventListener('focus', handleForegroundResume);
    }

    // Timeout guard (120s) to give user ample time to unlock mobile app and tap Approve
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let manualAbortReject: ((err: Error) => void) | null = null;

    const abortPromise = new Promise<never>((_, reject) => {
      manualAbortReject = reject;
      timeoutId = setTimeout(() => {
        try {
          provider?.signer?.abortPairingAttempt?.();
        } catch {
          // Ignore
        }
        reject(new Error('CONNECTION_TIMEOUT'));
      }, 120000);
    });

    currentPairingAbortController = () => {
      if (manualAbortReject) {
        try {
          provider?.signer?.abortPairingAttempt?.();
        } catch {
          // Ignore
        }
        manualAbortReject(new Error('USER_CANCELLED'));
      }
    };

    onStatusChange?.(`Awaiting approval in ${targetWallet.name}...`);
    
    // Connect to WalletConnect relay and await session approval
    const connectPromise = provider.connect();

    // Also listen for early connect or accountsChanged events
    const sessionEstablishedPromise = new Promise<void>((resolve) => {
      const onConnectEvent = () => resolve();
      const onAccountsEvent = (accs: any) => {
        if (Array.isArray(accs) && accs.length > 0) resolve();
      };
      provider.once('connect', onConnectEvent);
      provider.once('accountsChanged', onAccountsEvent);
    });

    try {
      await Promise.race([
        connectPromise,
        sessionEstablishedPromise,
        abortPromise,
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      currentPairingAbortController = null;
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleForegroundResume);
        window.removeEventListener('focus', handleForegroundResume);
      }
      try {
        provider.removeListener('display_uri', uriHandler);
      } catch {
        // Ignore listener removal error
      }
    }

    // Extract approved accounts from approved session
    let accounts: string[] = (provider.accounts || []) as string[];
    if ((!accounts || accounts.length === 0) && provider.session?.namespaces?.eip155?.accounts) {
      accounts = (provider.session.namespaces.eip155.accounts as string[]).map((acc: string) => {
        const parts = acc.split(':');
        return parts.length >= 3 ? parts[2] : acc;
      });
    }

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        code: 'NO_ACCOUNTS',
        error: 'No accounts were returned or approved by the mobile wallet.',
      };
    }

    // Resolve active chain ID
    let chainId = Number(provider.chainId);
    if (!chainId || isNaN(chainId) || chainId <= 0) {
      if (provider.session?.namespaces?.eip155?.chains?.length) {
        const firstChain = provider.session.namespaces.eip155.chains[0];
        const parsed = Number(firstChain.split(':')[1]);
        if (!isNaN(parsed) && parsed > 0) chainId = parsed;
      }
    }
    if (!chainId || isNaN(chainId) || chainId <= 0) {
      chainId = preferredChainId || 137;
    }

    const address = accounts[0];

    if (!isValidEvmAddress(address)) {
      return {
        success: false,
        code: 'INVALID_ADDRESS',
        error: 'Received an invalid EVM address from mobile wallet.',
      };
    }

    // Extract approved chains and supported assets
    const approvedChains = extractApprovedChains(provider.session);
    if (!approvedChains.includes(chainId)) {
      approvedChains.push(chainId);
    }
    const supportedAssets = extractSupportedAssets(approvedChains);

    // Extract Bitcoin address if available in session (e.g. from Bitcoin.com Wallet)
    let bitcoinAddress: string | null = null;
    if (provider.session?.namespaces?.bip122?.accounts?.length) {
      const btcAcc = provider.session.namespaces.bip122.accounts[0];
      const parts = btcAcc.split(':');
      const parsedBtc = parts.length >= 3 ? parts[2] : btcAcc;
      if (isValidBitcoinAddress(parsedBtc)) {
        bitcoinAddress = parsedBtc;
        if (!supportedAssets.includes('BTC')) {
          supportedAssets.push('BTC');
        }
      }
    }

    return {
      success: true,
      session: {
        address,
        chainId,
        connectorType: 'walletconnect',
        provider: provider as unknown as Eip1193Provider,
        walletId: selectedWalletId,
        walletName: targetWallet.name,
        approvedChains,
        approvedAccounts: accounts,
        bitcoinAddress,
        supportedAssets,
      },
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: number; message?: string };
    const errorMsg = (errorObj.message || '').toLowerCase();

    // Clean up any pending pairing attempt so subsequent clicks start cleanly
    try {
      if (provider?.signer?.abortPairingAttempt) {
        provider.signer.abortPairingAttempt();
      }
    } catch {
      // Ignore cleanup error
    }

    if (
      errorObj.code === 4001 ||
      errorObj.code === 5000 ||
      errorMsg.includes('user rejected') ||
      errorMsg.includes('user closed') ||
      errorMsg.includes('user_cancelled') ||
      errorMsg.includes('connection request reset') ||
      errorMsg.includes('pairing attempt aborted')
    ) {
      return {
        success: false,
        code: 'USER_REJECTED',
        error: 'Connection was cancelled or rejected in your wallet.',
      };
    }

    if (errorMsg.includes('connection_timeout')) {
      return {
        success: false,
        code: 'TIMEOUT',
        error: 'WalletConnect pairing timed out. Please tap your mobile wallet again.',
      };
    }

    if (
      errorMsg.includes('socket') ||
      errorMsg.includes('relay') ||
      errorMsg.includes('project not found') ||
      errorMsg.includes('unauthorized') ||
      errorMsg.includes('failed to fetch')
    ) {
      activeWalletConnectProvider = null;
      walletConnectInitPromise = null;

      return {
        success: false,
        code: 'RELAY_CONNECTION_ERROR',
        error:
          'Could not connect to the WalletConnect relay server. Please check network connection and verify VITE_WALLETCONNECT_PROJECT_ID.',
      };
    }

    // Reset cached provider on general errors to avoid stale state
    activeWalletConnectProvider = null;
    walletConnectInitPromise = null;

    return {
      success: false,
      code: 'WALLETCONNECT_ERROR',
      error: errorObj.message || 'Failed to connect with mobile wallet via WalletConnect.',
    };
  }
}

/**
 * Extracts list of numeric chain IDs approved in the session.
 */
function extractApprovedChains(session: any): number[] {
  const chains: number[] = [];
  if (!session?.namespaces?.eip155) {
    return [137];
  }

  const eip155 = session.namespaces.eip155;
  if (Array.isArray(eip155.chains)) {
    for (const c of eip155.chains) {
      const id = Number(c.replace('eip155:', ''));
      if (!isNaN(id) && !chains.includes(id)) {
        chains.push(id);
      }
    }
  }

  // Also extract chain IDs from accounts array (format: eip155:137:0x...)
  if (Array.isArray(eip155.accounts)) {
    for (const acc of eip155.accounts) {
      const parts = acc.split(':');
      if (parts.length >= 3) {
        const id = Number(parts[1]);
        if (!isNaN(id) && !chains.includes(id)) {
          chains.push(id);
        }
      }
    }
  }

  return chains.length > 0 ? chains : [137];
}

/**
 * Extracts list of supported asset symbols for approved chains.
 */
function extractSupportedAssets(approvedChains: number[]): string[] {
  const assetSet = new Set<string>();

  for (const chainId of approvedChains) {
    const meta = EVM_CHAINS[chainId];
    if (meta?.supportedTokens) {
      for (const token of meta.supportedTokens) {
        assetSet.add(token);
      }
    }
  }

  // Default fallback if set is empty
  if (assetSet.size === 0) {
    return ['POL', 'VERSE', 'USDT', 'USDC'];
  }

  return Array.from(assetSet);
}

/**
 * Backwards-compatible alias for default modal connection.
 */
export async function connectWalletConnectModal(selectedWalletId?: string): Promise<WalletConnectionResult> {
  return connectWalletConnectSession({ selectedWalletId });
}

/**
 * Cleanly disconnects and resets the active WalletConnect session.
 */
export async function disconnectWalletConnectSession(): Promise<void> {
  try {
    if (activeWalletConnectProvider) {
      const prev = activeWalletConnectProvider as { disconnect?: () => Promise<void> };
      if (prev.disconnect) {
        await prev.disconnect();
      }
      activeWalletConnectProvider = null;
      walletConnectInitPromise = null;
    }
  } catch {
    // Ignore disconnect errors
  }
}

/**
 * Universal network switch handler for both Injected and WalletConnect providers.
 */
export async function switchWalletChain(
  provider: Eip1193Provider,
  targetChainId: number
): Promise<{ success: boolean; error?: string }> {
  const chainMeta = EVM_CHAINS[targetChainId];
  if (!chainMeta) {
    return {
      success: false,
      error: `Unsupported network chain ID: ${targetChainId}. Supported EVM chains: Polygon (137), Ethereum (1), BNB Chain (56).`,
    };
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainMeta.hexChainId }],
    });
    return { success: true };
  } catch (switchError: unknown) {
    const err = switchError as { code?: number; data?: { originalError?: { code?: number } }; message?: string };

    if (err.code === 4902 || err.data?.originalError?.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainMeta.hexChainId,
              chainName: chainMeta.name,
              nativeCurrency: chainMeta.nativeCurrency,
              rpcUrls: chainMeta.rpcUrls,
              blockExplorerUrls: chainMeta.blockExplorerUrls,
            },
          ],
        });
        return { success: true };
      } catch (addError: unknown) {
        const addErr = addError as { message?: string; code?: number };
        if (addErr.code === 4001) {
          return { success: false, error: `Network switch to ${chainMeta.name} was rejected in your wallet.` };
        }
        return { success: false, error: addErr.message || `Failed to add ${chainMeta.name} to wallet.` };
      }
    }

    if (err.code === 4001) {
      return { success: false, error: `Network switch to ${chainMeta.name} was rejected in your wallet.` };
    }

    return { success: false, error: err.message || `Failed to switch wallet to ${chainMeta.name}.` };
  }
}
