import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GameState } from '../src/engine/state';
import { DIG_SPOTS, EVENT_NODES, EXAMINES, NODES, NPCS } from '../src/content/dev/npcs';
import { ERRAND_BY_ID, JOURNAL, JOURNAL_BY_ID, TASKS } from '../src/content/dev/journal';
import { REGION_MAPS } from '../src/content/dev/region';
import type { MapData } from '../src/engine/grid';

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

  it('every examine node exists', () => {
    for (const [kind, arms] of Object.entries(EXAMINES)) {
      for (const arm of arms) assert.ok(NODES[arm.node], `examine ${kind} -> ${arm.node} missing`);
      const last = arms.at(-1);
      assert.ok(last && !last.when, `examine ${kind} has no unconditional fallback arm`);
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
    while (state.pageCount() !== before && guard++ < 30) {
      before = state.pageCount();
      for (const npc of NPCS) {
        const entry = npc.entry.find((e) => state.check(e.when));
        if (entry) walk(entry.node, new Set());
      }
      for (const arms of Object.values(EXAMINES)) {
        const arm = arms.find((a) => state.check(a.when));
        if (arm) walk(arm.node, new Set());
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
    while (state.pageCount() !== before && guard++ < 30) {
      before = state.pageCount();
      for (const npc of NPCS) {
        const entry = npc.entry.find((e) => state.check(e.when));
        if (entry) walk(entry.node, new Set());
      }
      for (const arms of Object.values(EXAMINES)) {
        const arm = arms.find((a) => state.check(a.when));
        if (arm) walk(arm.node, new Set());
      }
      for (const ev of EVENT_NODES) {
        if (state.check(ev.when)) walk(ev.node, new Set());
      }
    }

    const missing = JOURNAL.filter((e) => !state.hasPage(e.id)).map((e) => e.id);
    assert.deepEqual(missing, [], `unreachable journal pages: ${missing.join(', ')}`);
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
