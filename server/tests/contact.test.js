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
  try {
    await pool.query("DELETE FROM contact_submissions WHERE email = 'test_contact@example.org'");
  } catch (e) {
    // ignore
  }
  await pool.end();
});

test('1. Contact Submission - Success with valid data (201)', async () => {
  const payload = {
    name: 'Sarah Connor',
    email: 'test_contact@example.org',
    subject: 'Volunteer inquiry for environmental cleanups',
    message: 'Hello, I would like to inquire about how our youth group can register.'
  };

  const res = await fetch(`${baseUrl}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.success, true);
  assert.ok(body.data.id, 'Expected an insert ID returned');
  assert.equal(body.data.status, 'new');

  // Verify record in database
  const [rows] = await pool.query(
    'SELECT * FROM contact_submissions WHERE id = ?',
    [body.data.id]
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Sarah Connor');
  assert.equal(rows[0].email, 'test_contact@example.org');
});

test('2. Contact Submission - Fails on invalid email and short message (400)', async () => {
  const res = await fetch(`${baseUrl}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'A',
      email: 'invalid-email',
      subject: 'Hi',
      message: 'Short'
    })
  });

  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.ok(body.error);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(Array.isArray(body.error.details));
});

test('3. Public Stats - Returns database-backed platform metrics (200)', async () => {
  const res = await fetch(`${baseUrl}/public/stats`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(typeof body.data.total_opportunities === 'number');
  assert.ok(typeof body.data.total_organizations === 'number');
  assert.ok(typeof body.data.total_volunteers === 'number');
  assert.ok(typeof body.data.verified_hours === 'number');
});

test('4. Featured Opportunities - Returns active published list (200)', async () => {
  const res = await fetch(`${baseUrl}/public/featured-opportunities`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
});
