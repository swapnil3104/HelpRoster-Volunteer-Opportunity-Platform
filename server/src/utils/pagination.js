/**
 * Pagination and sorting query helper utilities.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/**
 * Parses and sanitizes pagination and sorting query parameters.
 * @param {object} query - Express req.query
 * @param {object} [options]
 * @param {number} [options.defaultLimit=10]
 * @param {string} [options.defaultSort='created_at']
 * @param {'asc'|'desc'} [options.defaultOrder='desc']
 * @param {string[]} [options.allowedSortFields=['created_at', 'id']]
 * @returns {{ page: number, limit: number, offset: number, sort: string, order: 'ASC'|'DESC' }}
 */
export function parsePaginationParams(query = {}, options = {}) {
  const defaultLimit = options.defaultLimit || DEFAULT_LIMIT;
  const defaultSort = options.defaultSort || 'created_at';
  const defaultOrder = (options.defaultOrder || 'desc').toUpperCase();
  const allowedSortFields = options.allowedSortFields || ['created_at', 'id'];

  // Parse page
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  // Parse limit
  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const offset = (page - 1) * limit;

  // Validate sort field
  let sort = query.sort;
  if (!sort || !allowedSortFields.includes(sort)) {
    sort = defaultSort;
  }

  // Validate order direction
  let order = (query.order || defaultOrder).toUpperCase();
  if (order !== 'ASC' && order !== 'DESC') {
    order = defaultOrder === 'ASC' ? 'ASC' : 'DESC';
  }

  return {
    page,
    limit,
    offset,
    sort,
    order
  };
}
