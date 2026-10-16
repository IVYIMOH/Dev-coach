import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMockReply, handleCoachChat } from '../lib/coach-service.js';

test('generateMockReply detects finished task and emits DONE action', () => {
  const tasks = [
    { id: 'd1-t1', day: 1, done: false, title: 'Draft schema and ERD' },
    { id: 'd1-t2', day: 1, done: false, title: 'Setup TypeScript and ESLint' }
  ];

  const result = generateMockReply('sergeant', 1, tasks, 'finished the TypeScript task');
  assert.equal(typeof result.reply, 'string');
  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].type, 'DONE');
  assert.equal(result.actions[0].data.id, 'd1-t2');
});

test('generateMockReply detects add task pattern and emits ADD_TASK action', () => {
  const tasks = [];
  const result = generateMockReply('pragmatist', 3, tasks, 'add a task on day 5: read about RLS');

  assert.equal(result.actions.length, 1);
  assert.equal(result.actions[0].type, 'ADD_TASK');
  assert.equal(result.actions[0].data.day, 5);
  assert.equal(result.actions[0].data.title, 'read about RLS');
});

test('handleCoachChat defaults to mock when ANTHROPIC_API_KEY is unset', async () => {
  delete process.env.ANTHROPIC_API_KEY;
  const tasks = [{ id: 't-1', day: 2, done: false, title: 'Auth config' }];

  const res = await handleCoachChat({
    message: 'finished Auth config',
    currentDay: 2,
    tasks
  });

  assert.ok(res.reply.length > 0);
  assert.equal(res.actions.length, 1);
  assert.equal(res.actions[0].type, 'DONE');
  assert.equal(res.actions[0].data.id, 't-1');
});

