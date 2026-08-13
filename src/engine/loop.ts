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

  // rAF timestamps wobble by a fraction of a millisecond even when frames
  // are presented at exact vsync intervals. Raw-delta dt integrates that
  // wobble straight into every position: measured on a 60Hz window, the
  // camera advanced 1.91px one frame and 2.21px the next at constant walk
  // speed, an 8% velocity shimmer the eye reads as intermittent stutter.
  // The fix: step by the display's typical interval (rolling median), and
  // nudge toward the real clock so sim time never drifts from wall time.
  const recent: number[] = [];
  let drift = 0;

  function smoothDt(raw: number): number {
    recent.push(raw);
    if (recent.length > 48) recent.shift();
    if (recent.length < 12) return raw;
    const sorted = [...recent].sort((a, b) => a - b);
    const median = sorted[sorted.length >> 1] ?? raw;
    // A real cadence change (120Hz to 60Hz, a stall) must be followed, not
    // smoothed away: a raw delta far from the median resets the window.
    if (raw > median * 1.6 || raw < median * 0.55) {
      recent.length = 0;
      recent.push(raw);
      drift = 0;
      return raw;
    }
    drift += raw - median;
    // Repay drift over many frames; imperceptible per frame, exact overall.
    const repay = Math.max(-0.1 * median, Math.min(0.1 * median, drift * 0.1));
    drift -= repay;
    return median + repay;
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(smoothDt(now - last) / 1000, MAX_DT);
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
