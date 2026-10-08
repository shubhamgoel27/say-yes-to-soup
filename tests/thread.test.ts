import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { GameState } from '../src/engine/state';
import { TileMap } from '../src/engine/grid';
import {
  ARRIVALS,
  CHAPTERS,
  DIG_SPOTS,
  DRESSINGS,
  EXAMINES,
  GAMES,
  NODES,
  NPCS,
  REGION_MAPS,
  TASKS,
  sitKindsOn,
  type WorldTask,
} from '../src/content/world';
import {
  atFor,
  hasNews,
  isProgressFlag,
  nextMapToward,
  npcMap,
  openTasks,
  threadWho,
  whoOf,
} from '../src/content/guide';
import { cheapestPath } from '../src/engine/path';
import { CUES } from '../src/content/staging';

/**
 * Follow Nani's red thread, and nothing else, from the first morning in
 * Ch'aska Pampa to the last page at the well.
 *
 * The walker is a player who presses N, walks to wherever the thread says,
 * and presses Space there: talks to the person, or faces the thing from a
 * floor tile beside it, or steps through the door. It takes every open
 * dialogue branch (the thread guides; it does not choose for you), plays
 * every game it is handed, and reads every letter. Each chapter must be
 * finished this way, and then the thread must carry the walker on to the
 * next chapter's first footfall.
 *
 * Holding the thread honest means these promises, checked at every step:
 * - while a chapter is open the thread never rests;
 * - every person it could point at (the engine takes the nearest, so that is
 *   every live person the task names) moves the story when spoken to, beyond
 *   their own memory of having spoken;
 * - every thing it could point at can be faced from a floor tile a player can
 *   reach and stand on, Space there examines it rather than sitting down, and
 *   the examine moves the story;
 * - a task that names one person is done by the first talk with them, not by
 *   a stale introduction first and the promised scene on a second visit;
 * - a task that names one person names someone who can finish it (else the
 *   chip silently drops it and the real place is never pointed at);
 * - doing what it asks always changes something, so it can never circle.
 */

const npcById = new Map(NPCS.map((n) => [n.id, n] as const));

/**
 * Content faults this suite has found in chapter files, waiting on their
 * chapter's owner. Each line is exactly what a check reports. Fix the content,
 * then delete the line: a listed fault that no longer happens fails the suite
 * too, so this list can only shrink.
 */
const KNOWN_WALK: string[] = [
  // Exposed when the thread stopped pointing at the nearest stranger during a
  // crowd task (pass 3): these people used to be met by accident before their
  // own task opened. Each needs its task's scene ahead of the first-meeting
  // entry (or the meeting folded into it) in the chapter's npcs.ts.
  '[oaxaca] "Chela’s chiles wait at Eugenia’s stall on the mark": the first talk to eugenia (c9.eugenia.first) is not the one it promises (c9.eugenia.chiles)',
  '[oaxaca] "Chocolate next: Tacho at the panadería grinds caca": the first talk to tacho (c9.pan.first) is not the one it promises (c9.pan.choco)',
];
const KNOWN_FINISH: string[] = [];

function assertKnown(problems: string[], known: string[]) {
  const fresh = problems.filter((p) => !known.includes(p));
  const gone = known.filter((k) => !problems.includes(k));
  assert.deepEqual(
    { fresh, gone },
    { fresh: [], gone: [] },
    `\nnew faults:\n${fresh.join('\n')}\nlisted faults that no longer happen (delete them):\n${gone.join('\n')}`,
  );
}

/** The map as the engine dresses it for these flags (festival cells, the east gate). */
function dressed(state: GameState, mapId: string): TileMap | null {
  const data = REGION_MAPS[mapId];
  if (!data) return null;
  const tm = new TileMap(data);
  for (const d of DRESSINGS) {
    if (d.map !== mapId || !state.check(d.when)) continue;
    if (d.swap) {
      for (let y = 0; y < tm.h; y++) {
        for (let x = 0; x < tm.w; x++) if (tm.object(x, y)?.t === d.swap.from) tm.setObject(x, y, d.swap.to);
      }
    }
    for (const [x, y, def] of d.cells ?? []) tm.setObject(x, y, def);
  }
  if (mapId === 'village' && state.has('story.complete')) {
    for (const gx of [41, 42]) {
      tm.setObject(gx, 16, { t: 'gateOpen' });
      tm.addTrigger({ at: [gx, 16], type: 'door', to: 'east-road', spawn: [1, 6], facing: 'right' });
    }
  }
  return tm;
}

