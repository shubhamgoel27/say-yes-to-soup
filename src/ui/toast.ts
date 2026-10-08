/**
 * Non-blocking whispers: "a page filled" without ever interrupting movement.
 * Queued so a burst of unlocks reads as a gentle series, not a pile.
 *
 * The queue can be HELD. Story surfaces (dialogue, the pause menu, a
 * ceremony) fade the ambient HUD, and a timer-driven toast used to play out
 * its whole life behind that fade: "a page fills", the one-time "press J"
 * hint, and the chapter-end lines were written and never once seen. Held,
 * nothing new starts, and a toast caught mid-show goes back to the front of
 * the line to be shown in full once the HUD returns: once, and only if it
 * was cut early. A line already waiting or showing is never queued again.
 */
const SHOW_MS = 2400;
const FADE_MS = 450;
/** Seen this long, a toast caught by the hush counts as read and is not re-shown. */
const SEEN_MS = SHOW_MS * 0.6;

type Queued = { text: string; requeued: boolean };

export class Toasts {
  private queue: Queued[] = [];
  private busy = false;
  private held = false;
  /** Bumped by dismissAll so a fade already in flight cannot pump a stale line. */
  private gen = 0;
  /** The toast on screen and its pending dismiss timer, while showing. */
  private current: { el: HTMLElement; item: Queued; timer: number; since: number } | null = null;

  constructor(private root: HTMLElement) {}

  show(text: string) {
    // The same line already on screen or waiting says nothing new; a burst of
    // flag changes once queued "the word Causa" four times over.
    if (this.current?.item.text === text || this.queue.some((q) => q.text === text)) return;
    this.queue.push({ text, requeued: false });
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
        // Caught mid-show: it goes back to the front, to be seen whole later,
        // but only once, and only if the player has not already mostly read it.
        // Fast play flickers the hush, and each flicker used to re-queue it.
        clearTimeout(cur.timer);
        cur.el.remove();
        this.current = null;
        this.busy = false;
        const seen = Date.now() - cur.since >= SEEN_MS;
        if (!seen && !cur.item.requeued) this.queue.unshift({ text: cur.item.text, requeued: true });
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
    this.queue = this.queue.filter((q) => !which(q.text));
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
    const html = toastHtml(text);
    if (html !== null) el.innerHTML = html;
    else el.textContent = text;
    this.root.appendChild(el);
    // Next frame so the transition actually runs.
    requestAnimationFrame(() => el.classList.add('in'));
    return el;
  }

  private pump() {
    if (this.busy || this.held) return;
    const item = this.queue.shift();
    if (!item) return;
    this.busy = true;
    const el = this.makeEl(item.text);
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
    this.current = { el, item, timer, since: Date.now() };
  }
}

/**
 * Symbol glyphs (the \u2726 of tap-to-talk, the \u2933 of the thread, the
 * \u2709 of the mail, the \u270E of a page) come from a fallback font with no
 * side bearing, so they sat glued to the next word: "\u2709you are carrying
 * something". Each is set as its own upright little sort, spaced like a
 * letter. Null when the text has none and can go in as plain text.
 */
const TOAST_GLYPHS = /[\u2709\u270E\u2726\u2933]/g;
export function toastHtml(text: string): string | null {
  if (!text.match(TOAST_GLYPHS)) return null;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(TOAST_GLYPHS, '<span class="toast-glyph">$&</span>');
}
