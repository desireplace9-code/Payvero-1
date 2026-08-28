import { AppView } from '../components/Navbar';
import { RevenueCards } from '../components/RevenueCards';
import { TransactionTable } from '../components/TransactionTable';
import { AddressDisplay } from '../components/AddressDisplay';
import { CopyButton } from '../components/CopyButton';
import { shortenAddress } from '../config/tokens';
import { usePayments } from '../hooks/usePayments';
import { useMerchant } from '../hooks/useMerchant';
import { useMerchantWallet } from '../hooks/useMerchantWallet';
import { PlusCircle, RefreshCw, ShieldCheck, Wallet, ArrowUpRight, AlertCircle } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: AppView, param?: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { payments, summary, refresh, isLoading } = usePayments();
  const { merchant } = useMerchant();
  const { 
    isConnected: isMerchantConnected, 
    address: merchantConnectedAddress, 
    networkName: merchantNetworkName,
    openModal: openMerchantModal 
  } = useMerchantWallet();

  const activeReceivingAddress = isMerchantConnected && merchantConnectedAddress ? merchantConnectedAddress : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="dashboard-page">
      {/* Top Welcome & Merchant Status Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#242E5E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Merchant Dashboard</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30 font-semibold">
              Live Gateway
            </span>
          </div>
          <p className="text-xs text-[#A7AEC4] mt-1">
            Real-time transaction tracking and settled cryptocurrency revenues for <span className="text-white font-medium">{merchant.name}</span>.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-refresh-dashboard"
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#131A38] text-[#A7AEC4] hover:text-white border border-[#242E5E] hover:border-[#4D7CFE] transition-colors"
            title="Refresh transaction data from local store"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            id="btn-dashboard-settings"
            type="button"
            onClick={() => onNavigate('settings')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#131A38] text-white border border-[#242E5E] hover:border-[#4D7CFE] transition-colors"
          >
            <span>Gateway Settings</span>
          </button>

          <button
            id="btn-dashboard-new-payment"
            type="button"
            onClick={() => onNavigate('create-payment')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Payment</span>
          </button>
        </div>
      </div>

      {/* Merchant Wallet Receiving Address Callout */}
      <div className="bg-[#131A38] border border-[#242E5E] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${activeReceivingAddress ? 'bg-[#20E56B]/15 text-[#20E56B]' : 'bg-amber-500/15 text-amber-400'}`}>
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#A7AEC4] block text-[11px]">Primary Settlement Receiving Wallet:</span>
            {activeReceivingAddress ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-white text-xs">
                  {shortenAddress(activeReceivingAddress, 6)}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20E56B] animate-pulse" />
                  Connected
                </span>
                <span className="text-[#A7AEC4] text-[11px] font-medium bg-[#0B1026] px-2 py-0.5 rounded border border-[#242E5E]">
                  {merchantNetworkName || 'Polygon PoS'}
                </span>
                <CopyButton text={activeReceivingAddress} label="Copy" className="text-[10px] py-0.5 px-2" />
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-amber-400 font-medium text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Merchant wallet not connected
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#A7AEC4] text-[11px]">
          {activeReceivingAddress ? (
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20E56B]" />
              Funds transfer directly to this address
            </span>
          ) : (
            <button
              id="btn-dashboard-connect-receiving"
              type="button"
              onClick={openMerchantModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Receiving Wallet</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="text-[#4D7CFE] hover:underline font-medium flex items-center gap-0.5"
          >
            <span>Settings</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Revenue Summary Metric Cards & Strict Token Breakdown */}
      <RevenueCards
        summary={summary}
        onCreatePaymentClick={() => onNavigate('create-payment')}
      />

      {/* Recent Transactions Table */}
      <TransactionTable
        payments={payments}
        onSelectPayment={(id) => onNavigate('tx-details', id)}
        onNewPaymentClick={() => onNavigate('create-payment')}
      />
    </div>
  );
}
