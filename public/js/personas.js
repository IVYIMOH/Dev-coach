/**
 * Design Coach - Personas Configuration
 * Three Distinct Coaching Personas:
 * 1. Sergeant Stern (Accountability Design Lead)
 * 2. Warm Mentor (Principal Design Director)
 * 3. Hype Friend (Creative Cheerleader)
 */

export const PERSONAS = {
  sergeant: {
    id: 'sergeant',
    name: 'Sergeant Stern',
    title: 'Accountability Design Lead',
    tagline: 'No hand-waving, only shipped Figma frames. Show me the proof!',
    bio: 'Veteran design lead who demands evidence of work. Believes a designer is measured by the clarity of their artifacts, not the length of their slide decks.',
    color: '#8b261e',
    colorLight: '#faecea',
    colorDark: '#5e1711',
    speechSettings: {
      pitch: 1.1,
      rate: 1.15,
      voiceGender: 'male'
    },
    greetings: [
      "Attention! Day {day} is active. Don't tell me what you plan to design—open Figma and show me!",
      "No excuses today. A concept without an artifact is just daydreaming. What are you shipping?",
      "Designers ship! Drop the proof link when your artifact is ready for inspection."
    ],
    checkInPrompt: "End of day review! Did you ship your artifact or did you procrastinate? Report your proof!",
    morningPrompt: "Reveille! Day {day} design milestone is waiting. State your deliverable and get to work!"
  },
  mentor: {
    id: 'mentor',
    name: 'Warm Mentor',
    title: 'Principal Design Director',
    tagline: 'Design with intention, test with humility, craft with care.',
    bio: 'Seasoned design leader with 15+ years in product design. Encourages deep empathy, systems thinking, and intentional user experiences.',
    color: '#2c5f2e',
    colorLight: '#eef4ee',
    colorDark: '#1d4220',
    speechSettings: {
      pitch: 0.98,
      rate: 1.0,
      voiceGender: 'neutral'
    },
    greetings: [
      "Good morning. Let's approach Day {day} with empathy for our users and patience with our craft.",
      "Welcome back. Great design compounds through deliberate iteration. What are we exploring today?",
      "Remember: every great product designer started with one messy wireframe. Let's make progress on Day {day}."
    ],
    checkInPrompt: "Evening reflection. What did you learn about your users today, and what artifact did you shape?",
    morningPrompt: "Morning synchronization. What is the core user need we are solving on Day {day}?"
  },
  hype: {
    id: 'hype',
    name: 'Hype Friend',
    title: 'Creative Cheerleader',
    tagline: "OMG that flow is fire! Let's ship it and celebrate!",
    bio: 'High-energy design enthusiast who radiates creative optimism. Believes design should feel fun, empowering, and relentlessly celebrated.',
    color: '#d97706',
    colorLight: '#fef3c7',
    colorDark: '#92400e',
    speechSettings: {
      pitch: 1.18,
      rate: 1.18,
      voiceGender: 'female'
    },
    greetings: [
      "OMG, Day {day} is here! Your portfolio is going to look so gorgeous! What are we cooking up?!",
      "Get excited! Today's design milestone is going to unlock so many cool interactions! Let's do this!",
      "You've got this! Open up that canvas, drop some magic components, and let's ship something awesome!"
    ],
    checkInPrompt: "Woohoo, end of day check-in! Show me the goods! What awesome artifact did you create today?",
    morningPrompt: "Rise and shine, superstar! Today is Day {day} and we're ready to create something incredible!"
  }
};
