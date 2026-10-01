import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Clock, 
  Building, 
  Cpu, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Radio, 
  Lock, 
  Layers 
} from 'lucide-react';

export default function OmniHubLicenseModal({ isOpen, onClose, onUpdated }) {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [hubUrl, setHubUrl] = useState('http://localhost:5200');
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setMsg(null);
    }
  }, [isOpen]);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/license/status');
      const data = await res.json();
      if (data.license) {
        setLicense(data.license);
        if (data.license.omnihub_url) setHubUrl(data.license.omnihub_url);
        if (data.license.license_key) setInputKey(data.license.license_key);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate(e) {
    e.preventDefault();
    if (!inputKey.trim()) {
      setMsg({ type: 'error', text: 'Lütfen bir lisans anahtarı giriniz.' });
      return;
    }

    setActivating(true);
    setMsg(null);
    try {
      const res = await fetch('/api/license/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: inputKey.trim(),
          omnihub_url: hubUrl.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Aktivasyon başarısız.');
      }

      setLicense(data.license);
      setMsg({ type: 'success', text: 'Tebrikler! OMNIFlow lisansı OmniHub üzerinden başarıyla etkinleştirildi.' });
      if (onUpdated) onUpdated(data.license);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActivating(false);
    }
  }

  async function handleSync() {
    setActivating(true);
    try {
      const res = await fetch('/api/license/sync', { method: 'POST' });
      const data = await res.json();
      if (data.license) {
        setLicense(data.license);
        setMsg({ type: 'success', text: 'OmniHub merkezi ile telemetri ve lisans sinyali doğrulandı.' });
        if (onUpdated) onUpdated(data.license);
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'OmniHub merkezine erişilemedi. Çevrimdışı moddasınız.' });
    } finally {
      setActivating(false);
    }
  }

  if (!isOpen) return null;

  const isExpired = license?.status === 'expired';
  const isSuspended = license?.status === 'suspended';
  const isActive = license?.status === 'active';
  const isDemo = license?.status === 'demo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                OMNIFlow Lisans ve Aktivasyon
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  OmniHub Protected
                </span>
              </h3>
              <p className="text-xs text-slate-400">Merkezi Lisanslama & Donanım Kilidi (Anti-Piracy)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Status Message */}
          {msg && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
            }`}>
              {msg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* MAIN STATUS & REMAINING DAYS CARD */}
          <div className={`p-5 rounded-xl border relative overflow-hidden ${
            isActive
              ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : isDemo
              ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
              : isSuspended
              ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/50'
              : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                      : isDemo
                      ? 'bg-cyan-950 border border-cyan-500 text-cyan-400'
                      : isSuspended
                      ? 'bg-amber-950 border border-amber-500 text-amber-400'
                      : 'bg-rose-950 border border-rose-500 text-rose-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {isActive ? 'Aktif Kurumsal Lisans' : isDemo ? 'Deneme Sürümü (Demo)' : isSuspended ? 'Lisans Donduruldu' : 'Lisans Süresi Doldu'}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white tracking-wide">
                  {license?.customer_name || 'Bilinmeyen Müşteri'}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Bitiş Tarihi: <strong className="text-slate-200">{license?.end_date || 'Süresiz'}</strong>
                </p>
              </div>

              {/* REMAINING DAYS BIG COUNTER */}
              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Kalan Süre
                </span>
                <div className="text-3xl font-black font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
                  {typeof license?.days_remaining === 'number' ? `${license.days_remaining} GÜN` : (license?.end_date ? 'SÜRESİZ' : 'HESAPLANIYOR...')}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {license?.max_devices ?? 0} Cihaz / {license?.max_users ?? 0} Kullanıcı
                </span>
              </div>
            </div>

            {/* Hardware Fingerprint display */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Donanım Mührü: <strong className="text-slate-300">{license?.hardware_id}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>OmniHub Portalı: <strong className="text-slate-300">{hubUrl}</strong></span>
              </div>
            </div>
          </div>

          {/* ACTIVATION FORM */}
          <form onSubmit={handleActivate} className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Yeni Lisans Anahtarı Girişi & Etkinleştirme
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lisans Anahtarı (License Key) *
                </label>
                <input
                  type="text"
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="OMNI-FLW-XXXX-XXXX-XXXX"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-cyan-300 tracking-wider placeholder-slate-600 focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  OmniHub Dağıtıcı Sunucu Adresi
                </label>
                <input
                  type="text"
                  value={hubUrl}
                  onChange={(e) => setHubUrl(e.target.value)}
                  placeholder="http://localhost:5200"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSync}
                disabled={activating}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${activating ? 'animate-spin' : ''}`} />
                <span>Merkezle Eşitle</span>
              </button>

              <button
                type="submit"
                disabled={activating}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Lock className="w-4 h-4 text-cyan-200" />
                <span>{activating ? 'Etkinleştiriliyor...' : 'LİSANSI ETKİNLEŞTİR'}</span>
              </button>
            </div>
          </form>

          {/* Enabled Modules */}
          {license?.enabled_modules && license.enabled_modules.length > 0 && (
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Lisans Kapsamındaki Yetkili Modüller
              </span>
              <div className="flex flex-wrap gap-1.5">
                {license.enabled_modules.map((m) => (
                  <span
                    key={m}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{m}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PERMANENT DEVELOPER SIGNATURE FOOTER */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 tracking-wide font-sans">
              Designed & Developed by <span className="text-cyan-400 font-semibold">Önder Cihan ACAR</span> © 2026. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
