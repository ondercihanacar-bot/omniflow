import React, { useState, useEffect } from 'react';
import {
  X, Printer, Download, Check, Laptop, ShieldCheck, Building2,
  User, Mail, Key, Calendar, FileText, CheckSquare, Square,
  ExternalLink, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import { api } from '../api';
import html2pdf from 'html2pdf.js';

export default function HandoverModal({
  isOpen,
  onClose,
  customer,
  selectedComputer = null,
  computers = [],
  mailAccounts = [],
  currentUser = null
}) {
  // Currently selected computer id
  const [currentPCId, setCurrentPCId] = useState(selectedComputer?.id || null);

  // Form Fields (Live editable)
  const [docNo, setDocNo] = useState('');
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [handoverType, setHandoverType] = useState('İlk Teslim / Zimmet'); // 'İlk Teslim / Zimmet', 'Cihaz Değişimi', 'Geçici Tahsis'
  
  // Personel Bilgileri
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState(''); // T.C. / Sicil No
  const [department, setDepartment] = useState('');
  const [branchName, setBranchName] = useState('');
  const [jobTitle, setJobTitle] = useState('Şirket Personeli');
  const [employeePhone, setEmployeePhone] = useState('');

  // Bilgisayar & Donanım
  const [computerName, setComputerName] = useState('');
  const [deviceType, setDeviceType] = useState('Dizüstü Bilgisayar (Laptop)');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [hardwareSpecs, setHardwareSpecs] = useState('');
  const [ethernetMac, setEthernetMac] = useState('');
  const [wifiMac, setWifiMac] = useState('');
  const [deviceCondition, setDeviceCondition] = useState('Sorunsuz & Temiz (İkinci El)');

  // Yazılım & Lisans & Mail
  const [osVersion, setOsVersion] = useState('');
  const [osLicenseKey, setOsLicenseKey] = useState('');
  const [officeVersion, setOfficeVersion] = useState('');
  const [assignedEmail, setAssignedEmail] = useState('');
  const [remoteAccessId, setRemoteAccessId] = useState('');

  // Teslim Eden Bilgileri
  const [officerName, setOfficerName] = useState(
    currentUser?.name || currentUser?.username || 'Bilgi İşlem Yetkilisi'
  );
  const [officerTitle, setOfficerTitle] = useState('BT / Sistem Yöneticisi');

  // Aksesuar Listesi
  const defaultAccessories = [
    { id: 'charger', label: 'Orijinal Şarj Adaptörü ve Güç Kablosu', checked: true },
    { id: 'bag', label: 'Laptop Taşıma Çantası', checked: true },
    { id: 'mouse', label: 'Kablosuz / Optik Mouse & Mousepad', checked: true },
    { id: 'monitor', label: 'Harici Monitör (Ekran) ve Güç Kablosu', checked: false },
    { id: 'display_cable', label: 'HDMI / DisplayPort / Type-C Kablosu', checked: false },
    { id: 'dock', label: 'USB-C Çoklayıcı / Hub / Docking Station', checked: false },
    { id: 'headset', label: 'Kulaklık & Mikrofon Seti (Headset)', checked: false },
    { id: 'lock', label: 'Güvenlik Kilidi (Kensington)', checked: false },
  ];
  const [accessories, setAccessories] = useState(defaultAccessories);
  const [customAccessory, setCustomAccessory] = useState('');

  // Notes
  const [customNotes, setCustomNotes] = useState('');

  // UI States
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showEditorPanel, setShowEditorPanel] = useState(false);

  // Sync state when selectedComputer changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    const targetPC = selectedComputer || (computers.length > 0 ? computers[0] : null);
    if (targetPC) {
      setCurrentPCId(targetPC.id);
      populateFromPC(targetPC);
    } else {
      generateNewDocNo();
    }
  }, [isOpen, selectedComputer, computers]);

  // Generate Doc No
  const generateNewDocNo = (targetPC = null) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const code = (customer?.code || 'OMNI').toUpperCase().replace(/[^A-Z0-9]/g, '');
    setDocNo(`ZMT-${code}-${yyyy}${mm}${dd}-${randomSuffix}`);
  };

  // Populate data when selecting a PC
  const populateFromPC = (pc) => {
    if (!pc) return;
    generateNewDocNo(pc);
    setComputerName(pc.computer_name || '');
    setDeviceType(pc.device_type || 'Dizüstü Bilgisayar (Laptop)');
    setBrand(pc.brand || '');
    setModel(pc.model || '');
    setSerialNumber(pc.serial_number || '');
    setHardwareSpecs(pc.hardware_specs || '');
    setEthernetMac(pc.ethernet_mac || '');
    setWifiMac(pc.wifi_mac || '');
    setOsVersion(pc.os_version || 'Windows 11 Pro 64-Bit');
    setOsLicenseKey(pc.os_license_key || 'Anakarta Gömülü / OEM Dijital Lisans');
    setOfficeVersion(pc.office_version || 'Microsoft 365 Business Standard');
    setRemoteAccessId(pc.remote_access_id || '');

    setEmployeeName(pc.assigned_user || '');
    setDepartment(pc.department || '');
    setBranchName(pc.branch_name || 'Merkez Ofis');

    // Auto-detect matching email from customer's mail_accounts
    let matchedMail = '';
    if (pc.assigned_user && mailAccounts.length > 0) {
      const normalizedAssigned = pc.assigned_user.toLowerCase().trim();
      const found = mailAccounts.find(m => {
        if (!m) return false;
        const mailName = (m.full_name || '').toLowerCase().trim();
        const mailAddress = (m.email_address || '').toLowerCase().trim();
        return (
          mailName.includes(normalizedAssigned) ||
          normalizedAssigned.includes(mailName) ||
          mailAddress.startsWith(normalizedAssigned.split(' ')[0])
        );
      });
      if (found) {
        matchedMail = found.email_address;
      }
    }
    setAssignedEmail(matchedMail);

    // Default bag checkbox depending on laptop / desktop
    const isLap = (pc.device_type || '').toLowerCase().includes('laptop') ||
                  (pc.device_type || '').toLowerCase().includes('dizüstü');
    setAccessories(prev => prev.map(a => {
      if (a.id === 'bag') return { ...a, checked: isLap };
      return a;
    }));
  };

  const handlePCSelectChange = (e) => {
    const pcId = Number(e.target.value);
    setCurrentPCId(pcId);
    const foundPC = computers.find(c => c.id === pcId);
    if (foundPC) {
      populateFromPC(foundPC);
    }
  };

  const toggleAccessory = (id) => {
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, checked: !a.checked } : a));
  };

  const handleAddCustomAccessory = (e) => {
    e.preventDefault();
    if (!customAccessory.trim()) return;
    setAccessories(prev => [
      ...prev,
      { id: 'custom_' + Date.now(), label: customAccessory.trim(), checked: true }
    ]);
    setCustomAccessory('');
  };

  // Close with ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Primary Action: 1-Click Direct Vector PDF File Download
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const reportElement = document.getElementById('printable-report');
    if (!reportElement) {
      setIsDownloadingPdf(false);
      window.print();
      return;
    }

    const cleanUser = (employeeName || computerName || 'Personel').replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ]/g, '_');
    const filename = `Zimmet_Tutanagi_${cleanUser}_${docNo || 'ZMT'}.pdf`;

    try {
      // 1. Try Backend Chromium Vector PDF generation first
      const htmlContent = reportElement.innerHTML;
      const blob = await api.generatePdf(htmlContent, filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Backend PDF generator fallback, using client html2pdf:', err);
      // 2. Client-side html2pdf fallback
      try {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(reportElement).save();
      } catch (fallbackErr) {
        console.error('Client PDF generation error:', fallbackErr);
        // 3. Fallback to native print
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Secondary Action: Native Print
  const handlePrint = () => {
    window.print();
  };

  // Secondary Action: Open in clean new tab
  const handleOpenInNewTab = () => {
    const reportElement = document.getElementById('printable-report');
    if (!reportElement) {
      window.print();
      return;
    }

    const newTab = window.open('', '_blank');
    if (!newTab) {
      window.print();
      return;
    }

    newTab.document.open();
    newTab.document.write(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Zimmet Tutanağı - ${employeeName || computerName || 'Personel'}</title>
        <style>
          * { box-sizing: border-box; }
          @page { size: A4 portrait; margin: 10mm; }
          body {
            margin: 0;
            padding: 16px;
            background: #ffffff;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .btn-print {
            display: inline-block;
            margin-bottom: 20px;
            padding: 10px 20px;
            background: #059669;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            border-radius: 8px;
            border: none;
            cursor: pointer;
          }
          .btn-print:hover { background: #047857; }
          @media print {
            .btn-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <button class="btn-print" onclick="window.print()">🖨️ Yazdır / PDF Olarak Kaydet</button>
          ${reportElement.innerHTML}
        </div>
      </body>
      </html>
    `);
    newTab.document.close();
  };

  if (!isOpen || !customer) return null;

  // Format date display (DD.MM.YYYY)
  const formattedDate = docDate ? docDate.split('-').reverse().join('.') : new Date().toLocaleDateString('tr-TR');

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-6xl w-full my-4 flex flex-col max-h-[96vh] overflow-hidden text-slate-100">
        
        {/* ================= TOP CONTROL BAR ================= */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Personel Zimmet &amp; Donanım Teslim Tutanağı</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  A4 Resmi Belge
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {customer.name} — Donanım, Windows/Office lisansı ve kurumsal hesap teslim belgesi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditorPanel(!showEditorPanel)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showEditorPanel
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
              title="Zimmet bilgilerini düzenle veya personeli değiştir"
            >
              <span>{showEditorPanel ? '👁️ Önizlemeye Dön' : '✏️ Bilgileri Düzenle'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Resmi A4 formatında anında PDF dosyası indir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'İndiriliyor...' : 'PDF İndir'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Yazıcıdan doğrudan çıktı al"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Yazdır</span>
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Yeni sekmede aç"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Kapat (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Computer Selector Strip */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-semibold whitespace-nowrap">Zimmetlenecek Bilgisayar:</span>
            <select
              value={currentPCId || ''}
              onChange={handlePCSelectChange}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer flex-1 max-w-md font-mono"
            >
              {computers.length === 0 && <option value="">Bu müşteride kayıtlı bilgisayar yok</option>}
              {computers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.computer_name} — {c.assigned_user || 'Atanmamış'} ({c.brand} {c.model || ''})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="font-mono text-[11px]">Belge No: <strong className="text-white">{docNo}</strong></span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-[11px]">Tarih: <strong className="text-white">{formattedDate}</strong></span>
          </div>
        </div>

        {/* ================= BODY: EDITOR PANEL OR A4 PREVIEW ================= */}
        {showEditorPanel ? (
          /* Live Edit Form */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900 space-y-5">
            <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-3.5 text-xs text-blue-200 flex items-center justify-between">
              <span>Bu formdaki değişiklikler anında A4 Zimmet Tutanağına yansır. İşleminiz bitince sağ üstteki <strong>"Önizlemeye Dön"</strong> butonuna basabilirsiniz.</span>
            </div>

            {/* Grid 1: Belge & Personel Bilgileri */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Personel &amp; Tutanak Bilgileri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Personel Adı Soyadı</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">T.C. Kimlik / Sicil No</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Örn: 12345678901 / SIC-402"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Personel Ünvanı / Görevi</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Örn: Muhasebe Uzmanı"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Departman</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Örn: Muhasebe & Finans"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Şube / Lokasyon</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Örn: Merkez Ofis"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Teslim Tarihi</label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Grid 2: Bilgisayar & Donanım Özellikleri */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                Bilgisayar &amp; Donanım Tanımı
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Bilgisayar Adı (Hostname)</label>
                  <input
                    type="text"
                    value={computerName}
                    onChange={(e) => setComputerName(e.target.value)}
                    placeholder="Örn: EKC-PC-01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cihaz Türü</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Dizüstü Bilgisayar (Laptop)">Dizüstü Bilgisayar (Laptop)</option>
                    <option value="Masaüstü Bilgisayar (Desktop PC)">Masaüstü Bilgisayar (Desktop PC)</option>
                    <option value="All-in-One Bilgisayar">All-in-One Bilgisayar</option>
                    <option value="İş İstasyonu (Workstation)">İş İstasyonu (Workstation)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Marka &amp; Model</label>
                  <input
                    type="text"
                    value={brand ? `${brand} ${model}`.trim() : model}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parts = val.split(' ');
                      setBrand(parts[0] || '');
                      setModel(parts.slice(1).join(' ') || '');
                    }}
                    placeholder="Örn: Lenovo ThinkPad T14"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Seri Numarası (S/N)</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Örn: PF-3829X"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Teknik Donanım (CPU / RAM / SSD)</label>
                  <input
                    type="text"
                    value={hardwareSpecs}
                    onChange={(e) => setHardwareSpecs(e.target.value)}
                    placeholder="Örn: Intel Core i7-1265U, 16GB DDR4 RAM, 512GB NVMe SSD"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Cihaz Fiziksel Durumu</label>
                  <select
                    value={deviceCondition}
                    onChange={(e) => setDeviceCondition(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Sıfır / Yeni Cihaz (Kutusunda)">Sıfır / Yeni Cihaz (Kutusunda)</option>
                    <option value="Sorunsuz & Temiz (İkinci El)">Sorunsuz & Temiz (İkinci El)</option>
                    <option value="Kullanılmış / Normal Aşınma İzi Mevcut">Kullanılmış / Normal Aşınma İzi Mevcut</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Ethernet MAC Adresi</label>
                  <input
                    type="text"
                    value={ethernetMac}
                    onChange={(e) => setEthernetMac(e.target.value)}
                    placeholder="00:1A:2B:3C:4D:5E"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Wi-Fi MAC Adresi</label>
                  <input
                    type="text"
                    value={wifiMac}
                    onChange={(e) => setWifiMac(e.target.value)}
                    placeholder="00:1A:2B:3C:4D:5F"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Grid 3: Lisans & Kurumsal Hesaplar */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                Yazılım Lisansları ve Kurumsal E-Posta
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">İşletim Sistemi &amp; Sürüm</label>
                  <input
                    type="text"
                    value={osVersion}
                    onChange={(e) => setOsVersion(e.target.value)}
                    placeholder="Örn: Windows 11 Pro 64-Bit"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Windows Lisans Anahtarı</label>
                  <input
                    type="text"
                    value={osLicenseKey}
                    onChange={(e) => setOsLicenseKey(e.target.value)}
                    placeholder="OEM Dijital veya Key"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Ofis Yazılımı</label>
                  <input
                    type="text"
                    value={officeVersion}
                    onChange={(e) => setOfficeVersion(e.target.value)}
                    placeholder="Örn: Microsoft 365 Business"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Tahsis Edilen Kurumsal E-Posta</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={assignedEmail}
                      onChange={(e) => setAssignedEmail(e.target.value)}
                      placeholder="personel@sirket.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    {mailAccounts.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) setAssignedEmail(e.target.value);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer max-w-[180px]"
                      >
                        <option value="">Kayıtlı Mailden Seç...</option>
                        {mailAccounts.map(m => (
                          <option key={m.id} value={m.email_address}>
                            {m.email_address} ({m.full_name || 'İsimsiz'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Uzak Destek ID (AnyDesk)</label>
                  <input
                    type="text"
                    value={remoteAccessId}
                    onChange={(e) => setRemoteAccessId(e.target.value)}
                    placeholder="Örn: 987 654 321"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Grid 4: Aksesuarlar */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Teslim Edilen Çevre Birimleri &amp; Aksesuarlar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {accessories.map((acc) => (
                  <label
                    key={acc.id}
                    onClick={() => toggleAccessory(acc.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                      acc.checked
                        ? 'bg-purple-950/50 border-purple-600/60 text-purple-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={acc.checked}
                      onChange={() => {}} // handled by parent onClick
                      className="sr-only"
                    />
                    {acc.checked ? (
                      <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="truncate">{acc.label}</span>
                  </label>
                ))}
              </div>

              {/* Add custom accessory */}
              <form onSubmit={handleAddCustomAccessory} className="flex gap-2 max-w-md pt-2">
                <input
                  type="text"
                  placeholder="Yeni özel aksesuar ekle..."
                  value={customAccessory}
                  onChange={(e) => setCustomAccessory(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  + Ekle
                </button>
              </form>
            </div>

            {/* Grid 5: Teslim Eden & Notlar */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Teslim Eden Yetkili &amp; Özel Notlar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Teslim Eden BT Yetkilisi</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Teslim Türü</label>
                  <select
                    value={handoverType}
                    onChange={(e) => setHandoverType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                  >
                    <option value="İlk Teslim / Zimmet">İlk Teslim / Zimmet</option>
                    <option value="Cihaz Değişimi">Cihaz Değişimi</option>
                    <option value="Geçici Tahsis / Yedek Cihaz">Geçici Tahsis / Yedek Cihaz</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Özel Açıklama / Ek Şartlar (Varsa)</label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Örn: Cihaz ile birlikte ek DisplayPort adaptörü teslim edilmiştir."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEditorPanel(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                ✓ Değişiklikleri Onayla ve Önizlemeye Geç
              </button>
            </div>
          </div>
        ) : (
          /* ================= LIVE A4 DOCUMENT PREVIEW (RULE 2: AYDINLIK BEYAZ A4) ================= */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-300/80 flex justify-center">
            <div
              id="printable-report"
              className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl rounded-xl p-6 sm:p-10 border border-slate-300 space-y-6"
            >
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 text-white print:bg-black print:text-white">
                      {customer.code || 'OMNI-ZMT'}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {customer.name}
                    </h1>
                  </div>
                  <div className="text-sm font-black text-emerald-800 uppercase tracking-wide">
                    DONANIM, HESAP VE LİSANS ZİMMET / TESLİM TUTANAĞI
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Bilgi Teknolojileri Departmanı — Kullanıcı Cihazı, Lisans ve Sistem Erişim Tahsis Tutanağı
                  </p>
                </div>

                {/* Meta Box */}
                <div className="text-left sm:text-right text-[11px] text-slate-700 font-mono border-l-2 sm:border-l-0 sm:border-r-0 border-slate-300 pl-3 sm:pl-0 shrink-0 space-y-0.5">
                  <div>Belge No: <strong className="text-slate-950 font-bold">{docNo}</strong></div>
                  <div>Düzenleme Tarihi: <strong className="text-slate-950 font-bold">{formattedDate}</strong></div>
                  <div>Teslim Türü: <strong className="text-emerald-800 font-bold">{handoverType}</strong></div>
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ✓ RESMİ NÜSHA
                    </span>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 1: PERSONEL BİLGİLERİ */}
              <div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-300 text-xs font-black text-slate-800 uppercase tracking-wide flex items-center justify-between">
                  <span>1. Teslim Alan Personel Bilgileri</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">ZİMMET SAHİBİ</span>
                </div>
                <div className="border border-slate-300 rounded-b-lg p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/50">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">Adı Soyadı</span>
                    <strong className="text-slate-950 text-sm">{employeeName || '(Belirtilmedi)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">T.C. / Sicil No</span>
                    <strong className="text-slate-950 font-mono text-sm">{employeeId || '............................'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">Departman</span>
                    <strong className="text-slate-950">{department || '(Belirtilmedi)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">Görev / Ünvan</span>
                    <strong className="text-slate-950">{jobTitle || 'Personel'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">Şube / Lokasyon</span>
                    <strong className="text-slate-950">{branchName || 'Merkez Ofis'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase font-semibold">Teslim Tarihi</span>
                    <strong className="text-slate-950 font-mono">{formattedDate}</strong>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 2: CİHAZ VE DONANIM ÖZELLİKLERİ */}
              <div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-300 text-xs font-black text-slate-800 uppercase tracking-wide flex items-center justify-between">
                  <span>2. Bilgisayar &amp; Donanım Tanımı</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">FİZİKSEL ENVANTER</span>
                </div>
                <div className="border border-slate-300 rounded-b-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="w-1/4 bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Cihaz Türü</td>
                        <td className="w-1/4 p-2.5 font-semibold text-slate-900 border-r border-slate-200">{deviceType}</td>
                        <td className="w-1/4 bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Bilgisayar Adı (Hostname)</td>
                        <td className="w-1/4 p-2.5 font-mono font-bold text-slate-900">{computerName || '-'}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Marka &amp; Model</td>
                        <td className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                          {brand} {model}
                        </td>
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Seri Numarası (S/N)</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-800">
                          {serialNumber || 'Belirtilmedi'}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Teknik Donanım Özellikleri</td>
                        <td colSpan={3} className="p-2.5 text-slate-800 font-medium">
                          {hardwareSpecs || 'Standart Kurumsal Konfigürasyon'}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Ağ &amp; MAC Bilgisi</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-800 border-r border-slate-200">
                          ETH MAC: {ethernetMac || '-'}
                        </td>
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Wi-Fi MAC Adresi</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-800">
                          WLAN MAC: {wifiMac || '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Cihaz Fiziksel Durumu</td>
                        <td colSpan={3} className="p-2.5 font-semibold text-emerald-900 bg-emerald-50/40">
                          ✓ {deviceCondition}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BÖLÜM 3: YAZILIM, LİSANS VE KURUMSAL HESAP BİLGİLERİ */}
              <div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-300 text-xs font-black text-slate-800 uppercase tracking-wide flex items-center justify-between">
                  <span>3. Yazılım, Lisans &amp; Kurumsal Hesap Tanımları</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">YAZILIM &amp; BULUT</span>
                </div>
                <div className="border border-slate-300 rounded-b-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="w-1/4 bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">İşletim Sistemi (OS)</td>
                        <td className="w-1/4 p-2.5 font-semibold text-slate-900 border-r border-slate-200">{osVersion || 'Windows 11 Pro'}</td>
                        <td className="w-1/4 bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Windows Lisans Anahtarı</td>
                        <td className="w-1/4 p-2.5 font-mono text-slate-900 text-[11px]">
                          {osLicenseKey || 'OEM / Dijital Lisans'}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Ofis Yazılım Paketi</td>
                        <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-200">
                          {officeVersion || 'Microsoft 365 Business'}
                        </td>
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Kurumsal E-Posta Hesabı</td>
                        <td className="p-2.5 font-mono font-bold text-blue-800">
                          {assignedEmail || '(Tanımlanmadı)'}
                        </td>
                      </tr>
                      <tr>
                        <td className="bg-slate-50 p-2.5 font-bold text-slate-600 border-r border-slate-200">Güvenlik &amp; Uzak Erişim</td>
                        <td colSpan={3} className="p-2.5 text-slate-700">
                          Kurumsal Uç Nokta Antivirüs / EDR Koruması Aktif {remoteAccessId ? `• AnyDesk ID: ${remoteAccessId}` : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BÖLÜM 4: TESLİM EDİLEN ÇEVRE BİRİMLERİ & AKSESUARLAR */}
              <div>
                <div className="bg-slate-100 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-300 text-xs font-black text-slate-800 uppercase tracking-wide flex items-center justify-between">
                  <span>4. Teslim Edilen Çevre Birimleri &amp; Aksesuarlar</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">KONTROL LİSTESİ</span>
                </div>
                <div className="border border-slate-300 rounded-b-lg p-3 bg-slate-50/50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {accessories.map((acc) => (
                      <div
                        key={acc.id}
                        className={`flex items-center gap-1.5 p-1.5 rounded border text-[11px] ${
                          acc.checked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 flex items-center justify-center rounded text-[10px] font-bold ${
                          acc.checked ? 'bg-emerald-700 text-white' : 'border border-slate-300 text-slate-400'
                        }`}>
                          {acc.checked ? '✓' : '–'}
                        </span>
                        <span className="truncate">{acc.label}</span>
                      </div>
                    ))}
                  </div>

                  {customNotes && (
                    <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs">
                      <strong>Özel Açıklama / İlave Not:</strong> {customNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* BÖLÜM 5: ZİMMET ŞARTLARI & GÜVENLİK TAAHHÜTNAMESİ (HUKUKİ VE BT POLİTİKASI) */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10.5px] leading-relaxed text-slate-700 space-y-1.5 break-inside-avoid">
                <div className="font-bold text-slate-900 uppercase tracking-wide text-xs border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>5. Zimmet Şartları ve Bilgi Güvenliği Taahhütnamesi</span>
                </div>
                <p>
                  <strong>1. Tahsis Amacı:</strong> İşbu tutanakta marka, model, seri numarası ve teknik özellikleri belirtilen bilgisayar, bağlı aksesuarlar, yazılım lisansları ve kurumsal e-posta hesabı; personelin yalnızca şirket işlerini ifa etmesi amacıyla geçici olarak kullanımına tahsis edilmiştir.
                </p>
                <p>
                  <strong>2. Koruma &amp; KVKK Uyumu:</strong> Personel, teslim edilen bilişim ekipmanlarını özenle kullanmayı, üçüncü şahısların yetkisiz erişimine karşı gerekli şifreleme ve fiziksel tedbirleri almayı, şirket bilgi güvenliği yönergelerine ve 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) hükümlerine eksiksiz uymayı taahhüt eder.
                </p>
                <p>
                  <strong>3. Lisans &amp; Hesap Güvenliği:</strong> Cihaz üzerine şirket BT departmanının onayı olmaksızın lisanssız/korsan yazılım yüklenemez; antivirüs ve güvenlik duvarı ayarları kapatılamaz. Kurumsal e-posta ve sistem şifreleri kişiye özel olup hiçbir kimseyle paylaşılamaz.
                </p>
                <p>
                  <strong>4. Arıza &amp; Hasar Bildirimi:</strong> Cihazda veya aksesuarlarında meydana gelebilecek herhangi bir teknik arıza, donanımsal hasar, kaybolma veya hırsızlık durumunda derhal (en geç 24 saat içinde) şirket Bilgi Teknolojileri Departmanına yazılı bilgi verilecektir.
                </p>
                <p>
                  <strong>5. İade Şartı:</strong> Personelin görev değişikliği, şirketten ayrılması veya şirket yönetiminin talep etmesi durumunda; söz konusu bilgisayar, şarj adaptörü, aksesuarları ve lisanslı hesapları eksiksiz, sağlam ve çalışır vaziyette Bilgi Teknolojileri Departmanına teslim edilecektir.
                </p>
              </div>

              {/* BÖLÜM 6: ISLAK İMZA ALANI (TESLİM EDEN & TESLİM ALAN) */}
              <div className="pt-2 break-inside-avoid">
                <div className="grid grid-cols-2 gap-6 text-xs">
                  
                  {/* Teslim Eden */}
                  <div className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between h-44">
                    <div>
                      <div className="font-black text-slate-900 uppercase tracking-wide text-xs border-b border-slate-200 pb-1 text-center">
                        TESLİM EDEN
                      </div>
                      <div className="text-[11px] text-slate-600 text-center mt-0.5">
                        (Bilgi Teknolojileri / Sistem Yetkilisi)
                      </div>
                      <div className="mt-3 space-y-1 text-[11px]">
                        <div>Adı Soyadı: <strong className="text-slate-900">{officerName || 'BT Yetkilisi'}</strong></div>
                        <div>Ünvanı: <strong className="text-slate-900">{officerTitle}</strong></div>
                        <div>Tarih: <strong className="text-slate-900 font-mono">{formattedDate}</strong></div>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-slate-400 pt-1 text-center text-[10px] text-slate-500">
                      Islak İmza / Kaşe
                    </div>
                  </div>

                  {/* Teslim Alan */}
                  <div className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between h-44">
                    <div>
                      <div className="font-black text-slate-900 uppercase tracking-wide text-xs border-b border-slate-200 pb-1 text-center">
                        TESLİM ALAN
                      </div>
                      <div className="text-[11px] text-slate-600 text-center mt-0.5">
                        (Zimmet Edilen Personel)
                      </div>
                      <div className="mt-3 space-y-1 text-[11px]">
                        <div>Adı Soyadı: <strong className="text-slate-900">{employeeName || '...........................................'}</strong></div>
                        <div>T.C. / Sicil: <strong className="text-slate-900 font-mono">{employeeId || '...........................................'}</strong></div>
                        <div>Tarih: <strong className="text-slate-900 font-mono">{formattedDate}</strong></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 italic mb-1 text-center">
                        "Cihazı, aksesuarları ve lisanslı hesapları çalışır vaziyette teslim aldım."
                      </p>
                      <div className="border-t border-dashed border-slate-400 pt-1 text-center text-[10px] text-slate-500">
                        Personel Islak İmzası
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* DOCUMENT FOOTER (RULE 1 INVARIANT) */}
              <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-1">
                <div>
                  OMNIFlow IT &amp; Varlık Yönetim Sistemi • Resmi Zimmet Kaydı
                </div>
                <div>
                  Designed &amp; Developed by Önder Cihan ACAR © 2026. All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