/** Every cell a player can be put down on when entering a map. */
const ENTRY_CELLS: Map<string, [number, number][]> = (() => {
  const out = new Map<string, [number, number][]>();
  const add = (m: string, c: [number, number]) => {
    let list = out.get(m);
    if (!list) out.set(m, (list = []));
    list.push(c);
  };
  for (const [id, data] of Object.entries(REGION_MAPS)) {
    add(id, data.spawn);
    for (const t of data.triggers ?? []) if (t.type === 'door') add(t.to, t.spawn);
  }
  add('east-road', [1, 6]);
  for (const node of Object.values(NODES)) {
    for (const eff of node.effects ?? []) {
      if (!eff.startsWith('travel:')) continue;
      const [m, xs, ys] = eff.slice(7).split(',');
      if (m && xs !== undefined && ys !== undefined) add(m, [Number(xs), Number(ys)]);
    }
  }
  return out;
})();

/** Cells reachable on foot from wherever a player can enter this map. */
function walkable(tm: TileMap, blocked: Set<string>): Set<string> {
  const seen = new Set<string>();
  const queue: [number, number][] = [];
  for (const c of ENTRY_CELLS.get(tm.id) ?? []) {
    const k = `${c[0]},${c[1]}`;
    if (!seen.has(k)) {
      seen.add(k);
      queue.push(c);
    }
  }
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head]!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      const k = `${nx},${ny}`;
      if (seen.has(k) || tm.solid(nx, ny) || blocked.has(k)) continue;
      seen.add(k);
      queue.push([nx, ny]);
    }
  }
  return seen;
}

/** Where the people who never wander stand, for these flags. */
function standingBodies(state: GameState, mapId: string, except?: string): Set<string> {
  const out = new Set<string>();
  for (const n of NPCS) {
    if (n.map !== mapId || n.id === except || n.range > 0 || !state.check(n.when)) continue;
    out.add(`${n.pos[0]},${n.pos[1]}`);
  }
  return out;
}

/** Floor beside (x,y) a player can reach and stand on, facing it. */
function facingTiles(state: GameState, mapId: string, x: number, y: number, except?: string): [number, number][] {
  const tm = dressed(state, mapId);
  if (!tm) return [];
  const bodies = standingBodies(state, mapId, except);
  const reach = walkable(tm, bodies);
  const out: [number, number][] = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
    const k = `${x + dx},${y + dy}`;
    if (reach.has(k) && !bodies.has(k)) out.push([x + dx, y + dy]);
  }
  return out;
}

type Target =
  | { task: WorldTask; kind: 'who'; id: string; map: string; all: string[] }
  | { task: WorldTask; kind: 'at'; map: string; x: number; y: number };

class Walker {
  state = new GameState();
  place = 'village';
  log: string[] = [];
  private pendingTravel: string | null = null;
  private pendingLetters: string[] = [];
  /** Conversations this player never has (walks past that person). */
  avoid: ((nodeId: string) => boolean) | null = null;

  constructor() {
    // The travel effect warps once the words close; the walker just goes.
    this.state.on('travel', (d) => {
      this.pendingTravel = d.map;
    });
    this.state.on('letter', (id) => {
      this.pendingLetters.push(id);
    });
  }

  private get flags(): Set<string> {
    return (this.state as unknown as { flags: Set<string> }).flags;
  }

  /** A second walker standing exactly here, to try a road without taking it. */
  clone(): Walker {
    const c = new Walker();
    const src = this.state as unknown as { flags: Set<string>; journal: Set<string> };
    const dst = c.state as unknown as { flags: Set<string>; journal: Set<string> };
    dst.flags = new Set(src.flags);
    dst.journal = new Set(src.journal);
    c.state.errand = this.state.errand;
    c.place = this.place;
    c.avoid = this.avoid;
    return c;
  }

  sig(): string {
    return [this.place, this.state.errand ?? '', [...this.state.pages()].sort().join(','), [...this.flags].sort().join(',')].join('|');
  }

