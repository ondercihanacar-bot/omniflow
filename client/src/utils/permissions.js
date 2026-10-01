/**
 * OMNIFlow - Client-side Permission & Role-Based Access Control (RBAC)
 */

export const DEFAULT_PERMISSIONS = {
  can_view_passwords: false,
  can_edit: true,
  can_delete: false,
  can_export: false,
  modules: {
    servers: true,
    vms: true,
    computers: true,
    firewalls: false,
    backups: false,
    internet: true,
    wifi: false,
    antivirus: true,
    mail: true,
    knowledge_base: true
  }
};

export const ADMIN_PERMISSIONS = {
  can_view_passwords: true,
  can_edit: true,
  can_delete: true,
  can_export: true,
  modules: {
    servers: true,
    vms: true,
    computers: true,
    firewalls: true,
    backups: true,
    internet: true,
    wifi: true,
    antivirus: true,
    mail: true,
    knowledge_base: true
  }
};

/**
 * Check if the given user has a specific permission
 * @param {Object} user Current logged-in user object
 * @param {'view_passwords' | 'edit' | 'delete' | 'export' | 'module'} permType
 * @param {string} [moduleName] Module name (servers, vms, computers, firewalls, backups, internet, wifi, antivirus, mail, knowledge_base)
 * @returns {boolean}
 */
export function checkPermission(user, permType, moduleName = null) {
  if (!user) return false;
  if (user.role === 'admin') return true;

  let perms = user.permissions;
  if (typeof perms === 'string') {
    try {
      perms = JSON.parse(perms);
    } catch (e) {
      perms = DEFAULT_PERMISSIONS;
    }
  }
  if (!perms || typeof perms !== 'object') {
    perms = DEFAULT_PERMISSIONS;
  }

  if (permType === 'view_passwords') {
    return perms.can_view_passwords === true;
  }
  if (permType === 'edit') {
    return perms.can_edit !== false;
  }
  if (permType === 'delete') {
    return perms.can_delete === true;
  }
  if (permType === 'export') {
    return perms.can_export !== false;
  }
  if (permType === 'module' && moduleName) {
    if (!perms.modules) return true;
    return perms.modules[moduleName] !== false;
  }

  return true;
}
