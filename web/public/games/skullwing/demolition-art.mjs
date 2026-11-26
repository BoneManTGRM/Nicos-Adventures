// Each moving panel carries a piece of the actual district facade and its impact scars.
import {drawBuilding} from './city-art.mjs';

import {expansionPalettes} from './city-palettes.mjs';

const structures = new WeakMap();
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const duration = 1.55;
const steps = 84;
const rate = steps / duration;
const materials = [
  {dark:'#192b3e',room:'#415061',lit:'#c99a76',cut:'#ba9e91',steel:'#758d99',edge:'#e6c5a4'},
  {dark:'#382e3b',room:'#675457',lit:'#d59a64',cut:'#c68d70',steel:'#908b81',edge:'#edc79b'},
  {dark:'#1b3246',room:'#47596a',lit:'#c1aa83',cut:'#a2aeb6',steel:'#839ba7',edge:'#d8dfd7'},
  ...expansionPalettes.map(p=>({dark:p.outline,room:p.faces[1][1],lit:p.faces[0][0],cut:p.trim,steel:p.glass[2],edge:p.light}))
];

function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function surface(left, top, width, height, scale) {
  const right=left+width,bottom=top+height;
  left=Math.floor(left*scale)/scale;top=Math.floor(top*scale)/scale;
  const w=Math.max(1,Math.ceil((right-left)*scale)),h=Math.max(1,Math.ceil((bottom-top)*scale));
  const cv = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(w,h) : document.createElement('canvas');
  if (cv.width !== w) cv.width = w;
  if (cv.height !== h) cv.height = h;
  const c = cv.getContext('2d');
  c.setTransform(scale,0,0,scale,-left*scale,-top*scale);
  return {cv,c,left,top,w:w/scale,h:h/scale};
}
function paint(c,image,x=0,y=0) {
  c.drawImage(image.cv,image.left+x,image.top+y,image.w,image.h);
}
function trace(c,points) {
  c.beginPath(); c.moveTo(...points[0]);
  for (let i=1;i<points.length;i++) c.lineTo(...points[i]);
  c.closePath();
}
function face(c,points,color) {
  trace(c,points); c.fillStyle=color; c.fill();
}
function line(c,points,color,width) {
  c.beginPath(); c.moveTo(...points[0]);
  for (let i=1;i<points.length;i++) c.lineTo(...points[i]);
  c.strokeStyle=color; c.lineWidth=width; c.stroke();
}
function box(c,x,y,w,h,color) {
  c.fillStyle=color; c.fillRect(x,y,w,h);
}
function floorCount(b) {return Math.max(3,Math.round(b.h/21));}

