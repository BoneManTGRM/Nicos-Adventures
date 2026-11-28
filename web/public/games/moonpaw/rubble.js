'use strict';

// Bake each lithology into a handful of little three-faced solids. The irregular
// edges, exposed interior and outer rind all rotate together during flight.
const debrisTiles=new Map();
function splinterTile(world,variant){
  const key=world.name+variant;
  if(debrisTiles.has(key))return debrisTiles.get(key);
  const canvas=document.createElement('canvas');canvas.width=112;canvas.height=96;
  const g=canvas.getContext('2d'),wall=world.skin.mantleArt,crust=world.skin.crustArt;
  const ice=world.material==='ice'||world.material==='fulgurite',gem=['crystal','jade','obsidian'].includes(world.material);
  const v=variant,tip=[103-v%3*3,ice?12+v%3*4:21+v%3*6],base=[16+v%4*4,58+v%3*4];
  const ridge=[51+v%4*4,ice?43:47],left=[7+v%4*2,37+v%3*4],foot=[39+v%3*5,85-v%4*4];
  const crest=[32+(v*7)%25,10+(v*3)%19],shoulder=[73+(v*3)%13,13+(v*5)%17];
  const right=[92-v%4*4,68-v%4*5],bottom=[67+v%3*4,78+v%4*3];
  function face(points,source,shade,u){
    g.save();g.beginPath();g.moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);
    g.closePath();g.clip();g.fillStyle=world.color;g.fillRect(0,0,112,96);
    if(source){
      const sw=source.naturalWidth*.26,sh=source.naturalHeight*.48;
      g.drawImage(source,(source.naturalWidth-sw)*u,(source.naturalHeight-sh)*((v*.23+.22)%1),sw,sh,0,0,112,96);
    }
    if(shade){g.fillStyle=shade;g.fillRect(0,0,112,96)}
    g.restore();
  }
  face([left,crest,shoulder,tip,ridge,base],v%3===0?crust:wall,null,(v*.31)%1);
  face([base,ridge,foot],wall,'#0c14294a',(v*.42+.1)%1);
  face([ridge,tip,right,bottom,foot],wall,gem?'#1e123b37':'#0c172033',(v*.37+.38)%1);
  penLine(g,[base,ridge,tip],world.core+'d9',1.8);
  penLine(g,[ridge,foot],world.color+'ac',1.6);
  if(ice||gem)penLine(g,[crest,shoulder,tip],world.core+'c9',1.3);
  if(wall&&crust)debrisTiles.set(key,canvas);
  return canvas;
}
function looseRock(world,spot,size,kind,index,total,secondary){
  const p=orbitTarget(),spread=secondary?1.65:3.7;
  const direction=Math.atan2(spot.y,spot.x)+(index/(total-1)-.5)*spread+(Math.random()-.5)*.38;
  const speed=(.62+Math.random()*.85)*(secondary?.68:1)*(reduceMotion?.48:1);
  const ice=world.material==='ice'||world.material==='fulgurite',gem=['crystal','jade','obsidian'].includes(world.material);
  const slender=ice?.63:gem?.78:1;
  flight.ejecta.push({u:(p.x+p.r*spot.x)/W,v:(p.y+p.r*spot.y)/H,
    vx:Math.cos(direction)*speed*p.r/W,vy:Math.sin(direction)*speed*p.r/H,
    scale:size,angle:direction,spin:(index%2?1:-1)*(2+Math.random()*3),
    lean:slender*(.70+Math.random()*.32),age:0,life:(secondary?.63:1.08)+Math.random()*.53,
    tile:splinterTile(world,Math.floor(Math.random()*9)),world,kind});
}
function ejectCrust(world,spot,power,kind){
  const count=4+Math.min(5,power),radii=[.175+power*.023,.11,.075];
  for(let j=0;j<count;j++)looseRock(world,spot,radii[j]||(.024+Math.random()*.037),kind,j,count,false);
  if(flight.ejecta.length>70)flight.ejecta.splice(0,flight.ejecta.length-70);
}
function peelCrust(world,spot,size,kind){
  const count=reduceMotion?2:4;
  for(let j=0;j<count;j++)looseRock(world,spot,size*(j===0?.72:.18+Math.random()*.19),kind,j,count,true);
  if(flight.ejecta.length>70)flight.ejecta.splice(0,flight.ejecta.length-70);
}
function drawEjecta(){
  const radius=orbitTarget().r;
  for(const chip of flight.ejecta){
    const t=chip.age,turn=t*chip.spin*(reduceMotion?.25:1);
    const r=Math.max(1.5,radius*chip.scale*(1+.12*t));
    const x=W*(chip.u+t*chip.vx),y=H*(chip.v+t*chip.vy)+radius*.10*t*t;
    ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,(chip.life-t)/.32));
    if(r>4&&t<.47){
      const length=(1-t/.47)*.065;
      const dx=W*chip.vx*length,dy=H*chip.vy*length;
      const trail=ctx.createLinearGradient(x-dx,y-dy,x,y);
      trail.addColorStop(0,chip.world.color+'00');trail.addColorStop(1,chip.world.color+'a6');
      ctx.strokeStyle=trail;ctx.lineWidth=Math.max(1,r*.24);
      ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(x,y);ctx.stroke();
    }
    ctx.translate(x,y);ctx.rotate(chip.angle+turn);
    const tilt=.31+.69*Math.abs(Math.cos(turn));
    ctx.scale(1,chip.lean*tilt);ctx.drawImage(chip.tile,-r,-r*.83,r*2,r*1.66);ctx.restore();
  }
}
function splitFragment(tile,px,py,seed,world){
  // Both daughter pieces take their cut from the very same fault line. Mask
  // the color and side panels identically, including any pre-existing tunnel.
  const line=[];
  const slant=.16*Math.sin(seed*1.73);
  for(let j=0;j<=9;j++){
    const t=j/9,x=.49+(t-.5)*slant+.10*Math.sin(seed+j*2.48)+.035*Math.sin(seed*3+j);
    line.push([px*x,py*t]);
  }
  return [-1,1].map(side=>{
    const piece=document.createElement('canvas');piece.width=2*px;piece.height=py;
    const brush=piece.getContext('2d'),edge=side<0?0:px;
    for(let panel=0;panel<2;panel++){
      brush.save();brush.translate(panel*px,0);brush.beginPath();brush.moveTo(edge,0);
      for(const pt of line)brush.lineTo(...pt);
      brush.lineTo(edge,py);brush.closePath();brush.clip();
      brush.drawImage(tile,panel*px,0,px,py,0,0,px,py);
      if(!panel){
        brush.globalCompositeOperation='source-atop';
        penLine(brush,line,side<0?world.core+'cd':world.color+'84',Math.max(1,px*.023));
      }
      brush.restore();
    }
    return piece;
  });
}
// Bake the remaining face and a matching extrusion mask once at breakup.
// Empty tunnels and missing edges stay empty on every moving fragment.
function prepareFragments(world){
  const face=world.skin.frame(spinAngle())||world.image,parts=[];
  for(const cell of world.cells){
    const xs=cell.polygon.map(v=>v[0]),ys=cell.polygon.map(v=>v[1]);
    const x=Math.max(-1,Math.min(...xs)),y=Math.max(-1,Math.min(...ys));
    const w=Math.min(1,Math.max(...xs))-x,h=Math.min(1,Math.max(...ys))-y;
    if(w<=0||h<=0)continue;
    const px=Math.ceil(w*globeDiameter/2)+2,py=Math.ceil(h*globeDiameter/2)+2;
    const tile=document.createElement('canvas');tile.width=px*2;tile.height=py;
    const g=tile.getContext('2d');
    g.save();g.setTransform(px/w,0,0,py/h,-x*px/w,-y*py/h);
    g.beginPath();g.moveTo(...cell.polygon[0]);for(const point of cell.polygon.slice(1))g.lineTo(...point);
    g.closePath();g.clip();
    if(face.width>0)g.drawImage(face,-1,-1,2,2);
    g.globalCompositeOperation='source-atop';g.strokeStyle=world.core;g.lineWidth=.009;g.stroke();g.restore();
    g.drawImage(tile,0,0,px,py,px,0,px,py);
    g.save();g.beginPath();g.rect(px,0,px,py);g.clip();g.globalCompositeOperation='source-atop';
    const wall=world.skin.mantleArt;
    if(wall){
      const tw=Math.min(wall.naturalWidth,Math.max(110,wall.naturalWidth*w*.68));
      const th=Math.min(wall.naturalHeight,Math.max(90,wall.naturalHeight*h*.86));
      const tx=(wall.naturalWidth-tw)*(x+1)*.5,ty=(wall.naturalHeight-th)*(y+1)*.5;
      g.drawImage(wall,tx,ty,tw,th,px,0,px,py);
    }
    const mineral=g.createLinearGradient(px,0,2*px,py);
    mineral.addColorStop(0,world.core+'7f');mineral.addColorStop(.18,world.color+(wall?'20':'fb'));
    mineral.addColorStop(.65,'#241c324d');mineral.addColorStop(1,'#110d1caa');
    g.fillStyle=mineral;g.fillRect(px,0,px,py);g.restore();
    const seed=parts.length+world.seed;
    const halves=w>.28&&h>.28&&parts.length%3!==1?splitFragment(tile,px,py,seed,world):null;
    parts.push({cell,tile,x,y,w,h,px,py,halves,splitAt:.44+.28*(.5+.5*Math.sin(seed*3.14+.73*parts.length))});
  }
  return parts;
}
function drawFragments(parts,time,world){
  const release=Math.max(0,time-.18);
  const move=reduceMotion?release*.40:release*(.55+release*.43);
  ctx.globalAlpha=clamp((2.35-time)/.79,0,1);
  const pull=reduceMotion?0:.08*Math.sin(Math.PI*Math.min(1,time/.24));
  for(const {cell,tile,x,y,w,h,px,py,halves,splitAt} of parts){
    const forward=1+move*(.16+.34*Math.sin(cell.vx*4+cell.vy*6));
    const turn=cell.spin*move,tilt=1-.57*Math.abs(Math.sin(turn*1.57));
    const thick=Math.min(.18,move*.28)*(.7+.8*Math.abs(Math.sin(turn)));
    const cx=cell.cx*(1-pull)+cell.vx*move,cy=cell.cy*(1-pull)+cell.vy*move;
    ctx.save();
    if(move>.02&&time<1.55){
      const trail=Math.min(move,.22)*(1-time/1.55);
      const fromX=cx-cell.vx*trail,fromY=cy-cell.vy*trail;
      const glow=ctx.createLinearGradient(fromX,fromY,cx,cy);
      glow.addColorStop(0,world.color+'00');glow.addColorStop(1,world.color+'9a');
      ctx.strokeStyle=glow;ctx.lineWidth=.027;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(fromX,fromY);ctx.lineTo(cx,cy);ctx.stroke();
    }
    ctx.translate(cx,cy);
    ctx.scale(forward,forward);ctx.rotate(turn);ctx.scale(1,tilt);ctx.translate(-cell.cx,-cell.cy);
    const split=halves?Math.max(0,time-splitAt):0;
    const panels=split>0?halves:[tile];
    for(let i=0;i<panels.length;i++){
      const panel=panels[i],side=i===0?-1:1;
      ctx.save();
      if(split){
        const gap=split*(reduceMotion?.14:.47);
        ctx.translate(cell.cx+side*gap*w,cell.cy+side*gap*h*.19);
        ctx.rotate(side*gap*.47);ctx.translate(-cell.cx,-cell.cy);
      }
      for(let j=4;j>0;j--)ctx.drawImage(panel,px,0,px,py,x+thick*j/4,y+thick*j/4,w,h);
      ctx.drawImage(panel,0,0,px,py,x,y,w,h);ctx.restore();
    }
    ctx.restore();
  }
}
