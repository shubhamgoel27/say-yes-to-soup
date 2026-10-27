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

const MB = 1024 * 1024;
const held = (list: Counted[]) => list.reduce((n, c) => n + c.width * c.height * 4, 0);

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

describe('villager art on demand', async () => {
  const { PLAYER_LOOK } = await import('../src/art/character');
  const ROSA = { ...PLAYER_LOOK, cloth: '#b5403a' };

  it('bakes nothing until a villager is drawn, then shares one sheet per look', async () => {
    const { Wardrobe } = await import('../src/art/wardrobe');
    const before = made.length;
    const a = new Wardrobe(() => ({ ...ROSA }));
    const b = new Wardrobe(() => ({ ...ROSA }));
    const dog = new Wardrobe(() => ({ ...ROSA }), 'dog');
    assert.equal(made.length, before, 'a wardrobe costs nothing until it is opened');

    const sheet = a.sheet;
    assert.equal(sheet.width * sheet.height, 720 * 512);
    assert.equal(b.sheet, sheet, 'the same look is baked once');
    assert.notEqual(dog.sheet, sheet);
    assert.equal(dog.portrait, null, 'animals have no portrait');
    assert.equal(a.portrait, b.portrait, 'the same face is painted once');
    // The painted sheet and the outline's scratch are handed back at once.
    const scratch = made.slice(before).filter((c) => c.width * c.height > 0 && c !== (sheet as unknown) && c !== (dog.sheet as unknown));
    assert.ok(held(scratch) < 0.2 * MB, `scratch still held: ${(held(scratch) / MB).toFixed(1)} MB`);

    b.dress({ cloth: '#204060' });
    assert.notEqual(b.sheet, sheet, 'a costume is its own sheet');
    b.dress(undefined);
    assert.equal(b.sheet, sheet, 'back in their own clothes');
  });

  it('fades on the sheet being drawn and hands the copy back when the fade settles', async () => {
    const { Wardrobe } = await import('../src/art/wardrobe');
    const w = new Wardrobe(() => ({ ...ROSA, cloth: '#335577' }));
    assert.equal(w.at(1), w.sheet);
    const faded = w.at(0.5);
    assert.notEqual(faded, w.sheet);
    assert.equal(w.at(0.4), faded, 'one copy, repainted as the fade moves');
    w.settle();
    assert.equal(faded.width * faded.height, 0, 'settled: the copy holds nothing');
    const again = w.at(0.3);
    assert.ok(again.width > 0, 'a later fade paints a fresh copy, never the released one');
  });

  it('keeps a bounded few, and never drops one drawn a moment ago', async () => {
    const { BakeCache } = await import('../src/art/wardrobe');
    const { release } = await import('../src/art/pix');
    const bake = (n: number) => () => {
      const cv = countingCanvas();
      cv.width = n;
      cv.height = n;
      cv.getContext('2d');
      return cv as unknown as HTMLCanvasElement;
    };
    const lru = new BakeCache(3, release, 0);
    const first = lru.get('a', bake(10));
    for (const k of ['b', 'c', 'd', 'e']) lru.get(k, bake(10));
    assert.equal(lru.size, 3);
    assert.equal(first.width, 0, 'the least recently used is handed back');
    assert.notEqual(lru.get('a', bake(10)), first, 'and baked afresh if it is wanted again');

    const busy = new BakeCache(3, release, 60_000);
    for (const k of ['a', 'b', 'c', 'd', 'e']) busy.get(k, bake(10));
    assert.equal(busy.size, 5, 'a crowd on screen outgrows the cap rather than re-bake every frame');
  });
});

