import { Actor } from './engine/actor';
import { AudioBus } from './engine/audio';
import { Camera } from './engine/camera';
import { STEP_DUR, TILE, TURN_DELAY, VIEW_H, VIEW_W } from './engine/config';
import { DevBridge } from './engine/devbridge';
import { TileMap, stepFrom, type TriggerDef } from './engine/grid';
import { Input, type Dir } from './engine/input';
import { startLoop } from './engine/loop';
import { Renderer, type Sprite } from './engine/renderer';
import { GameState } from './engine/state';
import { PLAYER_LOOK, makePortrait, makeSheet } from './art/character';
import { cellHash } from './art/pix';
import { GLOW_KINDS, WINDOW_OFFSETS } from './art/sets';
import { makeDogSheet, makeLlamaSheet, makeMoundSheet } from './art/animals';
import { Textbox } from './ui/textbox';
import { JournalUI } from './ui/journal';
import { Toasts } from './ui/toast';
import { NamingCard, TitleScreen } from './ui/title';
import { PauseMenu } from './ui/pause';
import { AlbumUI } from './ui/album';
import { PixiStage, type LightSpec } from './render/stage';
import {
  ARRIVALS,
  COMPLETIONS,
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
import { ROUTE } from './content/route';
import type { NpcDef } from './content/schema';
import { DELHI_STATIONS } from './content/delhi/stations';
import { SHIONOURA_STATIONS } from './content/shionoura/stations';

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
console.info('[soup] boot: stage ready');
const debugEl = $('debug') as HTMLPreElement;
const input = new Input();
input.attach();
const dev = new DevBridge();
const audio = new AudioBus();

// Browsers require a user gesture before audio; catch the first one.
window.addEventListener('keydown', () => audio.ensure(), { once: true });
window.addEventListener('pointerdown', () => audio.ensure(), { once: true });

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
  player.placeAt(state.place.x, state.place.y, state.place.dir as import('./engine/input').Dir);
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
    village.setObject(gx, gy, { t: 'gateOpen' });
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
const fadeEl = $('fade');
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
);
const journalUI = new JournalUI($('journal'), JOURNAL, TASKS, ROUTE, state);
const title = new TitleScreen($('title'), $('letter'));
const naming = new NamingCard($('cc-card'));
const albumUI = new AlbumUI($('album'), state, audio);
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
  return { def: g, root, panel: g.make(root, audio) };
});
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
let stripFor: GameEntry | null = null;
let stripSel = 1;
const STRIP_OPTS = ['Start over', 'Keep at it', 'Step away'];

const uiCardOpen = () => !howtoEl.hidden || !stripEl.hidden;

/** A game whose start flag is raised but whose panel is not yet on screen. */
function pendingGame(): GameEntry | null {
  return games.find((g) => state.has(g.def.flag) && !g.panel.isOpen) ?? null;
}

/** Open a panel and route its completion: story narration, or replay joy. */
function openPanel(g: GameEntry) {
  player.frozen = true;
  g.panel.open(() => {
    player.frozen = false;
    if (state.has('replay.mode')) {
      // A return visit: no narration to repeat, just the doing of the thing.
      state.clearFlag('replay.mode');
      state.clearFlag(g.def.flag);
      toasts.show('Just for the joy of it.');
      audio.chime();
      const [px, py] = player.renderPos();
      renderer.burst(px + TILE / 2, py + 2, 'sparkle', ['#f2e6d0', '#d9a441']);
      return;
    }
    startNarration(g.def.doneNode);
  });
}

function renderHowto() {
  const g = howtoFor;
  if (!g) return;
  const lines = (g.def.howTo ?? [])
    .map((l) => `<div class="ht-line">${l}</div>`)
    .join('');
  const replaying = state.has('replay.mode');
  howtoEl.innerHTML = `
    <div class="ht-card">
      <div class="ht-kicker">hands, not homework</div>
      <div class="ht-title">${g.def.title ?? 'Something to try'}</div>
      ${replaying ? '<div class="ht-replay">Again, for the joy of it.</div>' : ''}
      ${lines ? `<div class="ht-lines">${lines}</div>` : ''}
      <div class="ht-opts">
        ${['Begin', 'Not yet']
          .map((t, i) => `<div class="ht-opt${i === howtoSel ? ' sel' : ''}" data-ht="${i}">${i === howtoSel ? '&#9656;&nbsp;' : ''}${t}</div>`)
          .join('')}
      </div>
      <div class="ht-keys">Space to begin &middot; Esc, not yet</div>
    </div>`;
}

function showHowto(g: GameEntry) {
  howtoFor = g;
  howtoSel = 0;
  player.frozen = true;
  howtoEl.hidden = false;
  renderHowto();
  audio.pageFlip();
}

