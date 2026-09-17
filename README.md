# Tinyrise

**Build the whole city. Zoom in. Watch one tiny life use your stairs.**

Live: **https://tront.xyz/tinyrise/**

Tinyrise is a browser city-building toy in one self-contained HTML file. A 4 x 4 city of
brutalist concrete, curtain wall and brick blocks. Pick a block, sculpt it bay by bay,
connect rooftops with bridges and stairs, fit out homes, cafés, workshops and gardens,
then watch residents actually walk your routes, climb your stairs and sit down for coffee.

By Trent Sterling (Tront). No install, no account, no assets to download. WebGL2, runs
offline from a single file.

## Play

- **City** (or `M`): whole-city overview. Click a block to dive in.
- **Build**: click to add, erase, recoat or lift. Materials on `1` to `4`. Shift-drag or Area
  mode edits a rectangle on the ground, a roof or a wall; scroll adjusts depth.
- **Live**: choose occupants (households, cafés, studios, workshops), watch people move,
  trace a person's route, run a busy day to stress the layout.
- **Connect**: bridges between roofs, stairs between floors, terrace stairs between heights.
- **Arrange**: copy, rotate and paste floors, explore variations.
- Camera: drag to orbit, right or middle drag to pan, wheel to zoom, `F` to frame. Ortho,
  perspective and a free-fly camera (`WASD`, `Q`/`E`, `Esc` to return).
- Menu > Save: block JSON, whole-city JSON, PNG postcard, GLB of the building geometry.
  Everything also autosaves to the browser.

## Repo

```
index.html      the game (single file, no build step)
og-image.png    social card, rendered in-engine by tools/og-shot.mjs
NOTES.md        design intent and tribal knowledge; read before changing anything
CHANGELOG.md
tools/          headless Chrome QA (node tools/verify.mjs), OG render, rebrand script
ref/            the three pre-release builds this was cut from (working title era)
```

QA is not optional here: `node tools/verify.mjs` boots the exact `index.html` in headless
Chrome (SwiftShader WebGL2), edits two blocks, switches between them, undoes, exports,
imports, reloads and checks the mobile layout. It must be green before anything ships.

## Inspiration, not affiliation

Miniopolis (Luke Schneider / Radiangames), Townscaper (Oskar Stålberg), Tiny Glade
(Pounce Light) and Dystopika (Voids Within) shaped the direction. No code, meshes or
assets from those games are used. The architecture rules here are original.

## License

Code is MIT. Play it, learn from it, fork it. Credit Trent Sterling / tront.xyz.
