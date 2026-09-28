import { lessonItem, missions, type Band } from './lessons';
export type Result = { attempts: number; assisted: boolean; correct: boolean; independent: boolean };
export type Progress = {
 version: 1; mission: number; position: number; band: Band; nextBand: Band;
 phase: 'introduction'|'attempt'|'hint'|'feedback'|'check'|'completion';
 hints: number; alternative: boolean; lastAnswer: string; results: Record<string,Result>; rewarded: string[];
};
export const initialProgress = ():Progress => ({version:1,mission:0,position:0,band:'gentle',nextBand:'gentle',phase:'introduction',hints:0,alternative:false,lastAnswer:'',results:{},rewarded:[]});
export type Action = {type:'begin'}|{type:'difficulty';band:Band}|{type:'hint'|'alternative'|'next'|'retry';item:string}|{type:'answer';item:string;answer:string}|{type:'mission';mission:number};
export function transition(p:Progress,a:Action):Progress {
 if(a.type==='difficulty')return {...p,nextBand:a.band};
 if(a.type==='mission')return Number.isInteger(a.mission)&&a.mission>=0&&a.mission<6?{...p,mission:a.mission,position:0,band:p.nextBand,phase:'introduction',hints:0,alternative:false,lastAnswer:''}:p;
 if(a.type==='begin')return p.phase==='introduction'?{...p,phase:p.position>=2?'check':'attempt'}:p;
 const item=lessonItem(p.mission,p.position,p.band);
 if(a.item!==item.id||p.phase==='introduction'||p.phase==='completion')return p;
 const prior=p.results[item.id]??{attempts:0,assisted:false,correct:false,independent:false};
 if(a.type==='next') {
  if(p.phase!=='feedback'||!prior.correct)return p;
  if(p.position===3)return {...p,phase:'completion'};
  return {...p,position:p.position+1,band:p.nextBand,phase:p.position+1>=2?'check':'attempt',hints:0,alternative:false,lastAnswer:''};
 }
 if(a.type==='retry')return p.phase==='feedback'&&!prior.correct?{...p,phase:p.position>=2?'check':'attempt',lastAnswer:''}:p;
 if(p.phase==='feedback')return p;
 if(a.type==='hint'||a.type==='alternative')return {...p,phase:'hint',hints:a.type==='hint'?Math.min(2,p.hints+1):p.hints,alternative:a.type==='alternative'||p.alternative,results:{...p.results,[item.id]:{...prior,assisted:true}}};
 if(a.type!=='answer')return p;
 if(!item.options.some(o=>o.id===a.answer))return p;
 const correct=a.answer===item.answer;
 const assisted=prior.assisted||prior.attempts>0||!correct;
 return {...p,phase:'feedback',lastAnswer:a.answer,results:{...p.results,[item.id]:{attempts:Math.min(99,prior.attempts+1),correct,assisted,independent:prior.independent||(correct&&item.check&&!assisted)}}};
}
export function demonstrated(p:Progress,mission:number,band:Band):boolean {
 return [2,3].every(position=>p.results[lessonItem(mission,position,band).id]?.independent===true);
}
export function normalizeProgress(raw:unknown):Progress {
 const fresh=initialProgress();
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return fresh;
 const v=raw as Record<string,unknown>;
 if(v.version!==1)return fresh;
 const integer=(n:unknown,max:number)=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=max?n:0;
 const band:Band=v.band==='challenge'?'challenge':'gentle';
 const mission=integer(v.mission,5),position=integer(v.position,3);
 const results:Record<string,Result>={};
 const data=v.results&&typeof v.results==='object'?v.results as Record<string,unknown>:{};
 for(let m=0;m<6;m++)for(const b of ['gentle','challenge'] as const)for(let i=0;i<4;i++){
  const item=lessonItem(m,i,b);const rawResult=data[item.id];
  if(!rawResult||typeof rawResult!=='object')continue;
  const r=rawResult as Record<string,unknown>,attempts=integer(r.attempts,99),correct=r.correct===true&&attempts>0,assisted=r.assisted===true||attempts>1;
  results[item.id]={attempts,correct,assisted,independent:item.check&&attempts>0&&r.independent===true};
 }
 const current=lessonItem(mission,position,band);
 const phases=['introduction','attempt','hint','feedback','check','completion'];
 let phase:Progress['phase']=phases.includes(String(v.phase))?v.phase as Progress['phase']:'introduction';
 const lastAnswer=typeof v.lastAnswer==='string'&&current.options.some(o=>o.id===v.lastAnswer)?v.lastAnswer:'';
 if(phase==='feedback'&&!lastAnswer)phase=position>=2?'check':'attempt';
 if(phase==='completion'&&!(position===3&&results[current.id]?.correct))phase='introduction';
 const hints=integer(v.hints,2),alternative=v.alternative===true;
 if(hints||alternative){const r=results[current.id]??{attempts:0,correct:false,assisted:true,independent:false};results[current.id]={...r,assisted:true};}
 return {version:1,mission,position,band,nextBand:v.nextBand==='challenge'?'challenge':'gentle',phase,hints,alternative,lastAnswer,results,rewarded:missions.map(m=>m.id).filter(id=>Array.isArray(v.rewarded)&&v.rewarded.includes(id))};
}
