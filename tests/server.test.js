import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server.js';
import http from 'node:http';

let server;
let baseUrl;

test.before(() => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(() => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /api/health returns ok status and mockMode indicator', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(typeof data.mockMode, 'boolean');
});

test('POST /api/chat rejects empty message with 400', async () => {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' })
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('non-empty'));
});

test('POST /api/chat rejects messages longer than 2000 characters', async () => {
  const longMsg = 'a'.repeat(2001);
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: longMsg })
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('2000'));
});

test('POST /api/chat responds with JSON reply and actions in mock mode', async () => {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'finished the interview script',
      persona: 'sergeant',
      currentDay: 2,
      tasks: [
        { id: 'd2-practice', day: 2, type: 'practice', done: false, title: 'Draft interview script' }
      ]
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(typeof data.reply, 'string');
  assert.ok(Array.isArray(data.actions));
  assert.equal(data.actions[0].type, 'DONE');
  assert.equal(data.actions[0].data.id, 'd2-practice');
});

test('POST /api/avatar-video returns 501 when no provider key configured', async () => {
  const res = await fetch(`${baseUrl}/api/avatar-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello', persona: 'mentor' })
  });
  assert.equal(res.status, 501);
  const data = await res.json();
  assert.equal(data.enabled, false);
});

test('Security headers include Content-Security-Policy', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  const csp = res.headers.get('content-security-policy');
  assert.ok(csp, 'CSP header should be present');
  assert.ok(csp.includes("default-src 'self'"));
});
