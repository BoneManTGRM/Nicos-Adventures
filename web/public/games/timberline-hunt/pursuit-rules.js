'use strict';
const PursuitRules=(()=>{
  const quarry=[
    {id:'brass-tusk',name:'Brass Tusk',species:'elephant',reserve:'savanna',terrain:'savanna',sign:'Sun',weather:'Late sun',description:'An elephant with brass-colored tusks crosses the amber flats. Find the sun seals to reach his clearing.',places:['Ochre Gate','Sun Pool','Acacia Crown'],motion:'amble',tint:'#f6c273'},
    {id:'cinderback',name:'Cinderback',species:'grizzly',reserve:'frost',terrain:'forest',sign:'Peak',weather:'Pine mist',description:'An ash-blond grizzly appears between the cedars. Join the mountain seals to find his stretch of river.',places:['Pine Gate','Split Boulder','Cinder Bluff'],motion:'roam',tint:'#e4b08a'},
    {id:'embermane',name:'Embermane',species:'lion',reserve:'savanna',terrain:'savanna',sign:'Flame',weather:'Ember dusk',description:'A lion with a copper mane moves through the red grass at dusk. Three fire seals mark his crossing.',places:['Red Gate','Ember Flats','Fire Crown'],motion:'dash',tint:'#ffa170'},
    {id:'blue-hour',name:'Blue Hour',species:'polar',reserve:'arctic',terrain:'ice',sign:'Star',weather:'Aurora',description:'A blue-white polar bear follows the lights over the ice shelf. Link the star seals under the aurora.',places:['Ice Gate','Mirror Floe','Aurora Arch'],motion:'glide',tint:'#a8e8e9'},
    {id:'red-comet',name:'Red Comet',species:'warthog',reserve:'baobab',terrain:'marsh',sign:'Bolt',weather:'Passing rain',description:'A red-bristled warthog darts between the reed islands. Follow the lightning seals through the marsh.',places:['Reed Gate','Baobab Bend','Thunder Bank'],motion:'zigzag',tint:'#bdda91'},
    {id:'fogbound',name:'Fogbound',species:'kodiak',reserve:'kodiak',terrain:'forest',sign:'Wave',weather:'Sea fog',description:'A copper-coated Kodiak lingers where the river meets the tide. Trace the wave seals through the fog.',places:['Cedar Gate','Tide Pool','Copper Inlet'],motion:'tide',tint:'#b8c6a0'}
  ];
  const gear={
    'brass-tusk':{name:'Brass Compass',power:'Start each new trail with three extra supplies.'},
    cinderback:{name:'Cinder Lantern',power:'Reveal the next step of a shortest route twice per trail.'},
    embermane:{name:'Ember Hourglass',power:'Add six seconds to each clearing encounter.'},
    'blue-hour':{name:'Aurora Prism',power:'Widen the gold timing band in the clearing.'},
    'red-comet':{name:'Reed Satchel',power:'Each supply cache restores four moves.'},
    fogbound:{name:'Tide Token',power:'Forgive the first mistaken tap in each pursuit.'}
  };
  const byId=Object.fromEntries(quarry.map(q=>[q.id,q]));
  const signature=t=>t&&Object.hasOwn(byId,t.signature)&&byId[t.signature].species===t.species&&byId[t.signature].reserve===t.reserve?byId[t.signature]:null;
  const cache=new Map();
  function rng(seed){
    let x=seed>>>0;
    return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};
  }
  function mix(items,rand){
    const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[j],a[i]]=[a[i],a[j]];}return a;
  }
  function near(pos,n){return [pos-n,pos+n,pos%n?pos-1:-1,pos%n===n-1?-1:pos+1].filter(i=>i>=0&&i<n*n);}
  function distance(a,b,n,walls){
    const queue=[a],d=new Map([[a,0]]);
    for(let i=0;i<queue.length;i++){
      const v=queue[i];if(v===b)return d.get(v);
      for(const next of near(v,n))if(!walls.includes(next)&&!d.has(next)){d.set(next,d.get(v)+1);queue.push(next);}
    }
    return Infinity;
  }
  function board(run){
    const key=run.id+':'+run.seed+':'+run.level+':'+(run.gear||'');
    if(cache.has(key))return cache.get(key);
    const n=run.level==='master'?5:4,start=n*(n-1),exit=n-1,rand=rng(run.seed);
    const cells=Array.from({length:n*n},(_,i)=>i).filter(i=>i!==start&&i!==exit);
    const walls=[];
    for(const i of mix(cells,rand)){
      const trial=[...walls,i];
      if(cells.filter(c=>!trial.includes(c)).concat(exit).every(c=>Number.isFinite(distance(start,c,n,trial))))walls.push(i);
      if(walls.length===(n===4?2:4))break;
    }
    const free=mix(cells.filter(c=>!walls.includes(c)),rand);
    const seals=free.slice(0,3),caches=free.slice(3,5),route=[start,...seals,exit];
    const optimal=route.slice(1).reduce((sum,pos,i)=>sum+distance(route[i],pos,n,walls),0);
    const value={n,start,exit,walls,seals,caches,optimal,supplies:optimal+(n===4?3:1)+(run.gear==='brass-tusk'?3:0)};
    if(cache.size>48)cache.clear();cache.set(key,value);return value;
  }
  function trail(run){
    const b=board(run),found=[];let seals=0;let pos=b.start;
    for(const next of run.path){pos=next;if(next===b.seals[seals])seals++;if(b.caches.includes(next)&&!found.includes(next))found.push(next);}
    return {pos,seals,found,remaining:b.supplies-run.path.length+found.length*(run.gear==='red-comet'?4:2),complete:seals===3&&pos===b.exit};
  }
  const states=['map','ready','field','tagged','escaped','done'];
  const levels=['trail','master'];
  const key=(id,level)=>id+'_'+level;
  const count=v=>Number.isFinite(v)&&v>=0?Math.floor(v):0;
  function records(raw,valid){
    const out={runs:{},ledger:{},selected:Object.hasOwn(byId,raw?.selected)?raw.selected:quarry[0].id};
    for(const q of quarry){
      const item=raw?.ledger?.[q.id]||{};
      out.ledger[q.id]={clears:count(item.clears),master:count(item.master),scores:{trail:count(item.scores?.trail??(!item.master?item.best:0)),master:count(item.scores?.master??(item.master?item.best:0))},best:count(item.best),stars:Math.min(3,count(item.stars)),heaviest:valid(item.heaviest)&&signature(item.heaviest)?.id===q.id?item.heaviest:null};
      for(const level of levels){
        const k=key(q.id,level),r=raw?.runs?.[k];
        if(!r||r.id!==q.id||r.level!==level||!states.includes(r.state)||!Number.isSafeInteger(r.seed)||typeof r.token!=='string'||r.token.length>100||!Array.isArray(r.path)||r.path.length>50)continue;
        const b=board(r);
        if(r.path.some((v,i)=>!Number.isInteger(v)||b.walls.includes(v)||!near(i?r.path[i-1]:b.start,b.n).includes(v)))continue;
        if(r.state==='done'&&(!valid(r.trophy)||signature(r.trophy)?.id!==q.id))continue;
        out.runs[k]={...r,rev:count(r.rev),fieldMs:count(r.fieldMs),mistakes:count(r.mistakes),retries:count(r.retries)};
      }
    }
    out.gear=Object.hasOwn(gear,raw?.gear)&&out.ledger[raw.gear].clears>0?raw.gear:null;
    return out;
  }
  function hint(r){
    if(r.state!=='map'||r.gear!=='cinderback'||(r.lights||0)>=2)return null;
    const b=board(r),t=trail(r),goal=b.seals[t.seals]??b.exit;
    const choices=near(t.pos,b.n).filter(i=>!b.walls.includes(i));
    choices.sort((a,c)=>distance(a,goal,b.n,b.walls)-distance(c,goal,b.n,b.walls));
    r.lights=(r.lights||0)+1;return choices[0];
  }
  const logged=book=>quarry.filter(q=>book.ledger[q.id].clears>0).length;
  function begin(id,level,seed,equipped=null){
    const token=globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
    return {id,level,gear:equipped,lights:0,shieldSpent:false,seed:seed>>>0,token,rev:0,path:[],fieldMs:0,mistakes:0,retries:0,state:'map'};
  }
  function move(r,to){
    if(r.state!=='map')return false;
    const b=board(r),t=trail(r);
    if(t.remaining<=0||!near(t.pos,b.n).includes(to)||b.walls.includes(to))return false;
    r.path.push(to);if(trail(r).complete)r.state='ready';return true;
  }
  function undo(r){if(r.state!=='map'||!r.path.length)return false;r.path.pop();return true;}
  const limit=r=>(r.level==='master'?26000:40000)+(r.gear==='embermane'?6000:0);
  function retry(r){
    if(r.state!=='escaped')return false;
    r.fieldMs=0;r.mistakes=0;r.retries++;r.state='ready';return true;
  }
  function spend(r,ms){
    if(r.state!=='field'&&r.state!=='tagged')return false;
    r.fieldMs=Math.min(limit(r),r.fieldMs+Math.max(0,Math.round(ms)));
    if(r.fieldMs>=limit(r))r.state='escaped';return true;
  }
  function tag(r){if(r.state!=='field')return false;r.state='tagged';return true;}
  function miss(r){if(!['field','tagged'].includes(r.state))return false;if(r.gear==='fogbound'&&!r.shieldSpent){r.shieldSpent=true;return true;}r.mistakes++;return spend(r,1800);}
  function rating(r){
    const t=trail(r),b=board(r),efficient=r.path.length<=b.optimal+2,clean=r.mistakes===0&&r.retries===0;
    const stars=1+Number(efficient)+Number(clean);
    const score=(r.level==='master'?1600:1000)+stars*200+t.found.length*80+t.remaining*14+Math.max(0,Math.ceil((limit(r)-r.fieldMs)/1000))*8;
    return {stars,score,efficient,clean};
  }
  function specimen(r){
    const q=byId[r.id],rand=rng(r.seed^0x6a09e667),p=(r.level==='master'?.86:.74)+rand()*(r.level==='master'?.14:.23);
    const s=HuntRules.wildlife[q.species],between=(arr,t)=>arr[0]+(arr[1]-arr[0])*t;
    return {id:'p-'+r.token,species:q.species,reserve:q.reserve,signature:q.id,coat:'common',kg:Math.round(between(s.weight,p)*10)/10,cm:Math.round(between(s.length,p*.6+rand()*.4)),medal:r.level==='master'&&rating(r).stars===3?'Diamond':rating(r).stars>=2?'Gold':'Silver',date:Date.now()};
  }
  function photo(r){const t=specimen(r);return {...t,phase:r.pose?.phase??r.fieldMs/300,x:r.pose?.x??.60,direction:r.pose?.direction??-1};}
  function finish(rec,r){
    if(r.state!=='tagged')return false;
    const t=specimen(r),result=rating(r),entry=rec.pursuits.ledger[r.id];
    HuntRules.file(rec,t);
    if(!rec.cabinet.some(v=>v.id===t.id))rec.cabinet.push(t);
    FieldAlbum.keep(rec,photo(r));
    r.firstClear=entry.clears===0;
    if(r.firstClear&&!rec.pursuits.gear&&!Object.values(rec.pursuits.ledger).some(v=>v.clears))rec.pursuits.gear=r.id;
    r.newBest=result.score>entry.scores[r.level];entry.scores[r.level]=Math.max(entry.scores[r.level],result.score);entry.best=Math.max(entry.best,result.score);entry.stars=Math.max(entry.stars,result.stars);
    entry.clears++;if(r.level==='master')entry.master++;
    r.crestUnlocked=r.firstClear&&logged(rec.pursuits)===quarry.length;
    if(!entry.heaviest||t.kg>entry.heaviest.kg)entry.heaviest=t;
    r.trophy=t;r.result=result;r.state='done';return true;
  }
  return {quarry,byId,signature,gear,logged,hint,rng,near,board,trail,key,records,begin,move,undo,limit,retry,spend,tag,miss,rating,specimen,photo,finish};
})();
