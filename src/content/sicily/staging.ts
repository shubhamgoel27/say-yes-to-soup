import type { Cond } from '../schema';
import type { Staging } from '../staging';

/**
 * Sicily's send-off, staged. "Half the town has come down the mole to see
 * you off properly", and Concetta, Alfio, Turi and Don Saro all have lines in
 * it, so they have to be standing on the mole when it is said, and a ship
 * has to be there to be seen off by.
 *
 * The town knows you are leaving before Patanè does: from the end of
 * Concetta's passeggiata (the last thing the ledger waits for) the ship is
 * alongside the mole and the town drifts down to it, "pretending to be
 * passing", so a player walking out to sign finds them already there.
 * They stay through the horn and the gangway, and are still there, arguing,
 * as the ship pulls out.
 *
 * The mole is two rows wide (19 and 20) with a widened end at x 40-42; the
 * row a walker needs stays passable round everyone, and nobody stands
 * within a cell of anybody else (nor of the player's place at Patanè's
 * table, 41,19), so no sprite is drawn over another.
 */

/** The ledger's last condition met: the walk is done, the town is ready. */
const READY = ['c8.pranzo', 'c8.scopa.won', 'c8.pisci.won', 'c8.walk.done'];
const SEEING_OFF: Cond = { has: READY, not: ['c9.arrived'] };
/**
 * Concetta's passeggiata: "The town comes out with you, dressed nicer than
 * the errand requires." From the first step of it the evening comes down
 * to the passeggiata hour and the town is out in the piazza round her.
 */
const WALKING: Cond = { has: ['c8.walking'], not: ['c8.walk.done'] };

/** The ship alongside, its anchor cell (the sprite stands three rows tall above it, below the mole). */
// One row clear of the mole's stone face (row 21), so the hull lies alongside it.
export const SHIP_AT: [number, number] = [37, 24];

/** Where the player stands to sign out: west of Patanè's table. */
export const SIGNING_SPOT: [number, number] = [41, 19];

export const STAGING: Staging = {
  hours: [
    // The passeggiata hour (the bar lamp comes on first), and the send-off
    // kept in it: the town walks down to the mole in its evening clothes.
    { when: WALKING, min: 0.585, max: 0.6 },
    { when: SEEING_OFF, min: 0.585, max: 0.62 },
  ],
  blocking: [
    // Out in the piazza for the walk, between Concetta's door and the chair
    // she takes at golden hour, so they are round her wherever she is.
    { id: 'donsaro', when: WALKING, map: 'sicily', at: [24, 13], dir: 'left' },
    { id: 'alfio', when: WALKING, map: 'sicily', at: [16, 12], dir: 'right' },
    { id: 'turi', when: WALKING, map: 'sicily', at: [24, 10], dir: 'left' },
    { id: 'rosaria', when: WALKING, map: 'sicily', at: [19, 11], dir: 'up' },
    { id: 'nino', when: WALKING, map: 'sicily', at: [22, 12], dir: 'up' },
    // Then down the mole to see you off.
    // Nearest the gangway, with the parcel.
    { id: 'concetta', when: SEEING_OFF, map: 'sicily', at: [40, 21], dir: 'up' },
    { id: 'alfio', when: SEEING_OFF, map: 'sicily', at: [36, 20], dir: 'right' },
    { id: 'turi', when: SEEING_OFF, map: 'sicily', at: [34, 19], dir: 'right' },
    // Trying to bless it from the root of the mole, unheard.
    { id: 'donsaro', when: SEEING_OFF, map: 'sicily', at: [32, 20], dir: 'right' },
    { id: 'rosaria', when: SEEING_OFF, map: 'sicily', at: [30, 21], dir: 'right' },
  ],
};

/** The ship, alongside, from the town's readiness on (a dressing in index.ts). */
export const SHIP_DRESSING = {
  map: 'sicily',
  when: { has: READY } as Cond,
  cells: [
    // The rowing boat that was moored here makes room for her.
    [38, 22, null],
    [SHIP_AT[0], SHIP_AT[1], { t: 'nave', solid: true, tall: true }],
  ] as [number, number, { t: string; solid?: boolean; tall?: boolean } | null][],
};
