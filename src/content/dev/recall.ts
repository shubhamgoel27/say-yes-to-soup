import type { RecallManifest } from '../schema';

/**
 * Chapter One's side of the cross-chapter ledger. The first chapter consumes
 * nothing; everything here is seed corn for the road ahead.
 */
export const RECALL: RecallManifest = {
  consumes: [],
  plants: [
    'page.customs.ayni', // reciprocity; rhymes with the coast's yapa
    'page.words.chaska', // the morning star; rhymes with the star river at sea
    'page.dishes.mote', // highland corn; the coast eats choclo from the same valleys
    'keepsake.band', // Carmen's practice-row band, tied at your wrist
    'pilar.sea', // Pilar's standing order: something weird, from the sea
  ],
  backfills: {},
  rhymes: [],
};
