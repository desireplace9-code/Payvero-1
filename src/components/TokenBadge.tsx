import { TokenSymbol } from '../types';
import { getTokenBySymbol } from '../config/tokens';
import { TokenLogo } from './TokenLogo';

interface TokenBadgeProps {
  symbol: TokenSymbol;
  showNetwork?: boolean;
  showContract?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export function TokenBadge({ symbol, showNetwork = false, size = 'md', id }: TokenBadgeProps) {
  const token = getTokenBySymbol(symbol);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2.5 font-semibold',
  };

  const logoSizes: Record<'sm' | 'md' | 'lg', number> = {
    sm: 16,
    md: 20,
    lg: 26,
  };

  const tokenSymbol = token?.symbol || symbol || 'POL';
  const tokenNameShort = (token?.name || tokenSymbol).split(' ')[0];
  const networkDisplay = (token?.network || 'Polygon').replace(' Mainnet', '');

  return (
    <div id={id || `token-badge-${tokenSymbol}`} className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded-lg border bg-[#131A38] text-white border-[#242E5E] ${sizeClasses[size]}`}
      >
        <TokenLogo symbol={tokenSymbol} size={logoSizes[size]} />
        <span className="font-semibold text-white">{tokenSymbol}</span>
        {size !== 'sm' && <span className="text-[#A7AEC4] text-[11px] font-normal">{tokenNameShort}</span>}
      </span>
      {showNetwork && (
        <span className="text-[10px] text-[#A7AEC4] bg-[#0B1026] px-1.5 py-0.5 rounded border border-[#242E5E]">
          {networkDisplay}
        </span>
      )}
    </div>
  );
}
