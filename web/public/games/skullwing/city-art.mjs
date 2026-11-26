import {cities} from './cities.mjs';
import {expansionPalettes} from './city-palettes.mjs';
import {drawCitySky} from './city-skies.mjs';
import {drawLandmark} from './landmark-art.mjs';
// Painted scenery uses repeating parallax plates. The moving details are drawn
// separately so a whole city block never needs to be repainted onto a cache.
const TAU = Math.PI * 2;
const TILE = 840;
const DEPTH = 260;
const palettes = [
  {
    sky: ['#14193c', '#483868', '#c06d87', '#ffba92'], sun: '#ffd0a5',
    hills: ['#6f5477', '#534c78', '#354461'], skyline: '#384361', skySide: '#2a3554',
    shore: '#253a50', sea: '#5d6e83', front: '#172e42', light: '#ffd795', neon: '#61eadf',
    roads: ['#303c51','#192b3c','#122130'], edge: '#b1a29d', outline: '#1a263c',
    faces: [['#777695','#464760'],['#718c9b','#354c69'],['#b08087','#715663'],['#858889','#4f596a'],['#7e8a9b','#4b5870']],
    glass: ['#152e46','#335265','#76b5c2','#ffd688'], trim: '#baa9a0', sign: '#ed6e78',
    signs: ['KITE','NORI','ONYX','MOON','TIDE','PORT','REX FM','NEON']
  }, {
    sky: ['#473455','#9c5862','#e99b73','#ffdc99'], sun: '#ffe8a6',
    hills: ['#c88474','#a56866','#7e565c'], skyline: '#705263', skySide: '#5b4556',
    shore: '#684959', sea: '#b9796b', front: '#493e49', light: '#ffe0a0', neon: '#77ebc5',
    roads: ['#6e5653','#46404a','#342d3b'], edge: '#d5a985', outline: '#3c303b',
    faces: [['#d39069','#936357'],['#b18b78','#735d5d'],['#d7a46d','#98705d'],['#ad8065','#785957'],['#c98b70','#94665c']],
    glass: ['#3f434b','#576062','#8eb4a9','#ffdc8a'], trim: '#edd1a1', sign: '#269486',
    signs: ['SOL','RADIO','OASIS','MESA','FARO','ORBIT','CACTUS','SOLAR']
  }, {
    sky: ['#10263f','#264c68','#6d94aa','#b3ccd0'], sun: '#e4fbeb',
    hills: ['#8ba5ba','#657e9e','#425c78'], skyline: '#405871', skySide: '#304760',
    shore: '#264357', sea: '#78a5b5', front: '#233c50', light: '#ffe8a1', neon: '#8bf4de',
    roads: ['#526677','#314859','#223747'], edge: '#c7d7d7', outline: '#213c4d',
    faces: [['#8199aa','#506979'],['#74909f','#435d78'],['#a89390','#725e6b'],['#7d9c9f','#4c727b'],['#aec0c1','#6e8895']],
    glass: ['#253c50','#426075','#86bec7','#ffe7a1'], trim: '#d7e5dd', sign: '#cd7686',
    signs: ['POLAR','NORTH','FJORD','HUSH','ICE','NOVA','RADAR','AURORA']
  }, ...expansionPalettes
];
const scenery = new Map();
const facades = new Map();
const harborPainting = typeof Image === 'function' ? new Image() : null;
if (harborPainting) harborPainting.src = new URL('./harbor.webp', import.meta.url).href;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const mod = (number, base) => ((number % base) + base) % base;
function hash(a, b = 0) {
  let n = Math.imul(a | 0, 0x45d9f3b) ^ Math.imul(b | 0, 0x27d4eb2d);
  n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d);
  return ((n ^ (n >>> 12)) >>> 0) / 4294967296;
}
function poly(c, points, color, stroke = null, weight = 1) {
  c.beginPath(); c.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
  c.closePath(); c.fillStyle = color; c.fill();
  if (stroke) { c.lineWidth = weight; c.strokeStyle = stroke; c.stroke(); }
}
function line(c, points, color, weight = 1) {
  c.beginPath(); c.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) c.lineTo(points[i], points[i + 1]);
  c.lineWidth = weight; c.strokeStyle = color; c.stroke();
}
function rect(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(x, y, w, h); }
function ellipse(c, x, y, rx, ry, color) {
  c.beginPath(); c.ellipse(x, y, Math.max(.05, rx), Math.max(.05, ry), 0, 0, TAU); c.fillStyle = color; c.fill();
}
function slope(c, x, y, width, height, a, b) {
  const g = c.createLinearGradient(x, y, x + width, y + height);
  g.addColorStop(0, a); g.addColorStop(1, b); return g;
}
function canvasOf(w, h) {
  const cv = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(w, h) : document.createElement('canvas');
  cv.width = w; cv.height = h; return cv;
}
function segment(c, x, y, x2, y2, color, width, count) {
  line(c, [x,y,x2,y2], color, width);
  for (let i = 0; i < count; i++) {
    const k = i / count, k2 = (i + 1) / count;
    line(c, [x+(x2-x)*k,y+(y2-y)*k-4,x+(x2-x)*k2,y+(y2-y)*k2+1],color,.85);
  }
  line(c, [x,y-5,x2,y2-5], color, 1.4);
}

