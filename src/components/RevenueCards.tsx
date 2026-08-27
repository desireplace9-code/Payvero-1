import { RevenueSummary, TokenRevenue } from '../types';
import { formatTokenAmount } from '../config/tokens';
import { CheckCircle2, Clock, Activity, Coins, ArrowUpRight, Globe, Layers } from 'lucide-react';
import { TokenLogo } from './TokenLogo';

interface RevenueCardsProps {
  summary: RevenueSummary;
  onCreatePaymentClick?: () => void;
}

export function RevenueCards({ summary, onCreatePaymentClick }: RevenueCardsProps) {
  const { tokenBreakdown, totalTransactions, successfulPaymentsCount, pendingPaymentsCount } = summary;

  // Convert breakdown dictionary to array
  const breakdownList = Object.values(tokenBreakdown) as TokenRevenue[];

  return (
    <div className="space-y-6" id="revenue-summary-section">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div
          id="metric-total-tx"
          className="bg-[#131A38] border border-[#242E5E] rounded-xl p-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A7AEC4] uppercase tracking-wider">Total Transactions</span>
            <div className="p-2 rounded-lg bg-[#4D7CFE]/15 text-[#4D7CFE]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{totalTransactions}</span>
            <span className="text-xs text-[#A7AEC4]">processed requests</span>
          </div>
          <div className="mt-2 text-xs text-[#A7AEC4] flex items-center gap-1">
            <span className="text-[#20E56B] font-medium">{successfulPaymentsCount} successful</span>
            <span>•</span>
            <span className="text-amber-300 font-medium">{pendingPaymentsCount} pending</span>
          </div>
        </div>

        {/* Successful Payments */}
        <div
          id="metric-successful-payments"
          className="bg-[#131A38] border border-[#242E5E] rounded-xl p-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A7AEC4] uppercase tracking-wider">Successful Payments</span>
            <div className="p-2 rounded-lg bg-[#20E56B]/15 text-[#20E56B]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#20E56B] font-mono">{successfulPaymentsCount}</span>
            <span className="text-xs text-[#A7AEC4]">confirmed on-chain</span>
          </div>
          <div className="mt-2 text-xs text-[#A7AEC4]">
            {totalTransactions > 0 
              ? `${Math.round((successfulPaymentsCount / totalTransactions) * 100)}% conversion rate`
              : '0% conversion'}
          </div>
        </div>

        {/* Pending Payments */}
        <div
          id="metric-pending-payments"
          className="bg-[#131A38] border border-[#242E5E] rounded-xl p-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A7AEC4] uppercase tracking-wider">Pending Payments</span>
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-300 font-mono">{pendingPaymentsCount}</span>
            <span className="text-xs text-[#A7AEC4]">awaiting payment</span>
          </div>
          <div className="mt-2 text-xs text-[#A7AEC4]">
            Open customer checkout sessions
          </div>
        </div>

        {/* Quick Action Card */}
        <div
          id="metric-quick-action"
          className="bg-gradient-to-br from-[#131A38] to-[#192147] border border-[#4D7CFE]/40 rounded-xl p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#4D7CFE] uppercase tracking-wider">Direct Checkout</span>
              <Coins className="w-4 h-4 text-[#20E56B]" />
            </div>
            <p className="mt-2 text-xs text-[#A7AEC4]">
              Generate a fast crypto payment link or instant QR code for your customer.
            </p>
          </div>
          {onCreatePaymentClick && (
            <button
              id="btn-quick-create-payment"
              onClick={onCreatePaymentClick}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors"
            >
              <span>Create New Payment</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Token Revenue Breakdown Section - STRICT NON-MIXED BALANCES PER ASSET & NETWORK */}
      <div className="bg-[#131A38] border border-[#242E5E] rounded-xl p-5" id="token-revenue-breakdown">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#242E5E]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Settled Revenue by Asset & Network
            </h3>
            <p className="text-xs text-[#A7AEC4] mt-0.5">
              Strict per-rail accounting. Each asset and network combination is settled independently to your sovereign wallet.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#20E56B] font-mono bg-[#20E56B]/10 px-2.5 py-1 rounded-md border border-[#20E56B]/20 self-start sm:self-auto">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Chain Architecture</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {breakdownList.map((item) => {
            const tokenSymbol = item.token || 'POL';
            const networkName = item.networkName || 'Polygon PoS';
            const assetId = item.assetId || `${tokenSymbol.toLowerCase()}-polygon`;

            return (
              <div
                key={assetId}
                id={`token-revenue-${assetId}`}
                className="bg-[#0B1026] border border-[#242E5E] hover:border-[#4D7CFE]/60 transition-colors rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <TokenLogo symbol={tokenSymbol} size={24} />
                      <div>
                        <span className="font-bold text-white text-sm">{tokenSymbol}</span>
                        <span className="text-[11px] text-[#A7AEC4] ml-1.5">
                          ({networkName})
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#131A38] text-[#A7AEC4] font-mono border border-[#242E5E]">
                      {item.transactionCount} txs
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-[#A7AEC4]">Confirmed Revenue</div>
                    <div className="text-xl font-bold text-white font-mono mt-0.5">
                      {formatTokenAmount(item.confirmedAmount, tokenSymbol)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#242E5E] flex justify-between text-xs">
                  <span className="text-[#A7AEC4]">Pending Invoices:</span>
                  <span className="text-amber-300 font-mono">
                    {formatTokenAmount(item.pendingAmount, tokenSymbol)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