/** Close the card: into the panel, or back to the world with the flag kept. */
function closeHowto(begin: boolean) {
  const g = howtoFor;
  howtoEl.hidden = true;
  howtoFor = null;
  if (!g) return;
  if (begin) openPanel(g);
  else player.frozen = false; // the start flag stays; the offer keeps
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
    // Unfinished is allowed. The start flag stays set, so the how-to card
    // re-offers whenever the player is ready again.
    g.root.hidden = true;
    player.frozen = false;
  }
  // "Keep at it": the panel is still there, exactly as it was.
}

/** The HUD chip always shows the most pressing open thread, shortened. */
function refreshTaskChip() {
  const top = journalUI.activeTasks()[0];
  // The chip shows whole thoughts; CSS clamps politely at two lines.
  if (top && !state.has('story.end')) {
    errandEl.textContent = top;
    errandEl.hidden = false;
  } else {
    errandEl.hidden = true;
  }
}

state.on('journal', (id) => {
  const entry = JOURNAL_BY_ID.get(id);
  toasts.show(`✎ a page fills: ${entry?.title ?? id}`);
  audio.chime();
  {
    const [px, py] = player.renderPos();
    renderer.burst(px + TILE / 2, py + 2, 'sparkle', ['#f2e6d0', '#d9a441']);
  }
  if (!state.has('hint.journal')) {
    state.set('hint.journal');
    toasts.show('press J to open the journal');
  }
  // Did this page complete a rhyme? Then Nani noticed it first, in 1974.
  const rhymed = JOURNAL.some(
    (e) =>
      e.rhyme &&
      state.hasPage(e.id) &&
      state.hasPage(e.rhyme.with) &&
      (e.id === id || e.rhyme.with === id),
  );
  if (rhymed) toasts.show('✦ a margin note of Nani’s has become legible');
});

