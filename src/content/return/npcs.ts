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
      { when: { has: ['story.end'], not: ['c10.traveler.mail'] }, node: 'c10.traveler.mail' },
      { when: { has: ['story.end'] }, node: 'c10.traveler.after' },
      { when: { not: ['c10.torch'] }, node: 'c10.traveler.first' },
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
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.faustino.seen'] }, node: 'c10.faustino.reunion' }],
  },
  {
    npcId: 'paca',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.paca.seen'] }, node: 'c10.paca.reunion' }],
  },
  // ---- Ch'aska Pampa ----
  {
    npcId: 'rosa',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.rosa.seen'] }, node: 'c10.rosa.reunion' }],
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
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.carmen.seen'] }, node: 'c10.carmen.reunion' }],
  },
  {
    npcId: 'justina',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.justina.seen'] }, node: 'c10.justina.reunion' }],
  },
  {
    npcId: 'mateo',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.mateo.seen'] }, node: 'c10.mateo.reunion' }],
  },
  {
    npcId: 'teofilo',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.teofilo.seen'] }, node: 'c10.teofilo.reunion' }],
  },
  {
    npcId: 'allqu',
    entry: [{ when: { has: ['c10.arrived'], not: ['c10.allqu.seen'] }, node: 'c10.allqu.reunion' }],
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
      { text: 'The ship noses in past the pier and La Caleta assembles itself out of the garúa: salt, fish scale, something frying far away.' },
      { text: 'The fence of pale horses still stands on end by the water. The road up is the same road down, older now. So are you.' },
      { text: 'Home is at the top of that road. Everything between here and there wants to say hello first.' },
    ],
    effects: ['set:c10.arrived', 'journal:words.elsewhere'],
  },

  // ---------------- Marisol, casero forever ----------------
  'c10.marisol.reunion': {
    lines: [
      { text: 'The stall is exactly where the morning left it. Marisol sees you before the gangway finishes creaking.' },
      { who: 'Marisol', text: 'CASERO! Off the boat and straight to my stall, as is correct. Once a casero, always a casero, pe. There is no paperwork to undo it.' },
      { who: 'Marisol', text: 'Lisa today. Humble fish, honest fish. Some things the world does not dare change.' },
      { text: 'She weighs nothing and drops a yapa on top anyway. The stall remembers your fish better than most people remember faces.' },
    ],
    effects: ['set:c10.marisol.seen'],
  },

  // ---------------- Don Simón, and her fairness ----------------
  'c10.simon.reunion': {
    lines: [
      { text: 'Don Simón is at the pier rail, mending a line with hands that still do not look at their work.' },
      { who: 'Don Simón', text: 'So. She carried you out, and she carried you back. Hard, but fair. I told you the accounting was honest.' },
      { who: 'Don Simón', text: 'You crossed her twice and came home saying la mar. I can hear it. That means she heard you too.' },
    ],
    effects: ['set:c10.simon.seen'],
  },

  // ---------------- Doña Petro, the standing pot ----------------
  'c10.petro.reunion': {
    lines: [
      { text: 'You enter past the pots, because that is still the only way in. Steam, ají, the long table half full of strangers not being strangers.' },
      { who: 'Doña Petro', text: 'Hija de la sierra! Sit. Do not tell me the whole ocean yet; in this house the pot goes first.' },
      { who: 'Doña Petro', text: 'The sudado is on. It has been on, more or less, since you left. Some pots are promises.' },
    ],
    effects: ['set:c10.petro.seen'],
  },

  // ---------------- Nilda, of two altitudes ----------------
  'c10.nilda.reunion': {
    lines: [
      { who: 'Nilda', text: 'Down the mountain, around the world, and back up the same sand. How many altitudes are you made of now?' },
      { who: 'Nilda', text: 'My aunt still lives up past the pass. When you climb, tell the sierra that half the coast says hello.' },
    ],
    effects: ['set:c10.nilda.seen'],
  },

  // ---------------- Rafa ----------------
  'c10.rafa.reunion': {
    lines: [
      { who: 'Rafa', text: 'CAUSA! You came back! Tell me the far waves are real. Lie to me if you have to.' },
      { who: 'Rafa', text: 'You went around the whole planet the slow way. Chévere does not cover it, causa. I am inventing a bigger word.' },
    ],
    effects: ['set:c10.rafa.seen'],
  },

  // ---------------- Maestro Félix ----------------
  'c10.felix.reunion': {
    lines: [
      { text: 'Maestro Félix is partway through his next boat, as promised. The cord walks its long, even wraps.' },
      { who: 'Maestro Félix', text: 'The traveler returns, and the boat is not finished. Good. It means the time was the right length.' },
      { who: 'Maestro Félix', text: 'A journey is a caballito, you know. The going wears out; the knowing how comes home. I can see you brought the right half.' },
    ],
    effects: ['set:c10.felix.seen'],
  },

  // ---------------- Chasca, home too, with THE ALBUM ----------------
  'c10.chasca.reunion': {
    lines: [
      { who: 'Chasca', text: 'Stop! Perfect. Do not move a single humble thread.' },
      { text: 'No camera comes up. She just looks at you, on the road where she first stopped you, walking the other way at last.' },
      { who: 'Chasca', text: 'Home too, then. Both of us. And I kept my word: I developed everything. Every traveler, every road.' },
    ],
    effects: ['set:c10.chasca.seen'],
    next: 'c10.chasca.offer',
  },
  'c10.chasca.offer': {
    lines: [
      { who: 'Chasca', text: 'The album is heavy now, in the good way. Sit on the rock. It starts with you.' },
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
      { text: 'The album opens across both your knees. It is heavier than it looks. Most memory is.' },
      { who: 'Chasca', text: 'Turn the pages. I will do the remembering out loud if you get stuck.' },
    ],
    // The engine consumes this signal when the textbox closes and unfolds the
    // album itself: the actual prints, two to a spread. Her closing words run
    // when the player hands it back (see the RETURN_EVENTS ledger entry).
    effects: ['set:album.open'],
  },
  'c10.album.close': {
    lines: [
      { who: 'Chasca', text: 'There. One journey, in order, with your face aging politely through it.' },
      { who: 'Chasca', text: 'I photograph the roads because somebody should keep the evidence. You are the evidence. Case closed.' },
      { text: 'She closes the album the way you close a door on a sleeping child.' },
    ],
    effects: ['set:c10.album.seen', 'journal:customs.album'],
  },
  'c10.chasca.after': {
    lines: [
      { who: 'Chasca', text: 'The album sleeps in my bag, finished. Tomorrow I start the next one. Roads keep happening; somebody has to keep up.' },
    ],
    choices: [
      { text: 'Look through it again', goto: 'c10.chasca.again' },
      { text: 'Let it sleep', goto: 'c10.chasca.later' },
    ],
  },
  'c10.chasca.again': {
    lines: [
      { who: 'Chasca', text: 'Always. It starts with you and ends in marigolds. The middle is the good part; middles always are.' },
    ],
    effects: ['set:album.open'],
  },

  // ---------------- Faustino, arriero ----------------
  'c10.faustino.reunion': {
    lines: [
      { who: 'Faustino', text: 'Ho! The walker walks home! Sit, the fire is honest and the wind has not changed its opinion.' },
      { who: 'Faustino', text: 'I told you once: a road is just ayni with distance. It carried you out. Look what it carried back.' },
      { text: 'He looks at you the way he looks at a llama that found its own way down a bad pass. It is his highest compliment.' },
    ],
    effects: ['set:c10.faustino.seen'],
  },

  // ---------------- Paca, customs inspector ----------------
  'c10.paca.reunion': {
    lines: [
      { text: 'Paca occupies her spot at the pass, immovable as policy. As you approach, her nostrils conduct a full inspection.' },
      { text: 'Salt. Diesel. Frying oil. Incense, seven harbors of cargo, and something floral she cannot place. The ears render the verdict: appalled.' },
      { text: 'She steps aside almost a full meter to let you pass. For Paca, this is a parade in your honor.' },
    ],
    effects: ['set:c10.paca.seen'],
  },

  // ---------------- Rosa, full circle ----------------
  'c10.rosa.reunion': {
    lines: [
      { text: 'The red flag is up over the door. Some facts hold the whole world in place.' },
      { who: 'Rosa', text: 'You walked up from the valley? Sit, sit. The soup is hot and you look like wind.' },
      { text: 'A bowl lands in front of you before you can answer. The same steam, the same green sharp something. Your eyes do a thing you did not authorize.' },
      { who: 'Rosa', text: 'Ha! The whole ocean, and my soup still gets you. Write THAT in your new book, wawa. First page, as agreed.' },
    ],
    effects: ['set:c10.rosa.seen'],
  },

  // ---------------- Don Aurelio, the quiet heart ----------------
  'c10.aurelio.reunion': {
    lines: [
      { text: 'Don Aurelio is at the well. Of course he is at the well. The stone is warm.' },
      { who: 'Don Aurelio', text: 'Allillanchu.' },
      { text: 'You answer without thinking, and it does not come out like a sneeze. Not even a little.' },
      { who: 'Don Aurelio', text: 'Allillanmi. Mm. The road fixed your pronunciation. Sit; the rest can go slowly.' },
    ],
    effects: ['set:c10.aurelio.seen'],
    next: 'c10.aurelio.soup',
  },
  'c10.aurelio.soup': {
    lines: [
      { text: 'From beside the well he lifts a cloth off a small pot. Soup. Still warm, as if it knew which boat you were on.' },
      { who: 'Don Aurelio', text: 'The letter said it is always on. An old man should not write checks his pot cannot cash.' },
    ],
    choices: [
      { text: 'Give him the omiyage from Shionoura', goto: 'c10.aurelio.omiyage', when: { has: ['omiyage.aurelio'] } },
      { text: 'Tell him about a ledger in Oaxaca', goto: 'c10.aurelio.ledger', when: { has: ['c9.debt.paid'] } },
      { text: 'Say yes to soup', goto: 'c10.aurelio.eat' },
    ],
  },
  'c10.aurelio.omiyage': {
    lines: [
      { text: 'You hand over the small wrapped thing that crossed an ocean to be here. He opens it the way he does everything: eventually.' },
      { who: 'Don Aurelio', text: 'From the far side of the water. And you carried it the whole way, for an old man at a well.' },
      { who: 'Don Aurelio', text: 'Ayni, wawa. It crosses oceans fine. I always suspected it would.' },
    ],
    effects: ['set:c10.aurelio.omiyage'],
    next: 'c10.aurelio.eat',
  },
  'c10.aurelio.ledger': {
    lines: [
      { text: 'You tell him about Doña Refugio, and a guelaguetza book, and a line that waited fifty years: Nani, 1975. Owed.' },
      { who: 'Don Aurelio', text: 'And you paid it. So the seed came up after all.' },
      { who: 'Don Aurelio', text: 'A debt does not expire, I told you once. I did not tell you the other half: neither does the thanks.' },
    ],
    effects: ['set:c10.aurelio.ledger'],
    next: 'c10.aurelio.eat',
  },
  'c10.aurelio.eat': {
    lines: [
      { text: 'You say yes to soup. The well rope creaks. Somewhere a loom keeps its slow time.' },
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
      { text: 'Doña Carmen is in her courtyard, facing the morning sun. The lliclla on the loom is new; the hands are the same.' },
      { who: 'Doña Carmen', text: 'The wrist, wawa. Show me the wrist first. Words after.' },
      { text: 'You hold out the band: terracotta, sky, gold, violet, all of it weathered to something quieter. She reads it row by row.' },
      { who: 'Doña Carmen', text: 'Salt in this row. Ship rope here, see the shine. This fade is a strong sun, a fair one. And this stain is candle smoke.' },
      { who: 'Doña Carmen', text: 'A whole journey, written in. Nothing written down, everything written in; I did tell you. Your hands remembered the mountain.' },
    ],
    effects: ['set:c10.carmen.seen'],
    choices: [
      { text: 'Give her the kanga from Zanzibar', goto: 'c10.carmen.kanga', when: { has: ['kanga.gift'] } },
      { text: 'Sit while she weaves', goto: 'c10.carmen.sit' },
    ],
  },
  'c10.carmen.kanga': {
    lines: [
      { text: 'You unfold the kanga: printed birds, a border, a proverb along the hem. One was worn. This one was always meant for giving.' },
      { who: 'Doña Carmen', text: 'Cloth that speaks in letters! Ha. Mine speaks without them. Now they can argue on the same wall.' },
      { who: 'Doña Carmen', text: 'A cloth kept for giving is a debt kept warm. Whoever taught you that, wawa, she and I would agree on everything.' },
    ],
    effects: ['set:c10.carmen.kanga'],
    next: 'c10.carmen.sit',
  },
  'c10.carmen.sit': {
    lines: [
      { text: 'You sit. The wichuna picks, the colors change, the sun does its slow arithmetic across the courtyard.' },
      { who: 'Doña Carmen', text: 'The granddaughter in Lima wears the other lliclla now. Somewhere down there, your crooked row is keeping a stranger warm.' },
    ],
  },

  // ---------------- Justina ----------------
  'c10.justina.reunion': {
    lines: [
      { text: 'You find Justina in the terraces. You are, of course, standing on her potatoes.' },
      { who: 'Justina', text: 'Off the potatoes, wawa. Some things the ocean cannot teach, clearly.' },
      { who: 'Justina', text: 'Now come here. Let me see what the world fed you.' },
      { who: 'Justina', text: 'Hm. Not enough papa. We fix the deficiency first and talk second; the stream will keep your place in the conversation.' },
    ],
    effects: ['set:c10.justina.seen'],
  },

  // ---------------- Mateo ----------------
  'c10.mateo.reunion': {
    lines: [
      { who: 'Mateo', text: 'No way. NO WAY.' },
      { who: 'Mateo', text: 'I told the whole ridge you were coming back. The signal is good up there, and gossip travels at signal speed.' },
      { who: 'Mateo', text: 'Everyone says the village is emptying. But you left and came BACK. I am going to be insufferable about this for years.' },
    ],
    effects: ['set:c10.mateo.seen'],
  },

  // ---------------- Don Teófilo ----------------
  'c10.teofilo.reunion': {
    lines: [
      { who: 'Don Teófilo', text: 'The bundle-carrier! Rosa told the whole room before your boat touched the pier, I am fairly sure.' },
      { text: 'He fills two glasses. Without thinking, your first splash goes to the floor. The room notices. The room approves.' },
      { who: 'Don Teófilo', text: 'Ha! Half the world away and back, and the earth still drinks first. Tomakusunchis, friend. Sit down forever.' },
    ],
    effects: ['set:c10.teofilo.seen'],
  },

  // ---------------- the dog ----------------
  'c10.allqu.reunion': {
    lines: [
      { text: 'A tan blur detonates across the plaza. The dog has identified you from a distance of one entire village.' },
      { text: 'There is leaning. There is a full-body wag with structural implications. Professional composure is nowhere to be found, and is not missed.' },
      { text: 'You get down to proper petting altitude. The patrol can wait. The patrol waited the whole time, in its way.' },
    ],
    effects: ['set:c10.allqu.seen'],
  },

  // ---------------- Pilar, in person at last ----------------
  'c10.pilar.puffer': {
    lines: [
      { text: 'The sign has been repainted: PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign now, and knows it.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I. Nine and a half.' },
      { text: 'She marches you to the rail. In a crate labeled MUSEUM OF THE SEA: the puffer fish, permanently astonished, on a bed of lucky rocks.' },
      { who: 'Pilar', text: 'Exhibit one. It came by post from the actual sea. Admission is one fact, waived for staff, and you are staff.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.star': {
    lines: [
      { text: 'The sign has been repainted: PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign now, and knows it.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I. Nine and a half.' },
      { text: 'She marches you to the rail. In a crate labeled MUSEUM OF THE SEA: the four-armed sea star, arranged on a bed of lucky rocks.' },
      { who: 'Pilar', text: 'Exhibit one. Proof the sea does things approximately. Visitors argue with the arithmetic; arguing doubles the toll.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.claw': {
    lines: [
      { text: 'The sign has been repainted: PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign now, and knows it.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I. Nine and a half.' },
      { text: 'She marches you to the rail. In a crate labeled MUSEUM OF THE SEA: the crab claw, comma of the sea, on a bed of lucky rocks.' },
      { who: 'Pilar', text: 'Exhibit one. A comma means the sea was not finished. That is real curation; I looked up the word.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.plain': {
    lines: [
      { text: 'The sign has been repainted: PUENTE. MUSEO. MAYOR\'S OFFICE. The girl behind it is taller than the sign now, and knows it.' },
      { who: 'Pilar', text: 'Halt. Returning co-owner. Your expenses grew while you were away. So did I. Nine and a half.' },
      { who: 'Pilar', text: 'The museum has a spot reserved for the sea thing you still owe me. The invoice compounds. Ask Mateo what compounds means.' },
    ],
    effects: ['set:c10.pilar.seen'],
    next: 'c10.pilar.museum',
  },
  'c10.pilar.museum': {
    lines: [
      { who: 'Pilar', text: 'The museum accepts donations. It also accepts facts, rocks, and staring respectfully.' },
    ],
    choices: [
      { text: 'Present the omiyage from Shionoura', goto: 'c10.pilar.wing', when: { has: ['omiyage.pilar'] } },
      { text: 'Stare respectfully', goto: 'c10.pilar.stare' },
    ],
  },
  'c10.pilar.wing': {
    lines: [
      { text: 'You hand over the small bright thing from a festival on the far side of the ocean. She inspects it like customs. Twice.' },
      { who: 'Pilar', text: 'A foreign acquisition. The museum is now international. That changes the stationery.' },
      { text: 'It gets its own crate, beside the sea thing. Exhibit two. The museum has doubled; the gift-shop rocks watch enviously.' },
    ],
    effects: ['set:c10.pilar.omiyage'],
    next: 'c10.pilar.stare',
  },
  'c10.pilar.stare': {
    lines: [
      { text: 'You stare respectfully. The exhibits stare back the way only museum pieces and Pilar can.' },
      { who: 'Pilar', text: 'The museum closes at dark or when I am called for dinner, whichever wins. Staff may visit whenever. You are staff.' },
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
      { text: 'A young traveler stands at the signpost, mouthing the distances. They do not look up. You are scenery today.' },
    ],
  },
  'c10.traveler.first': {
    lines: [
      { text: 'A young traveler is reading the signpost, boots new, journal newer. They look at you, then at the road down, then back.' },
      { who: 'Traveler', text: 'You came up from the coast, no? I am going the other way. All the ways, maybe. Is there anything I should know?' },
    ],
    choices: [
      { text: '"Walk slowly. That is the whole trick."', goto: 'c10.torch.slow' },
      { text: '"Say yes to soup. Every soup."', goto: 'c10.torch.soup' },
      { text: '"Let people correct you. Thank them twice."', goto: 'c10.torch.correct' },
    ],
  },
  'c10.torch.slow': {
    lines: [
      { who: 'Traveler', text: 'Walk slowly? The road is long. I had planned to hurry the flat parts.' },
      { text: 'They write it down anyway, on the first page, where it belongs. Somewhere, two women who said it first are not surprised.' },
    ],
    effects: ['set:c10.torch', 'journal:people.traveler'],
  },
  'c10.torch.soup': {
    lines: [
      { who: 'Traveler', text: 'Yes to soup. That is the advice? The whole advice?' },
      { text: 'You nod with the calm of someone who has eaten the evidence. They write it on the first page. It will save them someday, in a fog somewhere.' },
    ],
    effects: ['set:c10.torch', 'journal:people.traveler'],
  },
  'c10.torch.correct': {
    lines: [
      { who: 'Traveler', text: 'Let people correct me. Huh. At home that is called losing.' },
      { text: 'Out there it is called learning, you say, and thank them twice. They write it down slowly, like it is already correcting them.' },
    ],
    effects: ['set:c10.torch', 'journal:people.traveler'],
  },
  'c10.traveler.mail': {
    lines: [
      { who: 'Traveler', text: 'Oh, good, you. The harbor office flagged me down on the way up. Mail that has been chasing you across an ocean, they said.' },
      { text: 'The envelope has been forwarded so many times the address is mostly corrections. The stamp shows a wave, and a very confident bird.' },
    ],
    effects: ['set:c10.traveler.mail', 'letter:australia.hook'],
  },
  'c10.traveler.after': {
    lines: [
      { who: 'Traveler', text: 'I leave with the first light. Down, then out, then we will see. That is the entire itinerary, and I am proud of it.' },
      { text: 'The signpost says MORE. They keep reading it like it is addressed to them. It is.' },
    ],
  },
  'c10.traveler.idle': {
    lines: [
      { text: 'The traveler paces the gate, checking the signpost against a hand-drawn map that is mostly hope.' },
    ],
  },

  // ---------------- the well: the last page ----------------
  'c10.well.wishnani': {
    lines: [
      { text: 'The well. The tin cup still hangs for anyone who thirsts. In Shionoura you tied a wish to bamboo, and the wish was about her.' },
      { text: 'You sit where she sat. The wish and the well regard each other. Neither blinks first.' },
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
      { text: 'You write it in your best hand, which has improved. In the margin, a 1974 pen seems to underline it.' },
      { text: 'The journal is full. You close it the way Aurelio closes an afternoon: without hurry, without doubt.' },
    ],
    effects: ['set:c10.lastline.word', 'journal:customs.home', 'set:story.end'],
  },
  'c10.lastline.trick': {
    lines: [
      { text: 'Three instructions, one grandmother, one grandchild, fifty years. You sign nothing; the handwriting is signature enough.' },
      { text: 'The journal is full. The village hums on around you, unaware it has been finished. It has not, of course. Books end; villages continue.' },
    ],
    effects: ['set:c10.lastline.trick', 'journal:customs.home', 'set:story.end'],
  },
  'c10.lastline.begun': {
    lines: [
      { text: 'You write it, and the sentence sits there being true from both directions, like haku, like a road.' },
      { text: 'The journal is full. Tomorrow there will be a new journal; Rosa has been explicit about what goes on its first page.' },
    ],
    effects: ['set:c10.lastline.begun', 'journal:customs.home', 'set:story.end'],
  },
  'c10.well.after': {
    lines: [
      { text: 'The well, older than the church. The water, older than everything. Your page, the newest thing here, already settling in.' },
      { text: 'Have some water. It is nobody\'s to sell.' },
    ],
  },
};

/** The well speaks for the ending; map-tagged so the Andes keep their own words elsewhere. */
export const RETURN_EXAMINES: Record<string, ExamineArm[]> = {
  well: [
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen', 'wish.nani'], not: ['story.end'] },
      node: 'c10.well.wishnani',
    },
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen', 'wish.road'], not: ['story.end'] },
      node: 'c10.well.wishroad',
    },
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen', 'wish.people'], not: ['story.end'] },
      node: 'c10.well.wishpeople',
    },
    {
      map: 'village',
      when: { has: ['c10.album.seen', 'c10.aurelio.seen', 'c10.pilar.seen'], not: ['story.end'] },
      node: 'c10.lastpage',
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
