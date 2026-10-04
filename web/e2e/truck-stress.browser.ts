import {test,expect} from '@playwright/test';
test('600 real seconds of truck chaos/reset/navigation with frame and resource measurements',async({page},info)=>{
 const errors:string[]=[],assets:string[]=[],samples:{frames:number;slow:number;total:number;max:number;hazards:number;debris:number;history:number;colliders:number;fragments:number;sounds:number;artCache:number;listeners:number;effects:string}[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&/\.(?:js|css|png|webp|svg)(?:\?|$)/.test(r.url()))assets.push(r.url()+':'+r.status());});
 await page.addInitScript(()=>{
  const installed=new Set<string>(),ids=new WeakMap<object,number>();let next=0;
  const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
  const key=(target:EventTarget,type:string,callback:EventListenerOrEventListenerObject|null,options?:boolean|AddEventListenerOptions)=>{if((target!==window&&target!==document)||!callback)return '';if(!ids.has(callback))ids.set(callback,++next);const capture=typeof options==='boolean'?options:!!options?.capture;return (target===window?'w':'d')+':'+type+':'+ids.get(callback)+':'+capture;};
  EventTarget.prototype.addEventListener=function(type,callback,options){const k=key(this,type,callback,options);if(k)installed.add(k);add.call(this,type,callback,options);};
  EventTarget.prototype.removeEventListener=function(type,callback,options){const k=key(this,type,callback,options);if(k)installed.delete(k);remove.call(this,type,callback,options);};
  Object.defineProperty(window,'__truckGlobalListeners',{get:()=>installed.size});
 });
 const rafProbe=()=>page.evaluate(()=>new Promise<{frames:number;durationMs:number;meanMs:number;maxMs:number}>(resolve=>{let last=0,start=0;const gaps:number[]=[];const sample=(now:number)=>{if(!start)start=now;if(last)gaps.push(now-last);last=now;if(now-start>=2000)resolve({frames:gaps.length,durationMs:now-start,meanMs:gaps.reduce((a,b)=>a+b,0)/gaps.length,maxMs:Math.max(...gaps)});else requestAnimationFrame(sample);};requestAnimationFrame(sample);}));
 await page.goto('about:blank');const blankFrameCadence=await rafProbe();
 await page.goto('/?play=monster-garage');await expect(page.getByTestId('garage-drive')).toBeVisible();await page.getByTestId('garage-drive').click();await page.keyboard.down('ArrowRight');
 const start=Date.now();let iterations=0,resets=0,navigations=0,rotations=0,pauses=0,baseline=0;
 while(Date.now()-start<600_000){
  await page.waitForTimeout(1000);iterations++;
  const drive=page.locator('.cg-drive');
  if(await drive.count()){
   const s=await drive.evaluate(el=>{const n=(key:string)=>Number(el.getAttribute(key));return {frames:n('data-frame-count'),slow:n('data-slow-frames'),total:n('data-frame-total'),max:n('data-frame-max'),hazards:n('data-hazards'),debris:n('data-debris'),history:n('data-history'),colliders:n('data-colliders'),fragments:n('data-fragments'),sounds:n('data-sounds'),artCache:n('data-art-cache'),listeners:Number((window as unknown as {__truckGlobalListeners:number}).__truckGlobalListeners),effects:el.getAttribute('data-effects')!};});
   samples.push(s);if(!baseline)baseline=s.listeners;expect(s.hazards).toBeLessThanOrEqual(1);expect(s.debris).toBeLessThanOrEqual(22);expect(s.history).toBeLessThanOrEqual(150);expect(s.colliders).toBeLessThanOrEqual(18);expect(s.fragments).toBeLessThanOrEqual(8);expect(s.sounds).toBeLessThanOrEqual(4);expect(s.artCache).toBeLessThanOrEqual(24);expect(s.listeners).toBeLessThanOrEqual(baseline+12);
  }
  if(await page.locator('.cg-crash-card').count()){await page.keyboard.up('ArrowRight');await page.getByTestId('garage-race-again').click();await page.keyboard.down('ArrowRight');resets++;continue;}
  if(iterations%37===0){
   await page.keyboard.up('ArrowRight');await page.keyboard.up('ShiftLeft');await page.keyboard.up('ArrowLeft');await page.locator('.cg-return').click();await page.locator('.cg-topbar button').click();await expect(page.getByTestId('open-rainbow-kingdom')).toBeVisible();await page.getByTestId('open-monster-garage').click();await page.getByTestId('garage-drive').click();await page.keyboard.down('ArrowRight');navigations++;resets++;
  }else if(iterations%29===0){
   await page.keyboard.up('ArrowRight');await page.keyboard.up('ShiftLeft');await page.getByTestId('garage-pause').click();const time=await drive.getAttribute('data-active-seconds');await page.waitForTimeout(300);expect(await drive.getAttribute('data-active-seconds')).toBe(time);await page.getByTestId('garage-recover').click();await expect(drive).toHaveAttribute('data-sky-phase','none');await page.keyboard.down('ArrowRight');pauses++;resets++;
  }else if(iterations%23===0){await page.setViewportSize(rotations%2?{width:390,height:844}:{width:844,height:390});rotations++;}
  else if(iterations%19===0){await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('.cg-pause-card')).toBeVisible();const before=await drive.getAttribute('data-active-seconds');await page.waitForTimeout(200);expect(await drive.getAttribute('data-active-seconds')).toBe(before);await page.keyboard.up('ArrowRight');await page.keyboard.up('ShiftLeft');await page.getByTestId('garage-pause').click();await page.keyboard.down('ArrowRight');pauses++;}
  else if(iterations%11===0){await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');await page.waitForTimeout(100);await page.keyboard.up('ArrowLeft');await page.keyboard.down('ArrowRight');}
  else if(iterations%7===0){await page.keyboard.down('ShiftLeft');await page.waitForTimeout(300);await page.keyboard.up('ShiftLeft');}
 }
 await page.keyboard.up('ArrowRight');await page.keyboard.up('ShiftLeft');await page.keyboard.up('ArrowLeft');
 expect(errors).toEqual([]);expect(assets).toEqual([]);expect(Date.now()-start).toBeGreaterThanOrEqual(600_000);expect(navigations).toBeGreaterThanOrEqual(10);expect(rotations).toBeGreaterThanOrEqual(10);
 const report={blankFrameCadence,revision:process.env.GITHUB_SHA,project:info.project.name,engine:info.project.use.browserName,viewport:info.project.use.viewport,actualDevice:false,durationMs:Date.now()-start,iterations,resets,navigations,rotations,pauses,errors,assets,samples};
 console.log('TRUCK_STRESS '+JSON.stringify(report));await info.attach('truck-stress-metrics',{body:Buffer.from(JSON.stringify(report,null,2)),contentType:'application/json'});
});
