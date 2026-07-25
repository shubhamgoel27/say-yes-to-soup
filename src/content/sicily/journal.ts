import type { JournalEntry, TaskDef } from '../schema';

/**
 * The Sicilian pages. Nani's hand is thin here: a few entries, warm and full,
 * and then one that stops in the middle of a sentence. After that, silence.
 * The journal itself never explains; the road to Oaxaca does.
 */

export const SICILY_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.amuni',
    tab: 'words',
    title: 'Amunì',
    sub: 'Come on, let us go. The word that starts every walk, meal, and rescue.',
    you: 'Concetta says it and the evening reorganizes itself around her. It is not an invitation. It is a weather system.',
  },
  {
    id: 'words.bedda',
    tab: 'words',
    title: 'Bedda',
    sub: 'Beautiful. Also: you, whoever you are, if a grandmother is talking to you.',
    nani: 'A woman I had known for one minute called me bedda and handed me bread. I have been paid in worse currencies.',
    you: 'It means beautiful and is applied to everyone the speaker intends to feed. Which is everyone.',
  },
  {
    id: 'words.picciriddu',
    tab: 'words',
    title: 'Picciriddu',
    sub: 'Little one. Age limit: none, as long as the speaker is older than you.',
    you: 'The elders are picciriddi to Concetta. I am one to the elders. The word passes down the table like a plate.',
  },
  {
    id: 'words.talia',
    tab: 'words',
    title: 'Talìa!',
    sub: 'Look! The most used word on the coast, because there is always something.',
    nani: 'Talìa, the fish! Talìa, the mountain! Talìa, your face! A town that never stops pointing at the world. I like it here.',
    you: 'Turi sings it, Concetta commands it, Nino aims it at closed shutters. One word, three dialects of the heart.',
  },
  {
    id: 'words.amuntagna',
    tab: 'words',
    title: '’A Muntagna',
    sub: 'The Mountain, feminine. Etna, never named directly. The neighbor.',
    nani: 'They talk about the volcano the way sailors at home talk about the sea. Not a place. A temperament you live beside.',
    you: 'Rosaria says the terraces are her gift and the ash is her housekeeping. You do not move away from the neighbor. You sweep.',
    rhyme: {
      with: 'words.lamar',
      note: 'La mar on one coast, ’a Muntagna on this one. The biggest thing in sight is always a she.',
    },
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.granitabrioche',
    tab: 'dishes',
    title: 'Granita con brioche',
    sub: 'Breakfast, not dessert. Ice, fruit or almond or coffee, and a brioche with a topknot.',
    nani: 'Breakfast here is ice and a sweet bread wearing a little hat. I laughed, then I ate it, then I stopped laughing and ordered another.',
    you: 'Alfio’s doctrine: almond takes coffee, lemon stands alone, mulberry is a July mercy. Tear off the tuppo first and dip. Not optional.',
  },
  {
    id: 'dishes.arancino',
    tab: 'dishes',
    title: 'Arancino',
    sub: 'Fried rice cone with a molten heart. Masculine here, and pointed like the mountain.',
    you: 'Say arancina in this bar and three tables correct you at once, lovingly, like catching a dropped plate. The cone honors ’a Muntagna, they say.',
  },
  {
    id: 'dishes.norma',
    tab: 'dishes',
    title: 'Pasta alla Norma',
    sub: 'Fried eggplant, tomato, basil, salted ricotta. Named for an opera, meant as a compliment.',
    you: 'A Catania dish named after a Catania man’s masterpiece. Concetta serves it like the composer might walk in and check.',
  },
  {
    id: 'dishes.cannolo',
    tab: 'dishes',
    title: 'Cannolo',
    sub: 'Filled at the moment of ordering, never before. The shell is a promise, not a pantry.',
    you: 'The case holds empty shells on purpose. A pre-filled cannolo is a confession, Alfio says. I will never unknow the difference.',
  },
  {
    id: 'dishes.panecunzato',
    tab: 'dishes',
    title: 'Pane cunzato',
    sub: 'Seasoned bread: oil, tomato, oregano, anchovy, cheese. The poor man’s feast.',
    you: 'Eaten under Rosaria’s lemons with oil running to the wrist. Food invented by hard years, kept by good ones. It tastes like surviving.',
  },

  // ---------------- people ----------------
  {
    id: 'people.concetta',
    tab: 'people',
    title: 'Nonna Concetta',
    sub: 'Authority: the Sunday table, and by extension, everything.',
    you: 'Fed me before knowing my name, on the grounds that I was standing in the sun with empty hands. I remain fed until further notice.',
  },
  {
    id: 'people.turi',
    tab: 'people',
    title: 'Turi',
    sub: 'Fish vendor. His cry is his father’s tune with his own weather in it.',
    you: 'Haggles like an actor who loves his scene partner. The price was agreed before the argument began; the argument was for the audience.',
  },
  {
    id: 'people.alfio',
    tab: 'people',
    title: 'Alfio',
    sub: 'The granita bar. Keeper of the breakfast doctrine and the pastry case.',
    you: 'Gently horrified by my cappuccino, then fixed my whole morning with ice and a brioche. Corrections here arrive dressed as gifts.',
  },
  {
    id: 'people.elders',
    tab: 'people',
    title: 'The circolo table',
    sub: 'Four players, five chairs. Membership is for life, and then a little longer.',
    you: 'They kept a dead friend’s chair empty for years, then gave it to me for a card game. I have been handed keys with less ceremony.',
  },
  {
    id: 'people.donsaro',
    tab: 'people',
    title: 'Don Saro',
    sub: 'Priest. Practical, damp, cheerful. Currently up to the elbows in festival.',
    you: 'Carries oars, recruits rowers, negotiates with swimmers and saints alike. His theology is mostly logistics, and it visibly works.',
  },
  {
    id: 'people.nino',
    tab: 'people',
    title: 'Nino',
    sub: 'Young fisherman. Duffel bag packed, not hidden. Torino on one shoulder, the boat on the other.',
    you: 'Cu nesci arrinesci, they tell him. Who leaves, succeeds. Nobody in the argument is wrong, which is why the bag stays packed and stays here.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.passeggiata',
    tab: 'customs',
    title: 'La passeggiata',
    sub: 'The evening walk. No destination, all company. The town’s daily parliament.',
    you: 'Three laps of the lungomare at the speed of talk. You do not watch it, you join it, and by lap two slow is the only sensible speed.',
  },
  {
    id: 'customs.upisci',
    tab: 'customs',
    title: 'U pisci a mari',
    sub: 'The fish in the sea: a rowed pantomime of the old swordfish hunt, for a generous year.',
    you: 'The fish escapes and escapes until it lets itself be caught, and the harbor roars. I pulled an oar. I am in the story now, Saro says.',
    rhyme: {
      with: 'customs.sanpedrito',
      note: 'Another saint who goes down to the sea. They would like each other.',
    },
  },
  {
    id: 'customs.pranzo',
    tab: 'customs',
    title: 'The Sunday pranzo',
    sub: 'Not a meal, a roll call. Starts at noon, surrenders around dusk.',
    nani: 'The table here holds everyone. I have been thinking that when I get home I will',
    you: 'Refusing a second helping is permitted; succeeding is not. Her entry above stops mid sentence. I keep reading the empty half anyway.',
  },
  {
    id: 'customs.circolo',
    tab: 'customs',
    title: 'The circolo',
    sub: 'The fishermen’s club: cards, coffee, one fan, lifetime membership.',
    you: 'Same men, same table, same argument since 1961. The empty chair was not empty; it was occupied by a man late by some years.',
  },
  {
    id: 'customs.abbanniata',
    tab: 'customs',
    title: 'The abbanniata',
    sub: 'The vendor’s sung cry. Each stall its own tune, inherited like a surname.',
    nani: 'The market does not shout, it sings. Six stalls, six melodies, one opera every morning with fish for a libretto.',
    you: 'Turi’s is his father’s tune. You could shop blindfolded here, steering by song. Commerce as theater, with encores.',
  },
];

