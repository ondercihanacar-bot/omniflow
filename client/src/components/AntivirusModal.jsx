import React, { useState, useEffect } from 'react';
import {
  X, Shield, Globe, User, Lock, Users, Calendar, Clock,
  Key, FileText, Check, AlertCircle, Eye, EyeOff, Building2,
  ExternalLink, Zap, Copy, Sparkles
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
  const [autoLoginToast, setAutoLoginToast] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

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
    setAutoLoginToast(null);
    setCopiedField(null);
  }, [antivirus, customerId, isOpen, branches]);

  const bookmarkletCode = `javascript:(function(){var u=${JSON.stringify(formData.username || '')};var p=${JSON.stringify(formData.password || '')};var e=document.querySelector('input[type="email"],input[name*="mail" i],input[name*="user" i],input[id*="mail" i],input[id*="user" i],input[name="Email"],input[name="username"],input[type="text"]');var pw=document.querySelector('input[type="password"]');if(e&&u){e.value=u;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}if(pw&&p){pw.value=p;pw.dispatchEvent(new Event('input',{bubbles:true}));pw.dispatchEvent(new Event('change',{bubbles:true}));}var b=document.querySelector('button[type="submit"],input[type="submit"],button[data-testid*="submit"],button.btn-primary');if(b)b.focus();})();`;

  const handleOpenPortalWithAutoFill = async () => {
    let url = formData.portal_url?.trim();
    if (!url) {
      url = DEFAULT_PORTALS[formData.brand] || 'https://cloud.kaspersky.com';
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Copy password to clipboard as immediate fallback
    try {
      if (formData.password) {
        await navigator.clipboard.writeText(formData.password);
      } else if (formData.username) {
        await navigator.clipboard.writeText(formData.username);
      }
    } catch (err) {}

    // Call desktop automation backend first (launches Chrome, types email/password, clicks Giriş yap)
    try {
      const res = await fetch('/api/antivirus/browser-autologin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          username: formData.username,
          password: formData.password
        })
      });
      const data = await res.json();
      if (data.success && data.mode === 'cdp_desktop') {
        setAutoLoginToast({
          type: 'success',
          message: '🚀 Google Chrome otomatik açıldı! E-posta adresiniz ve şifreniz yazıldı, "Giriş yap" butonuna tıklandı.',
          copied: 'password'
        });
        return;
      }
    } catch (e) {
      console.warn('Desktop auto-login fallback to client:', e);
    }

    // Client-side fallback: open new tab
    setAutoLoginToast({
      type: 'success',
      message: 'Yönetim paneli yeni sekmede açıldı! Giriş parolanız panoya kopyalandı. Sayfada parola alanına doğrudan Ctrl + V yapıştırabilirsiniz.',
      copied: formData.password ? 'password' : 'username'
    });
    window.open(url, '_blank');
  };

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Yönetim Paneli Web Adresi (URL)</span>
                </label>
                <button
                  type="button"
                  onClick={handleOpenPortalWithAutoFill}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-700/60 hover:border-emerald-500 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Web sayfasını açar ve e-posta / şifreyi otomatik hazırlar"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Otomatik Girişle Aç</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  type="url"
                  value={formData.portal_url}
                  onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
                  placeholder="https://cloud.kaspersky.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-28 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleOpenPortalWithAutoFill}
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition-all cursor-pointer active:scale-95"
                  title="Paneli yeni sekmede aç ve parolayı otomatik panoya kopyala"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Giriş Yap &amp; Aç</span>
                </button>
              </div>

              {/* Quick direct SSO Auth URL helper for Kaspersky */}
              {formData.brand === 'Kaspersky' && (
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">cloud.kaspersky.com</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      portal_url: 'https://auth.eu.uis.kaspersky.com/connect/authorize?client_id=B2BCP&code_challenge=xi45KJEp8qZdGXh1m19FZrzFR0rC40WZhylv33Ku8lQ&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fuis.iam.hw.services.cloud.kaspersky.com%2Fuis%2Fv1%2Fauth&response_type=code&scope=openid+email+profile&state=wLBfiMHcF8Xc-MJ9N4rf3A'
                    }))}
                    className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5 ml-1 shrink-0"
                    title="Doğrudan Kaspersky Auth SSO Giriş Sayfası Linkini Yükle"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Doğrudan SSO Giriş Linki</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick-Login Assistant Banner */}
          {autoLoginToast && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/50 rounded-xl space-y-2 shadow-xl animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>🚀 Yönetim Paneli Açıldı &amp; Giriş Bilgileri Hazırlandı!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoLoginToast(null)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {autoLoginToast.message}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-800/40 text-xs">
                {formData.username && (
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(formData.username);
                      setCopiedField('username');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3 text-cyan-400" />
                    <span>{copiedField === 'username' ? '✓ E-Posta Kopyalandı' : `E-Postayı Kopyala: ${formData.username}`}</span>
                  </button>
                )}

                {formData.password && (
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(formData.password);
                      setCopiedField('password');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors shadow"
                  >
                    <Key className="w-3 h-3" />
                    <span>{copiedField === 'password' ? '✓ Parola Kopyalandı' : 'Parolayı Kopyala'}</span>
                  </button>
                )}

                {/* 1-Click Draggable Bookmarklet for Instant Auto-Fill */}
                <a
                  href={bookmarkletCode}
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(bookmarkletCode);
                    setCopiedField('bookmarklet');
                    setTimeout(() => setCopiedField(null), 2500);
                  }}
                  title="Bu butona tıklayarak doldurma kodunu kopyalayabilir veya tarayıcınızın Yer İmleri çubuğuna sürükleyip bırakabilirsiniz. Açılan sayfada tek tıkla e-posta ve şifrenizi otomatik doldurur!"
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{copiedField === 'bookmarklet' ? '✓ Otomatik Doldurma Kodu Kopyalandı' : '⭐ OmniFill: Tek Tıkla Doldurucu'}</span>
                </a>
              </div>
            </div>
          )}

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
