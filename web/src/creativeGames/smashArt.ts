import type {Drive} from './save';
import {COURSE_SMASH,type SmashObject} from './smashObjects';
import {terrainAt} from './carPhysics';
type C=CanvasRenderingContext2D;
const ink='#223548';
function rect(c:C,x:number,y:number,w:number,h:number,fill:string){c.fillStyle=fill;c.strokeStyle=ink;c.lineWidth=3;c.beginPath();c.roundRect(x,y,w,h,4);c.fill();c.stroke();}
export function obstacleArt(c:C,o:SmashObject){
 const w=o.width,h=o.height;c.save();c.lineJoin='round';c.lineWidth=3;c.strokeStyle=ink;
 switch(o.kind){
  case 'crate':
   for(const [x,y,size] of [[-w,-h/2,w],[0,-h/2,w],[-w/2,-h,w]]){
    rect(c,x,y,size,h/2,'#d59b62');c.strokeStyle='#885339';c.lineWidth=3;c.beginPath();c.moveTo(x+4,y+4);c.lineTo(x+size-4,y+h/2-4);c.moveTo(x+size-4,y+4);c.lineTo(x+4,y+h/2-4);c.stroke();
   }break;
  case 'fence':for(const x of [-w,w])rect(c,x-5,-h,10,h,'#f4d29f');for(const y of [-h+13,-22])rect(c,-w-8,y,w*2+16,9,'#e6b87b');break;
  case 'barrel':rect(c,-w,-h,w*2,h,'#edaa66');rect(c,-w-2,-h+9,w*2+4,6,'#5e8a9c');rect(c,-w-2,-13,w*2+4,6,'#5e8a9c');c.fillStyle='#fff4bf';c.font='bold 20px sans-serif';c.textAlign='center';c.fillText('○',0,-h/2+8);break;
  case 'tires':for(let j=0;j<3;j++){rect(c,-w,-24*(j+1),w*2,22,'#34485e');c.strokeStyle='#9bb5c3';c.lineWidth=2;for(let x=-w+9;x<w;x+=13){c.beginPath();c.moveTo(x,-24*(j+1)+4);c.lineTo(x-5,-24*j-5);c.stroke();}}break;
  case 'scrap':rect(c,-w,-h+18,w*2,h-18,'#93acb5');rect(c,-w+7,-h,w*2-14,28,'#b7d4d8');for(const x of [-12,12]){rect(c,x-5,-h+8,10,7,'#e9faf0');}c.strokeStyle='#465b71';c.beginPath();c.moveTo(-12,-26);c.lineTo(12,-26);c.moveTo(-w,-h+35);c.lineTo(w,-5);c.stroke();break;
  case 'ice':c.fillStyle='#8ed9e8aa';c.beginPath();c.moveTo(-w,0);c.lineTo(-w,-h+12);c.lineTo(-4,-h);c.lineTo(w,-h+7);c.lineTo(w,0);c.closePath();c.fill();c.strokeStyle='#deffff';c.stroke();c.lineWidth=2;c.beginPath();c.moveTo(0,-h+8);c.lineTo(-8,-h*.6);c.lineTo(8,-h*.45);c.lineTo(-5,-12);c.stroke();break;
 }
 // Shape and symbol communicate resistance without relying on hue.
 c.fillStyle='#fff4c4';c.font='bold 13px sans-serif';c.textAlign='center';c.fillText(o.weight==='heavy'?'▲▲':o.weight==='medium'?'▲':'◇',0,-h-8);c.restore();
}
export function drawIntroSmash(c:C,r:Drive,reduced=false){
 const state=r.smash,visible=COURSE_SMASH.filter(o=>Math.abs(o.x-r.x)<1400);
 for(const o of visible){
  const y=terrainAt(o.x,r.track,r.bridges);c.save();c.translate(o.x,y);
  if(!state?.cleared.includes(o.id))obstacleArt(c,o);
  else if(state.last===o.id&&r.t-state.impactAt<.75){
   const age=Math.max(0,r.t-state.impactAt);c.globalAlpha=1-age/.75;
   if(!reduced)for(let i=0;i<8;i++){const a=i*Math.PI*2/8,dx=Math.cos(a)*(12+age*100),dy=-24+Math.sin(a)*age*65+age*age*85;rect(c,dx-4,dy-4,8,8,o.kind==='ice'?'#ceffff':i%2?'#d6aa79':'#ffe9a4');}
   c.fillStyle='#fff1b2';c.font='bold 20px sans-serif';c.textAlign='center';c.fillText('+'+o.reward+' ⬡',0,-o.height-17-(reduced?0:age*25));
  }
  c.restore();
 }
}
