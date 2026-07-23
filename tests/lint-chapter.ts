/**
 * Chapter lint: fast, self-contained validation of ONE chapter folder before
 * integration. Usage: npx tsx tests/lint-chapter.ts src/content/<id>
 *
 * The full test suite proves cross-chapter properties after integration; this
 * proves everything provable from inside the chapter, so authors can iterate
 * without touching shared files.
 */
import path from 'node:path';
import process from 'node:process';
import type { ChapterDef, Cond } from '../src/content/schema';

/** Tile kinds that exist in the shared tileset (chapters may reuse freely). */
const SHARED_KINDS = new Set([
  'puna', 'grass', 'dirt', 'floorEarth', 'path', 'plaza', 'crop', 'water', 'sea', 'bridge',
  'scree', 'cliff', 'flower', 'tuft', 'rock', 'shrub', 'rug', 'mat', 'cuy', 'bench',
  'woodpile', 'planter', 'qoncha', 'campfire', 'table', 'stool', 'pot', 'gateOpen',
  'wallStone', 'tree', 'house', 'well', 'chichaflag', 'doorShut', 'gate', 'cactus',
  'apacheta', 'tent', 'signpost', 'farol', 'stall', 'chomba', 'loom', 'shelf', 'bed',
  'wallInt', 'adobe', 'thatch', 'thatchRidge', 'void', 'blocked', 'sand', 'sandWet',
  'pierdeck', 'net', 'crate', 'pelican', 'reeds', 'caballito', 'boat', 'emoliente',
  'casa', 'harborsign', 'piersign',
]);

const folder = process.argv[2];
if (!folder) {
  console.error('usage: npx tsx tests/lint-chapter.ts src/content/<id>');
  process.exit(2);
}

const problems: string[] = [];
const warnings: string[] = [];
const bad = (msg: string) => problems.push(msg);
const warn = (msg: string) => warnings.push(msg);

const mod = await import(path.resolve(folder, 'index.ts'));
const ch: ChapterDef = mod.CHAPTER;
if (!ch) {
  console.error(`${folder}/index.ts does not export CHAPTER`);
  process.exit(2);
}

const num = /^c(\d+)$/.exec(ch.id.replace(/[^0-9]/g, (m) => m))?.[1];
void num;
const ownPrefix = /c\d+\./.exec(JSON.stringify(ch.recall.plants) + JSON.stringify(Object.keys(ch.nodes)))?.[0];
void ownPrefix;

const nodeIds = new Set(Object.keys(ch.nodes));
const pageIds = new Set(ch.journal.map((j) => j.id));
const errandIds = new Set((ch.errands ?? []).map((e) => e.id));
const letterIds = new Set((ch.letters ?? []).map((l) => l.id));
const mapIds = new Set(ch.maps.map((m) => m.id));
const consumes = new Set(ch.recall.consumes);

// ---------------- dialogue graph ----------------
for (const [id, node] of Object.entries(ch.nodes)) {
  if (node.next && !nodeIds.has(node.next)) bad(`${id}: next -> missing node ${node.next}`);
  for (const c of node.choices ?? []) {
    if (!nodeIds.has(c.goto)) bad(`${id}: choice -> missing node ${c.goto}`);
  }
  if (node.choices?.length && !node.choices.some((c) => !c.when) && !node.next) {
    bad(`${id}: every choice gated and no next`);
  }
  for (const line of node.lines) {
    if (line.text.length > 150) bad(`${id}: line too long (${line.text.length})`);
    if (line.text.includes('—')) bad(`${id}: em dash in line`);
  }
  for (const eff of node.effects ?? []) {
    if (eff.startsWith('journal:') && !pageIds.has(eff.slice(8))) bad(`${id}: unknown page ${eff}`);
    if (eff.startsWith('errand:') && !errandIds.has(eff.slice(7))) bad(`${id}: unknown errand ${eff}`);
    if (eff.startsWith('letter:') && !letterIds.has(eff.slice(7)) && !eff.slice(7).startsWith('home.'))
      bad(`${id}: unknown letter ${eff}`);
  }
}

