'use strict';

const moonSpell=(()=>{
  const tau=Math.PI*2, summon=.31, ready=.56, fall=.55, lifetime=5.05;
  const skimTimes=[.51,.83,1.17,3.69];
  const unit=t=>Math.max(0,Math.min(1,t));
  const ease=t=>t*t*(3-2*t);
  const find=()=>flight?.specialAttackFX.find(f=>f.kind==='moon'&&f.index===flight.index);
  function actionLabel(){
    const f=find();return f&&!f.target&&!f.dropping?'Tap to drop':'';
  }
  function cast(spot,power){
    if(!flight||flight.phase!=='fight')return;
    const active=find();
    if(active){
      if(!active.target&&!active.dropping){
        active.target={x:spot.x,y:spot.y};active.requestedAt=active.age;active.power=Math.max(active.power,power);
        tone(920,360,.16,'sine',.043);
      }
      cooldown=.075;return;
    }
    const paw=castingPaw();
    flight.specialAttackFX.push({kind:'moon',index:flight.index,age:0,power,initial:spot,target:null,
      origin:{x:paw.x/W,y:paw.y/H},tilt:-.28+spot.y*.27,next:0,
      dropping:false,dropAge:0,launch:null,hit:false});
    cooldown=.065;castFlash=1;tone(270,620,.32,'sine',.052);
    showNotice('CAST AGAIN WHERE THE MOON SHOULD LAND',1.3);
  }
  function orbit(f,t){
    const a=2.67-(t-summon)*1.94,tilt=f.tilt+.104*Math.max(0,t-summon);
    const x=Math.cos(a)*1.105,y=Math.sin(a)*.264;
    return{x:x*Math.cos(tilt)-y*Math.sin(tilt),y:x*Math.sin(tilt)+y*Math.cos(tilt),z:Math.sin(a)};
  }
  function gouge(f,t){
    const world=worlds[f.index],p=orbitTarget(),q=orbit(f,t),next=orbit(f,t+.05);
    const angle=Math.atan2(next.y-q.y,next.x-q.x),c=Math.cos(angle),s=Math.sin(angle);
    const spot=clipToDisc(q.x,q.y),width=.143+f.power*.020,half=.025+f.power*.006;
    const shape=[];
    for(let i=0;i<12;i++){
      const a=tau*i/12,x=Math.cos(a)*width,y=Math.sin(a)*half*(1+.18*Math.sin(i*4.7));
      shape.push([(x*c-y*s)/half,(x*s+y*c)/half]);
    }
    world.skin.incise(spot.x,spot.y,spinAngle(),half,shape);
    peelCrust(world,spot,.095,'nova');spark(p.x+spot.x*p.r,p.y+spot.y*p.r,'#d5e9ff',reduceMotion?3:7,45);
    gainEnergy(2);tone(340+f.next*48,175,.074,'triangle',.021);applyWorldDamage(1);
  }
  function landing(f){
    const p=orbitTarget(),q=f.target;
    strikeSurface(q,'gravity',.85+.67*f.power,'comet');
    spark(p.x+p.r*q.x,p.y+p.r*q.y,'#d7eaff',reduceMotion?7:16,124);
    labels.push({x:p.x+p.r*q.x,y:p.y+p.r*(q.y-.13),val:'−'+(3+f.power),life:.8});
    gainEnergy(10+f.power);hitSound('gravity',f.power);
    tone(99,37,.42,'triangle',.070);applyWorldDamage(3+f.power);
  }
  function update(dt){
    if(!flight||flight.phase!=='fight')return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const f=list[i];if(f.kind!=='moon')continue;
      if(f.index!==flight.index){list.splice(i,1);continue;}
      f.age+=dt;
      let fallStep=dt;
      if(!f.dropping){
        const trigger=f.target?Math.max(ready,f.requestedAt):lifetime;
        const until=Math.min(f.age,trigger);
        // A prompt second tap still leaves one real scraping pass. A patient
        // player gets multiple surface grooves before choosing the landing site.
        while(f.next<1+f.power&&skimTimes[f.next]<=until){
          const when=skimTimes[f.next++];gouge(f,when);
          if(flight.phase!=='fight')return;
        }
        if(f.age<trigger)continue;
        f.target??={...f.initial};f.launch=orbit(f,trigger);f.dropping=true;
        fallStep=f.age-trigger;
        tone(565,150,.38,'sine',.05);
      }
      f.dropAge+=fallStep;
      if(!f.hit&&f.dropAge>=fall){
        f.hit=true;landing(f);if(flight.phase!=='fight')return;
      }
      if(f.dropAge>fall+.62)list.splice(i,1);
    }
  }

  // Cache the cratered albedo and directional relief separately from the rock's
  // orbital motion. A projected sphere keeps the crater rims aligned to its limb.
  let moonTile;
  function paintedMoon(){
    if(moonTile)return moonTile;
    const card=document.createElement('canvas');card.width=card.height=176;
    const g=card.getContext('2d'),r=83;
    g.translate(88,88);g.scale(r,r);
    g.beginPath();g.arc(0,0,1,0,tau);g.clip();
    const base=g.createRadialGradient(-.47,-.60,.035,.06,.07,1.21);
    base.addColorStop(0,'#fff5d7');base.addColorStop(.24,'#e4dfcf');base.addColorStop(.55,'#afaeba');
    base.addColorStop(.78,'#6c7491');base.addColorStop(1,'#273751');g.fillStyle=base;g.fillRect(-1,-1,2,2);
    let seed=197;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    // Fine mottling below the large impact basins breaks up the sunward face.
    for(let i=0;i<160;i++){
      const x=random()*2-1,y=random()*2-1,sz=random()*.058+.007;
      g.fillStyle=i%2?'#706b7a2b':'#ffe7c04d';g.beginPath();g.arc(x,y,sz,0,tau);g.fill();
    }
    const craters=[[-.29,-.42,.245],[.44,-.08,.18],[-.07,.42,.23],[-.71,.15,.14],[.24,-.68,.09],[.55,.5,.16]];
    for(let i=0;i<23;i++)craters.push([random()*1.77-.885,random()*1.77-.885,random()*.066+.020]);
    for(const [x,y,size] of craters){
      const d=x*x+y*y;if(d>.94)continue;
      g.save();g.translate(x,y);g.rotate(Math.atan2(y,x));g.scale(Math.sqrt(1-d),1);
      g.fillStyle='#e5e1d2';g.beginPath();g.ellipse(0,0,size*1.08,size*1.02,0,0,tau);g.fill();
      const pit=g.createLinearGradient(-size,-size,size,size);
      pit.addColorStop(0,'#535268');pit.addColorStop(.35,'#777486');pit.addColorStop(.71,'#a6a4ae');pit.addColorStop(1,'#d6cbb8');
      g.fillStyle=pit;g.beginPath();g.ellipse(0,0,size,size*.91,0,0,tau);g.fill();g.restore();
    }
    const shadow=g.createLinearGradient(-.72,-.55,.71,.65);
    shadow.addColorStop(0,'#fff2ca13');shadow.addColorStop(.49,'#36466400');shadow.addColorStop(.84,'#202c534a');shadow.addColorStop(1,'#17213c9e');
    g.fillStyle=shadow;g.fillRect(-1,-1,2,2);moonTile=card;return card;
  }
  function track(f,p,front){
    const path=new Path2D();let pen=false;
    for(let i=0;i<=96;i++){
      const a=tau*i/96,tilt=f.tilt+.104*Math.max(0,f.age-summon);
      const horizontal=Math.cos(a)*1.105,vertical=Math.sin(a)*.264;
      const x=horizontal*Math.cos(tilt)-vertical*Math.sin(tilt),y=horizontal*Math.sin(tilt)+vertical*Math.cos(tilt);
      if((Math.sin(a)>=0)!==front){pen=false;continue;}
      if(!pen)path.moveTo(p.x+x*p.r,p.y+y*p.r);else path.lineTo(p.x+x*p.r,p.y+y*p.r);pen=true;
    }
    ctx.save();
    if(!front){ctx.beginPath();ctx.rect(0,0,W,H);ctx.moveTo(p.x+p.r,p.y);ctx.arc(p.x,p.y,p.r,0,tau);ctx.clip('evenodd');}
    ctx.strokeStyle=front?'#c9edffc9':'#abcfff6b';ctx.lineWidth=Math.max(1,p.r*.013);
    ctx.setLineDash([p.r*.11,p.r*.077]);ctx.lineDashOffset=-f.age*p.r*.19;ctx.stroke(path);ctx.restore();
  }
  function plunge(f,t){
    const u=1-t,src=f.launch,end=f.target;
    const lift=reduceMotion?.18:.63;
    const cx=(src.x+end.x)*.5+(end.x-src.x)*.11,cy=Math.min(src.y,end.y)-lift;
    return {x:u*u*src.x+2*u*t*cx+t*t*end.x,y:u*u*src.y+2*u*t*cy+t*t*end.y,z:1};
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const p=orbitTarget();
    for(const f of flight.specialAttackFX){
      if(f.kind!=='moon'||f.index!==flight.index)continue;
      ctx.save();
      if(!f.dropping){ctx.globalAlpha=unit(f.age/.35);track(f,p,false);track(f,p,true);ctx.globalAlpha=1;}
      if(f.hit){
        const t=unit((f.dropAge-fall)/.58),q=f.target,x=p.x+p.r*q.x,y=p.y+p.r*q.y;
        const size=p.r*(.44+.085*f.power)*ease(t);
        ctx.globalAlpha=1-t;ctx.translate(x,y);ctx.rotate(-.22);
        for(let i=0;i<2;i++){
          ctx.strokeStyle=i?'#9faee8':'#fff1c9';ctx.lineWidth=Math.max(.9,p.r*.026*(1-t));
          ctx.beginPath();ctx.ellipse(0,0,Math.max(.1,size*(1+i*.16)),Math.max(.1,size*(.38+i*.11)),0,0,tau);ctx.stroke();
        }
        ctx.restore();continue;
      }
      const orbiting=f.age>=summon&&!f.dropping;
      let q;
      if(f.dropping)q=plunge(f,unit(f.dropAge/fall));
      else if(orbiting)q=orbit(f,f.age);
      else {
        const t=ease(unit(f.age/summon)),end=orbit(f,summon);
        q={x:(f.origin.x*W-p.x)/p.r*(1-t)+end.x*t,y:(f.origin.y*H-p.y)/p.r*(1-t)+end.y*t-.18*Math.sin(t*Math.PI),z:1};
      }
      if(q.z<0){ctx.beginPath();ctx.rect(0,0,W,H);ctx.moveTo(p.x+p.r,p.y);ctx.arc(p.x,p.y,p.r,0,tau);ctx.clip('evenodd');}
      const x=p.x+p.r*q.x,y=p.y+p.r*q.y,r=p.r*(.137+.02*f.power)*(.88+.14*q.z)*(f.dropping?1+.45*unit(f.dropAge/fall):1);
      if(f.dropping||orbiting){
        const trail=new Path2D(),count=14;
        for(let j=0;j<=count;j++){
          const ago=(count-j)/count*.19;let position;
          if(f.dropping)position=plunge(f,unit((f.dropAge-ago)/fall));
          else position=orbit(f,Math.max(summon,f.age-ago));
          const tx=p.x+p.r*position.x,ty=p.y+p.r*position.y;
          if(!j)trail.moveTo(tx,ty);else trail.lineTo(tx,ty);
        }
        ctx.lineCap='round';ctx.strokeStyle=f.dropping?'#ffc6808c':'#9dcdff63';ctx.lineWidth=r*(f.dropping?1.22:.56);ctx.stroke(trail);
        ctx.strokeStyle=f.dropping?'#ffdfab':'#e0f4ff';ctx.lineWidth=r*.17;ctx.stroke(trail);
      }
      ctx.translate(x,y);ctx.rotate(-.20+(reduceMotion?0:.21*Math.sin(f.age*1.6)));
      ctx.drawImage(paintedMoon(),-r,-r,r*2,r*2);ctx.restore();
    }
  }
  return {cast,update,draw,actionLabel};
})();
