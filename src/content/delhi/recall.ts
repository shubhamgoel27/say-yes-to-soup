import type { RecallManifest } from '../schema';

/** Kucha Aab-o-Daana's side of the cross-chapter ledger. */
export const RECALL: RecallManifest = {
  consumes: [
    'c6.complete', // Sethji's smell test: the Kerala jetty taught your nose cardamom
    'c6.rain', // Mehr Aapa's vial and Akhtar's storm both recognize a monsoon veteran
    'c6.row.done', // Pilar's election letter salutes seat forty-one; the Master quizzes it
    'c6.sadya.done', // Mariamma's letter remembers your serving hands; mathi echoes in the dance
    'page.words.chetta', // bhaiya/didi lands instantly on a tongue that learned chetta
    'page.customs.headwobble', // Divakaran Master's examination accepts the boat answer
  ],
  plants: [
    'c11.arrived', // earlier task lists hand over once you step off the rickshaw
    'c11.complete',
    'photo.c11.kites', // Chasca's storm-and-kites photograph, paid off in the Return
    'c11.chit.bombay', // Sethji's chit: consumed at c7 arrival, the agent knows his cousin
    'c11.attar.mitti', // the bottled monsoon: one nose, two seasons, met again at the clove mats
    'c11.seva.langar', // the reciprocity bead with the ledger erased; echoed at c9's ledger
    'c11.promise.daulat', // a winter IOU, twice inherited; the Return may honor it with a line
  ],
  backfills: {
    // Never rode the spice jetty? Sethji teaches small-versus-big cardamom himself.
    'c6.complete': 'c11.sethji.lesson',
    // Missed Kerala's first rain? Mehr Aapa waits for Delhi's own and teaches the smell.
    'c6.rain': 'c11.mehr.rain2',
    // Never sat seat forty-one? The Master tells the snake-boat story in his quiz's escape branch.
    'c6.row.done': 'c11.master.fail',
    // Never served the sadya? Kamla teaches the whole refusal dance locally regardless.
    'c6.sadya.done': 'c11.kamla.dance2',
    // No chetta on the tongue? Bantu teaches bhaiya/didi from scratch.
    'page.words.chetta': 'c11.bantu.bhaiya2',
    // No head-wobble page? The Master's escape branch teaches it anyway, boat and all.
    'page.customs.headwobble': 'c11.master.fail',
  },
  rhymes: [
    ['customs.langar', 'customs.ayni'],
    ['customs.seva', 'customs.ayni'],
    ['words.bhaiya', 'words.chetta'],
    ['words.abhi', 'words.ahorita'],
    ['customs.patang', 'customs.tanabata'],
  ],
};
