// Tinyrise QA: boots the exact index.html headless (SwiftShader WebGL2) and runs the
// city loop the handoff demands: edit A, switch to B, edit B, return to A, undo, export,
// import, legacy import, reload persistence, M key, mobile layout. Fails loudly.
// node tools/verify.mjs [file.html]   (env: PORT)
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const file = process.argv[2] || 'index.html';
const url = pathToFileURL(resolve(file)).href + '?qa=' + Date.now();
const port = +(process.env.PORT || 9340);
let fails = 0, passes = 0;
const check = (ok, msg) => { if (ok) { passes++; console.log('  ok   ' + msg); } else { fails++; console.log('  FAIL ' + msg); } };

const page = await launch({port, width: 1440, height: 900});
const boot = async () => {
  await page.goto(url);
  await until(() => page.eval(`!!window.tinyrise?.ready && getComputedStyle(document.getElementById('loading')).display==='none'`), {timeout: 40000, label: 'boot'});
  await sleep(1500);
};
const cells = () => page.eval(`window.tinyrise.world.cells.reduce((n,v)=>n+(v?1:0),0)`);
const firstEmptyGround = () => page.eval(`(()=>{const T=window.tinyrise,N=12;for(let z=0;z<N;z++)for(let x=0;x<N;x++)if(!T.world.get(x,0,z)&&!T.world.get(x,1,z))return [x,0,z];return null;})()`);
const addCell = async () => {
  const c = await firstEmptyGround();
  if (!c) throw new Error('no empty ground cell');
  const ok = await page.eval(`window.tinyrise.living.transaction(()=>window.tinyrise.world.set(${c[0]},${c[1]},${c[2]},1),[[${c}]])`);
  await sleep(300);
  return ok;
};

