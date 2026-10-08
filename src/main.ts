import { Actor } from './engine/actor';
import { AudioBus } from './engine/audio';
import { Camera } from './engine/camera';
import { STEP_DUR, TILE, TURN_DELAY, VIEW_H, VIEW_W } from './engine/config';
import { ArmedCards, type Spot } from './engine/armed';
import { DevBridge } from './engine/devbridge';
import { TileMap, stepFrom, type TriggerDef } from './engine/grid';
import { DIR_VEC, Input, type Dir } from './engine/input';
import { startLoop } from './engine/loop';
import { Renderer, type Sprite } from './engine/renderer';
import { GameState, activeSlot, firstBlankSlot, peekSlot, setActiveSlot } from './engine/state';
import { PLAYER_LOOK, makePortrait, makeSheet, type Look } from './art/character';
import { lookFor } from './art/looks';
import { cellHash } from './art/pix';
import { GLOW_KINDS, WINDOW_OFFSETS } from './art/sets';
import { makeDogSheet, makeLlamaSheet, makeMoundSheet } from './art/animals';
import { Textbox } from './ui/textbox';
import { JournalUI } from './ui/journal';
import { Toasts } from './ui/toast';
import { NamingCard, TitleScreen } from './ui/title';
import { PauseMenu } from './ui/pause';
import { AlbumUI, PHOTOS } from './ui/album';
import { RUN, everyStar, freshRun, takeCoach, tickPanels, verdictFor } from './ui/games/run';
import { makeStick } from './ui/stick';
import { ChapterCloseUI, closingChapter } from './ui/chapterclose';
import { ChipFold, initRotateNudge, isCoarseTouch, keysOrTaps, trackUiScale, watchScrollCue } from './ui/responsive';
import { onTouchTap, touchActive } from './ui/pointer';
import { PixiStage, type LightSpec } from './render/stage';
import {
  ARRIVALS,
  CHAPTERS,
  COMPLETIONS,
  chapterPlate,
  DIG_SPOTS,
  DRESSINGS,
  EXAMINES,
  GAMES,
  JOURNAL,
  JOURNAL_BY_ID,
  LETTERS,
  MAP_META,
  MOODS,
  NODES,
  NPCS,
  REGION_MAPS,
  sitKindsOn,
  SIT_LINES,
  TASKS,
} from './content/world';
import { pickLetter } from './content/letters';
import { WHISPERS } from './content/threadwhispers';
import { atFor, doorsFrom, nextMapToward, npcMap, threadWho } from './content/guide';
import { cheapestPath } from './engine/path';
import { planSettle } from './engine/stand';
import { ROUTE } from './content/route';
import type { NpcDef } from './content/schema';
import type { WorldTask } from './content/world';
import { DELHI_STATIONS } from './content/delhi/stations';
import { SHIONOURA_STATIONS } from './content/shionoura/stations';
import { ESCORTS, JUG, LAMP, MEETING } from './content/return/staging';
import { BLOCKING, CUES, HOURS, LAMPS_LIT } from './content/staging';
import { CAIRN_AT, setCairnStone, setJugPoured } from './art/ending';

// ---------------------------------------------------------------- boot

const $ = (id: string) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
};

// The Canvas2D composer now paints into an offscreen buffer; PixiJS presents
// it with lighting, bloom, and shimmer-free zoom on top.
const worldCanvas = $('game') as HTMLCanvasElement;
console.info('[soup] boot: world composer');
const renderer = new Renderer(worldCanvas);
console.info('[soup] boot: gpu stage');
const stage = PixiStage.create(worldCanvas, $('frame'));
// The frame turns with the screen (an upright phone gets an upright frame).
stage.onViewChange(() => renderer.resizeView());
console.info('[soup] boot: stage ready');
const debugEl = $('debug') as HTMLPreElement;
const input = new Input();
input.attach();
const dev = new DevBridge();
const audio = new AudioBus();

// Browsers require a user gesture before audio. Every gesture, not only the
// first: iOS parks the context ("interrupted") when the tab goes to the
// background, and only a later gesture may wake it. Cheap when running.
window.addEventListener('keydown', () => audio.ensure());
window.addEventListener('pointerdown', () => audio.ensure());

const state = new GameState();
state.load();

const maps: Record<string, TileMap> = Object.fromEntries(
  Object.entries(REGION_MAPS).map(([id, data]) => [id, new TileMap(data)]),
);
const startMapMaybe = maps['village'];
if (!startMapMaybe) throw new Error('village map missing');
/** Where every new journey begins, and where Begin again must return to. */
const startMap: TileMap = startMapMaybe;

let map: TileMap = startMap;
const camera = new Camera();
const player = new Actor(map.spawn[0], map.spawn[1], map.spawnFacing);

const override = dev.spawnOverride();
if (override) {
  if (override.map && maps[override.map]) {
    map = maps[override.map] as TileMap;
    player.placeAt(map.spawn[0], map.spawn[1], map.spawnFacing);
  }
  if (override.at) player.placeAt(override.at[0], override.at[1], override.dir);
  else if (override.dir) player.face(override.dir);
} else if (state.place && maps[state.place.map]) {
  // The title screen idles over wherever the journey paused, not always home.
  map = maps[state.place.map] as TileMap;
  const [sx, sy] = safeStand(map, state.place.x, state.place.y);
  player.placeAt(sx, sy, state.place.dir as import('./engine/input').Dir);
}

/**
 * A saved position is a claim, not a fact: a bad write once booted a player
 * to tile 9999,9999, standing in the void with every direction refused, and
 * the next save made it permanent. Off the map or inside something solid,
 * the journey resumes at the map's own spawn instead.
 */
function safeStand(m: TileMap, x: number, y: number): [number, number] {
  const ok =
    Number.isFinite(x) && Number.isFinite(y) && m.inBounds(x, y) &&
    m.ground(x, y).solid !== true && m.object(x, y)?.solid !== true;
  return ok ? [x, y] : (m.spawn as [number, number]);
}

function sceneFor(id: string): 'outdoor' | 'interior' | 'road' {
  return MAP_META[id]?.scene ?? 'interior';
}

function moodFor(id: string): string {
  // The coast has two weathers: the garúa lid, and the noon the lid lifts.
  if (id === 'la-caleta') return dayT > 0.25 && dayT < 0.5 ? 'glare' : 'garua';
  // Kerala's monsoon arrives mid-chapter and then it simply rains.
  if (id === 'kerala' && state.has('c6.rain')) return 'monsoon';
  const meta = MAP_META[id];
  if (!meta) return 'interior';
  // Evening maps that declared a dusk light get to use it, rain or not. The
  // rain is drawn on top of whatever is lit, so pigeon hour still happens in
  // a storm: the kite tournament flies in exactly that weather.
  if (meta.moodDusk && nightLevel(dayT) > 0.3) return meta.moodDusk;
  // First light, before the day curve has gone neutral.
  if (meta.moodDawn && (dayT < 0.05 || dayT > 0.985)) return meta.moodDawn;
  // Delhi waits out the heat until sawan breaks, then the whole city exhales.
  if ((id === 'delhi' || id === 'delhi-rooftop') && state.has('c11.rain')) return 'sawanrain';
  return meta.mood;
}

/** Whether the sky over a given map is actually open, independent of light. */
function rainingOn(id: string): boolean {
  if (id === 'kerala' && state.has('c6.rain')) return true;
  if ((id === 'delhi' || id === 'delhi-rooftop') && state.has('c11.rain')) return true;
  return false;
}

/** Which musical/linguistic coast each map belongs to. */
const REGION_BY_MAP: Record<string, string> = {
  village: 'andes', chicheria: 'andes', 'casa-carmen': 'andes', 'east-road': 'andes', 'la-bajada': 'andes',
  'la-caleta': 'coast', picanteria: 'coast',
  ship: 'ocean', galley: 'ocean',
  shionoura: 'shionoura', minshuku: 'shionoura',
  busan: 'busan', teahouse: 'busan',
  kerala: 'kerala', 'mariamma-veedu': 'kerala',
  zanzibar: 'zanzibar', kangashop: 'zanzibar',
  sicily: 'sicily', circolo: 'sicily',
  oaxaca: 'oaxaca', cocina: 'oaxaca', camposanto: 'velacion',
};
function regionFor(id: string): string {
  return MAP_META[id]?.region ?? REGION_BY_MAP[id] ?? 'andes';
}

/** Ambient light per mood; interiors run dark so the fires carry the room. */
const AMBIENT: Record<string, number> = {
  warm: 0xfdf6ea,
  cool: 0xe4ecf6,
  dusty: 0xffeed6,
  interior: 0xb0a089,
  garua: 0xdfe3e6,
  glare: 0xffffff,
  ...Object.fromEntries(Object.entries(MOODS).map(([k, v]) => [k, v.ambient])),
};
renderer.registerMoods(MOODS);
renderer.setMet((id) => state.has('met.' + id)); // greeting nods for villagers already met

// ---------------------------------------------------------------- day/night

/**
 * The world clock: one full day in five minutes, starting mid-morning.
 * The ambient curve grades the whole scene; windows wake up at dusk.
 * `?tod=0.7` pins the clock for development.
 */
// A full day. This was five minutes, which meant a new player reached night
// twice before finishing the opening errand, and the evening thinning kept
// taking away the person the task chip was pointing at. A day should be about
// as long as a sitting, so dusk is an event you notice rather than weather
// that keeps happening to you.
const DAY_LEN = 1500;
const todOverride = dev.enabled
  ? Number.parseFloat(new URLSearchParams(location.search).get('tod') ?? 'NaN')
  : Number.NaN;
let dayT = Number.isFinite(todOverride) ? todOverride : 0.18;

/** Keyframed RGB multipliers over the day: dawn gold, noon clear, dusk ember, night blue. */
const DAY_KEYS: [number, [number, number, number]][] = [
  [0.0, [1.04, 0.88, 0.74]],
  [0.1, [1.0, 1.0, 1.0]],
  [0.45, [1.01, 0.98, 0.93]],
  // Golden hour used to crush blue almost to nothing: at 0.57 three whole
  // chapters held no pixel where blue exceeded red, so every evening in the
  // game was the same orange. Ember still, but with a sky left in it.
  [0.55, [1.04, 0.84, 0.78]],
  [0.63, [0.6, 0.63, 0.86]],
  [0.9, [0.48, 0.53, 0.78]],
  [0.97, [0.75, 0.68, 0.72]],
  [1.0, [1.04, 0.88, 0.74]],
];

function dayCurve(t: number): [number, number, number] {
  for (let i = 0; i < DAY_KEYS.length - 1; i++) {
    const a = DAY_KEYS[i];
    const b = DAY_KEYS[i + 1];
    if (!a || !b || t > b[0]) continue;
    const k = (t - a[0]) / (b[0] - a[0] || 1);
    return [0, 1, 2].map((c) => (a[1][c] ?? 1) + ((b[1][c] ?? 1) - (a[1][c] ?? 1)) * k) as [number, number, number];
  }
  return [1, 1, 1];
}

/** How deep into night we are, 0..1, from the curve's darkness. */
function nightLevel(t: number): number {
  const [r, g, b] = dayCurve(t);
  const lum = (r + g + b) / 3;
  return Math.max(0, Math.min(1, (0.95 - lum) / 0.45));
}

/** Blend a mood ambient with the time-of-day curve into a light-map color. */
function ambientNow(): number {
  const mood = moodFor(map.id);
  const base = AMBIENT[mood] ?? 0xfdf6ea;
  if (mood === 'interior') return base;
  const [r, g, b] = dayCurve(dayT);
  const mix = (ch: number, m: number) => {
    const v = Math.round(((base >> ch) & 0xff) * m);
    return Math.max(0x38, Math.min(0xff, v));
  };
  return (mix(16, r) << 16) | (mix(8, g) << 8) | mix(0, b);
}

/** Windows per map: warm lights per building kind once dusk arrives. */
const houseWindows: Record<string, [number, number][]> = {};
for (const [id, tm] of Object.entries(maps)) {
  const wins: [number, number][] = [];
  for (let y = 0; y < tm.h; y++) {
    for (let x = 0; x < tm.w; x++) {
      const offs = WINDOW_OFFSETS[tm.object(x, y)?.t ?? ''];
      for (const [dx, dy] of offs ?? []) wins.push([x * TILE + dx, y * TILE + dy]);
    }
  }
  houseWindows[id] = wins;
}

/** Everything that glows, per map, found once at boot; each is a light. */
const GLOW_STYLE: Record<string, { r: number; color: number; flicker: number; lift: number }> = {
  qoncha: { r: 36, color: 0xffb066, flicker: 0.5, lift: 3 },
  campfire: { r: 34, color: 0xffa858, flicker: 0.55, lift: 3 },
  farol: { r: 26, color: 0xffd28a, flicker: 0.18, lift: 12 },

  // Open fire someone is cooking on: low to the ground, wide, and restless.
  chulha: { r: 30, color: 0xff9a4d, flicker: 0.55, lift: 2 },
  aduppu: { r: 28, color: 0xff9a4d, flicker: 0.55, lift: 2 },
  irori: { r: 30, color: 0xffa860, flicker: 0.5, lift: 1 },
  comal: { r: 26, color: 0xff9c50, flicker: 0.5, lift: 2 },
  paranthagriddle: { r: 26, color: 0xffa860, flicker: 0.4, lift: 2 },
  jalebikadhai: { r: 24, color: 0xffb870, flicker: 0.35, lift: 2 },
  stove: { r: 22, color: 0xffb070, flicker: 0.3, lift: 4 },
  hotteokcart: { r: 24, color: 0xffb066, flicker: 0.35, lift: 5 },
  eomukcart: { r: 24, color: 0xffc07a, flicker: 0.3, lift: 5 },
  thattukada: { r: 26, color: 0xffc27a, flicker: 0.28, lift: 8 },
  chaikhana: { r: 26, color: 0xffc98a, flicker: 0.22, lift: 8 },

  // A named flame kept for somebody: small, warm, and easily troubled.
  diyaledge: { r: 14, color: 0xffc06a, flicker: 0.6, lift: 2 },
  veladora: { r: 13, color: 0xffcf82, flicker: 0.65, lift: 3 },
  deckshrine: { r: 13, color: 0xffc98a, flicker: 0.55, lift: 4 },
  nilavilakku: { r: 15, color: 0xffcf82, flicker: 0.5, lift: 6 },
  nicho: { r: 15, color: 0xffd08a, flicker: 0.5, lift: 10 },
  lampniche: { r: 16, color: 0xffd08a, flicker: 0.45, lift: 10 },
  edicola: { r: 16, color: 0xffd9a0, flicker: 0.12, lift: 10 }, // electric candles

  // Hung light: steady, higher up, and softer at the edge.
  chochin: { r: 22, color: 0xffd9a8, flicker: 0.15, lift: 12 },
  hanjilamp: { r: 22, color: 0xffdcb0, flicker: 0.12, lift: 12 },
  lotusline: { r: 20, color: 0xffc0a0, flicker: 0.14, lift: 14 },
  ishidoro: { r: 18, color: 0xffd8a0, flicker: 0.2, lift: 10 },
  marketlamp: { r: 26, color: 0xffd28a, flicker: 0.12, lift: 12 },
  barlamp: { r: 24, color: 0xffe0b8, flicker: 0.08, lift: 12 },

  // The one cold light in the world, humming to itself on a dark corner.
  jihanki: { r: 24, color: 0xcfe4ff, flicker: 0.04, lift: 8 },
};
const fireCells: Record<string, [number, number, string][]> = {};
/**
 * Find every light on a map. Dressings light candles that were not there at
 * boot (the ofrenda's veladoras, a festival's lamps), so this has to be
 * rerunnable, not a snapshot: those candles used to stay dark grey forever.
 */
function scanFires(id: string) {
  const tm = maps[id];
  if (!tm) return;
  const cells: [number, number, string][] = [];
  for (let y = 0; y < tm.h; y++) {
    for (let x = 0; x < tm.w; x++) {
      const o = tm.object(x, y);
      if (o && GLOW_KINDS.has(o.t)) cells.push([x, y, o.t]);
    }
  }
  fireCells[id] = cells;
}
for (const id of Object.keys(maps)) scanFires(id);

/**
 * Once the chapter is done, the east gate is simply open: leaves folded back,
 * tiles walkable, and stepping through carries you onto the road. A door,
 * not a menu.
 */
function applyGateState() {
  if (!state.has('story.complete')) return;
  const village = maps['village'];
  if (!village) return;
  for (const [gx, gy] of [[41, 16], [42, 16]] as const) {
    // Tall: the open gateway keeps its pillars and lintel, and you walk under it.
    village.setObject(gx, gy, { t: 'gateOpen', tall: true });
    village.addTrigger({ at: [gx, gy], type: 'door', to: 'east-road', spawn: [1, 6], facing: 'right' });
  }
}
applyGateState();

/**
 * Festival dressing: chapters redecorate their maps as the story moves
 * (bamboo fills with wishes, candles line the marigold path). Idempotent;
 * runs at boot and whenever flags change.
 */
function applyDressings() {
  const touched = new Set<string>();
  for (const d of DRESSINGS) {
    if (!state.check(d.when)) continue;
    const tm = maps[d.map];
    if (!tm) continue;
    if (d.swap) {
      for (let y = 0; y < tm.h; y++) {
        for (let x = 0; x < tm.w; x++) {
          if (tm.object(x, y)?.t === d.swap.from) tm.setObject(x, y, d.swap.to);
        }
      }
    }
    for (const [x, y, def] of d.cells ?? []) tm.setObject(x, y, def);
    // A dressing can add or remove light, so this map's lights are restated.
    scanFires(d.map);
    touched.add(d.map);
  }
  // If the map underfoot just gained candles, they should be lit now.
  if (touched.has(map.id)) {
    renderer.setFires((fireCells[map.id] ?? []).map(([fx, fy]) => [fx, fy]));
  }
}
applyDressings();
renderer.setFires((fireCells[map.id] ?? []).map(([fx, fy]) => [fx, fy]));

// ---------------------------------------------------------------- ui

const toasts = new Toasts($('toasts'));
const errandEl = $('errand');
trackUiScale();
const chipFold = new ChipFold(errandEl);
// On glass the folded chip opens again under a tap (the fold mark says so),
// and the tap stays on the chip instead of walking you toward it.
errandEl.addEventListener('pointerdown', (e) => {
  if (!isCoarseTouch()) return;
  e.preventDefault();
  e.stopPropagation();
  chipFold.call();
});
const fadeEl = $('fade');
/** The dialogue box itself, for the one dip (the vista) that must not dim it. */
const textboxEl = $('textbox');
/** Seconds into the held dark after the closing book, or null (see startCurtain). */
let curtainT: number | null = null;
const plateEl = $('plate');
const textbox = new Textbox(
  {
    root: $('textbox'),
    portrait: $('tb-portrait'),
    name: $('tb-name'),
    text: $('tb-text'),
    arrow: $('tb-arrow'),
    choices: $('tb-choices'),
  },
  state,
  (who) => audio.speak(who),
  // Whoever is named on the line, by name: this map's villager first, since
  // a name like Hana or Chasca walks through several chapters.
  (who) => {
    const named = villagers.filter((v) => v.def.name === who);
    if (!named.length) return undefined;
    return (named.find((v) => v.def.map === map.id) ?? named[0]!).portrait;
  },
);
/**
 * A second reading arrives already knowing the words, and a task whose only
 * key is a words page would vault the chip whole chapters ahead: Shaji's
 * pour offer, gated on page.words.chaya alone, surfaced in Ch'aska Pampa on
 * minute one. Any such task also waits for its own chapter's arrival. On a
 * first journey this changes nothing, because a word is always learned after
 * its chapter is reached.
 */
const TASKS_GUARDED: WorldTask[] = TASKS.map((t) => {
  if (!(t.when.has ?? []).some((f) => f.startsWith('page.words.'))) return t;
  const owner = CHAPTERS.find((c) => c.tasks.some((x) => x.text === t.text));
  const gate = owner?.arrival?.flag;
  if (!gate || (t.when.has ?? []).includes(gate)) return t;
  return { ...t, when: { ...t.when, has: [...(t.when.has ?? []), gate] } };
});

// Chapters and route stops run in the same order, one stop per chapter.
const PAGE_PLACE = new Map<string, string>();
CHAPTERS.forEach((c, i) => {
  const place = ROUTE.find((r) => r.id === c.id)?.name ?? ROUTE[i]?.name;
  if (place) for (const e of c.journal) PAGE_PLACE.set(e.id, place);
});
const journalUI = new JournalUI($('journal'), JOURNAL, TASKS_GUARDED, ROUTE, state, (id) => PAGE_PLACE.get(id));
const title = new TitleScreen(
  $('title'),
  $('letter'),
  () => reloadJourney(),
  (row) => beginSecondReading(row),
  () => {
    // Asked and answered on the confirm card: the journal on the table goes.
    audio.confirm();
    title.hideTitle();
    openFlyleaf(freshSlate);
  },
  () => continueJourney(),
);
const naming = new NamingCard($('cc-card'));
const albumUI = new AlbumUI($('album'), state, audio);
const chapterClose = new ChapterCloseUI($('chapterclose'), state);
const pauseMenu = new PauseMenu($('pause'), audio, {
  onTextSpeed: (cps) => textbox.setSpeed(cps),
  onToTitle: () => {
    mode = 'title';
    standUp();
    title.showTitle(state.hasSave());
  },
  onClosed: () => {
    // Closed over the title: bring the cover back with a fresh cursor, so
    // the next press does exactly what it looks like it will do.
    if (mode === 'title') title.showTitle(state.hasSave());
  },
  onReplay: (flag) => {
    // The games shelf chose one. Same road a villager's replay offer takes:
    // replay.mode plus the start flag, then the how-to card. The panels are
    // overlays with no idea what map is under them, so the loom opens as
    // readily in Delhi as it does at Carmen's door.
    const g = games.find((x) => x.def.flag === flag);
    if (!g) return;
    state.set('replay.mode');
    state.set(flag);
    showHowto(g);
  },
  onJournal: () => {
    journalUI.open();
    audio.pageFlip();
  },
  saveNow: () => {
    if (mode !== 'play') return false;
    state.save();
    return !state.persistenceLost;
  },
});

/** Chapter mini-games: the engine owns one overlay root per panel. */
function makeOverlayRoot(id: string): HTMLElement {
  const el = document.createElement('div');
  el.id = `mg-${id}`;
  el.className = 'mg-overlay';
  el.hidden = true;
  $('frame').appendChild(el);
  return el;
}
const games = GAMES.map((g) => {
  const root = makeOverlayRoot(g.flag.replace(/\W+/g, '-'));
  return { def: g, root, panel: g.make(root, audio, () => state.flagSet()) };
});
const panelList = games.map((g) => g.panel);
const anyGameOpen = () => games.some((g) => g.panel.isOpen);
type GameEntry = (typeof games)[number];

// ------------------------------------------ the how-to card & the pause strip
//
// Two small journal-paper surfaces around every mini-game. The HOW-TO CARD
// stands between "a dialogue set the start flag" and "the panel opens": title,
// a few warm lines about the hands, begin or not yet. Declining keeps the
// flag, so the offer waits patiently; the action key in open air re-offers it.
// The PAUSE STRIP answers Esc inside a panel: start over, keep at it, or step
// away (the panel simply hides, unfinished, and the card re-offers later).
// Completing a panel while `replay.mode` is set skips the story narration:
// the flags clear, a sparkle, a toast. Some things are done just for the joy.

const howtoEl = document.createElement('div');
howtoEl.className = 'ht-veil';
howtoEl.hidden = true;
$('frame').appendChild(howtoEl);
const stripEl = document.createElement('div');
stripEl.className = 'ht-strip';
stripEl.hidden = true;
$('frame').appendChild(stripEl);

let howtoFor: GameEntry | null = null;
let howtoSel = 0;
/** The card's rows; grows a middle row when a hard telling is on offer. */
let howtoOpts: string[] = ['Begin', 'Not yet'];
/** Coach's advice, drawn once per card: takeCoach consumes, render repeats. */
let howtoCoach: string | null = null;
/**
 * The card that comes back holding advice ignores "begin" for a short beat
 * (performance.now() ms): the Space that closed the panel is often pressed
 * twice, and the second press must not skip the one line worth reading.
 */
let howtoGraceUntil = 0;
const HOWTO_GRACE_MS = 650;
const howtoInGrace = () => performance.now() < howtoGraceUntil;
const HARD_OPT = 'The hard telling';
let stripFor: GameEntry | null = null;
let stripSel = 1;
const STRIP_OPTS = ['Start over', 'Keep at it', 'Step away'];

const uiCardOpen = () => !howtoEl.hidden || !stripEl.hidden;

/**
 * Armed cards (src/engine/armed.ts): "Not yet" and "Step away" set a card
 * aside where it was declined, and a journey taken in conversation always
 * runs, leaving any armed card behind. Session-scoped: a reload offers each
 * waiting card once more, which is fair.
 */
const armed = new ArmedCards(games.map((g) => g.def.flag));
/** Who spoke last before a card opened: the one who offered it. */
let howtoOfferedBy: string | null = null;
const gameByFlag = (flag: string | null) => (flag ? games.find((g) => g.def.flag === flag) ?? null : null);
const panelOpen = (flag: string) => gameByFlag(flag)?.panel.isOpen ?? false;
const hereSpot = (npc: string | null): Spot => ({ map: map.id, at: [player.x, player.y], npc });

/** A game whose start flag is raised but whose panel is not yet on screen,
 * and which the player has not set aside. */
function pendingGame(): GameEntry | null {
  return gameByFlag(armed.pending((f) => state.has(f), panelOpen));
}

/** Open air near where a card was set aside: that card, forgiven. */
function declinedNearHere(): GameEntry | null {
  return gameByFlag(armed.nearHere(map.id, player.x, player.y, (f) => state.has(f)));
}

/** Talking to whoever offered a declined card lets it come back after. */
function forgiveDeclinesBy(npc: string) {
  armed.forgiveBy(npc);
}

/** Open a panel and route its completion: story narration, or replay joy. */
function openPanel(g: GameEntry) {
  player.frozen = true;
  // Every open is a fresh run, "Start over" included: advice filed by a run
  // the player already put behind them must not cost this one its star.
  freshRun(g.def.flag);
  g.panel.open(() => {
    player.frozen = false;
    const wasHard = RUN.hard;
    RUN.hard = false;
    const verdict = verdictFor(g.def.flag, state.has('replay.mode'), wasHard);
    if (verdict === 'story') {
      startNarration(g.def.doneNode);
      return;
    }
    // A return visit: no narration to repeat, just the doing of the thing.
    state.clearFlag('replay.mode');
    state.clearFlag(g.def.flag);
    if (verdict === 'short') {
      // The hard telling filed advice, so the run was not clean: the panel
      // already told that story in its own voice. Out here, the card comes
      // straight back holding the coach's line, cursor on the rematch.
      state.set('replay.mode');
      state.set(g.def.flag);
      showHowto(g);
      howtoSel = howtoOpts.indexOf(HARD_OPT);
      if (howtoSel < 0) howtoSel = 0;
      howtoGraceUntil = performance.now() + HOWTO_GRACE_MS;
      renderHowto();
      return;
    }
    if (verdict === 'star') {
      // Nothing for the coach to say: the hard telling, done properly.
      // The shelf remembers with a small star.
      state.set(`hard.${g.def.flag}`);
      toasts.show('The hard telling, done properly. ✶');
      // The last star of the whole journey earns one more line; the
      // toasts queue, so it follows the first at its own pace.
      if (everyStar(games.map((x) => x.def), (f) => state.has(f)) && !state.has('hard.all')) {
        state.set('hard.all');
        toasts.show('Every telling, done properly. Nani closes the journal and pretends she never worried.');
      }
    } else {
      toasts.show('Just for the joy of it.');
    }
    audio.chime();
    const [px, py] = player.renderPos();
    renderer.burst(px + TILE / 2, py + 2, 'sparkle', ['#f2e6d0', '#d9a441']);
  });
}

function renderHowto() {
  const g = howtoFor;
  if (!g) return;
  const lines = (g.def.howTo ?? [])
    .map((l) => `<div class="ht-line">${l}</div>`)
    .join('');
  const replaying = state.has('replay.mode');
  const hardOffered = howtoOpts.includes(HARD_OPT);
  const hardDone = state.has(`hard.${g.def.flag}`);
  // The body scrolls when the glass is short; the foot never does, so the
  // hint and the "more below" pill sit under the text, never over it.
  howtoEl.innerHTML = `
    <div class="ht-card">
      <div class="ht-body">
      <div class="ht-main">
      <div class="ht-kicker">hands, not homework</div>
      <div class="ht-title">${g.def.title ?? 'Something to try'}</div>
      ${replaying ? '<div class="ht-replay">Again, for the joy of it.</div>' : ''}
      ${howtoCoach ? `<div class="ht-coach">${howtoCoach}</div>` : ''}
      ${lines ? `<div class="ht-lines">${lines}</div>` : ''}
      </div>
      <div class="ht-side">
      ${hardOffered && g.def.hardHow ? `<div class="ht-hard">${g.def.hardHow}</div>` : ''}
      <div class="ht-opts">
        ${howtoOpts
          .map((t, i) => `<div class="ht-opt${i === howtoSel ? ' sel' : ''}" data-ht="${i}">${i === howtoSel ? '&#9656;&nbsp;' : ''}${t}${t === HARD_OPT && hardDone ? '&nbsp;&#10038;' : ''}</div>`)
          .join('')}
      </div>
      </div>
      </div>
      <div class="ht-foot">
        <div class="ht-more" aria-hidden="true">more below &#9662;</div>
        <div class="ht-keys">${keysOrTaps('Space to begin &middot; Esc, not yet', 'tap a line to choose')}</div>
      </div>
    </div>`;
  watchScrollCue(howtoEl.querySelector<HTMLElement>('.ht-body'), howtoEl.querySelector<HTMLElement>('.ht-more'));
}

function showHowto(g: GameEntry) {
  howtoFor = g;
  howtoSel = 0;
  // Drawn once here, not in renderHowto: takeCoach consumes on read, and
  // the render re-runs on every cursor move.
  howtoCoach = takeCoach(g.def.flag);
  // The hard telling is a return visit's offer only: the first, story-side
  // meeting with any game stays gentle.
  howtoOpts =
    state.has('replay.mode') && g.def.hardHow ? ['Begin', HARD_OPT, 'Not yet'] : ['Begin', 'Not yet'];
  player.frozen = true;
  howtoEl.hidden = false;
  renderHowto();
  audio.pageFlip();
}

/** Close the card: into the panel, or back to the world with the flag kept. */
function closeHowto(pick: string | null) {
  const g = howtoFor;
  howtoEl.hidden = true;
  howtoFor = null;
  howtoCoach = null;
  if (!g) return;
  if (pick === 'Begin' || pick === HARD_OPT) {
    RUN.hard = pick === HARD_OPT;
    openPanel(g);
  } else if (state.has('replay.mode')) {
    // Declining a replay offer ends it, the same way stepping away does: a
    // lingering replay.mode would make the next first-time completion skip
    // its own narration. The shelf and the villagers will offer again.
    state.clearFlag('replay.mode');
    state.clearFlag(g.def.flag);
    player.frozen = false;
  } else {
    player.frozen = false; // the story's start flag stays; the offer keeps
    // ...but it waits where it was made, instead of following the player.
    armed.setAside(g.def.flag, hereSpot(howtoOfferedBy));
  }
}

function renderStrip() {
  stripEl.innerHTML = `
    <div class="ht-strip-card">
      ${STRIP_OPTS.map(
        (t, i) => `<div class="ht-row${i === stripSel ? ' sel' : ''}" data-ht="${i}">${i === stripSel ? '&#9656;&nbsp;' : ''}${t}</div>`,
      ).join('')}
    </div>`;
}

function showStrip(g: GameEntry) {
  stripFor = g;
  stripSel = 1; // "Keep at it" is the default: Esc twice changes nothing
  stripEl.hidden = false;
  renderStrip();
}

function closeStrip() {
  stripEl.hidden = true;
  stripFor = null;
}

function stripActivate() {
  const g = stripFor;
  const pick = STRIP_OPTS[stripSel];
  closeStrip();
  if (!g) return;
  if (pick === 'Start over') {
    // Every panel's open() resets its state; same completion, fresh hands.
    openPanel(g);
  } else if (pick === 'Step away') {
    g.root.hidden = true;
    player.frozen = false;
    // A walked-away hard run must not haunt the next open. ("Start over"
    // keeps it: the panel's open() reads RUN.hard again, same telling.)
    RUN.hard = false;
    if (state.has('replay.mode')) {
      // A replay stepped away from is simply over: nothing in the story
      // needs the offer kept, and a lingering replay.mode would make the
      // next first-time completion skip its own narration.
      state.clearFlag('replay.mode');
      state.clearFlag(g.def.flag);
    } else {
      // Unfinished is allowed. The start flag stays set, and the card waits
      // here, exactly as "Not yet" does: back at this spot, or after its own
      // villager speaks again. (It used to pop after the next conversation
      // with anyone, and a journey taken in that conversation was lost.)
      armed.setAside(g.def.flag, hereSpot(howtoOfferedBy));
    }
  }
  // "Keep at it": the panel is still there, exactly as it was.
}

/**
 * A story activity is underway from the moment its start flag goes up (the
 * how-to card, the panel, a "not yet" still owed) until its done narration
 * clears the flag. Replays never hold anything.
 */
function activityUnderway(): boolean {
  return !state.has('replay.mode') && games.some((g) => state.has(g.def.flag));
}

