import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMockReply, handleCoachChat } from '../lib/coach-service.js';

test('generateMockReply asks for proof when attempting to complete a ship task without proof', () => {
  const tasks = [
    { id: 'd1-learn', day: 1, type: 'learn', done: true, title: 'Learn problem validation' },
    { id: 'd1-practice', day: 1, type: 'practice', done: true, title: 'Draft proto-persona' },
    { id: 'd1-ship', day: 1, type: 'ship', done: false, title: 'Ship Problem Canvas', proof: '' }
  ];

  // User claims finished the ship task without providing proof link or note
  const result = generateMockReply('sergeant', 1, tasks, 'finished the ship task');
  assert.equal(typeof result.reply, 'string');
  assert.ok(result.reply.toLowerCase().includes('proof') || result.reply.toLowerCase().includes('artifact'));
  // Should NOT emit DONE action yet because proof is required
  assert.equal(result.actions.length, 0);
});

test('generateMockReply marks ship task DONE and adds proof when URL is provided', () => {
  const tasks = [
    { id: 'd1-ship', day: 1, type: 'ship', done: false, title: 'Ship Problem Canvas', proof: '' }
  ];

  const result = generateMockReply('sergeant', 1, tasks, 'finished Ship Problem Canvas, here is the link: https://figma.com/file/123');
  assert.equal(typeof result.reply, 'string');
  assert.ok(result.actions.some(a => a.type === 'ADD_PROOF' && a.data.proof === 'https://figma.com/file/123'));
  assert.ok(result.actions.some(a => a.type === 'DONE' && a.data.id === 'd1-ship'));
});

test('generateMockReply provides structured critique on hierarchy, clarity, and accessibility', () => {
  const tasks = [];
  const result = generateMockReply('mentor', 1, tasks, 'critique this design: checkout screen with high contrast buy button');

  assert.equal(typeof result.reply, 'string');
  assert.ok(result.reply.includes('Hierarchy'));
  assert.ok(result.reply.includes('Clarity'));
  assert.ok(result.reply.includes('Accessibility'));
});

test('generateMockReply detects add task pattern and preserves day and title', () => {
  const tasks = [];
  const result = generateMockReply('hype', 3, tasks, 'add a task on day 5: sketch onboarding flow');

  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].type, 'ADD_TASK');
  assert.equal(result.actions[0].data.day, 5);
  assert.equal(result.actions[0].data.title, 'sketch onboarding flow');
});

test('handleCoachChat defaults to mock when ANTHROPIC_API_KEY is unset', async () => {
  delete process.env.ANTHROPIC_API_KEY;
  const tasks = [
    { id: 'd2-practice', day: 2, type: 'practice', done: false, title: 'Interview script' }
  ];

  const res = await handleCoachChat({
    persona: 'sergeant',
    message: 'finished interview script',
    currentDay: 2,
    tasks
  });

  assert.ok(res.reply.length > 0);
  assert.equal(res.actions.length, 1);
  assert.equal(res.actions[0].type, 'DONE');
  assert.equal(res.actions[0].data.id, 'd2-practice');
});
