import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = Router();

// Register new user (volunteer or organization)
router.post('/register', validate(registerSchema), authController.register);

// Login existing user
router.post('/login', validate(loginSchema), authController.login);

// Logout user and clear auth cookie
router.post('/logout', authController.logout);

// Retrieve current authenticated session
router.get('/me', authenticate, authController.getMe);

export default router;
