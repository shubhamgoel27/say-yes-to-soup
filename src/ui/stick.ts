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

  let pointer: number | null = null;
  let ox = 0;
  let oy = 0;
  let held: Dir | null = null;

  const setHeld = (d: Dir | null) => {
    if (d === held) return;
    if (held) release(held);
    if (d) hold(d);
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
  };
  root.addEventListener('pointerup', lift);
  root.addEventListener('pointercancel', lift);

  return { calm, root };
}
