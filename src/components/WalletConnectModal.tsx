import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Wallet, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink, 
  QrCode, 
  Smartphone, 
  RefreshCw, 
  Globe, 
  Copy, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  LogOut, 
  Unlink,
  Key,
  HelpCircle,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AddressDisplay } from './AddressDisplay';
import { WalletBrandIcon } from './WalletBrandIcon';
import { EVM_CHAINS, getChainName } from '../services/wallet/chains';
import { WalletConnectorType } from '../services/wallet/types';
import { 
  SUPPORTED_MOBILE_WALLETS, 
  MobileWalletInfo, 
  formatWalletDeepLink, 
  executeWalletDeepLink,
  isInIframe,
  isMobileDevice
} from '../services/wallet/mobileWallets';
import { ConnectOptions } from '../hooks/useCustomerWallet';
import { abortWalletConnectPairing, getActiveWalletSession, isWalletConnectConfigured as checkWcConfigured } from '../services/wallet/connector';
import { ENV_CONFIG } from '../config/env';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName?: string | null;
  connectorType?: WalletConnectorType | null;
  walletId?: string | null;
  walletName?: string | null;
  approvedChains?: number[];
  supportedAssets?: string[];
  bitcoinAddress?: string | null;
  isConnecting: boolean;
  error: string | null;
  isProviderAvailable: boolean;
  isWalletConnectConfigured?: boolean;
  onConnect: (type?: WalletConnectorType, options?: ConnectOptions) => Promise<unknown>;
  onDisconnect: () => Promise<void>;
  onSwitchChain?: (chainId: number) => Promise<unknown>;
  onClearError: () => void;
  onAbort?: () => void;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  isConnected,
  address,
  chainId,
  networkName,
  connectorType,
  walletId,
  walletName,
  approvedChains = [],
  supportedAssets = [],
  bitcoinAddress,
  isConnecting,
  error,
  isProviderAvailable,
  isWalletConnectConfigured = false,
  onConnect,
  onDisconnect,
  onSwitchChain,
  onClearError,
  onAbort,
}: WalletConnectModalProps) {
  const [selectedMobileWallet, setSelectedMobileWallet] = useState<MobileWalletInfo | null>(null);
  const [pairingUri, setPairingUri] = useState<string | null>(null);
  const [pairingStatus, setPairingStatus] = useState<string>('Connecting to WalletConnect relay...');
  const [showQrFallback, setShowQrFallback] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showProjectIdSetup, setShowProjectIdSetup] = useState(false);
  const [projectIdInput, setProjectIdInput] = useState('');
  const [projectIdSavedMsg, setProjectIdSavedMsg] = useState(false);

  // Check if WalletConnect is configured (via env or localStorage)
  const isConfigured = checkWcConfigured();

  // Reset pairing state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedMobileWallet(null);
      setPairingUri(null);
      setShowQrFallback(false);
      setCopiedUri(false);
      setIsDisconnecting(false);
      setShowProjectIdSetup(false);
      setProjectIdSavedMsg(false);
    } else {
      setProjectIdInput(ENV_CONFIG.walletConnectProjectId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectInjected = async () => {
    setSelectedMobileWallet(null);
    setPairingUri(null);
    try {
      const res = await onConnect('injected');
      if (res && typeof res === 'object' && 'success' in res && (res as any).success) {
        onClose();
      }
    } catch {
      // Handled by state
    }
  };

  const handleSaveProjectId = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = projectIdInput.trim();
    if (!cleanId) return;
    
    ENV_CONFIG.setWalletConnectProjectId(cleanId);
    setProjectIdSavedMsg(true);
    setTimeout(() => {
      setProjectIdSavedMsg(false);
      setShowProjectIdSetup(false);
      onClearError();
    }, 1200);
  };

  const handleSelectMobileWallet = async (wallet: MobileWalletInfo) => {
    if (!checkWcConfigured()) {
      setShowProjectIdSetup(true);
      return;
    }

    setSelectedMobileWallet(wallet);
    setPairingUri(null);
    setPairingStatus(`Connecting to WalletConnect relay for ${wallet.name}...`);
    setShowQrFallback(wallet.id === 'generic' || !isMobileDevice());

    try {
      const res = await onConnect('walletconnect', {
        selectedWalletId: wallet.id,
        preferredChainId: chainId || 137,
        onUriReceived: (uri: string) => {
          setPairingUri(uri);
          setPairingStatus(`Opening ${wallet.name}... Please approve connection.`);
        },
        onStatusChange: (status: string) => {
          setPairingStatus(status);
        },
      });

      if (res && typeof res === 'object') {
        if ('success' in res && (res as any).success) {
          onClose();
        } else if ('success' in res && !(res as any).success) {
          // If connection failed (e.g. invalid project ID or timeout), clear pairing view to avoid infinite spinner
          setSelectedMobileWallet(null);
          setPairingUri(null);
        }
      }
    } catch {
      setSelectedMobileWallet(null);
      setPairingUri(null);
    }
  };

  const handleCancelPairing = () => {
    abortWalletConnectPairing();
    if (onAbort) onAbort();
    setSelectedMobileWallet(null);
    setPairingUri(null);
    setShowQrFallback(false);
    onClearError();
  };

  const handleCopyUri = () => {
    if (!pairingUri) return;
    try {
      navigator.clipboard.writeText(pairingUri);
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenAppAgain = () => {
    if (!selectedMobileWallet || !pairingUri) return;
    const targetUrl = activeOptimalLink || activeNativeLink || activeUniversalLink;
    if (targetUrl) {
      executeWalletDeepLink(targetUrl);
    }
  };

  const handleOpenStandaloneTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSwitchNetwork = async (targetChainId: number) => {
    if (!onSwitchChain) return;
    setIsSwitchingChain(true);
    try {
      await onSwitchChain(targetChainId);
    } finally {
      setIsSwitchingChain(false);
    }
  };

  const displayNetwork = networkName || getChainName(chainId);

  // Active deep link URLs formatted with real pairing URI
  const activeOptimalLink = selectedMobileWallet && pairingUri
    ? formatWalletDeepLink(selectedMobileWallet, pairingUri, 'optimal')
    : null;
  const activeUniversalLink = selectedMobileWallet && pairingUri
    ? formatWalletDeepLink(selectedMobileWallet, pairingUri, 'universal')
    : null;
  const activeNativeLink = selectedMobileWallet && pairingUri
    ? formatWalletDeepLink(selectedMobileWallet, pairingUri, 'native')
    : (pairingUri ? `wc:${encodeURIComponent(pairingUri)}` : null);

  const inIframe = isInIframe();

  // Active asset badges
  const activeAssets = supportedAssets.length > 0
    ? supportedAssets
    : chainId === 137
    ? ['POL', 'VERSE', 'USDT', 'USDC']
    : chainId === 1
    ? ['ETH', 'USDT', 'USDC']
    : chainId === 56
    ? ['BNB', 'USDT']
    : ['POL', 'VERSE', 'USDT'];

  return (
    <div
      id="wallet-connect-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1026]/85 backdrop-blur-md"
      onClick={() => {
        if (selectedMobileWallet && isConnecting) {
          handleCancelPairing();
        }
        onClose();
      }}
    >
      <div
        className="bg-[#131A38] border border-[#242E5E] rounded-2xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#242E5E] bg-[#111732]">
          <div className="flex items-center gap-3">
            {selectedMobileWallet && !isConnected ? (
              <button
                type="button"
                onClick={handleCancelPairing}
                className="p-1.5 -ml-1 text-[#A7AEC4] hover:text-white rounded-lg hover:bg-[#0B1026] transition-colors"
                title="Back to Wallets"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30">
                <Wallet className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {isConnected
                  ? 'Connected Web3 Account'
                  : selectedMobileWallet
                  ? `Connect ${selectedMobileWallet.name}`
                  : 'Connect Crypto Wallet'}
              </h3>
              <p className="text-xs text-[#A7AEC4]">
                {isConnected
                  ? (walletName ? `${walletName} · Active settlement` : 'Active settlement address')
                  : selectedMobileWallet
                  ? 'Launch mobile app or scan QR code'
                  : 'Select your preferred Web3 wallet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <button
                id="btn-modal-header-disconnect"
                type="button"
                onClick={async () => {
                  setIsDisconnecting(true);
                  try {
                    await onDisconnect();
                    onClose();
                  } finally {
                    setIsDisconnecting(false);
                  }
                }}
                disabled={isDisconnecting}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Disconnect this wallet"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            )}
            <button
              id="btn-close-wallet-modal"
              type="button"
              onClick={() => {
                if (selectedMobileWallet && isConnecting) {
                  handleCancelPairing();
                }
                onClose();
              }}
              className="p-1.5 text-[#A7AEC4] hover:text-white rounded-lg hover:bg-[#0B1026] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Connection Notice</p>
                <p className="mt-0.5 text-rose-200/90 leading-relaxed">{error}</p>
                <button
                  type="button"
                  onClick={onClearError}
                  className="mt-2 underline text-xs text-rose-300 hover:text-white font-medium cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* VIEW 1: CONNECTED STATE */}
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B1026] border border-[#20E56B]/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {walletId ? (
                      <WalletBrandIcon id={walletId} size={20} />
                    ) : null}
                    <span className="text-xs text-[#A7AEC4]">
                      {walletName || (connectorType === 'walletconnect' ? 'Mobile Wallet' : 'Browser Extension')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#131A38] text-[#A7AEC4] border border-[#242E5E]">
                      {connectorType === 'walletconnect' ? 'WalletConnect v2' : 'EIP-1193'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#20E56B] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#20E56B] animate-pulse" />
                      Wallet Connected
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[#A7AEC4] block mb-1">Settlement EVM Address</span>
                  <AddressDisplay address={address || ''} type="address" chainId={chainId || 137} chars={6} />
                </div>

                {/* If Bitcoin account detected */}
                {bitcoinAddress && (
                  <div className="pt-2 border-t border-[#242E5E]/60">
                    <span className="text-xs text-amber-400/90 block mb-1">Bitcoin (BTC) Address</span>
                    <div className="font-mono text-xs bg-[#131A38] p-2 rounded-lg text-white border border-[#242E5E] break-all">
                      {bitcoinAddress}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#242E5E] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A7AEC4]">Active EVM Network:</span>
                    <span className="font-mono text-white font-medium px-2.5 py-1 bg-[#131A38] rounded-lg border border-[#242E5E] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#20E56B]" />
                      {displayNetwork}
                    </span>
                  </div>

                  {/* Network Switcher */}
                  {onSwitchChain && (
                    <div className="pt-1">
                      <div className="text-[11px] text-[#A7AEC4] mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#20E56B]" />
                          <span>Switch EVM Network:</span>
                        </span>
                        <span className="text-[10px] text-[#A7AEC4]">Polygon · Ethereum · BNB</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[137, 1, 56].map((targetId) => {
                          const chainMeta = EVM_CHAINS[targetId];
                          const isCurrent = chainId === targetId;
                          return (
                            <button
                              key={targetId}
                              type="button"
                              onClick={() => handleSwitchNetwork(targetId)}
                              disabled={isCurrent || isSwitchingChain}
                              className={`py-2 px-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                                isCurrent
                                  ? 'bg-[#20E56B]/20 text-[#20E56B] border border-[#20E56B]/40'
                                  : 'bg-[#131A38] hover:bg-[#242E5E] text-[#A7AEC4] hover:text-white border border-[#242E5E]'
                              } disabled:cursor-default cursor-pointer`}
                            >
                              <span>{chainMeta.shortName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Supported Tokens Callout */}
                  <div className="pt-2 border-t border-[#242E5E]/60">
                    <div className="flex items-center justify-between text-[11px] text-[#A7AEC4] mb-1.5">
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-[#4D7CFE]" />
                        <span>Ready Assets on {displayNetwork}:</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeAssets.map((symbol) => (
                        <span
                          key={symbol}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#131A38] text-white border border-[#242E5E]"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn-disconnect-wallet"
                  type="button"
                  onClick={async () => {
                    setIsDisconnecting(true);
                    try {
                      await onDisconnect();
                      onClose();
                    } finally {
                      setIsDisconnecting(false);
                    }
                  }}
                  disabled={isDisconnecting}
                  className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isDisconnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                      <span>Disconnecting Wallet...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Disconnect Wallet</span>
                    </>
                  )}
                </button>
                <button
                  id="btn-done-wallet"
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-3 px-4 text-xs font-bold rounded-xl bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          ) : selectedMobileWallet ? (
            /* VIEW 2: ACTIVE MOBILE WALLET PAIRING & DEEP LINK VIEW */
            <div className="space-y-4">
              {/* Wallet Header & Status */}
              <div className="p-4 bg-[#0B1026] border border-[#242E5E] rounded-xl flex items-center gap-3.5">
                <WalletBrandIcon id={selectedMobileWallet.id} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{selectedMobileWallet.name}</h4>
                    {selectedMobileWallet.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30">
                        {selectedMobileWallet.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A7AEC4] mt-0.5 truncate flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#20E56B] animate-ping" />
                    <span>{pairingStatus}</span>
                  </p>
                </div>
              </div>

              {/* Action 1: Deep Link Launch Button */}
              {pairingUri ? (
                <div className="space-y-3">
                  {selectedMobileWallet.id !== 'generic' && (
                    <a
                      id={`btn-open-${selectedMobileWallet.id}-app`}
                      href={activeOptimalLink || activeNativeLink || activeUniversalLink || '#'}
                      target={inIframe ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenAppAgain();
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#20E56B] hover:bg-[#1ac95c] text-[#0B1026] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#20E56B]/15 transition-all transform active:scale-[0.99] cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Open {selectedMobileWallet.name} App</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}

                  {/* Copy Pairing URI Button (essential for Bitcoin.com / Trust Wallet paste flows) */}
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-copy-pairing-uri"
                      type="button"
                      onClick={handleCopyUri}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B1026] hover:bg-[#182247] text-xs font-semibold text-white border border-[#242E5E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {copiedUri ? (
                        <>
                          <Check className="w-4 h-4 text-[#20E56B]" />
                          <span className="text-[#20E56B]">Pairing Code Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#A7AEC4]" />
                          <span>Copy Pairing Code</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQrFallback((prev) => !prev)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        showQrFallback
                          ? 'bg-[#20E56B]/15 text-[#20E56B] border-[#20E56B]/40'
                          : 'bg-[#0B1026] text-[#A7AEC4] hover:text-white border-[#242E5E]'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{showQrFallback ? 'Hide QR' : 'Show QR'}</span>
                    </button>
                  </div>

                  {/* Mobile Return Guidance Note */}
                  <div className="p-3.5 bg-[#0B1026] border border-[#20E56B]/30 rounded-xl text-xs space-y-2.5">
                    <div className="flex items-center gap-2 text-[#20E56B] font-semibold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>Mobile Connection Steps</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-[11px] text-[#A7AEC4]">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#131A38] text-white font-bold flex items-center justify-center shrink-0 text-[10px] border border-[#242E5E]">1</span>
                        <span>Tap <strong>Open {selectedMobileWallet.name} App</strong> above.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#131A38] text-white font-bold flex items-center justify-center shrink-0 text-[10px] border border-[#242E5E]">2</span>
                        <span>Select <strong>Polygon PoS</strong>, Ethereum, or BNB and tap <strong>Connect / Approve</strong>.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#20E56B]/20 text-[#20E56B] font-bold flex items-center justify-center shrink-0 text-[10px] border border-[#20E56B]/40">3</span>
                        <span>Tap the <strong>✕</strong> icon (top-left) in the wallet or switch back to this tab. Your session is active!</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await getActiveWalletSession();
                        } catch {
                          // Ignore
                        }
                        onClose();
                      }}
                      className="w-full mt-2 py-2.5 px-3 bg-[#20E56B]/15 hover:bg-[#20E56B]/25 text-[#20E56B] rounded-lg text-xs font-semibold border border-[#20E56B]/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-[#20E56B]" />
                      <span>I've Approved in {selectedMobileWallet.name}</span>
                    </button>
                  </div>

                  {/* Iframe Preview Notice if applicable */}
                  {inIframe && (
                    <div className="p-3 bg-[#0B1026]/90 border border-[#242E5E] rounded-xl text-[11px] text-[#A7AEC4] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium flex items-center gap-1">
                          <span>Preview Iframe Mode</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleOpenStandaloneTab}
                          className="text-[#4D7CFE] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <span>Open in New Tab</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#A7AEC4] leading-relaxed">
                        Browser iframe sandboxes may restrict automatic app opening. Open Payvero in a standalone browser tab for 1-tap app launching, or scan the QR code below.
                      </p>
                    </div>
                  )}

                  {/* QR Code Fallback */}
                  {showQrFallback && (
                    <div className="p-4 bg-[#0B1026] border border-[#242E5E] rounded-xl flex flex-col items-center text-center animate-in fade-in duration-200">
                      <div className="p-3 bg-white rounded-xl shadow-inner my-1">
                        <QRCodeSVG
                          value={pairingUri}
                          size={180}
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                      <p className="text-[11px] text-[#A7AEC4] mt-2 max-w-xs">
                        Scan this QR code with <strong>{selectedMobileWallet.name}</strong> or any WalletConnect v2 app on your phone.
                      </p>
                    </div>
                  )}

                  {/* App Store / Google Play fallback info if app is not installed */}
                  {selectedMobileWallet.appStoreUrl && (
                    <div className="p-3 bg-[#0B1026]/60 border border-[#242E5E] rounded-xl text-[11px] text-[#A7AEC4] flex items-center justify-between">
                      <span>Don&apos;t have {selectedMobileWallet.shortName}?</span>
                      <div className="flex items-center gap-2 font-medium">
                        {selectedMobileWallet.appStoreUrl && (
                          <a
                            href={selectedMobileWallet.appStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4D7CFE] hover:underline flex items-center gap-0.5"
                          >
                            <span>iOS</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {selectedMobileWallet.playStoreUrl && (
                          <a
                            href={selectedMobileWallet.playStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4D7CFE] hover:underline flex items-center gap-0.5"
                          >
                            <span>Android</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Connecting Spinner / Relay Initializer */
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 bg-[#0B1026] rounded-xl border border-[#242E5E]">
                  <RefreshCw className="w-7 h-7 text-[#20E56B] animate-spin" />
                  <div>
                    <p className="text-xs font-semibold text-white">Initializing Secure Relay Connection</p>
                    <p className="text-[11px] text-[#A7AEC4] mt-0.5">Connecting to WalletConnect v2 network...</p>
                  </div>
                </div>
              )}

              {/* Cancel Button (Prevents any infinite hang) */}
              <div className="pt-2 flex justify-center">
                <button
                  id="btn-cancel-pairing"
                  type="button"
                  onClick={handleCancelPairing}
                  className="py-2 px-4 rounded-xl text-xs font-medium text-[#A7AEC4] hover:text-white bg-[#0B1026] hover:bg-[#182247] border border-[#242E5E] transition-colors cursor-pointer"
                >
                  Cancel Connection
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 3: WALLET SELECTION LIST */
            <div className="space-y-4">
              {/* Option A: Browser Extension (Injected) */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A7AEC4] mb-2">
                  Browser Extension
                </div>
                <button
                  id="btn-select-injected-wallet"
                  type="button"
                  onClick={handleConnectInjected}
                  disabled={isConnecting}
                  className="w-full p-3.5 rounded-xl border border-[#242E5E] bg-[#0B1026]/70 hover:bg-[#0B1026] hover:border-[#4D7CFE] flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <WalletBrandIcon id="metamask" size={36} />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Browser Extension</span>
                        {isProviderAvailable && (
                          <span className="text-[10px] text-[#20E56B] bg-[#20E56B]/15 px-1.5 py-0.2 rounded font-medium">
                            Detected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A7AEC4]">
                        MetaMask, Rabby, Coinbase Wallet, Brave Browser
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#A7AEC4] group-hover:text-[#4D7CFE] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Option B: Mobile Wallets & WalletConnect Deep Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7AEC4]">
                    Mobile Wallets & Instant Connect
                  </span>
                  <span className="text-[10px] text-[#20E56B] font-mono font-medium">
                    1-Tap Launch
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUPPORTED_MOBILE_WALLETS.map((wallet) => {
                    return (
                      <button
                        key={wallet.id}
                        id={`btn-select-wallet-${wallet.id}`}
                        type="button"
                        onClick={() => handleSelectMobileWallet(wallet)}
                        disabled={isConnecting}
                        className="p-3 rounded-xl border border-[#242E5E] bg-[#0B1026]/70 hover:bg-[#0B1026] hover:border-[#20E56B] flex items-center gap-3 text-left transition-all group cursor-pointer"
                      >
                        <WalletBrandIcon id={wallet.id} size={32} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{wallet.name}</span>
                            {wallet.badge && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#20E56B]/10 text-[#20E56B] border border-[#20E56B]/20">
                                {wallet.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#A7AEC4] truncate mt-0.5">{wallet.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info Callout */}
              {!isProviderAvailable && !isWalletConnectConfigured && (
                <div className="p-3.5 bg-[#0B1026] rounded-xl border border-[#242E5E] text-xs text-[#A7AEC4] space-y-1.5">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#20E56B]" />
                    <span>Wallet Connection Setup</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Configure <code className="text-white bg-[#131A38] px-1 py-0.5 rounded">VITE_WALLETCONNECT_PROJECT_ID</code> in your environment variables for live relay pairing with Bitcoin.com Wallet, Trust Wallet, and MetaMask Mobile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="p-3.5 border-t border-[#242E5E] bg-[#111732] flex items-center justify-between text-[11px] text-[#A7AEC4]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#20E56B]" />
            Non-custodial sovereign Web3 connection
          </span>
          <span>Zero private key access</span>
        </div>
      </div>
    </div>
  );
}
