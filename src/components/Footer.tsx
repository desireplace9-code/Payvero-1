import { ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';
import { AppView } from './Navbar';
import { PayveroLogo } from './PayveroLogo';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="w-full bg-[#0B1026] border-t border-[#242E5E] text-[#A7AEC4] text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#242E5E]">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div
              onClick={() => onNavigate('landing')}
              className="cursor-pointer inline-block"
            >
              <PayveroLogo size="sm" showSubtitle={true} />
            </div>
            <p className="text-xs text-[#A7AEC4] max-w-md leading-relaxed">
              Non-custodial cryptocurrency checkout and payment gateway designed for modern digital commerce, SaaS, and everyday merchants. Instant settlement straight to your sovereign wallet on Polygon PoS.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-[#20E56B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Custodial Risk</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#4D7CFE]">
                <Cpu className="w-4 h-4" />
                <span>Clean Web3 Layer</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Application
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="hover:text-white transition-colors"
                >
                  Overview & Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Merchant Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('create-payment')}
                  className="hover:text-white transition-colors"
                >
                  Create Payment Link
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  className="hover:text-white transition-colors"
                >
                  Merchant Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Assets & Network */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Supported Assets
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8247E5]" />
                <span className="text-white font-medium">POL</span>
                <span className="text-[11px] text-[#A7AEC4]">(Polygon Gas Asset)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#26A17B]" />
                <span className="text-white font-medium">USDT</span>
                <span className="text-[11px] text-[#A7AEC4]">(Tether USD Stablecoin)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4D7CFE]" />
                <span className="text-white font-medium">VERSE</span>
                <span className="text-[11px] text-[#A7AEC4]">(Verse Ecosystem Token)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A7AEC4]">
          <p>© {new Date().getFullYear()} Payvero. Non-custodial crypto payments. No private keys stored.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[#20E56B]">Polygon Mainnet • Verse Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
