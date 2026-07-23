import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Actor } from '../src/engine/actor';
import { Camera } from '../src/engine/camera';
import { STEP_DUR, TILE, TURN_DELAY, VIEW_H, VIEW_W } from '../src/engine/config';
import { TileMap, type MapData } from '../src/engine/grid';
import type { Dir } from '../src/engine/input';

/**
 * The movement, collision and camera code is deliberately free of DOM
 * dependencies so it can be tested exactly like this. Anything that needs a
 * canvas lives in renderer.ts and is judged by eye instead.
 */

const FRAME = 1 / 60;

/** Runs the simulation for a stretch of time holding one direction. */
function hold(actor: Actor, dir: Dir | null, seconds: number, blocked = never) {
  let bumps = 0;
  const frames = Math.round(seconds / FRAME);
  for (let i = 0; i < frames; i++) {
    const ev = actor.update(FRAME, { intent: dir, blocked });
    if (ev?.kind === 'bumped') bumps++;
  }
  return { bumps };
}

const never = () => false;

const OPEN: MapData = {
  id: 't',
  name: 'Test',
  spawn: [5, 5],
  legend: { '.': { t: 'grass' }, '#': { t: 'adobe', solid: true }, T: { t: 'crop', tall: true } },
  ground: Array.from({ length: 12 }, () => '.'.repeat(12)),
};

describe('Actor movement', () => {
  it('walks one tile per STEP_DUR while a direction is held', () => {
    const a = new Actor(5, 5, 'down');
    // Budget covers the initial turn delay plus exactly five steps, with a
    // fraction of a step to spare so frame rounding can't cost us the fifth.
    hold(a, 'down', TURN_DELAY + STEP_DUR * 5.5);
    assert.equal(a.y, 10, 'should have advanced five tiles');
    assert.equal(a.x, 5, 'should not have drifted sideways');
  });

  it('does not pause between tiles when walking continuously', () => {
    const a = new Actor(5, 5, 'down');
    // If each step re-paid the turn delay, ten tiles would need 1.0s here and
    // this would come up short. That gap is exactly the stutter we're guarding.
    hold(a, 'down', TURN_DELAY + STEP_DUR * 10.5);
    assert.equal(a.y, 15);
  });

  it('turns in place on a tap without stepping', () => {
    const a = new Actor(5, 5, 'down');
    hold(a, 'left', FRAME); // a single frame of intent, i.e. a fast tap
    hold(a, null, 0.5);
    assert.equal(a.dir, 'left', 'should have turned to face the tap');
    assert.deepEqual([a.x, a.y], [5, 5], 'should not have moved');
  });

  it('requires a real hold before committing to a step', () => {
    const a = new Actor(5, 5, 'down');
    hold(a, 'left', TURN_DELAY * 0.5);
    assert.deepEqual([a.x, a.y], [5, 5]);
    assert.equal(a.dir, 'left');
  });

  it('bumps without moving when the target cell is solid', () => {
    const a = new Actor(5, 5, 'down');
    const wall = (x: number, y: number) => x === 5 && y === 6;
    const { bumps } = hold(a, 'down', 1.0, wall);
    assert.deepEqual([a.x, a.y], [5, 5], 'should be stuck in place');
    assert.equal(a.dir, 'down');
    assert.ok(bumps > 0, 'should have reported at least one bump');
  });

  it('cycles six walk frames across two alternating steps', () => {
    const a = new Actor(5, 5, 'down');
    hold(a, 'down', TURN_DELAY + STEP_DUR * 0.5);
    assert.ok(a.isMoving);
    const first = a.walkFrame6();
    assert.ok(first >= 0 && first <= 2, `first step uses beats 0-2, got ${first}`);
    hold(a, 'down', STEP_DUR); // into the second step
    const second = a.walkFrame6();
    assert.ok(second >= 3 && second <= 5, `second step uses beats 3-5, got ${second}`);
    hold(a, null, 0.5);
    assert.equal(a.walkFrame6(), 0, 'idle returns to the stance frame');
  });

  it('reports the cell it is facing', () => {
    const a = new Actor(5, 5, 'up');
    assert.deepEqual(a.facingCell(), [5, 4]);
    a.face('right');
    assert.deepEqual(a.facingCell(), [6, 5]);
  });

  it('reserves the destination cell for collision while mid-step', () => {
    const a = new Actor(5, 5, 'down');
    hold(a, 'down', TURN_DELAY + STEP_DUR * 0.5);
    assert.ok(a.isMoving, 'should still be mid-step');
    assert.deepEqual(a.occupies(), [5, 6], 'others must not enter the tile being walked into');
  });

  it('interpolates render position across a step', () => {
    const a = new Actor(5, 5, 'down');
    hold(a, 'down', TURN_DELAY + STEP_DUR * 0.5);
    const [, py] = a.renderPos();
    assert.ok(py > 5 * TILE && py < 6 * TILE, `expected a partial step, got ${py}`);
  });

  it('ignores intent while frozen, so dialogue can hold the player still', () => {
    const a = new Actor(5, 5, 'down');
    a.frozen = true;
    hold(a, 'down', 1.0);
    assert.deepEqual([a.x, a.y], [5, 5]);
  });
});

