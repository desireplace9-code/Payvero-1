import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart, 
  BarChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Payment } from '../types';
import { build30DayChartData, DayChartPoint } from '../utils/chartData';
import { 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Filter,
  DollarSign,
  Activity,
  Sparkles
} from 'lucide-react';
import { formatTokenAmount } from '../config/tokens';

interface TransactionSummaryChartProps {
  payments: Payment[];
  onSelectPayment?: (paymentId: string) => void;
  onCreatePaymentClick?: () => void;
}

type ChartViewMode = 'composed' | 'volume' | 'count';

export function TransactionSummaryChart({
  payments,
  onSelectPayment,
  onCreatePaymentClick,
}: TransactionSummaryChartProps) {
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('composed');
  const [selectedAsset, setSelectedAsset] = useState<string>('all');

  // Compute 30-day analytics data
  const summary = useMemo(() => {
    return build30DayChartData(payments, selectedAsset);
  }, [payments, selectedAsset]);

  const {
    data,
    totalVolume30D,
    confirmedVolume30D,
    pendingVolume30D,
    totalCount30D,
    confirmedCount30D,
    pendingCount30D,
    failedCount30D,
    successRate30D,
    averageTicket30D,
    peakDay,
  } = summary;

  // Formatter for Y-Axis numbers
  const formatYAxisVolume = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toString();
  };

  // Custom Dark Tooltip matching Payvero UI styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0]?.payload as DayChartPoint;
    if (!point) return null;

    return (
      <div className="bg-[#0B1026]/95 border border-[#242E5E] rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px] z-50">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#242E5E]">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#4D7CFE]" />
            {point.fullDate}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#131A38] text-[#A7AEC4] font-mono border border-[#242E5E]">
            {point.totalCount} {point.totalCount === 1 ? 'tx' : 'txs'}
          </span>
        </div>

        {/* Volume breakdown */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#A7AEC4] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#20E56B]" />
              Confirmed:
            </span>
            <span className="font-mono font-bold text-[#20E56B]">
              {point.confirmedVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {point.pendingVolume > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[#A7AEC4] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pending:
              </span>
              <span className="font-mono font-bold text-amber-300">
                {point.pendingVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {point.failedCount > 0 && (
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Failed:
              </span>
              <span className="font-mono">{point.failedCount} txs</span>
            </div>
          )}
        </div>

        {/* Token breakdown if available */}
        {(point.usdtVolume > 0 || point.polVolume > 0 || point.verseVolume > 0) && (
          <div className="pt-1.5 border-t border-[#242E5E]/60 text-[11px] text-[#A7AEC4] space-y-0.5">
            {point.usdtVolume > 0 && (
              <div className="flex justify-between">
                <span>USDT:</span>
                <span className="text-white font-mono">${point.usdtVolume.toFixed(2)}</span>
              </div>
            )}
            {point.polVolume > 0 && (
              <div className="flex justify-between">
                <span>POL:</span>
                <span className="text-white font-mono">{point.polVolume.toFixed(2)} POL</span>
              </div>
            )}
            {point.verseVolume > 0 && (
              <div className="flex justify-between">
                <span>VERSE:</span>
                <span className="text-white font-mono">{point.verseVolume.toLocaleString()} VERSE</span>
              </div>
            )}
          </div>
        )}

        {/* Clickable mini list if clicked */}
        {point.payments.length > 0 && onSelectPayment && (
          <div className="pt-1 text-[10px] text-[#4D7CFE]">
            Tap transaction list below for full on-chain receipts
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      id="dashboard-summary-chart-card"
      className="bg-[#131A38] border border-[#242E5E] rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm overflow-hidden"
    >
      {/* Top Header: Title, 30-Day Badge & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#242E5E]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#4D7CFE]/15 text-[#4D7CFE]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>30-Day Payment Volume & Activity</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#4D7CFE]/20 text-[#4D7CFE] border border-[#4D7CFE]/30">
                  Last 30 Days
                </span>
              </h2>
              <p className="text-xs text-[#A7AEC4] mt-0.5">
                Daily transaction volume and blockchain payment status trend across all active merchant rails.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Asset Rail Filter */}
          <div className="flex items-center bg-[#0B1026] border border-[#242E5E] rounded-xl p-1 text-xs">
            <span className="px-2 text-[#A7AEC4] text-[11px] flex items-center gap-1 hidden sm:flex">
              <Filter className="w-3 h-3" />
              Asset:
            </span>
            <button
              type="button"
              onClick={() => setSelectedAsset('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedAsset === 'all'
                  ? 'bg-[#4D7CFE] text-white'
                  : 'text-[#A7AEC4] hover:text-white'
              }`}
            >
              All Rails
            </button>
            <button
              type="button"
              onClick={() => setSelectedAsset('USDT')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedAsset === 'USDT'
                  ? 'bg-[#4D7CFE] text-white'
                  : 'text-[#A7AEC4] hover:text-white'
              }`}
            >
              USDT
            </button>
            <button
              type="button"
              onClick={() => setSelectedAsset('POL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedAsset === 'POL'
                  ? 'bg-[#4D7CFE] text-white'
                  : 'text-[#A7AEC4] hover:text-white'
              }`}
            >
              POL
            </button>
            <button
              type="button"
              onClick={() => setSelectedAsset('VERSE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedAsset === 'VERSE'
                  ? 'bg-[#4D7CFE] text-white'
                  : 'text-[#A7AEC4] hover:text-white'
              }`}
            >
              VERSE
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-[#0B1026] border border-[#242E5E] rounded-xl p-1 text-xs">
            <button
              id="btn-chart-mode-composed"
              type="button"
              onClick={() => setChartViewMode('composed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'composed'
                  ? 'bg-[#20E56B] text-[#0B1026] font-bold'
                  : 'text-[#A7AEC4] hover:text-white'
              }`}
              title="Combined Volume & Activity"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              id="btn-chart-mode-volume"
              type="button"
              onClick={() => setChartViewMode('volume')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'volume'
                  ? 'bg-[#20E56B] text-[#0B1026] font-bold'
                  : 'text-[#A7AEC4] hover:text-white'
              }`}
              title="Volume Trend"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Volume</span>
            </button>
            <button
              id="btn-chart-mode-count"
              type="button"
              onClick={() => setChartViewMode('count')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'count'
                  ? 'bg-[#20E56B] text-[#0B1026] font-bold'
                  : 'text-[#A7AEC4] hover:text-white'
              }`}
              title="Transaction Count"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Count</span>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Quick Metric Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: 30D Settled Volume */}
        <div className="bg-[#0B1026] border border-[#242E5E] rounded-xl p-3.5">
          <span className="text-[11px] text-[#A7AEC4] font-medium block">30D Settled Volume</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-white font-mono">
              {confirmedVolume30D.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#20E56B] font-semibold">
              {selectedAsset === 'all' ? 'Total' : selectedAsset}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#A7AEC4] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#20E56B]" />
            <span>{confirmedCount30D} confirmed txs</span>
          </div>
        </div>

        {/* Metric 2: 30D Pending */}
        <div className="bg-[#0B1026] border border-[#242E5E] rounded-xl p-3.5">
          <span className="text-[11px] text-[#A7AEC4] font-medium block">30D Pending Volume</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-amber-300 font-mono">
              {pendingVolume30D.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#A7AEC4] flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{pendingCount30D} pending invoices</span>
          </div>
        </div>

        {/* Metric 3: 30D Conversion Rate */}
        <div className="bg-[#0B1026] border border-[#242E5E] rounded-xl p-3.5">
          <span className="text-[11px] text-[#A7AEC4] font-medium block">30D Success Rate</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-[#20E56B] font-mono">
              {successRate30D}%
            </span>
            <span className="text-[10px] text-[#A7AEC4]">
              ({confirmedCount30D}/{totalCount30D})
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#A7AEC4] flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#4D7CFE]" />
            <span>{failedCount30D > 0 ? `${failedCount30D} failed` : 'Zero failed requests'}</span>
          </div>
        </div>

        {/* Metric 4: Peak Activity Day */}
        <div className="bg-[#0B1026] border border-[#242E5E] rounded-xl p-3.5">
          <span className="text-[11px] text-[#A7AEC4] font-medium block">Peak 30D Activity</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-white">
              {peakDay.date}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#A7AEC4] font-mono">
            {peakDay.volume > 0 
              ? `${peakDay.volume.toLocaleString('en-US', { maximumFractionDigits: 0 })} settled volume`
              : 'Consistent activity'}
          </div>
        </div>
      </div>

      {/* Primary Recharts Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'composed' ? (
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#20E56B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#20E56B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242E5E" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#A7AEC4" 
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#242E5E' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis 
                yAxisId="left"
                stroke="#A7AEC4" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisVolume}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#4D7CFE" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span className="text-xs text-[#A7AEC4] mr-3">{value}</span>}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="confirmedVolume" 
                name="Settled Volume" 
                stroke="#20E56B" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorConfirmed)" 
              />
              <Bar 
                yAxisId="right"
                dataKey="totalCount" 
                name="Payment Activity (Txs)" 
                fill="#4D7CFE" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={16}
                opacity={0.75}
              />
            </ComposedChart>
          ) : viewMode === 'volume' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConfirmedOnly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#20E56B" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#20E56B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPendingOnly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242E5E" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#A7AEC4" 
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#242E5E' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis 
                stroke="#A7AEC4" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisVolume}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span className="text-xs text-[#A7AEC4] mr-3">{value}</span>}
              />
              <Area 
                type="monotone" 
                dataKey="confirmedVolume" 
                name="Confirmed Settled Volume" 
                stroke="#20E56B" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorConfirmedOnly)" 
              />
              <Area 
                type="monotone" 
                dataKey="pendingVolume" 
                name="Pending Invoice Volume" 
                stroke="#F59E0B" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorPendingOnly)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242E5E" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#A7AEC4" 
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#242E5E' }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis 
                stroke="#A7AEC4" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span className="text-xs text-[#A7AEC4] mr-3">{value}</span>}
              />
              <Bar 
                dataKey="confirmedCount" 
                name="Confirmed Txs" 
                fill="#20E56B" 
                stackId="status" 
                radius={[0, 0, 0, 0]} 
                maxBarSize={20}
              />
              <Bar 
                dataKey="pendingCount" 
                name="Pending Invoices" 
                fill="#F59E0B" 
                stackId="status" 
                radius={[0, 0, 0, 0]} 
                maxBarSize={20}
              />
              <Bar 
                dataKey="failedCount" 
                name="Failed / Reverted" 
                fill="#EF4444" 
                stackId="status" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={20}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom Chart Footer / Helper notes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#242E5E] text-xs text-[#A7AEC4]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20E56B]" />
            Green = Confirmed on Polygon
          </span>
          <span className="flex items-center gap-1.5 text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4D7CFE]" />
            Blue = Daily Transaction Frequency
          </span>
          <span className="flex items-center gap-1.5 text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Amber = Open Invoices
          </span>
        </div>

        {onCreatePaymentClick && (
          <button
            type="button"
            onClick={onCreatePaymentClick}
            className="text-[#4D7CFE] hover:underline font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Issue New Invoice</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
