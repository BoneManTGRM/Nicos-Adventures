import {describe,it,expect} from 'vitest';
import {makeRide,stepRide,magicPlatforms,STARTER_COURSE,friendPosition,padAt} from './kingdomPhysics';
const empty=Array(10).fill(0),idle={left:false,right:false,jump:false};
describe('Rainbow Kingdom playable construction',()=>{
 it('creates real collision platforms from placed bridge pieces',()=>{const layout=[...empty];layout[0]=1;const platforms=magicPlatforms(layout,0,0);expect(platforms).toContainEqual(expect.objectContaining({id:1,pad:0,x:265,y:302,w:190}));expect(magicPlatforms(empty,0,0).some(p=>p.id===1)).toBe(false);});
 it('moves the unicorn with controls rather than completing by clicking',()=>{const r=makeRide();for(let i=0;i<100;i++)stepRide(r,STARTER_COURSE,0,{...idle,right:true});expect(r.x).toBeGreaterThan(180);expect(r.completed).toBe(false);});
 it('only rescues a creature when the unicorn reaches it',()=>{const r=makeRide(),p=friendPosition(0,0);stepRide(r,empty,0,idle);expect(r.found).toEqual([]);r.x=p.x;r.y=p.y+28;stepRide(r,empty,0,idle);expect(r.found).toEqual([0]);stepRide(r,empty,0,idle);expect(r.found).toEqual([0]);});
 it('cloud cushions actually bounce while ribbons do not',()=>{const cloud=[...empty];cloud[0]=2;const a=makeRide(),p=padAt(0,0);a.x=p.x;a.y=p.y-1;a.vy=150;stepRide(a,cloud,0,idle);expect(a.vy).toBeLessThan(-400);const ribbon=[...empty];ribbon[0]=1;const b=makeRide();b.x=p.x;b.y=p.y-1;b.vy=150;stepRide(b,ribbon,0,idle);expect(b.grounded).toBe(true);expect(b.vy).toBe(0);});
 it('falling returns to a safe island without deleting discoveries',()=>{const r=makeRide();r.x=450;r.y=610;r.found=[0];stepRide(r,empty,0,idle);expect(r.x).toBe(75);expect(r.found).toEqual([0]);expect(r.falls).toBe(1);});
 it('the finish gate requires all three discoveries',()=>{const r=makeRide();r.x=2010;stepRide(r,empty,0,idle);expect(r.completed).toBe(false);r.found=[0,1,2];stepRide(r,empty,0,idle);expect(r.completed).toBe(true);});
 it('authored moving platforms vary predictably with time',()=>{const layout=[...empty];layout[0]=5;layout[1]=6;expect(magicPlatforms(layout,0,1)).not.toEqual(magicPlatforms(layout,0,0));expect(magicPlatforms(layout,0,1)).toEqual(magicPlatforms(layout,0,1));});
});
