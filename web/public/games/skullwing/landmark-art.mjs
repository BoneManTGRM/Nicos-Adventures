// City architecture is painted directly onto the facade so masonry, glass and
// roof ornaments remain attached to their own panels when Skullwing hits them.
const TAU = Math.PI * 2;

function rect(c, x, y, w, h, fill) {
  c.fillStyle=fill;c.fillRect(x,y,w,h);
}
function finish(c, fill, stroke, weight=1) {
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=weight;c.stroke();}
}
function shape(c, coords, fill, stroke, weight=1) {
  c.beginPath();c.moveTo(coords[0],coords[1]);
  for(let i=2;i<coords.length;i+=2)c.lineTo(coords[i],coords[i+1]);
  if(fill)c.closePath();finish(c,fill,stroke,weight);
}
function oval(c,x,y,rx,ry,fill,stroke,weight=1) {
  c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);finish(c,fill,stroke,weight);
}
function wash(c,x1,y1,x2,y2,colors) {
  const g=c.createLinearGradient(x1,y1,x2,y2);
  colors.forEach((color,i)=>g.addColorStop(i/(colors.length-1),color));return g;
}
function arch(c,x,y,w,h,fill,edge,weight=1) {
  const radius=Math.min(w*.5,h*.68);
  c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+radius);
  c.bezierCurveTo(x,y-radius*.32,x+w,y-radius*.32,x+w,y+radius);
  c.lineTo(x+w,y+h);c.closePath();finish(c,fill,edge,weight);
}
function dome(c,x,y,rx,ry,fill,stroke) {
  c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI,TAU);c.closePath();finish(c,fill,stroke,1.25);
}
function masonry(c,h,top,color) {
  for(let y=top;y<h-3;y+=9){
    rect(c,1,y,83,.55,color);
    for(let j=0;j<4;j++)rect(c,3+j*21+(Math.floor(y/9)%2)*8,y,.6,4,color);
  }
}
function coping(c,y,color,shadow,side) {
  shape(c,[-1,y,83,y,99,y-3,99,y+.5,83,y+4,-1,y+4],shadow);
  rect(c,-1,y,84,1.5,color);
  shape(c,[83,y,99,y-3,99,y-1.7,83,y+1.5],side);
}
function terrace(c,y,warm,dark) {
  shape(c,[-2,y,83,y,99,y-3,94,y+1,81,y+4,1,y+4],dark);
  rect(c,0,y,82,1.6,warm);
}
function ribs(c,x,y,rx,ry,count,ink,glint) {
  for(let i=1;i<count;i++){
    const a=i/count*Math.PI, xx=rx*Math.cos(a);
    c.beginPath();c.moveTo(x,y-ry);
    c.bezierCurveTo(x+xx*.77,y-ry*.92,x+xx,y-ry*.48,x+xx,y);
    finish(c,null,i%2?ink:glint,.8);
  }
}
function clayTiles(c,x,y,w) {
  shape(c,[x,y,x+3,y-6,x+w-2,y-6,x+w+2,y,x+w,y+2,x,y+2],'#944c3f','#633c3c',.85);
  for(let i=0;i<w;i+=4.6){
    shape(c,[x+i,y,x+i+3,y-5],null,i%2?'#e19462':'#f9ad75',1.1);
    rect(c,x+i,y,2.4,1.6,'#db8058');
  }
}

