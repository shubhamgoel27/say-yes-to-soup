import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, EXAMINES, NODES } from '../src/content/world';

/**
 * A village's own words stay in that village. An untagged examine arm is a
 * fallback for every later map, so a line about Quechua radios or glacier
 * boulders once spoke up in Sicily and Zanzibar. This walks every map, finds
 * the arm a player would actually hear for each prop, and fails if Andean
 * vocabulary answers outside the Andes.
 */
const ANDEAN = /quechua|ichu|glacier|pampa|apacheta|llama|alpaca|chicha|the valley/i;
const ANDES = new Set(['chaska-pampa', 'return']);

test('Andean examine lines never answer outside the Andes', () => {
  const leaks: string[] = [];
  for (const c of CHAPTERS) {
    if (ANDES.has(c.id)) continue;
    for (const m of c.maps) {
      const kinds = new Set<string>();
      for (const rows of [m.ground, m.objects ?? []]) for (const r of rows) for (const ch of r) {
        const d = m.legend[ch];
        if (d) kinds.add(d.t);
      }
      for (const k of kinds) {
        const arm = (EXAMINES[k] ?? []).find((a) => (!a.map || a.map === m.id) && !a.when);
        if (!arm || !ANDES.has(arm.chapter)) continue;
        const text = (NODES[arm.node]?.lines ?? []).map((l) => l.text).join(' ');
        if (ANDEAN.test(text)) leaks.push(`${m.id}/${k}: ${arm.node}`);
      }
    }
  }
  assert.deepEqual(leaks, []);
});
