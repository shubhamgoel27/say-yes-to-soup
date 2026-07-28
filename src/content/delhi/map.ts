import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Kucha Aab-o-Daana: a knot of lanes off Chandni Chowk, Old Delhi, in sawan.
 * The gali is the street, the rooftop is the sky, and the whole mohalla is
 * one kitchen with many doors. Real landmarks stay at the edges; every shop
 * inside the playable slice is fiction, lovingly furnished.
 *
 * Three bands of havelis, three lanes between them, the spice market piled
 * up at the west end, the chowk opening east. Above it all, a second map.
 */

const W = 48;
const H = 31;

/** Haveli anchors: 5x5 casa-grid footprints, door at [+2,+4]. */
const HAVELIS: [number, number][] = [
  // Band one: the hakims' lane frontage. The poet's haveli is [10,1].
  [3, 1], [10, 1], [17, 1], [24, 1], [31, 1],
  // Band two: Gali Tawe Wali's north side. Kamla's shop is [13,9].
  [13, 9], [21, 9], [28, 9], [33, 9],
  // Band three: between the gali and the kinari lane.
  [3, 16], [10, 16], [17, 16], [24, 16], [31, 16],
];

/** Doors that open: the poet's haveli. Every other latch keeps its counsel. */
const OPEN_DOORS = new Set(['10,1']);

/** The gurdwara: same 5x5 grid, its own art, door always open. */
const GURDWARA: [number, number] = [40, 1];

const inPlaza = (x: number, y: number) => x >= 38 && x <= 46 && y >= 1 && y <= 29;

/**
 * The maidan does not begin on a line. The cricket has worn the kinari
 * lane's stone away in front of the wicket wall, and the shopkeepers at the
 * east end sweep their stone back every morning, so the dirt starts a row
 * later there. Same ground, no rectangle.
 */
const maidanEdge = (x: number) => (x >= 7 && x <= 18 ? 22 : x >= 26 && x <= 33 ? 24 : 23);
const inMaidan = (x: number, y: number) => x >= 1 && x <= 37 && y <= 29 && y >= maidanEdge(x);

/**
 * The desire line: everyone walking from the chowk to the gali mouth cuts
 * the corner, and has for two hundred years. Stone dust shows where.
 */
const onTrack = (x: number, y: number) =>
  x >= 15 && x <= 37 && Math.abs(y - (26 - (37 - x) * 0.16)) < 0.6;

const inSpice = (x: number, y: number) => x >= 1 && x <= 12 && y >= 9 && y <= 13;
const inGali = (y: number) => y >= 14 && y <= 15;

/** Ground, with worn transitions: where two pavings meet, a strip of
 * scuffed in-between ground runs along the seam, ragged at the edges
 * (deterministic), the way traffic actually sands a boundary. */
function groundAt(x: number, y: number): string {
  if (inPlaza(x, y)) {
    // The chowk brick loses its first courses to the through traffic.
    if (x === 38) return '~';
    if (x === 39 && cellHash(x, y, 31) < 0.4) return '~';
    return '=';
  }
  if (inMaidan(x, y)) {
    const e = maidanEdge(x);
    // The maidan's top edge is beaten to neither-dirt-nor-stone, and the
    // cut-through to the chowk is beaten the same way clean across it.
    if (y === e) return '~';
    if (y === e + 1 && cellHash(x, y, 32) < 0.3) return '~';
    if (onTrack(x, y)) return '~';
    if ((onTrack(x, y - 1) || onTrack(x, y + 1)) && cellHash(x, y, 36) < 0.35) return '~';
    if (x === 37) return '~';
    if (x === 36 && cellHash(x, y, 32) < 0.4) return '~';
    return '.';
  }
  // The kinari lane's last row wears down toward the maidan.
  if (y === 22 && x <= 37 && cellHash(x, y, 33) < 0.5) return '~';
  if (x === 37 && y >= 6 && cellHash(x, y, 34) < 0.45) return '~';
  return '-';
}

