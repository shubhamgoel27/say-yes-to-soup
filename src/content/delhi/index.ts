import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { DELHI_EVENTS, DELHI_EXAMINES, DELHI_LETTERS, DELHI_NODES, DELHI_NPCS } from './npcs';
import { DELHI_JOURNAL, DELHI_TASKS } from './journal';
import { DELHI_HAVELI_MAP, DELHI_LANGAR_MAP, DELHI_MAP, DELHI_ROOFTOP_MAP } from './map';
import { RECALL } from './recall';
import { ParanthaPanel, PatangPanel } from '../../ui/games/delhi';

/** The Delhi chapter: Kucha Aab-o-Daana, where the monsoon you chased north
 * catches up, the langar erases its own ledger, and the roofs are a country. */
export const CHAPTER: ChapterDef = {
  id: 'delhi',
  maps: [DELHI_MAP, DELHI_ROOFTOP_MAP, DELHI_LANGAR_MAP, DELHI_HAVELI_MAP],
  npcs: DELHI_NPCS,
  nodes: DELHI_NODES,
  examines: DELHI_EXAMINES,
  events: DELHI_EVENTS,
  journal: DELHI_JOURNAL,
  tasks: DELHI_TASKS,
  errands: [
    { id: 'seva-atta', label: 'Tuesday seva at the langar: sleeves up, atta ready' },
    { id: 'pigeon-home', label: 'Begum the pigeon, splinted and unimpressed, bound for Yusuf\'s roof' },
  ],
  letters: DELHI_LETTERS,
  games: [
    {
      flag: 'c11.cook.start',
      doneNode: 'c11.cook.finish',
      title: "Kamla Chachi's tawa",
      howTo: [
        'Space stops the rolling pin. Catch it in the middle of the meter and the disc comes out even.',
        'Cup the stuffing, seal it, roll again. Then the tawa: Space on the bright band, when the ghee starts to sing.',
        'Burn one and Kamla laughs and slaps down fresh dough. The burnt one goes to Sheru, who is always available.',
      ],
      make: (root, audio) => new ParanthaPanel(root, audio as AudioBus),
    },
    {
      flag: 'c11.kite.start',
      doneNode: 'c11.kite.flown',
      title: 'The patang',
      howTo: [
        'Space launches her when the breeze leans in. After that, Up is kheench, the pull; Down is dheel, the slack.',
        'Kheench while the line is taut and steady. When a gust shoves, give dheel and let her climb it like a stair.',
        'When pigeons cross, Down. Always. The sky is theirs first, and Yusuf is watching.',
        'If your dor goes, it goes. Yusuf unwinds another off the charkhi: paper is cheap, the wind is free.',
      ],
      make: (root, audio) => new PatangPanel(root, audio as AudioBus, false),
    },
    {
      flag: 'c11.duel.start',
      doneNode: 'c11.duel.won',
      title: 'The sawan tournament',
      howTo: [
        'Three rivals, a rising wind, and a storm queueing behind the fort. The same two hands: kheench and dheel.',
        'The last one flies in the storm front. Give dheel early and often; pull into a shove and your own line frays.',
        'A cut costs you that round and nothing else. Yusuf hands you the next kite and the roofs shout you back up.',
      ],
      make: (root, audio) => new PatangPanel(root, audio as AudioBus, true),
    },
  ],
  recall: RECALL,
  meta: {
    delhi: { scene: 'outdoor', mood: 'brasslight', moodDusk: 'pigeonhour', region: 'delhi' },
    'delhi-rooftop': { scene: 'outdoor', mood: 'brasslight', moodDusk: 'pigeonhour', region: 'delhi' },
    'delhi-langar': { scene: 'interior', mood: 'interior', region: 'delhi' },
    'delhi-haveli': { scene: 'interior', mood: 'interior', region: 'delhi' },
  },
  moods: {
    // Pre-storm sawan: brass light under a lid of heat, the whole lane
    // slightly overexposed, waiting for the sky to open its accounts.
    brasslight: {
      top: 'rgba(226,196,140,0.18)',
      mid: 'rgba(232,208,160,0.08)',
      bottom: 'rgba(160,130,92,0.11)',
      vig: 0.26,
      ambient: 0xf0dfb4,
    },
    // The pigeon-wheeling hour: the sky stays lit long after the lanes
    // give up. Rose-gold afterglow off the domes, a warm west-facing glow,
    // violet only at the feet. Silhouettes must read; this is the shot.
    pigeonhour: {
      top: 'rgba(255,166,110,0.30)',
      mid: 'rgba(240,170,140,0.16)',
      bottom: 'rgba(112,86,128,0.14)',
      vig: 0.2,
      glow: 'rgba(255,190,120,0.16)',
      ambient: 0xffdcb8,
    },
    // After the first storm: silver-grey rain ceiling, lanes mirrored,
    // colors rinsed and louder for it. The integrator may switch the
    // outdoor maps to this once c11.rain is set; the scenes already speak
    // as if it has.
    sawanrain: {
      top: 'rgba(122,134,142,0.22)',
      mid: 'rgba(128,140,146,0.12)',
      bottom: 'rgba(86,96,104,0.15)',
      vig: 0.3,
      ambient: 0xc4ccd2,
      noClouds: true,
    },
  },
  sitKinds: ['charpai', 'charpaibed', 'parapet', 'pangat', 'divan', 'stool'],
  sitLines: {
    delhi: [
      'The gali breathes in rickshaw bells and breathes out ghee. Somewhere a kulhad shatters, musically, on schedule.',
      'Three scripts on one signboard, four faiths on one street, one monkey auditing the wire. Nobody finds any of it remarkable.',
      'The pre-storm light turns the whole lane brass. Even the pigeons look expensive in it.',
      'A porter passes under a sack pyramid\'s worth of cargo, sneezes twice, and keeps his line like a tightrope man.',
      'Kamla\'s tawa hisses. Akhtar\'s kettle answers. The lane\'s two oldest instruments, tuning for the evening show.',
      'From high overhead comes a faint woh kata. Somewhere in the sky, paper politics.',
    ],
    'delhi-rooftop': [
      'The domes hold the last light like it was poured. The Red Fort\'s wall runs north, red as a held breath.',
      'Pigeon flocks wheel in silver sheets, each obeying a private language from a roof you cannot see.',
      'Thunderheads stack behind the fort, an audience arriving early. The kites climb anyway; paper is brave.',
      'The dhobi line semaphores the forecast: wind rising, rain likely, laundry doomed and cheerful about it.',
      'A monkey commutes the wire below, pauses over the gali, and judges the entire economy before moving on.',
      'From up here the mohalla is one creature: smoke, bells, ghee, argument. It breathes. You are inside the breath.',
    ],
    'delhi-langar': [
      'The deg simmers its one continuous sentence. It has never once cooked for fewer than everyone.',
      'Kirtan drifts in from the hall, unhurried. The dal absorbs it; everything here is seasoned with it.',
      'Rows of striped matting, all one level. The floor is the architecture\'s whole argument, and it wins.',
      'A volunteer stacks five hundred thalis with the calm of tides. Seva has no shift bell; hands arrive when they arrive.',
      'Flour hangs in the light like weather. Somewhere in it, your rotis are being eaten without ceremony. Correct.',
    ],
    'delhi-haveli': [
      'The lane roars politely outside; in here the loudest thing is ink. The couplets hold the walls up.',
      'The mango crate perfumes the room. Sweet, and many: the doctrine holds.',
      'Dust rides the light from the jaali like it has somewhere unhurried to be. It does. So do you.',
      'A thousand desires, says the wall, each worth a life. You count yours until the light moves.',
    ],
  },
  arrival: { map: 'delhi', node: 'c11.arrive', flag: 'c11.arrived' },
  dressings: [
    {
      // After the first storm, the lanes keep mirrors. Kids commandeer them.
      map: 'delhi',
      when: { has: ['c11.rain'] },
      cells: [
        [21, 15, { t: 'puddle' }],
        [9, 14, { t: 'puddle' }],
        [30, 22, { t: 'puddle' }],
        [14, 24, { t: 'puddle' }],
        [40, 18, { t: 'puddle' }],
        [27, 8, { t: 'puddle' }],
        [6, 25, { t: 'puddle' }],
        [43, 27, { t: 'puddle' }],
      ],
    },
    {
      // Tournament aftermath: cut kites come to rest on the terraces.
      map: 'delhi-rooftop',
      when: { has: ['photo.c11.kites'] },
      cells: [
        [15, 9, { t: 'kitecut' }],
        [26, 13, { t: 'kitecut' }],
        [10, 16, { t: 'kitecut' }],
      ],
    },
  ],
  completion: {
    flag: 'c11.complete',
    plate: 'OLD DELHI · COMPLETE',
    toasts: ['✦ the kucha counts you among its own', 'a chit opens the sea road west'],
  },
};
