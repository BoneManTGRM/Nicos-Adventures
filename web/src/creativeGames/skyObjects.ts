import type {Drive} from './save';
import {smashNearby,COURSE_SMASH} from './smashObjects';
import {nextSeed} from './gameplayRng';
import {rewardAction} from './survival';
export const SKY_START_METERS=300,SKY_START_SECONDS=20,SKY_WARNING_SECONDS=1.6;
export type SkyObject={id:number;kind:0|1|2|3;phase:'warning'|'falling'|'burst';x:number;y:number;vy:number;radius:number;age:number;hit:boolean;vx?:number;gravity?:number;warning?:number;targetX?:number;targetY?:number;originX?:number;originY?:number;threatened?:boolean;closest?:number;safeAction?:'brake'|'gas'};
export type SkyState={nextDistance:number;spawnCount:number;cooldown:number;active:SkyObject|null;hits:number;dodged:number;seed?:number;rng?:number;nextAttempt?:number;burstRemaining?:number};
export type SkyGeometry={width:number;comX:number;comY:number;wheels:{x:number;y:number;r:number}[];ground:(x:number)=>number;speed?:number};
const finite=(v:unknown,lo:number,hi:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):fallback;
const int=(v:unknown,lo:number,hi:number,fallback=0)=>Math.floor(finite(v,lo,hi,fallback));
const object=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
export function initialSkyState(distance=0,seed=1):SkyState{return {nextDistance:Math.max(SKY_START_METERS,Math.floor(finite(distance,0,10000,0))+80),spawnCount:0,cooldown:0,active:null,hits:0,dodged:0,seed:seed>>>0||1,rng:seed>>>0||1,nextAttempt:0,burstRemaining:0};}
export function normalizeSkyState(raw:unknown,distance:number):SkyState{
 const v=object(raw),fallback=initialSkyState(distance,int(v.seed,1,0xffffffff,1)),a=object(v.active);
 const valid=['warning','falling','burst'].includes(String(a.phase))&&[a.x,a.y,a.vy,a.age].every(n=>typeof n==='number'&&Number.isFinite(n));
 let active:SkyObject|null=null;
 if(valid){
  active={id:int(a.id,1,1000,1),kind:int(a.kind,0,3) as SkyObject['kind'],phase:a.phase as SkyObject['phase'],x:finite(a.x,0,121000,40),y:finite(a.y,-4000,4000,0),vy:finite(a.vy,0,1800,0),radius:finite(a.radius,16,42,20),age:finite(a.age,0,a.phase==='warning'?3:a.phase==='burst'?.65:6,0),hit:a.hit===true};
  // Preserve old committed saves without adding trajectory fields to them.
  if(typeof a.targetX==='number')Object.assign(active,{vx:finite(a.vx,-400,400,0),gravity:finite(a.gravity,0,800,680),warning:finite(a.warning,SKY_WARNING_SECONDS,3,SKY_WARNING_SECONDS),targetX:finite(a.targetX,0,121000,active.x),targetY:finite(a.targetY,-4000,4000,330),originX:finite(a.originX,0,121000,active.x),originY:finite(a.originY,-4000,4000,active.y),threatened:a.threatened===true,closest:finite(a.closest,0,100000,100000),safeAction:a.safeAction==='gas'?'gas':'brake'});
 }
 return {nextDistance:finite(v.nextDistance,SKY_START_METERS,10200,fallback.nextDistance),spawnCount:int(v.spawnCount,0,1000),cooldown:finite(v.cooldown,0,10,0),active,hits:int(v.hits,0,1000),dodged:int(v.dodged,0,1000),seed:fallback.seed,rng:int(v.rng,1,0xffffffff,fallback.rng),nextAttempt:finite(v.nextAttempt,0,36001,0),burstRemaining:int(v.burstRemaining,0,1)};
}
export function segmentBoxContact(x0:number,y0:number,x1:number,y1:number,left:number,top:number,right:number,bottom:number):number|null{
 let enter=0,exit=1;
 for(const [p,d,min,max]of [[x0,x1-x0,left,right],[y0,y1-y0,top,bottom]]){
  if(Math.abs(d)<1e-8){if(p<min||p>max)return null;continue;}
  const a=(min-p)/d,b=(max-p)/d;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)return null;
 }return enter;
}
function contact(r:Drive,a:SkyObject,px:number,py:number,g:SkyGeometry){
 const c=Math.cos(r.a),s=Math.sin(r.a),local=(x:number,y:number)=>({x:c*(x-r.x)+s*(y-r.y)+g.comX,y:-s*(x-r.x)+c*(y-r.y)+g.comY});
 const p=local(px,py),q=local(a.x,a.y),rad=a.radius;
 let first=segmentBoxContact(p.x,p.y,q.x,q.y,-g.width-rad,-66-rad,g.width+rad,14+rad);
 for(const w of g.wheels){const t=segmentBoxContact(px,py,a.x,a.y,w.x-w.r-rad,w.y-w.r-rad,w.x+w.r+rad,w.y+w.r+rad);if(t!==null&&(first===null||t<first))first=t;}
 return first;
}
function clearPath(r:Drive,g:SkyGeometry,end:number){
 const left=Math.min(r.x,end)-g.width-10,right=Math.max(r.x,end)+g.width+10;
 if(COURSE_SMASH.some(o=>!r.smash?.cleared.includes(o.id)&&o.x+o.width>left&&o.x-o.width<right))return false;
 const start=g.ground(r.x);
 for(let x=left;x<=right;x+=30)if(Math.abs(g.ground(x)-start)>20||Math.abs(g.ground(x+8)-g.ground(x-8))>4)return false;
 return true;
}
/** Conservative reachable responses use reaction time, unaided acceleration,
 * braking and collision-free ground. No available boost/shield is assumed. */
