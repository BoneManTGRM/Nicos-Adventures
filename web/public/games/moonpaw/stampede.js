'use strict';

const stampedeSpell = (() => {
  const circle = 2 * Math.PI;
  const firstBeat = .76, interval = .42, finalBeat = firstBeat + interval * 8 + .23;
  const life = finalBeat + .83;
  const inks = ['#82eeff','#b7a0ff','#89edcf','#ffa5db','#9bd6ff','#ffd291','#83efe5','#b3a6ff','#ffe7a6'];
  const notes = [330,392,440,494,392,494,587,659,784];
  const beatTime = i => i === 8 ? finalBeat : firstBeat + interval * i;
  const unit = t => Math.max(0,Math.min(1,t));

  function active() {
    if (!flight || flight.phase !== 'fight') return null;
    return flight.specialAttackFX.find(fx => fx.kind === 'stampede' && fx.index === flight.index);
  }

  function cast(spot,power) {
    if (!flight || flight.phase !== 'fight' || active()) return;
    const paw = castingPaw();
    flight.specialAttackFX.push({kind:'stampede',index:flight.index,age:0,landed:0,power,
      origin:{x:paw.x/W,y:paw.y/H},spot,turn:spinAngle(),beats:Array(9).fill(false),
      cut:null,vented:false,lastTap:-1,bonus:0});
    cooldown = .72;
    castFlash = 1;
    tone(196,330,.25,'triangle',.05);
  }

  function tryBeat() {
    if (mode !== 'play' || selectedSpell !== 'stampede') return false;
    const fx = active();
    if (!fx) return false;
    // Each fresh press can match one beat, with a short grace period after impact.
    let closest = 0;
    for (let i = 1; i < 9; i++) {
      if (Math.abs(fx.age-beatTime(i)) < Math.abs(fx.age-beatTime(closest))) closest=i;
    }
    if (fx.vented || fx.beats[closest] || Math.abs(fx.age-beatTime(closest))>.155) return true;
    fx.beats[closest]=true;fx.bonus++;fx.lastTap=fx.age;
    tone(notes[closest]*1.5,notes[closest]*2,.10,'sine',.045);
    return true;
  }

  function project(x,y,turn) {
    const angle = (spinAngle()-turn)*circle, z=Math.sqrt(Math.max(0,1-x*x-y*y));
    return {x:x*Math.cos(angle)-z*Math.sin(angle),y,z:x*Math.sin(angle)+z*Math.cos(angle)};
  }

  function landing(fx) {
    const q = project(fx.spot.x,fx.spot.y,fx.turn);
    if (!fx.cut || q.z>=0) return q;
    const c=fx.cut, a=spinAngle()*circle;
    const x=c.ex*Math.cos(a)-c.ez*Math.sin(a), z=c.ex*Math.sin(a)+c.ez*Math.cos(a);
    return z>q.z ? {x,y:c.y,z} : q;
  }

  function land(fx,i) {
    const world=worlds[fx.index], final=i===8;
    if (!fx.cut) {
      fx.cut=world.skin.impact('nova',fx.spot.x,fx.spot.y,fx.turn,.52+fx.power*.13,1-flight.hp/world.health);
    } else {
      const grow=final ? .057+fx.power*.014 : .011+fx.power*.002;
      world.skin.widen(fx.cut,grow);
    }
    const target=landing(fx), p=orbitTarget();
    if (target.z>=0) {
      if (final || i%3===0) ejectCrust(world,target,final ? fx.power : 1,'nova');
      spark(p.x+p.r*target.x,p.y+p.r*target.y,inks[i],reduceMotion ? 3 : final ? 18 : 7,final ? 115 : 58);
    }
    tone(notes[i],notes[i]*.65,final ? .30 : .095,'triangle',final ? .074 : .034);
    gainEnergy(final ? 5 : 1);
    // Resolve the ninth hit after its timing window, including a lethal finisher.
    if(!final)applyWorldDamage(1);
  }

  function burstExit(fx) {
    const world=worlds[fx.index], p=orbitTarget(),entry=landing(fx);
    // The ninth cat exits on a different visible flank. Better timing drives a
    // larger pair of holes, even when the last on-beat tap fell just after impact.
    const a=Math.hypot(entry.x,entry.y)>.13 ? Math.atan2(-entry.y,-entry.x) : -.72;
    const x=.76*Math.cos(a),y=.76*Math.sin(a);
    const quality=fx.bonus/9;
    fx.exit={x,y,turn:spinAngle()};
    if(fx.beats[8]){
      flight.coreRide={age:0,fromX:(p.x+x*p.r)/W,fromY:(p.y+y*p.r)/H,r:p.r,side:x>=0?1:-1,
        color:world.color,core:world.core};
      showNotice('MOONPAW RIDES THE CORE!',1.2);
    }
    if (quality>0) world.skin.widen(fx.cut,quality*.13);
    world.skin.impact('solar',x,y,fx.exit.turn,.53+fx.power*.17+quality*1.4,1-flight.hp/world.health);
    ejectCrust(world,fx.exit,fx.power,'solar');
    spark(p.x+p.r*x,p.y+p.r*y,'#fff5bd',reduceMotion ? 5 : 14,92);
    if (fx.bonus) {
      labels.push({x:p.x+p.r*x,y:p.y+p.r*y,val:'ON BEAT '+fx.bonus+'/9',life:.85});
      gainEnergy(fx.bonus);
    }
    hitSound('gravity',fx.power);
    applyWorldDamage(2+fx.power+Math.floor(fx.bonus/2));
  }

  function update(dt) {
    if (!flight) return;
    const effects=flight.specialAttackFX;
    for (let i=effects.length-1;i>=0;i--) {
      const fx=effects[i];
      if (fx.kind!=='stampede') continue;
      if (fx.index!==flight.index || flight.phase!=='fight') {effects.splice(i,1);continue;}
      fx.age+=dt;
      while (fx.landed<9 && fx.age>=beatTime(fx.landed)) {
        land(fx,fx.landed++);
        if (flight.phase!=='fight') return;
      }
      if (!fx.vented && fx.age>=finalBeat+.18) {
        fx.vented=true;burstExit(fx);
        if (flight.phase!=='fight') return;
      }
      if (fx.age>life) effects.splice(i,1);
    }
  }

  // Local coordinates point right, with the stride driven by shoulder, hip and ankle.
  function ghost(x,y,size,heading,phase,ink,opacity,champion) {
    const left=Math.cos(heading)<0;
    ctx.save();ctx.translate(x,y);ctx.rotate(left ? heading+Math.PI : heading);ctx.scale(left ? -size : size,size);
    ctx.globalAlpha=opacity;ctx.lineJoin='round';ctx.lineCap='round';
    const gallop=Math.sin(phase), tilt=champion ? -.075 : .035*gallop;
    ctx.rotate(tilt);
    function legs(front,far) {
      const swing=gallop*(far?-1:1)*(front?1:-1), hip=front?.30:-.48;
      const knee=hip+.17+swing*.31, toe=hip+.16+swing*.58;
      ctx.strokeStyle=far?'#505086':ink;
      ctx.lineWidth=far?.105:.125;
      ctx.beginPath();ctx.moveTo(hip,.08);ctx.quadraticCurveTo(hip+.06,.26,knee,.29);
      ctx.quadraticCurveTo(knee-.10,.35,toe,.39+.075*swing);ctx.lineTo(toe+.11,.39+.075*swing);ctx.stroke();
    }
    legs(false,true);legs(true,true);
    const fur=ctx.createLinearGradient(0,-.43,.08,.28);
    fur.addColorStop(0,'#f4fbff');fur.addColorStop(.36,ink);fur.addColorStop(1,'#434b82');
    ctx.strokeStyle=ink;ctx.lineWidth=.125;
    ctx.beginPath();ctx.moveTo(-.49,.0);ctx.bezierCurveTo(-.95,.10,-1.14,-.52,-1.40,-.31+.14*gallop);
    ctx.quadraticCurveTo(-1.6,-.18+.18*gallop,-1.53,-.44+.16*gallop);ctx.stroke();
    ctx.fillStyle=fur;ctx.beginPath();ctx.ellipse(-.11,.014,.58,.21,-.06,0,circle);ctx.fill();
    legs(false,false);legs(true,false);
    ctx.beginPath();ctx.moveTo(.24,.10);ctx.quadraticCurveTo(.14,-.20,.34,-.32);
    ctx.lineTo(.33,-.56);ctx.lineTo(.51,-.43);ctx.lineTo(.66,-.46);ctx.lineTo(.83,-.60);
    ctx.lineTo(.82,-.33);ctx.quadraticCurveTo(.83,-.25,.97,-.19);
    ctx.quadraticCurveTo(.97,-.09,.78,-.07);ctx.lineTo(.62,.05);ctx.lineTo(.44,.12);
    ctx.closePath();ctx.fillStyle=fur;ctx.fill();
    ctx.fillStyle='#242540';ctx.beginPath();ctx.ellipse(.76,-.28,.065,.04,-.22,0,circle);ctx.fill();
    ctx.strokeStyle=champion?'#ffe2a1':'#eef9ff';ctx.lineWidth=.035;
    ctx.beginPath();ctx.moveTo(.60,-.02);ctx.lineTo(.37,.08);ctx.moveTo(.85,-.13);ctx.lineTo(1.04,-.10);ctx.stroke();
    ctx.restore();
  }

  function beatMarker(fx) {
    const width=Math.min(142,W*.39),x=Math.max(5,Math.min(W-width-5,W*.48-width/2));
    const y=Math.max(4,Math.min(H-37,H*.20));
    const previous=fx.landed-1;
    const next=previous>=0 && !fx.beats[previous] && fx.age-beatTime(previous)<.155 ? previous : Math.min(8,fx.landed);
    const gap=beatTime(next)-fx.age;
    const ready=!fx.beats[next] && Math.abs(gap)<.155;
    const praise=fx.lastTap>=0 && fx.age-fx.lastTap<.18;
    const opacity=1-unit((fx.age-finalBeat-.24)/.48);
    const step=(width-18)/9;
    ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle='#101729dd';
    ctx.fillRect(x,y,width,30);
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 11px system-ui,sans-serif';
    ctx.fillStyle=praise?'#fff0ab':ready?'#c2ffdc':'#e3f5ff';
    ctx.fillText(praise?'On beat!':fx.landed<9?'Tap on beat':'Nine lives!',x+width/2,y+9);
    for(let i=0;i<9;i++){
      const px=x+9+step*(i+.5),py=y+21;
      ctx.fillStyle=fx.beats[i]?'#ffdf7c':i<fx.landed?'#8cbbd2':'#344158';
      ctx.beginPath();ctx.arc(px,py,3.1,0,circle);ctx.fill();
      if(i===next && fx.landed<9){
        ctx.strokeStyle=ready?'#fff5cb':'#c1e8ff';ctx.lineWidth=1.2;
        ctx.beginPath();ctx.arc(px,py,3.8+3*unit(gap/interval),0,circle);ctx.stroke();
      }
    }
    ctx.restore();
  }

  function riderOpacity(){
    const ride=flight?.coreRide;
    if(!ride)return 1;
    return 1-unit(ride.age/.13)*(1-unit((ride.age-1.03)/.24));
  }
  function advanceRide(dt){
    if(!flight.coreRide)return;
    flight.coreRide.age+=dt;
    if(flight.coreRide.age>=1.28)flight.coreRide=null;
  }
  function drawRide(){
    const ride=flight?.coreRide;
    if(!ride)return;
    const t=unit(ride.age/1.28),travel=t*t*(3-2*t);
    const leap=Math.sin(Math.PI*t),size=ride.r*(.15+.045*leap);
    const x=clamp(ride.fromX*W*(1-travel)+player.x*travel+ride.side*leap*ride.r*.33,size,W-size);
    const y=clamp(ride.fromY*H*(1-travel)+player.y*travel-leap*ride.r*(reduceMotion?.25:.85),size*2.5,H-size);
    ctx.save();ctx.globalAlpha=1-riderOpacity();ctx.translate(x,y);
    const shell=ctx.createRadialGradient(-size*.4,-size*.45,0,0,0,size);
    shell.addColorStop(0,'#fffce0');shell.addColorStop(.32,ride.core);shell.addColorStop(.74,ride.color);shell.addColorStop(1,'#412843');
    ctx.fillStyle=shell;ctx.beginPath();ctx.arc(0,0,size,0,circle);ctx.fill();
    ctx.save();ctx.clip();ctx.rotate(t*2.2);ctx.strokeStyle='#fff3b9';ctx.lineWidth=Math.max(1,size*.1);
    for(let i=-1;i<2;i++){ctx.beginPath();ctx.ellipse(0,i*size*.62,size*1.04,size*.32,-.36,0,Math.PI);ctx.stroke()}
    ctx.restore();
    const image=cat.classList.contains('gpu')?$('catCanvas'):$('catImage');
    const w=size*3.1;
    ctx.rotate(-.10*leap);ctx.drawImage(image,-w*.50,-w*.61-size*.43,w,w*502/768);ctx.restore();
  }

  function draw() {
    const fx=active();
    if (!fx) return;
    const p=orbitTarget(), q=landing(fx), end={x:p.x+q.x*p.r,y:p.y+q.y*p.r};
    const start={x:fx.origin.x*W,y:fx.origin.y*H},dx=end.x-start.x,dy=end.y-start.y;
    for(let i=0;i<9;i++){
      const final=i===8, duration=final?.76:.64, t=1+(fx.age-beatTime(i))/duration;
      if(t<0&&!final){
        const pending=i-fx.landed;
        const size=Math.max(6,p.r*.095);
        const x=clamp(player.x-player.w*.28-pending*size*.62,size,W-size);
        const y=player.y+size*(pending-3)*.62;
        ghost(x,y,size,0,reduceMotion?i:fx.age*5+i,inks[i],unit(fx.age*5)*.67,false);
      }
      if(t<0 || t>1.11) continue;
      const travel=unit(t), bow=(reduceMotion?.07:.20+(i%3)*.095)*p.r*(i%2?-1:1);
      const x=start.x+dx*travel, y=start.y+dy*travel+bow*Math.sin(Math.PI*travel);
      const angle=Math.atan2(dy+bow*Math.PI*Math.cos(Math.PI*travel),dx||.001);
      const size=Math.max(9,p.r*(final?.26:.16)),fade=unit(t*8)*unit((1.11-t)/.11);
      if(!reduceMotion){
        const tail=Math.max(0,travel-.15);
        ctx.save();ctx.globalAlpha=fade*.60;ctx.strokeStyle=inks[i];ctx.lineCap='round';
        ctx.lineWidth=Math.max(1,size*.095);ctx.beginPath();ctx.moveTo(start.x+dx*tail,start.y+dy*tail+bow*Math.sin(Math.PI*tail));ctx.lineTo(x,y);ctx.stroke();ctx.restore();
      }
      ghost(x,y,size,angle,reduceMotion?i*.77:t*14+i,inks[i],fade,final);
    }
    const last=fx.landed-1;
    if(last>=0){
      const t=unit((fx.age-beatTime(last))/.38);
      if(t<1){ctx.save();ctx.globalAlpha=(1-t)*.77;ctx.lineWidth=Math.max(1,p.r*.021);
        ctx.strokeStyle=inks[last];ctx.beginPath();
        const r=p.r*(.12+.13*t+(last===8?.12:0));
        ctx.ellipse(end.x,end.y,r,r*.73,-.3,0,circle);ctx.stroke();ctx.restore();}
    }
    if(fx.exit){
      const age=unit((fx.age-finalBeat-.18)/.55), vent=project(fx.exit.x,fx.exit.y,fx.exit.turn);
      if(vent.z>0 && age<1){
        const x=p.x+vent.x*p.r,y=p.y+vent.y*p.r, r=p.r*(.06+.30*age);
        ctx.save();ctx.globalAlpha=1-age;ctx.lineWidth=Math.max(1,p.r*.035*(1-age));
        ctx.strokeStyle='#ffe39a';ctx.beginPath();ctx.ellipse(x,y,r,r*.64,Math.atan2(vent.y,vent.x),0,circle);ctx.stroke();ctx.restore();
      }
    }
    beatMarker(fx);
  }
  return {cast,draw,update,tryBeat,advanceRide,drawRide,riderOpacity};
})();
