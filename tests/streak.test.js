import test from 'node:test';
import assert from 'node:assert/strict';
import { isDayCompleted, calculateStreak, getWeeklyStats } from '../lib/streak.js';

test('isDayCompleted requires all tasks on that day to be done', () => {
  const tasks = [
    { id: '1', day: 1, done: true, title: 'T1' },
    { id: '2', day: 1, done: false, title: 'T2' },
    { id: '3', day: 2, done: true, title: 'T3' }
  ];

  // Day 1 has an undone task -> false
  assert.equal(isDayCompleted(tasks, 1), false);

  // Day 2 has all tasks done -> true
  assert.equal(isDayCompleted(tasks, 2), true);

  // Day 3 has no tasks -> false
  assert.equal(isDayCompleted(tasks, 3), false);
});

test('calculateStreak correctly computes currentStreak and longestStreak', () => {
  const tasks = [
    // Day 1: Done
    { id: 'd1-1', day: 1, done: true, title: 'T1' },
    // Day 2: Done
    { id: 'd2-1', day: 2, done: true, title: 'T2' },
    // Day 3: Undone task exists
    { id: 'd3-1', day: 3, done: true, title: 'T3' },
    { id: 'd3-2', day: 3, done: false, title: 'T4' },
    // Day 4: Done
    { id: 'd4-1', day: 4, done: true, title: 'T5' },
    // Day 5: Done
    { id: 'd5-1', day: 5, done: true, title: 'T6' },
    // Day 6: Done
    { id: 'd6-1', day: 6, done: true, title: 'T7' }
  ];

  // If current day is 6, days 4, 5, 6 are done (Day 3 was incomplete) -> streak is 3
  const resAtDay6 = calculateStreak(tasks, 6);
  assert.equal(resAtDay6.currentStreak, 3);
  assert.equal(resAtDay6.longestStreak, 3);
  assert.equal(resAtDay6.totalCompletedDays, 5);

  // If current day is 7 (working on day 7, day 6 was done) -> active streak preserved from day 6 = 3
  const resAtDay7 = calculateStreak(tasks, 7);
  assert.equal(resAtDay7.currentStreak, 3);

  // If current day is 2 -> days 1 and 2 done -> streak = 2
  const resAtDay2 = calculateStreak(tasks, 2);
  assert.equal(resAtDay2.currentStreak, 2);
});

test('getWeeklyStats aggregates correctly for 7-day blocks', () => {
  const tasks = [
    { id: 'w1-1', day: 1, done: true, title: 'T1' },
    { id: 'w1-2', day: 2, done: true, title: 'T2' },
    { id: 'w1-3', day: 3, done: false, title: 'T3' }
  ];

  const stats = getWeeklyStats(tasks, 1);
  assert.equal(stats.week, 1);
  assert.equal(stats.startDay, 1);
  assert.equal(stats.endDay, 7);
  assert.equal(stats.completedDays, 2);
  assert.equal(stats.totalDays, 7);
  assert.equal(stats.isComplete, false);
});

