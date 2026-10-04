import type {Drive} from './save';
export type Survival={health:number;shield:boolean;protectedUntil:number;lastDamage:number;checkpoint:0|1|2|3;recoveries:number;stuck:number;pickups:number[];stunts:number[];nearMisses:number[];combo:number;comboUntil:number;comboAwards:number;smashActions:number[];reward:number};
export const PICKUPS=[{id:1,x:1050,kind:'shield'},{id:2,x:2200,kind:'repair'},{id:3,x:4650,kind:'shield'},{id:4,x:6400,kind:'repair'},{id:5,x:8050,kind:'shield'},{id:6,x:10200,kind:'repair'}] as const;
export const CHECKPOINT_X=[90,1350,4290,7890] as const;
export function initialSurvival():Survival{return {health:100,shield:false,protectedUntil:0,lastDamage:-100,checkpoint:0,recoveries:0,stuck:0,pickups:[],stunts:[],nearMisses:[],combo:0,comboUntil:0,comboAwards:0,smashActions:[],reward:0};}
const bounded=(v:unknown,lo:number,hi:number,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):fallback;
const ids=(v:unknown,max:number,count:number)=>Array.isArray(v)?[...new Set(v.filter(x=>Number.isInteger(x)&&x>=1&&x<=max))].slice(0,count) as number[]:[];
export function normalizeSurvival(raw:unknown):Survival{
 const v=raw&&typeof raw==='object'?raw as Partial<Survival>:{},s=initialSurvival();
 return {...s,health:bounded(v.health,0,100,100),shield:v.shield===true,protectedUntil:bounded(v.protectedUntil,0,36010),lastDamage:bounded(v.lastDamage,-100,36000,-100),checkpoint:Math.floor(bounded(v.checkpoint,0,3)) as Survival['checkpoint'],recoveries:Math.floor(bounded(v.recoveries,0,100)),stuck:bounded(v.stuck,0,10),pickups:ids(v.pickups,6,6),stunts:ids(v.stunts,3,3),nearMisses:ids(v.nearMisses,1000,50),combo:Math.floor(bounded(v.combo,0,4)),comboUntil:bounded(v.comboUntil,0,36010),comboAwards:Math.floor(bounded(v.comboAwards,0,10)),smashActions:ids(v.smashActions,18,18),reward:Math.floor(bounded(v.reward,0,125))};
}
/** One contact resolves its shield OR damage, followed by a simulation-time guard. */
export function damageTruck(r:Drive,amount:number){
 const s=r.survival??(r.survival=initialSurvival());
 if(r.t<s.protectedUntil||r.t-s.lastDamage<.8)return false;
 s.lastDamage=r.t;s.combo=0;s.comboUntil=0;
 if(s.shield){s.shield=false;s.protectedUntil=r.t+.8;return false;}
 s.health=Math.max(0,s.health-amount);
 if(s.health===0){r.ended=true;r.reason=1;}
 return true;
}
export function rewardAction(r:Drive,kind:'smash'|'near'|'stunt',id:number){
 const s=r.survival??(r.survival=initialSurvival());
 if(r.practice)return;
 if(kind==='smash'){if(s.smashActions.includes(id)||s.smashActions.length>=18)return;s.smashActions.push(id);}
 if(kind==='near'){if(s.nearMisses.includes(id)||s.nearMisses.length>=50)return;s.nearMisses.push(id);s.reward=Math.min(125,s.reward+2);}
 if(kind==='stunt'){if(s.stunts.includes(id)||s.stunts.length>=3)return;s.stunts.push(id);s.reward=Math.min(125,s.reward+5);}
 s.combo=r.t<=s.comboUntil?Math.min(4,s.combo+1):1;s.comboUntil=r.t+6;
 if(s.combo>=3&&s.comboAwards<10){s.comboAwards++;s.reward=Math.min(125,s.reward+1);}
}
export function tickSurvival(r:Drive,dt:number,previousX:number,ground:(x:number)=>number){
 const s=r.survival??(r.survival=initialSurvival());
 if(r.ended)return;
 if(r.x>1330&&r.contacts>0&&Math.abs(r.a)<.8)s.checkpoint=Math.max(1,s.checkpoint) as Survival['checkpoint'];
 if(r.x>4290&&r.contacts>0)s.checkpoint=Math.max(2,s.checkpoint) as Survival['checkpoint'];
 if(r.x>7890&&r.contacts>0)s.checkpoint=3;
 s.stuck=(r.contacts>0&&Math.abs(r.vx)<8||Math.abs(r.a)>1.4)?Math.min(10,s.stuck+dt):0;
 if(r.t>s.comboUntil)s.combo=0;
 for(const p of PICKUPS){
  if(s.pickups.includes(p.id)||Math.abs(r.y-(ground(p.x)-60))>85||Math.max(previousX,r.x)+70<p.x||Math.min(previousX,r.x)-70>p.x)continue;
  s.pickups.push(p.id);if(p.kind==='shield')s.shield=true;else s.health=Math.min(100,s.health+35);
 }
}
export function courseSection(distance:number):0|1|2{return distance<350?0:distance<650?1:2;}
/** Respawn within the same live run keeps cleared objects/reward IDs. The outer
 * receipt ledger settles an ended run before beginning a new recovered attempt. */
export function recoverDrive(r:Drive,ground:(x:number)=>number,radius:number,clearance:number){
 const s=r.survival??(r.survival=initialSurvival());
 r.x=CHECKPOINT_X[s.checkpoint];r.y=ground(r.x)-radius-clearance-4;r.vx=0;r.vy=0;r.a=0;r.av=0;r.air=0;r.contacts=0;
 r.ended=false;r.reason=0;r.broken=[];r.debris=[];r.cargo=true;r.boostCharge=100;r.boostLocked=false;r.boostActive=false;
 s.health=100;s.shield=false;s.protectedUntil=r.t+3;s.lastDamage=r.t;s.recoveries++;s.stuck=0;s.combo=0;
 if(r.sky){r.sky.active=null;r.sky.cooldown=8;r.sky.nextDistance=Math.max(r.sky.nextDistance,r.distance+80);}
}
