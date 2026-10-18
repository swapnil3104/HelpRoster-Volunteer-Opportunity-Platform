import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupsDir = path.resolve(__dirname, '../../../database/backups');

/**
 * Restore database from an SQL dump file
 */
export async function restoreDatabase(inputFile = null) {
  let targetFile = inputFile;

  if (!targetFile) {
    if (!fs.existsSync(backupsDir)) {
      throw new Error(`Backups directory not found at ${backupsDir}`);
    }

    const backupFiles = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      throw new Error(`No SQL backup files found in ${backupsDir}`);
    }

    targetFile = path.join(backupsDir, backupFiles[0]);
    console.log(`ℹ️ No backup file specified. Using most recent: ${backupFiles[0]}`);
  }

  if (!fs.existsSync(targetFile)) {
    throw new Error(`Specified backup file does not exist: ${targetFile}`);
  }

  console.log(`🔄 Initiating database restore from "${targetFile}" into "${env.DB_NAME}"...`);

  const sqlContent = fs.readFileSync(targetFile, 'utf8');

  // Connect to MySQL server with multipleStatements enabled
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    // Ensure target database exists and select it
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${env.DB_NAME}\`;`);

    // Execute backup SQL script
    await connection.query(sqlContent);

    // Verify restored tables
    const [tableRows] = await connection.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
    const tableKey = Object.keys(tableRows[0] || {})[0];
    const tables = tableRows.map((r) => r[tableKey]);

    console.log(`✅ Database restore completed successfully!`);
    console.log(`   Restored ${tables.length} table(s) into database "${env.DB_NAME}".`);

    return { success: true, file: targetFile, tables: tables.length };
  } catch (err) {
    console.error('❌ Restore failed:', err.message);
    throw err;
  } finally {
    await connection.end();
  }
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const customFile = process.argv[2] || null;
  restoreDatabase(customFile)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
