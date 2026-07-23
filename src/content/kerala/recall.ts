import type { RecallManifest } from '../schema';

/** Kaithappuram's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'joseph.letter', // THE front door: planted aboard the Yacana (c3), delivered and cleared here
    'page.words.deom', // the thattukada choice recognizes Busan's stall extra
    'wish.written', // Hana's letter variant reacts to the Tanabata tanzaku (c4)
    'pilar.gift.puffer', // Pilar's letter variant remembers the sea thing you mailed (c2)
  ],
  plants: [
    'c6.arrived', // earlier task lists hand over once you are ashore
    'c6.letter.delivered', // the village vouches; later chapters may remember
    'c6.complete',
    'photo.c6.jetty', // Chasca's monsoon photograph, paid off in the Return
    'page.words.chaya', // Zanzibar's chai and Sicily's granita mornings can nod to it
  ],
  backfills: {
    // joseph.letter is an item, not knowledge; it needs no local locksmith.
    // The deom-less branch still teaches the unnamed extra at the stall.
    'page.words.deom': 'c6.shaji.extra',
  },
  rhymes: [
    ['words.chaya', 'dishes.emoliente'],
    ['words.chetta', 'words.causa'],
    ['customs.vallamkali', 'customs.wachaque'],
  ],
};