try {
  await boot();
  const errs = () => page.logs.filter(l => l.startsWith('EXCEPTION') || l.startsWith('error'));
  const head = await page.eval(`({title:document.title,brand:document.querySelector('.brand strong').textContent,app:document.querySelector('meta[name=application-name]').content,og:document.querySelector('meta[property="og:image"]').content,loadingText:document.querySelector('#loading strong').textContent,creditsTitle:document.getElementById('creditsTitle').textContent,version:window.tinyrise.version,backend:window.tinyrise.stats().backend})`);
  console.log(JSON.stringify(head));
  check(head.title === 'Tinyrise by Tront | tront.xyz', 'title is Tinyrise');
  check(head.brand === 'Tinyrise' && head.creditsTitle === 'Tinyrise' && head.loadingText.startsWith('Tinyrise'), 'brand, credits and loading screen say Tinyrise');
  check(head.og === 'https://tront.xyz/tinyrise/og-image.png?v=1', 'og:image points at tront.xyz/tinyrise');
  check(head.backend.startsWith('WebGL2'), 'WebGL2 backend: ' + head.backend);
  check(!/yard/i.test(document_text(await page.eval(`document.body.innerText`))), 'no YARD in visible page text');
  check(errs().length === 0, 'no console exceptions after boot');

  const st = await page.eval(`window.tinyrise.city.stats`);
  check(st.properties === 16 && st.overview === true, 'city: 16 properties, boots in overview');
  await page.shot('tools/out/qa-1-overview.png');

  // Edit A, switch to B, edit B, return to A. Exact persistence.
  const A = await page.eval(`window.tinyrise.city.active`);
  const B = (A + 5) % 16;
  await page.eval(`window.tinyrise.city.edit()`); await sleep(800);
  const a0 = await cells();
  check(await addCell(), 'add cell on block A');
  const a1 = await cells();
  check(a1 === a0 + 1, `block A cell count ${a0} -> ${a1}`);
  await page.shot('tools/out/qa-2-propertyA.png');

  check(await page.eval(`window.tinyrise.city.select(${B},true)`), 'select block B');
  await sleep(800);
  check((await page.eval(`window.tinyrise.city.active`)) === B, 'active is B');
  const b0 = await cells();
  check(await addCell(), 'add cell on block B');
  const b1 = await cells();
  check(b1 === b0 + 1, `block B cell count ${b0} -> ${b1}`);

  await page.eval(`window.tinyrise.city.select(${A},true)`); await sleep(800);
  check((await cells()) === a1, 'return to A: edit persisted exactly');
  await page.eval(`window.tinyrise.city.select(${B},true)`); await sleep(800);
  check((await cells()) === b1, 'return to B: edit persisted exactly');

  // Undo survives the switch (stack stashed per block).
  await page.eval(`document.getElementById('undoBtn').click()`); await sleep(500);
  const bu = await cells();
  check(bu === b0, `undo on B after switching: ${b1} -> ${bu} (expected ${b0})`);
  await page.eval(`document.getElementById('redoBtn').click()`); await sleep(500);
  check((await cells()) === b1, 'redo on B restores the edit');

  // Whole-city export / import roundtrip.
  const exp = await page.eval(`(()=>{const d=window.tinyrise.city.exportData();return {format:d.format,version:d.version,blocks:d.blocks.length,blockFormat:d.blocks[0].format,json:JSON.stringify(d)};})()`);
  check(exp.format === 'tinyrise-city' && exp.version === 1 && exp.blocks === 16, 'city export: tinyrise-city v1 with 16 blocks');
  check(exp.blockFormat === 'tinyrise-building', 'block export format is tinyrise-building');
  check(!/yard/i.test(exp.json.replace(/courtyard|factoryyard/gi, '')), 'no YARD in exported JSON');
  await page.eval(`window.tinyrise.city.importData(JSON.parse(${JSON.stringify(exp.json)}))`); await sleep(1000);
  await page.eval(`window.tinyrise.city.select(${A},true)`); await sleep(500);
  check((await cells()) === a1, 'after import: block A intact');
  await page.eval(`window.tinyrise.city.select(${B},true)`); await sleep(500);
  check((await cells()) === b1, 'after import: block B intact');

  // Legacy working-title files still import.
  const legacy = exp.json.replace(/"tinyrise-city"/g, '"yard-city"').replace(/"tinyrise-building"/g, '"yard-building"');
  const legacyOk = await page.eval(`(()=>{try{window.tinyrise.city.importData(JSON.parse(${JSON.stringify(legacy)}));return true;}catch(e){return e.message;}})()`);
  check(legacyOk === true, 'legacy yard-city / yard-building JSON imports: ' + legacyOk);
  const singleLegacy = await page.eval(`(()=>{try{const s=window.tinyrise.exportStudy();s.format='yard-building';window.tinyrise.living.parseStudy(s);return true;}catch(e){return e.message;}})()`);
  check(singleLegacy === true, 'legacy single-building JSON parses: ' + singleLegacy);

  // Reload: localStorage restore keeps both edits.
  await sleep(800); // autosave debounce
  await boot();
  const st2 = await page.eval(`window.tinyrise.city.stats`);
  check(st2.restored === true, 'reload: city restored from localStorage');
  await page.eval(`window.tinyrise.city.select(${A},true)`); await sleep(500);
  check((await cells()) === a1, 'reload: block A edit survived');
  await page.eval(`window.tinyrise.city.select(${B},true)`); await sleep(500);
  check((await cells()) === b1, 'reload: block B edit survived');
  check((await page.eval(`Object.keys(localStorage).join(' ')`)).includes('tinyrise-city-v1'), 'localStorage uses tinyrise-* keys: ' + await page.eval(`Object.keys(localStorage).join(' ')`));

  // M toggles overview from the keyboard.
  await page.front();
  const before = await page.eval(`window.tinyrise.city.stats.overview`);
  await page.eval(`window.dispatchEvent(new KeyboardEvent('keydown',{key:'m',bubbles:true}))`); await sleep(400);
  const after = await page.eval(`window.tinyrise.city.stats.overview`);
  check(before !== after, `M key toggles overview (${before} -> ${after})`);

  // Neighbourhood sim is alive on the active block.
  await page.eval(`window.tinyrise.city.edit()`); await sleep(300);
  const sim = await page.eval(`(()=>{const s=window.tinyrise.living.sim;return {ok:!!s,people:s?.people?.length??s?.agents?.length??null}})()`);
  check(sim.ok, 'living simulation object present (' + JSON.stringify(sim) + ')');
  await page.shot('tools/out/qa-3-propertyB.png');

  // Credits dialog opens and is rebranded.
  await page.eval(`window.tinyrise.ui.openCredits()`); await sleep(400);
  const credits = await page.eval(`document.getElementById('credits').innerText`);
  check(/Tinyrise/.test(credits) && !/yard/i.test(credits.replace(/courtyard/gi, '')) && /Miniopolis/.test(credits) && /Townscaper/.test(credits), 'credits: Tinyrise, inspirations intact, no YARD');
  await page.shot('tools/out/qa-4-credits.png');
  await page.eval(`document.getElementById('credits').close()`);

  check(errs().length === 0, 'no console exceptions during the whole run');
} catch (e) {
  fails++; console.log('  FAIL harness: ' + e.message);
} finally {
  const bad = page.logs.filter(l => l.startsWith('EXCEPTION') || l.startsWith('error'));
  if (bad.length) console.log('CONSOLE:\n' + bad.join('\n'));
  page.kill();
}
// Mobile layout pass in a fresh window.
const m = await launch({port: port + 1, width: 390, height: 844});
try {
  await m.goto(url + '&m=1');
  await until(() => m.eval(`!!window.tinyrise?.ready && getComputedStyle(document.getElementById('loading')).display==='none'`), {timeout: 40000, label: 'mobile boot'});
  await sleep(1500);
  const over = await m.eval(`(()=>{const w=document.documentElement.clientWidth;return [...document.querySelectorAll('.chrome,#cityHud')].filter(e=>e.offsetParent!==null&&e.getBoundingClientRect().right>w+1).map(e=>e.id||e.className)})()`);
  check(over.length === 0, 'mobile: no chrome overflows 390px (' + over.join(',') + ')');
  await m.shot('tools/out/qa-5-mobile-overview.png');
  await m.eval(`window.tinyrise.city.edit()`); await sleep(800);
  await m.shot('tools/out/qa-6-mobile-property.png');
} catch (e) { fails++; console.log('  FAIL mobile: ' + e.message); } finally { m.kill(); }

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);

function document_text(t) { return t.replace(/courtyard|factory yard/gi, ''); }
