import {describe,expect,it} from 'vitest';
import {cities} from '../public/games/skullwing/cities.mjs';
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
  it.each(cities.flatMap((_,i)=>['easy','hard'].map(mode=>[i,mode])))('can clear district %i on %s with ordinary movement and held Smash',(district,mode)=>{
    const city=newCity(district,mode);
    expect(new Set(city.cars.map(v=>v.type))).toEqual(new Set(['car','police','tank']));
    for(let i=0;i<120*60&&!city.done;i++){
      const next=city.buildings.find(b=>b.hp>0),delta=next?next.x-city.actor.x:0;
      step(city,{...idle,right:delta>50,left:delta< -50,attack:true},1/120);
    }
    expect(city.outcome).toBe('clear');
    expect(city.done).toBe(true);
    expect(city.buildings.every(b=>b.ruin)).toBe(true);
    expect(events(city,'clear')).toHaveLength(1);
    const wrecks=city.cars.filter(v=>v.state==='wreck');
    expect(events(city,'vehicleExplosion')).toHaveLength(wrecks.length);
    expect(city.wrecks.tank).toBeGreaterThan(0);
  });
});

describe('Skullwing difficulty',()=>{
  it.each(cities.map((_,i)=>i))('lets idle players rest on Easy and knocks them out on Hard in city %i',district=>{
    const easy=newCity(district),hard=newCity(district,'hard');
    advance(easy,22);advance(hard,22);
    expect(easy.defense).toBeNull();expect(easy.done).toBe(false);
    expect(hard.done).toBe(true);expect(hard.outcome).toBe('defeat');
    expect(hard.defense.hp).toBe(0);expect(events(hard,'hurt')).toHaveLength(5);
    expect(events(hard,'warning').length).toBeGreaterThanOrEqual(5);
    expect(events(hard,'defeat')).toHaveLength(1);expect(events(hard,'clear')).toHaveLength(0);
  });
  it('locks the marked position and allows a player to walk clear or interrupt a drone',()=>{
    const moving=newCity(3,'hard');advance(moving,2.5);
    expect(moving.defense.attacks[0].phase).toBe('warning');
    const target=moving.defense.attacks[0].tx;advance(moving,.75,{...idle,right:true});
    expect(moving.defense.attacks[0].tx).toBe(target);
    advance(moving,1.5);expect(moving.defense.hp).toBe(5);
    const roaring=newCity(1,'hard');advance(roaring,2.5);press(roaring,'roar');advance(roaring,.7);
    expect(events(roaring,'droneHit')).toHaveLength(1);expect(roaring.defense.attacks).toHaveLength(0);
  });
  it.each(['tank','police'])('lets a street %s attack, and smashing it cancels its warning',type=>{
    const city=newCity(0,'hard'),v=city.cars.find(v=>v.type===type);
    v.x=city.actor.x+70;v.vx=0;v.patrolMin=v.x-5;v.patrolMax=v.x+5;
    city.cars=[v];city.defense.turn=1;city.defense.next=.01;
    advance(city,.1);expect(city.defense.attacks[0].type).toBe(type);
    for(let i=0;i<3;i++){press(city,'attack');advance(city,.35);}
    expect(events(city,'bolt')).toHaveLength(0);expect(city.defense.hp).toBe(5);
  });
});

