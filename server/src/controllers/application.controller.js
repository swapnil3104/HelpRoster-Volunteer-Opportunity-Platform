import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { evaluateVolunteerAchievements } from '../services/achievements.service.js';
import { sendApplicationStatusEmail } from '../services/email.service.js';

/**
 * Submit an application for an opportunity (Volunteer only)
 * POST /api/v1/applications
 */
export async function submitApplication(req, res, next) {
  try {
    const { opportunity_id, message } = req.body;
    const volunteerId = req.user.id;

    if (req.user.role !== 'volunteer') {
      return sendError(res, 'Only volunteer accounts can apply for opportunities.', 403, 'ROLE_NOT_ELIGIBLE');
    }

    // 1. Verify opportunity existence, status, and deadline
    const [oppRows] = await pool.query(
      `SELECT id, organization_id, title, status, application_deadline, capacity 
       FROM opportunities 
       WHERE id = ?`,
      [opportunity_id]
    );

    if (oppRows.length === 0) {
      return sendError(res, 'Opportunity not found.', 404, 'OPPORTUNITY_NOT_FOUND');
    }

    const opportunity = oppRows[0];

    if (opportunity.status !== 'published') {
      return sendError(
        res,
        'This opportunity is not currently accepting applications.',
        400,
        'OPPORTUNITY_NOT_ACCEPTING'
      );
    }

    const deadline = new Date(opportunity.application_deadline);
    if (deadline.getTime() < Date.now()) {
      return sendError(
        res,
        'The application deadline for this opportunity has expired.',
        400,
        'DEADLINE_EXPIRED'
      );
    }

    // 2. Check for duplicate application
    const [existingApps] = await pool.query(
      `SELECT id, status FROM applications WHERE opportunity_id = ? AND volunteer_id = ?`,
      [opportunity_id, volunteerId]
    );

    let applicationId;
    const sanitizedMessage = message ? message.trim() : null;

    if (existingApps.length > 0) {
      const existing = existingApps[0];
      if (existing.status !== 'withdrawn') {
        return sendError(
          res,
          'You have already submitted an active application for this opportunity.',
          409,
          'APPLICATION_ALREADY_EXISTS'
        );
      }

      // If previous application was withdrawn, allow re-submitting by reactivating to pending
      await pool.query(
        `UPDATE applications 
         SET status = 'pending', 
             message = ?, 
             review_notes = NULL, 
             reviewed_by = NULL, 
             reviewed_at = NULL, 
             updated_at = NOW() 
         WHERE id = ?`,
        [sanitizedMessage, existing.id]
      );
      applicationId = existing.id;
    } else {
      // 3. Insert fresh application record
      const [insertResult] = await pool.query(
        `INSERT INTO applications (opportunity_id, volunteer_id, status, message) 
         VALUES (?, ?, 'pending', ?)`,
        [opportunity_id, volunteerId, sanitizedMessage]
      );
      applicationId = insertResult.insertId;
    }

    // Fetch complete application record with joined opportunity & org data
    const [appDetails] = await pool.query(
      `SELECT a.id, a.opportunity_id, a.volunteer_id, a.status, a.message, a.created_at, a.updated_at,
              o.title AS opportunity_title, o.slug AS opportunity_slug, o.location, o.location_type, o.start_date,
              org.name AS organization_name, org.logo_url AS organization_logo_url
       FROM applications a
       JOIN opportunities o ON a.opportunity_id = o.id
       JOIN organizations org ON o.organization_id = org.id
       WHERE a.id = ?`,
      [applicationId]
    );

    // Trigger achievement check (e.g. FIRST_STEP milestone)
    await evaluateVolunteerAchievements(volunteerId).catch((err) =>
      console.error('Failed to evaluate achievements on app submission:', err)
    );

    return sendSuccess(res, appDetails[0], 'Application submitted successfully!', 201);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return sendError(
        res,
        'You have already submitted an application for this opportunity.',
        409,
        'APPLICATION_ALREADY_EXISTS'
      );
    }
    return next(error);
  }
}