/**
 * The love pass: small true things, placed where the mohalla keeps them.
 *
 * Two rules run through all of it. Nothing sits on one line at even
 * spacing: things come in knots of two and three with unequal air between
 * them. And in the two-tile lanes the trade keeps to the north row so the
 * south row stays walkable from one end of the map to the other, which is
 * also how a real gali works, because the shops are on the shop side.
 */
const DECOR: Record<string, string> = {
  // ---- Lane one, the hakims' lane: quiet trades, old smells. Three rows
  // deep, so nothing has to queue up on any one of them.
  '8,6': 'a', // Mehr Aapa's attar case, amber rows
  '5,8': 'q', // a charpai, publicly napped upon
  '10,6': 'J', // a board over a door, three scripts and one failing tube light
  '11,8': 'O', // and the shop's goods, one tile into the lane
  '15,6': 'l', // a wire bundle sagging between havelis
  '16,7': 'L', // cloth strung balcony to balcony over your head
  '22,6': 'w', // the wedding-card stall, fanned in red and gold
  '21,8': 'O',
  '24,7': 'I', // the wire span, crossing high enough to walk under
  '30,8': 'b', // book bundles bound with jute, Sunday stock
  '28,8': 's', // signboards stacked three scripts deep
  '33,7': 'I',
  '35,8': 'N', // a neem in a cut drum, the lane's one green
  // ---- The spice end: Khari Baoli in miniature. Sacks stack against walls
  // and against each other, never in a line down the middle of the floor.
  // Two piles up against the north wall and the rest banked low, so the
  // weighing floor between them stays clear for the porters and the carts.
  '1,9': 'y', '2,9': 'y', // the west wall pile
  '5,9': 'y', '6,9': 'y', // the second pile
  '11,9': 'y', // the third, banked against the party wall
  '5,11': 'e', // Sethji's gaddi: white cushion, brass scale, ledger
  '9,11': 'z', // chilli, weaponized air
  '1,12': 'z', '10,12': 'z', '12,12': 'y',
  '3,13': 'O',
  '12,11': 'J',
  // ---- Gali Tawe Wali itself. Two tiles wide and four storeys tall, and
  // most of what it owns is in the air: wire bundles at three heights,
  // cloth balcony to balcony, boards jutting over your head, and a shop's
  // worth of steel spilling into the walking room because it always has.
  '4,15': 'I',
  '6,14': 'J',
  '7,14': 'O',
  '9,14': 'I',
  '11,15': 'L',
  '12,14': 's',
  '13,14': 'O',
  '14,15': 'I',
  '16,14': 'g', // Kamla Chachi's tawa, the lane's courtroom
  '18,14': 'L',
  '20,14': 'f', // a lamp on a pole, wired with hope
  '21,14': 'N',
  '22,15': 'I',
  '23,14': 'q',
  '24,14': 'O',
  '26,14': 'l', // the old bundle, a python that ate the twentieth century
  '27,15': 'L',
  '29,14': 'J',
  '31,14': 'O',
  '32,15': 'K', // spent kulhads, shattered musically
  '33,14': 'c', // Akhtar Bhai's chai corner
  '34,14': 'I',
  '35,14': 'k', // kulhads in a clay tower
  '36,14': 'h', // the halwai's wicker khomcha, off duty until winter
  '37,14': 'j', // Bade Mian's jalebi kadhai, since 1902
  // ---- The kinari lane: trims, garlands, commuting monkeys.
  '5,21': 'l',
  '6,22': 'm',
  '10,22': 'm', '13,22': 'm',
  '11,21': 'G', // marigold garlands strung shoulder-high
  '16,22': 'I',
  '19,21': 'O',
  '20,21': 't', // a thela of mangoes, langra side up
  '23,21': 'N',
  '26,22': 'L',
  '28,21': 'o', // the monkey wire, rush hour at dawn
  '31,21': 's',
  '32,21': 'J',
  // ---- The maidan: gully cricket, public water, a rickshaw depot, and one
  // peepal wide enough to hold a whole afternoon underneath it.
  '4,28': 'p', // the peepal: the maidan's roof, and its clock
  '5,26': 'q', // the charpai under it, occupancy always one nap
  '7,28': 'K',
  // The pitch: a chalked strip with a wall at each end, so the emptiest
  // part of the map is a room and not a field. Twenty-two yards, roughly,
  // if a yard is what a nine-year-old says it is.
  '8,26': 'W', // the wicket wall, chalked and contested
  '9,26': '5', '10,26': '5', '11,26': '5', '12,26': '5', '13,26': '5', '14,26': '5',
  '16,26': 'W', // the far wicket, painted on somebody's back wall
  '15,24': 'P', // the hand pump, cold iron, free forever
  '14,25': '3', // the pump's permanent puddle, pigeon-approved
  '17,25': 'K', // kulhads that came for water and stayed forever
  '19,24': '4', '20,24': '4', // mango crates staged for the evening thela run
  '20,28': 't', // the second thela, off shift, still perfuming
  '22,24': 'q',
  // The dhobis' drying ground: colour laid flat across the widest tan, in
  // a loose knot, because that is how four lengths of cloth actually land.
  '16,28': 'C', '18,29': 'C', '19,27': 'C', '21,28': 'C',
  '24,28': 'p', // the mid-field peepal, and the shade everybody fields in
  '23,28': 'q',
  '26,29': 'K',
  '29,28': 'q', // the drivers' waiting charpai, occupancy always one nap
  '31,27': 'r', '32,26': 'r', '33,26': 'r', // Bantu's uncle's fleet, nose to tail
  '35,24': '4', '33,28': '4',
  // ---- The chowk: everything faces everything, so nothing faces a wall.
  '45,7': 'n', // the nishan sahib, saffron over the whole square
  '44,9': 'v', // the bird ward table, cotton and splints
  '40,11': 'p', // the peepal, older than the pavement opinions
  '41,13': 'q', // the charpai in its shade, first come
  '44,14': 'G', // garlands, sold by the arm's length
  '39,15': 'f',
  '45,17': 'J',
  '44,18': 'N',
  '45,19': 'd', // the red post box, fed with letters for everywhere
  '44,21': 'O',
  '46,22': 'q',
  '40,24': 'r', '43,25': 'r', // the chowk end of the rickshaw stand
};

