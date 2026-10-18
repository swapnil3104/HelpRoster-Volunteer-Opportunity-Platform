import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backups destination directory
const backupsDir = path.resolve(__dirname, '../../../database/backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

/**
 * Escape a value for SQL dump
 */
function escapeSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%': return '\\' + char;
        default: return char;
      }
    })}'`;
  }

  // String escaping
  const escaped = String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0': return '\\0';
      case '\x08': return '\\b';
      case '\x09': return '\\t';
      case '\x1a': return '\\z';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%': return '\\' + char;
      default: return char;
    }
  });
  return `'${escaped}'`;
}

/**
 * Execute automated database backup
 */
export async function createDatabaseBackup(customOutputFile = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = customOutputFile || path.join(backupsDir, `helproster_backup_${timestamp}.sql`);

  console.log(`📦 Initiating database backup for database "${env.DB_NAME}" at ${env.DB_HOST}:${env.DB_PORT}...`);

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  });

  try {
    const headerLines = [
      '--',
      '-- HelpRoster Automated Database Backup',
      `-- Host: ${env.DB_HOST}:${env.DB_PORT}    Database: ${env.DB_NAME}`,
      `-- Backup Generated At: ${new Date().toISOString()}`,
      '--',
      'SET FOREIGN_KEY_CHECKS = 0;',
      'SET NAMES utf8mb4;',
      'SET TIME_ZONE = "+00:00";',
      ''
    ];

    const sqlChunks = [...headerLines];

    // Fetch all tables
    const [tableRows] = await connection.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
    if (!tableRows || tableRows.length === 0) {
      console.log('⚠️ No tables found in database to backup.');
      return { success: true, filename, tables: 0, rows: 0, size: 0 };
    }

    const tableKey = Object.keys(tableRows[0])[0];
    const tables = tableRows.map((row) => row[tableKey]);

    console.log(`📋 Found ${tables.length} table(s) to backup.`);

    let totalRows = 0;

    for (const table of tables) {
      // Get CREATE TABLE
      const [createResult] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      const createTableSql = createResult[0]['Create Table'];

      sqlChunks.push(`-- Table structure for \`${table}\``);
      sqlChunks.push(`DROP TABLE IF EXISTS \`${table}\`;`);
      sqlChunks.push(`${createTableSql};`);
      sqlChunks.push('');

      // Fetch table rows
      const [rows] = await connection.query(`SELECT * FROM \`${table}\``);

      if (rows.length > 0) {
        totalRows += rows.length;
        sqlChunks.push(`-- Dumping data for table \`${table}\` (${rows.length} rows)`);

        const columns = Object.keys(rows[0]).map((col) => `\`${col}\``).join(', ');

        // Batch inserts in groups of 100
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const valuesList = batch
            .map((row) => {
              const vals = Object.values(row).map(escapeSqlValue).join(', ');
              return `(${vals})`;
            })
            .join(',\n  ');

          sqlChunks.push(`INSERT INTO \`${table}\` (${columns}) VALUES\n  ${valuesList};`);
        }
        sqlChunks.push('');
      }
    }

    sqlChunks.push('SET FOREIGN_KEY_CHECKS = 1;');
    sqlChunks.push('-- Backup completed successfully.');
    sqlChunks.push('');

    fs.writeFileSync(filename, sqlChunks.join('\n'), 'utf8');

    const stats = fs.statSync(filename);
    const sizeKb = (stats.size / 1024).toFixed(2);

    console.log(`✅ Backup successfully created!`);
    console.log(`   File: ${filename}`);
    console.log(`   Tables: ${tables.length}`);
    console.log(`   Total Rows: ${totalRows}`);
    console.log(`   Size: ${sizeKb} KB`);

    return { success: true, filename, tables: tables.length, rows: totalRows, size: stats.size };
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    throw err;
  } finally {
    await connection.end();
  }
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createDatabaseBackup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
