'use strict';

const fleetSpell=(()=>{
  const duration=2.85,tiles=[];
  const unit=t=>Math.max(0,Math.min(1,t));
  const ease=t=>t*t*(3-2*t);
  const liveries=[
    {stripe:'#ffad49',shadow:'#af4d25',jet:'#ffa953',bolt:'#ffcd73'},
    {stripe:'#57d9fa',shadow:'#267eae',jet:'#4ed7ff',bolt:'#81edff'},
    {stripe:'#c5a0ff',shadow:'#7446ac',jet:'#b087ff',bolt:'#dac0ff'}
  ];
  function paintHull(variant){
    const canvas=document.createElement('canvas');
    canvas.width=208;canvas.height=144;
    const g=canvas.getContext('2d'),paint=liveries[variant];
    g.translate(104,72);g.scale(3,3);g.lineJoin='round';
    function panel(points,fill){
      g.beginPath();g.moveTo(...points[0]);for(let j=1;j<points.length;j++)g.lineTo(...points[j]);
      g.closePath();g.fillStyle=fill;g.fill();
    }
    const alloy=g.createLinearGradient(0,-15,0,15);
    alloy.addColorStop(0,'#d0e7e7');alloy.addColorStop(.32,'#6c8aa1');alloy.addColorStop(.55,'#e9ede5');
    alloy.addColorStop(.70,'#718599');alloy.addColorStop(1,'#31475c');
    const glass=g.createLinearGradient(1,-3,7,4);
    glass.addColorStop(0,'#123048');glass.addColorStop(.30,'#3dd8e3');
    glass.addColorStop(.55,'#d8ffff');glass.addColorStop(.64,'#4095af');glass.addColorStop(1,'#1b3550');
    const span=[15.5,13,17][variant],wingRear=[-18,-12,-21][variant];
    for(const side of [-1,1]){
      g.save();g.scale(1,side);
      panel([[12,2],[3,6],[wingRear,span],[-21,span-1],[-17,6],[-22,3]],'#263849');
      panel([[12,2],[3,5],[wingRear,span-1],[-18,span-2],[-14,6],[-18,3]],alloy);
      panel([[-2,5],[-7,6.2],[wingRear+1,span-1],[-12,span-4]],paint.stripe);
      // Independently shaded engine nacelles bracket the fuselage.
      const y=variant===1?9:7.5;
      panel([[4,y],[-3,y-2.1],[-19,y-2.1],[-23,y-.9],[-23,y+1.8],[-17,y+3],[-2,y+2.5]],'#283c50');
      panel([[4,y],[-3,y-2],[-18,y-1.7],[-20,y],[-15,y+1.2],[-2,y+1.2]],alloy);
      panel([[-21,y-1.25],[-22.8,y-.6],[-22.8,y+1.2],[-20.8,y+1.6]],paint.jet);
      panel([[-15,y-1.3],[-10,y-1.6],[-8,y-.65],[-14,y-.35]],paint.shadow);
      panel([[-9,3.1],[-14,6],[-20,5.7],[-15,2.7]],'#97aab3');
      g.restore();
    }
    const nose=variant===0?29:variant===1?26:24;
    panel([[nose,-.4],[nose-4,2.5],[2,5.8],[-15,5.1],[-21,2],[-20,-2.3],[-13,-4.2],[5,-4.5]],'#243a4c');
    panel([[nose,-.4],[4,3.6],[-14,3.6],[-19,.5],[-14,-3.6],[5,-4.1]],alloy);
    panel([[nose,-.4],[9,.5],[-14,.45],[-15,-.8],[6,-1.6]],paint.stripe);
    panel([[13,-.5],[7,2.4],[-3,2.2],[-5,0],[-1,-2.6],[7,-2.7]],'#263c53');
    panel([[12,-.7],[7,1.45],[-1.5,1.4],[-3,.1],[.1,-1.9],[6,-2.1]],glass);
    panel([[14,-.2],[nose-3,-.65],[19,.55],[14,1]],'#f7e9c7');
    for(let i=0;i<3;i++)panel([[-8-i*2.4,-2.5],[-8.8-i*2.4,-.5],[-9.7-i*2.4,-.5],[-9.1-i*2.4,-2.5]],'#324555');
    return canvas;
  }
  function shipPose(ship,t){
    const slot=ship.slot,rank=Math.abs(slot),side=Math.sign(slot);
    const scale=Math.max(29,Math.min(64,Math.min(W,H)*.117))*(ship.variant===0?1.13:.90);
    const inbound=unit((t-.038*rank)/.82),out=unit((t-1.91-.065*rank)/.72);
    const arc=ease(inbound),leave=out*out;
    const span=Math.min(H*.089,scale*.86);
    const lane=slot*span,entrance=reduceMotion?0:1-arc;
    const u=unit((t-.68)/1.30);
    const x=W*(.32+.23*u)+scale*(-.63*rank+.10*side)-entrance*(W*.56+scale*1.7)+leave*W*(reduceMotion?.12:.90);
    const y=H*(.32+.07*u)+lane+entrance*(H*(.13+.18*side)+lane*.50)-leave*H*(reduceMotion?.03:.40-.08*side);
    const angle=.12+.22*entrance*side+.14*Math.sin(Math.PI*u)-leave*.62;
    const bank=reduceMotion?.87: .85-.32*entrance+.11*Math.sin(ship.id+t*2.4);
    return {x,y,angle,bank,size:scale,alpha:Math.min(unit(t/(reduceMotion?.22:.1)),unit((duration-t)/.32))};
  }
  function target(raid,n,i,second){
    const lane=n===1?0:(i/(n-1)-.5)*1.06;
    const c=Math.cos(raid.direction),s=Math.sin(raid.direction);
    const depth=second?.29:-.12,spread=.74+.08*raid.power;
    return clipToDisc(raid.spot.x*.73+c*lane*spread-s*depth,raid.spot.y*.73+s*lane*spread+c*depth);
  }
  function cast(spot,power){
    if(!flight||flight.phase!=='fight')return;
    const raid={kind:'fleet',index:flight.index,age:0,power,spot,direction:flight.scars*.96+.35,ships:[],shots:[]};
    for(let i=0;i<2+power;i++){
      const slot=i===0?0:(i%2?1:-1)*Math.ceil(i/2);
      raid.ships.push({id:i,slot,variant:i?1+(i-1)%2:0});
    }
    const formation=raid.ships.slice().sort((a,b)=>a.slot-b.slot);
    for(let i=0;i<formation.length;i++){
      const ship=formation[i],start=.84+i*.063;
      raid.shots.push({ship,start,end:start+.235,spot:target(raid,formation.length,i,false),second:false});
    }
    const second=raid.ships.slice(0,power);
    for(let i=0;i<second.length;i++){
      const start=1.54+i*.073;
      raid.shots.push({ship:second[i],start,end:start+.265,spot:target(raid,second.length,i,true),second:true});
    }
    flight.specialAttackFX.push(raid);
    cooldown=1.78+.09*power;castFlash=1;
    tone(425,590,.11,'triangle',.04);tone(695,830,.15,'sine',.04,.11);
  }
  function screenTarget(round){
    const globe=orbitTarget();
    return {x:globe.x+globe.r*round.spot.x,y:globe.y+globe.r*round.spot.y};
  }
  function update(dt){
    if(!flight)return;
    const effects=flight.specialAttackFX;
    for(let i=effects.length-1;i>=0;i--){
      const raid=effects[i];if(!raid||raid.kind!=='fleet')continue;
      if(raid.index!==flight.index||flight.phase!=='fight'){effects.splice(i,1);continue}
      raid.age+=dt;
      for(const round of raid.shots){
        if(!round.origin&&raid.age>=round.start){
          const ship=shipPose(round.ship,round.start);
          round.origin={x:(ship.x+.34*ship.size*Math.cos(ship.angle))/W,y:(ship.y+.34*ship.size*Math.sin(ship.angle))/H};
          if(round.ship.id===0)tone(round.second?180:660,round.second?80:260,.15,'triangle',.052);
        }
        if(round.hit||raid.age<round.end)continue;
        round.hit=true;
        const world=worlds[raid.index],type=round.second?'solar':'nova',strength=round.second?.70+.20*raid.power:.52+.10*raid.power;
        round.turn=spinAngle();
        world.skin.impact(type,round.spot.x,round.spot.y,round.turn,strength,1-flight.hp/world.health);
        if(round.second||!round.ship.id)ejectCrust(world,round.spot,1,type);
        const at=screenTarget(round);
        spark(at.x,at.y,liveries[round.ship.variant].bolt,reduceMotion?3:9,round.second?97:72);
        if(round.ship.id===0)hitSound(type,round.second?2:1);
        gainEnergy(round.second?4:2);
        applyWorldDamage(1+(round.second&&!round.ship.id?1:0));
        if(flight.phase!=='fight')break;
      }
      if(raid.age>=duration||flight.phase!=='fight')effects.splice(i,1);
    }
  }
  function drawShip(raid,ship){
    const pose=shipPose(ship,raid.age),s=pose.size/51,paint=liveries[ship.variant];
    if(pose.x < -pose.size || pose.x>W+pose.size || pose.alpha<=0)return;
    ctx.save();ctx.globalAlpha=pose.alpha;ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);ctx.scale(s,s*pose.bank);
    const thrust=reduceMotion?1:1+.14*Math.sin(raid.age*24+ship.id)+.5*unit((raid.age-1.9)/.4);
    const y=ship.variant===1?9:7.5;
    for(const side of [-1,1]){
      ctx.save();ctx.translate(-22,y*side+.25);ctx.scale(thrust,1);
      const jet=ctx.createLinearGradient(-17,0,0,0);jet.addColorStop(0,'transparent');jet.addColorStop(.60,paint.jet+'99');jet.addColorStop(1,'#ecffff');
      ctx.fillStyle=jet;ctx.beginPath();ctx.moveTo(1,-1.8);ctx.quadraticCurveTo(-7,-2.3,-17,0);ctx.quadraticCurveTo(-7,1.8,1,1.8);ctx.fill();ctx.restore();
    }
    const tile=tiles[ship.variant]??=paintHull(ship.variant);
    ctx.drawImage(tile,-104/3,-24,208/3,48);ctx.restore();
  }
  function drawTracer(raid,round){
    if(!round.origin||raid.age<round.start||raid.age-round.end>.32)return;
    const paint=liveries[round.ship.variant],globe=orbitTarget(),x0=round.origin.x*W,y0=round.origin.y*H;
    const f=unit((raid.age-round.start)/(round.end-round.start)),target=screenTarget(round);
    if(f<1){
      const dx=target.x-x0,dy=target.y-y0,length=Math.hypot(dx,dy)||1,px=-dy/length,py=dx/length;
      const tail=Math.max(0,f-(round.second?.18:.28)),taper=1-.72*f,lanes=round.second?[0]:[-1,1];
      for(const lane of lanes){
        const spread=lane*(reduceMotion?1.5:3)*taper;
        ctx.beginPath();ctx.moveTo(x0+dx*tail+px*spread,y0+dy*tail+py*spread);ctx.lineTo(x0+dx*f+px*spread,y0+dy*f+py*spread);
        ctx.strokeStyle=round.second?'#ffb87499':paint.bolt+'99';ctx.lineWidth=round.second?6.5:3.2;ctx.stroke();
        ctx.strokeStyle=round.second?'#fff4b9':'#efffff';ctx.lineWidth=round.second?2.2:1.15;ctx.stroke();
      }
    }else if(round.hit){
      const t=unit((raid.age-round.end)/.32),turn=(spinAngle()-round.turn)*Math.PI*2;
      const depth=Math.sqrt(Math.max(0,1-round.spot.x**2-round.spot.y**2));
      if(round.spot.x*Math.sin(turn)+depth*Math.cos(turn)<0)return;
      const x=globe.x+globe.r*(round.spot.x*Math.cos(turn)-depth*Math.sin(turn)),y=target.y;
      const r=globe.r*((round.second?.22:.14)*(.15+Math.sqrt(t)*.85));
      ctx.save();ctx.translate(x,y);ctx.rotate(raid.direction);ctx.scale(1,.64);ctx.globalAlpha=1-t;
      ctx.strokeStyle=round.second?'#ffe5a1':paint.bolt;ctx.lineWidth=1.25;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
      ctx.restore();
    }
  }
  function draw(){
    if(!flight||flight.phase!=='fight')return;
    ctx.save();ctx.lineCap='round';
    for(const raid of flight.specialAttackFX){
      if(raid.kind!=='fleet'||raid.index!==flight.index)continue;
      for(const round of raid.shots)drawTracer(raid,round);
      for(let i=raid.ships.length-1;i>=0;i--)drawShip(raid,raid.ships[i]);
    }
    ctx.restore();
  }
  return {cast,update,draw};
})();
