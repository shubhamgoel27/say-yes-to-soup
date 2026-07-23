import type { RecallManifest } from '../schema';

/** Sicily's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'page.customs.sanpedrito', // Don Saro's rite scene lets you name the twin saint yourself
    'page.words.polepole', // the passeggiata recognizes Zanzibar's pace
    'keepsake.band', // Concetta reads the woven band at the Sunday table
    'pilar.gift.puffer', // Pilar's letter reacts to the museum's weirdest exhibit
  ],
  plants: [
    'c8.arrived',
    'c8.complete',
    'photo.c8.stones', // Chasca at the faraglioni, for the album in the Return
    'page.customs.upisci', // the saint who goes to sea; the Return's rhymes reach back here
    'page.customs.passeggiata', // the walk with no goal, learned properly
  ],
  backfills: {
    // Knowledge keys have local locksmiths: the no-key branch teaches it anyway.
    'page.customs.sanpedrito': 'c8.saro.rite',
    'page.words.polepole': 'c8.walk.nowhere',
  },
  rhymes: [
    ['words.amuntagna', 'words.lamar'],
    ['customs.upisci', 'customs.sanpedrito'],
  ],
};
