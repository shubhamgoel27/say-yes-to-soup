/**
 * Variable-timestep update, clamped: the simulation advances by exactly the
 * time the display shows, so motion is glassy on 60Hz, 120Hz ProMotion, and
 * anything else.
 *
 * This game earns the simple loop: everything in it is tween- and timer-based
 * (positions move by dt, nothing integrates forces), so variable dt changes
 * no outcomes. The previous fixed-step accumulator quantized motion to 60Hz
 * chunks and delivered 4 steps one frame and 5 the next, which the eye reads
 * as stutter no matter how healthy the frame rate is. (Automation still gets
 * determinism: the DevBridge drives update() directly with fixed steps.)
 */

/** Never simulate more than this in one frame (tab-switch / hitch guard). */
const MAX_DT = 1 / 20;

export type Loop = { stop: () => void };

export function startLoop(update: (dt: number) => void, render: () => void): Loop {
  let last = performance.now();
  let running = true;

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    // A thrown frame must never kill the game; log it and keep breathing.
    try {
      update(dt);
      render();
    } catch (err) {
      console.error('[soup] frame error:', err);
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  return {
    stop() {
      running = false;
    },
  };
}