// ---------------- npcs ----------------
for (const npc of ch.npcs) {
  if (!mapIds.has(npc.map)) warn(`npc ${npc.id}: lives on external map ${npc.map} (integrator verifies)`);
  for (const e of npc.entry) if (!nodeIds.has(e.node)) bad(`npc ${npc.id}: missing entry node ${e.node}`);
  const last = npc.entry.at(-1);
  if (!last || last.when) bad(`npc ${npc.id}: no unconditional fallback entry`);
  const look = npc.look as Record<string, unknown>;
  for (const f of ['skin', 'hair', 'cloth', 'stripe', 'hat', 'hatStyle']) {
    if (npc.sprite == null && look[f] == null) bad(`npc ${npc.id}: look.${f} missing`);
  }
}
for (const ext of ch.npcExtensions ?? []) {
  for (const e of ext.entry) if (!nodeIds.has(e.node)) bad(`npcExtension ${ext.npcId}: missing node ${e.node}`);
}

// ---------------- examines ----------------
for (const [kind, arms] of Object.entries(ch.examines)) {
  for (const a of arms) if (!nodeIds.has(a.node)) bad(`examine ${kind}: missing node ${a.node}`);
  const shared = SHARED_KINDS.has(kind);
  if (shared) {
    for (const a of arms) if (!a.map) bad(`examine ${kind}: shared kind arm must be map-tagged`);
  } else {
    const last = arms.at(-1);
    if (!last || last.when || last.map) bad(`examine ${kind}: new kind needs untagged unconditional fallback`);
  }
}

// ---------------- events / games ----------------
for (const ev of ch.events) if (!nodeIds.has(ev.node)) bad(`event: missing node ${ev.node}`);
for (const g of ch.games ?? []) {
  if (!nodeIds.has(g.doneNode)) bad(`game ${g.flag}: missing doneNode ${g.doneNode}`);
  if (!ch.events.some((e) => e.node === g.doneNode)) bad(`game ${g.flag}: doneNode not listed in events for reachability`);
}

// ---------------- journal / rhymes ----------------
const declaredRhymes = new Set(ch.recall.rhymes.map(([a, b]) => `${a}->${b}`));
for (const j of ch.journal) {
  if (!['words', 'dishes', 'people', 'customs'].includes(j.tab)) bad(`page ${j.id}: bad tab ${j.tab}`);
  if (j.rhyme) {
    if (!declaredRhymes.has(`${j.id}->${j.rhyme.with}`)) bad(`page ${j.id}: rhyme not declared in recall.rhymes`);
    if (!j.rhyme.note) bad(`page ${j.id}: rhyme without Nani's note`);
  }
  for (const text of [j.you, j.nani ?? '', j.sub ?? '', j.rhyme?.note ?? '']) {
    if (text.includes('—')) bad(`page ${j.id}: em dash`);
  }
}
for (const [a] of ch.recall.rhymes) {
  const page = ch.journal.find((j) => j.id === a);
  if (!page?.rhyme) bad(`recall rhyme ${a}: page missing or missing rhyme field`);
}

// every page is granted by some effect
const granted = new Set<string>();
for (const node of Object.values(ch.nodes)) {
  for (const eff of node.effects ?? []) if (eff.startsWith('journal:')) granted.add(eff.slice(8));
}
for (const j of ch.journal) if (!granted.has(j.id)) bad(`page ${j.id}: no node ever grants it`);

// ---------------- flags discipline ----------------
const condFlags = (c?: Cond) => [...(c?.has ?? []), ...(c?.not ?? [])];
const referenced = new Set<string>();
for (const npc of ch.npcs) for (const e of npc.entry) condFlags(e.when).forEach((f) => referenced.add(f));
for (const ext of ch.npcExtensions ?? []) for (const e of ext.entry) condFlags(e.when).forEach((f) => referenced.add(f));
for (const arms of Object.values(ch.examines)) for (const a of arms) condFlags(a.when).forEach((f) => referenced.add(f));
for (const t of ch.tasks) condFlags(t.when).forEach((f) => referenced.add(f));
for (const ev of ch.events) condFlags(ev.when).forEach((f) => referenced.add(f));
for (const node of Object.values(ch.nodes))
  for (const c of node.choices ?? []) condFlags(c.when).forEach((f) => referenced.add(f));
for (const l of ch.letters ?? []) condFlags(l.when).forEach((f) => referenced.add(f));

const myNum = /^c(\d+)\./.exec([...(ch.recall.plants ?? []), ...Object.keys(ch.nodes)].join(' '))?.[1];
for (const f of referenced) {
  const m = /^c(\d+)\./.exec(f);
  if (m && myNum && m[1] !== myNum && !consumes.has(f)) {
    bad(`flag "${f}" belongs to another chapter and is not in recall.consumes`);
  }
  if (f.startsWith('page.') && !pageIds.has(f.slice(5)) && !consumes.has(f)) {
    warn(`flag "${f}" references a foreign page; ensure it is planted earlier or add to consumes`);
  }
}

