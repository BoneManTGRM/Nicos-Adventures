import { describe,expect,it } from 'vitest';
import { createProfile, exportProfile, importProfile, normalizeStore, saveLocalStore } from '../storage';
import { initialProgress, normalizeProgress, transition, demonstrated, type Action } from './engine';
import { lessonItem } from './lessons';
import { applyLearningAction, resetLearning } from './profile';
import type { LocalProfile } from '../types';
const send=(p:LocalProfile,a:Action)=>applyLearningAction(p,p.id,JSON.stringify(normalizeProgress(p.learningLab)),a);
function finish(p:LocalProfile,mission=0){p=send(p,{type:'mission',mission});p=send(p,{type:'begin'});for(let i=0;i<4;i++){const item=lessonItem(mission,i,'gentle');p=send(p,{type:'answer',item:item.id,answer:item.answer});p=send(p,{type:'next',item:item.id});}return p;}
describe('canonical local Learning Lab records',()=>{
 it('grants a reward once across refresh, replay and tutor reset',()=>{
  let p=finish(createProfile('Synthetic'));expect(p.stars).toBe(2);expect(demonstrated(p.learningLab!,0,'gentle')).toBe(true);
  p=importProfile(exportProfile(p));p=finish(p);expect(p.stars).toBe(2);
  p=finish(resetLearning(p));expect(p.stars).toBe(2);expect(p.completedMissions).toEqual(['learning-lab:supplies']);
 });
 it('ignores duplicate, prior-profile and stale progress actions',()=>{
  const a=createProfile('Synthetic A'),b=createProfile('Synthetic B');const mark=JSON.stringify(initialProgress());
  expect(applyLearningAction(b,a.id,mark,{type:'begin'})).toBe(b);
  const started=applyLearningAction(a,a.id,mark,{type:'begin'});
  expect(applyLearningAction(started,a.id,mark,{type:'begin'})).toBe(started);
 });
 it('preserves old profile fields and normalizes bounded untrusted records',()=>{
  const old=createProfile('Synthetic');const normal=normalizeStore({profiles:[old],activeProfileId:old.id}).profiles[0];
  expect(normal.learningLab).toBeUndefined();expect(normal.robots).toMatchObject(old.robots);expect(normal.stars).toBe(old.stars);
  const p=finish(old);const reset=resetLearning(p);expect(reset.robots).toEqual(p.robots);expect(reset.adventures).toEqual(p.adventures);
  expect(normalizeProgress({version:1,mission:999,position:-1,results:{'<script>':{correct:true}}})).toEqual(initialProgress());
  expect(()=>importProfile('{bad json')).toThrow();
 });
 it('does not claim storage success after a quota failure',()=>{
  const old=globalThis.localStorage;let value='last-valid-save';
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>value,setItem:()=>{throw new Error('QuotaExceededError');}}});
  try {const p=createProfile('Synthetic');expect(saveLocalStore({schemaVersion:4,activeProfileId:p.id,profiles:[p]})).toBe(false);expect(value).toBe('last-valid-save');}
  finally{Object.defineProperty(globalThis,'localStorage',{configurable:true,value:old});}
 });
 it('wrong or hinted checks never earn independent credit',()=>{
  for(let mission=0;mission<6;mission++)for(const band of ['gentle','challenge'] as const){
   for(const position of [2,3]){
    const item=lessonItem(mission,position,band);let p={...initialProgress(),mission,position,band,phase:'check' as const};
    let assisted=transition(p,{type:'hint',item:item.id});assisted=transition(assisted,{type:'answer',item:item.id,answer:item.answer});expect(assisted.results[item.id].independent).toBe(false);
    let wrong=transition(p,{type:'answer',item:item.id,answer:item.options.find(o=>o.id!==item.answer)!.id});wrong=transition(wrong,{type:'retry',item:item.id});wrong=transition(wrong,{type:'answer',item:item.id,answer:item.answer});expect(wrong.results[item.id].independent).toBe(false);
   }
  }
 });
 it('fixed-seed action permutations recover and keep records bounded',()=>{
  for(const seed of [7,42,2026]){
   let n=seed,p=initialProgress();for(let i=0;i<500;i++){
    n=(n*1664525+1013904223)>>>0;const item=lessonItem(p.mission,p.position,p.band);
    const actions:Action[]=[{type:'begin'},{type:'hint',item:item.id},{type:'alternative',item:item.id},{type:'answer',item:item.id,answer:item.answer},{type:'next',item:item.id},{type:'retry',item:item.id},{type:'difficulty',band:n%2?'gentle':'challenge'},{type:'mission',mission:n%6}];
    p=normalizeProgress(transition(p,actions[n%actions.length]));expect(Object.keys(p.results).length).toBeLessThanOrEqual(48);expect(p.hints).toBeLessThanOrEqual(2);
   }
   p=transition(p,{type:'mission',mission:0});expect(p.phase).toBe('introduction');
  }
 });
});
