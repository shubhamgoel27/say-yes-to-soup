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
    el.className = 'toast';
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
