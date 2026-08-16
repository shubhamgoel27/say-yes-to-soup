import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, it } from 'node:test';

import { GameState } from '../src/engine/state';
import {
  DIG_SPOTS,
  ERRAND_BY_ID,
  EVENT_NODES,
  EXAMINES,
  JOURNAL,
  JOURNAL_BY_ID,
  LETTERS,
  NODES,
  NPCS,
  RECALLS,
  REGION_MAPS,
  TASKS,
} from '../src/content/world';
import { TileMap } from '../src/engine/grid';
import { seamKinds } from '../src/engine/renderer';
import type { ExamineArm } from '../src/content/schema';
import type { MapData } from '../src/engine/grid';

/**
 * Examines are map-contextual: an arm tagged with a map only fires there.
 * Walking helpers visit each context a kind can be seen from.
 */
function examineContexts(arms: ExamineArm[]): (string | undefined)[] {
  const tagged = [...new Set(arms.filter((a) => a.map).map((a) => a.map))];
  return [...tagged, undefined];
}
function armFor(arms: ExamineArm[], ctx: string | undefined, state: GameState): ExamineArm | undefined {
  return arms.find((a) => (!a.map || a.map === ctx) && state.check(a.when));
}

/**
 * Content integrity: every reference in the dialogue graph must resolve, and
 * every journal page must be reachable by actually playing. A typo in a goto
 * or an orphaned page is a bug the compiler can't see.
 */

describe('dialogue graph', () => {
  it('every goto/next target exists', () => {
    for (const [id, node] of Object.entries(NODES)) {
      if (node.next) assert.ok(NODES[node.next], `${id} -> next ${node.next} missing`);
      for (const c of node.choices ?? []) {
        assert.ok(NODES[c.goto], `${id} -> choice ${c.goto} missing`);
      }
    }
  });

  it('every NPC entry node exists and ends with an unconditional fallback', () => {
    for (const npc of NPCS) {
      for (const e of npc.entry) assert.ok(NODES[e.node], `${npc.id} entry ${e.node} missing`);
      const last = npc.entry.at(-1);
      assert.ok(last && !last.when, `${npc.id} has no unconditional fallback entry`);
    }
  });

  it('every examine node exists, with an untagged unconditional fallback', () => {
    for (const [kind, arms] of Object.entries(EXAMINES)) {
      for (const arm of arms) assert.ok(NODES[arm.node], `examine ${kind} -> ${arm.node} missing`);
      const last = arms.at(-1);
      assert.ok(last && !last.when && !last.map, `examine ${kind} has no universal fallback arm`);
    }
  });

  it('every event node exists, and dig spots sit on open terrace beds', () => {
    for (const ev of EVENT_NODES) assert.ok(NODES[ev.node], `event node ${ev.node} missing`);
    const village = REGION_MAPS['village'];
    assert.ok(village);
    for (const s of DIG_SPOTS) {
      const [x, y] = s.at;
      const ch = village?.ground[y]?.[x];
      assert.equal(village?.legend[ch ?? ' ']?.t, 'crop', `dig spot ${s.at} is not on crop ground`);
      // Nothing may sit on top of the bed (a roof over a dig spot is a bug
      // this exact test once missed), and the player must be able to stand
      // beside it to dig.
      const oCh = village?.objects?.[y]?.[x] ?? ' ';
      assert.equal(oCh, ' ', `dig spot ${s.at} is covered by object "${oCh}"`);
      const above = village?.objects?.[y - 1]?.[x] ?? ' ';
      const aboveDef = above === ' ' ? undefined : village?.legend[above];
      const aboveGround = village?.legend[village?.ground[y - 1]?.[x] ?? ' '];
      assert.ok(
        aboveDef?.solid !== true && aboveGround?.solid !== true,
        `no place to stand above dig spot ${s.at}`,
      );
      assert.ok(NODES[s.node], `dig node ${s.node} missing`);
    }
  });

  it('every journal effect references a real page, every errand a real label', () => {
    for (const [id, node] of Object.entries(NODES)) {
      for (const eff of node.effects ?? []) {
        if (eff.startsWith('journal:')) {
          assert.ok(JOURNAL_BY_ID.has(eff.slice(8)), `${id}: unknown page ${eff}`);
        }
        if (eff.startsWith('errand:')) {
          assert.ok(ERRAND_BY_ID.has(eff.slice(7)), `${id}: unknown errand ${eff}`);
        }
      }
    }
  });

  it('lines stay within the two-short-sentences budget', () => {
    for (const [id, node] of Object.entries(NODES)) {
      for (const line of node.lines) {
        assert.ok(line.text.length <= 150, `${id}: line too long (${line.text.length}): "${line.text.slice(0, 50)}..."`);
      }
    }
  });
});

