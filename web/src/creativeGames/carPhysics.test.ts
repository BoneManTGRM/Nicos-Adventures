import {describe,it,expect} from 'vitest';
import {makeDrive,stepDrive} from './carPhysics';
import {STARTER_BUILD,finishDrive,normalizeGames,buyPart,equipPart,rescueFriend,completeIsland} from './save';
import {PARTS} from './catalog';
const gas={gas:true,brake:false,tool:false},idle={gas:false,brake:false,tool:false};
describe('Monster Garage real driving',()=>{
 it('drives the assembled chassis forward under pedal input',()=>{const r=makeDrive(STARTER_BUILD);for(let i=0;i<1200;i++)stepDrive(r,gas);expect(r.distance).toBeGreaterThan(15);expect(Number.isFinite(r.y)).toBe(true);});
 it('detaches equipped pieces on a hard landing, not generic crash art',()=>{const r=makeDrive(STARTER_BUILD);r.y=-200;r.vy=1100;r.air=1;for(let i=0;i<120;i++)stepDrive(r,idle);expect(r.broken.length).toBeGreaterThan(0);expect(r.debris.length).toBeGreaterThan(0);expect(r.debris.every(d=>r.build.parts.includes(d.id))).toBe(true);});
 it('never credits flying debris after the main car is wrecked',()=>{const r=makeDrive(STARTER_BUILD);r.ended=true;r.distance=40;r.vx=500;r.debris=[{id:11,kind:0,x:999,y:50,vx:600,vy:0,a:0,av:2,r:25}];for(let i=0;i<240;i++)stepDrive(r,gas);expect(r.distance).toBe(40);});
 it('uses deterministic routes and physics for the same build and input',()=>{const a=makeDrive(STARTER_BUILD),b=makeDrive(STARTER_BUILD);for(let i=0;i<600;i++){stepDrive(a,gas);stepDrive(b,gas);}expect(a).toEqual(b);});
});
describe('owned parts and earned rewards',()=>{
 it('contains 100 unique bilingual parts, not duplicate recolors',()=>{expect(PARTS).toHaveLength(100);expect(new Set(PARTS.map(p=>p.name.en)).size).toBe(100);expect(PARTS.filter(p=>p.functional)).toHaveLength(70);expect(PARTS.every(p=>p.name['es-MX']&&p.description['es-MX'])).toBe(true);});
 it('rejects unaffordable and duplicate purchases; owned parts equip without paying twice',()=>{const g=normalizeGames(null).garage;expect(buyPart(g,12)).toBe(g);const rich={...g,bolts:200};const bought=buyPart(rich,12);expect(bought.bolts).toBe(150);expect(buyPart(bought,12)).toBe(bought);expect(equipPart(bought,12).build.parts[1]).toBe(12);expect(equipPart(g,12)).toBe(g);});
 it('banks a crashed run once and keeps all owned parts',()=>{const g={...normalizeGames(null).garage,sequence:1};const r=makeDrive(g.build);r.distance=120;r.ended=true;r.broken=[0,11,12];const done=finishDrive(g,r);expect(done.bolts).toBeGreaterThan(0);expect(done.owned).toEqual(g.owned);expect(done.best[0]).toBe(120);expect(finishDrive(done,r)).toBe(done);});
 it('practice cannot farm bolts, challenges, or distance records',()=>{const g={...normalizeGames(null).garage,sequence:1};const r=makeDrive(g.build,1,0,true);r.distance=999;r.bestJump=99;r.landings=50;const done=finishDrive(g,r);expect(done.bolts).toBe(0);expect(done.best).toEqual([0,0,0]);expect(done.goals).toEqual([]);});
 it('ignores stale run settlement after a newer sequence',()=>{const g={...normalizeGames(null).garage,sequence:2};const r=makeDrive(g.build,1);r.distance=999;expect(finishDrive(g,r)).toBe(g);});
 it('retains safe data and rejects NaN, invalid IDs and unknown equipped parts',()=>{const s=normalizeGames({garage:{bolts:Infinity,owned:[12,12,999,-1,1.5],build:{parts:[10,12,30]},best:[NaN,-4,500000]}});expect(s.garage.bolts).toBe(0);expect(s.garage.owned.filter(id=>id===12)).toHaveLength(1);expect(s.garage.build.parts.slice(0,3)).toEqual([1,12,26]);expect(s.garage.best).toEqual([0,0,10000]);});
 it('rewards each actual creature rescue and island completion once',()=>{let k=normalizeGames(null).kingdom;k=rescueFriend(k,0);expect(k.petals).toBe(15);expect(rescueFriend(k,0)).toBe(k);expect(completeIsland(k,0)).toBe(k);k=rescueFriend(rescueFriend(k,1),2);k=completeIsland(k,0);expect(k.petals).toBe(75);expect(completeIsland(k,0)).toBe(k);});
});
