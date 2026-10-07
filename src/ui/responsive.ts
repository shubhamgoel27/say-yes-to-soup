/**
 * Small-screen helpers: knowing when we are on a touch-first device, and the
 * landscape-first welcome for phones. Detection is capability-based (coarse
 * pointer, no hover, screen size), never user-agent sniffing, so a desktop
 * with a mouse can never match and a phone in a desktop-mode browser still
 * does.
 *
 * The game is landscape-native (a 320x180 view). On a phone held upright it
 * shows a quarter of the world, so phones are steered sideways, firmly but
 * kindly:
 *
 * - Where the browser can lock orientation (Android, mostly): on the first
 *   natural tap while upright, a journal card offers to lay the journal
 *   sideways. Accepting goes fullscreen and locks landscape. Declining twice
 *   retires the card for the session and leaves a small corner pin instead.
 * - Where it cannot (iOS, or any lock failure): a full paper page asks for
 *   the turn and waits. It leaves the instant the phone turns.
 *
 * Tablets and desktops are exempt: nothing here mounts, nothing changes.
 * All styling lives in index.html behind (pointer: coarse) and (hover: none).
 */

const COARSE_TOUCH_QUERY = '(pointer: coarse) and (hover: none)';

/** A touch-first device: the on-screen pad belongs on it from the start. */
export function isCoarseTouch(): boolean {
  return typeof matchMedia === 'function' && matchMedia(COARSE_TOUCH_QUERY).matches;
}

/**
 * Keyboard words on a desk, finger words on glass. Copy that names a key
 * (Space, Esc, N, the arrows) reads as a riddle under a thumb, so every such
 * line passes both spellings through here. Same capability test as the pad.
 */
export function keysOrTaps(keys: string, taps: string, coarse = isCoarseTouch()): string {
  return coarse ? taps : keys;
}

/** How long a new thread reads in full on a phone before the chip folds. */
export const CHIP_FRESH_MS = 8000;

/**
 * The task chip on a phone: a new thread reads in full, then folds to one
 * line so the world keeps the room (the journal always has the whole of
 * it). The clock starts only once the chip can be seen, since a thread
 * usually changes at the end of a conversation, while the HUD is still
 * hushed. Only the `fresh` class is toggled; the fold itself is CSS behind
 * a coarse pointer, so a desk never sees anything change.
 */
export class ChipFold {
  private text = '';
  /** 0 while fresh but unseen; the fold time once the clock is running. */
  private foldAt = 0;

  constructor(private el: HTMLElement) {}

  /** The chip's text was (re)written; a different thread reads fresh. */
  note(text: string): void {
    if (text === this.text) return;
    this.text = text;
    this.foldAt = 0;
    this.el.classList.add('fresh');
  }

  /**
   * Point at the chip without repeating it: it unfolds fresh (a phone shows
   * the whole thread again) and glows once.
   */
  call(): void {
    this.foldAt = 0;
    this.el.classList.add('fresh');
    this.el.classList.remove('call');
    // Restart the glow even if it is mid-run: a reflow between the two.
    void (this.el as { offsetWidth?: number }).offsetWidth;
    this.el.classList.add('call');
  }

  /** Once per frame with whether the HUD is hushed. */
  tick(quiet: boolean, now = performance.now()): void {
    if (!this.el.classList.contains('fresh') || quiet) return;
    if (this.foldAt === 0) this.foldAt = now + CHIP_FRESH_MS;
    else if (now >= this.foldAt) this.el.classList.remove('fresh');
  }
}

/** The pair watchScrollCue last armed, re-measured when the window turns. */
let cuePair: [HTMLElement, HTMLElement] | null = null;
let cueResizeArmed = false;

function syncCue(box: HTMLElement, cue: HTMLElement): void {
  const more = box.scrollHeight - box.clientHeight - box.scrollTop > 6;
  cue.classList.toggle('on', more);
}

