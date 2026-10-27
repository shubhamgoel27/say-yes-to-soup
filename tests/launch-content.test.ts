import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Cond } from '../src/content/schema';
import {
  ARRIVALS,
  CHAPTERS,
  DRESSINGS,
  EVENT_NODES,
  EXAMINES,
  GAMES,
  LETTERS,
  NODES,
  NPCS,
  REGION_MAPS,
} from '../src/content/world';
import { ROUTE } from '../src/content/route';
import { isProgressFlag } from '../src/content/guide';

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

/**
 * The same fault, swept for everywhere. Every conversation a person, a prop
 * or an engine event can open is walked down every open branch; after each
 * line the journal is "closed" (the flags saved so far are all that is
 * left, and a letter queued for when the words close is lost), and the
 * sweep asks whether play from there can still raise everything the rest of
 * that conversation would have: its progress flags (anything another
 * condition or the engine reads), its pages, and its letters read.
 *
 * Contexts are the smallest flag sets under which each arm is the one that
 * fires, grown with every earlier stop on the route and with flags that
 * always rise together, and tried again with the conversation's gated
 * branches open. Recovery may talk to the same person (or face the same
 * prop) and to anyone whose lines can raise a missing flag, up to four
 * conversations deep. Armed games and the album the engine picks up from
 * saved flags; queued letters it does not.
 */
type Sim = { flags: Set<string>; errand: string | null; letters: string[] };
const simHolds = (s: Sim, c?: Cond) => holds(s.flags, c);
const copy = (s: Sim): Sim => ({ flags: new Set(s.flags), errand: s.errand, letters: [...s.letters] });
const blank = (): Sim => ({ flags: new Set(), errand: null, letters: [] });

function applySim(s: Sim, effects?: string[]) {
  for (const eff of effects ?? []) {
    const sep = eff.indexOf(':');
    const kind = sep < 0 ? eff : eff.slice(0, sep);
    const arg = sep < 0 ? '' : eff.slice(sep + 1);
    if (kind === 'set') s.flags.add(arg);
    else if (kind === 'clear') s.flags.delete(arg);
    else if (kind === 'journal') s.flags.add(`page.${arg}`);
    else if (kind === 'errand') s.errand = arg;
    else if (kind === 'errand.done') s.errand = null;
    else if (kind === 'letter') s.letters.push(arg);
    else if (kind === 'letterread') s.flags.add(`letter.read.${arg}`);
  }
}

/** Every open branch at once, as the thread walker plays an engine's doneNode. */
function walkAll(s: Sim, id: string, seen = new Set<string>()) {
  if (seen.has(id) || !NODES[id]) return;
  seen.add(id);
  const n = NODES[id]!;
  applySim(s, n.effects);
  if (n.next) walkAll(s, n.next, seen);
  for (const c of n.choices ?? []) if (simHolds(s, c.when)) walkAll(s, c.goto, seen);
}

/** What the engine does once the words close: letters read, games played, the album shown. */
function settle(s: Sim): Sim {
  const o = copy(s);
  for (let guard = 0; guard < 10; guard++) {
    const before = o.flags.size + o.letters.length;
    for (const id of o.letters.splice(0)) o.flags.add(`letter.read.${id}`);
    for (const game of GAMES) {
      if (!o.flags.has(game.flag)) continue;
      if (o.flags.has('replay.mode')) {
        o.flags.delete('replay.mode');
        o.flags.delete(game.flag);
      } else walkAll(o, game.doneNode);
    }
    if (o.flags.has('album.open')) {
      o.flags.delete('album.open');
      if (!o.flags.has('c10.album.seen')) walkAll(o, 'c10.album.close');
    }
    if (o.flags.size + o.letters.length === before) break;
  }
  return o;
}

/** Every way through a conversation, with the state after each line. */
type Walk = { nodes: string[]; states: Sim[] };
function walks(start: string, s0: Sim, limit = 400): Walk[] {
  const out: Walk[] = [];
  const go = (id: string, s: Sim, nodes: string[], states: Sim[]) => {
    if (out.length >= limit) return;
    const n = NODES[id];
    if (!n || nodes.includes(id)) {
      out.push({ nodes, states });
      return;
    }
    const st = copy(s);
    applySim(st, n.effects);
    const ns = [...nodes, id];
    const ss = [...states, st];
    const open = (n.choices ?? []).filter((c) => simHolds(st, c.when));
    if (open.length) for (const c of open) go(c.goto, st, ns, ss);
    else if (n.next) go(n.next, st, ns, ss);
    else out.push({ nodes: ns, states: ss });
  };
  go(start, s0, [], []);
  return out;
}

type Source = { label: string; arms: { when?: Cond; node: string }[]; present?: Cond; firstOnly: boolean };

