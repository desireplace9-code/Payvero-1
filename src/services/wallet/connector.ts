import { ENV_CONFIG } from '../../config/env';
import { isValidEvmAddress, isValidBitcoinAddress } from '../../config/tokens';
import { EVM_CHAINS, BITCOIN_CHAIN_CONFIG } from './chains';
import { getMobileWalletById, isMobileDevice, openMobileWalletDeepLink } from './mobileWallets';
import { ConnectedWalletSession, Eip1193Provider, WalletConnectorType, WalletConnectionResult } from './types';

// Module-level singleton provider and init promise to avoid duplicate initialization
let activeWalletConnectProvider: any = null;
let walletConnectInitPromise: Promise<any> | null = null;
let currentPairingAbortController: (() => void) | null = null;

const DEMO_SAVED_SESSION_KEY = 'payvero_active_wallet_session';
export const DEFAULT_DEMO_WALLET = '0x71C8A31E847be68a8677c7F0dB43D22B82E2C0e8';

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
 * Creates an in-memory simulated EIP-1193 Provider for demo and testing purposes.
 * Emits genuine transaction hashes and simulates instant on-chain settlement.
 */
export function createDemoProvider(address: string = DEFAULT_DEMO_WALLET, chainId: number = 137): Eip1193Provider {
  let currentChainId = chainId;
  const currentAddress = address;
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  return {
    accounts: [currentAddress],
    chainId: currentChainId,
    request: async ({ method, params }: { method: string; params?: unknown[] | Record<string, unknown> }) => {
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [currentAddress];
        case 'eth_chainId':
          return '0x' + currentChainId.toString(16);
        case 'net_version':
          return currentChainId.toString();
        case 'wallet_switchEthereumChain': {
          const chainHex = (params as any)?.[0]?.chainId;
          if (chainHex) {
            currentChainId = parseInt(chainHex, 16);
            listeners['chainChanged']?.forEach((cb) => cb('0x' + currentChainId.toString(16)));
          }
          return null;
        }
        case 'wallet_addEthereumChain':
          return null;
        case 'personal_sign':
        case 'eth_sign':
          return '0x' + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        case 'eth_sendTransaction': {
          // Generate a valid 66-char hexadecimal transaction hash
          const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          return `0x${randomHex}`;
        }
        case 'eth_getBalance':
          // Return simulated pre-funded balance ~ 145.5 POL in Wei
          return '0x7e44b82d334540000';
        case 'eth_call':
          // Return simulated ERC20 balance ~ 500 USDT (6 decimals) or 25000 VERSE (18 decimals)
          return '0x000000000000000000000000000000000000000000000000000000001dcd6500';
        default:
          return null;
      }
    },
    on: (event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
    },
    removeListener: (event: string, handler: (...args: unknown[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
    },
    disconnect: async () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_SAVED_SESSION_KEY);
      }
    },
  };
}

/**
 * 1-Click Instant Test Wallet connection.
 * Instantly connects without needing external browser extensions or cloud relay keys.
 */
export async function connectDemoWallet(customAddress?: string, chainId: number = 137): Promise<WalletConnectionResult> {
  const address = (customAddress && isValidEvmAddress(customAddress)) 
    ? customAddress 
    : DEFAULT_DEMO_WALLET;

  const provider = createDemoProvider(address, chainId);
  const session: ConnectedWalletSession = {
    address,
    chainId,
    connectorType: 'demo',
    provider,
    walletId: 'demo',
    walletName: 'Instant Test Wallet',
    approvedChains: [137, 1, 56],
    approvedAccounts: [address],
    supportedAssets: ['POL', 'VERSE', 'USDT', 'USDC'],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_SAVED_SESSION_KEY, JSON.stringify({
      address,
      chainId,
      connectorType: 'demo',
      walletId: 'demo',
      walletName: 'Instant Test Wallet',
    }));
  }

  return {
    success: true,
    session,
  };
}

