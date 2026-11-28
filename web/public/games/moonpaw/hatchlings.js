'use strict';

const hatchlings=(()=>{
  const tau=Math.PI*2,storeKey='hatchlings';
  const species={
    Glacielle:{name:'Nix',type:'frost fox',ink:'#354878',coat:'#a7cdff',shade:'#8298da',pale:'#f0fbff',accent:'#87e7fc'},
    Viridia:{name:'Pip',type:'leaf dragon',ink:'#245c55',coat:'#a3de82',shade:'#55af8b',pale:'#fff3ad',accent:'#bbe476'},
    Pelagia:{name:'Ripple',type:'star axolotl',ink:'#5c4878',coat:'#e2b0ee',shade:'#ba83c7',pale:'#fff0df',accent:'#ffabb9'}
  };
  const cap=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const ease=t=>{t=cap(t,0,1);return t*t*(3-2*t)};
  let record=null,egg=null,ui=null,followers=[],lastSchool=-2;

  function savedWorlds(){
    try{
      const arr=JSON.parse(read(storeKey,'[]'));
      return Array.isArray(arr)?arr.filter(n=>Object.hasOwn(species,n)):[];
    }catch{return []}
  }
  function collection(){return record??=new Set(savedWorlds())}
  function remember(world){
    const book=collection();
    for(const key of savedWorlds())book.add(key);
    book.add(world);save(storeKey,JSON.stringify([...book]));
  }
  function rescuedNames(){return [...collection()].map(w=>species[w].name)}
  function valid(){
    return !!(egg&&flight&&egg.trip===flight&&egg.index===flight.index&&flight.phase==='fight');
  }
  function chipping(){return valid()&&egg.phase==='open'}
  function controls(){
    if(ui)return ui;
    const host=document.getElementById('screen');
    const chip=document.createElement('button'),back=document.createElement('button'),status=document.createElement('span');
    chip.id='hatchChip';chip.type='button';chip.hidden=true;
    chip.style.cssText='position:absolute;z-index:5;min-width:44px;min-height:44px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:transparent;padding:0;cursor:pointer;touch-action:manipulation;outline-offset:1px';
    back.id='hatchSchool';back.type='button';back.textContent='Return to school';back.hidden=true;
    back.style.cssText='position:absolute;z-index:5;left:10px;bottom:45px;min-height:44px;max-width:calc(100% - 20px);padding:5px 12px;border:1px solid #9af5d8;border-radius:7px;background:#173337f2;color:#ecfff3;font:700 14px var(--ui,sans-serif);cursor:pointer;touch-action:manipulation';
    status.className='sr-only';status.setAttribute('role','status');
    host.append(chip,back,status);
    for(const button of [chip,back]){
      button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')e.stopPropagation()});
      button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')e.stopPropagation()});
    }
    chip.onclick=()=>chipShell();back.onclick=toSchool;
    ui={chip,back,status};return ui;
  }
  function syncControls(){
    const {chip,back}=controls(),play=mode==='play';
    chip.hidden=!play||!chipping();back.hidden=!play||!flight?.hatchReturn;
    if(!flight){egg=null;followers=[];lastSchool=-2}
  }
  function begin(){
    const world=worlds[flight.index].name;
    egg=species[world]&&!collection().has(world)?{world,index:flight.index,trip:flight,phase:'sleep',chips:0,lastChip:-8}:null;
    syncControls();
    if(egg)showNotice('Something stirs beneath the shell. Cast to look.',2.3);
  }
  function project(q){
    const a=(spinAngle()-egg.turn)*tau,z=Math.sqrt(Math.max(0,1-q.x*q.x-q.y*q.y));
    return{x:q.x*Math.cos(a)-z*Math.sin(a),y:q.y,z:q.x*Math.sin(a)+z*Math.cos(a)};
  }
  function reveal(spot){
    const world=worlds[flight.index],center={x:spot.x*.47,y:spot.y*.47};
    egg.center=center;egg.turn=spinAngle();egg.openTime=flight.age;
    // This opening and the three surrounding shards are actual cuts in the
    // rendered globe. The eye occupies the cavity inside the first one.
    egg.cut=world.skin.impact('cryo',center.x,center.y,egg.turn,.55,1-flight.hp/world.health);
    const bearing=flight.index*.83+.23;
    egg.patches=Array.from({length:3},(_,i)=>{
      const a=bearing+i*tau/3;
      return clipToDisc(center.x*.65+Math.cos(a)*.46,center.y*.65+Math.sin(a)*.39);
    });
    egg.phase='open';syncControls();
    const message='An eye! Tap the glowing shell chip.';
    ui.status.textContent=message;showNotice(message,2.3);
    tone(710,970,.17,'sine',.048);
  }
  function chipShell(){
    if(mode!=='play'||!chipping()||flight.age-egg.lastChip<.24)return false;
    const world=worlds[flight.index],p=orbitTarget(),q=project(egg.patches[egg.chips]),pet=species[egg.world];
    egg.lastChip=flight.age;
    world.skin.impact('cryo',q.x,q.y,spinAngle(),.33,1-flight.hp/world.health);
    world.skin.widen(egg.cut,.018);ejectCrust(world,q,1,'cryo');
    const px=p.x+q.x*p.r,py=p.y+q.y*p.r;
    spark(px,py,pet.pale,reduceMotion?3:10,55);ring(px,py,pet.accent,Math.max(14,p.r*.24));
    egg.chips++;tone(610+egg.chips*150,1100+egg.chips*120,.13,'sine',.035);
    if(egg.chips<3){
      ui.status.textContent='Shell chip '+egg.chips+' of 3 removed. Aim for the next glowing patch.';
      showNotice('Shell chipped · '+egg.chips+' / 3',.86);positionChip();
    }else{
      egg.phase='rescued';egg.hatchTime=flight.age;
      remember(egg.world);flight.hatchReturn=pet.name;
      const message=pet.name+' the '+pet.type+' is free!';
      showNotice(message,2.1);ui.status.textContent=message+' Return to school or keep flying.';
      const moveFocus=document.activeElement===ui.chip;
      addScore(320);tune([523,659,784,1047]);syncControls();
      if(moveFocus)ui.back.focus({preventScroll:true});
    }
    return true;
  }
  // True means a carefully aimed light cast was spent releasing the marked piece.
  function observeCast(spot,kind,power=1){
    if(mode!=='play'||!valid())return false;
    if(egg.phase==='sleep'){reveal(spot);return false}
    if(egg.phase!=='open'||power>1)return false;
    const target=project(egg.patches[egg.chips]),r=orbitTarget().r;
    if(Math.hypot(spot.x-target.x,spot.y-target.y)>Math.max(.17,16/r))return false;
    return chipShell();
  }
  function toSchool(){
    if(mode!=='play'||!flight?.hatchReturn)return;
    const name=flight.hatchReturn;
    saveRecord();worlds[flight.index].releaseSkin();start();
    showNotice(name+' followed you to spell school!',2.4);
  }
  function positionChip(){
    if(!chipping())return;
    const p=orbitTarget(),q=project(egg.patches[egg.chips]),button=controls().chip;
    const size=Math.max(44,p.r*.36);
    button.style.left=p.x+p.r*q.x+'px';button.style.top=p.y+p.r*q.y+'px';
    button.style.width=button.style.height=size+'px';
    const label='Chip glowing shell patch '+(egg.chips+1)+' of 3';
    if(button.getAttribute('aria-label')!==label){button.setAttribute('aria-label',label);button.title=label}
  }

  function ellipse(x,y,rx,ry,fill,angle=0){
    ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,angle,0,tau);ctx.fill();
  }
  function form(path,fill,stroke=null,width=.04){
    ctx.fillStyle=fill;ctx.fill(path);
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke(path)}
  }
  // Reusable silhouettes keep the three tiny companions readable during flight.
  const paths={};
  function outline(d){return paths[d]??=new Path2D(d)}
  function gloss(left,top,bottom,light,base,shadow){
    const g=ctx.createLinearGradient(left,top,-left,bottom);
    g.addColorStop(0,light);g.addColorStop(.45,base);g.addColorStop(1,shadow);return g;
  }
  function eye(x,y,size,t,pet,blink){
    ctx.save();ctx.translate(x,y);
    if(blink<.16){
      ctx.strokeStyle=pet.ink;ctx.lineWidth=size*.24;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-size*.7,0);ctx.quadraticCurveTo(0,size*.27,size*.7,-size*.04);ctx.stroke();
    }else{
      ctx.scale(1,blink);
      ellipse(0,0,size*.73,size,'#2a273f',-.10);
      ellipse(.01*size,.22*size,size*.54,size*.64,'#529da9');
      ellipse(size*(.09+Math.sin(t*1.4)*.06),-.09*size,size*.47,size*.68,'#242138');
      ellipse(-size*.21,-size*.37,size*.23,size*.25,'#fffef4');
      ellipse(size*.23,size*.33,size*.11,size*.13,'#d3f9ff');
    }
    ctx.restore();
  }
  function tail(pet,t){
    ctx.save();ctx.translate(-.28,.31);ctx.rotate(Math.sin(t*3.4)*.11);
    if(pet.type==='frost fox'){
      form(outline('M .13 .08 C -.32 .38 -.96 .28 -.92 -.31 Q -.83 -.91 -.42 -1.03 Q -.60 -.60 -.28 -.51 Q -.13 -.49 -.18 -.29 Q -.42 -.11 -.11 -.02 Z'),
        gloss(-.7,-.8,.23,pet.pale,pet.coat,pet.shade),pet.ink,.045);
      form(outline('M -.92 -.31 Q -.83 -.91 -.42 -1.03 Q -.58 -.67 -.40 -.57 L -.56 -.48 L -.57 -.63 L -.76 -.46 L -.72 -.63 Z'),pet.pale);
    }else if(pet.type==='leaf dragon'){
      form(outline('M .16 .09 Q -.48 .46 -.79 .11 Q -.94 -.07 -.77 -.40 Q -.70 -.02 -.45 -.05 Q -.10 -.04 .13 -.27 Z'),pet.shade,pet.ink,.044);
      form(outline('M -.78 -.25 Q -1.03 -.52 -.69 -.78 Q -.48 -.46 -.78 -.25 Z'),pet.accent,pet.ink,.037);
    }else{
      form(outline('M .17 .05 Q -.64 .37 -1.04 -.28 Q -.80 -.16 -.76 -.38 Q -.68 -.58 -.51 -.45 Q -.31 -.09 -.04 -.25 Z'),
        gloss(-.5,-.58,.28,pet.accent,pet.coat,pet.shade),pet.ink,.044);
    }
    ctx.restore();
  }
  function baby(x,y,size,world,t){
    const pet=species[world],fox=world==='Glacielle',dragon=world==='Viridia';
    const move=reduceMotion?.25:1,phase=reduceMotion?t*.30:t;
    const blinkCycle=(t+world.length*.31)%3.8,blink=1-Math.max(0,1-Math.abs(blinkCycle-.26)/.125);
    ctx.save();ctx.translate(x,y);ctx.scale(size*.48,size*.48);
    ctx.rotate(Math.sin(phase*(dragon?5.2:3.1))*(dragon?.045:.065)*move);
    tail(pet,phase);
    if(dragon){
      for(const side of [-1,1]){
        ctx.save();ctx.translate(side*.35,-.03);ctx.scale(side,1);ctx.rotate(-.15+Math.sin(phase*8)*.34*move);
        form(outline('M 0 .18 Q .05 -.59 .66 -.83 Q .67 -.44 .54 -.22 Q .33 -.27 .24 -.04 Q .12 -.11 0 .18 Z'),
          gloss(-.15,-.88,.15,'#edfca3','#b1de68','#559d74'),pet.ink,.045);
        ctx.strokeStyle='#69a569';ctx.lineWidth=.033;ctx.beginPath();ctx.moveTo(.04,.07);ctx.lineTo(.53,-.62);ctx.stroke();ctx.restore();
      }
    }
    const coat=gloss(-.6,-.85,.72,pet.pale,pet.coat,pet.shade);
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*.31,.46);ctx.rotate(side*(.11+Math.sin(phase*5+side)*.16*move));
      ellipse(0,.15,.18,.24,pet.ink);ellipse(0,.10,.168,.23,pet.shade);
      ellipse(side*.035,.28,.104,.053,pet.pale);ctx.restore();
    }
    form(outline('M -.51 -.05 Q -.74 .23 -.49 .55 Q -.15 .80 .32 .64 Q .62 .56 .53 .14 Q .45 -.25 .1 -.35 Z'),coat,pet.ink,.045);
    ellipse(.06,.34,.282,.24,pet.pale,-.12);
    ctx.save();ctx.translate(0,Math.sin(phase*3)*.033*move);
    if(fox||dragon){
      for(const side of [-1,1]){
        ctx.save();ctx.translate(side*.41,-.51);ctx.scale(side,1);ctx.rotate(Math.sin(phase*3.8+side)*.048*move);
        if(fox){
          form(outline('M -.20 .22 Q -.27 -.07 .20 -.59 Q .46 -.62 .25 -.04 L .13 .25 Z'),coat,pet.ink,.051);
          form(outline('M -.02 .05 Q .03 -.18 .21 -.42 Q .26 -.18 .13 .05 Z'),'#c5a1dd');
        }else{
          form(outline('M -.12 .15 Q -.18 -.28 .31 -.48 Q .27 -.10 .02 .17 Z'),'#b8e58a',pet.ink,.042);
          ctx.strokeStyle=pet.ink;ctx.lineWidth=.023;ctx.beginPath();ctx.moveTo(-.06,.09);ctx.lineTo(.19,-.29);ctx.stroke();
        }
        ctx.restore();
      }
    }else{
      for(const side of [-1,1]){
        ctx.save();ctx.translate(side*.47,-.26);ctx.scale(side,1);ctx.rotate(Math.sin(phase*4+side)*.08*move);
        for(let j=0;j<3;j++){
          const a=-.92+j*.68;ctx.save();ctx.rotate(a);
          form(outline('M -.03 -.04 Q .19 -.16 .36 -.10 Q .54 -.10 .60 -.22 Q .63 .02 .47 .09 Q .27 .19 .02 .07 Z'),pet.accent,pet.ink,.033);
          ctx.strokeStyle='#ffe1de';ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(.10,.02);ctx.quadraticCurveTo(.35,.035,.48,-.01);ctx.stroke();ctx.restore();
        }
        ctx.restore();
      }
    }
    const face=fox?'M -.59 -.32 Q -.56 -.72 -.12 -.71 Q .37 -.78 .56 -.47 L .68 -.23 L .55 -.21 L .65 -.12 Q .49 .11 .09 .20 Q -.37 .22 -.61 -.01 L -.74 -.15 L -.59 -.14 L -.69 -.29 Z':
      dragon?'M -.56 -.33 Q -.52 -.71 -.13 -.71 Q .29 -.80 .49 -.55 Q .61 -.44 .54 -.27 Q .77 -.22 .68 -.04 Q .56 .16 .25 .17 Q -.27 .24 -.52 -.01 Q -.65 -.17 -.56 -.33 Z':
      'M -.62 -.31 Q -.55 -.70 -.12 -.71 Q .40 -.76 .60 -.45 Q .82 -.20 .60 .03 Q .36 .24 -.11 .18 Q -.57 .16 -.64 -.11 Q -.69 -.21 -.62 -.31 Z';
    form(outline(face),coat,pet.ink,.049);
    if(fox){
      form(outline('M -.53 -.12 Q -.39 -.08 -.33 -.17 Q -.18 -.04 .02 -.07 Q .24 -.18 .32 -.12 Q .51 -.13 .52 -.02 Q .33 .17 .0 .17 Q -.33 .17 -.53 -.12 Z'),pet.pale);
      form(outline('M -.09 -.61 L .015 -.77 L .10 -.60 L .015 -.51 Z'),'#f5ffff','#70bddb',.025);
    }else if(dragon){
      form(outline('M -.15 -.65 Q -.21 -.89 .0 -.99 Q .15 -.84 .08 -.67 Z'),pet.accent,pet.ink,.035);
      ellipse(.30,.0,.28,.12,pet.pale,-.10);
    }else{
      for(const i of [-1,0,1])ellipse(i*.135,-.55-Math.abs(i)*.025,.033,.023,'#fff0da');
    }
    eye(-.23,-.265,.145,phase,pet,blink);eye(.32,-.29,.133,phase+.1,pet,blink);
    ctx.strokeStyle=pet.ink;ctx.lineWidth=.037;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(-.01,-.039);ctx.quadraticCurveTo(.10,.046,.22,-.035);ctx.stroke();
    if(fox){ellipse(.075,-.117,.065,.041,'#5d557a');ellipse(.052,-.133,.019,.011,pet.pale)}
    if(!fox)for(const sign of [-1,1])ellipse(sign*.45,-.075,.085,.044,dragon?'#eed998':'#eea1c5');
    ctx.restore();ctx.restore();
  }
  function drawCrack(p,point){
    const pet=species[egg.world],size=p.r*cap(egg.cut.radius*1.12,.20,.36),t=flight.age-egg.openTime;
    const blinkTime=t%3.3,blink=1-Math.max(0,1-Math.abs(blinkTime-2.7)/.13);
    ctx.save();ctx.translate(p.x+point.x*p.r,p.y+point.y*p.r);ctx.scale(size,size);
    ctx.rotate(-.12);
    const seam=outline('M -1 -.08 L -.74 -.29 L -.50 -.24 L -.26 -.48 L -.05 -.40 L .24 -.43 L .45 -.28 L .65 -.31 L .97 -.04 L .68 .16 L .46 .16 L .18 .39 L -.06 .27 L -.39 .35 L -.56 .17 L -.82 .18 Z');
    form(seam,'#191525',pet.ink,.11);
    ctx.save();ctx.clip(seam);
    const amber=ctx.createRadialGradient(-.13,-.20,0,.02,.08,.70);
    amber.addColorStop(0,pet.coat);amber.addColorStop(.65,pet.shade);amber.addColorStop(1,'#222034');
    ctx.fillStyle=amber;ctx.fillRect(-1.04,-.49,2.08,.95);
    ctx.save();ctx.translate(-.05+.075*Math.sin(reduceMotion?0:t*1.45),.005);
    ctx.scale(1.15,.97);eye(0,0,.39,t,pet,blink);ctx.restore();
    ctx.restore();
    ctx.lineCap='round';ctx.strokeStyle=pet.pale;ctx.lineWidth=.055;ctx.beginPath();
    ctx.moveTo(-.97,-.08);ctx.lineTo(-.74,-.29);ctx.lineTo(-.50,-.24);ctx.lineTo(-.26,-.48);ctx.lineTo(-.06,-.40);ctx.stroke();
    ctx.strokeStyle=pet.accent;ctx.lineWidth=.035;ctx.beginPath();ctx.moveTo(.22,.36);ctx.lineTo(.46,.16);ctx.lineTo(.68,.16);ctx.lineTo(.94,-.04);ctx.stroke();
    ctx.restore();
  }
  function drawTarget(p){
    const q=project(egg.patches[egg.chips]),pet=species[egg.world],t=flight.age;
    const x=p.x+p.r*q.x,y=p.y+p.r*q.y,rad=cap(p.r*.13,10,21);
    const pulse=reduceMotion?0:Math.sin(t*5.2);
    ctx.save();ctx.translate(x,y);ctx.lineJoin='round';ctx.lineCap='round';
    ctx.scale(rad,rad);
    // A chipped, raised plate sits inside a segmented target ring.
    form(outline('M -.55 .15 L -.46 -.38 L -.10 -.52 L .15 -.35 L .50 -.31 L .44 .17 L .06 .43 L -.17 .27 Z'),
      gloss(-.4,-.50,.4,pet.pale,pet.coat,pet.ink),'#272436',.095);
    ctx.strokeStyle=pet.pale;ctx.lineWidth=.07;ctx.beginPath();ctx.moveTo(-.43,-.32);ctx.lineTo(-.10,-.47);ctx.lineTo(.13,-.30);ctx.stroke();
    ctx.strokeStyle='#171c28';ctx.lineWidth=.30;ctx.beginPath();ctx.arc(0,0,.87,0,tau);ctx.stroke();
    for(let i=0;i<4;i++){
      ctx.strokeStyle=i%2?pet.pale:'#fff2a1';ctx.lineWidth=.13;
      const a=i*Math.PI/2+.18;ctx.beginPath();ctx.arc(0,0,.87+.04*pulse,a,a+.98);ctx.stroke();
    }
    ctx.restore();
    const size=Math.max(10,Math.min(13,p.r*.11));
    ctx.save();ctx.font='bold '+size+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const caption='CHIP '+(egg.chips+1)+'/3',cw=ctx.measureText(caption).width+9,cy=y+rad+size*.78;
    ctx.fillStyle='#141c30ed';ctx.fillRect(x-cw*.5,cy-size*.70,cw,size*1.4);
    ctx.fillStyle=pet.pale;ctx.fillText(caption,x,cy);ctx.restore();
  }
  function escape(p){
    const t=flight.age-egg.hatchTime,pet=species[egg.world],origin=project(egg.center);
    const sx=p.x+origin.x*p.r,sy=p.y+origin.y*p.r;
    const pop=ease(t/.48),travel=ease((t-.85)/1.45),glee=reduceMotion?0:Math.sin(t*5.2);
    const endX=cap(player.x+player.w*.57,20,W-22),endY=cap(player.y-player.w*.30,20,H-22);
    const x=sx+(endX-sx)*travel;
    const y=sy+(endY-sy)*travel-p.r*(reduceMotion?.11:.57)*Math.sin(Math.PI*travel)-p.r*.17*(1-travel)*pop;
    if(t<.92){
      const k=ease(t/.86);
      for(const side of [-1,1]){
        ctx.save();ctx.globalAlpha=1-k;ctx.translate(sx+side*p.r*(.09+.39*k),sy+p.r*(.12+.25*k));
        ctx.rotate(side*(.26+k*.95));ctx.scale(p.r*.243,p.r*.208);
        form(outline('M -1 -.06 L -.60 -.48 L -.20 -.34 L .12 -.65 L .40 -.34 L .87 -.39 L .96 .03 Q .25 1.18 -.57 .68 Z'),
          gloss(-.6,-.8,.7,pet.pale,worlds[flight.index].color,pet.ink),pet.ink,.055);
        ctx.restore();
      }
    }
    const big=cap(p.r*.72,49,101),small=cap(player.w*.47,27,55);
    baby(x,y+glee*2,Math.max(.2,pop)*(big+(small-big)*travel),egg.world,flight.age);
  }
  function drawWorld(){
    // Break animations may still draw frames after the ordinary battle has ended.
    if(mode!=='play'||!valid()){
      if(ui)ui.chip.hidden=true;
      return;
    }
    if(egg.phase==='sleep')return;
    const p=orbitTarget();
    if(egg.phase==='open'){
      drawCrack(p,project(egg.center));drawTarget(p);positionChip();
    }else if(egg.phase==='rescued')escape(p);
  }
  let helperTurn=0,lastHelp=-10;
  function assist(){
    const pets=[...collection()];
    if(!pets.length||!followers.length||clock-lastHelp<.85)return;
    const i=helperTurn%pets.length,pet=species[pets[i]],f=followers[i];
    if(!f)return;
    helperTurn++;lastHelp=clock;
    const target=entities.filter(e=>!e.dead&&e.x>f.x&&isHazard(e)&&e.kind!=='potion')
      .sort((a,b)=>a.x-b.x)[0];
    const aim=target?Math.atan2(target.y-f.y,target.x-f.x):0;
    const speed=Math.max(330,W*.84);
    shots.push({x:f.x,y:f.y,vx:speed*Math.cos(aim),vy:speed*Math.sin(aim),dead:false,petColor:pet.accent});
    spark(f.x,f.y,pet.accent,reduceMotion?2:7,52);ring(f.x,f.y,pet.pale,14);
    f.castAt=clock;
  }
  function drawSchool(){
    if(flight||mode!=='play')return;
    const book=collection();if(!book.size)return;
    const jump=lastSchool<0||Math.abs(clock-lastSchool)>.4;
    const dt=jump?0:cap(clock-lastSchool,0,.10);lastSchool=clock;
    let i=0;
    for(const name of book){
      const prior=followers[i],side=player.x>W*.55?-1:1;
      const size=cap(player.w*(.45-.022*i),28,53);
      const dx=side*(.45+.34*i)*player.w,dy=(i%2===0?-.46:.43)*player.w;
      const t=reduceMotion?clock*.25:clock,swim=Math.sin(t*(2.6+i*.5)+i*2.1);
      const tx=cap(player.x+dx+swim*size*.07,size*.60,W-size*.60),
        ty=cap(player.y+dy+swim*size*.09,size*.63,H-size*.57);
      const f=jump||!prior?{x:tx,y:ty}:prior,k=1-Math.exp(-dt*(5.7-i*.40));
      f.x+=(tx-f.x)*k;f.y+=(ty-f.y)*k;followers[i]=f;
      const recoil=cap(1-(clock-(f.castAt??-10))/.30,0,1);
      baby(f.x-recoil*size*.12,f.y-recoil*size*.09,size*(1+.07*recoil),name,clock+i*.83);i++;
    }
  }
  return {assist,begin,observeCast,chipping,drawWorld,drawSchool,syncControls,rescuedNames};
})();
