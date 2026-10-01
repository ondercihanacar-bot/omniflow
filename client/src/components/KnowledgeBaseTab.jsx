import React, { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Search, Tag, AlertTriangle, Terminal,
  Building2, Edit2, Trash2, CheckCircle2, ChevronDown,
  ChevronUp, ExternalLink, HelpCircle, Code, ShieldAlert, Sparkles, Filter, Bot
} from 'lucide-react';
import CopyButton from './CopyButton';
import AIChatModal from './AIChatModal';

const CATEGORIES = [
  'Tümü',
  'Ağ & Firewall',
  'Sunucu & Sanallaştırma',
  'Yedekleme & NAS',
  'Kullanıcı PC & Windows',
  'Wi-Fi & UniFi',
  'E-Posta & Office',
  'Güvenlik & Antivirüs',
  'Diğer'
];

const CATEGORY_COLORS = {
  'Ağ & Firewall': 'text-rose-400 bg-rose-950/60 border-rose-800',
  'Sunucu & Sanallaştırma': 'text-indigo-400 bg-indigo-950/60 border-indigo-800',
  'Yedekleme & NAS': 'text-amber-400 bg-amber-950/60 border-amber-800',
  'Kullanıcı PC & Windows': 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
  'Wi-Fi & UniFi': 'text-sky-400 bg-sky-950/60 border-sky-800',
  'E-Posta & Office': 'text-purple-400 bg-purple-950/60 border-purple-800',
  'Güvenlik & Antivirüs': 'text-red-400 bg-red-950/60 border-red-800',
  'Diğer': 'text-slate-400 bg-slate-800 border-slate-700'
};

const SEVERITY_BADGES = {
  'Kritik': 'text-rose-300 bg-rose-950/90 border-rose-600 font-bold',
  'Yüksek': 'text-amber-300 bg-amber-950/80 border-amber-600 font-semibold',
  'Normal': 'text-blue-300 bg-blue-950/60 border-blue-700 font-medium',
  'İpucu': 'text-emerald-300 bg-emerald-950/60 border-emerald-700 font-medium'
};

