import { Router } from 'express';
import {
  logHours,
  getMyHours,
  getOrganizationHoursQueue,
  reviewHours,
  deleteHours
} from '../controllers/hours.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Volunteer routes
router.post('/', authenticate, requireRole(['volunteer', 'admin']), logHours);
router.get('/my', authenticate, requireRole(['volunteer', 'admin']), getMyHours);
router.delete('/:id', authenticate, requireRole(['volunteer', 'admin']), deleteHours);

// Organization review routes
router.get('/organization', authenticate, requireRole(['organization', 'admin']), getOrganizationHoursQueue);
router.patch('/:id/review', authenticate, requireRole(['organization', 'admin']), reviewHours);

export default router;
