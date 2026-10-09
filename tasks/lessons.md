# Lessons

## 2026-07-21: Spatial reachability is not graph reachability

**Bug:** The sea's first-sight narration was attached to sea tiles, but sea
tiles can never be in facing range (the solid cliff row is always between).
The content-graph test passed because it walks conditions, not geometry.

**Rule:** For examine content, ask "can the player's facing cell ever BE this
tile kind?" Content on unreachable kinds should move to the adjacent kind the
player actually touches (the cliff carries the sea).

## 2026-07-20: Placement tests must check every layer that can collide

**Bug:** Dig spots were placed on valid crop *ground*, but three sat under a
house *roof* in the object layer. The test checked ground only and passed.

**Rule:** When content references map coordinates, the test must assert
against everything that occupies that cell (ground, objects, and a standable
adjacent tile), not just the layer the feature nominally lives on.

## 2026-07-20: A held direction has momentum; drivers must respect the feel

**Finding:** The turn-in-place delay only applies when changing direction; a
tap in the direction of recent travel steps immediately (that IS the good
game feel). Automation that "taps to face" therefore overshoots whenever it
taps along its approach axis, and long holds take extra steps on release.

**Rule:** In drivers: settle fully (sim ~14 frames), then 1-frame taps for
facing, and approach interactables so arrival already faces them. Don't
soften the game to make the robot's life easier.

## 2026-07-20: Checkpoints must already look intentional

**Correction:** Shipped the P1 movement gate on flat colored placeholder squares.
The user's response: "too basic... make it really good, like an actual game
people would enjoy."

**Pattern:** For anything whose core promise is *feel* (games, UI, visual
tools), a checkpoint that is mechanically correct but visually placeholder
reads as low quality, not as prudent sequencing. The user cannot evaluate
"does walking feel nice" while the world looks like a debug view; the art IS
part of the feel.

**Rule:** When a milestone will be judged by playing or looking at it, budget a
visual pass into that milestone. Placeholder art is fine for internal
iteration, never for a checkpoint handed to the user. "Engine first, art in
P5" was the wrong slicing; "art at concept quality from the first playable"
is the right one.

## 2026-07-20: Nested color utilities must be closed under their own output

**Bug:** `shade()` accepted hex but returned `rgb(...)`, so `shade(shade(x))`
parsed garbage and produced black pixels scattered across the plaza tiles.

**Rule:** Any utility that is plausibly composable with itself must return the
same format it accepts. Caught only by looking at rendered output, so: always
screenshot after art changes; the typechecker can't see colors.

## 2026-07-20: ASCII map legends must be single characters, enforced

**Bug:** Returned the string 'dirt' from a tile-painting function that builds
rows by character concatenation. Four characters entered the row, shifting
everything after it and rendering magenta fallback tiles.

**Rule:** Any stringly-typed grid format needs an integrity test: uniform row
width and every character present in the legend. Written (`map integrity` in
tests/content.test.ts); it would have caught this before the screenshot did.

## 2026-07-20: Hidden tabs pause rAF entirely; drive dev builds synchronously

**Finding:** When Chrome's window is minimized, requestAnimationFrame stops
and setInterval throttles to ~1Hz, so the game freezes while automation keeps
"pressing" at it. Also: MutationObserver callbacks are microtasks, so a driver
script must await a microtask after each DOM command or all commands collapse
into one observation.

**Rule:** Games/animations under automation need a synchronous dev channel
(here: `data-wf-cmd="sim:N"` steps the fixed-timestep loop directly). Trust
published state over screenshots for logic; hidden-tab DOM screenshots can be
stale composites. Verify visuals when the DOM has had a real-time beat to
paint.

## 2026-07-20: Chrome extension automation lives in an isolated world

**Finding:** claude-in-chrome's JS runs in an isolated world: shared DOM, but
synthetic KeyboardEvents don't reach page listeners, and page variables are
invisible. Stale bundles compound the confusion after edits (always re-navigate
before re-testing).

**Rule:** Drive dev builds through DOM data attributes (`DevBridge`:
`data-wf-hold`, `data-wf-state`), verify logic in headless tests, and use the
browser only for visual confirmation.

