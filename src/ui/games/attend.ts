/**
 * Attention, in the story tellings.
 *
 * A story run cannot be lost, but it should not be won by a hand that never
 * looks. The fix is never a fail state: a press that comes too soon simply
 * does nothing useful for a beat, the way an elder takes the bowl back for a
 * second, and a run played with attention earns its own small flourish.
 *
 * Hold: that beat. While it stands, presses do nothing; a press inside it
 * starts it over (the elder keeps hold while you keep pushing), so a hand
 * that mashes stays held and a hand that waits is free in under a second.
 * Panels pair it with a mercy so even a pure masher is never locked out:
 * after a swell or two of being held, the elder lets go and shows you.
 */
export class Hold {
  private left = 0;
  /** How many times this run a press started (or restarted) the hold. */
  count = 0;
  /** Presses inside the beat standing now; a mercy can read it. */
  streak = 0;
  /** Seconds this beat has stood, restarts included; a mercy can read it too. */
  heldFor = 0;

  reset(): void {
    this.left = 0;
    this.count = 0;
    this.streak = 0;
    this.heldFor = 0;
  }

  /** Start the beat, or start it over if it is already standing. */
  start(seconds: number): void {
    if (this.left <= 0) this.heldFor = 0;
    this.streak = this.left > 0 ? this.streak + 1 : 0;
    this.left = seconds;
    this.count++;
  }

  /** Let go at once (a mercy, or the moment the step moves on). */
  release(): void {
    this.left = 0;
    this.streak = 0;
  }

  get on(): boolean {
    return this.left > 0;
  }

  tick(dt: number): void {
    if (this.left > 0) {
      this.left = Math.max(0, this.left - dt);
      this.heldFor += dt;
    }
  }
}