/**
 * A card taller than the room scrolls, but a scroll box shows no sign of
 * itself on glass until a thumb happens to move it: options below the fold
 * simply did not exist. `cue` (positioned and shown by CSS only where a
 * card can overflow) carries `on` while there is more below, and a tap on
 * it brings the rest up.
 */
export function watchScrollCue(box: HTMLElement | null, cue: HTMLElement | null): void {
  if (!box || !cue) return;
  cuePair = [box, cue];
  box.addEventListener('scroll', () => syncCue(box, cue), { passive: true });
  cue.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    box.scrollBy({ top: Math.max(80, box.clientHeight * 0.7), behavior: 'smooth' });
  });
  requestAnimationFrame(() => syncCue(box, cue));
  if (!cueResizeArmed) {
    cueResizeArmed = true;
    window.addEventListener('resize', () => {
      if (cuePair && cuePair[0].isConnected) syncCue(cuePair[0], cuePair[1]);
    });
  }
}

/**
 * A phone proper: touch-first and the screen's smaller side under 600 CSS px.
 * Screen dimensions, not window: fullscreen and browser chrome move the
 * window, the glass never changes. iPad mini's short side is 744px, so every
 * tablet clears the bar and stays exempt.
 */
export function isPhone(): boolean {
  if (!isCoarseTouch()) return false;
  const s = window.screen;
  if (!s || !s.width || !s.height) return false;
  return Math.min(s.width, s.height) < 600;
}

function inPortrait(): boolean {
  if (typeof matchMedia === 'function') return matchMedia('(orientation: portrait)').matches;
  return window.innerHeight > window.innerWidth;
}

/** TS 5.x dropped lock/unlock from ScreenOrientation; they exist where we need them. */
type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

function canLockLandscape(): boolean {
  const so = window.screen?.orientation as LockableOrientation | undefined;
  return (
    typeof document.documentElement.requestFullscreen === 'function' &&
    typeof so?.lock === 'function'
  );
}

/** Declines are remembered for the session only; nothing outlives the tab. */
const DECLINE_KEY = 'elsewhere.sidewaysDeclines';

