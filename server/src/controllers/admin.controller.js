import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAudit, queryAuditLogs } from '../services/audit.service.js';
import { sendOrganizationVerificationEmail } from '../services/email.service.js';

/**
 * 1. GET /api/v1/admin/stats
 * Aggregated platform metrics and health indicators.
 */
export async function getAdminStats(req, res, next) {
  try {
    // User metrics
    const [userStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        SUM(role = 'volunteer') AS total_volunteers,
        SUM(role = 'organization') AS total_organizations,
        SUM(role = 'admin') AS total_admins,
        SUM(status = 'active') AS active_users,
        SUM(status = 'suspended') AS suspended_users
      FROM users
    `);

    // Organization verification metrics
    const [orgStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_orgs,
        SUM(verification_status = 'verified') AS verified_orgs,
        SUM(verification_status = 'pending') AS pending_orgs,
        SUM(verification_status = 'rejected') AS rejected_orgs
      FROM organizations
    `);

    // Opportunity metrics
    const [oppStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_opps,
        SUM(status = 'published') AS published_opps,
        SUM(status = 'draft') AS draft_opps,
        SUM(status = 'closed') AS closed_opps,
        SUM(status = 'archived') AS archived_opps
      FROM opportunities
    `);

    // Application & Hours metrics
    const [appStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_apps,
        SUM(status = 'pending') AS pending_apps,
        SUM(status = 'accepted') AS accepted_apps
      FROM applications
    `);

    const [hourStats] = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'approved' THEN hours ELSE 0 END), 0) AS total_approved_hours,
        SUM(status = 'pending') AS pending_hours_count
      FROM volunteer_hours
    `);

    // Contact inquiries metrics
    const [contactStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_inquiries,
        SUM(status = 'new') AS new_inquiries,
        SUM(status = 'in_progress') AS in_progress_inquiries,
        SUM(status = 'resolved') AS resolved_inquiries
      FROM contact_submissions
    `);

    // Recent 5 audit events
    const [recentAudits] = await pool.query(`
      SELECT
        a.id,
        a.action,
        a.target_type,
        a.target_id,
        a.created_at,
        u.email AS actor_email
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    return sendSuccess(res, {
      users: userStats[0],
      organizations: orgStats[0],
      opportunities: oppStats[0],
      applications: appStats[0],
      hours: {
        total_approved: parseFloat(hourStats[0].total_approved_hours) || 0,
        pending_review_count: parseInt(hourStats[0].pending_hours_count, 10) || 0
      },
      support: contactStats[0],
      recent_audits: recentAudits
    }, 'Admin statistics retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * 2. GET /api/v1/admin/users
 * Paginated user directory with filters.
 */
export async function getUsers(req, res, next) {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const conditions = [];
    const params = [];

    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }
    if (status) {
      conditions.push('u.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(
      `SELECT
         u.id,
         u.email,
         u.first_name,
         u.last_name,
         u.role,
         u.status,
         u.created_at,
         u.updated_at,
         o.id AS org_id,
         o.name AS org_name,
         o.verification_status AS org_verification_status,
         vp.location AS volunteer_location
       FROM users u
       LEFT JOIN organizations o ON o.user_id = u.id
       LEFT JOIN volunteer_profiles vp ON vp.user_id = u.id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return sendSuccess(res, {
      users: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    }, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * 3. PATCH /api/v1/admin/users/:id/status
 * Alter account status (active, suspended, pending) with reason.
 */
export async function updateUserStatus(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return sendError(res, 'Invalid user status. Allowed: active, suspended, pending', 400, 'VALIDATION_ERROR');
    }

    if (targetUserId === req.user.id) {
      return sendError(res, 'Administrators cannot alter their own account status.', 400, 'SELF_MODERATION_BLOCKED');
    }

    const [users] = await pool.query('SELECT id, email, status, role FROM users WHERE id = ?', [targetUserId]);
    if (users.length === 0) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }
    const targetUser = users[0];
    const oldStatus = targetUser.status;

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, targetUserId]);

    // Record audit trail
    await logAudit(req, {
      action: 'user.status_change',
      targetType: 'user',
      targetId: targetUserId,
      details: {
        userEmail: targetUser.email,
        oldStatus,
        newStatus: status,
        reason: reason || 'Administrative action'
      }
    });

    return sendSuccess(res, {
      userId: targetUserId,
      oldStatus,
      newStatus: status,
      reason: reason || null
    }, `User status successfully updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

/**
 * 4. GET /api/v1/admin/organizations
 * List all organizations with verification filtering.
 */
export async function getOrganizations(req, res, next) {
  try {
    const { search, verification_status, page = 1, limit = 20 } = req.query;

    const conditions = [];
    const params = [];

    if (verification_status) {
      conditions.push('o.verification_status = ?');
      params.push(verification_status);
    }
    if (search) {
      conditions.push('(o.name LIKE ? OR o.email LIKE ? OR o.city LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM organizations o ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(
      `SELECT
         o.id,
         o.user_id,
         o.name,
         o.description,
         o.mission,
         o.logo_url,
         o.website,
         o.email,
         o.phone,
         o.address,
         o.city,
         o.state,
         o.country,
         o.postal_code,
         o.verification_status,
         o.created_at,
         u.email AS rep_email,
         CONCAT(u.first_name, ' ', u.last_name) AS rep_name,
         u.status AS rep_status,
         (SELECT COUNT(*) FROM opportunities opp WHERE opp.organization_id = o.id) AS total_opportunities,
         (SELECT COUNT(*) FROM opportunities opp WHERE opp.organization_id = o.id AND opp.status = 'published') AS published_opportunities
       FROM organizations o
       JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY
         CASE WHEN o.verification_status = 'pending' THEN 0 ELSE 1 END,
         o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return sendSuccess(res, {
      organizations: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    }, 'Organizations retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * 5. PATCH /api/v1/admin/organizations/:id/verify
 * Set organization verification status (verified, rejected, pending) with notes.
 */
export async function verifyOrganization(req, res, next) {
  try {
    const orgId = parseInt(req.params.id, 10);
    const { verification_status, notes } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(verification_status)) {
      return sendError(res, 'Invalid verification status. Allowed: verified, rejected, pending', 400, 'VALIDATION_ERROR');
    }

    const [orgs] = await pool.query('SELECT * FROM organizations WHERE id = ?', [orgId]);
    if (orgs.length === 0) {
      return sendError(res, 'Organization not found', 404, 'NOT_FOUND');
    }
    const org = orgs[0];
    const oldStatus = org.verification_status;

    await pool.query(
      'UPDATE organizations SET verification_status = ? WHERE id = ?',
      [verification_status, orgId]
    );

    // Record audit log
    await logAudit(req, {
      action: `organization.${verification_status}`,
      targetType: 'organization',
      targetId: orgId,
      details: {
        organizationName: org.name,
        oldStatus,
        newStatus: verification_status,
        notes: notes || null
      }
    });

    // Send asynchronous transactional notification email to organization
    sendOrganizationVerificationEmail({
      email: org.email,
      orgName: org.name,
      verificationStatus: verification_status,
      notes
    }).catch(e => console.error('[EmailTrigger] Failed:', e.message));

    return sendSuccess(res, {
      id: orgId,
      name: org.name,
      verification_status,
      notes: notes || null
    }, `Organization verification updated to ${verification_status}`);
  } catch (err) {
    next(err);
  }
}

/**
 * 6. GET /api/v1/admin/opportunities
 * Moderate opportunities across all organizations platform-wide.
 */
export async function getAdminOpportunities(req, res, next) {
  try {
    const { search, status, organization_id, category_id, page = 1, limit = 20 } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('opp.status = ?');
      params.push(status);
    }
    if (organization_id) {
      conditions.push('opp.organization_id = ?');
      params.push(organization_id);
    }
    if (category_id) {
      conditions.push('opp.category_id = ?');
      params.push(category_id);
    }
    if (search) {
      conditions.push('(opp.title LIKE ? OR opp.location LIKE ? OR o.name LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM opportunities opp
       JOIN organizations o ON opp.organization_id = o.id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(
      `SELECT
         opp.id,
         opp.title,
         opp.slug,
         opp.location_type,
         opp.location,
         opp.start_date,
         opp.application_deadline,
         opp.capacity,
         opp.status,
         opp.created_at,
         o.id AS organization_id,
         o.name AS organization_name,
         o.verification_status AS organization_verification_status,
         c.id AS category_id,
         c.name AS category_name,
         (SELECT COUNT(*) FROM applications app WHERE app.opportunity_id = opp.id) AS applicant_count
       FROM opportunities opp
       JOIN organizations o ON opp.organization_id = o.id
       LEFT JOIN categories c ON opp.category_id = c.id
       ${whereClause}
       ORDER BY opp.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return sendSuccess(res, {
      opportunities: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    }, 'Opportunities retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * 7. PATCH /api/v1/admin/opportunities/:id/status
 * Administrative moderation of opportunity status (draft, published, closed, archived).
 */
export async function moderateOpportunity(req, res, next) {
  try {
    const oppId = parseInt(req.params.id, 10);
    const { status, reason } = req.body;

    if (!['draft', 'published', 'closed', 'archived'].includes(status)) {
      return sendError(res, 'Invalid opportunity status. Allowed: draft, published, closed, archived', 400, 'VALIDATION_ERROR');
    }

    const [opps] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [oppId]);
    if (opps.length === 0) {
      return sendError(res, 'Opportunity not found', 404, 'NOT_FOUND');
    }
    const opp = opps[0];
    const oldStatus = opp.status;

    await pool.query('UPDATE opportunities SET status = ? WHERE id = ?', [status, oppId]);

    // Record audit log
    await logAudit(req, {
      action: 'opportunity.moderation',
      targetType: 'opportunity',
      targetId: oppId,
      details: {
        opportunityTitle: opp.title,
        oldStatus,
        newStatus: status,
        reason: reason || 'Administrative moderation'
      }
    });

    return sendSuccess(res, {
      id: oppId,
      title: opp.title,
      oldStatus,
      newStatus: status,
      reason: reason || null
    }, `Opportunity status updated to ${status}`);
  } catch (err) {
    next(err);
  }
}

/**
 * 8. GET /api/v1/admin/contact-submissions
 * Query contact support inquiries.
 */
export async function getContactSubmissions(req, res, next) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('cs.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(cs.name LIKE ? OR cs.email LIKE ? OR cs.subject LIKE ? OR cs.message LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM contact_submissions cs ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(
      `SELECT
         cs.id,
         cs.name,
         cs.email,
         cs.subject,
         cs.message,
         cs.status,
         cs.responded_by,
         cs.responded_at,
         cs.response_notes,
         cs.created_at,
         u.email AS responder_email,
         CONCAT(u.first_name, ' ', u.last_name) AS responder_name
       FROM contact_submissions cs
       LEFT JOIN users u ON cs.responded_by = u.id
       ${whereClause}
       ORDER BY
         CASE WHEN cs.status = 'new' THEN 0 WHEN cs.status = 'in_progress' THEN 1 ELSE 2 END,
         cs.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return sendSuccess(res, {
      submissions: rows,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    }, 'Contact submissions retrieved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * 9. PATCH /api/v1/admin/contact-submissions/:id
 * Update inquiry status and response notes.
 */
export async function updateContactSubmission(req, res, next) {
  try {
    const subId = parseInt(req.params.id, 10);
    const { status, response_notes } = req.body;

    if (!['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return sendError(res, 'Invalid contact status. Allowed: new, in_progress, resolved, closed', 400, 'VALIDATION_ERROR');
    }

    const [subs] = await pool.query('SELECT * FROM contact_submissions WHERE id = ?', [subId]);
    if (subs.length === 0) {
      return sendError(res, 'Contact submission not found', 404, 'NOT_FOUND');
    }
    const sub = subs[0];

    await pool.query(
      `UPDATE contact_submissions
       SET status = ?, response_notes = ?, responded_by = ?, responded_at = NOW()
       WHERE id = ?`,
      [status, response_notes || sub.response_notes, req.user.id, subId]
    );

    // Record audit log
    await logAudit(req, {
      action: 'contact.responded',
      targetType: 'contact_submission',
      targetId: subId,
      details: {
        contactEmail: sub.email,
        oldStatus: sub.status,
        newStatus: status,
        response_notes
      }
    });

    return sendSuccess(res, {
      id: subId,
      status,
      response_notes: response_notes || sub.response_notes,
      responded_by: req.user.id
    }, 'Contact submission updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * 10. GET /api/v1/admin/audit-logs
 * Fetch and filter system audit trail.
 */
export async function getAuditLogs(req, res, next) {
  try {
    const { page, limit, action, target_type, actor_id, start_date, end_date } = req.query;

    const result = await queryAuditLogs({
      page,
      limit,
      action,
      targetType: target_type,
      actorId: actor_id,
      startDate: start_date,
      endDate: end_date
    });

    return sendSuccess(res, result, 'Audit logs retrieved successfully');
  } catch (err) {
    next(err);
  }
}
