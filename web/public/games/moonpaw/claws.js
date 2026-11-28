'use strict';

const clawSpell=(()=>{
  const tau=Math.PI*2;
  const surface=(point)=>{
    const p=clipToDisc(point.x,point.y);
    return {x:p.x,y:p.y,z:Math.sqrt(Math.max(0,1-p.x*p.x-p.y*p.y))};
  };
  function project(p,turn){
    const a=(spinAngle()-turn)*tau;
    return {x:p.x*Math.cos(a)-p.z*Math.sin(a),y:p.y,z:p.x*Math.sin(a)+p.z*Math.cos(a)};
  }
  function pathFor(spot,power,input){
    const points=[];
    for(const p of input||[]){
      if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
      const v=surface(p),last=points[points.length-1];
      if(!last||Math.hypot(v.x-last.x,v.y-last.y)>.024)points.push(v);
    }
    const lengths=[0];
    for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
    const full=lengths[lengths.length-1];
    if(full<.16){
      const dir=flight.scars%2?-.69:.72,c=Math.cos(dir),s=Math.sin(dir),out=[];
      for(let i=0;i<=12;i++){
        const u=i/12,along=(u-.5)*(.90+.14*power),bend=.14*Math.sin(Math.PI*u);
        out.push(surface({x:spot.x*.77+c*along-s*bend,y:spot.y*.77+s*along+c*bend}));
      }
      return out;
    }
    const out=[],count=Math.max(5,Math.min(15,Math.ceil(full/.12)));
    for(let i=0,j=1;i<=count;i++){
      const at=full*i/count;
      while(j<points.length-1&&lengths[j]<at)j++;
      const u=(at-lengths[j-1])/(lengths[j]-lengths[j-1]);
      out.push(surface({x:points[j-1].x+(points[j].x-points[j-1].x)*u,y:points[j-1].y+(points[j].y-points[j-1].y)*u}));
    }
    return out;
  }
  function offset(path,at,distance){
    const prev=path[Math.max(0,at-1)],next=path[Math.min(path.length-1,at+1)],p=path[at];
    const dx=next.x-prev.x,dy=next.y-prev.y,len=Math.hypot(dx,dy)||1;
    return surface({x:p.x-distance*dy/len,y:p.y+distance*dx/len});
  }
  // The solid renderer takes one contiguous span at each latitude. Split the
  // curved ribbon where it doubles back so a hooked swipe retains its opening.
  function ribbons(path){
    const out=[];let start=0,last=0;
    for(let i=1;i<path.length;i++){
      const dy=path[i].y-path[i-1].y,sign=Math.abs(dy)>.003?Math.sign(dy):last;
      if(last&&sign&&sign!==last&&i-1>start){out.push(path.slice(start,i));start=i-1}
      if(sign)last=sign;
    }
    out.push(path.slice(start));return out;
  }
  function growCuts(scar,skin){
    const radius=.036+scar.power*.009;
    for(const lane of scar.lanes){
      for(const piece of ribbons(lane)){
        const center=piece[Math.floor(piece.length/2)],left=[],right=[];
        for(let i=0;i<piece.length;i++){
          const u=i/(piece.length-1),half=radius*(.18+.65*Math.sin(Math.PI*u));
          for(const [edge,sign] of [[left,1],[right,-1]]){
            const p=offset(piece,i,sign*half);
            edge.push([(p.x-center.x)/radius,(p.y-center.y)/radius]);
          }
        }
        const shape=left.concat(right.reverse()),cut=skin.incise(center.x,center.y,scar.turn,radius,shape);
        if(cut)scar.cuts.push(cut);
      }
    }
  }
  const cross=(ax,ay,bx,by)=>ax*by-ay*bx;
  function crossing(path,older){
    for(let k=older.length-1;k>=0;k--){
      const old=older[k],previous=old.center.map(p=>project(p,old.turn));
      for(let j=1;j<previous.length;j++){
        const a=previous[j-1],b=previous[j];if(a.z<.08||b.z<.08)continue;
        const dx=b.x-a.x,dy=b.y-a.y;
        for(let i=1;i<path.length;i++){
          const c=path[i-1],d=path[i],vx=d.x-c.x,vy=d.y-c.y,det=cross(dx,dy,vx,vy);
          if(Math.abs(det)<.32*Math.hypot(dx,dy)*Math.hypot(vx,vy)||Math.abs(det)<1e-6)continue;
          const t=cross(c.x-a.x,c.y-a.y,vx,vy)/det,u=cross(c.x-a.x,c.y-a.y,dx,dy)/det;
          if(t>=0&&t<=1&&u>=0&&u<=1)return surface({x:a.x+t*dx,y:a.y+t*dy});
        }
      }
    }
    return null;
  }
  function cast(spot,power,path){
    if(!flight||flight.phase!=='fight')return;
    const center=pathFor(spot,power,path),lanes=[-1,0,1].map(side=>center.map((_,i)=>
      offset(center,i,side*(.082+.010*power)*(.8+.2*Math.sin(i*Math.PI/(center.length-1))))));
    const scars=flight.clawScars??=[];
    const scar={kind:'claws',power,center,lanes,turn:spinAngle(),cuts:[],index:flight.index,age:0,applied:false,
      crossing:crossing(center,scars),contact:.16};
    flight.specialAttackFX.push(scar);castFlash=1;cooldown=.48+.075*power;
    tone(810,260,.20,'sawtooth',.032);
  }
  function apply(scar){
    const world=worlds[flight.index],mid=scar.center[Math.floor(scar.center.length/2)];
    growCuts(scar,world.skin);
    flight.clawScars.push(scar);if(flight.clawScars.length>8)flight.clawScars.shift();
    const spot=scar.crossing||mid,at=project(spot,scar.turn);
    if(scar.crossing){
      world.skin.impact('gravity',spot.x,spot.y,scar.turn,1.05+.3*scar.power,1-flight.hp/world.health);
      showNotice('CROSSCUT!',.75);tone(138,44,.27,'triangle',.065);
    }
    if(at.z>0){
      ejectCrust(world,at,scar.crossing?2+scar.power:1,'cryo');
      const p=orbitTarget();spark(p.x+at.x*p.r,p.y+at.y*p.r,'#92fbe8',reduceMotion?3:12,88);
    }
    gainEnergy(scar.crossing?15:8);applyWorldDamage(1+scar.power+(scar.crossing?2+scar.power:0));
  }
  function update(dt){
    if(!flight)return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const s=list[i];if(!s||s.kind!=='claws')continue;
      if(s.index!==flight.index||flight.phase!=='fight'){list.splice(i,1);continue}
      s.age+=dt;
      if(!s.applied&&s.age>=s.contact){s.applied=true;apply(s)}
      if(s.age>1.02||flight.phase!=='fight')list.splice(i,1);
    }
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const g=orbitTarget();ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    for(const s of flight.specialAttackFX){
      if(s.kind!=='claws'||s.index!==flight.index)continue;
      const t=s.age,progress=reduceMotion?1:Math.min(1,.07+t/.26),fade=Math.min(1,Math.max(0,(1.02-t)/.58));
      ctx.globalAlpha=fade;
      for(const lane of s.lanes){
        const pts=lane.map(p=>project(p,s.turn)),pos=progress*(pts.length-1);
        ctx.beginPath();let started=false;
        for(let i=0;i<=Math.ceil(pos);i++){
          const a=pts[Math.max(0,i-1)],b=pts[i],u=Math.min(1,pos-(i-1));
          const x=g.x+g.r*(a.x+(b.x-a.x)*u),y=g.y+g.r*(a.y+(b.y-a.y)*u);
          if(b.z<0){started=false;continue}
          if(started)ctx.lineTo(x,y);else ctx.moveTo(x,y);
          started=true;
        }
        for(const [ink,w] of [['#18354b',.054],['#49d6c7',.027],['#e6fffd',.009]]){
          ctx.strokeStyle=ink;ctx.lineWidth=Math.max(.65,g.r*w);ctx.stroke();
        }
        if(!reduceMotion&&progress<1&&started){
          const i=Math.max(1,Math.ceil(pos)),a=pts[i-1],b=pts[i],u=pos-i+1;
          const x=g.x+g.r*(a.x+(b.x-a.x)*u),y=g.y+g.r*(a.y+(b.y-a.y)*u);
          ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(b.y-a.y,b.x-a.x));
          ctx.scale(g.r*.21,g.r*.21);ctx.fillStyle='#b7fff2';ctx.beginPath();ctx.moveTo(0,0);
          ctx.quadraticCurveTo(.08,-.58,-.73,-.95);ctx.quadraticCurveTo(-.23,-.51,-.20,-.05);
          ctx.closePath();ctx.fill();ctx.restore();
        }
      }
    }
    ctx.restore();
  }
  function resonate(scar,power){
    const skin=worlds[flight.index].skin;
    for(const cut of scar.cuts)skin.widen(cut,Math.min(.012,cut.radius*.14)+power*.0015);
  }
  function reset(){if(flight)flight.clawScars=[]}
  return {cast,update,draw,resonate,reset};
})();
