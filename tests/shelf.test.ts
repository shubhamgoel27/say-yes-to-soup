import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

/**
 * The shelf: three journals in localStorage, slot 0 on the exact keys the
 * game has always used, so a journey saved before the shelf shipped appears
 * on it untouched. state.ts touches localStorage and location only at call
 * time, so a small in-memory stand-in installed before the tests run is all
 * the browser these tests need.
 */

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
const loc = { search: '' };
(globalThis as { location?: unknown }).location = loc;

import {
  GameState,
  activeSlot,
  eraseSlot,
  packSlot,
  peekSlot,
  setActiveSlot,
  slotOccupied,
  unpackJournal,
  writeSlotRaw,
} from '../src/engine/state';

/** A minimal save exactly as save() would write it. */
const rawSave = (flags: string[], extra: Record<string, unknown> = {}) =>
  JSON.stringify({ flags, journal: [], errand: null, place: null, name: null, look: null, ...extra });

beforeEach(() => {
  store.clear();
  loc.search = '';
});

describe('the shelf: slot key prefixing', () => {
  it('slot 0 writes the original keys, later slots suffix them', () => {
    setActiveSlot(0);
    const s0 = new GameState();
    s0.set('first');
    assert.ok(store.has('elsewhere.save'), 'slot 0 must keep the pre-shelf key');

    setActiveSlot(1);
    const s1 = new GameState();
    s1.set('second');
    assert.ok(store.has('elsewhere.save.2'), 'slot 1 lives at elsewhere.save.2');

    setActiveSlot(2);
    const s2 = new GameState();
    s2.set('third');
    assert.ok(store.has('elsewhere.save.3'), 'slot 2 lives at elsewhere.save.3');
  });

  it('the backup chain works identically per slot', () => {
    setActiveSlot(1);
    const s = new GameState();
    s.set('one');
    const first = store.get('elsewhere.save.2');
    s.set('two');
    assert.equal(store.get('elsewhere.save.2.bak'), first, 'the previous good save becomes the slot backup');
    assert.ok(!store.has('elsewhere.save.bak'), 'slot 0 backup key must stay untouched');
  });

  it('a corrupt primary in a slot falls back to that slot backup on load', () => {
    setActiveSlot(2);
    store.set('elsewhere.save.3', '{"flags": "torn write"}');
    store.set('elsewhere.save.3.bak', rawSave(['survived']));
    const s = new GameState();
    s.load();
    assert.ok(s.has('survived'), 'the last known-good copy must engage');
  });

  it('?fresh clears only the active slot', () => {
    store.set('elsewhere.save', rawSave(['keep']));
    store.set('elsewhere.save.2', rawSave(['wipe']));
    setActiveSlot(1);
    loc.search = '?fresh';
    new GameState().load();
    assert.ok(!store.has('elsewhere.save.2'), 'the active slot is cleared');
    assert.ok(store.has('elsewhere.save'), 'the neighbouring journal is untouched');
  });
});

describe('the shelf: slot 0 backward compatibility', () => {
  it('an old-style elsewhere.save appears as the first journal, untouched', () => {
    const raw = rawSave(['met.rosa', 'page.words.sulpayki'], {
      journal: ['words.sulpayki'],
      name: 'Zoila',
      place: { map: 'village', x: 4, y: 5, dir: 'down' },
    });
    store.set('elsewhere.save', raw);
    assert.equal(activeSlot(), 0, 'with no shelf key the first journal is open');
    const s = new GameState();
    s.load();
    assert.ok(s.has('met.rosa'));
    assert.equal(s.playerName, 'Zoila');
    assert.equal(store.get('elsewhere.save'), raw, 'reading must not rewrite the save');
    assert.ok(slotOccupied(0));
    assert.equal(peekSlot(0)?.name, 'Zoila');
  });

  it('the pre-rename wayfare.save still loads, in slot 0 only', () => {
    store.set('wayfare.save', rawSave(['from.the.old.days']));
    setActiveSlot(0);
    const s = new GameState();
    s.load();
    assert.ok(s.has('from.the.old.days'));
    assert.ok(slotOccupied(0), 'the legacy save counts as an occupied first slot');

    setActiveSlot(1);
    const s1 = new GameState();
    s1.load();
    assert.ok(!s1.has('from.the.old.days'), 'legacy keys must never bleed into other slots');
    assert.ok(!slotOccupied(1));
  });

  it('a garbled shelf index falls back to the first journal', () => {
    store.set('elsewhere.shelf', 'abc');
    assert.equal(activeSlot(), 0);
    store.set('elsewhere.shelf', '9');
    assert.equal(activeSlot(), 0);
    store.set('elsewhere.shelf', '-1');
    assert.equal(activeSlot(), 0);
  });
});

