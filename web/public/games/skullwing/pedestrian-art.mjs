import {crowdFrames} from './monster-frames.mjs';
const atlas=typeof Image==='function'?new Image():null;
if(atlas)atlas.src=new URL('./street-people.webp',import.meta.url).href;
const outfits = [
  ['#f7c845','#b16d2e','#9e563a','#253b69'],
  ['#61d7d0','#318485','#ecc49b','#58314e'],
  ['#ff9579','#b65469','#71452f','#203650'],
  ['#c5a2ff','#7258b5','#d29167','#344b52'],
  ['#84d779','#46845c','#f4c8a2','#4b4062'],
  ['#76bcff','#3d71a6','#925535','#33334b']
];

// The origin is at the soles so the same figure can stand on the street or in a hand.
export function drawPerson(c, p, stride, held = false) {
  if(atlas?.complete&&atlas.naturalWidth){
    const phase=Math.sin(stride),row=held?2:phase>=0?0:1;
    const [x,y,w,h]=crowdFrames[row*4+p.style%4],height=held?23:p.panic?24:22;
    const width=w*height/h;
    c.save();c.scale(held?1:p.dir,1);
    c.translate(0,-Math.abs(Math.cos(stride))*(held?.45:p.panic?1.1:.45));
    c.rotate(held?Math.sin(stride)*.075:phase*(p.panic?.045:.022));
    c.drawImage(atlas,x,y,w,h,-width*.50,-height,width,height);c.restore();return;
  }
  const [shirt, shade, skin, pants] = outfits[p.style];
  const gait = Math.sin(stride), bob = Math.abs(Math.cos(stride)) * .6;
  c.save(); c.scale(held ? 1 : p.dir, 1); c.translate(0, -bob);
  c.lineCap = 'round'; c.lineJoin = 'round';
  function limb(x, y, kneeX, kneeY, tipX, tipY, color, width) {
    c.beginPath(); c.moveTo(x,y); c.lineTo(kneeX,kneeY); c.lineTo(tipX,tipY);
    c.strokeStyle = '#1b2034'; c.lineWidth = width + 1.5; c.stroke();
    c.strokeStyle = color; c.lineWidth = width; c.stroke();
  }
  for (const side of [-1,1]) {
    const swing = side * gait;
    limb(side, -7.6, side + swing * 1.7, -4.3, side + swing * 3.6,
      -.4 - Math.max(0,-swing) * 1.8, pants, 2);
  }
  c.fillStyle = '#202539'; c.fillRect(-3,-14,6.4,7.4);
  c.fillStyle = shade; c.fillRect(-2.5,-13.8,5.6,6.2);
  c.fillStyle = shirt; c.fillRect(-1.7,-13.5,4.7,5.1);
  c.fillStyle = skin; c.fillRect(-1,-15,2.3,2);
  for (const side of [-1,1]) {
    const swing = side * gait;
    limb(side * 2, -12.7, side * (held ? 4.4 : 2.7) + swing, held ? -14 : -10.5,
      side * (held ? 5.2 : 2.5) + swing * 2, held ? -16.3 + swing * 2 : -9.5 - swing * 1.3, skin, 1.35);
  }
  c.fillStyle = '#292133'; c.fillRect(-2.5,-19,5.9,5.5);
  c.fillStyle = skin; c.fillRect(-1.6,-18,4.3,3.7);
  c.fillStyle = p.style % 2 ? '#543944' : '#352f41'; c.fillRect(-2.5,-19.3,5.4,1.9);
  if (p.style % 3 === 0) { c.fillStyle = shirt; c.fillRect(-3,-19.8,5.6,2); c.fillRect(-2,-18.5,6.2,1); }
  c.restore();
}

export function drawStreetPeople(c, people, target, camera, width, time, reduced) {
  for (const p of people) {
    if (!p.onStreet || p.x < camera - 15 || p.x > camera + width + 15) continue;
    c.save(); c.translate(p.x, 3);
    c.fillStyle = '#17172766'; c.beginPath(); c.ellipse(0,0,5.5,1.4,0,0,Math.PI*2); c.fill();
    drawPerson(c,p,p.stride);
    if (p === target) {
      c.translate(0, -27 + (reduced ? 0 : Math.sin(time * 5)));
      c.beginPath(); c.moveTo(-3.5,-2); c.lineTo(0,1.5); c.lineTo(3.5,-2);
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = '#302b45'; c.lineWidth = 4; c.stroke();
      c.strokeStyle = '#ffe47d'; c.lineWidth = 2; c.stroke();
    }
    c.restore();
  }
}
