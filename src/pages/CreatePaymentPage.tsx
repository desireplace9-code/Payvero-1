import { useState, type FormEvent } from 'react';
import { AppView } from '../components/Navbar';
import { Payment } from '../types';
import { formatTokenAmount, shortenAddress } from '../config/tokens';
import { 
  DEFAULT_PAYMENT_ASSET, 
  getPaymentAssetById, 
  getActiveImplementedAssets 
} from '../config/assets';
import { PaymentAsset } from '../services/chains/types';
import { usePayments } from '../hooks/usePayments';
import { useMerchant } from '../hooks/useMerchant';
import { useMerchantWallet } from '../hooks/useMerchantWallet';
import { QRCodeCard } from '../components/QRCodeCard';
import { CopyButton } from '../components/CopyButton';
import { AddressDisplay } from '../components/AddressDisplay';
import { TokenLogo } from '../components/TokenLogo';
import { AssetSelectorModal } from '../components/AssetSelectorModal';
import { 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  ExternalLink, 
  AlertCircle, 
  PlusCircle, 
  Layers,
  Clock,
  ChevronDown,
  Globe,
  Wallet
} from 'lucide-react';

interface CreatePaymentPageProps {
  onNavigate: (view: AppView, param?: string) => void;
}

export function CreatePaymentPage({ onNavigate }: CreatePaymentPageProps) {
  const { createPayment } = usePayments();
  const { merchant } = useMerchant();
  const { 
    isConnected: isMerchantWalletConnected, 
    address: merchantConnectedAddress, 
    networkName: merchantConnectedNetworkName,
    openModal: openMerchantWalletModal 
  } = useMerchantWallet();

  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<PaymentAsset>(() => {
    // Default to merchant default token on polygon or standard POL
    const raw = (merchant.defaultToken || 'pol-polygon').toLowerCase();
    const cleanId = raw.endsWith('-polygon') ? raw : `${raw}-polygon`;
    return getPaymentAssetById(cleanId) || getPaymentAssetById(raw) || DEFAULT_PAYMENT_ASSET;
  });
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(60);
  const [formError, setFormError] = useState<string | null>(null);

  // Result state after creation
  const [createdPayment, setCreatedPayment] = useState<Payment | null>(null);

  // The receiving destination depends strictly on the merchant's active connected wallet session
  const activeReceivingAddress = (isMerchantWalletConnected && merchantConnectedAddress) 
    ? merchantConnectedAddress.trim() 
    : '';

  const isReceivingWalletConnected = Boolean(isMerchantWalletConnected && merchantConnectedAddress && merchantConnectedAddress.trim().length > 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate that merchant has connected their receiving wallet
    if (!isReceivingWalletConnected || !activeReceivingAddress) {
      setFormError('Merchant wallet not connected. Please connect your merchant wallet first to receive customer funds directly to your sovereign address.');
      openMerchantWalletModal();
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a valid numeric amount greater than zero.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please enter a description or reason for this payment.');
      return;
    }

    const res = createPayment({
      amount,
      token: selectedAsset.symbol,
      assetId: selectedAsset.id,
      networkId: selectedAsset.networkId,
      networkName: selectedAsset.networkName,
      networkChainId: selectedAsset.networkChainId,
      tokenContract: selectedAsset.contractAddress,
      description,
      customerReference: customerReference.trim() || undefined,
      expiresInMinutes,
      merchantWallet: activeReceivingAddress,
    });

    if (!res.success || !res.payment) {
      setFormError(res.error || 'Failed to create payment request.');
      return;
    }

    setCreatedPayment(res.payment);
  };

  const handleResetForm = () => {
    setAmount('');
    setDescription('');
    setCustomerReference('');
    setCreatedPayment(null);
    setFormError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="create-payment-page">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#242E5E]">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-dashboard"
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl bg-[#131A38] text-[#A7AEC4] hover:text-white border border-[#242E5E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {createdPayment ? 'Payment Request Generated' : 'Create Payment Request'}
            </h1>
            <p className="text-xs text-[#A7AEC4]">
              {createdPayment 
                ? 'Share the payment link or QR code with your customer to receive funds.' 
                : 'Configure crypto asset, blockchain network, and invoice details for direct settlement.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="text-xs text-[#A7AEC4] hover:text-white"
        >
          Cancel
        </button>
      </div>

      {createdPayment ? (
        /* Success / Generated Payment Link & QR View */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="generated-payment-result">
          {/* Left Column: Payment Details & Links */}
          <div className="md:col-span-7 space-y-5">
            <div className="bg-[#131A38] border border-[#20E56B]/40 rounded-2xl p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#242E5E]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#20E56B]/20 text-[#20E56B] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Payment Request Ready</h3>
                    <span className="text-[11px] font-mono text-[#A7AEC4]">ID: {createdPayment.id}</span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                  Awaiting Customer
                </span>
              </div>

              {/* Amount Display */}
              <div className="p-4 rounded-xl bg-[#0B1026] border border-[#242E5E] text-center">
                <span className="text-xs text-[#A7AEC4]">Requested Total</span>
                <div className="text-3xl font-extrabold text-white font-mono mt-1">
                  {formatTokenAmount(createdPayment.amount, createdPayment.token)}
                </div>
                <div className="text-xs text-[#A7AEC4] mt-1.5 flex items-center justify-center gap-2">
                  <TokenLogo symbol={createdPayment.token} size={18} />
                  <span className="text-white font-medium">{createdPayment.token}</span>
                  <span>•</span>
                  <span className="bg-[#131A38] px-2 py-0.5 rounded border border-[#242E5E] text-[#4D7CFE] font-medium">
                    {createdPayment.networkName}
                  </span>
                </div>
              </div>

              {/* Meta information */}
              <div className="space-y-2.5 text-xs text-[#A7AEC4]">
                <div className="flex justify-between py-1 border-b border-[#242E5E]/60">
                  <span>Description:</span>
                  <span className="text-white font-medium text-right max-w-[200px] truncate">{createdPayment.description}</span>
                </div>
                {createdPayment.customerReference && (
                  <div className="flex justify-between py-1 border-b border-[#242E5E]/60">
                    <span>Reference / Invoice:</span>
                    <span className="text-[#4D7CFE] font-mono font-medium">{createdPayment.customerReference}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-[#242E5E]/60">
                  <span>Receiving Merchant:</span>
                  <AddressDisplay 
                    address={createdPayment.merchantWallet} 
                    type="address" 
                    chainId={createdPayment.networkChainId} 
                    networkId={createdPayment.networkId}
                    chars={4} 
                  />
                </div>
                <div className="flex justify-between py-1 border-b border-[#242E5E]/60">
                  <span>Network & Rail:</span>
                  <span className="text-white font-medium">
                    {createdPayment.networkName} {createdPayment.networkChainId ? `(Chain ID ${createdPayment.networkChainId})` : `(${createdPayment.standard || 'Native Rail'})`}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Expires In:</span>
                  <span className="text-white font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>60 minutes</span>
                  </span>
                </div>
              </div>

              {/* Shareable Link Box */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-[#A7AEC4] block mb-1.5">
                  Customer Checkout URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-payment-url"
                    type="text"
                    readOnly
                    value={createdPayment.paymentUrl || ''}
                    className="w-full bg-[#0B1026] text-white font-mono text-xs rounded-xl px-3.5 py-2.5 border border-[#242E5E] select-all focus:outline-none"
                  />
                  <CopyButton text={createdPayment.paymentUrl || ''} label="Copy" className="py-2 px-3" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn-open-customer-checkout"
                  type="button"
                  onClick={() => onNavigate('checkout', createdPayment.id)}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Open Customer Checkout View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-view-tx-record"
                  type="button"
                  onClick={() => onNavigate('tx-details', createdPayment.id)}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl font-semibold text-xs bg-[#0B1026] text-white hover:bg-[#192147] border border-[#242E5E] transition-colors whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Create another button */}
            <div className="text-center">
              <button
                id="btn-create-another"
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 text-xs text-[#4D7CFE] hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create another payment request</span>
              </button>
            </div>
          </div>

          {/* Right Column: QR Code Display */}
          <div className="md:col-span-5">
            <QRCodeCard
              value={createdPayment.paymentUrl || ''}
              title="Customer Payment QR"
              subtitle={`Scan with MetaMask, Coinbase, or any Web3 wallet on ${createdPayment.networkName} to pay ${formatTokenAmount(createdPayment.amount, createdPayment.token)}.`}
              badge={createdPayment.token}
              size={190}
            />
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 sm:p-8 shadow-xl">
          {formError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" id="create-payment-form">
            {/* Amount & Asset Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Amount Input */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                  Amount <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-payment-amount"
                    type="number"
                    step="any"
                    min="0.000001"
                    placeholder="e.g. 50.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-[#0B1026] text-white text-base font-mono rounded-xl px-4 py-3 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE] transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#A7AEC4]">
                    {selectedAsset.symbol}
                  </div>
                </div>
              </div>

              {/* Multi-Chain Asset Selector Button */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                  Payment Asset & Network <span className="text-rose-400">*</span>
                </label>
                <button
                  id="btn-open-asset-modal"
                  type="button"
                  onClick={() => setIsAssetModalOpen(true)}
                  className="w-full bg-[#0B1026] hover:bg-[#192147] border border-[#242E5E] hover:border-[#4D7CFE] rounded-xl px-4 py-2.5 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <TokenLogo symbol={selectedAsset.symbol} size={28} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{selectedAsset.symbol}</span>
                        <span className="text-xs text-[#A7AEC4]">{selectedAsset.name}</span>
                      </div>
                      <div className="text-[11px] text-[#4D7CFE] font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{selectedAsset.networkName} ({selectedAsset.standard})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#A7AEC4] group-hover:text-white">
                    <span>Change</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Active Rails Quick-Pills */}
            <div>
              <span className="text-[11px] text-[#A7AEC4] block mb-2">Popular Active Rails:</span>
              <div className="flex flex-wrap gap-2">
                {getActiveImplementedAssets().map((asset) => {
                  const isCurrent = selectedAsset.id === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isCurrent
                          ? 'bg-[#0B1026] border-[#20E56B] text-white'
                          : 'bg-[#0B1026]/60 border-[#242E5E] text-[#A7AEC4] hover:text-white'
                      }`}
                    >
                      <TokenLogo symbol={asset.symbol} size={18} />
                      <span>{asset.symbol}</span>
                      <span className="text-[10px] text-[#A7AEC4] font-normal font-mono">({asset.networkName})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                Payment Description / Invoice Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-payment-desc"
                type="text"
                placeholder="e.g. Website Development Service / Subscription #1024"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-[#0B1026] text-white text-xs rounded-xl px-4 py-3 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE] transition-colors"
              />
            </div>

            {/* Optional Customer Reference & Expiration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                  Customer Reference / Order ID <span className="text-[#A7AEC4]/60 font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="input-payment-ref"
                  type="text"
                  placeholder="e.g. INV-2026-0891"
                  value={customerReference}
                  onChange={(e) => setCustomerReference(e.target.value)}
                  className="w-full bg-[#0B1026] text-white font-mono text-xs rounded-xl px-4 py-3 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                  Session Expiration Window
                </label>
                <select
                  id="select-payment-expires"
                  value={expiresInMinutes}
                  onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
                  className="w-full bg-[#0B1026] text-white text-xs rounded-xl px-4 py-3 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour (Recommended)</option>
                  <option value={1440}>24 Hours</option>
                  <option value={10080}>7 Days</option>
                </select>
              </div>
            </div>

            {/* Merchant Destination Info */}
            <div className="p-4 rounded-xl bg-[#0B1026] border border-[#242E5E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${isReceivingWalletConnected ? 'bg-[#20E56B]/15 text-[#20E56B]' : 'bg-amber-500/15 text-amber-400'}`}>
                  {isReceivingWalletConnected ? (
                    <Layers className="w-4 h-4" />
                  ) : (
                    <Wallet className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-[#A7AEC4] block text-[11px]">
                    Receiving Destination ({selectedAsset.networkName}):
                  </span>
                  {isReceivingWalletConnected ? (
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-white text-xs">
                        {shortenAddress(activeReceivingAddress, 6)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20E56B] animate-pulse" />
                        Connected
                      </span>
                      <span className="text-[#A7AEC4] text-[11px] font-medium bg-[#131A38] px-2 py-0.5 rounded border border-[#242E5E]">
                        {merchantConnectedNetworkName || selectedAsset.networkName}
                      </span>
                      <CopyButton text={activeReceivingAddress} label="Copy" className="text-[10px] py-0.5 px-2" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Merchant wallet not connected
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                {isReceivingWalletConnected ? (
                  <span className="text-[#20E56B] text-[11px] font-medium bg-[#20E56B]/10 px-2.5 py-1 rounded-md border border-[#20E56B]/20 whitespace-nowrap">
                    Direct Sovereign Settlement
                  </span>
                ) : (
                  <button
                    id="btn-connect-merchant-receiving-wallet"
                    type="button"
                    onClick={openMerchantWalletModal}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Connect Merchant Wallet</span>
                  </button>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-[#242E5E] flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                id="btn-cancel-create"
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-[#A7AEC4] hover:text-white bg-[#0B1026] hover:bg-[#192147] border border-[#242E5E] transition-colors"
              >
                Cancel
              </button>

              <button
                id="btn-submit-create-payment"
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-bold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <span>Create Payment</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Asset & Network Selector Modal */}
      <AssetSelectorModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        selectedAssetId={selectedAsset.id}
        onSelectAsset={(asset) => setSelectedAsset(asset)}
      />
    </div>
  );
}
