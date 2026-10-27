import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { JOURNAL } from '../src/content/world';
import { JournalUI } from '../src/ui/journal';
import type { GameState } from '../src/engine/state';

/**
 * A page shows its own margin note when it has one. Delhi's abhi reaches
 * forward to ahorita, and, found first in journal order, it once covered
 * ahorita's own note about al toque for every player holding all three.
 */
function journalHolding(pages: string[]) {
  const held = new Set(pages);
  const state = { hasPage: (id: string) => held.has(id) } as unknown as GameState;
  const ui = new JournalUI({} as HTMLElement, JOURNAL, [], [], state);
  return (id: string) =>
    (ui as unknown as { rhymeFor(id: string): { other: { id: string } } | null }).rhymeFor(id);
}

describe('a page keeps its own margin note', () => {
  it('ahorita stitches to al toque, even with abhi in hand', () => {
    const rhymeFor = journalHolding(['words.abhi', 'words.ahorita', 'words.altoque']);
    assert.equal(rhymeFor('words.ahorita')?.other.id, 'words.altoque');
    assert.equal(rhymeFor('words.abhi')?.other.id, 'words.ahorita');
  });

  it('every page with its own rhyme shows that rhyme when both halves are held', () => {
    for (const e of JOURNAL) {
      if (!e.rhyme) continue;
      const rhymeFor = journalHolding(JOURNAL.map((j) => j.id));
      assert.equal(rhymeFor(e.id)?.other.id, e.rhyme.with, e.id);
    }
  });
});
