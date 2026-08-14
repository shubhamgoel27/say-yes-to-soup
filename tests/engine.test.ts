import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Actor } from '../src/engine/actor';
import { AudioBus } from '../src/engine/audio';
import { Camera } from '../src/engine/camera';
import { CULL, SPRITE_EXTENT } from '../src/engine/renderer';
import { makeDtSmoother } from '../src/engine/loop';
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

  it('follows fractionally, so eased motion never quantizes into jumps', () => {
    const cam = new Camera();
    cam.follow(30 * TILE + 7.3, 25 * TILE + 2.9, bigW, bigH);
    assert.equal(cam.x, 30 * TILE + 7.3 + TILE / 2 - VIEW_W / 2);
    assert.equal(cam.y, 25 * TILE + 2.9 + TILE / 2 - VIEW_H / 2);
  });

  /**
   * Standing still must not move the world. The lookahead used to ease back
   * to zero when the player stopped, which slid the whole scene backwards for
   * about half a second at the end of every walk, and players read that as
   * the game lurching in reverse whenever they let go.
   */
  it('holds its lookahead at rest instead of sliding the world back', () => {
    const cam = new Camera();
    const px = 30 * TILE;
    const py = 25 * TILE;
    for (let i = 0; i < 60; i++) cam.lead(1, 0, 1 / 60); // walk right one second
    cam.follow(px, py, bigW, bigH);
    const ahead = cam.x;
    for (let i = 0; i < 600; i++) cam.lead(0, 0, 1 / 60); // then stand there
    cam.follow(px, py, bigW, bigH);
    assert.equal(cam.x, ahead, 'the camera moved while the player stood still');
  });

  it('re-aims the lookahead when the player sets off the other way', () => {
    const cam = new Camera();
    const px = 30 * TILE;
    const py = 25 * TILE;
    for (let i = 0; i < 60; i++) cam.lead(1, 0, 1 / 60);
    cam.follow(px, py, bigW, bigH);
    const right = cam.x;
    for (let i = 0; i < 120; i++) cam.lead(-1, 0, 1 / 60); // walk left instead
    cam.follow(px, py, bigW, bigH);
    assert.ok(cam.x < right - 20, 'lookahead did not swing to the new direction');
  });

  it('leaves the idle axis alone when turning a corner', () => {
    const cam = new Camera();
    const px = 30 * TILE;
    const py = 25 * TILE;
    for (let i = 0; i < 60; i++) cam.lead(1, 0, 1 / 60); // east
    cam.follow(px, py, bigW, bigH);
    const eastX = cam.x;
    for (let i = 0; i < 60; i++) cam.lead(0, 1, 1 / 60); // now south, no x intent
    cam.follow(px, py, bigW, bigH);
    assert.equal(cam.x, eastX, 'turning a corner yanked the other axis home');
  });
});

describe('the draw range covers the art it must draw', () => {
  /**
   * Sprites hang up and slightly left of the cell they are anchored to, so the
   * anchor of a building whose roof is plainly on screen can be several tiles
   * below the bottom edge and several to the left. Margins that do not cover
   * that make houses blink out as the player walks away and blink back on the
   * way in. This once shipped: the margins padded five tiles above, where tall
   * art never reaches, and one below, where it always does.
   */
  it('pads far enough below and left for a bottom-anchored sprite', () => {
    // Below: art rises (tall - 1) tiles above its anchor row, so an anchor
    // that far below the bottom edge is still partly on screen.
    assert.ok(
      CULL.bottom >= Math.ceil(SPRITE_EXTENT.tall - 1),
      `bottom margin ${CULL.bottom} cannot reach an anchor ${Math.ceil(SPRITE_EXTENT.tall - 1)} tiles below the view`,
    );
    // Left: art runs (wide - 1) tiles right of its anchor column, so an anchor
    // that far left of the left edge still paints into the view.
    assert.ok(
      CULL.left >= Math.ceil(SPRITE_EXTENT.wide - 1),
      `left margin ${CULL.left} cannot reach an anchor ${Math.ceil(SPRITE_EXTENT.wide - 1)} tiles left of the view`,
    );
  });

  it('pads far enough above and right for the overhang', () => {
    assert.ok(CULL.top >= 1, 'top margin must cover a sprite standing on the first row above');
    assert.ok(
      CULL.right >= Math.ceil(SPRITE_EXTENT.leftOverhang) + 1,
      'right margin must cover a sprite whose art overhangs left of its anchor',
    );
  });
});

