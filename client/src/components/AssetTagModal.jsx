import React, { useState, useEffect } from 'react';
import {
  X, Printer, QrCode, Tag, Check, Laptop, Server, Shield,
  Building2, User, Layers, Sliders, ExternalLink, Download
} from 'lucide-react';
import QRCode from 'qrcode';

export default function AssetTagModal({
  isOpen,
  onClose,
  customer,
  selectedDevice = null,
  deviceType = 'pc',
  computers = [],
  servers = [],
  firewalls = []
}) {
  const [tagMode, setTagMode] = useState('single'); // 'single' | 'all'
  const [tagSize, setTagSize] = useState('medium'); // 'small' (50x30mm) | 'medium' (70x40mm) | 'large' (100x50mm)
  const [currentDeviceId, setCurrentDeviceId] = useState(selectedDevice?.id || null);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState({});
  const [includeCredentialsHint, setIncludeCredentialsHint] = useState(false);

  // Collect all items unified
  const allItems = [
    ...(computers || []).map(c => ({
      id: `pc_${c.id}`,
      originalId: c.id,
      category: 'pc',
      categoryLabel: 'Kullanıcı Bilgisayarı',
      title: c.computer_name || 'PC',
      subtitle: `${c.brand || ''} ${c.model || ''}`.trim() || 'Bilgisayar',
      user: c.assigned_user || 'Atanmamış',
      department: c.department || '',
      branch: c.branch_name || 'Merkez Ofis',
      serialNumber: c.serial_number || 'S/N Belirtilmedi',
      mac: c.ethernet_mac || c.wifi_mac || '',
      ip: c.ethernet_ip || c.wifi_ip || '',
      remoteId: c.remote_access_id || ''
    })),
    ...(servers || []).map(s => ({
      id: `server_${s.id}`,
      originalId: s.id,
      category: 'server',
      categoryLabel: 'Fiziksel Sunucu',
      title: s.server_name || 'Sunucu',
      subtitle: `${s.brand || ''} ${s.model || ''}`.trim() || 'Sunucu Donanımı',
      user: s.role_description || 'Ana Sunucu',
      department: s.server_type || 'Sunucu Odası',
      branch: s.branch_name || 'Merkez Ofis',
      serialNumber: s.serial_number || 'S/N Belirtilmedi',
      mac: s.mac_address || '',
      ip: s.ip_address || s.management_ip || '',
      remoteId: ''
    })),
    ...(firewalls || []).map(f => ({
      id: `firewall_${f.id}`,
      originalId: f.id,
      category: 'firewall',
      categoryLabel: 'Güvenlik Duvarı',
      title: f.device_name || 'Firewall',
      subtitle: `${f.brand || ''} ${f.model || ''}`.trim() || 'Firewall',
      user: f.external_ip ? `Dış IP: ${f.external_ip}` : 'Ağ Ağ Geçidi',
      department: 'Ağ & Güvenlik',
      branch: f.branch_name || 'Merkez Ofis',
      serialNumber: f.serial_number || 'S/N Belirtilmedi',
      mac: '',
      ip: f.management_ip || '',
      remoteId: ''
    }))
  ];

  // Sync selected device
  useEffect(() => {
    if (!isOpen) return;
    if (selectedDevice) {
      const prefix = deviceType === 'server' ? 'server_' : deviceType === 'firewall' ? 'firewall_' : 'pc_';
      setCurrentDeviceId(`${prefix}${selectedDevice.id}`);
      setTagMode('single');
    } else if (allItems.length > 0) {
      setCurrentDeviceId(allItems[0].id);
    } else {
      setCurrentDeviceId(null);
    }
  }, [isOpen, selectedDevice, deviceType, allItems.length]);

  // Generate QR code data URLs for items
  useEffect(() => {
    if (!isOpen || allItems.length === 0) return;

    let isMounted = true;
    const generateAllQrs = async () => {
      const urlMap = {};
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://omniflow.local';
      const qrLib = QRCode.default || QRCode;

      for (const item of allItems) {
        // Build QR target payload: Link to customer + device
        const qrPayload = `${origin}/?customer=${customer?.id || 1}&asset=${encodeURIComponent(item.title)}`;
        try {
          if (qrLib && typeof qrLib.toDataURL === 'function') {
            const dataUrl = await qrLib.toDataURL(qrPayload, {
              width: 240,
              margin: 1,
              color: {
                dark: '#0f172a',
                light: '#ffffff'
              }
            });
            urlMap[item.id] = dataUrl;
          }
        } catch (err) {
          console.warn('QR gen error for', item.title, err);
        }
      }

      if (isMounted) {
        setQrCodeDataUrls(urlMap);
      }
    };

    generateAllQrs();
    return () => { isMounted = false; };
  }, [isOpen, customer, computers.length, servers.length, firewalls.length]);

  // ESC Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !customer) return null;

  const activeDevice = allItems.find(i => i.id === currentDeviceId) || allItems[0];
  const itemsToRender = tagMode === 'single' ? (activeDevice ? [activeDevice] : []) : allItems;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full my-4 flex flex-col max-h-[96vh] overflow-hidden text-slate-100">
        
        {/* Top Control Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Akıllı QR Kod &amp; Varlık Etiketleyici</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  Termal &amp; A4 Uyumlu
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {customer?.company_name || customer?.name || 'Müşteri'} — Cihaz kasaları, monitörler ve sunucular için QR kimlik etiketi basımı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={allItems.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              title="Yazıcıdan doğrudan etiket çıktısı al"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Etiketleri Yazdır</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options & Filter Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Basım Kapsamı:</span>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setTagMode('single')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  tagMode === 'single' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tek Cihaz
              </button>
              <button
                onClick={() => setTagMode('all')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  tagMode === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tüm Envanter ({allItems.length} Etiket)
              </button>
            </div>
          </div>

          {/* Single device picker if single mode */}
          {tagMode === 'single' && (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="text-slate-400 font-semibold">Cihaz:</span>
              <select
                value={currentDeviceId || ''}
                onChange={(e) => setCurrentDeviceId(e.target.value)}
                disabled={allItems.length === 0}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer flex-1 font-mono disabled:opacity-40"
              >
                {allItems.length === 0 ? (
                  <option value="">Cihaz Bulunmuyor</option>
                ) : (
                  allItems.map(i => (
                    <option key={i.id} value={i.id}>
                      [{i.categoryLabel}] {i.title} — {i.user}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Tag Dimensions */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Etiket Boyutu:</span>
            <select
              value={tagSize}
              onChange={(e) => setTagSize(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="medium">Standart Kasa Etiketi (70 × 40 mm)</option>
              <option value="small">Kompakt / Laptop Etiketi (50 × 30 mm)</option>
              <option value="large">Büyük / Server Kabini (100 × 50 mm)</option>
            </select>
          </div>
        </div>

        {/* Tip Banner */}
        <div className="bg-blue-950/40 border-b border-blue-900/40 px-4 py-2 flex items-center justify-between text-[11px] text-blue-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-400">💡 Akıllı Telefon Entegrasyonu:</span>
            <span>
              Bu etiketleri cihazların üzerine yapıştırdığınızda; telefon kamerasını QR koda tuttuğunuz anda doğrudan OMNIFlow'daki bu cihazın sayfası açılır, donanımı ve lisansı anında görüntülenir.
            </span>
          </div>
        </div>

        {/* Printable Preview Container (Rule 2: Real White Sheet for Print) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-300/80 flex justify-center">
          <div
            id="printable-report"
            className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl rounded-xl p-6 sm:p-8 border border-slate-300"
          >
            {/* Print Header (Only visible on full sheet print) */}
            <div className="border-b-2 border-slate-900 pb-3 mb-6 flex items-center justify-between">
              <div>
                <div className="font-black text-lg text-slate-900 tracking-tight">
                  {customer?.company_name || customer?.name || 'Müşteri'}
                </div>
                <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  OMNIFLOW AKILLI VARLIK &amp; DONANIM ETİKETLERİ
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-600 font-mono">
                <div>Düzenleme: <strong>{new Date().toLocaleDateString('tr-TR')}</strong></div>
                <div>Toplam Etiket: <strong>{itemsToRender.length} Adet</strong></div>
              </div>
            </div>

            {/* Labels Grid or Empty State */}
            {itemsToRender.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Tag className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
                <div className="text-sm font-bold text-slate-800">
                  Etiketlenecek Cihaz Bulunamadı
                </div>
                <div className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Bu müşteriye ait henüz kayıtlı kullanıcı bilgisayarı, sunucu veya güvenlik duvarı bulunmuyor. Yeni bir cihaz eklediğinizde QR etiketi anında burada hazır olacaktır.
                </div>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                tagSize === 'small'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : tagSize === 'large'
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {itemsToRender.map((item) => {
                  const qrUrl = qrCodeDataUrls[item.id];

                  return (
                    <div
                      key={item.id}
                      className="border-2 border-slate-900 rounded-xl p-3 bg-white flex items-center justify-between gap-3 break-inside-avoid shadow-sm relative overflow-hidden"
                      style={{
                        minHeight: tagSize === 'small' ? '120px' : tagSize === 'large' ? '180px' : '145px'
                      }}
                    >
                      {/* Left Info Column */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1">
                        {/* Top Header */}
                        <div>
                          <div className="flex items-center gap-1.5 text-[9px] font-black tracking-wider uppercase text-blue-900">
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-950 font-bold border border-blue-300">
                              OMNIFLOW
                            </span>
                            <span className="truncate">{customer?.short_code || customer?.company_name || customer?.name || 'OMNIFlow'}</span>
                          </div>

                        {/* Device Hostname */}
                        <div className="font-black text-slate-950 font-mono text-base sm:text-lg tracking-tight leading-tight mt-1 truncate">
                          {item.title}
                        </div>

                        {/* Model & Spec */}
                        <div className="text-[11px] font-bold text-slate-700 truncate">
                          {item.subtitle}
                        </div>
                      </div>

                      {/* Middle: User & Department */}
                      <div className="text-[10px] text-slate-800 space-y-0.5 border-t border-slate-200 pt-1">
                        <div className="flex items-center gap-1 truncate font-semibold">
                          <User className="w-3 h-3 text-emerald-700 shrink-0" />
                          <span className="truncate">{item.user}</span>
                        </div>
                        {item.department && (
                          <div className="text-[9.5px] text-slate-600 truncate pl-4">
                            📂 {item.department} ({item.branch})
                          </div>
                        )}
                      </div>

                      {/* Bottom: Serial & Network */}
                      <div className="text-[9px] font-mono text-slate-600 border-t border-dashed border-slate-300 pt-1 flex flex-wrap items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 truncate">S/N: {item.serialNumber}</span>
                        {item.ip && <span className="text-blue-800 font-bold">IP: {item.ip}</span>}
                      </div>
                    </div>

                    {/* Right QR Column */}
                    <div className="flex flex-col items-center justify-center shrink-0 border-l border-slate-200 pl-3">
                      {qrUrl ? (
                        <img
                          src={qrUrl}
                          alt="Asset QR"
                          className={`${
                            tagSize === 'small' ? 'w-16 h-16' : tagSize === 'large' ? 'w-24 h-24' : 'w-20 h-20'
                          } object-contain rounded border border-slate-200`}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 animate-pulse rounded" />
                      )}
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider mt-1">
                        TARA &amp; İNCELE
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

            {/* Print Footer (Rule 1 Developer Signature) */}
            <div className="border-t border-slate-300 mt-8 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-1">
              <div>OMNIFlow Akıllı Varlık Yönetimi • Termal &amp; Lazer Etiket Sistemi</div>
              <div>Designed &amp; Developed by Önder Cihan ACAR © 2026. All Rights Reserved.</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
