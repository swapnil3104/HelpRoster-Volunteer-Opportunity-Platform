import pool from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * List all active categories
 */
export async function listCategories(req, res, next) {
  try {
    const [categories] = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description, c.icon,
              COUNT(o.id) AS opportunity_count
       FROM categories c
       LEFT JOIN opportunities o ON o.category_id = c.id AND o.status = 'published'
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    return sendSuccess(res, categories, 'Categories retrieved successfully.');
  } catch (error) {
    return next(error);
  }
}
