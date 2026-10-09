import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { MAP_META, NODES, NPCS, REGION_MAPS, sitKindsOn } from '../src/content/world';
import { BLOCKING } from '../src/content/staging';
import { MEETING } from '../src/content/return/staging';
import { claimPerches } from '../src/engine/perch';
import { DELHI_STATIONS } from '../src/content/delhi/stations';
import { SHIONOURA_STATIONS } from '../src/content/shionoura/stations';
import type { Cond } from '../src/content/schema';
import { TileMap } from '../src/engine/grid';
import { bodyCovered, headIn, planBesideProp, planSettle, roomFor, type Ground, type PropArt } from '../src/engine/stand';
// The art kit, built against a stand-in canvas: nothing is painted, but every
// prop's sprite comes out at its real size and anchor, which is all the cover
// test needs. It then reads the whole rectangle as paint, so it can only be
// stricter than the game, which reads the painted pixels.
import './panelrig';
import { Tileset } from '../src/art/tiles';

/**
 * Nobody stands in anybody. A figure is two tiles tall (its cell and the head
 * in the cell above), so the rule is wider than one body per cell: two people
 * one directly above the other draw as one pile even on separate cells. The
 * engine keeps it for walkers, seats and conversations at runtime; this holds
 * every place the content puts a body to the same rule, map by map: villager
 * homes, the ending's blocking, the scheduled customs' cells, and every cell
 * a player can arrive on (a map's spawn, each door's landing).
 */

type Body = { map: string; at: [number, number]; who: string; label: string; when?: Cond; posted: boolean; dog: boolean };

/** Can both conditions hold at once? False only when one needs what the other forbids. */
const together = (a?: Cond, b?: Cond) =>
  !(a?.has ?? []).some((f) => (b?.not ?? []).includes(f)) && !(b?.has ?? []).some((f) => (a?.not ?? []).includes(f));

const bodies: Body[] = [];
for (const n of NPCS) {
  bodies.push({
    map: n.map, at: n.pos, who: n.id, label: `${n.id} (home)`, when: n.when,
    posted: n.range === 0, dog: n.sprite === 'dog',
  });
}
for (const b of BLOCKING) {
  const npc = NPCS.find((n) => n.id === b.id);
  bodies.push({ map: b.map, at: b.at, who: b.id, label: `${b.id} (blocking)`, when: b.when, posted: true, dog: npc?.sprite === 'dog' });
}
for (const st of [...DELHI_STATIONS, ...SHIONOURA_STATIONS]) {
  st.cells.forEach((c, i) => {
    bodies.push({ map: st.map, at: c.at, who: `${st.id}#${i}`, label: `${st.id} cell ${i}`, posted: true, dog: false });
  });
}

/**
 * Every cell the content puts the player on. Doors and spawns, and (missed
 * until round g) the journeys taken inside a conversation: `travel:map,x,y`
 * effects that cut to a dawn or a pier, the cells where Zanzibar's goodbye
 * stood the traveler on Rashid's bench and La Caleta's return stood them
 * between Simón and Ríos. A journey's own flags say who can be there.
 */
type Arrival = { map: string; at: [number, number]; label: string; when?: Cond };
const arrivals: Arrival[] = [];
for (const m of Object.values(REGION_MAPS)) {
  arrivals.push({ map: m.id, at: m.spawn as [number, number], label: `${m.id} spawn` });
  for (const t of m.triggers ?? []) {
    if (t.type === 'door') arrivals.push({ map: t.to, at: t.spawn as [number, number], label: `door ${m.id} -> ${t.to}` });
  }
}
for (const [id, node] of Object.entries(NODES)) {
  const sets = (node.effects ?? []).filter((e) => e.startsWith('set:')).map((e) => e.slice(4));
  for (const e of node.effects ?? []) {
    const t = /^travel:([^,]+),(\d+),(\d+)/.exec(e);
    if (t) arrivals.push({ map: t[1]!, at: [Number(t[2]), Number(t[3])], label: `journey in ${id}`, when: { has: sets } });
  }
}
// The ring's open place at the well, where the player walks in to begin the verdict.
arrivals.push({ map: MEETING.map, at: MEETING.spot, label: 'the ring at the well', when: MEETING.when });

const same = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];
const stacked = (a: [number, number], b: [number, number]) => a[0] === b[0] && Math.abs(a[1] - b[1]) === 1;

