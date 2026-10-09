import type { Cond } from '../schema';
import type { Staging } from '../staging';

/**
 * Kaithappuram's goodbye, staged. "Mariamma packs food for four days and
 * advice for forty. The little umbrella waves until the boat turns." So
 * from her blessing (the chapter's last word) until you are gone, she has
 * come down to the jetty with the food and with Joseph's little umbrella
 * from Japan, Joseph beside her for once on land, and the Kochi boat lies
 * off the jetty waiting for you. Moosa keeps his office at the jetty's
 * root, where you buy the ticket; the goodbye is read from there, with all
 * of them in the frame.
 *
 * Chasca keeps the jetty's far end with her black umbrella. Everyone
 * stands two cells clear of everyone else and of the place beside Moosa
 * where you stand to buy the ticket, and nobody under anything tall.
 */

/** From the blessing until the train has you. */
const SEEING_OFF: Cond = { has: ['c6.complete'], not: ['c11.arrived'] };

/** Where you stand to buy the ticket: west of Moosa at the jetty's root. */
export const TICKET_SPOT: [number, number] = [23, 23];

export const STAGING: Staging = {
  // "A chugging boat from Kochi leaves you on a jetty one handcart wide":
  // the art pass moors it off the jetty's end (map.ts, 19,29); it lies there
  // as the light comes up, and once the words have set you down it chugs
  // off west down the channel and is gone.
  vessels: [{ kind: 'boatKerala', map: 'kerala', at: [19, 29], away: 'left', when: { not: ['c6.arrived'] }, node: 'c6.arrive', leaves: true }],
  blocking: [
    // On the bank above the jetty's root, so that while the ticket is bought
    // below them they turn to you face on (on the planks they showed their
    // backs to the whole goodbye).
    { id: 'mariamma', when: SEEING_OFF, map: 'kerala', at: [22, 21], dir: 'down', look: { prop: 'umbrella' } },
    { id: 'josephC6', when: SEEING_OFF, map: 'kerala', at: [20, 22], dir: 'right' },
  ],
};

/** The Kochi boat, off the end of the jetty, from the blessing on. */
export const BOAT_DRESSING = {
  map: 'kerala',
  when: { has: ['c6.complete'] } as Cond,
  cells: [[26, 26, { t: 'kettuvallam', solid: true, tall: true }]] as [
    number,
    number,
    { t: string; solid?: boolean; tall?: boolean },
  ][],
};
