import {describe,it,expect} from 'vitest';
import {makeDrive,stepDrive,terrainAt,carStats} from './carPhysics';
import {STARTER_BUILD,STARTER_PARTS,normalizeGames,normalizeDrive,finishDrive,type Drive} from './save';
import {planSkyAttack,tickSkyObjects} from './skyObjects';
import {initialSurvival,damageTruck,recoverDrive,rewardAction,tickSurvival} from './survival';
import {startGarageAttempt} from './garageExperience';
import {COURSE_SMASH} from './smashObjects';
const gas={gas:true,brake:false,tool:false},idle={gas:false,brake:false,tool:false};
const geometry={width:64,comX:0,comY:0,wheels:[],ground:()=>330,speed:372.6};
function fixture(seed=1001,track=0,x=5600){const r=makeDrive(STARTER_BUILD,1,track,false,seed);Object.assign(r,{x,y:286,vx:100,t:30,distance:(x-90)/12,contacts:2});r.smash!.cleared=COURSE_SMASH.filter(o=>o.x<x+100).map(o=>o.id);r.smash!.paid=[...r.smash!.cleared];return r;}
describe('four committed trajectories and bounded contact resolution',()=>{
 for(const kind of [0,1,2,3] as const)for(const avoid of [false,true])it('kind '+kind+(avoid?' reachable brake dodge':' threatening coast impact'),()=>{
  const r=fixture();r.sky!.active=planSkyAttack(r,geometry,kind,1);expect(r.sky!.active).not.toBeNull();r.sky!.nextDistance=10000;r.sky!.spawnCount=1;
  const target=r.sky!.active!.targetX,warning=r.sky!.active!.warning!;expect(warning).toBeGreaterThanOrEqual(1.5);
  for(let i=0;i<480;i++){stepDrive(r,{...idle,brake:avoid&&r.vx>12});if(r.sky!.active)expect(r.sky!.active.targetX).toBe(target);}
  expect(r.sky!.hits).toBe(avoid?0:1);expect(r.survival!.health).toBe(avoid?100:100-[20,30,24,16][kind]);
 });
 it('produces two separately telegraphed bolt projectiles when both candidates are safe',()=>{
  const r=fixture();r.sky!.active=planSkyAttack(r,geometry,3,1);r.sky!.nextDistance=10000;r.sky!.spawnCount=1;r.sky!.burstRemaining=1;
  const ids=new Set<number>(),starts=new Map<number,number>();
  for(let i=0;i<120*8;i++){const a=r.sky!.active;if(a?.phase==='warning'){ids.add(a.id);if(!starts.has(a.id))starts.set(a.id,r.t);}
   if(a?.phase==='falling')expect(r.t-starts.get(a.id)!).toBeGreaterThanOrEqual(1.5);stepDrive(r,gas);}
  expect(ids.size).toBe(2);expect(r.sky!.dodged).toBe(2);expect(r.sky!.hits).toBe(0);
 });
 it('rejects wall/mandatory landing traps and never requires depleted boost or a shield',()=>{
  const r=fixture();r.boostCharge=0;r.survival!.shield=false;expect(planSkyAttack(r,geometry,2,1)).not.toBeNull();
  r.x=5050;r.smash!.cleared=[];expect(planSkyAttack(r,geometry,2,1)).toBeNull();r.x=9060;r.y=terrainAt(r.x)-50;expect(planSkyAttack(r,{...geometry,ground:terrainAt},2,1)).toBeNull();
 });
 it('retains the legacy eight-second quiet period for old committed drops',()=>{
  const r=fixture();r.sky!.active={id:1,kind:0,phase:'burst',x:5900,y:300,vy:0,radius:22,age:.64,hit:false};
  tickSkyObjects(r,.02,geometry);expect(r.sky!.active).toBeNull();expect(r.sky!.cooldown).toBe(8);
 });
 it('does not manufacture a near miss from a distant or unthreatening flight',()=>{
  const r=fixture();r.sky!.nextDistance=10000;r.sky!.active={id:1,kind:2,phase:'falling',x:r.x+1000,y:200,vy:400,radius:24,age:0,hit:false,threatened:false,closest:10};
  for(let i=0;i<120;i++)tickSkyObjects(r,1/120,geometry);expect(r.survival!.nearMisses).toEqual([]);
 });
 it('pays an actual avoided threatening bolt once across duplicate callbacks and reload',()=>{
  const r=fixture();r.sky!.active=planSkyAttack(r,geometry,3,1);r.sky!.nextDistance=10000;r.sky!.spawnCount=1;
  for(let i=0;i<480;i++)stepDrive(r,{...idle,brake:r.t>=30.5&&r.vx>12});
  expect(r.sky!.hits).toBe(0);expect(r.survival!.nearMisses).toEqual([1]);expect(r.survival!.reward).toBe(2);
  const restored=normalizeDrive(JSON.parse(JSON.stringify(r)),STARTER_PARTS)!;rewardAction(restored,'near',1);expect(restored.survival!.reward).toBe(2);
 });
});
describe('survival, save receipts and state ordering',()=>{
 it('uses shield OR health once and rejects continuous impact damage',()=>{const r=fixture();r.survival!.shield=true;expect(damageTruck(r,30)).toBe(false);expect(r.survival!.shield).toBe(false);expect(r.survival!.health).toBe(100);damageTruck(r,30);expect(r.survival!.health).toBe(100);r.t+=1;expect(damageTruck(r,30)).toBe(true);damageTruck(r,30);expect(r.survival!.health).toBe(70);});
 it('collects repair/shield once, caps health and bounds combo bonus',()=>{const r=fixture();r.x=2200;r.y=terrainAt(2200)-60;r.survival!.health=80;tickSurvival(r,.01,2150,terrainAt);expect(r.survival!.health).toBe(100);r.survival!.health=60;tickSurvival(r,.01,2150,terrainAt);expect(r.survival!.health).toBe(60);for(let id=1;id<=18;id++)rewardAction(r,'smash',id);expect(r.survival!.combo).toBe(4);expect(r.survival!.comboAwards).toBe(10);expect(r.survival!.reward).toBe(10);rewardAction(r,'smash',18);expect(r.survival!.reward).toBe(10);});
 it('impact → checkpoint → retry preserves permanent rewards and clears hazards with protection',()=>{
  const r=fixture();r.survival!.checkpoint=1;r.distance=200;r.smash!.cleared=[1,2];r.smash!.paid=[];r.smash!.bolts=6;rewardAction(r,'stunt',1);damageTruck(r,30);
  const g={...normalizeGames(null).garage,sequence:1},paid=finishDrive(g,r),next=startGarageAttempt(g,{track:0,previous:r,recovery:true});
  expect(next.garage.bolts).toBe(paid.bolts);expect(next.run.x).toBe(1350);expect(next.run.survival!.protectedUntil-next.run.t).toBe(3);expect(next.run.sky!.active).toBeNull();expect(next.run.smash!.bolts).toBe(0);
  for(let i=0;i<120*15&&!next.run.ended;i++)stepDrive(next.run,gas);expect(next.run.x).toBeGreaterThan(1990);expect(next.run.broken.some(i=>i<3)).toBe(false);
  next.run.distance=200;const again=finishDrive(next.garage,next.run);expect(again.last!.bolts).toBe(0);expect(finishDrive(again,next.run)).toBe(again);
 });
 it('pause → resume → shield impact keeps the exact warning and timer',()=>{const r=fixture();r.sky!.active=planSkyAttack(r,geometry,0,1);r.survival!.shield=true;const before=structuredClone(r);for(let i=0;i<100;i++)stepDrive(r,idle,0);expect(r).toEqual(before);for(let i=0;i<480;i++)stepDrive(r,idle);expect(r.sky!.hits).toBe(1);expect(r.survival!.health).toBe(100);expect(r.broken).toEqual([]);});
 it('freezes the seed across the launch preparation and persistence passes',()=>{const g=normalizeGames(null).garage,prepared=startGarageAttempt(g,{track:0,seed:1077});const saved=startGarageAttempt(g,{track:0,seed:prepared.run.sky!.seed});expect(saved.garage.resume).toEqual(prepared.run);});
 it('normalizes old health/mute fields without changing saved vehicles or wallet',()=>{const old=normalizeGames(null);old.garage.bolts=123;old.garage.blueprints=[{...STARTER_BUILD,name:'Saved truck',paint:3}];const r=makeDrive(STARTER_BUILD);delete r.survival;old.garage.sequence=1;old.garage.resume=r;const restored=normalizeGames(JSON.parse(JSON.stringify(old)));expect(restored.garage.resume!.survival).toEqual(initialSurvival());expect(restored.garage.blueprints).toEqual(old.garage.blueprints);expect(restored.garage.bolts).toBe(123);expect(restored.garage.muted).toBe(false);});
});
type Event={step:number;action:'gas'|'brake'|'idle'};
function initial(seed:number){const mode=(seed-1001)%3;return mode===0?makeDrive(STARTER_BUILD,1,(seed-1001)%3,false,seed):fixture(seed,(seed-1001)%3,mode===1?5600:8050);}
function record(seed:number){
 const r=initial(seed),events:Event[]=[],warnings:{id:number;kind:number;step:number;duration:number;target:number}[]=[],targets=new Map<number,number>();let action='',reactionUntil=0,lastWarning=0,steps=0;
 for(;steps<120*60&&!r.ended;steps++){
  const a=r.sky!.active;if(a?.phase==='warning'&&!targets.has(a.id)){targets.set(a.id,a.targetX!);warnings.push({id:a.id,kind:a.kind,step:steps,duration:a.warning!,target:a.targetX!});reactionUntil=steps+42;lastWarning=a.id;}
  if(a&&targets.has(a.id))expect(a.targetX).toBe(targets.get(a.id));
  const desired=a&&a.phase!=='burst'?(a.safeAction??'brake'):'gas';
  const next=steps<reactionUntil&&a?.id===lastWarning?'idle':desired==='brake'?(r.vx>12?'brake':'idle'):desired;
  if(next!==action){events.push({step:steps,action:next});action=next;}
  stepDrive(r,{gas:action==='gas',brake:action==='brake',tool:false});
  expect(r.debris.length).toBeLessThanOrEqual(22);expect(r.sky!.spawnCount).toBeLessThanOrEqual(32);
 }
 return {r,events,warnings,steps};
}
function replay(seed:number,events:Event[],steps:number,frameRate:number,stall=false){
 const r=initial(seed);let accumulator=0,step=0,frame=0,event=0,action:Event['action']='idle';
 while(step<steps){const raw=stall&&frame%97===0?.075:1/frameRate;frame++;accumulator+=Math.min(raw,.08);let batch=0;
  while(accumulator+1e-12>=1/120&&batch++<10&&step<steps){if(events[event]?.step===step)action=events[event++].action;stepDrive(r,{gas:action==='gas',brake:action==='brake',tool:false});accumulator-=1/120;step++;}
 }return r;
}
describe('50 qualification seeds separate from tuning 1/7/42, actual dodge input replays',()=>{
 for(let seed=1001;seed<=1050;seed++)it('qualification seed '+seed,()=>{
  const q=record(seed);expect(q.warnings.length).toBeGreaterThan(0);for(const w of q.warnings)expect(w.duration).toBeGreaterThanOrEqual(1.5);
  expect(q.r.sky!.hits).toBe(0);expect(q.r.survival!.health).toBe(100);expect(q.r.reason).toBe(4);expect(q.r.distance).toBeGreaterThanOrEqual(1000);
  for(const fps of [30,60,120]){const r=replay(seed,q.events,q.steps,fps,fps===30);expect(r.x).toBeCloseTo(q.r.x,5);expect(r.t).toBeCloseTo(q.r.t,7);expect(r.sky).toEqual(q.r.sky);expect(r.survival).toEqual(q.r.survival);}
  console.log('TRUCK_QUALIFICATION '+JSON.stringify({seed,track:q.r.track,events:q.events,warnings:q.warnings,steps:q.steps,distance:q.r.distance,health:q.r.survival!.health,hits:q.r.sky!.hits,reason:q.r.reason}));
 });
});
