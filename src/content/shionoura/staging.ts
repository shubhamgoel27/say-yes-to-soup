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

/**
 * Where the morning sets you down: the sea end of the pier, beside the boat,
 * with Fumi up the planks behind you facing it. (At the pier's root, with
 * Fumi out at its end facing you, she was drawn from behind all goodbye.)
 */
export const PIER_LANDING: [number, number] = [22, 29];

/** Where the launch lies alongside the pier's sea end, west of the planks
 * (Isao's fishing boat, moored by the art pass, has the east side). */
export const LAUNCH_AT: [number, number] = [19, 29];

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

/**
 * Fumi's dinner: "A low table, a fish grilled whole, pickles the color of
 * stained glass. She puts her palms together." Until it is eaten she keeps
 * her place at the hall's low table, kneeling on its north side facing the
 * room, two places laid; the talk kneels you beside her at the other, so
 * both faces and both fish are in the frame. (Both used to stand beside a
 * table of generic bowls; sat across from her, your head hid the fish.)
 */
// Never into the evening: the town cannot be READY (goldfish bagged) and
// still at dinner, so her lamp round and the festival always have her.
const DINNER: Cond = { has: ['met.fumi'], not: ['c4.meal', 'c4.kingyo.done', 'c4.complete'] };
export const FUMI_AT_TABLE: [number, number] = [6, 5];
export const GUEST_AT_TABLE: [number, number] = [5, 5];
export const DINNER_DRESSING = {
  map: 'minshuku',
  when: DINNER,
  cells: [
    [5, 6, { t: 'mealtable', solid: true }],
    [6, 6, { t: 'mealtable', solid: true }],
  ] as [number, number, { t: string; solid?: boolean }][],
};
/** And cleared: "When the bowls are empty". */
export const DINNER_CLEARED = {
  map: 'minshuku',
  when: { has: ['c4.meal'] } as Cond,
  cells: [
    [5, 6, { t: 'table', solid: true }],
    [6, 6, { t: 'table', solid: true }],
  ] as [number, number, { t: string; solid?: boolean }][],
};
/** The town's hours keep to the town (Busan has its own dawn). */
const TOWN = ['shionoura', 'minshuku'];

export const STAGING: Staging = {
  seats: [
    {
      nodes: ['c4.fumi.meal', 'c4.fumi.meal.say', 'c4.fumi.meal.copy', 'c4.fumi.meal2'],
      map: 'minshuku',
      at: GUEST_AT_TABLE,
      dir: 'down',
    },
  ],
  vessels: [
    // "The launch noses in past a stone lantern": alongside as the light
    // comes up, then off west across the glass-flat water.
    { kind: 'boatLaunch', map: 'shionoura', at: LAUNCH_AT, away: 'left', when: { not: ['c4.arrived'] }, node: 'c4.arrive' },
  ],
  hours: [
    // Down to dusk while the town gathers: just past the chochin waking
    // (nightLevel 0.3), where the sky still has its ember in it and the
    // lamp round runs; held well short of the dark that sends people home.
    { when: EVENING, on: TOWN, min: 0.585, max: 0.605 },
    // The festival keeps that hour, lanterns lit, until you go.
    { when: FESTIVAL, on: TOWN, min: 0.585, max: 0.615 },
    // "The tairyō-bata crack once in the morning wind": Isao's boat is the
    // morning one. Set in the dark the night passes in, never in view.
    { when: SAILING, on: TOWN, min: 0.12, max: 0.2, snap: true },
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
    // Hana faces the water and the sky over it; the town waiting with her
    // is in twos, talking, not a row facing the camera.
    { id: 'hana', when: GATHERED, map: 'shionoura', at: [22, 21], dir: 'down' },
    // Chasca shows Sachiko the back of her camera.
    { id: 'sachiko', when: GATHERED, map: 'shionoura', at: [17, 21], dir: 'right' },
    { id: 'chascaC4', when: GATHERED, map: 'shionoura', at: [19, 21], dir: 'left' },
    // "Bellowing prices for things he is giving away", down the quay.
    { id: 'daisuke', when: GATHERED, map: 'shionoura', at: [16, 23], dir: 'down' },
    // Taro still arguing the one-strip system with Genji.
    { id: 'genji', when: GATHERED, map: 'shionoura', at: [29, 23], dir: 'right' },
    { id: 'taro', when: GATHERED, map: 'shionoura', at: [31, 23], dir: 'left' },
    // Past the pillar box (at 31,22 it stood on his cap), watching the
    // water he will cross in the morning.
    { id: 'isao', when: GATHERED, map: 'shionoura', at: [33, 23], dir: 'down' },
    // Fumi lights the lane first (her round), then comes down to the quay.
    { id: 'fumi', when: FESTIVAL, map: 'shionoura', at: [24, 24], dir: 'down' },
    // And sees the boat off from the pier, bowing toward it and you, her
    // face to the boat (south), which is to say to us.
    { id: 'fumi', when: SAILING, map: 'shionoura', at: [21, 27], dir: 'down', busy: true },
    // At home before all that, at the low table until the meal is eaten.
    { id: 'fumi', when: DINNER, map: 'minshuku', at: FUMI_AT_TABLE, dir: 'down', sit: true },
    // Isao waits at his boat, which is the morning one.
    { id: 'isao', when: SAILING, map: 'shionoura', at: [25, 26], dir: 'left' },
  ],
};
