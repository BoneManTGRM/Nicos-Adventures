import {describe,expect,it} from 'vitest';
import {localVoices,readingChunks} from './Narration';
import {FACT_QUIZZES,FACT_SOURCES,FACT_TOPICS,FUN_FACTS,findFact,nextFact} from './funFacts';
import {toggleFavorite} from './closet';
import {NICO_PROFESSIONS,applyNicoProfession,filterNicoProfessions} from './NicoDressUp';
import {normalizeStore} from '../storage';
const profile=(nico:unknown)=>normalizeStore({profiles:[{id:'a',nico}],activeProfileId:'a'}).profiles[0];
describe('local narration and discovery',()=>{
 it('never selects remote voices and prioritizes installed enhanced voices',()=>{const base={localService:true,default:false};const voices=[{...base,name:'Basic',lang:'en-US',voiceURI:'a'},{...base,name:'Enhanced',lang:'en-US',voiceURI:'b'},{...base,name:'Premium',lang:'en-US',voiceURI:'remote',localService:false},{...base,name:'Natural',lang:'es-MX',voiceURI:'es'}];expect(localVoices(voices,'en').map(v=>v.voiceURI)).toEqual(['b','a']);expect(localVoices(voices,'es-MX').map(v=>v.voiceURI)).toEqual(['es']);});
 it('splits speech into bounded sentences while preserving page identity',()=>{const parts=readingChunks([{text:'Hello! Let us explore. '+('a '.repeat(300)),page:2}]);expect(parts[0].text).toBe('Hello!');expect(parts.every(p=>p.text.length<=220&&p.page===2)).toBe(true);expect(readingChunks([{text:'',page:0}])).toEqual([]);});
 it('has 80 unique bilingual facts, sourced science and valid quiz references',()=>{expect(FUN_FACTS).toHaveLength(80);expect(new Set(FUN_FACTS.map(f=>f.id)).size).toBe(80);for(const f of FUN_FACTS){expect(f.en.length).toBeGreaterThan(12);expect(f.es.length).toBeGreaterThan(12);expect(FACT_TOPICS).toContain(f.topic);if(f.topic!=='numbers')expect(FACT_SOURCES[f.source]?.url).toMatch(/^https:/);}for(const q of FACT_QUIZZES){expect(FUN_FACTS.find(f=>f.id===q.fact)).toBeDefined();expect(q.correct).toBeLessThan(q.a.length);}});
 it('does not repeat facts before exhausting a selected topic and does not invent answers',()=>{const seen:string[]=[];const total=FUN_FACTS.filter(f=>f.topic==='space').length;for(let i=0;i<total;i++){const f=nextFact('space',seen);expect(seen).not.toContain(f.id);seen.push(f.id);}expect(nextFact('space',seen).id).not.toBe(seen.at(-1));expect(findFact('octopus hearts')?.id).toBe('fact-31');expect(findFact('cuántos corazones tiene un pulpo')?.id).toBe('fact-31');expect(findFact('tell me a secret random nonsense')).toBeNull();});
});
describe('canonical wardrobe favorites',()=>{
 it('all 26 approved outfits survive storage including the later catalog',()=>{expect(NICO_PROFESSIONS).toHaveLength(26);for(const p of NICO_PROFESSIONS){const current=profile({}).nico,selected=applyNicoProfession(current,p),restored=profile({...selected,favoriteOutfits:[p.id]}).nico;expect(restored.profession).toBe(p.id);expect(restored.favoriteOutfits).toEqual([p.id]);}});
 it('favorites are unique, reversible and bounded; invalid IDs are rejected',()=>{expect(toggleFavorite(['explorer'],'explorer')).toEqual([]);expect(toggleFavorite(['explorer'],'astronaut')).toEqual(['explorer','astronaut']);expect(profile({favoriteOutfits:['bad','explorer','explorer','librarian']}).nico.favoriteOutfits).toEqual(['explorer','librarian']);});
 it('Spanish searches match without typed accents',()=>{expect(filterNicoProfessions('cientifico','es-MX').some(p=>p.id==='scientist')).toBe(true);expect(filterNicoProfessions('unmatchable','en')).toHaveLength(0);});
});
