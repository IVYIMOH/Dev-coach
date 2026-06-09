// ── Global Context Initializer ──────────────────────────────────────────────
let state = loadState();
let conversationHistory = [];
let isTyping = false;
let activeTab = 'all';

// ── Text Format Transformations ───────────────────────────────────────────
function stripActions(text) {
  return text.replace(/<ACTION>[\s\S]*?<\/ACTION>/g, '').trim();
}

function formatMsgText(text) {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false; }
      return;
    }
    const isBullet = /^[-•*]\s+/.test(trimmed);
    const formatted = trimmed
      .replace(/^[-•*]\s+/, '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    if (isBullet) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${formatted}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${formatted}</p>`;
    }
  });

  if (inList) html += '</ul>';
  return html;
}

// ── Messaging Rendering Cycles ─────────────────────────────────────────────
function addMessage(role, text, isRaw = false) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;

  const avDiv = document.createElement('div');
  avDiv.className = `msg-avatar ${role === 'ai' ? 'ai' : 'user-av'}`;
  avDiv.textContent = role === 'ai' ? 'dc' : 'me';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  if (isRaw) {
    bubble.innerHTML = text;
  } else {
    bubble.innerHTML = formatMsgText(text);
  }

  div.appendChild(avDiv);
  div.appendChild(bubble);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="msg-avatar ai">dc</div>
    <div class="typing-dots"><span></span><span></span><span></span></div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  document.getElementById('typingIndicator')?.remove();
}

// ── Interactive Events Pipe ────────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text || isTyping) return;

  input.value = '';
  input.style.height = 'auto';
  addMessage('user', text);

  isTyping = true;
  document.getElementById('sendBtn').disabled = true;
  showTyping();

  try {
    const reply = await callAI(text);
    hideTyping();
    parseAndApplyActions(reply);
    const display = stripActions(reply);
    if (display) addMessage('ai', display);
  } catch(e) {
    hideTyping();
    addMessage('ai', `Hmm, something went wrong: ${e.message}. Check your connection and try again.`);
  }

  isTyping = false;
  document.getElementById('sendBtn').disabled = false;
  input.focus();
}

function quickSend(text) {
  document.getElementById('userInput').value = text;
  sendMessage();
}

function askAbout(topic) {
  document.getElementById('userInput').value = `Tell me about ${topic}`;
  sendMessage();
}

// ── Sidebar Structural DOM Generator ─────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.id === `tab-${tab}`);
  });
  renderSidebar();
}

function switchTabClick(tab) {
  switchTab(tab);
}