describe('the task list never leaves the player stuck', () => {
  it('a fresh game always has an active task', () => {
    const state = new GameState();
    assert.ok(TASKS.some((t) => state.check(t.when)), 'no task matched a fresh save');
  });

  it('the chicha carry always surfaces a task, full or spilled', () => {
    const carrying = new GameState();
    carrying.apply(['set:carry.chicha']);
    const t1 = TASKS.find((t) => carrying.check(t.when));
    assert.ok(t1 && /caporal/i.test(t1.text), 'carrying state has no caporal task');

    const spilled = new GameState();
    spilled.apply(['set:chicha.spilled']);
    const t2 = TASKS.find((t) => spilled.check(t.when));
    assert.ok(t2 && /refill/i.test(t2.text), 'spilled state has no refill task');
  });

  it('every mid-story flag combination the chains produce matches some task', () => {
    // Walk the whole story (same fixpoint as the reachability test) and after
    // every effect application, assert at least one task is active.
    const state = new GameState();
    const walk = (nodeId: string, seen: Set<string>) => {
      if (seen.has(nodeId)) return;
      seen.add(nodeId);
      const node = NODES[nodeId];
      if (!node) return;
      state.apply(node.effects);
      assert.ok(
        TASKS.some((t) => state.check(t.when)),
        `no active task after ${nodeId}`,
      );
      if (node.next) walk(node.next, seen);
      for (const c of node.choices ?? []) walk(c.goto, seen);
    };
    let guard = 0;
    let before = -1;
    while (state.pageCount() !== before && guard++ < 100) {
      before = state.pageCount();
      for (const npc of NPCS) {
        const entry = npc.entry.find((e) => state.check(e.when));
        if (entry) walk(entry.node, new Set());
      }
      for (const arms of Object.values(EXAMINES)) {
        for (const ctx of examineContexts(arms)) {
          const arm = armFor(arms, ctx, state);
          if (arm) walk(arm.node, new Set());
        }
      }
      for (const ev of EVENT_NODES) {
        if (state.check(ev.when)) walk(ev.node, new Set());
      }
    }
  });
});

