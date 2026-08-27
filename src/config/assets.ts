import { ChainConfig, NetworkId, PaymentAsset } from '../services/chains/types';
import { ENV_CONFIG } from './env';

export const SUPPORTED_NETWORKS: Record<string, ChainConfig> = {
  polygon: {
    id: 'polygon',
    name: 'Polygon PoS',
    shortName: 'Polygon',
    networkType: 'evm',
    chainId: 137,
    nativeSymbol: 'POL',
    nativeName: 'Polygon POL',
    nativeDecimals: 18,
    isImplemented: true,
    isConfigured: true,
    rpcUrl: ENV_CONFIG.polygonRpcUrl,
    explorerBaseUrl: 'https://polygonscan.com',
    explorerTxUrl: (txHash: string) => `https://polygonscan.com/tx/${txHash}`,
    explorerAddressUrl: (address: string) => `https://polygonscan.com/address/${address}`,
    color: '#8247E5',
    iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    networkType: 'evm',
    chainId: 1,
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    nativeDecimals: 18,
    isImplemented: false,
    isConfigured: false,
    explorerBaseUrl: 'https://etherscan.io',
    explorerTxUrl: (txHash: string) => `https://etherscan.io/tx/${txHash}`,
    explorerAddressUrl: (address: string) => `https://etherscan.io/address/${address}`,
    color: '#627EEA',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
  bnb: {
    id: 'bnb',
    name: 'BNB Smart Chain',
    shortName: 'BNB Chain',
    networkType: 'evm',
    chainId: 56,
    nativeSymbol: 'BNB',
    nativeName: 'BNB',
    nativeDecimals: 18,
    isImplemented: false,
    isConfigured: false,
    explorerBaseUrl: 'https://bscscan.com',
    explorerTxUrl: (txHash: string) => `https://bscscan.com/tx/${txHash}`,
    explorerAddressUrl: (address: string) => `https://bscscan.com/address/${address}`,
    color: '#F3BA2F',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  tron: {
    id: 'tron',
    name: 'Tron Network',
    shortName: 'Tron',
    networkType: 'tron',
    nativeSymbol: 'TRX',
    nativeName: 'TRON',
    nativeDecimals: 6,
    isImplemented: false,
    isConfigured: false,
    explorerBaseUrl: 'https://tronscan.org',
    explorerTxUrl: (txHash: string) => `https://tronscan.org/#/transaction/${txHash}`,
    explorerAddressUrl: (address: string) => `https://tronscan.org/#/address/${address}`,
    color: '#FF0013',
    iconBg: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin Network',
    shortName: 'Bitcoin',
    networkType: 'bitcoin',
    nativeSymbol: 'BTC',
    nativeName: 'Bitcoin',
    nativeDecimals: 8,
    isImplemented: false,
    isConfigured: false,
    explorerBaseUrl: 'https://mempool.space',
    explorerTxUrl: (txHash: string) => `https://mempool.space/tx/${txHash}`,
    explorerAddressUrl: (address: string) => `https://mempool.space/address/${address}`,
    color: '#F7931A',
    iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
};

export const PAYMENT_ASSETS: Record<string, PaymentAsset> = {
  // --- REAL & IMPLEMENTED (Polygon PoS) ---
  'pol-polygon': {
    id: 'pol-polygon',
    symbol: 'POL',
    name: 'POL (Polygon Native)',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'NATIVE',
    contractAddress: '0x0000000000000000000000000000000000001010',
    decimals: 18,
    isNative: true,
    explorerUrl: 'https://polygonscan.com',
    enabled: true,
    isImplemented: true,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'polygon',
    color: '#8247E5',
    iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  'usdt-polygon': {
    id: 'usdt-polygon',
    symbol: 'USDT',
    name: 'Tether USD (PoS)',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'ERC20',
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    isNative: false,
    explorerUrl: 'https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    enabled: true,
    isImplemented: true,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'polygon',
    color: '#26A17B',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  'verse-polygon': {
    id: 'verse-polygon',
    symbol: 'VERSE',
    name: 'VERSE (fxVERSE)',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'ERC20',
    contractAddress: '0xc708D6F2153933DAA50B2D0758955Be0A93A8FEc',
    decimals: 18,
    isNative: false,
    explorerUrl: 'https://polygonscan.com/token/0xc708D6F2153933DAA50B2D0758955Be0A93A8FEc',
    enabled: true,
    isImplemented: true,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'polygon',
    color: '#4D7CFE',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },

  // --- ARCHITECTURAL EXPANSION RAILS (Unimplemented / Coming Soon) ---
  'usdt-tron': {
    id: 'usdt-tron',
    symbol: 'USDT',
    name: 'Tether USD (TRC-20)',
    networkId: 'tron',
    networkName: 'Tron',
    standard: 'TRC20',
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    decimals: 6,
    isNative: false,
    explorerUrl: 'https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'tronlink',
    blockchainAdapter: 'tron',
    color: '#26A17B',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  'usdt-ethereum': {
    id: 'usdt-ethereum',
    symbol: 'USDT',
    name: 'Tether USD (ERC-20)',
    networkId: 'ethereum',
    networkName: 'Ethereum Mainnet',
    standard: 'ERC20',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    isNative: false,
    explorerUrl: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'ethereum',
    color: '#26A17B',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  'usdt-bnb': {
    id: 'usdt-bnb',
    symbol: 'USDT',
    name: 'Tether USD (BEP-20)',
    networkId: 'bnb',
    networkName: 'BNB Smart Chain',
    standard: 'BEP20',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    isNative: false,
    explorerUrl: 'https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'bnb',
    color: '#26A17B',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  'btc-bitcoin': {
    id: 'btc-bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    networkId: 'bitcoin',
    networkName: 'Bitcoin',
    standard: 'UTXO',
    contractAddress: null,
    decimals: 8,
    isNative: true,
    explorerUrl: 'https://mempool.space',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'bitcoin-utxo',
    blockchainAdapter: 'bitcoin',
    color: '#F7931A',
    iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  'eth-ethereum': {
    id: 'eth-ethereum',
    symbol: 'ETH',
    name: 'Ether',
    networkId: 'ethereum',
    networkName: 'Ethereum Mainnet',
    standard: 'NATIVE',
    contractAddress: null,
    decimals: 18,
    isNative: true,
    explorerUrl: 'https://etherscan.io',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'ethereum',
    color: '#627EEA',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
  'bnb-bnb': {
    id: 'bnb-bnb',
    symbol: 'BNB',
    name: 'BNB',
    networkId: 'bnb',
    networkName: 'BNB Smart Chain',
    standard: 'NATIVE',
    contractAddress: null,
    decimals: 18,
    isNative: true,
    explorerUrl: 'https://bscscan.com',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'bnb',
    color: '#F3BA2F',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  'trx-tron': {
    id: 'trx-tron',
    symbol: 'TRX',
    name: 'TRON',
    networkId: 'tron',
    networkName: 'Tron',
    standard: 'NATIVE',
    contractAddress: null,
    decimals: 6,
    isNative: true,
    explorerUrl: 'https://tronscan.org',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'tronlink',
    blockchainAdapter: 'tron',
    color: '#FF0013',
    iconBg: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  'usdc-polygon': {
    id: 'usdc-polygon',
    symbol: 'USDC',
    name: 'USD Coin (Polygon)',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'ERC20',
    contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
    isNative: false,
    explorerUrl: 'https://polygonscan.com/token/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    enabled: false,
    isImplemented: false,
    walletAdapter: 'eip1193',
    blockchainAdapter: 'polygon',
    color: '#2775CA',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
};

export const POPULAR_CRYPTO_SYMBOLS = ['BTC', 'USDT', 'POL', 'VERSE', 'ETH', 'BNB', 'TRX', 'USDC'] as const;

export interface CryptoDefinition {
  symbol: string;
  name: string;
  networks: string[];
}

export const CRYPTO_DEFINITIONS: CryptoDefinition[] = [
  { symbol: 'USDT', name: 'Tether USD', networks: ['Polygon PoS', 'Ethereum', 'BNB Smart Chain', 'Tron'] },
  { symbol: 'POL', name: 'Polygon POL', networks: ['Polygon PoS'] },
  { symbol: 'VERSE', name: 'VERSE (fxVERSE)', networks: ['Polygon PoS'] },
  { symbol: 'BTC', name: 'Bitcoin', networks: ['Bitcoin Network'] },
  { symbol: 'ETH', name: 'Ethereum', networks: ['Ethereum Mainnet'] },
  { symbol: 'BNB', name: 'BNB', networks: ['BNB Smart Chain'] },
  { symbol: 'TRX', name: 'TRON', networks: ['Tron Network'] },
  { symbol: 'USDC', name: 'USD Coin', networks: ['Polygon PoS'] },
];

export const DEFAULT_PAYMENT_ASSET: PaymentAsset = PAYMENT_ASSETS['pol-polygon'];

export const ALL_ASSETS_LIST: PaymentAsset[] = Object.values(PAYMENT_ASSETS);

/**
 * Returns all active implemented assets available for customer payments.
 */
export function getActiveImplementedAssets(): PaymentAsset[] {
  return ALL_ASSETS_LIST.filter((asset) => asset.isImplemented);
}

/**
 * Retrieves asset by unique ID (e.g. 'usdt-polygon').
 */
export function getPaymentAssetById(assetId?: string): PaymentAsset | undefined {
  if (!assetId) return undefined;
  return PAYMENT_ASSETS[assetId.toLowerCase().trim()];
}

/**
 * Retrieves all networks configured for a specific cryptocurrency symbol.
 */
export function getAssetsBySymbol(symbol?: string): PaymentAsset[] {
  if (!symbol) return [];
  const upper = symbol.toUpperCase().trim();
  return ALL_ASSETS_LIST.filter((asset) => asset.symbol === upper);
}

export const getAssetsForCryptoSymbol = getAssetsBySymbol;

/**
 * Gets the network config object for a given networkId.
 */
export function getNetworkConfig(networkId?: string): ChainConfig | undefined {
  if (!networkId) return undefined;
  return SUPPORTED_NETWORKS[networkId.toLowerCase().trim()];
}

/**
 * Formats token amount with the specific decimals and asset descriptor.
 */
export function formatAssetAmount(amount: string | number, assetOrSymbol: PaymentAsset | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const symbol = typeof assetOrSymbol === 'string' ? assetOrSymbol : assetOrSymbol.symbol;
  if (isNaN(num)) return `0.00 ${symbol}`;

  if (symbol === 'USDT' || symbol === 'USDC') {
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
  }
  if (symbol === 'VERSE') {
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${symbol}`;
  }
  if (symbol === 'BTC') {
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })} ${symbol}`;
  }
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${symbol}`;
}
