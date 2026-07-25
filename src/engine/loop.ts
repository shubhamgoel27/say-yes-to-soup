/**
 * Fixed-timestep update with a decoupled render. Simulation runs at a steady
 * 60Hz no matter the display refresh rate, so movement timing is identical on a
 * 60Hz laptop and a 120Hz monitor.
 */

const STEP = 1 / 60;
/** Never simulate more than this much time in one frame (tab-switch guard). */
const MAX_FRAME = 0.25;

export type Loop = { stop: () => void };

export function startLoop(update: (dt: number) => void, render: () => void): Loop {
  let last = performance.now();
  let acc = 0;
  let running = true;

  function frame(now: number) {
    if (!running) return;
    acc += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    // A thrown frame must never kill the game; log it and keep breathing.
    try {
      while (acc >= STEP) {
        update(STEP);
        acc -= STEP;
      }
      render();
    } catch (err) {
      console.error('[soup] frame error:', err);
      acc = 0;
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
