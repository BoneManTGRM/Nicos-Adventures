import {box,disk,line,shape,star} from './carArt';
import {friendPosition,GROUND,magicPlatforms,padAt,PADS,type Ride} from './kingdomPhysics';
type C=CanvasRenderingContext2D;
export {loadUnicornArt} from './unicornSprite';
import {drawUnicornSprite,unicornMotion,type UnicornPose} from './unicornSprite';
export function unicornArt(c:C,x:number,y:number,t:number,color=0,direction=1,pose:UnicornPose='turn',reduced=false){
 return drawUnicornSprite(c,x,y,t,color,direction,pose,reduced);
}
export function creatureArt(c:C,x:number,y:number,kind:number,rescued=false){
 c.save();c.translate(x,y);const fill=['#dff6ff','#ffd9a1','#d9b4f5'][kind];if(rescued)c.globalAlpha=.55;
 disk(c,0,0,19,fill,'#6e6394',2);shape(c,[[-16,-7],[-18,-27],[-4,-16]],fill,'#6e6394',2);shape(c,[[5,-16],[18,-27],[16,-7]],fill,'#6e6394',2);
 if(kind===1){shape(c,[[-15,4],[-34,-10],[-31,13],[-13,15]],'#a7e4ce','#6e6394',2);shape(c,[[15,4],[34,-10],[31,13],[13,15]],'#a7e4ce','#6e6394',2);}if(kind===2){shape(c,[[-11,10],[0,21],[12,10]],'#fff3df','#fff',0);}
 disk(c,-7,-3,3,'#60567f','#60567f',0);disk(c,7,-3,3,'#60567f','#60567f',0);disk(c,0,5,3,'#dd87b8','#dd87b8',0);line(c,-3,10,3,10,'#73608a',1.5);c.restore();
}
export function magicArt(c:C,id:number,x:number,y:number,width=130,t=0){
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
export function drawKingdom(c:C,r:Ride,layout:number[],island:number,color:number,width:number,height:number,buildPad:number|null,reduced=false){
 const camera=buildPad===null?Math.max(0,Math.min(2050-width,r.x-width*.3)):Math.max(0,Math.min(2050-width,padAt(buildPad,island).x-width*.5));
 const sky=c.createLinearGradient(0,0,0,height);sky.addColorStop(0,['#8972b4','#837eaa','#292a58'][island]);sky.addColorStop(1,['#edc5d2','#f1cabb','#a29bc9'][island]);c.fillStyle=sky;c.fillRect(0,0,width,height);
 disk(c,width-72,70,32,'#ffeac1','#fff',0);if(island===2)disk(c,width-61,59,29,'#343361','#fff',0);
 for(let j=0;j<10;j++){const x=((j*173-camera*.16)%(width+80)+width+80)%(width+80);star(c,x,30+(j%4)*32,3+j%3,'#fff4d780');}
 for(let layer=0;layer<2;layer++){c.beginPath();c.moveTo(0,height);for(let x=0;x<width+30;x+=25)c.lineTo(x,245+layer*50-Math.sin((x+camera*.16)*.009+layer)*30);c.lineTo(width,height);c.closePath();c.fillStyle=layer?'#96b9bf66':'#b0a3ca77';c.fill();}
 c.save();c.translate(-camera,0);
 for(const [left,right]of GROUND){shape(c,[[left,335],[right,335],[right-15,370],[right-70,415],[left+60,410],[left+10,365]],'#a6a0be','#777b9f',2);box(c,left,328,right-left,17,'#bedbd0',9,'#86b6ac',2);for(let i=left+30;i<right;i+=52){line(c,i,330,i+5,307,'#77a995',3);disk(c,i+5,307,5,['#f2b8d4','#ffe1a3','#d9c6fc'][Math.floor(i)%3],'#d1aec4',1);}}
 // The start and finish gates are landmarks, not buttons that bypass gameplay.
 magicArt(c,10,65,327,90,0);magicArt(c,10,2010,327,90,0);star(c,2010,213,19,'#fff1b1');
 for(const p of magicPlatforms(layout,island,r.t)){if(p.id===0)continue;if(p.id===8){if(p.x!==padAt(p.pad,island).x-80)continue;const xy=padAt(p.pad,island);magicArt(c,8,xy.x,xy.y,130,r.t);}else magicArt(c,p.id,p.x+p.w/2,p.y,p.w,reduced?0:r.t);}
 if(buildPad!==null){PADS.forEach((_,i)=>{const p=padAt(i,island);c.setLineDash([5,5]);disk(c,p.x,p.y-28,i===buildPad?34:25,i===buildPad?'#fff1be22':'#fff7ff11',i===buildPad?'#fff0bc':'#eee4fa',2);c.setLineDash([]);c.font='bold 17px sans-serif';c.textAlign='center';c.fillStyle='#ffffff';c.fillText(String(i+1),p.x,p.y-23);});}
 for(let i=0;i<3;i++){const p=friendPosition(i,island);creatureArt(c,p.x,p.y+(reduced?0:Math.sin(r.t*2+i)*3),island,r.found.includes(i));if(!r.found.includes(i))star(c,p.x,p.y-41,7,'#fff0b5');}
 if(buildPad===null){if(island===2&&layout.includes(11)){const glow=c.createRadialGradient(r.x,r.y-25,5,r.x,r.y-25,140);glow.addColorStop(0,'#fff6c938');glow.addColorStop(1,'#fff6c900');c.fillStyle=glow;c.fillRect(r.x-140,r.y-165,280,280);}const motion=unicornMotion(r);unicornArt(c,r.x,r.y,reduced?0:r.t,color,motion.direction,motion.pose,reduced);}
 else{const p=padAt(buildPad,island);unicornArt(c,p.x-72,Math.min(328,p.y-12),0,color);}
 c.restore();
}
