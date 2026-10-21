// OMNIFlow Client-Side Agent Script Generator
// Enables 100% reliable, zero-latency in-browser script generation and download (via Blob)

export function generateCollectorScript({ customerId, customerName, branchName, serverUrl, targetType = 'computer' }) {
  const safeCustomerName = (customerName || 'Müşteri').replace(/["`$]/g, '');
  const safeBranch = (branchName || 'Merkez Ofis').replace(/["`$]/g, '');
  const safeServerUrl = (serverUrl || window.location.origin).replace(/\/+$/, '');
  const isVM = targetType === 'vm';

  if (isVM) {
    return `# OMNIFlow PowerShell VM & Sanal Makine Collector Agent
# Customer: ${safeCustomerName} (ID: ${customerId})
# Target: Sanal Makine (Virtual Machine - VM)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
try { $Host.UI.RawUI.WindowTitle = "OMNIFlow VM Toplayıcı - ${safeCustomerName}" } catch {}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host "   ⚡ OMNIFlow Otomatik Sanal Makine (VM) Toplayıcı" -ForegroundColor Yellow
Write-Host "   🏢 Müşteri : ${safeCustomerName}" -ForegroundColor Green
Write-Host "   📍 Hedef   : Sanal Makine Envanteri" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "[1/5] 🔍 VM Hostname ve Sanallaştırıcı (Hypervisor) taranıyor..." -ForegroundColor Gray

$compName = $env:COMPUTERNAME

$cs = Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue
$mfg = if ($cs.Manufacturer) { $cs.Manufacturer.Trim() } else { "" }
$model = if ($cs.Model) { $cs.Model.Trim() } else { "" }
$bios = Get-CimInstance Win32_BIOS -ErrorAction SilentlyContinue

# Detect Hypervisor Platform
$hypervisor = "Microsoft Hyper-V"
if ($model -match "Virtual Machine|Hyper-V" -or $mfg -match "Microsoft") {
    $hypervisor = "Microsoft Hyper-V"
} elseif ($model -match "VMware" -or $mfg -match "VMware") {
    $hypervisor = "VMware ESXi"
} elseif ($model -match "KVM|QEMU" -or $mfg -match "QEMU") {
    $hypervisor = "Proxmox VE / KVM"
} elseif ($model -match "VirtualBox" -or $mfg -match "innotek") {
    $hypervisor = "Oracle VirtualBox"
} elseif ($model -match "Xen" -or $mfg -match "Xen") {
    $hypervisor = "Citrix XenServer"
} elseif ($cs.HypervisorPresent -eq $true) {
    $hypervisor = "Hypervisor (Sanal)"
}

Write-Host "[2/5] ⚙️ vCPU (Sanal İşlemci) taranıyor..." -ForegroundColor Gray
$cpus = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue
$totalLogical = ($cpus | Measure-Object -Property NumberOfLogicalProcessors -Sum).Sum
$totalCores = ($cpus | Measure-Object -Property NumberOfCores -Sum).Sum
$vcpu = if ($totalLogical -gt 0) { "$totalLogical vCPU" } elseif ($totalCores -gt 0) { "$totalCores vCPU" } else { "4 vCPU" }

Write-Host "[3/5] 🧠 RAM ve Sanal Diskler taranıyor..." -ForegroundColor Gray
$ramBytes = (Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue | Measure-Object -Property Capacity -Sum).Sum
if (-not $ramBytes -or $ramBytes -le 0) {
    try {
        $ramBytes = (Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue).TotalVisibleMemorySize * 1KB
    } catch {}
}
$ramGB = if ($ramBytes -gt 0) { [math]::Round($ramBytes / 1GB) } else { 0 }
$ram = if ($ramGB -gt 0) { "$ramGB GB RAM" } else { "8 GB RAM" }

$disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" -ErrorAction SilentlyContinue | ForEach-Object {
    $sizeGB = [math]::Round($_ .Size / 1GB)
    "$($_ .DeviceID) ($sizeGB GB)"
}
$disk = if ($disks) { ($disks -join " + ") } else { "C: (100 GB)" }

Write-Host "[4/5] 🌐 Sanal Ağ Adaptörü (IP & MAC) okunuyor..." -ForegroundColor Gray
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

# Windows License Key
$osKey = ""
try {
    $osKey = (Get-CimInstance -Query 'select OA3xOriginalProductKey from SoftwareLicensingService' -ErrorAction SilentlyContinue).OA3xOriginalProductKey
} catch {}

# Server Role Detection
$roles = @()
try {
    $features = Get-WindowsFeature -ErrorAction SilentlyContinue | Where-Object { $_ .Installed -eq $true }
    foreach ($f in $features) {
        if ($f.Name -eq "AD-Domain-Services") { $roles += "Active Directory (DC)" }
        elseif ($f.Name -eq "DNS") { $roles += "DNS" }
        elseif ($f.Name -eq "DHCP") { $roles += "DHCP" }
        elseif ($f.Name -eq "Web-Server") { $roles += "IIS Web" }
        elseif ($f.Name -eq "File-Services") { $roles += "File Server" }
        elseif ($f.Name -eq "Remote-Desktop-Services") { $roles += "RDS" }
    }
} catch {}
$roleDesc = if ($roles.Count -gt 0) { ($roles -join " / ") } else { "Uygulama / Veritabanı Sunucusu" }

Write-Host "[5/5] 🚀 VM verileri OMNIFlow bulut sunucusuna gönderiliyor..." -ForegroundColor Gray

$data = @{
    customer_id       = ${customerId}
    vm_name           = $compName
    hypervisor        = $hypervisor
    role_description  = $roleDesc
    vcpu              = $vcpu
    ram               = $ram
    disk              = $disk
    ip_address        = $ethIp
    mac_address       = $ethMac
    os_version        = $osVersion
    os_license_key    = $osKey
    status            = "Aktif"
    notes             = "İşletim Sistemi: $osVersion | Otomatik VM Toplayıcı ile kaydedildi ($(Get-Date -Format 'dd.MM.yyyy HH:mm'))"
}

$jsonBody = $data | ConvertTo-Json -Compress
$apiUrl = "${safeServerUrl}/api/agent/register-vm"

try {
    [System.Net.ServicePointManager]::SecurityProtocol = 3072 -bor 768 -bor 192
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody)) -ContentType "application/json; charset=utf-8" -TimeoutSec 15

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   ✅ SANAL MAKİNE (VM) BAŞARIYLA KAYDEDİLDİ!" -ForegroundColor Green
    Write-Host "   VM Adı        : $compName" -ForegroundColor White
    Write-Host "   Sanallaştırma : $hypervisor" -ForegroundColor Cyan
    Write-Host "   Rol / Görev   : $roleDesc" -ForegroundColor White
    Write-Host "   Kaynaklar     : $vcpu | $ram | Disk: $disk" -ForegroundColor White
    Write-Host "   IP / MAC      : $ethIp ($ethMac)" -ForegroundColor White
    Write-Host "   Müşteri       : ${safeCustomerName}" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "OMNIFlow Sanal Makineler sekmesini yenilediğinizde VM anında listelenecektir." -ForegroundColor Gray
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
$cpuMultiplier = if ($cpuCount -gt 0) { $cpuCount } else { 1 }
$cpuCores = if ($firstCpu.NumberOfCores) { $firstCpu.NumberOfCores * $cpuMultiplier } else { 0 }
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

Write-Host "[4/5] 🌐 Ağ adaptörleri ve 4 Port Ethernet bilgileri okunuyor..." -ForegroundColor Gray
$ethAdapters = @()
try {
    $rawAdapters = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" -ErrorAction SilentlyContinue
    foreach ($a in $rawAdapters) {
        $ipv4 = ($a.IPAddress | Where-Object { $_ -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$' } | Select-Object -First 1)
        if ($ipv4) {
            $ethAdapters += [PSCustomObject]@{ IP = $ipv4; MAC = $a.MACAddress }
        }
    }
} catch {}

$ethIp = if ($ethAdapters.Count -ge 1) { $ethAdapters[0].IP } else { "" }
$ethMac = if ($ethAdapters.Count -ge 1) { $ethAdapters[0].MAC } else { "" }
$ethIp2 = if ($ethAdapters.Count -ge 2) { $ethAdapters[1].IP } else { "" }
$ethMac2 = if ($ethAdapters.Count -ge 2) { $ethAdapters[1].MAC } else { "" }
$ethIp3 = if ($ethAdapters.Count -ge 3) { $ethAdapters[2].IP } else { "" }
$ethMac3 = if ($ethAdapters.Count -ge 3) { $ethAdapters[2].MAC } else { "" }
$ethIp4 = if ($ethAdapters.Count -ge 4) { $ethAdapters[3].IP } else { "" }
$ethMac4 = if ($ethAdapters.Count -ge 4) { $ethAdapters[3].MAC } else { "" }

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
    ip_address_2  = $ethIp2
    mac_address_2 = $ethMac2
    ip_address_3  = $ethIp3
    mac_address_3 = $ethMac3
    ip_address_4  = $ethIp4
    mac_address_4 = $ethMac4
    location      = "Sistem Odası"
    status        = "Aktif"
    notes         = $notes
}

$jsonBody = $data | ConvertTo-Json -Compress
$apiUrl = "${safeServerUrl}/api/agent/register-server"

try {
    [System.Net.ServicePointManager]::SecurityProtocol = 3072 -bor 768 -bor 192
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody)) -ContentType "application/json; charset=utf-8" -TimeoutSec 15

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "   ✅ FİZİKİ SUNUCU BAŞARIYLA KAYDEDİLDİ!" -ForegroundColor Green
    Write-Host "   Sunucu Adı : $compName ($brand $model)" -ForegroundColor White
    Write-Host "   İşlemci    : $cpuInfo" -ForegroundColor White
    Write-Host "   Bellek/Disk: $ramInfo | Disk: $diskInfo" -ForegroundColor White
    Write-Host "   ETH-1 (IP) : $ethIp ($ethMac)" -ForegroundColor White
    if ($ethIp2) { Write-Host "   ETH-2 (IP) : $ethIp2 ($ethMac2)" -ForegroundColor White }
    Write-Host "   Müşteri    : ${safeCustomerName}" -ForegroundColor Yellow
    Write-Host "   Şube       : ${safeBranch}" -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "OMNIFlow Fiziki Sunucular sekmesini yenilediğinizde sunucu anında listelenecektir." -ForegroundColor Gray
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
    [System.Net.ServicePointManager]::SecurityProtocol = 3072 -bor 768 -bor 192
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

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

export function generateCollectorBat({ customerId, customerName, branchName, serverUrl, targetType = 'computer' }) {
  const safeBranch = encodeURIComponent(branchName || 'Merkez Ofis');
  const typeParam = targetType === 'server' ? '&t=server' : (targetType === 'vm' ? '&t=vm' : '');
  const cleanServerUrl = (serverUrl || window.location.origin).replace(/\/+$/, '');
  const scriptUrl = `${cleanServerUrl}/api/agent/collector.ps1?c=${customerId}&b=${safeBranch}${typeParam}`;
  const label = targetType === 'server' ? 'Sunucu' : (targetType === 'vm' ? 'Sanal Makine (VM)' : 'Kullanici PC');

  return `@echo off
chcp 65001 >nul
title OMNIFlow ${label} Toplayici - ${customerName}
echo ==========================================================
echo OMNIFlow ${label} Donanim ve Altyapi Toplayici Baslatiliyor...
echo Musteri: ${customerName}
echo ==========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = 3072 -bor 768 -bor 192; [Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; irm '${scriptUrl}' | iex"
if %errorlevel% neq 0 (
    echo.
    echo Bir hata olustu. Yonetici olarak calistirmayi deneyiniz.
    pause
)
`;
}