function planSkyCandidate(r:Drive,g:SkyGeometry,kind:SkyObject['kind'],hash:number,cap:number):SkyObject|null{
 if(r.contacts===0||r.air>.1||Math.abs(r.a)>.65||r.vx<25)return null;
 const warning=SKY_WARNING_SECONDS+Math.min(.8,Math.max(0,(r.vx-120)/300));
 const flight=[.72,1.1,1.05,.65][kind],radius=[22,38,24,18][kind],speed=Math.max(0,r.vx),total=warning+flight;
 const targetX=r.x+Math.min(cap,speed*total)+(hash%31-15),targetY=g.ground(targetX);
 if(smashNearby(r,targetX,g.width+radius+65)||Math.abs(g.ground(targetX+80)-g.ground(targetX-80))>20)return null;
 // An object must be beyond the truck footprint, and a new landing/ramp target
 // cannot be manufactured by firing from a safe-looking point just before it.
 if(targetX-r.x<g.width+radius+30)return null;
 const reaction=.35,remaining=Math.max(0,total-reaction),brakeSpeed=Math.max(0,speed-180*remaining);
 const brakeX=r.x+speed*reaction+(speed+brakeSpeed)*Math.min(remaining,speed/180)/2;
 const gasDistance=speed*warning+.5*70*warning*warning,gasX=r.x+Math.min(gasDistance,(g.speed??372)*warning);
 const margin=g.width+radius+40;
 const brakeSafe=targetX-brakeX>margin&&clearPath(r,g,brakeX);
 // Gas need only reach safety before release, rather than remain on level
 // ground for the entire later jump. Mandatory ramps remain playable afterward.
 const gasExit=targetX+margin+10;
 const gasSafe=gasX>gasExit&&clearPath(r,g,gasExit);
 if(!brakeSafe&&!gasSafe)return null;
 const vy=[80,40,240,440][kind],gravity=[680,340,160,0][kind],vx=[0,0,-170,-260][kind];
 const originX=targetX-vx*flight,originY=kind<2?Math.min(r.y-260,-20):targetY-66-radius-vy*flight-.5*gravity*flight*flight;
 if(Math.abs(originX-r.x)<g.width+radius&&Math.abs(originY-r.y)<100)return null;
 return {id:1,kind,phase:'warning',x:originX,y:originY,vy,radius,age:0,hit:false,vx,gravity,warning,targetX,targetY,originX,originY,threatened:Math.abs(r.x+speed*total-targetX)<g.width+radius,closest:100000,safeAction:brakeSafe?'brake':'gas'};
}
export function planSkyAttack(r:Drive,g:SkyGeometry,kind:SkyObject['kind'],hash:number):SkyObject|null{
 for(const cap of [700,460,300,180]){const a=planSkyCandidate(r,g,kind,hash,cap);if(a)return a;}
 return null;
}
/** One active object, no catch-up waves; burst second shot is planned and
 * warned separately after the first resolves. Simulation time owns all timers. */
