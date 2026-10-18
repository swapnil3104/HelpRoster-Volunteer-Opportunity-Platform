import { checkDatabaseConnection } from '../config/db.js';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function getHealthStatus(req, res, next) {
  try {
    const dbStatus = await checkDatabaseConnection();

    const healthData = {
      service: 'HelpRoster REST API',
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
      database: {
        engine: 'MySQL',
        connected: dbStatus.connected,
        status: dbStatus.connected ? 'healthy' : 'disconnected',
        ...(dbStatus.error ? { message: dbStatus.error } : {})
      }
    };

    return sendSuccess(res, healthData, 'HelpRoster API is healthy');
  } catch (error) {
    next(error);
  }
}
