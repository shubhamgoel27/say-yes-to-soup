import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AudioBus } from '../src/engine/audio';

/**
 * The wind loop and Delhi's harmonium drone kept sounding from a background
 * tab while the game itself had stopped. A hidden tab now suspends the
 * context, and coming back wakes only what hiding put to sleep.
 */

function fakeCtx(state: 'running' | 'suspended') {
  const calls: string[] = [];
  const ctx = {
    state,
    suspend() {
      calls.push('suspend');
      ctx.state = 'suspended';
      return Promise.resolve();
    },
    resume() {
      calls.push('resume');
      ctx.state = 'running';
      return Promise.resolve();
    },
  };
  return { ctx, calls };
}

function busWith(ctx: unknown): AudioBus {
  const bus = new AudioBus();
  (bus as unknown as { ctx: unknown }).ctx = ctx;
  return bus;
}

describe('a hidden tab is a quiet tab', () => {
  it('hiding suspends a running context and returning resumes it', () => {
    const { ctx, calls } = fakeCtx('running');
    const bus = busWith(ctx);
    bus.setHidden(true);
    assert.equal(ctx.state, 'suspended');
    bus.setHidden(false);
    assert.equal(ctx.state, 'running');
    assert.deepEqual(calls, ['suspend', 'resume']);
  });

  it('returning does not wake a context that was asleep before hiding', () => {
    const { ctx, calls } = fakeCtx('suspended');
    const bus = busWith(ctx);
    bus.setHidden(true);
    bus.setHidden(false);
    assert.deepEqual(calls, []);
  });

  it('no context yet, nothing to do', () => {
    const bus = new AudioBus();
    bus.setHidden(true);
    bus.setHidden(false);
  });
});
