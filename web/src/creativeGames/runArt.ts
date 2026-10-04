import type {Drive} from './save';
import {PICKUPS,CHECKPOINT_X} from './survival';
import {terrainAt} from './carPhysics';
type C=CanvasRenderingContext2D;
export function drawRunMarkers(c:C,r:Drive,reduced=false){
 const s=r.survival;
 for(const p of PICKUPS){
  if(s?.pickups.includes(p.id)||Math.abs(p.x-r.x)>1400)continue;
  const y=terrainAt(p.x,r.track,r.bridges)-65+(reduced?0:Math.sin(r.t*3+p.id)*3);c.save();c.translate(p.x,y);
  c.fillStyle=p.kind==='shield'?'#83d8e5':'#dcf1b8';c.strokeStyle='#f4ffec';c.lineWidth=3;c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#274657';c.fillStyle='#274657';
  if(p.kind==='shield'){c.beginPath();c.moveTo(-10,-8);c.lineTo(10,-8);c.lineTo(8,4);c.lineTo(0,12);c.lineTo(-8,4);c.closePath();c.stroke();}
  else{c.fillRect(-3,-12,6,24);c.fillRect(-12,-3,24,6);}
  c.restore();
 }
 for(let i=1;i<CHECKPOINT_X.length;i++){
  const x=CHECKPOINT_X[i];if(Math.abs(x-r.x)>1400)continue;
  const y=terrainAt(x,r.track,r.bridges);c.save();c.translate(x,y);c.strokeStyle='#d7f4e1';c.lineWidth=4;c.beginPath();c.moveTo(0,0);c.lineTo(0,-90);c.stroke();c.fillStyle=s&&s.checkpoint>=i?'#acf2c8':'#e8d798';c.beginPath();c.moveTo(0,-90);c.lineTo(40,-82);c.lineTo(0,-57);c.closePath();c.fill();c.fillStyle='#244951';c.font='bold 15px sans-serif';c.fillText('✓',8,-70);c.restore();
 }
 if(s?.shield){c.save();c.strokeStyle='#acf1fc';c.lineWidth=3;c.setLineDash([10,5]);c.beginPath();c.ellipse(r.x,r.y-12,95,85,0,0,Math.PI*2);c.stroke();c.restore();}
 if(s&&r.t<s.protectedUntil){c.save();c.strokeStyle='#efffc5';c.lineWidth=3;c.beginPath();c.ellipse(r.x,r.y-12,100,90,0,0,Math.PI*2);c.stroke();c.restore();}
}
