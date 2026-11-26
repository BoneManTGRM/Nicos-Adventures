import {test} from 'vitest';
import assert from 'node:assert/strict';
import {newCity,press,step} from '../public/games/skullwing/simulation.mjs';
const neutral={left:false,right:false,jump:false,attack:false};
function advance(s,seconds,input=neutral){
  for(let i=0;i<Math.round(seconds*120);i++)step(s,input,1/120);
}
test('every city starts with one visible nearby plane and a capped fleet',()=>{
  for(let d=0;d<9;d++){
    const s=newCity(d);
    assert(s.airRaid.planes.length>=3&&s.airRaid.planes.length<=12);
    assert(s.airRaid.planes[0].x<250);
  }
});
test('a ground roar cannot down aircraft, but still hits existing buildings',()=>{
  const s=newCity(0);press(s,'roar');advance(s,1.05);
  assert(s.events.some(e=>e.kind==='hit'&&e.style==='roar'));
  assert(!s.events.some(e=>e.kind==='aircraftHit'));assert.equal(s.wrecks.plane,0);
});
test('jump + roar tumbles a nearby attacker then reuses the vehicle explosion once',()=>{
  const s=newCity(0);
  press(s,'jump');advance(s,.26,{...neutral,jump:true});press(s,'roar');
  assert(!s.actor.grounded);
  advance(s,.40);
  assert(s.events.some(e=>e.kind==='aircraftHit'));
  advance(s,.8);
  const blasts=s.events.filter(e=>e.kind==='vehicleExplosion'&&e.type==='plane');
  assert.equal(blasts.length,1);assert(blasts[0].y>20);
  assert.equal(s.wrecks.plane,1);
});
test('tapping roar without a charged meter does not touch planes',()=>{
  const s=newCity(0);s.charge=.4;press(s,'jump');advance(s,.26);press(s,'roar');advance(s,1);
  assert.equal(s.wrecks.plane,0);assert.equal(s.waves.length,0);
});
test('patrols telegraph their shot, hit with a moving bolt, and retire bullets',()=>{
  const s=newCity(0);
  advance(s,1.85);
  assert(s.airRaid.planes[0].tell>0);assert(!s.events.some(e=>e.kind==='aircraftShot'));
  advance(s,2.8);
  assert(s.events.some(e=>e.kind==='aircraftShot'));
  assert(s.events.some(e=>e.kind==='aircraftBoltHit'));
  assert(s.airRaid.bolts.length<=12);
});
test('only Hard planes can take hearts and they respect existing hurt cooldown',()=>{
  const easy=newCity(0,'easy'),hard=newCity(0,'hard');
  for (const city of [easy,hard]){
    city.airRaid.planes.length=0;
    // Test only aircraft shots; suppress the existing ground/drone scheduler.
    if(city.defense)city.defense.next=100;
    const bolt=()=>({x:city.actor.x+10,y:48,vx:-80,vy:0,age:.2});
    city.airRaid.bolts=[bolt(),bolt()];
    advance(city,.12);
    assert.equal(city.events.filter(e=>e.kind==='aircraftBoltHit').length,2);
  }
  assert.equal(easy.defense,null);
  assert.equal(easy.events.filter(e=>e.kind==='hurt').length,0);
  assert.equal(hard.defense.hp,4);
  assert.equal(hard.events.filter(e=>e.kind==='hurt').length,1);
});
