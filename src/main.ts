import { Actor } from './engine/actor';
import { AudioBus } from './engine/audio';
import { Camera } from './engine/camera';
import { STEP_DUR, TILE, TURN_DELAY } from './engine/config';
import { DevBridge } from './engine/devbridge';
import { TileMap, type TriggerDef } from './engine/grid';
import { Input, type Dir } from './engine/input';
import { startLoop } from './engine/loop';
import { Renderer, type Sprite } from './engine/renderer';
import { GameState } from './engine/state';
import { PLAYER_LOOK, makePortrait, makeSheet } from './art/character';
import { GLOW_KINDS, WINDOW_OFFSETS } from './art/sets';
import { makeDogSheet, makeLlamaSheet, makeMoundSheet } from './art/animals';
import { Textbox } from './ui/textbox';
import { JournalUI } from './ui/journal';
import { Toasts } from './ui/toast';
import { TitleScreen } from './ui/title';
import { WeavePanel } from './ui/weave';
import { PauseMenu } from './ui/pause';
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
  SIT_KINDS,
  SIT_LINES,
  TASKS,
} from './content/world';
import { pickLetter } from './content/letters';
import { ROUTE } from './content/route';
import type { NpcDef } from './content/schema';

// ---------------------------------------------------------------- boot

const $ = (id: string) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
};

// The Canvas2D composer now paints into an offscreen buffer; PixiJS presents
// it with lighting, bloom, and shimmer-free zoom on top.
const worldCanvas = $('game') as HTMLCanvasElement;
const renderer = new Renderer(worldCanvas);
const stage = await PixiStage.create(worldCanvas, $('frame'));
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
const startMap = maps['village'];
if (!startMap) throw new Error('village map missing');

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
  // Evening maps that declared a dusk light get to use it.
  if (meta.moodDusk && nightLevel(dayT) > 0.3) return meta.moodDusk;
  return meta.mood;
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
const DAY_LEN = 300;
const todOverride = dev.enabled
  ? Number.parseFloat(new URLSearchParams(location.search).get('tod') ?? 'NaN')
  : Number.NaN;
let dayT = Number.isFinite(todOverride) ? todOverride : 0.18;

/** Keyframed RGB multipliers over the day: dawn gold, noon clear, dusk ember, night blue. */
const DAY_KEYS: [number, [number, number, number]][] = [
  [0.0, [1.04, 0.88, 0.74]],
  [0.1, [1.0, 1.0, 1.0]],
  [0.45, [1.01, 0.98, 0.93]],
  [0.55, [1.05, 0.8, 0.68]],
  [0.63, [0.55, 0.58, 0.8]],
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
};
const fireCells: Record<string, [number, number, string][]> = {};
for (const [id, tm] of Object.entries(maps)) {
  const cells: [number, number, string][] = [];
  for (let y = 0; y < tm.h; y++) {
    for (let x = 0; x < tm.w; x++) {
      const o = tm.object(x, y);
      if (o && GLOW_KINDS.has(o.t)) cells.push([x, y, o.t]);
    }
  }
  fireCells[id] = cells;
}

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
  }
}
applyDressings();

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
const weave = new WeavePanel($('weave'), audio);
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
const games = GAMES.map((g) => ({
  def: g,
  panel: g.make(makeOverlayRoot(g.flag.replace(/\W+/g, '-')), audio),
}));
const anyGameOpen = () => games.some((g) => g.panel.isOpen);

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
state.on('changed', () => applyDressings());
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
};

function sheetFor(def: NpcDef): HTMLCanvasElement {
  if (def.sprite === 'dog') return makeDogSheet();
  if (def.sprite === 'llama') return makeLlamaSheet('#e8ddc8');
  if (def.sprite === 'llamaBrown') return makeLlamaSheet('#9c6b42');
  return makeSheet(def.look);
}

const villagers: Villager[] = NPCS.map((def) => ({
  def,
  actor: new Actor(def.pos[0], def.pos[1], 'down'),
  sheet: sheetFor(def),
  rig: (def.sprite ? 'animal' : 'human') as 'animal' | 'human',
  portrait: def.sprite ? null : makePortrait(def.look),
  think: Math.random() * 2,
  want: null,
}));

const dog = villagers.find((v) => v.def.id === 'allqu');
const paca = villagers.find((v) => v.def.id === 'paca');

/** The golden traveler, for those who remember an older code. */
const GOLDEN_LOOK = {
  ...PLAYER_LOOK,
  cloth: '#c8a55b',
  stripe: '#f2e6d0',
  hat: '#e8c97a',
};

const playerSprite: Sprite = {
  actor: player,
  sheet: makeSheet(state.has('konami') ? GOLDEN_LOOK : PLAYER_LOOK),
  rig: 'human',
};

