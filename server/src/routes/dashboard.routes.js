import { Router } from 'express';
import {
  getVolunteerDashboard,
  getOrganizationDashboard
} from '../controllers/dashboard.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Volunteer Dashboard: GET /api/v1/dashboard/volunteer
router.get(
  '/volunteer',
  authenticate,
  requireRole(['volunteer', 'admin']),
  getVolunteerDashboard
);

// Organization Dashboard: GET /api/v1/dashboard/organization
router.get(
  '/organization',
  authenticate,
  requireRole(['organization', 'admin']),
  getOrganizationDashboard
);

export default router;
