import type {Drive} from './save';
import {terrainAt} from './carPhysics';
import {SKY_WARNING_SECONDS,type SkyObject} from './skyObjects';
type C=CanvasRenderingContext2D;
function obstacle(c:C,a:SkyObject){
 const r=a.radius;
 c.save();c.translate(a.x,a.y);c.rotate(a.phase==='falling'?a.age*.9:0);c.lineWidth=3;c.lineJoin='round';c.strokeStyle='#24384f';
 if(a.kind===0){
  c.fillStyle='#e3a862';c.beginPath();c.roundRect(-r,-r,r*2,r*2,5);c.fill();c.stroke();
  c.strokeStyle='#986644';c.lineWidth=4;c.beginPath();c.moveTo(-r+5,-r+5);c.lineTo(r-5,r-5);c.moveTo(r-5,-r+5);c.lineTo(-r+5,r-5);c.stroke();
  c.strokeStyle='#ffe0a0';c.lineWidth=3;c.strokeRect(-r+3,-r+3,r*2-6,r*2-6);
 }else{
  const colors=a.kind===1?['#9bb0bb','#d1e3e8']:['#7bcddc','#d5ffff'];
  c.beginPath();for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,rr=r*(i%2?.88:1);const x=Math.cos(angle)*rr,y=Math.sin(angle)*rr;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fillStyle=colors[0];c.fill();c.stroke();
  c.beginPath();c.moveTo(-r*.6,-r*.25);c.lineTo(-r*.1,-r*.67);c.lineTo(r*.5,-r*.12);c.lineTo(0,r*.2);c.closePath();c.fillStyle=colors[1];c.fill();
  c.fillStyle='#426b8766';c.beginPath();c.arc(r*.35,r*.45,r*.2,0,Math.PI*2);c.fill();
 }
 c.restore();
}
/** Draw the exact physics object and fixed target. Never advances the simulation. */
export function drawSkyObjects(c:C,r:Drive,width:number,height:number,reduced=false){
 const a=r.sky?.active;if(!a||r.ended||r.practice)return;
 const camera=Math.max(0,r.x-width*.28),cy=Math.min(0,r.y-180),ground=terrainAt(a.x,r.track,r.bridges);
 c.save();c.translate(-camera,-cy);
 if(a.phase==='warning'||a.phase==='falling'){
  c.fillStyle='#ffbc6f55';c.strokeStyle='#ffe0aa';c.lineWidth=2;c.beginPath();c.ellipse(a.x,ground-4,a.radius+16,6,0,0,Math.PI*2);c.fill();c.stroke();
  c.save();c.setLineDash([5,7]);c.strokeStyle='#ffe3a386';c.beginPath();c.moveTo(a.x,cy+48);c.lineTo(a.x,ground-18);c.stroke();c.restore();
 }
 const offscreen=a.x<camera+24||a.x>camera+width-24;
 if(a.phase==='warning'||a.phase==='falling'&&offscreen){
  // Keep the direction cue until an offscreen drop resolves. Its target never
  // follows the car; braking may intentionally leave the object ahead of view.
  const edgeX=Math.max(camera+24,Math.min(camera+width-24,a.x)),y=cy+82;
  c.fillStyle='#ffe1a0';c.strokeStyle='#3d4050';c.lineWidth=2;
  c.beginPath();c.moveTo(edgeX-12,y);c.lineTo(edgeX+12,y);c.lineTo(edgeX,y+20);c.closePath();c.fill();c.stroke();
  c.font='bold 13px sans-serif';c.textAlign='center';c.fillStyle='#fff3cf';c.fillText(a.x>camera+width-24?'→':a.x<camera+24?'←':String(Math.max(1,Math.ceil(SKY_WARNING_SECONDS-a.age))),edgeX,y-8);
 }
 if(a.phase==='falling'){
  if(!reduced){c.strokeStyle=a.kind===2?'#99f6ff80':'#ffdfa955';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y-a.radius-12);c.lineTo(a.x,a.y-a.radius-42);c.stroke();}
  obstacle(c,a);
 }else if(a.phase==='burst'){
  const fade=Math.max(0,1-a.age/.65);c.globalAlpha=fade;
  for(let i=0;i<5;i++){const angle=i*Math.PI*2/5,dist=reduced?20:12+a.age*60;const x=a.x+Math.cos(angle)*dist,y=a.y+Math.sin(angle)*dist*.45;c.beginPath();c.arc(x,y,6+fade*6,0,Math.PI*2);c.fillStyle=a.hit?'#ffe7b7':'#bce6e5';c.fill();}
 }
 c.restore();
}
