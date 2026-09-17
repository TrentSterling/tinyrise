# CLAUDE.md: Tinyrise

Single-file browser city builder by Trent Sterling. Live at https://tront.xyz/tinyrise/.
Public repo `TrentSterling/tinyrise`, GitHub Pages from `main` root, https enforced.

## Rules

- `index.html` is the product. One file, no build step, no CDN on the default path.
- Read `NOTES.md` before touching anything. It holds the design values, the art bug
  history and the list of things that must not regress.
- **Never ship without running it.** `node tools/verify.mjs` must be 33/33 (or more) and
  you must look at `tools/out/qa-*.png` yourself.
- No em dashes anywhere. No "YARD" (working title) anywhere except `ref/` and the
  `LEGACY_FORMATS` import shim.
- Discord links are always `tront.xyz/discord/`.
- Version lives in the `PROJECT` constant (`version`, `build`) and the credits footer.
  Bump on every release and add a `CHANGELOG.md` entry.

## Deploy

```
node tools/verify.mjs            # QA, must be green
node tools/og-shot.mjs           # only if the look changed; writes og-image.png
git add -A && git commit && git push
```

Pages serves `main` root. Bump `?v=` on the og:image URLs in `index.html` when the image
changes so social caches refresh.

## Tools

- `tools/cdp.mjs`: zero-dep Chrome DevTools driver (headless, SwiftShader WebGL2).
- `tools/verify.mjs`: the QA loop. Boots the file, edits two blocks, switches, undoes,
  exports, imports legacy, reloads, checks M key, credits and a 390px layout.
- `tools/smoke.mjs <file> <prefix>`: boot + screenshots for any build (used on `ref/`).
- `tools/og-shot.mjs`: in-engine 1200x630 render. Env: `BLOCK`, `MODE`, `HOUR`, `YAW`,
  `PITCH`, `SPAN`, `TARGET`.
- `tools/rebrand.py`: the exact, asserted transformation from
  `ref/03-yard-city-scale.html` to the 1.0.0 `index.html`. Historical; do not rerun over
  a newer `index.html`.

## Public JS API

`window.tinyrise` exposes `world`, `state`, `camera`, `city` (overview, edit, select,
exportData, importData, stats), `living` (sim, transaction, takeStudy, putStudy,
parseStudy), `view`, `ui`, `routes`, `social`, `assets`, `editAt`, `setTool`,
`applyPreset`, `exportStudy`, `redraw`. The harness drives the game through it.