function readDeclines(): number {
  try {
    return Number(sessionStorage.getItem(DECLINE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeDeclines(n: number): void {
  try {
    sessionStorage.setItem(DECLINE_KEY, String(n));
  } catch {
    // Storage blocked: the in-memory count still holds for this page's life.
  }
}

/** After a decline, the next few taps belong to the player, not the card. */
const REOFFER_COOLDOWN_MS = 5000;

// ---------------------------------------------------------------------------
// Shared state (module-scoped; initRotateNudge arms everything once).
// ---------------------------------------------------------------------------

let armed = false;
let fallbackMode = false;
let lockActive = false;
let declines = 0;
let lastDeclineAt = 0;

let offerEl: HTMLElement | null = null;
let holdEl: HTMLElement | null = null;
let pinEl: HTMLButtonElement | null = null;

// ---------------------------------------------------------------------------
// DOM builders. Everything mounts hidden and only ever on a phone.
// ---------------------------------------------------------------------------

function buildGlyph(): HTMLElement {
  const glyph = document.createElement('div');
  glyph.className = 'sw-glyph';
  glyph.setAttribute('aria-hidden', 'true');
  const phone = document.createElement('div');
  phone.className = 'sw-phone';
  glyph.appendChild(phone);
  return glyph;
}

function ensureHold(): HTMLElement {
  if (holdEl) return holdEl;
  const veil = document.createElement('div');
  veil.id = 'rotatehold';
  veil.hidden = true;

  const card = document.createElement('div');
  card.className = 'sw-card';
  card.setAttribute('role', 'status');

  const title = document.createElement('div');
  title.className = 'sw-title';
  title.textContent = 'Turn your phone sideways.';

  const line = document.createElement('div');
  line.className = 'sw-line';
  line.textContent = 'Nani drew her pages wide; the road needs the room.';

  card.append(buildGlyph(), title, line);
  veil.appendChild(card);
  document.body.appendChild(veil);
  holdEl = veil;
  return veil;
}

function ensureOffer(): HTMLElement {
  if (offerEl) return offerEl;
  const veil = document.createElement('div');
  veil.id = 'sideways';
  veil.hidden = true;

  const card = document.createElement('div');
  card.className = 'sw-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'The journal reads best sideways');

  const title = document.createElement('div');
  title.className = 'sw-title';
  title.textContent = 'The journal reads best sideways.';

  const line = document.createElement('div');
  line.className = 'sw-line';
  line.textContent = 'Nani drew her pages wide. Turn with them and the whole road fits in your hands.';

  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'sw-go';
  go.textContent = 'Lay it sideways';
  go.addEventListener('click', () => {
    hideOffer();
    void goSideways();
  });

  const stay = document.createElement('button');
  stay.type = 'button';
  stay.className = 'sw-stay';
  stay.textContent = 'Maybe in a moment';
  stay.addEventListener('click', declineOffer);

  card.append(buildGlyph(), title, line, go, stay);
  veil.appendChild(card);
  document.body.appendChild(veil);
  offerEl = veil;
  return veil;
}

function ensurePin(): HTMLButtonElement {
  if (pinEl) return pinEl;
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.id = 'sidewayspin';
  pin.hidden = true;
  pin.setAttribute('aria-label', 'Lay the journal sideways');
  pin.title = 'Lay the journal sideways';
  const phone = document.createElement('span');
  phone.className = 'sw-phone sw-phone-small';
  phone.setAttribute('aria-hidden', 'true');
  pin.appendChild(phone);
  pin.addEventListener('click', () => {
    void goSideways();
  });
  document.body.appendChild(pin);
  pinEl = pin;
  return pin;
}

// ---------------------------------------------------------------------------
// Offer path (browsers that can lock orientation).
// ---------------------------------------------------------------------------

function showOffer(): void {
  ensureOffer().hidden = false;
}

function hideOffer(): void {
  if (offerEl) offerEl.hidden = true;
}

function declineOffer(): void {
  hideOffer();
  declines += 1;
  lastDeclineAt = Date.now();
  writeDeclines(declines);
  syncPin();
}

/**
 * The one firm ask, made only inside a user gesture: fullscreen first, then
 * the landscape lock. Every refusal lands softly in the rotate page instead.
 */
export async function goSideways(): Promise<void> {
  const root = document.documentElement;
  try {
    await root.requestFullscreen({ navigationUI: 'hide' });
  } catch {
    // Fullscreen refused: no lock is possible, ask for the turn instead.
    enterFallback();
    return;
  }
  const so = window.screen?.orientation as LockableOrientation | undefined;
  try {
    if (typeof so?.lock !== 'function') throw new Error('orientation lock unsupported');
    await so.lock('landscape');
    lockActive = true;
    syncPin();
  } catch {
    // Fullscreen held but the lock refused: keep the room, ask for the turn.
    enterFallback();
  }
}

/** Any failure of the lock path drops us, for the session, to the rotate page. */
function enterFallback(): void {
  fallbackMode = true;
  lockActive = false;
  hideOffer();
  if (pinEl) pinEl.hidden = true;
  ensureHold();
  syncHold();
}

function offerEligible(): boolean {
  if (fallbackMode || lockActive) return false;
  if (document.fullscreenElement) return false;
  if (!inPortrait()) return false;
  if (offerEl && !offerEl.hidden) return false;
  if (Date.now() - lastDeclineAt < REOFFER_COOLDOWN_MS) return false;
  return declines < 2;
}

/**
 * A natural tap while upright is the invitation to offer. The card answers
 * that tap, so the tap ends here: left to run on, it landed on whatever the
 * title had under the finger (Credits, most often) and opened it behind the
 * card. Capture phase on window, so nothing beneath ever hears it.
 */
function onGesture(e: PointerEvent): void {
  if (offerEligible()) {
    showOffer();
    swallowGesture(e);
  } else {
    syncPin();
  }
}

/**
 * Consume one whole touch: its pointerdown now, its pointerup when the finger
 * lifts, and the click the browser still synthesizes afterwards (preventing
 * a touch pointerdown stops the compat mouse events, never the click).
 */
function swallowGesture(e: PointerEvent): void {
  e.preventDefault();
  e.stopImmediatePropagation();
  const id = e.pointerId;
  const eat = (ev: Event) => {
    ev.preventDefault();
    ev.stopImmediatePropagation();
  };
  const dropClick = () => window.removeEventListener('click', onClick, true);
  const onClick = (ev: MouseEvent) => {
    eat(ev);
    dropClick();
  };
  const onEnd = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    eat(ev);
    window.removeEventListener('pointerup', onEnd, true);
    window.removeEventListener('pointercancel', onEnd, true);
    // The click, if one comes, follows the lift within a frame or two.
    setTimeout(dropClick, 400);
  };
  window.addEventListener('pointerup', onEnd, true);
  window.addEventListener('pointercancel', onEnd, true);
  window.addEventListener('click', onClick, true);
}

/**
 * The quiet corner pin. Upright, the big card is the affordance and the pin
 * appears only once it has been declined away. Lying down there is no card
 * at all, so whenever fullscreen is gone (an app switch, a back swipe, a
 * fresh landscape boot) the pin is the one road back to the full spread.
 */
function syncPin(): void {
  if (fallbackMode || !canLockLandscape()) return;
  const bare = !lockActive && !document.fullscreenElement;
  const wanted = bare && (!inPortrait() || declines >= 2);
  if (!wanted && !pinEl) return;
  const pin = ensurePin();
  pin.hidden = !wanted;
  const label = inPortrait() ? 'Lay the journal sideways' : 'Back to the full spread';
  pin.title = label;
  pin.setAttribute('aria-label', label);
}

// ---------------------------------------------------------------------------
// Rotate page (iOS and every fallback).
// ---------------------------------------------------------------------------

function syncHold(): void {
  if (!holdEl) return;
  holdEl.hidden = !inPortrait();
}

// ---------------------------------------------------------------------------
// Entry point. main.ts calls this once at boot.
// ---------------------------------------------------------------------------

/**
 * Arms the landscape-first flow on phones. Historically this showed a one-off
 * portrait whisper; the name stays so main.ts needs no change. On tablets and
 * desktops it does nothing at all.
 */
export function initRotateNudge(): void {
  if (armed || !isPhone()) return;
  armed = true;
  declines = readDeclines();

  const onOrientationSettled = (): void => {
    syncHold();
    syncPin();
    if (!inPortrait()) hideOffer();
  };

  if (typeof matchMedia === 'function') {
    const mq = matchMedia('(orientation: portrait)');
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onOrientationSettled);
    }
  }
  window.addEventListener('resize', onOrientationSettled);

  if (canLockLandscape()) {
    window.addEventListener('pointerdown', onGesture, { capture: true, passive: false });
    document.addEventListener('fullscreenchange', () => {
      // Entering counts too: the pin that asked for the room must leave the
      // moment the room is granted, whatever the orientation lock decides
      // (and however long it takes to decide).
      if (document.fullscreenElement) {
        syncPin();
      } else {
        // The system took us back (back gesture, swipe). Release cleanly and
        // wait for the next natural tap; no nagging on the way out.
        lockActive = false;
        try {
          (window.screen?.orientation as LockableOrientation | undefined)?.unlock?.();
        } catch {
          // Already released; nothing to tidy.
        }
        syncPin();
      }
    });
    // Coming back from another app: fullscreenchange may have fired while
    // the tab was hidden, so the pin re-checks the room on every return.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) syncPin();
    });
    syncPin();
  } else {
    ensureHold();
    syncHold();
  }
}
