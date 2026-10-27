import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AudioBus } from '../src/engine/audio';

/**
 * The music bus is moved by four things at once: the player's slider,
 * someone talking, sitting down, and the ending's hush. Each setter used to
 * write its own partial sum, so sitting on a bench brought a slider set to
 * zero back up to a third, and standing up brought it to full.
 */

(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function rig() {
  const targets: number[] = [];
  const bus = new AudioBus();
  const gain = { gain: { setTargetAtTime: (v: number) => void targets.push(v) } };
  Object.assign(bus as unknown as Record<string, unknown>, {
    ctx: { currentTime: 0, state: 'running' },
    musicGain: gain,
  });
  return { bus, last: () => targets.at(-1) };
}

describe('the music slider is the ceiling for everything else', () => {
  it('a muted band stays muted through sitting, standing, talk and the hush', () => {
    const { bus, last } = rig();
    bus.setMix('music', 0);
    assert.equal(last(), 0);
    bus.setSitting(true);
    assert.equal(last(), 0);
    bus.setSitting(false);
    assert.equal(last(), 0);
    bus.setDucked(true);
    assert.equal(last(), 0);
    bus.setDucked(false);
    bus.setHearth(true);
    assert.equal(last(), 0);
  });

  it('moving the slider while seated keeps the band stepped back', () => {
    const { bus, last } = rig();
    bus.setSitting(true);
    const seated = last()!;
    bus.setMix('music', 1);
    assert.equal(last(), seated);
    bus.setSitting(false);
    assert.ok(last()! > seated);
  });
});

describe('the ambience slider reaches the wind', () => {
  it('at zero, the wind and its breath both fall silent', () => {
    const bus = new AudioBus();
    const level: number[] = [];
    const breath: number[] = [];
    Object.assign(bus as unknown as Record<string, unknown>, {
      ctx: { currentTime: 0, state: 'running' },
      windGain: { gain: { setTargetAtTime: (v: number) => void level.push(v) } },
      windLfoGain: { gain: { setTargetAtTime: (v: number) => void breath.push(v) } },
    });
    bus.setMix('ambience', 0);
    assert.equal(level.at(-1), 0);
    assert.equal(breath.at(-1), 0);
    bus.setMix('ambience', 1);
    assert.ok(breath.at(-1)! > 0 && breath.at(-1)! < level.at(-1)!, 'the breath stays shallower than the wind');
  });
});
