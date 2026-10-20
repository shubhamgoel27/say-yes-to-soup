import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * Held input that outlives the hand holding it. Input only touches the window
 * it is attached to and navigator.getGamepads, so a tiny event target and a
 * pad list we control are all the browser these tests need.
 */

type Pad = { connected: boolean; mapping: string; buttons: { pressed: boolean }[]; axes: number[] };
let pads: (Pad | null)[] = [];
Object.defineProperty(globalThis, 'navigator', {
  value: { getGamepads: () => pads },
  configurable: true,
});

import { Input } from '../src/engine/input';

function rig() {
  const target = new EventTarget();
  const input = new Input();
  input.attach(target as unknown as Window);
  const key = (type: 'keydown' | 'keyup', code: string) => {
    const e = new Event(type) as Event & { code: string; repeat: boolean };
    e.code = code;
    e.repeat = false;
    target.dispatchEvent(e);
  };
  /** Two frames: the first spends any leftover tap, the second is the hold. */
  const held = () => {
    input.intent();
    return input.intent();
  };
  return { target, input, key, held };
}

const stickRight = (): Pad => ({
  connected: true,
  mapping: 'standard',
  buttons: Array.from({ length: 17 }, () => ({ pressed: false })),
  axes: [1, 0, 0, 0],
});

describe('a direction held by two keys', () => {
  it('W still walks after ArrowUp is let go', () => {
    const { key, held } = rig();
    key('keydown', 'KeyW');
    key('keydown', 'ArrowUp');
    key('keyup', 'ArrowUp');
    assert.equal(held(), 'up');
    key('keyup', 'KeyW');
    assert.equal(held(), null);
  });

  it('a touch lift does not drop a direction a key still holds', () => {
    const { input, key, held } = rig();
    key('keydown', 'KeyD');
    input.holdDir('right');
    input.releaseDir('right');
    assert.equal(held(), 'right');
  });
});

describe('a pad that goes away mid-walk', () => {
  it('stops walking when the pad disconnects with the stick held', () => {
    const { target, input, held } = rig();
    pads = [stickRight()];
    target.dispatchEvent(new Event('gamepadconnected'));
    input.pollGamepad();
    assert.equal(held(), 'right');
    pads = [];
    target.dispatchEvent(new Event('gamepaddisconnected'));
    input.pollGamepad();
    assert.equal(held(), null);
  });
});
