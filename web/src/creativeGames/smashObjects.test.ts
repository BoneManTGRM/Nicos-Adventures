import {describe,it,expect} from 'vitest';
import {makeDrive,stepDrive,carStats,terrainAt} from './carPhysics';
import {STARTER_BUILD,STARTER_PARTS,normalizeDrive,normalizeGames,finishDrive} from './save';
import {tickIntroSmash,INTRO_CRATE} from './smashObjects';
const gas={gas:true,brake:false,tool:false};
describe('minimal smash slice',()=>{
 it('sweeps maximum boost displacement and clears blocking state exactly once',()=>{
  const r=makeDrive(STARTER_BUILD);r.x=480;r.y=280;r.vx=700;r.t=2;
  tickIntroSmash(r,350,64,330);expect(r.smash!.cleared).toEqual([1]);expect(r.smash!.bolts).toBe(3);
  const speed=r.vx;for(let i=0;i<50;i++)tickIntroSmash(r,350,64,330);
  expect(r.smash!.bolts).toBe(3);expect(r.vx).toBe(speed);
 });
 it('starter builds momentum, breaks the crate and lands past ramp two without upgrades',()=>{
  const r=makeDrive(STARTER_BUILD);let landed=false;
  for(let i=0;i<25*120&&!r.ended;i++){stepDrive(r,gas);if(r.x>1990&&r.contacts>0&&Math.abs(r.a)<.7){landed=true;break;}}
  expect(landed).toBe(true);expect(r.smash!.cleared).toEqual([1,2]);expect(r.smash!.bolts).toBe(6);
 });
 it('cleared crate and reward survive save normalization and the existing one-payment ledger',()=>{
  let r=makeDrive(STARTER_BUILD);r.x=480;r.y=280;r.vx=200;tickIntroSmash(r,350,64,330);
  r=normalizeDrive(JSON.parse(JSON.stringify(r)),STARTER_PARTS)!;
  tickIntroSmash(r,350,64,330);expect(r.smash!.bolts).toBe(3);
  const g={...normalizeGames(null).garage,sequence:1};const paid=finishDrive(g,r);
  expect(paid.bolts).toBe(3);expect(finishDrive(paid,r)).toBe(paid);expect(paid.owned).toEqual(STARTER_PARTS);
 });
 it('light contact neither damages the truck nor pays until momentum breaks it',()=>{
  const r=makeDrive(STARTER_BUILD);r.x=INTRO_CRATE.x-50;r.y=280;r.vx=0;
  for(let i=0;i<5;i++)tickIntroSmash(r,r.x,carStats(r.build).width,terrainAt(INTRO_CRATE.x));
  expect(r.smash!.bolts).toBe(0);expect(r.broken).toEqual([]);expect(r.ended).toBe(false);
 });
});
