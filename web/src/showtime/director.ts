import type { Language, MoviePose, MoviePoseStep, MovieProject } from '../types';
export const MOVIE_SCENES = ['star-stage','robot-home','jungle','space','dinosaur-valley','castle'] as const;
export type MovieFormat = 'wide' | 'square' | 'portrait';
export type Shot = MoviePoseStep & { background?: string; caption?: string; camera?: 'wide' | 'close' };
export const FORMATS: Record<MovieFormat, {width:number;height:number}> = {wide:{width:960,height:540},square:{width:640,height:640},portrait:{width:432,height:768}};
export const POSES: readonly MoviePose[] = ['idle','wave','celebrate','launch','dance','spin','bounce','roar','sleep'];
export function normalizeShots(value: unknown, fallbackScene='star-stage'): Shot[] {
  if(!Array.isArray(value))return [];
  fallbackScene=MOVIE_SCENES.includes(fallbackScene as typeof MOVIE_SCENES[number])?fallbackScene:'star-stage';
  let remaining=24000;
  return value.slice(0,8).flatMap(raw=>{
    if(!raw || !POSES.includes(raw.pose) || remaining<500)return [];
    const durationMs=Math.min(remaining,Math.max(500,Math.min(6000,Number.isFinite(raw.durationMs)?Math.round(raw.durationMs):2000)));remaining-=durationMs;
    return [{pose:raw.pose as MoviePose,durationMs,background:MOVIE_SCENES.includes(raw.background)?raw.background:fallbackScene,
      caption:typeof raw.caption==='string'?raw.caption.slice(0,140):undefined,camera:raw.camera==='close'?'close':'wide'}];
  });
}
export function shotAt(time:number,shots:readonly Shot[]) { let cursor=0;const total=shots.reduce((v,s)=>v+s.durationMs,0),t=Math.max(0,Math.min(total-.001,Number.isFinite(time)?time:0));for(let i=0;i<shots.length;i++){if(t<cursor+shots[i].durationMs)return {index:i,progress:(t-cursor)/shots[i].durationMs};cursor+=shots[i].durationMs;}return{index:0,progress:0}; }
export function moveShot(shots: readonly Shot[], index:number, offset:number):Shot[]{const next=[...shots],to=index+offset;if(index<0||index>=next.length||to<0||to>=next.length)return next;[next[index],next[to]]=[next[to],next[index]];return next;}
export function freshShots():Shot[]{return [{pose:'wave',durationMs:2000,background:'star-stage',caption:''},{pose:'dance',durationMs:2000,background:'star-stage',caption:''},{pose:'celebrate',durationMs:2000,background:'star-stage',caption:''}];}
export const MOVIE_TEMPLATES=['space-rescue','forest-friends','monster-party'] as const;
export function movieTemplate(id:typeof MOVIE_TEMPLATES[number],l:Language):{title:string;shots:Shot[]}{
 const es=l==='es-MX';
 if(id==='space-rescue')return{title:es?'Rescate entre estrellas':'Rescue Among the Stars',shots:[{pose:'wave',durationMs:2500,background:'robot-home',caption:es?'¡Equipo, necesitamos su ayuda!':'Team, we need your help!'},{pose:'launch',durationMs:2500,background:'space',caption:es?'Tres, dos, uno… ¡despegue!':'Three, two, one… liftoff!'},{pose:'bounce',durationMs:2500,background:'castle',camera:'close',caption:es?'¡Encontramos a nuestro amigo!':'We found our friend!'},{pose:'celebrate',durationMs:2500,background:'star-stage',caption:es?'Una aventura, un gran equipo.':'One adventure. One great team.'}]};
 if(id==='forest-friends')return{title:es?'El sendero secreto':'The Secret Trail',shots:[{pose:'idle',durationMs:2500,background:'jungle',caption:es?'Algo se movió entre las hojas…':'Something moved among the leaves…'},{pose:'wave',durationMs:2500,background:'dinosaur-valley',caption:es?'¡Era un nuevo amigo!':'It was a new friend!'},{pose:'dance',durationMs:2500,background:'jungle',camera:'close',caption:es?'¡Bienvenido al equipo!':'Welcome to the team!'},{pose:'celebrate',durationMs:2500,background:'star-stage',caption:es?'Mañana hay más por descubrir.':'Tomorrow brings another discovery.'}]};
 return{title:es?'La fiesta monstruosa':'The Monster Party',shots:[{pose:'roar',durationMs:2000,background:'castle',caption:es?'¿Quién invitó a los monstruos?':'Who invited the monsters?'},{pose:'spin',durationMs:2000,background:'star-stage',caption:es?'¡Nosotros!':'We did!'},{pose:'dance',durationMs:3000,background:'star-stage',camera:'close',caption:es?'La pista es de todos.':'Everyone belongs on the dance floor.'},{pose:'sleep',durationMs:2000,background:'robot-home',caption:es?'Hasta los héroes descansan.':'Even heroes need a rest.'}]};
}
export function projectShots(project?:MovieProject|null):Shot[]{const shots=project?normalizeShots(project.poseSequence,project.background):[];return shots.length?shots:freshShots();}
