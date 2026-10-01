import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Server, Cloud, Laptop, Shield, Database, Building2, ArrowRight, Wifi, Globe, BookOpen } from 'lucide-react';
import { api } from '../api';

const TYPE_ICONS = {
  customer: Building2,
  server: Server,
  vm: Cloud,
  pc: Laptop,
  firewall: Shield,
  backup: Database,
  line: Globe,
  wifi: Wifi,
  kb: BookOpen
};

const TAB_MAP = {
  customer: 'overview',
  server: 'servers',
  vm: 'vms',
  pc: 'pcs',
  firewall: 'firewalls',
  backup: 'backups',
  line: 'lines',
  wifi: 'wifi',
  kb: 'kb'
};

export default function GlobalSearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Close on Escape key press anywhere
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="IP, MAC adresi, Lisans anahtarı, Sunucu, PC adı veya Müşteri ara..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 rounded">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 flex-1 divide-y divide-slate-800/60">
          {loading && (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Aranıyor...</span>
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-base font-medium text-slate-300">"{query}" ile eşleşen kayıt bulunamadı</p>
              <p className="text-xs text-slate-500 mt-1">Herhangi bir IP (örn: 192.168), MAC, Lisans anahtarı veya cihaz adı yazabilirsiniz.</p>
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="py-8 text-center text-slate-500 text-sm">
              <p>Tüm müşteriler ve cihazlar arasında hızlı arama yapmak için yazmaya başlayın.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-slate-800/80 rounded-md text-slate-300">Örn: 192.168</span>
                <span className="px-2.5 py-1 bg-slate-800/80 rounded-md text-slate-300">Örn: FortiGate</span>
                <span className="px-2.5 py-1 bg-slate-800/80 rounded-md text-slate-300">Örn: Windows Lisans</span>
                <span className="px-2.5 py-1 bg-slate-800/80 rounded-md text-slate-300">Örn: Dell R740</span>
              </div>
            </div>
          )}

          {!loading && results.map((item, idx) => {
            const Icon = TYPE_ICONS[item.type] || Building2;
            const targetTab = TAB_MAP[item.type] || 'overview';

            return (
              <div
                key={`${item.type}-${item.id}-${idx}`}
                onClick={() => {
                  onSelectResult({
                    customerId: item.customerId,
                    tab: targetTab,
                    searchQuery: query
                  });
                  onClose();
                }}
                className="p-3 hover:bg-slate-800/70 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/80 text-blue-400 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {item.typeLabel}
                      </span>
                      {item.customerName && (
                        <span className="text-xs font-semibold text-blue-400">
                          {item.customerName}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-white mt-0.5 group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-500 group-hover:text-blue-400 transition-colors">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Toplam {results.length} sonuç</span>
          <span className="text-slate-500">Tıklayarak doğrudan ilgili müşteriye ve sekmeye gidin</span>
        </div>
      </div>
    </div>
  );
}
