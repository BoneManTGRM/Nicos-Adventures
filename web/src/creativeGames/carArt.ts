import {drawRunMarkers} from './runArt';
import {truckCamera} from './truckCamera';
import {rampArtPositions,coursePosition} from './courseLayout';
import {drawIntroSmash} from './smashArt';
import {PALETTES,PARTS} from './catalog';
import {carStats,has,terrainAt,waterGap,wheelPoints} from './carPhysics';
import type {Drive} from './save';
type C=CanvasRenderingContext2D;
const ink='#142039';
export function shape(c:C,points:number[][],fill:string,stroke=ink,width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(width){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
export function disk(c:C,x:number,y:number,r:number,fill:string,stroke=ink,width=3){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(width){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
export function box(c:C,x:number,y:number,w:number,h:number,fill:string,r=5,stroke=ink,width=3){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(width){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
export function line(c:C,x:number,y:number,xx:number,yy:number,color:string,width=3){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
export function star(c:C,x:number,y:number,r:number,color:string){const p=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,s=i%2?r*.45:r;return [x+Math.cos(a)*s,y+Math.sin(a)*s];});shape(c,p,color,color,0);}
export function wheelArt(c:C,id:number,x:number,y:number,r:number,angle=0){
 const p=PARTS[id-1]??PARTS[10],v=(id-11)%10;c.save();c.translate(x,y);c.rotate(angle);
 disk(c,0,0,r,'#0b1527',ink,3);disk(c,0,0,r*.81,v===2?'#8fcff4':'#28384a','#59697b',2);
 for(let i=0;i<12+(v%4)*2;i++){const a=i*Math.PI*2/(12+(v%4)*2);c.save();c.rotate(a);box(c,-r*.13,-r*.96,r*.26,r*.2,v===1?'#ff7549':v===2?'#d7f7ff':'#46576b',2,ink,1);c.restore();}
 disk(c,0,0,r*.64,'#b8d0dd',ink,2);disk(c,0,0,r*.58,p.color,ink,2);c.beginPath();c.arc(0,0,r*.7,-2.6,-.8);c.strokeStyle='#f1f8ff66';c.lineWidth=2;c.stroke();for(let i=0;i<5+v%3;i++){const a=i*Math.PI*2/(5+v%3);line(c,Math.cos(a)*r*.18,Math.sin(a)*r*.18,Math.cos(a)*r*.47,Math.sin(a)*r*.47,p.accent,r*.1);}
 disk(c,0,0,r*.18,'#e8f2f8',ink,2);disk(c,-r*.13,-r*.25,r*.07,'#ffffff','#ffffff',0);c.restore();
}
export function partArt(c:C,id:number,x:number,y:number,scale=1,t=0,paint?:number){
 if(!id)return;const p=PARTS[id-1];if(!p)return;const v=(id-1)%10;c.save();c.translate(x,y);c.scale(scale,scale);
 const material=p.group===7&&paint!==undefined?PALETTES[Math.max(0,Math.min(5,paint))]:null;
 const color=material?.[0]??p.color,accent=material?.[1]??p.accent,metal='#8294a7';
 switch(p.group){
 case 0:{const widths=[62,84,78,64,62,88,72,68,58,78],w=widths[v];shape(c,[[-w,-9],[-w+12,-20],[w-15,-20],[w,0],[w-5,12],[-w+3,12]],'#334c66');line(c,-w+12,-10,w-15,-10,color,8);for(let i=-1;i<=1;i++)disk(c,i*w*.65,3,4,'#b9cada',ink,1);if(v===7||v===9)line(c,-w*.55,-17,w*.55,-28,color,7);break;}
 case 1:wheelArt(c,id,0,0,32,t);break;
 case 2:{box(c,-24,-18,48,35,metal,5);for(let i=0;i<3;i++)box(c,-30+i*20,-28-(v%3)*2,14,13,'#435468',3);const glow=c.createRadialGradient(0,0,1,0,0,20);glow.addColorStop(0,accent);glow.addColorStop(1,color);disk(c,0,0,14,color,ink,2);c.fillStyle=glow;c.fill();if(v%2)shape(c,[[-2,-11],[8,-2],[1,0],[4,11],[-8,0],[-2,-1]],accent,accent,0);else star(c,0,0,8,accent);for(let i=0;i<3;i++)line(c,20,-8+i*7,28,-8+i*7,'#c5d3de',2);break;}
 case 3:{line(c,-25,24,25,-24,metal,10);line(c,-25,24,25,-24,ink,3);const pts=Array.from({length:11},(_,i)=>[-23+i*4.6+(i%2?7:-7),22-i*4.4]);c.beginPath();pts.forEach(([xx,yy],i)=>i?c.lineTo(xx,yy):c.moveTo(xx,yy));c.strokeStyle=color;c.lineWidth=6;c.stroke();disk(c,-25,24,7,accent);disk(c,25,-24,7,accent);if(v===8){line(c,-38,30,38,30,metal,5);disk(c,-38,30,8,color);disk(c,38,30,8,color);}break;}
 case 4:{if(v===7){box(c,-30,-14,60,28,'#718093',3);line(c,-17,-7,17,7,accent,4);}else if(v===8||v===9){box(c,-43,-8,86,16,metal,3);for(let i=0;i<6;i++)disk(c,-30+i*12,0,3,ink,ink,0);line(c,-25,-14,25,-14,color,4);}else{box(c,-32,-22,64,44,'#35485b',8);for(let j=0;j<(v===4?3:2);j++){const gx=-16+j*23;for(let i=0;i<8;i++){const a=i*Math.PI/4+t;line(c,gx+Math.cos(a)*8,Math.sin(a)*8,gx+Math.cos(a)*14,Math.sin(a)*14,color,5);}disk(c,gx,0,9,accent);disk(c,gx,0,3,ink,ink,0);}}break;}
 case 5:{if(v===4){c.beginPath();c.ellipse(0,2,47,28,0,Math.PI,Math.PI*2);c.strokeStyle=color;c.lineWidth=10;c.stroke();line(c,-45,2,45,2,metal,5);}else if(v===5||v===9){shape(c,[[-43,-8],[35,-8],[47,-19],[39,10],[-40,10]],color);line(c,-30,0,30,0,accent,3);}else if(v===7){line(c,-35,-13,22,17,metal,7);wheelArt(c,11,25,20,15,t);}else{shape(c,[[-30,-24],[21,-24],[40,-7],[28,19],[-30,19]],color);if(v===0||v===2)shape(c,[[10,-5],[47,-29],[32,12]],accent);else if(v===1){box(c,-13,-5,44,13,ink,3,ink,0);for(let i=0;i<4;i++)shape(c,[[-10+i*10,-6],[-5+i*10,3],[i*10,-6]],'#fff',ink,0);}else{line(c,-15,-12,19,-12,accent,4);line(c,-17,9,20,9,accent,4);}}break;}
 case 6:{if(v===0){box(c,-22,-16,44,32,color,5);disk(c,0,0,12,metal);line(c,12,0,42,0,accent,4);shape(c,[[42,0],[49,-9],[51,2],[45,7]],metal);}else if(v===1){for(let i=0;i<5;i++)box(c,-40+i*17,-12,15,25,'#ce9d69',2);line(c,-37,0,36,0,accent,3);}else if(v===2){box(c,-46,-10,92,25,'#72dbff',13);line(c,-30,-3,30,-3,'#e9fcff',3);}else if(v===3){disk(c,0,0,24,color);for(let i=0;i<6;i++){const a=t+i*Math.PI/3;line(c,0,0,Math.cos(a)*35,Math.sin(a)*35,accent,8);}}else if(v===4){shape(c,[[-54,5],[-18,-22],[0,-10],[18,-22],[54,5],[14,1],[0,16],[-14,1]],color);line(c,-35,0,35,0,accent,2);}else if(v===5){box(c,-20,-17,28,32,metal,5);disk(c,16,0,19,'#fff2a5',color,5);}else if(v===6){box(c,-33,-13,66,32,'#bd8a4c',3);line(c,-33,-3,33,-3,accent,4);box(c,-22,-27,35,22,'#f4cb78',3);line(c,-5,-26,-5,-5,'#846037',5);}else if(v===7){line(c,-40,0,25,0,metal,9);disk(c,30,0,11,color,ink,4);}else if(v===8){box(c,-38,-29,76,40,color,8);wheelArt(c,11,-25,18,17,t);wheelArt(c,11,25,18,17,t);disk(c,0,-30,14,accent);disk(c,6,-32,3,ink,ink,0);}else{line(c,-25,-23,0,9,metal,8);line(c,0,9,29,25,color,8);box(c,20,17,30,13,accent,4);}break;}
 case 7:{const roof=v===7?-49:v===4?-45:-37;shape(c,[[-54,8],[-54,-18],[-26,roof],[12,roof-2],[33,-17],[61,-7],[57,13],[-42,15]],color);shape(c,[[-24,roof+8],[8,roof+7],[24,-15],[-34,-15]],'#a8e8f5');line(c,-18,roof+11,-28,-18,'#e6faff',3);line(c,-43,5,43,5,accent,5);if(v===1||v===3)for(let i=0;i<4;i++)shape(c,[[-48+i*22,-19],[-39+i*22,-35-v%3*4],[-29+i*22,-17]],accent);if(v===2)shape(c,[[-8,roof],[0,roof-20],[13,roof]],accent);if(v===4)line(c,-7,roof,-7,8,accent,3);if(v===6)for(let i=0;i<3;i++)shape(c,[[28+i*8,-12],[34+i*8,-28],[40+i*8,-10]],accent);if(v===8)for(let i=0;i<3;i++)line(c,-45+i*28,1,-28+i*28,-8,'#4c8640',4);if(v===9)for(let i=0;i<4;i++)line(c,26+i*6,-9,22+i*6,-1,ink,2);disk(c,37,-8,5,'#fff4b0',ink,1);break;}
 case 8:{if([0,3,4,5].includes(v)){const p=v===3?[[0,9],[-4,-33],[30,-7],[27,9]]:[[-38,7],[-48,-25],[-14,-12],[0,-32],[15,-12],[44,-23],[35,7]];shape(c,p,color);line(c,-26,2,25,2,accent,3);}else if(v===1||v===6){c.beginPath();c.moveTo(-22,20);c.bezierCurveTo(-49,-30,40,-49,18,-9);c.strokeStyle=ink;c.lineWidth=15;c.stroke();c.strokeStyle=color;c.lineWidth=9;c.stroke();disk(c,19,-8,6,accent);}else if(v===9){disk(c,0,0,24,color,ink,4);disk(c,0,0,14,ink,accent,3);disk(c,Math.cos(t)*26,Math.sin(t)*26,4,accent,accent,0);}else{for(let i=0;i<2;i++){box(c,-25+i*29,-22,15,42,metal,4);disk(c,-17+i*29,-22,7,color,ink,2);if(v===2)shape(c,[[-23+i*29,-29],[-20+i*29,-45],[-16+i*29,-34],[-11+i*29,-44],[-10+i*29,-26]],accent,accent,0);else if(v===8)disk(c,-17+i*29,-34,10,'#eaf7ff','#b8c9e0',1);}}break;}
 case 9:{if(v<=4){box(c,-32,-4,64,10,metal,3);for(let i=0;i<(v===4?3:2);i++){const xx=v===4?-22+i*22:-18+i*36;disk(c,xx,-11,v===0?13:10,v===2?'#b0f2ff':'#fff4ac',color,4);disk(c,xx-3,-14,3,'#fff','#fff',0);}}else if(v===5){shape(c,[[-23,15],[-20,-18],[-5,-5],[4,-35],[14,-8],[29,-20],[20,15]],color);star(c,5,3,9,accent);}else if(v===6){shape(c,[[-35,12],[-29,-14],[26,-17],[37,12]],color);for(let i=0;i<5;i++)shape(c,[[-24+i*11,0],[-19+i*11,12],[-14+i*11,0]],accent,accent,0);}else if(v===7){box(c,-25,3,53,16,'#7eddbb',9);disk(c,-6,-9,20,color);disk(c,-6,-9,10,accent);disk(c,25,-4,12,'#8dedc5');line(c,22,-13,21,-24,ink,2);line(c,30,-13,33,-24,ink,2);disk(c,21,-24,4,'#fff');disk(c,33,-24,4,'#fff');}else if(v===8){shape(c,[[0,-30],[27,-15],[24,17],[0,30],[-24,17],[-27,-15]],color);disk(c,0,0,15,accent);disk(c,-5,-2,3,ink,ink,0);disk(c,6,-2,3,ink,ink,0);}else{box(c,-25,17,50,9,'#d5983b',2);line(c,0,17,0,-4,'#ffdd86',9);for(let i=0;i<10;i++){c.save();c.rotate(i*Math.PI/5);box(c,-5,-31,10,12,'#ffd66e',2,ink,2);c.restore();}disk(c,0,-4,22,'#f6c450');star(c,0,-4,12,'#fff1b2');}break;}
 }
 c.restore();
}
function driver(c:C,variant:number,t:number){const colors=['#a0ed6a','#b79aff','#7adfed','#ffb578'];disk(c,0,0,14,colors[variant],ink,2);shape(c,[[-11,-8],[-15,-20],[-3,-12]],colors[variant]);shape(c,[[4,-12],[15,-20],[12,-6]],colors[variant]);disk(c,-5,-2,4,'#fff',ink,1);disk(c,6,-2,4,'#fff',ink,1);disk(c,-3,-2,2,ink,ink,0);disk(c,7,-2,2,ink,ink,0);line(c,-4,6,5,7,ink,2);if(t<0)star(c,0,-28,7,'#ffdb7c');}
export function drawCar(c:C,r:Drive,studio=false){
 const b=r.build,s=carStats(b),color=PALETTES[b.paint][0];
 c.save();c.translate(r.x,r.y);c.rotate(r.a);c.translate(-s.comX,-s.comY);
 if(has(b,69)&&has(b,68)&&!r.broken.includes(16)){line(c,-s.width,5,-s.width-53,15,'#8ca7bd',6);partArt(c,69,-s.width-90,8,.82,r.x/30);}
 if(!r.broken.includes(12))partArt(c,b.parts[8],-s.width*.65,-37,.72,r.t);
 partArt(c,b.parts[0],0,7,s.width/64);box(c,-s.width*.72,-6,s.width*1.44,15,color,5,'#182c41',3);line(c,-s.width*.7,1,s.width*.7,1,'#f7ecd4',2);box(c,s.width*.82,-12,10,24,'#91b2bd',3);for(let i=0;i<3;i++)line(c,s.width*.82+2,-7+i*6,s.width*.82+8,-7+i*6,'#243b50',2);
 if(!r.broken.includes(14))partArt(c,b.parts[2],b.engineX*32,b.engineY*22-10,.55,r.t);
 if(!r.broken.includes(11))partArt(c,b.parts[7],-3,-15,s.width/70,r.t,b.paint);
 if(!r.ended){c.save();c.translate(-7,-48);driver(c,b.driver,r.t);c.restore();}
 if(!r.broken.includes(15))partArt(c,b.parts[5],s.width-8,-2,.7,r.t);
 if(!r.broken.includes(13))partArt(c,b.parts[9],8,-64,.62,r.t);
 for(const slot of [4,10])if(b.parts[slot])partArt(c,b.parts[slot],slot===4?-25:23,6,.33,r.t);
 if(!r.broken.includes(16))for(const slot of [6,11]){const id=b.parts[slot];if(!id||id===69||id===68)continue;if(id===67&&!r.cargo)continue;partArt(c,id,slot===6?-36:28,id===63?25:id===65?-65:-28,id===63?.9:.65,r.t);}
 c.restore();
 for(const w of wheelPoints(r)){if(r.broken.includes(w.i))continue;const actualY=studio?w.y:Math.min(w.y,terrainAt(w.x,r.track,r.bridges)-s.radius+3);const ax=r.x+Math.cos(r.a)*(w.lx*.78)-Math.sin(r.a)*(-s.comY),ay=r.y+Math.sin(r.a)*(w.lx*.78)+Math.cos(r.a)*(-s.comY);line(c,ax,ay,w.x,actualY,'#23394d',9);line(c,ax,ay,w.x,actualY,'#dce5f0',3);const dx=w.x-ax,dy=actualY-ay,len=Math.max(1,Math.hypot(dx,dy));c.beginPath();for(let i=0;i<9;i++){const t=i/8,off=i%2?4:-4,xx=ax+dx*t-dy/len*off,yy=ay+dy*t+dx/len*off;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.strokeStyle=PARTS[b.parts[3]-1].color;c.lineWidth=4;c.stroke();wheelArt(c,b.parts[1],w.x,actualY,s.radius,r.x/s.radius);}
 if(r.ended){c.save();c.translate(r.x+25,r.y-105);disk(c,0,0,29,'#d4f7ff88','#abecff',2);driver(c,b.driver,-1);c.restore();}
}
export function drawTrack(c:C,r:Drive,width:number,height:number,best:number,reduced=false){
 const cam=truckCamera(r,width,height),camera=cam.x,cy=cam.y,theme=r.track;
 const sky=c.createLinearGradient(0,0,0,height);sky.addColorStop(0,theme===2?'#13132f':theme===1?'#382346':'#142b46');sky.addColorStop(1,theme===2?'#3b2667':theme===1?'#eb9468':'#70b9b5');c.fillStyle=sky;c.fillRect(0,0,width,height);
 for(let layer=0;layer<3;layer++){const off=(camera*(.12+layer*.1))%300,cY=200+layer*38;c.beginPath();c.moveTo(-300,height);for(let x=-300;x<width+400;x+=70){const y=cY-Math.sin((x+off)*.012+layer)*38;c.lineTo(x-off,y);}c.lineTo(width+400,height);c.closePath();c.fillStyle=theme===2?['#2d244e','#42346a','#58437f'][layer]:theme===1?['#8b5e77','#b6737a','#d08672'][layer]:['#316171','#39787d','#438f88'][layer];c.fill();}
 if(theme!==2){disk(c,width-80,64,35,theme===1?'#ffd897':'#c6f3d4','#fff',0);for(let j=0;j<4;j++){const x=((j*240-camera*.15)%(width+180)+width+180)%(width+180)-70;box(c,x,68+(j%2)*32,95,15,'#e5ffff35',20,'#fff',0);}}
 c.save();c.translate(-camera,-cy);
 for(let cell=Math.max(0,Math.floor((camera-300)/2000));cell<Math.ceil((camera+width+400)/2000);cell++){
  const start=280+cell*2000;
  if(theme===2)for(let j=0;j<5;j++){const x=start+j*390+150,y=terrainAt(x,theme);shape(c,[[x-28,y],[x-18,y-55],[x,y-84],[x+23,y-32],[x+30,y]],j%2?'#a295ee':'#65c9d0','#d6bcff',2);line(c,x,y-73,x+6,y-6,'#ebd8ff',2);}
  else for(let j=0;j<4;j++){const x=start+j*450-80,y=terrainAt(x,theme);if(theme===0){line(c,x,y,x,y-63,'#304b45',9);shape(c,[[x-32,y-25],[x,y-93],[x+33,y-25]],'#316b65','#295958',2);shape(c,[[x-25,y-51],[x,y-108],[x+25,y-51]],'#52957b','#376e63',2);}else{line(c,x,y,x,y-48,'#476d60',10);line(c,x,y-20,x+22,y-30,'#476d60',9);line(c,x+22,y-30,x+22,y-46,'#476d60',9);}}
 }
 for(const x of rampArtPositions(camera,camera+width)){const y=terrainAt(x,theme);for(let j=0;j<4;j++)line(c,x-j*22,y+j*11,x-j*22,400,'#a47456',4);line(c,x-80,y+40,x+35,y,'#ffd493',6);}
 const left=Math.floor(camera/8)*8-16,right=camera+width+16;c.beginPath();c.moveTo(left,height+cy+100);for(let x=left;x<=right;x+=8)c.lineTo(x,terrainAt(x,theme,r.bridges));c.lineTo(right,height+cy+100);c.closePath();const dirt=c.createLinearGradient(0,300,0,600);dirt.addColorStop(0,theme===2?'#42345c':theme===1?'#b65f47':'#78644e');dirt.addColorStop(1,'#192237');c.fillStyle=dirt;c.fill();c.beginPath();for(let x=left;x<=right;x+=8)x===left?c.moveTo(x,terrainAt(x,theme,r.bridges)):c.lineTo(x,terrainAt(x,theme,r.bridges));c.strokeStyle=theme===2?'#ba99ee':theme===1?'#ffd5a0':'#b4e295';c.lineWidth=7;c.stroke();
 for(let x=left;x<right;x+=24){const y=terrainAt(x,theme,r.bridges);if(waterGap(x)&&!r.bridges.includes(Math.floor(((coursePosition(x)??x)-280)/2000))){box(c,x,347,25,18,'#73d5edb0',0,'#72e8fa',0);line(c,x,349,x+18,349,'#d1fcff',2);}}
 for(let x=Math.ceil(left/500)*500;x<right;x+=500){const y=terrainAt(x,theme,r.bridges);line(c,x,y,x,y-62,'#e4cba9',4);box(c,x-18,y-64,36,23,'#264658',5,'#8dc2c8',2);c.font='bold 12px sans-serif';c.textAlign='center';c.fillStyle='#fff';c.fillText(String(Math.max(0,Math.round((x-90)/12))),x,y-48);}
 if(best>0){const x=90+best*12,y=terrainAt(x,theme);line(c,x,y,x,y-86,'#fff0b5',4);shape(c,[[x,y-86],[x+44,y-76],[x,y-56]],'#ffc765','#fff0b5',2);star(c,x+13,y-74,6,'#fff8d9');}
 if(!reduced&&Math.abs(r.vx)>65&&r.contacts>0)for(let i=0;i<6;i++){const t=(r.t*2+i*.19)%1,x=r.x-70-t*60,y=terrainAt(x,theme)-4-t*18;disk(c,x,y,3+t*9,`rgba(238,203,143,${(1-t)*.26})`,ink,0);}
 if(r.rope>r.t){const post=Math.ceil((r.x+50)/500)*500;line(c,r.x+30,r.y,post,terrainAt(post,theme)-60,'#ffe8a7',3);}
 drawIntroSmash(c,r,reduced);drawRunMarkers(c,r,reduced);drawCar(c,r);for(const d of r.debris){c.save();c.translate(d.x,d.y);c.rotate(reduced?0:d.a);if(d.kind<3)wheelArt(c,d.id,0,0,d.r,d.a);else partArt(c,d.id,0,0,.6,r.t,r.build.paint);c.restore();}
 if(theme===2&&has(r.build,66)){c.globalCompositeOperation='screen';const glow=c.createLinearGradient(r.x+25,0,r.x+310,0);glow.addColorStop(0,'#ffe7ad55');glow.addColorStop(1,'#ffe7ad00');c.fillStyle=glow;c.beginPath();c.moveTo(r.x+25,r.y-35);c.lineTo(r.x+310,r.y-145);c.lineTo(r.x+310,r.y+60);c.closePath();c.fill();c.globalCompositeOperation='source-over';}
 c.restore();
}
