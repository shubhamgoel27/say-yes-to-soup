# Rendering engine decision (research 2026-07-21)

**Chosen: PixiJS v8 (`pixi.js` + `pixi-filters`), WebGL preference, autoStart:false,
driven by our fixed-timestep loop.** Phaser 4: rejected (whole framework, we keep our
sim). Raw WebGL2: Plan B only if zero-deps becomes sacred (~1.5-2k LOC).

## Adopted architecture (hybrid, phase 1)
- The existing Canvas2D world composer keeps drawing each frame into an OFFSCREEN
  320x180 canvas (all autotiling/mottling/shadow logic untouched).
- That canvas is a CanvasSource texture updated per frame (230KB upload, trivial),
  presented through Pixi with the sharp-bilinear chain:
  logical RT (nearest) -> 4x prescale -> fractional scale with linear = zoom without shimmer.
- Screen-space light map: RT cleared to ambient color (day/night/mood), radial-gradient
  light sprites added with blend 'add', composited over world with 'multiply'; weak
  additive second pass + AdvancedBloomFilter for emissives.
- Particles: v8 ParticleContainer, own emitter logic in the 60Hz sim.
- Per-map grade via AdjustmentFilter/LUT (replaces canvas atmosphere overlays over time).
- Phase 2 (only if needed): move world drawing into Pixi scene graph with an atlas
  CanvasSource (batching), cacheAsTexture static tile layers.

## Gotchas bank (from research)
- autoStart:false, never touch app.ticker (no double loops; hidden-tab sim channel keeps working)
- light RT must clear to OPAQUE ambient (alpha 1) or multiply fringes
- filters GLSL-only => pin 'webgl' preference; add WGSL later for WebGPU
- roundPixels ON inside logical RT; OFF on the presented sprite
- @pixi/lights and @pixi/particle-emitter are v7-dead: do not use

Full sourced report in conversation log (PixiJS v8.19, June 2026; pixi-filters v6.x).
