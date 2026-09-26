import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CHAPTERS } from '../src/content/world';
import { lintChapter } from './lint-chapter';

/**
 * The chapter lint as a gate. It once drifted stale (a map-tag rule the
 * world had outgrown, a hard-coded list of shared kinds, and cross-chapter
 * Her pages it could not see) and failed five chapters that were fine, so
 * nobody ran it. Running it on every chapter here keeps it honest in both
 * directions: a rule that fires on good content gets fixed, and a real
 * problem in a chapter fails the suite.
 */
describe('chapter lint', () => {
  for (const ch of CHAPTERS) {
    it(`${ch.id} passes`, () => {
      const { problems } = lintChapter(ch);
      assert.deepEqual(problems, [], problems.join('\n'));
    });
  }
});
