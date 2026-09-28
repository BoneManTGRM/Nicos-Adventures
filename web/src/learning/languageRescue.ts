import type {Language} from '../types';
const text=(en:string,es:string)=>({en,'es-MX':es});
export const wordPictures=[
 {id:'robot',picture:'🤖',word:text('robot','robot')},
 {id:'key',picture:'🔑',word:text('key','llave')},
 {id:'door',picture:'🚪',word:text('door','puerta')},
 {id:'battery',picture:'🔋',word:text('battery','batería')},
] as const;
export const languageCards=[
 {id:'robot',answer:'robot',phrase:text('Find the robot.','Encuentra el robot.'),check:false,transfer:false},
 {id:'key',answer:'key',phrase:text('Find the key.','Encuentra la llave.'),check:false,transfer:false},
 {id:'door',answer:'door',phrase:text('Find the door.','Encuentra la puerta.'),check:false,transfer:false},
 {id:'battery',answer:'battery',phrase:text('Find the battery.','Encuentra la batería.'),check:false,transfer:false},
 {id:'door-check',answer:'key',phrase:text('Bring the key to the door.','Lleva la llave a la puerta.'),check:true,transfer:false},
 {id:'rescue-transfer',answer:'battery',phrase:text('The robot needs a battery.','El robot necesita una batería.'),check:true,transfer:true},
] as const;
export type LanguageResult={attempts:number;assisted:boolean;correct:boolean;independent:boolean};
export type LanguageProgress={position:number;feedback:string;help:boolean;complete:boolean;results:Record<string,LanguageResult>};
export type LanguageAction={type:'answer';item:string;answer:string}|{type:'help'|'next'|'retry'|'replay';item:string};
export const freshLanguageProgress=():LanguageProgress=>({position:0,feedback:'',help:false,complete:false,results:{}});
export function languageTransition(p:LanguageProgress,a:LanguageAction):LanguageProgress{
 const card=languageCards[p.position];if(!card||a.item!==card.id)return p;
 if(a.type==='replay')return p.complete?{...p,position:0,feedback:'',help:false,complete:false}:p;
 if(p.complete)return p;
 const prior=p.results[card.id]??{attempts:0,assisted:false,correct:false,independent:false};
 if(a.type==='next')return prior.correct&&p.feedback?{...p,position:Math.min(5,p.position+1),feedback:'',help:false,complete:p.position===5}:p;
 if(a.type==='retry')return p.feedback&&!prior.correct?{...p,feedback:''}:p;
 if(p.feedback)return p;
 if(a.type==='help')return {...p,help:true,results:{...p.results,[card.id]:{...prior,assisted:true}}};
 if(a.type!=='answer'||!wordPictures.some(w=>w.id===a.answer))return p;
 const correct=a.answer===card.answer,assisted=prior.assisted||prior.attempts>0||!correct;
 return {...p,feedback:a.answer,results:{...p.results,[card.id]:{attempts:Math.min(99,prior.attempts+1),assisted,correct,independent:prior.independent||(card.check&&correct&&!assisted)}}};
}
export function normalizeLanguageProgress(raw:unknown):LanguageProgress{
 const p=freshLanguageProgress();if(!raw||typeof raw!=='object')return p;
 const r=raw as Partial<LanguageProgress>;
 if(Number.isInteger(r.position)&&r.position!>=0&&r.position!<6)p.position=r.position!;
 for(const card of languageCards){const v=r.results?.[card.id];if(!v||typeof v!=='object')continue;
 const attempts=Number.isInteger(v.attempts)&&v.attempts>=0?Math.min(99,v.attempts):0;
 p.results[card.id]={attempts,assisted:v.assisted===true||attempts>1,correct:v.correct===true&&attempts>0,independent:card.check&&v.independent===true&&attempts>0};}
 p.help=r.help===true;
 if(wordPictures.some(w=>w.id===r.feedback)&&p.results[languageCards[p.position].id]?.attempts)p.feedback=r.feedback!;
 if(p.help){const id=languageCards[p.position].id;p.results[id]={...(p.results[id]??{attempts:0,correct:false,independent:false}),assisted:true};}
 p.complete=r.complete===true&&p.position===5&&p.results['rescue-transfer']?.correct===true;
 return p;
}
export type LanguageSaves=Record<Language,LanguageProgress>;