/** The HUD chip always shows the most pressing open thread, shortened. */
function refreshTaskChip() {
  // Nothing new is asked of anyone while the dark after the book is held.
  if (curtainT !== null) {
    errandEl.hidden = true;
    return;
  }
  // The chip moves on when the activity ENDS, not when it is offered: the
  // start flag retires the task that asked for it, and the chip used to jump
  // to the next errand while the watia's how-to card was still open.
  if (activityUnderway() && errandEl.textContent && !errandEl.hidden) return;
  const top = journalUI.activeTasks()[0];
  // The chip shows whole thoughts; CSS clamps politely at two lines. It kept
  // hiding outright once story.end was set, which orphaned the epilogue task
  // (the traveler's mail): post-end the chip stays as long as any task does,
  // and only an empty task list retires it.
  if (top) {
    errandEl.textContent = top;
    chipFold.note(top);
    // Until the first time the player ever asks the band themselves, the
    // chip carries one quiet reminder that Carmen's lesson is a key. The
    // first manual N sets thread.used and retires this line for good.
    const nudged = state.has('keepsake.band') && !state.has('thread.used');
    errandEl.classList.toggle('nudged', nudged);
    if (nudged) {
      const nudge = document.createElement('span');
      nudge.className = 'errand-nudge';
      nudge.textContent = keysOrTaps('press N when the way is lost', 'tap \u2933 when the way is lost');
      errandEl.appendChild(nudge);
    }
    errandEl.hidden = false;
  } else {
    errandEl.hidden = true;
  }
}

/**
 * The HUD steps aside for a face. The chip, the nameplate and the whispers
 * sit at the top of the frame, and the person just north of the player
 * stands exactly there: on a phone lying down the chip covered Don
 * Aurelio's face on the very first frame. Whoever is near enough to talk
 * to has their head measured against each overlay. The chip, which has to
 * stay readable, moves to the foot of the frame (`face-moved`); the plate
 * and the whispers, which pass, go faint (`over-face`), as does the chip if
 * a face is down there too. Measured a few times a second, and the chip is
 * judged from its home corner (cached), never from where it went, or it
 * would bounce between the two.
 */
const FACE_HUD_MS = 120;
let faceHudAt = 0;
let chipHome: DOMRect | null = null;
let chipHomeText = '';
window.addEventListener('resize', () => {
  chipHome = null;
});
function faceClearHud(quiet: boolean) {
  const now = performance.now();
  if (now - faceHudAt < FACE_HUD_MS) return;
  faceHudAt = now;
  const toastsEl = $('toasts');
  if (quiet || mode !== 'play') {
    for (const el of [errandEl, plateEl, toastsEl]) el.classList.remove('over-face');
    return;
  }
  const s = viewScale();
  const [px, py] = player.occupies();
  const heads: [number, number, number, number][] = [];
  for (const v of villagersHere()) {
    const [ox, oy] = v.actor.occupies();
    if (Math.abs(ox - px) + Math.abs(oy - py) > 6) continue;
    const [rx, ry] = v.actor.renderPos();
    // The head and hat: the top of a two-tile figure, crown to chin.
    const [l, t] = worldToScreen(rx + 2, ry - 14);
    heads.push([l, t, l + (TILE - 4) * s, t + 16 * s]);
  }
  const hits = (r: DOMRect) =>
    r.width > 0 && heads.some(([l, t, rr, b]) => r.left < rr && r.right > l && r.top < b && r.bottom > t);
  for (const el of [plateEl, toastsEl]) el.classList.toggle('over-face', hits(el.getBoundingClientRect()));
  // The chip is measured at home whenever it is home, so a new thread (a
  // new height) or a turned phone is judged from the corner it holds.
  const moved = errandEl.classList.contains('face-moved');
  const text = errandEl.textContent ?? '';
  if (moved && (text !== chipHomeText || !chipHome)) {
    // Away when the thread changed or the window turned: come home first.
    errandEl.classList.remove('face-moved', 'over-face');
    chipHome = null;
    return;
  }
  if (!moved) {
    chipHome = errandEl.getBoundingClientRect();
    chipHomeText = text;
  }
  const away = !!chipHome && hits(chipHome);
  errandEl.classList.toggle('face-moved', away);
  errandEl.classList.toggle('over-face', away && moved && hits(errandEl.getBoundingClientRect()));
}

/** Journal announcements: the pen and the margin-note spark. */
const PAGE_TOAST = /^[✎✦]/;
/** Once the last page is being written, the journal is the moment, not a toast. */
function journalClosing(): boolean {
  return state.has('c10.lamp') || state.has('story.end');
}

state.on('journal', (id) => {
  const entry = JOURNAL_BY_ID.get(id);
  // A word's page is titled with the word, and a short one ("Pe") read as a
  // toast cut off mid-name; the word goes in quotes and says it is a word.
  const title = entry?.title ?? id;
  const named = entry?.tab === 'words' ? `the word \u201c${title}\u201d` : title;
  if (!journalClosing()) toasts.show(`✎ a page fills: ${named}`);
  audio.chime();
  {
    const [px, py] = player.renderPos();
    renderer.burst(px + TILE / 2, py + 2, 'sparkle', ['#f2e6d0', '#d9a441']);
  }
  if (!state.has('hint.journal')) {
    state.set('hint.journal');
    toasts.show(keysOrTaps('press J to open the journal', 'tap \u270E to open the journal'));
  }
  // Did this page complete a rhyme? Then Nani noticed it first, in 1974.
  const rhymed = JOURNAL.some(
    (e) =>
      e.rhyme &&
      state.hasPage(e.id) &&
      state.hasPage(e.rhyme.with) &&
      (e.id === id || e.rhyme.with === id),
  );
  if (rhymed && !journalClosing()) toasts.show('✦ a margin note of Nani’s has become legible');
});

/** Mail raised by a `letter:` effect opens once the conversation ends. The
 * read flag waits for the player to close the page: set any earlier, a
 * reload in between lost the letter forever with no re-read path. */
let pendingLetter: string | null = null;
let openLetterId: string | null = null;
state.on('letter', (id) => {
  pendingLetter = id;
});
// When saving stops working (full storage, private browsing), the player
// hears about it once instead of losing every session from there on.
state.onPersistenceLost = () => {
  toasts.show('⚠ the journal cannot be written here; this session will not be remembered');
};
// Bound mid-walk loss: the save also fires when the tab hides or closes,
// and every 30 seconds of play, not only on story beats.
// Only while playing: a fresh visitor idling at the title has no journey
// yet, and saving there wrote an empty journal whose Continue skipped the
// flyleaf and Nani's letter for every player who closed the tab early.
window.addEventListener('pagehide', () => {
  if (mode === 'play') state.save();
});
document.addEventListener('visibilitychange', () => {
  const hidden = document.visibilityState === 'hidden';
  audio.setHidden(hidden);
  if (hidden && mode === 'play') state.save();
});
setInterval(() => {
  if (mode === 'play') state.save();
}, 30000);

state.on('changed', () => {
  // The journal is full: anything still waiting to announce a page (held
  // behind the last page's hush) would arrive after the book has closed.
  if (journalClosing() && toasts.pending) toasts.drop((t) => PAGE_TOAST.test(t));
  applyDressings();
  // The east gate is a pure function of story.complete, so it opens on the
  // flag itself, not only on the ceremony that usually sets it. Idempotent
  // (keyed trigger map, object override), so re-applying costs nothing.
  applyGateState();
  // Tasks are flag gated, so any change to the world can retire the top one.
  // Refreshing only on errands left the chip advising work already finished.
  refreshTaskChip();
});
state.on('errand', (id) => {
  refreshTaskChip();
  toasts.show(id ? '✉ you are carrying something for someone' : '✉ delivered');
});
refreshTaskChip();

let plateTimers: number[] = [];
/**
 * The plate shares the toasts' hush: while a story surface quiets the HUD,
 * a plate waits (or, caught mid-show, goes back to wait) and plays whole
 * once the HUD returns. "CHAPTER SEVEN · COMPLETE" once faded in and out
 * entirely behind the ceremony that followed it.
 */
let plateHeld = false;
let plateWaiting: { text: string; holdMs: number } | null = null;
let plateLive: { text: string; holdMs: number } | null = null;
/** A phone lying down moves the chip out of the plate's way in CSS. */
const PLATE_PUSHES_CHIP = matchMedia('(pointer: coarse) and (max-height: 500px) and (orientation: landscape)');
/**
 * The plate is centered and as wide as its name; the chip is in the corner
 * and as tall as its thread. A long name over a three-line chip ran under it
 * ("THE RIVIERA OF THE CYCLOPS" lost its T at 1280x800), so when the two
 * would touch, the plate steps down below the chip for this showing.
 */
function clearPlateOfChip() {
  plateEl.style.top = '';
  if (PLATE_PUSHES_CHIP.matches || errandEl.hidden) return;
  const p = plateEl.getBoundingClientRect();
  const e = errandEl.getBoundingClientRect();
  if (e.width === 0) return;
  // The plate is measured mid-entrance, still 6px low (its slide in), and a
  // 10px gap on top of that pushed it below a phone's chip even though the
  // two have their own bands there: it then sat over the well and the first
  // face on screen, with the walking tip under it. Measure where it settles.
  const GAP = 4;
  const bottom = p.bottom - 6;
  if (p.left < e.right + GAP && p.right > e.left - GAP && p.top - 6 < e.bottom + GAP && bottom > e.top - GAP) {
    plateEl.style.top = `${Math.round(e.bottom + GAP)}px`;
  }
}

function showPlate(text: string, holdMs = 4200) {
  for (const t of plateTimers) clearTimeout(t);
  plateTimers = [];
  plateEl.classList.remove('show');
  if (plateHeld) {
    plateWaiting = { text, holdMs };
    plateLive = null;
    return;
  }
  plateEl.textContent = text;
  plateLive = { text, holdMs };
  plateTimers = [
    window.setTimeout(() => {
      clearPlateOfChip();
      plateEl.classList.add('show');
    }, 350),
    window.setTimeout(() => {
      plateEl.classList.remove('show');
      plateLive = null;
    }, holdMs),
  ];
}
function holdPlate(held: boolean) {
  if (held === plateHeld) return;
  plateHeld = held;
  if (held) {
    if (plateLive) showPlate(plateLive.text, plateLive.holdMs);
  } else if (plateWaiting) {
    const w = plateWaiting;
    plateWaiting = null;
    showPlate(w.text, w.holdMs);
  }
}
/** A journal switch drops a waiting plate with the rest of the old news. */
function dropPlate() {
  for (const t of plateTimers) clearTimeout(t);
  plateTimers = [];
  plateWaiting = null;
  plateLive = null;
  plateEl.classList.remove('show');
}

// ---------------------------------------------------------------- villagers

type Villager = Sprite & {
  def: NpcDef;
  portrait: HTMLCanvasElement | null;
  think: number;
  want: Dir | null;
  // -- village rhythm (all derived at boot; see the section below) --
  /** Claimed resting spot beside a bench-like object, and which way to face. */
  seat: { at: [number, number]; dir: Dir } | null;
  /** Nearest lamp/fire cell near home; night owls drift into its light. */
  glow: [number, number] | null;
  /** Keepers never fade at night: story-gated folk, companions, two anchors per map. */
  keeper: boolean;
  seated: boolean;
  /** A posted villager who stepped aside to talk walks back here after. */
  postBack: { at: [number, number]; dir: Dir } | null;
  /** 1 fully present, 0 gone for the night. Eased at FADE_SPEED per second. */
  fade: number;
  /** Per-villager timing jitter so nobody moves in lockstep. Timing only. */
  jitter: number;
  baseSheet: HTMLCanvasElement;
  fadeSheet: HTMLCanvasElement | null;
  /** The scene's costume this villager is wearing (see `dress`), if any. */
  costume?: string;
};

function sheetFor(def: NpcDef): HTMLCanvasElement {
  if (def.sprite === 'dog') return makeDogSheet();
  if (def.sprite === 'llama') return makeLlamaSheet('#e8ddc8');
  if (def.sprite === 'llamaBrown') return makeLlamaSheet('#9c6b42');
  return makeSheet(lookFor(def.id, def.look));
}

const villagers: Villager[] = NPCS.map((def) => {
  const sheet = sheetFor(def);
  return {
    def,
    actor: new Actor(def.pos[0], def.pos[1], def.sits ?? 'down'),
    sheet,
    rig: (def.sprite ? 'animal' : 'human') as 'animal' | 'human',
    species: def.sprite, greetId: def.id, // renderer idle life: tail wags, chews, greeting nods
    portrait: def.sprite ? null : makePortrait(lookFor(def.id, def.look)),
    think: Math.random() * 2,
    want: null,
    seat: def.sits ? { at: [def.pos[0], def.pos[1]] as [number, number], dir: def.sits } : null,
    glow: null,
    keeper: true,
    seated: !!def.sits,
    postBack: null,
    fade: 1,
    jitter: Math.random(),
    baseSheet: sheet,
    fadeSheet: null,
  };
});

// Diners and other permanent sitters start, and stay, seated.
for (const v of villagers) if (v.def.sits) v.actor.pose = 'sit';

const dog = villagers.find((v) => v.def.id === 'allqu');
const paca = villagers.find((v) => v.def.id === 'paca');

// ---------------------------------------------------------------- village rhythm
//
// The day has hours now, and villages keep them. At golden hour, villagers
// whose patch of the world holds a bench drift over and settle; deep night
// sends the non-essential home (a soft fade where they stand); whoever stays
// up gravitates toward the nearest lamp. Everything here is derived from the
// maps and the NPC roster at boot; no chapter data knows about any of it.

/** nightLevel where sitters head for their seat (golden hour). */
const SIT_NK = 0.25;
/** nightLevel where non-essential villagers turn in for the night. */
const FADE_NK = 0.75;
/** Fade rate in alpha per second: a two-second goodnight. */
const FADE_SPEED = 0.5;

/** Deterministic 0..1 per npc id: decides WHO does what, never when. */
function idHash(id: string, salt: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return cellHash(h & 0xffff, (h >>> 16) & 0xffff, salt);
}

/** Per-villager phase edges, jittered a touch so nobody moves in lockstep. */
const sitAt = (v: Villager) => SIT_NK + v.jitter * 0.08;
const fadeAt = (v: Villager) => FADE_NK - v.jitter * 0.04;

// Seats, lamps, and keepers, found once at boot.
{
  const claimed = new Set<string>();
  // Bodies that stand in one place for good, as "map:x,y".
  const posted = new Set<string>(
    villagers.filter((v) => v.def.range === 0 && v !== dog).map((v) => `${v.def.map}:${v.def.pos[0]},${v.def.pos[1]}`),
  );
  const PERCHES: [number, number, Dir][] = [
    [0, 1, 'up'],
    [-1, 0, 'right'],
    [1, 0, 'left'],
    [0, -1, 'down'],
  ];
  for (const v of villagers) {
    const tm = maps[v.def.map];
    if (!tm || sceneFor(v.def.map) === 'interior') continue;
    const [hx, hy] = v.def.pos;
    // Nearest lamp or fire within reach of home; the light they gather to.
    let bestGlow: [number, number] | null = null;
    let bestD = 10;
    for (const [gx, gy] of fireCells[v.def.map] ?? []) {
      const d = Math.max(Math.abs(gx - hx), Math.abs(gy - hy));
      if (d < bestD) {
        bestD = d;
        bestGlow = [gx, gy];
      }
    }
    v.glow = bestGlow;
  }
  // Every bench-like object recruits its evening sitter: the closest
  // wandering human within eight tiles of home claims the walkable cell
  // beside it, facing the seat, the same way the player sits. One villager
  // per seat, seats in reading order, ties broken by roster order, so the
  // same people take the same benches every single dusk.
  for (const [mid, tm] of Object.entries(maps)) {
    if (sceneFor(mid) === 'interior') continue;
    const seats: [number, number][] = [];
    for (let y = 0; y < tm.h; y++) {
      for (let x = 0; x < tm.w; x++) {
        if (sitKindsOn(mid).has(tm.object(x, y)?.t ?? '')) seats.push([x, y]);
      }
    }
    const sitters = villagers.filter(
      (v) => v.def.map === mid && !v.def.sprite && v.def.range > 0,
    );
    for (const [sx, sy] of seats) {
      let best: Villager | null = null;
      let bestD = 9;
      for (const v of sitters) {
        if (v.seat) continue;
        const d = Math.max(Math.abs(sx - v.def.pos[0]), Math.abs(sy - v.def.pos[1]));
        if (d < bestD) {
          bestD = d;
          best = v;
        }
      }
      if (!best) continue;
      for (const [dx, dy, dir] of PERCHES) {
        const px = sx + dx;
        const py = sy + dy;
        const k = `${mid}:${px},${py}`;
        if (!tm.inBounds(px, py) || tm.solid(px, py) || claimed.has(k)) continue;
        // Personal space: a perch directly above or below another sitter or
        // anyone posted for good would seat two bodies in one pile.
        const near = (y: number) => claimed.has(`${mid}:${px},${y}`) || posted.has(`${mid}:${px},${y}`);
        if (posted.has(k) || near(py - 1) || near(py + 1)) continue;
        claimed.add(k);
        best.seat = { at: [px, py], dir };
        break;
      }
    }
  }
  // Keepers: anyone story-gated (`when`), the companions, and at least two
  // always-present anchors per map (lowest hash wins) so no square ever dies.
  const byMap = new Map<string, Villager[]>();
  for (const v of villagers) {
    const list = byMap.get(v.def.map) ?? [];
    list.push(v);
    byMap.set(v.def.map, list);
  }
  for (const here of byMap.values()) {
    const kept = new Set(here.filter((v) => v.def.when !== undefined || v === dog || v === paca));
    // Two always-present PEOPLE stay per map; companions don't count for this.
    let anchors = here.filter((v) => kept.has(v) && v.def.when === undefined && !v.def.sprite).length;
    const rest = here
      .filter((v) => !kept.has(v) && v.def.when === undefined && !v.def.sprite)
      .sort((a, b) => idHash(a.def.id, 3) - idHash(b.def.id, 3));
    for (const v of rest) {
      if (anchors >= 2) break;
      kept.add(v);
      anchors++;
    }
    for (const v of here) v.keeper = kept.has(v);
  }
}

/**
 * Villagers an active errand or carried thing currently points at: anyone
 * whose dialogue would react to a held errand/carry flag stays up however
 * late it gets, so the night never strands an open thread.
 */
let erranded = new Set<Villager>();
/**
 * Someone still has something particular to say when the first entry arm that
 * passes is not their unconditional fallback: an unmet greeting, a reunion, a
 * held errand. Those people are an open thread and the night may not take
 * them, however late it gets, because the journal is probably naming them.
 */
function openThread(v: Villager): boolean {
  const arms = v.def.entry;
  const last = arms[arms.length - 1];
  const hit = arms.find((e) => state.check(e.when));
  return !!hit && hit !== last;
}
function refreshErranded() {
  erranded = new Set(
    villagers.filter(
      (v) =>
        openThread(v) ||
        v.def.entry.some((e) =>
          e.when?.has?.some((f) => (f.startsWith('errand.') || f.startsWith('carry.')) && state.has(f)),
        ),
    ),
  );
}
refreshErranded();
state.on('changed', refreshErranded);

/** Swap in a sheet drawn at the current fade alpha; full sheets swap back. */
function applyFade(v: Villager) {
  if (v.fade >= 1) {
    v.sheet = v.baseSheet;
    return;
  }
  if (!v.fadeSheet) {
    v.fadeSheet = document.createElement('canvas');
    v.fadeSheet.width = v.baseSheet.width;
    v.fadeSheet.height = v.baseSheet.height;
  }
  const g = v.fadeSheet.getContext('2d');
  if (!g) return;
  g.clearRect(0, 0, v.fadeSheet.width, v.fadeSheet.height);
  g.globalAlpha = v.fade;
  g.drawImage(v.baseSheet, 0, 0);
  v.sheet = v.fadeSheet;
}

/** One greedy step toward a cell, preferring the longer axis; null when stuck. */
function stepToward(
  a: Actor,
  tx: number,
  ty: number,
  blocked: (x: number, y: number) => boolean,
): Dir | null {
  const [ax, ay] = a.occupies();
  const dx = tx - ax;
  const dy = ty - ay;
  if (dx === 0 && dy === 0) return null;
  const h: Dir | null = dx > 0 ? 'right' : dx < 0 ? 'left' : null;
  const vd: Dir | null = dy > 0 ? 'down' : dy < 0 ? 'up' : null;
  const order = Math.abs(dx) >= Math.abs(dy) ? [h, vd] : [vd, h];
  for (const d of order) {
    if (!d) continue;
    const [nx, ny] = stepFrom(ax, ay, d);
    if (!blocked(nx, ny)) return d;
  }
  return null;
}

/**
 * The world-clock side of the rhythm, run for EVERY villager every frame:
 * fades ease toward their target, and villagers on other maps simply snap to
 * where the hour would have them, so arriving at night finds a night village.
 * Nobody the player is engaged with (dialogue, click-to-walk) ever fades.
 */
function updateRhythm(dt: number) {
  const nk = nightLevel(dayT);
  for (const v of villagers) {
    if (sceneFor(v.def.map) === 'interior') continue;
    // A scheduled custom owns some villagers at some hours; while it does,
    // neither the fade nor the bench-snap may reach across the map at them.
    if (stationControls(v)) continue;
    const engaged = v === talkingTo || autoGoal?.npc === v;
    // Nobody a scene has placed goes home for the night in the middle of it.
    const gone = !v.keeper && !engaged && !erranded.has(v) && !stagedControls(v) && nk > fadeAt(v);
    const target = gone ? 0 : 1;
    if (v.fade !== target) {
      v.fade = target > v.fade ? Math.min(target, v.fade + dt * FADE_SPEED) : Math.max(target, v.fade - dt * FADE_SPEED);
      applyFade(v);
    }
    const duskish = nk >= sitAt(v) && nk < fadeAt(v);
    // A scene that has placed someone keeps them there, bench or no bench.
    if (v.def.map !== map.id && !v.actor.frozen && !stagedControls(v)) {
      // Unobserved villagers teleport through their evening.
      if (v.seat && duskish && !v.seated) {
        v.actor.placeAt(v.seat.at[0], v.seat.at[1], v.seat.dir);
        v.actor.pose = 'sit';
        v.seated = true;
      } else if (v.seated && !duskish && !v.def.sits) {
        v.actor.pose = 'none';
        v.seated = false;
      }
    }
  }
}

// ---------------------------------------------------------------- customs on schedule
//
// Some customs are not conversations: they are things a village visibly DOES
// at an hour, together. A chapter declares STATIONS (cells on a map, a band
// of the evening, who takes part) and the engine derives the rest at boot,
// in the same idiom as the golden-hour benches above. A 'gather' files in
// through the real door and sits out the window (the langar's pangat rows);
// a 'round' walks its cells in order, tending each in turn (the lamplighter
// and her chochin). Sitting through one is how its page is learned; nobody
// says a word, because the custom is the sentence.

/** One stop: where a body stands or sits, facing `dir`; `lamp` names the
 * glow cell this stop tends (rounds only). */
export type StationCell = { at: [number, number]; dir: Dir; lamp?: [number, number] };

export type StationDef = {
  id: string;
  /** The map the custom happens on. */
  map: string;
  /** 'gather': every actor claims one cell and sits through the window.
   *  'round': one actor visits the cells in order, tending each. */
  mode: 'gather' | 'round';
  /** nightLevel band [begin, end) that the custom keeps. */
  window: [number, number];
  cells: StationCell[];
  /** Roster ids, wherever they live; the doors between their maps and the
   * station's are found from the map data at boot. */
  actors: string[];
  /** Event node applied, wordlessly, when the player sits through the
   * custom's heart on its map. `flag` keeps it exactly-once. */
  grant?: { node: string; flag: string; /** gather: bodies seated first */ min?: number };
};

type Berth = {
  v: Villager;
  cell: StationCell;
  home: { map: string; pos: [number, number] };
  /** Small personal delay at each turn of the hour; nobody moves in lockstep. */
  wait: number;
  /** Live BFS path being walked, replanned when someone steps into it. */
  path: [number, number][];
};

type StationRt = {
  def: StationDef;
  berths: Berth[];
  /** Doorway on each home map that leads to the station map. */
  doorOut: Map<string, [number, number]>;
  /** Doorway on the station map that leads back to each home map. */
  doorIn: Map<string, [number, number]>;
  wasOn: boolean;
  round: { idx: number; pauseT: number; done: boolean };
};

const stationsRt: StationRt[] = [...DELHI_STATIONS, ...SHIONOURA_STATIONS].map((def) => {
  const berths: Berth[] = [];
  def.actors.forEach((id, i) => {
    const v = villagers.find((x) => x.def.id === id);
    const cell = def.cells[Math.min(i, def.cells.length - 1)];
    if (v && cell) {
      berths.push({ v, cell, home: { map: v.def.map, pos: [v.def.pos[0], v.def.pos[1]] }, wait: 0, path: [] });
    }
  });
  const doorOut = new Map<string, [number, number]>();
  const doorIn = new Map<string, [number, number]>();
  for (const b of berths) {
    const out = (REGION_MAPS[b.home.map]?.triggers ?? []).find((t) => t.type === 'door' && t.to === def.map);
    if (out) doorOut.set(b.home.map, [out.at[0], out.at[1]]);
    const back = (REGION_MAPS[def.map]?.triggers ?? []).find((t) => t.type === 'door' && t.to === b.home.map);
    if (back) doorIn.set(b.home.map, [back.at[0], back.at[1]]);
  }
  return { def, berths, doorOut, doorIn, wasOn: false, round: { idx: 0, pauseT: 0, done: false } };
});

const gatherOn = (st: StationRt, nk: number) => nk >= st.def.window[0] && nk < st.def.window[1];
/**
 * A round STARTS only inside its window, but once the keeper is out on the
 * map with her taper it runs to the last lamp however fast dusk deepens
 * (sitting speeds the clock fivefold; her feet keep their own time).
 */
const roundRuns = (st: StationRt, nk: number) =>
  !st.round.done &&
  nk >= st.def.window[0] &&
  (st.round.idx > 0 || st.berths[0]?.v.def.map === st.def.map || nk < st.def.window[1]);

/**
 * Lamp wake per tended glow cell, `map:x,y` -> eased 0..1. The light pass
 * consults this so a round's lamps hold their daytime ember until the
 * lamplighter reaches them, instead of all waking with the dusk at once.
 */
const stationLampEase = new Map<string, { k: number; lit: boolean }>();
for (const st of stationsRt) {
  if (st.def.mode !== 'round') continue;
  for (const c of st.def.cells) {
    if (c.lamp) stationLampEase.set(`${st.def.map}:${c.lamp[0]},${c.lamp[1]}`, { k: 0, lit: false });
  }
}

/** Wake factor for a tended lamp cell, or null when nothing tends it. */
function stationLampWake(mapId: string, x: number, y: number): number | null {
  return stationLampEase.get(`${mapId}:${x},${y}`)?.k ?? null;
}

/** Where a station's actor lives when off duty, or null for anyone else. */
function stationHomeOf(v: Villager): { map: string; pos: [number, number] } | null {
  for (const st of stationsRt) for (const b of st.berths) if (b.v === v) return b.home;
  return null;
}

/** Whether a station currently owns this villager's whereabouts. */
function stationControls(v: Villager): boolean {
  const nk = nightLevel(dayT);
  for (const st of stationsRt) {
    for (const b of st.berths) {
      if (b.v !== v) continue;
      if (v.def.map === st.def.map) return true; // out at (or leaving) the station
      if (st.def.mode === 'round' ? roundRuns(st, nk) : gatherOn(st, nk)) return true;
    }
  }
  return false;
}

/** How a station-seated villager faces when a conversation lets go of them. */
function stationSeatDir(v: Villager): Dir | null {
  for (const st of stationsRt) {
    for (const b of st.berths) {
      if (b.v === v && v.def.map === st.def.map) return b.cell.dir;
    }
  }
  return null;
}

/** Step through the doorway onto the station map (visibly, if watched). */
function stationCross(st: StationRt, b: Berth, target: [number, number]) {
  const into = st.doorIn.get(b.home.map);
  b.v.def.map = st.def.map;
  const [ex, ey] = map.id === st.def.map && into ? into : target;
  b.v.actor.placeAt(ex, ey, 'down');
  b.path = [];
}

/** Back to ordinary hours: home map, home cell, standing. */
function stationHome(b: Berth) {
  b.v.def.map = b.home.map;
  b.v.actor.placeAt(b.home.pos[0], b.home.pos[1], 'down');
  b.v.actor.pose = 'none';
  b.v.seated = false;
  b.path = [];
}

/**
 * Walk a berth's villager along a live BFS path toward a cell on the current
 * map; true once arrived and settled. When someone stands in the plan, it
 * replans; when no plan exists this frame, a greedy nudge keeps life moving.
 */
