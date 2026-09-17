# Changelog

## 1.0.0 (2026-09-17)

First public release at https://tront.xyz/tinyrise/.

- Named **Tinyrise**. The working title is gone from the UI, metadata, save keys, file
  names, the public JS API (`window.tinyrise`) and the source. Old working-title JSON
  exports (`yard-building`, `yard-city`) still import.
- Cut from the city-scale build: 4 x 4 property city, whole-city overview, cached
  architectural LOD for the fifteen inactive blocks, full simulation on the active block,
  whole-city JSON export and import, `M` to toggle overview.
- Open Graph / Twitter card metadata, canonical URL, favicon, in-engine social image.
- Removed a dead street-centerline helper that referenced an undefined builder.
- Em dashes removed from every visible string.
- Headless QA harness (`tools/verify.mjs`): 33 checks covering boot, rebrand, cross-block
  persistence, undo across a block switch, export and import, legacy import, reload
  restore, keyboard overview toggle, credits, and a 390px layout pass.

## Pre-release (working title era, ChatGPT-built)

Kept for reference in `ref/`:

- `01` Neighbourhood: single 12 x 16 x 12 property, occupants, café seating, busy days.
- `02` Form & Material: façade and glass overhaul, area selection, hero asset polish.
- `03` City Scale: the 4 x 4 city layer on top of Form & Material.
