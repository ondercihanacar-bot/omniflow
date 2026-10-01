import React, { useState, useEffect } from 'react';
import {
  X, BookOpen, Tag, AlertTriangle, Terminal, Building2, CheckCircle2,
  HelpCircle, Code2, AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  'Ağ & Firewall',
  'Sunucu & Sanallaştırma',
  'Yedekleme & NAS',
  'Kullanıcı PC & Windows',
  'Wi-Fi & UniFi',
  'E-Posta & Office',
  'Güvenlik & Antivirüs',
  'Diğer'
];

const SEVERITIES = [
  { value: 'Kritik', label: '🔴 Kritik Arıza', class: 'text-rose-400 bg-rose-950/60 border-rose-800' },
  { value: 'Yüksek', label: '🟠 Yüksek Öncelik', class: 'text-amber-400 bg-amber-950/60 border-amber-800' },
  { value: 'Normal', label: '🔵 Normal Çözüm', class: 'text-blue-400 bg-blue-950/60 border-blue-800' },
  { value: 'İpucu', label: '🟢 Pratik İpucu / Not', class: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' }
];

export default function KnowledgeBaseModal({
  isOpen,
  onClose,
  onSave,
  item = null,
  customers = []
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Ağ & Firewall',
    subcategory: '',
    error_code: '',
    symptoms: '',
    root_cause: '',
    solution_steps: '',
    command_snippet: '',
    customer_id: '',
    severity: 'Normal'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        category: item.category || 'Ağ & Firewall',
        subcategory: item.subcategory || '',
        error_code: item.error_code || '',
        symptoms: item.symptoms || '',
        root_cause: item.root_cause || '',
        solution_steps: item.solution_steps || '',
        command_snippet: item.command_snippet || '',
        customer_id: item.customer_id || '',
        severity: item.severity || 'Normal'
      });
    } else {
      setFormData({
        title: '',
        category: 'Ağ & Firewall',
        subcategory: '',
        error_code: '',
        symptoms: '',
        root_cause: '',
        solution_steps: '',
        command_snippet: '',
        customer_id: '',
        severity: 'Normal'
      });
    }
    setError('');
  }, [item, isOpen]);

  // Global ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Sorun / Çözüm Başlığı zorunludur.');
      return;
    }
    if (!formData.solution_steps.trim()) {
      setError('Adım Adım Çözüm açıklaması zorunludur.');
      return;
    }

    onSave({
      ...formData,
      customer_id: formData.customer_id ? Number(formData.customer_id) : null
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-3xl w-full my-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {item ? 'Sorun & Çözüm Kaydını Düzenle' : 'Yeni IT Çözüm Kaydı Ekle'}
              </h3>
              <p className="text-xs text-slate-400">
                Arıza belirtileri, hata kodları, adım adım çözüm ve tek tıkla komut satırı kaydı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sorun / Arıza Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: FortiClient VPN %98'de Takılıyor ve Bağlanmıyor"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Category, Subcategory, Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ana Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alt Kırılım / Etiket
              </label>
              <input
                type="text"
                placeholder="Örn: VPN, VSS, Outlook, Active Directory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Öncelik / Seviye
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {SEVERITIES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Code & Customer Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Hata Kodu / Ekran Mesajı</span>
              </label>
              <input
                type="text"
                placeholder="Örn: 0x80070005, Event ID 8193, Error 98"
                value={formData.error_code}
                onChange={(e) => setFormData({ ...formData, error_code: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Kapsam (Müşteri İlişkisi)</span>
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">🌐 Genel Çözüm (Tüm Şirketler İçin Geçerli)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>🏢 Sadece: {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Symptoms & Root Cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Belirtiler & Kullanıcı Şikayeti
              </label>
              <textarea
                rows={2}
                placeholder="Kullanıcı ne görüyor veya arıza nasıl ortaya çıkıyor?"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kök Neden (Root Cause)
              </label>
              <textarea
                rows={2}
                placeholder="Arızaya sebep olan temel donanım/yazılım unsuru nedir?"
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Step-by-Step Solution */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Adım Adım Çözüm Rehberi *
            </label>
            <textarea
              rows={5}
              required
              placeholder="1. Adım: Aygıt yöneticisini açın...&#10;2. Adım: WAN Miniport sürücülerini kaldırın...&#10;3. Adım: Bilgisayarı yeniden başlatın."
              value={formData.solution_steps}
              onChange={(e) => setFormData({ ...formData, solution_steps: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono leading-relaxed"
            />
          </div>

          {/* Command Snippet (PowerShell / CMD) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tek Tıkla Kopyalanabilir Komut / Script (PowerShell / CMD / Bash)</span>
              </span>
              <span className="text-[10px] text-slate-500">Opsiyonel</span>
            </label>
            <textarea
              rows={3}
              placeholder="Örn: netsh int ip reset && netsh winsock reset"
              value={formData.command_snippet}
              onChange={(e) => setFormData({ ...formData, command_snippet: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              Vazgeç (ESC)
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {item ? 'Güncelle' : 'Çözümü Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
