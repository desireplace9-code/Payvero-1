import { 
  CreatePaymentInput, 
  Payment, 
  PaymentStatus, 
  RevenueSummary, 
  TokenRevenue 
} from '../types';
import { PAYMENT_ASSETS, getPaymentAssetById, ALL_ASSETS_LIST } from '../config/assets';
import { isValidEvmAddress, isValidNetworkAddress } from '../config/tokens';
import { merchantService } from './merchant';
import { ENV_CONFIG } from '../config/env';

const PAYMENTS_STORAGE_KEY = 'payvero_payments_list';

// Realistic sample transactions for initial dashboard state with strictly separated asset+network records
const INITIAL_SAMPLE_PAYMENTS: Payment[] = [
  {
    id: 'pay_9821a0f',
    merchantId: 'mch_9281a4b',
    customerWallet: '0x3841D3Bf48c1e8790A2b2023a1050A4E385D7e31',
    merchantWallet: '',
    merchantDestination: '',
    assetId: 'pol-polygon',
    token: 'POL',
    tokenSymbol: 'POL',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'NATIVE',
    tokenContract: '0x0000000000000000000000000000000000001010',
    amount: '450.00',
    decimals: 18,
    description: 'Annual Cloud API Subscription',
    customerReference: 'INV-2026-0891',
    txHash: '0x9e88a31e847be68a8677c7f0db43d22b82e2c0e86b4ef8d1ad65ffcb3a2d8e41',
    status: 'confirmed',
    createdAt: '2026-08-22T04:12:00Z',
    confirmedAt: '2026-08-22T04:12:45Z',
    networkChainId: 137,
  },
  {
    id: 'pay_7362b1e',
    merchantId: 'mch_9281a4b',
    customerWallet: '0x9924c29188E65324D6FaAf19965a3d7589d8B33a',
    merchantWallet: '',
    merchantDestination: '',
    assetId: 'usdt-polygon',
    token: 'USDT',
    tokenSymbol: 'USDT',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'ERC20',
    tokenContract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    amount: '1250.00',
    decimals: 6,
    description: 'Enterprise Web Security Audit License',
    customerReference: 'CUST-ORG-99',
    txHash: '0x43b22e19f71c4c1a5db7643b1239aa8cf126dae44502758832a8298dc1248101',
    status: 'confirmed',
    createdAt: '2026-08-21T18:45:00Z',
    confirmedAt: '2026-08-21T18:46:12Z',
    networkChainId: 137,
  },
  {
    id: 'pay_6144c2d',
    merchantId: 'mch_9281a4b',
    customerWallet: '0xbAe1687f87f54c414A895F6f3281E15De46Fa7e9',
    merchantWallet: '',
    merchantDestination: '',
    assetId: 'verse-polygon',
    token: 'VERSE',
    tokenSymbol: 'VERSE',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'ERC20',
    tokenContract: '0xc708D6F2153933DAA50B2D0758955Be0A93A8FEc',
    amount: '75000',
    decimals: 18,
    description: 'Verse Staking & Liquidity Tooling Suite',
    customerReference: 'DEX-ORD-440',
    txHash: '0x12a99478f1a2388dcba0175bcaef42018274bb816ea278f244bbdc4457a81099',
    status: 'confirmed',
    createdAt: '2026-08-21T11:20:00Z',
    confirmedAt: '2026-08-21T11:21:05Z',
    networkChainId: 137,
  },
  {
    id: 'pay_5109d3c',
    merchantId: 'mch_9281a4b',
    customerWallet: '0x55E9fF95725e2E8354c4fA2D87B4156b820a4D71',
    merchantWallet: '',
    merchantDestination: '',
    assetId: 'usdt-polygon',
    token: 'USDT',
    tokenSymbol: 'USDT',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'ERC20',
    tokenContract: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    amount: '350.00',
    decimals: 6,
    description: 'Quarterly Dedicated Node Hosting',
    customerReference: 'NODE-HOST-03',
    txHash: '0x77c2890e4f3a8b417e8892ca3b567119da8e809312019488aefc5866b1894d03',
    status: 'confirmed',
    createdAt: '2026-08-20T16:00:00Z',
    confirmedAt: '2026-08-20T16:01:10Z',
    networkChainId: 137,
  },
  {
    id: 'pay_4021e4b',
    merchantId: 'mch_9281a4b',
    customerWallet: '0x8849bCd2837f4044A1eE44aF8444aDFe10793d56',
    merchantWallet: '',
    merchantDestination: '',
    assetId: 'pol-polygon',
    token: 'POL',
    tokenSymbol: 'POL',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'NATIVE',
    tokenContract: '0x0000000000000000000000000000000000001010',
    amount: '180.00',
    decimals: 18,
    description: 'Smart Contract Automation Workflow',
    customerReference: 'AUTO-FLOW-12',
    status: 'pending',
    createdAt: '2026-08-22T07:15:00Z',
    networkChainId: 137,
  },
  {
    id: 'pay_3910f5a',
    merchantId: 'mch_9281a4b',
    customerWallet: '0x17c9135a5C6dEe73A99602410c59800B02581023',
    merchantWallet: '',
    merchantDestination: '',
    assetId: 'verse-polygon',
    token: 'VERSE',
    tokenSymbol: 'VERSE',
    networkId: 'polygon',
    networkName: 'Polygon PoS',
    standard: 'ERC20',
    tokenContract: '0xc708D6F2153933DAA50B2D0758955Be0A93A8FEc',
    amount: '25000',
    decimals: 18,
    description: 'Community VIP Token Pass',
    customerReference: 'VIP-PASS-99',
    txHash: '0x32190aa8efbca928340156dbeea1287954aefcb32410a8ef11082bb44501a44e',
    status: 'failed',
    errorMessage: 'Transaction reverted on Polygon PoS (Gas limit reached or approval missing).',
    createdAt: '2026-08-19T09:30:00Z',
    networkChainId: 137,
  }
];

