import type { RecallManifest } from '../schema';

/** The valley's side of the cross-chapter ledger. The chain closes here. */
export const RECALL: RecallManifest = {
  consumes: [
    'keepsake.band', // Elías recognizes the cochineal at your wrist
    'riddle.cho', // Old Man Cho's question is answered at the ledger
    'omiyage.petro', // an unposted gift becomes an ofrenda item
    'omiyage.pilar',
    'omiyage.aurelio',
    'kanga.gift', // the one meant for giving finds its person
    'wish.road', // the tanzaku wish, refolded onto the altar
    'wish.people',
    'wish.nani',
  ],
  plants: [
    'c9.arrived',
    'c9.debt.paid', // the ledger line, closed; the Return reacts
    'c9.riddle.answered', // for Cho's echo, if the Return wants it
    'c9.complete',
    'photo.c9.field', // Chasca's last frame: the marigold field
    'page.words.guelaguetza', // the chain's final name, learnable nowhere else
  ],
  backfills: {
    // Item flags need no locksmith; the one knowledge key gets a local teacher:
    // Refugio explains what a guelaguetza is even if Cho never asked you anything.
    'riddle.cho': 'c9.refugio.chain',
  },
  rhymes: [
    ['words.guelaguetza', 'customs.ayni'],
    ['words.ahorita', 'words.altoque'],
    ['customs.pilon', 'words.deom'],
    ['customs.grana', 'words.lliclla'],
  ],
};
