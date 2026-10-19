import test from 'node:test';
import assert from 'node:assert/strict';
import { isDayCompleted, calculateStreak, getWeeklyStats } from '../lib/streak.js';

test('isDayCompleted requires all tasks on that day to be done', () => {
  const tasks = [
    { id: 'd1-learn', day: 1, type: 'learn', done: true, title: 'Learn Problem validation' },
    { id: 'd1-practice', day: 1, type: 'practice', done: true, title: 'Draft proto-persona' },
    { id: 'd1-ship', day: 1, type: 'ship', done: false, title: 'Ship Problem Canvas' },
    { id: 'd2-learn', day: 2, type: 'learn', done: true, title: 'Learn Mom Test' },
    { id: 'd2-practice', day: 2, type: 'practice', done: true, title: 'Interview script' },
    { id: 'd2-ship', day: 2, type: 'ship', done: true, title: 'Interview notes recording' }
  ];

  // Day 1 has an undone task (d1-ship) -> false
  assert.equal(isDayCompleted(tasks, 1), false);

  // Day 2 has all 3 tasks done -> true
  assert.equal(isDayCompleted(tasks, 2), true);

  // Day 3 has no tasks -> false
  assert.equal(isDayCompleted(tasks, 3), false);
});

test('calculateStreak correctly computes currentStreak, longestStreak, and shippedArtifactsCount', () => {
  const tasks = [
    // Day 1: All 3 Done
    { id: 'd1-1', day: 1, type: 'learn', done: true, title: 'T1' },
    { id: 'd1-2', day: 1, type: 'practice', done: true, title: 'T2' },
    { id: 'd1-3', day: 1, type: 'ship', done: true, title: 'T3', proof: 'https://figma.com/1' },
    // Day 2: All 3 Done
    { id: 'd2-1', day: 2, type: 'learn', done: true, title: 'T4' },
    { id: 'd2-2', day: 2, type: 'practice', done: true, title: 'T5' },
    { id: 'd2-3', day: 2, type: 'ship', done: true, title: 'T6', proof: 'https://figma.com/2' },
    // Day 3: Incomplete (ship task not done)
    { id: 'd3-1', day: 3, type: 'learn', done: true, title: 'T7' },
    { id: 'd3-2', day: 3, type: 'practice', done: true, title: 'T8' },
    { id: 'd3-3', day: 3, type: 'ship', done: false, title: 'T9' },
    // Day 4: Done
    { id: 'd4-1', day: 4, type: 'learn', done: true, title: 'T10' },
    { id: 'd4-2', day: 4, type: 'practice', done: true, title: 'T11' },
    { id: 'd4-3', day: 4, type: 'ship', done: true, title: 'T12', proof: 'https://figma.com/4' }
  ];

  // At day 4: day 3 was incomplete, so current streak from day 4 is 1
  const resAtDay4 = calculateStreak(tasks, 4);
  assert.equal(resAtDay4.currentStreak, 1);
  assert.equal(resAtDay4.longestStreak, 2); // Days 1 and 2
  assert.equal(resAtDay4.totalCompletedDays, 3);
  assert.equal(resAtDay4.shippedArtifactsCount, 3);
});

test('getWeeklyStats aggregates correctly and provides portfolio shipped artifacts', () => {
  const tasks = [
    { id: 'd1-learn', day: 1, type: 'learn', done: true, title: 'Learn 1' },
    { id: 'd1-practice', day: 1, type: 'practice', done: true, title: 'Practice 1' },
    { id: 'd1-ship', day: 1, type: 'ship', done: true, title: 'Problem Canvas', proof: 'https://figma.com/canvas' },
    { id: 'd2-ship', day: 2, type: 'ship', done: false, title: 'Interview Notes' }
  ];

  const stats = getWeeklyStats(tasks, 1);
  assert.equal(stats.week, 1);
  assert.equal(stats.startDay, 1);
  assert.equal(stats.endDay, 7);
  assert.equal(stats.shippedArtifacts.length, 2);
  assert.equal(stats.shippedArtifacts[0].title, 'Problem Canvas');
  assert.equal(stats.shippedArtifacts[0].done, true);
  assert.equal(stats.shippedArtifacts[0].proof, 'https://figma.com/canvas');
});
