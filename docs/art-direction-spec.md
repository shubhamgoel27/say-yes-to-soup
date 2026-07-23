# Art direction spec (research pass, 2026-07-21)

Full agent report in conversation log. The operative decisions:

## Foundation (do before regenerating art)
1. Rebase 240x160 -> 320x180 (16:9; 6x/8x/12x integer scales; kills the GBA read)
2. Master palette as hue-shifted ramps: shadows shift COOL (+15-25deg toward blue/purple)
   and gain saturation; highlights shift WARM (toward yellow); never plain darker/lighter.
   Shared deep-shadow anchors (warm-dark + cool-dark), no pure black.
3. Ambient bleed: darkest sprite steps lerp 15-20% toward terrain midtone.

## Identity upgrades
4. Hero 16x28 (~2 tiles tall), 6-frame walk @10-12fps, 4-frame breathe idle + blink.
5. Quantized point lights: 3-4 dithered bands snapped to pixel grid; emissive pixels
   (windows/fire) exempt from night grade. NO smooth high-res gradients over pixels.
6. Continuous time-of-day ambient curve (dawn gold / noon neutral / dusk orange-magenta /
   night blue), night clamped for readability, characters tinted at ~60% of env tint.

## Compounding polish
7. Water: 4-frame shore shimmer + scroll + sparkles.
8. Grass-touch rustle; universal NPC breathe/blink (programmatic 1px shifts).
9. Cloud-shadow multiply layer (scrolling noise, daytime, outdoors, 8-12%).
10. Circle-wipe + Bayer-dither transitions; camera lookahead 4-6px, exp smoothing.
11. UI: 9-slice pixel chrome + high-res text; larger dialogue portraits (Eastward move).
12. Ambient wildlife: birds that flush, butterflies (day) / fireflies (night).

## Skipped on purpose
32px tiles; normal maps; realtime shadowcasting; god rays (later as static quads).

Key sources: Eastward GameDeveloper interview; Sabotage/Sea of Stars presskit + BTS;
PCGamingWiki CrossCode; 80.lv Moonstone Island; Cozy Grove artist interviews;
Slynyrd Pixelblog ramps; Lospec hue-shifting; notkey.studio resolution guide; saint11.