function objectAt(x: number, y: number): string {
  // Boundary: the walled city walls you in politely.
  if (y === 0 || y === H - 1 || x === 0 || x === W - 1) return 'M';
  // Buildings first: haveli grids, then the gurdwara.
  for (const [hx, hy] of HAVELIS) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'H';
      return 'x';
    }
  }
  const [gx, gy] = GURDWARA;
  if (x >= gx && x < gx + 5 && y >= gy && y < gy + 5) {
    if (x === gx + 2 && y === gy + 4) return ' ';
    if (x === gx && y === gy + 4) return 'U';
    return 'x';
  }
  // Band one has no gaps to the north; the wall of the mohalla continues.
  if (y >= 1 && y <= 5 && x <= 37) return 'M';
  if (y >= 1 && y <= 5 && x >= 38) return 'M'; // plaza's north edge beside the gurdwara
  // The stair to the rooftop: an alcove off the gali, up the party wall.
  if (x === 18 && y === 9) return 'M';
  if (x === 18 && y === 10) return 'u';
  const dec = DECOR[`${x},${y}`];
  if (dec) return dec;
  // Deterministic small life, banked rather than sprinkled. Grass takes the
  // corners of the maidan the cricket never reaches; pigeons keep to the
  // pump, the peepals and the bird ward; spice dust lies where the sacks
  // are. cellHash only; the world never crawls.
  const nearPump = x >= 13 && x <= 18 && y >= 23 && y <= 26;
  const nearPeepal = (x >= 38 && x <= 43 && y >= 9 && y <= 14) || (x >= 3 && x <= 8 && y >= 25 && y <= 29);
  if (nearPump || nearPeepal) {
    if (cellHash(x, y, 11) < 0.22) return '1';
  }
  if (inSpice(x, y)) {
    const nearSacks = cellHash(x, y, 12) < 0.16 && (x <= 2 || (x >= 6 && x <= 12));
    if (nearSacks) return '2';
  }
  if (inGali(y) && x <= 10 && cellHash(x, y, 13) < 0.08) return '2';
  if (inMaidan(x, y) && !onTrack(x, y)) {
    // Grass grows where feet do not: the far south, and the two ends.
    const edge = y >= 27 || x <= 6 || x >= 34;
    if (edge && cellHash(x, y, 14) < 0.13) return 'i';
    if (!edge && cellHash(x, y, 14) < 0.02) return 'i';
  }
  return ' ';
}

