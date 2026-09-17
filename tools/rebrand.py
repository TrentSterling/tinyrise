# Builds index.html (Tinyrise 1.0.0) from ref/03-yard-city-scale.html.
# Every replacement asserts the old string exists so a silent miss is impossible.
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'ref' / '03-yard-city-scale.html').read_text(encoding='utf-8')
s = src

def rep(old, new, count=None):
    global s
    n = s.count(old)
    assert n, f'missing: {old[:90]!r}'
    if count is not None:
        assert n == count, f'expected {count} of {old[:60]!r}, found {n}'
    s = s.replace(old, new)

DESC_OLD = 'Build a small place. Connect its rooftops. Watch a little life unfold. An architectural toy by Trent Sterling (Tront).'
DESC_NEW = 'Shape a small city of concrete and glass, then zoom in and watch tiny lives use the stairs you built. A city-building toy by Trent Sterling (Tront).'
TITLE = 'Tinyrise by Tront | tront.xyz'
OG = ('<meta property="og:site_name" content="tront.xyz">'
      '<meta property="og:url" content="https://tront.xyz/tinyrise/">'
      '<meta property="og:image" content="https://tront.xyz/tinyrise/og-image.png?v=1">'
      '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
      '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + TITLE + '">'
      '<meta name="twitter:description" content="' + DESC_NEW + '"><meta name="twitter:image" content="https://tront.xyz/tinyrise/og-image.png?v=1">'
      '<link rel="canonical" href="https://tront.xyz/tinyrise/">'
      '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect width=%2740%27 height=%2740%27 rx=%278%27 fill=%27%23202a2e%27/%3E%3Cpath d=%27m6 14 14-7 14 7v15l-14 7-14-7zM6 14l14 7 14-7M20 21v15%27 fill=%27none%27 stroke=%27%23e0a63f%27 stroke-width=%272.4%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E">')

# Head / identity
rep('<title>YARD — by Tront | tront.xyz</title>', '<title>' + TITLE + '</title>', 1)
rep(DESC_OLD, DESC_NEW, 3)
rep('<meta name="application-name" content="YARD">', '<meta name="application-name" content="Tinyrise">', 1)
rep('<meta property="og:title" content="YARD — by Tront | tront.xyz">', '<meta property="og:title" content="' + TITLE + '">', 1)
rep('<meta property="og:site_name" content="tront.xyz">', OG, 1)
rep('/* YARD / UI 02.', '/* Tinyrise / UI 02.', 1)
rep('title="About YARD and its inspirations" aria-label="About YARD and credits"', 'title="About Tinyrise and its inspirations" aria-label="About Tinyrise and credits"', 1)
rep('<strong>YARD</strong></button>', '<strong>Tinyrise</strong></button>', 1)
rep('title="Trent Sterling (Tront) — game developer"', 'title="Trent Sterling (Tront), game developer"', 1)
rep('aria-label="Your yard"', 'aria-label="Your block"', 1)
rep('id="studyKind">Your yard<', 'id="studyKind">Your block<', 1)
rep('Return to yard <kbd>', 'Return to block <kbd>', 1)
rep('<div class="eyebrow">YARD / Your collection</div>', '<div class="eyebrow">Tinyrise / Your collection</div>', 1)
rep('value="yard-01"', 'value="tinyrise-01"', 1)
rep('Load earlier YARD autosave', 'Load earlier autosave', 1)
rep('<strong>View your yard</strong>', '<strong>View your block</strong>', 1)
rep('aria-label="YARD menu"', 'aria-label="Tinyrise menu"', 1)
rep('Fit whole yard <kbd>', 'Fit whole block <kbd>', 1)
rep('<strong>YARD<span>.</span></strong><p>A little place by Tront.</p>', '<strong>Tinyrise<span>.</span></strong><p>A tiny city by Tront.</p>', 1)

# Credits dialog
rep('<h2 id="creditsTitle">YARD</h2><span class="working-title">Working title</span>', '<h2 id="creditsTitle">Tinyrise</h2>', 1)
rep('Build a small place. Connect its rooftops.<br>Watch a little life unfold.', 'Build the whole city. Zoom in.<br>Watch one tiny life use your stairs.', 1)
rep('<p>Save files retain the original <code>yard-building</code> format IDs so a future name change does not strand existing studies. JSON and GLB identify the software creator; they do not assign authorship of your building to someone else.</p>',
    '<p>Save files use the <code>tinyrise-building</code> and <code>tinyrise-city</code> format IDs. JSON and GLB identify the software creator; they do not assign authorship of your building to someone else.</p>', 1)
rep('<span>R9 · Tront edition</span>', '<span>v1.0.0 · City Scale</span>', 1)
rep('"title":"YARD","workingTitle":true,', '"title":"Tinyrise","workingTitle":false,', 1)
rep('"version":"R9","build":"Form & Material / F1"', '"version":"1.0.0","build":"City Scale"', 1)

