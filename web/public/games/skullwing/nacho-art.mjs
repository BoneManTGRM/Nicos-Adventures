import {frames} from './nacho-frames.mjs';
import {drawHeld} from './held-art.mjs';
import {carryPose} from './nacho-moves.mjs';

const images=new Map();
function imageFor(name) {
  if(!images.has(name)&&typeof Image==='function'){
    const image=new Image();
    image.src=new URL('./nacho-'+name+'.webp',import.meta.url).href;
    images.set(name,image);
  }
  return images.get(name);
}
export function preloadNacho() {
  for(const name of ['champion','stride','combat','splash','walk','hoist','strike','landing','snack'])imageFor(name);
}
const ready=image=>image?.complete&&image.naturalWidth>0;
const cycle=['stepA','stepAOut','passBIn','passB','passBOut','stepBIn',
  'stepB','stepBOut','passAIn','passA','passAOut','stepAIn'];

// Durations are expressed as progress through each simulation action. Holding
// the contact drawing briefly gives hits weight while the recovery keeps moving.
const punch=['guard','guardWind1','guardWind2','wind','windPunch1','windPunch2','punch','punch','punchGuard1','punchGuard2','guard'];
const release=['throw','throw','throwGuard1','throwGuard2','guard'];
const takeoff=['guard','guardJump1','guardJump2','jump'];
const flop=['jump','jumpTip1','jumpTip2','tip','tipDive1','tipDive2','dive'];
const recovery=['impact','impact','impactPushup1','impactPushup2','pushup','pushupRise1','pushupRise2','rise','riseGuard1','riseGuard2','guard'];
function sample(poses,t) {
  return poses[Math.round(Math.max(0,Math.min(1,t))*(poses.length-1))];
}

function movingPose(a) {
  if(a.dive)return sample(flop,1-a.flopWindup/.13);
  if(a.splashPose>0)return sample(recovery,1-a.splashPose);
  if(a.throwPose>0)return sample(release,1-a.throwPose);
  if(a.swipe>0)return sample(punch,1-a.swipe);
  if(!a.grounded)return sample(takeoff,(.7-a.flap)/.19);
  if(a.walk>.12){
    const phase=a.stride/(2*Math.PI);
    return cycle[Math.floor((phase-Math.floor(phase))*cycle.length)];
  }
  return 'guard';
}

function wholeFigure(c,image,frame,angle,bottom=0) {
  const [sx,sy,sw,sh]=frame.rect, h=frame.height,w=h*sw/sh;
  c.save();c.rotate(angle);
  c.drawImage(image,sx,sy,sw,sh,-w*frame.pivot,-h+bottom,w,h);
  c.restore();
}

// Give a loaded walk a short shuffle without bending the painted upper body or
// breaking the grip. Below the leg fork each boot follows its own planted step.
function carryingFigure(c,image,frame,a,lean) {
  if(a.walk<.12 || !a.grounded || a.haul.phase!=='hold'){
    wholeFigure(c,image,frame,lean,frame.bottom??0);return;
  }
  const [sx,sy,sw,sh]=frame.rect,h=frame.height,w=h*sw/sh;
  const stageX=-w*frame.pivot,split=frame===frames.overhead?.48:.42;
  const fork=.73,cutY=Math.round(sh*fork),cutX=Math.round(sw*split);
  c.save();c.rotate(lean);
  c.drawImage(image,sx,sy,sw,cutY,stageX,-h,w,cutY*h/sh);
  // Source rows meet on integer pixel boundaries; the slight overlap below
  // fills subpixel antialiasing at the edges during movement.
  const strips=9;
  for(const direction of [-1,1]){
    const x0=direction<0?0:cutX, width=direction<0?cutX:sw-cutX;
    const gait=Math.sin(a.stride)*direction*a.walk, lift=Math.max(0,gait)*4;
    function offset(y){
      const p=(y-cutY)/(sh-cutY);
      return [stageX+x0*w/sw+gait*4*p*p,-h+y*h/sh-lift*p*p];
    }
    for(let i=0;i<strips;i++){
      const y0=cutY+Math.round((sh-cutY)*i/strips), y1=cutY+Math.round((sh-cutY)*(i+1)/strips);
      const [dx,dy]=offset(y0),[,nextY]=offset(y1);
      c.drawImage(image,sx+x0,sy+y0,width,y1-y0,dx,dy,width*w/sw,nextY-dy+.18);
    }
  }
  c.restore();
}

export function drawNacho(c,a,time,facing,reduced=false) {
  c.save();c.scale(facing,1);
  const haul=a.haul,pose=haul?carryPose(a):null;
  const name=pose?.name??movingPose(a),frame=frames[name],sheet=imageFor(frame.sheet);
  if(ready(sheet)){
    if(haul)carryingFigure(c,sheet,frame,a,pose.lean);
    else{
      const idle=name==='guard'&&!reduced;
      const lean=idle?Math.sin(time*2.5)*.007:
        name==='tip'?(a.flopWindup-.06)*1.1:
        name==='dive'?.035:0;
      wholeFigure(c,sheet,frame,lean,frame.bottom??0);
    }
  }else{
    const champion=imageFor('champion');
    if(ready(champion)){
      const h=140,w=h*champion.naturalWidth/champion.naturalHeight;
      c.drawImage(champion,-w*.48,-h,w,h);
    }
  }
  drawHeld(c,a,facing,time,reduced,pose);
  c.restore();
}