function paint(): { ground: string[]; objects: string[] } {
  const ground: string[] = [];
  const objects: string[] = [];
  for (let y = 0; y < H; y++) {
    let g = '';
    let o = '';
    for (let x = 0; x < W; x++) {
      g += groundAt(x, y);
      o += objectAt(x, y);
    }
    ground.push(g);
    objects.push(o);
  }
  return { ground, objects };
}

const { ground, objects } = paint();

export const DELHI_MAP: MapData = {
  id: 'delhi',
  name: 'Kucha Aab-o-Daana',
  spawn: [42, 26],
  spawnFacing: 'up',
  smoke: [
    [15, 10], // Kamla's chimney, working since before breakfast
    [41, 2], // the langar kitchen never quite goes out
  ],
  triggers: [
    { at: [12, 5], type: 'door', to: 'delhi-haveli', spawn: [8, 9], facing: 'up' },
    { at: [42, 5], type: 'door', to: 'delhi-langar', spawn: [10, 11], facing: 'up' },
    { at: [18, 11], type: 'door', to: 'delhi-rooftop', spawn: [3, 16], facing: 'up' },
  ],
  legend: {
    '-': { t: 'galistone' },
    '=': { t: 'chowkbrick' },
    '.': { t: 'dirt' },
    '~': { t: 'wornedge' },
    M: { t: 'mohallawall', solid: true, tall: true },
    H: { t: 'haveli', solid: true, tall: true },
    U: { t: 'gurdwara', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    u: { t: 'stairup', solid: true, tall: true },
    a: { t: 'attarcase', solid: true, tall: true },
    b: { t: 'bookbundle', solid: true },
    c: { t: 'chaikhana', solid: true, tall: true },
    d: { t: 'dakkhana', solid: true, tall: true },
    e: { t: 'sethgaddi', solid: true, tall: true },
    f: { t: 'farol', solid: true, tall: true },
    g: { t: 'paranthagriddle', solid: true, tall: true },
    h: { t: 'khomcha', solid: true, tall: true },
    j: { t: 'jalebikadhai', solid: true, tall: true },
    k: { t: 'kulhadtower', solid: true, tall: true },
    l: { t: 'wirebundle', solid: true, tall: true },
    m: { t: 'marigoldheap' },
    n: { t: 'nishansahib', solid: true, tall: true },
    o: { t: 'monkeywire', solid: true, tall: true },
    p: { t: 'peepal', solid: true, tall: true },
    q: { t: 'charpai', solid: true },
    r: { t: 'rickshaw', solid: true, tall: true },
    s: { t: 'signstack', solid: true, tall: true },
    t: { t: 'thela', solid: true, tall: true },
    v: { t: 'birdward', solid: true, tall: true },
    w: { t: 'cardstall', solid: true, tall: true },
    y: { t: 'sackpyramid', solid: true, tall: true },
    z: { t: 'chilisacks', solid: true, tall: true },
    W: { t: 'gullywall', solid: true, tall: true },
    P: { t: 'handpump', solid: true, tall: true },
    G: { t: 'garlandline', solid: true, tall: true },
    K: { t: 'kulhadshards' },
    C: { t: 'dryingcloth' },
    I: { t: 'wirespan', tall: true },
    L: { t: 'clothspan', tall: true },
    O: { t: 'shopspill', solid: true, tall: true },
    J: { t: 'signjut', solid: true, tall: true },
    N: { t: 'neemtub', solid: true, tall: true },
    i: { t: 'tuft' },
    '1': { t: 'pigeonpeck' },
    '2': { t: 'spicespill' },
    '3': { t: 'puddle' },
    '4': { t: 'mangocrate', solid: true },
    '5': { t: 'chalkpitch' },
  },
  ground,
  objects,
};

// ------------------------------------------------------------- the rooftop

const RW = 38;
const RH = 20;

/**
 * The roofline steps, because the houses under it were built two centuries
 * apart and nobody levelled anything. These say where each terrace's north
 * parapet and south parapet sit, column by column; the walls between the
 * steps are worked out from them, so the seams come out ragged on purpose.
 */
const roofDivN = (x: number) => (x <= 14 ? 8 : x <= 25 ? 6 : 9);
const roofDivS = (x: number) => (x <= 8 ? 15 : x <= 21 ? 13 : 16);

/** Where feet insist on a way through. Two adjacent cells, never centred. */
const ROOF_GAPS = new Set([
  '5,8', '6,8', '18,6', '19,6', '31,9', '32,9', // through the north parapets
  '3,15', '4,15', '16,13', '17,13', '30,16', '31,16', // through the south ones
  '26,4', // the neighbours' door in the shared wall
  '8,12', // the way from the laundry deck onto the kite deck
]);

/** Party walls: where two households share a roof and agree about it. */
const ROOF_PARTY: [number, number, number][] = [
  [26, 2, 5], // the antenna roof keeps itself to itself
  [8, 10, 14], // the dhobi deck's western boundary
];

/** Every parapet cell: the two stepped runs, the staircases that join their
 * steps, the party walls, and the roof's own outer rail. */
function roofParapets(): Set<string> {
  const cells = new Set<string>();
  const add = (x: number, y: number) => {
    if (!ROOF_GAPS.has(`${x},${y}`)) cells.add(`${x},${y}`);
  };
  for (const div of [roofDivN, roofDivS]) {
    for (let x = 0; x < RW; x++) {
      add(x, div(x));
      // Where the run steps, the wall turns and climbs the difference.
      const prev = div(x - 1);
      const here = div(x);
      if (x > 0 && prev !== here) {
        for (let y = Math.min(prev, here); y <= Math.max(prev, here); y++) add(x, y);
      }
    }
  }
  for (const [x, y0, y1] of ROOF_PARTY) for (let y = y0; y <= y1; y++) add(x, y);
  for (let x = 0; x < RW; x++) {
    cells.add(`${x},1`);
    cells.add(`${x},${RH - 1}`);
  }
  for (let y = 1; y < RH; y++) {
    cells.add(`0,${y}`);
    cells.add(`${RW - 1},${y}`);
  }
  return cells;
}

const ROOF_WALLS = roofParapets();

/**
 * Rooftop furniture. Composed, not sprinkled: each terrace gets one shape
 * big enough to land the eye, a knot of small true things somewhere off to
 * one side of it, and a stretch of swept lime with nothing on it at all,
 * because that is where the birds come down and the kites go up.
 */
const ROOF_DECOR: Record<string, string> = {
  // ---- Yusuf's terrace, north-west. The tank stack anchors the west end,
  // the coop holds the east, and the swept floor between them is not empty:
  // it is the flock's, and at pigeon hour it is the busiest place up here.
  '3,3': 'W', // the tank stack: black Sintex, blue drum, three storeys of plumbing
  '2,6': 'm', // the kite mast, lashed to the west parapet
  '5,7': 'S', // last week's chai summit, in shards
  '9,3': 'K', // Yusuf's kabootar khana, whitewashed, named tenants, full house
  '9,4': 'G', '7,4': 'G', '3,5': 'G', // the flock's payroll office
  // The flock itself, down on the swept floor in one grey carpet three
  // tiles across. A crowd is a shape. A sprinkle of the same crowd is lint.
  '4,4': 'B', '5,4': 'B', '6,4': 'B', '5,5': 'B', '6,5': 'B',
  '11,3': '1', '10,5': '1',
  '11,2': 'k', // patangs leaning in a paper rainbow
  '12,5': 'c', // the charkhi, wound with plain cotton dor
  '13,6': 'T', // the tulsi, watered before the birds, always
  '13,2': 'x', // a cut kite from some other roof's victory
  // ---- The drying terrace, north-middle: the neighbours' mumty, one line,
  // one cot for the nights the room downstairs gives up.
  '16,5': 'M',
  '20,3': 'd', // the dhobi line, flying the mohalla's flags
  '23,4': 'q',
  '24,2': 'T',
  '21,5': '1', '22,5': '1',
  '15,2': 'S',
  // ---- The antenna roof, north-east: television by ambition. The dish is
  // the palest thing on the map and it is meant to be.
  '30,4': 'A', // the dish, aimed at a satellite the lane has opinions about
  '27,2': 'a', '34,3': 'a', // two masts of jugaad, aerial division
  '35,7': 'w',
  '32,7': 'k', // the neighbour kids' kite cache, allegedly hidden
  '28,7': 'x',
  '36,5': 'S',
  '29,8': '1', '30,8': '1',
  // ---- The dhobi deck, west-middle: laundry in bulk, one cot, one neem.
  '4,10': 'd',
  '7,9': 'w',
  '2,13': 'n', // a neem in a cut drum: the roof's one shade and only green
  '6,13': 'q', // a charpai dragged up for the season
  '1,11': 'T',
  '3,12': 'S',
  // ---- The kite deck: the hero of the whole chapter. One mast, one tank,
  // one tight knot of kite kit, and a clear floor to fly off.
  '19,8': 'm', // the kite mast, flying whatever the roof currently declares
  '16,9': 'k',
  '15,10': 'c', // the spare charkhi, mid-rewind
  '17,10': 'j', // one stool, for the person whose turn it is not
  '24,10': 'W', // the neighbour's tank stack, closing the deck to the east
  '22,8': 'N', // a cut kite snagged on a bamboo pole, kept as a trophy
  '11,11': 'd', // the third line; the mohalla launders industrially
  '10,10': 'q',
  '22,7': 'D', // diyas on the north ledge, lit for the dusk flight
  '13,10': '1', '14,10': '1', '13,11': '1',
  '23,13': 'S',
  '24,15': 'x', '25,15': 'x', // paper drifted into the corner, where paper goes
  // ---- The quiet neighbour, east-middle: bedding, a line, one philosopher.
  '31,11': 'Q', // bedding aired against the parapet since dawn
  '33,13': 'd',
  '35,11': 'T',
  '28,13': 'n',
  '30,14': 'S',
  '34,14': '1', '35,14': '1',
  // ---- The parliament terrace, south: the mumty you came up through, the
  // tank you have to walk around, and the evening's committee at the far end.
  '2,17': 'M', // the mumty: brick room, tin hat, bottle-green door
  '9,16': 'W', // the tank stack everybody walks around and nobody moves
  '11,17': 'n',
  '16,16': 'Q', // the parliament charpai, bedding and all
  '17,16': 'F', // its transistor, volume set by committee
  '17,17': 'C', // the chai tray: kettle, kulhads, quorum
  '15,17': 'j', '18,17': 'j', // two stools, one argument about wind
  '13,14': 'D', '20,15': 'D', // the ledge diyas, first lit, last out
  '19,15': 'T',
  '13,18': 'S',
  // ---- The south-east strip: its own mumty, its own philosopher, its own cot.
  '33,18': 'M',
  '35,17': 'q',
  '29,18': 'T',
  '34,18': 'S',
  '23,17': 'x',
  '26,18': '1', '27,18': '1',
};

function roofObjectAt(x: number, y: number): string {
  // The skyline row: Jama Masjid's domes and the Red Fort's long red wall,
  // painted as distance. You cannot walk to them. You can only look.
  if (y === 0) {
    if (x === 7 || x === 24) return 'J';
    return 'R';
  }
  if (ROOF_WALLS.has(`${x},${y}`)) {
    // A parapet with a neighbour beside it is a wall running east to west
    // and is drawn face-on; one with only neighbours above and below is the
    // same wall seen end-on, and needs the art that joins up vertically.
    const sideways = !ROOF_WALLS.has(`${x - 1},${y}`) && !ROOF_WALLS.has(`${x + 1},${y}`);
    return sideways ? 'P' : 'p';
  }
  return ROOF_DECOR[`${x},${y}`] ?? ' ';
}

/**
 * Every house up here paints its own roof and none of them agree. Lime on
 * the old north terraces, brick dust on the newer antenna roof, worn tan
 * across the middle, rose down south. The stepped parapets do the joining,
 * so no coat is a rectangle and no seam runs the width of the map.
 */
function roofGroundAt(x: number, y: number): string {
  if (y <= roofDivN(x)) return x >= 26 ? 'v' : 'h';
  if (y <= roofDivS(x)) return x <= 8 ? 'h' : '.';
  return x >= 22 ? '.' : 'v';
}

function paintRoof(): { ground: string[]; objects: string[] } {
  const ground: string[] = [];
  const objects: string[] = [];
  for (let y = 0; y < RH; y++) {
    let g = '';
    let o = '';
    for (let x = 0; x < RW; x++) {
      g += roofGroundAt(x, y);
      o += roofObjectAt(x, y);
    }
    ground.push(g);
    objects.push(o);
  }
  return { ground, objects };
}

const roof = paintRoof();

export const DELHI_ROOFTOP_MAP: MapData = {
  id: 'delhi-rooftop',
  name: 'The Rooftop Republic',
  spawn: [3, 16],
  spawnFacing: 'up',
  triggers: [{ at: [3, 17], type: 'door', to: 'delhi', spawn: [18, 12], facing: 'down' }],
  legend: {
    '.': { t: 'terrace' },
    h: { t: 'terracelime' },
    v: { t: 'terracerose' },
    R: { t: 'fortwall', solid: true, tall: true },
    J: { t: 'jamadomes', solid: true, tall: true },
    p: { t: 'parapet', solid: true },
    P: { t: 'parapetside', solid: true },
    K: { t: 'kabootarkhana', solid: true, tall: true },
    k: { t: 'kitestack', solid: true, tall: true },
    c: { t: 'charkhi', solid: true },
    w: { t: 'watertank', solid: true, tall: true },
    d: { t: 'dhobiline', solid: true, tall: true },
    a: { t: 'antennajugaad', solid: true, tall: true },
    o: { t: 'monkeywire', solid: true, tall: true },
    q: { t: 'charpai', solid: true },
    Q: { t: 'charpaibed', solid: true },
    W: { t: 'tanktrio', solid: true, tall: true },
    A: { t: 'dishantenna', solid: true, tall: true },
    M: { t: 'mumty', solid: true, tall: true },
    n: { t: 'neemtub', solid: true, tall: true },
    m: { t: 'kitemast', solid: true, tall: true },
    T: { t: 'tulsipot', solid: true },
    F: { t: 'transistor', solid: true },
    C: { t: 'chaitray', solid: true },
    D: { t: 'diyaledge', solid: true },
    N: { t: 'kitesnag', solid: true, tall: true },
    j: { t: 'stool', solid: true },
    S: { t: 'kulhadshards' },
    x: { t: 'kitecut' },
    G: { t: 'grainspill' },
    B: { t: 'pigeonflock' },
    '1': { t: 'pigeonpeck' },
  },
  ground: roof.ground,
  objects: roof.objects,
};

// ------------------------------------------------------------- the langar

/** Sis Ganj's langar hall: one floor, one level, everyone on it. The kitchen
 * end never sleeps; the pangat rows wait in stripes; nothing here is scored. */
export const DELHI_LANGAR_MAP: MapData = {
  id: 'delhi-langar',
  name: 'The Langar Hall',
  spawn: [10, 11],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    N: { t: 'khandapanel', solid: true, tall: true },
    C: { t: 'chulha', solid: true },
    D: { t: 'degpot', solid: true, tall: true },
    L: { t: 'ladlestand', solid: true, tall: true },
    A: { t: 'attaboard', solid: true },
    r: { t: 'rotistack', solid: true },
    T: { t: 'thalistack', solid: true },
    S: { t: 'shelf', solid: true, tall: true },
    W: { t: 'waterstation', solid: true, tall: true },
    F: { t: 'hallfan', solid: true, tall: true },
    g: { t: 'pangat' },
    s: { t: 'shoerack', solid: true },
    B: { t: 'rumalbasket', solid: true },
    d: { t: 'doormat' },
    m: { t: 'mat' },
  },
  ground: [
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
    '....................',
  ],
  objects: [
    // The pangat rows are the hall's whole argument, so they stay rows. What
    // they stop being is a grid: they start where the queue reached, end
    // where it stopped, and the aisles between them are wide enough to carry
    // a deg down.
    //
    // The chulha has come two cells out of the north-west corner and down a
    // row, so it stands at the head of the first pangat row instead of behind
    // the frame edge. This was the only room in the game with no fire visible
    // from the door: a langar hall whose hearth you had to go looking for.
    '##########N#########',
    '# DD  L      A rrT #',
    '#                  #',
    '#DW CC           F #',
    '#   gggggggg       #',
    '#            D     #',
    '#     gggggggggg   #',
    '#  T              L#',
    '#    ggggggg       #',
    '#                 T#',
    '#   S    d         #',
    '#  ss        BB    #',
    '##########m#########',
  ],
  triggers: [{ at: [10, 12], type: 'door', to: 'delhi', spawn: [42, 6], facing: 'down' }],
};

