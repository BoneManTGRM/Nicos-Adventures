// Arcade defense targets the last warned position. Every shot has a visible windup.
const patterns={
  drone:{warning:1.05,travel:.62},
  police:{warning:1.18,travel:.74},
  tank:{warning:1.30,travel:.68}
};
export function makeDefense(){
  return {maxHp:5,hp:5,hurt:0,next:2.4,turn:0,attacks:[],
    drone:{x:211,y:107,disabled:0,flash:0}};
}
export function disruptDrone(s,x,y,radius){
  const d=s.defense;
  if(!d||d.drone.disabled>0||Math.hypot(d.drone.x-x,d.drone.y-y)>radius)return;
  d.drone.disabled=5;d.drone.flash=.62;
  d.attacks=d.attacks.filter(a=>a.type!=='drone'||a.phase!=='warning');
  s.events.push({kind:'droneHit',x:d.drone.x,y:d.drone.y});
}
function chooseSource(s){
  const d=s.defense,a=s.actor;
  let closest=null,distance=200;
  for(const v of s.cars){
    if(v.type==='car'||v.state!=='driving'||a.y>v.y+96)continue;
    const dx=Math.abs(v.x-a.x);
    if(dx>=39&&dx<distance){closest=v;distance=dx;}
  }
  // Alternate an available street responder with the drone over the player.
  if(closest&&(d.turn%2===1||d.drone.disabled>0))return {source:closest,type:closest.type};
  if(d.drone.disabled<=0)return {source:d.drone,type:'drone'};
  return null;
}
function incoming(s){
  const shooter=chooseSource(s);
  if(!shooter)return false;
  const {source,type}=shooter,profile=patterns[type],a=s.actor;
  const ox=source.x,oy=source.y+(type==='drone'?0:type==='tank'?22:14);
  const attack={source,type,phase:'warning',ox,oy,x:ox,y:oy,tx:a.x,ty:a.y+43,age:0,...profile};
  s.defense.attacks.push(attack);s.defense.turn++;
  s.events.push({kind:'warning',type,x:ox,y:oy});
  return true;
}
function hurt(s,p){
  const d=s.defense;
  if(d.hurt>0)return;
  d.hp=Math.max(0,d.hp-1);d.hurt=1.05;
  s.events.push({kind:'hurt',x:p.x,y:p.y});
  if(!d.hp){
    s.outcome='defeat';s.downTime=0;d.attacks=[];
    s.events.push({kind:'knockout',x:s.actor.x,y:s.actor.y});
  }
}
export function stepDefense(s,dt){
  const d=s.defense;
  if(!d)return;
  d.hurt=Math.max(0,d.hurt-dt);
  if(s.finishWait>0){d.attacks.length=0;return;}
  const a=s.actor,drone=d.drone;
  drone.disabled=Math.max(0,drone.disabled-dt);drone.flash=Math.max(0,drone.flash-dt);
  const side=a.x>s.length-135?-1:1;
  const desiredX=a.x+side*(110+28*Math.sin(s.time*.68)),desiredY=a.y+101+24*Math.sin(s.time*1.85);
  const follow=1-Math.exp(-dt*2);
  // Hold the firing position through the warning. Moving the drone toward its
  // target after drawing the dotted line could sweep that line across a dodge.
  if(!d.attacks.some(p=>p.type==='drone'&&p.phase==='warning')){
    drone.x+=(desiredX-drone.x)*follow;drone.y+=(desiredY-drone.y)*follow;
  }
  d.next-=dt;
  if(d.next<=0)d.next=incoming(s)?2.88:.45;
  for(let i=d.attacks.length-1;i>=0;i--){
    const p=d.attacks[i];p.age+=dt;
    if(p.phase==='warning'){
      if(p.type==='drone'?drone.disabled>0:p.source.state!=='driving'){
        d.attacks.splice(i,1);continue;
      }
      p.x=p.ox=p.source.x;
      p.y=p.oy=p.source.y+(p.type==='drone'?0:p.type==='tank'?22:14);
      if(p.age<p.warning)continue;
      p.phase='flight';p.age=0;
      if(p.type==='drone')drone.flash=.42;
      s.events.push({kind:'bolt',type:p.type,x:p.ox,y:p.oy});
    }
    const travel=Math.min(1,p.age/p.travel);
    p.x=p.ox+(p.tx-p.ox)*travel;
    p.y=p.oy+(p.ty-p.oy)*travel;
    if(Math.abs(p.x-a.x)<17 && p.y>a.y+8 && p.y<a.y+76){
      d.attacks.splice(i,1);hurt(s,p);
      if(s.outcome)return;
    }else if(travel>=1)d.attacks.splice(i,1);
  }
}
