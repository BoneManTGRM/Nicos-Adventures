'use strict';

const spitballSpell = (() => {
  const tau = Math.PI*2, impactTime = .46, exitTime = .72, lifetime = 1.28;
  const patch = {x:426, y:149, w:214, h:96};
  let cheeks, painted;
  const loaded = () => !!flight?.spitballLoad;
  const unit = t => Math.max(0,Math.min(1,t));

  function load(world) {
    if (!flight || loaded()) return false;
    // Keep a rendered chip, not the old world's surface buffers, when changing planets.
    flight.spitballLoad = {name:world.name, tint:world.color, core:world.core,
      tile:splinterTile(world, world.seed%9)};
    return true;
  }

  function paintCheeks(ammo, image) {
    cheeks ??= document.createElement('canvas');
    cheeks.width=patch.w;cheeks.height=patch.h;
    cheeks.setAttribute('aria-hidden','true');
    Object.assign(cheeks.style,{
      position:'absolute',inset:'auto',width:(100*patch.w/768)+'%',height:(100*patch.h/502)+'%',
      display:'block',zIndex:'3',pointerEvents:'none',transformOrigin:'0 0'
    });
    if (!cheeks.parentElement) cat.append(cheeks);
    const g=cheeks.getContext('2d');
    if (!g) return;
    // Expand two feathered samples of Moonpaw's own muzzle. Their texture and whiskers
    // follow the head layer, and light from the stored mineral shines through the fur.
    const part=document.createElement('canvas');part.width=120;part.height=76;
    const ink=part.getContext('2d');
    for(const [sx,sy,sw,sh,dx,dy,dw,dh] of [
      [452,168,91,47,438,163,113,65], [562,166,52,42,561,161,64,57]
    ]){
      ink.clearRect(0,0,120,76);
      ink.drawImage(image,sx,sy,sw,sh,0,0,dw,dh);
      ink.save();ink.scale(dw,dh);
      const light=ink.createRadialGradient(.49,.54,.01,.49,.54,.52);
      light.addColorStop(0,ammo.core+'a5');light.addColorStop(.40,ammo.tint+'75');light.addColorStop(1,ammo.tint+'00');
      ink.globalCompositeOperation='screen';ink.fillStyle=light;ink.fillRect(0,0,1,1);
      const mask=ink.createRadialGradient(.5,.5,.21,.5,.5,.5);
      mask.addColorStop(0,'#fff');mask.addColorStop(.58,'#fff');mask.addColorStop(1,'#fff0');
      ink.globalCompositeOperation='destination-in';ink.fillStyle=mask;ink.fillRect(0,0,1,1);ink.restore();
      g.drawImage(part,dx-patch.x,dy-patch.y);
    }
    painted=ammo;
  }

  function drawCheeks() {
    if (!loaded() || mode==='title') {
      if (cheeks) cheeks.style.display='none';
      return;
    }
    const ammo=flight.spitballLoad, base=$('catImage');
    if (!base.naturalWidth) return;
    if (painted!==ammo) paintCheeks(ammo,base);
    if (!cheeks) return;
    const h=cat.classList.contains('gpu')?actorBones().head:unitMatrix;
    const pos=skinPoint(h,patch.x,patch.y);
    cheeks.style.display='block';cheeks.style.left=(100*pos.x/768)+'%';cheeks.style.top=(100*pos.y/502)+'%';
    cheeks.style.transform='matrix('+h.slice(0,4).join(',')+',0,0)';
  }

  function mouth() {
    const q=skinPoint(actorBones().head,548,200),w=playerArtWidth(),angle=player.tilt*Math.PI/180;
    const dx=w*(q.x/768-.5),dy=w*(q.y-251)/768;
    return{x:player.x+dx*Math.cos(angle)-dy*Math.sin(angle),y:player.y+dx*Math.sin(angle)+dy*Math.cos(angle)};
  }

  function cast(spot,power) {
    if(!flight||flight.phase!=='fight')return;
    if(!loaded()){showNotice('BITE A PLANET TO LOAD A SPITBALL',1.0);return}
    const origin=mouth(),ammo=flight.spitballLoad;
    const z=Math.sqrt(Math.max(0,1-spot.x**2-spot.y**2));
    // One oblique, solid tunnel. The far exit is the opposite endpoint of the
    // chord in its own cutting plane, not a second spot picked in screen space.
    const yaw=-.27,cos=Math.cos(yaw),sin=Math.sin(yaw);
    const boreX=spot.x*cos-z*sin, depth=spot.x*sin+z*cos;
    const core=Math.hypot(spot.x,spot.y)<=.28;
    flight.spitballLoad=null;
    flight.specialAttackFX.push({kind:'spitball',index:flight.index,age:0,step:0,spot,core,power,ammo,
      origin:{x:origin.x/W,y:origin.y/H},boreX,yaw,exitX:spot.x-2*depth*sin,
      exitZ:z-2*depth*cos,entryZ:z,turn:null});
    cooldown=.79;castFlash=1;
    tone(150,730,.14,'triangle',.06);drawCheeks();
  }

  function update(dt) {
    if(!flight)return;
    const effects=flight.specialAttackFX;
    for(let i=effects.length-1;i>=0;i--){
      const f=effects[i];
      if(f.kind!=='spitball')continue;
      if(f.index!==flight.index||flight.phase!=='fight'){effects.splice(i,1);continue}
      f.age+=dt;
      const world=worlds[f.index],skin=world.skin;
      if(f.step===0&&f.age>=impactTime){
        f.step=1;f.turn=spinAngle();const size=(f.core?1.75:1.0)+.29*f.power;
        f.cut=skin.impact('solar',f.boreX,f.spot.y,f.turn+f.yaw/tau,size,1-flight.hp/world.health);
        ejectCrust(world,f.spot,Math.ceil(size),'solar');
        hitSound('comet',f.power);gainEnergy(f.core?14:9);
        applyWorldDamage(1+f.power);
        if(flight.phase!=='fight')return;
      }
      if(f.step===1&&f.age>=exitTime){
        f.step=2;
        const reverseTurn=f.turn+f.yaw/tau+.5;
        skin.impact('solar',-f.boreX,f.spot.y,reverseTurn,f.core?1.8:.8,1-flight.hp/world.health);
        if(f.core){skin.widen(f.cut,.075+.014*f.power);showNotice('CORE SHOT!',1.0);addScore(120)}
        tone(f.core?880:610,180,.20,'triangle',.055);
        applyWorldDamage(2+(f.core?3:0));
        if(flight.phase!=='fight')return;
      }
      if(f.age>=lifetime)effects.splice(i,1);
    }
  }

  function drawAim() {
    if(!loaded()||flight.phase!=='fight'||selectedSpell!=='spitball')return;
    const p=orbitTarget(),r=p.r*.28;
    ctx.save();ctx.translate(p.x,p.y);ctx.strokeStyle='#ffdf94';ctx.lineWidth=Math.max(1,r*.07);
    ctx.setLineDash([r*.26,r*.17]);ctx.beginPath();ctx.arc(0,0,r,0,tau);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#fff1c3';ctx.beginPath();ctx.arc(0,0,Math.max(1.4,r*.08),0,tau);ctx.fill();ctx.restore();
  }

  function draw() {
    if(!flight||flight.phase!=='fight')return;
    const planet=orbitTarget();
    for(const f of flight.specialAttackFX){
      if(f.kind!=='spitball')continue;
      const delta=f.turn===null?0:(spinAngle()-f.turn)*tau;
      const entryX=f.spot.x*Math.cos(delta)-f.entryZ*Math.sin(delta);
      const exitX=f.exitX*Math.cos(delta)-f.exitZ*Math.sin(delta);
      const y=planet.y+f.spot.y*planet.r;
      const entry=planet.x+entryX*planet.r,exit=planet.x+exitX*planet.r;
      const departure=f.origin.x*W,fromY=f.origin.y*H;
      const size=planet.r*(.17+.027*f.power);
      if(f.age>=impactTime&&f.age<exitTime){
        const t=(f.age-impactTime)/(exitTime-impactTime);
        ctx.save();ctx.lineCap='round';ctx.strokeStyle=f.ammo.core;
        ctx.lineWidth=size*(.085+.07*(1-t));ctx.globalAlpha=.76;
        ctx.beginPath();ctx.moveTo(entry,y);ctx.lineTo(entry+(exit-entry)*t,y);ctx.stroke();ctx.restore();
        continue;
      }
      const inbound=f.age<impactTime;
      const t=inbound?unit(f.age/impactTime):unit((f.age-exitTime)/(lifetime-exitTime));
      const x=inbound?departure+(entry-departure)*t:exit+(1.65*planet.r)*t;
      const by=inbound?fromY+(y-fromY)*t-planet.r*.22*Math.sin(Math.PI*t):y-planet.r*.34*t;
      const angle=Math.atan2(inbound?y-fromY:-planet.r*.34,inbound?entry-departure:planet.r*1.65);
      ctx.save();ctx.translate(x,by);ctx.rotate(angle);ctx.globalAlpha=inbound?1:1-t*t;
      const tail=size*(reduceMotion?1.4:2.7),tracer=ctx.createLinearGradient(-tail,0,0,0);
      tracer.addColorStop(0,f.ammo.tint+'00');tracer.addColorStop(.72,f.ammo.tint+'bd');tracer.addColorStop(1,f.ammo.core);
      ctx.fillStyle=tracer;ctx.beginPath();ctx.moveTo(-tail,0);ctx.lineTo(0,-size*.48);
      ctx.quadraticCurveTo(size*.42,0,0,size*.46);ctx.closePath();ctx.fill();
      ctx.rotate(reduceMotion?0:f.age*6);ctx.drawImage(f.ammo.tile,-size,-size*.77,size*2,size*1.54);
      ctx.restore();
      if(!inbound){
        ctx.save();ctx.translate(exit,y);ctx.rotate(-.26);
        ctx.strokeStyle=f.core?'#fff3b4':f.ammo.core;ctx.lineWidth=Math.max(1,size*.14*(1-t));
        ctx.globalAlpha=.92*(1-t);ctx.beginPath();ctx.ellipse(0,0,size*(.7+.9*t),size*(.31+.4*t),0,0,tau);ctx.stroke();ctx.restore();
      }
    }
  }

  return {load,loaded,drawCheeks,drawAim,cast,update,draw};
})();
