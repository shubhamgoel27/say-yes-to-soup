/** Tuning values that decide how the game feels. Everything here is meant to be fiddled with. */

export const TILE = 16;

/**
 * Art scale: logical units stay 16 per tile for all game logic, but every
 * texture is authored and rendered at 4x (64px tiles, smooth shapes,
 * antialiasing on). The modern-2D pivot: no visible pixels anywhere.
 */
export const ART = 4;

/**
 * 320x180 logical: modern 16:9 that integer-scales to 1080p (6x), 1440p (8x)
 * and 4K (12x). Twenty tiles across; the cinematic cozy frame.
 */
export const VIEW_W = 320;
export const VIEW_H = 180;

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
