"use strict";
const Lantern = (() => {
 const rounds=3;
 const maxTurns=rounds*2;
 function create(lake,lure,gentle,seed){
  return {lake,lure,gentle,seed,roster:2,turns:[]};
 }
 function restore(raw,world){
  if(!raw||!Number.isInteger(raw.lake)||!world.places[raw.lake]||!world.tackle.some(r=>r.id===raw.lure)||
     !Number.isSafeInteger(raw.seed)||raw.seed<0||raw.seed>0xffffffff||!Array.isArray(raw.turns)||raw.turns.length>maxTurns)return null;
  const match=create(raw.lake,raw.lure,raw.gentle===true,raw.seed);
  match.roster=raw.roster===2?2:1;
  for(const turn of raw.turns){
   if(!turn||typeof turn.landed!=="boolean"||typeof turn.ring!=="boolean"||typeof turn.power!=="boolean"||
      typeof turn.quick!=="boolean"||!Number.isInteger(turn.counters)||turn.counters<0||turn.counters>2)return null;
   match.turns.push({landed:turn.landed,ring:turn.ring,power:turn.power,quick:turn.quick,counters:turn.counters});
  }
  return match;
 }
 function round(match,index=match.turns.length){
  const number=Math.floor(index/2);
  let state=(match.seed+Math.imul(number+1,2654435761))>>>0;
  function random(){state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;}
  return {number:number+1,team:index%2,tier:number,hot:{x:.24+random()*.43,y:.63+random()*.17},size:.28+random()*.58,wait:2.0+random()*1.1,variant:match.roster===2?random():0};
 }
 function points(turn){
  return (turn.landed?100:0)+(turn.ring?25:0)+(turn.power?20:0)+(turn.quick?15:0)+10*turn.counters;
 }
 function scores(match){
  const pair=[0,0];match.turns.forEach((turn,i)=>pair[i%2]+=points(turn));return pair;
 }
 function record(match,index,turn){
  if(index!==match.turns.length||index>=maxTurns)return false;
  match.turns.push({...turn});return true;
 }
 function powerAt(seconds,slow){
  const sweep=(seconds/(slow?2.8:1.75))%2;
  return sweep<1?sweep:2-sweep;
 }
 function placement(power){
  if(power==null)return {sweet:false,drift:0};
  const sweet=power>=.61&&power<=.81;
  return {sweet,drift:sweet?0:(.71-power)*.18};
 }
 function counterWindow(age,pattern){
  const window=age>=.55&&age<2.17?0:age>=2.6&&age<4.3?1:-1;
  return {window,side:(pattern+window)%2===0?"left":"right"};
 }
 function pullOffset(fight){
  if(fight.burstLeft>0)return 0;
  const elapsed=fight.age-(fight.turnAge??-10),cue=counterWindow(fight.age,fight.pattern);
  if(elapsed>=0&&elapsed<.75)return (fight.turnSide==="left"?-1:1)*.045*Math.sin(Math.PI*elapsed/.75);
  if(cue.window<0||fight.usedCounter===cue.window)return 0;
  const start=cue.window===0?.55:2.60;
  return (cue.side==="left"?1:-1)*.045*Math.sin(Math.PI*(fight.age-start)/(cue.window===0?1.62:1.7));
 }
 return {pullOffset,rounds,maxTurns,create,restore,round,points,scores,record,powerAt,placement,counterWindow};
})();
