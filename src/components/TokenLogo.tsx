import { TokenSymbol } from '../types';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

interface TokenLogoProps {
  symbol: TokenSymbol | string;
  size?: LogoSize;
  className?: string;
}

function getNumericSize(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'xs':
      return 18;
    case 'sm':
      return 24;
    case 'md':
      return 36;
    case 'lg':
      return 48;
    case 'xl':
      return 60;
    default:
      return 36;
  }
}

/**
 * Official VERSE (fxVERSE) Token Vector Logo
 */
export function VerseLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <defs>
        <linearGradient id="verse-bg-gradient" x1="5%" y1="5%" x2="95%" y2="95%">
          <stop offset="0%" stopColor="#00BAFF" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="68%" stopColor="#8338EC" />
          <stop offset="100%" stopColor="#E000F5" />
        </linearGradient>
        <linearGradient id="verse-fold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#EAD5FF" stopOpacity="0.75" />
        </linearGradient>
        <filter id="verse-subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#verse-bg-gradient)" />
      <g filter="url(#verse-subtle-shadow)">
        <path
          d="M 50 43.5 L 68.5 28.5 C 74 24 81 30.5 76.5 36.5 L 56.5 69.5 C 53.5 74.5 46.5 74.5 43.5 69.5 L 23.5 36.5 C 19 30.5 26 24 31.5 28.5 L 50 43.5 Z"
          fill="url(#verse-fold-gradient)"
        />
        <path
          d="M 23.2 36.2 C 18.8 29.8 26.2 23.2 32.2 28.2 L 50 43.5 L 61 62 C 58.5 66.5 53.5 69 48.5 67 L 23.2 36.2 Z"
          fill="#FFFFFF"
        />
        <rect
          x="20.5"
          y="26"
          width="21.5"
          height="45"
          rx="10.75"
          transform="rotate(-33 20.5 26)"
          fill="#FFFFFF"
        />
        <rect
          x="53.5"
          y="24"
          width="21.5"
          height="42"
          rx="10.75"
          transform="rotate(33 53.5 24)"
          fill="url(#verse-fold-gradient)"
        />
        <circle cx="50" cy="62" r="10.75" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/**
 * Official POL (Polygon Native) Token Vector Logo
 */
export function PolLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <defs>
        <linearGradient id="pol-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7B3FE4" />
          <stop offset="100%" stopColor="#5317C7" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#pol-bg-gradient)" />
      <g transform="translate(19, 21) scale(0.62)">
        <path
          d="M71.7 44.3c-2.4-1.4-5.5-1.4-7.9 0L49.5 52.6l-8.8 5.1-14.3 8.3c-2.4 1.4-5.5 1.4-7.9 0l-11.2-6.5c-2.4-1.4-3.9-4-3.9-6.8V39.7c0-2.8 1.5-5.4 3.9-6.8l11.2-6.5c2.4-1.4 5.5-1.4 7.9 0l14.3 8.3 8.8 5.1 14.3-8.3c2.4-1.4 5.5-1.4 7.9 0l11.2 6.5c2.4 1.4 3.9 4 3.9 6.8v13c0 2.8-1.5 5.4-3.9 6.8l-11.2 6.5c-2.4 1.4-5.5 1.4-7.9 0l-14.3-8.3-8.8-5.1 14.3-8.3 8.8-5.1 11.2-6.5z"
          fill="#FFFFFF"
        />
        <path
          d="M49.5 52.6l14.3-8.3 11.2 6.5c2.4 1.4 3.9 4 3.9 6.8v13c0 2.8-1.5 5.4-3.9 6.8l-11.2 6.5c-2.4 1.4-5.5 1.4-7.9 0L41.6 75.6c-2.4-1.4-3.9-4-3.9-6.8V55.8l11.8-3.2z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
        <path
          d="M50.5 47.4L36.2 55.7l-11.2-6.5c-2.4-1.4-3.9-4-3.9-6.8v-13c0-2.8 1.5-5.4 3.9-6.8l11.2-6.5c2.4-1.4 5.5-1.4 7.9 0l14.3 8.3c2.4 1.4 3.9 4 3.9 6.8v13.1l-11.9 3.1z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

