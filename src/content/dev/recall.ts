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
    'story.complete', // the gate flag; the Return gates its scenes on it
    'photo.taken', // Chasca's first photograph, bound for the album
    'her.zoila', // her name, said out loud by a stranger; every later chapter assumes it
    'page.her.chaska', // beat one of the Her thread: the half warp, the note on the post
    'page.dishes.papa', // the highland half of the coast trade story
    'page.words.chaska', // the morning star, bound for the star river
  ],
  backfills: {},
  rhymes: [],
};
