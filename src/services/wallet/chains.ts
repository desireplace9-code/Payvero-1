import { EvmChainMetadata } from './types';

export const EVM_CHAINS: Record<number, EvmChainMetadata> = {
  137: {
    chainId: 137,
    hexChainId: '0x89',
    caipId: 'eip155:137',
    name: 'Polygon PoS Mainnet',
    shortName: 'Polygon',
    networkId: 'polygon',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon', 'https://1rpc.io/matic'],
    blockExplorerUrls: ['https://polygonscan.com/'],
    supportedTokens: ['POL', 'VERSE', 'USDT', 'USDC'],
  },
  1: {
    chainId: 1,
    hexChainId: '0x1',
    caipId: 'eip155:1',
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    networkId: 'ethereum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth.llamarpc.com', 'https://cloudflare-eth.com', 'https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io/'],
    supportedTokens: ['ETH', 'USDT', 'USDC'],
  },
  56: {
    chainId: 56,
    hexChainId: '0x38',
    caipId: 'eip155:56',
    name: 'BNB Smart Chain',
    shortName: 'BNB Chain',
    networkId: 'bnb',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org', 'https://rpc.ankr.com/bsc', 'https://1rpc.io/bnb'],
    blockExplorerUrls: ['https://bscscan.com/'],
    supportedTokens: ['BNB', 'USDT'],
  },
  80002: {
    chainId: 80002,
    hexChainId: '0x13882',
    caipId: 'eip155:80002',
    name: 'Polygon Amoy Testnet',
    shortName: 'Polygon Amoy',
    networkId: 'polygon',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
    supportedTokens: ['POL'],
  },
};

export const BITCOIN_CHAIN_CONFIG = {
  caipId: 'bip122:000000000019d6689c085ae165831e93',
  name: 'Bitcoin Mainnet',
  shortName: 'Bitcoin',
  networkId: 'bitcoin',
  symbol: 'BTC',
  decimals: 8,
  explorerUrl: 'https://mempool.space',
  isEvm: false,
};

export function getEvmChainByChainId(chainId: number): EvmChainMetadata | undefined {
  return EVM_CHAINS[chainId];
}

export function getEvmChainByNetworkId(networkId: string): EvmChainMetadata | undefined {
  const norm = networkId.toLowerCase().trim();
  return Object.values(EVM_CHAINS).find((chain) => chain.networkId === norm);
}

export function getChainName(chainId: number | null): string {
  if (!chainId) return 'Unknown Network';
  const found = EVM_CHAINS[chainId];
  return found ? found.name : `Chain ID ${chainId}`;
}

export function getSupportedChainsList(): EvmChainMetadata[] {
  return [EVM_CHAINS[137], EVM_CHAINS[1], EVM_CHAINS[56]];
}
