export type UnicornMove='prance'|'turn'|'float'|'rest';
const dances:readonly (readonly UnicornMove[])[]=[['prance','turn','float'],['float','rest','turn','prance'],['turn','prance','float','turn','rest']];
const boundedRound=(round:number)=>Number.isInteger(round)&&round>=0?round%3:0;
export const danceSteps=(round:number)=>dances[boundedRound(round)];
export function answerDance(round:number,step:number,move:string){const steps=danceSteps(round);return Number.isInteger(step)&&step>=0&&step<steps.length&&steps[step]===move?step+1:step;}
export function starTiles(round:number){const r=boundedRound(round);const stars=[[0,4,8],[1,3,5,7],[0,2,4,6,8]][r];return Array.from({length:9},(_,id)=>({id,kind:stars.includes(id)?'star':id%2?'flower':'moon'}));}
export function collectStar(round:number,found:number[],id:number){return found.includes(id)||!starTiles(round).some(t=>t.id===id&&t.kind==='star')?found:[...found,id];}
