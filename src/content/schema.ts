import type { Look } from '../art/character';

/** Condition over game flags. All listed flags must hold / must not hold. */
export type Cond = { has?: string[]; not?: string[] };

export type Line = {
  /** Speaker name for the chip. Omitted = narrator (italic, no chip). */
  who?: string;
  text: string;
};

/**
 * One beat of conversation. Effects apply when the node is entered, so a page
 * can fill while someone is still talking, which feels like noticing.
 */
export type DialogueNode = {
  lines: Line[];
  effects?: string[];
  /** A choice with a `when` only appears once the player has earned it. */
  choices?: { text: string; goto: string; when?: Cond }[];
  /** Auto-advance to another node after the lines, when there are no choices. */
  next?: string;
};

export type NodeMap = Record<string, DialogueNode>;

export type NpcDef = {
  id: string;
  name: string;
  /** Which map this villager lives on. */
  map: string;
  pos: [number, number];
  /** Wander leash radius in tiles. 0 = stands still. */
  range: number;
  look: Look;
  /** Animals use a bespoke sheet and no portrait; people are drawn from look. */
  sprite?: 'llama' | 'llamaBrown' | 'dog';
  /** First matching entry wins. Last one should be unconditional. */
  entry: { when?: Cond; node: string }[];
};

/**
 * Nodes triggered by gameplay events (minigames, digging) rather than by
 * talking. Listed with their gating so tests can prove them reachable.
 */
export type EventNode = { when?: Cond; node: string };

/** Examine arms for one tile kind; first matching condition wins. */
export type ExamineArm = { when?: Cond; node: string };

export type JournalTab = 'words' | 'dishes' | 'people' | 'customs';

export type JournalEntry = {
  id: string;
  tab: JournalTab;
  title: string;
  /** Short gloss shown under the title. */
  sub?: string;
  /** Nani's faded 1974 entry. Absent = she never reached this page. */
  nani?: string;
  /** The player's entry, written when the page unlocks. */
  you: string;
  /**
   * This page rhymes with an earlier one (yapa with ayni, one sky in two
   * hemispheres). When BOTH pages are unlocked, the journal stitches a thread
   * between them and Nani's margin note becomes legible. Derived from the two
   * pages, so a rhyme can never be missed, only found late.
   */
  rhyme?: { with: string; note: string };
};

export type ErrandDef = { id: string; label: string };

/**
 * A letter from a previous chapter's villager, waiting at a post office or
 * harbor counter. `when` gates which variant you get: letters react to what
 * you actually did, not to the fact that you exist.
 */
export type LetterDef = {
  id: string;
  from: string;
  when?: Cond;
  /** Paragraphs. */
  body: string[];
};

/**
 * Each chapter declares how it participates in cross-chapter recall. Tests
 * hold these honest: consumed keys must be planted earlier or backfilled,
 * chapter-local flags must not leak across borders.
 */
export type RecallManifest = {
  /** Keys from earlier chapters this chapter reacts to (3-5). */
  consumes: string[];
  /** Keys this chapter leaves for later ones (3-5). */
  plants: string[];
  /** For each consumed knowledge key: the local node that teaches it anyway. */
  backfills: Record<string, string>;
  /** [newPageId, oldPageId] pairs stitched in the journal. */
  rhymes: [string, string][];
};
