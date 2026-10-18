import pool from '../config/db.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

/**
 * Generate a URL-friendly slug from title
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * List public published opportunities with multi-criteria filtering and pagination
 */
export async function listPublicOpportunities(req, res, next) {
  try {
    const {
      search,
      q,
      category,
      location_type,
      location,
      skill,
      sort = 'deadline_asc',
      page = 1,
      limit = 12
    } = req.query;

    const searchTerm = (search || q || '').trim();
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["o.status = 'published'"];
    const params = [];

    // Search keyword
    if (searchTerm) {
      conditions.push(
        `(o.title LIKE ? OR o.description LIKE ? OR o.location LIKE ? OR org.name LIKE ? OR os_match.skill_name LIKE ?)`
      );
      const wildcard = `%${searchTerm}%`;
      params.push(wildcard, wildcard, wildcard, wildcard, wildcard);
    }

    // Category filter (by ID or slug)
    if (category) {
      if (!isNaN(category)) {
        conditions.push(`o.category_id = ?`);
        params.push(parseInt(category, 10));
      } else {
        conditions.push(`c.slug = ?`);
        params.push(category);
      }
    }

    // Location type
    if (location_type && ['on_site', 'remote', 'hybrid'].includes(location_type)) {
      conditions.push(`o.location_type = ?`);
      params.push(location_type);
    }

    // Location city/state string
    if (location) {
      conditions.push(`o.location LIKE ?`);
      params.push(`%${location.trim()}%`);
    }

    // Specific skill filter
    if (skill) {
      conditions.push(
        `EXISTS (SELECT 1 FROM opportunity_skills sub_os WHERE sub_os.opportunity_id = o.id AND sub_os.skill_name LIKE ?)`
      );
      params.push(`%${skill.trim()}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sort order
    let orderBy = 'o.application_deadline ASC';
    if (sort === 'created_desc') {
      orderBy = 'o.created_at DESC';
    } else if (sort === 'start_date_asc') {
      orderBy = 'o.start_date ASC';
    } else if (sort === 'title_asc') {
      orderBy = 'o.title ASC';
    }

    // Count query
    const countSql = `
      SELECT COUNT(DISTINCT o.id) AS total
      FROM opportunities o
      JOIN organizations org ON org.id = o.organization_id
      LEFT JOIN categories c ON c.id = o.category_id
      LEFT JOIN opportunity_skills os_match ON os_match.opportunity_id = o.id
      ${whereClause}
    `;

    const [countRows] = await pool.query(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    // Data query with aggregated skills
    const dataSql = `
      SELECT 
        o.id, o.slug, o.title, o.description, o.requirements, o.responsibilities,
        o.location_type, o.location, o.start_date, o.end_date, o.application_deadline,
        o.commitment_hours, o.capacity, o.status, o.created_at,
        org.id AS organization_id, org.name AS organization_name, org.logo_url AS organization_logo,
        org.city AS organization_city, org.state AS organization_state, org.verification_status,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
        GROUP_CONCAT(DISTINCT os.skill_name SEPARATOR '|||') AS skills_raw,
        (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) AS applications_count
      FROM opportunities o
      JOIN organizations org ON org.id = o.organization_id
      LEFT JOIN categories c ON c.id = o.category_id
      LEFT JOIN opportunity_skills os ON os.opportunity_id = o.id
      LEFT JOIN opportunity_skills os_match ON os_match.opportunity_id = o.id
      ${whereClause}
      GROUP BY o.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limitNum, offset];
    const [rows] = await pool.query(dataSql, queryParams);

    const data = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      requirements: row.requirements,
      responsibilities: row.responsibilities,
      location_type: row.location_type,
      location: row.location,
      start_date: row.start_date,
      end_date: row.end_date,
      application_deadline: row.application_deadline,
      commitment_hours: row.commitment_hours,
      capacity: row.capacity,
      status: row.status,
      created_at: row.created_at,
      organization: {
        id: row.organization_id,
        name: row.organization_name,
        logo_url: row.organization_logo,
        city: row.organization_city,
        state: row.organization_state,
        verification_status: row.verification_status
      },
      category: row.category_id
        ? {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
            icon: row.category_icon
          }
        : null,
      skills: row.skills_raw ? row.skills_raw.split('|||') : [],
      applications_count: Number(row.applications_count || 0)
    }));

    return sendPaginated(res, data, { totalItems: total, page: pageNum, limit: limitNum }, 'Opportunities retrieved successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Get opportunity details by numeric ID or slug
 */
export async function getOpportunityDetails(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const condition = isNumeric ? 'o.id = ?' : 'o.slug = ?';
    const param = isNumeric ? parseInt(idOrSlug, 10) : idOrSlug;

    const [rows] = await pool.query(
      `SELECT 
        o.id, o.slug, o.title, o.description, o.requirements, o.responsibilities,
        o.location_type, o.location, o.start_date, o.end_date, o.application_deadline,
        o.commitment_hours, o.capacity, o.status, o.created_at, o.updated_at,
        org.id AS organization_id, org.name AS organization_name, org.description AS organization_description,
        org.mission AS organization_mission, org.logo_url AS organization_logo, org.website AS organization_website,
        org.city AS organization_city, org.state AS organization_state, org.verification_status,
        c.id AS category_id, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon,
        GROUP_CONCAT(DISTINCT os.skill_name SEPARATOR '|||') AS skills_raw,
        (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) AS applications_count
      FROM opportunities o
      JOIN organizations org ON org.id = o.organization_id
      LEFT JOIN categories c ON c.id = o.category_id
      LEFT JOIN opportunity_skills os ON os.opportunity_id = o.id
      WHERE ${condition}
      GROUP BY o.id`,
      [param]
    );

    if (rows.length === 0) {
      return sendError(res, 'Opportunity not found.', 404, 'NOT_FOUND');
    }

    const row = rows[0];

    // Access control for non-published listings
    if (row.status !== 'published') {
      const isOwner = req.user && req.user.role === 'organization' && req.user.organization_id === row.organization_id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return sendError(res, 'This opportunity is not publicly available.', 404, 'NOT_PUBLISHED');
      }
    }

    const opportunity = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      requirements: row.requirements,
      responsibilities: row.responsibilities,
      location_type: row.location_type,
      location: row.location,
      start_date: row.start_date,
      end_date: row.end_date,
      application_deadline: row.application_deadline,
      commitment_hours: row.commitment_hours,
      capacity: row.capacity,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      organization: {
        id: row.organization_id,
        name: row.organization_name,
        description: row.organization_description,
        mission: row.organization_mission,
        logo_url: row.organization_logo,
        website: row.organization_website,
        city: row.organization_city,
        state: row.organization_state,
        verification_status: row.verification_status
      },
      category: row.category_id
        ? {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
            icon: row.category_icon
          }
        : null,
      skills: row.skills_raw ? row.skills_raw.split('|||') : [],
      applications_count: Number(row.applications_count || 0)
    };

    return sendSuccess(res, opportunity, 'Opportunity details retrieved.');
  } catch (error) {
    return next(error);
  }
}

