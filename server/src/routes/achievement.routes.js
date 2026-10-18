import { Router } from 'express';
import {
  getAllAchievements,
  getMyAchievements,
  evaluateMyAchievements
} from '../controllers/achievements.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public / optional authenticated list
router.get('/', optionalAuthenticate, getAllAchievements);

// Authenticated volunteer endpoints
router.get('/my', authenticate, requireRole(['volunteer', 'admin']), getMyAchievements);
router.post('/evaluate', authenticate, requireRole(['volunteer', 'admin']), evaluateMyAchievements);

export default router;
