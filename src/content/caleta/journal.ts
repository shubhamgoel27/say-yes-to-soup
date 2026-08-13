import type { JournalEntry } from '../schema';
import type { TaskDef } from '../../ui/journal';

/**
 * The coastal pages of Nani's journal. She came down this road in 1974; the
 * salt got into her handwriting. Where a page is blank, she sailed past it.
 */

export const CALETA_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.yapa',
    tab: 'words',
    title: 'Yapa',
    sub: 'The little extra. From Quechua yapay, "to add." Never asked for, never mentioned.',
    nani: 'Bought fish from the same woman six days running. On the seventh there was one small fish more, and no explanation. I cried a little behind the church.',
    you: 'Earned mine on the third visit. Marisol dropped it on the scale without looking, the way you do things that are laws.',
    rhyme: {
      with: 'customs.ayni',
      note: 'The coast says yapa, the mountain says ayni. Two altitudes, one circle. The circle does not care about altitude.',
    },
  },
  {
    id: 'words.pe',
    tab: 'words',
    title: 'Pe',
    sub: 'Coastal punctuation. Lands at the end of sentences like a gull on a post.',
    nani: 'Nobody could tell me what it means. It means the sentence is finished and you are among friends, I think.',
    you: 'Untranslatable, pe. You just start saying it.',
  },
  {
    id: 'words.chevere',
    tab: 'words',
    title: 'Chévere',
    sub: 'Excellent, cool, exactly right.',
    you: 'Rafa rates everything chévere: waves, strangers, corn cakes, the fog. It might be a philosophy dressed as a word.',
  },
  {
    id: 'words.causa',
    tab: 'words',
    title: 'Causa',
    sub: 'Friend, brother-in-arms. "Habla causa": talk to me, friend.',
    you: 'Rafa says it fifty times a day, and once, memorably, while apologizing. It counted double that time.',
  },
  {
    id: 'words.altoque',
    tab: 'words',
    title: 'Al toque',
    sub: 'Right away. Immediately. In theory.',
    nani: 'Everything here is promised al toque and arrives when the sea permits. Both halves are sincere.',
    you: 'A sudado does not like to wait, so for fish, al toque is real. For everything else it is a beautiful intention.',
  },
  {
    id: 'words.lamar',
    tab: 'words',
    title: 'La mar',
    sub: 'The sea, feminine. The word used by the people she carries.',
    nani: 'A fisherman corrected my article and I have never been so glad to be wrong. El mar is a postcard. La mar is a person.',
    you: 'Don Simón: fifty years aboard her, and he still lowers his voice slightly when he says it.',
  },
  {
    id: 'words.choclo',
    tab: 'words',
    title: 'Choclo',
    sub: 'Big-kernel corn, down from the valleys. Quechua, worn smooth by coastal mouths.',
    you: 'Toasted it becomes cancha, eaten by the fistful while the ceviche makes you wait. The waiting is part of the recipe.',
    rhyme: {
      with: 'dishes.mote',
      note: 'Same corn, boiled in the mountains, grinning beside fish on the coast. I ate both inside one week and felt rich.',
    },
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.ceviche',
    tab: 'dishes',
    title: 'Ceviche',
    sub: 'Dawn-caught fish, a minutes-long kiss of lime, red onion, ají. Noon to three, never later.',
    nani: 'The bread here is not worth the walk, but the ceviche is worth the whole continent.',
    you: 'Bright as a slap and gentler. Petro says it is a clock, not a dish, and the clock says noon.',
  },
  {
    id: 'dishes.lechedetigre',
    tab: 'dishes',
    title: 'Leche de tigre',
    sub: "The ceviche's marinade, served as its own small fierce glass.",
    you: 'Tiger’s milk: for courage, for hangovers, for existing. Everything in Petro’s house works twice.',
  },
  {
    id: 'dishes.sudado',
    tab: 'dishes',
    title: 'Sudado',
    sub: 'Fish steamed in its own argument: tomato, onion, ají, a hiss of chicha de jora.',
    nani: 'The evening answer to the noon question. A folk cure for long nights; I can confirm it cures long roads.',
    you: 'Made with the lisa I carried through the fog. Being an ingredient in the errand improves the flavor.',
  },
  {
    id: 'dishes.emoliente',
    tab: 'dishes',
    title: 'Emoliente',
    sub: 'Hot barley-and-herb glass from a cart that keeps the hours nobody else wants.',
    you: 'Tastes like a field that decided to be tea. Don Wili serves it before dawn and after dark, the day’s two parentheses.',
  },
  {
    id: 'dishes.chicharron',
    tab: 'dishes',
    title: 'Chicharrón de pescado',
    sub: 'Fish fried gold, eaten standing, ideally Sunday.',
    you: 'One vice, one cure, says Wili, selling the cure. The system is closed and perfect.',
  },
  {
    id: 'dishes.tortitas',
    tab: 'dishes',
    title: 'Tortitas de choclo',
    sub: 'Corn cakes, crisp at the edge, sweet in the middle. What the pots said today.',
    nani: 'There is no menu at the picantería. There is a woman and there are pots and you are grateful.',
    you: 'The person beside me passed the ají without being asked. That gesture is the actual national dish.',
  },

  // ---------------- people ----------------
  {
    id: 'people.marisol',
    tab: 'people',
    title: 'Marisol',
    sub: 'Fishmonger. Runs the stall, the ledger, and by extension the morning.',
    you: '"Ellos capturan, nosotras administramos." The men catch. The women run everything else, which is everything else.',
  },
  {
    id: 'people.simon',
    tab: 'people',
    title: 'Don Simón',
    sub: 'Fifty years on la mar. Mends nets and articles of speech.',
    nani: 'An old man on the pier corrected my Spanish and fed me half his lunch. The order of operations matters.',
    you: 'His hands mend line without being watched. His schedule is: no hay horario. Todo depende de la mar.',
  },
  {
    id: 'people.nilda',
    tab: 'people',
    title: 'Nilda',
    sub: 'Born of two altitudes: coast on the outside, sierra in the blood.',
    you: 'Shut down a lazy joke with one sentence about her mother, then taught me slang like nothing happened. Both were kindnesses.',
  },
  {
    id: 'people.rafa',
    tab: 'people',
    title: 'Rafa',
    sub: 'Fisherman’s son, surf instructor. His board is a caballito with amnesia.',
    you: 'His mouth surfs ahead of his brain, but the apology arrives al toque, and it is sincere. Chévere, on balance.',
  },
  {
    id: 'people.petro',
    tab: 'people',
    title: 'Doña Petro',
    sub: 'The picantería. One long table, no menu, no arguments with the pot.',
    nani: 'You enter past the pots because that is the only way in. This is architecture as philosophy.',
    you: 'Traded an errand for a sudado and a good word with the captain. Favors with flavor: her phrase, her economy.',
  },
  {
    id: 'people.felix',
    tab: 'people',
    title: 'Maestro Félix',
    sub: 'Boat-builder. Always partway through his next caballito.',
    you: 'Two madres, two hijos, bound into a horse that lasts a few weeks. The boat is a consumable; the knowing is the heirloom.',
  },
  {
    id: 'people.wili',
    tab: 'people',
    title: 'Don Wili',
    sub: 'Emolientero. The cart and he keep the hours nobody else wants.',
    you: 'Here before the boats leave, here after they return. A small lighthouse for cold hands.',
  },
  {
    id: 'people.rios',
    tab: 'people',
    title: 'Capitana Ríos',
    sub: 'Master of the cargo ship at anchor. Checks clipboards like they owe her money.',
    you: '"They say a woman aboard is bad luck. I have crossed this ocean ninety times. The luck seems fine to me."',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.caserita',
    tab: 'customs',
    title: 'Casero, caserita',
    sub: 'The mutual word: her regular customer, your regular stall. Both people say it of each other.',
    nani: 'It is not loyalty points. It is a small marriage of errands.',
    you: 'You cannot buy your way in; you attend your way in. Show up, and keep showing up. Then the yapa simply happens.',
  },
  {
    id: 'customs.noon',
    tab: 'customs',
    title: 'Ceviche o’clock',
    sub: 'Noon to three, because the fish landed at dawn. Evening ceviche is old fish and everyone knows it.',
    nani: 'I asked for ceviche at night exactly once. The cook’s face taught me more than the guidebook did.',
    you: 'Petro: "Ceviche is a clock, not a dish." I was the clock’s fool once, warmly.',
  },
  {
    id: 'customs.espera',
    tab: 'customs',
    title: 'La espera',
    sub: 'The waiting: on the sand for the boats, in the circle over the nets. It is work, and it is company.',
    you: 'Mended nets in the evening circle. Hands busy, tongues loose. Half the village’s knowing gets sewn in with the knots.',
  },
  {
    id: 'customs.wachaque',
    tab: 'customs',
    title: 'The wachaques',
    sub: 'Sunken ponds dug to the water table, where the totora grows. No ponds, no reeds, no horses.',
    nani: 'Green happens exactly twice on this coast, and one of the greens is dug by hand.',
    you: 'When the ponds failed, the village dug new ones together. The pond outlives every digger. That is the arrangement.',
  },
  {
    id: 'customs.sanpedrito',
    tab: 'customs',
    title: 'San Pedrito',
    sub: 'End of June. The saint rides a totora raft out to bless the water, escorted by caballitos.',
    you: 'The year there was no totora, the saint stayed dry, and Félix says the whole village felt it in the chest.',
  },
  {
    id: 'customs.rematar',
    tab: 'customs',
    title: 'El remate',
    sub: 'End of day: slash the price, call the street, empty the table.',
    nani: 'At four o’clock the market becomes a different institution with the same tables.',
    you: 'Marisol’s arithmetic: nobody gets rich after four, but everybody eats. The numbers that matter, kept.',
  },

  // ---------------- her ----------------
  // No Nani hand on this page. This tab is not what she wrote; it is what she
  // left in other people, and the coast kept a week she never mentioned.
  {
    id: 'her.passage',
    tab: 'her',
    title: 'The passage she did not take',
    sub: 'Don Simón, coiling a line on the pier. His father took the money either way.',
    you: 'She paid, then sat on this sand a week and let the boat go north without her. Her coast pages are lime and fog and not one word of it.',
  },
  // The player's own thread (owned by Chapter One, filed here so the Her tab
  // reads in play order). Unlocked by 'her.you.caleta' on Chasca's second visit.
  {
    id: 'her.you.leave',
    tab: 'her',
    title: 'Six weeks',
    sub: 'In my own hand, and nobody asked.',
    you: 'Chasca asked how long they gave me and I told her the dates, the banked days, the folder I left on the desk. She wanted a number. I gave her a defense.',
  },
];

