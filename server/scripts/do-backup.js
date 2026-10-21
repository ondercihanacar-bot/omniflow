const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const projectRoot = path.resolve(__dirname, '..', '..');
const dbPath = path.join(projectRoot, 'server', 'data', 'itmanager.db');
const backupDir = path.join(projectRoot, 'Otomatik_Yedekler');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 1. Force WAL checkpoint to flush all data to the main file
const db = new DatabaseSync(dbPath);
try {
  db.exec('PRAGMA wal_checkpoint(FULL);');
  console.log('[WAL] Checkpoint completed.');
} catch (e) {
  console.warn('[WAL] Warning:', e.message);
}

// 2. Prepare timestamp
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

// 3. Backup .db file
const dbBackupName = `OmniFlow_Backup_${dateStr}.db`;
const targetDbPath = path.join(backupDir, dbBackupName);
fs.copyFileSync(dbPath, targetDbPath);
console.log('[DB Backup] Created:', targetDbPath, 'Size:', fs.statSync(targetDbPath).size, 'bytes');

// 4. Generate JSON export of all tables
const tables = [
  'customers', 'customer_branches', 'users', 'user_computers',
  'physical_servers', 'virtual_machines', 'firewalls', 'backup_units',
  'wifi_controllers', 'wifi_access_points', 'wifi_networks',
  'antivirus_licenses', 'mail_services', 'mail_accounts', 'internet_lines',
  'knowledge_base'
];

const exportData = {
  exportedAt: now.toISOString(),
  system: 'OMNIFlow',
  version: '2026.1',
  tables: {}
};

for (const t of tables) {
  try {
    exportData.tables[t] = db.prepare('SELECT * FROM ' + t).all();
  } catch (err) {
    exportData.tables[t] = [];
  }
}

const jsonBackupName = `OmniFlow_Backup_${dateStr}.json`;
const targetJsonPath = path.join(backupDir, jsonBackupName);
fs.writeFileSync(targetJsonPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log('[JSON Backup] Created:', targetJsonPath, 'Size:', fs.statSync(targetJsonPath).size, 'bytes');

console.log('--- ALL BACKUPS COMPLETED SUCCESSFULLY ---');
