import type { EventNode, ExamineArm, LetterDef, NodeMap, NpcDef } from '../schema';

/**
 * Mulmang-gol's people. Busan satoori by temperament: blunt, fast, warm
 * underneath, allergic to ceremony. Rules unchanged: nobody lectures, people
 * disagree, the wrong branch is the warmer scene, two short sentences.
 */

export const BUSAN_NPCS: NpcDef[] = [
  {
    id: 'sunhee',
    name: 'Sun-hee',
    map: 'busan',
    pos: [17, 12],
    range: 1,
    look: {
      skin: '#e0b68a',
      hair: '#241a12',
      cloth: '#b03a4a',
      stripe: '#f2e6d0',
      hat: '#d9694a',
      hatStyle: 'none',
      skirt: '#2e4a44',
    },
    entry: [
      { when: { not: ['c5.met.sunhee'] }, node: 'c5.sunhee.first' },
      { when: { has: ['c5.met.sunhee', 'c5.met.cook'], not: ['c5.sunhee2'] }, node: 'c5.sunhee.second' },
      { when: { has: ['c5.sunhee2', 'c5.met.mija'], not: ['c5.deom'] }, node: 'c5.sunhee.deom' },
      // Once the extra fish has made you a regular, the stall talks about the
      // lane's own business, which once included a foreigner in a queue.
      { when: { has: ['c5.deom'], not: ['c5.her'] }, node: 'c5.sunhee.her' },
      { node: 'c5.sunhee.idle' },
    ],
  },
  {
    id: 'cho',
    name: 'Old Man Cho',
    map: 'teahouse',
    pos: [4, 2],
    range: 0,
    look: {
      skin: '#d8ac80',
      hair: '#b8b2a6',
      cloth: '#7a8a96',
      stripe: '#e8e2d4',
      hat: '#8c8479',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c5.met.cho'] }, node: 'c5.cho.first' },
      { when: { has: ['c5.met.cho', 'c5.deom'], not: ['riddle.cho'] }, node: 'c5.cho.riddle' },
      { when: { has: ['riddle.cho'], not: ['c5.riddle2'] }, node: 'c5.cho.again' },
      { node: 'c5.cho.idle' },
    ],
  },
  {
    id: 'mija',
    name: 'Mi-ja',
    map: 'busan',
    pos: [12, 14],
    range: 0,
    look: {
      skin: '#dcae82',
      hair: '#2e2018',
      cloth: '#8a4a7d',
      stripe: '#f2e6d0',
      hat: '#c9a35f',
      hatStyle: 'none',
      skirt: '#54455c',
    },
    entry: [
      { when: { not: ['c5.met.mija'] }, node: 'c5.mija.first' },
      { when: { has: ['c5.met.mija'], not: ['c5.hotteok.done'] }, node: 'c5.mija.offer' },
      { when: { has: ['c5.hotteok.done'], not: ['c5.mija2'] }, node: 'c5.mija.after' },
      { when: { has: ['c5.hotteok.done'] }, node: 'c5.mija.again' },
      { node: 'c5.mija.idle' },
    ],
  },
  {
    id: 'daeho',
    name: 'Dae-ho',
    map: 'busan',
    pos: [13, 14],
    range: 1,
    look: {
      skin: '#cfa06f',
      hair: '#4a4038',
      cloth: '#4d6a44',
      stripe: '#c9a35f',
      hat: '#5c4630',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c5.met.daeho'] }, node: 'c5.daeho.first' },
      { when: { has: ['c5.hotteok.done'], not: ['c5.daeho2'] }, node: 'c5.daeho.props' },
      { node: 'c5.daeho.idle' },
    ],
  },
  {
    id: 'byeongok',
    name: 'Emo Byeong-ok',
    map: 'busan',
    pos: [5, 14],
    range: 1,
    look: {
      skin: '#d8a878',
      hair: '#3a2e24',
      cloth: '#a34a2a',
      stripe: '#e8dcc4',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#3c4a5c',
    },
    entry: [
      { when: { not: ['c5.met.cook'] }, node: 'c5.cook.first' },
      { when: { has: ['c5.met.cook'], not: ['c5.sticks.why'] }, node: 'c5.cook.ask' },
      { when: { has: ['c5.sticks.why'], not: ['c5.sikhye'] }, node: 'c5.cook.second' },
      { node: 'c5.cook.idle' },
    ],
  },
  {
    id: 'bak',
    name: 'Mr. Bak',
    map: 'busan',
    pos: [26, 13],
    range: 2,
    look: {
      skin: '#c99a68',
      hair: '#1c1410',
      cloth: '#3e5a77',
      stripe: '#8fcbe8',
      hat: '#2c3e57',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c5.met.bak'] }, node: 'c5.bak.first' },
      { node: 'c5.bak.idle' },
    ],
  },
  {
    id: 'gong',
    name: 'Mr. Gong',
    map: 'busan',
    pos: [37, 24],
    range: 0,
    look: {
      skin: '#d3a678',
      hair: '#2e2018',
      cloth: '#2c3e57',
      stripe: '#e8dcc4',
      hat: '#2c3e57',
      hatStyle: 'montera',
    },
    entry: [
      { when: { not: ['c5.met.gong'] }, node: 'c5.gong.first' },
      {
        when: {
          has: ['c5.met.gong', 'c5.deom', 'riddle.cho', 'c5.hotteok.done', 'joseph.letter'],
          not: ['c5.complete'],
        },
        node: 'c5.gong.berth',
      },
      {
        when: { has: ['c5.met.gong', 'c5.deom', 'riddle.cho', 'c5.hotteok.done'], not: ['c5.complete'] },
        node: 'c5.gong.berth2',
      },
      { when: { has: ['c5.complete'] }, node: 'c5.gong.sail' },
      { node: 'c5.gong.not' },
    ],
  },
  {
    // Hana day-trips over on the Shimonoseki ferry, as she has since cadet
    // days. Present only while the chapter is live; the evening boat is at six.
    id: 'hanaC5',
    name: 'Hana',
    map: 'busan',
    when: { has: ['c5.arrived'], not: ['c5.complete'] },
    pos: [35, 25],
    range: 1,
    look: {
      skin: '#e8c39a',
      hair: '#241a12',
      cloth: '#2c3e57',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c5.met.hana5'] }, node: 'c5.hana.dock' },
      { when: { has: ['c5.met.hana5'], not: ['c5.hana.quizzed'] }, node: 'c5.hana.quiz' },
      { node: 'c5.hana.idle' },
    ],
  },
  {
    // At the alley's north corner, not in it: the corridor is two tiles wide
    // and she needs it empty to shoot down it anyway.
    id: 'chascaC5',
    name: 'Chasca',
    map: 'busan',
    pos: [29, 15],
    range: 0,
    look: {
      skin: '#c98f5e',
      hair: '#241a12',
      cloth: '#8a4a7d',
      stripe: '#8fcbe8',
      hat: '#d9694a',
      hatStyle: 'montera',
      skirt: '#54708a',
    },
    entry: [
      { when: { not: ['c5.met.chasca'] }, node: 'c5.chasca.alley' },
      { node: 'c5.chasca.album' },
    ],
  },
];

