import {frames} from './nacho-frames.mjs';
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

// The drawn hands and the carried object's trajectory share the same lift timeline.
const liftToChest=['scoop','scoopLow1','scoopLow2','low','lowRack1','lowRack2','rack'];
const carLift=[...liftToChest,'rackPress1','rackPress2','press','pressOverhead1','pressOverhead2','overhead'];
const personLift=[...liftToChest,'rackGrip1','rackGrip2','grip'];
function palm(name) {
  const f=frames[name];
  return {
    x:(f.hand[0]-f.pivot)*f.height*f.rect[2]/f.rect[3],
    y:(1-f.hand[1])*f.height-(f.bottom??0)
  };
}
// Space the cels along the path that the painted palms actually travel. The
// prop thus accelerates once through the lift, even where poses are far apart.
function liftTrack(keys) {
  let distance=0;
  return keys.map((name,i)=>{
    const point=palm(name);
    if(i){
      const previous=palm(keys[i-1]);
      distance+=Math.hypot(point.x-previous.x,point.y-previous.y);
    }
    return {name,...point,distance};
  });
}
const tracks={car:liftTrack(carLift),person:liftTrack(personLift)};
const reach=['guard','guardScoop1','guardScoop2','scoop'];

export function carryPose(a) {
  const h=a.haul,skull=h.monster==='skullwing';
  if(h.kind==='wall'){
    const k=h.phase==='tear'?ease((h.age-.19)/.30):1;
    return {name:skull?(k<.35?'strike':'hold'):(k<.35?'punch':'rack'),lean:Math.sin(k*Math.PI)*-.055,
      x:skull?91:23,y:skull?101:81,wallPull:k};
  }
  if(skull){
    const k=h.phase==='lift'?ease((h.age-.12)/.37):1;
    const bite=h.phase==='eat'?ease(h.age/BITE):0;
    return {name:bite>.33?'bite':k<.47?'reach':'hold',lean:0,x:mix(91,33,bite),y:mix(101,100,bite),lift:k};
  }
  const track=tracks[h.kind],last=track[track.length-1];
  if(h.phase==='eat'){
    const k=ease(h.age/BITE);
    return {name:k<.32?'snackLift':k<1?'snackBite':'snackGulp',lean:0,x:mix(last.x,14,k),y:mix(last.y,109,k)};
  }
  if(h.phase==='lift'&&h.age<REACH){
    const index=Math.round(ease(h.age/REACH)*(reach.length-1));
    return {...track[0],name:reach[index],lean:0};
  }
  if(h.phase!=='lift'){
    const lean=h.phase==='throw'?-.09*Math.sin(Math.PI*Math.min(1,h.age/WINDUP)):0;
    return {...last,lean};
  }
  const distance=last.distance*ease((h.age-REACH)/HOIST);
  const end=track.findIndex((p,i)=>i>0&&p.distance>=distance);
  if(end<1)return {...last,lean:0};
  const from=track[end-1],to=track[end],part=(distance-from.distance)/(to.distance-from.distance);
  return {name:part<.5?from.name:to.name,lean:0,x:mix(from.x,to.x,part),y:mix(from.y,to.y,part)};
}

export function carryAnchor(a,pose=carryPose(a)) {
  const h=a.haul,{x:handX,y:height,lean}=pose;
  const x=a.x+a.face*(handX*Math.cos(lean)+height*Math.sin(lean));
  const y=a.y+height*Math.cos(lean)-handX*Math.sin(lean);
  if(pose.wallPull!==undefined||pose.lift!==undefined){
    const k=pose.wallPull??pose.lift;
    return {x:mix(h.startX,x,k),y:mix(h.startY,y,k)};
  }
  if(h.phase==='lift'&&h.age<REACH+.065){
    const k=ease((h.age-REACH)/.065);
    return {x:mix(h.startX,x,k),y:mix(h.startY,y,k)};
  }
  return {x,y};
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
  a.haul = null; a.grip=null; a.throwPose = 1;
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
  a.flopTilt += ((a.dive || a.splashPose>.5 ? 1 : 0)-a.flopTilt)*(1-Math.exp(-dt*17));
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
