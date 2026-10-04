import {test,expect} from '@playwright/test';
test('paired traced and untraced real truck rendering measurements',async({browser},info)=>{
 const reports=[];
 for(const mode of ['untraced','traced','untraced-repeat']){
  const use=info.project.use;
  const context=await browser.newContext({viewport:use.viewport,deviceScaleFactor:use.deviceScaleFactor,isMobile:use.isMobile,hasTouch:use.hasTouch,locale:use.locale,reducedMotion:'no-preference',serviceWorkers:'allow'});
  if(mode==='traced')await context.tracing.start({screenshots:true,snapshots:true});
  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const get=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=<T extends ArrayBufferView<ArrayBuffer>>(array:T):T=>{if(array instanceof Uint32Array&&array.length===1){array[0]=17;return array;}return get(array);};});
  await page.goto('/?play=monster-garage');await page.getByTestId('garage-drive').click();
  const read=()=>page.locator('.cg-drive').evaluate(el=>{const n=(key:string)=>Number(el.getAttribute(key));return{frames:n('data-frame-count'),total:n('data-frame-total'),slow:n('data-slow-frames'),max:n('data-frame-max'),effects:el.getAttribute('data-effects'),hazards:n('data-hazards'),history:n('data-history'),colliders:n('data-colliders'),canvas:{width:el.querySelector('canvas')!.width,height:el.querySelector('canvas')!.height}};});
  await page.waitForTimeout(500);const before=await read(),started=Date.now();await page.keyboard.down('ArrowRight');await page.waitForTimeout(12_000);await page.keyboard.up('ArrowRight');const after=await read();await page.getByTestId('garage-pause').click();
  expect(Date.now()-started).toBeGreaterThanOrEqual(12_000);expect(after.frames-before.frames).toBeGreaterThan(100);expect(after.hazards).toBeLessThanOrEqual(1);expect(after.history).toBeLessThanOrEqual(150);expect(after.colliders).toBeLessThanOrEqual(18);expect(errors).toEqual([]);
  reports.push({mode,revision:process.env.GITHUB_SHA,engine:use.browserName,project:info.project.name,actualDevice:false,seed:17,viewport:use.viewport,durationMs:Date.now()-started,before,after,fps:(after.frames-before.frames)/(after.total-before.total),errors});
  if(mode==='traced')await context.tracing.stop();await context.close();
 }
 console.log('TRUCK_RENDER_CONTROL '+JSON.stringify(reports));await info.attach('render-control',{body:Buffer.from(JSON.stringify(reports,null,2)),contentType:'application/json'});
});