function stepStation(b: Berth, tx: number, ty: number, dt: number): boolean {
  const a = b.v.actor;
  const blocked = blockedFor(a);
  const [ax, ay] = a.occupies();
  if (ax === tx && ay === ty) {
    if (a.isMoving) {
      a.update(dt, { intent: null, blocked });
      return false;
    }
    return true;
  }
  while (b.path.length) {
    const head = b.path[0];
    if (head && head[0] === ax && head[1] === ay) b.path.shift();
    else break;
  }
  let next = b.path[0];
  const tail = b.path[b.path.length - 1];
  const stale =
    !next || Math.abs(next[0] - ax) + Math.abs(next[1] - ay) !== 1 || !tail || tail[0] !== tx || tail[1] !== ty;
  if (stale) {
    // Plan around bodies first; if bodies seal every route, plan through the
    // bare map and wait politely wherever someone happens to be standing.
    b.path = pathBetween([ax, ay], tx, ty, blocked) ?? pathBetween([ax, ay], tx, ty, (x, y) => map.solid(x, y)) ?? [];
    next = b.path[0];
  }
  if (!next) {
    a.update(dt, { intent: stepToward(a, tx, ty, blocked), blocked });
    return false;
  }
  if (blocked(next[0], next[1])) {
    if (map.solid(next[0], next[1])) {
      b.path = [];
      a.update(dt, { intent: stepToward(a, tx, ty, blocked), blocked });
    } else {
      // A neighbor, not a wall: stand and let them pass (or finish sitting).
      a.update(dt, { intent: null, blocked });
    }
    return false;
  }
  const dx = next[0] - ax;
  const dy = next[1] - ay;
  a.update(dt, { intent: dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up', blocked });
  return false;
}

/** Light (or dark) one tended lamp; a watched lighting gets its little flare. */
function setStationLamp(st: StationRt, c: StationCell, lit: boolean, instant = false) {
  if (!c.lamp) return;
  const e = stationLampEase.get(`${st.def.map}:${c.lamp[0]},${c.lamp[1]}`);
  if (!e) return;
  e.lit = lit;
  if (!lit) e.k = 0;
  else if (instant) e.k = 1;
  else if (map.id === st.def.map) {
    renderer.burst(c.lamp[0] * TILE + TILE / 2, c.lamp[1] * TILE + TILE / 2 - 6, 'sparkle', ['#ffd9a8', '#f2e6d0']);
  }
}

function updateGatherStation(st: StationRt, nk: number, dt: number) {
  const on = gatherOn(st, nk);
  if (on !== st.wasOn) {
    st.wasOn = on;
    for (const b of st.berths) b.wait = 0.4 + b.v.jitter * 4;
  }
  for (const b of st.berths) {
    const v = b.v;
    if (v.actor.frozen || v === talkingTo) continue; // mid-word is sacred
    if (!state.check(v.def.when)) {
      // Left town while stationed: quietly restore them before they strand.
      if (v.def.map !== b.home.map) stationHome(b);
      continue;
    }
    if (on) {
      if (v.def.map !== st.def.map) {
        if (b.wait > 0) {
          b.wait -= dt;
          continue;
        }
        const door = st.doorOut.get(b.home.map);
        if (v.def.map === map.id && door) {
          // Watched: walk to the doorway, then step through it.
          if (stepStation(b, door[0], door[1], dt)) stationCross(st, b, b.cell.at);
        } else if (v.def.map !== map.id) {
          stationCross(st, b, b.cell.at);
        }
      } else if (map.id === st.def.map) {
        if (v.seated) continue;
        if (b.wait > 0) {
          b.wait -= dt;
          continue;
        }
        if (stepStation(b, b.cell.at[0], b.cell.at[1], dt)) {
          v.actor.face(b.cell.dir);
          v.actor.pose = 'sit';
          v.seated = true;
        }
      } else if (!v.seated) {
        // Unobserved rooms simply hold the hour's shape.
        v.actor.placeAt(b.cell.at[0], b.cell.at[1], b.cell.dir);
        v.actor.pose = 'sit';
        v.seated = true;
      }
    } else if (v.def.map === st.def.map) {
      if (v.seated) {
        v.actor.pose = 'none';
        v.seated = false;
        b.wait = 0.4 + v.jitter * 3;
      }
      const out = st.doorIn.get(b.home.map);
      if (map.id === st.def.map && out) {
        if (b.wait > 0) {
          b.wait -= dt;
          continue;
        }
        if (stepStation(b, out[0], out[1], dt)) stationHome(b);
      } else {
        stationHome(b);
      }
    }
  }
  // Sitting into the full rows during the meal fills the page, wordlessly.
  const g = st.def.grant;
  if (g && on && sitting && sitTotal > 2 && map.id === st.def.map && !state.has(g.flag)) {
    const seated = st.berths.filter((b) => b.v.def.map === st.def.map && b.v.seated).length;
    if (seated >= (g.min ?? 1)) state.apply(NODES[g.node]?.effects);
  }
}

function updateRoundStation(st: StationRt, nk: number, dt: number) {
  const b = st.berths[0];
  const cells = st.def.cells;
  const [w0, w1] = st.def.window;
  const rt = st.round;
  // Dawn resets the round; the lamps go back to waiting for their evening.
  if (nk < w0 && (rt.idx > 0 || rt.done)) {
    rt.idx = 0;
    rt.pauseT = 0;
    rt.done = false;
    for (const c of cells) setStationLamp(st, c, false);
    if (b && b.v.def.map === st.def.map && map.id !== st.def.map) stationHome(b);
  }
  const free = b && !b.v.actor.frozen && b.v !== talkingTo && state.check(b.v.def.when) && !stagedControls(b.v);
  if (map.id !== st.def.map) {
    // Unwatched, the round keeps village time: progress follows the dusk.
    if (nk >= w0) {
      const frac = Math.max(0, Math.min(1, (nk - w0) / (w1 - w0)));
      const derived = Math.min(cells.length, Math.floor(frac * (cells.length + 1)));
      while (rt.idx < derived) {
        const c = cells[rt.idx];
        if (c) setStationLamp(st, c, true, true);
        rt.idx++;
      }
      if (rt.idx >= cells.length) rt.done = true;
      if (b && free) {
        if (!rt.done) {
          const c = cells[Math.min(rt.idx, cells.length - 1)];
          if (b.v.def.map === map.id) {
            // The player is where she lives: she leaves through the door.
            const door = st.doorOut.get(b.home.map);
            if (!door || stepStation(b, door[0], door[1], dt)) {
              if (c) stationCross(st, b, c.at);
            }
          } else if (c) {
            b.v.def.map = st.def.map;
            b.v.actor.placeAt(c.at[0], c.at[1], c.dir);
            b.path = [];
          }
        } else if (b.v.def.map === st.def.map) {
          stationHome(b);
        }
      }
    }
    return;
  }
  // Watched: she actually walks it, lamp to lamp, in order.
  if (!b || !free) return;
  const v = b.v;
  if (!roundRuns(st, nk)) {
    // Off duty on the lane: see herself home through the door she came by.
    if (v.def.map === st.def.map) {
      const out = st.doorIn.get(b.home.map);
      if (!out || stepStation(b, out[0], out[1], dt)) stationHome(b);
    }
    return;
  }
  if (v.def.map !== st.def.map) {
    const c = cells[0];
    if (c) stationCross(st, b, c.at);
    return;
  }
  if (rt.pauseT > 0) {
    rt.pauseT -= dt;
    if (rt.pauseT <= 0) {
      const c = cells[rt.idx];
      if (c) setStationLamp(st, c, true);
      rt.idx++;
      if (rt.idx >= cells.length) {
        rt.done = true;
        // Seated through the whole small ceremony: the page fills, silently,
        // at the last lamp. No dialogue; the lane coming on is the sentence.
        const g = st.def.grant;
        if (g && sitting && !state.has(g.flag)) state.apply(NODES[g.node]?.effects);
      }
    }
    return;
  }
  const c = cells[rt.idx];
  if (!c) {
    rt.done = true;
    return;
  }
  if (stepStation(b, c.at[0], c.at[1], dt)) {
    v.actor.face(c.dir);
    rt.pauseT = 0.8;
  }
}

/** Seconds until a scene that says the lamps are lit lights its next one. */
let lampsLitWait = 0;
function updateStations(dt: number) {
  const nk = nightLevel(dayT);
  for (const st of stationsRt) {
    if (st.def.mode === 'gather') updateGatherStation(st, nk, dt);
    else updateRoundStation(st, nk, dt);
  }
  // A scene whose words light the lamps (the matsuri's "the chochin come
  // on"): whatever the round has reached, the rest take now, one after
  // another, each with its wick-flare where it is watched.
  lampsLitWait = Math.max(0, lampsLitWait - dt);
  for (const hold of LAMPS_LIT) {
    if (!state.check(hold.when)) continue;
    for (const st of stationsRt) {
      if (st.def.mode !== 'round' || st.def.map !== hold.map) continue;
      const dark = st.def.cells.find((c) => c.lamp && !stationLampEase.get(`${st.def.map}:${c.lamp[0]},${c.lamp[1]}`)?.lit);
      if (dark) {
        if (lampsLitWait > 0) continue;
        const watched = map.id === st.def.map;
        setStationLamp(st, dark, true, !watched);
        lampsLitWait = watched ? 0.35 : 0;
      } else {
        st.round.idx = st.def.cells.length;
        st.round.done = true;
      }
    }
  }
  // Tended lamps ease up to their evening glow: a wick taking, not a switch.
  for (const e of stationLampEase.values()) {
    if (e.lit && e.k < 1) e.k = Math.min(1, e.k + dt * 1.5);
  }
}

// ---------------------------------------------------------------- the ending's staging
//
// The last two evenings are staged, not reported (data in
// content/return/staging.ts): the hour each stretch was written in, the
// village walking to the well for its verdict, Carmen walking the stone up
// beside you, and the lamplit hush of the last page (only the hum, the
// camera leaning in). Everything is derived from flags, so a reload simply
// stages it again.

type Staged = {
  v: Villager;
  home: { map: string; pos: [number, number]; range: number };
  path: [number, number][];
  /** A companion lets go at once; a crowd waits for the talk to end. */
  escort: boolean;
  /** In their place (a crowd member) or on the trail (a companion). */
  arrived: boolean;
  /** Seconds spent waiting on a body in the way; see stageStep. */
  wait?: number;
};
const staged = new Map<Villager, Staged>();
const byNpc = (id: string) => villagers.find((x) => x.def.id === id);
/** The lean of the last page: 0 off, else eased 0..1 toward LAMP.zoom. */
let lampT = 0;
let lampOver = false;

/**
 * The player's last few cells on this map, newest last. A companion walks
 * this path two steps back, so there is always a clear tile between you:
 * she never steps into the tile you are on, or the one you are leaving.
 */
const trail: [number, number][] = [];
let trailMap = '';
function noteTrail() {
  if (trailMap !== map.id) {
    trail.length = 0;
    trailMap = map.id;
  }
  const [x, y] = player.occupies();
  const last = trail[trail.length - 1];
  if (last && last[0] === x && last[1] === y) return;
  trail.push([x, y]);
  if (trail.length > 6) trail.shift();
}
const manhattan = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

/** Where a companion arriving through a door stands: two steps off, behind if the ground allows. */
function trailSpot(self: Actor): [number, number] | null {
  const p = player.occupies();
  const [bx, by] = stepFrom(...stepFrom(p[0], p[1], OPPOSITE[player.dir]), OPPOSITE[player.dir]);
  const open = (x: number, y: number) => map.inBounds(x, y) && !map.solid(x, y) && !onDoorstep(x, y);
  // Where she lands, nobody already stands, nor directly above or below.
  const free = (x: number, y: number) => open(x, y) && !heldByOther(x, y, self) && !crowdsSomeone(x, y, self);
  const cells: [number, number][] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const c: [number, number] = [p[0] + dx, p[1] + dy];
      if (manhattan(c, p) !== 2 || !free(c[0], c[1])) continue;
      // A tile between must be open too, or she is on the far side of a wall.
      const mids: [number, number][] = [[p[0] + Math.sign(dx), p[1]], [p[0], p[1] + Math.sign(dy)]];
      if (!mids.some(([mx, my]) => (mx !== p[0] || my !== p[1]) && open(mx, my))) continue;
      cells.push(c);
    }
  }
  cells.sort((a, b) => manhattan(a, [bx, by]) - manhattan(b, [bx, by]));
  return cells[0] ?? null;
}

/**
 * Walk a staged villager toward a cell. It plans around other bodies when it
 * can and never steps into a cell another body holds (Carmen once walked into
 * the player's column after the apacheta, and the three drew as one pile).
 * A crowd converging on one well could deadlock that way, each waiting for a
 * neighbour who waits for them, so after a few patient seconds a walker may
 * plan through the crowd; it still waits for each cell to clear. Only the
 * player's own cells are absolute. True once arrived and settled.
 */
