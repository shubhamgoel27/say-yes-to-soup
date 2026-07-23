import type { RecallManifest } from '../schema';

/** Busan's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'joseph.letter', // the berth to Kochi runs through Joseph's cousin; the letter is referenced, never spent
    'page.words.yapa', // the deom scene lets you name the rhyme yourself
    'page.customs.ayni', // Cho's riddle brightens if you carry the mountain word
    'photo.c2.pier', // Chasca remembers the pier photograph
    'c2.casero', // Marisol's letter knows whether you were her regular
    'c2.gift.sent', // Pilar's letter knows the sea thing arrived
  ],
  plants: [
    'c5.arrived',
    'c5.deom',
    'riddle.cho', // carried until the guelaguetza ledger in Oaxaca answers it
    'photo.c5.alley',
    'c5.complete',
    'page.words.deom',
    'page.words.jeong',
  ],
  backfills: {
    // Knowledge keys have local locksmiths: the no-key branch teaches it anyway.
    'page.words.yapa': 'c5.sunhee.deomword',
    'page.customs.ayni': 'c5.cho.listen',
  },
  rhymes: [
    ['words.deom', 'words.yapa'],
    ['words.jeong', 'customs.ayni'],
  ],
};
