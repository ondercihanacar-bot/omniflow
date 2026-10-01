import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import CopyButton from './CopyButton';

export default function PasswordEye({ password, placeholder = 'Parola Yok', canView = true }) {
  const [show, setShow] = useState(false);

  if (!password) {
    return <span className="text-slate-500 italic text-xs">{placeholder}</span>;
  }

  // If password was masked from backend or user lacks password viewing permission
  if (password === '••••••••' || !canView) {
    return (
      <div
        className="inline-flex items-center gap-1.5 bg-slate-900/40 border border-slate-800 rounded px-2 py-0.5 font-mono text-xs text-slate-500"
        title="Parolayı görüntüleme yetkiniz kısıtlıdır"
      >
        <span className="tracking-wider">••••••••</span>
        <span className="text-[10px] text-slate-600">🔒</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/60 rounded px-2 py-0.5 font-mono text-xs">
      <span className="select-all tracking-wider text-slate-200">
        {show ? password : '••••••••'}
      </span>
      <button
        type="button"
        onClick={() => setShow(!show)}
        title={show ? 'Gizle' : 'Göster'}
        className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer transition-colors"
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <CopyButton text={password} title="Parolayı Kopyala" />
    </div>
  );
}
