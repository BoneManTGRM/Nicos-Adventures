import {chromium,webkit} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const out='truck-returning-proof',origin='https://nicos-world.com',api='https://api.github.com/repos/BoneManTGRM/Nicos-Adventures',key='nicos-world-local-save-v4';
const source=process.env.PR_HEAD_SHA;if(!/^[a-f0-9]{40}$/.test(source??''))throw Error('Exact PR source required');
await mkdir(out,{recursive:true});const clients=[],results=[];let mergedSha=null;
const get=async url=>{const r=await fetch(url,{headers:url.startsWith(api)?{Accept:'application/vnd.github+json',...(process.env.GITHUB_TOKEN?{Authorization:'Bearer '+process.env.GITHUB_TOKEN}:{})}:{},signal:AbortSignal.timeout(15000),cache:'no-store'});if(!r.ok)throw Error(url+':'+r.status);return r.json();};
try{
 const beforeRelease=await get(origin+'/release.json');
 for(const [engine,type]of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch(),context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'allow'}),page=await context.newPage();
  await page.goto(origin,{waitUntil:'networkidle'});await page.getByTestId('continue-world').waitFor();
  await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));const p=s.profiles.find(p=>p.id===s.activeProfileId);p.selectedSection='game-arcade';p.language='en';p.nico.speechEnabled=false;localStorage.setItem(key,JSON.stringify(s));},key);
  await page.reload({waitUntil:'networkidle'});await page.getByTestId('open-monster-garage').click();await page.getByTestId('garage-drive').waitFor();
  const original=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));const p=s.profiles.find(p=>p.id===s.activeProfileId);p.creativeGames.garage.bolts=777;p.creativeGames.garage.blueprints=[{...p.creativeGames.garage.build,name:'Returning client fixture',paint:3}];localStorage.setItem(key,JSON.stringify(s));return {id:p.id,garage:p.creativeGames.garage};},key);
  await page.reload({waitUntil:'networkidle'});const cache=await page.evaluate(async()=>({controlled:!!navigator.serviceWorker?.controller,registrations:navigator.serviceWorker?((await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,active:r.active?.scriptURL}))):[],caches:typeof caches==='undefined'?[]:await caches.keys(),scripts:[...document.scripts].map(s=>s.src).filter(Boolean)}));
  await page.screenshot({path:out+'/'+engine+'-before.png'});await page.close();clients.push({engine,browser,context,original,cache}); // Same browser/context/cache survives until release; no storage clearing or bypass query.
 }
 await writeFile(out+'/baseline.json',JSON.stringify({source,release:beforeRelease,clients:clients.map(({engine,original,cache})=>({engine,original,cache})),actualDevice:false},null,2));
 const deadline=Date.now()+40*60_000;
 while(Date.now()<deadline){
  const pr=await get(api+'/pulls/159');if(pr.head.sha!==source){console.log('Returning-client observation superseded by a new PR head');break;}
  if(pr.merged){mergedSha=pr.merge_commit_sha;const release=await get(origin+'/release.json');if(release.commitSha===mergedSha)break;console.log('Waiting for merged release '+mergedSha+'; saw '+release.commitSha);}
  else console.log('Keeping existing cached clients while exact source is qualified; no merge performed by this observer.');
  await new Promise(resolve=>setTimeout(resolve,15000));
 }
 if(!mergedSha){await writeFile(out+'/results.json',JSON.stringify({status:'PENDING_NO_MERGE',source,verified:false},null,2));console.log('No production update observed; returning acceptance remains pending.');}
 else{
  const release=await get(origin+'/release.json');if(release.commitSha!==mergedSha)throw Error('Merged revision is not on the real domain');
  for(const client of clients){const page=await client.context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin,{waitUntil:'networkidle'});await page.getByTestId('open-monster-garage').waitFor();await page.getByTestId('open-monster-garage').click();await page.getByTestId('garage-drive').waitFor();
   const returned=await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));const p=s.profiles.find(p=>p.id===s.activeProfileId);return{id:p.id,garage:p.creativeGames.garage};},key);
   if(returned.id!==client.original.id||returned.garage.bolts!==777||JSON.stringify(returned.garage.blueprints)!==JSON.stringify(client.original.garage.blueprints)||JSON.stringify(returned.garage.owned)!==JSON.stringify(client.original.garage.owned))throw Error(client.engine+' cached-return save mismatch');
   await page.getByTestId('garage-drive').click();await page.locator('.cg-drive[data-health]').waitFor();await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('.cg-drive')?.getAttribute('data-active-seconds'))>=20,{},{timeout:35000});await page.getByTestId('sky-warning').waitFor({timeout:15000});await page.screenshot({path:out+'/'+client.engine+'-returned-warning.png'});await page.keyboard.up('ArrowRight');
   await page.getByTestId('garage-pause').click();const active=await page.locator('.cg-drive').getAttribute('data-active-seconds');await page.waitForTimeout(300);if(await page.locator('.cg-drive').getAttribute('data-active-seconds')!==active)throw Error('Paused timer changed');
   await page.locator('.cg-return').click();const bolts=Number(await page.getByTestId('garage-bolts').innerText());if(bolts<=777)throw Error('New rewards not banked');await page.reload({waitUntil:'networkidle'});await page.getByTestId('open-monster-garage').click();if(Number(await page.getByTestId('garage-bolts').innerText())!==bolts)throw Error('Returned earned progress did not persist');if(errors.length)throw Error(errors.join('\n'));
   results.push({engine:client.engine,actualDevice:false,source,mergedSha,release,previousRelease:beforeRelease,previousCache:client.cache,sameBrowserContext:true,normalNavigationWithoutBypass:true,savesPreserved:true,newHealthWarningBankReload:true,bolts,errors});
  }
  await writeFile(out+'/results.json',JSON.stringify({status:'VERIFIED',results},null,2));console.log('TRUCK_RETURNING '+JSON.stringify(results));
 }
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({source,mergedSha,error:String(error)},null,2));throw error;}
finally{for(const c of clients)await c.browser.close();}
