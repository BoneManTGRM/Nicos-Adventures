import {test,expect} from '@playwright/test';
test('isolated canvas and composition rendering measurements',async({browser},info)=>{
 const reports=[];
 for(const mode of ['default','transparent-main','default-repeat','raster-disabled']){
  const use=info.project.use;
  const context=await browser.newContext({viewport:use.viewport,deviceScaleFactor:use.deviceScaleFactor,isMobile:use.isMobile,hasTouch:use.hasTouch,locale:use.locale,reducedMotion:'no-preference',serviceWorkers:'allow'});

  const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const get=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=<T extends ArrayBufferView<ArrayBuffer>>(array:T):T=>{if(array instanceof Uint32Array&&array.length===1){array[0]=17;return array;}return get(array);};});
  await page.addInitScript(({mode})=>{
   const probe={frames:0,total:0,max:0,durations:[] as number[]};
   (window as unknown as {truckRenderProbe:typeof probe}).truckRenderProbe=probe;
   const request=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=callback=>request(time=>{const start=performance.now();callback(time);const duration=performance.now()-start;probe.frames++;probe.total+=duration;probe.max=Math.max(probe.max,duration);if(probe.durations.length<3000)probe.durations.push(duration);});
   if(mode==='transparent-main'){
    const get=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,id:string,...args:unknown[]){return Reflect.apply(get,this,[id,id==='2d'&&this.classList.contains('cg-track')?{...(args[0] as object??{}),alpha:true}:args[0]]);} as typeof get;
   }
   if(mode==='raster-disabled'){
    for(const method of ['beginPath','closePath','moveTo','lineTo','arc','ellipse','roundRect','bezierCurveTo','quadraticCurveTo','fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage']){
     Object.defineProperty(CanvasRenderingContext2D.prototype,method,{value:()=>{},configurable:true,writable:true});
    }
   }
  },{mode});
  await page.goto('/?play=monster-garage');await page.getByTestId('garage-drive').click();
  const read=()=>page.locator('.cg-drive').evaluate(el=>{const n=(key:string)=>Number(el.getAttribute(key));return{frames:n('data-frame-count'),total:n('data-frame-total'),slow:n('data-slow-frames'),max:n('data-frame-max'),effects:el.getAttribute('data-effects'),hazards:n('data-hazards'),history:n('data-history'),colliders:n('data-colliders'),artCache:n('data-art-cache'),canvas:{width:el.querySelector('canvas')!.width,height:el.querySelector('canvas')!.height}};});
  await page.waitForTimeout(500);const before=await read(),started=Date.now();await page.keyboard.down('ArrowRight');await page.waitForTimeout(12_000);await page.keyboard.up('ArrowRight');const after=await read();await page.getByTestId('garage-pause').click();
  expect(Date.now()-started).toBeGreaterThanOrEqual(12_000);expect(after.frames-before.frames).toBeGreaterThan(100);expect(after.hazards).toBeLessThanOrEqual(1);expect(after.history).toBeLessThanOrEqual(150);expect(after.colliders).toBeLessThanOrEqual(18);expect(after.artCache).toBeLessThanOrEqual(24);expect(errors).toEqual([]);
  const cpu=await page.evaluate(()=>{const p=(window as unknown as {truckRenderProbe:{frames:number;total:number;max:number;durations:number[]}}).truckRenderProbe;const sorted=[...p.durations].sort((a,b)=>a-b);return{frames:p.frames,meanMs:p.total/p.frames,maxMs:p.max,p95Ms:sorted[Math.floor(sorted.length*.95)]};});
  reports.push({cpu,mode,revision:process.env.GITHUB_SHA,engine:use.browserName,project:info.project.name,actualDevice:false,seed:17,viewport:use.viewport,durationMs:Date.now()-started,before,after,fps:(after.frames-before.frames)/(after.total-before.total),errors});
  await context.close();
 }
 console.log('TRUCK_RENDER_CONTROL '+JSON.stringify(reports));await info.attach('render-control',{body:Buffer.from(JSON.stringify(reports,null,2)),contentType:'application/json'});
});
