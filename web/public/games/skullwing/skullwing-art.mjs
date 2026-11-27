import {monsterFrames} from './monster-frames.mjs';
import {carryPose} from './nacho-moves.mjs';
import {drawHeld} from './held-art.mjs';
import {drawRex} from './rex.mjs';
import {artImage,drawMotion,paintedCel,pose,preloadTransitions,timeline,visualYaw} from './motion-player.mjs';
import {preloadJoints,withJoints} from './jointed-motion.mjs';

export function preloadSkullwing(){
  for(const sheet of ['street','flight'])artImage('./skullwing-'+sheet+'.webp');
  preloadJoints('skullwing');preloadTransitions('skullwing');
}
function original(name){
  const f=monsterFrames[name]||monsterFrames.strideA;
  return paintedCel(artImage('./'+f.sheet+'.webp'),f,f.rc);
}
function motion(a,time){
  if(a.dive)return {mode:'meteor',p:pose('glide','dive',1-a.flopWindup/.105),angle:.05*a.flopTilt};
  if(a.splashPose>0)return {mode:'recover',p:timeline(['dive','impact','impact','strideA'],[0,.13,.20,1],1-a.splashPose)};
  const h=a.haul;
  if(h){
    if(h.phase==='lift')return {mode:'lift',p:timeline(['strideA','reach','hold'],[0,.27,1],h.age/.49)};
    if(h.phase==='tear')return {mode:'wall',p:timeline(['strideA','strike','strike','hold'],[0,.29,.39,1],h.age/.49)};
    if(h.phase==='eat')return {mode:'eat',p:timeline(['hold','bite','bite','strideA'],[0,.49,.56,1],h.age/.70)};
    return {mode:'carry',p:pose('hold')};
  }
  if(a.throwPose>0)return {mode:'release',p:timeline(['hold','strike','strideA'],[0,.35,1],1-a.throwPose)};
  if(!a.grounded){
    if(a.airTime<.15)return {mode:'jump',p:pose('strideA','launch',a.airTime/.15)};
    if(a.airTime<.36||a.flap>.58)return {mode:'fly',p:pose('launch','glide',Math.min((a.airTime-.15)/.21,(1-a.flap)/.42))};
    return {mode:'glide',p:pose('glide'),loop:'glide',phase:time*1.7};
  }
  if(a.swipe>0)return {mode:'punch',p:timeline(['strideA','strike','strideA'],[0,.43,1],1-a.swipe)};
  if(a.roar>.02)return {mode:'roar',p:timeline(['strideA','bite','bite','strideA'],[0,.22,.65,1],1-a.roar)};
  return {mode:'stride',p:pose('strideA')};
}
export function drawSkullwing(c,a,time,facing,reduced=false){
  const s=motion(a,time);
  s.face=Math.sign(visualYaw(a))||facing;
  withJoints(a,time,'skullwing',s,reduced);
  if(reduced){s.angle=0;s.loop=null;}
  if(!drawMotion(c,a,time,'skullwing',s,original)){
    drawRex(c,{time,walk:a.walk,facing:s.face,air:a.flight,slam:a.dive?1:a.land,swipe:a.swipe,roar:a.roar,reduced,glide:a.glide,flap:a.flap,stride:a.stride,hand:a.hand});
  }
  c.save();c.scale(s.face,1);drawHeld(c,a,s.face,time,reduced,a.haul?carryPose(a):null);c.restore();
}