describe('TileMap', () => {
  const map = new TileMap({
    ...OPEN,
    ground: ['....', '.##.', '....', '....'],
    objects: ['    ', '    ', ' T  ', '    '],
  });

  it('reads dimensions from the ascii rows', () => {
    assert.equal(map.w, 4);
    assert.equal(map.h, 4);
  });

  it('blocks on solid ground tiles', () => {
    assert.equal(map.solid(1, 1), true);
    assert.equal(map.solid(0, 0), false);
  });

  it('treats everything outside the map as solid', () => {
    assert.equal(map.solid(-1, 0), true);
    assert.equal(map.solid(0, 99), true);
  });

  it('keeps tall objects walkable unless they are also solid', () => {
    assert.equal(map.object(1, 2)?.tall, true);
    assert.equal(map.solid(1, 2), false);
  });

  it('returns no object where the overlay is blank', () => {
    assert.equal(map.object(0, 0), null);
  });
});

describe('Camera', () => {
  const bigW = 60;
  const bigH = 50;

  it('centres on the target away from the edges', () => {
    const cam = new Camera();
    cam.follow(30 * TILE, 25 * TILE, bigW, bigH);
    assert.equal(cam.x, Math.round(30 * TILE + TILE / 2 - VIEW_W / 2));
    assert.equal(cam.y, Math.round(25 * TILE + TILE / 2 - VIEW_H / 2));
  });

  it('clamps at the map edges instead of showing void', () => {
    const cam = new Camera();
    cam.follow(0, 0, bigW, bigH);
    assert.deepEqual([cam.x, cam.y], [0, 0]);
    cam.follow((bigW - 1) * TILE, (bigH - 1) * TILE, bigW, bigH);
    assert.equal(cam.x, bigW * TILE - VIEW_W);
    assert.equal(cam.y, bigH * TILE - VIEW_H);
  });

  it('centres maps smaller than the viewport', () => {
    const cam = new Camera();
    const smallW = 8;
    cam.follow(4 * TILE, 4 * TILE, smallW, 6);
    assert.equal(cam.x, Math.round((smallW * TILE - VIEW_W) / 2));
    assert.equal(cam.y, Math.round((6 * TILE - VIEW_H) / 2));
  });

  it('always lands on whole pixels', () => {
    const cam = new Camera();
    cam.follow(30 * TILE + 7.3, 25 * TILE + 2.9, bigW, bigH);
    assert.equal(cam.x % 1, 0);
    assert.equal(cam.y % 1, 0);
    assert.ok(VIEW_W > 0 && VIEW_H > 0);
  });
});
