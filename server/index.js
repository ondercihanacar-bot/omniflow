const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db, seedSampleDataIfEmpty } = require('./db');
const totp = require('./totp');
const security = require('./security');
const aiService = require('./aiService');
const licenseService = require('./licenseService');
const agentCollector = require('./agentCollector');
const notificationBot = require('./notificationBot');

const app = express();
const PORT = process.env.PORT || 5000;

// Global process error safety guards to prevent unexpected background exits
process.on('uncaughtException', (err) => {
  console.error('[OmniFlow Server] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[OmniFlow Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(cors());
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Helpers for system_settings table
function getSetting(key, defaultValue = '') {
  try {
    const row = db.prepare('SELECT value FROM system_settings WHERE key = ?').get(key);
    return row ? row.value : defaultValue;
  } catch (err) {
    return defaultValue;
  }
}

function setSetting(key, value) {
  try {
    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, String(value));
  } catch (err) {
    console.error('setSetting error:', err.message);
  }
}

// Initialize security subsystem & HTTP security headers
security.initSecurity(db, getSetting, setSetting);
security.applySecurityHeaders(app);

// Initialize OmniHub License Service
licenseService.init(db, getSetting, setSetting);

// Initialize Telegram & WhatsApp Notification Bot Scheduler
notificationBot.initScheduler(db, getSetting, setSetting);

// Global Authentication Middleware for Protected API Endpoints
app.use('/api', (req, res, next) => {
  // Publicly accessible endpoints (without login)
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/status',
    '/backgrounds',
    '/license/status',
    '/license/activate',
    '/license/sync'
  ];

  if (publicPaths.some(p => req.path === p) || req.path.startsWith('/agent/')) {
    return next();
  }

  // OMNIHUB LİSANS DENETİMİ & ASKIYA ALMA (SUSPENDED & EXPIRED)
  const lic = licenseService.getLicenseStatus();
  if (lic && lic.status === 'suspended') {
    return res.status(403).json({
      success: false,
      license_blocked: true,
      status: 'suspended',
      message: 'OMNIFlow lisansı OmniHub merkezi tarafından dondurulmuştur (askıya alınmıştır). Sistem erişimi kilitlendi.'
    });
  }

  if (lic && lic.status === 'expired') {
    if (req.method !== 'GET') {
      return res.status(403).json({
        success: false,
        license_blocked: true,
        status: 'expired',
        message: 'OMNIFlow lisans süreniz dolmuştur. İşlem yapabilmek için lütfen lisansınızı yenileyiniz.'
      });
    }
  }

  // All other /api/* routes require a valid cryptographically signed session token
  return security.requireAuth(req, res, next);
});

// OmniHub Licensing Endpoints
app.get('/api/license/status', (req, res) => {
  res.json({ success: true, license: licenseService.getLicenseStatus() });
});

app.post('/api/license/activate', async (req, res) => {
  try {
    const { license_key, omnihub_url } = req.body;
    const license = await licenseService.activateLicense(license_key, omnihub_url);
    res.json({ success: true, message: 'Lisans başarıyla etkinleştirildi.', license });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/license/sync', async (req, res) => {
  try {
    await licenseService.syncHeartbeat();
    res.json({ success: true, license: licenseService.getLicenseStatus() });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Serve Giris_Arka_Fon directory statically
const girisArkaFonDir = path.join(__dirname, '..', 'Giris_Arka_Fon');
if (!fs.existsSync(girisArkaFonDir)) {
  fs.mkdirSync(girisArkaFonDir, { recursive: true });
}
app.use('/Giris_Arka_Fon', express.static(girisArkaFonDir));

// Serve static frontend files if built, and static public assets
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}
const clientPublicPath = path.join(__dirname, '..', 'client', 'public');
if (fs.existsSync(clientPublicPath)) {
  app.use(express.static(clientPublicPath));
}

// Upload custom logo (MP4 video or image)
app.post('/api/upload-logo', (req, res) => {
  try {
    const { dataUrl, filename = 'logo.mp4' } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'Lütfen yüklenecek dosya içeriğini seçin.' });
    }

    // Extract base64 payload
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(dataUrl, 'base64');
    }

    // Target paths
    const publicDir = path.join(__dirname, '..', 'client', 'public');
    const distDir = path.join(__dirname, '..', 'client', 'dist');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const publicTarget = path.join(publicDir, 'logo.mp4');
    fs.writeFileSync(publicTarget, buffer);

    if (fs.existsSync(distDir)) {
      const distTarget = path.join(distDir, 'logo.mp4');
      fs.writeFileSync(distTarget, buffer);
    }

    res.json({
      success: true,
      message: 'Logo (logo.mp4) başarıyla yüklendi ve sisteme uygulandı.',
      path: '/logo.mp4'
    });
  } catch (err) {
    console.error('Logo upload error:', err);
    res.status(500).json({ error: err.message || 'Logo yüklenirken bir hata oluştu.' });
  }
});

