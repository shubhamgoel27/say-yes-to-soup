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
  let prevNow = 0;
  let running = true;

  // Dev-only cost meter: how much of the frame budget the game actually
  // spends, split sim vs draw. Read via globalThis.__soupPerf; rolling
  // window so a probe can sample it whenever it likes.
  const perf = import.meta.env.DEV
    ? { u: new Float32Array(240), r: new Float32Array(240), i: 0, hitches: [] as { at: number; gap: number; cpu: number }[] }
    : null;
  if (perf) {
    (globalThis as unknown as { __soupPerf: unknown }).__soupPerf = {
      sample() {
        const pct = (a: Float32Array, p: number) => {
          const s = [...a].sort((x, y) => x - y);
          return +(s[Math.floor(s.length * p)] ?? 0).toFixed(2);
        };
        return {
          updateP50: pct(perf.u, 0.5), updateP95: pct(perf.u, 0.95),
          renderP50: pct(perf.r, 0.5), renderP95: pct(perf.r, 0.95),
          // Every frame gap over 14ms since boot, newest last. gap is the
          // whole interval; cpu is what the game itself spent inside it.
          // gap >> cpu means the hitch came from outside the game.
          hitches: perf.hitches.map((h) => ({
            secondsAgo: +((performance.now() - h.at) / 1000).toFixed(1),
            gapMs: +h.gap.toFixed(1),
            gameCpuMs: +h.cpu.toFixed(1),
          })),
        };
      },
    };
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    // A thrown frame must never kill the game; log it and keep breathing.
    try {
      if (perf) {
        const t0 = performance.now();
        update(dt);
        const t1 = performance.now();
        render();
        const t2 = performance.now();
        perf.u[perf.i % 240] = t0 === t1 ? 0 : t1 - t0;
        perf.r[perf.i % 240] = t2 - t1;
        perf.i++;
        const gap = now - prevNow;
        if (gap > 14 && prevNow > 0) {
          perf.hitches.push({ at: now, gap, cpu: t2 - t0 });
          if (perf.hitches.length > 40) perf.hitches.shift();
        }
        prevNow = now;
      } else {
        update(dt);
        render();
      }
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