// ------------------------------------------------------------- the haveli

/** The poet's haveli, hakims' lane: a cool room where two couplets hold the
 * walls up. The caretaker is at prayers; the mangoes are on duty. */
export const DELHI_HAVELI_MAP: MapData = {
  id: 'delhi-haveli',
  name: "The Poet's Haveli",
  spawn: [8, 9],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    c: { t: 'coupletwall', solid: true, tall: true },
    v: { t: 'divan', solid: true },
    t: { t: 'takht', solid: true },
    b: { t: 'bookchest', solid: true },
    r: { t: 'rug' },
    a: { t: 'paandaan', solid: true },
    M: { t: 'mangocrate', solid: true },
    J: { t: 'jaalipanel', solid: true, tall: true },
    L: { t: 'lampniche', solid: true, tall: true },
    p: { t: 'couplitter' },
    m: { t: 'mat' },
  },
  ground: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ],
  objects: [
    // The rug is not a rectangle in the middle of the floor: it is a big
    // one laid off-centre with a small one meeting it at the corner, the way
    // a room that is actually used ends up. It used to say that and draw a
    // twenty-one cell cross dead centre; now it is a four-by-three dari to
    // the west of the door lane and a two-by-two touching its bottom corner,
    // and `rug` bleeds to the tile edge, so each one is one textile.
    //
    // Five cells of rug came out. Two things you can see from eye level went
    // in where they were: a second bookchest beside the first, and a divan on
    // the east wall, because this was the emptiest silhouette of the twelve
    // rooms. The jaali stands where you have to walk around it, which is what
    // puts depth in a flat room.
    '####c####c##L###',
    '# b b          #',
    '# v   p    t   #',
    '#   rrrr     J #',
    '#   rrrr       #',
    '#   rrrr    a  #',
    '#       rr     #',
    '#   J   rr     #',
    '#            v #',
    '#  t     M     #',
    '########m#######',
  ],
  triggers: [{ at: [8, 10], type: 'door', to: 'delhi', spawn: [12, 6], facing: 'down' }],
};