describe('AudioBus KS cache', () => {
  /**
   * The Karplus-Strong buffers are rendered on the main thread; the cache is
   * what keeps that off the frame budget. Two behaviors matter: overflow must
   * evict a few stale entries (a wholesale clear() forced the next phrase to
   * re-render every buffer in one frame, which measured as a random visible
   * hitch), and a region change must be able to prewarm its buffers a few per
   * frame so the first phrase in a new place never renders cold in a burst.
   *
   * The tests reach into private fields on purpose; the alternative is not
   * testing the exact mechanism the stutter fix depends on. A minimal fake
   * AudioContext (sampleRate plus createBuffer) is all ksBuffer needs.
   */
  type Internals = {
    ctx: unknown;
    ksCache: Map<string, unknown>;
    ksWarmQueue: [number, number, number][];
    ksBuffer(freq: number, bright: number, decay: number): unknown;
    degFreq(deg: number): number;
    style: { motifs: [number, number][][]; scale: number[] };
  };
  const bare = (bus: AudioBus) => bus as unknown as Internals;
  const fakeCtx = {
    sampleRate: 4000,
    createBuffer: (_ch: number, len: number) => ({ getChannelData: () => new Float32Array(len) }),
  };
  const key = (f: number, bright: number, decay: number) => `${Math.round(f)}:${bright}:${decay}`;

  it('evicts a stale few on overflow instead of clearing wholesale', () => {
    const b = bare(new AudioBus());
    b.ctx = fakeCtx;
    for (let f = 100; f < 196; f++) b.ksBuffer(f, 2500, 0.4);
    assert.equal(b.ksCache.size, 96);
    b.ksBuffer(500, 2500, 0.4); // one past the cap
    assert.equal(b.ksCache.size, 96 - 8 + 1, 'overflow should shed only a handful');
    assert.ok(!b.ksCache.has(key(100, 2500, 0.4)), 'the stalest entry should be gone');
    assert.ok(b.ksCache.has(key(195, 2500, 0.4)), 'recent entries should survive');
    assert.ok(b.ksCache.has(key(500, 2500, 0.4)), 'the new entry should be cached');
  });

  it('keeps a recently replayed buffer through an eviction', () => {
    const b = bare(new AudioBus());
    b.ctx = fakeCtx;
    for (let f = 100; f < 196; f++) b.ksBuffer(f, 2500, 0.4);
    b.ksBuffer(100, 2500, 0.4); // a cache hit must refresh recency
    b.ksBuffer(500, 2500, 0.4); // overflow evicts the stalest eight
    assert.ok(b.ksCache.has(key(100, 2500, 0.4)), 'the replayed buffer should survive');
    assert.ok(!b.ksCache.has(key(101, 2500, 0.4)), 'eviction should fall on the stalest instead');
  });

  it('prewarms a new region: draining the queue covers its motifs, night string and door', () => {
    const bus = new AudioBus();
    const b = bare(bus);
    b.ctx = fakeCtx;
    bus.setRegion('busan'); // a string voice (gayageum), so buffers are in play
    assert.ok(b.ksWarmQueue.length > 0, 'setRegion should queue prewarm work');
    while (b.ksWarmQueue.length > 0) {
      const [f, bright, decay] = b.ksWarmQueue.shift()!;
      b.ksBuffer(f, bright, decay);
    }
    const degs = new Set(b.style.motifs.flat().map(([deg]) => deg));
    for (const deg of degs) {
      const f = b.degFreq(deg);
      // The gayageum's sustained note and its grace-note approach.
      assert.ok(b.ksCache.has(key(f, 2100, 1.8)), `motif degree ${deg} should be warm`);
      assert.ok(b.ksCache.has(key(f * 0.89, 2100, 0.3)), `grace for degree ${deg} should be warm`);
      // The shared after-dark string.
      assert.ok(b.ksCache.has(key(f, 1900, 1.5)), `night string for degree ${deg} should be warm`);
    }
    assert.ok(b.ksCache.has(key(b.style.scale[0]!, 2000, 1.1)), 'the door note should be warm');
  });
});

