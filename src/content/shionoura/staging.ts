import type { Cond } from '../schema';
import type { Staging } from '../staging';

/**
 * The seventh night, staged. Hana's matsuri opens "Dusk. The chochin come on
 * and the quay turns paper-orange", so once the town has finished with you
 * (wish hung, omiyage wrapped, goldfish bagged, the street met) the
 * afternoon is let go: the clock eases down to dusk, Fumi walks her lamp
 * round as she does every evening, and the people who made the chapter
 * drift down to the quay to wait for the sky. When the matsuri starts every
 * chochin is lit, whether or not Fumi has reached it, and the evening is
 * held until you sail. Isao's boat is the morning one, so saying the word
 * to him lets the festival night go in one dark: the chochin go out, the
 * town goes home to bed, and you come down to the pier in the morning wind
 * with Isao at his boat and Fumi already at the end of the pier, where her
 * bow is written.
 *
 * The quay, rows 21-23, faces the sea at the bottom of the screen, so the
 * crowd faces down: toward the water and the sky over it, and toward you.
 * Everyone stands two cells clear of everyone else and of Hana, so no
 * sprite is drawn over another; the row under Hana stays open for you.
 */

/** Everything Hana's matsuri arm asks for, short of having happened. */
const READY = ['c4.omiyage', 'c4.wish.hung', 'c4.kingyo.done', 'met.fumi', 'met.daisuke', 'met.sachiko', 'met.genji'];

/** The town is ready and the evening is coming down. */
const EVENING: Cond = { has: READY, not: ['c4.complete'] };
/** The morning boat, from the word to Isao until Busan. */
const SAILING: Cond = { has: ['c4.sailing'], not: ['c5.arrived'] };

/** Where the morning sets you down: the root of the pier, Fumi at its end. */
export const PIER_LANDING: [number, number] = [21, 27];

/** The festival itself, from Hana's first line until Isao's boat. */
const FESTIVAL: Cond = { has: ['c4.complete'], not: ['c4.sailing'] };
/** The quay is full from the moment the town is ready until you sail. */
const GATHERED: Cond = { has: READY, not: ['c4.sailing'] };

/**
 * The festival's own lanterns, strung out along the quay for the seventh
 * night (the lane's five are Fumi's round). Placed off the walking rows and
 * clear of where anyone stands, so no post is drawn across a body.
 */
export const FESTIVAL_DRESSING = {
  map: 'shionoura',
  when: { has: READY } as Cond,
  cells: [
    [13, 23, { t: 'chochin', solid: true, tall: true }],
    [30, 24, { t: 'chochin', solid: true, tall: true }],
    [34, 23, { t: 'chochin', solid: true, tall: true }],
  ] as [number, number, { t: string; solid?: boolean; tall?: boolean }][],
};

export const STAGING: Staging = {
  hours: [
    // Down to dusk while the town gathers: just past the chochin waking
    // (nightLevel 0.3), where the sky still has its ember in it and the
    // lamp round runs; held well short of the dark that sends people home.
    { when: EVENING, min: 0.585, max: 0.605 },
    // The festival keeps that hour, lanterns lit, until you go.
    { when: FESTIVAL, min: 0.585, max: 0.615 },
    // "The tairyō-bata crack once in the morning wind": Isao's boat is the
    // morning one. Set in the dark the night passes in, never in view.
    { when: SAILING, min: 0.12, max: 0.2, snap: true, notOn: ['busan'] },
  ],
  // The goodbye itself, read as the morning comes up on the pier.
  // (Its own map is the gate: once Busan has you, no door leads back here.)
  cues: [{ when: { has: ['c4.sailing'] }, map: 'shionoura', node: 'c4.depart' }],
  lamps: [{ when: FESTIVAL, map: 'shionoura' }],
  blocking: [
    // The arrival: "Hana is already ashore, standing very still, looking at
    // her town." Off the pier's head, back to you, facing up the town, until
    // she has said tadaima to it.
    { id: 'hana', when: { not: ['met.hana'] }, map: 'shionoura', at: [20, 26], dir: 'up' },
    { id: 'hana', when: GATHERED, map: 'shionoura', at: [22, 21], dir: 'down' },
    { id: 'chascaC4', when: GATHERED, map: 'shionoura', at: [19, 23], dir: 'down' },
    { id: 'sachiko', when: GATHERED, map: 'shionoura', at: [19, 21], dir: 'down' },
    // "Bellowing prices for things he is giving away", from his own stall.
    { id: 'daisuke', when: GATHERED, map: 'shionoura', at: [16, 22], dir: 'down' },
    { id: 'genji', when: GATHERED, map: 'shionoura', at: [25, 22], dir: 'down' },
    { id: 'taro', when: GATHERED, map: 'shionoura', at: [28, 23], dir: 'down' },
    // One step west of the corner, out from under the pillar box (at 31 it
    // stood on his cap for every word of the goodbye).
    { id: 'isao', when: GATHERED, map: 'shionoura', at: [30, 22], dir: 'down' },
    // Fumi lights the lane first (her round), then comes down to the quay.
    { id: 'fumi', when: FESTIVAL, map: 'shionoura', at: [24, 24], dir: 'down' },
    // And sees the boat off from the end of the pier, bowing toward you.
    // (At 22,30, the last plank, the map's edge put her under the words.)
    { id: 'fumi', when: SAILING, map: 'shionoura', at: [22, 29], dir: 'up' },
    // Isao waits at his boat, which is the morning one.
    { id: 'isao', when: SAILING, map: 'shionoura', at: [25, 26], dir: 'left' },
  ],
};
