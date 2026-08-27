import { QRCodeSVG } from 'qrcode.react';
import { CopyButton } from './CopyButton';
import { ShieldCheck, QrCode } from 'lucide-react';

interface QRCodeCardProps {
  value: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  size?: number;
  id?: string;
}

export function QRCodeCard({
  value,
  title = 'Scan to Pay',
  subtitle = 'Scan with MetaMask, Coinbase Wallet, or any Web3 mobile wallet',
  badge,
  size = 180,
  id,
}: QRCodeCardProps) {
  return (
    <div
      id={id || 'qr-code-container'}
      className="bg-[#131A38] border border-[#242E5E] rounded-xl p-5 flex flex-col items-center text-center shadow-lg"
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#20E56B]" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {badge && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30">
            {badge}
          </span>
        )}
      </div>

      {/* QR Code Container with white padding for optical scanning contrast */}
      <div className="p-3 bg-white rounded-xl shadow-inner my-2">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>

      <p className="text-xs text-[#A7AEC4] max-w-xs mt-2">{subtitle}</p>

      <div className="mt-4 pt-3 border-t border-[#242E5E] w-full flex items-center justify-between gap-2">
        <span className="text-xs text-[#A7AEC4] truncate font-mono max-w-[200px]" title={value}>
          {value}
        </span>
        <CopyButton text={value} label="Copy Link" />
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#A7AEC4]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#20E56B]" />
        <span>Direct non-custodial transfer</span>
      </div>
    </div>
  );
}
