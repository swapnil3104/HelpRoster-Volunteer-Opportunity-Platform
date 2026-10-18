import app from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/db.js';

const server = app.listen(env.PORT, async () => {
  console.log(`🚀 HelpRoster API server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`📡 Health check available at: http://localhost:${env.PORT}/api/v1/health`);

  // Verify database connectivity on startup
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    console.log('✅ MySQL Database connected successfully.');
  } else {
    console.warn(`⚠️ MySQL Database notice: ${dbStatus.error || 'Not connected yet'}`);
    console.warn('   (Ensure MySQL is running and helproster_db database exists)');
  }
});

// Graceful shutdown handling
function handleShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
