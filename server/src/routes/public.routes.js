import { Router } from 'express';
import { getPlatformStats, getFeaturedOpportunities } from '../controllers/public.controller.js';

const router = Router();

router.get('/stats', getPlatformStats);
router.get('/featured-opportunities', getFeaturedOpportunities);

export default router;
