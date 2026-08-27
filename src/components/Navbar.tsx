import { Wallet, PlusCircle, LayoutDashboard, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { shortenAddress } from '../config/tokens';
import { PayveroLogo } from './PayveroLogo';

export type AppView = 'landing' | 'dashboard' | 'create-payment' | 'checkout' | 'tx-details' | 'settings';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView, param?: string) => void;
  isConnected: boolean;
  walletAddress: string | null;
  onOpenWalletModal: () => void;
  pendingPaymentCount?: number;
}

export function Navbar({
  currentView,
  onNavigate,
  isConnected,
  walletAddress,
  onOpenWalletModal,
  pendingPaymentCount = 0,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1026]/95 backdrop-blur-md border-b border-[#242E5E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div
          id="nav-brand-logo"
          onClick={() => onNavigate('landing')}
          className="cursor-pointer group hover:opacity-95 transition-opacity"
        >
          <PayveroLogo size="sm" showSubtitle={true} badge="Polygon" />
        </div>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131A38]/70 p-1 rounded-xl border border-[#242E5E]">
          <button
            id="nav-link-landing"
            type="button"
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentView === 'landing'
                ? 'bg-[#4D7CFE] text-white'
                : 'text-[#A7AEC4] hover:text-white hover:bg-[#0B1026]'
            }`}
          >
            Overview
          </button>
          <button
            id="nav-link-dashboard"
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentView === 'dashboard'
                ? 'bg-[#4D7CFE] text-white'
                : 'text-[#A7AEC4] hover:text-white hover:bg-[#0B1026]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            {pendingPaymentCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                {pendingPaymentCount}
              </span>
            )}
          </button>
          <button
            id="nav-link-create-payment"
            type="button"
            onClick={() => onNavigate('create-payment')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentView === 'create-payment'
                ? 'bg-[#20E56B] text-[#0B1026] font-bold'
                : 'text-[#A7AEC4] hover:text-white hover:bg-[#0B1026]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Payment</span>
          </button>
          <button
            id="nav-link-settings"
            type="button"
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentView === 'settings'
                ? 'bg-[#4D7CFE] text-white'
                : 'text-[#A7AEC4] hover:text-white hover:bg-[#0B1026]'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Right Controls: Network indicator & Web3 Wallet Pill */}
        <div className="flex items-center gap-2.5">
          {/* Network Indicator Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#131A38] border border-[#242E5E] rounded-xl px-2.5 py-1.5 text-xs text-[#A7AEC4]">
            <span className="w-2 h-2 rounded-full bg-[#8247E5]" />
            <span className="text-white font-medium text-[11px]">Polygon PoS</span>
          </div>

          {/* Wallet Button */}
          <button
            id="btn-nav-wallet-pill"
            type="button"
            onClick={onOpenWalletModal}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isConnected
                ? 'bg-[#131A38] text-white border-[#20E56B]/40 hover:border-[#20E56B]'
                : 'bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] border-transparent shadow-sm'
            }`}
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#20E56B] animate-pulse" />
                <span className="font-mono">{shortenAddress(walletAddress || '', 3)}</span>
              </>
            ) : (
              <>
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-[#0B1026] border-t border-[#242E5E] py-2 px-3 text-xs">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className={`px-2.5 py-1 rounded-lg ${currentView === 'landing' ? 'text-[#4D7CFE] font-bold' : 'text-[#A7AEC4]'}`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`px-2.5 py-1 rounded-lg ${currentView === 'dashboard' ? 'text-[#4D7CFE] font-bold' : 'text-[#A7AEC4]'}`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => onNavigate('create-payment')}
          className={`px-2.5 py-1 rounded-lg ${currentView === 'create-payment' ? 'text-[#20E56B] font-bold' : 'text-[#A7AEC4]'}`}
        >
          + Payment
        </button>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`px-2.5 py-1 rounded-lg ${currentView === 'settings' ? 'text-[#4D7CFE] font-bold' : 'text-[#A7AEC4]'}`}
        >
          Settings
        </button>
      </div>
    </header>
  );
}
