import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  submitApplicationSchema,
  reviewApplicationSchema
} from '../schemas/application.schema.js';
import {
  submitApplication,
  getMyApplications,
  checkApplicationStatus,
  withdrawApplication,
  getOrganizationApplicantsQueue,
  getOpportunityApplicants,
  reviewApplication
} from '../controllers/application.controller.js';

const router = Router();

// ==========================================
// Volunteer Specific Endpoints
// ==========================================

// Submit a new application
router.post(
  '/',
  authenticate,
  requireRole('volunteer'),
  validate(submitApplicationSchema),
  submitApplication
);

// Get authenticated volunteer's applications
router.get(
  '/my',
  authenticate,
  requireRole('volunteer'),
  getMyApplications
);

// Check if volunteer has applied to an opportunity
router.get(
  '/check/:opportunityId',
  authenticate,
  requireRole('volunteer'),
  checkApplicationStatus
);

// Withdraw a pending application
router.patch(
  '/:id/withdraw',
  authenticate,
  requireRole('volunteer'),
  withdrawApplication
);

// ==========================================
// Organization & Admin Specific Endpoints
// ==========================================

// Get applicant queue across organization's listings
router.get(
  '/organization/queue',
  authenticate,
  requireRole('organization', 'admin'),
  getOrganizationApplicantsQueue
);

// Get applicants for a specific opportunity
router.get(
  '/opportunity/:opportunityId',
  authenticate,
  requireRole('organization', 'admin'),
  getOpportunityApplicants
);

// Review application (Accept or Reject)
router.patch(
  '/:id/review',
  authenticate,
  requireRole('organization', 'admin'),
  validate(reviewApplicationSchema),
  reviewApplication
);

export default router;
