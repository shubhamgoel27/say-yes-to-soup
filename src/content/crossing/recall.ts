import type { RecallManifest } from '../schema';

/** The Yacana's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'pilar.gift.puffer', // the mail bundle names the actual creature sent
    'pilar.gift.star',
    'pilar.gift.claw',
    'c2.casero', // crew respect: "Marisol's casero, good enough for my galley"
    'c2.complete', // the pier sign in La Caleta becomes the gangway
    'page.words.lamar', // Ríos and Simón's word; recognized aboard if learned
  ],
  plants: [
    'c3.arrived', // the coastal task list hands over once you sail
    'joseph.letter', // Chapter Six's front door, entrusted mid-Pacific
    'photo.c3.deck', // Chasca's photo: the middle of everything
    'c3.shellback', // a shellback outranks a pollywog forever
    'c3.olena.bread', // you fed the starter; Olena's shore leave remembers it
    'c3.complete',
    'page.customs.starriver', // rhymes forward into Tanabata
  ],
  backfills: {
    // No page.words.lamar? Ríos teaches la mar herself, barnacles and all.
    'page.words.lamar': 'c3.rios.lamar',
  },
  rhymes: [
    ['customs.starriver', 'words.chaska'],
    ['dishes.sinigang', 'dishes.sudado'],
  ],
};
