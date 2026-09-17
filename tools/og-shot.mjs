// Renders og-image.png (1200x630) from the real game: property view with the city
// around it, UI hidden. node tools/og-shot.mjs [file.html] [out.png]
import {launch, sleep, until} from './cdp.mjs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const file = process.argv[2] || 'index.html';
const out = process.argv[3] || 'og-image.png';
const page = await launch({port: +(process.env.PORT || 9350), width: 1200, height: 630});
try {
  await page.goto(pathToFileURL(resolve(file)).href + '?og=1');
  await until(() => page.eval(`!!window.tinyrise?.ready && getComputedStyle(document.getElementById('loading')).display==='none'`), {timeout: 40000, label: 'boot'});
  await sleep(1000);
  await page.eval(`(()=>{const T=window.tinyrise;const pick=${process.env.BLOCK || -1};
    if(pick>=0)T.city.select(pick,true);else{let best=T.city.active,n=0;T.city.blocks.forEach((b,i)=>{if(${process.env.INTERIOR||1}&&![5,6,9,10].includes(i))return;const c=b.study.cells.reduce((a,v)=>a+(v?1:0),0);if(c>n){n=c;best=i;}});T.city.select(best,true);}
    T.city.edit();document.body.classList.add('photo');document.getElementById('cityHud').style.display='none';document.getElementById('exitPhoto').style.display='none';
    if(T.living.sim)T.living.sim.hour=${process.env.HOUR || 12};
    T.view.setCameraMode('${process.env.MODE || 'ortho'}');})()`);
  await sleep(2500);
  await page.eval(`(()=>{const T=window.tinyrise;T.camera.yaw=${process.env.YAW || .78};T.camera.pitch=${process.env.PITCH || .56};T.camera.span=${process.env.SPAN || 34};T.camera.target=[${process.env.TARGET || '1,4,1'}];if(T.living.sim)T.living.sim.hour=${process.env.HOUR || 12};T.camera.update();T.redraw();})()`);
  await sleep(2500);
  await page.eval(`window.tinyrise.redraw()`); await sleep(800);
  await page.shot(out);
  console.log('wrote', out);
} finally { page.kill(); }