function exposeRoom(c,b,site,index,wear,p) {
  const rng = random(b.seed+index*8129);
  const cx=clamp(site.x,-b.w*.47,b.w*.47), cy=-clamp(site.y,4,b.h-2);
  const rx=b.w*(.14+wear*.085)+rng()*2, ry=8+wear*8+rng()*3;
  const outline=[];
  for (let n=0;n<17;n++) {
    const angle=(n+.2*rng())*2*Math.PI/17, radius=.70+rng()*.45;
    outline.push([cx+Math.cos(angle)*rx*radius,cy+Math.sin(angle)*ry*radius]);
  }
  c.save();
  c.beginPath();c.rect(-b.w/2+.2,-b.h+2,b.w-.4,b.h-2);c.clip();
  // Remove the outer skin first: holes on the edge can reveal actual sky.
  c.save(); c.globalCompositeOperation='destination-out';face(c,outline,'#000');c.restore();
  c.save();trace(c,outline);c.clip();
  const left=-b.w/2+3.2, right=b.w/2-4, pitch=b.h/floorCount(b);
  box(c,left,-b.h,right-left,b.h,p.dark);
  for(let row=0;row<floorCount(b);row++) {
    const bottom=-row*pitch;
    if(bottom<cy-ry-2 || bottom-pitch>cy+ry+2) continue;
    const cols=Math.max(3,Math.round(b.w/22)), span=(right-left)/cols;
    for(let col=0;col<cols;col++) {
      const x=left+span*col, y=bottom-pitch, warm=(row+col+b.seed)%3===0;
      box(c,x+2,y+1,span-3,pitch-4,warm?p.lit:p.room);
      // Back wall in perspective, with an open doorway or a hanging light.
      face(c,[[x+1,y],[x+5,y+3],[x+5,bottom-5],[x+1,bottom-2]],p.dark);
      if((row+col)%2===0) {
        box(c,x+span*.48,bottom-pitch*.63,span*.26,pitch*.53,p.dark);
        box(c,x+span*.49,bottom-pitch*.6,1,pitch*.5,p.steel);
      } else {
        box(c,x+span*.43,y+1,.75,3,p.dark);
        box(c,x+span*.32,y+4,span*.25,1.3,p.edge);
        box(c,x+span*.51,bottom-5,span*.32,1.4,p.steel);
      }
      box(c,x,bottom-pitch,1.5,pitch,p.steel);
    }
    box(c,left,bottom-3,right-left,2.6,p.dark);
    box(c,left,bottom-3,right-left,1.1,p.cut);
  }
  c.restore();
  // Dust catches the torn masonry lips; cables and fissures stay on the impact.
  for(let i=0;i<outline.length;i++){
    const a=outline[i],d=outline[(i+1)%outline.length];
    line(c,[a,d],a[1]<cy?p.dark:p.cut,i%3===0?1.7:1.1);
    if(i%4===index%4){
      const dx=(a[0]-cx)*.49,dy=(a[1]-cy)*.52;
      line(c,[a,[a[0]+dx*.31+1.7,a[1]+dy*.44],[a[0]+dx*.7-.8,a[1]+dy*.62],[a[0]+dx,a[1]+dy]],p.dark,.9);
    }
    if(i%5===0 && a[1]<cy)
      line(c,[a,[a[0]+.8,a[1]+4.4],[a[0]+2.8,a[1]+6.5]],p.steel,.8);
  }
  c.restore();
}
function facade(b,opts,scale) {
  const image=surface(-b.w/2-11,-b.h-43,b.w+22,b.h+46,scale);
  drawBuilding(image.c,{...b,hp:b.maxHp},opts);
  const wear=clamp(1-b.hp/Math.max(1,b.maxHp),0,1), p=materials[opts.district]||materials[0];
  if(wear>0) {
    const sites=b.damageSites?.length?b.damageSites:[{x:b.hitX??0,y:b.hitY??b.h*.4}];
    sites.forEach((site,i)=>exposeRoom(image.c,b,site,i,wear,p));
  }
  return image;
}

// Shared nodes and torn edges tessellate exactly when the walls are still together.
function panels(b,rng) {
  const n=floorCount(b), cols=Math.max(3,Math.round(b.w/25));
  const xs=Array.from({length:cols+1},(_,i)=>b.w*(i/cols-.5));
  xs[0]-=2; xs[cols]+=2;
  const rows=Array.from({length:n+1},(_,r)=>xs.map((x,i)=>[
    x+(i>0&&i<cols?(rng()-.5)*8:0),
    -b.h+3+(b.h-2)*r/n+(r>0&&r<n?(rng()-.5)*4:0)
  ]));
  const pieces=[];
  for(let r=0;r<n;r++){
    const teeth=xs.map((_,i)=>{
      const a=rows[r][i],d=rows[r+1][i],dx=i>0&&i<cols?(rng()-.5)*7:0;
      return [(a[0]+d[0])/2+dx,a[1]+(d[1]-a[1])*(.3+.4*rng())];
    });
    for(let col=0;col<cols;col++)
      pieces.push({kind:'wall',points:[rows[r][col],rows[r][col+1],teeth[col+1],rows[r+1][col+1],rows[r+1][col],teeth[col]]});
  }
  // Split rooftop equipment from the street-facing cornice at a different seam.
  const roofX=[-b.w/2-10,-b.w*.095,b.w/2+10];
  for(let i=0;i<2;i++)
    pieces.push({kind:'roof',points:[[roofX[i],-b.h-43],[roofX[i+1],-b.h-43],[roofX[i+1],-b.h+3],[roofX[i],-b.h+3]]});
  return pieces;
}

