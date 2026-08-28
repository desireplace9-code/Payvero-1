import { useState, type FormEvent } from 'react';
import { AppView } from '../components/Navbar';
import { TokenSymbol } from '../types';
import { SUPPORTED_TOKENS, getTokenBySymbol, isValidEvmAddress, isValidNetworkAddress, shortenAddress } from '../config/tokens';
import { ALL_ASSETS_LIST, getActiveImplementedAssets, getPaymentAssetById } from '../config/assets';
import { useMerchant } from '../hooks/useMerchant';
import { useMerchantWallet } from '../hooks/useMerchantWallet';
import { AddressDisplay } from '../components/AddressDisplay';
import { CopyButton } from '../components/CopyButton';
import { TokenLogo } from '../components/TokenLogo';
import { 
  Building2, 
  Wallet, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RotateCcw, 
  Bell,
  Globe,
  ShieldCheck,
  Link,
  Unlink,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (view: AppView) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const { merchant, updateMerchant, resetToDefault } = useMerchant();
  const {
    isConnected: isMerchantWalletConnected,
    address: merchantConnectedAddress,
    networkName: merchantConnectedNetworkName,
    isConnecting: isMerchantConnecting,
    error: merchantWalletError,
    disconnect: disconnectMerchantWallet,
    clearError: clearMerchantWalletError,
    openModal: openMerchantModal,
  } = useMerchantWallet();

  const [name, setName] = useState(merchant.name);
  const [walletAddress, setWalletAddress] = useState(merchant.walletAddress);
  const [tronWalletAddress, setTronWalletAddress] = useState(merchant.tronWalletAddress || '');
  const [bitcoinWalletAddress, setBitcoinWalletAddress] = useState(merchant.bitcoinWalletAddress || '');
  const [supportedTokens, setSupportedTokens] = useState<string[]>(() => {
    const raw = merchant.supportedTokens || ['POL', 'USDT', 'VERSE'];
    const mapped = raw.map((t) => {
      if (t === 'pol-polygon') return 'POL';
      if (t === 'usdt-polygon') return 'USDT';
      if (t === 'verse-polygon') return 'VERSE';
      return t.toUpperCase();
    });
    return Array.from(new Set(mapped));
  });
  const [defaultToken, setDefaultToken] = useState<string>(() => {
    const dt = merchant.defaultToken || 'POL';
    if (dt === 'pol-polygon') return 'POL';
    if (dt === 'usdt-polygon') return 'USDT';
    if (dt === 'verse-polygon') return 'VERSE';
    return dt.toUpperCase();
  });
  const [email, setEmail] = useState(merchant.email || '');
  const [webhookUrl, setWebhookUrl] = useState(merchant.webhookUrl || '');
  const [businessCategory, setBusinessCategory] = useState(merchant.businessCategory || '');
  const [requireRef, setRequireRef] = useState(merchant.requireCustomerReference || false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyConnectedAddress = () => {
    if (merchantConnectedAddress) {
      setWalletAddress(merchantConnectedAddress);
      setFeedback({
        type: 'success',
        message: `Applied connected receiving wallet (${shortenAddress(merchantConnectedAddress, 4)}) to Polygon & EVM settlement address. Remember to click "Save Gateway Settings".`,
      });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleToggleToken = (token: string) => {
    const norm = token.toUpperCase();
    if (supportedTokens.includes(norm)) {
      if (supportedTokens.length === 1) {
        setFeedback({ type: 'error', message: 'You must maintain at least one enabled payment token.' });
        return;
      }
      const filtered = supportedTokens.filter((t) => t !== norm);
      setSupportedTokens(filtered);
      if (defaultToken === norm) {
        setDefaultToken(filtered[0] || 'POL');
      }
    } else {
      setSupportedTokens(Array.from(new Set([...supportedTokens, norm])));
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Merchant business name cannot be empty.' });
      return;
    }

    if (!isValidEvmAddress(walletAddress)) {
      setFeedback({
        type: 'error',
        message: 'Invalid EVM / Polygon receiving wallet address. Must be a valid 42-character hex address (0x...).',
      });
      return;
    }

    if (tronWalletAddress.trim() && !isValidNetworkAddress(tronWalletAddress.trim(), 'tron')) {
      setFeedback({
        type: 'error',
        message: 'Invalid Tron wallet address. Tron base58 addresses start with T (e.g. TLyqzZyCleanAddress...).',
      });
      return;
    }

    if (bitcoinWalletAddress.trim() && !isValidNetworkAddress(bitcoinWalletAddress.trim(), 'bitcoin')) {
      setFeedback({
        type: 'error',
        message: 'Invalid Bitcoin wallet address. Supported formats: 1..., 3..., or bc1...',
      });
      return;
    }

    const res = updateMerchant({
      name: name.trim(),
      walletAddress: walletAddress.trim(),
      tronWalletAddress: tronWalletAddress.trim() || undefined,
      bitcoinWalletAddress: bitcoinWalletAddress.trim() || undefined,
      supportedTokens,
      defaultToken,
      email: email.trim() || undefined,
      webhookUrl: webhookUrl.trim() || undefined,
      businessCategory: businessCategory.trim() || undefined,
      requireCustomerReference: requireRef,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Merchant gateway settings saved successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update settings.' });
    }
  };

  const handleReset = () => {
    resetToDefault();
    setName('Acme Digital Commerce');
    setWalletAddress('');
    setTronWalletAddress('');
    setBitcoinWalletAddress('');
    setSupportedTokens(['POL', 'USDT', 'VERSE']);
    setDefaultToken('POL');
    setEmail('finance@acmedigital.io');
    setWebhookUrl('https://api.acmedigital.io/webhooks/payvero');
    setBusinessCategory('Digital Goods & Software');
    setRequireRef(false);
    setFeedback({ type: 'success', message: 'Restored default settings (wallet cleared).' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="settings-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#242E5E] gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Merchant Settings</h1>
          <p className="text-xs text-[#A7AEC4] mt-1">
            Manage your multi-chain sovereign settlement addresses, supported assets, and webhook notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs text-[#A7AEC4] hover:text-white bg-[#131A38] border border-[#242E5E] transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-[#20E56B]/15 border-[#20E56B]/40 text-[#20E56B]'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8" id="settings-form">
        {/* Section 1: Merchant Profile */}
        <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#242E5E]">
            <Building2 className="w-5 h-5 text-[#4D7CFE]" />
            <div>
              <h2 className="text-sm font-bold text-white">Merchant Business Profile</h2>
              <p className="text-xs text-[#A7AEC4]">Identifies your store to customers during checkout.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                Merchant Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-merchant-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#0B1026] text-white text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                Contact / Invoicing Email
              </label>
              <input
                id="input-merchant-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0B1026] text-white text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                Business Category
              </label>
              <input
                id="input-merchant-category"
                type="text"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                placeholder="e.g. Digital Services, SaaS, E-Commerce"
                className="w-full bg-[#0B1026] text-white text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Chain Sovereign Settlement Wallets */}
        <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 space-y-6" id="receiving-wallets-section">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#242E5E] gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#20E56B]/20 text-[#20E56B] border border-[#20E56B]/30">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Receiving Wallets & Settlement Rails</h2>
                <p className="text-xs text-[#A7AEC4]">
                  Where customer funds are directly sent on-chain. Payvero never custodies merchant funds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#20E56B] bg-[#20E56B]/10 border border-[#20E56B]/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Non-Custodial</span>
              </span>
            </div>
          </div>

          {/* Interactive Merchant Receiving Wallet Connection Box */}
          <div className="p-5 rounded-xl bg-[#0B1026] border border-[#242E5E] space-y-4" id="merchant-wallet-connector-box">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Merchant Receiving Wallet Connection</span>
                  {isMerchantWalletConnected ? (
                    <span className="text-[10px] bg-[#20E56B]/20 text-[#20E56B] px-2 py-0.5 rounded-full border border-[#20E56B]/40 font-semibold inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#20E56B] animate-pulse" />
                      Receiving Wallet Connected
                    </span>
                  ) : (
                    <span className="text-[10px] bg-[#242E5E] text-[#A7AEC4] px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#A7AEC4] mt-0.5">
                  Connect your Web3 wallet to read its public address and verify your active settlement rail.
                </p>
              </div>

              {!isMerchantWalletConnected ? (
                <button
                  id="btn-merchant-connect-receiving-wallet"
                  type="button"
                  onClick={openMerchantModal}
                  disabled={isMerchantConnecting}
                  className="px-4 py-2 text-xs font-bold bg-[#4D7CFE] hover:bg-[#3b6be6] text-white rounded-xl transition-colors disabled:opacity-50 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                >
                  {isMerchantConnecting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-3.5 h-3.5" />
                      <span>Connect Receiving Wallet</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    id="btn-merchant-apply-receiving-wallet"
                    type="button"
                    onClick={handleApplyConnectedAddress}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#20E56B] hover:bg-[#1ac95c] text-[#0B1026] rounded-xl transition-colors inline-flex items-center gap-1"
                    title="Copy connected address to Polygon & EVM settlement field"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Apply to EVM Address</span>
                  </button>
                  <button
                    id="btn-merchant-disconnect-receiving-wallet"
                    type="button"
                    onClick={disconnectMerchantWallet}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#131A38] hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl transition-colors inline-flex items-center gap-1"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>

            {/* Merchant Wallet Error Alert */}
            {merchantWalletError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-2">
                <span>{merchantWalletError}</span>
                <button
                  type="button"
                  onClick={clearMerchantWalletError}
                  className="text-white hover:underline text-[11px]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Active Connected Merchant Receiving Wallet Card */}
            {isMerchantWalletConnected && merchantConnectedAddress && (
              <div className="p-3.5 bg-[#131A38] rounded-xl border border-[#20E56B]/30 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#A7AEC4]">Public Address:</span>
                    <span className="font-mono font-bold text-white">{shortenAddress(merchantConnectedAddress, 6)}</span>
                    <CopyButton text={merchantConnectedAddress} label="Copy" className="text-[11px]" />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#A7AEC4]">Detected Network:</span>
                    <span className="font-medium text-white px-2 py-0.5 rounded bg-[#0B1026] border border-[#242E5E]">
                      {merchantConnectedNetworkName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configurable Settlement Address Form Inputs */}
          <div className="space-y-4 pt-2">
            {/* EVM / Polygon Wallet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider">
                  Polygon & EVM Receiving Wallet <span className="text-rose-400">*</span>
                </label>
                {walletAddress && (
                  <span className="text-[11px] text-[#20E56B] flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Settlement Configured</span>
                  </span>
                )}
              </div>
              <input
                id="input-merchant-wallet-address"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                required
                className="w-full bg-[#0B1026] text-white font-mono text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
              />
              <p className="text-[11px] text-[#A7AEC4] mt-1.5">
                Receives POL (Native Gas Token), USDT (Polygon PoS ERC-20), fxVERSE, and Ethereum/BNB EVM transfers.
              </p>
            </div>

            {/* Tron Wallet */}
            <div>
              <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                Tron Receiving Wallet (TRC-20 & TRX)
              </label>
              <input
                id="input-merchant-tron-address"
                type="text"
                value={tronWalletAddress}
                onChange={(e) => setTronWalletAddress(e.target.value)}
                placeholder="T..."
                className="w-full bg-[#0B1026] text-white font-mono text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
              />
              <p className="text-[11px] text-[#A7AEC4] mt-1.5">
                Receives USDT (Tron TRC-20) and TRX direct on-chain settlements.
              </p>
            </div>

            {/* Bitcoin Wallet */}
            <div>
              <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                Bitcoin Receiving Wallet (BTC Native UTXO)
              </label>
              <input
                id="input-merchant-btc-address"
                type="text"
                value={bitcoinWalletAddress}
                onChange={(e) => setBitcoinWalletAddress(e.target.value)}
                placeholder="bc1q... or 1... or 3..."
                className="w-full bg-[#0B1026] text-white font-mono text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
              />
              <p className="text-[11px] text-[#A7AEC4] mt-1.5">
                Receives Bitcoin (BTC) direct on-chain UTXO settlements.
              </p>
            </div>

            <div className="p-3 bg-[#0B1026] rounded-xl border border-[#242E5E] flex items-center justify-between text-xs">
              <span className="text-[#A7AEC4]">Active Receiving Destination:</span>
              <AddressDisplay address={walletAddress} type="address" chainId={137} chars={6} />
            </div>
          </div>
        </div>

        {/* Section 3: Supported Payment Assets */}
        <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#242E5E]">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Active Payment Tokens</h2>
              <p className="text-xs text-[#A7AEC4]">Toggle default tokens you accept for customer checkout.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['POL', 'USDT', 'VERSE'] as const).map((tok) => {
              const info = getTokenBySymbol(tok);
              const isEnabled = supportedTokens.includes(tok);
              return (
                <div
                  key={tok}
                  id={`token-setting-${tok.toLowerCase()}`}
                  onClick={() => handleToggleToken(tok)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isEnabled
                      ? 'bg-[#0B1026] border-[#20E56B]/50'
                      : 'bg-[#0B1026]/40 border-[#242E5E] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TokenLogo symbol={tok} size={20} />
                      <span className="font-bold text-white text-sm">{tok}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      className="accent-[#20E56B] w-4 h-4 rounded cursor-pointer"
                    />
                  </div>
                  <div className="text-xs text-[#A7AEC4]">{info.name}</div>
                  <div className="text-[10px] text-[#A7AEC4]/80 mt-1 font-mono">{info.network}</div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
              Default Checkout Token
            </label>
            <select
              id="select-default-token"
              value={defaultToken}
              onChange={(e) => setDefaultToken(e.target.value)}
              className="bg-[#0B1026] text-white text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
            >
              {supportedTokens.map((tok) => {
                const info = getTokenBySymbol(tok);
                return (
                  <option key={tok} value={tok}>
                    {tok} - {info.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Section 4: Webhooks & Integrations */}
        <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#242E5E]">
            <Bell className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Webhooks & Notifications</h2>
              <p className="text-xs text-[#A7AEC4]">
                Receive instant HTTP POST alerts when a customer completes on-chain verification.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
              Webhook Endpoint URL
            </label>
            <input
              id="input-merchant-webhook"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhooks/payvero"
              className="w-full bg-[#0B1026] text-white font-mono text-xs rounded-xl px-4 py-2.5 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              id="checkbox-require-ref"
              type="checkbox"
              checked={requireRef}
              onChange={(e) => setRequireRef(e.target.checked)}
              className="accent-[#20E56B] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="checkbox-require-ref" className="text-xs text-[#A7AEC4] cursor-pointer">
              Always require a Customer Reference / Order ID for all generated checkout requests
            </label>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="btn-save-settings"
            type="submit"
            className="px-6 py-3 rounded-xl text-xs font-bold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Gateway Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
