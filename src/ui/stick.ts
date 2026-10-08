import type { Dir } from '../engine/input';

/**
 * The floating walk stick: a thumb lands anywhere in the lower-left of the
 * screen, an inked ring blooms under it, and small slides steer the walk.
 * The world underneath is strictly four-directional, so the stick's whole
 * job is honest quantization: it speaks crisp holdDir/releaseDir to the
 * engine and keeps every analog wobble to itself.
 */

/** Thumb travel under this many px reads as a rest, not a direction. */
export const STICK_DEAD = 14;
/** The pebble's leash: the visual throw of the stick in px. */
export const STICK_THROW = 48;
/**
 * Switching to the other axis must be earned: the new axis has to beat the
 * held one by this factor. Without it, a thumb resting near a diagonal
 * flickers between two directions once per wobble, and the walker on
 * screen looks drunk. Reversals along the held axis pass untaxed; pulling
 * straight back means the opposite direction and nothing else.
 */
export const STICK_GRIP = 1.25;

/** A touch shorter than this that never left the dead zone is a tap. */
export const STICK_TAP_MS = 450;

/**
 * Was this touch a tap rather than a steer? The stick's corner covers a
 * fifth of a phone, and the camera often parks people and pots there; a tap
 * on them must reach the world (tap to walk, tap to talk), not die in the
 * stick. A steer is any touch that ever chose a direction.
 */
export function stickTapped(steered: boolean, maxTravel: number, ms: number): boolean {
  return !steered && maxTravel < STICK_DEAD && ms < STICK_TAP_MS;
}

/**
 * One thumb vector in, at most one direction out. Pure so the hysteresis
 * can be pinned by tests: `held` is whatever direction is currently walking
 * (null when standing), and the return value is the direction that should
 * be walking now.
 */
export function quantizeStick(dx: number, dy: number, held: Dir | null): Dir | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax * ax + ay * ay < STICK_DEAD * STICK_DEAD) return null;
  const candidate: Dir = ax >= ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  if (!held || candidate === held) return candidate;
  const heldAxis = held === 'left' || held === 'right' ? ax : ay;
  const candAxis = candidate === 'left' || candidate === 'right' ? ax : ay;
  if (candAxis === heldAxis) {
    // Same axis, opposite sense: an intentional reversal, taken at once.
    return candidate;
  }
  return candAxis > heldAxis * STICK_GRIP ? candidate : held;
}

export type Stick = {
  /** Let go of everything: hides the ring and releases any held walk. */
  calm: () => void;
  root: HTMLElement;
};

/** Once a thumb has walked this long in total, the hint has done its job. */
const TAUGHT_AFTER_MS = 1200;
const TAUGHT_KEY = 'elsewhere.stickTaught';

function alreadyTaught(): boolean {
  try {
    return localStorage.getItem(TAUGHT_KEY) === '1';
  } catch {
    return false; // private browsing: the hint simply teaches every visit
  }
}

function rememberTaught(): void {
  try {
    localStorage.setItem(TAUGHT_KEY, '1');
  } catch {
    // Nothing to do; the in-page fade already happened.
  }
}

/**
 * Mount the stick into the vpad. `hold`/`release` are the engine's own
 * holdDir/releaseDir; `wake` runs once per fresh touch (audio unlock).
 * Visibility is CSS's business: the region is display:none whenever the
 * player prefers buttons, and inert whenever the pad is quiet.
 */
