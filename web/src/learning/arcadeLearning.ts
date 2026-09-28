import type {Language} from '../types';
const t=(en:string,es:string):Record<Language,string>=>({en,'es-MX':es});
export const arcadeWords=[
 {id:'robot',picture:'🤖',label:t('robot','robot')},{id:'key',picture:'🔑',label:t('key','llave')},
 {id:'door',picture:'🚪',label:t('door','puerta')},{id:'battery',picture:'🔋',label:t('battery','batería')},
 {id:'apple',picture:'🍎',label:t('apple','manzana')},{id:'cat',picture:'🐱',label:t('cat','gato')},
 {id:'sun',picture:'☀️',label:t('sun','sol')},{id:'water',picture:'💧',label:t('water','agua')},
];
export type MatchCard={id:string;word:string;kind:'word'|'picture'};
export function shuffled<T>(items:readonly T[],seed:number):T[]{
 const list=[...items];let n=seed>>>0;
 for(let i=list.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[list[i],list[j]]=[list[j],list[i]];}
 return list;
}
export function makeDeck(seed:number,set:number):MatchCard[]{return shuffled(arcadeWords.slice(set===1?4:0,set===1?8:4).flatMap(w=>(['word','picture'] as const).map(kind=>({id:`${w.id}:${kind}`,word:w.id,kind}))),seed);}
export type MatchState={open:string[];matched:string[];attempts:number;feedback:'none'|'match'|'mismatch'};
export const initialMatch=():MatchState=>({open:[],matched:[],attempts:0,feedback:'none'});
export function turnCard(p:MatchState,deck:MatchCard[],id:string):MatchState{
 const card=deck.find(c=>c.id===id);if(!card||p.feedback==='mismatch'||p.matched.includes(card.word)||p.open.includes(id))return p;
 const open=p.feedback==='match'?[]:p.open;
 if(!open.length)return {...p,open:[id],feedback:'none'};
 const first=deck.find(c=>c.id===open[0]);if(!first)return p;
 const match=first.word===card.word&&first.kind!==card.kind;
 return {...p,open:[first.id,id],attempts:p.attempts+1,matched:match?[...p.matched,card.word]:p.matched,feedback:match?'match':'mismatch'};
}
export const clearMismatch=(p:MatchState):MatchState=>p.feedback==='mismatch'?{...p,open:[],feedback:'none'}:p;
export const phrases=[
 {id:'open',picture:'🔑 🚪',tokens:{en:['Open','the','door'],'es-MX':['Abre','la','puerta']}},
 {id:'find',picture:'🔎 🔑',tokens:{en:['Find','the','key'],'es-MX':['Encuentra','la','llave']}},
 {id:'robot',picture:'🤖 🔋',tokens:{en:['The','robot','needs','a','battery'],'es-MX':['El','robot','necesita','una','batería']}},
 {id:'water',picture:'🐱 💧',tokens:{en:['The','cat','drinks','water'],'es-MX':['El','gato','bebe','agua']}},
] as const;
export function checkSentence(tokens:readonly string[],order:readonly number[]):boolean{return order.length===tokens.length&&order.every((id,i)=>id===i);}
