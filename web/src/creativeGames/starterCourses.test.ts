import {describe,it,expect} from 'vitest';
import {makeRide,stepRide,STARTER_COURSE,friendPosition} from './kingdomPhysics';
describe('every authored starter course is finishable with starter pieces',()=>{
 for(const island of [0,1,2])it(`reaches all friends and the finish gate in garden ${island+1}`,()=>{
  const r=makeRide();
  for(let tick=0;tick<430&&!r.completed;tick++){
   const target=r.found.length<3?friendPosition(r.found.length,island).x:2010;
   const input={right:r.x<target-12,left:r.x>target+12,jump:r.grounded};
   for(let step=0;step<14;step++)stepRide(r,STARTER_COURSE,island,input);
  }
  expect(r.found).toEqual([0,1,2]);expect(r.completed).toBe(true);expect(r.falls).toBe(0);
 });
});