/**
 * Every chapter's blocking is held to these rules now, not only the
 * ending's. What that turned up in staging data is listed here for the
 * staging owner to move; the list may only shrink.
 */
const KNOWN_STACKED = new Set<string>([]);

describe('bodies never overlap', () => {
  it('no two bodies that can be present together are placed on one cell', () => {
    const bad: string[] = [];
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]!;
        const b = bodies[j]!;
        if (a.map !== b.map || a.who === b.who || !together(a.when, b.when)) continue;
        if (same(a.at, b.at)) bad.push(`${a.map} ${a.at}: ${a.label} and ${b.label}`);
      }
    }
    assert.deepEqual(bad, []);
  });

  it('nobody is placed where a player arrives', () => {
    const bad: string[] = [];
    for (const s of arrivals) {
      for (const b of bodies) {
        if (b.map === s.map && same(b.at, s.at) && together(b.when, s.when)) bad.push(`${s.label} lands on ${b.label} at ${s.at}`);
      }
    }
    assert.deepEqual(bad, []);
  });

  it('nobody posted for good stands directly above or below another posted body', () => {
    // Wanderers step out of each other's columns on their own; the posted
    // (range 0, the evening's blocking, a custom's cells) never move, so
    // their data has to keep the rule. The dog is knee-high and exempt.
    const bad: string[] = [];
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]!;
        const b = bodies[j]!;
        if (!a.posted || !b.posted || a.dog || b.dog) continue;
        if (a.map !== b.map || a.who === b.who || !together(a.when, b.when)) continue;
        if (stacked(a.at, b.at)) bad.push(`${a.map}: ${a.label} ${a.at} over ${b.label} ${b.at}`);
      }
    }
    assert.deepEqual(bad.filter((f) => !KNOWN_STACKED.has(f)), []);
  });

  it('every placement stands on open ground of a real map', () => {
    const bad: string[] = [];
    for (const b of bodies) {
      const m = REGION_MAPS[b.map];
      if (!m) {
        bad.push(`${b.label}: no map ${b.map}`);
        continue;
      }
      const [x, y] = b.at;
      const g = m.legend[m.ground[y]?.[x] ?? ' '];
      const oc = m.objects?.[y]?.[x] ?? ' ';
      const o = oc === ' ' ? undefined : m.legend[oc];
      if (!g || g.solid || (o?.solid && !NPCS.find((n) => n.id === b.who)?.sits)) bad.push(`${b.label} at ${b.at} on ${b.map} is not standable`);
    }
    assert.deepEqual(bad, []);
  });
});

// ---------------------------------------------------------------- talks

const tiles = new Tileset();
const artFor = (mapId: string) => (kind: string, cx: number, cy: number): PropArt | null => {
  tiles.setMap(mapId);
  const img = tiles.tallImage(kind, cx, cy);
  return img ? { w: img.cvs.width, h: img.cvs.height, ox: img.ox, oy: img.oy } : null;
};
const isBuilding = (k: string) => tiles.isBuilding(k);
const doorsteps = new Set(arrivals.map((a) => `${a.map}:${a.at[0]},${a.at[1]}`));

