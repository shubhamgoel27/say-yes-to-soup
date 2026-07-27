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
