import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Printer, FileSpreadsheet, Building2, Globe, Server, Cloud,
  Laptop, Shield, ShieldCheck, Database, Key, Check, Wifi, Radio, Router,
  MapPin, UserCheck, Users, Monitor, FileText, ExternalLink, HelpCircle, Mail,
  Download, Loader2
} from 'lucide-react';
import { exportCustomerToExcel } from '../utils/exporter';
import { api } from '../api';
import html2pdf from 'html2pdf.js';

export default function ReportModal({ isOpen, onClose, customer }) {
  const [reportMode, setReportMode] = useState('users'); // 'users' (Kullanıcı & Zimmet Dökümü) | 'full' (Tüm IT Envanteri)
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [includeServers, setIncludeServers] = useState(true);
  const [includePCs, setIncludePCs] = useState(true);
  const [includeNetwork, setIncludeNetwork] = useState(true);
  const [includeAntivirus, setIncludeAntivirus] = useState(true);
  const [includeWifi, setIncludeWifi] = useState(true);
  const [includeMail, setIncludeMail] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen || !customer) return null;

  // Extract distinct branches safely
  const branchSet = new Set(['Merkez Ofis']);
  (customer.internet_lines || []).forEach(l => { if (l && l.branch_name) branchSet.add(l.branch_name); });
  (customer.physical_servers || []).forEach(s => { if (s && s.branch_name) branchSet.add(s.branch_name); });
  (customer.user_computers || []).forEach(c => { if (c && c.branch_name) branchSet.add(c.branch_name); });
  (customer.firewalls || []).forEach(f => { if (f && f.branch_name) branchSet.add(f.branch_name); });
  (customer.antivirus_licenses || []).forEach(a => { if (a && a.branch_name) branchSet.add(a.branch_name); });
  (customer.backup_units || []).forEach(b => { if (b && b.branch_name) branchSet.add(b.branch_name); });
  (customer.wifi_controllers || []).forEach(w => { if (w && w.branch_name) branchSet.add(w.branch_name); });
  (customer.wifi_access_points || []).forEach(a => { if (a && a.branch_name) branchSet.add(a.branch_name); });
  (customer.wifi_networks || []).forEach(n => { if (n && n.branch_name && n.branch_name !== 'Tüm Şubeler') branchSet.add(n.branch_name); });
  (customer.mail_services || []).forEach(m => { if (m && m.branch_name && m.branch_name !== 'Tüm Şubeler') branchSet.add(m.branch_name); });
  (customer.mail_accounts || []).forEach(a => { if (a && a.branch_name) branchSet.add(a.branch_name); });
  const allBranches = Array.from(branchSet).filter(Boolean);

  const isAll = selectedBranch === 'ALL';

  // Filter datasets by selected branch
  const lines = isAll
    ? (customer.internet_lines || [])
    : (customer.internet_lines || []).filter(l => l && (l.branch_name || 'Merkez Ofis') === selectedBranch);

  const servers = isAll
    ? (customer.physical_servers || [])
    : (customer.physical_servers || []).filter(s => s && (s.branch_name || 'Merkez Ofis') === selectedBranch);

  const serverIds = new Set(servers.map(s => s.id));

  const vms = isAll
    ? (customer.virtual_machines || [])
    : (customer.virtual_machines || []).filter(v => v && ((v.branch_name || 'Merkez Ofis') === selectedBranch || (v.physical_server_id && serverIds.has(v.physical_server_id))));

  const branchPCs = isAll
    ? (customer.user_computers || [])
    : (customer.user_computers || []).filter(p => p && (p.branch_name || 'Merkez Ofis') === selectedBranch);

  // Extract distinct departments within this branch scope
  const allDepartments = Array.from(
    new Set(branchPCs.map(p => (p && p.department) || 'Genel'))
  ).filter(Boolean);

  // Filter computers by selected department
  const filteredPCs = branchPCs.filter(p => {
    if (!p) return false;
    if (selectedDept === 'ALL') return true;
    return (p.department || 'Genel') === selectedDept;
  });

  // Group filtered PCs by department
  const pcsByDept = filteredPCs.reduce((acc, pc) => {
    if (!pc) return acc;
    const dept = pc.department || 'Genel / Belirtilmemiş';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(pc);
    return acc;
  }, {});

  // Metrics for user workstation summary
  const totalPCs = filteredPCs.length;
  const laptopCount = filteredPCs.filter(p => {
    const t = (p.device_type || '').toLowerCase();
    return t.includes('laptop') || t.includes('dizüstü');
  }).length;
  const desktopCount = filteredPCs.filter(p => {
    const t = (p.device_type || '').toLowerCase();
    return t.includes('masaüstü') || t.includes('desktop');
  }).length;
  const winLicenseCount = filteredPCs.filter(p => p.os_license_key && p.os_license_key.trim().length > 0).length;
  const officeLicenseCount = filteredPCs.filter(p => p.office_license_key && p.office_license_key.trim().length > 0).length;

  const firewalls = isAll
    ? (customer.firewalls || [])
    : (customer.firewalls || []).filter(f => f && (f.branch_name || 'Merkez Ofis') === selectedBranch);

  const antiviruses = isAll
    ? (customer.antivirus_licenses || [])
    : (customer.antivirus_licenses || []).filter(a => a && (a.branch_name || 'Merkez Ofis') === selectedBranch);

  const backups = isAll
    ? (customer.backup_units || [])
    : (customer.backup_units || []).filter(b => b && (b.branch_name || 'Merkez Ofis') === selectedBranch);

  const wifiControllers = isAll
    ? (customer.wifi_controllers || [])
    : (customer.wifi_controllers || []).filter(c => c && (c.branch_name || 'Merkez Ofis') === selectedBranch);

  const wifiAPs = isAll
    ? (customer.wifi_access_points || [])
    : (customer.wifi_access_points || []).filter(a => a && (a.branch_name || 'Merkez Ofis') === selectedBranch);

  const wifiNetworks = isAll
    ? (customer.wifi_networks || [])
    : (customer.wifi_networks || []).filter(n => n && (n.branch_name === 'Tüm Şubeler' || (n.branch_name || 'Merkez Ofis') === selectedBranch));

  const mailServices = isAll
    ? (customer.mail_services || [])
    : (customer.mail_services || []).filter(m => m && (m.branch_name === 'Tüm Şubeler' || (m.branch_name || 'Merkez Ofis') === selectedBranch));

  const mailAccounts = isAll
    ? (customer.mail_accounts || [])
    : (customer.mail_accounts || []).filter(a => a && (a.branch_name || 'Merkez Ofis') === selectedBranch);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
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

    const reportTitle = reportMode === 'users' ? 'Personel_Zimmet_Dokumu' : 'Genel_IT_Envanter_Raporu';
    const customerCode = (customer.code || customer.name || 'OMNIFlow').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `OMNIFlow_Rapor_${customerCode}_${reportTitle}.pdf`;

    try {
      // 1. Try Backend Chromium Vector PDF generation first (Instant, High Quality, Clean A4)
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

  // Secondary Action: Native Print / Physical Printer
  const handlePrint = () => {
    window.print();
  };

  // Secondary Action: Open Clean A4 Page in New Browser Tab
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
        <title>${customer.name || 'Müşteri'} - ${reportMode === 'users' ? 'Personel & Kullanıcı Dökümü' : 'IT Envanter Raporu'}</title>
        <style>
          * { box-sizing: border-box; }
          @page { size: A4 portrait; margin: 8mm; }
          html, body {
            margin: 0; padding: 20px;
            background: #ffffff !important; color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .toolbar {
            position: sticky; top: 0; z-index: 50;
            background: #0f172a; color: #ffffff;
            padding: 12px 18px; border-radius: 8px; margin-bottom: 24px;
            display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .btn-print {
            background: #2563eb; color: #fff; border: none; padding: 8px 18px;
            border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px;
          }
          .btn-print:hover { background: #1d4ed8; }
          .btn-close {
            background: #475569; color: #fff; border: none; padding: 8px 14px;
            border-radius: 6px; font-size: 13px; cursor: pointer; margin-left: 8px;
          }
          @media print {
            .toolbar { display: none !important; }
            body { padding: 0 !important; }
          }
          .report-sheet {
            width: 100%; max-width: 980px; margin: 0 auto;
            background: #ffffff;
          }
          table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 14px !important; font-size: 10.5px !important; }
          th, td { border: 1px solid #cbd5e1 !important; padding: 5px 7px !important; text-align: left; }
          th { background: #f8fafc !important; font-weight: bold; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
          .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <span style="font-size: 14px; font-weight: bold;">
            📄 ${customer.name || ''} — ${reportMode === 'users' ? 'Personel & Kullanıcı Dökümü' : 'Genel IT Envanter Raporu'}
          </span>
          <div>
            <button class="btn-print" onclick="window.print()">🖨️ Yazdır / PDF Olarak Kaydet</button>
            <button class="btn-close" onclick="window.close()">✕ Kapat</button>
          </div>
        </div>
        <div class="report-sheet">
          ${reportElement.innerHTML}
        </div>
      </body>
      </html>
    `);
    newTab.document.close();
  };

  const handleExcel = () => {
    exportCustomerToExcel(customer, selectedBranch);
  };

  // Render the core report document (used for both in-modal preview and #print-mount)
  const renderReportContent = () => {
    if (reportMode === 'users') {
      return (
        <div className="space-y-6">
          {/* Formal Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-700 text-white print:bg-black print:text-white">
                  {customer.code || 'IT-ZMM'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {customer.name}
                </h1>
              </div>
              <div className="text-sm font-bold text-blue-900 uppercase tracking-wide mt-1">
                BİLGİ İŞLEM — PERSONEL BİLGİSAYAR &amp; ZİMMET ENVANTER DÖKÜMÜ
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Departman bazında zimmetli kullanıcı bilgisayarları, donanım, lisans, ağ ve Local Admin kimlik dökümü
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  DÖKÜM KAPSAMI: {selectedBranch === 'ALL' ? 'Tüm Şubeler & Merkez Ofis' : selectedBranch}
                  {selectedDept !== 'ALL' && ` • Departman: ${selectedDept}`}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-600 font-mono shrink-0">
              <div>Rapor No: <strong className="text-slate-900">IT-ZMM-{customer.code || 'DOC'}-{new Date().getFullYear()}</strong></div>
              <div>Tarih: <strong className="text-slate-900">{new Date().toLocaleDateString('tr-TR')}</strong></div>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ✓ ONAYLI ZİMMET KAYDI
                </span>
              </div>
            </div>
          </div>

          {/* Company Meta Contact Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Dış Statik IP (WAN)</span>
              <span className="font-mono font-bold text-blue-700">
                {customer.external_ip || 'Belirtilmedi'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Yetkili / IT Sorumlusu</span>
              <span className="font-semibold text-slate-900 truncate block" title={customer.contact_person}>
                {customer.contact_person || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">İletişim Telefon</span>
              <span className="font-mono text-slate-800">
                {customer.phone || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">E-posta</span>
              <span className="text-slate-800 truncate block" title={customer.email}>
                {customer.email || '-'}
              </span>
            </div>
          </div>

          {/* KPI Metrics Dashboard (Executive Summary) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Toplam PC</span>
              <span className="text-lg font-black text-blue-900 font-mono">{totalPCs}</span>
              <span className="text-[9px] text-blue-600 block">Kayıtlı Cihaz</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">Dizüstü (Laptop)</span>
              <span className="text-lg font-black text-slate-900 font-mono">{laptopCount}</span>
              <span className="text-[9px] text-slate-500 block">Taşınabilir</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">Masaüstü</span>
              <span className="text-lg font-black text-slate-900 font-mono">{desktopCount}</span>
              <span className="text-[9px] text-slate-500 block">Sabit Kasa</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block">Windows Lisans</span>
              <span className="text-lg font-black text-emerald-900 font-mono">{winLicenseCount} / {totalPCs}</span>
              <span className="text-[9px] text-emerald-600 block">Kayıtlı Lisans</span>
            </div>
            <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] font-bold text-purple-700 uppercase block">Office Lisans</span>
              <span className="text-lg font-black text-purple-900 font-mono">{officeLicenseCount} / {totalPCs}</span>
              <span className="text-[9px] text-purple-600 block">Kayıtlı Lisans</span>
            </div>
          </div>

          {/* Grouped by Department */}
          {Object.keys(pcsByDept).length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic border border-slate-200 rounded-lg bg-slate-50">
              Seçilen kriterlerde kayıtlı kullanıcı bilgisayarı bulunamadı.
            </div>
          ) : (
            Object.entries(pcsByDept).map(([dept, pcs]) => (
              <div key={dept} className="break-inside-avoid mb-6">
                {/* Department Heading Bar */}
                <div className="bg-slate-800 text-white px-3 py-1.5 rounded-t-lg flex items-center justify-between font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-300" />
                    <span>DEPARTMAN: {dept.toUpperCase()}</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-200 font-normal">
                    {pcs.length} Adet Cihaz
                  </span>
                </div>

                {/* Workstations Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 text-slate-800 font-bold text-[10px] uppercase border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300 min-w-[130px]">Zimmetli Personel &amp; Hostname</th>
                        <th className="p-2 border-r border-slate-300 min-w-[130px]">Donanım &amp; Seri No</th>
                        <th className="p-2 border-r border-slate-300 min-w-[120px]">Ağ (IP &amp; MAC)</th>
                        <th className="p-2 border-r border-slate-300 min-w-[110px]">Local Admin (OS)</th>
                        <th className="p-2 border-r border-slate-300 min-w-[130px]">Windows Lisans</th>
                        <th className="p-2 border-r border-slate-300 min-w-[120px]">Office Lisans</th>
                        <th className="p-2 min-w-[100px]">Uzak Destek / EDR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
                      {pcs.map((p) => {
                        const matchedMail = mailAccounts.find(m => 
                          m.full_name && p.assigned_user && (
                            m.full_name.trim().toLowerCase() === p.assigned_user.trim().toLowerCase() ||
                            m.full_name.toLowerCase().includes(p.assigned_user.toLowerCase()) ||
                            p.assigned_user.toLowerCase().includes(m.full_name.toLowerCase())
                          )
                        );
                        return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          {/* Personnel & PC Hostname */}
                          <td className="p-2 border-r border-slate-200 align-top">
                            <div className="font-bold text-slate-950 text-xs">
                              {p.assigned_user || 'Atanmadı / Zimmetsiz'}
                            </div>
                            {matchedMail && (
                              <div className="text-[10px] text-cyan-800 font-mono font-medium mt-0.5 flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
                                <span className="truncate">{matchedMail.email_address}</span>
                              </div>
                            )}
                            <div className="font-mono text-blue-700 font-semibold mt-0.5">
                              {p.computer_name}
                            </div>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-slate-100 border border-slate-300 text-slate-700 font-medium mt-1">
                              {p.device_type || 'PC'}
                            </span>
                            {p.branch_name && p.branch_name !== 'Merkez Ofis' && (
                              <div className="text-[10px] text-cyan-800 font-semibold mt-0.5">
                                🏢 {p.branch_name}
                              </div>
                            )}
                          </td>

                          {/* Hardware & Serial */}
                          <td className="p-2 border-r border-slate-200 align-top">
                            <div className="font-semibold text-slate-900">
                              {p.brand} {p.model}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">
                              {p.hardware_specs || '-'}
                            </div>
                            {p.serial_number && (
                              <div className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">
                                SN: {p.serial_number}
                              </div>
                            )}
                          </td>

                          {/* Network (Ethernet & Wi-Fi) */}
                          <td className="p-2 border-r border-slate-200 font-mono text-[10px] align-top space-y-1">
                            {p.ethernet_ip ? (
                              <div>
                                <span className="text-slate-500 font-bold">Eth: </span>
                                <span className="font-semibold text-slate-900">{p.ethernet_ip}</span>
                                {p.ethernet_mac && <div className="text-slate-400 text-[9px]">{p.ethernet_mac}</div>}
                              </div>
                            ) : null}
                            {p.wifi_ip ? (
                              <div>
                                <span className="text-blue-600 font-bold">Wi-Fi: </span>
                                <span className="font-semibold text-blue-900">{p.wifi_ip}</span>
                                {p.wifi_mac && <div className="text-slate-400 text-[9px]">{p.wifi_mac}</div>}
                              </div>
                            ) : null}
                            {!p.ethernet_ip && !p.wifi_ip && (
                              <span className="text-slate-400 italic">Ağ bilgisi yok</span>
                            )}
                          </td>

                          {/* Local Admin (OS) */}
                          <td className="p-2 border-r border-slate-200 font-mono text-[10px] align-top">
                            {p.local_admin_user || p.local_admin_password ? (
                              <div className="space-y-1">
                                {p.local_admin_user && (
                                  <div>
                                    <span className="text-slate-500">u: </span>
                                    <strong className="text-slate-900">{p.local_admin_user}</strong>
                                  </div>
                                )}
                                {p.local_admin_password && (
                                  <div className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 font-bold max-w-fit">
                                    p: {p.local_admin_password}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>

                          {/* Windows & License */}
                          <td className="p-2 border-r border-slate-200 align-top">
                            <div className="font-semibold text-slate-900 text-[10px]">
                              {p.os_version || 'Windows'}
                            </div>
                            {p.os_license_key ? (
                              <div className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-0.5">
                                {p.os_license_key}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Lisans key yok</span>
                            )}
                          </td>

                          {/* Office & License */}
                          <td className="p-2 border-r border-slate-200 align-top">
                            <div className="text-slate-900 text-[10px]">
                              {p.office_version && p.office_version !== 'N/A' ? p.office_version : '-'}
                            </div>
                            {p.office_license_key && (
                              <div className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                                {p.office_license_key}
                              </div>
                            )}
                          </td>

                          {/* Remote Access & Security */}
                          <td className="p-2 align-top text-[10px]">
                            {p.remote_access_id ? (
                              <div className="font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 max-w-fit">
                                AnyDesk: {p.remote_access_id}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                            {p.antivirus && (
                              <div className="text-[9px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>{p.antivirus}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}

          {/* Formal IT Handover & Zimmet Tutanağı Signatures */}
          <div className="break-inside-avoid mt-8 pt-4 border-t-2 border-slate-300">
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-[10px] text-slate-700 mb-4 leading-relaxed">
              <strong>RESMİ ZİMMET &amp; TESLİM BEYANI:</strong> Yukarıda marka, model, seri numarası, ağ adresleri ve lisans anahtarları kayıt altına alınan bilişim donanımları ve yazılımları, şirketin bilgi güvenliği ve cihaz kullanım politikalarına uygun olarak eksiksiz, sağlam ve çalışır vaziyette ilgili personele zimmetlenmiş/teslim edilmiştir.
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs text-slate-800">
              <div className="border border-slate-300 rounded-lg p-4 bg-white text-center">
                <div className="font-bold text-slate-900 uppercase">TESLİM EDEN</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Bilgi İşlem / IT Departmanı Yetkilisi</div>
                <div className="mt-8 border-b border-dashed border-slate-400 w-3/4 mx-auto"></div>
                <div className="mt-2 text-[10px] text-slate-500">İsim / İmza / Tarih</div>
              </div>

              <div className="border border-slate-300 rounded-lg p-4 bg-white text-center">
                <div className="font-bold text-slate-900 uppercase">TESLİM ALAN</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Zimmet Sahibi / Departman Amiri</div>
                <div className="mt-8 border-b border-dashed border-slate-400 w-3/4 mx-auto"></div>
                <div className="mt-2 text-[10px] text-slate-500">İsim / İmza / Tarih</div>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-6 pt-3 border-t border-slate-300 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1">
            <div>
              <span className="font-bold text-slate-800">OMNIFlow</span>
              <span className="mx-2">•</span>
              <span>Designed &amp; Developed by <strong>Önder Cihan ACAR</strong> &copy; 2026. All Rights Reserved.</span>
            </div>
            <span className="italic font-semibold text-slate-600">Gizli &amp; Şirkete Özeldir (Confidential Document)</span>
          </div>
        </div>
      );
    }

    // CASE 2: FULL IT INFRASTRUCTURE REPORT
    return (
      <div className="space-y-8">
        {/* Full Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-700 text-white print:bg-black print:text-white">
                {customer.code || 'IT-ENV'}
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {customer.name}
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Bilişim Altyapısı, Sunucu, Kullanıcı Bilgisayarları, Wi-Fi &amp; Lisans Envanter Raporu
            </p>

            {selectedBranch !== 'ALL' ? (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                <Building2 className="w-3.5 h-3.5" />
                <span>DÖKÜM KAPSAMI: {selectedBranch}</span>
              </div>
            ) : (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Döküm Kapsamı: Tüm Firma (Merkez Ofis ve Tüm Şubeler Dahil)</span>
              </div>
            )}
          </div>

          <div className="text-right text-xs text-slate-600 font-mono">
            <div>Rapor Tarihi: <strong className="text-slate-900">{new Date().toLocaleDateString('tr-TR')}</strong></div>
            <div>Durum: <strong className="text-emerald-700">Onaylı Envanter</strong></div>
          </div>
        </div>

        {/* Customer Meta Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Dış Statik IP (WAN)</span>
            <span className="font-mono font-bold text-blue-700 text-sm">
              {customer.external_ip || 'Belirtilmedi'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">İlgili Kişi / Yetkili</span>
            <span className="font-semibold text-slate-900">
              {customer.contact_person || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">İletişim Telefon</span>
            <span className="font-mono text-slate-800">
              {customer.phone || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">E-posta Adresi</span>
            <span className="text-slate-800">
              {customer.email || '-'}
            </span>
          </div>
        </div>

        {/* Section: Şubeler & İnternet Hatları */}
        {lines.length > 0 && (
          <div className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Şubeler &amp; İnternet Hatları (Fiber, VDSL, Subnet Mask &amp; Gateway)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Şube / Lokasyon</th>
                    <th className="p-2 border-r border-slate-200">Hat Türü &amp; İSS</th>
                    <th className="p-2 border-r border-slate-200">Dış Statik IP (WAN)</th>
                    <th className="p-2 border-r border-slate-200">Subnet Mask &amp; Gateway</th>
                    <th className="p-2 border-r border-slate-200">PPPoE &amp; Modem Arayüzü</th>
                    <th className="p-2">Hız &amp; Devre No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {lines.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                        <div>{l.branch_name}</div>
                        <span className="text-[10px] font-normal text-slate-500">
                          {l.is_primary ? 'Ana Hat' : 'Yedek Hat'}
                        </span>
                      </td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="font-semibold">{l.line_type}</div>
                        <div className="text-[11px] text-slate-500">{l.isp}</div>
                      </td>
                      <td className="p-2 font-mono text-[11px] font-bold text-blue-700 border-r border-slate-200">
                        {l.static_ip || '-'}
                      </td>
                      <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                        <div>Mask: {l.subnet_mask || '-'}</div>
                        <div className="text-amber-700 font-bold">GW: {l.gateway || '-'}</div>
                      </td>
                      <td className="p-2 text-[11px] font-mono border-r border-slate-200">
                        {l.pppoe_user && <div>PPPoE: <strong>{l.pppoe_user}</strong> {l.pppoe_password && `(${l.pppoe_password})`}</div>}
                        {l.modem_ip && <div>Modem: {l.modem_ip} {l.modem_user && `[${l.modem_user}]`}</div>}
                        {!l.pppoe_user && !l.modem_ip && <span className="text-slate-400">-</span>}
                      </td>
                      <td className="p-2 text-[11px]">
                        <div>{l.speed_info || '-'}</div>
                        {l.circuit_number && <div className="text-slate-500 font-mono">No: {l.circuit_number}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 1: Physical Servers & VMs */}
        {includeServers && (
          <div className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <Server className="w-4 h-4 text-indigo-700" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Fiziki Sunucular &amp; Sanal Makineler (VM)
              </h2>
            </div>

            {/* Physical Servers Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Sunucu Adı</th>
                    <th className="p-2 border-r border-slate-200">Marka &amp; Model</th>
                    <th className="p-2 border-r border-slate-200">Donanım (CPU / RAM / RAID)</th>
                    <th className="p-2 border-r border-slate-200">Sunucu IP &amp; MAC</th>
                    <th className="p-2 border-r border-slate-200">Local Admin (OS)</th>
                    <th className="p-2 border-r border-slate-200">Yönetim (iDRAC/iLO)</th>
                    <th className="p-2">Konum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {servers.length === 0 ? (
                    <tr><td colSpan="7" className="p-3 text-center text-slate-500 italic">Kayıtlı fiziki sunucu yok.</td></tr>
                  ) : (
                    servers.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">
                          {s.server_name}
                          {s.branch_name && <div className="text-[10px] text-blue-700 font-sans font-normal">🏢 {s.branch_name}</div>}
                        </td>
                        <td className="p-2 border-r border-slate-200">{s.brand} {s.model} {s.serial_number && `(SN: ${s.serial_number})`}</td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">{s.cpu_info} | {s.ram_info} | {s.disk_info}</td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                          <div><span className="font-bold text-slate-700">ETH1:</span> {s.ip_address || '-'} {s.mac_address && `(${s.mac_address})`}</div>
                          {s.ip_address_2 && <div><span className="font-bold text-slate-700">ETH2:</span> {s.ip_address_2} {s.mac_address_2 && `(${s.mac_address_2})`}</div>}
                          {s.ip_address_3 && <div><span className="font-bold text-slate-700">ETH3:</span> {s.ip_address_3} {s.mac_address_3 && `(${s.mac_address_3})`}</div>}
                          {s.ip_address_4 && <div><span className="font-bold text-slate-700">ETH4:</span> {s.ip_address_4} {s.mac_address_4 && `(${s.mac_address_4})`}</div>}
                        </td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                          {s.local_admin_user || s.local_admin_password ? (
                            <div>
                              <div>{s.local_admin_user || '-'}</div>
                              {s.local_admin_password && <div className="text-amber-800 font-bold">{s.local_admin_password}</div>}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">{s.management_ip} {s.management_user && `[${s.management_user}]`}</td>
                        <td className="p-2">{s.location || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Virtual Machines Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Sanal Makine (VM)</th>
                    <th className="p-2 border-r border-slate-200">Rol / Görev</th>
                    <th className="p-2 border-r border-slate-200">Kaynak (vCPU/RAM/Disk)</th>
                    <th className="p-2 border-r border-slate-200">Ağ (IP &amp; MAC)</th>
                    <th className="p-2 border-r border-slate-200">Local Admin (OS)</th>
                    <th className="p-2 border-r border-slate-200">Windows Lisans Key</th>
                    <th className="p-2">Office Lisans Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {vms.length === 0 ? (
                    <tr><td colSpan="7" className="p-3 text-center text-slate-500 italic">Kayıtlı sanal makine yok.</td></tr>
                  ) : (
                    vms.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold text-slate-900 border-r border-slate-200">
                          <div>{v.vm_name}</div>
                          <div className="text-[10px] text-slate-500 font-sans font-normal">🏢 {v.branch_name || 'Merkez Ofis'}</div>
                        </td>
                        <td className="p-2 border-r border-slate-200">{v.role_description}</td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">{v.vcpu} / {v.ram} / {v.disk}</td>
                        <td className="p-2 font-mono border-r border-slate-200">{v.ip_address} {v.mac_address && `(${v.mac_address})`}</td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                          {v.local_admin_user || v.local_admin_password ? (
                            <div>
                              <div>{v.local_admin_user || '-'}</div>
                              {v.local_admin_password && <div className="text-amber-800 font-bold">{v.local_admin_password}</div>}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                          <div>{v.os_version}</div>
                          <div className="text-blue-700 font-bold">{v.os_license_key || '-'}</div>
                        </td>
                        <td className="p-2 font-mono text-[11px]">
                          <div>{v.office_version && v.office_version !== 'N/A' ? v.office_version : '-'}</div>
                          <div className="text-emerald-700 font-bold">{v.office_license_key || '-'}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Departman Bazında Kullanıcı Bilgisayarları */}
        {includePCs && (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-300 pb-2">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Departman Bazında Kullanıcı Bilgisayarları &amp; Lisanslar
                </h2>
              </div>
              <span className="text-xs text-slate-600 font-mono font-bold">
                Toplam: {filteredPCs.length} Bilgisayar
              </span>
            </div>

            {Object.keys(pcsByDept).length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic border border-slate-200 rounded-lg">
                Kayıtlı bilgisayar bulunamadı.
              </div>
            ) : (
              Object.entries(pcsByDept).map(([dept, pcs]) => (
                <div key={dept} className="mb-5 break-inside-avoid">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-300 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      📂 Departman: {dept}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-600">
                      {pcs.length} Cihaz
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-300">
                        <tr>
                          <th className="p-2 border-r border-slate-200">Kullanıcı &amp; Makina Adı</th>
                          <th className="p-2 border-r border-slate-200">Cihaz &amp; Donanım</th>
                          <th className="p-2 border-r border-slate-200">Ethernet (IP / MAC)</th>
                          <th className="p-2 border-r border-slate-200">Wi-Fi (IP / MAC)</th>
                          <th className="p-2 border-r border-slate-200">Local Admin (OS)</th>
                          <th className="p-2 border-r border-slate-200">Windows Sürümü &amp; Key</th>
                          <th className="p-2 border-r border-slate-200">Office Sürümü &amp; Key</th>
                          <th className="p-2">Uzak Destek</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {pcs.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200">
                              <div className="font-bold text-slate-900">{p.assigned_user || 'Atanmadı'}</div>
                              <div className="font-mono text-emerald-700 font-semibold text-[11px]">{p.computer_name} ({p.device_type})</div>
                            </td>
                            <td className="p-2 border-r border-slate-200">
                              <div className="font-semibold">{p.brand} {p.model}</div>
                              <div className="text-[10px] text-slate-500">{p.hardware_specs || '-'}</div>
                            </td>
                            <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                              <div className="font-semibold">{p.ethernet_ip || '-'}</div>
                              <div className="text-[10px] text-slate-500">{p.ethernet_mac}</div>
                            </td>
                            <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                              <div className="font-semibold">{p.wifi_ip || '-'}</div>
                              <div className="text-[10px] text-slate-500">{p.wifi_mac}</div>
                            </td>
                            <td className="p-2 font-mono text-[10px] border-r border-slate-200">
                              {p.local_admin_user || p.local_admin_password ? (
                                <div>
                                  <div>{p.local_admin_user || '-'}</div>
                                  {p.local_admin_password && <div className="text-amber-800 font-bold">{p.local_admin_password}</div>}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="p-2 font-mono text-[10px] border-r border-slate-200">
                              <div>{p.os_version}</div>
                              <div className="text-blue-700 font-bold">{p.os_license_key || '-'}</div>
                            </td>
                            <td className="p-2 font-mono text-[10px] border-r border-slate-200">
                              <div>{p.office_version || '-'}</div>
                              <div className="text-emerald-700 font-bold">{p.office_license_key || '-'}</div>
                            </td>
                            <td className="p-2 font-mono text-[11px]">
                              {p.remote_access_id || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Section 3: Firewall & Backup */}
        {includeNetwork && (
          <div className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <Shield className="w-4 h-4 text-rose-700" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Ağ Güvenlik Duvarı (Firewall) &amp; Yedekleme Üniteleri (NAS)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Firewalls */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-rose-600" /> Güvenlik Duvarları (Firewall)
                </h3>
                {firewalls.length === 0 ? (
                  <p className="text-slate-500 italic">Kayıtlı firewall yok.</p>
                ) : (
                  firewalls.map(f => (
                    <div key={f.id} className="space-y-1 mb-2 pb-2 border-b border-slate-200 last:border-none">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{f.device_name} ({f.brand} {f.model})</span>
                        <span className="text-[10px] text-blue-700 font-normal">🏢 {f.branch_name}</span>
                      </div>
                      <div className="font-mono text-slate-700">Arayüz IP: {f.ip_address} {f.port ? `:${f.port}` : ''}</div>
                      <div className="font-mono text-slate-700 text-[11px]">
                        Kullanıcı: <strong>{f.username}</strong> {f.password && `(${f.password})`}
                      </div>
                      {f.license_expiry && (
                        <div className="text-[10px] text-rose-700 font-semibold font-mono">
                          Lisans Bitiş: {f.license_expiry}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Backup Units */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-amber-600" /> Yedekleme Üniteleri (NAS / Storage)
                </h3>
                {backups.length === 0 ? (
                  <p className="text-slate-500 italic">Kayıtlı yedekleme ünitesi yok.</p>
                ) : (
                  backups.map(b => (
                    <div key={b.id} className="space-y-1 mb-2 pb-2 border-b border-slate-200 last:border-none">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{b.device_name} ({b.brand} {b.model})</span>
                        <span className="text-[10px] text-blue-700 font-normal">🏢 {b.branch_name}</span>
                      </div>
                      <div className="font-mono text-slate-700">Arayüz IP: {b.ip_address}</div>
                      <div className="font-mono text-slate-700 text-[11px]">
                        Giriş: <strong>{b.username}</strong> {b.password && `(${b.password})`}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Kapasite: {b.capacity_tb ? `${b.capacity_tb} TB` : '-'} | RAID: {b.raid_type || '-'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Antivirüs Lisansları */}
        {includeAntivirus && (
          <div className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Antivirüs &amp; Endpoint Güvenlik Lisansları ({antiviruses.length} Paket)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Şube / Lokasyon</th>
                    <th className="p-2 border-r border-slate-200">Ürün Adı &amp; Marka</th>
                    <th className="p-2 border-r border-slate-200">Web Yönetim Paneli</th>
                    <th className="p-2 border-r border-slate-200">Giriş Bilgileri</th>
                    <th className="p-2 border-r border-slate-200">Kullanıcı Sayısı</th>
                    <th className="p-2 border-r border-slate-200">Lisans Bitişi</th>
                    <th className="p-2">Lisans Anahtarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {antiviruses.length === 0 ? (
                    <tr><td colSpan="7" className="p-3 text-center text-slate-500 italic">Kayıtlı antivirüs lisansı yok.</td></tr>
                  ) : (
                    antiviruses.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                          🏢 {a.branch_name || 'Merkez Ofis'}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-semibold">
                          <div>{a.product_name}</div>
                          <span className="text-[10px] text-emerald-700 font-normal">{a.brand} ({a.license_term || 'Yıllık'})</span>
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-blue-700">
                          {a.portal_url || '-'}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px]">
                          <div>{a.username || '-'}</div>
                          {a.password && <div className="text-[10px] text-slate-500">Parola: {a.password}</div>}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-bold text-slate-900">
                          {a.user_count ? `${a.user_count} Kullanıcı` : '-'}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-rose-700 font-semibold">
                          {a.license_expiry || '-'}
                        </td>
                        <td className="p-2 font-mono text-[11px]">
                          {a.license_key || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 5: Wi-Fi Kontrol Panelleri, Ağları & AP Cihazları */}
        {includeWifi && (
          <div className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <Wifi className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                5. Kablosuz Ağ (Wi-Fi), Kontrol Panelleri &amp; Erişim Noktaları (AP)
              </h2>
            </div>

            {/* Controllers & SSIDs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs">
                <h3 className="font-bold text-sky-800 mb-2 flex items-center gap-1.5">
                  <Router className="w-3.5 h-3.5" /> Wi-Fi Kontrol Panelleri (UniFi / Omada)
                </h3>
                {wifiControllers.length === 0 ? (
                  <p className="text-slate-500 italic">Kayıtlı kontrol paneli yok.</p>
                ) : (
                  wifiControllers.map(c => (
                    <div key={c.id} className="space-y-1 mb-2 pb-2 border-b border-slate-200 last:border-none">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{c.controller_name}</span>
                        <span className="text-[10px] text-blue-700 font-normal">🏢 {c.branch_name}</span>
                      </div>
                      <div className="font-mono text-slate-700">Arayüz: {c.management_ip || '-'}</div>
                      <div className="font-mono text-slate-700 text-[11px]">
                        Giriş: <strong>{c.username}</strong> {c.password && `(${c.password})`} {c.email && `| Mail: ${c.email}`}
                      </div>
                      {c.version && <div className="text-[10px] text-slate-500">Sürüm: {c.version}</div>}
                    </div>
                  ))
                )}
              </div>

              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" /> Yayınlanan Wi-Fi Ağları (SSID &amp; Şifreler)
                </h3>
                {wifiNetworks.length === 0 ? (
                  <p className="text-slate-500 italic">Kayıtlı Wi-Fi ağı yok.</p>
                ) : (
                  wifiNetworks.map(n => (
                    <div key={n.id} className="space-y-1 mb-2 pb-2 border-b border-slate-200 last:border-none">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-blue-700">📶 {n.ssid}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{n.branch_name}</span>
                      </div>
                      <div className="font-mono text-amber-800 font-bold">
                        Şifre: {n.password || 'Açık / Şifresiz'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex flex-wrap gap-2">
                        <span>Güvenlik: {n.security_type}</span>
                        {n.vlan_id && <span>| {n.vlan_id}</span>}
                        {n.is_guest ? <span className="text-rose-600 font-semibold">| Misafir İzolasyonu</span> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Access Points Table */}
            <div className="overflow-x-auto">
              <div className="text-xs font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> Erişim Noktaları (Access Points / AP Cihazları) ({wifiAPs.length} Adet)
              </div>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Cihaz (AP) Adı &amp; Şube</th>
                    <th className="p-2 border-r border-slate-200">Marka &amp; Model</th>
                    <th className="p-2 border-r border-slate-200">Bulunduğu Konum</th>
                    <th className="p-2 border-r border-slate-200">IP &amp; MAC Adresi</th>
                    <th className="p-2 border-r border-slate-200">Kontrolcü</th>
                    <th className="p-2">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {wifiAPs.length === 0 ? (
                    <tr><td colSpan="6" className="p-3 text-center text-slate-500 italic">Kayıtlı Wi-Fi AP cihazı yok.</td></tr>
                  ) : (
                    wifiAPs.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                          <div>{a.ap_name}</div>
                          <span className="text-[10px] text-blue-700 font-normal">🏢 {a.branch_name}</span>
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <span className="font-semibold">{a.brand}</span> <span className="font-mono text-sky-800 font-bold">({a.model})</span>
                        </td>
                        <td className="p-2 font-medium border-r border-slate-200">{a.location || '-'}</td>
                        <td className="p-2 font-mono text-[11px] border-r border-slate-200">
                          <div>{a.ip_address || '-'}</div>
                          <div className="text-[10px] text-slate-500">{a.mac_address}</div>
                        </td>
                        <td className="p-2 text-[11px] text-slate-700 border-r border-slate-200">{a.controller_name || 'Bağımsız'}</td>
                        <td className="p-2 font-semibold text-emerald-700">{a.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 6: Kurumsal Mail & E-posta Hesapları */}
        {includeMail && (
          <div className="break-inside-avoid">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <Mail className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                6. Kurumsal E-Posta Panelleri &amp; Kullanıcı Hesapları ({mailAccounts.length} Hesap)
              </h2>
            </div>

            {/* Services / Panels */}
            {mailServices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {mailServices.map(s => (
                  <div key={s.id} className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1.5">
                      <span className="flex items-center gap-1.5 text-cyan-800">
                        <Mail className="w-3.5 h-3.5 text-cyan-600" /> {s.service_name} ({s.provider_type})
                      </span>
                      <span className="text-[10px] text-blue-700 font-normal">🏢 {s.branch_name || 'Tüm Şubeler'}</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-700 font-mono">
                      <div>Panel: <span className="text-blue-700">{s.portal_url || '-'}</span></div>
                      <div>Yönetici: <strong>{s.admin_username || '-'}</strong> {s.admin_password && `(${s.admin_password})`}</div>
                      {s.domain_name && <div>Domain: <strong>{s.domain_name}</strong></div>}
                      {s.license_expiry && (
                        <div className="text-rose-700 font-bold">
                          Yıllık Abonelik / Lisans Bitişi: {s.license_expiry}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mail Accounts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Personel / İsim</th>
                    <th className="p-2 border-r border-slate-200">E-Posta Adresi</th>
                    <th className="p-2 border-r border-slate-200">Parola</th>
                    <th className="p-2 border-r border-slate-200">Departman / Şube</th>
                    <th className="p-2 border-r border-slate-200">Kota (GB)</th>
                    <th className="p-2">2FA &amp; Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {mailAccounts.length === 0 ? (
                    <tr><td colSpan="6" className="p-3 text-center text-slate-500 italic">Kayıtlı e-posta hesabı yok.</td></tr>
                  ) : (
                    mailAccounts.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                          {a.full_name || 'İsimsiz'}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-cyan-800 font-semibold">
                          {a.email_address}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-slate-900">
                          {a.password || '-'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-[11px]">
                          <div>{a.department || 'Genel'}</div>
                          <span className="text-[10px] text-slate-500">{a.branch_name || 'Merkez Ofis'}</span>
                        </td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px]">
                          {a.quota_gb ? `${a.quota_gb} GB` : 'Sınırsız'}
                        </td>
                        <td className="p-2 text-[11px]">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            a.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {a.status || 'Aktif'}
                          </span>
                          {a.two_factor_enabled ? (
                            <span className="ml-1 text-[10px] text-indigo-700 font-bold">2FA Aktif</span>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="mt-10 pt-4 border-t border-slate-300 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-900">OMNIFlow</span>
            <span className="mx-2">•</span>
            <span>Designed &amp; Developed by <strong className="text-blue-700 font-semibold">Önder Cihan ACAR</strong> &copy; 2026. All Rights Reserved.</span>
          </div>
          <span>Teknik bilgi işlem altyapı &amp; envanter dökümüdür.</span>
        </div>
      </div>
    );
  };

  const printMountNode = typeof document !== 'undefined' ? document.getElementById('print-mount') : null;

  return (
    <>
      {/* ========================================================= */}
      {/* 1. ON-SCREEN MODAL DIALOG (For interactive viewing)       */}
      {/* ========================================================= */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      >
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-6xl w-full my-4 flex flex-col max-h-[94vh] overflow-hidden text-slate-100">
          
          {/* Top Control Bar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>IT Envanter &amp; Rapor Dökümü</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    {customer.code || 'DOC'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">PDF yazdırma, temiz sekmede önizleme ve Excel aktarımı</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Primary: Direct 1-Click PDF Download */}
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
                title="Renkli A4 PDF belgesini doğrudan bilgisayarınıza indirir."
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>PDF Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>PDF İndir (Doğrudan İndir)</span>
                  </>
                )}
              </button>

              {/* Secondary: Native Print */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Yazıcıya gönder veya tarayıcıdan önizle"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>Yazdır</span>
              </button>

              {/* Clean New Tab */}
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="Raporu bağımsız temiz bir tarayıcı sekmesinde açar"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Yeni Sekmede Aç</span>
              </button>

              {/* Excel Export */}
              <button
                onClick={handleExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 transition-colors cursor-pointer"
                title="Excel formatında (.xlsx) tablo olarak indir"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                title="Pencereyi Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mode Switcher & Filter Toolbar */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setReportMode('users')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportMode === 'users'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>Personel &amp; Kullanıcı Dökümü</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-800/80 text-blue-200">
                  {branchPCs.length} PC
                </span>
              </button>

              <button
                onClick={() => setReportMode('full')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportMode === 'full'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-indigo-300" />
                <span>Genel IT Envanteri (Tüm Sistemler)</span>
              </button>
            </div>

            {/* Scope Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Şube / Kapsam */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400 font-semibold text-[11px] shrink-0">Şube:</span>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSelectedDept('ALL');
                  }}
                  className="bg-transparent text-xs text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">🏢 Tüm Firma (Tüm Şubeler &amp; Merkez)</option>
                  {allBranches.map(b => (
                    <option key={b} value={b} className="bg-slate-900 text-white">📍 {b}</option>
                  ))}
                </select>
              </div>

              {/* Departman Filtresi */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1">
                <span className="text-slate-400 font-semibold text-[11px] shrink-0">Departman:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">Tümü ({branchPCs.length} PC)</option>
                  {allDepartments.map(d => (
                    <option key={d} value={d} className="bg-slate-900 text-white">
                      {d} ({branchPCs.filter(p => (p.department || 'Genel') === d).length} PC)
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Toggles (Only visible in 'full' mode) */}
              {reportMode === 'full' && (
                <div className="hidden xl:flex items-center gap-3 border-l border-slate-800 pl-3 text-[11px]">
                  <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeServers}
                      onChange={(e) => setIncludeServers(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Sunucular</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includePCs}
                      onChange={(e) => setIncludePCs(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Kullanıcı PC</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeNetwork}
                      onChange={(e) => setIncludeNetwork(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Firewall</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeAntivirus}
                      onChange={(e) => setIncludeAntivirus(e.target.checked)}
                      className="rounded text-emerald-500"
                    />
                    <span>Antivirüs</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeWifi}
                      onChange={(e) => setIncludeWifi(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span>Wi-Fi</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeMail}
                      onChange={(e) => setIncludeMail(e.target.checked)}
                      className="rounded text-cyan-500"
                    />
                    <span>Mail</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Quick PDF Tip Banner */}
          <div className="bg-emerald-950/40 border-b border-emerald-900/40 px-4 py-2 flex items-center justify-between text-[11px] text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400">💡 1-Tıkla İndirme:</span>
              <span>
                Yeşil <strong>"PDF İndir (Doğrudan İndir)"</strong> butonuna basarak A4 formatındaki resmi envanter raporunuzu tarayıcı beklemesi olmadan anında <strong>.pdf dosyası</strong> olarak bilgisayarınıza indirebilirsiniz.
              </span>
            </div>
          </div>

          {/* Interactive Screen Preview Container (Aydınlık Beyaz A4) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-300/80 flex justify-center">
            <div
              id="printable-report"
              className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl rounded-xl p-6 sm:p-10 border border-slate-300"
            >
              {renderReportContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