function cloud(c, x, y, w, p, cold) {
  const h = w * .10;
  c.beginPath(); c.moveTo(x,y+h);
  c.bezierCurveTo(x+w*.06,y+h*.9,x+w*.04,y,x+w*.2,y+h*.2);
  c.bezierCurveTo(x+w*.32,y-h*1.2,x+w*.42,y-h*1.5,x+w*.53,y-h*.25);
  c.bezierCurveTo(x+w*.66,y-h*.9,x+w*.71,y-h*.25,x+w*.77,y);
  c.bezierCurveTo(x+w*.85,y-h*.1,x+w*.95,y+h*.7,x+w,y+h*.6);
  c.bezierCurveTo(x+w*.73,y+h*1.6,x+w*.3,y+h*.6,x,y+h); c.closePath();
  c.fillStyle = cold ? '#c7e2ea' : p.sun; c.fill();
}
function ridge(c, points, bottom, color) {
  poly(c, [points[0],bottom,...points,points[points.length - 2],bottom], color);
}
function farPlate(c, d, p) {
  if (d === 0) {
    for (let layer=0; layer<3; layer++) {
      const pts = [];
      for (let x=-8; x<=TILE+8; x+=8) {
        const t = TAU*x/TILE;
        pts.push(x,163+layer*13-14*Math.sin(3*t+layer)-9*Math.cos(7*t+layer*.7)-3*Math.sin(16*t));
      }
      ridge(c,pts,DEPTH,p.hills[layer]);
    }
    return;
  }
  if (d === 1) {
    ridge(c,[-5,173,27,165,42,145,80,143,89,128,142,126,160,145,178,147,190,162,250,158,264,138,299,138,317,126,358,124,374,141,401,144,430,167,472,168,493,143,534,139,552,117,617,120,646,153,676,161,710,149,725,132,775,129,792,152,823,163,848,172],DEPTH,p.hills[0]);
    const pts=[-5,186,33,180,57,162,87,160,99,145,132,145,154,169,180,176,211,173,240,181,277,177,296,154,329,153,347,134,366,133,374,151,388,153,405,179,443,180,468,166,483,163,493,151,529,150,544,173,577,177,619,166,644,145,689,146,699,158,718,160,739,180,784,176,815,181,846,185];
    ridge(c,pts,DEPTH,p.hills[1]);
    for(const [x,y,w] of [[101,145,29],[348,134,18],[494,151,34],[646,146,39]]) {
      poly(c,[x,y,x+w,y,x+w-5,y+8,x+7,y+9,x-5,y+24,x-14,y+25], '#c78974');
      line(c,[x-6,y+17,x+2,y+12,x+w-4,y+11],p.hills[0],1.8);
      line(c,[x+1,y+18,x+w-6,y+16],p.hills[0],1);
    }
    return;
  }
  for (let i=-1;i<9;i++){
    const x=i*115+19, top=107+hash(i,577)*51;
    const left=x-87, right=x+86;
    poly(c,[left,225,x-30,top+26,x-20,top+24,x,top,x+21,top+19,x+27,top+17,right,221],p.hills[0]);
    poly(c,[x,top,x+21,top+19,x+27,top+17,right,221,x+5,194,x-6,top+30],p.hills[1]);
    poly(c,[x-31,top+29,x-20,top+24,x,top,x+21,top+19,x+27,top+17,x+40,top+32,x+25,top+27,x+19,top+29,x+12,top+19,x+14,top+32,x+3,top+20,x-1,top+12,x-12,top+28,x-14,top+23], '#cfdae0');
  }
  const pts=[];
  for(let x=-8;x<=TILE+8;x+=8)pts.push(x,191-8*Math.sin(TAU*x/TILE*4)-6*Math.sin(TAU*x/TILE*7));
  ridge(c,pts,DEPTH,p.hills[2]);
}
function crane(c, x, y, scale, p) {
  c.save(); c.translate(x,y); c.scale(scale,scale);
  const ink=p.skySide;
  line(c,[-12,0,-2,-48,5,-48,11,0],ink,3);
  line(c,[-10,-9,7,-23,-6,-31,5,-41],ink,1.4);
  segment(c,-25,-44,57,-58,ink,1.6,10);
  line(c,[-19,-46,3,-64,50,-58],ink,1.2);
  rect(c,-9,-52,15,8,ink); rect(c,-22,-49,8,7,ink);
  line(c,[40,-54,40,-30,44,-30],ink,1);
  rect(c,35,-29,14,5,p.skyline);
  c.restore();
}
function observatory(c,x,y,s,p) {
  c.save();c.translate(x,y);c.scale(s,s);
  rect(c,-32,-18,64,18,p.skySide);
  c.beginPath();c.arc(0,-18,29,Math.PI,0);c.fillStyle=p.skyline;c.fill();
  poly(c,[-21,-37,-12,-43,11,-20,6,-18],p.skySide);
  line(c,[-30,-17,31,-17],p.light,1);
  rect(c,-35,-4,70,5,p.skySide);rect(c,-26,-12,4,4,p.light);rect(c,22,-12,3,4,p.light);
  c.restore();
}
function beacon(c,x,y,s,p) {
  c.save();c.translate(x,y);c.scale(s,s);
  poly(c,[-12,0,-6,-48,5,-48,10,0],p.skySide);
  poly(c,[-5,-46,4,-46,6,-35,-7,-33],p.trim);
  rect(c,-8,-54,14,7,p.light);rect(c,-10,-48,19,3,p.skySide);
  poly(c,[-11,-55,0,-63,10,-55],p.skySide);rect(c,-1,-65,1.5,4,p.skySide);
  c.restore();
}
function skylinePlate(c,d,p) {
  for(let i=0;i<43;i++){
    const x=i*(TILE/43), w=10+hash(i,d+10)*20;
    const h=(d===1?12:17)+hash(i,115+d)*(d===0?47:27);
    const y=209-h;
    rect(c,x,y,w,h,p.skyline); rect(c,x+w*.73,y+2,w*.27,h-2,p.skySide);
    if(i%3===0)rect(c,x+3,y-4,w*.5,5,p.skyline);
    if(i%7===0)line(c,[x+w*.5,y,x+w*.5,y-12],p.skySide,1.2);
    for(let row=0;row<Math.floor(h/6);row++)for(let col=0;col<Math.floor(w/5);col++)if(hash(i*397+row,col)>.62){
      rect(c,x+2+col*5,y+3+row*6,1.5,1.5,(row+col)%4===0?p.light:p.hills[0]);
    }
  }
  if(d===0) {
    crane(c,107,211,.82,p);crane(c,180,211,.62,p);crane(c,676,211,.9,p);
    const x=432,y=177,r=29;
    c.beginPath();c.arc(x,y,r,0,TAU);c.strokeStyle=p.skySide;c.lineWidth=2.2;c.stroke();
    c.beginPath();c.arc(x,y,r-4,0,TAU);c.strokeStyle=p.hills[1];c.lineWidth=1;c.stroke();
    for(let i=0;i<14;i++){
      const ang=i*TAU/14;
      const xx=x+Math.cos(ang)*r,yy=y+Math.sin(ang)*r;
      line(c,[x,y,xx,yy],p.skySide,1);rect(c,xx-2,yy+1,4,3,i%3?p.skySide:p.light);
    }
    line(c,[x-15,212,x,174,x+15,212],p.skySide,2.5);
    // An elevated bridge gives the distant district a continuous recognizable contour.
    const deck=206;
    rect(c,259,deck,118,3,p.skySide);
    for(const tower of [275,351]){
      line(c,[tower,deck+5,tower,deck-22,tower+3,deck-22,tower+3,deck+5],p.skySide,1.4);
    }
    c.beginPath();c.moveTo(258,deck);c.quadraticCurveTo(269,deck-8,276,deck-22);
    c.quadraticCurveTo(313,deck+7,352,deck-22);c.quadraticCurveTo(362,deck-6,379,deck);
    c.strokeStyle=p.skySide;c.lineWidth=1.4;c.stroke();
  } else if(d===1) {
    observatory(c,137,205,.95,p);observatory(c,611,209,.65,p);
    for(const x of [267,285,492,718,728]) {
      const y=211;
      line(c,[x,y,x,y-19],p.skySide,3);
      line(c,[x,y-9,x-5,y-11,x-5,y-15],p.skySide,2.1);
      line(c,[x,y-12,x+5,y-13,x+5,y-18],p.skySide,2);
    }
    for(let i=0;i<5;i++) {
      const x=341+i*19;
      poly(c,[x,200,x+4,193,x+18,193,x+15,200],p.skySide);
      line(c,[x+9,199,x+9,210],p.skySide,1.6);
    }
  } else {
    beacon(c,154,211,1,p);beacon(c,691,214,.6,p);
    for(let i=0;i<27;i++) {
      const x=216+i*8.5, h=7+hash(i,108)*15;
      poly(c,[x-4,211,x,211-h,x+4,211],p.skySide);
    }
  }
  rect(c,0,210,TILE,5,p.shore);
  const y=215;rect(c,0,y,TILE,DEPTH-y,slope(c,0,y,0,40,p.sea,p.front));
  for(let i=0;i<127;i++){
    const x=hash(i,440)*TILE, yy=y+hash(i,280)*29;
    rect(c,x,yy,2+hash(i,340)*13,.6,i%4===0?p.light:p.skyline);
  }
  for (let i=0;i<16;i++){
    const x=i*53;
    line(c,[x,251,x,242],p.front,2);
    line(c,[x,244,x+53,244],p.shore,1);
    if(i%4===0)rect(c,x-1,241,2,1,p.light);
  }
  rect(c,0,250,TILE,10,p.front);
}
function getPlate(d, layer) {
  const key=d+':'+layer;
  if(scenery.has(key))return scenery.get(key);
  const res=1.4, cv=canvasOf(Math.ceil(TILE*res),Math.ceil(DEPTH*res));
  const c=cv.getContext('2d'); c.scale(res,res);
  if(layer===0)farPlate(c,d,palettes[d]);else skylinePlate(c,d,palettes[d]);
  scenery.set(key,cv);return cv;
}
function tilePlate(c,img,width,y,scroll){
  const start=-mod(scroll,TILE);
  for(let x=start;x<width;x+=TILE)c.drawImage(img,x,y,TILE+.25,DEPTH);
}
function showAurora(c,width,ground,camera,t) {
  c.save();
  for(let band=0;band<3;band++){
    const yy=ground*.23+band*8;
    const g=c.createLinearGradient(0,yy-26,0,yy+21);
    g.addColorStop(0,'rgba(118,250,219,0)');g.addColorStop(.5,band===1?'rgba(157,177,255,.14)':'rgba(104,244,211,.16)');g.addColorStop(1,'rgba(102,240,196,0)');
    c.beginPath();
    const wave=x=>yy+11*Math.sin(x*.014+camera*.001+t*.12+band*.6)+5*Math.sin(x*.038-band*.8);
    c.moveTo(-12,wave(-12)-10);
    for(let x=-12;x<=width+14;x+=12)c.lineTo(x,wave(x)-10);
    for(let x=width+14;x>=-12;x-=12)c.lineTo(x,wave(x)+11+5*Math.cos(x*.055));
    c.closePath();c.fillStyle=g;c.fill();
  }
  c.restore();
}
function blimp(c,x,y,d,p) {
  c.save();c.translate(x,y);
  poly(c,[-15,-1,-23,-6,-21,-1,-24,4,-14,2],p.skySide);
  ellipse(c,0,0,19,6,d===1?'#b47050':'#bb8b8b');
  c.beginPath();c.ellipse(0,0,18.5,5.5,0,Math.PI,TAU);c.fillStyle=d===1?'#f1b978':'#eab8a4';c.fill();
  line(c,[-15,0,15,0],p.skySide,.8);line(c,[-4,4,-2,8,4,8,6,4],p.skySide,1);rect(c,-3,7,8,3,p.skySide);
  c.restore();
}