describe('map integrity', () => {
  const solidAt = (m: MapData, x: number, y: number) => {
    const g = m.legend[m.ground[y]?.[x] ?? ' '];
    const oCh = m.objects?.[y]?.[x] ?? ' ';
    const o = oCh === ' ' ? undefined : m.legend[oCh];
    return g?.solid === true || o?.solid === true;
  };

  it('all rows are the same width (a multi-char legend key would break this)', () => {
    for (const m of Object.values(REGION_MAPS)) {
      const w = m.ground[0]?.length ?? 0;
      m.ground.forEach((row, y) => assert.equal(row.length, w, `${m.id} ground row ${y}`));
      m.objects?.forEach((row, y) => assert.equal(row.length, w, `${m.id} object row ${y}`));
    }
  });

  /**
   * Every tile kind a map names must have art somewhere, or the renderer
   * falls back to a magenta placeholder. This shipped once: a composition
   * pass added ground kinds, the maps that used them were committed, and
   * their art was left behind, so the first screen of the game drew the
   * village plaza in solid magenta. A map and its paint travel together.
   */
  /**
   * A per-map re-skin says "on this map draw kind X with kind Y's art". If Y
   * is misspelled, the room silently falls back to magenta exactly the way a
   * missing kind does, and the coverage test above cannot see it because the
   * map never names Y. Flagged by the agent that introduced most of them.
   */
  it('every per-map re-skin points at a kind that has art', () => {
    const setsDir = new URL('../src/art/sets/', import.meta.url);
    const files = readdirSync(setsDir).filter((f) => f.endsWith('.ts'));
    const src = [
      readFileSync(new URL('../src/art/tiles.ts', import.meta.url), 'utf8'),
      ...files.map((f) => readFileSync(new URL(`../src/art/sets/${f}`, import.meta.url), 'utf8')),
    ].join('\n');
    const painted = new Set<string>();
    for (const m of src.matchAll(/\bmake\(\s*'([A-Za-z0-9_]+)'/g)) painted.add(m[1] as string);
    for (const m of src.matchAll(/([A-Za-z0-9_]+)\s*:\s*'[A-Za-z0-9_]+'/g)) painted.add(m[1] as string);
    for (const k of ['path', 'water', 'sea', 'bridge']) painted.add(k);

    const bad: string[] = [];
    for (const f of files) {
      const text = readFileSync(new URL(`../src/art/sets/${f}`, import.meta.url), 'utf8');
      const block = /skins\s*:\s*\{([\s\S]*?)\n\s{0,4}\},/.exec(text);
      if (!block) continue;
      // Inside a skins block every `from: 'to'` pair names a target kind.
      for (const m of (block[1] as string).matchAll(/([A-Za-z0-9_]+)\s*:\s*'([A-Za-z0-9_]+)'/g)) {
        const target = m[2] as string;
        if (!painted.has(target)) bad.push(`${f}: ${m[1]} -> ${target}`);
      }
    }
    assert.equal(bad.length, 0, `re-skins pointing at art that does not exist: ${bad.join(', ')}`);
  });

  it('every tile kind a map uses has art painted for it', () => {
    const src = [
      readFileSync(new URL('../src/art/tiles.ts', import.meta.url), 'utf8'),
      ...readdirSync(new URL('../src/art/sets/', import.meta.url))
        .filter((f) => f.endsWith('.ts'))
        .map((f) => readFileSync(new URL(`../src/art/sets/${f}`, import.meta.url), 'utf8')),
    ].join('\n');
    // Kinds the tilesets paint, plus kinds that borrow another kind's art.
    const painted = new Set<string>();
    for (const m of src.matchAll(/\bmake\(\s*'([A-Za-z0-9_]+)'/g)) painted.add(m[1] as string);
    // Aliases borrow another kind's art. They appear both one per line and
    // inline as `aliases: { ferrysign: 'signpost' }`, so this is unanchored.
    for (const m of src.matchAll(/([A-Za-z0-9_]+)\s*:\s*'[A-Za-z0-9_]+'/g)) {
      painted.add(m[1] as string);
    }
    // Painted by dedicated code paths rather than a make() call: the path
    // autotiler builds from pathCore, and water and sea are frame arrays.
    for (const k of ['path', 'water', 'sea', 'bridge']) painted.add(k);
    const missing = new Set<string>();
    for (const m of Object.values(REGION_MAPS)) {
      for (const def of Object.values(m.legend)) {
        const kind = (def as { t: string }).t;
        if (kind === 'void' || kind === 'blocked') continue;
        if (!painted.has(kind)) missing.add(`${m.id}:${kind}`);
      }
    }
    assert.equal(
      missing.size,
      0,
      `tile kinds used by a map with no art anywhere: ${[...missing].join(', ')}`,
    );
  });

  it('every map character exists in the legend', () => {
    for (const m of Object.values(REGION_MAPS)) {
      for (const row of m.ground) {
        for (const ch of row) assert.ok(m.legend[ch], `${m.id}: ground char "${ch}" not in legend`);
      }
      for (const row of m.objects ?? []) {
        for (const ch of row) {
          if (ch === ' ') continue;
          assert.ok(m.legend[ch], `${m.id}: object char "${ch}" not in legend`);
        }
      }
    }
  });

  /**
   * The bug this catches shipped once and was found three more times the same
   * day: ground a player can see, drawn as walkable, that nothing connects to.
   * A map being "technically traversable" is not the same as every part of it
   * being reachable, and only a flood fill tells the difference.
   */
  it('every walkable tile is reachable from the spawn or a door', () => {
    for (const m of Object.values(REGION_MAPS)) {
      const H = m.ground.length;
      const W = m.ground[0]?.length ?? 0;
      const seen = new Set<string>();
      const queue: [number, number][] = [];
      const enter = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        const k = `${x},${y}`;
        if (seen.has(k) || solidAt(m, x, y)) return;
        seen.add(k);
        queue.push([x, y]);
      };
      // A player can begin at the spawn or step in through any trigger.
      enter(m.spawn[0], m.spawn[1]);
      for (const t of m.triggers ?? []) enter(t.at[0], t.at[1]);
      while (queue.length) {
        const [x, y] = queue.shift() as [number, number];
        enter(x + 1, y);
        enter(x - 1, y);
        enter(x, y + 1);
        enter(x, y - 1);
      }
      const orphans: string[] = [];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (!solidAt(m, x, y) && !seen.has(`${x},${y}`)) orphans.push(`${x},${y}`);
        }
      }
      assert.equal(
        orphans.length,
        0,
        `${m.id}: ${orphans.length} walkable tile(s) nobody can reach: ${orphans.slice(0, 8).join(' ')}`,
      );
    }
  });

  it('spawns and NPC homes are on walkable ground', () => {
    for (const m of Object.values(REGION_MAPS)) {
      assert.ok(!solidAt(m, ...m.spawn), `${m.id} spawn is inside something solid`);
    }
    for (const npc of NPCS) {
      const m = REGION_MAPS[npc.map];
      assert.ok(m, `${npc.id} lives on unknown map ${npc.map}`);
      if (m) assert.ok(!solidAt(m, npc.pos[0], npc.pos[1]), `${npc.id} home ${npc.pos} is solid`);
    }
  });

  it('every door leads to a real map and a walkable spawn', () => {
    for (const m of Object.values(REGION_MAPS)) {
      for (const trig of m.triggers ?? []) {
        if (trig.type !== 'door') continue;
        const dest = REGION_MAPS[trig.to];
        assert.ok(dest, `${m.id}: door to unknown map ${trig.to}`);
        if (dest) {
          assert.ok(
            !solidAt(dest, trig.spawn[0], trig.spawn[1]),
            `${m.id} -> ${trig.to}: door spawn ${trig.spawn} is solid`,
          );
        }
        assert.ok(!solidAt(m, trig.at[0], trig.at[1]), `${m.id}: door cell ${trig.at} is solid`);
      }
    }
  });
});

