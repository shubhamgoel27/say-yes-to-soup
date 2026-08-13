import type { JournalEntry, TaskDef } from '../schema';

/**
 * The Setouchi pages of Nani's journal. Japan delighted her; the handwriting
 * here is quick and bright, with little sketches of fish in the margins.
 */

export const SHIONOURA_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.tadaima',
    tab: 'words',
    title: 'Tadaima / Okaeri',
    script: 'ただいま',
    sub: 'I am home; answered always by okaeri (おかえり), welcome back. A call and its answer; neither works alone.',
    nani: 'The grandmother here says okaeri when I come in from the rain, though this is not my home. I checked the dictionary twice. It is on purpose!',
    you: 'Hana said tadaima under her breath at the lighthouse. Four years away, and the word was waiting on the pier with everyone else.',
  },
  {
    id: 'words.sumimasen',
    tab: 'words',
    title: 'Sumimasen',
    script: 'すみません',
    sub: 'Excuse me, thank you, sorry, and hello-please-forgive-the-bother. One word, ten jobs.',
    nani: 'I have said sumimasen forty times today and meant something different each time. The all-purpose social oil. I am delighted by its economy.',
    you: 'Hana\'s advice: when in doubt, sumimasen. I have yet to find the doubt it does not cover.',
  },
  {
    id: 'words.itadakimasu',
    tab: 'words',
    title: 'Itadakimasu',
    script: 'いただきます',
    sub: 'Said before eating, palms together: I humbly receive.',
    you: 'You say it to the fish, the farmer, the sea, and the cook. Mostly the cook, says the cook.',
  },
  {
    id: 'words.gochisosama',
    tab: 'words',
    title: 'Gochisōsama',
    script: 'ごちそうさま',
    sub: 'Said after eating: it was a feast. Even when it was barley tea and a rice ball. Especially then.',
    you: 'The meal has a door at each end: itadakimasu going in, gochisosama going out. Nobody eats unbracketed in Fumi\'s house.',
  },
  {
    id: 'words.otsukaresama',
    tab: 'words',
    title: 'Otsukaresama',
    script: 'おつかれさま',
    sub: 'You must be tired: untranslatable praise. Your effort was seen; the work happened and you were in it.',
    you: 'Daisuke said it after the crates; they say it after hauling, festivals, anything shared. Not thanks for the result, respect for the tiredness itself.',
    rhyme: {
      with: 'customs.espera',
      note: 'On the coast, the waiting was the work. Here they bow to the tiredness itself. Same truth, facing opposite directions: the work is the work.',
    },
  },
  {
    id: 'words.irasshai',
    tab: 'words',
    title: 'Irasshai',
    script: 'いらっしゃい',
    sub: 'The shopkeeper\'s welcome, thrown like a fishing line at anyone within earshot.',
    you: 'Sachiko says it before the noren finishes moving. Daisuke says it to people, gulls, and once, convincingly, to the ferry.',
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.dashi',
    tab: 'dishes',
    title: 'Iriko dashi',
    script: 'だし',
    sub: 'The everyday broth: small dried anchovies, heads pinched off, steeped like the sea\'s own tea.',
    nani: 'The famous books say kombu and katsuobushi. The grandmother here says iriko and laughs at the books. Her soup wins. I have eaten three bowls to be sure.',
    you: 'Kombu out one breath before the boil, the little fish counted into cold water like coins. The Inland Sea in a saucepan; udon and miso stand on it.',
  },
  {
    id: 'dishes.tai',
    tab: 'dishes',
    title: 'Tai',
    script: '鯛',
    sub: 'Red sea bream, the king fish, lucky by pun: medetai means festive, and tai hides inside it.',
    nani: 'A whole tai appeared at dinner and the room stood up straighter. A fish that outranks the diners! I sketched it before we ate it.',
    you: 'Tai-somen at the low table: whole bream over noodles fine as thread. Celebration food. The guest gets the cheek; house rule, no appeal.',
  },
  {
    id: 'dishes.lemon',
    tab: 'dishes',
    title: 'Setoda lemons',
    sub: 'From terraced groves above the water, one island over. Lemon Valley since the sixties.',
    you: 'Most of Japan\'s lemons grow on these slopes. In July the mikan is only juice and jelly, so the lemon does the singing. Sour keeps you honest, says Sachiko.',
  },
  {
    id: 'dishes.onigiri',
    tab: 'dishes',
    title: 'Onigiri',
    script: 'おにぎり',
    sub: 'Rice pressed into a triangle around a secret. Ferry food, boat food, everything food.',
    you: 'Hana\'s grandmother makes the umeboshi kind that fights back a little. Handed over warm, with both hands, wrapped like something precious. It is.',
  },
  {
    id: 'dishes.lemonyokan',
    tab: 'dishes',
    title: 'Lemon yokan',
    sub: 'The town meibutsu: a dense cool sweet, gold as late afternoon, sharp as a first lemon.',
    you: 'Sachiko\'s grandmother\'s recipe. Tastes like sunshine that studied abroad. Now riding in my pack toward a picantería that has no idea it is coming.',
  },

  // ---------------- people ----------------
  {
    id: 'people.hana',
    tab: 'people',
    title: 'Hana',
    sub: 'Cadet of the MV Yacana, daughter of this harbor. Came home the long way around the planet.',
    you: 'She said tadaima quietly, like testing thin ice, and the whole town answered okaeri. She walks her own streets like a tourist for one day only.',
  },
  {
    id: 'people.fumi',
    tab: 'people',
    title: 'Fumi',
    sub: 'Keeper of Minshuku Shiosai. Scolds shoes, feeds strangers, wins every argument by feeding harder.',
    you: 'Her mother-in-law once hosted a laughing foreigner who bowed too deep and thanked corrections twice. We sat at the same table, fifty years apart.',
  },
  {
    id: 'people.daisuke',
    tab: 'people',
    title: 'Daisuke',
    sub: 'Fishmonger of the morning quay. Believes in tai the way other people believe in weather.',
    you: 'Worried my quiet eating meant his broth had failed. Two old men slurped louder to rescue me. Loud means delicious; silence is for fish still in the water.',
  },
  {
    id: 'people.sachiko',
    tab: 'people',
    title: 'Sachiko',
    sub: 'Sweet-shop keeper, mistress of the omiyage counter. Wraps parcels the way sailors furl sails.',
    you: 'Explained omiyage while wrapping, and the click was audible: I have people now, in three ports. She calls that her favorite kind of puzzle.',
  },
  {
    id: 'people.genji',
    tab: 'people',
    title: 'Genji',
    sub: 'Keeper of the Ebisu shrine. Four words where one will do, and one where four are expected.',
    you: '"Ebisu. God of fishermen. He is smiling. I sweep." The complete introduction. Later he gave me a tanzaku with both hands, which from him is a hug.',
  },
  {
    id: 'people.taro',
    tab: 'people',
    title: 'Taro',
    sub: 'Age nine. Owner of one pencil, one annual tanzaku, and a wish too big for the paper.',
    you: 'Boat, school, Gran\'s knees: we folded it all down to everyone stays okay, written huge. Next year, he notes, is reserved for the bicycle.',
  },
  {
    id: 'people.captain',
    tab: 'people',
    title: 'Captain Isao',
    sub: 'Forty-one years on the ferry run. The timetable is the town, and he is the timetable.',
    you: 'Carries school kids, brides, coffins, and now art tourists who photograph his rust. Grumbles about the last ones, and is never, ever late for them.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.omiyage',
    tab: 'customs',
    title: 'Omiyage',
    script: 'お土産',
    sub: 'The traveler\'s duty and delight: carry the place back to your people, in small wrapped portions.',
    you: 'Not a souvenir; those are for yourself. Omiyage says: I was somewhere, and you were with me anyway. My pack now smells of lemon and wrapping paper.',
  },
  {
    id: 'customs.tanabata',
    tab: 'customs',
    title: 'Tanabata',
    script: '七夕',
    sub: 'The seventh night: Orihime and Hikoboshi meet across the Amanogawa (天の川), the river of heaven, once a year.',
    nani: 'They hang wishes on bamboo here, because bamboo grows straight at heaven. It rained tonight and the whole town apologized to two stars. I love it here.',
    you: 'Vega and Altair stand on opposite banks of the Milky Way; the astronomy checks out. If it rains, the magpies cannot bridge it, so the town watches the sky.',
    rhyme: {
      with: 'customs.starriver',
      note: 'Mayu, Milky Way, Amanogawa. The llama drinks from it, magpies bridge it; everyone looks up and thinks water. The oldest agreement there is.',
    },
  },
  {
    id: 'customs.genkan',
    tab: 'customs',
    title: 'The genkan',
    sub: 'The recessed entry where shoes stop. The step up is the real front door.',
    you: 'I tracked sand two steps past the border and learned the word for shoes at volume. Slippers appeared, pointed the right way. The house forgave instantly.',
  },
  {
    id: 'customs.ofuro',
    tab: 'customs',
    title: 'The ofuro',
    sub: 'Wash and rinse completely at the stool BEFORE the tub. The bath is for soaking; the towel rides on your head.',
    nani: 'The bath here is not for washing! You arrive already clean and then simply sit in hot water thinking. Finest invention I have met this year.',
    you: 'Fumi\'s voice came through the wall with sniper accuracy: wash FIRST. The tub water stays clean for the whole house. Shared, just not at the same time.',
  },
  {
    id: 'customs.tairyobata',
    tab: 'customs',
    title: 'Tairyō-bata',
    sub: 'Big-catch flags: sunrise, waves, one emphatic fish. Flown when the hold came home full.',
    you: 'Now they fly for launchings, New Year, festivals, homecomings. Fumi raises her late husband\'s for Tanabata, and the pier remembers what full felt like.',
  },

  // ---------------- her ----------------
  // No Nani hand on this page. She wrote nothing here about the three weeks;
  // the only record is somebody else's ledger, in somebody else's mother's hand.
  {
    id: 'her.threeweeks',
    tab: 'her',
    title: 'One night, three weeks',
    sub: 'The minshuku guest book. One line arriving, one line leaving, and no line between.',
    you: 'She meant to pass through and stayed twenty-one days. I have a ferry booked and I keep doing the arithmetic against her.',
  },
];

