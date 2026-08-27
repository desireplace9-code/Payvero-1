import { useState, useMemo } from 'react';
import { Payment } from '../types';
import { StatusBadge } from './StatusBadge';
import { TokenBadge } from './TokenBadge';
import { AddressDisplay } from './AddressDisplay';
import { formatTokenAmount } from '../config/tokens';
import { Search, ArrowUpDown, Eye, Filter, Globe } from 'lucide-react';

interface TransactionTableProps {
  payments: Payment[];
  onSelectPayment: (paymentId: string) => void;
  onNewPaymentClick?: () => void;
}

export function TransactionTable({ payments, onSelectPayment, onNewPaymentClick }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Token filter
        if (selectedToken !== 'ALL' && p.token !== selectedToken && p.assetId !== selectedToken) {
          return false;
        }
        // Status filter
        if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchDesc = p.description.toLowerCase().includes(term);
          const matchHash = p.txHash?.toLowerCase().includes(term);
          const matchCust = p.customerWallet?.toLowerCase().includes(term);
          const matchRef = p.customerReference?.toLowerCase().includes(term);
          const matchId = p.id.toLowerCase().includes(term);
          const matchNetwork = p.networkName?.toLowerCase().includes(term);
          return matchDesc || matchHash || matchCust || matchRef || matchId || matchNetwork;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [payments, selectedToken, selectedStatus, searchTerm, sortOrder]);

  return (
    <div className="bg-[#131A38] border border-[#242E5E] rounded-xl overflow-hidden shadow-lg" id="transactions-section">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-[#242E5E] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Recent Transactions</h3>
          <p className="text-xs text-[#A7AEC4] mt-0.5">
            Complete on-chain and pending checkout history for your sovereign merchant account.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#A7AEC4] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="tx-search-input"
              type="text"
              placeholder="Search desc, hash, wallet, network..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B1026] text-white placeholder-[#A7AEC4]/60 text-xs rounded-lg pl-9 pr-3 py-2 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE] transition-colors"
            />
          </div>

          {/* Token Filter */}
          <div className="flex items-center gap-1 bg-[#0B1026] border border-[#242E5E] rounded-lg p-1">
            <Filter className="w-3 h-3 text-[#A7AEC4] ml-1.5" />
            {(['ALL', 'POL', 'USDT', 'VERSE', 'BTC', 'ETH'] as const).map((tok) => (
              <button
                key={tok}
                id={`filter-token-${tok.toLowerCase()}`}
                type="button"
                onClick={() => setSelectedToken(tok)}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                  selectedToken === tok
                    ? 'bg-[#4D7CFE] text-white'
                    : 'text-[#A7AEC4] hover:text-white'
                }`}
              >
                {tok}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            id="filter-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0B1026] text-white text-xs rounded-lg px-3 py-2 border border-[#242E5E] focus:outline-none focus:border-[#4D7CFE]"
          >
            <option value="ALL">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort Toggle */}
          <button
            id="btn-sort-toggle"
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-2 bg-[#0B1026] text-[#A7AEC4] hover:text-white rounded-lg border border-[#242E5E] hover:border-[#4D7CFE] transition-colors"
            title={`Sort Date: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#A7AEC4]" id="payments-data-table">
          <thead className="bg-[#0B1026] text-[#A7AEC4] uppercase tracking-wider font-semibold border-b border-[#242E5E]">
            <tr>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Customer Wallet</th>
              <th className="py-3 px-4">Asset & Network</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Tx Hash</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242E5E]">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <p className="text-sm font-medium text-white">No transactions found</p>
                    <p className="text-xs text-[#A7AEC4] mt-1">
                      {searchTerm || selectedToken !== 'ALL' || selectedStatus !== 'ALL'
                        ? 'Try adjusting your search query or active filters.'
                        : 'You have not created or received any payment requests yet.'}
                    </p>
                    {onNewPaymentClick && (
                      <button
                        id="btn-empty-create-payment"
                        onClick={onNewPaymentClick}
                        className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#20E56B] text-[#0B1026] hover:bg-[#1ac95c] transition-colors"
                      >
                        Create First Payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => {
                const dateObj = new Date(p.createdAt);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });

                return (
                  <tr
                    key={p.id}
                    id={`tx-row-${p.id}`}
                    onClick={() => onSelectPayment(p.id)}
                    className="hover:bg-[#192147]/50 cursor-pointer transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-white font-medium">{formattedDate}</div>
                      <div className="text-[11px] text-[#A7AEC4] font-mono">{formattedTime} UTC</div>
                    </td>

                    {/* Description & Ref */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="text-white font-medium truncate" title={p.description}>
                        {p.description}
                      </div>
                      {p.customerReference && (
                        <div className="text-[11px] text-[#4D7CFE] font-mono truncate" title={p.customerReference}>
                          Ref: {p.customerReference}
                        </div>
                      )}
                    </td>

                    {/* Customer Wallet */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <AddressDisplay
                        address={p.customerWallet}
                        type="address"
                        chainId={p.networkChainId || 137}
                        chars={4}
                        showExplorer={false}
                      />
                    </td>

                    {/* Asset & Network */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <TokenBadge symbol={p.token} size="sm" />
                        <span className="text-[10px] text-[#A7AEC4] font-mono bg-[#0B1026] px-1.5 py-0.5 rounded border border-[#242E5E]">
                          {p.networkName || 'Polygon'}
                        </span>
                      </div>
                    </td>

                    {/* Amount - STRICT TOKEN SYMBOL */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <span className="font-mono font-bold text-white text-sm">
                        {formatTokenAmount(p.amount, p.token)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <StatusBadge status={p.status} size="sm" />
                    </td>

                    {/* Tx Hash */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.txHash ? (
                        <AddressDisplay
                          address={p.txHash}
                          type="tx"
                          chainId={p.networkChainId || 137}
                          chars={4}
                        />
                      ) : (
                        <span className="text-xs text-[#A7AEC4] italic">Awaiting on-chain tx</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        id={`btn-view-details-${p.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPayment(p.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#0B1026] text-[#A7AEC4] group-hover:text-white group-hover:bg-[#4D7CFE] border border-[#242E5E] transition-all"
                        title="View Full Payment Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-4 bg-[#0B1026] border-t border-[#242E5E] flex items-center justify-between text-xs text-[#A7AEC4]">
        <span>Showing {filteredPayments.length} of {payments.length} transactions</span>
        <span className="text-[11px] font-mono flex items-center gap-1">
          <Globe className="w-3 h-3 text-[#4D7CFE]" />
          <span>Multi-Chain Rail Isolation Active</span>
        </span>
      </div>
    </div>
  );
}
