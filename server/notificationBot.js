/**
 * OMNIFlow - Telegram & WhatsApp Automatic License Notification Bot Engine
 * Supports Telegram Bot API, WhatsApp Webhook/Gateways, and Direct wa.me links.
 */

// Helper to parse dates in DD.MM.YYYY, YYYY-MM-DD, DD/MM/YYYY formats
function parseExpiryDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  // YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Calculate remaining calendar days until expiry
function getDaysRemaining(dateStr) {
  const expiryDate = parseExpiryDate(dateStr);
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Collect all licenses across firewalls, antiviruses, and mail services
function collectExpiringLicenses(db, maxDaysThreshold = 30) {
  const results = [];

  try {
    // 1. Firewalls
    const firewalls = db.prepare(`
      SELECT f.id, f.customer_id, f.device_name as name, f.brand, f.model, f.license_expiry,
             'firewall' as type, 'Firewall' as typeLabel,
             c.name as customer_name, c.code as customer_code, f.management_ip as access_info,
             f.branch_name
      FROM firewalls f
      JOIN customers c ON f.customer_id = c.id
      WHERE f.license_expiry IS NOT NULL AND TRIM(f.license_expiry) != ''
    `).all();

    for (const item of firewalls) {
      const days = getDaysRemaining(item.license_expiry);
      if (days !== null && days <= maxDaysThreshold) {
        results.push({
          ...item,
          daysRemaining: days,
          isExpired: days < 0,
          isToday: days === 0,
          isCritical: days <= 15
        });
      }
    }
  } catch (err) {
    console.error('[NotificationBot] Firewall query error:', err.message);
  }

  try {
    // 2. Antivirus Licenses
    const antiviruses = db.prepare(`
      SELECT av.id, av.customer_id, av.product_name as name, av.brand, '' as model, av.user_count, av.license_term, av.license_expiry,
             'antivirus' as type, 'Antivirüs' as typeLabel,
             c.name as customer_name, c.code as customer_code, av.portal_url as access_info,
             av.branch_name
      FROM antivirus_licenses av
      JOIN customers c ON av.customer_id = c.id
      WHERE av.license_expiry IS NOT NULL AND TRIM(av.license_expiry) != ''
    `).all();

    for (const item of antiviruses) {
      const days = getDaysRemaining(item.license_expiry);
      if (days !== null && days <= maxDaysThreshold) {
        results.push({
          ...item,
          daysRemaining: days,
          isExpired: days < 0,
          isToday: days === 0,
          isCritical: days <= 15
        });
      }
    }
  } catch (err) {
    console.error('[NotificationBot] Antivirus query error:', err.message);
  }

  try {
    // 3. Mail Services
    const mailLicenses = db.prepare(`
      SELECT ms.id, ms.customer_id, ms.service_name as name, 'Exchange / Mail' as brand, ms.license_type as model,
             ms.license_count as user_count, 'Yıllık Abonelik' as license_term, ms.license_expiry,
             'mail' as type, 'Kurumsal Mail' as typeLabel,
             c.name as customer_name, c.code as customer_code, ms.admin_panel_url as access_info,
             'Merkez Ofis' as branch_name
      FROM mail_services ms
      JOIN customers c ON ms.customer_id = c.id
      WHERE ms.license_expiry IS NOT NULL AND TRIM(ms.license_expiry) != ''
    `).all();

    for (const item of mailLicenses) {
      const days = getDaysRemaining(item.license_expiry);
      if (days !== null && days <= maxDaysThreshold) {
        results.push({
          ...item,
          daysRemaining: days,
          isExpired: days < 0,
          isToday: days === 0,
          isCritical: days <= 15
        });
      }
    }
  } catch (err) {
    console.error('[NotificationBot] Mail query error:', err.message);
  }

  // Sort: expired first, then nearest days
  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

// Format message for Telegram (HTML Mode)
function formatTelegramMessage(licenses, customerFilter = null) {
  if (!licenses || licenses.length === 0) {
    return `<b>✅ OMNIFlow Lisans Durumu</b>\n\nŞu anda süresi yaklaşan (≤ 30 gün) veya bitmiş herhangi bir lisans bulunmuyor. Tüm sistemler güvenli!`;
  }

  const expired = licenses.filter(l => l.daysRemaining < 0);
  const critical = licenses.filter(l => l.daysRemaining >= 0 && l.daysRemaining <= 15);
  const warning = licenses.filter(l => l.daysRemaining > 15 && l.daysRemaining <= 30);

  let msg = `🚨 <b>OMNIFLOW LİSANS UYARI RAPORU</b>\n`;
  msg += `📅 Tarih: <code>${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</code>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Expired
  if (expired.length > 0) {
    msg += `❌ <b>SÜRESİ DOLMUŞ LİSANSLAR (${expired.length})</b>\n`;
    expired.forEach(item => {
      const daysPassed = Math.abs(item.daysRemaining);
      msg += `• <b>${item.customer_name}</b>\n`;
      msg += `  └ ${item.typeLabel}: <b>${item.name || item.brand}</b>\n`;
      msg += `  └ Durum: <b>🚨 ${daysPassed} gün önce doldu!</b> (${item.license_expiry})\n\n`;
    });
  }

  // Critical (0 - 15 days)
  if (critical.length > 0) {
    msg += `🔴 <b>KRİTİK LİSANSLAR — SON 15 GÜN (${critical.length})</b>\n`;
    critical.forEach(item => {
      const daysText = item.daysRemaining === 0 ? 'BUGÜN BİTİYOR!' : `Son ${item.daysRemaining} gün kaldı!`;
      msg += `• <b>${item.customer_name}</b>\n`;
      msg += `  └ ${item.typeLabel}: <b>${item.name || item.brand}</b>\n`;
      msg += `  └ Kalan Süre: <b>⚡ ${daysText}</b> (${item.license_expiry})\n\n`;
    });
  }

  // Warning (16 - 30 days)
  if (warning.length > 0) {
    msg += `⚠️ <b>YAKLAŞAN LİSANSLAR — 30 GÜN İÇİNDE (${warning.length})</b>\n`;
    warning.forEach(item => {
      msg += `• <b>${item.customer_name}</b>\n`;
      msg += `  └ ${item.typeLabel}: ${item.name || item.brand}\n`;
      msg += `  └ Kalan: <b>${item.daysRemaining} gün</b> (${item.license_expiry})\n\n`;
    });
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `<i>OMNIFlow Akıllı IT Yönetim & MSP Otomasyonu</i>`;
  return msg;
}

// Format message for WhatsApp (Markdown Mode)
function formatWhatsAppMessage(licenses, customerFilter = null) {
  if (!licenses || licenses.length === 0) {
    return `*✅ OMNIFlow Lisans Durumu*\n\nŞu anda süresi yaklaşan veya dolmuş herhangi bir lisans bulunmamaktadır. Tüm sistemler aktif!`;
  }

  const expired = licenses.filter(l => l.daysRemaining < 0);
  const critical = licenses.filter(l => l.daysRemaining >= 0 && l.daysRemaining <= 15);
  const warning = licenses.filter(l => l.daysRemaining > 15 && l.daysRemaining <= 30);

  let msg = `*🚨 OMNIFLOW LİSANS UYARI RAPORU*\n`;
  msg += `📅 _${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}_\n`;
  msg += `--------------------------------------\n\n`;

  if (expired.length > 0) {
    msg += `*❌ SÜRESİ DOLMUŞ LİSANSLAR (${expired.length})*\n`;
    expired.forEach(item => {
      const daysPassed = Math.abs(item.daysRemaining);
      msg += `• *${item.customer_name}*\n`;
      msg += `  └ ${item.typeLabel}: *${item.name || item.brand}*\n`;
      msg += `  └ Durum: 🚨 ${daysPassed} gün önce doldu! (${item.license_expiry})\n\n`;
    });
  }

  if (critical.length > 0) {
    msg += `*🔴 KRİTİK LİSANSLAR — SON 15 GÜN (${critical.length})*\n`;
    critical.forEach(item => {
      const daysText = item.daysRemaining === 0 ? 'BUGÜN BİTİYOR!' : `Son ${item.daysRemaining} gün kaldı!`;
      msg += `• *${item.customer_name}*\n`;
      msg += `  └ ${item.typeLabel}: *${item.name || item.brand}*\n`;
      msg += `  └ Kalan: ⚡ ${daysText} (${item.license_expiry})\n\n`;
    });
  }

  if (warning.length > 0) {
    msg += `*⚠️ YAKLAŞAN LİSANSLAR — 30 GÜN İÇİNDE (${warning.length})*\n`;
    warning.forEach(item => {
      msg += `• *${item.customer_name}*\n`;
      msg += `  └ ${item.typeLabel}: ${item.name || item.brand}\n`;
      msg += `  └ Kalan: ${item.daysRemaining} gün (${item.license_expiry})\n\n`;
    });
  }

  msg += `--------------------------------------\n`;
  msg += `_OMNIFlow Akıllı IT Yönetim & MSP Otomasyonu_`;
  return msg;
}

// Send message via Telegram Bot API
async function sendTelegramMessage(botToken, chatId, textHtml) {
  if (!botToken || !chatId) {
    throw new Error('Telegram Bot Token veya Chat ID eksik.');
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  const payload = {
    chat_id: cleanChatId,
    text: textHtml,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resJson = await response.json();
  if (!resJson.ok) {
    const desc = resJson.description || 'Telegram API çağrısı başarısız oldu';
    throw new Error(`Telegram Hatası (${resJson.error_code || 'Bilinmiyor'}): ${desc}`);
  }

  return { success: true, messageId: resJson.result?.message_id };
}

// Send message via WhatsApp Webhook Gateway
async function sendWhatsAppWebhook(gatewayUrl, apiKey, targetPhone, messageText) {
  if (!gatewayUrl) {
    throw new Error('WhatsApp Gateway / Webhook URL adresi belirtilmemiş.');
  }

  const cleanUrl = gatewayUrl.trim();
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    headers['x-api-key'] = apiKey.trim();
  }

  // Common JSON payload structure supporting Green API, UltraMsg, Whapi, n8n, etc.
  const payload = {
    chatId: targetPhone ? `${targetPhone.replace(/[^0-9]/g, '')}@c.us` : undefined,
    to: targetPhone ? targetPhone.replace(/[^0-9]/g, '') : undefined,
    phone: targetPhone ? targetPhone.replace(/[^0-9]/g, '') : undefined,
    message: messageText,
    body: messageText,
    text: messageText
  };

  const response = await fetch(cleanUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp Webhook Hatası (${response.status}): ${errorText.substring(0, 200)}`);
  }

  return { success: true, status: response.status };
}

