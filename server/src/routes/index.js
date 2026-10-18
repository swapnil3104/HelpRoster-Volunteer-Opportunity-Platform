import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';

const router = Router();

// Mount Health Check endpoint: GET /api/v1/health
router.use('/health', healthRoutes);

// Mount Auth endpoints: /api/v1/auth/*
router.use('/auth', authRoutes);

// Mount Profile and Organization endpoints: /api/v1/*
router.use('/', profileRoutes);

export default router;
