# Asset Credits

All assets below are CC0 / public domain. No attribution required; credited here as a courtesy and for provenance. Downloaded 2026-07.

## textures/

| File | What it is | Source | License | Suggested use |
|---|---|---|---|---|
| `paper-aged-cream.jpg` | Seamless warm kraft/beige paper, fine fiber speckle, 1024px tile | [ambientCG Paper006](https://ambientcg.com/a/Paper006) | CC0 | Journal page background: tile at low opacity (multiply, ~15-25%) over the existing cream fill to give pages real tooth |
| `paper-grain-white.jpg` | Seamless fine white paper grain, near-neutral, 1024x600 tile (source's native size) | [ambientCG Paper001](https://ambientcg.com/a/Paper001) | CC0 | Universal grain overlay (multiply or overlay blend) for dialogue boxes, tooltips, and the title card; tints to any paper color |
| `bookcloth-weave.jpg` | Seamless rough woven book-cloth, sage/grey, 1024px tile | [ambientCG Fabric066](https://ambientcg.com/a/Fabric066) | CC0 | Journal cover and tab bar: hue-shift toward the game's warm brown for a cloth-bound 1974 notebook cover |
| `linen-soft.jpg` | Seamless soft linen weave, light grey, 1024px tile | [ambientCG Fabric036](https://ambientcg.com/a/Fabric036) | CC0 | Subtle canvas grain for larger UI panels (map screen, menu backdrop); reads as fabric without visible checkering |

## ornaments/

| File | What it is | Source | License | Suggested use |
|---|---|---|---|---|
| `flourish-engraved.svg` | Victorian engraved acanthus flourish, triangular head/tailpiece | [FreeSVG: Antique corner ornament](https://freesvg.org/antique-corner-ornament) | CC0 | Chapter/section tailpiece in the journal (ink-colored, small, centered under a section title); also title screen accent |
| `postmark-wavy.svg` | Minimal postmark: empty circle plus wavy cancellation lines | [FreeSVG: Postmark](https://freesvg.org/postmark) | CC0 | Stamp journey cards "visited": rotate slightly, ink red-brown, set place/date text inside the blank circle |
| `stamp-frame-perforated.svg` | Blank postage stamp frame with perforated toothed edge | [FreeSVG: Rectangular stamp frame](https://freesvg.org/rectangular-stamp-frame-vector-drawing) | CC0 | Passport-stamp journey cards: frame for each destination's vignette in the Route tab |
| `compass-rose-1595.svg` | Antique compass rose (1595 style) with Latin labels (Septem, merid, oc, or) | [FreeSVG: Rose retro compass](https://freesvg.org/rose-retro-compass) | CC0 | Route tab corner emblem or loading spinner (slow rotation); note: artwork sits off-center in its canvas, crop via viewBox or CSS |

## Notes

- ambientCG textures are the Color map only, extracted from the 1K JPG packs and recompressed (quality 55) to stay under the size budget. Normal/roughness maps were discarded; the UI only needs albedo.
- All four textures tile seamlessly (ambientCG materials are prepared as seamless; `paper-grain-white.jpg` is a non-square 1024x600 tile).
- SVGs contain no scripts (checked). `compass-rose-1595.svg` has a few stray dot artifacts left of the compass and a hanging-loop detail on top; crop or mask if unwanted.
- Rejected sources during scouting: Lost and Taken (free but not CC0 redistribution), The Noun Project (paid/attribution wall), rawpixel (login-gated downloads), Kenney/LPC/Sprout Lands/Ninja Adventure environment packs (pixel art, clashes with our smooth painterly vector style).
