import {describe,it,expect} from 'vitest';
import {makeDrive,terrainAt,carStats} from './carPhysics';
import {STARTER_BUILD} from './save';
import {tickSkyObjects,initialSkyState} from './skyObjects';
function fixture(distance:number,t:number){
 const r=makeDrive(STARTER_BUILD);Object.assign(r,{x:5600,y:280,vx:100,contacts:2,distance,t});
 r.sky=initialSkyState();return r;
}
const geometry={width:64,comX:0,comY:0,wheels:[],ground:()=>330};
describe('mission sky introduction: BOTH distance and active time',()=>{
 for(const distance of [299.99,300,350])for(const t of [0,19.99,20]){
  it(`distance ${distance}, simulation time ${t}`,()=>{
   const r=fixture(distance,t);tickSkyObjects(r,1/120,geometry);
   expect(r.sky!.active!==null).toBe(distance>=300&&t>=20);
  });
 }
 it('keeps the more generous legacy 80-meter introduction',()=>{
  const r=fixture(350,30);r.sky=initialSkyState(350);tickSkyObjects(r,1/120,geometry);
  expect(r.sky.active).toBeNull();expect(r.sky.nextDistance).toBe(430);
 });
 it('does not use wall time, zero-time callbacks or paused frames to advance the gate',()=>{
  const r=fixture(350,19.99),before=structuredClone(r);
  for(let i=0;i<1000;i++)tickSkyObjects(r,0,geometry);
  expect(r).toEqual(before);
 });
 it('the conservative test fixture is on level ground across the whole truck',()=>{
  const r=fixture(350,30),s=carStats(r.build);
  expect(terrainAt(r.x-s.width-s.radius)).toBe(330);
  expect(terrainAt(r.x+s.width+s.radius)).toBe(330);
 });
});

describe('warning threshold numerical tolerance (one nanosecond)',()=>{
 it('remains warning through 191 complete 120 Hz steps, then falls on step 192',()=>{
  const r=fixture(350,30);tickSkyObjects(r,1/120,geometry);
  for(let i=0;i<191;i++)tickSkyObjects(r,1/120,geometry);
  expect(r.sky!.active!.phase).toBe('warning');expect(r.sky!.active!.age).toBeLessThan(1.6);
  tickSkyObjects(r,1/120,geometry);expect(r.sky!.active!.phase).toBe('falling');
 });
});
