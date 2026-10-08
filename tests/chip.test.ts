import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GameState } from '../src/engine/state';
import { CHAPTERS, MAP_CHAPTER, TASKS } from '../src/content/world';
import { openTasks } from '../src/content/guide';

/**
 * The task chip on new ground. A chapter's arrival flag lands when its
 * arrival narration ends, so for the first seconds on a new quay every
 * thread of the chapter just left was still open, and the chip offered the
 * ship's errands in Shionoura. Standing on a chapter's map retires every
 * earlier chapter's threads at once.
 */
describe('task chip scope', () => {
  const crossing = CHAPTERS.findIndex((c) => c.id === 'crossing');

  it('a crossing thread is open on the ship before Shionoura is reached', () => {
    const s = new GameState();
    s.set('c3.arrived');
    const onShip = openTasks(TASKS, s, 'ship');
    assert.ok(onShip.some((t) => t.chapter === crossing), 'no crossing task open on the ship; the test proves nothing');
  });

  it('stepping onto the next chapter map retires them before its arrival flag', () => {
    const s = new GameState();
    s.set('c3.arrived');
    const ashore = openTasks(TASKS, s, 'shionoura');
    assert.equal(MAP_CHAPTER.shionoura, crossing + 1);
    assert.deepEqual(
      ashore.filter((t) => t.chapter < MAP_CHAPTER.shionoura!).map((t) => t.text),
      [],
    );
  });

  it('walking back onto older ground never hides a newer chapter thread', () => {
    const s = new GameState();
    s.set('c2.arrived');
    const later = openTasks(TASKS, s, 'la-caleta').filter((t) => t.chapter >= 1);
    const back = openTasks(TASKS, s, 'village').filter((t) => t.chapter >= 1);
    assert.deepEqual(back, later);
  });
});
