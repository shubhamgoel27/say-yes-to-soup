import type { Rng } from '../pix';

/**
 * Chapter art registry. Each chapter ships its tile kinds in its own module
 * under this folder and registers here; the Tileset picks them all up at
 * construction. Shared engine files never need editing for a new biome.
 */

export type MakeTile = (
  kind: string,
  n: number,
  fn: (g: CanvasRenderingContext2D, r: Rng, i: number) => void,
  w?: number,
  h?: number,
) => void;

export type ChapterArt = {
  /** Paint and register this chapter's tile kinds. */
  paint: (make: MakeTile) => void;
  /** Kinds that borrow another kind's art (per-chapter examine voices). */
  aliases?: Record<string, string>;
  /** Freestanding 64x96 tall props whose shadow is baked in. */
  grounded?: string[];
  /** House-like 352x256 sprites: anchored like `house`, long base shadow. */
  buildings?: string[];
  /** Per building kind: window-light centers, logical px from the anchor cell. */
  windows?: Record<string, [number, number][]>;
  /** Object kinds that emit warm light at night. */
  glows?: string[];
  /** Ground kinds that count as water for bank autotiling. */
  watery?: string[];
  /** Ground kinds paths visually connect to. */
  pathy?: string[];
};

export const ART_SETS: ChapterArt[] = [];

/** Window-light offsets for the built-in buildings, extended by chapters. */
export const WINDOW_OFFSETS: Record<string, [number, number][]> = {
  house: [
    [15, -6],
    [67, -6],
  ],
  casa: [
    [15, -10],
    [67, -10],
  ],
};

/** Object kinds that get a flickering light at night, extended by chapters. */
export const GLOW_KINDS = new Set(['qoncha', 'campfire', 'farol']);

export function registerArt(set: ChapterArt) {
  ART_SETS.push(set);
  for (const [k, v] of Object.entries(set.windows ?? {})) WINDOW_OFFSETS[k] = v;
  for (const k of set.glows ?? []) GLOW_KINDS.add(k);
}

// ---- chapter art modules (registered here; two lines per chapter) ----
import { ART as CROSSING_ART } from './crossing';
import { ART as SHIONOURA_ART } from './shionoura';
import { ART as BUSAN_ART } from './busan';
import { ART as KERALA_ART } from './kerala';
import { ART as ZANZIBAR_ART } from './zanzibar';
import { ART as SICILY_ART } from './sicily';
import { ART as OAXACA_ART } from './oaxaca';
registerArt(CROSSING_ART);
registerArt(SHIONOURA_ART);
registerArt(BUSAN_ART);
registerArt(KERALA_ART);
registerArt(ZANZIBAR_ART);
registerArt(SICILY_ART);
registerArt(OAXACA_ART);
