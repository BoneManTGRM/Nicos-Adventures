import {liftOrThrow,releaseHaul,punchPeople,stepHauls,chooseHeld} from './nacho-moves.mjs';
import {makePedestrians,stepPedestrians} from './pedestrians.mjs';
import {grabWall,stepFlyingWalls} from './wall-tear.mjs';
import {cities} from './cities.mjs';
import {makeDefense,stepDefense,disruptDrone} from './defense.mjs';
import {makeTraffic,hitTraffic,stepTraffic} from './traffic.mjs';

// Positions use world units. The monster's height above the street is positive.
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const motionDecay = {swipe:2.8,roar:1.32,land:3.3,flap:2.45,turn:4.2,slide:3.2};
const timedMotions = Object.keys(motionDecay);
const floorImpacts = [.35,.57,.83];
const approach = (a, b, amount) => a + clamp(b - a, -amount, amount);
function seeded(seed) {
  return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}
export function newCity(district,difficulty='easy',monster='skullwing') {
  const route=cities[district];
  const rand = seeded(5903 + district * 977);
  const buildings = [];
  let x = 134;
  for (let i=0;i<route.count;i++) {
    const landmark=!!route.landmark&&i===1;
    let w,h;
    if(route.heights){
      w=landmark?route.landmark.w:route.width+Math.round((rand()-.5)*23);
      h=landmark?route.landmark.h:route.heights[i%route.heights.length]+Math.round((rand()-.5)*12);
    }else{
      w=Math.round(67+rand()*41);
      h=i===0?69:Math.round(64+rand()*(104+district*12));
    }
    const hp = h > 147 ? 4 : h > 88 ? 3 : 2;
    buildings.push({x:x + w / 2,w,h,landmark,kind:(i + district * 2) % 5,seed:Math.floor(rand()*65535),
      hp,maxHp:hp,impact:0,tilt:0,fall:0,fallDir:1,domino:false,ruin:false,impactStage:0,
      hitX:0,hitY:h/2,breakStyle:'punch',damageSites:[]});
    x+=w+(route.gaps?route.gaps[i%route.gaps.length]+rand()*7:17+rand()*32);
  }
  const cars=makeTraffic(buildings,district,x+100);
  return {district,difficulty,monster:monster==='nacho'?'nacho':'skullwing',defense:difficulty==='hard'?makeDefense():null,outcome:null,buildings,cars,people:makePedestrians(buildings,district),length:x+100,time:0,actor:{
    x:77,y:0,vx:0,vy:0,face:1,turn:0,walk:0,stride:0,idle:0,grounded:true,support:null,
    coyote:.09,jumpBuffer:0,jumpHeld:false,airFlaps:1,flight:0,glide:0,dive:false,
    haul:null,throwPose:0,splashPose:0,flopTilt:0,flopWindup:0,grip:null,swipe:0,hand:0,roar:0,land:0,flap:0,slide:0,attackWait:0
  },wrecks:{car:0,police:0,tank:0},score:0,cleared:0,combo:0,maxCombo:0,chainClock:0,charge:1,chunks:[],waves:[],events:[],done:false,finishWait:0};
}
function emit(s,kind,props={}) {s.events.push({kind,district:s.district,...props});}
function hitBuilding(s,b,amount,direction,worldX,height,style,chunk) {
  if(b.hp<=0) return false;
  b.hp=Math.max(0,b.hp-amount); b.impact=1; b.tilt=direction; s.charge=clamp(s.charge+.05,0,1);
  b.hitX=clamp(worldX-b.x,-b.w*.49,b.w*.49);b.hitY=clamp(height,4,b.h-2);
  b.breakStyle=style;b.damageSites.push({x:b.hitX,y:b.hitY,side:Math.sign(b.hitX)||-direction,chunk});
  emit(s,'hit',{b,x:b.x+b.hitX,y:b.hitY,direction,style});s.score+=20;
  if(b.hp===0){
    b.fall=.0001;b.fallDir=direction||1;s.cleared++;s.combo=s.chainClock>0?s.combo+1:1;
    s.maxCombo=Math.max(s.combo,s.maxCombo);s.chainClock=3.35;
    s.score+=100*s.combo+b.maxHp*20+(b.landmark?250:0);
    emit(s,'collapse',{b,direction:b.fallDir,style,combo:s.combo});
    if(s.actor.support===b){s.actor.support=null;s.actor.grounded=false;}
    if(s.cleared===s.buildings.length) s.finishWait=2.18;
  }
  return true;
}
function jump(s) {
  const a=s.actor;
  if(a.dive) return;
  if(a.grounded || a.coyote>0){
    a.splashPose=0;a.throwPose=0;
    if(s.monster==='nacho')a.swipe=0;
    a.vy=s.monster==='nacho'?550:425;a.grounded=false;a.support=null;a.coyote=0;a.airFlaps=1;a.flap=.7;
    emit(s,'leap',{x:a.x,y:a.y});
  }else if(s.monster!=='nacho'&&a.airFlaps>0){
    a.airFlaps--;a.vy=355;a.flap=1;emit(s,'flap',{x:a.x,y:a.y+70});
  }else{a.jumpBuffer=.11;}
}
function swing(s) {
  const a=s.actor;
  if(a.dive || a.attackWait>0 || a.haul?.phase==='eat' || a.haul?.phase==='tear') return;
  if(!a.grounded) {
    if(s.monster==='nacho'){
      if(a.haul)releaseHaul(s);
      a.vx+=a.face*95;
      a.flopWindup=.13;
      a.vy=Math.max(85,Math.min(a.vy,235));
    }else{
      a.flopWindup=.105;a.vy=Math.min(165,Math.max(65,a.vy));a.vx+=a.face*65;
    }
    a.dive=true;a.attackWait=.22;emit(s,'dive',{x:a.x,y:a.y});return;
  }
  if(s.monster==='nacho'){a.splashPose=0;a.throwPose=0;}
  a.swipe=1;a.hand=1-a.hand;a.attackWait=.34;
  if(s.monster==='nacho' && a.haul){
    const item=a.haul.kind;
    releaseHaul(s,true);
    emit(s,'swing',{x:a.x+a.face*40,y:a.y+(item==='car'?108:72),face:a.face,hit:true});
    return;
  }
  const reach=a.x+a.face*52;
  const targets=s.buildings.filter(b=>b.hp>0 && Math.abs(b.x-reach)<b.w/2+42 && b.h+24>=a.y);
  for(const b of targets) hitBuilding(s,b,1,a.face,reach,a.y+49,'punch');
  disruptDrone(s,reach,a.y+56,65);
  const carsHit=hitTraffic(s,reach,a.y+23,53,1,a.face);
  const peopleHit=s.monster==='nacho'&&punchPeople(s,reach);
  emit(s,'swing',{x:reach,y:a.y+58,face:a.face,hit:targets.length>0||carsHit>0||peopleHit});
}
export function press(s,action){
  if(s.done || s.outcome || s.finishWait>0) return;
  const a=s.actor;
  if(action==='jump'){a.jumpHeld=true;jump(s);}
  if(action==='tear'){
    if(a.haul?.kind==='wall')chooseHeld(s,'throw');else grabWall(s);
    return;
  }
  if(action==='extra'){
    if(s.monster==='nacho')chooseHeld(s,'eat');
    else if(a.haul)chooseHeld(s,'throw');else liftOrThrow(s,'car');
    return;
  }
  if(action==='grab'){
    if(s.monster==='nacho')liftOrThrow(s,'car');
    else if(a.haul)chooseHeld(s,'eat');else liftOrThrow(s,'person');
    return;
  }
  if(action==='roar'&&s.monster==='nacho'){liftOrThrow(s,'person');return;}
  if(action==='attack') swing(s);
  if(action==='roar' && s.charge>=.999 && !a.dive){
    s.charge=0;a.roar=1;s.waves.push({x:a.x,y:a.y+68,age:0,hit:new Set(),vehicles:new Set()});
    emit(s,'roar',{x:a.x,y:a.y+68});
  }
}
function land(s,roof,impactSpeed){
  const a=s.actor, stomp=a.dive;
  a.grounded=true;a.support=roof;a.y=roof?.h ?? 0;a.vy=0;a.dive=false;a.airFlaps=1;
  a.land=stomp?1:clamp(impactSpeed/600,.2,.74);
  const belly=stomp&&s.monster==='nacho';
  const impactX=a.x+(belly?a.face*18:0);
  if(stomp)a.splashPose=1;
  emit(s,stomp?'stomp':'land',{x:impactX,y:a.y,power:a.land,belly,meteor:stomp&&!belly});
  if(stomp){
    let brokeFloor=false;
    for(const b of s.buildings){
      if(Math.abs(b.x-impactX)>b.w/2+(belly?110:100) || b.h+40<a.y) continue;
      hitBuilding(s,b,belly?4:3,Math.sign(b.x-impactX)||a.face,impactX,a.y+8,'stomp');
      if(b===roof&&b.hp===0) brokeFloor=true;
    }
    hitTraffic(s,impactX,a.y+5,belly?130:104,belly?4:3,0);
    disruptDrone(s,a.x,a.y+22,112);
    if(brokeFloor){a.grounded=false;a.support=null;a.vy=-145;}
  }
  if(a.jumpBuffer>0 && a.grounded){a.jumpBuffer=0;jump(s);}
}
export function step(s,input,dt) {
  if(s.done)return;
  const a=s.actor; s.time+=dt;
  if(s.outcome==='defeat'){
    s.downTime=Math.min(1,s.downTime+dt);
    const floor=a.support?.h||0;
    if(a.y>floor){a.vy=Math.min(0,a.vy)-dt*780;a.y=Math.max(floor,a.y+a.vy*dt);}
    s.defense.hurt=Math.max(0,s.defense.hurt-dt);
    if(s.downTime>=1){s.done=true;emit(s,'defeat');}
    return;
  }
  for(const key of timedMotions) a[key]=Math.max(0,a[key]-dt*motionDecay[key]);
  a.attackWait=Math.max(0,a.attackWait-dt);a.jumpBuffer=Math.max(0,a.jumpBuffer-dt);
  s.chainClock=Math.max(0,s.chainClock-dt);if(!s.chainClock)s.combo=0;
  s.charge=Math.min(1,s.charge+dt*.044);
  const axis=Number(input.right)-Number(input.left);
  if(axis && a.face!==axis){a.turn=1;if(a.grounded&&Math.abs(a.vx)>110)a.slide=1;a.face=axis;}
  const acceleration=a.grounded?690:430;
  a.vx=approach(a.vx,axis*(a.dive?120:a.roar>.55?116:227),dt*(axis?acceleration:a.grounded?670:118));
  a.x=clamp(a.x+a.vx*dt,26,s.length-24);
  const speed=Math.abs(a.vx)/227;
  a.walk+=(speed-a.walk)*(1-Math.exp(-10*dt));a.stride+=dt*(2.2+speed*7);a.idle+=dt;
  a.jumpHeld=!!input.jump;
  if(a.grounded && a.support && (a.support.hp<=0 || Math.abs(a.x-a.support.x)>a.support.w/2+5)){
    a.grounded=false;a.support=null;a.coyote=.08;
  }
  if(!a.grounded){
    a.coyote=Math.max(0,a.coyote-dt);
    const gliding=s.monster!=='nacho' && a.jumpHeld && a.vy<0 && !a.dive;
    a.glide+=(Number(gliding)-a.glide)*(1-Math.exp(-9*dt));
    const old=a.y;
    if(a.flopWindup>0){
      a.flopWindup=Math.max(0,a.flopWindup-dt);
      a.vy=a.flopWindup>0?a.vy-dt*780:(s.monster==='nacho'?-390:-575);
    }else a.vy=Math.max(gliding?-75:-780,a.vy-dt*(a.dive?1880:gliding?300:a.jumpHeld?730:1080));
    a.y+=a.vy*dt;
    if(a.vy<=0){
      let roof=null;
      for(const b of s.buildings) {
        if(b.hp>0 && Math.abs(a.x-b.x)<=b.w/2+4 && old>=b.h-.1 && a.y<=b.h && (!roof||b.h>roof.h))roof=b;
      }
      if(roof || a.y<=0)land(s,roof,-a.vy);
    }
  }else{a.glide=Math.max(0,a.glide-dt*8);a.coyote=.085;}
  a.flight+=((a.grounded?0:1)-a.flight)*(1-Math.exp(-12*dt));
  if(input.attack && a.grounded && a.attackWait===0 && !s.finishWait)swing(s);
  for(const wave of s.waves) {
    wave.age+=dt;
    for(const b of s.buildings){
      if(wave.hit.has(b)||b.hp<=0)continue;
      const dx=Math.max(0,Math.abs(b.x-wave.x)-b.w/2),dy=Math.max(0,wave.y-b.h);
      if(Math.hypot(dx,dy)<Math.min(225,wave.age*470)){
        wave.hit.add(b);hitBuilding(s,b,2,Math.sign(b.x-wave.x)||a.face,wave.x,wave.y,'roar');
      }
    }
    const radius=Math.min(220,wave.age*470);
    hitTraffic(s,wave.x,wave.y,radius,2,0,wave.vehicles);
    disruptDrone(s,wave.x,wave.y,radius);
  }
  s.waves=s.waves.filter(w=>w.age<.62);
  for(let i=0;i<s.buildings.length;i++){
    const b=s.buildings[i];b.impact=Math.max(0,b.impact-dt*2.45);
    if(!b.fall||b.ruin)continue;
    b.fall=Math.min(1,b.fall+dt/1.55);
    if(b.impactStage<floorImpacts.length && b.fall>=floorImpacts[b.impactStage]){
      const k=b.impactStage++,x=b.x+b.fallDir*(k-1)*b.w*.25;
      emit(s,'floorImpact',{x,y:1,width:b.w*(.46+k*.15),dir:b.fallDir,district:s.district});
      if(k===1)hitTraffic(s,x,4,b.w*.58,3,0);
    }
    if(!b.domino&&b.fall>.45){
      b.domino=true;const neighbor=s.buildings[i+b.fallDir];
      if(neighbor&&Math.abs(neighbor.x-b.x)-(b.w+neighbor.w)/2<b.h*.33)hitBuilding(s,neighbor,1,b.fallDir,b.x,b.h*.47,'crash');
    }
    if(b.fall>=1){b.ruin=true;emit(s,'settle',{x:b.x,y:6,w:b.w});}
  }
  stepHauls(s,dt,hitBuilding);
  if(s.chunks.length)stepFlyingWalls(s,dt,hitBuilding,hitTraffic);
  stepTraffic(s,dt,hitBuilding);
  stepDefense(s,dt);
  if(!s.outcome)stepPedestrians(s,dt);
  if(s.finishWait>0){s.finishWait-=dt;if(s.finishWait<=0){s.done=true;s.outcome='clear';emit(s,'clear');}}
}
