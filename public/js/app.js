/**
 * Design Coach - Main Application Controller
 * Vanilla JS with ES modules. Safe DOM manipulation (textContent, zero innerHTML).
 */

import { Storage } from './storage.js';
import { PERSONAS } from './personas.js';
import { coachAvatar } from './avatar.js';
import { speechEngine } from './speech.js';
import { calculateStreak, getWeeklyStats, isDayCompleted } from './streak.js';
import { DailyStandup } from './standup.js';
import { DesignCritiqueModal } from './critique.js';
import { PomodoroTimer } from './pomodoro.js';
import { notificationManager } from './notifications.js';

class DesignCoachApp {
  constructor() {
    this.state = null;
    this.selectedDay = 1;
    this.isChatBusy = false;
    this.pomodoro = null;
    this.standup = null;
    this.critiqueModal = null;
  }

  async init() {
    this.state = await Storage.getState();
    this.selectedDay = this.state.currentDay || 1;

    speechEngine.setMuted(this.state.soundMuted);
    this.applyTheme(this.state.theme);

    const avatarContainer = document.getElementById('coachAvatarContainer');
    coachAvatar.renderCoach(avatarContainer, this.state.persona);

    // Pomodoro Engine (Focus 25/5)
    this.pomodoro = new PomodoroTimer({
      getPersona: () => PERSONAS[this.state.persona] || PERSONAS.sergeant,
      onTick: (status) => this.renderPomodoroStatus(status),
      onComplete: (mode) => {
        if (mode === 'work') {
          this.state.pomodoro.completedSessions = (this.state.pomodoro.completedSessions || 0) + 1;
          this.saveState();
          this.renderStats();
        }
      }
    });

    // Daily Standup Engine
    this.standup = new DailyStandup({
      getPersona: () => PERSONAS[this.state.persona] || PERSONAS.sergeant,
      onFinish: (summaryText) => {
        this.sendChatMessage(summaryText);
      }
    });

    // Design Critique Modal
    this.critiqueModal = new DesignCritiqueModal({
      onSubmit: (critiquePrompt) => {
        this.sendChatMessage(critiquePrompt);
      }
    });

    // Scheduled Notifications
    notificationManager.startScheduler(() => this.state);

    this.bindEvents();
    this.renderAll();
    this.registerServiceWorker();
  }

  applyTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
      themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
    }
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    this.saveState();
  }

  toggleSound() {
    const isMuted = speechEngine.toggleMute();
    this.state.soundMuted = isMuted;
    this.saveState();
    this.updateSoundButton();
  }

  updateSoundButton() {
    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.textContent = this.state.soundMuted ? '🔇 Muted' : '🔊 Voice On';
      soundBtn.setAttribute('aria-label', this.state.soundMuted ? 'Unmute Coach Voice' : 'Mute Coach Voice');
      soundBtn.classList.toggle('muted', this.state.soundMuted);
    }
  }

  changePersona(newPersonaKey) {
    if (!PERSONAS[newPersonaKey]) return;
    this.state.persona = newPersonaKey;
    coachAvatar.updatePersonaVisuals(newPersonaKey);
    this.saveState();
    this.renderPersonaInfo();

    const persona = PERSONAS[newPersonaKey];
    const greeting = persona.greetings[Math.floor(Math.random() * persona.greetings.length)]
      .replace('{day}', this.state.currentDay);

    this.appendMessage('ai', `${persona.name}: "${greeting}"`, persona.name);
    coachAvatar.speak(greeting, persona);
  }

  async saveState() {
    await Storage.setState(this.state);
  }

  bindEvents() {
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => this.toggleTheme());
    document.getElementById('soundToggleBtn')?.addEventListener('click', () => this.toggleSound());

    document.getElementById('personaSelect')?.addEventListener('change', (e) => {
      this.changePersona(e.target.value);
    });

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text || this.isChatBusy) return;
      chatInput.value = '';
      this.sendChatMessage(text);
    });

    // Quick action chips
    document.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action === 'standup') {
          this.standup.start();
        } else if (action === 'critique') {
          this.critiqueModal.open();
        } else if (action === 'recap') {
          this.requestWeeklyRecap();
        } else if (action === 'pomodoro') {
          this.pomodoro.start();
        } else if (action) {
          this.sendChatMessage(action);
        }
      });
    });

    // Standup and Critique top-bar triggers
    document.getElementById('standupBtn')?.addEventListener('click', () => this.standup.start());
    document.getElementById('critiqueBtn')?.addEventListener('click', () => this.critiqueModal.open());

    // Day selector grid
    const daySelector = document.getElementById('daySelectorGrid');
    daySelector?.addEventListener('click', (e) => {
      const dayBtn = e.target.closest('.day-pill');
      if (dayBtn) {
        const day = Number(dayBtn.getAttribute('data-day'));
        if (day >= 1 && day <= 21) {
          this.selectedDay = day;
          this.renderDayGrid();
          this.renderTaskList();
        }
      }
    });

    // Set as Today button
    document.getElementById('setCurrentDayBtn')?.addEventListener('click', () => {
      this.state.currentDay = this.selectedDay;
      this.saveState();
      this.renderDayGrid();
      this.renderStats();
      const persona = PERSONAS[this.state.persona] || PERSONAS.sergeant;
      this.appendMessage('ai', `Active design sprint set to Day ${this.selectedDay}. Let's make every pixel count!`, persona.name);
    });

    // Add custom task form
    const addTaskForm = document.getElementById('addTaskForm');
    addTaskForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('newTaskInput');
      const typeSelect = document.getElementById('newTaskTypeSelect');
      const title = titleInput.value.trim();
      if (!title) return;

      const newTask = {
        id: `custom-${Date.now().toString(36)}`,
        day: this.selectedDay,
        type: typeSelect?.value || 'practice',
        title,
        done: false,
        proof: '',
        note: ''
      };

      this.state.tasks.push(newTask);
      titleInput.value = '';
      this.saveState();
      this.renderTaskList();
      this.renderDayGrid();
      this.renderStats();
    });

    // Pomodoro Controls
    document.getElementById('pomoStartBtn')?.addEventListener('click', () => this.pomodoro.start());
    document.getElementById('pomoPauseBtn')?.addEventListener('click', () => this.pomodoro.pause());
    document.getElementById('pomoResetBtn')?.addEventListener('click', () => this.pomodoro.reset());

    // Export / Import / Reset data
    document.getElementById('exportDataBtn')?.addEventListener('click', () => Storage.exportProgressFile());

    const importInput = document.getElementById('importFileInput');
    document.getElementById('importDataBtn')?.addEventListener('click', () => importInput?.click());
    importInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const content = evt.target.result;
        const res = await Storage.importProgressJson(content);
        if (res.success) {
          this.state = res.state;
          this.selectedDay = this.state.currentDay;
          this.renderAll();
          alert('Design Coach progress restored successfully!');
        } else {
          alert(`Import failed: ${res.error}`);
        }
      };
      reader.readAsText(file);
      importInput.value = '';
    });

    document.getElementById('resetDataBtn')?.addEventListener('click', async () => {
      if (confirm('Reset all 21-day Design Coach tasks and progress back to initial curriculum?')) {
        this.state = await Storage.resetState();
        this.selectedDay = 1;
        this.renderAll();
      }
    });

    // Notification permission & test
    document.getElementById('enableNotifsBtn')?.addEventListener('click', async () => {
      const perm = await notificationManager.requestPermission();
      if (perm === 'granted') {
        this.state.notificationsEnabled = true;
        await this.saveState();
        notificationManager.testNotification(this.state.persona, this.state.currentDay);
        this.renderNotificationSettings();
      } else {
        alert('Notification permission was not granted.');
      }
    });

    document.getElementById('morningTimeInput')?.addEventListener('change', (e) => {
      this.state.morningTime = e.target.value;
      this.saveState();
    });

    document.getElementById('eveningTimeInput')?.addEventListener('change', (e) => {
      this.state.eveningTime = e.target.value;
      this.saveState();
    });
  }

  renderAll() {
    this.updateSoundButton();
    this.renderPersonaInfo();
    this.renderDayGrid();
    this.renderTaskList();
    this.renderStats();
    this.renderMessages();
    this.renderPomodoroStatus(this.pomodoro.getStatus());
    this.renderNotificationSettings();
  }

  renderPersonaInfo() {
    const persona = PERSONAS[this.state.persona] || PERSONAS.sergeant;
    const personaSelect = document.getElementById('personaSelect');
    if (personaSelect) personaSelect.value = persona.id;

    const nameEl = document.getElementById('coachHeaderName');
    if (nameEl) nameEl.textContent = persona.name;

    const titleEl = document.getElementById('coachHeaderTitle');
    if (titleEl) titleEl.textContent = persona.title;

    const taglineEl = document.getElementById('coachTagline');
    if (taglineEl) taglineEl.textContent = `"${persona.tagline}"`;
  }

  renderDayGrid() {
    const container = document.getElementById('daySelectorGrid');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    for (let day = 1; day <= 21; day++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day-pill';
      btn.setAttribute('data-day', String(day));

      const isDone = isDayCompleted(this.state.tasks, day);
      const isSelected = day === this.selectedDay;
      const isCurrent = day === this.state.currentDay;

      if (isSelected) btn.classList.add('selected');
      if (isCurrent) btn.classList.add('current');
      if (isDone) btn.classList.add('completed');

      const numSpan = document.createElement('span');
      numSpan.className = 'day-pill-num';
      numSpan.textContent = `D${day}`;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'day-pill-icon';
      iconSpan.textContent = isDone ? '✓' : (isCurrent ? '★' : '•');

      btn.appendChild(numSpan);
      btn.appendChild(iconSpan);
      btn.setAttribute('aria-label', `Day ${day}: ${isDone ? 'Completed' : 'In Progress'}${isCurrent ? ', Today' : ''}`);

      container.appendChild(btn);
    }
  }

  renderTaskList() {
    const container = document.getElementById('taskListContainer');
    const dayHeading = document.getElementById('currentDayHeading');
    if (!container) return;

    if (dayHeading) {
      const isToday = this.selectedDay === this.state.currentDay;
      dayHeading.textContent = `Day ${this.selectedDay} Tasks ${isToday ? '(Today)' : ''}`;
    }

    while (container.firstChild) container.removeChild(container.firstChild);

    const dayTasks = this.state.tasks.filter(t => t.day === this.selectedDay);

    if (dayTasks.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'task-empty-state';
      emptyDiv.textContent = 'No tasks for this day yet. Add one below!';
      container.appendChild(emptyDiv);
      return;
    }

    dayTasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'task-item';
      if (task.done) item.classList.add('done');

      // Checkbox
      const checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = 'task-checkbox';
      checkBtn.setAttribute('role', 'checkbox');
      checkBtn.setAttribute('aria-checked', task.done ? 'true' : 'false');
      checkBtn.setAttribute('aria-label', `Mark "${task.title}" as ${task.done ? 'undone' : 'done'}`);
      checkBtn.textContent = task.done ? '✓' : '';

      checkBtn.addEventListener('click', () => {
        // PROOF REQUIREMENT FOR SHIP TASKS:
        // The coach asks for proof before praising/signing off on a Ship task.
        if (!task.done && task.type === 'ship' && !task.proof) {
          const userProof = prompt(
            `Proof Required for Ship Task:\n"${task.title}"\n\nPlease enter your Figma URL, Notion link, or artifact note:`
          );
          if (userProof && userProof.trim()) {
            task.proof = userProof.trim();
          } else {
            alert('A Ship task requires proof (Figma link, document URL, or artifact note) before it can count toward your streak.');
            return;
          }
        }

        task.done = !task.done;
        this.saveState();
        this.renderTaskList();
        this.renderDayGrid();
        this.renderStats();

        // If day completed, trigger coach praise!
        if (task.done && isDayCompleted(this.state.tasks, this.selectedDay)) {
          const persona = PERSONAS[this.state.persona] || PERSONAS.sergeant;
          let celebration = `Day ${this.selectedDay} fully accomplished! Great design execution.`;
          if (persona.id === 'sergeant') {
            celebration = `Day ${this.selectedDay} locked and loaded! All 3 tasks verified with proof. Keep up this relentless pace!`;
          } else if (persona.id === 'hype') {
            celebration = `YASSS! Day ${this.selectedDay} is 100% complete! Your portfolio is leveling up so fast!`;
          }
          this.appendMessage('ai', celebration, persona.name);
          coachAvatar.speak(celebration, persona);
        }
      });

      // Text and badges wrap
      const textWrap = document.createElement('div');
      textWrap.className = 'task-text-wrap';

      // Type Badge (Learn, Practice, Ship)
      const badgeRow = document.createElement('div');
      badgeRow.className = 'task-badge-row';

      const typeBadge = document.createElement('span');
      typeBadge.className = `task-type-badge ${task.type || 'practice'}`;
      typeBadge.textContent = task.type === 'ship' ? 'Ship 🚀' : (task.type === 'learn' ? 'Learn 45m' : 'Practice');
      badgeRow.appendChild(typeBadge);

      if (task.proof) {
        const proofTag = document.createElement('span');
        proofTag.className = 'task-proof-tag';
        proofTag.textContent = `✓ Proof: ${task.proof.length > 28 ? task.proof.slice(0, 28) + '…' : task.proof}`;
        proofTag.title = task.proof;
        badgeRow.appendChild(proofTag);
      }

      textWrap.appendChild(badgeRow);

      const titleSpan = document.createElement('div');
      titleSpan.className = 'task-title';
      titleSpan.textContent = task.title;
      textWrap.appendChild(titleSpan);

      if (task.note) {
        const noteSpan = document.createElement('div');
        noteSpan.className = 'task-note';
        noteSpan.textContent = `Note: ${task.note}`;
        textWrap.appendChild(noteSpan);
      }

      // Proof / Edit Button
      const proofBtn = document.createElement('button');
      proofBtn.type = 'button';
      proofBtn.className = 'task-attach-proof-btn';
      proofBtn.textContent = task.proof ? 'Edit Proof' : '+ Proof';
      proofBtn.setAttribute('aria-label', `Attach proof to task: ${task.title}`);
      proofBtn.addEventListener('click', () => {
        const newProof = prompt(`Attach Figma link or artifact note for:\n"${task.title}"`, task.proof || '');
        if (newProof !== null) {
          task.proof = newProof.trim();
          this.saveState();
          this.renderTaskList();
          this.renderStats();
        }
      });

      // Delete Task Button
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'task-delete-btn';
      deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        this.state.tasks = this.state.tasks.filter(t => t.id !== task.id);
        this.saveState();
        this.renderTaskList();
        this.renderDayGrid();
        this.renderStats();
      });

      item.appendChild(checkBtn);
      item.appendChild(textWrap);
      item.appendChild(proofBtn);
      item.appendChild(deleteBtn);

      container.appendChild(item);
    });
  }

  renderStats() {
    const stats = calculateStreak(this.state.tasks, this.state.currentDay);

    const streakVal = document.getElementById('currentStreakVal');
    if (streakVal) streakVal.textContent = `${stats.currentStreak} Days`;

    const longestVal = document.getElementById('longestStreakVal');
    if (longestVal) longestVal.textContent = `Best: ${stats.longestStreak} Days`;

    const progressVal = document.getElementById('totalProgressVal');
    if (progressVal) progressVal.textContent = `${stats.totalCompletedDays}/21 Days (${stats.progressPercent}%) • ${stats.shippedArtifactsCount} Shipped Artifacts`;

    const progressBar = document.getElementById('streakProgressBar');
    if (progressBar) progressBar.style.width = `${stats.progressPercent}%`;

    // Weekly Recap with Portfolio Progress
    const currentWeek = Math.min(3, Math.ceil(this.state.currentDay / 7));
    const weekStats = getWeeklyStats(this.state.tasks, currentWeek);

    const recapTitle = document.getElementById('weeklyRecapTitle');
    if (recapTitle) recapTitle.textContent = weekStats.title;

    const recapStats = document.getElementById('weeklyRecapStats');
    if (recapStats) {
      recapStats.textContent = `${weekStats.completedDays}/7 days complete • ${weekStats.completedTasks}/${weekStats.totalTasks} tasks finished (${weekStats.percent}%)`;
    }

    // Portfolio Progress Line in Weekly Recap
    const portfolioContainer = document.getElementById('weeklyPortfolioProgress');
    if (portfolioContainer) {
      while (portfolioContainer.firstChild) portfolioContainer.removeChild(portfolioContainer.firstChild);

      const header = document.createElement('div');
      header.className = 'portfolio-progress-header';
      header.textContent = 'Portfolio Progress (Shipped Artifacts):';
      portfolioContainer.appendChild(header);

      const shipped = weekStats.shippedArtifacts.filter(a => a.done);
      if (shipped.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'portfolio-empty-note';
        empty.textContent = 'No artifacts shipped yet this week. Complete your Ship tasks with proof!';
        portfolioContainer.appendChild(empty);
      } else {
        const list = document.createElement('ul');
        list.className = 'portfolio-artifacts-list';
        shipped.forEach(art => {
          const li = document.createElement('li');
          const strong = document.createElement('strong');
          strong.textContent = `Day ${art.day}: `;
          li.appendChild(strong);

          const titleText = document.createTextNode(art.title);
          li.appendChild(titleText);

          if (art.proof) {
            const proofBadge = document.createElement('span');
            proofBadge.className = 'portfolio-proof-link';
            proofBadge.textContent = ` [Proof: ${art.proof}]`;
            li.appendChild(proofBadge);
          }
          list.appendChild(li);
        });
        portfolioContainer.appendChild(list);
      }
    }
  }

  renderMessages() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    while (container.firstChild) container.removeChild(container.firstChild);

    (this.state.messages || []).forEach(msg => {
      this.renderMessageElement(msg, container);
    });

    container.scrollTop = container.scrollHeight;
  }

  renderMessageElement(msg, container) {
    const wrap = document.createElement('div');
    wrap.className = `chat-msg ${msg.role === 'user' ? 'user' : 'ai'}`;

    const sender = document.createElement('div');
    sender.className = 'msg-sender';
    sender.textContent = msg.sender || (msg.role === 'user' ? 'You' : 'Coach');

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = msg.text;

    wrap.appendChild(sender);
    wrap.appendChild(bubble);
    container.appendChild(wrap);
  }

  appendMessage(role, text, senderName) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      sender: senderName || (role === 'user' ? 'You' : PERSONAS[this.state.persona]?.name || 'Coach'),
      text,
      timestamp: new Date().toISOString()
    };

    if (!Array.isArray(this.state.messages)) this.state.messages = [];
    this.state.messages.push(msg);

    if (this.state.messages.length > 100) {
      this.state.messages = this.state.messages.slice(-100);
    }

    const container = document.getElementById('chatMessagesContainer');
    if (container) {
      this.renderMessageElement(msg, container);
      container.scrollTop = container.scrollHeight;
    }

    this.saveState();
  }

  async sendChatMessage(userText) {
    if (!userText || this.isChatBusy) return;

    this.appendMessage('user', userText);
    this.setChatBusy(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          persona: this.state.persona,
          currentDay: this.state.currentDay,
          tasks: this.state.tasks
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'Message received.';
      const actions = Array.isArray(data.actions) ? data.actions : [];

      this.applyCoachActions(actions);

      const persona = PERSONAS[this.state.persona] || PERSONAS.sergeant;
      this.appendMessage('ai', reply, persona.name);
      coachAvatar.speak(reply, persona);

    } catch (err) {
      console.error('Chat error:', err);
      const persona = PERSONAS[this.state.persona] || PERSONAS.sergeant;
      this.appendMessage('ai', `Connection note: ${err.message}. Operating in offline tracker mode.`, persona.name);
    } finally {
      this.setChatBusy(false);
    }
  }

  applyCoachActions(actions) {
    if (!Array.isArray(actions) || actions.length === 0) return;

    let modified = false;

    for (const act of actions) {
      const { type, data } = act;

      if (type === 'DONE' && data?.id) {
        const task = this.state.tasks.find(t => t.id === data.id);
        if (task && !task.done) {
          task.done = true;
          modified = true;
        }
      } else if (type === 'UNDONE' && data?.id) {
        const task = this.state.tasks.find(t => t.id === data.id);
        if (task && task.done) {
          task.done = false;
          modified = true;
        }
      } else if (type === 'ADD_PROOF' && data?.id && data?.proof) {
        const task = this.state.tasks.find(t => t.id === data.id);
        if (task) {
          task.proof = String(data.proof).slice(0, 500);
          modified = true;
        }
      } else if (type === 'ADD_TASK' && data?.title) {
        const newTask = {
          id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
          day: Math.min(21, Math.max(1, Number(data.day) || this.selectedDay)),
          type: ['learn', 'practice', 'ship'].includes(data.type) ? data.type : 'practice',
          title: String(data.title).slice(0, 200),
          done: false,
          proof: data.proof ? String(data.proof).slice(0, 500) : '',
          note: data.note ? String(data.note).slice(0, 500) : ''
        };
        this.state.tasks.push(newTask);
        modified = true;
      } else if (type === 'NOTE' && data?.id && data?.note) {
        const task = this.state.tasks.find(t => t.id === data.id);
        if (task) {
          task.note = String(data.note).slice(0, 500);
          modified = true;
        }
      }
    }

    if (modified) {
      this.saveState();
      this.renderTaskList();
      this.renderDayGrid();
      this.renderStats();
    }
  }

  requestWeeklyRecap() {
    const currentWeek = Math.min(3, Math.ceil(this.state.currentDay / 7));
    const stats = getWeeklyStats(this.state.tasks, currentWeek);
    const shippedTitles = stats.shippedArtifacts.filter(a => a.done).map(a => `• Day ${a.day}: ${a.title} (Proof: ${a.proof || 'Attached'})`).join('\n');

    const query = [
      `Weekly Recap & Portfolio Review Request for ${stats.title}:`,
      `• Challenge Days Complete: ${stats.completedDays} of 7`,
      `• Tasks Finished: ${stats.completedTasks} of ${stats.totalTasks} (${stats.percent}%)`,
      `• Portfolio Shipped Artifacts:`,
      shippedTitles || 'None shipped yet this week',
      `Please provide an in-persona critique of our week's momentum and advice for the next sprint.`
    ].join('\n');

    this.sendChatMessage(query);
  }

  setChatBusy(busy) {
    this.isChatBusy = busy;
    const sendBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    const indicator = document.getElementById('chatTypingIndicator');

    if (sendBtn) sendBtn.disabled = busy;
    if (chatInput) chatInput.disabled = busy;
    if (indicator) indicator.classList.toggle('active', busy);
  }

  renderPomodoroStatus(status) {
    const display = document.getElementById('pomoTimeDisplay');
    const bar = document.getElementById('pomoProgressBar');
    const modeBadge = document.getElementById('pomoModeBadge');
    const startBtn = document.getElementById('pomoStartBtn');

    if (display) display.textContent = status.formatted;
    if (bar) bar.style.width = `${status.progress}%`;
    if (modeBadge) {
      modeBadge.textContent = status.mode === 'work' ? 'Design Sprint (25m)' : 'Creative Break (5m)';
      modeBadge.className = `pomo-badge ${status.mode}`;
    }
    if (startBtn) {
      startBtn.textContent = status.isRunning ? 'Running...' : 'Start';
      startBtn.disabled = status.isRunning;
    }
  }

  renderNotificationSettings() {
    const morningInput = document.getElementById('morningTimeInput');
    const eveningInput = document.getElementById('eveningTimeInput');
    const statusText = document.getElementById('notifStatusText');
    const enableBtn = document.getElementById('enableNotifsBtn');

    if (morningInput) morningInput.value = this.state.morningTime || '09:00';
    if (eveningInput) eveningInput.value = this.state.eveningTime || '18:00';

    const perm = notificationManager.getPermission();
    if (statusText) {
      if (perm === 'granted') {
        statusText.textContent = 'Active (Reminders scheduled)';
        statusText.style.color = 'var(--accent)';
        if (enableBtn) enableBtn.textContent = 'Test Notification 🔔';
      } else if (perm === 'denied') {
        statusText.textContent = 'Blocked in browser settings';
        statusText.style.color = '#c0392b';
      } else {
        statusText.textContent = 'Permission not requested';
        statusText.style.color = 'var(--text-3)';
      }
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.warn('ServiceWorker registration omitted:', err);
        });
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new DesignCoachApp();
  app.init();
});
