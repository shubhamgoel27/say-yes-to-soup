import type { Cond } from '../schema';
import type { Blocking, Escort, HourHold, TalkSeat } from '../staging';

/**
 * Stage directions for the last two evenings of the journey: where people
 * stand when the village has something to say, who walks beside you, and
 * what hour the words were written in. Pure data; the engine's staging block
 * in main.ts reads it every frame and does the walking and the light (the
 * types, and the other chapters' climaxes, are in ../staging.ts).
 *
 * Everything here is gated on story flags, so a reload in the middle of an
 * evening simply stages it again.
 */

export type { Blocking, Escort, HourHold };

/**
 * The well at dusk: half the village in a loose ring round the well and its
 * jug, three across the top, one at each side, two closing the bottom, and
 * the gap at the bottom middle left for the player (MEETING). The ring is an
 * ellipse, three tiles out each side of the well and two deep, which is what
 * a circle looks like from up here. Nobody stands directly above, below or
 * beside anybody else, so no two people overlap; Carmen has the floor at the
 * top, facing the one who was there across the well.
 */
const VERDICT: Cond = { has: ['c10.well.called'], not: ['c10.carmen.her'] };

export const BLOCKING: Blocking[] = [
  // The first chapter, not an evening: while the pick is in your bag and her
  // loom is the errand, Carmen keeps to it (her door, the geraniums) instead
  // of wandering, so the chip's "outside the northeast house" stays true and
  // she is where a walking player arrives.
  { id: 'carmen', when: { has: ['wichuna.have'], not: ['pallay.done'] }, map: 'village', at: [30, 12], dir: 'down' },
  // Home again, and she is where the Return's words keep finding her: sat at
  // the free end of the backstrap loom (the strap lies open on that side of
  // its art), facing the stake, weaving. "She does not look up from the
  // loom" is then simply true, and "Sit while she weaves" has someone to
  // sit beside. She gets up when she names the hour.
  {
    id: 'carmen',
    when: { has: ['c10.arrived'], not: ['c10.well.called'] },
    map: 'village',
    at: [30, 12],
    dir: 'right',
    sit: true,
  },
  // One step west of the plaza lamp: at 19,13 its post rose straight out of
  // his hat for the whole verdict.
  { id: 'teofilo', when: VERDICT, map: 'village', at: [18, 13], dir: 'down' },
  { id: 'carmen', when: VERDICT, map: 'village', at: [21, 13], dir: 'down' },
  { id: 'pilar', when: VERDICT, map: 'village', at: [23, 13], dir: 'down' },
  { id: 'rosa', when: VERDICT, map: 'village', at: [18, 15], dir: 'right' },
  { id: 'justina', when: VERDICT, map: 'village', at: [24, 15], dir: 'left' },
  { id: 'mateo', when: VERDICT, map: 'village', at: [19, 17], dir: 'right' },
  { id: 'aurelio', when: VERDICT, map: 'village', at: [23, 17], dir: 'left' },
  // Allqu attends, on the outside of the ring by Aurelio, which is where dogs attend from.
  { id: 'allqu', when: VERDICT, map: 'village', at: [25, 17], dir: 'left' },
  // The last page: Aurelio keeps his stool by the well, and Rosa, whose
  // evening wander otherwise parks her right behind the writer, is the bowl
  // going down on a table two steps off.
  { id: 'rosa', when: { has: ['c10.lamp'], not: ['story.end'] }, map: 'village', at: [18, 18], dir: 'up' },
  // Allqu never counts as a body, so on the walk down he settled on the
  // writing stone itself and the last page was written with a dog drawn
  // through the writer. He keeps the evening a step off, watching the well.
  { id: 'allqu', when: { has: ['c10.apacheta.done'], not: ['story.end'] }, map: 'village', at: [24, 16], dir: 'left' },
];

/**
 * The ring's open place. Walking into it, or anywhere between it and the
 * well, is taking your place, and the meeting begins with Carmen.
 */
export const MEETING = { when: VERDICT, map: 'village', spot: [21, 17] as [number, number], speaker: 'carmen' };

/** The jug the argument goes round, on the setts at the well's front-left from the call on. */
export const JUG = { when: { has: ['c10.well.called'] } as Cond, map: 'village', at: [20, 16] as [number, number] };

/** Carmen walks the stone up with you, and back down to the lit well. */
export const ESCORTS: Escort[] = [
  { id: 'carmen', when: { has: ['c10.carmen.her'], not: ['c10.lamp'] } },
];

/** The village and the pass road up to the apacheta. */
const HOME = ['village', 'east-road'];

export const HOURS: HourHold[] = [
  // The ofrenda is finished in Refugio's kitchen, and "tonight we take the
  // last candle to the camposanto": the evening comes down while you are
  // indoors, so the lane outside is already dusk.
  { when: { has: ['c9.ofrenda.done'], not: ['c9.vigil.done'] }, on: ['oaxaca', 'cocina', 'camposanto'], min: 0.6, max: 0.85 },
  // You stay at the vigil until the candles are low, and the colectivo
  // corner is first light. Set during the journey card's black, and held in
  // the gold of the first minutes (as Busan's dawn is): a window to 0.3 let
  // the goodbye's "First light" play in full mid-morning sun.
  { when: { has: ['c9.vigil.done'], not: ['c10.arrived'] }, on: ['oaxaca', 'cocina'], min: 0.005, max: 0.035, snap: true },
  // Carmen names the hour and the afternoon goes: dusk at the well, and the
  // last light for the walk up to the apacheta.
  { when: { has: ['c10.well.called'], not: ['c10.apacheta.done'] }, on: HOME, min: 0.555, max: 0.6 },
  // Down from the pass the lamps come on, and the last page is written by them.
  { when: { has: ['c10.apacheta.done'], not: ['story.end'] }, on: HOME, min: 0.66, max: 0.7 },
];

/**
 * The lamplit hush at the well: from the first word of the last page until
 * the closing book is put down, the music is only the hum and the camera
 * leans in. `zoom` is where the lean ends; it gets there slowly.
 */
export const LAMP = { flag: 'c10.lamp', zoom: 1.45, seconds: 10 };


/**
 * The last page is written sitting: "You sit where she sat." The player
 * sits on the well's east lip for the page (where Aurelio sat to hand over
 * her letter), not standing in front of the well with its posts rising out
 * of their hat, and is still beside the well, not inside it, when the
 * closing book is put down and the lamplit night comes back up.
 */
export const LAST_PAGE_SEAT: TalkSeat = {
  nodes: [
    'c10.well.wishnani',
    'c10.well.wishroad',
    'c10.well.wishpeople',
    'c10.lastpage',
    'c10.lastline.word',
    'c10.lastline.trick',
    'c10.lastline.begun',
    'c10.end.hold',
  ],
  map: 'village',
  at: [22, 15],
  dir: 'down',
};
