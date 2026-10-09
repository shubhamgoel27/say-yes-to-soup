import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TOUCH_MIN, capAtPoint, type CapHit } from '../src/ui/games/scene';

/**
 * The key caps painted on a panel look like buttons, and on a phone they
 * were about 20 CSS px and not buttons at all: a tap on the kingyo rim's
 * left arrow fell into the panel's lower third and read as "down" (g3 ip-04).
 * Every cap now answers a tap over at least a 44px square.
 */
describe('painted key caps are touch targets', () => {
  // The kingyo rim at an iPhone's landscape stage (443 x 236 CSS px): three
  // caps 46 logical px apart on a 640-wide scene, each about 17px drawn.
  const bw = 443;
  const bh = 236;
  const capW = 17 / bw;
  const capH = 15 / bh;
  const y = 312 / 340;
  const caps: CapHit[] = [
    { k: 'left', cx: (320 - 46) / 640, cy: y, w: capW, h: capH },
    { k: 'space', cx: 320 / 640, cy: y, w: capW * 2, h: capH },
    { k: 'right', cx: (320 + 46) / 640, cy: y, w: capW, h: capH },
  ];
  const at = (k: CapHit) => [k.cx * bw, k.cy * bh] as const;

  it('a tap on a cap presses its key', () => {
    for (const c of caps) {
      const [x, yy] = at(c);
      assert.equal(capAtPoint(caps, x, yy, bw, bh), c.k);
    }
  });

  it('a cap answers a whole fingertip around it, not only its painted pixels', () => {
    const [x, yy] = at(caps[0]!);
    assert.equal(capAtPoint(caps, x, yy + TOUCH_MIN / 2 - 1, bw, bh), 'left', 'just inside the 44px square, below');
    assert.equal(capAtPoint(caps, x - TOUCH_MIN / 2 + 1, yy, bw, bh), 'left', 'just inside, to the left');
    assert.equal(capAtPoint(caps, x, yy - TOUCH_MIN / 2 - 2, bw, bh), null, 'outside the square is the painting again');
  });

  it('where two reach, the nearer cap wins', () => {
    const [lx, yy] = at(caps[0]!);
    const [sx] = at(caps[1]!);
    assert.equal(capAtPoint(caps, lx + (sx - lx) * 0.4, yy, bw, bh), 'left');
    assert.equal(capAtPoint(caps, lx + (sx - lx) * 0.6, yy, bw, bh), 'space');
  });

  it('no caps, no answer', () => {
    assert.equal(capAtPoint([], 10, 10, bw, bh), null);
  });
});
