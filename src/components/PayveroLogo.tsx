interface PayveroIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Payvero Verified 'P' Emblem
 * Vector implementation matching the official Payvero branding.
 */
export function PayveroIcon({ className = '', size = 36 }: PayveroIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="payvero-green-grad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#25F275" />
          <stop offset="100%" stopColor="#14E86E" />
        </linearGradient>
      </defs>

      {/* Outer loop of the 'P' with diagonal slash & checkmark cut */}
      {/* Upper loop curved stroke */}
      <path
        d="M 52 46 C 52 30.5 65.5 18 82 18 C 104 18 122 36 122 58 C 122 75.5 110.5 90.5 94 96 L 78 102 C 63 102 52 91 52 76 Z"
        stroke="url(#payvero-green-grad)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Lower vertical stem / pill of the 'P' */}
      <path
        d="M 38 98 L 38 132"
        stroke="url(#payvero-green-grad)"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* Internal checkmark / diagonal slash slicing through the P */}
      <path
        d="M 54 68 L 72 86 L 126 32"
        stroke="url(#payvero-green-grad)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PayveroLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  badge?: string;
}

/**
 * Full Payvero Brand Logo Component
 * Incorporates the verified green emblem, "Payvero" title, and "Simple Crypto Payments" tagline.
 */
export function PayveroLogo({
  size = 'md',
  showSubtitle = true,
  className = '',
  badge,
}: PayveroLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 64,
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`} id="payvero-brand-logo">
      <PayveroIcon size={iconSizes[size]} />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold text-white tracking-tight leading-none ${titleSizes[size]}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Payvero
          </span>
          {badge && (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30 leading-none">
              {badge}
            </span>
          )}
        </div>
        {showSubtitle && (
          <span
            className={`text-[#E2E8F0] font-medium tracking-normal mt-1 leading-none ${subSizes[size]}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Simple Crypto Payments
          </span>
        )}
      </div>
    </div>
  );
}
