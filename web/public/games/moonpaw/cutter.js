'use strict';

const cutterSpell = (() => {
  const tau = Math.PI*2, rise = .38, flightTime = .59;
  const unit = n => Math.max(0,Math.min(1,n));
  const ease = n => {const t=unit(n);return t*t*(3-2*t)};
  const colors = ['#c7cbff','#aefbff','#ffd4a5'];

  function active(){
    return flight?.phase==='fight' && flight.specialAttackFX.find(f=>f.kind==='cutter' && f.index===flight.index);
  }
  function actionLabel(){
    const f=active();
    if(!f||f.target)return '';
    return f.points.length===3?'Launch wedge':'Mark star '+(f.points.length+1)+'/3';
  }
  function placeStar(pts,spot){
    // Keep intentional precision cuts; assist only near-coincident/collinear taps
    // so the on-screen Cast button and repeated taps also draw a usable triangle.
    const p=clipToDisc(spot.x,spot.y);
    if(!pts.length)return p;
    const a=pts[0];
    if(pts.length===1){
      if(Math.hypot(a.x-p.x,a.y-p.y)>.19)return p;
      const angle=Math.atan2(-a.y,-a.x||.01)+.52;
      return clipToDisc(a.x+.54*Math.cos(angle),a.y+.54*Math.sin(angle));
    }
    const b=pts[1],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
    const signedDistance=((p.y-a.y)*dx-(p.x-a.x)*dy)/len;
    if(Math.abs(signedDistance)>.14)return p;
    const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    const nx=-dy/len,ny=dx/len;
    const side=Math.abs(signedDistance)>.035?Math.sign(signedDistance):((nx*mid.x+ny*mid.y)>0?-1:1);
    return clipToDisc(mid.x+nx*side*.46,mid.y+ny*side*.46);
  }
  function triangle(g,points,x=0,y=0){
    g.beginPath();
    points.forEach((p,i)=>i?g.lineTo(p.x+x,p.y+y):g.moveTo(p.x+x,p.y+y));
    g.closePath();
  }
  function cutWedge(f){
    const world=worlds[f.index],pts=f.points,turn=spinAngle();
    const center={x:(pts[0].x+pts[1].x+pts[2].x)/3,y:(pts[0].y+pts[1].y+pts[2].y)/3};
    f.center=center;
    f.local=pts.map(q=>({x:q.x-center.x,y:q.y-center.y}));
    const xs=pts.map(q=>q.x),ys=pts.map(q=>q.y);
    const x0=Math.min(...xs),y0=Math.min(...ys),w=Math.max(...xs)-x0,h=Math.max(...ys)-y0;
    const card=document.createElement('canvas');
    card.width=Math.max(2,Math.ceil(w*144));card.height=Math.max(2,Math.ceil(h*144));
    const paint=card.getContext('2d');
    paint.setTransform(card.width/w,0,0,card.height/h,-x0*card.width/w,-y0*card.height/h);
    triangle(paint,pts);paint.clip();
    const frame=world.skin.frame(turn)||(world.image?.naturalWidth?world.image:null);
    if(frame)paint.drawImage(frame,-1,-1,2,2);
    else{paint.fillStyle=world.color;paint.fillRect(x0,y0,w,h);}
    f.tile={card,x:x0-center.x,y:y0-center.y,w,h};
    // A triangular prism through the planet removes exactly the selected outline.
    const scale=.056+.008*f.power;
    world.skin.incise(center.x,center.y,turn,scale,f.local.map(q=>[q.x/scale,q.y/scale]));
    f.freedAt=f.age;
    const area=Math.abs(f.local[0].x*(f.local[1].y-f.local[2].y)+f.local[1].x*(f.local[2].y-f.local[0].y)+f.local[2].x*(f.local[0].y-f.local[1].y))/2;
    f.mass=unit(area/.63);
    const p=orbitTarget();
    for(let i=0;i<3;i++)spark(p.x+pts[i].x*p.r,p.y+pts[i].y*p.r,colors[i],reduceMotion?3:6,48);
    tone(415,820,.22,'triangle',.045);gainEnergy(8);
    applyWorldDamage(1+f.power+Math.round(f.mass*3));
  }
  function cast(spot,power){
    if(!flight||flight.phase!=='fight')return;
    let f=active();
    if(!f){
      f={kind:'cutter',index:flight.index,points:[],age:0,lastAt:0,power,freedAt:null,target:null,launchedAt:null,hit:false};
      flight.specialAttackFX.push(f);
    }
    if(f.target)return;
    f.power=Math.max(power,f.power);castFlash=1;cooldown=0;
    if(f.points.length<3){
      const q=placeStar(f.points,spot);f.points.push(q);f.lastAt=f.age;
      tone([510,650,835][f.points.length-1],[760,960,1180][f.points.length-1],.14,'sine',.038);
      if(f.points.length===3)cutWedge(f);
    }else{
      f.target=clipToDisc(spot.x,spot.y);cooldown=.31;tone(820,315,.24,'triangle',.043);
    }
  }
  function heldPose(f,age){
    const t=ease((age-f.freedAt)/rise);
    const hover=Math.max(0,age-f.freedAt-rise);
    const direction=f.center.x<0?-.11:.11;
    return {x:f.center.x+t*(direction+.038*Math.sin(hover*2.1)),
      y:f.center.y-t*((reduceMotion?.25:.42)+.025*Math.sin(hover*3.25)),
      angle:t*(reduceMotion?.08:.27)+.030*Math.sin(hover*2),
      scale:1+.07*t,depth:.105*t};
  }
  function thrownPose(f,u){
    const t=unit(u),s=1-t,a=f.launch,b=f.target,crest=Math.min(a.y,b.y)-(reduceMotion?.20:.67);
    const cx=(a.x+b.x)/2-.13;
    return {x:a.x*s*s+2*s*t*cx+b.x*t*t,y:a.y*s*s+2*s*t*crest+b.y*t*t,
      angle:a.angle+t*(reduceMotion?.59:3.8),scale:a.scale-.30*t,depth:.105};
  }
  function update(dt){
    if(!flight)return;
    for(let i=flight.specialAttackFX.length-1;i>=0;i--){
      const f=flight.specialAttackFX[i];if(f.kind!=='cutter')continue;
      if(flight.phase!=='fight'||f.index!==flight.index){flight.specialAttackFX.splice(i,1);continue;}
      f.age+=dt;
      if(!f.target)continue;
      if(f.launchedAt===null&&f.age-f.freedAt>=rise){
        f.launchedAt=Math.max(f.age-dt,f.freedAt+rise);f.launch=heldPose(f,f.launchedAt);
      }
      if(f.launchedAt===null)continue;
      const elapsed=f.age-f.launchedAt;
      if(!f.hit&&elapsed>=flightTime){
        f.hit=true;
        strikeSurface(f.target,'nova',.77+.29*f.power+.64*f.mass,'comet');
        const p=orbitTarget();
        spark(p.x+f.target.x*p.r,p.y+f.target.y*p.r,'#c9efff',reduceMotion?5:13,96);
        // The three corners shear off on impact and skip outward as separate pieces.
        f.shards=f.local.map((corner,i)=>{
          const angle=Math.atan2(corner.y,corner.x),reach=.21+.30*f.mass;
          return {end:clipToDisc(f.target.x+Math.cos(angle)*reach,f.target.y+Math.sin(angle)*reach),
            tile:splinterTile(worlds[f.index],i+2),delay:i*.07,landed:false};
        });
        hitSound('comet',f.power);gainEnergy(8+f.power);
        applyWorldDamage(2+f.power+Math.round(f.mass*2));
        if(flight.phase!=='fight')return;
      }
      for(const shard of f.shards||[]){
        if(shard.landed||elapsed<flightTime+shard.delay+.42)continue;
        shard.landed=true;
        strikeSurface(shard.end,'nova',.30+.48*f.mass,'nova');
        if(f.mass>.28){applyWorldDamage(1);if(flight.phase!=='fight')return;}
      }
      if(elapsed>flightTime+.85)flight.specialAttackFX.splice(i,1);
    }
  }
  function marker(p,r,index,t){
    const color=colors[index],z=Math.max(2.75,r*.053);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.PI/4);
    ctx.fillStyle='#23304a';ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,r*.013);
    ctx.beginPath();ctx.rect(-z,-z,2*z,2*z);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff9df';ctx.fillRect(-z*.36,-z*.36,.72*z,.72*z);
    ctx.restore();
    if(t<.35){
      ctx.globalAlpha*=1-t/.35;ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,r*.012);
      ctx.beginPath();ctx.arc(p.x,p.y,z*(1.4+3*t),0,tau);ctx.stroke();
    }
  }
  function slab(f,pose,p,world){
    ctx.save();ctx.translate(p.x+p.r*pose.x,p.y+p.r*pose.y);ctx.rotate(pose.angle);
    ctx.scale(p.r*pose.scale,p.r*pose.scale);
    const points=f.local,dx=.35*pose.depth,dy=pose.depth;
    // Give the released piece a lithic interior on each visible side.
    for(let i=0;i<3;i++){
      const a=points[i],b=points[(i+1)%3];
      const side=ctx.createLinearGradient(a.x,a.y,a.x+dx+.001,a.y+dy+.001);
      side.addColorStop(0,world.core);side.addColorStop(.31,world.color);side.addColorStop(1,'#31253f');
      ctx.fillStyle=side;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      ctx.lineTo(b.x+dx,b.y+dy);ctx.lineTo(a.x+dx,a.y+dy);ctx.closePath();ctx.fill();
    }
    const m=f.tile;ctx.drawImage(m.card,m.x,m.y,m.w,m.h);
    triangle(ctx,points);ctx.strokeStyle='#e8ebffc9';ctx.lineWidth=.012;ctx.stroke();
    ctx.restore();
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const f=active();if(!f)return;
    const p=orbitTarget(),lastAge=f.age-f.lastAt,world=worlds[f.index];
    const coords=f.points.map(q=>({x:p.x+q.x*p.r,y:p.y+q.y*p.r}));
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    if(f.freedAt===null||f.age-f.freedAt<.63){
      const fade=f.freedAt===null?1:unit(1-(f.age-f.freedAt)/.63);
      ctx.globalAlpha=fade;
      if(coords.length>=2){
        ctx.beginPath();ctx.moveTo(coords[0].x,coords[0].y);
        for(const q of coords.slice(1))ctx.lineTo(q.x,q.y);
        if(coords.length===3){ctx.closePath();ctx.fillStyle='#a8dfff22';ctx.fill();}
        for(const [c,w] of [['#524f9e',.038],['#dfeffb',.013]]){
          ctx.strokeStyle=c;ctx.lineWidth=Math.max(1,p.r*w);ctx.stroke();
        }
      }
      coords.forEach((q,i)=>{ctx.save();marker(q,p.r,i,i===coords.length-1?lastAge:1);ctx.restore()});
      if(lastAge<.17){
        const q=coords[coords.length-1],paw=castingPaw();ctx.strokeStyle='#cff5ff';
        ctx.lineWidth=Math.max(1,p.r*.018);ctx.globalAlpha=fade*(1-lastAge/.17)*.63;
        ctx.beginPath();ctx.moveTo(paw.x,paw.y);ctx.lineTo(q.x,q.y);ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
    for(const shard of f.shards||[]){
      const t=(f.age-f.launchedAt-flightTime-shard.delay)/.42;
      if(t<0||t>=1)continue;
      const x=p.x+p.r*(f.target.x+(shard.end.x-f.target.x)*t);
      const y=p.y+p.r*(f.target.y+(shard.end.y-f.target.y)*t-.24*Math.sin(t*Math.PI));
      const size=p.r*(.07+.06*f.mass);
      ctx.save();ctx.translate(x,y);ctx.rotate(t*(reduceMotion?.5:3));
      ctx.drawImage(shard.tile,-size,-size*.72,size*2,size*1.44);ctx.restore();
    }
    if(f.tile&&!f.hit){
      let pose=heldPose(f,f.age);
      if(f.launchedAt!==null){
        const t=unit((f.age-f.launchedAt)/flightTime);pose=thrownPose(f,t);
        const trail=new Path2D();
        for(let j=0;j<=8;j++){
          const q=thrownPose(f,Math.max(0,t-.20+.025*j)),x=p.x+q.x*p.r,y=p.y+q.y*p.r;
          if(j)trail.lineTo(x,y);else trail.moveTo(x,y);
        }
        ctx.strokeStyle='#b7b7ff7a';ctx.lineWidth=p.r*.066;ctx.stroke(trail);
      }
      slab(f,pose,p,world);
    }
    ctx.restore();
  }
  return {cast,update,draw,actionLabel};
})();