/** ↑↑↓↓←→←→ on the title screen. Some traditions cross all borders. */
const KONAMI: Dir[] = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];
let konamiAt = 0;
function feedKonami(d: Dir) {
  if (state.has('konami')) return;
  konamiAt = d === KONAMI[konamiAt] ? konamiAt + 1 : d === 'up' ? 1 : 0;
  if (konamiAt >= KONAMI.length) {
    state.set('konami');
    playerSprite.sheet = makeSheet(GOLDEN_LOOK);
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
  // homecomings). Everyone else simply lives here.
  return villagers.filter((v) => v.def.map === map.id && state.check(v.def.when));
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

  if (v.def.range === 0 || dev.freezeWander) return;
  // Deep evening: the wandering stops. People stand where the day left them,
  // finishing conversations, and the village audibly settles.
  if (sceneFor(map.id) !== 'interior' && nightLevel(dayT) > 0.6) return;
  v.think -= dt;
  if (v.think <= 0) {
    // Mostly stand around; occasionally amble. Village time moves slowly.
    v.want =
      Math.random() < 0.4
        ? ((['up', 'down', 'left', 'right'] as Dir[])[Math.floor(Math.random() * 4)] ?? null)
        : null;
    v.think = 1.0 + Math.random() * 2.8;
  }
  const [hx, hy] = v.def.pos;
  const r = v.def.range;
  const leash = (x: number, y: number) => x < hx - r || x > hx + r || y < hy - r || y > hy + r;
  const blocked = blockedFor(v.actor);
  v.actor.update(dt, { intent: v.want, blocked: (x, y) => blocked(x, y) || leash(x, y) });
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
  kerala: 'kerala', zanzibar: 'zanzibar', sicily: 'sicily', oaxaca: 'oaxaca',
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
  if (talkingTo) talkingTo.actor.frozen = false;
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

  // One-shot signals raised by dialogue effects, consumed here.
  if (state.has('weave.start')) {
    state.clearFlag('weave.start');
    player.frozen = true;
    weave.open(() => {
      player.frozen = false;
      startNarration('carmen.woven');
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
  for (const g of games) {
    if (state.has(g.def.flag)) {
      player.frozen = true;
      g.panel.open(() => {
        player.frozen = false;
        startNarration(g.def.doneNode);
      });
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

/**
 * Festival dressing: chapters redecorate their maps as the story moves
 * (bamboo fills with wishes, candles line the marigold path). Idempotent;
 * runs at boot and whenever flags change.
 */
function applyDressings() {
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
  }
}
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

function tryInteract() {
  const [fx, fy] = player.facingCell();
  const v = villagersHere().find((n) => {
    const [ox, oy] = n.actor.occupies();
    return ox === fx && oy === fy;
  });
  if (v) {
    startNpcDialogue(v);
    return;
  }
  // The dig mounds, while Justina's invitation stands.
  if (map.id === 'village' && state.has('dig.invite') && !state.has('dig.done')) {
    const spot = DIG_SPOTS.find((s) => s.at[0] === fx && s.at[1] === fy && !state.has(s.flag));
    if (spot) {
      audio.dig();
      startNarration(spot.node);
      return;
    }
  }
  const kind = map.object(fx, fy)?.t ?? map.ground(fx, fy).t;
  if (SIT_KINDS.has(kind)) {
    startSitting();
    return;
  }
  const arm = EXAMINES[kind]?.find((a) => (!a.map || a.map === map.id) && state.check(a.when));
  if (arm) startNarration(arm.node);
}

// ---------------------------------------------------------------- modes

type Mode = 'title' | 'letter' | 'play';
let mode: Mode = 'title';
let attractT = 0;

function beginPlay(freshStart: boolean) {
  mode = 'play';
  // Continue resumes the journey where it paused, anywhere in the world.
  if (!freshStart && !override && state.place && maps[state.place.map]) {
    map = maps[state.place.map] as TileMap;
    player.placeAt(state.place.x, state.place.y, state.place.dir as Dir);
    const [px, py] = player.renderPos();
    camera.follow(px, py, map.w, map.h);
  }
  showPlate(map.name);
  audio.setScene(sceneFor(map.id));
  audio.setRegion(regionFor(map.id));
  renderer.setMood(moodFor(map.id));
  stage.setAmbient(AMBIENT[moodFor(map.id)] ?? 0xfdf6ea);
  if (freshStart) {
    setTimeout(() => {
      if (!textbox.isOpen) startNarration('intro.wake');
    }, 900);
    toasts.show('walk with the arrow keys or WASD');
    toasts.show('Space talks to people and touches things');
  }
}

// ---------------------------------------------------------------- loop

let showDebug = false;
let bumps = 0;

function update(dt: number) {
  renderer.tick(dt);
  textbox.tick(dt);
  weave.tick(dt);
  for (const g of games) g.panel.tick?.(dt);
  audio.tick(dt);
  stage.tick(dt);

  // The world turns.
  if (!Number.isFinite(todOverride) && mode === 'play') dayT = (dayT + dt / DAY_LEN) % 1;
  renderer.setNight(moodFor(map.id) === 'interior' ? 0 : nightLevel(dayT));
  renderer.setSun(dayT);
  renderer.setFires((fireCells[map.id] ?? []).map(([fx, fy]) => [fx, fy]));
  // The coast's mood follows the clock (garúa lid, noon glare), so keep it live.
  renderer.setMood(moodFor(map.id));
  stage.setAmbient(ambientNow());
  audio.setDucked(textbox.isOpen || celebrateT > 0);
  audio.setWorldAmbience(nightLevel(dayT), moodFor(map.id) === 'monsoon');

  // Sitting pushes in slowly, like settling; dialogue leans in just a little.
  stage.setZoomTarget(
    sitting ? 1.15 : celebrateT > 0 ? 1.12 : textbox.isOpen || weave.isOpen || anyGameOpen() || journalUI.isOpen || pauseMenu.isOpen ? 1.06 : 1,
  );
  // Story surfaces quiet the ambient HUD (toasts, chip, plate) around them.
  document.body.classList.toggle(
    'quiet-hud',
    mode !== 'play' || textbox.isOpen || title.letterOpen || journalUI.isOpen || anyGameOpen() || pauseMenu.isOpen,
  );

  // Whoever is mid-sentence leans into it.
  renderer.setSpeaker(textbox.isTyping && talkingTo ? talkingTo.actor : null);

  // The curiosity dot: does the cell you face have anything to say?
  if (mode === 'play' && !textbox.isOpen && !journalUI.isOpen && !sitting && !warp && !anyGameOpen()) {
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
        (SIT_KINDS.has(objKind) ||
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
    if (act) {
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
        mode = 'letter';
        title.showLetter();
      } else {
        beginPlay(false);
      }
    }
  } else if (mode === 'letter') {
    if (act || back) {
      audio.confirm();
      title.hideLetter();
      beginPlay(true);
    }
  } else if (title.letterOpen) {
    // Mail from home, read mid-journey.
    if (act || back) {
      audio.confirm();
      title.hideLetter();
      player.frozen = false;
      takeTravel();
    }
  } else if (weave.isOpen) {
    if (menuDir) weave.onDir(menuDir);
    if (act) weave.onAction();
  } else if (anyGameOpen()) {
    const g = games.find((x) => x.panel.isOpen);
    if (g) {
      if (menuDir) g.panel.onDir(menuDir);
      if (act) g.panel.onAction();
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
      tryInteract();
    } else {
      const intent = dev.heldOverride() ?? input.intent();
      // The camera leans a little into sustained walking, easing home at rest.
      const lead = intent
        ? { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[intent]
        : [0, 0];
      camera.lead(lead?.[0] ?? 0, lead?.[1] ?? 0, dt);
      const prevX = player.x;
      const prevY = player.y;
      const ev = player.update(dt, { intent, blocked: blockedFor(player) });
      if (ev?.kind === 'bumped') {
        bumps++;
        audio.bump();
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

  // Remember where we stand; persisted alongside the next save.
  if (mode === 'play') state.place = { map: map.id, x: player.x, y: player.y, dir: player.dir };

  dev.publish({
    mode,
    map: map.id,
    tile: [player.x, player.y],
    dir: player.dir,
    facing: player.facingCell(),
    dialogue: textbox.currentNode,
    journalOpen: journalUI.isOpen,
    weaveOpen: weave.isOpen,
    pages: state.pageCount(),
    errand: state.errand,
    npcs: Object.fromEntries(villagersHere().map((v) => [v.def.id, v.actor.occupies()])),
    bumps,
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
    const core: LightSpec = { x, y, r: def.r * (indoors ? 1.35 : 1) * outdoorK, color: def.color, flicker: def.flicker };
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

// ---------------------------------------------------------------- start

// `?skiptitle=1` drops straight into play for quick dev iteration.
if (dev.enabled && new URLSearchParams(location.search).has('skiptitle')) {
  beginPlay(!state.has('intro.done'));
} else {
  title.showTitle(state.hasSave());
}

// Dev-only: lets automation advance the simulation synchronously, independent
// of rAF (which Chrome pauses entirely in hidden tabs).
dev.attachCommands((frames) => {
  for (let i = 0; i < frames; i++) update(1 / 60);
  render();
});

startLoop(update, render);
