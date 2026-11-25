'use strict';
const TimberTrails=(()=>{
  const routes=[
    {id:'tusk',name:'Tusk Trail',region:'African wetlands',theme:'#efaa66',description:'Follow the elephant herds from the open savanna into the forest of the River Monarch.',patch:'Ivory Compass',legs:[
      ['savanna','survey',['elephant','warthog'],'Savanna census'],['baobab','hunt',['buffalo','rhino'],'River crossing'],['riverforest','legend',['buffalo','leopard'],'The River Monarch']]},
    {id:'north',name:'Bear Country',region:'Northern wilderness',theme:'#a5cfcd',description:'Start among grizzlies, cross Kodiak country, and find Northstar on the Arctic ice.',patch:'Northern Paw',legs:[
      ['frost','survey',['grizzly','blackbear'],'The mountain pass'],['kodiak','hunt',['kodiak','deer'],'Coastal giants'],['arctic','legend',['arcticfox','muskox'],'Northstar on ice']]},
    {id:'cats',name:'Night Prowl',region:'Big-cat country',theme:'#d2adf0',description:'Meet a riverbank leopard and a snow leopard before Sunmane enters the golden grass.',patch:'Starlit Mane',legs:[
      ['baobab','survey',['leopard','impala'],'Riverbank shadows'],['highland','hunt',['snowleopard','yak'],'Above the clouds'],['savanna','legend',['zebra','warthog'],'The golden mane']]},
    {id:'ghost',name:'Ghost Bears',region:'Old-growth forests',theme:'#b3cf88',description:'Follow the pale bears through bamboo and cedar to the spectacled Stargazer in the cloud forest.',patch:'Cedar Moon',legs:[
      ['bamboo','survey',['panda','moonbear'],'Bamboo trail'],['cedar','hunt',['spirit','glacier'],'The pale crossing'],['cloud','legend',['vicuna','andeanfox'],'The Stargazer']]}
  ];
  const byId=Object.fromEntries(routes.map(r=>[r.id,r]));
  const named=k=>HuntRules.wildlife[k].name;
  function legFor(id,n){const [reserve,kind,targets,name]=byId[id].legs[n];return {reserve,kind,targets,name};}
  const letters=['I','II','III'];
  const patchSrc=id=>'assets/trails/'+id+'-badge.png';
  const cover=id=>'assets/trails/'+id+'.webp';
  function stamp(){return globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);}
  const key=id=>WorldHuntProfile.key('timberline.route.v1.'+id);
  const ram=new Map();
  let canSave=true;
  function read(id){
    let p=ram.has(id)?JSON.parse(JSON.stringify(ram.get(id))):null;
    let data=null;
    if(canSave)try{data=localStorage.getItem(key(id));}catch{canSave=false;}
    if(data)try{p=JSON.parse(data);}catch{}
    if(!p||p.version!==1||p.id!==id)return {id,version:1,rev:null,active:null,clears:0,best:0,stars:0,fastest:null,last:null};
    const a=p.active;
    if(a){
      if(!Number.isInteger(a.index)||a.index<0||a.index>2||!Array.isArray(a.legs)||a.legs.length!==a.index+Number(!!a.atCamp)||(a.atCamp&&a.index===2))p.active=null;
      else if(a.field){
        const f=a.field,o=f.objectives;
        const validAnimals=Array.isArray(f.animals)&&f.animals.every(v=>v&&Object.hasOwn(HuntRules.wildlife,v.species)&&v.specimen&&Number.isFinite(v.x)&&Number.isFinite(v.y));
        if(!validAnimals||!Array.isArray(f.order)||!Array.isArray(o?.seen)||!Array.isArray(o?.bagged)||!Array.isArray(f.state?.trophies)||!f.state.bag||!Number.isFinite(f.state.elapsed)||f.state.done)a.field=null;
      }
    }
    return p;
  }
  // Reject stale writers, so another tab cannot roll back a completed expedition.
  function write(p){
    const current=read(p.id);
    if(current.rev!==p.rev)return false;
    p.rev=stamp();ram.set(p.id,JSON.parse(JSON.stringify(p)));
    if(canSave)try{localStorage.setItem(key(p.id),JSON.stringify(p));}catch{canSave=false;}
    return true;
  }
  function start(p){
    p.active={runId:stamp(),index:0,legs:[],field:null,atCamp:false};
  }
  function objectives(){return {seen:[],bagged:[],taggedBag:false,legendBag:false,taggedLegend:false};}
  function event(leg,o,action,a){
    const k=a.species;
    if(action==='tag'&&leg.targets.includes(k)&&!o.seen.includes(k))o.seen.push(k);
    if(action==='bag'&&leg.targets.includes(k)){
      if(!o.bagged.includes(k))o.bagged.push(k);
      if(a.tagged)o.taggedBag=true;
    }
    if(action==='bag'&&leg.kind==='legend'&&o.seen.length>=leg.targets.length&&a.specimen.coat==='legend'&&k===HuntRules.byKey[leg.reserve].legendSpecies){
      o.legendBag=true;o.taggedLegend=!!a.tagged;
    }
  }
  function complete(leg,o){return leg.kind==='survey'?leg.targets.every(k=>o.seen.includes(k)):leg.kind==='hunt'?leg.targets.every(k=>o.bagged.includes(k)):o.legendBag;}
  function bonusText(kind){return kind==='survey'?'Finish within 30 seconds':kind==='hunt'?'Bag a target you tagged':'Photograph the legend before bagging it';}
  function describe(leg){
    const pair=leg.targets.map(named).join(' and ');
    if(leg.kind==='survey')return 'Photograph the '+pair+'.';
    if(leg.kind==='hunt')return 'Bag the '+pair+'.';
    return 'Photograph the '+pair+' to reveal '+HuntRules.byKey[leg.reserve].legend+', then bag the legend.';
  }
  function checklist(leg,o){
    const seen=leg.kind==='hunt'?o.bagged:o.seen;
    if(leg.kind==='legend'&&seen.length===leg.targets.length)return 'Hunt '+HuntRules.byKey[leg.reserve].legend;
    return (leg.kind==='hunt'?'Hunt ':'Tag ')+leg.targets.map(k=>(seen.includes(k)?'✓ ':'')+named(k)).join(' · ');
  }
  function settle(leg,o,r){
    const clear=complete(leg,o),extra=leg.kind==='survey'?r.elapsed<=30:leg.kind==='hunt'?o.taggedBag:o.taggedLegend;
    const clean=r.shots===r.hits,stars=clear?1+Number(clean)+Number(extra):0;
    return {clear,stars,clean,extra,score:Math.round(r.score)+(clear?100+stars*100+Math.max(0,Math.ceil(60-r.elapsed))*5:0),seconds:Math.ceil(r.elapsed),tags:r.tags||0,hits:r.hits};
  }
  function finishLeg(p,outcome){
    const a=p.active;if(!a||a.atCamp||!outcome.clear)return null;
    a.legs.push(outcome);a.field=null;a.atCamp=true;
    if(a.legs.length<3)return {final:false};
    const score=a.legs.reduce((n,s)=>n+s.score,0),stars=a.legs.reduce((n,s)=>n+s.stars,0),seconds=a.legs.reduce((n,s)=>n+s.seconds,0);
    const first=p.clears===0,personalBest=score>p.best;
    p.last={score,stars,seconds,legs:a.legs.slice(),date:Date.now(),first,personalBest};p.clears++;
    p.best=Math.max(score,p.best);p.stars=Math.max(stars,p.stars);p.fastest=p.fastest===null?seconds:Math.min(seconds,p.fastest);p.active=null;
    return {final:true,...p.last};
  }
  function nextLeg(p){if(!p.active?.atCamp||p.active.index>=2)return false;p.active.index++;p.active.atCamp=false;p.active.field=null;return true;}
  function shelf(){
    return '<div class="patch-shelf">'+routes.map(r=>{
      const p=read(r.id);return '<div class="patch-item '+(p.clears?'earned':'')+'"><img src="'+patchSrc(r.id)+'" alt=""><div><b>'+r.patch+'</b><small>'+r.name+'</small><span>'+(p.clears?'★ '+p.stars+'/9 · '+p.best.toLocaleString()+' pts<br>Fastest '+p.fastest+'s · '+p.clears+' clear'+(p.clears===1?'':'s'):'Finish all three legs')+'</span></div></div>';
    }).join('')+'</div>';
  }
  return {routes,byId,read,write,start,objectives,event,complete,bonusText,describe,checklist,settle,finishLeg,nextLeg,legFor,letters,patchSrc,cover,stamp,shelf,saved:()=>canSave};
})();
