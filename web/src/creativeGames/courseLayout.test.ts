import {describe,it,expect} from 'vitest';
import {makeDrive,stepDrive,terrainAt} from './carPhysics';
import {STARTER_BUILD} from './save';
import {courseRamps,coursePosition} from './courseLayout';
describe('existing ramps → sky teaching stretch → stunt gauntlet',()=>{
 it('retains the original opening ramp anchors and creates a level sky stretch',()=>{
  expect(courseRamps().slice(0,4)).toEqual([815,1660,2815,3660]);
  for(const x of [4290,5000,6000,7000,7879])for(const track of [0,1,2])expect(terrainAt(x,track)).toBe(330);
  expect(coursePosition(7880)).toBeNull();expect(coursePosition(8480)).toBe(280);expect(terrainAt(7880)).toBe(330);
 });
 for(const track of [0,1,2])it('starter reaches all three sections without upgrades or boost on route '+track,()=>{
  // Isolate course physics from dodge decisions using the existing practice mode.
  // Failed pre-restoration route2 at397.11m/t24.533s; frozen120Hz/60s/gas replay.
  const r=makeDrive(STARTER_BUILD,1,track,true);
  for(let i=0;i<120*60&&!r.ended&&r.distance<1000;i++)stepDrive(r,{gas:true,brake:false,tool:false});
  expect(r.ended,JSON.stringify({x:r.x,broken:r.broken})).toBe(false);expect(r.distance).toBeGreaterThanOrEqual(1000);
  expect(r.broken.some(id=>id<3||id===14)).toBe(false);
 });
});
