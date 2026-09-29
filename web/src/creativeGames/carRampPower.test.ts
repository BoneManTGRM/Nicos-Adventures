import {describe,it,expect} from 'vitest';
import {makeDrive,stepDrive,terrainAt,carStats} from './carPhysics';
import {STARTER_BUILD} from './save';
const gas={gas:true,brake:false,tool:false};
const idle={gas:false,brake:false,tool:false};

describe('usable starter-truck climbing power',()=>{
 // First authored pair: the second crest ends at world x=1660; x=1990 is
 // beyond its landing area. Do not flatten or move the track to pass this test.
 for(const track of [0,1,2])for(const wheels of [11,12])for(const start of [90,1350]){
  it(`clears and lands beyond ramp two: route ${track}, wheels ${wheels}, start ${start}`,()=>{
   const build=structuredClone(STARTER_BUILD);build.parts[1]=wheels;
   const run=makeDrive(build,1,track),stats=carStats(build);
   if(start!==90){run.x=start;run.y=terrainAt(start,track)-stats.radius-stats.clearance-4;}
   let landed=false;
   for(let step=0;step<25*120&&!run.ended;step++){
    stepDrive(run,gas);
    if(!run.ended&&run.x>1990&&run.contacts>0&&Math.abs(run.a)<.7){landed=true;break;}
   }
   expect(landed).toBe(true);expect(run.ended).toBe(false);
   expect(run.distance).toBeGreaterThan(158);
   expect(run.broken.some(id=>id<3||id===14)).toBe(false);
  });
 }
 it('caps motor thrust above the intentionally increased speed limit',()=>{
  // The owner requested a modest speed increase after the original ramp repair.
  // Preserve the actual no-thrust-above-cap assertion, not the obsolete 345 value.
  expect(carStats(STARTER_BUILD).speed).toBe(345*1.08);
  const powered=makeDrive(STARTER_BUILD);powered.vx=450;powered.y=286;
  const coasting=structuredClone(powered);stepDrive(powered,gas);stepDrive(coasting,idle);
  expect(powered.vx).toBe(coasting.vx);
 });
 it('does not apply extra thrust with a detached engine',()=>{
  const run=makeDrive(STARTER_BUILD);run.broken=[14];
  for(let step=0;step<600;step++)stepDrive(run,gas);
  expect(run.distance).toBeLessThan(1);
 });
 it('keeps braking effective with the stronger power band',()=>{
  const run=makeDrive(STARTER_BUILD);for(let step=0;step<120;step++)stepDrive(run,gas);
  const braking=structuredClone(run),coasting=structuredClone(run);
  for(let step=0;step<24;step++){stepDrive(braking,{...idle,brake:true});stepDrive(coasting,idle);}
  expect(braking.vx).toBeLessThan(coasting.vx);
 });
 it('retains both air-tilt directions without airborne forward thrust',()=>{
  const back=makeDrive(STARTER_BUILD),forward=makeDrive(STARTER_BUILD);back.y=forward.y=-500;
  for(let step=0;step<60;step++){stepDrive(back,gas);stepDrive(forward,{...idle,brake:true});}
  expect(back.a).toBeLessThan(-.02);expect(forward.a).toBeGreaterThan(.02);
  expect(back.x).toBe(90);expect(forward.x).toBe(90);
 });
 it('still requires a held accelerator',()=>{
  const run=makeDrive(STARTER_BUILD);for(let step=0;step<600;step++)stepDrive(run,idle);
  expect(run.distance).toBeLessThan(1);
 });
});
