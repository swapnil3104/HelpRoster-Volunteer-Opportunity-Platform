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

test('Platform Security Hardening & Vulnerability Resilience', async (t) => {
  const timestamp = Date.now();
  const volunteerEmail = `sec_vol_${timestamp}@example.com`;
  const orgEmail = `sec_org_${timestamp}@example.com`;
  const adminEmail = 'admin@helproster.org';
  const commonPassword = 'Password123!';

  let volunteerCookie;
  let orgCookie;
  let adminCookie;

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

  await t.test('Setup: Authenticate volunteer, organization, and admin personas', async () => {
    // Admin login
    const adminRes = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: commonPassword }
    });
    assert.equal(adminRes.status, 200);
    adminCookie = extractCookie(adminRes);
    assert.ok(adminCookie);

    // Register & login fresh volunteer
    const volRes = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: {
        role: 'volunteer',
        email: volunteerEmail,
        password: commonPassword,
        first_name: 'Sec',
        last_name: 'Volunteer'
      }
    });
    assert.equal(volRes.status, 201);
    volunteerCookie = extractCookie(volRes);
    assert.ok(volunteerCookie);

    // Register & login fresh organization
    const orgRes = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: {
        role: 'organization',
        email: orgEmail,
        password: commonPassword,
        first_name: 'Sec',
        last_name: 'OrgDirector',
        organization_name: `Sec Guard Org ${timestamp}`,
        organization_description: 'Safety and security initiative testing'
      }
    });
    assert.equal(orgRes.status, 201);
    orgCookie = extractCookie(orgRes);
    assert.ok(orgCookie);
  });

  await t.test('1. Security Headers - Helmet headers are enforced', async () => {
    const res = await makeRequest('/api/v1/health');
    assert.equal(res.status, 200);
    assert.ok(res.headers['x-dns-prefetch-control'], 'X-DNS-Prefetch-Control header should be set');
    assert.ok(res.headers['x-frame-options'], 'X-Frame-Options header should be set');
    assert.ok(res.headers['x-content-type-options'], 'X-Content-Type-Options header should be set');
  });

  await t.test('2. SQL Injection Defense - Search parameters with SQL injection syntax', async () => {
    const sqliPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "admin' --",
      "1 UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22",
      "' OR 1=1#"
    ];

    for (const payload of sqliPayloads) {
      const res = await makeRequest(`/api/v1/opportunities?search=${encodeURIComponent(payload)}`);
      assert.equal(res.status, 200, `Payload ${payload} should return 200 without executing injection`);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data), 'Should return normal opportunities array');
    }
  });

  await t.test('3. SQL Injection Defense - Malicious sort query parameter is ignored/whitelisted', async () => {
    const res = await makeRequest('/api/v1/opportunities?sort=id;DROP+TABLE+users;--');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  await t.test('4. SQL Injection Defense - Auth login with injection payload fails cleanly', async () => {
    const res = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: "' OR '1'='1' --",
        password: "password"
      }
    });
    assert.ok([400, 401].includes(res.status), `Status should be 400 or 401, got ${res.status}`);
    assert.equal(res.body.success, false);
  });

  await t.test('5. RBAC Protection - Unauthenticated access to protected routes returns 401', async () => {
    const endpoints = [
      { path: '/api/v1/auth/me', method: 'GET' },
      { path: '/api/v1/applications/my', method: 'GET' },
      { path: '/api/v1/hours/my', method: 'GET' },
      { path: '/api/v1/dashboard/volunteer', method: 'GET' },
      { path: '/api/v1/dashboard/organization', method: 'GET' },
      { path: '/api/v1/admin/stats', method: 'GET' },
      { path: '/api/v1/admin/users', method: 'GET' }
    ];

    for (const ep of endpoints) {
      const res = await makeRequest(ep.path, { method: ep.method });
      assert.equal(res.status, 401, `Endpoint ${ep.path} must require authentication`);
      assert.equal(res.body.success, false);
    }
  });

  await t.test('6. RBAC Protection - Volunteer forbidden from accessing organization routes (403)', async () => {
    const orgEndpoints = [
      { path: '/api/v1/opportunities', method: 'POST', body: { title: 'Unauthorized' } },
      { path: '/api/v1/dashboard/organization', method: 'GET' },
      { path: '/api/v1/hours/organization', method: 'GET' },
      { path: '/api/v1/applications/organization/queue', method: 'GET' }
    ];

    for (const ep of orgEndpoints) {
      const res = await makeRequest(ep.path, {
        method: ep.method,
        headers: { Cookie: volunteerCookie },
        body: ep.body
      });
      assert.equal(res.status, 403, `Volunteer must receive 403 for ${ep.path}`);
      assert.equal(res.body.success, false);
    }
  });

  await t.test('7. RBAC Protection - Organization forbidden from accessing admin routes (403)', async () => {
    const adminEndpoints = [
      { path: '/api/v1/admin/stats', method: 'GET' },
      { path: '/api/v1/admin/users', method: 'GET' },
      { path: '/api/v1/admin/organizations', method: 'GET' },
      { path: '/api/v1/admin/opportunities', method: 'GET' },
      { path: '/api/v1/admin/audit-logs', method: 'GET' },
      { path: '/api/v1/admin/contact-submissions', method: 'GET' }
    ];

    for (const ep of adminEndpoints) {
      const res = await makeRequest(ep.path, {
        method: ep.method,
        headers: { Cookie: orgCookie }
      });
      assert.equal(res.status, 403, `Organization must receive 403 for ${ep.path}`);
      assert.equal(res.body.success, false);
    }
  });

  await t.test('8. Rate Limiting Headers - Authentication endpoints include rate limit headers', async () => {
    const res = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: commonPassword }
    });
    assert.equal(res.status, 200);
    assert.ok(
      res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit'],
      'Rate limit header should be present on auth endpoints'
    );
  });

  await t.test('9. Safe Error Disclosure - 404 and invalid routes return sanitized JSON', async () => {
    const res = await makeRequest('/api/v1/non-existent-endpoint-test-route');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.equal(typeof res.body.error.message, 'string');
    assert.equal(res.body.error.stack, undefined);
  });

  await t.test('10. Tampered Token Defense - Invalid JWT signatures are rejected', async () => {
    const tamperedCookie = 'helproster_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsig';
    const res = await makeRequest('/api/v1/auth/me', {
      headers: { Cookie: tamperedCookie }
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_TOKEN');
  });
});
