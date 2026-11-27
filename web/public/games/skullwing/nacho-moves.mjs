import {stepWallTear} from './wall-tear.mjs';
import {BITE,RELEASE,BITE_POINTS,grabTarget} from './pedestrians.mjs';

const REACH = .10;
const HOIST = .32;
const WINDUP = .16;
const mix = (a, b, t) => a + (b - a) * t;
const ease = n => { const t = Math.max(0, Math.min(1, n)); return t*t*(3-2*t); };

export function carTarget(s) {
  const a = s.actor;
  if (!a.grounded || a.support || a.y > 3 || a.dive) return null;
  let nearest = null, best = Infinity;
  for (const car of s.cars) {
    const dx = (car.x - a.x) * a.face;
    if (car.state !== 'driving' || dx < -6 || dx > 64 + car.width*.25) continue;
    const gap = Math.abs(dx - 34);
    if (gap < best) { best = gap; nearest = car; }
  }
  return nearest;
}

// Physics, the held object and both wrists follow one path in world space.
export function carryAnchor(a) {
  const h=a.haul,ape=h.monster==='skullwing',car=h.kind==='car';
  const direction=Math.sin((a.yaw??a.face)*Math.PI/2);
  const rest=ape?{x:91,y:101}:car?{x:1,y:146}:h.kind==='wall'?{x:23,y:81}:{x:51,y:101};
  let x=rest.x,y=rest.y;
  if(h.phase==='lift'||h.phase==='tear'){
    const wall=h.kind==='wall',delay=wall?.19:ape?.12:REACH;
    const k=ease((h.age-delay)/(wall?.30:ape?.37:HOIST));
    const arc=Math.sin(Math.PI*k);
    return {x:mix(h.startX,a.x+direction*x,k)+direction*arc*(wall?-4:car?13:7),
      y:mix(h.startY,a.y+y,k)};
  }
  if(h.phase==='throw'){
    const t=Math.min(1,h.age/WINDUP),wind=Math.sin(Math.PI*t);
    x-=10*wind;y+=5*wind;
  }else if(h.phase==='eat'){
    const k=ease(h.age/BITE);
    x=mix(x,ape?68:10,k);y=mix(y,ape?96:116,k);
  }
  return {x:a.x+direction*x,y:a.y+y};
}

export function liftOrThrow(s, kind) {
  const a = s.actor, h = a.haul;
  if(h){if(h.kind===kind)chooseHeld(s,'throw');return;}
  const target = kind === 'car' ? carTarget(s) : grabTarget(s);
  if (!target) { s.events.push({kind:'liftMiss', target:kind}); return; }
  if (kind === 'car') target.state = 'held';
  else target.onStreet = false;
  a.haul = {kind, monster:s.monster,target, phase:'lift', age:0, startX:target.x, startY:kind==='car'?0:8, queued:null};
  if(s.monster==='skullwing'&&kind==='person'){a.grip=a.haul;a.grip.person=target;}
  s.events.push({kind:'lift', target:kind});
}

export function chooseHeld(s,choice) {
  const h=s.actor.haul;
  if(!h||h.phase==='eat'||h.phase==='throw'||(h.kind==='wall'&&choice==='eat'))return;
  if(h.phase==='lift'||h.phase==='tear'){h.queued??=choice;return;}
  h.phase=choice;h.age=0;
}

function launchPerson(person, x, y, vx, vy) {
  person.x = x; person.onStreet = false;
  person.toss = {y,vx,vy,angle:0,age:0};
}

export function releaseHaul(s, punched=false) {
  const a = s.actor, h = a.haul;
  if (!h||h.phase==='eat'||(h.kind==='wall'&&!h.target.detached)) return;
  const {x,y} = carryAnchor(a), target = h.target;
  if(h.kind==='wall'){
    s.chunks.push({...target,x,y:y+9,vx:a.face*308+a.vx*.25,vy:105,age:0,angle:0,spin:a.face*5.4});
  }else if (h.kind === 'car') {
    Object.assign(target,{x,y,dir:a.face,state:'airborne',vx:a.face*(punched?360:302)+a.vx*.25,vy:punched?22:70,
      angle:0,spin:a.face*4.8,hp:0,chain:0,flightAge:0,fuse:2.6,thrown:true});
  } else {
    launchPerson(target,x,y-8,a.face*(punched?282:225)+a.vx*.25,punched?82:154);
    if (!target.throwScored) { s.score += 35; target.throwScored = true; }
  }
  a.releaseHand={x:(x-a.x)*(Math.sign(a.yaw)||a.face),y:a.y-y};
  a.throwKind=h.kind;a.haul = null; a.grip=null; a.throwPose = 1;
  s.events.push({kind:'toss',target:h.kind,x,y,dir:a.face,punched});
}

export function punchPeople(s, x) {
  if (s.actor.y > 25) return false;
  let hit = false;
  for (const p of s.people) {
    if (!p.onStreet || Math.abs(p.x-x)>40) continue;
    launchPerson(p,p.x,3,s.actor.face*136,128);
    hit = true;
  }
  return hit;
}

export function stepHauls(s, dt, hitBuilding) {
  const a = s.actor;
  a.throwPose = Math.max(0,a.throwPose-2.8*dt);
  a.splashPose = Math.max(0,a.splashPose-dt*2.4);
  const h = a.haul;
  if (h) {
    h.age += dt;
    if(h.phase==='tear')stepWallTear(s,h,hitBuilding);
    else if(h.phase==='lift'&&h.age>=(h.monster==='skullwing'?.49:REACH+HOIST)){h.phase=h.queued||'hold';h.age=0;}
    else if(h.phase==='eat'){
      if(h.age>=BITE&&!h.bit&&!s.outcome&&!s.finishWait){
        h.bit=true;
        const car=h.kind==='car',points=car?125:BITE_POINTS;
        if(car){s.cars=s.cars.filter(v=>v!==h.target);s.wrecks[h.target.type]++;}
        const healed=!!s.defense&&s.defense.hp<s.defense.maxHp;
        if(healed)s.defense.hp++;
        s.score+=points;s.events.push({kind:'chomp',points,healed});
      }
      if(h.age>=RELEASE){a.haul=null;a.grip=null;}
    }
    else if (h.phase === 'throw' && h.age>=WINDUP) releaseHaul(s);
  }
  for (const p of s.people) {
    const f = p.toss;
    if (!f) continue;
    f.age += dt; f.vy -= 440*dt;
    f.y += f.vy*dt; p.x = Math.max(12,Math.min(s.length-12,p.x+f.vx*dt));
    f.angle += dt*Math.sign(f.vx)*5.3;
    if (f.y<=0 && f.vy<0) {
      p.home=p.x; p.dir=Math.sign(f.vx)||1; p.toss=null; p.onStreet=true;
      s.events.push({kind:'personLanded',x:p.x,y:1});
    }
  }
}
