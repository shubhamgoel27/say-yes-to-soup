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

  /** `leadK` scales the lookahead: a composed shot (the ending) sets its own frame. */
  follow(targetPx: number, targetPy: number, mapW: number, mapH: number, leadK = 1) {
    const worldW = mapW * TILE;
    const worldH = mapH * TILE;

    // Centre on the target's middle, not its top-left corner.
    let x = targetPx + TILE / 2 - VIEW_W / 2 + this.leadX * leadK;
    let y = targetPy + TILE / 2 - VIEW_H / 2 + this.leadY * leadK;

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

/**
 * How far to move the camera down (positive) or up (negative) while words
 * are on screen, so the people in the scene stand in the band between the
 * top of the frame and the top of the textbox. All in world px.
 *
 * `head` and `feet` span everyone who matters to the line; `top` and `box`
 * are the frame's top edge and the textbox's top edge where they fall in the
 * world right now. The lift is the smallest move that puts the feet `margin`
 * above the box and the hats `pad` below the frame's top, and none at all
 * when they already are. The camera stops at a map's edge, which is how a
 * talk near the bottom of a map played under the box and an arrival at the
 * top of one pinned the traveler's head to the frame (La Caleta); the lift
 * goes past either edge if it must, into the frame's own margin. When the
 * group is taller than the band, the faces win.
 */
export function wordsLiftTarget(head: number, feet: number, top: number, box: number, margin: number, pad: number): number {
  // Moving the camera down by L moves everyone up the screen by L.
  const lo = feet + margin - box; // at least this much, or the feet are under the box
  const hi = head - top - pad; // at most this much, or the hats leave the top
  if (lo > hi) return hi;
  return clamp(0, lo, hi);
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
