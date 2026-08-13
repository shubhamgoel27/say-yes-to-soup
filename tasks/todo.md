# Wayfare — build log

A cozy top-down RPG where the content is ordinary life in villages around the world.
Full design lives in `~/.claude/plans/transient-wiggling-planet.md`.

## P0 — Scaffold ✅

- [x] Vite + TypeScript, zero runtime dependencies
- [x] Canvas at 240x160 logical, integer-scaled, pixel-perfect
- [x] Fixed-timestep loop (60Hz sim, decoupled render) so feel is framerate-independent
- [x] Locked altiplano palette in `src/engine/config.ts`

## P1 — Movement feel ✅

- [x] Grid walking, 140ms per tile, no pause between tiles
- [x] Turn-in-place on a tap, walk on a hold (60ms hold threshold)
- [x] Collision + a short recoil on bumping into something solid
- [x] Camera follows, clamps to map edges, snaps to whole pixels
- [x] Depth sorting: you walk behind walls, roofs and trees
- [x] 18 headless tests over movement, collision and camera

## P1.5 — Visual layer ✅ (added after "too basic" feedback)

- [x] Real 16x16 pixel-art tileset, generated into sprite canvases at boot
      (`src/art/tiles.ts`): puna, grass, worn paths, flagstone plaza, potato
      terraces, animated water, bridge, adobe brick with shuttered windows,
      coursed thatch, queñua trees, the well, wildflowers, ichu tufts, rocks
- [x] Autotiling: water grows sandy banks against land; paths melt into grass
      at their edges (doorway cells read as framed doors for free)
- [x] Character rig (`src/art/character.ts`): 16x24, 4 directions, 3-frame
      walk, parameterized Looks: chullu/montera hats, poncho or pollera+lliclla,
      braids, blush
- [x] Four wandering villager NPCs with home leashes, so the place is inhabited
- [x] Ambient life: cookfire smoke off each roof, drifting dust motes, swaying
      ichu, rippling water
- [x] Atmosphere pass: warm sunlight gradient + soft vignette
- [x] Village nameplate that fades in on arrival
- [x] Tile variants everywhere via per-cell hashing, so nothing looks stamped
- [ ] **Gate: walk around, judge feel AND look together.**

### Tuning knobs (`src/engine/config.ts`)

| Value | Now | Means |
|---|---|---|
| `STEP_DUR` | 140ms | time to cross one tile. Lower = snappier |
| `TURN_DELAY` | 60ms | how long a direction must be held before you commit to a step |
| `BUMP_DUR` | 180ms | recoil after walking into a wall |

### Dev affordances

- `npm run dev`, then `http://localhost:5173`
- Arrows or WASD to walk. `F3` toggles a debug readout.
- `?at=21,16&dir=up` drops you anywhere on the map without walking there.
- `npm test` runs the headless engine tests. `npm run check` typechecks.

## P2 — Interaction and dialogue ✅

- [x] Facing-tile interaction: villagers, plus examine-anything by tile kind
      (well, chicha flag, crops, water, bridge, trees, walls, flowers...)
- [x] Textbox: loop-driven typewriter, generated portraits, name chips,
      narrator styling, choice cursor, woven textile trim
- [x] NPCs settle onto their tile and turn to face you when spoken to
- [ ] Doors and interior maps (next)

## P3 — State, journal, and the engagement loop ✅

- [x] `GameState`: flags, conditions, the `effects` pipeline
      (`set:` / `journal:` / `errand:` / `errand.done`)
- [x] Four-tab journal UI, Nani's faded 1974 hand above yours, honest blank
      space where she stopped, "N pages still blank" per tab
- [x] Non-blocking toast whispers; errand chip in the corner
- [x] Autosave to localStorage on every change; `?fresh=1` resets
- [x] **The ayni loop (the RPG mechanism):** favors, not fetch-quests.
      Rosa feeds you → coins are gently refused (custom page fills) → you
      carry her bundle uphill → Justina keeps you talking (three more pages)
      → Rosa calls it even and the relationship deepens. Open loops + the
      17-page journal are the pull; no XP, no numbers, no fail state.
