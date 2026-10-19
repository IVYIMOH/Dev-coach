import { validateActions } from './action-validator.js';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-5-5';

/**
 * Three Product Designer Coach Personas
 */
export const PERSONAS = {
  sergeant: {
    id: 'sergeant',
    name: 'Sergeant Stern',
    title: 'Accountability Design Lead',
    tagline: 'No hand-waving, only shipped Figma frames. Show me the proof!',
    tone: 'Tough, disciplined, allergic to excuses. Pushes for concrete artifacts over theoretical consumption. Demands proof links before celebrating Ship tasks.',
    speechSettings: { pitch: 1.1, rate: 1.15 }
  },
  mentor: {
    id: 'mentor',
    name: 'Warm Mentor',
    title: 'Principal Design Director',
    tagline: 'Design with intention, test with humility, craft with care.',
    tone: 'Empathetic, seasoned, insightful. Asks probing questions about user mental models, information hierarchy, and sustainable design craft.',
    speechSettings: { pitch: 0.98, rate: 1.0 }
  },
  hype: {
    id: 'hype',
    name: 'Hype Friend',
    title: 'Creative Cheerleader',
    tagline: "OMG that flow is fire! Let's ship it and celebrate!",
    tone: 'High-energy, wildly enthusiastic, optimistic. Keeps creative momentum soaring and turns every wireframe into a milestone.',
    speechSettings: { pitch: 1.18, rate: 1.18 }
  }
};

/**
 * Formulates the system prompt for the Design Coach.
 */
export function buildSystemPrompt(personaKey, currentDay, tasks) {
  const persona = PERSONAS[personaKey] || PERSONAS.sergeant;
  const taskLines = (tasks || [])
    .map(t => `${t.id}|${t.day}|${t.done ? 'true' : 'false'}|${t.type || 'practice'}|${t.title}|${t.proof ? `proof:${t.proof}` : 'no-proof'}`)
    .join('\n');

  return `You are Design Coach, an AI accountability partner for an intensive 18-Day Product Designer Challenge.

PERSONA: ${persona.name} (${persona.title})
TAGLINE: "${persona.tagline}"
VOICE TONE: ${persona.tone}

CURRENT CHALLENGE CONTEXT:
- Active Day: Day ${currentDay} of 18
- Existing Tasks (id|day|done|type|title|proof):
${taskLines || 'None'}

TASK RULES:
Every day has three tasks:
1. "learn" — 45 min deep dive into principles and case studies
2. "practice" — a focused hands-on design exercise
3. "ship" — one tangible artifact (e.g. Figma frame, user flow, research note, prototype)

CRITICAL PROTOCOL:
1. THE COACH ASKS FOR PROOF BEFORE PRAISING A SHIP TASK:
   If the user reports completing a "ship" task but has NOT provided proof (a Figma link, Notion doc, Loom, or artifact summary), DO NOT mark it done yet. Challenge them in persona to produce the proof link or description first!
   Only emit a DONE action for a ship task if proof is provided in the message or already present in the task.
2. CRITIQUE MODE:
   When the user submits a design for critique (a link, description, or pasted layout), give concise, actionable feedback structured around:
   - Visual Hierarchy
   - Clarity & Scannability
   - Accessibility (contrast, touch targets, readability)
3. Return ONLY a single, valid JSON object in this exact schema without markdown backticks:
{
  "reply": "Spoken reply to the designer (concise, 2-4 sentences in persona voice)",
  "actions": [
    {
      "type": "DONE|UNDONE|ADD_TASK|NOTE|ADD_PROOF",
      "data": { ... }
    }
  ]
}

ACTION SCHEMAS:
- DONE: { "id": "task_id" }
- UNDONE: { "id": "task_id" }
- ADD_TASK: { "day": 1-18, "type": "learn"|"practice"|"ship", "title": "...", "note"?: "...", "proof"?: "..." }
- NOTE: { "id": "task_id", "note": "..." }
- ADD_PROOF: { "id": "task_id", "proof": "..." }`;
}

/**
 * Intelligent Mock Coach when ANTHROPIC_API_KEY is not set.
 */