describe('every journal page is reachable by play', () => {
  it('walking all dialogue branches and examines unlocks every page', () => {
    const state = new GameState();

    // Repeatedly simulate: for each NPC, take its current entry node and walk
    // every branch of the subgraph, applying effects. Loop until no new state
    // appears, mimicking a player who talks to everyone after every change.
    const walk = (nodeId: string, seen: Set<string>) => {
      if (seen.has(nodeId)) return;
      seen.add(nodeId);
      const node = NODES[nodeId];
      if (!node) return;
      state.apply(node.effects);
      if (node.next) walk(node.next, seen);
      for (const c of node.choices ?? []) walk(c.goto, seen);
    };

    let before = -1;
    let guard = 0;
    while (state.pageCount() !== before && guard++ < 100) {
      before = state.pageCount();
      for (const npc of NPCS) {
        const entry = npc.entry.find((e) => state.check(e.when));
        if (entry) walk(entry.node, new Set());
      }
      for (const arms of Object.values(EXAMINES)) {
        for (const ctx of examineContexts(arms)) {
          const arm = armFor(arms, ctx, state);
          if (arm) walk(arm.node, new Set());
        }
      }
      for (const ev of EVENT_NODES) {
        if (state.check(ev.when)) walk(ev.node, new Set());
      }
    }

    const missing = JOURNAL.filter((e) => !state.hasPage(e.id)).map((e) => e.id);
    assert.deepEqual(missing, [], `unreachable journal pages: ${missing.join(', ')}`);
  });

  it('a node whose choices are all gated can still move on', () => {
    for (const [id, node] of Object.entries(NODES)) {
      if (!node.choices?.length) continue;
      const escape = node.choices.some((c) => !c.when) || node.next;
      assert.ok(escape, `${id}: every choice is gated and there is no next`);
    }
  });

  it('the ayni errand loop opens and closes', () => {
    const state = new GameState();
    // Rosa's first conversation, coins branch, then the bundle ask.
    state.apply(NODES['rosa.coins']?.effects);
    state.apply(NODES['rosa.bundle']?.effects);
    assert.equal(state.errand, 'rosa-bundle');
    assert.ok(state.has('errand.rosa-bundle'));
    // Justina receives the bundle.
    state.apply(NODES['justina.bundle']?.effects);
    assert.equal(state.errand, null);
    assert.ok(state.has('bundle.delivered'));
    // Rosa's follow-up is now selectable.
    const rosa = NPCS.find((n) => n.id === 'rosa');
    const entry = rosa?.entry.find((e) => state.check(e.when));
    assert.equal(entry?.node, 'rosa.even');
  });
});