export const BUSAN_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c5.ex.wall': {
    lines: [{ text: "Painted block, patched and repainted, a ledger of winters. Somebody's phone number is fading under the newest coat." }],
  },
  // ---------------- arrival ----------------
  'c5.arrive': {
    lines: [
      { text: 'The ferry reached the harbor in the dark and then waited politely at anchor for the morning to open. You woke to gulls.' },
      { text: 'Now: diesel, salt, dawn the color of oyster shell. Container cranes stand along the water like orange giraffes at a trough.' },
      { text: 'Behind the quay, small houses climb the hill in stacked pastels, still holding last night’s lights. Somewhere close, sugar is frying.' },
    ],
    effects: ['set:c5.arrived'],
  },

  // ---------------- Sun-hee, the stall ----------------
  'c5.sunhee.first': {
    lines: [
      { text: 'The awning is red, the basins are red, and the mackerel lie nose to tail like a drawer of knives. A woman watches you look.' },
      { who: 'Sun-hee', text: 'Off the night ferry, still smelling of Japan. Buy nothing, fine, stand there. Looking is free today.' },
      { who: 'Sun-hee', text: 'Ajumma, you may call me. Say it like you mean somebody who works. Then it is a good word.' },
    ],
    effects: ['set:c5.met.sunhee', 'journal:people.sunhee', 'journal:words.ajumma'],
  },
  'c5.sunhee.second': {
    lines: [
      { who: 'Sun-hee', text: 'You came back. A face turns into a person around the second visit. Mackerel, or are you feeling rich?' },
      { who: 'Sun-hee', text: 'The auction is at five, chanted numbers, crates of ice. I was here for it. The lane sleeps late because it can afford to. It has us.' },
      { who: 'Sun-hee', text: 'My mother sold fish from this corner through some hard years. That is the whole story, and it fed three children.' },
    ],
    effects: ['set:c5.sunhee2', 'journal:customs.dawnmarket'],
  },
  'c5.sunhee.deom': {
    lines: [
      { text: 'Third visit. She weighs your mackerel, wraps it, then drops one small extra fish in the bag without a word or a glance.' },
      { text: 'You take the bag with one hand. She reaches over and tucks your other hand up under it herself, laughing.' },
      { who: 'Sun-hee', text: 'Two hands. A thing given is heavier than a thing bought. Carry it properly.' },
    ],
    effects: ['set:c5.deom', 'journal:words.deom', 'journal:customs.twohands'],
    choices: [
      { text: '"In Peru they call this yapa."', goto: 'c5.sunhee.yapa', when: { has: ['page.words.yapa'] } },
      { text: 'Ask what the extra fish is called', goto: 'c5.sunhee.deomword' },
      { text: 'Just say thank you, with both hands', goto: 'c5.sunhee.thanks' },
    ],
  },
  'c5.sunhee.yapa': {
    lines: [
      { who: 'Sun-hee', text: 'Yapa. Hm. Then Peru has good manners.' },
      { who: 'Sun-hee', text: 'Here it is deom. Nobody announces it. If you have to ask for it, it is not deom, it is haggling.' },
    ],
  },
  // The word arrives on the wrapping, not in a lecture: she wrote it before
  // you thought to ask. Backfills the yapa rhyme for players without the page.
  'c5.sunhee.deomword': {
    lines: [
      { text: 'She turns the wrapped fish over. 덤 is already there in grease pencil, and she taps it: deom, the little more riding on what you paid for.' },
      { who: 'Sun-hee', text: 'Not charity, not a discount. It means the scale is between friends now.' },
    ],
  },
  'c5.sunhee.thanks': {
    lines: [
      { who: 'Sun-hee', text: 'Mm. Both hands, no fuss. You learn fast for somebody off a ferry.' },
    ],
  },
  // She is not telling you a story. She is complaining about a queue.
  'c5.sunhee.her': {
    lines: [
      { text: 'She snaps heads off anchovies into a basin, four a second, without appearing to look at any of them. Her chin points down toward the post window.' },
      { who: 'Sun-hee', text: 'My mother sent me to that window on the last morning of every month. A foreign woman was always ahead of us, so it always took twice as long.' },
      { who: 'Sun-hee', text: 'The clerk called her name across the counter and the whole queue learned it. Zoila.' },
      { who: 'Sun-hee', text: 'She spelled her village for him every month and he wrote it wrong every month. Money going home, same day, same window.' },
      { who: 'Sun-hee', text: 'Half that queue was sending money somewhere. I was small. I thought she worked there.' },
    ],
    effects: ['set:c5.her', 'journal:her.busan'],
  },
  'c5.sunhee.idle': {
    lines: [
      { who: 'Sun-hee', text: 'Mackerel, hairtail, whatever the dawn decided. Come earlier tomorrow and argue with me properly.' },
    ],
  },

  // ---------------- Old Man Cho, the tea house ----------------
  'c5.cho.first': {
    lines: [
      { text: 'Shoes off at the step. Low tables, a kettle breathing, light coming through paper the color of morning.' },
      { who: 'Old Man Cho', text: 'You came up the stairs slowly. Did the market teach you that, or did you bring it with you?' },
      { text: 'He pours ssanghwacha, dark and sweet as bark and honey. He does not hurry it, and it does not hurry you.' },
    ],
    effects: ['set:c5.met.cho', 'journal:people.cho'],
    choices: [
      { text: '"The market taught me."', goto: 'c5.cho.a1' },
      { text: '"I brought it with me."', goto: 'c5.cho.a2' },
    ],
  },
  'c5.cho.a1': {
    lines: [
      { who: 'Old Man Cho', text: 'Did it? Then you were listening under the noise. What else did it say?' },
      { text: 'You drink the tea instead of answering. This appears to be the correct answer.' },
    ],
  },
  'c5.cho.a2': {
    lines: [
      { who: 'Old Man Cho', text: 'Did you? Then why did the ferry feel so long?' },
      { text: 'The kettle laughs first, in steam. You get there a moment later.' },
    ],
  },
  'c5.cho.riddle': {
    lines: [
      { who: 'Old Man Cho', text: 'The ajumma below gave you one fish too many. What do you call that, where you have walked?' },
      { who: 'Old Man Cho', text: 'Ayni, yapa, deom. You collect names for the same weightless thing.' },
      { who: 'Old Man Cho', text: 'Here, jeong.' },
      { text: 'He does not explain it. He refills your cup before it is empty, and nods at the kettle.' },
    ],
    effects: ['set:riddle.cho', 'journal:words.jeong'],
    choices: [
      { text: '"In the mountains they call it ayni. Help that comes back."', goto: 'c5.cho.ayni', when: { has: ['page.customs.ayni'] } },
      { text: 'Hold the question and drink the tea', goto: 'c5.cho.listen' },
    ],
  },
  'c5.cho.ayni': {
    lines: [
      { who: 'Old Man Cho', text: 'Ayni. So the mountain answers work with work, and the market answers fish with fish. And what answers time?' },
      { text: 'You suspect the tea is the answer, or a piece of it. He refills your cup before it is empty.' },
    ],
  },
  'c5.cho.listen': {
    lines: [
      { who: 'Old Man Cho', text: 'Where my wife grew up, help went up the valley and came back down in a different season. Nobody wrote it down, and nobody forgot.' },
      { who: 'Old Man Cho', text: 'The fish, the seed in the pancake, the plate that refills. One thing, many aprons. Keep counting the names.' },
    ],
  },
  'c5.cho.again': {
    lines: [
      { who: 'Old Man Cho', text: 'Still carrying my question? Good. Has it grown lighter, or have you grown stronger? Those feel the same from inside.' },
    ],
    effects: ['set:c5.riddle2'],
  },
  'c5.cho.idle': {
    lines: [{ who: 'Old Man Cho', text: 'More tea? The kettle is patient. Are you?' }],
  },

  // ---------------- Mi-ja and Dae-ho, the griddle ----------------
  'c5.mija.first': {
    lines: [
      { text: 'A round iron griddle, discs of dough going gold. The smell is sugar deciding to become caramel.' },
      { who: 'Mi-ja', text: 'Ssiat hotteok. Seeds in the fold, Busan style. Seoul sells it plain, which is their business and their loss.' },
      { who: 'Dae-ho', text: 'Thirty years she flips, I stuff. The marriage survives because we never swap jobs.' },
    ],
    effects: ['set:c5.met.mija', 'journal:people.hotteokcouple'],
    choices: [
      { text: 'Take the spatula', goto: 'c5.mija.start' },
      { text: 'Watch a round first', goto: 'c5.mija.watch' },
    ],
  },
  'c5.mija.start': {
    lines: [
      { who: 'Mi-ja', text: 'Press when the edge goes gold. Not before, not after. The griddle will tell you; listen with your eyes.' },
    ],
    effects: ['set:c5.hotteok.start'],
  },
  'c5.mija.watch': {
    lines: [
      { text: 'Press, sizzle, flip. She makes it look like the pancake does the work and she is only agreeing with it.' },
    ],
  },
  'c5.mija.offer': {
    lines: [{ who: 'Mi-ja', text: 'The spatula is still warm. Ready this time?' }],
    choices: [
      { text: 'Take the spatula', goto: 'c5.mija.start' },
      { text: 'Not just yet', goto: 'c5.mija.later' },
    ],
  },
  'c5.mija.later': {
    lines: [{ who: 'Mi-ja', text: 'The dough can wait. Not long, but it can.' }],
  },
  'c5.hotteok.flipped': {
    lines: [
      { text: 'The good ones go into paper cups, seeds spilling at the fold. Nothing that touched the griddle gets thrown away.' },
      { who: 'Mi-ja', text: 'Burnt ones are for the cook. That is the rule: nothing wasted, nobody shamed.' },
      { text: 'You eat yours too fast and the sugar lava finds your chin.' },
    ],
    effects: ['clear:c5.hotteok.start', 'set:c5.hotteok.done', 'journal:dishes.hotteok'],
  },
  'c5.mija.after': {
    lines: [
      { who: 'Mi-ja', text: 'The griddle likes you. It does not like everyone; ask my husband.' },
      { who: 'Dae-ho', text: 'It has never liked me. Thirty years.' },
    ],
    effects: ['set:c5.mija2'],
  },
  'c5.mija.again': {
    lines: [
      { who: 'Mi-ja', text: 'The line is thinning and the iron is still hot. Hands like yours should not stand around holding a paper cup.' },
    ],
    choices: [
      { text: 'Take the spatula again', when: { has: ['c5.hotteok.done'] }, goto: 'c5.mija.hotteokReplay' },
      { text: 'Just here for the eating today', goto: 'c5.mija.idle' },
    ],
  },
  'c5.mija.hotteokReplay': {
    lines: [
      { who: 'Mi-ja', text: 'Go on. Nothing to prove tonight. Press, gold, flip, and if one goes dark it is mine, same as always.' },
    ],
    effects: ['set:replay.mode', 'set:c5.hotteok.start'],
  },
  'c5.mija.idle': {
    lines: [{ who: 'Mi-ja', text: 'One more? The line forms behind the smell.' }],
  },
  'c5.daeho.first': {
    lines: [
      { who: 'Dae-ho', text: 'Sunflower, pumpkin, a little peanut. My grandfather ate hotteok exactly like this. Tradition, straight down the line.' },
      { who: 'Mi-ja', text: 'Your grandfather ate it plain with sugar and was glad. The seeds are younger than our marriage.' },
      { who: 'Dae-ho', text: 'A tradition is anything your wife has done for thirty years. I stand by it.' },
    ],
    effects: ['set:c5.met.daeho'],
  },
  'c5.daeho.props': {
    lines: [
      { who: 'Dae-ho', text: 'I saw the flip. Wrist, not elbow. You have worked dough before, or lied to it convincingly.' },
    ],
    effects: ['set:c5.daeho2'],
  },
  'c5.daeho.idle': {
    lines: [
      { who: 'Dae-ho', text: 'I count seeds and coins. Only one of the two is allowed to be approximate.' },
    ],
  },

  // ---------------- Emo Byeong-ok, the gukbap counter ----------------
  // Nobody explains the greeting or the dish: the bowl answers the one and is
  // the other. The gukbap page fills at the moment it lands.
  'c5.cook.first': {
    lines: [
      { text: 'A low counter under a tented stall, one pot the size of weather. The cook looks up from the ladle.' },
      { who: 'Emo Byeong-ok', text: 'Bap meogeosseo? Have you eaten?' },
    ],
    effects: ['journal:words.bapmeogeosseo'],
    next: 'c5.cook.meal',
  },
  'c5.cook.meal': {
    lines: [
      { text: 'A bowl lands before your answer does, milky and steaming. Then the table crowds itself: kimchi, greens, tiny fish, radish; you ordered one thing.' },
      { text: 'You park your chopsticks upright in the rice. Without a word, mid-sentence, she lays them flat across the bowl and keeps talking.' },
    ],
    effects: ['set:c5.met.cook', 'journal:dishes.gukbap', 'journal:customs.banchan'],
    choices: [
      { text: 'Ask why she moved your chopsticks', goto: 'c5.cook.sticks' },
      { text: 'Eat quietly and watch the table', goto: 'c5.cook.quiet' },
    ],
  },
  'c5.cook.sticks': {
    lines: [
      { who: 'Emo Byeong-ok', text: 'Standing up, they look like incense at a funeral rite. We do not point dinner at the dead.' },
      { who: 'Emo Byeong-ok', text: 'You did not know, so it cost nothing. Now you know. Eat.' },
    ],
    effects: ['set:c5.sticks.why'],
  },
  'c5.cook.quiet': {
    lines: [
      { text: 'The little plates empty and refill like tide pools. Nobody is charged for any of it, and nobody finds that remarkable but you.' },
    ],
  },
  'c5.cook.ask': {
    lines: [
      { text: 'You ask about the chopsticks, the way she moved them without a word.' },
      { who: 'Emo Byeong-ok', text: 'Upright, they are incense for the dead. At my table we feed the living.' },
      { who: 'Emo Byeong-ok', text: 'You did not know, so it cost nothing. Now you know. Eat.' },
    ],
    effects: ['set:c5.sticks.why'],
  },
  'c5.cook.second': {
    lines: [
      { who: 'Emo Byeong-ok', text: 'Sit. Say it first: jal meokkessumnida. I will eat well. You say it to the cook and to the food, both.' },
      { text: 'After, you offer the other half without being told: jal meogeossumnida. I ate well. Her nod is a whole paragraph.' },
      { text: 'She sets down a bowl of sikhye, sweet rice punch, unasked. "Service," she says, and that is all the explanation the extra ever gets here.' },
    ],
    effects: ['set:c5.sikhye', 'journal:words.jalmeok', 'journal:dishes.sikhye'],
  },
  'c5.cook.idle': {
    lines: [
      { who: 'Emo Byeong-ok', text: 'Bap meogeosseo? If yes, sit anyway. Broth waits better than people do.' },
    ],
  },

  // ---------------- Mr. Bak, who does not care that you exist ----------------
  'c5.bak.first': {
    lines: [
      { text: 'A hand cart stacked with ice crates takes the lane at ramming speed. You are, briefly, in the way.' },
      { who: 'Mr. Bak', text: 'Ppalli ppalli! Move, walk, live, whichever, but do it faster!' },
      { text: 'He is gone before your apology lands. He did not ask your name. He is never going to ask your name.' },
    ],
    effects: ['set:c5.met.bak'],
  },
  'c5.bak.idle': {
    lines: [
      { who: 'Mr. Bak', text: 'Still here? The ice is not.' },
      { text: 'The cart takes the corner on one wheel. Somewhere ahead, a fish is urgently expected.' },
    ],
  },

  // ---------------- Mr. Gong, ferry and freight ----------------
  'c5.gong.first': {
    lines: [
      { text: 'FERRY AND FREIGHT. The window is small, the stamp is loud, and the man behind both is faster than the stamp.' },
      { who: 'Mr. Gong', text: 'Name, destination, purpose, in that order and quickly. The boats respect neither of us.' },
    ],
    effects: ['set:c5.met.gong'],
    choices: [
      { text: 'Show him the address on Joseph’s letter', goto: 'c5.gong.letter', when: { has: ['joseph.letter'] } },
      { text: 'Ask about passage to Kerala', goto: 'c5.gong.ask' },
    ],
  },
  'c5.gong.letter': {
    lines: [
      { text: 'You show the envelope from the Yacana: Joseph’s careful handwriting, an address in Kerala, a mother’s name.' },
      { who: 'Mr. Gong', text: 'Joseph? I know this family. His cousin Thomas runs a freighter to Kochi out of this office. Keep the letter; deliver it with your own hands.' },
      { who: 'Mr. Gong', text: 'Berths on that boat are vouched, not sold. So go be vouched for. The lane decides these things, not me. Ppalli ppalli.' },
    ],
  },
  'c5.gong.ask': {
    lines: [
      { who: 'Mr. Gong', text: 'Kochi. There is a freighter, the Malabar Star, run by the cousin of a sailor this office trusts. Berths are vouched, not sold.' },
      { who: 'Mr. Gong', text: 'Let the market know you first. Then come back, and bring that quickly.' },
    ],
  },
  'c5.gong.berth': {
    lines: [
      { who: 'Mr. Gong', text: 'The ajumma vouches, the tea house vouches, even the griddle couple vouches. That is three more than most passengers get.' },
      { who: 'Mr. Gong', text: 'Thomas sails for Kochi on the evening tide. Joseph’s letter rides with you, so his mother gets it from warm hands, not a mailbag.' },
      { text: 'The stamp comes down like a small decision. Berth: one. Galley duty: assumed.' },
    ],
    effects: ['set:c5.complete'],
  },
  'c5.gong.berth2': {
    lines: [
      { who: 'Mr. Gong', text: 'The lane vouches for you, all of it, which is rare and slightly suspicious. Berth on the Malabar Star, evening tide.' },
      { text: 'The stamp comes down like a small decision. Kochi, then. The map keeps unrolling south.' },
    ],
    effects: ['set:c5.complete'],
  },
  'c5.gong.sail': {
    lines: [
      { who: 'Mr. Gong', text: 'The Malabar Star loads at dusk. Board now, or make your bows first. Either way, do it ppalli ppalli.' },
    ],
    choices: [
      { text: 'Board for Kochi', goto: 'c5.gong.go' },
      { text: 'Not yet. The lane deserves goodbyes.', goto: 'c5.gong.stay' },
    ],
  },
  'c5.gong.go': {
    lines: [
      { text: 'The gangway bounces underfoot. Busan stacks itself up the hill behind you, pastel over pastel, cranes waving a slow orange goodbye.' },
    ],
    effects: ['travel:kerala'],
  },
  'c5.gong.stay': {
    lines: [{ who: 'Mr. Gong', text: 'Sentiment. Fine. The tide is less flexible than I am.' }],
  },
  'c5.gong.not': {
    lines: [
      { who: 'Mr. Gong', text: 'Berths are vouched, not bought, and the lane has not finished with you. Fish stall, tea house, griddle. Go.' },
    ],
  },

  // ---------------- Hana, over on the day boat ----------------
  'c5.hana.dock': {
    lines: [
      { text: 'A familiar figure stands by the ferry office, sea bag on one shoulder, weighing two paper sacks of dried anchovies like a jeweler.' },
      { who: 'Hana', text: 'You! Of course you. Over on the Shimonoseki day boat, my old cadet run, and here you are, smelling of the same harbor as me.' },
      { who: 'Hana', text: 'The iriko is for Obaachan’s dashi. Busan iriko is a controversial opinion at home, so we call it mine and eat it anyway.' },
    ],
    effects: ['set:c5.met.hana5'],
  },
  'c5.hana.quiz': {
    lines: [
      { who: 'Hana', text: 'Before my boat back: an examination. Did Shionoura stick, or did it wash off in the strait? One question, and you choose the question.' },
    ],
    effects: ['set:c5.hana.quizzed'],
    choices: [
      { text: '"The goldfish uncle acts fierce, but the poi never sinks on a kid."', goto: 'c5.hana.kingyo', when: { has: ['c4.kingyo.done'] } },
      { text: '"I hung a tanzaku. And no, I am not telling you what it said."', goto: 'c5.hana.wish', when: { has: ['wish.written'] } },
      { text: '"I respectfully fail. Grade me on eating instead."', goto: 'c5.hana.fail' },
    ],
  },
  'c5.hana.kingyo': {
    lines: [
      { who: 'Hana', text: 'Rigged mercy! You found him out. He has bankrupted grown men at that stall and never once let a child walk away empty. Full marks.' },
      { who: 'Hana', text: 'Taro audits him every festival, for science. The uncle pretends not to know he is being tested.' },
    ],
  },
  'c5.hana.wish': {
    lines: [
      { who: 'Hana', text: 'Correct, and you passed a test I did not set. You never say a tanzaku out loud; the paper is small so the wish stays yours.' },
      { who: 'Hana', text: 'So I will not ask. I will only say the bamboo held a whole town of hopes this year, and one strip of it had your handwriting.' },
    ],
  },
  'c5.hana.fail': {
    lines: [
      { who: 'Hana', text: 'Ha! An honest failure. Shionoura accepts eating as a second language, and you were fluent by festival night.' },
      { who: 'Hana', text: 'The model answer was the goldfish uncle. All that scowling, and the poi never once sinks on a kid. Rigged mercy, our proudest export.' },
      { who: 'Hana', text: 'Graded on appetite instead: pass, with distinction. Do not tell Obaachan the examiner could be bribed with honesty.' },
    ],
  },
  'c5.hana.idle': {
    lines: [
      { who: 'Hana', text: 'The evening boat back is at six, and it will be three minutes early. Some things you can lean your whole life against.' },
    ],
  },

  // ---------------- Chasca, in the dried-fish alley ----------------
  'c5.chasca.alley': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! You crossed a whole ocean and still walk like the road is a friend. Perfect. Do not move.' },
      { text: 'She frames the dried-fish alley: silver rows on strings, steam drifting through, you in the middle of the weather it makes.' },
      { who: 'Chasca', text: 'The album needed a street that smells like this. Say fuzzy pickles!' },
    ],
    effects: ['set:c5.met.chasca', 'set:photo.flash', 'set:photo.c5.alley'],
    choices: [
      { text: 'Ask about the photo from the pier', goto: 'c5.chasca.pier', when: { has: ['photo.c2.pier'] } },
      { text: 'Ask how the album is growing', goto: 'c5.chasca.why' },
    ],
  },
  'c5.chasca.pier': {
    lines: [
      { who: 'Chasca', text: 'You at the pier, the reed horses on end, the fog like a lid? Still undeveloped, still perfect.' },
      { who: 'Chasca', text: 'This one goes beside it. Sea to sea, and you a little saltier in the second.' },
    ],
  },
  'c5.chasca.why': {
    lines: [
      { who: 'Chasca', text: 'The album is turning into a route. I have stopped pretending otherwise.' },
    ],
  },
  'c5.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'No second picture in the same town. The first one is true; the second one starts posing.' },
    ],
  },

  // ---------------- the post window ----------------
  'c5.post.pilar': {
    lines: [
      { text: 'A postal window the size of a biscuit tin. The clerk inside produces an envelope addressed in handwriting like an invoice.' },
    ],
    effects: ['letter:c5.pilar'],
  },
  'c5.post.marisol': {
    lines: [
      { text: 'The clerk holds up one finger, checks a pigeonhole, and slides out a second envelope smelling faintly of newspaper and salt.' },
    ],
    effects: ['letter:c5.marisol'],
  },
  'c5.post.idle': {
    lines: [
      { text: 'MULMANG-GOL POST. Window open, clerk asleep with great dignity. No more mail for you today.' },
    ],
  },

  // ---------------- examines, market ----------------
  'c5.ex.lane': {
    lines: [
      { text: 'Paving stones dark with hose water and fish scales. The lane gets washed before the town wakes; the ajummas see to it.' },
    ],
  },
  'c5.ex.awning': {
    lines: [
      { text: 'A stall awning, patched where patched, bright where bright. Under it the morning catch is arranged like an argument you will lose.' },
    ],
  },
  'c5.ex.hongawning': {
    lines: [
      { text: 'The red awning, three times the width of its neighbors, a bulb burning under it since four. You can find this stall from the quay.' },
      { text: 'Mackerel nose to tail on crushed ice, basins half unpacked underneath, a scale swinging off the post. The morning is run from here.' },
    ],
  },
  // Once you have received the deom, the stall visibly keeps the habit.
  'c5.ex.hongawning2': {
    lines: [
      { text: 'The red awning, the scale, the ice. At the scale’s elbow one small fish sits already wrapped: somebody’s deom, riding ahead of its buyer.' },
    ],
  },
  'c5.ex.barrow': {
    lines: [
      { text: 'A two-wheel barrow, tipped on its legs mid-errand, half its load already off. The lane keeps its middle clear so these can get through.' },
    ],
  },
  'c5.ex.rack': {
    lines: [
      { text: 'Racks of drying fish, silver going gold in rows. The smell is ammonia-sweet and absolute; your coat has decided to keep it.' },
    ],
  },
  'c5.ex.basin': {
    lines: [
      { text: 'A red basin of seawater, fish nosing the rim. The whole market runs on these: one basin, one knife, one formidable woman.' },
    ],
  },
  'c5.ex.vent': {
    lines: [{ text: 'A grate breathing steam up from some kitchen below. The lane wears it like a scarf.' }],
  },
  'c5.ex.eomuk1': {
    lines: [
      { text: 'Eomuk skewers stand in salty broth, a kettle of it steaming. A ladle and paper cups wait on the honor system.' },
      { text: 'You sip. Warmth goes down like a lit hallway. The broth is free, and that is not an accident, it is a philosophy.' },
    ],
    effects: ['set:c5.eomuk', 'journal:dishes.eomuk'],
  },
  'c5.ex.eomuk2': {
    lines: [{ text: 'The broth kettle steams on. You are developing a taste for standing soup.' }],
  },
  'c5.ex.griddle': {
    lines: [
      { text: 'The griddle idles between rushes, shining with oil. Three dents in the iron mark thirty years of the same flip.' },
    ],
  },
  // After your batch, the iron shows it: the game leaves a trace on the prop.
  'c5.ex.griddle2': {
    lines: [
      { text: 'The griddle rests wiped and oiled, seasoned a shade darker where your batch went down. One of the three dents knows your wrist now.' },
    ],
  },
  'c5.ex.hill': {
    lines: [
      { text: 'Houses stacked up the hillside in pastel steps, each roof somebody’s floor. Refugees built them; their grandchildren painted them.' },
    ],
  },
  'c5.ex.crane': {
    lines: [
      { text: 'The cranes swing boxes ashore all night. By dawn the ship rides higher, unburdened.' },
    ],
  },
  'c5.ex.teahouse': {
    lines: [
      { text: 'A wooden tea house above the market noise, paper windows glowing faintly. The door stands open the width of an invitation.' },
    ],
  },
  'c5.ex.ferrysign': {
    lines: [
      { text: 'FERRY AND FREIGHT: SHIMONOSEKI, KOCHI, PLACES THE STAMP CAN REACH. Below, smaller: BERTHS VOUCHED, NOT SOLD.' },
    ],
  },
  'c5.ex.kettle': {
    lines: [
      { text: 'The kettle mutters to itself on the brazier. Cho says it is the only thing in the room allowed to hurry.' },
    ],
  },
  'c5.ex.lamp': {
    lines: [
      { text: 'A lamp of hanji paper on a wooden post. The light comes through the way morning comes through fog: filtered and warm.' },
    ],
  },
  'c5.ex.ondol': {
    lines: [
      { text: 'The floor is warm underfoot. The fire lives under the room, and the whole house sits in its lap.' },
    ],
  },
  'c5.ex.bench': {
    lines: [
      { text: 'A bench polished by decades of aunties resting exactly here. It is the true town hall.' },
    ],
  },
  'c5.ex.farol': {
    lines: [
      { text: 'A harbor lamp still burning against the dawn. By night an orange tent bar glows under it; by day the lamp just remembers one.' },
    ],
  },
  'c5.ex.crate': {
    lines: [
      { text: 'Fish crates packed with chipped ice. Numbers were chanted over these at the dawn auction, hours before you woke.' },
    ],
  },
  // The century of the crossing lives here now, where the boat itself is the
  // thing in front of you, instead of in a stranger's speech on arrival.
  'c5.ex.pier': {
    lines: [
      { text: 'Quay concrete and old timber, rinsed by decades of tides and hoses. The overnight ferry dwarfs everything, gently.' },
      { text: 'It has made this crossing for most of a century.' },
    ],
  },
  'c5.ex.sea': {
    lines: [
      { text: 'Harbor water, dawn-grey, an oil-sheen rainbow at the pilings. Gulls work it end to end.' },
    ],
  },
  'c5.ex.gukbap': {
    lines: [
      { text: 'A counter, low stools, one pot going since before dawn. The menu is the smell, and the smell is generous.' },
    ],
  },
  'c5.ex.teatable': {
    lines: [
      { text: 'A low table, knee height, older than the room. The floor is the chair here; it has always been the honest altitude.' },
    ],
  },
  'c5.ex.stool': {
    lines: [
      { text: 'A low wooden stool, tea-colored where forty years of hands have steadied it. Sitting here is permission for the kettle to take its time.' },
    ],
  },

  // ---------------- examines, the clutter the lane is made of ----------------
  'c5.ex.basinstack': {
    lines: [
      { text: 'Red plastic basins stacked a head higher than the woman who owns them. Down at dawn, up by noon, rinsed and in order.' },
      { text: 'The count has never once been wrong. Ask the man who tried to borrow one.' },
    ],
  },
  'c5.ex.squidline': {
    lines: [
      { text: 'Dried squid pinned to the line like laundry, arms down, very flat, very surprised. The alley smell starts here and never really ends.' },
    ],
  },
  'c5.ex.onggi1': {
    lines: [
      { text: 'Onggi jars, brown-glazed, warm where the sun has been. Each one belongs to a different grandmother, and every lid sits like a signature.' },
      { text: 'Mixing them up has started feuds. The jars know whose they are; the trick is that the grandmothers know too.' },
    ],
    effects: ['set:c5.onggi.looked'],
  },
  'c5.ex.onggi2': {
    lines: [
      { text: 'You lift a lid one polite centimeter. Kimchi, months deep into its education; you set the lid back exactly as its grandmother left it.' },
    ],
  },
  'c5.ex.chilimat': {
    lines: [
      { text: 'Gochugaru chilies drying on a woven mat, red as a siren and twice as serious. A whole winter of kimchi is sunbathing at your feet.' },
    ],
  },
  'c5.ex.foambox': {
    lines: [
      { text: 'Styrofoam boxes in a wobbly white tower. The marker on each lid names a fish, a weight, and an auntie who will notice if either is wrong.' },
    ],
  },
  'c5.ex.foambox2': {
    lines: [
      { text: 'One stack is markered KOCHI and taped apart from the rest. The evening tide is already being packed for.' },
    ],
  },
  'c5.ex.parasol': {
    lines: [
      { text: 'A market parasol faded to the color of weak tea, leaning with intent. Under it, one plastic stool: the throne of whoever sat down first.' },
    ],
  },
  'c5.ex.scooter': {
    lines: [
      { text: 'A delivery scooter under a bungeed tower of boxes three times its height. The driver calls the load light; the lane calls him a legend.' },
    ],
  },
  'c5.ex.lotusline': {
    lines: [
      { text: 'Lotus lanterns strung pole to pole, left up from the last festival or early for the next. Nobody takes them down; hope keeps well.' },
    ],
  },
  'c5.ex.magpie1': {
    lines: [
      { text: 'A magpie on the wire, black, white, and certain. The old belief says its chatter means good news, or a welcome guest on the way.' },
    ],
  },
  'c5.ex.magpie2': {
    lines: [
      { text: 'The magpie chatters twice and bobs on its wire. Good news coming, says the old belief; the evening tide, says the ferry office. Same thing.' },
    ],
  },
  'c5.ex.pricewall': {
    lines: [
      { text: 'A wall of hand-written price signs taped over each other for years. Somewhere in the under-layers, mackerel still costs what it used to.' },
    ],
  },
  'c5.ex.hosecoil': {
    lines: [
      { text: 'A green hose coiled by the drain, still dripping. It washed the whole lane before you woke and will do it again before you wake tomorrow.' },
    ],
  },
  'c5.ex.bootfence': {
    lines: [
      { text: 'Rubber boots drying upside down on the fence posts. Read left to right: small, small, large, patched, and one retired with honors.' },
    ],
  },
  'c5.ex.steamerstack': {
    lines: [
      { text: 'The tteok shop’s wooden steamers, stacked and faintly breathing sweet rice. The sign says closed; the smell says any minute now.' },
    ],
  },
  'c5.ex.handrail': {
    lines: [
      { text: 'A green handrail up the hill steps, with a plastic stool parked exactly halfway. The stool is a signed confession: the hill won.' },
    ],
  },
  'c5.ex.cat1': {
    lines: [
      { text: 'A cat asleep on a styrofoam lid, curled like a comma in the market’s long sentence. It sleeps beside a ton of fish; it has solved life.' },
    ],
    effects: ['set:c5.cat.seen'],
  },
  'c5.ex.cat2': {
    lines: [
      { text: 'One eye opens to a slit, files you under harmless, and closes. You have been processed.' },
    ],
  },
  // The dressing moves the cat to the stall once the extra fish is a habit.
  'c5.ex.cat.stall': {
    lines: [
      { text: 'The cat has moved offices to Sun-hee’s corner, one eye on the ice. Where extra fish happen, it reasons, more can be arranged.' },
    ],
  },
  'c5.ex.gullpost': {
    lines: [
      { text: 'The rope holds the ferry, the bollard holds the rope, and the gull holds the bollard. Everyone on this quay has a job.' },
    ],
  },
  'c5.ex.shoerow': {
    lines: [
      { text: 'Shoes lined at the step, toes pointed out the door, ready before their owners are. Past this line, the warm floor belongs to socks.' },
    ],
  },
  'c5.ex.steamerstack.tea': {
    lines: [
      { text: 'Cho’s steamers stacked inside the door, lid slightly askew on the top one. Rice cakes on the days he decides there are rice cakes.' },
    ],
  },
  'c5.ex.onggi.tea': {
    lines: [
      { text: 'A single onggi at the end of the counter, lid weighted with a river stone. Not kimchi: this one holds last spring’s leaves, and he is rationing them.' },
    ],
  },
  'c5.ex.cat.tea': {
    lines: [
      { text: 'The tea house cat, laid out flat on the warmest square of the ondol floor, in the exact spot the briquettes are under.' },
    ],
  },
  'c5.ex.goboard': {
    lines: [
      { text: 'A baduk board mid-game, abandoned with honor. Black is losing politely, and both players intend to finish some other decade.' },
    ],
  },
  'c5.ex.yeontan': {
    lines: [
      { text: 'Yeontan briquettes, grey as old moons, air holes lined up neat. Every warm thing here, ondol floor or griddle, is in their debt.' },
    ],
  },
  'c5.ex.tuft': {
    lines: [
      { text: 'Weeds in the yard corners, unmoved by commerce. The hill keeps sending green down between the houses to check on everyone.' },
    ],
  },
  'c5.ex.wallhanji': {
    lines: [
      { text: 'Hanji papered over lath, gone the colour of the floor it warms. Where the sun has found it for sixty years it is nearly translucent.' },
      { text: 'Somebody has patched a tear with a square of newer paper. It is a different white, and it will match in about ten years.' },
    ],
  },
};

