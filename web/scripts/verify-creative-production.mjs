import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {matchesExpectedRelease} from './creative-release.mjs';
const expected=process.env.EXPECTED_SHA;
if(!/^[a-f0-9]{40}$/.test(expected??''))throw new Error('EXPECTED_SHA must identify the exact merged commit.');
const origin='https://nicos-world.com',out='creative-production-proof',key='nicos-world-local-save-v4';
await mkdir(out,{recursive:true});
let release=null;const deadline=Date.now()+15*60_000;
while(Date.now()<deadline){
 try{const response=await fetch(`${origin}/release.json?verification=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(response.ok){release=await response.json();if(matchesExpectedRelease(release,expected))break;}}catch(error){console.log('Waiting for production:',error.message);}
 console.log(`Awaiting ${expected}; observed ${release?.commitSha??'no release'}`);await new Promise(resolve=>setTimeout(resolve,15000));
}
await writeFile(`${out}/release.json`,JSON.stringify(release,null,2));
if(!matchesExpectedRelease(release,expected))throw new Error(`Production did not serve the approved commit: ${release?.commitSha??'unavailable'}`);
const results=[];
for(const [engine,type]of [['chromium',chromium],['webkit',webkit]])for(const language of ['en','es-MX']){
 const name=`${engine}-${language}`,browser=await type.launch(),context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:language==='en'?'en-US':'es-MX'}),page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(origin,{waitUntil:'networkidle'});await page.getByTestId('continue-world').waitFor();
  // Only the disposable browser's own profile is changed; no server-side child data exists.
  await page.evaluate(({key,language})=>{const s=JSON.parse(localStorage.getItem(key));const p=s.profiles.find(p=>p.id===s.activeProfileId);p.selectedSection='game-arcade';p.language=language;p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,language});
  await page.reload({waitUntil:'networkidle'});await page.getByTestId('open-monster-garage').waitFor();await page.getByTestId('open-rainbow-kingdom').waitFor();
  await page.screenshot({path:`${out}/${name}-arcade.png`,fullPage:true});
  await page.getByTestId('open-monster-garage').click();await page.getByTestId('garage-drive').waitFor();
  await page.screenshot({path:`${out}/${name}-garage.png`,fullPage:true});
  await page.getByTestId('garage-drive').click();await page.keyboard.down('ArrowRight');await page.waitForTimeout(3000);await page.keyboard.up('ArrowRight');
  const distance=Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''));if(distance<=2)throw new Error(`Vehicle did not travel: ${distance}`);
  await page.screenshot({path:`${out}/${name}-drive.png`});await page.locator('.cg-return').click();
  const bolts=Number(await page.getByTestId('garage-bolts').innerText());if(bolts<=0)throw new Error('Completed drive did not bank earned rewards');
  await page.reload({waitUntil:'networkidle'});await page.getByTestId('open-monster-garage').click();if(Number(await page.getByTestId('garage-bolts').innerText())!==bolts)throw new Error('Garage rewards did not survive reload');
  await page.locator('.cg-topbar button').click();await page.getByTestId('open-rainbow-kingdom').click();
  await page.locator('[data-magic-id="2"]').click();await page.locator('[data-build-pad="0"]').click();
  await page.getByRole('button',{name:language==='en'?'Set up starter course':'Preparar camino inicial',exact:true}).click();
  await page.screenshot({path:`${out}/${name}-kingdom.png`,fullPage:true});await page.getByTestId('kingdom-ride').click();
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(800);await page.keyboard.up('ArrowRight');
  const x=Number(await page.getByTestId('kingdom-stage').getAttribute('data-world-x'));if(x<=100)throw new Error('Unicorn controls did not move the character');
  await page.screenshot({path:`${out}/${name}-ride.png`});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);if(overflow>2)throw new Error(`Phone page overflow: ${overflow}`);
  if(errors.length)throw new Error(errors.join('\n'));
  results.push({name,passed:true,distance,bolts,unicornX:x,sha:release.commitSha});
 }catch(error){results.push({name,passed:false,error:String(error),errors});await page.screenshot({path:`${out}/${name}-failure.png`,fullPage:true}).catch(()=>{});}
 finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
}
console.log(JSON.stringify(results,null,2));if(results.some(result=>!result.passed))process.exitCode=1;
