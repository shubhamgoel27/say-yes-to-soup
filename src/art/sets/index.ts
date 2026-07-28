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
  /** Soft ground decor that melts into the earth: no ink outline, no shadow. */
  noInk?: string[];
  /**
   * Per-map re-skins: on this map, draw kind X with kind Y's art.
   *
   * The interior shell (`wallInt`, `floorEarth`, `rug`) is written once and
   * named by every legend, which is convenient and, left alone, means a
   * Zanzibari kanga shop and a Sikh langar are the same Andean room with
   * different furniture in it. A skin lets a chapter say "on my map that wall
   * is lime-washed coral rag" without every legend having to learn a
   * chapter-private kind, and without a map grid changing at all. The kind
   * name the map used still decides the examine, so per-map examine arms
   * (`ExamineArm.map`) carry the words the way they always did.
   */
  skins?: Record<string, Record<string, string>>;
};

export const ART_SETS: ChapterArt[] = [];

/**
 * Which art each map substitutes for which kind. Merged at registration so
 * the Tileset can swap in one lookup when the map changes, never per tile.
 */
export const MAP_SKINS: Record<string, Record<string, string>> = {};

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

/** Soft-decor kinds contributed by chapters; tiles.ts folds these into NO_INK. */
export const SOFT_KINDS = new Set<string>();

export function registerArt(set: ChapterArt) {
  ART_SETS.push(set);
  for (const k of set.noInk ?? []) SOFT_KINDS.add(k);
  for (const [k, v] of Object.entries(set.windows ?? {})) WINDOW_OFFSETS[k] = v;
  for (const k of set.glows ?? []) GLOW_KINDS.add(k);
  for (const [mapId, skin] of Object.entries(set.skins ?? {})) {
    MAP_SKINS[mapId] = { ...(MAP_SKINS[mapId] ?? {}), ...skin };
  }
}

// ---- chapter art modules (registered here; two lines per chapter) ----
import { ART as CHASKA_ART } from './chaska';
import { ART as CALETA_ART } from './caleta';
import { ART as CROSSING_ART } from './crossing';
import { ART as SHIONOURA_ART } from './shionoura';
import { ART as BUSAN_ART } from './busan';
import { ART as KERALA_ART } from './kerala';
import { ART as DELHI_ART } from './delhi';
import { ART as ZANZIBAR_ART } from './zanzibar';
import { ART as SICILY_ART } from './sicily';
import { ART as OAXACA_ART } from './oaxaca';
registerArt(CHASKA_ART);
registerArt(CALETA_ART);
registerArt(CROSSING_ART);
registerArt(SHIONOURA_ART);
registerArt(BUSAN_ART);
registerArt(KERALA_ART);
registerArt(DELHI_ART);
registerArt(ZANZIBAR_ART);
registerArt(SICILY_ART);
registerArt(OAXACA_ART);