  /** What the story would notice: the bookkeeping of `npcId` alone does not count. */
  progressSig(npcId?: string): string {
    const flags = [...this.flags].filter((f) => isProgressFlag(f, npcId) || f.startsWith('letter.read.'));
    return [this.place, this.state.errand ?? '', [...this.state.pages()].sort().join(','), flags.sort().join(',')].join('|');
  }

  /** Every open branch of a conversation, effects applied on entry. */
  walk(nodeId: string, seen = new Set<string>()) {
    if (seen.has(nodeId) || this.avoid?.(nodeId)) return;
    seen.add(nodeId);
    const node = NODES[nodeId];
    if (!node) return;
    this.state.apply(node.effects);
    if (node.next) this.walk(node.next, seen);
    for (const c of node.choices ?? []) if (this.state.check(c.when)) this.walk(c.goto, seen);
  }

  /** Whatever the engine does between conversations, until the world rests. */
  settle() {
    for (let guard = 0; guard < 40; guard++) {
      const before = this.sig();
      for (const id of this.pendingLetters.splice(0)) this.state.apply([`letterread:${id}`]);
      if (this.pendingTravel) {
        const to = this.pendingTravel;
        this.pendingTravel = null;
        this.enter(to);
      }
      for (const g of GAMES) {
        if (!this.state.has(g.flag)) continue;
        // A replay closes quietly, exactly as the engine closes it.
        if (this.state.has('replay.mode')) {
          this.state.clearFlag('replay.mode');
          this.state.clearFlag(g.flag);
        } else this.walk(g.doneNode);
      }
      if (this.state.has('album.open')) {
        this.state.clearFlag('album.open');
        if (!this.state.has('c10.album.seen')) this.walk('c10.album.close');
      }
      if (this.state.has('dig.invite') && !this.state.has('dig.done') && DIG_SPOTS.every((s) => this.state.has(s.flag))) {
        this.walk('dig.finish');
      }
      const arr = ARRIVALS.find((a) => a.map === this.place && !this.state.has(a.flag) && this.state.check(a.when));
      if (arr) this.walk(arr.node);
      if (this.sig() === before) return;
    }
  }

  enter(mapId: string) {
    const same = this.place === mapId;
    this.place = mapId;
    const arrival = ARRIVALS.some((a) => a.map === mapId && !this.state.has(a.flag) && this.state.check(a.when));
    this.settle();
    // A scene waiting beyond a dark that was time passing in place plays as
    // the light comes up (content/staging.ts cues), unless a first footfall
    // had the floor.
    const cue = arrival || !same ? undefined : CUES.find((c) => c.map === mapId && this.state.check(c.when));
    if (cue) {
      this.walk(cue.node);
      this.settle();
    }
  }

  /** Walk the door chain to a map, one first footfall at a time. */
  goTo(mapId: string): boolean {
    for (let hops = 0; this.place !== mapId && hops < 20; hops++) {
      const next = nextMapToward(this.place, mapId, this.state);
      if (!next) return false;
      this.enter(next);
    }
    return this.place === mapId;
  }

  /** What N would show right now: the first open task that resolves. */
  thread(): Target | null {
    const reachable = (m: string) => m === this.place || nextMapToward(this.place, m, this.state) !== null;
    for (const task of openTasks(TASKS, this.state)) {
      const at = atFor(task, this.state);
      if (at) {
        const [m, x, y] = at;
        if (reachable(m)) return { task, kind: 'at', map: m, x, y };
        continue;
      }
      const ids = threadWho(task, this.state, (id) => reachable(npcMap(id) ?? ''));
      const id = ids.find((i) => npcMap(i) === this.place) ?? ids[0];
      if (id) return { task, kind: 'who', id, map: npcMap(id)!, all: ids };
    }
    return null;
  }

