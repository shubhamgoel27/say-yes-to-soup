import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Cond } from '../src/content/schema';
import { CHAPTERS, TASKS } from '../src/content/world';
import { openTasks } from '../src/content/guide';
import { chipHolds, currentChapter, firstSentence, taskDone, taskPage, type TaskPageState } from '../src/ui/taskpage';

/**
 * The Tasks tab was one row on an empty sheet (g3 desk-16, gal-14). It is
 * now a page of her book: now, written large; this place's finished threads
 * crossed off in the order they closed, with its dishes and people; earlier
 * places folded. These tests read the same page the player reads.
 */

function fake(flags: string[], pages: string[] = [], errand: string | null = null): TaskPageState {
  const f = new Set(flags);
  const p = new Set(pages);
  return {
    has: (x) => f.has(x),
    check: (c: Cond | undefined) => !c || ((c.has ?? []).every((x) => f.has(x)) && !(c.not ?? []).some((x) => f.has(x))),
    hasPage: (x) => p.has(x),
    errand,
    flagSet: () => f,
  };
}

const ch1 = (text: RegExp) => {
  const t = TASKS.find((x) => x.chapter === 0 && text.test(x.text));
  assert.ok(t, `no chapter one task matches ${text}`);
  return t;
};

describe('the task page', () => {
  it('a thread is done once taken up and then closed, never before', () => {
    const bundle = ch1(/^Rosa's bundle goes/);
    assert.equal(taskDone(bundle, fake([])), false, 'not yet taken up');
    assert.equal(taskDone(bundle, fake(['errand.rosa-bundle'])), false, 'taken up, still open');
    assert.equal(taskDone(bundle, fake(['errand.rosa-bundle', 'bundle.delivered'])), true);
    // A thread with nothing it ends on (a spill to mop up) is never crossed off.
    const spill = ch1(/floor is very pleased/);
    assert.equal(taskDone(spill, fake(['chicha.spilled', 'challar.done'])), false);
  });

  it('crosses threads off in the order they closed', () => {
    const s = fake(['intro.done', 'met.rosa', 'errand.rosa-bundle', 'bundle.delivered', 'dig.invite', 'dig.done', 'watia.start']);
    const page = taskPage(TASKS, openTasks(TASKS, s, 'village'), s, 'village');
    assert.equal(page.place, 'Ch’aska Pampa');
    assert.equal(page.chapterWord, 'chapter one');
    const starts = ['Somebody south of the well', 'Rosa mentioned a bundle', "Rosa's bundle goes"];
    starts.forEach((s, i) => assert.ok(page.done[i]?.startsWith(s), `done[${i}] should be "${s}...", got "${page.done[i]}"`));
    // Open threads are never also crossed off.
    const open = new Set(openTasks(TASKS, s, 'village').map((t) => firstSentence(t.text)));
    for (const d of page.done) assert.ok(!open.has(d), `"${d}" is both open and done`);
    assert.ok(page.now, 'something is happening now');
  });

  it('shows the pages this place gave as dish and people marks', () => {
    const s = fake(['met.rosa'], ['people.rosa', 'dishes.watia', 'words.wawa']);
    const page = taskPage(TASKS, openTasks(TASKS, s, 'village'), s, 'village');
    assert.deepEqual(page.people.map((p) => p.id), ['people.rosa']);
    assert.deepEqual(page.dishes.map((p) => p.id), ['dishes.watia']);
  });

  it('folds the places behind you, newest first, and names what rides in your bag', () => {
    const arrivals = CHAPTERS.slice(1, 4).map((c) => c.arrival?.flag ?? '');
    const s = fake(['met.rosa', 'story.complete', ...arrivals], [], 'rosa-bundle');
    const map = CHAPTERS[3]!.maps[0]!.id;
    const page = taskPage(TASKS, openTasks(TASKS, s, map), s, map);
    assert.equal(page.chapterWord, 'chapter four');
    assert.equal(page.past.length, 3);
    assert.equal(page.past[2]?.place, 'Ch’aska Pampa', 'the first place is folded last');
    assert.match(page.carrying ?? '', /Rosa's bundle/);
  });

  it('knows the chapter from the ground before the arrival flag lands, and the Return from its flag', () => {
    const shionoura = CHAPTERS[3]!.maps[0]!.id;
    assert.equal(currentChapter(fake(['c3.arrived']), shionoura), 3);
    // The Return walks the village again: its flag outranks the old ground.
    const ret = CHAPTERS.length - 1;
    const back = CHAPTERS[ret]!.arrival!.flag;
    assert.equal(currentChapter(fake([back]), 'village'), ret);
  });

  it('the chip holds its words only while a card or panel is on screen', () => {
    // An armed card set aside, or left behind in an earlier village, used to
    // freeze the chip for chapters (Kerala's errand shown in Delhi).
    assert.equal(chipHolds({ activityOnScreen: false, showing: true }), false);
    assert.equal(chipHolds({ activityOnScreen: true, showing: true }), true);
    assert.equal(chipHolds({ activityOnScreen: true, showing: false }), false, 'an empty chip always fills');
  });

  it('a first sentence stops at the first full stop', () => {
    assert.equal(firstSentence('Go north. Then east.'), 'Go north.');
    assert.equal(firstSentence('No stop at all'), 'No stop at all');
  });
});
