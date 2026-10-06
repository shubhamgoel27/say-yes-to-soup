import type { EventNode, ExamineArm, NodeMap, NpcDef, NpcExtension } from '../schema';

/**
 * Chapter Ten: the Return. No new maps, almost no new people. The whole
 * chapter is the old cast turning around when the door opens. Rules
 * unchanged since the first well: two short sentences, nobody lectures,
 * the warm branch is the right branch, and everyone sounds like themselves.
 */

export const RETURN_NPCS: NpcDef[] = [
  {
    // The one new face: a young traveler at the east gate, pointed outward.
    // She stands beside the signboard, not in the road: the way out stays
    // clear across all three lanes, and she is still an easy hello.
    id: 'traveler',
    name: 'A Traveler',
    map: 'east-road',
    pos: [48, 4],
    range: 0,
    look: {
      skin: '#c98f5f',
      hair: '#241a12',
      cloth: '#4a6e5c',
      stripe: '#f2e6d0',
      hat: '#c9a35f',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c10.arrived'] }, node: 'c10.traveler.pre' },
      // The torch passes before anything else this traveler has to offer.
      // It used to sit below the story.end arms, which meant the natural
      // play order (well, last page, east gate) shadowed it forever: the
      // scene never happened and its journal page could never be filled,
      // while the game still announced that the journal was full.
      { when: { has: ['c10.arrived'], not: ['c10.torch'] }, node: 'c10.traveler.first' },
      { when: { has: ['story.end'], not: ['c10.traveler.mail'] }, node: 'c10.traveler.mail' },
      { when: { has: ['story.end'] }, node: 'c10.traveler.after' },
      { node: 'c10.traveler.idle' },
    ],
  },
];

/** The whole village turns around. Prepended ahead of each NPC's own chain. */
export const RETURN_EXTENSIONS: NpcExtension[] = [
  // ---- La Caleta, where the ship puts you down ----
  {
    npcId: 'marisol',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.marisol.seen'] }, node: 'c10.marisol.reunion' }],
  },
  {
    npcId: 'simon',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.simon.seen'] }, node: 'c10.simon.reunion' }],
  },
  {
    npcId: 'petro',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.petro.seen'] }, node: 'c10.petro.reunion' }],
  },
  {
    npcId: 'nilda',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.nilda.seen'] }, node: 'c10.nilda.reunion' }],
  },
  {
    npcId: 'rafa',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.rafa.seen'] }, node: 'c10.rafa.reunion' }],
  },
  {
    npcId: 'felix',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.felix.seen'] }, node: 'c10.felix.reunion' }],
  },
  // ---- the road up ----
  {
    npcId: 'chasca',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.chasca.seen'] }, node: 'c10.chasca.reunion' },
      { when: { has: ['c10.chasca.seen'], not: ['c10.album.seen'] }, node: 'c10.chasca.offer' },
      { when: { has: ['c10.album.seen'] }, node: 'c10.chasca.after' },
    ],
  },
  {
    npcId: 'faustino',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.faustino.seen'] }, node: 'c10.faustino.reunion' },
      // Post-end epilogue arms sit above the chapter-one chains, which would
      // otherwise replay their stranger-era first meetings after story.end.
      { when: { has: ['story.end'] }, node: 'c10.faustino.post' },
    ],
  },
  {
    npcId: 'paca',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.paca.seen'] }, node: 'c10.paca.reunion' },
      { when: { has: ['story.end'] }, node: 'c10.paca.post' },
    ],
  },
  // ---- Ch'aska Pampa ----
  {
    npcId: 'rosa',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.rosa.seen'] }, node: 'c10.rosa.reunion' },
      { when: { has: ['story.end'] }, node: 'c10.rosa.post' },
    ],
  },
  {
    npcId: 'aurelio',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.aurelio.seen'] }, node: 'c10.aurelio.reunion' },
      { when: { has: ['c10.aurelio.seen'] }, node: 'c10.aurelio.after' },
    ],
  },
  {
    npcId: 'carmen',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.carmen.seen'] }, node: 'c10.carmen.reunion' },
      // Beat eleven of the Her thread, and late on purpose: the village can
      // only decide this after the whole road has been walked back to it.
      // Told in two visits: the grievance first, then, once her row is
      // closed, the verdict and the stone.
      { when: { has: ['c10.carmen.told'], not: ['c10.carmen.her'] }, node: 'c10.carmen.stone' },
      {
        when: { has: ['c10.carmen.seen', 'c10.aurelio.seen', 'c10.album.seen'], not: ['c10.carmen.her', 'c10.carmen.told'] },
        node: 'c10.carmen.decided',
      },
      { when: { has: ['story.end'] }, node: 'c10.carmen.post' },
    ],
  },
  {
    npcId: 'justina',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.justina.seen'] }, node: 'c10.justina.reunion' },
      { when: { has: ['story.end'] }, node: 'c10.justina.post' },
    ],
  },
  {
    npcId: 'mateo',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.mateo.seen'] }, node: 'c10.mateo.reunion' },
      { when: { has: ['story.end'] }, node: 'c10.mateo.post' },
    ],
  },
  {
    npcId: 'teofilo',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.teofilo.seen'] }, node: 'c10.teofilo.reunion' },
      { when: { has: ['story.end'] }, node: 'c10.teofilo.post' },
    ],
  },
  {
    npcId: 'allqu',
    entry: [
      { when: { has: ['c10.arrived'], not: ['c10.allqu.seen'] }, node: 'c10.allqu.reunion' },
      { when: { has: ['story.end'] }, node: 'c10.allqu.post' },
    ],
  },
  {
    npcId: 'pilar',
    entry: [
      { when: { has: ['c10.arrived', 'pilar.gift.puffer'], not: ['c10.pilar.seen'] }, node: 'c10.pilar.puffer' },
      { when: { has: ['c10.arrived', 'pilar.gift.star'], not: ['c10.pilar.seen'] }, node: 'c10.pilar.star' },
      { when: { has: ['c10.arrived', 'pilar.gift.claw'], not: ['c10.pilar.seen'] }, node: 'c10.pilar.claw' },
      { when: { has: ['c10.arrived'], not: ['c10.pilar.seen'] }, node: 'c10.pilar.plain' },
      { when: { has: ['c10.pilar.seen'] }, node: 'c10.pilar.after' },
    ],
  },
];

