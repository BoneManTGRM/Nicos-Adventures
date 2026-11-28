'use strict';

const potionSpell = (() => {
  const tau=Math.PI*2,arrival=.38;
  const palettes={
    glass:{edge:'#ffc7e7',light:'#fff7ef',fill:'#f38ac7',name:'CANDY GLASS'},
    inflate:{edge:'#ffc67b',light:'#fff4bd',fill:'#ff924f',name:'BALLOON BREW'},
    melt:{edge:'#aaffb3',light:'#e1ffdf',fill:'#53e6a6',name:'ORBITAL GOO'}
  };
  const deadlines={glass:3.15,inflate:1.43,melt:4.05};
  const sat=n=>Math.max(0,Math.min(1,n));
  const ease=n=>{n=sat(n);return n*n*(3-2*n)};
  const bags=new WeakMap();
  function nextFormula(){
    let bag=bags.get(flight);
    if(!bag?.length){
      bag=Object.keys(palettes);
      for(let i=bag.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];
      }
      bags.set(flight,bag);
    }
    return bag.pop();
  }
  function cast(spot,power){
    if(!flight||flight.phase!=='fight')return;
    // Finish a previous transmutation before applying the next. Its outgoing
    // particles may coexist with the incoming bottle; only one deforms the disc.
    for(const fx of flight.specialAttackFX)if(fx.kind==='potion'&&fx.release===null)fx.finish=true;
    const paw=castingPaw();
    flight.specialAttackFX.push({kind:'potion',formula:nextFormula(),index:flight.index,
      origin:{x:paw.x/W,y:paw.y/H},spot:clipToDisc(spot.x,spot.y),power,turn:spinAngle(),
      age:0,applied:false,release:null,finish:false,pendingHit:false,
      wobble:0,wobbleCount:0,seed:flight.scars*2.399+flight.index});
    cooldown=.66;castFlash=1;tone(510,1040,.20,'sine',.04);
  }
  function active(){
    if(!flight||flight.phase!=='fight')return null;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const fx=list[i];
      if(fx.kind==='potion'&&fx.index===flight.index&&fx.applied&&
         (fx.release===null||fx.age-fx.release<.46))return fx;
    }
    return null;
  }
  function onHit(spot,kind){
    if(kind==='potion')return;
    const fx=active();
    if(!fx||fx.release!==null||!['melt','glass'].includes(fx.formula))return;
    fx.pendingHit=true;
    fx.hitSpot=clipToDisc(spot.x,spot.y);
  }
  function stamp(fx,q,kind,size){
    const world=worlds[flight.index];
    world.skin.impact(kind,q.x,q.y,spinAngle(),size,1-flight.hp/world.health);
    ejectCrust(world,q,1,kind);
  }
  function glassPoint(fx,i){
    if(i===0)return fx.hitSpot||fx.spot;
    const a=fx.seed+i*tau/3;
    return clipToDisc(fx.spot.x*.5+.56*Math.cos(a),fx.spot.y*.5+.56*Math.sin(a));
  }
  function finish(fx){
    fx.release=fx.age;
    const p=orbitTarget(),formula=fx.formula,color=palettes[formula].edge;
    if(formula==='glass'){
      for(let j=0;j<3;j++){
        const q=glassPoint(fx,j);
        stamp(fx,q,'cryo',.48+fx.power*.17);
        spark(p.x+p.r*q.x,p.y+p.r*q.y,color,reduceMotion?3:7,65);
      }
      tone(1290,640,.13,'triangle',.055);tone(1740,790,.18,'sine',.037);
    }else if(formula==='inflate'){
      for(let i=0;i<3;i++){
        const a=fx.seed+i*tau/3,q={x:Math.cos(a)*.72,y:Math.sin(a)*.72};
        stamp(fx,q,'nova',.52+fx.power*.16);
      }
      spark(p.x,p.y,'#ffe6b3',reduceMotion?6:19,122);
      tone(385,50,.18,'triangle',.105);tone(1450,210,.11,'sine',.025);
    }else{
      stamp(fx,fx.spot,'gravity',.63+fx.power*.24);
      spark(p.x,p.y,color,reduceMotion?4:10,55);
      tone(280,670,.21,'sine',.053);
    }
    gainEnergy(formula==='melt'?6:10);
    applyWorldDamage(formula==='melt'?fx.power+1:fx.power+2);
  }
  function update(dt){
    if(!flight)return;
    const list=flight.specialAttackFX;
    for(let i=list.length-1;i>=0;i--){
      const fx=list[i];
      if(fx?.kind!=='potion')continue;
      if(fx.index!==flight.index||flight.phase!=='fight'){list.splice(i,1);continue}
      fx.age+=dt;fx.wobble=Math.max(0,fx.wobble-dt);
      if(!fx.applied&&fx.age>=arrival){
        fx.applied=true;const p=orbitTarget(),color=palettes[fx.formula];
        spark(p.x+fx.spot.x*p.r,p.y+fx.spot.y*p.r,color.edge,reduceMotion?3:9,55);
        labels.push({x:p.x,y:p.y-p.r*.75,val:color.name,life:.91});
        gainEnergy(4);
        const hum={glass:1340,inflate:540,melt:330}[fx.formula];
        tone(720,hum,.22,'sine',.045);
      }
      if(!fx.applied)continue;
      if(fx.pendingHit&&fx.release===null){
        fx.pendingHit=false;
        if(fx.formula==='glass')fx.finish=true;
        if(fx.formula==='melt'){
          fx.wobble=.86;fx.wobbleCount++;
          const p=orbitTarget(),q=fx.hitSpot;
          spark(p.x+q.x*p.r,p.y+q.y*p.r,'#cbffba',reduceMotion?3:9,58);
          tone(170,510,.19,'sine',.05);gainEnergy(3);
          applyWorldDamage(1);
          if(flight.phase!=='fight')return;
        }
      }
      if(fx.release===null&&(fx.finish||fx.age-arrival>=deadlines[fx.formula])){
        finish(fx);if(flight.phase!=='fight')return;
      }
      if(fx.release!==null&&fx.age-fx.release>=.68)list.splice(i,1);
    }
  }
  function shape(fx){
    const t=fx.age-arrival,after=fx.release===null?0:fx.age-fx.release;
    if(fx.formula==='inflate'){
      const stretch=ease(t/deadlines.inflate),pulse=reduceMotion?0:Math.sin(t*15)*.011*stretch;
      const inflated=1+stretch*(reduceMotion?.19:.36);
      if(fx.release===null)return {x:inflated+pulse,y:inflated-pulse,drop:0};
      const recoil=(reduceMotion?.09:.20)*Math.sin(Math.PI*sat(after/.46))*(1-sat(after/.46));
      return {x:1+recoil*.4,y:1-recoil,drop:recoil*.24};
    }
    if(fx.formula==='melt'){
      const amount=ease(t/.70)*(fx.release===null?1:1-ease(after/.46));
      const jiggle=(reduceMotion?.016:.067)*Math.sin(fx.wobble*27)*sat(fx.wobble/.70)*amount;
      return {x:1-.59*amount+jiggle,y:1-.72*amount-jiggle,drop:amount*.18};
    }
    return {x:1,y:1,drop:0};
  }
  // Called in planet-local coordinates, directly around drawing the textured disc.
  function deformDisc(){
    const fx=active();if(!fx||fx.formula==='glass')return;
    const s=shape(fx);ctx.translate(0,s.drop);ctx.scale(s.x,s.y);
  }
  function flask(x,y,size,rotation,fx){
    const color=palettes[fx.formula];
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(size,size);
    ctx.lineWidth=.10;ctx.strokeStyle='#e8f5ff';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(-.17,-.82);ctx.lineTo(.19,-.82);ctx.lineTo(.19,-.31);
    ctx.bezierCurveTo(.23,-.17,.68,.01,.59,.45);ctx.bezierCurveTo(.52,.88,-.50,.88,-.59,.45);
    ctx.bezierCurveTo(-.69,.02,-.22,-.18,-.17,-.32);ctx.closePath();
    ctx.fillStyle='#516a89';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-.48,.17);ctx.quadraticCurveTo(-.16,.31,.03,.17);ctx.quadraticCurveTo(.30,.03,.49,.17);
    ctx.bezierCurveTo(.69,.76,-.62,.85,-.48,.17);ctx.fillStyle=color.fill;ctx.fill();
    ctx.strokeStyle=color.light;ctx.lineWidth=.09;ctx.beginPath();ctx.moveTo(-.36,.20);ctx.lineTo(-.42,.37);ctx.stroke();
    ctx.fillStyle='#efb684';ctx.fillRect(-.19,-.98,.37,.20);ctx.restore();
  }
  function glass(fx,r,p){
    const t=fx.age-arrival,after=fx.release===null?0:fx.age-fx.release,finish=fx.release!==null;
    const alpha=finish?1-sat(after/.60):ease(t/.27);
    if(alpha<=0)return;
    const light=['#ffb7df','#cfc2ff','#ffc7b5','#a8e4ff','#ffdbf1','#edacdd'];
    const rotation=(reduceMotion?0:spinAngle()-fx.turn)*tau*.55+fx.seed;
    const focus={x:fx.spot.x*.56,y:fx.spot.y*.56};
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(r,r);
    for(let i=0;i<12;i++){
      const a=rotation+i*tau/12,b=rotation+(i+1)*tau/12;
      const va=[Math.cos(a),Math.sin(a)],vb=[Math.cos(b),Math.sin(b)],m=(a+b)/2;
      const inner=.42+.11*Math.sin(i*3.4+fx.seed);
      const vx=focus.x*.42+Math.cos(a+.17)*inner,vy=focus.y*.42+Math.sin(a+.17)*inner;
      const next=.42+.11*Math.sin((i+1)*3.4+fx.seed);
      const wx=focus.x*.42+Math.cos(b+.17)*next,wy=focus.y*.42+Math.sin(b+.17)*next;
      const gap=finish?(reduceMotion?.17:.56)*Math.sin(Math.min(1,after/.65)*Math.PI/2):0;
      ctx.save();ctx.translate(Math.cos(m)*gap,Math.sin(m)*gap+gap*gap*.35);ctx.rotate(finish?gap*Math.sin(i)*.35:0);
      ctx.globalAlpha=alpha*(finish?.86:.30);
      ctx.beginPath();ctx.moveTo(vx,vy);ctx.lineTo(va[0],va[1]);
      if(finish)ctx.lineTo(vb[0],vb[1]);else ctx.arc(0,0,1,a,b);
      ctx.lineTo(wx,wy);ctx.closePath();ctx.fillStyle=light[i%light.length];ctx.fill();
      ctx.globalAlpha=alpha*.78;ctx.strokeStyle=palettes.glass.light;ctx.lineWidth=.012;ctx.stroke();
      if(!finish){
        ctx.globalAlpha=alpha*.14;ctx.beginPath();
        ctx.moveTo(focus.x,focus.y);ctx.lineTo(vx,vy);ctx.lineTo(wx,wy);ctx.closePath();ctx.fill();
        const growth=sat((t-.55-(i%4)*.30)/1.04);
        if(growth>0){
          const middle={x:vx*.48+focus.x*.52+.07*Math.sin(i),y:vy*.48+focus.y*.52-.035};
          ctx.globalAlpha=.86*alpha;ctx.strokeStyle='#6f4774';ctx.lineWidth=.019;
          ctx.beginPath();ctx.moveTo(vx,vy);
          ctx.lineTo(vx+(middle.x-vx)*Math.min(growth*2,1),vy+(middle.y-vy)*Math.min(growth*2,1));
          if(growth>.5)ctx.lineTo(middle.x+(focus.x-middle.x)*(growth*2-1),middle.y+(focus.y-middle.y)*(growth*2-1));
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    if(!finish){
      ctx.globalAlpha=alpha*.85;ctx.strokeStyle='#fff5fb';ctx.lineWidth=.035;
      ctx.beginPath();ctx.arc(-.01,-.01,.92,3.56,4.26);ctx.stroke();
    }
    ctx.restore();
  }
  function balloon(fx,r,p){
    const s=shape(fx),t=fx.age-arrival,after=fx.release===null?0:fx.age-fx.release;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(r,r);
    if(fx.release===null){
      ctx.scale(s.x,s.y);ctx.globalAlpha=ease(t/.45);const g=ctx.createLinearGradient(-.6,-.9,.55,.95);
      g.addColorStop(0,'#fff4b349');g.addColorStop(.58,'#ffd1921c');g.addColorStop(1,'#f25c486a');
      ctx.fillStyle=g;ctx.strokeStyle='#ffefc798';ctx.lineWidth=.013;
      ctx.beginPath();ctx.arc(0,0,.994,0,tau);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#fff6d7bf';ctx.lineWidth=.045;ctx.lineCap='round';
      ctx.beginPath();ctx.ellipse(-.36,-.39,.37,.28,-.55,Math.PI,Math.PI*1.65);ctx.stroke();
      // Stretch lines bloom toward the rim as pressure builds.
      const pressure=ease((t-.28)/1.08);ctx.lineWidth=.016;
      for(let j=0;j<7;j++){
        const a=fx.seed+j*tau/7;ctx.strokeStyle='#ffd3a0aa';ctx.beginPath();
        ctx.arc(0,0,.95-.035*(j%2),a,a+.22*pressure);ctx.stroke();
      }
    }else{
      const u=sat(after/.61),count=reduceMotion?9:17;
      ctx.globalAlpha=1-u;ctx.lineCap='round';
      for(let i=0;i<count;i++){
        const a=i*tau/count+fx.seed,x=Math.cos(a),y=Math.sin(a),d=1.04+u*(reduceMotion?.21:.63);
        ctx.lineWidth=.025*(1-u*.4);ctx.strokeStyle=i%2?'#ffc088':'#fff0c4';ctx.beginPath();
        ctx.moveTo(x*d,y*d);ctx.lineTo(x*(d+.13*(1-u)),y*(d+.13*(1-u)));ctx.stroke();
      }
    }
    ctx.restore();
  }
  function goo(fx,r,p){
    const t=fx.age-arrival,after=fx.release===null?0:fx.age-fx.release;
    const split=ease(t/.73)*(fx.release===null?1:1-ease(after/.53));if(split<=.004)return;
    const count=4+fx.power,world=worlds[flight.index],frame=world.skin.frame(spinAngle());
    const radius=reduceMotion?.88:1.03,rate=reduceMotion?.30:.88;
    const parts=[];
    for(let i=0;i<count;i++){
      const a=fx.seed+i*tau/count+t*rate*(i%2?.84:1);
      const kick=sat(fx.wobble/.72),ring=radius+(reduceMotion?.04:.16)*kick*Math.sin(fx.wobble*18+i*.83);
      const x=Math.cos(a)*ring*(.89+.12*Math.sin(i*2.4)),depth=Math.sin(a);
      const y=depth*(.50+.09*(i%3))-.21*x;
      parts.push({i,x,y,depth});
    }
    parts.sort((a,b)=>a.depth-b.depth);
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(r,r);
    for(const part of parts){
      const {x,y,i,depth}=part;
      const size=(.25+.064*((i+1)%3)+depth*.031)*split;
      const w=(reduceMotion?.035:.10)*Math.sin(t*5.8+i)+sat(fx.wobble/.60)*(reduceMotion?.06:.22)*Math.sin(fx.wobble*23+i*.72);
      ctx.save();ctx.translate(x*split,y*split+.16*(1-split));ctx.scale(size*(1+w),size*(1-w));
      ctx.rotate(.13*Math.sin(i+t));
      ctx.beginPath();ctx.moveTo(0,-.90);ctx.bezierCurveTo(.57,-1.04,1.08,-.37,.97,.21);
      ctx.bezierCurveTo(.84,.89,.26,1.03,-.26,.93);ctx.bezierCurveTo(-.93,.78,-1.12,.22,-.97,-.27);
      ctx.bezierCurveTo(-.87,-.61,-.47,-.81,0,-.90);ctx.closePath();
      ctx.fillStyle='#218b73';ctx.fill();ctx.strokeStyle='#b2f7af';ctx.lineWidth=.063;ctx.stroke();
      ctx.clip();
      if(frame){
        const crop=frame.width*.42,ox=(.14+.27*(1+Math.sin(i*2.1))*.5)*frame.width,oy=(.12+.36*(1+Math.cos(i*2.2))*.5)*frame.height;
        ctx.globalAlpha=.65;ctx.drawImage(frame,ox,oy,crop,crop,-1,-1,2,2);ctx.globalAlpha=1;
      }
      const glaze=ctx.createLinearGradient(-.5,-.9,.73,1);
      glaze.addColorStop(0,'#d3ffb4aa');glaze.addColorStop(.5,'#65f5a638');glaze.addColorStop(1,'#1e8269bf');
      ctx.fillStyle=glaze;ctx.fillRect(-1.1,-1.1,2.2,2.2);
      ctx.fillStyle='#efffdbd2';ctx.beginPath();ctx.ellipse(-.36,-.47,.24,.11,-.56,0,tau);ctx.fill();ctx.restore();
    }
    ctx.restore();
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    const p=orbitTarget();
    for(const fx of flight.specialAttackFX){
      if(fx.kind!=='potion'||fx.index!==flight.index)continue;
      if(!fx.applied){
        const t=sat(fx.age/arrival),x0=fx.origin.x*W,y0=fx.origin.y*H;
        const x=x0+(p.x+p.r*fx.spot.x-x0)*t;
        const y=y0+(p.y+p.r*fx.spot.y-y0)*t-Math.sin(t*Math.PI)*p.r*(reduceMotion?.12:.56);
        flask(x,y,Math.max(8,p.r*.15),reduceMotion?-.25:-.65+t*3.1,fx);
      }else if(fx.formula==='glass')glass(fx,p.r,p);
      else if(fx.formula==='inflate')balloon(fx,p.r,p);
      else goo(fx,p.r,p);
    }
  }
  return {cast,update,draw,onHit,deformDisc};
})();
