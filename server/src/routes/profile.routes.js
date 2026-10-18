import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuthenticate, requireRole, requireOrgOwnership } from '../middleware/auth.js';
import { updateVolunteerProfileSchema, updateOrganizationProfileSchema } from '../schemas/profile.schema.js';

const router = Router();

// Current user profile (private)
router.get('/me', authenticate, profileController.getMyProfile);

// Update volunteer profile (restricted to volunteers / admin)
router.patch(
  '/volunteers/profile',
  authenticate,
  requireRole('volunteer', 'admin'),
  validate(updateVolunteerProfileSchema),
  profileController.updateVolunteerProfile
);

// Update organization profile (restricted to org owner or admin)
router.patch(
  '/organizations/:id',
  authenticate,
  requireOrgOwnership('id'),
  validate(updateOrganizationProfileSchema),
  profileController.updateOrganizationProfile
);

// Public volunteer profile view
router.get('/volunteers/:id', optionalAuthenticate, profileController.getPublicVolunteerProfile);

// Public organizations directory
router.get('/organizations', profileController.listOrganizations);

// Public organization profile view
router.get('/organizations/:id', profileController.getPublicOrganizationProfile);

export default router;
