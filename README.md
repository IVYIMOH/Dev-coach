# Design Coach 🎨

An installable 21-Day Product Designer Challenge Tracker with an AI Accountability Coach.

Design Coach pushes aspiring and transitioning product designers to finish tasks, master end-to-end design craft, and produce real portfolio artifacts—demanding proof before celebrating output.

---

## 🌟 Highlights & Features

- **21-Day Product Designer Curriculum**: 3 weeks of hands-on milestones:
  - **Week 1: Research, Strategy & Architecture** (Problem framing, user interviews, synthesis, HMW, user flows, crazy 8s sketching, 1-page case study outline).
  - **Week 2: Figma Mastery & Iterative Prototyping** (Auto layout, components & variants, visual hierarchy, tokens/variables, smart animate prototyping, usability testing, design iteration, end-to-end polished flow).
  - **Week 3: Accessibility, Systems & Portfolio Storytelling** (WCAG 2.2 AA audit, UX writing & microcopy, product metrics/experiments, design-to-dev handoff redlining, RICE roadmaps, published case study, 21-day retro).
- **Three Task Types Every Day**:
  1. `[Learn 45m]` — Deep dive into core design principles and industry models.
  2. `[Practice]` — Focused hands-on exercise on your canvas.
  3. `[Ship 🚀]` — A tangible design artifact (Figma frame, flow diagram, research note, prototype).
- **Mandatory Proof for Ship Tasks**:
  - The coach asks for proof (Figma frame link, Notion doc, Loom, or screenshot notes) before praising or completing a Ship task.
- **Three Coach Personas**:
  - **Sergeant Stern (Accountability Design Lead)**: Strict, disciplined, rejects theoretical fluff, demands proof links.
  - **Warm Mentor (Principal Design Director)**: Empathetic, seasoned, asks probing questions about user mental models and intentional craft.
  - **Hype Friend (Creative Cheerleader)**: High energy, ecstatic over every wireframe and interaction, celebrates daily momentum.
- **Design Critique Mode**:
  - User submits a Figma link or describes a layout, and the coach provides structured, in-persona feedback covering **Visual Hierarchy**, **Clarity & Scannability**, and **Accessibility**.
- **Strict Streak Rule & Portfolio Progress**:
  - A day counts as completed **only if all 3 tasks (Learn, Practice, Ship) are marked done**.
  - Weekly recap summarizes days complete and provides a **"Portfolio Progress"** line listing all shipped artifacts and their proof links.
- **Voice & Speech Engine**:
  - Web Speech API TTS with per-persona pitch, rate, and timbre, plus a one-click mute toggle.
  - Speech-to-Text microphone dictation in the standup flow.
- **Daily Standup Flow**:
  - Coach asks 3 questions out loud (*"What did you ship?"*, *"What is blocking you?"*, *"What is today's core focus?"*), accepts speech or text, and updates tasks.
- **Focus Sprint Timer (25/5)**:
  - Integrated Pomodoro mode with coach announcements at start, halfway (12:30), and session completion.
- **Browser Notifications**:
  - Configurable morning plan (09:00) and evening check-in (18:00) reminders in the coach's persona voice.
- **Animated SVG Avatar**:
  - Scalable vector avatar with persona uniforms (Stern beret, Mentor designer glasses, Hype headband), eye blinks, speaking mouth sync, and `prefers-reduced-motion` support.
- **PWA & Offline Capability**:
  - Installs as a standalone PWA. Service worker (`sw.js`) caches the application shell so designers can review and tick tasks offline.
- **Persistence & Portability**:
  - State managed via an async `Storage` abstraction wrapping `localStorage` (ready for SQLite/Postgres), with full JSON backup export and import.
- **Enterprise Security**:
  - Strict Content-Security-Policy (CSP) via Helmet, IP rate limiting, input length caps, and strict `textContent` rendering (zero `innerHTML` or inline onclicks).
- **Talking-Head Video Stub**:
  - Route `POST /api/avatar-video` ready for D-ID or HeyGen integration.

---

## 📁 File Structure

