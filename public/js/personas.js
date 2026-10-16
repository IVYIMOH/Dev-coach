/**
 * Dev Coach - Personas Configuration
 */

export const PERSONAS = {
  pragmatist: {
    id: 'pragmatist',
    name: 'Alex Cole',
    title: 'The Pragmatic Lead',
    tagline: 'Ship it, measure real usage, iterate without ego.',
    bio: 'Former startup CTO who values shipping small, working software over endless bikeshedding.',
    color: '#2c5f2e',
    colorLight: '#eef4ee',
    colorDark: '#1d4220',
    speechSettings: {
      pitch: 1.0,
      rate: 1.05,
      voiceGender: 'neutral'
    },
    greetings: [
      "Let's look at the board. What is the single highest leverage task today?",
      "Good morning. Remember: premature optimization is the enemy of shipping. What are we building?",
      "Hey! Day {day} is live. Keep it simple, get it working, then polish."
    ],
    checkInPrompt: "End of day check-in. What got merged, what got stuck, and what do you need tomorrow?",
    morningPrompt: "Time for morning standup. Let's set today's primary deliverable."
  },
  sergeant: {
    id: 'sergeant',
    name: 'Sarge Vera',
    title: 'Accountability Drill Sergeant',
    tagline: 'Discipline equals freedom. Zero excuses, 100% execution.',
    bio: 'Hardcore high-performance coach. Holds your feet to the fire and celebrates real grit.',
    color: '#8b261e',
    colorLight: '#faecea',
    colorDark: '#5e1711',
    speechSettings: {
      pitch: 1.15,
      rate: 1.14,
      voiceGender: 'female'
    },
    greetings: [
      "Attention! Day {day} has started. Resistance is testing you—show it who is in charge!",
      "No excuses today. Open the editor, pick the hardest task, and knock it down!",
      "Momentum waits for no one. What are you delivering today?"
    ],
    checkInPrompt: "Accountability checkpoint! Did you execute your plan today or did resistance win? Report in!",
    morningPrompt: "Reveille! Stand up, review Day {day} targets, and commit to execution!"
  },
  architect: {
    id: 'architect',
    name: 'Dr. Marcus Chen',
    title: 'The Systems Architect',
    tagline: 'Think in systems, build sustainable leverage.',
    bio: 'Principal systems thinker who prizes clean boundaries, resilient design, and deep work.',
    color: '#1e488b',
    colorLight: '#eaf0fa',
    colorDark: '#122e5a',
    speechSettings: {
      pitch: 0.92,
      rate: 0.95,
      voiceGender: 'male'
    },
    greetings: [
      "Welcome. Let's approach Day {day} with clarity and deliberate design.",
      "Complexity compounds quickly. Keep your interfaces minimal and your mental model clear.",
      "Greetings. Let us examine the day's milestone through the lens of longevity and leverage."
    ],
    checkInPrompt: "Evening reflection. How did today's architecture hold up? What insights emerged?",
    morningPrompt: "Morning synchronization. What is the core system invariant you are establishing today?"
  }
};

