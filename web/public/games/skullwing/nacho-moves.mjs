import {grabTarget} from './pedestrians.mjs';

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

// Shared by release physics and the hand rig, including when Nacho turns or jumps.
export function carryAnchor(a) {
  const h = a.haul, car = h.kind === 'car';
  let x = a.x + a.face * (car ? 9 : 43), y = a.y + (car ? 142 : 75);
  if (h.phase === 'lift') {
    const k = ease(h.age / HOIST);
    x = mix(h.startX, x, k) + Math.sin(k*Math.PI)*12*a.face;
    y = mix(h.startY, y, k);
  } else if (h.phase === 'throw') {
    const wind = Math.sin(Math.PI*Math.min(1,h.age/WINDUP));
    x -= a.face*16*wind; y += 7*wind;
  }
  return {x,y};
}

export function liftOrThrow(s, kind) {
  const a = s.actor, h = a.haul;
  if (h) {
    if (h.kind !== kind || h.phase === 'throw') return;
    if (h.phase === 'lift') h.queued = true;
    else { h.phase = 'throw'; h.age = 0; }
    return;
  }
  const target = kind === 'car' ? carTarget(s) : grabTarget(s);
  if (!target) { s.events.push({kind:'liftMiss', target:kind}); return; }
  if (kind === 'car') target.state = 'held';
  else target.onStreet = false;
  a.haul = {kind, target, phase:'lift', age:0, startX:target.x, startY:kind==='car'?0:8, queued:false};
  s.events.push({kind:'lift', target:kind});
}

function launchPerson(person, x, y, vx, vy) {
  person.x = x; person.onStreet = false;
  person.toss = {y,vx,vy,angle:0,age:0};
}

export function releaseHaul(s, punched=false) {
  const a = s.actor, h = a.haul;
  if (!h) return;
  const {x,y} = carryAnchor(a), target = h.target;
  if (h.kind === 'car') {
    Object.assign(target,{x,y,dir:a.face,state:'airborne',vx:a.face*(punched?360:302)+a.vx*.25,vy:punched?22:70,
      angle:0,spin:a.face*4.8,hp:0,chain:0,flightAge:0,fuse:2.6,thrown:true});
  } else {
    launchPerson(target,x,y-8,a.face*(punched?282:225)+a.vx*.25,punched?82:154);
    if (!target.throwScored) { s.score += 35; target.throwScored = true; }
  }
  a.haul = null; a.throwPose = 1;
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

export function stepNacho(s, dt) {
  const a = s.actor;
  a.throwPose = Math.max(0,a.throwPose-2.8*dt);
  a.splashPose = Math.max(0,a.splashPose-dt*2.4);
  a.flopTilt += ((a.dive || a.splashPose>.5 ? 1 : 0)-a.flopTilt)*(1-Math.exp(-dt*17));
  const h = a.haul;
  if (h) {
    h.age += dt;
    if (h.phase === 'lift' && h.age>=HOIST) {h.phase=h.queued?'throw':'hold';h.age=0;}
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
