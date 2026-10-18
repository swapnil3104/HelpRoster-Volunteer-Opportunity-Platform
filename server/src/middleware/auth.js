import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Extract JWT from cookies or Authorization header
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function extractToken(req) {
  if (req.cookies && req.cookies.helproster_token) {
    return req.cookies.helproster_token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * Fetch user and their associated profile details from DB
 * @param {number} userId
 */
async function fetchUserWithProfile(userId) {
  const [users] = await pool.query(
    'SELECT id, email, first_name, last_name, role, status, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (!users || users.length === 0) {
    return null;
  }

  const user = users[0];

  if (user.role === 'volunteer') {
    const [profiles] = await pool.query(
      'SELECT id, phone, bio, skills, interests, location, availability, avatar_url, is_public FROM volunteer_profiles WHERE user_id = ?',
      [user.id]
    );
    user.volunteer_profile_id = profiles.length > 0 ? profiles[0].id : null;
    user.profile = profiles.length > 0 ? profiles[0] : null;
  } else if (user.role === 'organization') {
    const [orgs] = await pool.query(
      'SELECT id, name, description, mission, logo_url, website, email as org_email, phone, address, city, state, country, postal_code, verification_status FROM organizations WHERE user_id = ?',
      [user.id]
    );
    user.organization_id = orgs.length > 0 ? orgs[0].id : null;
    user.organization = orgs.length > 0 ? orgs[0] : null;
  }

  return user;
}

/**
 * Middleware: Strictly requires a valid authenticated user session
 */
export async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return sendError(
        res,
        'Authentication required. Please log in to proceed.',
        401,
        'UNAUTHORIZED'
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Session expired. Please log in again.', 401, 'TOKEN_EXPIRED');
      }
      return sendError(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
    }

    const user = await fetchUserWithProfile(decoded.id);

    if (!user) {
      return sendError(res, 'User account no longer exists.', 401, 'USER_NOT_FOUND');
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Account has been suspended. Please contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware: Optionally populates req.user if a valid token is present
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await fetchUserWithProfile(decoded.id);
      req.user = user && user.status === 'active' ? user : null;
    } catch {
      req.user = null;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware: Restrict access to specific roles
 * @param {...string} allowedRoles
 */
export function requireRole(...allowedRoles) {
  const flatRoles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        'Authentication required.',
        401,
        'UNAUTHORIZED'
      );
    }

    if (!flatRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Required role: ${flatRoles.join(' or ')}.`,
        403,
        'FORBIDDEN'
      );
    }

    return next();
  };
}

/**
 * Middleware: Restrict organization resource mutation to resource owner or admin
 * @param {string} [idParam='id'] URL parameter name representing organization id
 */
export function requireOrgOwnership(idParam = 'id') {
  return async (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
    }

    // Platform admin always has oversight permission
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'organization') {
      return sendError(res, 'Organization credentials required.', 403, 'FORBIDDEN');
    }

    const targetOrgId = parseInt(req.params[idParam], 10);
    if (!targetOrgId || req.user.organization_id !== targetOrgId) {
      return sendError(
        res,
        'You do not have permission to manage this organization.',
        403,
        'FORBIDDEN'
      );
    }

    return next();
  };
}