const STAGE_PATIENCE = 2.5;
function stageStep(s: Staged, tx: number, ty: number, dt: number): boolean {
  const a = s.v.actor;
  const [px, py] = player.occupies();
  const held = (x: number, y: number) => heldByOther(x, y, a);
  const blocked = (x: number, y: number) =>
    map.solid(x, y) || held(x, y) || (x === px && y === py) || (x === player.x && y === player.y);
  const [ax, ay] = a.occupies();
  if (ax === tx && ay === ty) {
    if (a.isMoving) {
      a.update(dt, { intent: null, blocked });
      return false;
    }
    return true;
  }
  while (s.path.length && s.path[0]![0] === ax && s.path[0]![1] === ay) s.path.shift();
  let next = s.path[0];
  const tail = s.path[s.path.length - 1];
  if (!next || Math.abs(next[0] - ax) + Math.abs(next[1] - ay) !== 1 || !tail || tail[0] !== tx || tail[1] !== ty) {
    const patient = (s.wait ?? 0) > STAGE_PATIENCE;
    s.path =
      pathBetween([ax, ay], tx, ty, blocked) ??
      (patient ? pathBetween([ax, ay], tx, ty, (x, y) => map.solid(x, y) || playerHolds(x, y)) : null) ??
      [];
    next = s.path[0];
  }
  if (!next || blocked(next[0], next[1])) {
    // Someone is in the way: stand, and look again in a moment.
    s.path = [];
    s.wait = (s.wait ?? 0) + dt;
    a.update(dt, { intent: null, blocked });
    return false;
  }
  s.wait = 0;
  const dx = next[0] - ax;
  const dy = next[1] - ay;
  a.update(dt, { intent: dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up', blocked });
  return false;
}

type Want = {
  at?: [number, number];
  map?: string;
  dir?: Dir;
  escort?: boolean;
  sit?: boolean;
  busy?: boolean;
  look?: Partial<Look>;
};

/** Who the story has a place for right now: an escort beats a blocking. */
function stageWants(): Map<Villager, Want> {
  const want = new Map<Villager, Want>();
  for (const e of ESCORTS) {
    const v = byNpc(e.id);
    if (v && state.check(e.when)) want.set(v, { escort: true });
  }
  for (const b of BLOCKING) {
    const v = byNpc(b.id);
    if (v && !want.has(v) && state.check(b.when)) {
      want.set(v, { at: b.at, map: b.map, dir: b.dir, sit: b.sit, busy: b.sit || b.busy, look: b.look });
    }
  }
  return want;
}

/** A villager's staging record, begun the first time a scene wants them. */
function stagedOf(v: Villager): Staged {
  let s = staged.get(v);
  if (!s) {
    // A lamplighter caught mid-round is staged from where she lives, not
    // from the lamp she was standing under.
    const home = stationHomeOf(v) ?? { map: v.def.map, pos: [v.def.pos[0], v.def.pos[1]] as [number, number] };
    s = {
      v,
      home: { map: home.map, pos: [home.pos[0], home.pos[1]], range: v.def.range },
      path: [],
      escort: false,
      arrived: false,
    };
    staged.set(v, s);
    v.seated = false;
    v.actor.pose = 'none';
  }
  return s;
}

const costumeKey = (look?: Partial<Look>) => (look ? JSON.stringify(look) : '');

/** Could the player see this villager change right now? */
function watched(v: Villager): boolean {
  if (v.def.map !== map.id || warp?.phase === 'out') return v.def.map === map.id;
  const [x, y] = v.actor.renderPos();
  const m = 2 * TILE;
  return x > camera.x - m && x < camera.x + VIEW_W + m && y > camera.y - m && y < camera.y + VIEW_H + m;
}

/** Dress a villager for a scene (a mop wig, a little umbrella), or back in their own clothes. */
function dress(v: Villager, look: Partial<Look> | undefined) {
  if (v.def.sprite) return;
  const lk = { ...lookFor(v.def.id, v.def.look), ...(look ?? {}) };
  v.baseSheet = makeSheet(lk);
  v.sheet = v.baseSheet;
  v.fadeSheet = null;
  v.portrait = makePortrait(lk);
  v.costume = costumeKey(look) || undefined;
  if (v.fade < 1) applyFade(v);
}

/**
 * A door's dark is a cut: nobody watched the scene get ready, so it is ready.
 * Everyone a scene wants on the map just entered is put on their mark,
 * dressed for it, and anyone a finished scene let go is simply home. Time
 * passing in place (a night, two weeks of watches) is a door onto the same
 * map, so the next scene is already standing there when the light comes up.
 */
function settleInDark() {
  const want = stageWants();
  for (const [v, w] of want) {
    if (w.escort || w.map !== map.id || !w.at) continue;
    const s = stagedOf(v);
    const [tx, ty] = w.at;
    v.def.map = w.map;
    v.def.pos = [tx, ty];
    v.actor.placeAt(tx, ty, w.dir!);
    v.actor.pose = w.sit ? 'sit' : 'none';
    v.seated = !!w.sit;
    s.path = [];
    s.arrived = true;
    if (costumeKey(w.look) !== (v.costume ?? '')) dress(v, w.look);
  }
  for (const [v, s] of [...staged]) {
    if (want.has(v) || s.escort) continue;
    if (v.def.map !== map.id && s.home.map !== map.id) continue;
    if (v.actor.pose === 'sit' && !v.def.sits) v.actor.pose = 'none';
    v.seated = !!v.def.sits;
    v.def.map = s.home.map;
    v.def.pos = s.home.pos;
    v.def.range = s.home.range;
    v.actor.placeAt(s.home.pos[0], s.home.pos[1], 'down');
    if (v.costume) dress(v, undefined);
    staged.delete(v);
  }
}

function updateStaging(dt: number) {
  // The hour the words were written in: eased forward into its window
  // (a quick time-lapse, ease-out), then held under its end.
  // After the book, the night at the well keeps its hour for as long as you stay.
  if (afterglow && map.id !== 'village') afterglow = false;
  const hold = Number.isFinite(todOverride)
    ? undefined
    : afterglow
      ? AFTERGLOW_HOUR
      : HOURS.find((h) => state.check(h.when) && !(h.notOn ?? []).includes(map.id));
  if (hold && (dayT < hold.min || dayT > hold.max)) {
    const past = (dayT - hold.max + 1) % 1;
    if (past < 0.02) dayT = hold.max;
    else if (hold.snap) {
      // Only where nobody watches the light jump: not under words still on
      // screen, not while a door closes; in its dark, or at a reload.
      if (!textbox.isOpen && !pendingTravel && warp?.phase !== 'out') dayT = hold.min;
    }
    else {
      const dist = (hold.min - dayT + 1) % 1;
      const step = Math.max(0.025, dist * 0.7) * dt;
      dayT = step >= dist ? hold.min : (dayT + step) % 1;
    }
  }

  const want = stageWants();
  for (const [v, w] of want) {
    const s = stagedOf(v);
    s.escort = !!w.escort;
    // Dressed for the scene (or out of it) only where nobody sees the change.
    if (costumeKey(w.look) !== (v.costume ?? '') && !watched(v)) dress(v, w.look);
    // Someone busy at their work answers without looking up from it: the
    // talk may turn everyone else, never them.
    if (w.busy && s.arrived && v.def.map === map.id && !v.actor.isMoving) v.actor.face(w.dir!);
    if (v.actor.frozen || v === talkingTo) continue; // mid-word is sacred
    if (w.escort) {
      if (v.def.map !== map.id) {
        // Through the door a moment behind you, as companions are.
        const spot = trailSpot(v.actor);
        if (!spot || warp) continue;
        v.def.map = map.id;
        v.actor.placeAt(spot[0], spot[1], player.dir);
        s.path = [];
        continue;
      }
      // Two steps back along your own path; standing, she turns to you.
      const a = v.actor.occupies();
      const p = player.occupies();
      // Ahead of you on your way (you turned back down the road): she steps
      // off it, across your heading, and lets you pass; standing beside the
      // lane she holds still. Following the trail from up there walked her
      // back into the lane after every sidestep, a mirror across the road.
      if (yielding.has(v.actor)) {
        if (v.actor.isMoving) {
          v.actor.update(dt, { intent: null, blocked: () => true });
          continue;
        }
        yielding.delete(v.actor);
      }
      const ahead = aheadOfPlayer(a);
      if (ahead) {
        if (!v.actor.isMoving) {
          const d = ahead === 'lane' ? yieldStep(v.actor, () => false) : null;
          if (d) {
            v.actor.stepTo(d, towardPlayer(stepFrom(a[0], a[1], d)));
            yielding.add(v.actor);
          } else v.actor.face(towardPlayer(a));
        } else stageStep(s, a[0], a[1], dt);
        continue;
      }
      const tgt = trail.length >= 3 ? trail[trail.length - 3]! : null;
      const onYou = tgt && (manhattan(tgt, p) === 0 || (tgt[0] === player.x && tgt[1] === player.y));
      const near = manhattan(a, p) <= 2 && !player.isMoving;
      if (!tgt || onYou || (near && manhattan(a, tgt) > 0 && manhattan(a, p) <= manhattan(tgt, p))) {
        if (!v.actor.isMoving) {
          const [ax, ay] = a;
          const dx = p[0] - ax;
          const dy = p[1] - ay;
          v.actor.face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
        } else stageStep(s, a[0], a[1], dt);
        continue;
      }
      s.arrived = stageStep(s, tgt[0], tgt[1], dt);
      continue;
    }
    const [tx, ty] = w.at!;
    const [ox, oy] = v.def.pos;
    v.def.pos = [tx, ty];
    // A new place (the next scene's blocking) gets up from the old one.
    if ((ox !== tx || oy !== ty) && v.actor.pose === 'sit') {
      v.actor.pose = 'none';
      v.seated = false;
    }
    const settle = () => {
      if (!w.sit) return;
      v.actor.pose = 'sit';
      v.seated = true;
    };
    if (v.def.map !== w.map) {
      if (map.id === v.def.map) continue; // never vanish in front of the player
      v.def.map = w.map!;
      v.actor.placeAt(tx, ty, w.dir!);
      settle();
      s.path = [];
    } else if (map.id === w.map) {
      // Arrived, they keep their place; while a conversation is on, every
      // face around the jug turns to the one person who was there. A
      // narrator's line turns nobody (Hana keeps looking at her town), and
      // someone busy at their work keeps facing it.
      s.arrived = stageStep(s, tx, ty, dt);
      if (s.arrived) {
        const [px, py] = player.occupies();
        const dx = px - tx;
        const dy = py - ty;
        const toward: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        v.actor.face(textbox.isOpen && talkingTo && !w.busy ? toward : w.dir!);
        settle();
      }
    } else {
      v.actor.placeAt(tx, ty, w.dir!);
      settle();
    }
  }
  // The evening let go of them: home on their own feet when watched. The
  // crowd never leaves mid-talk; Carmen leaves as the pen comes out.
  for (const [v, s] of staged) {
    if (want.has(v) || (textbox.isOpen && !s.escort) || v === talkingTo) continue;
    if (v.costume && !watched(v)) dress(v, undefined);
    if (v.actor.pose === 'sit' && !v.def.sits) {
      v.actor.pose = 'none';
      v.seated = false;
    }
    const release = () => {
      v.def.map = s.home.map;
      v.def.pos = s.home.pos;
      v.def.range = s.home.range;
      v.actor.placeAt(s.home.pos[0], s.home.pos[1], 'down');
      staged.delete(v);
    };
    if (v.def.map === map.id) {
      if (s.home.map !== map.id) continue; // stays at the well until unwatched
      if (stageStep(s, s.home.pos[0], s.home.pos[1], dt)) {
        v.def.pos = s.home.pos;
        v.def.range = s.home.range;
        staged.delete(v);
      }
    } else release();
  }

  // The last page's hush: from its first word until the book is put down.
  // The book put down in front of you (not a reload after it) leaves the
  // night it was written in: the afterglow, held while you stay.
  if (!lampOver && state.has('story.end') && !textbox.isOpen && !albumUI.isOpen) {
    lampOver = true;
    if (lampT > 0 && map.id === 'village') afterglow = true;
  }
  const lampOn = state.has(LAMP.flag) && !lampOver;
  // The hush outlasts the book by the curtain's held dark.
  audio.setHearth(lampOn || curtainT !== null);
  lampT = lampOn ? Math.min(1, lampT + dt / LAMP.seconds) : 0;

  noteTrail();
  updateProps();
  updateMeeting(dt);
  updateCurtain(dt);
}

/**
 * The curtain after the closing book. The book goes dark over itself (see
 * album.ts), and then the dark is held: a few seconds of black with only the
 * hum under it, nothing to read and no key that does anything, before the
 * well comes back up, slowly, lamplit, with you still standing at it. Only then
 * does the chip say there is someone at the gate. (`curtainT`, declared
 * with the fade it drives, is the seconds since the book went, or null.)
 */
const CURTAIN_HOLD = 2.6;
const CURTAIN_IN = 3.2;
function startCurtain() {
  curtainT = 0;
  player.frozen = true;
  fadeEl.style.opacity = '1';
  errandEl.hidden = true;
}
function updateCurtain(dt: number) {
  if (curtainT === null) return;
  curtainT += dt;
  const k = (curtainT - CURTAIN_HOLD) / CURTAIN_IN;
  if (k < 1) {
    const t = Math.max(0, k);
    fadeEl.style.opacity = String(1 - t * t * (3 - 2 * t));
    return;
  }
  fadeEl.style.opacity = '0';
  curtainT = null;
  player.frozen = false;
  refreshTaskChip();
}

/** The night after the book: lamps, windows and the well's pool held, and the hour with them. */
let afterglow = false;
const AFTERGLOW_HOUR: { min: number; max: number; snap?: boolean } = { min: 0.66, max: 0.7 };

/**
 * The evening's props follow the story: the jug is at the well from the call
 * on, and the river stone is on the cairn from the moment it is laid (in the
 * scene, from the line that lays it; the flag itself is raised as the scene
 * opens).
 */
const STONE_LINE = Math.max(0, NODES['c10.apacheta.lay']?.lines.findIndex((l) => /river stone/i.test(l.text)) ?? 2);
function updateProps() {
  const jm = maps[JUG.map];
  if (jm) {
    const want = state.check(JUG.when);
    const [jx, jy] = JUG.at;
    const has = jm.object(jx, jy)?.t === 'jug';
    if (want !== has) jm.setObject(jx, jy, want ? { t: 'jug', solid: true } : null);
  }
  // Don Teófilo's splash for the earth is the meeting's first act.
  setJugPoured(state.has('c10.carmen.her') || /^c10\.(verdict|her\.)/.test(textbox.currentNode));
  const laying = textbox.currentNode === 'c10.apacheta.lay' && textbox.currentLine < STONE_LINE;
  const stone = state.has('c10.apacheta.done') && !laying;
  // Watched, the stone going on catches the light for a moment.
  if (stone && cairnStone === false && map.id === 'east-road' && textbox.currentNode === 'c10.apacheta.lay') {
    renderer.burst(CAIRN_AT[0] * TILE + TILE / 2, (CAIRN_AT[1] + 1) * TILE - 37, 'sparkle', ['#f2e6d0', '#cfe0dc', '#d9a441']);
  }
  cairnStone = stone;
  setCairnStone(stone);
}
let cairnStone: boolean | null = null;

/**
 * Taking your place: once the ring has formed, stepping into its open side
 * starts the meeting, so nobody has to find Carmen's elbow through a crowd.
 * If someone is still on their way, the ring waits a few seconds for them
 * and then begins anyway.
 */
let meetingWait = 0;
function updateMeeting(dt: number) {
  if (map.id !== MEETING.map || !state.check(MEETING.when) || mode !== 'play') return;
  if (textbox.isOpen || warp || anyGameOpen() || journalUI.isOpen || albumUI.isOpen) return;
  // The step into the place counts, not the stop: a held key would carry
  // you on into the well itself before a standing check ever saw you.
  const [sx, sy] = MEETING.spot;
  const [ox, oy] = player.occupies();
  const inRing = ox === sx && oy === sy;
  const speaker = byNpc(MEETING.speaker);
  if (!inRing || !speaker || speaker.def.map !== map.id) {
    meetingWait = 0;
    return;
  }
  const ring = [...staged.values()].filter((s) => !s.escort && s.v.def.map === map.id);
  meetingWait += dt;
  if (!staged.get(speaker)?.arrived || (ring.some((s) => !s.arrived) && meetingWait < 5)) return;
  meetingWait = 0;
  player.face('up');
  startNpcDialogue(speaker);
}

/** Whether the ending is walking this villager; the leash and seats stand aside. */
function stagedControls(v: Villager): boolean {
  return staged.has(v);
}

// ---------------------------------------------------------------- the ending's light
//
// The clock alone cannot paint the last evening: at the hours the ending
// holds, the day curve is already the blue of a night on the way, and the
// verdict and the last page read as an overcast afternoon. So the two
// evenings carry their own light on top of the clock. `gold` is the verdict
// and the walk up: a low sun raking in from the west, long warm shadows.
// `lamp` is the walk down and the last page: the sun on the ridge, the
// stone going amber, the lamps and the kitchen windows taking over. Both
// ease, so nothing snaps; both let go slowly after the book is put down.

const END_LIT_MAPS = new Set(['village', 'east-road']);
/** The well's middle, in village pixels: the ending's centre of everything. */
const WELL_PX: [number, number] = [21 * TILE + TILE / 2, 15 * TILE + TILE / 2];
const endLight = { gold: 0, lamp: 0 };
/** Low sun: warm, a little dimmed, blue held down but not crushed. */
const GOLD_AMBIENT: [number, number, number] = [255, 206, 150];
/** Lamplit dusk: the sky's violet on the stone, deep enough for every lamp to carry. */
const LAMP_AMBIENT: [number, number, number] = [128, 110, 142];

function updateEndLight(dt: number) {
  const here = END_LIT_MAPS.has(map.id);
  // The stone is laid in the last of the gold; the lamps are the walk down
  // (and the village below, seen from the pass).
  const onPass = map.id === 'east-road' && textbox.currentNode === 'c10.apacheta.lay';
  // Once the lamps line has been read the sun is down on the pass too.
  const lit = onPass && textbox.currentLine > VISTA_LINE;
  const gold =
    here && !vistaOn && !lit && state.has('c10.well.called') && (!state.has('c10.apacheta.done') || onPass);
  const lamp =
    here &&
    state.has('c10.apacheta.done') &&
    (!onPass || vistaOn || lit) &&
    (afterglow || !(state.has('story.end') && lampOver));
  // In over a few seconds (the clock is easing down at the same time); out
  // slowly, so the night after the book comes on like a night.
  const ease = (v: number, on: boolean) => v + ((on ? 1 : 0) - v) * (1 - Math.exp(-dt * (on ? 0.6 : 0.12)));
  endLight.gold = ease(endLight.gold, gold);
  endLight.lamp = ease(endLight.lamp, lamp);
  if (endLight.gold < 0.002) endLight.gold = 0;
  if (endLight.lamp < 0.002) endLight.lamp = 0;
  updateKitchens(dt);
}

/** How much of the frame the ending's light owns, 0..1. */
function endK(): number {
  return Math.min(1, endLight.gold + endLight.lamp);
}

/** The night level the world is lit by: the clock's, unless the ending holds it. */
function nightNow(): number {
  const nk = nightLevel(dayT);
  const k = endK();
  if (k <= 0) return nk;
  const want = (0.1 * endLight.gold + 0.6 * endLight.lamp) / k;
  return nk + (want - nk) * k;
}

/** The sun's hour for shadows: a low western sun through both evenings. */
function sunNow(): number {
  const k = endK();
  if (k <= 0) return dayT;
  const want = (0.575 * endLight.gold + 0.596 * endLight.lamp) / k;
  return dayT + (want - dayT) * k;
}

/** Blend an ambient color toward the ending's evening light. */
function endAmbient(c: number): number {
  const k = endK();
  if (k <= 0) return c;
  const g = endLight.gold / k;
  const ch = (i: number, sh: number) => {
    const want = GOLD_AMBIENT[i]! * g + LAMP_AMBIENT[i]! * (1 - g);
    return Math.round(((c >> sh) & 0xff) + (want - ((c >> sh) & 0xff)) * k);
  };
  return (ch(0, 16) << 16) | (ch(1, 8) << 8) | ch(2, 0);
}

/**
 * "Four kitchen windows go gold, one after another." The four windows
 * nearest the well stay dark through the walk down, and on that line of the
 * last page they wake in turn. Past the last page (or reloaded after it)
 * they are simply lit.
 */
let kitchenCells: [number, number][] | null = null;
let kitchenT = -1;
/** The last page's line that lights them; found by its words, not its index. */
const KITCHEN_LINE = Math.max(0, NODES['c10.lastpage']?.lines.findIndex((l) => /window/i.test(l.text)) ?? 2);
const KITCHEN_STEP = 0.75;

function kitchens(): [number, number][] {
  if (!kitchenCells) {
    const [wx, wy] = WELL_PX;
    kitchenCells = [...(houseWindows['village'] ?? [])]
      .sort((a, b) => Math.hypot(a[0] - wx, a[1] - wy) - Math.hypot(b[0] - wx, b[1] - wy))
      .slice(0, 4)
      // One after another, west to east, the way the eye reads them.
      .sort((a, b) => a[0] - b[0]);
  }
  return kitchenCells;
}

function updateKitchens(dt: number) {
  const node = textbox.currentNode;
  const past = state.has('story.end') || /^c10\.(lastline|end)\./.test(node);
  if (past) kitchenT = 99;
  else if (node === 'c10.lastpage' && textbox.currentLine >= KITCHEN_LINE) kitchenT = Math.max(0, kitchenT) + dt;
  else if (!state.has('c10.lamp')) kitchenT = -1;
}

/** 0..1: how lit a window on `mapId` is tonight; 1 for every window off the ending. */
function windowWake(mapId: string, wx: number, wy: number): number {
  if (mapId !== 'village' || !state.has('c10.apacheta.done') || kitchenT >= 99) return 1;
  const i = kitchens().findIndex(([x, y]) => x === wx && y === wy);
  if (i < 0) return vistaWake(wx, wy);
  if (kitchenT < 0) return 0;
  const t = Math.max(0, Math.min(1, (kitchenT - i * KITCHEN_STEP) / 0.5));
  return t * t * (3 - 2 * t);
}

/**
 * The last page's shot. It opens wide enough to hold the well, the people
 * around it and the two houses above (the windows have to be seen going
 * gold), and only once the line is written does it lean in, slowly, on its
 * own clock, toward the stone and the people by it.
 */
let leanT = 0;
let frameK = 0;
const LAMP_WIDE = 1.1;
/** Where the shot looks: the well, a little above it for the windows when wide. */
const LAMP_FOCUS_WIDE: [number, number] = [21 * TILE, 13.2 * TILE];
const LAMP_FOCUS_NEAR: [number, number] = [21 * TILE, 14.2 * TILE];

function updateLampShot(dt: number) {
  const on = lampT > 0 && map.id === 'village';
  frameK += ((on ? 1 : 0) - frameK) * (1 - Math.exp(-dt * (on ? 1.2 : 3)));
  if (frameK < 0.002) frameK = 0;
  // The lean waits for the windows, and a breath after them.
  leanT = on && kitchenT >= 99 ? Math.min(1, leanT + dt / LAMP.seconds) : on ? leanT : 0;
}

function leanEase(): number {
  return 1 - (1 - leanT) * (1 - leanT) * (1 - leanT);
}

/** The lean of the last page, or 0 when the camera is its own. */
function lampZoom(): number {
  if (lampT <= 0) return 0;
  if (map.id !== 'village') return 1.06 + (LAMP.zoom - 1.06) * (1 - (1 - lampT) ** 3);
  // Lean, but never so far that the people at the well leave the frame.
  return LAMP_WIDE + (Math.min(LAMP.zoom, 1.3) - LAMP_WIDE) * leanEase();
}

/** The camera's target for the last page, blended in from the player's own. */
function lampFocus(px: number, py: number): [number, number] {
  if (frameK <= 0) return [px, py];
  const k = leanEase();
  const fx = LAMP_FOCUS_WIDE[0] + (LAMP_FOCUS_NEAR[0] - LAMP_FOCUS_WIDE[0]) * k;
  const fy = LAMP_FOCUS_WIDE[1] + (LAMP_FOCUS_NEAR[1] - LAMP_FOCUS_WIDE[1]) * k;
  return [px + (fx - px) * frameK, py + (fy - py) * frameK];
}

// ---------------------------------------------------------------- the ending's other shots
//
// Three more composed frames: the ring at the well while the verdict is
// said; the cairn, the moment the stone is laid on it; and, as the line says
// the village lights its first lamps, the camera leaving the pass westward
// down the road, through a dip, into the village itself, still travelling
// west, while its lamps and windows come on one at a time ahead of it. Back
// on the pass for Carmen's last word, and the camera is the player's again.

let ringK = 0;
/** The ring's middle, held a little low so the box under it never hides a face. */
const RING_FOCUS: [number, number] = [21 * TILE, 16.1 * TILE];
let passK = 0;
/** The cairn's face, in road pixels (the camera centres a tile on its target). */
const CAIRN_FOCUS: [number, number] = [CAIRN_AT[0] * TILE, CAIRN_AT[1] * TILE - 12];
const VISTA_LINE = NODES['c10.apacheta.lay']?.lines.findIndex((l) => /first lamps/i.test(l.text)) ?? -1;
/**
 * The village from the pass: its own camera, drifting from the lower houses
 * (whose windows are the first to wake) up toward the well, where the four
 * kitchens nearest it are still dark, waiting for the page.
 */
const vcam = new Camera();
const VISTA_FROM: [number, number] = [30 * TILE, 23.4 * TILE];
const VISTA_TO: [number, number] = [21.5 * TILE, 14.4 * TILE];
const VISTA_DRIFT = 7;
/** Seconds into the pan west, when the dip starts to come down. */
const VISTA_DIP = 1.1;
let vistaT = -1; // seconds since the line began; -1 when not running
let vistaClock = 0; // seconds the village has been on screen
let vistaOn = false;
let vistaFade = 0;
let vistaFadeShown = false;

const smooth01 = (t: number) => {
  const k = Math.max(0, Math.min(1, t));
  return k * k * (3 - 2 * k);
};

function setVista(on: boolean) {
  vistaOn = on;
  vistaClock = 0;
  // A cut, under the dip: the light belongs to the place on screen at once.
  // Back on the pass the sun has gone the way the line said it went, so the
  // pass keeps the village's lamplit dusk rather than its gold.
  const after = !on && pastVista();
  endLight.gold = on || after ? 0 : 1;
  endLight.lamp = on || after ? 1 : 0;
  renderer.setFires((fireCells[on ? 'village' : map.id] ?? []).map(([fx, fy]) => [fx, fy]));
}

/** The lamps line has been read: from here the evening on the pass is lamplit. */
function pastVista(): boolean {
  return textbox.currentNode !== 'c10.apacheta.lay' || textbox.currentLine > VISTA_LINE;
}

/** The map and camera the frame is drawn from: the village during the vista. */
function shownMap(): TileMap {
  return vistaOn ? (maps['village'] ?? map) : map;
}
function shownCam(): Camera {
  return vistaOn ? vcam : camera;
}

/** 0..1: in the vista, lamps and windows come on one at a time, nearest the camera's start first. */
function vistaWake(x: number, y: number): number {
  if (!vistaOn) return 1;
  const far = Math.hypot(x - VISTA_FROM[0], y - VISTA_FROM[1]) / (18 * TILE);
  return smooth01((vistaClock - 0.6 - Math.min(1, far) * 3.6) / 0.5);
}

function updateShots(dt: number) {
  const node = textbox.currentNode;
  const line = textbox.currentLine;
  const toward = (v: number, on: boolean, rateIn: number, rateOut: number) => {
    const n = v + ((on ? 1 : 0) - v) * (1 - Math.exp(-dt * (on ? rateIn : rateOut)));
    return n < 0.002 ? 0 : n > 0.998 && on ? 1 : n;
  };
  ringK = toward(ringK, map.id === 'village' && textbox.isOpen && /^c10\.(verdict|her\.)/.test(node), 1.4, 1.2);
  const laying = map.id === 'east-road' && node === 'c10.apacheta.lay';
  passK = toward(passK, laying && line >= STONE_LINE, 1.1, 1.0);

  // The vista runs while its line is up, and lets go the moment it is not.
  const onLine = laying && line === VISTA_LINE;
  if (onLine && vistaT < 0) vistaT = 0;
  if (!onLine) vistaT = -1;
  let fadeWant = 0;
  if (vistaT >= 0) {
    vistaT += dt;
    if (!vistaOn) {
      fadeWant = vistaT > VISTA_DIP ? 1 : 0;
      if (vistaFade > 0.985) setVista(true);
    }
  } else if (vistaOn) {
    fadeWant = 1;
    if (vistaFade > 0.985) setVista(false);
  }
  if (vistaOn) {
    vistaClock += dt;
    // Slow at both ends: it lingers on the first windows, and arrives at the well.
    const k = smooth01(vistaClock / VISTA_DRIFT);
    const vm = shownMap();
    vcam.follow(
      VISTA_FROM[0] + (VISTA_TO[0] - VISTA_FROM[0]) * k,
      VISTA_FROM[1] + (VISTA_TO[1] - VISTA_FROM[1]) * k,
      vm.w,
      vm.h,
    );
  }
  vistaFade += (fadeWant - vistaFade) * (1 - Math.exp(-dt * 6.5));
  if (fadeWant === 1 && vistaFade > 0.99) vistaFade = 1;
  if (vistaFade > 0.002) {
    fadeEl.style.opacity = String(vistaFade);
    // The dip is the camera's, not the words': the line stays readable over it.
    textboxEl.style.zIndex = '1';
    vistaFadeShown = true;
  } else if (vistaFadeShown) {
    vistaFade = 0;
    fadeEl.style.opacity = '0';
    textboxEl.style.zIndex = '';
    vistaFadeShown = false;
  }
}

/** Where the ending points the camera, blended in from the player's own frame. */
function endFocus(px: number, py: number): [number, number] {
  let [x, y] = lampFocus(px, py);
  if (ringK > 0) {
    x += (RING_FOCUS[0] - x) * ringK;
    y += (RING_FOCUS[1] - y) * ringK;
  }
  if (passK > 0) {
    // On the line about the lamps the camera sets off down the road toward them.
    const pan = vistaT >= 0 && !vistaOn ? -5 * TILE * Math.min(1, vistaT / 1.3) ** 2 : 0;
    x += (CAIRN_FOCUS[0] + pan - x) * passK;
    y += (CAIRN_FOCUS[1] - y) * passK;
  }
  return [x, y];
}

/** How much of the frame the ending composes (the walk lookahead stands down by as much). */
function endFrameK(): number {
  return Math.max(frameK, ringK, passK);
}

/** The ending's zoom, or 0 when the camera is its own. */
function endZoom(): number {
  if (vistaOn) return 1.12;
  const lz = lampZoom();
  if (lz) return lz;
  if (passK > 0) return 1.06 + 0.4 * passK;
  if (ringK > 0) return 1.06 + 0.1 * ringK;
  return 0;
}

/**
 * The marigold path is walked: with Melitón's costal on your shoulder,
 * every new cell of the lane lets a handful go, and enough of the lane
 * sown finishes the job. Space on the lane does the same by hand.
 */
const PETAL_SOWN = new Set<string>();
/** The lane is fifteen cells, arch to street; a walk down it touches twelve.
 * The last bend (row 11 and below) finishes it once half is sown, so a walk
 * up from the street works as well as a walk down from the arch. */
const PETAL_ENOUGH = 12;
const PETAL_BEND_Y = 11;
function petalStep(x: number, y: number) {
  if (map.id !== 'oaxaca' || !state.has('c9.path.task') || state.has('c9.path.laid')) return;
  if (map.ground(x, y).t !== 'petalpath') return;
  const k = `${x},${y}`;
  if (!PETAL_SOWN.has(k)) {
    PETAL_SOWN.add(k);
    renderer.burst(x * TILE + TILE / 2, y * TILE + TILE / 2, 'petal', PETALS['oaxaca'] ?? ['#e8862f']);
    if (!state.has('c9.path.sown')) state.set('c9.path.sown');
  }
  const done = PETAL_SOWN.size >= PETAL_ENOUGH || (PETAL_SOWN.size >= PETAL_ENOUGH / 2 && y >= PETAL_BEND_Y);
  if (done && !textbox.isOpen) startNarration('c9.path.lay');
}

/**
 * The traveler's look: Nani's sketch, overlaid with whatever was chosen at
 * the flyleaf (persisted in the save), gilded if the older code is known.
 */
function currentPlayerLook() {
  const base = { ...PLAYER_LOOK, ...(state.playerLook ?? {}) };
  /** The golden traveler, for those who remember an older code. */
  return state.has('konami')
    ? { ...base, cloth: '#c8a55b', stripe: '#f2e6d0', hat: '#e8c97a' }
    : base;
}

const playerSprite: Sprite = {
  actor: player,
  sheet: makeSheet(currentPlayerLook()),
  rig: 'human',
};

function refreshPlayerSheet() {
  playerSprite.sheet = makeSheet(currentPlayerLook());
}

/** ↑↑↓↓←→←→ on the title screen. Some traditions cross all borders. */
const KONAMI: Dir[] = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];
let konamiAt = 0;
function feedKonami(d: Dir) {
  if (state.has('konami')) return;
  konamiAt = d === KONAMI[konamiAt] ? konamiAt + 1 : d === 'up' ? 1 : 0;
  if (konamiAt >= KONAMI.length) {
    state.set('konami');
    refreshPlayerSheet();
    audio.jingle();
    toasts.show('✦ 30 lives. (You will not need them here.)');
    toasts.show('your poncho remembers an older gold');
  }
}

// Promising mounds for the dig, drawn as sprites so they can appear and go.
const moundSheet = makeMoundSheet();
const mounds = DIG_SPOTS.map((spot) => ({
  spot,
  sprite: { actor: new Actor(spot.at[0], spot.at[1], 'down'), sheet: moundSheet, rig: 'animal' } as Sprite,
}));

function moundsHere(): Sprite[] {
  if (map.id !== 'village' || !state.has('dig.invite') || state.has('dig.done')) return [];
  return mounds.filter((m) => !state.has(m.spot.flag)).map((m) => m.sprite);
}

function villagersHere(): Villager[] {
  // A villager with a `when` is only in town while it holds (travelers,
  // homecomings). Everyone else simply lives here. The fully night-faded are
  // gone in every sense: undrawn, unclickable, and no longer in the way.
  return villagers.filter((v) => v.def.map === map.id && v.fade > 0.02 && state.check(v.def.when));
}
function spritesHere(): Sprite[] {
  return [playerSprite, ...villagersHere()];
}

function occupied(x: number, y: number, self: Actor): boolean {
  for (const s of spritesHere()) {
    if (s.actor === self) continue;
    // The dog never blocks anyone; it is small and agreeable.
    if (s === dog) continue;
    const [ox, oy] = s.actor.occupies();
    if (ox === x && oy === y) return true;
  }
  return false;
}

function blockedFor(self: Actor): (x: number, y: number) => boolean {
  return (x, y) => map.solid(x, y) || occupied(x, y, self);
}

/** The cells an actor's body is in: where it stands, or both ends of a step. */
function bodyCells(a: Actor): [number, number][] {
  const to = a.occupies();
  return a.isMoving && (a.x !== to[0] || a.y !== to[1]) ? [[a.x, a.y], to] : [to];
}

/**
 * The separation rule: is this cell held by any body but `self`, counting
 * both ends of anyone mid-step? Stepping into a cell its owner is still
 * stepping out of is how two figures came to draw on top of each other.
 * The dog is small and agreeable and never counts.
 */
function heldByOther(x: number, y: number, self: Actor): boolean {
  for (const s of spritesHere()) {
    if (s.actor === self || s === dog) continue;
    for (const [cx, cy] of bodyCells(s.actor)) if (cx === x && cy === y) return true;
  }
  return false;
}

/** The player's own cells, the one thing no walker may ever enter. */
function playerHolds(x: number, y: number): boolean {
  return bodyCells(player).some(([cx, cy]) => cx === x && cy === y);
}

/**
 * Where arrivals land on each map: its own spawn and the spawn of every door
 * that leads in. A wandering villager never loiters on one; Abuela Chela
 * used to amble onto the cocina doorstep and stand on the player coming out.
 */
const doorsteps: Record<string, Set<string>> = (() => {
  const out: Record<string, Set<string>> = {};
  const add = (id: string, x: number, y: number) => (out[id] ??= new Set()).add(`${x},${y}`);
  for (const [id, m] of Object.entries(REGION_MAPS)) {
    add(id, m.spawn[0], m.spawn[1]);
    for (const t of m.triggers ?? []) if (t.type === 'door') add(t.to, t.spawn[0], t.spawn[1]);
  }
  return out;
})();
const onDoorstep = (x: number, y: number) => doorsteps[map.id]?.has(`${x},${y}`) ?? false;

/**
 * Nobody shares a tile. A villager who finds itself standing on the player
 * or on another villager (a traveler who appeared on a spot someone had
 * wandered into, a reload that stood the player on Sun-hee) steps to the
 * nearest free cell. Rare, and a one-tile hop beats two bodies in one place.
 */
function unstack() {
  // The player claims first, then anyone frozen in a conversation or
  // mid-step: whoever is standing idle on a taken cell is the one who hops.
  // (Walking the list in draw order once let a villager claim the cell and
  // the player, coming later, be skipped, so nobody moved at all.)
  const rank = (s: Sprite) => (s === playerSprite ? 0 : s.actor.frozen || s.actor.isMoving ? 1 : 2);
  const here = [...spritesHere()].sort((a, b) => rank(a) - rank(b));
  const taken = new Set<string>();
  for (const s of here) {
    if (s === dog) continue;
    const [x, y] = s.actor.occupies();
    const key = `${x},${y}`;
    if (!taken.has(key) || s === playerSprite || s.actor.frozen || s.actor.isMoving) {
      taken.add(key);
      continue;
    }
    const free = nearestFree(x, y, (cx, cy) => taken.has(`${cx},${cy}`) || onDoorstep(cx, cy));
    if (free) {
      s.actor.placeAt(free[0], free[1], s.actor.dir);
      taken.add(`${free[0]},${free[1]}`);
    }
  }
}

/** Breadth-first from (x, y) for the nearest standable cell within 4 steps. */
function nearestFree(x: number, y: number, avoid: (x: number, y: number) => boolean): [number, number] | null {
  const seen = new Set<string>([`${x},${y}`]);
  let ring: [number, number][] = [[x, y]];
  for (let d = 0; d < 4; d++) {
    const next: [number, number][] = [];
    for (const [cx, cy] of ring) {
      for (const [dx, dy] of [[0, 1], [-1, 0], [1, 0], [0, -1]] as const) {
        const nx = cx + dx;
        const ny = cy + dy;
        const k = `${nx},${ny}`;
        if (seen.has(k) || !map.inBounds(nx, ny) || map.solid(nx, ny)) continue;
        seen.add(k);
        if (!avoid(nx, ny)) return [nx, ny];
        next.push([nx, ny]);
      }
    }
    ring = next;
  }
  return null;
}

// ---------------------------------------------------------------- personal space
//
// A body is two tiles tall: it stands on its cell and its head fills the cell
// above. Two people one directly above the other therefore draw as one pile,
// the lower one's head over the upper one's chest, even on separate cells
// (Aurelio at the well, Sun-hee at her stall, the fishers at the Caleta
// stalls). So the rule is wider than "one body per cell": a body's footprint
// is its cell and the cell above, and footprints may not meet. Wanderers keep
// it on their own feet (they never step in directly above or below anybody);
// a conversation keeps it by settling the two speakers side by side
// (settleForTalk). The dog is knee-high and exempt, as everywhere.

/** Would a body standing on (x, y) stand directly above or below another? */
function crowdsSomeone(x: number, y: number, self: Actor): boolean {
  return heldByOther(x, y - 1, self) || heldByOther(x, y + 1, self);
}

/** Can a body settle on (x, y) at all: open floor, not a doorway or an
 * arrival cell, and nothing painted over the figure (see stand.ts). */
function cleanStand(x: number, y: number): boolean {
  if (!map.inBounds(x, y) || map.solid(x, y) || map.triggerAt(x, y) || onDoorstep(x, y)) return false;
  return !renderer.coversBody(map, x, y);
}

/**
 * Scripted steps still to take, per actor, for a talk's settling: walked one
 * at a time as each lands (see landHeldSteps), then a turn to face.
 */
const settleSteps = new Map<Actor, { steps: Dir[]; face: Dir }>();

/** Is a settle still walking someone into place? The player waits for it. */
function settling(): boolean {
  return settleSteps.size > 0;
}

/**
 * Two people about to talk one above the other draw as one pile, so they
 * settle side by side on one row first, orthogonally adjacent and facing
 * (stand.ts planSettle has the options and their order). Every cell anyone
 * is walked onto is clean. The villager moves only when free to; a seated,
 * stationed or staged one holds their place and the player goes round. A
 * villager posted to one spot (range 0: a stall, a doorway) steps back to it
 * after the talk. With nowhere clean to go they lean apart a little instead.
 */
function settleForTalk(v: Villager) {
  if (v === dog) return;
  const npcMay =
    !v.actor.isMoving && !v.seated && v.actor.pose !== 'sit' && !stagedControls(v) && !stationControls(v);
  const plan = planSettle(
    {
      passable: (x, y) => map.inBounds(x, y) && !map.solid(x, y) && !map.triggerAt(x, y),
      clean: cleanStand,
      held: (x, y) =>
        spritesHere().some(
          (o) => o !== dog && o.actor !== player && o.actor !== v.actor && bodyCells(o.actor).some(([cx, cy]) => cx === x && cy === y),
        ),
    },
    player.occupies(),
    v.actor.occupies(),
    npcMay && !player.isMoving,
  );
  if (plan.kind === 'none') return;
  if (plan.kind === 'lean') {
    const [, py] = player.occupies();
    const [, ny] = v.actor.occupies();
    const lower = py > ny ? player : v.actor;
    const upper = lower === player ? v.actor : player;
    lower.nudge = [-TALK_LEAN, 2];
    upper.nudge = [TALK_LEAN, 0];
    return;
  }
  for (const m of plan.moves) {
    const a = m.who === 'player' ? player : v.actor;
    settleSteps.set(a, { steps: [...m.steps], face: m.who === 'player' ? plan.playerFace : plan.npcFace });
    if (m.who === 'npc' && v.def.range === 0) {
      const [hx, hy] = v.actor.occupies();
      v.postBack = { at: [hx, hy], dir: v.def.sits ?? 'down' };
    }
  }
  // Whoever is not walked anywhere turns to face as the other arrives.
  if (!settleSteps.has(player)) player.face(plan.playerFace);
  if (!settleSteps.has(v.actor)) v.actor.face(plan.npcFace);
  landHeldSteps(0);
}
/** How far, in logical pixels, each of two cornered speakers leans apart. */
const TALK_LEAN = 6;

/**
 * Finish any step still in the air while the world is held for a
 * conversation (anyone caught mid-stride when the talk began used to hang
 * between two cells for the whole of it), and walk a talk's settling steps,
 * one as each lands. Nothing else starts.
 */
function landHeldSteps(dt: number) {
  for (const s of spritesHere()) {
    if (s.actor.isMoving) s.actor.update(dt, { intent: null, blocked: () => true });
  }
  for (const [a, plan] of settleSteps) {
    if (a.isMoving) continue;
    const next = plan.steps.shift();
    if (!next) {
      a.face(plan.face);
      settleSteps.delete(a);
      continue;
    }
    // The cell was clean when the plan was made; if a walker has since
    // stepped into it, stop here rather than walk into them.
    const [tx, ty] = stepFrom(...a.occupies(), next);
    if (heldByOther(tx, ty, a) || map.solid(tx, ty)) {
      // Into the place the other speaker is leaving: wait for them to land.
      const partner = [...settleSteps.keys()].find((o) => o !== a);
      if (partner && bodyCells(partner).some(([cx, cy]) => cx === tx && cy === ty)) {
        plan.steps.unshift(next);
        continue;
      }
      a.face(plan.face);
      settleSteps.delete(a);
      continue;
    }
    a.stepTo(next, plan.steps.length === 0 ? plan.face : undefined);
  }
}

// ---------------------------------------------------------------- giving way
//
// People step off the player's path rather than stand in it: a companion
// who has ended up ahead of you on a road, a villager parked on the red
// thread, anyone you keep walking into. They step sideways to where you are
// going, never along it, so nobody mirrors your sidestep across the road.

/** Which way the player's feet are going this frame, or null at rest. */
let walkHeading: Dir | null = null;
/** The cell the player has been pushing into, and how many knocks running. */
let pushCell: [number, number] | null = null;
let pushKnocks = 0;
let pushAt = 0;
/** Bodies mid-way through a step out of the player's way. */
const yielding = new Set<Actor>();

/**
 * Does (x, y) lie on the player's way for `v`: the next cells of a click
 * walk that is not to them, the red thread laid past them (not to them),
 * or the cell the player keeps walking into with the keys?
 */
function inPlayersWay(v: Villager, x: number, y: number): boolean {
  if (autoGoal && autoGoal.npc !== v && autoPath.slice(0, 4).some(([ax, ay]) => ax === x && ay === y)) return true;
  if (renderer.threadOut && threadLast && threadAim !== v && map.id === threadAimMap) {
    const tiles = threadLast.tiles;
    const [px, py] = player.occupies();
    let from = tiles.findIndex(([tx, ty]) => tx === px && ty === py);
    if (from < 0) from = 0;
    for (let i = from + 1; i < Math.min(tiles.length - 1, from + 9); i++) {
      if (tiles[i]![0] === x && tiles[i]![1] === y) return true;
    }
  }
  return !!pushCell && pushCell[0] === x && pushCell[1] === y && pushKnocks >= 3 && performance.now() - pushAt < 500;
}

/** One sideways step out of the player's way, if they are in it and there is room. */
function giveWay(v: Villager): boolean {
  if (v === dog || v.seated || v.actor.pose === 'sit' || v.actor.isMoving || v === talkingTo) return false;
  const [cx, cy] = v.actor.occupies();
  if (!inPlayersWay(v, cx, cy)) return false;
  const d = yieldStep(v.actor, (x, y) => inPlayersWay(v, x, y));
  if (!d) return false;
  // A posted villager comes back to their post once the way is clear.
  if (v.def.range === 0 && !v.postBack) v.postBack = { at: [cx, cy], dir: v.def.sits ?? v.actor.dir };
  v.actor.stepTo(d, towardPlayer(stepFrom(cx, cy, d)));
  yielding.add(v.actor);
  pushKnocks = 0;
  return true;
}

/**
 * The step that takes a body out of the player's way: off the way itself
 * and out of the lane ahead, across the player's heading first and the
 * side away from them first, onto open floor nobody holds or stands a row
 * off from, not a doorway and not under a prop's paint.
 */
function yieldStep(a: Actor, onWay: (x: number, y: number) => boolean): Dir | null {
  const [cx, cy] = a.occupies();
  const [px, py] = player.occupies();
  const heading = walkHeading ?? player.dir;
  const across = (d: Dir) => ((heading === 'up' || heading === 'down') === (d === 'left' || d === 'right') ? 0 : 1);
  const away = (d: Dir) => {
    const [x, y] = stepFrom(cx, cy, d);
    return Math.abs(x - px) + Math.abs(y - py);
  };
  const dirs: Dir[] = ['left', 'right', 'up', 'down'];
  dirs.sort((p, q) => across(p) - across(q) || away(q) - away(p));
  for (const d of dirs) {
    const [x, y] = stepFrom(cx, cy, d);
    if (onWay(x, y) || aheadOfPlayer([x, y]) === 'lane') continue;
    if (heldByOther(x, y, a) || crowdsSomeone(x, y, a) || playerHolds(x, y)) continue;
    if (!cleanStand(x, y)) continue;
    return d;
  }
  return null;
}

/**
 * Where a cell lies against the way the player is walking: 'lane' when it
 * is straight ahead within three steps, 'beside' when it is a row off that
 * lane, null when behind, far, or the player is standing still.
 */
function aheadOfPlayer([x, y]: [number, number]): 'lane' | 'beside' | null {
  if (!walkHeading) return null;
  const [px, py] = player.occupies();
  const [hx, hy] = DIR_VEC[walkHeading];
  const along = (x - px) * hx + (y - py) * hy;
  const perp = Math.abs((x - px) * hy - (y - py) * hx);
  if (along < 1 || along > 3) return null;
  return perp === 0 ? 'lane' : perp === 1 ? 'beside' : null;
}

/** Which way someone on (x, y) turns to look at the player. */
function towardPlayer([x, y]: [number, number]): Dir {
  const [px, py] = player.occupies();
  const dx = px - x;
  const dy = py - y;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
}

/**
 * Is the player walking up to this villager with the keys? Within three
 * steps, facing them, and on their row or column give or take one: the way
 * a person heading for you looks. They wait for you then, as the click-to-walk
 * path already made them do; Petro took five tries and Mang Ben drifted off
 * mid-approach while they ambled on regardless.
 */
function approachedByKeys(v: Villager): boolean {
  const [ax, ay] = v.actor.occupies();
  const [px, py] = player.occupies();
  const dx = ax - px;
  const dy = ay - py;
  const d = Math.abs(dx) + Math.abs(dy);
  if (d === 0 || d > 3) return false;
  const [fx, fy] = DIR_VEC[player.dir];
  const ahead = fx * dx + fy * dy;
  const aside = Math.abs(fx !== 0 ? dy : dx);
  return ahead > 0 && aside <= 1;
}

function updateVillager(v: Villager, dt: number) {
  if (v.actor.frozen) return;

  // The dog, once befriended, has one job: be nearby.
  if (v === dog && state.has('allqu.friend')) {
    const dx = player.x - v.actor.x;
    const dy = player.y - v.actor.y;
    const dist = Math.abs(dx) + Math.abs(dy);
    let intent: Dir | null = null;
    if (dist > 1) {
      intent =
        Math.abs(dx) >= Math.abs(dy)
          ? dx > 0
            ? 'right'
            : 'left'
          : dy > 0
            ? 'down'
            : 'up';
    }
    const [px, py] = player.occupies();
    v.actor.update(dt, {
      intent,
      blocked: (x, y) => map.solid(x, y) || (x === px && y === py),
    });
    return;
  }

  // A stationed villager is walked by the custom's own code, not the leash.
  if (stagedControls(v) || stationControls(v)) return;

  // Stepped aside (to talk, or out of the player's way) from a post: back
  // to it once the cell is clear, on their own feet.
  if (v.postBack) {
    const [hx, hy] = v.postBack.at;
    const [ax, ay] = v.actor.occupies();
    if (v.actor.isMoving) {
      v.actor.update(dt, { intent: null, blocked: () => true });
      return;
    }
    if (ax === hx && ay === hy) {
      v.actor.face(v.postBack.dir);
      v.postBack = null;
      return;
    }
    if (Math.abs(ax - hx) + Math.abs(ay - hy) > 4) {
      v.postBack = null; // moved on by something else (a door, the staging)
      return;
    }
    // Not while that would stand them over (or under) somebody (the player
    // is usually still right there, a row off, and stepping back would only
    // rebuild the pile the settle took apart), nor back into the way.
    if (heldByOther(hx, hy, v.actor) || crowdsSomeone(hx, hy, v.actor) || inPlayersWay(v, hx, hy)) return;
    const path = pathBetween([ax, ay], hx, hy, blockedFor(v.actor));
    const next = path?.[0];
    if (next && !heldByOther(next[0], next[1], v.actor)) {
      const d: Dir = next[0] > ax ? 'right' : next[0] < ax ? 'left' : next[1] > ay ? 'down' : 'up';
      v.actor.stepTo(d, path!.length === 1 ? v.postBack.dir : undefined);
    }
    return;
  }

  // In the player's way: step off it, sideways to where they are going.
  if (yielding.has(v.actor)) {
    if (v.actor.isMoving) {
      v.actor.update(dt, { intent: null, blocked: () => true });
      return;
    }
    yielding.delete(v.actor);
  }
  if (giveWay(v)) return;

  if (v.def.range === 0 || dev.freezeWander) return;
  const nk = sceneFor(map.id) === 'interior' ? 0 : nightLevel(dayT);
  const blocked = blockedFor(v.actor);

  // Golden hour: those with a claimed seat amble over, settle, and stay
  // until night deepens or morning. They talk seated; dialogue freezes them.
  if (v.seat && nk >= sitAt(v) && nk < fadeAt(v)) {
    const [tx, ty] = v.seat.at;
    const [cx, cy] = v.actor.occupies();
    if (v.seated) return;
    if (cx === tx && cy === ty) {
      if (v.actor.isMoving) {
        v.actor.update(dt, { intent: null, blocked });
        return;
      }
      v.actor.face(v.seat.dir);
      v.actor.pose = 'sit';
      v.seated = true;
      return;
    }
    v.actor.update(dt, { intent: stepToward(v.actor, tx, ty, blocked), blocked });
    return;
  }
  if (v.seated) {
    v.actor.pose = 'none';
    v.seated = false;
  }

  // Deep night, for those about to fade: stand still and say goodnight.
  if (!v.keeper && nk > fadeAt(v)) return;

  // Night owls re-center their leash on the nearest lamp, so whoever stays
  // up stands in the light; by day the leash is home, as it always was.
  const gathering = nk > sitAt(v) && v.glow !== null;
  const [hx, hy] = gathering && v.glow ? v.glow : v.def.pos;
  const r = gathering ? Math.max(v.def.range, 2) : v.def.range;
  const [ax, ay] = v.actor.occupies();
  const outside = ax < hx - r || ax > hx + r || ay < hy - r || ay > hy + r;
  // Deep evening: the wandering stops. People stand where the hour has led
  // them (lamplight, mostly), finishing conversations as the village settles.
  if (nk > 0.6 && !outside) return;
  // Someone the player has clicked on and is walking toward finishes the
  // step they are on and waits there, the way a person does when hailed.
  // So does the person the red thread was just laid to, so its end still
  // finds them beside it (Mr. Gong drifted to the diagonal, by a crate).
  const threadHeld = v === threadAim && performance.now() - threadShownAt < THREAD_HOLD_MS;
  // And so does the person the open task is about, while the player is in
  // sight of them: Rosa is ladling soup, not touring the square, and a click
  // aimed at her used to land on the grass she had just left.
  const [lx, ly] = player.occupies();
  const taskHeld = v.def.id === taskLead() && Math.abs(ax - lx) <= 10 && Math.abs(ay - ly) <= 7;
  if ((autoGoal?.npc === v || approachedByKeys(v) || threadHeld || taskHeld) && !outside) {
    v.actor.update(dt, { intent: null, blocked });
    return;
  }
  v.think -= dt;
  if (v.think <= 0) {
    // Outside the leash (walking to the lamp, or home at dawn): head for the
    // center. Inside: mostly stand around, occasionally amble. Village time.
    v.want = outside
      ? stepToward(v.actor, hx, hy, blocked)
      : Math.random() < 0.4
        ? ((['up', 'down', 'left', 'right'] as Dir[])[Math.floor(Math.random() * 4)] ?? null)
        : null;
    v.think = 1.0 + Math.random() * 2.8;
  }
  // An amble never ends behind a tall prop's head (a lamp, a crane, a
  // canopy): from up here that cell paints the prop over the face.
  const over = renderer.overhung(map);
  const leash = (x: number, y: number) =>
    x < hx - r || x > hx + r || y < hy - r || y > hy + r || onDoorstep(x, y) || over[y * map.w + x] === 1 ||
    crowdsSomeone(x, y, v.actor);
  // Standing in somebody's column, a row off (the player stopped just above
  // or below, or two ambles met): the free one makes room, sideways first.
  const [cx, cy] = v.actor.occupies();
  if (!outside && !v.actor.isMoving && crowdsSomeone(cx, cy, v.actor)) {
    const room = (['left', 'right', 'up', 'down'] as Dir[]).find((d) => {
      const [sx, sy] = stepFrom(cx, cy, d);
      return !blocked(sx, sy) && !leash(sx, sy);
    });
    if (room) {
      v.want = room;
      v.think = 0.35; // one step, then village time again
    }
  }
  v.actor.update(dt, { intent: v.want, blocked: outside ? blocked : (x, y) => blocked(x, y) || leash(x, y) });
}

// ---------------------------------------------------------------- doors
//
// Two transitions. Doors within a region iris: the classic circle wipe,
// closing on where you were and opening on where you are. Crossing INTO a
// new region is a journey: fade out, hold on a quiet card with the place's
// name and how you got there (in Nani's route words), then arrive. The road
// between chapters should feel like distance, not like a cut.

const IRIS_DUR = 0.3;
const JOURNEY_OUT = 0.5;
const JOURNEY_HOLD = 2.6;
const JOURNEY_IN = 0.7;

/** The Route stop that describes arriving at a given map, for journey cards. */
const STOP_BY_MAP: Record<string, string> = {
  'la-caleta': 'la-caleta', ship: 'crossing', shionoura: 'shionoura', busan: 'busan',
  kerala: 'kerala', delhi: 'delhi', zanzibar: 'zanzibar', sicily: 'sicily', oaxaca: 'oaxaca',
};

type Warp = {
  t: number;
  phase: 'out' | 'hold' | 'in';
  to: TriggerDef & { type: 'door' };
  style: 'iris' | 'journey';
};
let warp: Warp | null = null;

const irisEl = $('iris');
const journeyEl = $('journeycard');

/** Radius (vmax units) that fully clears the screen for the iris hole. */
const IRIS_MAX = 75;

function setIris(k: number) {
  // k = 1 fully open (invisible), k = 0 fully closed (black).
  if (k >= 1) {
    irisEl.style.display = 'none';
    return;
  }
  irisEl.style.display = 'block';
  irisEl.style.boxShadow = `0 0 0 200vmax #17120e`;
  irisEl.style.width = `${IRIS_MAX * 2 * k}vmax`;
  irisEl.style.height = `${IRIS_MAX * 2 * k}vmax`;
}

function startWarp(trig: TriggerDef & { type: 'door' }) {
  if (warp) return;
  const style = regionFor(map.id) !== regionFor(trig.to) ? 'journey' : 'iris';
  warp = { t: 0, phase: 'out', to: trig, style };
  player.frozen = true;
  audio.door();
  if (style === 'journey') {
    const stop = ROUTE.find((s) => s.id === STOP_BY_MAP[trig.to]);
    const dest = REGION_MAPS[trig.to];
    journeyEl.innerHTML = `
      <div>
        <div class="jc-stamp"><div class="jc-name">${dest?.name ?? stop?.name ?? ''}</div></div>
        <div class="jc-hop">${stop?.hop ?? 'onward'}</div>
      </div>`;
  }
}

/** The last door led back onto the map it left: a dark that was time passing. */
let timePassed = false;

/** The map swap at the dark middle of any transition. */
function arriveAt(trig: TriggerDef & { type: 'door' }) {
  const dest = maps[trig.to];
  if (!dest) return;
  // A door onto the map you are already on is time passing, not a new place.
  const samePlace = dest === map;
  timePassed = samePlace;
  map = dest;
  settleSteps.clear();
  player.placeAt(trig.spawn[0], trig.spawn[1], trig.facing ?? 'down');
  // The vigil is a night. Its page says "tonight the camposanto is lit", and
  // walking through the marigold arch at noon once opened it in full sun:
  // the arch is where the evening comes down, whatever hour you left at.
  if (
    dest.id === 'camposanto' &&
    state.has('c9.ofrenda.done') &&
    !state.has('c9.vigil.done') &&
    nightLevel(dayT) < 0.5 &&
    !Number.isFinite(todOverride)
  ) {
    dayT = 0.7;
  }
  // Zanzibar's goodbye is written at first light: "Every door on the lane is
  // shut." The night in the room above Ali's counter ends at dawn, whatever
  // hour you went up.
  if (
    dest.id === 'zanzibar' &&
    state.has('c7.dawn') &&
    !state.has('c7.complete') &&
    !Number.isFinite(todOverride)
  ) {
    dayT = 0.03;
  }
  // A befriended dog refuses to be door-blocked; it simply arrives too.
  if (dog && state.has('allqu.friend')) {
    dog.def.map = map.id;
    const spots: [number, number][] = [
      [player.x, player.y + 1],
      [player.x - 1, player.y],
      [player.x + 1, player.y],
      [player.x, player.y - 1],
    ];
    const free = spots.find(([x, y]) => !map.solid(x, y));
    if (free) dog.actor.placeAt(free[0], free[1], player.dir);
  }
  // Whoever a scene wants here is already on their mark.
  settleInDark();
  camera.resetLead();
  // The thread stays on the floor it was laid on; a door winds it back in.
  renderer.clearThread();
  const [px, py] = player.renderPos();
  camera.follow(px, py, map.w, map.h);
  state.place = { map: map.id, x: player.x, y: player.y, dir: player.dir };
  state.save();
  // New ground can retire a whole chapter's threads (openTasks scopes by
  // map), and nothing else would tell the chip until the next flag.
  refreshTaskChip();
  if (!samePlace) showPlate(map.name, 2600);
  audio.setScene(sceneFor(map.id));
  audio.setRegion(regionFor(map.id));
  renderer.setMood(moodFor(map.id));
  renderer.setRaining(rainingOn(map.id));
  renderer.setFires((fireCells[map.id] ?? []).map(([fx, fy]) => [fx, fy]));
  stage.setAmbient(AMBIENT[moodFor(map.id)] ?? 0xfdf6ea);
}

/**
 * The hour each arrival narration was written in, as dayT. Chapters arrive at
 * whatever time the clock happens to hold, but their first words are staged:
 * Shionoura's cicadas are a noon sound, Busan wakes to gulls at dawn. Applied
 * exactly once, when the arrival narration fires, so the first minute on a
 * new coast matches the text; the clock runs normally from there. Hours read
 * off each arrive node's own imagery:
 *   la-caleta  the garúa "sits on the village like a lid": grey morning
 *              (also the Return's docking, out of the same garúa)
 *   ship       garlic frying below decks, full working daylight
 *   shionoura  "the heat is a wet towel", a wall of cicadas: noon
 *   busan      "dawn the color of oyster shell", last night's lights still on
 *   kerala     green daylight with the monsoon stacking dark clouds
 *   delhi      a chowk in full swing under a golden dome: afternoon
 *   zanzibar   the tide out, the sea floor "drying in the sun": midday
 *   sicily     "a bell counts eleven" and the heat is already on
 *   oaxaca     cohetes, copal, woodsmoke over the valley: golden hour
 */
const ARRIVAL_HOUR: Record<string, number> = {
  'la-caleta': 0.2,
  ship: 0.3,
  shionoura: 0.35,
  busan: 0.05,
  kerala: 0.4,
  delhi: 0.45,
  zanzibar: 0.38,
  sicily: 0.3,
  oaxaca: 0.55,
};

function endWarp() {
  warp = null;
  player.frozen = false;
  fadeEl.style.opacity = '0';
  journeyEl.classList.remove('show');
  setIris(1);
  // First footfall in a new chapter gets its narration, at its written hour.
  const arr = ARRIVALS.find((a) => a.map === map.id && !state.has(a.flag) && state.check(a.when));
  if (arr && !textbox.isOpen) {
    const hour = ARRIVAL_HOUR[map.id];
    if (hour !== undefined && !Number.isFinite(todOverride)) dayT = hour;
    startNarration(arr.node);
    return;
  }
  // Or the scene a dark was let fall for: it plays as the light comes up.
  // Only after time passing in place; a door from somewhere else could land
  // you across the map from where the scene is standing.
  const cue = timePassed ? CUES.find((c) => c.map === map.id && state.check(c.when)) : undefined;
  if (cue && !textbox.isOpen) startNarration(cue.node);
}

function updateWarp(dt: number) {
  if (!warp) return;
  warp.t += dt;

  if (warp.style === 'iris') {
    if (warp.phase === 'out') {
      setIris(Math.max(0, 1 - warp.t / IRIS_DUR));
      if (warp.t >= IRIS_DUR) {
        arriveAt(warp.to);
        warp = { ...warp, t: 0, phase: 'in' };
      }
    } else {
      setIris(Math.min(1, warp.t / IRIS_DUR));
      if (warp.t >= IRIS_DUR) endWarp();
    }
    return;
  }

  // The journey: out, a held breath with the card, in.
  if (warp.phase === 'out') {
    fadeEl.style.opacity = String(Math.min(1, warp.t / JOURNEY_OUT));
    if (warp.t >= JOURNEY_OUT) {
      arriveAt(warp.to);
      journeyEl.classList.add('show');
      warp = { ...warp, t: 0, phase: 'hold' };
    }
  } else if (warp.phase === 'hold') {
    fadeEl.style.opacity = '1';
    if (warp.t >= JOURNEY_HOLD) {
      journeyEl.classList.remove('show');
      warp = { ...warp, t: 0, phase: 'in' };
    }
  } else {
    fadeEl.style.opacity = String(Math.max(0, 1 - warp.t / JOURNEY_IN));
    if (warp.t >= JOURNEY_IN) endWarp();
  }
}

// ---------------------------------------------------------------- interaction

const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

let talkingTo: Villager | null = null;
let celebrated = state.has('story.complete');
const celebratedFlags = new Set(COMPLETIONS.filter((c) => state.has(c.flag)).map((c) => c.flag));

/**
 * The guards above keep a loaded journal from re-firing plates and the
 * chapter-close spread. They are read from whichever journal was on the
 * table at boot, so whenever the journal under us changes (another slot
 * chosen on the shelf, or Begin again wiping the flags), they resync here;
 * stale guards re-celebrated finished chapters one way and swallowed fresh
 * ones the other.
 */
function resyncCelebrations() {
  window.clearTimeout(ceremonyTimer);
  chapterClose.close();
  celebrated = state.has('story.complete');
  celebratedFlags.clear();
  for (const c of COMPLETIONS) if (state.has(c.flag)) celebratedFlags.add(c.flag);
}

/** A journey taken from inside a conversation; the warp runs when it ends. */
let pendingTravel: { map: string; x: number; y: number; dir: string } | null = null;
state.on('travel', (d) => {
  pendingTravel = d;
});
function takeTravel(): boolean {
  if (!pendingTravel) return false;
  const d = pendingTravel;
  pendingTravel = null;
  const dest = maps[d.map];
  if (!dest) {
    console.warn(`travel to unknown map: ${d.map}`);
    return false;
  }
  // Every card still armed stays behind where it was armed: none follows the
  // player into the next village. A replay offer simply ends.
  for (const f of armed.leaveBehind((x) => state.has(x), panelOpen, hereSpot(null))) {
    if (state.has('replay.mode')) {
      state.clearFlag('replay.mode');
      state.clearFlag(f);
    }
  }
  const spawn: [number, number] = d.x >= 0 && d.y >= 0 ? [d.x, d.y] : dest.spawn;
  const facing = (d.dir || dest.spawnFacing) as Dir;
  startWarp({ at: [player.x, player.y], type: 'door', to: d.map, spawn, facing });
  return true;
}
/** Session pet counter for the dog. Resets on reload; affection does not. */
let pets = 0;
/** Sloshes taken while carrying Teófilo's caporal. */
let sloshes = 0;
/** White camera-flash timer, in seconds remaining. */
let flashT = 0;
/** Either reduced-motion signal: the in-game calm toggle or the OS setting. */
const calmFlash = () =>
  document.body.classList.contains('reduce-motion') ||
  (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

/**
 * The hush after a conversation closes. Players hammer Space (or tap) through
 * the last lines, and the press after the last one used to land in the open
 * world: re-reading the well you were facing, over and over, or on a phone
 * walking you off toward wherever the extra tap fell. For a moment after the
 * words close, presses and world taps are swallowed, and each swallowed one
 * renews the moment, so a burst never leaks through; a deliberate press after
 * a breath still acts.
 */
const TALK_HUSH_MS = 550;
let talkHushUntil = 0;
function afterTalkHush(): boolean {
  const now = performance.now();
  if (now >= talkHushUntil) return false;
  talkHushUntil = now + TALK_HUSH_MS;
  return true;
}

/**
 * The hush grows with the hand. A fixed 550ms was shorter than a steady
 * key-hammer (one press every ~600ms), so each press past the last line
 * landed in the world and re-read the well, which closed, and the next press
 * read it again, forever. While Space was coming at a cadence, the hush after
 * the words close is half again that cadence (capped), and every swallowed
 * press renews it; a press after a real breath still acts, and so does one
 * aimed somewhere new: a step or a turn since the words closed is intent.
 */
let lastActAt = -Infinity;
let actGap = Infinity;
let spamHushUntil = 0;
let spamHushAim = '';
function noteAct(now: number) {
  actGap = now - lastActAt < 1500 ? now - lastActAt : Infinity;
  lastActAt = now;
}
const spamHushMs = () => Math.min(1400, actGap * 1.6);
function spamHush(): boolean {
  const now = performance.now();
  if (now >= spamHushUntil) return false;
  if (player.facingCell().join(',') !== spamHushAim) {
    spamHushUntil = 0;
    return false;
  }
  spamHushUntil = now + spamHushMs();
  return true;
}

/**
 * Where the textbox stood when the last talk closed, and until when a tap
 * there still counts as tapping the words rather than the world. Each tap
 * swallowed there renews it, so a tapping rhythm never leaks into a walk;
 * a deliberate tap after a quiet moment walks as always.
 */
const TEXTBOX_TAP_GRACE_MS = 2000;
let textboxWas: DOMRect | null = null;
let textboxWasUntil = 0;
function onTextboxThatWas(x: number, y: number): boolean {
  const r = textboxWas;
  const now = performance.now();
  if (!r || now >= textboxWasUntil) return false;
  const pad = 16;
  if (x < r.left - pad || x > r.right + pad || y < r.top - pad || y > r.bottom + pad) return false;
  textboxWasUntil = now + TEXTBOX_TAP_GRACE_MS;
  return true;
}

function endDialogue() {
  player.frozen = false;
  talkHushUntil = performance.now() + TALK_HUSH_MS;
  if (Number.isFinite(actGap)) {
    spamHushUntil = performance.now() + spamHushMs();
    spamHushAim = player.facingCell().join(',');
  }
  // Where the words were: taps keep landing there for a while after.
  const tbr = document.getElementById('textbox')?.getBoundingClientRect();
  if (tbr && tbr.height > 0) textboxWas = tbr;
  textboxWasUntil = performance.now() + TEXTBOX_TAP_GRACE_MS;
  // Whoever just finished speaking, for the ask-a-villager thread below.
  const speaker = talkingTo;
  howtoOfferedBy = speaker?.def.id ?? null;
  // The intro has let go; now the village may introduce itself.
  if (pendingWelcome && !welcomeTimer) welcomeTimer = window.setTimeout(playWelcome, 420);
  player.nudge = [0, 0];
  if (talkingTo) {
    talkingTo.actor.nudge = [0, 0];
    talkingTo.actor.frozen = false;
    // A seated villager turned to face the player; they settle back afterward
    // (a stationed sitter faces their row, a bench sitter faces their bench).
    if (talkingTo.seated) {
      const dir = stationSeatDir(talkingTo) ?? talkingTo.seat?.dir;
      if (dir) talkingTo.actor.face(dir);
    }
  }
  talkingTo = null;

  // A villager offered to show the way: the same red thread, from their
  // feet, once their words have closed. Mirrors how pendingLetter works.
  if (pendingThread) {
    pendingThread = false;
    if (speaker) threadFromNpc(speaker);
    else summonThread();
  }

  // Mail handed over during the conversation unfolds now.
  if (pendingLetter) {
    const def = pickLetter(LETTERS, pendingLetter, (w) => state.check(w));
    openLetterId = pendingLetter;
    pendingLetter = null;
    if (def) {
      player.frozen = true;
      audio.pageFlip();
      title.showLetter({ from: def.from, body: def.body, typed: def.typed });
      return;
    }
    openLetterId = null;
  }

  // Chasca's album unfolds once the conversation has stepped back from it.
  if (state.has('album.open')) {
    state.clearFlag('album.open');
    player.frozen = true;
    audio.pageFlip();
    albumUI.open((curtain) => {
      // The closing book went dark over the end of the journey: hold it.
      if (curtain) {
        startCurtain();
        return;
      }
      player.frozen = false;
      // The first viewing earns her closing words; reopenings close quietly.
      if (!state.has('c10.album.seen')) startNarration('c10.album.close');
    });
    return;
  }
  if (
    state.has('dig.invite') &&
    !state.has('dig.done') &&
    DIG_SPOTS.every((s) => state.has(s.flag))
  ) {
    startNarration('dig.finish');
    return;
  }
  // A journey taken in conversation runs first, always: an armed card can
  // wait, but "the faraglioni slide past" cannot be taken back.
  if (takeTravel()) return;
  {
    // A conversation raised a game's start flag: the how-to card goes first,
    // so the hands know what they are about to do (and may decline, kindly).
    // A declined card returns only after its own villager, or after an
    // examine back at the spot where it was set aside (a station).
    const g = pendingGame() ?? (speaker ? null : declinedNearHere());
    if (g) {
      showHowto(g);
      return;
    }
  }
  if (state.has('photo.flash')) {
    state.clearFlag('photo.flash');
    flashT = calmFlash() ? 0.25 : 0.5;
    audio.shutter();
  }
  if (state.has('carry.chicha') && sloshes === 0 && !state.has('chicha.hinted')) {
    state.set('chicha.hinted');
    toasts.show('carry it steady: three bumps and the floor drinks it');
  }
  if (state.has('story.complete') && !celebrated) {
    celebrated = true;
    applyGateState();

// The identical top-level applyDressings serves here too; a nested copy of
// it once lived in this scope as a paste leftover and shadowed nothing.
applyDressings();
    showPlate(chapterPlate(0), 5200);
    toasts.show('✦ the journal remembers her now');
    toasts.show('the east gate stands open');
    scheduleCeremony('story.complete');
  }
  for (const c of COMPLETIONS) {
    if (state.has(c.flag) && !celebratedFlags.has(c.flag)) {
      celebratedFlags.add(c.flag);
      showPlate(c.plate, 5200);
      for (const t of c.toasts) toasts.show(t);
      celebrate();
      scheduleCeremony(c.flag);
    }
  }
}

const PET_NODES = ['allqu.pet1', 'allqu.pet2', 'allqu.pet3', 'allqu.pet4', 'allqu.pet5'];

function startNpcDialogue(v: Villager) {
  // A befriended dog is no longer talked to. It is petted. Repeatedly.
  if (v === dog && state.has('allqu.friend')) {
    pets++;
    renderer.emote(v.actor, '♥');
    audio.pet();
    renderer.bounce(v.actor);
    if (pets === 13) toasts.show('✦ 13/10. would pet again');
    const node = PET_NODES[Math.min(PET_NODES.length - 1, Math.floor((pets - 1) / 2))] ?? 'allqu.pet1';
    player.frozen = true;
    const [ox, oy] = v.actor.occupies();
    v.actor.placeAt(ox, oy, OPPOSITE[player.dir]);
    v.actor.frozen = true;
    talkingTo = v;
    textbox.open(NODES, node, null, endDialogue);
    return;
  }

  const away = v.def.visiting?.[v.def.map];
  const entry = away ? { node: away } : v.def.entry.find((e) => state.check(e.when));
  if (!entry) return;
  // Back to whoever offered a declined card: it may come back after this.
  forgiveDeclinesBy(v.def.id);
  // Caught mid-stride, they finish the step (landHeldSteps) and turn on
  // landing; snapping them onto the far cell was a one-tile pop.
  v.actor.face(OPPOSITE[player.dir]);
  v.actor.frozen = true;
  player.frozen = true;
  talkingTo = v;
  settleForTalk(v);
  renderer.emote(v.actor, '!');
  if (!v.def.sprite) renderer.wave(v.actor);
  if (v.def.sprite === 'dog') audio.bark();
  else if (v.def.sprite) audio.hum();
  textbox.open(NODES, entry.node, v.portrait, endDialogue);
}

function startNarration(nodeId: string) {
  player.frozen = true;
  textbox.open(NODES, nodeId, null, endDialogue);
}

/** What falls from the sky when a chapter completes, by region. */
const PETALS: Record<string, string[]> = {
  andes: ['#c1512f', '#d9a441', '#8fcbe8'],
  coast: ['#8fcbe8', '#f2e6d0', '#d9a441'],
  ocean: ['#cfe3ee', '#f2e6d0'],
  shionoura: ['#f0b6c8', '#f2e6d0', '#e88ca8'],
  busan: ['#e88c6a', '#f2e6d0', '#d9a441'],
  kerala: ['#7db35a', '#d9a441', '#f2e6d0'],
  zanzibar: ['#d9694a', '#e8d44d', '#f2e6d0'],
  delhi: ['#e8556a', '#f2a03c', '#8fcbe8'],
  sicily: ['#e8d44d', '#f2e6d0', '#8fcbe8'],
  oaxaca: ['#e8862f', '#d9a441', '#c1512f'],
  velacion: ['#e8862f', '#f2e6d0'],
};

/** The savor pause: input rests while a big moment lands. */
let celebrateT = 0;

function celebrate() {
  celebrateT = 1.6;
  audio.setDucked(true);
  audio.stinger();
  renderer.celebrateHop(player); // the traveler's own joyful two-hop
  const hues = PETALS[regionFor(map.id)] ?? PETALS['andes'] ?? ['#f2e6d0'];
  const [px, py] = player.renderPos();
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      renderer.burst(px + TILE / 2 + (i - 1) * 20, py - 10 - i * 8, 'petal', hues);
    }, i * 180);
  }
}

