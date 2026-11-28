'use strict';

const zipperSpell=(()=>{
  const tau=Math.PI*2;
  const unit=v=>Math.max(0,Math.min(1,v));
  const surface=(x,y)=>{
    const p=clipToDisc(x,y);
    return {...p,z:Math.sqrt(Math.max(0,1-p.x*p.x-p.y*p.y))};
  };
  function selectPath(spot,power,path){
    const raw=[];
    for(const p of path||[]){
      if(!Number.isFinite(p?.x)||!Number.isFinite(p.y))continue;
      const q=surface(p.x,p.y),last=raw[raw.length-1];
      if(!last||Math.hypot(q.x-last.x,q.y-last.y)>.025)raw.push(q);
    }
    const lengths=[0];
    for(let i=1;i<raw.length;i++)lengths.push(lengths[i-1]+Math.hypot(raw[i].x-raw[i-1].x,raw[i].y-raw[i-1].y));
    const total=lengths[lengths.length-1];
    if(total<.18){
      const line=[],c=.93,s=flight.scars%2?.367:-.367;
      for(let i=0;i<=10;i++){
        const t=i/10,h=(t-.5)*(1.45+.11*power),bend=.11*Math.sin(t*tau);
        line.push(surface(spot.x*.64+s*h+c*bend,spot.y*.46+c*h-s*bend));
      }
      return line;
    }
    const count=Math.max(4,Math.min(12,Math.ceil(total/.165))),out=[];
    for(let i=0,j=1;i<=count;i++){
      const at=total*i/count;
      while(j<raw.length-1&&lengths[j]<at)j++;
      const u=(at-lengths[j-1])/(lengths[j]-lengths[j-1]);
      out.push(surface(raw[j-1].x+(raw[j].x-raw[j-1].x)*u,raw[j-1].y+(raw[j].y-raw[j-1].y)*u));
    }
    return out;
  }
  function edges(center,power){
    return center.map((p,i)=>{
      const prev=center[Math.max(0,i-1)],next=center[Math.min(center.length-1,i+1)];
      let dx=next.x-prev.x,dy=next.y-prev.y;
      if(Math.hypot(dx,dy)<.001){dx=p.x-prev.x;dy=p.y-prev.y;}
      const length=Math.hypot(dx,dy)||1;
      const t=i/(center.length-1);
      const half=(.076+power*.024)*(.36+.64*Math.pow(Math.sin(Math.PI*t),.46));
      return [-1,1].map(side=>surface(p.x-side*dy/length*half,p.y+side*dx/length*half));
    });
  }
  // A hooked swipe can pass the same latitude more than once. Small monotone
  // sections let the terrain renderer preserve both arms and the rock between.
  function sections(points){
    const result=[];let first=0,direction=0;
    for(let i=1;i<points.length;i++){
      const delta=points[i].y-points[i-1].y,next=Math.abs(delta)>.004?Math.sign(delta):direction;
      if(i-first>2||(direction&&next&&next!==direction&&i-1>first)){
        result.push([first,i-1]);first=i-1;
      }
      direction=next;
    }
    result.push([first,points.length-1]);return result;
  }
  function crustCards(world,points,edge){
    const frame=world.skin.frame(spinAngle())||(world.image.naturalWidth?world.image:null);
    if(!frame)return null;
    const cards=[];
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
      if(len<.001){cards.push(null);continue;}
      const ux=dx/len,uy=dy/len,p=edge[i][1],q=edge[i-1][1];
      const half=Math.max(.018,(Math.hypot(p.x-b.x,p.y-b.y)+Math.hypot(q.x-a.x,q.y-a.y))/2);
      cards.push([-1,1].map(side=>{
        const card=document.createElement('canvas');card.width=72;card.height=28;
        const g=card.getContext('2d'),sx=card.width/len,sy=side*card.height/half;
        g.setTransform(ux*sx,-uy*sy,uy*sx,ux*sy,-(a.x*ux+a.y*uy)*sx,(a.x*uy-a.y*ux)*sy);
        g.drawImage(frame,-1,-1,2,2);
        return card;
      }));
    }
    return cards;
  }
  function project(point,rot){
    return {x:point.x*rot.c-point.z*rot.s,y:point.y,z:point.x*rot.s+point.z*rot.c};
  }
  function rotation(f){
    const a=(spinAngle()-f.turn)*tau;return{c:Math.cos(a),s:Math.sin(a)};
  }
  function cast(spot,power,path){
    if(!flight||flight.phase!=='fight')return;
    const world=worlds[flight.index],points=selectPath(spot,power,path),edge=edges(points,power);
    flight.specialAttackFX.push({kind:'zipper',index:flight.index,power,points,edge,turn:spinAngle(),age:0,
      travel:.64+power*.12,sections:sections(points),next:0,damage:0,cards:crustCards(world,points,edge)});
    cooldown=.73+.095*power;castFlash=1;tone(690,1190,.14,'triangle',.034);
  }
  function openSection(f,range){
    const [start,end]=range,middle=f.points[Math.floor((start+end)/2)],r=.078+.017*f.power;
    const path=[];
    for(let i=start;i<=end;i++)path.push(f.edge[i][0]);
    for(let i=end;i>=start;i--)path.push(f.edge[i][1]);
    const world=worlds[f.index],shape=path.map(q=>[(q.x-middle.x)/r,(q.y-middle.y)/r]);
    world.skin.incise(middle.x,middle.y,f.turn,r,shape);
    const pos=project(f.points[end],rotation(f)),last=end===f.points.length-1;
    if(pos.z>.01){
      const g=orbitTarget();spark(g.x+g.r*pos.x,g.y+g.r*pos.y,'#ffdf95',reduceMotion?2:5,62);
      if(last||f.next%2===0)peelCrust(world,pos,.10+.012*f.power,'solar');
    }
    tone(370+f.next*67,200,.053,'triangle',.021);
    const total=Math.round((3+f.power)*end/(f.points.length-1));
    const amount=total-f.damage;f.damage=total;
    if(last){gainEnergy(11+f.power);hitSound('cryo',f.power);}
    applyWorldDamage(amount);
  }
  function update(dt){
    if(!flight)return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const f=list[i];if(f.kind!=='zipper')continue;
      if(f.index!==flight.index||flight.phase!=='fight'){list.splice(i,1);continue;}
      f.age+=dt;
      const t=unit((f.age-.16)/f.travel),last=f.points.length-1;
      while(f.next<f.sections.length&&t>=(f.sections[f.next][0]+f.sections[f.next][1])/(2*last)){
        const range=f.sections[f.next++];openSection(f,range);
        if(flight.phase!=='fight')return;
      }
      if(f.age>f.travel+2.4)list.splice(i,1);
    }
  }
  function metalPull(p,r,angle,age){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);ctx.scale(r,r);
    const brass=ctx.createLinearGradient(0,-1,0,1);
    brass.addColorStop(0,'#fff9c0');brass.addColorStop(.22,'#d4a059');brass.addColorStop(.49,'#fff3ac');
    brass.addColorStop(.67,'#916247');brass.addColorStop(1,'#f6c280');
    ctx.strokeStyle='#573857';ctx.lineWidth=.12;ctx.fillStyle=brass;
    ctx.beginPath();ctx.moveTo(-.82,-.30);ctx.lineTo(.05,-.79);ctx.quadraticCurveTo(.79,-.70,.88,0);
    ctx.quadraticCurveTo(.79,.70,.05,.79);ctx.lineTo(-.82,.30);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#65546a';ctx.beginPath();ctx.ellipse(-.12,0,.54,.18,0,0,tau);ctx.fill();
    ctx.rotate(reduceMotion?-.16:-.25+.20*Math.sin(age*14));
    ctx.fillStyle=brass;ctx.beginPath();ctx.moveTo(-.28,-.19);ctx.lineTo(-1.59,-.33);
    ctx.quadraticCurveTo(-2.33,0,-1.59,.33);ctx.lineTo(-.28,.19);ctx.closePath();
    ctx.moveTo(-1.28,-.11);ctx.ellipse(-1.39,0,.22,.11,0,0,tau);ctx.fill('evenodd');ctx.stroke();
    ctx.restore();
  }
  function rolledEdge(card,len,w,start,side,openness,world){
    ctx.save();ctx.scale(1,side);ctx.translate(0,start);
    const height=Math.max(.7,w*.75*openness);
    ctx.fillStyle='#18132593';ctx.fillRect(0,height*.13,len+1,height*1.13);
    // The old surface folds onto a convex roll. Its dark underside, mantle
    // highlight and exterior texture sit on different faces of the same lip.
    const curl=ctx.createLinearGradient(0,0,0,height);
    curl.addColorStop(0,'#3d2837');curl.addColorStop(.18,world.core);curl.addColorStop(.39,world.color);
    curl.addColorStop(.66,'#5c4354');curl.addColorStop(1,'#241c28');
    ctx.fillStyle=curl;ctx.fillRect(0,0,len+.8,height);
    if(card){ctx.save();ctx.globalAlpha*=.91;ctx.drawImage(card,0,height*.46,len+.8,height*.53);ctx.restore();}
    ctx.restore();
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const p=orbitTarget(),world=worlds[flight.index];
    for(const f of flight.specialAttackFX){
      if(f.kind!=='zipper'||f.index!==flight.index)continue;
      const rot=rotation(f),points=f.points.map(q=>project(q,rot));
      const pos=unit((f.age-.16)/f.travel)*(points.length-1);
      const stamp=Math.min(1,f.age/.13),fade=unit((f.travel+2.4-f.age)/.72);
      const metalFade=unit((f.travel+.64-f.age)/.38);
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
      for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i];if(a.z<=0||b.z<=0)continue;
        const dx=(b.x-a.x)*p.r,dy=(b.y-a.y)*p.r,len=Math.hypot(dx,dy);
        if(len<.3)continue;
        const l=project(f.edge[i][0],rot),r=project(f.edge[i][1],rot);
        const w=Math.max(.7,p.r*Math.hypot(r.x-l.x,r.y-l.y)/2);
        const opened=unit(pos-i+1);
        ctx.save();ctx.translate(p.x+a.x*p.r,p.y+a.y*p.r);ctx.rotate(Math.atan2(dy,dx));
        for(let j=0;j<2;j++){
          const side=j?1:-1,outset=w*opened;
          if(opened>0){
            ctx.globalAlpha=stamp*fade*opened;
            rolledEdge(f.cards?.[i-1]?.[j],len,w,outset*.88,side,opened,world);
          }
          if(metalFade<=0)continue;
          ctx.globalAlpha=metalFade*stamp;ctx.strokeStyle='#5a3b55';
          ctx.lineWidth=Math.max(.8,p.r*.018);ctx.beginPath();ctx.moveTo(0,side*(outset+p.r*.021));ctx.lineTo(len,side*(outset+p.r*.021));ctx.stroke();
          // Alternating brass teeth interlock before the slider reaches them.
          const count=Math.max(1,Math.ceil(len/(p.r*.075)));
          const gap=len/count,tw=Math.min(4.8,gap*.62);
          ctx.fillStyle=j?'#ffe1a0':'#e5a96d';
          for(let k=0;k<count;k++){
            const x=(k+(j?.73:.27))*gap;
            ctx.fillRect(x-tw*.46,side*outset-(j?.35:.65)*p.r*.046,tw,p.r*.046);
          }
        }
        ctx.restore();
      }
      if(metalFade>0){
        const index=Math.min(points.length-2,Math.floor(pos)),u=pos-index,a=points[index],b=points[index+1];
        const q={x:p.x+p.r*(a.x+(b.x-a.x)*u),y:p.y+p.r*(a.y+(b.y-a.y)*u)};
        if(a.z+(b.z-a.z)*u>0){
          ctx.globalAlpha=stamp*metalFade;
          metalPull(q,p.r*(.082+.009*f.power),Math.atan2(b.y-a.y,b.x-a.x),f.age);
        }
      }
      ctx.restore();
    }
  }
  return {cast,update,draw};
})();
