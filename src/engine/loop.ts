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

/**
 * Frame intervals arrive noisy: rAF timestamps wobble around the true vsync
 * cadence, and the odd frame reports half or double its real interval while
 * the display presents perfectly evenly. Stepping the sim by raw deltas
 * bakes all of it into motion. This smoother steps by the recent median and
 * banks the difference, repaying it a quarter at a time, so a lone skipped
 * or misreported frame becomes a brief, even catch-up instead of a lurch.
 *
 * The first version reset its whole window whenever one delta strayed far
 * from the median, then ran raw for the twelve frames it took to refill.
 * On a ProMotion display, which strays routinely, that produced exactly
 * what it was built to prevent: a few shimmering frames, then smooth,
 * over and over. Now a single stray is absorbed; only three strays in a
 * row read as a genuine cadence change (120Hz dropping to 60, a stall)
 * and re-tune the window immediately.
 */
export function makeDtSmoother(): (raw: number) => number {
  const recent: number[] = [];
  let drift = 0;
  let strays = 0;

  return (raw: number): number => {
    if (recent.length >= 6) {
      const sorted = [...recent].sort((a, b) => a - b);
      const median = sorted[sorted.length >> 1] ?? raw;
      const stray = raw > median * 1.45 || raw < median * 0.7;
      if (raw > 250) {
        // Not a frame interval; a pause. The tab was hidden, the laptop
        // slept. Banking it would repay minutes of debt at a 25 percent
        // speedup for the rest of the session. Paused time is forgiven.
        drift = 0;
        strays = 0;
        return median;
      }
      if (stray) {
        strays++;
        if (strays >= 3) {
          // A held new cadence: adopt it now, carry nothing over.
          recent.length = 0;
          recent.push(raw);
          drift = 0;
          strays = 0;
          return raw;
        }
        // A lone odd frame: move at the usual pace and bank the difference,
        // capped at a few frames' worth so no single gap can indebt the sim.
        drift += Math.max(-3 * median, Math.min(3 * median, raw - median));
      } else {
        strays = 0;
        recent.push(raw);
        if (recent.length > 48) recent.shift();
        drift += raw - median;
      }
      const repay = Math.max(-0.25 * median, Math.min(0.25 * median, drift * 0.25));
      drift -= repay;
      return median + repay;
    }
    recent.push(raw);
    return raw;
  };
}

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
  const smoothDt = makeDtSmoother();

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
