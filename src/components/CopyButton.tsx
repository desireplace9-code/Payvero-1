import { useState, type MouseEvent } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  id?: string;
}

export function CopyButton({ text, label, className = '', id }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      id={id || `copy-btn-${text.slice(0, 8)}`}
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all border ${
        copied
          ? 'bg-[#20E56B]/15 text-[#20E56B] border-[#20E56B]/30'
          : 'bg-[#131A38] text-[#A7AEC4] hover:text-white border-[#242E5E] hover:border-[#4D7CFE]/50'
      } ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {label && <span>{copied ? 'Copied' : label}</span>}
    </button>
  );
}
