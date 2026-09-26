import assert from 'node:assert/strict';
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
  type WorldTask,
} from '../src/content/world';
import { atFor, hasNews, liveWho, nextMapToward, npcMap, openTasks, whoOf } from '../src/content/guide';

/**
 * Follow Nani's red thread, and nothing else, from the first morning in
 * Ch'aska Pampa to the last page at the well.
 *
 * The walker is a player who presses N, walks to wherever the thread says,
 * and presses Space there: talks to the person, or examines the thing, or
 * steps through the door. It takes every open dialogue branch (the thread
 * guides; it does not choose for you), plays every game it is handed, and
 * reads every letter. Each chapter must be finished this way, and then the
 * thread must carry the walker on to the next chapter's first footfall.
 *
 * Holding the thread honest means three promises, checked at every step:
 * while a chapter is open the thread never rests; it never points at a
 * person with nothing new to say; and doing what it asks always changes
 * something, so it can never lead the player around in a circle.
 */

const npcById = new Map(NPCS.map((n) => [n.id, n] as const));
const tileMaps = new Map(Object.entries(REGION_MAPS).map(([id, d]) => [id, new TileMap(d)] as const));

/** The object at a cell as the dressings leave it for these flags. */
function kindAt(state: GameState, mapId: string, x: number, y: number): string | null {
  const tm = tileMaps.get(mapId);
  if (!tm) return null;
  let obj = tm.object(x, y)?.t ?? null;
  for (const d of DRESSINGS) {
    if (d.map !== mapId || !state.check(d.when)) continue;
    if (d.swap && obj === d.swap.from) obj = d.swap.to.t;
    for (const [cx, cy, def] of d.cells ?? []) if (cx === x && cy === y) obj = def?.t ?? null;
  }
  return obj ?? tm.ground(x, y).t;
}

type Target =
  | { task: WorldTask; kind: 'who'; id: string; map: string }
  | { task: WorldTask; kind: 'at'; map: string; x: number; y: number };

class Walker {
  state = new GameState();
  place = 'village';
  log: string[] = [];

  constructor() {
    // The travel effect warps once the words close; the walker just goes.
    this.state.on('travel', (d) => {
      this.pendingTravel = d.map;
    });
    this.state.on('letter', (id) => {
      this.pendingLetters.push(id);
    });
  }
  private pendingTravel: string | null = null;
  private pendingLetters: string[] = [];

  sig(): string {
    return [
      this.place,
      this.state.errand ?? '',
      [...this.state.pages()].sort().join(','),
      // Flags are private; the save payload is the honest readback.
      JSON.stringify((this.state as unknown as { flags: Set<string> }).flags.size),
      [...(this.state as unknown as { flags: Set<string> }).flags].sort().join(','),
    ].join('|');
  }

  /** Every open branch of a conversation, effects applied on entry. */
  walk(nodeId: string, seen = new Set<string>()) {
    if (seen.has(nodeId)) return;
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
    this.place = mapId;
    this.settle();
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
      const ids = liveWho(task, this.state).filter((id) => reachable(npcMap(id) ?? ''));
      const id = ids.find((i) => npcMap(i) === this.place) ?? ids[0];
      if (id) return { task, kind: 'who', id, map: npcMap(id)! };
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
      this.walk(entry.node);
      this.settle();
      return null;
    }
    const { map: m, x, y } = t;
    // The terraces: a mound is dug by facing it, one at a time.
    const mound = DIG_SPOTS.find((s) => s.at[0] === x && s.at[1] === y && !this.state.has(s.flag));
    if (m === 'village' && mound && this.state.has('dig.invite') && !this.state.has('dig.done')) {
      this.walk(mound.node);
      this.settle();
      return null;
    }
    const door = REGION_MAPS[m]?.triggers?.find(
      (tr) => tr.type === 'door' && tr.at[0] === x && tr.at[1] === y,
    );
    if (door && door.type === 'door') {
      this.enter(door.to);
      return null;
    }
    const kind = kindAt(this.state, m, x, y);
    const arm = kind ? EXAMINES[kind]?.find((a) => (!a.map || a.map === m) && this.state.check(a.when)) : undefined;
    if (!arm) return `the thread ends at [${m},${x},${y}] (${kind}) and nothing there answers`;
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

function journey(): string[] {
  const w = new Walker();
  const problems: string[] = [];
  w.walk('intro.wake');
  w.settle();
  for (const ch of MILESTONES) {
    if (ch.arrived && !w.state.has(ch.arrived)) {
      problems.push(`[${ch.id}] the previous chapter's thread never brought the walker here`);
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
        problems.push(`[${ch.id}] ${phase}: following the thread never finishes the chapter (150 steps)`);
        broke = true;
        break;
      }
      const t = w.thread();
      if (!t) {
        const chip = openTasks(TASKS, w.state)[0]?.text.slice(0, 60) ?? '(no chip)';
        problems.push(`[${ch.id}] ${phase} on ${w.place}: the thread rests. chip: "${chip}"`);
        broke = true;
        break;
      }
      if (t.kind === 'who' && !hasNews(t.id, w.state)) {
        problems.push(`[${ch.id}] the thread points at ${t.id}, who has nothing new to say`);
      }
      const before = w.sig();
      const where = t.kind === 'who' ? t.id : `[${t.map},${t.x},${t.y}]`;
      const complaint = w.act(t);
      if (complaint) {
        problems.push(`[${ch.id}] "${t.task.text.slice(0, 50)}": ${complaint}`);
        broke = true;
        break;
      }
      if (w.sig() === before) {
        problems.push(`[${ch.id}] the thread leads to ${where} and nothing changes there ("${t.task.text.slice(0, 50)}")`);
        broke = true;
        break;
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
  return problems;
}

describe("following only Nani's thread", () => {
  it('finishes every chapter, never resting and never circling', () => {
    const problems = journey();
    assert.deepEqual(problems, [], `\n${problems.join('\n')}`);
  });

  it('every task.at names a door to walk through or a thing to face', () => {
    // A bare floor tile is neither: the loop lands under the player's feet
    // and Space there says only what the floor always says. Ground may still
    // be the thing (the petal lane, the tidepools) when it has story arms.
    for (const t of TASKS) {
      if (!t.at) continue;
      const [m, x, y] = t.at;
      const tm = tileMaps.get(m)!;
      if (tm.triggerAt(x, y)?.type === 'door') continue;
      if (m === 'village' && DIG_SPOTS.some((s) => s.at[0] === x && s.at[1] === y)) continue;
      const obj = tm.object(x, y)?.t;
      const kind = obj ?? tm.ground(x, y).t;
      const arms = (EXAMINES[kind] ?? []).filter((a) => !a.map || a.map === m);
      const answers = obj ? arms.length > 0 : arms.some((a) => a.when);
      assert.ok(answers, `"${t.text.slice(0, 50)}" points at [${m},${x},${y}] (${kind}), which is only floor`);
    }
  });

  it('every task that names people names real ones', () => {
    const ids = new Set(NPCS.map((n) => n.id));
    for (const t of TASKS) for (const id of whoOf(t)) assert.ok(ids.has(id), `unknown npc ${id} in "${t.text.slice(0, 40)}"`);
  });
});