/**
 * Get all applications submitted by the logged-in volunteer
 * GET /api/v1/applications/my
 */
export async function getMyApplications(req, res, next) {
  try {
    const volunteerId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT a.id, a.opportunity_id, a.volunteer_id, a.status, a.message, a.review_notes, 
             a.reviewed_at, a.created_at, a.updated_at,
             o.title AS opportunity_title, o.slug AS opportunity_slug, o.location_type, 
             o.location, o.start_date, o.end_date, o.application_deadline, o.commitment_hours, 
             o.status AS opportunity_status,
             org.id AS organization_id, org.name AS organization_name, 
             org.logo_url AS organization_logo_url, org.city AS organization_city, 
             org.state AS organization_state
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      JOIN organizations org ON o.organization_id = org.id
      WHERE a.volunteer_id = ?
    `;

    const params = [volunteerId];

    if (status && ['pending', 'accepted', 'rejected', 'withdrawn'].includes(status.toLowerCase())) {
      query += ` AND a.status = ?`;
      params.push(status.toLowerCase());
    }

    query += ` ORDER BY a.created_at DESC`;

    const [rows] = await pool.query(query, params);

    // Calculate status summary counts
    const [counts] = await pool.query(
      `SELECT status, COUNT(*) AS count 
       FROM applications 
       WHERE volunteer_id = ? 
       GROUP BY status`,
      [volunteerId]
    );

    const summary = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    };

    counts.forEach((c) => {
      const s = c.status;
      const count = Number(c.count || 0);
      if (summary[s] !== undefined) {
        summary[s] = count;
      }
      summary.total += count;
    });

    return sendSuccess(res, { applications: rows, summary }, 'Applications retrieved successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Check if the authenticated volunteer has applied to a given opportunity
 * GET /api/v1/applications/check/:opportunityId
 */
export async function checkApplicationStatus(req, res, next) {
  try {
    const volunteerId = req.user.id;
    const opportunityId = parseInt(req.params.opportunityId, 10);

    if (!opportunityId) {
      return sendError(res, 'Invalid opportunity ID.', 400, 'INVALID_ID');
    }

    const [rows] = await pool.query(
      `SELECT id, status, message, created_at, reviewed_at, review_notes 
       FROM applications 
       WHERE opportunity_id = ? AND volunteer_id = ?`,
      [opportunityId, volunteerId]
    );

    if (rows.length === 0) {
      return sendSuccess(res, { applied: false, application: null });
    }

    return sendSuccess(res, { applied: true, application: rows[0] });
  } catch (error) {
    return next(error);
  }
}

/**
 * Withdraw a pending application (Volunteer only)
 * PATCH /api/v1/applications/:id/withdraw
 */
export async function withdrawApplication(req, res, next) {
  try {
    const volunteerId = req.user.id;
    const applicationId = parseInt(req.params.id, 10);

    if (!applicationId) {
      return sendError(res, 'Invalid application ID.', 400, 'INVALID_ID');
    }

    const [rows] = await pool.query(
      `SELECT id, volunteer_id, status FROM applications WHERE id = ?`,
      [applicationId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Application not found.', 404, 'APPLICATION_NOT_FOUND');
    }

    const application = rows[0];

    if (application.volunteer_id !== volunteerId) {
      return sendError(res, 'You can only withdraw your own applications.', 403, 'FORBIDDEN');
    }

    if (application.status !== 'pending') {
      return sendError(
        res,
        `Cannot withdraw an application that is already ${application.status}.`,
        400,
        'CANNOT_WITHDRAW'
      );
    }

    await pool.query(
      `UPDATE applications SET status = 'withdrawn', updated_at = NOW() WHERE id = ?`,
      [applicationId]
    );

    return sendSuccess(res, { id: applicationId, status: 'withdrawn' }, 'Application withdrawn successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Organization: Get application queue across all organization listings
 * GET /api/v1/applications/organization/queue
 */
export async function getOrganizationApplicantsQueue(req, res, next) {
  try {
    const { opportunity_id, status, search } = req.query;
    let organizationId = req.user.organization_id;

    // Admin can view any organization queue, but must specify or defaults to all
    let query = `
      SELECT a.id, a.opportunity_id, a.volunteer_id, a.status, a.message, a.review_notes, 
             a.reviewed_at, a.reviewed_by, a.created_at, a.updated_at,
             o.title AS opportunity_title, o.slug AS opportunity_slug, o.status AS opportunity_status, 
             o.application_deadline, o.organization_id,
             u.first_name, u.last_name, u.email,
             vp.phone, vp.location AS volunteer_location, vp.skills AS volunteer_skills, 
             vp.bio AS volunteer_bio, vp.availability AS volunteer_availability, 
             vp.avatar_url AS volunteer_avatar_url
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      JOIN users u ON a.volunteer_id = u.id
      LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
      WHERE 1=1
    `;

    const params = [];

    if (req.user.role !== 'admin') {
      if (!organizationId) {
        return sendError(res, 'Organization profile not found.', 404, 'ORGANIZATION_NOT_FOUND');
      }
      query += ` AND o.organization_id = ?`;
      params.push(organizationId);
    } else if (req.query.organization_id) {
      query += ` AND o.organization_id = ?`;
      params.push(parseInt(req.query.organization_id, 10));
    }

    if (opportunity_id) {
      query += ` AND a.opportunity_id = ?`;
      params.push(parseInt(opportunity_id, 10));
    }

    if (status && ['pending', 'accepted', 'rejected', 'withdrawn'].includes(status.toLowerCase())) {
      query += ` AND a.status = ?`;
      params.push(status.toLowerCase());
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR o.title LIKE ?)`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [rows] = await pool.query(query, params);

    // Summary counts query
    let summaryQuery = `
      SELECT a.status, COUNT(*) AS count
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE 1=1
    `;
    const summaryParams = [];

    if (req.user.role !== 'admin') {
      summaryQuery += ` AND o.organization_id = ?`;
      summaryParams.push(organizationId);
    } else if (req.query.organization_id) {
      summaryQuery += ` AND o.organization_id = ?`;
      summaryParams.push(parseInt(req.query.organization_id, 10));
    }

    if (opportunity_id) {
      summaryQuery += ` AND a.opportunity_id = ?`;
      summaryParams.push(parseInt(opportunity_id, 10));
    }

    summaryQuery += ` GROUP BY a.status`;

    const [countRows] = await pool.query(summaryQuery, summaryParams);

    const summary = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    };

    countRows.forEach((c) => {
      const s = c.status;
      const count = Number(c.count || 0);
      if (summary[s] !== undefined) {
        summary[s] = count;
      }
      summary.total += count;
    });

    return sendSuccess(res, { applications: rows, summary }, 'Applicant queue retrieved successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Organization: Get applicants for a specific opportunity
 * GET /api/v1/applications/opportunity/:opportunityId
 */
export async function getOpportunityApplicants(req, res, next) {
  try {
    const opportunityId = parseInt(req.params.opportunityId, 10);

    if (!opportunityId) {
      return sendError(res, 'Invalid opportunity ID.', 400, 'INVALID_ID');
    }

    // Verify opportunity ownership
    const [oppRows] = await pool.query(
      `SELECT id, organization_id, title, status FROM opportunities WHERE id = ?`,
      [opportunityId]
    );

    if (oppRows.length === 0) {
      return sendError(res, 'Opportunity not found.', 404, 'OPPORTUNITY_NOT_FOUND');
    }

    const opportunity = oppRows[0];

    if (req.user.role !== 'admin' && req.user.organization_id !== opportunity.organization_id) {
      return sendError(res, 'You do not have permission to view applicants for this listing.', 403, 'FORBIDDEN');
    }

    const [rows] = await pool.query(
      `SELECT a.id, a.opportunity_id, a.volunteer_id, a.status, a.message, a.review_notes, 
              a.reviewed_at, a.reviewed_by, a.created_at, a.updated_at,
              u.first_name, u.last_name, u.email,
              vp.phone, vp.location AS volunteer_location, vp.skills AS volunteer_skills, 
              vp.bio AS volunteer_bio, vp.availability AS volunteer_availability, 
              vp.avatar_url AS volunteer_avatar_url
       FROM applications a
       JOIN users u ON a.volunteer_id = u.id
       LEFT JOIN volunteer_profiles vp ON u.id = vp.user_id
       WHERE a.opportunity_id = ?
       ORDER BY a.created_at DESC`,
      [opportunityId]
    );

    return sendSuccess(res, { opportunity, applicants: rows }, 'Applicants retrieved successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Organization / Admin: Review application (Accept or Reject)
 * PATCH /api/v1/applications/:id/review
 */
export async function reviewApplication(req, res, next) {
  try {
    const applicationId = parseInt(req.params.id, 10);
    const { status, review_notes } = req.body;
    const reviewerId = req.user.id;

    if (!applicationId) {
      return sendError(res, 'Invalid application ID.', 400, 'INVALID_ID');
    }

    // 1. Fetch application with opportunity owner
    const [rows] = await pool.query(
      `SELECT a.id, a.opportunity_id, a.volunteer_id, a.status, a.message, 
              o.organization_id, o.title AS opportunity_title
       FROM applications a
       JOIN opportunities o ON a.opportunity_id = o.id
       WHERE a.id = ?`,
      [applicationId]
    );

    if (rows.length === 0) {
      return sendError(res, 'Application not found.', 404, 'APPLICATION_NOT_FOUND');
    }

    const app = rows[0];

    // 2. Enforce organization ownership
    if (req.user.role !== 'admin' && req.user.organization_id !== app.organization_id) {
      return sendError(
        res,
        'You do not have permission to review applications for this listing.',
        403,
        'FORBIDDEN'
      );
    }

    // 3. Prevent reviewing withdrawn applications
    if (app.status === 'withdrawn') {
      return sendError(
        res,
        'Cannot review an application that has been withdrawn by the volunteer.',
        400,
        'CANNOT_REVIEW_WITHDRAWN'
      );
    }

    // 4. Update status and decision notes
    const sanitizedNotes = review_notes ? review_notes.trim() : null;

    await pool.query(
      `UPDATE applications 
       SET status = ?, 
           review_notes = ?, 
           reviewed_by = ?, 
           reviewed_at = NOW(), 
           updated_at = NOW() 
       WHERE id = ?`,
      [status, sanitizedNotes, reviewerId, applicationId]
    );

    // Fetch updated record
    const [updatedRows] = await pool.query(
      `SELECT a.id, a.opportunity_id, a.volunteer_id, a.status, a.message, a.review_notes, 
              a.reviewed_at, a.reviewed_by, a.created_at, a.updated_at,
              u.first_name, u.last_name, u.email
       FROM applications a
       JOIN users u ON a.volunteer_id = u.id
       WHERE a.id = ?`,
      [applicationId]
    );

    // Trigger achievement check if application is accepted (e.g. ACTIVE_CONTRIBUTOR, CAUSE_EXPLORER)
    if (status === 'accepted') {
      await evaluateVolunteerAchievements(app.volunteer_id).catch((err) =>
        console.error('Failed to evaluate achievements on app accept:', err)
      );
    }

    // Trigger transactional notification email to volunteer
    sendApplicationStatusEmail({
      email: updatedRows[0].email,
      volunteerName: `${updatedRows[0].first_name} ${updatedRows[0].last_name}`,
      opportunityTitle: app.opportunity_title,
      organizationName: req.user.organization_name || 'Host Organization',
      status,
      notes: sanitizedNotes
    }).catch((err) => console.error('[EmailTrigger] Failed to send application status email:', err.message));

    return sendSuccess(res, updatedRows[0], `Application status successfully updated to ${status}.`);
  } catch (error) {
    return next(error);
  }
}
