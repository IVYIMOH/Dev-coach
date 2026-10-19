/**
 * Design Coach - Avatar Engine
 * Renders an animated SVG coach avatar behind an interface (renderCoach, speak).
 * Supports talking animations, blinking, persona variations, and reduced-motion mode.
 * Safe DOM rendering (createElementNS, zero innerHTML).
 */

import { speechEngine } from './speech.js';
import { PERSONAS } from './personas.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createSvgElement(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  return el;
}

export class CoachAvatar {
  constructor() {
    this.container = null;
    this.personaKey = 'sergeant';
    this.isSpeaking = false;
    this.avatarSvg = null;
    this.mouthEl = null;
    this.glassesEl = null;
    this.beretEl = null;
    this.headbandEl = null;
    this.accentRingEl = null;
    this.bodyEl = null;
  }

  /**
   * Mounts the coach avatar into a target container.
   * @param {HTMLElement} container
   * @param {string} [initialPersona='sergeant']
   */
  renderCoach(container, initialPersona = 'sergeant') {
    if (!container) return;
    this.container = container;
    this.personaKey = initialPersona;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'coach-avatar-wrapper';
    wrapper.setAttribute('role', 'img');
    wrapper.setAttribute('aria-label', `Animated AI Design Coach: ${PERSONAS[this.personaKey]?.name || 'Coach'}`);

    const svg = createSvgElement('svg', {
      viewBox: '0 0 160 160',
      class: 'coach-svg',
      width: '120',
      height: '120'
    });

    const defs = createSvgElement('defs');

    // Sergeant Stern gradient (Disciplined Crimson)
    const gradStern = createSvgElement('linearGradient', { id: 'grad-stern', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    gradStern.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#9e2a2b' }));
    gradStern.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#540b0e' }));
    defs.appendChild(gradStern);

    // Warm Mentor gradient (Forest Green & Sage)
    const gradMentor = createSvgElement('linearGradient', { id: 'grad-mentor', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    gradMentor.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#2c5f2e' }));
    gradMentor.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#132a13' }));
    defs.appendChild(gradMentor);

    // Hype Friend gradient (Golden Amber & Coral)
    const gradHype = createSvgElement('linearGradient', { id: 'grad-hype', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    gradHype.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': '#f59e0b' }));
    gradHype.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': '#b45309' }));
    defs.appendChild(gradHype);

    svg.appendChild(defs);

    // Ambient Outer Aura Ring
    this.accentRingEl = createSvgElement('circle', {
      cx: '80',
      cy: '80',
      r: '72',
      fill: 'none',
      stroke: 'var(--accent)',
      'stroke-width': '2.5',
      'stroke-dasharray': '6 4',
      class: 'coach-aura'
    });
    svg.appendChild(this.accentRingEl);

    // Coach Body / Shoulders
    this.bodyEl = createSvgElement('path', {
      d: 'M 35 145 C 35 115, 60 105, 80 105 C 100 105, 125 115, 125 145 Z',
      class: 'coach-body',
      fill: 'url(#grad-stern)'
    });
    svg.appendChild(this.bodyEl);

    // Shirt Collar
    const collar = createSvgElement('path', {
      d: 'M 65 112 L 80 126 L 95 112 Z',
      fill: '#ffffff',
      opacity: '0.9'
    });
    svg.appendChild(collar);

    // Neck
    const neck = createSvgElement('rect', {
      x: '72',
      y: '90',
      width: '16',
      height: '18',
      rx: '4',
      fill: '#eec19a'
    });
    svg.appendChild(neck);

    // Coach Head
    const head = createSvgElement('rect', {
      x: '48',
      y: '34',
      width: '64',
      height: '66',
      rx: '28',
      fill: '#fcd5b5',
      class: 'coach-head'
    });
    svg.appendChild(head);

    // Base Hair
    const hair = createSvgElement('path', {
      d: 'M 44 52 C 44 26, 116 26, 116 52 C 104 38, 56 38, 44 52 Z',
      fill: '#292524'
    });
    svg.appendChild(hair);

    // Sergeant Beret Hat
    this.beretEl = createSvgElement('path', {
      d: 'M 40 46 C 40 28, 100 22, 122 36 C 128 42, 116 52, 90 50 C 60 48, 46 54, 40 46 Z',
      fill: '#333d29',
      class: 'coach-beret'
    });
    svg.appendChild(this.beretEl);

    // Hype Friend Headband
    this.headbandEl = createSvgElement('path', {
      d: 'M 46 48 Q 80 44 114 48 L 114 54 Q 80 50 46 54 Z',
      fill: '#ec4899',
      class: 'coach-headband'
    });
    svg.appendChild(this.headbandEl);

    // Eyes
    const leftEye = createSvgElement('circle', { cx: '66', cy: '64', r: '4.5', fill: '#1b1b1b', class: 'coach-eye' });
    const rightEye = createSvgElement('circle', { cx: '94', cy: '64', r: '4.5', fill: '#1b1b1b', class: 'coach-eye' });
    const leftGlint = createSvgElement('circle', { cx: '68', cy: '62', r: '1.5', fill: '#ffffff' });
    const rightGlint = createSvgElement('circle', { cx: '96', cy: '62', r: '1.5', fill: '#ffffff' });
    svg.appendChild(leftEye);
    svg.appendChild(rightEye);
    svg.appendChild(leftGlint);
    svg.appendChild(rightGlint);

    // Warm Mentor Designer Glasses
    const glassesGroup = createSvgElement('g', { class: 'coach-glasses' });
    const glassL = createSvgElement('circle', { cx: '66', cy: '64', r: '10', fill: 'none', stroke: '#2c5f2e', 'stroke-width': '2.2' });
    const glassR = createSvgElement('circle', { cx: '94', cy: '64', r: '10', fill: 'none', stroke: '#2c5f2e', 'stroke-width': '2.2' });
    const bridge = createSvgElement('line', { x1: '76', y1: '64', x2: '84', y2: '64', stroke: '#2c5f2e', 'stroke-width': '2.2' });
    glassesGroup.appendChild(glassL);
    glassesGroup.appendChild(glassR);
    glassesGroup.appendChild(bridge);
    this.glassesEl = glassesGroup;
    svg.appendChild(glassesGroup);

    // Cheeks
    const leftCheek = createSvgElement('circle', { cx: '58', cy: '72', r: '5', fill: '#f43f5e', opacity: '0.35' });
    const rightCheek = createSvgElement('circle', { cx: '102', cy: '72', r: '5', fill: '#f43f5e', opacity: '0.35' });
    svg.appendChild(leftCheek);
    svg.appendChild(rightCheek);

    // Mouth (morphs when speaking)
    this.mouthEl = createSvgElement('path', {
      d: 'M 72 82 Q 80 87 88 82',
      fill: 'none',
      stroke: '#4a2d1d',
      'stroke-width': '3',
      'stroke-linecap': 'round',
      class: 'coach-mouth'
    });
    svg.appendChild(this.mouthEl);

    this.avatarSvg = svg;
    wrapper.appendChild(svg);

    // Status Indicator Badge
    const badge = document.createElement('div');
    badge.className = 'coach-status-badge';
    badge.setAttribute('title', 'Design Coach Ready');
    this.badgeEl = badge;
    wrapper.appendChild(badge);

    container.appendChild(wrapper);
    this.updatePersonaVisuals(this.personaKey);
  }

  updatePersonaVisuals(personaKey) {
    this.personaKey = personaKey;
    const persona = PERSONAS[personaKey] || PERSONAS.sergeant;

    if (this.bodyEl) {
      if (personaKey === 'mentor') {
        this.bodyEl.setAttribute('fill', 'url(#grad-mentor)');
      } else if (personaKey === 'hype') {
        this.bodyEl.setAttribute('fill', 'url(#grad-hype)');
      } else {
        this.bodyEl.setAttribute('fill', 'url(#grad-stern)');
      }
    }

    if (this.beretEl) {
      this.beretEl.style.display = personaKey === 'sergeant' ? 'block' : 'none';
    }

    if (this.headbandEl) {
      this.headbandEl.style.display = personaKey === 'hype' ? 'block' : 'none';
    }

    if (this.glassesEl) {
      this.glassesEl.style.display = personaKey === 'mentor' ? 'block' : 'none';
    }

    if (this.accentRingEl) {
      this.accentRingEl.style.stroke = persona.color;
    }
  }

  setSpeaking(speaking) {
    this.isSpeaking = Boolean(speaking);
    if (this.avatarSvg) {
      this.avatarSvg.classList.toggle('is-speaking', this.isSpeaking);
    }
    if (this.mouthEl) {
      if (this.isSpeaking) {
        this.mouthEl.setAttribute('d', 'M 70 80 Q 80 94 90 80 Z');
        this.mouthEl.setAttribute('fill', '#6a1d1d');
      } else {
        this.mouthEl.setAttribute('d', 'M 72 82 Q 80 87 88 82');
        this.mouthEl.setAttribute('fill', 'none');
      }
    }
    if (this.badgeEl) {
      this.badgeEl.classList.toggle('speaking', this.isSpeaking);
    }
  }

  speak(text, persona = null, onDone = null) {
    const activePersona = persona || PERSONAS[this.personaKey] || PERSONAS.sergeant;

    speechEngine.speak(
      text,
      activePersona,
      () => this.setSpeaking(true),
      () => {
        this.setSpeaking(false);
        if (onDone) onDone();
      }
    );
  }

  stopSpeaking() {
    speechEngine.stop();
    this.setSpeaking(false);
  }
}

export const coachAvatar = new CoachAvatar();
