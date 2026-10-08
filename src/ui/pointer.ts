/**
 * Shared pointer discipline for every DOM menu surface.
 *
 * A touch tap makes Chrome replay a synthetic compatibility chain after the
 * finger lifts: mouseover, mousemove, mousedown, mouseup, click. Menus here
 * steer their selection on mouseover, and steering re-renders the surface's
 * innerHTML, so the tap's own mouseover rebuilt the DOM mid-chain. The click
 * then hit-tested a different tree: sometimes a different row, sometimes a
 * verb that had just moved under the point, and sometimes the browser
 * dropped the click entirely, which read as "the button did nothing".
 *
 * The cure has two halves, used together by main.ts and the title shelf:
 *  - touchActive() lets mouseover and click handlers ignore the synthetic
 *    chain (pointer events always precede the compat events they spawn, so
 *    the recorded type is accurate by the time any mouse handler asks);
 *  - onTouchTap() gives a surface one clean tap: the target is captured at
 *    pointerdown before anything can re-render, preventDefault stops the
 *    compat chain at the source, and the action runs on pointerup so the
 *    tap still carries the browser's transient user activation (a touch
 *    pointerdown does not grant it, and the shelf's file picker needs it).
 *
 * Mice and pens keep the classic hover-then-click feel untouched.
 */

let activeType = 'mouse';
const record = (e: PointerEvent) => {
  activeType = e.pointerType || 'mouse';
};

/** Just enough of a DOM node for the ghost test (and for tests to fake). */
export type NodeLike = { isConnected: boolean; contains(other: NodeLike | null): boolean };

/**
 * The ghost click. A touch tap acts on pointerdown or pointerup, and the
 * browser still synthesizes a click afterwards, hit-tested against whatever
 * is under the finger by then. When the tap itself opened a new card, that
 * click lands on the card: "Begin the journey" acted at pointerup, the name
 * card opened under the finger, and the same tap's click pressed its
 * "write it down", naming the player "traveler" unseen. A real tap's click
 * lands on the element its finger came down on (or inside it, or around
 * it); anything else is the ghost of a tap that already did its work.
 */
export function isGhostClick(down: NodeLike | null, click: NodeLike | null): boolean {
  if (!down || !click) return false;
  if (!down.isConnected) return true;
  return !(down === click || down.contains(click) || click.contains(down));
}

/** The finger's last touchdown, while its click may still be on the way. */
let touchDown: { target: NodeLike; at: number } | null = null;
/** A click this long after the touchdown is not that tap's click. */
const GHOST_MS = 1200;

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', record, true);
  window.addEventListener('pointermove', record, true);
  window.addEventListener(
    'pointerdown',
    (e) => {
      touchDown = e.pointerType === 'touch' && e.target ? { target: e.target as unknown as NodeLike, at: performance.now() } : null;
    },
    true,
  );
  // Capture on window: the ghost dies before any card can hear it.
  window.addEventListener(
    'click',
    (e) => {
      const down = touchDown;
      touchDown = null;
      if (!down || performance.now() - down.at > GHOST_MS) return;
      if (isGhostClick(down.target, e.target as unknown as NodeLike)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
}

/** True while the most recent pointer activity came from a finger. */
export function touchActive(): boolean {
  return activeType === 'touch';
}

/** Wire a click-driven menu surface for single, faithful touch taps. */
export function onTouchTap(
  root: HTMLElement,
  isOpen: () => boolean,
  tap: (target: HTMLElement, clientX: number) => void,
): void {
  let armed: { id: number; target: HTMLElement; x: number } | null = null;
  root.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || !isOpen()) return;
    e.preventDefault();
    armed = { id: e.pointerId, target: e.target as HTMLElement, x: e.clientX };
  });
  root.addEventListener('pointercancel', (e) => {
    if (armed && armed.id === e.pointerId) armed = null; // a scroll, not a tap
  });
  root.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'touch' || !armed || armed.id !== e.pointerId) return;
    const { target, x } = armed;
    armed = null;
    if (isOpen() && target.isConnected) tap(target, x);
  });
}