describe('Skullwing grab and eat',()=>{
  it.each(cities.map((_,i)=>i))('lets the player carry a person and eat exactly once in district %i',district=>{
    const city=newCity(district,'hard'),person=city.people[0];
    city.defense.hp=3;
    press(city,'grab');
    expect(city.actor.grip.person).toBe(person);
    expect(person.onStreet).toBe(false);
    advance(city,.55);
    press(city,'jump');
    advance(city,.2,{...idle,left:true,jump:true});
    expect(city.actor.grip.phase).toBe('hold');
    expect(city.score).toBe(0);
    press(city,'grab');press(city,'grab');
    advance(city,.9);
    expect(city.actor.grip).toBeNull();
    expect(city.defense.hp).toBe(4);
    expect(events(city,'chomp')).toEqual([{kind:'chomp',points:75,healed:true}]);
    expect(city.score).toBe(75);
  });

  it('queues a quick second tap, caps health, and never grabs remotely or after defeat',()=>{
    for(const difficulty of ['easy','hard']){
      const city=newCity(0,difficulty);
      city.actor.face=-1;
      press(city,'grab');expect(city.actor.grip).toBeNull();
      city.actor.face=1;city.actor.y=88;
      press(city,'grab');expect(city.actor.grip).toBeNull();
      city.actor.y=0;
      for(let i=0;i<5;i++)press(city,'grab');
      advance(city,1.3);
      expect(city.score).toBe(75);
      expect(city.defense?.hp??5).toBe(5);
      expect(events(city,'chomp')).toHaveLength(1);
      press(city,'grab');expect(city.actor.grip).toBeNull();
      city.outcome='defeat';city.actor.x=city.people[1].x-28;
      press(city,'grab');expect(city.actor.grip).toBeNull();
    }
  });
});

describe('Nacho the heavyweight luchador',()=>{
  it.each(cities.map((_,i)=>i))('belly-flops through a rooftop and wrecks street traffic in district %i',district=>{
    const s=newCity(district,'hard','nacho'), b=s.buildings[0];
    s.actor.x=b.x;
    press(s,'jump');advance(s,.3,{...idle,jump:true});
    expect(s.actor.y).toBeGreaterThan(b.h);
    press(s,'attack');advance(s,.8);
    expect(events(s,'stomp').some(e=>e.belly&&e.y===b.h)).toBe(true);
    expect(b.hp).toBe(0);
    s.actor.x=s.cars[0].x;
    press(s,'jump');advance(s,.10);press(s,'attack');advance(s,.9);
    expect(Object.values(s.wrecks).reduce((sum,n)=>sum+n,0)).toBeGreaterThan(0);
  });
  it('can lift a car, jump, turn and throw it into a building',()=>{
    const s=newCity(0,'easy','nacho'),car=s.cars[0];
    press(s,'grab');advance(s,.4);expect(s.actor.haul.target).toBe(car);
    expect(car.state).toBe('held');expect(s.score).toBe(0);
    press(s,'jump');advance(s,.08,{...idle,left:true});
    press(s,'grab');advance(s,.22,{...idle,left:true});
    expect(s.actor.haul).toBeNull();expect(car.vx).toBeLessThan(0);
    expect(car.state).toBe('airborne');expect(car.y).toBeGreaterThan(120);
    const flat=newCity(0,'easy','nacho'), first=flat.cars[0];
    // Bring the next facade into the overhead throw's path.
    flat.buildings[0].h=175;
    press(flat,'grab');press(flat,'grab');advance(flat,1.4);
    expect(first.state).toBe('wreck');expect(flat.buildings[0].hp).toBe(0);
    expect(events(flat,'toss')).toHaveLength(1);
  });
  it('can punch a person and a car, or separately grab and throw the person',()=>{
    const punch=newCity(0,'easy','nacho');press(punch,'attack');
    expect(punch.people[0].toss.vx).toBeGreaterThan(0);
    expect(punch.cars[0].state).toBe('airborne');
    const s=newCity(0,'easy','nacho'),p=s.people[0];
    press(s,'roar');press(s,'grab');advance(s,.4);
    expect(s.actor.haul.target).toBe(p);expect(s.cars[0].state).toBe('driving');
    press(s,'roar');advance(s,.2);
    expect(p.toss.y).toBeGreaterThan(60);expect(s.score).toBe(35);
    advance(s,1.5);
    expect(p.onStreet).toBe(true);expect(p.toss).toBeNull();
    s.actor.x=p.x-32;press(s,'roar');press(s,'roar');advance(s,1.8);
    expect(s.score).toBe(35);expect(events(s,'toss')).toHaveLength(2);
  });
});

it.each([['grab','car'],['roar','person']])('Nacho can punch a held %s object away',(action,kind)=>{
  const s=newCity(0,'easy','nacho');
  press(s,action);advance(s,.45);press(s,'attack');advance(s,.03);
  expect(s.actor.haul).toBeNull();
  expect(events(s,'toss')[0]).toMatchObject({target:kind,punched:true});
});