describe('the recall ledger stays honest across chapters', () => {
  it('every consumed key is planted by an earlier chapter or backfilled locally', () => {
    const plantedSoFar = new Set<string>();
    for (const { chapter, recall } of RECALLS) {
      for (const key of recall.consumes) {
        const ok = plantedSoFar.has(key) || key in recall.backfills;
        assert.ok(ok, `${chapter} consumes "${key}" but nothing earlier plants it and no local backfill exists`);
      }
      for (const key of recall.plants) plantedSoFar.add(key);
    }
  });

  it('every backfill locksmith node exists', () => {
    for (const { chapter, recall } of RECALLS) {
      for (const [key, node] of Object.entries(recall.backfills)) {
        assert.ok(NODES[node], `${chapter} backfill for "${key}" points at missing node ${node}`);
      }
    }
  });

  it('every declared rhyme matches a real, authored journal stitch', () => {
    for (const { chapter, recall } of RECALLS) {
      for (const [a, b] of recall.rhymes) {
        assert.ok(JOURNAL_BY_ID.has(a), `${chapter} rhyme references missing page ${a}`);
        assert.ok(JOURNAL_BY_ID.has(b), `${chapter} rhyme references missing page ${b}`);
        const entry = JOURNAL_BY_ID.get(a);
        assert.equal(entry?.rhyme?.with, b, `${chapter}: page ${a} does not carry the rhyme to ${b}`);
        assert.ok(entry?.rhyme?.note, `${chapter}: rhyme ${a} -> ${b} has no margin note from Nani`);
      }
    }
    // And the reverse: no authored rhyme goes undeclared.
    const declared = new Set(RECALLS.flatMap(({ recall }) => recall.rhymes.map(([a, b]) => `${a}->${b}`)));
    for (const e of JOURNAL) {
      if (e.rhyme) assert.ok(declared.has(`${e.id}->${e.rhyme.with}`), `undeclared rhyme on page ${e.id}`);
    }
  });

  it("chapter-local c2 flags cross the border only through the manifest", async () => {
    const { TASKS: CH1_TASKS } = await import('../src/content/dev/journal');
    const caletaPlants = new Set(RECALLS.find((r) => r.chapter === 'la-caleta')?.recall.plants ?? []);
    const referencesC2 = (cond?: { has?: string[]; not?: string[] }) =>
      [...(cond?.has ?? []), ...(cond?.not ?? [])].filter((f) => f.startsWith('c2.'));
    // Chapter One content (tasks are the border crossing that matters today).
    for (const t of CH1_TASKS) {
      for (const f of referencesC2(t.when)) {
        assert.ok(caletaPlants.has(f), `Chapter One task references "${f}" that la-caleta does not plant`);
      }
    }
  });

  it("Pilar's mid-ocean letter names the actual creature you mailed her", () => {
    for (const [flag, word] of [
      ['pilar.gift.puffer', /puffer/i],
      ['pilar.gift.star', /star/i],
      ['pilar.gift.claw', /claw|crab/i],
    ] as const) {
      const state = new GameState();
      state.apply([`set:${flag}`, 'set:c2.gift.sent']);
      const def = LETTERS.find((l) => l.id === 'c3.pilar' && state.check(l.when));
      assert.ok(def, `no c3.pilar letter for ${flag}`);
      assert.ok(def.body.some((p) => word.test(p)), `c3.pilar letter for ${flag} never mentions it`);
    }
  });

  it('every letter effect resolves, and every letter id has an unconditional variant', () => {
    const ids = new Set<string>();
    for (const node of Object.values(NODES)) {
      for (const eff of node.effects ?? []) {
        if (eff.startsWith('letter:')) ids.add(eff.slice(7));
      }
    }
    for (const id of ids) {
      const variants = LETTERS.filter((l) => l.id === id);
      assert.ok(variants.length > 0, `letter:${id} has no authored letter`);
      assert.ok(variants.at(-1) && !variants.at(-1)?.when, `letter ${id} has no unconditional fallback variant`);
    }
  });
});