/**
 * Official USDT (Tether USD) Token Vector Logo
 */
export function UsdtLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <defs>
        <linearGradient id="usdt-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#009393" />
          <stop offset="100%" stopColor="#26A17B" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#usdt-bg-gradient)" />
      <g fill="#FFFFFF">
        <path d="M 23 27 L 77 27 L 77 36.5 L 55.5 36.5 L 55.5 44 C 67.5 44.5 76 47.5 76 51 C 76 54.5 67.5 57.5 55.5 58 L 55.5 74 L 44.5 74 L 44.5 58 C 32.5 57.5 24 54.5 24 51 C 24 47.5 32.5 44.5 44.5 44 L 44.5 36.5 L 23 36.5 Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 50 46.5 C 62.5 46.5 70.5 48.8 70.5 51 C 70.5 53.2 62.5 55.5 50 55.5 C 37.5 55.5 29.5 53.2 29.5 51 C 29.5 48.8 37.5 46.5 50 46.5 Z M 44.5 48.2 C 37 48.7 34 50.1 34 51 C 34 51.9 37 53.3 44.5 53.8 L 44.5 48.2 Z M 55.5 48.2 L 55.5 53.8 C 63 53.3 66 51.9 66 51 C 66 50.1 63 48.7 55.5 48.2 Z"
          fill="#009393"
        />
      </g>
    </svg>
  );
}

/**
 * Bitcoin (BTC) Logo
 */
export function BtcLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <circle cx="50" cy="50" r="50" fill="#F7931A" />
      <path
        d="M66.4 42.8c.8-5.3-3.2-8.2-8.8-10.1l1.8-7.2-4.4-1.1-1.7 7c-1.2-.3-2.4-.6-3.6-.9l1.7-7-4.4-1.1-1.8 7.2c-.9-.2-1.9-.4-2.8-.7l0-.1-6.1-1.5-1.2 4.7s3.3.8 3.2.8c1.8.4 2.1 1.6 2.1 2.6l-2.1 8.4c.1 0 .3.1.4.1l-.4-.1-2.9 11.8c-.2.6-.8 1.4-2.1 1.1 0 0-3.2-.8-3.2-.8l-2.2 5.1 5.7 1.4c1.1.3 2.1.6 3.2.8l-1.8 7.4 4.4 1.1 1.8-7.2c1.2.3 2.4.6 3.5.9l-1.8 7.2 4.4 1.1 1.8-7.3c7.5 1.4 13.2.8 15.6-5.9 1.9-5.4-.1-8.5-4-10.6 2.8-.7 5-2.5 5.6-6.4zm-10 14.1c-1.4 5.5-10.6 2.5-13.6 1.8l2.4-9.8c3 .8 12.6 2.3 11.2 8zm1.3-14.3c-1.2 5-8.9 2.5-11.4 1.8l2.2-8.9c2.5.6 10.5 1.8 9.2 7.1z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Ethereum (ETH) Logo
 */
export function EthLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <circle cx="50" cy="50" r="50" fill="#627EEA" />
      <g transform="translate(25, 18) scale(0.64)" fill="#FFFFFF">
        <path opacity="0.6" d="M39.1 0L38.4 2.4V52.8L39.1 53.5L63.5 39.1L39.1 0Z" />
        <path d="M39.1 0L14.7 39.1L39.1 53.5V0Z" />
        <path opacity="0.6" d="M39.1 58.1L38.7 58.6V78.2L39.1 79.4L63.5 43.8L39.1 58.1Z" />
        <path d="M39.1 79.4V58.1L14.7 43.8L39.1 79.4Z" />
        <path opacity="0.2" d="M39.1 53.5L63.5 39.1L39.1 28.1V53.5Z" />
        <path opacity="0.6" d="M14.7 39.1L39.1 53.5V28.1L14.7 39.1Z" />
      </g>
    </svg>
  );
}

