import {parts} from './motion/joints.mjs';
import {drawHeld} from './held-art.mjs';
import {carryAnchor} from './nacho-moves.mjs';

const tau=2*Math.PI;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const blend=(a,b,k)=>a+(b-a)*k;
const point=(x,y)=>({x,y});
const weight=n=>{const t=clamp(n,0,1);return t*t*(3-2*t);};

const textures=new Map();
export function preloadJoints(monster){
  if(typeof Image!=='function')return null;
  let image=textures.get(monster);
  if(!image||image.complete&&!image.naturalWidth){
    image=new Image();image.decoding='async';image.src=new URL('./motion/'+monster+'-joints.webp',import.meta.url).href;
    textures.set(monster,image);
  }
  return image;
}

// Coordinates run from heel strike through toe-off to the next heel strike.
// During contact, the foot moves backwards exactly as far as the body advances.
function stepPath(phase,length,height){
  const u=phase-Math.floor(phase);
  if(u<.5)return point(length*(.25-u),0);
  const t=(u-.5)*2;
  return point(length*(-.25+.5*t*(-1+t*(6-4*t))),-height*Math.sin(t*Math.PI)**1.5);
}
function bend(start,target,upper,lower,side){
  const x=target.x-start.x,y=target.y-start.y;
  const distance=Math.max(.01,Math.hypot(x,y)),ux=x/distance,uy=y/distance;
  const d=clamp(distance,Math.abs(upper-lower)+.01,upper+lower-.01);
  const along=(upper*upper-lower*lower+d*d)/(2*d);
  const out=side*Math.sqrt(Math.max(0,upper*upper-along*along));
  return {start,mid:point(start.x+ux*along-uy*out,start.y+uy*along+ux*out),end:point(start.x+ux*d,start.y+uy*d)};
}
const build={
  nacho:{stride:96,footLift:21,leg:[28,33],arm:[26,32],core:[-29,-132,64,82],hip:[0,-63],shoulder:[-19,-102],footScale:.232},
  skullwing:{stride:110,footLift:15,leg:[30,37],arm:[47,53],core:[-109,-148,221,117],hip:[-38,-55],shoulder:[4,-91],footScale:.22}
};
export function jointPose(a,monster,time,reduced=false){
  const rig=build[monster],ape=monster==='skullwing',phase=a.stride/tau;
  const stride=weight(a.walk/.80),cycle=Math.sin(a.stride);
  const yaw=a.yaw??a.face,side=Math.abs(yaw),facing=Math.sign(yaw)||a.face;
  const breath=reduced?0:.7*Math.sin(time*2.6);
  const anchor=a.haul?carryAnchor(a):null;
  const handHeight=anchor?anchor.y-a.y:0;
  const h=a.haul,flight=a.flight||0,slam=a.slamDrive||0;
  const scoop=h?.phase==='lift'?weight(1-handHeight/(ape?88:110))*weight(h.age/.105):0;
  const rip=h?.phase==='tear'?weight(h.age/.12)*(1-weight((h.age-.18)/.30)):0;
  const recoil=a.grounded?(a.land||0)*(1-slam):0;
  const eating=h?.phase==='eat';
  const chew=eating?Math.sin(Math.PI*clamp((h.age-.29)/.22,0,1)):0;
  const roar=ape?Math.sin(Math.PI*(a.roar||0)):0;
  const windup=h?.phase==='throw'?Math.sin(Math.PI*Math.min(1,h.age/.16)):0;
  const crouch=(ape?15:41)*scoop+(ape?5:13)*rip;
  const bob=crouch+breath+stride*(1.2+1.8*Math.cos(2*a.stride))+(ape?6:13)*recoil-3*roar;
  const twist=cycle*stride*(ape?3.3:3.9),punch=a.swipe>0&&!h&&a.throwPose<=0;
  const hit=punch?1-a.swipe:0;
  const wind=punch?Math.sin(Math.PI*clamp(hit/.23,0,1)):0;
  const drive=punch?weight((hit-.15)/.28)*(1-weight((hit-.48)/.52)):0;
  const turn=1-side;
  const torsoX=(drive*12-wind*3+crouch*.31+13*rip-5*windup-3*turn)*side;
  const tilt=(drive*.10-wind*.042)*side+twist*.004+.53*scoop+.35*rip+.06*chew-.12*windup-.11*roar;
  const reachIn=h&&(h.phase==='lift'||h.phase==='tear')?weight(h.age/(h.phase==='tear'?.12:.105)):1;
  const grip=eating?1-weight((h.age-.43)/.27):reachIn;
  const pitch=(ape ? .73 : 1.54)*slam*(ape&&h ? .25 : 1);
  const body={x:torsoX,y:bob,tilt};
  const wingBeat=flight*Math.sin(time*8.4-.5)*.27*(1-slam)+stride*Math.sin(a.stride*2)*.022;
  const wing={angle:wingBeat+(a.flap||0)*flight*.11,fold:slam*.38};
  const root={angle:pitch,x:(ape?3:9)*slam,y:-66+(ape?4:42)*slam};
  // Rotate the actual limb sockets with the same pelvis pivot as the painting.
  function socket(x,y){
    const height=y+66;
    return point(torsoX+x*Math.cos(tilt)-height*Math.sin(tilt),bob-66+x*Math.sin(tilt)+height*Math.cos(tilt));
  }
  const release=a.throwPose>0?1-a.throwPose:null;
  const limbs=[0,1].map(index=>{
    const near=index===1,opposite=near?1:-1;
    const foot=stepPath(phase+(near?0:.5),rig.stride,rig.footLift);
    const hip=socket(rig.hip[0]+(near?(ape?-6:-11):(ape?7:23)),rig.hip[1]);
    const ankle=point(rig.hip[0]+(near?-11:15)+foot.x*stride,-(ape?8:9)+foot.y*stride);
    const tuck=flight*(1-.82*slam);
    ankle.x+=tuck*(near?13:-13)-slam*(near?4:11);
    ankle.y-=tuck*(near?26:19)+slam*(near?4:9);
    const leg=bend(hip,ankle,...rig.leg,-1);
    const shoulder=socket(rig.shoulder[0]+(near?0:(ape?22:39))+twist*opposite,rig.shoulder[1]+(near?0:2));
    let hand;
    if(ape){
      const paw=stepPath(phase+(near?.5:0),rig.stride,20);
      hand=point((near?20:53)+paw.x*stride,-12+paw.y*stride);
    }else{
      hand=point(shoulder.x+21-opposite*Math.cos(a.stride)*25*stride,shoulder.y+33+opposite*Math.sin(a.stride+.48)*9*stride);
    }
    if(flight>.001){
      const level=ape?22:-23,spread=near?1:-1;
      hand.x=blend(hand.x,shoulder.x+(ape?47:33)+spread*8,flight);
      hand.y=blend(hand.y,shoulder.y+level+spread*8,flight);
    }
    if(slam>.001){
      const reach=ape?point(shoulder.x+(near?45:66),shoulder.y+(near?77:59)):
        point(shoulder.x+(near?12:25),shoulder.y-(near?54:46));
      hand.x=blend(hand.x,reach.x,slam);hand.y=blend(hand.y,reach.y,slam);
    }
    hand.y-=roar*(near?27:18);
    let elbowSide=1;
    if(anchor&&(near||h.kind!=='person')){
      const spread=h.kind==='car'?(ape?8:13):h.kind==='wall'?5:0;
      const worldX=(anchor.x-a.x)*facing-opposite*spread,worldY=a.y-anchor.y+(spread?2:0);
      // Undo the body's aerial pitch before asking the arm to meet a world-space prop.
      const dx=worldX-root.x,dy=worldY-root.y;
      const palmX=dx*Math.cos(pitch)+dy*Math.sin(pitch),palmY=-dx*Math.sin(pitch)+dy*Math.cos(pitch)-66;
      hand.x=blend(hand.x,palmX,grip);hand.y=blend(hand.y,palmY,grip);
      if(!ape&&h.kind==='car')elbowSide=near?-1:1;
    }else if(punch&&(near===Boolean(a.hand))){
      hand.x=blend(hand.x-12*wind,shoulder.x+rig.arm[0]+rig.arm[1]-1,drive);
      hand.y=blend(hand.y+wind*3,shoulder.y+6,drive);
    }else if(release!==null&&(near||a.throwKind!=='person')){
      const extension=Math.sin(Math.PI*Math.min(1,release/.81));
      const rest=1-weight(release);
      const start=a.releaseHand||point(ape?90:49,-92);
      const spread=a.throwKind==='car'?(ape?8:13):a.throwKind==='wall'?5:0;
      hand.x=blend(blend(hand.x,start.x-opposite*spread,rest),shoulder.x+rig.arm[0]+rig.arm[1]-2,extension);
      hand.y=blend(blend(hand.y,start.y+(spread?2:0),rest),shoulder.y+5,extension);
    }
    const arm=bend(shoulder,hand,...rig.arm,elbowSide);
    return {leg,arm,roll:stride*Math.sin(a.stride+(near?0:Math.PI))*Math.min(1,-foot.y/6)*.27};
  });
  if(slam>.001&&a.grounded){
    // Support the recovery on the lowest fist, boot or belly as the body rolls upright.
    const sin=Math.sin(pitch),cos=Math.cos(pitch);
    const floor=(p,r)=>root.y+p.x*sin+(p.y+66)*cos+r;
    const contacts=limbs.flatMap(l=>[floor(l.leg.end,ape?8:9),floor(l.arm.end,ape?10:5)]);
    const belly=socket(ape?12:26,ape?-61:-78);
    root.y-=Math.max(0,...contacts,floor(belly,3))*Math.min(1,slam*4);
  }
  return {body,limbs,root,wing,monster};
}
function drawBone(c,image,tile,start,end,width){
  const [sx,sy,sw,sh]=tile.rect,[ox,oy]=tile.start;
  const dx=tile.end[0]-ox,dy=tile.end[1]-oy;
  const length=Math.hypot(end.x-start.x,end.y-start.y)/Math.hypot(dx,dy);
  c.save();c.translate(start.x,start.y);
  c.rotate(Math.atan2(end.y-start.y,end.x-start.x));
  c.scale(length,width);c.rotate(-Math.atan2(dy,dx));
  c.drawImage(image,sx,sy,sw,sh,-ox,-oy,sw,sh);c.restore();
}
export function articulate(image,pose){
  const {monster,body,limbs,root,wing}=pose,rig=build[monster],tiles=parts[monster],ape=monster==='skullwing';
  return {paint(c){
    c.save();c.translate(root.x,root.y);c.rotate(root.angle);c.translate(0,66);
    function chain(i,arm){
      const {leg,arm:reach,roll}=limbs[i],select=name=>tiles[i?name:'far'+name[0].toUpperCase()+name.slice(1)];
      if(arm){
        drawBone(c,image,select('upper'),reach.start,reach.mid,ape?.36:.27);
        drawBone(c,image,select('fore'),reach.mid,reach.end,ape?.35:.25);
      }else{
        drawBone(c,image,select('thigh'),leg.start,leg.mid,ape?.28:.31);
        drawBone(c,image,select('shin'),leg.mid,leg.end,ape?.25:.25);
        const tile=select('foot'),[x,y,w,h]=tile.rect,[px,py]=tile.start,k=rig.footScale;
        c.save();c.translate(leg.end.x,leg.end.y);c.rotate(roll);c.drawImage(image,x,y,w,h,-px*k,-py*k,w*k,h*k);c.restore();
      }
    }
    chain(0,true);chain(0,false);chain(1,false);
    c.save();c.translate(body.x,body.y-66);c.rotate(body.tilt);c.translate(0,66);
    if(ape){
      const [x,y,w,h]=rig.core;
      c.save();c.translate(x,y);c.scale(w/tiles.body.rect[2],h/tiles.body.rect[3]);
      for(const [tile,side] of [[tiles.wingFar,-1],[tiles.wingNear,1]]){
        const [ax,ay]=tile.anchor;
        c.save();c.translate(ax,ay);c.rotate(side*(wing.angle+wing.fold*.38));c.scale(1-wing.fold,1-wing.fold*.30);
        c.drawImage(image,...tile.rect,tile.offset[0]-ax,tile.offset[1]-ay,tile.rect[2],tile.rect[3]);c.restore();
      }
      c.restore();
    }
    c.drawImage(image,...tiles.body.rect,...rig.core);c.restore();
    chain(1,true);c.restore();
  }};
}

