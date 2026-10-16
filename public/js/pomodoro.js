/**
 * Dev Coach - Pomodoro Engine (25/5)
 * Announces start, halfway (12:30 mark), and end with coach voice.
 */

import { coachAvatar } from './avatar.js';
import { PERSONAS } from './personas.js';

export class PomodoroTimer {
  constructor(options = {}) {
    this.workDuration = 25 * 60; // 25 minutes in seconds
    this.breakDuration = 5 * 60; // 5 minutes in seconds
    this.remainingSeconds = this.workDuration;
    this.mode = 'work'; // 'work' | 'break'
    this.isRunning = false;
    this.timerId = null;
    this.halfwayAnnounced = false;
    this.onTick = options.onTick || null;
    this.onComplete = options.onComplete || null;
    this.getPersona = options.getPersona || (() => PERSONAS.pragmatist);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Announce start if beginning a fresh session
    if (this.remainingSeconds === this.workDuration && this.mode === 'work') {
      this.halfwayAnnounced = false;
      const persona = this.getPersona();
      let startMsg = 'Focus mode initiated. 25 minutes on the clock. Deep work starts now.';
      if (persona.id === 'sergeant') {
        startMsg = '25 minutes of zero-distraction execution! Lock in and ship!';
      } else if (persona.id === 'architect') {
        startMsg = 'Entering 25-minute deep work block. Protect your mental model.';
      }
      coachAvatar.speak(startMsg, persona);
    }

    this.timerId = setInterval(() => this.tick(), 1000);
    if (this.onTick) this.onTick(this.getStatus());
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.onTick) this.onTick(this.getStatus());
  }

  reset() {
    this.pause();
    this.mode = 'work';
    this.remainingSeconds = this.workDuration;
    this.halfwayAnnounced = false;
    if (this.onTick) this.onTick(this.getStatus());
  }

  tick() {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;

      // Halfway announcement at 12:30 (750 seconds left of 1500)
      if (this.mode === 'work' && !this.halfwayAnnounced && this.remainingSeconds === Math.floor(this.workDuration / 2)) {
        this.halfwayAnnounced = true;
        const persona = this.getPersona();
        let halfMsg = 'Halfway mark reached. 12 minutes remaining. Keep your momentum!';
        if (persona.id === 'sergeant') {
          halfMsg = 'Halfway there! Do not let up now—finish what you started!';
        } else if (persona.id === 'architect') {
          halfMsg = 'Midway checkpoint. Maintain steady cadence and clarity.';
        }
        coachAvatar.speak(halfMsg, persona);
      }

      if (this.onTick) this.onTick(this.getStatus());
    } else {
      // Completed session
      this.pause();
      const prevMode = this.mode;
      const persona = this.getPersona();

      if (prevMode === 'work') {
        let finishMsg = '25 minutes done! Great focus sprint. Take a 5-minute break to recharge.';
        if (persona.id === 'sergeant') {
          finishMsg = 'Session conquered! Mission complete. Take 5 minutes, hydrate, and prepare for the next round!';
        } else if (persona.id === 'architect') {
          finishMsg = 'Deep work interval concluded. Step away to let your subconscious integrate the solution.';
        }
        coachAvatar.speak(finishMsg, persona);

        this.mode = 'break';
        this.remainingSeconds = this.breakDuration;
        this.halfwayAnnounced = false;
        if (this.onComplete) this.onComplete('work');
      } else {
        let breakEndMsg = 'Break over. Ready for the next 25-minute focus block?';
        coachAvatar.speak(breakEndMsg, persona);
        this.mode = 'work';
        this.remainingSeconds = this.workDuration;
        this.halfwayAnnounced = false;
        if (this.onComplete) this.onComplete('break');
      }

      if (this.onTick) this.onTick(this.getStatus());
    }
  }

  getStatus() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const total = this.mode === 'work' ? this.workDuration : this.breakDuration;
    const progress = Math.max(0, Math.min(100, Math.round(((total - this.remainingSeconds) / total) * 100)));

    return {
      mode: this.mode,
      remainingSeconds: this.remainingSeconds,
      formatted,
      progress,
      isRunning: this.isRunning
    };
  }
}

