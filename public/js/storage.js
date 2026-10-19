/**
 * Design Coach - Storage Module
 * Persistence interface wrapping localStorage.
 * Async methods for future SQLite / Postgres migration.
 * Handles JSON progress backup and schema-validated import.
 */

import { INITIAL_TASKS } from './initial-tasks.js';

const STORAGE_KEY = 'design_coach_state_v3';

export function getDefaultState() {
  return {
    version: 3,
    currentDay: 1,
    persona: 'sergeant',
    theme: 'light',
    soundMuted: false,
    notificationsEnabled: false,
    morningTime: '09:00',
    eveningTime: '18:00',
    lastNotificationDate: null,
    tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
    messages: [
      {
        id: 'msg-welcome',
        role: 'ai',
        sender: 'Sergeant Stern',
        text: "Welcome to Design Coach! You've got 21 days to transition from a visual decorator to a high-impact Product Designer. Every day has 3 tasks: Learn (45m), Practice, and Ship. I demand proof before I sign off on your Ship tasks. Chat with me, drop Figma links, run Standup, or request a Design Critique!",
        timestamp: new Date().toISOString()
      }
    ],
    pomodoro: {
      workMinutes: 25,
      breakMinutes: 5,
      completedSessions: 0
    },
    updatedAt: new Date().toISOString()
  };
}

export const Storage = {
  /**
   * Retrieves the current application state.
   * @returns {Promise<object>}
   */
  async getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getDefaultState();
        await this.setState(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);

      // Verify task format matches product designer curriculum with types
      const isDesignCurriculum = Array.isArray(parsed.tasks) && parsed.tasks.some(t => t.type === 'ship');
      if (!isDesignCurriculum) {
        const fresh = getDefaultState();
        await this.setState(fresh);
        return fresh;
      }

      return {
        ...getDefaultState(),
        ...parsed,
        tasks: Array.isArray(parsed.tasks) && parsed.tasks.length ? parsed.tasks : getDefaultState().tasks
      };
    } catch (e) {
      console.warn('Storage read failed, falling back to defaults', e);
      return getDefaultState();
    }
  },

  /**
   * Persists application state.
   * @param {object} state
   * @returns {Promise<void>}
   */
  async setState(state) {
    try {
      const payload = {
        ...state,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Storage write failed', e);
      throw new Error('Failed to save state to localStorage');
    }
  },

  /**
   * Resets all progress back to original challenge curriculum.
   */
  async resetState() {
    const fresh = getDefaultState();
    await this.setState(fresh);
    return fresh;
  },

  /**
   * Exports progress as a JSON string and triggers browser file download.
   */
  async exportProgressFile() {
    const state = await this.getState();
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-coach-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Validates and imports a JSON backup string.
   * @param {string} jsonString
   * @returns {Promise<{ success: boolean, state?: object, error?: string }>}
   */
  async importProgressJson(jsonString) {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        return { success: false, error: 'Empty import file' };
      }
      const data = JSON.parse(jsonString);

      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Imported data is not a valid JSON object' };
      }

      if (!Array.isArray(data.tasks)) {
        return { success: false, error: 'Missing or invalid "tasks" array in backup file' };
      }

      // Sanitize imported tasks
      const sanitizedTasks = data.tasks.map((t, idx) => ({
        id: String(t.id || `task-${idx}`),
        day: Math.min(21, Math.max(1, Number(t.day) || 1)),
        type: ['learn', 'practice', 'ship'].includes(String(t.type).toLowerCase()) ? String(t.type).toLowerCase() : 'practice',
        title: String(t.title || 'Untitled task').slice(0, 200),
        done: Boolean(t.done),
        proof: t.proof ? String(t.proof).slice(0, 500) : '',
        note: t.note ? String(t.note).slice(0, 500) : ''
      }));

      const merged = {
        ...getDefaultState(),
        ...data,
        tasks: sanitizedTasks,
        currentDay: Math.min(21, Math.max(1, Number(data.currentDay) || 1))
      };

      await this.setState(merged);
      return { success: true, state: merged };
    } catch (err) {
      return { success: false, error: `JSON Parse error: ${err.message}` };
    }
  }
};
