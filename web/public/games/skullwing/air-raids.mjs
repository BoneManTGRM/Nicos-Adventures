// Arcade aircraft and non-realistic shock bolts. Coordinates are world-space.
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const shotRadius=21;
export function makeAirRaid(buildings,district,length){
  const planes=[];
  const add=(x,y,i)=>{
    const dir=i%2?-1:1;
    planes.push({x,y,alt:y,dir,heading:dir,vx:dir*(78+district*9),vy:0,angle:0,
      min:Math.max(47,x-145),max:Math.min(length-47,x+158),state:'patrol',clock:i===0?1.6:2.5+i%3*.44,
      tell:0,tx:0,ty:0,fuse:0,gone:false,phase:i*.77+district*.32,speed:78+district*9+i%3*8});
  };
  add(218,157,0);
  for(let i=3;i<buildings.length;i+=4){
    const b=buildings[i];
    add(b.x,Math.min(240,Math.max(167,b.h+28+(i%3)*11)),planes.length);
  }
  return {planes,bolts:[]};
}

export function hitAircraft(s,wave,radius){
  if(!wave.airborne||!s.airRaid)return;
  for(const p of s.airRaid.planes){
    if(p.state!=='patrol')continue;
    const dx=Math.max(0,Math.abs(p.x-wave.x)-18),dy=p.y-wave.y;
    if(Math.hypot(dx,dy)>radius)continue;
    const dir=Math.sign(p.x-wave.x)||p.dir;
    p.state='falling';p.tell=0;p.vx=dir*132;p.vy=62;p.fuse=.46;
    s.events.push({kind:'aircraftHit',type:'plane',x:p.x,y:p.y,direction:dir});
  }
}

export function stepAirRaid(s,dt,onHit){
  if(!s.airRaid)return;
  const {planes,bolts}=s.airRaid,a=s.actor;
  for(const p of planes){
    if(p.gone)continue;
    if(p.state==='falling'){
      p.vy-=520*dt;p.y=Math.max(0,p.y+p.vy*dt);
      p.x=clamp(p.x+p.vx*dt,14,s.length-14);
      p.angle+=Math.sign(p.vx)*dt*7.6;p.fuse-=dt;
      const roof=s.buildings.some(b=>b.hp>0&&p.y<=b.h+3&&Math.abs(p.x-b.x)<b.w*.44);
      if(p.fuse<=0||p.y<18||roof){
        p.gone=true;s.wrecks.plane=(s.wrecks.plane??0)+1;s.score+=165;
        s.events.push({kind:'vehicleExplosion',type:'plane',x:p.x,y:p.y,direction:Math.sign(p.vx),chain:0});
      }
      continue;
    }
    p.x+=p.dir*p.speed*dt;
    if(p.x>=p.max||p.x<=p.min){
      p.x=clamp(p.x,p.min,p.max);p.dir=p.x>=p.max?-1:1;
    }
    p.heading+=(p.dir-p.heading)*(1-Math.exp(-dt*11));
    p.y=p.alt+Math.sin(s.time*2+p.phase)*13;
    p.angle=Math.cos(s.time*2+p.phase)*.14;
    p.clock-=dt;
    if(s.finishWait>0){p.tell=0;continue;}
    if(p.tell>0){
      p.tell-=dt;
      if(p.tell<=0){
        const dx=p.tx-p.x,dy=p.ty-p.y,n=Math.hypot(dx,dy)||1;
        if(n<426&&bolts.length<12){
          bolts.push({x:p.x,y:p.y,vx:dx*213/n,vy:dy*213/n,age:0});
          s.events.push({kind:'aircraftShot',x:p.x,y:p.y});
        }
        p.clock=2.45+p.phase*.23;
      }
    } else if(p.clock<=0&&Math.abs(a.x-p.x)<330){
      p.tell=s.defense?.76:.52;p.tx=a.x;p.ty=a.y+48;
    }
  }
  for(let i=bolts.length-1;i>=0;i--){
    const b=bolts[i];b.age+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y<1||b.x<0||b.x>s.length||b.age>2||s.finishWait>0){bolts.splice(i,1);continue;}
    if(b.age<.08||Math.hypot(b.x-a.x,b.y-(a.y+48))>shotRadius)continue;
    bolts.splice(i,1);
    s.events.push({kind:'aircraftBoltHit',x:b.x,y:b.y,direction:Math.sign(b.vx)});
    onHit?.(s,b);
    if(s.outcome){bolts.length=0;break;}
  }
}

// The same world-space transform used for street traffic moves these sprites.
export function drawAirRaid(c,raid,camera,width,time,reduced){
  if(!raid)return;
  for(const b of raid.bolts){
    if(b.x<camera-28||b.x>camera+width+28)continue;
    c.save();c.translate(b.x,-b.y);c.rotate(Math.atan2(-b.vy,b.vx));
    c.fillStyle='#ff8f91';c.fillRect(-15,-2,18,4);c.fillStyle='#fff1cf';
    c.fillRect(-2,-1,7,2);c.restore();
  }
  for(const p of raid.planes){
    if(p.gone||p.x<camera-65||p.x>camera+width+65)continue;
    if(p.tell>0){
      c.save();c.strokeStyle='rgba(255,218,127,.49)';c.lineWidth=1;
      c.setLineDash([3,5]);c.beginPath();c.moveTo(p.x,-p.y);c.lineTo(p.tx,-p.ty);c.stroke();
      c.setLineDash([]);c.beginPath();c.arc(p.tx,-p.ty,8,0,Math.PI*2);c.stroke();c.restore();
    }
    c.save();c.translate(p.x,-p.y);c.rotate(p.angle);
    if(p.state==='falling'){
      for(let i=0;i<(reduced?2:4);i++){
        c.globalAlpha=.38-i*.06;c.fillStyle=i===0?'#ffac67':'#232037';
        c.beginPath();c.arc(-Math.sign(p.vx)*(7+i*7),-3-i*3,3+i*2,0,Math.PI*2);c.fill();
      }
      c.globalAlpha=1;
    }
    const face=Math.sign(p.heading)||p.dir;
    c.scale(face*(.55+.45*Math.abs(p.heading)),1);
    c.lineJoin='round';c.lineWidth=1.4;
    const shape=(color,points)=>{
      c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
      c.fillStyle=color;c.fill();c.strokeStyle='#1a213b';c.stroke();
    };
    shape('#6c6eaa',[[-13,0],[-20,-14],[-12,-16],[-2,-8],[5,-2]]);
    shape('#727a9e',[[-25,2],[-10,-4],[11,-7],[23,-3],[30,1],[18,6],[-16,7]]);
    shape('#a5add0',[[-5,1],[5,1],[-2,10],[-15,13],[-20,10]]);
    shape('#8cf3f1',[[6,-6],[14,-5],[20,-2],[5,-2]]);
    c.fillStyle='#faf0ce';c.fillRect(18,3,6,1.4);
    c.fillStyle='#ffba73';c.fillRect(-27,2,7,3);
    if(p.tell>0){
      const pulse=reduced?1:.62+Math.sin(time*27)*.33;
      c.globalAlpha=pulse;c.strokeStyle='#ffe099';c.lineWidth=1.6;
      c.beginPath();c.arc(26,1,6,0,Math.PI*2);c.stroke();
    }
    c.restore();
  }
}
