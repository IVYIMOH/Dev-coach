import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleCoachChat } from './lib/coach-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware: Helmet with strict Content-Security-Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(express.json({ limit: '100kb' }));

// Rate limiter for API endpoints (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', apiLimiter);

// ── API: POST /api/chat ───────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { message, persona, currentDay, tasks } = req.body || {};

    // Validate message
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Field "message" must be a non-empty string' });
    }

    // Cap message length
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 2000 characters' });
    }

    // Validate persona
    const validPersonas = ['sergeant', 'mentor', 'hype'];
    const safePersona = validPersonas.includes(persona) ? persona : 'sergeant';

    // Validate currentDay
    const safeDay = Math.min(18, Math.max(1, Number(currentDay) || 1));

    // Validate tasks array
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    const result = await handleCoachChat({
      persona: safePersona,
      currentDay: safeDay,
      tasks: safeTasks,
      message: message.trim()
    });

    res.json(result);
  } catch (err) {
    console.error('Error handling /api/chat:', err.message);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
});

// ── API: POST /api/avatar-video ───────────────────────────────────────────────
// Talking-head provider stub (D-ID or HeyGen)
// Disabled unless provider key is set in environment
app.post('/api/avatar-video', async (req, res) => {
  const didKey = process.env.DID_API_KEY;
  const heygenKey = process.env.HEYGEN_API_KEY;

  if (!didKey && !heygenKey) {
    return res.status(501).json({
      enabled: false,
      message: 'Talking-head video avatar is disabled. Set DID_API_KEY or HEYGEN_API_KEY in environment to enable.'
    });
  }

  const { text, persona } = req.body || {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Field "text" is required for avatar video generation' });
  }

  const provider = didKey ? 'd-id' : 'heygen';

  // Stub response simulating queued video render
  return res.json({
    enabled: true,
    provider,
    status: 'queued',
    videoId: `stub_${Date.now()}`,
    message: `Video generation queued with provider ${provider}. (Stub implementation)`
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mockMode: !Boolean(process.env.ANTHROPIC_API_KEY),
    model: process.env.MODEL || 'claude-sonnet-5-5',
    timestamp: new Date().toISOString()
  });
});

// Static files (public directory)
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server if executed directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`Dev Coach server listening on http://localhost:${PORT}`);
    console.log(`Mode: ${process.env.ANTHROPIC_API_KEY ? 'Anthropic Live API' : 'Built-in Mock Coach'}`);
  });
}

export default app;
