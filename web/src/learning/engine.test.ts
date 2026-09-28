import { describe, expect, it } from 'vitest';
import { initialProgress, transition, normalizeProgress } from './engine';
import { lessonItem } from './lessons';
describe('Robot Rescue vertical slice', () => {
 it('keeps a hinted check assisted through reload and rejects duplicate answers', () => {
  let p = initialProgress();
  p = transition(p, {type:'begin'});
  const item = lessonItem(0, 0, 'gentle');
  p = transition(p, {type:'hint', item:item.id});
  p = normalizeProgress(JSON.parse(JSON.stringify(p)));
  p = transition(p, {type:'answer', item:item.id, answer:item.answer});
  expect(p.results[item.id].assisted).toBe(true);
  expect(transition(p, {type:'answer', item:item.id, answer:item.answer})).toEqual(p);
 });
 it('applies difficulty on the next item only and ignores stale item events', () => {
  let p=transition(initialProgress(),{type:'begin'});
  const item=lessonItem(0,0,'gentle');
  p=transition(p,{type:'difficulty',band:'challenge'});
  expect(p.band).toBe('gentle');
  p=transition(p,{type:'answer',item:item.id,answer:item.answer});
  p=transition(p,{type:'next',item:item.id});
  expect(p.band).toBe('challenge');
  expect(transition(p,{type:'answer',item:item.id,answer:item.answer})).toEqual(p);
 });
});
it('preserves historically earned independent checks after replay help and reload',()=>{
 let p={...initialProgress(),position:2,phase:'check' as const};
 const item=lessonItem(0,2,'gentle');
 let next=transition(p,{type:'answer',item:item.id,answer:item.answer});
 next={...next,phase:'check'};
 next=transition(next,{type:'hint',item:item.id});
 expect(normalizeProgress(next).results[item.id].independent).toBe(true);
});
