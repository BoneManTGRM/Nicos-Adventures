import {expect,it} from 'vitest';
import {languageCards, freshLanguageProgress, languageTransition, normalizeLanguageProgress} from './languageRescue';
it('keeps assistance, duplicate taps, and distinct checks separate',()=>{
 let p=freshLanguageProgress();
 p=languageTransition(p,{type:'help',item:'robot'});
 p=languageTransition(p,{type:'answer',item:'robot',answer:'robot'});
 expect(p.results.robot.assisted).toBe(true);
 expect(languageTransition(p,{type:'answer',item:'robot',answer:'key'})).toEqual(p);
 p=languageTransition(p,{type:'next',item:'robot'});
 expect(p.position).toBe(1);
 expect(languageTransition(p,{type:'answer',item:'robot',answer:'robot'})).toEqual(p);
});
it('finishes authored items with exactly two independent checks',()=>{
 let p=freshLanguageProgress();
 for(const [i,answer] of ['robot','key','door','battery','key','battery'].entries()){
  const id=languageCards[i].id;
  p=languageTransition(p,{type:'answer',item:id,answer});
  expect(p.results[id].correct).toBe(true);
  p=languageTransition(p,{type:'next',item:id});
 }
 expect(p.complete).toBe(true);
 expect(Object.values(p.results).filter(r=>r.independent)).toHaveLength(2);
 expect(normalizeLanguageProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
});
it('recovers malformed data and rejects arbitrary answers',()=>{
 const p=freshLanguageProgress();
 expect(normalizeLanguageProgress({position:999,results:{bad:{correct:true}}})).toEqual(p);
 expect(languageTransition(p,{type:'answer',item:'robot',answer:'<script>'})).toEqual(p);
});
it('stores each language separately through canonical normalization',async()=>{
 const {initialProgress,normalizeProgress}=await import('./engine');
 const en=languageTransition(freshLanguageProgress(),{type:'answer',item:'robot',answer:'robot'});
 const p=normalizeProgress({...initialProgress(),languageRescue:{en,'es-MX':freshLanguageProgress()}});
 expect(p.languageRescue?.en.results.robot.correct).toBe(true);
 expect(p.languageRescue?.['es-MX'].results).toEqual({});
 expect(normalizeProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
});
it('replays without erasing earned checks or affecting the other language',()=>{
 let p=freshLanguageProgress();
 for(const card of languageCards){p=languageTransition(p,{type:'answer',item:card.id,answer:card.answer});p=languageTransition(p,{type:'next',item:card.id});}
 const replay=languageTransition(p,{type:'replay',item:'rescue-transfer'});
 expect(replay.position).toBe(0);expect(replay.complete).toBe(false);
 expect(replay.results).toEqual(p.results);
});
