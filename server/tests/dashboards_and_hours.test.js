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

test('Dashboards, Volunteer Hours & Achievements - Full Integration Suite', async (t) => {
  const timestamp = Date.now();
  let orgOwnerToken = '';
  let otherOrgToken = '';
  let volunteerToken = '';
  let volunteerId = null;
  let loggedHoursId = null;

  // Step 1: Login as GreenEarth (owner of Opportunity 1)
  await t.test('Setup: Login as opportunity owner organization', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'contact@greenearth.org',
        password: 'Password123!'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    orgOwnerToken = body.data.token;
  });

  // Step 2: Login as Hope Shelter (non-owner of Opportunity 1)
  await t.test('Setup: Login as non-owner organization', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'director@hopereading.org',
        password: 'Password123!'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    otherOrgToken = body.data.token;
  });

  // Step 3: Register a fresh volunteer
  await t.test('Setup: Register fresh volunteer', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `hours.vol.${timestamp}@example.com`,
        password: 'Password123!',
        first_name: 'Hours',
        last_name: 'Volunteer',
        role: 'volunteer'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    volunteerToken = body.data.token;
    volunteerId = body.data.user.id;
  });

  // 1. Volunteer submits application, automatically earning FIRST_STEP badge
  await t.test('1. Achievements Engine - FIRST_STEP awarded on application submission', async () => {
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        message: 'Looking forward to logging hours here.'
      })
    });
    assert.equal(res.status, 201);

    // Verify achievement
    const achRes = await fetch(`${baseUrl}/achievements/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    assert.equal(achRes.status, 200);
    const achBody = await achRes.json();
    assert.equal(achBody.success, true);
    const codes = achBody.data.map((a) => a.code);
    assert.ok(codes.includes('FIRST_STEP'), 'FIRST_STEP badge should be awarded on first application');
  });

  // 2. Reject logging hours with future date
  await t.test('2. Validation - Reject logging hours with future date (400)', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const res = await fetch(`${baseUrl}/hours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        activity_date: futureDateStr,
        hours: 4,
        description: 'Future activity date test.'
      })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'FUTURE_DATE_NOT_ALLOWED');
  });

  // 3. Reject logging invalid hours (0 or > 24)
  await t.test('3. Validation - Reject invalid hours range (400)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`${baseUrl}/hours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        activity_date: today,
        hours: 30, // exceeds 24
        description: 'Exceeding hours limit.'
      })
    });
    assert.equal(res.status, 400);
  });

  // 4. Successfully log valid volunteer hours
  await t.test('4. Hours Logging - Volunteer logs 5.5 hours successfully (201)', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`${baseUrl}/hours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        activity_date: today,
        hours: 5.5,
        description: 'Assisted with native tree planting and site irrigation setup.'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.hours, '5.50');
    assert.equal(body.data.status, 'pending');
    loggedHoursId = body.data.id;
  });

  // 5. Volunteer retrieves their logged hours & summary
  await t.test('5. Volunteer History - GET /hours/my returns stats and submissions', async () => {
    const res = await fetch(`${baseUrl}/hours/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.summary.pending_hours, 5.5);
    assert.equal(body.data.summary.approved_hours, 0);
    assert.ok(body.data.hours.length >= 1);
  });

  // 6. Non-owner organization cannot review volunteer hours (403)
  await t.test('6. Access Control - Non-owner org cannot review hours (403)', async () => {
    const res = await fetch(`${baseUrl}/hours/${loggedHoursId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherOrgToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'Looks good'
      })
    });
    assert.equal(res.status, 403);
  });

  // 7. Organization retrieves pending hours queue for its listings
  await t.test('7. Organization Queue - Owner org retrieves pending hours queue', async () => {
    const res = await fetch(`${baseUrl}/hours/organization?status=pending`, {
      headers: { Authorization: `Bearer ${orgOwnerToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const found = body.data.some((h) => h.id === loggedHoursId);
    assert.ok(found, 'Logged hours must appear in organization review queue');
  });

  // 8. Organization approves volunteer hours with feedback
  await t.test('8. Organization Review - Owner org approves hours with feedback note', async () => {
    const res = await fetch(`${baseUrl}/hours/${loggedHoursId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgOwnerToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'Excellent work on irrigation and soil prep. Thank you!'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.hours.status, 'approved');
    assert.equal(body.data.hours.feedback, 'Excellent work on irrigation and soil prep. Thank you!');
  });

  // 9. Volunteer logs and gets approved for another 5.0 hours to trigger HELPING_HAND_10 (10 hrs milestone)
  await t.test('9. Achievements Engine - HELPING_HAND_10 badge unlocked upon reaching 10 hours', async () => {
    const today = new Date().toISOString().split('T')[0];
    const logRes = await fetch(`${baseUrl}/hours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        activity_date: today,
        hours: 5.0,
        description: 'Second planting shift completed.'
      })
    });
    const logBody = await logRes.json();
    const secondHoursId = logBody.data.id;

    // Approve second shift
    const reviewRes = await fetch(`${baseUrl}/hours/${secondHoursId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgOwnerToken}`
      },
      body: JSON.stringify({
        status: 'approved',
        feedback: 'Great job!'
      })
    });
    assert.equal(reviewRes.status, 200);
    const reviewBody = await reviewRes.json();
    assert.ok(reviewBody.data.new_achievements.some((a) => a.code === 'HELPING_HAND_10'));

    // Check my achievements endpoint
    const achRes = await fetch(`${baseUrl}/achievements/my`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    const achBody = await achRes.json();
    const codes = achBody.data.map((a) => a.code);
    assert.ok(codes.includes('HELPING_HAND_10'), 'HELPING_HAND_10 should now be earned');
  });

  // 10. Achievements Catalog with progress calculations
  await t.test('10. Achievements Catalog - GET /achievements returns progress towards badges', async () => {
    const res = await fetch(`${baseUrl}/achievements`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length >= 6);

    const helpingHand = body.data.find((a) => a.code === 'HELPING_HAND_10');
    assert.equal(helpingHand.earned, true);
    assert.equal(helpingHand.progress_percent, 100);

    const pillar50 = body.data.find((a) => a.code === 'COMMUNITY_PILLAR_50');
    assert.equal(pillar50.earned, false);
    assert.ok(pillar50.current_value >= 10.5);
  });

  // 11. Volunteer Dashboard endpoint aggregation
  await t.test('11. Volunteer Dashboard - GET /dashboard/volunteer returns full payload', async () => {
    const res = await fetch(`${baseUrl}/dashboard/volunteer`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    const data = body.data;
    assert.ok(data.profile);
    assert.equal(data.profile.email, `hours.vol.${timestamp}@example.com`);
    assert.ok(data.application_stats.total >= 1);
    assert.equal(data.hours_stats.approved_hours, 10.5);
    assert.equal(data.achievements.earned_count, 2);
    assert.ok(data.recent_applications.length >= 1);
    assert.ok(data.recent_hours.length >= 2);
  });

  // 12. Organization Dashboard endpoint aggregation
  await t.test('12. Organization Dashboard - GET /dashboard/organization returns full payload', async () => {
    const res = await fetch(`${baseUrl}/dashboard/organization`, {
      headers: { Authorization: `Bearer ${orgOwnerToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    const data = body.data;
    assert.ok(data.organization);
    assert.equal(data.organization.name, 'Green Earth Alliance');
    assert.ok(data.opportunity_stats.total >= 1);
    assert.ok(data.hours_stats.total_approved_hours >= 10.5);
  });

  // 13. Dynamic platform impact reflects strictly approved hours (TASK-028)
  await t.test('13. Platform Impact - GET /public/stats includes newly approved hours', async () => {
    const res = await fetch(`${baseUrl}/public/stats`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.verified_hours >= 10.5, 'Verified hours must include newly approved hours');
  });
});
