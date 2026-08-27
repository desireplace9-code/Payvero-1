import { useState, useEffect, useCallback } from 'react';
import { AppView, Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WalletConnectModal } from './components/WalletConnectModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePaymentPage } from './pages/CreatePaymentPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TransactionDetailsPage } from './pages/TransactionDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useWallet } from './hooks/useWallet';
import { usePayments } from './hooks/usePayments';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const {
    isConnected,
    address,
    chainId,
    networkName,
    connectorType,
    isConnecting,
    error: walletError,
    connect,
    abortConnection,
    disconnect,
    switchChain,
    clearError,
    isProviderAvailable,
    isWalletConnectConfigured,
  } = useWallet();

  const { payments } = usePayments();
  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  // Hash-based router listener for direct links & sharing
  const parseHash = useCallback(() => {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) {
      // Default to landing
      return;
    }

    if (hash.startsWith('checkout/')) {
      const id = hash.replace('checkout/', '');
      setCurrentView('checkout');
      setViewParam(id);
    } else if (hash.startsWith('tx/') || hash.startsWith('details/')) {
      const id = hash.replace('tx/', '').replace('details/', '');
      setCurrentView('tx-details');
      setViewParam(id);
    } else if (hash === 'dashboard') {
      setCurrentView('dashboard');
      setViewParam(undefined);
    } else if (hash === 'create-payment' || hash === 'create') {
      setCurrentView('create-payment');
      setViewParam(undefined);
    } else if (hash === 'settings') {
      setCurrentView('settings');
      setViewParam(undefined);
    } else if (hash === 'landing' || hash === '') {
      setCurrentView('landing');
      setViewParam(undefined);
    }
  }, []);

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [parseHash]);

  const handleNavigate = (view: AppView, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL hash
    if (view === 'checkout' && param) {
      window.location.hash = `#checkout/${param}`;
    } else if (view === 'tx-details' && param) {
      window.location.hash = `#tx/${param}`;
    } else if (view === 'dashboard') {
      window.location.hash = '#dashboard';
    } else if (view === 'create-payment') {
      window.location.hash = '#create-payment';
    } else if (view === 'settings') {
      window.location.hash = '#settings';
    } else {
      window.location.hash = '#landing';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1026] text-white selection:bg-[#20E56B]/30 selection:text-[#20E56B]">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isConnected={isConnected}
        walletAddress={address}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        pendingPaymentCount={pendingCount}
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            samplePaymentId={payments[0]?.id}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} />
        )}

        {currentView === 'create-payment' && (
          <CreatePaymentPage onNavigate={handleNavigate} />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            paymentId={viewParam}
            onNavigate={handleNavigate}
            onOpenWalletModal={() => setIsWalletModalOpen(true)}
          />
        )}

        {currentView === 'tx-details' && (
          <TransactionDetailsPage
            paymentId={viewParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'settings' && (
          <SettingsPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Web3 Wallet Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnected={isConnected}
        address={address}
        chainId={chainId}
        networkName={networkName}
        connectorType={connectorType}
        isConnecting={isConnecting}
        error={walletError}
        isProviderAvailable={isProviderAvailable}
        isWalletConnectConfigured={isWalletConnectConfigured}
        onConnect={connect}
        onDisconnect={disconnect}
        onSwitchChain={switchChain}
        onClearError={clearError}
        onAbort={abortConnection}
      />
    </div>
  );
}