function observatory(c,h) {
  const wall=wash(c,0,0,86,h,['#efaa74','#cb7d55','#a75843']);
  rect(c,0,0,84,h,wall);masonry(c,h,10,'#b97557');
  const ry=Math.min(24,Math.max(18,h*.19));
  rect(c,11,-3,63,9,'#865749');
  dome(c,43,-2,30,ry,wash(c,13,-27,73,1,['#80bbb1','#4d9990','#36736f','#805a46']),'#334e53');
  ribs(c,43,-2,30,ry,8,'#236b71','#b6d1ac');
  rect(c,12,-3,62,3,'#f3ae68');rect(c,16,0,54,2,'#795747');
  shape(c,[37,-ry-2,49,-ry-2,47,-ry-5,39,-ry-5],'#b57c48','#604d44',.7);
  oval(c,43,-ry-7,3.5,3.5,'#ffcb75','#834d38',.85);
  for(let i=0;i<8;i++){
    const a=i*TAU/8;shape(c,[43+Math.cos(a)*4.6,-ry-7+Math.sin(a)*4.6,43+Math.cos(a)*6.3,-ry-7+Math.sin(a)*6.3],null,'#efbb60',1);
  }
  clayTiles(c,0,5,14);clayTiles(c,69,5,15);
  const mid=h*.58;
  const ny=Math.max(15,h*.13), hh=Math.max(14,mid-ny-5);
  for(let i=0;i<3;i++){
    const x=9+i*25;
    arch(c,x-2,ny-1,18,hh+1,'#f4c68d','#8a533f',1);
    arch(c,x,ny+1,14,hh-2,wash(c,x,ny,x+12,mid,['#344b53','#547679']),'#7f4c40',.9);
    rect(c,x+6.5,ny+2,1.2,hh-4,'#c6a67e');rect(c,x,ny+hh*.58,14,.85,'#d2a376');
  }
  coping(c,mid,'#ffe1a3','#8b503e','#bd7355');
  clayTiles(c,-2,mid+5,85);
  const baseY=mid+9;
  for(let i=0;i<4;i++){
    const x=3.5+i*20.5;
    arch(c,x,baseY,16,h-baseY-1,'#704a46','#f1ae70',1.7);
    arch(c,x+2.5,baseY+3,11,h-baseY-5, i===1?'#31444c':'#3f5860');
    rect(c,x+2,h-7,13,1.25,'#b37550');
    rect(c,x+16.3,baseY+7,1.6,h-baseY-9,'#f1bd84');
  }
  for(let i=0;i<3;i++){
    const x=4+35*i;
    shape(c,[x,4,x+1.5,5.4,x,7,x-1.4,5.4],'#217878');
  }
}

function lantern(c,x,y,size=1) {
  c.save();c.translate(x,y);c.scale(size,size);
  rect(c,-.38,0,.8,3.7,'#ebbd74');
  oval(c,0,7.2,3.85,4.7,'#e66043','#6a363f',.7);
  oval(c,-.6,7,1.4,3.7,'#ffa966');
  shape(c,[-2.9,4.8,-3.1,9],null,'#ff9363',.6);
  rect(c,-2.2,2.8,4.4,1.2,'#805752');rect(c,-1.8,11.2,3.6,1.1,'#754446');
  rect(c,-.5,12.2,1,2.5,'#ffcf7b');c.restore();
}
function eave(c,x,y,w,rise,roof='#315d63') {
  c.beginPath();c.moveTo(x,y-4.8);
  c.quadraticCurveTo(x+w*.24,y+.5,x+w*.41,y-rise);
  c.lineTo(x+w*.59,y-rise);
  c.quadraticCurveTo(x+w*.78,y+.5,x+w,y-5);
  c.lineTo(x+w-1.5,y+.4);c.quadraticCurveTo(x+w*.5,y+5,x+1.5,y+.4);c.closePath();
  finish(c,roof,'#263e49',1);
  c.beginPath();c.moveTo(x+.8,y-2.3);c.quadraticCurveTo(x+w*.5,y+5.2,x+w-.5,y-2.3);finish(c,null,'#edb271',1.45);
  for(let i=1;i<12;i++){
    const k=i/12,sy=y-rise*Math.pow(1-Math.abs(2*k-1),1.8);
    shape(c,[x+w*(.12+.76*k),sy,x+w*k,y-.5],null,'#78a796',.65);
  }
}
function pavilion(c,h) {
  rect(c,0,0,84,h,wash(c,0,0,90,0,['#a04443','#894444','#653841']));
  const storeys=h>124?3:2, level=h/storeys;
  for(let row=0;row<storeys;row++){
    const top=row*level+5,base=(row+1)*level-3;
    for(let i=0;i<5;i++){
      const x=3+i*16.5;
      rect(c,x,top,14,base-top,'#492f3d');
      rect(c,x+1.7,top+2,10.7,base-top-4,wash(c,x,top,x,base,['#e6ab75','#ad705c','#764958']));
      for(let j=0;j<3;j++)rect(c,x+3+j*3.5,top+2,.9,base-top-3,'#663c47');
      for(let j=top+6;j<base-1;j+=8)rect(c,x+1.3,j,11.7,.85,'#74424a');
      rect(c,x+13.4,top-1,2.2,base-top+4,'#d0754d');
    }
    if(row<storeys-1){
      eave(c,-3,base+2,90,5);
      for(const x of [7,69])lantern(c,x,base+3,.85);
    }
  }
  for(let x=2;x<86;x+=16.5){rect(c,x,h-10,1.5,8,'#f2aa62');}
  terrace(c,h-4,'#d99f6c','#593a40');
  rect(c,19,-12,47,13,'#a94945');
  for(let x=23;x<65;x+=7)rect(c,x,-11,3.8,7,'#ffbf75');
  eave(c,-4,1,94,14);eave(c,11,-11,63,12);
  rect(c,34,-27,17,5,'#9a4b43');rect(c,39,-30,7,4,'#edba70');
  eave(c,24,-24,37,8,'#315863');
  shape(c,[40,-33,42.8,-38,45,-33], '#f3c178','#5b524b',.65);
  lantern(c,3,3);lantern(c,79,3);
}

