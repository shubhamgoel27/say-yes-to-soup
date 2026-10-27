import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Cond } from '../src/content/schema';
import { CHAPTERS, DRESSINGS, EXAMINES, NODES, NPCS, REGION_MAPS } from '../src/content/world';
import { ROUTE } from '../src/content/route';

/**
 * Content regressions found in the pre-launch review. Each block names the
 * soft-lock or slip it pins down, and reads the merged world the engine reads.
 */

const holds = (flags: ReadonlySet<string>, c?: Cond) =>
  !c || ((c.has ?? []).every((f) => flags.has(f)) && !(c.not ?? []).some((f) => flags.has(f)));

/** The arm the engine would pick for a kind on a map, as main.ts does. */
const examine = (kind: string, mapId: string, flags: Iterable<string>) => {
  const set = new Set(flags);
  return EXAMINES[kind]?.find((a) => (!a.map || a.map === mapId) && holds(set, a.when))?.node;
};

/** Every node a conversation can reach from `start`, choices and all. */
const reach = (start: string): string[] => {
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id) || !NODES[id]) continue;
    seen.add(id);
    const n = NODES[id]!;
    if (n.next) stack.push(n.next);
    for (const c of n.choices ?? []) stack.push(c.goto);
  }
  return [...seen];
};

const RETURN = CHAPTERS.find((c) => c.id === 'return')!;

/**
 * Flags every save in the Return holds: each earlier stop on the route
 * reached and finished, and the homecoming's own arrival.
 */
const RETURN_FLAGS: ReadonlySet<string> = new Set([
  'c10.arrived',
  ...ROUTE.filter((s) => s.id !== 'home').flatMap((s) => [...(s.arrived?.has ?? []), ...(s.complete?.has ?? [])]),
]);

/**
 * The maps the Return is played on: where its people stand, where its props
 * speak, and everything a door leads to from there (the ship puts you down
 * at La Caleta and you walk the whole first road back up).
 */
const RETURN_MAPS: ReadonlySet<string> = (() => {
  const ext = new Set((RETURN.npcExtensions ?? []).map((x) => x.npcId));
  const start = new Set<string>([RETURN.arrival!.map]);
  for (const n of NPCS) if (ext.has(n.id) || RETURN.npcs.some((r) => r.id === n.id)) start.add(n.map);
  for (const arms of Object.values(RETURN.examines)) for (const a of arms) if (a.map) start.add(a.map);
  const out = new Set<string>();
  const stack = [...start];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id) || !REGION_MAPS[id]) continue;
    out.add(id);
    for (const t of REGION_MAPS[id]!.triggers ?? []) if (t.type === 'door') stack.push(t.to);
  }
  return out;
})();

describe('the Return never puts you back on the ship', () => {
  it('the Return is walked on the first road', () => {
    for (const m of ['la-caleta', 'picanteria', 'la-bajada', 'east-road', 'village']) {
      assert.ok(RETURN_MAPS.has(m), `${m} should count as a Return map`);
    }
  });

  /**
   * Arms are walked in the engine's order. An arm is live unless one of its
   * `not` flags is certain in the Return; the walk stops at the first arm
   * that certainly holds (every `has` certain, no `not`, no darkness rule),
   * because nothing below it can ever be picked. Conservative on purpose:
   * any arm that might win is held to the rule.
   */
  /** Every kind that can stand on a map: its legend, and its dressings. */
  const kindsOn = (mapId: string): Set<string> => {
    const kinds = new Set(Object.values(REGION_MAPS[mapId]!.legend).map((d) => d.t));
    for (const d of DRESSINGS) {
      if (d.map !== mapId) continue;
      if (d.swap) kinds.add(d.swap.to.t);
      for (const [, , o] of d.cells ?? []) if (o) kinds.add(o.t);
    }
    return kinds;
  };

  it('no examine arm reachable on a Return map journeys anywhere once c10.arrived is set', () => {
    const offenders: string[] = [];
    for (const mapId of RETURN_MAPS) {
      const kinds = kindsOn(mapId);
      for (const [kind, arms] of Object.entries(EXAMINES)) {
        if (!kinds.has(kind)) continue;
        for (const arm of arms) {
          if (arm.map && arm.map !== mapId) continue;
          if ((arm.when?.not ?? []).some((f) => RETURN_FLAGS.has(f))) continue;
          for (const id of reach(arm.node)) {
            const travel = (NODES[id]!.effects ?? []).find((e) => e.startsWith('travel:'));
            if (travel) offenders.push(`${mapId}: ${kind} -> ${arm.node} (${arm.chapter}) reaches ${id} [${travel}]`);
          }
          const certain =
            !arm.dark && !(arm.when?.not ?? []).length && (arm.when?.has ?? []).every((f) => RETURN_FLAGS.has(f));
          if (certain) break;
        }
      }
    }
    assert.deepEqual(offenders, [], offenders.join('\n'));
  });

  it('La Caleta’s pier sign boards the Yacana only until she sails, then welcomes you home', () => {
    const done = ['story.complete', 'c2.arrived', 'c2.complete'];
    assert.equal(examine('piersign', 'la-caleta', done), 'c3.board');
    assert.notEqual(examine('piersign', 'la-caleta', [...done, 'c3.arrived']), 'c3.board');
    const home = examine('piersign', 'la-caleta', RETURN_FLAGS);
    assert.equal(home, 'c10.ex.piersign');
    assert.ok(!reach(home!).some((id) => (NODES[id]!.effects ?? []).some((e) => e.startsWith('travel:'))));
  });
});
