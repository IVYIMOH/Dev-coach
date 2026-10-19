/**
 * Design Coach - Streak & Portfolio Challenge Logic (Client ES Module)
 * A day counts as completed ONLY if all its tasks are marked done (and it has at least 1 task).
 */

export function isDayCompleted(tasks, dayNumber) {
  if (!Array.isArray(tasks) || typeof dayNumber !== 'number') return false;
  const dayTasks = tasks.filter(t => t.day === dayNumber);
  if (dayTasks.length === 0) return false;
  return dayTasks.every(t => Boolean(t.done));
}

export function calculateStreak(tasks, currentDay = 1) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeCurrentDay = Math.min(21, Math.max(1, Number(currentDay) || 1));

  const dayStatus = {};
  const completedDays = [];

  for (let d = 1; d <= 21; d++) {
    const completed = isDayCompleted(safeTasks, d);
    dayStatus[d] = completed;
    if (completed) {
      completedDays.push(d);
    }
  }

  // Longest streak across 21 days
  let longestStreak = 0;
  let runningStreak = 0;
  for (let d = 1; d <= 21; d++) {
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

  const progressPercent = Math.round((completedDays.length / 21) * 100);
  const shippedArtifacts = safeTasks.filter(t => t.type === 'ship' && t.done);

  return {
    currentStreak,
    longestStreak,
    completedDays,
    totalCompletedDays: completedDays.length,
    dayStatus,
    progressPercent,
    shippedArtifactsCount: shippedArtifacts.length
  };
}

export function getWeeklyStats(tasks, weekNumber) {
  const week = Math.min(3, Math.max(1, Number(weekNumber) || 1));
  const startDay = (week - 1) * 7 + 1;
  const endDay = startDay + 6;

  const weekTasks = (tasks || []).filter(t => t.day >= startDay && t.day <= endDay);
  const doneTasks = weekTasks.filter(t => t.done);

  let completedDaysCount = 0;
  for (let d = startDay; d <= endDay; d++) {
    if (isDayCompleted(tasks, d)) completedDaysCount++;
  }

  const weekTitles = {
    1: 'Week 1: Research, Strategy & Architecture',
    2: 'Week 2: Figma Mastery & Iterative Prototyping',
    3: 'Week 3: Accessibility, Systems & Portfolio Storytelling'
  };

  const shippedArtifacts = weekTasks
    .filter(t => t.type === 'ship')
    .map(t => ({
      id: t.id,
      day: t.day,
      title: t.title,
      done: Boolean(t.done),
      proof: t.proof || ''
    }));

  return {
    week,
    title: weekTitles[week],
    startDay,
    endDay,
    completedDays: completedDaysCount,
    totalDays: 7,
    completedTasks: doneTasks.length,
    totalTasks: weekTasks.length,
    isComplete: completedDaysCount === 7,
    percent: weekTasks.length ? Math.round((doneTasks.length / weekTasks.length) * 100) : 0,
    shippedArtifacts
  };
}
