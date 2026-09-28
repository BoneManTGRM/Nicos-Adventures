import {expect,it} from 'vitest';
import {danceSteps,answerDance,collectStar,starTiles} from './unicornPlay';
it('dance mistakes preserve the next step and success completes each routine',()=>{
 for(let round=0;round<3;round++){
  let step=0;const sequence=danceSteps(round);
  expect(answerDance(round,step,'wrong')).toBe(0);
  for(const move of sequence)step=answerDance(round,step,move);
  expect(step).toBe(sequence.length);
  expect(answerDance(round,step,sequence[0])).toBe(step);
 }
});
it('only distinct stars count; every board can finish',()=>{
 for(let round=0;round<3;round++){
  const board=starTiles(round);let found:number[]=[];
  for(const tile of board){found=collectStar(round,found,tile.id);expect(collectStar(round,found,tile.id)).toEqual(found);}
  expect(found.length).toBe(round+3);
  expect(collectStar(round,found,-1)).toEqual(found);
 }
});
