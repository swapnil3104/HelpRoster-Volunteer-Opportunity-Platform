import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getVolunteerAchievementsWithProgress } from '../services/achievements.service.js';

/**
 * Get aggregated dashboard data for an authenticated volunteer.
 * GET /api/v1/dashboard/volunteer
 */
export async function getVolunteerDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Volunteer profile & user info
    const [userRows] = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
              vp.phone, vp.bio, vp.skills, vp.interests, vp.location, vp.availability, vp.avatar_url
       FROM users u
       LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
       WHERE u.id = ?`,
      [userId]
    );

    const userProfile = userRows[0] || null;

    // 2. Application statistics
    const [appStatsRows] = await pool.query(
      `SELECT 
        COUNT(*) AS total_applications,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_applications,
        COALESCE(SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END), 0) AS accepted_applications,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_applications,
        COALESCE(SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END), 0) AS withdrawn_applications
       FROM applications
       WHERE volunteer_id = ?`,
      [userId]
    );

    const applicationStats = {
      total: Number(appStatsRows[0]?.total_applications || 0),
      pending: Number(appStatsRows[0]?.pending_applications || 0),
      accepted: Number(appStatsRows[0]?.accepted_applications || 0),
      rejected: Number(appStatsRows[0]?.rejected_applications || 0),
      withdrawn: Number(appStatsRows[0]?.withdrawn_applications || 0)
    };

    // 3. Volunteer hours statistics
    const [hourStatsRows] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'approved' THEN hours ELSE 0 END), 0) AS approved_hours,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN hours ELSE 0 END), 0) AS pending_hours,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN hours ELSE 0 END), 0) AS rejected_hours,
        COUNT(*) AS total_submissions
       FROM volunteer_hours
       WHERE volunteer_id = ?`,
      [userId]
    );

    const hoursStats = {
      approved_hours: parseFloat(hourStatsRows[0]?.approved_hours || 0),
      pending_hours: parseFloat(hourStatsRows[0]?.pending_hours || 0),
      rejected_hours: parseFloat(hourStatsRows[0]?.rejected_hours || 0),
      total_submissions: Number(hourStatsRows[0]?.total_submissions || 0)
    };

    // 4. Achievements with progress
    const achievementsWithProgress = await getVolunteerAchievementsWithProgress(userId);
    const earnedAchievements = achievementsWithProgress.filter((a) => a.earned);
    const upcomingAchievements = achievementsWithProgress
      .filter((a) => !a.earned)
      .sort((a, b) => b.progress_percent - a.progress_percent)
      .slice(0, 3);

    // 5. Recent applications (latest 5)
    const [recentApps] = await pool.query(
      `SELECT 
        a.id, a.status, a.created_at, a.review_notes,
        o.id AS opportunity_id, o.title AS opportunity_title, o.slug AS opportunity_slug,
        org.name AS organization_name,
        c.name AS category_name
       FROM applications a
       JOIN opportunities o ON a.opportunity_id = o.id
       JOIN organizations org ON o.organization_id = org.id
       LEFT JOIN categories c ON o.category_id = c.id
       WHERE a.volunteer_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // 6. Recent volunteer hours logs (latest 5)
    const [recentHours] = await pool.query(
      `SELECT 
        vh.id, vh.activity_date, vh.hours, vh.description, vh.status, vh.feedback, vh.created_at,
        o.title AS opportunity_title, o.slug AS opportunity_slug,
        org.name AS organization_name
       FROM volunteer_hours vh
       JOIN opportunities o ON vh.opportunity_id = o.id
       JOIN organizations org ON o.organization_id = org.id
       WHERE vh.volunteer_id = ?
       ORDER BY vh.activity_date DESC, vh.created_at DESC
       LIMIT 5`,
      [userId]
    );

    // 7. Recommended opportunities (featured published listings volunteer hasn't applied to yet)
    const [recommendedOpps] = await pool.query(
      `SELECT 
        o.id, o.title, o.slug, o.location_type, o.location, o.start_date, o.application_deadline,
        org.name AS organization_name, c.name AS category_name
       FROM opportunities o
       JOIN organizations org ON o.organization_id = org.id
       LEFT JOIN categories c ON o.category_id = c.id
       WHERE o.status = 'published' AND org.verification_status = 'verified'
         AND o.id NOT IN (SELECT opportunity_id FROM applications WHERE volunteer_id = ?)
       ORDER BY o.created_at DESC
       LIMIT 3`,
      [userId]
    );

    const payload = {
      profile: userProfile,
      application_stats: applicationStats,
      hours_stats: hoursStats,
      achievements: {
        earned_count: earnedAchievements.length,
        total_count: achievementsWithProgress.length,
        earned: earnedAchievements,
        upcoming: upcomingAchievements,
        all: achievementsWithProgress
      },
      recent_applications: recentApps,
      recent_hours: recentHours,
      recommended_opportunities: recommendedOpps
    };

    return sendSuccess(res, payload, 'Volunteer dashboard data retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * Get aggregated dashboard data for an authenticated organization.
 * GET /api/v1/dashboard/organization
 */
export async function getOrganizationDashboard(req, res, next) {
  try {
    const orgId = req.user.organization_id;

    if (!orgId && req.user.role !== 'admin') {
      return sendError(res, 'User is not linked to an organization profile.', 403, 'FORBIDDEN');
    }

    // 1. Organization profile
    const [orgRows] = await pool.query(
      `SELECT * FROM organizations WHERE id = ?`,
      [orgId || 1]
    );

    const organization = orgRows[0] || null;

    // 2. Opportunities stats
    const [oppStatsRows] = await pool.query(
      `SELECT 
        COUNT(*) AS total_opportunities,
        COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS published_count,
        COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) AS draft_count,
        COALESCE(SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END), 0) AS closed_count,
        COALESCE(SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END), 0) AS archived_count
       FROM opportunities
       WHERE organization_id = ?`,
      [orgId]
    );

    const opportunityStats = {
      total: Number(oppStatsRows[0]?.total_opportunities || 0),
      published: Number(oppStatsRows[0]?.published_count || 0),
      draft: Number(oppStatsRows[0]?.draft_count || 0),
      closed: Number(oppStatsRows[0]?.closed_count || 0),
      archived: Number(oppStatsRows[0]?.archived_count || 0)
    };

    // 3. Applications stats for organization's opportunities
    const [appStatsRows] = await pool.query(
      `SELECT 
        COUNT(a.id) AS total_applicants,
        COALESCE(SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_applicants,
        COALESCE(SUM(CASE WHEN a.status = 'accepted' THEN 1 ELSE 0 END), 0) AS accepted_applicants,
        COALESCE(SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_applicants
       FROM applications a
       JOIN opportunities o ON a.opportunity_id = o.id
       WHERE o.organization_id = ?`,
      [orgId]
    );

    const applicationStats = {
      total: Number(appStatsRows[0]?.total_applicants || 0),
      pending: Number(appStatsRows[0]?.pending_applicants || 0),
      accepted: Number(appStatsRows[0]?.accepted_applicants || 0),
      rejected: Number(appStatsRows[0]?.rejected_applicants || 0)
    };

    // 4. Volunteer hours stats
    const [hoursStatsRows] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN vh.status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_reviews_count,
        COALESCE(SUM(CASE WHEN vh.status = 'approved' THEN vh.hours ELSE 0 END), 0) AS total_approved_hours
       FROM volunteer_hours vh
       JOIN opportunities o ON vh.opportunity_id = o.id
       WHERE o.organization_id = ?`,
      [orgId]
    );

    const hoursStats = {
      pending_reviews_count: Number(hoursStatsRows[0]?.pending_reviews_count || 0),
      total_approved_hours: parseFloat(hoursStatsRows[0]?.total_approved_hours || 0)
    };

    // 5. Pending applicants needing review (latest 5)
    const [pendingApplicants] = await pool.query(
      `SELECT 
        a.id, a.opportunity_id, a.volunteer_id, a.status, a.message, a.created_at,
        o.title AS opportunity_title,
        u.first_name, u.last_name, u.email,
        vp.avatar_url, vp.location, vp.skills
       FROM applications a
       JOIN opportunities o ON a.opportunity_id = o.id
       JOIN users u ON a.volunteer_id = u.id
       LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
       WHERE o.organization_id = ? AND a.status = 'pending'
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [orgId]
    );

    // 6. Pending volunteer hours submissions needing review (latest 5)
    const [pendingHours] = await pool.query(
      `SELECT 
        vh.id, vh.volunteer_id, vh.opportunity_id, vh.activity_date, vh.hours, vh.description, vh.created_at,
        o.title AS opportunity_title,
        u.first_name, u.last_name, u.email,
        vp.avatar_url
       FROM volunteer_hours vh
       JOIN opportunities o ON vh.opportunity_id = o.id
       JOIN users u ON vh.volunteer_id = u.id
       LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
       WHERE o.organization_id = ? AND vh.status = 'pending'
       ORDER BY vh.created_at DESC
       LIMIT 5`,
      [orgId]
    );

    // 7. Recent listings (latest 5)
    const [recentListings] = await pool.query(
      `SELECT 
        o.id, o.title, o.slug, o.status, o.created_at, o.capacity,
        c.name AS category_name,
        (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) AS applicants_count
       FROM opportunities o
       LEFT JOIN categories c ON o.category_id = c.id
       WHERE o.organization_id = ?
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [orgId]
    );

    const payload = {
      organization,
      opportunity_stats: opportunityStats,
      application_stats: applicationStats,
      hours_stats: hoursStats,
      pending_applicants: pendingApplicants,
      pending_hours: pendingHours,
      recent_listings: recentListings
    };

    return sendSuccess(res, payload, 'Organization dashboard data retrieved successfully.');
  } catch (err) {
    next(err);
  }
}