// ------------------------------------------------------- the chapter close

/** The pending unfold, if a chapter just finished; one moment at a time. */
let ceremonyTimer = 0;

/** True while another page, card, or transition owns the screen. */
function ceremonyMustWait(): boolean {
  return (
    mode !== 'play' || !!warp || sitting || textbox.isOpen || title.letterOpen ||
    journalUI.isOpen || pauseMenu.isOpen || albumUI.isOpen || anyGameOpen() || uiCardOpen()
  );
}

/**
 * The journal closes a chapter: once the completion dialogue has ended and
 * the petals have had their moment, the spread unfolds like a letter. If
 * something else holds the screen when the moment comes, it waits politely
 * and tries again; and if the road has already moved on to another chapter's
 * ground, the moment is let go rather than forced.
 */
function scheduleCeremony(flag: string) {
  if (!closingChapter(flag, map.id)) return;
  const hues = PETALS[regionFor(map.id)] ?? PETALS['andes'] ?? ['#f2e6d0'];
  // Patience is not a count. A player who reads the journal for a minute
  // after the final scene has not left; the moment is let go only when the
  // road moves on (closingChapter returns null off the chapter's ground).
  // A counted retry once starved the spread forever for a 20-second read.
  const tryOpen = () => {
    const chapter = closingChapter(flag, map.id);
    if (!chapter) {
      ceremonyTimer = 0;
      return;
    }
    if (ceremonyMustWait()) {
      ceremonyTimer = window.setTimeout(tryOpen, 900);
      return;
    }
    ceremonyTimer = 0;
    player.frozen = true;
    audio.pageFlip();
    chapterClose.open(chapter, hues, () => {
      player.frozen = false;
    });
  };
  window.clearTimeout(ceremonyTimer);
  ceremonyTimer = window.setTimeout(tryOpen, 1800);
}

// ---------------------------------------------------------------- sitting
//
// The game's thesis as a verb: press the button at a bench and simply stay.
// The camera leans back, the band steps aside for the air, villagers keep
// living, time moves a little faster, and thoughts drift past. Any key rises.

let sitting = false;
let sitT = 0;
/** Whole time spent in the current sit; customs want a settled witness. */
let sitTotal = 0;
let sitLineIdx = 0;

const DEFAULT_SIT_LINES = [
  'You sit. Nobody needs you to be anywhere. It takes a minute to believe it.',
  'The village goes on doing what villages do, at the speed they do it.',
  'Somewhere behind you, someone laughs at something you will never know.',
  'Nani used to say the best seat is the one you stop looking past.',
];

function startSitting() {
  sitting = true;
  sitT = 0;
  sitTotal = 0;
  sitLineIdx = 0;
  player.frozen = true;
  player.pose = 'sit';
  audio.setSitting(true);
  toasts.show(keysOrTaps('you sit. (any key to rise)', 'you sit. (tap anywhere to rise)'));
}

function standUp() {
  sitting = false;
  player.frozen = false;
  player.pose = 'none';
  audio.setSitting(false);
}

function updateSitting(dt: number) {
  if (!sitting) return;
  sitT += dt;
  sitTotal += dt;
  // Sitting is how you watch the light change: the day breathes faster.
  if (!Number.isFinite(todOverride)) dayT = (dayT + (dt * 5) / DAY_LEN) % 1;
  if (sitT > 5.5) {
    sitT = 0;
    const lines = SIT_LINES[map.id] ?? DEFAULT_SIT_LINES;
    const line = lines[sitLineIdx % lines.length];
    sitLineIdx++;
    if (line) toasts.show(line);
  }
}

/** The person the chip's task is about, re-read twice a second. */
let taskLeadId: string | null = null;
let taskLeadAt = -Infinity;
function taskLead(): string | null {
  const now = performance.now();
  if (now - taskLeadAt > 500) {
    taskLeadAt = now;
    const t = journalUI.activeTaskDefs()[0];
    taskLeadId = t && t.who !== undefined ? (threadWho(t, state)[0] ?? null) : null;
  }
  return taskLeadId;
}

/** How long the thread's person waits where it found them, in ms. */
const THREAD_HOLD_MS = 30000;
/** The person the red thread last pointed at, and the map it was laid on. */
let threadAim: Villager | null = null;
let threadAimMap = '';

/**
 * The thread's person, if they are standing right beside you now. The yarn
 * ends on a free cell beside them, but you arrive facing along the yarn, and
 * that is often a crate, an awning or a bicycle; Space read the prop and the
 * person the whole thread was about stood ignored at your elbow (Mr. Gong's
 * crate, Shionoura's bicycle). While the thread's person is at your side,
 * they come first. Talking to them settles it.
 */
function threadPersonBeside(): Villager | null {
  const v = threadAim;
  if (!v || threadAimMap !== map.id || !villagersHere().includes(v) || v.actor.isMoving) return null;
  const [px, py] = player.occupies();
  const [ox, oy] = v.actor.occupies();
  return Math.abs(px - ox) + Math.abs(py - oy) === 1 ? v : null;
}

/** An undug mound at (x, y), while Justina's invitation stands. */
function moundAt(x: number, y: number) {
  if (map.id !== 'village' || !state.has('dig.invite') || state.has('dig.done')) return undefined;
  return DIG_SPOTS.find((s) => s.at[0] === x && s.at[1] === y && !state.has(s.flag));
}

/**
 * Dig the mound you face, or (`near`) the one underfoot or at your side.
 * Mounds are soft ground you can walk over, so a player often ends up on one
 * or beside one facing the terrace wall; Space read the terraces and
 * Justina's lines while the mound sat at their feet, and one tester spent
 * ten minutes learning to stand exactly beside and facing it. Near a mound,
 * Space digs it.
 */
function tryDig(near: boolean): boolean {
  const cell = near ? nearMound() : player.facingCell();
  const spot = cell && moundAt(cell[0], cell[1]);
  if (!cell || !spot) return false;
  const [px, py] = player.occupies();
  // Turn to a mound at your side; one underfoot is dug where you stand.
  if (cell[0] !== px || cell[1] !== py) {
    player.face(cell[0] > px ? 'right' : cell[0] < px ? 'left' : cell[1] > py ? 'down' : 'up');
  }
  audio.dig();
  startNarration(spot.node);
  return true;
}

/** The mound Space would dig: the one faced, else underfoot, else beside. */
function nearMound(): [number, number] | null {
  const [fx, fy] = player.facingCell();
  if (moundAt(fx, fy)) return [fx, fy];
  const [px, py] = player.occupies();
  for (const [dx, dy] of [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]] as const) {
    if (moundAt(px + dx, py + dy)) return [px + dx, py + dy];
  }
  return null;
}

/** `aimFirst`: Space and the button; a click names its own target. */
function tryInteract(aimFirst = true): boolean {
  // The dig is the errand in hand: a mound you face, stand on or stand
  // beside answers Space before anything else does.
  if (tryDig(aimFirst)) return true;
  const [fx, fy] = player.facingCell();
  const v = villagersHere().find((n) => {
    const [ox, oy] = n.actor.occupies();
    return ox === fx && oy === fy;
  });
  if (v) {
    if (v === threadAim) threadAim = null;
    startNpcDialogue(v);
    return true;
  }
  const aim = aimFirst ? threadPersonBeside() : null;
  if (aim) {
    threadAim = null;
    const [ox, oy] = aim.actor.occupies();
    player.face(ox > player.x ? 'right' : ox < player.x ? 'left' : oy > player.y ? 'down' : 'up');
    startNpcDialogue(aim);
    return true;
  }
  const kind = map.object(fx, fy)?.t ?? map.ground(fx, fy).t;
  if (sitKindsOn(map.id).has(kind)) {
    startSitting();
    return true;
  }
  const arm = EXAMINES[kind]?.find(
    (a) => (!a.map || a.map === map.id) && state.check(a.when) && (!a.dark || nightLevel(dayT) > 0.3),
  );
  if (arm) {
    startNarration(arm.node);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- nani's red thread
//
// The band Carmen ties in chapter one carries the same red thread Zoila
// sewed into the journal's spine. Ask it (N) and it unspools from your feet
// a short way along the ground toward where the story continues, sways once
// like settling yarn, and fades. Her hand pointing, not a quest arrow: when
// nothing resolves, the thread simply rests, because a wrong thread would be
// worse than none.

/** How far the thread unspools, in tiles of actual walking. */
const THREAD_MAX_TILES = 7;
/** ...unless the end is no further than this: then it goes all the way. */
const THREAD_REACH_TILES = 12;
/** The resting whisper may repeat at most this often, in ms. */
const THREAD_TOAST_COOLDOWN = 60000;
/** The band's glint: an invitation to press N, never a spoiler. Seconds;
 * mutable so the dev desk (soup.glintTune) can hurry them for automation. */
const GLINT = {
  /** How long no task may progress before the band considers stirring. */
  taskIdleS: 60,
  /** Quiet time after any thread or glint. */
  cooldownS: 180,
  /** A fresh session is left entirely alone this long. */
  sessionGraceS: 300,
};

/**
 * The walk from `from` to a floor tile beside `cell`, the tile Space faces it
 * from. Never a tile somebody else is standing on (the thread once ended under
 * Chasca, beside Mr. Bak, and read as pointing at her); only when every side
 * is taken does it settle for any floor beside. Bodies never block the yarn
 * on the way, only the place it ends.
 */
function pathBeside(from: [number, number], cell: [number, number]): [number, number][] | null {
  const solid = (x: number, y: number) => map.solid(x, y);
  const bodies = new Set(villagersHere().map((v) => v.actor.occupies().join(',')));
  let best: [number, number][] | null = null;
  let bestCost = Infinity;
  for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]] as const) {
    const nx = cell[0] + dx;
    const ny = cell[1] + dy;
    if (solid(nx, ny) || bodies.has(`${nx},${ny}`)) continue;
    const p = yarnPath(from, nx, ny, solid);
    // Bare floor beats a tuft or a coil of hose by a step: the end is where
    // the player stands, and it should read as somewhere to stand.
    const cost = p ? p.length + (dressedCell(nx, ny) ? 1.5 : 0) : Infinity;
    if (p && cost < bestCost) {
      best = p;
      bestCost = cost;
    }
  }
  return best ?? yarnPath(from, cell[0], cell[1], solid, true);
}

/** What a step onto floor painted over by a tall prop costs the yarn, in
 * steps: a detour of up to this many tiles is taken to keep the thread out
 * from under a lamp's head or a tree's canopy, and none longer. */
const YARN_OVERHANG_COST = 6;

/**
 * The thread's own walk: pathBetween's rules (walkable ground, bodies
 * ignored by the callers, a goal beside the cell when `adjacentTo`), except
 * that floor under a tall prop's overhang costs extra. Yarn laid there was
 * drawn straight through a lamppost and under a tree's crown, so it read as
 * a line through solids, not a way to walk.
 */
function yarnPath(
  from: [number, number],
  tx: number,
  ty: number,
  blocked: (x: number, y: number) => boolean,
  adjacentTo = false,
): [number, number][] | null {
  const w = map.w;
  const goals = new Set<number>();
  if (adjacentTo) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const gx = tx + dx;
      const gy = ty + dy;
      if (map.inBounds(gx, gy) && !blocked(gx, gy)) goals.add(gy * w + gx);
    }
    if (goals.size === 0) return null;
  } else {
    if (tx === from[0] && ty === from[1]) return [];
    if (!map.inBounds(tx, ty) || blocked(tx, ty)) return null;
    goals.add(ty * w + tx);
  }
  const over = renderer.overhung(map);
  // A rug or a crate lid underfoot costs a step too: bare floor reads as a
  // way to walk, yarn over a prop reads as pointing at the prop.
  return cheapestPath(map.w, map.h, from, goals, blocked, (x, y) =>
    (over[y * w + x] ? YARN_OVERHANG_COST : dressedCell(x, y) ? 1 : 0) +
    (YARN_OFFROAD.has(map.ground(x, y).t) ? YARN_OFFROAD_COST : 0),
  );
}

/**
 * Open ground with a drawn road somewhere near it. The yarn walked east
 * across bare sand on arrival in La Caleta while the painted road ran down
 * beside it; a person shown the way follows the road when the road is not
 * much longer. A third of a step per bare cell buys that: a road detour of
 * up to a third longer wins, and a map with no road at all is unchanged.
 */
const YARN_OFFROAD = new Set(['sand', 'sandWet', 'grass', 'dirt', 'puna', 'ladera', 'lavashore']);
const YARN_OFFROAD_COST = 0.34;

/** A walkable cell with something on it (a tuft, a hose, pigeons): not bare floor. */
function dressedCell(x: number, y: number): boolean {
  const o = map.object(x, y);
  return !!o && o.t !== 'blocked' && !map.triggerAt(x, y);
}

/**
 * The same walk with its turns taken as early as they can be: of all the
 * equally short ways there, the one that gets onto the target's line first
 * and arrives along it. A thread to the east road's exit used to run beside
 * the road and dive onto it at the map's very edge; now it steps onto the
 * road and follows it out, and a thread to a thing arrives facing it.
 */
function straightenThread(from: [number, number], path: [number, number][]): [number, number][] {
  if (path.length < 2) return path;
  const pts: [number, number][] = [from, ...path.map((c) => [c[0], c[1]] as [number, number])];
  const last = pts[pts.length - 1]!;
  const prev = pts[pts.length - 2]!;
  const finalX = last[0] !== prev[0]; // the axis the walk arrives along
  const solid = (x: number, y: number) => map.solid(x, y);
  const over = renderer.overhung(map);
  const under = (c: [number, number]) => over[c[1] * map.w + c[0]] === 1;
  for (let pass = 0; pass < pts.length; pass++) {
    let moved = false;
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      const c = pts[i + 1]!;
      const abAlong = finalX ? a[1] === b[1] : a[0] === b[0];
      const bcCross = finalX ? b[0] === c[0] : b[1] === c[1];
      if (!abAlong || !bcCross) continue;
      // a -> b runs along the final line, b -> c crosses onto it: cross first.
      const swap: [number, number] = [a[0] + (c[0] - b[0]), a[1] + (c[1] - b[1])];
      // Never through a doorway the shortest walk did not already take.
      if (solid(swap[0], swap[1]) || map.triggerAt(swap[0], swap[1])) continue;
      // Nor in under a lamp's head the routed walk had stepped around.
      if (under(swap) && !under(b)) continue;
      pts[i] = swap;
      moved = true;
    }
    if (!moved) break;
  }
  return pts.slice(1);
}

/**
 * Where a task continues, as a cell on the current map, measured from `from`.
 * An `at` names a door to walk through, or a thing to face: the thread ends
 * beside the thing and its loop lands on the thing itself, never on the
 * player's own feet. A `who` names one person or a crowd; the thread takes
 * the nearest of them here who still has something new to say (the guide
 * has already dropped anyone down to their idle line). Anything on another
 * map resolves to the closest door on this one that leads toward it.
 */
function threadTargetFor(
  task: WorldTask,
  from: [number, number],
): { cell: [number, number]; adjacent: boolean } | null {
  const solid = (x: number, y: number) => map.solid(x, y);
  let targetMap: string | null = null;
  const at = atFor(task, state);
  if (at) {
    const [m, x, y] = at;
    if (m === map.id) return { cell: [x, y], adjacent: map.triggerAt(x, y)?.type !== 'door' };
    targetMap = m;
  } else {
    // The task's lead first (the person its sentence is about), then anyone
    // named with news; see threadWho. Only people the thread can reach.
    const live = threadWho(task, state, (id) => {
      const m = npcMap(id);
      return !!m && (m === map.id || nextMapToward(map.id, m, state) !== null);
    });
    let best = Infinity;
    let bestCell: [number, number] | null = null;
    for (const id of live) {
      const v = villagers.find((n) => n.def.id === id);
      // Here but faded for the night: not somewhere the thread can end.
      if (!v || v.def.map !== map.id || v.fade <= 0.02) continue;
      const cell = v.actor.occupies();
      const p = pathBeside(from, cell);
      if (p && p.length < best) {
        best = p.length;
        bestCell = cell;
      }
    }
    if (bestCell) return { cell: bestCell, adjacent: true };
    targetMap =
      live
        .map((id) => npcMap(id))
        .find((m): m is string => !!m && m !== map.id && !!nextMapToward(map.id, m, state)) ?? null;
  }
  if (!targetMap) return null;
  const hop = nextMapToward(map.id, targetMap, state);
  if (!hop) return null;
  // Several doors can lead the same way; the thread takes the closest one.
  let best: number = Infinity;
  let bestAt: [number, number] | null = null;
  for (const d of doorsFrom(map.id, state)) {
    if (d.to !== hop) continue;
    const p = yarnPath(from, d.at[0], d.at[1], solid);
    if (p && p.length < best) {
      best = p.length;
      bestAt = d.at;
    }
  }
  return bestAt ? { cell: bestAt, adjacent: false } : null;
}

/**
 * The walk path the thread would lie along, from `from` toward the first
 * open task that resolves, capped at THREAD_MAX_TILES. Walkable ground only,
 * bodies ignored: the thread is yarn on the floor, not a route around
 * whoever is passing. A task with nowhere to point hands the thread to the
 * next one down; only when none resolves does the thread rest.
 */