function gear(c,x,y,r,body,edge,hole,teeth=12) {
  const pts=[];
  for(let j=0;j<teeth;j++)for(const [part,rr] of [[0,.81],[.16,1],[.57,1],[.73,.81]]){
    const a=TAU*(j+part)/teeth;pts.push(x+r*rr*Math.cos(a),y+r*rr*Math.sin(a));
  }
  shape(c,pts,body,edge,.8);oval(c,x,y,r*.48,r*.48,hole,edge,.7);
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2+.3;
    shape(c,[x,y,x+r*.54*Math.cos(a),y+r*.54*Math.sin(a)],null,body,1.65);
  }
  oval(c,x,y,r*.16,r*.16,edge);
}
function clock(c,x,y,r) {
  oval(c,x,y,r+3.4,r+3.4,'#4b4c48','#473b3e',1.3);
  oval(c,x,y,r+1.7,r+1.7,'#dfb15d','#aa7f4b',.65);
  oval(c,x,y,r,r,wash(c,x-r,y-r,x+r,y+r,['#fff1b6','#e1cb84','#b98e56']),'#765f4e',.7);
  for(let i=0;i<12;i++){
    const a=TAU*i/12;
    shape(c,[x+Math.sin(a)*r*.72,y-Math.cos(a)*r*.72,x+Math.sin(a)*r*.91,y-Math.cos(a)*r*.91],null,'#474547',i%3===0?1.8:.9);
  }
  shape(c,[x-r*.47,y-r*.37,x,y,x+r*.56,y-r*.42],null,'#3b3b42',2.1);
  shape(c,[x,y,x-r*.09,y+r*.47],null,'#a75c41',.85);
  oval(c,x,y,1.8,1.8,'#a46e43','#433f40',.55);
}
function clockworks(c,h) {
  rect(c,0,0,84,h,wash(c,1,0,84,0,['#99705b','#c39b6a','#956e58','#826353']));
  masonry(c,h,6,'#816653');
  for(const x of [2,76]){
    rect(c,x,1,6,h-1,'#665752');rect(c,x+1,0,2,h,'#d2a975');
    for(let yy=7;yy<h-2;yy+=21){rect(c,x-1.6,yy,8.5,3,'#815e4f');rect(c,x-1.6,yy,8.5,1,'#e8b57a');}
  }
  const r=Math.min(18,h*.17),cy=r+6;
  arch(c,18,1,48,cy+r+5,'#765b4b','#cfa374',1.2);
  clock(c,42,cy,r);
  const top=cy+r+7;
  coping(c,top,'#e6be80','#645148','#987053');
  const pitY=top+7,pitH=Math.max(7,h-pitY-5);
  arch(c,25,pitY,34,pitH,'#354548','#e3ad68',1.6);
  if(pitH>22){
    const r1=Math.min(10,pitH*.21),r2=r1*.68,gy=pitY+pitH*.35;
    for(const x of [29,54]){
      shape(c,[x,pitY+8,x,h-9],null,'#65726b',2);
      rect(c,x-1.5,h-13,3.7,4,'#8b7560');
    }
    shape(c,[39,gy,51,gy+r1,47,h-10],null,'#a1926a',1.35);
    shape(c,[39,gy,37,h-13],null,'#c7a376',1.65);
    oval(c,37,h-13,3.7,4.8,'#c9a66e','#6d624e',1);
    gear(c,39,gy,r1,'#cf914c','#704d3e','#394648');
    gear(c,39+r1*1.08,gy+r1,r2,'#9aa18b','#626557','#394648',10);
    for(const yy of [pitY+9,gy+r1+7,h-7]){
      shape(c,[28,yy,55,yy],null,'#686651',.8);
      oval(c,28,yy,.95,.95,'#ccad76');oval(c,55,yy,.95,.95,'#ccad76');
    }
  }
  for(const x of [12,64]){
    arch(c,x,top+9,8,Math.max(6,h-top-16),'#3b5658','#c89b6a',.9);
    shape(c,[x+4,top+12,x+4,h-8],null,'#8c9e8d',1);
  }
  shape(c,[-2,2,6,-4,21,-4,25,-13,58,-13,64,-4,78,-4,86,2],'#45676b','#394e55',1.1);
  shape(c,[22,-5,30,-15,54,-15,62,-5],'#689694','#4d6663',.8);
  rect(c,34,-24,16,10,'#8b7356');
  for(const x of [36,40,44,48])arch(c,x,-22,2.2,7,'#42494d');
  shape(c,[31,-23,42,-33,53,-23],'#639b96','#476868',.9);rect(c,41.3,-36,1.4,5,'#dfb371');
  for(const x of [8,72]){gear(c,x,-5,5,'#b38b50','#786046','#5c605b',8);}
}

