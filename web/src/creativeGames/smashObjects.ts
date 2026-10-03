import type {Drive} from './save';
export type SmashKind='crate'|'fence'|'barrel'|'tires'|'scrap'|'ice';
export type SmashObject={id:number;kind:SmashKind;x:number;width:number;height:number;momentum:number;reward:number;weight:'light'|'medium'|'heavy'};
export type SmashState={version?:1;paid?:number[];cleared:number[];bolts:number;impactAt:number;last?:number;contact?:number};
export const SMASH_TYPES:Record<SmashKind,Omit<SmashObject,'id'|'kind'|'x'>>={
 crate:{width:26,height:44,momentum:45,reward:3,weight:'light'},
 fence:{width:14,height:65,momentum:65,reward:3,weight:'light'},
 barrel:{width:28,height:55,momentum:110,reward:4,weight:'medium'},
 tires:{width:35,height:72,momentum:140,reward:5,weight:'medium'},
 scrap:{width:37,height:74,momentum:180,reward:6,weight:'heavy'},
 ice:{width:20,height:88,momentum:80,reward:4,weight:'light'},
};
// All required resistance is below the starter's unaided speed. No upgrade gates.
// Positions protect the original first two ramps and keep their landing runouts.
export const COURSE_SMASH:SmashObject[]=Array.from({length:18},(_,i)=>{
 const kind=(['crate','fence','ice','barrel','tires','scrap'] as const)[i%6];
 const cell=Math.floor(i/3),slot=i%3,x=i===11?7400:i===12?10650:280+cell*2000+[170,770,1920][slot];
 return {id:i+1,kind,x,...SMASH_TYPES[kind]};
});
export const INTRO_CRATE=COURSE_SMASH[0];
export function initialSmash():SmashState{return {version:1,paid:[],cleared:[],bolts:0,impactAt:-100,last:0,contact:0};}
export function normalizeSmash(raw:unknown,legacyX?:number):SmashState{
 const v=raw&&typeof raw==='object'?raw as Partial<SmashState>:{};
 const cleared=Array.isArray(v.cleared)?[...new Set(v.cleared.filter(id=>COURSE_SMASH.some(o=>o.id===id)))].slice(0,COURSE_SMASH.length):[];
 const paid=Array.isArray(v.paid)?[...new Set(v.paid.filter(id=>cleared.includes(id)))]:[];
 if(v.version!==1&&typeof legacyX==='number'){
  // The new course cannot insert a blocking object into an old saved truck.
  // Migration clearing is not a smash and earns no reward.
  for(const o of COURSE_SMASH)if(o.x-o.width<legacyX+100&&!cleared.includes(o.id)){cleared.push(o.id);paid.push(o.id);}
 }
 return {version:1,paid,cleared,bolts:COURSE_SMASH.filter(o=>cleared.includes(o.id)&&!paid.includes(o.id)).reduce((n,o)=>n+o.reward,0),impactAt:typeof v.impactAt==='number'&&Number.isFinite(v.impactAt)?Math.max(-100,Math.min(36000,v.impactAt)):-100,last:COURSE_SMASH.some(o=>o.id===v.last)?v.last:0,contact:0};
}
export function smashNearby(r:Drive,x:number,margin:number){return COURSE_SMASH.some(o=>!r.smash?.cleared.includes(o.id)&&Math.abs(o.x-x)<margin+o.width);}
export function tickSmash(r:Drive,previousX:number,width:number,ground:(x:number)=>number,only?:SmashObject){
 const state=r.smash??(r.smash=initialSmash());state.contact=0;
 if(r.ended)return;
 for(const o of only?[only]:COURSE_SMASH){
  if(state.cleared.includes(o.id))continue;
  const y=ground(o.x);
  if(Math.max(previousX,r.x)+width<o.x-o.width||Math.min(previousX,r.x)-width>o.x+o.width||r.y-30>y||r.y+35<y-o.height)continue;
  if(Math.abs(r.vx)>=o.momentum){
   state.cleared.push(o.id);state.bolts+=o.reward;state.impactAt=r.t;state.last=o.id;
   r.vx*=o.weight==='heavy'?.78:o.weight==='medium'?.86:.92;
  }else{
   state.contact=o.id;
   // Pulling force builds momentum during sustained contact, without damage
   // callbacks or paying for an object until its blocking state is cleared.
   r.x=previousX<=o.x?Math.min(r.x,o.x-o.width-width):Math.max(r.x,o.x+o.width+width);
  }
 }
}
export function tickIntroSmash(r:Drive,previousX:number,width:number,ground:number){tickSmash(r,previousX,width,()=>ground,INTRO_CRATE);}
