import {drawVehicle} from './vehicle-art.mjs';
import {drawPerson} from './pedestrian-art.mjs';
import {drawWallChunk} from './demolition-art.mjs';
import {carryAnchor} from './nacho-moves.mjs';
import {BITE} from './pedestrians.mjs';

export function drawHeld(c,a,facing,time,reduced) {
  const h=a.haul;
  if(!h||h.bit||(h.kind==='wall'&&!h.target.detached))return;
  const hand=carryAnchor(a);
  c.save();c.translate((hand.x-a.x)*facing,a.y-hand.y);
  if(h.phase==='eat'){
    const t=Math.min(1,h.age/BITE),scale=1-t*t*.89;
    c.scale(scale,scale);c.rotate(-.48*t);
  }
  if(h.kind==='wall')drawWallChunk(c,h.target);
  else if(h.kind==='car')drawVehicle(c,{...h.target,x:0,y:0,angle:0,dir:h.target.dir*facing},time,reduced);
  else{c.rotate(-.31);c.translate(0,8);drawPerson(c,h.target,time*(reduced?5:13),true);}
  c.restore();
}