// Automated Scheduler: Runs daily in the background to dispatch alerts
let schedulerTimer = null;

function initScheduler(db, getSetting, setSetting) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  // Check every 6 hours
  const INTERVAL_MS = 6 * 60 * 60 * 1000;

  const runCheck = async () => {
    try {
      const telegramEnabled = getSetting('telegram_bot_enabled', 'false') === 'true';
      const whatsappEnabled = getSetting('whatsapp_bot_enabled', 'false') === 'true';

      if (!telegramEnabled && !whatsappEnabled) return;

      const lastSentStr = getSetting('last_license_notification_sent_date', '');
      const todayStr = new Date().toISOString().split('T')[0];

      // Send once per calendar day
      if (lastSentStr === todayStr) {
        return;
      }

      const licenses = collectExpiringLicenses(db, 30);
      if (licenses.length === 0) return; // No urgent licenses to alert

      // 1. Telegram
      if (telegramEnabled) {
        const token = getSetting('telegram_bot_token', '');
        const chatId = getSetting('telegram_chat_id', '');
        if (token && chatId) {
          const telegramMsg = formatTelegramMessage(licenses);
          await sendTelegramMessage(token, chatId, telegramMsg);
          console.log('[NotificationBot] Automated Telegram license alerts sent successfully.');
        }
      }

      // 2. WhatsApp Gateway
      if (whatsappEnabled) {
        const gatewayUrl = getSetting('whatsapp_gateway_url', '');
        const apiKey = getSetting('whatsapp_api_key', '');
        const phone = getSetting('whatsapp_target_phone', '');
        if (gatewayUrl) {
          const waMsg = formatWhatsAppMessage(licenses);
          await sendWhatsAppWebhook(gatewayUrl, apiKey, phone, waMsg);
          console.log('[NotificationBot] Automated WhatsApp license alerts sent successfully.');
        }
      }

      setSetting('last_license_notification_sent_date', todayStr);
      setSetting('last_license_notification_sent_at', new Date().toISOString());
    } catch (err) {
      console.error('[NotificationBot] Scheduler execution error:', err.message);
    }
  };

  // Run initial check after 15 seconds from server boot
  setTimeout(runCheck, 15000);

  // Set recurring interval
  schedulerTimer = setInterval(runCheck, INTERVAL_MS);
  console.log('[NotificationBot] License alert scheduler initialized (6-hour scan cycle).');
}

module.exports = {
  parseExpiryDate,
  getDaysRemaining,
  collectExpiringLicenses,
  formatTelegramMessage,
  formatWhatsAppMessage,
  sendTelegramMessage,
  sendWhatsAppWebhook,
  initScheduler
};