export default function KnowledgeBaseTab({
  items = [],
  customers = [],
  onAdd,
  onEdit,
  onDelete
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedSeverity, setSelectedSeverity] = useState('Tümü');
  const [expandedId, setExpandedId] = useState(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'Tümü' && item.category !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'Tümü' && item.severity !== selectedSeverity) {
        return false;
      }
      // Text search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.error_code || '').toLowerCase().includes(q) ||
        (item.subcategory || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.symptoms || '').toLowerCase().includes(q) ||
        (item.root_cause || '').toLowerCase().includes(q) ||
        (item.solution_steps || '').toLowerCase().includes(q) ||
        (item.command_snippet || '').toLowerCase().includes(q) ||
        (item.customer_name || '').toLowerCase().includes(q)
      );
    });
  }, [items, search, selectedCategory, selectedSeverity]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Summary */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/30 border border-amber-500/20 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">IT Sorun & Çözüm Kütüphanesi</h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  {items.length} Kayıtlı Çözüm
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sık karşılaşılan sistem, ağ, firewall, lisans ve kullanıcı arızaları için hızlı çözüm rehberi ve hazır komutlar
              </p>
            </div>
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-950/50 transition-all cursor-pointer self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Çözüm Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Hata kodu (0x80070005, Error 98), sorun başlığı veya PowerShell komutu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* OMNI AI Butonu */}
        <button
          type="button"
          onClick={() => setIsAIChatOpen(true)}
          className="relative group flex items-center justify-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/60 border border-indigo-400/50 hover:border-indigo-300 transition-all duration-200 cursor-pointer shrink-0 active:scale-95 animate-pulse hover:animate-none"
          title="OMNI AI: Arıza teşhisi yapın, ekran görüntüsü (Ctrl+V) yapıştırın veya soru sorun"
        >
          <div className="p-1 bg-white/20 rounded-lg backdrop-blur-xs flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="tracking-wide font-bold">OMNI AI</span>
        </button>

        {/* Category Pills & Severity dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Tümü">Tüm Seviyeler</option>
            <option value="Kritik">🔴 Kritik</option>
            <option value="Yüksek">🟠 Yüksek</option>
            <option value="Normal">🔵 Normal</option>
            <option value="İpucu">🟢 İpucu</option>
          </select>

          {(search || selectedCategory !== 'Tümü' || selectedSeverity !== 'Tümü') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('Tümü');
                setSelectedSeverity('Tümü');
              }}
              className="text-xs text-slate-400 hover:text-amber-300 underline cursor-pointer ml-1"
            >
              Filtreyi Temizle
            </button>
          )}
        </div>
      </div>

      {/* Solutions Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">Aradığınız Kriterlere Uygun Çözüm Bulunamadı</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Farklı bir anahtar kelime, hata kodu veya kategori seçebilir; ya da karşılaştığınız bu yeni arıza için yeni bir çözüm kaydı ekleyebilirsiniz.
            </p>
            <button
              onClick={onAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>İlk Çözümü Ekle</span>
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const categoryBadge = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Diğer'];
            const severityBadge = SEVERITY_BADGES[item.severity] || SEVERITY_BADGES['Normal'];

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 shadow-sm transition-all text-slate-100 flex flex-col justify-between"
              >
                <div>
                  {/* Top Meta Badges & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryBadge}`}>
                        {item.category}
                      </span>

                      {/* Subcategory */}
                      {item.subcategory && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.subcategory}
                        </span>
                      )}

                      {/* Error Code Badge */}
                      {item.error_code && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/70">
                          <Tag className="w-3 h-3" />
                          {item.error_code}
                        </span>
                      )}

                      {/* Severity */}
                      <span className={`px-2 py-0.5 rounded text-[11px] border ${severityBadge}`}>
                        {item.severity}
                      </span>

                      {/* Scope Badge */}
                      {item.customer_name ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950 text-blue-300 border border-blue-800">
                          <Building2 className="w-3 h-3" />
                          {item.customer_name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          🌐 Genel Çözüm
                        </span>
                      )}
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button
                        onClick={() => onEdit(item)}
                        title="Düzenle"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        title="Sil"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mt-3 leading-snug">
                    {item.title}
                  </h3>

                  {/* Symptoms & Root cause summary */}
                  {(item.symptoms || item.root_cause) && (
                    <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {item.symptoms && (
                        <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-slate-300">
                          <span className="font-semibold text-rose-300 block mb-0.5">⚠️ Belirti / Şikayet:</span>
                          <span className="leading-relaxed">{item.symptoms}</span>
                        </div>
                      )}
                      {item.root_cause && (
                        <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 text-slate-300">
                          <span className="font-semibold text-amber-300 block mb-0.5">🔍 Kök Neden:</span>
                          <span className="leading-relaxed">{item.root_cause}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step-by-Step Solution */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <div className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Adım Adım Çözüm:</span>
                    </div>
                    <div className="text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                      {item.solution_steps}
                    </div>
                  </div>

                  {/* Command Snippet (PowerShell / CMD) with quick copy */}
                  {item.command_snippet && (
                    <div className="mt-3 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden text-xs">
                      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-semibold">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Hızlı Komut Satırı (PowerShell / CMD):</span>
                        </div>
                        <CopyButton text={item.command_snippet} label="Komutu Kopyala" />
                      </div>
                      <pre className="p-3 text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
                        {item.command_snippet}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Card Footer: views & date */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Eklenme: {item.created_at ? item.created_at.slice(0, 10) : '-'}</span>
                  <span>{item.views_count || 0} Kez Görüntülendi</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onSaveToKB={(sol) => {
          setIsAIChatOpen(false);
          onAdd?.(sol);
        }}
      />
    </div>
  );
}