function threadPathFrom(
  from: [number, number],
): { tiles: [number, number][]; loop: [number, number] | null; task: WorldTask; person: [number, number] | null } | null {
  const solid = (x: number, y: number) => map.solid(x, y);
  for (const task of journalUI.activeTaskDefs()) {
    if (task.who === undefined && !task.at) continue;
    const aim = threadTargetFor(task, from);
    if (!aim) continue;
    let path = aim.adjacent ? pathBeside(from, aim.cell) : yarnPath(from, aim.cell[0], aim.cell[1], solid);
    // A fixed spot can be a prop with no floor of its own; point beside it.
    if (!path && !aim.adjacent) path = pathBeside(from, aim.cell);
    if (!path) continue;
    path = straightenThread(from, path);
    // Close enough to arrive, it arrives: a thread that stops four tiles
    // short of the karaoke reads as pointing at the empty floor it stops on.
    const reaches = path.length <= THREAD_REACH_TILES;
    // Running out on the way, it runs out on bare floor: an end lying on a
    // tuft or a hose reads as pointing at the tuft. Back off a step or two.
    let n = reaches ? path.length : THREAD_MAX_TILES;
    if (!reaches) {
      for (let k = n; k >= Math.max(1, n - 3); k--) {
        const c = path[k - 1]!;
        if (!dressedCell(c[0], c[1])) {
          n = k;
          break;
        }
      }
    }
    return {
      tiles: [from, ...path.slice(0, n)],
      loop: reaches ? aim.cell : null,
      task,
      // Where the person it leads to stands (a thing or a door: null).
      person: aim.adjacent && villagersHere().some((v) => v.actor.occupies().join() === aim.cell.join()) ? aim.cell : null,
    };
  }
  return null;
}

let threadToastAt = -Infinity;
/** When the thread last actually unspooled (performance.now ms). */
let threadShownAt = -Infinity;
/** What the last summon resolved, published on the dev bridge so automation
 * can hold the thread honest: the task it followed and where it pointed. */
let threadLast: {
  task: string;
  end: [number, number];
  loop: [number, number] | null;
  dressed: boolean;
  tiles: [number, number][];
  /** Laid cells that lie under a tall prop's overhang (want: none). */
  under: number;
} | null = null;

/** Ask the thread, from the player's feet or from a helpful villager's. */
function summonThread(from: [number, number] = player.occupies()): boolean {
  const found = threadPathFrom(from);
  if (!found) {
    const now = performance.now();
    if (now - threadToastAt > THREAD_TOAST_COOLDOWN) {
      threadToastAt = now;
      toasts.show('the thread rests; the journal’s ribbon knows more');
    }
    return false;
  }
  renderer.showThread(found.tiles, found.loop);
  // Remember who the thread leads to: at its end, Space greets them
  // before any crate or bicycle that happens to be in front of you.
  const loop = found.person;
  threadAim = loop
    ? (villagersHere().find((v) => {
        const [ox, oy] = v.actor.occupies();
        return ox === loop[0] && oy === loop[1];
      }) ?? null)
    : null;
  threadAimMap = map.id;
  // One soft note from Carmen's loom: the terracotta string, same as the band.
  audio.weaveNote(0);
  threadShownAt = performance.now();
  const end = found.tiles[found.tiles.length - 1] ?? from;
  threadLast = {
    task: found.task.text,
    end,
    loop: found.loop,
    dressed: dressedCell(end[0], end[1]),
    tiles: found.tiles,
    under: found.tiles.filter(([x, y]) => renderer.overhung(map)[y * map.w + x] === 1).length,
  };
  queueWhisper();
  return true;
}

/** The engine half of ask-a-villager: the same thread, from their feet. */
function threadFromNpc(v: Villager): boolean {
  return summonThread(v.actor.occupies());
}

/** A 'thread:' effect raised mid-conversation; drawn once the words close. */
let pendingThread = false;
state.on('thread', () => {
  pendingThread = true;
});

// -- her whispers -------------------------------------------------------
//
// The first time the thread is asked in each chapter, one line of Nani's
// arrives a breath after the unspool, in her hand. Once per chapter, ever.

/** The journey's live chapter: the last stop whose arrival flag is set.
 * Progress-based on purpose; the return walks the old maps, and a map
 * lookup would hand its whisper to chapter one. */
function currentChapterId(): string {
  let cur = CHAPTERS[0]?.id ?? 'chaska-pampa';
  for (const c of CHAPTERS) {
    if (c.arrival?.flag && state.has(c.arrival.flag)) cur = c.id;
  }
  return cur;
}

/** One whisper waiting for the unspool to finish and the screen to be hers. */
let pendingWhisper: { chapter: string; text: string } | null = null;
let whisperDelay = 0;

function queueWhisper() {
  if (pendingWhisper) return;
  const chapter = currentChapterId();
  const text = WHISPERS[chapter];
  if (!text || state.has(`thread.whisper.${chapter}`)) return;
  pendingWhisper = { chapter, text };
  whisperDelay = 1.1;
}

/** Nothing may talk over the story: the whisper waits out dialogue, panels,
 * ceremonies and doors, the way a held letter does. */
function whisperMustWait(): boolean {
  return (
    textbox.isOpen || journalUI.isOpen || pauseMenu.isOpen || albumUI.isOpen ||
    anyGameOpen() || uiCardOpen() || chapterClose.isOpen || title.letterOpen ||
    // A SCHEDULED ceremony counts too: the spread once opened over a landing
    // whisper and her line spent its once-ever life unreadable behind it.
    ceremonyTimer !== 0 ||
    sitting || warp !== null || celebrateT > 0 || player.frozen
  );
}

function tickWhisper(dt: number) {
  if (!pendingWhisper || mode !== 'play') return;
  whisperDelay -= dt;
  if (whisperDelay > 0 || whisperMustWait()) return;
  // The flag is written only when the words actually land, so a moment
  // interrupted by a reload still owes her the line.
  state.set(`thread.whisper.${pendingWhisper.chapter}`);
  showWhisper(pendingWhisper.text);
  pendingWhisper = null;
}

/** Her line, toast-shaped but in her hand. It steps around the toast queue
 * on purpose: it is timed to the thread, not to whatever page-fill slips
 * happen to be waiting. Opacity-only motion, so reduced motion needs no
 * special case beyond what every toast already gets. */
function showWhisper(text: string) {
  const el = document.createElement('div');
  el.className = 'toast wh';
  el.textContent = text;
  $('toasts').appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  window.setTimeout(() => {
    el.classList.remove('in');
    window.setTimeout(() => el.remove(), 450);
  }, 4600);
}

// -- the auto-breathe glint -------------------------------------------------

const sessionStart = performance.now();
let glintShownAt = -Infinity;
let glintPoll = 0;
let taskSig = '';
let taskProgressAt = performance.now();
/** Last moment the player was actually walking (performance.now ms). */
let walkAt = -Infinity;

function watchTaskProgress() {
  const sig = journalUI.activeTasks().join('|');
  if (sig !== taskSig) {
    taskSig = sig;
    taskProgressAt = performance.now();
  }
}
watchTaskProgress();
state.on('changed', watchTaskProgress);

/**
 * If a task with a resolvable target has sat untouched for a minute while
 * the player wanders, the band glints once at the wrist: a half-second red
 * shimmer, no thread, no sound. An invitation to press N, not a spoiler.
 * Never during dialogue, panels, ceremonies, or a session's first minutes.
 */
function maybeGlint(dt: number) {
  glintPoll -= dt;
  if (glintPoll > 0) return;
  glintPoll = 1;
  if (mode !== 'play' || !state.has('keepsake.band')) return;
  const now = performance.now();
  if (now - sessionStart < GLINT.sessionGraceS * 1000) return;
  if (now - taskProgressAt < GLINT.taskIdleS * 1000) return;
  if (now - threadShownAt < GLINT.cooldownS * 1000) return;
  if (now - glintShownAt < GLINT.cooldownS * 1000) return;
  if (now - walkAt > 2500) return; // for the wandering, not the idle
  if (
    textbox.isOpen || journalUI.isOpen || pauseMenu.isOpen || albumUI.isOpen ||
    anyGameOpen() || uiCardOpen() || chapterClose.isOpen || title.letterOpen ||
    sitting || warp !== null || celebrateT > 0 || player.frozen
  ) {
    return;
  }
  if (!threadPathFrom(player.occupies())) return; // nothing resolvable: stay quiet
  glintShownAt = now;
  // A soft shimmer where the band sits, tinted the thread's own red.
  const [px, py] = player.renderPos();
  renderer.burst(px + TILE / 2 + 3, py + 10, 'sparkle', ['#c1512f', '#e08a5e', '#f2d9c8']);
}

// ---------------------------------------------------------------- modes

type Mode = 'title' | 'naming' | 'letter' | 'play';
let mode: Mode = 'title';
let attractT = 0;
let quietHud = false;

function beginPlay(freshStart: boolean) {
  mode = 'play';
  if (freshStart && !override) {
    // Begin again has to mean the beginning. The title screen idles over
    // wherever the journey paused, and this function only ever repositioned
    // for Continue, so erasing the save left the player standing in whatever
    // chapter they had reached: a new game that opened in Delhi.
    map = startMap;
    player.placeAt(startMap.spawn[0], startMap.spawn[1], startMap.spawnFacing);
    const [px, py] = player.renderPos();
    camera.resetLead();
    camera.follow(px, py, map.w, map.h);
  } else if (!freshStart && !override && state.place && maps[state.place.map]) {
    // Continue resumes the journey where it paused, anywhere in the world.
    map = maps[state.place.map] as TileMap;
    const [sx, sy] = safeStand(map, state.place.x, state.place.y);
    player.placeAt(sx, sy, state.place.dir as Dir);
    const [px, py] = player.renderPos();
    camera.follow(px, py, map.w, map.h);
  }
  showPlate(map.name);
  audio.setScene(sceneFor(map.id));
  audio.setRegion(regionFor(map.id));
  renderer.setMood(moodFor(map.id));
  renderer.setRaining(rainingOn(map.id));
  renderer.setFires((fireCells[map.id] ?? []).map(([fx, fy]) => [fx, fy]));
  stage.setAmbient(AMBIENT[moodFor(map.id)] ?? 0xfdf6ea);
  // A session starts with the traveler free to move, whatever state the save
  // was written in (the autosave also fires mid-warp and mid-letter, when
  // frozen is legitimately true). Every freeze after this point is paired
  // with a live release path; a stale one from before it must not survive
  // into play, where nothing would ever release it.
  player.frozen = false;
  if (freshStart) {
    // If a mashing player has an examine open when the timer fires, wait for
    // the box to close instead of dropping the intro forever. Reproduced by
    // a pacing bot: Enter through the letter, examine the well inside the
    // 900ms window, and the game's first words never played.
    const introTry = () => {
      introTimer = 0;
      if (state.has('intro.done')) return;
      if (!textbox.isOpen) startNarration('intro.wake');
      else introTimer = window.setTimeout(introTry, 400);
    };
    window.clearTimeout(introTimer);
    introTimer = window.setTimeout(introTry, 900);
    // The welcome waits for the intro to finish. Shown here it was invisible:
    // the narration holds the textbox open for over a minute, quiet-hud fades
    // the plate and the toasts for all of it, and their timers run out behind
    // the fade. The village nameplate and both control hints were authored,
    // good, and never once seen by a new player.
    pendingWelcome = true;
  }
}

/**
 * A different journal was put on the table (chosen, erased, or unpacked
 * over): the loaded journey is forgotten wholesale and the new slot is read
 * from a clean slate, exactly like a boot. The world is stood back up for
 * the title's attract drift; Continue and Begin then travel the usual paths.
 */
function reloadJourney() {
  // Everything queued for the OLD journey dies here: a pending whisper once
  // crossed this seam and stamped its once-ever flag into the wrong save; a
  // fading toast once followed the player into another journal's morning.
  pendingWhisper = null;
  pendingWelcome = false;
  pendingLetter = null;
  armed.clear();
  window.clearTimeout(ceremonyTimer);
  ceremonyTimer = 0;
  window.clearTimeout(introTimer);
  introTimer = 0;
  window.clearTimeout(welcomeTimer);
  welcomeTimer = 0;
  toasts.dismissAll();
  dropPlate();
  state.forget();
  state.load();
  for (const tm of Object.values(maps)) tm.clearOverrides();
  resyncCelebrations();
  applyGateState();
  applyDressings();
  refreshTaskChip();
  refreshPlayerSheet();
  // The title idles over wherever this journal's journey paused, like boot.
  if (state.place && maps[state.place.map]) {
    map = maps[state.place.map] as TileMap;
    const [sx, sy] = safeStand(map, state.place.x, state.place.y);
    player.placeAt(sx, sy, state.place.dir as Dir);
  } else {
    map = startMap;
    player.placeAt(startMap.spawn[0], startMap.spawn[1], startMap.spawnFacing);
  }
  camera.resetLead();
  audio.setScene(sceneFor(map.id));
  audio.setRegion(regionFor(map.id));
  renderer.setMood(moodFor(map.id));
  renderer.setRaining(rainingOn(map.id));
  renderer.setFires((fireCells[map.id] ?? []).map(([fx, fy]) => [fx, fy]));
  stage.setAmbient(AMBIENT[moodFor(map.id)] ?? 0xfdf6ea);
}

/** The opening's stagecraft, held until the player can actually see it. */
let pendingWelcome = false;
/** At most one welcome in flight: every dialogue close used to schedule
 * another while the first waited its 420ms, and two could land. */
let welcomeTimer = 0;
/** The intro's retry loop; a journal switch must be able to stop it. */
let introTimer = 0;
function playWelcome() {
  welcomeTimer = 0;
  if (!pendingWelcome) return;
  pendingWelcome = false;
  showPlate(map.name, WELCOME_PLATE_MS);
  // The tips wait for the plate to go. All three at once (the plate, the
  // new thread's chip and the walking tip) stacked over the first face on
  // screen, Don Aurelio's at the well on an upright tablet; one at a time
  // each is read and none covers the plaza for long.
  // The plate takes 1.1s to fade; the tips wait until it has, or for a
  // second three overlays shared the top of a phone.
  welcomeTimer = window.setTimeout(playWelcomeTips, WELCOME_PLATE_MS + 1200);
}

/** How long the first place plate holds before the welcome tips come in. */
const WELCOME_PLATE_MS = 3200;

function playWelcomeTips() {
  welcomeTimer = 0;
  toasts.show(keysOrTaps(
    'walk with the arrow keys or WASD, or click where you want to go',
    'slide a thumb in the lower left to walk, or tap where you want to go',
  ));
  // Not led by the bare glyph: a toast opening on \u2726 is dressed as a journal
  // moment (ink dot, page curl), and the glyph's fallback font ate the space.
  toasts.show(keysOrTaps('Space talks to people and touches things', 'tap \u2726 to talk to people and touch things'));
}

/** Confirm the title menu's current option; shared by Space and click. */
function titleActivate() {
  const choice = title.choose();
  if (choice === 'none') {
    // The warning armed itself; nothing else happens on this press.
    audio.denied();
    return;
  }
  audio.confirm();
  if (choice === 'journals') {
    // The shelf: the cover steps aside, the three journals come down.
    title.openShelf();
    return;
  }
  if (choice === 'settings' || choice === 'credits') {
    title.hideTitle();
    pauseMenu.open(choice, true);
    return;
  }
  title.hideTitle();
  if (choice === 'new') {
    // Begin again never costs a journey when the shelf has room: it starts
    // in the first blank journal and the old one stays where it was. (Two
    // presses of Begin again once erased the active journal outright.) The
    // switch happens only when the traveler actually sets out: Esc on the
    // flyleaf returns to the cover with nothing touched.
    const blank = state.hasSave() ? firstBlankSlot() : null;
    openFlyleaf(
      blank === null
        ? freshSlate
        : () => {
            setActiveSlot(blank);
            freshSlate();
          },
    );
  } else {
    continueJourney();
  }
}

/** Continue, from the cover or straight off the shelf. */
function continueJourney() {
  title.hideTitle();
  if (!state.has('intro.done')) {
    // The flyleaf saves the moment it is finished, so a tab closed during
    // Nani's letter or the three wake lines left a save with no intro in it;
    // Continue then stood the traveler at the well in silence and her letter
    // and the game's first words never came back. Pick up at the letter.
    mode = 'letter';
    title.showLetter(undefined, state.playerName);
  } else {
    beginPlay(false);
  }
}

/** Begin again's clean slate: wipe the active slot, stand the world back up. */
function freshSlate() {
  state.reset();
  armed.clear();
  for (const tm of Object.values(maps)) tm.clearOverrides();
  resyncCelebrations();
  applyGateState();
  applyDressings();
  refreshTaskChip();
  refreshPlayerSheet();
}

/** The flyleaf first: a name (or not) and the traveler's look, then the
 * letter. Continue never passes through here, so it never asks. `setOut`
 * clears the slate, and runs only when the flyleaf is finished; backing
 * out returns to the cover with nothing touched. */
function openFlyleaf(setOut: () => void) {
  mode = 'naming';
  naming.open((res) => {
    setOut();
    state.playerName = res.name;
    state.playerLook = res.look;
    state.save();
    refreshPlayerSheet();
    mode = 'letter';
    title.showLetter(undefined, state.playerName);
  }, () => {
    mode = 'title';
    title.showTitle(state.hasSave());
  });
}

/**
 * A second reading: a finished journal begins again in its own slot, and
 * exactly one thing crosses over, the words. That is what travel does; the
 * languages stay in you when everything else becomes a story. The flyleaf
 * runs again (a new name is allowed), Nani's letter plays again, and every
 * page that is not a word starts blank. The old code, being only a shimmer,
 * comes along too.
 */
function beginSecondReading(row: number) {
  // The inheritance is read off the shelf before the slot goes blank.
  const data = peekSlot(row);
  const words = (data?.journal ?? []).filter((p) => p.startsWith('words.'));
  const konami = (data?.flags ?? []).includes('konami');
  title.hideTitle();
  openFlyleaf(() => {
    // Only on setting out: backing off the flyleaf leaves the finished
    // journal whole and the shelf exactly as it was.
    setActiveSlot(row);
    freshSlate();
    // Quietly: two dozen toasts and chimes at once would bury the moment the
    // player actually chose. The pages are not news; they came with you.
    state.grantPagesQuietly(words);
    state.set('second.reading');
    if (konami) state.set('konami');
  });
}

/** Put down whichever letter is open; shared by Space and click. */
function letterAdvance() {
  if (mode === 'letter') {
    audio.confirm();
    title.hideLetter();
    beginPlay(true);
  } else if (title.letterOpen) {
    audio.confirm();
    title.hideLetter();
    if (openLetterId) {
      state.apply([`letterread:${openLetterId}`]);
      openLetterId = null;
    }
    player.frozen = false;
    takeTravel();
  }
}

// ---------------------------------------------------------------- loop

let showDebug = false;
let bumps = 0;
/** Time until a wall may knock aloud again; see the bumped branch. */
let bumpQuiet = 0;
/** Paca's scripted amble off the pass, and her patience when blocked. */
let pacaWalk: Dir[] = [];
let pacaRetry = 0;
/** Consecutive refused steps with no progress between them; hint fuel. */
let stuckKnocks = 0;
let lastStuckHint = -Infinity;

/**
 * The always-armed motion witness (dev builds only). Records the player's
 * screen displacement every frame and flags micro-freezes: walking, then a
 * handful of frames without motion, then walking again. Survives reloads
 * because it lives in the build, not in an injected script. Read it with
 * soup.witness().
 */
type MotionEvent = { at: number; frames: number; gaps: number[]; gates?: string[] };
const MW = {
  ring: [] as [number, number, number, number][],
  events: [] as MotionEvent[],
  last: 0,
  lastIntent: '-' as string,
  gates: [] as string[],
};
function motionWitness() {
  if (!import.meta.env.DEV) return;
  const now = performance.now();
  const gap = MW.last ? now - MW.last : 0;
  MW.last = now;
  const [px, py] = player.renderPos();
  const r = MW.ring;
  r.push([now, gap, px, py]);
  const g = player.debugState();
  MW.gates.push(
    `${MW.lastIntent[0] ?? '-'}${g.moving ? 'M' : '.'} t${g.t} turn${g.turn} bump${g.bump} flow${g.flow}`,
  );
  if (r.length > 6000) {
    r.shift();
    MW.gates.shift();
  }
  const L = r.length;
  if (L < 15) return;
  const d = (i: number) => Math.hypot(r[i]![2] - r[i - 1]![2], r[i]![3] - r[i - 1]![3]);
  const mid = L - 8;
  if (d(mid) < 0.01 && d(mid - 1) >= 0.3) {
    let stillEnd = mid;
    while (stillEnd < L - 1 && d(stillEnd + 1) < 0.01) stillEnd++;
    const frozen = stillEnd - mid + 1;
    if (frozen <= 12 && stillEnd < L - 1 && d(stillEnd + 1) >= 0.3) {
      MW.events.push({
        at: now,
        frames: frozen,
        gaps: r.slice(mid - 2, stillEnd + 2).map((x) => +x[1].toFixed(1)),
        gates: MW.gates.slice(mid - 2, stillEnd + 2),
      });
      if (MW.events.length > 40) MW.events.shift();
    }
  }
}

