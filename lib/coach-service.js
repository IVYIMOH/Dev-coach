import { validateActions } from './action-validator.js';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-5-5';

/**
 * Persona definitions and voice instructions.
 */
export const PERSONAS = {
  pragmatist: {
    id: 'pragmatist',
    name: 'Alex Cole',
    title: 'The Pragmatic Lead',
    tagline: 'Ship it, measure real usage, iterate without ego.',
    tone: 'Direct, focused on MVP, cuts through overengineering. Encourages steady daily shipping.',
    speechSettings: { pitch: 1.0, rate: 1.05 }
  },
  sergeant: {
    id: 'sergeant',
    name: 'Sarge Vera',
    title: 'The Accountability Drill Sergeant',
    tagline: 'Discipline equals freedom. No excuses, only execution.',
    tone: 'High energy, intense accountability, challenges procrastination, celebrates hard-won wins.',
    speechSettings: { pitch: 1.15, rate: 1.12 }
  },
  architect: {
    id: 'architect',
    name: 'Dr. Marcus Chen',
    title: 'The Systems Architect',
    tagline: 'Think in systems, build sustainable leverage.',
    tone: 'Calm, thoughtful, values clean abstractions, deep focus, and sustainable developer velocity.',
    speechSettings: { pitch: 0.92, rate: 0.95 }
  }
};

/**
 * Formulates the system prompt for the coach.
 */
export function buildSystemPrompt(personaKey, currentDay, tasks) {
  const persona = PERSONAS[personaKey] || PERSONAS.pragmatist;
  const taskLines = (tasks || [])
    .map(t => `${t.id}|${t.day}|${t.done ? 'true' : 'false'}|${t.title}${t.note ? `|note:${t.note}` : ''}`)
    .join('\n');

  return `You are Dev Coach, an AI accountability coach for an intense 21-Day Product-Engineer Challenge.

PERSONA: ${persona.name} (${persona.title})
TAGLINE: "${persona.tagline}"
VOICE TONE: ${persona.tone}

CURRENT STATE:
- Current Challenge Day: Day ${currentDay} of 21
- Existing Tasks (id|day|done|title):
${taskLines || 'None'}

STRICT PROTOCOL:
You MUST reply with ONLY a single, valid JSON object in this exact schema, with no preamble and no markdown wrapper:
{
  "reply": "Your in-character spoken reply to the developer (keep it concise, 2-4 punchy sentences, speaking directly to them)",
  "actions": [
    {
      "type": "DONE",
      "data": { "id": "task_id_here" }
    },
    {
      "type": "UNDONE",
      "data": { "id": "task_id_here" }
    },
    {
      "type": "ADD_TASK",
      "data": { "day": 1-21, "title": "Task title here", "note": "optional notes" }
    },
    {
      "type": "NOTE",
      "data": { "id": "task_id_here", "note": "text of note" }
    }
  ]
}

RULES:
1. If the user mentions completing a task (e.g. "finished TypeScript", "done with auth"), find the corresponding task id from the list and return a DONE action.
2. If the user wants to uncheck or rollback a task, return an UNDONE action.
3. If the user asks to add a task (e.g. "add a task on day 5: read about RLS"), determine the target day (defaulting to current day if unspecified) and return an ADD_TASK action.
4. If the user is reporting a standup or feeling stuck, reply with advice in character and update notes or tasks accordingly.
5. Never invent unknown task IDs for DONE/UNDONE/NOTE actions. If you cannot match an ID, omit that action and mention it in the reply.
6. Actions array can be empty [] if the message is purely conversational or a question.`;
}

/**
 * Intelligent Mock Coach when ANTHROPIC_API_KEY is not set.
 */
