# OMNIFlow - Müşteri & Altyapı Yönetim Sistemi

IT Uzmanları ve Sistem Yöneticileri için özel olarak tasarlanmış; tüm müşterilerin fiziksel sunucularını, sanal makinelerini (VM), Windows ve Office lisanslarını, kullanıcı bilgisayarlarını (Ethernet & Wi-Fi MAC/IP), Firewall ve Yedekleme Ünitelerini (NAS) tek bir merkezden yöneten, anlık arama, **Ağ Topolojisi Çıkartma**, **Excel (.xlsx) Dökümü** ve **Yazdırılabilir PDF Raporlama** yeteneklerine sahip modern yönetim paneli.

---

## 🚀 Hızlı Başlatma (Tek Tıkla Çalıştırma)

1. Klasördeki **`baslat.bat`** dosyasına çift tıklayın.
2. Program arka planda yerel SQLite veritabanını ve sunucuyu başlatır, ardından varsayılan web tarayıcınızda otomatik olarak **`http://localhost:5000`** adresini açar.

---

## 📌 Modüller ve Özellikler

### 1. 🌐 Müşteri Ağ Topolojisi Şeması (Network Topology)
- Her müşteri için otomatik olarak oluşturulan hiyerarşik ağ şeması:
  - **Dış Ağ & İnternet (WAN):** Müşterinin Dış Statik IP adresi ve bağlantı hattı.
  - **Güvenlik Duvarı (Firewall / Gateway):** FortiGate, Sophos vb. cihaz adı, Gateway IP'si ve SSL-VPN portalı.
  - **Merkez Dağıtım Katmanı:** Bağlı tüm uç nokta sayıları ve yerel ağ hub'ı.
  - **Sunucu Odası & Kabinet Katmanı:** Fiziksel sunucular (Dell, HP) ve her bir fiziksel sunucu altında çalışan Sanal Makineler (VMs: DC, SQL, ERP), vCPU/RAM ve lisans durumu.
  - **Depolama & Yedekleme Katmanı:** Synology / QNAP NAS üniteleri, depolama kapasiteleri ve yedekleme planları.
  - **Departman Bazlı Kullanıcı Katmanı:** Departmanlara (Muhasebe, Satış, Yönetim vb.) göre gruplanmış kullanıcı bilgisayarları, kullanıcı isimleri, Ethernet IP ve Wi-Fi IP eşleşmeleri.
- **Topoloji Filtreleri:** "Tam Topoloji", "Sadece Sunucular & Altyapı", "Sadece Kullanıcı Bilgisayarları" veya "Departman Bazlı" filtreleme.

### 2. 📊 Excel Dökümü (.xlsx Formatında Çok Sayfalı Çıktı)
- Müşteri başlığındaki **"Excel Dökümü"** butonuna basıldığı an, o müşteriye ait tüm envanteri Excel dosyası olarak indirir:
  - **Sayfa 1 (Genel Bilgiler):** Şirket adı, Dış Statik IP, ilgili kişi, telefon, e-posta, adres ve cihaz adetleri özeti.
  - **Sayfa 2 (Fiziki Sunucular):** Sunucu adı, marka, model, seri no (Service Tag), CPU, RAM, Disk/RAID, IP, MAC, iDRAC/iLO yönetim bilgileri.
  - **Sayfa 3 (Sanal Makineler):** VM adı, bağlı olduğu sunucu, rolü, vCPU, RAM, Disk, IP, MAC, Windows ve Office lisans keyleri.
  - **Sayfa 4 (Kullanıcı Bilgisayarları):** Departmana göre sıralı; personel adı, bilgisayar adı, marka/model, donanım, Ethernet IP/MAC, Wi-Fi IP/MAC, Windows & Office lisans keyleri, AnyDesk ID, antivirüs.
  - **Sayfa 5 (Firewall & Ağ):** Arayüz IP/Port, kullanıcı adı, parola, WAN IP, SSL VPN, lisans bitişi.
  - **Sayfa 6 (Yedekleme & NAS):** Arayüz IP, kullanıcı adı, parola, kapasite/RAID, yedekleme yazılımı ve periyodu.

### 3. 📄 PDF & Yazdırılabilir Rapor Dökümü
- Müşteri başlığındaki **"PDF / Rapor Al"** butonuna basarak açılan profesyonel raporlama ekranı:
  - **Departman Seçimi:** İster tüm şirketi, isterseniz sadece belirli bir departmanı (Örn: *Sadece Muhasebe Departmanı*) seçip döküm alabilirsiniz.
  - **Bölüm Dahil Etme:** Sunucuları, Kullanıcı Bilgisayarlarını veya Ağ/Yedekleme bölümlerini isteğe göre açıp kapatabilirsiniz.
  - **PDF Olarak Kaydet / Yazdır:** A4 dikey formata göre optimize edilmiş `@media print` tasarımı ile tek tıkla PDF olarak kaydedebilir veya yazıcıdan çıkartabilirsiniz.

### 4. 💻 Kullanıcı Bilgisayarları & Lisans Kayıtları
- Makina Adı (Hostname), Zimmetli Personel ve Departman.
- Donanım Özellikleri (İşlemci, RAM, SSD/HDD).
- **Ethernet (Kablolu) IP ve MAC adresi**.
- **Wi-Fi (Kablosuz) IP ve MAC adresi**.
- **Windows İşletim Sistemi Sürümü & Lisans Anahtarı (Key)**.
- **Office Sürümü & Lisans Anahtarı / Hesap Bilgisi**.
- **AnyDesk / TeamViewer ID** ve Antivirüs / EDR kaydı.

### 5. 🔍 Anlık Arama & Filtreleme (`Ctrl + K`)
- Müşteri fark etmeksizin herhangi bir IP adresi, MAC adresi, Lisans anahtarı, AnyDesk ID veya makina adını anında bulan Omnibox arama motoru.

### 6. 💾 Veritabanı ve Güvenlik
- Veriler tamamen yerel sisteminizde `server/data/itmanager.db` SQLite dosyasında saklanır.
- Üst menüden tek tıkla veritabanı yedeği (`.db`) veya tüm arşiv `JSON` olarak indirilebilir.
