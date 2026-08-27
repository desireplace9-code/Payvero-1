import { ExternalLink } from 'lucide-react';
import { shortenAddress, shortenTxHash, getExplorerAddressUrl, getExplorerTxUrl } from '../config/tokens';
import { CopyButton } from './CopyButton';

interface AddressDisplayProps {
  address?: string;
  type?: 'address' | 'tx';
  chainId?: number;
  networkId?: string;
  chars?: number;
  showCopy?: boolean;
  showExplorer?: boolean;
  className?: string;
  id?: string;
}

export function AddressDisplay({
  address,
  type = 'address',
  chainId = 137,
  networkId,
  chars = 4,
  showCopy = true,
  showExplorer = true,
  className = '',
  id,
}: AddressDisplayProps) {
  if (!address) {
    return <span className="text-[#A7AEC4] text-xs italic">Not assigned</span>;
  }

  const shortened = type === 'address' ? shortenAddress(address, chars) : shortenTxHash(address, chars);
  const explorerUrl = type === 'address' ? getExplorerAddressUrl(address, chainId, networkId) : getExplorerTxUrl(address, chainId, networkId);

  return (
    <div id={id || `addr-display-${address.slice(0, 8)}`} className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      <span className="text-white select-all bg-[#0B1026] px-2 py-0.5 rounded border border-[#242E5E]" title={address}>
        {shortened}
      </span>
      {showCopy && <CopyButton text={address} />}
      {showExplorer && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-[#A7AEC4] hover:text-[#4D7CFE] hover:bg-[#131A38] rounded transition-colors"
          title={`View on Polygonscan (${type === 'address' ? 'Wallet' : 'Tx'})`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
