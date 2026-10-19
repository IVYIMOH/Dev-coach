/**
 * 18-Day Brutal Product Designer Challenge Curriculum
 * 18 Days. Zero fluff. Real artifacts only.
 * Divided into 3 Six-Day Sprints:
 * - Sprint 1 (Days 1–6): Problem Discovery & Strategic Architecture
 * - Sprint 2 (Days 7–12): Figma Systems, Visual Polish & Interactive Prototyping
 * - Sprint 3 (Days 13–18): Hardening, Engineering Alignment, Metrics & Portfolio Launch
 */

export const INITIAL_TASKS = [
  // ── SPRINT 1: PROBLEM DISCOVERY & STRATEGIC ARCHITECTURE (DAYS 1–6) ────────
  
  // Day 1: Problem Space Dissection & User Archetype
  { id: 'd1-learn', day: 1, type: 'learn', title: 'Learn (45m): Opportunity Solution Trees (Teresa Torres) & 5 Whys root cause analysis', done: false, proof: '', note: '' },
  { id: 'd1-practice', day: 1, type: 'practice', title: 'Practice: Deconstruct 3 competitor product churn points and map user drop-off triggers', done: false, proof: '', note: '' },
  { id: 'd1-ship', day: 1, type: 'ship', title: 'Ship: 1-Page Problem Canvas & Target User Archetype with validated behavioral hurdles', done: false, proof: '', note: '' },

  // Day 2: Guerilla User Research & Interview Extraction
  { id: 'd2-learn', day: 2, type: 'learn', title: 'Learn (45m): "The Mom Test" interview mechanics—extracting past behavior without leading bias', done: false, proof: '', note: '' },
  { id: 'd2-practice', day: 2, type: 'practice', title: 'Practice: Write a 6-question user interview script focused on past friction and workaround habits', done: false, proof: '', note: '' },
  { id: 'd2-ship', day: 2, type: 'ship', title: 'Ship: User Research Synthesis Matrix from 2 live interviews or 20+ verified community complaint threads', done: false, proof: '', note: '' },

  // Day 3: Jobs-To-Be-Done (JTBD) & Switching Anxieties
  { id: 'd3-learn', day: 3, type: 'learn', title: 'Learn (45m): Clayton Christensen JTBD framework: Functional, Emotional, and Social user jobs', done: false, proof: '', note: '' },
  { id: 'd3-practice', day: 3, type: 'practice', title: 'Practice: Map the 4 Forces of Progress (Push, Pull, Habit, Anxiety) for your target user', done: false, proof: '', note: '' },
  { id: 'd3-ship', day: 3, type: 'ship', title: 'Ship: FigJam JTBD Hierarchy Board with 3 prioritized, outcome-driven job statements', done: false, proof: '', note: '' },

  // Day 4: Problem Framing, How Might We (HMW) & MVP Scoping
  { id: 'd4-learn', day: 4, type: 'learn', title: 'Learn (45m): MoSCoW scoping and carving the Smallest Shippable Value wedge', done: false, proof: '', note: '' },
  { id: 'd4-practice', day: 4, type: 'practice', title: 'Practice: Draft 10 diverging HMW statements and plot on an Impact vs. Complexity 2x2 matrix', done: false, proof: '', note: '' },
  { id: 'd4-ship', day: 4, type: 'ship', title: 'Ship: Signed-Off MVP Boundary Document locking the core loop and explicitly cutting non-essential scope', done: false, proof: '', note: '' },

  // Day 5: Information Architecture & Complex User Flows
  { id: 'd5-learn', day: 5, type: 'learn', title: 'Learn (45m): Object-Oriented UX (OOUX), navigation models, and decision-tree edge casing', done: false, proof: '', note: '' },
  { id: 'd5-practice', day: 5, type: 'practice', title: 'Practice: Map the primary user flow including 3 branch decisions, 2 empty states, and 2 error states', done: false, proof: '', note: '' },
  { id: 'd5-ship', day: 5, type: 'ship', title: 'Ship: End-to-End User Flow Architecture Diagram in FigJam/Figma with logic diamonds and system responses', done: false, proof: '', note: '' },

  // Day 6: Speed Wireframing & Crazy 8s Divergence
  { id: 'd6-learn', day: 6, type: 'learn', title: 'Learn (45m): Fast low-fi divergence techniques; decoupling structural layout from aesthetic styling', done: false, proof: '', note: '' },
  { id: 'd6-practice', day: 6, type: 'practice', title: 'Practice: Run two timeboxed 8-minute Crazy Eights sketching rounds for the highest friction product screen', done: false, proof: '', note: '' },
  { id: 'd6-ship', day: 6, type: 'ship', title: 'Ship: Clickable Low-Fidelity Wireframe Flow (10+ screens) in Figma with zero dead ends', done: false, proof: '', note: '' },

  // ── SPRINT 2: FIGMA SYSTEMS, VISUAL POLISH & PROTOTYPING (DAYS 7–12) ────────
  
  // Day 7: Design Tokens & Semantic Variable Architecture
  { id: 'd7-learn', day: 7, type: 'learn', title: 'Learn (45m): Multi-tier design token architecture (Global -> Semantic -> Component) & Figma Variables', done: false, proof: '', note: '' },
  { id: 'd7-practice', day: 7, type: 'practice', title: 'Practice: Build semantic color modes (light/dark) and an 8pt spatial grid scale in Figma Variables', done: false, proof: '', note: '' },
  { id: 'd7-ship', day: 7, type: 'ship', title: 'Ship: Figma Design Tokens Library with published semantic variables and modular typographic scale', done: false, proof: '', note: '' },

  // Day 8: High-Yield Components, Auto Layout 5.0 & Variants
  { id: 'd8-learn', day: 8, type: 'learn', title: 'Learn (45m): Advanced Auto Layout: min/max bounds, nested hugging/filling, and slot architecture', done: false, proof: '', note: '' },
  { id: 'd8-practice', day: 8, type: 'practice', title: 'Practice: Build responsive form input and button component sets with all states (default, hover, focus, disabled, loading)', done: false, proof: '', note: '' },
  { id: 'd8-ship', day: 8, type: 'ship', title: 'Ship: Production-Grade UI Component Set (Buttons, Form Inputs, Modal, Navigation) with zero broken constraints', done: false, proof: '', note: '' },

  // Day 9: Visual Craft, Typographic Hierarchy & Data Display
  { id: 'd9-learn', day: 9, type: 'learn', title: 'Learn (45m): Gestalt grouping, optical alignment vs geometric centering, and high-density scannability', done: false, proof: '', note: '' },
  { id: 'd9-practice', day: 9, type: 'practice', title: 'Practice: Convert Day 6 low-fi wireframes to high-fidelity utilizing design tokens and spatial rhythm', done: false, proof: '', note: '' },
  { id: 'd9-ship', day: 9, type: 'ship', title: 'Ship: First 5 High-Fidelity Production Screens in Figma with pristine visual hierarchy and zero arbitrary values', done: false, proof: '', note: '' },

  // Day 10: State Machine Matrix (Empty, Partial, Error, Edge Cases)
  { id: 'd10-learn', day: 10, type: 'learn', title: 'Learn (45m): The 9 UI States: Ideal, Empty, Loading, Partial, Error, Success, Offline, Denied, and Extreme Data Overflow', done: false, proof: '', note: '' },
  { id: 'd10-practice', day: 10, type: 'practice', title: 'Practice: Stress-test UI components against 120-character strings, missing image avatars, and network dropouts', done: false, proof: '', note: '' },
  { id: 'd10-ship', day: 10, type: 'ship', title: 'Ship: Complete Edge Case & UI State Board covering all 9 states for the primary product flow', done: false, proof: '', note: '' },

  // Day 11: High-Fidelity Micro-Interactions & Smart Animate
  { id: 'd11-learn', day: 11, type: 'learn', title: 'Learn (45m): Interaction choreographies, spring physics curves, and cognitive continuity during state transitions', done: false, proof: '', note: '' },
  { id: 'd11-practice', day: 11, type: 'practice', title: 'Practice: Wire interactive component variants with hover delays, drawer slides, and smart-animate sheet transitions', done: false, proof: '', note: '' },
  { id: 'd11-ship', day: 11, type: 'ship', title: 'Ship: Fluid End-to-End Interactive Clickable Prototype in Figma ready for live usability testing', done: false, proof: '', note: '' },

  // Day 12: Usability Testing Under Fire & Protocol Execution
  { id: 'd12-learn', day: 12, type: 'learn', title: 'Learn (45m): Think-aloud testing protocols, objective observation vs defensive designer bias', done: false, proof: '', note: '' },
  { id: 'd12-practice', day: 12, type: 'practice', title: 'Practice: Run 2 unguided user test sessions with strict scenario prompts (e.g. "Complete task X without assistance")', done: false, proof: '', note: '' },
  { id: 'd12-ship', day: 12, type: 'ship', title: 'Ship: Usability Test Session Recording & Blocker Severity Matrix (Critical/High/Med) with user timestamps', done: false, proof: '', note: '' },

  // ── SPRINT 3: HARDENING, ENGINEERING HANDOFF & PORTFOLIO LAUNCH (DAYS 13–18) 
  
  // Day 13: Rapid Feedback Iteration & UX Triage
  { id: 'd13-learn', day: 13, type: 'learn', title: 'Learn (45m): Feedback triage: distinguishing individual user preference from architectural usability failure', done: false, proof: '', note: '' },
  { id: 'd13-practice', day: 13, type: 'practice', title: 'Practice: Redesign the two biggest points of drop-off or confusion identified during usability testing', done: false, proof: '', note: '' },
  { id: 'd13-ship', day: 13, type: 'ship', title: 'Ship: Before & After Iteration Board in Figma documenting tested user friction and verified UI solutions', done: false, proof: '', note: '' },

  // Day 14: WCAG 2.2 AA Accessibility & Assistive Tech Audit
  { id: 'd14-learn', day: 14, type: 'learn', title: 'Learn (45m): WCAG 2.2 AA standards: 4.5:1 text contrast, 3:1 UI components, 48x48px touch targets, focus rings', done: false, proof: '', note: '' },
  { id: 'd14-practice', day: 14, type: 'practice', title: 'Practice: Run Stark / Adee contrast audit across all screens and verify keyboard focus tab order', done: false, proof: '', note: '' },
  { id: 'd14-ship', day: 14, type: 'ship', title: 'Ship: Accessibility Compliance Scorecard verifying contrast ratios, touch targets, and ARIA labels across the app', done: false, proof: '', note: '' },

  // Day 15: UX Writing, Microcopy & Error Recovery
  { id: 'd15-learn', day: 15, type: 'learn', title: 'Learn (45m): Microcopy precision: writing error recovery copy (Problem + Cause + Clear Actionable Solution)', done: false, proof: '', note: '' },
  { id: 'd15-practice', day: 15, type: 'practice', title: 'Practice: Rewrite all button CTAs, tooltips, empty-state descriptions, and destructive confirmation modals', done: false, proof: '', note: '' },
  { id: 'd15-ship', day: 15, type: 'ship', title: 'Ship: UI Copy Matrix & Content Style Guide frame in Figma covering tone of voice and alert taxonomy', done: false, proof: '', note: '' },

  // Day 16: Product Analytics, North Star Metric & Experimentation Spec
  { id: 'd16-learn', day: 16, type: 'learn', title: 'Learn (45m): Event telemetry schemas, funnel drop-off calculation, activation definitions, and A/B test hypotheses', done: false, proof: '', note: '' },
  { id: 'd16-practice', day: 16, type: 'practice', title: 'Practice: Define the core telemetry funnel (viewed_screen -> clicked_cta -> completed_step -> reached_aha_moment)', done: false, proof: '', note: '' },
  { id: 'd16-ship', day: 16, type: 'ship', title: 'Ship: 1-Page Product Telemetry & Experimentation Spec defining primary metric, secondary metrics, and event taxonomy', done: false, proof: '', note: '' },

  // Day 17: Production Dev Handoff & Engineering Specification
  { id: 'd17-learn', day: 17, type: 'learn', title: 'Learn (45m): Dev mode in Figma, redlining, token variable mapping, and responsive CSS flexbox/grid annotations', done: false, proof: '', note: '' },
  { id: 'd17-practice', day: 17, type: 'practice', title: 'Practice: Annotate spacing tokens, responsive breakpoint behaviors (360px, 768px, 1280px), and asset export rules', done: false, proof: '', note: '' },
  { id: 'd17-ship', day: 17, type: 'ship', title: 'Ship: Complete Dev-Ready Handoff Specification in Figma with redline annotations, asset exports, and state matrices', done: false, proof: '', note: '' },

  // Day 18: Brutal Portfolio Case Study & Public Defense
  { id: 'd18-learn', day: 18, type: 'learn', title: 'Learn (45m): Anatomy of an Elite Case Study: Hiring managers skim in 90s; lead with problem, metrics, and trade-offs', done: false, proof: '', note: '' },
  { id: 'd18-practice', day: 18, type: 'practice', title: 'Practice: Assemble hero mockups, before/after artifacts, usability data quotes, and lessons learned', done: false, proof: '', note: '' },
  { id: 'd18-ship', day: 18, type: 'ship', title: 'Ship: Live Published Portfolio Case Study (Notion, Personal Domain, or Medium) with hero mockups and clickable prototype link', done: false, proof: '', note: '' }
];
