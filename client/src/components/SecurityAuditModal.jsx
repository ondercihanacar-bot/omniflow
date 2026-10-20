import React, { useState } from 'react';
import {
  X, Printer, Download, ShieldCheck, ShieldAlert, AlertCircle,
  CheckCircle2, Shield, Lock, Laptop, Server, HardDrive, Mail,
  Building2, TrendingUp, Sparkles, Award, FileText
} from 'lucide-react';
import { getDaysRemaining } from '../utils/licenseAlerts';
import { api } from '../api';
import html2pdf from 'html2pdf.js';

export default function SecurityAuditModal({ isOpen, onClose, customer }) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen || !customer) return null;

  // 1. CALCULATE AUDIT METRICS
  const firewalls = customer.firewalls || [];
  const antiviruses = customer.antivirus_licenses || [];
  const backups = customer.backup_units || [];
  const mailAccounts = customer.mail_accounts || [];
  const computers = customer.user_computers || [];

  // Pillar 1: Firewall & Ağ Güvenliği (25 pts)
  let p1Score = 0;
  let p1Status = 'failed';
  let p1Notes = 'Firewall kaydı bulunamadı.';
  if (firewalls.length > 0) {
    p1Score += 15;
    const fw = firewalls[0];
    const days = getDaysRemaining(fw.license_expiry);
    if (days !== null && days > 15) {
      p1Score += 10;
      p1Status = 'passed';
      p1Notes = `Aktif ${fw.brand} firewall mevcut, lisansı güncel (${days} gün kaldı).`;
    } else if (days !== null && days >= 0) {
      p1Score += 5;
      p1Status = 'warning';
      p1Notes = `Firewall mevcut fakat lisans kritik sürede (${days} gün kaldı).`;
    } else if (days !== null && days < 0) {
      p1Status = 'failed';
      p1Notes = `Firewall lisansı ${Math.abs(days)} gün önce sona ermiş!`;
    } else {
      p1Score += 5;
      p1Status = 'warning';
      p1Notes = 'Firewall tanımlı fakat lisans tarihi belirtilmemiş.';
    }
  }

  // Pillar 2: Yedekleme & İş Sürekliliği (25 pts)
  let p2Score = 0;
  let p2Status = 'failed';
  let p2Notes = 'Kayıtlı yedekleme ünitesi (NAS) bulunmuyor.';
  if (backups.length > 0) {
    p2Score += 15;
    const b = backups[0];
    if (b.backup_software && b.capacity) {
      p2Score += 10;
      p2Status = 'passed';
      p2Notes = `${b.brand} NAS devrede, yazılım (${b.backup_software}) ve ${b.capacity} alan aktif.`;
    } else {
      p2Score += 5;
      p2Status = 'warning';
      p2Notes = `${b.brand} NAS tanımlı, yedekleme yazılım detayı girilmemiş.`;
    }
  }

  // Pillar 3: Uç Nokta & Antivirüs Koruması (20 pts)
  let p3Score = 0;
  let p3Status = 'failed';
  let p3Notes = 'Merkezi kurumsal antivirüs kaydı yok.';
  if (antiviruses.length > 0) {
    p3Score += 10;
    const av = antiviruses[0];
    const days = getDaysRemaining(av.license_expiry);
    if (days !== null && days > 15) {
      p3Score += 10;
      p3Status = 'passed';
      p3Notes = `${av.product_name} (${av.user_count || 1} kullanıcı) koruması aktif ve güncel.`;
    } else if (days !== null && days >= 0) {
      p3Score += 5;
      p3Status = 'warning';
      p3Notes = `Antivirüs mevcut ancak lisans bitimine ${days} gün kaldı.`;
    } else if (days !== null && days < 0) {
      p3Status = 'failed';
      p3Notes = `Antivirüs lisansının süresi ${Math.abs(days)} gün önce dolmuş!`;
    } else {
      p3Score += 5;
      p3Status = 'warning';
      p3Notes = `${av.product_name} tanımlı, lisans bitiş tarihi girilmemiş.`;
    }
  }

  // Pillar 4: Kimlik & E-Posta Güvenliği (15 pts)
  let p4Score = 0;
  let p4Status = 'failed';
  let p4Notes = 'Kayıtlı e-posta hesabı yok.';
  if (mailAccounts.length > 0) {
    const mfaCount = mailAccounts.filter(m => m.is_mfa_active === 1).length;
    const ratio = mfaCount / mailAccounts.length;
    if (ratio >= 0.7) {
      p4Score = 15;
      p4Status = 'passed';
      p4Notes = `Mükemmel 2FA/MFA koruması: ${mailAccounts.length} hesabın ${mfaCount} tanesinde (%${Math.round(ratio * 100)}) aktif.`;
    } else if (ratio >= 0.3) {
      p4Score = 10;
      p4Status = 'warning';
      p4Notes = `Kısmi 2FA koruması: ${mfaCount}/${mailAccounts.length} hesapta aktif.`;
    } else if (mfaCount > 0) {
      p4Score = 5;
      p4Status = 'warning';
      p4Notes = `Düşük 2FA koruması: Sadece ${mfaCount} hesapta aktif.`;
    } else {
      p4Score = 2;
      p4Status = 'failed';
      p4Notes = 'Hiçbir e-posta hesabında 2FA / MFA koruması aktif değil!';
    }
  }

  // Pillar 5: Donanım & Lisans Uyumluluğu (15 pts)
  let p5Score = 0;
  let p5Status = 'failed';
  let p5Notes = 'Kayıtlı kullanıcı bilgisayarı yok.';
  if (computers.length > 0) {
    const winKeyCount = computers.filter(c => c.os_license_key && c.os_license_key.trim().length > 0).length;
    const ratio = winKeyCount / computers.length;
    if (ratio >= 0.8) {
      p5Score = 15;
      p5Status = 'passed';
      p5Notes = `Lisans uyumu tam: ${computers.length} bilgisayarın ${winKeyCount} tanesinde orijinal lisans key'i kayıtlı.`;
    } else if (ratio >= 0.4) {
      p5Score = 10;
      p5Status = 'warning';
      p5Notes = `Kısmi lisans kaydı: ${winKeyCount}/${computers.length} bilgisayarda anahtar mevcut.`;
    } else {
      p5Score = 5;
      p5Status = 'failed';
      p5Notes = `Düşük lisans kaydı: ${computers.length} bilgisayardan sadece ${winKeyCount} tanesinde anahtar var.`;
    }
  }

  const totalScore = p1Score + p2Score + p3Score + p4Score + p5Score;

  // Grade & Rating
  let grade = 'B';
  let gradeLabel = 'İyi (Kurumsal Standarda Yakın)';
  let gradeColor = 'text-blue-600 bg-blue-50 border-blue-300';
  let badgeColor = 'bg-blue-600';

  if (totalScore >= 85) {
    grade = 'A+';
    gradeLabel = 'Mükemmel (Tam Kurumsal Standart)';
    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    badgeColor = 'bg-emerald-600';
  } else if (totalScore >= 70) {
    grade = 'B';
    gradeLabel = 'İyi (Küçük Güvenlik İyileştirmeleri Gerekli)';
    gradeColor = 'text-blue-700 bg-blue-50 border-blue-300';
    badgeColor = 'bg-blue-600';
  } else if (totalScore >= 50) {
    grade = 'C';
    gradeLabel = 'Orta (Riskli Noktalar Mevcut)';
    gradeColor = 'text-amber-800 bg-amber-50 border-amber-300';
    badgeColor = 'bg-amber-600';
  } else {
    grade = 'D';
    gradeLabel = 'Kritik Risk (Acil Müdahale Gerekir)';
    gradeColor = 'text-rose-800 bg-rose-50 border-rose-300';
    badgeColor = 'bg-rose-600';
  }

  // Actionable recommendations
  const recommendations = [];
  if (p1Status !== 'passed') {
    recommendations.push(firewalls.length === 0
      ? 'Ağ güvenliğini sağlamak için kurumsal bir Firewall (SonicWall, Fortinet vb.) konumlandırın.'
      : 'Firewall lisansını yenileyin ve güvenlik aboneliklerini aktif tutun.');
  }
  if (p2Status !== 'passed') {
    recommendations.push(backups.length === 0
      ? 'Ransomware ve veri kaybına karşı bağımsız bir NAS yedekleme ünitesi kurun.'
      : 'Yedekleme yazılımı yapılandırmasını tamamlayıp test geri yüklemesi yapın.');
  }
  if (p3Status !== 'passed') {
    recommendations.push(antiviruses.length === 0
      ? 'Tüm istemciler için merkezi bulut yönetimli EDR / Antivirüs lisansı temin edin.'
      : 'Süresi yaklaşan veya dolmuş antivirüs lisanslarını güncelleyin.');
  }
  if (p4Status !== 'passed') {
    recommendations.push('Tüm kurumsal e-posta kullanıcılarında 2FA (İki Adımlı Doğrulama) zorunluluğu getirin.');
  }
  if (p5Status !== 'passed') {
    recommendations.push('Kullanıcı bilgisayarlarının eksik Windows OEM ve Office lisans anahtarlarını sisteme işleyin.');
  }

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const reportElement = document.getElementById('printable-report');
    if (!reportElement) {
      setIsDownloadingPdf(false);
      window.print();
      return;
    }

    const cleanCust = (customer.code || customer.name || 'Musteri').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `IT_Guvenlik_Karnesi_${cleanCust}_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
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
        window.print();
      }
    } finally {
      setIsDownloadingPdf(false);
    }
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
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Müşteri IT Sağlık &amp; Güvenlik Karnesi</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                  totalScore >= 70 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  Skor: %{totalScore} ({grade})
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {customer.name} — Şirket yöneticisine sunulabilir 1 sayfalık resmi IT denetim raporu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'İndiriliyor...' : 'Yönetici PDF İndir'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Yazdır</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live A4 Sheet Preview (Rule 2: Real White Sheet) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-300/80 flex justify-center">
          <div
            id="printable-report"
            className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl rounded-xl p-6 sm:p-10 border border-slate-300 space-y-6"
          >
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 text-white print:bg-black print:text-white">
                    {customer.code || 'AUDIT'}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {customer.name}
                  </h1>
                </div>
                <div className="text-sm font-black text-blue-900 uppercase tracking-wide mt-1">
                  KURUMSAL BİLGİ İŞLEM (IT) SAĞLIK &amp; SİBER RİSK KARNESİ
                </div>
                <p className="text-[11px] text-slate-600">
                  Firewall, Veri Yedekleme, Uç Nokta Antivirüs, E-Posta ve Lisans Uyumluluk Denetim Raporu
                </p>
              </div>

              <div className="text-left sm:text-right text-[11px] text-slate-700 font-mono shrink-0 space-y-0.5">
                <div>Rapor No: <strong>IT-SEC-{new Date().getFullYear()}-{customer.id}</strong></div>
                <div>Denetim Tarihi: <strong>{new Date().toLocaleDateString('tr-TR')}</strong></div>
                <div>Dış Statik IP: <strong>{customer.external_ip || '-'}</strong></div>
              </div>
            </div>

            {/* Score Big Banner */}
            <div className={`border-2 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 ${gradeColor}`}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-md border flex flex-col items-center justify-center shrink-0">
                  <span className="text-3xl font-black text-slate-950 font-mono">%{totalScore}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">GÜVENLİK</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Genel Değerlendirme</span>
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-white border shadow-sm">
                      DERECE: {grade}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-950 mt-0.5">
                    {gradeLabel}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 max-w-xl">
                    Bu skor; şirketin iş sürekliliği, fidye yazılımlarına (Ransomware) karşı dayanıklılığı ve siber güvenlik olgunluk düzeyini temsil eder.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-slate-700">Denetim Durumu</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">
                  {totalScore >= 70 ? '✓ ONAYLI SEVİYE' : '⚠️ İYİLEŞTİRME GEREKLİ'}
                </div>
              </div>
            </div>

            {/* 5 Pillars Breakdown Table */}
            <div>
              <div className="text-xs font-black text-slate-800 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>Denetim Kriterleri &amp; Puan Dağılımı</span>
                <span className="text-[10px] text-slate-500 font-mono">MAKSİMUM: 100 PUAN</span>
              </div>

              <table className="w-full text-xs text-left border-collapse border border-slate-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                    <th className="p-3">Güvenlik &amp; Altyapı Alanı</th>
                    <th className="p-3">Mevcut Durum &amp; Bulgular</th>
                    <th className="p-3 text-center">Durum</th>
                    <th className="p-3 text-right">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* P1 */}
                  <tr>
                    <td className="p-3 font-bold text-slate-900 w-1/4">
                      1. Firewall &amp; Ağ Güvenliği
                      <span className="block text-[10px] text-slate-500 font-normal">Siber saldırı &amp; VPN koruması</span>
                    </td>
                    <td className="p-3 text-slate-700">{p1Notes}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p1Status === 'passed' ? 'bg-emerald-100 text-emerald-800' : p1Status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p1Status === 'passed' ? 'BAŞARILI' : p1Status === 'warning' ? 'DİKKAT' : 'KRİTİK'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{p1Score} / 25</td>
                  </tr>

                  {/* P2 */}
                  <tr>
                    <td className="p-3 font-bold text-slate-900">
                      2. Yedekleme &amp; İş Sürekliliği
                      <span className="block text-[10px] text-slate-500 font-normal">NAS, imaj ve veri kurtarma</span>
                    </td>
                    <td className="p-3 text-slate-700">{p2Notes}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p2Status === 'passed' ? 'bg-emerald-100 text-emerald-800' : p2Status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p2Status === 'passed' ? 'BAŞARILI' : p2Status === 'warning' ? 'DİKKAT' : 'KRİTİK'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{p2Score} / 25</td>
                  </tr>

                  {/* P3 */}
                  <tr>
                    <td className="p-3 font-bold text-slate-900">
                      3. Uç Nokta &amp; Antivirüs
                      <span className="block text-[10px] text-slate-500 font-normal">EDR, virüs &amp; fidye koruması</span>
                    </td>
                    <td className="p-3 text-slate-700">{p3Notes}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p3Status === 'passed' ? 'bg-emerald-100 text-emerald-800' : p3Status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p3Status === 'passed' ? 'BAŞARILI' : p3Status === 'warning' ? 'DİKKAT' : 'KRİTİK'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{p3Score} / 20</td>
                  </tr>

                  {/* P4 */}
                  <tr>
                    <td className="p-3 font-bold text-slate-900">
                      4. Kimlik &amp; E-Posta Güvenliği
                      <span className="block text-[10px] text-slate-500 font-normal">2FA / İki adımlı doğrulama</span>
                    </td>
                    <td className="p-3 text-slate-700">{p4Notes}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p4Status === 'passed' ? 'bg-emerald-100 text-emerald-800' : p4Status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p4Status === 'passed' ? 'BAŞARILI' : p4Status === 'warning' ? 'DİKKAT' : 'KRİTİK'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{p4Score} / 15</td>
                  </tr>

                  {/* P5 */}
                  <tr>
                    <td className="p-3 font-bold text-slate-900">
                      5. Donanım &amp; Lisans Uyumu
                      <span className="block text-[10px] text-slate-500 font-normal">Orijinal Windows OEM &amp; Office</span>
                    </td>
                    <td className="p-3 text-slate-700">{p5Notes}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p5Status === 'passed' ? 'bg-emerald-100 text-emerald-800' : p5Status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p5Status === 'passed' ? 'BAŞARILI' : p5Status === 'warning' ? 'DİKKAT' : 'KRİTİK'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{p5Score} / 15</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendations / Action Items */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>Yöneticiye Özel Önerilen İyileştirme Adımları</span>
              </div>
              {recommendations.length === 0 ? (
                <p className="text-emerald-800 font-semibold">
                  Tebrikler! Şirketinizin tüm IT güvenlik bileşenleri eksiksiz ve en üst standartta çalışmaktadır.
                </p>
              ) : (
                <ul className="space-y-1.5 list-disc pl-5 text-slate-700">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <strong>Öncelik {idx + 1}:</strong> {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sign-off Boxes */}
            <div className="pt-3 border-t border-slate-300 break-inside-avoid">
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 h-32 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 uppercase text-[11px]">DENETLEYEN BT YÖNETİCİSİ</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Bilgi Teknolojileri Departmanı</div>
                  </div>
                  <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500 flex justify-between">
                    <span>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
                    <span>İmza / Kaşe</span>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 h-32 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 uppercase text-[11px]">ŞİRKET YÖNETİMİ / MÜDÜRÜ</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{customer.name} Yetkilisi</div>
                  </div>
                  <div className="border-t border-dashed border-slate-400 pt-1 text-[10px] text-slate-500 flex justify-between">
                    <span>Tarih: .........................</span>
                    <span>İmza / Kaşe</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer (Rule 1) */}
            <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-1">
              <div>OMNIFlow IT &amp; Siber Risk Yönetimi Denetim Raporu</div>
              <div>Designed &amp; Developed by Önder Cihan ACAR © 2026. All Rights Reserved.</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
