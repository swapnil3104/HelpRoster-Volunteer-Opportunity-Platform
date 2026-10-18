import mysql from 'mysql2/promise';
import { env } from './env.js';

let pool = null;

try {
  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: env.DB_CONNECTION_LIMIT,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
} catch (error) {
  console.error('❌ Failed to initialize MySQL pool:', error.message);
}

/**
 * Check MySQL database connectivity
 * @returns {Promise<{ connected: boolean, message?: string, error?: string }>}
 */
export async function checkDatabaseConnection() {
  if (!pool) {
    return {
      connected: false,
      error: 'Database connection pool is not initialized'
    };
  }

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return {
      connected: true,
      message: 'MySQL connection successful'
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

export default pool;
