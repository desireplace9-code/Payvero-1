import { useState, useEffect } from 'react';
import { AppView } from '../components/Navbar';
import { Payment } from '../types';
import { formatTokenAmount, isValidTxHash, shortenAddress } from '../config/tokens';
import { getPaymentAssetById, DEFAULT_PAYMENT_ASSET } from '../config/assets';
import { usePayments } from '../hooks/usePayments';
import { useCustomerWallet } from '../hooks/useCustomerWallet';
import { StatusBadge } from '../components/StatusBadge';
import { AddressDisplay } from '../components/AddressDisplay';
import { CopyButton } from '../components/CopyButton';
import { QRCodeCard } from '../components/QRCodeCard';
import { PayveroIcon } from '../components/PayveroLogo';
import { TokenLogo } from '../components/TokenLogo';
import { WalletConnectModal } from '../components/WalletConnectModal';
import { blockchainService } from '../services/blockchain';
import { blockchainRegistry } from '../services/chains/registry';
import { 
  Wallet, 
  CreditCard, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers,
  RefreshCw,
  Search,
  Globe,
  ShieldCheck,
  AlertTriangle,
  Unlink,
  ExternalLink
} from 'lucide-react';

interface CheckoutPageProps {
  paymentId?: string;
  onNavigate: (view: AppView, param?: string) => void;
  onOpenWalletModal: () => void;
}

