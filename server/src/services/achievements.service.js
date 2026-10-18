import pool from '../config/db.js';

/**
 * Service to evaluate and award volunteer achievements idempotently.
 */
export async function evaluateVolunteerAchievements(volunteerUserId) {
  if (!volunteerUserId) return [];

  try {
    // 1. Fetch all system achievements
    const [achievements] = await pool.query(
      `SELECT id, code, title, description, badge_icon, criteria_type, criteria_threshold 
       FROM achievements`
    );

    // 2. Fetch already earned achievements for user
    const [earnedRows] = await pool.query(
      `SELECT achievement_id FROM user_achievements WHERE user_id = ?`,
      [volunteerUserId]
    );
    const earnedIds = new Set(earnedRows.map((r) => r.achievement_id));

    // 3. Compute volunteer metrics
    // Total applications
    const [appCountRows] = await pool.query(
      `SELECT COUNT(*) AS total_apps FROM applications WHERE volunteer_id = ?`,
      [volunteerUserId]
    );
    const totalApps = Number(appCountRows[0]?.total_apps || 0);

    // Total accepted applications
    const [acceptedAppRows] = await pool.query(
      `SELECT COUNT(*) AS accepted_apps FROM applications WHERE volunteer_id = ? AND status = 'accepted'`,
      [volunteerUserId]
    );
    const acceptedApps = Number(acceptedAppRows[0]?.accepted_apps || 0);

    // Approved volunteer hours
    const [hoursRows] = await pool.query(
      `SELECT COALESCE(SUM(hours), 0) AS total_hours FROM volunteer_hours WHERE volunteer_id = ? AND status = 'approved'`,
      [volunteerUserId]
    );
    const approvedHours = parseFloat(hoursRows[0]?.total_hours || 0);

    // Categories explored (via accepted applications OR approved volunteer hours)
    const [catRows] = await pool.query(
      `SELECT COUNT(DISTINCT o.category_id) AS distinct_categories
       FROM opportunities o
       WHERE o.id IN (
         SELECT opportunity_id FROM applications WHERE volunteer_id = ? AND status = 'accepted'
         UNION
         SELECT opportunity_id FROM volunteer_hours WHERE volunteer_id = ? AND status = 'approved'
       ) AND o.category_id IS NOT NULL`,
      [volunteerUserId, volunteerUserId]
    );
    const distinctCategories = Number(catRows[0]?.distinct_categories || 0);

    const newlyEarned = [];

    for (const ach of achievements) {
      if (earnedIds.has(ach.id)) continue;

      let eligible = false;
      switch (ach.criteria_type) {
        case 'first_step':
          eligible = totalApps >= ach.criteria_threshold;
          break;
        case 'hours_milestone':
          eligible = approvedHours >= ach.criteria_threshold;
          break;
        case 'applications_accepted':
          eligible = acceptedApps >= ach.criteria_threshold;
          break;
        case 'categories_explored':
          eligible = distinctCategories >= ach.criteria_threshold;
          break;
        default:
          break;
      }

      if (eligible) {
        await pool.query(
          `INSERT IGNORE INTO user_achievements (user_id, achievement_id, earned_at) VALUES (?, ?, NOW())`,
          [volunteerUserId, ach.id]
        );
        newlyEarned.push(ach);
      }
    }

    return newlyEarned;
  } catch (error) {
    console.error('Failed to evaluate achievements:', error);
    return [];
  }
}

/**
 * Get all achievements with calculated progress for a given volunteer user.
 */
export async function getVolunteerAchievementsWithProgress(volunteerUserId) {
  const [achievements] = await pool.query(
    `SELECT a.id, a.code, a.title, a.description, a.badge_icon, a.criteria_type, a.criteria_threshold,
            ua.earned_at
     FROM achievements a
     LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
     ORDER BY a.id ASC`,
    [volunteerUserId || 0]
  );

  if (!volunteerUserId) {
    return achievements.map((ach) => ({
      ...ach,
      earned: false,
      current_value: 0,
      progress_percent: 0
    }));
  }

  // Volunteer metrics
  const [appCountRows] = await pool.query(
    `SELECT COUNT(*) AS total_apps FROM applications WHERE volunteer_id = ?`,
    [volunteerUserId]
  );
  const totalApps = Number(appCountRows[0]?.total_apps || 0);

  const [acceptedAppRows] = await pool.query(
    `SELECT COUNT(*) AS accepted_apps FROM applications WHERE volunteer_id = ? AND status = 'accepted'`,
    [volunteerUserId]
  );
  const acceptedApps = Number(acceptedAppRows[0]?.accepted_apps || 0);

  const [hoursRows] = await pool.query(
    `SELECT COALESCE(SUM(hours), 0) AS total_hours FROM volunteer_hours WHERE volunteer_id = ? AND status = 'approved'`,
    [volunteerUserId]
  );
  const approvedHours = parseFloat(hoursRows[0]?.total_hours || 0);

  const [catRows] = await pool.query(
    `SELECT COUNT(DISTINCT o.category_id) AS distinct_categories
     FROM opportunities o
     WHERE o.id IN (
       SELECT opportunity_id FROM applications WHERE volunteer_id = ? AND status = 'accepted'
       UNION
       SELECT opportunity_id FROM volunteer_hours WHERE volunteer_id = ? AND status = 'approved'
     ) AND o.category_id IS NOT NULL`,
    [volunteerUserId, volunteerUserId]
  );
  const distinctCategories = Number(catRows[0]?.distinct_categories || 0);

  return achievements.map((ach) => {
    let currentValue = 0;
    switch (ach.criteria_type) {
      case 'first_step':
        currentValue = totalApps;
        break;
      case 'hours_milestone':
        currentValue = approvedHours;
        break;
      case 'applications_accepted':
        currentValue = acceptedApps;
        break;
      case 'categories_explored':
        currentValue = distinctCategories;
        break;
      default:
        break;
    }

    const earned = !!ach.earned_at || currentValue >= ach.criteria_threshold;
    const progressPercent = Math.min(100, Math.round((currentValue / ach.criteria_threshold) * 100));

    return {
      id: ach.id,
      code: ach.code,
      title: ach.title,
      description: ach.description,
      badge_icon: ach.badge_icon,
      criteria_type: ach.criteria_type,
      criteria_threshold: ach.criteria_threshold,
      earned,
      earned_at: ach.earned_at || null,
      current_value: currentValue,
      progress_percent: progressPercent
    };
  });
}