export function generateMockReply(personaKey, currentDay, tasks, userMessage) {
  const persona = PERSONAS[personaKey] || PERSONAS.sergeant;
  const msgLower = (userMessage || '').toLowerCase();
  const taskList = Array.isArray(tasks) ? tasks : [];
  const taskIds = new Set(taskList.map(t => t.id));
  const actions = [];
  let replyText = '';

  // Extract any URL provided in the message as potential proof
  const urlMatch = (userMessage || '').match(/https?:\/\/[^\s]+/i);
  const extractedUrl = urlMatch ? urlMatch[0] : null;

  // 1. Critique mode request
  if (msgLower.startsWith('critique') || msgLower.includes('critique this') || msgLower.includes('review my design') || msgLower.includes('critique mode')) {
    if (persona.id === 'sergeant') {
      replyText = `Stern Critique incoming: 1) Hierarchy: Ensure your primary call-to-action outshines secondary links by 3x weight. 2) Clarity: Reduce cognitive load—cut the visual noise in the header. 3) Accessibility: Check your body contrast against 4.5:1 WCAG minimum. Fix those in Figma now!`;
    } else if (persona.id === 'hype') {
      replyText = `Yesss, let's look at this layout! 1) Hierarchy: The hero typography pops, but let's give the button more breathing room! 2) Clarity: Super easy to scan! 3) Accessibility: Bump that light gray label up a shade for contrast. It's looking so good, keep refining!`;
    } else {
      replyText = `Mentor observations: 1) Hierarchy: Guide the user's eye naturally from the problem statement to the key action. 2) Clarity: Group related elements using consistent spacing tokens. 3) Accessibility: Verify touch targets are at least 44x44px. What intentional choices did you make here?`;
    }
    return { reply: replyText, actions: [] };
  }

  // 2. Add proof command: e.g. "add proof for d1-ship: https://figma.com/..." or containing URL
  const proofMatch = (userMessage || '').match(/(?:add|here is|attached) proof (?:for ([a-z0-9\-_]+))?[:\- ]+(.+)/i);
  if (proofMatch) {
    const specifiedId = proofMatch[1];
    const proofContent = proofMatch[2].trim();
    let targetTask = null;

    if (specifiedId && taskIds.has(specifiedId)) {
      targetTask = taskList.find(t => t.id === specifiedId);
    } else {
      targetTask = taskList.find(t => t.day === currentDay && t.type === 'ship') || taskList.find(t => t.day === currentDay);
    }

    if (targetTask) {
      actions.push({
        type: 'ADD_PROOF',
        data: { id: targetTask.id, proof: proofContent }
      });
      if (!targetTask.done) {
        actions.push({
          type: 'DONE',
          data: { id: targetTask.id }
        });
      }

      if (persona.id === 'sergeant') {
        replyText = `Artifact verified! Proof attached for "${targetTask.title}". Now that is real design output. Marked DONE!`;
      } else if (persona.id === 'hype') {
        replyText = `Woohoo! I see the proof for "${targetTask.title}"! Shipped and locked in! You are crushing this sprint!`;
      } else {
        replyText = `Wonderful. I've archived your artifact proof for "${targetTask.title}" and marked it complete. Tangible progress is the foundation of a great portfolio.`;
      }
      return { reply: replyText, actions: validateActions(actions, taskIds) };
    }
  }

  // 3. Add task: e.g. "add a task on day 5: sketch onboarding flow"
  const addMatch = (userMessage || '').match(/add (?:a )?task(?: on day (\d+))?[:\- ]+(.+)/i);
  if (addMatch) {
    const specifiedDay = addMatch[1] ? parseInt(addMatch[1], 10) : currentDay;
    const taskDay = Math.min(18, Math.max(1, specifiedDay || currentDay));
    const rawTitle = addMatch[2].replace(/^["']|["']$/g, '').trim();

    // Determine type
    let taskType = 'practice';
    if (/learn|read|study|watch/i.test(rawTitle)) taskType = 'learn';
    if (/ship|artifact|frame|wireframe|case study|figma|proto/i.test(rawTitle)) taskType = 'ship';

    actions.push({
      type: 'ADD_TASK',
      data: {
        day: taskDay,
        type: taskType,
        title: rawTitle.slice(0, 180),
        note: `Added during Day ${currentDay} session`
      }
    });

    if (persona.id === 'sergeant') {
      replyText = `Task added to Day ${taskDay} [${taskType.toUpperCase()}]: "${rawTitle}". Execute it with precision!`;
    } else if (persona.id === 'hype') {
      replyText = `Awesome addition! Put "${rawTitle}" on Day ${taskDay}. We are going to build such an epic portfolio!`;
    } else {
      replyText = `I have scheduled "${rawTitle}" on Day ${taskDay}. Remember to focus on user impact as you work through it.`;
    }
    return { reply: replyText, actions: validateActions(actions, taskIds) };
  }

  // 4. Task completion: "finished ...", "done ...", "shipped ..."
  if (msgLower.includes('finished') || msgLower.includes('done') || msgLower.includes('completed') || msgLower.includes('shipped')) {
    let matchedTask = null;

    // Direct ID check
    for (const task of taskList) {
      if (msgLower.includes(task.id.toLowerCase())) {
        matchedTask = task;
        break;
      }
    }

    // Title keyword check
    if (!matchedTask) {
      for (const task of taskList) {
        const words = task.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        if (words.some(w => msgLower.includes(w)) && !task.done) {
          matchedTask = task;
          break;
        }
      }
    }

    // Fallback: match incomplete task of current day
    if (!matchedTask) {
      matchedTask = taskList.find(t => t.day === currentDay && !t.done);
    }

    if (matchedTask) {
      // CHECK PROOF RULE FOR SHIP TASKS
      const isShipTask = matchedTask.type === 'ship' || msgLower.includes('ship');
      const hasProof = Boolean(matchedTask.proof) || Boolean(extractedUrl);

      if (isShipTask && !hasProof) {
        // Coach holds back and demands proof before praising!
        if (persona.id === 'sergeant') {
          replyText = `Hold the applause! "${matchedTask.title}" is a SHIP task. Where is the artifact? Drop your Figma link, Notion doc, or design notes before I sign off on this!`;
        } else if (persona.id === 'hype') {
          replyText = `Ahhh you finished it?! Show me, show me! Drop the Figma or artifact link so I can hype up your proof!`;
        } else {
          replyText = `That is an important milestone: "${matchedTask.title}". Before we check it off, share your artifact link or documentation note so we can record your portfolio proof.`;
        }
        return { reply: replyText, actions: [] };
      }

      // If proof was provided in this message, attach it
      if (extractedUrl) {
        actions.push({
          type: 'ADD_PROOF',
          data: { id: matchedTask.id, proof: extractedUrl }
        });
      }

      actions.push({
        type: 'DONE',
        data: { id: matchedTask.id }
      });

      if (persona.id === 'sergeant') {
        replyText = `Confirmed! Marked "${matchedTask.title}" as DONE. Great execution. Keep the momentum moving!`;
      } else if (persona.id === 'hype') {
        replyText = `Boom! "${matchedTask.title}" is officially DONE! Look at that progress bar fly! Proud of you!`;
      } else {
        replyText = `Well done. "${matchedTask.title}" is complete. Every thoughtful iteration brings your portfolio piece closer to life.`;
      }
      return { reply: replyText, actions: validateActions(actions, taskIds) };
    } else {
      replyText = `Good effort! Which specific task did you finish? Tell me the title or check it on your Day ${currentDay} board.`;
      return { reply: replyText, actions: [] };
    }
  }

  // 5. Standup check-in
  if (msgLower.includes('standup') || msgLower.includes('shipped') || msgLower.includes('blocking')) {
    if (persona.id === 'sergeant') {
      replyText = `Standup received. Clear the blockers, open Figma, and focus on your one core artifact for Day ${currentDay}. Let's work!`;
    } else if (persona.id === 'hype') {
      replyText = `Great daily standup! Love the honesty about the blockers. Let's conquer Day ${currentDay}'s challenge together!`;
    } else {
      replyText = `Thank you for the update. Unblock yourself by framing the user journey simply. Let's make today's milestone count.`;
    }
    return { reply: replyText, actions: [] };
  }

  // 6. Default greeting in persona voice
  if (persona.id === 'sergeant') {
    replyText = `Sergeant Stern reporting. Day ${currentDay} is underway. Don't just browse Dribbble—open your canvas, build real flows, and log your proof!`;
  } else if (persona.id === 'hype') {
    replyText = `Hey there, creative superstar! Day ${currentDay} is here and full of possibilities! What awesome design artifact are we creating today?!`;
  } else {
    replyText = `Welcome back. Day ${currentDay} presents an opportunity to hone your craft. What design challenge shall we tackle together?`;
  }

  return {
    reply: replyText,
    actions: []
  };
}

/**
 * Main chat handler: sends to Anthropic API if key is present,
 * or delegates to local mock coach if key is absent.
 */
export async function handleCoachChat({
  apiKey,
  model,
  persona = 'sergeant',
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

  // Extract JSON from response
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
    return {
      reply: rawText,
      actions: []
    };
  }
}
