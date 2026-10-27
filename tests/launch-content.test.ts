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

/** The node a person opens with under these flags, as the engine picks it. */
const entryFor = (npcId: string, flags: Iterable<string>) => {
  const set = new Set(flags);
  return NPCS.find((n) => n.id === npcId)?.entry.find((e) => holds(set, e.when))?.node;
};

/** Every flag (and page) raised along any open branch from `start`. */
const raises = (start: string, flags: Iterable<string>): Set<string> => {
  const out = new Set(flags);
  for (const id of reach(start)) {
    for (const eff of NODES[id]!.effects ?? []) {
      if (eff.startsWith('set:')) out.add(eff.slice(4));
      if (eff.startsWith('journal:')) out.add(`page.${eff.slice(8)}`);
    }
  }
  return out;
};

/**
 * Effects land, and save, as each line opens. A journal closed between the
 * line that marks the meeting and the line that hands over the errand came
 * back with a person who no longer had the errand to give.
 */
describe('a journal closed mid-conversation does not strand the story', () => {
  const afterNode = (...nodes: string[]) =>
    nodes.flatMap((id) =>
      (NODES[id]!.effects ?? []).flatMap((e) =>
        e.startsWith('set:') ? [e.slice(4)] : e.startsWith('journal:') ? [`page.${e.slice(8)}`] : [],
      ),
    );

  const cases: [string, string, string[], string[], string][] = [
    // [who, why, saved before the reload, the line the reload landed on, what must still be reachable]
    ['rosa', 'the bundle', [], ['rosa.first', 'rosa.coins'], 'errand.rosa-bundle'],
    ['rosa', 'the bundle', [], ['rosa.first', 'rosa.thanks'], 'errand.rosa-bundle'],
    ['justina', 'the dig', ['met.rosa', 'errand.rosa-bundle'], ['justina.bundle'], 'dig.invite'],
    ['joginder', 'the seva', ['c11.arrived', 'c11.met.jog', 'c11.rumal'], ['c11.jog.meal'], 'errand.seva-atta'],
    ['alfio', 'the granita', ['c8.arrived'], ['c8.alfio.first'], 'c8.granita'],
    ['alfio', 'the granita', ['c8.arrived'], ['c8.alfio.first', 'c8.alfio.cappuccino'], 'c8.granita'],
  ];
  for (const [who, why, before, lines, need] of cases) {
    it(`${who}: reloaded after ${lines.at(-1)}, ${why} is still offered`, () => {
      const saved = [...before, ...afterNode(...lines)];
      assert.ok(!saved.includes(need), `${need} was already saved; the case proves nothing`);
      const node = entryFor(who, saved);
      assert.ok(node, `${who} has nothing to say`);
      assert.ok(raises(node, saved).has(need), `${who} opens with ${node}, which never reaches ${need}`);
    });
  }

  it('re-entering those lines doubles nothing', () => {
    // Each catch-up re-enters a line whose effects only raise flags, fill
    // pages (a page already held is not filled twice) or name the errand
    // already named: nothing counts, nothing is handed out twice.
    for (const id of ['rosa.bundle', 'justina.watia', 'c11.jog.meal', 'c8.alfio.first']) {
      for (const eff of NODES[id]!.effects ?? []) {
        assert.match(eff, /^(set|journal|errand):/, `${id}: ${eff} is not safe to apply twice`);
      }
    }
  });
});