function shell(c,x,y,rx,ry) {
  const edge='#985c62',colors=['#ea8f7d','#ffb99a','#efa38c','#ffd1a9','#e48d80'];
  for(let i=0;i<9;i++){
    const a=Math.PI+(i/9)*Math.PI,b=a+Math.PI/9;
    const at=theta=>[x+Math.cos(theta)*rx,y+Math.sin(theta)*ry];
    const start=at(a),end=at(b),mid=(a+b)/2;
    c.beginPath();c.moveTo(x,y+2);c.lineTo(...start);
    c.quadraticCurveTo(x+Math.cos(mid)*(rx+3),y+Math.sin(mid)*(ry+3),...end);
    c.closePath();finish(c,colors[i%5],edge,.6);
  }
  oval(c,x,y,4,2.5,'#f4dfbc','#ae8576',.7);
}
function rayMosaic(c,x,y,s) {
  c.save();c.translate(x,y);c.scale(s,s);
  c.beginPath();c.moveTo(-9,-1);c.quadraticCurveTo(-5,-2,-3,-4);
  c.quadraticCurveTo(0,-2,2,-3);c.quadraticCurveTo(5,-4,9,-7);
  c.quadraticCurveTo(7,-1,2,2);c.quadraticCurveTo(6,4,8,6);
  c.quadraticCurveTo(4,4,-1,3);c.quadraticCurveTo(-4,3,-9,-1);
  finish(c,'#8ddace','#337c83',.6);c.restore();
}
function aquarium(c,h) {
  rect(c,0,0,84,h,wash(c,0,0,85,h,['#f8cbaf','#d69e94','#bc7a82']));
  for(const x of [0,8,69,77]){
    rect(c,x,0,5,h,'#edb59c');rect(c,x+1,1,1.3,h-1,'#ffe0b5');
  }
  for(let j=0;j<3;j++){
    const x=12+j*20;
    shape(c,[x,0,x+2,-9-j%2*5,x+15,-9-j%2*5,x+17,0],'#dea395','#a46973',1);
    rect(c,x+3,-8-j%2*5,11,1.3,'#f9d9ad');
  }
  shell(c,42,-9,22,23);
  const top=9, bottom=Math.round(h*.7), hh=bottom-top;
  arch(c,10,top-2,65,hh+4,'#e8c79f','#b77576',1.5);
  arch(c,13,top,59,hh,wash(c,10,top,72,bottom,['#a8e3d0','#48a9ae','#205c78','#304967']),'#427a84',1.3);
  for(let i=0;i<4;i++){
    const yy=top+hh*(.48+.09*i);
    c.beginPath();c.moveTo(17,yy);c.bezierCurveTo(29,yy+2,36,yy-4,43,yy-1);finish(c,null,'rgba(208,242,210,.42)',.85);
  }
  rayMosaic(c,38,top+hh*.55,1);rayMosaic(c,56,top+hh*.36,.58);
  for(const x of [23,32,48,62]){
    const k=x%5;
    shape(c,[x,bottom,x+1,bottom-3,x-2,bottom-6-k],null,'#57aaa4',1.1);
    shape(c,[x+1,bottom-3,x+4,bottom-6],null,'#57aaa4',.9);
  }
  for(let i=0;i<3;i++){
    const x=22+i*18,y=bottom-1,len=6+i*2;
    shape(c,[x,y,x-1,y-len,x-4,y-len-3],null,'#d99f89',1.35);
    shape(c,[x-1,y-len*.6,x+2,y-len*.88,x+3,y-len-2],null,'#e0ad92',1.1);
    oval(c,x+6,y-len-8,.95,1.2,null,'#b4ded1',.55);
    oval(c,x+5,y-len-11,.6,.7,'#9ed8d0');
  }
  for(const x of [24,60])shape(c,[x,top+6,x,bottom-.8],null,'#4e8a8e',.95);
  terrace(c,bottom+2,'#ffe0af','#aa7678');
  for(let i=0;i<4;i++){const x=8+i*18;arch(c,x,bottom+8,13,Math.max(6,h-bottom-9),'#376778','#eac19f',1.7);}
}

