import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { keysOrTaps } from '../src/ui/responsive';
import { ballAt } from '../src/ui/weave';

describe('a finger on the loom picks the ball it touches', () => {
  // Scene px, as painted: left, up, right, down around the basket.
  const CENTERS: [number, number][] = [
    [452, 178],
    [523, 106],
    [594, 178],
    [523, 250],
  ];

  it('each ball answers for itself, dead center and at its rim', () => {
    CENTERS.forEach(([x, y], i) => {
      assert.equal(ballAt(x, y), i);
      assert.equal(ballAt(x + 20, y - 10), i);
    });
  });

  it('the arrow tag under a ball belongs to that ball', () => {
    CENTERS.forEach(([x, y], i) => assert.equal(ballAt(x, y + 34), i));
  });

  it('the empty middle of the basket and the cloth answer nothing', () => {
    assert.equal(ballAt(523, 178), -1);
    assert.equal(ballAt(250, 200), -1);
    assert.equal(ballAt(0, 0), -1);
  });

  it('no point between two neighbours is claimed by both', () => {
    // Halfway from left to up: nearer neither, reached by neither.
    assert.equal(ballAt((452 + 523) / 2, (178 + 106) / 2), -1);
  });
});

describe('key words on a desk, finger words on glass', () => {
  it('speaks keys to a fine pointer and taps to a coarse one', () => {
    assert.equal(keysOrTaps('press N', 'tap the thread', false), 'press N');
    assert.equal(keysOrTaps('press N', 'tap the thread', true), 'tap the thread');
  });

  it('defaults to keys where there is no screen to ask (node, SSR)', () => {
    assert.equal(keysOrTaps('Esc back', 'tap beside the page'), 'Esc back');
  });
});