/**
 * List opportunities for organization management workspace
 */
export async function listManageOpportunities(req, res, next) {
  try {
    const { status, search } = req.query;
    let orgId = req.user.organization_id;

    if (req.user.role === 'admin' && req.query.organization_id) {
      orgId = parseInt(req.query.organization_id, 10);
    }

    if (!orgId && req.user.role !== 'admin') {
      return sendError(res, 'Organization profile not associated with this account.', 400, 'NO_ORG_ASSOCIATION');
    }

    const conditions = [];
    const params = [];

    if (orgId) {
      conditions.push('o.organization_id = ?');
      params.push(orgId);
    }

    if (status && ['draft', 'published', 'closed', 'archived'].includes(status)) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      conditions.push('(o.title LIKE ? OR o.location LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        o.id, o.slug, o.title, o.location_type, o.location, o.start_date, o.end_date,
        o.application_deadline, o.commitment_hours, o.capacity, o.status, o.created_at, o.updated_at,
        c.name AS category_name,
        org.name AS organization_name, org.verification_status,
        (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) AS applications_count,
        GROUP_CONCAT(DISTINCT os.skill_name SEPARATOR '|||') AS skills_raw
      FROM opportunities o
      JOIN organizations org ON org.id = o.organization_id
      LEFT JOIN categories c ON c.id = o.category_id
      LEFT JOIN opportunity_skills os ON os.opportunity_id = o.id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const [rows] = await pool.query(sql, params);

    const data = rows.map((row) => ({
      ...row,
      skills: row.skills_raw ? row.skills_raw.split('|||') : [],
      skills_raw: undefined
    }));

    return sendSuccess(res, data, 'Management opportunities retrieved.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Create a new opportunity (enforces DEC-001 verification check on publish)
 */
export async function createOpportunity(req, res, next) {
  const connection = await pool.getConnection();
  try {
    let orgId = req.user.organization_id;
    if (req.user.role === 'admin' && req.body.organization_id) {
      orgId = parseInt(req.body.organization_id, 10);
    }

    if (!orgId) {
      return sendError(res, 'No organization associated with this account.', 400, 'NO_ORG');
    }

    // Verify organization verification status
    const [orgs] = await connection.query(
      'SELECT id, verification_status FROM organizations WHERE id = ?',
      [orgId]
    );

    if (orgs.length === 0) {
      return sendError(res, 'Organization record not found.', 404, 'ORG_NOT_FOUND');
    }

    const targetStatus = req.body.status || 'draft';
    const isVerified = orgs[0].verification_status === 'verified';

    // Verification Gate (DEC-001 / TASK-019)
    if (targetStatus === 'published' && !isVerified) {
      return sendError(
        res,
        'Your organization requires administrative verification before publishing listings to the public directory. You can save this opportunity as a draft.',
        403,
        'ORG_NOT_VERIFIED'
      );
    }

    // Generate unique slug
    let baseSlug = slugify(req.body.title);
    if (!baseSlug) baseSlug = 'opportunity';
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const [existing] = await connection.query(
        'SELECT id FROM opportunities WHERE slug = ?',
        [slug]
      );
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO opportunities (
        organization_id, category_id, title, slug, description, requirements,
        responsibilities, location_type, location, start_date, end_date,
        application_deadline, commitment_hours, capacity, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orgId,
        req.body.category_id || null,
        req.body.title,
        slug,
        req.body.description,
        req.body.requirements || null,
        req.body.responsibilities || null,
        req.body.location_type || 'on_site',
        req.body.location,
        req.body.start_date,
        req.body.end_date || null,
        req.body.application_deadline,
        req.body.commitment_hours || null,
        req.body.capacity || 1,
        targetStatus,
        req.user.id
      ]
    );

    const newId = result.insertId;

    // Insert skills if provided
    if (Array.isArray(req.body.skills) && req.body.skills.length > 0) {
      const uniqueSkills = [...new Set(req.body.skills.map((s) => s.trim()).filter(Boolean))];
      for (const skillName of uniqueSkills) {
        await connection.query(
          'INSERT INTO opportunity_skills (opportunity_id, skill_name) VALUES (?, ?)',
          [newId, skillName]
        );
      }
    }

    await connection.commit();

    return sendSuccess(
      res,
      {
        id: newId,
        slug,
        title: req.body.title,
        status: targetStatus,
        organization_id: orgId
      },
      'Opportunity created successfully.',
      201
    );
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}

/**
 * Update an existing opportunity
 */
export async function updateOpportunity(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const oppId = parseInt(req.params.id, 10);
    if (isNaN(oppId)) {
      return sendError(res, 'Invalid opportunity ID.', 400, 'INVALID_ID');
    }

    const [opps] = await connection.query('SELECT * FROM opportunities WHERE id = ?', [oppId]);
    if (opps.length === 0) {
      return sendError(res, 'Opportunity not found.', 404, 'NOT_FOUND');
    }

    const opp = opps[0];

    // Ownership check
    if (req.user.role !== 'admin' && opp.organization_id !== req.user.organization_id) {
      return sendError(res, 'You do not have permission to modify this opportunity.', 403, 'FORBIDDEN');
    }

    // Check verification status if attempting to publish
    const targetStatus = req.body.status !== undefined ? req.body.status : opp.status;
    if (targetStatus === 'published') {
      const [orgs] = await connection.query(
        'SELECT verification_status FROM organizations WHERE id = ?',
        [opp.organization_id]
      );
      if (orgs.length === 0 || orgs[0].verification_status !== 'verified') {
        return sendError(
          res,
          'Your organization requires administrative verification before publishing listings. Listing must remain draft or closed.',
          403,
          'ORG_NOT_VERIFIED'
        );
      }
    }

    await connection.beginTransaction();

    // Prepare update fields
    const updates = [];
    const params = [];

    const fieldMap = {
      title: 'title',
      category_id: 'category_id',
      description: 'description',
      requirements: 'requirements',
      responsibilities: 'responsibilities',
      location_type: 'location_type',
      location: 'location',
      start_date: 'start_date',
      end_date: 'end_date',
      application_deadline: 'application_deadline',
      commitment_hours: 'commitment_hours',
      capacity: 'capacity',
      status: 'status'
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (req.body[key] !== undefined) {
        updates.push(`${col} = ?`);
        params.push(req.body[key] === '' ? null : req.body[key]);
      }
    }

    // Update slug if title changed
    if (req.body.title && req.body.title !== opp.title) {
      let baseSlug = slugify(req.body.title);
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const [existing] = await connection.query(
          'SELECT id FROM opportunities WHERE slug = ? AND id != ?',
          [slug, oppId]
        );
        if (existing.length === 0) break;
        slug = `${baseSlug}-${counter++}`;
      }
      updates.push('slug = ?');
      params.push(slug);
    }

    if (updates.length > 0) {
      params.push(oppId);
      await connection.query(`UPDATE opportunities SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Update skills if provided
    if (Array.isArray(req.body.skills)) {
      await connection.query('DELETE FROM opportunity_skills WHERE opportunity_id = ?', [oppId]);
      const uniqueSkills = [...new Set(req.body.skills.map((s) => s.trim()).filter(Boolean))];
      for (const skillName of uniqueSkills) {
        await connection.query(
          'INSERT INTO opportunity_skills (opportunity_id, skill_name) VALUES (?, ?)',
          [oppId, skillName]
        );
      }
    }

    await connection.commit();

    return sendSuccess(res, { id: oppId, status: targetStatus }, 'Opportunity updated successfully.');
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally {
    connection.release();
  }
}

/**
 * Update opportunity lifecycle status (draft, published, closed, archived)
 */
export async function updateOpportunityStatus(req, res, next) {
  try {
    const oppId = parseInt(req.params.id, 10);
    if (isNaN(oppId)) {
      return sendError(res, 'Invalid opportunity ID.', 400, 'INVALID_ID');
    }
    const { status } = req.body;

    const [opps] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [oppId]);
    if (opps.length === 0) {
      return sendError(res, 'Opportunity not found.', 404, 'NOT_FOUND');
    }

    const opp = opps[0];

    // Ownership check
    if (req.user.role !== 'admin' && opp.organization_id !== req.user.organization_id) {
      return sendError(res, 'You do not have permission to modify this opportunity.', 403, 'FORBIDDEN');
    }

    // Verification check on publishing
    if (status === 'published') {
      const [orgs] = await pool.query(
        'SELECT verification_status FROM organizations WHERE id = ?',
        [opp.organization_id]
      );
      if (orgs.length === 0 || orgs[0].verification_status !== 'verified') {
        return sendError(
          res,
          'Your organization requires administrative verification before publishing listings.',
          403,
          'ORG_NOT_VERIFIED'
        );
      }
    }

    await pool.query('UPDATE opportunities SET status = ? WHERE id = ?', [status, oppId]);

    return sendSuccess(
      res,
      { id: oppId, previous_status: opp.status, status },
      `Opportunity status updated to ${status}.`
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * Delete or soft-archive opportunity
 */
export async function deleteOpportunity(req, res, next) {
  try {
    const oppId = parseInt(req.params.id, 10);
    if (isNaN(oppId)) {
      return sendError(res, 'Invalid opportunity ID.', 400, 'INVALID_ID');
    }

    const [opps] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [oppId]);
    if (opps.length === 0) {
      return sendError(res, 'Opportunity not found.', 404, 'NOT_FOUND');
    }

    const opp = opps[0];

    // Ownership check
    if (req.user.role !== 'admin' && opp.organization_id !== req.user.organization_id) {
      return sendError(res, 'You do not have permission to delete this opportunity.', 403, 'FORBIDDEN');
    }

    // Check if applications exist
    const [apps] = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE opportunity_id = ?',
      [oppId]
    );

    const applicationCount = apps[0]?.count || 0;

    if (applicationCount > 0) {
      // Retain audit trail by soft archiving
      await pool.query("UPDATE opportunities SET status = 'archived' WHERE id = ?", [oppId]);
      return sendSuccess(
        res,
        { id: oppId, archived: true },
        'Opportunity has existing applications and has been safely archived.'
      );
    }

    // Hard delete if no applications
    await pool.query('DELETE FROM opportunities WHERE id = ?', [oppId]);

    return sendSuccess(res, { id: oppId, deleted: true }, 'Opportunity deleted successfully.');
  } catch (error) {
    return next(error);
  }
}
