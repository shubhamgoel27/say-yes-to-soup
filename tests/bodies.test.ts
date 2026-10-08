import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NPCS, REGION_MAPS } from '../src/content/world';
import { BLOCKING } from '../src/content/return/staging';
import { DELHI_STATIONS } from '../src/content/delhi/stations';
import { SHIONOURA_STATIONS } from '../src/content/shionoura/stations';
import type { Cond } from '../src/content/schema';

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

const arrivals: { map: string; at: [number, number]; label: string }[] = [];
for (const m of Object.values(REGION_MAPS)) {
  arrivals.push({ map: m.id, at: m.spawn as [number, number], label: `${m.id} spawn` });
  for (const t of m.triggers ?? []) {
    if (t.type === 'door') arrivals.push({ map: t.to, at: t.spawn as [number, number], label: `door ${m.id} -> ${t.to}` });
  }
}

const same = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];
const stacked = (a: [number, number], b: [number, number]) => a[0] === b[0] && Math.abs(a[1] - b[1]) === 1;

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
        if (b.map === s.map && same(b.at, s.at)) bad.push(`${s.label} lands on ${b.label} at ${s.at}`);
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
    assert.deepEqual(bad, []);
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