// At cruising speed the joint solution repeats once per stride. Retain only the
// selected character's cycle. Custom grips, turns and attacks still solve per draw.
const strideFrames=96;
let currentRunner,cycleTiles;
function cruisingFigure(image,a,monster){
  if(currentRunner!==monster){currentRunner=monster;cycleTiles=new Array(strideFrames);}
  const turns=a.stride/tau,nearest=Math.round(turns*strideFrames);
  const index=(nearest%strideFrames+strideFrames)%strideFrames;
  const templatePhase=index*tau/strideFrames;
  let tile=cycleTiles[index];
  if(!tile){
    const ape=monster==='skullwing',x=ape?-114:-61,y=ape?-156:-141;
    const w=ape?236:137,h=-y+12,scale=1.5;
    const cv=document.createElement('canvas');cv.width=Math.ceil(w*scale);cv.height=Math.ceil(h*scale);
    const g=cv.getContext('2d');g.setTransform(scale,0,0,scale,-x*scale,-y*scale);
    const runner={...a,stride:templatePhase,walk:1,flight:0,land:0,slamDrive:0};
    articulate(image,jointPose(runner,monster,0,true)).paint(g);
    tile=cycleTiles[index]={cv,x,y,w:cv.width/scale,h:cv.height/scale};
  }
  // Cancel the fractional stride displacement at the sole in ground contact.
  const offset=(nearest/strideFrames-turns)*build[monster].stride;
  return {paint(c){c.drawImage(tile.cv,tile.x+offset,tile.y,tile.w,tile.h);}};
}