export function drawBackdrop(c,view) {
  const {district=0,width,height,ground,camera=0,time=0,reduced=false}=view;
  const d=palettes[district]?district:0, p=palettes[d], t=reduced?0:time;
  c.save();
  if(cities[d].painting){drawCitySky(c,view,cities[d],p);c.restore();return;}
  if(d===0 && harborPainting?.complete && harborPainting.naturalWidth) {
    const w=harborPainting.naturalWidth,h=harborPainting.naturalHeight;
    const scale=Math.max((width+52)/w,ground/h);
    const margin=w*scale-width;
    const pan=Math.min(margin, Math.max(0, margin*.26 + camera*.10));
    c.drawImage(harborPainting,-pan,ground-h*scale,w*scale,h*scale);
    const x=mod(287+t*3-camera*.12,765)-24;
    for(let bx=x;bx<width+25;bx+=765)blimp(c,bx,ground*.42+Math.sin(t*.34)*1.3,d,p);
  } else {
  const sky=c.createLinearGradient(0,0,0,Math.max(ground,50));
  p.sky.forEach((s,i)=>sky.addColorStop([0,.44,.78,1][i],s));
  rect(c,0,0,width,height,sky);
  const orbX=width*.69+Math.sin(camera*.00085)*width*.10, orbY=Math.max(25,ground*.27),radius=d===1?23:15;
  const glow=c.createRadialGradient(orbX,orbY,3,orbX,orbY,radius*4.1);
  glow.addColorStop(0,d===2?'rgba(222,249,224,.26)':'rgba(255,193,145,.3)');
  glow.addColorStop(1,'rgba(255,202,135,0)');
  rect(c,orbX-radius*4.2,orbY-radius*4.2,radius*8.4,radius*8.4,glow);
  ellipse(c,orbX,orbY,radius,radius,p.sun);
  if(d===0){ellipse(c,orbX+3,orbY-5,2.6,2.1,'#f0bdab');ellipse(c,orbX-5,orbY+3,1.4,1.2,'#edb5a2');}
  if(d!==1){
    for(let i=0;i<30;i++){
      const x=mod(hash(i,528)*760-camera*.028,760),y=(.045+.44*hash(i,853))*ground;
      c.globalAlpha=.30+.38*(.5+.5*Math.sin(t*.67+i));
      for(let xx=x;xx<width;xx+=760)rect(c,xx,y,i%7===0?1.7:.9,i%7===0?1.7:.9,p.sun);
    }c.globalAlpha=1;
  }
  if(d===2)showAurora(c,width,ground,camera,t);
  c.globalAlpha=d===2?.14:.16;
  for(let i=0;i<7;i++){
    const x=mod(i*143+t*(1+i*.11)-camera*.06,1050)-105;
    for(let xx=x;xx<width;xx+=1050)cloud(c,xx,ground*(.18+.35*hash(i,624)),48+hash(i,71)*70,p,d===2);
  }
  c.globalAlpha=1;
  const plateY=ground-DEPTH+5;
  tilePlate(c,getPlate(d,0),width,plateY,-18+camera*.18);
  if(d!==2){
    const bx=mod(235+t*3.3-camera*.23,730)-30,by=ground*.37+Math.sin(t*.36)*1.3;
    for(let x=bx;x<width+29;x+=730)blimp(c,x,by,d,p);
  }
  tilePlate(c,getPlate(d,1),width,plateY,camera*.34);
  }
  if(d===0 || d===2){
    // Short moving glints and a ferry give the water a separate rate of motion.
    for(let i=0;i<11;i++){
      const x=mod(i*71-camera*.35+t*(i%2?2:-2),760);
      for(let xx=x;xx<width;xx+=760){
        c.globalAlpha=.35;rect(c,xx,ground-34+i%8,4+.9*Math.sin(t+i),.8,p.light);
      }
    }c.globalAlpha=1;
    const bx=mod(180+t*5-camera*.38,850)-43, by=ground-30+Math.sin(t*.8)*.45;
    for(let x=bx;x<width+44;x+=850){
      poly(c,[x,by,x+29,by,x+24,by+5,x+5,by+5],p.skySide);
      rect(c,x+6,by-4,14,4,p.trim);rect(c,x+10,by-7,6,3,p.shore);
      rect(c,x+8,by-3,3,1.4,p.glass[0]);rect(c,x+13,by-3,3,1.4,p.glass[0]);
      line(c,[x-11,by+5,x+1,by+5],p.trim,.65);
    }
  } else{
    // A solar tram glides along the ridge on the last span into town.
    const track=ground-39;
    rect(c,0,track,width,2,p.front);
    const bx=mod(183+t*12-camera*.34,690)-50;
    for(let x=bx;x<width+50;x+=690){
      poly(c,[x,track-1,x+4,track-8,x+35,track-8,x+43,track-3,x+43,track-1],p.trim);
      for(let i=0;i<6;i++)rect(c,x+5+i*5,track-7,3.5,2.5,p.skySide);
    }
  }
  c.restore();
}

