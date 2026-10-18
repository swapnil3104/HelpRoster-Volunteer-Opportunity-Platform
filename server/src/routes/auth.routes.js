import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// Register new user (volunteer or organization) with brute-force defense
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// Login existing user with credential stuffing defense
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Logout user and clear auth cookie
router.post('/logout', authController.logout);

// Retrieve current authenticated session
router.get('/me', authenticate, authController.getMe);

// Forgot password - request password reset token with rate limit protection
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);

// Reset password using reset token with rate limit protection
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

export default router;
