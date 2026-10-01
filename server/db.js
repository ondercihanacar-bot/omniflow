const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'itmanager.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    external_ip TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS physical_servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    server_name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    cpu_info TEXT,
    ram_info TEXT,
    disk_info TEXT,
    ip_address TEXT,
    mac_address TEXT,
    management_ip TEXT,
    management_user TEXT,
    management_password TEXT,
    local_admin_user TEXT,
    local_admin_password TEXT,
    branch_name TEXT DEFAULT 'Merkez Ofis',
    location TEXT,
    status TEXT DEFAULT 'Aktif',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS virtual_machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    physical_server_id INTEGER REFERENCES physical_servers(id) ON DELETE SET NULL,
    vm_name TEXT NOT NULL,
    hypervisor TEXT,
    role_description TEXT,
    vcpu TEXT,
    ram TEXT,
    disk TEXT,
    ip_address TEXT,
    mac_address TEXT,
    os_version TEXT,
    os_license_key TEXT,
    office_version TEXT,
    office_license_key TEXT,
    local_admin_user TEXT,
    local_admin_password TEXT,
    status TEXT DEFAULT 'Aktif',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_computers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    computer_name TEXT NOT NULL,
    assigned_user TEXT,
    department TEXT,
    branch_name TEXT DEFAULT 'Merkez Ofis',
    device_type TEXT DEFAULT 'Masaüstü',
    brand TEXT,
    model TEXT,
    serial_number TEXT,
    hardware_specs TEXT,
    os_version TEXT,
    os_license_key TEXT,
    office_version TEXT,
    office_license_key TEXT,
    ethernet_ip TEXT,
    ethernet_mac TEXT,
    wifi_ip TEXT,
    wifi_mac TEXT,
    remote_access_id TEXT,
    local_admin_user TEXT,
    local_admin_password TEXT,
    antivirus TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS firewalls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    branch_name TEXT DEFAULT 'Merkez Ofis',
    brand TEXT,
    model TEXT,
    management_ip TEXT,
    username TEXT,
    password TEXT,
    external_ip TEXT,
    firmware_version TEXT,
    license_expiry TEXT,
    ssl_vpn_portal TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS backup_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    branch_name TEXT DEFAULT 'Merkez Ofis',
    location TEXT,
    brand TEXT,
    model TEXT,
    management_ip TEXT,
    username TEXT,
    password TEXT,
    capacity TEXT,
    backup_software TEXT,
    backup_schedule TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS internet_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    branch_name TEXT NOT NULL,
    line_type TEXT NOT NULL,
    isp TEXT,
    circuit_number TEXT,
    is_primary INTEGER DEFAULT 1,
    static_ip TEXT,
    subnet_mask TEXT,
    gateway TEXT,
    dns_servers TEXT,
    pppoe_user TEXT,
    pppoe_password TEXT,
    modem_brand_model TEXT,
    modem_ip TEXT,
    modem_user TEXT,
    modem_password TEXT,
    speed_info TEXT,
    location_address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wifi_controllers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    controller_name TEXT NOT NULL,
    branch_name TEXT DEFAULT 'Merkez Ofis',
    controller_type TEXT DEFAULT 'Donanım (UDM / CloudKey)',
    management_ip TEXT,
    email TEXT,
    username TEXT,
    password TEXT,
    version TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wifi_access_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    controller_id INTEGER REFERENCES wifi_controllers(id) ON DELETE SET NULL,
    ap_name TEXT NOT NULL,
    branch_name TEXT DEFAULT 'Merkez Ofis',
    brand TEXT DEFAULT 'Ubiquiti UniFi',
    model TEXT,
    ip_address TEXT,
    mac_address TEXT,
    location TEXT,
    status TEXT DEFAULT 'Aktif',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wifi_networks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    controller_id INTEGER REFERENCES wifi_controllers(id) ON DELETE SET NULL,
    ssid TEXT NOT NULL,
    password TEXT,
    security_type TEXT DEFAULT 'WPA2/WPA3 Personal',
    vlan_id TEXT,
    band TEXT DEFAULT '2.4 GHz & 5 GHz',
    branch_name TEXT DEFAULT 'Merkez Ofis',
    is_guest INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    error_code TEXT,
    symptoms TEXT,
    root_cause TEXT,
    solution_steps TEXT NOT NULL,
    command_snippet TEXT,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    severity TEXT DEFAULT 'Normal',
    views_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS antivirus_licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    brand TEXT DEFAULT 'Kaspersky',
    branch_name TEXT DEFAULT 'Merkez Ofis',
    portal_url TEXT,
    username TEXT,
    password TEXT,
    user_count INTEGER DEFAULT 1,
    license_term TEXT DEFAULT '1 Yıllık',
    license_expiry TEXT,
    license_key TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mail_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_type TEXT DEFAULT 'Microsoft 365',
    domain_name TEXT,
    admin_panel_url TEXT,
    admin_username TEXT,
    admin_password TEXT,
    portal_notes TEXT,
    is_exchange_or_subscription INTEGER DEFAULT 1,
    license_type TEXT,
    license_count INTEGER DEFAULT 1,
    license_start_date TEXT,
    license_expiry TEXT,
    reseller_partner TEXT,
    incoming_server TEXT,
    outgoing_server TEXT,
    dns_records_status TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mail_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    mail_service_id INTEGER REFERENCES mail_services(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email_address TEXT NOT NULL,
    password TEXT,
    department TEXT,
    branch_name TEXT DEFAULT 'Merkez Ofis',
    mailbox_type TEXT DEFAULT 'Kullanıcı',
    license_type TEXT,
    quota_limit TEXT,
    phone_or_recovery TEXT,
    is_mfa_active INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Aktif',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    totp_secret TEXT,
    totp_enabled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration helper to add branch_name column to existing tables if not present
function runMigrations() {
  const tryAddCol = (table, colDef) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    } catch (e) {
      // Column already exists, safe to ignore
    }
  };
  tryAddCol('user_computers', "branch_name TEXT DEFAULT 'Merkez Ofis'");
  tryAddCol('physical_servers', "branch_name TEXT DEFAULT 'Merkez Ofis'");
  tryAddCol('firewalls', "branch_name TEXT DEFAULT 'Merkez Ofis'");
  tryAddCol('backup_units', "branch_name TEXT DEFAULT 'Merkez Ofis'");
  tryAddCol('users', 'permissions TEXT');

  // Local Admin columns migration
  tryAddCol('physical_servers', 'local_admin_user TEXT');
  tryAddCol('physical_servers', 'local_admin_password TEXT');
  tryAddCol('virtual_machines', 'local_admin_user TEXT');
  tryAddCol('virtual_machines', 'local_admin_password TEXT');
  tryAddCol('user_computers', 'local_admin_user TEXT');
  tryAddCol('user_computers', 'local_admin_password TEXT');

  // Ensure Wi-Fi tables exist on existing DBs
  db.exec(`
    CREATE TABLE IF NOT EXISTS wifi_controllers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      controller_name TEXT NOT NULL,
      branch_name TEXT DEFAULT 'Merkez Ofis',
      controller_type TEXT DEFAULT 'Donanım (UDM / CloudKey)',
      management_ip TEXT,
      email TEXT,
      username TEXT,
      password TEXT,
      version TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wifi_access_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      controller_id INTEGER REFERENCES wifi_controllers(id) ON DELETE SET NULL,
      ap_name TEXT NOT NULL,
      branch_name TEXT DEFAULT 'Merkez Ofis',
      brand TEXT DEFAULT 'Ubiquiti UniFi',
      model TEXT,
      ip_address TEXT,
      mac_address TEXT,
      location TEXT,
      status TEXT DEFAULT 'Aktif',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wifi_networks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      controller_id INTEGER REFERENCES wifi_controllers(id) ON DELETE SET NULL,
      ssid TEXT NOT NULL,
      password TEXT,
      security_type TEXT DEFAULT 'WPA2/WPA3 Personal',
      vlan_id TEXT,
      band TEXT DEFAULT '2.4 GHz & 5 GHz',
      branch_name TEXT DEFAULT 'Merkez Ofis',
      is_guest INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample UniFi data if customer 1 exists and has no controllers
  try {
    const cust1 = db.prepare('SELECT id FROM customers LIMIT 1').get();
    if (cust1) {
      const wifiCount = db.prepare('SELECT COUNT(*) as count FROM wifi_controllers WHERE customer_id = ?').get(cust1.id).count;
      if (wifiCount === 0) {
        const cRes = db.prepare(`
          INSERT INTO wifi_controllers (
            customer_id, controller_name, branch_name, controller_type, management_ip,
            email, username, password, version, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          cust1.id,
          'Atlas UniFi Cloud Gateway (UDM-SE)',
          'Merkez Ofis',
          'Donanım (UDM-SE)',
          'https://192.168.10.1:8443 (veya https://unifi.ui.com)',
          'bilgiislem@atlaslojistik.com.tr',
          'admin_atlas',
          'UniFi@Atlas2024!',
          'UniFi OS 3.2.12 / Network 8.1.127',
          'Merkez sistem odasında 1U rackmount. Bulut yönetimi ve yerel konsol aktif.'
        );
        const controllerId = cRes.lastInsertRowid;

        const insertAP = db.prepare(`
          INSERT INTO wifi_access_points (
            customer_id, controller_id, ap_name, branch_name, brand, model,
            ip_address, mac_address, location, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertAP.run(
          cust1.id, controllerId, 'Yönetim Katı AP', 'Merkez Ofis', 'Ubiquiti UniFi', 'U7 Pro (Wi-Fi 7)',
          '192.168.10.31', '74:83:C2:11:22:31', '2. Kat Yönetim & Toplantı Salonu Tavan', 'Aktif', 'PoE+ Switch Port 12'
        );

        insertAP.run(
          cust1.id, controllerId, 'Açık Ofis AP', 'Merkez Ofis', 'Ubiquiti UniFi', 'U6 Pro (Wi-Fi 6)',
          '192.168.10.32', '74:83:C2:11:22:32', '1. Kat Operasyon & Muhasebe Tavan', 'Aktif', 'PoE+ Switch Port 14'
        );

        insertAP.run(
          cust1.id, controllerId, 'Depo Sevkiyat AP', 'Merkez Ofis', 'Ubiquiti UniFi', 'U6 Mesh (Dış/Depo)',
          '192.168.10.33', '74:83:C2:11:22:33', 'Depo A Holü Raf 12 Direği (Yüksek Tavan)', 'Aktif', 'El terminalleri için optimize edildi'
        );

        insertAP.run(
          cust1.id, null, 'Bursa Şube Ofis AP', 'Bursa Bölge Depo Şubesi', 'Ubiquiti UniFi', 'U6 Pro',
          '192.168.20.31', '74:83:C2:44:55:66', 'Bursa Şube Ofis Tavanı', 'Aktif', 'Merkez controller a L3 Inform ile bağlı'
        );

        const insertNet = db.prepare(`
          INSERT INTO wifi_networks (
            customer_id, controller_id, ssid, password, security_type, vlan_id,
            band, branch_name, is_guest, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertNet.run(
          cust1.id, controllerId, 'Atlas_Personel', 'AtlasCorp@2024!', 'WPA2/WPA3 Personal', 'VLAN 10 (Kurumsal Ağ)',
          '2.4 GHz & 5 GHz', 'Merkez Ofis', 0, 'Şirket personeli ve dizüstü bilgisayarlar için birincil Wi-Fi ağı.'
        );

        insertNet.run(
          cust1.id, controllerId, 'Atlas_Misafir', 'Hosgeldiniz2024', 'WPA2 Personal', 'VLAN 30 (Guest Isolation)',
          '2.4 GHz & 5 GHz', 'Tüm Şubeler', 1, 'Ziyaretçiler ve misafirler için izole ağ. Dahili sunuculara erişemez.'
        );

        insertNet.run(
          cust1.id, controllerId, 'Atlas_Depo_IoT', 'DepoTerminal#44', 'WPA2 Personal', 'VLAN 40 (Depo Ağı)',
          '2.4 GHz Only', 'Merkez Ofis', 0, 'Depo barkod okuyucu ve el terminalleri için sadece 2.4 GHz bandı.'
        );
      }
    }
  } catch (err) {
    console.error('Wi-Fi seed hatası:', err.message);
  }

  // Ensure knowledge_base table exists on existing DBs
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      error_code TEXT,
      symptoms TEXT,
      root_cause TEXT,
      solution_steps TEXT NOT NULL,
      command_snippet TEXT,
      customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      severity TEXT DEFAULT 'Normal',
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample Knowledge Base solutions if table is empty
  try {
    const kbCount = db.prepare('SELECT COUNT(*) as count FROM knowledge_base').get().count;
    if (kbCount === 0) {
      const insertKB = db.prepare(`
        INSERT INTO knowledge_base (
          title, category, subcategory, error_code, symptoms, root_cause,
          solution_steps, command_snippet, severity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertKB.run(
        'FortiClient SSL-VPN %98\'de Takılıyor ve Bağlantı Kurulmuyor',
        'Ağ & Firewall',
        'VPN & FortiGate',
        'Error 98 / Logon Timeout',
        'Kullanıcı evden veya dışarıdan şirket SSL-VPN portalına bağlanmaya çalıştığında ilerleme çubuğu %98\'e gelip kilitleniyor, birkaç saniye sonra \'Unable to logon to the server\' hatası veriyor.',
        'Windows güncellemesi sonrası bozuk WAN Miniport (IP/IPv6) adaptörleri veya FortiClient TLS 1.2/1.3 protokol uyumsuzluğu.',
        '1. Aygıt Yöneticisi -> Ağ Bağdaştırıcıları bölümünden tüm \'WAN Miniport\' (IP, IPv6, PPTP vb.) cihazlarını sağ tıklayıp kaldırın.\n2. Üst menüden \'Donanım Değişikliklerini Tara\' butonuna basarak Windows\'un temiz sürücüleri otomatik yüklemesini sağlayın.\n3. Yönetici olarak CMD açıp TCP/IP ve DNS önbelleğini sıfırlayın.\n4. İnternet Seçenekleri -> Gelişmiş sekmesinden \'TLS 1.2 Kullan\' seçeneğinin işaretli olduğunu doğrulayın.',
        'netsh int ip reset\nnetsh winsock reset\nipconfig /flushdns',
        'Kritik'
      );

      insertKB.run(
        'Veeam Backup VSS Snapshot / Writers Hatası (Event ID 8193)',
        'Yedekleme & NAS',
        'VSS & Sanallaştırma',
        'Event ID 8193 / VSS Writer Failed State',
        'Veeam Backup & Replication sunucudan snapshot alırken \'Failed to create snapshot (Microsoft Software Shadow Copy provider) (VSS error 0x80042306)\' hatasıyla yedekleme sonlanıyor.',
        'Sistemde çalışan VSS yazıcılarından (System Writer, ASR Writer veya SQL Server Writer) birinin \'Waiting for completion\' veya \'Failed\' durumunda asılı kalması.',
        '1. Komut satırından \'vssadmin list writers\' komutu ile hangi writer\'ın \'Failed\' veya \'Waiting\' olduğunu tespit edin.\n2. İlgili servisi yeniden başlatın. Çoğu durumda Cryptographic Services veya Volume Shadow Copy servisini yeniden başlatmak kilitlenmeyi çözer.\n3. SQL Server içeren sunucularda \'SQL Server VSS Writer\' servisini yeniden başlatın.\n4. Veeam konsolundan görevi tekrar \'Retry\' edin.',
        'vssadmin list writers\nnet stop cryptsvc && net start cryptsvc\nnet stop vss && net start vss',
        'Kritik'
      );

      insertKB.run(
        'Outlook Sürekli Şifre İstiyor & Modern Authentication Açılmıyor',
        'E-Posta & Office',
        'Outlook & M365',
        'Need Password / ADAL Auth Loop',
        'Outlook açıldığında sağ altta \'Parola Gerekiyor\' yazıyor, şifre doğru girilse de kimlik penceresi sürekli tekrar açılıyor veya boş beyaz ekran veriyor.',
        'Microsoft 365 Modern Authentication (ADAL/WAM) önbellek anahtarlarının bozulması veya Windows Credential Manager\'daki eski tokenlar.',
        '1. Denetim Masası -> Kimlik Yöneticisi (Credential Manager) -> Windows Kimlik Bilgileri alanından \'MicrosoftOffice16_Data\' ile başlayan tüm kayıtları silin.\n2. Kayıt Defterinde (Registry) EnableADAL değerini 1 olarak doğrulayın.\n3. Office oturumunu kapatıp bilgisayarı yeniden başlatın ve lisanslı e-posta ile tekrar giriş yapın.',
        'reg add HKCU\\Software\\Microsoft\\Office\\16.0\\Common\\Identity /v EnableADAL /t REG_DWORD /d 1 /f\nreg add HKCU\\Software\\Microsoft\\Office\\16.0\\Common\\Identity /v DisableADALatopWAMOverride /t REG_DWORD /d 1 /f',
        'Yüksek'
      );

      insertKB.run(
        'Windows 10/11 Lisans Aktivasyon Hatası (0xC004C003 / 0x803FA067)',
        'Kullanıcı PC & Windows',
        'Lisans & Aktivasyon',
        '0xC004C003 / 0x803FA067',
        'Yeni kurulan veya donanım değişimi yapılan Windows 10/11 Pro bilgisayarda geçerli ürün anahtarı girildiğinde aktivasyon sunucusuna bağlanamadı veya anahtar engellendi hatası alınması.',
        'Sistemde generic/OEM anahtar kalıntısının kalması veya slmgr servisinin aktivasyon tokenını yenilememesi.',
        '1. Yönetici olarak Komut İstemi (CMD) çalıştırın.\n2. Mevcut takılı kalan anahtarı /upk ile kaldırın ve /cpky ile kayıt defterinden temizleyin.\n3. Orijinal lisans anahtarınızı /ipk parametresi ile ekleyin.\n4. /ato komutu ile Microsoft lisans sunucularına online aktivasyon isteği gönderin.',
        'slmgr.vbs /upk\nslmgr.vbs /cpky\nslmgr.vbs /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX\nslmgr.vbs /ato',
        'Normal'
      );

      insertKB.run(
        'Windows Yazdırma Biriktiricisi (Print Spooler) Kilitlenmesi',
        'Kullanıcı PC & Windows',
        'Yazıcı & Spooler',
        'Spooler SubSystem App Terminated',
        'Kullanıcı çıktı alamıyor, yazdırma kuyruğu silinemiyor ve \'Yazdırma Biriktiricisi hizmeti çalışmıyor\' uyarısı çıkıyor.',
        'C:\\Windows\\System32\\spool\\PRINTERS klasöründe bozulmuş bir yazdırma işi (.SHD veya .SPL) dosyasının servisi çökertmesi.',
        '1. Yönetici olarak CMD açın.\n2. Print Spooler servisini durdurun.\n3. PRINTERS klasöründeki tüm geçici kuyruk dosyalarını silin.\n4. Spooler servisini yeniden başlatın.',
        'net stop spooler\ndel /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*"\nnet start spooler',
        'Normal'
      );

      insertKB.run(
        'Ağ Paylaşımına Erişirken \'0x80070035 Ağ Yolu Bulunamadı\' Hatası',
        'Ağ & Firewall',
        'Dosya Paylaşımı (SMB)',
        '0x80070035 Network Path Not Found',
        '\\\\192.168.1.100 veya \\\\SUNUCU-ADI şeklinde ağ paylaşımına bağlanmak istendiğinde Windows \'Ağ yolu bulunamadı\' hatası veriyor, ancak IP\'ye ping atılabiliyor.',
        'Windows 10/11 güncellemeleriyle güvenlik amaçlı \'Güvenli Olmayan Misafir Oturum Açma\' (Insecure Guest Logons) ayarının engellenmesi veya TCP/IP NetBIOS servisinin kapalı olması.',
        '1. Kayıt Defterinde LanmanWorkstation altında \'AllowInsecureGuestAuth\' DWORD değerini 1 yapın.\n2. Hizmetler (services.msc) altından \'TCP/IP NetBIOS Yardımcısı\' (lmhosts) servisini \'Otomatik\' yapıp başlatın.\n3. Ağ Bağlantıları -> IPv4 Özellikleri -> Gelişmiş -> WINS sekmesinden \'TCP/IP üzerinden NetBIOS\'u Etkinleştir\'i seçin.',
        'reg add HKLM\\SYSTEM\\CurrentControlSet\\Services\\LanmanWorkstation\\Parameters /v AllowInsecureGuestAuth /t REG_DWORD /d 1 /f\nnet start lmhosts',
        'Normal'
      );
    }
  } catch (err) {
    console.error('Knowledge Base seed hatası:', err.message);
  }

  // Ensure antivirus_licenses table exists on existing DBs
  db.exec(`
    CREATE TABLE IF NOT EXISTS antivirus_licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      brand TEXT DEFAULT 'Kaspersky',
      branch_name TEXT DEFAULT 'Merkez Ofis',
      portal_url TEXT,
      username TEXT,
      password TEXT,
      user_count INTEGER DEFAULT 1,
      license_term TEXT DEFAULT '1 Yıllık',
      license_expiry TEXT,
      license_key TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample Antivirus data if table is empty
  try {
    const avCount = db.prepare('SELECT COUNT(*) as count FROM antivirus_licenses').get().count;
    if (avCount === 0) {
      const customers = db.prepare('SELECT id, name FROM customers ORDER BY id ASC').all();
      if (customers.length > 0) {
        const insertAV = db.prepare(`
          INSERT INTO antivirus_licenses (
            customer_id, product_name, brand, branch_name, portal_url, username,
            password, user_count, license_term, license_expiry, license_key, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Customer 1 (Atlas Lojistik): Kaspersky Endpoint Security Cloud
        insertAV.run(
          customers[0].id,
          'Kaspersky Endpoint Security Cloud Plus',
          'Kaspersky',
          'Tüm Şubeler',
          'https://cloud.kaspersky.com',
          'bilgiislem@atlaslojistik.com.tr',
          'Atlas#Kasp2024!',
          25,
          '1 Yıllık',
          '28.10.2026',
          'AAAAA-BBBBB-CCCCC-DDDDD',
          'Merkez ve şubelerdeki tüm kullanıcı PC ve sanal makineler için bulut konsollu EDR koruması.'
        );

        // Customer 2 (Nova Mimarlık if exists): Sophos Central Intercept X
        // Expiry set to 07.10.2026 (8 days remaining from 29.09.2026) to test the 15-day warning beacon!
        if (customers.length > 1) {
          insertAV.run(
            customers[1].id,
            'Sophos Central Intercept X Advanced',
            'Sophos',
            'Merkez Ofis',
            'https://central.sophos.com',
            'admin@novamimarlik.com',
            'SophosNova2024!',
            10,
            '1 Yıllık',
            '07.10.2026',
            'SPHS-9941-K821-MM02',
            'CAD ve mimari render iş istasyonları fidye yazılımı (Ransomware) koruması. Lisans bitimine 8 gün kaldı (Acil uyarı testi).'
          );
        }
      }
    }
  } catch (err) {
    console.error('Antivirus seed hatası:', err.message);
  }

  // Ensure system_settings table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure mail_services and mail_accounts tables exist on existing DBs
  db.exec(`
    CREATE TABLE IF NOT EXISTS mail_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      service_name TEXT NOT NULL,
      service_type TEXT DEFAULT 'Microsoft 365',
      domain_name TEXT,
      admin_panel_url TEXT,
      admin_username TEXT,
      admin_password TEXT,
      portal_notes TEXT,
      is_exchange_or_subscription INTEGER DEFAULT 1,
      license_type TEXT,
      license_count INTEGER DEFAULT 1,
      license_start_date TEXT,
      license_expiry TEXT,
      reseller_partner TEXT,
      incoming_server TEXT,
      outgoing_server TEXT,
      dns_records_status TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mail_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      mail_service_id INTEGER REFERENCES mail_services(id) ON DELETE SET NULL,
      full_name TEXT NOT NULL,
      email_address TEXT NOT NULL,
      password TEXT,
      department TEXT,
      branch_name TEXT DEFAULT 'Merkez Ofis',
      mailbox_type TEXT DEFAULT 'Kullanıcı',
      license_type TEXT,
      quota_limit TEXT,
      phone_or_recovery TEXT,
      is_mfa_active INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Aktif',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed sample Mail Services and Accounts if table is empty
  try {
    const mailCount = db.prepare('SELECT COUNT(*) as count FROM mail_services').get().count;
    if (mailCount === 0) {
      const customers = db.prepare('SELECT id, name FROM customers ORDER BY id ASC').all();
      if (customers.length > 0) {
        const insertService = db.prepare(`
          INSERT INTO mail_services (
            customer_id, service_name, service_type, domain_name, admin_panel_url,
            admin_username, admin_password, portal_notes, is_exchange_or_subscription,
            license_type, license_count, license_start_date, license_expiry, reseller_partner,
            incoming_server, outgoing_server, dns_records_status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertAccount = db.prepare(`
          INSERT INTO mail_accounts (
            customer_id, mail_service_id, full_name, email_address, password,
            department, branch_name, mailbox_type, license_type, quota_limit,
            phone_or_recovery, is_mfa_active, status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Customer 1 (Atlas Lojistik): Microsoft 365 Business Standard & Exchange Online
        const resService1 = insertService.run(
          customers[0].id,
          'Microsoft 365 & Exchange Online Kurumsal',
          'Microsoft 365 / Exchange',
          'atlaslojistik.com.tr',
          'https://admin.microsoft.com',
          'admin@atlaslojistik.com.tr',
          'Atlas#M365!Admin2024',
          'Global Admin yetkisi. 2FA Authenticator Önder ACAR telefonunda tanımlı. Acil kurtarma kodları sistem kasasında.',
          1,
          'Microsoft 365 Business Standard',
          25,
          '15.11.2025',
          '15.11.2026',
          'Microsoft CSP - Arena Bilgisayar A.Ş.',
          'outlook.office365.com (Port: 993 SSL/TLS)',
          'smtp.office365.com (Port: 587 STARTTLS)',
          'MX: atlaslojistik-com-tr.mail.protection.outlook.com, SPF: v=spf1 include:spf.protection.outlook.com -all, DKIM: Aktif, DMARC: p=quarantine',
          'Tüm merkez ve şube personeli Exchange Online üzerinden kurumsal e-posta ve takvim senkronizasyonunu kullanmaktadır.'
        );
        const sId1 = resService1.lastInsertRowid;

        insertAccount.run(
          customers[0].id, sId1, 'Gülşen Kaya', 'gulsen.kaya@atlaslojistik.com.tr', 'Glsn#Atlas2026!',
          'Muhasebe', 'Merkez Ofis', 'Kullanıcı', 'M365 Business Standard', '50 GB',
          '+90 532 111 22 33', 1, 'Aktif', 'PC-MUH-01 kullanıcısı. Outlook 2021 ve cep telefonu kurulu.'
        );

        insertAccount.run(
          customers[0].id, sId1, 'Mert Yıldız', 'mert.yildiz@atlaslojistik.com.tr', 'Mert*Atlas2026',
          'Satış & Pazarlama', 'Merkez Ofis', 'Kullanıcı', 'M365 Business Standard', '50 GB',
          '+90 533 444 55 66', 1, 'Aktif', 'NB-SATIS-02 laptop kullanıcısı.'
        );

        insertAccount.run(
          customers[0].id, sId1, 'Hakan Demir', 'hakan.demir@atlaslojistik.com.tr', 'Hakan#Loj2026',
          'Operasyon', 'Merkez Ofis', 'Kullanıcı', 'M365 Business Standard', '50 GB',
          '+90 535 777 88 99', 1, 'Aktif', 'Operasyon Müdürü.'
        );

        insertAccount.run(
          customers[0].id, sId1, 'Muhasebe Paylaşımlı', 'muhasebe@atlaslojistik.com.tr', '(Shared Mailbox - Şifresiz)',
          'Muhasebe', 'Merkez Ofis', 'Paylaşılan (Shared)', 'Shared Mailbox (Ücretsiz)', '50 GB',
          '', 0, 'Aktif', 'Gülşen Kaya ve muhasebe ekibine Send As / Full Access yetkisi verildi.'
        );

        insertAccount.run(
          customers[0].id, sId1, 'Bursa Şube Sevkiyat', 'bursa.sevkiyat@atlaslojistik.com.tr', 'Bursa*Sevk2026',
          'Depo & Sevkiyat', 'Bursa Bölge Depo Şubesi', 'Kullanıcı', 'Exchange Online Plan 1', '50 GB',
          '+90 542 333 44 55', 1, 'Aktif', 'Bursa depo terminali ve el bilgisayarları koordinasyonu.'
        );

        // Customer 2 (Nova Mimarlık if exists): Google Workspace
        if (customers.length > 1) {
          const resService2 = insertService.run(
            customers[1].id,
            'Google Workspace Business Starter',
            'Google Workspace',
            'novamimarlik.com',
            'https://admin.google.com',
            'admin@novamimarlik.com',
            'NovaGoogle#2024!',
            'Google Admin konsolu. Süper Yönetici: Banu Çelik.',
            1,
            'Google Workspace Business Starter',
            10,
            '20.10.2025',
            '20.10.2026',
            'Google Cloud Direct Reseller',
            'imap.gmail.com (Port: 993 SSL)',
            'smtp.gmail.com (Port: 465 SSL)',
            'MX: aspmx.l.google.com, SPF: v=spf1 include:_spf.google.com ~all, DKIM: Google 2048bit Aktif',
            'Mimari çizimler ve CAD dosyaları için Google Drive kurumsal depolama ile entegre.'
          );
          const sId2 = resService2.lastInsertRowid;

          insertAccount.run(
            customers[1].id, sId2, 'Banu Çelik', 'banu.celik@novamimarlik.com', 'BanuNova#24',
            'Yönetim', 'Merkez Ofis', 'Kullanıcı', 'Workspace Starter', '30 GB',
            '+90 532 999 88 77', 1, 'Aktif', 'Ofis Yöneticisi & İmza Yetkilisi.'
          );

          insertAccount.run(
            customers[1].id, sId2, 'Proje & Tasarım Ekibi', 'proje@novamimarlik.com', 'NovaProje2026',
            'Tasarım & Mimarlık', 'Merkez Ofis', 'Kullanıcı', 'Workspace Starter', '30 GB',
            '', 0, 'Aktif', 'Ortak proje teslim ve sunum adresi.'
          );
        }
      }
    }
  } catch (err) {
    console.error('Mail seed hatası:', err.message);
  }
}
runMigrations();

// Function to seed initial sample data if database is empty
function seedSampleDataIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM customers').get();
  if (countRow.count > 0) return;

  console.log('Veritabanı boş, örnek kurumsal IT verileri yükleniyor...');

  // Customer 1: Atlas Lojistik ve Depolama A.Ş.
  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, code, contact_person, phone, email, address, external_ip, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const res1 = insertCustomer.run(
    'Atlas Lojistik A.Ş.',
    'ATLAS',
    'Serdar Aydın (Bilgi İşlem Müdürü)',
    '0216 555 44 33',
    'bilgiislem@atlaslojistik.com.tr',
    'Kartal Sanayi Bölgesi No:42, İstanbul',
    '85.105.142.66 (Türk Telekom Metro Ethernet)',
    '7/24 Sözleşmeli Destek. Mesai saatleri dışı kritik arıza bildiriminde acil müdahale.'
  );
  const cust1Id = res1.lastInsertRowid;

  // Customer 1 - Physical Server
  const insertServer = db.prepare(`
    INSERT INTO physical_servers (customer_id, server_name, brand, model, serial_number, cpu_info, ram_info, disk_info, ip_address, mac_address, management_ip, management_user, management_password, location, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const srvRes1 = insertServer.run(
    cust1Id,
    'ATLAS-SRV01',
    'Dell',
    'PowerEdge R740',
    '9X7B2K3',
    '2x Intel Xeon Gold 5218 (32 Threads, 2.30 GHz)',
    '128 GB DDR4 ECC Reg (4x 32GB)',
    'PERC H730P RAID: RAID-10 (4x 1.92TB SAS SSD Datastore) + RAID-1 (2x 480GB Boot)',
    '192.168.10.10',
    '00:1E:67:84:A1:01',
    '192.168.10.15 (iDRAC Enterprise)',
    'root',
    'P@ssw0rd!Atlas2024',
    'Sistem Odası - Kabin 1 / U14-U15',
    'Aktif',
    'VMware ESXi 7.0 U3 kurulu. UPS 3kVA bağlı.'
  );
  const physId1 = srvRes1.lastInsertRowid;

  // Customer 1 - Virtual Machines
  const insertVM = db.prepare(`
    INSERT INTO virtual_machines (customer_id, physical_server_id, vm_name, hypervisor, role_description, vcpu, ram, disk, ip_address, mac_address, os_version, os_license_key, office_version, office_license_key, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVM.run(
    cust1Id,
    physId1,
    'ATLAS-DC01',
    'VMware ESXi 7.0',
    'Domain Controller, Active Directory, DNS, DHCP',
    '4 vCPU',
    '16 GB',
    '120 GB SSD',
    '192.168.10.2',
    '00:50:56:A1:02:11',
    'Windows Server 2022 Datacenter',
    'W269N-WFGWX-YVC9B-4J6C9-T83GX',
    'N/A',
    '',
    'Aktif',
    'Birincil DC. DHCP Scope: 192.168.10.100 - 192.168.10.250'
  );

  insertVM.run(
    cust1Id,
    physId1,
    'ATLAS-SQL01',
    'VMware ESXi 7.0',
    'Logo Tiger 3 ERP & Microsoft SQL Server 2019',
    '8 vCPU',
    '64 GB',
    '500 GB NVMe (Data) + 200 GB (Log)',
    '192.168.10.5',
    '00:50:56:A1:05:22',
    'Windows Server 2022 Standard',
    'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    'N/A',
    '',
    'Aktif',
    'SQL SA kullanıcısı ve Logo ERP DB leri bu makinada.'
  );

  insertVM.run(
    cust1Id,
    physId1,
    'ATLAS-RDS01',
    'VMware ESXi 7.0',
    'Uzak Masaüstü Sunucusu (Terminal Server)',
    '6 vCPU',
    '32 GB',
    '250 GB SSD',
    '192.168.10.8',
    '00:50:56:A1:08:33',
    'Windows Server 2019 Standard',
    'NRG8B-VKK3Q-CXVCJ-9G2XF-6Q84J',
    'Office 2021 LTSC Standard (KMS/MAK)',
    'FXYTK-NJ28C-GB6KV-3TV67-J88C3',
    'Aktif',
    '25 Kullanıcı CAL tanımlı.'
  );

  // Customer 1 - User Computers
  const insertPC = db.prepare(`
    INSERT INTO user_computers (customer_id, computer_name, assigned_user, department, device_type, brand, model, serial_number, hardware_specs, os_version, os_license_key, office_version, office_license_key, ethernet_ip, ethernet_mac, wifi_ip, wifi_mac, remote_access_id, antivirus, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPC.run(
    cust1Id,
    'PC-MUH-01',
    'Gülşen Kaya',
    'Muhasebe',
    'Masaüstü',
    'Lenovo',
    'ThinkCentre M70q Gen 3',
    'MJ0DK198',
    'Intel Core i5-12400T / 16GB DDR4 / 512GB NVMe SSD',
    'Windows 11 Pro 23H2',
    'VK7JG-NPHTM-C97JM-9MPGT-3V66T (OEM)',
    'Microsoft Office 2021 Home & Business',
    'XHQ8N-C3MCJ-RQXB6-WCHYG-C9WKB',
    '192.168.10.105',
    '54:EE:75:A8:12:01',
    '192.168.10.106',
    '7C:10:C9:DF:22:14',
    'AnyDesk: 849 221 002',
    'Kaspersky Endpoint Security Cloud',
    'E-fatura portalı ve Logo Client kurulu.'
  );

  insertPC.run(
    cust1Id,
    'NB-SATIS-02',
    'Mert Yıldız',
    'Satış & Pazarlama',
    'Laptop',
    'Dell',
    'Latitude 5430',
    '8HJK912',
    'Intel Core i7-1265U / 16GB DDR4 / 512GB SSD',
    'Windows 11 Pro',
    'W269N-WFGWX-YVC9B-4J6C9-T83GX (Digital)',
    'Microsoft 365 İş Standart',
    'Lisanslı E-posta: mert@atlaslojistik.com.tr',
    '192.168.10.112',
    'F8:DB:88:31:89:AB',
    '192.168.10.113',
    'DC:F5:05:78:E1:92',
    'AnyDesk: 612 994 301',
    'Kaspersky Endpoint Security Cloud',
    'Sık sık seyahatte. FortiClient SSL-VPN tanımlı.'
  );

  // Customer 1 - Firewall
  const insertFirewall = db.prepare(`
    INSERT INTO firewalls (customer_id, device_name, brand, model, management_ip, username, password, external_ip, firmware_version, license_expiry, ssl_vpn_portal, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertFirewall.run(
    cust1Id,
    'Ana Güvenlik Duvarı',
    'Fortinet',
    'FortiGate 60F',
    'https://192.168.10.1:8443',
    'admin',
    'Atlas#Forti!2024$',
    '85.105.142.66',
    'FortiOS v7.4.4 build2662',
    '15.11.2026',
    'https://85.105.142.66:10443',
    'WAN1: Metro Ethernet 50Mbps Simetrik. Port forward: 192.168.10.8:3389 (VPN üzerinden açık).'
  );

  // Customer 1 - Backup Unit
  const insertBackup = db.prepare(`
    INSERT INTO backup_units (customer_id, device_name, brand, model, management_ip, username, password, capacity, backup_software, backup_schedule, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBackup.run(
    cust1Id,
    'Yedekleme NAS Ünitesi',
    'Synology',
    'DiskStation DS923+',
    'http://192.168.10.200:5000',
    'nasadmin',
    'SynoAtlas@NAS2024!',
    '4x 8TB Seagate IronWolf - Synology Hybrid RAID (SHR) ~ 21.8 TB Kullanılabilir',
    'Veeam Backup & Replication v12 + Synology Active Backup for Business',
    'Her gün 21:00 VM tam yedeği, SQL her saat başı diff yedek.',
    'Sistem odasında ayrı küçük UPS ile korunuyor. Offsite yedek için harici disk dönüşümlü takılıyor.'
  );

  // Customer 2: Nova Mimarlık ve Tasarım Ltd. Şti.
  const res2 = insertCustomer.run(
    'Nova Mimarlık Ltd. Şti.',
    'NOVA',
    'Banu Çelik (Ofis Yöneticisi)',
    '0212 284 10 20',
    'ofis@novamimarlik.com',
    'Levent Mah. Cömert Sk. No:8 Beşiktaş / İstanbul',
    '212.156.88.42 (Turkcell Superonline Fiber)',
    'Mesai saatleri hafta içi 09:00 - 18:00.'
  );
  const cust2Id = res2.lastInsertRowid;

  insertServer.run(
    cust2Id,
    'NOVA-STORAGE01',
    'HP (HPE)',
    'ProLiant DL20 Gen10',
    'CZ29180XZ1',
    'Intel Xeon E-2236 3.40GHz',
    '32 GB ECC DDR4',
    'Smart Array E208i: 2x 1TB SSD (OS) + 4x 4TB SATA (Proje Arşivi)',
    '192.168.1.10',
    '94:57:A5:6B:44:11',
    '192.168.1.15 (iLO 5)',
    'Administrator',
    'HpeNova!2024*ilo',
    'Sistem Kabini Raf 2',
    'Aktif',
    'Autocad ve 3ds Max arşivleri paylaşımı için File Server.'
  );

  insertFirewall.run(
    cust2Id,
    'Ofis Firewall',
    'Sophos',
    'XGS 116',
    'https://192.168.1.1:4444',
    'admin',
    'SophosNova#2024',
    '212.156.88.42',
    'SFOS 20.0.1 MR-1',
    '20.06.2025',
    'https://212.156.88.42:8443',
    'Sophos Connect IPsec ve SSL VPN kullanıcıları aktif.'
  );

  insertBackup.run(
    cust2Id,
    'Yedek QNAP',
    'QNAP',
    'TS-453E',
    'http://192.168.1.20:8080',
    'admin',
    'QnapNova2024!',
    '4x 4TB WD Red Plus - RAID 5 (10.9 TB)',
    'QNAP Hybrid Backup Sync (HBS 3)',
    'Hafta içi her akşam 20:00',
    'CAD ve 3D Render projeleri doğrudan buraya yedeklenir.'
  );

  console.log('Örnek veriler başarıyla yüklendi.');
}

function seedInternetLinesIfEmpty() {
  const lineCount = db.prepare('SELECT COUNT(*) as count FROM internet_lines').get();
  if (lineCount.count > 0) return;

  const customers = db.prepare('SELECT id, name FROM customers').all();
  if (customers.length === 0) return;

  const insertLine = db.prepare(`
    INSERT INTO internet_lines (
      customer_id, branch_name, line_type, isp, circuit_number, is_primary,
      static_ip, subnet_mask, gateway, dns_servers, pppoe_user, pppoe_password,
      modem_brand_model, modem_ip, modem_user, modem_password, speed_info, location_address, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const cust1 = customers[0]; // Atlas
  if (cust1) {
    // 1. Line: Merkez Ofis Metro Ethernet Fiber
    insertLine.run(
      cust1.id,
      'Merkez Ofis (Kartal)',
      'Fiber / Metro Ethernet',
      'Türk Telekom Metro Ethernet',
      'TT-METRO-41289',
      1,
      '85.105.142.66',
      '255.255.255.248 (/29)',
      '85.105.142.65',
      '195.175.39.39, 195.175.39.40',
      '',
      '',
      'Cisco ME3400 Switch (Sonlandırma)',
      '192.168.10.1',
      '',
      '',
      '50 Mbps Simetrik Metro Ethernet',
      'Kartal Sanayi Bölgesi No:42, İstanbul',
      'Ana internet ve sunucu yayın hattı. /29 bloğunda 5 kullanılabilir statik IP var.'
    );

    // 2. Line: Merkez Ofis VDSL Yedek Hat
    insertLine.run(
      cust1.id,
      'Merkez Ofis (Yedek Hat)',
      'VDSL / ADSL',
      'Türk Telekom VDSL',
      '1829019283',
      0,
      '88.241.55.19',
      '255.255.255.255',
      '88.241.55.1',
      '195.175.39.39, 8.8.8.8',
      'atlaslojistik@ttnet',
      'AtlasVdsl!2024',
      'DrayTek Vigor 2865',
      '192.168.2.1:8080',
      'admin',
      'Draytek@Atlas2024',
      '50/8 Mbps VDSL',
      'Kartal Sanayi Bölgesi No:42, İstanbul',
      'FortiGate WAN2 portuna bağlı. Otomatik Failover (Yedek Devreye Girme) aktif.'
    );

    // 3. Line: Gebze Lojistik Depo Şubesi
    insertLine.run(
      cust1.id,
      'Gebze Lojistik Depo Şubesi',
      'VDSL / ADSL',
      'Turkcell Superonline VDSL',
      'SOL-VDSL-55102',
      1,
      '176.42.88.19',
      '255.255.255.255',
      '176.42.88.1',
      '212.156.4.4, 8.8.8.8',
      'gebzedepo@superonline',
      'DepoSuper!2024',
      'Zyxel VMG3625-T50B',
      'http://192.168.1.1',
      'admin',
      'ZyxelDepo#24',
      '100/20 Mbps VDSL',
      'Gebze Organize Sanayi Bölgesi 4. Cadde No:12 Kocaeli',
      'IPsec VPN ile Kartal Merkez Ofise bağlı. El terminalleri ve barkod sistemleri çalışıyor.'
    );
  }

  const cust2 = customers[1]; // Nova
  if (cust2) {
    // 1. Line: Levent Merkez Fiber
    insertLine.run(
      cust2.id,
      'Levent Merkez Ofis',
      'Fiber / Metro Ethernet',
      'Turkcell Superonline Fiber',
      'SOL-FBR-9902',
      1,
      '212.156.88.42',
      '255.255.255.240 (/28)',
      '212.156.88.41',
      '212.156.4.4, 8.8.8.8',
      '',
      '',
      'Huawei HG8245X6 (Köprü Modu)',
      '192.168.1.1:4444',
      '',
      '',
      '100 Mbps Simetrik Kurumsal Fiber',
      'Levent Mah. Cömert Sk. No:8 Beşiktaş / İstanbul',
      'Sophos XGS WAN portuna doğrudan bağlı statik blok.'
    );

    // 2. Line: Kadıköy Tasarım Şubesi
    insertLine.run(
      cust2.id,
      'Kadıköy Tasarım Atölyesi',
      'VDSL / ADSL',
      'Türk Telekom VDSL',
      'TT-VDSL-3381',
      1,
      '88.241.112.95',
      '255.255.255.255',
      '88.241.112.1',
      '195.175.39.39, 1.1.1.1',
      'novakadikoy@ttnet',
      'NovaTasarim2024',
      'Keenetic Hero DSL',
      'http://192.168.1.1',
      'admin',
      'KeeneticNova!24',
      '75/15 Mbps VDSL',
      'Moda Cad. No:15/3 Kadıköy / İstanbul',
      'Şube tasarımcıları SSL-VPN ile Levent merkezdeki NAS arşivine erişir.'
    );
  }

  console.log('Örnek şube ve internet hatları başarıyla yüklendi.');
}

function seedUsersIfEmpty() {
  try {
    const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get('onder.cihan.acar@gmail.com', 'onder.cihan.acar@gmail.com');
    if (!user) {
      db.prepare(`
        INSERT INTO users (username, email, full_name, password, role, totp_enabled)
        VALUES (?, ?, ?, ?, ?, 0)
      `).run('onder.cihan.acar@gmail.com', 'onder.cihan.acar@gmail.com', 'Önder Cihan ACAR', '2213', 'admin');
      console.log('Varsayılan yönetici kullanıcısı oluşturuldu: onder.cihan.acar@gmail.com (Parola: 2213)');
    } else {
      // Ensure password is 2213 as requested
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run('2213', user.id);
    }

    // Ensure fallback admin account exists for convenience
    const adminUser = db.prepare('SELECT * FROM users WHERE LOWER(username) = ?').get('admin');
    if (!adminUser) {
      db.prepare(`
        INSERT INTO users (username, email, full_name, password, role, totp_enabled)
        VALUES (?, ?, ?, ?, ?, 0)
      `).run('admin', 'admin@omniflow.local', 'Sistem Yöneticisi', '2213', 'admin');
    }
  } catch (err) {
    console.error('seedUsersIfEmpty error:', err);
  }
}

// Only seed dummy sample data if explicitly requested (clean install by default)
if (process.env.SEED_SAMPLE_DATA === 'true') {
  seedSampleDataIfEmpty();
  seedInternetLinesIfEmpty();
}
seedUsersIfEmpty();

module.exports = {
  db,
  seedSampleDataIfEmpty,
  seedUsersIfEmpty
};