export function drawStreet(c,{district=0,width,height,ground,camera=0,time=0,reduced=false}) {
  const d=palettes[district]?district:0,p=palettes[d],depth=Math.max(1,height-ground);
  c.save();
  const g=c.createLinearGradient(0,ground,0,height);
  g.addColorStop(0,p.roads[0]);g.addColorStop(.42,p.roads[1]);g.addColorStop(1,p.roads[2]);
  rect(c,0,ground,width,depth,g);
  rect(c,0,ground-2,width,4,p.edge);
  rect(c,0,ground+2,width,1.4,p.front);
  rect(c,0,ground+5,width,2.2,p.shore);
  for(let i=Math.floor(camera/37)-1;i<Math.ceil((camera+width)/37)+1;i++) {
    const x=i*37-camera;
    line(c,[x,ground-1,x+2.2,ground+2.6],p.roads[1],1);
    if(i%3===0){rect(c,x,ground+4,3,1,p.edge);rect(c,x+8,ground+4,3,1,p.edge);}
  }
  const laneY=ground+Math.min(depth*.34,23);
  c.globalAlpha=.42;
  for(let x=-mod(camera,80);x<width;x+=80)poly(c,[x,laneY,x+26,laneY,x+26.7,laneY+1.6,x+.6,laneY+1.6],p.trim);
  c.globalAlpha=1;
  for(let i=Math.floor(camera/78)-1;i<Math.ceil((camera+width)/78)+1;i++) {
    const x=i*78-camera;
    if(mod(i,3)===1){
      const py=ground+8;
      poly(c,[x,py,x+16,py,x+19,py+3,x+2,py+3],p.outline);
      for(let j=0;j<6;j++)line(c,[x+2+j*2.4,py+.7,x+3+j*2.4,py+2.4],p.edge,.55);
    } else if(mod(i,4)===2){
      ellipse(c,x+42,laneY+11,11,2.9,p.roads[0]);
      line(c,[x+34,laneY+11,x+50,laneY+11],p.roads[2],.7);
      line(c,[x+39,laneY+9.9,x+45,laneY+12],p.roads[2],.65);
    }
    for(let j=0;j<4;j++){
      const y=ground+9+hash(i,j+3)*Math.min(50,depth-5);
      const xx=x+hash(i*7,j+60)*65;
      c.globalAlpha=.26;line(c,[xx,y,xx+2+hash(i,j+32)*6,y+.5],p.trim,.65);c.globalAlpha=1;
    }
    if(d===2 && i%2===0){
      c.globalAlpha=.55;
      poly(c,[x+2,ground,x+9,ground-1.8,x+24,ground-1,x+27,ground+1,x+20,ground+2,x+10,ground+1],p.trim);
      c.globalAlpha=1;
    }
    if(d===0 && i%2===0){
      const t=reduced?0:time;
      c.globalAlpha=.20;
      const py=laneY+5+hash(i,45)*10;
      for(let n=0;n<4;n++){
        const dx=Math.sin(t*.8+n)*.8;
        rect(c,x+28+n*1.2+dx,py+n*1.6,8-n,1,n%2===0?p.neon:p.sign);
      }c.globalAlpha=1;
    }
  }
  // Down-stage curb and crosswalk remain low enough to keep the monster readable.
  if(depth>37) {
    const y=ground+depth*.79;
    rect(c,0,y,width,2.5,p.roads[0]);rect(c,0,y+2.5,width,2,p.roads[2]);
    for(let i=Math.floor(camera/450)-1;i<Math.ceil((camera+width)/450)+1;i++){
      const x=i*450+112-camera;
      c.globalAlpha=.38;
      for(let j=0;j<6;j++){
        const top=ground+8+j*(y-ground-8)/6;
        poly(c,[x+j*2,top,x+13+j*2,top,x+14+j*2,top+2,x+1+j*2,top+2],p.trim);
      }c.globalAlpha=1;
    }
  }
  c.restore();
}