export class PaymentService {
  public getAllPayments(): Payment[] {
    if (typeof window === 'undefined') return INITIAL_SAMPLE_PAYMENTS;

    try {
      const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Payment[];
        // Ensure legacy payments have assetId and tokenSymbol populated
        return parsed.map((p) => {
          if (p.merchantWallet === '0x71C8360e3268cbE02e429352e8964344Fa5aB162') {
            p.merchantWallet = '';
            p.merchantDestination = '';
          }
          if (!p.assetId) {
            const sym = (p.token || 'POL').toLowerCase();
            p.assetId = `${sym}-polygon`;
          }
          if (!p.tokenSymbol) {
            p.tokenSymbol = p.token || 'POL';
          }
          if (!p.networkId) {
            p.networkId = 'polygon';
          }
          if (!p.networkName) {
            p.networkName = 'Polygon PoS';
          }
          return p;
        });
      }
    } catch {
      // Fallback
    }

    this.savePayments(INITIAL_SAMPLE_PAYMENTS);
    return INITIAL_SAMPLE_PAYMENTS;
  }

  public savePayments(payments: Payment[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
      } catch (err) {
        console.error('Failed to save payments to localStorage:', err);
      }
    }
  }

  public getPaymentById(id: string): Payment | null {
    const payments = this.getAllPayments();
    const found = payments.find((p) => p.id === id);
    return found || null;
  }

  public createPayment(input: CreatePaymentInput): { success: boolean; payment?: Payment; error?: string } {
    // 1. Validation
    const amountNum = parseFloat(input.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        error: 'Please enter a valid positive payment amount.',
      };
    }

    if (!input.description || input.description.trim().length === 0) {
      return {
        success: false,
        error: 'Please provide a payment description or invoice title.',
      };
    }

    // Resolve asset (accepts either assetId e.g. 'usdt-polygon' or symbol e.g. 'POL')
    const rawAssetId = input.assetId || (input.token ? `${input.token.toLowerCase()}-polygon` : 'pol-polygon');
    const asset = getPaymentAssetById(rawAssetId);
    if (!asset) {
      return {
        success: false,
        error: `Selected payment rail (${rawAssetId}) is not recognized.`,
      };
    }

    // Resolve destination address according to network and active connected merchant wallet
    const merchant = merchantService.getMerchant();
    let destinationAddress = (input.merchantWallet || merchant.walletAddress || '').trim();
    if (asset.networkId === 'tron' && merchant.tronWalletAddress) {
      destinationAddress = merchant.tronWalletAddress.trim();
    } else if (asset.networkId === 'bitcoin' && merchant.bitcoinWalletAddress) {
      destinationAddress = merchant.bitcoinWalletAddress.trim();
    }

    if (!destinationAddress || destinationAddress.length === 0) {
      return {
        success: false,
        error: 'Merchant receiving wallet is not connected. Please connect your merchant wallet to receive payments.',
      };
    }

    if (!isValidNetworkAddress(destinationAddress, asset.networkId)) {
      return {
        success: false,
        error: `Invalid receiving address (${destinationAddress}) for ${asset.networkName}. Please connect a compatible merchant wallet.`,
      };
    }

    // 2. Generate unique payment identifier
    const uniqueId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    
    // Expires in X minutes (default: 60)
    const expirationMinutes = input.expiresInMinutes || 60;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();

    const payment: Payment = {
      id: uniqueId,
      merchantId: merchant.id,
      merchantWallet: destinationAddress,
      merchantDestination: destinationAddress,
      assetId: asset.id,
      token: asset.symbol,
      tokenSymbol: asset.symbol,
      networkId: asset.networkId,
      networkName: asset.networkName,
      networkChainId: asset.networkChainId,
      standard: asset.standard,
      tokenContract: asset.contractAddress,
      amount: input.amount.trim(),
      decimals: asset.decimals,
      description: input.description.trim(),
      customerReference: input.customerReference ? input.customerReference.trim() : undefined,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    // Construct self-contained payment link
    const baseUrl = ENV_CONFIG.appUrl;
    payment.paymentUrl = `${baseUrl}/#checkout/${payment.id}`;

    // 3. Persist payment
    const currentList = this.getAllPayments();
    const updatedList = [payment, ...currentList];
    this.savePayments(updatedList);

    return {
      success: true,
      payment,
    };
  }

  public updatePaymentStatus(
    id: string, 
    status: PaymentStatus, 
    data?: { 
      txHash?: string; 
      customerWallet?: string; 
      confirmedAt?: string; 
      errorMessage?: string; 
    }
  ): Payment | null {
    const list = this.getAllPayments();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updated: Payment = {
      ...existing,
      status,
      txHash: data?.txHash || existing.txHash,
      customerWallet: data?.customerWallet || existing.customerWallet,
      confirmedAt: status === 'confirmed' ? (data?.confirmedAt || new Date().toISOString()) : existing.confirmedAt,
      errorMessage: data?.errorMessage || existing.errorMessage,
    };

    list[index] = updated;
    this.savePayments(list);
    return updated;
  }

  /**
   * Computes clean merchant revenue summary strictly segregated per Asset+Network rail.
   * "Never mix token amounts or networks together.
   *  For example: USDT (Polygon) must be tracked strictly separately from USDT (Tron) or POL (Polygon)."
   */
  public getMerchantRevenueSummary(): RevenueSummary {
    const payments = this.getAllPayments();

    const tokenBreakdown: Record<string, TokenRevenue> = {};

    // Initialize all implemented assets
    for (const asset of ALL_ASSETS_LIST) {
      if (asset.isImplemented) {
        tokenBreakdown[asset.id] = {
          assetId: asset.id,
          token: asset.symbol,
          networkId: asset.networkId,
          networkName: asset.networkName,
          name: `${asset.symbol} (${asset.networkName})`,
          confirmedAmount: 0,
          pendingAmount: 0,
          transactionCount: 0,
          decimals: asset.decimals,
        };
      }
    }

    let totalTransactions = payments.length;
    let successfulPaymentsCount = 0;
    let pendingPaymentsCount = 0;
    let failedPaymentsCount = 0;

    for (const payment of payments) {
      const assetId = payment.assetId || `${(payment.token || 'POL').toLowerCase()}-polygon`;
      
      if (!tokenBreakdown[assetId]) {
        tokenBreakdown[assetId] = {
          assetId,
          token: payment.tokenSymbol || payment.token || 'POL',
          networkId: payment.networkId || 'polygon',
          networkName: payment.networkName || 'Polygon PoS',
          name: `${payment.tokenSymbol || payment.token} (${payment.networkName || 'Polygon PoS'})`,
          confirmedAmount: 0,
          pendingAmount: 0,
          transactionCount: 0,
          decimals: payment.decimals || 18,
        };
      }

      const amt = parseFloat(payment.amount) || 0;
      tokenBreakdown[assetId].transactionCount += 1;

      if (payment.status === 'confirmed') {
        successfulPaymentsCount += 1;
        tokenBreakdown[assetId].confirmedAmount += amt;
      } else if (payment.status === 'pending') {
        pendingPaymentsCount += 1;
        tokenBreakdown[assetId].pendingAmount += amt;
      } else if (payment.status === 'failed') {
        failedPaymentsCount += 1;
      }
    }

    return {
      tokenBreakdown,
      totalTransactions,
      successfulPaymentsCount,
      pendingPaymentsCount,
      failedPaymentsCount,
    };
  }
}

export const paymentService = new PaymentService();