function cutPanels(pieces,source,scale) {
  // Pack the fragments into one texture so dozens of tiny canvases never need to
  // be created or switched between during a combo on a phone.
  const atlasWidth=Math.max(160,Math.ceil(source.w*2.1*scale));
  let nextX=0, nextY=0, rowHeight=0;
  for(const q of pieces){
    const x=q.points.map(pt=>pt[0]),y=q.points.map(pt=>pt[1]);
    const l=Math.min(...x),r=Math.max(...x),t=Math.min(...y),b=Math.max(...y);
    q.x=(l+r)/2;q.y=q.kind==='roof'?b-9:(t+b)/2;
    q.height=q.kind==='roof'?16:b-t;
    q.width=q.kind==='roof'?(r-l)*.81:r-l;
    const left=source.left+Math.floor((l-1-source.left)*scale)/scale;
    const top=source.top+Math.floor((t-1-source.top)*scale)/scale;
    const sw=Math.ceil((r+1-left)*scale),sh=Math.ceil((b+1-top)*scale);
    if(nextX+sw>atlasWidth){nextX=0;nextY+=rowHeight+2;rowHeight=0;}
    q.tile={sx:nextX,sy:nextY,sw,sh,left,top,w:sw/scale,h:sh/scale};
    nextX+=sw+2;rowHeight=Math.max(rowHeight,sh);
    if(q.kind==='wall'){
      const local=q.points.map(([px,py])=>[px-q.x,py-q.y]);
      const a=local[4],d=local[3],e=local[2];
      q.lip=[a,d,[d[0]-1,d[1]+2.9],[a[0]+2,a[1]+2.1]];
      q.side=[d,e,local[1],[local[1][0]+2.4,local[1][1]+2],[e[0]+3,e[1]+2],[d[0]+.4,d[1]+2.5]];
    }
  }
  const atlas=surface(0,0,atlasWidth,nextY+rowHeight,1),c=atlas.c;
  for(const q of pieces){
    const t=q.tile;
    c.save();c.setTransform(scale,0,0,scale,t.sx-t.left*scale,t.sy-t.top*scale);
    trace(c,q.points);c.clip();paint(c,source);c.restore();
  }
  return atlas.cv;
}

function makeFrame(b,rng,p) {
  const pieces=[], n=floorCount(b), floor=b.h/n;
  const left=-b.w*.45, right=b.w*.44;
  for(let i=0;i<n;i++) {
    const fy=-(i+1)*floor+3, join=(rng()-.5)*b.w*.22;
    for(const [x1,x2] of [[left,join],[join,right]]) {
      const width=x2-x1, x=(x1+x2)/2;
      const beam={x,y:fy,width,height:3.4,kind:'slab'};
      beam.render=c=>{
        face(c,[[-width/2,-1.3],[width/2-1,-2],[width/2,1.1],[-width/2+1.7,2]],p.dark);
        line(c,[[-width/2,-1],[width/2-1,-1.6]],p.cut,1.5);
        line(c,[[width*.26,-1.6],[width*.26+3,-3.3],[width*.26+5,-3]],p.steel,.85);
      };
      pieces.push(beam);
    }
    // A few back rooms shear away behind the near wall. Their lit doorways,
    // diagonal braces and open bays give the silhouette real depth as it breaks.
    const roomWidth=b.w*(.24+rng()*.13),roomHeight=floor*.79;
    const roomX=(i%2===0?-.19:.14)*b.w+(rng()-.5)*b.w*.13;
    const warmer=(i+b.seed)%3===0;
    pieces.push({x:roomX,y:fy+roomHeight/2,width:roomWidth,height:roomHeight,kind:'room',render(c){
      const l=-roomWidth/2,r=roomWidth/2,t=-roomHeight/2,bottom=roomHeight/2;
      face(c,[[l,t],[r,t+1],[r-2,bottom-1],[l+1,bottom]],p.dark);
      face(c,[[l+2,t+2],[r-3,t+3],[r-4,bottom-3],[l+3,bottom-2]],warmer?p.lit:p.room);
      box(c,l+roomWidth*.27,t+roomHeight*.37,roomWidth*.19,roomHeight*.55,p.dark);
      line(c,[[l+1,bottom-1],[r-1,t+2]],p.steel,1.05);
      line(c,[[l,bottom],[r-2,bottom-1.5]],p.cut,1.5);
    }});
    for(const x of [left+4,right-3]){
      const width=3.2, height=floor-1;
      pieces.push({x,y:fy+height/2+1,width,height,kind:'post',render(c){
        box(c,-1.7,-height/2,3.2,height,p.dark);
        box(c,-1.5,-height/2,.95,height,p.steel);
        line(c,[[.8,-height*.4],[-1.5,-height*.18],[1,height*.11],[-1.3,height*.33]],p.cut,.62);
      }});
    }
  }
  return pieces;
}

