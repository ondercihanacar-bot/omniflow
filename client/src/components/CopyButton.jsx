import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label = '', title = 'Panoya Kopyala', className = '' }) {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors cursor-pointer ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 font-medium'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
      } ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? <span>Kopyalandı</span> : (label ? <span>{label}</span> : null)}
    </button>
  );
}
