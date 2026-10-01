import React, { useState, useEffect } from 'react';
import {
  HelpCircle, X, Search, BookOpen, Server, Cloud, Laptop,
  Shield, Database, KeyRound, FileSpreadsheet, Sparkles,
  Layers, Network, Wifi, CheckCircle2, ChevronRight, AlertTriangle,
  Lightbulb, Printer, Terminal, Copy, ArrowRight, ShieldCheck, Volume2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HelpModal({ isOpen, onClose }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('quickstart');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Help Topics Navigation Definitions
  const navigationItems = [
    { id: 'quickstart', label: 'Hızlı Başlangıç', labelEn: 'Quick Start', icon: Layers, badge: 'Temel' },
    { id: 'customers', label: 'Müşteriler & Şubeler', labelEn: 'Customers & Lines', icon: Layers, badge: 'Modül' },
    { id: 'servers', label: 'Sunucular & VM\'ler', labelEn: 'Servers & VMs', icon: Server, badge: 'Envanter' },
    { id: 'computers', label: 'Kullanıcı PC\'leri', labelEn: 'User Computers', icon: Laptop, badge: 'Envanter' },
    { id: 'firewalls', label: 'Güvenlik & Antivirüs', labelEn: 'Firewall & EDR', icon: Shield, badge: 'NOC & Alarm' },
    { id: 'backups', label: 'Yedekleme & Kurtarma', labelEn: 'Backups & Recovery', icon: Database, badge: 'Otomasyon' },
    { id: 'topology', label: 'Topoloji & Wi-Fi', labelEn: 'Topology & Wi-Fi', icon: Network, badge: 'Ağ Haritası' },
    { id: 'kb', label: 'IT Bilgi Bankası (KB)', labelEn: 'Knowledge Base', icon: BookOpen, badge: 'Kütüphane' },
    { id: 'security', label: '2FA & Kullanıcılar', labelEn: '2FA & Users', icon: KeyRound, badge: 'Güvenlik' },
    { id: 'reports', label: 'Raporlama & Çıktı', labelEn: 'Reports & Export', icon: FileSpreadsheet, badge: 'A4 / PDF' },
    { id: 'mascot', label: 'Omni Robot Asistan', labelEn: 'Omni AI Mascot', icon: Sparkles, badge: 'Ses & Hareket' },
    { id: 'shortcuts', label: 'Klavye Kısayolları', labelEn: 'Shortcuts', icon: Terminal, badge: 'Hızlı Erişim' },
  ];

  // Filter tabs if user enters a search query
  const filteredNav = navigationItems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.label.toLowerCase().includes(q) ||
           item.labelEn.toLowerCase().includes(q) ||
           item.id.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden text-slate-200">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-950/50 shrink-0 ring-2 ring-cyan-500/30">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {language === 'en' ? 'OmniFlow - User Guide & Help Center' : 'OmniFlow - Kullanım Kılavuzu & Yardım Merkezi'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                  v2.6 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'en'
                  ? 'Step-by-step documentation, module walkthroughs, and practical workflows'
                  : 'Sistem modülleri, işlevler ve pratik iş akışları için adım adım kullanım rehberi'}
              </p>
            </div>
          </div>

          {/* Quick In-Help Search Omnibox */}
          <div className="hidden md:flex items-center gap-2 w-64">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search guide (e.g. 2fa, backup)...' : 'Kılavuzda ara (örn: yedek, 2fa)...'}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Kapat (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns: Sidebar + Content) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Navigation Menu */}
          <div className="w-56 sm:w-64 bg-slate-950/60 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-2.5 space-y-1">
            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'en' ? 'Modules & Topics' : 'Konular & Modüller'}
            </div>
            {filteredNav.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/50 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/40'
                      : 'hover:bg-slate-800/70 text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComp className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`} />
                    <span className="truncate">
                      {language === 'en' ? item.labelEn : item.label}
                    </span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Topic Details Pane */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            
            {/* 1. HIZLI BAŞLANGIÇ */}
            {activeTab === 'quickstart' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
                    <Layers className="w-4 h-4" />
                    <span>TEMEL İLKELER & ARAYÜZ MİMARİSİ</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">OMNIFlow Nedir?</h2>
                  <p className="text-slate-300 text-sm mt-1 leading-relaxed">
                    Müşterilerinize ait tüm bilişim envanterini, fiziksel ve sanal sunucuları, ağ cihazlarını, kullanıcı bilgisayarlarını, güvenlik duvarı ve antivirüs lisanslarını tek bir merkezden, kesintisiz yönetmeniz için geliştirilmiş kurumsal BT operasyon platformudur.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-xs">1</span>
                      Sol Menü (Sidebar)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Kayıtlı tüm firmalar ve müşteriler burada listelenir. Her müşteri kartının altında o müşteriye ait sunucu, sanal makine, bilgisayar, firewall, NAS ve Wi-Fi cihaz sayaçları yer alır.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-xs">2</span>
                      Üst Çubuk (Navbar)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Global Arama (<kbd className="font-mono text-slate-300">Ctrl+K</kbd>), IT Çözüm Kütüphanesi, Lisans Alarm Işığı (NOC Beacon), Dil Değiştirici ve Kullanıcı Profil Menüsünü barındırır.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs">3</span>
                      Ana Çalışma Alanı (Sekmeler)
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Seçili müşterinin Genel Bakış, Ağ Topolojisi, Şubeler & Hatlar, Sunucular, VM, PC, Firewall, EDR, Yedekleme ve Wi-Fi gibi tüm envanter detaylarını yönettiğiniz alandır.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs">4</span>
                      Omni Robot Asistan
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ekran üzerinde farenizle dilediğiniz yere sürükleyebileceğiniz, sayfa açılışında sizi sesli olarak selamlayan, sistem telemetrisini ve lisanslarını anlık takip eden robot arkadaşınızdır.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-cyan-200 text-xs">
                  <Lightbulb className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-cyan-300">İpucu: Geniş Ekran Çalışma Modu</span>
                    Üst menünün en solundaki panel simgesine tıklayarak sol menüyü kapatabilir ve tüm ekranı devasa bir BT kontrol merkezine dönüştürebilirsiniz.
                  </div>
                </div>
              </div>
            )}

            {/* 2. MÜŞTERİLER & ŞUBELER */}
            {activeTab === 'customers' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-blue-400 font-mono text-xs mb-1">
                    <Layers className="w-4 h-4" />
                    <span>MÜŞTERİ & DIŞ STATİK HAT YÖNETİMİ</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Müşteri Tanımlama ve Hat Takibi</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Firmaların kurumsal iletişim, sözleşme, şube ve internet bağlantı bilgilerini yönetin.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Yeni Müşteri Nasıl Eklenir?
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      1. Sol menünün üst kısmında yer alan mavi <strong className="text-slate-200">+ Yeni Müşteri Ekle</strong> butonuna tıklayın.<br />
                      2. Açılan pencerede Şirket Adı, Yetkili Kişi (Örn: Bilgi İşlem Müdürü), Telefon, E-posta, Adres ve Dış Statik IP bilgilerini doldurun.<br />
                      3. <strong className="text-blue-400">Kaydet</strong> butonuna bastığınızda müşteri anında listeye eklenir ve seçili hale gelir.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      Şubeler ve Dış Statik IP Hatları Nasıl Tanımlanır?
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Müşteri seçildikten sonra <strong className="text-slate-200">"Şubeler & Hatlar"</strong> sekmesine geçin. Firmanın Merkez Ofis, Depo, Fabrika veya Yedek Hatlarını (Metro Ethernet, Fiber, VDSL) tanımlayabilirsiniz. Her hat için Statik IP, Subnet Mask, Gateway, PPPoE kullanıcı bilgisi ve modem arayüz IP'sini saklayabilirsiniz.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      Müşteri Düzenleme ve Silme
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Müşteri başlığının sağ tarafında yer alan <strong className="text-slate-200">"Düzenle"</strong> butonu ile iletişim bilgilerini güncelleyebilir; gerek duyulursa <strong className="text-rose-400">"Müşteriyi Sil"</strong> butonuyla güvenli onay penceresi üzerinden silebilirsiniz (Müşteri silindiğinde bağlı tüm cihazlar otomatik temizlenir).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SUNUCULAR & VM */}
            {activeTab === 'servers' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs mb-1">
                    <Server className="w-4 h-4" />
                    <span>DONANIM & SANALLAŞTIRMA KATMANI</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Fiziksel Sunucular & Sanal Makineler (VM)</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Veri merkezi donanımları, Hyper-V, VMware ESXi ve Proxmox sanal sunucu takibi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <Server className="w-4 h-4" />
                      Fiziksel Sunucular (Bare Metal)
                    </div>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                      <li>HPE ProLiant, Dell PowerEdge, Lenovo ThinkSystem modelleri.</li>
                      <li>İşlemci (CPU), Bellek (RAM), Disk Konfigürasyonu (RAID 1, 5, 10).</li>
                      <li>iLO / iDRAC uzaktan yönetim IP adresleri ve portları.</li>
                      <li>Donanım Seri Numarası ve Garanti bitiş takibi.</li>
                      <li>Tek tıkla yönetim paneline gitme kısayolu.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                      <Cloud className="w-4 h-4" />
                      Sanal Makineler (Virtual Machines)
                    </div>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                      <li>Bağlı olduğu Fiziksel Host sunucu eşleştirmesi.</li>
                      <li>Ayrılan vCPU, vRAM ve Sanal Disk (GB) kapasiteleri.</li>
                      <li>İşletim Sistemi (Windows Server 2022, Ubuntu Server, Debian).</li>
                      <li>IP Adresi ve Sunucu Rolü (Domain Controller, SQL, ERP, File Server).</li>
                      <li>Hızlı RDP ve SSH bağlantı bilgileri.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                  <strong className="text-white block mb-1">Görünüm Seçenekleri (Tablo / Kart):</strong>
                  Sunucu ve Sanal Makine listelerinde sağ üstte yer alan görünüm düğmesi ile verileri isterseniz detaylı bir **Tablo** görünümünde, isterseniz görsel **Modern Kartlar** halinde inceleyebilirsiniz.
                </div>
              </div>
            )}

            {/* 4. KULLANICI BİLGİSAYARLARI */}
            {activeTab === 'computers' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs mb-1">
                    <Laptop className="w-4 h-4" />
                    <span>UÇ NOKTA & İSTEMCİ YÖNETİMİ</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Kullanıcı Bilgisayarları (PC & Laptop)</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Personel bilgisayarları, AnyDesk / TeamViewer ID'leri, Office ve Windows lisans kayıtları.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Uzaktan Destek ID'leri ile Anında Müdahale
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Her kullanıcının kaydında **AnyDesk ID**, **TeamViewer ID** veya **RustDesk** numarası bulunur. Bu numaraların yanında yer alan tek tıkla kopyalama düğmesine basarak uzaktan destek oturumunu saniyeler içinde başlatabilirsiniz.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Departman ve Lisans Eşleştirme
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Kullanıcıların çalıştığı departman (Muhasebe, Satış, İnsan Kaynakları vb.), bilgisayarın Host Adı, MAC adresi, yüklü Office / Microsoft 365 lisansı ve Antivirüs koruma durumu tek tabloda izlenebilir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. GÜVENLİK & ANTİVİRÜS */}
            {activeTab === 'firewalls' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-xs mb-1">
                    <Shield className="w-4 h-4" />
                    <span>AĞ GÜVENLİĞİ & NOC ERKEN UYARI SİSTEMİ</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Güvenlik Duvarı & Antivirüs / EDR Takibi</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    FortiGate, pfSense, Sophos UTM lisansları, ESET/Kaspersky EDR takibi ve sesli alarmlar.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-rose-300 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-400" />
                      Güvenlik Duvarı (Firewall)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cihaz Marka/Modeli, WAN/LAN IP adresleri, Yönetim Portu (HTTPS), SSL VPN kullanıcı sayıları, Firmware sürümü ve **Lisans Bitiş Tarihi** saklanır.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Antivirüs & EDR Bulut Konsolları
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Kaspersky, ESET PROTECT, Bitdefender, SentinelOne konsol linkleri, toplam lisans adedi, korunan bilgisayar sayısı ve lisans periyotları kaydedilir.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    NOC Lisans Alarm Lambası (Beacon) Nasıl Çalışır?
                  </div>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    Lisansın bitmesine 30 gün kala sistem sarı ikaza, 15 gün kala turuncu ikaza, 7 gün ve daha az kala kırmızı yanıp sönen flaşör alarmına geçer. Üst menüdeki alarm butonuna tıklayarak acil ilgilenilmesi gereken tüm lisansları tek pencerede filtreleyebilir ve alarm seslerini test edebilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {/* 6. YEDEKLEME & RECOVERY */}
            {activeTab === 'backups' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs mb-1">
                    <Database className="w-4 h-4" />
                    <span>FELAKET KURTARMA & VERİ GÜVENLİĞİ</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Yedekleme & Otomatik Yedekleme Motoru</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Müşteri NAS cihazları, Veeam yedekleri ve OmniFlow yerel veritabanı otomatik yedeklemesi.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-400" />
                      Otomatik Yedekleme Motoru (Zamanlanmış Görevler)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sistem verileriniz <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">C:\Users\Onder\Desktop\itmanager\Otomatik_Yedekler</code> klasöründe güvenle arşivlenir.<br />
                      * **Sıklık Ayarı:** Her 6 Saatte Bir, Her 12 Saatte Bir, Günde 1 Kez veya Haftada 1 Kez.<br />
                      * **Çift Format:** Her çalıştığında hem SQLite <code className="text-cyan-300">.db</code> kopyasını hem de taşınabilir <code className="text-blue-300">.json</code> yedeğini tarih ve saat etiketiyle üretir.<br />
                      * **Disk Temizliği (Retention):** Diskin dolmasını önlemek için son 7, 14, 30 veya 60 yedeği saklar, eski olanları otomatik temizler.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Manuel Yedek Alma & İndirme
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sağ üstteki Kullanıcı Menüsü &gt; Sistem Ayarları &gt; Veritabanı &amp; Yedekleme sekmesine giderek dilediğiniz an <strong className="text-blue-300">"itmanager.db İndir"</strong> veya <strong className="text-amber-300">"Tam JSON Yedek Al"</strong> butonlarına basıp tek tıkla bilgisayarınıza güvenli yedek indirebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. TOPOLOJİ & WI-FI */}
            {activeTab === 'topology' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
                    <Network className="w-4 h-4" />
                    <span>ŞEBEKE DİYAGRAMI & KABLOSUZ ALTYAPI</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Görsel Ağ Topolojisi & Wi-Fi Altyapısı</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Müşteri şebekesinin hiyerarşik haritası ve kablosuz erişim noktaları (AP) takibi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                      <Network className="w-4 h-4 text-cyan-400" />
                      Görsel Ağ Topolojisi Şeması
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      İnternet Girişi &gt; Firewall &gt; Omurga / Kenar Switch &gt; Sunucular &gt; Uç Kullanıcılar hiyerarşisini görsel diyagram üzerinde inceleyebilirsiniz. Cihazların durumunu ve IP bloklarını şema üzerinde net olarak görebilirsiniz.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-blue-300 flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-blue-400" />
                      Wi-Fi Controller & AP Yönetimi
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      UniFi, Aruba Instant On, Ruijie Reyee veya Omada controller linkleri, kurumsal Personel SSID'leri, Misafir Wi-Fi şifreleri ve AP bazında IP listesi saklanır.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 8. KNOWLEDGE BASE */}
            {activeTab === 'kb' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>ŞİRKET İÇİ DOKÜMANTASYON & PROSEDÜRLER</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">IT Çözüm Kütüphanesi (Knowledge Base)</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Teknik rehberler, ağ kurulum notları, hata çözümleri ve IT standartları arşivi.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Kütüphaneye Nasıl Erişilir?
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Üst çubukta yer alan <strong className="text-amber-400">"Kütüphane"</strong> butonuna basarak doğrudan IT Sorun &amp; Çözüm kütüphanesine geçebilirsiniz. Çözümleri Sunucu, Ağ, Güvenlik, Yazılım etiketleriyle sınıflandırabilir; Markdown formatında zengin dokümanlar hazırlayabilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {/* 9. GÜVENLİK & 2FA */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-xs mb-1">
                    <KeyRound className="w-4 h-4" />
                    <span>İKİ AŞAMALI DOĞRULAMA (2FA) & GÜVENLİK</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Google Authenticator (2FA) Kurulumu</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Yeni kullanıcı tanımlama, Google Authenticator QR kod eşleme ve güvenlik ilkeleri.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/30 space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      İlk Kurulumda Google Authenticator Nasıl Eklenir?
                    </h4>
                    <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed">
                      <li>Yeni tanımlanan bir kullanıcı hesabı ilk kez oturum açtığında veya Ayarlar menüsünden 2FA aktif edildiğinde ekrana benzersiz bir **QR Kod** ve **Gizli Kurulum Anahtarı (Secret)** gelir.</li>
                      <li>Akıllı telefonunuzda **Google Authenticator** (veya Microsoft Authenticator) uygulamasını açın.</li>
                      <li>Uygulamadaki <strong className="text-cyan-300">+</strong> simgesine dokunun ve <strong className="text-cyan-300">"QR Kodu Tara"</strong> seçeneğini seçip ekrandaki kodu kameraya okutun.</li>
                      <li>Uygulamanın ürettiği 6 haneli doğrulama kodunu ekrandaki onay kutusuna girip kaydedin.</li>
                      <li>Artık her girişinizde parolanızın ardından telefonunuzdaki güncel 6 haneli kod istenecektir.</li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white">Kaba Kuvvet (Brute-Force) Saldırı Koruması:</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Art arda 5 defa hatalı parola veya doğrulama kodu girildiğinde ilgili IP adresi sistem tarafından otomatik olarak 15 dakika boyunca kilitlenir ve tüm olaylar güvenlik denetim loglarına kaydedilir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 10. RAPORLAMA */}
            {activeTab === 'reports' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>KURUMSAL ÇIKTILAR & DÖKÜMLER</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Müşteri Envanter Raporu & PDF Dökümü</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Gerçek A4 kağıt standartlarında temiz beyaz rapor önizlemesi ve PDF dışa aktarma.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-400" />
                      A4 Beyaz Rapor ve PDF Çıktısı Alma
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      Müşteri başlığının sağındaki <strong className="text-slate-200">"PDF / Rapor Al"</strong> butonuna basın. Açılan ekranda müşterinin tüm sunucuları, sanal makineleri, bilgisayarları, firewall lisansları ve iletişim bilgileri gerçek beyaz A4 sayfası düzeninde sergilenir. <strong className="text-emerald-400">"PDF İndir / Yazdır"</strong> butonuna basarak anında renkli/siyah-beyaz yazıcıya gönderebilir veya PDF olarak kaydedebilirsiniz.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      Excel Elektronik Tablo (.xlsx) İndirme
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      <strong className="text-slate-200">"Excel Dökümü"</strong> butonu ile müşterinin tüm cihaz ve donanım envanterini sekmelere ayrılmış Microsoft Excel dosyasında tek tıkla indirebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 11. OMNI ROBOT ASİSTAN */}
            {activeTab === 'mascot' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>AKILLI MASCOT & SESLİ KARŞILAMA</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Omni Robot Asistan Kullanımı</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Serbestçe sürüklenebilir robot, konuşma sentezleyicisi, yürüyüş ve göz kırpma sesleri.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2">
                    <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Farenizle İstediğiniz Yere Sürükleyin
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      Robot ekranın herhangi bir köşesine hapsolmaz. Farenizle (veya dokunmatik ekranda parmağınızla) robotun üzerine basılı tutarak ekranın dilediğiniz yerine taşıyabilirsiniz. Bıraktığınız yer tarayıcı hafızasına kaydedilir ve sonraki girişlerinizde orada kalır.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      Sesli Karşılama ve Ses Efektleri
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      * **Adınızla Karşılama:** Sayfaya girdiğinizde isminizle hitap ederek (*"Hoş geldin Önder"* vb.) sesli konuşur.<br />
                      * **Mekanik Yürüyüş Sesi:** Belirli aralıklarla adım atarak gerçekçi mekanik servo motor sesi çıkarır.<br />
                      * **Gülme &amp; Göz Kırpma:** Farenizle tıkladığınızda gözünde parıldayan efektle sevimli elektronik melodiler çalar.<br />
                      * **Sessiz Mod (Mute):** Baloncuğundaki hoparlör simgesiyle dilediğiniz an sesleri kapatıp açabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 12. KLAVYE KISAYOLLARI */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs mb-1">
                    <Terminal className="w-4 h-4" />
                    <span>HIZLI ERİŞİM & VERİMLİLİK</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Klavye Kısayolları</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Program içerisinde fareye ihtiyaç duymadan en sık kullanılan işlevlere hızla erişin.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="text-left py-2.5 px-3">Kısayol Tuşu</th>
                        <th className="text-left py-2.5 px-3">İşlev &amp; Açıklama</th>
                        <th className="text-right py-2.5 px-3">Kategori</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="py-2.5 px-3">
                          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">Ctrl + K</kbd>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">
                          Evrensel Arama Omnibox'ını aç (Müşteri, IP, MAC, Lisans, Seri No ara)
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">Global Arama</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">
                          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">F1</kbd>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">
                          Bu Yardım Kılavuzunu ve Dokümantasyon Merkezini Aç / Kapat
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">Yardım</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3">
                          <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">Esc</kbd>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">
                          Açık olan tüm pencereleri, modalları ve menüleri kapat
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">Genel</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-300">OmniFlow IT Platform Yardım Kılavuzu</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
            >
              Kılavuzu Kapat (Esc)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
