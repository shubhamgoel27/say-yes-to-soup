import type { JournalEntry, TaskDef } from '../schema';

/**
 * The crossing pages of Nani's journal. She made this same run in 1974 and
 * the sea agreed with her: her entries here are confident and salty, a woman
 * who has learned the ship's arithmetic and will not be told otherwise.
 */

export const CROSSING_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.bells',
    tab: 'words',
    title: 'Bells',
    sub: 'The ship tells time in strikes: one per half hour of the watch. Eight bells, and the watch is done.',
    nani: 'Eight bells and all is well. I sleep inside an engine now. Ashore, I suspect, the quiet will keep me up.',
    you: 'Asked Joseph the time and received arithmetic. Two bells: his dinner was warm and one hour of his watch had gone.',
  },
  {
    id: 'words.pollywog',
    tab: 'words',
    title: 'Pollywog',
    sub: 'A slimy creature that has never crossed the equator. Its opposite: a shellback, child of Neptune.',
    nani: 'I was a pollywog for exactly one noon. The flour got in my ears. I have never been prouder of a piece of paper.',
    you: 'Rose from the bosun’s court dripping and certified. The paper is signed twice, and I intend to frame it twice.',
  },
  {
    id: 'words.kainna',
    tab: 'words',
    title: 'Kain na!',
    sub: 'Tagalog: come and eat. Not an invitation; a summons, and the kindest law aboard.',
    you: 'Ben says it to the doorway before he sees who is standing in it. Nobody stands hungry in his door. That is the constitution.',
  },
  {
    id: 'words.lutongbahay',
    tab: 'words',
    title: 'Lutong bahay',
    sub: 'Home cooking. A thousand miles from any kitchen that counts, it is medicine with rice.',
    you: 'Week three, the salad ran out and the faces got long. Ben cooked home at the crew until they turned back into one.',
  },
  {
    id: 'words.masarap',
    tab: 'words',
    title: 'Masarap!',
    sub: 'Delicious. Properly shouted across a loud mess with your mouth still half full.',
    you: 'The adobo I helped make earned the word from three tables. Ben says my share of it is small. It is the largest thing I own.',
  },
  {
    id: 'words.ingat',
    tab: 'words',
    title: 'Ingat',
    sub: 'Take care. The word the galley sends you out the door with, and means.',
    you: 'Ben says it to everyone who leaves with a full stomach, which aboard is everyone. It works. You feel taken care of after.',
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.adobo',
    tab: 'dishes',
    title: 'Adobo',
    sub: 'Chicken braised dark in soy, cane vinegar, garlic, bay. The dish every Filipino abroad learns first.',
    you: 'Because it keeps, Ben says, and because it tastes like somebody waited up for you. We made a pot the size of the homesickness.',
  },
  {
    id: 'dishes.sinigang',
    tab: 'dishes',
    title: 'Sinigang',
    sub: 'Sour tamarind soup, sharp enough to find you wherever you are homesick.',
    you: 'Joseph had two helpings and no long face after. Ben calls sourness the fastest way home that does not require a ship.',
    rhyme: {
      with: 'dishes.sudado',
      note: 'Sour fish soup is medicine on both shores of this ocean. I have been prescribed it twice now, and twice cured.',
    },
  },
  {
    id: 'dishes.pancit',
    tab: 'dishes',
    title: 'Pancit',
    sub: 'Noodles for long life. You do not cut them, and you do not skip them.',
    you: 'Cooked for the bosun’s birthday, which the dateline ate. Long noodles, long life; the calendar owes him, not the other way.',
  },
  {
    id: 'dishes.galleycoffee',
    tab: 'dishes',
    title: 'Galley coffee',
    sub: 'Brewed by the potful, strong enough to stand the spoon up. Judged, bitterly, by every watch.',
    nani: 'The cook calls it coffee and the engineers call it evidence. I now require it, which everyone tells me is the first symptom.',
    you: 'Ríos calls it a punishment from God. She drinks four a day. Aboard, that counts as a written recommendation.',
  },

  // ---------------- people ----------------
  {
    id: 'people.ben',
    tab: 'people',
    title: 'Mang Ben',
    sub: 'Chief cook. The galley is his province, and the mess room is the heart of the ship.',
    you: 'Three pots going and one eye on whoever eats too quietly. Officially he outranks nobody. The captain says otherwise.',
  },
  {
    id: 'people.joseph',
    tab: 'people',
    title: 'Joseph',
    sub: 'Able seaman, from Kerala. Nine months down, three to go; his mother keeps the truer count.',
    you: 'Chips rust like it is meditation. Trusted me with a letter and a bundle for his amma near Kochi. The realest kind of cargo.',
  },
  {
    id: 'people.hana',
    tab: 'people',
    title: 'Hana',
    sub: 'Deck cadet, first contract, bound home to Shionoura in time for Tanabata.',
    you: 'Learns star sights for the day the satellites sulk. Lent me her sky and taught me arigatou. I owe her one harbor.',
  },
  {
    id: 'people.olena',
    tab: 'people',
    title: 'Olena',
    sub: 'Second engineer, from Odesa. Keeps the engine and a sourdough starter alive; officially in that order.',
    you: 'Her mother’s starter has crossed six oceans in a jar. I fed it and it bubbled, so by her law I am now family.',
  },
  {
    id: 'people.bosun',
    tab: 'people',
    title: 'The Bosun',
    sub: 'Master of deck, lashings, and the court of King Neptune. Kindly, with flour.',
    you: 'Two rules: one hand for the ship, and no whistling. Claims his ceremony is Viking and a thousand years old. The book disagrees quietly.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.linecrossing',
    tab: 'customs',
    title: 'Crossing the Line',
    sub: 'At the equator, pollywogs stand trial before King Neptune and rise as shellbacks.',
    you: 'Charges off a decorated manifest, flour, one bucket of warm sea, a handshake, a feast. The oldest silliness afloat, and it binds.',
  },
  {
    id: 'customs.watches',
    tab: 'customs',
    title: 'Four on, eight off',
    sub: 'The watch grid. The ship never sleeps, so the crew does it in shifts.',
    nani: 'Midnight to four is the midwatch, and it owns the stars. I traded bread for a place on the bridge wing and won the trade.',
    you: 'The village keeps three bedtimes at once. You learn to walk quietly past every door, because somebody’s night is always at noon.',
  },
  {
    id: 'customs.karaoke',
    tab: 'customs',
    title: 'Karaoke night',
    sub: 'A solemn institution. Ballads get full commitment; the machine keeps score, badly.',
    you: 'Olena sang dead serious and broke every heart aboard. I scored 74 and was cheered like a champion. Ritual, not comedy.',
  },
  {
    id: 'customs.dateline',
    tab: 'customs',
    title: 'The vanished Tuesday',
    sub: 'Westbound over the date line, the ship hands one whole day back to the sea.',
    nani: 'We crossed the line and Tuesday simply did not occur. I checked twice. The sea kept it, and I want it noted: it was mine.',
    you: 'The bosun’s birthday was on the Tuesday we skipped; officially he is now ageless. Ben cooked the pancit anyway. Noodles outrank calendars.',
  },
  {
    id: 'customs.starriver',
    tab: 'customs',
    title: 'The star river',
    sub: 'One river of stars, three names on one deck: the Mayu, the Milky Way, the Amanogawa.',
    nani: 'Mid-ocean, the Mayu runs bank to bank. I found Yacana drinking in the dark of it, exactly where my grandmother said to look.',
    you: 'The llama is not made of stars but of the dark between them. The ship is named for her. Hana’s river is the same river, waiting for July.',
    rhyme: {
      with: 'words.chaska',
      note: 'The star she was named for sails too. Mid-ocean I looked up, and the whole plain of them had followed me aboard.',
    },
  },

  // ---------------- her ----------------
  // No Nani hand here on purpose: this page is not hers, it is the galley's,
  // and it came down through two cooks before it reached you.
  {
    id: 'her.galley',
    tab: 'her',
    title: 'The singing in the galley',
    sub: 'Mang Ben, portioning rice. He had it from the cook who had it from the cook.',
    you: 'She peeled onions for her supper and sang badly for thirty-one days. I knew her my whole life and I never once heard her sing.',
  },
];

