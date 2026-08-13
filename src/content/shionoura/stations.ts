import type { EventNode, JournalEntry, NodeMap } from '../schema';
import type { StationDef } from '../../main';

/**
 * Shionoura's scheduled custom: the lamplighter's round. At dusk Fumi steps
 * out of the minshuku and walks the town lighting each chochin by hand, in
 * the same order every evening: the shotengai first, west end and back, then
 * down the lane to the quay, sea end last. The tended lamps hold their
 * daytime ember until she reaches them, so the lane comes on lamp by lamp
 * along her path instead of all at once with the dusk.
 *
 * A traveler seated anywhere on the lane when the last lamp takes learns the
 * custom without a word being spent on it.
 */
export const SHIONOURA_STATIONS: StationDef[] = [
  {
    id: 'chochin-round',
    map: 'shionoura',
    mode: 'round',
    // nightLevel crossing ~0.3 is when the windows wake; she is quicker.
    window: [0.3, 0.56],
    // Where she stands for each lamp, facing it; `lamp` is the glow cell.
    // (The fish shop's eave lantern at 4,9 is shadowed by the machiya door
    // in the object pass, so the round keeps to the five that truly hang.)
    cells: [
      { at: [11, 12], dir: 'right', lamp: [12, 12] },
      { at: [23, 11], dir: 'up', lamp: [23, 10] },
      { at: [28, 12], dir: 'left', lamp: [27, 12] },
      { at: [25, 21], dir: 'up', lamp: [25, 20] },
      { at: [26, 21], dir: 'down', lamp: [26, 22] },
    ],
    actors: ['fumi'],
    grant: { node: 'c4.ev.chochin', flag: 'c4.chochin.seen' },
  },
];

/**
 * Effects-only beat, applied silently at the last lamp if the player watched
 * the round from a seat. No dialogue opens; the journal toast is the only
 * acknowledgement, and the lit lane is the only text.
 */
export const SHIONOURA_STATION_NODES: NodeMap = {
  'c4.ev.chochin': {
    // Never opened as dialogue; kept well-formed for the graph tests.
    lines: [{ text: 'The last chochin takes. The lane has come on in the same order for longer than anyone bothers to say.' }],
    effects: ['set:c4.chochin.seen', 'journal:customs.chochin'],
  },
};

/** Listed so the reachability walker can prove the round's page earnable. */
export const SHIONOURA_STATION_EVENTS: EventNode[] = [
  { when: { has: ['c4.arrived'], not: ['c4.chochin.seen'] }, node: 'c4.ev.chochin' },
];

/** The page the round teaches. Earned only by sitting through the lighting. */
export const SHIONOURA_STATION_JOURNAL: JournalEntry[] = [
  {
    id: 'customs.chochin',
    tab: 'customs',
    title: 'The evening chochin',
    script: '提灯',
    sub: 'The lane\'s paper lanterns. No switch: at dusk one person walks the round and lights them in order, sea end last.',
    nani: 'The innkeeper lights the whole lane herself each evening, shop by shop. I asked why not electric. She said a switch cannot say good evening.',
    you: 'Fumi walks it without looking at the order; her feet keep it. I sat still through the whole round, and the lane came on around me like it was being remembered.',
  },
];
