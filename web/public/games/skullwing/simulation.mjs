// Positions use world units. The monster's height above the street is positive.
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const motionDecay = {swipe:2.8,roar:1.32,land:3.3,flap:2.45,turn:4.2,slide:3.2};
const timedMotions = Object.keys(motionDecay);
const approach = (a, b, amount) => a + clamp(b - a, -amount, amount);
function seeded(seed) {
  return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
}
export function newCity(district) {
  const rand = seeded(5903 + district * 977);
  const buildings = [];
  let x = 134;
  const count = [12, 14, 16][district];
  for (let i = 0; i < count; i++) {
    const w = Math.round(67 + rand() * 41);
    const h = i === 0 ? 69 : Math.round(64 + rand() * (104 + district * 12));
    const hp = h > 147 ? 4 : h > 88 ? 3 : 2;
    buildings.push({x:x + w / 2, w,h,kind:(i + district * 2) % 5,seed:Math.floor(rand()*65535),
      hp,maxHp:hp,impact:0,tilt:0,fall:0,fallDir:1,domino:false,ruin:false});
    x += w + 17 + rand() * 32;
  }
  const cars = buildings.filter((_,i)=>i%2===0).map((b,i)=>({
    x:b.x-28,y:0,vx:(i%2?1:-1)*(14+i),vy:0,spin:0,angle:0,launched:false,color:i%4,rest:0,struck:new Set()
  }));
  return {district,buildings,cars,length:x+100,time:0,actor:{
    x:77,y:0,vx:0,vy:0,face:1,turn:0,walk:0,stride:0,idle:0,grounded:true,support:null,
    coyote:.09,jumpBuffer:0,jumpHeld:false,airFlaps:1,flight:0,glide:0,dive:false,
    swipe:0,hand:0,roar:0,land:0,flap:0,slide:0,attackWait:0
  },score:0,cleared:0,combo:0,maxCombo:0,chainClock:0,charge:1,waves:[],events:[],done:false,finishWait:0};
}
function emit(s,kind,props={}) {s.events.push({kind,...props});}
function hitBuilding(s,b,amount,direction) {
  if(b.hp<=0) return false;
  b.hp=Math.max(0,b.hp-amount); b.impact=1; b.tilt=direction; s.charge=clamp(s.charge+.05,0,1);
  emit(s,'hit',{b,direction});s.score+=20;
  if(b.hp===0){
    b.fall=.0001;b.fallDir=direction||1;s.cleared++;s.combo=s.chainClock>0?s.combo+1:1;
    s.maxCombo=Math.max(s.combo,s.maxCombo);s.chainClock=3.35;
    s.score+=100*s.combo+b.maxHp*20;
    emit(s,'collapse',{b,direction:b.fallDir,combo:s.combo});
    if(s.actor.support===b){s.actor.support=null;s.actor.grounded=false;}
    if(s.cleared===s.buildings.length) s.finishWait=1.25;
  }
  return true;
}
function flingCars(s,x,radius,direction,power) {
  for(const car of s.cars) {
    if(car.launched || Math.abs(car.x-x)>radius) continue;
    car.launched=true;car.vx=(direction || Math.sign(car.x-x) || 1)*(100+power*60);
    car.vy=175+power*55;car.spin=car.vx*.035;s.score+=45;
    emit(s,'car',{x:car.x,y:16});
  }
}
function jump(s) {
  const a=s.actor;
  if(a.dive) return;
  if(a.grounded || a.coyote>0){
    a.vy=425;a.grounded=false;a.support=null;a.coyote=0;a.airFlaps=1;a.flap=.7;
    emit(s,'leap',{x:a.x,y:a.y});
  }else if(a.airFlaps>0){
    a.airFlaps--;a.vy=355;a.flap=1;emit(s,'flap',{x:a.x,y:a.y+70});
  }else{a.jumpBuffer=.11;}
}
function swing(s) {
  const a=s.actor;
  if(a.dive || a.attackWait>0) return;
  if(!a.grounded) {
    a.dive=true;a.vy=Math.min(a.vy,-370);a.attackWait=.22;emit(s,'dive',{x:a.x,y:a.y});return;
  }
  a.swipe=1;a.hand=1-a.hand;a.attackWait=.34;
  const reach=a.x+a.face*52;
  const targets=s.buildings.filter(b=>b.hp>0 && Math.abs(b.x-reach)<b.w/2+42 && b.h+24>=a.y);
  for(const b of targets) hitBuilding(s,b,1,a.face);
  flingCars(s,reach,62,a.face,1);
  emit(s,'swing',{x:reach,y:a.y+58,face:a.face,hit:targets.length>0});
}
export function press(s,action){
  if(s.done || s.finishWait>0) return;
  const a=s.actor;
  if(action==='jump'){a.jumpHeld=true;jump(s);}
  if(action==='attack') swing(s);
  if(action==='roar' && s.charge>=.999 && !a.dive){
    s.charge=0;a.roar=1;s.waves.push({x:a.x,y:a.y+68,age:0,hit:new Set()});
    emit(s,'roar',{x:a.x,y:a.y+68});
  }
}
function land(s,roof,impactSpeed){
  const a=s.actor, stomp=a.dive;
  a.grounded=true;a.support=roof;a.y=roof?.h ?? 0;a.vy=0;a.dive=false;a.airFlaps=1;
  a.land=stomp?1:clamp(impactSpeed/600,.2,.74);
  emit(s,stomp?'stomp':'land',{x:a.x,y:a.y,power:a.land});
  if(stomp){
    let brokeFloor=false;
    for(const b of s.buildings){
      if(Math.abs(b.x-a.x)>b.w/2+80 || b.h+40<a.y) continue;
      hitBuilding(s,b,3,Math.sign(b.x-a.x)||a.face);
      if(b===roof&&b.hp===0) brokeFloor=true;
    }
    flingCars(s,a.x,120,0,2);
    if(brokeFloor){a.grounded=false;a.support=null;a.vy=-145;}
  }
  if(a.jumpBuffer>0 && a.grounded){a.jumpBuffer=0;jump(s);}
}
export function step(s,input,dt) {
  if(s.done)return;
  const a=s.actor; s.time+=dt;
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
    const gliding=a.jumpHeld && a.vy<0 && !a.dive;
    a.glide+=(Number(gliding)-a.glide)*(1-Math.exp(-9*dt));
    const old=a.y;
    a.vy=Math.max(gliding?-75:-780,a.vy-dt*(a.dive?1880:gliding?300:a.jumpHeld?730:1080));
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
        wave.hit.add(b);hitBuilding(s,b,2,Math.sign(b.x-wave.x)||a.face);
      }
    }
    flingCars(s,wave.x,Math.min(220,wave.age*470),0,1.5);
  }
  s.waves=s.waves.filter(w=>w.age<.62);
  for(let i=0;i<s.buildings.length;i++){
    const b=s.buildings[i];b.impact=Math.max(0,b.impact-dt*2.45);
    if(!b.fall||b.ruin)continue;
    b.fall=Math.min(1,b.fall+dt*1.35);
    if(!b.domino&&b.fall>.45){
      b.domino=true;const neighbor=s.buildings[i+b.fallDir];
      if(neighbor&&Math.abs(neighbor.x-b.x)-(b.w+neighbor.w)/2<b.h*.33)hitBuilding(s,neighbor,1,b.fallDir);
    }
    if(b.fall>=1){b.ruin=true;emit(s,'settle',{x:b.x,y:6,w:b.w});}
  }
  for(const c of s.cars){
    if(!c.launched){
      c.x+=c.vx*dt;
      if(c.x<12 || c.x>s.length-12)c.vx=c.x<12?Math.abs(c.vx):-Math.abs(c.vx);
    }else if(c.rest<2){
      const oldX=c.x;
      c.vy-=500*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.angle+=c.spin*dt;
      if(c.y>10 && Math.abs(c.vx)>90){
        for(const b of s.buildings){
          if(b.hp<=0 || c.struck.has(b) || c.y>b.h+6) continue;
          const side=b.x-Math.sign(c.vx)*b.w/2;
          if((oldX-side)*(c.x-side)>0) continue;
          c.struck.add(b);hitBuilding(s,b,1,Math.sign(c.vx));s.score+=55;
          emit(s,'ricochet',{x:c.x,y:c.y});
        }
      }
      if(c.y<0){c.y=0;c.vy=Math.abs(c.vy)*.3;c.vx*=.5;c.spin*=.5;if(c.vy<34){c.rest=2;c.angle=Math.round(c.angle/Math.PI)*Math.PI;}}
    }
  }
  if(s.finishWait>0){s.finishWait-=dt;if(s.finishWait<=0){s.done=true;emit(s,'clear');}}
}