# Engine comments and strings
rep('/* YARD: original occupancy model', '/* Tinyrise: original occupancy model', 1)
rep('/* YARD / Living Edition', '/* Tinyrise / Living Edition', 1)
rep('/* YARD / Hero assets 01', '/* Tinyrise / Hero assets 01', 1)
rep('/* YARD / View 03', '/* Tinyrise / View 03', 1)
rep("'Mutation requires a valid YARD cell array.'", "'Mutation requires a valid Tinyrise cell array.'", 1)
rep("'Not a valid YARD 12 × 16 × 12 building.'", "'Not a valid Tinyrise 12 × 16 × 12 building.'", 1)
rep("'Not a valid YARD building save.'", "'Not a valid Tinyrise building save.'", 1)
rep("'Untitled yard'", "'Untitled block'", 2)
rep("'Yard deliveries'", "'Loading bay'", 1)
rep('YardLife', 'BlockLife')
rep("'Your yard'", "'Your block'", 1)
rep('<span>Your yard</span>', '<span>Your block</span>', 1)
rep("'At the yard'", "'Outside'", 1)
rep(".value||'yard'", ".value||'tinyrise'", 1)
rep("'yard-living-shelf'", "'tinyrise-living-shelf'", 2)
rep("'yard-building-v1'", "'tinyrise-building-v1'", 1)
rep("'No earlier YARD autosave", "'No earlier autosave", 1)
rep("'yard-view-v1'", "'tinyrise-view-v1'", 1)
rep("'yard-postcard.png'", "'tinyrise-postcard.png'", 1)
rep("'yard-neighbourhood-v1'", "'tinyrise-neighbourhood-v1'", 1)
rep("'yard-building.json'", "'tinyrise-block.json'", 1)
rep("'That file is too large for a YARD save.'", "'That file is too large for a Tinyrise save.'", 1)
rep("'yard-study.png'", "'tinyrise-study.png'", 1)
rep("'yard-building.glb'", "'tinyrise-building.glb'", 1)
rep('window.yard', 'window.tinyrise')
rep('These are YARD bindings', 'These are Tinyrise bindings', 1)
rep("'yard-city-r14-v1'", "'tinyrise-city-v1'", 1)
rep("'Not a compatible YARD city save.'", "'Not a compatible Tinyrise city save.'", 1)
rep("'Import a YARD city'", "'Import a Tinyrise city'", 1)
rep("'yard-city.json'", "'tinyrise-city.json'", 1)

# Save formats: new IDs everywhere. Legacy files from the working-title era still import.
rep("format:'yard-building'", "format:'tinyrise-building'", 2)
rep("format:'yard-city'", "format:'tinyrise-city'", 1)
rep("if(!data||data.format!=='yard-building'||", "if(!data||fileFormat(data)!=='tinyrise-building'||", 1)
rep("if(!d||d.format!=='yard-building'||", "if(!d||fileFormat(d)!=='tinyrise-building'||", 1)
rep("if(!data||data.format!=='yard-city'||", "if(!data||fileFormat(data)!=='tinyrise-city'||", 1)
rep('const N=12', "const LEGACY_FORMATS={['y'+'ard-building']:'tinyrise-building',['y'+'ard-city']:'tinyrise-city'},fileFormat=d=>LEGACY_FORMATS[d?.format]||d?.format;\nconst N=12", 1)

# Dead helper: referenced an undefined builder and was never called.
s2 = re.sub(r"\n const dash=\(a,b,vertical\)=>\{[^\n]*\n // avoid shadowing builder name in helper\n", "\n", s)
assert s2 != s, 'dash helper not found'
s = s2

# Em dashes out of user-facing strings and comments.
rep('/* VIEW / 03 — camera', '/* VIEW / 03: camera', 1)
rep('/* R9 — a quiet', '/* R9: a quiet', 1)
rep('/* R14 / City Scale Pass 1 — 4x4', '/* R14 / City Scale Pass 1: 4x4', 1)
rep("'Covered or too crowded — this use needs clear space'", "'Covered or too crowded; this use needs clear space'", 1)
rep("'Café is full — waiting for a seat'", "'Café is full, waiting for a seat'", 2)
rep("'Route changed — finding another way'", "'Route changed, finding another way'", 1)
rep("' — needs access'", "' · needs access'", 1)
rep("PROJECT.title+' — '+PROJECT.author", "PROJECT.title+' by '+PROJECT.author", 1)
rep("/* N1 / Foundry Court — a neighbourhood", "/* N1 / Foundry Court: a neighbourhood", 1)
rep("e.name+' — the first visitors are arriving.'", "e.name+': the first visitors are arriving.'", 1)
rep("'built over — reopen it for a community grant'", "'built over; reopen it for a community grant'", 1)

assert '—' not in s, 'em dash left: ' + repr(s[s.index('—')-60:s.index('—')+60])
scrub = re.sub(r'(?i)courtyard|factoryyard|Factory yard', '', s)
left = [scrub[max(0, m.start()-40):m.end()+40] for m in re.finditer(r'(?i)yard', scrub)]
assert not left, 'YARD left: ' + repr(left)

(root / 'index.html').write_text(s, encoding='utf-8')
print('index.html written', len(s), 'bytes; replaced', len(src) - len(s), 'delta')
