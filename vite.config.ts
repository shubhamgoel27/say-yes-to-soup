import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the same build works at a domain root and under a
  // subpath (GitHub Pages serves from /say-yes-to-soup/). All asset
  // references in code are likewise relative.
  base: './',
  build: {
    // main.ts boots with a top-level await (the GPU stage init); es2022 is
    // the first target that has it. Without this the production build has
    // never compiled, which nobody noticed because everyone plays the dev
    // server. Every browser with WebGPU or usable WebGL2 speaks es2022.
    target: 'es2022',
  },
});
