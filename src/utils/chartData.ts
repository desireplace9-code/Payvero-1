import { Payment } from '../types';

export interface DayChartPoint {
  dateKey: string; // 'YYYY-MM-DD'
  displayDate: string; // e.g. 'Aug 14'
  fullDate: string; // e.g. 'Aug 14, 2026'
  timestamp: number;
  totalVolume: number;
  confirmedVolume: number;
  pendingVolume: number;
  failedVolume: number;
  totalCount: number;
  confirmedCount: number;
  pendingCount: number;
  failedCount: number;
  // Per asset volumes
  usdtVolume: number;
  polVolume: number;
  verseVolume: number;
  otherVolume: number;
  payments: Payment[];
}

export interface Chart30DaySummary {
  data: DayChartPoint[];
  totalVolume30D: number;
  confirmedVolume30D: number;
  pendingVolume30D: number;
  totalCount30D: number;
  confirmedCount30D: number;
  pendingCount30D: number;
  failedCount30D: number;
  successRate30D: number;
  averageTicket30D: number;
  peakDay: { date: string; volume: number; count: number };
  assetTotals: Record<string, { volume: number; count: number; symbol: string }>;
}

/**
 * Standardizes date comparison to UTC / local date string YYYY-MM-DD
 */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Generates continuous 30-day data points from payments.
 */
export function build30DayChartData(
  payments: Payment[],
  selectedAssetFilter: string = 'all', // 'all' | 'usdt-polygon' | 'pol-polygon' | 'verse-polygon' or symbols
  endDate: Date = new Date()
): Chart30DaySummary {
  const daysMap = new Map<string, DayChartPoint>();
  const assetTotals: Record<string, { volume: number; count: number; symbol: string }> = {};

  // Build the 30 continuous calendar days backwards from endDate
  for (let i = 29; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const dateKey = toDateKey(d);
    daysMap.set(dateKey, {
      dateKey,
      displayDate: formatDisplayDate(d),
      fullDate: formatFullDate(d),
      timestamp: d.getTime(),
      totalVolume: 0,
      confirmedVolume: 0,
      pendingVolume: 0,
      failedVolume: 0,
      totalCount: 0,
      confirmedCount: 0,
      pendingCount: 0,
      failedCount: 0,
      usdtVolume: 0,
      polVolume: 0,
      verseVolume: 0,
      otherVolume: 0,
      payments: [],
    });
  }

  let totalVolume30D = 0;
  let confirmedVolume30D = 0;
  let pendingVolume30D = 0;
  let totalCount30D = 0;
  let confirmedCount30D = 0;
  let pendingCount30D = 0;
  let failedCount30D = 0;

  // Process payments
  for (const payment of payments) {
    if (!payment.createdAt) continue;

    const pDate = new Date(payment.createdAt);
    if (isNaN(pDate.getTime())) continue;

    const dateKey = toDateKey(pDate);
    const point = daysMap.get(dateKey);

    // Apply asset filter if specified
    const assetId = payment.assetId || `${(payment.token || 'pol').toLowerCase()}-polygon`;
    const symbol = (payment.tokenSymbol || payment.token || 'POL').toUpperCase();

    if (selectedAssetFilter !== 'all') {
      const matchId = selectedAssetFilter.toLowerCase() === assetId.toLowerCase();
      const matchSym = selectedAssetFilter.toUpperCase() === symbol;
      if (!matchId && !matchSym) {
        continue;
      }
    }

    const amt = parseFloat(payment.amount) || 0;

    // Track asset overall totals
    if (!assetTotals[assetId]) {
      assetTotals[assetId] = { volume: 0, count: 0, symbol };
    }
    assetTotals[assetId].count += 1;
    if (payment.status === 'confirmed') {
      assetTotals[assetId].volume += amt;
    }

    // If within our 30 day window, add to bucket
    if (point) {
      point.totalVolume += amt;
      point.totalCount += 1;
      point.payments.push(payment);

      if (symbol === 'USDT' || symbol === 'USDC') {
        point.usdtVolume += amt;
      } else if (symbol === 'POL') {
        point.polVolume += amt;
      } else if (symbol === 'VERSE') {
        point.verseVolume += amt;
      } else {
        point.otherVolume += amt;
      }

      if (payment.status === 'confirmed') {
        point.confirmedVolume += amt;
        point.confirmedCount += 1;
        confirmedVolume30D += amt;
        confirmedCount30D += 1;
      } else if (payment.status === 'pending') {
        point.pendingVolume += amt;
        point.pendingCount += 1;
        pendingVolume30D += amt;
        pendingCount30D += 1;
      } else if (payment.status === 'failed') {
        point.failedVolume += amt;
        point.failedCount += 1;
        failedCount30D += 1;
      }

      totalVolume30D += amt;
      totalCount30D += 1;
    }
  }

  const data = Array.from(daysMap.values());

  // Find peak day
  let peakDay = { date: 'No activity', volume: 0, count: 0 };
  for (const point of data) {
    if (point.confirmedVolume > peakDay.volume) {
      peakDay = {
        date: point.displayDate,
        volume: point.confirmedVolume,
        count: point.confirmedCount,
      };
    }
  }

  const successRate30D = totalCount30D > 0 ? Math.round((confirmedCount30D / totalCount30D) * 100) : 0;
  const averageTicket30D = confirmedCount30D > 0 ? confirmedVolume30D / confirmedCount30D : 0;

  return {
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
    assetTotals,
  };
}
