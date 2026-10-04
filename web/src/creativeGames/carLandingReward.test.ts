import {it,expect} from 'vitest';
import {makeDrive,stepDrive} from './carPhysics';
import {STARTER_BUILD} from './save';
import {COURSE_SMASH} from './smashObjects';
// Resolve every impact in this fixed step before describing its landing as clean.
for(const fixture of [{y:290,vy:400,clean:true},{y:290,vy:750,clean:false},{y:290,vy:1000,clean:false},{y:335,vy:750,clean:false},{y:290,vy:400,sky:true,clean:false}])it('boosted landing resolves all impacts '+JSON.stringify(fixture),()=>{
 const r=makeDrive(STARTER_BUILD,1,0,false,17);
 Object.assign(r,{x:5600,y:fixture.y,vx:200,vy:fixture.vy,air:.5,launchX:5480,boostJump:true,t:30,contacts:0,distance:459});
 r.smash!.cleared=COURSE_SMASH.map(o=>o.id);r.sky!.nextDistance=10000;
 if(fixture.sky)r.sky!.active={id:1,kind:0,phase:'falling',x:5600,y:210,vy:1600,radius:22,age:0,hit:false};
 stepDrive(r,{gas:false,brake:false,tool:false});
 expect(r.landings).toBe(1);
 if(fixture.clean){expect(r.survival!.health).toBe(100);expect(r.broken).toEqual([]);expect(r.survival!.stunts).toEqual([2]);expect(r.survival!.reward).toBe(5);}
 else{expect(r.survival!.health).toBeLessThan(100);expect(r.broken.length).toBeGreaterThan(0);expect(r.survival!.stunts).toEqual([]);expect(r.survival!.reward).toBe(0);}
});
