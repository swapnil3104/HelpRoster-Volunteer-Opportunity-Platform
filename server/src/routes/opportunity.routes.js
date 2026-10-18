import { Router } from 'express';
import * as oppController from '../controllers/opportunity.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  updateOpportunityStatusSchema
} from '../schemas/opportunity.schema.js';

const router = Router();

// ----------------------------------------------------------------------------
// Management routes (Mounted before /:idOrSlug to avoid slug route conflict)
// ----------------------------------------------------------------------------

// List organization opportunities for workspace
router.get(
  '/manage',
  authenticate,
  requireRole('organization', 'admin'),
  oppController.listManageOpportunities
);

// Create new opportunity
router.post(
  '/',
  authenticate,
  requireRole('organization', 'admin'),
  validate(createOpportunitySchema),
  oppController.createOpportunity
);

// Update opportunity
router.put(
  '/:id',
  authenticate,
  requireRole('organization', 'admin'),
  validate(updateOpportunitySchema),
  oppController.updateOpportunity
);

// Update status
router.patch(
  '/:id/status',
  authenticate,
  requireRole('organization', 'admin'),
  validate(updateOpportunityStatusSchema),
  oppController.updateOpportunityStatus
);

// Delete or archive opportunity
router.delete(
  '/:id',
  authenticate,
  requireRole('organization', 'admin'),
  oppController.deleteOpportunity
);

// ----------------------------------------------------------------------------
// Public Discovery routes
// ----------------------------------------------------------------------------

// List public published opportunities (with search, filtering, pagination)
router.get('/', oppController.listPublicOpportunities);

// View public opportunity details
router.get('/:idOrSlug', optionalAuthenticate, oppController.getOpportunityDetails);

export default router;
