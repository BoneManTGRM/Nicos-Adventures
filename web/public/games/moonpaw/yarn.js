'use strict';

const yarnSpell=(()=>{
  const tau=Math.PI*2, launch=.30, wind=.98, timeout=4.5, pullLife=1.04;
  const unit=t=>Math.max(0,Math.min(1,t));
  const ease=t=>t*t*(3-2*t);
  const find=()=>flight?.specialAttackFX.find(f=>f.kind==='yarn'&&f.index===flight.index);
  const colors=['#ff77b5','#ffac67','#ffdf81'];
  function actionLabel(){
    const f=find();return f&&!f.queued&&!f.pulling?'Tap to pull':'';
  }
  function requestPull(f,power){
    if(!f||f.pulling||f.queued)return false;
    f.queued=true;f.power=Math.max(f.power,power);
    tone(750,480,.13,'triangle',.028);return true;
  }
  function pullForPurr(){return requestPull(find(),1);}
  function cast(spot,power){
    if(!flight||flight.phase!=='fight')return;
    const active=find();
    if(active){requestPull(active,power);cooldown=.09;return;}
    const paw=castingPaw(),bias=clamp(spot.y*.31,-.21,.21);
    const bands=(power===3?[-.46,0,.46]:[-.32,.32]).map(y=>y+bias);
    flight.specialAttackFX.push({kind:'yarn',index:flight.index,age:0,power,bands,progress:0,origin:{x:paw.x/W,y:paw.y/H},
      queued:false,pulling:false,pullAge:0,next:0,plates:[]});
    cooldown=.065;castFlash=1;tone(390,900,.22,'sine',.042);
    showNotice('CAST AGAIN TO PULL THE YARN',1.25);
  }
  function bandPoint(f,u){
    const count=f.bands.length,v=Math.min(u*count,count-.00001),i=Math.floor(v),t=v-i;
    const a=Math.PI+t*tau,y=f.bands[i];
    const r=Math.sqrt(1-y*y)*1.014;
    return {x:r*Math.cos(a),y:y+.105*r*Math.sin(a),z:-Math.sin(a),i};
  }
  function liftedPlate(world,f,y,half,i){
    const frame=world.skin.frame(spinAngle()) || (world.image.naturalWidth?world.image:null);
    const width=320,height=38,card=document.createElement('canvas');card.width=width;card.height=height;
    const g=card.getContext('2d'),rx=Math.sqrt(1-y*y);
    // Capture the actual crust before removing it, including older holes in the belt.
    if(frame){
      const sw=frame.width||frame.naturalWidth,sh=frame.height||frame.naturalHeight;
      g.drawImage(frame,sw*(1-rx)/2,sh*(1+y-half)/2,sw*rx,sh*half,0,0,width,height);
    }else{g.fillStyle=world.color;g.fillRect(0,0,width,height);}
    // Tint only solid rock, leaving existing holes transparent.
    g.globalCompositeOperation='source-atop';
    const edge=g.createLinearGradient(0,0,0,height);edge.addColorStop(0,world.core+'cc');
    edge.addColorStop(.21,'#ffffff15');edge.addColorStop(.65,'#09071211');edge.addColorStop(1,'#120c226e');
    g.fillStyle=edge;g.fillRect(0,0,width,height);
    return {card,y,rx,half,side:i%2?1:-1,birth:f.pullAge,index:i};
  }
  function split(f,i){
    const world=worlds[f.index],p=orbitTarget(),y=f.bands[i],half=.031+f.power*.006;
    f.plates.push(liftedPlate(world,f,y,half,i));
    // A single thin, ragged solid cut spans the whole sphere at this latitude.
    // Its volume and the negative space between the crust sections persist.
    const shape=[];
    for(let side=-1;side<=1;side+=2){
      for(let j=0;j<=12;j++){
        const k=side<0?j:12-j,x=-1.07+2.14*k/12;
        const fault=(.0049*Math.sin(k*2.53+i)+.003*Math.sin(k*1.31));
        shape.push([x/half,side+fault/half]);
      }
    }
    world.skin.incise(0,y,spinAngle(),half,shape);
    for(const side of [-1,1]){
      const spot={x:side*Math.sqrt(1-y*y)*.79,y};
      ejectCrust(world,spot,1,'cryo');
      spark(p.x+spot.x*p.r,p.y+spot.y*p.r,colors[i],reduceMotion?3:7,72);
    }
    gainEnergy(5);tone(480+i*120,95,.17,'triangle',.04);
    applyWorldDamage(2+(i===f.bands.length-1?f.power:0));
  }
  function update(dt){
    if(!flight||flight.phase!=='fight')return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const f=list[i];if(f.kind!=='yarn')continue;
      if(f.index!==flight.index){list.splice(i,1);continue;}
      f.age+=dt;
      if(f.age>launch)f.progress=unit(f.progress+dt*(f.queued?1.65:1)/wind);
      if(!f.pulling&&f.progress>=1&&(f.queued||f.age>=timeout)){
        f.pulling=true;hitSound('cryo',f.power);tone(210,72,.29,'sawtooth',.038);
      }
      if(!f.pulling)continue;
      f.pullAge+=dt;
      while(f.next<f.bands.length&&f.pullAge>=.065+f.next*.116){
        split(f,f.next++);if(flight.phase!=='fight')return;
      }
      if(f.pullAge>pullLife)list.splice(i,1);
    }
  }
  function yarnBall(x,y,r,spin,opacity){
    if(r<=0||opacity<=0)return;
    ctx.save();ctx.translate(x,y);ctx.rotate(spin);ctx.globalAlpha=opacity;
    const g=ctx.createRadialGradient(-r*.38,-r*.42,.02*r,0,0,r);
    g.addColorStop(0,'#fff1c7');g.addColorStop(.30,'#ffb470');g.addColorStop(.71,'#ee6494');g.addColorStop(1,'#863b73');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,tau);ctx.fill();ctx.clip();
    ctx.strokeStyle='#87254b';ctx.lineWidth=Math.max(.75,r*.11);
    for(let i=-2;i<3;i++){
      ctx.beginPath();ctx.moveTo(-r,i*r*.36-r*.29);ctx.quadraticCurveTo(-r*.19,i*r*.36+r*.47,r,i*r*.36-r*.23);ctx.stroke();
    }
    ctx.strokeStyle='#ffddb0';ctx.lineWidth=Math.max(.6,r*.074);
    ctx.beginPath();ctx.ellipse(-.09*r,0,r*.46,r*1.12,-.8,0,tau);ctx.stroke();ctx.restore();
  }
  function cord(path,color,r,t){
    ctx.lineCap='round';ctx.lineJoin='round';
    for(const [width,ink] of [[.060,'#652744'],[.043,color],[.011,'#ffe6cf']]){
      ctx.strokeStyle=ink;ctx.lineWidth=Math.max(.8,r*width);ctx.stroke(path);
    }
    ctx.strokeStyle='#fff1cf';ctx.lineWidth=Math.max(.7,r*.011);
    ctx.setLineDash([r*.02,r*.061]);ctx.lineDashOffset=-r*t*.13;ctx.stroke(path);ctx.setLineDash([]);
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const p=orbitTarget();
    for(const f of flight.specialAttackFX){
      if(f.kind!=='yarn'||f.index!==flight.index)continue;
      const paw=castingPaw(),end=bandPoint(f,Math.min(.9999,f.progress));
      const begin=bandPoint(f,0),arrive=unit(f.age/launch);
      const start={x:p.x+p.r*begin.x,y:p.y+p.r*begin.y};
      const spool=f.age<launch?{x:f.origin.x*W*(1-arrive)+start.x*arrive,
        y:f.origin.y*H*(1-arrive)+start.y*arrive-p.r*.21*Math.sin(arrive*Math.PI)}:{x:p.x+end.x*p.r,y:p.y+end.y*p.r};
      ctx.save();
      if(f.age<launch||f.pullAge<.31){
        const bob=f.pulling?0:Math.sin(f.age*4)*.04*p.r;
        const tether=new Path2D();tether.moveTo(paw.x,paw.y);
        const anchor=f.age<launch?spool:start;
        tether.quadraticCurveTo(.49*(anchor.x+paw.x),.5*(anchor.y+paw.y)+(f.pulling?.014:.21)*p.r+bob,anchor.x,anchor.y);
        ctx.globalAlpha=f.pulling?unit(1-f.pullAge/.31):.79;cord(tether,'#ffad90',p.r*.69,f.age);
      }
      for(let i=0;i<f.bands.length;i++){
        const fraction=unit(f.progress*f.bands.length-i);
        if(!fraction)continue;
        const fade=unit(1-(f.pullAge-.065-i*.116)/.22);
        if(!fade)continue;ctx.globalAlpha=fade;
        const path=new Path2D();
        // Only the front arc lies above the opaque globe. The strand crosses
        // to the next latitude as it returns around the far limb.
        const until=Math.min(.5,fraction);
        for(let j=0;j<=24;j++){
          const q=bandPoint(f,(i+until*j/24)/f.bands.length);
          const x=p.x+q.x*p.r,y=p.y+q.y*p.r;
          if(j===0)path.moveTo(x,y);else path.lineTo(x,y);
        }
        cord(path,colors[i],p.r,f.age);
        if(i&&fraction>0){
          const upper=f.bands[i-1],lower=f.bands[i],uy=p.y+upper*p.r,ly=p.y+lower*p.r;
          const ux=p.x-p.r*Math.sqrt(1-upper*upper),lx=p.x-p.r*Math.sqrt(1-lower*lower);
          const connect=new Path2D();connect.moveTo(ux,uy);connect.quadraticCurveTo(Math.min(ux,lx)-p.r*.09,(uy+ly)/2,lx,ly);
          cord(connect,colors[i],p.r*.73,f.age);
        }
      }
      if(!f.pulling&&(f.age<launch||end.z>=-.08||f.progress>=1))yarnBall(spool.x,spool.y,p.r*(.103+.012*f.power),f.age*(reduceMotion?1:5),1);
      for(const piece of f.plates){
        const t=unit((f.pullAge-piece.birth)/.75),g=ease(t);
        const left=p.x-p.r*.24*g,right=p.x+p.r*.28*g;
        const startY=p.y+piece.y*p.r,dy=p.r*piece.side*(reduceMotion?.15:.38)*g;
        const halfW=p.r*piece.rx;
        const h=2*p.r*piece.half*(1+.85*Math.sin(t*Math.PI));
        ctx.globalAlpha=unit((1-t)/.35);
        // Both halves retain their crust and tangent while the cord rips them apart.
        for(const side of [-1,1]){
          ctx.save();ctx.translate(side<0?left:right,startY+dy);
          ctx.rotate(side*piece.side*g*(reduceMotion?.045:.24));
          const sx=side<0?0:piece.card.width/2;
          ctx.drawImage(piece.card,sx,0,piece.card.width/2,piece.card.height,side<0?-halfW:0,-h/2,halfW,h);
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }
  return {cast,update,draw,actionLabel,pullForPurr};
})();
