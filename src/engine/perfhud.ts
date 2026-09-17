/**
 * A tiny frame-health readout that works in production builds, because the
 * one place this game ever stutters is a phone playing the deployed site,
 * where the dev-only soup.perf() does not exist. Armed by visiting the game
 * with ?perf in the URL; without the flag nothing is constructed and the
 * loop pays a single null check per frame.
 *
 * The readout is quiet on purpose: small, monospace, pointer-transparent,
 * made to be screenshotted and sent back.
 */

const RING = 240;

export type PerfHud = {
  /** Feed one frame: rAF timestamp plus what update and render cost. */
  frame(now: number, updMs: number, renMs: number): void;
};

function pct(ring: Float32Array, filled: number, p: number): number {
  const n = Math.min(filled, ring.length);
  if (n === 0) return 0;
  const s = [...ring.subarray(0, n)].sort((a, b) => a - b);
  return s[Math.min(n - 1, Math.floor(n * p))] ?? 0;
}

/** Null unless the page was opened with ?perf. Safe under SSR and tests. */
export function maybePerfHud(): PerfHud | null {
  if (typeof document === 'undefined' || typeof location === 'undefined') return null;
  if (!new URLSearchParams(location.search).has('perf')) return null;

  const el = document.createElement('div');
  el.id = 'perfhud';
  el.style.cssText = [
    'position:fixed', 'top:6px', 'left:6px', 'z-index:9999',
    'pointer-events:none', 'user-select:none',
    'font:10px/1.5 ui-monospace,Menlo,monospace',
    'color:#f2e6d0', 'background:rgba(24,17,10,0.72)',
    'padding:4px 7px', 'border-radius:6px', 'white-space:pre',
  ].join(';');
  el.textContent = 'perf: warming up';
  const mount = () => document.body.appendChild(el);
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });

  const gaps = new Float32Array(RING);
  const upd = new Float32Array(RING);
  const ren = new Float32Array(RING);
  let i = 0;
  let last = 0;
  let hitches = 0;
  let shownAt = 0;

  return {
    frame(now, updMs, renMs) {
      if (last > 0) {
        const gap = now - last;
        gaps[i % RING] = gap;
        upd[i % RING] = updMs;
        ren[i % RING] = renMs;
        i++;
        // A hitch is a gap far beyond the current cadence, not merely a
        // 60Hz frame seen on what booted as a 120Hz panel.
        const cadence = pct(gaps, i, 0.5) || gap;
        if (gap > Math.max(24, cadence * 2.5)) hitches++;
      }
      last = now;
      if (now - shownAt > 500 && i >= 10) {
        shownAt = now;
        const cadence = pct(gaps, i, 0.5);
        const hz = cadence > 0 ? Math.round(1000 / cadence) : 0;
        const renderer =
          (globalThis as { __soupRenderer?: string }).__soupRenderer ?? '...';
        el.textContent = [
          `fps ${hz}  cadence ${cadence.toFixed(1)}ms  gap p95 ${pct(gaps, i, 0.95).toFixed(1)}`,
          `upd ${pct(upd, i, 0.5).toFixed(1)}/${pct(upd, i, 0.95).toFixed(1)}  ren ${pct(ren, i, 0.5).toFixed(1)}/${pct(ren, i, 0.95).toFixed(1)} ms p50/p95`,
          `hitches ${hitches}  ${renderer}`,
        ].join('\n');
      }
    },
  };
}
