import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedsDir = path.resolve(__dirname, '../../../database/seeds');

/**
 * Execute seed scripts in database/seeds
 */
export async function runSeeds() {
  console.log('🌱 Starting database seeding...');

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true
  });

  try {
    if (!fs.existsSync(seedsDir)) {
      console.log(`⚠️ Seeds directory not found at ${seedsDir}`);
      return;
    }

    const files = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`🌿 Executing seed: ${file}...`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await connection.query(sql);
      console.log(`✅ Seed applied: ${file}`);
    }

    console.log('🎉 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run directly if called from command line
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeeds()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
