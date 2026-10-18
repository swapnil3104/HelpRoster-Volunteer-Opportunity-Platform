import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import contactRoutes from './contact.routes.js';
import publicRoutes from './public.routes.js';
import categoryRoutes from './category.routes.js';
import opportunityRoutes from './opportunity.routes.js';
import applicationRoutes from './application.routes.js';
import hoursRoutes from './hours.routes.js';
import achievementRoutes from './achievement.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Mount Health Check endpoint: GET /api/v1/health
router.use('/health', healthRoutes);

// Mount Auth endpoints: /api/v1/auth/*
router.use('/auth', authRoutes);

// Mount Admin endpoints: /api/v1/admin/*
router.use('/admin', adminRoutes);

// Mount Contact endpoint: /api/v1/contact
router.use('/contact', contactRoutes);

// Mount Public endpoints: /api/v1/public/* (stats, featured opportunities)
router.use('/public', publicRoutes);

// Mount Categories endpoint: /api/v1/categories
router.use('/categories', categoryRoutes);

// Mount Opportunities endpoints: /api/v1/opportunities/*
router.use('/opportunities', opportunityRoutes);

// Mount Applications endpoints: /api/v1/applications/*
router.use('/applications', applicationRoutes);

// Mount Volunteer Hours endpoints: /api/v1/hours/*
router.use('/hours', hoursRoutes);

// Mount Achievements endpoints: /api/v1/achievements/*
router.use('/achievements', achievementRoutes);

// Mount Dashboards endpoints: /api/v1/dashboard/*
router.use('/dashboard', dashboardRoutes);

// Mount Profile and Organization endpoints: /api/v1/*
router.use('/', profileRoutes);

export default router;
