import { useState, useRef, useEffect } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  LogOut, 
  Unlink, 
  ChevronDown, 
  Copy, 
  ExternalLink 
} from 'lucide-react';
import { shortenAddress } from '../config/tokens';
import { PayveroLogo } from './PayveroLogo';
import { CopyButton } from './CopyButton';

export type AppView = 'landing' | 'dashboard' | 'create-payment' | 'checkout' | 'tx-details' | 'settings';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView, param?: string) => void;
  isConnected: boolean;
  walletAddress: string | null;
  onOpenWalletModal: () => void;
  onDisconnect?: () => void;
  pendingPaymentCount?: number;
}

export function Navbar({
  currentView,
  onNavigate,
  isConnected,
  walletAddress,
  onOpenWalletModal,
  onDisconnect,
  pendingPaymentCount = 0,
}: NavbarProps) {
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWalletDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDisconnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWalletDropdown(false);
    if (onDisconnect) {
      onDisconnect();
    }
  };

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

        {/* Right Controls: Network indicator & Web3 Wallet Controls */}
        <div className="flex items-center gap-2">
          {/* Network Indicator Pill */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#131A38] border border-[#242E5E] rounded-xl px-2.5 py-1.5 text-xs text-[#A7AEC4]">
            <span className="w-2 h-2 rounded-full bg-[#8247E5]" />
            <span className="text-white font-medium text-[11px]">Polygon PoS</span>
          </div>

          {/* Connected Wallet Cluster or Connect Button */}
          {isConnected && walletAddress ? (
            <div className="relative flex items-center gap-1.5" ref={dropdownRef}>
              {/* Wallet Info Pill */}
              <button
                id="btn-nav-wallet-pill"
                type="button"
                onClick={() => setShowWalletDropdown((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#131A38] text-white border border-[#20E56B]/40 hover:border-[#20E56B] transition-all cursor-pointer shadow-sm"
                title="View Connected Wallet Details"
              >
                <span className="w-2 h-2 rounded-full bg-[#20E56B] animate-pulse" />
                <span className="font-mono text-xs">{shortenAddress(walletAddress, 3)}</span>
                <ChevronDown className={`w-3 h-3 text-[#A7AEC4] transition-transform ${showWalletDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* High-Visibility Disconnect Button */}
              <button
                id="btn-nav-disconnect-wallet"
                type="button"
                onClick={handleDisconnectClick}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/35 transition-all shadow-sm cursor-pointer"
                title="Disconnect Connected Wallet"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-medium text-xs">Disconnect</span>
              </button>

              {/* Dropdown Popup on click */}
              {showWalletDropdown && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#131A38] border border-[#242E5E] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#242E5E]">
                    <span className="text-[11px] font-semibold text-[#A7AEC4] uppercase tracking-wider">Connected Account</span>
                    <span className="text-[10px] bg-[#20E56B]/20 text-[#20E56B] px-2 py-0.5 rounded-full font-semibold border border-[#20E56B]/30">
                      Polygon PoS
                    </span>
                  </div>

                  <div className="bg-[#0B1026] p-2.5 rounded-xl border border-[#242E5E] space-y-1.5">
                    <span className="text-[10px] text-[#A7AEC4] block">Address:</span>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs text-white break-all">{shortenAddress(walletAddress, 6)}</span>
                      <CopyButton text={walletAddress} label="Copy" className="text-[10px] py-1 px-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWalletDropdown(false);
                        onOpenWalletModal();
                      }}
                      className="w-full py-2 px-2.5 text-xs font-semibold rounded-xl bg-[#0B1026] hover:bg-[#182247] text-white border border-[#242E5E] transition-colors text-center cursor-pointer"
                    >
                      Wallet Details
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectClick}
                      className="w-full py-2 px-2.5 text-xs font-bold rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-nav-wallet-pill"
              type="button"
              onClick={onOpenWalletModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] border border-transparent shadow-sm transition-all cursor-pointer font-bold"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
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
