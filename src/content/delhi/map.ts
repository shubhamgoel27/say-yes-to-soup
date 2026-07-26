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
const inMaidan = (x: number, y: number) => x >= 1 && x <= 37 && y >= 23 && y <= 29;
const inSpice = (x: number, y: number) => x >= 1 && x <= 12 && y >= 9 && y <= 13;
const inLane1 = (y: number) => y >= 6 && y <= 8;
const inGali = (y: number) => y >= 14 && y <= 15;
const inLane3 = (y: number) => y >= 21 && y <= 22;

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
    // The maidan's top edge is beaten to neither-dirt-nor-stone.
    if (y === 23) return '~';
    if (y === 24 && cellHash(x, y, 32) < 0.45) return '~';
    if (x === 37) return '~';
    if (x === 36 && cellHash(x, y, 32) < 0.4) return '~';
    return '.';
  }
  // The kinari lane's last row wears down toward the maidan.
  if (y === 22 && x <= 37 && cellHash(x, y, 33) < 0.5) return '~';
  if (x === 37 && y >= 6 && cellHash(x, y, 34) < 0.45) return '~';
  return '-';
}

/** The love pass: small true things, placed where the mohalla actually keeps them. */
const DECOR: Record<string, string> = {
  // The hakims' lane: quiet trades, old smells.
  '8,6': 'a', // Mehr Aapa's attar case, amber rows
  '15,6': 'l', // a wire bundle sagging between havelis
  '22,6': 'w', // the wedding-card stall, fanned in red and gold
  '29,6': 'b', // book bundles bound with jute, Sunday stock
  '34,6': 's', // signboards stacked three scripts deep
  '5,8': 'q', // a charpai, publicly napped upon
  // The spice end: Khari Baoli in miniature.
  '1,9': 'y', '4,9': 'y', '7,9': 'y', '10,9': 'y',
  '2,11': 'y', '11,11': 'y',
  '5,11': 'e', // Sethji's gaddi: white cushion, brass scale, ledger
  '1,12': 'z', '9,12': 'z', // the chilli sacks, weaponized air
  // Gali Tawe Wali itself.
  '12,14': 's',
  '16,14': 'g', // Kamla Chachi's tawa, the lane's courtroom
  '20,14': 'f', // a lamp on a pole, wired with hope
  '23,14': 'q',
  '26,14': 'l',
  '33,14': 'c', // Akhtar Bhai's chai corner
  '35,14': 'k', // kulhads in a clay tower
  '36,14': 'h', // the halwai's wicker khomcha, off duty until winter
  '37,14': 'j', // Bade Mian's jalebi kadhai, since 1902
  '32,15': 'K', // spent kulhads, shattered musically
  // The kinari lane: trims, garlands, commuting monkeys.
  '5,21': 'l',
  '12,21': 'G', // marigold garlands strung shoulder-high
  '10,22': 'm', '13,22': 'm',
  '20,21': 't', // a thela of mangoes, langra side up
  '28,21': 'o', // the monkey wire, rush hour at dawn
  '33,21': 's',
  // The maidan: gully cricket, public water, and the rickshaw depot.
  '8,25': 'W', // the wicket wall, chalked and contested
  '10,26': '5', // the crease, chalked fresh over six older opinions
  '15,24': 'P', // the hand pump, cold iron, free forever
  '14,25': '3', // the pump's permanent puddle, pigeon-approved
  '16,25': 'K', // kulhads that came for water and stayed forever
  '17,24': '1',
  '22,24': 'q',
  '19,24': '4', // mango crates staged for the evening thela run
  '20,26': 't', // the second thela, off shift, still perfuming
  '30,25': 'r', // a rickshaw at rest
  '33,26': 'r', // the stand proper: Bantu's uncle's fleet, all "the good one"
  '35,24': '4',
  '31,23': '1',
  '29,28': 'q', // the drivers' waiting charpai, occupancy always one nap
  // The chowk: everything faces everything.
  '45,7': 'n', // the nishan sahib, saffron over the whole square
  '44,9': 'v', // the bird ward table, cotton and splints
  '40,11': 'p', // the peepal, older than the pavement opinions
  '39,15': 'f',
  '45,19': 'd', // the red post box, fed with letters for everywhere
  '40,24': 'r', '43,25': 'r', // the rickshaw stand
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
  // Deterministic small life: pigeons on brick, spills in the spice zone,
  // grass in the maidan cracks. cellHash only; the world never crawls.
  if (inPlaza(x, y) && y >= 6) {
    if (cellHash(x, y, 11) < 0.05) return '1';
  }
  if (inSpice(x, y) || (y >= 14 && y <= 15 && x <= 8)) {
    if (cellHash(x, y, 12) < 0.07) return '2';
  }
  if (inGali(y) && cellHash(x, y, 13) < 0.025) return '1';
  if (inMaidan(x, y)) {
    const h = cellHash(x, y, 14);
    if (h < 0.05) return 'i';
    if (h > 0.985) return '1';
  }
  if (inLane1(y) || inLane3(y)) {
    if (cellHash(x, y, 15) < 0.02) return '1';
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

/** Rooftop furniture, each thing where a roof would keep it. Six terraces,
 * one republic: Yusuf's coop roof and the antenna roof up north against the
 * skyline, the kite decks midfield, the charpai evenings down south. */
const ROOF_DECOR: Record<string, string> = {
  // Yusuf's terrace, north-west: the coop, the birds, the payroll of grain.
  '4,3': 'k', // patangs leaning in a paper rainbow
  '6,3': 'K', // Yusuf's kabootar khana, whitewashed, full of opinions
  '9,3': 'G', // spilled grain, the flock's payroll office
  '8,4': '1',
  '5,4': '1',
  '9,5': 'c', // the charkhi, wound with plain cotton dor
  '12,2': 'Q', // Yusuf's charpai, bedding aired against the parapet
  '10,2': 'T', // the tulsi, watered before the birds, always
  '14,3': 'w', // a water tank doing its quiet civic duty
  '20,2': 'o', // the monkey wire, upper deck
  '18,6': 'd', // the dhobi line, flying the mohalla's flags
  '22,4': 'x', // a cut kite from some other roof's victory
  '2,6': 'S', // last week's chai summit, in shards
  '21,7': 'D', // diyas on a ledge, lit for the dusk flight
  // The antenna roof, north-east: television by ambition.
  '28,4': 'w',
  '32,3': 'a', // an antenna guyed with kite string: jugaad, aerial division
  '30,6': 'k', // the neighbor kids' kite cache, allegedly hidden
  '34,5': 'x',
  '27,2': '1',
  '35,6': 'c',
  // Mid-west deck: laundry in bulk, one shaded cot.
  '8,12': 'd', // a second line; the mohalla launders in bulk
  '4,10': 'w',
  '2,12': 'q', // a charpai dragged up for the season
  '5,9': 'T',
  '10,10': 'x',
  // Mid-east deck: the kite school, Chasca's favorite light.
  '16,10': 'k',
  '15,12': 'c', // a spare charkhi, mid-rewind
  '17,12': 'j',
  '20,12': 'j', // two stools, one argument about wind
  '20,10': 'F', // the transistor, cricket commentary for the whole sky
  '26,9': 'N', // a cut kite snagged on a bamboo pole, kept as a trophy
  '23,13': 'd', // the third dhobi line; the mohalla launders industrially
  '24,11': 'D',
  '31,12': 'S',
  '33,10': 'q',
  '35,9': 'T',
  // South-west terrace: the stairhead and the evening parliament.
  '2,17': 'u', // the stairhead back down into the lanes
  '5,16': 'S',
  '6,15': 'T',
  '11,17': 'w',
  '12,16': 'x',
  '16,15': 'D', // the ledge diyas, first lit, last out
  '18,15': 'Q', // the parliament charpai, bedding and all
  '19,15': 'F', // its transistor, volume set by committee
  '17,16': 'j',
  '20,16': 'j',
  '18,16': 'C', // the chai tray: kettle, kulhads, quorum
  '21,15': 'T',
  '24,17': '1',
  // South-east terrace: quieter, mostly pigeons and one philosopher's cot.
  '31,16': 'q',
  '33,17': 'S',
  '35,15': 'T',
  '30,17': 'x',
};

/** Parapet runs that carve the plane into terraces, with walk-through gaps. */
const ROOF_WALL_GAPS: Record<number, Set<number>> = {
  8: new Set([6, 7, 19, 20, 31, 32]),
  14: new Set([3, 4, 16, 17, 27, 28]),
};

function roofObjectAt(x: number, y: number): string {
  // The skyline row: Jama Masjid's domes and the Red Fort's long red wall,
  // painted as distance. You cannot walk to them. You can only look.
  if (y === 0) {
    if (x === 8 || x === 22) return 'J';
    return 'R';
  }
  // Parapets: the roof's low honest railings, sittable everywhere.
  if (y === 1 || y === RH - 1 || x === 0 || x === RW - 1) return 'p';
  // Terrace dividers: parapet runs east-west, gaps where feet insist.
  const gaps = ROOF_WALL_GAPS[y];
  if (gaps && !gaps.has(x)) return 'p';
  // Party walls between neighbors, north and south.
  if (x === 25 && y >= 2 && y <= 7 && y !== 5) return 'p';
  if (x === 13 && y >= 9 && y <= 13 && y !== 11) return 'p';
  if (x === 28 && (y === 15 || y === 16 || y === 18)) return 'p';
  const dec = ROOF_DECOR[`${x},${y}`];
  if (dec) return dec;
  // Deterministic small life: the coop's pigeons thick near the grain, the
  // rest of the roof lightly patrolled, paper casualties where duels ended.
  const nearCoop = x >= 3 && x <= 12 && y >= 2 && y <= 6;
  if (nearCoop && cellHash(x, y, 22) < 0.14) return '1';
  if (nearCoop && cellHash(x, y, 23) < 0.06) return 'G';
  if (cellHash(x, y, 21) < 0.05) return '1';
  if (cellHash(x, y, 24) < 0.014) return 'x';
  return ' ';
}

/** Each terrace keeps its own coat of lime: whitewash north, worn tan
 * midfield, brick-dust rose south. The parapets stitch them together. */
function roofGroundAt(y: number): string {
  if (y <= 8) return 'h';
  if (y <= 14) return '.';
  return 'v';
}

function paintRoof(): { ground: string[]; objects: string[] } {
  const ground: string[] = [];
  const objects: string[] = [];
  for (let y = 0; y < RH; y++) {
    let g = '';
    let o = '';
    for (let x = 0; x < RW; x++) {
      g += roofGroundAt(y);
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
    K: { t: 'kabootarkhana', solid: true, tall: true },
    k: { t: 'kitestack', solid: true, tall: true },
    c: { t: 'charkhi', solid: true },
    w: { t: 'watertank', solid: true, tall: true },
    d: { t: 'dhobiline', solid: true, tall: true },
    a: { t: 'antennajugaad', solid: true, tall: true },
    o: { t: 'monkeywire', solid: true, tall: true },
    q: { t: 'charpai', solid: true },
    Q: { t: 'charpaibed', solid: true },
    u: { t: 'stairup', solid: true, tall: true },
    T: { t: 'tulsipot', solid: true },
    F: { t: 'transistor', solid: true },
    C: { t: 'chaitray', solid: true },
    D: { t: 'diyaledge', solid: true },
    N: { t: 'kitesnag', solid: true, tall: true },
    j: { t: 'stool', solid: true },
    S: { t: 'kulhadshards' },
    x: { t: 'kitecut' },
    G: { t: 'grainspill' },
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
    '##########N#########',
    '#CD        A r T S #',
    '#                  #',
    '#C                F#',
    '#D gggggg  gggggg  #',
    '#                  #',
    '#C gggggg  gggggg  #',
    '#D                L#',
    '#  gggggg  gggggg  #',
    '#W                 #',
    '#         d        #',
    '#      s    BB     #',
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
    '####c####c##L###',
    '#              #',
    '# v   t p  b   #',
    '#              #',
    '#   rrrrrr     #',
    '#   rrrrrr     #',
    '#              #',
    '#    a     M   #',
    '#              #',
    '#              #',
    '########m#######',
  ],
  triggers: [{ at: [8, 10], type: 'door', to: 'delhi', spawn: [12, 6], facing: 'down' }],
};
