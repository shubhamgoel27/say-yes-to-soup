import type { JournalEntry } from '../schema';
import type { TaskDef } from '../../ui/journal';

/**
 * The Zanzibar pages. Nani's 1974 hand is thoughtful here: long sittings,
 * short sentences, ink the humidity tried to argue with. This coast is
 * where her trick, walk slowly, turns out to be a whole civilization.
 */

export const ZANZIBAR_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.karibu',
    tab: 'words',
    title: 'Karibu',
    sub: 'Welcome; literally "come near." Offered with food, shade, a seat, and no exit.',
    nani: 'Everyone says it and everyone means it. I tested this for a week and was fed eleven times.',
    you: 'Bi Amina said it before she knew my name, then fed me, because a guest is a white chicken. Refusal was not on the menu.',
  },
  {
    id: 'words.pole',
    tab: 'words',
    title: 'Pole',
    sub: 'Sympathy, offered for any burden at all. Not to be confused with pole pole.',
    you: 'Salma said it while I carried her sack: I see the weight, even if I cannot take it. A whole condolence in one syllable.',
  },
  {
    id: 'words.polepole',
    tab: 'words',
    title: 'Pole pole',
    sub: 'Slowly, slowly. The pace, the philosophy, the entire operating system.',
    nani: 'Pole pole ndio mwendo, the elder says. I have been studying doing nothing with the best teacher alive.',
    you: 'Applied to me twice before it stuck: once on the bench, once at the soup. The list survived. I improved.',
    rhyme: {
      with: 'people.nani',
      note: 'A whole coast that knows my trick.',
    },
  },
  {
    id: 'words.asante',
    tab: 'words',
    title: 'Asante',
    sub: 'Thank you. Asante sana when you mean it with both hands.',
    you: 'Earned honestly with one wet sack of seaweed. Gratitude here is exact: it names the deed and moves on.',
  },
  {
    id: 'words.habari',
    tab: 'words',
    title: 'Habari',
    sub: 'The greeting ladder: news of the morning, the road, the home. Answer nzuri, then ask back.',
    nani: 'I tried to skip to my question and was returned, smiling, to the start. The greeting is not the door; it is the house.',
    you: 'Rashid restarted me from the top twice. The third time I greeted all the way down, and the village unlocked like a tide.',
  },
  {
    id: 'words.hamnashida',
    tab: 'words',
    title: 'Hamna shida',
    sub: 'No worries, in work clothes. What locals say while hakuna matata is sold to visitors.',
    you: 'Zuberi: both are real Swahili, but one now belongs to the postcards. Say hamna shida and watch the price of your soup improve.',
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.urojo',
    tab: 'dishes',
    title: 'Urojo',
    sub: 'Zanzibar mix: tangy turmeric-mango soup crowded with potatoes, bhajia, chili, lime.',
    nani: 'The island’s whole history in one bowl, and it is sour on purpose. I had it twice a day and called it research.',
    you: 'Sour, hot, crowded: the market in a bowl. Zuberi builds each one like an argument he intends to win.',
  },
  {
    id: 'dishes.mandazi',
    tab: 'dishes',
    title: 'Mandazi',
    sub: 'Cardamom-coconut fried dough. Breakfast, and the answer to several other questions.',
    you: 'Arrived hot, with no invoice, because I was a guest. Sweet enough to be kind, plain enough to be daily.',
  },
  {
    id: 'dishes.chaitangawizi',
    tab: 'dishes',
    title: 'Chai ya tangawizi',
    sub: 'Ginger tea, brewed to bite back kindly.',
    you: 'Served beside mandazi as a matched set, one soft, one sharp. The coast’s idea of a balanced argument.',
  },
  {
    id: 'dishes.pweza',
    tab: 'dishes',
    title: 'Pweza wa nazi',
    sub: 'Octopus in coconut curry. It walked the flats at low tide; it met the coconut at dusk.',
    you: 'Tender in a way that suggests a private agreement with the coconut. Zuberi calls it the island’s real food, and the island agrees.',
  },
  {
    id: 'dishes.pilau',
    tab: 'dishes',
    title: 'Pilau',
    sub: 'Spiced rice remembering Oman on one side and India on the other.',
    you: 'Friday food at the domino table, after the last bone goes down. The captains eat together or not at all.',
  },

  // ---------------- people ----------------
  {
    id: 'people.rashid',
    tab: 'people',
    title: 'Mzee Rashid',
    sub: 'The elder. Sits on his baraza the way a lighthouse sits on a coast.',
    you: 'Restarted my greeting twice without a flicker of impatience. Said one hard thing once, quietly, and poured the coffee.',
  },
  {
    id: 'people.amina',
    tab: 'people',
    title: 'Bi Amina',
    sub: 'Kanga seller. Merchant of sentences you wear.',
    you: 'Cackles at wrong proverbs and explains until you choose true. Sells cloth in pairs because the generosity is in the design.',
  },
  {
    id: 'people.juma',
    tab: 'people',
    title: 'Juma',
    sub: 'Spice farmer. Cloves, vanilla, and appointments kept by the sun.',
    you: 'Not offended when I arrived six hours sideways; delighted. The farming is the part before and after the photograph, he says.',
  },
  {
    id: 'people.salma',
    tab: 'people',
    title: 'Mama Salma',
    sub: 'Mwani farmer. Her field is the tide flat; her foreman is the moon.',
    you: 'Ties red rows one-handed at low tide, twice my speed. The water is warming and the farm walks deeper, so she walks with it.',
  },
  {
    id: 'people.dhowbuilder',
    tab: 'people',
    title: 'Fundi Issa',
    sub: 'Dhow builder. Bends mango ribs by eye, no drawings anywhere.',
    you: 'The hull rots, every hull, he says, so the boat is not the heirloom. The knowing how is, and he is mid-handover to an apprentice.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.baraza',
    tab: 'customs',
    title: 'Baraza',
    sub: 'The stone bench built into the house front, and the institution of sitting on it.',
    nani: 'I sat on one bench three days straight and was never once asked why. By the third day I was news, weather, and furniture.',
    you: 'Guests received without entering; news without knocking; silence with company. The village parliament, one bench at a time.',
  },
  {
    id: 'customs.kanga',
    tab: 'customs',
    title: 'Kanga',
    sub: 'Printed cloth sold in joined pairs, each carrying a jina: a saying along the hem.',
    nani: 'A woman here can conduct an entire argument by getting dressed. I bought two and felt armed.',
    you: 'One you wear; one is meant for giving away. Mine says no one can overcome the hand of God. The spare is waiting for its person.',
    rhyme: {
      with: 'customs.pallay',
      note: 'In the mountains the words are woven in; here they are printed on. Either way the cloth talks so the woman can keep her silence.',
    },
  },
  {
    id: 'customs.swahilitime',
    tab: 'customs',
    title: 'Saa za Kiswahili',
    sub: 'The day starts at sunrise, not midnight. Hour one is seven o’clock; subtract six.',
    you: 'I arrived six hours sideways to a raking appointment and nobody was wrong. The sun signed their clock first.',
  },
  {
    id: 'customs.mwani',
    tab: 'customs',
    title: 'Mwani farming',
    sub: 'Seaweed rows staked across the tide flats. Women’s crop, women’s money.',
    you: 'Planted at low tide, harvested at low tide, sold as food and soap. The warming shallows push the rows deeper; the farmers follow.',
  },
  {
    id: 'customs.dhowknowledge',
    tab: 'customs',
    title: 'The unwritten yard',
    sub: 'Boatbuilding passes hand to hand at Nungwi: keel first, no drawings.',
    you: 'Issa learned by watching and by being wrong slowly. The boats are mortal; the apprenticeship is the immortal part.',
  },
];

