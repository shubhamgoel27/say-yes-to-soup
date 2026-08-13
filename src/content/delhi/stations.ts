import type { EventNode, NodeMap } from '../schema';
import type { StationDef } from '../../main';

/**
 * Delhi's scheduled custom: the langar meal. Every evening, in the band of
 * the day the rest of the world spends finding benches, the kucha files into
 * Sis Ganj's hall and sits in pangat rows on the striped matting: the kid,
 * the retired teachers, the chai-wallah who spent all day serving everyone
 * else. The engine derives the walking, the doors, and the sitting at boot
 * (src/main.ts, "customs on schedule"); this file only declares the custom.
 *
 * The insight is spatial, not spoken: everyone eats at one level, and a
 * traveler who sits down into the row learns it with their knees.
 */
export const DELHI_STATIONS: StationDef[] = [
  {
    id: 'langar-pangat',
    map: 'delhi-langar',
    mode: 'gather',
    // Golden hour into early dark: the evening pangat.
    window: [0.28, 0.62],
    // One body per stop, spread along the hall's three uneven rows,
    // all facing the aisle the dal comes down.
    cells: [
      { at: [5, 4], dir: 'down' },
      { at: [9, 4], dir: 'down' },
      { at: [7, 6], dir: 'down' },
      { at: [12, 6], dir: 'down' },
      { at: [6, 8], dir: 'down' },
    ],
    // Kamla stays at her tawa and Sethji at his gaddi; the lane's walkers
    // come. Joginder is already home here, serving, and never sits.
    actors: ['bantu', 'mehr', 'sushila', 'akhtar', 'librarianC11'],
    grant: { node: 'c11.ev.pangat', flag: 'c11.pangat.sat', min: 2 },
  },
];

/**
 * Effects-only beat, applied silently when the traveler sits into the row at
 * mealtime. The langar page may already be filled from meeting Joginder;
 * `journal:` grants are exactly-once by design, so the two paths coexist and
 * the page fills the first time either happens. The flag one-shots the beat.
 */
export const DELHI_STATION_NODES: NodeMap = {
  'c11.ev.pangat': {
    // Never opened as dialogue; the sitting itself is the sentence.
    lines: [{ text: 'Everyone eats at one level. Your knees understood before you did.' }],
    effects: ['set:c11.pangat.sat', 'journal:customs.langar'],
  },
};

/** Listed so the reachability walker can prove the pangat beat earnable. */
export const DELHI_STATION_EVENTS: EventNode[] = [
  { when: { has: ['c11.arrived'], not: ['c11.pangat.sat'] }, node: 'c11.ev.pangat' },
];
