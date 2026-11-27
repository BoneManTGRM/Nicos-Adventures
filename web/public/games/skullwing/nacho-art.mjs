import {frames} from './nacho-frames.mjs';
import {drawHeld} from './held-art.mjs';
import {carryPose} from './nacho-moves.mjs';
import {artImage,drawMotion,paintedCel,pose,preloadTransitions,timeline,visualYaw} from './motion-player.mjs';

import {preloadJoints,withJoints} from './jointed-motion.mjs';
const punch=['guard','wind','punch','punch','guard'];
const flop=['jump','tip','dive'];
const recover=['dive','impact','pushup','rise','guard'];
const eatTimes=[0,.27,.54,.70,1];
const limit=n=>Math.max(0,Math.min(1,n));
function original(name){
  const f=frames[name]||frames.guard;
  return paintedCel(artImage('./nacho-'+f.sheet+'.webp'),f,f.rect);
}
export function preloadNacho(){
  for(const sheet of ['stride','combat','splash','snack','champion'])artImage('./nacho-'+sheet+'.webp');
  preloadJoints('nacho');preloadTransitions('nacho');
}
const heldPose=kind=>kind==='car'?'overhead':kind==='person'?'grip':'rack';
function loadedMotion(a,h,hand){
  const rest=heldPose(h.kind);
  if(h.phase==='tear'){
    return {mode:'wall',p:timeline(['guard','wind','punch','punch','rack'],[0,.12,.32,.39,1],h.age/.49)};
  }
  if(h.phase==='lift')return {mode:'lift',p:hand.body||pose(rest)};
  if(h.phase==='eat')return {mode:'eat',p:timeline([rest,'snackLift','snackBite','snackGulp','guard'],eatTimes,h.age/.7)};
  if(h.phase==='throw')return {mode:'carry',p:pose(rest),angle:hand.lean};
  return {mode:'carry',p:pose(rest)};
}
function motion(a,hand){
  if(a.haul)return loadedMotion(a,a.haul,hand);
  if(a.dive)return {mode:'flop',p:timeline(flop,[0,.55,1],1-a.flopWindup/.13),angle:.035*a.flopTilt};
  if(a.splashPose>0)return {mode:'recover',p:timeline(recover,[0,.15,.42,.72,1],1-a.splashPose)};
  if(a.throwPose>0)return {mode:'release',p:timeline([heldPose(a.throwKind),'throw','guard'],[0,.32,1],1-a.throwPose)};
  if(a.swipe>0)return {mode:'punch',p:timeline(punch,[0,.19,.42,.49,1],1-a.swipe)};
  if(!a.grounded){
    if(a.airTime<.15)return {mode:'jump',p:pose('guard','jump',a.airTime/.15)};
    const open=limit((-a.vy-55)/510)*.77;
    return {mode:'jump',p:pose('jump','rise',open),angle:.027*Math.sin(Math.min(1,a.airTime/.65)*Math.PI*2)};
  }
  if(a.landTime<.17)return {mode:'landing',p:pose('rise','guard',a.landTime/.17)};
  return {mode:'stride',p:pose('guard')};
}
export function drawNacho(c,a,time,facing,reduced=false){
  const hand=a.haul?carryPose(a):null,s=motion(a,hand),yaw=visualYaw(a);
  s.face=Math.sign(yaw)||facing;
  withJoints(a,time,'nacho',s,reduced);
  if(reduced){s.bob=0;s.angle=hand?.lean||0;s.stretch=1;}
  if(!drawMotion(c,a,time,'nacho',s,original)){
    const im=artImage('./nacho-champion.webp');
    if(im?.complete&&im.naturalWidth){const w=140*im.naturalWidth/im.naturalHeight;c.save();c.scale(s.face,1);c.drawImage(im,-w*.48,-140,w,140);c.restore();}
  }
  c.save();c.scale(s.face,1);drawHeld(c,a,s.face,time,reduced,hand);c.restore();
}
