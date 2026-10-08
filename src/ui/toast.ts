/**
 * Non-blocking whispers: "a page filled" without ever interrupting movement.
 * Queued so a burst of unlocks reads as a gentle series, not a pile.
 *
 * The queue can be HELD. Story surfaces (dialogue, the pause menu, a
 * ceremony) fade the ambient HUD, and a timer-driven toast used to play out
 * its whole life behind that fade: "a page fills", the one-time "press J"
 * hint, and the chapter-end lines were written and never once seen. Held,
 * nothing new starts, and a toast caught mid-show goes back to the front of
 * the line to be shown in full once the HUD returns.
 */
const SHOW_MS = 2400;
const FADE_MS = 450;

export class Toasts {
  private queue: string[] = [];
  private busy = false;
  private held = false;
  /** Bumped by dismissAll so a fade already in flight cannot pump a stale line. */
  private gen = 0;
  /** The toast on screen and its pending dismiss timer, while showing. */
  private current: { el: HTMLElement; text: string; timer: number } | null = null;

  constructor(private root: HTMLElement) {}

  show(text: string) {
    this.queue.push(text);
    this.pump();
  }

  /**
   * A reply to a key the player just pressed (sound on/off): shown now, even
   * over a quiet HUD, because the press itself is proof someone is looking.
   * The root carries `through` while it shows so the quiet fade lets it by.
   */
  showNow(text: string) {
    const el = this.makeEl(text);
    this.root.classList.add('through');
    setTimeout(() => {
      el.classList.remove('in');
      setTimeout(() => {
        el.remove();
        if (!this.root.querySelector('.now')) this.root.classList.remove('through');
      }, FADE_MS);
    }, SHOW_MS);
    el.classList.add('now');
  }

  /** Hold or release the queue; see the class note. */
  setHeld(held: boolean) {
    if (held === this.held) return;
    this.held = held;
    if (held) {
      const cur = this.current;
      if (cur) {
        // Caught mid-show: it goes back to the front, to be seen whole later.
        clearTimeout(cur.timer);
        cur.el.remove();
        this.current = null;
        this.busy = false;
        this.queue.unshift(cur.text);
      }
    } else {
      this.pump();
    }
  }

  get isHeld(): boolean {
    return this.held;
  }

  /** How many toasts are waiting their turn (the one showing excluded). */
  get pending(): number {
    return this.queue.length;
  }

  /** Drop the queued lines a predicate picks (the one on screen stays). */
  drop(which: (text: string) => boolean) {
    this.queue = this.queue.filter((t) => !which(t));
  }

  /** Drop everything queued and showing. A journal switch must not carry
   * the old journey's announcements into the new one's morning. */
  dismissAll() {
    if (this.current) clearTimeout(this.current.timer);
    this.current = null;
    this.gen++;
    this.queue.length = 0;
    this.busy = false;
    this.root.replaceChildren();
    this.root.classList.remove('through');
  }

  private makeEl(text: string): HTMLElement {
    const el = document.createElement('div');
    // Journal moments announce themselves with a pen or a spark glyph; they
    // get the ink-dot bloom and page-curl entrance instead of the plain slide.
    const journalish = /^[✎✦]/.test(text);
    el.className = journalish ? 'toast jt' : 'toast';
    // Pad glyphs (tap \u2726 to talk, the \u2726 of a margin note) come from a
    // fallback font with no side bearing, and on iPhone they sat glued to the
    // next word. Each is set as its own upright little sort, spaced like a letter.
    if (/[\u2726\u2933]/.test(text)) {
      el.innerHTML = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/[\u2726\u2933]/g, '<span class="toast-glyph">$&</span>');
    } else {
      el.textContent = text;
    }
    this.root.appendChild(el);
    // Next frame so the transition actually runs.
    requestAnimationFrame(() => el.classList.add('in'));
    return el;
  }

  private pump() {
    if (this.busy || this.held) return;
    const text = this.queue.shift();
    if (!text) return;
    this.busy = true;
    const el = this.makeEl(text);
    const gen = this.gen;
    const timer = setTimeout(() => {
      if (this.current?.el !== el) return;
      this.current = null;
      el.classList.remove('in');
      setTimeout(() => {
        el.remove();
        if (gen !== this.gen) return;
        this.busy = false;
        this.pump();
      }, FADE_MS);
    }, SHOW_MS) as unknown as number;
    this.current = { el, text, timer };
  }
}
