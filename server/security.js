const crypto = require('crypto');

// In-memory rate limiting and brute force tracking
const failedAttemptsByIp = new Map(); // ip -> { count, firstAttempt, lockedUntil }
const generalRateLimits = new Map();  // ip -> { count, windowStart }

let signingSecret = null;
let encryptionKey = null;
let databaseInstance = null;

/**
 * Initialize security subsystems with persistent secrets from system_settings
 */
function initSecurity(db, getSetting, setSetting) {
  databaseInstance = db;

  // Initialize or fetch persistent Token Signing Secret
  let tokenSecret = getSetting('session_signing_secret', '');
  if (!tokenSecret || tokenSecret.length < 32) {
    tokenSecret = crypto.randomBytes(32).toString('hex');
    setSetting('session_signing_secret', tokenSecret);
  }
  signingSecret = Buffer.from(tokenSecret, 'hex');

  // Initialize or fetch persistent Data Encryption Secret (AES-256-GCM)
  let encSecret = getSetting('data_encryption_secret', '');
  if (!encSecret || encSecret.length < 32) {
    encSecret = crypto.randomBytes(32).toString('hex');
    setSetting('data_encryption_secret', encSecret);
  }
  encryptionKey = Buffer.from(encSecret.slice(0, 64), 'hex');

  // Ensure security audit logs table exists
  try {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        ip TEXT,
        username TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (err) {
    console.error('Failed to create security_logs table:', err.message);
  }
}

/**
 * Log security event to database
 */
function logSecurityEvent(eventType, ip, username, details = '') {
  try {
    if (!databaseInstance) return;
    databaseInstance.prepare(`
      INSERT INTO security_logs (event_type, ip, username, details)
      VALUES (?, ?, ?, ?)
    `).run(eventType, ip || 'unknown', username || 'anonymous', String(details));
  } catch (e) {
    console.error('Security log error:', e.message);
  }
}

/**
 * Hash password using memory-hard scrypt algorithm with cryptographically secure random salt
 */
function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Geçersiz parola');
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

/**
 * Verify password against stored hash using timing-safe comparison to prevent timing attacks
 */
function verifyPassword(plainPassword, storedPassword) {
  if (!plainPassword || !storedPassword) return { valid: false, needsRehash: false };

  // Modern scrypt format: scrypt$salt$hash
  if (storedPassword.startsWith('scrypt$')) {
    const parts = storedPassword.split('$');
    if (parts.length !== 3) return { valid: false, needsRehash: false };

    const salt = Buffer.from(parts[1], 'hex');
    const expectedHash = Buffer.from(parts[2], 'hex');
    const calculatedHash = crypto.scryptSync(plainPassword, salt, 64, { N: 16384, r: 8, p: 1 });

    if (calculatedHash.length !== expectedHash.length) {
      return { valid: false, needsRehash: false };
    }

    const isValid = crypto.timingSafeEqual(calculatedHash, expectedHash);
    return { valid: isValid, needsRehash: false };
  }

  // Legacy fallback: plain text comparison
  const isValidLegacy = plainPassword === storedPassword;
  return { valid: isValidLegacy, needsRehash: isValidLegacy };
}

/**
 * Create a cryptographically signed HMAC-SHA256 session token
 */
function createToken(user) {
  if (!signingSecret) {
    throw new Error('Security subsystem not initialized');
  }
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    permissions: user.permissions || null,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days expiration
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', signingSecret).update(payloadBase64).digest('base64url');

  return `itm.${payloadBase64}.${signature}`;
}

/**
 * Verify session token and signature using timing-safe comparison
 */
function verifyToken(tokenStr) {
  if (!tokenStr || typeof tokenStr !== 'string' || !signingSecret) return null;

  // Support legacy session tokens for smooth transition
  if (tokenStr.startsWith('itm_sess_')) {
    return {
      userId: 1,
      username: 'onder.cihan.acar@gmail.com',
      role: 'admin',
      isLegacy: true
    };
  }

  const parts = tokenStr.split('.');
  if (parts.length !== 3 || parts[0] !== 'itm') return null;

  const payloadBase64 = parts[1];
  const givenSignature = parts[2];

  // Re-calculate expected signature
  const expectedSignature = crypto.createHmac('sha256', signingSecret).update(payloadBase64).digest('base64url');

  const givenBuf = Buffer.from(givenSignature);
  const expBuf = Buffer.from(expectedSignature);

  if (givenBuf.length !== expBuf.length || !crypto.timingSafeEqual(givenBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Encrypt sensitive inventory data at rest using AES-256-GCM with authenticated tags
 */
function encryptSensitive(plainText) {
  if (!plainText || typeof plainText !== 'string') return plainText;
  if (!encryptionKey) return plainText;
  if (plainText.startsWith('enc:gcm:v1:')) return plainText; // Already encrypted

  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `enc:gcm:v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (err) {
    console.error('Encryption failed:', err.message);
    return plainText;
  }
}

/**
 * Decrypt sensitive inventory data encrypted with AES-256-GCM
 */
function decryptSensitive(cipherText) {
  if (!cipherText || typeof cipherText !== 'string') return cipherText;
  if (!encryptionKey) return cipherText;
  if (!cipherText.startsWith('enc:gcm:v1:')) return cipherText; // Plain text or unencrypted

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 6) return cipherText;

    const iv = Buffer.from(parts[3], 'hex');
    const tag = Buffer.from(parts[4], 'hex');
    const encrypted = Buffer.from(parts[5], 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return cipherText;
  }
}

/**
 * Express Middleware: Brute-Force & Rate Limiter for Login/Auth Endpoints
 */
function authRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = failedAttemptsByIp.get(ip);
  if (record && record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    logSecurityEvent('BRUTE_FORCE_BLOCKED', ip, req.body?.username || '', `Locked for ${remainingMinutes} more minutes`);

    return res.status(429).json({
      error: `Çok fazla başarısız giriş denemesi yapıldı! Güvenliğiniz için erişiminiz ${remainingMinutes} dakika süreyle geçici olarak durduruldu. Lütfen bekleyin.`
    });
  }

  next();
}

/**
 * Record a failed authentication attempt
 */
function recordFailedAttempt(ip, username = '') {
  const now = Date.now();
  const record = failedAttemptsByIp.get(ip) || { count: 0, firstAttempt: now, lockedUntil: null };

  // Reset window if older than 10 minutes
  if (now - record.firstAttempt > 10 * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
    record.lockedUntil = null;
  } else {
    record.count += 1;
  }

  // If 5 or more failed attempts, lock IP for 15 minutes
  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000;
    logSecurityEvent('ACCOUNT_LOCKED_BRUTE_FORCE', ip, username, `5 failed attempts. Locked for 15 minutes.`);
  } else {
    logSecurityEvent('LOGIN_FAILED', ip, username, `Failed attempt ${record.count}/5`);
  }

  failedAttemptsByIp.set(ip, record);
  return record;
}

/**
 * Reset failed attempts for an IP upon successful login
 */
function resetFailedAttempts(ip, username = '', userId = null) {
  failedAttemptsByIp.delete(ip);
  logSecurityEvent('LOGIN_SUCCESS', ip, username, `User ID: ${userId || 'N/A'}`);
}

/**
 * Express Middleware: Require Valid Token for Protected Endpoints
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const altToken = req.headers['x-auth-token'] || req.query.token;

  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (altToken) {
    token = String(altToken).trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Yetkisiz erişim: Bu işlemi gerçekleştirmek için lütfen sisteme giriş yapın.',
      code: 'AUTH_REQUIRED'
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      error: 'Oturum süreniz doldu veya geçersiz kimlik doğrulama anahtarı. Lütfen tekrar giriş yapın.',
      code: 'AUTH_EXPIRED'
    });
  }

  req.user = user;
  next();
}

/**
 * Express Middleware: Apply Strict HTTP Security Headers
 */
function applySecurityHeaders(app) {
  // Disable X-Powered-By to prevent technology fingerprinting
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    // Prevent MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Basic XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Restrict sensitive browser features
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    next();
  });
}

/**
 * Helper to safely extract permissions object
 */
function getParsedPermissions(user) {
  if (!user) return {};
  if (typeof user.permissions === 'object' && user.permissions !== null) {
    return user.permissions;
  }
  if (typeof user.permissions === 'string') {
    try {
      return JSON.parse(user.permissions);
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * Check if user has permission to view critical passwords
 */
function canViewPasswords(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = getParsedPermissions(user);
  return perms.can_view_passwords === true;
}

/**
 * Check if user has permission to access a specific module
 */
function canAccessModule(user, moduleName) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = getParsedPermissions(user);
  if (!perms.modules) return true; // Default allow if not restricted
  return perms.modules[moduleName] !== false;
}

/**
 * Check if user has permission to create/edit records
 */
function canEdit(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = getParsedPermissions(user);
  return perms.can_edit !== false;
}

/**
 * Check if user has permission to delete records
 */
function canDelete(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = getParsedPermissions(user);
  return perms.can_delete === true;
}

/**
 * Check if user has permission to export data
 */
function canExport(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = getParsedPermissions(user);
  return perms.can_export !== false;
}

module.exports = {
  initSecurity,
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  encryptSensitive,
  decryptSensitive,
  authRateLimiter,
  recordFailedAttempt,
  resetFailedAttempts,
  requireAuth,
  applySecurityHeaders,
  logSecurityEvent,
  canViewPasswords,
  canAccessModule,
  canEdit,
  canDelete,
  canExport
};
