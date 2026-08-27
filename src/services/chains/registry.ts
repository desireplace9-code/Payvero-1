import { BlockchainAdapter, NetworkId } from './types';
import { PolygonAdapter } from './polygon';
import { EthereumAdapter } from './ethereum';
import { BnbAdapter } from './bnb';
import { TronAdapter } from './tron';
import { BitcoinAdapter } from './bitcoin';

class BlockchainAdapterRegistry {
  private adapters: Map<string, BlockchainAdapter> = new Map();

  constructor() {
    // Register all chain adapters
    const polygon = new PolygonAdapter();
    const ethereum = new EthereumAdapter();
    const bnb = new BnbAdapter();
    const tron = new TronAdapter();
    const bitcoin = new BitcoinAdapter();

    this.adapters.set('polygon', polygon);
    this.adapters.set('ethereum', ethereum);
    this.adapters.set('bnb', bnb);
    this.adapters.set('tron', tron);
    this.adapters.set('bitcoin', bitcoin);
  }

  /**
   * Retrieves the adapter for a given networkId.
   * Defaults to PolygonAdapter if not found.
   */
  public getAdapter(networkId?: NetworkId): BlockchainAdapter {
    if (!networkId) {
      return this.adapters.get('polygon')!;
    }
    const found = this.adapters.get(networkId.toLowerCase().trim());
    return found || this.adapters.get('polygon')!;
  }

  /**
   * Checks if an adapter is active and implemented with real on-chain capabilities.
   */
  public isNetworkImplemented(networkId?: NetworkId): boolean {
    const adapter = this.getAdapter(networkId);
    return adapter.isImplemented;
  }

  public isAdapterImplemented(networkId?: NetworkId): boolean {
    return this.isNetworkImplemented(networkId);
  }
}

export const adapterRegistry = new BlockchainAdapterRegistry();
export const blockchainRegistry = adapterRegistry;

export function getBlockchainAdapter(networkId?: NetworkId): BlockchainAdapter {
  return adapterRegistry.getAdapter(networkId);
}
