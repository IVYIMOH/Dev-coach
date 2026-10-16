# Dev Coach 🎯

An installable 21-Day Product-Engineer Challenge Tracker with an AI Accountability Coach.

Dev Coach helps software developers transition into product engineers through daily hands-on milestones, strict streak tracking, automated voice check-ins, and conversational task management.

---

## 🌟 Highlights & Features

- **21-Day Product Engineer Curriculum**: 3 weeks of curated milestones (Week 1: Foundations & Architecture, Week 2: Core Product & Polish, Week 3: Production, Scale & Launch).
- **Three Coach Personas**:
  - **Alex Cole (The Pragmatic Lead)**: Direct, MVP-focused, cuts through overengineering.
  - **Sarge Vera (Accountability Drill Sergeant)**: High energy, zero excuses, celebrates discipline.
  - **Dr. Marcus Chen (The Systems Architect)**: Reflective, systems thinker, values clean abstractions.
- **Conversational Task Actions**: Chat in plain English (*"finished the TypeScript task"*, *"add a task on day 5: read about RLS"*). The coach parses intent, emits structured JSON actions (`DONE`, `UNDONE`, `ADD_TASK`, `NOTE`), and updates the tracker.
- **Strict Streak Rule**: A day counts as completed **only if all its tasks are marked done**. Includes weekly review recaps.
- **Voice & Speech Engine**: Coach speaks aloud using the Web Speech API with per-persona pitch, rate, and timbre, plus a one-click mute toggle. Supports Speech-to-Text microphone dictation.
- **Daily Standup Flow**: The coach asks three questions out loud (*"What did you finish?"*, *"What is blocking you?"*, *"What is today's core focus?"*), accepts voice or typed answers, and syncs updates.
- **Pomodoro Mode (25/5)**: Integrated timer with coach announcements at the start, halfway mark (12:30), and session completion.
- **Browser Notifications**: Configurable morning plan and evening check-in reminders in the coach's persona voice.
- **Animated SVG Avatar**: Scalable vector avatar with breathing motion, eye blinks, speaking mouth animations, and `prefers-reduced-motion` support.
- **PWA & Offline Capability**: Installs to home screen/desktop via `manifest.webmanifest`. Offline caching via Service Worker (`sw.js`) allows full task tracking without internet.
- **Persistence & Portability**: State managed via an async `Storage` abstraction wrapping `localStorage` (ready for SQLite/Postgres), with full JSON backup export and import.
- **Enterprise Security**: Strict Content-Security-Policy (CSP) via Helmet, IP rate limiting, input sanitization, and strict `textContent` rendering (zero `innerHTML` or inline handlers).
- **Talking-Head Video Stub**: Route `POST /api/avatar-video` ready for D-ID or HeyGen integration.

---

## 📁 Project Structure

```
Dev-coach/
├── package.json              # Project scripts & minimal dependencies
├── .env.example              # Environment template (no secrets in repo)
├── .gitignore                # Git ignore rules (node_modules, .env, logs)
├── server.js                 # Express server, Helmet CSP, rate-limit, static serve
├── lib/
│   ├── action-validator.js   # Allowlist & schema validation for DONE/UNDONE/ADD_TASK/NOTE
│   ├── coach-service.js      # Anthropic Messages API client + fallback mock engine
│   └── streak.js             # Streak calculations & weekly metrics
├── tests/
│   ├── streak.test.js        # Unit tests for strict streak calculation
│   ├── action-validator.test.js # Unit tests for action schemas & allowlist
│   ├── coach-service.test.js # Unit tests for mock coach intent matching
│   └── server.test.js        # End-to-end endpoint & CSP tests
└── public/
    ├── index.html            # Semantic HTML5 layout, accessible controls
    ├── styles.css            # Cream/forest-green design tokens, dark mode, responsive
    ├── manifest.webmanifest  # PWA configuration
    ├── sw.js                 # Service worker for offline asset caching
    ├── icons/                # Vector PWA app icons (192x192, 512x512)
    └── js/
        ├── app.js            # Main frontend coordinator & event dispatcher
        ├── storage.js        # Persistence module (async storage, export, import)
        ├── initial-tasks.js  # 21-day challenge curriculum dataset
        ├── personas.js       # Persona configurations & voice parameters
        ├── streak.js         # Client streak calculation module
        ├── speech.js         # Web Speech API (TTS & SpeechRecognition)
        ├── avatar.js         # Animated SVG avatar engine & talking animations
        ├── standup.js        # 3-question daily standup interactive stepper
        ├── pomodoro.js       # 25/5 Pomodoro timer engine
        └── notifications.js  # Web Notifications scheduler
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v9+

### 2. Installation
```bash
git clone https://github.com/IVYIMOH/Dev-coach.git
cd Dev-coach
npm install
```

### 3. Environment Setup (Optional)
```bash
cp .env.example .env
```
> **Note**: An API key is **not required** to run and test Dev Coach! If `ANTHROPIC_API_KEY` is not provided, Dev Coach automatically runs in **Built-in Mock Coach Mode**, intelligently handling task additions, completions, standup reports, and conversational advice locally.

To connect real Anthropic Claude models:
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
MODEL=claude-sonnet-5-5
PORT=3000
```

### 4. Run Unit Tests
Dev Coach uses Node's native test runner (`node:test`):
```bash
npm test
```

### 5. Start the Application
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment Guide

### Deploying to Render
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
3. Select your repository.
4. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `ANTHROPIC_API_KEY`: *(Your key, optional)*
   - `MODEL`: `claude-sonnet-5-5`
6. Click **Deploy Web Service**.

### Deploying to Fly.io
1. Install the Fly CLI and authenticate:
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```
2. Initialize the Fly app:
   ```bash
   fly launch --no-deploy
   ```
3. Set your production secrets securely:
   ```bash
   fly secrets set ANTHROPIC_API_KEY="your-anthropic-key"
   ```
4. Deploy the application:
   ```bash
   fly deploy
   ```
5. Open your deployed app:
   ```bash
   fly open
   ```

---

## 🔮 What to Build Next

1. **Server-Side Persistence (SQLite / Postgres)**: Swap the `Storage` module in `storage.js` to sync with a lightweight SQLite database (using `better-sqlite3` or Turso/libSQL) with multi-device user authentication.
2. **Talking-Head Video Integration**: Connect the `POST /api/avatar-video` route to HeyGen or D-ID interactive streaming avatar APIs for real-time video coaching.
3. **Calendar & GitHub Webhook Sync**: Automatically mark challenge tasks as done when commits matching challenge keywords (e.g., `git commit -m "feat(auth): complete day 2 RLS policies"`) land on GitHub.
4. **Peer Cohort Circles**: Allow developers to join 5-person accountability cohorts, view each other's streak meters, and participate in peer review checkpoints.