/** Tuning values that decide how the game feels. Everything here is meant to be fiddled with. */

export const TILE = 16;

/**
 * Art scale: logical units stay 16 per tile for all game logic, but every
 * texture is authored and rendered at 4x (64px tiles, smooth shapes,
 * antialiasing on). The modern-2D pivot: no visible pixels anywhere.
 */
export const ART = 4;

/**
 * 320x180 logical (landscape): modern 16:9 that integer-scales to 1080p (6x), 1440p (8x)
 * and 4K (12x). Twenty tiles across; the cinematic cozy frame.
 */
export let VIEW_W = 320;
export let VIEW_H = 180;

/**
 * The frame turns with the screen. Held upright, a phone cover-fitting the
 * landscape frame showed a keyhole about five tiles across; the same pixel
 * budget stood on end shows about nine across on a phone and eleven on a
 * tall tablet, and nothing changes for a desk or anything held sideways.
 * These are live bindings: every importer reads the current frame.
 */
export const VIEW_LANDSCAPE: readonly [number, number] = [320, 180];
export const VIEW_PORTRAIT: readonly [number, number] = [180, 320];

/** The frame for a window of this size: upright windows get the upright frame. */
export function viewFor(w: number, h: number): readonly [number, number] {
  return h > w ? VIEW_PORTRAIT : VIEW_LANDSCAPE;
}

/** Adopt the frame for this window; true when it changed. */
export function setView(w: number, h: number): boolean {
  const [vw, vh] = viewFor(w, h);
  if (vw === VIEW_W && vh === VIEW_H) return false;
  VIEW_W = vw;
  VIEW_H = vh;
  return true;
}

// The first frame is chosen before anything sizes a canvas against it.
if (typeof window !== 'undefined' && window.innerWidth > 0) setView(window.innerWidth, window.innerHeight);

/** Seconds to cross one tile. Lower is snappier; 0.14 is a comfortable walk. */
export const STEP_DUR = 0.14;

/**
 * Seconds a direction must be held before you actually step, when you weren't
 * already facing that way. This is what lets you turn in place with a tap
 * instead of lurching a full tile. Pokémon does the same thing.
 */
export const TURN_DELAY = 0.06;

/** How long you're stuck after walking into something solid. */
export const BUMP_DUR = 0.18;

/**
 * Altiplano palette, locked. Everything drawn in the game pulls from here so
 * placeholder art and real art can't drift apart tonally.
 */
export const PAL = {
  ink: '#2b2118',
  cream: '#f2e6d0',
  sky: '#8fcbe8',
  skyDeep: '#5f9fc4',
  gold: '#c8a55b',
  goldDark: '#a2823f',
  green: '#6e9e5a',
  greenDark: '#4d7440',
  earth: '#a97c50',
  earthDark: '#7d5836',
  adobe: '#b5713f',
  adobeDark: '#8a5330',
  stone: '#8c8479',
  stoneDark: '#6b655c',
  terracotta: '#c1512f',
  water: '#4e8fa6',
  waterDark: '#3a6c80',
} as const;

export type PaletteKey = keyof typeof PAL;
