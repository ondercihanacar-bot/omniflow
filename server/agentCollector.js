// OMNIFlow Agent Collector Generator & Handler
// Generates personalized PowerShell scripts and handles computer & server registration

function generateCollectorScript({ customerId, customerName, branchName, serverUrl, targetType = 'computer' }) {
  const safeCustomerName = (customerName || 'Müşteri').replace(/["`$]/g, '');
  const safeBranch = (branchName || 'Merkez Ofis').replace(/["`$]/g, '');
  const safeServerUrl = serverUrl.replace(/\/+$/, '');
  const isServer = targetType === 'server';

  if (isServer) {
    return `# OMNIFlow PowerShell Server Hardware & Infrastructure Collector Agent
# Customer: ${safeCustomerName} (ID: ${customerId})
# Branch: ${safeBranch}
# Target: Fiziki Sunucu (Physical Server)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
try { $Host.UI.RawUI.WindowTitle = "OMNIFlow Sunucu Toplayıcı - ${safeCustomerName}" } catch {}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ⚡ OMNIFlow Otomatik Fiziki Sunucu Toplayıcı" -ForegroundColor Yellow
Write-Host "   🏢 Müşteri : ${safeCustomerName}" -ForegroundColor Green
Write-Host "   📍 Şube    : ${safeBranch}" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/5] 🔍 Sunucu kimliği ve temel bilgiler taranıyor..." -ForegroundColor Gray

$compName = $env:COMPUTERNAME

$cs = Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue
$brand = if ($cs.Manufacturer) { $cs.Manufacturer.Trim() } else { "Dell / OEM Server" }
$model = if ($cs.Model) { $cs.Model.Trim() } else { "PowerEdge / Rack Server" }

# Serial Number / Service Tag
$bios = Get-CimInstance Win32_BIOS -ErrorAction SilentlyContinue
$serial = if ($bios.SerialNumber) { $bios.SerialNumber.Trim() } else { "" }

Write-Host "[2/5] ⚙️ İşlemci (CPU Sockets & Cores) taranıyor..." -ForegroundColor Gray
$cpus = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue
$cpuCount = ($cpus | Measure-Object).Count
$firstCpu = ($cpus | Select-Object -First 1)
$cpuModel = if ($firstCpu.Name) { $firstCpu.Name.Trim() } else { "Intel(R) Xeon(R)" }
$cpuCores = if ($firstCpu.NumberOfCores) { $firstCpu.NumberOfCores * (if ($cpuCount -gt 0) { $cpuCount } else { 1 }) } else { 0 }
$cpuInfo = if ($cpuCount -gt 1) { "$cpuCount x $cpuModel ($cpuCores Çekirdek)" } elseif ($cpuCores -gt 0) { "$cpuModel ($cpuCores Çekirdek)" } else { $cpuModel }

Write-Host "[3/5] 🧠 RAM ve Depolama (Diskler / RAID) taranıyor..." -ForegroundColor Gray
$ramBytes = (Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue | Measure-Object -Property Capacity -Sum).Sum
$ramGB = if ($ramBytes -gt 0) { [math]::Round($ramBytes / 1GB) } else { 0 }
$ramInfo = if ($ramGB -gt 0) { "$ramGB GB RAM" } else { "32 GB RAM" }

$disks = Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue | ForEach-Object {
    $sizeGB = [math]::Round($_.Size / 1GB)
    "$($_.Model) ($sizeGB GB)"
}
$diskInfo = if ($disks) { ($disks -join " + ") } else { "RAID Disk Dizisi" }

Write-Host "[4/5] 🌐 Ağ adaptörleri ve IP/MAC adresleri okunuyor..." -ForegroundColor Gray
$ethIp = ""
$ethMac = ""
try {
    $adapters = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" -ErrorAction SilentlyContinue
    foreach ($a in $adapters) {
        $ipv4 = ($a.IPAddress | Where-Object { $_ -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$' } | Select-Object -First 1)
        if ($ipv4 -and -not $ethIp) {
            $ethIp = $ipv4
            $ethMac = $a.MACAddress
        }
    }
} catch {}

$osObj = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
$osVersion = if ($osObj.Caption) { $osObj.Caption.Trim() } else { "Windows Server" }
$notes = "İşletim Sistemi: $osVersion | Otomatik Toplayıcı ile kaydedildi ($(Get-Date -Format 'dd.MM.yyyy HH:mm'))"

Write-Host "[5/5] 🚀 Sunucu verileri OMNIFlow bulut sunucusuna gönderiliyor..." -ForegroundColor Gray

$data = @{
    customer_id   = ${customerId}
    branch_name   = "${safeBranch}"
    server_name   = $compName
    brand         = $brand
    model         = $model
    serial_number = $serial
    cpu_info      = $cpuInfo
    ram_info      = $ramInfo
    disk_info     = $diskInfo
    ip_address    = $ethIp
    mac_address   = $ethMac
    location      = "Sistem Odası / Rack Kabinet"
    status        = "Aktif"
    notes         = $notes
}

$jsonBody = $data | ConvertTo-Json -Compress
$apiUrl = "${safeServerUrl}/api/agent/register-server"

try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11 -bor [System.Net.SecurityProtocolType]::Tls

    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody)) -ContentType "application/json; charset=utf-8" -TimeoutSec 15

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   ✅ FİZİKİ SUNUCU BAŞARIYLA KAYDEDİLDİ!" -ForegroundColor Green
    Write-Host "   Sunucu Adı : $compName ($brand $model)" -ForegroundColor White
    Write-Host "   İşlemci    : $cpuInfo" -ForegroundColor White
    Write-Host "   Bellek     : $ramInfo" -ForegroundColor White
    Write-Host "   Müşteri    : ${safeCustomerName}" -ForegroundColor Yellow
    Write-Host "   Şube       : ${safeBranch}" -ForegroundColor White
    Write-Host "   IP Adresi  : $ethIp" -ForegroundColor White
    if ($serial) {
        Write-Host "   Seri No    : $serial" -ForegroundColor Cyan
    }
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "OMNIFlow Fiziki Sunucular sekmesini yenilediğinizde sunucunuz anında listelenecektir." -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "❌ Sunucuya bağlanırken bir hata oluştu: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 ÇEVRİMDIŞI YEDEK (Aşağıdaki JSON kodunu OMNIFlow paneline yapıştırabilirsiniz):" -ForegroundColor Yellow
    Write-Host $jsonBody -ForegroundColor Cyan
    try {
        Set-Clipboard -Value $jsonBody
        Write-Host "(JSON verisi panonuza otomatik kopyalandı!)" -ForegroundColor Green
    } catch {}
}

Write-Host ""
Write-Host "Pencere 5 saniye içinde kapanacaktır..." -ForegroundColor Gray
Start-Sleep -Seconds 5
`;
  }

  // DEFAULT: USER COMPUTER SCRIPT
  return `# OMNIFlow PowerShell Hardware & License Collector Agent
# Customer: ${safeCustomerName} (ID: ${customerId})
# Branch: ${safeBranch}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
try { $Host.UI.RawUI.WindowTitle = "OMNIFlow Envanter Toplayıcı - ${safeCustomerName}" } catch {}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ⚡ OMNIFlow Otomatik Donanım & Lisans Toplayıcı" -ForegroundColor Yellow
Write-Host "   🏢 Müşteri : ${safeCustomerName}" -ForegroundColor Green
Write-Host "   📍 Şube    : ${safeBranch}" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/6] 🔍 Bilgisayar temel kimliği ve oturum bilgisi okunuyor..." -ForegroundColor Gray

$compName = $env:COMPUTERNAME
$userName = $env:USERNAME

Write-Host "[2/6] 💻 Marka, model, donanım özellikleri (CPU/RAM/Disk) taranıyor..." -ForegroundColor Gray
$cs = Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue
$brand = if ($cs.Manufacturer) { $cs.Manufacturer.Trim() } else { "Toplama / OEM" }
$model = if ($cs.Model) { $cs.Model.Trim() } else { "Standart PC" }

# Serial Number
$bios = Get-CimInstance Win32_BIOS -ErrorAction SilentlyContinue
$serial = if ($bios.SerialNumber) { $bios.SerialNumber.Trim() } else { "" }

# CPU
$cpuObj = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
$cpu = if ($cpuObj.Name) { $cpuObj.Name.Trim() } else { "" }

# RAM
$ramBytes = (Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue | Measure-Object -Property Capacity -Sum).Sum
$ramGB = if ($ramBytes -gt 0) { [math]::Round($ramBytes / 1GB) } else { 0 }
$ramInfo = if ($ramGB -gt 0) { "$ramGB GB RAM" } else { "" }

# Disks
$disks = Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue | ForEach-Object {
    $sizeGB = [math]::Round($_.Size / 1GB)
    "$($_.Model) ($sizeGB GB)"
}
$diskInfo = if ($disks) { ($disks -join " + ") } else { "" }

$hwSpecsList = @($cpu, $ramInfo, $diskInfo) | Where-Object { $_ -ne "" -and $_ -ne $null }
$hwSpecsStr = ($hwSpecsList -join " / ")

# Device Type: Laptop vs Desktop
$battery = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
$deviceType = if ($battery) { "Laptop" } elseif ($cs.PCSystemType -eq 2) { "Laptop" } else { "Masaüstü" }

Write-Host "[3/6] 🪟 Windows sürümü ve BIOS OEM lisans anahtarı sorgulanıyor..." -ForegroundColor Gray
$osObj = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
$osVersion = if ($osObj.Caption) { $osObj.Caption.Trim() } else { "Windows 11 Pro" }

# OEM License Key
$oemKey = ""
try {
    $licObj = Get-CimInstance -Query 'select OA3xOriginalProductKey from SoftwareLicensingService' -ErrorAction SilentlyContinue
    if ($licObj.OA3xOriginalProductKey) {
        $oemKey = $licObj.OA3xOriginalProductKey.Trim()
    }
} catch {}

Write-Host "[4/6] 📦 Kurulu Microsoft Office sürümü tespit ediliyor..." -ForegroundColor Gray
$officeVersion = ""
try {
    $officeObj = Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* -ErrorAction SilentlyContinue |
        Where-Object { $_.DisplayName -match 'Microsoft (Office|365)' -and $_.DisplayName -notmatch 'Update|Language|MUI|OneNote|Proof|Telemetry' } |
        Select-Object -First 1
    if ($officeObj.DisplayName) {
        $officeVersion = $officeObj.DisplayName.Trim()
    }
} catch {}

Write-Host "[5/6] 🌐 Ağ adaptörleri (Ethernet & Wi-Fi IP/MAC) tespit ediliyor..." -ForegroundColor Gray
$ethIp = ""
$ethMac = ""
$wifiIp = ""
$wifiMac = ""

try {
    $adapters = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" -ErrorAction SilentlyContinue
    foreach ($a in $adapters) {
        $desc = ($a.Description + " " + $a.ServiceName).ToLower()
        $ipv4 = ($a.IPAddress | Where-Object { $_ -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$' } | Select-Object -First 1)
        $mac = $a.MACAddress

        if ($desc -match 'wi-fi|wireless|802\\.11|wlan') {
            if (-not $wifiIp) { $wifiIp = $ipv4 }
            if (-not $wifiMac) { $wifiMac = $mac }
        } else {
            if (-not $ethIp) { $ethIp = $ipv4 }
            if (-not $ethMac) { $ethMac = $mac }
        }
    }
} catch {}

# Remote Access Client ID (AnyDesk / TeamViewer)
$remoteId = ""
try {
    if (Test-Path "$env:ProgramData\\AnyDesk\\system.conf") {
        $conf = Get-Content "$env:ProgramData\\AnyDesk\\system.conf" -Raw -ErrorAction SilentlyContinue
        if ($conf -match 'ad\\.anydesk\\.id=(\\d+)') {
            $remoteId = "AnyDesk: " + $matches[1]
        }
    }
    if (-not $remoteId) {
        $tv = (Get-ItemProperty -Path "HKLM:\\SOFTWARE\\TeamViewer" -ErrorAction SilentlyContinue).ClientID
        if (-not $tv) {
            $tv = (Get-ItemProperty -Path "HKLM:\\SOFTWARE\\WOW6432Node\\TeamViewer" -ErrorAction SilentlyContinue).ClientID
        }
        if ($tv) { $remoteId = "TeamViewer: $tv" }
    }
} catch {}

# Antivirus Product
$antivirus = ""
try {
    $avObj = Get-CimInstance -Namespace root\\SecurityCenter2 -ClassName AntiVirusProduct -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($avObj.displayName) {
        $antivirus = $avObj.displayName.Trim()
    }
} catch {}

Write-Host "[6/6] 🚀 Veriler OMNIFlow bulut sunucusuna gönderiliyor..." -ForegroundColor Gray

$data = @{
    customer_id      = ${customerId}
    branch_name      = "${safeBranch}"
    computer_name    = $compName
    assigned_user    = $userName
    brand            = $brand
    model            = $model
    serial_number    = $serial
    hardware_specs   = $hwSpecsStr
    os_version       = $osVersion
    os_license_key   = $oemKey
    office_version   = $officeVersion
    ethernet_ip      = $ethIp
    ethernet_mac     = $ethMac
    wifi_ip          = $wifiIp
    wifi_mac         = $wifiMac
    device_type      = $deviceType
    remote_access_id = $remoteId
    antivirus        = $antivirus
}

$jsonBody = $data | ConvertTo-Json -Compress

$apiUrl = "${safeServerUrl}/api/agent/register-computer"

try {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls11 -bor [System.Net.SecurityProtocolType]::Tls

    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody)) -ContentType "application/json; charset=utf-8" -TimeoutSec 15

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   ✅ BAŞARIYLA KAYDEDİLDİ!" -ForegroundColor Green
    Write-Host "   Bilgisayar : $compName ($brand $model)" -ForegroundColor White
    Write-Host "   Personel   : $userName" -ForegroundColor White
    Write-Host "   Müşteri    : ${safeCustomerName}" -ForegroundColor Yellow
    Write-Host "   Şube       : ${safeBranch}" -ForegroundColor White
    Write-Host "   IP Adresi  : $(if ($ethIp) { $ethIp } else { $wifiIp })" -ForegroundColor White
    if ($oemKey) {
        Write-Host "   Lisans Key : $oemKey" -ForegroundColor Cyan
    }
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "OMNIFlow ekranınızı yenilediğinizde bu bilgisayar anında listelenecektir." -ForegroundColor Gray
} catch {
    Write-Host ""
    Write-Host "❌ Sunucuya bağlanırken bir hata oluştu: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 ÇEVRİMDIŞI YEDEK (Aşağıdaki JSON kodunu OMNIFlow paneline yapıştırabilirsiniz):" -ForegroundColor Yellow
    Write-Host $jsonBody -ForegroundColor Cyan
    try {
        Set-Clipboard -Value $jsonBody
        Write-Host "(JSON verisi panonuza otomatik kopyalandı!)" -ForegroundColor Green
    } catch {}
}

Write-Host ""
Write-Host "Pencere 5 saniye içinde kapanacaktır..." -ForegroundColor Gray
Start-Sleep -Seconds 5
`;
}

function generateCollectorBat({ customerId, customerName, branchName, serverUrl, targetType = 'computer' }) {
  const safeBranch = encodeURIComponent(branchName || 'Merkez Ofis');
  const typeParam = targetType === 'server' ? '&t=server' : '';
  const scriptUrl = `${serverUrl.replace(/\/+$/, '')}/api/agent/collector.ps1?c=${customerId}&b=${safeBranch}${typeParam}`;
  const label = targetType === 'server' ? 'Sunucu' : 'Kullanici PC';

  return `@echo off
chcp 65001 >nul
title OMNIFlow ${label} Toplayici - ${customerName}
echo ==========================================================
echo OMNIFlow ${label} Donanim ve Altyapi Toplayici Baslatiliyor...
echo Musteri: ${customerName}
echo ==========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm '${scriptUrl}' | iex"
if %errorlevel% neq 0 (
    echo.
    echo Bir hata olustu. Yonetici olarak calistirmayi deneyiniz.
    pause
)
`;
}

function handleRegisterComputer(db, payload) {
  const {
    customer_id,
    branch_name = 'Merkez Ofis',
    computer_name,
    assigned_user = '',
    department = 'Genel',
    device_type = 'Masaüstü',
    brand = '',
    model = '',
    serial_number = '',
    hardware_specs = '',
    os_version = '',
    os_license_key = '',
    office_version = '',
    office_license_key = '',
    ethernet_ip = '',
    ethernet_mac = '',
    wifi_ip = '',
    wifi_mac = '',
    remote_access_id = '',
    antivirus = '',
    notes = ''
  } = payload;

  if (!customer_id || !computer_name) {
    throw new Error('Müşteri Kimliği (customer_id) ve Bilgisayar Adı (computer_name) zorunludur.');
  }

  // Check if customer exists
  const customer = db.prepare('SELECT id, name FROM customers WHERE id = ?').get(customer_id);
  if (!customer) {
    throw new Error(`Müşteri bulunamadı (ID: ${customer_id})`);
  }

  // Find existing computer by serial_number or computer_name for this customer
  let existing = null;
  if (serial_number && serial_number.trim()) {
    existing = db.prepare(`
      SELECT * FROM user_computers 
      WHERE customer_id = ? AND LOWER(serial_number) = LOWER(?)
    `).get(customer_id, serial_number.trim());
  }

  if (!existing && computer_name) {
    existing = db.prepare(`
      SELECT * FROM user_computers 
      WHERE customer_id = ? AND LOWER(computer_name) = LOWER(?)
    `).get(customer_id, computer_name.trim());
  }

  if (existing) {
    // Update existing record (preserve existing passwords and custom notes)
    const updateStmt = db.prepare(`
      UPDATE user_computers SET
        branch_name = COALESCE(NULLIF(?, ''), branch_name),
        computer_name = ?,
        assigned_user = COALESCE(NULLIF(?, ''), assigned_user),
        device_type = COALESCE(NULLIF(?, ''), device_type),
        brand = COALESCE(NULLIF(?, ''), brand),
        model = COALESCE(NULLIF(?, ''), model),
        serial_number = COALESCE(NULLIF(?, ''), serial_number),
        hardware_specs = COALESCE(NULLIF(?, ''), hardware_specs),
        os_version = COALESCE(NULLIF(?, ''), os_version),
        os_license_key = COALESCE(NULLIF(?, ''), os_license_key),
        office_version = COALESCE(NULLIF(?, ''), office_version),
        ethernet_ip = COALESCE(NULLIF(?, ''), ethernet_ip),
        ethernet_mac = COALESCE(NULLIF(?, ''), ethernet_mac),
        wifi_ip = COALESCE(NULLIF(?, ''), wifi_ip),
        wifi_mac = COALESCE(NULLIF(?, ''), wifi_mac),
        remote_access_id = COALESCE(NULLIF(?, ''), remote_access_id),
        antivirus = COALESCE(NULLIF(?, ''), antivirus),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      branch_name,
      computer_name.trim(),
      assigned_user.trim(),
      device_type,
      brand.trim(),
      model.trim(),
      serial_number.trim(),
      hardware_specs.trim(),
      os_version.trim(),
      os_license_key.trim(),
      office_version.trim(),
      ethernet_ip.trim(),
      ethernet_mac.trim().toUpperCase(),
      wifi_ip.trim(),
      wifi_mac.trim().toUpperCase(),
      remote_access_id.trim(),
      antivirus.trim(),
      existing.id
    );

    const updated = db.prepare('SELECT * FROM user_computers WHERE id = ?').get(existing.id);
    return {
      success: true,
      action: 'updated',
      computer: updated,
      message: `'${computer_name}' bilgisayarı başarıyla güncellendi (${customer.name})`
    };
  } else {
    // Insert new record
    const insertStmt = db.prepare(`
      INSERT INTO user_computers (
        customer_id, computer_name, assigned_user, department, branch_name,
        device_type, brand, model, serial_number, hardware_specs,
        os_version, os_license_key, office_version, office_license_key,
        ethernet_ip, ethernet_mac, wifi_ip, wifi_mac,
        remote_access_id, antivirus, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(
      customer_id,
      computer_name.trim(),
      assigned_user.trim(),
      department || 'Genel',
      branch_name || 'Merkez Ofis',
      device_type || 'Masaüstü',
      brand.trim(),
      model.trim(),
      serial_number.trim(),
      hardware_specs.trim(),
      os_version.trim(),
      os_license_key.trim(),
      office_version.trim(),
      office_license_key || '',
      ethernet_ip.trim(),
      ethernet_mac.trim().toUpperCase(),
      wifi_ip.trim(),
      wifi_mac.trim().toUpperCase(),
      remote_access_id.trim(),
      antivirus.trim(),
      notes || `PowerShell Ajanı ile otomatik kaydedildi (${new Date().toLocaleString('tr-TR')})`
    );

    const created = db.prepare('SELECT * FROM user_computers WHERE id = ?').get(result.lastInsertRowid);
    return {
      success: true,
      action: 'created',
      computer: created,
      message: `'${computer_name}' bilgisayarı yeni envanter olarak kaydedildi (${customer.name})`
    };
  }
}

function handleRegisterServer(db, payload) {
  const {
    customer_id,
    branch_name = 'Merkez Ofis',
    server_name,
    brand = '',
    model = '',
    serial_number = '',
    cpu_info = '',
    ram_info = '',
    disk_info = '',
    ip_address = '',
    mac_address = '',
    management_ip = '',
    management_user = '',
    management_password = '',
    local_admin_user = '',
    local_admin_password = '',
    location = 'Sistem Odası / Rack Kabinet',
    status = 'Aktif',
    notes = ''
  } = payload;

  if (!customer_id || !server_name) {
    throw new Error('Müşteri Kimliği (customer_id) ve Sunucu Adı (server_name) zorunludur.');
  }

  const customer = db.prepare('SELECT id, name FROM customers WHERE id = ?').get(customer_id);
  if (!customer) {
    throw new Error(`Müşteri bulunamadı (ID: ${customer_id})`);
  }

  // Check if server exists by serial or server_name
  let existing = null;
  if (serial_number && serial_number.trim()) {
    existing = db.prepare(`
      SELECT * FROM physical_servers 
      WHERE customer_id = ? AND LOWER(serial_number) = LOWER(?)
    `).get(customer_id, serial_number.trim());
  }

  if (!existing && server_name) {
    existing = db.prepare(`
      SELECT * FROM physical_servers 
      WHERE customer_id = ? AND LOWER(server_name) = LOWER(?)
    `).get(customer_id, server_name.trim());
  }

  if (existing) {
    const updateStmt = db.prepare(`
      UPDATE physical_servers SET
        server_name = ?,
        brand = COALESCE(NULLIF(?, ''), brand),
        model = COALESCE(NULLIF(?, ''), model),
        serial_number = COALESCE(NULLIF(?, ''), serial_number),
        cpu_info = COALESCE(NULLIF(?, ''), cpu_info),
        ram_info = COALESCE(NULLIF(?, ''), ram_info),
        disk_info = COALESCE(NULLIF(?, ''), disk_info),
        ip_address = COALESCE(NULLIF(?, ''), ip_address),
        mac_address = COALESCE(NULLIF(?, ''), mac_address),
        branch_name = COALESCE(NULLIF(?, ''), branch_name),
        notes = COALESCE(NULLIF(?, ''), notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      server_name.trim(),
      brand.trim(),
      model.trim(),
      serial_number.trim(),
      cpu_info.trim(),
      ram_info.trim(),
      disk_info.trim(),
      ip_address.trim(),
      mac_address.trim().toUpperCase(),
      branch_name || 'Merkez Ofis',
      notes || existing.notes,
      existing.id
    );

    const updated = db.prepare('SELECT * FROM physical_servers WHERE id = ?').get(existing.id);
    return {
      success: true,
      action: 'updated',
      server: updated,
      message: `'${server_name}' fiziki sunucusu başarıyla güncellendi (${customer.name})`
    };
  } else {
    const insertStmt = db.prepare(`
      INSERT INTO physical_servers (
        customer_id, server_name, brand, model, serial_number,
        cpu_info, ram_info, disk_info, ip_address, mac_address,
        management_ip, management_user, management_password,
        local_admin_user, local_admin_password,
        branch_name, location, status, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(
      customer_id,
      server_name.trim(),
      brand.trim(),
      model.trim(),
      serial_number.trim(),
      cpu_info.trim(),
      ram_info.trim(),
      disk_info.trim(),
      ip_address.trim(),
      mac_address.trim().toUpperCase(),
      management_ip || '',
      management_user || '',
      management_password || '',
      local_admin_user || '',
      local_admin_password || '',
      branch_name || 'Merkez Ofis',
      location || 'Sistem Odası / Rack Kabinet',
      status || 'Aktif',
      notes || `PowerShell Ajanı ile otomatik kaydedildi (${new Date().toLocaleString('tr-TR')})`
    );

    const created = db.prepare('SELECT * FROM physical_servers WHERE id = ?').get(result.lastInsertRowid);
    return {
      success: true,
      action: 'created',
      server: created,
      message: `'${server_name}' fiziki sunucusu başarıyla envantere eklendi (${customer.name})`
    };
  }
}

module.exports = {
  generateCollectorScript,
  generateCollectorBat,
  handleRegisterComputer,
  handleRegisterServer
};

