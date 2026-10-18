import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Baseline API rate limiter (protects entire API against denial-of-service)
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 10000 : 500, // Generous during tests, strict in dev/prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
  }
});

/**
 * Strict authentication rate limiter (defends against credential stuffing and brute force attacks)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 1000 : 30, // 30 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.'
    }
  }
});

/**
 * Strict password reset rate limiter (prevents password reset token flooding and enumeration)
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.NODE_ENV === 'test' ? 1000 : 10, // 10 reset requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RESET_RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts from this IP. Please try again in an hour.'
    }
  }
});

/**
 * Contact form rate limiter (prevents spam and inbox flooding)
 */
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 1000 : 15, // 15 submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'CONTACT_RATE_LIMIT_EXCEEDED',
      message: 'Too many contact messages submitted from this IP. Please wait before sending more.'
    }
  }
});
