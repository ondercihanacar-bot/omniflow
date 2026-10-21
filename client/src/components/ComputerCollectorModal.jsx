import React, { useState, useEffect } from 'react';
import {
  X, Laptop, Zap, Copy, Check, Download, ShieldCheck,
  Terminal, FileCode, WifiOff, Sparkles, Building2, CheckCircle2,
  ExternalLink, Info, AlertCircle, Server, Network, Globe, Cloud
} from 'lucide-react';
import CopyButton from './CopyButton';
import { api } from '../api';

export default function ComputerCollectorModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
  branches = [],
  initialTargetType = 'computer' // 'computer' | 'server'
}) {
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'download' | 'offline'
  const [targetType, setTargetType] = useState(initialTargetType);
  const [selectedBranch, setSelectedBranch] = useState(branches[0] || 'Merkez Ofis');
  const [serverMode, setServerMode] = useState('lan'); // 'lan' | 'cloud' | 'custom'
  const [customHost, setCustomHost] = useState('');
  const [serverInfo, setServerInfo] = useState(null);
  const [offlineJson, setOfflineJson] = useState('');
  const [isSubmittingOffline, setIsSubmittingOffline] = useState(false);
  const [offlineError, setOfflineError] = useState(null);

  useEffect(() => {
    setTargetType(initialTargetType || 'computer');
  }, [initialTargetType, isOpen]);

  // Load server LAN IPs
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/agent/server-info')
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          setServerInfo(data);
          // Default to LAN if available
          if (data.primaryLanIp) {
            setServerMode('lan');
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen || !customer) return null;

  // Cloud URL vs Local LAN URL vs Custom URL
  const cloudUrl = serverInfo?.cloudUrl || 'https://omniflow-mptm.onrender.com';
  const detectedLanIp = serverInfo?.primaryLanIp || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? window.location.hostname : '192.168.3.59');
  const lanUrl = `http://${detectedLanIp}:5000`;

  let baseUrl = lanUrl;
  if (serverMode === 'cloud') {
    baseUrl = cloudUrl;
  } else if (serverMode === 'custom') {
    baseUrl = customHost.trim() || lanUrl;
  } else {
    baseUrl = lanUrl;
  }

  const branchParam = encodeURIComponent(selectedBranch);
  const isServer = targetType === 'server';
  const isVM = targetType === 'vm';
  const typeParam = isServer ? '&t=server' : (isVM ? '&t=vm' : '');

  // TLS 1.2 + SSL Bypass prefix (fixes "SSL/TLS güvenli kanalı oluşturulamadı" on Windows Server 2016 / PowerShell 5.1)
  const tlsFixPrefix = `[Net.ServicePointManager]::SecurityProtocol = 3072 -bor 768 -bor 192; [Net.ServicePointManager]::ServerCertificateValidationCallback = {$true};`;
  
  // Clean PowerShell command
  const shortCommand = `${tlsFixPrefix} irm '${baseUrl}/api/agent/collector.ps1?c=${customer.id}&b=${branchParam}${typeParam}' | iex`;
  
  // CMD / Win+R command
  const psCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${tlsFixPrefix} irm '${baseUrl}/api/agent/collector.ps1?c=${customer.id}&b=${branchParam}${typeParam}' | iex"`;

  // Standalone Direct PowerShell command (runs offline, reads CIM directly, copies JSON to clipboard)
  const standaloneCommand = isVM
    ? `\$c=\$env:COMPUTERNAME;\$cs=Get-CimInstance Win32_ComputerSystem -EA 0;\$mfg=if(\$cs.Manufacturer){\$cs.Manufacturer.Trim()}else{''};\$mod=if(\$cs.Model){\$cs.Model.Trim()}else{''};\$hyp='Microsoft Hyper-V';if(\$mod -match 'VMware' -or \$mfg -match 'VMware'){\$hyp='VMware ESXi'}elseif(\$mod -match 'KVM|QEMU' -or \$mfg -match 'QEMU'){\$hyp='Proxmox VE / KVM'}elseif(\$mod -match 'VirtualBox'){\$hyp='Oracle VirtualBox'};\$cpus=Get-CimInstance Win32_Processor -EA 0;\$tl=(\$cpus|Measure-Object -Property NumberOfLogicalProcessors -Sum).Sum;\$tc=(\$cpus|Measure-Object -Property NumberOfCores -Sum).Sum;\$vcpu=if(\$tl -gt 0){"\$tl vCPU"}elseif(\$tc -gt 0){"\$tc vCPU"}else{'4 vCPU'};\$rmBytes=(Get-CimInstance Win32_PhysicalMemory -EA 0|Measure-Object -Property Capacity -Sum).Sum;if(-not \$rmBytes -or \$rmBytes -le 0){try{\$rmBytes=(Get-CimInstance Win32_OperatingSystem -EA 0).TotalVisibleMemorySize*1KB}catch{}};\$ri=if(\$rmBytes -gt 0){"\$([math]::Round(\$rmBytes/1GB)) GB RAM"}else{'8 GB RAM'};\$disks=Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' -EA 0|ForEach-Object{"\$(\$_.DeviceID) (\$([math]::Round(\$_.Size/1GB)) GB)"};\$dk=if(\$disks){(\$disks -join ' + ')}else{'C: 100 GB'};\$ethIp='';\$ethMac='';try{\$ad=Get-CimInstance Win32_NetworkAdapterConfiguration -Filter 'IPEnabled=True' -EA 0;foreach(\$a in \$ad){\$ipv4=(\$a.IPAddress|Where-Object{\$_ -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$'}|Select-Object -First 1);if(\$ipv4 -and -not \$ethIp){\$ethIp=\$ipv4;\$ethMac=\$a.MACAddress}}}catch{};\$os=(Get-CimInstance Win32_OperatingSystem -EA 0).Caption;\$key='';try{\$key=(Get-CimInstance -Query 'select OA3xOriginalProductKey from SoftwareLicensingService' -EA 0).OA3xOriginalProductKey}catch{};\$roles=@();try{\$features=Get-WindowsFeature -EA 0|Where-Object{\$_.Installed -eq \$true};foreach(\$f in \$features){if(\$f.Name -eq 'AD-Domain-Services'){\$roles+='Active Directory (DC)'}elseif(\$f.Name -eq 'DNS'){\$roles+='DNS'}elseif(\$f.Name -eq 'DHCP'){\$roles+='DHCP'}elseif(\$f.Name -eq 'Web-Server'){\$roles+='IIS Web'}elseif(\$f.Name -eq 'File-Services'){\$roles+='File Server'}elseif(\$f.Name -eq 'Remote-Desktop-Services'){\$roles+='RDS'}}}catch{};\$rdesc=if(\$roles.Count -gt 0){(\$roles -join ' / ')}else{'Uygulama / Veritabanı Sunucusu'};\$j=@{customer_id=${customer.id};vm_name=\$c;hypervisor=\$hyp;role_description=\$rdesc;vcpu=\$vcpu;ram=\$ri;disk=\$dk;ip_address=\$ethIp;mac_address=\$ethMac;os_version=\$os;os_license_key=\$key;status='Aktif';notes="İşletim Sistemi: \$os"}|ConvertTo-Json -Compress;Clear-Host;Write-Host '==========================================' -ForegroundColor Green;Write-Host '  OMNIFlow VM Bilgileri Toplandı!' -ForegroundColor Yellow;Write-Host '==========================================' -ForegroundColor Green;Write-Host "VM: \$c (\$hyp)" -ForegroundColor White;Write-Host "Rol: \$rdesc | vCPU: \$vcpu | RAM: \$ri" -ForegroundColor White;Write-Host "Disk: \$dk | IP: \$ethIp" -ForegroundColor White;Write-Host '==========================================' -ForegroundColor Green;Write-Host \$j -ForegroundColor Cyan;try{Set-Clipboard -Value \$j;Write-Host '\`n✅ Bilgiler panoya kopyalandı! OMNIFlow 3. Çevrimdışı Yapıştır sekmesine yapıştırıp kaydedin.' -ForegroundColor Green}catch{}`
    : isServer
    ? `\$c=\$env:COMPUTERNAME;\$cs=Get-CimInstance Win32_ComputerSystem -EA 0;\$b=if(\$cs.Manufacturer){\$cs.Manufacturer.Trim()}else{'OEM'};\$m=if(\$cs.Model){\$cs.Model.Trim()}else{'Server'};\$s=(Get-CimInstance Win32_BIOS -EA 0).SerialNumber;\$cpus=Get-CimInstance Win32_Processor -EA 0;\$cc=(\$cpus|Measure-Object).Count;\$fc=(\$cpus|Select-Object -First 1);\$cm=if(\$fc.Name){\$fc.Name.Trim()}else{'Xeon'};\$mult=if(\$cc -gt 0){\$cc}else{1};\$cores=if(\$fc.NumberOfCores){\$fc.NumberOfCores*\$mult}else{0};\$ci=if(\$cc -gt 1){"\$cc x \$cm (\$cores Çekirdek)"}else{"\$cm (\$cores Çekirdek)"};\$rmBytes=(Get-CimInstance Win32_PhysicalMemory -EA 0|Measure-Object -Property Capacity -Sum).Sum;\$ri=if(\$rmBytes -gt 0){"\$([math]::Round(\$rmBytes/1GB)) GB RAM"}else{"32 GB RAM"};\$disks=Get-CimInstance Win32_DiskDrive -EA 0|ForEach-Object{"\$(\$_.Model) (\$([math]::Round(\$_.Size/1GB)) GB)"};\$dk=if(\$disks){(\$disks -join ' + ')}else{'RAID'};\$ethList=@();try{\$ad=Get-CimInstance Win32_NetworkAdapterConfiguration -Filter 'IPEnabled=True' -EA 0;foreach(\$a in \$ad){\$ipv4=(\$a.IPAddress|Where-Object{\$_ -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$'}|Select-Object -First 1);if(\$ipv4){\$ethList+=[PSCustomObject]@{IP=\$ipv4;MAC=\$a.MACAddress}}}}catch{};\$ip1=if(\$ethList.Count -ge 1){\$ethList[0].IP}else{''};\$mac1=if(\$ethList.Count -ge 1){\$ethList[0].MAC}else{''};\$ip2=if(\$ethList.Count -ge 2){\$ethList[1].IP}else{''};\$mac2=if(\$ethList.Count -ge 2){\$ethList[1].MAC}else{''};\$ip3=if(\$ethList.Count -ge 3){\$ethList[2].IP}else{''};\$mac3=if(\$ethList.Count -ge 3){\$ethList[2].MAC}else{''};\$ip4=if(\$ethList.Count -ge 4){\$ethList[3].IP}else{''};\$mac4=if(\$ethList.Count -ge 4){\$ethList[3].MAC}else{''};\$os=(Get-CimInstance Win32_OperatingSystem -EA 0).Caption;\$j=@{customer_id=${customer.id};branch_name='${selectedBranch}';server_name=\$c;brand=\$b;model=\$m;serial_number=\$s;cpu_info=\$ci;ram_info=\$ri;disk_info=\$dk;ip_address=\$ip1;mac_address=\$mac1;ip_address_2=\$ip2;mac_address_2=\$mac2;ip_address_3=\$ip3;mac_address_3=\$mac3;ip_address_4=\$ip4;mac_address_4=\$mac4;location='Sistem Odası';status='Aktif';notes="İşletim Sistemi: \$os"}|ConvertTo-Json -Compress;Clear-Host;Write-Host '==========================================' -ForegroundColor Green;Write-Host '  OMNIFlow Sunucu Bilgileri Toplandı!' -ForegroundColor Yellow;Write-Host '==========================================' -ForegroundColor Green;Write-Host "Sunucu: \$c (\$b \$m)" -ForegroundColor White;Write-Host "İşlemci: \$ci" -ForegroundColor White;Write-Host "Bellek: \$ri | Disk: \$dk" -ForegroundColor White;Write-Host "ETH1: \$ip1 (\$mac1)" -ForegroundColor White;if(\$ip2){Write-Host "ETH2: \$ip2 (\$mac2)" -ForegroundColor White};if(\$ip3){Write-Host "ETH3: \$ip3 (\$mac3)" -ForegroundColor White};if(\$ip4){Write-Host "ETH4: \$ip4 (\$mac4)" -ForegroundColor White};Write-Host '==========================================' -ForegroundColor Green;Write-Host \$j -ForegroundColor Cyan;try{Set-Clipboard -Value \$j;Write-Host '\`n✅ Bilgiler panoya kopyalandı! OMNIFlow ekranında 3. Çevrimdışı Yapıştır sekmesine yapıştırıp kaydedin.' -ForegroundColor Green}catch{}`
    : `\$c=\$env:COMPUTERNAME;\$u=\$env:USERNAME;\$cs=Get-CimInstance Win32_ComputerSystem -EA 0;\$b=if(\$cs.Manufacturer){\$cs.Manufacturer.Trim()}else{'OEM'};\$m=if(\$cs.Model){\$cs.Model.Trim()}else{'PC'};\$s=(Get-CimInstance Win32_BIOS -EA 0).SerialNumber;\$cpu=(Get-CimInstance Win32_Processor -EA 0|Select-Object -First 1).Name;\$rmBytes=(Get-CimInstance Win32_PhysicalMemory -EA 0|Measure-Object Capacity -Sum).Sum;\$ri=if(\$rmBytes -gt 0){"\$([math]::Round(\$rmBytes/1GB)) GB RAM"}else{''};\$disks=Get-CimInstance Win32_DiskDrive -EA 0|ForEach-Object{"\$(\$_.Model) (\$([math]::Round(\$_.Size/1GB)) GB)"};\$dk=if(\$disks){(\$disks -join ' + ')}else{''};\$specs=@(\$cpu,\$ri,\$dk)|Where-Object{\$_}|join ' / ';\$bat=Get-CimInstance Win32_Battery -EA 0;\$dtype=if($bat){'Laptop'}else{'Masaüstü'};\$os=(Get-CimInstance Win32_OperatingSystem -EA 0).Caption;\$key='';try{\$key=(Get-CimInstance -Query 'select OA3xOriginalProductKey from SoftwareLicensingService' -EA 0).OA3xOriginalProductKey}catch{};\$ad=Get-CimInstance Win32_NetworkAdapterConfiguration -Filter 'IPEnabled=True' -EA 0|Select-Object -First 1;\$ip=(\$ad.IPAddress|Where-Object{\$_ -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$'}|Select-Object -First 1);\$mac=\$ad.MACAddress;\$j=@{customer_id=${customer.id};branch_name='${selectedBranch}';computer_name=\$c;assigned_user=\$u;brand=\$b;model=\$m;serial_number=\$s;hardware_specs=\$specs;os_version=\$os;os_license_key=\$key;device_type=\$dtype;ethernet_ip=\$ip;ethernet_mac=\$mac}|ConvertTo-Json -Compress;Clear-Host;Write-Host '==========================================' -ForegroundColor Green;Write-Host '  OMNIFlow Bilgisayar Bilgileri Toplandı!' -ForegroundColor Yellow;Write-Host '==========================================' -ForegroundColor Green;Write-Host \$j -ForegroundColor Cyan;try{Set-Clipboard -Value \$j;Write-Host '\`n✅ Bilgiler panoya kopyalandı! OMNIFlow 3. Çevrimdışı Yapıştır sekmesine yapıştırıp kaydedin.' -ForegroundColor Green}catch{}`;

  const downloadUrl = `${baseUrl}/api/agent/download/${customer.id}?b=${branchParam}${typeParam}&server_url=${encodeURIComponent(baseUrl)}&format=bat`;
  const downloadPs1Url = `${baseUrl}/api/agent/download/${customer.id}?b=${branchParam}${typeParam}&server_url=${encodeURIComponent(baseUrl)}&format=ps1`;

  // Submit offline JSON
  const handleSaveOfflineJson = async () => {
    if (!offlineJson.trim()) return;
    setIsSubmittingOffline(true);
    setOfflineError(null);
    try {
      const parsed = JSON.parse(offlineJson);
      parsed.customer_id = customer.id;
      if (!parsed.branch_name) parsed.branch_name = selectedBranch;

      // Try saving via standard authenticated API first
      let result;
      if (isVM) {
        result = await api.createVM(parsed);
      } else if (isServer) {
        result = await api.createServer(parsed);
      } else {
        result = await api.createComputer(parsed);
      }

      const entityName = isVM ? 'Sanal Makine (VM)' : (isServer ? 'Fiziki Sunucu' : 'Kullanıcı PC');
      alert(`✅ Başarılı: ${entityName} envantere kaydedildi! (${customer.name})`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      // Fallback to agent endpoint
      try {
        const endpoint = isVM ? '/api/agent/register-vm' : (isServer ? '/api/agent/register-server' : '/api/agent/register-computer');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
        alert(`✅ Başarılı: ${data.message || 'Kayıt tamamlandı!'}`);
        if (onSuccess) onSuccess();
        onClose();
      } catch (innerErr) {
        setOfflineError(err.message || innerErr.message || 'Kayıt sırasında hata oluştu');
      }
    } finally {
      setIsSubmittingOffline(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl max-w-2xl w-full my-8 text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              isVM
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : isServer
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              {isVM ? <Cloud className="w-5 h-5 fill-purple-400/20" /> : isServer ? <Server className="w-5 h-5 fill-indigo-400/20" /> : <Zap className="w-5 h-5 fill-amber-400/20" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{isVM ? 'Otomatik Sanal Makine (VM) Toplayıcı' : isServer ? 'Otomatik Fiziki Sunucu Toplayıcı' : 'Otomatik Donanım & Lisans Toplayıcı'}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                  isVM
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : isServer
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  PowerShell
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isVM
                  ? 'Sanal makinede kurulum yapmadan Hypervisor (Hyper-V / VMware / Proxmox), vCPU, RAM, Disk ve IP bilgilerini saniyeler içinde çekin.'
                  : isServer
                  ? 'Hedef sunucuda kurulum yapmadan donanım, CPU, RAM, Disk, 4-Port Ethernet ve IP/MAC bilgilerini saniyeler içinde çekin.'
                  : 'Hedef bilgisayarda hiçbir program kurmadan tüm özellikleri 2 saniyede çekin.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer, Type & Branch Target Bar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Hedef Müşteri:</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
              {customer.name}
            </span>
          </div>

          {/* Mode Switch: PC vs Sunucu vs VM */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setTargetType('computer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                targetType === 'computer'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Kullanıcı PC</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('server')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                targetType === 'server'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Fiziki Sunucu</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('vm')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                targetType === 'vm'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Sanal Makine (VM)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold text-slate-400">Şube:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              {(branches.length > 0 ? branches : ['Merkez Ofis']).map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('command')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'command'
                ? 'bg-slate-900 text-amber-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>1. Tek Satırlık Komut (PowerShell)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'download'
                ? 'bg-slate-900 text-blue-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>2. Dosya İndir (.bat)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'offline'
                ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-sm border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <WifiOff className="w-4 h-4 text-emerald-400" />
            <span>3. Çevrimdışı Yapıştır</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: ONE-LINE COMMAND */}
          {activeTab === 'command' && (
            <div className="space-y-4">
              {/* Server selector switch */}
              <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Network className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Bağlantı Hedefi:</span>
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setServerMode('lan')}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                        serverMode === 'lan'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                      }`}
                    >
                      <Network className="w-3 h-3" />
                      <span>Yerel Ağ ({detectedLanIp}:5000)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">ÖNERİLEN</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServerMode('cloud')}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                        serverMode === 'cloud'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Canlı Bulut (Render)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServerMode('custom')}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                        serverMode === 'custom'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                      }`}
                    >
                      Özel IP
                    </button>
                  </div>
                </div>

                {serverMode === 'custom' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] shrink-0">Hedef URL:</span>
                    <input
                      type="text"
                      value={customHost}
                      onChange={(e) => setCustomHost(e.target.value)}
                      placeholder="http://192.168.1.50:5000"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                )}

                {serverMode === 'cloud' && (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2.5 mt-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold text-amber-100">Render Bulut Servisi Uyarısı:</span> Render.com bulut servisi askıda (503 Service Suspended) olduğu için bulut çağrısı bağlantı hatası verir. Lütfen <strong className="text-white">"Yerel Ağ ({detectedLanIp}:5000)"</strong> seçeneğini veya aşağıdaki <strong className="text-emerald-300">"Bağımsız PowerShell Kodu"</strong>nu kullanınız.
                    </div>
                  </div>
                )}
              </div>

              {/* TLS 1.2 Guarantee Info Badge */}
              <div className="bg-emerald-950/25 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white">SSL/TLS 1.2 Güvencesi:</span> Windows Server 2012/2016/2019/2022 sürümlerinde <code className="text-emerald-300 font-mono text-[11px]">"SSL/TLS güvenli kanalı oluşturulamadı"</code> hatasını engellemek için TLS 1.2 protokol aktivasyonu komutun başına otomatik eklenmiştir.
                </div>
              </div>

              {/* SECTION A: NETWORK COMMAND */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>YÖNTEM 1: Tek Satırlık Ağ Komutu (Otomatik Kayıt)</span>
                </div>

                {/* Command Code Box (PowerShell Console) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isVM ? 'VM PowerShell Komutu:' : isServer ? 'PowerShell Konsolu Komutu (Mavi Ekran):' : 'Kullanıcı PC PowerShell Komutu:'}</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">Tek tıkla kopyalayın</span>
                  </label>
                  <div className={`bg-slate-950 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-inner border ${
                    isVM ? 'border-purple-500/50' : isServer ? 'border-indigo-500/50' : 'border-amber-500/50'
                  }`}>
                    <code className={`text-xs font-mono select-all break-all ${isVM ? 'text-purple-200' : isServer ? 'text-indigo-200' : 'text-amber-200'}`}>
                      {shortCommand}
                    </code>
                    <CopyButton text={shortCommand} title="PowerShell Komutunu Kopyala" />
                  </div>
                </div>

                {/* CMD / Win+R Alternative Box */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                    <span>Alternatif: Komut İstemi (CMD) veya Win + R (Çalıştır) İçin:</span>
                  </label>
                  <div className="bg-slate-950/80 rounded-xl p-2.5 flex items-center justify-between gap-3 border border-slate-800">
                    <code className="text-[11px] font-mono select-all break-all text-slate-300">
                      {psCommand}
                    </code>
                    <CopyButton text={psCommand} title="CMD Komutunu Kopyala" />
                  </div>
                </div>
              </div>

              {/* SECTION B: STANDALONE DIRECT POWERSHELL CODE (NO WEB / NO PORT NEEDED) */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>YÖNTEM 2: Bağımsız Kod (Ağ & Web Gerektirmez - %100 Çözüm)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    ÖNERİLEN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hedef sunucu farklı bir alt ağdaysa veya web sunucusuna erişemiyorsa, aşağıdaki kodu PowerShell&apos;e yapıştırın. Sunucu özelliklerini (Xeon CPU, RAM, Disk, IP/MAC) 1 saniyede okur ve panonuza kopyalar. Ardından <strong>"3. Çevrimdışı Yapıştır"</strong> sekmesine yapıştırıp tek tıkla kaydedebilirsiniz.
                </p>
                <div className="bg-slate-950 rounded-xl p-3 flex items-center justify-between gap-3 border border-cyan-500/50">
                  <code className="text-[11px] font-mono select-all break-all text-cyan-200 max-h-24 overflow-y-auto">
                    {standaloneCommand}
                  </code>
                  <CopyButton text={standaloneCommand} title="Bağımsız PowerShell Kodunu Kopyala" />
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nasıl Kullanılır? (3 Kolay Adım)</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30 text-[11px]">
                      1
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Hedef {isServer ? 'sunucuda (RDP / Konsol)' : 'bilgisayarda (AnyDesk / Başlat)'} <strong className="text-white">Windows Tuşu + X</strong> menüsünden veya Başlat aramasından <strong className="text-white">PowerShell</strong> uygulamasını açın.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30 text-[11px]">
                      2
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      Yukarıdaki tek satırlık kodu kopyalayıp PowerShell penceresine yapıştırın ve <strong className="text-white">Enter</strong> tuşuna basın.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 text-[11px]">
                      3
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {isServer
                        ? <>Script 2 saniyede Sunucu Adı, Marka, Model, Seri No / Service Tag, İşlemci (Xeon/EPYC), RAM, Diskler ve IP/MAC adreslerini okur ve doğrudan <strong className="text-indigo-400">{customer.name}</strong> müşterisinin <strong className="text-white">Fiziki Sunucular</strong> sekmesine kaydeder!</>
                        : <>Script 2 saniyede CPU, RAM, Disk, Windows Lisansı (OEM Key), Office, IP/MAC ve AnyDesk ID&apos;sini okur ve doğrudan <strong className="text-emerald-400">{customer.name}</strong> müşterisinin <strong className="text-white">Kullanıcı PC</strong> hanesine kaydeder!</>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD FILE */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                <FileCode className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-blue-300">Taşınabilir Çalıştırıcı Dosyası (.bat / .ps1)</div>
                  <p className="text-slate-300 leading-relaxed">
                    Bu dosyayı bir kez indirip USB belleğinize veya AnyDesk / RDP dosya transferiyle makinenin masaüstüne atabilirsiniz. Çift tıklandığında otomatik olarak <strong className="text-white">{customer.name}</strong> ({isServer ? 'Fiziki Sunucular' : 'Kullanıcı PC'}) hanesine kaydeder.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={downloadUrl}
                  download
                  className="p-4 bg-slate-950 border border-slate-700 hover:border-blue-500 rounded-xl flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300">
                        {isVM ? 'VM_Toplayici.bat İndir' : isServer ? 'Sunucu_Toplayici.bat İndir' : 'Toplayici.bat İndir'}
                      </div>
                      <div className="text-[11px] text-slate-400">Çift tıklayarak anında çalıştırın</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    ÖNERİLEN
                  </span>
                </a>

                <a
                  href={downloadPs1Url}
                  download
                  className="p-4 bg-slate-950 border border-slate-700 hover:border-amber-500 rounded-xl flex items-center justify-between gap-3 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300">
                        {isVM ? 'VM_Toplayici.ps1 İndir' : isServer ? 'Sunucu_Toplayici.ps1 İndir' : 'Toplayici.ps1 İndir'}
                      </div>
                      <div className="text-[11px] text-slate-400">Ham PowerShell scripti</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    PS1
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE JSON PASTE */}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-emerald-300">İnternetsiz / Güvenlikli Cihazlar İçin</div>
                  <p className="text-slate-300 leading-relaxed">
                    Eğer hedef {isServer ? 'sunucu' : 'bilgisayar'} internete bağlı değilse veya firewall dışarı POST atılmasını engelliyorsa, PowerShell scripti çalıştığında JSON kodunu ekrana basar ve panoya kopyalar. O JSON kodunu buraya yapıştırıp kaydedebilirsiniz.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Panodaki JSON Verisini Yapıştırın:
                </label>
                <textarea
                  rows={6}
                  value={offlineJson}
                  onChange={(e) => setOfflineJson(e.target.value)}
                  placeholder={
                    isVM
                      ? `{\n  "vm_name": "VM-SQL01",\n  "hypervisor": "Microsoft Hyper-V",\n  "role_description": "SQL Server & Veritabanı",\n  "vcpu": "8 vCPU",\n  "ram": "32 GB RAM",\n  "disk": "C: 100 GB + D: 500 GB",\n  "ip_address": "192.168.2.50"\n}`
                      : isServer
                      ? `{\n  "server_name": "SRV-DC01",\n  "brand": "Dell Inc.",\n  "model": "PowerEdge R740",\n  "serial_number": "8X7K9Z2",\n  "cpu_info": "2 x Intel Xeon Silver 4210R",\n  "ram_info": "64 GB RAM",\n  "disk_info": "PERC H730P (4x 960GB SSD)",\n  "ip_address": "192.168.2.253",\n  "ip_address_2": "192.168.2.254"\n}`
                      : `{\n  "computer_name": "PC-MUH-01",\n  "brand": "Lenovo",\n  "model": "ThinkCentre",\n  "serial_number": "MJ0DK198",\n  ...\n}`
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {offlineError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{offlineError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveOfflineJson}
                disabled={isSubmittingOffline || !offlineJson.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmittingOffline ? 'Kaydediliyor...' : `${customer.name} Envanterine Kaydet`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-800/40 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kayıtlar sadece <strong className="text-white">{customer.name}</strong> hanesine yazılır.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
