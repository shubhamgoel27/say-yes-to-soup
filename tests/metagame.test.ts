import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

/**
 * The two meta-game features: the games shelf in the pause menu, and the
 * second reading on the journals shelf. Both stand on conventions the
 * content already keeps; these tests hold those conventions honest.
 * state.ts touches localStorage and location only at call time, so the same
 * in-memory stand-in the shelf tests use is all the browser needed here.
 */

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
(globalThis as { location?: unknown }).location = { search: '' };

import { GameState, peekSlot, setActiveSlot } from '../src/engine/state';
import { REPLAY_GAMES, wonGames } from '../src/ui/pause';
import {
  CHAPTERS,
  EVENT_NODES,
  EXAMINES,
  GAMES,
  JOURNAL,
  NODES,
  NPCS,
  TASKS,
} from '../src/content/world';
import type { ExamineArm } from '../src/content/schema';

beforeEach(() => {
  store.clear();
  setActiveSlot(0);
});

// --------------------------------------------------------- the games shelf

describe('the games shelf: won-detection', () => {
  it('every replayable game is on the shelf, with the done flag its own doneNode sets', () => {
    const replayable = GAMES.filter((g) => g.replayable !== false);
    assert.equal(REPLAY_GAMES.length, replayable.length, 'a replayable game fell off the shelf');
    for (const g of replayable) {
      const entry = REPLAY_GAMES.find((r) => r.flag === g.flag);
      assert.ok(entry, `${g.flag}: not on the shelf`);
      // The convention the predicate stands on: a doneNode's FIRST set:
      // effect is the game's durable done flag. If a chapter ever breaks
      // this, the shelf would misjudge that game; this is where it fails.
      const firstSet = (NODES[g.doneNode]?.effects ?? []).find((e) => e.startsWith('set:'));
      assert.ok(firstSet, `${g.flag}: doneNode ${g.doneNode} sets no flag at all`);
      assert.equal(entry?.doneFlag, firstSet?.slice(4));
      assert.ok(
        (NODES[g.doneNode]?.effects ?? []).includes(`clear:${g.flag}`),
        `${g.flag}: doneNode never clears the start flag`,
      );
    }
  });

  it("the shelf's done flag is the same flag the villager replay arms gate on", () => {
    for (const r of REPLAY_GAMES) {
      // The dialogue replay arm: the node that sets replay.mode + the start
      // flag, and the choice that leads to it.
      const armId = Object.entries(NODES).find(
        ([, n]) =>
          (n.effects ?? []).includes('set:replay.mode') &&
          (n.effects ?? []).includes(`set:${r.flag}`),
      )?.[0];
      assert.ok(armId, `${r.flag}: no dialogue replay arm exists`);
      const gates = Object.values(NODES).flatMap((n) =>
        (n.choices ?? []).filter((c) => c.goto === armId).map((c) => c.when?.has ?? []),
      );
      assert.ok(gates.length > 0, `${r.flag}: nothing offers the replay arm ${armId}`);
      for (const has of gates) {
        assert.ok(
          has.includes(r.doneFlag),
          `${r.flag}: the villager gates the replay on ${has.join('+')}, the shelf on ${r.doneFlag}`,
        );
      }
    }
  });

  it('wonGames finds exactly the games whose flags say won', () => {
    const state = new GameState();
    assert.deepEqual(wonGames(state), [], 'a fresh journey has won nothing');

    // Win three, the way play wins them: the doneNode effects themselves.
    const won = ['weave.start', 'c5.hotteok.start', 'c11.duel.start'];
    for (const flag of won) {
      const def = GAMES.find((g) => g.flag === flag);
      assert.ok(def, `no game with start flag ${flag}`);
      state.apply(NODES[def!.doneNode]?.effects);
    }
    assert.deepEqual(
      wonGames(state).map((g) => g.flag).sort(),
      [...won].sort(),
      'the shelf must hold exactly the games the flags say are won',
    );
  });

  it('a game that declines return visits never reaches the shelf', () => {
    for (const g of GAMES.filter((x) => x.replayable === false)) {
      assert.ok(
        !REPLAY_GAMES.some((r) => r.flag === g.flag),
        `${g.flag} is replayable:false and must stay off the shelf`,
      );
    }
    // The ofrenda is the case that exists today; keep the test honest about
    // actually exercising the branch.
    assert.ok(GAMES.some((g) => g.replayable === false), 'expected at least one non-replayable game');
  });

  it('every shelf row carries a real chapter name for its tag', () => {
    for (const r of REPLAY_GAMES) {
      assert.ok(r.chapter && r.chapter.length > 0, `${r.flag}: blank chapter tag`);
      assert.notEqual(r.title, r.flag, `${r.flag}: a raw flag would show as the title`);
    }
    const chapters = new Set(REPLAY_GAMES.map((r) => r.chapter));
    assert.ok(chapters.size >= 3, 'replays should span at least three chapters');
  });
});