export function tickSkyObjects(r:Drive,dt:number,g:SkyGeometry):SkyObject|null{
 if(r.ended||dt<=0||r.practice)return null;
 const state=r.sky??(r.sky=initialSkyState(r.distance));
 state.cooldown=Math.max(0,state.cooldown-dt);
 if(!state.active){
  const second=(state.burstRemaining??0)>0;
  if(r.t<SKY_START_SECONDS||r.distance<state.nextDistance&&!second||state.cooldown>0||state.spawnCount>=32&&!second||r.t<(state.nextAttempt??0)||r.t<(r.survival?.protectedUntil??0))return null;
  const hash=nextSeed(state.rng??state.seed??1),kind=second?3:state.spawnCount===0?(hash%2) as 0|1:((state.spawnCount+(hash>>>8))% (r.distance<650?3:4)) as SkyObject['kind'];
  const a=planSkyAttack(r,g,kind,hash);state.rng=hash;state.nextAttempt=r.t+.5;
  if(!a){if(second){state.burstRemaining=0;state.cooldown=8;}return null;}
  if(!second){state.spawnCount++;state.nextDistance=r.distance+60+hash%26;state.burstRemaining=kind===3?1:0;}
  else state.burstRemaining=0;
  a.id=state.spawnCount*2+(second?1:0);state.active=a;return null;
 }
 const a=state.active;a.age+=dt;
 if(a.phase==='warning'){if(a.age+1e-9>=(a.warning??SKY_WARNING_SECONDS)){a.phase='falling';a.age=0;}return null;}
 if(a.phase==='burst'){if(a.age>=(a.kind===3&&a.targetX!==undefined?.25:.65)){state.active=null;state.cooldown=(state.burstRemaining??0)>0?.2:a.targetX===undefined?8:r.distance<650?1:.65;}return null;}
 const px=a.x,py=a.y;a.vy=Math.min(1600,a.vy+(a.gravity??680)*dt);a.x+=(a.vx??0)*dt;a.y+=a.vy*dt;
 const groundY=g.ground(a.x)-a.radius,groundT=a.y>=groundY?Math.max(0,(groundY-py)/Math.max(.0001,a.y-py)):null;
 const hitT=contact(r,a,px,py,g);
 const edge=Math.max(0,Math.abs(a.x-r.x)-g.width-a.radius);
 if(a.y>=r.y-120&&a.y<=r.y+70)a.closest=Math.min(a.closest??100000,Math.hypot(edge,Math.max(0,Math.abs(a.y-(r.y-20))-50-a.radius)));
 if(!a.hit&&hitT!==null&&(groundT===null||hitT<=groundT)){
  a.x=px+(a.x-px)*hitT;a.y=py+(a.y-py)*hitT;a.phase='burst';a.age=0;a.hit=true;state.hits++;return {...a};
 }
 if(groundT!==null||a.age>6){
  a.y=groundY;a.phase='burst';a.age=0;state.dodged++;
  if(a.threatened&&(a.closest??100000)>0&&(a.closest??100000)<90)rewardAction(r,'near',a.id);
 }
 return null;
}