const SWEEP_SOURCES: Source[] = (() => {
  const out: Source[] = [];
  for (const n of NPCS) out.push({ label: `npc ${n.id}`, arms: n.entry, present: n.when, firstOnly: true });
  for (const [mapId, data] of Object.entries(REGION_MAPS)) {
    const kinds = new Set(Object.values(data.legend).map((d) => d.t));
    for (const d of DRESSINGS) {
      if (d.map !== mapId) continue;
      if (d.swap) kinds.add(d.swap.to.t);
      for (const [, , o] of d.cells ?? []) if (o) kinds.add(o.t);
    }
    for (const kind of kinds) {
      const arms = (EXAMINES[kind] ?? []).filter((a) => !a.map || a.map === mapId);
      if (arms.length) out.push({ label: `examine ${kind}@${mapId}`, arms, firstOnly: true });
    }
  }
  const arrivals = new Set(ARRIVALS.map((a) => a.node));
  for (const e of EVENT_NODES) {
    if (!e.when?.has?.length || arrivals.has(e.node)) continue;
    if (GAMES.some((g) => g.doneNode === e.node) || e.node === 'c10.album.close') continue; // settle plays these
    out.push({ label: `event ${e.node}`, arms: [e], firstOnly: false });
  }
  return out;
})();

/** Everything a player standing in chapter i has done: every earlier stop, reached and finished. */
const SPINE: string[][] = CHAPTERS.map((c, i) => [
  ...ROUTE.slice(0, i).flatMap((stop) => [...(stop.arrived?.has ?? []), ...(stop.complete?.has ?? [])]),
  ...(c.arrival ? [c.arrival.flag] : []),
]);
const ARM_CHAPTER = new Map<object, number>();
CHAPTERS.forEach((c, i) => {
  for (const n of c.npcs) for (const e of n.entry) ARM_CHAPTER.set(e, i);
  for (const x of c.npcExtensions ?? []) for (const e of x.entry) ARM_CHAPTER.set(e, i);
  for (const e of c.events) ARM_CHAPTER.set(e, i);
});
const chapterOf = (arm: object): number =>
  ARM_CHAPTER.get(arm) ?? Math.max(0, CHAPTERS.findIndex((c) => c.id === (arm as { chapter?: string }).chapter));

/** Flags that always rise together: every line that raises f raises these too. */
const IMPLIES: Map<string, Set<string>> = (() => {
  const out = new Map<string, Set<string>>();
  for (const n of Object.values(NODES)) {
    const t = blank();
    applySim(t, n.effects);
    for (const f of t.flags) {
      const prev = out.get(f);
      if (!prev) out.set(f, new Set([...t.flags].filter((g) => g !== f)));
      else for (const g of [...prev]) if (!t.flags.has(g)) prev.delete(g);
    }
  }
  return out;
})();
const closeOver = (F: Set<string>): Set<string> => {
  const out = new Set(F);
  const stack = [...F];
  while (stack.length) {
    for (const g of IMPLIES.get(stack.pop()!) ?? []) {
      if (out.has(g)) continue;
      out.add(g);
      stack.push(g);
    }
  }
  return out;
};

/** Every flag, page and read letter a source's lines can ever raise, games included. */
const RAISES: Map<Source, Set<string>> = (() => {
  const out = new Map<Source, Set<string>>();
  for (const src of SWEEP_SOURCES) {
    const set = new Set<string>();
    const note = (id: string) => {
      const t = blank();
      applySim(t, NODES[id]!.effects);
      for (const f of t.flags) set.add(f);
      for (const l of t.letters) set.add(`letter.read.${l}`);
    };
    for (const a of src.arms) {
      for (const id of reach(a.node)) {
        note(id);
        for (const g of GAMES) if ((NODES[id]!.effects ?? []).includes(`set:${g.flag}`)) reach(g.doneNode).forEach(note);
      }
    }
    out.set(src, set);
  }
  return out;
})();

/** Smallest flag sets under which arm i is the one that fires. */
function contextsFor(src: Source, i: number): Set<string>[] {
  const target = src.arms[i]!;
  const forbid = new Set([...(target.when?.not ?? []), ...(src.present?.not ?? [])]);
  const spine = SPINE[chapterOf(target)]!.filter((f) => !forbid.has(f));
  const start = new Set([...(target.when?.has ?? []), ...(src.present?.has ?? []), ...spine]);
  const out: Set<string>[] = [];
  const keys = new Set<string>();
  const grow = (seed: Set<string>, depth: number) => {
    if (out.length >= 12) return;
    const F = closeOver(seed);
    if ([...F].some((f) => forbid.has(f))) return;
    const s: Sim = { flags: F, errand: null, letters: [] };
    const j = src.firstOnly ? src.arms.findIndex((a, idx) => idx < i && simHolds(s, a.when)) : -1;
    if (j < 0) {
      const k = [...F].sort().join(',');
      if (!keys.has(k)) {
        keys.add(k);
        out.push(F);
      }
      return;
    }
    if (depth > 6) return;
    for (const f of src.arms[j]!.when?.not ?? []) if (!forbid.has(f)) grow(new Set([...F, f]), depth + 1);
  };
  grow(start, 0);
  const gates = new Set<string>();
  for (const id of reach(target.node)) {
    for (const c of NODES[id]!.choices ?? []) for (const f of c.when?.has ?? []) if (!forbid.has(f)) gates.add(f);
  }
  if (gates.size) grow(new Set([...start, ...gates]), 0);
  return out;
}

