import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { runMigrations } from './migrate.js';
import { runSeeds } from './seed.js';
import { fileURLToPath } from 'url';

/**
 * Reset development database: Drop tables, re-run migrations, and apply seeds.
 * Only allowed in development/test environments.
 */
export async function resetDatabase() {
  if (env.NODE_ENV === 'production') {
    throw new Error('Database reset is strictly forbidden in production mode!');
  }

  console.log(`⚠️ Resetting development database: ${env.DB_NAME}...`);

  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD
  });

  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${env.DB_NAME}\`;`);
    console.log(`🗑️ Database \`${env.DB_NAME}\` dropped.`);
  } finally {
    await connection.end();
  }

  // Re-run migrations
  await runMigrations();

  // Re-run seeds
  await runSeeds();

  console.log('✨ Development database reset successfully!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