/** Examine arms; shared props keep their coastal words at home via map tags. */
export const BUSAN_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'busan', node: 'c5.ex.wall' }, { map: 'teahouse', node: 'c5.ex.wall' }],
  // Cho's wall is papered hanji, not Andean adobe: skinned in
  // `art/sets/busan.ts`, worded here.
  wallInt: [{ map: 'teahouse', node: 'c5.ex.wallhanji' }],
  lanepave: [{ node: 'c5.ex.lane' }],
  awning: [{ node: 'c5.ex.awning' }],
  hongawning: [
    { when: { has: ['c5.deom'] }, node: 'c5.ex.hongawning2' },
    { node: 'c5.ex.hongawning' },
  ],
  barrow: [{ node: 'c5.ex.barrow' }],
  fishrack: [{ node: 'c5.ex.rack' }],
  basin: [{ node: 'c5.ex.basin' }],
  steamvent: [{ node: 'c5.ex.vent' }],
  eomukcart: [
    { when: { not: ['c5.eomuk'] }, node: 'c5.ex.eomuk1' },
    { node: 'c5.ex.eomuk2' },
  ],
  hotteokcart: [
    { when: { has: ['c5.hotteok.done'] }, node: 'c5.ex.griddle2' },
    { node: 'c5.ex.griddle' },
  ],
  hillhouses: [{ node: 'c5.ex.hill' }],
  crane: [{ node: 'c5.ex.crane' }],
  teahouse: [{ node: 'c5.ex.teahouse' }],
  ferrysign: [{ node: 'c5.ex.ferrysign' }],
  postwindow: [
    { when: { not: ['letter.read.c5.pilar'] }, node: 'c5.post.pilar' },
    { when: { has: ['letter.read.c5.pilar'], not: ['letter.read.c5.marisol'] }, node: 'c5.post.marisol' },
    { node: 'c5.post.idle' },
  ],
  kettle: [{ node: 'c5.ex.kettle' }],
  hanjilamp: [{ node: 'c5.ex.lamp' }],
  floorOndol: [{ node: 'c5.ex.ondol' }],
  bench: [{ map: 'busan', node: 'c5.ex.bench' }],
  farol: [{ map: 'busan', node: 'c5.ex.farol' }],
  crate: [{ map: 'busan', node: 'c5.ex.crate' }],
  pierdeck: [{ map: 'busan', node: 'c5.ex.pier' }],
  sea: [{ map: 'busan', node: 'c5.ex.sea' }],
  stall: [{ map: 'busan', node: 'c5.ex.gukbap' }],
  table: [{ map: 'teahouse', node: 'c5.ex.teatable' }],
  stool: [{ map: 'teahouse', node: 'c5.ex.stool' }],
  tuft: [{ map: 'busan', node: 'c5.ex.tuft' }],
  basinstack: [{ node: 'c5.ex.basinstack' }],
  squidline: [{ node: 'c5.ex.squidline' }],
  onggi: [
    { map: 'teahouse', node: 'c5.ex.onggi.tea' },
    { when: { not: ['c5.onggi.looked'] }, node: 'c5.ex.onggi1' },
    { node: 'c5.ex.onggi2' },
  ],
  chilimat: [{ node: 'c5.ex.chilimat' }],
  foambox: [
    { when: { has: ['c5.complete'] }, node: 'c5.ex.foambox2' },
    { node: 'c5.ex.foambox' },
  ],
  parasol: [{ node: 'c5.ex.parasol' }],
  scooter: [{ node: 'c5.ex.scooter' }],
  lotusline: [{ node: 'c5.ex.lotusline' }],
  magpie: [
    { when: { has: ['c5.complete'] }, node: 'c5.ex.magpie2' },
    { node: 'c5.ex.magpie1' },
  ],
  pricewall: [{ node: 'c5.ex.pricewall' }],
  hosecoil: [{ node: 'c5.ex.hosecoil' }],
  bootfence: [{ node: 'c5.ex.bootfence' }],
  steamerstack: [
    { map: 'teahouse', node: 'c5.ex.steamerstack.tea' },
    { node: 'c5.ex.steamerstack' },
  ],
  handrail: [{ node: 'c5.ex.handrail' }],
  marketcat: [
    { map: 'teahouse', node: 'c5.ex.cat.tea' },
    { when: { has: ['c5.deom'] }, node: 'c5.ex.cat.stall' },
    { when: { not: ['c5.cat.seen'] }, node: 'c5.ex.cat1' },
    { node: 'c5.ex.cat2' },
  ],
  gullpost: [{ node: 'c5.ex.gullpost' }],
  shoerow: [{ node: 'c5.ex.shoerow' }],
  goboard: [{ node: 'c5.ex.goboard' }],
  yeontan: [{ node: 'c5.ex.yeontan' }],
};

