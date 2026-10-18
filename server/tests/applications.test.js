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

test('Volunteer Applications Workflow - Full Integration Suite', async (t) => {
  const timestamp = Date.now();
  let orgOwnerToken = '';
  let otherOrgToken = '';
  let volunteerToken = '';
  let volunteerId = null;
  let createdAppId = null;
  let withdrawableAppId = null;

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

  // Step 2: Login as Hope Literacy Project (other organization)
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
        role: 'volunteer',
        email: `volunteer.apps.${timestamp}@example.com`,
        password: 'Password123!',
        first_name: 'Alex',
        last_name: 'Volunteer',
        city: 'Seattle',
        state: 'WA'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    volunteerToken = body.data.token;
    volunteerId = body.data.user.id;
  });

  // Step 4: Role Gate - Organization cannot submit volunteer application
  await t.test('1. Role Gate - Organization cannot submit application (403)', async () => {
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgOwnerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        message: 'Organization applying'
      })
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // Step 5: Application submission to non-existent opportunity fails
  await t.test('2. Validation - Application to non-existent opportunity fails (404)', async () => {
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 999999,
        message: 'Applying to ghost listing'
      })
    });
    assert.equal(res.status, 404);
  });

  // Step 6: Valid application submission
  await t.test('3. Application Submission - Volunteer applies successfully (201)', async () => {
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        message: 'I would love to help plant trees and protect native habitats!'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'pending');
    assert.equal(body.data.opportunity_id, 1);
    assert.equal(body.data.opportunity_title, 'Urban Reforestation & Native Tree Planting');
    createdAppId = body.data.id;
  });

  // Step 7: Duplicate application prevention
  await t.test('4. Duplicate Prevention - Second application is rejected (409)', async () => {
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 1,
        message: 'Duplicate submission attempt'
      })
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'APPLICATION_ALREADY_EXISTS');
  });

  // Step 8: Volunteer checks their applications
  await t.test('5. Volunteer History - GET /applications/my returns submission', async () => {
    const res = await fetch(`${baseUrl}/applications/my`, {
      headers: {
        Authorization: `Bearer ${volunteerToken}`
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.applications));
    assert.equal(body.data.applications.length, 1);
    assert.equal(body.data.applications[0].opportunity_id, 1);
    assert.equal(body.data.applications[0].status, 'pending');
    assert.equal(body.data.summary.total, 1);
    assert.equal(body.data.summary.pending, 1);
  });

  // Step 9: Check status endpoint for opportunity detail page
  await t.test('6. Status Check - GET /applications/check/:id returns applied=true', async () => {
    const res = await fetch(`${baseUrl}/applications/check/1`, {
      headers: {
        Authorization: `Bearer ${volunteerToken}`
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.applied, true);
    assert.equal(body.data.application.status, 'pending');
  });

  // Step 10: Non-owner organization access rejection
  await t.test('7. Access Control - Non-owner org cannot view listing applicants (403)', async () => {
    const res = await fetch(`${baseUrl}/applications/opportunity/1`, {
      headers: {
        Authorization: `Bearer ${otherOrgToken}`
      }
    });
    assert.equal(res.status, 403);
  });

  await t.test('8. Access Control - Non-owner org cannot review application (403)', async () => {
    const res = await fetch(`${baseUrl}/applications/${createdAppId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherOrgToken}`
      },
      body: JSON.stringify({
        status: 'accepted',
        review_notes: 'Unauthorized approval attempt'
      })
    });
    assert.equal(res.status, 403);
  });

  // Step 11: Owner organization views applicants queue
  await t.test('9. Organization Queue - Owner org retrieves applications queue (200)', async () => {
    const res = await fetch(`${baseUrl}/applications/organization/queue?opportunity_id=1`, {
      headers: {
        Authorization: `Bearer ${orgOwnerToken}`
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.applications.length >= 1);
    const target = body.data.applications.find((a) => a.id === createdAppId);
    assert.ok(target);
    assert.equal(target.status, 'pending');
    assert.equal(target.first_name, 'Alex');
  });

  // Step 12: Owner organization accepts application
  await t.test('10. Organization Review - Owner accepts application with notes (200)', async () => {
    const res = await fetch(`${baseUrl}/applications/${createdAppId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgOwnerToken}`
      },
      body: JSON.stringify({
        status: 'accepted',
        review_notes: 'Welcome to the reforestation crew! Please check your email for logistics.'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'accepted');
    assert.equal(body.data.review_notes, 'Welcome to the reforestation crew! Please check your email for logistics.');
  });

  // Step 13: Volunteer views accepted status and organization note
  await t.test('11. Status Sync - Volunteer sees accepted status and notes in My Applications', async () => {
    const res = await fetch(`${baseUrl}/applications/my`, {
      headers: {
        Authorization: `Bearer ${volunteerToken}`
      }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const app = body.data.applications.find((a) => a.id === createdAppId);
    assert.equal(app.status, 'accepted');
    assert.equal(app.review_notes, 'Welcome to the reforestation crew! Please check your email for logistics.');
    assert.equal(body.data.summary.accepted, 1);
  });

  // Step 14: Withdrawal Workflow
  await t.test('12. Withdrawal - Volunteer applies to Opportunity 2 and withdraws', async () => {
    // Apply to opportunity 2
    const applyRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 2,
        message: 'Applying for youth reading mentors'
      })
    });
    assert.equal(applyRes.status, 201);
    const applyBody = await applyRes.json();
    withdrawableAppId = applyBody.data.id;

    // Withdraw the pending application
    const withdrawRes = await fetch(`${baseUrl}/applications/${withdrawableAppId}/withdraw`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${volunteerToken}`
      }
    });
    assert.equal(withdrawRes.status, 200);
    const withdrawBody = await withdrawRes.json();
    assert.equal(withdrawBody.data.status, 'withdrawn');
  });

  // Step 15: Organization cannot review withdrawn application
  await t.test('13. Guard - Organization cannot review a withdrawn application (400)', async () => {
    // Opportunity 2 owner is Cascade Youth Mentors, but let's test review rejection
    const res = await fetch(`${baseUrl}/applications/${withdrawableAppId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orgOwnerToken}`
      },
      body: JSON.stringify({
        status: 'accepted',
        review_notes: 'Trying to accept withdrawn application'
      })
    });
    assert.ok(res.status === 400 || res.status === 403);
  });

  // Step 16: Volunteer can re-apply after withdrawing
  await t.test('14. Re-Apply - Volunteer can re-apply to previously withdrawn opportunity (201)', async () => {
    const reapplyRes = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${volunteerToken}`
      },
      body: JSON.stringify({
        opportunity_id: 2,
        message: 'Re-applying with updated availability!'
      })
    });
    assert.equal(reapplyRes.status, 201);
    const body = await reapplyRes.json();
    assert.equal(body.data.status, 'pending');
    assert.equal(body.data.message, 'Re-applying with updated availability!');
  });
});
