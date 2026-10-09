import type { Staging } from '../staging';

/**
 * La Caleta's one standing direction. Every chip of the chapter that names
 * Marisol says where she is: "the road ends at a fish stall", "at a stall on
 * the malecón". So while the chapter runs she keeps her stall, behind its
 * counter, and the chip is true wherever the player reads it. Left to the
 * village rhythm she drifted two blocks to the evening lamp and the bench,
 * the stall stood empty under the words, and N had to fetch her twice.
 * She still turns to whoever comes to buy.
 */
export const MARISOL_STALL: [number, number] = [27, 20];

export const STAGING: Staging = {
  blocking: [
    { id: 'marisol', when: { has: ['c2.arrived'], not: ['c2.complete'] }, map: 'la-caleta', at: MARISOL_STALL, dir: 'down' },
  ],
};