function vine(c,x,y,length,sway) {
  c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-3*sway,y+length*.31,x+5*sway,y+length*.62,x+sway,y+length);
  finish(c,null,'#416651',1.1);
  for(let i=0;i<5;i++){
    const xx=x+Math.sin(i*1.4)*1.4*sway, yy=y+length*(i+.7)/5.5,dir=i%2?1:-1;
    shape(c,[xx,yy,xx+dir*3,yy-2,xx+dir*5.4,yy-1,xx+dir*3.1,yy+1.3],i%2?'#69a478':'#8bb784','#4f805e',.35);
  }
}
function conservatory(c,h) {
  const glass=wash(c,0,-26,82,h,['#c7e4b1','#75b9a3','#438d88','#275f69']);
  rect(c,0,0,84,h,'#478775');
  dome(c,42,0,41,27,glass,'#315c57');
  ribs(c,42,0,41,27,10,'#407969','#a7cca0');
  for(let i=1;i<=2;i++){
    const yy=-i*8,span=41*Math.sqrt(1-(yy/27)**2);
    shape(c,[42-span,yy,42+span,yy],null,'#629782',1);
  }
  rect(c,38,-29,8,2,'#c6cb87');
  shape(c,[42,-29,41,-32,36,-35,42,-34,43,-37,46,-38,45,-33,43,-31],'#95b875','#5f895e',.65);
  arch(c,4,4,76,h-6,glass,'#b1bd88',1.8);
  // The broad crowns and gnarled stems sit behind the greenhouse panes.
  for(const [cx,frac,lean,s] of [[27,.46,7,.85],[50,.35,-2,1.12],[63,.62,-3,.77]]){
    const cy=h*frac;
    shape(c,[cx-3.8,h-1,cx-2.1,h*.69,cx+lean-1,cy+5,cx+lean+1.8,cy+3,cx+.6,h*.68,cx+3.3,h-1],'#427463');
    for(let i=0;i<5;i++){
      const xx=cx+lean+(i-2)*4.4*s,yy=cy+Math.abs(i-2)*2*s;
      shape(c,[cx,h*.72,xx,yy+3],null,'#54846a',.9);
      oval(c,xx,yy,(7-i%2)*s,(5+i%2)*s,i%2?'#78a77d':'#56957a');
      shape(c,[xx-4*s,yy+1,xx,yy-2*s,xx+4*s,yy-1.6*s],null,'#a0be8b',.65);
    }
  }
  for(let i=0;i<10;i++){
    const x=9+7*i, yy=h-4, height=13+((i*13)%Math.max(12,Math.floor(h*.47)));
    shape(c,[x,yy,x+1,yy-height*.65,x-1,yy-height],null,'#4a896f',1.4);
    for(let j=0;j<3;j++){
      const ly=yy-height*(j+1)/4;
      shape(c,[x+1,ly,x-3,ly-5,x-7,ly-6,x-4.5,ly-2], '#599a76');
      shape(c,[x+1,ly+1,x+4,ly-3,x+7,ly-3,x+4,ly+.5], '#73a879');
    }
  }
  for(let y=12;y<h-4;y+=16){shape(c,[7,y,78,y],null,'#487e71',1.15);}
  for(const x of [12,26,42,58,72]){
    shape(c,[x,5,x,h-2],null,'#427765',1.7);
    shape(c,[x+1,8,x+1,h-3],null,'#aac9a0',.6);
  }
  const belt=Math.round(h*.6);coping(c,belt,'#b7bd89','#526f58','#7a956c');
  vine(c,7,0,Math.min(33,h*.33),-1);vine(c,78,2,Math.min(35,h*.27),1);
  const rr=Math.min(14,h*.14),cx=64,cy=h-rr-5;
  oval(c,cx,cy,rr,rr,'#528276','#514f43',2.2);
  for(let i=0;i<9;i++){
    const a=TAU*i/9,dx=Math.cos(a),dy=Math.sin(a);
    shape(c,[cx,cy,cx+dx*rr,cy+dy*rr],null,'#ba9262',2);
    shape(c,[cx+dx*(rr-2)-dy*2,cy+dy*(rr-2)+dx*2,cx+dx*rr+dy*2,cy+dy*rr-dx*2],null,'#cfa573',2.2);
  }
  oval(c,cx,cy,2.3,2.3,'#d2bc80','#604f42',1);
}
function dish(c,x,y,s) {
  c.save();c.translate(x,y);c.scale(s,s);
  shape(c,[-4,2,5,-11,12,-7,5,2],'#547382','#2c4058',1);
  shape(c,[-7,2,8,2,11,5,-10,5],'#9cabb2','#384958',1);
  c.rotate(-.34);
  c.beginPath();c.moveTo(-18,-14);
  c.quadraticCurveTo(-2,6,19,-14);c.quadraticCurveTo(4,-6,-18,-14);c.closePath();
  finish(c,'#7697ab','#34465f',1.5);
  oval(c,.5,-14,18.5,3.3,'#b9c6cc','#405770',.8);
  for(const dx of [-15,-7,3,13])shape(c,[dx,-14,1,-5],null,'#536f82',.7);
  shape(c,[-13,-15,3,-26,11,-15],null,'#bed4d2',1);
  oval(c,3,-26,1.6,1.5,'#ffb694','#a96583',.7);c.restore();
}
function orbital(c,h) {
  rect(c,0,0,84,h,wash(c,0,0,84,h,['#b4c2c5','#94a5b4','#69778f']));
  shape(c,[-1,2,8,-11,67,-11,81,1,73,5,8,5],'#63758c','#2b425b',1.2);
  shape(c,[2,1,11,-8,65,-8,73,-2,14,-2,10,1],'#c5d5cb');
  dish(c,37,-6,1);
  rect(c,72,-20,2.2,22,'#6f8597');shape(c,[69,-16,77,-16],null,'#bec8c7',1.4);
  oval(c,73,-22,2,2,'#fab493','#965f7d',1);
  const left=12,right=71,top=7,low=Math.floor(h*.69);
  shape(c,[left+5,top,right,top,right,low-8,right-7,low,left,low,left,top+6],wash(c,left,top,right,low,['#2c4869','#3b7282','#504e7a']),'#304258',1.5);
  for(let y=top+6;y<low-3;y+=11){
    shape(c,[left+3,y+4,left+10,y,right-3,y],null,'#6fa7ac',.85);
    for(let x=left+11;x<right-5;x+=10)rect(c,x,y+2,5,2,(x+y)%3?'#b0c6ca':'#e6afc5');
  }
  const mx=43,my=(top+low)*.5,mr=Math.min(17,(low-top)*.31);
  oval(c,mx,my,mr+3,mr+3,'#4d6b80','#b7bcc6',.95);
  oval(c,mx,my,mr+1,mr+1,wash(c,mx-mr,my-mr,mx+mr,my+mr,['#345e75','#354760','#494666']),'#536e85',.7);
  c.save();c.translate(mx,my);c.rotate(-.48);
  oval(c,0,0,mr*.94,mr*.39,null,'#94c6c1',.85);
  oval(c,0,0,mr*.56,mr*.84,null,'#66889e',.8);
  oval(c,0,0,mr*.34,mr*.34,'#bea4c2','#e3c4ce',.7);
  shape(c,[-mr*.33,.9,-mr*.15,-.1,mr*.08,1.2,mr*.32,-.6],null,'#d6c7d7',.65);
  oval(c,mr*.77,-mr*.2,1.25,1.25,'#d5efcc');
  c.restore();
  shape(c,[left-7,4,left-4,4,left-4,low+2,left+6,low+10,left+5,h,left,h,left,low+13,left-9,low+4],'#655e87','#3f4965',.8);
  shape(c,[right+8,6,right+5,6,right+5,low-5,right-4,low+5,right-5,h,right,h,right+1,low+8,right+9,low-2],'#d9a6c4','#576176',.8);
  coping(c,low+4,'#cdd3cd','#5b687f','#97a0ad');
  const baseY=low+11;
  for(const x of [15,33,51]){
    shape(c,[x,baseY+3,x+4,baseY,x+14,baseY,x+14,h-2,x,h-2], '#30465d','#7b91a2',1.35);
    rect(c,x+3,baseY+4,8,1.4,'#a6dccc');
  }
  for(const x of [4,77])for(let i=0;i<3;i++)rect(c,x,8+i*4,3.8,1.35,'#b3eada');
}

