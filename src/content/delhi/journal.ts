import type { JournalEntry, TaskDef } from '../schema';

/**
 * The Old Delhi pages. Nani was here in the monsoon of 1974, riding a tonga
 * from the station and losing an eating contest with honor. Her register is
 * thoughtful, like Kerala's; the rain got into her pacing and stayed there.
 */

export const DELHI_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.bhaiya',
    tab: 'words',
    title: 'Bhaiya, didi',
    script: 'भैया',
    sub: 'Brother, sister: the default address for strangers. The city is prewired for family.',
    you: 'I called Bantu bhaiya once, by accident. He fixed my rickshaw seat, his day plan, and my pronunciation, in that order.',
    rhyme: {
      with: 'words.chetta',
      note: 'The backwater said chetta, the walled city says bhaiya. Everywhere I go, strangers hand me a family and dare me to use it.',
    },
  },
  {
    id: 'words.haanji',
    tab: 'words',
    title: 'Haan ji',
    script: 'हाँ जी',
    sub: 'Yes, upholstered with respect. The mohalla runs on it like a metronome.',
    you: 'Not yes. Yes-ji. The ji is a cushion under every answer, so no reply ever lands hard. Kamla says it forty times before breakfast.',
  },
  {
    id: 'words.aurbatao',
    tab: 'words',
    title: 'Aur batao',
    script: 'और बताओ',
    sub: 'Tell me more. The second hello; it means the talk has no clock now.',
    you: 'Akhtar Bhai says it after the first sip, every time. It is not a question. It is a door being propped open with a kulhad.',
  },
  {
    id: 'words.abhi',
    tab: 'words',
    title: 'Abhi, bas paanch minute',
    script: 'अभी',
    sub: 'Right now, meaning: within the hour, the day, or the general era. Five minutes, meaning: five of something.',
    you: 'Bantu said bas paanch minute and returned at dusk, delighted, with jalebi as interest on the delay. The clock here is a suggestion box.',
    rhyme: {
      with: 'words.ahorita',
      note: 'One day you will meet abhi wearing other clothes on other coasts. Time bends the same way wherever people would rather finish the talk.',
    },
  },
  {
    id: 'words.jugaad',
    tab: 'words',
    title: 'Jugaad',
    script: 'जुगाड़',
    sub: 'The frugal fix; the workaround with dignity. Not cheating, engineering with what exists.',
    you: 'Bantu\'s rickshaw runs on parts from three machines and a prayer. On the roof an antenna stands guyed with kite string. Both work; that is the point.',
  },
  {
    id: 'words.wohkata',
    tab: 'words',
    title: 'Woh kata!',
    script: 'वो काटा',
    sub: 'THAT ONE\'S CUT: the rooftop victory cry when your line saws a rival\'s kite free.',
    you: 'You feel the other line through your fingers before you ever see it. Then the sky shouts with one voice and someone\'s kite becomes everyone\'s bird.',
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.parantha',
    tab: 'dishes',
    title: 'Parantha',
    script: 'परांठा',
    sub: 'Fried in ghee on the tawa, crisp shell, soft heart. The lane serves it the fixed old way: same four sides for every stuffing.',
    nani: 'I attempted to out-eat a parantha shop today. The shop won. The fourth parantha was banana. I lost with honor and a receipt.',
    you: 'Kamla took my hands in hers to teach the rolling. Aloo forgives, mooli tests, rabri graduates. The customer went silent, which is the trophy.',
  },
  {
    id: 'dishes.jalebi',
    tab: 'dishes',
    title: 'Jalebi',
    script: 'जलेबी',
    sub: 'Batter coiled into hot ghee, drowned in syrup, eaten scalding. Bade Mian\'s corner, one kadhai, no menu, since 1902.',
    you: 'It arrives too hot to hold and you hold it anyway. Refusing a second one is not technically possible; I have run the experiment.',
  },
  {
    id: 'dishes.kulhadchai',
    tab: 'dishes',
    title: 'Kulhad chai',
    script: 'कुल्हड़ चाय',
    sub: 'Chai in an unglazed clay cup that adds wet-earth to every sip, then shatters musically when done.',
    you: 'The cup is part of the recipe: rain-smell baked into clay. Shaji\'s glass held the pour; the kulhad holds the weather. One drink, two souvenirs.',
  },
  {
    id: 'dishes.daulat',
    tab: 'dishes',
    title: 'Daulat ki chaat',
    script: 'दौलत की चाट',
    sub: 'Milk foam set by winter dew and moonlight, saffron on top. Sold off khomchas November to February. Physically impossible in sawan.',
    nani: 'They say there is a dish here made of moonlight and dew, winter only. The halwai promised me December. I sailed before winter. He owes me still.',
    you: 'I asked in July. Akhtar laughed kindly: the moon is behind clouds; come back when your breath shows. Rabri instead, plus a promise Nani also holds.',
  },
  {
    id: 'dishes.bedmi',
    tab: 'dishes',
    title: 'Bedmi puri',
    script: 'बेड़मी पूरी',
    sub: 'Breakfast canon: dal-stuffed puri with aloo sabzi, nagori halwa on the side. Public event, begins before seven.',
    you: 'Bantu ordered for both of us without asking, which is hospitality here. The sabzi is spiced for people with a full day of arguing ahead.',
  },
  {
    id: 'dishes.roohafza',
    tab: 'dishes',
    title: 'Rooh Afza',
    script: 'रूह अफ़ज़ा',
    sub: 'The rose-herb sherbet invented in this city in 1907. Pink as a wedding, poured into milk or ice water.',
    you: 'Akhtar calls it the mohalla\'s blood type. On a hot afternoon someone hands you a glass and the whole day changes registers.',
  },
  {
    id: 'dishes.aam',
    tab: 'dishes',
    title: 'Aam, in sawan',
    script: 'आम',
    sub: 'Mango at season\'s peak: langra, chausa, crates perfuming whole lanes. Ghalib\'s doctrine: they should be sweet, and they should be many.',
    you: 'The poet\'s room keeps a crate like other rooms keep flowers. A friend told Ghalib even donkeys refuse mangoes. Exactly, he said. Even donkeys.',
  },

  // ---------------- people ----------------
  {
    id: 'people.kamla',
    tab: 'people',
    title: 'Kamla Chachi',
    sub: 'Fourth-generation parantha maker, Gali Tawe Wali. Runs the tawa like a courtroom.',
    you: 'Her rule: the gali feeds first, asks later. She corrects your rolling by taking your hands in hers, and her silence is a grading system.',
  },
  {
    id: 'people.bantu',
    tab: 'people',
    title: 'Bantu',
    sub: 'Sixteen. Cycle-rickshaw apprentice, self-appointed guide, three languages per sentence.',
    you: 'Scene kya hai, he says: what is the scene. Tension mat lo: don\'t stress. He is wrong about exactly one thing in his city and defends it like a fort.',
  },
  {
    id: 'people.yusuf',
    tab: 'people',
    title: 'Ustad Yusuf Miyan',
    sub: 'Kabootarbaz and kite-maker, king of the rooftop. Flies plain cotton dor only.',
    you: 'He talks to pigeons in a private language and to humans reluctantly. He softened when I learned the birds\' names. The sky has enough blood in it.',
  },
  {
    id: 'people.joginder',
    tab: 'people',
    title: 'Sardar Joginder Singh',
    sub: 'Sevadar at the gurdwara langar. Enormous, calm, floury to the elbows.',
    you: 'He folded my money back into my hand like it was a small confused bird. Not coins, beta. Hands. Come Tuesday, you roll rotis.',
  },
  {
    id: 'people.mehr',
    tab: 'people',
    title: 'Mehr Aapa',
    sub: 'Attar seller in the silver lane. Blends by memory, speaks in half-couplets, sells nothing to people she dislikes.',
    you: 'She made me describe rain until I got it right, then paid me in a vial of bottled monsoon. Her mother sold perfume to a Peruvian girl with a journal.',
  },
  {
    id: 'people.sethji',
    tab: 'people',
    title: 'Sethji Onkar Nath',
    sub: 'Ninth-generation spice trader, Khari Baoli end. Tests strangers by smell; ignores them otherwise.',
    you: 'Three vouches and one named cardamom coast later, his ledger opened the road to the sea. For a week I did not exist. The cure for stranger is not money.',
  },
  {
    id: 'people.sushila',
    tab: 'people',
    title: 'Sushila Jain',
    sub: 'Volunteer at the bird hospital across the street. Patient hands, zero sentimentality.',
    you: 'She splinted a manjha-cut pigeon while indicting the whole idea of kites. She and Yusuf have argued thirty years and share tea daily. Both facts hold.',
  },
  {
    id: 'people.akhtar',
    tab: 'people',
    title: 'Akhtar Bhai',
    sub: 'Chai-wallah at the gali mouth. Kulhad specialist, Ghalib-drunk, announces the rain like a sports commentator.',
    you: 'Recite any sher and the chai comes at friend price. He refused me daulat ki chaat with more tenderness than most people grant a yes.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.langar',
    tab: 'customs',
    title: 'Langar',
    script: 'ਲੰਗਰ',
    sub: 'The gurdwara\'s free kitchen: everyone eats, vegetarian, no questions. Head covered, shoes off, all seated in pangat rows on the floor.',
    nani: 'This city feeds strangers on the floor like family. I am keeping that idea. It packs small.',
    you: 'A porter and a man with a driver ate the same dal at the same level, and me between them. Nobody asked my name until after I was fed.',
    rhyme: {
      with: 'customs.ayni',
      note: 'In the mountains we wrote down every kindness so none would be lost. Here they cook so much kindness they can afford to lose count.',
    },
  },
  {
    id: 'customs.seva',
    tab: 'customs',
    title: 'Seva',
    script: 'ਸੇਵਾ',
    sub: 'Service as repayment: anyone may knead, roll, serve, sweep. No skill required, which is the point.',
    you: 'I rolled rotis badly, then less badly. The langar washes its ledger with the dishes, says Joginder, so no one is a debtor at dinner. Ayni, erased.',
  },
  {
    id: 'customs.patang',
    tab: 'customs',
    title: 'Patangbazi',
    script: 'पतंगबाज़ी',
    sub: 'The dueling kite art. Dheel is slack, kheench is the pull; rival lines cross and the sharper one saws. Cotton dor on this roof, never glass.',
    you: 'Two verbs and a whole sky. When pigeons cross, you give ground; that is Yusuf\'s one law. The wind does the rest, and the wind is in season.',
    rhyme: {
      with: 'customs.tanabata',
      note: 'In Shionoura we tied wishes to bamboo and let the sky read them. Here they fly the paper up to argue with the sky directly. Same mail, faster service.',
    },
  },
  {
    id: 'customs.kabootar',
    tab: 'customs',
    title: 'Kabootarbazi',
    script: 'कबूतरबाज़ी',
    sub: 'The old rooftop art of flying pigeon flocks, called home with whistles and syllables no two keepers share.',
    you: 'At dusk his flock wheels over the walled city and comes home to one voice. Yusuf answers only to the dead ustad who taught him; the birds, only to him.',
  },
  {
    id: 'customs.thodaaur',
    tab: 'customs',
    title: 'Thoda aur lo',
    script: 'थोड़ा और लो',
    sub: 'Take a little more. The refusal dance: a first no is never accepted, a second barely. Na means convince me.',
    you: 'I said pet bhar gaya and patted my stomach. Excellent form, said Kamla, serving one more jalebi anyway. Mathi took three tries in Kerala; here, four.',
  },
  {
    id: 'customs.mitti',
    tab: 'customs',
    title: 'Mitti attar',
    script: 'مٹی عطر',
    sub: 'Baked earth from Kannauj distilled into sandalwood oil: petrichor in a bottle. First rain, sold by the tola.',
    you: 'Delhi bottles its monsoon and wears it. Mehr Aapa made me earn a vial by describing rain. The kulhad taught my mouth; the vial taught my nose.',
  },
  {
    id: 'customs.chandni',
    tab: 'customs',
    title: 'Chandni Chowk',
    script: 'चाँदनी चौक',
    sub: 'The moonlight square: named for the moon in the old canal, not the silver shops. One street, four faiths, adjacent doorways.',
    nani: 'I rode a tonga from the station, the horse fatter than the driver. One street holds temple, mosque, gurdwara, church. Nobody calls it remarkable.',
    you: 'Bantu swears it means silver street, for the jewelers. The sevadar corrects him gently every time: moonlight, beta, in the old canal. Neither yields.',
  },
  {
    id: 'customs.sher',
    tab: 'customs',
    title: 'Sher for chai',
    script: 'شعر',
    sub: 'Recite a couplet, drink at friend price. Ghalib lived three lanes over; the exchange rate holds.',
    nani: 'I copied a Ghalib line here and a chai-wallah corrected it as tenderly as a doctor. A thousand desires, each worth a life. I have spent several.',
    you: 'Hazaaron khwahishen aisi: a thousand desires, each worth a life. I recited it half wrong; Akhtar finished it and billed the mistake to poetry.',
  },
  {
    id: 'customs.bargain',
    tab: 'customs',
    title: 'Mol-bhaav',
    script: 'मोल-भाव',
    sub: 'Bargaining as affection. First price opens negotiations; paying it instantly is faintly rude, like refusing to dance.',
    you: 'I walked away from a mango and the vendor called me back like a lost nephew: arre suniye toh! The walk-away is a dance step. The call-back is the hug.',
  },

  // ---------------- her ----------------
  {
    id: 'her.delhi',
    tab: 'her',
    title: 'Nobody, in three days',
    sub: 'Ustad Yusuf Miyan, grading the hands of everyone who has ever stood on his roof.',
    you: 'Four kites lost, no strings cut, and by his account she laughed loud enough to bring the neighbors up every single time. I have been reading her as a serious woman, because serious is what survives on paper.',
  },
  // The player's own thread (Chapter One's). Unlocked by 'her.you.delhi'.
  {
    id: 'her.you.answer',
    tab: 'her',
    title: 'What I do',
    sub: 'A correction that never came.',
    you: 'Chasca told the kite man I walk. I waited for myself to add the job, the leave, the dates. The roof did not fall in and I did not say it.',
  },
];

