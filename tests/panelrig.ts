/**
 * A headless stage for the minigame panels. The panels only ever touch the
 * DOM through a handful of calls (mount a scene, set a hint, paint a canvas),
 * so a forgiving stand-in document lets the real panel code run under
 * node:test, clocks and all, driven by the same open/onDir/onAction/tick the
 * engine uses. Painting goes nowhere; the game logic is the real thing.
 */

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** A proxy that is every DOM object at once: any property, any call. */
export function ghost(): Any {
  const store: Record<string | symbol, unknown> = {};
  const target = function () {} as Any;
  return new Proxy(target, {
    get(_t, k) {
      if (k in store) return store[k];
      if (k === Symbol.toPrimitive) return () => 0;
      if (k === 'then') return undefined;
      if (k === 'hidden') return true;
      if (k === 'length') return 0;
      if (k === 'width' || k === 'height') return 640;
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'querySelectorAll') return () => [];
      if (k === 'contains') return () => false; // body.classList: no reduce-motion
      return ghost();
    },
    set(_t, k, v) {
      store[k] = v;
      return true;
    },
    apply() {
      return ghost();
    },
    construct() {
      return ghost();
    },
  });
}

const g = globalThis as Any;
g.document ??= ghost();
g.window ??= globalThis;
g.Image ??= function () {
  return ghost();
};
g.Path2D ??= function () {
  return ghost();
};
g.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
g.requestAnimationFrame ??= () => 0;
if (!g.localStorage) {
  const store = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}
g.location ??= { search: '' };

/** A small seeded generator, so a bot's run is the same run every time. */
export function seedRandom(seed: number): () => void {
  const real = Math.random;
  let s = seed >>> 0 || 1;
  Math.random = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  return () => {
    Math.random = real;
  };
}

export type Dir = 'up' | 'down' | 'left' | 'right';
export type Panel = {
  isOpen: boolean;
  open(onDone: () => void): void;
  onDir(d: Dir): void;
  onAction(): void;
  tick?(dt: number): void;
};

/** One frame of a bot's attention: look at the panel, maybe press something. */
export type Bot = (p: Any, t: number) => void;

export const DT = 1 / 60;

/**
 * Open `panel`, let `bot` play it frame by frame, and report whether the
 * panel closed itself (its onDone fired) before `maxSeconds` of game time.
 */
export function play(panel: Panel, bot: Bot, maxSeconds = 600): { done: boolean; seconds: number } {
  let done = false;
  panel.open(() => {
    done = true;
  });
  let t = 0;
  while (!done && t < maxSeconds) {
    bot(panel, t);
    if (done) break;
    panel.tick?.(DT);
    t += DT;
  }
  return { done, seconds: t };
}
