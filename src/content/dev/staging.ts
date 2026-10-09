import type { Cond } from '../schema';
import type { Staging } from '../staging';

/**
 * Ch'aska Pampa's stage directions: the first hour's words put people in
 * places ("Sit with him at the well", "pats the stool beside his", her
 * loom), and these marks keep the frame to them.
 *
 * Don Aurelio's decision: the chip says to sit with him at the well, so
 * while it does he is sat on the well's front lip, its posts behind him and
 * room on the stone either side. Coming up from the plaza you settle beside
 * him on that row, and the two of you are at the well, not stacked over it.
 * (His own spot, a step up and left, is diagonal to the well: a talk there
 * once walked him round onto the cell above it, the posts through his poncho.)
 *
 * Doña Carmen weaves: by day, all chapter, she is sat at the free end of her
 * backstrap loom, where its art leaves the strap open on the ground, facing
 * the stake. Wandering, she once left the strap to whoever ambled into it,
 * and a neighbour stood in the loom wearing it while she stood behind.
 */

/** Aurelio has decided, and the letter is still in his poncho. */
const DECIDED: Cond = {
  has: ['bundle.delivered', 'challar.done', 'pallay.done', 'her.zoila'],
  not: ['nani.letter'],
};

/** On the well's lip, in front of its posts. */
export const AURELIO_AT_WELL: [number, number] = [22, 15];

export const STAGING: Staging = {
  blocking: [
    { id: 'aurelio', when: DECIDED, map: 'village', at: AURELIO_AT_WELL, dir: 'down', sit: true },
    // At her loom, the Return's own mark; she still turns to whoever talks
    // to her (in the Return she does not look up, and that is later).
    // The errand that stands her up to take the pick back comes first
    // (../return/staging.ts), and the Return stages her from its arrival on.
    { id: 'carmen', when: { not: ['c10.arrived'] }, map: 'village', at: [30, 12], dir: 'right', sit: true, busy: false },
  ],
};
