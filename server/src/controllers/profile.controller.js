import pool from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get current authenticated user's full private profile
 */
export async function getMyProfile(req, res) {
  return sendSuccess(res, { user: req.user }, 'Profile retrieved successfully.');
}

/**
 * Update current volunteer profile
 */
export async function updateVolunteerProfile(req, res, next) {
  try {
    const userId = req.user.id;

    if (req.user.role !== 'volunteer' && req.user.role !== 'admin') {
      return sendError(res, 'Only volunteers can update volunteer profiles.', 403, 'FORBIDDEN');
    }

    const {
      first_name,
      last_name,
      phone,
      bio,
      skills,
      interests,
      location,
      availability,
      avatar_url,
      is_public
    } = req.body;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update name on users table if provided
      if (first_name !== undefined || last_name !== undefined) {
        const updates = [];
        const params = [];
        if (first_name !== undefined) {
          updates.push('first_name = ?');
          params.push(first_name.trim());
        }
        if (last_name !== undefined) {
          updates.push('last_name = ?');
          params.push(last_name.trim());
        }
        params.push(userId);
        await connection.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      // Check if volunteer profile exists
      const [existing] = await connection.query(
        'SELECT id FROM volunteer_profiles WHERE user_id = ?',
        [userId]
      );

      const profileUpdates = [];
      const profileParams = [];

      if (phone !== undefined) { profileUpdates.push('phone = ?'); profileParams.push(phone ? phone.trim() : null); }
      if (bio !== undefined) { profileUpdates.push('bio = ?'); profileParams.push(bio ? bio.trim() : null); }
      if (skills !== undefined) { profileUpdates.push('skills = ?'); profileParams.push(skills ? skills.trim() : null); }
      if (interests !== undefined) { profileUpdates.push('interests = ?'); profileParams.push(interests ? interests.trim() : null); }
      if (location !== undefined) { profileUpdates.push('location = ?'); profileParams.push(location ? location.trim() : null); }
      if (availability !== undefined) { profileUpdates.push('availability = ?'); profileParams.push(availability ? availability.trim() : null); }
      if (avatar_url !== undefined) { profileUpdates.push('avatar_url = ?'); profileParams.push(avatar_url ? avatar_url.trim() : null); }
      if (is_public !== undefined) { profileUpdates.push('is_public = ?'); profileParams.push(is_public ? 1 : 0); }

      if (profileUpdates.length > 0) {
        if (existing.length > 0) {
          profileParams.push(userId);
          await connection.query(
            `UPDATE volunteer_profiles SET ${profileUpdates.join(', ')} WHERE user_id = ?`,
            profileParams
          );
        } else {
          await connection.query(
            'INSERT INTO volunteer_profiles (user_id, phone, bio, skills, interests, location, availability, avatar_url, is_public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              userId,
              phone || null,
              bio || null,
              skills || null,
              interests || null,
              location || null,
              availability || null,
              avatar_url || null,
              is_public !== undefined ? (is_public ? 1 : 0) : 1
            ]
          );
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    // Return refreshed user and profile
    const [updatedUsers] = await pool.query(
      'SELECT id, email, first_name, last_name, role, status FROM users WHERE id = ?',
      [userId]
    );
    const [updatedProfiles] = await pool.query(
      'SELECT * FROM volunteer_profiles WHERE user_id = ?',
      [userId]
    );

    const result = {
      ...updatedUsers[0],
      profile: updatedProfiles.length > 0 ? updatedProfiles[0] : null
    };

    return sendSuccess(res, result, 'Volunteer profile updated successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Update organization profile
 */
export async function updateOrganizationProfile(req, res, next) {
  try {
    const orgId = parseInt(req.params.id, 10);

    const [orgs] = await pool.query('SELECT * FROM organizations WHERE id = ?', [orgId]);
    if (orgs.length === 0) {
      return sendError(res, 'Organization not found.', 404, 'NOT_FOUND');
    }

    const org = orgs[0];

    // Check ownership: must be the owner user or an admin
    if (req.user.role !== 'admin' && org.user_id !== req.user.id) {
      return sendError(
        res,
        'You do not have permission to modify this organization.',
        403,
        'FORBIDDEN'
      );
    }

    const {
      name,
      description,
      mission,
      logo_url,
      website,
      phone,
      address,
      city,
      state,
      country,
      postal_code
    } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name.trim()); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description.trim()); }
    if (mission !== undefined) { updates.push('mission = ?'); params.push(mission ? mission.trim() : null); }
    if (logo_url !== undefined) { updates.push('logo_url = ?'); params.push(logo_url ? logo_url.trim() : null); }
    if (website !== undefined) { updates.push('website = ?'); params.push(website ? website.trim() : null); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone ? phone.trim() : null); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address ? address.trim() : null); }
    if (city !== undefined) { updates.push('city = ?'); params.push(city ? city.trim() : null); }
    if (state !== undefined) { updates.push('state = ?'); params.push(state ? state.trim() : null); }
    if (country !== undefined) { updates.push('country = ?'); params.push(country.trim()); }
    if (postal_code !== undefined) { updates.push('postal_code = ?'); params.push(postal_code ? postal_code.trim() : null); }

    if (updates.length > 0) {
      params.push(orgId);
      await pool.query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updatedOrgs] = await pool.query('SELECT * FROM organizations WHERE id = ?', [orgId]);

    return sendSuccess(res, updatedOrgs[0], 'Organization profile updated successfully.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Public volunteer profile view
 */
export async function getPublicVolunteerProfile(req, res, next) {
  try {
    const profileId = parseInt(req.params.id, 10);

    const [profiles] = await pool.query(
      `SELECT vp.id, vp.user_id, vp.bio, vp.skills, vp.interests, vp.location,
              vp.availability, vp.avatar_url, vp.is_public, vp.created_at,
              u.first_name, u.last_name
       FROM volunteer_profiles vp
       JOIN users u ON u.id = vp.user_id
       WHERE vp.id = ?`,
      [profileId]
    );

    if (profiles.length === 0) {
      return sendError(res, 'Volunteer profile not found.', 404, 'NOT_FOUND');
    }

    const profile = profiles[0];
    const isOwner = req.user && req.user.id === profile.user_id;
    const isAdmin = req.user && req.user.role === 'admin';

    // If profile is not public and requester is neither owner nor admin, protect privacy
    if (!profile.is_public && !isOwner && !isAdmin) {
      return sendError(res, 'This volunteer profile is private.', 404, 'PROFILE_PRIVATE');
    }

    return sendSuccess(res, profile, 'Volunteer profile retrieved.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Public organization profile view with published opportunities list
 */
export async function getPublicOrganizationProfile(req, res, next) {
  try {
    const orgId = parseInt(req.params.id, 10);

    const [orgs] = await pool.query(
      `SELECT id, name, description, mission, logo_url, website, phone, email, address,
              city, state, country, postal_code, verification_status, created_at
       FROM organizations
       WHERE id = ?`,
      [orgId]
    );

    if (orgs.length === 0) {
      return sendError(res, 'Organization not found.', 404, 'NOT_FOUND');
    }

    const org = orgs[0];

    // Fetch published opportunities for this organization
    const [opps] = await pool.query(
      `SELECT o.id, o.slug, o.title, o.description, o.location_type, o.location,
              o.start_date, o.end_date, o.application_deadline, o.commitment_hours,
              c.name AS category_name, c.icon AS category_icon
       FROM opportunities o
       LEFT JOIN categories c ON c.id = o.category_id
       WHERE o.organization_id = ? AND o.status = 'published'
       ORDER BY o.application_deadline ASC`,
      [orgId]
    );

    org.opportunities = opps;
    org.active_opportunities_count = opps.length;

    return sendSuccess(res, org, 'Organization details retrieved.');
  } catch (error) {
    return next(error);
  }
}

/**
 * Public list of verified organizations with active opportunities count and search
 */
export async function listOrganizations(req, res, next) {
  try {
    const { search, q, city, state } = req.query;
    const searchTerm = (search || q || '').trim();

    const conditions = ["org.verification_status = 'verified'"];
    const params = [];

    if (searchTerm) {
      conditions.push('(org.name LIKE ? OR org.description LIKE ? OR org.city LIKE ?)');
      const wild = `%${searchTerm}%`;
      params.push(wild, wild, wild);
    }

    if (city) {
      conditions.push('org.city LIKE ?');
      params.push(`%${city.trim()}%`);
    }

    if (state) {
      conditions.push('org.state LIKE ?');
      params.push(`%${state.trim()}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [orgs] = await pool.query(
      `SELECT org.id, org.name, org.description, org.mission, org.logo_url, org.website,
              org.city, org.state, org.country, org.verification_status, org.created_at,
              COUNT(o.id) AS active_opportunities_count
       FROM organizations org
       LEFT JOIN opportunities o ON o.organization_id = org.id AND o.status = 'published'
       ${whereClause}
       GROUP BY org.id
       ORDER BY org.name ASC`,
      params
    );

    return sendSuccess(res, orgs, 'Organizations retrieved successfully.');
  } catch (error) {
    return next(error);
  }
}
