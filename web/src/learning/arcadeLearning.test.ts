import {expect,it} from 'vitest';
import {makeDeck,turnCard,clearMismatch,initialMatch,phrases,checkSentence,hasScoreCapacity} from './arcadeLearning';
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
