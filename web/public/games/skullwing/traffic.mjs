import {cities} from './cities.mjs';
// World y is height above the street. Each vehicle keeps its own short stretch of road.
const specs = {
  car:   {hp:1, speed:23, width:44, blast:59, points:65},
  police:{hp:1, speed:32, width:46, blast:66, points:110},
  tank:  {hp:3, speed:10, width:62, blast:86, points:220}
};
export function makeTraffic(buildings,district,end) {
  const fleet=[];
  function add(type,x,parked=false) {
    const id=fleet.length, spec=specs[type], dir=id%3===1?-1:1;
    fleet.push({type,variant:(id+district)%4,x,y:0,dir,vx:parked?0:dir*spec.speed,
      vy:0,angle:0,spin:0,hp:spec.hp,maxHp:spec.hp,width:spec.width,state:'driving',
      patrolMin:Math.max(24,x-49),patrolMax:Math.min(end-24,x+54),hit:0,
      fuse:0,flightAge:0,chain:0,wreckAge:0,drift:0});
  }
  buildings.forEach((b,i)=>{
    const left=b.x-b.w/2;
    add(cities[district].traffic[i%cities[district].traffic.length],i===0?121:left+12,i===0||i%4===2);
    if(i%4===1 || i%4===3)add('car',left+b.w*.79,true);
  });
  return fleet;
}
function strike(s,v,force,dir,chain=0) {
  if(v.state==='wreck'||v.state==='held')return;
  dir=dir||1;
  s.events.push({kind:'vehicleHit',x:v.x,y:v.y+9,type:v.type,direction:dir});
  v.hit=1;
  if(v.state==='airborne'){
    v.fuse=Math.min(v.fuse,.085);
    return;
  }
  v.hp=Math.max(0,v.hp-force);
  if(v.hp>0){v.drift=dir*(18+force*8);return;}
  const heavy=v.type==='tank';
  v.state='airborne';v.chain=chain;v.flightAge=0;v.fuse=chain?.23+.025*chain:.85;
  v.vx=dir*(heavy?117:170);v.vy=heavy?107:146;
  v.spin=dir*(heavy?3.8:8.5);v.drift=0;
}

// The center is a point in the attack, not the monster's feet. A rooftop punch
// can't reach the street. The edge of each hull participates in the radius.
export function hitTraffic(s,x,y,radius,force,direction,seen) {
  let hits=0;
  for(const v of s.cars){
    if(v.state==='wreck'||v.state==='held'||seen?.has(v))continue;
    const dx=Math.max(0,Math.abs(v.x-x)-v.width*.38);
    if(Math.hypot(dx,v.y+10-y)>radius)continue;
    seen?.add(v);
    strike(s,v,force,direction||Math.sign(v.x-x)||1);
    if(force>=3&&v.state==='airborne')v.fuse=Math.min(v.fuse,.16);
    hits++;
  }
  return hits;
}
function explode(s,v,hitBuilding,direct=null) {
  if(v.state!=='airborne')return;
  const spec=specs[v.type], dir=Math.sign(v.vx)||v.dir, y=v.y+8;
  v.state='wreck';v.wreckAge=0;v.vx*=.22;v.vy=Math.max(28,v.vy*.15);v.spin*=.30;
  s.wrecks[v.type]++;s.score+=spec.points+Math.min(v.chain,4)*35;
  s.events.push({kind:'vehicleExplosion',x:v.x,y,type:v.type,direction:dir,chain:v.chain});
  for(const b of s.buildings){
    if(b===direct||b.hp<=0)continue;
    const dx=Math.max(0,Math.abs(b.x-v.x)-b.w/2),dy=Math.max(0,y-b.h);
    if(Math.hypot(dx,dy)<spec.blast*.78)
      hitBuilding(s,b,v.type==='tank'?2:1,Math.sign(b.x-v.x)||dir,v.x,y,'blast');
  }
  if(v.chain>=4)return;
  for(const other of s.cars){
    if(other===v||other.state==='wreck'||other.state==='held')continue;
    const dx=Math.max(0,Math.abs(other.x-v.x)-other.width*.32);
    if(Math.hypot(dx,other.y+8-y)>=spec.blast)continue;
    if(other.state==='airborne'){
      other.chain=Math.max(other.chain,v.chain+1);
      other.fuse=Math.min(other.fuse,.12);
    }else strike(s,other,v.type==='tank'?2:1,Math.sign(other.x-v.x)||dir,v.chain+1);
  }
}
export function stepTraffic(s,dt,hitBuilding) {
  for(const v of s.cars){
    if(v.state==='held')continue;
    v.hit=Math.max(0,v.hit-dt*4.2);
    if(v.state==='driving'){
      v.x+=(v.vx+v.drift)*dt;v.drift*=Math.exp(-4*dt);
      if(v.x>=v.patrolMax||v.x<=v.patrolMin){
        v.dir=v.x>=v.patrolMax?-1:1;
        v.vx=Math.abs(v.vx)*v.dir;v.x=Math.max(v.patrolMin,Math.min(v.patrolMax,v.x));
      }
      continue;
    }
    if(v.state==='wreck'){
      v.wreckAge+=dt;
      if(v.y>0||v.vy>0){
        v.vy-=470*dt;v.y=Math.max(0,v.y+v.vy*dt);v.x+=v.vx*dt;v.angle+=v.spin*dt;
        if(v.y===0){v.vy=0;v.angle=Math.atan2(Math.sin(v.angle),Math.cos(v.angle));}
      }else v.angle*=Math.exp(-11*dt);
      continue;
    }
    const lastX=v.x,lastY=v.y;
    v.flightAge+=dt;v.fuse-=dt;v.vy-=435*dt;
    v.x+=v.vx*dt;v.y=Math.max(0,v.y+v.vy*dt);v.angle+=v.spin*dt;
    const dir=Math.sign(v.vx);
    // Street traffic overlaps the painted fronts. Let a hull cross into the facade
    // before impact so the launch is visible even when parked at the curb.
    const wall=s.buildings.find(b=>{
      if(b.hp<=0)return false;
      if(v.thrown && lastY>=b.h && v.y<=b.h && Math.abs(v.x-b.x)<=b.w/2)return true;
      if(v.y+6>b.h)return false;
      const edge=b.x-dir*b.w*.27;
      return (lastX-edge)*dir<0 && (v.x-edge)*dir>=0;
    });
    if(wall){
      hitBuilding(s,wall,v.type==='tank'?3:2,dir,v.x,v.y+9,'crash');
      s.score+=55;s.events.push({kind:'ricochet',x:v.x,y:v.y+8});
      explode(s,v,hitBuilding,wall);
    }else if(v.fuse<=0 || (v.y===0&&v.vy<0) || v.x<=12 || v.x>=s.length-12){
      explode(s,v,hitBuilding);
    }else if(v.flightAge>.15 && s.cars.some(other=>other!==v&&other.state==='driving'&&
      Math.abs(v.x-other.x)<(v.width+other.width)*.36&&v.y<19)){
      explode(s,v,hitBuilding);
    }
  }
}