- [x] Content: 5 named villagers with disagreements, 17 journal pages,
      12 examine texts, all sourced from `docs/andes-content-bible.md`
- [x] 28 tests: engine, content-graph integrity (every page provably
      reachable by play, ayni loop opens and closes), map integrity
- [x] Dev sim channel (`data-wf-cmd`) for deterministic scripted playthroughs

## P4 — The complete chapter ✅

- [x] **Title screen**: WAYFARE card with woven divider, New/Continue menu,
      controls legend. Village idles dimly behind it as an attract screen.
- [x] **Nani's letter** as the framing intro (paper overlay, sets the tone and
      the instructions: "say yes to soup, thank corrections twice")
- [x] Tutorial through play: control toasts on first steps, journal hint on
      first page fill
- [x] **Doors and interiors** with fade transitions and per-room nameplates:
      La Chichería (chomba, lit q'oncha, rugs, guinea pigs, Don Teófilo) and
      Casa de Doña Carmen (backstrap loom, striped bed, chuño pot)
- [x] Locked doors on the other houses with lives audible behind them
- [x] **The full story arc**:
      Act 1 arrive and meet everyone →
      Act 2 the favor web (Rosa's bundle → the challar first-splash scene with
      Teófilo → Carmen's wichuna chain through Justina) →
      Act 3 Aurelio reveals he knew Nani in 1974, hands over her unsent
      letter → the east-gate finale, her page fills last, CHAPTER ONE COMPLETE
- [x] 6 villagers, 23 journal pages, 3 errands, 24 examine kinds, 2 interiors
- [x] Save-slot aware title (Continue appears only with a save); `?fresh=1`
      and `?skiptitle=1` for dev
- [x] 29 tests, all green; the reachability test now proves the entire story
      chain resolves to 23/23 pages

*(Research pass: `docs/andes-content-bible.md`, sourced, feeds all writing.)*

## P5 — Sound and play verbs ✅

- [x] **Procedural WebAudio, zero assets** (`src/engine/audio.ts`):
      terrain-aware footsteps (grass, path, stone, bridge planks, interior
      earth), breathing altiplano wind that softens indoors, typewriter blips,
      page-fill chime, menu ticks, door whoosh, dig thump, bark, llama hum,
      and a sparse pentatonic plucked phrase that visits every ~40-75s
      instead of looping. M mutes. No pan-flute anywhere, per the bible.
- [x] **The dog.** Greet it (Nani said to greet everyone, even the dogs) and
      it follows you for the rest of the game, through every door. Never
      blocks a path; occasionally interrupts QA.
- [x] **Potato dig** (play verb #1): after the watia scene, five glinting
      mounds appear in the terraces; each yields a real named variety
      (puma maki, yana wayru, wira pasña, puka ñawi pasña, llumchuy waqachi);
      finishing triggers Justina's payoff and a page.
- [x] **Weaving mini-game** (play verb #2, in the main story path): Carmen
      calls color sequences, you answer with the arrows; every color is a
      pentatonic note so each woven row is a small tune. Forgiving: a miss
      just replays the row. Completing it IS how pallay.done happens now.
- [x] **The East Road** (the world expands): once the gate opens it leads to
      a real map: wandering llamas, the apacheta cairn (add your stone, fill
      a page), Faustino the arriero's camp (tent, burning fire), and Paca,
      a llama occupying the pass Snorlax-style until Faustino whistles.
      The signboard at the far end is Chapter Two's doorstep.
- [x] 4 new journal pages (27 total), 4 new tile kinds, 3 animal sprite rigs
- [x] 30 tests green; dig spots now verified against the object layer too
      (a roof over a dig spot is the bug the old test missed)

## P6 — Fun density (research-driven) ✅

*Backed by a sourced design-research pass: `docs/rpg-design-patterns.md`.*

- [x] **Emote bubbles** (! on talk, ♥ on pets) and **dust puffs** on every step
- [x] **Pet the dog**: a befriended dog is petted, not talked to; five
      escalating responses (Lesser Dog pattern), heart emote, pet sound,
      and at 13 pets: "13/10. would pet again"
- [x] **Chicha carry** (walking puzzle): full caporal from Rosa to Teófilo,
      three bumps and the floor drinks it; Rosa's laugh is the fail state;
      success teaches tomakusunchis. (QA robots spilled it three times.)
- [x] **Carmen's pattern quiz**: three textile riddles from a person, not a
      system; wrong answers are the funnier scenes; llama option included;
      reward is a woven wristband "so the next village knows somebody
      already started on you"
- [x] **K'intu with Faustino**: the three-leaf coca farewell, both hands,
      blown toward the mountains; fills the customs page
- [x] **La Bajada** (new map): switchback descent, cacti and shrubs, and at
      the bottom the FIRST SIGHT OF THE SEA, Chapter Two's doorstep
- [x] **Chasca the photographer** (Earthbound homage): "¡digan papas!",
      real white camera-flash, "the picture will be beautiful. Wherever
      pictures go." (album payoff reserved for Chapter Two credits)
- [x] **Konami code** on the title screen → jingle + the golden poncho,
      persisted in the save
- [x] Easter eggs, all situational per the earned-reference rule: nothing
      under the bridge (and Mateo seeds the rumor), the resisted pot-smash,
      the soul-free campfire, Paca's theme song about being right, the
      round thing in the dig row that decides against society
- [x] **Look-is-never-wasted rule**: even bare puna, paths, plaza stones,
      and grass answer the examine button
- [x] Post-completion epilogue lines for five villagers
- [x] New sounds: pet, bump, slosh, shutter, secret-jingle; camera flash FX
- [x] 3 new pages (tomakusunchis, k'intu, Chasca) = 30 total; 30 tests green
- [x] Dev: `?map=` spawn override, `freeze` command for drivers

## P7 — Graphics revamp + the gate becomes a door ✅

- [x] **Sprite outlines**: 1px dark outline on every character and animal,
      applied per-cell at boot (`outlineSheet` in `src/art/pix.ts`). The
      single biggest readability win.
- [x] **Large-scale ground mottling**: two octaves of blocky noise warm and
      cool whole patches of puna/grass/dirt/crop/path; fields no longer read
      as one flat swatch
- [x] **Cast shadows everywhere**: wall-like objects shade the ground row
      below them; freestanding talls (well, cactus, chomba, stalls...) and
      small solids sit on soft ellipse shadows
- [x] **Per-map color grading** (`Renderer.setMood`): village = golden
      afternoon; east road = thin blue pass light; La Bajada = dusty
      west-facing glare; interiors = firelight center, sooty corners
- [x] **Roofline upgrade**: ridge-cap course on every roof, with toritos de
      Pucará (the ceramic guard bulls, from the research bible) on some
      tiles + an examine for them
- [x] **Market stalls** on the plaza: striped awnings, produce left out,
      "asleep between Sundays"
- [x] **Wind gusts** now travel across the map (tufts and flowers sway on
      one moving wave, not independently)
- [x] **The east gate opens for real**: after CHAPTER ONE · COMPLETE the
      leaves fold back (runtime tile override + dynamic door trigger), the
      cells become walkable, and stepping through warps to the East Road.
      No dialogue choice; a door, not a menu.
- [x] TileMap runtime `setObject`/`addTrigger`; 30 tests green

## P8 — The engine leap (triple research pass) ✅

Research docs: `docs/engine-decision.md`, `docs/art-direction-spec.md`,
`docs/caleta-content-bible.md` (Chapter Two, ready to build).

- [x] **PixiJS v8 adopted** as the GPU presentation layer (`src/render/stage.ts`),
      hybrid architecture: the whole Canvas2D world composer is untouched and
      uploads each frame as a texture; Pixi adds what canvas can't:
      - screen-space **light map** (opaque ambient + additive radial lights,
        multiplied over the world) + an additive glow echo
      - **AdvancedBloom** on emissives (fires genuinely glow)
      - **sharp-bilinear zoom chain** (nearest into a 3x prescale RT, linear
        present): fractional zoom with zero pixel shimmer
      - driven entirely by our own fixed-timestep loop (autoStart:false),
        so the dev sim channel still works in hidden tabs
- [x] Every fire is a flickering point light, found by map scan; interiors run
      dark ambient so the q'oncha carries the room; camp fire lights the
      travelers on the cool pass
- [x] **320x180 rebase** (16:9, 6x/8x/12x integer scales): the GBA letterbox
      read is gone
- [x] **Painterly shade()**: every generator now hue-shifts shadows cool
      (+ saturation) and highlights warm: the whole art regenerated art-directed
- [x] **Hero rig 2.0**: 16x28 (~2 tiles), six-frame walk (contact/down/pass
      alternating), idle breathing (head settles on the exhale), blinking;
      all villagers inherit it; animals re-anchored
- [x] Soft dialogue zoom (1.06 ease) whenever a panel is open
- [x] 31 tests green

## P9 — Graphics revamp round two: density, furniture, fullscreen ✅

- [x] **Fullscreen cover presentation**: the game fills the window edge to
      edge (fractional scale through the sharp-bilinear chain, no shimmer);
      the boxed-demo letterbox is gone. Dialogue box became a centered panel.
- [x] **Ground materials rewritten for density**: rooted grass clumps with
      shadows, two-tone base patches, embedded two-shade pebbles, wear-ruts
      in paths, irregular fitted plaza flagstones with bevels, cracks and
      grass in the joints, mounded crop furrows with real plant bodies
- [x] **Water v2**: four frames, layered drifting ripples, counter-ripples,
      single-frame sparkles, pooled depth
- [x] **Architecture v2**: plastered adobe with exposed-brick patches,
      eave-shade bands, deep-set shuttered windows with lintels, rain-splash
      staining; straw-stroke thatch courses; **roof-heavy 5-row houses**
      (ridge + two thatch courses over two wall rows): the cozy silhouette
- [x] **Trees v2**: 32x36 layered canopies (dark mass, mid clumps, sunlit
      crowns, sky holes, berries) on barked trunks with root flare; renderer
      now supports arbitrary-size tall sprites, centered
- [x] **Street furniture**: benches (with a folded manta), woodpiles,
      geranium planters, and **lamp posts that are real flickering lights**,
      each with bespoke examine text
- [x] **Sky life**: cloud shade drifting across the land with faint
      parallax; tumbling leaves that flip as they flutter
- [x] **Rig polish**: swinging arms (hands peek from the poncho, trading
      places with the stride), profile arm crosses the body
- [x] Dry-stone ridge walls with fitted boulders, moss, lichen
- [x] Door/exit repositioning for the new house anatomy, caught and verified
      by the placement tests (Rosa was body-blocking her own chichería)
- [x] 31 tests green

## P10 — Complete revamp round three: the flatness killer ✅

The diagnosis that unlocked it: GBA-era games assemble buildings from
top-down wall tiles; modern cozy RPGs draw buildings as whole illustrated
objects with 3/4 volume. So:

- [x] **Illustrated mega-sprite houses (88x64, 4 variants)**: tall plastered
      front walls with weathering, cracks and exposed-brick patches; deep-set
      windows with glass glints, mullions, lintels, sunlit sills and geranium
      flower boxes; recessed doors with thresholds and hanging chili ristras;
      base courses of river stones with splash staining; eave shadow bands;
      deep sloping thatch roofs that narrow toward the ridge, with combed
      courses, ragged eave straw, side-slope shading, chimneys, and toritos
      with their cross. The tile grid now only collides ('blocked' cells);
      the drawing is one loving composition per house.
- [x] Renderer support: invisible collision cells, edge-anchored mega
      sprites, arbitrary sprite sizes
- [x] **Character rig v4 (20x32)**: rounded heads with corner-cut curves,
      two-tone hair with shine lines, 2x2 eyes with catchlights, brows,
      blush, smiles; three-tone clothing with lit/shaded fold edges, V
      collars, golón hem bands on polleras, tupu pins; swinging arms with
      hands; nose pixels in profile; all under the existing 6-frame walk,
      breathe, and blink systems
- [x] Animals re-centered in the larger cell; every placement change
      validated by the test suite (31 green)

## P11 — Music, WebGPU, and the turning of the day ✅

- [x] **Generative background music** (`AudioBus` band): a quiet ensemble
      scheduled half a second ahead on the audio clock: bass roots breathing
      with an Am-F-C-G progression, charango-like broken-chord shimmer,
      a felt-more-than-heard bombo outdoors, and a soft sine melody that
      visits at the turn of some bars. Arrangement thins by scene (interiors
      lose the drum; the road keeps only bass and sky). All synthesized,
      zero files, ducks under M-mute with everything else.
- [x] **WebGPU**: Pixi now prefers Chrome's newest graphics API with
      automatic WebGL fallback: console confirms `renderer: webgpu`.
- [x] **Day/night cycle**: a five-minute world day on a keyframed ambient
      curve (dawn gold, noon clear, dusk ember, night blue) multiplied into
      the light map; night clamped for readability; `?tod=` dev pin.
- [x] **Windows wake at dusk**: every illustrated house gains two warm
      window lights after dark (auto-derived from house anchors): the cozy
      postcard shot, verified.
- [x] **Fireflies** after dark: pulsing wanderers whose bright cores the
      bloom pass catches; clouds stand down at night.
- [x] 31 tests green; WebGPU + night + windows verified by screenshot.

## P12 — THE PIVOT: smooth modern 2D (pixel art retired) ✅

The user verdict was right: no amount of craft inside 16px pixel art escapes
the retro read. Full art-direction pivot, everything else preserved:

- [x] **High-resolution smooth art**: every texture re-authored at 4x
      (64px tiles, 80x128 character cells) with antialiased vector shapes:
      gradients, organic blobs, rounded forms, no outlines, no visible
      pixels anywhere. Game logic still runs on 16px tiles; only drawing
      knows about `ART` scale.
- [x] **Complete tileset rewrite** (`src/art/tiles.ts`): seamless flat
      ground bases with renderer-painted large-scale tonal patches
      (world-anchored, no tile seams), sprig-brush grasslands, fitted
      plaza slabs, mounded crops with blob plants, soft ripple water with
      lapping bank waterlines, blob-canopy trees, and the illustrated
      house re-rendered smooth: gradient plaster, glass windows,
      flower boxes, chili ristras, painterly straw roof
- [x] **Chibi rig v5**: round glossy-eyed heads with radial-lit skin,
      blush, smiles, brows; capsule limbs with rotating arm swings;
      bell-skirt polleras with golón bands; knit-cap chullus with tassels
      and earflap ties; braids; all on the 6-frame walk/breathe/blink
      systems. Smooth painted portraits (160px) to match.
- [x] **Smooth animals**: round dog with tongue frames, wooly llamas with
      banana ears and halters
- [x] **Living flames**: layered teardrop fires with glow pools replacing
      pixel flicker; soft round smoke puffs; radial firefly glows; soft
      cloud shade; leaf ellipses that tumble
- [x] Stage: antialias on, native-resolution compositing, light map scaled
      over the hi-res world, WebGPU still confirmed
- [x] Iterated via screenshots: killed tile-seam checkerboarding (flat
      bases + world-anchored tint pass), plaza patchwork, sprig clipping,
      per-corner path rounding
- [x] 31 tests green throughout (game logic untouched)

## P13 — Never stuck: the Tasks tab ✅ (born from a real playtest)

The user got the chicha caporal and had no idea where it went; side-quests
lived in flags with no tracker, and La Bajada never said "this is the end of
the built world."

- [x] **Tasks tab**, first tab in the journal: every open thread derived
      from flags, in priority order, written as directions from a friend
      ("It goes INTO the chichería: Rosa's house under the red flag...").
      The journal now opens on it.
- [x] **Smarter HUD chip**: always shows the most pressing open thread
      (not just formal errands); updates on every state change via a new
      `changed` event.
- [x] **End-of-content honesty**: the signpost now says the world past it
      is still being woven; the post-completion task entry says the same.
- [x] **The stuck-detector test**: walks the entire story fixpoint and
      asserts that EVERY reachable flag state has at least one active task.
      It immediately caught two real gaps (mid-conversation saves after
      Rosa's soup; the lull before meeting Carmen): both covered. 34 tests.

## P14: Pilar, the comedian (done)

- [x] Pilar, age 9, self-appointed toll collector of the bridge; her toll is
      one interesting fact. Kid rig (`look.kid` squash in drawPose), village
      [8,18], range 2
- [x] 9 dialogue nodes: first (toll, two choices), rocks / tour / mayor
      escalating schemes (s1/s2/s3), promoted (bridge co-owner after
      people.nani), epilogue ("bring me something from the sea. A weird one."
      sets pilar.sea for Chapter Two), idle
- [x] `people.pilar` journal page; bridge examine now nods at her sign
- [x] Verified: 34 tests green (reachability + stuck detector), browser
      playthrough first→pay→rocks→tour, save persists met.pilar + page

## P15: Elsewhere rename + the recall system + Chapter Two: La Caleta (done)

- [x] Renamed the game to **Elsewhere** (title screen, package, save key with
      old-key migration); repo pushed to github.com/shubhamgoel27/elsewhere
- [x] Recall system, "the world rhymes":
      knowledge keys (per-choice `when` conds; pages already double as flags),
      rhyme stitching in the journal (derived, unmissable; Nani margin notes;
      thread count in header), mail from home (`letter:` effect reuses the
      letter overlay; Pilar and Aurelio letters react to real flags),
      keepsakes as flags (Carmen's band, Pilar's sea gift), recall manifests
      per chapter with ledger tests (consumed keys planted-or-backfilled,
      c2 locality, rhymes authored both sides, letters resolvable)
- [x] Chapter Two, La Caleta: 48x34 coastal map + picantería interior, 10 NPCs
      (Marisol, Don Simón, Nilda, Rafa, Maestro Félix, Doña Petro, Don Wili,
      Capitana Ríos, Chasca, plus pelicans), 27 journal pages, 15 tasks,
      three frictions (ceviche o'clock, la mar, buying the yapa), casero loop,
      lisa errand, tidepool gift for Pilar, harbor-office mail, caballito
      wave-ride and net-mending minigames, garúa/glare weather moods,
      coastal art kit (sand, pier, quincha casas, caballitos, boats, nets,
      reeds, pelicans, emoliente cart), finale: earning working passage
- [x] Verified: 40 tests green; scripted browser playthrough end to end
      (arrival to CHAPTER TWO COMPLETE and the Crossing teaser); letters and
      journal stitching verified in-browser with a Ch1-complete save
- [x] Chapter Three research bible done: docs/crossing-content-bible.md

## P16: The whole world (chapters 3-10, parallel-built) (done)

- [x] Chapter plugin architecture (ChapterDef contract, art set registry,
      registerable moods, generic minigame overlays, travel: effects,
      gated arrivals, lint-chapter tool, location-persistent saves)
- [x] Six sourced research bibles + docs/story-arc.md canon (Nani's answer:
      the guelaguetza ledger in Oaxaca; her hand stops mid-sentence in Sicily)
- [x] Eight chapters built by parallel agents to the shared contract:
      crossing (MV Yacana), shionoura, busan, kerala, zanzibar, sicily,
      oaxaca, return (reunion extensions + album credits + the last page)
- [x] Integrated in play order; ~200 journal pages, ~20 maps, 14 minigames,
      10 Pilar letters; 41 tests green (reachability fixpoint, stuck
      detector, recall ledger, letter variants, map integrity)
- [x] Browser-verified: boarding + travel between chapters, all new map
      renders (with grading fixes to Zanzibar tideout + Sicily basalt),
      minigame overlays, mail, the Return's homecoming and reunions
- [x] Australia honestly deferred as a post-game letter (consultation-grade
      research standard, per the roadmap rule)

## Next (polish backlog)

- [ ] **Chapter Three: The Crossing** (bible done: docs/crossing-content-bible.md):
      the cargo ship as a village, galley cooking verb, star deck (Mayu /
      Amanogawa rhyme with words.chaska), line-crossing ceremony, the mail
      bundle mid-Pacific (Pilar's reply names the actual creature sent)
- [ ] El Niño fish-list variation on Marisol's stall (bible mechanic, unbuilt)
- [ ] Circle-wipe transitions; camera lookahead; high-res dialogue portraits
- [ ] Deep true secret; sitting verb; ambient critters; accessibility pass

## P16: Chapter Three: The Crossing (built; awaiting integration)

Plan (per docs/chapter-authoring-guide.md; new files only, no shared edits):

- [x] src/content/crossing/map.ts: `ship` exterior 44x32 (tapered hull, four container bays, house, funnel)
      + `galley` interior 14x10; every walkable cell proven reachable from spawn
- [x] src/content/crossing/npcs.ts: Mang Ben, Joseph, Hana, Olena, the bosun, Capitana Rios, Chasca, the cat;
      NODES, EXAMINES (19 new kinds + map-tagged shared kinds), EVENTS, LETTERS (c3.pilar x4, c3.petro x2)
- [x] src/content/crossing/journal.ts: 20 pages (6 Nani texts, rhymes starriver~chaska, sinigang~sudado),
      13 tasks with catch-all + post-completion + errand mid-states
- [x] src/content/crossing/recall.ts: consumes pilar.gift.*, c2.casero, c2.complete, page.words.lamar;
      plants c3.arrived, joseph.letter, photo.c3.deck, c3.complete, c3.shellback, page.customs.starriver
- [x] src/content/crossing/index.ts: CHAPTER assembly, games wiring, openocean mood, arrival, completion
- [x] src/art/sets/crossing.ts: deck, railing, contA/B/C, lifeboat, winch, bollard, funnel, shiphouse, hammock,
      shipbell, jackstaff, shipcat, stove, karaoke, trayrack, wallSteel, floorSteel
- [x] src/ui/games/crossing.ts: GalleyPanel (adobo, no fail) + StarPanel (three skies, no fail)
- [x] Verify: tsc clean; lint-chapter OK, 0 warnings; npm test 40/40; headless playthrough sim completes
      the chapter and fills 20/20 pages both with and without earlier-chapter keys

### Review

Integration needs two lines: import CHAPTER into world.ts CHAPTERS after LA_CALETA, and a side-effect
registerArt import for src/art/sets/crossing.ts. Entry is the la-caleta piersign examine (gated on
c2.complete) which runs `travel:ship`; departure runs `travel:shionoura` from the jackstaff at the bow
once c3.complete (map exists at C4 integration; until then runtime logs "travel to unknown map").

## P17: Chapter Four: Shionoura (done)

Plan (per docs/chapter-authoring-guide.md; new files only, no shared edits):

- [x] src/content/shionoura/map.ts: `shionoura` exterior 46x32 (harbor, shotengai, Ebisu shrine, minshuku) + `minshuku` interior (genkan, tatami, irori, ofuro)
- [x] src/art/sets/shionoura.ts: machiya (352x256), noren, torii, ishidoro, bamboo, bambooWish, tairyobata, chochin, postbox, yatai, keitruck, ebisudo, tatami, floorWood, tataki, wallShoji, irori, ofuro
- [x] src/ui/games/shionoura.ts: KingyoPanel (goldfish scooping; paper poi + soak meter; no real fail)
- [x] src/content/shionoura/npcs.ts: Hana, Fumi, Daisuke, Sachiko, Genji, Taro, Captain Isao, Chasca; nodes, examines, events; omiyage chooser; tanzaku wish scene
- [x] src/content/shionoura/journal.ts: 23 pages (6 Nani texts; rhymes tanabata~starriver, otsukaresama~espera), tasks with catch-all + post-completion
- [x] src/content/shionoura/recall.ts + index.ts: letters (c4.pilar, c4.marisol), games, moods, arrival, completion, travel:busan departure
- [x] Verify: npx tsc --noEmit and npx tsx tests/lint-chapter.ts src/content/shionoura until both clean

## Notes

- Browser extension automation runs in an isolated JS world: it shares the DOM
  but cannot deliver synthetic key events to the page or read its variables.
  Movement is therefore verified headlessly in `tests/`, and the browser is used
  only for looking at things. `DevBridge` exists for DOM-mediated inspection.

## P? — A personable start (naming + look)

- [x] state.ts: `playerName` + `playerLook` persisted, backward-compatible load
- [x] textbox.ts: `{name}` token substitution (fallback "traveler")
- [x] title.ts: NamingCard (two steps: flyleaf name, traveler's look) + letter salutation
- [x] index.html: `#cc-card` element + cc- styles
- [x] main.ts: 'naming' mode between Begin and letter; player sheet from saved look
- [x] content: rosa.first + chasca.offer use `{name}`
- [x] verify: tsc clean, 42/42 tests, Playwright: name flow, skip flow, old-save Continue

Review: save shape gains optional `name` (string|null) and `look` ({skin,cloth,hair}|null);
old saves without either load as null and every surface falls back ("traveler" /
"For my grandchild"). Continue never asks; Begin again re-asks after reset.

# Goal: less text, more play; music with a birthplace

The owner's brief, 2026-08-12: information should arrive through interaction
and play rather than dialogue walls, across every chapter; and each village's
background music should be present and carry its instruments, not just exist.

## Phase 1: research (running)
- [x] Launch text-density audit across all 11 chapters (counts, worst walls, conversion candidates)
- [x] Launch music audit + library landscape (current audibility, Tone.js et al vs extending the engine)
- [x] Launch wordless-storytelling pattern catalog (engine levers x cozy-game patterns)

## Phase 2: design
- [x] All three reports landed. Verdicts: extend the audio engine (no library: Tone adds 83kB for the same oscillators, Strudel is AGPL, WebAudioFont is GPL); text problem is channel monoculture (~2,682 say-lines, a third routable to existing channels), not walls; 16 patterns catalogued, top 8 ranked
- [x] Textbox already completes-then-advances; CPS is a setting. No change needed now

## Phase 3: implement
- [x] Music agent launched: KS plucks, flutes, drone/pad, reverb send, motif tables, phrase clock, arrangement cycle, all 11 regions, recorded auditions (port 5490)
- [x] Wave 1 committed (606b5ce): delhi, oaxaca, kerala, crossing, village
- [x] Wave 2 committed (8ffcff6): shionoura, busan, zanzibar, sicily, caleta, return
- [ ] Engine-dependent patterns after music agent commits (station scheduling for customs-practiced-on-schedule, seated vignettes)
- [ ] Tests stay green (50), reachability holds after any dialogue restructuring

## Phase 4: verify
- [ ] Frozen-build playthrough per touched chapter, own port, kill servers after
- [ ] Blind before/after critics on both dimensions (talkiness, music presence)
