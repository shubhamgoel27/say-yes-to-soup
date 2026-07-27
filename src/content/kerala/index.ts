import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { KERALA_EVENTS, KERALA_EXAMINES, KERALA_NODES, KERALA_NPCS } from './npcs';
import { KERALA_JOURNAL, KERALA_TASKS } from './journal';
import { KERALA_MAP, MARIAMMA_VEEDU_MAP } from './map';
import { RECALL } from './recall';
import { ChayaPanel, RowPanel, SadyaPanel } from '../../ui/games/kerala';

/** Chapter Six: Kaithappuram, where the monsoon is the road. */
export const CHAPTER: ChapterDef = {
  id: 'kerala',
  maps: [KERALA_MAP, MARIAMMA_VEEDU_MAP],
  npcs: KERALA_NPCS,
  nodes: KERALA_NODES,
  examines: KERALA_EXAMINES,
  events: KERALA_EVENTS,
  journal: KERALA_JOURNAL,
  tasks: KERALA_TASKS,
  errands: [{ id: 'coir-rope', label: "Omana's rope coil, bound for Captain Varkey" }],
  letters: [
    // Pilar, now a candidate. Her prose style remains invoices.
    {
      id: 'kochi.pilar',
      from: 'Pilar, Bridge Authority, CANDIDATE',
      when: { has: ['pilar.gift.puffer'] },
      body: [
        'Dear business partner. I am running for Mayor of the Bridge. The bridge needed leadership and I was already standing on it.',
        'My platform: the toll stays, the facts get audited, the museum gains a second shelf. The puffer fish you mailed is my campaign manager. He has the correct face for politics: permanently astonished.',
        'The electorate is nine people and one dog. I have secured the dog with jerky. Democracy is easier than the radio makes it sound.',
        'Vote Pilar. You cannot vote, you are in India. Consider this letter your ballot, filled in correctly.',
      ],
    },
    {
      id: 'kochi.pilar',
      from: 'Pilar, Bridge Authority, CANDIDATE',
      body: [
        'Dear traveler. I am running for Mayor of the Bridge. Nobody else has declared, but I campaign anyway; landslides must be earned.',
        'My platform: the toll stays, the museum grows, the dog receives a stipend for security. The gift shop now sells rocks previously featured in scheme one.',
        'The electorate is nine people and one dog. I have secured the dog with jerky. Democracy is easier than the radio makes it sound.',
        'Vote Pilar. You cannot vote, you are in India. Consider this letter your ballot, filled in correctly.',
      ],
    },
    // Hana, home in Shionoura, watching the same weather from the other side.
    {
      id: 'kochi.hana',
      from: 'Hana, Shionoura',
      when: { has: ['wish.written'] },
      body: [
        'You made it to the green water country! Obaachan says your monsoon is the same rain that misses us, which is her way of saying small world.',
        'I think about your tanzaku sometimes. Wishes written down travel further than the paper does. Mine came true: I am home, and the sea is exactly where I left it.',
        'Eat everything. Learn the rain. Write to Obaachan; she pretends not to wait for mail, and waits.',
      ],
    },
    {
      id: 'kochi.hana',
      from: 'Hana, Shionoura',
      body: [
        'You made it to the green water country! Obaachan lit incense for your crossing and then complained about the price of incense. Both were prayers.',
        'The minshuku is full of festival gossip and empty of you. Both facts get mentioned at dinner.',
        'Eat everything. Learn the rain. Write to Obaachan; she pretends not to wait for mail, and waits.',
      ],
    },
  ],
  games: [
    {
      flag: 'c6.row.start',
      doneNode: 'c6.rowed',
      title: 'The chundan vallam',
      howTo: [
        'A golden beat travels the water toward the blades. Space exactly as it arrives.',
        'Land it clean and a hundred oars bite at once, and the whole boat surges.',
        'Miss and the song circles back for you. Lose it badly and the boat only wallows a while.',
      ],
      make: (root, audio) => new RowPanel(root, audio as AudioBus),
    },
    {
      flag: 'c6.sadya.start',
      doneNode: 'c6.sadya.served',
      title: 'The sadya leaf',
      howTo: [
        'Narrow end of the leaf points left. Arrows choose a seat, Space serves the course.',
        'Right hand only. Every dish has kept the same corner for about four generations.',
        'Nothing here can be lost. A wrong seat only buys you an auntie, and an opinion.',
      ],
      make: (root, audio) => new SadyaPanel(root, audio as AudioBus),
    },
    {
      flag: 'c6.cook.start',
      doneNode: 'c6.cook.finish',
      title: 'The meter-long pour',
      howTo: [
        'The boil will not be hurried. Nothing to press yet; waiting is the first ingredient.',
        'Then Space lifts the pouring arm, Space again lets the tea go. Height is froth.',
        'Reach too far and it rings the counter. Shaji laughs, wipes, and hands you the tumblers again.',
      ],
      make: (root, audio) => new ChayaPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    kerala: { scene: 'outdoor', mood: 'premonsoon' },
    'mariamma-veedu': { scene: 'interior', mood: 'interior' },
  },
  moods: {
    // The held breath before edavappathi: white heat, heavy air, a haze
    // that flattens the light without cooling anything.
    premonsoon: {
      top: 'rgba(240,234,205,0.16)',
      mid: 'rgba(235,224,190,0.07)',
      bottom: 'rgba(185,172,140,0.09)',
      vig: 0.24,
      ambient: 0xf5ecd4,
    },
    // After c6.rain: grey-green, silver light, a rain ceiling instead of a
    // sky. The integrator may switch the kerala map to this mood once the
    // c6.rain flag is set; the chapter's scenes already speak as if it has.
    monsoon: {
      top: 'rgba(118,138,128,0.22)',
      mid: 'rgba(110,130,122,0.12)',
      bottom: 'rgba(82,100,94,0.14)',
      vig: 0.3,
      ambient: 0xc2cfc8,
      noClouds: true,
    },
  },
  sitKinds: ['stool'],
  sitLines: {
    kerala: [
      'The channel runs its slow errands: one poler, one duck convoy, one leaf going somewhere important.',
      'The rain is rehearsing somewhere out over the lagoon. You can hear it tuning.',
      'A coconut lets go back in the grove: one drumbeat. The palms wait a decent interval before the next.',
      'Shaji’s kettle and the frogs split the afternoon between them, steam solo, chorus after.',
      'The laterite lane glows redder as the clouds stack. Colors here rise before the rain does.',
    ],
    'mariamma-veedu': [
      'The aduppu breathes coconut-husk smoke up into rafters that have smelled it all their lives.',
      'The curry pot sits with its lid on, thinking. Nobody hurries it; day two outranks day one.',
      'Joseph looks down from his photograph in merchant navy whites, permanently twenty-two.',
      'The roof reports the sky in detail: heat ticking the tiles now, rain drumming them soon.',
    ],
  },
  arrival: { map: 'kerala', node: 'c6.arrive', flag: 'c6.arrived' },
  completion: {
    flag: 'c6.complete',
    plate: 'CHAPTER SIX · COMPLETE',
    toasts: ['✦ the village calls you mone now', 'a spice ship is turning west'],
  },
};