  /** Press Space where the thread ends. Returns a complaint, or null. */
  act(t: Target): string | null {
    if (!this.goTo(t.map)) return `cannot walk to ${t.map} from ${this.place}`;
    if (t.kind === 'who') {
      const npc = npcById.get(t.id)!;
      const entry = npc.entry.find((e) => this.state.check(e.when));
      if (!entry) return `${t.id} has no entry for these flags`;
      if (facingTiles(this.state, t.map, npc.pos[0], npc.pos[1], t.id).length === 0) {
        return `${t.id} at [${t.map},${npc.pos}] has no floor beside them a player can reach`;
      }
      this.walk(entry.node);
      this.settle();
      return null;
    }
    const { map: m, x, y } = t;
    const tm = dressed(this.state, m)!;
    const door = tm.triggerAt(x, y);
    if (door && door.type === 'door') {
      this.enter(door.to);
      return null;
    }
    const where = `[${m},${x},${y}]`;
    if (facingTiles(this.state, m, x, y).length === 0) {
      return `the thread ends at ${where} and no floor beside it can be reached to face it`;
    }
    // The terraces: a mound is dug by facing it, one at a time.
    const mound = DIG_SPOTS.find((s) => s.at[0] === x && s.at[1] === y && !this.state.has(s.flag));
    if (m === 'village' && mound && this.state.has('dig.invite') && !this.state.has('dig.done')) {
      this.walk(mound.node);
      this.settle();
      return null;
    }
    const kind = tm.object(x, y)?.t ?? tm.ground(x, y).t;
    if (sitKindsOn(m).has(kind)) return `the thread ends at ${where} (${kind}), and Space there sits down instead`;
    const arm = EXAMINES[kind]?.find((a) => (!a.map || a.map === m) && this.state.check(a.when));
    if (!arm) return `the thread ends at ${where} (${kind}) and nothing there answers`;
    this.walk(arm.node);
    this.settle();
    return null;
  }
}

/** Where each chapter begins and what finishes it, in play order. */
const MILESTONES = CHAPTERS.map((c, i) => ({
  id: c.id,
  arrived: c.arrival?.flag ?? null,
  done: c.completion?.flag ?? (i === 0 ? 'story.complete' : 'story.end'),
  next: CHAPTERS[i + 1]?.arrival ?? null,
}));

