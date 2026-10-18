import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getOrganizations,
  verifyOrganization,
  getAdminOpportunities,
  moderateOpportunity,
  getContactSubmissions,
  updateContactSubmission,
  getAuditLogs
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin endpoints: user must be authenticated with role='admin'
router.use(authenticate, requireRole('admin'));

// Platform metrics & health overview
router.get('/stats', getAdminStats);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

// Organization verification & management
router.get('/organizations', getOrganizations);
router.patch('/organizations/:id/verify', verifyOrganization);

// Opportunity platform-wide moderation
router.get('/opportunities', getAdminOpportunities);
router.patch('/opportunities/:id/status', moderateOpportunity);

// Support & contact submissions queue
router.get('/contact-submissions', getContactSubmissions);
router.patch('/contact-submissions/:id', updateContactSubmission);

// Security & privileged actions audit trail
router.get('/audit-logs', getAuditLogs);

export default router;
