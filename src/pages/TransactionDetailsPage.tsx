import { useState, useEffect } from 'react';
import { AppView } from '../components/Navbar';
import { Payment } from '../types';
import { usePayments } from '../hooks/usePayments';
import { StatusBadge } from '../components/StatusBadge';
import { TokenBadge } from '../components/TokenBadge';
import { AddressDisplay } from '../components/AddressDisplay';
import { formatTokenAmount, getExplorerTxUrl } from '../config/tokens';
import { 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard,
  Building2,
  User,
  Hash
} from 'lucide-react';

interface TransactionDetailsPageProps {
  paymentId?: string;
  onNavigate: (view: AppView, param?: string) => void;
}

export function TransactionDetailsPage({ paymentId, onNavigate }: TransactionDetailsPageProps) {
  const { getPayment, verifyOnChain, updateStatus } = usePayments();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (paymentId) {
      const found = getPayment(paymentId);
      if (found) {
        setPayment(found);
      }
    }
  }, [paymentId, getPayment]);

  const handleReverify = async () => {
    if (!payment) return;
    setIsVerifying(true);
    setVerificationFeedback(null);

    try {
      const res = await verifyOnChain(payment);
      if (res.isConfirmed) {
        setVerificationFeedback('Transaction receipt verified and validated on Polygon block node.');
        const updated = getPayment(payment.id);
        if (updated) setPayment(updated);
      } else {
        setVerificationFeedback(res.error || 'Awaiting block confirmation or receipt lookup.');
      }
    } catch {
      setVerificationFeedback('Failed to reach blockchain RPC node.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-white" id="tx-details-not-found">
        <div className="p-8 bg-[#131A38] border border-[#242E5E] rounded-2xl space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold">Transaction Record Not Found</h2>
          <p className="text-xs text-[#A7AEC4]">
            No payment transaction found with identifier {paymentId || 'null'}.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const createdDate = new Date(payment.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  const confirmedDate = payment.confirmedAt
    ? new Date(payment.confirmedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="transaction-details-page">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#242E5E]">
        <button
          id="btn-back-from-details"
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-xs text-[#A7AEC4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A7AEC4]">Payment Status:</span>
          <StatusBadge status={payment.status} size="md" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Overview Card */}
        <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#242E5E] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Payment Details</h1>
                <TokenBadge symbol={payment.token} size="sm" showNetwork={true} />
              </div>
              <p className="text-xs text-[#A7AEC4] font-mono mt-1">Payment ID: {payment.id}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#A7AEC4] block">Settlement Total</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-0.5">
                {formatTokenAmount(payment.amount, payment.token)}
              </div>
            </div>
          </div>

          {verificationFeedback && (
            <div className="mt-4 p-3 rounded-xl bg-[#0B1026] border border-[#242E5E] text-xs text-[#A7AEC4] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4D7CFE]" />
              <span>{verificationFeedback}</span>
            </div>
          )}

            {/* Key Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-[#242E5E] text-xs">
            {/* Sender / Customer */}
            <div className="p-4 rounded-xl bg-[#0B1026] border border-[#242E5E] space-y-2">
              <div className="flex items-center gap-2 text-[#A7AEC4]">
                <User className="w-4 h-4 text-[#4D7CFE]" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Customer (Sender)</span>
              </div>
              <div>
                <AddressDisplay
                  address={payment.customerWallet}
                  type="address"
                  chainId={payment.networkChainId}
                  networkId={payment.networkId}
                  chars={6}
                />
              </div>
              {payment.customerReference && (
                <div className="text-[11px] text-[#A7AEC4] pt-1">
                  Reference: <span className="text-[#4D7CFE] font-mono">{payment.customerReference}</span>
                </div>
              )}
            </div>

            {/* Receiver / Merchant */}
            <div className="p-4 rounded-xl bg-[#0B1026] border border-[#242E5E] space-y-2">
              <div className="flex items-center gap-2 text-[#A7AEC4]">
                <Building2 className="w-4 h-4 text-[#20E56B]" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">Merchant (Receiver)</span>
              </div>
              <div>
                <AddressDisplay
                  address={payment.merchantWallet}
                  type="address"
                  chainId={payment.networkChainId}
                  networkId={payment.networkId}
                  chars={6}
                />
              </div>
              <div className="text-[11px] text-[#20E56B] pt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sovereign Settlement Destination</span>
              </div>
            </div>
          </div>

          {/* Detailed Metadata Table */}
          <div className="py-6 space-y-3.5 text-xs text-[#A7AEC4]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-[#242E5E]/60 gap-1">
              <span>Payment Description:</span>
              <span className="text-white font-medium sm:text-right">{payment.description}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-[#242E5E]/60 gap-1">
              <span>Blockchain Network:</span>
              <span className="text-white font-medium">
                {payment.networkName} {payment.networkChainId ? `(Chain ID: ${payment.networkChainId})` : `(${payment.standard || 'Direct Rail'})`}
              </span>
            </div>

            {payment.tokenContract && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-[#242E5E]/60 gap-1">
                <span>Token Contract:</span>
                <AddressDisplay address={payment.tokenContract} type="address" chainId={payment.networkChainId} networkId={payment.networkId} chars={6} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-[#242E5E]/60 gap-1">
              <span>Created Timestamp:</span>
              <span className="text-white font-mono">{createdDate}</span>
            </div>

            {confirmedDate && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-[#242E5E]/60 gap-1">
                <span>Confirmed Timestamp:</span>
                <span className="text-[#20E56B] font-mono">{confirmedDate}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 gap-1">
              <span>On-Chain Transaction Hash:</span>
              {payment.txHash ? (
                <div className="flex items-center gap-2">
                  <AddressDisplay address={payment.txHash} type="tx" chainId={payment.networkChainId} networkId={payment.networkId} chars={8} />
                  <a
                    href={getExplorerTxUrl(payment.txHash, payment.networkChainId, payment.networkId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#4D7CFE] hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <span className="italic text-[#A7AEC4]">Not yet broadcasted</span>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-[#242E5E] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                id="btn-reverify-onchain"
                type="button"
                onClick={handleReverify}
                disabled={isVerifying || !payment.txHash}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0B1026] text-white hover:bg-[#192147] border border-[#242E5E] disabled:opacity-40 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Verify Status On-Chain</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('checkout', payment.id)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#4D7CFE] text-white hover:bg-[#3b6be6] transition-colors inline-flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Open Checkout View</span>
              </button>
            </div>

            <span className="text-[11px] text-[#A7AEC4] font-mono">
              Polygon PoS Verification Protocol
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
