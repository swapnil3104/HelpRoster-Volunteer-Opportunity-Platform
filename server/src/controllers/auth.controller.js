import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { logAudit } from '../services/audit.service.js';

/**
 * Generate a JWT access token for a user
 * @param {object} user
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Set the authentication cookie on the response
 * @param {import('express').Response} res
 * @param {string} token
 */
export function setAuthCookie(res, token) {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('helproster_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

/**
 * Register a new user (Volunteer or Organization)
 */
export async function register(req, res, next) {
  const {
    role = 'volunteer',
    email,
    password,
    first_name,
    last_name,
    organization_name,
    organization_description,
    phone,
    bio,
    skills,
    interests,
    location,
    availability
  } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate email
  const [existingUsers] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (existingUsers.length > 0) {
    return sendError(
      res,
      'An account with this email address already exists.',
      409,
      'DUPLICATE_RESOURCE',
      [{ field: 'email', message: 'Email is already registered' }]
    );
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert user record
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [normalizedEmail, passwordHash, first_name.trim(), last_name.trim(), role, 'active']
    );

    const userId = userResult.insertId;
    let profile = null;

    if (role === 'volunteer') {
      const [profResult] = await connection.query(
        'INSERT INTO volunteer_profiles (user_id, phone, bio, skills, interests, location, availability, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          phone ? phone.trim() : null,
          bio ? bio.trim() : null,
          skills ? skills.trim() : null,
          interests ? interests.trim() : null,
          location ? location.trim() : null,
          availability ? availability.trim() : null,
          1
        ]
      );
      profile = {
        id: profResult.insertId,
        user_id: userId,
        phone: phone || null,
        bio: bio || null,
        skills: skills || null,
        interests: interests || null,
        location: location || null,
        availability: availability || null,
        is_public: true
      };
    } else if (role === 'organization') {
      const orgName = organization_name.trim();
      const orgDesc = (organization_description || `${orgName} community initiatives`).trim();

      const [orgResult] = await connection.query(
        'INSERT INTO organizations (user_id, name, description, email, phone, verification_status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userId,
          orgName,
          orgDesc,
          normalizedEmail,
          phone ? phone.trim() : null,
          'pending' // Organizations start pending verification
        ]
      );
      profile = {
        id: orgResult.insertId,
        user_id: userId,
        name: orgName,
        description: orgDesc,
        email: normalizedEmail,
        verification_status: 'pending'
      };
    }

    await connection.commit();

    const createdUser = {
      id: userId,
      email: normalizedEmail,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      role,
      status: 'active',
      profile
    };

    const token = generateToken(createdUser);
    setAuthCookie(res, token);

    // Asynchronously dispatch welcome email
    sendWelcomeEmail({
      email: normalizedEmail,
      name: `${first_name.trim()} ${last_name.trim()}`,
      role
    }).catch(err => console.error('[EmailTrigger] Failed to send welcome email:', err.message));

    return sendSuccess(
      res,
      { user: createdUser, token },
      'Registration successful. Welcome to HelpRoster!',
      201
    );
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}

/**
 * Log in an existing user
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [users] = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, role, status, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return sendError(
        res,
        'Invalid email or password credentials.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(
        res,
        'Invalid email or password credentials.',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    if (user.status === 'suspended') {
      return sendError(
        res,
        'Your account has been suspended. Please contact platform administrators.',
        403,
        'ACCOUNT_SUSPENDED'
      );
    }

    // Fetch related profile
    let profile = null;
    if (user.role === 'volunteer') {
      const [profiles] = await pool.query(
        'SELECT id, phone, bio, skills, interests, location, availability, avatar_url, is_public FROM volunteer_profiles WHERE user_id = ?',
        [user.id]
      );
      profile = profiles.length > 0 ? profiles[0] : null;
    } else if (user.role === 'organization') {
      const [orgs] = await pool.query(
        'SELECT id, name, description, mission, logo_url, website, email as org_email, phone, address, city, state, country, postal_code, verification_status FROM organizations WHERE user_id = ?',
        [user.id]
      );
      profile = orgs.length > 0 ? orgs[0] : null;
    }

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      profile
    };

    const token = generateToken(sanitizedUser);
    setAuthCookie(res, token);

    return sendSuccess(
      res,
      { user: sanitizedUser, token },
      'Successfully signed in.'
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * Log out user by clearing authentication cookie
 */
export async function logout(req, res) {
  const isProduction = env.NODE_ENV === 'production';
  res.clearCookie('helproster_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  });

  return sendSuccess(res, null, 'Successfully logged out.');
}

/**
 * Get current authenticated user profile
 */
export async function getMe(req, res) {
  return sendSuccess(
    res,
    { user: req.user },
    'User session retrieved successfully.'
  );
}

/**
 * Request password reset instructions
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return sendError(res, 'Email address is required.', 400, 'VALIDATION_ERROR');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, status FROM users WHERE email = ?',
      [normalizedEmail]
    );

    let resetToken = null;

    if (users.length > 0 && users[0].status !== 'suspended') {
      const user = users[0];
      resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'password_reset' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Record audit log
      await logAudit(req, {
        actorId: user.id,
        action: 'auth.forgot_password_request',
        targetType: 'user',
        targetId: user.id,
        details: { email: user.email }
      });

      // Send password reset email
      sendPasswordResetEmail({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        resetToken
      }).catch(err => console.error('[EmailTrigger] Failed to send password reset email:', err.message));
    }

    return sendSuccess(
      res,
      {
        emailSent: true,
        resetToken: env.NODE_ENV !== 'production' ? resetToken : undefined
      },
      'If that email address is registered, instructions to reset your password have been sent.'
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * Reset password using signed reset token
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token) {
      return sendError(res, 'Reset token is required.', 400, 'INVALID_TOKEN');
    }
    if (!password || password.length < 8) {
      return sendError(res, 'Password must be at least 8 characters long.', 400, 'VALIDATION_ERROR');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return sendError(res, 'Password reset token is invalid or has expired.', 400, 'TOKEN_EXPIRED');
    }

    if (decoded.type !== 'password_reset') {
      return sendError(res, 'Invalid token type.', 400, 'INVALID_TOKEN');
    }

    const [users] = await pool.query('SELECT id, email, status FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return sendError(res, 'User account no longer exists.', 404, 'USER_NOT_FOUND');
    }

    const user = users[0];
    if (user.status === 'suspended') {
      return sendError(res, 'Account is suspended.', 403, 'ACCOUNT_SUSPENDED');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);

    // Record audit log
    await logAudit(req, {
      actorId: user.id,
      action: 'auth.password_reset',
      targetType: 'user',
      targetId: user.id,
      details: { email: user.email }
    });

    return sendSuccess(res, null, 'Password has been successfully updated. You may now log in.');
  } catch (error) {
    return next(error);
  }
}
