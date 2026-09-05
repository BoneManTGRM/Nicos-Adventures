import {describe,expect,it} from 'vitest';
import {clearSight,createRift,pauseRift,powerKind,riftDistance,riftFree,RIFT_EXIT,stepRift} from './monsterRift';
const none=()=>({x:0,y:0,fire:false,power:false});
function pathTo(start:{x:number;y:number},goal:{x:number;y:number}) {
 const pts=Array.from({length:46*30},(_,i)=>({x:40+i%46*20,y:40+Math.floor(i/46)*20})),free=pts.map(p=>riftFree(p,25));
 const nearest=(p:{x:number;y:number})=>pts.reduce((best,n,i)=>free[i]&&(best<0||riftDistance(n,p)<riftDistance(pts[best],p))?i:best,-1);
 const first=nearest(start),last=nearest(goal),q=[first],previous=new Map<number,number>([[first,-1]]);
 for(let i=0;i<q.length;i++){const n=q[i];if(n===last)break;for(const at of [n-1,n+1,n-46,n+46])if(at>=0&&at<pts.length&&free[at]&&!previous.has(at)&&riftDistance(pts[n],pts[at])<21){previous.set(at,n);q.push(at);}}
 if(!previous.has(last))return[];const out=[];for(let i=last;i>=0;i=previous.get(i)??-1)out.unshift(pts[i]);return out;
}
describe('Monster Rift Rescue',()=>{
 it('waits for start, pauses and rejects invalid time',()=>{const s=createRift(),before=JSON.stringify(s);stepRift(s,{...none(),fire:true},.05,'Rainbow shield');expect(JSON.stringify(s)).toBe(before);s.status='playing';stepRift(s,none(),NaN,'');expect(s.time).toBe(0);pauseRift(s);const paused=JSON.stringify(s);stepRift(s,{...none(),x:1},.05,'');expect(JSON.stringify(s)).toBe(paused);});
 it('blocks pillars and keeps movement bounded and diagonal speed normalized',()=>{expect(riftFree({x:250,y:215})).toBe(false);expect(clearSight({x:250,y:140},{x:250,y:300})).toBe(false);const a=createRift(),b=createRift();a.status=b.status='playing';stepRift(a,{...none(),x:1},.03,'');stepRift(b,{...none(),x:1,y:1},.03,'');expect(a.traveled).toBeCloseTo(b.traveled,6);stepRift(a,{...none(),x:Infinity,y:NaN},1000,'');expect(Number.isFinite(a.player.x+a.player.y)).toBe(true);});
 it('maps every offered power to an action and enforces cooldown',()=>{expect(powerKind('Rainbow shield')).toBe('shield');expect(powerKind('Healing sparkle')).toBe('heal');expect(powerKind('Teleport')).toBe('dash');expect(powerKind('Thunder clap')).toBe('burst');const s=createRift();s.status='playing';stepRift(s,{...none(),power:true},.01,'Rainbow shield');stepRift(s,{...none(),power:true},.01,'Rainbow shield');expect(s.powerUses).toBe(1);expect(s.invulnerable).toBeGreaterThan(2);});
 it('keeps projectile and enemy pools bounded and resets cleanly',()=>{const s=createRift();s.status='playing';for(let i=0;i<500;i++)stepRift(s,{...none(),fire:true,power:true},1/30,'Rainbow shield');expect(s.bolts.length).toBeLessThanOrEqual(36);expect(createRift().score).toBe(0);expect(createRift().health).toBe(100);});
 it('completes three stages and rescues nine hatchlings through ordinary inputs',()=>{
  const s=createRift();s.status='playing';let path:{x:number;y:number}[]=[],ticks=0,goalKey='';
  while(s.status==='playing'&&ticks++<24000){
   // A deterministic playtest agent uses only direction/fire/power controls.
   const target=s.pickups.find(p=>p.kind==='baby')??(s.portal?RIFT_EXIT:s.enemies[0]??RIFT_EXIT);
   const key=`${s.level}:${'id' in target?target.id:'exit'}`;
   if(key!==goalKey||ticks%60===0||!path.length){path=pathTo(s.player,target);goalKey=key;}
   while(path.length&&riftDistance(s.player,path[0])<8)path.shift();const p=path[0]??target,d=Math.max(1,riftDistance(s.player,p));
   stepRift(s,{x:(p.x-s.player.x)/d,y:(p.y-s.player.y)/d,fire:true,power:true},1/30,'Healing sparkle');
  }
  expect({status:s.status,level:s.level,rescued:s.rescued,health:s.health,remaining:s.enemies.length,ticks}).toMatchObject({status:'won',level:3,rescued:9});
  expect(s.score).toBeGreaterThan(1000);const terminal=JSON.stringify(s);stepRift(s,{...none(),fire:true},.05,'');expect(JSON.stringify(s)).toBe(terminal);
 });
});