export const RETURN_NODES: NodeMap = {
  // ---------------- arrival: the ship docks ----------------
  'c10.arrive': {
    lines: [
      { text: 'The ship noses in past the pier and La Caleta assembles itself out of the garúa: salt, fish scale, something frying.' },
      { text: 'The road up is the same road down, older now. So are you. Everything between here and home wants to say hello first.' },
    ],
    effects: ['set:c10.arrived', 'journal:words.elsewhere'],
  },

  // ---------------- Marisol, casero forever ----------------
  'c10.marisol.reunion': {
    lines: [
      { who: 'Marisol', text: 'CASERO! Off the boat and straight to my stall, as is correct, pe.' },
      { who: 'Marisol', text: 'Lisa today. Humble fish. Some things the world does not dare change.' },
      { text: 'She weighs nothing and drops a yapa on top anyway.' },
    ],
    effects: ['set:c10.marisol.seen'],
  },

  // ---------------- Don Simón, and her fairness ----------------
  'c10.simon.reunion': {
    lines: [
      { who: 'Don Simón', text: 'So. She carried you out, and she carried you back. Hard, but fair.' },
      { who: 'Don Simón', text: 'You came home saying la mar. I can hear it. She heard you too.' },
    ],
    effects: ['set:c10.simon.seen'],
  },

  // ---------------- Doña Petro, the standing pot ----------------
  'c10.petro.reunion': {
    lines: [
      { text: 'Past the pots, still the only way in: steam, ají, a long table of strangers not being strangers.' },
      { who: 'Doña Petro', text: 'Criatura de la sierra! Sit. The ocean can wait; in this house the pot goes first.' },
      { who: 'Doña Petro', text: 'The sudado has been on, more or less, since you left. Some pots are promises.' },
    ],
    effects: ['set:c10.petro.seen'],
  },

  // ---------------- Nilda, of two altitudes ----------------
  'c10.nilda.reunion': {
    lines: [
      { who: 'Nilda', text: 'Back up the same sand, then. How many altitudes are you made of now?' },
      { who: 'Nilda', text: 'When you climb, tell the sierra half the coast says hello.' },
    ],
    effects: ['set:c10.nilda.seen'],
  },

  // ---------------- Rafa ----------------
  'c10.rafa.reunion': {
    lines: [
      { who: 'Rafa', text: 'CAUSA! You came back! Tell me the far waves are real. Lie to me if you have to.' },
      { who: 'Rafa', text: 'Chévere does not cover it. I am inventing a bigger word.' },
    ],
    effects: ['set:c10.rafa.seen'],
  },

  // ---------------- Maestro Félix ----------------
  'c10.felix.reunion': {
    lines: [
      { text: 'Maestro Félix is partway through his next boat, as promised.' },
      { who: 'Maestro Félix', text: 'The boat is not finished. Good. The time was the right length.' },
      { who: 'Maestro Félix', text: 'The going wears out; the knowing how comes home.' },
    ],
    effects: ['set:c10.felix.seen'],
  },

  // ---------------- Chasca, home too, with THE ALBUM ----------------
  'c10.chasca.reunion': {
    lines: [
      { who: 'Chasca', text: 'Stop! Perfect. Do not move a single humble thread.' },
      { text: 'No camera comes up. She just looks at you, on the road where she first stopped you.' },
      { who: 'Chasca', text: 'Home too, both of us. And I developed everything.' },
    ],
    effects: ['set:c10.chasca.seen'],
    next: 'c10.chasca.offer',
  },
  'c10.chasca.offer': {
    lines: [
      { who: 'Chasca', text: 'The album is heavy now, in the good way. Sit on the rock.' },
    ],
    choices: [
      { text: 'Open the album', goto: 'c10.album.open' },
      { text: 'Not yet', goto: 'c10.chasca.later' },
    ],
  },
  'c10.chasca.later': {
    lines: [
      { who: 'Chasca', text: 'The album keeps. That is the entire point of an album.' },
    ],
  },
  'c10.album.open': {
    lines: [
      { text: 'The album opens across both your knees. It is heavier than it looks.' },
      { who: 'Chasca', text: 'Turn the pages. I will remember out loud if you get stuck.' },
    ],
    // The engine consumes this signal when the textbox closes and unfolds the
    // album itself: the actual prints, two to a spread. Her closing words run
    // when the player hands it back (see the RETURN_EVENTS ledger entry).
    effects: ['set:album.open'],
  },
  /**
   * Handing it back. The overlay tallies what it actually showed and raises
   * exactly one of album.full / album.most / album.few first, so her closing
   * words are about the book in her hands and not about a book she assumed.
   * The arms carry the same prompt on purpose: the branch is hers, not yours.
   * `next` repeats the sparse arm for any path that never opened the pages.
   */
  'c10.album.close': {
    lines: [
      { text: 'She takes it back with both hands.' },
      { who: 'Chasca', text: 'I always leave one empty. A roll of film ends. A road does not.' },
    ],
    effects: ['set:c10.album.seen', 'journal:customs.album'],
    choices: [
      { text: 'Let her close it', goto: 'c10.album.full', when: { has: ['album.full'] } },
      { text: 'Let her close it', goto: 'c10.album.most', when: { has: ['album.most'] } },
      { text: 'Let her close it', goto: 'c10.album.few', when: { has: ['album.few'] } },
    ],
    next: 'c10.album.few',
  },
  'c10.album.full': {
    lines: [
      { who: 'Chasca', text: 'Every frame I shouted for, you stood still for. Ten of ten, and not one a pose.' },
      { text: 'She closes the album the way you close a door on a sleeping child.' },
    ],
  },
  'c10.album.most': {
    lines: [
      { who: 'Chasca', text: 'Most of it. The gaps are days you got ahead of me, the correct direction for a person.' },
      { who: 'Chasca', text: 'A road you walked without me is still a road. It belongs to you, not the book.' },
      { text: 'She closes the album the way you close a door on a sleeping child.' },
    ],
  },
  'c10.album.few': {
    lines: [
      { who: 'Chasca', text: 'Mostly corners. You are about to apologize, and I am telling you not to.' },
      { who: 'Chasca', text: 'Those blanks are roads that got away from me. I never stopped following them.' },
      { text: 'She closes it gently, the way you close a door on a sleeping child.' },
    ],
  },
  'c10.chasca.after': {
    lines: [
      { who: 'Chasca', text: 'The album sleeps in my bag, one page still empty. Tomorrow I start the next one.' },
    ],
    choices: [
      { text: 'Look through it again', goto: 'c10.chasca.again' },
      { text: 'Let it sleep', goto: 'c10.chasca.later' },
    ],
  },
  'c10.chasca.again': {
    lines: [
      { who: 'Chasca', text: 'Always. The middle is the good part; middles always are.' },
    ],
    effects: ['set:album.open'],
  },

  // ---------------- Faustino, arriero ----------------
  'c10.faustino.reunion': {
    lines: [
      { who: 'Faustino', text: 'Ho! The walker walks home! Sit, the fire is honest.' },
      { text: 'He looks at you like a llama that found its own way down a bad pass. His highest compliment.' },
    ],
    effects: ['set:c10.faustino.seen'],
  },

  // ---------------- Paca, customs inspector ----------------
  'c10.paca.reunion': {
    lines: [
      { text: 'Paca holds the pass, immovable as policy. Her nostrils inspect you: salt, diesel, incense. The ears render the verdict: appalled.' },
      { text: 'She steps aside almost a full meter. For Paca, this is a parade in your honor.' },
    ],
    effects: ['set:c10.paca.seen'],
  },

  // ---------------- Rosa, full circle ----------------
  'c10.rosa.reunion': {
    lines: [
      { who: 'Rosa', text: 'You walked up from the valley? Sit. The soup is hot and you look like wind.' },
      { text: 'A bowl lands in front of you before you can answer. The same steam, the same green sharp something. Your eyes sting before the spoon is in it.' },
      { who: 'Rosa', text: 'Ha! The whole ocean, and my soup still gets you. First page of your new book, wawa, as agreed.' },
    ],
    effects: ['set:c10.rosa.seen'],
  },

  // ---------------- Don Aurelio, the quiet heart ----------------
  'c10.aurelio.reunion': {
    lines: [
      { who: 'Don Aurelio', text: 'Allillanchu.' },
      { text: 'You answer without thinking, and it does not come out like a sneeze. Not even a little.' },
      { who: 'Don Aurelio', text: 'Allillanmi. Mm. Sit; the rest can go slowly.' },
    ],
    effects: ['set:c10.aurelio.seen'],
    next: 'c10.aurelio.soup',
  },
  'c10.aurelio.soup': {
    lines: [
      { text: 'He lifts a cloth off a small pot by the well. Soup, still warm, as if it knew which boat you were on.' },
      { who: 'Don Aurelio', text: 'The letter said it is always on. An old man\'s word should never be bigger than his pot.' },
    ],
    choices: [
      // A gift set on Nani's ofrenda in Oaxaca cannot also be handed over
      // here; the choice becomes the telling of where it went instead.
      { text: 'Give him the omiyage from Shionoura', goto: 'c10.aurelio.omiyage', when: { has: ['omiyage.aurelio'], not: ['c9.of.omiyage'] } },
      { text: 'Tell him where his omiyage went', goto: 'c10.aurelio.ofrenda', when: { has: ['omiyage.aurelio', 'c9.of.omiyage'] } },
      { text: 'Tell him about a ledger in Oaxaca', goto: 'c10.aurelio.ledger', when: { has: ['c9.debt.paid'] } },
      { text: 'Say yes to soup', goto: 'c10.aurelio.eat' },
    ],
  },
  'c10.aurelio.omiyage': {
    lines: [
      { text: 'You hand over the small wrapped thing that crossed an ocean. He opens it the way he does everything: eventually.' },
      { who: 'Don Aurelio', text: 'Ayni, wawa. It crosses oceans fine. I always suspected it would.' },
    ],
    next: 'c10.aurelio.eat',
  },
  'c10.aurelio.ofrenda': {
    lines: [
      { text: 'You tell him: his parcel from the Seto sea went on her ofrenda in Oaxaca, between the marigolds and the bread.' },
      { who: 'Don Aurelio', text: 'Then it reached the right hands by the long road. She always did take my share of the good things.' },
    ],
    next: 'c10.aurelio.eat',
  },
  'c10.aurelio.ledger': {
    lines: [
      { text: 'You tell him about a ledger in a valley, and a line that waited fifty years: Zoila, 1975. Owed.' },
      { who: 'Don Aurelio', text: 'And you paid it. A debt does not expire, I told you once. Neither does the thanks.' },
    ],
    next: 'c10.aurelio.eat',
  },
  'c10.aurelio.eat': {
    lines: [
      { text: 'You say yes to soup. The well rope creaks.' },
      { who: 'Don Aurelio', text: 'She would have liked this exact nothing, your grandmother. Most of what she loved was this exact nothing.' },
      { who: 'Don Aurelio', text: 'Eat. Then go be greeted; the village has been rehearsing.' },
    ],
  },
  'c10.aurelio.after': {
    lines: [
      { who: 'Don Aurelio', text: 'The stone is warm. The soup is on. I plan to keep saying both until they stop being true, which is never.' },
    ],
  },

  // ---------------- Doña Carmen reads the band ----------------
  'c10.carmen.reunion': {
    lines: [
      { who: 'Doña Carmen', text: 'The wrist, wawa. Show me the wrist first. Words after.' },
      { text: 'You hold out the band, weathered to something quieter. She reads it row by row.' },
      { who: 'Doña Carmen', text: 'Salt in this row. Ship rope here, see the shine. And this stain is candle smoke.' },
    ],
    effects: ['set:c10.carmen.seen'],
    choices: [
      { text: 'Give her the kanga from Zanzibar', goto: 'c10.carmen.kanga', when: { has: ['kanga.gift'], not: ['c9.of.kanga'] } },
      { text: 'Tell her about the kanga from Zanzibar', goto: 'c10.carmen.ofrenda', when: { has: ['kanga.gift', 'c9.of.kanga'] } },
      { text: 'Sit while she weaves', goto: 'c10.carmen.sit' },
    ],
  },
  'c10.carmen.kanga': {
    lines: [
      { text: 'You unfold the kanga: printed birds, a proverb along the hem, kept for giving.' },
      { who: 'Doña Carmen', text: 'Cloth that speaks in letters! Mine speaks without them. Now they can argue on the same wall.' },
    ],
    next: 'c10.carmen.sit',
  },
  'c10.carmen.ofrenda': {
    lines: [
      { text: 'You tell her about a cloth that speaks in letters, and how it went on Nani\'s ofrenda in Oaxaca, under the candles.' },
      { who: 'Doña Carmen', text: 'Good. It went to the one who taught you to keep one. My wall can wait; hers could not.' },
    ],
    next: 'c10.carmen.sit',
  },
  'c10.carmen.sit': {
    lines: [
      { text: 'You sit. The wichuna picks, the colors change, the sun does its slow arithmetic across the courtyard.' },
      { who: 'Doña Carmen', text: 'The granddaughter in Lima wears the other lliclla now. Your crooked row is keeping a stranger warm.' },
    ],
  },

  /**
   * Beat eleven of the Her thread. Chapter one planted the ache: she left in
   * a hurry, the goodbyes never happened, and a village stayed faintly short
   * about it for fifty years. This is that said out loud, and answered. It is
   * deliberately not a pardon; what changes is the bookkeeping, which in this
   * village is the only thing that was ever going to change.
   */
  'c10.carmen.decided': {
    lines: [
      { text: 'She does not look up from the loom, which is how you know this was settled before you walked in.' },
      { who: 'Doña Carmen', text: 'The well, last night. Half this village around one jug, and your grandmother, the argument we never finish.' },
      { who: 'Doña Carmen', text: 'She went west in a hurry and skipped the goodbyes. Some of us stayed short about it for fifty years. We earned that.' },
    ],
    choices: [
      { text: '"She left badly and she meant to come back. Both are true."', goto: 'c10.her.both' },
      { text: '"You are allowed to still be angry. I would be."', goto: 'c10.her.angry' },
      { text: '"Sit down. I can tell you every place she stopped."', goto: 'c10.her.places' },
    ],
  },
  'c10.her.both': {
    lines: [
      { who: 'Doña Carmen', text: 'Meaning to is not a road. But you walked the one she meant, so her meaning can stand where I can see it.' },
    ],
    next: 'c10.carmen.row',
  },
  'c10.her.angry': {
    lines: [
      { who: 'Doña Carmen', text: 'We did not ask permission, wawa. Fifty years of short answers wear down like a step, not in one afternoon.' },
    ],
    next: 'c10.carmen.row',
  },
  'c10.her.places': {
    lines: [
      { text: "You name them in the book's order: a fishing town, a ship, a bay, two markets, a backwater, a bench in the rains, a mountain that smokes." },
      { who: 'Doña Carmen', text: 'More news of her than this village has had in fifty years.' },
    ],
    next: 'c10.carmen.row',
  },
  'c10.carmen.row': {
    lines: [
      { who: 'Doña Carmen', text: 'Now let me close this row. Come back when it is done. The rest wants my hands still.' },
    ],
    effects: ['set:c10.carmen.told'],
  },
  // The second visit. The row is finished and the loom stops, which it never
  // does; the verdict is a stone put in your hands for the apacheta, the
  // mountain's own way of saying someone arrived.
  'c10.carmen.stone': {
    lines: [
      { text: 'The row is tied off. Then she does something you have not once seen her do: she stops the loom.' },
      { who: 'Doña Carmen', text: 'So it is decided, and it is not a pardon. She went the wrong way out of this village, and that stays said.' },
      { who: 'Doña Carmen', text: 'She put a stone on the apacheta going out. Nobody laid the one that says she arrived; nobody knew where.' },
    ],
    next: 'c10.carmen.stone2',
  },
  'c10.carmen.stone2': {
    lines: [
      { text: 'From the sill she takes a river stone, smooth as a worn step, and sets it in your palm.' },
      { who: 'Doña Carmen', text: 'Sunday we walk up and you carry it. You are the only one here who can say the name of the place.' },
    ],
    effects: ['set:c10.carmen.her', 'journal:her.return'],
  },

  // ---------------- Justina ----------------
  'c10.justina.reunion': {
    lines: [
      { text: 'You find Justina in the terraces. You are, of course, standing on her potatoes.' },
      { who: 'Justina', text: 'Off the potatoes, wawa. Some things the ocean cannot teach, clearly.' },
      { who: 'Justina', text: 'Now come here. Hm. Not enough papa. We fix that first and talk second.' },
    ],
    effects: ['set:c10.justina.seen'],
  },

  // ---------------- Mateo ----------------
  'c10.mateo.reunion': {
    lines: [
      { who: 'Mateo', text: 'No way. NO WAY.' },
      { who: 'Mateo', text: 'I told the whole ridge you were coming back. Gossip travels at signal speed.' },
      { who: 'Mateo', text: 'Everyone says the village is emptying. You left and came BACK. I will be insufferable about this for years.' },
    ],
    effects: ['set:c10.mateo.seen'],
  },

  // ---------------- Don Teófilo ----------------
  'c10.teofilo.reunion': {
    lines: [
      { who: 'Don Teófilo', text: 'The bundle-carrier! Rosa told the room before your boat touched the pier.' },
      { text: 'He fills two glasses. Without thinking, your first splash goes to the floor. The room notices. The room approves.' },
      { who: 'Don Teófilo', text: 'Ha! The earth still drinks first. Tomakusunchis.' },
    ],
    effects: ['set:c10.teofilo.seen'],
  },

  // ---------------- the dog ----------------
  'c10.allqu.reunion': {
    lines: [
      { text: 'A tan blur detonates across the plaza. The dog has identified you from one village away.' },
      { text: 'There is leaning. There is a full-body wag with structural implications.' },
      { text: 'You get down to proper petting altitude. It waited the whole time.' },
    ],
    effects: ['set:c10.allqu.seen'],
  },

  // ---------------- Pilar, in person at last ----------------
  'c10.pilar.puffer': {
    lines: [
      { text: 'The sign now reads PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I.' },
      { text: 'In a crate labeled MUSEUM OF THE SEA: the puffer fish, permanently astonished, on lucky rocks.' },
      { who: 'Pilar', text: 'Exhibit one. Admission is one fact, waived for staff. You are staff.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.star': {
    lines: [
      { text: 'The sign now reads PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I.' },
      { text: 'In a crate labeled MUSEUM OF THE SEA: the four-armed sea star, on lucky rocks.' },
      { who: 'Pilar', text: 'Exhibit one. Proof the sea does things approximately. Arguing with it doubles the toll.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.claw': {
    lines: [
      { text: 'The sign now reads PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I.' },
      { text: 'In a crate labeled MUSEUM OF THE SEA: the crab claw, on lucky rocks.' },
      { who: 'Pilar', text: 'Exhibit one. A comma means the sea was not finished. That is curation; I looked up the word.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.plain': {
    lines: [
      { text: 'The sign now reads PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I.' },
      { who: 'Pilar', text: 'The museum has a spot reserved for the sea thing you still owe me. The invoice compounds.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.museum': {
    lines: [
      { who: 'Pilar', text: 'The museum accepts donations, facts, rocks, and respectful staring.' },
    ],
    choices: [
      { text: 'Present the omiyage from Shionoura', goto: 'c10.pilar.wing', when: { has: ['omiyage.pilar'], not: ['c9.of.omiyage'] } },
      { text: 'Explain where her omiyage went', goto: 'c10.pilar.ofrenda', when: { has: ['omiyage.pilar', 'c9.of.omiyage'] } },
      { text: 'Stare respectfully', goto: 'c10.pilar.stare' },
    ],
  },
  'c10.pilar.wing': {
    lines: [
      { text: 'You hand over the small bright thing from the festival. She inspects it like customs. Twice.' },
      { who: 'Pilar', text: 'A foreign acquisition. The museum is now international. That changes the stationery.' },
    ],
    next: 'c10.pilar.stare',
  },
  'c10.pilar.ofrenda': {
    lines: [
      { text: 'You explain: her omiyage went on your Nani\'s ofrenda in Oaxaca instead.' },
      { who: 'Pilar', text: 'Loaned to a sister institution. Acceptable.' },
      { text: 'She writes OMIYAGE (ON LOAN, OAXACA) on a card and props it against an empty crate. It is, somehow, the best exhibit.' },
    ],
    next: 'c10.pilar.stare',
  },
  'c10.pilar.stare': {
    lines: [
      { text: 'You stare respectfully. The exhibits, and Pilar, stare back.' },
      { who: 'Pilar', text: 'The museum closes at dark or at dinner, whichever wins. Staff may visit whenever.' },
    ],
  },
  'c10.pilar.after': {
    lines: [
      { who: 'Pilar', text: 'Co-owner. The bridge held the whole time you were gone. I am not saying it was easy. I am saying the invoice is pending.' },
    ],
  },

  // ---------------- the young traveler at the east gate ----------------
  'c10.traveler.pre': {
    lines: [
      { text: 'A young traveler at the signpost is mouthing the distances. You are scenery today.' },
    ],
  },
  'c10.traveler.first': {
    lines: [
      { text: 'A young traveler is reading the signpost, boots new, journal newer.' },
      { who: 'Traveler', text: 'Up from the coast? I am going the other way. All the ways, maybe. What should I know?' },
    ],
    choices: [
      { text: '"Walk slowly. That is the whole trick."', goto: 'c10.torch.slow' },
      { text: '"Say yes to soup. Every soup."', goto: 'c10.torch.soup' },
      { text: '"Let people correct you. Thank them twice."', goto: 'c10.torch.correct' },
    ],
  },
  'c10.torch.slow': {
    lines: [
      { who: 'Traveler', text: 'Walk slowly? I had planned to hurry the flat parts.' },
      { text: 'They write it down anyway, on the first page, where it belongs.' },
    ],
    effects: ['set:c10.torch', 'journal:people.traveler'],
  },
  'c10.torch.soup': {
    lines: [
      { who: 'Traveler', text: 'Yes to soup. That is the advice? The whole advice?' },
      { text: 'You nod with the calm of someone who has eaten the evidence. They write it down.' },
    ],
    effects: ['set:c10.torch', 'journal:people.traveler'],
  },
  'c10.torch.correct': {
    lines: [
      { who: 'Traveler', text: 'Let people correct me. Huh. At home that is called losing.' },
      { text: 'Out there it is called learning, you say. They write it down slowly, like it is already correcting them.' },
    ],
    effects: ['set:c10.torch', 'journal:people.traveler'],
  },
  'c10.traveler.mail': {
    lines: [
      { who: 'Traveler', text: 'Oh, good, you. The harbor office gave me this on the way up. It has been chasing you across an ocean.' },
      { text: 'The address is mostly corrections. The stamp shows a wave and a very confident bird.' },
    ],
    effects: ['set:c10.traveler.mail', 'letter:australia.hook'],
  },
  'c10.traveler.after': {
    lines: [
      { who: 'Traveler', text: 'I leave with the first light. Down, then out, then we will see. That is the entire itinerary.' },
      { text: 'The signpost says MORE. They keep reading it like it is addressed to them. It is.' },
    ],
  },
  'c10.traveler.idle': {
    lines: [
      { text: 'The traveler checks the signpost against a hand-drawn map that is mostly hope.' },
    ],
  },

  // ---------------- after the last page: epilogue texture ----------------
  // One warm line each, gated on story.end, so nobody greets a stranger who
  // finished the book in front of them.
  'c10.rosa.post': {
    lines: [
      { who: 'Rosa', text: 'The flag is up, wawa. The pot never believed you left; do not argue with the pot.' },
    ],
  },
  'c10.justina.post': {
    lines: [
      { who: 'Justina', text: 'Near my potatoes again. Sunday there is digging; your legs still owe the terraces.' },
    ],
  },
  'c10.mateo.post': {
    lines: [
      { who: 'Mateo', text: 'The ridge already knows the journal is finished. I may have been the signal.' },
    ],
  },
  'c10.carmen.post': {
    lines: [
      { who: 'Doña Carmen', text: 'The loom keeps its slow time, and so do you now, wawa. Sit when you like.' },
    ],
  },
  'c10.teofilo.post': {
    lines: [
      { who: 'Don Teófilo', text: 'The seat is yours forever; the room heard me say it. Tomakusunchis, friend of the house.' },
    ],
  },
  'c10.allqu.post': {
    lines: [
      { text: 'The dog falls in beside you for a slow lap of the plaza. Colleagues, permanent, with nothing left to inspect.' },
    ],
  },
  'c10.faustino.post': {
    lines: [
      { who: 'Faustino', text: 'The fire is honest. Sit, walker; home roads still count as roads.' },
    ],
  },
  'c10.paca.post': {
    lines: [
      { text: 'Paca holds her pass, ears at half diplomacy. You are inventory now, and inventory may pass.' },
    ],
  },

  // ---------------- the well: the last page ----------------
  'c10.well.wishnani': {
    lines: [
      { text: 'The well. In Shionoura you tied a wish to bamboo, and the wish was about her. You sit where she sat.' },
    ],
    next: 'c10.lastpage',
  },
  'c10.well.wishroad': {
    lines: [
      { text: 'The well. You once wished, on paper, on bamboo, for the road to keep going. It did. It went all the way around and became this stone.' },
    ],
    next: 'c10.lastpage',
  },
  'c10.well.wishpeople': {
    lines: [
      { text: 'The well. In Shionoura you wished for the people, all of them, everywhere. From here you can hear about nine of them talking at once.' },
    ],
    next: 'c10.lastpage',
  },
  'c10.lastpage': {
    lines: [
      { text: 'You take out the journal. Every page is full except one, the last. It was never blank. It was waiting.' },
      { text: 'The stone for the apacheta sits by your knee, waiting for Sunday.' },
      { text: 'The well rope creaks. Four kitchens send up smoke, straight as loom threads. You uncap the pen.' },
    ],
    choices: [
      { text: 'Write: "The word for elsewhere is also the word for home."', goto: 'c10.lastline.word' },
      { text: 'Write: "Walk slowly. Say yes to soup. Thank them twice."', goto: 'c10.lastline.trick' },
      { text: 'Write: "Finished. Which is to say: begun."', goto: 'c10.lastline.begun' },
    ],
  },
  'c10.lastline.word': {
    lines: [
      { text: 'You write it in your best hand, which has improved. In the margin, an old underline in her 1974 ink, already the right length for the sentence.' },
      { text: 'The journal is full. You close it the way Aurelio closes an afternoon: without hurry, without doubt.' },
    ],
    effects: ['set:c10.lastline.word', 'journal:customs.home', 'set:story.end'],
    next: 'c10.end.hold',
  },
  'c10.lastline.trick': {
    lines: [
      { text: 'Three instructions, one grandmother, one grandchild, fifty years. You sign nothing; the handwriting is signature enough.' },
      { text: 'The journal is full. The village hums on around you, unaware it has been finished.' },
    ],
    effects: ['set:c10.lastline.trick', 'journal:customs.home', 'set:story.end'],
    next: 'c10.end.hold',
  },
  'c10.lastline.begun': {
    lines: [
      { text: 'You write it, and the sentence sits there being true from both directions, like haku, like a road.' },
      { text: 'The journal is full. Tomorrow there will be a new journal; Rosa has been explicit about what goes on its first page.' },
    ],
    effects: ['set:c10.lastline.begun', 'journal:customs.home', 'set:story.end'],
    next: 'c10.end.hold',
  },

  /**
   * The landing. Whichever last line was written, the thought finishes here:
   * the pen goes down, nobody arrives, and the well keeps doing what a well
   * does. The final two effects hand the moment to the closing book, which is
   * the journal's own last spreads and the door to the credits after them.
   */
  'c10.end.hold': {
    lines: [
      { text: 'You cap the pen. The journal shuts on itself with the sound a full book makes, which is a different sound from an empty one.' },
      { text: 'Nobody comes. The rope creaks. Behind you a bowl goes down on a table, and somebody laughs at a joke you were not told.' },
      { text: 'Fifty years ago a woman sat on this stone with this same book half written, and got up, and went. You got up, and came back.' },
      { text: 'You stay a while. The smoke goes straight up.' },
    ],
    effects: ['set:end.book', 'set:album.open'],
  },
  'c10.well.notyet': {
    lines: [
      { text: 'The well. You reach for the journal, and your hand stops on the band instead.' },
      { text: 'The last page can wait. Doña Carmen has something to say first, and she is at her loom.' },
    ],
  },
  'c10.well.after': {
    lines: [
      { text: 'The well, older than the church. Your page, the newest thing here, already settling in. The water is nobody\'s to sell.' },
    ],
  },
};

/** The well speaks for the ending; map-tagged so the Andes keep their own words elsewhere. */
export const RETURN_EXAMINES: Record<string, ExamineArm[]> = {
  // The last page waits on Doña Carmen too: it speaks of the apacheta stone
  // she hands over, and the road home is not walked until she has read the
  // wrist and said the village's piece out loud.
  well: [
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen', 'c10.carmen.her', 'wish.nani'], not: ['story.end'] },
      node: 'c10.well.wishnani',
    },
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen', 'c10.carmen.her', 'wish.road'], not: ['story.end'] },
      node: 'c10.well.wishroad',
    },
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen', 'c10.carmen.her', 'wish.people'], not: ['story.end'] },
      node: 'c10.well.wishpeople',
    },
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen', 'c10.carmen.her'], not: ['story.end'] },
      node: 'c10.lastpage',
    },
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen'], not: ['story.end', 'c10.carmen.her'] },
      node: 'c10.well.notyet',
    },
    { map: 'village', when: { has: ['story.end'] }, node: 'c10.well.after' },
  ],
};

/**
 * One ledger entry: the album overlay is an engine panel, so, exactly like a
 * minigame's doneNode, its closing narration is listed here to keep the
 * reachability walk honest. At runtime main.ts consumes `album.open` when the
 * conversation ends and runs `c10.album.close` when the album is handed back.
 */
export const RETURN_EVENTS: EventNode[] = [
  { when: { has: ['album.open'] }, node: 'c10.album.close' },
];
