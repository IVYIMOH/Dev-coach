const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// ── State Persistence Functions ──────────────────────────────────────────
function defaultState() {
  return {
    skills: [],
    days: [],
    currentStreak: 0,
    longestStreak: 0,
    projects: [],
    jobs: [],
    lastUpdated: null
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem('devcoach_state');
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch(e) {}
  return defaultState();
}

function saveState() {
  state.lastUpdated = new Date().toISOString();
  localStorage.setItem('devcoach_state', JSON.stringify(state));
}

// ── Context Generator ──────────────────────────────────────────────────────
function buildSystemPrompt() {
  const todayStr = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  return `You are Dev Coach, a smart, supportive AI assistant helping a developer track their learning journey. Today is ${todayStr}.

CURRENT TRACKER DATA (JSON):
${JSON.stringify(state, null, 2)}

You help the user manage four areas:
1. SKILLS TO LEARN — technologies, concepts, frameworks they want to master
2. 100 DAYS OF CODE — daily coding log, streak tracking, what they worked on each day
3. PROJECTS — side projects/portfolio work with status
4. JOB APPLICATIONS — companies, roles, status, follow-up reminders

CAPABILITIES:
When a user wants to add, update, or remove something, respond AND output a JSON command block like this:
<ACTION>
{"type": "ADD_SKILL"|"UPDATE_SKILL"|"REMOVE_SKILL"|"LOG_DAY"|"ADD_PROJECT"|"UPDATE_PROJECT"|"REMOVE_PROJECT"|"ADD_JOB"|"UPDATE_JOB"|"REMOVE_JOB", "data": {...}}
</ACTION>

Action schemas:
- ADD_SKILL: { name, category (e.g. "frontend","backend","devops","cs","language"), status ("todo"|"in-progress"|"done"), notes? }
- UPDATE_SKILL: { id, ...fields to update }
- REMOVE_SKILL: { id }
- LOG_DAY: { dayNum, date, description, hoursSpent? }
- ADD_PROJECT: { name, description, techStack (array), status ("idea"|"in-progress"|"done"), url? }
- UPDATE_PROJECT: { id, ...fields }
- REMOVE_PROJECT: { id }
- ADD_JOB: { company, role, url?, status ("saved"|"applied"|"interviewing"|"offer"|"rejected"), appliedDate?, notes? }
- UPDATE_JOB: { id, ...fields }
- REMOVE_JOB: { id }

RULES:
- Be concise and encouraging. Use plain text, no markdown headers.
- When outputting ACTION blocks, they must be valid JSON between <ACTION> and </ACTION> tags.
- After any action, briefly confirm what you did.
- Give smart advice: notice patterns (e.g. stale jobs, skills not progressed, missed coding days), suggest priorities.
- If user asks for a summary or dashboard, give it in plain text using their actual data.
- Keep responses short (2-4 sentences usually). Save longer responses for summaries/advice requests.`;
}

// ── Engine Connectivity Call ───────────────────────────────────────────────
async function callAI(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: buildSystemPrompt(),
      messages: conversationHistory
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const assistantText = data.content?.find(b => b.type === 'text')?.text || '';
  conversationHistory.push({ role: "assistant", content: assistantText });

  return assistantText;
}

// ── Intent Extraction Layer ────────────────────────────────────────────────
function parseAndApplyActions(text) {
  const actionRegex = /<ACTION>([\s\S]*?)<\/ACTION>/g;
  let match;
  const applied = [];

  while ((match = actionRegex.exec(text)) !== null) {
    try {
      const action = JSON.parse(match[1].trim());
      applyAction(action);
      applied.push(action.type);
    } catch(e) {
      console.warn('Failed to parse action', e);
    }
  }

  if (applied.length > 0) {
    saveState();
    renderSidebar();
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function applyAction(action) {
  const { type, data } = action;

  if (type === 'ADD_SKILL') {
    state.skills.push({ id: genId(), ...data });
  } else if (type === 'UPDATE_SKILL') {
    const i = state.skills.findIndex(s => s.id === data.id);
    if (i >= 0) state.skills[i] = { ...state.skills[i], ...data };
  } else if (type === 'REMOVE_SKILL') {
    state.skills = state.skills.filter(s => s.id !== data.id);
  } else if (type === 'LOG_DAY') {
    const exists = state.days.find(d => d.dayNum === data.dayNum);
    if (!exists) {
      state.days.push({ id: genId(), ...data });
      state.days.sort((a,b) => a.dayNum - b.dayNum);
      recalcStreak();
    }
  } else if (type === 'ADD_PROJECT') {
    state.projects.push({ id: genId(), createdAt: new Date().toISOString(), ...data });
  } else if (type === 'UPDATE_PROJECT') {
    const i = state.projects.findIndex(p => p.id === data.id);
    if (i >= 0) state.projects[i] = { ...state.projects[i], ...data };
  } else if (type === 'REMOVE_PROJECT') {
    state.projects = state.projects.filter(p => p.id !== data.id);
  } else if (type === 'ADD_JOB') {
    state.jobs.push({ id: genId(), addedAt: new Date().toISOString(), ...data });
  } else if (type === 'UPDATE_JOB') {
    const i = state.jobs.findIndex(j => j.id === data.id);
    if (i >= 0) state.jobs[i] = { ...state.jobs[i], ...data };
  } else if (type === 'REMOVE_JOB') {
    state.jobs = state.jobs.filter(j => j.id !== data.id);
  }
}

function recalcStreak() {
  const nums = state.days.map(d => d.dayNum).sort((a,b) => a-b);
  let streak = 0, max = 0, cur = 0;
  nums.forEach((n, i) => {
    if (i === 0 || n === nums[i-1] + 1) {
      cur++;
    } else {
      cur = 1;
    }
    max = Math.max(max, cur);
    streak = cur;
  });
  state.currentStreak = streak;
  state.longestStreak = max;
}