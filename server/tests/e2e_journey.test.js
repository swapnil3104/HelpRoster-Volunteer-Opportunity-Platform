import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import pool from '../src/config/db.js';

let server;
let baseUrl;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function extractCookie(res) {
  const cookieHeader = res.headers['set-cookie'];
  if (!cookieHeader) return null;
  const cookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
  return cookie.split(';')[0];
}

test('Comprehensive End-to-End Multi-Role Platform Journey', async (t) => {
  const timestamp = Date.now();
  const volunteerEmail = `e2e_vol_${timestamp}@example.com`;
  const orgEmail = `e2e_org_${timestamp}@example.com`;
  const adminEmail = 'admin@helproster.org';
  const commonPassword = 'Password123!';

  let adminCookie;
  let orgCookie;
  let orgId;
  let volunteerCookie;
  let volunteerId;
  let opportunityId;
  let opportunitySlug;
  let applicationId;
  let hoursLogId;

  // Start HTTP server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  await t.test('1. Admin Login & Verification Queue Readiness', async () => {
    const res = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: commonPassword }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'admin');
    adminCookie = extractCookie(res);
    assert.ok(adminCookie, 'Admin session cookie must be set');
  });

  await t.test('2. Organization Registration', async () => {
    const res = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: {
        role: 'organization',
        email: orgEmail,
        password: commonPassword,
        first_name: 'E2E',
        last_name: 'Director',
        organization_name: `E2E Hope Initiative ${timestamp}`,
        organization_description: 'Transforming local communities through volunteer action',
        phone: '555-0199',
        location: 'Seattle, WA'
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'organization');
    orgCookie = extractCookie(res);
    orgId = res.body.data.profile?.id;
    assert.ok(orgCookie, 'Org cookie must be set');
  });

  await t.test('3. Unverified Organization is Blocked from Publishing Opportunities', async () => {
    const res = await makeRequest('/api/v1/opportunities', {
      method: 'POST',
      headers: { Cookie: orgCookie },
      body: {
        title: `Community Food Drive ${timestamp}`,
        description: 'Help distribute food to families in need across the metro area.',
        requirements: 'Must be able to lift 20 lbs.',
        responsibilities: 'Sort and hand out food packages.',
        category_id: 1,
        location_type: 'on_site',
        location: 'Seattle, WA',
        start_date: '2026-11-01',
        end_date: '2026-11-02',
        application_deadline: '2026-10-30',
        commitment_hours: 4,
        capacity: 10,
        status: 'published' // Forbidden while unverified
      }
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'ORG_NOT_VERIFIED');
  });

  await t.test('4. Organization Can Create Draft Opportunity', async () => {
    const res = await makeRequest('/api/v1/opportunities', {
      method: 'POST',
      headers: { Cookie: orgCookie },
      body: {
        title: `Community Food Drive ${timestamp}`,
        description: 'Help distribute food to families in need across the metro area.',
        requirements: 'Must be able to lift 20 lbs.',
        responsibilities: 'Sort and hand out food packages.',
        category_id: 1,
        location_type: 'on_site',
        location: 'Seattle, WA',
        start_date: '2026-11-01',
        end_date: '2026-11-02',
        application_deadline: '2026-10-30',
        commitment_hours: 4,
        capacity: 10,
        status: 'draft',
        skills: ['Food Logistics', 'Teamwork']
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    opportunityId = res.body.data.id;
    opportunitySlug = res.body.data.slug;
    assert.ok(opportunityId);
    assert.equal(res.body.data.status, 'draft');
  });

  await t.test('5. Admin Verifies Organization with Notes', async () => {
    if (!orgId) {
      const [rows] = await pool.query('SELECT id FROM organizations WHERE name LIKE ?', [`%${timestamp}%`]);
      orgId = rows[0].id;
    }
    const res = await makeRequest(`/api/v1/admin/organizations/${orgId}/verify`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: {
        verification_status: 'verified',
        admin_notes: 'Verified organization non-profit documentation and contact details.'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.verification_status, 'verified');
  });

  await t.test('6. Verified Organization Publishes Opportunity', async () => {
    const res = await makeRequest(`/api/v1/opportunities/${opportunityId}/status`, {
      method: 'PATCH',
      headers: { Cookie: orgCookie },
      body: { status: 'published' }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'published');
  });

  await t.test('7. Public Discovery - Listing is Searchable', async () => {
    const res = await makeRequest(`/api/v1/opportunities?search=Food+Drive+${timestamp}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 1);
    assert.equal(res.body.data[0].id, opportunityId);
  });

  await t.test('8. Volunteer Registers and Logs In', async () => {
    const regRes = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: {
        role: 'volunteer',
        email: volunteerEmail,
        password: commonPassword,
        first_name: 'Alex',
        last_name: 'Volunteer',
        phone: '555-0188',
        skills: 'Food Logistics, Communication',
        location: 'Seattle, WA'
      }
    });
    assert.equal(regRes.status, 201);
    volunteerCookie = extractCookie(regRes);
    volunteerId = regRes.body.data.user.id;
    assert.ok(volunteerCookie);
  });

  await t.test('9. Volunteer Applies to Published Opportunity', async () => {
    const res = await makeRequest('/api/v1/applications', {
      method: 'POST',
      headers: { Cookie: volunteerCookie },
      body: {
        opportunity_id: opportunityId,
        message: 'Passionate about food access and helping families in need.'
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'pending');
    applicationId = res.body.data.id;
  });

  await t.test('10. Duplicate Application Attempt is Blocked (409)', async () => {
    const res = await makeRequest('/api/v1/applications', {
      method: 'POST',
      headers: { Cookie: volunteerCookie },
      body: {
        opportunity_id: opportunityId,
        message: 'Applying second time.'
      }
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'APPLICATION_ALREADY_EXISTS');
  });

  await t.test('11. Volunteer Receives FIRST_STEP Achievement', async () => {
    const res = await makeRequest('/api/v1/achievements/my', {
      headers: { Cookie: volunteerCookie }
    });
    assert.equal(res.status, 200);
    const hasFirstStep = res.body.data.some((a) => a.code === 'FIRST_STEP');
    assert.ok(hasFirstStep, 'FIRST_STEP achievement should be awarded on first application');
  });

  await t.test('12. Organization Reviews and Accepts Application', async () => {
    const res = await makeRequest(`/api/v1/applications/${applicationId}/review`, {
      method: 'PATCH',
      headers: { Cookie: orgCookie },
      body: {
        status: 'accepted',
        review_notes: 'Welcome aboard! We are excited to have you on the food distribution team.'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'accepted');
  });

  await t.test('13. Volunteer Sees Accepted Status in Dashboard and My Applications', async () => {
    const res = await makeRequest('/api/v1/applications/my', {
      headers: { Cookie: volunteerCookie }
    });
    assert.equal(res.status, 200);
    const myApp = res.body.data.applications.find((a) => a.id === applicationId);
    assert.ok(myApp);
    assert.equal(myApp.status, 'accepted');
  });

  await t.test('14. Volunteer Logs Service Hours', async () => {
    const res = await makeRequest('/api/v1/hours', {
      method: 'POST',
      headers: { Cookie: volunteerCookie },
      body: {
        opportunity_id: opportunityId,
        hours: 4.5,
        activity_date: new Date().toISOString().split('T')[0],
        description: 'Completed food sort, packaging, and curbside family delivery shift.'
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, 'pending');
    hoursLogId = res.body.data.id;
  });

  await t.test('15. Organization Approves Volunteer Hours', async () => {
    const res = await makeRequest(`/api/v1/hours/${hoursLogId}/review`, {
      method: 'PATCH',
      headers: { Cookie: orgCookie },
      body: {
        status: 'approved',
        feedback: 'Outstanding effort and diligence during the distribution shift.'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.hours.status, 'approved');
  });

  await t.test('16. Volunteer Stats & Platform Impact Reflect Approved Hours', async () => {
    const myHoursRes = await makeRequest('/api/v1/hours/my', {
      headers: { Cookie: volunteerCookie }
    });
    assert.equal(myHoursRes.status, 200);
    assert.ok(Number(myHoursRes.body.data.summary.approved_hours) >= 4.5);

    const publicStatsRes = await makeRequest('/api/v1/public/stats');
    assert.equal(publicStatsRes.status, 200);
    assert.ok(Number(publicStatsRes.body.data.verified_hours) >= 4.5);
  });
});