const landmarks=[observatory,pavilion,clockworks,aquarium,conservatory,orbital];
function districtTrim(c,b,d,p) {
  // Only the ledges and roof get accents on ordinary buildings, preserving their window grids.
  const h=b.h, seed=b.seed|0,x=seed%2===0?11:59;
  if(d===3){
    clayTiles(c,1,h-Math.min(22,h*.18),82);
    if(seed%3===0){dome(c,x+5,-1,7,4,'#6b9a8c','#52786f');rect(c,x,-1,11,1.5,'#d8ae7d');}
  }else if(d===4){
    shape(c,[0,2,14,5,38,7,66,5,83,2],null,'#72524e',.8);
    for(const [px,py] of [[12,4],[35,6],[63,4.5]])lantern(c,px,py,.63);
  }else if(d===5){
    rect(c,x,-5,16,5,'#776852');gear(c,x+8,-5,4.6,'#cca469','#766448',p.outline,8);
    const px=seed%2===0?2:79;shape(c,[px,4,px,15,px+2,17,px+2,h-2],null,'#bc945e',1.45);
  }else if(d===6){
    for(let i=0;i<3;i++){
      rect(c,x+i*3,-3-i%2*3,1.65,9+i%2*3,i%2?'#a9d2c4':'#f6c1a9');
    }
    shape(c,[1,3,14,3,18,5,64,5,68,3,82,3],null,'#f0bd9e',1);
  }else if(d===7){
    vine(c,4,1,Math.min(23,h*.23),1);vine(c,81,seed%5-1,Math.min(27,h*.3),-1);
  }else if(d===8){
    shape(c,[3,0,10,-4,24,-4,28,-1],null,'#c2c5d1',1.25);
    for(let i=0;i<4;i++)rect(c,71+i*3,2.2,1.45,1.45,i%2?'#edadd1':'#a5e2d6');
  }
}

// Building-local origin is at the curb, with upward positions negative.
export function drawLandmark(ctx,b,d,p,face,side) {
  const paint=landmarks[d-3];if(!paint)return;
  ctx.save();ctx.translate(-b.w*.5,-b.h);ctx.scale(b.w/100,1);
  ctx.lineJoin='round';ctx.lineCap='round';
  if(b.landmark){
    paint(ctx,b.h);
    // The return wall retains the city palette so it lights consistently with adjacent blocks.
    for(let y=8;y<b.h-4;y+=14){
      shape(ctx,[86,y,98,y-2.7],null,side,.7);
      shape(ctx,[88,y+.8,95,y-.7],null,face,.55);
    }
  }else districtTrim(ctx,b,d,p);
  ctx.restore();
}
