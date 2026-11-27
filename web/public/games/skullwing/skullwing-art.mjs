import {monsterFrames} from './monster-frames.mjs';
import {carryPose} from './nacho-moves.mjs';
import {drawHeld} from './held-art.mjs';
import {drawRex} from './rex.mjs';

const sheets=new Map();
export function preloadSkullwing(){
  for(const name of ['skullwing-street','skullwing-flight','skullwing-gait','skullwing-motion']){
    if(sheets.has(name))continue;
    const img=new Image();img.src=new URL('./'+name+'.webp',import.meta.url).href;sheets.set(name,img);
  }
}
const walk=['strideA','walk1','walk2','walk3','walk4','walk5','strideB','walk7','walk8','walk9','walk10','walk11'];
const punch=['strideA','strideAStrike1','strideAStrike2','strike','strike','strideAStrike2','strideAStrike1','strideA'];
const reach=['strideA','strideAReach1','strideAReach2','reach'];
const lift=['reach','reachHold1','reachHold2','hold'];
const bite=['hold','holdBite1','holdBite2','bite'];
const launch=['launch','launchGlide1','launchGlide2','glide'];
const meteor=['glide','glideDive1','glideDive2','dive'];
const recover=['impact','impact','impactStridea1','impactStridea2','strideA'];
const sample=(arr,k)=>arr[Math.round(Math.max(0,Math.min(1,k))*(arr.length-1))];

function body(a,t,pose) {
  if(a.dive)return sample(meteor,1-a.flopWindup/.105);
  if(a.splashPose>0)return sample(recover,1-a.splashPose);
  const h=a.haul;
  if(h){
    if(h.phase==='lift')return h.age<.13?sample(reach,h.age/.13):sample(lift,(h.age-.13)/.34);
    if(h.phase==='eat')return sample(bite,h.age/.29);
    if(h.phase==='tear')return h.age<.19?'strike':sample(lift,(h.age-.19)/.30);
    return pose.name;
  }
  if(a.throwPose>0)return sample(punch,Math.max(.4,1-a.throwPose));
  if(!a.grounded)return sample(launch,Math.min(1,(1-a.flap)*1.6)+Math.sin(t*8)*.12);
  if(a.swipe>0)return sample(punch,1-a.swipe);
  if(a.roar>.13)return 'bite';
  return a.walk>.10?walk[Math.floor(a.stride*12/(2*Math.PI))%12]:'strideA';
}

export function drawSkullwing(c,a,time,facing,reduced=false) {
  const pose=a.haul?carryPose(a):null,key=body(a,time,pose),f=monsterFrames[key];
  const sheet=sheets.get(f.sheet);
  if(!sheet?.complete||!sheet.naturalWidth){
    drawRex(c,{time,walk:a.walk,facing,air:a.flight,slam:a.dive?1:a.land,swipe:a.swipe,roar:a.roar,reduced,glide:a.glide,flap:a.flap,stride:a.stride,hand:a.hand});
    c.save();c.scale(facing,1);drawHeld(c,a,facing,time,reduced,pose);c.restore();return;
  }
  const [sx,sy,sw,sh]=f.rc,w=f.height*sw/sh;
  c.save();c.scale(facing,1);
  c.save();
  if(!pose){
    const tilt=a.dive?.08*Math.min(1,Math.max(0,-a.vy/720)):
      !a.grounded?Math.sin(time*7)*.026:Math.sin(a.stride)*a.walk*.018;
    c.rotate(reduced?0:tilt);
    if(!reduced&&!a.dive)c.translate(0,-(a.walk*Math.abs(Math.sin(a.stride))*1.3+
      (a.grounded&&a.walk<.1?1+Math.sin(time*2.5):0)));
  }
  c.drawImage(sheet,sx,sy,sw,sh,-w*f.pivot,-f.height+f.bottom,w,f.height);
  c.restore();drawHeld(c,a,facing,time,reduced,pose);c.restore();
}
