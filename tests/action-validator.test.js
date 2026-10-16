import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSingleAction, validateActions, ALLOWED_ACTION_TYPES } from '../lib/action-validator.js';

test('validateSingleAction validates DONE and UNDONE with known IDs', () => {
  const validIds = new Set(['task-1', 'task-2']);

  const validDone = validateSingleAction({ type: 'DONE', data: { id: 'task-1' } }, validIds);
  assert.equal(validDone.valid, true);
  assert.deepEqual(validDone.action, { type: 'DONE', data: { id: 'task-1' } });

  const validUndone = validateSingleAction({ type: 'UNDONE', data: { id: 'task-2' } }, validIds);
  assert.equal(validUndone.valid, true);

  // Unknown ID
  const unknownId = validateSingleAction({ type: 'DONE', data: { id: 'task-999' } }, validIds);
  assert.equal(unknownId.valid, false);

  // Missing or malformed ID
  const missingId = validateSingleAction({ type: 'DONE', data: {} }, validIds);
  assert.equal(missingId.valid, false);
});

test('validateSingleAction validates ADD_TASK day boundaries and schema', () => {
  const validAdd = validateSingleAction({
    type: 'ADD_TASK',
    data: { day: 5, title: 'Read about RLS', note: 'Security chapter' }
  });
  assert.equal(validAdd.valid, true);
  assert.equal(validAdd.action.data.day, 5);
  assert.equal(validAdd.action.data.title, 'Read about RLS');

  // Day out of 1-21 range
  const invalidDay = validateSingleAction({
    type: 'ADD_TASK',
    data: { day: 22, title: 'Day 22 task' }
  });
  assert.equal(invalidDay.valid, false);

  const invalidDayZero = validateSingleAction({
    type: 'ADD_TASK',
    data: { day: 0, title: 'Day 0 task' }
  });
  assert.equal(invalidDayZero.valid, false);

  // Missing title
  const missingTitle = validateSingleAction({
    type: 'ADD_TASK',
    data: { day: 3 }
  });
  assert.equal(missingTitle.valid, false);
});

test('validateSingleAction validates NOTE', () => {
  const validIds = ['task-10'];
  const validNote = validateSingleAction({
    type: 'NOTE',
    data: { id: 'task-10', note: 'Blocked by database migration' }
  }, validIds);
  assert.equal(validNote.valid, true);
  assert.equal(validNote.action.data.note, 'Blocked by database migration');
});

test('validateActions rejects unknown action types and malicious injections', () => {
  const validIds = ['task-1'];
  const mixed = [
    { type: 'DONE', data: { id: 'task-1' } },
    { type: 'MALICIOUS_DROP_TABLE', data: { query: 'DROP TABLE' } },
    { type: 'EXEC', data: { command: 'rm -rf' } },
    { type: 'ADD_TASK', data: { day: 7, title: 'System architecture review' } },
    null,
    undefined,
    'plain string'
  ];

  const filtered = validateActions(mixed, validIds);
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].type, 'DONE');
  assert.equal(filtered[1].type, 'ADD_TASK');
});

