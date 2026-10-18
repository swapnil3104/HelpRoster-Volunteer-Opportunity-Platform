/**
 * Centralized API response helpers to maintain consistent JSON shapes across all endpoints.
 */

/**
 * Send a standard success response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} message
 * @param {number} statusCode
 * @param {object} [meta]
 */
export function sendSuccess(res, data = null, message = 'Success', statusCode = 200, meta = undefined) {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Send a standard paginated response
 * @param {import('express').Response} res
 * @param {Array<any>} items
 * @param {{ page: number, limit: number, totalItems: number, totalPages?: number }} paginationInfo
 * @param {string} message
 * @param {number} statusCode
 */
export function sendPaginated(res, items = [], paginationInfo, message = 'Data retrieved successfully', statusCode = 200) {
  const { page, limit, totalItems } = paginationInfo;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return res.status(statusCode).json({
    success: true,
    message,
    data: items,
    meta: {
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}

/**
 * Send a standard error response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {string} errorCode
 * @param {any} details
 */
export function sendError(
  res,
  message = 'An error occurred',
  statusCode = 500,
  errorCode = 'INTERNAL_SERVER_ERROR',
  details = null
) {
  const errorObj = {
    code: errorCode,
    message
  };

  if (details !== null && details !== undefined) {
    errorObj.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
}
