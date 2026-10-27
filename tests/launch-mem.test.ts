import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * Canvas memory at launch. iOS before 17 caps the canvas memory a page may
 * hold at 224-384 MB in all, and past it getContext returns null. These run
 * the art code against a counting stand-in for the canvas: no pixels, just
 * how many bytes each surface would hold and whether anything still uses
 * one after it was handed back.
 */

type Counted = {
  width: number;
  height: number;
  getContext(kind: string): unknown;
};

/** Every canvas made so far, as it is now. */
const made: Counted[] = [];
let refuse = false;

function stubContext(cv: Counted): unknown {
  const ctx: Record<string | symbol, unknown> = {
    canvas: cv,
    drawImage(img: Counted) {
      if (img && typeof img === 'object' && 'getContext' in img && img.width * img.height === 0) {
        throw new Error('drew a released canvas');
      }
    },
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    measureText: (t: string) => ({ width: t.length * 6 }),
  };
  return new Proxy(ctx, {
    get: (t, p) => (p in t ? t[p] : () => undefined),
    set: (t, p, v) => ((t[p] = v), true),
  });
}

function countingCanvas(): Counted {
  let ctx: unknown = null;
  const cv: Counted = {
    width: 300,
    height: 150,
    getContext() {
      if (refuse) return null;
      ctx ??= stubContext(cv);
      return ctx;
    },
  };
  made.push(cv);
  return cv;
}

(globalThis as unknown as { document: unknown }).document = {
  createElement: (tag: string) => {
    if (tag !== 'canvas') throw new Error(`no ${tag} here`);
    return countingCanvas();
  },
};
(globalThis as unknown as { location: unknown }).location = { search: '' };

/** Canvases of exactly this size still holding pixels. */
const sized = (w: number, h: number, but?: Counted) => made.filter((c) => c !== but && c.width === w && c.height === h).length;

const { context2d, surface } = await import('../src/art/pix');

describe('a browser out of canvas memory', () => {
  it('fails with words, not a null dereference', () => {
    refuse = true;
    try {
      assert.throws(() => surface(64, 64), /Out of canvas memory: .*64x64/);
      assert.throws(() => context2d(countingCanvas() as unknown as HTMLCanvasElement), /Out of canvas memory/);
    } finally {
      refuse = false;
    }
  });
});

describe('mood overlays', () => {
  it('bake only the mood that is lit, and a turned phone re-bakes only that one', async () => {
    const { Renderer } = await import('../src/engine/renderer');
    const { setView } = await import('../src/engine/config');
    const game = countingCanvas();
    const r = new Renderer(game as unknown as HTMLCanvasElement);
    const paint = { top: 'rgba(1,2,3,0.1)', mid: 'rgba(1,2,3,0)', bottom: 'rgba(3,2,1,0.1)', vig: 0.3 };
    r.registerMoods(Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`mood${i}`, paint])));
    assert.equal(sized(1280, 720, game), 0, 'no overlay is baked before a mood is lit');

    // Drawn at the end of every world frame; private, so reached around.
    const lit = () => (r as unknown as { atmosphere(): HTMLCanvasElement | null }).atmosphere();
    for (const m of ['mood0', 'warm', 'mood7', 'interior', 'mood7']) {
      r.setMood(m);
      assert.ok(lit(), `${m} lights`);
    }
    assert.equal(sized(1280, 720, game), 2, 'the lit mood and the one before it, no more');
    r.setMood('no-such-mood');
    assert.ok(lit(), 'an unknown mood still lights, as warm');

    setView(720, 1280);
    try {
      r.resizeView();
      assert.equal(sized(1280, 720, game), 0, 'the old frame size is handed back');
      lit();
      assert.equal(sized(720, 1280, game), 1, 'a turn re-bakes the one mood on screen');
    } finally {
      setView(1280, 720);
      r.resizeView();
    }
  });
});
