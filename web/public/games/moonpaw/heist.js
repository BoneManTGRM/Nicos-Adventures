'use strict';

const heistSpell = (() => {
  const circle = Math.PI*2, grab = .52, buckle = .98, collapse = 1.37, lifetime = 1.84;
  const gold = '#ffdc92', ivory = '#fff4cb';
  function smooth(t) {
    t = Math.max(0, Math.min(t, 1));
    return t*t*(3-2*t);
  }

  function cast(spot, power) {
    if (!flight || flight.phase !== 'fight') return;
    const world = worlds[flight.index];
    const turn = spinAngle();
    // Keep the selected mouth fixed to the crust even if this strike widens a prior tunnel.
    const angle = turn*circle, depth = Math.sqrt(Math.max(0, 1-spot.x**2-spot.y**2));
    const anchor = {px: spot.x*Math.cos(angle) + depth*Math.sin(angle), y:spot.y,
      pz: depth*Math.cos(angle) - spot.x*Math.sin(angle)};
    const cut = world.skin.impact('gravity', spot.x, spot.y, turn, .64+.21*power, 1-flight.hp/world.health);
    flight.specialAttackFX.push({kind:'heist', index:flight.index, age:0, step:0, power, cut, anchor,
      bearing:flight.scars*2.4});
    cooldown = 1.67;
    castFlash = 1;
    tone(470, 208, .30, 'sine', .044);
    gainEnergy(4);
    applyWorldDamage(1);
  }

  function update(dt) {
    if (!flight) return;
    const effects = flight.specialAttackFX;
    for (let i=effects.length-1; i>=0; i--) {
      const fx=effects[i];
      if (fx.kind !== 'heist') continue;
      if (fx.index !== flight.index || flight.phase !== 'fight') { effects.splice(i,1); continue; }
      fx.age+=dt;
      const world=worlds[fx.index];
      if (!fx.step && fx.age>=grab) {
        fx.step=1;
        tone(370, 890, .30, 'triangle', .052);
        gainEnergy(5+fx.power);
      }
      if (fx.step===1 && fx.age>=buckle) {
        fx.step=2;
        world.skin.widen(fx.cut,.080+.030*fx.power);
        hitSound('gravity',fx.power);
        applyWorldDamage(1+fx.power);
        if (flight.phase!=='fight') return;
      }
      if (fx.step===2 && fx.age>=collapse) {
        fx.step=3;
        world.skin.widen(fx.cut,.052+.019*fx.power);
        const mouth=world.skin.project(fx.anchor,spinAngle());
        // A shorter shear into the deeper crust breaks the supporting lip on the inside.
        const x=mouth.x*.46+.40*Math.cos(fx.bearing), y=mouth.y*.46+.40*Math.sin(fx.bearing);
        world.skin.impact('gravity', x, y, spinAngle(), .48+.23*fx.power, 1-flight.hp/world.health);
        const planet=orbitTarget();
        labels.push({x:planet.x+planet.r*x,y:planet.y+planet.r*y,val:'CORE TAKEN',life:.78});
        tone(148,44,.43,'triangle',.061);
        gainEnergy(7);
        applyWorldDamage(2+fx.power);
        if (flight.phase!=='fight') return;
      }
      if (fx.age>=lifetime) effects.splice(i,1);
    }
  }

  function ellipse(x,y,rx,ry,angle,fill) {
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,circle);ctx.fillStyle=fill;ctx.fill();
  }

  function spectralPaw(x,y,size,heading,grip,alpha) {
    ctx.save();ctx.translate(x,y);ctx.rotate(heading);ctx.scale(size,size);ctx.globalAlpha=alpha;
    const fur=ctx.createLinearGradient(-.8,-.58,.55,.6);
    fur.addColorStop(0,'#bdfcff');fur.addColorStop(.48,'#5abff6');fur.addColorStop(1,'#3357a8');
    ctx.fillStyle=fur;ctx.strokeStyle='#a8ebff';ctx.lineWidth=.048;
    ctx.beginPath();ctx.moveTo(-1.1,-.24);
    ctx.bezierCurveTo(-.63,-.26,-.50,-.53,-.02,-.50);
    ctx.bezierCurveTo(.48,-.66,.66,-.06,.46,.35);
    ctx.bezierCurveTo(.21,.64,-.41,.51,-.63,.32);
    ctx.lineTo(-1.1,.27);ctx.closePath();ctx.fill();ctx.stroke();
    ellipse(-.85,0,.12,.31,.01,gold);
    // Pads and toes fold toward the palm as the spectral double takes hold.
    ellipse(-.05,.015,.28,.26,-.24,'#44478f');
    ellipse(-.09,-.04,.21,.16,-.3,'#ad97ec');
    for (let k=0;k<4;k++) {
      const a=(-.86+k*.55)*(1-grip*.36);
      const reach=.62-grip*.20-(k===0||k===3?.075:0);
      const tx=reach*Math.cos(a),ty=.74*Math.sin(a);
      ellipse(tx,ty,.29-grip*.055,.175,a,fur);
      ellipse(tx+.038*Math.cos(a),ty+.032,.145,.088,a,'#8278c8');
    }
    ctx.restore();
  }

  function stolenCore(world,x,y,r,alpha,motion) {
    ctx.save();ctx.translate(x,y);ctx.scale(r,r);ctx.globalAlpha=alpha;
    const glow=ctx.createRadialGradient(0,0,.2,0,0,1.82);
    glow.addColorStop(0,world.core+'b3');glow.addColorStop(.62,world.color+'66');glow.addColorStop(1,world.color+'00');
    ctx.fillStyle=glow;ctx.fillRect(-1.85,-1.85,3.7,3.7);
    ctx.rotate(motion);
    const gem=ctx.createRadialGradient(-.33,-.42,.03,.05,.09,1.06);
    gem.addColorStop(0,ivory);gem.addColorStop(.32,world.core);gem.addColorStop(.58,world.color);gem.addColorStop(1,'#442342');
    const n=6+(world.seed%3);
    ctx.beginPath();
    for(let k=0;k<n;k++){
      const a=k*circle/n,rad=.89+.1*Math.sin(k*4.3+world.seed);
      const x=Math.cos(a)*rad,y=Math.sin(a)*rad;
      if(k)ctx.lineTo(x,y);else ctx.moveTo(x,y);
    }
    ctx.closePath();ctx.fillStyle=gem;ctx.fill();ctx.strokeStyle=world.core;ctx.lineWidth=.059;ctx.stroke();
    for(let k=0;k<n;k++){
      const a=k*circle/n;
      ctx.beginPath();ctx.moveTo(.13,-.08);ctx.lineTo(Math.cos(a)*.62,Math.sin(a)*.62);
      ctx.lineTo(Math.cos(a+.22)*.88,Math.sin(a+.22)*.88);
      ctx.strokeStyle=k%2===0?'#fff1a8bd':'#793d6699';ctx.lineWidth=.04;ctx.stroke();
    }
    ctx.rotate(-.45);
    ctx.strokeStyle='#ffdda4';ctx.lineWidth=.075;ctx.beginPath();ctx.ellipse(0,0,1.22,.38,0,0,Math.PI);ctx.stroke();
    ctx.restore();
  }

  function vault(fx,world,x,y,planet,depth) {
    const r=planet.r;
    if(depth < -.05) return;
    const size=r*(.27+.035*fx.power);
    ctx.save();ctx.translate(x,y);
    ctx.scale(.68+.32*Math.max(0,depth),1);
    const opacity=smooth(fx.age/.17)*(1-smooth((fx.age-collapse)/.37));
    ctx.globalAlpha=opacity;
    const tunnel=ctx.createRadialGradient(0,0,0,0,0,size*1.16);
    tunnel.addColorStop(0,'#100a21dd');tunnel.addColorStop(.63,'#302151bc');
    tunnel.addColorStop(.81,'#63397bd0');tunnel.addColorStop(.91,gold);tunnel.addColorStop(1,'#7331b300');
    ctx.fillStyle=tunnel;ctx.fillRect(-size*1.17,-size*1.17,size*2.34,size*2.34);
    ctx.strokeStyle=ivory;ctx.lineWidth=Math.max(1,size*.057);
    const rotation=reduceMotion ? 0 : .42*smooth(fx.age/grab);
    for(let i=0;i<8;i++){
      const a=i*circle/8+rotation;
      ctx.beginPath();ctx.arc(0,0,size*.97,a+.04,a+.28);ctx.stroke();
      ctx.beginPath();ctx.moveTo(Math.cos(a)*size*.84,Math.sin(a)*size*.84);
      ctx.lineTo(Math.cos(a)*size*1.05,Math.sin(a)*size*1.05);ctx.stroke();
    }
    ctx.restore();

    // Pieces of the shell tip, fall into the evacuated chamber and vanish at depth.
    if(fx.age < buckle-.18 || fx.age>collapse+.34) return;
    const count=reduceMotion?4:8;
    for(let i=0;i<count;i++){
      const fall=smooth((fx.age-(buckle-.18)-.038*i)/.58);
      if(fall>=1)continue;
      const a=fx.bearing+i*circle/count;
      const distance=(.53+.045*Math.sin(i*2.4))*r*(1-fall);
      const sx=x+Math.cos(a)*distance,sy=y+Math.sin(a)*distance;
      if(Math.hypot(sx-planet.x,sy-planet.y)>r)continue;
      const slab=r*(.073+.009*(i%3))*(1-.78*fall);
      ctx.save();ctx.translate(sx,sy);ctx.rotate(a+.55+(reduceMotion?0:fall*1.45));
      ctx.globalAlpha=opacity*(1-fall);
      ctx.drawImage(splinterTile(world,i),-slab,-slab*.72,slab*2,slab*1.44);
      ctx.restore();
    }
  }

  function draw() {
    if(!flight||flight.phase!=='fight')return;
    const p=orbitTarget(),world=worlds[flight.index];
    for(const fx of flight.specialAttackFX){
      if(fx.kind!=='heist'||fx.index!==flight.index)continue;
      const target=world.skin.project(fx.anchor,spinAngle());
      const x=p.x+p.r*target.x,y=p.y+p.r*target.y;
      vault(fx,world,x,y,p,target.z);
      const paw=castingPaw(),out=smooth(fx.age/.40),back=smooth((fx.age-grab-.06)/.85);
      const reach=out*(1-back),dx=x-paw.x,dy=y-paw.y;
      const lift=reduceMotion?0:p.r*.16*Math.sin(Math.PI*reach);
      const hand={x:paw.x+dx*reach,y:paw.y+dy*reach-lift};
      const heading=Math.atan2(dy,dx),grip=smooth((fx.age-.39)/.20);
      const size=Math.max(8,p.r*(.14+.012*fx.power));
      const alpha=smooth(fx.age/.09)*(1-smooth((fx.age-1.43)/.35));
      ctx.save();ctx.lineCap='round';
      const cord=ctx.createLinearGradient(paw.x,paw.y,hand.x+.01,hand.y);
      cord.addColorStop(0,'#7399ff00');cord.addColorStop(.35,'#74b6ff9c');cord.addColorStop(1,'#d8f6ffc9');
      ctx.strokeStyle=cord;ctx.lineWidth=Math.max(1.1,size*.19);ctx.globalAlpha=alpha;
      ctx.beginPath();ctx.moveTo(paw.x,paw.y);ctx.quadraticCurveTo((hand.x+paw.x)*.5,(hand.y+paw.y)*.5-lift,hand.x,hand.y);ctx.stroke();ctx.restore();
      spectralPaw(hand.x,hand.y,size,heading,grip,alpha);
      if(fx.age>=grab){
        const emerge=smooth((fx.age-grab)/.23),radius=size*(.72+.16*fx.power)*emerge;
        if(radius>.1)stolenCore(world,hand.x+Math.cos(heading)*size*.74,hand.y+Math.sin(heading)*size*.74,
          radius,alpha,reduceMotion?0:fx.age*.7);
      }
    }
  }
  return {cast,update,draw};
})();
