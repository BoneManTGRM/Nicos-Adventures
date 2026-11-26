import {drawTile,gardenVista} from './kingdomArtwork';
import {bells} from './kingdomDiscoveries';
import {box,disk,line,shape,star} from './carArt';
import {friendPosition,GROUND,magicPlatforms,padAt,PADS,type Ride} from './kingdomPhysics';
type C=CanvasRenderingContext2D;
export {loadUnicornArt} from './unicornSprite';
import {drawUnicornSprite,unicornMotion,type UnicornPose} from './unicornSprite';
export function unicornArt(c:C,x:number,y:number,t:number,color=0,direction=1,pose:UnicornPose='turn',reduced=false){
 return drawUnicornSprite(c,x,y,t,color,direction,pose,reduced);
}
export function creatureArt(c:C,x:number,y:number,id:number,rescued=false){
 const kind=Math.floor(id/3);
 if(drawTile(c,'friends',3,3,id,x-34,y-40,68,68))return;
 c.save();c.translate(x,y);const fill=['#dff6ff','#ffd9a1','#d9b4f5'][kind];if(rescued)c.globalAlpha=.55;
 disk(c,0,0,19,fill,'#6e6394',2);shape(c,[[-16,-7],[-18,-27],[-4,-16]],fill,'#6e6394',2);shape(c,[[5,-16],[18,-27],[16,-7]],fill,'#6e6394',2);
 if(kind===1){shape(c,[[-15,4],[-34,-10],[-31,13],[-13,15]],'#a7e4ce','#6e6394',2);shape(c,[[15,4],[34,-10],[31,13],[13,15]],'#a7e4ce','#6e6394',2);}if(kind===2){shape(c,[[-11,10],[0,21],[12,10]],'#fff3df','#fff',0);}
 disk(c,-7,-3,3,'#60567f','#60567f',0);disk(c,7,-3,3,'#60567f','#60567f',0);disk(c,0,5,3,'#dd87b8','#dd87b8',0);line(c,-3,10,3,10,'#73608a',1.5);c.restore();
}
// Width multiplier, top offset from the actual landing surface, and height.
const propMounts:Record<number,[number,number,number]>={
 1:[1,-12,47],2:[1.07,-11,37],3:[.85,-130,175],4:[1,-11,67],
 5:[1.05,-8,97],6:[1.1,-53,77],7:[1.1,-10,68],8:[1.08,-54,95],
 9:[1.15,-73,137],10:[.98,-95,100],11:[.94,-76,89],12:[1.1,-103,119],
};
export const propAspect=[1.75,1.69,.57,1.24,.99,.96,1.04,1.32,.92,1.06,.85,1.1];
export function magicArt(c:C,id:number,x:number,y:number,width=130,t=0){
 const mount=propMounts[id];
 if(mount&&drawTile(c,'magic',3,4,id-1,x-width*mount[0]/2,y+mount[1],width*mount[0],mount[2]))return;
 const ink='#5c668e';if(id===1||id===4){const rainbow=['#f28cb8','#ffb782','#ffe495','#9ce2bf','#8fcce9','#b5a1ec'];for(let i=0;i<6;i++)line(c,x-width/2,y+i*3,x+width/2,y+(id===4?32:0)+i*3,rainbow[i],4);line(c,x-width/2,y-6,x-width/2,y+20,'#fff2c9',4);line(c,x+width/2,y+(id===4?32:0)-6,x+width/2,y+(id===4?32:0)+20,'#fff2c9',4);}
 else if(id===2||id===6){box(c,x-width/2,y,width,18,'#d4ecf8',12,ink,2);disk(c,x-20,y+2,19,'#effaff','#d4ecf8',1);disk(c,x+2,y-4,24,'#f8fdff','#d4ecf8',1);disk(c,x+25,y+3,18,'#effaff','#d4ecf8',1);if(id===6){line(c,x,y-11,x,y-55,'#cdb176',3);shape(c,[[x,y-55],[x+34,y-27],[x,y-27]],'#f4bfdb',ink,1);}}
 else if(id===3){c.beginPath();c.moveTo(x,y+55);c.bezierCurveTo(x-22,y+10,x+21,y-75,x,y-130);c.strokeStyle='#61b78a';c.lineWidth=10;c.stroke();for(let i=0;i<7;i++){const yy=y+40-i*23,dir=i%2?-1:1;c.beginPath();c.ellipse(x+dir*15,yy,19,8,dir*.55,0,Math.PI*2);c.fillStyle=i%2?'#7bd3ab':'#b1e4ae';c.fill();}box(c,x-34,y,68,10,'#80c9ab',5,ink,1);}
 else if(id===5||id===7){line(c,x,y+15,x,y+95,'#75b797',7);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;c.beginPath();c.ellipse(x+Math.cos(a)*27,y+Math.sin(a)*9+4,18,9,a*.2,0,Math.PI*2);c.fillStyle=id===7?'#f4a4c8':'#c8b0f2';c.fill();c.strokeStyle='#a493ba';c.lineWidth=1;c.stroke();}box(c,x-40,y-3,80,12,id===7?'#ffcddb':'#e8d8ff',8,ink,2);disk(c,x,y+2,9,'#fff0a8','#d8bb75',1);}
 else if(id===8){for(let j=0;j<3;j++)shape(c,[[x-80+j*45,y-j*23],[x-30+j*45,y-j*23],[x-33+j*45,y+34],[x-60+j*45,y+54],[x-78+j*45,y+27]],j%2?'#b8dcf5':'#dac4f8',ink,2);}
 else if(id===9){line(c,x,y+14,x,y+125,'#bd916e',20);box(c,x-47,y-48,94,49,'#d4b2df',5,ink,2);shape(c,[[x-62,y-47],[x,y-88],[x+62,y-47]],'#99d9ca',ink,2);box(c,x-12,y-33,24,33,'#8779a9',10,ink,1);box(c,x-61,y,122,12,'#ecd1a2',4,ink,2);}
 else if(id===10){c.beginPath();c.ellipse(x,y-34,30,46,0,Math.PI,Math.PI*2);c.strokeStyle='#e5d3a3';c.lineWidth=12;c.stroke();line(c,x-30,y-34,x-30,y+3,'#e5d3a3',12);line(c,x+30,y-34,x+30,y+3,'#e5d3a3',12);disk(c,x,y-73,13,'#fff1b5','#a99bc5',2);star(c,x,y-33,10,'#d9c8fc');box(c,x-44,y,88,9,'#bca5db',5,ink,1);}
 else if(id===11){line(c,x,y+30,x,y-65,'#91ba95',5);disk(c,x,y-65,17,'#ffe5a5','#cab885',2);star(c,x,y-65,10,'#fffce2');box(c,x-42,y,84,10,'#b5d4b5',5,ink,1);}
 else if(id===12){box(c,x-43,y,86,18,'#bea6d9',8,ink,2);for(let i=0;i<5;i++){const xx=x+(i-2)*12;c.beginPath();c.moveTo(xx,y);c.quadraticCurveTo(x+(i-2)*28,y-140,x+(i-2)*36,y-20);c.strokeStyle=['#ebacd5','#e6c9fa','#b2dff7','#b5e8ce','#ffe6ac'][i];c.lineWidth=4;c.stroke();}for(let i=0;i<5;i++){const f=(t*.4+i*.21)%1;disk(c,x+Math.sin(i*5)*22,y-f*130,4,'#ecfaffaa','#fff',0);}}
}
const followers=new WeakMap<Ride,{x:number;y:number;t:number;id:number}>();
function follow(r:Ride,id:number,direction:number,reduced:boolean){
 const x=r.x-direction*62,y=r.y-20;
 const old=followers.get(r);
 if(!old||old.id!==id||Math.abs(old.x-x)>220||reduced){
  const start={x,y,t:r.t,id};followers.set(r,start);return start;
 }
 const blend=1-Math.exp(-Math.max(0,r.t-old.t)*8);
 old.x+=(x-old.x)*blend;old.y+=(y-old.y)*blend;old.t=r.t;
 return old;
}
function gardenWeather(c:C,island:number,width:number,height:number,camera:number,time:number,reduced:boolean,awakened:boolean){
 c.save();
 if(awakened){
  const crest=height*.04+(reduced?0:Math.sin(time*.5)*3);
  c.lineWidth=3;c.globalAlpha=.48;
  ['#ffbad6','#ffe69b','#a1f3cf','#9fddff','#d5baff'].forEach((color,i)=>{
   c.beginPath();c.moveTo(-12,height*.32+i*4);
   c.bezierCurveTo(width*.25,crest+i*4,width*.6,crest-height*.13+i*4,width+12,height*.2+i*4);
   c.strokeStyle=color;c.stroke();
  });
 }
 if(!reduced){
  for(let i=0;i<13;i++){
   const period=width+60, drift=island===1?time*13:time*3;
   const x=((i*113+drift-camera*.27)%period+period)%period-22;
   const y=island===1?(i*79+time*(9+i%3))%(height*.72):height*(.17+(i%6)*.094)+Math.sin(time*.8+i)*8;
   const phase=time*(.8+i%3*.23)+i;
   c.globalAlpha=.45+.27*Math.sin(phase);
   if(island===1){c.fillStyle=i%2?'#fff1db':'#ffb5ce';c.beginPath();c.ellipse(x,y,4.6,1.8,Math.sin(phase)*.9,0,Math.PI*2);c.fill();}
   else if(island===2){disk(c,x,y,2.6,'#9afbe9','',0);disk(c,x,y,5.4,'#a1ffe52b','',0);}
   else{star(c,x,y,2+Math.sin(phase),'#fff4cc');}
  }
 }
 c.restore();
}
export function gardenCamera(width:number,x:number,selected:number|null,island:number){
 const target=selected===null?x-width*.30:padAt(selected,island).x-width*.50;
 return Math.max(0,Math.min(2050-width,target));
}
export function gardenScale(width:number,height:number){
 return Math.min(Math.max(.72,Math.min(1.08,width/800)),height/407);
}
export function gardenOffset(height:number){return Math.max(0,(height-405)*.48);}
type RideArt={companion:number;bells:number[];sangAt:number};
export function drawKingdom(c:C,r:Ride,layout:number[],island:number,color:number,width:number,height:number,buildPad:number|null,reduced=false,details?:RideArt){
 const camera=gardenCamera(width,r.x,buildPad,island);
 if(!gardenVista(c,island,width,height,camera)){
 const sky=c.createLinearGradient(0,0,0,height);sky.addColorStop(0,['#8972b4','#837eaa','#292a58'][island]);sky.addColorStop(1,['#edc5d2','#f1cabb','#a29bc9'][island]);c.fillStyle=sky;c.fillRect(0,0,width,height);
 disk(c,width-72,70,32,'#ffeac1','#fff',0);if(island===2)disk(c,width-61,59,29,'#343361','#fff',0);
 for(let j=0;j<10;j++){const x=((j*173-camera*.16)%(width+80)+width+80)%(width+80);star(c,x,30+(j%4)*32,3+j%3,'#fff4d780');}
 for(let layer=0;layer<2;layer++){c.beginPath();c.moveTo(0,height);for(let x=0;x<width+30;x+=25)c.lineTo(x,245+layer*50-Math.sin((x+camera*.16)*.009+layer)*30);c.lineTo(width,height);c.closePath();c.fillStyle=layer?'#96b9bf66':'#b0a3ca77';c.fill();}
 }
 gardenWeather(c,island,width,height,camera,r.t,reduced,!!details&&[0,1,2].every(i=>details.bells.includes(island*3+i)));
 c.save();c.translate(-camera,gardenOffset(height));
 for(const [left,right]of GROUND){if(drawTile(c,'islands',1,3,island,left-3,330,right-left+6,82))continue;shape(c,[[left,335],[right,335],[right-15,370],[right-70,415],[left+60,410],[left+10,365]],'#a6a0be','#777b9f',2);box(c,left,328,right-left,17,'#bedbd0',9,'#86b6ac',2);for(let i=left+30;i<right;i+=52){line(c,i,330,i+5,307,'#77a995',3);disk(c,i+5,307,5,['#f2b8d4','#ffe1a3','#d9c6fc'][Math.floor(i)%3],'#d1aec4',1);}}
 // The start and finish gates are landmarks, not buttons that bypass gameplay.
 magicArt(c,10,65,327,90,0);magicArt(c,10,2010,327,90,0);star(c,2010,213,19,'#fff1b1');
 for(const p of magicPlatforms(layout,island,r.t)){if(p.id===0)continue;if(p.id===8){if(p.x!==padAt(p.pad,island).x-80)continue;const xy=padAt(p.pad,island);magicArt(c,8,xy.x,xy.y,130,r.t);}else magicArt(c,p.id,p.x+p.w/2,p.y,p.w,reduced?0:r.t);}
 if(buildPad!==null){PADS.forEach((_,i)=>{const p=padAt(i,island);c.setLineDash([5,5]);disk(c,p.x,p.y-28,i===buildPad?34:25,i===buildPad?'#fff1be22':'#fff7ff11',i===buildPad?'#fff0bc':'#eee4fa',2);c.setLineDash([]);c.font='bold 17px sans-serif';c.textAlign='center';c.fillStyle='#ffffff';c.fillText(String(i+1),p.x,p.y-23);});}
 for(let i=0;i<3;i++){
  const p=friendPosition(i,island);
  if(!r.found.includes(i)){
   creatureArt(c,p.x,p.y+(reduced?0:Math.sin(r.t*2+i)*3),island*3+i);
   star(c,p.x,p.y-49,6,'#fff0b5');
  }
 }
 if(buildPad===null && details){
  bells.forEach((x,i)=>{
   if(x<camera-50||x>camera+width+50)return;
   const open=details.bells.includes(island*3+i),pulse=reduced?0:Math.sin(r.t*2.4+i)*2;
   magicArt(c,11,x,334,50);
   disk(c,x+4,242+pulse,14,open?'#735681':'#443459','#ffe594',2);
   c.fillStyle='#fff1af';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText(open?'♫':'♪',x+4,248+pulse);
  });
 }
 if(buildPad===null){if(island===2&&layout.includes(11)){const glow=c.createRadialGradient(r.x,r.y-25,5,r.x,r.y-25,140);glow.addColorStop(0,'#fff6c938');glow.addColorStop(1,'#fff6c900');c.fillStyle=glow;c.fillRect(r.x-140,r.y-165,280,280);}const motion=unicornMotion(r);
  if(!reduced&&(motion.pose==='prance'||!r.grounded)){
   c.save();
   for(let i=0;i<8;i++){const p=(r.t*1.4+i/8)%1;c.globalAlpha=(1-p)*.75;
    star(c,r.x-motion.direction*(24+63*p),r.y-34+Math.sin(i*4+p*3)*9-3*p,2.8-p,['#ffd298','#9de9fb','#ffc8df'][i%3]);}
   c.restore();
  }
  if(details && details.companion>=0){
   const sway=reduced?0:Math.sin(r.t*4)*3;
   const companion=follow(r,details.companion,motion.direction,reduced);
   c.save();c.translate(companion.x,companion.y+sway);c.scale(.60,.60);
   creatureArt(c,0,-10,details.companion);c.restore();
  }
  unicornArt(c,r.x,r.y,reduced?0:r.t,color,motion.direction,motion.pose,reduced);
  const elapsed=r.t-(details?.sangAt??-100);
  if(elapsed>=0&&elapsed<1.2){
   c.save();c.globalAlpha=Math.min(1,(1.2-elapsed)*2);c.strokeStyle='#ffe5a4';c.lineWidth=2.5;
   if(!reduced){c.beginPath();c.ellipse(r.x,r.y-62,25+elapsed*92,16+elapsed*57,0,0,Math.PI*2);c.stroke();}
   c.font='bold 23px serif';c.fillStyle='#fff3bf';c.textAlign='center';
   for(let j=0;j<3;j++)c.fillText(j%2?'♫':'♪',r.x+(j-1)*24,r.y-105-(reduced?0:elapsed*24)-j*5);
   c.restore();
  }
 }
 else{const p=padAt(buildPad,island);unicornArt(c,p.x-72,Math.min(328,p.y-12),0,color);}
 c.restore();
}
