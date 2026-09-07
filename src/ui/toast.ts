/**
 * Non-blocking whispers: "a page filled" without ever interrupting movement.
 * Queued so a burst of unlocks reads as a gentle series, not a pile.
 */
export class Toasts {
  private queue: string[] = [];
  private busy = false;

  constructor(private root: HTMLElement) {}

  show(text: string) {
    this.queue.push(text);
    this.pump();
  }

  private pump() {
    if (this.busy) return;
    const text = this.queue.shift();
    if (!text) return;
    this.busy = true;

    const el = document.createElement('div');
    // Journal moments announce themselves with a pen or a spark glyph; they
    // get the ink-dot bloom and page-curl entrance instead of the plain slide.
    const journalish = /^[✎✦]/.test(text);
    el.className = journalish ? 'toast jt' : 'toast';
    el.textContent = text;
    this.root.appendChild(el);
    // Next frame so the transition actually runs.
    requestAnimationFrame(() => el.classList.add('in'));

    setTimeout(() => {
      el.classList.remove('in');
      setTimeout(() => {
        el.remove();
        this.busy = false;
        this.pump();
      }, 450);
    }, 2400);
  }
}