// Gravity, rotating contact bounds, restitution and ground friction are baked once.
// Rendering then interpolates between poses even if the game steps at a variable rate.
function trajectory(piece,b,rng,reduced) {
  const style=b.breakStyle||'punch', dir=b.fallDir||1, hx=b.hitX??0, hy=-(b.hitY??b.h*.43);
  const dx=piece.x-hx,dy=piece.y-hy;
  const radial=Math.hypot(dx,dy*.78), high=clamp(-piece.y/b.h,0,1);
  const frame=piece.kind==='slab'||piece.kind==='post';
  const backRoom=piece.kind==='room';
  const blast=style==='blast'||style==='roar', stomp=style==='stomp'||style==='crash';
  const proximity=Math.max(0,1-radial/(b.w*.8));
  const energy=reduced?.43:1;
  const delay=Math.min(.40,(radial/(stomp?690:540))+.045*rng()+(frame?.09:backRoom?.15:0));
  let vx=((blast||stomp?(dx<0?-1:1)*(16+proximity*34):dir*(14+proximity*45))+(rng()-.5)*(42+23*high))*energy;
  if(piece.kind==='roof') vx+=(rng()-.5)*45*energy;
  let vy=-(12+rng()*23+proximity*(stomp?105:blast?94:47))*energy;
  let spin=(rng()-.5)*4.6+Math.sign(vx)*(.55+proximity*1.7);
  if(piece.kind==='post') spin+=(piece.x>0?1:-1)*1.7;
  spin*=reduced?.66:1;
  let x=piece.x,y=piece.y,angle=0,fold=1,contacts=0;
  const restingFold=frame?1:.39+rng()*.47, bedLevel=rng(), depth=rng();
  const foldTime=.48+Math.abs(Math.sin(piece.x*3.24))*.24;
  const poses=new Float32Array((steps+1)*4);
  for(let step=0;step<=steps;step++) {
    const time=step/rate, t=time-delay, dt=1/rate;
    if(t>0){
      vy+=660*dt;
      x+=vx*dt;y+=vy*dt;angle+=spin*dt;
      fold=1-(1-restingFold)*clamp(t/foldTime,0,1);
      const s=Math.abs(Math.sin(angle)),cos=Math.abs(Math.cos(angle));
      const radius=s*piece.width/2+cos*piece.height*fold/2;
      const mound=Math.max(0,1-Math.abs(x-dir*b.w*.1)/(b.w*.73));
      const ground=Math.min(2,-mound*bedLevel*(8+4*high)+depth*3);
      if(y+radius>ground && vy>=0){
        y=ground-radius;
        if(vy>50 && contacts<3){
          vy=-vy*(contacts===0?.22:.16)*(reduced?.55:1);
          spin*=contacts===0?.63:.4;
          vx*=.62; contacts++;
        } else {
          vy=0;vx*=.76;spin*=.84;
        }
      }
    }
    const i=step*4;poses[i]=x;poses[i+1]=y;poses[i+2]=angle;poses[i+3]=fold;
  }
  piece.poses=poses;piece.delay=delay;
}