describe('talk settling', () => {
  // Every person, at every place the content puts them, talked to from the
  // cells above and below them that a player can stand on. The two would be
  // one above the other, so the settle must walk nobody onto a wall strip,
  // a doorway, a cell a prop is painted over, or into a third body's column,
  // and must leave the two side by side on a row (or a clear cell apart).
  it('every talk settles onto clean cells, side by side', () => {
    const bad: string[] = [];
    let talks = 0;
    const leanAt: string[] = [];
    for (const b of bodies) {
      if (b.dog) continue;
      const data = REGION_MAPS[b.map];
      if (!data) continue;
      const m = new TileMap(data);
      const art = artFor(b.map);
      const others = bodies.filter(
        (o) => o.map === b.map && o.who !== b.who && !o.dog && together(o.when, b.when) && !same(o.at, b.at),
      );
      const cover = new Map<string, boolean>();
      const covered = (x: number, y: number) => {
        const k = `${x},${y}`;
        if (!cover.has(k)) cover.set(k, bodyCovered(m, x, y, art, isBuilding));
        return cover.get(k)!;
      };
      const held = (x: number, y: number) => others.some((o) => o.at[0] === x && o.at[1] === y);
      const g: Ground = {
        passable: (x, y) => m.inBounds(x, y) && !m.solid(x, y) && !m.triggerAt(x, y),
        clean: (x, y) =>
          m.inBounds(x, y) && !m.solid(x, y) && !m.triggerAt(x, y) && !doorsteps.has(`${b.map}:${x},${y}`) && !covered(x, y),
        held,
      };
      for (const dy of [1, -1]) {
        const p: [number, number] = [b.at[0], b.at[1] + dy];
        if (m.solid(p[0], p[1]) || m.triggerAt(p[0], p[1]) || held(p[0], p[1])) continue;
        for (const npcMay of [true, false]) {
          talks++;
          const plan = planSettle(g, p, b.at, npcMay);
          const where = `${b.label} on ${b.map} from ${p} (${npcMay ? 'free' : 'held'})`;
          if (plan.kind === 'none') {
            bad.push(`${where}: stacked talk left as is`);
            continue;
          }
          if (plan.kind === 'lean') {
            leanAt.push(where);
            continue;
          }
          for (const mv of plan.moves) {
            if (mv.who === 'npc' && !npcMay) bad.push(`${where}: moved someone who holds their place`);
            let c: [number, number] = mv.who === 'player' ? p : b.at;
            for (const d of mv.steps) {
              c = [c[0] + (d === 'right' ? 1 : d === 'left' ? -1 : 0), c[1] + (d === 'down' ? 1 : d === 'up' ? -1 : 0)];
              if (!g.passable(c[0], c[1])) bad.push(`${where}: walks through ${c}`);
            }
            const end = mv.who === 'player' ? plan.player : plan.npc;
            if (!same(c, end)) bad.push(`${where}: steps end at ${c}, plan says ${end}`);
            if (!roomFor(g, end[0], end[1])) bad.push(`${where}: ${mv.who} lands on ${end}, which is not clean`);
          }
          const [a, n] = [plan.player, plan.npc];
          const sideBySide = a[1] === n[1] && Math.abs(a[0] - n[0]) === 1;
          const apart = a[0] === n[0] && Math.abs(a[1] - n[1]) === 2;
          if (!sideBySide && !apart) bad.push(`${where}: ends at ${a} and ${n}`);
        }
      }
    }
    assert.deepEqual(bad, []);
    // Leaning apart is the last resort, for a one-plank pier or a doorway
    // lane; it must stay rare. (This test reads every prop's whole rectangle
    // as paint and counts every home as occupied, so it leans more often
    // than the game does.)
    assert.ok(leanAt.length <= talks * 0.08, `${leanAt.length} of ${talks} talks lean:\n${leanAt.join('\n')}`);
  });
});

// ---------------------------------------------------------------- people under props

/**
 * People the content stands where a tall prop is painted over them (a prop
 * in the cell below, nearer the eye) or grows out of their hat (a prop in
 * the cell above, behind them). The renderer veils such a prop while anyone
 * stands there, but a placement that needs the veil is a staging slip. The
 * known ones are listed so the content can move them; the list only shrinks.
 */
// Vendors behind their own stall, cart or containers: the counter in front of
// them is the point.
const KNOWN_UNDER_PROPS = new Set<string>([
  'marisol (home) on la-caleta at 27,20: stall in front',
  'bosun (home) on ship at 22,14: contA in front',
  'mija (home) on busan at 12,14: hotteokcart in front',
]);

describe('people and tall props', () => {
  it('nobody is placed under a tall prop, or in front of a post', () => {
    const found: string[] = [];
    for (const b of bodies) {
      if (b.dog) continue;
      const data = REGION_MAPS[b.map];
      if (!data) continue;
      const m = new TileMap(data);
      const art = artFor(b.map);
      const [x, y] = b.at;
      const prop = (cx: number, cy: number) => {
        const o = m.object(cx, cy);
        if (!o?.tall || !o.solid || o.t === 'blocked' || isBuilding(o.t)) return null;
        const a = art(o.t, cx, cy);
        // Art no taller than its cell never reaches a neighbour.
        return a && a.h > 64 ? { kind: o.t, art: a } : null;
      };
      // The cell below: drawn after the body and rising over its legs.
      const front = prop(x, y + 1);
      if (front) found.push(`${b.label} on ${b.map} at ${b.at}: ${front.kind} in front`);
      // The cell above: a one-tile post rising behind the head reads as
      // growing out of the hat. A block of one kind (a container bay, a row
      // of stalls) is a backdrop, and so is anything wider than a tile.
      const behind = prop(x, y - 1);
      const run = behind && [[-1, 0], [1, 0], [0, -1]].some(([dx, dy]) => m.object(x + dx, y - 1 + dy)?.t === behind.kind);
      if (behind && behind.art.w <= 64 && !run) found.push(`${b.label} on ${b.map} at ${b.at}: ${behind.kind} behind the head`);
    }
    const fresh = found.filter((f) => !KNOWN_UNDER_PROPS.has(f));
    assert.deepEqual(fresh, []);
  });
});

