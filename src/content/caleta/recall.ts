import type { RecallManifest } from '../schema';

/** La Caleta's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'page.customs.ayni', // the yapa scene lets you name the rhyme yourself
    'page.dishes.mote', // Marisol's choclo talk recognizes the highland corn
    'page.dishes.papa', // Don Simón's trade story lights up if you ate them
    'keepsake.band', // Nilda spots Carmen's pallay at your wrist
    'pilar.sea', // the tidepool gift, chosen here, paid off in her letters
    'page.customs.apacheta', // Faustino's quiz: the stone you left at the pass
    'page.people.faustino', // Faustino's quiz: Paca and the one whistle
  ],
  plants: [
    'c2.arrived', // the highlands' task list hands over once you are down
    'c2.complete', // later chapters gate their entry hooks on it
    'page.words.yapa',
    'page.words.lamar',
    'c2.casero',
    'photo.c2.pier',
    'pilar.gift.puffer',
    'pilar.gift.star',
    'pilar.gift.claw',
    'c2.gift.sent',
    'c2.cook.done', // the galley hand who can build a noon; the Crossing knows
  ],
  backfills: {
    // Knowledge keys have local locksmiths: the no-key branch teaches it anyway.
    'page.dishes.papa': 'mar.simon.tells',
    'page.dishes.mote': 'mar.marisol.cancha',
    'page.customs.ayni': 'mar.marisol.thanks',
    'page.customs.apacheta': 'mar.faustino.blur',
    'page.people.faustino': 'mar.faustino.blur',
  },
  rhymes: [
    ['words.yapa', 'customs.ayni'],
    ['words.choclo', 'dishes.mote'],
  ],
};
