import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DELHI_STATIONS } from '../src/content/delhi/stations';
import { SHIONOURA_STATIONS } from '../src/content/shionoura/stations';
import { JOURNAL_BY_ID, NODES, NPCS, REGION_MAPS } from '../src/content/world';
import type { MapData } from '../src/engine/grid';

/**
 * Scheduled customs (stations) are data the rhythm engine derives behavior
 * from at boot: the langar's pangat rows filing in at mealtime, and the
 * lamplighter's dusk round along the chochin. These tests hold the data
 * honest the same way map tests do: every declared cell must be a real,
 * standable place, every actor a real villager, every doorway derivable,
 * and every grant a real one-shot that fills a real page.
 */

const STATIONS = [...DELHI_STATIONS, ...SHIONOURA_STATIONS];

const solidAt = (m: MapData, x: number, y: number) => {
  const g = m.legend[m.ground[y]?.[x] ?? ' '];
  const oCh = m.objects?.[y]?.[x] ?? ' ';
  const o = oCh === ' ' ? undefined : m.legend[oCh];
  return g?.solid === true || o?.solid === true;
};

const objectKind = (m: MapData, x: number, y: number) => {
  const oCh = m.objects?.[y]?.[x] ?? ' ';
  return oCh === ' ' ? undefined : m.legend[oCh]?.t;
};

describe('scheduled customs (stations)', () => {
  it('every station map exists and every actor is on the roster', () => {
    for (const st of STATIONS) {
      assert.ok(REGION_MAPS[st.map], `${st.id}: unknown map ${st.map}`);
      for (const id of st.actors) {
        assert.ok(NPCS.some((n) => n.id === id), `${st.id}: unknown actor ${id}`);
      }
      assert.ok(st.actors.length <= st.cells.length, `${st.id}: more actors than cells`);
    }
  });

  it('every cell is standable, and every tended lamp cell holds a real thing', () => {
    for (const st of STATIONS) {
      const m = REGION_MAPS[st.map];
      assert.ok(m);
      if (!m) continue;
      for (const c of st.cells) {
        assert.ok(!solidAt(m, c.at[0], c.at[1]), `${st.id}: cell ${c.at} is solid`);
        if (c.lamp) {
          const kind = objectKind(m, c.lamp[0], c.lamp[1]);
          assert.ok(kind, `${st.id}: lamp cell ${c.lamp} holds nothing`);
          // Standing cell must actually touch the lamp it tends, facing it.
          const d = Math.abs(c.at[0] - c.lamp[0]) + Math.abs(c.at[1] - c.lamp[1]);
          assert.equal(d, 1, `${st.id}: cell ${c.at} does not stand beside lamp ${c.lamp}`);
        }
      }
    }
  });

  it('the pangat gathering seats its rows on the matting itself', () => {
    const langar = DELHI_STATIONS.find((s) => s.id === 'langar-pangat');
    assert.ok(langar);
    const m = REGION_MAPS[langar?.map ?? ''];
    assert.ok(m);
    for (const c of langar?.cells ?? []) {
      assert.equal(objectKind(m as MapData, c.at[0], c.at[1]), 'pangat', `seat ${c.at} is not on a pangat row`);
    }
  });

  it('the chochin round tends chochin, in an order a walker could keep', () => {
    const round = SHIONOURA_STATIONS.find((s) => s.id === 'chochin-round');
    assert.ok(round);
    const m = REGION_MAPS[round?.map ?? ''];
    assert.ok(m);
    for (const c of round?.cells ?? []) {
      assert.ok(c.lamp, `round stop ${c.at} tends no lamp`);
      if (c.lamp) assert.equal(objectKind(m as MapData, c.lamp[0], c.lamp[1]), 'chochin');
    }
    // Sea end last: the final lamp stands on the quay rows, not the street.
    const last = round?.cells.at(-1);
    assert.ok(last && last.at[1] >= 20, 'the round should end at the sea end of town');
  });

  it('a doorway joins each actor home map to the station map, both ways', () => {
    for (const st of STATIONS) {
      for (const id of st.actors) {
        const npc = NPCS.find((n) => n.id === id);
        if (!npc || npc.map === st.map) continue;
        const home = REGION_MAPS[npc.map];
        const there = REGION_MAPS[st.map];
        assert.ok(
          (home?.triggers ?? []).some((t) => t.type === 'door' && t.to === st.map),
          `${st.id}: no door from ${npc.map} to ${st.map} for ${id}`,
        );
        assert.ok(
          (there?.triggers ?? []).some((t) => t.type === 'door' && t.to === npc.map),
          `${st.id}: no door back from ${st.map} to ${npc.map} for ${id}`,
        );
      }
    }
  });

  it('every grant is a real node that one-shots its own flag and fills a real page', () => {
    for (const st of STATIONS) {
      const g = st.grant;
      if (!g) continue;
      const node = NODES[g.node];
      assert.ok(node, `${st.id}: grant node ${g.node} missing`);
      assert.ok(node?.effects?.includes(`set:${g.flag}`), `${st.id}: ${g.node} must set:${g.flag}`);
      const pages = (node?.effects ?? []).filter((e) => e.startsWith('journal:'));
      assert.ok(pages.length > 0, `${st.id}: ${g.node} grants no page`);
      for (const p of pages) {
        assert.ok(JOURNAL_BY_ID.has(p.slice(8)), `${st.id}: unknown page ${p}`);
      }
    }
  });

  it('the chochin page is wordless: no dialogue node grants it', () => {
    const granters = Object.entries(NODES).filter(([, n]) =>
      (n.effects ?? []).includes('journal:customs.chochin'),
    );
    assert.deepEqual(
      granters.map(([id]) => id),
      ['c4.ev.chochin'],
      'customs.chochin must be granted only by the lamplighter round',
    );
  });

  it('the langar page keeps both of its paths: Joginder, and the row itself', () => {
    const granters = Object.entries(NODES)
      .filter(([, n]) => (n.effects ?? []).includes('journal:customs.langar'))
      .map(([id]) => id)
      .sort();
    assert.ok(granters.includes('c11.ev.pangat'), 'the pangat beat must grant customs.langar');
    assert.ok(granters.length >= 2, 'meeting Joginder must still grant customs.langar too');
  });

  it('windows sit inside the lively evening, before the deep-night fade', () => {
    for (const st of STATIONS) {
      const [a, b] = st.window;
      assert.ok(a < b, `${st.id}: empty window`);
      assert.ok(a >= 0.2 && b <= 0.75, `${st.id}: window ${a}..${b} outside the evening band`);
    }
  });
});
