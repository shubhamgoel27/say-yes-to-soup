import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { STICK_DEAD, STICK_GRIP, quantizeStick } from '../src/ui/stick';

describe('the floating stick speaks crisp directions', () => {
  it('rests inside the dead zone', () => {
    assert.equal(quantizeStick(0, 0, null), null);
    assert.equal(quantizeStick(STICK_DEAD - 1, 0, null), null);
    assert.equal(quantizeStick(9, 9, 'right'), null);
  });

  it('takes the dominant axis on a fresh push', () => {
    assert.equal(quantizeStick(30, 4, null), 'right');
    assert.equal(quantizeStick(-30, 4, null), 'left');
    assert.equal(quantizeStick(3, 28, null), 'down');
    assert.equal(quantizeStick(3, -28, null), 'up');
  });

  it('a held direction survives a diagonal wobble', () => {
    // Walking right, the thumb drifts down until down barely dominates:
    // without the grip this is exactly the drunk-walker flicker.
    assert.equal(quantizeStick(30, 33, 'right'), 'right');
    assert.equal(quantizeStick(30, 30 * STICK_GRIP - 0.5, 'right'), 'right');
  });

  it('a committed push to the other axis wins', () => {
    assert.equal(quantizeStick(30, 30 * STICK_GRIP + 1, 'right'), 'down');
    assert.equal(quantizeStick(-20 * STICK_GRIP - 1, 20, 'down'), 'left');
  });

  it('reversing along the held axis needs no ceremony', () => {
    assert.equal(quantizeStick(-25, 4, 'right'), 'left');
    assert.equal(quantizeStick(3, -25, 'down'), 'up');
  });

  it('the wobble never flickers across a long slide', () => {
    // A thumb arcing from due right to due down through the diagonal:
    // the answer must change exactly once, right to down, no bouncing.
    let held: ReturnType<typeof quantizeStick> = null;
    const seen: string[] = [];
    for (let t = 0; t <= 20; t++) {
      const angle = (t / 20) * (Math.PI / 2);
      held = quantizeStick(40 * Math.cos(angle), 40 * Math.sin(angle), held);
      if (held && seen[seen.length - 1] !== held) seen.push(held);
    }
    assert.deepEqual(seen, ['right', 'down']);
  });
});
