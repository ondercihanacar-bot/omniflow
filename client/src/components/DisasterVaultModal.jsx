import React, { useState } from 'react';
import {
  X, Shield, Lock, Download, Key, Check, AlertCircle, FileText,
  Building2, Globe, Server, Cloud, Laptop, HardDrive, Wifi, Mail,
  Eye, EyeOff, Sparkles, RefreshCw
} from 'lucide-react';

export default function DisasterVaultModal({ isOpen, onClose, customer }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !customer) return null;

  // Derive AES-GCM key and encrypt payload using Web Crypto API
  const handleGenerateAndDownload = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password || password.length < 6) {
      setErrorMsg('Acil durum kurtarma parolası en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Girdiğiniz parolalar birbiriyle eşleşmiyor.');
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Prepare raw payload with all customer infrastructure data
      const rawPayload = {
        meta: {
          app: 'OMNIFlow IT & Varlık Yönetimi',
          generatedAt: new Date().toISOString(),
          customerName: customer.name,
          customerCode: customer.code || 'OMNI',
          externalIp: customer.external_ip || '-',
          contactPerson: customer.contact_person || '-',
          phone: customer.phone || '-',
          email: customer.email || '-'
        },
        internetLines: customer.internet_lines || [],
        firewalls: customer.firewalls || [],
        physicalServers: customer.physical_servers || [],
        virtualMachines: customer.virtual_machines || [],
        userComputers: customer.user_computers || [],
        backupUnits: customer.backup_units || [],
        wifiControllers: customer.wifi_controllers || [],
        wifiNetworks: customer.wifi_networks || [],
        mailServices: customer.mail_services || [],
        antivirusLicenses: customer.antivirus_licenses || []
      };

      const jsonStr = JSON.stringify(rawPayload);
      const enc = new TextEncoder();
      const dataBytes = enc.encode(jsonStr);

      // 2. PBKDF2 Key Derivation
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // 3. Encrypt data with AES-GCM
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        dataBytes
      );

      // Convert to Base64
      const toBase64 = (buf) => {
        let binary = '';
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
      };

      const encryptedBase64 = toBase64(encryptedBuffer);
      const saltBase64 = toBase64(salt);
      const ivBase64 = toBase64(iv);

      // 4. Create Standalone HTML Document
      const customerClean = (customer.code || customer.name || 'Musteri').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `OMNIFlow_Acil_Kurtarma_${customerClean}_${new Date().toISOString().split('T')[0]}.html`;

      const standaloneHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OMNIFlow Felaket Kurtarma Çantası — ${customer.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #090d16; color: #f1f5f9; min-height: 100vh; padding: 20px; display: flex; flex-direction: column; align-items: center; }
    .container { width: 100%; max-width: 1100px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; }
    .logo-badge { background: #1e3a8a; color: #93c5fd; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; font-family: monospace; }
    .btn { background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
    .btn:hover { background: #1d4ed8; }
    .btn-copy { background: #1e293b; color: #94a3b8; padding: 4px 8px; font-size: 11px; border: 1px solid #334155; border-radius: 6px; cursor: pointer; }
    .btn-copy:hover { color: #fff; background: #334155; }
    .input { width: 100%; background: #020617; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 14px; margin-top: 6px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; margin-top: 16px; }
    .device-card { background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; }
    .device-card:hover { border-color: #3b82f6; }
    .tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
    .tag-firewall { background: #450a0a; color: #fca5a5; }
    .tag-server { background: #1e1b4b; color: #c7d2fe; }
    .tag-vm { background: #2e1065; color: #e9d5ff; }
    .tag-pc { background: #022c22; color: #6ee7b7; }
    .tag-net { background: #082f49; color: #7dd3fc; }
    .val-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #94a3b8; }
    .val-mono { font-family: monospace; font-weight: 700; color: #f8fafc; }
    .tab-btn { background: transparent; border: none; color: #94a3b8; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 8px; cursor: pointer; }
    .tab-btn.active { background: #1e293b; color: #60a5fa; }
    #lock-screen { max-width: 440px; margin: 80px auto; text-align: center; }
    #vault-content { display: none; }
    .search-bar { width: 100%; background: #020617; border: 1px solid #334155; border-radius: 10px; padding: 12px 16px; color: #fff; font-size: 14px; margin-bottom: 16px; }
  </style>
</head>
<body>

  <div class="container">
    <!-- 1. LOCK SCREEN (PIN PROMPT) -->
    <div id="lock-screen" class="card">
      <div style="font-size: 38px; margin-bottom: 10px;">🔐</div>
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 6px;">OMNIFlow Çevrimdışı Acil Kasa</h2>
      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 20px;">
        ${customer.name} için oluşturulan kriptolu felaket durum çantası. Açmak için acil durum anahtarını girin.
      </p>

      <form id="unlock-form" onsubmit="unlockVault(event)">
        <div style="text-align: left; margin-bottom: 16px;">
          <label style="font-size: 12px; color: #94a3b8;">Kurtarma Parolası</label>
          <input type="password" id="vault-pwd" class="input" placeholder="Parolayı girin..." autofocus required>
        </div>
        <button type="submit" id="unlock-btn" class="btn" style="width: 100%;">Kasayı Aç (AES-256)</button>
        <div id="err-box" style="display: none; color: #f87171; font-size: 12px; margin-top: 12px;"></div>
      </form>
    </div>

    <!-- 2. UNLOCKED VAULT CONTENT -->
    <div id="vault-content" class="card">
      <div class="header">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="logo-badge">OMNIFLOW OFFLINE VAULT</span>
            <h1 style="font-size: 20px; font-weight: 800;" id="cust-name">${customer.name}</h1>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
            Dış Statik IP: <span id="cust-wan" style="color: #60a5fa; font-family: monospace; font-weight: 700;">${customer.external_ip || '-'}</span> | 
            Yetkili: <span id="cust-contact">${customer.contact_person || '-'}</span> (${customer.phone || '-'})
          </p>
        </div>
        <button class="btn" onclick="location.reload()" style="background: #334155;">Kasayı Kilitle</button>
      </div>

      <!-- Search & Tabs -->
      <input type="text" id="search-input" class="search-bar" placeholder="IP, cihaz adı, şifre veya kullanıcı ara..." oninput="renderItems()">

      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; border-bottom: 1px solid #1e293b;" id="tab-strip">
        <button class="tab-btn active" onclick="setTab('all')">Tümü</button>
        <button class="tab-btn" onclick="setTab('firewalls')">Firewall &amp; VPN</button>
        <button class="tab-btn" onclick="setTab('servers')">Fiziksel Sunucu</button>
        <button class="tab-btn" onclick="setTab('vms')">Sanal Makineler</button>
        <button class="tab-btn" onclick="setTab('lines')">İnternet &amp; Modem</button>
        <button class="tab-btn" onclick="setTab('pcs')">Kullanıcı PC</button>
        <button class="tab-btn" onclick="setTab('wifi')">Wi-Fi Ağları</button>
      </div>

      <div id="items-grid" class="grid"></div>

      <div style="border-top: 1px solid #1e293b; margin-top: 30px; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-family: monospace;">
        <div>OMNIFlow Acil Felaket Çantası • Tamamen Çevrimdışı Çalışır</div>
        <div>Designed &amp; Developed by Önder Cihan ACAR © 2026. All Rights Reserved.</div>
      </div>
    </div>
  </div>

  <script>
    const CIPHERTEXT = "${encryptedBase64}";
    const SALT_B64 = "${saltBase64}";
    const IV_B64 = "${ivBase64}";

    let vaultData = null;
    let activeTab = 'all';

    function fromBase64(b64) {
      const bin = window.atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }

    async function unlockVault(e) {
      e.preventDefault();
      const pwd = document.getElementById('vault-pwd').value;
      const errBox = document.getElementById('err-box');
      const btn = document.getElementById('unlock-btn');
      errBox.style.display = 'none';
      btn.innerText = 'Çözülüyor...';

      try {
        const enc = new TextEncoder();
        const salt = fromBase64(SALT_B64);
        const iv = fromBase64(IV_B64);
        const dataBytes = fromBase64(CIPHERTEXT);

        const keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          enc.encode(pwd),
          { name: 'PBKDF2' },
          false,
          ['deriveKey']
        );

        const aesKey = await window.crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        );

        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          aesKey,
          dataBytes
        );

        const decStr = new TextDecoder().decode(decrypted);
        vaultData = JSON.parse(decStr);

        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('vault-content').style.display = 'block';
        renderItems();
      } catch (err) {
        errBox.innerText = 'Parola hatalı! Şifreli veri açılamadı.';
        errBox.style.display = 'block';
      } finally {
        btn.innerText = 'Kasayı Aç (AES-256)';
      }
    }

    function setTab(tab) {
      activeTab = tab;
      document.querySelectorAll('#tab-strip .tab-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      renderItems();
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert('Panoya Kopyalandı: ' + text);
    }

    function renderItems() {
      if (!vaultData) return;
      const q = (document.getElementById('search-input').value || '').toLowerCase();
      const grid = document.getElementById('items-grid');
      grid.innerHTML = '';

      const items = [];

      // 1. Firewalls
      if (activeTab === 'all' || activeTab === 'firewalls') {
        (vaultData.firewalls || []).forEach(f => {
          items.push({
            tag: 'tag-firewall',
            type: 'Firewall',
            title: f.device_name,
            sub: f.brand + ' ' + (f.model || ''),
            rows: [
              ['Yönetim IP', f.management_ip],
              ['Kullanıcı', f.username],
              ['Parola', f.password],
              ['Dış IP', f.external_ip],
              ['SSL VPN', f.ssl_vpn_portal]
            ]
          });
        });
      }

      // 2. Physical Servers
      if (activeTab === 'all' || activeTab === 'servers') {
        (vaultData.physicalServers || []).forEach(s => {
          items.push({
            tag: 'tag-server',
            type: 'Fiziksel Sunucu',
            title: s.server_name,
            sub: s.brand + ' ' + (s.model || ''),
            rows: [
              ['iLO/iDRAC IP', s.ilo_ip],
              ['iLO Kullanıcı', s.ilo_username],
              ['iLO Parola', s.ilo_password],
              ['İşletim Sis. IP', s.os_ip],
              ['Local Admin', s.local_admin_user],
              ['Admin Parola', s.local_admin_password]
            ]
          });
        });
      }

      // 3. Virtual Machines
      if (activeTab === 'all' || activeTab === 'vms') {
        (vaultData.virtualMachines || []).forEach(v => {
          items.push({
            tag: 'tag-vm',
            type: 'Sanal Makine',
            title: v.vm_name,
            sub: v.role_description || 'VM',
            rows: [
              ['IP Adresi', v.ip_address],
              ['Local Admin', v.local_admin_user],
              ['Admin Parola', v.local_admin_password],
              ['İşletim Sistemi', v.os_version]
            ]
          });
        });
      }

      // 4. Internet Lines
      if (activeTab === 'all' || activeTab === 'lines') {
        (vaultData.internetLines || []).forEach(l => {
          items.push({
            tag: 'tag-net',
            type: 'İnternet Devresi',
            title: l.isp_name || 'İnternet Hattı',
            sub: l.circuit_no || l.branch_name,
            rows: [
              ['Statik IP (WAN)', l.static_ip],
              ['Modem IP', l.modem_ip],
              ['Modem Parola', l.modem_password],
              ['PPPoE Kullanıcı', l.pppoe_username],
              ['PPPoE Parola', l.pppoe_password]
            ]
          });
        });
      }

      // 5. User PCs
      if (activeTab === 'all' || activeTab === 'pcs') {
        (vaultData.userComputers || []).forEach(c => {
          items.push({
            tag: 'tag-pc',
            type: 'Kullanıcı PC',
            title: c.computer_name,
            sub: c.assigned_user + ' (' + (c.department || '-') + ')',
            rows: [
              ['IP Adresi', c.ethernet_ip || c.wifi_ip],
              ['AnyDesk ID', c.remote_access_id],
              ['Local Admin', c.local_admin_user],
              ['Admin Parola', c.local_admin_password],
              ['Windows Key', c.os_license_key]
            ]
          });
        });
      }

      // 6. Wi-Fi
      if (activeTab === 'all' || activeTab === 'wifi') {
        (vaultData.wifiNetworks || []).forEach(w => {
          items.push({
            tag: 'tag-net',
            type: 'Wi-Fi Ağı',
            title: w.ssid,
            sub: w.branch_name,
            rows: [
              ['SSID (Ağ Adı)', w.ssid],
              ['WPA2/3 Şifresi', w.password],
              ['Güvenlik Türü', w.security_type],
              ['VLAN ID', w.vlan_id]
            ]
          });
        });
      }

      const filtered = items.filter(item => {
        if (!q) return true;
        const text = (item.title + ' ' + item.sub + ' ' + JSON.stringify(item.rows)).toLowerCase();
        return text.includes(q);
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #64748b;">Aramanıza uygun kayıt bulunamadı.</div>';
        return;
      }

      filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'device-card';
        let rowsHtml = '';
        item.rows.forEach(([k, v]) => {
          if (v) {
            rowsHtml += \`
              <div class="val-row">
                <span>\${k}:</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="val-mono">\${v}</span>
                  <button class="btn-copy" onclick="copyToClipboard('\${v}')">Kopyala</button>
                </div>
              </div>
            \`;
          }
        });

        div.innerHTML = \`
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="tag \${item.tag}">\${item.type}</span>
              <span style="font-size: 11px; color: #64748b;">\${item.sub}</span>
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 10px;">\${item.title}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            \${rowsHtml}
          </div>
        \`;
        grid.appendChild(div);
      });
    }
  </script>
</body>
</html>`;

      // 5. Trigger download
      const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccessMsg(`✓ Felaket Kurtarma Çantası başarıyla oluşturuldu ve indirildi (${filename}).`);
    } catch (err) {
      console.error('Disaster vault generation error:', err);
      setErrorMsg(`Hata oluştu: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full my-4 flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Felaket Kurtarma Çantası</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  AES-256 Kriptolu
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {customer.name} — İnternetsiz açılabilen tek dosya çevrimdışı acil durum kasası
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleGenerateAndDownload} className="p-5 space-y-4">
          <div className="bg-purple-950/40 border border-purple-900/50 rounded-xl p-3.5 text-xs text-purple-200 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Sıfır İnternet Garantisi (Offline Vault):</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-purple-200/90">
              İnternet tamamen çöktüğünde veya telefon çekmeyen sunucu odasındayken; müşterinin <strong>tüm IP, modem, firewall, sunucu ve admin şifrelerini</strong> içeren tek bir <code>.html</code> dosyası flash belleğinizde hazır olur.
            </p>
          </div>

          {/* Master Password Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Acil Durum Anahtar Parolası (En az 6 karakter)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Güçlü bir kurtarma parolası belirleyin..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Parolayı Tekrar Girin
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Parolayı doğrulayın..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Kriptolanıyor (AES-256)...' : 'Kriptolu Acil Kasayı İndir (.HTML)'}</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-500 font-mono">
            Designed &amp; Developed by Önder Cihan ACAR © 2026. All Rights Reserved.
          </p>
        </form>

      </div>
    </div>
  );
}
