import type { RecallManifest } from '../schema';

/**
 * The Return's side of the ledger: it plants almost nothing and harvests
 * everything. Every consumed key is an item or event flag from an earlier
 * chapter, reacted to in a reunion scene; no knowledge backfills are needed
 * because nothing here gates on knowing, only on having done.
 */
export const RECALL: RecallManifest = {
  consumes: [
    'c9.complete', // the arrival gate: the ship home sails after Oaxaca
    'c2.complete', // story spine flag (permitted in Return conds)
    'story.complete', // story spine flag (permitted in Return conds)
    'c9.debt.paid', // Aurelio hears about the ledger: the seed came up
    'pilar.gift.puffer', // the museum's exhibit one, variant by creature
    'pilar.gift.star',
    'pilar.gift.claw',
    'omiyage.pilar', // exhibit two: the museum goes international
    'omiyage.aurelio', // the gift that lands at the well
    'kanga.gift', // the cloth kept for giving, given to Carmen
    'wish.road', // the tanzaku wish, echoed at the well before the last page
    'wish.people',
    'wish.nani',
    'photo.taken', // the album's pages, one per photograph that exists
    'photo.c2.pier',
    'photo.c3.deck',
  ],
  plants: [
    'story.end', // the game's completion flag
    'c10.torch', // the advice passed to the next traveler
  ],
  backfills: {},
  rhymes: [
    ['words.elsewhere', 'words.haku'],
    ['customs.home', 'words.tomakusunchis'],
  ],
};