/** Reused every frame; see renderer.setKept. */
const keptBodies: Actor[] = [];
function update(dt: number) {
  renderer.tick(dt);
  textbox.tick(dt);
  // The pause strip is a real pause: no panel clock runs while it is up.
  tickPanels(panelList, dt, !stripEl.hidden);
  audio.tick(dt);
  stage.tick(dt);

  // The world turns.
  if (!Number.isFinite(todOverride) && mode === 'play') dayT = (dayT + dt / DAY_LEN) % 1;
  updateRhythm(dt);
  // Scheduled customs keep moving even while the player sits and watches;
  // sitting through one is, in fact, the whole point of two of them.
  updateStations(dt);
  updateStaging(dt);
  updateEndLight(dt);
  updateLampShot(dt);
  updateShots(dt);
  renderer.setNight(moodFor(shownMap().id) === 'interior' ? 0 : nightNow());
  renderer.setSun(sunNow());
  // The coast's mood follows the clock (garúa lid, noon glare), so keep it live.
  renderer.setMood(moodFor(shownMap().id));
  renderer.setRaining(rainingOn(map.id));
  stage.setAmbient(endAmbient(ambientNow()));
  stage.setGrade(0.28 * endLight.gold + 0.12 * endLight.lamp, 0.45 * endLight.gold + 0.7 * endLight.lamp);
  renderer.setShadowBoost(1 + 0.9 * endLight.gold + 0.5 * endLight.lamp);
  audio.setDucked(textbox.isOpen || celebrateT > 0 || curtainT !== null);
  audio.setWorldAmbience(nightLevel(dayT), rainingOn(map.id), dayT);

  // Sitting pushes in slowly, like settling; dialogue leans in just a little.
  // The last page leans in further, and slowly, on its own clock.
  const zoomT = endZoom() ||
    (sitting ? 1.15 : celebrateT > 0 ? 1.12 : textbox.isOpen || anyGameOpen() || uiCardOpen() || journalUI.isOpen || pauseMenu.isOpen || albumUI.isOpen ? 1.06 : 1);
  stage.setZoomTarget(zoomT);
  // Mirror the stage's zoom easing so pointer math maps screen to world
  // without reaching into the presenter's internals.
  uiZoom += (zoomT - uiZoom) * (1 - Math.exp(-dt * 9));
  if (Math.abs(uiZoom - zoomT) < 0.001) uiZoom = zoomT;
  // Story surfaces quiet the ambient HUD (toasts, chip, plate) around them.
  {
    const quiet =
      mode !== 'play' || textbox.isOpen || title.letterOpen || chapterClose.isOpen || journalUI.isOpen || anyGameOpen() || pauseMenu.isOpen || albumUI.isOpen;
    if (quiet !== quietHud) {
      quietHud = quiet;
      document.body.classList.toggle('quiet-hud', quiet);
      // Held, not lost: toasts and plates wait behind the hush and play
      // whole once it lifts.
      toasts.setHeld(quiet);
      holdPlate(quiet);
    }
    chipFold.tick(quiet);
    faceClearHud(quiet);
  }
  // The touch pad follows the same rhythm: overlays up, pad away.
  syncVpad();

  // Whoever is mid-sentence leans into it.
  renderer.setSpeaker(textbox.isTyping && talkingTo ? talkingTo.actor : null);
  // The player, and whoever they are talking to, are never lost behind a prop.
  keptBodies.length = 0;
  if (mode === 'play') keptBodies.push(player);
  if (talkingTo) keptBodies.push(talkingTo.actor);
  renderer.setKept(keptBodies);

  // The curiosity dot: does the cell you face have anything to say?
  if (mode === 'play' && !textbox.isOpen && !journalUI.isOpen && !sitting && !warp && !anyGameOpen() && !albumUI.isOpen) {
    const [fx, fy] = player.facingCell();
    const npcThere = villagersHere().some((v) => {
      const [ox, oy] = v.actor.occupies();
      return ox === fx && oy === fy;
    });
    // Only THINGS earn the dot (props, seats, mounds, people); bare ground
    // still answers when examined, but quietly, undiscovered on purpose,
    // unless a live arm there carries `cue` (an errand laid on the ground).
    const objKind = map.object(fx, fy)?.t;
    const groundKind = objKind === undefined ? map.ground(fx, fy).t : undefined;
    const groundCue =
      groundKind !== undefined &&
      (EXAMINES[groundKind]?.some((a) => a.cue && (!a.map || a.map === map.id) && state.check(a.when)) ?? false);
    const examThere =
      groundCue ||
      (objKind !== undefined &&
        objKind !== 'blocked' &&
        (sitKindsOn(map.id).has(objKind) ||
          (EXAMINES[objKind]?.some((a) => (!a.map || a.map === map.id) && state.check(a.when)) ?? false)));
    // Space goes to the thread's person before a prop (tryInteract): so does the dot.
    const aim = npcThere ? null : threadPersonBeside();
    // A mound near your feet is what Space digs (tryDig), so the dot sits on it.
    const mound = nearMound();
    renderer.setHint(mound ?? (aim ? aim.actor.occupies() : npcThere || examThere ? [fx, fy] : null));
  } else {
    renderer.setHint(null);
  }
  updateSitting(dt);
  updateWarp(dt);

  // Chasca's camera: a quick white blink over the world.
  if (flashT > 0) {
    flashT = Math.max(0, flashT - dt);
    const a = flashT > 0.35 ? 1 : flashT / 0.35;
    // Calm mode (either reduced-motion signal) caps the blink at a glow.
    fadeEl.style.background = '#f8f4ea';
    fadeEl.style.opacity = String(calmFlash() ? Math.min(a * 0.9, 0.25) : a * 0.9);
    if (flashT === 0) {
      fadeEl.style.opacity = '0';
      fadeEl.style.background = '#17120e';
    }
  }

  if (input.takeDebug()) {
    showDebug = !showDebug;
    debugEl.dataset.on = showDebug ? '1' : '0';
  }
  if (input.takeMute()) {
    // The key was just pressed, so someone is looking: the reply shows even
    // over the title or the pause card.
    const line = audio.toggleMute() ? 'sound off' : 'sound on';
    if (quietHud) toasts.showNow(line);
    else toasts.show(line);
    if (pauseMenu.isOpen) pauseMenu.refresh();
  }

  input.pollGamepad();
  const act = input.takeAction() || dev.takeAction();
  if (act) noteAct(performance.now());
  const menuDir = input.takeMenuDir() ?? dev.takeMenuDir();
  const back = input.takeBack();
  const pauseKey = input.takePause();
  const journalKey = input.takeJournal() || dev.takeJournal();
  const threadKey = input.takeThread();
  maybeGlint(dt);
  tickWhisper(dt);

  // Any deliberate input or story freeze cancels a click-to-walk in flight.
  if (autoGoal && (player.frozen || warp || textbox.isOpen || act || back || pauseKey || journalKey || menuDir)) {
    cancelAuto();
  }

  // The savor pause: the world keeps breathing, input rests.
  if (celebrateT > 0) {
    celebrateT -= dt;
    if (celebrateT <= 0) audio.setDucked(textbox.isOpen || curtainT !== null);
  }

  if (pauseMenu.isOpen) {
    if (menuDir) {
      pauseMenu.onDir(menuDir);
      audio.select();
    }
    if (act) {
      pauseMenu.onAction();
      audio.confirm();
    }
    if ((back || pauseKey) && !act) {
      pauseMenu.onBack();
      audio.back();
    }
  } else if (mode === 'title') {
    if (title.confirmOpen) {
      // The erase question owns the keys: arrows choose, Space answers, Esc keeps.
      if (menuDir) {
        title.confirmDir(menuDir);
        audio.select();
      }
      if (act) {
        const did = title.confirmActivate();
        if (did === 'cancel') audio.back();
        else if (did === 'confirm' && !title.titleOpen) {
          // The deed's own callback already sounded (Begin again) or the
          // shelf took it; nothing more here.
        } else if (did === 'confirm') audio.confirm();
      } else if (back || pauseKey) {
        title.confirmBack();
        audio.back();
      }
    } else if (title.shelfOpen) {
      // The shelf owns the keys: arrows browse, Space acts, Esc backs out.
      if (menuDir) {
        title.shelfDir(menuDir);
        audio.select();
      }
      if (act) {
        const did = title.shelfActivate();
        if (did === 'confirm') audio.confirm();
        else if (did === 'warn') audio.denied();
      } else if (back || pauseKey) {
        title.closeShelf();
        audio.back();
      }
    } else {
      if (pauseKey) {
        // Nothing to pause yet; Esc on the title is a no-op.
      }
      if (menuDir) {
        title.onDir(menuDir);
        feedKonami(menuDir);
        audio.select();
      }
      if (act) titleActivate();
    }
  } else if (mode === 'naming') {
    // The flyleaf card owns the keyboard entirely (capture-phase listener);
    // any stray edges from other devices drain here without effect.
  } else if (mode === 'letter') {
    if (act || back) letterAdvance();
  } else if (title.letterOpen) {
    // Mail from home, read mid-journey.
    if (act || back) letterAdvance();
  } else if (chapterClose.isOpen) {
    // The chapter-close spread: any affirmative puts it down. Onward.
    if (act || back || pauseKey) {
      audio.pageFlip();
      chapterClose.close();
    }
  } else if (!howtoEl.hidden) {
    // The how-to card: begin, or not yet. Either way, no harm done.
    if (menuDir === 'up' || menuDir === 'down' || menuDir === 'left' || menuDir === 'right') {
      const fwd = menuDir === 'down' || menuDir === 'right';
      howtoSel = (howtoSel + (fwd ? 1 : howtoOpts.length - 1)) % howtoOpts.length;
      renderHowto();
      audio.select();
    }
    if (act && howtoInGrace()) {
      // A leftover press from the panel that just closed: the card stays.
    } else if (act) {
      audio.confirm();
      closeHowto(howtoOpts[howtoSel] ?? null);
    } else if (back || pauseKey) {
      audio.back();
      closeHowto(null);
    }
  } else if (!stripEl.hidden) {
    // The in-panel pause strip: start over, keep at it, or step away. It
    // lies as a row, so left and right walk it as well as up and down.
    if (menuDir) {
      const fwd = menuDir === 'down' || menuDir === 'right';
      stripSel = (stripSel + (fwd ? 1 : STRIP_OPTS.length - 1)) % STRIP_OPTS.length;
      renderStrip();
      audio.select();
    }
    if (act) {
      audio.confirm();
      stripActivate();
    } else if (back || pauseKey) {
      audio.back();
      closeStrip();
    }
  } else if (albumUI.isOpen) {
    // Arrows are the album's page-turn keys; drain the walk-tap buffer so the
    // last turn does not spin the player around once the album is handed back.
    input.intent();
    if (menuDir) albumUI.onDir(menuDir);
    if (act || back || pauseKey) {
      albumUI.close();
      audio.pageFlip();
    }
  } else if (anyGameOpen()) {
    const g = games.find((x) => x.panel.isOpen);
    if (g) {
      if (back || pauseKey) {
        showStrip(g);
        audio.pageFlip();
      } else {
        if (menuDir) g.panel.onDir(menuDir);
        if (act) g.panel.onAction();
      }
    }
  } else if (textbox.isOpen) {
    walkHeading = null;
    landHeldSteps(dt);
    if (menuDir) {
      textbox.onDir(menuDir);
      audio.select();
    }
    if (act || back) textbox.onAction();
  } else if (journalUI.isOpen) {
    if (menuDir) {
      journalUI.onDir(menuDir);
      audio.select();
    }
    if (back || journalKey || act) {
      journalUI.close();
      audio.pageFlip();
    }
  } else if (sitting) {
    if (act || back || menuDir || journalKey || input.intent()) standUp();
  } else if (curtainT !== null) {
    // The held dark after the book: a stray key here once dropped the
    // player straight back at the well. Nothing answers until it lifts.
    input.intent();
  } else if (!warp) {
    if (pauseKey && celebrateT <= 0) {
      pauseMenu.open('menu');
      audio.pageFlip();
    } else if (journalKey) {
      journalUI.open();
      audio.pageFlip();
    } else if (threadKey && !state.has('keepsake.band') && !player.frozen && celebrateT <= 0) {
      // Before Carmen ties the band, N used to do nothing at all, and a
      // silent key reads as a broken one. One quiet line that does not spoil
      // the band (the reveal is hers) and points at the ribbon instead.
      const now = performance.now();
      if (now - threadToastAt > 20000) {
        threadToastAt = now;
        toasts.show('nothing on your wrist to ask yet; the journal’s ribbon knows the way');
      }
    } else if (threadKey && state.has('keepsake.band') && !player.frozen && celebrateT <= 0) {
      // Ask the band. The first deliberate press, ever, also retires the
      // chip's nudge: only a manual N counts, never a villager's offer or an
      // effect.
      state.set('thread.used');
      summonThread();
    } else if (celebrateT > 0) {
      // The moment is still landing; let it.
    } else if (settling()) {
      // A talk's settling steps still landing after its words closed.
      landHeldSteps(dt);
    } else if (act && (afterTalkHush() || spamHush() || introTimer !== 0)) {
      // The press that closed the last line had company: swallowed. So is
      // a press in the breath between the letter and the first words: it
      // used to read the well before the game had said anything at all.
    } else if (act) {
      if (!tryInteract()) {
        // Open air, and a game still waiting on its start flag: the how-to
        // card offers itself again. Declined lessons are only postponed,
        // and only re-offered back where they were declined.
        const g = pendingGame() ?? declinedNearHere();
        if (g) showHowto(g);
      }
    } else {
      const manual = dev.heldOverride() ?? input.intent();
      // A held key or stick always outranks a click-to-walk in progress.
      if (manual && autoGoal) cancelAuto();
      const intent = manual ?? autoIntent();
      MW.lastIntent = intent ?? '-';
      walkHeading = intent;
      // The camera leans a little into sustained walking, easing home at rest.
      const lead = intent
        ? { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[intent]
        : [0, 0];
      camera.lead(lead?.[0] ?? 0, lead?.[1] ?? 0, dt);
      const prevX = player.x;
      const prevY = player.y;
      const ev = player.update(dt, { intent, blocked: blockedFor(player) });
      // Feet in motion: the band's glint only invites people mid-wander.
      if (intent && player.isMoving) walkAt = performance.now();
      if (ev?.kind === 'arrived') stuckKnocks = 0;
      // The quiet decays whether or not you are still leaning on the wall, so
      // walking off and bumping again later knocks properly.
      if (bumpQuiet > 0) bumpQuiet = Math.max(0, bumpQuiet - dt);
      if (ev?.kind === 'bumped') {
        bumps++;
        // Holding into a wall re-thudded every fifth of a second, which turns
        // a soft cue into a woodpecker. The first knock speaks; leaning on it
        // only murmurs.
        if (bumpQuiet <= 0) {
          audio.bump();
          bumpQuiet = 0.5;
        }
        // The gentle-hint valve: a player pushing on the same closed door is
        // asking the game a question. After a few insistent knocks, answer
        // it with the open thread the chip is already showing, where their
        // eyes are. Never more than once a minute; stuck, not nagged.
        // The answer is the chip itself, glowing once and unfolding on a
        // phone: it used to toast the chip's own sentence again under it,
        // the same words twice, every minute the wall was leaned on.
        stuckKnocks++;
        if (stuckKnocks >= 4 && performance.now() - lastStuckHint > 60000) {
          if (!errandEl.hidden) {
            chipFold.call();
            lastStuckHint = performance.now();
          }
          stuckKnocks = 0;
        }
        // A villager stepped into the planned path; route around them.
        // Leaning on someone with the keys: after a few knocks, they make way.
        const into = stepFrom(...player.occupies(), player.dir);
        if (pushCell && pushCell[0] === into[0] && pushCell[1] === into[1] && performance.now() - pushAt < 500) pushKnocks++;
        else pushKnocks = 1;
        pushCell = into;
        pushAt = performance.now();
        if (autoGoal) replanAuto();
        // The full caporal does not appreciate walls.
        if (state.has('carry.chicha')) {
          sloshes++;
          audio.slosh();
          if (sloshes >= 3) {
            sloshes = 0;
            state.clearFlag('carry.chicha');
            state.set('chicha.spilled');
            toasts.show('...the glass is empty. Rosa is going to enjoy this.');
          } else {
            toasts.show(`the chicha sloshes! (${sloshes}/3)`);
          }
        }
      }
      if (ev?.kind === 'arrived') {
        audio.step(map.ground(ev.x, ev.y).t);
        petalStep(ev.x, ev.y);
        renderer.puffAt(prevX, prevY);
        const trig = map.triggerAt(ev.x, ev.y);
        if (trig?.type === 'door') startWarp(trig);
      }
      for (const v of villagersHere()) {
        if (v === paca && pacaWalk.length > 0) continue;
        updateVillager(v, dt);
      }
      unstack();
    }
  }

  // Paca yields the pass, one llama-meter, once Faustino whistles. If the
  // player is on the road to see it, she ambles aside like a creature with
  // legs; the teleport is only for catching up with events nobody watched.
  if (paca && state.has('paca.moved') && paca.actor.x === 30 && paca.actor.y === 6) {
    if (map.id === 'east-road' && pacaRetry <= 0) {
      if (pacaWalk.length === 0) pacaWalk = ['left', 'left', 'up', 'up'];
    } else if (map.id !== 'east-road') {
      paca.actor.placeAt(28, 4, 'down');
    }
  }
  if (pacaRetry > 0) pacaRetry -= dt;
  if (paca && pacaWalk.length > 0 && map.id === 'east-road' && mode === 'play') {
    const d = pacaWalk[0]!;
    const ev = paca.actor.update(dt, { intent: d, blocked: blockedFor(paca.actor) });
    if (ev?.kind === 'arrived') pacaWalk.shift();
    else if (ev?.kind === 'bumped') {
      // Someone is standing in her considered route. She waits them out and
      // reconsiders shortly; llamas are patient about being right.
      pacaWalk = [];
      pacaRetry = 1.2;
    }
  }

  if (mode === 'title') {
    // Attract mode: the camera drifts across wherever the journey paused,
    // like a memory browsing itself behind the cover.
    attractT += dt;
    const wx = (map.w * TILE) / 2 + Math.sin(attractT * 0.045) * map.w * TILE * 0.32 - TILE / 2;
    const wy = (map.h * TILE) / 2 + Math.sin(attractT * 0.031 + 1.7) * map.h * TILE * 0.32 - TILE / 2;
    camera.follow(wx, wy, map.w, map.h);
    fitCameraToCrop(wx, wy);
  } else {
    const [rpx, rpy] = player.renderPos();
    // The ending frames its own shots; everywhere else the player is it.
    const [ppx, ppy] = endFocus(rpx, rpy);
    camera.follow(ppx, ppy, map.w, map.h, 1 - endFrameK());
    fitCameraToCrop(ppx, ppy);
    liftForWords(dt);
  }

  // Remember where we stand; persisted alongside the next save. Mutated in
  // place: allocating a fresh object 60 times a second is how GC hitches start.
  if (mode === 'play') {
    if (!state.place) state.place = { map: map.id, x: player.x, y: player.y, dir: player.dir };
    else {
      state.place.map = map.id;
      state.place.x = player.x;
      state.place.y = player.y;
      state.place.dir = player.dir;
    }
  }

  motionWitness();
  dev.publish({
    mode,
    map: map.id,
    tile: [player.x, player.y],
    px: player.renderPos(),
    cam: [camera.x, camera.y],
    dir: player.dir,
    facing: player.facingCell(),
    dialogue: textbox.currentNode,
    journalOpen: journalUI.isOpen,
    weaveOpen: games.some((g) => g.def.flag === 'weave.start' && g.panel.isOpen),
    howtoOpen: !howtoEl.hidden,
    stripOpen: !stripEl.hidden,
    pages: state.pageCount(),
    sitting,
    errand: state.errand,
    npcs: Object.fromEntries(villagersHere().map((v) => [v.def.id, v.actor.occupies()])),
    rhythm: {
      nk: Number(nightLevel(dayT).toFixed(3)),
      seated: villagersHere().filter((v) => v.seated).map((v) => v.def.id),
      gone: villagers.filter((v) => v.def.map === map.id && v.fade <= 0.02).map((v) => v.def.id),
      fading: villagers
        .filter((v) => v.def.map === map.id && v.fade > 0.02 && v.fade < 1)
        .map((v) => v.def.id),
    },
    stations: stationsRt.map((st) => ({
      id: st.def.id,
      on: st.def.mode === 'gather' ? gatherOn(st, nightLevel(dayT)) : roundRuns(st, nightLevel(dayT)),
      idx: st.round.idx,
      done: st.round.done,
      here: st.berths.filter((b) => b.v.def.map === st.def.map).map((b) => b.v.def.id),
      seated: st.berths.filter((b) => b.v.def.map === st.def.map && b.v.seated).map((b) => b.v.def.id),
      at: st.berths.map((b) => [b.v.def.map, ...b.v.actor.occupies(), b.v.actor.frozen ? 'F' : '']),
      lamps: [...stationLampEase.entries()]
        .filter(([k]) => k.startsWith(`${st.def.map}:`))
        .map(([, e]) => Number(e.k.toFixed(2))),
    })),
    bumps,
    auto: autoGoal ? { kind: autoGoal.kind, cell: autoGoal.cell, path: autoPath.slice(0, 8) } : null,
    thread: {
      out: renderer.threadOut,
      shownAt: Math.round(threadShownAt),
      glintAt: Math.round(glintShownAt),
      last: threadLast,
    },
  });
}

function render() {
  // The vista draws the village below the pass, from its own camera.
  const vm = shownMap();
  const cam = shownCam();
  const sprites = vistaOn
    ? villagers.filter((v) => v.def.map === vm.id && v.fade > 0.02 && state.check(v.def.when))
    : // Mounds first: the sort is stable, so a body standing on one draws
      // over the soil instead of wearing it on its feet.
      [...moundsHere(), ...spritesHere()];
  renderer.drawWorld(vm, cam, sprites);

  // Every fire and lamp on this map becomes a flickering point light.
  // Outdoors they wake with the dusk; interior fires carry the room all day.
  const indoors = moodFor(vm.id) === 'interior';
  const nk = indoors ? 0 : nightNow();
  const outdoorK = indoors ? 1 : 0.25 + 0.75 * Math.min(1, nk * 2);
  const specs: LightSpec[] = (fireCells[vm.id] ?? []).flatMap(([cx, cy, kind]) => {
    const def = GLOW_STYLE[kind] ?? { r: 30, color: 0xffb066, flicker: 0.4, lift: 3 };
    const x = cx * TILE + TILE / 2 - cam.x;
    const y = cy * TILE + TILE / 2 - def.lift - cam.y;
    // A lamp on a lamplighter's round holds its daytime ember until she
    // reaches it; every other light wakes with the dusk as it always has,
    // except in the vista, where they come on ahead of the camera.
    const wake = stationLampWake(vm.id, cx, cy) ?? (vistaOn ? vistaWake(cx * TILE, cy * TILE) : null);
    const dayK = wake === null ? outdoorK : 0.25 + Math.max(0, outdoorK - 0.25) * wake;
    // On the last evening the lamps carry the stone: a wider pool each.
    const pool = indoors ? 1.35 : 1 + 0.35 * endLight.lamp;
    const core: LightSpec = { x, y, r: def.r * pool * dayK, color: def.color, flicker: def.flicker };
    // Indoors, every fire also pools a broad dim warmth across the room, so
    // the space feels inhabited rather than spot-lit.
    return indoors
      ? [core, { x, y: y + 6, r: def.r * 3.2, color: 0x54331c, flicker: 0.08 }]
      : [core];
  });
  // The last page is written in a pool of lamplight at the well: the people
  // round it warm, the plaza beyond going down into the evening. Not yet in
  // the vista: the well is still waiting for the page.
  if (vm.id === 'village' && endLight.lamp > 0 && !vistaOn) {
    specs.push({
      x: WELL_PX[0] - cam.x,
      y: WELL_PX[1] + 10 - cam.y,
      r: 58 * endLight.lamp,
      color: 0xffc07a,
      flicker: 0.1,
    });
  }
  // And after the book, wherever you wander in the village, a little of it goes with you.
  // (At the well itself its own pool already holds you.)
  if (afterglow && !vistaOn) {
    const [rx, ry] = player.renderPos();
    const fromWell = Math.hypot(rx + TILE / 2 - WELL_PX[0], ry + TILE / 2 - WELL_PX[1]);
    const k = smooth01((fromWell - 20) / 40) * endLight.lamp;
    if (k > 0) specs.push({ x: rx + TILE / 2 - cam.x, y: ry + 4 - cam.y, r: 34 * k, color: 0xffc58a, flicker: 0.06 });
  }
  // At dusk the houses light their windows from inside.
  if (nk > 0.3) {
    for (const [wx, wy] of houseWindows[vm.id] ?? []) {
      const wake = windowWake(vm.id, wx, wy);
      if (wake <= 0) continue;
      specs.push({
        x: wx - cam.x,
        y: wy - cam.y,
        r: (15 + nk * 6) * wake,
        color: 0xffc878,
        flicker: 0.08,
      });
    }
  }
  stage.setLights(specs);
  stage.render();

  // The walk marker rides the world through the same lens the click used.
  if (markCell) {
    const [mx, my] = worldToScreen(markCell[0] * TILE + TILE / 2, markCell[1] * TILE + TILE / 2);
    markEl.style.left = `${mx}px`;
    markEl.style.top = `${my}px`;
  }

  if (showDebug) {
    const [fx, fy] = player.facingCell();
    debugEl.textContent = [
      `map    ${map.name} (${map.id})  ${map.w}x${map.h}  mode ${mode}`,
      `tile   ${player.x},${player.y}  facing ${player.dir}`,
      `front  ${fx},${fy}  ${blockedFor(player)(fx, fy) ? 'solid' : 'open'}`,
      `pages  ${state.pageCount()}  errand ${state.errand ?? '-'}`,
      `node   ${textbox.currentNode || '-'}  bumps ${bumps}`,
      `step   ${(STEP_DUR * 1000).toFixed(0)}ms  turn ${(TURN_DELAY * 1000).toFixed(0)}ms`,
    ].join('\n');
  }
}

// ---------------------------------------------------------------- pointer & touch
//
// First-class mouse and touch play. One rule keeps double-fires impossible:
// game surfaces (canvas, dialogue, minigame panels, d-pad) act on pointerdown;
// menu rows act on click, with mouseover driving the same cursor the keyboard
// drives. Every activation goes through the components' existing public
// methods, so a click is indistinguishable from the key it stands in for.

const frameEl = $('frame');
const choicesEl = $('tb-choices');

// The presenter eases its zoom every tick; mirror it (same constant) so
// screen-to-world stays exact without reaching into the stage's internals.
let uiZoom = 1;

function viewScale(): number {
  return Math.max(1, window.innerWidth / VIEW_W, window.innerHeight / VIEW_H) * uiZoom;
}

/**
 * The words never cover the people saying them. The textbox lies across the
 * bottom of the screen, and the camera stops at a map's edge, so a talk near
 * the bottom of a map (Rosa's first, in front of her pot; the terraces'
 * corner on a phone) happened under the box with only two hats showing.
 * While words are on screen the frame lifts until both speakers stand clear
 * above the box, past the map's edge if it must (what lies beyond is the
 * frame's own dark margin), eased in and eased back out when the words close.
 */
let wordsLift = 0;
let wordsTop = -1;
let wordsTopAt = -Infinity;
const WORDS_MARGIN = 6; // logical px of air between feet and the box
function liftForWords(dt: number) {
  let target = 0;
  if (textbox.isOpen && mode === 'play' && !vistaOn) {
    const now = performance.now();
    if (now - wordsTopAt > 200) {
      // Re-read now and then: the box grows when choices appear.
      wordsTopAt = now;
      const r = document.getElementById('textbox')?.getBoundingClientRect();
      wordsTop = r && r.height > 0 ? r.top : -1;
    }
    if (wordsTop > 0) {
      const people = [player, ...(talkingTo ? [talkingTo.actor] : [])];
      let feet = -Infinity;
      let head = Infinity;
      for (const a of people) {
        const [, ry] = a.renderPos();
        feet = Math.max(feet, ry + TILE);
        head = Math.min(head, ry - TILE);
      }
      const boxWorld = screenToWorld(0, wordsTop)[1];
      const topWorld = screenToWorld(0, 0)[1];
      // Lift enough to clear the box, never so far the hats leave the top.
      target = Math.max(0, Math.min(feet + WORDS_MARGIN - boxWorld, head - topWorld - 4));
    }
  } else {
    wordsTopAt = -Infinity;
  }
  wordsLift += (target - wordsLift) * (1 - Math.exp(-dt * 6));
  if (Math.abs(wordsLift) < 0.05) wordsLift = 0;
  camera.y += wordsLift;
}

function screenToWorld(sx: number, sy: number): [number, number] {
  const s = viewScale();
  return [
    (sx - (window.innerWidth - VIEW_W * s) / 2) / s + camera.x,
    (sy - (window.innerHeight - VIEW_H * s) / 2) / s + camera.y,
  ];
}

function worldToScreen(wx: number, wy: number): [number, number] {
  const s = viewScale();
  return [
    (wx - camera.x) * s + (window.innerWidth - VIEW_W * s) / 2,
    (wy - camera.y) * s + (window.innerHeight - VIEW_H * s) / 2,
  ];
}

/**
 * Cover-fit crops the long axis: a very tall or very wide window shows only
 * the middle of the frame the camera frames (the frame itself turns upright
 * on upright screens, config.viewFor, so the crop stays modest). The engine
 * camera clamps to the full frame, so within a few tiles of a map edge the player could
 * stand entirely outside the visible slice. After each follow, re-center the
 * followed point inside what is actually on screen, letting the camera run
 * into the cropped margin, which is off-screen by definition. On 16:9
 * desktops the crop is zero and this never fires; the threshold also spares
 * mild ratios (16:10, 21:9) so their camera lead stays exactly as it was.
 */
function fitCameraToCrop(tx: number, ty: number) {
  const s = viewScale();
  const cropX = (VIEW_W - window.innerWidth / s) / 2;
  const cropY = (VIEW_H - window.innerHeight / s) / 2;
  const SIG = 24; // logical px of one-sided crop before recentering matters
  if (cropX > SIG) {
    const worldW = map.w * TILE;
    const want = tx + TILE / 2 - VIEW_W / 2;
    camera.x =
      worldW <= VIEW_W - 2 * cropX
        ? (worldW - VIEW_W) / 2
        : Math.min(Math.max(want, -cropX), worldW - VIEW_W + cropX);
  }
  if (cropY > SIG) {
    const worldH = map.h * TILE;
    const want = ty + TILE / 2 - VIEW_H / 2;
    camera.y =
      worldH <= VIEW_H - 2 * cropY
        ? (worldH - VIEW_H) / 2
        : Math.min(Math.max(want, -cropY), worldH - VIEW_H + cropY);
  }
}

// Injected styles: overlays become clickable (the HUD layer is pointer-inert
// by design), menu rows advertise themselves, and the walk marker + touch
// pad get their journal-ink dress. index.html stays untouched.
{
  const style = document.createElement('style');
  style.textContent = `
    #textbox, #journal, #pause, #title, #letter, #weave, .mg-overlay { pointer-events: auto; }
    #textbox, .tb-choice, .t-opt, .p-opt, .p-row, .j-tab, .j-item, .letter-paper { cursor: pointer; }
    #stagegl { touch-action: none; }
    #walkmark {
      position: absolute;
      width: 26px; height: 26px;
      margin: -13px 0 0 -13px;
      border-radius: 50%;
      border: 2px solid rgba(242, 230, 208, 0.85);
      box-shadow: 0 0 10px rgba(217, 164, 65, 0.55), inset 0 0 6px rgba(217, 164, 65, 0.45);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.35s ease;
    }
    #walkmark.on { opacity: 1; animation: walkRipple 1s ease-out infinite; }
    @keyframes walkRipple {
      0% { transform: scale(0.5); opacity: 0.95; }
      70% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.2); opacity: 0.1; }
    }
    #vpad {
      position: absolute; inset: 0;
      pointer-events: none;
      transition: opacity 0.22s ease;
    }
    #vpad[hidden] { display: none; }
    /* A paper overlay is up (dialogue, journal, pause, a card, the title):
     * every one of those is tap-first, so the pad steps out of the light. */
    #vpad.vp-quiet { opacity: 0; }
    #vpad.vp-quiet .vp-b { pointer-events: none; }
    .vp-pad {
      position: absolute;
      left: calc(14px + env(safe-area-inset-left, 0px));
      bottom: calc(14px + env(safe-area-inset-bottom, 0px));
      width: 168px; height: 168px;
      display: grid; gap: 5px;
      grid-template-areas: '. u .' 'l . r' '. d .';
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
    }
    .vp-b {
      pointer-events: auto;
      touch-action: none;
      -webkit-user-select: none; user-select: none;
      -webkit-tap-highlight-color: transparent;
      min-width: 44px; min-height: 44px; padding: 0;
      border: 1.5px solid rgba(242, 230, 208, 0.38);
      border-radius: 12px;
      background: rgba(23, 18, 14, 0.34);
      color: rgba(242, 230, 208, 0.9);
      font-size: 16px;
      font-family: inherit;
      line-height: 1;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 240, 210, 0.08);
    }
    .vp-b:active {
      background: rgba(122, 59, 34, 0.55);
      border-color: rgba(242, 230, 208, 0.6);
    }
    .vp-pad [data-dir='up'] { grid-area: u; }
    .vp-pad [data-dir='left'] { grid-area: l; }
    .vp-pad [data-dir='right'] { grid-area: r; }
    .vp-pad [data-dir='down'] { grid-area: d; }
    /* The Walking setting picks one lower-left tenant: the floating stick
     * by default, the button cluster for anyone who asks. */
    body:not(.walk-buttons) .vp-pad { display: none; }
    body.walk-buttons .vp-stick { display: none; }
    .vp-stick {
      position: absolute;
      left: 0;
      bottom: 0;
      width: min(46vw, 340px);
      height: min(52vh, 300px);
      pointer-events: auto;
      touch-action: none;
      -webkit-user-select: none; user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    #vpad.vp-quiet .vp-stick { pointer-events: none; }
    .vp-ring {
      position: absolute;
      width: 96px; height: 96px;
      margin: -48px 0 0 -48px;
      border-radius: 50%;
      border: 1.5px solid rgba(242, 230, 208, 0.42);
      background: rgba(23, 18, 14, 0.22);
      box-shadow: inset 0 0 10px rgba(217, 164, 65, 0.18);
      pointer-events: none;
    }
    .vp-ring[hidden] { display: none; }
    .vp-pebble {
      position: absolute;
      left: 50%; top: 50%;
      width: 40px; height: 40px;
      border-radius: 50%;
      background: rgba(242, 230, 208, 0.82);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 0 10px rgba(217, 164, 65, 0.4);
    }
    .vp-hint {
      position: absolute;
      left: 36px;
      bottom: calc(64px + env(safe-area-inset-bottom, 0px));
      width: 150px;
      text-align: center;
      pointer-events: none;
      transition: opacity 0.8s ease;
    }
    .vp-hint.gone { opacity: 0; }
    /* A minigame panel owns the middle and its left rule runs through this
     * corner; the lesson is about walking and waits for the world. */
    #vpad.vp-game .vp-hint { opacity: 0; }
    .vp-hint-ring {
      width: 72px; height: 72px;
      margin: 0 auto 7px;
      border-radius: 50%;
      border: 2px dashed rgba(242, 230, 208, 0.55);
      animation: vpHintPulse 2.2s ease-in-out infinite;
    }
    .vp-hint-line {
      font-family: var(--hand, cursive);
      font-size: 15px;
      /* #frame zeroes line-height for the canvas; without its own leading
       * the two wrapped lines of this hint printed on top of each other. */
      line-height: 1.3;
      color: rgba(242, 230, 208, 0.9);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65);
      transform: rotate(-1.2deg);
    }
    @keyframes vpHintPulse {
      0%, 100% { transform: scale(1); opacity: 0.55; }
      50% { transform: scale(1.07); opacity: 0.95; }
    }
    body.reduce-motion .vp-hint-ring { animation: none; opacity: 0.7; }
    .vp-side {
      position: absolute;
      right: calc(14px + env(safe-area-inset-right, 0px));
      bottom: calc(14px + env(safe-area-inset-bottom, 0px));
      display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
    }
    .vp-act {
      width: 72px; height: 72px;
      border-radius: 50%;
      font-size: 24px;
      border-color: rgba(200, 165, 91, 0.55);
    }
    .vp-small { width: 48px; height: 48px; border-radius: 50%; opacity: 0.92; }
    .vp-small[hidden] { display: none; }
    /* A phone lying down is a short room: the pad hugs the corners tighter
     * so the minigame panels keep the middle of the stage. */
    @media (pointer: coarse) and (max-height: 500px) {
      .vp-pad {
        left: calc(10px + env(safe-area-inset-left, 0px));
        bottom: calc(10px + env(safe-area-inset-bottom, 0px));
        width: 140px; height: 140px; gap: 4px;
      }
      .vp-pad .vp-b { min-width: 42px; min-height: 42px; }
      .vp-side {
        right: calc(10px + env(safe-area-inset-right, 0px));
        bottom: calc(10px + env(safe-area-inset-bottom, 0px));
        gap: 8px;
      }
      .vp-act { width: 60px; height: 60px; }
      .vp-small { width: 44px; height: 44px; }
    }
  `;
  document.head.appendChild(style);
}

// ---- the walk marker: a soft ripple on the clicked tile ----

const markEl = document.createElement('div');
markEl.id = 'walkmark';
frameEl.insertBefore(markEl, $('hud'));
let markCell: [number, number] | null = null;

function showMark(x: number, y: number) {
  markCell = [x, y];
  markEl.classList.add('on');
}

function hideMark() {
  markEl.classList.remove('on');
}

// ---- click-to-walk: BFS over the live collision the player actually faces ----

type AutoGoal = { kind: 'walk' | 'interact'; cell: [number, number]; npc?: Villager };
let autoPath: [number, number][] = [];
let autoGoal: AutoGoal | null = null;

function cancelAuto() {
  autoPath = [];
  autoGoal = null;
  hideMark();
}

/**
 * Shortest path from the player to (tx,ty), or to any open cell beside it
 * when `adjacentTo` (for talking to someone rather than standing on them).
 * Returns the cells to walk, start excluded, or null when unreachable.
 */
function findPath(tx: number, ty: number, adjacentTo: boolean): [number, number][] | null {
  // Plan from the cell the player is committed to, not the one being left.
  return pathBetween(player.occupies(), tx, ty, blockedFor(player), adjacentTo);
}

/** The BFS itself, over the current map, from any walker's committed cell.
 * Click-to-walk and the scheduled customs both plan through here. */
function pathBetween(
  from: [number, number],
  tx: number,
  ty: number,
  blocked: (x: number, y: number) => boolean,
  adjacentTo = false,
): [number, number][] | null {
  const w = map.w;
  const [px, py] = from;
  const goals = new Set<number>();
  if (adjacentTo) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const gx = tx + dx;
      const gy = ty + dy;
      if (map.inBounds(gx, gy) && !blocked(gx, gy)) goals.add(gy * w + gx);
    }
    if (goals.size === 0) return null;
    if (goals.has(py * w + px)) return [];
  } else {
    if (tx === px && ty === py) return [];
    goals.add(ty * w + tx);
  }
  const prev = new Map<number, number>();
  const start = py * w + px;
  const queue = [start];
  const seen = new Set([start]);
  for (let head = 0; head < queue.length; head++) {
    const ci = queue[head] ?? 0;
    const cx = ci % w;
    const cy = (ci - cx) / w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = cx + dx;
      const ny = cy + dy;
      const ni = ny * w + nx;
      if (!map.inBounds(nx, ny) || seen.has(ni)) continue;
      seen.add(ni);
      if (blocked(nx, ny)) continue;
      prev.set(ni, ci);
      if (goals.has(ni)) {
        const path: [number, number][] = [];
        for (let at = ni; at !== start; at = prev.get(at) ?? start) {
          const ax = at % w;
          path.unshift([ax, (at - ax) / w]);
        }
        return path;
      }
      queue.push(ni);
    }
  }
  return null;
}

/** Is this cell where an open task's `at` points, on this map? */
function isTaskTarget(x: number, y: number): boolean {
  return journalUI.activeTaskDefs().some((t) => {
    const at = atFor(t, state);
    return !!at && at[0] === map.id && at[1] === x && at[2] === y;
  });
}

/** Anything on this cell the action button would engage with. */
function interactableAt(x: number, y: number): boolean {
  if (
    villagersHere().some((v) => {
      const [ox, oy] = v.actor.occupies();
      return ox === x && oy === y;
    })
  ) {
    return true;
  }
  if (moundAt(x, y)) return true;
  // Only THINGS invite the pointer (props, seats, mounds, people), matching
  // the curiosity dot: bare ground still answers the button, but a click on
  // it should simply walk there.
  // A door outranks whatever sits on it. Some exits carry an examinable mat,
  // and if the click examines instead of walking, a pointer-only player can
  // stand in the langar reading the threshold forever and never leave.
  if (map.triggerAt(x, y)) return false;
  const obj = map.object(x, y);
  const objKind = obj?.t;
  if (objKind === undefined || objKind === 'blocked') return false;
  if (sitKindsOn(map.id).has(objKind)) return true;
  // A prop you can stand on (pecking pigeons, a fallen kite, wires strung
  // overhead) is floor to a pointer: a click walks onto it and Space still
  // reads it. Otherwise it ate every click on the red thread laid across it,
  // and a pointer player following the thread read wire bundles instead of
  // walking. A task's own target is the one exception: that IS the thing.
  if (!obj?.solid && !isTaskTarget(x, y)) return false;
  return EXAMINES[objKind]?.some((a) => (!a.map || a.map === map.id) && state.check(a.when)) ?? false;
}

/** Turn toward an adjacent cell and press the same button Space presses. */
function faceAndInteract(tx: number, ty: number) {
  const dir: Dir =
    tx > player.x ? 'right' : tx < player.x ? 'left' : ty > player.y ? 'down' : 'up';
  player.face(dir);
  tryInteract(false);
}

/**
 * The villager drawn under a world point. A figure stands about a tile and a
 * half tall, and one mid-stride is drawn between two cells, so a click on a
 * head or on someone walking used to land on the cell behind them and read
 * the geraniums there instead. Their drawn body is what the eye clicks.
 */
function villagerAtPoint(wx: number, wy: number): Villager | undefined {
  let best: Villager | undefined;
  let bestD = Infinity;
  for (const v of villagersHere()) {
    if (v.fade <= 0.02) continue;
    const [rx, ry] = v.actor.renderPos();
    // A figure is two tiles tall: the head and hat fill most of the cell
    // above. The box used to stop half a tile up, so a click on the face of
    // someone walking past landed on the ground behind them and walked you
    // to where they had been (Bantu, the Caleta stalls). The hat's crown,
    // the top couple of pixels, still belongs to whatever is up there.
    if (wx < rx + 2 || wx > rx + TILE - 2 || wy < ry - 13 || wy > ry + TILE) continue;
    const d = Math.abs(wx - (rx + TILE / 2)) + Math.abs(wy - (ry + TILE / 2));
    if (d < bestD) {
      best = v;
      bestD = d;
    }
  }
  return best;
}

function requestMove(tx: number, ty: number, hit?: Villager) {
  cancelAuto();
  const npc =
    hit ??
    villagersHere().find((v) => {
      const [ox, oy] = v.actor.occupies();
      return ox === tx && oy === ty;
    });
  // Whoever was clicked is the goal, wherever their feet have got to.
  if (npc) [tx, ty] = npc.actor.occupies();
  const [ox, oy] = player.occupies();
  const d = Math.abs(ox - tx) + Math.abs(oy - ty);
  if (npc || interactableAt(tx, ty)) {
    // Standing on the very mound you clicked: dig it where you stand.
    if (d === 0) {
      if (!npc && !player.isMoving) tryDig(true);
      return;
    }
    if (d === 1 && !player.isMoving && !npc?.actor.isMoving) {
      faceAndInteract(tx, ty);
      return;
    }
    if (d === 1) {
      // Somebody's feet are still in the air: hold the hail until both land
      // (autoIntent), instead of turning toward where they are leaving.
      autoPath = [];
      autoGoal = { kind: 'interact', cell: [tx, ty], npc };
      return;
    }
    // Bodies in the way are walked around as they move (replanAuto on a
    // bump); only the bare map can make a thing truly out of reach.
    const path =
      findPath(tx, ty, true) ?? pathBetween(player.occupies(), tx, ty, (x, y) => map.solid(x, y), true);
    if (!path) {
      // Nowhere beside it to stand: walk as near as the ground goes.
      const near = walkGoalNear(tx, ty);
      const p = near && pathBetween(player.occupies(), near[0], near[1], (x, y) => map.solid(x, y));
      if (!near || !p || p.length === 0) return;
      autoPath = p;
      autoGoal = { kind: 'walk', cell: near };
      showMark(near[0], near[1]);
      return;
    }
    autoPath = path;
    autoGoal = { kind: 'interact', cell: [tx, ty], npc };
    showMark(tx, ty);
  } else {
    // A click on a bench, a lamp, a wall, or ground nobody can reach from
    // here used to do nothing at all: the walk stopped dead at the bench.
    // Now it walks as close as the ground allows, around every prop.
    const goal = walkGoalNear(tx, ty);
    if (!goal) return;
    const path = findPath(goal[0], goal[1], false) ?? pathBetween(player.occupies(), goal[0], goal[1], (x, y) => map.solid(x, y));
    if (!path || path.length === 0) return;
    autoPath = path;
    autoGoal = { kind: 'walk', cell: goal };
    showMark(goal[0], goal[1]);
  }
}

/**
 * Where a click on (tx, ty) should walk to: the cell itself when the player
 * can reach it, else the reachable floor nearest it (by distance to the
 * click, then by the walk). Reach is judged on the bare map; villagers are
 * walked around as they come, since they move. Null only when already there.
 */
function walkGoalNear(tx: number, ty: number): [number, number] | null {
  const [px, py] = player.occupies();
  const w = map.w;
  const dist = new Map<number, number>([[py * w + px, 0]]);
  const queue = [py * w + px];
  let best: [number, number] | null = null;
  let bestScore = Infinity;
  for (let head = 0; head < queue.length; head++) {
    const ci = queue[head]!;
    const cx = ci % w;
    const cy = (ci - cx) / w;
    const d = dist.get(ci)!;
    const score = (Math.abs(cx - tx) + Math.abs(cy - ty)) * 1000 + d;
    if (score < bestScore) {
      bestScore = score;
      best = [cx, cy];
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = cx + dx;
      const ny = cy + dy;
      const ni = ny * w + nx;
      if (!map.inBounds(nx, ny) || dist.has(ni) || map.solid(nx, ny)) continue;
      dist.set(ni, d + 1);
      queue.push(ni);
    }
  }
  if (!best || (best[0] === px && best[1] === py)) return null;
  return best;
}