/** Coastal loose threads; merged ahead of the highland list. */
export const CALETA_TASKS: TaskDef[] = [
  {
    when: { has: ['c2.lisa'], not: ['c2.lisa.done'] },
    text: 'Marisol’s newspaper parcel is going cold in your hands. Doña Petro’s picantería is the open door past the plaza: in past the pots, al toque.',
  },
  {
    when: { has: ['errand.petro-lisa'], not: ['c2.lisa'] },
    text: 'Doña Petro’s lisa waits at Marisol’s stall on the malecón. Fetch it before the sudado loses patience.',
  },
  {
    when: { has: ['c2.gift'], not: ['c2.gift.sent'] },
    text: 'A very weird sea thing rides in your pocket, addressed to a bridge magnate. The harbor office counter is by the office door, up from the pier.',
  },
  {
    when: { has: ['c2.gift.sent'], not: ['letter.read.home.aurelio'] },
    text: 'The harbor clerk was digging under the counter for a second envelope. Ask at the window again.',
  },
  {
    when: { has: ['pilar.sea', 'c2.arrived'], not: ['c2.gift'] },
    text: 'Pilar’s invoice stands: something from the sea, a weird one. The tidepools along the wet sand look promising.',
  },
  {
    when: { has: ['c2.ceviche'], not: ['c2.atenoon'] },
    text: 'Petro’s orders: come back at noon, when the fish is hours old instead of a day. The clock is the recipe.',
  },
  {
    when: { has: ['c2.cook.start'] },
    text: 'You are behind Petro’s pots with a knife and a clock. Cut, salt, the lime kiss, onion, ají, cancha and camote at the rim, tiger’s milk in its own glass. In that order, pe.',
  },
  {
    when: { has: ['c2.atenoon'], not: ['c2.cook.start', 'c2.cook.done'] },
    text: 'Doña Petro has decided you have eaten enough ceviche to be trusted near one. Present yourself behind the pots; the lesson keeps noon hours.',
  },
  {
    when: { has: ['met.felix'], not: ['c2.ponds'] },
    text: 'Maestro Félix is partway through a boat and a story about ponds. Both halves are worth standing still for.',
  },
  {
    when: { has: ['c2.ponds'], not: ['c2.ride.done'] },
    text: 'Félix’s offer stands: kneel onto a caballito, paddle out, let a wave decide to keep you. The water forgives beginners.',
  },
  {
    when: { has: ['c2.trade', 'c2.ride.done'], not: ['c2.nets.done'] },
    text: 'Don Simón holds the evening net circle on the pier. Hands busy, tongues loose; bring both.',
  },
  {
    when: { has: ['met.simon'], not: ['c2.trade'] },
    text: 'Don Simón mentioned his grandfather walking dried fish up your very road. Ask him what came back down.',
  },
  {
    when: { has: ['met.marisol', 'met.simon'], not: ['c2.stall2'] },
    text: 'Go back to Marisol’s stall. A stall is not a shop, pe; it is a friendship with a scale in it, and friendships need visits.',
  },
  {
    when: { has: ['c2.stall2', 'c2.atenoon'], not: ['c2.casero'] },
    text: 'One more visit to Marisol should make it a habit. Habits have privileges here.',
  },
  {
    when: { has: ['met.rios'], not: ['c2.complete'] },
    text: 'Capitana Ríos takes working hands, vouched for by the village: be somebody’s casero, learn what la mar carries, make Petro’s kitchen owe you one.',
  },
  {
    when: { has: ['c2.complete'] },
    text: 'The Crossing is being provisioned; the tide will say when. Until then La Caleta is yours: blank pages, the malecón at dusk, one pelican with a criminal record.',
  },
  {
    when: { has: ['c2.arrived'], not: ['c2.complete'] },
    text: 'La Caleta is small and talkative: the stall on the malecón, the old man on the pier, the picantería you enter past the pots. Meet it.',
  },
];