/** Sicilian loose threads; merged ahead of the older chapters' lists. */
export const SICILY_TASKS: TaskDef[] = [
  {
    when: { has: ['errand.turi-pisci'], not: ['c8.fish.delivered'] },
    text: 'Turi’s parcel is sweating through its paper: the belly cut, promised to Nonna Concetta by the church steps. The ice is losing. Amunì.',
  },
  {
    when: { has: ['c8.pranzo.invite'], not: ['c8.pranzo'] },
    text: 'Sunday, Concetta’s table, between Nino and the aunts. It is not an invitation, it is a schedule. Arrive hungry or be made hungry.',
  },
  {
    when: { has: ['met.alfio'], not: ['c8.granita'] },
    text: 'Alfio’s granita is waiting and the morning is not getting cooler. Almond with coffee is legal; tear the tuppo off first.',
  },
  {
    when: { has: ['c8.granita'], not: ['c8.arancino'] },
    text: 'The fryer at the bar sings around midday. Order the rice cone, and mind the last vowel: this is an arancinO town.',
  },
  {
    when: { has: ['met.turi'], not: ['c8.haggle'] },
    text: 'Turi’s stall does its best theater mid-morning. Go watch a haggle performed properly; the audience is part of the cast.',
  },
  {
    when: { has: ['c8.circolo.watch', 'c8.pranzo'], not: ['c8.scopa.won'] },
    text: 'Word of Sunday has reached the circolo. The empty chair at the scopa table is being looked at, and so are you. Go sit when they wave.',
  },
  {
    when: { has: ['c8.circolo.watch'], not: ['c8.pranzo'] },
    text: 'The circolo seats no strangers. In this town names travel by kitchen; eat where you are told to eat and the cards will hear about it.',
  },
  {
    when: { has: ['met.saro', 'c8.pranzo'], not: ['c8.pisci.won'] },
    text: 'Don Saro is short one rower for U pisci a mari and considers your arrival a scheduling decision by Providence. The boat is by the church.',
  },
  {
    when: { has: ['met.nino', 'c8.circolo.watch'], not: ['c8.nino.talk'] },
    text: 'Nino saw you notice the empty chair. He is on the mole with a packed bag and an argument nobody is winning. Go hold the net taut.',
  },
  {
    when: { has: ['c8.pranzo', 'c8.scopa.won', 'c8.pisci.won'], not: ['c8.walk.done'] },
    text: 'The light goes soft around seven and the whole town will be on the lungomare, walking nowhere on purpose. Concetta expects you for it.',
  },
  {
    when: { has: ['page.dishes.cannolo'], not: ['c8.cook.done'] },
    text: 'Alfio wants your hands on the pastry bag: three shells, filled at the moment, never before. The signora in black will be the judge, so, no pressure.',
  },
  {
    when: { has: ['c8.ben.met'], not: ['c8.ben.tin', 'c8.complete'] },
    text: 'Mang Ben is loose in the pescheria while the Yacana provisions, adopting fish vendors. He had something in his pocket he was too pleased about. Go back.',
  },
  {
    when: { has: ['c8.walk.done'], not: ['c8.complete'] },
    text: 'Fed, dealt in, rowed, and walked: the town may be ready to sign you out. Signor Patanè keeps the ledger at the end of the mole.',
  },
  {
    when: { has: ['c8.arrived'], not: ['letter.read.sicily.pilar'] },
    text: 'The POSTE window in the piazza is open, technically. Mail from home crosses two oceans slower than gossip; there should be some waiting.',
  },
  {
    when: { has: ['c8.complete'] },
    text: 'Veracruz exists, in principle. Until the gangway calls: granita at Alfio’s, the dusk walk, and everyone who fed you owed a goodbye.',
  },
  {
    when: { has: ['c8.arrived'], not: ['c8.complete'] },
    text: 'The town is small and loud and generous: the singing stall, the granita bar, the church steps, the circolo doorway, the black beach. Meet it.',
  },
];
