import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { offerDue } from '../src/ui/responsive';

/**
 * One portrait policy on every phone (g3 ip-01): upright is playable, and
 * the first natural tap while upright earns one sideways offer a session.
 * iPhone used to get a wall that waited for the turn while Android played.
 * Nothing in the decision depends on whether the browser can lock: that
 * only changes what the card's button does.
 */
describe('the sideways offer', () => {
  const base = { portrait: true, declines: 0, lockActive: false, fullscreen: false, offerShowing: false, allowed: true };

  it('is offered on the first upright tap in the world', () => {
    assert.equal(offerDue(base), true);
  });

  it('is offered once a session, never again after a decline', () => {
    assert.equal(offerDue({ ...base, declines: 1 }), false);
  });

  it('waits while the tap belongs to the cover or a card, and never comes lying down', () => {
    assert.equal(offerDue({ ...base, allowed: false }), false);
    assert.equal(offerDue({ ...base, portrait: false }), false);
  });

  it('never stacks on itself or on a granted landscape', () => {
    assert.equal(offerDue({ ...base, offerShowing: true }), false);
    assert.equal(offerDue({ ...base, lockActive: true }), false);
    assert.equal(offerDue({ ...base, fullscreen: true }), false);
  });
});
