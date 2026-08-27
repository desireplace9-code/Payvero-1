import { Merchant } from '../types';
import { isValidBitcoinAddress, isValidEvmAddress, isValidTronAddress } from '../config/tokens';

const MERCHANT_STORAGE_KEY = 'payvero_merchant_settings';

const DEFAULT_MERCHANT: Merchant = {
  id: 'mch_9281a4b',
  name: 'Acme Digital Commerce',
  walletAddress: '0x71C8360e3268cbE02e429352e8964344Fa5aB162',
  tronWalletAddress: 'TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL',
  bitcoinWalletAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  supportedTokens: ['pol-polygon', 'usdt-polygon', 'verse-polygon'],
  email: 'finance@acmedigital.io',
  webhookUrl: 'https://api.acmedigital.io/webhooks/payvero',
  defaultToken: 'pol-polygon',
  businessCategory: 'Digital Goods & Software',
  requireCustomerReference: false,
  networkPreference: 'Polygon PoS (Active)',
};

export class MerchantService {
  public getMerchant(): Merchant {
    if (typeof window === 'undefined') return DEFAULT_MERCHANT;

    try {
      const stored = localStorage.getItem(MERCHANT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Merchant;
        // Migrate legacy symbol array to assetIds if needed and deduplicate
        if (parsed.supportedTokens && parsed.supportedTokens.length > 0) {
          const mapped = parsed.supportedTokens.map((t) => {
            if (t === 'POL') return 'pol-polygon';
            if (t === 'USDT') return 'usdt-polygon';
            if (t === 'VERSE') return 'verse-polygon';
            return t;
          });
          parsed.supportedTokens = Array.from(new Set(mapped));
        }
        return parsed;
      }
    } catch {
      // Fallback
    }

    this.saveMerchant(DEFAULT_MERCHANT);
    return DEFAULT_MERCHANT;
  }

  public saveMerchant(merchant: Merchant): Merchant {
    if (typeof window !== 'undefined') {
      try {
        if (merchant.supportedTokens) {
          merchant.supportedTokens = Array.from(new Set(merchant.supportedTokens));
        }
        localStorage.setItem(MERCHANT_STORAGE_KEY, JSON.stringify(merchant));
      } catch (err) {
        console.error('Failed to save merchant settings:', err);
      }
    }
    return merchant;
  }

  public updateMerchant(updates: Partial<Merchant>): { success: boolean; merchant: Merchant; error?: string } {
    const current = this.getMerchant();
    
    if (updates.supportedTokens) {
      updates.supportedTokens = Array.from(new Set(updates.supportedTokens));
    }
    
    if (updates.walletAddress && !isValidEvmAddress(updates.walletAddress)) {
      return {
        success: false,
        merchant: current,
        error: 'Invalid EVM merchant receiving address. Please provide a 42-character hex address (0x...).',
      };
    }

    if (updates.tronWalletAddress && !isValidTronAddress(updates.tronWalletAddress)) {
      return {
        success: false,
        merchant: current,
        error: 'Invalid Tron merchant receiving address. Must start with T and be 34 characters.',
      };
    }

    if (updates.bitcoinWalletAddress && !isValidBitcoinAddress(updates.bitcoinWalletAddress)) {
      return {
        success: false,
        merchant: current,
        error: 'Invalid Bitcoin merchant receiving address format.',
      };
    }

    if (updates.supportedTokens && updates.supportedTokens.length === 0) {
      return {
        success: false,
        merchant: current,
        error: 'At least one supported token must be enabled for checkout.',
      };
    }

    const updated: Merchant = {
      ...current,
      ...updates,
    };

    this.saveMerchant(updated);
    return { success: true, merchant: updated };
  }

  public resetToDefault(): Merchant {
    this.saveMerchant(DEFAULT_MERCHANT);
    return DEFAULT_MERCHANT;
  }
}

export const merchantService = new MerchantService();

