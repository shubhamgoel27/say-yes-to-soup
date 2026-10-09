/**
 * Small-screen helpers: knowing when we are on a touch-first device, and the
 * landscape-first welcome for phones. Detection is capability-based (coarse
 * pointer, no hover, screen size), never user-agent sniffing, so a desktop
 * with a mouse can never match and a phone in a desktop-mode browser still
 * does.
 *
 * The game is landscape-native (a 320x180 frame). Held upright the frame
 * turns (180x320, config.viewFor), which plays, but the road reads best
 * wide, so phones are still steered sideways, firmly but kindly:
 *
 * - On the first natural tap in the world while upright (never on the
 *   cover or a card, whose taps are spoken for), a journal card offers to
 *   lay the journal sideways, once a session. Upright stays playable either
 *   way: one policy on every phone.
 * - Where the browser can lock orientation (Android, mostly), accepting goes
 *   fullscreen and locks landscape, and a decline leaves a small pin at the
 *   top of the pad's button column instead.
 * - Where it cannot (iOS, or a lock that failed), the card asks for the turn
 *   itself, says how to lift a rotation lock, and leaves the instant the
 *   phone turns or the player says upright is fine. It used to be a wall
 *   that waited for the turn, so an iPhone could not play upright while an
 *   Android phone could.
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

/**
 * How much the HUD grows on a wide screen: 1 up to the 1280x800 frame the
 * HUD was drawn for, then the smaller of the two stretches, capped at 1.7.
 * A phone or tablet never exceeds 1.
 */
export function uiScaleFor(w: number, h: number): number {
  const k = Math.min(w / 1280, h / 800);
  return Math.round(Math.min(1.7, Math.max(1, k)) * 100) / 100;
}

/** Keep --ui-k on the root in step with the window (see index.html). */
export function trackUiScale(): void {
  const apply = () =>
    document.documentElement.style.setProperty('--ui-k', String(uiScaleFor(window.innerWidth, window.innerHeight)));
  apply();
  window.addEventListener('resize', apply);
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


// ---------------------------------------------------------------------------
// Shared state (module-scoped; initRotateNudge arms everything once).
// ---------------------------------------------------------------------------

let armed = false;
let fallbackMode = false;
let lockActive = false;
let declines = 0;
/** Whether a tap right now belongs to the world (main.ts knows). */
let offerAllowed: () => boolean = () => true;
/** Where the pin goes: the pad's side column. */
let pinHost: HTMLElement | null = null;

let offerEl: HTMLElement | null = null;
let offerKind: OfferKind | null = null;
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

/** 'lock': the browser can lay the journal sideways itself. 'turn': the
 * player has to turn the phone, so the card says how. */
export type OfferKind = 'lock' | 'turn';

function ensureOffer(kind: OfferKind): HTMLElement {
  if (offerEl && offerKind === kind) return offerEl;
  offerEl?.remove();
  offerKind = kind;
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

  const stay = document.createElement('button');
  stay.type = 'button';
  stay.className = 'sw-stay';
  stay.addEventListener('click', declineOffer);

  if (kind === 'lock') {
    const go = document.createElement('button');
    go.type = 'button';
    go.className = 'sw-go';
    go.textContent = 'Lay it sideways';
    go.addEventListener('click', () => {
      hideOffer();
      void goSideways();
    });
    stay.textContent = 'Maybe in a moment';
    card.append(buildGlyph(), title, line, go, stay);
  } else {
    // The browser cannot turn the page, so the card asks the hands to. A
    // phone that will not turn almost always has its rotation lock on, and
    // the card has no way to know; say how to lift it.
    const lock = document.createElement('div');
    lock.className = 'sw-lock';
    lock.textContent = 'Not turning? The rotation lock may be on: open Control Center and tap the lock.';
    stay.textContent = 'Upright is fine';
    card.append(buildGlyph(), title, line, lock, stay);
  }
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
  pin.className = 'vp-b vp-small';
  pin.hidden = true;
  pin.setAttribute('aria-label', 'Lay the journal sideways');
  pin.title = 'Lay the journal sideways';
  const phone = document.createElement('span');
  phone.className = 'sw-phone sw-phone-small';
  phone.setAttribute('aria-hidden', 'true');
  // Says what it does in words: a bare phone glyph in the corner read as a
  // mystery button. syncPin keeps the word in step with the orientation.
  const word = document.createElement('span');
  word.className = 'sw-pin-word';
  pin.append(phone, word);
  pin.addEventListener('click', () => {
    void goSideways();
  });
  if (pinHost) pinHost.prepend(pin);
  else document.body.appendChild(pin);
  pinEl = pin;
  return pin;
}

// ---------------------------------------------------------------------------
// Offer path (browsers that can lock orientation).
// ---------------------------------------------------------------------------

function showOffer(): void {
  ensureOffer(fallbackMode || !canLockLandscape() ? 'turn' : 'lock').hidden = false;
}

function hideOffer(): void {
  if (offerEl) offerEl.hidden = true;
}

function declineOffer(): void {
  hideOffer();
  declines += 1;
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

/**
 * Any failure of the lock path: for the rest of the session the browser is
 * treated as one that cannot turn the page. The player just asked to go
 * sideways, so the card says how to turn by hand; upright stays playable.
 */
function enterFallback(): void {
  fallbackMode = true;
  lockActive = false;
  if (pinEl) pinEl.hidden = true;
  if (inPortrait()) ensureOffer('turn').hidden = false;
  else hideOffer();
}

/** Whether a natural tap right now earns the sideways card. Pure, for the tests. */
export function offerDue(at: {
  portrait: boolean;
  declines: number;
  lockActive: boolean;
  fullscreen: boolean;
  offerShowing: boolean;
  allowed: boolean;
}): boolean {
  if (at.lockActive || at.fullscreen || !at.portrait || at.offerShowing) return false;
  // Once a session. It used to come back on the next tap after five
  // seconds, which was the name card's "write it down": two interruptions
  // in the first half minute.
  if (at.declines >= 1) return false;
  return at.allowed;
}

function offerEligible(): boolean {
  return offerDue({
    portrait: inPortrait(),
    declines,
    lockActive,
    fullscreen: !!document.fullscreenElement,
    offerShowing: !!offerEl && !offerEl.hidden,
    allowed: offerAllowed(),
  });
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
  const wanted = bare && (!inPortrait() || declines >= 1);
  if (!wanted && !pinEl) return;
  const pin = ensurePin();
  pin.hidden = !wanted;
  const label = inPortrait() ? 'Lay the journal sideways' : 'Back to the full spread';
  pin.title = label;
  pin.setAttribute('aria-label', label);
  const word = pin.querySelector('.sw-pin-word');
  if (word) word.textContent = inPortrait() ? 'sideways' : 'full screen';
}

// ---------------------------------------------------------------------------
// Entry point. main.ts calls this once at boot.
// ---------------------------------------------------------------------------

/**
 * Arms the landscape-first flow on phones. Historically this showed a one-off
 * portrait whisper; the name stays so main.ts needs no change. On tablets and
 * desktops it does nothing at all.
 */
export function initRotateNudge(opts: { canOffer?: () => boolean; pinHost?: HTMLElement } = {}): void {
  if (armed || !isPhone()) return;
  armed = true;
  if (opts.canOffer) offerAllowed = opts.canOffer;
  pinHost = opts.pinHost ?? null;
  declines = readDeclines();

  const onOrientationSettled = (): void => {
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

  // Every phone gets the same offer on its first natural upright tap.
  window.addEventListener('pointerdown', onGesture, { capture: true, passive: false });
  if (canLockLandscape()) {
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
  }
}
