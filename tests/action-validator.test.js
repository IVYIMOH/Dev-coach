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

test('validateSingleAction validates ADD_TASK day boundaries, type, and schema', () => {
  const validAdd = validateSingleAction({
    type: 'ADD_TASK',
    data: { day: 5, type: 'ship', title: 'Sketch onboarding flow', proof: 'https://figma.com/test' }
  });
  assert.equal(validAdd.valid, true);
  assert.equal(validAdd.action.data.day, 5);
  assert.equal(validAdd.action.data.type, 'ship');
  assert.equal(validAdd.action.data.title, 'Sketch onboarding flow');
  assert.equal(validAdd.action.data.proof, 'https://figma.com/test');

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

test('validateSingleAction validates ADD_PROOF schema and allowlist', () => {
  const validIds = new Set(['d1-ship', 'd2-ship']);

  const validProof = validateSingleAction({
    type: 'ADD_PROOF',
    data: { id: 'd1-ship', proof: 'https://www.figma.com/file/xyz123' }
  }, validIds);

  assert.equal(validProof.valid, true);
  assert.equal(validProof.action.data.id, 'd1-ship');
  assert.equal(validProof.action.data.proof, 'https://www.figma.com/file/xyz123');

  // Unknown ID
  const unknownProof = validateSingleAction({
    type: 'ADD_PROOF',
    data: { id: 'd99-ship', proof: 'https://figma.com' }
  }, validIds);
  assert.equal(unknownProof.valid, false);

  // Empty proof
  const emptyProof = validateSingleAction({
    type: 'ADD_PROOF',
    data: { id: 'd1-ship', proof: '' }
  }, validIds);
  assert.equal(emptyProof.valid, false);
});

test('validateSingleAction validates NOTE', () => {
  const validIds = ['d3-learn'];
  const validNote = validateSingleAction({
    type: 'NOTE',
    data: { id: 'd3-learn', note: 'Customer interview insight on pricing' }
  }, validIds);
  assert.equal(validNote.valid, true);
  assert.equal(validNote.action.data.note, 'Customer interview insight on pricing');
});

test('validateActions rejects unknown action types and malicious injections', () => {
  const validIds = ['d1-ship'];
  const mixed = [
    { type: 'DONE', data: { id: 'd1-ship' } },
    { type: 'MALICIOUS_DROP_TABLE', data: { query: 'DROP TABLE' } },
    { type: 'EXEC', data: { command: 'rm -rf' } },
    { type: 'ADD_TASK', data: { day: 7, title: 'One-page case study outline', type: 'ship' } },
    null,
    undefined,
    'plain string'
  ];

  const filtered = validateActions(mixed, validIds);
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].type, 'DONE');
  assert.equal(filtered[1].type, 'ADD_TASK');
});