export function makeStick(
  host: HTMLElement,
  hold: (d: Dir) => void,
  release: (d: Dir) => void,
  wake: () => void,
): Stick {
  const root = document.createElement('div');
  root.className = 'vp-stick';
  root.innerHTML = `
    <div class="vp-ring" hidden>
      <div class="vp-pebble"></div>
    </div>`;
  host.appendChild(root);
  const ring = root.querySelector<HTMLElement>('.vp-ring')!;
  const pebble = root.querySelector<HTMLElement>('.vp-pebble')!;

  // The invisible-control problem: a first-time thumb has no way to know
  // the lower left listens. A faint dashed ring and one hand-written line
  // wait there until the thumb has genuinely walked, then retire for good.
  let hintEl: HTMLElement | null = null;
  if (!alreadyTaught()) {
    hintEl = document.createElement('div');
    hintEl.className = 'vp-hint';
    hintEl.innerHTML = `
      <div class="vp-hint-ring"></div>
      <div class="vp-hint-line">rest a thumb here,<br>slide to walk</div>`;
    root.appendChild(hintEl);
  }
  let walkedMs = 0;
  let heldSince = 0;

  const retireHint = () => {
    if (!hintEl) return;
    const el = hintEl;
    hintEl = null;
    rememberTaught();
    el.classList.add('gone');
    setTimeout(() => el.remove(), 900);
  };

  let pointer: number | null = null;
  let ox = 0;
  let oy = 0;
  let held: Dir | null = null;
  // This touch's own record, for telling a tap from a steer at the lift.
  let downX = 0;
  let downY = 0;
  let downAt = 0;
  let travel = 0;
  let steered = false;

  const setHeld = (d: Dir | null) => {
    if (d === held) return;
    if (held) release(held);
    if (d) {
      hold(d);
      steered = true;
    }
    if (hintEl) {
      // Bank walking time across holds; the lesson is cumulative.
      const now = performance.now();
      if (held) walkedMs += now - heldSince;
      if (d) heldSince = now;
      if (walkedMs >= TAUGHT_AFTER_MS) retireHint();
    }
    held = d;
  };

  const calm = () => {
    pointer = null;
    ring.hidden = true;
    setHeld(null);
  };

  root.addEventListener('pointerdown', (e) => {
    if (pointer !== null) return; // one thumb steers; later fingers are the buttons'
    e.preventDefault();
    wake();
    pointer = e.pointerId;
    downX = e.clientX;
    downY = e.clientY;
    downAt = performance.now();
    travel = 0;
    steered = false;
    try {
      root.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic events carry no active pointer; the drag still works.
    }
    // The ring blooms under the thumb, nudged inward so it stays whole.
    const r = root.getBoundingClientRect();
    ox = Math.min(Math.max(e.clientX, r.left + STICK_THROW), r.right - STICK_THROW);
    oy = Math.min(Math.max(e.clientY, r.top + STICK_THROW), r.bottom - STICK_THROW);
    ring.style.left = `${ox - r.left}px`;
    ring.style.top = `${oy - r.top}px`;
    ring.hidden = false;
    pebble.style.transform = 'translate(-50%, -50%)';
  });

  root.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointer) return;
    travel = Math.max(travel, Math.hypot(e.clientX - downX, e.clientY - downY));
    const dx = e.clientX - ox;
    const dy = e.clientY - oy;
    setHeld(quantizeStick(dx, dy, held));
    const len = Math.hypot(dx, dy) || 1;
    const leash = Math.min(len, STICK_THROW);
    pebble.style.transform =
      `translate(-50%, -50%) translate(${(dx / len) * leash}px, ${(dy / len) * leash}px)`;
  });

  const lift = (e: PointerEvent) => {
    if (e.pointerId !== pointer) return;
    calm();
    if (e.type === 'pointerup' && stickTapped(steered, travel, performance.now() - downAt)) {
      passThrough(root, downX, downY);
    }
  };
  root.addEventListener('pointerup', lift);
  root.addEventListener('pointercancel', lift);

  return { calm, root };
}

/**
 * Hand a tap to whatever lies under the stick's corner, exactly as if the
 * corner were not there: the same pointerdown and pointerup the world's own
 * tap handlers listen for.
 */
function passThrough(root: HTMLElement, x: number, y: number): void {
  const was = root.style.pointerEvents;
  root.style.pointerEvents = 'none';
  const under = document.elementFromPoint(x, y);
  root.style.pointerEvents = was;
  if (!under || root.contains(under)) return;
  const init: PointerEventInit = {
    clientX: x, clientY: y, button: 0, buttons: 1, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true,
  };
  under.dispatchEvent(new PointerEvent('pointerdown', init));
  under.dispatchEvent(new PointerEvent('pointerup', { ...init, buttons: 0 }));
}
