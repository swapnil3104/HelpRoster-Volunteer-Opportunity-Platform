import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import pool from '../src/config/db.js';
import { getTestMailbox, clearTestMailbox } from '../src/services/email.service.js';

let server;
let baseUrl;

test.before(async () => {
  clearTestMailbox();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });
});

async function waitForEmail(predicate, timeoutMs = 1500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = getTestMailbox().find(predicate);
    if (found) return found;
    await new Promise((r) => setTimeout(r, 40));
  }
  return null;
}

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
});

test('Administration, Support & Transactional Email - Full Integration Suite', async (t) => {
  const timestamp = Date.now();
  let adminToken = '';
  let volunteerToken = '';
  let testVolunteerId = null;
  let testVolunteerEmail = `admin.test.vol.${timestamp}@example.com`;
  let testOrgId = null;
  let resetToken = '';

  // Setup 1: Login as Platform Admin
  await t.test('Setup: Login as Platform Administrator', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@helproster.org',
        password: 'Password123!'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.role, 'admin');
    adminToken = body.data.token;
  });

  // Setup 2: Register a test volunteer
  await t.test('Setup: Register test volunteer', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'volunteer',
        email: testVolunteerEmail,
        password: 'Password123!',
        first_name: 'AdminTest',
        last_name: 'Volunteer',
        location: 'Seattle, WA'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    volunteerToken = body.data.token;
    testVolunteerId = body.data.user.id;

    // Verify welcome email was dispatched
    const welcome = await waitForEmail(e => e.to === testVolunteerEmail);
    assert.ok(welcome, 'Welcome email should be dispatched upon registration');
    assert.match(welcome.subject, /welcome to helproster/i);
  });

  // Step 1: Role gate verification
  await t.test('1. Role Gate - Volunteer is forbidden from accessing /admin/stats (403)', async () => {
    const res = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // Step 2: Admin platform statistics
  await t.test('2. Admin Overview - GET /admin/stats returns aggregate metrics (200)', async () => {
    const res = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.users.total_users >= 1);
    assert.ok(body.data.organizations);
    assert.ok(body.data.opportunities);
    assert.ok(body.data.hours);
    assert.ok(Array.isArray(body.data.recent_audits));
  });

  // Step 3: User list and status management
  await t.test('3. User Directory - GET /admin/users returns paginated users', async () => {
    const res = await fetch(`${baseUrl}/admin/users?role=volunteer`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.users));
    assert.ok(body.data.pagination.total >= 1);
  });

  // Step 4: Guard against self-suspension
  await t.test('4. Security Guard - Administrator cannot alter their own account status', async () => {
    const res = await fetch(`${baseUrl}/admin/users/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'suspended',
        reason: 'Should be blocked'
      })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // Step 5: Suspend volunteer account
  await t.test('5. Account Moderation - Admin suspends volunteer account', async () => {
    const res = await fetch(`${baseUrl}/admin/users/${testVolunteerId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'suspended',
        reason: 'Violation of community terms'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.newStatus, 'suspended');
  });

  // Step 6: Verify suspended account cannot log in
  await t.test('6. Authentication Enforcement - Suspended user is blocked at login (403)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testVolunteerEmail,
        password: 'Password123!'
      })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ACCOUNT_SUSPENDED');
  });

  // Step 7: Reactivate user account
  await t.test('7. Account Moderation - Admin reactivates volunteer account', async () => {
    const res = await fetch(`${baseUrl}/admin/users/${testVolunteerId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'active',
        reason: 'Account reinstated after appeal'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.newStatus, 'active');
  });

  // Step 8: Organization verification queue
  await t.test('8. Organization Verification - Admin reviews and updates organization status', async () => {
    // List organizations
    const listRes = await fetch(`${baseUrl}/admin/organizations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.ok(listBody.data.organizations.length > 0);
    testOrgId = listBody.data.organizations[0].id;

    // Verify organization
    const verifyRes = await fetch(`${baseUrl}/admin/organizations/${testOrgId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        verification_status: 'verified',
        notes: 'Verified tax-exempt non-profit status with secretary of state registry.'
      })
    });
    assert.equal(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.success, true);
    assert.equal(verifyBody.data.verification_status, 'verified');

    // Confirm notification email dispatched to organization
    const orgEmail = await waitForEmail(e => e.subject.includes('Organization Verification'));
    assert.ok(orgEmail, 'Organization verification email should be dispatched');
  });

  // Step 9: Opportunity moderation
  await t.test('9. Opportunity Moderation - Admin changes opportunity status with reason', async () => {
    const oppRes = await fetch(`${baseUrl}/admin/opportunities`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(oppRes.status, 200);
    const oppBody = await oppRes.json();
    assert.ok(oppBody.data.opportunities.length > 0);
    const oppId = oppBody.data.opportunities[0].id;

    const modRes = await fetch(`${baseUrl}/admin/opportunities/${oppId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'published',
        reason: 'Approved after review of event safety protocols'
      })
    });
    assert.equal(modRes.status, 200);
    const modBody = await modRes.json();
    assert.equal(modBody.success, true);
    assert.equal(modBody.data.newStatus, 'published');
  });

  // Step 10: Support and contact inquiries workflow
  await t.test('10. Support Queue - Submit contact inquiry and resolve via admin endpoint', async () => {
    // Public user submits contact form
    const contactRes = await fetch(`${baseUrl}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Community Neighbor',
        email: 'neighbor@example.com',
        subject: 'Accessibility Question for Weekend Event',
        message: 'Is wheelchair access available at the park arbor location?'
      })
    });
    assert.equal(contactRes.status, 201);
    const contactBody = await contactRes.json();
    const submissionId = contactBody.data.id;

    // Admin views inquiries
    const queueRes = await fetch(`${baseUrl}/admin/contact-submissions?status=new`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(queueRes.status, 200);
    const queueBody = await queueRes.json();
    const found = queueBody.data.submissions.find(s => s.id === submissionId);
    assert.ok(found, 'New contact submission should appear in admin queue');

    // Admin updates inquiry to resolved with notes
    const updateRes = await fetch(`${baseUrl}/admin/contact-submissions/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'resolved',
        response_notes: 'Confirmed accessible ramp with facility director and emailed instructions to visitor.'
      })
    });
    assert.equal(updateRes.status, 200);
    const updateBody = await updateRes.json();
    assert.equal(updateBody.success, true);
    assert.equal(updateBody.data.status, 'resolved');
  });

  // Step 11: Audit log inspection
  await t.test('11. Security Audit - GET /admin/audit-logs contains recorded events', async () => {
    const res = await fetch(`${baseUrl}/admin/audit-logs?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.logs));
    assert.ok(body.data.logs.length >= 3);
    const actions = body.data.logs.map(l => l.action);
    assert.ok(actions.some(a => a.includes('user.status_change')));
    assert.ok(actions.some(a => a.includes('organization.')));
  });

  // Step 12: Password recovery workflow (Forgot Password & Reset)
  await t.test('12. Password Reset - Request reset token and update password successfully', async () => {
    clearTestMailbox();

    // 1. Request forgot password
    const reqRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testVolunteerEmail })
    });
    assert.equal(reqRes.status, 200);
    const reqBody = await reqRes.json();
    assert.equal(reqBody.success, true);
    resetToken = reqBody.data.resetToken;
    assert.ok(resetToken, 'Reset token should be generated');

    // Verify email was sent
    const resetEmail = await waitForEmail(e => e.to === testVolunteerEmail);
    assert.ok(resetEmail, 'Password reset email should be dispatched');

    // 2. Perform password reset with new password
    const resetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'NewStrongPassword456!'
      })
    });
    assert.equal(resetRes.status, 200);
    const resetBody = await resetRes.json();
    assert.equal(resetBody.success, true);

    // 3. Verify user can log in with new password
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testVolunteerEmail,
        password: 'NewStrongPassword456!'
      })
    });
    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.equal(loginBody.success, true);
  });
});
