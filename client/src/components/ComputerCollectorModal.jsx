import React, { useState } from 'react';
import {
  X, Laptop, Zap, Copy, Check, Download, ShieldCheck,
  Terminal, FileCode, WifiOff, Sparkles, Building2, CheckCircle2,
  ExternalLink, Info, AlertCircle
} from 'lucide-react';
import CopyButton from './CopyButton';
import { api } from '../api';

export default function ComputerCollectorModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
  branches = []
}) {
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'download' | 'offline'
  const [selectedBranch, setSelectedBranch] = useState(branches[0] || 'Merkez Ofis');
  const [serverMode, setServerMode] = useState('cloud'); // 'cloud' | 'local'
  const [offlineJson, setOfflineJson] = useState('');
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [offlineError, setOfflineError] = useState(null);

  if (!isOpen || !customer) return null;

  // Cloud URL vs Local current window origin
  const cloudUrl = 'https://omniflow-mptm.onrender.com';
  const localUrl = window.location.origin;
  const baseUrl = serverMode === 'cloud' ? cloudUrl : localUrl;

  const branchParam = encodeURIComponent(selectedBranch);
  const psCommand = `powershell -ExecutionPolicy Bypass -Command "irm '${baseUrl}/api/agent/collector.ps1?c=${customer.id}&b=${branchParam}' | iex"`;
  const shortCommand = `irm '${baseUrl}/api/agent/collector.ps1?c=${customer.id}&b=${branchParam}' | iex`;

  const downloadUrl = `${baseUrl}/api/agent/download/${customer.id}?b=${branchParam}&format=bat`;
  const downloadPs1Url = `${baseUrl}/api/agent/download/${customer.id}?b=${branchParam}&format=ps1`;

  // Submit offline JSON
  const handleSaveOfflineJson = async () => {
    if (!offlineJson.trim()) return;
    setIsSubmittingOffline(true);
    setOfflineError(null);
    try {
      const parsed = JSON.parse(offlineJson);
      parsed.customer_id = customer.id;
      if (!parsed.branch_name) parsed.branch_name = selectedBranch;

      const res = await fetch(`${baseUrl}/api/agent/register-computer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');

      alert(`✅ Başarılı: ${data.message || 'Bilgisayar envantere eklendi!'}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setOfflineError(err.message || 'Geçersiz JSON verisi');
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-2xl w-full my-8 text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Zap className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Otomatik Donanım &amp; Lisans Toplayıcı</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  PowerShell
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Hedef bilgisayarda hiçbir program kurmadan tüm özellikleri 2 saniyede çekin.
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

        {/* Customer & Branch Target Bar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Hedef Müşteri:</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
              {customer.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-400">Şube:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {(branches.length > 0 ? branches : ['Merkez Ofis']).map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('command')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'command'
                ? 'bg-slate-900 text-amber-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>1. Tek Satırlık Komut (AnyDesk / RDP)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'download'
                ? 'bg-slate-900 text-blue-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>2. Dosya İndir (.bat)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'offline'
                ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <WifiOff className="w-4 h-4 text-emerald-400" />
            <span>3. Çevrimdışı Yapıştır</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: ONE-LINE COMMAND */}
          {activeTab === 'command' && (
            <div className="space-y-4">
              {/* Server selector switch */}
              <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Hedef Bağlantı Adresi:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setServerMode('cloud')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      serverMode === 'cloud'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Canlı Bulut (Render)
                  </button>
                  <button
                    type="button"
                    onClick={() => setServerMode('local')}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      serverMode === 'local'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bu Tarayıcı Adresi ({window.location.hostname})
                  </button>
                </div>
              </div>

              {/* Command Code Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>PowerShell Komutu:</span>
                  <span className="text-[11px] text-emerald-400 font-medium">Tek tıkla kopyalayın</span>
                </label>
                <div className="bg-slate-950 border border-amber-500/50 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                  <code className="text-xs text-amber-200 font-mono select-all break-all">
                    {shortCommand}
                  </code>
                  <CopyButton text={shortCommand} title="PowerShell Komutunu Kopyala" />
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nasıl Kullanılır? (3 Kolay Adım)</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30 text-[11px]">
                      1
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      AnyDesk veya TeamViewer ile bağlandığınız bilgisayarda <strong className="text-white">Windows Tuşu + X</strong> menüsünden veya Başlat aramasından <strong className="text-white">PowerShell</strong>&apos;i açın.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30 text-[11px]">
                      2
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Yukarıdaki tek satırlık kodu kopyalayıp PowerShell penceresine yapıştırın ve <strong className="text-white">Enter</strong>&apos;a basın.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                      3
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Script 2 saniyede CPU, RAM, Disk, Windows Lisansı (OEM Key), Office, IP/MAC ve AnyDesk ID&apos;sini okur ve doğrudan <strong className="text-emerald-400">{customer.name}</strong> müşterisinin hanesine kaydeder!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD FILE */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                <FileCode className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-blue-300">Taşınabilir Çalıştırıcı Dosyası (.bat / .ps1)</div>
                  <p className="text-slate-300 leading-relaxed">
                    Bu dosyayı bir kez indirip USB belleğinize veya AnyDesk dosya transferiyle karşı bilgisayarın masaüstüne atabilirsiniz. Çift tıklandığında otomatik olarak <strong className="text-white">{customer.name}</strong> hanesine kaydeder.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={downloadUrl}
                  download
                  className="p-4 bg-slate-950 border border-slate-700 hover:border-blue-500 rounded-xl flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300">Toplayici.bat İndir</div>
                      <div className="text-[11px] text-slate-400">Çift tıklayarak anında çalıştırın</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    ÖNERİLEN
                  </span>
                </a>

                <a
                  href={downloadPs1Url}
                  download
                  className="p-4 bg-slate-950 border border-slate-700 hover:border-amber-500 rounded-xl flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300">Toplayici.ps1 İndir</div>
                      <div className="text-[11px] text-slate-400">Ham PowerShell scripti</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    PS1
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE JSON PASTE */}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-emerald-300">İnternetsiz / Güvenlikli Bilgisayarlar İçin</div>
                  <p className="text-slate-300 leading-relaxed">
                    Eğer hedef bilgisayar internete bağlı değilse veya firewall dışarı POST atılmasını engelliyorsa, PowerShell scripti çalıştığında JSON kodunu ekrana basar ve panoya kopyalar. O JSON kodunu buraya yapıştırıp kaydedebilirsiniz.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Panodaki JSON Verisini Yapıştırın:
                </label>
                <textarea
                  rows={6}
                  value={offlineJson}
                  onChange={(e) => setOfflineJson(e.target.value)}
                  placeholder={`{\n  "computer_name": "PC-MUH-01",\n  "brand": "Lenovo",\n  "model": "ThinkCentre",\n  "serial_number": "MJ0DK198",\n  ...\n}`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {offlineError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{offlineError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveOfflineJson}
                disabled={isSubmittingOffline || !offlineJson.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmittingOffline ? 'Kaydediliyor...' : `${customer.name} Envanterine Kaydet`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-800/40 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kayıtlar sadece <strong className="text-white">{customer.name}</strong> hanesine yazılır.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
