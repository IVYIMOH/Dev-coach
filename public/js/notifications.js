/**
 * Dev Coach - Browser Notifications Scheduler
 * Triggers scheduled morning and evening accountability check-ins in persona voice.
 */

import { PERSONAS } from './personas.js';

class NotificationManager {
  constructor() {
    this.intervalId = null;
    this.lastTriggeredDate = {
      morning: null,
      evening: null
    };
  }

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  send(title, body, icon = '/icons/icon-192.svg') {
    if (!this.isSupported() || Notification.permission !== 'granted') return null;

    try {
      const notif = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: 'dev-coach-reminder'
      });
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return notif;
    } catch (e) {
      console.warn('Failed to display browser notification:', e);
      return null;
    }
  }

  /**
   * Starts periodic checker for scheduled morning/evening check-in times.
   * @param {() => object} getStateFn
   */
  startScheduler(getStateFn) {
    if (this.intervalId) clearInterval(this.intervalId);

    this.checkSchedule(getStateFn);
    this.intervalId = setInterval(() => this.checkSchedule(getStateFn), 60 * 1000);
  }

  checkSchedule(getStateFn) {
    if (Notification.permission !== 'granted') return;

    const state = getStateFn();
    if (!state || !state.notificationsEnabled) return;

    const persona = PERSONAS[state.persona] || PERSONAS.pragmatist;
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const todayDateStr = now.toISOString().slice(0, 10);

    // Morning Check-in
    if (state.morningTime === currentTimeStr && this.lastTriggeredDate.morning !== todayDateStr) {
      this.lastTriggeredDate.morning = todayDateStr;
      this.send(
        `Dev Coach — Morning Standup (Day ${state.currentDay})`,
        `${persona.name}: ${persona.morningPrompt}`
      );
    }

    // Evening Check-in
    if (state.eveningTime === currentTimeStr && this.lastTriggeredDate.evening !== todayDateStr) {
      this.lastTriggeredDate.evening = todayDateStr;
      this.send(
        `Dev Coach — Evening Check-In (Day ${state.currentDay})`,
        `${persona.name}: ${persona.checkInPrompt}`
      );
    }
  }

  testNotification(personaKey = 'pragmatist', day = 1) {
    const persona = PERSONAS[personaKey] || PERSONAS.pragmatist;
    return this.send(
      `Dev Coach Check-in (Day ${day})`,
      `${persona.name}: "Notification test confirmed! Stay focused and keep shipping today."`
    );
  }
}

export const notificationManager = new NotificationManager();

