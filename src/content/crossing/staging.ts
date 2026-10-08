import type { Cond } from '../schema';
import type { Staging } from '../staging';

/**
 * Two hours of the crossing that its words name out loud.
 *
 * "Noon, on the Line": from the summons ("Tomorrow at noon we cross the
 * Line... Court on the hatch") the day runs on to noon and the deck comes
 * to court, so "the whole deck cheering" has a deck there to cheer: Hana
 * down from the bow, Joseph from his rail, Olena, Chasca with the camera,
 * in a loose half ring round the bosun amidships. The court ends with the
 * shellback (raised on its last line), and everyone drifts back to work.
 *
 * "Night folds over the ship": Hana's dark bow is after dark, so the clock
 * runs down into the night while that line is read, and holds it while the
 * stars are being named.
 *
 * Nobody stands within a cell of anybody else, or of the cells beside the
 * bosun where the player stands to answer the court.
 */

const COURT: Cond = { has: ['c3.wog'], not: ['c3.shellback'] };

export const STAGING: Staging = {
  hours: [
    { when: COURT, min: 0.38, max: 0.45 },
    { when: { has: ['c3.stars.start'] }, min: 0.82, max: 0.9 },
  ],
  blocking: [
    { id: 'bosun', when: COURT, map: 'ship', at: [22, 14], dir: 'down' },
    { id: 'hanaC3', when: COURT, map: 'ship', at: [21, 12], dir: 'down' },
    { id: 'chascaC3', when: COURT, map: 'ship', at: [19, 14], dir: 'right' },
    { id: 'joseph', when: COURT, map: 'ship', at: [25, 14], dir: 'left' },
    { id: 'olena', when: COURT, map: 'ship', at: [27, 14], dir: 'left' },
  ],
};
