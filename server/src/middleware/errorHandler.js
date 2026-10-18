import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err, req, res, next) {
  // Log full stack trace internally
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // Do not expose stack traces or raw database query strings to clients
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  const details = env.NODE_ENV === 'development' ? err.details || err.stack : undefined;

  return sendError(res, message, statusCode, errorCode, details);
}
