import type { RecallManifest } from '../schema';

/** La Caleta's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'page.customs.ayni', // the yapa scene lets you name the rhyme yourself
    'page.dishes.mote', // Marisol's choclo talk recognizes the highland corn
    'page.dishes.papa', // Don Simón's trade story lights up if you ate them
    'keepsake.band', // Nilda spots Carmen's pallay at your wrist
    'pilar.sea', // the tidepool gift, chosen here, paid off in her letters
  ],
  plants: [
    'c2.arrived', // the highlands' task list hands over once you are down
    'page.words.yapa',
    'page.words.lamar',
    'c2.casero',
    'photo.c2.pier',
    'pilar.gift.puffer',
    'pilar.gift.star',
    'pilar.gift.claw',
    'c2.gift.sent',
  ],
  backfills: {
    // Knowledge keys have local locksmiths: the no-key branch teaches it anyway.
    'page.dishes.papa': 'mar.simon.tells',
    'page.dishes.mote': 'mar.marisol.cancha',
    'page.customs.ayni': 'mar.marisol.thanks',
  },
  rhymes: [
    ['words.yapa', 'customs.ayni'],
    ['words.choclo', 'dishes.mote'],
  ],
};