/**
 * Seam feathering cuts a canvas per (ground art, direction, depth, variant)
 * and keeps it. Anything the warm pass misses gets cut mid-stride instead,
 * and the measurement that prompted this found 40 cut while walking across
 * the village, 8 of them in one frame. Each is a canvas allocation, and the
 * hitch moved depending on which way you walked.
 */
describe('every seam a map can draw is cut before the map is played', () => {
  it('warms every kind that can turn up as a neighbour, including off-map', () => {
    for (const data of Object.values(REGION_MAPS)) {
      const map = new TileMap(data);
      const warmed = seamKinds(map);
      const asked = new Set<string>();
      for (let y = 0; y < map.h; y++) {
        for (let x = 0; x < map.w; x++) {
          for (const [dx, dy] of [
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
          ]) {
            const nx = x + dx;
            const ny = y + dy;
            asked.add(map.inBounds(nx, ny) ? map.ground(nx, ny).t : 'scree');
          }
        }
      }
      const missed = [...asked].filter((k) => !warmed.has(k));
      assert.deepEqual(missed, [], `${map.id}: would cut ${missed.join(', ')} while walking`);
    }
  });
});

describe('the key stands on the player side of its lock', () => {
  // ---- shared spatial helpers (pure map data, no engine, no browser) ----
  const k = (x: number, y: number) => `${x},${y}`;
  const solidCell = (m: MapData, x: number, y: number) => {
    const H = m.ground.length;
    const W = m.ground[0]?.length ?? 0;
    if (x < 0 || y < 0 || x >= W || y >= H) return true;
    const g = m.legend[m.ground[y]?.[x] ?? ' '];
    const oCh = m.objects?.[y]?.[x] ?? ' ';
    const o = oCh === ' ' ? undefined : m.legend[oCh];
    return g?.solid === true || o?.solid === true;
  };
  const flood = (m: MapData, starts: [number, number][], extraSolid: ReadonlySet<string>) => {
    const seen = new Set<string>();
    const q: [number, number][] = [];
    const enter = (x: number, y: number) => {
      if (solidCell(m, x, y) || extraSolid.has(k(x, y)) || seen.has(k(x, y))) return;
      seen.add(k(x, y));
      q.push([x, y]);
    };
    for (const [x, y] of starts) enter(x, y);
    while (q.length) {
      const [x, y] = q.shift() as [number, number];
      enter(x + 1, y);
      enter(x - 1, y);
      enter(x, y + 1);
      enter(x, y - 1);
    }
    return seen;
  };
  /** Talkable / examinable: standing on it or on any 4-neighbour. */
  const adjacent = (seen: ReadonlySet<string>, x: number, y: number) =>
    seen.has(k(x, y)) || seen.has(k(x + 1, y)) || seen.has(k(x - 1, y)) ||
    seen.has(k(x, y + 1)) || seen.has(k(x, y - 1));
  /** Range-0 villagers never move: their bodies are part of the map. */
  const bodyCells = (mapId: string) =>
    new Set(NPCS.filter((n) => n.map === mapId && n.range === 0).map((n) => k(n.pos[0], n.pos[1])));
  /** Every way a player can appear on a map: its spawn, plus the landing of
   * every door on any other map that leads here. (The village east gate is a
   * runtime door onto east-road's own spawn, so it is already covered.) */
  const entriesInto = (mapId: string) => {
    const m = REGION_MAPS[mapId] as MapData;
    const list: { label: string; at: [number, number] }[] = [{ label: 'spawn', at: m.spawn }];
    for (const other of Object.values(REGION_MAPS)) {
      for (const t of other.triggers ?? []) {
        if (t.type === 'door' && t.to === mapId) list.push({ label: `door from ${other.id}`, at: t.spawn });
      }
    }
    return list;
  };

  /**
   * Story gates: places where a stationary body IS the lock, on purpose.
   * Each exception names the flag that opens it and the NPC whose dialogue
   * sets that flag; the tests below then insist the key stands on the locked
   * player's side of the body, which is exactly the invariant the shipped
   * Paca/Faustino softlock violated.
   */
  const GATES: { map: string; blocker: string; opensWith: string; key: string }[] = [
    // Paca (range 0) plugs the one-tile pass at [30,6] in the east-road
    // ridge until faustino.whistle sets paca.moved and she steps to [28,4].
    { map: 'east-road', blocker: 'paca', opensWith: 'paca.moved', key: 'faustino' },
  ];

  it('Faustino is reachable from the east-road entrance while Paca blocks the gap', () => {
    const m = new TileMap(REGION_MAPS['east-road'] as never);
    const paca = NPCS.find((n) => n.id === 'paca')!;
    const faustino = NPCS.find((n) => n.id === 'faustino')!;
    const solid = (x: number, y: number) =>
      !m.inBounds(x, y) || m.ground(x, y).solid === true || m.object(x, y)?.solid === true ||
      (x === paca.pos[0] && y === paca.pos[1]);
    const seen = new Set<string>([m.spawn.join(',')]);
    const q: [number, number][] = [m.spawn as [number, number]];
    while (q.length) {
      const [x, y] = q.shift()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (seen.has(nx + ',' + ny) || solid(nx, ny)) continue;
        seen.add(nx + ',' + ny);
        q.push([nx, ny]);
      }
    }
    const [fx, fy] = faustino.pos;
    const adjacent = [[fx, fy], [fx + 1, fy], [fx - 1, fy], [fx, fy + 1], [fx, fy - 1]]
      .some(([x, y]) => seen.has(x + ',' + y));
    assert.ok(adjacent, 'the man who moves the llama must stand where a blocked player can reach him');
  });

  /**
   * The general net for the Paca class of bug. The flood-fill test above
   * ignores NPC bodies and the task-graph walker ignores geometry; this test
   * lives exactly between them: with every range-0 villager solid, every door
   * and every villager a map offers must stay reachable from every way onto
   * that map. Where a body is a deliberate lock, GATES names the flag that
   * opens it, and the test insists the KEY is reachable instead.
   */
  it('with every stationary villager solid, no door or villager is sealed off', () => {
    for (const m of Object.values(REGION_MAPS)) {
      const gate = GATES.find((g) => g.map === m.id);
      const npcsHere = NPCS.filter((n) => n.map === m.id);
      const bodies = bodyCells(m.id);
      const entries = entriesInto(m.id);
      // Baseline: the bare map, flooded from everywhere at once. What was
      // never reachable (scenery beyond the ridge) is not a finding.
      const bare = flood(m, entries.map((e) => e.at), new Set());
      const doors = (m.triggers ?? []).filter((t) => t.type === 'door');
      const sealedBy = (seen: ReadonlySet<string>) => {
        const out: string[] = [];
        for (const d of doors) {
          if (bare.has(k(d.at[0], d.at[1])) && !seen.has(k(d.at[0], d.at[1]))) {
            out.push(`door@${d.at} -> ${(d as { to: string }).to}`);
          }
        }
        for (const n of npcsHere) {
          if (adjacent(bare, n.pos[0], n.pos[1]) && !adjacent(seen, n.pos[0], n.pos[1])) {
            out.push(`npc ${n.id}@${n.pos}`);
          }
        }
        return out;
      };
      const spawnSide = flood(m, [m.spawn], bodies);
      for (const e of entries) {
        const seen = flood(m, [e.at], bodies);
        const sealed = sealedBy(seen);
        if (sealed.length === 0) continue;
        assert.ok(
          gate,
          `${m.id} from ${e.label}: stationary bodies seal off ${sealed.join(', ')} ` +
            '(a range-0 villager is plugging the route; move them a tile or declare a GATES entry)',
        );
        // The gate must explain the whole seal: with the blocker stepped
        // aside (the opensWith state), everything reconnects.
        const blocker = npcsHere.find((n) => n.id === gate.blocker);
        assert.ok(blocker && blocker.range === 0, `${m.id}: GATES blocker ${gate.blocker} is not a range-0 villager here`);
        const open = new Set(bodies);
        open.delete(k(blocker.pos[0], blocker.pos[1]));
        const stillSealed = sealedBy(flood(m, [e.at], open));
        assert.deepEqual(
          stillSealed,
          [],
          `${m.id} from ${e.label}: sealed even after ${gate.opensWith} moves ${gate.blocker}: ${stillSealed.join(', ')}`,
        );
        // And the key stands on the player's side of the lock, unless this
        // entry itself lies behind it (reaching it required the flag already).
        const keyNpc = npcsHere.find((n) => n.id === gate.key);
        const entryBehindLock = !spawnSide.has(k(e.at[0], e.at[1]));
        assert.ok(
          keyNpc && (adjacent(seen, keyNpc.pos[0], keyNpc.pos[1]) || entryBehindLock),
          `${m.id} from ${e.label}: the key (${gate.key}, sets ${gate.opensWith}) is on the wrong side of ${gate.blocker}`,
        );
      }
    }
  });

  it('every gate key really sets the flag that moves its blocker', () => {
    for (const gate of GATES) {
      const keyNpc = NPCS.find((n) => n.id === gate.key);
      assert.ok(keyNpc, `GATES key ${gate.key} does not exist`);
      // Walk every branch of every entry of the key NPC; some node must
      // apply set:<opensWith>, or the lock can never open.
      const eff = `set:${gate.opensWith}`;
      let found = false;
      const walk = (id: string, seen: Set<string>) => {
        if (found || seen.has(id)) return;
        seen.add(id);
        const node = NODES[id];
        if (!node) return;
        if (node.effects?.includes(eff)) found = true;
        if (node.next) walk(node.next, seen);
        for (const c of node.choices ?? []) walk(c.goto, seen);
      };
      const seen = new Set<string>();
      for (const e of keyNpc?.entry ?? []) walk(e.node, seen);
      assert.ok(found, `${gate.key} never applies ${eff}; ${gate.blocker} would stand forever`);
    }
  });

  it('no examine kind loses its every prop to a stationary villager', () => {
    // Kind-level on purpose: several props of one kind share their words, so
    // one prop with a body in front of it is composition, not loss. Losing
    // the LAST reachable prop of a kind is loss.
    for (const m of Object.values(REGION_MAPS)) {
      const H = m.ground.length;
      const W = m.ground[0]?.length ?? 0;
      const entries = entriesInto(m.id).map((e) => e.at);
      const bare = flood(m, entries, new Set());
      const withBodies = flood(m, entries, bodyCells(m.id));
      const byKind = new Map<string, [number, number][]>();
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const oCh = m.objects?.[y]?.[x] ?? ' ';
          if (oCh === ' ') continue;
          const kind = m.legend[oCh]?.t;
          if (kind && EXAMINES[kind]) byKind.set(kind, [...(byKind.get(kind) ?? []), [x, y]]);
        }
      }
      for (const [kind, cells] of byKind) {
        if (!cells.some(([x, y]) => adjacent(bare, x, y))) continue;
        assert.ok(
          cells.some(([x, y]) => adjacent(withBodies, x, y)),
          `${m.id}: every ${kind} prop is walled off behind a stationary villager`,
        );
      }
    }
  });

  it('every dig spot keeps its digging spot with stationary villagers solid', () => {
    const village = REGION_MAPS['village'] as MapData;
    const bodies = bodyCells('village');
    for (const e of entriesInto('village')) {
      const seen = flood(village, [e.at], bodies);
      for (const s of DIG_SPOTS) {
        const [x, y] = s.at;
        assert.ok(seen.has(k(x, y - 1)), `dig spot ${s.at}: nowhere left to stand (from ${e.label})`);
      }
    }
  });
});
