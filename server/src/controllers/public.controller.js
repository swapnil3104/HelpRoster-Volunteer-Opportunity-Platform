import pool from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Get aggregate platform statistics based strictly on real database records.
 * Complies with DEC-009 / REQ-DSH-04 (No fabricated statistics).
 */
export async function getPlatformStats(req, res, next) {
  try {
    const [oppRows] = await pool.query(
      `SELECT COUNT(*) AS total_opportunities FROM opportunities WHERE status = 'published'`
    );

    const [orgRows] = await pool.query(
      `SELECT COUNT(*) AS total_organizations FROM organizations WHERE verification_status = 'verified'`
    );

    const [volRows] = await pool.query(
      `SELECT COUNT(*) AS total_volunteers FROM users WHERE role = 'volunteer' AND status = 'active'`
    );

    const [hourRows] = await pool.query(
      `SELECT COALESCE(SUM(hours), 0) AS total_hours FROM volunteer_hours WHERE status = 'approved'`
    );

    const stats = {
      total_opportunities: Number(oppRows[0]?.total_opportunities || 0),
      total_organizations: Number(orgRows[0]?.total_organizations || 0),
      total_volunteers: Number(volRows[0]?.total_volunteers || 0),
      verified_hours: Number(hourRows[0]?.total_hours || 0)
    };

    return sendSuccess(res, stats, 'Public platform statistics retrieved successfully.', 200);
  } catch (err) {
    next(err);
  }
}

/**
 * Get featured/recent published opportunities for the landing page.
 */
export async function getFeaturedOpportunities(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        o.id,
        o.title,
        o.slug,
        o.description,
        o.location_type,
        o.location,
        o.start_date,
        o.end_date,
        o.application_deadline,
        o.commitment_hours,
        o.capacity,
        o.status,
        o.created_at,
        org.name AS organization_name,
        org.verification_status AS organization_status,
        c.name AS category_name,
        c.icon AS category_icon
       FROM opportunities o
       INNER JOIN organizations org ON o.organization_id = org.id
       LEFT JOIN categories c ON o.category_id = c.id
       WHERE o.status = 'published' AND org.verification_status = 'verified'
       ORDER BY o.created_at DESC
       LIMIT 6`
    );

    return sendSuccess(res, rows, 'Featured opportunities retrieved successfully.', 200);
  } catch (err) {
    next(err);
  }
}
