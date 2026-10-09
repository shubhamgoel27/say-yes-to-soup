import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { SaveData } from '../src/engine/state';
import { shelfLines, shelfOpenPlan, stepShelfVerb, walkedLine } from '../src/ui/shelfline';

/**
 * Two journals with the same name on the shelf once read identically; the
 * only difference was "open on the table". Each row now says who, which
 * chapter and where, how full, and when to the minute.
 */

const save = (over: Partial<SaveData>): SaveData =>
  ({ name: 'Ana', journal: ['a', 'b'], place: { map: 'village', x: 1, y: 1, dir: 'down' }, ...over }) as SaveData;

describe('the shelf tells its journals apart', () => {
  it('names the chapter and the place', () => {
    const l = shelfLines(save({ place: { map: 'delhi', x: 1, y: 1, dir: 'down' } } as Partial<SaveData>));
    assert.ok(l);
    assert.match(l.where, /^chapter \w+ &middot; /);
    assert.equal(l.who, 'Ana');
    assert.equal(l.tally[0], '2 pages');
  });

  it('two journals walked the same day differ by the hour', () => {
    const now = new Date(2026, 9, 7, 18, 0);
    const a = walkedLine(new Date(2026, 9, 7, 9, 5).getTime(), now);
    const b = walkedLine(new Date(2026, 9, 7, 14, 40).getTime(), now);
    assert.equal(a, 'last walked today, 09:05');
    assert.equal(b, 'last walked today, 14:40');
  });

  it('an unsigned journal and a blank one still read', () => {
    assert.equal(shelfLines(save({ name: '  ' }))?.who, 'unsigned');
    assert.equal(shelfLines(null), null);
  });

  it('a map the build no longer knows falls back to the first village', () => {
    const l = shelfLines(save({ place: { map: 'nowhere', x: 0, y: 0, dir: 'down' } } as Partial<SaveData>));
    assert.match(l!.where, /^chapter one/);
  });
});

/**
 * The shelf trap (g3 desk-47): on a blank journal the verb cursor wrapped
 * from unpack back to open, Space opened the blank journal, and it took the
 * table from the real journey, so the cover lost Continue.
 */
describe('the shelf cursor and the blank journal', () => {
  it('the verb cursor stops at both ends instead of wrapping', () => {
    // blank row: open, unpack
    assert.equal(stepShelfVerb(1, 'right', 2), 1, 'unpack, right: stays on unpack');
    assert.equal(stepShelfVerb(0, 'left', 2), 0, 'open, left: stays on open');
    assert.equal(stepShelfVerb(0, 'right', 2), 1);
    assert.equal(stepShelfVerb(1, 'left', 2), 0);
    // full row: open, pack, unpack, erase
    assert.equal(stepShelfVerb(3, 'right', 4), 3, 'erase is the end of the line');
    assert.equal(stepShelfVerb(0, 'right', 0), 0, 'no verbs, no movement');
  });

  it('opening a blank journal goes to its flyleaf, never straight onto the table', () => {
    assert.equal(shelfOpenPlan(false), 'flyleaf');
    assert.equal(shelfOpenPlan(true), 'resume');
  });
});
