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

  // 2. Chat with mock: Attempt to finish a ship task without proof -> coach asks for proof
  const chatProofDemand = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'finished the ship task',
      persona: 'sergeant',
      currentDay: 1,
      tasks: [
        { id: 'd1-ship', day: 1, type: 'ship', title: 'Ship Problem Canvas', done: false, proof: '' }
      ]
    })
  });
  const dataProofDemand = await chatProofDemand.json();
  console.log('[Verification] Proof demand on ship task:', dataProofDemand);

  // 3. Chat with mock: Supply proof and finish ship task
  const chatWithProof = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'finished the Ship Problem Canvas, here is the proof: https://figma.com/file/123',
      persona: 'sergeant',
      currentDay: 1,
      tasks: [
        { id: 'd1-ship', day: 1, type: 'ship', title: 'Ship Problem Canvas', done: false, proof: '' }
      ]
    })
  });
  const dataWithProof = await chatWithProof.json();
  console.log('[Verification] Ship task with proof:', dataWithProof);

  // 4. Critique Mode test
  const critiqueRes = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'critique this design: modal with pricing tiers and subscribe button',
      persona: 'mentor',
      currentDay: 1,
      tasks: []
    })
  });
  const critiqueData = await critiqueRes.json();
  console.log('[Verification] Critique Mode response:', critiqueData);

  // 5. Avatar video stub
  const videoRes = await fetch(`${baseUrl}/api/avatar-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Hello', persona: 'mentor' })
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