/** Open threads aboard; merged ahead of the coastal list once you sail. */
export const CROSSING_TASKS: TaskDef[] = [
  {
    when: { has: ['errand.ben-baon'], not: ['c3.baon.done'] },
    text: 'Joseph’s night lunch is cooling under its cloth. Port rail, forward, where the chipping hammer is complaining. Walk it steady.',
  },
  {
    when: { has: ['c3.met.ben'], not: ['c3.baon'] },
    text: 'Ben will find work for any hands that show up twice. The galley is through the house door; follow the garlic.',
  },
  {
    when: { has: ['c3.baon.done'], not: ['c3.cook.done'] },
    text: 'Lutong bahay night: Ben wants help with the adobo. The pot is patient, he says. One of them is lying.',
  },
  {
    when: { has: ['c3.cook.done'], not: ['c3.karaoke.done'] },
    text: 'The karaoke machine in the mess has come out from under its cover. Attendance is not so much optional as inevitable.',
  },
  {
    when: { has: ['c3.cook.done'], not: ['c3.shellback'] },
    text: 'The bosun keeps grinning at the chart, which means the equator is close and you are still a pollywog. Find him amid the containers.',
  },
  {
    when: { has: ['c3.shellback'], not: ['joseph.letter'] },
    text: 'Joseph has been patting his jacket pocket like it holds something that wants a road. Find him at the port rail.',
  },
  {
    when: { has: ['c3.shellback'], not: ['letter.read.c3.pilar'] },
    text: 'The captain has a canvas sack marked MAIL and two envelopes with your name on them. She stands on deck, forward of the house.',
  },
  {
    when: { has: ['letter.read.c3.pilar'], not: ['letter.read.c3.petro'] },
    text: 'There was a second envelope stuck to the first, the kind with a grease spot on the flap. Ask the captain again.',
  },
  {
    when: { has: ['c3.met.hana'], not: ['c3.stars.done'] },
    text: 'Hana keeps the bow after dark, where the working lights end and the sky begins. Three names for one river; bring yours.',
  },
  {
    when: { has: ['c3.met.olena'], not: ['c3.olena.bread'] },
    text: 'Olena takes her sun break at the starboard rail aft, with a glass jar she treats like a passenger. Ask about it.',
  },
  {
    when: {
      has: ['c3.cook.done', 'joseph.letter', 'c3.stars.done', 'c3.olena.bread', 'letter.read.c3.petro'],
      not: ['c3.complete'],
    },
    text: 'The crossing is nearly crossed. Report to Capitana Ríos; she has a habit of knowing when land is about to happen.',
  },
  {
    when: { has: ['c3.complete'] },
    text: 'Land birds lead the bow now. Go stand at the very point of it, by the jackstaff, and let Japan happen to you.',
  },
  {
    when: { has: ['c3.arrived'], not: ['c3.complete'] },
    text: 'The ship is a village of two dozen: the galley under the house, the bow past the containers, the rail all the way around. Meet her.',
  },
];