export function CheckoutPage({ paymentId, onNavigate }: CheckoutPageProps) {
  const { payments, getPayment, updateStatus } = usePayments();
  const {
    isConnected: isCustomerWalletConnected,
    address: customerAddress,
    chainId: customerChainId,
    networkName: customerNetworkName,
    connectorType: customerConnectorType,
    isConnecting: isCustomerConnecting,
    error: customerWalletError,
    connect: connectCustomerWallet,
    abortConnection: abortCustomerConnection,
    disconnect: disconnectCustomerWallet,
    switchChain: switchCustomerChain,
    clearError: clearCustomerWalletError,
    sendPayment: sendCustomerPayment,
    isProviderAvailable: isCustomerProviderAvailable,
    isWalletConnectConfigured: isCustomerWalletConnectConfigured,
  } = useCustomerWallet();

  const [isCustomerWalletModalOpen, setIsCustomerWalletModalOpen] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [manualTxHash, setManualTxHash] = useState('');
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);
  const [showManualVerify, setShowManualVerify] = useState(false);

  // Load payment details
  useEffect(() => {
    if (paymentId) {
      const found = getPayment(paymentId);
      if (found) {
        setPayment(found);
      } else {
        const first = payments[0] || null;
        setPayment(first);
      }
    } else if (payments.length > 0) {
      setPayment(payments[0]);
    }
  }, [paymentId, payments, getPayment]);

  // Determine payment asset metadata
  const assetInfo = payment 
    ? (getPaymentAssetById(payment.assetId || `${payment.token.toLowerCase()}-polygon`) || DEFAULT_PAYMENT_ASSET)
    : DEFAULT_PAYMENT_ASSET;

  const isNetworkImplemented = payment 
    ? blockchainRegistry.isAdapterImplemented(payment.networkId || 'polygon')
    : true;

  const isPolygonPayment = !payment?.networkId || payment.networkId === 'polygon';
  const isWrongEvmNetwork = isPolygonPayment && isCustomerWalletConnected && customerChainId !== 137;

  // Execute payment via connected Web3 provider
  const handleExecutePayment = async () => {
    if (!payment) return;
    setErrorMessage(null);
    setInfoMessage(null);

    if (!isCustomerWalletConnected || !customerAddress) {
      const connectResult = await connectCustomerWallet();
      if (!connectResult.success) {
        return;
      }
    }

    setIsProcessing(true);

    try {
      const result = await sendCustomerPayment(payment);

      if (!result.success || !result.txHash) {
        setErrorMessage(result.error || 'Payment execution failed.');
        setIsProcessing(false);
        return;
      }

      // Real transaction hash broadcasted to network
      setInfoMessage(`Transaction broadcasted: ${result.txHash}. Waiting for block inclusion...`);

      // Update payment status to pending with real broadcasted hash and customer address
      const updated = updateStatus(payment.id, 'pending', {
        txHash: result.txHash,
        customerWallet: customerAddress || undefined,
      });
      if (updated) {
        setPayment(updated);
      }

      // Check on-chain receipt verification
      const verification = await blockchainService.verifyPayment(result.txHash, payment);
      if (verification.isConfirmed) {
        const confirmedPayment = updateStatus(payment.id, 'confirmed', {
          txHash: result.txHash,
          customerWallet: customerAddress || undefined,
          confirmedAt: verification.checkedAt,
        });
        if (confirmedPayment) {
          setPayment(confirmedPayment);
        }
        setInfoMessage('Payment verified and confirmed on Polygon PoS!');
      } else if (verification.status === 'failed') {
        const failedPayment = updateStatus(payment.id, 'failed', {
          errorMessage: verification.error || 'On-chain transaction execution reverted.',
        });
        if (failedPayment) {
          setPayment(failedPayment);
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMessage(errorObj.message || 'Payment execution error.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch network helper
  const handleSwitchNetwork = async () => {
    const targetChainId = payment?.networkChainId || 137;
    const res = await switchCustomerChain(targetChainId);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  // Verify manual transaction hash
  const handleVerifyManualTx = async () => {
    if (!payment) return;
    if (!isValidTxHash(manualTxHash)) {
      setErrorMessage('Please enter a valid 66-character EVM transaction hash starting with 0x.');
      return;
    }

    setIsVerifyingManual(true);
    setErrorMessage(null);

    try {
      const verification = await blockchainService.verifyPayment(manualTxHash.trim(), payment);

      if (verification.isConfirmed) {
        const updated = updateStatus(payment.id, 'confirmed', {
          txHash: manualTxHash.trim(),
          confirmedAt: verification.checkedAt,
        });
        if (updated) setPayment(updated);
        setInfoMessage('Transaction verified and confirmed on-chain!');
      } else {
        const updated = updateStatus(payment.id, verification.status, {
          txHash: manualTxHash.trim(),
          errorMessage: verification.error,
        });
        if (updated) setPayment(updated);
        setErrorMessage(
          verification.error || `Transaction is still awaiting block confirmation on ${payment.networkName || 'Polygon'}.`
        );
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setErrorMessage(errorObj.message || 'Failed to verify transaction receipt.');
    } finally {
      setIsVerifyingManual(false);
    }
  };

  if (!payment) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-white" id="checkout-empty">
        <div className="p-8 bg-[#131A38] border border-[#242E5E] rounded-2xl space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold">Payment Not Found</h2>
          <p className="text-xs text-[#A7AEC4]">
            The payment link you visited is expired, invalid, or does not exist.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="mt-4 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c]"
          >
            Go to Merchant Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="customer-checkout-page">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          id="btn-checkout-back"
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 text-xs text-[#A7AEC4] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#A7AEC4]">Customer Checkout</span>
          <StatusBadge status={payment.status} size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Checkout Card */}
        <div className="md:col-span-7 space-y-5">
          <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Merchant Brand Header */}
            <div className="flex items-center justify-between pb-5 border-b border-[#242E5E]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20E56B] to-[#4D7CFE] flex items-center justify-center font-extrabold text-[#0B1026] text-sm">
                  PV
                </div>
                <div>
                  <div className="text-xs text-[#A7AEC4]">Pay to Merchant</div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Acme Digital Commerce</h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#A7AEC4] block">Invoice Ref</span>
                <span className="text-xs font-mono font-semibold text-[#4D7CFE]">
                  {payment.customerReference || payment.id.slice(0, 10)}
                </span>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="my-5 p-5 bg-[#0B1026] border border-[#242E5E] rounded-xl text-center">
              <span className="text-xs text-[#A7AEC4]">Amount Due</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono my-1">
                {formatTokenAmount(payment.amount, payment.token)}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[#A7AEC4]">
                <TokenLogo symbol={payment.token} size={18} />
                <span className="font-medium text-white">{payment.token}</span>
                <span>•</span>
                <span className="text-[#4D7CFE] font-medium">{payment.networkName || 'Polygon PoS'}</span>
                <span>({assetInfo.standard})</span>
              </div>
            </div>

            {/* Network Readiness Status Banner */}
            {!isNetworkImplemented && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <p className="font-semibold">Network Adapter Notice</p>
                  <p className="text-[11px] text-amber-200 mt-0.5 leading-relaxed">
                    The {payment.networkName} payment rail is currently configured for direct transfer. Live in-browser Web3 signing is active for Polygon PoS (POL, USDT, VERSE).
                  </p>
                </div>
              </div>
            )}

            {/* Customer Wallet Connection Section */}
            <div className="p-4 rounded-xl bg-[#0B1026] border border-[#242E5E] space-y-3" id="customer-wallet-section">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-[#4D7CFE]" />
                  <span>Customer Wallet:</span>
                </span>
                {isCustomerWalletConnected && customerAddress ? (
                  <span className="text-[10px] bg-[#20E56B]/20 text-[#20E56B] px-2 py-0.5 rounded font-semibold border border-[#20E56B]/40 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#20E56B] animate-pulse" />
                    Wallet Connected
                  </span>
                ) : (
                  <span className="text-[10px] text-[#A7AEC4]">Not Connected</span>
                )}
              </div>

              {isCustomerWalletConnected && customerAddress ? (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#A7AEC4]">Address:</span>
                      <span className="font-mono font-medium text-white">{shortenAddress(customerAddress, 4)}</span>
                      <CopyButton text={customerAddress} label="Copy" className="text-[10px]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#A7AEC4]">Network:</span>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${isWrongEvmNetwork ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-[#131A38] text-white border-[#242E5E]'}`}>
                        {customerNetworkName}
                      </span>
                      <button
                        id="btn-customer-disconnect-wallet"
                        type="button"
                        onClick={disconnectCustomerWallet}
                        className="text-[11px] text-rose-400 hover:text-rose-300 ml-1 inline-flex items-center gap-0.5"
                      >
                        <Unlink className="w-3 h-3" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>

                  {isWrongEvmNetwork && (
                    <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs text-amber-200">
                      <span>Connected to wrong network. Please switch to Polygon PoS (Chain ID 137).</span>
                      <button
                        type="button"
                        onClick={handleSwitchNetwork}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-[#0B1026] rounded-md hover:bg-amber-400"
                      >
                        Switch Network
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-customer-connect-wallet"
                  type="button"
                  onClick={() => setIsCustomerWalletModalOpen(true)}
                  disabled={isCustomerConnecting}
                  className="w-full py-2.5 px-4 text-xs font-bold bg-[#4D7CFE] hover:bg-[#3b6be6] text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCustomerConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting Customer Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Connect Wallet to Pay</span>
                    </>
                  )}
                </button>
              )}

              {customerWalletError && (
                <div className="p-2 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-center justify-between">
                  <span>{customerWalletError}</span>
                  <button type="button" onClick={clearCustomerWalletError} className="hover:underline">
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Description & Settlement Parameters */}
            <div className="space-y-3 text-xs pt-2">
              <div className="flex justify-between py-2 border-b border-[#242E5E]">
                <span className="text-[#A7AEC4]">Payment For:</span>
                <span className="text-white font-medium text-right max-w-[220px]">{payment.description}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#242E5E]">
                <span className="text-[#A7AEC4]">Receiving Destination:</span>
                <AddressDisplay 
                  address={payment.merchantWallet} 
                  type="address" 
                  chainId={payment.networkChainId || 137} 
                  networkId={payment.networkId}
                  chars={4} 
                />
              </div>
              <div className="flex justify-between py-2 border-b border-[#242E5E]">
                <span className="text-[#A7AEC4]">Blockchain Rail:</span>
                <span className="text-white font-medium">
                  {payment.networkName || 'Polygon PoS'} {payment.networkChainId ? `(Chain ID ${payment.networkChainId})` : `(${assetInfo.standard})`}
                </span>
              </div>
              {payment.tokenContract && (
                <div className="flex justify-between py-2 border-b border-[#242E5E]">
                  <span className="text-[#A7AEC4]">Asset Contract:</span>
                  <AddressDisplay 
                    address={payment.tokenContract} 
                    type="address" 
                    chainId={payment.networkChainId || 137} 
                    networkId={payment.networkId}
                    chars={4} 
                  />
                </div>
              )}
            </div>

            {/* Error / Info notices */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Notice</p>
                  <p className="mt-0.5 text-rose-200">{errorMessage}</p>
                </div>
              </div>
            )}

            {infoMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#20E56B]/15 border border-[#20E56B]/30 text-[#20E56B] text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Status Update</p>
                  <p className="mt-0.5 text-white font-mono">{infoMessage}</p>
                </div>
              </div>
            )}

            {/* State-Based Action Controls */}
            <div className="mt-6 pt-2 space-y-3">
              {payment.status === 'confirmed' ? (
                /* Confirmed State */
                <div className="p-4 rounded-xl bg-[#20E56B]/15 border border-[#20E56B]/40 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#20E56B] text-[#0B1026] font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#20E56B]">Payment Confirmed</h3>
                  <p className="text-xs text-white max-w-xs mx-auto">
                    This transaction has been confirmed on-chain and credited to the merchant.
                  </p>
                  {payment.txHash && (
                    <div className="pt-2">
                      <span className="text-[11px] text-[#A7AEC4] block mb-1">Receipt Hash</span>
                      <AddressDisplay address={payment.txHash} type="tx" chainId={payment.networkChainId || 137} networkId={payment.networkId} chars={6} />
                    </div>
                  )}
                </div>
              ) : payment.networkId === 'bitcoin' ? (
                /* Specialized Bitcoin UTXO Payment Box */
                <div className="space-y-4">
                  <div className="p-4 bg-[#0B1026] rounded-xl border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TokenLogo symbol="BTC" size={16} />
                        <span>Bitcoin Direct UTXO Transfer</span>
                      </span>
                      <span className="text-[10px] text-[#A7AEC4] bg-[#131A38] px-2 py-0.5 rounded border border-[#242E5E]">
                        Mempool Broadcast
                      </span>
                    </div>

                    <p className="text-xs text-[#A7AEC4] leading-relaxed">
                      Transfer exactly <strong className="text-white">{formatTokenAmount(payment.amount, payment.token)}</strong> to the Bitcoin address below from any Bitcoin wallet:
                    </p>

                    <div className="p-3 bg-[#131A38] rounded-xl border border-[#242E5E] flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-white break-all select-all">
                        {payment.merchantWallet}
                      </span>
                      <AddressDisplay 
                        address={payment.merchantWallet} 
                        type="address" 
                        networkId="bitcoin" 
                        chars={4} 
                        className="shrink-0"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <a
                        href={`bitcoin:${payment.merchantWallet}?amount=${payment.amount}&label=Payvero%20Payment`}
                        className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#F7931A] hover:bg-[#e08212] text-[#0B1026] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Open in Bitcoin Wallet</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowManualVerify(true)}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#131A38] hover:bg-[#192147] border border-[#242E5E] text-[#A7AEC4] hover:text-white transition-colors"
                      >
                        Verify TXID
                      </button>
                    </div>
                  </div>

                  {/* Manual Bitcoin TXID Verification */}
                  {showManualVerify && (
                    <div className="p-4 bg-[#0B1026] rounded-xl border border-[#242E5E] text-left space-y-3">
                      <label className="text-xs font-semibold text-white block">
                        Enter Bitcoin Transaction ID (TXID)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="input-manual-tx-hash"
                          type="text"
                          placeholder="e.g. 9e88a31e847be68a8677c7f0db43d22b..."
                          value={manualTxHash}
                          onChange={(e) => setManualTxHash(e.target.value)}
                          className="flex-1 bg-[#131A38] text-white font-mono text-xs rounded-xl px-3 py-2 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
                        />
                        <button
                          id="btn-verify-manual-hash"
                          type="button"
                          onClick={handleVerifyManualTx}
                          disabled={isVerifyingManual}
                          className="px-4 py-2 text-xs font-bold bg-[#4D7CFE] hover:bg-[#3b6be6] text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isVerifyingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          <span>Verify</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[#A7AEC4]">
                        Enter the 64-character Bitcoin transaction hash from your wallet receipt to link this payment.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* EVM / Polygon Payment Controls */
                <div className="space-y-3">
                  {!isCustomerWalletConnected ? (
                    <button
                      id="btn-checkout-connect-wallet"
                      type="button"
                      onClick={() => setIsCustomerWalletModalOpen(true)}
                      disabled={isCustomerConnecting}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-[#4D7CFE] hover:bg-[#3b6be6] text-white transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet to Pay</span>
                    </button>
                  ) : (
                    <button
                      id="btn-checkout-pay-now"
                      type="button"
                      onClick={handleExecutePayment}
                      disabled={isProcessing || isWrongEvmNetwork}
                      className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Signing & Broadcasting Transaction...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Pay {formatTokenAmount(payment.amount, payment.token)}</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Manual On-Chain Hash Verification Collapsible */}
                  <div className="pt-3 border-t border-[#242E5E]/60 text-center">
                    <button
                      type="button"
                      onClick={() => setShowManualVerify(!showManualVerify)}
                      className="text-xs text-[#A7AEC4] hover:text-white inline-flex items-center gap-1"
                    >
                      <span>Paid via external wallet or exchange?</span>
                      <span className="text-[#4D7CFE] underline">
                        {showManualVerify ? 'Hide verification form' : 'Verify by Tx Hash'}
                      </span>
                    </button>

                    {showManualVerify && (
                      <div className="mt-3 p-4 bg-[#0B1026] rounded-xl border border-[#242E5E] text-left space-y-3">
                        <label className="text-xs font-semibold text-white block">
                          Paste On-Chain Transaction Hash
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="input-manual-tx-hash"
                            type="text"
                            placeholder={payment.networkId === 'bitcoin' ? 'TXID...' : '0x...'}
                            value={manualTxHash}
                            onChange={(e) => setManualTxHash(e.target.value)}
                            className="flex-1 bg-[#131A38] text-white font-mono text-xs rounded-xl px-3 py-2 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
                          />
                          <button
                            id="btn-verify-manual-hash"
                            type="button"
                            onClick={handleVerifyManualTx}
                            disabled={isVerifyingManual}
                            className="px-4 py-2 text-xs font-bold bg-[#4D7CFE] hover:bg-[#3b6be6] text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isVerifyingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                            <span>Verify</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[#A7AEC4]">
                          Payvero will query the network explorer to verify the block inclusion receipt on {payment.networkName || 'Polygon'}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Footer */}
            <div className="mt-5 pt-3 border-t border-[#242E5E] flex items-center justify-between text-[11px] text-[#A7AEC4]">
              <span className="flex items-center gap-1.5 text-white font-medium">
                <PayveroIcon size={16} />
                <span>Secured by Payvero</span>
              </span>
              <span className="flex items-center gap-1 text-[#20E56B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Direct sovereign transfer</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Scan & Pay QR Code & Instructions */}
        <div className="md:col-span-5 space-y-5">
          <QRCodeCard
            value={payment.paymentUrl || (typeof window !== 'undefined' ? window.location.href : '')}
            title="Scan with Mobile Wallet"
            subtitle={`Scan to pay ${formatTokenAmount(payment.amount, payment.token)} on ${payment.networkName || 'Polygon'}.`}
            badge={payment.token}
            size={180}
          />

          {/* Network Details Note */}
          <div className="bg-[#131A38] border border-[#242E5E] rounded-xl p-4 text-xs text-[#A7AEC4] space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#4D7CFE]" />
              <span>Multi-Chain Architecture Note</span>
            </h4>
            <p className="text-[11px] leading-relaxed">
              This invoice is configured for <strong className="text-white">{payment.token}</strong> on <strong className="text-white">{payment.networkName || 'Polygon PoS'}</strong> ({assetInfo.standard}). Funds transfer directly to the merchant receiving wallet without intermediary custody.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isCustomerWalletModalOpen}
        onClose={() => setIsCustomerWalletModalOpen(false)}
        isConnected={isCustomerWalletConnected}
        address={customerAddress}
        chainId={customerChainId}
        networkName={customerNetworkName}
        connectorType={customerConnectorType}
        isConnecting={isCustomerConnecting}
        error={customerWalletError}
        isProviderAvailable={isCustomerProviderAvailable}
        isWalletConnectConfigured={isCustomerWalletConnectConfigured}
        onConnect={connectCustomerWallet}
        onDisconnect={disconnectCustomerWallet}
        onSwitchChain={switchCustomerChain}
        onClearError={clearCustomerWalletError}
        onAbort={abortCustomerConnection}
      />
    </div>
  );
}

