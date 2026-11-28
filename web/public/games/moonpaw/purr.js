'use strict';

const purrSpell=(()=>{
  const tau=Math.PI*2;
  const unit=t=>Math.max(0,Math.min(1,t));
  const depth=p=>Math.sqrt(Math.max(0,1-p.x*p.x-p.y*p.y));
  function projected(site){
    const a=(spinAngle()-site.turn)*tau,z=site.z??depth(site);
    return {x:site.x*Math.cos(a)-z*Math.sin(a),y:site.y,z:site.x*Math.sin(a)+z*Math.cos(a)};
  }
  function targets(spot,power){
    const scars=flight.clawScars||[],sites=flight.hitSites||[],cutsInScars=new Set(),pool=[];
    for(const scar of scars){
      for(const cut of scar.cuts)cutsInScars.add(cut);
      const mid=scar.center[Math.floor(scar.center.length/2)];
      pool.push({...mid,turn:scar.turn,scar,bonus:.30});
    }
    for(const site of sites)if(site.cut&&!cutsInScars.has(site.cut)){
      pool.push({...site,bonus:0});
    }
    const ranked=pool.map((site,i)=>{
      const p=projected(site);
      return {site,rank:Math.hypot(spot.x-p.x,spot.y-p.y)+(p.z<0?3:0)-site.bonus-i*.003};
    }).sort((a,b)=>a.rank-b.rank);
    // Prefer distinct fault lines so a charged pulse crosses the planet.
    const out=[];
    for(const entry of ranked){
      const p=projected(entry.site);
      if(out.some(v=>{const q=projected(v);return Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)<.19}))continue;
      out.push(entry.site);if(out.length>=power+1)break;
    }
    if(!out.length)out.push({x:spot.x,y:spot.y,z:depth(spot),turn:spinAngle(),fresh:true});
    return out;
  }
  function cast(spot,power){
    if(!flight||flight.phase!=='fight')return;
    const sites=targets(spot,power),origin=castingPaw();
    const effect={kind:'purr',index:flight.index,power,sites,age:0,fired:0,
      origin:{x:origin.x/W,y:origin.y/H},life:1.08+.13*(sites.length-1)};
    flight.specialAttackFX.push(effect);castFlash=1;cooldown=.83+.105*power;
    tone(84,70,.48,'triangle',.065);tone(123,102,.45,'sine',.040,.06);
  }
  function pulse(effect,site){
    const world=worlds[flight.index],skin=world.skin,level=effect.power;
    if(site.scar)clawSpell.resonate(site.scar,level);
    else if(site.cut){
      skin.widen(site.cut,Math.min(.063+.017*level,site.cut.radius*(.12+.05*level)));
    }else{
      site.cut=skin.impact('gravity',site.x,site.y,site.turn,.30+.15*level,1-flight.hp/world.health);
    }
    const p=projected(site);
    if(p.z>0){
      if(effect.fired===1||site.scar)ejectCrust(world,p,site.scar?2:1,'gravity');
      const g=orbitTarget();spark(g.x+g.r*p.x,g.y+g.r*p.y,'#d6f6a0',reduceMotion?3:8,53);
    }
    if(site.scar)tone(133,51,.29,'triangle',.058);
    else tone(182+effect.fired*24,68,.19,'sine',.049);
    gainEnergy(effect.fired===1?7:3);
    const damage=(effect.fired===1?level:1)+(site.fresh?0:1)+(site.scar?1:0);
    applyWorldDamage(damage);
  }
  function update(dt){
    if(!flight)return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const effect=list[i];if(!effect||effect.kind!=='purr')continue;
      if(flight.phase!=='fight'||effect.index!==flight.index){list.splice(i,1);continue}
      effect.age+=dt;
      while(flight.phase==='fight'&&effect.fired<effect.sites.length&&effect.age>=.27+effect.fired*.13){
        const site=effect.sites[effect.fired++];pulse(effect,site);
      }
      if(effect.age>=effect.life||flight.phase!=='fight')list.splice(i,1);
    }
  }
  function drawCharge(fraction){
    if(!flight||flight.phase!=='fight'||fraction<=0)return;
    const q=castingPaw(),t=unit(fraction),r=13+t*24;
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(-.18);ctx.lineCap='round';
    // The three unbroken lobes fill toward their points as the note is held.
    for(let i=0;i<3;i++){
      const size=r*(.49+i*.27),a=t*(1.1+.22*i);
      ctx.strokeStyle=i===2?'#ffea96':'#8bf3d9';ctx.lineWidth=1+t*(i===2?1.4:.5);
      ctx.globalAlpha=.30+.62*t;ctx.beginPath();ctx.ellipse(0,0,size,size*(.71+.07*i),0,-a,a);ctx.stroke();
    }
    ctx.restore();
  }
  function drawSeam(site,q,r,t,seed){
    if(q.z<0)return;
    const alpha=1-t;
    ctx.save();ctx.translate(q.x,q.y);
    if(site.scar){
      const g=orbitTarget();ctx.translate(-q.x,-q.y);
      ctx.lineWidth=Math.max(1.2,r*.021);ctx.strokeStyle='#ebff9e';ctx.globalAlpha=.84*alpha;
      for(const lane of site.scar.lanes){
        ctx.beginPath();let down=false;
        for(const s of lane){
          const p=projected({...s,turn:site.turn});
          if(p.z<=0){down=false;continue}
          const x=g.x+g.r*p.x,y=g.y+g.r*p.y;if(down)ctx.lineTo(x,y);else ctx.moveTo(x,y);down=true;
        }
        ctx.stroke();
      }
    }else{
      const reach=r*.41*(.45+.55*Math.min(1,t*4));
      for(let i=0;i<5;i++){
        const a=seed+i*tau/5,len=reach*(.66+.25*Math.cos(i*2.83));
        ctx.save();ctx.rotate(a);ctx.strokeStyle=i%2?'#a2eea1':'#ffda82';ctx.lineWidth=Math.max(.8,r*.013);
        ctx.globalAlpha=.75*alpha;ctx.beginPath();ctx.moveTo(len*.12,0);ctx.lineTo(len*.37,len*.12);
        ctx.lineTo(len*.44,-len*.04);ctx.lineTo(len*.73,len*.07);ctx.lineTo(len,-len*.02);ctx.stroke();ctx.restore();
      }
    }
    ctx.restore();
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const g=orbitTarget();ctx.save();ctx.lineCap='round';
    for(const e of flight.specialAttackFX){
      if(e.kind!=='purr'||e.index!==flight.index)continue;
      const head=projected(e.sites[0]),dest={x:g.x+g.r*head.x,y:g.y+g.r*head.y};
      const sx=e.origin.x*W,sy=e.origin.y*H,dx=dest.x-sx,dy=dest.y-sy;
      for(let k=0;k<3;k++){
        const u=(e.age-k*.065)/.40;if(u<0||u>=1)continue;
        const f=reduceMotion?.36+.22*k:u,x=sx+dx*f,y=sy+dy*f;
        const r=(6+g.r*(.08+.06*e.power)*f)*(1+.2*k);
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.globalAlpha=Math.sin(Math.PI*u)*.92;
        ctx.strokeStyle=k===1?'#fff4a6':'#94f5c2';ctx.lineWidth=k===1?2.4:1.6;
        ctx.beginPath();ctx.ellipse(0,0,r*.39,r,0,-1.42,1.42);ctx.stroke();ctx.restore();
      }
      for(let i=0;i<e.fired;i++){
        const site=e.sites[i],t=unit((e.age-.27-i*.13)/.68);if(t>=1)continue;
        const p=projected(site),q={x:g.x+g.r*p.x,y:g.y+g.r*p.y,z:p.z};
        if(p.z<=0)continue;
        for(let j=0;j<2;j++){
          const progress=unit((t-j*.19)/(1-j*.19));if(!progress)continue;
          const r=g.r*(.08+progress*(reduceMotion?.24:.55));
          ctx.save();ctx.globalAlpha=(1-progress)*.75;ctx.strokeStyle=j?'#dcffb7':'#8ddfb3';
          ctx.lineWidth=Math.max(1,g.r*.017*(1-progress));ctx.beginPath();
          ctx.ellipse(q.x,q.y,r,r*(.62+.16*p.z),Math.atan2(p.y,p.x)+Math.PI/2,0,tau);ctx.stroke();ctx.restore();
        }
        drawSeam(site,q,g.r,t,i+.3);
      }
    }
    ctx.restore();
  }
  return {cast,update,draw,drawCharge};
})();
