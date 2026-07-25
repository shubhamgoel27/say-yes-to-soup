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
    const MAX = 22; // logical px of lookahead at full commitment
    const k = 1 - Math.exp(-dt * 1.6); // slow drift, never a jerk
    this.leadX += (dirX * MAX - this.leadX) * k;
    this.leadY += (dirY * MAX - this.leadY) * k;
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

    // Whole pixels only. Sub-pixel camera offsets make pixel art shimmer.
    this.x = Math.round(x);
    this.y = Math.round(y);
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
