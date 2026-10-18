import pool from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { sendContactConfirmationEmail } from '../services/email.service.js';

/**
 * Handle public contact form submission.
 */
export async function submitContact(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;

    const [result] = await pool.query(
      `INSERT INTO contact_submissions (name, email, subject, message, status)
       VALUES (?, ?, ?, ?, 'new')`,
      [name, email.toLowerCase(), subject, message]
    );

    // Send asynchronous confirmation email
    sendContactConfirmationEmail({
      email: email.toLowerCase(),
      name,
      subject
    }).catch(e => console.error('[EmailTrigger] Failed to send contact confirmation:', e.message));

    return sendSuccess(
      res,
      {
        id: result.insertId,
        status: 'new',
        created_at: new Date()
      },
      'Thank you for contacting HelpRoster. Our community support team has received your message.',
      201
    );
  } catch (err) {
    next(err);
  }
}
