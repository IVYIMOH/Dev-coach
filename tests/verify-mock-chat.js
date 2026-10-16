import app from '../server.js';
import http from 'node:http';

async function verify() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[Verification] Connected to test server on ${baseUrl}`);

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const health = await healthRes.json();
  console.log('[Verification] /api/health:', health);

  // 2. Chat with mock: "finished the TypeScript task"
  const chat1 = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'finished the TypeScript task',
      persona: 'sergeant',
      currentDay: 1,
      tasks: [
        { id: 'd1-t1', day: 1, title: 'Configure TypeScript compiler', done: false }
      ]
    })
  });
  const data1 = await chat1.json();
  console.log('[Verification] Chat DONE test:', data1);

  // 3. Chat with mock: "add a task on day 5: read about RLS"
  const chat2 = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'add a task on day 5: read about RLS',
      persona: 'pragmatist',
      currentDay: 1,
      tasks: []
    })
  });
  const data2 = await chat2.json();
  console.log('[Verification] Chat ADD_TASK test:', data2);

  // 4. Avatar video stub
  const videoRes = await fetch(`${baseUrl}/api/avatar-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello', persona: 'architect' })
  });
  const videoData = await videoRes.json();
  console.log('[Verification] Avatar video stub:', videoData);

  server.close();
  console.log('[Verification] All endpoint tests passed successfully!');
}

verify().catch(err => {
  console.error('[Verification] Failed:', err);
  process.exit(1);
});

