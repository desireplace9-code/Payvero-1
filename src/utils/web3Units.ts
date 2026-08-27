/**
 * Precision unit conversion utilities for Web3 tokens.
 * Uses BigInt arithmetic to eliminate JavaScript floating-point rounding errors.
 */

/**
 * Parses a decimal token string into its integer base units (wei / atomic units) as BigInt.
 * Example: parseTokenUnits("1.5", 6) -> 1500000n (USDT)
 * Example: parseTokenUnits("10", 18) -> 10000000000000000000n (POL / VERSE)
 */
export function parseTokenUnits(amountStr: string, decimals: number): bigint {
  const clean = (amountStr || '').trim().replace(/,/g, '');
  if (!clean || isNaN(Number(clean)) || Number(clean) < 0) {
    throw new Error(`Invalid token amount: "${amountStr}"`);
  }

  const parts = clean.split('.');
  const wholePart = parts[0] || '0';
  const fracPart = parts[1] || '';

  const wholeBigInt = BigInt(wholePart) * (10n ** BigInt(decimals));
  const truncatedFrac = fracPart.slice(0, decimals).padEnd(decimals, '0');
  const fracBigInt = truncatedFrac ? BigInt(truncatedFrac) : 0n;

  return wholeBigInt + fracBigInt;
}

/**
 * Formats a BigInt raw atomic amount to a human-readable decimal string.
 */
export function formatTokenUnits(rawAmount: bigint | string, decimals: number, displayDecimals: number = 4): string {
  const rawBigInt = typeof rawAmount === 'string' ? BigInt(rawAmount) : rawAmount;
  const divisor = 10n ** BigInt(decimals);
  const whole = rawBigInt / divisor;
  const remainder = rawBigInt % divisor;

  if (remainder === 0n) {
    return whole.toString();
  }

  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.slice(0, displayDecimals).replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole.toString();
}

/**
 * Encodes an ERC-20 transfer(address to, uint256 value) calldata.
 * Function signature: a9059cbb
 */
export function encodeErc20Transfer(recipientAddress: string, amountUnits: bigint): string {
  const cleanAddress = recipientAddress.toLowerCase().replace('0x', '');
  if (cleanAddress.length !== 40) {
    throw new Error(`Invalid ERC-20 recipient address: ${recipientAddress}`);
  }
  const paddedAddress = cleanAddress.padStart(64, '0');
  const paddedAmount = amountUnits.toString(16).padStart(64, '0');
  return `0xa9059cbb${paddedAddress}${paddedAmount}`;
}