/** Recompute the path to the standing goal (a villager stepped into it). */
function replanAuto() {
  const goal = autoGoal;
  if (!goal) return;
  const [tx, ty] = goal.npc ? goal.npc.actor.occupies() : goal.cell;
  const path = findPath(tx, ty, goal.kind === 'interact');
  if (!path) {
    cancelAuto();
    return;
  }
  autoPath = path;
  autoGoal = goal;
  goal.cell = [tx, ty];
  showMark(tx, ty);
}

/**
 * The direction click-to-walk wants this frame; handles arrival + interact.
 * Steering is relative to the cell the player is COMMITTED to (occupies()),
 * not the one being left: when a step lands, the actor immediately starts the
 * next one with this frame's intent, so mid-step the intent must already be
 * the upcoming segment or corners overshoot.
 */
function autoIntent(): Dir | null {
  const goal = autoGoal;
  if (!goal) return null;
  // Walking toward someone who has since moved: the walk follows them.
  if (goal.npc) {
    const [nx, ny] = goal.npc.actor.occupies();
    if (nx !== goal.cell[0] || ny !== goal.cell[1]) {
      replanAuto();
      if (!autoGoal) return null;
    }
  }
  const [px, py] = player.occupies();
  while (autoPath.length) {
    const head = autoPath[0];
    if (head && head[0] === px && head[1] === py) autoPath.shift();
    else break;
  }
  const next = autoPath[0];
  if (!next) {
    if (player.isMoving) return null; // let the last step land first
    // Hailed mid-stride, they finish the step and wait; talk once they have.
    if (goal.npc?.actor.isMoving) return null;
    cancelAuto();
    if (goal.kind === 'interact') {
      const [tx, ty] = goal.npc ? goal.npc.actor.occupies() : goal.cell;
      if (Math.abs(player.x - tx) + Math.abs(player.y - ty) === 1) faceAndInteract(tx, ty);
      else if (goal.npc) {
        // They wandered off mid-walk; follow up once more.
        autoGoal = goal;
        replanAuto();
      }
    }
    return null;
  }
  const dx = next[0] - px;
  const dy = next[1] - py;
  if (Math.abs(dx) + Math.abs(dy) !== 1) {
    replanAuto();
    return null;
  }
  return dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
}

// ---- the canvas: walk, interact, advance dialogue, rise from a bench ----

// The stage canvas arrives asynchronously and is replaced wholesale if the
// GPU device is ever lost; pointer bindings follow each new canvas.
stage.withCanvas(bindPointer);

function bindPointer(glCanvas: HTMLCanvasElement) {
glCanvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  if (textbox.isOpen) {
    // While choices are on screen a click must land on a row, not fall
    // through to "pick whatever the cursor happens to be on".
    if (choicesEl.childElementCount > 0 && !textbox.isTyping) return;
    textbox.onAction();
    return;
  }
  if (mode !== 'play' || warp || celebrateT > 0) return;
  if (pauseMenu.isOpen || journalUI.isOpen || anyGameOpen() || uiCardOpen() || title.letterOpen || albumUI.isOpen || chapterClose.isOpen) return;
  if (sitting) {
    standUp();
    return;
  }
  if (player.frozen) return;
  // An extra tap after the last line is not a walk order.
  if (afterTalkHush()) return;
  // Nor is a tap where the textbox just was: tapping through the last lines
  // at a reading pace, the next tap came 700ms on and walked the player
  // eight tiles toward the bottom edge.
  if (onTextboxThatWas(e.clientX, e.clientY)) return;
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const tx = Math.floor(wx / TILE);
  const ty = Math.floor(wy / TILE);
  if (map.inBounds(tx, ty)) requestMove(tx, ty, villagerAtPoint(wx, wy));
});

// Cursor affordance: a pointer over anything the action button would engage.
glCanvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  let cursor = 'default';
  if (textbox.isOpen) {
    cursor = 'pointer';
  } else if (
    mode === 'play' && !player.frozen && !warp &&
    !pauseMenu.isOpen && !journalUI.isOpen && !anyGameOpen() && !uiCardOpen() && !albumUI.isOpen
  ) {
    const [wx, wy] = screenToWorld(e.clientX, e.clientY);
    const tx = Math.floor(wx / TILE);
    const ty = Math.floor(wy / TILE);
    if (map.inBounds(tx, ty) && (villagerAtPoint(wx, wy) || interactableAt(tx, ty))) cursor = 'pointer';
  }
  if (glCanvas.style.cursor !== cursor) glCanvas.style.cursor = cursor;
});
}

// ---- menu steering: drive each component's own cursor to the hovered row ----
//
// Two pointer worlds, one contract. A mouse hovers first, so mouseover steers
// (with the select sound) and click activates. A finger cannot hover: the
// browser replays mouseover just before click, the steer re-renders the menu,
// and the click hit-tests a rebuilt DOM, landing wrong or vanishing. Touch
// therefore runs through onTouchTap (target taken at pointerdown, action at
// pointerup, compat chain suppressed), and every mouseover/click handler
// below ignores events while touchActive(). See src/ui/pointer.ts.

/**
 * True while a menu card is still sliding in. A finger aimed at where the
 * card is arriving must not be read as a backdrop tap: mid-entrance the
 * card has not reached the touched point yet, and closing the menu for it
 * is exactly the misfire being fixed. Mouse clicks are unaffected.
 */
function entranceRunning(root: HTMLElement, cardSel: string): boolean {
  const card = root.querySelector(cardSel);
  if (!card || typeof card.getAnimations !== 'function') return false;
  return card.getAnimations().some((a) => a.playState !== 'finished');
}

// A keyboard re-render puts a fresh element under a resting pointer and the
// browser re-fires mouseover at the exact same coordinates, which snapped the
// cursor back to the hovered row and made arrow keys feel dead until the
// mouse moved. An echo carries the same pixel; real hovering does not.
let lastHoverX = -9;
let lastHoverY = -9;
function hoverEcho(e: MouseEvent): boolean {
  if (e.clientX === lastHoverX && e.clientY === lastHoverY) return true;
  lastHoverX = e.clientX;
  lastHoverY = e.clientY;
  return false;
}

/**
 * Move a menu's selection to the given row using its public onDir, reading
 * the current position straight from the rendered classes ('sel' or 'on').
 * Returns true when the cursor actually moved.
 */
function steerTo(
  root: HTMLElement,
  selector: string,
  targetEl: Element,
  onDir: (d: Dir) => void,
  axis: 'v' | 'h' = 'v',
): boolean {
  const rows = [...root.querySelectorAll(selector)];
  const target = rows.indexOf(targetEl);
  const cur = rows.findIndex((r) => r.classList.contains('sel') || r.classList.contains('on'));
  if (target < 0 || cur < 0 || target === cur) return false;
  const n = rows.length;
  const fwd = (target - cur + n) % n;
  const [plus, minus]: [Dir, Dir] = axis === 'v' ? ['down', 'up'] : ['right', 'left'];
  if (fwd <= n - fwd) for (let i = 0; i < fwd; i++) onDir(plus);
  else for (let i = 0; i < n - fwd; i++) onDir(minus);
  return true;
}

// ---- dialogue: click advances, choice rows hover-select and click-confirm ----

const tbRoot = $('textbox');
tbRoot.addEventListener('pointerdown', (e) => {
  if (!textbox.isOpen || e.button !== 0) return;
  e.preventDefault();
  // Remember where the words are while they are being tapped; see onTextboxThatWas.
  const r = tbRoot.getBoundingClientRect();
  if (r.height > 0) textboxWas = r;
  const row = (e.target as HTMLElement).closest('.tb-choice');
  if (row) {
    steerTo(choicesEl, '.tb-choice', row, (d) => textbox.onDir(d));
    textbox.onAction();
    return;
  }
  if (choicesEl.childElementCount > 0 && !textbox.isTyping) return;
  textbox.onAction();
});
tbRoot.addEventListener('mouseover', (e) => {
  if (touchActive() || hoverEcho(e)) return;
  if (!textbox.isOpen) return;
  const row = (e.target as HTMLElement).closest('.tb-choice');
  if (row && steerTo(choicesEl, '.tb-choice', row, (d) => textbox.onDir(d))) audio.select();
});

// ---- title: hover moves the hand, click chooses ----

const titleRoot = $('title');
function titleTap(target: HTMLElement) {
  const opt = target.closest('.t-opt');
  if (!opt) return;
  steerTo(titleRoot, '.t-opt', opt, (d) => title.onDir(d));
  titleActivate();
}
titleRoot.addEventListener('click', (e) => {
  if (touchActive() || !title.titleOpen) return;
  titleTap(e.target as HTMLElement);
});
onTouchTap(titleRoot, () => title.titleOpen, (t) => titleTap(t));
titleRoot.addEventListener('mouseover', (e) => {
  if (touchActive() || hoverEcho(e)) return;
  if (!title.titleOpen) return;
  const opt = (e.target as HTMLElement).closest('.t-opt');
  if (opt && steerTo(titleRoot, '.t-opt', opt, (d) => title.onDir(d))) audio.select();
});

$('letter').addEventListener('click', () => {
  if (touchActive()) return;
  if (title.letterOpen) letterAdvance();
});
onTouchTap($('letter'), () => title.letterOpen, () => letterAdvance());

$('chapterclose').addEventListener('click', () => {
  if (touchActive()) return;
  if (chapterClose.isOpen) {
    audio.pageFlip();
    chapterClose.close();
  }
});
onTouchTap($('chapterclose'), () => chapterClose.isOpen, () => {
  audio.pageFlip();
  chapterClose.close();
});

// ---- pause: options click, settings rows adjust by clicked half ----

const pauseRoot = $('pause');
function pauseTap(t: HTMLElement, clientX: number, viaTouch: boolean) {
  const opt = t.closest('.p-opt');
  if (opt) {
    steerTo(pauseRoot, '.p-opt', opt, (d) => pauseMenu.onDir(d));
    audio.confirm();
    pauseMenu.onAction();
    return;
  }
  const inSettings = !!pauseRoot.querySelector('.p-settings');
  const row = t.closest('.p-row');
  if (inSettings && row) {
    // Left half of the row nudges down, right half nudges up: the same
    // gesture the arrow keys make, aimed with the pointer.
    const r = row.getBoundingClientRect();
    steerTo(pauseRoot, '.p-row', row, (d) => pauseMenu.onDir(d));
    pauseMenu.onDir(clientX >= r.left + r.width / 2 ? 'right' : 'left');
    audio.select();
    return;
  }
  if (!t.closest('.p-card')) {
    // A finger that lands beside a card still sliding in was aiming at the
    // card, not at the dark; only a settled backdrop tap means "back".
    if (viaTouch && entranceRunning(pauseRoot, '.p-card')) return;
    pauseMenu.onBack();
    audio.back();
    return;
  }
  if (!pauseRoot.querySelector('.p-menu') && !inSettings) {
    // Help and credits: any click on the page turns back.
    pauseMenu.onAction();
    audio.back();
  }
}
pauseRoot.addEventListener('click', (e) => {
  if (touchActive() || !pauseMenu.isOpen) return;
  pauseTap(e.target as HTMLElement, e.clientX, false);
});
onTouchTap(pauseRoot, () => pauseMenu.isOpen, (t, x) => pauseTap(t, x, true));
pauseRoot.addEventListener('mouseover', (e) => {
  if (touchActive() || hoverEcho(e)) return;
  if (!pauseMenu.isOpen) return;
  const t = e.target as HTMLElement;
  const opt = t.closest('.p-opt');
  if (opt) {
    if (steerTo(pauseRoot, '.p-opt', opt, (d) => pauseMenu.onDir(d))) audio.select();
    return;
  }
  const row = t.closest('.p-row');
  if (row && pauseRoot.querySelector('.p-settings')) {
    if (steerTo(pauseRoot, '.p-row', row, (d) => pauseMenu.onDir(d))) audio.select();
  }
});

// ---- journal: tabs click, entries hover/click, wheel turns pages ----

const journalRoot = $('journal');
function journalTap(t: HTMLElement, viaTouch: boolean) {
  if (t.closest('.j-close')) {
    journalUI.close();
    audio.pageFlip();
    return;
  }
  const tab = t.closest('.j-tab');
  if (tab) {
    if (steerTo(journalRoot, '.j-tab', tab, (d) => journalUI.onDir(d), 'h')) audio.select();
    return;
  }
  const item = t.closest('.j-item');
  if (item) {
    if (steerTo(journalRoot, '.j-item', item, (d) => journalUI.onDir(d))) audio.select();
    return;
  }
  if (!t.closest('.j-book')) {
    // Same entrance rule as the pause card: while the book is still
    // arriving, a finger beside it was aiming at the book.
    if (viaTouch && entranceRunning(journalRoot, '.j-book')) return;
    journalUI.close();
    audio.pageFlip();
  }
}
journalRoot.addEventListener('click', (e) => {
  if (touchActive() || !journalUI.isOpen) return;
  journalTap(e.target as HTMLElement, false);
});
onTouchTap(journalRoot, () => journalUI.isOpen, (t) => journalTap(t, true));
journalRoot.addEventListener('mouseover', (e) => {
  if (touchActive() || hoverEcho(e)) return;
  if (!journalUI.isOpen) return;
  const item = (e.target as HTMLElement).closest('.j-item');
  if (item && steerTo(journalRoot, '.j-item', item, (d) => journalUI.onDir(d))) audio.select();
});
journalRoot.addEventListener(
  'wheel',
  (e) => {
    if (!journalUI.isOpen) return;
    const t = e.target as HTMLElement;
    // The route and task pages scroll natively; entry lists page by cursor.
    if (t.closest('.j-route') || t.closest('.j-tasks')) return;
    e.preventDefault();
    journalUI.onDir(e.deltaY > 0 ? 'down' : 'up');
  },
  { passive: false },
);

// ---- minigame panels: the center acts, the edges steer all four ways ----
//
// The old scheme was three vertical bands, so a mouse could never send Up or
// Down and the loom was unplayable by pointer. Now the card is a compass:
// whichever edge band the click lands in wins by depth, the middle acts.

function attachPanelPointer(
  root: HTMLElement,
  panel: { readonly isOpen: boolean; onDir(d: Dir): void; onAction(): void },
) {
  root.addEventListener('pointerdown', (e) => {
    if (!panel.isOpen || e.button !== 0) return;
    e.preventDefault();
    const card = root.querySelector('.w-panel') ?? root;
    const r = card.getBoundingClientRect();
    const fromLeft = (e.clientX - r.left) / r.width;
    const fromTop = (e.clientY - r.top) / r.height;
    const dx = fromLeft - 0.5;
    const dy = fromTop - 0.5;
    const EDGE = 1 / 6; // beyond a third from center in either axis steers
    if (Math.abs(dx) < EDGE + 0.0 && Math.abs(dy) < EDGE) {
      panel.onAction();
      return;
    }
    if (Math.abs(dx) >= Math.abs(dy)) panel.onDir(dx < 0 ? 'left' : 'right');
    else panel.onDir(dy < 0 ? 'up' : 'down');
  });
}
for (const g of games) attachPanelPointer(g.root, g.panel);
// The album turns pages by the same thirds; the middle keeps going, and past
// the last spread it hands the album back.
attachPanelPointer($('album'), albumUI);

// The how-to card and the pause strip also answer the mouse: hover to hold a
// row, click to take it. Keyboard and pointer stay in step through the same
// selection index each render reads.
howtoEl.addEventListener('pointermove', (e) => {
  // A touch tap fires pointermove before pointerdown; steering there would
  // re-render the card under the finger. Fingers act on pointerdown alone.
  if (e.pointerType === 'touch') return;
  const row = (e.target as HTMLElement).closest('[data-ht]');
  if (!row) return;
  const i = Number((row as HTMLElement).dataset.ht);
  if (i !== howtoSel) {
    howtoSel = i;
    renderHowto();
    audio.select();
  }
});
howtoEl.addEventListener('pointerdown', (e) => {
  const row = (e.target as HTMLElement).closest('[data-ht]');
  if (!row) return;
  e.preventDefault();
  if (howtoInGrace()) return; // the double tap that closed the panel, still landing
  howtoSel = Number((row as HTMLElement).dataset.ht);
  audio.confirm();
  closeHowto(howtoOpts[howtoSel] ?? null);
});
stripEl.addEventListener('pointermove', (e) => {
  // Same guard as the how-to card: no steer-and-rebuild under a tap.
  if (e.pointerType === 'touch') return;
  const row = (e.target as HTMLElement).closest('[data-ht]');
  if (!row) return;
  const i = Number((row as HTMLElement).dataset.ht);
  if (i !== stripSel) {
    stripSel = i;
    renderStrip();
    audio.select();
  }
});
stripEl.addEventListener('pointerdown', (e) => {
  const row = (e.target as HTMLElement).closest('[data-ht]');
  if (!row) return;
  e.preventDefault();
  stripSel = Number((row as HTMLElement).dataset.ht);
  audio.confirm();
  stripActivate();
});

// ---- the touch pad ----
//
// On a touch-first device (coarse pointer, no hover: capability, never UA)
// the pad is simply there from boot; on hybrids it waits for the first
// finger. Every frame, syncVpad() steps it out of the light whenever a paper
// overlay is up: those are all tap-first, and the pad was sitting on the
// dialogue text. It stays for free roam and for the minigame panels, which
// its directions and action drive.

const vpad = document.createElement('div');
vpad.id = 'vpad';
vpad.hidden = true;
vpad.innerHTML = `
  <div class="vp-pad">
    <button class="vp-b" data-dir="up" aria-label="walk up">&#9650;</button>
    <button class="vp-b" data-dir="left" aria-label="walk left">&#9664;</button>
    <button class="vp-b" data-dir="right" aria-label="walk right">&#9654;</button>
    <button class="vp-b" data-dir="down" aria-label="walk down">&#9660;</button>
  </div>
  <div class="vp-side">
    <button class="vp-b vp-small" data-act="thread" aria-label="ask the thread which way" hidden>&#10547;</button>
    <button class="vp-b vp-small" data-act="journal" aria-label="journal">&#9998;</button>
    <button class="vp-b vp-small" data-act="pause" aria-label="pause / back">&#9776;</button>
    <button class="vp-b vp-act" data-act="action" aria-label="talk / touch">&#10022;</button>
  </div>`;
frameEl.appendChild(vpad);
const threadBtn = vpad.querySelector<HTMLElement>('[data-act="thread"]')!;
// The floating stick shares the pad's lower-left with the button cluster;
// the Walking setting decides which of the two is present via a body class,
// so neither this file nor the pause menu ever call each other about it.
const stick = makeStick(
  vpad,
  (d) => input.holdDir(d),
  (d) => input.releaseDir(d),
  () => audio.ensure(),
);

if (isCoarseTouch()) {
  vpad.hidden = false;
} else {
  const revealVpad = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    vpad.hidden = false;
    window.removeEventListener('pointerdown', revealVpad, true);
  };
  window.addEventListener('pointerdown', revealVpad, true);
}

/**
 * Once per frame: the pad belongs to the world and the minigame panels; any
 * paper overlay (dialogue, journal, pause, cards, title, album) is tap-first
 * and the pad only obscured it. The thread button appears with the band,
 * standing in for N exactly as the pause button stands in for Escape.
 */
function syncVpad() {
  if (vpad.hidden) return;
  const wanted =
    mode === 'play' &&
    !textbox.isOpen && !journalUI.isOpen && !pauseMenu.isOpen && !albumUI.isOpen &&
    !chapterClose.isOpen && !title.letterOpen && !uiCardOpen();
  vpad.classList.toggle('vp-quiet', !wanted);
  const inGame = anyGameOpen();
  if (vpad.classList.contains('vp-game') !== inGame) vpad.classList.toggle('vp-game', inGame);
  // A drag caught mid-air by an opening overlay must not keep walking
  // under the paper, nor resume by itself when the paper lifts.
  if (!wanted) stick.calm();
  const band = state.has('keepsake.band');
  if (threadBtn.hidden === band) threadBtn.hidden = !band;
}

for (const btn of vpad.querySelectorAll<HTMLElement>('.vp-b')) {
  const dir = btn.dataset.dir as Dir | undefined;
  const act = btn.dataset.act;
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault(); // no focus ring, no synthesized mouse events
    audio.ensure();
    if (dir) {
      try {
        btn.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic events have no active pointer; the hold still works.
      }
      input.holdDir(dir);
    } else if (act === 'action') {
      input.injectAction();
    } else if (act === 'journal') {
      input.injectJournal();
    } else if (act === 'pause') {
      input.injectPause();
    } else if (act === 'thread') {
      // The band's N key, spoken through the same keyboard path so the
      // engine's edge handling stays the single source of truth.
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyN' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyN' }));
    }
  });
  if (dir) {
    const release = () => input.releaseDir(dir);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
  }
}

// The sideways offer waits for a tap in the world: on the cover or a card it
// ate Begin, then the name card's "write it down". Its pin joins the column.
initRotateNudge({
  canOffer: () =>
    mode === 'play' && !warp && !textbox.isOpen && !journalUI.isOpen && !pauseMenu.isOpen &&
    !albumUI.isOpen && !chapterClose.isOpen && !title.letterOpen && !uiCardOpen() && !anyGameOpen(),
  pinHost: vpad.querySelector<HTMLElement>('.vp-side') ?? undefined,
});

// ---------------------------------------------------------------- start

// `?skiptitle=1` drops straight into play for quick dev iteration.
if (dev.enabled && new URLSearchParams(location.search).has('skiptitle')) {
  beginPlay(!state.has('intro.done'));
} else {
  title.showTitle(state.hasSave());
}

/**
 * The cheat desk. Dev builds only. Everything here exists so the game can be
 * inspected out of order: eleven chapters is a long way to walk to check one
 * roof at dusk. Type `soup.help()` in the console.
 */
function installCheats() {
  if (!dev.enabled) return;

  /**
   * Chapter order, with the flag that says you got there, where it is, and
   * the flag that says it is finished. Flag numbers follow authorship, not
   * play order (Delhi is c11, wedged between Kerala's c6 and Zanzibar's c7),
   * so each completion is spelled out rather than derived from `n`: deriving
   * it once handed Zanzibar c8.complete, Sicily c9.complete, and so on for
   * every chapter after Delhi. The Return has no complete flag; it ends.
   */
  const CHAPTERS_CHEAT: { n: number; id: string; map: string; flag: string; complete?: string }[] = [
    { n: 1, id: 'chaska-pampa', map: 'village', flag: 'intro.done', complete: 'story.complete' },
    { n: 2, id: 'la-caleta', map: 'la-caleta', flag: 'c2.arrived', complete: 'c2.complete' },
    { n: 3, id: 'crossing', map: 'ship', flag: 'c3.arrived', complete: 'c3.complete' },
    { n: 4, id: 'shionoura', map: 'shionoura', flag: 'c4.arrived', complete: 'c4.complete' },
    { n: 5, id: 'busan', map: 'busan', flag: 'c5.arrived', complete: 'c5.complete' },
    { n: 6, id: 'kerala', map: 'kerala', flag: 'c6.arrived', complete: 'c6.complete' },
    { n: 7, id: 'delhi', map: 'delhi', flag: 'c11.arrived', complete: 'c11.complete' },
    { n: 8, id: 'zanzibar', map: 'zanzibar', flag: 'c7.arrived', complete: 'c7.complete' },
    { n: 9, id: 'sicily', map: 'sicily', flag: 'c8.arrived', complete: 'c8.complete' },
    { n: 10, id: 'oaxaca', map: 'oaxaca', flag: 'c9.arrived', complete: 'c9.complete' },
    { n: 11, id: 'home', map: 'la-caleta', flag: 'c10.arrived' },
  ];
  /**
   * What a real journey carries out of a chapter besides its two flags: the
   * things later chapters gate on. Skipping Ch'aska Pampa without the band
   * and a moved Paca, or Kerala with Joseph's letter still undelivered, left
   * soup.go() standing in a world no player could reach.
   */
  const CARRY: Record<number, { set?: string[]; clear?: string[] }> = {
    1: { set: ['pallay.done', 'keepsake.band', 'paca.moved', 'her.zoila'] },
    3: { set: ['joseph.letter'] },
    // Gong's stamped berth; without it a skipped Busan reopens his window.
    5: { set: ['c5.berth'] },
    6: { set: ['c6.letter.delivered'], clear: ['joseph.letter'] },
  };
  /** Mark chapter `c` walked: its flags and whatever it hands onward. */
  const walk = (c: (typeof CHAPTERS_CHEAT)[number]) => {
    state.set(c.flag);
    if (c.complete) state.set(c.complete);
    for (const f of CARRY[c.n]?.set ?? []) state.set(f);
    for (const f of CARRY[c.n]?.clear ?? []) state.clearFlag(f);
  };

  const jump = (mapId: string, at?: [number, number]) => {
    const dest = maps[mapId];
    if (!dest) return `no such map: ${mapId}`;
    // startWarp drops the request while a transition is running; without this
    // check the desk would still print the arrow and the caller would believe
    // it. A dropped teleport that reports success cost an evening once.
    if (warp) return `mid-transition; wait for the wipe, then warp again`;
    const spawn: [number, number] = at ?? (dest.spawn as [number, number]);
    if (mode !== 'play') {
      title.hideTitle();
      title.hideLetter();
      beginPlay(false);
    }
    startWarp({ at: [player.x, player.y], type: 'door', to: mapId, spawn, facing: dest.spawnFacing });
    return `-> ${mapId} at ${spawn[0]},${spawn[1]}`;
  };

  const api = {
    /** Everything this desk can do. */
    help() {
      console.log(
        [
          'soup.go(n | id)      jump to a chapter, granting everything before it',
          'soup.warp(map, x, y) teleport to any map by id',
          'soup.maps()          list every map id',
          'soup.chapters()      list chapters with their numbers',
          'soup.flag(f, on?)    set or clear one story flag',
          'soup.flags(sub?)     list flags currently set, optionally filtered',
          'soup.games()         list every minigame and its start flag',
          'soup.play(flag)      open a minigame right now',
          'soup.replay(flag)    offer its replay card now, hard telling included',
          'soup.panel(flag)     the live panel object, for automation',
          'soup.pages()         fill the journal, every page',
          "soup.page(id)        grant one page properly (soup.flag can't)",
          'soup.perf()          frame costs and a log of every hitch over 14ms',
          'soup.witness()       micro-freezes seen in the player\'s own motion',
          'soup.photos()        grant every photograph Chasca can take',
          'soup.tod(t)          set time of day, 0 dawn, 0.35 day, 0.57 gold, 0.85 night',
          'soup.band()          tie Carmen\'s band on now (unlocks the red thread, N)',
          'soup.thread()        ask the thread right now, exactly like pressing N',
          'soup.glintTune(i,c,g) hurry the band\'s glint: idle, cooldown, grace, seconds',
          'soup.rain(on?)       toggle the monsoon and the sawan rain',
          'soup.end()           set up the endgame at the well',
          'soup.wipe()          erase the save and return to the title',
        ].join('\n'),
      );
      return 'the cheat desk is open';
    },
    chapters: () => CHAPTERS_CHEAT.map((c) => `${c.n}. ${c.id} (${c.map})`),
    maps: () => Object.keys(maps).sort(),
    /** Jump to a chapter, granting every arrival and completion before it. */
    go(which: number | string) {
      const target =
        typeof which === 'number'
          ? CHAPTERS_CHEAT.find((c) => c.n === which)
          : CHAPTERS_CHEAT.find((c) => c.id === which || c.map === which);
      if (!target) return `no such chapter: ${which}. try soup.chapters()`;
      state.set('intro.done');
      // Every chapter BEFORE the target is arrived-at and completed, each
      // with its own flags from the table; the target itself only arrives.
      for (const c of CHAPTERS_CHEAT) {
        if (c.n >= target.n) break;
        walk(c);
      }
      // The target's own arrival narration plays on landing, as in play, and
      // raises its flag itself; only a chapter without one is marked here.
      const arrival = ARRIVALS.find((a) => a.flag === target.flag);
      if (!arrival || arrival.map !== target.map || !state.check(arrival.when)) state.set(target.flag);
      // Chapters skipped over are already celebrated; without this, the
      // next dialogue to end replayed every plate and chapter-close at once.
      resyncCelebrations();
      return jump(target.map);
    },
    warp: (mapId: string, x?: number, y?: number) =>
      jump(mapId, x !== undefined && y !== undefined ? [x, y] : undefined),
    flag(f: string, on = true) {
      if (on) state.set(f);
      else state.clearFlag(f);
      return `${f} = ${on}`;
    },
    /** Flags currently set, read back out of the save the game just wrote
     * (whichever journal on the shelf is open on the table). */
    flags(sub?: string) {
      const set = peekSlot(activeSlot())?.flags ?? [];
      return set.filter((f) => !sub || f.includes(sub)).sort();
    },
    games: () => GAMES.map((g) => `${g.title ?? g.flag}  ->  soup.play('${g.flag}')`),
    play(flag: string) {
      const g = games.find((x) => x.def.flag === flag);
      if (!g) return `no game with start flag ${flag}. try soup.games()`;
      state.set(flag);
      if (textbox.isOpen) return `${flag} armed; it opens when this conversation ends`;
      openPanel(g);
      return `playing ${flag}`;
    },
    /** Offer a game's replay card right now, hard telling included, exactly
     * as a return visit does: the card, then whichever telling you pick. */
    replay(flag: string) {
      const g = games.find((x) => x.def.flag === flag);
      if (!g) return `no game with start flag ${flag}. try soup.games()`;
      state.set('replay.mode');
      state.set(flag);
      showHowto(g);
      return `the card for ${flag} is on the table`;
    },
    /** Where a cell's centre is on screen (client px), for automation that
     * clicks or taps the world the way a player does. */
    screenOf(x: number, y: number) {
      return worldToScreen(x * TILE + TILE / 2, y * TILE + TILE / 2);
    },
    /** Floor cells on this map the thread steps around (under a lamp's head,
     * a tree's crown), as "x,y" strings. */
    overhung() {
      const o = renderer.overhung(map);
      const out: string[] = [];
      o.forEach((v, i) => {
        if (v) out.push(`${i % map.w},${Math.floor(i / map.w)}`);
      });
      return out;
    },
    /** The live panel behind a start flag, for automation that plays it. */
    panel(flag: string) {
      return games.find((x) => x.def.flag === flag)?.panel ?? null;
    },
    pages() {
      for (const e of JOURNAL) state.apply([`journal:${e.id}`]);
      return `${JOURNAL.length} pages filled`;
    },
    /** One page, granted the way play grants it, so rhymes and gates see it.
     * A raw soup.flag('page.x') writes a flag the journal never reads. */
    page(id: string) {
      if (!JOURNAL.some((e) => e.id === id)) return `no such page: ${id}`;
      state.apply([`journal:${id}`]);
      return `page.${id} granted`;
    },
    /** The stutter witness. gapMs far above gameCpuMs points outside the game:
     * an extension, a screen recorder, the display changing refresh rate. */
    perf() {
      const p = (globalThis as unknown as { __soupPerf?: { sample(): unknown } }).__soupPerf;
      return p ? p.sample() : 'perf meter is dev-only';
    },
    /** Micro-freezes the motion witness has seen: when, how many frames the
     * player stood mid-walk, and the frame gaps around it. Normal gaps with
     * a freeze means the sim stopped the player; big gaps mean the browser
     * skipped frames; an empty list while the eye saw stutter points below
     * the browser entirely. */
    witness() {
      const now = performance.now();
      return MW.events.map((e) => ({
        secondsAgo: +((now - e.at) / 1000).toFixed(1),
        frozenFrames: e.frames,
        gapsAroundMs: e.gaps,
        gates: e.gates,
      }));
    },
    photos() {
      // Straight from the album's own list, so a renamed photo cannot leave
      // this desk granting flags nothing reads.
      for (const p of PHOTOS) state.set(p.flag);
      return `${PHOTOS.length} photographs granted`;
    },
    tod(t: number) {
      dayT = Math.max(0, Math.min(0.999, t));
      return `time of day = ${dayT.toFixed(2)}`;
    },
    band() {
      state.set('keepsake.band');
      return 'the band is on your wrist';
    },
    thread() {
      return summonThread() ? 'the thread unspools' : 'the thread rests';
    },
    /** Hurry the band's glint so automation does not wait out real minutes. */
    glintTune(taskIdleS = 2, cooldownS = 5, sessionGraceS = 0) {
      GLINT.taskIdleS = taskIdleS;
      GLINT.cooldownS = cooldownS;
      GLINT.sessionGraceS = sessionGraceS;
      return `glint: idle ${taskIdleS}s, cooldown ${cooldownS}s, grace ${sessionGraceS}s`;
    },
    rain(on = true) {
      for (const f of ['c6.rain', 'c11.rain']) {
        if (on) state.set(f);
        else state.clearFlag(f);
      }
      return on ? 'it is raining' : 'the rain has stopped';
    },
    end() {
      api.pages();
      api.photos();
      for (const c of CHAPTERS_CHEAT) walk(c);
      // Every homecoming the well waits on: the reunions, the album, and
      // Doña Carmen's word, so the last page is one Space away.
      for (const f of [
        'c10.marisol.seen', 'c10.rosa.seen', 'c10.aurelio.seen', 'c10.carmen.seen',
        'c10.pilar.seen', 'c10.album.seen', 'c10.well.called', 'c10.carmen.her', 'c10.apacheta.done',
      ]) state.set(f);
      // The endgame has its own authored ending; nothing here celebrates.
      resyncCelebrations();
      return jump('village');
    },
    wipe() {
      state.reset();
      location.reload();
      return 'erased';
    },
  };

  (globalThis as unknown as { soup: typeof api }).soup = api;
  console.log('%csoup cheat desk ready. soup.help() for the list.', 'color:#c8a55b');
}
installCheats();

// Dev-only: lets automation advance the simulation synchronously, independent
// of rAF (which Chrome pauses entirely in hidden tabs).
dev.attachCommands((frames) => {
  for (let i = 0; i < frames; i++) update(1 / 60);
  render();
});

startLoop(update, render);

// The loader in index.html has been covering the wait since first paint; lift
// it once the world has drawn a real frame beneath it.
requestAnimationFrame(() => requestAnimationFrame(() => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  loader.classList.add('done');
  setTimeout(() => loader.remove(), 700);
}));