describe('the dt smoother absorbs strays and follows real cadence changes', () => {
  const jitter = (base: number, i: number) => base + Math.sin(i * 2.7) * base * 0.05;

  it('a lone misreported frame causes no burst of raw deltas', () => {
    const smooth = makeDtSmoother();
    for (let i = 0; i < 30; i++) smooth(jitter(8.3, i));
    const out: number[] = [];
    out.push(smooth(16.6)); // one stray double-interval report
    for (let i = 0; i < 12; i++) out.push(smooth(jitter(8.3, i)));
    // The first version reset here and ran raw for twelve frames. Now every
    // output stays near the cadence: the stray is repaid smoothly, capped at
    // a quarter step, never echoed as a lurch.
    for (const v of out) {
      assert.ok(v > 8.3 * 0.7 && v < 8.3 * 1.3, `output ${v.toFixed(2)}ms strayed from the 8.3ms cadence`);
    }
  });

  it('conserves total time across noise, so the sim clock stays true', () => {
    const smooth = makeDtSmoother();
    let input = 0;
    let output = 0;
    for (let i = 0; i < 400; i++) {
      const raw = i % 37 === 0 ? 16.6 : jitter(8.3, i);
      input += raw;
      output += smooth(raw);
    }
    assert.ok(Math.abs(input - output) < 25, `sim drifted ${(input - output).toFixed(1)}ms from wall time over 400 frames`);
  });

  it('adopts a genuine cadence change within three frames', () => {
    const smooth = makeDtSmoother();
    for (let i = 0; i < 30; i++) smooth(jitter(8.3, i));
    smooth(16.7);
    smooth(16.7);
    const adopted = smooth(16.7);
    assert.ok(Math.abs(adopted - 16.7) < 0.01, `after three 60Hz frames the step was still ${adopted.toFixed(2)}ms`);
    const settled = smooth(16.7);
    assert.ok(settled > 15 && settled < 18.5, `the new cadence did not hold: ${settled.toFixed(2)}ms`);
  });
});

describe('paused time is forgiven, not repaid', () => {
  it('a long hidden-tab gap does not speed the game up afterward', () => {
    const smooth = makeDtSmoother();
    for (let i = 0; i < 30; i++) smooth(8.3);
    smooth(31 * 60 * 1000); // half an hour hidden
    for (let i = 0; i < 5; i++) smooth(8.3);
    const settled = smooth(8.3);
    assert.ok(Math.abs(settled - 8.3) < 0.5, `after a pause the step ran ${settled.toFixed(2)}ms instead of 8.3`);
  });
});

describe('a rolled key transition does not break stride', () => {
  const walkCtx = (intent: 'right' | 'down' | null) => ({ intent, blocked: () => false });

  const stepFrames = (a: InstanceType<typeof Actor>, intent: 'right' | 'down' | null, frames: number) => {
    for (let i = 0; i < frames; i++) a.update(1 / 120, walkCtx(intent));
  };

  it('a two-frame gap between key presses keeps the walk moving', () => {
    const a = new Actor(5, 5, 'right');
    stepFrames(a, 'right', 60); // half a second of walking; momentum is live
    const before = a.x;
    stepFrames(a, null, 2); // the finger-roll gap
    stepFrames(a, 'right', 10); // ~83ms of re-held key
    const [px] = a.renderPos();
    assert.ok(
      px > before * 16 + 1,
      `after a 2-frame key gap the walk should already be moving again, render x ${px} vs tile ${before * 16}`,
    );
  });

  it('a gap into a new direction steps without the standstill gate', () => {
    const a = new Actor(5, 5, 'right');
    stepFrames(a, 'right', 60);
    stepFrames(a, null, 2);
    stepFrames(a, 'down', 10);
    assert.ok(a.isMoving || a.y > 5, 'the steer after a key gap should flow into a step');
  });

  it('a tap from a true standstill still turns in place first', () => {
    const a = new Actor(5, 5, 'right');
    stepFrames(a, null, 60); // long standstill; momentum long gone
    stepFrames(a, 'down', 2); // a tap's worth of hold
    assert.ok(!a.isMoving && a.y === 5, 'a short tap from rest must turn, not step');
    assert.equal(a.dir, 'down');
  });
});
