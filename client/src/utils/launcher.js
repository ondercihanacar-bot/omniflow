/**
 * OMNIFlow - Quick Connection & Launcher Utilities
 * Supports AnyDesk deep links, dynamic RDP file generation, and Web Panel credentials copy
 */

/**
 * Launch AnyDesk desktop client with the given remote access ID
 * @param {string} remoteId - AnyDesk ID or alias
 */
export function launchAnyDesk(remoteId) {
  if (!remoteId) return false;
  const cleanId = String(remoteId).replace(/[^a-zA-Z0-9@.-]/g, '');
  if (!cleanId) return false;

  // Try protocol handler (anydesk:123456789)
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = `anydesk:${cleanId}`;
  document.body.appendChild(iframe);
  setTimeout(() => {
    try { document.body.removeChild(iframe); } catch (e) {}
  }, 2000);

  // Also copy ID to clipboard for convenience
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(cleanId).catch(() => {});
  }

  return true;
}

/**
 * Generate and trigger download of a Windows .rdp file for instant mstsc launch
 * @param {string} host - IP address or hostname
 * @param {string} username - Remote desktop username
 * @param {string} displayName - Name for the downloaded file
 * @param {number} port - Remote desktop port (default 3389)
 */
export function downloadRdpFile(host, username = '', displayName = 'Remote_Desktop', port = 3389) {
  if (!host) return;

  const cleanHost = String(host).trim();
  const address = port && port !== 3389 ? `${cleanHost}:${port}` : cleanHost;

  const rdpContent = [
    `full address:s:${address}`,
    `username:s:${username || ''}`,
    `prompt for credentials:i:1`,
    `screen mode id:i:2`,
    `use multimon:i:0`,
    `desktopwidth:i:1920`,
    `desktopheight:i:1080`,
    `session bpp:i:32`,
    `compression:i:1`,
    `keyboardhook:i:2`,
    `audiomode:i:0`,
    `redirectprinters:i:0`,
    `redirectcomports:i:0`,
    `redirectsmartcards:i:1`,
    `redirectclipboard:i:1`,
    `redirectposdevices:i:0`,
    `drivestoredirect:s:*`,
    `displayconnectionbar:i:1`,
    `autoreconnection enabled:i:1`,
    `authentication level:i:2`,
    `negotiate security layer:i:1`,
    `remoteapplicationmode:i:0`,
    `allow font smoothing:i:1`,
    `disable wallpaper:i:0`,
    `disable full window drag:i:0`,
    `disable menu anims:i:0`,
    `disable themes:i:0`,
    `disable cursor setting:i:0`
  ].join('\r\n');

  const blob = new Blob([rdpContent], { type: 'application/x-rdp' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = displayName.replace(/[^a-zA-Z0-9çÇğĞıİöÖşŞüÜ_-]/g, '_');
  a.download = `${safeName}.rdp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Open a device web management panel in a new tab and copy password to clipboard
 * @param {string} rawUrl - IP address or URL
 * @param {string} password - Password to copy
 * @param {string} username - Optional username to mention in feedback
 * @returns {string} - The opened URL
 */
export function openWebPanel(rawUrl, password = '', username = '') {
  if (!rawUrl) return '';

  let finalUrl = String(rawUrl).trim();
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = `https://${finalUrl}`;
  }

  // Copy password to clipboard
  if (password && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(password).catch(() => {});
  }

  window.open(finalUrl, '_blank', 'noopener,noreferrer');
  return finalUrl;
}