describe('the shelf: journeys stay independent', () => {
  it('two slots hold different flags and switching swaps them cleanly', () => {
    setActiveSlot(0);
    const a = new GameState();
    a.set('journey.a');
    const slot0Bytes = store.get('elsewhere.save');

    setActiveSlot(1);
    const b = new GameState();
    b.set('journey.b');

    assert.equal(store.get('elsewhere.save'), slot0Bytes, 'saving slot 1 must not touch slot 0');

    // forget() puts the loaded journey down without touching the shelf.
    b.forget();
    assert.ok(!b.has('journey.b'), 'forget clears the memory');
    assert.ok(store.has('elsewhere.save.2'), 'forget leaves the storage alone');
    setActiveSlot(0);
    b.load();
    assert.ok(b.has('journey.a') && !b.has('journey.b'), 'the other journal reads back whole');
  });

  it('reset and eraseSlot touch only their own journal', () => {
    store.set('elsewhere.save', rawSave(['a']));
    store.set('elsewhere.save.bak', rawSave(['a-old']));
    store.set('wayfare.save', rawSave(['a-ancient']));
    store.set('elsewhere.save.2', rawSave(['b']));

    setActiveSlot(1);
    new GameState().reset();
    assert.ok(!store.has('elsewhere.save.2'), 'the active slot is erased');
    assert.ok(store.has('elsewhere.save') && store.has('wayfare.save'), 'slot 0 survives');

    eraseSlot(0);
    assert.ok(!store.has('elsewhere.save') && !store.has('elsewhere.save.bak') && !store.has('wayfare.save'),
      'erasing slot 0 clears primary, backup, and the pre-rename key');
  });
});

describe('pack and unpack: a journal in an envelope', () => {
  const journey = rawSave(['met.rosa', 'konami'], {
    journal: ['words.sulpayki', 'food.chupe'],
    name: 'Zoila Ñusta',
    place: { map: 'delhi', x: 12, y: 7, dir: 'left' },
  });

  it('round-trips the stored save byte-for-byte', () => {
    store.set('elsewhere.save', journey);
    const packed = packSlot(0);
    assert.ok(packed, 'an occupied slot must pack');
    assert.equal(packed.name, 'Zoila Ñusta', 'the flyleaf name rides along for the filename');
    const raw = unpackJournal(packed.text);
    assert.equal(raw, journey, 'unpack must return the exact bytes that were packed');

    assert.ok(writeSlotRaw(1, raw as string));
    assert.equal(store.get('elsewhere.save.2'), journey, 'the slot receives the exact bytes');
    assert.equal(peekSlot(1)?.name, 'Zoila Ñusta');
  });

  it('keeps the journal already in the slot as that slot backup', () => {
    store.set('elsewhere.save.2', rawSave(['resident']));
    assert.ok(writeSlotRaw(1, journey));
    assert.equal(store.get('elsewhere.save.2'), journey);
    assert.equal(store.get('elsewhere.save.2.bak'), rawSave(['resident']),
      'one unpacking mistake must stay survivable');
  });

  it('rejects a tampered payload: the checksum is a seal', () => {
    store.set('elsewhere.save', journey);
    const packed = packSlot(0)!;
    const env = JSON.parse(packed.text) as { data: string };
    const flipped = (env.data[0] === 'A' ? 'B' : 'A') + env.data.slice(1);
    const tampered = JSON.stringify({ ...env, data: flipped });
    assert.equal(unpackJournal(tampered), null, 'a changed payload must not be trusted');
  });

  it('rejects everything that is not a packed journal', () => {
    assert.equal(unpackJournal('not even json'), null);
    assert.equal(unpackJournal('{"kind":"grocery-list"}'), null);
    assert.equal(unpackJournal(JSON.stringify({ kind: 'zoila-journal', version: 99, checksum: '0', data: '' })),
      null, 'a future version is politely declined');
    store.set('elsewhere.save', journey);
    const truncated = packSlot(0)!.text.slice(0, 40);
    assert.equal(unpackJournal(truncated), null, 'a torn download must not be trusted');
  });

  it('refuses to write anything parseSave would refuse', () => {
    assert.equal(writeSlotRaw(1, '{"flags":"not an array"}'), false);
    assert.ok(!store.has('elsewhere.save.2'));
  });

  it('packs from the backup when the primary is torn', () => {
    store.set('elsewhere.save.3', '{"flags": 3}');
    store.set('elsewhere.save.3.bak', journey);
    const packed = packSlot(2);
    assert.ok(packed, 'the last known-good copy is still worth packing');
    assert.equal(unpackJournal(packed.text), journey);
  });

  it('has nothing to pack from a blank journal', () => {
    assert.equal(packSlot(1), null);
  });
});

describe('the persistence-lost signal survives per slot', () => {
  it('says so once when writes fail, and recovers when they return', () => {
    setActiveSlot(1);
    const s = new GameState();
    let warned = 0;
    s.onPersistenceLost = () => warned++;
    const working = localStorage.setItem;
    (localStorage as { setItem: unknown }).setItem = () => {
      throw new Error('full');
    };
    s.set('a');
    s.set('b');
    assert.equal(warned, 1, 'the warning fires once, not per save');
    assert.equal(s.persistenceLost, true);
    (localStorage as { setItem: unknown }).setItem = working;
    s.set('c');
    assert.equal(s.persistenceLost, false, 'a landed save clears the signal');
    assert.ok(store.has('elsewhere.save.2'), 'and it landed in the slot keys');
  });
});
