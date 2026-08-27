import { AppView } from '../components/Navbar';
import { PayveroLogo, PayveroIcon } from '../components/PayveroLogo';
import { TokenLogo } from '../components/TokenLogo';
import { 
  Zap, 
  Wallet, 
  BarChart3, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Link2, 
  RefreshCw, 
  ExternalLink,
  Coins
} from 'lucide-react';
import { SUPPORTED_TOKEN_LIST } from '../config/tokens';

interface LandingPageProps {
  onNavigate: (view: AppView, param?: string) => void;
  samplePaymentId?: string;
}

export function LandingPage({ onNavigate, samplePaymentId }: LandingPageProps) {
  return (
    <div className="w-full text-white" id="landing-page">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#4D7CFE]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[250px] bg-[#20E56B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Centered Brand Mark Badge */}
          <div className="mb-6 flex justify-center">
            <div className="p-3.5 bg-[#131A38]/90 border border-[#242E5E] rounded-2xl shadow-xl backdrop-blur-md inline-flex items-center gap-3">
              <PayveroLogo size="md" showSubtitle={true} badge="Polygon PoS" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Accept crypto. <span className="text-[#20E56B]">Get paid.</span> <br className="hidden sm:inline" />
            Keep it simple.
          </h1>

          {/* Problem / Solution Explanation */}
          <p className="mt-6 text-base sm:text-lg text-[#A7AEC4] max-w-2xl mx-auto leading-relaxed">
            Traditional crypto gateways are bloated with KYC roadblocks, high custodial intermediary fees, and confusing multi-chain setups. Payvero provides a clean, sovereign checkout protocol that settles crypto directly to your wallet.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-btn-get-started"
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-all shadow-lg hover:shadow-[#20E56B]/20 flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-btn-view-demo"
              type="button"
              onClick={() => onNavigate('checkout', samplePaymentId || 'pay_9821a0f')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-[#131A38] text-white hover:bg-[#192147] border border-[#242E5E] hover:border-[#4D7CFE] transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-[#4D7CFE]" />
              <span>View Customer Checkout Demo</span>
            </button>
          </div>

          {/* Value Props Bar */}
          <div className="mt-14 pt-8 border-t border-[#242E5E]/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#A7AEC4] max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#20E56B]" />
              <span className="text-white font-medium">Non-Custodial</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#20E56B]" />
              <span className="text-white font-medium">0% Payvero Fee</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#20E56B]" />
              <span className="text-white font-medium">Instant Verification</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#20E56B]" />
              <span className="text-white font-medium">Multi-Token Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-[#0B1026] border-y border-[#242E5E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built for seamless merchant payments
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#A7AEC4]">
              Everything you need to invoice, receive payments, and audit crypto revenue without blockchain complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Simple Checkout */}
            <div
              id="feature-card-simple-checkout"
              className="bg-[#131A38] border border-[#242E5E] hover:border-[#4D7CFE]/50 rounded-2xl p-6 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#20E56B]/15 border border-[#20E56B]/30 flex items-center justify-center text-[#20E56B] mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Simple Checkout</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                Generate clean, shareable payment URLs and dynamic QR codes that work effortlessly across desktop and mobile devices.
              </p>
            </div>

            {/* Feature 2: Wallet Payments */}
            <div
              id="feature-card-wallet-payments"
              className="bg-[#131A38] border border-[#242E5E] hover:border-[#4D7CFE]/50 rounded-2xl p-6 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#4D7CFE]/15 border border-[#4D7CFE]/30 flex items-center justify-center text-[#4D7CFE] mb-5">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Wallet Payments</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                Connect any browser extension (MetaMask, Rabby, Coinbase) or scan with mobile Web3 wallets to complete direct transfers.
              </p>
            </div>

            {/* Feature 3: Payment Tracking */}
            <div
              id="feature-card-payment-tracking"
              className="bg-[#131A38] border border-[#242E5E] hover:border-[#4D7CFE]/50 rounded-2xl p-6 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Payment Tracking</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                Clear distinction between wallet not connected, pending mempool transactions, confirmed receipts, and execution failures.
              </p>
            </div>

            {/* Feature 4: Merchant Dashboard */}
            <div
              id="feature-card-merchant-dashboard"
              className="bg-[#131A38] border border-[#242E5E] hover:border-[#4D7CFE]/50 rounded-2xl p-6 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Merchant Dashboard</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                Analyze revenue with strictly separated token accounting for POL, USDT, and VERSE without confusing aggregate conversions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Payment Assets */}
      <section className="py-16 bg-[#0B1026]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-[#20E56B] uppercase tracking-wider">Multi-Asset Compatibility</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Supported Payment Assets</h2>
            </div>
            <p className="text-xs text-[#A7AEC4] max-w-md">
              Low gas fees, fast finality, and robust liquidity on the Polygon and Verse ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPORTED_TOKEN_LIST.map((token) => (
              <div
                key={`${token.symbol}-${token.network}`}
                id={`asset-card-${token.symbol.toLowerCase()}`}
                className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TokenLogo symbol={token.symbol} size={42} />
                    <div>
                      <h4 className="font-bold text-white text-sm">{token.name}</h4>
                      <span className="text-xs text-[#A7AEC4]">{token.symbol}</span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#0B1026] text-[#A7AEC4] border border-[#242E5E]">
                    {token.network}
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-3 border-t border-[#242E5E]">
                  <div className="flex justify-between">
                    <span className="text-[#A7AEC4]">Contract Address:</span>
                    <span className="text-white font-mono text-[11px]">
                      {token.isNative ? 'Native Gas Token' : `${token.contractAddress.slice(0, 6)}...${token.contractAddress.slice(-4)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7AEC4]">Decimals:</span>
                    <span className="text-white font-mono">{token.decimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A7AEC4]">Type:</span>
                    <span className="text-white">{token.isNative ? 'Native Layer-1' : 'ERC-20 Standard'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[#131A38]/50 border-t border-[#242E5E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#4D7CFE] uppercase tracking-wider">Simple Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">How Payvero Works</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#A7AEC4]">
              Four transparent steps from invoice creation to verified settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-[#20E56B] text-[#0B1026] font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Create Payment</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                Specify the required amount, select the payment token (POL, USDT, or VERSE), and add an optional invoice reference.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-[#4D7CFE] text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Share Link or QR</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                Provide your customer with the direct checkout URL, embed it on your site, or display the high-contrast QR code.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Customer Pays</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                The customer connects their Web3 wallet or transfers the exact token amount straight to your designated receiving address.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-6 relative">
              <div className="w-8 h-8 rounded-full bg-[#20E56B] text-[#0B1026] font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Payment Verified</h3>
              <p className="text-xs text-[#A7AEC4] leading-relaxed">
                The transaction is verified on-chain via network block receipts and instantly credited to your dashboard metrics.
              </p>
            </div>
          </div>

          {/* Quick CTA Banner */}
          <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[#131A38] via-[#192147] to-[#131A38] border border-[#20E56B]/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Ready to accept crypto payments?</h3>
              <p className="text-xs text-[#A7AEC4] mt-1">
                Configure your merchant receiving wallet in seconds without third-party escrow.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('create-payment')}
                className="w-full md:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors"
              >
                Create Payment Link
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="w-full md:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-[#0B1026] text-white hover:bg-[#131A38] border border-[#242E5E] transition-colors"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