const playback=new WeakMap();
const lerpPoint=(p,q,t)=>point(blend(p.x,q.x,t),blend(p.y,q.y,t));
const angle=(p,q)=>Math.atan2(q.y-p.y,q.x-p.x);
const angleMix=(from,to,t)=>from+t*Math.atan2(Math.sin(to-from),Math.cos(to-from));
function connectedChain(old,now,k){
  // Interpolate hinge rotations, then reconstruct each segment at its own length.
  const start=lerpPoint(old.start,now.start,k);
  function segment(parent,a,b,u,v){
    const rotation=angleMix(angle(a,b),angle(u,v),k),length=Math.hypot(v.x-u.x,v.y-u.y);
    return point(parent.x+length*Math.cos(rotation),parent.y+length*Math.sin(rotation));
  }
  const mid=segment(start,old.start,old.mid,now.start,now.mid);
  return {start,mid,end:segment(mid,old.mid,old.end,now.mid,now.end)};
}
function settle(from,to,k){
  const limbs=to.limbs.map((limb,i)=>({
    arm:connectedChain(from.limbs[i].arm,limb.arm,k),
    leg:connectedChain(from.limbs[i].leg,limb.leg,k),roll:blend(from.limbs[i].roll,limb.roll,k)
  }));
  const body={...lerpPoint(from.body,to.body,k),tilt:blend(from.body.tilt,to.body.tilt,k)};
  const root={...lerpPoint(from.root,to.root,k),angle:blend(from.root.angle,to.root.angle,k)};
  const wing={angle:blend(from.wing.angle,to.wing.angle,k),fold:blend(from.wing.fold,to.wing.fold,k)};
  return {monster:to.monster,body,root,wing,limbs};
}
function action(a){
  if(a.dive)return 'dive';
  if(a.splashPose>0)return 'impact';
  if(a.haul)return a.haul.phase;
  if(a.throwPose>0)return 'release';
  if(a.swipe>0)return 'punch'+a.hand;
  if(!a.grounded)return 'air';
  return a.roar>.001?'roar':'stride';
}

export function drawMonster(c,a,time,monster,reduced){
  const image=preloadJoints(monster);
  if(!image?.complete||!image.naturalWidth)return;
  const mode=action(a),facing=Math.sign(a.yaw??a.face)||a.face;
  let pose=jointPose(a,monster,time,reduced),state=playback.get(a);
  if(!state){state={mode};playback.set(a,state);}
  if(mode!==state.mode){
    state.from=time-state.time<.09?state.pose:null;
    state.start=time;state.mode=mode;
  }
  if(state.from){
    const k=weight((time-state.start)/.072);
    if(k<1)pose=settle(state.from,pose,k);else state.from=null;
  }
  state.pose=pose;state.time=time;
  const cruise=mode==='stride'&&!state.from&&a.walk>=.8&&a.flight<.005&&a.land<.01&&a.slamDrive<.002&&Math.abs(a.yaw??a.face)>.999;
  c.save();c.scale(facing,1);
  const figure=cruise?cruisingFigure(image,a,monster):articulate(image,pose);
  figure.paint(c);drawHeld(c,a,facing,time,reduced);c.restore();
}