function renderSidebar() {
  const el = document.getElementById('sidebarContent');
  let html = '';

  // 100 Days tracker
  if (activeTab === 'all' || activeTab === '100days') {
    const dayCount = state.days.length;
    const pct = Math.round((dayCount / 100) * 100);
    html += `
      <div>
        <div class="sidebar-section-title">100 days of code</div>
        <div class="day-tracker">
          <div class="day-num">${dayCount}</div>
          <div class="day-label">/ 100 days completed</div>
          <div class="streak-bar-wrap"><div class="streak-bar" style="width:${pct}%"></div></div>
          <div class="day-footer"><span>🔥 streak: ${state.currentStreak}</span><span>best: ${state.longestStreak}</span></div>
        </div>`;
    if (activeTab === '100days' && state.days.length > 0) {
      html += `<div class="mini-list" style="margin-top:8px">`;
      state.days.slice(-5).reverse().forEach(d => {
        html += `<div class="mini-item" onclick="askAbout('Day ${d.dayNum} of my 100 days challenge')">
          <div class="mini-item-dot dot-day"></div>
          <div class="mini-item-text">Day ${d.dayNum} — ${d.description.length > 40 ? d.description.slice(0,40)+'…' : d.description}</div>
        </div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
  }

  // Skills
  if (activeTab === 'all' || activeTab === 'skills') {
    const skills = activeTab === 'all' ? state.skills.slice(0, 4) : state.skills;
    html += `<div><div class="sidebar-section-title">Skills to learn (${state.skills.length})</div><div class="mini-list">`;
    skills.forEach(s => {
      const tagClass = s.status === 'done' ? 'tag-done' : s.status === 'in-progress' ? 'tag-progress' : 'tag-todo';
      html += `<div class="mini-item" onclick="askAbout('my ${s.name} skill')">
        <div class="mini-item-dot dot-skill"></div>
        <div class="mini-item-text">${s.name}${s.category ? ` <span style="color:var(--text-3);font-size:11px">${s.category}</span>` : ''}</div>
        <span class="mini-item-tag ${tagClass}">${s.status || 'todo'}</span>
      </div>`;
    });
    if (!skills.length) html += `<div style="font-size:12px;color:var(--text-3);padding:6px 4px">No skills yet — tell me what you want to learn!</div>`;
    if (activeTab === 'all' && state.skills.length > 4) html += `<div class="sidebar-more" onclick="switchTabClick('skills')">+ ${state.skills.length - 4} more</div>`;
    html += `</div></div>`;
  }

  // Projects
  if (activeTab === 'all' || activeTab === 'projects') {
    const projects = activeTab === 'all' ? state.projects.slice(0, 3) : state.projects;
    html += `<div><div class="sidebar-section-title">Projects (${state.projects.length})</div><div class="mini-list">`;
    projects.forEach(p => {
      const tagClass = p.status === 'done' ? 'tag-done' : p.status === 'in-progress' ? 'tag-progress' : 'tag-todo';
      html += `<div class="mini-item" onclick="askAbout('my ${p.name} project')">
        <div class="mini-item-dot dot-project"></div>
        <div class="mini-item-text">${p.name}</div>
        <span class="mini-item-tag ${tagClass}">${p.status || 'idea'}</span>
      </div>`;
    });
    if (!projects.length) html += `<div style="font-size:12px;color:var(--text-3);padding:6px 4px">No projects yet — what are you building?</div>`;
    if (activeTab === 'all' && state.projects.length > 3) html += `<div class="sidebar-more" onclick="switchTabClick('projects')">+ ${state.projects.length - 3} more</div>`;
    html += `</div></div>`;
  }

  // Jobs
  if (activeTab === 'all' || activeTab === 'jobs') {
    const jobs = activeTab === 'all' ? state.jobs.slice(0, 4) : state.jobs;
    html += `<div><div class="sidebar-section-title">Job applications (${state.jobs.length})</div><div class="mini-list">`;
    jobs.forEach(j => {
      const tagClass = j.status === 'applied' ? 'tag-applied' : j.status === 'interviewing' ? 'tag-progress' : j.status === 'offer' ? 'tag-done' : j.status === 'rejected' ? 'tag-todo' : 'tag-open';
      html += `<div class="mini-item" onclick="askAbout('my application to ${j.company}')">
        <div class="mini-item-dot dot-job"></div>
        <div class="mini-item-text">${j.role} <span style="color:var(--text-3);font-size:11px">@ ${j.company}</span></div>
        <span class="mini-item-tag ${tagClass}">${j.status || 'saved'}</span>
      </div>`;
    });
    if (!jobs.length) html += `<div style="font-size:12px;color:var(--text-3);padding:6px 4px">No jobs tracked yet — tell me where you want to apply!</div>`;
    if (activeTab === 'all' && state.jobs.length > 4) html += `<div class="sidebar-more" onclick="switchTabClick('jobs')">+ ${state.jobs.length - 4} more</div>`;
    html += `</div></div>`;
  }

  el.innerHTML = html;
}

function clearAllData() {
  if (confirm('Reset all tracked data? This cannot be undone.')) {
    state = defaultState();
    conversationHistory = [];
    saveState();
    renderSidebar();
    document.getElementById('chatMessages').innerHTML = '';
    showWelcome();
  }
}

// ── Onboard / Re-Entry UI Text Triggers ──────────────────────────────────────
function showWelcome() {
  const hasData = state.skills.length || state.days.length || state.projects.length || state.jobs.length;

  if (hasData) {
    addMessage('ai',
      `Welcome back! You have ${state.skills.length} skills tracked, ${state.days.length} coding days logged, ${state.projects.length} projects, and ${state.jobs.length} job applications. What would you like to update today?`
    );
  } else {
    addMessage('ai',
      `Hey! I'm your Dev Coach — here to keep your learning journey on track.\n\nTell me what you're working on. For example:\n- "I want to learn React, TypeScript and PostgreSQL"\n- "Log day 1 of 100 days — built a todo app"\n- "I'm building a personal finance tracker project"\n- "Applied to Stripe as a frontend engineer"\n\nWhat shall we start with?`
    );
  }
}

// ── Event Listener Setup ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs listeners
  ['all', 'skills', '100days', 'projects', 'jobs'].forEach(tab => {
    document.getElementById(`tab-${tab}`)?.addEventListener('click', () => switchTab(tab));
  });

  // Action / Control buttons listeners
  document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
  document.getElementById('clearBtn')?.addEventListener('click', clearAllData);

  // Quick Action Buttons listeners
  document.querySelectorAll('.qa-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const actionText = e.target.getAttribute('data-action');
      quickSend(actionText);
    });
  });

  // User input interaction handling
  const inputField = document.getElementById('userInput');
  if (inputField) {
    inputField.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    inputField.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Initial Paint Run
  renderSidebar();
  showWelcome();
});