export function generateMockReply(personaKey, currentDay, tasks, userMessage) {
  const persona = PERSONAS[personaKey] || PERSONAS.pragmatist;
  const msgLower = (userMessage || '').toLowerCase();
  const taskList = Array.isArray(tasks) ? tasks : [];
  const taskIds = new Set(taskList.map(t => t.id));
  const actions = [];
  let replyText = '';

  // 1. Check for task addition: e.g. "add a task on day 5: read about RLS" or "add task ..."
  const addMatch = (userMessage || '').match(/add (?:a )?task(?: on day (\d+))?[:\- ]+(.+)/i);
  if (addMatch) {
    const specifiedDay = addMatch[1] ? parseInt(addMatch[1], 10) : currentDay;
    const taskDay = Math.min(21, Math.max(1, specifiedDay || currentDay));
    const title = addMatch[2].replace(/^["']|["']$/g, '').trim();

    if (title) {
      actions.push({
        type: 'ADD_TASK',
        data: {
          day: taskDay,
          title: title.slice(0, 180),
          note: `Added during Day ${currentDay} check-in`
        }
      });
      if (persona.id === 'sergeant') {
        replyText = `Locked in! Added "${title}" to Day ${taskDay}. Commit to it and execute!`;
      } else if (persona.id === 'architect') {
        replyText = `Good scoping. I have scheduled "${title}" on Day ${taskDay}. Keep your system modular.`;
      } else {
        replyText = `Got it. Added "${title}" for Day ${taskDay}. One more concrete deliverable on the board.`;
      }
    }
  }

  // 2. Check for task completion: "finished ...", "done ...", "completed ..."
  if (!actions.length && (msgLower.includes('finished') || msgLower.includes('done') || msgLower.includes('completed'))) {
    // Attempt to match against task title or id
    let matchedTask = null;

    // Check direct ID mentions
    for (const task of taskList) {
      if (msgLower.includes(task.id.toLowerCase())) {
        matchedTask = task;
        break;
      }
    }

    // Check title substring
    if (!matchedTask) {
      for (const task of taskList) {
        const words = task.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const hasKeyword = words.some(w => msgLower.includes(w));
        if (hasKeyword && !task.done) {
          matchedTask = task;
          break;
        }
      }
    }

    // Fallback: match first incomplete task of current day
    if (!matchedTask) {
      matchedTask = taskList.find(t => t.day === currentDay && !t.done);
    }

    if (matchedTask) {
      actions.push({
        type: 'DONE',
        data: { id: matchedTask.id }
      });
      if (persona.id === 'sergeant') {
        replyText = `Outstanding discipline! Marked "${matchedTask.title}" as DONE. Keep pushing—momentum is everything!`;
      } else if (persona.id === 'architect') {
        replyText = `Excellent progress. "${matchedTask.title}" is complete. Solid craftsmanship compounds over 21 days.`;
      } else {
        replyText = `Boom. Marked "${matchedTask.title}" complete. Ship daily and let the wins stack up.`;
      }
    } else {
      replyText = `Great effort! I couldn't pinpoint the exact task in your tracker—let me know the task title or day, or check it off in the list.`;
    }
  }

  // 3. Standup report or blocker check
  if (!replyText && (msgLower.includes('standup') || msgLower.includes('blocking') || msgLower.includes('blocking me'))) {
    if (persona.id === 'sergeant') {
      replyText = `Standup received! Acknowledge the blockers, break them into microscopic steps, and crush the priority task for Day ${currentDay}. Let's move!`;
    } else if (persona.id === 'architect') {
      replyText = `Understood. Isolate the blocker by inspecting boundary interfaces. Your primary objective for Day ${currentDay} will unlock downstream flow.`;
    } else {
      replyText = `Solid standup update. Don't let blockers sit—tackle the smallest unblocker first, then finish today's milestone.`;
    }
  }

  // 4. Default conversational response in persona
  if (!replyText) {
    if (persona.id === 'sergeant') {
      replyText = `Coach Sarge here! Day ${currentDay} is in play. What are you shipping right now? Give me status or tell me what task is done!`;
    } else if (persona.id === 'architect') {
      replyText = `Greetings. On Day ${currentDay}, focus on coherence and deliberate execution. Let me know which tasks you are advancing.`;
    } else {
      replyText = `Hey there. Day ${currentDay} is underway. Keep it simple, ship what's in front of you, and let me know whenever you finish a task.`;
    }
  }

  return {
    reply: replyText,
    actions: validateActions(actions, taskIds)
  };
}

/**
 * Main chat handler: sends to Anthropic API if key is present,
 * or delegates to intelligent mock coach if key is absent.
 */
export async function handleCoachChat({
  apiKey,
  model,
  persona = 'pragmatist',
  currentDay = 1,
  tasks = [],
  message
}) {
  const effectiveModel = model || process.env.MODEL || DEFAULT_MODEL;
  const effectiveApiKey = apiKey || process.env.ANTHROPIC_API_KEY;
  const taskIds = new Set((tasks || []).map(t => t.id));

  // If no API key configured, use local mock
  if (!effectiveApiKey || !effectiveApiKey.trim()) {
    return generateMockReply(persona, currentDay, tasks, message);
  }

  const systemPrompt = buildSystemPrompt(persona, currentDay, tasks);

  const payload = {
    model: effectiveModel,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: message
      }
    ]
  };

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': effectiveApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errMessage = `Anthropic API error (${response.status})`;
    try {
      const errJson = JSON.parse(errorText);
      if (errJson?.error?.message) errMessage += `: ${errJson.error.message}`;
    } catch {
      errMessage += `: ${errorText.slice(0, 100)}`;
    }
    throw new Error(errMessage);
  }

  const data = await response.json();
  const rawText = data.content?.find(b => b.type === 'text')?.text || '';

  // Extract JSON from response (handling potential markdown blocks)
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleanJson);
    const validatedActions = validateActions(parsed.actions || [], taskIds);
    return {
      reply: typeof parsed.reply === 'string' ? parsed.reply : rawText,
      actions: validatedActions
    };
  } catch (parseErr) {
    // Graceful fallback if model returned non-JSON text
    return {
      reply: rawText,
      actions: []
    };
  }
}
