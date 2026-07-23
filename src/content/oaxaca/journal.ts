import type { JournalEntry, TaskDef } from '../schema';

/**
 * The valley pages. Nani never wrote here: she reached this village in 1975
 * and left the same night the telegram came, so every page shows only your
 * hand. Her absence on these pages IS the chapter. The margin notes that
 * surface through rhymes were written years earlier, elsewhere on the road.
 */

export const OAXACA_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.guelaguetza',
    tab: 'words',
    title: 'Guelaguetza',
    sub: 'Zapotec: reciprocity, recorded. Kindness with a page number, repaid across generations.',
    you: 'The ledger line: Nani, 1975: one week of shelter, one mole feast. Owed. A village held that page open for fifty years. I closed it with my hands.',
    rhyme: {
      with: 'customs.ayni',
      note: 'If I ever learn what the valley people across the water call ayni, I will owe this book a finished sentence.',
    },
  },
  {
    id: 'words.provecho',
    tab: 'words',
    title: '¡Provecho!',
    sub: 'Said to anyone eating, strangers included. Answer: gracias, igualmente.',
    you: 'A woman I had never met blessed my tlayuda through the gate. By week’s end I was doing it to strangers myself. It seasons the whole street.',
  },
  {
    id: 'words.ahorita',
    tab: 'words',
    title: 'Ahorita',
    sub: 'Right now, soon, eventually, maybe. All four at once, sincerely.',
    you: 'Tacho’s next batch came out ahorita: one errand, two conversations, and a stirred pot later. It always comes. It refuses to be supervised.',
    rhyme: {
      with: 'words.altoque',
      note: 'Al toque, they promised on the coast, and the fish came when the sea agreed. Every language keeps one word for soon that means we shall see.',
    },
  },
  {
    id: 'words.mande',
    tab: 'words',
    title: '¿Mande?',
    sub: 'The Mexican what? or pardon? Softer than qué, and safer.',
    you: 'Chela answered me elbow-deep in mole: ¿Mande? Then warned me her mother reached for the wooden spoon over qué. I flinch correctly now.',
  },
  {
    id: 'words.marchanta',
    tab: 'words',
    title: 'Marchanta',
    sub: 'What vendor and regular call each other. Both people say it of the other.',
    you: 'Eugenia called me marchanta before I had bought a thing. A small marriage of errands, she says. The word does the work; you just keep showing up.',
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.molenegro',
    tab: 'dishes',
    title: 'Mole negro',
    sub: 'King of the seven. Some thirty ingredients, chilhuacle at the heart, days in the making.',
    you: 'Chiles toasted black on purpose, burnt tortilla, chocolate last. I stirred the promised hour with my own arm. Occasion food; the occasion was us.',
  },
  {
    id: 'dishes.tejate',
    tab: 'dishes',
    title: 'Tejate',
    sub: 'Corn, cacao, pixtle, rosita de cacao, worked by hand until the white foam rises.',
    you: 'Refugio lifted it with her forearm until it foamed, then watched me drink like the jícara was a question. The foam is the prize. She is the tejatera.',
  },
  {
    id: 'dishes.pandemuerto',
    tab: 'dishes',
    title: 'Pan de muerto',
    sub: 'Oaxaca style: egg-rich pan de yema with a painted carita pressed into the crown.',
    you: 'Here the bread looks back at you. Tacho presses each little face on by hand, and the loaf for the altar gets its face pressed on by name.',
  },
  {
    id: 'dishes.tlayuda',
    tab: 'dishes',
    title: 'Tlayuda',
    sub: 'A tortilla wide as the moon, crisped on the comal: beans, asiento, quesillo.',
    you: 'Eaten on the low stool, which Chela says is for guests who stay. Big as a wheel and gone in minutes. The comal does not make mistakes.',
  },
  {
    id: 'dishes.chocolatedeagua',
    tab: 'dishes',
    title: 'Chocolate de agua',
    sub: 'Chocolate beaten to foam in water, not milk, so the cacao does the talking.',
    you: 'Water-dark and honest, poured while the mole’s disc was wrapped. At the fiesta you dunk pan de muerto in it, and the village makes complete sense.',
  },

  // ---------------- people ----------------
  {
    id: 'people.refugio',
    tab: 'people',
    title: 'Doña Refugio',
    sub: 'Tejatera. Keeper of her mother’s guelaguetza ledger, and of one held page.',
    you: 'She was nine when Nani drew her mother’s comal. She kept the debt like her mother kept the cup: not as a weight. As a place set at the table.',
  },
  {
    id: 'people.elias',
    tab: 'people',
    title: 'Elías',
    sub: 'Weaver. Says padiuxi first and hello second. Dyes with the insect red.',
    you: 'He knew my wrist band before he knew my name: the same cochineal as his yarn, born in the Andes, famous from Oaxaca. His hands saw it first.',
  },
  {
    id: 'people.chela',
    tab: 'people',
    title: 'Abuela Chela',
    sub: 'The mole cook. Commands the big comal on Refugio’s patio.',
    you: 'Her mole eats the whole week and she narrates every ingredient like a genealogy. She told the steam we kept Nani’s appointment. The steam heard.',
  },
  {
    id: 'people.panadero',
    tab: 'people',
    title: 'Tacho',
    sub: 'Panadero. Flour at four, ovens at five, caritas at six.',
    you: 'Says the dead eat better than the living this month, and bakes accordingly. His ahorita is a unit of time measured in finished errands.',
  },
  {
    id: 'people.carver',
    tab: 'people',
    title: 'Silvino',
    sub: 'Alebrije carver. Dreams the creatures; the copal wood argues; they settle.',
    you: 'Cheerfully torpedoes the ancient-spirit myth: a fever dream, 1936, paper before wood. Newness is not a scandal. Every tradition was Tuesday once.',
  },
  {
    id: 'people.caretaker',
    tab: 'people',
    title: 'Don Melitón',
    sub: 'Camposanto caretaker. Gets the beds ready; company is coming.',
    you: 'Corrected my Halloween guess without a splinter of scorn: they dress as the dead to be safe from them; we set the table for ours. And you wait up.',
  },
  {
    id: 'people.kid',
    tab: 'people',
    title: 'Nico',
    sub: 'Comparsa recruit. Four notes on a borrowed trombone, at night, moving.',
    you: 'Wrong about the alebrijes, delighted to be corrected: a fever beats ancient, you can catch one. The comparsa goes ALL night. He gets a costume.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.ofrenda',
    tab: 'customs',
    title: 'The ofrenda',
    sub: 'Levels for heaven and earth. Water, salt, copal, candles, bread, and the favorites.',
    you: 'Water for thirst, salt for life, candles so nobody trips on the dark. The last level is biography: what she loved, set out warm. We built two.',
  },
  {
    id: 'customs.cempasuchil',
    tab: 'customs',
    title: 'Cempasúchil',
    sub: 'The marigold. Its color and scent are the road signs the dead can read.',
    you: 'I laid the petal path from the camposanto gate to the doorways, thick at the bends, because the dead were people and people miss turns.',
  },
  {
    id: 'customs.camposanto',
    tab: 'customs',
    title: 'The night at the camposanto',
    sub: 'Candles, mole, mezcal poured for those who drank it. A reunion, not a mourning.',
    you: 'Loud with gossip and guitar, laughing the respectful kind. The ones who cry get handed bread. For one night nobody is a stranger, including the dead.',
  },
  {
    id: 'customs.pilon',
    tab: 'customs',
    title: 'El pilón',
    sub: 'The little extra a vendor adds for a regular. Never asked for, never explained.',
    you: 'A fistful of cacao on top of the chiles, no eye contact, no charge. It simply happens between marchantas. I have met this arithmetic on four coasts.',
    rhyme: {
      with: 'words.deom',
      note: 'The ajumma pressed one extra into my hands and looked insulted when I counted. Some arithmetic is love wearing an apron.',
    },
  },
  {
    id: 'customs.grana',
    tab: 'customs',
    title: 'Grana cochinilla',
    sub: 'Cochineal: an insect raised on nopal, crushed into the red that dyed empires.',
    you: 'Born in the Andes, made famous by Oaxaca, still mostly Peruvian. The red at my wrist and the red on Elías’s loom are the same small stubborn bug.',
    rhyme: {
      with: 'words.lliclla',
      note: 'The red in Carmen’s weaving is an insect from a cactus. If a bug can cross an ocean and stay this loud, so can I.',
    },
  },
];