// ---------------------------------------------------------------- where the player is put

/** Bodies standing for good where a player lands: posted homes and the staging's marks. */
const postedBodies = bodies.filter((b) => b.posted && !b.dog);

describe('every cell the player is put on is clean', () => {
  // Pass 6 held the people the content places; the player's own landings
  // (doors, spawns, journeys inside a conversation, the ring's open place)
  // were only held to "nobody on the very cell". Round g found the rest:
  // the traveler stood on Rashid's bench at the Zanzibar dawn, and landed on
  // the return between Simón and Ríos on La Caleta's pier. A landing is
  // floor, not a seat or a tall prop; no tall prop rises through the head
  // or is painted over the legs; and nobody who can be there stands on it,
  // directly above it or directly below it.
  it('no landing is a seat, a prop, a pile or under paint', () => {
    const bad: string[] = [];
    for (const a of arrivals) {
      const data = REGION_MAPS[a.map];
      if (!data) {
        bad.push(`${a.label}: no map ${a.map}`);
        continue;
      }
      const m = new TileMap(data);
      const [x, y] = a.at;
      const o = m.object(x, y);
      const where = `${a.label} on ${a.map} at ${a.at}`;
      if (m.solid(x, y)) bad.push(`${where}: solid`);
      // (A tall thing you can walk under, papel picado or wires, is overhead.)
      if (o && sitKindsOn(a.map).has(o.t)) bad.push(`${where}: stands on a ${o.t}`);
      if (headIn(m, x, y, isBuilding)) bad.push(`${where}: head inside the ${m.object(x, y - 1)?.t}`);
      const front = m.object(x, y + 1);
      if (front?.tall && front.solid && front.t !== 'blocked' && !isBuilding(front.t)) {
        const art = artFor(a.map)(front.t, x, y + 1);
        if (art && art.h > 64) bad.push(`${where}: ${front.t} painted over the legs`);
      }
      for (const b of postedBodies) {
        if (b.map !== a.map || !together(b.when, a.when)) continue;
        // A door or a spawn has no flags of its own: only those always there count.
        if (!a.when && b.when) continue;
        if (b.at[0] === x && Math.abs(b.at[1] - y) === 1) bad.push(`${where}: in ${b.label}'s column`);
      }
    }
    assert.deepEqual(bad, []);
  });
});

// ---------------------------------------------------------------- evening seats

describe('evening seats', () => {
  // The golden-hour perches are claimed at boot (engine/perch.ts), so no
  // content lists them and no test saw them. Claimed blind, eight of them
  // sat under a tall prop's paint. With the cover check the claim takes the
  // seat's next side instead; this holds the claim to it, and to the
  // personal-space rule, on every map.
  const maps = Object.fromEntries(Object.values(REGION_MAPS).map((d) => [d.id, new TileMap(d)]));
  const posted = new Set(NPCS.filter((n) => n.range === 0 && n.sprite !== 'dog').map((n) => `${n.map}:${n.pos[0]},${n.pos[1]}`));
  const opts = { sitKinds: sitKindsOn, skip: (id: string) => MAP_META[id]?.scene === 'interior', posted };
  const covered = (id: string, x: number, y: number) => bodyCovered(maps[id]!, x, y, artFor(id), isBuilding);

  it('a blind claim finds covered perches: the cover check is load-bearing', () => {
    const blind = claimPerches(maps, NPCS, opts);
    const dirty = [...blind].filter(([id, p]) => covered(NPCS.find((n) => n.id === id)!.map, p.at[0], p.at[1]));
    assert.ok(dirty.length > 0, 'if no perch is ever covered, this test has lost its teeth');
  });

  it('every perch claimed with the cover check is clean and in nobody\'s column', () => {
    const seats = claimPerches(maps, NPCS, { ...opts, clean: (id, x, y) => !covered(id, x, y) });
    assert.ok(seats.size >= 30, `only ${seats.size} evening seats`);
    const bad: string[] = [];
    const taken = new Map<string, string>();
    for (const [id, p] of seats) {
      const mapId = NPCS.find((n) => n.id === id)!.map;
      const k = `${mapId}:${p.at[0]},${p.at[1]}`;
      if (covered(mapId, p.at[0], p.at[1])) bad.push(`${id} sits under paint at ${p.at}`);
      if (maps[mapId]!.solid(p.at[0], p.at[1])) bad.push(`${id} sits in a solid cell at ${p.at}`);
      if (taken.has(k)) bad.push(`${id} and ${taken.get(k)} share ${p.at}`);
      taken.set(k, id);
      for (const dy of [-1, 1]) {
        if (posted.has(`${mapId}:${p.at[0]},${p.at[1] + dy}`)) bad.push(`${id} sits in a posted body's column at ${p.at}`);
      }
    }
    assert.deepEqual(bad, []);
  });
});

