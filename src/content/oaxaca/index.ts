import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { OAXACA_EVENTS, OAXACA_EXAMINES, OAXACA_NODES, OAXACA_NPCS } from './npcs';
import { OAXACA_JOURNAL, OAXACA_TASKS } from './journal';
import { CAMPOSANTO_MAP, COCINA_MAP, OAXACA_MAP } from './map';
import { RECALL } from './recall';
import { MolePanel, OfrendaPanel } from '../../ui/games/oaxaca';

/** Chapter Nine: the valley village, where the ledger closes both directions. */
export const CHAPTER: ChapterDef = {
  id: 'oaxaca',
  maps: [OAXACA_MAP, COCINA_MAP, CAMPOSANTO_MAP],
  npcs: OAXACA_NPCS,
  nodes: OAXACA_NODES,
  examines: OAXACA_EXAMINES,
  events: OAXACA_EVENTS,
  journal: OAXACA_JOURNAL,
  tasks: OAXACA_TASKS,
  errands: [
    { id: 'chela-chiles', label: 'Chela’s chiles, held at Eugenia’s stall' },
    { id: 'chela-choco', label: 'The good chocolate disc, from Tacho' },
    { id: 'pan-refugio', label: 'Pan de muerto, warm, for Refugio’s altar' },
  ],
  letters: [
    {
      id: 'oax.pilar',
      from: 'Pilar, Bridge Authority (co-owner: you)',
      when: { has: ['pilar.gift.puffer'] },
      body: [
        'Dear business partner. This letter contains no bridge news. The bridge would understand.',
        'It is quiet here since you left, and I have checked the ledgers: the quiet is your fault. Aurelio asks the road about you in his slow way, and the road takes an hour to answer him too.',
        'Your puffer fish watches the museum door like it is waiting for somebody. I know exactly how it feels, which is the third sentence, and the last one I will admit to.',
        'INVOICE: three (3) sentiments at one hug each, plus interest for every month you are not home. The Bridge Authority does not extend credit. Hurry.',
      ],
    },
    {
      id: 'oax.pilar',
      from: 'Pilar, Bridge Authority (co-owner: you)',
      when: { has: ['pilar.gift.star'] },
      body: [
        'Dear business partner. This letter contains no bridge news. The bridge would understand.',
        'It is quiet here since you left, and I have checked the ledgers: the quiet is your fault. Aurelio asks the road about you in his slow way, and the road takes an hour to answer him too.',
        'Your four-armed sea star sits in the museum reaching in every direction at once. I know exactly how it feels, which is the third sentence, and the last one I will admit to.',
        'INVOICE: three (3) sentiments at one hug each, plus interest for every month you are not home. The Bridge Authority does not extend credit. Hurry.',
      ],
    },
    {
      id: 'oax.pilar',
      from: 'Pilar, Bridge Authority (co-owner: you)',
      when: { has: ['pilar.gift.claw'] },
      body: [
        'Dear business partner. This letter contains no bridge news. The bridge would understand.',
        'It is quiet here since you left, and I have checked the ledgers: the quiet is your fault. Aurelio asks the road about you in his slow way, and the road takes an hour to answer him too.',
        'Your comma claw sits in the museum like a sentence waiting to go on. I know exactly how it feels, which is the third sentence, and the last one I will admit to.',
        'INVOICE: three (3) sentiments at one hug each, plus interest for every month you are not home. The Bridge Authority does not extend credit. Hurry.',
      ],
    },
    {
      id: 'oax.pilar',
      from: 'Pilar, Bridge Authority (co-owner: you)',
      body: [
        'Dear business partner. This letter contains no bridge news. The bridge would understand.',
        'It is quiet here since you left, and I have checked the ledgers: the quiet is your fault. Aurelio asks the road about you in his slow way, and the road takes an hour to answer him too.',
        'The museum keeps a shelf labeled RESERVED for whatever you bring home. It has been reserved a long time. I know how the shelf feels, which is the third sentence, and the last one I will admit to.',
        'INVOICE: three (3) sentiments at one hug each, plus interest for every month you are not home. The Bridge Authority does not extend credit. Hurry.',
      ],
    },
    {
      id: 'oax.concetta',
      from: 'Concetta, from the east coast of Sicily',
      body: [
        'The granita season closed the week you sailed, which is how I know time is passing. The mountain still smokes politely. She says nothing about you, but she is like that with everyone.',
        'Your chair at the circolo is being sat in wrong by my nephew. He loses at scopa with none of your style.',
        'Light a candle where you are going. We do that here too, in our own month. The sea between us is just a very wide table.',
      ],
    },
  ],
  games: [
    {
      flag: 'c9.mole.start',
      doneNode: 'c9.mole.stirred',
      make: (root, audio) => new MolePanel(root, audio as AudioBus),
    },
    {
      flag: 'c9.ofrenda.start',
      doneNode: 'c9.ofrenda.built',
      make: (root, audio) => new OfrendaPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    oaxaca: { scene: 'outdoor', mood: 'cempaluz' },
    cocina: { scene: 'interior', mood: 'interior' },
    camposanto: { scene: 'outdoor', mood: 'velacion' },
  },
  moods: {
    // Marigold afternoon: high dry valley light with an orange undertone.
    cempaluz: {
      top: 'rgba(255,190,110,0.12)',
      mid: 'rgba(255,224,170,0.05)',
      bottom: 'rgba(190,110,150,0.07)',
      vig: 0.26,
      ambient: 0xffe8c2,
    },
    // The candle-lit camposanto: deep blue night held back by warm glass.
    velacion: {
      top: 'rgba(24,26,58,0.34)',
      mid: 'rgba(52,40,84,0.16)',
      bottom: 'rgba(255,150,60,0.10)',
      vig: 0.42,
      glow: 'rgba(255,166,74,0.14)',
      ambient: 0x4a4c72,
      noClouds: true,
    },
  },
  sitLines: {
    oaxaca: [
      'Band practice leaks from behind a door: the same eight bars, again, again, each time nearly triumphant.',
      'Cempasuchil on the air. The scent of the field arrives whole minutes before the field does.',
      'A cohete goes up for no listed reason. The dogs object; the sky takes it well.',
      'The portales hold their strip of shade like a promise the plaza made to itself centuries ago.',
      'Papel picado shivers overhead, telling the wind apart from the stillness one snip at a time.',
    ],
    cocina: [
      'The mole is not done. The mole is nowhere near done. The mole is teaching the whole room how to wait.',
      'Steam off the comal, smoke to the rafters. The kitchen breathes slower than anywhere else in the village.',
      'On the altar shelf the veladora flames stand up straight, sit, and stand again.',
      'The spoon lies at rest across the rim of the pot, which is the kitchen’s way of saying not yet.',
    ],
    camposanto: [
      'The vigil settles in around you, family by family, blanket by blanket. Nobody hurries, and nobody speaks of leaving.',
      'One by one the candles stop flickering and steady, as if the night had put a hand around each flame.',
      'Along the wall, names are being read aloud, softly. Each name has a story attached, and each story has a laugh somewhere inside it.',
      'You are not visiting the graves. You are sitting among the family, and tonight the family is all of them, and it includes you.',
    ],
  },
  sitKinds: ['stool'],
  arrival: { map: 'oaxaca', node: 'c9.arrive', flag: 'c9.arrived' },
  completion: {
    flag: 'c9.complete',
    plate: 'CHAPTER NINE · COMPLETE',
    toasts: ['✦ the ledger closes, both directions', 'the long way home is open'],
  },
};
