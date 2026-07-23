import type { RecallManifest } from '../schema';

/** Shionoura's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'page.customs.starriver', // the Amanogawa scenes let you name the two rivers yourself
    'photo.c3.deck', // Chasca compares her star photo to the lantern light
    'page.words.lamar', // Captain Isao recognizes the sea spoken of as a person
    'c2.casero', // Daisuke salutes a fellow fishmonger's regular; Marisol's letter too
    'c2.gift.sent', // Pilar's museum letter reacts to the weird sea thing you mailed
  ],
  plants: [
    'c4.arrived', // the crossing's task list hands over once you are ashore
    'c4.complete',
    'omiyage.petro', // chosen gifts; chapters 9 and 10 hand them over
    'omiyage.pilar',
    'omiyage.aurelio',
    'wish.road', // the tanzaku wish; the Return reads whichever one you wrote
    'wish.people',
    'wish.nani',
    'wish.written', // the umbrella flag: a wish exists, whichever it was
    'photo.c4.noren', // Chasca's album, one frame per chapter
    'page.customs.tanabata',
    'page.words.otsukaresama',
  ],
  backfills: {
    // Knowledge keys have local locksmiths: the no-key branch teaches it anyway.
    'page.customs.starriver': 'c4.genji.amanogawa',
    'page.words.lamar': 'c4.isao.umi',
  },
  rhymes: [
    ['customs.tanabata', 'customs.starriver'],
    ['words.otsukaresama', 'customs.espera'],
  ],
};
