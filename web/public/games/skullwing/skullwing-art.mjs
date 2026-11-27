import {drawMonster,preloadJoints} from './jointed-motion.mjs';

export const preloadSkullwing=()=>preloadJoints('skullwing');
export function drawSkullwing(canvas,actor,time,_facing,reduced=false){
  drawMonster(canvas,actor,time,'skullwing',reduced);
}
