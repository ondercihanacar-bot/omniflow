import * as XLSX from 'xlsx';

export function exportCustomerToExcel(customer, branchFilter = 'ALL') {
  if (!customer) return;

  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);

  const isAll = !branchFilter || branchFilter === 'ALL';
  const lines = isAll ? (customer.internet_lines || []) : (customer.internet_lines || []).filter(l => (l.branch_name || 'Merkez Ofis') === branchFilter);
  const servers = isAll ? (customer.physical_servers || []) : (customer.physical_servers || []).filter(s => (s.branch_name || 'Merkez Ofis') === branchFilter);
  const serverIds = new Set(servers.map(s => s.id));
  const vms = isAll ? (customer.virtual_machines || []) : (customer.virtual_machines || []).filter(v => v.physical_server_id && serverIds.has(v.physical_server_id));
  const pcs = isAll ? (customer.user_computers || []) : (customer.user_computers || []).filter(p => (p.branch_name || 'Merkez Ofis') === branchFilter);
  const firewalls = isAll ? (customer.firewalls || []) : (customer.firewalls || []).filter(f => (f.branch_name || 'Merkez Ofis') === branchFilter);
  const antiviruses = isAll ? (customer.antivirus_licenses || []) : (customer.antivirus_licenses || []).filter(a => (a.branch_name || 'Merkez Ofis') === branchFilter);
  const backups = isAll ? (customer.backup_units || []) : (customer.backup_units || []).filter(b => (b.branch_name || 'Merkez Ofis') === branchFilter);
  const wifiControllers = isAll ? (customer.wifi_controllers || []) : (customer.wifi_controllers || []).filter(c => (c.branch_name || 'Merkez Ofis') === branchFilter);
  const wifiAPs = isAll ? (customer.wifi_access_points || []) : (customer.wifi_access_points || []).filter(a => (a.branch_name || 'Merkez Ofis') === branchFilter);
  const wifiNetworks = isAll ? (customer.wifi_networks || []) : (customer.wifi_networks || []).filter(n => n.branch_name === 'Tüm Şubeler' || (n.branch_name || 'Merkez Ofis') === branchFilter);
  const mailServices = customer.mail_services || [];
  const mailAccounts = isAll ? (customer.mail_accounts || []) : (customer.mail_accounts || []).filter(a => (a.branch_name || 'Merkez Ofis') === branchFilter);

  // 1. Sheet: Genel Bilgiler
  const generalData = [
    ['MÜŞTERİ BİLGİ FORMU & IT ENVANTER RAPORU', ''],
    ['Rapor Tarihi', new Date().toLocaleDateString('tr-TR')],
    ['Rapor Kapsamı', isAll ? 'Tüm Firma (Tüm Şubeler & Merkez)' : `Şube: ${branchFilter}`],
    ['', ''],
    ['Şirket / Müşteri Adı', customer.name || ''],
    ['Kısa Kod', customer.code || ''],
    ['Dış Statik IP Adresi (WAN)', customer.external_ip || ''],
    ['İlgili Kişi / Yetkili', customer.contact_person || ''],
    ['Telefon', customer.phone || ''],
    ['E-posta', customer.email || ''],
    ['Adres / Lokasyon', customer.address || ''],
    ['Notlar & Sözleşme', customer.notes || ''],
    ['', ''],
    ['ENVANTER ÖZETİ (SEÇİLİ KAPSAM)', 'ADET'],
    ['Şube / İnternet Hattı Sayısı', lines.length],
    ['Fiziki Sunucu Sayısı', servers.length],
    ['Sanal Makine (VM) Sayısı', vms.length],
    ['Kullanıcı Bilgisayarı Sayısı', pcs.length],
    ['Firewall Cihazı Sayısı', firewalls.length],
    ['Antivirüs Lisansı / Paketi Sayısı', antiviruses.length],
    ['Yedekleme Ünitesi (NAS) Sayısı', backups.length],
    ['Wi-Fi Kontrolcü Sayısı', wifiControllers.length],
    ['Wi-Fi Erişim Noktası (AP) Sayısı', wifiAPs.length],
    ['Yayınlanan Wi-Fi SSID Sayısı', wifiNetworks.length],
    ['Kurumsal Mail Servisi / Panel Sayısı', mailServices.length],
    ['Kullanıcı E-Posta Hesabı Sayısı', mailAccounts.length]
  ];
  const wsGeneral = XLSX.utils.aoa_to_sheet(generalData);
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'Genel Bilgiler');

  // 1.5. Sheet: Şubeler & İnternet Hatları
  const lineHeaders = [
    'Şube / Lokasyon Adı',
    'Hat Türü',
    'Hat Rolü',
    'İSS (Servis Sağlayıcı)',
    'Devre / Hizmet No',
    'Dış Statik IP (WAN)',
    'Alt Ağ Maskesi (Subnet Mask)',
    'Ağ Geçidi (Gateway)',
    'DNS Sunucuları',
    'PPPoE Kullanıcı Adı',
    'PPPoE Parolası',
    'Modem Marka & Model',
    'Modem Arayüz IP & Port',
    'Modem Kullanıcı',
    'Modem Parola',
    'Hat Hızı / Paket',
    'Şube Adresi',
    'Notlar'
  ];
  const lineRows = lines.map(l => [
    l.branch_name || '',
    l.line_type || '',
    l.is_primary ? 'Ana Hat' : 'Yedek Hat',
    l.isp || '',
    l.circuit_number || '',
    l.static_ip || '',
    l.subnet_mask || '',
    l.gateway || '',
    l.dns_servers || '',
    l.pppoe_user || '',
    l.pppoe_password || '',
    l.modem_brand_model || '',
    l.modem_ip || '',
    l.modem_user || '',
    l.modem_password || '',
    l.speed_info || '',
    l.location_address || '',
    l.notes || ''
  ]);
  const wsLines = XLSX.utils.aoa_to_sheet([lineHeaders, ...lineRows]);
  XLSX.utils.book_append_sheet(wb, wsLines, 'Şubeler & Hatlar');

  // 2. Sheet: Fiziki Sunucular
  const serverHeaders = [
    'Şube / Lokasyon',
    'Sunucu Adı (Hostname)',
    'Durum',
    'Marka',
    'Model',
    'Seri No / Service Tag',
    'İşlemci (CPU)',
    'RAM',
    'Disk & RAID Yapısı',
    'Sunucu IP Adresi',
    'MAC Adresi',
    'Local Admin Kullanıcı',
    'Local Admin Parola',
    'Yönetim IP (iDRAC/iLO)',
    'Yönetim Kullanıcı',
    'Yönetim Parola',
    'Lokasyon / Kabin',
    'Notlar'
  ];
  const serverRows = servers.map(s => [
    s.branch_name || 'Merkez Ofis',
    s.server_name || '',
    s.status || '',
    s.brand || '',
    s.model || '',
    s.serial_number || '',
    s.cpu_info || '',
    s.ram_info || '',
    s.disk_info || '',
    s.ip_address || '',
    s.mac_address || '',
    s.local_admin_user || '',
    s.local_admin_password || '',
    s.management_ip || '',
    s.management_user || '',
    s.management_password || '',
    s.location || '',
    s.notes || ''
  ]);
  const wsServers = XLSX.utils.aoa_to_sheet([serverHeaders, ...serverRows]);
  XLSX.utils.book_append_sheet(wb, wsServers, 'Fiziki Sunucular');

  // 3. Sheet: Sanal Makineler
  const vmHeaders = [
    'Sanal Makine Adı',
    'Rol / Görev',
    'Bağlı Olduğu Fiziki Server',
    'Sanallaştırıcı',
    'vCPU',
    'RAM',
    'Disk',
    'IP Adresi',
    'MAC Adresi',
    'Local Admin Kullanıcı',
    'Local Admin Parola',
    'Windows Sürümü',
    'Windows Lisans Key',
    'Office Sürümü',
    'Office Lisans Key',
    'Durum',
    'Notlar'
  ];
  const vmRows = vms.map(v => [
    v.vm_name || '',
    v.role_description || '',
    v.physical_server_name || '',
    v.hypervisor || '',
    v.vcpu || '',
    v.ram || '',
    v.disk || '',
    v.ip_address || '',
    v.mac_address || '',
    v.local_admin_user || '',
    v.local_admin_password || '',
    v.os_version || '',
    v.os_license_key || '',
    v.office_version || '',
    v.office_license_key || '',
    v.status || '',
    v.notes || ''
  ]);
  const wsVMs = XLSX.utils.aoa_to_sheet([vmHeaders, ...vmRows]);
  XLSX.utils.book_append_sheet(wb, wsVMs, 'Sanal Makineler');

  // 4. Sheet: Departman Bazında Kullanıcı Bilgisayarları
  const pcHeaders = [
    'Şube / Lokasyon',
    'Departman',
    'Zimmetli Kullanıcı',
    'Bilgisayar Adı (Hostname)',
    'Cihaz Türü',
    'Marka',
    'Model',
    'Seri No',
    'Donanım Özellikleri',
    'Ethernet IP',
    'Ethernet MAC',
    'Wi-Fi IP',
    'Wi-Fi MAC',
    'Local Admin Kullanıcı',
    'Local Admin Parola',
    'Windows Sürümü',
    'Windows Lisans Key',
    'Office Sürümü',
    'Office Lisans Key',
    'Uzak Destek (AnyDesk/TV)',
    'Antivirüs / EDR',
    'Notlar'
  ];
  // Sort by branch then department then user name
  const sortedPCs = [...pcs].sort((a, b) => {
    const branchA = a.branch_name || 'Merkez Ofis';
    const branchB = b.branch_name || 'Merkez Ofis';
    if (branchA !== branchB) return branchA.localeCompare(branchB);
    const deptA = a.department || 'Genel';
    const deptB = b.department || 'Genel';
    if (deptA !== deptB) return deptA.localeCompare(deptB);
    return (a.assigned_user || '').localeCompare(b.assigned_user || '');
  });

  const pcRows = sortedPCs.map(p => [
    p.branch_name || 'Merkez Ofis',
    p.department || 'Belirtilmedi',
    p.assigned_user || '',
    p.computer_name || '',
    p.device_type || '',
    p.brand || '',
    p.model || '',
    p.serial_number || '',
    p.hardware_specs || '',
    p.ethernet_ip || '',
    p.ethernet_mac || '',
    p.wifi_ip || '',
    p.wifi_mac || '',
    p.local_admin_user || '',
    p.local_admin_password || '',
    p.os_version || '',
    p.os_license_key || '',
    p.office_version || '',
    p.office_license_key || '',
    p.remote_access_id || '',
    p.antivirus || '',
    p.notes || ''
  ]);
  const wsPCs = XLSX.utils.aoa_to_sheet([pcHeaders, ...pcRows]);
  XLSX.utils.book_append_sheet(wb, wsPCs, 'Kullanıcı Bilgisayarları');

  // 5. Sheet: Firewall
  const fwHeaders = [
    'Şube / Lokasyon',
    'Cihaz Tanımı',
    'Marka',
    'Model',
    'Arayüz IP & Port',
    'Kullanıcı Adı',
    'Parola',
    'Cihaz Dış IP (WAN)',
    'Firmware Sürümü',
    'Lisans Bitiş Tarihi',
    'SSL VPN Portalı',
    'Notlar'
  ];
  const fwRows = firewalls.map(f => [
    f.branch_name || 'Merkez Ofis',
    f.device_name || '',
    f.brand || '',
    f.model || '',
    f.management_ip || '',
    f.username || '',
    f.password || '',
    f.external_ip || '',
    f.firmware_version || '',
    f.license_expiry || '',
    f.ssl_vpn_portal || '',
    f.notes || ''
  ]);
  const wsFW = XLSX.utils.aoa_to_sheet([fwHeaders, ...fwRows]);
  XLSX.utils.book_append_sheet(wb, wsFW, 'Firewall & Ağ');

  // 5.5 Sheet: Antivirüs Lisansları
  const avHeaders = [
    'Şube / Lokasyon',
    'Ürün Adı',
    'Marka / Güvenlik Sağlayıcı',
    'Yönetim Paneli (URL)',
    'Kullanıcı Adı / Mail',
    'Parola',
    'Kullanıcı / Lisans Sayısı',
    'Lisans Süresi',
    'Lisans Bitiş Tarihi',
    'Lisans Anahtarı (Key)',
    'Notlar'
  ];
  const avRows = antiviruses.map(a => [
    a.branch_name || 'Merkez Ofis',
    a.product_name || '',
    a.brand || '',
    a.portal_url || '',
    a.username || '',
    a.password || '',
    a.user_count ? `${a.user_count} Kullanıcı` : '',
    a.license_term || '',
    a.license_expiry || '',
    a.license_key || '',
    a.notes || ''
  ]);
  const wsAV = XLSX.utils.aoa_to_sheet([avHeaders, ...avRows]);
  XLSX.utils.book_append_sheet(wb, wsAV, 'Antivirüs Lisansları');

  // 6. Sheet: Yedekleme Üniteleri
  const backupHeaders = [
    'Şube / Lokasyon',
    'Cihaz Tanımı',
    'Kabin / Konum',
    'Marka',
    'Model',
    'Arayüz IP & Port',
    'Kullanıcı Adı',
    'Parola',
    'Depolama Kapasitesi & RAID',
    'Yedekleme Yazılımı',
    'Yedekleme Periyodu',
    'Notlar'
  ];
  const backupRows = backups.map(b => [
    b.branch_name || 'Merkez Ofis',
    b.device_name || '',
    b.location || '',
    b.brand || '',
    b.model || '',
    b.management_ip || '',
    b.username || '',
    b.password || '',
    b.capacity || '',
    b.backup_software || '',
    b.backup_schedule || '',
    b.notes || ''
  ]);
  const wsBackup = XLSX.utils.aoa_to_sheet([backupHeaders, ...backupRows]);
  XLSX.utils.book_append_sheet(wb, wsBackup, 'Yedekleme & NAS');

  // 7. Sheet: Wi-Fi Kontrolcüleri & SSID Yayınları
  const wifiCtrlHeaders = [
    'Kontrolcü / Panel Adı',
    'Şube / Lokasyon',
    'Türü (Donanım/Yazılım/Bulut)',
    'Arayüz IP / URL',
    'Hesap E-postası',
    'Kullanıcı Adı',
    'Parola',
    'Yazılım / OS Sürümü',
    'Notlar'
  ];
  const wifiCtrlRows = wifiControllers.map(c => [
    c.controller_name || '',
    c.branch_name || 'Merkez Ofis',
    c.controller_type || '',
    c.management_ip || '',
    c.email || '',
    c.username || '',
    c.password || '',
    c.version || '',
    c.notes || ''
  ]);

  const wifiNetHeaders = [
    'SSID (Ağ Adı)',
    'Yayın Kapsamı / Şube',
    'Wi-Fi Parolası',
    'Güvenlik Protokolü',
    'VLAN ID / Ağ',
    'Frekans Bandı',
    'Misafir Ağı / İzolasyon',
    'Notlar'
  ];
  const wifiNetRows = wifiNetworks.map(n => [
    n.ssid || '',
    n.branch_name || 'Tüm Şubeler',
    n.password || '',
    n.security_type || '',
    n.vlan_id || '',
    n.band || '',
    n.is_guest ? 'Evet (İzole)' : 'Hayır',
    n.notes || ''
  ]);

  const wsWifiNetworks = XLSX.utils.aoa_to_sheet([
    ['WIFI KONTROL PANELLERİ (UNIFI / OMADA)'],
    wifiCtrlHeaders,
    ...wifiCtrlRows,
    [''],
    ['YAYINLANAN WIFI AĞLARI & PAROLALARI (SSID)'],
    wifiNetHeaders,
    ...wifiNetRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsWifiNetworks, 'Wi-Fi & Kontrolcü');

  // 8. Sheet: Wi-Fi Erişim Noktaları (AP'ler)
  const apHeaders = [
    'Cihaz (AP) Adı',
    'Şube / Lokasyon',
    'Marka',
    'Model',
    'IP Adresi',
    'MAC Adresi',
    'Bulunduğu Konum / Yer',
    'Bağlı Kontrolcü',
    'Çalışma Durumu',
    'Notlar / Port'
  ];
  const apRows = wifiAPs.map(a => [
    a.ap_name || '',
    a.branch_name || 'Merkez Ofis',
    a.brand || '',
    a.model || '',
    a.ip_address || '',
    a.mac_address || '',
    a.location || '',
    a.controller_name || 'Bağımsız AP',
    a.status || 'Aktif',
    a.notes || ''
  ]);
  const wsAPs = XLSX.utils.aoa_to_sheet([apHeaders, ...apRows]);
  XLSX.utils.book_append_sheet(wb, wsAPs, 'Wi-Fi Cihazları (AP)');

  // 9. Sheet: Kurumsal Mail & Exchange
  const mailSrvHeaders = [
    'Servis / Panel Adı',
    'Servis Türü',
    'Alan Adı (Domain)',
    'Panel Giriş URL',
    'Admin Kullanıcı Adı',
    'Admin Parolası',
    'Lisans Planı (Exchange/M365)',
    'Toplam Kontenjan',
    'Lisans Bitiş / Yenileme',
    'İş Ortağı / Bayi (Reseller)',
    'Gelen Sunucu (IMAP)',
    'Giden Sunucu (SMTP)',
    'DNS Kayıt Notları'
  ];

  const mailSrvRows = mailServices.map(s => [
    s.service_name || '',
    s.service_type || '',
    s.domain_name || '',
    s.admin_panel_url || '',
    s.admin_username || '',
    s.admin_password || '',
    s.license_type || '',
    s.license_count || 1,
    s.license_expiry || 'Süresiz',
    s.reseller_partner || '',
    s.incoming_server || '',
    s.outgoing_server || '',
    s.dns_records_status || ''
  ]);

  const mailAccHeaders = [
    'Kullanıcı Adı Soyadı',
    'E-Posta Adresi',
    'E-Posta Parolası',
    'Departman',
    'Şube / Lokasyon',
    'Posta Kutusu Türü',
    'Kullanıcı Lisansı',
    'Kota Limiti',
    '2FA / MFA Güvenliği',
    'Hesap Durumu',
    'Telefon / İletişim',
    'Zimmet & Notlar'
  ];

  const mailAccRows = mailAccounts.map(a => [
    a.full_name || '',
    a.email_address || '',
    a.password || '',
    a.department || 'Genel',
    a.branch_name || 'Merkez Ofis',
    a.mailbox_type || 'Kullanıcı',
    a.license_type || '',
    a.quota_limit || '50 GB',
    a.is_mfa_active ? 'Aktif (2FA)' : 'Kapalı',
    a.status || 'Aktif',
    a.phone_or_recovery || '',
    a.notes || ''
  ]);

  const wsMail = XLSX.utils.aoa_to_sheet([
    ['KURUMSAL MAIL PANELLERİ & LİSANS TAKİBİ (EXCHANGE / M365)'],
    mailSrvHeaders,
    ...mailSrvRows,
    [''],
    ['KULLANICI E-POSTA HESAPLARI & PAROLALARI'],
    mailAccHeaders,
    ...mailAccRows
  ]);
  XLSX.utils.book_append_sheet(wb, wsMail, 'Kurumsal Mail');

  // Generate filename
  const cleanName = (customer.name || 'Musteri').replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, '_');
  const branchSuffix = isAll ? '' : `_${branchFilter.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, '_')}`;
  const filename = `${customer.code ? customer.code + '_' : ''}${cleanName}${branchSuffix}_IT_Envanter_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}
