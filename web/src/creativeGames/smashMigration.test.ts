import {describe,it,expect} from 'vitest';
import {makeDrive,stepDrive} from './carPhysics';
import {STARTER_BUILD,STARTER_PARTS,normalizeDrive,finishDrive,normalizeGames} from './save';
describe('old saved course positions survive newly introduced colliders',()=>{
 it('clears introduced objects behind/overlapping a legacy truck without new reward',()=>{
  const r=makeDrive(STARTER_BUILD);Object.assign(r,{x:4450,y:280,t:30,distance:350,vx:0,contacts:2});
  r.smash={cleared:[1],bolts:3,impactAt:1};
  const loaded=normalizeDrive(JSON.parse(JSON.stringify(r)),STARTER_PARTS)!;
  expect(loaded.smash!.cleared).toEqual([1,2,3,4,5,6,7]);expect(loaded.smash!.paid).toEqual([2,3,4,5,6,7]);expect(loaded.smash!.bolts).toBe(3);
  const before=loaded.x;for(let i=0;i<120;i++)stepDrive(loaded,{gas:false,brake:false,tool:false});
  expect(Math.abs(loaded.x-before)).toBeLessThan(1);
  const roundTrip=normalizeDrive(JSON.parse(JSON.stringify(loaded)),STARTER_PARTS)!;expect(roundTrip.smash!.bolts).toBe(3);
  const g={...normalizeGames(null).garage,sequence:1};const paid=finishDrive(g,roundTrip);expect(finishDrive(paid,roundTrip)).toBe(paid);expect(paid.owned).toEqual(STARTER_PARTS);
 });
 it('fresh runs keep their real obstacles and cannot gain migration rewards',()=>{
  const r=makeDrive(STARTER_BUILD);r.x=420;r.y=280;r.vx=0;
  const loaded=normalizeDrive(r,STARTER_PARTS)!;expect(loaded.smash!.cleared).toEqual([]);expect(loaded.smash!.bolts).toBe(0);
  stepDrive(loaded,{gas:false,brake:false,tool:false});expect(loaded.smash!.cleared).toEqual([]);expect(loaded.smash!.bolts).toBe(0);
 });
});
