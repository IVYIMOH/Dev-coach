/**
 * Dev Coach - Avatar Engine
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
    this.personaKey = 'pragmatist';
    this.isSpeaking = false;
    this.avatarSvg = null;
    this.mouthEl = null;
    this.glassesEl = null;
    this.headbandEl = null;
    this.accentRingEl = null;
    this.speechBubbleEl = null;
    this.videoMode = false;
  }

  /**
   * Mounts the coach avatar into a target container.
   * @param {HTMLElement} container
   * @param {string} [initialPersona='pragmatist']
   */
  renderCoach(container, initialPersona = 'pragmatist') {
    if (!container) return;
    this.container = container;
    this.personaKey = initialPersona;

    // Clear previous children safely
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'coach-avatar-wrapper';
    wrapper.setAttribute('role', 'img');
    wrapper.setAttribute('aria-label', `Animated AI Coach: ${PERSONAS[this.personaKey]?.name || 'Coach'}`);

    // Build SVG Avatar
    const svg = createSvgElement('svg', {
      viewBox: '0 0 160 160',
      class: 'coach-svg',
      width: '120',
      height: '120'
    });

    // Gradients & Defs
    const defs = createSvgElement('defs');

    // Pragmatist gradient (Forest Green)
    const gradPrag = createSvgElement('linearGradient', { id: 'grad-prag', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    const stop1 = createSvgElement('stop', { offset: '0%', 'stop-color': '#3e8441' });
    const stop2 = createSvgElement('stop', { offset: '100%', 'stop-color': '#1f4821' });
    gradPrag.appendChild(stop1);
    gradPrag.appendChild(stop2);
    defs.appendChild(gradPrag);

    // Sergeant gradient (Crimson)
    const gradSarge = createSvgElement('linearGradient', { id: 'grad-sarge', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    const sStop1 = createSvgElement('stop', { offset: '0%', 'stop-color': '#b3392f' });
    const sStop2 = createSvgElement('stop', { offset: '100%', 'stop-color': '#6c1b14' });
    gradSarge.appendChild(sStop1);
    gradSarge.appendChild(sStop2);
    defs.appendChild(gradSarge);

    // Architect gradient (Deep Blue)
    const gradArch = createSvgElement('linearGradient', { id: 'grad-arch', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
    const aStop1 = createSvgElement('stop', { offset: '0%', 'stop-color': '#2a65b8' });
    const aStop2 = createSvgElement('stop', { offset: '100%', 'stop-color': '#122c54' });
    gradArch.appendChild(aStop1);
    gradArch.appendChild(aStop2);
    defs.appendChild(gradArch);

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
    const body = createSvgElement('path', {
      d: 'M 35 145 C 35 115, 60 105, 80 105 C 100 105, 125 115, 125 145 Z',
      class: 'coach-body',
      fill: 'url(#grad-prag)'
    });
    this.bodyEl = body;
    svg.appendChild(body);

    // Shirt Collar
    const collar = createSvgElement('path', {
      d: 'M 65 112 L 80 126 L 95 112 Z',
      fill: '#ffffff',
      opacity: '0.85'
    });
    svg.appendChild(collar);

    // Neck
    const neck = createSvgElement('rect', {
      x: '72',
      y: '90',
      width: '16',
      height: '18',
      rx: '4',
      fill: '#e8c9ad'
    });
    svg.appendChild(neck);

    // Coach Head
    const head = createSvgElement('rect', {
      x: '48',
      y: '34',
      width: '64',
      height: '66',
      rx: '28',
      fill: '#ffd8be',
      class: 'coach-head'
    });
    svg.appendChild(head);

    // Hair
    const hair = createSvgElement('path', {
      d: 'M 44 52 C 44 26, 116 26, 116 52 C 104 38, 56 38, 44 52 Z',
      fill: '#2b2622'
    });
    svg.appendChild(hair);

    // Sarge Headband (toggled by persona)
    this.headbandEl = createSvgElement('path', {
      d: 'M 46 48 Q 80 44 114 48 L 114 54 Q 80 50 46 54 Z',
      fill: '#e74c3c',
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

    // Architect Glasses (toggled by persona)
    const glassesGroup = createSvgElement('g', { class: 'coach-glasses' });
    const glassL = createSvgElement('circle', { cx: '66', cy: '64', r: '10', fill: 'none', stroke: '#1b3a6b', 'stroke-width': '2' });
    const glassR = createSvgElement('circle', { cx: '94', cy: '64', r: '10', fill: 'none', stroke: '#1b3a6b', 'stroke-width': '2' });
    const bridge = createSvgElement('line', { x1: '76', y1: '64', x2: '84', y2: '64', stroke: '#1b3a6b', 'stroke-width': '2' });
    glassesGroup.appendChild(glassL);
    glassesGroup.appendChild(glassR);
    glassesGroup.appendChild(bridge);
    this.glassesEl = glassesGroup;
    svg.appendChild(glassesGroup);

    // Cheeks
    const leftCheek = createSvgElement('circle', { cx: '58', cy: '72', r: '5', fill: '#ff9999', opacity: '0.4' });
    const rightCheek = createSvgElement('circle', { cx: '102', cy: '72', r: '5', fill: '#ff9999', opacity: '0.4' });
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

    // Status Indicator Badge (Speech state)
    const badge = document.createElement('div');
    badge.className = 'coach-status-badge';
    badge.setAttribute('title', 'Coach Ready');
    this.badgeEl = badge;
    wrapper.appendChild(badge);

    container.appendChild(wrapper);

    this.updatePersonaVisuals(this.personaKey);
  }

  /**
   * Updates avatar accessory elements for selected persona.
   * @param {string} personaKey
   */
  updatePersonaVisuals(personaKey) {
    this.personaKey = personaKey;
    const persona = PERSONAS[personaKey] || PERSONAS.pragmatist;

    if (this.bodyEl) {
      if (personaKey === 'sergeant') {
        this.bodyEl.setAttribute('fill', 'url(#grad-sarge)');
      } else if (personaKey === 'architect') {
        this.bodyEl.setAttribute('fill', 'url(#grad-arch)');
      } else {
        this.bodyEl.setAttribute('fill', 'url(#grad-prag)');
      }
    }

    if (this.headbandEl) {
      this.headbandEl.style.display = personaKey === 'sergeant' ? 'block' : 'none';
    }

    if (this.glassesEl) {
      this.glassesEl.style.display = personaKey === 'architect' ? 'block' : 'none';
    }

    if (this.accentRingEl) {
      this.accentRingEl.style.stroke = persona.color;
    }
  }

  /**
   * Animates coach mouth speaking.
   * @param {boolean} speaking
   */
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

  /**
   * Speaks given text in character.
   * @param {string} text
   * @param {object} persona
   * @param {Function} [onDone]
   */
  speak(text, persona = null, onDone = null) {
    const activePersona = persona || PERSONAS[this.personaKey] || PERSONAS.pragmatist;

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

