# Chapter authoring guide (the contract for building one chapter)

You are building ONE self-contained chapter of Elsewhere. You create new
files only. You NEVER edit shared files (engine, main.ts, world.ts, other
chapters, index.html, tests). Integration is two one-line imports done later
by the integrator; you just conform to this contract and say so in your
final report.

## Files you create (chapter id `<id>`, flag prefix `c<N>.`)

- `src/content/<id>/map.ts` - MapData maps (see below)
- `src/content/<id>/npcs.ts` - NPCS, NODES, EXAMINES, EVENTS
- `src/content/<id>/journal.ts` - JOURNAL entries + TASKS
- `src/content/<id>/index.ts` - assembles and exports `CHAPTER: ChapterDef`
- `src/art/sets/<id>.ts` - exports `const ART: ChapterArt` (NO side effects,
  do NOT import `./index`)
- `src/ui/games/<id>.ts` - minigame panel classes (GamePanel interface)

Read these reference files FIRST and imitate them closely; they are the
proven template:
- `src/content/schema.ts` (all types; ChapterDef is the contract)
- `src/content/caleta/{map,npcs,journal,recall,index}.ts` (a complete chapter)
- `src/art/sets/index.ts` (ChapterArt type) and the coastal section of
  `src/art/tiles.ts` (painting idiom: search "the coast")
- `src/ui/coast.ts` (two panel classes, the GamePanel idiom)
- `docs/story-arc.md` (canon: your chapter's beats, rhymes, letters)
- your chapter's research bible in `docs/`

## Maps

- ASCII rows + single-char legend. Exterior ~40-50 x 28-34 plus 1-2 small
  interiors. Paint by rule (see caleta/map.ts) with a paint() loop.
- Buildings follow the casa pattern: 5x5 footprint, anchor char at
  bottom-left (legend t = your building kind, solid+tall), 'x' blocked cells,
  door at [+2,+4] (open = trigger cell, latched = doorShut).
- Boundary solids everywhere except deliberate exits. Spawn and every NPC
  home on walkable ground; the full test suite proves this later.
- Doors within your chapter reference your own map ids. Travel BETWEEN
  chapters uses the `travel:map,x,y,dir` effect from a dialogue node, not a
  door (the previous chapter's exit will be wired by the integrator; state
  the exact travel target coordinates for YOUR chapter's entry point in your
  report).

## Art (`src/art/sets/<id>.ts`)

- Export `const ART: ChapterArt` with `paint(make)` registering every new
  tile kind: seamless flat ground bases (one flat base color + small detail;
  NO per-tile gradients), 64x64 flats, 64x96 grounded talls (softShadow at
  the base), buildings 352x256 painted like `casa` (same wall/door geometry
  so footprints match; declare in `buildings` and give `windows` offsets,
  copy casa's `[[15,-10],[67,-10]]` if your windows sit at the same height).
- Reuse existing kinds wherever possible (bench, stall, farol, signpost,
  rock, tuft, tree, table, stool, pot, shelf, wallInt, floorEarth, sea,
  water, sand...). For a shared kind that needs YOUR chapter's voice, add an
  `aliases` entry (e.g. `toriiSign: 'signpost'`) OR keep the kind and write a
  map-tagged examine.
- Helpers come from `../pix` (Rng, dot, oval, rr, blob, vgrad, glowSpot,
  softShadow, shade, rect) and colors from `../../engine/config` PAL or raw
  hexes. Antialiased painterly vector only; never pixel art.
- Lanterns/fires you add belong in `glows`.

## Content rules (tests WILL enforce these)

- Node ids prefixed (`c4.` or a short word prefix like `shi.`); flags
  prefixed `c<N>.` except keys you plant/consume across chapters, which MUST
  be listed in your recall manifest.
- Every line <= 150 chars, at most two short sentences. NO EM DASHES ever.
- Every NPC entry chain ends with an unconditional fallback; repeatable
  interactions escalate (idle lines are written, not generic).
- Every NEW tile kind gets an examine with a bespoke line (looking is never
  wasted). New-kind examine arms need an untagged unconditional fallback.
  Shared-kind arms must ALL carry `map: '<your map id>'`.
- Journal pages: aim for the count in story-arc.md; four tabs; Nani entries
  obey canon (none after mid-Sicily). Rhymes are authored on YOUR page via
  `rhyme: { with, note }`, the note in Nani's voice, and every rhyme is also
  declared in `recall.rhymes` as `[yourPageId, oldPageId]`.
- Tasks: written like directions from a friend; MUST include a catch-all
  `{ when: { has: ['<arrivalFlag>'], not: ['<completionFlag>'] }, text: ... }`
  and a post-completion task; cover every mid-state your errands create.
- Errand effects set BOTH `errand:<id>` and `set:errand.<id>`, and the
  completing node clears with `errand.done` + `clear:errand.<id>`.
- Letters: `letters` in your ChapterDef; every letter id ends with an
  unconditional fallback variant; at least one variant reacts to a real
  earlier-chapter flag. Serve them from a post-office examine via the
  `letter:<id>` effect (gate arms on `letter.read.<id>` to avoid repeats).
- Arrival: `arrival: { map, node, flag }`; the node's effects MUST
  `set:` that flag. Completion: `completion: { flag, plate, toasts }`.
- Chasca: one NpcDef (unique id like `chascaC4`), one photo scene setting
  `set:photo.flash` + `set:photo.c<N>.<scene>`; declare the photo flag in
  `recall.plants`.
- Minigames: 1-2 panels implementing GamePanel (copy src/ui/coast.ts
  patterns; DOM built with the existing `.w-panel` / `.c-*` / `.n-*` CSS
  classes or inline styles; no new CSS files). Wire via
  `games: [{ flag: 'c<N>.<x>.start', doneNode: '<narration node>', make }]`.
  The doneNode's effects must `clear:` the start flag and `set:` a done flag.
  Reachability: add an EVENTS entry `{ when: { has: [startFlag] }, node: doneNode }`.
- Moods: declare in `moods` (MoodSpec with `ambient`), reference from `meta`.
  Interiors use the built-in `interior`. Every map id gets a `meta` entry.
- NPC `look`: skin/hair/cloth/stripe/hat/hatStyle('chullu'|'montera'|'none'),
  optional skirt, optional kid. Pick believable palette colors for your
  region's dress; hatStyle 'none' is fine (hair shows).

## Recall (the soul of the whole game)

Fill the manifest honestly: `consumes` (3-6 keys from earlier chapters your
dialogue actually reacts to, each used via `when` conds or gated choices),
`plants` (keys later chapters will use, including your photo flag and any
long-fuse items story-arc.md assigns you), `backfills` (for each consumed
knowledge key, a local node that teaches the substance anyway), `rhymes`.
Gated choices use `when` on the choice; always leave an ungated path.

## Verify before you finish

Run, and iterate until clean:
1. `cd /Users/shubhamgoel/work/wayfare && npx tsc --noEmit`
2. `npx tsx tests/lint-chapter.ts src/content/<id>`

Your final report: 6-10 lines: chapter id, map ids + entry spawn (map,x,y,dir
for the travel effect that brings the player IN), files created, page/task
counts, minigames, manifest summary, anything the integrator must know.
