import { PaymentStatus } from '../types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export function StatusBadge({ status, size = 'md', id }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (status === 'confirmed') {
    return (
      <span
        id={id || `status-badge-${status}`}
        className={`inline-flex items-center rounded-full bg-[#20E56B]/15 text-[#20E56B] border border-[#20E56B]/30 tracking-wide ${sizeClasses[size]}`}
      >
        <CheckCircle2 className={`${iconSizes[size]} shrink-0`} />
        <span>Confirmed</span>
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        id={id || `status-badge-${status}`}
        className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wide ${sizeClasses[size]}`}
      >
        <Clock className={`${iconSizes[size]} shrink-0 animate-pulse`} />
        <span>Pending</span>
      </span>
    );
  }

  return (
    <span
      id={id || `status-badge-${status}`}
      className={`inline-flex items-center rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 tracking-wide ${sizeClasses[size]}`}
    >
      <XCircle className={`${iconSizes[size]} shrink-0`} />
      <span>Failed</span>
    </span>
  );
}