// ---------------------------------------------------------------- reading a tall thing

describe('reading a tall thing', () => {
  // The last page is written at the well, and the night after it is held
  // there. Read from below, the well's posts and arch rose round the
  // traveler's head for both (g2 night-01/04). A reader standing where a
  // tall prop's paint falls over them steps to a clean cell beside it
  // (stand.ts planBesideProp), or stays when nowhere clean is near.
  const mapsHere = Object.fromEntries(Object.values(REGION_MAPS).map((d) => [d.id, new TileMap(d)]));
  const groundFor = (id: string): Ground => {
    const m = mapsHere[id]!;
    const art = artFor(id);
    const others = bodies.filter((o) => o.map === id && !o.dog);
    return {
      passable: (x, y) => m.inBounds(x, y) && !m.solid(x, y) && !m.triggerAt(x, y),
      clean: (x, y) =>
        m.inBounds(x, y) && !m.solid(x, y) && !m.triggerAt(x, y) && !doorsteps.has(`${id}:${x},${y}`) &&
        !bodyCovered(m, x, y, art, isBuilding),
      held: (x, y) => others.some((o) => o.at[0] === x && o.at[1] === y),
    };
  };

  it('the last page is written beside the well, clean', () => {
    const g = groundFor('village');
    const plan = planBesideProp(g, [21, 16], [21, 15]);
    assert.ok(plan, 'nowhere clean beside the well');
    assert.ok(roomFor(g, plan.at[0], plan.at[1]));
    assert.equal(plan.at[1], 15, 'beside it, on its row');
  });

  it('every step beside any tall examinable thing lands clean and adjacent', () => {
    const bad: string[] = [];
    let moved = 0;
    for (const [id, m] of Object.entries(mapsHere)) {
      const g = groundFor(id);
      for (let y = 0; y < m.h; y++) {
        for (let x = 0; x < m.w; x++) {
          const o = m.object(x, y);
          if (!o?.tall || !o.solid || o.t === 'blocked' || isBuilding(o.t)) continue;
          for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
            const p: [number, number] = [x + dx, y + dy];
            if (!g.passable(p[0], p[1]) || g.held(p[0], p[1])) continue;
            const plan = planBesideProp(g, p, [x, y]);
            if (!plan) continue;
            moved++;
            let c = p;
            for (const d of plan.steps) {
              c = [c[0] + (d === 'right' ? 1 : d === 'left' ? -1 : 0), c[1] + (d === 'down' ? 1 : d === 'up' ? -1 : 0)];
              if (!g.passable(c[0], c[1]) || g.held(c[0], c[1])) bad.push(`${id} ${o.t} ${x},${y} from ${p}: walks through ${c}`);
            }
            if (!same(c, plan.at)) bad.push(`${id} ${o.t} from ${p}: ends at ${c}, plan says ${plan.at}`);
            if (!roomFor(g, c[0], c[1])) bad.push(`${id} ${o.t} from ${p}: lands unclean at ${c}`);
            if (Math.abs(c[0] - x) + Math.abs(c[1] - y) !== 1) bad.push(`${id} ${o.t} from ${p}: not beside it at ${c}`);
          }
        }
      }
    }
    assert.ok(moved > 0);
    assert.deepEqual(bad, []);
  });
});