/** Fukoni's loose threads; written like directions from a friend. */
export const ZANZIBAR_TASKS: TaskDef[] = [
  {
    when: { has: ['c7.met.rashid'], not: ['c7.greeting'] },
    text: 'Mzee Rashid restarts the greeting every time you rush it. Answer the habari ladder all the way down, then ask back. There is no shortcut on purpose.',
  },
  {
    when: { has: ['c7.greeting'], not: ['c7.baraza.sat'] },
    text: 'Rashid patted the stone beside him. Sit on the baraza and let a whole nothing happen. Stay for the second sitting; it is easier.',
  },
  {
    when: { has: ['c7.baraza.sat'], not: ['c7.rashid.past'] },
    text: 'There is kahawa coming down the lane in a tall brass pot. Have a cup with Rashid; the cup is small so the sitting is long.',
  },
  {
    when: { has: ['c7.met.juma'], not: ['c7.saa'] },
    text: 'Juma expects you at saa mbili to rake the cloves. Your watch and his clock are six hours apart, and one of you is about to learn something.',
  },
  {
    when: { has: ['c7.saa'], not: ['c7.juma.cardamom'] },
    text: 'Saa mbili is eight in the morning, sunrise math. Be at the drying mats while the mats are still full.',
  },
  {
    when: { has: ['c7.met.amina'], not: ['c7.kanga.game'] },
    text: 'Bi Amina wants to play before she sells: she describes the day, you pick the kanga that answers it. Expect cackling either way.',
  },
  {
    when: { has: ['c7.kanga.game'], not: ['c7.kanga.done'] },
    text: 'You can hear cloth now, says Bi Amina. Go back to the shop for the pair: one to wear, and one that was never going to be yours.',
  },
  {
    when: { has: ['c7.met.bakari'], not: ['c7.sail.ok'] },
    text: 'Kapteni Bakari offered the ngalawa and the kaskazi. Keep the telltale streaming; luffing only slows you, and nothing out there punishes.',
  },
  {
    when: { has: ['c7.met.salma'], not: ['c7.salma.helped'] },
    text: 'Mama Salma is out on the flats with a wet sack and a back full of opinions. Low tide is her office hours; lend your arms.',
  },
  {
    when: { has: ['c7.salma.helped'], not: ['c7.salma.warm'] },
    text: 'Salma had more to say about the rows nearest the shore, if you stand still on the flats long enough to hear it.',
  },
  {
    when: { has: ['c7.met.zuberi'], not: ['c7.zuberi.dusk'] },
    text: 'Come back to the market corner at dusk, when the lamps kindle and the pweza meets the coconut.',
  },
  {
    when: { has: ['page.dishes.urojo'], not: ['c7.cook.done'] },
    text: 'Zuberi keeps a spare apron tied to the cart handle, and it has your name on it. Go behind the pot and build bowls to order. There are no wrong bowls.',
  },
  {
    when: { has: ['c7.rios.met'], not: ['c7.rios.sat', 'c7.complete'] },
    text: 'The Yacana rides past the reef and her Capitana is ashore at the jetty, off watch and slightly at sea about it. She has findings to report. Hear them.',
  },
  {
    when: { has: ['c7.arrived'], not: ['letter.read.c7.pilar'] },
    text: 'Mail waits at the shipping counter by the jetty: an envelope in the unmistakable handwriting of local government.',
  },
  {
    when: { has: ['letter.read.c7.pilar'], not: ['letter.read.c7.mangben'] },
    text: 'Ali was digging for a second envelope, the one that smells like a galley. Ask at the counter again.',
  },
  {
    when: { has: ['c7.sail.ok', 'c7.kanga.done', 'c7.baraza.sat', 'c7.greeting'], not: ['c7.complete'] },
    text: 'The sail is sailed, the cloth chosen, the bench sat. Go greet Mzee Rashid, all the way down, and hear what the coast decides.',
  },
  {
    when: { has: ['c7.complete'] },
    text: 'Ali has a freighter, Suez, the middle sea. Until the tide serves, the bench is yours too; that is what it is for.',
  },
  {
    when: { has: ['c7.arrived'], not: ['c7.complete'] },
    text: 'The village runs at the tide’s pace: an elder on his bench, a shop of talking cloth, cloves drying by the lane, and a sea floor to walk at low tide.',
  },
];