## Full-frame canvas blends belong on the GPU (2026-07-25)
The paper-grain `multiply` pattern fill on the 2D composer canvas forced
Chrome to de-accelerate the whole canvas: 64% of frame time became
texSubImage2D and the game visibly stuttered. Rule: any whole-frame blend
or pattern pass goes on the Pixi stage (native GPU blending); the 2D
canvas stays drawImage/fill only. And every visual pass ships with a
before/after frame-time probe, not just a screenshot.

## Check the news before denying it exists (2026-07-26)
The user said Opus 5 had shipped two days earlier. It was past my training
cutoff, so I told them confidently that no such model existed, twice, and
only searched when they pushed back a second time. It had launched on
2026-07-24. Rule: when a user reports a fact about the world that postdates
my knowledge, the first move is a search, not a correction. A cutoff is a
reason to check, never a reason to contradict someone about their own
present. Cost: two wasted turns and a hit to my credibility on everything
else I asserted that session.

## Tests prove traversal; only playing proves a road (2026-07-26)
The east road out of chapter 1 shipped one tile wide, ending in a one-tile
gap, with an NPC standing on the only through square. Every automated test
passed, because the map was technically connected, and each authoring agent
reviewed its own screenshots and saw nothing wrong. The player hated it
immediately. A read-only QA sweep that actually walked every map then found
the same class of defect in roughly ten more places: a main street severed
in the middle, an invisible wall of paddy painted the same green as the
grass, a two-plank pier with one working plank, and an arrival that walks
you into a person on the first keypress. Rule: for anything spatial, hold
one direction and see where you end up. Reachability is not walkability, and
an author's screenshot is not a playthrough. Budget a play pass per chapter,
separate from the agent that authored it.

## Global registries leak across chapters (2026-07-26)
Four separate bugs in one day shared a single root cause: chapter data merged
into one global bucket with no provenance.
- `GLOW_STYLE` defined 3 lights while chapters registered 25, so every candle,
  griddle and vending machine fell back to one orange blob wider than a street lamp.
- `SIT_KINDS` was a union, so La Caleta declaring a crate sittable turned the
  cargo ship's hatch beams into furniture and stole their examine line.
- `TASKS` merged every chapter's guidance, so the endgame listed 20 stale
  threads including chapter 1's "meet the village", ten villages later.
- `refreshTaskChip()` only ran on errand events, so the chip froze mid chapter.
Rule: when merging per-chapter data into a world-level structure, carry the
owning chapter with each entry and scope lookups by it. Ask of every new
registry: what happens when two chapters disagree about the same key?

## An ending has to be authored, not just reached (2026-07-26)
`story.end` fired the same plate, toasts and confetti as any ordinary chapter
completion, over a task chip still telling the player to do what they had just
done, with credits that were a font licence card still subtitled "a journal,
half full" after the journal was full. A QA critic's verdict: "it stops, it
does not end." Worse, the final scene could be permanently lost, because its
dialogue arm sat below the `story.end` arms while the only task pointing at it
fired after `story.end`, so natural play shadowed it forever while the game
still announced the journal was complete. Rule: the last five minutes need the
same deliberate authoring as the first five, and any content gated on an
endgame flag must be checked in the order a real player will reach it.

## Check what the port is actually serving before believing a measurement (2026-08-12)
Two probes in a row returned nonsense: a pop-in detector that reported zero
pops on both the buggy and the fixed build, and a bake counter that came back
`undefined` after I had just added it. Both had connected to vite servers left
running on 5400 and 5401 by agents from an earlier session, each serving a
frozen `git archive` copy of an older commit. The instrument was fine; it was
pointed at the wrong game. The first probe was reported as inconclusive, which
was right, but I moved on rather than asking why an instrument I had just
written could not see itself. Rule: a measurement that cannot see the change
you just made is a broken rig until proven otherwise, and the first thing to
check is whether the thing answering on that port is your current source.
Frozen-copy verification is still the right technique; it just needs its own
port and a kill afterwards, because a leftover server outlives the session and
silently answers the next one.