const simSig = (s: Sim) => `${s.errand}|${[...s.flags].sort().join(',')}`;

function recovers(saved: Sim, missing: string[], home: Source): boolean {
  const helpers = SWEEP_SOURCES.filter((src) => src === home || missing.some((f) => RAISES.get(src)!.has(f)));
  let frontier = [settle({ ...copy(saved), letters: [] })];
  const seen = new Set(frontier.map(simSig));
  for (let depth = 0; depth <= 4; depth++) {
    const next: Sim[] = [];
    for (const s of frontier) {
      if (missing.every((f) => s.flags.has(f))) return true;
      if (depth === 4) continue;
      for (const src of helpers) {
        if (!simHolds(s, src.present)) continue;
        const nodes = src.firstOnly
          ? [src.arms.find((a) => simHolds(s, a.when))?.node].filter((x): x is string => !!x)
          : src.arms.filter((a) => simHolds(s, a.when)).map((a) => a.node);
        for (const node of nodes) {
          for (const w of walks(node, s, 60)) {
            const end = settle(w.states.at(-1) ?? s);
            const k = simSig(end);
            if (seen.has(k)) continue;
            seen.add(k);
            next.push(end);
          }
        }
      }
    }
    frontier = next.slice(0, 4000);
  }
  return false;
}

function sweepStuckReloads(): string[] {
  const significant = (f: string) => f.startsWith('page.') || f.startsWith('letter.read.') || isProgressFlag(f);
  const found = new Set<string>();
  const tried = new Set<string>();
  for (const src of SWEEP_SOURCES) {
    src.arms.forEach((arm, i) => {
      for (const F of contextsFor(src, i)) {
        const s0: Sim = { flags: new Set(F), errand: null, letters: [] };
        for (const f of F) if (f.startsWith('errand.')) s0.errand = f.slice(7);
        for (const w of walks(arm.node, s0)) {
          const end = settle(w.states.at(-1)!);
          w.nodes.forEach((id, k) => {
            const saved = w.states[k]!;
            const missing = [...end.flags].filter((f) => significant(f) && !saved.flags.has(f)).sort();
            if (!missing.length) return;
            const line = `${src.label}: reload after ${id} loses ${missing.join(', ')}`;
            const key = `${line}|${simSig(saved)}`;
            if (found.has(line) || tried.has(key)) return;
            tried.add(key);
            if (!recovers(saved, missing, src)) found.add(line);
          });
        }
      }
    });
  }
  return [...found].sort();
}

/**
 * Faults the sweep finds that content alone should not paper over. Each line
 * is exactly what the sweep reports; a listed fault that no longer happens
 * fails the suite too, so this list can only shrink.
 */
const KNOWN_STUCK: string[] = [
  // Pre-launch review item 16 (engine-owned): story.end is raised on the
  // written last line, two lines before the closing book's end.book, and the
  // book consumes end.book as it opens, so a catch-up arm here would replay
  // the ending to anyone who had already read it.
  'examine well@village: reload after c10.lastline.begun loses end.book',
  'examine well@village: reload after c10.lastline.trick loses end.book',
  'examine well@village: reload after c10.lastline.word loses end.book',
];

describe('no conversation can be cut off for good by closing the journal', () => {
  it('every line, reloaded after, still leaves its progress, pages and letters within reach', () => {
    const found = sweepStuckReloads();
    const fresh = found.filter((f) => !KNOWN_STUCK.includes(f));
    const gone = KNOWN_STUCK.filter((k) => !found.includes(k));
    assert.deepEqual(
      { fresh, gone },
      { fresh: [], gone: [] },
      `\nnew faults:\n${fresh.join('\n')}\nlisted faults that no longer happen (delete them):\n${gone.join('\n')}`,
    );
  });
});

/** The choices a node offers under these flags. */
const offered = (nodeId: string, flags: Iterable<string>) => {
  const set = new Set(flags);
  return (NODES[nodeId]?.choices ?? []).filter((c) => holds(set, c.when)).map((c) => c.goto);
};

