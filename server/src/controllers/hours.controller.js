import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { evaluateVolunteerAchievements } from '../services/achievements.service.js';

/**
 * Volunteer logs service hours for an opportunity.
 * POST /api/v1/hours
 */
export async function logHours(req, res, next) {
  try {
    const volunteerId = req.user.id;
    const { opportunity_id, activity_date, hours, description } = req.body;

    if (!opportunity_id || !activity_date || hours === undefined || hours === null) {
      return sendError(res, 'opportunity_id, activity_date, and hours are required.', 400, 'VALIDATION_ERROR');
    }

    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 24) {
      return sendError(res, 'Hours must be a number between 0.25 and 24.', 400, 'INVALID_HOURS');
    }

    // Verify activity date format and check it is not in the future
    const dateObj = new Date(activity_date);
    if (isNaN(dateObj.getTime())) {
      return sendError(res, 'Invalid activity_date format. Use YYYY-MM-DD.', 400, 'INVALID_DATE');
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateObj > today) {
      return sendError(res, 'Activity date cannot be in the future.', 400, 'FUTURE_DATE_NOT_ALLOWED');
    }

    // Verify opportunity exists
    const [oppRows] = await pool.query(
      `SELECT id, title, organization_id, status FROM opportunities WHERE id = ?`,
      [opportunity_id]
    );

    if (oppRows.length === 0) {
      return sendError(res, 'Opportunity not found.', 404, 'OPPORTUNITY_NOT_FOUND');
    }

    // Insert volunteer hours record
    const [result] = await pool.query(
      `INSERT INTO volunteer_hours (
        volunteer_id, opportunity_id, activity_date, hours, description, status
      ) VALUES (?, ?, ?, ?, ?, 'pending')`,
      [volunteerId, opportunity_id, activity_date, parsedHours, description || null]
    );

    const insertedId = result.insertId;

    const [createdRows] = await pool.query(
      `SELECT vh.*, o.title AS opportunity_title, org.name AS organization_name
       FROM volunteer_hours vh
       JOIN opportunities o ON vh.opportunity_id = o.id
       JOIN organizations org ON o.organization_id = org.id
       WHERE vh.id = ?`,
      [insertedId]
    );

    return sendSuccess(
      res,
      createdRows[0],
      'Volunteer hours logged successfully and submitted for organization review.',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Volunteer retrieves their logged hours and summary statistics.
 * GET /api/v1/hours/my
 */
export async function getMyHours(req, res, next) {
  try {
    const volunteerId = req.user.id;
    const { status } = req.query;

    // 1. Calculate aggregated summary
    const [summaryRows] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'approved' THEN hours ELSE 0 END), 0) AS total_approved_hours,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN hours ELSE 0 END), 0) AS total_pending_hours,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN hours ELSE 0 END), 0) AS total_rejected_hours,
        COUNT(*) AS total_submissions
       FROM volunteer_hours
       WHERE volunteer_id = ?`,
      [volunteerId]
    );

    const summary = {
      approved_hours: parseFloat(summaryRows[0]?.total_approved_hours || 0),
      pending_hours: parseFloat(summaryRows[0]?.total_pending_hours || 0),
      rejected_hours: parseFloat(summaryRows[0]?.total_rejected_hours || 0),
      total_submissions: Number(summaryRows[0]?.total_submissions || 0)
    };

    // 2. Fetch log entries
    let query = `
      SELECT 
        vh.id,
        vh.volunteer_id,
        vh.opportunity_id,
        vh.activity_date,
        vh.hours,
        vh.description,
        vh.status,
        vh.reviewed_by,
        vh.reviewed_at,
        vh.feedback,
        vh.created_at,
        o.title AS opportunity_title,
        o.slug AS opportunity_slug,
        org.name AS organization_name,
        c.name AS category_name,
        reviewer.first_name AS reviewer_first_name,
        reviewer.last_name AS reviewer_last_name
      FROM volunteer_hours vh
      JOIN opportunities o ON vh.opportunity_id = o.id
      JOIN organizations org ON o.organization_id = org.id
      LEFT JOIN categories c ON o.category_id = c.id
      LEFT JOIN users reviewer ON vh.reviewed_by = reviewer.id
      WHERE vh.volunteer_id = ?
    `;

    const params = [volunteerId];

    if (status && status !== 'all') {
      query += ` AND vh.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY vh.activity_date DESC, vh.created_at DESC`;

    const [rows] = await pool.query(query, params);

    return sendSuccess(
      res,
      {
        summary,
        hours: rows
      },
      'Volunteer hours retrieved successfully.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Organization retrieves hours submitted by volunteers for its opportunities.
 * GET /api/v1/hours/organization
 */
export async function getOrganizationHoursQueue(req, res, next) {
  try {
    const orgId = req.user.organization_id;
    const { status, opportunity_id } = req.query;

    if (!orgId && req.user.role !== 'admin') {
      return sendError(res, 'User is not associated with an organization.', 403, 'FORBIDDEN');
    }

    let query = `
      SELECT 
        vh.id,
        vh.volunteer_id,
        vh.opportunity_id,
        vh.activity_date,
        vh.hours,
        vh.description,
        vh.status,
        vh.reviewed_by,
        vh.reviewed_at,
        vh.feedback,
        vh.created_at,
        o.title AS opportunity_title,
        o.slug AS opportunity_slug,
        u.first_name AS volunteer_first_name,
        u.last_name AS volunteer_last_name,
        u.email AS volunteer_email,
        vp.avatar_url AS volunteer_avatar,
        reviewer.first_name AS reviewer_first_name,
        reviewer.last_name AS reviewer_last_name
      FROM volunteer_hours vh
      JOIN opportunities o ON vh.opportunity_id = o.id
      JOIN users u ON vh.volunteer_id = u.id
      LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
      LEFT JOIN users reviewer ON vh.reviewed_by = reviewer.id
      WHERE 1=1
    `;

    const params = [];

    if (req.user.role !== 'admin') {
      query += ` AND o.organization_id = ?`;
      params.push(orgId);
    }

    if (opportunity_id) {
      query += ` AND vh.opportunity_id = ?`;
      params.push(opportunity_id);
    }

    if (status && status !== 'all') {
      query += ` AND vh.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY vh.created_at DESC`;

    const [rows] = await pool.query(query, params);

    return sendSuccess(res, rows, 'Organization hours review queue retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * Organization coordinator reviews (approves or rejects) volunteer hours.
 * PATCH /api/v1/hours/:id/review
 */
export async function reviewHours(req, res, next) {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const reviewerId = req.user.id;
    const orgId = req.user.organization_id;

    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, "Status must be either 'approved' or 'rejected'.", 400, 'INVALID_STATUS');
    }

    // Verify record exists and organization owns the opportunity
    const [rows] = await pool.query(
      `SELECT vh.*, o.organization_id, o.title AS opportunity_title
       FROM volunteer_hours vh
       JOIN opportunities o ON vh.opportunity_id = o.id
       WHERE vh.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 'Volunteer hours record not found.', 404, 'NOT_FOUND');
    }

    const record = rows[0];

    // Authorization check
    if (req.user.role !== 'admin' && record.organization_id !== orgId) {
      return sendError(res, 'You are not authorized to review hours for this opportunity.', 403, 'FORBIDDEN');
    }

    // Update status
    await pool.query(
      `UPDATE volunteer_hours 
       SET status = ?, feedback = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, feedback || null, reviewerId, id]
    );

    let newlyEarnedAchievements = [];
    if (status === 'approved') {
      newlyEarnedAchievements = await evaluateVolunteerAchievements(record.volunteer_id);
    }

    const [updatedRows] = await pool.query(
      `SELECT vh.*, o.title AS opportunity_title
       FROM volunteer_hours vh
       JOIN opportunities o ON vh.opportunity_id = o.id
       WHERE vh.id = ?`,
      [id]
    );

    return sendSuccess(
      res,
      {
        hours: updatedRows[0],
        new_achievements: newlyEarnedAchievements
      },
      `Volunteer hours record has been ${status}.`
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Volunteer deletes or withdraws a pending hours submission.
 * DELETE /api/v1/hours/:id
 */
export async function deleteHours(req, res, next) {
  try {
    const { id } = req.params;
    const volunteerId = req.user.id;

    const [rows] = await pool.query(
      `SELECT * FROM volunteer_hours WHERE id = ? AND volunteer_id = ?`,
      [id, volunteerId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Volunteer hours record not found.', 404, 'NOT_FOUND');
    }

    const record = rows[0];
    if (record.status === 'approved') {
      return sendError(res, 'Approved volunteer hours cannot be deleted.', 400, 'CANNOT_DELETE_APPROVED');
    }

    await pool.query(`DELETE FROM volunteer_hours WHERE id = ?`, [id]);

    return sendSuccess(res, { id }, 'Volunteer hours entry removed successfully.');
  } catch (err) {
    next(err);
  }
}