## One verification rig at a time (2026-08-12)
The music agent's audition harness and mine ran against the same dev server at
the same time, and each of us killed the other's headless browsers during our
own cleanup, twice, before either noticed the other existed. Every crash looked
like a mysterious "browser closed mid-run" from the inside. The agent also kept
relaunching runs from a background watcher after being presumed dead, so the
count of live harnesses was never what I thought it was. Rule: before starting
a measurement rig, enumerate what is already measuring (ps for harness
processes, ls for fresh output files with recent mtimes), and either adopt the
running rig or stop it cleanly and say so. Never run a duplicate of a rig an
agent was asked to run; delegate or take over, not both. And a cleanup that
kills by process name kills the other rig too; kill by PID you spawned.

## Measure what the eye sees, not what the profiler sees (2026-08-13)
Three rounds of frame-rate profiling said the game was perfect: 120fps, zero
dropped presents, 1.7ms of CPU in an 8.3ms budget. The user kept saying the
player visibly stuttered anyway, and the user was right. The instrument was
answering a different question: frame INTERVALS were even, but the DISTANCE
moved per frame wobbled 8 percent, because rAF timestamps jitter while
presentation does not, and variable-dt integration bakes timestamp noise into
position. One probe that recorded per-frame camera displacement found in
thirty seconds what hours of interval histograms could not. Rule: when a
report says motion looks wrong, measure displacement per presented frame,
not time per frame; smoothness lives in the first derivative the eye tracks,
and a clean frame-time histogram proves nothing about it.

## The dev server hides whole categories of production death (2026-08-13)
A performance sweep tried to compare dev and prod boot times and discovered
npm run build had never worked: first a compile failure (top-level await vs
an es2020 target), then, once building, a silent black-screen hang. The hang
was a top-level-await deadlock: the index chunk freezes mid-evaluation at the
await, a dynamically imported chunk needs bindings from that frozen chunk,
and both wait forever. Dev never showed either failure because Vite serves
real unbundled modules. Rules: run the production build as part of any
release-shaped verification, never only the dev server; treat any top-level
await in an app entry as a loaded gun aimed at the bundler; and when a boot
hangs silently, bisect with boot beacons before theorizing (three console
lines found in minutes what stack reading could not).

## The stutter was five bugs wearing one coat (2026-08-15)
"The game stutters sometimes" resolved into five distinct causes, fixed one
per round: the mid-walk turn gate, the bump lockout, timestamp jitter baked
into motion, the smoother flinching at single strays, the standing-pose flash
on micro-pauses, and the wall-lean hiding real movement at doorframes. Every
one was invisible to frame profiling because the frames were always perfect;
the lie was inside the frames. Two things broke the case: a witness built
into the dev build (not injected, so reloads cannot wipe it) recording the
player's displacement plus the actor's gate state every frame, and the user
as the trigger, saying "now" while the witness held the evidence. When a
report survives a fix, do not argue with it; instrument deeper and let the
next capture name the gate. soup.witness() and soup.perf() stay in the dev
build for the next time.

## Emulated touch passing is not a phone passing (2026-09-17)

The mobile pass shipped with 24/24 emulated play checks, and the first real
device (S26 Ultra) still hit unreliable taps, stutter, and unusable portrait
zoom. Three gaps between emulation and glass:

1. Touch taps fire a synthetic event chain (pointerdown, pointerup, mouseover,
   mousedown, mouseup, click). Any hover-then-click menu that re-renders its
   innerHTML on hover destroys the node between the finger landing and the
   click dispatching; the click then hit-tests rebuilt DOM and sometimes lands
   on the backdrop (reads as "back"). Playwright taps rarely hit the race;
   fingers on animating cards hit it often. Rule: on touch, steer and activate
   together on pointerdown with preventDefault, exactly like the textbox
   already did. Never trust hover idioms under a finger.
2. Frame-time emulation (CPU throttle) does not reproduce phone cadence
   oscillation (120Hz/60Hz flips from thermal and touch-boost). Rule: ship a
   prod-reachable diagnostic (?perf) so the report from real glass comes with
   numbers, not adjectives.
