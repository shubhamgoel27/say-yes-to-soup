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
  /** Present only while this holds: travelers arrive, homecomings happen. */
  when?: Cond;
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

/**
 * Examine arms for one tile kind; first matching condition wins. An arm with
 * `map` only applies on that map, letting the same prop speak differently in
 * different chapters (the merged record lists map-tagged arms first).
 */
export type ExamineArm = { when?: Cond; node: string; map?: string };

export type JournalTab = 'words' | 'dishes' | 'people' | 'customs';

export type JournalEntry = {
  id: string;
  tab: JournalTab;
  title: string;
  /** The word in its own writing (ハングル, かな, മലയാളം...), shown beside the title. */
  script?: string;
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

/** One open thread in the Tasks tab; first matching entry is the HUD chip. */
export type TaskDef = { when: Cond; text: string };

/** A screen-space light pass tinting a whole map's mood. */
export type MoodSpec = {
  top: string;
  mid: string;
  bottom: string;
  /** Vignette strength 0..1. */
  vig: number;
  /** Optional warm center glow (interiors). */
  glow?: string;
  /** Ambient light-map color for the PixiJS lighting pass. */
  ambient: number;
  /** Skip the drifting cloud shadows (fog ceilings have no sky). */
  noClouds?: boolean;
};

/** Per-map presentation: scene arrangement, mood, optional dusk mood swap,
 * and the musical/voice region (defaults are assigned centrally by map). */
export type MapMeta = {
  scene: 'outdoor' | 'interior' | 'road';
  mood: string;
  /** When dusk falls, outdoors maps may change into their evening light. */
  moodDusk?: string;
  /** Music + babble region key; falls back to a central per-map table. */
  region?: string;
};

/**
 * A hands-on mini-game panel. The chapter provides a factory; the engine owns
 * the overlay root, routes input while open, ticks it, and runs `doneNode`
 * as narration when the panel closes itself via the onDone callback.
 */
export type GamePanel = {
  readonly isOpen: boolean;
  open(onDone: () => void): void;
  onDir(dir: 'up' | 'down' | 'left' | 'right'): void;
  onAction(): void;
  tick?(dt: number): void;
};

export type GameDef = {
  /** One-shot flag that launches the panel when a dialogue ends with it set. */
  flag: string;
  /** Narration node run after the panel closes (its effects clear the flag). */
  doneNode: string;
  make: (root: HTMLElement, audio: unknown) => GamePanel;
};

/**
 * Later chapters may add entries to an EARLIER chapter's villager (the whole
 * village reacts when you come home). Prepended before the NPC's own chain.
 */
export type NpcExtension = { npcId: string; entry: { when?: Cond; node: string }[] };

/**
 * One self-contained chapter. `src/content/world.ts` is the only file that
 * knows there is more than one; everything merges from these.
 */
export type ChapterDef = {
  id: string;
  /** Maps in this chapter, keyed into the world by their own ids. */
  maps: import('../engine/grid').MapData[];
  npcs: NpcDef[];
  npcExtensions?: NpcExtension[];
  nodes: NodeMap;
  examines: Record<string, ExamineArm[]>;
  events: EventNode[];
  journal: JournalEntry[];
  tasks: TaskDef[];
  errands?: ErrandDef[];
  letters?: LetterDef[];
  games?: GameDef[];
  recall: RecallManifest;
  /** Presentation per map id. */
  meta: Record<string, MapMeta>;
  /** Custom moods this chapter introduces, by name used in `meta`. */
  moods?: Record<string, MoodSpec>;
  /**
   * Sitting: per-map thoughts that drift by while the player rests on a bench
   * (or baraza, or church step). Three to six lines per map, rotated.
   */
  sitLines?: Record<string, string[]>;
  /** Extra tile kinds that count as sittable in this chapter's maps. */
  sitKinds?: string[];
  /** Narration fired on first arrival: entering `map` runs `node` once.
   * `when` gates it (the Return reuses old maps and must wait its turn). */
  arrival?: { map: string; node: string; flag: string; when?: Cond };
  /**
   * Festival dressing: the map changes as the story does. While `when` holds,
   * either every object of kind `swap.from` becomes `swap.to`, or the listed
   * cells gain the given object (null clears a cell). Idempotent; reapplied
   * whenever flags change.
   */
  dressings?: {
    map: string;
    when: Cond;
    swap?: { from: string; to: { t: string; solid?: boolean; tall?: boolean } };
    cells?: [number, number, { t: string; solid?: boolean; tall?: boolean } | null][];
  }[];
  /** Chapter-complete beat: when `flag` first appears, show the plate. */
  completion?: { flag: string; plate: string; toasts: string[] };
};
