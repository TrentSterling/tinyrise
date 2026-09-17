# Tinyrise: design intent and tribal knowledge

Read this before changing anything. It is the distilled handoff from the pre-release
builds (ChatGPT-built under Trent Sterling's direction) plus the 1.0 packaging pass.
The raw original notes are in `ref/00-handoff-notes-raw.txt`.

## The product in one sentence

A modern architectural, Townscaper-like city builder where shaping the city transitions
seamlessly into detailed buildings and tiny simulated lives.

Three scales, and the player should move between them without friction:

- **City**: districts, roads, properties, skylines. "I made this district."
- **Building**: procedural façades, setbacks, bridges, courtyards, terraces, materials,
  stair access.
- **Human**: residents, workers, deliveries, cafés, gardens, routes, chairs. "That person
  walked across my bridge, used those stairs, sat in that chair, drank coffee."

That multi-scale identity is the differentiator. Protect it.

## Design values

1. **Sandbox first.** No taxes, sewage, crime, police, fire, ten resources, zoning
   percentages, rent micromanagement, idle grind or failure timers. The toy must stay fun
   with no objectives.
2. **Architecture has consequences.** A bridge changes routes. A stair really connects
   floors. Removing a bridge really isolates a destination. A café has capacity. People
   really sit in chairs. Visuals and simulation must tell the same truth. Past bugs:
   stairs facing one way while nav ignored them, residents teleporting through abstract
   routes, cafés "visited" without anyone sitting, furniture overlapping stairs. All
   unacceptable.
3. **Visible problems, not hidden stats.** "The café is visibly crowded" beats
   "Efficiency -12%". Overlays are allowed; the world itself should communicate.

## Art direction

Modern industrial / brutalist / office. Concrete slabs, horizontal bands, recessed dark
glazing, strong silhouettes, setbacks, flat roofs, utilitarian stair cores, terraces,
courtyards, bridges. Clean architectural readability, not hyperrealism.

Material families: precast concrete (broad bands, recessed glazing ribbons, stronger
crown), curtain wall (dark recessed glass, restrained framing), brick (masonry piers,
recessed industrial windows, sills and lintels), service core (mostly solid, louvers,
narrow windows).

Reference principles extracted from a Miniopolis video (the video is not in the repo):

- Footprint selection is one coherent amber perimeter with a subtle fill, not a pile of
  highlighted voxel cages. That is the Area tool.
- Construction animates the real resulting geometry, not an overlay or placeholder boxes.
- Massing uses broad concrete bands, stronger crown bands, recessed dark windows, little
  arbitrary trim.
- Rectangular regions can be selected on walls, not only roofs (face-locked area
  selection).
- Glass varies between near-black, reflective gray and a recessed interior look. Ours is
  inset geometry, stable per-pane variation, analytic sky Fresnel, optional reflection
  intensity. It does NOT reflect nearby geometry; do not claim it does.
- Roofs are restrained. Less clutter, readable equipment, silhouette.

### Do not reintroduce

- **Moving fake glass shimmer.** There was once a `fract(worldpos - time)` sweep. It looked
  like lights sliding across windows with nothing moving. Removed. Glass variation stays
  static unless something in the scene actually changes.
- **Sliding tree canopies.** Early wind made foliage look like floating cubes. Trunk
  continues into canopy, branches visible, lobes overlap, wind is gentle and root-relative.
- **Oversized car roofs.** An early car had a padded white lid. Roof shell is fitted to
  the cabin. Inspect new procedural assets from several angles.
- **Warped A-frame menu boards.** Rebuilt as a hinged A-frame with consistent supports.

## Systems worth knowing

- **Café interaction:** reserve a seat, walk to its approach, turn, sit, use the cup,
  finish, stand, leave. Model and simulation sockets share layout data.
- **Access graph:** outdoor ground, indoor floor, roof surfaces, entrances, stairs,
  terrace stairs, bridges, destinations, furniture sockets, constrained passages.
- **Route trace:** gold exterior trail, blue dashed interior trail, arrows, start and end
  markers, stable thickness, clear Trace / Hide state. Not giant beams, not invisible.
- **Stairs:** route and visible orientation agree, explicit approach, treads, threshold,
  landing, clearance rules, furniture cannot occupy required stair space, auto orientation
  with a user cycle, locked orientation never silently changes. Terrace stairs connect
  roofs of different heights.
- **Area editing:** Area mode or Shift-drag, first picked face locks the plane, drag a
  rectangle, scroll adjusts depth, release commits, Esc cancels, Alt-drag orbits, Alt-click
  samples material. Works on ground, roofs, walls. One undo per area operation.
- **Juice:** placement animates the real architecture, fast, with overshoot and squash.
  Punchy and brief beats giant wobbling buildings.
- **Cameras:** orthographic (primary), perspective (perspective-correct picking), free fly
  (`WASD`, `Q`/`E`, Shift faster, Ctrl slower, Esc or `F` to return). Free camera must
  never edit geometry.
- **UI:** dark UI is preferred and is not the same thing as night. Workspace tabs (Build,
  Live, Connect, Arrange) show only relevant tools. Visible text labels, readable sizes,
  no icon-only mystery meat, no giant tutorial panels.
- **Neighbourhood layer:** prospects (households, cafés, workshop, studios, makerspace)
  occupy indoor space and create demand. Connectivity is the beginning, not the win. Busy
  days (open day, makers' market, rooftop evening) send visitors through real routes and
  expose bottlenecks.

## City scale (current architecture)

- 4 x 4 properties, each a 12 x 16 x 12 chunk (48 x 48 bays, 16 levels).
- One active property runs the full game (people, cafés, stairs, routes, editing).
- The fifteen inactive blocks are cached architectural LOD meshes (`cityLodArchitecture`).
  Never simulate café chairs, stair footsteps or furniture nav for distant blocks.
- The city layer wraps `makeSite`, `rebuild` and `autoSave`; `bindCity` adds the City
  button, HUD, `M` key and whole-city JSON import/export.
- Autosave: `tinyrise-city-v1` in localStorage, plus per-block undo/redo stacks (last 25)
  stashed on switch.
- Save formats: `tinyrise-building` (v1 and v2) and `tinyrise-city` v1. Legacy
  working-title IDs are accepted on import through `LEGACY_FORMATS`. Do not rename these
  again casually.

### Future direction (agreed, not built)

- Scale progression: 48 x 48 now, then 64 x 64, profile, 96 x 96, 128 x 128 stress target
  (Miniopolis discussed ~126 x 63 x 126). Do not just grow the global array.
- Chunked dirty rebuilds (8 x 8 x 8 or per-building), buffer reuse, no per-frame allocs.
- Macro geometry: detect continuous façade runs and emit strips instead of window, window,
  window.
- Simulation LOD: statistical far away, cheap agents in the visible district, full sim on
  the nearby property, maximum fidelity on the selected citizen.
- Hierarchical nav: local indoor graph, entrance, city road graph, destination entrance,
  local graph, chair. Never one chair-level graph for the whole city.
- Roads and parcels that feel authored, then cross-property access, then districts.
- Next pass in order: formalize CityWorld state, dirty chunk rebuilds, cross-property
  persistence tests, city camera UX, authored roads, city visual LOD, cross-property access.

## Absolute QA rule

**Never ship a build without running it.** Regressions shipped in the past because work was
syntax-checked and reasoned about but never run: `applyPreset is not defined`, blank
renderer, `hex.replace is not a function`, broken startup, missing hero assets, an
invisible route tracer, sideways cars, floating leaves, broken café sign, absurd car roof.

Every substantial change: open the exact final HTML in Chromium, verify the first frame,
check the console and WebGL errors, perform representative player actions, inspect
screenshots from more than one angle, test desktop and mobile if UI changed, then say done.
`node tools/verify.mjs` does the mechanical part. Your eyes do the rest.

When showing an art improvement: BEFORE and AFTER are both real in-engine captures, same
camera, same scale. Concept images are labelled TARGET / CONCEPT, never AFTER.

Playtest loops that matter:

```
place bridge -> trace route -> send resident -> watch stairs -> watch café ->
delete bridge -> verify access breaks -> undo -> verify route recovers

edit property A -> switch to city -> edit property B -> return to A ->
verify exact persistence -> save city -> reload -> verify both
```

## Clean-room note

Miniopolis and Townscaper are inspirations. No proprietary source, rule tables, meshes or
extracted assets. Publicly described Miniopolis approach (custom neighbour-aware rules,
building metadata, no WFC, later detail pass) is broad knowledge, not code to copy.

## Renderer

Self-contained WebGL2 renderer is the delivered and tested path. `?backend=three` loads
Three.js from a CDN and is not part of the validated build. Test the exact delivered path.
