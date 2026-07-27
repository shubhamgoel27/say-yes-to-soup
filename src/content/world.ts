import type { MapData } from '../engine/grid';
import type {
  ChapterDef,
  ErrandDef,
  ExamineArm,
  GameDef,
  JournalEntry,
  LetterDef,
  MapMeta,
  MoodSpec,
  NodeMap,
  NpcDef,
  RecallManifest,
  TaskDef,
} from './schema';

import { CHAPTER as CHASKA_PAMPA, DIG_SPOTS as CH1_DIG_SPOTS } from './dev';
import { CHAPTER as LA_CALETA } from './caleta';
import { CHAPTER as CROSSING } from './crossing';
import { CHAPTER as SHIONOURA } from './shionoura';
import { CHAPTER as BUSAN } from './busan';
import { CHAPTER as KERALA } from './kerala';
import { CHAPTER as DELHI } from './delhi';
import { CHAPTER as ZANZIBAR } from './zanzibar';
import { CHAPTER as SICILY } from './sicily';
import { CHAPTER as OAXACA } from './oaxaca';
import { CHAPTER as RETURN } from './return';
import { LETTERS as BASE_LETTERS } from './letters';

/**
 * The whole world, one chapter folder at a time. Chapters stay self-contained;
 * this is the only file that knows there is more than one of them. Order is
 * play order; several merges run newest-first so a later chapter's arms and
 * tasks can front-run an earlier chapter's fallbacks.
 */
export const CHAPTERS: ChapterDef[] = [
  CHASKA_PAMPA,
  LA_CALETA,
  CROSSING,
  SHIONOURA,
  BUSAN,
  KERALA,
  DELHI,
  ZANZIBAR,
  SICILY,
  OAXACA,
  RETURN,
];

const newestFirst = [...CHAPTERS].reverse();

export const NODES: NodeMap = Object.assign({}, ...CHAPTERS.map((c) => c.nodes));

/** NPCs concatenated, then later chapters may prepend entries to earlier ones. */
export const NPCS: NpcDef[] = (() => {
  const npcs = CHAPTERS.flatMap((c) => c.npcs.map((n) => ({ ...n, entry: [...n.entry] })));
  for (const c of CHAPTERS) {
    for (const ext of c.npcExtensions ?? []) {
      const npc = npcs.find((n) => n.id === ext.npcId);
      if (npc) npc.entry = [...ext.entry, ...npc.entry];
      else console.warn(`npcExtension for unknown npc: ${ext.npcId}`);
    }
  }
  return npcs;
})();

/** Map-tagged arms come first so a chapter's props speak its own words. */
export const EXAMINES: Record<string, ExamineArm[]> = (() => {
  const merged: Record<string, ExamineArm[]> = {};
  for (const c of newestFirst) {
    for (const [kind, arms] of Object.entries(c.examines)) {
      merged[kind] = [...(merged[kind] ?? []), ...arms];
    }
  }
  return merged;
})();

/** Arrivals count as events so the reachability walk can enter chapters. */
export const EVENT_NODES = [
  ...CHAPTERS.flatMap((c) => c.events),
  ...CHAPTERS.flatMap((c) => (c.arrival ? [{ when: c.arrival.when, node: c.arrival.node }] : [])),
];
export const DIG_SPOTS = CH1_DIG_SPOTS;

export const JOURNAL: JournalEntry[] = CHAPTERS.flatMap((c) => c.journal);
export const JOURNAL_BY_ID = new Map(JOURNAL.map((e) => [e.id, e]));

/** Newest chapter's threads first: they are the more specific once you are there. */
export const TASKS: TaskDef[] = newestFirst.flatMap((c) => c.tasks);

export const ERRANDS: ErrandDef[] = CHAPTERS.flatMap((c) => c.errands ?? []);
export const ERRAND_BY_ID = new Map(ERRANDS.map((e) => [e.id, e]));

export const LETTERS: LetterDef[] = [...BASE_LETTERS, ...CHAPTERS.flatMap((c) => c.letters ?? [])];

export const GAMES: GameDef[] = CHAPTERS.flatMap((c) => c.games ?? []);

export const REGION_MAPS: Record<string, MapData> = Object.fromEntries(
  CHAPTERS.flatMap((c) => c.maps.map((m) => [m.id, m])),
);

export const MAP_META: Record<string, MapMeta> = Object.assign({}, ...CHAPTERS.map((c) => c.meta));

export const MOODS: Record<string, MoodSpec> = Object.assign({}, ...CHAPTERS.map((c) => c.moods ?? {}));

export const ARRIVALS = CHAPTERS.flatMap((c) => (c.arrival ? [c.arrival] : []));
export const DRESSINGS = CHAPTERS.flatMap((c) => c.dressings ?? []);
export const COMPLETIONS = CHAPTERS.flatMap((c) => (c.completion ? [c.completion] : []));

/** Sitting: per-map resting thoughts, and which kinds invite you to sit. */
export const SIT_LINES: Record<string, string[]> = Object.assign(
  {},
  ...CHAPTERS.map((c) => c.sitLines ?? {}),
);
export const SIT_KINDS = new Set<string>([
  'bench',
  'baraza',
  ...CHAPTERS.flatMap((c) => c.sitKinds ?? []),
]);

/** Seats a chapter never had to declare: these read as seats anywhere. */
const SIT_EVERYWHERE: ReadonlySet<string> = new Set(['bench', 'baraza']);

/**
 * Sitting is per chapter. A crate is a seat on the Peruvian coast and cargo
 * on a ship, so one chapter offering a kind must not quietly turn it into
 * furniture in every other chapter, stealing its examine.
 */
const SIT_BY_MAP: Record<string, ReadonlySet<string>> = {};
for (const c of CHAPTERS) {
  const kinds: ReadonlySet<string> = new Set(['bench', 'baraza', ...(c.sitKinds ?? [])]);
  for (const mapId of Object.keys(c.meta)) SIT_BY_MAP[mapId] = kinds;
}

/** Which kinds invite you to sit on a given map. */
export function sitKindsOn(mapId: string): ReadonlySet<string> {
  return SIT_BY_MAP[mapId] ?? SIT_EVERYWHERE;
}

/** Chapter manifests in play order; tests hold the ledger honest. */
export const RECALLS: { chapter: string; recall: RecallManifest }[] = CHAPTERS.map((c) => ({
  chapter: c.id,
  recall: c.recall,
}));
