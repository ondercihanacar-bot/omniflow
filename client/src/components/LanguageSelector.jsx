import React from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ variant = 'default', className = '' }) {
  const { language, setLanguage, languages } = useLanguage();

  // Variant 1: Auth Screen Top Banner (Sleek, beveled, high-contrast pills)
  if (variant === 'auth') {
    return (
      <div className={`flex items-center gap-1 bg-slate-950/70 border border-slate-700/70 rounded-full p-1 backdrop-blur-md shadow-lg ${className}`}>
        {languages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={`${l.name} (${l.code.toUpperCase()})`}
            >
              <span className="text-sm leading-none">{l.flag}</span>
              <span className="tracking-wide text-[11px] uppercase font-mono">{l.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 2: Navbar Compact Button (Quick toggle TR / EN)
  if (variant === 'navbar') {
    return (
      <div className={`flex items-center bg-slate-950/60 border border-slate-800/80 rounded-lg p-0.5 ${className}`}>
        {languages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Dili Değiştir: ${l.name}`}
            >
              <span className="text-xs leading-none">{l.flag}</span>
              <span className="uppercase font-mono text-[10px]">{l.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 3: Default Dropdown or Radio in Settings
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {languages.map((l) => {
        const isActive = language === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{l.flag}</span>
              <span>{l.name}</span>
            </div>
            {isActive && <Check className="w-4 h-4 text-blue-400" />}
          </button>
        );
      })}
    </div>
  );
}
