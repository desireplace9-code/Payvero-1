import { Token, TokenSymbol } from '../types';
import { PAYMENT_ASSETS } from './assets';

export const SUPPORTED_TOKENS: Record<string, Token> = {
  POL: {
    symbol: 'POL',
    name: 'POL (Polygon Native)',
    contractAddress: '0x0000000000000000000000000000000000001010', // Native gas token on Polygon PoS
    decimals: 18,
    network: 'Polygon Mainnet',
    chainId: 137,
    isNative: true,
    color: '#8247E5',
    iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD (PoS)',
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT ERC-20
    decimals: 6,
    network: 'Polygon Mainnet',
    chainId: 137,
    isNative: false,
    color: '#26A17B',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  VERSE: {
    symbol: 'VERSE',
    name: 'VERSE (fxVERSE)',
    contractAddress: '0xc708D6F2153933DAA50B2D0758955Be0A93A8FEc', // Polygon fxVERSE ERC-20
    decimals: 18,
    network: 'Polygon Mainnet',
    chainId: 137,
    isNative: false,
    color: '#4D7CFE',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    contractAddress: '',
    decimals: 8,
    network: 'Bitcoin Network',
    chainId: 0,
    isNative: true,
    color: '#F7931A',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    contractAddress: '',
    decimals: 18,
    network: 'Ethereum Mainnet',
    chainId: 1,
    isNative: true,
    color: '#627EEA',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  },
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    contractAddress: '',
    decimals: 18,
    network: 'BNB Smart Chain',
    chainId: 56,
    isNative: true,
    color: '#F3BA2F',
    iconBg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  TRX: {
    symbol: 'TRX',
    name: 'TRON (TRX)',
    contractAddress: '',
    decimals: 6,
    network: 'Tron Network',
    chainId: 0,
    isNative: true,
    color: '#EB0029',
    iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin (PoS)',
    contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
    network: 'Polygon Mainnet',
    chainId: 137,
    isNative: false,
    color: '#2775CA',
    iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
};

export const SUPPORTED_TOKEN_LIST: Token[] = Object.values(SUPPORTED_TOKENS);

export function getTokenBySymbol(symbol: string): Token {
  if (!symbol) return SUPPORTED_TOKENS.POL;
  const upper = symbol.toUpperCase() as TokenSymbol;
  if (SUPPORTED_TOKENS[upper]) return SUPPORTED_TOKENS[upper];
  const lower = symbol.toLowerCase();
  if (SUPPORTED_TOKENS[lower]) return SUPPORTED_TOKENS[lower];
  if (PAYMENT_ASSETS[lower]) {
    const a = PAYMENT_ASSETS[lower];
    return {
      symbol: a.symbol,
      name: a.name,
      contractAddress: a.contractAddress || '',
      decimals: a.decimals,
      network: a.networkName,
      chainId: a.networkChainId || 137,
      isNative: a.isNative,
      color: a.color,
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
  }
  return SUPPORTED_TOKENS.POL;
}

/**
 * Validates EVM address format (0x + 40 hex chars).
 */
export function isValidEvmAddress(address?: string): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Validates Tron base58 address format (Starts with T and 34 characters).
 */
export function isValidTronAddress(address?: string): boolean {
  if (!address) return false;
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address.trim());
}

/**
 * Validates Bitcoin address format (P2PKH, P2SH, Bech32/Taproot).
 */
export function isValidBitcoinAddress(address?: string): boolean {
  if (!address) return false;
  const trimmed = address.trim();
  // Legacy / P2SH / Native SegWit / Taproot
  return /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/i.test(trimmed);
}

/**
 * Validates address depending on network type.
 */
export function isValidNetworkAddress(address?: string, networkType: 'evm' | 'tron' | 'bitcoin' | string = 'evm'): boolean {
  if (!address) return false;
  if (networkType === 'tron') return isValidTronAddress(address);
  if (networkType === 'bitcoin') return isValidBitcoinAddress(address);
  return isValidEvmAddress(address);
}

/**
 * Validates standard 32-byte 64-hex transaction hash (with or without 0x prefix).
 */
export function isValidTxHash(hash?: string): boolean {
  if (!hash) return false;
  return /^(0x)?[a-fA-F0-9]{64}$/.test(hash.trim());
}

export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function shortenTxHash(hash?: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
}

export function getExplorerTxUrl(txHash?: string, chainId: number = 137, networkId?: string): string {
  if (!txHash) return '#';
  if (networkId === 'tron') {
    return `https://tronscan.org/#/transaction/${txHash.replace(/^0x/, '')}`;
  }
  if (networkId === 'bitcoin') {
    return `https://mempool.space/tx/${txHash.replace(/^0x/, '')}`;
  }
  if (networkId === 'ethereum' || chainId === 1) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  if (networkId === 'bnb' || chainId === 56) {
    return `https://bscscan.com/tx/${txHash}`;
  }
  return `https://polygonscan.com/tx/${txHash}`;
}

export function getExplorerAddressUrl(address?: string, chainId: number = 137, networkId?: string): string {
  if (!address) return '#';
  if (networkId === 'tron') {
    return `https://tronscan.org/#/address/${address}`;
  }
  if (networkId === 'bitcoin') {
    return `https://mempool.space/address/${address}`;
  }
  if (networkId === 'ethereum' || chainId === 1) {
    return `https://etherscan.io/address/${address}`;
  }
  if (networkId === 'bnb' || chainId === 56) {
    return `https://bscscan.com/address/${address}`;
  }
  return `https://polygonscan.com/address/${address}`;
}

export function formatTokenAmount(amount: string | number, symbol: TokenSymbol): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `0.00 ${symbol}`;

  let formatted: string;
  if (symbol === 'USDT' || symbol === 'USDC') {
    formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (symbol === 'VERSE') {
    formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  } else if (symbol === 'BTC') {
    formatted = num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
  } else {
    formatted = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }

  return `${formatted} ${symbol}`;
}

