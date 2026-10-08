import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BLOCKING, JUG, MEETING } from '../src/content/return/staging';
import { NPCS, REGION_MAPS, TASKS } from '../src/content/world';
import { GameState } from '../src/engine/state';
import type { MapData } from '../src/engine/grid';

/**
 * The ending's staging is a picture as much as a set of cells: the verdict
 * is a ring of people round a well and a jug, seen from above, and a person
 * is a sprite wider than a tile and two tiles tall. These tests hold the
 * picture: every place is real ground, and no two people in the ring (the
 * player's open place included) stand close enough to draw over each other.
 */

const objectAt = (m: MapData, x: number, y: number) => {
  const ch = m.objects?.[y]?.[x] ?? ' ';
  return ch === ' ' ? undefined : m.legend[ch];
};
const solidAt = (m: MapData, x: number, y: number) =>
  m.legend[m.ground[y]?.[x] ?? ' ']?.solid === true || objectAt(m, x, y)?.solid === true;

// The ring is every blocking that holds while the meeting does.
const ring = BLOCKING.filter((b) => JSON.stringify(b.when) === JSON.stringify(MEETING.when));

describe('the ending: the ring at the well', () => {
  it('seats the whole village in it, each on real, open ground', () => {
    const m = REGION_MAPS[MEETING.map];
    assert.ok(m, `unknown map ${MEETING.map}`);
    assert.ok(ring.length >= 6, 'the verdict needs its crowd');
    assert.ok(ring.some((b) => b.id === MEETING.speaker), 'the speaker stands in the ring');
    for (const b of ring) {
      assert.equal(b.map, MEETING.map, `${b.id} is staged on another map`);
      assert.ok(NPCS.some((n) => n.id === b.id), `unknown villager ${b.id}`);
      assert.ok(!solidAt(m, b.at[0], b.at[1]), `${b.id} stands on something solid at ${b.at}`);
    }
    assert.ok(!solidAt(m, ...MEETING.spot), 'the open place is open');
  });

  it('keeps everybody a clear tile apart, so nobody is drawn over anybody', () => {
    const places = [...ring.map((b) => ({ who: b.id, at: b.at })), { who: 'the player', at: MEETING.spot }];
    for (let i = 0; i < places.length; i++) {
      for (let j = i + 1; j < places.length; j++) {
        const a = places[i]!;
        const b = places[j]!;
        const d = Math.max(Math.abs(a.at[0] - b.at[0]), Math.abs(a.at[1] - b.at[1]));
        assert.ok(d >= 2, `${a.who} at ${a.at} and ${b.who} at ${b.at} overlap`);
      }
    }
  });

  it('puts the jug on bare ground inside the ring, where nobody is placed', () => {
    const m = REGION_MAPS[JUG.map]!;
    const [jx, jy] = JUG.at;
    assert.equal(objectAt(m, jx, jy), undefined, 'the jug would hide an authored prop');
    assert.ok(!solidAt(m, jx, jy), 'the jug sits on walkable ground');
    for (const b of ring) assert.ok(b.at[0] !== jx || b.at[1] !== jy, `${b.id} is standing on the jug`);
    const xs = ring.map((b) => b.at[0]);
    const ys = ring.map((b) => b.at[1]);
    assert.ok(jx > Math.min(...xs) && jx < Math.max(...xs) && jy > Math.min(...ys) && jy <= MEETING.spot[1], 'inside the ring');
  });
});

describe('the ending: the chip on the way home', () => {
  it('stops sending you back to the pier once you are home, and names the well at dusk', () => {
    // A player who walks past the malecón stall without stopping still gets
    // home, and the village's evening must not be headed "La Caleta first".
    const home = new GameState();
    home.apply(['set:c9.complete', 'set:c10.arrived', 'set:c10.rosa.seen']);
    assert.ok(!/La Caleta first/.test(TASKS.find((t) => home.check(t.when))?.text ?? ''), 'home, still told to go to the pier');
    const dusk = new GameState();
    dusk.apply(['set:c9.complete', 'set:c10.arrived', 'set:c10.well.called']);
    assert.match(TASKS.find((t) => dusk.check(t.when))?.text ?? '', /Dusk at the well/);
  });
});
