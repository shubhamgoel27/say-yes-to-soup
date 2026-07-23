import { TILE, VIEW_H, VIEW_W } from './config';

/**
 * The camera locks to the player rather than easing toward them. With a tweened
 * player the motion is already smooth, and a lerp on top only adds a rubber-band
 * wobble that reads as sloppy at this pixel density.
 */
export class Camera {
  x = 0;
  y = 0;

  follow(targetPx: number, targetPy: number, mapW: number, mapH: number) {
    const worldW = mapW * TILE;
    const worldH = mapH * TILE;

    // Centre on the target's middle, not its top-left corner.
    let x = targetPx + TILE / 2 - VIEW_W / 2;
    let y = targetPy + TILE / 2 - VIEW_H / 2;

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
