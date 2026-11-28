'use strict';

const bloomSpell=(()=>{
  const tau=Math.PI*2,arrival=.32,rupture=1.04,stagger=.085,afterglow=.65;
  const saturate=n=>Math.max(0,Math.min(1,n));

  function surface(x,y){
    const point=clipToDisc(x,y);
    return {...point,z:Math.sqrt(Math.max(0,1-point.x**2-point.y**2))};
  }
  function project(point,effect){
    const a=(spinAngle()-effect.turn)*tau,c=Math.cos(a),s=Math.sin(a);
    return {x:point.x*c-point.z*s,y:point.y,z:point.x*s+point.z*c};
  }
  function cast(spot,power){
    if(!flight||flight.phase!=='fight')return;
    const paw=castingPaw(),center=surface(spot.x,spot.y),petals=[];
    const radius=.36+.068*power,count=2+power;
    const seed=flight.scars*2.39996+flight.index;
    // Shift the crown inward at the rim to keep the tips spaced around the seed.
    const inset=Math.max(0,Math.hypot(center.x,center.y)+radius-.94);
    const distance=Math.hypot(center.x,center.y)||1;
    const cx=center.x*(1-inset/distance),cy=center.y*(1-inset/distance);
    for(let i=0;i<count;i++){
      const angle=seed+i*tau/count,cs=Math.cos(angle),sn=Math.sin(angle);
      const end=surface(cx+cs*radius,cy+sn*radius);
      const bend=surface(center.x+(end.x-center.x)*.53-sn*.075,center.y+(end.y-center.y)*.53+cs*.075);
      petals.push({end,bend,angle,hit:false});
    }
    flight.specialAttackFX.push({kind:'bloom',index:flight.index,age:0,turn:spinAngle(),center,
      origin:{x:paw.x/W,y:paw.y/H},power,seed,petals,planted:false,
      life:rupture+(count-1)*stagger+afterglow});
    cooldown=1+.1*power;castFlash=1;
    tone(540,1080,.21,'sine',.045);
  }
  function punch(effect,point,isSeed){
    const world=worlds[flight.index],p=orbitTarget(),pos=project(point,effect);
    // A plant stays on its original side of a fast-turning planet. Perform the cut
    // in the impact orientation, including when the entry has crossed the limb.
    const strength=isSeed?.55+.17*effect.power:.40+.13*effect.power;
    world.skin.impact('cryo',point.x,point.y,effect.turn,strength,1-flight.hp/world.health);
    if(pos.z>0){
      if(isSeed)ejectCrust(world,pos,1,'cryo');
      spark(p.x+p.r*pos.x,p.y+p.r*pos.y,'#ffc3f8',reduceMotion?3:8,52);
    }
    gainEnergy(isSeed?6:3);
    applyWorldDamage(1);
  }
  function update(dt){
    if(!flight)return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const fx=list[i];
      if(!fx||fx.kind!=='bloom')continue;
      if(flight.phase!=='fight'||fx.index!==flight.index){list.splice(i,1);continue}
      fx.age+=dt;
      if(!fx.planted&&fx.age>=arrival){
        fx.planted=true;
        tone(960,1390,.15,'sine',.045);punch(fx,fx.center,true);
      }
      for(let j=0;flight.phase==='fight'&&j<fx.petals.length;j++){
        const petal=fx.petals[j];
        if(petal.hit||fx.age<rupture+j*stagger)continue;
        petal.hit=true;
        if(!j){hitSound('cryo',fx.power);tone(220,55,.35,'triangle',.07)}
        tone(630*Math.pow(1.18,j),950*Math.pow(1.18,j),.13,'sine',.04);
        punch(fx,petal.end,false);
      }
      if(flight.phase!=='fight'||fx.age>=fx.life)list.splice(i,1);
    }
  }
  // Each prism has a broad shaded face, a bright face and a thin reflected edge.
  function facet(x,y,angle,length,width,pale){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    ctx.fillStyle=pale?'#633887':'#503471';
    ctx.beginPath();ctx.moveTo(0,width*.74);ctx.lineTo(-width,-length*.34);ctx.lineTo(-width*.60,-length*.73);
    ctx.lineTo(0,-length);ctx.closePath();ctx.fill();
    ctx.fillStyle=pale?'#f39aef':'#9c7ce8';
    ctx.beginPath();ctx.moveTo(0,width*.74);ctx.lineTo(0,-length);ctx.lineTo(width*.72,-length*.72);
    ctx.lineTo(width,-length*.32);ctx.closePath();ctx.fill();
    ctx.fillStyle=pale?'#fff4ec':'#def6ff';
    ctx.beginPath();ctx.moveTo(-width*.60,-length*.73);ctx.lineTo(0,-length);
    ctx.lineTo(width*.72,-length*.72);ctx.lineTo(width*.13,-length*.61);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#ffe0fa';ctx.lineWidth=Math.max(.6,width*.12);ctx.beginPath();
    ctx.moveTo(0,width*.48);ctx.lineTo(width*.13,-length*.61);ctx.stroke();ctx.restore();
  }
  function rootLine(a,b,growth){
    const x=a.x+(b.x-a.x)*growth,y=a.y+(b.y-a.y)*growth;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(x,y);ctx.stroke();
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const p=orbitTarget();
    for(const fx of flight.specialAttackFX){
      if(fx.kind!=='bloom'||fx.index!==flight.index)continue;
      const screen=point=>{
        const q=project(point,fx);
        return {x:p.x+q.x*p.r,y:p.y+q.y*p.r,z:q.z};
      };
      const seed=screen(fx.center),t=fx.age;
      ctx.save();ctx.lineCap='round';
      if(t<arrival){
        const f=saturate(t/arrival),x0=fx.origin.x*W,y0=fx.origin.y*H;
        const bow=reduceMotion?0:Math.min(32,p.r*.32);
        const x=x0+(seed.x-x0)*f,y=y0+(seed.y-y0)*f-4*bow*f*(1-f);
        const angle=Math.atan2(seed.y-y0-4*bow*(1-2*f),seed.x-x0)+Math.PI/2;
        if(!reduceMotion){
          const tail=Math.max(0,f-.13);
          ctx.strokeStyle='#ffc4f89c';ctx.lineWidth=2.3;ctx.beginPath();ctx.moveTo(x0+(seed.x-x0)*tail,y0+(seed.y-y0)*tail-4*bow*tail*(1-tail));
          ctx.lineTo(x,y);ctx.stroke();
        }
        facet(x,y,angle,Math.max(8,p.r*.14),Math.max(3,p.r*.052),true);
      }else{
        for(let i=0;i<fx.petals.length;i++){
          const petal=fx.petals[i],end=screen(petal.end),bend=screen(petal.bend);
          if(end.z<=0)continue;
          const burst=t-(rupture+i*stagger),growth=saturate((t-arrival-i*.032)/.48);
          const lift=saturate((growth-.40)/.60),dir=petal.angle+Math.PI/2;
          const width=p.r*(.041+fx.power*.005),height=p.r*(.21+fx.power*.032);
          if(burst>afterglow)continue;
          ctx.globalAlpha=burst<0?1:1-saturate(burst/afterglow);
          for(const [color,line] of [['#5f235f',.052],['#ff91ce',.019],['#fff7cf',.006]]){
            ctx.strokeStyle=color;ctx.lineWidth=Math.max(.65,p.r*line);
            if(seed.z>0)rootLine(seed,bend,Math.min(1,growth*2));
            if(growth>.5)rootLine(bend,end,growth*2-1);
          }
          if(lift<=0)continue;
          if(burst<0){
            facet(end.x,end.y,dir-.48,height*.61*lift,width*.63*lift,false);
            facet(end.x,end.y,dir+.57,height*.54*lift,width*.6*lift,true);
            facet(end.x,end.y,dir,height*lift,width*lift,i%2===0);
          }else{
            const travel=(1-Math.exp(-5*burst))*(reduceMotion?.10:.48)*p.r;
            const shards=reduceMotion?2:5;
            for(let k=0;k<shards;k++){
              const a=petal.angle+(k-(shards-1)/2)*.39;
              const speed=.72+.28*Math.sin(i+2*k+fx.seed);
              const x=end.x+Math.cos(a)*travel*speed,y=end.y+Math.sin(a)*travel*speed;
              facet(x,y,a+Math.PI/2+(reduceMotion?0:burst*(k-2)),height*(.26+.12*(k%3)),width*.40,k%2===0);
            }
          }
        }
        if(seed.z>0&&t<rupture){
          ctx.globalAlpha=1;
          const height=p.r*(.14+.18*saturate((t-arrival)/.34));
          facet(seed.x,seed.y,-.43,height*.8,height*.21,false);
          facet(seed.x,seed.y,.28,height,height*.23,true);
        }
      }
      ctx.restore();
    }
  }
  return {cast,update,draw};
})();
