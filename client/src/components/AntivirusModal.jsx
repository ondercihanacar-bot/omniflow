import React, { useState, useEffect } from 'react';
import {
  ExternalLink, X, Shield, Globe, User, Lock, Users, Calendar, Clock,
  Key, FileText, Check, AlertCircle, Eye, EyeOff, Building2,
  ClipboardPaste, Sparkles, ChevronDown, ChevronUp
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

const MONTH_MAP = {
  jan: 1, janary: 1, january: 1, ocak: 1,
  feb: 2, february: 2, subat: 2, şubat: 2,
  mar: 3, march: 3, mart: 3,
  apr: 4, april: 4, nisan: 4,
  may: 5, mayıs: 5, mayis: 5,
  jun: 6, june: 6, haziran: 6,
  jul: 7, july: 7, temmuz: 7,
  aug: 8, august: 8, agustos: 8, ağustos: 8,
  sep: 9, sept: 9, september: 9, eylul: 9, eylül: 9,
  oct: 10, october: 10, ekim: 10,
  nov: 11, november: 11, kasim: 11, kasım: 11,
  dec: 12, december: 12, aralik: 12, aralık: 12
};

export function parseAntivirusText(text) {
  const result = {};
  if (!text || typeof text !== 'string') return result;

  const lower = text.toLowerCase();

  // 1. Brand & Product Name & Portal
  if (lower.includes('kaspersky')) {
    result.brand = 'Kaspersky';
    result.portal_url = 'https://cloud.kaspersky.com';
    if (/kaspersky next xdr expert/i.test(text)) {
      result.product_name = 'Kaspersky Next XDR Expert';
    } else if (/kaspersky next edr optimum/i.test(text)) {
      result.product_name = 'Kaspersky Next EDR Optimum';
    } else if (/kaspersky next edr foundations/i.test(text)) {
      result.product_name = 'Kaspersky Next EDR Foundations';
    } else if (/kaspersky endpoint security cloud plus/i.test(text)) {
      result.product_name = 'Kaspersky Endpoint Security Cloud Plus';
    } else if (/kaspersky endpoint security cloud/i.test(text)) {
      result.product_name = 'Kaspersky Endpoint Security Cloud';
    } else if (/kaspersky small office security/i.test(text)) {
      result.product_name = 'Kaspersky Small Office Security';
    } else if (/kaspersky endpoint security/i.test(text)) {
      result.product_name = 'Kaspersky Endpoint Security';
    } else {
      result.product_name = 'Kaspersky Next EDR Foundations';
    }
  } else if (lower.includes('sophos')) {
    result.brand = 'Sophos';
    result.portal_url = 'https://central.sophos.com';
    if (/intercept x advanced with xdr/i.test(text)) {
      result.product_name = 'Sophos Intercept X Advanced with XDR';
    } else if (/intercept x advanced/i.test(text)) {
      result.product_name = 'Sophos Intercept X Advanced';
    } else {
      result.product_name = 'Sophos Central Endpoint Protection';
    }
  } else if (lower.includes('eset')) {
    result.brand = 'ESET';
    result.portal_url = 'https://protect.eset.com';
    if (/protect complete/i.test(text)) {
      result.product_name = 'ESET PROTECT Complete';
    } else if (/protect advanced/i.test(text)) {
      result.product_name = 'ESET PROTECT Advanced';
    } else if (/protect enterprise/i.test(text)) {
      result.product_name = 'ESET PROTECT Enterprise';
    } else {
      result.product_name = 'ESET PROTECT Advanced';
    }
  } else if (lower.includes('bitdefender')) {
    result.brand = 'Bitdefender';
    result.portal_url = 'https://gravityzone.bitdefender.com';
    result.product_name = 'Bitdefender GravityZone Business Security';
  } else if (lower.includes('defender') || lower.includes('microsoft 365')) {
    result.brand = 'Microsoft Defender for Business';
    result.portal_url = 'https://security.microsoft.com';
    result.product_name = 'Microsoft Defender for Business';
  }

  // 2. Seats / Count (e.g. 50/55 or Seats: 55)
  const slashMatch = text.match(/\b(\d+)\s*(?:\/|of)\s*(\d+)\b/i);
  if (slashMatch) {
    result.user_count = parseInt(slashMatch[2], 10);
  } else {
    const seatMatch = text.match(/(?:seats?|users?|devices?|cihaz|kullanıcı|adet|lisans adedi|kontenjan)[:\s]+(\d+)/i) ||
                      text.match(/(\d+)\s*(?:seats?|users?|devices?|cihaz|kullanıcı)/i);
    if (seatMatch) {
      result.user_count = parseInt(seatMatch[1], 10);
    }
  }

  // 3. Expiry Date
  const m1 = text.match(/\b([A-Za-zğüşıöçĞÜŞİÖÇ]+)\s+(\d{1,2}),?\s+(20\d{2})\b/);
  const m2 = text.match(/\b(\d{1,2})\s+([A-Za-zğüşıöçĞÜŞİÖÇ]+)\s+(20\d{2})\b/);
  if (m1 && MONTH_MAP[m1[1].toLowerCase().slice(0, 3)]) {
    const m = MONTH_MAP[m1[1].toLowerCase().slice(0, 3)];
    result.license_expiry = `${String(m1[2]).padStart(2, '0')}.${String(m).padStart(2, '0')}.${m1[3]}`;
  } else if (m2 && MONTH_MAP[m2[2].toLowerCase().slice(0, 3)]) {
    const m = MONTH_MAP[m2[2].toLowerCase().slice(0, 3)];
    result.license_expiry = `${String(m2[1]).padStart(2, '0')}.${String(m).padStart(2, '0')}.${m2[3]}`;
  } else {
    const isoMatch = text.match(/\b(20\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/);
    if (isoMatch) {
      result.license_expiry = `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
    } else {
      const allDates = [...text.matchAll(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|[12]\d|3[01])[-/.](20\d{2})\b/g)];
      if (allDates.length > 0) {
        const lastDate = allDates[allDates.length - 1];
        let p1 = parseInt(lastDate[1], 10);
        let p2 = parseInt(lastDate[2], 10);
        const year = lastDate[3];
        if (p1 <= 12 && p2 > 12) {
          result.license_expiry = `${String(p2).padStart(2, '0')}.${String(p1).padStart(2, '0')}.${year}`;
        } else {
          result.license_expiry = `${String(p1).padStart(2, '0')}.${String(p2).padStart(2, '0')}.${year}`;
        }
      }
    }
  }

  // 4. Term
  const termMatch = text.match(/(\d+)\s*(?:years?|yıl|yıllık)/i);
  if (termMatch) {
    const y = termMatch[1];
    if (['1', '2', '3', '5'].includes(y)) {
      result.license_term = `${y} Yıllık`;
    }
  } else if (/monthly|aylık/i.test(text)) {
    result.license_term = 'Aylık Abonelik';
  } else if (/perpetual|ömür boyu|süresiz/i.test(text)) {
    result.license_term = 'Süresiz (Ömür Boyu)';
  }

  // 5. Activation code / License Key (XXXXX-XXXXX-XXXXX-XXXXX) or UUID
  const actMatch = text.match(/\b([A-Z0-9]{4,5}-[A-Z0-9]{4,5}-[A-Z0-9]{4,5}-[A-Z0-9]{4,5}(?:-[A-Z0-9]{4,5})?)\b/i);
  const uuidMatch = text.match(/\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i);
  if (actMatch && actMatch[1].length >= 19 && !actMatch[1].includes('-4')) {
    result.license_key = actMatch[1].toUpperCase();
  } else if (uuidMatch) {
    result.license_key = uuidMatch[1].toLowerCase();
  }

  // 6. Additional Notes
  const extraNotes = [];
  const wsMatch = text.match(/workspace(?:\s*id)?[:\s]+([0-9a-f-]{36})/i);
  if (wsMatch) extraNotes.push(`Workspace ID: ${wsMatch[1]}`);
  const compMatch = text.match(/company(?:\s*id)?[:\s]+([0-9a-f-]{36})/i);
  if (compMatch) extraNotes.push(`Company ID: ${compMatch[1]}`);
  const mobileMatch = text.match(/(\d+)\s*(?:mobile|telefon)/i);
  if (mobileMatch) extraNotes.push(`Mobil Cihaz Kotası: ${mobileMatch[1]}`);

  if (extraNotes.length > 0) {
    result.notes = extraNotes.join('\n');
  }

  return result;
}

export default function AntivirusModal({
  isOpen,
  antivirus,
  license,
  customerId,
  branches = ['Merkez Ofis'],
  onClose,
  onSave
}) {
  const currentItem = antivirus || license;

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
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [pasteInputText, setPasteInputText] = useState('');
  const [smartDetectionMsg, setSmartDetectionMsg] = useState(null);

  useEffect(() => {
    if (currentItem) {
      setFormData({
        ...currentItem,
        customer_id: currentItem.customer_id || customerId,
        user_count: currentItem.user_count || 1,
        license_term: currentItem.license_term || '1 Yıllık'
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
    setShowManualPaste(false);
    setPasteInputText('');
    setSmartDetectionMsg(null);
  }, [isOpen, currentItem?.id, customerId]);

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

  const applyParsedData = (text) => {
    const parsed = parseAntivirusText(text);
    const count = Object.keys(parsed).length;

    if (count === 0) {
      setSmartDetectionMsg({
        type: 'warning',
        text: 'Metinde antivirüs lisans verisi bulunamadı. Lütfen paneldeki lisans alanını kopyaladığınızdan emin olun.'
      });
      return false;
    }

    setFormData(prev => ({
      ...prev,
      ...(parsed.brand && { brand: parsed.brand }),
      ...(parsed.portal_url && { portal_url: parsed.portal_url }),
      ...(parsed.product_name && { product_name: parsed.product_name }),
      ...(parsed.user_count && { user_count: parsed.user_count }),
      ...(parsed.license_expiry && { license_expiry: parsed.license_expiry }),
      ...(parsed.license_term && { license_term: parsed.license_term }),
      ...(parsed.license_key && { license_key: parsed.license_key }),
      ...(parsed.notes && {
        notes: prev.notes ? `${prev.notes}\n${parsed.notes}` : parsed.notes
      })
    }));

    const detectedSummary = [
      parsed.product_name,
      parsed.user_count ? `${parsed.user_count} Koltuk/Cihaz` : null,
      parsed.license_expiry ? `Bitiş: ${parsed.license_expiry}` : null,
      parsed.license_key ? `Anahtar: ${parsed.license_key.substring(0, 14)}...` : null
    ].filter(Boolean).join(' • ');

    setSmartDetectionMsg({
      type: 'success',
      text: `✓ Başarıyla Algılandı: ${detectedSummary}`
    });
    return true;
  };

  const handleClipboardFill = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          applyParsedData(text);
          return;
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
    // If clipboard read is blocked by browser permissions, open manual paste area
    setShowManualPaste(true);
    setSmartDetectionMsg({
      type: 'info',
      text: 'Pano izni kısıtlı. Lütfen kopyaladığınız metni aşağıdaki kutucuğa yapıştırın (Ctrl+V).'
    });
  };

  const handleManualParse = () => {
    if (!pasteInputText.trim()) return;
    const ok = applyParsedData(pasteInputText);
    if (ok) {
      setShowManualPaste(false);
    }
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
                {currentItem ? 'Antivirüs Lisansını Düzenle' : 'Yeni Antivirüs Lisansı Ekle'}
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
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Smart Clipboard Auto-Fill Hero Card */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Panodan Akıllı Lisans Doldur</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">Kaspersky / Sophos / ESET</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Bulut konsolundaki lisans detaylarını kopyalayın, tek tıkla alanları doldursun.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClipboardFill}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-emerald-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Panodaki metni oku ve form alanlarını otomatik doldur"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Panodan Doldur</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualPaste(prev => !prev)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{showManualPaste ? 'Kapat' : 'Metin Yapıştır'}</span>
                  {showManualPaste ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Manual Paste Box */}
            {showManualPaste && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-fadeIn">
                <textarea
                  rows={3}
                  value={pasteInputText}
                  onChange={(e) => setPasteInputText(e.target.value)}
                  placeholder="Kaspersky, Sophos veya başka bir panelden kopyaladığınız lisans metnini buraya yapıştırın (Ctrl + V)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleManualParse}
                    disabled={!pasteInputText.trim()}
                    className="px-3 py-1.5 bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Çözümle &amp; Doldur</span>
                  </button>
                </div>
              </div>
            )}

            {/* Smart Detection Feedback */}
            {smartDetectionMsg && (
              <div className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${
                smartDetectionMsg.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : smartDetectionMsg.type === 'warning'
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/70 border-slate-700 text-slate-300'
              }`}>
                {smartDetectionMsg.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                )}
                <span>{smartDetectionMsg.text}</span>
              </div>
            )}
          </div>

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
                placeholder="Örn: Kaspersky Next EDR Foundations"
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
              <span className="text-[10px] text-slate-500 block mt-1">Son 30 gün uyarı, 15 gün kala sesli &amp; belirgin alarm</span>
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
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX veya UUID"
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
              <span>{currentItem ? 'Değişiklikleri Kaydet' : 'Antivirüs Lisansı Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}