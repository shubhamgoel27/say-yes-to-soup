import { BUMP_DUR, STEP_DUR, TILE, TURN_DELAY } from './config';
import type { Dir } from './input';
import { stepFrom } from './grid';

export type ActorCtx = {
  /** Direction the actor wants to go this frame, or null to stand still. */
  intent: Dir | null;
  /** Anything that stops a step: map collision, other actors, closed gates. */
  blocked: (x: number, y: number) => boolean;
};

export type ActorEvent = { kind: 'arrived'; x: number; y: number } | { kind: 'bumped' } | null;

/**
 * A tile-stepping character. Position is always a whole cell; movement is a
 * tween between cells, which is what gives grid RPGs their particular gait.
 */
export class Actor {
  x: number;
  y: number;
  dir: Dir;

  /** Target cell while a step is in progress. */
  private nx = 0;
  private ny = 0;
  private moving = false;
  /** Elapsed time within the current step. */
  private t = 0;
  /** How long the current direction has been held, for the turn-in-place delay. */
  private turn = 0;
  private bump = 0;
  /** Completed steps, used to pick the walk-cycle foot. */
  private steps = 0;
  /** Frozen actors ignore intent entirely (used while dialogue is open). */
  frozen = false;
  /** Transient body pose: 'sit' folds the legs and settles the figure. */
  pose: 'none' | 'sit' = 'none';
  /**
   * Seconds since the last movement or input intent, while free to act.
   * Feeds the renderer's idle life (glances, the little stretch); anything
   * that counts as input drops it back to zero.
   */
  idleT = 0;

  constructor(x: number, y: number, dir: Dir = 'down') {
    this.x = x;
    this.y = y;
    this.dir = dir;
  }

  get isMoving(): boolean {
    return this.moving;
  }

  /** Cell this actor would interact with, i.e. the one it is facing. */
  facingCell(): [number, number] {
    return stepFrom(this.x, this.y, this.dir);
  }

  /** Where this actor currently occupies for collision purposes. */
  occupies(): [number, number] {
    return this.moving ? [this.nx, this.ny] : [this.x, this.y];
  }

  update(dt: number, ctx: ActorCtx): ActorEvent {
    // Idle clock: any motion, any intent, or being frozen (dialogue holds
    // you present, not absent) snaps it back to zero.
    if (this.moving || this.frozen || (!this.frozen && ctx.intent)) this.idleT = 0;
    else this.idleT += dt;

    if (this.bump > 0) {
      this.bump -= dt;
      if (this.bump > 0) return null;
    }

    if (this.moving) {
      this.t += dt;
      if (this.t < STEP_DUR) return null;
      // Carry the overflow into the next step so continuous walking doesn't
      // quantise to the frame rate and visibly stutter every tile.
      this.t -= STEP_DUR;
      this.x = this.nx;
      this.y = this.ny;
      this.moving = false;
      this.steps++;
      // The trigger for this cell fires before we consider stepping off it.
      const arrival: ActorEvent = { kind: 'arrived', x: this.x, y: this.y };
      this.tryStart(dt, ctx);
      return arrival;
    }

    return this.tryStart(dt, ctx);
  }

  private tryStart(dt: number, ctx: ActorCtx): ActorEvent {
    const want = this.frozen ? null : ctx.intent;
    if (!want) {
      this.turn = 0;
      this.t = 0;
      return null;
    }

    // Facing a new way restarts the hold timer, so a tap turns without stepping.
    if (want !== this.dir) {
      this.dir = want;
      this.turn = 0;
    }
    this.turn += dt;
    if (this.turn < TURN_DELAY) {
      this.t = 0;
      return null;
    }

    const [tx, ty] = stepFrom(this.x, this.y, want);
    if (ctx.blocked(tx, ty)) {
      this.bump = BUMP_DUR;
      this.t = 0;
      return { kind: 'bumped' };
    }

    this.nx = tx;
    this.ny = ty;
    this.moving = true;
    return null;
  }

  /** Teleport, cancelling any step in flight. Used by doors and loads. */
  placeAt(x: number, y: number, dir?: Dir) {
    this.x = x;
    this.y = y;
    this.nx = x;
    this.ny = y;
    if (dir) this.dir = dir;
    this.moving = false;
    this.t = 0;
    this.turn = 0;
    this.bump = 0;
    this.idleT = 0;
  }

  face(dir: Dir) {
    if (!this.moving) this.dir = dir;
  }

  /** Sub-pixel render position, interpolated across the current step. */
  renderPos(): [number, number] {
    if (!this.moving) return [this.x * TILE, this.y * TILE];
    const p = Math.min(this.t / STEP_DUR, 1);
    return [
      (this.x + (this.nx - this.x) * p) * TILE,
      (this.y + (this.ny - this.y) * p) * TILE,
    ];
  }

  /**
   * 0 = standing, 1 and 2 = the two walk poses. Alternating by step count means
   * the same foot doesn't lead every single tile.
   */
  walkFrame(): 0 | 1 | 2 {
    if (this.bump > 0) return 0;
    if (!this.moving) return 0;
    const p = this.t / STEP_DUR;
    if (p < 0.15 || p > 0.85) return 0;
    return this.steps % 2 === 0 ? 1 : 2;
  }

  /**
   * Six-frame walk: three beats per step, legs alternating across two steps,
   * so one full cycle spans a left step and a right step.
   */
  walkFrame6(): number {
    if (this.bump > 0 || !this.moving) return 0;
    const p = Math.min(this.t / STEP_DUR, 0.999);
    return (this.steps % 2) * 3 + Math.floor(p * 3);
  }

  /** True during the recoil after walking into something solid. */
  get isBumping(): boolean {
    return this.bump > 0;
  }
}
