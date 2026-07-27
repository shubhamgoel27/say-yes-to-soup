import type { JournalEntry, TaskDef } from '../schema';

/**
 * The last four pages. Nani wrote no entries for the Return; her hand stopped
 * in Sicily. But she wrote margins in 1974, and margins are where rhymes live.
 */

export const RETURN_JOURNAL: JournalEntry[] = [
  {
    id: 'words.elsewhere',
    tab: 'words',
    title: 'Say yes to soup',
    sub: "Her whole instruction, first letter, first line. It took a world to unpack.",
    you: 'Ayni, yapa, deom, pilón, a ledger in a valley. Ten thousand miles to learn her four words were all of it. Say yes to soup. The rest follows.',
    rhyme: {
      with: 'words.haku',
      note: "Haku, the aunties said. Let's go. Nobody warns you the word works in both directions.",
    },
  },
  {
    id: 'customs.home',
    tab: 'customs',
    title: 'Home',
    sub: 'The custom everyone was practicing all along.',
    you: 'Not a place you keep. A place that keeps you: a soup on, a stone warm, a toll waived for staff. I checked everywhere. This was the finding.',
    rhyme: {
      with: 'words.tomakusunchis',
      note: 'Tomakusunchis. Let us drink together. No word here for drinking alone, and none, I now see, for arriving alone either.',
    },
  },
  {
    id: 'people.traveler',
    tab: 'people',
    title: 'A traveler',
    sub: 'New boots, newer journal, pointed the other way.',
    you: "They asked what they should know. I heard Nani's letter come out of my own mouth. That is how the trick works: it is a relay, and the baton is soup.",
  },
  {
    id: 'customs.album',
    tab: 'customs',
    title: 'The album',
    sub: "Chasca's evidence: every traveler, every road, one long face the world makes.",
    you: 'We turned the pages on a rock above La Bajada. My face ages politely through them; the astonishment never does. Somebody kept the evidence. Somebody should.',
  },
];

/**
 * The walk home, thread by thread. All matching tasks show; the first match
 * is the HUD chip, so the chain is ordered pier to well.
 */
export const RETURN_TASKS: TaskDef[] = [
  {
    when: { has: ['c10.arrived'], not: ['c10.marisol.seen'] },
    text: 'La Caleta first: the stall on the malecón. A caserita has been keeping your side of the friendship warm; go collect it.',
  },
  {
    when: { has: ['c10.marisol.seen'], not: ['c10.rosa.seen'] },
    text: "The road up is the same road down, older now: La Bajada, the pass, the east gate. Ch'aska Pampa is at the top, and the flag will be up.",
  },
  {
    when: { has: ['c10.rosa.seen'], not: ['c10.aurelio.seen'] },
    text: 'The letter said the soup is always on. Don Aurelio is at the well, where else. Honor it.',
  },
  {
    when: { has: ['c10.aurelio.seen'], not: ['c10.carmen.seen'] },
    text: 'Doña Carmen will want the wrist first, words after. The band has a journey woven into it now; bring it to the one person who can read it.',
  },
  {
    when: { has: ['c10.carmen.seen'], not: ['c10.pilar.seen'] },
    text: 'The bridge has new signage and its magnate is nine and a half. The museum received a certain parcel from the sea. Attend the exhibit.',
  },
  {
    when: { has: ['c10.pilar.seen'], not: ['c10.album.seen'] },
    text: 'Chasca is back on La Bajada, where she first stopped you. The album is finished, and it starts with you. Sit on the rock.',
  },
  {
    when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen'], not: ['story.end', 'c10.torch'] },
    text: 'Someone new is at the east gate with clean boots, reading the signpost the way you once did. Go and be the one who knows something.',
  },
  {
    when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen'], not: ['story.end'] },
    text: 'One page left. The well, where the water is, where it started. Write the last line; the page was never blank, it was waiting.',
  },
  {
    when: { has: ['c10.arrived'], not: ['story.end'] },
    text: 'Everything between the pier and the well wants to say hello: the picantería, the terraces, the chichería, the pass with a llama in it. Reunion is not an errand; take the long way.',
  },
  {
    when: { has: ['story.end'], not: ['c10.traveler.mail'] },
    text: 'A young traveler at the east gate is holding mail that chased you across an ocean. Collect it before they leave with the first light.',
  },
  {
    when: { has: ['story.end'] },
    text: 'The world stays open. Somewhere south of everything, a letter is waiting to be answered someday.',
  },
];
