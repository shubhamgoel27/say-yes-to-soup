import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isGhostClick, type NodeLike } from '../src/ui/pointer';

/**
 * On a phone, "Begin the journey" acted at pointerup, the name card opened
 * under the finger, and the same tap's synthesized click pressed "write it
 * down": the player was named "traveler" without ever seeing the card.
 */

function node(parent: FakeNode | null = null): FakeNode {
  const n: FakeNode = {
    parent,
    isConnected: true,
    contains(o) {
      for (let c = o as FakeNode | null; c; c = c.parent) if (c === n) return true;
      return false;
    },
  };
  return n;
}
type FakeNode = NodeLike & { parent: FakeNode | null };

describe('a tap that opened a new card cannot also press it', () => {
  it('the click of the Begin tap landing on the name card is a ghost', () => {
    const title = node();
    const begin = node(title);
    const card = node();
    const write = node(card);
    assert.equal(isGhostClick(begin, write), true);
  });

  it('a click on the row whose finger came down there is real', () => {
    const card = node();
    const btn = node(card);
    const label = node(btn);
    assert.equal(isGhostClick(btn, btn), false);
    assert.equal(isGhostClick(btn, label), false, 'inside the pressed element');
    assert.equal(isGhostClick(label, btn), false, 'around the pressed element');
  });

  it('a click after the pressed element was thrown away is a ghost', () => {
    const gone = node();
    gone.isConnected = false;
    assert.equal(isGhostClick(gone, node()), true);
  });

  it('a click with no touch before it is never touched', () => {
    assert.equal(isGhostClick(null, node()), false);
  });
});
