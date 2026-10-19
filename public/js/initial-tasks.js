/**
 * 21-Day Product Designer Challenge Curriculum
 * Each day contains 3 structured tasks:
 * 1. Learn (45 min)
 * 2. Practice (Focused hands-on exercise)
 * 3. Ship (One tangible artifact with optional proof link)
 */

export const INITIAL_TASKS = [
  // ── Week 1: Research, Strategy & Architecture ──────────────────────────────
  // Day 1: Define a product problem and target user
  { id: 'd1-learn', day: 1, type: 'learn', title: 'Learn (45m): Problem validation frameworks and target persona criteria', done: false, proof: '', note: '' },
  { id: 'd1-practice', day: 1, type: 'practice', title: 'Practice: Draft a 1-page problem statement and user proto-persona', done: false, proof: '', note: '' },
  { id: 'd1-ship', day: 1, type: 'ship', title: 'Ship: Completed Problem Canvas with verified target user criteria', done: false, proof: '', note: '' },

  // Day 2: User research: plan and run interviews
  { id: 'd2-learn', day: 2, type: 'learn', title: 'Learn (45m): Non-leading interview questions & Mom Test principles', done: false, proof: '', note: '' },
  { id: 'd2-practice', day: 2, type: 'practice', title: 'Practice: Write a 5-question user research interview script', done: false, proof: '', note: '' },
  { id: 'd2-ship', day: 2, type: 'ship', title: 'Ship: Raw notes & audio recording link from at least 1 user interview', done: false, proof: '', note: '' },

  // Day 3: Synthesis: insights, personas, jobs-to-be-done
  { id: 'd3-learn', day: 3, type: 'learn', title: 'Learn (45m): Affinity mapping and Jobs-To-Be-Done (JTBD) statement design', done: false, proof: '', note: '' },
  { id: 'd3-practice', day: 3, type: 'practice', title: 'Practice: Cluster research quotes into 3 key user pain themes', done: false, proof: '', note: '' },
  { id: 'd3-ship', day: 3, type: 'ship', title: 'Ship: FigJam or Notion synthesis board with 3 validated JTBD statements', done: false, proof: '', note: '' },

  // Day 4: Problem framing and How Might We
  { id: 'd4-learn', day: 4, type: 'learn', title: 'Learn (45m): Turning pain points into fertile "How Might We" opportunity spaces', done: false, proof: '', note: '' },
  { id: 'd4-practice', day: 4, type: 'practice', title: 'Practice: Write 5 diverging HMW statements for the primary JTBD', done: false, proof: '', note: '' },
  { id: 'd4-ship', day: 4, type: 'ship', title: 'Ship: Final framed HMW statement selected for product execution', done: false, proof: '', note: '' },

  // Day 5: Information architecture and user flows
  { id: 'd5-learn', day: 5, type: 'learn', title: 'Learn (45m): User flow conventions, decision diamonds, and mental models', done: false, proof: '', note: '' },
  { id: 'd5-practice', day: 5, type: 'practice', title: 'Practice: Map the step-by-step user journey from landing to core aha moment', done: false, proof: '', note: '' },
  { id: 'd5-ship', day: 5, type: 'ship', title: 'Ship: End-to-end task flow diagram in Figma with happy & error paths', done: false, proof: '', note: '' },

  // Day 6: Sketching and low-fidelity wireframes
  { id: 'd6-learn', day: 6, type: 'learn', title: 'Learn (45m): Crazy Eights sketching technique and low-fidelity speed principles', done: false, proof: '', note: '' },
  { id: 'd6-practice', day: 6, type: 'practice', title: 'Practice: Sketch 8 rapid UI variations for the primary product screen', done: false, proof: '', note: '' },
  { id: 'd6-ship', day: 6, type: 'ship', title: 'Ship: Digital low-fidelity wireframe flow (5+ screens) in Figma', done: false, proof: '', note: '' },

  // Day 7: Week 1 mini-ship: one-page case study outline
  { id: 'd7-learn', day: 7, type: 'learn', title: 'Learn (45m): Storytelling structures for product design case studies', done: false, proof: '', note: '' },
  { id: 'd7-practice', day: 7, type: 'practice', title: 'Practice: Outline your project context, problem, research, and early wires', done: false, proof: '', note: '' },
  { id: 'd7-ship', day: 7, type: 'ship', title: 'Ship: Published 1-page case study outline on Notion or portfolio draft', done: false, proof: '', note: '' },

  // ── Week 2: Figma Mastery & Iterative Prototyping ──────────────────────────
  // Day 8: Figma fundamentals: auto layout, components, variants
  { id: 'd8-learn', day: 8, type: 'learn', title: 'Learn (45m): Auto Layout 5.0, nesting rules, min/max widths, and component sets', done: false, proof: '', note: '' },
  { id: 'd8-practice', day: 8, type: 'practice', title: 'Practice: Build a responsive card component with nested Auto Layout', done: false, proof: '', note: '' },
  { id: 'd8-ship', day: 8, type: 'ship', title: 'Ship: Reusable button & card component set with variants (states & sizes)', done: false, proof: '', note: '' },

  // Day 9: Visual design: type, color, spacing, grids
  { id: 'd9-learn', day: 9, type: 'learn', title: 'Learn (45m): Modular typographic scales, 8pt spacing system, and accessible palettes', done: false, proof: '', note: '' },
  { id: 'd9-practice', day: 9, type: 'practice', title: 'Practice: Establish a 4pt/8pt spatial grid and semantic color hierarchy', done: false, proof: '', note: '' },
  { id: 'd9-ship', day: 9, type: 'ship', title: 'Ship: Visual Foundations sheet in Figma (Typography, Colors, Spacing tokens)', done: false, proof: '', note: '' },

  // Day 10: Design systems and tokens
  { id: 'd10-learn', day: 10, type: 'learn', title: 'Learn (45m): Figma Variables, design tokens, light/dark modes, and documentation', done: false, proof: '', note: '' },
  { id: 'd10-practice', day: 10, type: 'practice', title: 'Practice: Bind colors and border radiuses to local Figma variables', done: false, proof: '', note: '' },
  { id: 'd10-ship', day: 10, type: 'ship', title: 'Ship: Mini design system with documented tokens and theme switching demo', done: false, proof: '', note: '' },

  // Day 11: Prototyping and interaction design
  { id: 'd11-learn', day: 11, type: 'learn', title: 'Learn (45m): Micro-interactions, smart animate transitions, and component properties', done: false, proof: '', note: '' },
  { id: 'd11-practice', day: 11, type: 'practice', title: 'Practice: Wire up interactive component states (hover, pressed, loading)', done: false, proof: '', note: '' },
  { id: 'd11-ship', day: 11, type: 'ship', title: 'Ship: Clickable, interactive prototype link covering the primary flow', done: false, proof: '', note: '' },

  // Day 12: Usability testing
  { id: 'd12-learn', day: 12, type: 'learn', title: 'Learn (45m): Usability testing protocols, task scenarios, and think-aloud methods', done: false, proof: '', note: '' },
  { id: 'd12-practice', day: 12, type: 'practice', title: 'Practice: Run an unmoderated or moderated test session on your prototype', done: false, proof: '', note: '' },
  { id: 'd12-ship', day: 12, type: 'ship', title: 'Ship: Usability test findings summary with 3 prioritized UX blockers', done: false, proof: '', note: '' },

  // Day 13: Iterate from feedback
  { id: 'd13-learn', day: 13, type: 'learn', title: 'Learn (45m): Feedback triage frameworks and avoiding over-correction', done: false, proof: '', note: '' },
  { id: 'd13-practice', day: 13, type: 'practice', title: 'Practice: Redesign the screens that caused user hesitation in testing', done: false, proof: '', note: '' },
  { id: 'd13-ship', day: 13, type: 'ship', title: 'Ship: Side-by-side Before/After Figma frame documenting test iterations', done: false, proof: '', note: '' },

  // Day 14: Ship a polished end-to-end flow (portfolio piece 1)
  { id: 'd14-learn', day: 14, type: 'learn', title: 'Learn (45m): Visual polish, micro-copy alignment, and delight in UI states', done: false, proof: '', note: '' },
  { id: 'd14-practice', day: 14, type: 'practice', title: 'Practice: Polish all empty, loading, error, and success states in your flow', done: false, proof: '', note: '' },
  { id: 'd14-ship', day: 14, type: 'ship', title: 'Ship: High-fidelity polished end-to-end flow (Figma public view link)', done: false, proof: '', note: '' },

  // ── Week 3: Accessibility, Systems & Portfolio Storytelling ───────────────
  // Day 15: Accessibility (WCAG, contrast, focus, touch targets)
  { id: 'd15-learn', day: 15, type: 'learn', title: 'Learn (45m): WCAG 2.2 AA standards, 4.5:1 contrast, 44x44px touch targets, focus rings', done: false, proof: '', note: '' },
  { id: 'd15-practice', day: 15, type: 'practice', title: 'Practice: Audit your design flow with Stark or Contrast plugin in Figma', done: false, proof: '', note: '' },
  { id: 'd15-ship', day: 15, type: 'ship', title: 'Ship: Completed Accessibility Audit Scorecard with fixes applied', done: false, proof: '', note: '' },

  // Day 16: UX writing and microcopy
  { id: 'd16-learn', day: 16, type: 'learn', title: 'Learn (45m): Tone of voice, error recovery copy, button labels, and concise clarity', done: false, proof: '', note: '' },
  { id: 'd16-practice', day: 16, type: 'practice', title: 'Practice: Rewrite all CTA buttons, tooltips, and system error dialogs', done: false, proof: '', note: '' },
  { id: 'd16-ship', day: 16, type: 'ship', title: 'Ship: Content style guide & revised UI copy matrix frame in Figma', done: false, proof: '', note: '' },

  // Day 17: Product metrics and experiments
  { id: 'd17-learn', day: 17, type: 'learn', title: 'Learn (45m): North Star metrics, activation rates, funnel drop-off, and A/B test framing', done: false, proof: '', note: '' },
  { id: 'd17-practice', day: 17, type: 'practice', title: 'Practice: Define success metrics & hypothesis for your new design feature', done: false, proof: '', note: '' },
  { id: 'd17-ship', day: 17, type: 'ship', title: 'Ship: 1-page Product Experiment Spec detailing hypothesis and measurement', done: false, proof: '', note: '' },

  // Day 18: Design-to-dev handoff and working with engineers
  { id: 'd18-learn', day: 18, type: 'learn', title: 'Learn (45m): Dev mode in Figma, redlining, edge cases, and engineering empathy', done: false, proof: '', note: '' },
  { id: 'd18-practice', day: 18, type: 'practice', title: 'Practice: Annotate spacing, dynamic behaviors, and responsive breakpoints', done: false, proof: '', note: '' },
  { id: 'd18-ship', day: 18, type: 'ship', title: 'Ship: Dev-Ready Handoff Specification with screen states & edge cases', done: false, proof: '', note: '' },

  // Day 19: Prioritization and roadmaps (RICE, impact vs effort)
  { id: 'd19-learn', day: 19, type: 'learn', title: 'Learn (45m): RICE scoring, impact vs effort matrix, and phased MVP scoping', done: false, proof: '', note: '' },
  { id: 'd19-practice', day: 19, type: 'practice', title: 'Practice: Score 6 product features on a 2x2 Impact vs Effort matrix', done: false, proof: '', note: '' },
  { id: 'd19-ship', day: 19, type: 'ship', title: 'Ship: Product Roadmap matrix separating V1 MVP vs V2 future horizons', done: false, proof: '', note: '' },

  // Day 20: Portfolio case study and storytelling
  { id: 'd20-learn', day: 20, type: 'learn', title: 'Learn (45m): How hiring managers skim portfolio case studies in under 2 minutes', done: false, proof: '', note: '' },
  { id: 'd20-practice', day: 20, type: 'practice', title: 'Practice: Assemble hero mockups, process artifacts, and measurable outcomes', done: false, proof: '', note: '' },
  { id: 'd20-ship', day: 20, type: 'ship', title: 'Ship: Comprehensive case study article published on your portfolio / Notion', done: false, proof: '', note: '' },

  // Day 21: Retro and plan the next 21 days
  { id: 'd21-learn', day: 21, type: 'learn', title: 'Learn (45m): Design career ladders, personal craft growth, and continuous shipping', done: false, proof: '', note: '' },
  { id: 'd21-practice', day: 21, type: 'practice', title: 'Practice: Conduct a 3-part retro: What went well, What was hard, What is next', done: false, proof: '', note: '' },
  { id: 'd21-ship', day: 21, type: 'ship', title: 'Ship: 21-Day Challenge graduation retrospective and next 21-day roadmap', done: false, proof: '', note: '' }
];