/** Valley loose threads; merged ahead of the earlier chapters' lists. */
export const OAXACA_TASKS: TaskDef[] = [
  {
    when: { has: ['errand.chela-chiles'], not: ['c9.chiles'] },
    text: 'Chela’s chiles wait at Eugenia’s stall on the market lane: chilhuacle, mulato, pasilla. Say it is for the fiesta mole, and do not shake the bag.',
  },
  {
    when: { has: ['c9.chiles'], not: ['c9.chiles.done'] },
    text: 'The chiles ride in your bag, bruising like opinions. Back to Chela at the comal patio, west of the plaza.',
  },
  {
    when: { has: ['errand.chela-choco'], not: ['c9.choco'] },
    text: 'Chocolate next: Tacho at the panadería grinds cacao when the bread lets him. Ask for the good disc, not the tourist disc.',
  },
  {
    when: { has: ['c9.choco'], not: ['c9.choco.done'] },
    text: 'The chocolate disc is warm in your pocket, which feels backwards. Chela is waiting at the comal.',
  },
  {
    when: { has: ['c9.choco.done'], not: ['c9.mole.done'] },
    text: 'The mole wants its hour of stirring and Chela’s shoulder is older than the pot. Take the spoon. Nani was promised this exact hour.',
  },
  {
    when: { has: ['errand.pan-refugio'], not: ['c9.bread.done'] },
    text: 'A basket of pan de muerto, still warm, promised to Refugio’s altar. Her kitchen is through the open door above the comal patio. Carry it warm.',
  },
  {
    when: { has: ['c9.path.task'], not: ['c9.path.laid'] },
    text: 'Melitón’s costal of petals is over your shoulder. Walk the lane below the camposanto gate and lay the marigold path, thick where it bends.',
  },
  {
    when: { has: ['c9.ledger'], not: ['c9.mole.ask'] },
    text: 'Repay the week she never finished. Start where she would have: Chela’s mole, at the big comal on Refugio’s patio.',
  },
  {
    when: { has: ['c9.ledger'], not: ['c9.bread.ask'] },
    text: 'The fiesta bread wants carrying. Tacho at the panadería has a basket with Refugio’s name on it.',
  },
  {
    when: { has: ['c9.ledger'], not: ['c9.path.task'] },
    text: 'The camposanto path wants petals. Don Melitón is sweeping between the graves, through the marigold arch at the village’s north edge.',
  },
  {
    when: { has: ['c9.mole.done', 'c9.bread.done', 'c9.path.laid'], not: ['c9.family.done'] },
    text: 'Mole resting, bread delivered, path laid. Go to Refugio’s kitchen and help raise the family ofrenda. The ledger line is almost closed.',
  },
  {
    when: { has: ['c9.family.done'], not: ['c9.ofrenda.done'] },
    text: 'The village is building Nani an ofrenda of her own, in Refugio’s kitchen. Bring what the road put in your hands, and your hands.',
  },
  {
    when: { has: ['c9.debt.paid', 'c9.ofrenda.done'], not: ['c9.complete'] },
    text: 'Tonight the camposanto is lit. Follow your own petals through the marigold arch. Don Melitón says the night knows its business.',
  },
  {
    when: { has: ['met.refugio', 'met.elias', 'met.chela'], not: ['c9.ledger'] },
    text: 'Refugio keeps looking at the journal on your hip like a face she knows. Go back to her kitchen and show it to her.',
  },
  {
    when: { has: ['met.refugio'], not: ['met.chela'] },
    text: 'Refugio said to meet her village. Start with the smell: someone is working a comal the size of a wagon wheel on her own patio.',
  },
  {
    when: { has: ['met.chela'], not: ['met.elias'] },
    text: 'A loom clacks in a doorway on the east lane, walking red up the warp. The weaver says hello in Zapotec first.',
  },
  {
    when: { has: ['c9.complete'] },
    text: 'The ledger is closed, both directions. The colectivo at the plaza’s south corner leaves ahorita, whenever that is. The village stays warm until then.',
  },
  {
    when: { has: ['c9.arrived'], not: ['c9.complete'] },
    text: 'A valley village dressed for its biggest week: the market lane, the portales, a tejatera who wants to see your book once you have met her village.',
  },
];
