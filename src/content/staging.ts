import type { Look } from '../art/character';
import type { Cond, EventNode } from './schema';
import { BLOCKING as RETURN_BLOCKING, HOURS as RETURN_HOURS } from './return/staging';
import { STAGING as CROSSING } from './crossing/staging';
import { STAGING as SHIONOURA } from './shionoura/staging';
import { STAGING as BUSAN } from './busan/staging';
import { STAGING as SICILY } from './sicily/staging';
import { STAGING as KERALA } from './kerala/staging';

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
 * With `look` they are dressed for the scene (a mop wig and a bedsheet, a
 * little umbrella), but only where nobody sees the change: in a door's dark,
 * or off the map or the screen; they change back the same way.
 */
export type Blocking = {
  id: string;
  when: Cond;
  map: string;
  at: [number, number];
  dir: Dir;
  sit?: boolean;
  busy?: boolean;
  look?: Partial<Look>;
};

/** A villager who walks beside the player, across doors, while `when` holds. */
export type Escort = { id: string; when: Cond };

/**
 * The hour a stretch of story was written in. While `when` holds, the clock
 * is eased forward into [min, max] and then held below max. `snap` sets it
 * outright, but only where nobody sees it change: never while words are on
 * screen or a door is closing, always in a door's dark or at a reload.
 * `on` names the maps the hold is kept on, and only those: a hold is a
 * chapter's light, and a flag left standing (a skipped beat, a cheat desk
 * jump) once dragged every later coast down to Shionoura's festival dusk.
 */
export type HourHold = { when: Cond; on: string[]; min: number; max: number; snap?: boolean };

/**
 * Lamps that a scene says are lit. While `when` holds, every lamp a
 * scheduled round tends on `map` is lit (one after another, a wick taking
 * at each), whether or not its lamplighter has got that far yet.
 */
export type LampHold = { when: Cond; map: string };

/**
 * A scene that is waiting on the far side of a door's dark: when you come
 * through any door onto `map` while `when` holds, its narration starts as the
 * light comes up. This is how time passes in place: a node says "after
 * dinner" or "the next morning", travels you to the same map (the dark is
 * the night, or the day), and the scene it promised is already standing
 * there when the light returns, everyone in their places (see the staging
 * block in main.ts, which puts the staged on their marks in the dark).
 * Each cue is an EventNode too, so the walkers can prove it reachable.
 */
export type Cue = EventNode & { when: Cond; map: string };

/** One chapter's stage directions. */
export type Staging = { blocking?: Blocking[]; hours?: HourHold[]; lamps?: LampHold[]; cues?: Cue[] };

const CHAPTERS: Staging[] = [
  { blocking: RETURN_BLOCKING, hours: RETURN_HOURS },
  CROSSING,
  SHIONOURA,
  BUSAN,
  KERALA,
  SICILY,
];

export const BLOCKING: Blocking[] = CHAPTERS.flatMap((c) => c.blocking ?? []);
export const HOURS: HourHold[] = CHAPTERS.flatMap((c) => c.hours ?? []);
export const LAMPS_LIT: LampHold[] = CHAPTERS.flatMap((c) => c.lamps ?? []);
export const CUES: Cue[] = CHAPTERS.flatMap((c) => c.cues ?? []);

/** The hour held on `mapId` under these flags, if any. */
export function holdOn(check: (c: Cond) => boolean, mapId: string, hours: HourHold[] = HOURS): HourHold | undefined {
  return hours.find((h) => h.on.includes(mapId) && check(h.when));
}
