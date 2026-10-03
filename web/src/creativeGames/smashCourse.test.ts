import {describe,it,expect} from 'vitest';
import {makeDrive,carStats,terrainAt,stepDrive} from './carPhysics';
import {STARTER_BUILD,STARTER_PARTS,normalizeDrive,normalizeGames,finishDrive} from './save';
import {COURSE_SMASH,SMASH_TYPES,tickSmash,normalizeSmash} from './smashObjects';
describe('six readable smash types and one existing reward ledger',()=>{
 for(const [kind,properties] of Object.entries(SMASH_TYPES))it(kind+' clears its collider at maximum speed and pays once across save/contacts',()=>{
  const o=COURSE_SMASH.find(o=>o.kind===kind)!,r=makeDrive(STARTER_BUILD);
  Object.assign(r,{x:o.x+10,y:terrainAt(o.x)-45,vx:700,t:2});
  tickSmash(r,o.x-300,carStats(r.build).width,()=>terrainAt(o.x),o);
  expect(r.smash!.cleared).toEqual([o.id]);expect(r.smash!.bolts).toBe(properties.reward);
  const loaded=normalizeDrive(JSON.parse(JSON.stringify(r)),STARTER_PARTS)!;
  const vx=loaded.vx;for(let i=0;i<50;i++)tickSmash(loaded,o.x-300,64,()=>terrainAt(o.x),o);
  expect(loaded.vx).toBe(vx);expect(loaded.smash!.bolts).toBe(properties.reward);
  const g={...normalizeGames(null).garage,sequence:1};const paid=finishDrive(g,loaded);expect(finishDrive(paid,loaded)).toBe(paid);expect(paid.owned).toEqual(STARTER_PARTS);
 });
 it('medium/heavy resistance differs and every threshold is within starter unaided speed',()=>{
  expect(SMASH_TYPES.crate.momentum).toBeLessThan(SMASH_TYPES.tires.momentum);
  expect(SMASH_TYPES.tires.momentum).toBeLessThan(SMASH_TYPES.scrap.momentum);
  for(const o of COURSE_SMASH)expect(o.momentum).toBeLessThan(carStats(STARTER_BUILD).speed);
 });
 it('normalization derives earned reward from recognized unique collider IDs',()=>{
  const s=normalizeSmash({cleared:[1,1,2,999],bolts:999999,impactAt:Infinity});
  expect(s.cleared).toEqual([1,2]);expect(s.bolts).toBe(6);expect(s.impactAt).toBe(-100);
 });
 it('retains original first-two-ramp starter passage without buying or boosting',()=>{
  for(const track of [0,1,2]){const r=makeDrive(STARTER_BUILD,1,track);let cleared=false;
   for(let i=0;i<25*120&&!r.ended;i++){stepDrive(r,{gas:true,brake:false,tool:false});if(r.x>1990&&r.contacts>0&&Math.abs(r.a)<.7){cleared=true;break;}}
   expect(cleared,JSON.stringify({track,x:r.x})).toBe(true);
  }
 });
});
