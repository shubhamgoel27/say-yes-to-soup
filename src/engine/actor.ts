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
  /**
   * How hard this actor is currently leaning into something it cannot pass,
   * 0 to 1, eased. The lean used to be a sine played over the bump timer,
   * which meant holding a direction into a wall replayed it about five times
   * a second and read as a shudder. Pressing against a wall is a pose, not
   * an animation: ease in, hold, ease out.
   */
  private lean = 0;
  /** Seconds since the last refused step, so a held direction keeps leaning. */
  private blockedT = 0;
  /**
   * Momentum, in seconds of grace. While this holds, a change of direction
   * flows straight into the next step instead of paying TURN_DELAY as if
   * starting cold. Measured before it existed: every mid-walk steer froze
   * the walk for the full gate, which the eye reads as the character
   * catching a foot on nothing about once per corner.
   */
  private flow = 0;
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

    // The lean follows whether we are still being refused, not the bump
    // timer: bumps retrigger every BUMP_DUR while a direction is held.
    if (this.blockedT > 0) this.blockedT = Math.max(0, this.blockedT - dt);
    const leaning = this.blockedT > 0 && !!ctx.intent && !this.frozen;
    this.lean += ((leaning ? 1 : 0) - this.lean) * (1 - Math.exp(-dt * 13));
    if (this.lean < 0.002) this.lean = 0;

    if (this.flow > 0) this.flow = Math.max(0, this.flow - dt);

    if (this.bump > 0) {
      // Pressing a different way is an escape, not a repeat offense: the
      // wall refused one direction, and the player has already chosen
      // another. Holding INTO the wall still knocks and still holds.
      if (ctx.intent && ctx.intent !== this.dir) {
        this.bump = 0;
        this.blockedT = 0;
      } else {
        this.bump -= dt;
        if (this.bump > 0) return null;
      }
    }

    if (this.moving) {
      this.t += dt;
      if (this.t < STEP_DUR) return null;
      // Carry the overflow into the next step so continuous walking doesn't
      // quantise to the frame rate and visibly stutter every tile.
      this.t -= STEP_DUR;
      this.flow = 0.25;
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
      // Fingers rolling between keys leave a frame or two with nothing held.
      // Zeroing the hold timer here made the re-press pay the standstill
      // TURN_DELAY mid-stride: a three-to-six frame freeze, caught by the
      // motion witness against perfectly even frame times. While momentum
      // holds, a momentary gap keeps the walk ready to continue.
      this.turn = this.flow > 0 ? TURN_DELAY : 0;
      this.t = 0;
      return null;
    }

    // Facing a new way restarts the hold timer, so a tap turns without
    // stepping. Only from a standstill: mid-walk, the feet have momentum
    // and a steer flows into the next step without missing a beat.
    if (want !== this.dir) {
      this.dir = want;
      this.turn = this.flow > 0 ? TURN_DELAY : 0;
    }
    this.turn += dt;
    if (this.turn < TURN_DELAY) {
      this.t = 0;
      return null;
    }

    const [tx, ty] = stepFrom(this.x, this.y, want);
    if (ctx.blocked(tx, ty)) {
      this.bump = BUMP_DUR;
      this.blockedT = BUMP_DUR * 1.6;
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

  /** Dev-only window into the gates, for the motion witness. */
  debugState() {
    return {
      moving: this.moving, t: +this.t.toFixed(3), turn: +this.turn.toFixed(3),
      bump: +this.bump.toFixed(3), flow: +this.flow.toFixed(3), dir: this.dir,
    };
  }

  /** Sub-pixel render position, interpolated across the current step. */
  renderPos(): [number, number] {
    if (this.lean > 0) {
      // Pressed against whatever refused the step, and staying pressed for
      // as long as the direction is held.
      const [bx, by] = stepFrom(0, 0, this.dir);
      const push = this.lean * 1.7;
      return [this.x * TILE + bx * push, this.y * TILE + by * push];
    }
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