// -------------------------------------------------------- a second reading

/** The words a finished journey would carry into a second reading. */
const ALL_WORDS = JOURNAL.filter((e) => e.id.startsWith('words.')).map((e) => e.id);

describe('a second reading: the words come with you, nothing else does', () => {
  it('a simulated round trip keeps only the words pages', () => {
    // A finished first journey: every page, a life of flags, a name.
    const first = new GameState();
    for (const e of JOURNAL) first.apply([`journal:${e.id}`]);
    for (const f of ['story.complete', 'story.end', 'konami', 'met.rosa', 'c2.arrived', 'pallay.done']) {
      first.set(f);
    }
    first.playerName = 'Zoila';
    first.save();

    // What main.ts does on 'read again': read the inheritance off the shelf,
    // blank the slot, grant the words quietly, mark the second reading.
    const data = peekSlot(0);
    const words = (data?.journal ?? []).filter((p) => p.startsWith('words.'));
    const hadKonami = (data?.flags ?? []).includes('konami');
    first.reset();
    first.grantPagesQuietly(words);
    first.set('second.reading');
    if (hadKonami) first.set('konami');

    // A fresh boot of that slot, exactly as load() will see it.
    const second = new GameState();
    second.load();
    assert.deepEqual(
      [...second.pages()].sort(),
      [...ALL_WORDS].sort(),
      'the Words tab must be full and every other tab blank',
    );
    for (const id of ALL_WORDS) {
      assert.ok(second.has(`page.${id}`), `${id}: the page flag must rise, or gated choices stay shut`);
    }
    assert.ok(second.has('second.reading'), 'the flavor hook flag must survive the round trip');
    assert.ok(second.has('konami'), 'the old code is only a shimmer; it comes along');
    for (const gone of ['story.complete', 'story.end', 'met.rosa', 'c2.arrived', 'pallay.done']) {
      assert.ok(!second.has(gone), `${gone} must not survive a second reading`);
    }
    assert.equal(second.playerName, null, 'the flyleaf is blank again; a new name is allowed');
    assert.equal(second.errand, null);
    assert.equal(second.place, null);
  });

  it('the quiet grant fills pages without the per-page ceremony', () => {
    const state = new GameState();
    let pageEvents = 0;
    let changedEvents = 0;
    state.on('journal', () => pageEvents++);
    state.on('changed', () => changedEvents++);
    state.grantPagesQuietly(ALL_WORDS);
    assert.equal(pageEvents, 0, 'no toasts, no chimes: the pages are not news');
    assert.equal(changedEvents, 1, 'one changed event, however many pages');
    assert.equal(state.pageCount(), ALL_WORDS.length);
    // Granting again grows nothing and stays silent.
    state.grantPagesQuietly(ALL_WORDS);
    assert.equal(changedEvents, 1);
  });

  it("no task's not-condition names a words page, so pre-owned words strand nothing", () => {
    for (const t of TASKS) {
      const bad = (t.when.not ?? []).filter((f) => f.startsWith('page.words.'));
      assert.deepEqual(
        bad,
        [],
        `a task not-gated on ${bad.join('+')} would vanish forever on a second reading: "${t.text.slice(0, 50)}"`,
      );
    }
  });

  it('every journal page is still reachable when the words are pre-owned', () => {
    // The same fixpoint walk the base reachability test runs, started from a
    // second reading instead of a blank journal. Word-teaching arms that
    // no longer fire (Aurelio's chaska, Teofilo's haku) may only cost pages
    // the reading already owns, never anything new.
    const state = new GameState();
    state.grantPagesQuietly(ALL_WORDS);
    state.set('second.reading');

    const examineContexts = (arms: ExamineArm[]): (string | undefined)[] => {
      const tagged = [...new Set(arms.filter((a) => a.map).map((a) => a.map))];
      return [...tagged, undefined];
    };
    const walk = (nodeId: string, seen: Set<string>) => {
      if (seen.has(nodeId)) return;
      seen.add(nodeId);
      const node = NODES[nodeId];
      if (!node) return;
      state.apply(node.effects);
      if (node.next) walk(node.next, seen);
      for (const c of node.choices ?? []) walk(c.goto, seen);
    };
    let before = -1;
    let guard = 0;
    while (state.pageCount() !== before && guard++ < 100) {
      before = state.pageCount();
      for (const npc of NPCS) {
        const entry = npc.entry.find((e) => state.check(e.when));
        if (entry) walk(entry.node, new Set());
      }
      for (const arms of Object.values(EXAMINES)) {
        for (const ctx of examineContexts(arms)) {
          const arm = arms.find((a) => (!a.map || a.map === ctx) && state.check(a.when));
          if (arm) walk(arm.node, new Set());
        }
      }
      for (const ev of EVENT_NODES) {
        if (state.check(ev.when)) walk(ev.node, new Set());
      }
    }
    const missing = JOURNAL.filter((e) => !state.hasPage(e.id)).map((e) => e.id);
    assert.deepEqual(missing, [], `pages unreachable on a second reading: ${missing.join(', ')}`);
  });

  it('the chip guard keeps a pre-owned word from vaulting the thread ahead', () => {
    // Mirrors TASKS_GUARDED in src/main.ts: a task keyed on a words page
    // also waits for its own chapter's arrival flag.
    const guarded = TASKS.map((t) => {
      if (!(t.when.has ?? []).some((f) => f.startsWith('page.words.'))) return t;
      const owner = CHAPTERS.find((c) => c.tasks.some((x) => x.text === t.text));
      const gate = owner?.arrival?.flag;
      if (!gate || (t.when.has ?? []).includes(gate)) return t;
      return { ...t, when: { ...t.when, has: [...(t.when.has ?? []), gate] } };
    });

    const state = new GameState();
    state.grantPagesQuietly(ALL_WORDS);
    state.set('second.reading');
    const active = (list: typeof guarded) =>
      list.find((t) => !t.supersededBy.some((f) => state.has(f)) && state.check(t.when));

    // Ungated, Shaji's pour offer (keyed on page.words.chaya alone) would be
    // the chip on minute one of a second reading, pointing at Kerala from
    // the star plain. That is the wart the guard exists for.
    const raw = active(TASKS);
    assert.ok(raw, 'a fresh second reading must still surface a task');
    const kept = active(guarded);
    assert.ok(kept, 'the guard must never leave the chip dark');
    const chapterOf = (text: string) => CHAPTERS.find((c) => c.tasks.some((t) => t.text === text))?.id;
    assert.equal(
      chapterOf(kept!.text),
      CHAPTERS[0]?.id,
      `the second reading's first task must belong to chapter one, got: "${kept!.text.slice(0, 50)}"`,
    );

    // And on an ordinary journey the guard is invisible: by the time a word
    // is learned, its chapter's arrival flag is already up.
    for (const t of guarded) {
      const original = TASKS.find((o) => o.text === t.text);
      const added = (t.when.has ?? []).filter((f) => !(original?.when.has ?? []).includes(f));
      for (const f of added) {
        assert.ok(
          CHAPTERS.some((c) => c.arrival?.flag === f),
          `the guard may only add arrival flags, added ${f}`,
        );
      }
    }
  });
});