/** Event-triggered nodes, listed with gating so tests can prove them reachable. */
export const BUSAN_EVENTS: EventNode[] = [
  { node: 'c5.arrive' },
  { when: { has: ['c5.hotteok.start'] }, node: 'c5.hotteok.flipped' },
];

/** Mail waiting at the tiny post window. */
export const BUSAN_LETTERS: LetterDef[] = [
  {
    id: 'c5.pilar',
    from: 'Pilar, Museum of the Sea (Gift Shop Division)',
    when: { has: ['c2.gift.sent'] },
    body: [
      'Dear co-owner. Museum attendance is steady. Admission remains one fact, but facts about Korea will be accepted at a favorable exchange rate.',
      'The sea thing you mailed has been promoted to Exhibit A. Visitors ask if it is real. I charge a second fact for the answer.',
      'NEW: the museum has a GIFT SHOP. Inventory: rocks. Customers say they recognize them from my first enterprise. Correct. Provenance doubles the price.',
      'Send nothing this time. The shelf is full. This is not sentiment, it is inventory management.',
    ],
  },
  {
    id: 'c5.pilar',
    from: 'Pilar, Museum of the Sea',
    body: [
      'Dear traveler. The museum thrives. The gift shop opened Tuesday. It sells rocks.',
      'Some customers claim they saw these rocks in an earlier scheme of mine. Correct. The rocks have experience now, and experienced rocks cost more.',
      'The dog has opinions about the gift shop. As he pays in neither facts nor money, they are noted and ignored.',
    ],
  },
  {
    id: 'c5.marisol',
    from: 'Marisol, the stall on the malecón',
    when: { has: ['c2.casero'] },
    body: [
      'Casero. The harbor office swears this will find you in Korea, which I only half believe, so I keep it short in case the ocean reads it.',
      'The bonito came back the week you left. Typical. Your fish waits for no one, but your stall remembers you.',
      'They tell me the markets there are run by the aunties. Of course they are, pe. Learn their word for the yapa and bring it home to me.',
    ],
  },
  {
    id: 'c5.marisol',
    from: 'Marisol, fishmonger of La Caleta',
    body: [
      'You bought fish from me once, maybe twice. Not enough for the yapa, but enough for a letter, it seems.',
      'The stall stands, the sea provides, the pelican is still a criminal. Come back someday and make a habit of us.',
    ],
  },
];