/** Mail raised by a `letter:` effect opens once the conversation ends. */
let pendingLetter: string | null = null;
state.on('letter', (id) => {
  pendingLetter = id;
});
state.on('changed', () => {
  applyDressings();
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
function showPlate(text: string, holdMs = 4200) {
  for (const t of plateTimers) clearTimeout(t);
  plateEl.textContent = text;
  plateEl.classList.remove('show');
  plateTimers = [
    window.setTimeout(() => plateEl.classList.add('show'), 350),
    window.setTimeout(() => plateEl.classList.remove('show'), holdMs),
  ];
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
  /** 1 fully present, 0 gone for the night. Eased at FADE_SPEED per second. */
  fade: number;
  /** Per-villager timing jitter so nobody moves in lockstep. Timing only. */
  jitter: number;
  baseSheet: HTMLCanvasElement;
  fadeSheet: HTMLCanvasElement | null;
};

function sheetFor(def: NpcDef): HTMLCanvasElement {
  if (def.sprite === 'dog') return makeDogSheet();
  if (def.sprite === 'llama') return makeLlamaSheet('#e8ddc8');
  if (def.sprite === 'llamaBrown') return makeLlamaSheet('#9c6b42');
  return makeSheet(def.look);
}

const villagers: Villager[] = NPCS.map((def) => {
  const sheet = sheetFor(def);
  return {
    def,
    actor: new Actor(def.pos[0], def.pos[1], 'down'),
    sheet,
    rig: (def.sprite ? 'animal' : 'human') as 'animal' | 'human',
    portrait: def.sprite ? null : makePortrait(def.look),
    think: Math.random() * 2,
    want: null,
    seat: null,
    glow: null,
    keeper: true,
    seated: false,
    fade: 1,
    jitter: Math.random(),
    baseSheet: sheet,
    fadeSheet: null,
  };
});

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
    const gone = !v.keeper && !engaged && !erranded.has(v) && nk > fadeAt(v);
    const target = gone ? 0 : 1;
    if (v.fade !== target) {
      v.fade = target > v.fade ? Math.min(target, v.fade + dt * FADE_SPEED) : Math.max(target, v.fade - dt * FADE_SPEED);
      applyFade(v);
    }
    const duskish = nk >= sitAt(v) && nk < fadeAt(v);
    if (v.def.map !== map.id && !v.actor.frozen) {
      // Unobserved villagers teleport through their evening.
      if (v.seat && duskish && !v.seated) {
        v.actor.placeAt(v.seat.at[0], v.seat.at[1], v.seat.dir);
        v.actor.pose = 'sit';
        v.seated = true;
      } else if (v.seated && !duskish) {
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
  const free = b && !b.v.actor.frozen && b.v !== talkingTo && state.check(b.v.def.when);
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

function updateStations(dt: number) {
  const nk = nightLevel(dayT);
  for (const st of stationsRt) {
    if (st.def.mode === 'gather') updateGatherStation(st, nk, dt);
    else updateRoundStation(st, nk, dt);
  }
  // Tended lamps ease up to their evening glow: a wick taking, not a switch.
  for (const e of stationLampEase.values()) {
    if (e.lit && e.k < 1) e.k = Math.min(1, e.k + dt * 1.5);
  }
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
  if (stationControls(v)) return;

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
  const leash = (x: number, y: number) => x < hx - r || x > hx + r || y < hy - r || y > hy + r;
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

/** The map swap at the dark middle of any transition. */
function arriveAt(trig: TriggerDef & { type: 'door' }) {
  const dest = maps[trig.to];
  if (!dest) return;
  map = dest;
  player.placeAt(trig.spawn[0], trig.spawn[1], trig.facing ?? 'down');
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
  camera.resetLead();
  const [px, py] = player.renderPos();
  camera.follow(px, py, map.w, map.h);
  state.place = { map: map.id, x: player.x, y: player.y, dir: player.dir };
  state.save();
  showPlate(map.name, 2600);
  audio.setScene(sceneFor(map.id));
  audio.setRegion(regionFor(map.id));
  renderer.setMood(moodFor(map.id));
  renderer.setRaining(rainingOn(map.id));
  renderer.setFires((fireCells[map.id] ?? []).map(([fx, fy]) => [fx, fy]));
  stage.setAmbient(AMBIENT[moodFor(map.id)] ?? 0xfdf6ea);
}

function endWarp() {
  warp = null;
  player.frozen = false;
  fadeEl.style.opacity = '0';
  journeyEl.classList.remove('show');
  setIris(1);
  // First footfall in a new chapter gets its narration.
  const arr = ARRIVALS.find((a) => a.map === map.id && !state.has(a.flag) && state.check(a.when));
  if (arr && !textbox.isOpen) startNarration(arr.node);
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

function endDialogue() {
  player.frozen = false;
  // The intro has let go; now the village may introduce itself.
  if (pendingWelcome) setTimeout(playWelcome, 420);
  if (talkingTo) {
    talkingTo.actor.frozen = false;
    // A seated villager turned to face the player; they settle back afterward
    // (a stationed sitter faces their row, a bench sitter faces their bench).
    if (talkingTo.seated) {
      const dir = stationSeatDir(talkingTo) ?? talkingTo.seat?.dir;
      if (dir) talkingTo.actor.face(dir);
    }
  }
  talkingTo = null;

  // Mail handed over during the conversation unfolds now.
  if (pendingLetter) {
    const def = pickLetter(LETTERS, pendingLetter, (w) => state.check(w));
    pendingLetter = null;
    if (def) {
      player.frozen = true;
      audio.pageFlip();
      title.showLetter({ from: def.from, body: def.body });
      return;
    }
  }

  // Chasca's album unfolds once the conversation has stepped back from it.
  if (state.has('album.open')) {
    state.clearFlag('album.open');
    player.frozen = true;
    audio.pageFlip();
    albumUI.open(() => {
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
  {
    // A conversation raised a game's start flag: the how-to card goes first,
    // so the hands know what they are about to do (and may decline, kindly).
    const g = pendingGame();
    if (g) {
      showHowto(g);
      return;
    }
  }
  if (takeTravel()) return;
  if (state.has('photo.flash')) {
    state.clearFlag('photo.flash');
    flashT = 0.5;
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
    showPlate('CHAPTER ONE · COMPLETE', 5200);
    toasts.show('✦ the journal remembers her now');
    toasts.show('the east gate stands open');
  }
  for (const c of COMPLETIONS) {
    if (state.has(c.flag) && !celebratedFlags.has(c.flag)) {
      celebratedFlags.add(c.flag);
      showPlate(c.plate, 5200);
      for (const t of c.toasts) toasts.show(t);
      celebrate();
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

  const entry = v.def.entry.find((e) => state.check(e.when));
  if (!entry) return;
  const [ox, oy] = v.actor.occupies();
  v.actor.placeAt(ox, oy, OPPOSITE[player.dir]);
  v.actor.frozen = true;
  player.frozen = true;
  talkingTo = v;
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
  const hues = PETALS[regionFor(map.id)] ?? PETALS['andes'] ?? ['#f2e6d0'];
  const [px, py] = player.renderPos();
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      renderer.burst(px + TILE / 2 + (i - 1) * 20, py - 10 - i * 8, 'petal', hues);
    }, i * 180);
  }
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
  toasts.show('you sit. (any key to rise)');
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

function tryInteract(): boolean {
  const [fx, fy] = player.facingCell();
  const v = villagersHere().find((n) => {
    const [ox, oy] = n.actor.occupies();
    return ox === fx && oy === fy;
  });
  if (v) {
    startNpcDialogue(v);
    return true;
  }
  // The dig mounds, while Justina's invitation stands.
  if (map.id === 'village' && state.has('dig.invite') && !state.has('dig.done')) {
    const spot = DIG_SPOTS.find((s) => s.at[0] === fx && s.at[1] === fy && !state.has(s.flag));
    if (spot) {
      audio.dig();
      startNarration(spot.node);
      return true;
    }
  }
  const kind = map.object(fx, fy)?.t ?? map.ground(fx, fy).t;
  if (sitKindsOn(map.id).has(kind)) {
    startSitting();
    return true;
  }
  const arm = EXAMINES[kind]?.find((a) => (!a.map || a.map === map.id) && state.check(a.when));
  if (arm) {
    startNarration(arm.node);
    return true;
  }
  return false;
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
    player.placeAt(state.place.x, state.place.y, state.place.dir as Dir);
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
  if (freshStart) {
    setTimeout(() => {
      if (!textbox.isOpen) startNarration('intro.wake');
    }, 900);
    // The welcome waits for the intro to finish. Shown here it was invisible:
    // the narration holds the textbox open for over a minute, quiet-hud fades
    // the plate and the toasts for all of it, and their timers run out behind
    // the fade. The village nameplate and both control hints were authored,
    // good, and never once seen by a new player.
    pendingWelcome = true;
  }
}

/** The opening's stagecraft, held until the player can actually see it. */
let pendingWelcome = false;
function playWelcome() {
  pendingWelcome = false;
  showPlate(map.name);
  toasts.show('walk with the arrow keys or WASD, or click where you want to go');
  toasts.show('Space talks to people and touches things');
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
  if (choice === 'settings' || choice === 'credits') {
    title.hideTitle();
    pauseMenu.open(choice, true);
    return;
  }
  title.hideTitle();
  if (choice === 'new') {
    state.reset();
    for (const tm of Object.values(maps)) tm.clearOverrides();
    applyGateState();
    applyDressings();
    refreshTaskChip();
    refreshPlayerSheet();
    // The flyleaf first: a name (or not) and the traveler's look, then the
    // letter. Continue never passes through here, so it never asks.
    mode = 'naming';
    naming.open((res) => {
      state.playerName = res.name;
      state.playerLook = res.look;
      state.save();
      refreshPlayerSheet();
      mode = 'letter';
      title.showLetter(undefined, state.playerName);
    });
  } else {
    beginPlay(false);
  }
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
    player.frozen = false;
    takeTravel();
  }
}

// ---------------------------------------------------------------- loop

let showDebug = false;
let bumps = 0;
/** Time until a wall may knock aloud again; see the bumped branch. */
let bumpQuiet = 0;

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

function update(dt: number) {
  renderer.tick(dt);
  textbox.tick(dt);
  for (const g of games) g.panel.tick?.(dt);
  audio.tick(dt);
  stage.tick(dt);

  // The world turns.
  if (!Number.isFinite(todOverride) && mode === 'play') dayT = (dayT + dt / DAY_LEN) % 1;
  updateRhythm(dt);
  // Scheduled customs keep moving even while the player sits and watches;
  // sitting through one is, in fact, the whole point of two of them.
  updateStations(dt);
  renderer.setNight(moodFor(map.id) === 'interior' ? 0 : nightLevel(dayT));
  renderer.setSun(dayT);
  // The coast's mood follows the clock (garúa lid, noon glare), so keep it live.
  renderer.setMood(moodFor(map.id));
  renderer.setRaining(rainingOn(map.id));
  stage.setAmbient(ambientNow());
  audio.setDucked(textbox.isOpen || celebrateT > 0);
  audio.setWorldAmbience(nightLevel(dayT), rainingOn(map.id), dayT);

  // Sitting pushes in slowly, like settling; dialogue leans in just a little.
  const zoomT =
    sitting ? 1.15 : celebrateT > 0 ? 1.12 : textbox.isOpen || anyGameOpen() || uiCardOpen() || journalUI.isOpen || pauseMenu.isOpen || albumUI.isOpen ? 1.06 : 1;
  stage.setZoomTarget(zoomT);
  // Mirror the stage's zoom easing so pointer math maps screen to world
  // without reaching into the presenter's internals.
  uiZoom += (zoomT - uiZoom) * (1 - Math.exp(-dt * 9));
  if (Math.abs(uiZoom - zoomT) < 0.001) uiZoom = zoomT;
  // Story surfaces quiet the ambient HUD (toasts, chip, plate) around them.
  {
    const quiet =
      mode !== 'play' || textbox.isOpen || title.letterOpen || journalUI.isOpen || anyGameOpen() || pauseMenu.isOpen || albumUI.isOpen;
    if (quiet !== quietHud) {
      quietHud = quiet;
      document.body.classList.toggle('quiet-hud', quiet);
    }
  }

  // Whoever is mid-sentence leans into it.
  renderer.setSpeaker(textbox.isTyping && talkingTo ? talkingTo.actor : null);

  // The curiosity dot: does the cell you face have anything to say?
  if (mode === 'play' && !textbox.isOpen && !journalUI.isOpen && !sitting && !warp && !anyGameOpen() && !albumUI.isOpen) {
    const [fx, fy] = player.facingCell();
    const npcThere = villagersHere().some((v) => {
      const [ox, oy] = v.actor.occupies();
      return ox === fx && oy === fy;
    });
    // Only THINGS earn the dot (props, seats, mounds, people); bare ground
    // still answers when examined, but quietly, undiscovered on purpose.
    const objKind = map.object(fx, fy)?.t;
    const digThere =
      map.id === 'village' &&
      state.has('dig.invite') &&
      !state.has('dig.done') &&
      DIG_SPOTS.some((sp) => sp.at[0] === fx && sp.at[1] === fy && !state.has(sp.flag));
    const examThere =
      digThere ||
      (objKind !== undefined &&
        objKind !== 'blocked' &&
        (sitKindsOn(map.id).has(objKind) ||
          (EXAMINES[objKind]?.some((a) => (!a.map || a.map === map.id) && state.check(a.when)) ?? false)));
    renderer.setHint(npcThere || examThere ? [fx, fy] : null);
  } else {
    renderer.setHint(null);
  }
  updateSitting(dt);
  updateWarp(dt);

  // Chasca's camera: a quick white blink over the world.
  if (flashT > 0) {
    flashT = Math.max(0, flashT - dt);
    const a = flashT > 0.35 ? 1 : flashT / 0.35;
    fadeEl.style.background = '#f8f4ea';
    fadeEl.style.opacity = String(a * 0.9);
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
    toasts.show(audio.toggleMute() ? 'sound off' : 'sound on');
  }

  input.pollGamepad();
  const act = input.takeAction() || dev.takeAction();
  const menuDir = input.takeMenuDir() ?? dev.takeMenuDir();
  const back = input.takeBack();
  const pauseKey = input.takePause();
  const journalKey = input.takeJournal() || dev.takeJournal();

  // Any deliberate input or story freeze cancels a click-to-walk in flight.
  if (autoGoal && (player.frozen || warp || textbox.isOpen || act || back || pauseKey || journalKey || menuDir)) {
    cancelAuto();
  }

  // The savor pause: the world keeps breathing, input rests.
  if (celebrateT > 0) {
    celebrateT -= dt;
    if (celebrateT <= 0) audio.setDucked(textbox.isOpen);
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
    if (pauseKey) {
      // Nothing to pause yet; Esc on the title is a no-op.
    }
    if (menuDir) {
      title.onDir(menuDir);
      feedKonami(menuDir);
      audio.select();
    }
    if (act) titleActivate();
  } else if (mode === 'naming') {
    // The flyleaf card owns the keyboard entirely (capture-phase listener);
    // any stray edges from other devices drain here without effect.
  } else if (mode === 'letter') {
    if (act || back) letterAdvance();
  } else if (title.letterOpen) {
    // Mail from home, read mid-journey.
    if (act || back) letterAdvance();
  } else if (!howtoEl.hidden) {
    // The how-to card: begin, or not yet. Either way, no harm done.
    if (menuDir === 'up' || menuDir === 'down' || menuDir === 'left' || menuDir === 'right') {
      howtoSel = 1 - howtoSel;
      renderHowto();
      audio.select();
    }
    if (act) {
      audio.confirm();
      closeHowto(howtoSel === 0);
    } else if (back || pauseKey) {
      audio.back();
      closeHowto(false);
    }
  } else if (!stripEl.hidden) {
    // The in-panel pause strip: start over, keep at it, or step away.
    if (menuDir === 'up' || menuDir === 'down') {
      stripSel = (stripSel + (menuDir === 'down' ? 1 : STRIP_OPTS.length - 1)) % STRIP_OPTS.length;
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
  } else if (!warp) {
    if (pauseKey && celebrateT <= 0) {
      pauseMenu.open('menu');
      audio.pageFlip();
    } else if (journalKey) {
      journalUI.open();
      audio.pageFlip();
    } else if (celebrateT > 0) {
      // The moment is still landing; let it.
    } else if (act) {
      if (!tryInteract()) {
        // Open air, and a game still waiting on its start flag: the how-to
        // card offers itself again. Declined lessons are only postponed.
        const g = pendingGame();
        if (g) showHowto(g);
      }
    } else {
      const manual = dev.heldOverride() ?? input.intent();
      // A held key or stick always outranks a click-to-walk in progress.
      if (manual && autoGoal) cancelAuto();
      const intent = manual ?? autoIntent();
      MW.lastIntent = intent ?? '-';
      // The camera leans a little into sustained walking, easing home at rest.
      const lead = intent
        ? { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[intent]
        : [0, 0];
      camera.lead(lead?.[0] ?? 0, lead?.[1] ?? 0, dt);
      const prevX = player.x;
      const prevY = player.y;
      const ev = player.update(dt, { intent, blocked: blockedFor(player) });
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
        // A villager stepped into the planned path; route around them.
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
        renderer.puffAt(prevX, prevY);
        const trig = map.triggerAt(ev.x, ev.y);
        if (trig?.type === 'door') startWarp(trig);
      }
      for (const v of villagersHere()) updateVillager(v, dt);
    }
  }

  // Paca yields the pass, one llama-meter, once Faustino whistles.
  if (paca && state.has('paca.moved') && paca.actor.x === 30 && paca.actor.y === 6) {
    paca.actor.placeAt(28, 4, 'down');
  }

  if (mode === 'title') {
    // Attract mode: the camera drifts across wherever the journey paused,
    // like a memory browsing itself behind the cover.
    attractT += dt;
    const wx = (map.w * TILE) / 2 + Math.sin(attractT * 0.045) * map.w * TILE * 0.32 - TILE / 2;
    const wy = (map.h * TILE) / 2 + Math.sin(attractT * 0.031 + 1.7) * map.h * TILE * 0.32 - TILE / 2;
    camera.follow(wx, wy, map.w, map.h);
  } else {
    const [ppx, ppy] = player.renderPos();
    camera.follow(ppx, ppy, map.w, map.h);
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
  });
}

function render() {
  renderer.drawWorld(map, camera, [...spritesHere(), ...moundsHere()]);

  // Every fire and lamp on this map becomes a flickering point light.
  // Outdoors they wake with the dusk; interior fires carry the room all day.
  const nk = moodFor(map.id) === 'interior' ? 0 : nightLevel(dayT);
  const outdoorK = moodFor(map.id) === 'interior' ? 1 : 0.25 + 0.75 * Math.min(1, nk * 2);
  const indoors = moodFor(map.id) === 'interior';
  const specs: LightSpec[] = (fireCells[map.id] ?? []).flatMap(([cx, cy, kind]) => {
    const def = GLOW_STYLE[kind] ?? { r: 30, color: 0xffb066, flicker: 0.4, lift: 3 };
    const x = cx * TILE + TILE / 2 - camera.x;
    const y = cy * TILE + TILE / 2 - def.lift - camera.y;
    // A lamp on a lamplighter's round holds its daytime ember until she
    // reaches it; every other light wakes with the dusk as it always has.
    const wake = stationLampWake(map.id, cx, cy);
    const dayK = wake === null ? outdoorK : 0.25 + Math.max(0, outdoorK - 0.25) * wake;
    const core: LightSpec = { x, y, r: def.r * (indoors ? 1.35 : 1) * dayK, color: def.color, flicker: def.flicker };
    // Indoors, every fire also pools a broad dim warmth across the room, so
    // the space feels inhabited rather than spot-lit.
    return indoors
      ? [core, { x, y: y + 6, r: def.r * 3.2, color: 0x54331c, flicker: 0.08 }]
      : [core];
  });
  // At dusk the houses light their windows from inside.
  if (nk > 0.3) {
    for (const [wx, wy] of houseWindows[map.id] ?? []) {
      specs.push({
        x: wx - camera.x,
        y: wy - camera.y,
        r: 15 + nk * 6,
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
    #vpad { position: absolute; inset: 0; pointer-events: none; }
    #vpad[hidden] { display: none; }
    .vp-pad {
      position: absolute; left: 16px; bottom: 16px;
      width: 152px; height: 152px;
      display: grid; gap: 4px;
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
      border: 1.5px solid rgba(242, 230, 208, 0.4);
      border-radius: 9px;
      background: rgba(43, 33, 24, 0.36);
      color: rgba(242, 230, 208, 0.85);
      font-size: 15px;
      font-family: inherit;
      line-height: 1;
    }
    .vp-b:active { background: rgba(43, 33, 24, 0.62); }
    .vp-pad [data-dir='up'] { grid-area: u; }
    .vp-pad [data-dir='left'] { grid-area: l; }
    .vp-pad [data-dir='right'] { grid-area: r; }
    .vp-pad [data-dir='down'] { grid-area: d; }
    .vp-side {
      position: absolute; right: 16px; bottom: 16px;
      display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
    }
    .vp-act { width: 64px; height: 64px; border-radius: 50%; font-size: 22px; }
    .vp-small { width: 44px; height: 44px; border-radius: 50%; opacity: 0.9; }
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
  if (
    map.id === 'village' &&
    state.has('dig.invite') &&
    !state.has('dig.done') &&
    DIG_SPOTS.some((s) => s.at[0] === x && s.at[1] === y && !state.has(s.flag))
  ) {
    return true;
  }
  // Only THINGS invite the pointer (props, seats, mounds, people), matching
  // the curiosity dot: bare ground still answers the button, but a click on
  // it should simply walk there.
  // A door outranks whatever sits on it. Some exits carry an examinable mat,
  // and if the click examines instead of walking, a pointer-only player can
  // stand in the langar reading the threshold forever and never leave.
  if (map.triggerAt(x, y)) return false;
  const objKind = map.object(x, y)?.t;
  if (objKind === undefined || objKind === 'blocked') return false;
  if (sitKindsOn(map.id).has(objKind)) return true;
  return EXAMINES[objKind]?.some((a) => (!a.map || a.map === map.id) && state.check(a.when)) ?? false;
}

/** Turn toward an adjacent cell and press the same button Space presses. */
function faceAndInteract(tx: number, ty: number) {
  const dir: Dir =
    tx > player.x ? 'right' : tx < player.x ? 'left' : ty > player.y ? 'down' : 'up';
  player.face(dir);
  tryInteract();
}

function requestMove(tx: number, ty: number) {
  cancelAuto();
  const npc = villagersHere().find((v) => {
    const [ox, oy] = v.actor.occupies();
    return ox === tx && oy === ty;
  });
  const d = Math.abs(player.x - tx) + Math.abs(player.y - ty);
  if (npc || interactableAt(tx, ty)) {
    if (d === 0) return;
    if (d === 1) {
      faceAndInteract(tx, ty);
      return;
    }
    const path = findPath(tx, ty, true);
    if (!path) return;
    autoPath = path;
    autoGoal = { kind: 'interact', cell: [tx, ty], npc };
    showMark(tx, ty);
  } else if (!map.solid(tx, ty)) {
    const path = findPath(tx, ty, false);
    if (!path || path.length === 0) return;
    autoPath = path;
    autoGoal = { kind: 'walk', cell: [tx, ty] };
    showMark(tx, ty);
  }
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
  const [px, py] = player.occupies();
  while (autoPath.length) {
    const head = autoPath[0];
    if (head && head[0] === px && head[1] === py) autoPath.shift();
    else break;
  }
  const next = autoPath[0];
  if (!next) {
    if (player.isMoving) return null; // let the last step land first
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
  if (pauseMenu.isOpen || journalUI.isOpen || anyGameOpen() || uiCardOpen() || title.letterOpen || albumUI.isOpen) return;
  if (sitting) {
    standUp();
    return;
  }
  if (player.frozen) return;
  const [wx, wy] = screenToWorld(e.clientX, e.clientY);
  const tx = Math.floor(wx / TILE);
  const ty = Math.floor(wy / TILE);
  if (map.inBounds(tx, ty)) requestMove(tx, ty);
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
    if (map.inBounds(tx, ty) && interactableAt(tx, ty)) cursor = 'pointer';
  }
  if (glCanvas.style.cursor !== cursor) glCanvas.style.cursor = cursor;
});
}

// ---- menu steering: drive each component's own cursor to the hovered row ----

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
  if (!textbox.isOpen) return;
  const row = (e.target as HTMLElement).closest('.tb-choice');
  if (row && steerTo(choicesEl, '.tb-choice', row, (d) => textbox.onDir(d))) audio.select();
});

// ---- title: hover moves the hand, click chooses ----

const titleRoot = $('title');
titleRoot.addEventListener('click', (e) => {
  if (!title.titleOpen) return;
  const opt = (e.target as HTMLElement).closest('.t-opt');
  if (!opt) return;
  steerTo(titleRoot, '.t-opt', opt, (d) => title.onDir(d));
  titleActivate();
});
titleRoot.addEventListener('mouseover', (e) => {
  if (!title.titleOpen) return;
  const opt = (e.target as HTMLElement).closest('.t-opt');
  if (opt && steerTo(titleRoot, '.t-opt', opt, (d) => title.onDir(d))) audio.select();
});

$('letter').addEventListener('click', () => {
  if (title.letterOpen) letterAdvance();
});

// ---- pause: options click, settings rows adjust by clicked half ----

const pauseRoot = $('pause');
pauseRoot.addEventListener('click', (e) => {
  if (!pauseMenu.isOpen) return;
  const t = e.target as HTMLElement;
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
    // gesture the arrow keys make, aimed with the mouse.
    const r = row.getBoundingClientRect();
    steerTo(pauseRoot, '.p-row', row, (d) => pauseMenu.onDir(d));
    pauseMenu.onDir(e.clientX > r.left + r.width / 2 ? 'right' : 'left');
    audio.select();
    return;
  }
  if (!t.closest('.p-card')) {
    pauseMenu.onBack();
    audio.back();
    return;
  }
  if (!pauseRoot.querySelector('.p-menu') && !inSettings) {
    // Help and credits: any click on the page turns back.
    pauseMenu.onAction();
    audio.back();
  }
});
pauseRoot.addEventListener('mouseover', (e) => {
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
journalRoot.addEventListener('click', (e) => {
  if (!journalUI.isOpen) return;
  const t = e.target as HTMLElement;
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
    journalUI.close();
    audio.pageFlip();
  }
});
journalRoot.addEventListener('mouseover', (e) => {
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

// ---- minigame panels: middle third acts, outer thirds steer ----

function attachPanelPointer(
  root: HTMLElement,
  panel: { readonly isOpen: boolean; onDir(d: Dir): void; onAction(): void },
) {
  root.addEventListener('pointerdown', (e) => {
    if (!panel.isOpen || e.button !== 0) return;
    e.preventDefault();
    const card = root.querySelector('.w-panel') ?? root;
    const r = card.getBoundingClientRect();
    if (e.clientX < r.left + r.width / 3) panel.onDir('left');
    else if (e.clientX > r.right - r.width / 3) panel.onDir('right');
    else panel.onAction();
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
  howtoSel = Number((row as HTMLElement).dataset.ht);
  audio.confirm();
  closeHowto(howtoSel === 0);
});
stripEl.addEventListener('pointermove', (e) => {
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

// ---- the touch pad: held movement + action, only once a finger is seen ----

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
    <button class="vp-b vp-small" data-act="journal" aria-label="journal">&#9998;</button>
    <button class="vp-b vp-small" data-act="pause" aria-label="pause">&#9776;</button>
    <button class="vp-b vp-act" data-act="action" aria-label="talk / touch">&#10022;</button>
  </div>`;
frameEl.appendChild(vpad);

const revealVpad = (e: PointerEvent) => {
  if (e.pointerType !== 'touch') return;
  vpad.hidden = false;
  window.removeEventListener('pointerdown', revealVpad, true);
};
window.addEventListener('pointerdown', revealVpad, true);

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
    }
  });
  if (dir) {
    const release = () => input.releaseDir(dir);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
  }
}

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

  /** Chapter order, with the flag that says you got there and where it is. */
  const CHAPTERS_CHEAT: { n: number; id: string; map: string; flag: string }[] = [
    { n: 1, id: 'chaska-pampa', map: 'village', flag: 'intro.done' },
    { n: 2, id: 'la-caleta', map: 'la-caleta', flag: 'c2.arrived' },
    { n: 3, id: 'crossing', map: 'ship', flag: 'c3.arrived' },
    { n: 4, id: 'shionoura', map: 'shionoura', flag: 'c4.arrived' },
    { n: 5, id: 'busan', map: 'busan', flag: 'c5.arrived' },
    { n: 6, id: 'kerala', map: 'kerala', flag: 'c6.arrived' },
    { n: 7, id: 'delhi', map: 'delhi', flag: 'c11.arrived' },
    { n: 8, id: 'zanzibar', map: 'zanzibar', flag: 'c7.arrived' },
    { n: 9, id: 'sicily', map: 'sicily', flag: 'c8.arrived' },
    { n: 10, id: 'oaxaca', map: 'oaxaca', flag: 'c9.arrived' },
    { n: 11, id: 'home', map: 'village', flag: 'c10.arrived' },
  ];

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
          'soup.pages()         fill the journal, every page',
          "soup.page(id)        grant one page properly (soup.flag can't)",
          'soup.perf()          frame costs and a log of every hitch over 14ms',
          'soup.witness()       micro-freezes seen in the player\'s own motion',
          'soup.photos()        grant every photograph Chasca can take',
          'soup.tod(t)          set time of day, 0 dawn, 0.35 day, 0.57 gold, 0.85 night',
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
      for (const c of CHAPTERS_CHEAT) {
        if (c.n >= target.n) break;
        state.set(c.flag);
        const num = c.id === 'delhi' ? 11 : c.n === 1 ? 0 : c.n;
        if (num) state.set(`c${num}.complete`);
      }
      state.set(target.flag);
      return jump(target.map);
    },
    warp: (mapId: string, x?: number, y?: number) =>
      jump(mapId, x !== undefined && y !== undefined ? [x, y] : undefined),
    flag(f: string, on = true) {
      if (on) state.set(f);
      else state.clearFlag(f);
      return `${f} = ${on}`;
    },
    /** Flags currently set, read back out of the save the game just wrote. */
    flags(sub?: string) {
      let set: string[] = [];
      try {
        set = JSON.parse(localStorage.getItem('elsewhere.save') ?? '{}').flags ?? [];
      } catch {
        return [];
      }
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
      const shots = ['photo.taken', 'photo.c2.pier', 'photo.c3.deck', 'photo.c4.shrine',
        'photo.c5.market', 'photo.c6.jetty', 'photo.c11.kites', 'photo.c7.shore',
        'photo.c8.piazza', 'photo.c9.ofrenda'];
      for (const f of shots) state.set(f);
      return `${shots.length} photographs granted`;
    },
    tod(t: number) {
      dayT = Math.max(0, Math.min(0.999, t));
      return `time of day = ${dayT.toFixed(2)}`;
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
      for (const c of CHAPTERS_CHEAT) state.set(c.flag);
      for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 11]) state.set(`c${n}.complete`);
      state.set('story.complete');
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
