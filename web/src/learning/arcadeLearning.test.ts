import {expect,it} from 'vitest';
import {makeDeck,turnCard,clearMismatch,initialMatch,phrases,checkSentence,hasScoreCapacity,sentencesForLevel} from './arcadeLearning';
it('creates repeatable decks with one word and picture per pair',()=>{
 for(let seed=0;seed<50;seed++){
  const deck=makeDeck(seed,seed%2);
  expect(deck).toEqual(makeDeck(seed,seed%2));expect(new Set(deck.map(c=>c.id)).size).toBe(8);
  for(const word of new Set(deck.map(c=>c.word)))expect(deck.filter(c=>c.word===word).map(c=>c.kind).sort()).toEqual(['picture','word']);
 }
});
it('rejects duplicate turns, pauses mismatches and completes exactly four pairs',()=>{
 const deck=makeDeck(7,0);let p=initialMatch();
 p=turnCard(p,deck,deck[0].id);expect(turnCard(p,deck,deck[0].id)).toEqual(p);
 const other=deck.find(c=>c.word!==deck[0].word)!;p=turnCard(p,deck,other.id);
 expect(p.feedback).toBe('mismatch');expect(turnCard(p,deck,deck[2].id)).toEqual(p);
 p=clearMismatch(p);expect(p.open).toEqual([]);
 for(const word of new Set(deck.map(c=>c.word))){for(const c of deck.filter(c=>c.word===word))p=turnCard(p,deck,c.id);}
 expect(p.matched).toHaveLength(4);expect(p.attempts).toBe(5);
});
it('grades token identities and rejects missing or duplicate tiles in both languages',()=>{
 for(const phrase of phrases)for(const lang of ['en','es-MX'] as const){
  const tokens=phrase.tokens[lang];expect(checkSentence(tokens,tokens.map((_,i)=>i))).toBe(true);
  expect(checkSentence(tokens,tokens.map(()=>0))).toBe(false);
  expect(checkSentence(tokens,[])).toBe(false);
 }
 expect(phrases[0].tokens.en.join(' ')).toBe('Open the door');
 expect(phrases[0].tokens['es-MX'].join(' ')).toBe('Abre la puerta');
});

it('preserves full score tables and allows updates of existing keys',()=>{const scores=Object.fromEntries(Array.from({length:100},(_,i)=>['game'+i,i]));expect(hasScoreCapacity(scores,'new')).toBe(false);expect(hasScoreCapacity(scores,'game0')).toBe(true);expect(hasScoreCapacity({},'new')).toBe(true);});

it('offers twenty distinct four-sentence rounds with bounded bilingual tiles',()=>{
 expect(phrases).toHaveLength(80);
 expect(new Set(phrases.map(p=>p.id)).size).toBe(80);
 for(const lang of ['en','es-MX'] as const){
  expect(new Set(phrases.map(p=>p.tokens[lang].join(' '))).size).toBe(80);
  for(const p of phrases){expect(p.tokens[lang].length).toBeGreaterThanOrEqual(3);expect(p.tokens[lang].length).toBeLessThanOrEqual(11);}
 }
});

it('provides distinct sixteen-item level pools without changing translations or answers',()=>{
 const seen=new Set<string>();
 for(const level of ['pre-a1','a1','a2'] as const){
  const pool=sentencesForLevel(level);expect(pool).toHaveLength(16);
  for(const item of pool){expect(seen.has(item.id)).toBe(false);seen.add(item.id);expect(phrases.find(p=>p.id===item.id)).toEqual(item);}
 }
 expect(sentencesForLevel('a1')[0].tokens.en.join(' ')).toBe('I walked to school yesterday');
 expect(sentencesForLevel('a2')[0].tokens.en.join(' ')).toBe('I was reading when she arrived');
});

it('accepts interchangeable repeated words but rejects reused tiles',()=>{expect(checkSentence(['The','cat','sees','the','cat'],[0,4,2,3,1])).toBe(true);expect(checkSentence(['The','cat','sees','the','cat'],[0,1,2,3,1])).toBe(false);});