/**
 * BNB Chain Logo
 */
export function BnbLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <circle cx="50" cy="50" r="50" fill="#F3BA2F" />
      <g fill="#FFFFFF" transform="translate(22, 22) scale(0.56)">
        <path d="M50 0L33.7 16.3L50 32.6L66.3 16.3L50 0Z" />
        <path d="M16.3 33.7L0 50L16.3 66.3L32.6 50L16.3 33.7Z" />
        <path d="M83.7 33.7L67.4 50L83.7 66.3L100 50L83.7 33.7Z" />
        <path d="M50 67.4L33.7 83.7L50 100L66.3 83.7L50 67.4Z" />
        <path d="M50 42.6L42.6 50L50 57.4L57.4 50L50 42.6Z" />
      </g>
    </svg>
  );
}

/**
 * Tron (TRX) Logo
 */
export function TronLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <circle cx="50" cy="50" r="50" fill="#FF0013" />
      <path
        d="M26 27L76 43L74 46L36 75L26 27ZM31 33L37 66L67 43L31 33Z"
        fill="#FFFFFF"
      />
      <path
        d="M74 46L48 50L36 75L74 46Z"
        fill="#FFFFFF"
        opacity="0.8"
      />
    </svg>
  );
}

/**
 * USD Coin (USDC) Logo
 */
export function UsdcLogo({ size = 32, className = '' }: { size?: LogoSize; className?: string }) {
  const pixelSize = getNumericSize(size);
  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full select-none ${className}`}
    >
      <circle cx="50" cy="50" r="50" fill="#2775CA" />
      <path
        d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C66.6 80 80 66.6 80 50C80 33.4 66.6 20 50 20ZM52.5 68V64.2C58.3 63.3 61.9 59.8 61.9 55.4C61.9 49.3 57.5 47.6 51.5 46.1C47.3 45 44.4 44.1 44.4 41.5C44.4 39.2 46.4 37.6 50.1 37.6C54.1 37.6 57 39.1 57.9 42.5H62.7C61.7 36.8 57.6 33.7 52.5 32.9V29H47.5V32.9C42.2 33.8 38.6 37.2 38.6 41.6C38.6 47.7 42.9 49.4 48.9 50.9C53.3 52 56.1 53 56.1 55.7C56.1 58.1 53.8 60 49.9 60C45.3 60 42.2 57.9 41.2 54.1H36.3C37.3 60.2 41.9 63.3 47.5 64.2V68H52.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Universal TokenLogo Component
 */
export function TokenLogo({ symbol, size = 'md', className = '' }: TokenLogoProps) {
  const normalized = (symbol || '').toUpperCase().trim();

  if (normalized === 'VERSE') {
    return <VerseLogo size={size} className={className} />;
  }
  if (normalized === 'USDT') {
    return <UsdtLogo size={size} className={className} />;
  }
  if (normalized === 'POL' || normalized === 'MATIC') {
    return <PolLogo size={size} className={className} />;
  }
  if (normalized === 'BTC' || normalized === 'BITCOIN') {
    return <BtcLogo size={size} className={className} />;
  }
  if (normalized === 'ETH' || normalized === 'ETHEREUM') {
    return <EthLogo size={size} className={className} />;
  }
  if (normalized === 'BNB') {
    return <BnbLogo size={size} className={className} />;
  }
  if (normalized === 'TRX' || normalized === 'TRON') {
    return <TronLogo size={size} className={className} />;
  }
  if (normalized === 'USDC') {
    return <UsdcLogo size={size} className={className} />;
  }

  // Fallback generic badge
  const pixelSize = getNumericSize(size);
  return (
    <div
      className={`rounded-full bg-[#131A38] border border-[#242E5E] text-white flex items-center justify-center font-bold text-xs shrink-0 select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {normalized.slice(0, 3)}
    </div>
  );
}