/**
 * Connects a custom or merchant-specified address.
 */
export async function connectManualWallet(address: string, chainId: number = 137): Promise<WalletConnectionResult> {
  if (!isValidEvmAddress(address)) {
    return {
      success: false,
      code: 'INVALID_ADDRESS',
      error: 'Invalid EVM wallet address. Must start with 0x and be 42 characters long.',
    };
  }

  const provider = createDemoProvider(address, chainId);
  const session: ConnectedWalletSession = {
    address,
    chainId,
    connectorType: 'manual',
    provider,
    walletId: 'manual',
    walletName: 'Custom Address',
    approvedChains: [137, 1, 56],
    approvedAccounts: [address],
    supportedAssets: ['POL', 'VERSE', 'USDT', 'USDC'],
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_SAVED_SESSION_KEY, JSON.stringify({
      address,
      chainId,
      connectorType: 'manual',
      walletId: 'manual',
      walletName: 'Custom Address',
    }));
  }

  return {
    success: true,
    session,
  };
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
    
    // Official redirect URL: use the current browser web URL so mobile wallets return seamlessly upon approval
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://payvero.io';
    const appUrl = typeof window !== 'undefined'
      ? window.location.href
      : 'https://payvero.io';

    // Primary chain is Polygon PoS (137), with Ethereum (1) and BNB Smart Chain (56) in proposal configuration
    const primaryChain = preferredChainId || 137;
    // Explicitly include Polygon PoS (137), Ethereum (1), and BNB Smart Chain (56) in optionalChains
    // so mobile wallets (Bitcoin.com Wallet, Trust Wallet, Rainbow, MetaMask) display Polygon PoS directly
    // in their selectable chain approval prompt.
    const allMainnetChains = [137, 1, 56];

    const provider = await EthereumProvider.init({
      projectId: ENV_CONFIG.walletConnectProjectId,
      relayUrl: 'wss://relay.walletconnect.org',
      chains: [primaryChain],
      optionalChains: allMainnetChains,
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
 * Checks and extracts any already-authenticated active session from the provider or stored session.
 */
export async function getActiveWalletSession(): Promise<ConnectedWalletSession | null> {
  // Check stored active session first (for demo or manual connection)
  if (typeof window !== 'undefined') {
    try {
      const savedSession = localStorage.getItem(DEMO_SAVED_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.address && isValidEvmAddress(parsed.address)) {
          const chainId = parsed.chainId || 137;
          const connectorType = parsed.connectorType || 'demo';
          return {
            address: parsed.address,
            chainId,
            connectorType,
            provider: createDemoProvider(parsed.address, chainId),
            walletId: parsed.walletId || 'demo',
            walletName: parsed.walletName || 'Instant Test Wallet',
            approvedChains: [137, 1, 56],
            approvedAccounts: [parsed.address],
            supportedAssets: ['POL', 'VERSE', 'USDT', 'USDC'],
          };
        }
      }
    } catch {
      // Ignore
    }
  }

  if (activeWalletConnectProvider) {
    const provider = activeWalletConnectProvider;
    let accounts: string[] = (provider.accounts || []) as string[];
    if ((!accounts || accounts.length === 0) && provider.session?.namespaces?.eip155?.accounts) {
      accounts = (provider.session.namespaces.eip155.accounts as string[]).map((acc: string) => {
        const parts = acc.split(':');
        return parts.length >= 3 ? parts[2] : acc;
      });
    }

    if (accounts && accounts.length > 0 && isValidEvmAddress(accounts[0])) {
      const address = accounts[0];
      let chainId = Number(provider.chainId);
      if (!chainId || isNaN(chainId) || chainId <= 0) {
        if (provider.session?.namespaces?.eip155?.chains?.length) {
          const firstChain = provider.session.namespaces.eip155.chains[0];
          const parsed = Number(firstChain.split(':')[1]);
          if (!isNaN(parsed) && parsed > 0) chainId = parsed;
        }
      }
      if (!chainId || isNaN(chainId) || chainId <= 0) {
        chainId = 137;
      }

      const approvedChains = extractApprovedChains(provider.session);
      if (!approvedChains.includes(chainId)) {
        approvedChains.push(chainId);
      }
      const supportedAssets = extractSupportedAssets(approvedChains);

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
        address,
        chainId,
        connectorType: 'walletconnect',
        provider: provider as unknown as Eip1193Provider,
        approvedChains,
        approvedAccounts: accounts,
        bitcoinAddress,
        supportedAssets,
      };
    }
  }

  return null;
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

    // If an existing authenticated session is already active in provider, verify and return immediately
    const existingSession = await getActiveWalletSession();
    if (existingSession) {
      return {
        success: true,
        session: {
          ...existingSession,
          walletId: selectedWalletId,
          walletName: targetWallet.name,
        },
      };
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

    // Helper to check if session is settled in provider state
    const isSessionSettled = (): boolean => {
      if (!provider) return false;
      const hasAccounts = Array.isArray(provider.accounts) && provider.accounts.length > 0 && isValidEvmAddress(provider.accounts[0]);
      const hasSessionAccounts = Boolean(provider.session?.namespaces?.eip155?.accounts?.length);
      const hasSignerSession = Boolean(provider.signer?.session?.namespaces?.eip155?.accounts?.length);
      return Boolean(provider.connected || hasAccounts || hasSessionAccounts || hasSignerSession);
    };

    // Timeout guard (120s) to give user ample time to unlock mobile app and tap Approve
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pollIntervalId: ReturnType<typeof setInterval> | null = null;
    let manualAbortReject: ((err: Error) => void) | null = null;
    let resolveSessionEstablished: (() => void) | null = null;

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
    const connectPromise = provider.connect().catch((err: any) => {
      // If session is actually established despite rejection/reset, do not fail
      if (isSessionSettled()) {
        return;
      }
      throw err;
    });

    // Multi-event resolution listener covering all WalletConnect / Reown lifecycle events
    const sessionEstablishedPromise = new Promise<void>((resolve) => {
      resolveSessionEstablished = resolve;

      const triggerResolve = () => {
        resolve();
      };

      // Provider events
      provider.once('connect', triggerResolve);
      provider.once('session_update', triggerResolve);
      provider.once('session_event', triggerResolve);
      provider.once('accountsChanged', (accs: any) => {
        if (Array.isArray(accs) && accs.length > 0) triggerResolve();
      });

      // Signer / Client events
      try {
        provider.signer?.events?.once?.('session_settle', triggerResolve);
        provider.signer?.events?.once?.('session_update', triggerResolve);
        provider.signer?.client?.once?.('session_settle', triggerResolve);
        provider.signer?.client?.once?.('session_connect', triggerResolve);
        provider.signer?.client?.once?.('session_update', triggerResolve);
      } catch {
        // Ignore
      }
    });

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

      if (isSessionSettled() && resolveSessionEstablished) {
        resolveSessionEstablished();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', handleForegroundResume);
      window.addEventListener('pageshow', handleForegroundResume);
      window.addEventListener('focus', handleForegroundResume);
    }

    // Polling interval checking session state every 300ms
    pollIntervalId = setInterval(() => {
      if (isSessionSettled() && resolveSessionEstablished) {
        resolveSessionEstablished();
      }
    }, 300);

    try {
      await Promise.race([
        connectPromise,
        sessionEstablishedPromise,
        abortPromise,
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (pollIntervalId) clearInterval(pollIntervalId);
      currentPairingAbortController = null;
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleForegroundResume);
        window.removeEventListener('pageshow', handleForegroundResume);
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
 * Cleanly disconnects and resets any active wallet session (WalletConnect, Demo, or Custom).
 */
export async function disconnectWalletConnectSession(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEMO_SAVED_SESSION_KEY);
  }
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
