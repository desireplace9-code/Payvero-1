import { useState, useMemo } from 'react';
import { PaymentAsset } from '../services/chains/types';
import { 
  POPULAR_CRYPTO_SYMBOLS, 
  CRYPTO_DEFINITIONS, 
  getAssetsForCryptoSymbol, 
  ALL_ASSETS_LIST,
  getPaymentAssetById 
} from '../config/assets';
import { TokenLogo } from './TokenLogo';
import { 
  Search, 
  X, 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Info
} from 'lucide-react';

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: PaymentAsset) => void;
  selectedAssetId?: string;
  allowUnimplementedForTesting?: boolean;
}

export function AssetSelectorModal({
  isOpen,
  onClose,
  onSelectAsset,
  selectedAssetId,
  allowUnimplementedForTesting = false,
}: AssetSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string | null>(null);

  // Filtered Cryptocurrencies for Step 1
  const filteredCryptos = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return CRYPTO_DEFINITIONS.filter((crypto) => {
      if (!query) return true;
      return (
        crypto.symbol.toLowerCase().includes(query) ||
        crypto.name.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Networks available for currently selected crypto symbol in Step 2
  const availableNetworksForCrypto = useMemo(() => {
    if (!selectedCryptoSymbol) return [];
    return getAssetsForCryptoSymbol(selectedCryptoSymbol);
  }, [selectedCryptoSymbol]);

  if (!isOpen) return null;

  const handleCryptoSelect = (symbol: string) => {
    const assets = getAssetsForCryptoSymbol(symbol);
    // If only one network exists, select it directly
    if (assets.length === 1) {
      const asset = assets[0];
      onSelectAsset(asset);
      onClose();
      return;
    }
    // Otherwise open Step 2 (Network selector)
    setSelectedCryptoSymbol(symbol);
  };

  const handleNetworkSelect = (asset: PaymentAsset) => {
    onSelectAsset(asset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        id="asset-selector-modal"
        className="w-full max-w-lg bg-[#0B1026] border border-[#242E5E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#242E5E] flex items-center justify-between bg-[#131A38]/60">
          <div className="flex items-center gap-3">
            {selectedCryptoSymbol && (
              <button
                type="button"
                onClick={() => setSelectedCryptoSymbol(null)}
                className="p-1.5 rounded-lg bg-[#0B1026] text-[#A7AEC4] hover:text-white border border-[#242E5E] transition-colors"
                title="Back to crypto list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="text-base font-bold text-white">
                {selectedCryptoSymbol ? `Select Network for ${selectedCryptoSymbol}` : 'Select Payment Asset'}
              </h3>
              <p className="text-xs text-[#A7AEC4]">
                {selectedCryptoSymbol 
                  ? 'Choose the blockchain network for your payment' 
                  : 'Search by cryptocurrency symbol or network name'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#A7AEC4] hover:text-white hover:bg-[#131A38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!selectedCryptoSymbol ? (
          /* STEP 1: Search & Select Cryptocurrency */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#A7AEC4] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="asset-search-input"
                type="text"
                placeholder="Search cryptocurrency (e.g. USDT, POL, VERSE, BTC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#131A38] text-white text-xs placeholder-[#A7AEC4]/60 rounded-xl pl-10 pr-4 py-3 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE] transition-colors"
              />
            </div>

            {/* Popular Cryptos Chips */}
            <div>
              <div className="text-[11px] font-semibold text-[#A7AEC4] uppercase tracking-wider mb-2">
                Popular
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CRYPTO_SYMBOLS.map((sym) => {
                  const hasActiveRail = getAssetsForCryptoSymbol(sym).some((a) => a.isImplemented);
                  return (
                    <button
                      key={sym}
                      id={`chip-crypto-${sym.toLowerCase()}`}
                      type="button"
                      onClick={() => handleCryptoSelect(sym)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131A38] hover:bg-[#192147] border border-[#242E5E] hover:border-[#4D7CFE] text-xs font-semibold text-white transition-all"
                    >
                      <TokenLogo symbol={sym} size={18} />
                      <span>{sym}</span>
                      {hasActiveRail && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20E56B]" title="Live on Polygon" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cryptocurrency List */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-semibold text-[#A7AEC4] uppercase tracking-wider">
                All Cryptocurrencies
              </div>
              <div className="space-y-1.5">
                {filteredCryptos.map((crypto) => {
                  const assets = getAssetsForCryptoSymbol(crypto.symbol);
                  const activeRail = assets.find((a) => a.isImplemented);
                  const isSelected = selectedAssetId && assets.some((a) => a.id === selectedAssetId);

                  return (
                    <button
                      key={crypto.symbol}
                      id={`crypto-option-${crypto.symbol.toLowerCase()}`}
                      type="button"
                      onClick={() => handleCryptoSelect(crypto.symbol)}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left transition-all group ${
                        isSelected
                          ? 'bg-[#131A38] border-[#20E56B]'
                          : 'bg-[#131A38]/50 hover:bg-[#131A38] border-[#242E5E] hover:border-[#4D7CFE]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TokenLogo symbol={crypto.symbol} size={32} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{crypto.symbol}</span>
                            <span className="text-xs text-[#A7AEC4]">{crypto.name}</span>
                          </div>
                          <div className="text-[11px] text-[#A7AEC4] mt-0.5">
                            {crypto.networks.join(' • ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeRail ? (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30">
                            Active: {activeRail.networkName}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#242E5E] text-[#A7AEC4]">
                            Multi-Chain Prep
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-[#A7AEC4] group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: Network Selector for Selected Cryptocurrency */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-[#131A38] border border-[#242E5E] flex items-center gap-3">
              <TokenLogo symbol={selectedCryptoSymbol} size={32} />
              <div>
                <span className="text-xs text-[#A7AEC4]">Selected Cryptocurrency</span>
                <div className="text-sm font-bold text-white">{selectedCryptoSymbol}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-[#A7AEC4] uppercase tracking-wider">
                Available Blockchain Networks
              </div>
              <div className="space-y-2">
                {availableNetworksForCrypto.map((asset) => {
                  const isSelected = selectedAssetId === asset.id;
                  const isLive = asset.isImplemented;

                  return (
                    <button
                      key={asset.id}
                      id={`network-option-${asset.id}`}
                      type="button"
                      onClick={() => handleNetworkSelect(asset)}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-[#131A38] border-[#20E56B] ring-1 ring-[#20E56B]'
                          : isLive
                          ? 'bg-[#131A38]/80 hover:bg-[#131A38] border-[#242E5E] hover:border-[#4D7CFE]'
                          : 'bg-[#131A38]/40 hover:bg-[#131A38] border-[#242E5E] hover:border-[#4D7CFE]/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{asset.networkName}</span>
                          <span className="text-[11px] font-mono text-[#A7AEC4] bg-[#0B1026] px-2 py-0.5 rounded border border-[#242E5E]">
                            {asset.standard}
                          </span>
                        </div>
                        <div className="text-xs text-[#A7AEC4] mt-1">
                          {asset.isNative 
                            ? 'Native network gas token' 
                            : asset.contractAddress 
                            ? `Contract: ${asset.contractAddress.slice(0, 8)}...` 
                            : 'Standard token rail'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isLive ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#20E56B] font-semibold bg-[#20E56B]/15 px-2.5 py-1 rounded-lg border border-[#20E56B]/30">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Live & Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#A7AEC4] bg-[#242E5E]/60 px-2 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Preparation Phase</span>
                          </div>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-[#20E56B]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1026] border border-[#242E5E] text-xs text-[#A7AEC4] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#4D7CFE] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Payvero separates each asset and network combination strictly. Live settlements currently execute on Polygon PoS (Chain ID 137). Additional networks will activate as their on-chain verification modules are deployed.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#131A38]/80 border-t border-[#242E5E] flex items-center justify-between text-xs text-[#A7AEC4]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#20E56B]" />
            <span>Payvero Multi-Chain Architecture</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#0B1026] hover:bg-[#192147] border border-[#242E5E] text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