/** Shionoura's open threads; merged ahead of the older chapters' lists. */
export const SHIONOURA_TASKS: TaskDef[] = [
  {
    when: { has: ['met.hana'], not: ['met.fumi'] },
    text: 'Hana\'s grandmother keeps the minshuku past the shotengai, the door wearing the noren. Your room is already aired; arguing is useless.',
  },
  {
    when: { has: ['met.fumi'], not: ['c4.meal'] },
    text: 'Fumi is laying the low table. Sit when she says sit; the words that bracket a meal here are worth learning by mouth.',
  },
  {
    when: { has: ['errand.fumi-tai'], not: ['c4.tai.got'] },
    text: 'Fumi\'s tai waits at Daisuke\'s stall on the quay, the best one, held back. Her knees and the hill disagree, so your legs are the favor.',
  },
  {
    when: { has: ['c4.tai.got'], not: ['c4.taisomen'] },
    text: 'A whole tai rides in your arms, proud as a diploma. Back up the lane to the minshuku before the celebration outruns its centerpiece.',
  },
  {
    when: { has: ['c4.taisomen'], not: ['c4.ofuro'] },
    text: 'The ofuro steams behind its own wall at the minshuku. There is a right order to it, and Fumi can hear a shortcut through the wall.',
  },
  {
    when: { has: ['c4.dashi'], not: ['c4.cook.done'] },
    text: 'Fumi thinks your hands might be useful at dawn: the morning dashi and the breakfast, before the guests wake. Ask her at the pot.',
  },
  {
    when: { has: ['met.fumi'], not: ['met.sachiko'] },
    text: 'The shotengai keeps a sweet shop under the noren, Kadoya, with the town\'s famous lemon thing. Taste first, questions after.',
  },
  {
    when: { has: ['c4.sachiko2'], not: ['c4.omiyage'] },
    text: 'Sachiko\'s counter is waiting on your list: Petro, Pilar, Aurelio. Omiyage is chosen slowly and given fast; start the slow half.',
  },
  {
    when: { has: ['c4.omiyage'], not: ['omiyage.aurelio'] },
    text: 'The omiyage list is longer than one parcel. Sachiko wraps while you talk; the people who fed you deserve the full inventory.',
  },
  {
    when: { has: ['c4.omiyage'], not: ['omiyage.pilar'] },
    text: 'Somewhere a museum director expects tribute. Sachiko has opinions about what a bridge-and-sea museum needs from this coast.',
  },
  {
    when: { has: ['c4.omiyage'], not: ['omiyage.petro'] },
    text: 'A cook who feeds strangers is still unaccounted for on the omiyage list. Sachiko suggests sour, wrapped sharp.',
  },
  {
    when: { has: ['met.fumi'], not: ['met.genji'] },
    text: 'Stone steps climb from the shotengai\'s east end, under a vermilion gate, to the little Ebisu shrine. The keeper sweeps; the god smiles.',
  },
  {
    when: { has: ['met.genji'], not: ['c4.tanzaku'] },
    text: 'Genji has a strip of paper with your name on it, in his way, and one nod at the sky to go with it. Go back up the steps.',
  },
  {
    when: { has: ['c4.tanzaku'], not: ['c4.wish.hung'] },
    text: 'The tanzaku waits in your pocket, small on purpose. Find the wishing bamboo and write the one wish that fits.',
  },
  {
    when: { has: ['met.taro'], not: ['c4.taro.wish'] },
    text: 'Taro is besieged by his own wish at the shrine steps: too big for the paper. He believes you are a professional. Do not disappoint him.',
  },
  {
    when: { has: ['met.hana'], not: ['c4.kingyo.done'] },
    text: 'A red and white stall on the quay holds a tub of goldfish and an uncle with paper scoops. Taro insists he has never let a kid leave empty. Test it.',
  },
  {
    when: { has: ['c4.arrived'], not: ['letter.read.c4.pilar'] },
    text: 'A red pillar box stands by the ferry office, and the clerk has been holding mail for a traveler answering your description.',
  },
  {
    when: { has: ['c4.omiyage', 'c4.wish.hung', 'c4.kingyo.done'], not: ['c4.complete'] },
    text: 'Omiyage wrapped, wish hung, goldfish bagged. Find Hana on the quay at dusk; the chochin are about to come on, and the seventh night keeps no spares.',
  },
  {
    when: { has: ['c4.arrived'], not: ['c4.complete'] },
    text: 'Shionoura is small and loud with cicadas: the quay market at dawn, the shotengai under its noren, the shrine up the steps. Meet it before the seventh night.',
  },
  {
    when: { has: ['c4.complete'] },
    text: 'The festival is folded away and the morning boat waits: Captain Isao, Shimonoseki, then the Busan ferry. Say your goodbyes slowly; the town prefers it.',
  },
];