/** Delhi loose threads; the HUD picks the first that matches. */
export const DELHI_TASKS: TaskDef[] = [
  {
    when: { has: ['c11.arrived'], not: ['c11.met.bantu'] },
    text: 'Three days of rail and one rickshaw ride end in a chowk full of bells and pigeons. The boy grinning by the rickshaw stand seems to know everyone.',
  },
  {
    when: { has: ['c11.met.bantu'], not: ['c11.bhaiya'] },
    text: 'Bantu is showing you his mohalla one shout at a time. He keeps calling people bhaiya and didi; there is clearly a system. Ask him.',
  },
  {
    when: { has: ['c11.bhaiya'], not: ['c11.met.kamla'] },
    text: 'Bantu\'s orders: report to Kamla Chachi at the griddle in Gali Tawe Wali, and arrive hungry. The gali feeds first and asks later.',
  },
  {
    when: { has: ['c11.met.kamla'], not: ['c11.dance'] },
    text: 'Kamla Chachi fed you once and is not finished. Refusing a second helping is apparently a dance with steps. Learn them at the griddle.',
  },
  {
    when: { has: ['c11.cook.start'], not: ['c11.cook.done'] },
    text: 'Behind Kamla\'s tawa: roll even, seal gently, flip when the ghee sings. Aloo forgives, mooli tests, rabri graduates.',
  },
  {
    when: { has: ['c11.dance', 'c11.met.kamla'], not: ['c11.cook.done'] },
    text: 'Kamla has been watching your hands the way she watches dough. She thinks they are ready for the tawa. Report to the griddle.',
  },
  {
    when: { has: ['c11.arrived'], not: ['c11.met.jog'] },
    text: 'The golden dome belongs to the gurdwara; the open door under it belongs to everyone. Go in hungry. A basket of rumals waits by the door.',
  },
  {
    when: { has: ['errand.seva-atta'], not: ['c11.seva.done'] },
    text: 'Tuesday, the langar kitchen: sleeves up, atta ready. Joginder said repayment is made with hands here, not coins.',
  },
  {
    when: { has: ['c11.met.jog'], not: ['c11.met.yusuf'] },
    text: 'A whole second city lives on the rooftops. The stair climbs from the alcove off the gali. The pigeon man up there dislikes visitors; visit anyway.',
  },
  {
    when: { has: ['c11.met.yusuf'], not: ['c11.kite.done'] },
    text: 'Yusuf Miyan will teach the patang to anyone who learns the birds\' names first. Dheel is slack, kheench is the pull. The wind is in season.',
  },
  {
    when: { has: ['errand.pigeon-home'], not: ['c11.pigeon.home'] },
    text: 'Begum rides in your jacket, splinted wing and one unimpressed eye. Sushila\'s instructions: straight up the stairs, no detours, no chai.',
  },
  {
    when: { has: ['c11.met.mehr'], not: ['c11.attar.mitti'] },
    text: 'Mehr Aapa sells bottled monsoon to people who can describe rain properly. Practice describing rain. She will know if you rehearsed; rehearse anyway.',
  },
  {
    when: { has: ['c11.cook.done', 'c11.seva.done', 'c11.kite.done'], not: ['c11.chit.bombay'] },
    text: 'Kamla vouches you can feed people, Joginder that you can serve, Yusuf that you can read the wind. Carry all three names to Sethji at the spice end.',
  },
  {
    when: { has: ['c11.met.akhtar'], not: ['c11.rain'] },
    text: 'Akhtar Bhai keeps looking at the sky like it owes him a headline. Stay near the chai corner; he announces the rain the way other men announce cricket.',
  },
  {
    when: { has: ['c11.kite.done', 'c11.rain'], not: ['c11.duel.done'] },
    text: 'The mohalla\'s rooftop tournament flies at dusk, and Yusuf has entered you for the kucha. Cotton dor, three rivals, and weather with opinions.',
  },
  {
    when: { has: ['c11.duel.done'], not: ['photo.c11.kites'] },
    text: 'Chasca is on the rooftop with her camera and the storm, both fully charged. She wants you in the frame before the sky finishes arriving.',
  },
  {
    when: { has: ['c11.arrived'], not: ['letter.read.delhi.pilar'] },
    text: 'A red post box stands on the chowk, imperially confident. Mail has a way of finding you; it found this box first.',
  },
  {
    when: { has: ['c11.duel.done', 'c11.chit.bombay'], not: ['c11.complete'] },
    text: 'Flown, fed, served, vouched, soaked. Go and stand in front of Kamla Chachi; she has been packing something and pretending she is not.',
  },
  {
    when: { has: ['c11.complete'] },
    text: 'Sethji\'s chit is in your pocket; Bantu\'s rickshaw waits at the stand. Rail south to Bombay, then the sea road west. The gali keeps your mornings.',
  },
  {
    when: { has: ['c11.arrived'], not: ['c11.complete'] },
    text: 'Kucha Aab-o-Daana: the gali of the griddle, the spice end, the chowk, the rooftops. Walk it slowly; it is loud, but it notices.',
  },
];
