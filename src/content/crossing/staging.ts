import type { Cond } from '../schema';
import type { Staging } from '../staging';

/**
 * Three hours of the crossing that its words name out loud.
 *
 * "Noon, on the Line": the bosun's summons says "Tomorrow at noon", so
 * submitting to the court lets a night go by in one dark and wakes you on
 * the foredeck at noon with the court already sitting: Neptune (the bosun,
 * in a mop wig and a bedsheet, a trident of taped boat hooks) by the hatch
 * beams with his bucket and his flour, and the deck round him in a loose
 * ring, Hana down from the bow, Joseph and Olena from their work, Chasca
 * with the camera. "The whole deck cheering" has a deck there to cheer. The
 * court is played as the light comes up; the shellback is raised on its last
 * line, and everyone drifts back to work.
 *
 * "After dinner the karaoke machine is wheeled out": lifting its cover
 * calls the night, the evening passes in one dark, and the mess is full when
 * the light comes back: Joseph at the machine, Olena waiting her turn, Ben
 * out from behind his counter, the bosun and Hana and Chasca along the
 * table. They stay for the song, and are back at their posts the next time
 * you step on deck.
 *
 * "Night folds over the ship": Hana's dark bow is after dark, so the clock
 * runs down into the night while that line is read, and holds it while the
 * stars are being named.
 *
 * Nobody stands within a cell of anybody else, or of the cell the scene
 * lands you on; nobody stands directly below anything tall (it would be
 * drawn across them) or directly in front of a thin tall thing (it would
 * grow out of their head).
 */

/** The night before the court has been let go: it is noon on the Line. */
const COURT_DAY: Cond = { has: ['c3.court.noon'], not: ['c3.shellback'] };
/** The karaoke night, called and not yet sung. */
const KARAOKE: Cond = { has: ['c3.karaoke.night'], not: ['c3.karaoke.done'] };

/** Where the noon court wakes you: below Neptune, facing him across the hatch beams. */
export const COURT_LANDING: [number, number] = [22, 9];
/** Where the karaoke night seats you: between the stools, facing the machine. */
export const KARAOKE_LANDING: [number, number] = [10, 2];

/** The ship's hours keep to the ship. */
const SHIP_MAPS = ['ship', 'galley'];

export const STAGING: Staging = {
  hours: [
    // Noon. Set in the dark the night passes in, so nobody watches it jump.
    { when: COURT_DAY, on: SHIP_MAPS, min: 0.38, max: 0.45, snap: true },
    // After dinner: the mess lit against a dark porthole.
    { when: KARAOKE, on: SHIP_MAPS, min: 0.74, max: 0.8, snap: true },
    { when: { has: ['c3.stars.start'] }, on: SHIP_MAPS, min: 0.82, max: 0.9 },
  ],
  cues: [
    { when: COURT_DAY, map: 'ship', node: 'c3.bosun.court' },
    { when: KARAOKE, map: 'galley', node: 'c3.karaoke' },
  ],
  blocking: [
    // The karaoke first: for one song it outranks anything else on the ship.
    // Beside the machine, not in front of it, so it is not drawn out of his head.
    { id: 'joseph', when: KARAOKE, map: 'galley', at: [12, 2], dir: 'down' },
    { id: 'olena', when: KARAOKE, map: 'galley', at: [14, 5], dir: 'up' },
    { id: 'mangben', when: KARAOKE, map: 'galley', at: [7, 2], dir: 'right' },
    { id: 'bosun', when: KARAOKE, map: 'galley', at: [7, 5], dir: 'right' },
    { id: 'hanaC3', when: KARAOKE, map: 'galley', at: [10, 5], dir: 'up' },
    { id: 'chascaC3', when: KARAOKE, map: 'galley', at: [12, 5], dir: 'up' },
    // The court of Neptune, on the foredeck by the hatch beams.
    {
      id: 'bosun',
      when: COURT_DAY,
      map: 'ship',
      at: [22, 7],
      dir: 'down',
      look: {
        garb: 'wrap',
        cloth: '#efe9dc',
        stripe: '#c9a35f',
        hatStyle: 'none',
        hair: '#d9d2bf',
        hairdo: 'braids',
        prop: 'trident',
      },
    },
    { id: 'hanaC3', when: COURT_DAY, map: 'ship', at: [19, 7], dir: 'right' },
    { id: 'chascaC3', when: COURT_DAY, map: 'ship', at: [25, 7], dir: 'left' },
    { id: 'joseph', when: COURT_DAY, map: 'ship', at: [18, 9], dir: 'right' },
    { id: 'olena', when: COURT_DAY, map: 'ship', at: [26, 9], dir: 'left' },
  ],
};

/** The court's furniture: the bucket of warm sea and the flour, either side of Neptune. */
export const COURT_DRESSING = {
  map: 'ship',
  when: { has: ['c3.court.noon'] } as Cond,
  cells: [
    [21, 7, { t: 'cubeta', solid: true }],
    [23, 7, { t: 'sacos', solid: true }],
  ] as [number, number, { t: string; solid?: boolean }][],
};
