import {it,expect} from 'vitest';
import {makeDrive,stepDrive} from './carPhysics';
import {STARTER_BUILD} from './save';
import {COURSE_SMASH} from './smashObjects';
// The landing is deliberately simultaneous with its impact. A bonus can only
// describe the final clean outcome, not the pose before damage is resolved.
for(const vy of [400,750,1000])it('boosted landing resolves impact before stunt reward at vy='+vy,()=>{
 const r=makeDrive(STARTER_BUILD,1,0,false,17);
 Object.assign(r,{x:5600,y:290,vx:200,vy,air:.5,launchX:5480,boostJump:true,t:30,contacts:0,distance:459});
 r.smash!.cleared=COURSE_SMASH.map(o=>o.id);r.sky!.nextDistance=10000;
 stepDrive(r,{gas:false,brake:false,tool:false});
 expect(r.landings).toBe(1);
 if(vy===400){expect(r.survival!.health).toBe(100);expect(r.broken).toEqual([]);expect(r.survival!.stunts).toEqual([2]);expect(r.survival!.reward).toBe(5);}
 else{expect(r.survival!.health).toBeLessThan(100);expect(r.broken.length).toBeGreaterThan(0);expect(r.survival!.stunts).toEqual([]);expect(r.survival!.reward).toBe(0);}
});
