import type { Cond } from '../schema';
import type { Staging } from '../staging';

/**
 * Delhi's goodbye, on Yusuf's roof: "One plain patang waits on the charkhi
 * ... It climbs over the domes ... West over the roofs it goes, small, then
 * smaller ... Five." The words are a release, so the frame shows one.
 *
 * While the goodbye is due, Yusuf waits at the charkhi itself, mid-terrace,
 * not in the corner by his tank stack where the talk camera pinned the pair
 * against the map's top-left edge. Standing beside him the view has room
 * both sides and the skyline row (the Jama Masjid domes) along its top.
 * The kite leaves your hand on the release's first line and is further along
 * with each line: up on its line over the domes, then loosed, drifting west,
 * small, then smaller, gone by "Five".
 */

/** The goodbye is due: the duel flown, the chit for Bombay in hand. */
const BYE: Cond = { has: ['c11.duel.done', 'c11.chit.bombay'], not: ['c11.complete'] };

/** Beside the charkhi with its plain cotton dor, facing the open terrace. */
export const YUSUF_AT_CHARKHI: [number, number] = [12, 4];

export const STAGING: Staging = {
  blocking: [{ id: 'yusuf', when: BYE, map: 'delhi-rooftop', at: YUSUF_AT_CHARKHI, dir: 'down' }],
  releases: [{ node: 'c11.yusuf.bye2', goals: [0.4, 0.86, 1] }],
};
