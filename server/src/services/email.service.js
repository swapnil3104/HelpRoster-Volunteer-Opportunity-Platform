import nodemailer from 'nodemailer';

// In-memory test mailbox for unit/integration testing
const testMailbox = [];

/**
 * Configure Nodemailer transport.
 * If SMTP credentials are provided, connects to real SMTP.
 * Otherwise, falls back to JSON/Stream transport with console logging.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user, pass }
    });
  }

  // Development/Test mock transporter
  return nodemailer.createTransport({
    jsonTransport: true
  });
}

const transporter = createTransporter();
const defaultFrom = process.env.SMTP_FROM || 'HelpRoster Notifications <notifications@helproster.org>';

/**
 * Send an email asynchronously without throwing uncaught exceptions to callers.
 */
export async function sendEmailAsync({ to, subject, html, text }) {
  try {
    const mailOptions = {
      from: defaultFrom,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ' ').trim(),
      html
    };

    const info = await transporter.sendMail(mailOptions);

    // Keep in test mailbox for assertion in automated test runner
    testMailbox.push({
      to,
      subject,
      html,
      text: mailOptions.text,
      timestamp: new Date(),
      messageId: info.messageId,
      raw: info.message
    });

    if (!process.env.SMTP_HOST && process.env.NODE_ENV !== 'test') {
      console.log(`[EmailService:DEV_FALLBACK] Email sent to: ${to} | Subject: "${subject}"`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to get recorded test emails.
 */
export function getTestMailbox() {
  return [...testMailbox];
}

/**
 * Clear test emails between tests.
 */
export function clearTestMailbox() {
  testMailbox.length = 0;
}

// ============================================================================
// Email Templates
// ============================================================================

const emailHeader = (title) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0d9488 100%); padding: 32px 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">HelpRoster</h1>
    <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 13px; font-weight: 500;">Volunteer Opportunity Platform</p>
  </div>
  <div style="padding: 32px 28px; color: #334155; line-height: 1.6; font-size: 15px;">
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">${title}</h2>
`;

const emailFooter = `
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />
    <p style="color: #64748b; font-size: 13px; margin: 0;">
      HelpRoster Platform &bull; Connecting passionate volunteers with meaningful community missions.<br/>
      Need help? Reach out at <a href="mailto:support@helproster.org" style="color: #2563eb; text-decoration: none;">support@helproster.org</a>.
    </p>
  </div>
</div>
`;

/**
 * 1. Welcome Email
 */
export async function sendWelcomeEmail({ email, name, role }) {
  const isOrg = role === 'organization';
  const roleText = isOrg ? 'an Organization Representative' : 'a Community Volunteer';
  const actionText = isOrg
    ? 'Once your organization is verified by platform administrators, you can publish opportunities and recruit passionate volunteers.'
    : 'You can now explore open volunteer opportunities, apply to causes you care about, and log your service hours.';

  const html = `
    ${emailHeader('Welcome to the HelpRoster Community!')}
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for creating an account with HelpRoster as <strong>${roleText}</strong>.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; color: #1e293b; font-weight: 500;">${actionText}</p>
    </div>
    <p>We are thrilled to have you partner with us to create measurable, positive community impact.</p>
    ${emailFooter}
  `;

  return sendEmailAsync({
    to: email,
    subject: 'Welcome to HelpRoster!',
    html
  });
}

/**
 * 2. Password Reset Request Email
 */
export async function sendPasswordResetEmail({ email, name, resetToken, resetUrl }) {
  const url = resetUrl || `http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const html = `
    ${emailHeader('Password Reset Request')}
    <p>Hello <strong>${name || 'HelpRoster Member'}</strong>,</p>
    <p>We received a request to reset the password associated with your HelpRoster account.</p>
    <p>Click the button below to choose a new password. This reset link will expire in <strong>1 hour</strong>.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset My Password</a>
    </div>
    <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/>
      <a href="${url}" style="color: #2563eb; word-break: break-all;">${url}</a>
    </p>
    <p style="color: #64748b; font-size: 13px; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email.</p>
    ${emailFooter}
  `;

  return sendEmailAsync({
    to: email,
    subject: 'HelpRoster - Password Reset Request',
    html
  });
}

/**
 * 3. Application Decision Status Email
 */
export async function sendApplicationStatusEmail({ email, volunteerName, opportunityTitle, organizationName, status, notes }) {
  const isAccepted = status === 'accepted';
  const badgeColor = isAccepted ? '#10b981' : '#ef4444';
  const title = isAccepted ? 'Your Volunteer Application Was Accepted! 🎉' : 'Update on Your Volunteer Application';
  const statusLabel = isAccepted ? 'ACCEPTED' : 'DECLINED';

  const html = `
    ${emailHeader(title)}
    <p>Hello <strong>${volunteerName}</strong>,</p>
    <p>The coordinator at <strong>${organizationName}</strong> has reviewed your application for:</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
      <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 16px;">${opportunityTitle}</h3>
      <p style="margin: 0; font-size: 14px;">Status: <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; background-color: ${badgeColor}; color: #ffffff; font-weight: 700; font-size: 12px;">${statusLabel}</span></p>
      ${notes ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #475569;"><strong>Coordinator Feedback:</strong> "${notes}"</p>` : ''}
    </div>
    ${isAccepted
      ? '<p>Congratulations! Please check your volunteer dashboard for further details and to prepare for your upcoming session.</p>'
      : '<p>Thank you for taking the time to apply. We encourage you to explore other opportunities that match your interests on HelpRoster.</p>'}
    ${emailFooter}
  `;

  return sendEmailAsync({
    to: email,
    subject: `Application ${statusLabel}: ${opportunityTitle}`,
    html
  });
}

/**
 * 4. Organization Verification Status Email
 */
export async function sendOrganizationVerificationEmail({ email, orgName, verificationStatus, notes }) {
  const isVerified = verificationStatus === 'verified';
  const title = isVerified ? 'Your Organization is Verified! 🛡️' : 'Organization Verification Update';
  const statusColor = isVerified ? '#10b981' : '#ef4444';

  const html = `
    ${emailHeader(title)}
    <p>Hello <strong>${orgName}</strong> Team,</p>
    <p>A HelpRoster platform administrator has reviewed your organization profile:</p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
      <p style="margin: 0; font-size: 14px;">Verification Decision:
        <span style="display: inline-block; padding: 2px 10px; border-radius: 9999px; background-color: ${statusColor}; color: #ffffff; font-weight: 700; font-size: 12px; text-transform: uppercase;">
          ${verificationStatus}
        </span>
      </p>
      ${notes ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #475569;"><strong>Administrator Notes:</strong> "${notes}"</p>` : ''}
    </div>
    ${isVerified
      ? '<p>Your organization is now verified! You can publish public opportunities, manage volunteers, and track community impact.</p>'
      : '<p>If you believe this was an error or wish to submit additional details, please contact platform support.</p>'}
    ${emailFooter}
  `;

  return sendEmailAsync({
    to: email,
    subject: `HelpRoster Organization Verification: ${isVerified ? 'Approved' : 'Action Required'}`,
    html
  });
}

/**
 * 5. Contact Form Inquiry Confirmation Email
 */
export async function sendContactConfirmationEmail({ email, name, subject }) {
  const html = `
    ${emailHeader('We Received Your Inquiry')}
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for reaching out to HelpRoster regarding: <em>"${subject}"</em>.</p>
    <p>Our support team has logged your submission and will respond via email as soon as possible.</p>
    ${emailFooter}
  `;

  return sendEmailAsync({
    to: email,
    subject: `HelpRoster Support: We received your message (${subject})`,
    html
  });
}
