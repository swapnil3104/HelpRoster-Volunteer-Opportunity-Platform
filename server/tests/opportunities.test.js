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

test('Opportunity & Organization API - Full Integration Suite', async (t) => {
  const timestamp = Date.now();
  let verifiedOrgToken = '';
  let unverifiedOrgToken = '';
  let createdOpportunityId = null;
  let createdOpportunitySlug = '';

  // Step 1: Login as verified organization (contact@greenearth.org)
  await t.test('Setup: Login as verified organization representative', async () => {
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
    verifiedOrgToken = body.data.token;
  });

  // Step 2: Register a new organization (unverified, verification_status='pending')
  await t.test('Setup: Register unverified organization representative', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'organization',
        email: `unverified.org.${timestamp}@example.com`,
        password: 'Password123!',
        first_name: 'Pending',
        last_name: 'OrgLeader',
        organization_name: `Pending Org ${timestamp}`,
        organization_description: 'An unverified community group awaiting admin approval.',
        phone: '+1-555-0808'
      })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    unverifiedOrgToken = body.data.token;
  });

  // 1. Categories endpoint
  await t.test('1. Categories - GET /categories returns active list with count', async () => {
    const res = await fetch(`${baseUrl}/categories`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.ok(body.data[0].name);
    assert.ok(body.data[0].slug);
    assert.ok('opportunity_count' in body.data[0]);
  });

  // 2. Public Opportunities List
  await t.test('2. Public Discovery - GET /opportunities returns published listings only', async () => {
    const res = await fetch(`${baseUrl}/opportunities`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.meta);
    assert.ok(typeof body.meta.pagination.totalItems === 'number');

    // Verify all returned opportunities have status='published'
    body.data.forEach((opp) => {
      assert.equal(opp.status, 'published');
      assert.ok(opp.title);
      assert.ok(opp.organization.name);
      assert.ok(Array.isArray(opp.skills));
    });
  });

  // 3. Multi-Criteria Filtering
  await t.test('3. Public Discovery - Search keyword filtering', async () => {
    const res = await fetch(`${baseUrl}/opportunities?search=Reforestation`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length >= 1);
    assert.ok(body.data[0].title.includes('Reforestation'));
  });

  await t.test('4. Public Discovery - Location type filter', async () => {
    const res = await fetch(`${baseUrl}/opportunities?location_type=hybrid`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    body.data.forEach((opp) => {
      assert.equal(opp.location_type, 'hybrid');
    });
  });

  // 5. Opportunity Details
  await t.test('5. Opportunity Details - Lookup by slug or ID', async () => {
    const res = await fetch(`${baseUrl}/opportunities/urban-reforestation-native-tree-planting`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.title, 'Urban Reforestation & Native Tree Planting');
    assert.ok(body.data.organization);
    assert.ok(body.data.category);
    assert.ok(Array.isArray(body.data.skills));
    assert.ok(body.data.skills.includes('Gardening & Landscaping'));
  });

  // 6. Organization Directory & Profile
  await t.test('6. Organizations Directory - GET /organizations', async () => {
    const res = await fetch(`${baseUrl}/organizations`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
    const greenEarth = body.data.find((o) => o.name === 'Green Earth Alliance');
    assert.ok(greenEarth);
    assert.equal(greenEarth.verification_status, 'verified');
    assert.ok(greenEarth.active_opportunities_count >= 1);
  });

  await t.test('7. Organization Profile - GET /organizations/:id includes published opps', async () => {
    const res = await fetch(`${baseUrl}/organizations/1`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.name, 'Green Earth Alliance');
    assert.ok(Array.isArray(body.data.opportunities));
    assert.ok(body.data.opportunities.length >= 1);
  });

  // 8. Management: Verification Gate (DEC-001 / TASK-019)
  await t.test('8. Verification Gate - Unverified organization cannot publish', async () => {
    const res = await fetch(`${baseUrl}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedOrgToken}`
      },
      body: JSON.stringify({
        title: 'Unauthorized Published Attempt',
        description: 'Trying to publish without admin verification check.',
        location_type: 'on_site',
        location: 'Seattle, WA',
        start_date: '2026-12-01',
        application_deadline: '2026-11-25 23:59:59',
        status: 'published'
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ORG_NOT_VERIFIED');
  });

  // 9. Management: Unverified organization CAN save draft
  await t.test('9. Management - Unverified organization can save draft', async () => {
    const res = await fetch(`${baseUrl}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedOrgToken}`
      },
      body: JSON.stringify({
        title: 'Draft Community Event',
        description: 'Saving a draft before getting verified by platform administrators.',
        location_type: 'on_site',
        location: 'Portland, OR',
        start_date: '2026-12-10',
        application_deadline: '2026-12-01 23:59:59',
        status: 'draft'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'draft');
  });

  // 10. Management: Verified organization can create published opportunity
  await t.test('10. Management - Verified org creates published opportunity', async () => {
    const res = await fetch(`${baseUrl}/opportunities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${verifiedOrgToken}`
      },
      body: JSON.stringify({
        title: `Riverside Habitat Restoration ${timestamp}`,
        category_id: 2,
        description: 'Volunteers will plant riparian vegetation to stabilize riverbanks and improve salmon habitat.',
        requirements: 'Sturdy boots and rain gear required.',
        responsibilities: 'Planting willows, setting erosion fabric, watering.',
        location_type: 'on_site',
        location: 'Cedar River Watershed, WA',
        start_date: '2026-11-30',
        end_date: '2026-11-30',
        application_deadline: '2026-11-28 18:00:00',
        commitment_hours: 5,
        capacity: 25,
        status: 'published',
        skills: ['Riparian Restoration', 'Trail Work', 'Teamwork']
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'published');
    createdOpportunityId = body.data.id;
    createdOpportunitySlug = body.data.slug;
    assert.ok(createdOpportunityId);
  });

  // 11. Management: Ownership enforcement - Unverified org cannot edit verified org opportunity
  await t.test('11. Ownership Protection - Other org cannot edit opportunity (403)', async () => {
    const res = await fetch(`${baseUrl}/opportunities/${createdOpportunityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unverifiedOrgToken}`
      },
      body: JSON.stringify({
        title: 'Malicious Hijack Attempt'
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // 12. Management: Owner can update own opportunity
  await t.test('12. Management - Owner successfully updates opportunity', async () => {
    const res = await fetch(`${baseUrl}/opportunities/${createdOpportunityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${verifiedOrgToken}`
      },
      body: JSON.stringify({
        title: `Riverside Habitat Restoration Updated ${timestamp}`,
        commitment_hours: 6
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
  });

  // 13. Management: Lifecycle Status change (published -> closed)
  await t.test('13. Management - Owner updates status to closed', async () => {
    const res = await fetch(`${baseUrl}/opportunities/${createdOpportunityId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${verifiedOrgToken}`
      },
      body: JSON.stringify({
        status: 'closed'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'closed');
  });

  // 14. Management: List org opportunities for workspace
  await t.test('14. Management - GET /opportunities/manage returns org listings', async () => {
    const res = await fetch(`${baseUrl}/opportunities/manage`, {
      headers: {
        Authorization: `Bearer ${verifiedOrgToken}`
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    const found = body.data.find((o) => o.id === createdOpportunityId);
    assert.ok(found);
    assert.equal(found.status, 'closed');
  });
});
