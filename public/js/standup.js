/**
 * Design Coach - Daily Standup Flow
 * Coach asks 3 questions out loud, takes answers by text or speech recognition,
 * and passes the answers to the coach chat loop for task updates.
 */

import { coachAvatar } from './avatar.js';
import { speechEngine } from './speech.js';

export const STANDUP_QUESTIONS = [
  {
    step: 1,
    title: 'What design artifact did you ship recently?',
    placeholder: 'e.g., Shipped Problem Canvas on Day 1, drafted user interview script...',
    speechText: 'Question one: What design artifact did you ship recently?'
  },
  {
    step: 2,
    title: 'What is blocking you or slowing your design flow?',
    placeholder: 'e.g., Unsure about auto layout nesting, waiting on user feedback, or no blockers...',
    speechText: 'Question two: What is blocking you or slowing your design flow?'
  },
  {
    step: 3,
    title: 'What is your one core design task for today?',
    placeholder: 'e.g., Build the button and card component variants in Figma...',
    speechText: 'Question three: What is your one core design task for today?'
  }
];

export class DailyStandup {
  constructor(options = {}) {
    this.currentStep = 0;
    this.answers = ['', '', ''];
    this.isListening = false;
    this.modalEl = null;
    this.onFinish = options.onFinish || null;
    this.getPersona = options.getPersona || (() => null);
  }

  start() {
    this.currentStep = 0;
    this.answers = ['', '', ''];
    this.showStep();
  }

  showStep() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
    }

    const question = STANDUP_QUESTIONS[this.currentStep];
    const persona = this.getPersona();

    const overlay = document.createElement('div');
    overlay.className = 'standup-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'standup-title');

    const card = document.createElement('div');
    card.className = 'standup-card';

    // Header
    const header = document.createElement('div');
    header.className = 'standup-header';

    const stepBadge = document.createElement('span');
    stepBadge.className = 'standup-step-badge';
    stepBadge.textContent = `Question ${this.currentStep + 1} of 3`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'standup-close-btn';
    closeBtn.setAttribute('aria-label', 'Close Standup');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(stepBadge);
    header.appendChild(closeBtn);
    card.appendChild(header);

    // Title
    const title = document.createElement('h3');
    title.id = 'standup-title';
    title.className = 'standup-title';
    title.textContent = question.title;
    card.appendChild(title);

    // Textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'standup-textarea';
    textarea.placeholder = question.placeholder;
    textarea.value = this.answers[this.currentStep] || '';
    textarea.setAttribute('aria-label', question.title);
    card.appendChild(textarea);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'standup-controls';

    // Mic Button
    const micBtn = document.createElement('button');
    micBtn.type = 'button';
    micBtn.className = 'standup-mic-btn';
    micBtn.setAttribute('aria-label', 'Dictate with microphone');
    micBtn.textContent = '🎤 Speak Answer';

    if (!speechEngine.isSpeechRecognitionSupported()) {
      micBtn.disabled = true;
      micBtn.title = 'Speech recognition not supported in this browser';
    } else {
      micBtn.addEventListener('click', () => {
        if (this.isListening) {
          speechEngine.stopListening();
          this.isListening = false;
          micBtn.textContent = '🎤 Speak Answer';
          micBtn.classList.remove('active');
        } else {
          this.isListening = true;
          micBtn.textContent = '🔴 Listening...';
          micBtn.classList.add('active');

          speechEngine.startListening({
            onResult: (transcript) => {
              textarea.value = textarea.value ? `${textarea.value} ${transcript}` : transcript;
              this.answers[this.currentStep] = textarea.value;
            },
            onEnd: () => {
              this.isListening = false;
              micBtn.textContent = '🎤 Speak Answer';
              micBtn.classList.remove('active');
            },
            onError: (err) => {
              this.isListening = false;
              micBtn.textContent = '🎤 Speak Answer';
              micBtn.classList.remove('active');
              console.warn('Speech recognition notice:', err);
            }
          });
        }
      });
    }

    controls.appendChild(micBtn);

    // Next / Submit Button
    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'standup-next-btn';
    actionBtn.textContent = this.currentStep === 2 ? 'Submit Standup ✓' : 'Next Question →';

    actionBtn.addEventListener('click', () => {
      this.answers[this.currentStep] = textarea.value.trim();
      if (this.isListening) {
        speechEngine.stopListening();
        this.isListening = false;
      }

      if (this.currentStep < 2) {
        this.currentStep++;
        this.showStep();
      } else {
        this.finish();
      }
    });

    controls.appendChild(actionBtn);
    card.appendChild(controls);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    this.modalEl = overlay;

    // Speak aloud
    coachAvatar.speak(question.speechText, persona);

    setTimeout(() => textarea.focus(), 150);
  }

  finish() {
    this.close();
    const [shipped, blockers, focus] = this.answers;

    const summary = [
      `Daily Standup Report:`,
      `• Shipped Artifact: ${shipped || 'None reported yet'}`,
      `• Blockers: ${blockers || 'None, design canvas is clear'}`,
      `• Today's Core Focus: ${focus || 'Advance current design challenge milestone'}`
    ].join('\n');

    if (this.onFinish) {
      this.onFinish(summary, { shipped, blockers, focus });
    }
  }

  close() {
    if (this.isListening) {
      speechEngine.stopListening();
      this.isListening = false;
    }
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }
}
