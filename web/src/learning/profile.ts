import type { LocalProfile } from '../types';
import { completeOnce } from '../world/progression';
import { initialProgress, normalizeProgress, transition, type Action } from './engine';
import { missions } from './lessons';
export function applyLearningAction(current:LocalProfile,profileId:string,fingerprint:string,action:Action):LocalProfile {
 const before=normalizeProgress(current.learningLab);
 if(current.id!==profileId||JSON.stringify(before)!==fingerprint)return current;
 const next=transition(before,action);
 let changed:LocalProfile={...current,learningLab:next};
 const mission=missions[next.mission];
 if(next.phase==='completion'&&!next.rewarded.includes(mission.id)){
  changed=completeOnce(changed,`learning-lab:${mission.id}`,2).profile;
  changed={...changed,learningLab:{...next,rewarded:[...next.rewarded,mission.id]}};
 }
 return changed;
}
export function resetLearning(current:LocalProfile):LocalProfile {
 return {...current,learningLab:{...initialProgress(),rewarded:normalizeProgress(current.learningLab).rewarded}};
}