// ---------------- letters ----------------
for (const id of letterIds) {
  const variants = (ch.letters ?? []).filter((l) => l.id === id);
  const last = variants.at(-1);
  if (!last || last.when) bad(`letter ${id}: no unconditional fallback variant`);
  for (const v of variants) for (const p of v.body) if (p.includes('—')) bad(`letter ${id}: em dash`);
}

// ---------------- arrival / completion / tasks ----------------
if (ch.arrival) {
  if (!nodeIds.has(ch.arrival.node)) bad(`arrival node ${ch.arrival.node} missing`);
  const sets = ch.nodes[ch.arrival.node]?.effects?.includes(`set:${ch.arrival.flag}`);
  if (!sets) bad(`arrival node must set:${ch.arrival.flag}`);
  const catchAll = ch.tasks.some(
    (t) =>
      (t.when.has ?? []).length === 1 &&
      t.when.has?.[0] === ch.arrival?.flag &&
      (ch.completion ? (t.when.not ?? []).includes(ch.completion.flag) : true),
  );
  if (!catchAll) bad(`tasks: need a catch-all {has:[${ch.arrival.flag}], not:[completion]} entry`);
}
if (ch.completion) {
  const done = ch.tasks.some((t) => (t.when.has ?? []).includes(ch.completion?.flag ?? ''));
  if (!done) bad('tasks: need a post-completion task');
}

// ---------------- maps ----------------
for (const m of ch.maps) {
  const w = m.ground[0]?.length ?? 0;
  m.ground.forEach((row, y) => {
    if (row.length !== w) bad(`${m.id}: ground row ${y} width`);
  });
  (m.objects ?? []).forEach((row, y) => {
    if (row.length !== w) bad(`${m.id}: object row ${y} width`);
  });
  for (const row of m.ground) for (const chr of row) if (!m.legend[chr]) bad(`${m.id}: ground char "${chr}" not in legend`);
  for (const row of m.objects ?? [])
    for (const chr of row) if (chr !== ' ' && !m.legend[chr]) bad(`${m.id}: object char "${chr}" not in legend`);
  const solidAt = (x: number, y: number) => {
    const g = m.legend[m.ground[y]?.[x] ?? ' '];
    const oCh = m.objects?.[y]?.[x] ?? ' ';
    const o = oCh === ' ' ? undefined : m.legend[oCh];
    return g?.solid === true || o?.solid === true;
  };
  if (solidAt(m.spawn[0], m.spawn[1])) bad(`${m.id}: spawn is solid`);
  for (const trig of m.triggers ?? []) {
    if (trig.type !== 'door') continue;
    if (solidAt(trig.at[0], trig.at[1])) bad(`${m.id}: door cell ${trig.at} is solid`);
    if (!mapIds.has(trig.to)) warn(`${m.id}: door to external map ${trig.to} (integrator must verify)`);
  }
  // Every non-shared kind used must be painted by this chapter's ART or aliased.
}
for (const npc of ch.npcs) {
  const m = ch.maps.find((mm) => mm.id === npc.map);
  if (!m) continue;
  const g = m.legend[m.ground[npc.pos[1]]?.[npc.pos[0]] ?? ' '];
  const oCh = m.objects?.[npc.pos[1]]?.[npc.pos[0]] ?? ' ';
  const o = oCh === ' ' ? undefined : m.legend[oCh];
  if (g?.solid === true || o?.solid === true) bad(`npc ${npc.id}: home ${npc.pos} is solid`);
}

// ---------------- meta ----------------
for (const m of ch.maps) if (!ch.meta[m.id]) bad(`meta missing for map ${m.id}`);
for (const [id, meta] of Object.entries(ch.meta)) {
  if (!mapIds.has(id)) warn(`meta for unknown map ${id}`);
  const builtin = ['warm', 'cool', 'dusty', 'interior', 'garua', 'glare'];
  if (!builtin.includes(meta.mood) && !(ch.moods ?? {})[meta.mood]) bad(`meta ${id}: mood ${meta.mood} not declared`);
}

// ---------------- report ----------------
for (const w of warnings) console.log(`WARN  ${w}`);
if (problems.length) {
  for (const p of problems) console.log(`FAIL  ${p}`);
  console.log(`\n${problems.length} problem(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`OK: chapter "${ch.id}" passes lint (${warnings.length} warning(s)).`);