3. "Playable in portrait" was judged from screenshots where a 26% view slice
   looks fine at desk distance. Rule: for a landscape-native game, phones are
   landscape-first; force it kindly rather than shipping a technically-working
   keyhole.

Meta-rule: the first real-device report outranks any emulated ALL GREEN.
Treat it like a witness capture from the motion saga: never argue with it,
instrument and fix.

## A trailer is a made thing, not a capture (2026-09-26)
Two trailer cuts missed. v1 was a tour (villages in order, uniform 2-3s shots,
the game's own camera, the game's own looping music, captions). v2 added a
concept on top, but the owner still saw "procedural": the footage was still
default gameplay framing cut to procedural music. Indie trailers that make
people want to play are scored to a real piece of music with a build, shot
with intent (close-ups, slow pushes, staged moments, time passing), open on a
hook that raises a question, show the verbs with sound, and pay the question
off. Rule: before producing any promotional media, study 3-5 reference works
in the genre, write down what they do, and plan music and shots first; a
capture pipeline is the last step, not the first.

## /tmp is not a workshop (2026-10-06)
The whole trailer pipeline (v3/v4 capture and edit scripts, 13 GB of frames) lived in the session
scratchpad under /private/tmp, and macOS's periodic cleaner deleted it within days. Only the score
survived, because it had been delivered into docs/trailer/. The scripts were rebuilt by replaying
Write/Edit calls and heredocs out of the subagents' transcripts, which worked only because those
transcripts are kept under ~/.claude. Rule: anything that took real work to build (pipelines,
renderers, recovered assets) lives in the repo or a worktree and is committed; /tmp is for things
you would not mind losing tonight.

## Find-and-fix agents stop early; send them back with a concrete list (2026-10-07)
- First rounds came back after 13-16 minutes with 1-3 fixes and "skipped the parts a player sees most" (A warped
  past the east road and Caleta). The second round, with an explicit list (play every errand as a player, talk to
  every NPC, scan spawns vs tall-prop footprints, press N at each step), found 5-10x more.
- Rule: the brief must list the concrete play-throughs, not just the slice. Route cross-owner findings to the
  owner immediately via SendMessage. Merge early (trial merge after round one) to catch conflicts.
- e2e scripts share localStorage per origin: never run them in parallel against one dev server. Before calling an
  e2e failure a regression, run the same script against main.
- A field that changes which dialogue arm fires must not live inside `entry`: the thread guide and the content
  walkers simulate `entry` directly. Live-only overrides go in a separate field (NpcDef.visiting).

## e2e timing and deploy checks (2026-10-08)
- attend-e2e is timing sensitive: under load (several browsers + dev servers at once) every branch "failed" the
  mash runs. Run the e2e suites alone on a quiet machine before bisecting; a failure that appears on every branch,
  including text-only ones, is load, not code.
- When waiting for a deploy, match the run to the pushed commit's SHA (gh run list --json headSha). A wait loop
  on "latest run completed" can catch the previous run before the new one registers. Verify the live bundle with
  a cache-busting query; the CDN holds index.html for 600s.
- In this shell `grep` is a function that silently skips some files; use /usr/bin/grep for audits.

## Late commits after a merge (2026-10-08)
- An agent can keep committing after its report (S added aa4a5f4 after I merged its tip). Before the final gate,
  re-check `git log HEAD..<branch>` for every agent branch, and never merge into a tree while e2e runs on its
  dev server (hot reload changes the game under the test).

## A forgotten driver poisons the e2e gate (2026-10-09)
- After a manual browser check I "stopped" my driver with a pkill pattern that missed it. Its headless game kept
  rendering for an hour, and every e2e suite failed in a new way (navigation mid-test, `soup` undefined, minigames
  that never finish). With it gone, the same suites passed.
- Rule: stop drivers by PID (`lsof -ti :<port>`), and before any e2e gate confirm no other game page is running
  (`lsof -ti :<driver port>` empty, no stray chromium). Gate servers run with `hmr: false, watch: null`, so a
  file save or a server restart cannot reload the page under a test.
