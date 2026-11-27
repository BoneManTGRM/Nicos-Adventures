import {drawMonster,preloadJoints} from './jointed-motion.mjs';

export const preloadNacho=()=>preloadJoints('nacho');
export function drawNacho(canvas,actor,time,_facing,reduced=false){
  drawMonster(canvas,actor,time,'nacho',reduced);
}
