export interface MobileWalletInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  color: string;
  universalLinkPrefix: string | null;
  nativeLinkPrefix: string;
  androidPackage?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export const SUPPORTED_MOBILE_WALLETS: MobileWalletInfo[] = [
  {
    id: 'bitcoin-com',
    name: 'Bitcoin.com Wallet',
    shortName: 'Bitcoin.com',
    description: 'Multi-chain Web3 & Verse DeFi wallet',
    badge: 'Certified WC',
    badgeColor: 'emerald',
    color: '#0AC18E',
    universalLinkPrefix: 'https://wallet.bitcoin.com/wc',
    nativeLinkPrefix: 'bitcoincom://wc',
    androidPackage: 'com.bitcoin.mwallet',
    appStoreUrl: 'https://apps.apple.com/app/bitcoin-com-crypto-defi-wallet/id1252720520',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.bitcoin.mwallet',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    shortName: 'Trust Wallet',
    description: 'Multi-chain mobile self-custody wallet',
    badge: 'Popular',
    badgeColor: 'blue',
    color: '#0500FF',
    universalLinkPrefix: 'https://link.trustwallet.com/wc',
    nativeLinkPrefix: 'trust://wc',
    androidPackage: 'com.wallet.crypto.trustapp',
    appStoreUrl: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
  },
  {
    id: 'metamask',
    name: 'MetaMask Mobile',
    shortName: 'MetaMask',
    description: 'Premier Ethereum & EVM mobile wallet',
    badge: 'Most Used',
    badgeColor: 'amber',
    color: '#F6851B',
    universalLinkPrefix: 'https://metamask.app.link/wc',
    nativeLinkPrefix: 'metamask://wc',
    androidPackage: 'io.metamask',
    appStoreUrl: 'https://apps.apple.com/app/metamask-blockchain-wallet/id1438144201',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=io.metamask',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    shortName: 'Rainbow',
    description: 'Fast, delightful Web3 & Polygon wallet',
    badge: 'Fast',
    badgeColor: 'purple',
    color: '#E02020',
    universalLinkPrefix: 'https://rnbwapp.com/wc',
    nativeLinkPrefix: 'rainbow://wc',
    androidPackage: 'me.rainbow',
    appStoreUrl: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=me.rainbow',
  },
  {
    id: 'zerion',
    name: 'Zerion',
    shortName: 'Zerion',
    description: 'Smart DeFi portfolio & Web3 wallet',
    badge: 'DeFi',
    badgeColor: 'cyan',
    color: '#2962FF',
    universalLinkPrefix: 'https://wallet.zerion.io/wc',
    nativeLinkPrefix: 'zerion://wc',
    androidPackage: 'io.zerion.android',
    appStoreUrl: 'https://apps.apple.com/app/zerion-crypto-defi-wallet/id1456732565',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=io.zerion.android',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    shortName: 'Coinbase',
    description: 'Self-custody mobile crypto wallet',
    badge: 'EVM',
    badgeColor: 'blue',
    color: '#0052FF',
    universalLinkPrefix: 'https://go.cb-w.com/wc',
    nativeLinkPrefix: 'cbwallet://wc',
    androidPackage: 'org.toshi',
    appStoreUrl: 'https://apps.apple.com/app/coinbase-wallet-nfts-crypto/id1278383455',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=org.toshi',
  },
  {
    id: 'generic',
    name: 'Any Web3 Wallet / QR',
    shortName: 'Any Wallet',
    description: 'Scan or connect with any WalletConnect v2 app',
    badge: 'Universal',
    badgeColor: 'emerald',
    color: '#20E56B',
    universalLinkPrefix: null,
    nativeLinkPrefix: 'wc:',
  },
];

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isTouchScreen = navigator.maxTouchPoints > 1;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
  return mobileRegex.test(ua) || (isTouchScreen && /Macintosh/i.test(ua));
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
}