describe('the ofrenda remembers whose omiyage it took', () => {
  const people = ['petro', 'pilar', 'aurelio'] as const;
  const carrying = people.map((p) => `omiyage.${p}`);

  it('each omiyage set on the altar is marked as that person’s, and only one fits', () => {
    for (const who of people) {
      const choice = NODES['c9.altar.hub']!.choices!.find((c) => (c.when?.has ?? []).includes(`omiyage.${who}`))!;
      const effects = NODES[choice.goto]!.effects ?? [];
      assert.ok(effects.includes(`set:c9.of.omiyage.${who}`), `${choice.goto} does not say whose omiyage it was`);
      assert.ok(effects.includes('set:c9.of.omiyage'), `${choice.goto} does not fill the altar's one omiyage place`);
      for (const other of people) {
        if (other !== who) assert.ok(!effects.includes(`set:c9.of.omiyage.${other}`));
      }
    }
    const placed = [...carrying, 'c9.of.omiyage', 'c9.of.omiyage.petro'];
    assert.ok(!offered('c9.altar.hub', placed).some((g) => g.startsWith('c9.altar.omiyage')));
  });

  it('with only Petro’s placed, Aurelio and Pilar are handed theirs, not told it went to Oaxaca', () => {
    const petrosPlaced = [...carrying, 'c9.of.omiyage', 'c9.of.omiyage.petro'];
    const soup = offered('c10.aurelio.soup', petrosPlaced);
    assert.ok(soup.includes('c10.aurelio.omiyage') && !soup.includes('c10.aurelio.ofrenda'), soup.join());
    const museum = offered('c10.pilar.museum', petrosPlaced);
    assert.ok(museum.includes('c10.pilar.wing') && !museum.includes('c10.pilar.ofrenda'), museum.join());
  });

  it('with Aurelio’s placed, he hears where it went and Pilar still gets hers', () => {
    const his = [...carrying, 'c9.of.omiyage', 'c9.of.omiyage.aurelio'];
    const soup = offered('c10.aurelio.soup', his);
    assert.ok(soup.includes('c10.aurelio.ofrenda') && !soup.includes('c10.aurelio.omiyage'), soup.join());
    const museum = offered('c10.pilar.museum', his);
    assert.ok(museum.includes('c10.pilar.wing') && !museum.includes('c10.pilar.ofrenda'), museum.join());
  });
});

/**
 * Choosing a sea thing for Pilar (pilar.gift.*) is not posting it
 * (c2.gift.sent, at the harbor office). The letters that named the creature
 * checked only the choice, so a player who skipped the counter read "the box
 * arrived" from mid-ocean and "zero objects" from Japan, and met the puffer
 * fish as exhibit one at home.
 */
describe('a sea thing only arrives if it was posted', () => {
  const creature = /puffer|sea star|claw|comma/i;
  const gifts = ['pilar.gift.puffer', 'pilar.gift.star', 'pilar.gift.claw'];

  it('every letter or scene that names the creature also needs it posted', () => {
    const conds: [string, Cond | undefined][] = [
      ...LETTERS.map((l) => [`letter ${l.id}`, l.when] as [string, Cond | undefined]),
      ...NPCS.flatMap((n) => n.entry.map((e) => [`npc ${n.id} -> ${e.node}`, e.when] as [string, Cond | undefined])),
    ];
    for (const [where, when] of conds) {
      if (!(when?.has ?? []).some((f) => gifts.includes(f))) continue;
      assert.ok(when!.has!.includes('c2.gift.sent'), `${where} names the sea thing without it being posted`);
    }
  });

  it('chosen but never posted: Pilar writes as someone still waiting, all the way home', () => {
    for (const gift of gifts) {
      const unsent = new Set(['met.pilar', 'pilar.sea', 'pilar.promoted', 'c2.gift', gift]);
      for (const id of new Set(LETTERS.filter((l) => l.when?.has?.some((f) => gifts.includes(f))).map((l) => l.id))) {
        const letter = LETTERS.find((l) => l.id === id && holds(unsent, l.when))!;
        assert.ok(!letter.when, `${id}: ${gift} unposted still reads a variant gated on ${JSON.stringify(letter.when)}`);
        for (const p of letter.body) assert.doesNotMatch(p, creature, `${id}: "${p}"`);
      }
      const home = entryFor('pilar', [...unsent, 'c10.arrived']);
      assert.equal(home, 'c10.pilar.plain', `${gift} unposted: Pilar opens with ${home}`);
      const posted = entryFor('pilar', [...unsent, 'c2.gift.sent', 'c10.arrived']);
      assert.equal(posted, `c10.pilar.${gift.slice('pilar.gift.'.length)}`);
    }
  });
});
