import {parts} from './motion/joints.mjs';
import {artImage} from './motion-player.mjs';
import {carryAnchor} from './nacho-moves.mjs';

const tau=2*Math.PI;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const blend=(a,b,k)=>a+(b-a)*k;
const point=(x,y)=>({x,y});
const weight=n=>{const t=clamp(n,0,1);return t*t*(3-2*t);};

export function preloadJoints(monster){return artImage('./motion/'+monster+'-joints.webp');}

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
  const crouch=a.haul?.phase==='lift'?(ape?16:48)*weight(1-handHeight/(ape?88:100))*weight(a.haul.age/.1):0;
  const bob=crouch+breath+stride*(1.2+1.8*Math.cos(2*a.stride));
  const twist=cycle*stride*(ape?3.3:3.9),punch=a.swipe>0&&!a.haul;
  const hit=punch?1-a.swipe:0;
  // The fist draws back, accelerates into contact, then folds back into guard.
  const wind=punch?Math.sin(Math.PI*clamp(hit/.23,0,1)):0;
  const drive=punch?weight((hit-.15)/.28)*(1-weight((hit-.48)/.52)):0;
  const torsoX=(drive*12-wind*3+crouch*.26)*side;
  const tilt=(drive*.10-wind*.042)*side+twist*.004;
  const body={x:torsoX,y:bob,tilt};
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
    const ankle=point(rig.hip[0]+(near?-11:15)+foot.x*stride,-(ape?8:9)+foot.y*stride-a.flight*(near?20:15));
    const leg=bend(hip,ankle,...rig.leg,-1);
    const shoulder=socket(rig.shoulder[0]+(near?0:(ape?22:39))+twist*opposite,rig.shoulder[1]+(near?0:2));
    let hand;
    if(ape){
      const paw=stepPath(phase+(near?.5:0),rig.stride,20);
      hand=point((near?20:53)+paw.x*stride,-12+paw.y*stride);
    }else{
      hand=point(shoulder.x+21-opposite*Math.cos(a.stride)*25*stride,shoulder.y+33+opposite*Math.sin(a.stride+.48)*9*stride);
    }
    let elbowSide=1;
    if(anchor&&(near||a.haul.kind!=='person')){
      const gripSpread=a.haul.kind==='car'?(ape?8:13):a.haul.kind==='wall'?5:0;
      hand=point((anchor.x-a.x)*facing-opposite*gripSpread,a.y-anchor.y+(gripSpread?2:0));
      if(!ape&&a.haul.kind==='car')elbowSide=near?-1:1;
    }else if(punch&&(near===Boolean(a.hand))){
      hand.x=blend(hand.x-12*wind,shoulder.x+rig.arm[0]+rig.arm[1]-1,drive);
      hand.y=blend(hand.y+wind*3,shoulder.y+6,drive);
    }else if(release!==null&&near){
      const extension=Math.sin(Math.PI*Math.min(1,release/.85));
      const rest=1-weight(release);
      const start=a.throwKind==='car'&&!ape?point(0,-145):point(ape?87:48,-100);
      const contact=point(shoulder.x+rig.arm[0]+rig.arm[1]-1,shoulder.y+4);
      hand.x=blend(blend(hand.x,start.x,rest),contact.x,extension);hand.y=blend(blend(hand.y,start.y,rest),contact.y,extension);
    }
    const arm=bend(shoulder,hand,...rig.arm,elbowSide);
    return {leg,arm,roll:stride*Math.sin(a.stride+(near?0:Math.PI))*Math.min(1,-foot.y/6)*.27};
  });
  return {body,limbs,monster};
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
  const {monster,body,limbs}=pose,rig=build[monster],tiles=parts[monster],ape=monster==='skullwing';
  return {paint(c){
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
    c.drawImage(image,...tiles.body.rect,...rig.core);c.restore();
    chain(1,true);
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
    const runner={...a,stride:templatePhase,walk:1,flight:0};
    articulate(image,jointPose(runner,monster,0,true)).paint(g);
    tile=cycleTiles[index]={cv,x,y,w:cv.width/scale,h:cv.height/scale};
  }
  // Cancel the fractional stride displacement at the sole in ground contact.
  const offset=(nearest/strideFrames-turns)*build[monster].stride;
  return {paint(c){c.drawImage(tile.cv,tile.x+offset,tile.y,tile.w,tile.h);}};
}

// Ground actions share the same skeleton, so attacking does not restart a step.
export function withJoints(a,time,monster,s,reduced){
  const movingPickup=a.grounded&&a.walk>.35&&['lift','wall','eat'].includes(s.mode);
  const active=s.mode==='carry'||(a.grounded&&['stride','punch','release'].includes(s.mode));
  if(!active&&!movingPickup)return;
  const image=preloadJoints(monster);
  const turn=1-Math.abs(a.yaw??a.face);
  const overhead=a.haul?.kind==='car'&&monster==='nacho';
  if(turn>.13&&(s.mode==='stride'||s.mode==='carry')){
    s.p={from:s.p.from,to:overhead?'overfront':a.haul?'frontHold':'turn',t:Math.min(1,turn*1.17)};
    s.mode='turn';
    if(s.p.t===1)s.face=1;
  }else if(image?.complete&&image.naturalWidth){
    const cruise=s.mode==='stride'&&a.walk>=.8&&a.grounded&&Math.abs(a.yaw??a.face)>.999;
    s.figure=cruise?cruisingFigure(image,a,monster):articulate(image,jointPose(a,monster,time,reduced));
    s.mode='joints';
  }
}
