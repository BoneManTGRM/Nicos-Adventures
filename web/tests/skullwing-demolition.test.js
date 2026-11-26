import {describe,expect,it} from 'vitest';
import {newCity,press,step} from '../public/games/skullwing/simulation.mjs';

const idle={right:false,left:false,jump:false,attack:false};
function advance(city,seconds,input=idle){
  for(let i=0;i<Math.round(seconds*120);i++)step(city,input,1/120);
}
const events=(city,kind)=>city.events.filter(e=>e.kind===kind);

describe('Skullwing street destruction',()=>{
  it('launches the starting car into a tower and resolves every floor impact',()=>{
    const city=newCity(0),car=city.cars[0],tower=city.buildings[0];
    press(city,'attack');advance(city,.09);
    expect(car.state).toBe('airborne');
    expect(car.y).toBeGreaterThan(6);
    expect(tower.damageSites).toHaveLength(1);
    advance(city,.37);
    expect(car.state).toBe('wreck');
    expect(tower.breakStyle).toBe('crash');
    expect(tower.fall).toBeGreaterThan(0);
    expect(tower.ruin).toBe(false);
    advance(city,2);
    expect(tower.ruin).toBe(true);
    expect(tower.impactStage).toBe(3);
    expect(events(city,'floorImpact')).toHaveLength(3);
    expect(events(city,'vehicleExplosion').some(e=>e.type==='police')).toBe(true);
    expect(events(city,'vehicleExplosion').some(e=>e.chain>0)).toBe(true);
    expect(city.cars.filter(v=>v.state==='wreck')).toHaveLength(Object.values(city.wrecks).reduce((a,b)=>a+b,0));
  });
  it('dents a tank on the first two punches and awards its destruction once',()=>{
    const city=newCity(0),tank=city.cars.find(v=>v.type==='tank');
    city.cars=[tank];city.actor.x=tank.x-43;
    for(const hp of [2,1]){
      press(city,'attack');expect(tank.hp).toBe(hp);
      expect(tank.state).toBe('driving');advance(city,.35);
    }
    press(city,'attack');expect(tank.state).toBe('airborne');
    advance(city,3);press(city,'attack');advance(city,1);
    expect(tank.state).toBe('wreck');expect(city.wrecks.tank).toBe(1);
    expect(events(city,'vehicleExplosion')).toHaveLength(1);
  });
  it('limits roof punches by height and applies a passing roar only once per vehicle',()=>{
    const city=newCity(0),tank=city.cars.find(v=>v.type==='tank');
    city.cars=[tank];
    city.actor.x=tank.x-42;city.actor.y=170;
    press(city,'attack');expect(tank.hp).toBe(3);
    city.actor.y=0;press(city,'roar');advance(city,.62);
    expect(tank.hp).toBe(1);expect(events(city,'vehicleHit')).toHaveLength(1);
  });
  it.each([0,1,2])('can clear district %i with ordinary movement and held Smash',district=>{
    const city=newCity(district);
    expect(new Set(city.cars.map(v=>v.type))).toEqual(new Set(['car','police','tank']));
    for(let i=0;i<120*60&&!city.done;i++){
      const next=city.buildings.find(b=>b.hp>0),delta=next?next.x-city.actor.x:0;
      step(city,{...idle,right:delta>50,left:delta< -50,attack:true},1/120);
    }
    expect(city.done).toBe(true);
    expect(city.buildings.every(b=>b.ruin)).toBe(true);
    expect(events(city,'clear')).toHaveLength(1);
    const wrecks=city.cars.filter(v=>v.state==='wreck');
    expect(events(city,'vehicleExplosion')).toHaveLength(wrecks.length);
    expect(city.wrecks.tank).toBeGreaterThan(0);
  });
});
