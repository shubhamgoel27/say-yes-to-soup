# Elsewhere

*a journal, half full*

**Elsewhere** is a cozy, Pokémon-style RPG for the browser about walking through the world's villages and letting culture arrive sideways: through soup, slang, small corrections, and people who disagree with each other. No combat, no timers, no fail states. You can put it down mid-sentence.

You inherit your grandmother Nani's half-finished 1974 travel journal and retrace her route. Her faded entries sit above yours on every page you both reach. Sometimes she was wrong. Sometimes the recipe changed.

## Playing

```bash
npm install
npm run dev
```

Open the printed localhost URL in a modern browser (WebGPU preferred, WebGL fallback).

| Key | Action |
|---|---|
| Arrows / WASD | walk |
| Space / Z | talk, touch things |
| J | the journal |
| M | mute |

## What is in the game

- **Chapter One: Ch'aska Pampa**, a fictional Andean highland village. Around 30 journal pages of words, dishes, people, and customs, learned by playing: carry chicha without spilling it, sit at a loom, dig papas, pet the dog well past the recommended dose.
- **Chapter Two: La Caleta**, a fishing village on the desert coast below. Become somebody's casero, earn the yapa, learn why ceviche is a clock, kneel onto a caballito de totora, mend nets in the evening circle, and earn working passage on a cargo ship.
- **Chapters Three to Ten, around the world**: the MV Yacana across the Pacific (galley cooking, the star deck, the line-crossing ceremony), a Seto Inland Sea town at Tanabata (omiyage, goldfish scooping), a Busan market lane (the deom, a tea-house riddle), Kerala backwaters at monsoon onset (a letter delivered to a crewman's mother, snake-boat rowing, sadya on a banana leaf), a Zanzibar shore village (pole pole, kanga proverbs, dhow sailing), Sicily under Etna (scopa at the circolo, U pisci a mari, where Nani's handwriting stops mid-sentence), Oaxaca at Día de los Muertos (the guelaguetza ledger that answers why she stopped, an ofrenda built from your whole journey), and the road home.
- **The world rhymes**: what you learned uphill changes how every coast treats you. The journal stitches threads between rhyming pages (ayni, yapa, deom, pilón, guelaguetza; two star rivers; two saints who go to the sea), Nani's margin notes become legible when you hold both halves, and letters from earlier villages find you at every post office, reacting to things you actually did, including one bridge magnate's escalating correspondence.
- **Gentle friction**: getting a custom slightly wrong is never punished; the wrong branch is always the warmer scene. Offer coins for soup and you meet ayni instead.
- **Tasks journal**: every open thread, written like directions from a friend. A test proves no reachable state ever leaves you without one.
- **A living village**: day/night cycle, window light, fireflies, generative Andean-flavored music, weather moods, one bridge with a self-appointed toll collector (the toll is one interesting fact).

## How it is built

- Vite + TypeScript, a thin custom engine (fixed-timestep 60 Hz sim, 16 px logical tiles), and PixiJS only for the final composite: screen-space lighting, glow, and bloom over a Canvas2D-painted world.
- All art is procedural: painterly canvas drawing at 4x resolution, no image assets, no pixel fonts.
- Content is data: maps are ASCII rows plus a legend; dialogue is a condition-gated node graph; one `effects` array is the entire learning system.
- The test suite plays the game abstractly: graph integrity, map integrity, a reachability fixpoint proving every journal page earnable, and a stuck detector proving every state has an active task.

## The road ahead

The route follows real connections: down to the coast (La Caleta), a working passage across the Pacific, and onward through Japan, Kerala, Zanzibar, Sicily, Oaxaca. A cross-chapter recall system ("the world rhymes") stitches threads between pages: the coast says yapa, the mountain says ayni, and Nani's margin notes become legible when you hold both halves.

Research bibles are written before any region is authored (see `docs/`). Villages are fictional; the texture is sourced.

## License

Personal project, all rights reserved for now.
