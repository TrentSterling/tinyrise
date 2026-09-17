// Boots an HTML build headless, waits for first frame, dumps console + stats, screenshots.
// node tools/smoke.mjs <file.html> <outprefix>
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const file = process.argv[2] || 'index.html';
const prefix = process.argv[3] || 'smoke';
const port = +(process.env.PORT || 9333);
const page = await launch({port, width: 1440, height: 900});
try {
  await page.goto(pathToFileURL(resolve(file)).href);
  await until(async () => page.eval(`!!window.tinyrise && getComputedStyle(document.getElementById('loading')).display==='none'`), {timeout: 40000, label: 'boot'});
  await sleep(2500);
  const info = await page.eval(`(()=>{const s=window.tinyrise.stats();return {backend:s.backend,triangles:s.triangles,faces:s.faces,frames:s.frames,rebuildMs:s.rebuildMs,city:window.tinyrise.city?window.tinyrise.city.stats:null,title:document.title,health:window.tinyrise.debug?.health?.()}})()`);
  console.log(JSON.stringify(info, null, 1));
  await page.shot(`tools/out/${prefix}-1-boot.png`);
  if (info.city) {
    await page.eval(`window.tinyrise.city.edit()`); await sleep(1500);
    await page.shot(`tools/out/${prefix}-2-property.png`);
    await page.eval(`window.tinyrise.city.overview()`); await sleep(1500);
    await page.shot(`tools/out/${prefix}-3-overview.png`);
  }
  await page.eval(`document.querySelector('.menu-button')?.click()`); await sleep(600);
  await page.shot(`tools/out/${prefix}-4-menu.png`);
} finally {
  console.log('LOGS:\n' + page.logs.join('\n'));
  page.kill();
}