describe('tile art', () => {
  it('keeps one copy of each kind, and every map still draws from live canvases', async () => {
    const { Renderer } = await import('../src/engine/renderer');
    const { REGION_MAPS } = await import('../src/content/world');
    const tileBytes = (maps?: typeof REGION_MAPS) => {
      const from = made.length;
      const r = new Renderer(countingCanvas() as unknown as HTMLCanvasElement, maps);
      return { r, bytes: held(made.slice(from)) };
    };
    const both = tileBytes();
    const lean = tileBytes(REGION_MAPS);
    assert.ok(lean.bytes < both.bytes * 0.6, `kept ${(lean.bytes / MB).toFixed(1)} MB of ${(both.bytes / MB).toFixed(1)} MB`);

    // Draw every cell of every map through both tilesets the way the
    // composer does. The lean one must hand out the same kind of copy (as
    // painted, or inked) of the same size every time, and never a canvas it
    // has handed back: the stand-in context throws on one of those.
    type Tiles = {
      setMap(id: string): void;
      drawGround(g: unknown, k: string, sx: number, sy: number, cx: number, cy: number, conn: () => boolean, t: number): void;
      drawFlat(g: unknown, k: string, sx: number, sy: number, cx: number, cy: number, t: number): void;
      drawTall(g: unknown, k: string, sx: number, sy: number, cx: number, cy: number): void;
      drawBuildingCap(g: unknown, k: string, sx: number, sy: number, cx: number, cy: number): void;
      drawWallRun(g: unknown, k: string, sx: number, sy: number, cx: number, cy: number, e: object): void;
      groundImage(k: string, v: number): HTMLCanvasElement | null;
      isBuilding(k: string): boolean;
      inkCache: Map<unknown, unknown>;
    };
    const tilesOf = (r: unknown) => (r as { tiles: Tiles }).tiles;
    const drawn: Counted[] = [];
    const sink = countingCanvas().getContext('2d') as Record<string, unknown>;
    const draw = sink.drawImage as (img: Counted) => void;
    sink.drawImage = (img: Counted) => {
      draw(img);
      drawn.push(img);
    };
    const inkedOf = new Map<Tiles, Set<unknown>>();
    /** What one tileset hands out for one call: its copies' kinds and sizes. */
    const handout = (t: Tiles, call: (t: Tiles) => unknown) => {
      drawn.length = 0;
      const got = call(t) as Counted | null | undefined;
      let inked = inkedOf.get(t);
      if (!inked || inked.size < t.inkCache.size) inkedOf.set(t, (inked = new Set(t.inkCache.values())));
      return [...drawn, ...(got ? [got] : [])]
        .map((c) => `${inked.has(c) ? 'inked' : 'painted'} ${c.width}x${c.height}`)
        .join(', ');
    };
    const a = tilesOf(both.r);
    const b = tilesOf(lean.r);
    let calls = 0;
    for (const [id, m] of Object.entries(REGION_MAPS)) {
      a.setMap(id);
      b.setMap(id);
      const same = (what: string, call: (t: Tiles) => unknown) => {
        calls++;
        const want = handout(a, call);
        assert.equal(handout(b, call), want, `${id}: ${what}`);
      };
      for (let y = -1; y <= m.ground.length; y++) {
        for (let x = -1; x <= (m.ground[0]?.length ?? 0); x++) {
          const gk = m.legend[m.ground[y]?.[x] ?? '']?.t ?? (y < 0 || x < 0 ? 'scree' : 'void');
          same(`ground ${gk}`, (t) => t.drawGround(sink, gk, 0, 0, x, y, () => false, 0));
          same(`seam ${gk}`, (t) => t.groundImage(gk, 0));
          const o = m.legend[m.objects?.[y]?.[x] ?? ' '];
          if (!o) continue;
          if (o.tall) {
            same(`prop ${o.t}`, (t) => t.drawTall(sink, o.t, 0, 0, x, y));
            same(`cap ${o.t}`, (t) => t.drawBuildingCap(sink, o.t, 0, 0, x, y));
            same(`run ${o.t}`, (t) => t.drawWallRun(sink, o.t, 0, 0, x, y, { left: true, right: true, top: true }));
          } else same(`flat ${o.t}`, (t) => t.drawFlat(sink, o.t, 0, 0, x, y, 0));
        }
      }
    }
    assert.ok(calls > 10_000);
  });
});