// Scan background files from Giris_Arka_Fon directory
function getBackgroundFiles() {
  const allowedExts = ['.mp4', '.webm', '.mov', '.ogg', '.jpg', '.jpeg', '.png', '.webp', '.gif'];
  try {
    if (!fs.existsSync(girisArkaFonDir)) return [];
    const files = fs.readdirSync(girisArkaFonDir);
    return files
      .filter(f => allowedExts.includes(path.extname(f).toLowerCase()))
      .map(filename => {
        const ext = path.extname(filename).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.mov', '.ogg'].includes(ext);
        const stats = fs.statSync(path.join(girisArkaFonDir, filename));
        let displayName = filename;
        const numMatch = filename.match(/^(\d+)/);
        if (numMatch) {
          displayName = `${numMatch[1]} Nolu ${isVideo ? 'Hareketli Arka Plan' : 'Arka Plan'} (${filename})`;
        }
        return {
          filename,
          name: displayName,
          url: `/Giris_Arka_Fon/${encodeURIComponent(filename)}`,
          type: isVideo ? 'video' : 'image',
          size: stats.size,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' }));
  } catch (err) {
    console.error('Error reading Giris_Arka_Fon:', err);
    return [];
  }
}

// Get list of background files from Giris_Arka_Fon
app.get('/api/backgrounds', (req, res) => {
  try {
    const files = getBackgroundFiles();
    const activeFile = getSetting('auth_bg_file', '1.mp4');
    const activeUrl = getSetting('auth_bg_url', `/Giris_Arka_Fon/${activeFile}`);
    const activeType = getSetting('auth_bg_type', 'video');
    res.json({
      success: true,
      folderPath: girisArkaFonDir,
      activeFile,
      activeUrl,
      activeType,
      activeFullPath: path.join(girisArkaFonDir, activeFile),
      files
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Select active background from Giris_Arka_Fon
app.post('/api/select-background', (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Lütfen seçilecek dosya adını belirtin.' });
    }
    const safeFilename = path.basename(filename);
    const filePath = path.join(girisArkaFonDir, safeFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Dosya bulunamadı: ${safeFilename}` });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov', '.ogg'].includes(ext);
    const bgType = isVideo ? 'video' : 'image';
    const bgUrl = `/Giris_Arka_Fon/${encodeURIComponent(safeFilename)}?t=${Date.now()}`;

    // Sync to public/auth-bg.mp4 and dist/auth-bg.mp4 for fallback compatibility
    try {
      const publicDir = path.join(__dirname, '..', 'client', 'public');
      const distDir = path.join(__dirname, '..', 'client', 'dist');
      if (isVideo) {
        fs.copyFileSync(filePath, path.join(publicDir, 'auth-bg.mp4'));
        if (fs.existsSync(distDir)) {
          fs.copyFileSync(filePath, path.join(distDir, 'auth-bg.mp4'));
        }
      }
    } catch (e) {
      console.warn('Sync auth-bg.mp4 warning:', e.message);
    }

    setSetting('auth_bg_file', safeFilename);
    setSetting('auth_bg_url', bgUrl);
    setSetting('auth_bg_type', bgType);

    res.json({
      success: true,
      message: `${safeFilename} başarıyla giriş ekranı arka planı olarak ayarlandı.`,
      activeFile: safeFilename,
      url: bgUrl,
      type: bgType,
      fullPath: filePath
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload custom login screen background (saves to Giris_Arka_Fon)
app.post('/api/upload-auth-bg', (req, res) => {
  try {
    const { dataUrl, filename = 'custom-auth-bg.mp4' } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'Lütfen yüklenecek dosya içeriğini seçin.' });
    }

    const ext = path.extname(filename).toLowerCase().replace('.', '') || 'mp4';
    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
    const bgType = isVideo ? 'video' : 'image';
    const cleanExt = isVideo ? (ext === 'webm' ? 'webm' : 'mp4') : (['png', 'webp', 'gif', 'svg'].includes(ext) ? ext : 'jpg');
    
    // Clean safe filename for Giris_Arka_Fon
    let safeName = path.basename(filename);
    if (!safeName || safeName.includes('custom-auth-bg')) {
      const files = getBackgroundFiles();
      safeName = `${files.length + 1}.${cleanExt}`;
    }

    // Extract base64 payload
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(dataUrl, 'base64');
    }

    // Save directly to Giris_Arka_Fon
    const targetFile = path.join(girisArkaFonDir, safeName);
    fs.writeFileSync(targetFile, buffer);

    // Also sync to client/public and client/dist if video
    try {
      const publicDir = path.join(__dirname, '..', 'client', 'public');
      const distDir = path.join(__dirname, '..', 'client', 'dist');
      if (isVideo) {
        fs.copyFileSync(targetFile, path.join(publicDir, 'auth-bg.mp4'));
        if (fs.existsSync(distDir)) {
          fs.copyFileSync(targetFile, path.join(distDir, 'auth-bg.mp4'));
        }
      }
    } catch (e) {}

    const bgUrl = `/Giris_Arka_Fon/${encodeURIComponent(safeName)}?t=${Date.now()}`;
    setSetting('auth_bg_file', safeName);
    setSetting('auth_bg_url', bgUrl);
    setSetting('auth_bg_type', bgType);

    res.json({
      success: true,
      message: `${safeName} başarıyla Giris_Arka_Fon klasörüne yüklendi ve uygulandı.`,
      activeFile: safeName,
      url: bgUrl,
      type: bgType,
      fullPath: targetFile
    });
  } catch (err) {
    console.error('Auth bg upload error:', err);
    res.status(500).json({ error: err.message || 'Arka plan yüklenirken bir hata oluştu.' });
  }
});

// Reset login screen background to 1.mp4 in Giris_Arka_Fon
app.post('/api/reset-auth-bg', (req, res) => {
  try {
    const defaultFile = '1.mp4';
    const filePath = path.join(girisArkaFonDir, defaultFile);
    if (fs.existsSync(filePath)) {
      try {
        const publicDir = path.join(__dirname, '..', 'client', 'public');
        const distDir = path.join(__dirname, '..', 'client', 'dist');
        fs.copyFileSync(filePath, path.join(publicDir, 'auth-bg.mp4'));
        if (fs.existsSync(distDir)) {
          fs.copyFileSync(filePath, path.join(distDir, 'auth-bg.mp4'));
        }
      } catch (e) {}
    }

    const defaultUrl = `/Giris_Arka_Fon/${defaultFile}?t=${Date.now()}`;
    const defaultType = 'video';
    setSetting('auth_bg_file', defaultFile);
    setSetting('auth_bg_url', defaultUrl);
    setSetting('auth_bg_type', defaultType);

    res.json({
      success: true,
      message: 'Giriş ekranı arka planı 1 nolu hareketli resme (1.mp4) sıfırlandı.',
      activeFile: defaultFile,
      url: defaultUrl,
      type: defaultType,
      fullPath: filePath
    });
  } catch (err) {
    console.error('Auth bg reset error:', err);
    res.status(500).json({ error: err.message || 'Arka plan sıfırlanırken bir hata oluştu.' });
  }
});

// ----------------- AUTH & GOOGLE AUTHENTICATOR (2FA) -----------------
app.get('/api/auth/status', (req, res) => {
  try {
    const isTotpEnabled = getSetting('totp_enabled', 'false') === 'true';
    const requireAdminDelete = getSetting('require_admin_delete', 'false') === 'true';
    const authBgFile = getSetting('auth_bg_file', '1.mp4');
    const authBgUrl = getSetting('auth_bg_url', `/Giris_Arka_Fon/${authBgFile}`);
    const authBgType = getSetting('auth_bg_type', 'video');
    const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    res.json({
      isTotpEnabled,
      requireAdminDelete,
      authBgFile,
      authBgFolder: girisArkaFonDir,
      authBgFullPath: path.join(girisArkaFonDir, authBgFile),
      authBgUrl,
      authBgType,
      usersCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register new user (protected with brute-force rate limiter & scrypt hash)
app.post('/api/auth/register', security.authRateLimiter, (req, res) => {
  try {
    const { username, email, full_name, password } = req.body;
    const cleanUser = (username || email || '').trim();

    if (!cleanUser) {
      return res.status(400).json({ error: 'Kullanıcı adı veya e-posta zorunludur.' });
    }
    if (!password || password.length < 3) {
      return res.status(400).json({ error: 'Parola en az 3 karakter olmalıdır.' });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(cleanUser, cleanUser);
    if (existing) {
      return res.status(400).json({ error: 'Bu kullanıcı adı veya e-posta ile kayıtlı bir hesap zaten mevcut.' });
    }

    const { role = 'user', permissions = null, totp_secret = null, totp_enabled = 0 } = req.body;
    const hashedPassword = security.hashPassword(password.trim());
    const permString = permissions ? (typeof permissions === 'object' ? JSON.stringify(permissions) : permissions) : (role === 'admin' ? null : JSON.stringify({
      can_view_passwords: false,
      can_edit: true,
      can_delete: false,
      can_export: false,
      modules: {
        servers: true, vms: true, computers: true, firewalls: false,
        backups: false, internet: true, wifi: false, antivirus: true, mail: true, knowledge_base: true
      }
    }));

    const stmt = db.prepare(`
      INSERT INTO users (username, email, full_name, password, role, permissions, totp_secret, totp_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const isTotpOn = totp_enabled ? 1 : 0;
    const result = stmt.run(cleanUser, email || cleanUser, (full_name || cleanUser).trim(), hashedPassword, role, permString, totp_secret || null, isTotpOn);
    const created = db.prepare('SELECT id, username, email, full_name, role, totp_enabled, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı hesabı başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.',
      user: created
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (Username/Email + Password + optional 2FA TOTP with Brute-Force Rate Limiting)
app.post('/api/auth/login', security.authRateLimiter, (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const { username, email, password, totpCode } = req.body;
    const searchUser = (username || email || '').trim();

    if (!searchUser) {
      return res.status(400).json({ error: 'Lütfen kullanıcı adı veya e-posta adresinizi girin.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Lütfen parolanızı girin.' });
    }

    // Lookup user in users table
    let user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(searchUser, searchUser);

    // Fallback: Check if onder.cihan.acar@gmail.com with password 2213
    if (!user && searchUser.toLowerCase() === 'onder.cihan.acar@gmail.com') {
      if (password === '2213') {
        const defaultSecret = getSetting('totp_secret', 'TYOLIKB346EGVAHCHVFB');
        const defaultHashedPwd = security.hashPassword('2213');
        const stmt = db.prepare(`
          INSERT INTO users (username, email, full_name, password, role, totp_enabled, totp_secret)
          VALUES ('onder.cihan.acar@gmail.com', 'onder.cihan.acar@gmail.com', 'Önder Cihan ACAR', ?, 'admin', 1, ?)
        `);
        stmt.run(defaultHashedPwd, defaultSecret);
        user = db.prepare('SELECT * FROM users WHERE username = ?').get('onder.cihan.acar@gmail.com');
      }
    }

    if (!user) {
      security.recordFailedAttempt(ip, searchUser);
      return res.status(401).json({ error: 'Kullanıcı adı veya parola hatalı! Lütfen bilgilerinizi kontrol edin.' });
    }

    // Verify password securely using scrypt with timing-safe comparison
    const pwdCheck = security.verifyPassword(password, user.password);
    if (!pwdCheck.valid) {
      security.recordFailedAttempt(ip, searchUser);
      return res.status(401).json({ error: 'Kullanıcı adı veya parola hatalı! Lütfen bilgilerinizi kontrol edin.' });
    }

    // Auto-upgrade legacy plain text password to memory-hard scrypt hash
    if (pwdCheck.needsRehash) {
      const newHash = security.hashPassword(password);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, user.id);
    }

    // Check if 2FA (Google Authenticator) is enabled for this user
    const isMainAdmin = user.username === 'onder.cihan.acar@gmail.com' || user.username === 'admin';
    const isGlobalTotp = getSetting('totp_enabled', 'false') === 'true';
    const isTotpActive = user.totp_enabled === 1 || (isMainAdmin && isGlobalTotp);
    const totpSecret = user.totp_secret || (isMainAdmin ? getSetting('totp_secret', '') : '');

    if (isTotpActive && totpSecret) {
      if (!totpCode || !totpCode.trim()) {
        return res.json({
          requireTotp: true,
          userId: user.id,
          username: user.username,
          full_name: user.full_name,
          message: 'Google Authenticator 6 haneli doğrulama kodunu girmeniz gerekmektedir.'
        });
      }

      const isValidTotp = totp.verifyTOTP(totpSecret, totpCode.trim(), 2);
      if (!isValidTotp) {
        security.recordFailedAttempt(ip, searchUser);
        return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş Google Authenticator kodu! Lütfen telefonunuzdaki anlık 6 haneli kodu kontrol edin.' });
      }
    }

    // Clear failed attempts upon successful authentication
    security.resetFailedAttempts(ip, user.username, user.id);

    // Extract user permissions
    let permissions = null;
    try {
      permissions = user.permissions ? JSON.parse(user.permissions) : null;
    } catch (e) {
      permissions = null;
    }
    if (!permissions) {
      if (user.role === 'admin') {
        permissions = {
          can_view_passwords: true,
          can_edit: true,
          can_delete: true,
          can_export: true,
          modules: {
            servers: true, vms: true, computers: true, firewalls: true,
            backups: true, internet: true, wifi: true, antivirus: true, mail: true, knowledge_base: true
          }
        };
      } else {
        permissions = {
          can_view_passwords: false,
          can_edit: true,
          can_delete: false,
          can_export: false,
          modules: {
            servers: true, vms: true, computers: true, firewalls: false,
            backups: false, internet: true, wifi: false, antivirus: true, mail: true, knowledge_base: true
          }
        };
      }
    }

    user.permissions = permissions;

    // Generate cryptographically signed HMAC-SHA256 session token (with permissions)
    const token = security.createToken(user);

    res.json({
      success: true,
      message: 'Giriş başarılı!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        permissions,
        totp_enabled: isTotpActive
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change user password (scrypt verification & update)
app.post('/api/auth/change-password', (req, res) => {
  try {
    const { userId, username, currentPassword, newPassword } = req.body;
    let user = null;
    if (userId) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else if (username) {
      user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(username, username);
    }

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const pwdCheck = security.verifyPassword(currentPassword, user.password);
    if (!pwdCheck.valid) {
      return res.status(400).json({ error: 'Mevcut parolanız hatalı!' });
    }

    if (!newPassword || newPassword.length < 3) {
      return res.status(400).json({ error: 'Yeni parola en az 3 karakter olmalıdır.' });
    }

    const newHash = security.hashPassword(newPassword);
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newHash, user.id);
    security.logSecurityEvent('PASSWORD_CHANGED', req.ip, user.username, 'Parola başarıyla değiştirildi');

    res.json({ success: true, message: 'Parola başarıyla güncellendi!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Authenticator (TOTP) Setup
app.post('/api/auth/totp/setup', async (req, res) => {
  try {
    const { userId, username } = req.body || {};
    let targetName = username || 'onder.cihan.acar@gmail.com';
    if (userId) {
      const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
      if (user) targetName = user.username;
    }

    const secret = totp.generateSecret(20);
    const appName = 'OmniFlow';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(targetName)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    const qrCode = await totp.generateQRCode(otpauthUrl);

    res.json({
      secret,
      otpauthUrl,
      qrCode,
      accountName: targetName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enable TOTP 2FA
app.post('/api/auth/totp/enable', (req, res) => {
  try {
    const { userId, username, secret, token, adminBypass = false } = req.body;
    if (!secret) {
      return res.status(400).json({ error: 'Secret anahtarı zorunludur.' });
    }

    if (adminBypass && req.user?.role === 'admin') {
      // Admin bypass: enabling on behalf of a user
    } else {
      if (!token) {
        return res.status(400).json({ error: 'Secret anahtarı ve 6 haneli doğrulama kodu zorunludur.' });
      }
      const isValid = totp.verifyTOTP(secret, token.trim());
      if (!isValid) {
        return res.status(400).json({ error: 'Doğrulama kodu hatalı! Lütfen Google Authenticator ile QR kodu taratıp güncel 6 haneli kodu girin.' });
      }
    }

    let isMainAdmin = false;
    if (userId) {
      const u = db.prepare('SELECT username FROM users WHERE id = ?').get(userId);
      isMainAdmin = u && (u.username === 'onder.cihan.acar@gmail.com' || u.username === 'admin');
      db.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(secret, userId);
    } else if (username) {
      isMainAdmin = username.toLowerCase() === 'onder.cihan.acar@gmail.com' || username.toLowerCase() === 'admin';
      db.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').run(secret, username, username);
    } else {
      isMainAdmin = true;
      db.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE username = ?').run(secret, 'onder.cihan.acar@gmail.com');
    }

    if (isMainAdmin) {
      setSetting('totp_secret', secret);
      setSetting('totp_enabled', 'true');
    }

    res.json({ success: true, message: 'Google Authenticator iki adımlı doğrulama (2FA) başarıyla aktifleştirildi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disable TOTP 2FA
app.post('/api/auth/totp/disable', (req, res) => {
  try {
    const { userId, username, password, token } = req.body;
    let user = null;
    if (userId) {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else if (username) {
      user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(username, username);
    } else {
      user = db.prepare('SELECT * FROM users WHERE username = ?').get('onder.cihan.acar@gmail.com');
    }

    const storedPassword = user ? user.password : getSetting('admin_password', 'admin123');
    const userSecret = user ? user.totp_secret : getSetting('totp_secret', '');

    if (password !== storedPassword) {
      return res.status(401).json({ error: 'Kullanıcı parolası hatalı!' });
    }

    if (token && userSecret) {
      const isValid = totp.verifyTOTP(userSecret, token.trim());
      if (!isValid) {
        return res.status(400).json({ error: 'Doğrulama kodu hatalı!' });
      }
    }

    if (user) {
      db.prepare('UPDATE users SET totp_secret = NULL, totp_enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    }
    setSetting('totp_enabled', 'false');
    setSetting('totp_secret', '');

    res.json({ success: true, message: 'Google Authenticator iki adımlı doğrulama devre dışı bırakıldı.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- SECURITY AUDIT & METRICS -----------------
app.get('/api/security/status', (req, res) => {
  try {
    const isTotpEnabled = getSetting('totp_enabled', 'false') === 'true';
    const auditCount = db.prepare('SELECT COUNT(*) as count FROM security_logs').get()?.count || 0;
    const lastEvents = db.prepare('SELECT * FROM security_logs ORDER BY created_at DESC LIMIT 15').all();
    
    res.json({
      success: true,
      features: {
        totp2FA: isTotpEnabled,
        passwordHashing: 'Scrypt (Memory-Hard Salted Hash)',
        sessionTokens: 'Cryptographically Signed HMAC-SHA256 (Bearer)',
        dataEncryption: 'AES-256-GCM (Authenticated At-Rest)',
        bruteForceProtection: 'Active (5 attempts / 15 min lock)',
        securityHeaders: 'Active (NoSniff, FrameOptions, CSP-ready)',
        sqlInjectionProtection: 'Active (Prepared Statements)'
      },
      auditCount,
      recentEvents: lastEvents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/security/logs', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const logs = db.prepare('SELECT * FROM security_logs ORDER BY created_at DESC LIMIT ?').all(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all registered users (includes permissions)
app.get('/api/users', (req, res) => {
  try {
    const rawUsers = db.prepare('SELECT id, username, email, full_name, role, permissions, totp_enabled, created_at FROM users ORDER BY created_at ASC').all();
    const users = rawUsers.map(u => {
      let perms = null;
      try {
        perms = u.permissions ? JSON.parse(u.permissions) : null;
      } catch (e) {
        perms = null;
      }
      return {
        ...u,
        permissions: perms || (u.role === 'admin' ? {
          can_view_passwords: true,
          can_edit: true,
          can_delete: true,
          can_export: true,
          modules: {
            servers: true, vms: true, computers: true, firewalls: true,
            backups: true, internet: true, wifi: true, antivirus: true, mail: true, knowledge_base: true
          }
        } : {
          can_view_passwords: false,
          can_edit: false,
          can_delete: false,
          can_export: false,
          modules: {
            servers: true, vms: true, computers: true, firewalls: false,
            backups: false, internet: true, wifi: false, antivirus: true, mail: true, knowledge_base: true
          }
        })
      };
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role and permissions (Admin only)
app.put('/api/users/:id/permissions', (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim: Yalnızca yöneticiler kullanıcı yetkilerini değiştirebilir.' });
    }

    const { role, permissions } = req.body;
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    if (targetUser.username === 'onder.cihan.acar@gmail.com' && role && role !== 'admin') {
      return res.status(400).json({ error: 'Ana yönetici hesabının rolü değiştirilemez.' });
    }

    const newRole = role || targetUser.role || 'user';
    const permString = typeof permissions === 'object' ? JSON.stringify(permissions) : permissions;

    db.prepare('UPDATE users SET role = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      newRole,
      permString,
      req.params.id
    );

    security.logSecurityEvent('USER_PERMISSIONS_UPDATED', req.ip, req.user.username, `Updated permissions for ${targetUser.username} (Role: ${newRole})`);

    const updated = db.prepare('SELECT id, username, email, full_name, role, permissions, totp_enabled FROM users WHERE id = ?').get(req.params.id);
    res.json({
      success: true,
      message: 'Kullanıcı yetkileri başarıyla güncellendi.',
      user: {
        ...updated,
        permissions: permissions
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin reset 2FA for a user
app.post('/api/users/:id/reset-2fa', (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim: Yalnızca yöneticiler 2FA sıfırlayabilir.' });
    }
    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    db.prepare('UPDATE users SET totp_secret = NULL, totp_enabled = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

    if (targetUser.username === 'onder.cihan.acar@gmail.com') {
      setSetting('totp_enabled', 'false');
      setSetting('totp_secret', '');
    }

    security.logSecurityEvent('USER_2FA_RESET', req.ip, req.user?.username || 'admin', `Reset 2FA for user ${targetUser.username}`);
    res.json({ success: true, message: `${targetUser.full_name || targetUser.username} için Google 2FA sıfırlandı.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user
app.delete('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    if (user.username === 'onder.cihan.acar@gmail.com') {
      return res.status(400).json({ error: 'Ana yönetici hesabı (onder.cihan.acar@gmail.com) silinemez!' });
    }

    const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (count <= 1) {
      return res.status(400).json({ error: 'Sistemdeki tek kullanıcı silinemez!' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Kullanıcı hesabı silindi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- STATS -----------------
app.get('/api/stats', (req, res) => {
  try {
    const customersCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const serversCount = db.prepare('SELECT COUNT(*) as count FROM physical_servers').get().count;
    const vmsCount = db.prepare('SELECT COUNT(*) as count FROM virtual_machines').get().count;
    const pcsCount = db.prepare('SELECT COUNT(*) as count FROM user_computers').get().count;
    const firewallsCount = db.prepare('SELECT COUNT(*) as count FROM firewalls').get().count;
    const backupsCount = db.prepare('SELECT COUNT(*) as count FROM backup_units').get().count;
    const linesCount = db.prepare('SELECT COUNT(*) as count FROM internet_lines').get().count;
    const wifiApsCount = db.prepare('SELECT COUNT(*) as count FROM wifi_access_points').get().count;
    const wifiControllersCount = db.prepare('SELECT COUNT(*) as count FROM wifi_controllers').get().count;
    const antivirusCount = db.prepare('SELECT COUNT(*) as count FROM antivirus_licenses').get().count;
    const mailAccountsCount = db.prepare('SELECT COUNT(*) as count FROM mail_accounts').get().count;
    const mailServicesCount = db.prepare('SELECT COUNT(*) as count FROM mail_services').get().count;

    res.json({
      customers: customersCount,
      servers: serversCount,
      vms: vmsCount,
      pcs: pcsCount,
      firewalls: firewallsCount,
      backups: backupsCount,
      lines: linesCount,
      wifi_aps: wifiApsCount,
      wifi_controllers: wifiControllersCount,
      antivirus: antivirusCount,
      mail_accounts: mailAccountsCount,
      mail_services: mailServicesCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- CUSTOMERS -----------------
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT c.*,
        (SELECT COUNT(*) FROM physical_servers WHERE customer_id = c.id) as server_count,
        (SELECT COUNT(*) FROM virtual_machines WHERE customer_id = c.id) as vm_count,
        (SELECT COUNT(*) FROM user_computers WHERE customer_id = c.id) as pc_count,
        (SELECT COUNT(*) FROM firewalls WHERE customer_id = c.id) as firewall_count,
        (SELECT COUNT(*) FROM backup_units WHERE customer_id = c.id) as backup_count,
        (SELECT COUNT(*) FROM internet_lines WHERE customer_id = c.id) as line_count,
        (SELECT COUNT(*) FROM wifi_access_points WHERE customer_id = c.id) as wifi_ap_count,
        (SELECT COUNT(*) FROM wifi_controllers WHERE customer_id = c.id) as wifi_controller_count,
        (SELECT COUNT(*) FROM antivirus_licenses WHERE customer_id = c.id) as antivirus_count,
        (SELECT COUNT(*) FROM mail_accounts WHERE customer_id = c.id) as mail_account_count,
        (SELECT COUNT(*) FROM mail_services WHERE customer_id = c.id) as mail_service_count
      FROM customers c
      ORDER BY c.name ASC
    `).all();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı' });
    }

    const internet_lines = db.prepare('SELECT * FROM internet_lines WHERE customer_id = ? ORDER BY is_primary DESC, branch_name ASC').all(customer.id);
    const physical_servers = db.prepare('SELECT * FROM physical_servers WHERE customer_id = ? ORDER BY server_name ASC').all(customer.id);
    const virtual_machines = db.prepare(`
      SELECT vm.*, ps.server_name as physical_server_name
      FROM virtual_machines vm
      LEFT JOIN physical_servers ps ON vm.physical_server_id = ps.id
      WHERE vm.customer_id = ?
      ORDER BY vm.vm_name ASC
    `).all(customer.id);
    const user_computers = db.prepare('SELECT * FROM user_computers WHERE customer_id = ? ORDER BY computer_name ASC').all(customer.id);
    const firewalls = db.prepare('SELECT * FROM firewalls WHERE customer_id = ? ORDER BY device_name ASC').all(customer.id);
    const backup_units = db.prepare('SELECT * FROM backup_units WHERE customer_id = ? ORDER BY device_name ASC').all(customer.id);
    const wifi_controllers = db.prepare('SELECT * FROM wifi_controllers WHERE customer_id = ? ORDER BY controller_name ASC').all(customer.id);
    const wifi_access_points = db.prepare(`
      SELECT ap.*, wc.controller_name
      FROM wifi_access_points ap
      LEFT JOIN wifi_controllers wc ON ap.controller_id = wc.id
      WHERE ap.customer_id = ?
      ORDER BY ap.branch_name ASC, ap.ap_name ASC
    `).all(customer.id);
    const wifi_networks = db.prepare(`
      SELECT wn.*, wc.controller_name
      FROM wifi_networks wn
      LEFT JOIN wifi_controllers wc ON wn.controller_id = wc.id
      WHERE wn.customer_id = ?
      ORDER BY wn.branch_name ASC, wn.ssid ASC
    `).all(customer.id);
    const antivirus_licenses = db.prepare('SELECT * FROM antivirus_licenses WHERE customer_id = ? ORDER BY product_name ASC').all(customer.id);
    const mail_services = db.prepare('SELECT * FROM mail_services WHERE customer_id = ? ORDER BY service_name ASC').all(customer.id);
    const mail_accounts = db.prepare(`
      SELECT ma.*, ms.service_name, ms.service_type, ms.domain_name
      FROM mail_accounts ma
      LEFT JOIN mail_services ms ON ma.mail_service_id = ms.id
      WHERE ma.customer_id = ?
      ORDER BY ma.full_name ASC, ma.email_address ASC
    `).all(customer.id);

    res.json({
      ...customer,
      internet_lines,
      physical_servers,
      virtual_machines,
      user_computers,
      firewalls,
      backup_units,
      wifi_controllers,
      wifi_access_points,
      wifi_networks,
      antivirus_licenses,
      mail_services,
      mail_accounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to find installed Chrome or Edge executable on Windows
function getBrowserExecutable() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const cand of candidates) {
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}

// PDF Generation Endpoint via Headless Chromium / Edge
app.post('/api/generate-pdf', (req, res) => {
  const os = require('os');
  const { execSync } = require('child_process');

  try {
    const { html, filename = 'OMNIFlow_Rapor.pdf' } = req.body;
    if (!html) {
      return res.status(400).json({ error: 'Rapor HTML içeriği gönderilmedi.' });
    }

    const browserPath = getBrowserExecutable();
    if (!browserPath) {
      return res.status(500).json({ error: 'Sistemde Chrome veya Edge tarayıcı bulunamadı.' });
    }

    const tempId = 'omniflow_pdf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const tempHtml = path.join(os.tmpdir(), `${tempId}.html`);
    const tempPdf = path.join(os.tmpdir(), `${tempId}.pdf`);

    const fullHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    * { box-sizing: border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    html, body {
      margin: 0; padding: 12px;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 12px !important; font-size: 10.5px !important; }
    th, td { border: 1px solid #cbd5e1 !important; padding: 5px 7px !important; text-align: left; }
    th { background: #f8fafc !important; font-weight: bold; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
    .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
  </style>
</head>
<body style="background: #ffffff; color: #0f172a; padding: 10px;">
  ${html}
</body>
</html>`;

    fs.writeFileSync(tempHtml, fullHtml, 'utf8');

    // Run headless browser print to PDF
    execSync(`"${browserPath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${tempPdf}" "${tempHtml}"`, {
      timeout: 25000
    });

    if (!fs.existsSync(tempPdf)) {
      throw new Error('PDF dosyası oluşturulamadı.');
    }

    const pdfBuffer = fs.readFileSync(tempPdf);

    // Clean up temporary files safely
    try { fs.unlinkSync(tempHtml); } catch (e) {}
    try { fs.unlinkSync(tempPdf); } catch (e) {}

    const cleanFilename = (filename.endsWith('.pdf') ? filename : `${filename}.pdf`).replace(/[^a-zA-Z0-9_\-\.]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    return res.status(500).json({ error: 'PDF oluşturma hatası: ' + err.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, code, contact_person, phone, email, address, external_ip, notes } = req.body;
    const cleanName = String(name || req.body.company_name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ error: 'Müşteri adı zorunludur' });
    }
    const cleanCode = String(code || req.body.short_code || '').trim();
    const cleanContact = String(contact_person || req.body.authorized_person || '').trim();
    const cleanPhone = String(phone || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanAddress = String(address || '').trim();
    const cleanExternalIp = String(external_ip || '').trim();
    const cleanNotes = String(notes || '').trim();

    const stmt = db.prepare(`
      INSERT INTO customers (name, code, contact_person, phone, email, address, external_ip, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(cleanName, cleanCode, cleanContact, cleanPhone, cleanEmail, cleanAddress, cleanExternalIp, cleanNotes);
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    security.logSecurityEvent('CUSTOMER_CREATED', req.ip, req.user?.username || 'user', `Created customer: ${cleanName}`);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Customer create error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const { name, code, contact_person, phone, email, address, external_ip, notes } = req.body;
    const cleanName = String(name || req.body.company_name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ error: 'Müşteri adı zorunludur' });
    }
    const cleanCode = String(code || req.body.short_code || '').trim();
    const cleanContact = String(contact_person || req.body.authorized_person || '').trim();
    const cleanPhone = String(phone || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanAddress = String(address || '').trim();
    const cleanExternalIp = String(external_ip || '').trim();
    const cleanNotes = String(notes || '').trim();

    const stmt = db.prepare(`
      UPDATE customers
      SET name = ?, code = ?, contact_person = ?, phone = ?, email = ?, address = ?, external_ip = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(cleanName, cleanCode, cleanContact, cleanPhone, cleanEmail, cleanAddress, cleanExternalIp, cleanNotes, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: `Güncellenecek müşteri bulunamadı (ID: ${req.params.id})` });
    }
    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    security.logSecurityEvent('CUSTOMER_UPDATED', req.ip, req.user?.username || 'user', `Updated customer ID ${req.params.id}: ${cleanName}`);
    res.json(updated);
  } catch (error) {
    console.error('Customer update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    // 1. Role Check: Sadece Admin silebilir
    if (!req.user || (req.user.role !== 'admin' && req.user.username !== 'admin')) {
      return res.status(403).json({
        error: 'Yetkisiz İşlem: Müşteri silme yetkisi sadece Sistem Yöneticisine (Admin) aittir.',
        code: 'ADMIN_ONLY'
      });
    }

    // 2. Parola Koruması (Admin Password Verification):
    let rawPassword = req.body?.adminPassword;
    if (!rawPassword && req.headers['x-admin-password']) {
      try {
        rawPassword = decodeURIComponent(req.headers['x-admin-password']);
      } catch (e) {
        rawPassword = req.headers['x-admin-password'];
      }
    }

    if (!rawPassword || !String(rawPassword).trim()) {
      return res.status(400).json({
        error: 'Güvenlik Doğrulaması Gerekli: Müşteriyi silmek için lütfen yönetici parolanızı girin.',
        code: 'PASSWORD_REQUIRED'
      });
    }

    const adminPassword = String(rawPassword).trim();

    // Verify admin password against the current user in users table
    const currentUserRow = db.prepare('SELECT password FROM users WHERE id = ? OR username = ?').get(req.user.id || '', req.user.username || '');
    if (!currentUserRow || !security.verifyPassword(adminPassword, currentUserRow.password)) {
      return res.status(401).json({
        error: 'Hatalı Yönetici Parolası! Güvenlik doğrulaması başarısız oldu, müşteri silinmedi.',
        code: 'INVALID_ADMIN_PASSWORD'
      });
    }

    // Find customer for audit logging
    const customer = db.prepare('SELECT name FROM customers WHERE id = ?').get(req.params.id);
    const customerName = customer ? customer.name : 'Bilinmeyen Müşteri';

    // Delete customer (Cascades to all computers, firewalls, servers, vms, etc.)
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);

    console.log(`[AUDIT-SECURITY] Müşteri "${customerName}" (ID: ${req.params.id}) yönetici (${req.user.username}) tarafından 2 aşamalı parola doğrulamasıyla kalıcı olarak silindi.`);

    res.json({
      success: true,
      message: `"${customerName}" müşterisi ve tüm ilişkili kayıtlar başarıyla silindi.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- PHYSICAL SERVERS -----------------
app.get('/api/physical-servers', (req, res) => {
  try {
    const { customerId } = req.query;
    let servers;
    if (customerId) {
      servers = db.prepare('SELECT * FROM physical_servers WHERE customer_id = ? ORDER BY server_name ASC').all(customerId);
    } else {
      servers = db.prepare(`
        SELECT ps.*, c.name as customer_name
        FROM physical_servers ps
        JOIN customers c ON ps.customer_id = c.id
        ORDER BY c.name, ps.server_name
      `).all();
    }
    const allowPasswords = security.canViewPasswords(req.user);
    const decrypted = servers.map(s => ({
      ...s,
      management_password: allowPasswords ? security.decryptSensitive(s.management_password) : '••••••••'
    }));
    res.json(decrypted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/physical-servers', (req, res) => {
  try {
    const {
      customer_id, server_name, brand, model, serial_number, cpu_info, ram_info, disk_info,
      ip_address, mac_address, management_ip, management_user, management_password,
      local_admin_user, local_admin_password,
      branch_name, location, status, notes
    } = req.body;

    if (!customer_id || !server_name) {
      return res.status(400).json({ error: 'Müşteri ve Sunucu Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO physical_servers (
        customer_id, server_name, brand, model, serial_number, cpu_info, ram_info, disk_info,
        ip_address, mac_address, management_ip, management_user, management_password,
        local_admin_user, local_admin_password,
        branch_name, location, status, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, server_name.trim(), brand || '', model || '', serial_number || '',
      cpu_info || '', ram_info || '', disk_info || '', ip_address || '', mac_address || '',
      management_ip || '', management_user || '', security.encryptSensitive(management_password || ''),
      local_admin_user || '', local_admin_password || '',
      branch_name || 'Merkez Ofis', location || '', status || 'Aktif', notes || ''
    );

    const created = db.prepare('SELECT * FROM physical_servers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/physical-servers/:id', (req, res) => {
  try {
    const {
      server_name, brand, model, serial_number, cpu_info, ram_info, disk_info,
      ip_address, mac_address, management_ip, management_user, management_password,
      local_admin_user, local_admin_password,
      branch_name, location, status, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE physical_servers SET
        server_name = ?, brand = ?, model = ?, serial_number = ?, cpu_info = ?, ram_info = ?, disk_info = ?,
        ip_address = ?, mac_address = ?, management_ip = ?, management_user = ?, management_password = ?,
        local_admin_user = ?, local_admin_password = ?,
        branch_name = ?, location = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      server_name.trim(), brand || '', model || '', serial_number || '',
      cpu_info || '', ram_info || '', disk_info || '', ip_address || '', mac_address || '',
      management_ip || '', management_user || '', management_password || '',
      local_admin_user || '', local_admin_password || '',
      branch_name || 'Merkez Ofis', location || '', status || 'Aktif', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM physical_servers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/physical-servers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM physical_servers WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Fiziksel sunucu silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- VIRTUAL MACHINES -----------------
app.get('/api/virtual-machines', (req, res) => {
  try {
    const { customerId } = req.query;
    let vms;
    if (customerId) {
      vms = db.prepare(`
        SELECT vm.*, ps.server_name as physical_server_name
        FROM virtual_machines vm
        LEFT JOIN physical_servers ps ON vm.physical_server_id = ps.id
        WHERE vm.customer_id = ?
        ORDER BY vm.vm_name ASC
      `).all(customerId);
    } else {
      vms = db.prepare(`
        SELECT vm.*, c.name as customer_name, ps.server_name as physical_server_name
        FROM virtual_machines vm
        JOIN customers c ON vm.customer_id = c.id
        LEFT JOIN physical_servers ps ON vm.physical_server_id = ps.id
        ORDER BY c.name, vm.vm_name
      `).all();
    }
    res.json(vms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/virtual-machines', (req, res) => {
  try {
    const {
      customer_id, physical_server_id, vm_name, hypervisor, role_description,
      vcpu, ram, disk, ip_address, mac_address, os_version, os_license_key,
      office_version, office_license_key, local_admin_user, local_admin_password, status, notes
    } = req.body;

    if (!customer_id || !vm_name) {
      return res.status(400).json({ error: 'Müşteri ve Sanal Makine Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO virtual_machines (
        customer_id, physical_server_id, vm_name, hypervisor, role_description,
        vcpu, ram, disk, ip_address, mac_address, os_version, os_license_key,
        office_version, office_license_key, local_admin_user, local_admin_password, status, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, physical_server_id ? Number(physical_server_id) : null,
      vm_name.trim(), hypervisor || '', role_description || '', vcpu || '', ram || '', disk || '',
      ip_address || '', mac_address || '', os_version || '', os_license_key || '',
      office_version || '', office_license_key || '', local_admin_user || '', local_admin_password || '',
      status || 'Aktif', notes || ''
    );

    const created = db.prepare('SELECT * FROM virtual_machines WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/virtual-machines/:id', (req, res) => {
  try {
    const {
      physical_server_id, vm_name, hypervisor, role_description,
      vcpu, ram, disk, ip_address, mac_address, os_version, os_license_key,
      office_version, office_license_key, local_admin_user, local_admin_password, status, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE virtual_machines SET
        physical_server_id = ?, vm_name = ?, hypervisor = ?, role_description = ?,
        vcpu = ?, ram = ?, disk = ?, ip_address = ?, mac_address = ?, os_version = ?, os_license_key = ?,
        office_version = ?, office_license_key = ?, local_admin_user = ?, local_admin_password = ?,
        status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      physical_server_id ? Number(physical_server_id) : null,
      vm_name.trim(), hypervisor || '', role_description || '',
      vcpu || '', ram || '', disk || '', ip_address || '', mac_address || '',
      os_version || '', os_license_key || '', office_version || '', office_license_key || '',
      local_admin_user || '', local_admin_password || '',
      status || 'Aktif', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM virtual_machines WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/virtual-machines/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM virtual_machines WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Sanal makine silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// POWERSHELL HARDWARE & LICENSE COLLECTOR AGENT APIS
// ==========================================

// Serve dynamic PowerShell script locked to customer
app.get('/api/agent/collector.ps1', (req, res) => {
  try {
    const { c: customerId, b: branchName, t: targetType = 'computer' } = req.query;
    if (!customerId) {
      return res.status(400).send('# Hata: Müşteri parametresi (c) zorunludur.');
    }
    const customer = db.prepare('SELECT id, name FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      return res.status(404).send(`# Hata: Müşteri bulunamadı (ID: ${customerId})`);
    }

    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const serverUrl = `${proto}://${host}`;

    const script = agentCollector.generateCollectorScript({
      customerId: customer.id,
      customerName: customer.name,
      branchName: branchName || 'Merkez Ofis',
      serverUrl,
      targetType
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(script);
  } catch (err) {
    res.status(500).send(`# Sunucu Hatası: ${err.message}`);
  }
});

// Downloadable standalone .bat or .ps1 runner file
app.get('/api/agent/download/:customerId', (req, res) => {
  try {
    const customerId = req.params.customerId;
    const branchName = req.query.b || 'Merkez Ofis';
    const format = req.query.format || 'bat';
    const targetType = req.query.t || 'computer';

    const customer = db.prepare('SELECT id, name FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      return res.status(404).send('Müşteri bulunamadı');
    }

    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:5000';
    const serverUrl = `${proto}://${host}`;

    const safeName = (customer.name || 'Musteri').replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, '_');
    const label = targetType === 'server' ? 'Sunucu' : 'PC';

    if (format === 'ps1') {
      const script = agentCollector.generateCollectorScript({
        customerId: customer.id,
        customerName: customer.name,
        branchName,
        serverUrl,
        targetType
      });
      res.setHeader('Content-Disposition', `attachment; filename="OMNIFlow_${safeName}_${label}_Toplayici.ps1"`);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(script);
    } else {
      const bat = agentCollector.generateCollectorBat({
        customerId: customer.id,
        customerName: customer.name,
        branchName,
        serverUrl,
        targetType
      });
      res.setHeader('Content-Disposition', `attachment; filename="OMNIFlow_${safeName}_${label}_Toplayici.bat"`);
      res.setHeader('Content-Type', 'application/x-bat; charset=utf-8');
      return res.send(bat);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Register Computer from PowerShell Agent
app.post('/api/agent/register-computer', (req, res) => {
  try {
    const result = agentCollector.handleRegisterComputer(db, req.body);
    res.json(result);
  } catch (err) {
    console.error('Agent register computer error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Register Physical Server from PowerShell Agent
app.post('/api/agent/register-server', (req, res) => {
  try {
    const result = agentCollector.handleRegisterServer(db, req.body);
    res.json(result);
  } catch (err) {
    console.error('Agent register server error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------- USER COMPUTERS -----------------
app.get('/api/user-computers', (req, res) => {
  try {
    const { customerId } = req.query;
    let pcs;
    if (customerId) {
      pcs = db.prepare('SELECT * FROM user_computers WHERE customer_id = ? ORDER BY computer_name ASC').all(customerId);
    } else {
      pcs = db.prepare(`
        SELECT uc.*, c.name as customer_name
        FROM user_computers uc
        JOIN customers c ON uc.customer_id = c.id
        ORDER BY c.name, uc.computer_name
      `).all();
    }
    res.json(pcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user-computers', (req, res) => {
  try {
    const {
      customer_id, computer_name, assigned_user, department, branch_name, device_type, brand, model,
      serial_number, hardware_specs, os_version, os_license_key, office_version, office_license_key,
      ethernet_ip, ethernet_mac, wifi_ip, wifi_mac, remote_access_id,
      local_admin_user, local_admin_password, antivirus, notes
    } = req.body;

    if (!customer_id || !computer_name) {
      return res.status(400).json({ error: 'Müşteri ve Bilgisayar Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO user_computers (
        customer_id, computer_name, assigned_user, department, branch_name, device_type, brand, model,
        serial_number, hardware_specs, os_version, os_license_key, office_version, office_license_key,
        ethernet_ip, ethernet_mac, wifi_ip, wifi_mac, remote_access_id,
        local_admin_user, local_admin_password, antivirus, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, computer_name.trim(), assigned_user || '', department || '', branch_name || 'Merkez Ofis', device_type || 'Masaüstü',
      brand || '', model || '', serial_number || '', hardware_specs || '',
      os_version || '', os_license_key || '', office_version || '', office_license_key || '',
      ethernet_ip || '', ethernet_mac || '', wifi_ip || '', wifi_mac || '',
      remote_access_id || '', local_admin_user || '', local_admin_password || '',
      antivirus || '', notes || ''
    );

    const created = db.prepare('SELECT * FROM user_computers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user-computers/:id', (req, res) => {
  try {
    const {
      computer_name, assigned_user, department, branch_name, device_type, brand, model,
      serial_number, hardware_specs, os_version, os_license_key, office_version, office_license_key,
      ethernet_ip, ethernet_mac, wifi_ip, wifi_mac, remote_access_id,
      local_admin_user, local_admin_password, antivirus, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE user_computers SET
        computer_name = ?, assigned_user = ?, department = ?, branch_name = ?, device_type = ?, brand = ?, model = ?,
        serial_number = ?, hardware_specs = ?, os_version = ?, os_license_key = ?, office_version = ?, office_license_key = ?,
        ethernet_ip = ?, ethernet_mac = ?, wifi_ip = ?, wifi_mac = ?, remote_access_id = ?,
        local_admin_user = ?, local_admin_password = ?, antivirus = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      computer_name.trim(), assigned_user || '', department || '', branch_name || 'Merkez Ofis', device_type || 'Masaüstü',
      brand || '', model || '', serial_number || '', hardware_specs || '',
      os_version || '', os_license_key || '', office_version || '', office_license_key || '',
      ethernet_ip || '', ethernet_mac || '', wifi_ip || '', wifi_mac || '',
      remote_access_id || '', local_admin_user || '', local_admin_password || '',
      antivirus || '', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM user_computers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/user-computers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM user_computers WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Kullanıcı bilgisayarı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- FIREWALLS & ALERTS -----------------
app.get('/api/alerts/firewall-licenses', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT f.*, c.name as customer_name, c.code as customer_code
      FROM firewalls f
      JOIN customers c ON f.customer_id = c.id
      WHERE f.license_expiry IS NOT NULL AND TRIM(f.license_expiry) != ''
      ORDER BY c.name, f.device_name
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/alerts/antivirus-licenses', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT av.*, c.name as customer_name, c.code as customer_code
      FROM antivirus_licenses av
      JOIN customers c ON av.customer_id = c.id
      WHERE av.license_expiry IS NOT NULL AND TRIM(av.license_expiry) != ''
      ORDER BY c.name, av.product_name
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/alerts/all-licenses', (req, res) => {
  try {
    const firewalls = db.prepare(`
      SELECT f.id, f.customer_id, f.device_name as name, f.brand, f.model, f.license_expiry,
             'firewall' as type, 'Firewall' as typeLabel,
             c.name as customer_name, c.code as customer_code, f.management_ip as access_info,
             f.branch_name
      FROM firewalls f
      JOIN customers c ON f.customer_id = c.id
      WHERE f.license_expiry IS NOT NULL AND TRIM(f.license_expiry) != ''
    `).all();

    const antiviruses = db.prepare(`
      SELECT av.id, av.customer_id, av.product_name as name, av.brand, '' as model, av.user_count, av.license_term, av.license_expiry,
             'antivirus' as type, 'Antivirüs' as typeLabel,
             c.name as customer_name, c.code as customer_code, av.portal_url as access_info,
             av.branch_name
      FROM antivirus_licenses av
      JOIN customers c ON av.customer_id = c.id
      WHERE av.license_expiry IS NOT NULL AND TRIM(av.license_expiry) != ''
    `).all();

    const mailLicenses = db.prepare(`
      SELECT ms.id, ms.customer_id, ms.service_name as name, 'Exchange / Kurumsal Mail' as brand, ms.license_type as model,
             ms.license_count as user_count, 'Yıllık Abonelik' as license_term, ms.license_expiry,
             'mail' as type, 'Kurumsal Mail' as typeLabel,
             c.name as customer_name, c.code as customer_code, ms.admin_panel_url as access_info,
             'Merkez Ofis' as branch_name
      FROM mail_services ms
      JOIN customers c ON ms.customer_id = c.id
      WHERE ms.is_exchange_or_subscription = 1 AND ms.license_expiry IS NOT NULL AND TRIM(ms.license_expiry) != ''
    `).all();

    res.json([...firewalls, ...antiviruses, ...mailLicenses]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/firewalls', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare('SELECT * FROM firewalls WHERE customer_id = ? ORDER BY device_name ASC').all(customerId);
    } else {
      rows = db.prepare(`
        SELECT f.*, c.name as customer_name
        FROM firewalls f
        JOIN customers c ON f.customer_id = c.id
        ORDER BY c.name, f.device_name
      `).all();
    }
    const allowPasswords = security.canViewPasswords(req.user);
    const decrypted = rows.map(r => ({
      ...r,
      password: allowPasswords ? security.decryptSensitive(r.password) : '••••••••'
    }));
    res.json(decrypted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/firewalls', (req, res) => {
  try {
    const {
      customer_id, device_name, branch_name, brand, model, management_ip, username,
      password, external_ip, firmware_version, license_expiry, ssl_vpn_portal, notes
    } = req.body;

    if (!customer_id || !device_name) {
      return res.status(400).json({ error: 'Müşteri ve Cihaz Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO firewalls (
        customer_id, device_name, branch_name, brand, model, management_ip, username,
        password, external_ip, firmware_version, license_expiry, ssl_vpn_portal, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, device_name.trim(), branch_name || 'Merkez Ofis', brand || '', model || '', management_ip || '',
      username || '', security.encryptSensitive(password || ''), external_ip || '', firmware_version || '',
      license_expiry || '', ssl_vpn_portal || '', notes || ''
    );

    const created = db.prepare('SELECT * FROM firewalls WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/firewalls/:id', (req, res) => {
  try {
    const {
      device_name, branch_name, brand, model, management_ip, username,
      password, external_ip, firmware_version, license_expiry, ssl_vpn_portal, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE firewalls SET
        device_name = ?, branch_name = ?, brand = ?, model = ?, management_ip = ?, username = ?,
        password = ?, external_ip = ?, firmware_version = ?, license_expiry = ?,
        ssl_vpn_portal = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      device_name.trim(), branch_name || 'Merkez Ofis', brand || '', model || '', management_ip || '',
      username || '', security.encryptSensitive(password || ''), external_ip || '', firmware_version || '',
      license_expiry || '', ssl_vpn_portal || '', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM firewalls WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/firewalls/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM firewalls WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Firewall kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- ANTIVIRUS LICENSES -----------------
app.get('/api/antivirus-licenses', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare('SELECT * FROM antivirus_licenses WHERE customer_id = ? ORDER BY product_name ASC').all(customerId);
    } else {
      rows = db.prepare(`
        SELECT av.*, c.name as customer_name
        FROM antivirus_licenses av
        JOIN customers c ON av.customer_id = c.id
        ORDER BY c.name, av.product_name
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/antivirus-licenses', (req, res) => {
  try {
    const {
      customer_id, product_name, brand, branch_name, portal_url, username,
      password, user_count, license_term, license_expiry, license_key, notes
    } = req.body;

    if (!customer_id || !product_name) {
      return res.status(400).json({ error: 'Müşteri ve Ürün Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO antivirus_licenses (
        customer_id, product_name, brand, branch_name, portal_url, username,
        password, user_count, license_term, license_expiry, license_key, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, product_name.trim(), brand || 'Kaspersky', branch_name || 'Merkez Ofis',
      portal_url || '', username || '', password || '', Number(user_count) || 1,
      license_term || '1 Yıllık', license_expiry || '', license_key || '', notes || ''
    );

    const created = db.prepare('SELECT * FROM antivirus_licenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/antivirus-licenses/:id', (req, res) => {
  try {
    const {
      product_name, brand, branch_name, portal_url, username,
      password, user_count, license_term, license_expiry, license_key, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE antivirus_licenses SET
        product_name = ?, brand = ?, branch_name = ?, portal_url = ?, username = ?,
        password = ?, user_count = ?, license_term = ?, license_expiry = ?,
        license_key = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      product_name.trim(), brand || 'Kaspersky', branch_name || 'Merkez Ofis',
      portal_url || '', username || '', password || '', Number(user_count) || 1,
      license_term || '1 Yıllık', license_expiry || '', license_key || '',
      notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM antivirus_licenses WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/antivirus-licenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM antivirus_licenses WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Antivirüs lisans kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- MAIL SERVICES (PANELS & EXCHANGE) -----------------
app.get('/api/mail-services', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare('SELECT * FROM mail_services WHERE customer_id = ? ORDER BY service_name ASC').all(customerId);
    } else {
      rows = db.prepare(`
        SELECT ms.*, c.name as customer_name, c.code as customer_code
        FROM mail_services ms
        JOIN customers c ON ms.customer_id = c.id
        ORDER BY c.name, ms.service_name
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mail-services', (req, res) => {
  try {
    const {
      customer_id, service_name, service_type, domain_name, admin_panel_url,
      admin_username, admin_password, portal_notes, is_exchange_or_subscription,
      license_type, license_count, license_start_date, license_expiry, reseller_partner,
      incoming_server, outgoing_server, dns_records_status, notes,
      m365_tenant_id, m365_client_id, m365_client_secret
    } = req.body;

    if (!customer_id || !service_name) {
      return res.status(400).json({ error: 'Müşteri ve Servis Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO mail_services (
        customer_id, service_name, service_type, domain_name, admin_panel_url,
        admin_username, admin_password, portal_notes, is_exchange_or_subscription,
        license_type, license_count, license_start_date, license_expiry, reseller_partner,
        incoming_server, outgoing_server, dns_records_status, notes,
        m365_tenant_id, m365_client_id, m365_client_secret, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, (service_name || '').trim(), service_type || 'Microsoft 365', domain_name || '',
      admin_panel_url || '', admin_username || '', admin_password || '', portal_notes || '',
      is_exchange_or_subscription !== undefined ? Number(is_exchange_or_subscription) : 1,
      license_type || '', Number(license_count) || 1, license_start_date || '',
      license_expiry || '', reseller_partner || '', incoming_server || '', outgoing_server || '',
      dns_records_status || '', notes || '',
      m365_tenant_id || '', m365_client_id || '', m365_client_secret || ''
    );

    const created = db.prepare('SELECT * FROM mail_services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/mail-services/:id', (req, res) => {
  try {
    const {
      service_name, service_type, domain_name, admin_panel_url,
      admin_username, admin_password, portal_notes, is_exchange_or_subscription,
      license_type, license_count, license_start_date, license_expiry, reseller_partner,
      incoming_server, outgoing_server, dns_records_status, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE mail_services SET
        service_name = ?, service_type = ?, domain_name = ?, admin_panel_url = ?,
        admin_username = ?, admin_password = ?, portal_notes = ?, is_exchange_or_subscription = ?,
        license_type = ?, license_count = ?, license_start_date = ?, license_expiry = ?, reseller_partner = ?,
        incoming_server = ?, outgoing_server = ?, dns_records_status = ?, notes = ?,
        m365_tenant_id = ?, m365_client_id = ?, m365_client_secret = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      (service_name || '').trim(), service_type || 'Microsoft 365', domain_name || '',
      admin_panel_url || '', admin_username || '', admin_password || '', portal_notes || '',
      is_exchange_or_subscription !== undefined ? Number(is_exchange_or_subscription) : 1,
      license_type || '', Number(license_count) || 1, license_start_date || '',
      license_expiry || '', reseller_partner || '', incoming_server || '', outgoing_server || '',
      dns_records_status || '', notes || '',
      m365_tenant_id || '', m365_client_id || '', m365_client_secret || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM mail_services WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/mail-services/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM mail_services WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Mail servis ve panel kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- MAIL ACCOUNTS (USER MAILBOXES) -----------------
app.get('/api/mail-accounts', (req, res) => {
  try {
    const { customerId, mailServiceId } = req.query;
    let rows;
    if (customerId && mailServiceId) {
      rows = db.prepare(`
        SELECT ma.*, ms.service_name, ms.service_type, ms.domain_name
        FROM mail_accounts ma
        LEFT JOIN mail_services ms ON ma.mail_service_id = ms.id
        WHERE ma.customer_id = ? AND ma.mail_service_id = ?
        ORDER BY ma.full_name ASC
      `).all(customerId, mailServiceId);
    } else if (customerId) {
      rows = db.prepare(`
        SELECT ma.*, ms.service_name, ms.service_type, ms.domain_name
        FROM mail_accounts ma
        LEFT JOIN mail_services ms ON ma.mail_service_id = ms.id
        WHERE ma.customer_id = ?
        ORDER BY ma.full_name ASC
      `).all(customerId);
    } else {
      rows = db.prepare(`
        SELECT ma.*, c.name as customer_name, ms.service_name
        FROM mail_accounts ma
        JOIN customers c ON ma.customer_id = c.id
        LEFT JOIN mail_services ms ON ma.mail_service_id = ms.id
        ORDER BY c.name, ma.full_name
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Bulk Insert / Update Mail Accounts (from Microsoft 365 or Clipboard CSV)
app.post('/api/mail-accounts/bulk', (req, res) => {
  try {
    const { customer_id, mail_service_id, accounts } = req.body;
    if (!customer_id || !Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ error: 'Müşteri ve en az bir e-posta hesabı gereklidir' });
    }

    const checkStmt = db.prepare('SELECT id, password FROM mail_accounts WHERE customer_id = ? AND email_address = ?');
    const insertStmt = db.prepare(`
      INSERT INTO mail_accounts (
        customer_id, mail_service_id, full_name, email_address, password,
        department, branch_name, mailbox_type, license_type, quota_limit,
        phone_or_recovery, is_mfa_active, status, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const updateStmt = db.prepare(`
      UPDATE mail_accounts SET
        mail_service_id = COALESCE(?, mail_service_id),
        full_name = ?,
        department = ?,
        branch_name = ?,
        mailbox_type = ?,
        license_type = ?,
        quota_limit = ?,
        phone_or_recovery = ?,
        status = ?,
        password = CASE WHEN ? != '' THEN ? ELSE password END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    let createdCount = 0;
    let updatedCount = 0;

    db.exec('BEGIN');
    try {
      for (const item of accounts) {
        const email = (item.email_address || '').trim().toLowerCase();
        const fullName = (item.full_name || email.split('@')[0] || '').trim();
        if (!email || !email.includes('@')) continue;

        const existing = checkStmt.get(customer_id, email);
        if (existing) {
          updateStmt.run(
            mail_service_id ? Number(mail_service_id) : null,
            fullName,
            item.department || 'Genel',
            item.branch_name || 'Merkez Ofis',
            item.mailbox_type || 'Kullanıcı',
            item.license_type || '',
            item.quota_limit || '50 GB',
            item.phone_or_recovery || '',
            item.status || 'Aktif',
            item.password || '',
            item.password || '',
            existing.id
          );
          updatedCount++;
        } else {
          insertStmt.run(
            customer_id,
            mail_service_id ? Number(mail_service_id) : null,
            fullName,
            email,
            item.password || '',
            item.department || 'Genel',
            item.branch_name || 'Merkez Ofis',
            item.mailbox_type || 'Kullanıcı',
            item.license_type || '',
            item.quota_limit || '50 GB',
            item.phone_or_recovery || '',
            item.is_mfa_active !== undefined ? (item.is_mfa_active ? 1 : 0) : 1,
            item.status || 'Aktif',
            item.notes || ''
          );
          createdCount++;
        }
      }
      db.exec('COMMIT');
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }

    res.json({
      success: true,
      total: accounts.length,
      createdCount,
      updatedCount,
      message: `${createdCount} yeni kullanıcı eklendi, ${updatedCount} kullanıcı güncellendi.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Microsoft Graph API: Fetch All Users & Mailboxes
app.post('/api/m365/fetch-users', async (req, res) => {
  try {
    const { tenant_id, client_id, client_secret } = req.body;
    if (!tenant_id || !client_id || !client_secret) {
      return res.status(400).json({
        error: 'Microsoft 365 bağlantısı için Tenant ID, Client ID ve Client Secret alanları zorunludur.'
      });
    }

    // 1. Get OAuth2 Token from Microsoft Entra ID
    const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenant_id.trim())}/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      client_id: client_id.trim(),
      scope: 'https://graph.microsoft.com/.default',
      client_secret: client_secret.trim(),
      grant_type: 'client_credentials'
    });

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      const desc = tokenData.error_description || tokenData.error || 'Kimlik doğrulama başarısız';
      return res.status(401).json({
        error: `Microsoft 365 Yetkilendirme Başarısız: ${desc}. Lütfen Tenant ID, Client ID veya Client Secret değerini kontrol edin.`
      });
    }

    // 2. Fetch Users from Microsoft Graph API
    const graphUrl = 'https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,userPrincipalName,department,jobTitle,mobilePhone,businessPhones,assignedLicenses,accountEnabled&$top=999';
    const graphRes = await fetch(graphUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const graphData = await graphRes.json();
    if (!graphRes.ok || !graphData.value) {
      const msg = graphData.error?.message || 'Kullanıcı listesi alınamadı';
      return res.status(graphRes.status).json({
        error: `Microsoft Graph Hatası: ${msg}. Azure App Registration üzerinde 'User.Read.All' izni verildiğinden ve 'Grant admin consent' yapıldığından emin olun.`
      });
    }

    // 3. Format and normalize users for OMNIFlow
    const users = graphData.value.map(u => {
      const email = u.mail || u.userPrincipalName || '';
      const phones = [u.mobilePhone, ...(u.businessPhones || [])].filter(Boolean);
      return {
        id: u.id,
        full_name: u.displayName || email.split('@')[0],
        email_address: email.toLowerCase(),
        department: u.department || 'Genel',
        job_title: u.jobTitle || '',
        phone_or_recovery: phones[0] || '',
        status: u.accountEnabled !== false ? 'Aktif' : 'Pasif',
        is_mfa_active: 1,
        license_count: u.assignedLicenses?.length || 0
      };
    }).filter(u => u.email_address && u.email_address.includes('@'));

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mail-accounts', (req, res) => {
  try {
    const {
      customer_id, mail_service_id, full_name, email_address, password,
      department, branch_name, mailbox_type, license_type, quota_limit,
      phone_or_recovery, is_mfa_active, status, notes
    } = req.body;

    if (!customer_id || !email_address || !full_name) {
      return res.status(400).json({ error: 'Müşteri, İsim ve E-posta adresi zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO mail_accounts (
        customer_id, mail_service_id, full_name, email_address, password,
        department, branch_name, mailbox_type, license_type, quota_limit,
        phone_or_recovery, is_mfa_active, status, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, mail_service_id ? Number(mail_service_id) : null,
      full_name.trim(), email_address.trim().toLowerCase(), password || '',
      department || 'Genel', branch_name || 'Merkez Ofis', mailbox_type || 'Kullanıcı',
      license_type || '', quota_limit || '50 GB', phone_or_recovery || '',
      is_mfa_active ? 1 : 0, status || 'Aktif', notes || ''
    );

    const created = db.prepare('SELECT * FROM mail_accounts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/mail-accounts/:id', (req, res) => {
  try {
    const {
      mail_service_id, full_name, email_address, password,
      department, branch_name, mailbox_type, license_type, quota_limit,
      phone_or_recovery, is_mfa_active, status, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE mail_accounts SET
        mail_service_id = ?, full_name = ?, email_address = ?, password = ?,
        department = ?, branch_name = ?, mailbox_type = ?, license_type = ?, quota_limit = ?,
        phone_or_recovery = ?, is_mfa_active = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      mail_service_id ? Number(mail_service_id) : null,
      (full_name || '').trim(), (email_address || '').trim().toLowerCase(), password || '',
      department || 'Genel', branch_name || 'Merkez Ofis', mailbox_type || 'Kullanıcı',
      license_type || '', quota_limit || '50 GB', phone_or_recovery || '',
      is_mfa_active ? 1 : 0, status || 'Aktif', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM mail_accounts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/mail-accounts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM mail_accounts WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Kullanıcı e-posta hesabı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- BACKUP UNITS -----------------
app.get('/api/backup-units', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare('SELECT * FROM backup_units WHERE customer_id = ? ORDER BY device_name ASC').all(customerId);
    } else {
      rows = db.prepare(`
        SELECT bu.*, c.name as customer_name
        FROM backup_units bu
        JOIN customers c ON bu.customer_id = c.id
        ORDER BY c.name, bu.device_name
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/backup-units', (req, res) => {
  try {
    const {
      customer_id, device_name, branch_name, location, brand, model, management_ip, username,
      password, capacity, backup_software, backup_schedule, notes
    } = req.body;

    if (!customer_id || !device_name) {
      return res.status(400).json({ error: 'Müşteri ve Cihaz Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO backup_units (
        customer_id, device_name, branch_name, location, brand, model, management_ip, username,
        password, capacity, backup_software, backup_schedule, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, device_name.trim(), branch_name || 'Merkez Ofis', location || '', brand || '', model || '', management_ip || '',
      username || '', security.encryptSensitive(password || ''), capacity || '', backup_software || '',
      backup_schedule || '', notes || ''
    );

    const created = db.prepare('SELECT * FROM backup_units WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/backup-units/:id', (req, res) => {
  try {
    const {
      device_name, branch_name, location, brand, model, management_ip, username,
      password, capacity, backup_software, backup_schedule, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE backup_units SET
        device_name = ?, branch_name = ?, location = ?, brand = ?, model = ?, management_ip = ?, username = ?,
        password = ?, capacity = ?, backup_software = ?, backup_schedule = ?,
        notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      device_name.trim(), branch_name || 'Merkez Ofis', location || '', brand || '', model || '', management_ip || '',
      username || '', security.encryptSensitive(password || ''), capacity || '', backup_software || '',
      backup_schedule || '', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM backup_units WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/backup-units/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM backup_units WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Yedekleme ünitesi silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- INTERNET LINES & BRANCHES -----------------
app.get('/api/internet-lines', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare('SELECT * FROM internet_lines WHERE customer_id = ? ORDER BY is_primary DESC, branch_name ASC').all(customerId);
    } else {
      rows = db.prepare(`
        SELECT il.*, c.name as customer_name
        FROM internet_lines il
        JOIN customers c ON il.customer_id = c.id
        ORDER BY c.name, il.branch_name
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/internet-lines', (req, res) => {
  try {
    const {
      customer_id, branch_name, line_type, isp, circuit_number, is_primary,
      static_ip, subnet_mask, gateway, dns_servers, pppoe_user, pppoe_password,
      modem_brand_model, modem_ip, modem_user, modem_password, speed_info, location_address, notes
    } = req.body;

    if (!customer_id || !branch_name) {
      return res.status(400).json({ error: 'Müşteri ve Şube / Lokasyon Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO internet_lines (
        customer_id, branch_name, line_type, isp, circuit_number, is_primary,
        static_ip, subnet_mask, gateway, dns_servers, pppoe_user, pppoe_password,
        modem_brand_model, modem_ip, modem_user, modem_password, speed_info, location_address, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, branch_name.trim(), line_type || 'Fiber / Metro Ethernet',
      isp || '', circuit_number || '', is_primary ? 1 : 0,
      static_ip || '', subnet_mask || '', gateway || '', dns_servers || '',
      pppoe_user || '', pppoe_password || '',
      modem_brand_model || '', modem_ip || '', modem_user || '', modem_password || '',
      speed_info || '', location_address || '', notes || ''
    );

    const created = db.prepare('SELECT * FROM internet_lines WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/internet-lines/:id', (req, res) => {
  try {
    const {
      branch_name, line_type, isp, circuit_number, is_primary,
      static_ip, subnet_mask, gateway, dns_servers, pppoe_user, pppoe_password,
      modem_brand_model, modem_ip, modem_user, modem_password, speed_info, location_address, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE internet_lines SET
        branch_name = ?, line_type = ?, isp = ?, circuit_number = ?, is_primary = ?,
        static_ip = ?, subnet_mask = ?, gateway = ?, dns_servers = ?,
        pppoe_user = ?, pppoe_password = ?,
        modem_brand_model = ?, modem_ip = ?, modem_user = ?, modem_password = ?,
        speed_info = ?, location_address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      branch_name.trim(), line_type || 'Fiber / Metro Ethernet',
      isp || '', circuit_number || '', is_primary ? 1 : 0,
      static_ip || '', subnet_mask || '', gateway || '', dns_servers || '',
      pppoe_user || '', pppoe_password || '',
      modem_brand_model || '', modem_ip || '', modem_user || '', modem_password || '',
      speed_info || '', location_address || '', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM internet_lines WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/internet-lines/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM internet_lines WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'İnternet hattı / şube kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- WI-FI CONTROLLERS (UNIFI vb.) -----------------
app.get('/api/wifi-controllers', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare('SELECT * FROM wifi_controllers WHERE customer_id = ? ORDER BY controller_name ASC').all(customerId);
    } else {
      rows = db.prepare(`
        SELECT wc.*, c.name as customer_name
        FROM wifi_controllers wc
        JOIN customers c ON wc.customer_id = c.id
        ORDER BY c.name, wc.controller_name
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wifi-controllers', (req, res) => {
  try {
    const {
      customer_id, controller_name, branch_name, controller_type, management_ip,
      email, username, password, version, notes
    } = req.body;

    if (!customer_id || !controller_name) {
      return res.status(400).json({ error: 'Müşteri ve Kontrolcü Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO wifi_controllers (
        customer_id, controller_name, branch_name, controller_type, management_ip,
        email, username, password, version, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, controller_name.trim(), branch_name || 'Merkez Ofis',
      controller_type || 'Donanım (UDM / CloudKey)', management_ip || '',
      email || '', username || '', password || '', version || '', notes || ''
    );

    const created = db.prepare('SELECT * FROM wifi_controllers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/wifi-controllers/:id', (req, res) => {
  try {
    const {
      controller_name, branch_name, controller_type, management_ip,
      email, username, password, version, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE wifi_controllers SET
        controller_name = ?, branch_name = ?, controller_type = ?, management_ip = ?,
        email = ?, username = ?, password = ?, version = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      controller_name.trim(), branch_name || 'Merkez Ofis',
      controller_type || 'Donanım (UDM / CloudKey)', management_ip || '',
      email || '', username || '', password || '', version || '', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM wifi_controllers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wifi-controllers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM wifi_controllers WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Kontrolcü kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- WI-FI ACCESS POINTS (AP'LER) -----------------
app.get('/api/wifi-access-points', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare(`
        SELECT ap.*, wc.controller_name
        FROM wifi_access_points ap
        LEFT JOIN wifi_controllers wc ON ap.controller_id = wc.id
        WHERE ap.customer_id = ?
        ORDER BY ap.branch_name ASC, ap.ap_name ASC
      `).all(customerId);
    } else {
      rows = db.prepare(`
        SELECT ap.*, c.name as customer_name, wc.controller_name
        FROM wifi_access_points ap
        JOIN customers c ON ap.customer_id = c.id
        LEFT JOIN wifi_controllers wc ON ap.controller_id = wc.id
        ORDER BY c.name, ap.branch_name, ap.ap_name
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wifi-access-points', (req, res) => {
  try {
    const {
      customer_id, controller_id, ap_name, branch_name, brand, model,
      ip_address, mac_address, location, status, notes
    } = req.body;

    if (!customer_id || !ap_name) {
      return res.status(400).json({ error: 'Müşteri ve Cihaz (AP) Adı zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO wifi_access_points (
        customer_id, controller_id, ap_name, branch_name, brand, model,
        ip_address, mac_address, location, status, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, controller_id || null, ap_name.trim(), branch_name || 'Merkez Ofis',
      brand || 'Ubiquiti UniFi', model || '', ip_address || '', mac_address || '',
      location || '', status || 'Aktif', notes || ''
    );

    const created = db.prepare('SELECT * FROM wifi_access_points WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/wifi-access-points/:id', (req, res) => {
  try {
    const {
      controller_id, ap_name, branch_name, brand, model,
      ip_address, mac_address, location, status, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE wifi_access_points SET
        controller_id = ?, ap_name = ?, branch_name = ?, brand = ?, model = ?,
        ip_address = ?, mac_address = ?, location = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      controller_id || null, ap_name.trim(), branch_name || 'Merkez Ofis',
      brand || 'Ubiquiti UniFi', model || '', ip_address || '', mac_address || '',
      location || '', status || 'Aktif', notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM wifi_access_points WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wifi-access-points/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM wifi_access_points WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Wi-Fi AP cihazı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- WI-FI NETWORKS (SSID'LER) -----------------
app.get('/api/wifi-networks', (req, res) => {
  try {
    const { customerId } = req.query;
    let rows;
    if (customerId) {
      rows = db.prepare(`
        SELECT wn.*, wc.controller_name
        FROM wifi_networks wn
        LEFT JOIN wifi_controllers wc ON wn.controller_id = wc.id
        WHERE wn.customer_id = ?
        ORDER BY wn.branch_name ASC, wn.ssid ASC
      `).all(customerId);
    } else {
      rows = db.prepare(`
        SELECT wn.*, c.name as customer_name, wc.controller_name
        FROM wifi_networks wn
        JOIN customers c ON wn.customer_id = c.id
        LEFT JOIN wifi_controllers wc ON wn.controller_id = wc.id
        ORDER BY c.name, wn.branch_name, wn.ssid
      `).all();
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wifi-networks', (req, res) => {
  try {
    const {
      customer_id, controller_id, ssid, password, security_type,
      vlan_id, band, branch_name, is_guest, notes
    } = req.body;

    if (!customer_id || !ssid) {
      return res.status(400).json({ error: 'Müşteri ve SSID (Ağ Adı) zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO wifi_networks (
        customer_id, controller_id, ssid, password, security_type,
        vlan_id, band, branch_name, is_guest, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      customer_id, controller_id || null, ssid.trim(), security.encryptSensitive(password || ''),
      security_type || 'WPA2/WPA3 Personal', vlan_id || '',
      band || '2.4 GHz & 5 GHz', branch_name || 'Merkez Ofis',
      is_guest ? 1 : 0, notes || ''
    );

    const created = db.prepare('SELECT * FROM wifi_networks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/wifi-networks/:id', (req, res) => {
  try {
    const {
      controller_id, ssid, password, security_type,
      vlan_id, band, branch_name, is_guest, notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE wifi_networks SET
        controller_id = ?, ssid = ?, password = ?, security_type = ?,
        vlan_id = ?, band = ?, branch_name = ?, is_guest = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      controller_id || null, ssid.trim(), password || '',
      security_type || 'WPA2/WPA3 Personal', vlan_id || '',
      band || '2.4 GHz & 5 GHz', branch_name || 'Merkez Ofis',
      is_guest ? 1 : 0, notes || '', req.params.id
    );

    const updated = db.prepare('SELECT * FROM wifi_networks WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wifi-networks/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM wifi_networks WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Wi-Fi ağı (SSID) silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- KNOWLEDGE BASE (IT RUNBOOK & SOLUTIONS) -----------------
app.get('/api/knowledge-base', (req, res) => {
  try {
    const { category, q, customerId } = req.query;
    let sql = `
      SELECT kb.*, c.name as customer_name, c.code as customer_code
      FROM knowledge_base kb
      LEFT JOIN customers c ON kb.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'Tümü') {
      sql += ' AND kb.category = ?';
      params.push(category);
    }

    if (customerId) {
      sql += ' AND (kb.customer_id IS NULL OR kb.customer_id = ?)';
      params.push(customerId);
    }

    if (q) {
      const term = `%${q.trim()}%`;
      sql += ` AND (
        kb.title LIKE ? OR kb.error_code LIKE ? OR kb.symptoms LIKE ? 
        OR kb.root_cause LIKE ? OR kb.solution_steps LIKE ? OR kb.subcategory LIKE ? OR kb.command_snippet LIKE ?
      )`;
      params.push(term, term, term, term, term, term, term);
    }

    sql += " ORDER BY CASE kb.severity WHEN 'Kritik' THEN 1 WHEN 'Yüksek' THEN 2 WHEN 'Normal' THEN 3 ELSE 4 END, kb.created_at DESC";

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/knowledge-base/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE knowledge_base SET views_count = views_count + 1 WHERE id = ?').run(id);
    const row = db.prepare(`
      SELECT kb.*, c.name as customer_name, c.code as customer_code
      FROM knowledge_base kb
      LEFT JOIN customers c ON kb.customer_id = c.id
      WHERE kb.id = ?
    `).get(id);

    if (!row) return res.status(404).json({ error: 'Çözüm kaydı bulunamadı' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge-base', (req, res) => {
  try {
    const {
      title, category, subcategory, error_code, symptoms, root_cause,
      solution_steps, command_snippet, customer_id, severity
    } = req.body;

    if (!title || !category || !solution_steps) {
      return res.status(400).json({ error: 'Başlık, Kategori ve Çözüm Adımları zorunludur' });
    }

    const stmt = db.prepare(`
      INSERT INTO knowledge_base (
        title, category, subcategory, error_code, symptoms, root_cause,
        solution_steps, command_snippet, customer_id, severity, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      title.trim(), category.trim(), subcategory || '', error_code || '', symptoms || '', root_cause || '',
      solution_steps.trim(), command_snippet || '', customer_id ? Number(customer_id) : null,
      severity || 'Normal'
    );

    const created = db.prepare(`
      SELECT kb.*, c.name as customer_name
      FROM knowledge_base kb
      LEFT JOIN customers c ON kb.customer_id = c.id
      WHERE kb.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/knowledge-base/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category, subcategory, error_code, symptoms, root_cause,
      solution_steps, command_snippet, customer_id, severity
    } = req.body;

    if (!title || !category || !solution_steps) {
      return res.status(400).json({ error: 'Başlık, Kategori ve Çözüm Adımları zorunludur' });
    }

    const stmt = db.prepare(`
      UPDATE knowledge_base SET
        title = ?, category = ?, subcategory = ?, error_code = ?, symptoms = ?, root_cause = ?,
        solution_steps = ?, command_snippet = ?, customer_id = ?, severity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title.trim(), category.trim(), subcategory || '', error_code || '', symptoms || '', root_cause || '',
      solution_steps.trim(), command_snippet || '', customer_id ? Number(customer_id) : null,
      severity || 'Normal', id
    );

    const updated = db.prepare(`
      SELECT kb.*, c.name as customer_name
      FROM knowledge_base kb
      LEFT JOIN customers c ON kb.customer_id = c.id
      WHERE kb.id = ?
    `).get(id);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/knowledge-base/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM knowledge_base WHERE id = ?').run(id);
    res.json({ success: true, message: 'Çözüm kaydı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- GLOBAL SEARCH -----------------
app.get('/api/search', (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json([]);
    }

    const term = `%${query}%`;
    const results = [];

    // Search Customers
    const customers = db.prepare(`
      SELECT id, name, external_ip, contact_person, phone, notes
      FROM customers
      WHERE name LIKE ? OR external_ip LIKE ? OR contact_person LIKE ? OR notes LIKE ? OR code LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term);

    for (const c of customers) {
      results.push({
        type: 'customer',
        typeLabel: 'Müşteri',
        id: c.id,
        customerId: c.id,
        customerName: c.name,
        title: c.name,
        subtitle: `Dış IP: ${c.external_ip || '-'} | Yetkili: ${c.contact_person || '-'}`,
        badgeColor: 'blue'
      });
    }

    // Search Physical Servers
    const servers = db.prepare(`
      SELECT ps.*, c.name as customer_name
      FROM physical_servers ps
      JOIN customers c ON ps.customer_id = c.id
      WHERE ps.server_name LIKE ? OR ps.brand LIKE ? OR ps.model LIKE ? OR ps.ip_address LIKE ?
         OR ps.mac_address LIKE ? OR ps.management_ip LIKE ? OR ps.serial_number LIKE ?
         OR ps.branch_name LIKE ? OR ps.location LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term, term, term, term);

    for (const s of servers) {
      results.push({
        type: 'server',
        typeLabel: 'Fiziki Sunucu',
        id: s.id,
        customerId: s.customer_id,
        customerName: s.customer_name,
        title: `${s.server_name} (${s.brand} ${s.model}) [${s.branch_name || 'Merkez'}]`,
        subtitle: `IP: ${s.ip_address || '-'} | MAC: ${s.mac_address || '-'} | iDRAC/iLO: ${s.management_ip || '-'}`,
        badgeColor: 'indigo'
      });
    }

    // Search Virtual Machines
    const vms = db.prepare(`
      SELECT vm.*, c.name as customer_name
      FROM virtual_machines vm
      JOIN customers c ON vm.customer_id = c.id
      WHERE vm.vm_name LIKE ? OR vm.role_description LIKE ? OR vm.ip_address LIKE ?
         OR vm.mac_address LIKE ? OR vm.os_version LIKE ? OR vm.os_license_key LIKE ?
         OR vm.office_version LIKE ? OR vm.office_license_key LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term, term, term);

    for (const v of vms) {
      results.push({
        type: 'vm',
        typeLabel: 'Sanal Makine',
        id: v.id,
        customerId: v.customer_id,
        customerName: v.customer_name,
        title: `${v.vm_name} (${v.role_description || 'VM'})`,
        subtitle: `IP: ${v.ip_address || '-'} | İşletim Sis: ${v.os_version || '-'} | Lisans: ${v.os_license_key || '-'}`,
        badgeColor: 'purple'
      });
    }

    // Search User Computers
    const pcs = db.prepare(`
      SELECT uc.*, c.name as customer_name
      FROM user_computers uc
      JOIN customers c ON uc.customer_id = c.id
      WHERE uc.computer_name LIKE ? OR uc.assigned_user LIKE ? OR uc.department LIKE ?
         OR uc.branch_name LIKE ? OR uc.brand LIKE ? OR uc.model LIKE ? OR uc.ethernet_ip LIKE ? OR uc.ethernet_mac LIKE ?
         OR uc.wifi_ip LIKE ? OR uc.wifi_mac LIKE ? OR uc.os_license_key LIKE ?
         OR uc.office_license_key LIKE ? OR uc.remote_access_id LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term, term, term, term, term, term, term, term);

    for (const p of pcs) {
      results.push({
        type: 'pc',
        typeLabel: 'Kullanıcı Bilgisayarı',
        id: p.id,
        customerId: p.customer_id,
        customerName: p.customer_name,
        title: `${p.computer_name} - ${p.assigned_user || 'Kullanıcı'} [${p.branch_name || 'Merkez'}]`,
        subtitle: `Eth IP: ${p.ethernet_ip || '-'} | Wi-Fi IP: ${p.wifi_ip || '-'} | Lisans: ${p.os_license_key || '-'}`,
        badgeColor: 'emerald'
      });
    }

    // Search Firewalls
    const firewalls = db.prepare(`
      SELECT f.*, c.name as customer_name
      FROM firewalls f
      JOIN customers c ON f.customer_id = c.id
      WHERE f.device_name LIKE ? OR f.branch_name LIKE ? OR f.brand LIKE ? OR f.model LIKE ? OR f.management_ip LIKE ?
         OR f.external_ip LIKE ? OR f.ssl_vpn_portal LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term, term);

    for (const f of firewalls) {
      results.push({
        type: 'firewall',
        typeLabel: 'Firewall',
        id: f.id,
        customerId: f.customer_id,
        customerName: f.customer_name,
        title: `${f.device_name} (${f.brand} ${f.model}) [${f.branch_name || 'Merkez'}]`,
        subtitle: `Arayüz IP: ${f.management_ip || '-'} | Dış IP: ${f.external_ip || '-'}`,
        badgeColor: 'red'
      });
    }

    // Search Backup Units
    const backups = db.prepare(`
      SELECT bu.*, c.name as customer_name
      FROM backup_units bu
      JOIN customers c ON bu.customer_id = c.id
      WHERE bu.device_name LIKE ? OR bu.branch_name LIKE ? OR bu.brand LIKE ? OR bu.model LIKE ? OR bu.management_ip LIKE ?
         OR bu.backup_software LIKE ? OR bu.capacity LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term, term);

    for (const b of backups) {
      results.push({
        type: 'backup',
        typeLabel: 'Yedekleme Ünitesi',
        id: b.id,
        customerId: b.customer_id,
        customerName: b.customer_name,
        title: `${b.device_name} (${b.brand} ${b.model})`,
        subtitle: `IP: ${b.management_ip || '-'} | Kapasite: ${b.capacity || '-'} | Yazılım: ${b.backup_software || '-'}`,
        badgeColor: 'amber'
      });
    }

    // Search Internet Lines & Branches
    const lines = db.prepare(`
      SELECT il.*, c.name as customer_name
      FROM internet_lines il
      JOIN customers c ON il.customer_id = c.id
      WHERE il.branch_name LIKE ? OR il.static_ip LIKE ? OR il.gateway LIKE ?
         OR il.pppoe_user LIKE ? OR il.circuit_number LIKE ? OR il.modem_ip LIKE ?
         OR il.modem_brand_model LIKE ? OR il.location_address LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term, term, term);

    for (const l of lines) {
      results.push({
        type: 'line',
        typeLabel: 'İnternet / Şube',
        id: l.id,
        customerId: l.customer_id,
        customerName: l.customer_name,
        title: `${l.branch_name} (${l.line_type})`,
        subtitle: `Statik IP: ${l.static_ip || '-'} | Gateway: ${l.gateway || '-'} | PPPoE: ${l.pppoe_user || '-'}`,
        badgeColor: 'cyan'
      });
    }

    // Search WiFi Controllers
    const controllers = db.prepare(`
      SELECT wc.*, c.name as customer_name
      FROM wifi_controllers wc
      JOIN customers c ON wc.customer_id = c.id
      WHERE wc.controller_name LIKE ? OR wc.branch_name LIKE ? OR wc.management_ip LIKE ?
         OR wc.email LIKE ? OR wc.username LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term);

    for (const c of controllers) {
      results.push({
        type: 'wifi',
        typeLabel: 'Wi-Fi / UniFi Kontrolcü',
        id: c.id,
        customerId: c.customer_id,
        customerName: c.customer_name,
        title: `${c.controller_name} (${c.controller_type}) [${c.branch_name || 'Merkez'}]`,
        subtitle: `Arayüz: ${c.management_ip || '-'} | Kullanıcı: ${c.username || '-'} | E-posta: ${c.email || '-'}`,
        badgeColor: 'sky'
      });
    }

    // Search WiFi APs
    const aps = db.prepare(`
      SELECT ap.*, c.name as customer_name
      FROM wifi_access_points ap
      JOIN customers c ON ap.customer_id = c.id
      WHERE ap.ap_name LIKE ? OR ap.branch_name LIKE ? OR ap.brand LIKE ? OR ap.model LIKE ?
         OR ap.ip_address LIKE ? OR ap.mac_address LIKE ? OR ap.location LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term, term);

    for (const a of aps) {
      results.push({
        type: 'wifi',
        typeLabel: 'Wi-Fi Cihazı (AP)',
        id: a.id,
        customerId: a.customer_id,
        customerName: a.customer_name,
        title: `${a.ap_name} (${a.brand} ${a.model}) [${a.branch_name || 'Merkez'}]`,
        subtitle: `IP: ${a.ip_address || '-'} | MAC: ${a.mac_address || '-'} | Konum: ${a.location || '-'}`,
        badgeColor: 'sky'
      });
    }

    // Search WiFi SSIDs
    const ssids = db.prepare(`
      SELECT wn.*, c.name as customer_name
      FROM wifi_networks wn
      JOIN customers c ON wn.customer_id = c.id
      WHERE wn.ssid LIKE ? OR wn.branch_name LIKE ? OR wn.vlan_id LIKE ? OR wn.notes LIKE ?
      LIMIT 10
    `).all(term, term, term, term);

    for (const s of ssids) {
      results.push({
        type: 'wifi',
        typeLabel: 'Wi-Fi Yayını (SSID)',
        id: s.id,
        customerId: s.customer_id,
        customerName: s.customer_name,
        title: `SSID: ${s.ssid} [${s.branch_name || 'Merkez'}]`,
        subtitle: `Güvenlik: ${s.security_type || '-'} | VLAN: ${s.vlan_id || '-'} | Bant: ${s.band || '-'}`,
        badgeColor: 'sky'
      });
    }

    // Search Knowledge Base (IT Runbook & Solutions)
    const kbResults = db.prepare(`
      SELECT kb.*, c.name as customer_name
      FROM knowledge_base kb
      LEFT JOIN customers c ON kb.customer_id = c.id
      WHERE kb.title LIKE ? OR kb.error_code LIKE ? OR kb.subcategory LIKE ?
         OR kb.symptoms LIKE ? OR kb.command_snippet LIKE ? OR kb.category LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term);

    for (const kb of kbResults) {
      results.push({
        type: 'kb',
        typeLabel: '📚 IT Çözümü',
        id: kb.id,
        customerId: kb.customer_id || null,
        customerName: kb.customer_name || 'Genel IT Kütüphanesi',
        title: `${kb.title} [${kb.category}]`,
        subtitle: `Hata: ${kb.error_code || 'Genel'} | ${kb.subcategory || kb.category} | Öncelik: ${kb.severity}`,
        badgeColor: 'amber'
      });
    }

    // Search Antivirus Licenses
    const antiviruses = db.prepare(`
      SELECT av.*, c.name as customer_name
      FROM antivirus_licenses av
      JOIN customers c ON av.customer_id = c.id
      WHERE av.product_name LIKE ? OR av.brand LIKE ? OR av.username LIKE ?
         OR av.license_key LIKE ? OR av.portal_url LIKE ? OR av.branch_name LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term, term);

    for (const av of antiviruses) {
      results.push({
        type: 'antivirus',
        typeLabel: '🛡️ Antivirüs Lisansı',
        id: av.id,
        customerId: av.customer_id,
        customerName: av.customer_name,
        title: `${av.product_name} (${av.brand}) [${av.user_count || 1} Koltuk/Kullanıcı]`,
        subtitle: `Panel: ${av.portal_url || '-'} | Bitiş: ${av.license_expiry || '-'} | Kullanıcı: ${av.username || '-'}`,
        badgeColor: 'emerald'
      });
    }

    // Search Mail Services & Panels
    const mailServices = db.prepare(`
      SELECT ms.*, c.name as customer_name
      FROM mail_services ms
      JOIN customers c ON ms.customer_id = c.id
      WHERE ms.service_name LIKE ? OR ms.domain_name LIKE ? OR ms.admin_username LIKE ?
         OR ms.license_type LIKE ? OR ms.admin_panel_url LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term);

    for (const ms of mailServices) {
      results.push({
        type: 'mail',
        typeLabel: '📧 Mail Servisi & Panel',
        id: ms.id,
        customerId: ms.customer_id,
        customerName: ms.customer_name,
        title: `${ms.service_name} (${ms.domain_name || ms.service_type})`,
        subtitle: `Panel: ${ms.admin_panel_url || '-'} | Admin: ${ms.admin_username || '-'} | Bitiş: ${ms.license_expiry || '-'}`,
        badgeColor: 'blue'
      });
    }

    // Search Mail Accounts (User Mailboxes)
    const mailAccounts = db.prepare(`
      SELECT ma.*, c.name as customer_name, ms.service_name
      FROM mail_accounts ma
      JOIN customers c ON ma.customer_id = c.id
      LEFT JOIN mail_services ms ON ma.mail_service_id = ms.id
      WHERE ma.full_name LIKE ? OR ma.email_address LIKE ? OR ma.department LIKE ?
         OR ma.branch_name LIKE ? OR ma.notes LIKE ?
      LIMIT 10
    `).all(term, term, term, term, term);

    for (const ma of mailAccounts) {
      results.push({
        type: 'mail',
        typeLabel: '✉️ E-Posta Hesabı',
        id: ma.id,
        customerId: ma.customer_id,
        customerName: ma.customer_name,
        title: `${ma.full_name} (${ma.email_address}) [${ma.department || 'Genel'}]`,
        subtitle: `Şube: ${ma.branch_name || 'Merkez'} | Kota: ${ma.quota_limit || '-'} | Durum: ${ma.status}`,
        badgeColor: 'blue'
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- BACKUP & EXPORT -----------------
const autoBackupDir = path.join(__dirname, '..', 'Otomatik_Yedekler');
if (!fs.existsSync(autoBackupDir)) {
  fs.mkdirSync(autoBackupDir, { recursive: true });
}

// Function to generate full JSON dump of database
function generateFullJsonExport() {
  const safeAll = (sql) => {
    try {
      return db.prepare(sql).all();
    } catch (e) {
      console.warn(`Query failed for "${sql}":`, e.message);
      return [];
    }
  };

  const customers = safeAll('SELECT * FROM customers');
  const lines = safeAll('SELECT * FROM internet_lines');
  const servers = safeAll('SELECT * FROM physical_servers');
  const vms = safeAll('SELECT * FROM virtual_machines');
  const pcs = safeAll('SELECT * FROM user_computers');
  const firewalls = safeAll('SELECT * FROM firewalls');
  const backups = safeAll('SELECT * FROM backup_units');
  const wifiControllers = safeAll('SELECT * FROM wifi_controllers');
  const wifiAps = safeAll('SELECT * FROM wifi_access_points');
  const wifiNetworks = safeAll('SELECT * FROM wifi_networks');
  const antivirusLicenses = safeAll('SELECT * FROM antivirus_licenses');
  const mailServices = safeAll('SELECT * FROM mail_services');
  const mailAccounts = safeAll('SELECT * FROM mail_accounts');
  const knowledgeBase = safeAll('SELECT * FROM knowledge_base');

  return {
    exportDate: new Date().toISOString(),
    version: 'OmniFlow v2.4 Enterprise',
    summary: {
      customersCount: customers.length,
      linesCount: lines.length,
      serversCount: servers.length,
      vmsCount: vms.length,
      pcsCount: pcs.length,
      firewallsCount: firewalls.length,
      backupsCount: backups.length,
      wifiControllersCount: wifiControllers.length,
      wifiApsCount: wifiAps.length,
      wifiNetworksCount: wifiNetworks.length,
      antivirusLicensesCount: antivirusLicenses.length,
      mailServicesCount: mailServices.length,
      mailAccountsCount: mailAccounts.length,
      knowledgeBaseCount: knowledgeBase.length
    },
    knowledge_base: knowledgeBase,
    customers: customers.map(c => ({
      ...c,
      internet_lines: lines.filter(l => l.customer_id === c.id),
      physical_servers: servers.filter(s => s.customer_id === c.id),
      virtual_machines: vms.filter(v => v.customer_id === c.id),
      user_computers: pcs.filter(p => p.customer_id === c.id),
      firewalls: firewalls.filter(f => f.customer_id === c.id),
      backup_units: backups.filter(b => b.customer_id === c.id),
      wifi_controllers: wifiControllers.filter(wc => wc.customer_id === c.id),
      wifi_access_points: wifiAps.filter(ap => ap.customer_id === c.id),
      wifi_networks: wifiNetworks.filter(wn => wn.customer_id === c.id),
      antivirus_licenses: antivirusLicenses.filter(av => av.customer_id === c.id),
      mail_services: mailServices.filter(ms => ms.customer_id === c.id),
      mail_accounts: mailAccounts.filter(ma => ma.customer_id === c.id)
    }))
  };
}

// Function to execute automated backup (both .db and .json)
function executeAutoBackup(manualTrigger = false) {
  try {
    const dbFilePath = path.join(__dirname, 'data', 'itmanager.db');
    if (!fs.existsSync(dbFilePath)) return null;

    // Checkpoint SQLite WAL if active to ensure file integrity on disk
    try {
      db.exec('PRAGMA wal_checkpoint(PASSIVE);');
    } catch (e) {}

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    // 1. Copy SQLite database file
    const dbBackupName = `OmniFlow_Backup_${dateStr}.db`;
    const targetDbPath = path.join(autoBackupDir, dbBackupName);
    fs.copyFileSync(dbFilePath, targetDbPath);

    // 2. Export complete JSON dump
    const jsonBackupName = `OmniFlow_Backup_${dateStr}.json`;
    const targetJsonPath = path.join(autoBackupDir, jsonBackupName);
    try {
      const jsonData = generateFullJsonExport();
      fs.writeFileSync(targetJsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (jErr) {
      console.warn('[OmniFlow Auto-Backup] JSON dump warning:', jErr.message);
    }

    // 3. Clean up older backups based on retention setting
    const retentionLimit = parseInt(getSetting('auto_backup_retention', '14'), 10) || 14;
    cleanOldBackups(retentionLimit);

    // 4. Update last run time
    const lastRunIso = now.toISOString();
    setSetting('auto_backup_last_run', lastRunIso);

    try {
      security.logSecurityEvent('AUTO_BACKUP_SUCCESS', '127.0.0.1', manualTrigger ? 'MANUAL' : 'AUTO_TIMER', `Backup created: ${dbBackupName} & ${jsonBackupName}`);
    } catch (sErr) {}

    return {
      success: true,
      lastRun: lastRunIso,
      createdFiles: [
        { filename: dbBackupName, type: 'db', size: fs.existsSync(targetDbPath) ? fs.statSync(targetDbPath).size : 0 },
        { filename: jsonBackupName, type: 'json', size: fs.existsSync(targetJsonPath) ? fs.statSync(targetJsonPath).size : 0 }
      ]
    };
  } catch (err) {
    console.error('Auto backup execution error:', err);
    try {
      security.logSecurityEvent('AUTO_BACKUP_ERROR', '127.0.0.1', 'SYSTEM', err.message);
    } catch (sErr) {}
    return null;
  }
}

// Retention cleaner: keeps the last N backups (pairs of .db and .json)
function cleanOldBackups(retentionLimit) {
  try {
    if (!fs.existsSync(autoBackupDir)) return;
    const files = fs.readdirSync(autoBackupDir)
      .filter(f => f.endsWith('.db') || f.endsWith('.json'))
      .map(filename => {
        try {
          return {
            filename,
            path: path.join(autoBackupDir, filename),
            mtime: fs.statSync(path.join(autoBackupDir, filename)).mtime.getTime()
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime); // Newest first

    // Each backup run creates 2 files (.db + .json), so max files = retentionLimit * 2
    const maxFiles = Math.max(retentionLimit * 2, 4);
    if (files.length > maxFiles) {
      const toDelete = files.slice(maxFiles);
      toDelete.forEach(f => {
        try { fs.unlinkSync(f.path); } catch (e) {}
      });
    }
  } catch (e) {
    console.warn('Backup cleanup error:', e);
  }
}

// Background Cron / Interval runner for Auto-Backup (checks every 10 minutes)
setInterval(() => {
  try {
    const isEnabled = getSetting('auto_backup_enabled', 'true') === 'true';
    if (!isEnabled) return;

    const intervalSetting = getSetting('auto_backup_interval', 'daily');
    const intervalMap = {
      '6h': 6 * 3600 * 1000,
      '12h': 12 * 3600 * 1000,
      'daily': 24 * 3600 * 1000,
      'weekly': 7 * 24 * 3600 * 1000
    };
    const requiredIntervalMs = intervalMap[intervalSetting] || (24 * 3600 * 1000);

    const lastRunStr = getSetting('auto_backup_last_run', null);
    const lastRunTime = lastRunStr ? new Date(lastRunStr).getTime() : 0;
    const timeSinceLastRun = Date.now() - lastRunTime;

    if (timeSinceLastRun >= requiredIntervalMs) {
      console.log(`[OmniFlow Auto-Backup] Running scheduled automatic backup (interval: ${intervalSetting})...`);
      executeAutoBackup(false);
    }
  } catch (err) {
    console.error('Scheduled backup error:', err);
  }
}, 10 * 60 * 1000);

// API: Direct SQLite DB File Download
app.get('/api/backup/download', (req, res) => {
  try {
    const dbFilePath = path.join(__dirname, 'data', 'itmanager.db');
    if (!fs.existsSync(dbFilePath)) {
      return res.status(404).json({ error: 'Veritabanı dosyası bulunamadı' });
    }
    const filename = `OmniFlow_Database_${new Date().toISOString().slice(0, 10)}.db`;
    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.download(dbFilePath, filename);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Direct JSON Full Export Download
app.get('/api/export/all', (req, res) => {
  try {
    const data = generateFullJsonExport();
    const filename = `OmniFlow_Export_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get Auto-Backup Status & List of Backups
app.get('/api/backup/auto-status', (req, res) => {
  try {
    const enabled = getSetting('auto_backup_enabled', 'true') === 'true';
    const interval = getSetting('auto_backup_interval', 'daily');
    const retention = parseInt(getSetting('auto_backup_retention', '14'), 10) || 14;
    const lastRun = getSetting('auto_backup_last_run', null);

    let backupList = [];
    if (fs.existsSync(autoBackupDir)) {
      backupList = fs.readdirSync(autoBackupDir)
        .filter(f => f.endsWith('.db') || f.endsWith('.json'))
        .map(filename => {
          const stats = fs.statSync(path.join(autoBackupDir, filename));
          return {
            filename,
            type: filename.endsWith('.db') ? 'SQLite (.db)' : 'Tam JSON (.json)',
            size: stats.size,
            sizeFormatted: (stats.size / 1024).toFixed(1) + ' KB',
            createdAt: stats.mtime.toISOString(),
            dateFormatted: stats.mtime.toLocaleString('tr-TR')
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      enabled,
      interval,
      retention,
      lastRun,
      folderPath: autoBackupDir,
      backups: backupList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Save Auto-Backup Settings
app.post('/api/backup/auto-settings', (req, res) => {
  try {
    const { enabled, interval, retention } = req.body;
    if (enabled !== undefined) setSetting('auto_backup_enabled', String(enabled));
    if (interval) setSetting('auto_backup_interval', String(interval));
    if (retention) setSetting('auto_backup_retention', String(retention));

    res.json({
      success: true,
      message: 'Otomatik yedekleme ayarları başarıyla kaydedildi.',
      enabled: getSetting('auto_backup_enabled', 'true') === 'true',
      interval: getSetting('auto_backup_interval', 'daily'),
      retention: parseInt(getSetting('auto_backup_retention', '14'), 10) || 14
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Run Immediate Auto-Backup Now
app.post('/api/backup/run-now', (req, res) => {
  try {
    const result = executeAutoBackup(true);
    if (!result) {
      return res.status(500).json({ error: 'Otomatik yedek oluşturulamadı.' });
    }
    res.json({
      success: true,
      message: 'Otomatik veritabanı ve JSON yedeği başarıyla oluşturuldu!',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Download Specific Backup File
app.get('/api/backup/file/:filename', (req, res) => {
  try {
    const safeName = path.basename(req.params.filename);
    const targetPath = path.join(autoBackupDir, safeName);
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'Yedek dosyası bulunamadı.' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.download(targetPath, safeName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ANTIGRAVITY AI DIAGNOSTIC & KB CHAT APIS
// ==========================================

// Get AI Settings (Gemini status)
app.get('/api/ai/settings', (req, res) => {
  try {
    const key = getSetting('gemini_api_key', '') || process.env.GEMINI_API_KEY || '';
    res.json({
      success: true,
      hasApiKey: !!(key && key.trim().length > 10),
      maskedKey: key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '',
      provider: 'gemini',
      model: 'gemini-2.0-flash'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save AI Settings (Gemini API Key)
app.post('/api/ai/settings', (req, res) => {
  try {
    const { geminiApiKey = '' } = req.body;
    setSetting('gemini_api_key', (geminiApiKey || '').trim());
    res.json({
      success: true,
      message: 'Gemini API anahtarı başarıyla güncellendi.',
      hasApiKey: !!(geminiApiKey && geminiApiKey.trim().length > 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Diagnose Issue (Text + Screenshot Image)
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { message, imageBase64, mimeType = 'image/png', customerId, history = [] } = req.body;
    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Lütfen teşhis edilecek bir hata mesajı veya ekran görüntüsü iletin.' });
    }

    const diagnosis = await aiService.diagnoseIssue({
      message,
      imageBase64,
      mimeType,
      customerId,
      history,
      getSetting
    });

    res.json(diagnosis);
  } catch (err) {
    console.error('AI diagnose route error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ----------------- TELEGRAM & WHATSAPP NOTIFICATION BOT ROUTES -----------------
app.get('/api/notifications/settings', (req, res) => {
  try {
    res.json({
      telegram_bot_enabled: getSetting('telegram_bot_enabled', 'false') === 'true',
      telegram_bot_token: getSetting('telegram_bot_token', ''),
      telegram_chat_id: getSetting('telegram_chat_id', ''),
      whatsapp_bot_enabled: getSetting('whatsapp_bot_enabled', 'false') === 'true',
      whatsapp_gateway_url: getSetting('whatsapp_gateway_url', ''),
      whatsapp_api_key: getSetting('whatsapp_api_key', ''),
      whatsapp_target_phone: getSetting('whatsapp_target_phone', ''),
      notification_threshold_days: parseInt(getSetting('notification_threshold_days', '30'), 10),
      last_sent_at: getSetting('last_license_notification_sent_at', '')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/settings', (req, res) => {
  try {
    const {
      telegram_bot_enabled,
      telegram_bot_token,
      telegram_chat_id,
      whatsapp_bot_enabled,
      whatsapp_gateway_url,
      whatsapp_api_key,
      whatsapp_target_phone,
      notification_threshold_days
    } = req.body;

    if (telegram_bot_enabled !== undefined) setSetting('telegram_bot_enabled', telegram_bot_enabled ? 'true' : 'false');
    if (telegram_bot_token !== undefined) setSetting('telegram_bot_token', telegram_bot_token.trim());
    if (telegram_chat_id !== undefined) setSetting('telegram_chat_id', telegram_chat_id.trim());
    if (whatsapp_bot_enabled !== undefined) setSetting('whatsapp_bot_enabled', whatsapp_bot_enabled ? 'true' : 'false');
    if (whatsapp_gateway_url !== undefined) setSetting('whatsapp_gateway_url', whatsapp_gateway_url.trim());
    if (whatsapp_api_key !== undefined) setSetting('whatsapp_api_key', whatsapp_api_key.trim());
    if (whatsapp_target_phone !== undefined) setSetting('whatsapp_target_phone', whatsapp_target_phone.trim());
    if (notification_threshold_days !== undefined) setSetting('notification_threshold_days', String(notification_threshold_days));

    res.json({ success: true, message: 'Bildirim bot ayarları başarıyla kaydedildi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/test-telegram', async (req, res) => {
  try {
    const token = req.body.token || getSetting('telegram_bot_token', '');
    const chatId = req.body.chatId || getSetting('telegram_chat_id', '');

    if (!token || !chatId) {
      return res.status(400).json({ error: 'Telegram Bot Token ve Chat ID gereklidir.' });
    }

    const testMsg = `<b>🚀 OMNIFlow — Telegram Bot Testi Başarılı!</b>\n\n` +
      `Tebrikler! OMNIFlow lisans alarm botu Telegram hesabınızla başarıyla eşleşti.\n` +
      `📅 Test Tarihi: <code>${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</code>\n\n` +
      `<i>Müşterilerinizin süresi yaklaşan antivirüs, firewall ve mail lisansları bu kanala otomatik raporlanacaktır.</i>`;

    const result = await notificationBot.sendTelegramMessage(token, chatId, testMsg);
    res.json({ success: true, message: 'Test mesajı Telegram hesabınıza başarıyla gönderildi!', details: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/test-whatsapp', async (req, res) => {
  try {
    const gatewayUrl = req.body.gatewayUrl || getSetting('whatsapp_gateway_url', '');
    const apiKey = req.body.apiKey || getSetting('whatsapp_api_key', '');
    const phone = req.body.phone || getSetting('whatsapp_target_phone', '');

    if (!gatewayUrl) {
      return res.status(400).json({ error: 'WhatsApp Gateway / Webhook URL gereklidir.' });
    }

    const testMsg = `*🚀 OMNIFlow — WhatsApp Webhook Testi Başarılı!*\n\n` +
      `OMNIFlow lisans bildirim botu WhatsApp ağ geçidiniz ile iletişim kurdu.\n` +
      `📅 Test Tarihi: _${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}_\n\n` +
      `_Tüm kritik lisans alarmları bu kanala otomatik iletilecektir._`;

    const result = await notificationBot.sendWhatsAppWebhook(gatewayUrl, apiKey, phone, testMsg);
    res.json({ success: true, message: 'Test mesajı WhatsApp ağ geçidine başarıyla iletildi!', details: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications/preview', (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold || getSetting('notification_threshold_days', '30'), 10);
    const licenses = notificationBot.collectExpiringLicenses(db, threshold);
    const telegramPreview = notificationBot.formatTelegramMessage(licenses);
    const whatsappPreview = notificationBot.formatWhatsAppMessage(licenses);

    res.json({
      count: licenses.length,
      licenses,
      telegramPreview,
      whatsappPreview,
      threshold
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/send-alerts', async (req, res) => {
  try {
    const threshold = parseInt(getSetting('notification_threshold_days', '30'), 10);
    const licenses = notificationBot.collectExpiringLicenses(db, threshold);

    const telegramEnabled = getSetting('telegram_bot_enabled', 'false') === 'true';
    const whatsappEnabled = getSetting('whatsapp_bot_enabled', 'false') === 'true';

    const results = {
      telegram: null,
      whatsapp: null,
      count: licenses.length
    };

    if (telegramEnabled) {
      const token = getSetting('telegram_bot_token', '');
      const chatId = getSetting('telegram_chat_id', '');
      if (token && chatId) {
        const msg = notificationBot.formatTelegramMessage(licenses);
        results.telegram = await notificationBot.sendTelegramMessage(token, chatId, msg);
      }
    }

    if (whatsappEnabled) {
      const gatewayUrl = getSetting('whatsapp_gateway_url', '');
      const apiKey = getSetting('whatsapp_api_key', '');
      const phone = getSetting('whatsapp_target_phone', '');
      if (gatewayUrl) {
        const msg = notificationBot.formatWhatsAppMessage(licenses);
        results.whatsapp = await notificationBot.sendWhatsAppWebhook(gatewayUrl, apiKey, phone, msg);
      }
    }

    const nowStr = new Date().toISOString();
    setSetting('last_license_notification_sent_at', nowStr);
    setSetting('last_license_notification_sent_date', nowStr.split('T')[0]);

    res.json({
      success: true,
      message: `${licenses.length} lisans için bildirim başarıyla iletildi.`,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single Page Application fallback
app.get('*', (req, res) => {
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.json({ message: 'OmniFlow API Servisi Çalışıyor. Frontend geliştirme sunucusu port 5173 üzerindedir.' });
  }
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`OMNIFLOW SUNUCUSU BAŞLATILDI`);
  console.log(`Erişim Adresi: http://localhost:${PORT}`);
  console.log(`===============================================`);

  // Local ortamda sunucu hazir oldugunda varsayilan tarayiciyi otomatik ac
  if (!process.env.RENDER && process.env.AUTO_OPEN !== 'false' && process.env.NODE_ENV !== 'test') {
    try {
      const { exec } = require('child_process');
      const url = `http://localhost:${PORT}`;
      const startCmd = process.platform === 'win32'
        ? `start "" "${url}"`
        : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
      exec(startCmd, (err) => {
        if (err) console.warn('[OmniFlow] Tarayici otomatik acma uyarisi:', err.message);
      });
    } catch (openErr) {
      console.warn('[OmniFlow] Tarayici acilamadi:', openErr.message);
    }
  }
});
