import type {Drive} from './save';

export const SKY_START_METERS=300;
export const SKY_WARNING_SECONDS=1.6;
export type SkyObject={id:number;kind:0|1|2;phase:'warning'|'falling'|'burst';x:number;y:number;vy:number;radius:number;age:number;hit:boolean};
export type SkyState={nextDistance:number;spawnCount:number;cooldown:number;active:SkyObject|null;hits:number;dodged:number};
export type SkyGeometry={width:number;comX:number;comY:number;wheels:{x:number;y:number;r:number}[];ground:(x:number)=>number};
const finite=(v:unknown,lo:number,hi:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):fallback;
const int=(v:unknown,lo:number,hi:number,fallback=0)=>Math.floor(finite(v,lo,hi,fallback));
const object=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};

/** Legacy mid-run saves get a clear stretch before their first warning. */
export function initialSkyState(distance=0):SkyState {
  return {nextDistance:Math.max(SKY_START_METERS,Math.floor(finite(distance,0,10000,0))+80),spawnCount:0,cooldown:0,active:null,hits:0,dodged:0};
}
export function normalizeSkyState(raw:unknown,distance:number):SkyState {
  const v=object(raw),fallback=initialSkyState(distance),a=object(v.active);
  const valid=['warning','falling','burst'].includes(String(a.phase))&&[a.x,a.y,a.vy,a.age].every(n=>typeof n==='number'&&Number.isFinite(n));
  const active:SkyObject|null=valid?{id:int(a.id,1,1000,1),kind:int(a.kind,0,2) as 0|1|2,phase:a.phase as SkyObject['phase'],x:finite(a.x,40,120900,40),y:finite(a.y,-4000,4000,0),vy:finite(a.vy,0,1800,0),radius:finite(a.radius,16,28,20),age:finite(a.age,0,a.phase==='warning'?SKY_WARNING_SECONDS:a.phase==='burst'?.65:6,0),hit:a.hit===true}:null;
  return {nextDistance:finite(v.nextDistance,SKY_START_METERS,10200,fallback.nextDistance),spawnCount:int(v.spawnCount,0,1000),cooldown:finite(v.cooldown,0,10,0),active,hits:int(v.hits,0,1000),dodged:int(v.dodged,0,1000)};
}
function seed(n:number,track:number){return ((Math.imul(n+1,1103515245)^Math.imul(track+7,12345))>>>0);}
/** The earliest segment/box contact, including fast drops, in [0,1]. */
export function segmentBoxContact(x0:number,y0:number,x1:number,y1:number,left:number,top:number,right:number,bottom:number):number|null {
  let enter=0,exit=1;
  for(const [p,d,min,max]of [[x0,x1-x0,left,right],[y0,y1-y0,top,bottom]]){
    if(Math.abs(d)<1e-8){if(p<min||p>max)return null;continue;}
    const a=(min-p)/d,b=(max-p)/d;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)return null;
  }
  return enter;
}
function carContact(r:Drive,a:SkyObject,previousY:number,g:SkyGeometry):number|null {
  // Rotate the drop segment into the car's local frame; cover body and attached wheels only.
  const c=Math.cos(r.a),s=Math.sin(r.a),x=a.x-r.x;
  const local=(y:number)=>({x:c*x+s*(y-r.y)+g.comX,y:-s*x+c*(y-r.y)+g.comY});
  const p=local(previousY),q=local(a.y),radius=a.radius;
  let first=segmentBoxContact(p.x,p.y,q.x,q.y,-g.width-radius,-66-radius,g.width+radius,14+radius);
  for(const w of g.wheels){
    const dx=Math.abs(a.x-w.x),rad=w.r+radius;if(dx>rad)continue;
    const reach=Math.sqrt(rad*rad-dx*dx),t=segmentBoxContact(a.x,previousY,a.x,a.y,w.x-rad,w.y-reach,w.x+rad,w.y+reach);
    if(t!==null&&(first===null||t<first))first=t;
  }
  return first;
}

/** Distance-gated, deterministic, one-at-a-time obstacles. Never owns wallet/rewards. */
export function tickSkyObjects(r:Drive,dt:number,g:SkyGeometry):SkyObject|null {
  if(r.ended||dt<=0||r.practice)return null;
  const state=r.sky??(r.sky=initialSkyState(r.distance));
  state.cooldown=Math.max(0,state.cooldown-dt);
  if(!state.active){
    // No catch-up barrages or repeated spawns from reversing across the same distance.
    if(r.distance<state.nextDistance||state.cooldown>0||r.contacts===0||Math.abs(r.a)>.65||r.air>.1||r.vx<25)return null;
    const hash=seed(state.spawnCount,r.track);
    const x=r.x+Math.min(800,r.vx*2.45)+(hash%61-30);
    const slope=(g.ground(x+30)-g.ground(x-30))/60;
    if(Math.abs(slope)>.4)return null;
    state.spawnCount++;
    state.nextDistance=r.distance+100+hash%61;
    state.active={id:state.spawnCount,kind:(hash%3) as 0|1|2,phase:'warning',x,y:Math.min(r.y-260,-20),vy:80,radius:20+hash%3*2,age:0,hit:false};
    return null;
  }
  const a=state.active;
  a.age+=dt;
  if(a.phase==='warning'){
    if(a.age>=SKY_WARNING_SECONDS){a.phase='falling';a.age=0;}
    return null;
  }
  if(a.phase==='burst'){
    if(a.age>=.65){state.active=null;state.cooldown=8;}
    return null;
  }
  const previousY=a.y;a.vy=Math.min(1600,a.vy+680*dt);a.y+=a.vy*dt;
  const groundY=g.ground(a.x)-a.radius;
  const groundT=a.y>=groundY?Math.max(0,(groundY-previousY)/Math.max(.0001,a.y-previousY)):null;
  const hitT=carContact(r,a,previousY,g);
  if(!a.hit&&hitT!==null&&(groundT===null||hitT<=groundT)){
    a.y=previousY+(a.y-previousY)*hitT;a.phase='burst';a.age=0;a.hit=true;state.hits++;
    return {...a};
  }
  if(groundT!==null||a.age>6){a.y=groundY;a.phase='burst';a.age=0;state.dodged++;}
  return null;
}
