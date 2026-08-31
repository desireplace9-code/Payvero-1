import { Payment } from '../types';

/**
 * Escapes a field for CSV format following RFC 4180 rules.
 * Wraps values with quotes if they contain commas, newlines, or double quotes.
 */
function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of Payment objects into a standard CSV string for accounting purposes.
 */
export function generatePaymentsCsv(payments: Payment[]): string {
  const headers = [
    'Payment ID',
    'Date (UTC)',
    'Time (UTC)',
    'ISO Timestamp',
    'Status',
    'Amount',
    'Token Symbol',
    'Asset ID',
    'Network Name',
    'Chain ID',
    'Token Standard',
    'Description',
    'Customer Reference',
    'Customer Wallet',
    'Merchant Receiving Address',
    'Transaction Hash',
    'Confirmed At (UTC)',
    'Expires At (UTC)',
    'Error Message'
  ];

  const rows = payments.map((p) => {
    const createdAt = new Date(p.createdAt);
    const dateUtc = !isNaN(createdAt.getTime()) ? createdAt.toISOString().split('T')[0] : '';
    const timeUtc = !isNaN(createdAt.getTime()) ? createdAt.toISOString().split('T')[1].replace('Z', '') : '';
    const confirmedAtStr = p.confirmedAt ? new Date(p.confirmedAt).toISOString() : '';
    const expiresAtStr = p.expiresAt ? new Date(p.expiresAt).toISOString() : '';

    return [
      escapeCsvField(p.id),
      escapeCsvField(dateUtc),
      escapeCsvField(timeUtc),
      escapeCsvField(p.createdAt),
      escapeCsvField(p.status.toUpperCase()),
      escapeCsvField(p.amount),
      escapeCsvField(p.token),
      escapeCsvField(p.assetId),
      escapeCsvField(p.networkName || 'Polygon PoS'),
      escapeCsvField(p.networkChainId || 137),
      escapeCsvField(p.standard || 'NATIVE'),
      escapeCsvField(p.description),
      escapeCsvField(p.customerReference || ''),
      escapeCsvField(p.customerWallet || ''),
      escapeCsvField(p.merchantWallet || p.merchantDestination || ''),
      escapeCsvField(p.txHash || ''),
      escapeCsvField(confirmedAtStr),
      escapeCsvField(expiresAtStr),
      escapeCsvField(p.errorMessage || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers an immediate browser download of the payments transaction log as a CSV file.
 * 
 * @param payments - Array of payments to export
 * @param filenamePrefix - Optional custom filename prefix (defaults to 'payvero_transactions')
 */
export function downloadPaymentsCsv(payments: Payment[], filenamePrefix = 'payvero_transactions'): void {
  const csvContent = generatePaymentsCsv(payments);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // Include UTF-8 BOM for Excel compatibility
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10);
  const timeStamp = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const filename = `${filenamePrefix}_${dateStamp}_${timeStamp}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
