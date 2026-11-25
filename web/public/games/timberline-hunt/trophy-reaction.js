'use strict';

const TrophyReaction = (() => {
  const life = 2.85;
  const giants = new Set(['elephant','forestel','hippo','rhino','giraffe']);
  const quick = new Set(['lion','leopard','snowleopard','arcticfox','andeanfox','fox','hare','impala','pheasant']);
  const surfaces = {
    snow: ['#c9dfed','#eff7fa'], forest: ['#92876c','#c6b98f'], grass: ['#b4976e','#ead0a0']
  };
  const clamp = v => Math.min(1, Math.max(0, v));
  const easeOut = t => 1 - (1 - clamp(t)) ** 3;
  const smooth = t => {const u=clamp(t);return u*u*(3-2*u);};
  function capture(species,x,y,size,dir,gait,coat,width,height,ground=y,terrain='grass',velocity=0,verticalVelocity=0) {
    const giant = giants.has(species), heavy = FallVolume.isHeavy(species);
    const standing=TimberWildlife.sprite(species,gait,coat);
    return {
      species, x:x/width, y:y/height, ground:ground/height, size:size/height,
      dir, gait, coat, terrain, standing, velocity:velocity / width, verticalVelocity:verticalVelocity/height, age:0,
      asset:LandingArt.create(species,gait,coat,standing), volume:null, start:null, waiting:false, provisional:false, blendStart:null,
      duration:giant ? 1.48 : heavy ? 1.29 : quick.has(species) ? .96 : 1.13
    };
  }
  function contactShadow(g,x,y,rx,ry,alpha) {
    g.save(); g.translate(x,y); g.scale(rx,Math.max(1.2,ry));
    const ink = g.createRadialGradient(0,0,0,0,0,1);
    ink.addColorStop(0,'rgba(20,25,20,'+alpha+')');
    ink.addColorStop(.55,'rgba(20,25,20,'+(alpha*.52)+')');
    ink.addColorStop(1,'rgba(20,25,20,0)');
    g.fillStyle=ink; g.fillRect(-1,-1,2,2); g.restore();
  }
  function impact(g,r,size,t,start,at,strength) {
    const u=(t-start)/.37;
    if(u<0 || u>=1)return;
    const colors=surfaces[r.terrain] || surfaces.grass;
    g.save();g.globalAlpha*=(1-u)**1.5*strength;
    for(let i=0;i<6;i++){
      const side=i%2 ? 1 : -1;
      const x=r.dir*size*(at+side*(.045+u*(.12+.045*(i%3))));
      const y=-size*.10*(1+.2*(i%3))*Math.sin(Math.PI*u);
      const span=Math.max(1,size*.017*(1+i%3));
      g.fillStyle=colors[i%2];g.fillRect(x,y,span,Math.max(1,span*.47));
    }
    g.restore();
  }
  function paintBody(g,r,p,s,reduced) {
    if(p===0){
      g.scale(r.dir*s/r.standing.h,s/r.standing.h);
      g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';
      g.drawImage(r.standing.surface,-r.standing.w/2,-r.standing.h);
      return;
    }
    if(r.provisional && r.blendStart===null && p<.72 && !reduced){
      // The common resting strip can finish a landing even when the larger
      // stride sheet is still downloading. Only switch while the body moves.
      if(LandingArt.ready(r.asset) || (p>=.40 && r.asset?.settle.complete && r.asset.settle.naturalWidth))
        r.blendStart=r.age;
    }
    const blend=r.blendStart===null?0:smooth((r.age-r.blendStart)/.20);
    if(blend===1){r.provisional=false;r.volume=null;r.bridge=null;}
    if(r.asset && !r.provisional){LandingArt.draw(g,r.asset,p,s,r.dir);return;}
    if(!r.volume)r.volume=FallVolume.create(r.species,r.standing);
    const index=p*FallVolume.lastFrame;
    if(blend===0){FallVolume.draw(g,r.volume,index,s,r.dir);return;}
    if(!r.bridge){
      const canvas=document.createElement('canvas');
      canvas.width=Math.ceil(Math.max(r.standing.w*2.4,r.standing.h*3.5));
      canvas.height=Math.ceil(r.standing.h*1.8);
      r.bridge=canvas.getContext('2d');
    }
    const b=r.bridge,canvas=b.canvas,center=canvas.width/2,ground=canvas.height*.88;
    b.clearRect(0,0,canvas.width,canvas.height);b.save();b.translate(center,ground);
    b.globalAlpha=1-blend;FallVolume.draw(b,r.volume,index,r.standing.h,r.dir);
    b.globalCompositeOperation='lighter';b.globalAlpha=blend;
    LandingArt.draw(b,r.asset,p,r.standing.h,r.dir);b.restore();
    const scale=s/r.standing.h;
    g.imageSmoothingEnabled=true;
    g.drawImage(canvas,-center*scale,-ground*scale,canvas.width*scale,canvas.height*scale);
  }
  function paint(g,r,w,h,reduced,{hold=false,marker=true}={}) {
    const t=r.age, s=r.size*h, duration=r.duration;
    if(r.start===null){
      const ready=reduced ? (r.asset?.settle.complete && r.asset.settle.naturalWidth>0) : LandingArt.ready(r.asset);
      if(ready || !r.asset || t>=.24){
        r.provisional=!ready;
        r.start=r.waiting?t:0;
      }else r.waiting=true;
    }
    const p=r.start===null ? 0 : reduced ? (t>=.20?1:0) : clamp((t-r.start)/duration);
    // Match the animal's incoming speed and brake to zero as it takes weight.
    // A stationary quarry stays planted, even if it is struck mid-stride.
    const speed=r.velocity*w, brake=Math.min(duration*.52,s*.96/Math.max(1,Math.abs(speed)));
    const carry=reduced?0:speed*brake*easeOut(t/brake)/3;
    const x=r.x*w+carry, ground=r.ground*h;
    const clearance=Math.max(0,ground-r.y*h), airborne=clearance>s*.08;
    const airTime=duration*(r.species==='pheasant'?.82:.34);
    const u=clamp(t/airTime);
    const incoming=Math.max(-s*.7,Math.min(clearance*3/airTime,r.verticalVelocity*h));
    const y=reduced ? ground : clearance>0
      ? r.y*h+clearance*smooth(u)+airTime*incoming*u*(1-u)*(1-u)
      : r.y*h+(ground-r.y*h)*smooth(p/.34);
    const span=r.standing.w*s/r.standing.h;
    g.save();
    if(!hold) g.globalAlpha*=clamp((life-t)/.36);
    g.translate(x,ground);
    const contact=p*p*(3-2*p), shadowStrength=1/(1+Math.max(0,ground-y)/s);
    contactShadow(g,0,0,span*(.35+.18*contact),s*(.04+.053*contact),(.37+.09*contact)*shadowStrength);
    if(contact)contactShadow(g,r.dir*span*.14,0,span*.31,s*.048,.37*contact);
    g.translate(0,y-ground);
    g.save();
    // While a cold strip decodes, the captured body starts to yield over its
    // feet. Keep that same transform at handoff, then release it into the fall.
    if(r.waiting&&!reduced){
      const lean=.05*smooth((r.start??t)/.24)*(1-smooth(p/.30));
      g.rotate(r.dir*lean);g.scale(1,1-lean*.45);
    }
    if(!reduced && p>0 && p<1){
      // A short compression transfers weight into the planted limbs. Align
      // its base with the feet so the resting body never floats or bounces.
      const press=(begin,peak,end)=>p<=begin||p>=end?0:
        p<peak?smooth((p-begin)/(peak-begin)):1-smooth((p-peak)/(end-peak));
      const yieldAmount=press(.27,.40,.55)*.011+press(.68,.79,.97)*.022;
      g.scale(1+yieldAmount*.40,1-yieldAmount);
    }
    paintBody(g,r,p,s,reduced);
    g.restore();
    if(!reduced&&r.start!==null){
      const touch=airborne ? airTime : 0;
      impact(g,r,s,t,Math.max(touch,r.start+duration*.375),.29,.42);
      impact(g,r,s,t,Math.max(touch+.09,r.start+duration*.76),-.15,.69);
    }
    const secured=(r.start??0)+duration+.08;
    if(marker && t>secured){
      g.globalAlpha*=clamp((t-secured)/.14);
      const lift=s*.75+10;
      g.fillStyle='#192a25';g.strokeStyle='#ffda87';g.lineWidth=2;
      g.beginPath();g.moveTo(0,-lift-6);g.lineTo(6,-lift);g.lineTo(0,-lift+6);g.lineTo(-6,-lift);g.closePath();g.fill();g.stroke();
    }
    g.restore();
  }
  function terrain(id) {
    if(['ice','arctic','frost','highland'].includes(id))return 'snow';
    if(['savanna','baobab'].includes(id))return 'grass';
    return 'forest';
  }
  function replay(canvas,trophy) {
    if(!canvas)return;
    const play=String(Number(canvas.dataset.fallPlay||0)+1);
    canvas.dataset.fallPlay=play;
    const species=trophy.species,coat=TrophyLodge.palette(trophy);
    const preview=LandingArt.create(species,3,coat,TimberWildlife.sprite(species,3,coat));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height,waitStart=performance.now();
    const dialog=canvas.closest('dialog');
    let start=null,pose=null;
    function step(now){
      if(canvas.dataset.fallPlay!==play||!canvas.isConnected||(dialog&&!dialog.open))return;
      if(preview&&!LandingArt.ready(preview)&&now-waitStart<800){requestAnimationFrame(step);return;}
      if(start===null)start=now;
      const t=(now-start)/1000, approach=reduced?0:.50, walk=Math.min(1,t/.50);
      const size=Math.min(h*.82,w*.68/TimberWildlife.bounds(species,1).width);
      const x=w*(reduced?.5:.59-.10*walk),ground=h*.91;
      g.clearRect(0,0,w,h);
      if(t<approach){
        TimberWildlife.draw(g,species,x,ground,size,-1,walk*3,coat,true);
      }else{
        if(!pose)pose=capture(species,x,ground,size,-1,3,coat,w,h,ground,terrain(trophy.rangeId||trophy.reserve),reduced?0:-w*.20);
        pose.age=reduced?life:t-approach;
        paint(g,pose,w,h,reduced,{hold:true,marker:false});
      }
      if(!reduced&&(!pose||pose.start===null||pose.age<pose.start+pose.duration+.10))requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  return {life,capture,paint,terrain,replay};
})();
