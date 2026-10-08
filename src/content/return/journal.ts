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
    id: 'her.return',
    tab: 'her',
    title: 'What the well decided',
    sub: 'Half the village around one jug at dusk, and Doña Carmen with the last word, unsoftened.',
    you: 'Not a pardon: she still left the wrong way and this village will keep saying so. Then Carmen and I walked up in the last light and I laid the stone she never got to lay.',
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
    // "First" only while the pier is still underfoot: walk past her stall
    // and the chip must not keep sending you downhill once you are home,
    // least of all through the evening at the well.
    when: { has: ['c10.arrived'], not: ['c10.marisol.seen', 'c10.rosa.seen', 'c10.well.called'] },
    text: 'La Caleta first: the stall on the malecón. A caserita has been keeping your side of the friendship warm; go collect it.',
    who: 'marisol',
  },
  {
    // On the way up, not after: La Bajada is the first map above the pier,
    // so the album is opened on the climb and the climb happens once.
    when: { has: ['c10.marisol.seen'], not: ['c10.album.seen', 'c10.rosa.seen'] },
    text: 'Chasca is back on La Bajada, on the road where she first stopped you. The album is finished, and it starts with you. Sit on the rock before the climb.',
    who: 'chasca',
  },
  {
    when: { has: ['c10.marisol.seen'], not: ['c10.rosa.seen'] },
    text: "The road up is the same road down, older now: La Bajada, the pass, the gate. Ch'aska Pampa is at the top, and the flag will be up.",
    who: 'rosa',
  },
  {
    when: { has: ['c10.rosa.seen'], not: ['c10.aurelio.seen'] },
    text: 'The letter said the soup is always on. Don Aurelio is at the well, where else. Honor it.',
    who: 'aurelio',
  },
  {
    when: { has: ['c10.aurelio.seen'], not: ['c10.carmen.seen'] },
    text: 'Doña Carmen will want the wrist first, words after. The band has a journey woven into it now; bring it to the one person who can read it.',
    who: 'carmen',
  },
  {
    when: { has: ['c10.carmen.seen', 'c2.gift.sent'], not: ['c10.pilar.seen'] },
    text: 'The bridge has new signage and its magnate is nine and a half. The museum received a certain parcel from the sea. Attend the exhibit.',
    who: 'pilar',
  },
  {
    when: { has: ['c10.carmen.seen'], not: ['c10.pilar.seen', 'c2.gift.sent'] },
    text: 'The bridge has new signage and its magnate is nine and a half. She keeps a list of everyone who owes her something. Go and settle up.',
    who: 'pilar',
  },
  {
    // Only for a walker who climbed past her: the evening waits on the album.
    when: { has: ['c10.pilar.seen'], not: ['c10.album.seen'] },
    text: 'Chasca is still on La Bajada, where she first stopped you. The album is finished, and the evening waits on it. Go down and sit on the rock.',
    who: 'chasca',
  },
  {
    when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.carmen.seen', 'c10.pilar.seen'], not: ['c10.well.called'] },
    text: 'Something is being arranged for tonight, and the whole village is pretending it is not. Doña Carmen will say what. She is at her loom.',
    who: 'carmen',
  },
  {
    when: { has: ['c10.well.called'], not: ['c10.carmen.her'] },
    text: 'Dusk at the well. Half the village is round one jug, and the subject is your grandmother. Doña Carmen has the floor.',
    who: 'carmen',
  },
  {
    when: { has: ['c10.carmen.her'], not: ['c10.apacheta.done'] },
    text: "Carmen's river stone is in your hand. The apacheta is just past the east gate, on the pass road. She walks slowly; walk with her.",
    // The cairn itself: Space on it is where the stone goes down.
    at: ['east-road', 14, 5],
  },
  {
    when: { has: ['c10.apacheta.done'], not: ['story.end'] },
    text: 'One page left. The lamps are lit at the well, where the water is, where it started.',
    at: ['village', 21, 15],
  },
  {
    // Before the evening starts; after the last page the same face is still
    // at the signpost, and the post-end arm below finds them again.
    when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen'], not: ['story.end', 'c10.torch', 'c10.well.called'] },
    text: 'Someone new is at the gate with clean boots, reading the signpost the way you once did. Go and be the one who knows something.',
    who: 'traveler',
  },
  {
    when: { has: ['story.end'], not: ['c10.torch'] },
    text: 'Someone new is still at the gate with clean boots, reading the signpost the way you once did. Go and be the one who knows something.',
    who: 'traveler',
  },
  {
    when: { has: ['c10.arrived'], not: ['story.end'] },
    text: 'Everything between the pier and the well wants to say hello: the picantería, the terraces, the chichería, the pass with a llama in it. Reunion is not an errand; take the long way.',
  },
  {
    when: { has: ['story.end'], not: ['c10.traveler.mail'] },
    text: 'A young traveler at the signboard on the pass road is holding mail that chased you across an ocean. Collect it before they leave with the first light.',
    who: 'traveler',
  },
  {
    when: { has: ['story.end'] },
    text: 'The world stays open. Somewhere south of everything, a letter is waiting to be answered someday.',
  },
];
