/** Existing opening ramps remain unchanged. A level middle stretch teaches
 * locked sky attacks before the existing ramp profile returns in the gauntlet. */
export const SKY_STRETCH_START=4280,GAUNTLET_START=7880;
export function coursePosition(x:number):number|null{return x>=SKY_STRETCH_START&&x<GAUNTLET_START?null:x>=GAUNTLET_START?x-7600:x;}
export function courseRamps(){return [815,1660,2815,3660,...Array.from({length:55},(_,i)=>7600+815+Math.floor(i/2)*2000+(i%2?845:0))];}
export function rampArtPositions(left:number,right:number){return courseRamps().map(x=>x-45).filter(x=>x>=left-100&&x<=right+100);}
