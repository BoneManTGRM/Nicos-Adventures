'use strict';

const dragonSpell = (() => {
  const tau = Math.PI*2;
  const contact = .91, sink = .31, breach = 1.61, life = 2.57;
  const sprite = new Image();
  sprite.src = 'assets/flame-dragon.webp';
  const frames = new Map();
  const unit = v => Math.max(0, Math.min(1, v));
  const ease = v => v*v*(3-2*v);

  function onDisc(x, y) {
    return {x, y, z: Math.sqrt(Math.max(0, 1-x*x-y*y))};
  }

  function projected(point, turn) {
    const a = (spinAngle()-turn)*tau, c = Math.cos(a), s = Math.sin(a);
    return {x: point.x*c-point.z*s, y: point.y, z: point.x*s+point.z*c};
  }

  function cast(spot, power) {
    if (!flight || flight.phase !== 'fight') return;
    const paw = castingPaw();
    // Keep a small shoulder of crust at the poles so both tunnel mouths are visible.
    const latitude = clamp(spot.y, -.81, .81);
    const entry = onDisc(spot.x, latitude);
    const side = spot.x > .12 ? -1 : 1;
    const exit = onDisc(side*.87*Math.sqrt(1-latitude*latitude), latitude);
    const fx={
      kind:'dragon', index:flight.index, age:0, power, entry, exit,
      origin:{x:paw.x/W, y:paw.y/H}, turn:spinAngle(), entered:false, emerged:false
    };
    // When a claw trench is targeted, track that rotating strip during the dive.
    igniteScars(fx);fx.tracked=fx.fires.length>0;
    flight.specialAttackFX.push(fx);
    castFlash = 1; cooldown = 1.48;
    tone(150, 400, .35, 'triangle', .065);
    tone(390, 115, .45, 'sawtooth', .025);
  }

  // Fire can travel only into an existing, front-facing claw scar touched by
  // the dragon's bore. Find the exact crossing along its projected polyline.
  function igniteScars(fx) {
    fx.fires=[];
    const x0=fx.entry.x,x1=fx.exit.x,y=fx.entry.y;
    const left=Math.min(x0,x1),right=Math.max(x0,x1);
    for(const scar of flight.clawScars||[]){
      if(scar.index!==fx.index||!scar.cuts.length)continue;
      let best=null;
      for(const lane of scar.lanes){
        let a=projected(lane[0],scar.turn);
        for(let i=1;i<lane.length;i++){
          const b=projected(lane[i],scar.turn);
          if(a.z>0&&b.z>0){
            const dy=b.y-a.y;
            // Parallel traces can share any part of the chord.
            const t=Math.abs(dy)>.0001?unit((y-a.y)/dy):
              Math.abs(b.x-a.x)>.0001?unit((clamp(x0,Math.min(a.x,b.x),Math.max(a.x,b.x))-a.x)/(b.x-a.x)):0;
            const x=a.x+t*(b.x-a.x),cy=a.y+t*dy;
            const distance=Math.hypot(x-clamp(x,left,right),cy-y);
            if(distance<.063&&(!best||distance<best.distance)){
              best={distance,seed:i-1+t,along:unit((x-x0)/(x1-x0))};
            }
          }
          a=b;
        }
      }
      if(best)fx.fires.push({scar,seed:best.seed,start:contact+(breach-contact)*best.along,step:0});
    }
  }

  function burnScars(fx) {
    for(const fire of fx.fires||[]){
      const t=fx.age-fire.start;
      if(t<0)continue;
      if(!fire.step){
        if(!fx.fireAnnounced){fx.fireAnnounced=true;showNotice('DRAGONFIRE CLAWS',1.1);}
        fire.step=1;tone(530,830,.16,'sawtooth',.018);
      }
      if(t<.43||fire.step>1)continue;
      fire.step=2;
      const world=worlds[fx.index];
      for(const cut of fire.scar.cuts){
        // Heat the same solid incision the player drew, including hooked swipes.
        cut.kind='solar';cut.wall=cutProfiles.solar.wall;cut.age=0;
        world.skin.widen(cut,.011+.003*fx.power);
      }
      gainEnergy(4);applyWorldDamage(1+Math.ceil(fx.power/2));
      if(flight.phase!=='fight')return;
    }
  }

  function fireLines(fx,p) {
    for(const fire of fx.fires||[]){
      const age=fx.age-fire.start;
      if(age<0||age>1.12)continue;
      const lanes=fire.scar.lanes,count=lanes[0].length-1;
      const spread=unit(age/.52)*Math.max(fire.seed,count-fire.seed);
      const from=Math.max(0,fire.seed-spread),to=Math.min(count,fire.seed+spread);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
      ctx.globalAlpha=unit((1.12-age)/.38);
      for(const lane of lanes){
        const path=new Path2D();let started=false;
        function at(t){
          const i=Math.min(count-1,Math.floor(t)),u=t-i;
          const a=projected(lane[i],fire.scar.turn),b=projected(lane[i+1],fire.scar.turn);
          return {x:p.x+p.r*(a.x+(b.x-a.x)*u),y:p.y+p.r*(a.y+(b.y-a.y)*u),z:a.z+(b.z-a.z)*u};
        }
        const nodes=[from];
        for(let k=Math.floor(from)+1;k<to;k++)nodes.push(k);
        nodes.push(to);
        for(const t of nodes){
          const v=at(t);if(v.z<=0){started=false;continue;}
          if(started)path.lineTo(v.x,v.y);else path.moveTo(v.x,v.y);started=true;
        }
        for(const [color,width] of [['#f04d1a95',.079],['#ff9a3f',.036],['#fff6b5',.011]]){
          ctx.strokeStyle=color;ctx.lineWidth=Math.max(.65,width*p.r);ctx.stroke(path);
        }
        // Tongues of fire rise from the burning portion of each actual claw mark.
        for(let t=from+.24;t<to;t+=.84){
          const v=at(t);if(v.z<=0)continue;
          const wave=reduceMotion?.5:.5+.5*Math.sin(age*13+t*4);
          const h=p.r*(.07+.13*wave)*unit(age*9),w=p.r*.034;
          ctx.fillStyle='#ff873bc4';ctx.beginPath();ctx.moveTo(v.x-w,v.y);
          ctx.bezierCurveTo(v.x-w*1.6,v.y-h*.44,v.x+w*.65,v.y-h*.52,v.x+w*.7,v.y-h);
          ctx.quadraticCurveTo(v.x+w*2,v.y-h*.22,v.x+w,v.y);ctx.closePath();ctx.fill();
        }
        if(!reduceMotion&&age<.55){
          for(const tip of [at(from),at(to)])if(tip.z>0){
            ctx.fillStyle='#ffdf82';ctx.beginPath();ctx.arc(tip.x,tip.y,p.r*.027,0,tau);ctx.fill();
          }
        }
      }
      ctx.restore();
    }
  }

  function hit(fx, point, eruption) {
    const world = worlds[fx.index], planet = orbitTarget();
    const spot = projected(point, fx.turn);
    const depth = .45 + fx.power*.39;
    if (!eruption) {
      // The terrain engine bores along its view Z. Rotate into the chord's
      // frame: both surface mouths now share a single X and Y in this view.
      const theta = Math.atan2(fx.entry.x-fx.exit.x, fx.entry.z-fx.exit.z);
      const offset = fx.entry.x*Math.cos(theta)-fx.entry.z*Math.sin(theta);
      fx.bore = world.skin.impact('solar', offset, fx.entry.y, fx.turn+theta/tau,
                                  depth, 1-flight.hp/world.health);
    } else {
      world.skin.widen(fx.bore, .041 + fx.power*.017);
    }
    ejectCrust(world, spot, eruption ? fx.power+1 : fx.power, 'solar');
    impactArt(spot, eruption ? 'comet' : 'solar', depth);
    const x = planet.x + spot.x*planet.r, y = planet.y + spot.y*planet.r;
    const damage = fx.power + (eruption ? 2 : 1);
    spark(x, y, eruption ? '#ffae54' : '#ffd581', (reduceMotion ? 4 : 9) + fx.power, eruption ? 124 : 78);
    labels.push({x, y:y-planet.r*.12, val:'−'+damage, life:.67});
    gainEnergy(eruption ? 9 + fx.power : 6);
    hitSound(eruption ? 'gravity' : 'solar', fx.power);
    if (eruption) tone(73, 160, .39, 'sawtooth', .034);
    applyWorldDamage(damage);
  }

  function update(dt) {
    if (!flight || flight.phase !== 'fight') return;
    const list = flight.specialAttackFX;
    for (let i=list.length-1; i>=0; i--) {
      const fx = list[i];
      if (fx.kind !== 'dragon') continue;
      if (fx.index !== flight.index) { list.splice(i,1); continue; }
      fx.age += dt;
      if (!fx.entered && fx.age >= contact) {
        fx.entered = true;
        if(!fx.tracked){fx.turn=spinAngle();igniteScars(fx)}
        hit(fx, fx.entry, false);
        if (flight.phase !== 'fight') return;
      }
      if (!fx.emerged && fx.age >= breach) {
        fx.emerged = true;
        hit(fx, fx.exit, true);
        if (flight.phase !== 'fight') return;
      }
      burnScars(fx);if(flight.phase!=='fight')return;
      if (fx.age >= life) list.splice(i,1);
    }
  }

  // Bake each wingbeat pose on first use. The membrane folds toward its
  // shoulder joint, while a delayed wave travels down the free tail.
  function spriteFrame(phase) {
    if (!sprite.naturalWidth || !sprite.naturalHeight) return null;
    const count = 28, key = Math.round((phase/tau % 1 + 1)*count)%count;
    if (frames.has(key)) return frames.get(key);
    const width = 360, height = Math.round(width*sprite.naturalHeight/sprite.naturalWidth);
    const pad = Math.ceil(.16*height), canvas = document.createElement('canvas');
    canvas.width=width; canvas.height=height+2*pad;
    const brush=canvas.getContext('2d'), step=8, beat=key*tau/count;
    const sw=sprite.naturalWidth, sh=sprite.naturalHeight;
    for(let left=0;left<width;left+=step){
      const band=Math.min(step,width-left), x=(left+band/2)/width;
      const shoulder=.638*height, tailRoot=.733*height;
      const wing=ease(unit((.735-x)/.28)), tail=ease(unit((.435-x)/.37));
      const sway=tail*.115*height*Math.sin(beat-5.7*x);
      const wingTop=shoulder*(.15+.24*Math.sin(beat-.94*x))*wing;
      const sx=left/width*sw, slice=band/width*sw;
      brush.drawImage(sprite,sx,0,slice,.638*sh,left,pad+wingTop,band,shoulder-wingTop);
      brush.drawImage(sprite,sx,.638*sh,slice,.095*sh,left,pad+shoulder,band,tailRoot-shoulder+sway*.32);
      brush.drawImage(sprite,sx,.733*sh,slice,.267*sh,left,pad+tailRoot+sway*.32,band,.267*height+sway*.68);
    }
    const frame={canvas,height:canvas.height/width,noseY:(pad+height*.61)/width};
    frames.set(key,frame); return frame;
  }

  // The summon still has an articulated silhouette during the initial image load.
  function silhouette(phase) {
    const flap=.17*Math.sin(phase), whip=.055*Math.sin(phase-1);
    ctx.fillStyle='#9c3c29'; ctx.strokeStyle='#ffb44d'; ctx.lineWidth=.012;
    ctx.beginPath(); ctx.moveTo(-.48,.01); ctx.lineTo(-.63,-.20+flap);
    ctx.lineTo(-.83,-.28+flap); ctx.lineTo(-.51,-.15+flap); ctx.lineTo(-.36,-.02); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#842d26'; ctx.beginPath(); ctx.moveTo(-1,.02+whip);
    ctx.bezierCurveTo(-.73,.25,-.63,-.06,-.45,-.05);ctx.lineTo(-.31,-.065);ctx.lineTo(-.15,-.12);
    ctx.lineTo(-.18,-.22); ctx.lineTo(-.09,-.13);ctx.lineTo(-.08,-.19);ctx.lineTo(-.055,-.09);
    ctx.lineTo(0,-.045);ctx.lineTo(-.012,-.006);ctx.lineTo(-.093,.001);ctx.lineTo(-.075,.026);
    ctx.lineTo(-.01,.018);ctx.lineTo(-.05,.053);ctx.lineTo(-.17,.034);ctx.lineTo(-.30,.072);
    ctx.lineTo(-.34,.135);ctx.lineTo(-.30,.17);ctx.lineTo(-.385,.152);ctx.lineTo(-.393,.087);
    ctx.bezierCurveTo(-.65,.16,-.78,.19,-1,.02+whip);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#e47832';ctx.beginPath();ctx.moveTo(-.43,-.024);
    ctx.quadraticCurveTo(-.48,-.23+flap,-.61,-.34+flap);ctx.lineTo(-.92,-.43+flap);
    ctx.quadraticCurveTo(-.77,-.32+flap,-.80,-.19+flap);
    ctx.quadraticCurveTo(-.69,-.24+flap,-.69,-.10+flap*.65);
    ctx.quadraticCurveTo(-.56,-.18+flap*.6,-.49,-.014);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffefae';ctx.fillRect(-.094,-.079,.027,.012);
  }

  function creature(nose, angle, length, fx, alpha) {
    if (length<1 || alpha<=0) return;
    const beat=fx.age*(reduceMotion ? 4.5 : 12.8);
    ctx.save();ctx.translate(nose.x,nose.y);ctx.rotate(angle);
    ctx.scale(length,Math.cos(angle)<0 ? -length : length);ctx.globalAlpha=alpha;
    // Streaming tongues and embers follow the tail as the wings beat.
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){
      const y=.095+(i-1)*.053+Math.sin(beat+i)*.019;
      const reach=1.19+.07*i+.06*Math.sin(beat+i*2.4);
      const g=ctx.createLinearGradient(-reach,0,-.48,0);
      g.addColorStop(0,'#ff3b0b00');g.addColorStop(.47,'#fd561d82');g.addColorStop(1,'#ffd36acc');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-.48,y-.035);
      ctx.bezierCurveTo(-.80,y-.055,-.96,y+.055,-reach,y+Math.sin(beat+i)*.036);
      ctx.bezierCurveTo(-1.02,y+.05,-.72,y+.07,-.48,y+.03);ctx.closePath();ctx.fill();
    }
    // Flames grow from the wing spar and the back ridge, with a hot core
    // inside each ribbon. Offset phases keep the tongues from moving in unison.
    for(let i=0;i<(reduceMotion?5:11);i++){
      const wing=i<5, rootX=wing?-.79+i*.091:-.78+(i-5)*.108;
      const rootY=wing?-.255+(i*.032):.07-(i-5)*.018;
      const flare=.72+.28*Math.sin(beat*1.7+i*2.1), tipX=rootX-(.10+.025*(i%3))*flare;
      const tipY=rootY-(wing?.115:.09)*flare;
      const gradient=ctx.createLinearGradient(rootX,rootY,tipX,tipY);
      gradient.addColorStop(0,'#fff273');gradient.addColorStop(.46,'#ff8c21');gradient.addColorStop(1,'#ff462700');
      ctx.fillStyle=gradient;ctx.beginPath();ctx.moveTo(rootX+.025,rootY+.018);
      ctx.quadraticCurveTo(rootX-.016,rootY-.052,tipX,tipY);
      ctx.quadraticCurveTo(rootX-.054,rootY-.012,rootX-.040,rootY+.027);ctx.closePath();ctx.fill();
    }
    ctx.restore();
    const frame=spriteFrame(beat);
    if(frame){
      ctx.imageSmoothingEnabled=true;
      ctx.drawImage(frame.canvas,-.99,-frame.noseY,1,frame.height);
    }else silhouette(beat);
    const puff=fx.age<contact ? unit((fx.age-.16)/.19)*unit((contact-fx.age)/.13)
                              : unit((fx.age-breach)/.16)*unit((life-fx.age)/.28);
    if(puff>0){
      ctx.save();ctx.globalCompositeOperation='lighter';
      ctx.translate(-.024,.044);
      const tip=(.18+.045*fx.power)*puff,wave=.029*Math.sin(beat*1.7);
      for(let i=0;i<2;i++){
        const reach=tip*(i?.63:1),width=puff*(i?.022:.045);
        const plume=ctx.createLinearGradient(0,0,reach,0);
        plume.addColorStop(0,i?'#ffffc3':'#ffd349');plume.addColorStop(.64,i?'#ffdf66':'#ff6b20');plume.addColorStop(1,'#ff5c0800');
        ctx.fillStyle=plume;ctx.beginPath();ctx.moveTo(0,-.007);
        ctx.bezierCurveTo(reach*.27,-width,reach*.61,-width+wave,reach,wave*.66);
        ctx.quadraticCurveTo(reach*.79,wave+width*.75,reach*.66,wave+width*.40);
        ctx.quadraticCurveTo(reach*.27,width*1.32,0,.006);ctx.closePath();ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function screenPoint(q,p){return {x:p.x+q.x*p.r,y:p.y+q.y*p.r};}

  function planeClip(mouth, angle, inside) {
    // Clip against the local crust plane. The jaw, then torso, then tail pass
    // through it instead of shrinking the whole dragon to a point.
    const span=3*(W+H), c=Math.cos(angle), s=Math.sin(angle);
    const near=inside ? 0 : -span, far=inside ? span : 0;
    ctx.beginPath();
    ctx.moveTo(mouth.x+c*near+s*span,mouth.y+s*near-c*span);
    ctx.lineTo(mouth.x+c*far+s*span,mouth.y+s*far-c*span);
    ctx.lineTo(mouth.x+c*far-s*span,mouth.y+s*far+c*span);
    ctx.lineTo(mouth.x+c*near-s*span,mouth.y+s*near+c*span);ctx.closePath();ctx.clip();
  }

  function magma(fx, p, entry, exit) {
    const u=unit((fx.age-contact)/(breach-contact));
    if(!u || fx.age>breach+.24)return;
    const fade=unit((breach+.24-fx.age)/.24);
    const dx=exit.x-entry.x,dy=exit.y-entry.y, d=Math.hypot(dx,dy)||1;
    const nx=-dy/d,ny=dx/d;
    const crack=t=>{
      const arc=Math.sin(Math.PI*t)*p.r*.091;
      const zig=Math.sin(Math.round(t*14)*2.37)*p.r*.026*Math.sin(t*Math.PI);
      return {x:entry.x+t*dx+nx*(arc+zig),y:entry.y+t*dy+ny*(arc+zig)};
    };
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,tau);ctx.clip();
    ctx.beginPath();ctx.moveTo(entry.x,entry.y);
    for(let i=1;i/14<u;i++){const q=crack(i/14);ctx.lineTo(q.x,q.y);}
    const q=crack(u);ctx.lineTo(q.x,q.y);
    ctx.strokeStyle='#4b1821';ctx.globalAlpha=.88*fade;ctx.lineWidth=p.r*.051;ctx.stroke();
    ctx.strokeStyle='#ff771d';ctx.globalAlpha=.92*fade;ctx.lineWidth=p.r*.023;ctx.stroke();
    ctx.strokeStyle='#fff2a3';ctx.lineWidth=Math.max(.7,p.r*.007);ctx.stroke();
    const r=p.r*(.09+.025*fx.power),g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,r);
    g.addColorStop(0,'#fff2a8c9');g.addColorStop(.25,'#ffab4370');g.addColorStop(1,'#ff510800');
    ctx.fillStyle=g;ctx.fillRect(q.x-r,q.y-r,2*r,2*r);ctx.restore();
  }

  function draw() {
    if(!flight || flight.phase!=='fight')return;
    const p=orbitTarget();
    for(const fx of flight.specialAttackFX){
      if(fx.kind!=='dragon'||fx.index!==flight.index)continue;
      const entry=screenPoint((fx.entered||fx.tracked)?projected(fx.entry,fx.turn):fx.entry,p);
      const exit=screenPoint((fx.entered||fx.tracked)?projected(fx.exit,fx.turn):fx.exit,p);
      const origin={x:W*fx.origin.x,y:H*fx.origin.y};
      const dx=entry.x-origin.x,dy=entry.y-origin.y;
      const arch=reduceMotion ? p.r*.25 : p.r*.76;
      const bend={x:origin.x+.57*dx-p.r*.18,y:origin.y+.53*dy-arch};
      const aim=Math.atan2(entry.y-bend.y,entry.x-bend.x);
      const length=p.r*(.99+.15*fx.power);
      magma(fx,p,entry,exit);fireLines(fx,p);
      if(fx.age<contact){
        const t=unit(fx.age/contact),s=1-t;
        const nose={x:s*s*origin.x+2*s*t*bend.x+t*t*entry.x,y:s*s*origin.y+2*s*t*bend.y+t*t*entry.y};
        const angle=Math.atan2(s*(bend.y-origin.y)+t*(entry.y-bend.y),s*(bend.x-origin.x)+t*(entry.x-bend.x));
        creature(nose,angle,length*(.10+.90*ease(unit(t/.43))),fx,unit(t/.12));
      }else if(fx.age<contact+sink){
        const distance=length*1.55*unit((fx.age-contact)/sink);
        ctx.save();planeClip(entry,aim,false);
        creature({x:entry.x+Math.cos(aim)*distance,y:entry.y+Math.sin(aim)*distance},aim,length,fx,1);ctx.restore();
      }else if(fx.age>=breach){
        const t=unit((fx.age-breach)/(life-breach));
        // Exit in the direction of the opposite shoulder before banking above it.
        const heading=Math.atan2(-.34,fx.exit.x-fx.entry.x);
        const speed=length*(reduceMotion?1.54:2.13);
        const rise=p.r*(reduceMotion?.2:.65);
        const nose={x:exit.x+Math.cos(heading)*t*speed,
                    y:exit.y+Math.sin(heading)*t*speed-rise*t*t};
        const angle=Math.atan2(Math.sin(heading)*speed-2*rise*t,Math.cos(heading)*speed);
        ctx.save();planeClip(exit,heading,true);
        creature(nose,angle,length*(1+.17*t),fx,unit((1-t)/.31));ctx.restore();
      }
    }
  }
  return {cast,update,draw};
})();
