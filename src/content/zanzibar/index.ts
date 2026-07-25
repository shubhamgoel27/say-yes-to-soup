import type { ChapterDef, RecallManifest } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { ZANZIBAR_EVENTS, ZANZIBAR_EXAMINES, ZANZIBAR_NODES, ZANZIBAR_NPCS } from './npcs';
import { ZANZIBAR_JOURNAL, ZANZIBAR_TASKS } from './journal';
import { KANGASHOP_MAP, ZANZIBAR_MAP } from './map';
import { SailPanel, UrojoPanel } from '../../ui/games/zanzibar';

/** Zanzibar's side of the cross-chapter ledger. */
const RECALL: RecallManifest = {
  consumes: [
    'keepsake.band', // Bi Amina reads Carmen's wrist band like a sentence
    'page.customs.pallay', // cloth that speaks, woven; names the kanga rhyme
    'page.words.chaya', // Kerala's glass of tea lights up Juma's cardamom
    'page.dishes.sudado', // sour soup as medicine; Zuberi recognizes a believer
    'page.words.lamar', // Ríos, ashore, hears her word said back to her
    'c3.shellback', // Neptune's court does not revoke; the Capitana checks
  ],
  plants: [
    'c7.arrived', // hands the task list over once you step off the jahazi
    'page.words.polepole', // the game's thesis, spoken by a whole coast
    'kanga.gift', // the second kanga, meant for giving; paid off in the Return
    'photo.c7.door', // Chasca's photo at the carved door, album fodder
    'c7.complete', // Sicily's harbor agent hears the coast vouched for you
  ],
  backfills: {
    // Knowledge keys have local locksmiths: the no-key branch teaches it anyway.
    'keepsake.band': 'c7.amina.speaks',
    'page.customs.pallay': 'c7.amina.speaks',
    'page.words.chaya': 'c7.juma.pods',
    'page.dishes.sudado': 'c7.zuberi.cure',
    'page.words.lamar': 'c7.rios.honest',
    'c3.shellback': 'c7.rios.honest',
  },
  rhymes: [
    ['words.polepole', 'people.nani'],
    ['customs.kanga', 'customs.pallay'],
  ],
};

/** Chapter Seven: a shore village near Stone Town, at the speed of the tide. */
export const CHAPTER: ChapterDef = {
  id: 'zanzibar',
  maps: [ZANZIBAR_MAP, KANGASHOP_MAP],
  npcs: ZANZIBAR_NPCS,
  nodes: ZANZIBAR_NODES,
  examines: ZANZIBAR_EXAMINES,
  events: ZANZIBAR_EVENTS,
  journal: ZANZIBAR_JOURNAL,
  tasks: ZANZIBAR_TASKS,
  letters: [
    {
      id: 'c7.pilar',
      from: 'Pilar, Mayor of the Bridge (landslide)',
      when: { has: ['pilar.gift.puffer'] },
      body: [
        'Dear constituent abroad. I have been ELECTED. Mayor of the bridge: nine votes for, zero against, one abstention (the dog, on principle).',
        'The puffer fish you posted presides over the swearing-in shelf. Voters trust a leader with exhibits. It won me the tourist demographic, both of them.',
        'My first act was to declare the bridge a city. My second was to invoice the city. Government is simple if you keep the books yourself.',
        'Send facts. Museum admission is still one, but as mayor I now also accept taxes.',
      ],
    },
    {
      id: 'c7.pilar',
      from: 'Pilar, Mayor of the Bridge (landslide)',
      body: [
        'Dear voter. You missed the election. I won in a landslide: nine votes for, zero against, one abstention (the dog, on principle).',
        'The Museum of the Sea thrives. The gift shop sells rocks, and, new this quarter, smaller rocks.',
        'As mayor I have annexed the fog and half the road. The other half votes wrong and will be dealt with by infrastructure.',
        'Send a fact for the museum. Officeholders cannot accept gifts, so I will log yours as taxes.',
      ],
    },
    {
      id: 'c7.mangben',
      from: 'Mang Ben, M/V Yacana, at sea',
      body: [
        'Kumusta from the galley. The pot you scrubbed still shines wrong in one corner. I show the new hands and say: a traveler did this, and the ocean let her pass.',
        'If you are in Zanzibar, eat the urojo twice. Once for hunger, once to understand. Sour soup is a doctrine, and we are both believers.',
        'The Capitana says the sea is a village too. She is right, but do not tell her I said so. Sinigang on Sundays, always. Some laws survive any crossing.',
      ],
    },
  ],
  games: [
    {
      flag: 'c7.sail.start',
      doneNode: 'c7.sail.done',
      make: (root, audio) => new SailPanel(root, audio as AudioBus),
    },
    {
      flag: 'c7.cook.start',
      doneNode: 'c7.cook.finish',
      make: (root, audio) => new UrojoPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    zanzibar: { scene: 'outdoor', mood: 'tideout', moodDusk: 'dusklamp' },
    kangashop: { scene: 'interior', mood: 'interior' },
  },
  moods: {
    // White-light low-tide noon: bleached, pale, the shadows short and honest.
    tideout: {
      top: 'rgba(190,205,215,0.14)',
      mid: 'rgba(235,232,220,0.05)',
      bottom: 'rgba(170,185,190,0.10)',
      vig: 0.26,
      ambient: 0xefe4cf,
    },
    // The market corner at dusk: lamp-warm, the sky giving up its blue gently.
    dusklamp: {
      top: 'rgba(70,60,110,0.16)',
      mid: 'rgba(190,110,60,0.10)',
      bottom: 'rgba(255,180,90,0.10)',
      vig: 0.3,
      glow: 'rgba(255,190,110,0.12)',
      ambient: 0xc9a075,
    },
  },
  sitLines: {
    zanzibar: [
      'The tide is still going out. It has somewhere to be, apparently, and it is not hurrying there either.',
      'Cloves on the wind from the drying mats, arriving in slow, spiced paragraphs.',
      'Two houses down, a negotiation proceeds at baraza pitch: low, patient, mostly pauses. A coconut may change hands by Friday.',
      'A cat crosses the lane, audits the jetty, then you. Everything is found adequate, and none of it is her business anymore.',
      'Out on the flats a figure bends to the mwani rows. The moon runs that farm, and the moon is never late.',
    ],
    kangashop: [
      'The stool has held a hundred bargaining sessions. It knows to keep still at the good parts.',
      'Folded color to the ceiling: a hundred printed sentences, each waiting for the right neighbor to walk past.',
      'From the back comes the snip of scissors. Somewhere a gora is becoming two kangas, one to keep, one to give.',
      'The room is cool the way the reef is cool. The walls remember being sea.',
    ],
  },
  sitKinds: ['stool'],
  arrival: { map: 'zanzibar', node: 'c7.arrive', flag: 'c7.arrived' },
  completion: {
    flag: 'c7.complete',
    plate: 'CHAPTER SEVEN · COMPLETE',
    toasts: ['✦ the coast vouches for your pace', 'deck passage north is being entered in the ledger'],
  },
};
