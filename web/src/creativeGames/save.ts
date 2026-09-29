/** Catalog-independent, bounded schema-v4 extension. Simulations stay lazy-loaded. */
export type Build={name:string;parts:number[];span:number;engineX:number;engineY:number;paint:number;driver:number};
export type Debris={id:number;kind:number;x:number;y:number;vx:number;vy:number;a:number;av:number;r:number};
export type Drive={id:number;track:number;practice:boolean;build:Build;t:number;x:number;y:number;vx:number;vy:number;a:number;av:number;air:number;launchX:number;bestJump:number;distance:number;broken:number[];debris:Debris[];ended:boolean;reason:number;landings:number;contacts:number;cargo:boolean;bridges:number[];toolAt:number;rope:number};
export type Receipt={distance:number;bolts:number;bonus:number;challenge:number;practice:boolean};
export type GarageSave={bolts:number;owned:number[];build:Build;blueprints:Build[];best:number[];goals:number[];target:number;sequence:number;paidThrough:number;resume:Drive|null;last:Receipt|null};
export type KingdomSave={petals:number;owned:number[];layouts:number[][];rescued:number[];completed:number[];color:number;name:string;island:number};
export type CreativeGamesSave={garage:GarageSave;kingdom:KingdomSave};
export const STARTER_PARTS=[1,11,26,31,71,81,91];
export const STARTER_BUILD:Build={name:'Thunder Buggy',parts:[1,11,26,31,0,0,0,71,81,91,0,0],span:1,engineX:0,engineY:0,paint:0,driver:0};
const record=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
export const num=(v:unknown,lo:number,hi:number,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):fallback;
const integer=(v:unknown,lo:number,hi:number,fallback=0)=>Math.floor(num(v,lo,hi,fallback));
const ids=(v:unknown,lo:number,hi:number,max=100)=>Array.isArray(v)?[...new Set(v.filter((n):n is number=>Number.isInteger(n)&&n>=lo&&n<=hi))].slice(0,max):[];
const text=(v:unknown,fallback:string)=>typeof v==='string'?v.replace(/[\u0000-\u001f]/g,'').trim().slice(0,26)||fallback:fallback;
export const priceFor=(id:number)=>STARTER_PARTS.includes(id)?0:(id>=71?30+((id-1)%10)*10:35+((id-1)%10)*15);
export const magicPrice=(id:number)=>id<=3?0:25+(id-4)*15;
export function normalizeBuild(raw:unknown,owned:number[]=STARTER_PARTS):Build{
 const v=record(raw),p=Array.isArray(v.parts)?v.parts:[];
 const parts=Array.from({length:12},(_,i)=>{const group=i===10?4:i===11?6:i;const candidate=p[i];return Number.isInteger(candidate)&&owned.includes(candidate)&&Math.floor((Number(candidate)-1)/10)===group?Number(candidate):(i<4||i===7||i===8||i===9?STARTER_BUILD.parts[i]:0);});
 if(parts[10]===parts[4])parts[10]=0;if(parts[11]===parts[6])parts[11]=0;
 return {name:text(v.name,'Thunder Buggy'),parts,span:num(v.span,.75,1.35,1),engineX:num(v.engineX,-.7,.7),engineY:num(v.engineY,-.4,.5),paint:integer(v.paint,0,5),driver:integer(v.driver,0,3)};
}
export function normalizeDrive(raw:unknown,owned:number[]):Drive|null{
 const v=record(raw);if(!Number.isInteger(v.id)||Number(v.id)<1||!Number.isFinite(v.x)||!Number.isFinite(v.y))return null;
 return {id:integer(v.id,1,1e9),track:integer(v.track,0,2),practice:v.practice===true,build:normalizeBuild(v.build,owned),t:num(v.t,0,36000),x:num(v.x,-100,120100),y:num(v.y,-3000,3000),vx:num(v.vx,-600,900),vy:num(v.vy,-1500,1500),a:num(v.a,-Math.PI,Math.PI),av:num(v.av,-12,12),air:num(v.air,0,10),launchX:num(v.launchX,-100,120100),bestJump:num(v.bestJump,0,1000),distance:num(v.distance,0,10000),broken:ids(v.broken,0,16,17),debris:(Array.isArray(v.debris)?v.debris:[]).slice(0,22).map(raw=>{const d=record(raw);return {id:integer(d.id,1,100,1),kind:integer(d.kind,0,16),x:num(d.x,-1000,121000),y:num(d.y,-4000,4000),vx:num(d.vx,-1200,1200),vy:num(d.vy,-1500,1500),a:num(d.a,-1000,1000),av:num(d.av,-20,20),r:num(d.r,4,80,15)};}),ended:v.ended===true,reason:integer(v.reason,0,5),landings:integer(v.landings,0,10000),contacts:integer(v.contacts,0,6),cargo:v.cargo!==false,bridges:ids(v.bridges,0,200,12),toolAt:num(v.toolAt,-100,36000,-100),rope:num(v.rope,0,36001)};
}
export function normalizeGames(raw:unknown):CreativeGamesSave{
 const root=record(raw),g=record(root.garage),k=record(root.kingdom),owned=[...new Set([...STARTER_PARTS,...ids(g.owned,1,100)])];
 const sequence=integer(g.sequence,0,1e9),paidThrough=integer(g.paidThrough,0,sequence),candidate=normalizeDrive(g.resume,owned),last=record(g.last),magicOwned=[...new Set([1,2,3,...ids(k.owned,1,12,12)])];
 return {garage:{bolts:integer(g.bolts,0,1e6),owned,build:normalizeBuild(g.build,owned),blueprints:(Array.isArray(g.blueprints)?g.blueprints:[]).slice(0,8).map(b=>normalizeBuild(b,owned)),best:Array.from({length:3},(_,i)=>integer(Array.isArray(g.best)?g.best[i]:0,0,10000)),goals:ids(g.goals,1,20),target:integer(g.target,0,100,12),sequence,paidThrough,resume:candidate&&candidate.id===sequence&&candidate.id>paidThrough?candidate:null,last:g.last?{distance:integer(last.distance,0,10000),bolts:integer(last.bolts,0,1e5),bonus:integer(last.bonus,0,1e5),challenge:integer(last.challenge,0,1e5),practice:last.practice===true}:null},kingdom:{petals:integer(k.petals,0,1e6),owned:magicOwned,layouts:Array.from({length:3},(_,i)=>Array.from({length:10},(_,j)=>{const row=Array.isArray(k.layouts)?k.layouts[i]:null;const id=Array.isArray(row)?row[j]:0;return Number.isInteger(id)&&magicOwned.includes(id)?id:0;})),rescued:ids(k.rescued,0,8,9),completed:ids(k.completed,0,2,3),color:integer(k.color,0,3),name:text(k.name,'Starlight'),island:integer(k.island,0,2)}};
}
export function buyPart(g:GarageSave,id:number):GarageSave{if(!Number.isInteger(id)||id<1||id>100||g.owned.includes(id)||g.bolts<priceFor(id))return g;return {...g,bolts:g.bolts-priceFor(id),owned:[...g.owned,id],target:g.target===id?0:g.target};}
export function equipPart(g:GarageSave,id:number,extra=false):GarageSave{if(!g.owned.includes(id))return g;const group=Math.floor((id-1)/10),slot=extra&&group===4?10:extra&&group===6?11:group;const parts=[...g.build.parts];parts[slot]=id;return {...g,build:normalizeBuild({...g.build,parts},g.owned)};}
export function finishDrive(g:GarageSave,run:Drive):GarageSave{
 if(run.id!==g.sequence||run.id<=g.paidThrough)return g;
 const distance=Math.floor(num(run.distance,0,10000)),base=run.practice?0:Math.floor(distance/5),bonus=!run.practice&&distance>g.best[run.track]?10:0;const goals=[...g.goals];let challenge=0;
 const awards:[number,boolean,number][]=[[1,distance>=50,20],[2,distance>=150,30],[3,distance>=300,40],[4,run.bestJump>=8,25],[5,run.landings>=3,25],[6,distance>=100&&run.build.parts.includes(67)&&run.cargo,30],[7,distance>=100&&!run.broken.some(i=>i<6),20]];
 if(!run.practice)for(const [id,done,amount]of awards)if(done&&!goals.includes(id)){goals.push(id);challenge+=amount;}
 const best=[...g.best];if(!run.practice)best[run.track]=Math.max(best[run.track],distance);
 return {...g,bolts:Math.min(1e6,g.bolts+base+bonus+challenge),goals,best,paidThrough:run.id,resume:null,last:{distance,bolts:base,bonus,challenge,practice:run.practice}};
}
export function buyMagic(k:KingdomSave,id:number):KingdomSave{if(!Number.isInteger(id)||id<1||id>12||k.owned.includes(id)||k.petals<magicPrice(id))return k;return {...k,petals:k.petals-magicPrice(id),owned:[...k.owned,id]};}
export function rescueFriend(k:KingdomSave,id:number):KingdomSave{if(!Number.isInteger(id)||id<0||id>8||k.rescued.includes(id))return k;return {...k,petals:Math.min(1e6,k.petals+15),rescued:[...k.rescued,id]};}
export function completeIsland(k:KingdomSave,island:number):KingdomSave{if(!Number.isInteger(island)||island<0||island>2||k.completed.includes(island)||![0,1,2].every(i=>k.rescued.includes(island*3+i)))return k;return {...k,completed:[...k.completed,island],petals:Math.min(1e6,k.petals+30)};}