function makeBreak(b,source,state,opts) {
  const rng=random(b.seed+7373), p=materials[opts.district]||materials[0];
  const walls=panels(b,rng);
  const atlas=cutPanels(walls,source,state.scale);
  const pieces=[...makeFrame(b,rng,p),...walls];
  pieces.forEach(q=>trajectory(q,b,rng,opts.reduced));
  // The broken footing ties the pile to the curb and fills the space below
  // panels that have stacked against each other.
  const base=surface(-b.w*.73,-18,b.w*1.46,25,state.scale),c=base.c;
  c.beginPath();c.ellipse(0,1.3,b.w*.68,4.2,0,0,Math.PI*2);c.fillStyle='rgba(18,21,34,.47)';c.fill();
  for(let i=0;i<16;i++){
    const x=b.w*(i/16-.49),w=3+rng()*10;
    const h=2+(1-Math.min(1,Math.abs(x)/(b.w*.49)))*rng()*10,y=1.7+rng()*2.2;
    face(c,[[x-w*.4,y],[x-w*.15,y-h*.81],[x+w*.2,y-h],[x+w*.6,y-h*.35],[x+w*.7,y]],p.dark);
    face(c,[[x-w*.15,y-h*.81],[x+w*.2,y-h],[x+w*.6,y-h*.35],[x+w*.12,y-h*.48]],p.cut);
  }
  return {pieces,p,atlas,base};
}

function drawBreak(c,broken,progress) {
  const position=clamp(progress,0,1)*steps, i=Math.floor(position)*4;
  const j=Math.min(i+4,steps*4), blend=position%1;
  if(progress>.08){
    c.save();c.globalAlpha*=clamp((progress-.08)*3.8,0,1);paint(c,broken.base);c.restore();
  }
  for(const q of broken.pieces) {
    const a=q.poses;
    const x=a[i]+(a[j]-a[i])*blend, y=a[i+1]+(a[j+1]-a[i+1])*blend;
    const angle=a[i+2]+(a[j+2]-a[i+2])*blend, fold=a[i+3]+(a[j+3]-a[i+3])*blend;
    const free=progress*duration-q.delay;
    c.save();c.translate(x,y);c.rotate(angle);
    if(q.render) {c.scale(1,fold);q.render(c);}
    else {
      c.scale(1,fold);
      if(q.lip&&free>.04){
        face(c,q.lip,broken.p.cut);face(c,q.side,broken.p.room);
      }
      const t=q.tile;
      c.drawImage(broken.atlas,t.sx,t.sy,t.sw,t.sh,t.left-q.x,t.top-q.y,t.w,t.h);
    }
    c.restore();
  }
}

function scaleFor(c) {
  const matrix=c.getTransform?.();
  const ratio=matrix?Math.hypot(matrix.a,matrix.b):(globalThis.devicePixelRatio||1);
  return ratio>1.15?2:1;
}
function impactKey(b) {
  const sites=b.damageSites||[], last=sites[sites.length-1];
  return [b.hp,sites.length,last?.x??b.hitX,last?.y??b.hitY].join('/');
}

export function drawStructure(c,b,{district=0,time=0,reduced=false}={}) {
  const options={district,time,reduced};
  if(!b.fall&&!b.ruin&&b.hp>=b.maxHp) {
    drawBuilding(c,b,options);return;
  }
  const scale=scaleFor(c);
  let state=structures.get(b);
  if(!state||state.scale!==scale||state.district!==district||state.reduced!==reduced) {
    state={scale,district,reduced};structures.set(b,state);
  }
  if(state.ruin && b.ruin) {paint(c,state.ruin);return;}
  if(!state.broken){
    const key=impactKey(b);
    if(state.key!==key){
      state.image=facade(b,options,scale);state.key=key;
    }
    if(!b.fall&&!b.ruin) {paint(c,state.image);return;}
    state.broken=makeBreak(b,state.image,state,options);
    state.image=null;
  }
  if(b.ruin) {
    // Cache the final poses with their original signs, windows, rooftop details and steel.
    const radius=b.w*.75+110;
    state.ruin=surface(-radius,-75,radius*2,91,scale);
    drawBreak(state.ruin.c,state.broken,1);
    state.broken=null;
    paint(c,state.ruin);
  } else drawBreak(c,state.broken,b.fall);
}