export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function getMobileWalletById(id?: string | null): MobileWalletInfo {
  if (!id) return SUPPORTED_MOBILE_WALLETS[0];
  const found = SUPPORTED_MOBILE_WALLETS.find((w) => w.id === id);
  return found || SUPPORTED_MOBILE_WALLETS[0];
}

/**
 * Formats the deep link URL for a target mobile wallet and real WalletConnect v2 pairing URI.
 * Implements official WalletConnect v2 specifications for Native Schemes, Universal Links, and Android Intents.
 */
export function formatWalletDeepLink(
  wallet: MobileWalletInfo,
  wcUri: string,
  mode: 'universal' | 'native' | 'intent' | 'optimal' = 'optimal'
): string {
  if (!wcUri) return '';
  const encodedUri = encodeURIComponent(wcUri);

  if (wallet.id === 'generic' || wallet.nativeLinkPrefix === 'wc:') {
    return wcUri.startsWith('wc:') ? wcUri : `wc:${encodedUri}`;
  }

  // Android Intent URI for guaranteed Android OS package routing
  if (mode === 'intent' && wallet.androidPackage) {
    const scheme = wallet.nativeLinkPrefix.replace('://wc', '').replace('://', '');
    return `intent://wc?uri=${encodedUri}#Intent;scheme=${scheme};package=${wallet.androidPackage};end`;
  }

  if (mode === 'universal' && wallet.universalLinkPrefix) {
    return `${wallet.universalLinkPrefix}?uri=${encodedUri}`;
  }

  if (mode === 'native') {
    return `${wallet.nativeLinkPrefix}?uri=${encodedUri}`;
  }

  // 'optimal' mode: chooses the most reliable linking format per OS
  if (isAndroid()) {
    // For Android, native scheme triggers the app's registered intent filter directly
    return `${wallet.nativeLinkPrefix}?uri=${encodedUri}`;
  }

  if (isIOS() && wallet.universalLinkPrefix) {
    // For iOS, Universal Links provide the seamless Apple-certified handoff
    return `${wallet.universalLinkPrefix}?uri=${encodedUri}`;
  }

  // Default fallback
  return wallet.universalLinkPrefix
    ? `${wallet.universalLinkPrefix}?uri=${encodedUri}`
    : `${wallet.nativeLinkPrefix}?uri=${encodedUri}`;
}

/**
 * Executes the external app navigation using the correct mobile linking mechanism.
 * Handles mobile browser restrictions, direct user gestures, and iframe sandboxes.
 */
export function executeWalletDeepLink(url: string): void {
  if (!url || typeof window === 'undefined') return;

  // 1. If in top-level window (production or standalone tab), standard window.location.href
  // performs the native app handoff immediately on mobile browsers.
  if (!isInIframe()) {
    try {
      window.location.href = url;
      return;
    } catch {
      // Fallback to anchor click
    }
  }

  // 2. Programmatic click on anchor element
  try {
    const link = document.createElement('a');
    link.href = url;
    link.rel = 'noopener noreferrer';
    // If inside an iframe, use _top or _blank to escape sandbox restrictions
    if (isInIframe()) {
      link.target = '_blank';
    }
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 500);
  } catch {
    // Fallback
    try {
      window.location.assign(url);
    } catch {
      // Final fallback
    }
  }
}

/**
 * Dispatches deep link for the specified mobile wallet with real pairing URI.
 */
export function openMobileWalletDeepLink(
  wallet: MobileWalletInfo,
  wcUri: string
): { universalLink: string; nativeLink: string; optimalLink: string } {
  const universalLink = formatWalletDeepLink(wallet, wcUri, 'universal');
  const nativeLink = formatWalletDeepLink(wallet, wcUri, 'native');
  const optimalLink = formatWalletDeepLink(wallet, wcUri, 'optimal');

  if (typeof window !== 'undefined' && wcUri && wcUri.startsWith('wc:')) {
    const targetLink = optimalLink || nativeLink || universalLink;
    if (targetLink && targetLink.length > 0) {
      executeWalletDeepLink(targetLink);
    }
  }

  return { universalLink, nativeLink, optimalLink };
}