function windowPane(c,x,y,w,h,material,p,damaged,seed) {
  rect(c,x-1,y-1,w+2,h+2,p.outline);
  rect(c,x,y,w,h,material);
  if(damaged) {
    poly(c,[x,y,x+w*.65,y,x+w*.28,y+h*.36,x+w*.48,y+h*.5,x,y+h*.85],p.glass[0]);
    line(c,[x+w*.65,y,x+w*.28,y+h*.36,x+w*.48,y+h*.5],p.trim,.55);
  } else if(seed>.42){
    c.globalAlpha=.40;
    line(c,[x+w*.62,y+.3,x+.8,y+h*.59],p.trim,.62);
    c.globalAlpha=1;
  }
  rect(c,x-1,y+h,w+2,1,p.trim);
}
function lightBox(c,x,y,w,h,text,p,reverse=false) {
  if(w<12||h<5)return;
  const fill=reverse?p.outline:p.sign;
  rect(c,x+1.2,y+1.7,w,h,p.outline);
  rect(c,x,y,w,h,p.outline);rect(c,x+1,y+1,w-2,h-2,fill);
  rect(c,x+2,y+1,w-4,.55,reverse?p.neon:p.trim);
  c.save();c.fillStyle=reverse?p.neon:'#ffead0';c.font='bold '+Math.max(4,h*.72)+'px system-ui,sans-serif';
  c.textBaseline='middle';c.textAlign='center';c.fillText(text,x+w/2,y+h*.51,w-4);c.restore();
}
function equipment(c,x,y,w,p,d) {
  rect(c,x,y-6,w,6,p.skySide);
  rect(c,x+1,y-6,w-2,1,p.trim);
  for(let i=0;i<Math.floor((w-3)/3);i++)rect(c,x+2+3*i,y-4,1,2.8,p.outline);
  if(d===2)rect(c,x-1,y-7,w+2,1.6,'#dbe8df');
}
function towerTank(c,x,y,s,p,d) {
  c.save();c.translate(x,y);c.scale(s,s);
  line(c,[-7,0,-5,-10,5,-10,7,0],p.outline,1.3);
  line(c,[-6,0,5,-9],p.outline,.8);
  rect(c,-8,-20,16,11,p.roads[0]);
  poly(c,[-9,-20,-2,-26,3,-26,9,-20],d===2?p.trim:p.glass[1],p.outline,.8);
  for(let i=-6;i<7;i+=3.2)line(c,[i,-19,i,-10],p.glass[1],.6);
  line(c,[-8,-18,8,-18],p.trim,1);line(c,[-8,-11,8,-11],p.trim,.8);
  c.restore();
}
function antenna(c,x,y,h,p) {
  line(c,[x,y,x,y-h],p.outline,1.3);
  line(c,[x-3,y-h*.42,x+4,y-h*.42],p.trim,.8);
  line(c,[x-4,y-h*.62,x+3,y-h*.62],p.outline,.8);
  rect(c,x-.8,y-h-1,1.6,1.8,p.sign);
}
function roof(c,d,k,seed,x,y,w,p,face,side) {
  const top=y, sideW=Math.min(15,w*.16);
  poly(c,[x,top,x+sideW*.45,top-4,x+w-sideW*.28,top-4,x+w,top,x+w-sideW,top+2,x,top+2],side,p.outline,1.1);
  line(c,[x+1,top,x+w-sideW,top,x+w-1,top-2],p.trim,1.4);
  if(d===2)line(c,[x+1,top-1,x+w*.23,top-1.5,x+w*.38,top-1,x+w*.55,top-2], '#e1ece5',1.8);
  if(k===3){
    towerTank(c,x+w*.27,top-2,Math.min(1,w/76),p,d);
    const cx=x+w*.72;
    poly(c,[cx-5,top-1,cx-3,top-19,cx+2,top-19,cx+4,top-1],face,p.outline,1);
    rect(c,cx-4,top-20,8,2,p.trim);rect(c,cx-3,top-14,5.8,2,p.sign);
  }else if(k===4){
    const cx=x+w*.48,ew=Math.min(w*.43,43);
    for(let i=0;i<3;i++){
      const tier=ew*(1-i*.23), yy=top-i*4.5;
      rect(c,cx-tier/2,yy-5,tier,5,i%2?side:face);
      poly(c,[cx-tier*.55,yy-4,cx-tier*.42,yy-7,cx+tier*.42,yy-7,cx+tier*.55,yy-4],p.glass[1],p.outline,.7);
      line(c,[cx-tier*.5,yy-4,cx+tier*.52,yy-4],p.trim,.7);
    }
    antenna(c,cx,top-15,15,p);
  }else{
    equipment(c,x+5,top-2,Math.min(w*.22,19),p,d);
    if(k===1) {
      poly(c,[x+w*.43,top-1,x+w*.52,top-17,x+w*.66,top-19,x+w*.66,top-1],p.glass[1],p.outline,1);
      antenna(c,x+w*.63,top-16,10,p);
    }else if(seed%2===0)antenna(c,x+w*.72,top-2,10+(seed%5),p);
    else equipment(c,x+w*.56,top-2,w*.17,p,d);
  }
}
function neighborhood(c,d,k,seed,x,y,w,p) {
  if(d===1 && (k===0||k===2||k===3)) {
    // Glazed solar tiles and stucco cornices belong to the mesa skyline.
    const sx=x+w*.40, length=Math.min(25,w*.27);
    line(c,[sx+1,y-1,sx+3,y-6,sx+length-3,y-6,sx+length-4,y-1],p.outline,1.1);
    poly(c,[sx,y-5,sx+5,y-11,sx+length+4,y-11,sx+length,y-5],p.glass[1],p.outline,.9);
    for(let i=1;i<4;i++)line(c,[sx+length*i/4,y-5,sx+4+length*i/4,y-10.5],p.glass[2],.65);
    line(c,[sx+3,y-8,sx+length+2,y-8],p.glass[2],.65);
    if(k!==3)for(let i=0;i<4;i++) {
      const xx=x+3+i*(w*.72)/4;
      rect(c,xx,y+2,3,2.8,p.trim);rect(c,xx+2,y+3.8,2,1.4,p.outline);
    }
  }
  if(d===2) {
    const width=w*.75;
    c.beginPath(); c.moveTo(x,y);
    c.bezierCurveTo(x+width*.2,y-2.6,x+width*.35,y-1.6,x+width*.49,y-1.8);
    c.bezierCurveTo(x+width*.72,y-4,x+width*.88,y-3.5,x+width,y-.6);
    c.lineTo(x+width,y+.7);c.lineTo(x,y+1.1);c.closePath();c.fillStyle='#d5e3e4';c.fill();
    for(let j=0;j<5;j++){
      const xx=x+width*hash(j,seed+201);
      poly(c,[xx,y+.4,xx+1.8,y+.4,xx+.5,y+2.6+hash(j,seed)*3.3],'#c6dadd');
    }
  }
}
function movingRooftops(c,b,d,p,time,reduced) {
  const {w,h,seed}=b, k=mod(b.kind|0,5), y=-h;
  const t=reduced?seed*.001:time+seed*.001, wind=Math.sin(t*2.8+seed);
  if(k===3){
    const sx=-w*.5+w*.72, top=y-21;
    for(let i=0;i<3;i++){
      const f=mod(t*.40+i/3,1);
      c.globalAlpha=(1-f)*.30;
      ellipse(c,sx+3.5*f+Math.sin(6*f+t*.5)*2*f,top-f*17,1.5+f*3.2,1.6+f*2.2,d===2?'#d2e4e5':p.trim);
    }c.globalAlpha=1;
  }
  if(k===4||((seed%3)===0&&k===0)){
    const sx=-w*.5+w*.82,top=y-14;
    line(c,[sx,y-2,sx,top-1.5],p.outline,1.1);
    c.beginPath();c.moveTo(sx,top);c.bezierCurveTo(sx+3,top-2+wind,sx+7,top+2.2-wind,sx+11,top+wind*.9);
    c.lineTo(sx+10,top+3.8+wind*.7);c.bezierCurveTo(sx+6,top+6-wind,sx+2,top+2+wind,sx,top+4);
    c.closePath();c.fillStyle=d===2?p.neon:p.sign;c.fill();
    rect(c,sx-.8,top-1.5,1.6,1.4,p.light);
  }
  if(d===0&&k===0){
    const left=-w/2+2,span=w*.76;
    c.beginPath();c.moveTo(left,y+4);c.quadraticCurveTo(left+span*.48,y+13,left+span,y+5);
    c.strokeStyle=p.outline;c.lineWidth=.75;c.stroke();
    for(let i=1;i<=4;i++){
      const f=i/5, xx=left+f*span+Math.sin(t*1.7+f)*.4, yy=y+4.5+17*f*(1-f);
      ellipse(c,xx,yy+1.8,1.6,2.1,i%2?p.sign:p.light);
      rect(c,xx-1,yy-.3,2,.9,p.outline);
    }
  }
}
function makeFacade(b,d,damage) {
  const w=Math.max(8,b.w),h=Math.max(12,b.h),k=mod(b.kind|0,5),seed=b.seed|0,p=palettes[d];
  const pad=9,head=42,cv=canvasOf(Math.ceil((w+2*pad)*1.7),Math.ceil((h+head+3)*1.7)),c=cv.getContext('2d');
  c.scale(1.7,1.7);c.translate(w/2+pad,h+head);
  c.lineJoin='round';c.lineCap='butt';
  const x=-w/2, y=-h,sw=Math.max(6,w*.15),fw=w-sw;
  const [face,side]=p.faces[k], label=p.signs[mod(seed,p.signs.length)];
  // Wall planes taper toward the roof, keeping the street silhouette legible.
  rect(c,x,y,fw,h,slope(c,0,y,0,h,face,side));
  poly(c,[x+fw,y,x+w,y-3,x+w,-3,x+fw,0],side,p.outline,1.2);
  c.strokeStyle=p.outline;c.lineWidth=1.5;c.strokeRect(x+.5,y+.5,fw-1,h-1);
  for(let band=0;band<Math.floor((h-9)/9);band++){
    const yy=y+7+band*9;
    if(k!==1){
      line(c,[x+2,yy,x+fw-.5,yy],side,.55);
      if(band%2===1)for(let j=0;j<3;j++){const xx=x+5+hash(seed+band,j)*Math.max(6,fw-14);line(c,[xx,yy,xx,yy+2],side,.7);}
    }
    if(band%2===0)line(c,[x+fw+1,yy,x+w-1,yy-2.3],p.outline,.65);
  }
  const storefront=clamp(h*.19,14,23),topInset=k===2?14:7,space=h-storefront-topInset-4;
  const cols=Math.max(2,Math.floor((fw-7)/(k===1?10:k===4?12:15)));
  const rows=Math.max(1,Math.floor(space/(k===1?13:15)));
  const pitchX=(fw-9)/cols,pitchY=Math.max(8,space/rows);
  for(let row=0;row<rows;row++){
    const yy=y+topInset+row*pitchY;
    for(let col=0;col<cols;col++){
      const xx=x+4.5+col*pitchX,coin=hash(seed+row*31,col+199);
      const mw=pitchX*(k===1?.80:.62),mh=pitchY*(k===3?.44:.57);
      const lit=coin>.65?(coin>.85?p.light:p.glass[2]):p.glass[coin>.39?1:0];
      windowPane(c,xx,yy,mw,mh,lit,p,damage>0&&hash(seed*3+col,row+97)<damage*.14,coin);
      if(k===0 && row%2===1){
        rect(c,xx-1.5,yy+mh+1,mw+3,2,p.outline);
        line(c,[xx-1,yy+mh-2,xx+mw+1,yy+mh-2],p.trim,.8);
        for(let j=0;j<3;j++)rect(c,xx+j*mw*.45,yy+mh-2,.6,3,p.trim);
      }else if(k===4)rect(c,xx+mw*.44,yy,.9,mh,side);
    }
    if(k===1)line(c,[x+2,yy+pitchY-2,x+fw-1,yy+pitchY-2],p.trim,.75);
    if(k===3 && row%3===0){
      line(c,[x+2,yy-1,x+fw-2,yy-1],p.outline,1);
      for(let j=0;j<4;j++)rect(c,x+5+j*(fw-10)/3,yy-1.4,.9,.9,p.trim);
    }
  }
  // Narrow side windows make each footprint read in three dimensions.
  const sideRows=Math.max(1,Math.floor((h-storefront-7)/15));
  for(let i=0;i<sideRows;i++){
    const yy=y+8+i*15;
    poly(c,[x+fw+2,yy,x+w-2,yy-2,x+w-2,yy+3.5,x+fw+2,yy+5.5],hash(i,seed)>.62?p.glass[2]:p.outline);
    line(c,[x+fw+2,yy+6,x+w-2,yy+4],face,.7);
  }
  if(k===4){
    for(const bx of [x+1,x+fw-3]) {
      rect(c,bx,y+3,2.2,h-storefront-2,p.trim);
      rect(c,bx-1,y+5,4.1,2,face);
    }
  }
  if(k===2){
    lightBox(c,x+3,y+3,fw-6,8,label,p,false);
    if(w>48){
      rect(c,x+w-4,y+10,6,h*.44,p.outline);
      rect(c,x+w-3,y+12,3,h*.40,p.sign);
      for(let i=0;i<Math.floor(h*.38/6);i++)rect(c,x+w-3.2,y+13+i*6,3.6,.8,p.light);
    }
  }
  const sy=-storefront;
  rect(c,x+1,sy,fw-2,storefront-1,p.outline);
  const panes=Math.max(2,Math.floor((fw-4)/13)),pw=(fw-5)/panes;
  for(let i=0;i<panes;i++){
    const xx=x+3+i*pw;
    const vv=hash(i+17,seed)>.6?p.glass[2]:p.glass[1];
    rect(c,xx,sy+4,pw-2,storefront-7,vv);
    line(c,[xx+pw*.46,sy+5,xx+1,sy+storefront*.65],p.trim,.65);
    if(i===1)rect(c,xx+pw*.67,sy+storefront*.64,1.3,1.6,p.light);
  }
  if(k===0||k===2){
    const segments=Math.max(5,Math.floor(fw/6));
    for(let i=0;i<segments;i++){
      const xx=x+i*fw/segments;
      poly(c,[xx+1,sy-1,xx+fw/segments+1,sy-1,xx+fw/segments+.15,sy+3,xx-.9,sy+3],i%2?p.trim:p.sign);
    }
    line(c,[x-1,sy+3.5,x+fw+.5,sy+3.5],p.outline,1.2);
  }else if(k===1||k===4)lightBox(c,x+fw*.16,sy-4,fw*.66,7,label,p,true);
  else{
    rect(c,x+3,sy+3,fw*.48,storefront-4,p.roads[0]);
    for(let i=0;i<4;i++)line(c,[x+4,sy+5+i*2.4,x+fw*.48,sy+5+i*2.4],p.outline,.7);
    lightBox(c,x+fw*.52,sy-1,fw*.42,6,label,p,false);
  }
  if(!b.landmark)roof(c,d,k,seed,x,y,w,p,face,side);
  neighborhood(c,d,k,seed,x,y,w,p);
  if(cities[d].landmark)drawLandmark(c,b,d,p,face,side);
  if(damage>0){
    for(let i=0;i<damage;i++){
      const xx=x+fw*(.16+.63*hash(seed,i+33)), yy=y+12+(h-35)*hash(seed,i+55);
      const length=8+Math.min(30,h*.13)+i*2;
      const crack=[xx,yy,xx-3,yy+length*.25,xx+1.5,yy+length*.36,xx-3.4,yy+length*.65,xx+2.4,yy+length*.72,xx+.5,yy+length];
      line(c,crack,p.trim,2.4);line(c,crack,p.outline,1.4);
      line(c,[xx-3.4,yy+length*.65,xx-8,yy+length*.60,xx-13,yy+length*.76],p.outline,.9);
      if(i>0)poly(c,[xx+1,yy+2,xx+7,yy+5,xx+5,yy+10,xx+1,yy+8],side);
    }
  }
  return {cv,x:x-pad,y:y-head,w:cv.width/1.7,h:cv.height/1.7};
}
export function drawBuilding(c,b,{district=0,time=0,reduced=false}={}) {
  const d=palettes[district]?district:0;
  const damage=clamp(Math.floor((1-clamp(b.hp/Math.max(1,b.maxHp),0,1))*4),0,3);
  const key=[d,b.kind,b.seed,b.w,b.h,damage,!!b.landmark].join('.');
  let sprite=facades.get(key);
  if(!sprite){
    sprite=makeFacade(b,d,damage);
    if(facades.size>=96)facades.delete(facades.keys().next().value);
    facades.set(key,sprite);
  }
  c.drawImage(sprite.cv,sprite.x,sprite.y,sprite.w,sprite.h);
  if(!b.landmark){c.save();movingRooftops(c,b,d,palettes[d],time,reduced);c.restore();}
}
export function drawDistrictThumb(c,district,width,height) {
  const w=300,h=148,ground=145;
  c.save();
  c.scale(width/w,height/h);
  drawBackdrop(c,{district,width:w,height:h,ground,camera:district===0?320:0,time:0,reduced:true});
  // Shrink the near city into the lower strip, framing the peaks, moon or aurora.
  c.save();c.translate(0,143);c.scale(.55,.55);
  const seed=170+district*31;
  for(const [i,x,bw,bh,kind] of [[0,-2,57,36,3],[1,59,43,72,1],[2,105,51,44,0],[3,444,54,43,2],[4,503,49,64,4],[5,550,45,50,3]]){
    c.save();c.translate(x,0);drawBuilding(c,{w:bw,h:bh,kind,seed:seed+i,hp:3,maxHp:3},{district});c.restore();
  }
  c.restore();c.restore();
}
