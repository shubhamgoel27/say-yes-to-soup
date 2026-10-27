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
