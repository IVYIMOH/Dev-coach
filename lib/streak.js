/**
 * Design Coach - 18-Day Streak & Portfolio Challenge Logic
 * A day counts as completed ONLY if all its tasks are marked done (and it has at least 1 task).
 */

export const TOTAL_CHALLENGE_DAYS = 18;
export const DAYS_PER_SPRINT = 6;

/**
 * Checks whether a specific day is fully completed.
 * @param {Array<{ day: number, done: boolean }>} tasks
 * @param {number} dayNumber
 * @returns {boolean}
 */
export function isDayCompleted(tasks, dayNumber) {
  if (!Array.isArray(tasks) || typeof dayNumber !== 'number') return false;
  const dayTasks = tasks.filter(t => t.day === dayNumber);
  if (dayTasks.length === 0) return false;
  return dayTasks.every(t => Boolean(t.done));
}

/**
 * Computes challenge stats, current streak, longest streak, and completion map for 18 days.
 * @param {Array<{ id: string, day: number, done: boolean, type?: string, title: string, proof?: string }>} tasks
 * @param {number} [currentDay=1]
 */
export function calculateStreak(tasks, currentDay = 1) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeCurrentDay = Math.min(TOTAL_CHALLENGE_DAYS, Math.max(1, Number(currentDay) || 1));

  const dayStatus = {};
  const completedDays = [];

  for (let d = 1; d <= TOTAL_CHALLENGE_DAYS; d++) {
    const completed = isDayCompleted(safeTasks, d);
    dayStatus[d] = completed;
    if (completed) {
      completedDays.push(d);
    }
  }

  // Longest streak across 18 days
  let longestStreak = 0;
  let runningStreak = 0;
  for (let d = 1; d <= TOTAL_CHALLENGE_DAYS; d++) {
    if (dayStatus[d]) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  // Current streak calculation
  let currentStreak = 0;
  let startCheckDay = 0;

  if (dayStatus[safeCurrentDay]) {
    startCheckDay = safeCurrentDay;
  } else if (safeCurrentDay > 1 && dayStatus[safeCurrentDay - 1]) {
    startCheckDay = safeCurrentDay - 1;
  }

  if (startCheckDay > 0) {
    for (let d = startCheckDay; d >= 1; d--) {
      if (dayStatus[d]) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  const progressPercent = Math.round((completedDays.length / TOTAL_CHALLENGE_DAYS) * 100);
  const shippedArtifacts = safeTasks.filter(t => t.type === 'ship' && t.done);

  return {
    currentStreak,
    longestStreak,
    completedDays,
    totalCompletedDays: completedDays.length,
    dayStatus,
    progressPercent,
    shippedArtifactsCount: shippedArtifacts.length,
    totalChallengeDays: TOTAL_CHALLENGE_DAYS
  };
}

/**
 * Generates structured recap stats for Sprint 1 (Days 1-6), Sprint 2 (Days 7-12), or Sprint 3 (Days 13-18),
 * including portfolio progress listing shipped artifacts and proof links.
 * @param {Array<object>} tasks
 * @param {number} sprintNumber (1, 2, or 3)
 */
export function getWeeklyStats(tasks, sprintNumber) {
  const sprint = Math.min(3, Math.max(1, Number(sprintNumber) || 1));
  const startDay = (sprint - 1) * DAYS_PER_SPRINT + 1;
  const endDay = startDay + DAYS_PER_SPRINT - 1;

  const sprintTasks = (tasks || []).filter(t => t.day >= startDay && t.day <= endDay);
  const doneTasks = sprintTasks.filter(t => t.done);

  let completedDaysCount = 0;
  for (let d = startDay; d <= endDay; d++) {
    if (isDayCompleted(tasks, d)) completedDaysCount++;
  }

  const sprintTitles = {
    1: 'Sprint 1 (Days 1–6): Problem Discovery & Strategic Architecture',
    2: 'Sprint 2 (Days 7–12): Figma Systems, Visual Polish & Prototyping',
    3: 'Sprint 3 (Days 13–18): Hardening, Engineering Handoff & Portfolio Launch'
  };

  const shippedArtifacts = sprintTasks
    .filter(t => t.type === 'ship')
    .map(t => ({
      id: t.id,
      day: t.day,
      title: t.title,
      done: Boolean(t.done),
      proof: t.proof || ''
    }));

  return {
    week: sprint,
    sprint,
    title: sprintTitles[sprint],
    startDay,
    endDay,
    completedDays: completedDaysCount,
    totalDays: DAYS_PER_SPRINT,
    completedTasks: doneTasks.length,
    totalTasks: sprintTasks.length,
    isComplete: completedDaysCount === DAYS_PER_SPRINT,
    percent: sprintTasks.length ? Math.round((doneTasks.length / sprintTasks.length) * 100) : 0,
    shippedArtifacts
  };
}
