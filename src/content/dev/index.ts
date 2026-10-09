import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { DIG_SPOTS, EVENT_NODES, EXAMINES, NODES, NPCS } from './npcs';
import { HER_EXTENSIONS, HER_NODES } from './herthread';
import { ERRANDS, JOURNAL, TASKS } from './journal';
import { RECALL } from './recall';
import { VILLAGE_MAP } from './testmap';
import { CASA_CARMEN_MAP, CHICHERIA_MAP } from './interiors';
import { EAST_ROAD_MAP } from './eastroad';
import { LA_BAJADA_MAP } from './labajada';
import { WatiaPanel } from '../../ui/games/andes';
import { WeavePanel } from '../../ui/weave';
import { handWords } from '../../ui/games/scene';

/** Chapter One: Ch'aska Pampa, the star plain. */
export const CHAPTER: ChapterDef = {
  id: 'chaska-pampa',
  maps: [VILLAGE_MAP, CHICHERIA_MAP, CASA_CARMEN_MAP, EAST_ROAD_MAP, LA_BAJADA_MAP],
  npcs: NPCS,
  // The player's own thread rides on other chapters' Chascas; the pages it
  // fills live with those chapters, the scenes live here.
  npcExtensions: HER_EXTENSIONS,
  nodes: { ...NODES, ...HER_NODES },
  examines: EXAMINES,
  events: EVENT_NODES,
  journal: JOURNAL,
  tasks: TASKS,
  errands: ERRANDS,
  games: [
    {
      flag: 'weave.start',
      doneNode: 'carmen.woven',
      title: 'The loom',
      howTo: [
        'Watch which yarn ball lights as Carmen calls, one row at a time.',
        handWords('Then call them back with the arrows, in order.'),
        'A slipped thread is nothing. She just calls the row again.',
      ],
      hardHow: 'The fine cloth: rows of five, six, seven, called quick; answer inside a breath, and the third slipped thread sets the cloth aside.',
      make: (root, audio) => new WeavePanel(root, audio as AudioBus),
    },
    {
      flag: 'watia.start',
      doneNode: 'watia.finish',
      title: 'The watia',
      howTo: [
        'Big clods sit well at the base and smaller ones near the top, though the dome forgives any order.',
        handWords('Arrows pick a spot; Space sets the clod where a gap waits.'),
        'Then feed the fire on a steady heartbeat; a flurry only smothers it.',
        'Bring the dome down on the papas, then dig them out where the steam leaks through the earth.',
      ],
      hardHow: 'The true watia: build in order, feed the fire on a true heartbeat before the fuel spends, and bring the dome down while the clods still blaze.',
      make: (root, audio) => new WatiaPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  moods: {
    // The pass at four thousand metres: thin air, hard clean light, the ichu
    // gone to gold. Windy, not grey. It was graded 'cool' once, and with the
    // clock running the critics only ever met it as a blue dusk.
    puna: {
      top: 'rgba(255,222,160,0.12)',
      mid: 'rgba(255,232,190,0.04)',
      bottom: 'rgba(150,112,84,0.08)',
      vig: 0.24,
      ambient: 0xfff2dc,
    },
    // And the evening on it: the last sun lies along the pass and the
    // snow behind it goes rose before anything goes dark.
    alpenglow: {
      top: 'rgba(255,170,118,0.26)',
      mid: 'rgba(250,192,150,0.11)',
      bottom: 'rgba(112,86,124,0.12)',
      vig: 0.22,
      glow: 'rgba(255,196,140,0.12)',
      ambient: 0xffdcb8,
    },
  },
  meta: {
    village: { scene: 'outdoor', mood: 'warm' },
    chicheria: { scene: 'interior', mood: 'interior' },
    'casa-carmen': { scene: 'interior', mood: 'interior' },
    'east-road': { scene: 'road', mood: 'puna', moodDusk: 'alpenglow' },
    'la-bajada': { scene: 'road', mood: 'dusty' },
  },
  // Sitting: the chichería stools count, so Teófilo's room can be sat in.
  sitKinds: ['stool', 'wellseat'],
  sitLines: {
    village: [
      "The well rope creaks its one note. Rosa's flag decides, slowly, which way the wind is.",
      'The dog completes a circuit of the plaza, pausing at your feet on the way past.',
      'A door opens across the plaza and lets out the smell of onions frying. You can tell whose kitchen is whose now.',
      'On the bridge, a small person with a sign renegotiates something with a chicken. The chicken appears to be winning.',
      "The terraces climb the hill row by row, a green ledger of somebody's whole life of afternoons.",
      'Two people have already nodded at you like sitting here is a job done well.',
    ],
    chicheria: [
      'Teófilo holds court from the far table. The story has three endings so far and refuses to choose.',
      "The chomba mutters to itself in the corner, fermenting somebody's next Tuesday.",
      'A cuy crosses the floor unhurried, close along the wall.',
      'Someone pours; the first splash finds the packed earth. Nobody looks down. Everybody noticed.',
      'The room laughs a beat before the joke lands. They have heard it for fifty years. That is why.',
    ],
    'east-road': [
      "Faustino's fire burns exactly as much as it should. The wind keeps trying to make it a debate.",
      'A llama hums somewhere up the pass, holding the herd together with one long note.',
      'The ichu bends and recovers, bends and recovers. The wind is reading the pampa aloud.',
      'From here the road runs both ways: back to soup, and down to the whole rest of the world.',
      'The apacheta stands at the edge of sight, one stone taller than last week.',
    ],
  },
  dressings: [
    {
      // The famous roof ball (greatest goal ever scored in this valley) comes
      // down for players who really befriend the dog. No ladder is involved;
      // the ball reappears on the plaza where Allqu can keep an eye on it.
      map: 'village',
      when: { has: ['egg.allqu.devoted'] },
      cells: [
        [33, 25, null],
        [23, 19, { t: 'pelota', solid: true }],
      ],
    },
  ],
  // The gate celebration and dig spots keep their bespoke wiring in main.
};

export { DIG_SPOTS };
