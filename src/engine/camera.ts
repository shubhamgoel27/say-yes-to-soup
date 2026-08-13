import { TILE, VIEW_H, VIEW_W } from './config';

/**
 * The camera locks to the player rather than easing toward them (a lerp on the
 * player only adds rubber-band wobble), but it does LEAD: a soft offset drifts
 * a few tiles toward wherever you are walking, so the world you are entering
 * gets more screen than the world you are leaving.
 */
export class Camera {
  x = 0;
  y = 0;
  private leadX = 0;
  private leadY = 0;

  /** Ease the lookahead toward the walk direction; call once per update. */
  lead(dirX: number, dirY: number, dt: number) {
    // Standing still holds the lookahead where walking left it. It used to
    // ease back to zero, which slid the whole world backwards for about half
    // a second every single time the player stopped: a reverse drift at the
    // end of every walk. The offset only matters while you are travelling,
    // and while you are standing it is invisible, so there is nothing to
    // take back. It re-aims as soon as you move again, under cover of motion.
    if (dirX === 0 && dirY === 0) return;

    const MAX = 22; // logical px of lookahead at full commitment
    const k = 1 - Math.exp(-dt * 1.6); // slow drift, never a jerk
    // An axis with no intent keeps its offset; only the axis you are actually
    // walking re-aims, so turning a corner does not yank the other axis home.
    if (dirX !== 0) this.leadX += (dirX * MAX - this.leadX) * k;
    if (dirY !== 0) this.leadY += (dirY * MAX - this.leadY) * k;
  }

  /** Drop the lookahead instantly (map changes, cutscenes). */
  resetLead() {
    this.leadX = 0;
    this.leadY = 0;
  }

  follow(targetPx: number, targetPy: number, mapW: number, mapH: number) {
    const worldW = mapW * TILE;
    const worldH = mapH * TILE;

    // Centre on the target's middle, not its top-left corner.
    let x = targetPx + TILE / 2 - VIEW_W / 2 + this.leadX;
    let y = targetPy + TILE / 2 - VIEW_H / 2 + this.leadY;

    // Small maps sit centred instead of pinning to a corner.
    x = worldW <= VIEW_W ? (worldW - VIEW_W) / 2 : clamp(x, 0, worldW - VIEW_W);
    y = worldH <= VIEW_H ? (worldH - VIEW_H) / 2 : clamp(y, 0, worldH - VIEW_H);

    // Sub-pixel camera: the smooth-art renderer is antialiased at 4x, so
    // fractional scroll is glassy. (Whole-pixel snapping made every ease-out
    // land as discrete 4-device-px jumps: the post-stop stutter.)
    this.x = x;
    this.y = y;
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
