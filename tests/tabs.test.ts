import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

/**
 * One journal, two windows. Both windows read the same localStorage, and
 * either one's autosave used to write its whole journey over the other's.
 * Also: a .soup pack is someone else's file, and the name inside it is drawn
 * into the shelf as HTML.
 */

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
(globalThis as { location?: unknown }).location = { search: '' };

import { GameState, peekSlot, setActiveSlot, writeSlotRaw } from '../src/engine/state';
import { shelfLines } from '../src/ui/shelfline';

const rawSave = (extra: Record<string, unknown>) =>
  JSON.stringify({ flags: ['a'], journal: [], errand: null, place: null, name: null, look: null, ...extra });

beforeEach(() => {
  store.clear();
  setActiveSlot(0);
});

describe('two windows on one journal', () => {
  it('a stale window stops saving instead of overwriting the live one', () => {
    const a = new GameState();
    a.load();
    a.set('a.walked');
    const b = new GameState();
    b.load();
    b.set('b.walked');
    let warned = 0;
    a.onSuperseded = () => warned++;
    a.set('a.again');
    a.save();
    const kept = peekSlot(0);
    assert.ok(kept?.flags?.includes('b.walked'), 'the newer window keeps the book');
    assert.ok(!kept?.flags?.includes('a.again'), 'the stale window wrote nothing');
    assert.equal(a.superseded, true);
    assert.equal(warned, 1, 'the player is told once');
    a.save();
    assert.equal(warned, 1);
  });

  it('an idle window does not take the journal over on its timer', () => {
    const a = new GameState();
    a.load();
    a.set('one');
    const idle = new GameState();
    idle.load();
    idle.save(); // the 30s autosave, with nothing walked
    a.set('two');
    assert.equal(a.superseded, false);
    assert.ok(peekSlot(0)?.flags?.includes('two'));
  });

  it('reloading the journal picks up where the other window left it', () => {
    const a = new GameState();
    a.load();
    a.set('one');
    const b = new GameState();
    b.load();
    b.set('two');
    a.set('lost');
    assert.equal(a.superseded, true);
    a.forget();
    a.load();
    assert.equal(a.superseded, false);
    assert.ok(a.has('two'));
    a.set('three');
    assert.ok(peekSlot(0)?.flags?.includes('three'));
  });
});

describe('a name from someone else\'s file', () => {
  const evil = '<img src=x onerror=alert(1)>Ana';

  it('is cleaned on every read, like the flyleaf cleans a typed one', () => {
    assert.ok(writeSlotRaw(1, rawSave({ name: evil })));
    const name = peekSlot(1)?.name ?? '';
    assert.doesNotMatch(name, /[<>=()]/);
    setActiveSlot(1);
    const s = new GameState();
    s.load();
    assert.doesNotMatch(s.playerName ?? '', /[<>=()]/);
  });

  it('is escaped on the shelf even if it arrives raw', () => {
    const lines = shelfLines({ flags: [], name: evil });
    assert.ok(lines);
    assert.doesNotMatch(lines.who, /</);
  });

  it('keeps the names real people carry', () => {
    assert.ok(writeSlotRaw(1, rawSave({ name: "Siobhán O'Neill-Ashwini" })));
    assert.equal(peekSlot(1)?.name, 'Siobhán O’Neill-Ashwini');
  });
});

describe('the rest of someone else\'s file', () => {
  it('a facing no sprite can draw becomes down', () => {
    const raw = rawSave({ place: { map: 'village', x: 3, y: 4, dir: 'sideways' } });
    assert.ok(writeSlotRaw(1, raw));
    assert.equal(peekSlot(1)?.place?.dir, 'down');
  });
});

describe('a journal put down mid-moment', () => {
  it('remembers the open conversation and a letter not yet read', () => {
    const a = new GameState();
    a.load();
    a.talk = { node: 'rosa.coins', who: 'rosa' };
    a.apply(['set:met.rosa', 'letter:oax.telegram']);
    const b = new GameState();
    b.load();
    assert.deepEqual(b.talk, { node: 'rosa.coins', who: 'rosa' });
    assert.ok(b.has('letter.due.oax.telegram'));
    b.apply(['letterread:oax.telegram']);
    assert.ok(!b.has('letter.due.oax.telegram'));
    assert.ok(b.has('letter.read.oax.telegram'));
  });

  it('a malformed open conversation is no reason to refuse the journal', () => {
    assert.ok(writeSlotRaw(1, rawSave({ talk: { node: 7 } })));
    assert.equal(peekSlot(1)?.talk, null);
  });
});
