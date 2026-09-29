import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {matchesExpectedRelease} from './creative-release.mjs';
const expected=process.env.EXPECTED_SHA,origin='https://nicos-world.com',out='truck-sky-production-proof',key='nicos-world-local-save-v4';
if(!/^[a-f0-9]{40}$/.test(expected??''))throw new Error('Expected exact release SHA');
await mkdir(out,{recursive:true});let release=null;
const deadline=Date.now()+15*60_000;
while(Date.now()<deadline){try{const response=await fetch(`${origin}/release.json?skyProof=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(response.ok){release=await response.json();if(matchesExpectedRelease(release,expected))break;}}catch(error){console.log(error.message);}await new Promise(resolve=>setTimeout(resolve,15000));}
await writeFile(`${out}/release.json`,JSON.stringify(release,null,2));
if(!matchesExpectedRelease(release,expected))throw new Error('Public release does not match the merged candidate');
const results=[];
for(const [engine,type]of [['chromium',chromium],['webkit',webkit]])for(const language of ['en','es-MX']){
 const name=`${engine}-${language}`,browser=await type.launch(),page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:language==='en'?'en-US':'es-MX'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin,{waitUntil:'networkidle'});await page.getByTestId('continue-world').waitFor();
  // Only this disposable browser's local profile is changed, not any existing child profile.
  await page.evaluate(({key,language})=>{const s=JSON.parse(localStorage.getItem(key));const p=s.profiles.find(p=>p.id===s.activeProfileId);p.language=language;p.selectedSection='game-arcade';p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},{key,language});
  await page.reload({waitUntil:'networkidle'});await page.getByTestId('open-monster-garage').click();await page.getByTestId('garage-drive').click();
  await page.locator('.cg-drive[data-sky-count="0"]').waitFor();
  const pedal=await page.locator('[data-control="gas"]').boundingBox();if(!pedal)throw new Error('Gas pedal missing');
  await page.mouse.move(pedal.x+pedal.width/2,pedal.y+pedal.height/2);await page.mouse.down();
  await page.waitForFunction(()=>Number(document.querySelector('[data-testid="garage-distance"]')?.textContent?.replace(/[^0-9]/g,''))>=270,null,{timeout:35000});
  const earlyCount=Number(await page.locator('.cg-drive').getAttribute('data-sky-count'));if(earlyCount!==0)throw new Error('Object spawned before the safe opening ended');
  await page.locator('.cg-drive[data-sky-phase="warning"]').waitFor({timeout:15000});
  const warnedAt=Number((await page.getByTestId('garage-distance').innerText()).replace(/[^0-9]/g,''));if(warnedAt<300)throw new Error('Warning appeared before 300 meters');
  // Keep the actual pedal held so the camera approaches the fixed drop target.
  await page.screenshot({path:`${out}/${name}-warning.png`});
  await page.locator('.cg-drive[data-sky-phase="falling"]').waitFor({timeout:6000});
  await page.waitForTimeout(450);await page.screenshot({path:`${out}/${name}-falling.png`});
  await page.waitForFunction(()=>{const e=document.querySelector('.cg-drive');return Number(e?.getAttribute('data-sky-hits'))+Number(e?.getAttribute('data-sky-dodged'))>=1;},null,{timeout:6000});
  const hits=Number(await page.locator('.cg-drive').getAttribute('data-sky-hits')),dodged=Number(await page.locator('.cg-drive').getAttribute('data-sky-dodged'));
  await page.mouse.up();await page.screenshot({path:`${out}/${name}-outcome.png`});await page.locator('.cg-return').click();
  const bolts=Number(await page.getByTestId('garage-bolts').innerText());if(bolts<=0)throw new Error('Missing earned bolts');
  await page.reload({waitUntil:'networkidle'});await page.getByTestId('open-monster-garage').click();
  if(Number(await page.getByTestId('garage-bolts').innerText())!==bolts)throw new Error('Rewards did not survive reload');
  const saved=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));return s.profiles.find(p=>p.id===s.activeProfileId).creativeGames.garage;},key);
  if(saved.owned.length!==7||saved.resume!==null)throw new Error('Ownership or settlement changed unexpectedly');
  if(errors.length)throw new Error(errors.join('\n'));
  results.push({name,passed:true,sha:release.commitSha,warnedAt,hits,dodged,bolts,starterOnly:true});
 }catch(error){results.push({name,passed:false,error:String(error),errors});await page.mouse.up().catch(()=>{});await page.screenshot({path:`${out}/${name}-failure.png`,fullPage:true}).catch(()=>{});}
 finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
}
console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.passed))process.exitCode=1;
