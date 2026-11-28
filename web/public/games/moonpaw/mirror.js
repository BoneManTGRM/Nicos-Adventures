'use strict';

const mirrorSpell = (() => {
  const tau = Math.PI * 2;
  const gather = .32, leap = .79, dive = .37, dig = .34, convergence = 1.66;
  const hues = ['#8befff','#efb7ff','#b3c5ff'];
  const perches = [[-1.18,-.67],[.33,-1.26],[-.51,1.13]];
  const rig = new Image();
  rig.src = 'assets/jacket-rig.png';
  let pieces;
  const limit = n => Math.max(0,Math.min(1,n));
  const smooth = n => { n=limit(n); return n*n*(3-2*n); };
  function cast(spot,power) {
    if (!flight || flight.phase !== 'fight') return;
    const paw=castingPaw(), center={x:spot.x*.52,y:spot.y*.52};
    const entries=perches.map(([x,y])=>{
      const len=Math.hypot(x,y);
      return clipToDisc(center.x*.55 + .71*x/len,center.y*.55 + .71*y/len);
    });
    flight.specialAttackFX.push({kind:'mirror',index:flight.index,power,turn:spinAngle(),
      age:0,origin:{x:paw.x/W,y:paw.y/H},center,entries,entryHits:0,tunnelHits:0,joined:false});
    cooldown=1.1;castFlash=1;tone(480,980,.22,'sine',.045);
  }
  // Split only the tail using the same green-channel rig mask as the playable cat.
  // Both tiny cards are cached across encounters. The main player's renderer stays independent.
  function spritePieces() {
    if(pieces)return pieces;
    const source=document.getElementById('catImage');
    if(!source?.naturalWidth || !rig.naturalWidth)return null;
    const w=172,h=112;
    function card(){
      const c=document.createElement('canvas');c.width=w;c.height=h;return c;
    }
    const tail=card(),body=card();
    const t=tail.getContext('2d',{willReadFrequently:true}),b=body.getContext('2d',{willReadFrequently:true});
    t.drawImage(rig,0,0,w,h);const mask=t.getImageData(0,0,w,h).data;
    b.drawImage(source,0,0,w,h);const base=b.getImageData(0,0,w,h),fur=t.createImageData(w,h);
    fur.data.set(base.data);
    for(let i=0;i<mask.length;i+=4){
      const a=base.data[i+3],blend=mask[i+1]/255;
      fur.data[i+3]=Math.round(a*blend);
      // Keep a little overlap at the root so the swishing tail remains attached.
      const x=(i/4)%w,y=Math.floor(i/(4*w)),atHip=(x-36)**2/70+(y-79)**2/45<1;
      if(!atHip)base.data[i+3]=Math.round(a*(1-blend));
    }
    t.putImageData(fur,0,0);b.putImageData(base,0,0);
    const eye=document.getElementById('castingEye');
    if(eye?.naturalWidth)b.drawImage(eye,503/768*w,87/502*h,62/768*w,55/502*h);
    pieces={body,tail};return pieces;
  }
  function project(q,fx){
    const a=(spinAngle()-fx.turn)*tau,z=Math.sqrt(Math.max(0,1-q.x*q.x-q.y*q.y));
    return {x:q.x*Math.cos(a)-z*Math.sin(a),y:q.y,z:q.x*Math.sin(a)+z*Math.cos(a)};
  }
  function contact(fx,q,strength,damage,color){
    const world=worlds[flight.index],p=orbitTarget(),front=project(q,fx);
    world.skin.impact('gravity',q.x,q.y,fx.turn,strength,1-flight.hp/world.health);
    if(front.z>0){
      ejectCrust(world,front,1,'gravity');
      spark(p.x+p.r*front.x,p.y+p.r*front.y,color,reduceMotion?3:9,62);
    }
    gainEnergy(damage?4:2);
    if(damage)applyWorldDamage(damage);
  }
  function update(dt){
    if(!flight)return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const fx=list[i];
      if(fx?.kind!=='mirror')continue;
      if(fx.index!==flight.index||flight.phase!=='fight'){list.splice(i,1);continue}
      fx.age+=dt;
      for(let j=0;j<3;j++){
        const start=leap+j*.074,entry=fx.entries[j];
        if(fx.age>=start+dive && fx.entryHits===j){
          fx.entryHits++;tone(850+j*190,200,.11,'triangle',.045);
          contact(fx,entry,.55+fx.power*.12,1,hues[j]);
          if(flight.phase!=='fight')return;
        }
        if(fx.age>=start+dive+dig*.53&&fx.tunnelHits===j){
          fx.tunnelHits++;
          contact(fx,{x:(entry.x+fx.center.x)*.5,y:(entry.y+fx.center.y)*.5},
                  .41+fx.power*.09,0,hues[j]);
        }
      }
      if(!fx.joined&&fx.age>=convergence){
        fx.joined=true;hitSound('gravity',fx.power);tone(260,52,.34,'triangle',.06);
        contact(fx,fx.center,1.05+fx.power*.32,fx.power+1,'#fff1cc');
        if(flight.phase!=='fight')return;
      }
      if(fx.age>convergence+.47)list.splice(i,1);
    }
  }
  function paintDouble(at,angle,flip,width,crouch,flick,opacity){
    const art=spritePieces(),source=document.getElementById('catImage');
    if(!art&&!source?.naturalWidth)return;
    ctx.save();ctx.translate(at.x,at.y);ctx.rotate(angle);ctx.scale(flip*(1+.10*crouch),1-.26*crouch);
    ctx.globalAlpha=opacity;ctx.imageSmoothingEnabled=true;
    const h=width*502/768,x=-width*.50,y=-h*.51;
    if(art){
      ctx.save();ctx.translate(x+width*.21,y+h*.71);ctx.rotate(flick);
      ctx.drawImage(art.tail,-width*.21,-h*.71,width,h);ctx.restore();
      ctx.drawImage(art.body,x,y,width,h);
    }else ctx.drawImage(source,x,y,width,h);
    ctx.restore();
  }
  function subterraneanTrack(fx,start,end,progress,color,r,opacity){
    if(progress<=0||opacity<=0)return;
    const p=orbitTarget(),points=[];
    for(let k=0;k<12;k++){
      const t=progress*k/11,bow=.032*Math.sin(Math.PI*t)*Math.sin(k*1.8);
      const q=project({x:start.x+(end.x-start.x)*t+bow,y:start.y+(end.y-start.y)*t-bow*.4},fx);
      if(q.z>.04)points.push({x:p.x+r*q.x,y:p.y+r*q.y});
    }
    if(points.length<2)return;
    ctx.save();ctx.globalAlpha=opacity;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
    for(let j=1;j<points.length;j++)ctx.lineTo(points[j].x,points[j].y);
    for(const [ink,w] of [['#2a173d',.106],[color,.047],['#fff9e8',.013]]){
      ctx.strokeStyle=ink;ctx.lineWidth=Math.max(.65,r*w);ctx.stroke();
    }
    const tip=points[points.length-1];
    if(progress<1){ctx.fillStyle='#fff7d9';ctx.beginPath();ctx.arc(tip.x,tip.y,r*.049,0,tau);ctx.fill()}
    ctx.restore();
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const p=orbitTarget(),r=p.r;
    for(const fx of flight.specialAttackFX){
      if(fx.kind!=='mirror'||fx.index!==flight.index)continue;
      const fade=1-limit((fx.age-convergence)/.47),size=Math.max(39,Math.min(93,r*.71));
      for(let j=0;j<3;j++){
        const start=leap+j*.074,flightTime=fx.age-start,entry=project(fx.entries[j],fx);
        subterraneanTrack(fx,fx.entries[j],fx.center,limit((flightTime-dive)/dig),hues[j],r,fade);
        if(flightTime>=dive+.04)continue;
        const [px,py]=perches[j], sx=Math.max(size*.55,Math.min(W-size*.55,p.x+px*r)),
          sy=Math.max(size*.43,Math.min(H-size*.43,p.y+py*r));
        const ex=p.x+entry.x*r,ey=p.y+entry.y*r,flip=ex<sx?-1:1;
        const approach=smooth(fx.age/gather),cut=limit(flightTime/dive),f=cut*cut;
        const crouch=fx.age>gather&&flightTime<0?smooth((fx.age-gather)/(start-gather)):0;
        const arc=reduceMotion?0:r*.18;
        const x=(fx.origin.x*W*(1-approach)+sx*approach)*(1-f)+ex*f;
        const y=(fx.origin.y*H*(1-approach)+sy*approach-arc*Math.sin(approach*Math.PI))*(1-f)
          +ey*f-arc*.48*Math.sin(cut*Math.PI)+size*.10*crouch;
        const angle=cut*flip*Math.atan2(ey-sy,Math.abs(ex-sx))*.80;
        ctx.save();ctx.strokeStyle=hues[j];ctx.globalAlpha=.43*(1-cut);
        ctx.lineWidth=Math.max(1,r*.018);ctx.beginPath();
        ctx.ellipse(sx,sy+size*.27,size*.49*approach+1,size*.10+.5,0,0,tau);ctx.stroke();ctx.restore();
        if(cut>.10&&!reduceMotion){
          ctx.save();ctx.globalAlpha=.49*(1-cut);ctx.lineCap='round';ctx.strokeStyle=hues[j];
          ctx.lineWidth=size*.065;ctx.beginPath();ctx.moveTo(sx+(ex-sx)*f*.72,sy+(ey-sy)*f*.72);
          ctx.lineTo(x,y);ctx.stroke();ctx.restore();
        }
        const tail=reduceMotion?0:Math.sin(fx.age*17+j)*(.07+.15*crouch);
        paintDouble({x,y},angle,flip,size*(.59+.41*approach)*(1-.51*cut),crouch,tail,
                    Math.min(1,fx.age/.10)*(.98-.3*cut));
      }
      if(fx.joined){
        const age=(fx.age-convergence)/.47,center=project(fx.center,fx);
        if(center.z<=0)continue;
        ctx.save();ctx.globalAlpha=fade;ctx.strokeStyle='#ffe9bc';ctx.lineWidth=Math.max(1,r*.023*fade);
        ctx.beginPath();ctx.ellipse(p.x+center.x*r,p.y+center.y*r,r*(.12+age*(reduceMotion?.12:.32)),
          r*(.09+age*.19),0,0,tau);ctx.stroke();ctx.restore();
      }
    }
  }
  return {cast,update,draw};
})();