function journey(avoid: ((nodeId: string) => boolean) | null = null): string[] {
  const w = new Walker();
  w.avoid = avoid;
  const dumped: unknown[] = [];
  const problems: string[] = [];
  const said = new Set<string>();
  const say = (p: string) => {
    if (said.has(p)) return;
    said.add(p);
    problems.push(p);
  };
  w.walk('intro.wake');
  w.settle();
  for (const ch of MILESTONES) {
    if (ch.arrived && !w.state.has(ch.arrived)) {
      say(`[${ch.id}] the previous chapter's thread never brought the walker here`);
      const arr = ARRIVALS.find((a) => a.flag === ch.arrived)!;
      w.place = arr.map;
      w.walk(arr.node);
      w.settle();
    }
    // Finish the chapter, then follow on to the next chapter's first footfall.
    const goal = () => (ch.next ? w.state.has(ch.next.flag) : w.state.has(ch.done));
    let steps = 0;
    let broke = false;
    while (!goal()) {
      const phase = w.state.has(ch.done) ? 'after completion' : 'mid-chapter';
      if (++steps > 150) {
        say(`[${ch.id}] ${phase}: following the thread never finishes the chapter (150 steps)`);
        broke = true;
        break;
      }
      const t = w.thread();
      if (!t) {
        const chip = openTasks(TASKS, w.state)[0]?.text.slice(0, 60) ?? '(no chip)';
        say(`[${ch.id}] ${phase} on ${w.place}: the thread rests. chip: "${chip}"`);
        broke = true;
        break;
      }
      if (t.kind === 'who') {
        // The engine takes whichever named person is nearest, so every one
        // of them must be worth the walk, not just the one the walker picks.
        for (const id of t.all) {
          if (!hasNews(id, w.state)) say(`[${ch.id}] the thread points at ${id}, who has nothing new to say`);
          const trial = w.clone();
          const before = trial.progressSig(id);
          const complaint = trial.act({ ...t, id, map: npcMap(id)! });
          if (complaint) say(`[${ch.id}] "${t.task.text.slice(0, 50)}": ${complaint}`);
          else if (trial.progressSig(id) === before) {
            say(`[${ch.id}] the thread points at ${id} ("${t.task.text.slice(0, 40)}"), and the first talk only lets them remember they spoke`);
          }
        }
      }
      // For tests/thread-e2e.mjs, which replays each of these in the engine.
      dumped.push({
        ch: ch.id,
        place: w.place,
        flags: [...w.state.flagSet()],
        pages: [...w.state.pages()],
        target: t.kind === 'who' ? { who: t.id, all: t.all } : { at: [t.map, t.x, t.y] },
        task: t.task.text,
      });
      const before = w.sig();
      const where = t.kind === 'who' ? t.id : `[${t.map},${t.x},${t.y}]`;
      const entryNode = (id: string) => npcById.get(id)?.entry.find((e) => w.state.check(e.when))?.node;
      const firstNode = t.kind === 'who' ? entryNode(t.id) : undefined;
      const progress = w.progressSig(t.kind === 'who' ? t.id : undefined);
      const complaint = w.act(t);
      if (complaint) {
        say(`[${ch.id}] "${t.task.text.slice(0, 50)}": ${complaint}`);
        broke = true;
        break;
      }
      if (w.sig() === before) {
        say(`[${ch.id}] the thread leads to ${where} and nothing changes there ("${t.task.text.slice(0, 50)}")`);
        broke = true;
        break;
      }
      // A task that names one person promises that talking to them does it.
      // If the first talk is something else (a stale introduction, a "come
      // back later" with no time passing), the player hears the wrong scene.
      if (
        t.kind === 'who' &&
        whoOf(t.task).length === 1 &&
        w.state.check(t.task.when) &&
        !t.task.supersededBy.some((f) => w.state.has(f)) &&
        hasNews(t.id, w.state)
      ) {
        say(`[${ch.id}] "${t.task.text.slice(0, 50)}": the first talk to ${t.id} (${firstNode}) is not the one it promises (${entryNode(t.id)})`);
      }
      if (t.kind === 'at' && w.progressSig() === progress) {
        say(`[${ch.id}] the thread leads to ${where} and the examine moves nothing ("${t.task.text.slice(0, 50)}")`);
      }
      w.log.push(`${ch.id}: ${where}`);
    }
    if (broke) {
      // Carry on to the next chapter so one fault does not hide the rest.
      w.state.set(ch.done);
      if (ch.next) {
        w.state.set('story.complete');
        w.place = ch.next.map;
        w.walk(ch.next.node);
        w.settle();
      }
    }
  }
  if (process.env.THREAD_LOG) console.log(w.log.join('\n'));
  if (process.env.THREAD_DUMP && !avoid) {
    const spawns = Object.fromEntries(Object.entries(REGION_MAPS).map(([id, m]) => [id, m.spawn]));
    writeFileSync(process.env.THREAD_DUMP, JSON.stringify({ states: dumped, spawns }));
  }
  return problems;
}

