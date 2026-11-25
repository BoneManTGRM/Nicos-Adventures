'use strict';
const RangeRules=(()=>{
  const skies=['First light','Sundown','Moonlight'];
  const ranges=[
    {id:'savanna',name:'Kopje Crossing',area:'East Africa',color:'#edbb72',event:'The Sunmane crossing',landmarks:['Acacia Gate','Waterhole','Lion Rock'],seal:'Sun disc',sign:'☀',legend:'lion',home:'savanna',groups:[['elephant','giraffe','zebra'],['warthog','buffalo','hippo'],['lion','impala','kudu']],guests:['elephant','zebra'],intro:'Follow elephants across the waterhole until the Sunmane pride appears at Lion Rock.'},
    {id:'forest',name:'Cedar Run',area:'North Pacific',color:'#c1d79a',event:'The Silverback gathering',landmarks:['Cedar Bend','Salmon Ford','Granite Ridge'],seal:'Cedar cone',sign:'❖',legend:'grizzly',home:'frost',groups:[['kodiak','spirit','deer'],['grizzly','glacier','peninsular'],['elk','cinnamon','blackbear']],guests:['kodiak','spirit'],intro:'Watch Kodiaks by the cedars and cross Salmon Ford to find Silverback on Granite Ridge.'},
    {id:'ice',name:'Aurora Reach',area:'High Arctic',color:'#a7dadf',event:'The Northstar passage',landmarks:['Frost Gate','Mirror Lagoon','Northern Arch'],seal:'Ice star',sign:'✦',legend:'polar',home:'arctic',groups:[['muskox','arcticfox','polar'],['polar','muskox','arcticfox'],['arcticfox','polar','muskox']],guests:['muskox','arcticfox'],intro:'Cross the blue ice with musk oxen and arctic foxes before Northstar reaches the Northern Arch.'}
  ];
  const byId=Object.fromEntries(ranges.map(r=>[r.id,r]));
  const integer=(n,max)=>Number.isInteger(n)&&n>=0&&n<max;
  const unique=(a,max)=>Array.isArray(a)?[...new Set(a.filter(v=>integer(v,max)))]:[];
  function clean(raw,valid){
    const result={selected:Object.hasOwn(byId,raw?.selected)?raw.selected:'savanna',runs:{},logs:{}};
    for(const a of ranges){
      const e=raw?.logs?.[a.id],pic=e?.best;
      const photo=pic&&pic.id===a.id&&integer(pic.sky,3)&&Array.isArray(pic.cast)&&pic.cast.length===3&&pic.cast.every((t,i)=>t===null||valid(t)&&t.species===[...a.guests,a.legend][i])&&pic.cast[2]?.coat==='legend'&&Number.isFinite(pic.date)?pic:null;
      result.logs[a.id]={rushBest:Number.isSafeInteger(e?.rushBest)&&e.rushBest>0?e.rushBest:0,clears:Math.max(0,Math.floor(Number(e?.clears)||0)),skies:unique(e?.skies,3),best:photo};
      const r=raw?.runs?.[a.id];
      if(!r||r.id!==a.id||!integer(r.sky,3)||typeof r.token!=='string'||r.token.length>52||!/^[-a-zA-Z0-9]+$/.test(r.token)||!Number.isSafeInteger(r.seed)||!Number.isFinite(r.date)||!integer(r.stop,3)||!['roam','event','done'].includes(r.stage))continue;
      const lastCatch=r.lastCatch;
      result.runs[a.id]={...r,photo:unique(r.photo,12),bag:unique(r.bag,12),lastCatch:integer(lastCatch?.index,11)&&r.bag?.includes?.(lastCatch.index)?{index:lastCatch.index,record:lastCatch.record===true,prior:Number.isFinite(lastCatch.prior)?lastCatch.prior:null}:null,seen:!!r.seen,tool:r.tool==='hunt'?'hunt':'camera'};
      check(result.runs[a.id]);
    }
    return result;
  }
  function begin(id,sky,seed){
    return {id,sky,seed:seed>>>0,date:Date.now(),token:globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),stop:0,stage:'roam',tool:'hunt',seen:false,photo:[],bag:[]};
  }
  function animal(r,index){
    const a=byId[r.id],keys=a.groups.flat().concat(a.guests,a.legend),species=keys[index];
    if(!species)return null;
    const reserve=HuntRules.byKey[a.home].species.includes(species)?a.home:HuntRules.reserves.find(v=>v.species.includes(species)).key;
    const rand=PursuitRules.rng((r.seed^Math.imul(5381+index,2654435761))>>>0);
    const coat=index===11?'legend':rand()<.12?'ivory':'common';
    return {...HuntRules.roll(species,coat,rand),id:'r-'+r.token+'-'+index,species,reserve: index===11?a.home:reserve,date:r.date,rangeId:r.id,rangeStop:index>8?2:Math.floor(index/3),sky:r.sky,phase:rand()*5,x:.2+.6*rand(),direction:index%2===0?1:-1};
  }
  function provenance(t){
    const range=Object.hasOwn(byId,t?.rangeId)&&byId[t.rangeId];
    if(range&&t.rush)return {place:range.name+' · Crossing Rush',art:'range/'+range.id};
    return range&&integer(t.rangeStop,3)?{place:range.name+' · '+range.landmarks[t.rangeStop],art:'range/'+range.id}:null;
  }
  const place=t=>provenance(t)?.place||HuntRules.byKey[t.reserve].name;
  const background=t=>provenance(t)?.art||t.reserve;
  function targets(r){return {photo:r.sky,bag:3+(r.sky===0?0:r.sky===1?2:1)};}
  const size=pic=>pic?.cast?.filter(Boolean).length||0;
  function progress(r){
    const goal=targets(r);
    return [r.photo.includes(goal.photo)||r.bag.some(i=>i<3),r.bag.some(i=>i>=3&&i<6),r.seen||r.bag.some(i=>i>=6&&i<9)];
  }
  function active(r){
    if(r.stage==='done')return [];
    return (r.stage==='event'&&r.stop===2?[9,10,11]:[r.stop*3,r.stop*3+1,r.stop*3+2]).filter(i=>!r.bag.includes(i));
  }
  function check(r){if(r.stage==='roam'&&progress(r).every(Boolean))r.stage='event';}
  function seal(r){if(r.seen||r.stop!==2||r.stage!=='roam')return false;r.seen=true;check(r);return true;}
  function scene(r){
    return {id:r.id,sky:r.sky,date:r.date,gilt:!!r.gilt,cast:[9,10,11].map(i=>i===11||r.photo.includes(i)?animal(r,i):null)};
  }
  function focusAt(elapsed){return 1-Math.abs((elapsed%3.8)/1.9-1);}
  function interact(rec,r,i,tool,focus=0){
    if(!active(r).includes(i)||!['camera','hunt'].includes(tool))return null;
    const t=animal(r,i);
    if(tool==='camera'){
      if(i===11&&focus>=.69&&!r.gilt){
        r.gilt=true;if(!r.photo.includes(i)){r.photo.push(i);FieldAlbum.keep(rec,t);}
        return {kind:'exposure',t};
      }
      if(r.photo.includes(i))return {kind:'already',t};
      r.photo.push(i);FieldAlbum.keep(rec,t);check(r);return {kind:'photo',t};
    }
    if((i===9||i===10)&&!r.photo.includes(i))return {kind:'companion',t};

    r.bag.push(i);const record=HuntRules.file(rec,t);
    if(i<11){check(r);return {kind:'harvest',t,record};}
    const pic=scene(r),log=rec.range.logs[r.id];
    const rank=p=>size(p)*2+Number(!!p?.gilt);
    const better=rank(pic)>rank(log.best)||rank(pic)===rank(log.best)&&t.kg>(log.best?.cast[2]?.kg||0);
    if(better)log.best=pic;
    if(!rec.cabinet.some(item=>item.id===t.id))rec.cabinet.push(t);
    if(!log.skies.includes(r.sky))log.skies.push(r.sky);
    log.clears++;rec.hunts++;r.stage='done';r.featured=better;
    return {kind:'finish',t,record};
  }
  return {ranges,byId,skies,clean,begin,animal,targets,size,progress,active,seal,scene,interact,focusAt,place,background};
})();
