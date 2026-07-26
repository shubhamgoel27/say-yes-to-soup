# Asset Scout: Open-Source Art for the 22 Minigame Panels

Scouted 2026-07. Question: do high-quality open-licensed sprites exist that beat hand-painted canvas art (the `src/art/pix.ts` toolkit) for the minigame panels? Calibration references: `docs/shots/delhi-gali.png`, `docs/shots/busan-market-day.png`, and the existing procedural dish painter in `src/art/dishes.ts` (soft antialiased flat-vector, tight warm palette, seeded, zero-download).

## Short answer

No general-purpose open sprite library matches the game's painterly flat-vector look; everything in the game-asset ecosystem is pixel art, 3D-rendered cartoon, or monochrome icon. The genuinely good open material is in a different register entirely: pre-1931 public-domain plates (hand-colored star charts, ukiyo-e food prints, USDA fruit watercolors). Those do not replace procedural painting; they slot into the 1974 journal conceit as pasted-in ephemera, where their aged-paper warmth is on-brand rather than off-style. Four such plates were downloaded to `public/assets/games/` (see `LICENSES.md` there).

## Survey (each license checked on its own page)

### Adopted (downloaded, all PD/CC0)

| Find | URL | License | Covers | Fit |
|---|---|---|---|---|
| Urania's Mirror, Orion (Pl. 29) and Ursa Major (Pl. 9), Sidney Hall 1825 | [Orion](https://commons.wikimedia.org/wiki/File:Sidney_Hall_-_Urania%27s_Mirror_-_Orion_(best_currently_available_version_-_2014).jpg), [Ursa Major](https://commons.wikimedia.org/wiki/File:Ursa_Major_cph.3g10058.jpg) | Public domain (1825) | Hand-colored constellation cards; 32 plates exist, all PD | Excellent: cream/ochre/rose palette is almost the game's own; originals had punched star-holes to hold up to light, a ready-made star-spotting mechanic |
| Hiroshige, "Medetai Fish and Sasaki Bamboo", *Uozukushi* series, ca. 1832-42, Met scan | [Commons file](https://commons.wikimedia.org/wiki/File:%E9%AD%9A%E3%81%A5%E3%81%8F%E3%81%97-Medetai_Fush_and_Sasaki_Bamboo,_from_the_series_Uozukushi_(Every_Variety_of_Fish)_MET_DP123587.jpg) | CC0 (Met Open Access) | ~20-print fish series (tai, katsuo, ebi, hirame...), all Met CC0 | Excellent as journal plate: kraft-paper ground and warm red sit inside the game palette; tai is literally the Shionoura dish motif |
| USDA Pomological Watercolor, Mulgoba mango, D. G. Passmore 1907 | [Commons file](https://commons.wikimedia.org/wiki/File:Pomological_Watercolor_POM00004494.jpg) | Public domain (US federal work, pre-1931) | 7,500+ fruit watercolors incl. mangoes, citrus, bananas | Excellent gouache-adjacent texture; fruit only (no cooked dishes), so it is chapter ephemera, not dish art |

### Promising but not downloaded

| Find | URL | License | Covers | Fit |
|---|---|---|---|---|
| Rest of Urania's Mirror (30 more plates) | [Commons category](https://commons.wikimedia.org/wiki/Category:Urania%27s_Mirror) | Public domain | Whole northern sky | Same fit; fetch more if star spotting wants variety. No Southern Cross (British-sky set only) |
| Rest of Hiroshige *Uozukushi* + Met boats/harbor prints | [Commons category](https://commons.wikimedia.org/wiki/Category:Every_Variety_of_Fish_(Sakana_dukushi)_by_Utagawa_Hiroshige) | CC0/PD | Fish, shrimp, harbor and boat scenes | Good ephemera for Busan quay and Shionoura; woodblock register, so keep to journal pages |
| The Grocer's Encyclopedia (Artemas Ward, 1911) color plates | [Internet Archive](https://archive.org/details/grocersencyclope00ward) | Public domain | 80 color pages: fruit, vegetables, fish, meats, cheese | Gorgeous chromolithographs, on-brand for journal clippings; plates need extraction from the PDF scan, deferred |
| Sicilian card suit-symbol SVGs (seme bastoni/coppe/denari/spade) | [Commons: Italian playing cards](https://commons.wikimedia.org/wiki/Category:Italian_playing_cards) | CC BY-SA (uploader vectors) | Four Sicilian/tarocco suit marks | Use as drawing reference only; redraw in pix.ts to avoid BY-SA share-alike in shipped art |

### Rejected

| Source | License | Why rejected |
|---|---|---|
| Kenney Food Kit / food packs ([kenney.nl](https://kenney.nl/assets/food-kit)) | CC0 | 200 items, but 3D-rendered cartoon isometric; hard style clash with soft flat-vector panels |
| OpenGameArt CC0 food ([search](https://opengameart.org/content/cc0-food-icons)) | CC0 | Almost entirely pixel art or 32 px icons; nothing painterly at panel scale; same clash the earlier texture scout logged in `public/assets/CREDITS.md` |
| itch.io free food packs (e.g. 400+ Food Assets; Nim's Painted Foodstuffs) | mixed | Free packs are cute-cartoon or pixel; the genuinely painterly pack (Nim's) is paid, not open |
| game-icons.net (~4,000 icons) | CC BY 3.0 | Consistent and tintable, but monochrome fantasy-HUD silhouettes; would read as RPG chrome, not gouache. Acceptable last-resort for tiny HUD glyphs only |
| Twemoji / OpenMoji | CC-BY 4.0 / CC BY-SA 4.0 | Flat emoji register, too cartoonish; OpenMoji's share-alike is an extra burden |
| SVG Repo / openclipart | per-icon / CC0 | Wildly inconsistent styles; no coherent painterly set; per-icon license auditing cost exceeds value |
| Commons "Sicily deck" card photos (26 files) | CC BY-SA 4.0 | Photographs of physical cards (uploader "own work" 2013): perspective, lighting, wear; share-alike license; better to redraw the 40 faces procedurally |
| rawpixel PD boards, NYPL menus | PD content | Login-gated downloads (rawpixel, noted in prior scout); NYPL 1970s menus are not reliably PD (1974 is inside copyright); pre-1931 menus exist but add little over the adopted plates |

## Verdict by category

| Category | Best open option found | Verdict |
|---|---|---|
| Food close-ups (parathas, jalebi, ceviche, mole, cannoli, hotteok, sadya...) | Nothing painterly and dish-specific exists in any open library | **Procedural stays.** `dishes.ts` already covers all 22 chapters' dishes in-palette for ~6 lines each; no open set comes close on cohesion or coverage of these specific cuisines |
| Utensils, pans, stalls | Kenney (3D cartoon), game-icons (mono) | **Procedural stays.** Redraw with pix.ts; open options all clash |
| Playing cards (scopa) | Commons Sicily deck photos (BY-SA), suit SVGs | **Hand-paint.** Draw the 40-card Sicilian faces procedurally using Commons scans as visual reference only; avoids BY-SA and keeps the palette |
| Kites, boats, nets | Hiroshige boats (CC0) as ephemera; no sprite-grade assets | **Procedural for gameplay art;** optionally one Hiroshige harbor print as a journal plate. Kites (Delhi patang) have no fitting open art at all |
| Star maps | Urania's Mirror (PD) | **Open asset wins.** Adopted; hand-painting cannot beat an 1825 hand-colored chart that already matches the palette and the journal conceit |
| Decorative frames / flourishes | Already solved in prior scout (`public/assets/ornaments/`, CC0) | **Keep existing** stamp frame + flourish; mount the new plates inside them |

## Recommendation

Upgrade the 22 panels with pix.ts painting as the primary plan; that is where the game's identity lives, and no open library matches it. Use the four downloaded plates (and more from the same three PD veins if wanted) as pasted-in journal ephemera: star charts behind the star-spotting minigame, the tai print and mango as chapter-page dressing. Treat every plate with the existing paper texture, stamp frame, and a slight rotation so they read as artifacts the traveler collected, not as imported clip art. Cohesion beats fidelity everywhere except the star charts, where the artifact is the fidelity.
