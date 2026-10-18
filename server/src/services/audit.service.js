import pool from '../config/db.js';

/**
 * Log a security, administrative, or moderation event to the audit_logs table.
 * Designed to never throw errors that would abort the invoking request.
 *
 * @param {object} req - Express request object (optional for actor & request metadata)
 * @param {object} entry - Event details
 * @param {number|null} [entry.actorId] - User ID performing the action (defaults to req.user.id)
 * @param {string} entry.action - Action identifier (e.g. 'user.status_change')
 * @param {string} entry.targetType - Type of resource ('user', 'organization', 'opportunity', etc.)
 * @param {number|null} [entry.targetId] - ID of affected entity
 * @param {object|string} [entry.details] - Arbitrary context payload (reasons, diffs, notes)
 * @param {string} [entry.ipAddress] - Optional IP override
 * @param {string} [entry.userAgent] - Optional User-Agent override
 */
export async function logAudit(req, entry) {
  try {
    const actorId = entry.actorId !== undefined ? entry.actorId : (req?.user?.id || null);
    const action = entry.action;
    const targetType = entry.targetType || 'system';
    const targetId = entry.targetId !== undefined ? entry.targetId : null;

    let detailsJson = null;
    if (entry.details !== undefined && entry.details !== null) {
      detailsJson = typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details);
    }

    let ipAddress = entry.ipAddress;
    if (!ipAddress && req) {
      const forwarded = req.headers?.['x-forwarded-for'];
      ipAddress = forwarded ? forwarded.split(',')[0].trim() : (req.ip || req.connection?.remoteAddress || null);
    }

    let userAgent = entry.userAgent;
    if (!userAgent && req) {
      userAgent = req.headers?.['user-agent'] ? req.headers['user-agent'].substring(0, 255) : null;
    }

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [actorId, action, targetType, targetId, detailsJson, ipAddress, userAgent]
    );
  } catch (err) {
    // Audit logging failure must never crash core transaction
    console.error('[AuditService] Failed to record audit log:', err.message);
  }
}

/**
 * Query audit logs with pagination and filters.
 */
export async function queryAuditLogs({
  actorId,
  action,
  targetType,
  targetId,
  startDate,
  endDate,
  page = 1,
  limit = 20
} = {}) {
  const conditions = [];
  const params = [];

  if (actorId) {
    conditions.push('a.actor_id = ?');
    params.push(actorId);
  }
  if (action) {
    conditions.push('a.action LIKE ?');
    params.push(`%${action}%`);
  }
  if (targetType) {
    conditions.push('a.target_type = ?');
    params.push(targetType);
  }
  if (targetId) {
    conditions.push('a.target_id = ?');
    params.push(targetId);
  }
  if (startDate) {
    conditions.push('a.created_at >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('a.created_at <= ?');
    params.push(endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.query(
    `SELECT COUNT(*) AS total FROM audit_logs a ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const safeLimit = parseInt(limit, 10);

  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.actor_id,
       u.email AS actor_email,
       CONCAT(u.first_name, ' ', u.last_name) AS actor_name,
       u.role AS actor_role,
       a.action,
       a.target_type,
       a.target_id,
       a.details,
       a.ip_address,
       a.user_agent,
       a.created_at
     FROM audit_logs a
     LEFT JOIN users u ON a.actor_id = u.id
     ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset]
  );

  return {
    logs: rows.map(r => ({
      ...r,
      details: typeof r.details === 'string' ? safeJsonParse(r.details) : r.details
    })),
    pagination: {
      page: parseInt(page, 10),
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
