import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { JOURNAL } from '../src/content/world';
import { JournalUI, revealScroll } from '../src/ui/journal';
import type { GameState } from '../src/engine/state';

/**
 * Launch polish for the overlays: the journal's long lists keep their place,
 * and the cursor stays on the page.
 */

describe('a journal list keeps the chosen row on the page', () => {
  // A 200px window onto a list; rows are 24px tall.
  const VIEW = 200;

  it('leaves the list alone while the row is already showing', () => {
    assert.equal(revealScroll(240, 264, 200, VIEW), 200);
    assert.equal(revealScroll(208, 232, 200, VIEW), 200);
  });

  it('moves only as far as it must, never recentring', () => {
    // Below the fold: the row's foot lands just above the window's foot.
    assert.equal(revealScroll(400, 424, 200, VIEW), 424 + 8 - VIEW);
    // Above it: the row's head lands just under the window's head.
    assert.equal(revealScroll(96, 120, 200, VIEW), 96 - 8);
  });

  it('clears the faded foot of the list', () => {
    assert.equal(revealScroll(400, 424, 200, VIEW, 8, 20), 424 + 20 - VIEW);
  });

  it('never scrolls above the top, and shows the head of a row taller than the window', () => {
    assert.equal(revealScroll(4, 28, 50, VIEW), 0);
    assert.equal(revealScroll(300, 600, 0, VIEW), 300 - 8);
  });

  it('tells a hover or a tap from the arrows by the event still being dispatched', () => {
    const heard: Record<string, ((e: Event) => void)[]> = {};
    const root = {
      hidden: true,
      addEventListener(type: string, fn: (e: Event) => void, capture?: boolean) {
        assert.equal(capture, true, 'heard before the page handlers move the cursor');
        (heard[type] ??= []).push(fn);
      },
    } as unknown as HTMLElement;
    const state = { hasPage: () => false } as unknown as GameState;
    const ui = new JournalUI(root, JOURNAL, [], [], state);
    const steering = () => (ui as unknown as { pointerSteering: boolean }).pointerSteering;
    assert.equal(steering(), false, 'nothing has pointed yet: the arrows reveal');
    for (const type of ['mouseover', 'click', 'pointerup']) {
      const ev = { eventPhase: 1 } as unknown as Event;
      for (const fn of heard[type] ?? []) fn(ev);
      (ev as { eventPhase: number }).eventPhase = 3; // bubbling up to main.ts
      assert.equal(steering(), true, `${type} in flight`);
      (ev as { eventPhase: number }).eventPhase = 0; // dispatch finished
      assert.equal(steering(), false, `${type} done: a later key press reveals again`);
    }
  });
});
