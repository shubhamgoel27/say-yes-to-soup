import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { aimedAt, AIM_LAG_MS } from '../src/engine/aim';
import { wordsLiftTarget } from '../src/engine/camera';
import { TILE } from '../src/engine/config';
import { slideAround, type SlideGround } from '../src/engine/slide';

/**
 * Input feel, held to numbers: a click aimed at someone means them, a held
 * key slips round one small thing and never through a wall, and the words
 * never sit on the faces they belong to at either edge of a map.
 */

describe('a click means the person it was aimed at', () => {
  const at = (cx: number, cy: number): [number, number] => [cx * TILE, cy * TILE];
  it('the body drawn under the pointer, head and hat included', () => {
    const bodies = [{ who: 'justina', at: at(5, 5) }];
    assert.equal(aimedAt(5 * TILE + 8, 5 * TILE + 8, bodies), 'justina');
    assert.equal(aimedAt(5 * TILE + 8, 5 * TILE - 10, bodies), 'justina'); // the face, up in the cell above
    assert.equal(aimedAt(9 * TILE, 9 * TILE, bodies), undefined);
  });

  it('the cell someone stepped off a moment ago still means them (g3 desk-32)', () => {
    // Justina stepped right as the hand came down: the click lands on the
    // grass she left, and the walk must still end in her talk.
    const moved = { who: 'justina', at: at(6, 5), left: [{ cell: [5, 5] as [number, number], ago: 200 }] };
    assert.equal(aimedAt(5 * TILE + 8, 5 * TILE + 8, [moved]), 'justina');
    // Long gone is gone: a click there later is a walk to the grass.
    const old = { ...moved, left: [{ cell: [5, 5] as [number, number], ago: AIM_LAG_MS + 50 }] };
    assert.equal(aimedAt(5 * TILE + 8, 5 * TILE + 8, [old]), undefined);
  });

  it('a body drawn there now beats one that left it', () => {
    const left = { who: 'rosa', at: at(6, 5), left: [{ cell: [5, 5] as [number, number], ago: 100 }] };
    const here = { who: 'mateo', at: at(5, 5) };
    assert.equal(aimedAt(5 * TILE + 8, 5 * TILE + 8, [left, here]), 'mateo');
  });

  it('a near miss by a pixel or two still lands', () => {
    const bodies = [{ who: 'bantu', at: at(5, 5) }];
    assert.equal(aimedAt(5 * TILE + 1, 5 * TILE + 8, bodies), 'bantu');
  });
});

/** A small map: `#` wall, `o` a lone rock, `D` a doorway, `.` floor. */
function ground(rows: string[], bodies: [number, number][] = []): SlideGround {
  const at = (x: number, y: number) => rows[y]?.[x] ?? '#';
  return {
    solid: (x, y) => at(x, y) === '#' || at(x, y) === 'o',
    free: (x, y) => at(x, y) === '.' && !bodies.some(([bx, by]) => bx === x && by === y),
  };
}

describe('held keys slip round single small things', () => {
  it('a lone rock in the way: one step aside, toward the open side', () => {
    const g = ground([
      '.....',
      '..o..',
      '.....',
    ]);
    const side = slideAround(g, [2, 2], 'up');
    assert.ok(side === 'left' || side === 'right');
    // With a body on one side, the other.
    const g2 = ground(['.....', '..o..', '.....'], [[1, 2]]);
    assert.equal(slideAround(g2, [2, 2], 'up'), 'right');
  });

  it('the side the walker last moved toward wins a tie', () => {
    const g = ground(['.....', '..o..', '.....']);
    assert.equal(slideAround(g, [2, 2], 'up', 'right'), 'right');
    assert.equal(slideAround(g, [2, 2], 'up', 'left'), 'left');
  });

  it('walls stay solid: anything two cells across, or a wall end, knocks', () => {
    const wall = ground(['.....', '.###.', '.....']);
    assert.equal(slideAround(wall, [2, 2], 'up'), null);
    // The end of a wall: one flank is wall, so it is not a lone thing.
    const end = ground(['.....', '.##..', '.....']);
    assert.equal(slideAround(end, [2, 2], 'up'), null);
  });

  it('never slides into a doorway or past into nothing', () => {
    // A doorway either side of the rock: the slide would walk into it.
    const door = ground(['.....', '.DoD.', '.....']);
    assert.equal(slideAround(door, [2, 2], 'up'), null);
    const open = ground(['.....', '.....', '.....']);
    assert.equal(slideAround(open, [2, 2], 'up'), null);
  });

  it('works on every axis', () => {
    const g = ground(['.....', '.....', '...o.', '.....', '.....']);
    assert.ok(['up', 'down'].includes(slideAround(g, [2, 2], 'right') ?? ''));
    assert.ok(['left', 'right'].includes(slideAround(ground(['.....', '..o..', '.....']), [2, 0], 'down') ?? ''));
  });
});

describe('the words never sit on the faces', () => {
  // A 200px-tall frame whose textbox starts 140px down: the band people may
  // stand in is the top 140px, less a margin at each end.
  const top = 0;
  const box = 140;
  it('in the open, nothing moves', () => {
    assert.equal(wordsLiftTarget(60, 90, top, box, 6, 6), 0);
  });
  it('a talk near the bottom of a map lifts above the box', () => {
    const lift = wordsLiftTarget(120, 150, top, box, 6, 6);
    assert.equal(lift, 16);
    assert.ok(150 - lift + 6 <= box);
  });
  it('an arrival at the top of a map comes down off the frame edge (La Caleta, g1 126)', () => {
    // The traveler's hat is 13px above their cell, at the very top row.
    const lift = wordsLiftTarget(-13, 16, top, box, 6, 6);
    assert.equal(lift, -19);
    assert.ok(-13 - lift >= top + 6);
  });
  it('a group taller than the band keeps the faces', () => {
    const lift = wordsLiftTarget(-40, 160, top, box, 6, 6);
    assert.equal(lift, -46);
  });
});
