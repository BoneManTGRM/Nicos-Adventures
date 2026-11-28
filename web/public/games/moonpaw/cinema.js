'use strict';

const spaceArt={};
for(const name of ['flare','ice','vortex','storm','cinder','glacielle','prismara','meteor']){
  const img=new Image(),vfx=['flare','ice','vortex','storm'].includes(name);
  img.src='assets/'+(vfx?'vfx-':'rock-')+name+'.webp';spaceArt[name]=img;
}
const impactStyles={
  nova:{map:'flare',color:'#ffd790',scale:.66,life:.64},
  solar:{map:'flare',color:'#ff9b4b',scale:.87,life:.91},
  cryo:{map:'ice',color:'#a0f2ff',scale:.74,life:.78},
  gravity:{map:'vortex',color:'#d09dff',scale:.99,life:1.02},
  comet:{map:'flare',color:'#ffbf7e',scale:.80,life:.76},
  storm:{map:'storm',color:'#b0bcff',scale:.71,life:.60},
  crescent:{map:'flare',color:'#a0ffdb',scale:.58,life:.46},
  bloom:{map:'ice',color:'#ffb9e2',scale:.66,life:.61},
  wormhole:{map:'vortex',color:'#ef9bff',scale:.83,life:.76},
  dragon:{map:'flare',color:'#ffa453',scale:.93,life:.72},
  fleet:{map:'storm',color:'#7feaff',scale:.54,life:.43},
  yarn:{map:'flare',color:'#ffabda',scale:.73,life:.65},
  claws:{map:'ice',color:'#8af3e2',scale:.73,life:.65},
  purr:{map:'vortex',color:'#ffde8a',scale:.73,life:.65},
  heist:{map:'flare',color:'#ffae72',scale:.73,life:.65},
  pinball:{map:'storm',color:'#94eaff',scale:.73,life:.65},
  mirror:{map:'vortex',color:'#c6a1ff',scale:.73,life:.65},
  moon:{map:'flare',color:'#ffe8a2',scale:.73,life:.65},
  potion:{map:'ice',color:'#a8ef92',scale:.73,life:.65},
  spitball:{map:'flare',color:'#ffd898',scale:.75,life:.60},
  zipper:{map:'ice',color:'#7ff3d9',scale:.75,life:.60},
  stampede:{map:'vortex',color:'#c6a7ff',scale:.75,life:.60},
  cutter:{map:'storm',color:'#ffdc89',scale:.75,life:.60},
  monster:{map:'vortex',color:'#72edeb',scale:.95,life:.74},
  super:{map:'storm',color:'#ffe9a5',scale:1.29,life:1.03}
};
function lightSprite(key,x,y,w,h,rotation,alpha){
  const img=spaceArt[key];if(!img||!img.naturalWidth||alpha<=0||w<=0||h<=0)return;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.globalCompositeOperation='screen';
  ctx.globalAlpha=Math.min(1,alpha);ctx.translate(x,y);ctx.rotate(rotation);
  ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();
}
function hitSound(kind,power){
  if(!sound||!audio||audio.state!=='running')return;
  const low=kind==='gravity'||kind==='super',sharp=kind==='cryo'||kind==='storm';
  const length=low?.54:sharp?.18:.29,rate=audio.sampleRate;
  if(!hitSound.buffer||hitSound.buffer.sampleRate!==rate){
    const buf=audio.createBuffer(1,Math.ceil(rate*.9),rate),samples=buf.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
    hitSound.buffer=buf;
  }
  const now=audio.currentTime,src=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  src.buffer=hitSound.buffer;filter.type=sharp?'bandpass':'lowpass';
  filter.frequency.setValueAtTime(sharp?4400:low?780:2350,now);filter.frequency.exponentialRampToValueAtTime(sharp?880:125,now+length);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07+.012*power,now+.015);
  gain.gain.exponentialRampToValueAtTime(.0001,now+length);
  src.connect(filter);filter.connect(gain);gain.connect(audio.destination);src.start();src.stop(now+length+.02);
  tone(low?86:145,low?29:45,length,'sine',low?.12:.08);
}
function impactArt(spot,kind,power){
  const style=impactStyles[kind],seed=flight.scars*2.23+flight.effects.length*.79;
  flight.effects.push({x:spot.x,y:spot.y,z:Math.sqrt(Math.max(0,1-spot.x**2-spot.y**2)),turn:spinAngle(),
    kind,power,seed,age:0,life:style.life});
  if(flight.effects.length>22)flight.effects.shift();
  if(!reduceMotion)shake=Math.max(shake,Math.min(.24,.041+.035*power));
}
function drawImpactArt(){
  const p=orbitTarget();
  for(const fx of flight.effects){
    const style=impactStyles[fx.kind],t=fx.age/fx.life,d=(spinAngle()-fx.turn)*Math.PI*2;
    const x=p.x+p.r*(fx.x*Math.cos(d)-fx.z*Math.sin(d)),y=p.y+p.r*fx.y;
    const size=p.r*style.scale*(.86+.16*fx.power),a=(1-t)**.85;
    const swell=1-Math.exp(-7*t),spin=reduceMotion?0:t;
    lightSprite(style.map,x,y,size*(.40+swell),size*(.36+swell),fx.seed*.2+spin*(fx.kind==='gravity'?1.52:.21),a*.95);
    if(fx.kind==='super'||fx.kind==='solar'){
      lightSprite('flare',x,y,size*(.26+.74*t),size*(.23+.78*t),-spin*.65,.68*a);
    }
    ctx.save();ctx.translate(x,y);ctx.lineCap='round';ctx.globalCompositeOperation='lighter';
    const count=reduceMotion?4:10+Math.min(5,Math.ceil(fx.power));
    for(let i=0;i<count;i++){
      const theta=fx.seed+i*2.39996,wave=.63+.31*Math.sin(i*31.4+fx.seed);
      const r=size*(.12+wave*swell*.81),len=size*(.024+.09*a)*wave;
      ctx.globalAlpha=a*(.32+.48*wave);ctx.strokeStyle=i%4===0?'#fff3e0':style.color;
      ctx.lineWidth=Math.max(.75,size*.016*a);
      ctx.beginPath();ctx.moveTo(Math.cos(theta)*(r-len),Math.sin(theta)*(r-len));ctx.lineTo(Math.cos(theta)*r,Math.sin(theta)*r);ctx.stroke();
    }
    if(fx.kind==='nova'||fx.kind==='comet'||fx.kind==='super'){
      ctx.rotate(-.27);ctx.globalAlpha=a*.67;ctx.strokeStyle=style.color;ctx.lineWidth=Math.max(.75,size*.035*a);
      ctx.beginPath();ctx.ellipse(0,0,size*(.15+.65*swell),size*(.09+.31*swell),0,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }
}
function drawComets(){
  const p=orbitTarget();
  for(const c of flight.comets){
    if(c.age<0||c.hit)continue;
    const t=Math.min(1,c.age/c.span),length=Math.min(p.r*3.5,H*.79);
    const dx=Math.sin(c.angle),dy=-Math.cos(c.angle),x=p.x+p.r*c.spot.x+dx*length*(1-t*t),y=p.y+p.r*c.spot.y+dy*length*(1-t*t);
    const r=p.r*(.057+.017*c.power),tail=length*(.17+.18*t);
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));
    const g=ctx.createLinearGradient(0,0,tail,0);g.addColorStop(0,'#ffe9ad');g.addColorStop(.32,'#ff8f4ca3');g.addColorStop(1,'#b84a6b00');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-r*.4,-r*.74);ctx.quadraticCurveTo(tail*.47,-r*.8,tail,0);ctx.quadraticCurveTo(tail*.46,r*.15,0,r);ctx.fill();
    ctx.restore();
    lightSprite('flare',x,y,r*4.5,r*4.5,t,.65);
    drawRockArt('meteor',x,y,r*2.6,r*2.2,t*2);
  }
}
function drawArcs(){
  for(const arc of flight.arcs){
    const t=arc.age/.48;if(t>=1)continue;
    ctx.save();ctx.lineCap='round';ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(1-t)**.65;
    for(let j=1;j<arc.points.length;j++){
      const a=arc.points[j-1],b=arc.points[j],paw=j===1?castingPaw():null,x=paw?paw.x:a.x*W,y=paw?paw.y:a.y*H,dx=b.x*W-x,dy=b.y*H-y,len=Math.hypot(dx,dy)||1;
      const pts=[],steps=Math.max(4,Math.ceil(len/17));
      for(let i=0;i<=steps;i++){
        const f=i/steps,jitter=Math.sin(f*Math.PI)*Math.sin(i*5.11+arc.seed+Math.floor(t*4))*(4+Math.min(14,len*.055));
        pts.push([x+dx*f-dy/len*jitter,y+dy*f+dx/len*jitter]);
      }
      penLine(ctx,pts,'#9655ff77',9);penLine(ctx,pts,'#949dff',3.4);penLine(ctx,pts,'#efffff',1.25);
      const m=pts[Math.floor(steps*.52)];penLine(ctx,[m,[m[0]-dy/len*8,m[1]+dx/len*8],[m[0]+dx/len*13-dy/len*17,m[1]+dy/len*13+dx/len*17]],'#bcaeff',1.1);
    }
    ctx.restore();
  }
}
function drawRockArt(name,x,y,w,h,rotation){
  const art=spaceArt[name];if(!art?.naturalWidth)return false;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(art,-w/2,-h/2,w,h);ctx.restore();return true;
}
function drawCatTrail(){
  const w=playerArtWidth();
  ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.tilt*Math.PI/180);ctx.lineCap='round';
  const drift=reduceMotion?0:Math.sin(clock*4);
  for(let i=0;i<3;i++){
    const length=w*(.92+i*.12),g=ctx.createLinearGradient(-length,0,-w*.2,0);
    g.addColorStop(0,'#a57eff00');g.addColorStop(.64,i===1?'#9762f44e':'#79d6f74a');g.addColorStop(1,i===1?'#d0a4ffb0':'#baedff8a');
    ctx.strokeStyle=g;ctx.lineWidth=w*(.013+i*.006);
    ctx.beginPath();ctx.moveTo(-w*.23,w*.07);
    ctx.bezierCurveTo(-w*.62,w*(.18+i*.025+drift*.035),-w*.81,-w*(.015+i*.02),-length,w*(.08+drift*.065));ctx.stroke();
  }
  ctx.restore();
}
function drawBreakLight(p,world,t,front){
  const key=world.breakArt;
  if(!front){
    const time=Math.max(0,t-.14),bloom=Math.min(1,t/.18)*Math.max(0,1-time/1.45);
    const s=p.r*(.54+2.32*(1-Math.exp(-time*3.3)));
    lightSprite(key,p.x,p.y,s,s,reduceMotion?0:t*.25,bloom);
    if(world.breakArt==='vortex')lightSprite('storm',p.x,p.y,s*.8,s*.8,-t*.17,bloom*.82);
    return;
  }
  const time=Math.max(0,t-.20),fade=Math.max(0,1-time/1.65);
  if(!time||!fade)return;
  const s=p.r*(.28+2.08*(1-Math.exp(-time*2.2)));
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.26);ctx.globalCompositeOperation='lighter';
  for(let i=0;i<2;i++){
    const r=s*(1+i*.105);ctx.globalAlpha=fade*(i?.32:.76);
    ctx.strokeStyle=i?world.color:world.core;ctx.lineWidth=Math.max(.8,p.r*(.015+.019*fade));
    ctx.beginPath();ctx.ellipse(0,0,r,r*(.30+.07*i),0,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
  const peak=Math.max(0,1-Math.abs(time-.16)/.32);
  if(peak)lightSprite('flare',p.x,p.y,p.r*(1.0+time),p.r*(.53+.5*time),-.26,peak*.73);
}
function drawFrostHalo(){
  const halo=flight.frostHalo;
  if(!halo)return;
  const t=halo.age/.65,r=playerArtWidth()*(.60+t*1.7);
  lightSprite('ice',halo.x*W,halo.y*H,r,r,0,(1-t)*.63);
}

function drawCastingGesture(){
  if(!acting)return;
  const a=acting,style=impactStyles[a.kind]||impactStyles.nova,paw=castingPaw();
  const t=a.age<a.hit?a.age/a.hit:Math.max(0,1-(a.age-a.hit)/.26);
  if(t<=0)return;
  const w=playerArtWidth()*(.10+.27*t);
  lightSprite(style.map,paw.x,paw.y,w,w,reduceMotion?0:a.age*2.6,t*.88);
}
