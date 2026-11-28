'use strict';

function clipToDisc(x,y){
  const scale=.95/Math.max(.95,Math.hypot(x,y));
  return{x:x*scale,y:y*scale};
}
function playerArtWidth(){return player.w*(flight?1.65:1.06)}
function castingPaw(){
  const w=playerArtWidth(),angle=player.tilt*Math.PI/180;
  const paw=skinPoint(actorBones().wrist,726,182);
  const x=w*(paw.x/768-.5),y=w*(paw.y-251)/768;
  return{x:player.x+x*Math.cos(angle)-y*Math.sin(angle),y:player.y+x*Math.sin(angle)+y*Math.cos(angle)};
}
function showSupernova(){
  const b=$('supernova'),active=!!flight&&mode==='play';
  b.hidden=!active;
  if(!active)return;
  const energy=flight.energy,ready=energy>=100;
  b.disabled=!ready||flight.phase!=='fight';
  b.dataset.ready=String(ready);
  b.style.backgroundSize=energy+'% 100%, 100% 100%';
  $('superState').textContent=ready?(coarse?'UNLEASH':'R · UNLEASH'):energy+'%';
  b.setAttribute('aria-label',ready?'Unleash Supernova':'Supernova, '+energy+' percent charged');
}
function gainEnergy(n){
  const before=flight.energy;
  flight.energy=Math.min(100,before+n);showSupernova();
  if(before<100&&flight.energy===100){tune([440,659,880]);showNotice('SUPERNOVA READY',1.15)}
}
function strikeSurface(spot,terrain,power,visual=terrain){
  const world=worlds[flight.index];
  ejectCrust(world,spot,Math.ceil(power),terrain);
  const cut=world.skin.impact(terrain,spot.x,spot.y,spinAngle(),power,1-flight.hp/world.health);
  impactArt(spot,visual,power);
  return cut;
}
function callComets(spot,power){
  const count=2+power;
  for(let i=0;i<count;i++){
    const angle=i*2.40+flight.scars*.73,r=i===0?0:.33+.11*i;
    const end=clipToDisc(spot.x+Math.cos(angle)*r,spot.y+Math.sin(angle)*r);
    flight.comets.push({spot:end,age:-i*.17,span:.53+.045*i,power:i===0?power:1,angle:-.50-i*.11});
  }
  cooldown=1.15+.10*power;castFlash=1;
  tone(360,1400,.38,'sine',.045);tone(115,66,.25,'triangle',.06);
}
function updateComets(dt){
  if(!flight.comets.length)return;
  for(const c of flight.comets){
    c.age+=dt;
    if(c.hit||c.age<c.span)continue;
    c.hit=true;
    strikeSurface(c.spot,'nova',c.power*.7,'comet');
    gainEnergy(6);hitSound('comet',c.power);
    applyWorldDamage(1+c.power+(worlds[flight.index].weak==='comet'?1:0));
    if(flight.phase!=='fight')return;
  }
  flight.comets=flight.comets.filter(c=>!c.hit);
}
function chainLightning(spot,power){
  const p=orbitTarget(),start=castingPaw(),points=[start],relays=[];
  const candidates=entities.filter(e=>e.kind==='meteor'&&!e.dead&&e.x<W+e.r);
  while(candidates.length&&relays.length<2+power){
    const last=points[points.length-1];
    candidates.sort((a,b)=>Math.hypot(a.x-last.x,a.y-last.y)-Math.hypot(b.x-last.x,b.y-last.y));
    const rock=candidates.shift();
    rock.dead=true;relays.push(rock);points.push({x:rock.x,y:rock.y});
    spark(rock.x,rock.y,'#d8d6ff',12,85);addScore(45,rock.x,rock.y);
  }
  const direction=Math.atan2(spot.y,spot.x)+1.85;
  const second=clipToDisc(spot.x+Math.cos(direction)*.51,spot.y+Math.sin(direction)*.51);
  for(const hit of [spot,second])points.push({x:p.x+p.r*hit.x,y:p.y+p.r*hit.y});
  flight.arcs.push({points:points.map(q=>({x:q.x/W,y:q.y/H})),age:0,seed:flight.scars*1.4});
  strikeSurface(spot,'gravity',power*.70,'storm');strikeSurface(second,'cryo',.55,'storm');
  cooldown=.92;castFlash=1;gainEnergy(19+relays.length*4);
  hitSound('storm',power);
  if(relays.length)showNotice(relays.length+' METEOR RELAY'+(relays.length===1?'':'S'),.8);
  applyWorldDamage(2+power+relays.length+(worlds[flight.index].weak==='storm'?2:0));
}
function unleashSupernova(){
  if(!flight||mode!=='play'||flight.phase!=='fight'||flight.energy<100||(acting?.kind==='super'&&actorPending()))return;
  beginGesture('super',4,releaseSupernova,true);
}
function releaseSupernova(){
  if(!flight||mode!=='play'||flight.phase!=='fight'||flight.energy<100)return;
  flight.energy=0;flight.charge=0;flight.supers++;cooldown=.84;castFlash=1;
  invulnerable=Math.max(invulnerable,1);
  for(const e of entities)if(!e.dead&&e.kind==='meteor'){e.dead=true;spark(e.x,e.y,'#fff0bc',13,121);addScore(35,e.x,e.y)}
  const offset=flight.scars*1.3;
  // Four disjoint incisions leave rotating bridges of crust between the openings.
  for(let i=0;i<4;i++){
    const a=offset+i*Math.PI/2;
    strikeSurface({x:.61*Math.cos(a),y:.61*Math.sin(a)},'nova',1.65,'super');
  }
  showNotice('SUPERNOVA',1.05);
  impactArt({x:0,y:0},'super',4);
  hitSound('super',4);showSupernova();applyWorldDamage(10);
}
