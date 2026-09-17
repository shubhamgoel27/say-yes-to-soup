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
window.addEventListener('pointerdown', record, true);
window.addEventListener('pointermove', record, true);

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