describe("following only Nani's thread", () => {
  it('finishes every chapter, never resting, never circling, never pointing at nothing', () => {
    const problems = journey();
    assertKnown(problems, KNOWN_WALK);
  });

  it('a player who never stops at Pilar\'s bridge is still led home, and never gets her mail', () => {
    // She is optional in the first chapter. Skipping her must not leave a
    // mail task circling a letter that will never come, nor hand over one.
    let read: string[] = [];
    const problems = journey((id) => {
      if (id.startsWith('pilar.')) return true;
      if (/^c\d+\.post\.pilar$|^mar\.post\.send$/.test(id)) read.push(id);
      return false;
    });
    // The same listed content faults as the full walk, and nothing else.
    assert.deepEqual(problems.filter((p) => !KNOWN_WALK.includes(p)), []);
    read = [...new Set(read)];
    assert.deepEqual(read, [], 'a stranger to Pilar was handed her mail');
  });

  it('every task.at names a door to walk through or a thing to face', () => {
    // A bare floor tile is neither: the loop lands under the player's feet
    // and Space there says only what the floor always says. Ground may still
    // be the thing (the petal lane, the tidepools) when it has story arms.
    // A seat is not a thing to face either: Space there sits down.
    for (const t of TASKS) {
      if (!t.at) continue;
      const [m, x, y] = t.at;
      const tm = new TileMap(REGION_MAPS[m]!);
      if (tm.triggerAt(x, y)?.type === 'door') continue;
      if (m === 'village' && DIG_SPOTS.some((s) => s.at[0] === x && s.at[1] === y)) continue;
      const obj = tm.object(x, y)?.t;
      const kind = obj ?? tm.ground(x, y).t;
      assert.ok(!sitKindsOn(m).has(kind), `"${t.text.slice(0, 50)}" points at [${m},${x},${y}] (${kind}), a seat: Space sits`);
      const arms = (EXAMINES[kind] ?? []).filter((a) => !a.map || a.map === m);
      const answers = obj ? arms.length > 0 : arms.some((a) => a.when);
      assert.ok(answers, `"${t.text.slice(0, 50)}" points at [${m},${x},${y}] (${kind}), which is only floor`);
    }
  });

  it('does not point at the people the critics were sent to with nothing new', () => {
    const at = (flags: string[]) => {
      const s = new GameState();
      for (const f of flags) (s as unknown as { flags: Set<string> }).flags.add(f);
      return s;
    };
    // Bakari after the sail: only his own "well sailed" was left (Zanzibar).
    assert.ok(hasNews('bakari', at(['c7.arrived'])), 'an unmet Bakari is news');
    assert.ok(!hasNews('bakari', at(['c7.arrived', 'c7.met.bakari', 'c7.sail.ok'])), 'Bakari after the sail');
    // Mi-ja after the hotteok (Busan), Hana after the stars (the ship).
    assert.ok(!hasNews('mija', at(['c5.met.mija', 'c5.hotteok.done'])), 'Mi-ja after the hotteok');
    assert.ok(!hasNews('hanaC3', at(['c3.met.hana', 'c3.stars.done'])), 'Hana after the stars');
    // Joseph between meeting and the line: nothing until the equator.
    assert.ok(!hasNews('joseph', at(['c3.met.joseph', 'c3.baon.done'])), 'Joseph after meeting');
    // Two visits that are one errand still count: the second visit is news.
    assert.ok(hasNews('juma', at(['c7.arrived', 'c7.met.juma'])), 'Juma before saa mbili');
  });

  it("a crowd task's thread goes to the person its sentence is about, not the nearest stranger", () => {
    const at = (flags: string[]) => {
      const s = new GameState();
      for (const f of flags) (s as unknown as { flags: Set<string> }).flags.add(f);
      return s;
    };
    const crowd = (needle: string) => {
      const t = TASKS.find((x) => Array.isArray(x.who) && x.text.includes(needle));
      assert.ok(t, `no crowd task mentioning ${needle}`);
      return t;
    };
    // La Caleta: the chip says "Marisol sells lisa and directions"; N once
    // pointed west at Rafa, an unmet passer-by, from beside her stall.
    assert.deepEqual(threadWho(crowd('Marisol sells lisa'), at(['c2.arrived'])), ['marisol']);
    // The ship: "the galley is the ship's front door"; N once pointed at
    // Joseph on deck, the nearest live name, while the chip said galley.
    assert.deepEqual(threadWho(crowd('the galley is the ship'), at(['c3.arrived'])), ['mangben']);
    // A lead the thread cannot reach yields to anyone it can.
    const caleta = crowd('Marisol sells lisa');
    const others = threadWho(caleta, at(['c2.arrived']), (id) => id !== 'marisol');
    assert.ok(others.length > 1 && !others.includes('marisol'), 'unreachable lead hands over to the rest');
    // Every crowd task's lead is someone with news when the crowd first opens,
    // or the rule above would never apply to it.
    for (const t of TASKS.filter((x) => Array.isArray(x.who) && x.who.length > 1)) {
      const lead = whoOf(t)[0]!;
      assert.ok(npcById.has(lead), `"${t.text.slice(0, 40)}" leads with unknown ${lead}`);
    }
  });

  it('the yarn steps around floor painted over by a tall prop when a short way round exists', () => {
    // A 7x3 strip: the player at the left, the goal at the right, and the
    // middle row's centre cell sits under a lamp's head (walkable, overhung).
    //   . . . . . . .
    //   P . . L . . G     L = overhung floor
    //   . . . . . . .
    const w = 7;
    const h = 3;
    const over = new Set([3 + 1 * w]);
    const goal = new Set([6 + 1 * w]);
    const extra = (x: number, y: number) => (over.has(y * w + x) ? 6 : 0);
    const path = cheapestPath(w, h, [0, 1], goal, () => false, extra)!;
    assert.ok(path, 'reaches the goal');
    assert.ok(!path.some(([x, y]) => over.has(y * w + x)), 'goes round the lamp, not through it');
    assert.equal(path.length, 8, 'by the shortest way round (two extra steps)');
    // With no way round (a one-tile lane), it still goes: through, never nowhere.
    const lane = cheapestPath(w, 1, [0, 0], new Set([6]), () => false, (x) => (x === 3 ? 6 : 0))!;
    assert.equal(lane.length, 6);
    // And with nothing overhung it is exactly the breadth-first walk.
    const flat = cheapestPath(w, h, [0, 1], goal, () => false, () => 0)!;
    assert.deepEqual(flat, [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1]]);
  });

  it('knows every flag the engine reads by name', () => {
    // The guide decides "news" from who reads a flag. Content conditions it
    // scans itself; flags read in code it must be told about (CODE_READS in
    // guide.ts), or raising them would look like idle chatter.
    const dirs = ['src', 'src/engine', 'src/ui', 'src/ui/games', 'src/render'];
    const raised = new Set(
      Object.values(NODES).flatMap((n) => (n.effects ?? []).filter((e) => e.startsWith('set:')).map((e) => e.slice(4))),
    );
    const missing: string[] = [];
    for (const d of dirs) {
      const dir = new URL(`../${d}/`, import.meta.url);
      for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
        const src = readFileSync(new URL(f, dir), 'utf8');
        for (const m of src.matchAll(/\bhas\('([A-Za-z0-9_.]+)'\)/g)) {
          const flag = m[1]!;
          // replay.mode is never news on purpose: another go at a won game.
          if (flag !== 'replay.mode' && raised.has(flag) && !isProgressFlag(flag, '\u0000')) missing.push(`${d}/${f}: ${flag}`);
        }
      }
    }
    assert.deepEqual(missing, [], 'add these to CODE_READS in src/content/guide.ts');
  });

  it('every task that names people names real ones', () => {
    const ids = new Set(NPCS.map((n) => n.id));
    for (const t of TASKS) for (const id of whoOf(t)) assert.ok(ids.has(id), `unknown npc ${id} in "${t.text.slice(0, 40)}"`);
  });

  it('a task that names one person names someone who can finish it', () => {
    // The guide drops a who-task once its person runs out of news. If the
    // thing that closes the task lives somewhere else (a counter, a post box,
    // another villager), the chip drops it unfinished and the thread never
    // points at the real place. Mail at Ali's jetty did exactly this.
    const problems = TASKS.flatMap((t) => {
      const who = whoOf(t);
      if (t.at || who.length !== 1 || !t.when?.not?.length) return [];
      const raised = raisedBy(who[0]!);
      return t.when.not.some((f) => raised.has(f))
        ? []
        : [`"${t.text.slice(0, 60)}" names ${who[0]}, who never raises ${t.when.not.join(' or ')}`];
    });
    assertKnown(problems, KNOWN_FINISH);
  });
});

/** Every flag a villager's conversations can raise, games they start included. */
function raisedBy(npcId: string): Set<string> {
  const out = new Set<string>();
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const node = NODES[id];
    if (!node) return;
    for (const eff of node.effects ?? []) {
      const sep = eff.indexOf(':');
      const kind = sep < 0 ? eff : eff.slice(0, sep);
      const arg = sep < 0 ? '' : eff.slice(sep + 1);
      if (kind === 'set') {
        out.add(arg);
        for (const g of GAMES) if (g.flag === arg) visit(g.doneNode);
        // The album closes into its own scene, exactly as settle() runs it.
        if (arg === 'album.open') visit('c10.album.close');
      }
      if (kind === 'journal') out.add(`page.${arg}`);
      if (kind === 'letter' || kind === 'letterread') out.add(`letter.read.${arg}`);
    }
    if (node.next) visit(node.next);
    for (const c of node.choices ?? []) visit(c.goto);
  };
  for (const e of npcById.get(npcId)?.entry ?? []) visit(e.node);
  return out;
}
