import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import pool from '../src/config/db.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await pool.end();
});

test('Auth API - Full Test Suite', async (t) => {
  const timestamp = Date.now();
  const volunteerEmail = `test.volunteer.${timestamp}@example.com`;
  const orgEmail = `test.org.${timestamp}@example.com`;
  const testPassword = 'SecurePassword123!';

  let volunteerToken = '';
  let volunteerCookie = '';
  let volunteerUserId = null;
  let volunteerProfileId = null;

  let orgToken = '';
  let orgCookie = '';
  let orgUserId = null;
  let orgId = null;

  await t.test('1. Volunteer Registration - Success', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'volunteer',
        email: volunteerEmail,
        password: testPassword,
        first_name: 'Test',
        last_name: 'Volunteer',
        bio: 'Avid community volunteer',
        location: 'Seattle, WA',
        skills: 'Gardening, Teaching'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, volunteerEmail);
    assert.equal(body.data.user.role, 'volunteer');
    assert.ok(body.data.user.profile);
    assert.equal(body.data.user.profile.location, 'Seattle, WA');
    assert.ok(body.data.token);

    // Save token and cookie
    volunteerToken = body.data.token;
    volunteerCookie = res.headers.get('set-cookie') || '';
    volunteerUserId = body.data.user.id;
    volunteerProfileId = body.data.user.profile.id;

    assert.ok(volunteerCookie.includes('helproster_token'));
  });

  await t.test('2. Registration - Duplicate Email Rejection (409)', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'volunteer',
        email: volunteerEmail,
        password: testPassword,
        first_name: 'Duplicate',
        last_name: 'User'
      })
    });

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'DUPLICATE_RESOURCE');
  });

  await t.test('3. Organization Registration - Requires organization_name (400)', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'organization',
        email: `invalid.org.${timestamp}@example.com`,
        password: testPassword,
        first_name: 'Org',
        last_name: 'Rep'
        // Missing organization_name
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  await t.test('4. Organization Registration - Success', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'organization',
        email: orgEmail,
        password: testPassword,
        first_name: 'Maya',
        last_name: 'Lin',
        organization_name: 'Cascadia Habitat Project',
        organization_description: 'Building sustainable homes and green spaces.',
        phone: '+1-555-0999'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, orgEmail);
    assert.equal(body.data.user.role, 'organization');
    assert.ok(body.data.user.profile);
    assert.equal(body.data.user.profile.name, 'Cascadia Habitat Project');

    orgToken = body.data.token;
    orgCookie = res.headers.get('set-cookie') || '';
    orgUserId = body.data.user.id;
    orgId = body.data.user.profile.id;
  });

  await t.test('5. Login - Invalid Credentials Rejection (401)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: volunteerEmail,
        password: 'WrongPassword999!'
      })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CREDENTIALS');
  });

  await t.test('6. Login - Success with Seeded Admin User', async () => {
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
    assert.equal(body.data.user.email, 'admin@helproster.org');
    assert.equal(body.data.user.role, 'admin');
    assert.ok(body.data.token);
  });

  await t.test('7. Auth Check - GET /auth/me Unauthenticated (401)', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  await t.test('8. Auth Check - GET /auth/me with Bearer Token (200)', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, volunteerEmail);
    assert.equal(body.data.user.role, 'volunteer');
  });

  await t.test('9. Profile Update - Volunteer updates own bio and skills', async () => {
    const res = await fetch(`${baseUrl}/volunteers/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        bio: 'Updated bio: Experienced trail builder and youth mentor.',
        skills: 'Carpentry, Trail Maintenance, First Aid',
        availability: 'Weekends only'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.profile.bio, 'Updated bio: Experienced trail builder and youth mentor.');
    assert.equal(body.data.profile.availability, 'Weekends only');
  });

  await t.test('10. Role Protection - Organization cannot update volunteer profile (403)', async () => {
    const res = await fetch(`${baseUrl}/volunteers/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`
      },
      body: JSON.stringify({
        bio: 'This should fail'
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  await t.test('11. Org Ownership Protection - Org cannot update another Org (403)', async () => {
    // Org id 1 belongs to seeded user 2 ('Green Earth Alliance')
    const res = await fetch(`${baseUrl}/organizations/1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`
      },
      body: JSON.stringify({
        name: 'Malicious Takeover Name'
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
  });

  await t.test('12. Org Ownership - Org successfully updates own profile (200)', async () => {
    const res = await fetch(`${baseUrl}/organizations/${orgId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgToken}`
      },
      body: JSON.stringify({
        mission: 'Creating resilient native ecosystems in urban centers.',
        city: 'Tacoma',
        state: 'WA'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.mission, 'Creating resilient native ecosystems in urban centers.');
    assert.equal(body.data.city, 'Tacoma');
  });

  await t.test('13. Public Profile - View Organization Details', async () => {
    const res = await fetch(`${baseUrl}/organizations/${orgId}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.name, 'Cascadia Habitat Project');
    assert.equal(body.data.city, 'Tacoma');
  });

  await t.test('14. Logout - Clears Auth Cookie', async () => {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST'
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const cookie = res.headers.get('set-cookie') || '';
    assert.ok(cookie.includes('helproster_token=;'));
  });
});
