import pool from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  getVolunteerAchievementsWithProgress,
  evaluateVolunteerAchievements
} from '../services/achievements.service.js';

/**
 * Get all available achievements with user-specific progress (if authenticated).
 * GET /api/v1/achievements
 */
export async function getAllAchievements(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const achievements = await getVolunteerAchievementsWithProgress(userId);

    return sendSuccess(
      res,
      achievements,
      'Achievements catalog and progress retrieved successfully.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get achievements earned by the authenticated volunteer.
 * GET /api/v1/achievements/my
 */
export async function getMyAchievements(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        a.id,
        a.code,
        a.title,
        a.description,
        a.badge_icon,
        a.criteria_type,
        a.criteria_threshold,
        ua.earned_at
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = ?
       ORDER BY ua.earned_at DESC`,
      [userId]
    );

    return sendSuccess(res, rows, 'User achievements retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * Manually trigger evaluation of achievements for current user (e.g. after sync or activity).
 * POST /api/v1/achievements/evaluate
 */
export async function evaluateMyAchievements(req, res, next) {
  try {
    const userId = req.user.id;
    const newlyEarned = await evaluateVolunteerAchievements(userId);

    return sendSuccess(
      res,
      {
        newly_earned: newlyEarned,
        count: newlyEarned.length
      },
      newlyEarned.length > 0
        ? `Congratulations! You unlocked ${newlyEarned.length} new achievement badge(s)!`
        : 'Achievements are up to date.'
    );
  } catch (err) {
    next(err);
  }
}
