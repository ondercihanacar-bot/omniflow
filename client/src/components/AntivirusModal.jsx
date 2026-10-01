import React, { useState, useEffect } from 'react';
import {
  X, Shield, Globe, User, Lock, Users, Calendar, Clock,
  Key, FileText, Check, AlertCircle, Eye, EyeOff, Building2
} from 'lucide-react';

const COMMON_BRANDS = [
  'Kaspersky',
  'Sophos',
  'ESET',
  'Bitdefender',
  'Microsoft Defender for Business',
  'Trend Micro',
  'SentinelOne',
  'FortiClient (Fortinet)',
  'Symantec',
  'Diğer'
];

const DEFAULT_PORTALS = {
  Kaspersky: 'https://cloud.kaspersky.com',
  Sophos: 'https://central.sophos.com',
  ESET: 'https://protect.eset.com',
  Bitdefender: 'https://gravityzone.bitdefender.com',
  'Microsoft Defender for Business': 'https://security.microsoft.com',
  'Trend Micro': 'https://xdr.trendmicro.com',
  SentinelOne: 'https://usea1.sentinelone.net'
};

export default function AntivirusModal({
  isOpen,
  antivirus,
  customerId,
  branches = ['Merkez Ofis'],
  onClose,
  onSave
}) {
  const [formData, setFormData] = useState({
    customer_id: customerId,
    brand: 'Kaspersky',
    product_name: 'Kaspersky Endpoint Security Cloud',
    branch_name: 'Merkez Ofis',
    portal_url: 'https://cloud.kaspersky.com',
    username: '',
    password: '',
    user_count: 10,
    license_term: '1 Yıllık',
    license_expiry: '',
    license_key: '',
    notes: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (antivirus) {
      setFormData({
        ...antivirus,
        customer_id: antivirus.customer_id || customerId,
        user_count: antivirus.user_count || 1,
        license_term: antivirus.license_term || '1 Yıllık'
      });
    } else {
      setFormData({
        customer_id: customerId,
        brand: 'Kaspersky',
        product_name: 'Kaspersky Endpoint Security Cloud Plus',
        branch_name: branches[0] || 'Merkez Ofis',
        portal_url: 'https://cloud.kaspersky.com',
        username: '',
        password: '',
        user_count: 10,
        license_term: '1 Yıllık',
        license_expiry: '',
        license_key: '',
        notes: ''
      });
    }
    setError('');
    setShowPassword(false);
  }, [antivirus, customerId, isOpen, branches]);

  if (!isOpen) return null;

  const handleBrandChange = (newBrand) => {
    setFormData(prev => ({
      ...prev,
      brand: newBrand,
      portal_url: prev.portal_url === DEFAULT_PORTALS[prev.brand] || !prev.portal_url
        ? (DEFAULT_PORTALS[newBrand] || prev.portal_url)
        : prev.portal_url,
      product_name: prev.product_name.includes(prev.brand) || prev.product_name === 'Kaspersky Endpoint Security Cloud Plus'
        ? (newBrand === 'Kaspersky' ? 'Kaspersky Endpoint Security Cloud Plus' : `${newBrand} Endpoint Security`)
        : prev.product_name
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.product_name.trim()) {
      setError('Lütfen antivirüs ürün adını belirtin.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {antivirus ? 'Antivirüs Lisansını Düzenle' : 'Yeni Antivirüs Lisansı Ekle'}
              </h3>
              <p className="text-xs text-slate-400">Bulut panel bilgileri, kullanıcı sayısı ve lisans bitiş süresi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Brand & Product Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Antivirüs Markası *</span>
              </label>
              <select
                value={formData.brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {COMMON_BRANDS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ürün Tam Adı / Sürüm *
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Örn: Kaspersky Endpoint Security Cloud Plus"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Row 2: Branch & Portal URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Geçerli Şube / Kapsam</span>
              </label>
              <select
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Tüm Şubeler">Tüm Şubeler (Genel)</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Yönetim Paneli Web Adresi (URL)</span>
              </label>
              <input
                type="url"
                value={formData.portal_url}
                onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
                placeholder="https://cloud.kaspersky.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Portal Credentials (Username & Password) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Panel Kullanıcı Adı / E-posta</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="bilgiislem@sirket.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Panel Giriş Parolası</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Panel parolası..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: User/Seat Count, License Term & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Lisans Kullanıcı / Cihaz Sayısı</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.user_count}
                onChange={(e) => setFormData({ ...formData, user_count: e.target.value })}
                placeholder="Örn: 25"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Lisans Süresi</span>
              </label>
              <select
                value={formData.license_term}
                onChange={(e) => setFormData({ ...formData, license_term: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="1 Yıllık">1 Yıllık</option>
                <option value="2 Yıllık">2 Yıllık</option>
                <option value="3 Yıllık">3 Yıllık</option>
                <option value="5 Yıllık">5 Yıllık</option>
                <option value="Aylık Abonelik">Aylık Abonelik</option>
                <option value="Süresiz (Ömür Boyu)">Süresiz (Ömür Boyu)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Lisans Bitiş Tarihi *</span>
              </label>
              <input
                type="text"
                value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                placeholder="GG.AA.YYYY (Örn: 25.10.2026)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">15 gün kala otomatik uyarı tetiklenir</span>
            </div>
          </div>

          {/* Row 5: License Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Aktivasyon Kodu / Lisans Anahtarı</span>
            </label>
            <input
              type="text"
              value={formData.license_key}
              onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notlar &amp; Koruma Detayları</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Fidye yazılımı (Ransomware) koruması, web filtreleme, mobil cihaz desteği vb..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{antivirus ? 'Değişiklikleri Kaydet' : 'Antivirüs Lisansı Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
