'use strict';
const monsterSpell=(()=>{
  const contact=1.05,life=2.42;
  const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
  const active=()=>flight?.specialAttackFX.find(f=>f.kind==='monster');
  function playerOpacity(){
    const f=active();if(!f)return 1;
    return 1-ease(f.age/.35)*(1-ease((f.age-1.64)/.69));
  }
  function cast(spot,power){
    if(!flight||flight.phase!=='fight'||active())return;
    flight.specialAttackFX.push({kind:'monster',age:0,bitten:false,target:null,chips:[]});
    cooldown=life+.1;castFlash=1;tone(90,246,.45,'sawtooth',.045);
  }
  function update(dt){
    const f=active();if(!f)return;
    f.age+=dt;
    if(flight.phase==='break'&&!f.bitten)f.age=Math.max(f.age,1.65);
    if(flight.phase==='fight'&&!f.bitten&&f.age>=contact){
      f.bitten=true;
      const world=worlds[flight.index],skin=world.skin,turn=spinAngle(),p=orbitTarget();
      f.target=skin.biteMouth(turn);
      const before=skin.frame(turn),sample=document.createElement('canvas');
      sample.width=sample.height=112;
      const ink=sample.getContext('2d');
      if(before)ink.drawImage(before,0,0,112,112);
      const bite=skin.bite(turn),after=skin.frame(turn);
      if(after){ink.globalCompositeOperation='destination-out';ink.drawImage(after,0,0,112,112)}
      f.morsel=sample;
      for(let n=0;n<(reduceMotion?5:14);n++)f.chips.push({x:f.target.x-.12-Math.random()*.65,y:(Math.random()-.5)*1.45,size:.025+Math.random()*.052});
      gainEnergy(15);tone(148,29,.29,'sawtooth',.085);ring(p.x+p.r*f.target.x,p.y,world.core,p.r*.75);
      flight.hp=bite.remaining?Math.max(1,Math.round(flight.hp*bite.remaining/bite.before)):0;
      if(flight.hp){showNotice('HALF THE PLANET EATEN!',1.05);orbitUI()}
      else shatterWorld(p);
    }
    if(f.age>=life)flight.specialAttackFX=flight.specialAttackFX.filter(e=>e!==f);
  }
  function draw(){
    const f=active();if(!f)return;
    const t=f.age,p=orbitTarget(),world=worlds[flight.index],approach=ease(t/.86)*(1-ease((t-1.56)/.78));
    const q=f.target||world.skin.biteMouth(spinAngle());
    const scale=(1-approach)*playerArtWidth()/800+approach*p.r*.0092;
    const x=player.x+(p.x+p.r*(q.x-1.38)-player.x)*approach;
    const y=player.y+(p.y+p.r*q.y-player.y)*approach;
    const open=ease(t/.8)*(1-ease((t-.88)/.23))+
      (t>1.12&&t<1.93?.38*Math.sin(Math.PI*(t-1.12)/.81)**2*(.52+.48*Math.cos((t-1.12)*18)):0);
    const mouthX=x+scale*127,mouthY=y+scale*24;
    if(f.morsel&&t<1.44){
      const chew=ease((t-contact)/.39),size=p.r*(1-chew);
      if(size>.1)ctx.drawImage(f.morsel,p.x+(mouthX-p.x)*chew-size,p.y+(mouthY-p.y)*chew-size,size*2,size*2);
    }
    drawEater(x,y,scale,open,reduceMotion?0:-.065*Math.sin(approach*Math.PI),1-playerOpacity());
    if(f.bitten&&t<1.57){
      const u=ease((t-contact)/.52);ctx.save();ctx.fillStyle=world.core;
      for(const chip of f.chips){const cx=p.x+chip.x*p.r,cy=p.y+chip.y*p.r;
        ctx.beginPath();ctx.arc(cx+(mouthX-cx)*u,cy+(mouthY-cy)*u,p.r*chip.size*(1-u),0,Math.PI*2);ctx.fill()}
      ctx.restore();
    }
  }
  return {cast,update,draw,playerOpacity};
})();