```
Dev-coach/
├── package.json              # Project scripts & minimal dependencies
├── .env.example              # Environment template (zero secrets)
├── .gitignore                # Git ignore rules
├── server.js                 # Express server, Helmet CSP, rate-limit, static serve
├── lib/
│   ├── action-validator.js   # Allowlist & schema validation for DONE/UNDONE/ADD_TASK/NOTE/ADD_PROOF
│   ├── coach-service.js      # Anthropic client + mock coach (critique mode, proof demands)
│   └── streak.js             # Strict streak calculations & portfolio progress recap
├── tests/
│   ├── streak.test.js        # Unit tests for strict streak & weekly shipped artifacts
│   ├── action-validator.test.js # Unit tests for action schemas, ADD_PROOF & allowlist
│   ├── coach-service.test.js # Unit tests for proof demands on ship tasks & critique mode
│   ├── server.test.js        # End-to-end endpoint & CSP tests
│   └── verify-mock-chat.js   # Standalone mock chat verification script
└── public/
    ├── index.html            # Semantic HTML5 layout, accessible controls
    ├── styles.css            # Cream/forest-green design system, dark mode, responsive
    ├── manifest.webmanifest  # PWA configuration
    ├── sw.js                 # Service worker for offline asset caching
    ├── icons/                # Vector PWA app icons (192x192, 512x512)
    └── js/
        ├── app.js            # Main frontend coordinator & event dispatcher
        ├── storage.js        # Persistence module (async storage, export, import)
        ├── initial-tasks.js  # 21-day product designer curriculum (Learn, Practice, Ship)
        ├── personas.js       # Sergeant Stern, Warm Mentor, Hype Friend configurations
        ├── streak.js         # Client streak calculation & portfolio tracker
        ├── speech.js         # Web Speech API (TTS & SpeechRecognition)
        ├── avatar.js         # Animated SVG avatar engine with persona styling
        ├── critique.js       # Design critique modal for hierarchy/clarity/accessibility
        ├── standup.js        # 3-question daily design standup stepper
        ├── pomodoro.js       # 25/5 focus sprint timer engine
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
> **Note**: An API key is **not required** to run and test Design Coach! Without `ANTHROPIC_API_KEY`, Design Coach runs in **Built-in Mock Coach Mode**, handling task additions, proof attachments, critique mode, standup reviews, and proof requirements locally.

To connect Anthropic Claude models:
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
MODEL=claude-sonnet-5-5
PORT=3000
```

### 4. Run Unit Tests
Design Coach uses Node's native test runner (`node:test`):
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
2. In [Render Dashboard](https://dashboard.render.com/), click **New + > Web Service**.
3. Select this repository.
4. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, configure:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `ANTHROPIC_API_KEY`: *(Optional Claude API key)*
   - `MODEL`: `claude-sonnet-5-5`
6. Click **Deploy Web Service**.

### Deploying to Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Authenticate: `fly auth login`
3. Launch app:
   ```bash
   fly launch --no-deploy
   ```
4. Configure production secrets securely:
   ```bash
   fly secrets set ANTHROPIC_API_KEY="your-anthropic-key"
   ```
5. Deploy:
   ```bash
   fly deploy
   ```
6. Open your live app:
   ```bash
   fly open
   ```

---

## 🔮 What to Build Next

1. **Direct Figma API Integration**: Connect a Figma access token so the coach can fetch frame names, inspect layer counts, and preview thumbnails directly inside the chat and portfolio progress view.
2. **Server-Side SQLite / Postgres Store**: Swap [`public/js/storage.js`](file:///home/opes/Dev/Dev-coach/public/js/storage.js) to persist designer projects to an embedded SQLite database (or Turso/libSQL) with multi-device sync.
3. **Live Talking-Head Video Avatars**: Connect [`POST /api/avatar-video`](file:///home/opes/Dev/Dev-coach/server.js) with HeyGen or D-ID interactive streaming sessions for video coaching.
4. **Peer Design Circles**: Enable 4-person design critique pods where designers review each other's weekly shipped artifacts before graduating.