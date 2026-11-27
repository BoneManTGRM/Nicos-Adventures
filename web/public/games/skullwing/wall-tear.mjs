// A torn piece retains its original facade coordinates and jagged outline.
export function grabWall(s) {
  const a=s.actor;
  if(a.haul||a.dive)return;
  const reach=a.x+54*a.face;
  const b=s.buildings.filter(b=>b.hp>0&&Math.abs(b.x-reach)<=b.w/2+17&&a.y<b.h+8)
    .sort((a,b)=>Math.abs(a.x-reach)-Math.abs(b.x-reach))[0];
  if(!b){s.events.push({kind:'wallMiss'});return;}
  const half=Math.min(16,b.w*.21),side=Math.sign(a.x-b.x)||-a.face;
  const sx=(b.w/2-half-1)*side;
  const sy=Math.max(15,Math.min(b.h-15,a.y+50-((b.damageSites.length%2)*23)));
  const points=[[-half,-7],[-half*.42,-13],[2,-10],[half*.69,-12],[half,-4],[half-3,5],[half*.65,10],[1,8],[-half*.5,12],[-half,6]];
  const chunk={building:b,district:s.district,sx,sy,points,detached:false};
  a.haul={kind:'wall',monster:s.monster,target:chunk,phase:'tear',age:0,startX:b.x+sx,startY:sy,queued:null};
  s.events.push({kind:'wallGrab'});
}

export function stepWallTear(s,h,hitBuilding) {
  const chunk=h.target,b=chunk.building;
  if(!chunk.detached&&b.hp<=0){s.actor.haul=null;return;}
  if(!chunk.detached&&h.age>=.19){
    chunk.detached=true;
    hitBuilding(s,b,1,s.actor.face,h.startX,h.startY,'tear',chunk);
    s.events.push({kind:'wallRip',x:h.startX,y:h.startY});
  }
  if(h.age>=.49){h.phase=h.queued||'hold';h.age=0;}
}

export function stepFlyingWalls(s,dt,hitBuilding,hitTraffic) {
  for(let i=s.chunks.length-1;i>=0;i--){
    const p=s.chunks[i],lastX=p.x;
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=480*dt;p.angle+=p.spin*dt;p.age+=dt;
    const b=s.buildings.find(b=>b.hp>0&&(b!==p.building||p.age>.21)&&p.y<b.h+8&&
      Math.max(p.x,lastX)>=b.x-b.w*.5-5&&Math.min(p.x,lastX)<=b.x+b.w*.5+5);
    if(b)hitBuilding(s,b,2,Math.sign(p.vx),p.x,p.y,'crash');
    if(b||p.y<=9||p.x<0||p.x>s.length){
      hitTraffic(s,p.x,Math.max(4,p.y),40,2,Math.sign(p.vx));
      s.events.push({kind:'wallBreak',x:p.x,y:Math.max(4,p.y)});
      s.chunks.splice(i,1);
    }
  }
}
