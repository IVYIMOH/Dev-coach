/**
 * Design Coach - Critique Mode
 * Allows user to paste a Figma link or design description for focused in-persona critique
 * on Visual Hierarchy, Clarity, and Accessibility.
 */

export class DesignCritiqueModal {
  constructor(options = {}) {
    this.modalEl = null;
    this.onSubmit = options.onSubmit || null;
  }

  open() {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'standup-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'critique-title');

    const card = document.createElement('div');
    card.className = 'standup-card';

    // Header
    const header = document.createElement('div');
    header.className = 'standup-header';

    const badge = document.createElement('span');
    badge.className = 'standup-step-badge';
    badge.textContent = 'Design Critique Mode 🎨';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'standup-close-btn';
    closeBtn.setAttribute('aria-label', 'Close Critique Modal');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(badge);
    header.appendChild(closeBtn);
    card.appendChild(header);

    // Title
    const title = document.createElement('h3');
    title.id = 'critique-title';
    title.className = 'standup-title';
    title.textContent = 'Request Coach Design Critique';
    card.appendChild(title);

    // Intro explanation
    const intro = document.createElement('p');
    intro.style.fontSize = '13px';
    intro.style.color = 'var(--text-2)';
    intro.textContent = 'Paste a Figma frame link, Notion doc, or describe your layout. Your coach will evaluate visual hierarchy, clarity, and accessibility.';
    card.appendChild(intro);

    // Figma / URL Input
    const urlLabel = document.createElement('label');
    urlLabel.style.fontSize = '12px';
    urlLabel.style.fontFamily = 'var(--mono)';
    urlLabel.style.color = 'var(--text-2)';
    urlLabel.textContent = 'Figma Link / Artifact URL:';
    card.appendChild(urlLabel);

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'chat-input-field';
    urlInput.style.width = '100%';
    urlInput.placeholder = 'https://www.figma.com/design/...';
    card.appendChild(urlInput);

    // Description Textarea
    const descLabel = document.createElement('label');
    descLabel.style.fontSize = '12px';
    descLabel.style.fontFamily = 'var(--mono)';
    descLabel.style.color = 'var(--text-2)';
    descLabel.style.marginTop = '6px';
    descLabel.textContent = 'Design Description & Context:';
    card.appendChild(descLabel);

    const textarea = document.createElement('textarea');
    textarea.className = 'standup-textarea';
    textarea.placeholder = 'e.g. Checkout flow step 2: A two-column modal showing cart summary and express payment buttons. Struggling with whether primary CTA is clear...';
    card.appendChild(textarea);

    // Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'standup-next-btn';
    submitBtn.textContent = 'Get In-Persona Critique 🔍';

    submitBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      const desc = textarea.value.trim();
      if (!url && !desc) return;

      this.close();

      const critiqueQuery = [
        `Critique my design:`,
        url ? `• Figma/Artifact Link: ${url}` : null,
        desc ? `• Context: ${desc}` : null,
        `Please give me feedback on Visual Hierarchy, Clarity & Scannability, and Accessibility.`
      ].filter(Boolean).join('\n');

      if (this.onSubmit) {
        this.onSubmit(critiqueQuery, { url, desc });
      }
    });

    card.appendChild(submitBtn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    this.modalEl = overlay;

    setTimeout(() => textarea.focus(), 150);
  }

  close() {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }
}

