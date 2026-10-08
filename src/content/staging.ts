import type { Cond } from './schema';
import { BLOCKING as RETURN_BLOCKING, HOURS as RETURN_HOURS } from './return/staging';
import { STAGING as CROSSING } from './crossing/staging';
import { STAGING as SHIONOURA } from './shionoura/staging';
import { STAGING as BUSAN } from './busan/staging';
import { STAGING as SICILY } from './sicily/staging';

/**
 * Stage directions: where people stand when a scene has something to say,
 * and what hour the words were written in. The words of a big scene name a
 * light, an hour and a crowd ("Dusk. The chochin come on"); this is the data
 * that puts them on screen. Pure data, gated on story flags, so a reload in
 * the middle of an evening simply stages it again. The engine side lives in
 * main.ts (the staging block), which reads it every frame and does the
 * walking and the light.
 *
 * The ending wrote this idiom first (./return/staging.ts); the crossing's
 * court and dark bow, and the climaxes of Shionoura, Busan and Sicily, use
 * the same verbs.
 */

export type Dir = 'up' | 'down' | 'left' | 'right';

/**
 * A villager who goes and stands somewhere while `when` holds. Everyone in
 * place turns to the player while words are on screen, except the `busy`,
 * who keep facing `dir` (a fishwife three customers deep does not look up).
 * With `sit` they also sit down there once arrived, busy at what they sat to.
 */
export type Blocking = {
  id: string;
  when: Cond;
  map: string;
  at: [number, number];
  dir: Dir;
  sit?: boolean;
  busy?: boolean;
};

/** A villager who walks beside the player, across doors, while `when` holds. */
export type Escort = { id: string; when: Cond };

/**
 * The hour a stretch of story was written in. While `when` holds, the clock
 * is eased forward into [min, max] and then held below max. `snap` sets it
 * outright, but only where nobody sees it change: never while words are on
 * screen or a door is closing, always in a door's dark or at a reload.
 * `notOn` maps are exempt, so a scene still running there keeps its own hour.
 */
export type HourHold = { when: Cond; min: number; max: number; snap?: boolean; notOn?: string[] };

/**
 * Lamps that a scene says are lit. While `when` holds, every lamp a
 * scheduled round tends on `map` is lit (one after another, a wick taking
 * at each), whether or not its lamplighter has got that far yet.
 */
export type LampHold = { when: Cond; map: string };

/** One chapter's stage directions. */
export type Staging = { blocking?: Blocking[]; hours?: HourHold[]; lamps?: LampHold[] };

const CHAPTERS: Staging[] = [{ blocking: RETURN_BLOCKING, hours: RETURN_HOURS }, CROSSING, SHIONOURA, BUSAN, SICILY];

export const BLOCKING: Blocking[] = CHAPTERS.flatMap((c) => c.blocking ?? []);
export const HOURS: HourHold[] = CHAPTERS.flatMap((c) => c.hours ?? []);
export const LAMPS_LIT: LampHold[] = CHAPTERS.flatMap((c) => c.lamps ?? []);
