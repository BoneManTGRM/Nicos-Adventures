'use strict';
(() => {
  const {wildlife,reserves} = HuntRules;
  const $=id=>document.getElementById(id);
  const icon=id=>'<svg aria-hidden="true"><use href="#i-'+id+'"/></svg>';
  const scene=$('scene'),canvas=$('world'),ctx=canvas.getContext('2d'),dialog=$('dialog');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let reserve=reserves[0], mode='lobby', round=null, animals=[], effects=[], width=1,height=1;
  let time=0,last=0,nextSpawn=0,nextRare=0,spawnOrder=[],audioCtx,muted=false,report=null;
  let notice='',noticeUntil=0,aim=null,modal='',lastHud='',snapshot;
  let target=null,zone='All',toastUntil=0,legendTime=48,saveFailed=false;
  let selectedRoute='tusk',trip=null,leg=null,objectives=null,camera=false,checkpointTime=0,fieldOpen=false,ambience=null,ambientName='';
  let legOutcome=null,tripFinal=null,pursuitAmbient='';
  const routes=TimberTrails;
  try{const saved=localStorage.getItem(WorldHuntProfile.key("timberline.trail.selected"));if(Object.hasOwn(routes.byId,saved))selectedRoute=saved;}catch{}
  function playAmbience(){
    if(muted||(mode!=='playing'&&!pursuitAmbient)||document.hidden||(mode==='range'&&dialog.open)){ambience?.pause();return;}
    const name=pursuitAmbient||(['savanna','baobab'].includes(reserve.key)?'grassland':['arctic','highland','frost','kodiak'].includes(reserve.key)?'alpine':'woodland');
    if(!ambience||ambientName!==name){ambience?.pause();ambience=new Audio('assets/trails/'+name+'.mp3');ambience.loop=true;ambience.volume=.55;ambientName=name;}
    ambience.play().catch(()=>{});
  }
  try{snapshot=JSON.parse(localStorage.getItem(HuntRules.storageKey));muted=localStorage.getItem('timberline.muted')==='true';}catch{}
  let records=HuntRules.records(snapshot);
  const storage=(key,value)=>{try{localStorage.setItem(key,value);return true;}catch{return false;}};
  function changeRecords(update){
    try{const fresh=JSON.parse(localStorage.getItem(HuntRules.storageKey));if(fresh&&!saveFailed)records=HuntRules.records(fresh);}catch{}
    update(records);saveFailed=!storage(HuntRules.storageKey,JSON.stringify(records));
  }
  window.addEventListener('storage',e=>{if(e.key===HuntRules.storageKey&&e.newValue){try{records=HuntRules.records(JSON.parse(e.newValue));if(mode==='lobby')title();if(modal==='room')room.refresh();if(mode==='pursuit')pursuits.external();if(mode==='range')openRange.external();}catch{}}});
  const lodge=TrophyLodge.create({enterRoom:slot=>openRoom('lodge',slot),get:()=>records,show:(html,label)=>showDialog('lodge',html,label),change:changeRecords,
    canTrack:()=>['camp','lobby','results','pursuit','range'].includes(mode),track:k=>{
      if(mode!=='lobby')resetHome();else closeDialog();
      if(!reserve.species.includes(k))reserve=reserves.find(r=>r.species.includes(k));
      zone='All';target=k;title();$('start').focus({preventScroll:true});scene.scrollIntoView({block:'nearest'});
    }});
  const room=TrophyRoom.create({root:$('dialog-content'),get:()=>records,change:changeRecords,
    show:(html,label)=>showDialog('room',html,label),replay:(t,back,fall)=>lodge.replay(t,back,fall),
    lodge:()=>lodge.open('Showcase'),leave:leaveRoom,
    canHunt:()=>['camp','lobby','results','pursuit','range'].includes(mode),
    hunt:k=>{resetHome();reserve=reserves.find(r=>r.species.includes(k));zone='All';target=k;title();$('start').focus({preventScroll:true});}
  });
  const pursuits=WildPursuits.create({root:$('pursuit-screen'),get:()=>records,change:changeRecords,
    exitTo:which=>which==='range'?goRange():which==='quick'?resetHome():goCamp(selectedRoute),
    hang:t=>lodge.hang(t),plaque:t=>lodge.record(t),album:()=>lodge.open('Photos'),
    ambient:terrain=>{pursuitAmbient=terrain?(terrain==='ice'?'alpine':terrain==='savanna'?'grassland':'woodland'):'';playAmbience();},
    sound:kind=>{
      audioReady();
      const tones={move:280,seal:640,cache:550,photo:920,wrong:180,win:720,start:400};
      note(tones[kind]||330,kind==='move'?.045:.095,kind==='wrong'?'sawtooth':'triangle',.03);
      if(['seal','win','photo'].includes(kind))note(kind==='photo'?1200:900,.15,'sine',.035,.11);
    }
  });
  const openRange=OpenRange.create({root:$('range-screen'),get:()=>records,change:changeRecords,
    exit:key=>key==='quick'?resetHome():key==='pursuits'?goPursuits():goCamp(selectedRoute),
    hang:t=>lodge.hang(t),room:()=>room.openPrints('game'),
    sound:kind=>{audioReady();const freq={start:392,move:260,photo:875,seal:660,win:790};note(freq[kind]||440,.10,'triangle');if(kind==='win')note(990,.18,'sine',.033,.12);},
    ambient:key=>{pursuitAmbient=key?({savanna:'grassland',forest:'woodland',ice:'alpine'})[key]:'';playAmbience();}
  });
  function goRange(){
    if(['playing','paused'].includes(mode)){pause();return;}
    goCamp(selectedRoute);mode='range';$('trail-home').hidden=true;$('range-screen').hidden=false;
    $('hunt-nav').removeAttribute('aria-current');$('exp-nav').removeAttribute('aria-current');$('range-nav').setAttribute('aria-current','page');
    openRange.home();window.scrollTo(0,0);
  }
  function goPursuits(){
    if(['playing','paused'].includes(mode)){pause();return;}
    goCamp(selectedRoute);mode='pursuit';$('trail-home').hidden=true;$('pursuit-screen').hidden=false;
    $('exp-nav').removeAttribute('aria-current');$('hunt-nav').removeAttribute('aria-current');$('pursuit-nav').setAttribute('aria-current','page');
    pursuits.home();window.scrollTo(0,0);
  }
  function exitPursuits(){openRange.leave();$('range-screen').hidden=true;$('range-nav').removeAttribute('aria-current');pursuits.leave();$('pursuit-screen').hidden=true;$('pursuit-nav').removeAttribute('aria-current');}
  function openRoom(from='game',slot){
    if(mode==='pursuit')pursuits.pause();
    if(mode==='playing'){checkpoint();mode='paused';aim=null;}
    room.open(from,slot);
  }
  function leaveRoom(origin){
    if(window.location?.hash==='#trophy-room')history.replaceState(null,'',window.location.pathname+window.location.search);
    if(origin==='lodge'){lodge.open('Showcase');return;}
    closeDialog();
    if(mode==='paused')pause();
    else if(mode==='results')results();
    else if(mode==='debrief'){if(tripFinal)endScreen();else if(legOutcome?.clear)campScreen();else failScreen();}
  }
  const fmt=n=>n.toLocaleString('en-US');
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const random=(a,b)=>a+Math.random()*(b-a);
  function audioReady(){
    if(muted)return;
    try{
      if(!audioCtx){const AC=window.AudioContext||window.webkitAudioContext;if(AC)audioCtx=new AC();}
      if(audioCtx?.state==='suspended')audioCtx.resume().catch(()=>{});
    }catch{}
  }
  function note(frequency,duration,type,volume=0.035,offset=0,end=frequency){
    if(muted||!audioCtx)return;
    const start=audioCtx.currentTime+offset,o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.type=type;o.frequency.setValueAtTime(frequency,start);o.frequency.exponentialRampToValueAtTime(end,start+duration);
    g.gain.setValueAtTime(.001,start);g.gain.linearRampToValueAtTime(volume,start+.006);
    g.gain.exponentialRampToValueAtTime(.001,start+duration);o.connect(g);g.connect(audioCtx.destination);
    o.start(start);o.stop(start+duration+.02);
  }
  function soundButton(){
    $('sound').setAttribute('aria-pressed',String(!muted));$('sound').setAttribute('aria-label',muted?'Enable sound':'Mute sound');
    $('sound').title=muted?'Enable sound':'Mute sound';$('sound').innerHTML=icon(muted?'muted':'volume');
  }
  $('sound').onclick=()=>{muted=!muted;storage('timberline.muted',String(muted));soundButton();playAmbience();if(!muted){audioReady();note(520,.10,'triangle');}};
  function navState(camp){
    $('exp-nav').toggleAttribute('aria-current',camp);$('hunt-nav').toggleAttribute('aria-current',!camp);
  }
  function setupTrails(){
    const cards=$('trail-cards');
    for(const r of routes.routes){
      const b=document.createElement('button');b.type='button';b.className='route-card';b.dataset.route=r.id;
      b.style.setProperty('--cover','url('+routes.cover(r.id)+')');b.style.setProperty('--route-accent',r.theme);
      b.innerHTML='<span class="route-card-info"><small>'+r.region+'</small><b>'+r.name+'</b><span class="route-state"></span></span>';
      b.onclick=()=>{selectedRoute=r.id;storage(WorldHuntProfile.key('timberline.trail.selected'),r.id);showRoute();};
      cards.append(b);
    }
    $('trail-begin').onclick=()=>{
      trip=routes.read(selectedRoute);
      if(trip.active?.atCamp){leg=routes.legFor(trip.id,trip.active.index);legOutcome=trip.active.legs.at(-1);mode='debrief';campScreen();}
      else if(trip.active?.field)startLeg();
      else planScreen();
    };
  }
  function showRoute(){
    const r=routes.byId[selectedRoute],p=routes.read(r.id),hero=$('trail-hero');
    hero.style.setProperty('--cover','url('+routes.cover(r.id)+')');
    hero.style.setProperty('--accent',r.theme);
    $('trail-name').textContent=r.name;$('trail-region').textContent=r.region+' expedition';$('trail-copy').textContent=r.description;
    $('hero-patch').innerHTML='<img src="'+routes.patchSrc(r.id)+'" alt="'+r.patch+' expedition patch">';
    $('trail-begin').lastElementChild.textContent=p.active?'Resume expedition':'Open expedition';
    $('trail-overview').textContent=p.active?'Checkpoint · '+(p.active.atCamp?'Camp after leg '+(p.active.index+1):'Leg '+(p.active.index+1)+' of 3'):'3 reserves · 3 field objectives';
    $('trail-best').textContent=p.clears?'Personal best '+fmt(p.best)+' · ★ '+p.stars+'/9':r.patch+' patch';
    $('trail-cards').querySelectorAll('button').forEach(b=>{
      const v=routes.read(b.dataset.route);b.setAttribute('aria-pressed',String(b.dataset.route===r.id));
      b.querySelector('.route-state').textContent=v.active?'Checkpoint saved':v.clears?'★ '+v.stars+'/9':'3 legs';
    });
  }
  function goCamp(id){
    exitPursuits();
    if(routes.byId[id])selectedRoute=id;
    trip=null;leg=null;objectives=null;legOutcome=null;tripFinal=null;round=null;fieldOpen=false;mode='camp';
    animals=[];effects=[];aim=null;lastHud='';setCamera(false);playAmbience();closeDialog();navState(true);
    scene.classList.remove('playing');scene.hidden=true;$('field-deck').hidden=true;$('grounds').hidden=true;$('trail-home').hidden=false;showRoute();window.scrollTo(0,0);
  }
  function planScreen(){
    const r=routes.byId[selectedRoute],p=routes.read(r.id);
    const stops=r.legs.map((_,i)=>{
      const step=routes.legFor(r.id,i),dest=HuntRules.byKey[step.reserve];
      return '<li><img src="assets/'+step.reserve+'.webp" alt=""><div><small>Leg '+routes.letters[i]+' · '+dest.name+'</small><b>'+step.name+'</b><span>'+routes.describe(step)+'</span><small>Bonus star · '+routes.bonusText(step.kind)+'</small></div></li>';
    }).join('');
    showDialog('trail-plan','<p class="kicker">Expedition briefing</p><h2>'+r.name+'</h2><ol class="trail-itinerary">'+stops+'</ol><div class="reward-line"><img src="'+routes.patchSrc(r.id)+'" alt=""><div><small>Completion reward</small><b>'+r.patch+' patch</b></div></div><div class="actions"><button class="primary" id="launch-leg">'+icon('play')+(p.active?'Continue trail':'Start expedition')+'</button></div>','Expedition briefing');
    $('launch-leg').onclick=()=>{trip=routes.read(r.id);if(!trip.active)routes.start(trip);if(!saveTrip())return;startLeg();};
  }
  function saveTrip(){
    if(!trip)return false;
    if(routes.write(trip))return true;
    const id=trip.id;goCamp(id);showDialog('trail-plan','<p class="kicker">Checkpoint updated</p><h2>Trail refreshed</h2><p>This expedition changed in another tab. Return to camp to open the current checkpoint.</p><div class="actions"><button class="primary" id="sync-camp">Return to camp</button></div>','Trail refreshed');$('sync-camp').onclick=()=>goCamp(id);return false;
  }
  function checkpoint(){
    if(!trip?.active||!fieldOpen||!round||round.done||!leg||trip.active.atCamp)return;
    checkpointTime=round.elapsed;
    const {reserve:unused,...state}=round;
    trip.active.field={state,animals,objectives,order:spawnOrder,nextSpawn,nextRare,legendTime,camera};
    saveTrip();
  }
  function startLeg(){
    if(!trip?.active)return;
    const a=trip.active;leg=routes.legFor(trip.id,a.index);reserve=HuntRules.byKey[leg.reserve];
    objectives=routes.objectives();legOutcome=null;tripFinal=null;target=null;zone='All';title();navState(true);
    prepareRound(a.field);
  }
  function bringLegend(){
    const firstSighting=!round.legendSeen;
    round.legendSeen=true;setCamera(false);
    if(firstSighting){
      const ribbon=$('legend-reveal');
      ribbon.innerHTML='<img src="'+routes.patchSrc(trip.id)+'" alt=""><span><small>Legend sighting</small><strong>'+reserve.legend+'</strong><i>'+wildlife[reserve.legendSpecies].name+'</i></span>';
      ribbon.hidden=false;round.revealUntil=round.elapsed+3.25;
    }
    spawn(reserve.legendSpecies,.76,'legend');const a=animals.at(-1);a.rest=3.5;a.untilRest=7;a.y=.885;
    note(494,.13,'triangle',.04);note(740,.23,'sine',.045,.12);
    tip(reserve.legend+' revealed · Hunt mode ready',3.2);
    $('announcer').textContent=reserve.legend+' is in the clearing';nextSpawn=3;
  }
  function expeditionSpawns(){
    if(leg.kind==='legend'&&objectives.seen.length===leg.targets.length&&!animals.some(a=>a.specimen.coat==='legend')){
      bringLegend();return;
    }
    if(nextSpawn>0)return;
    const interested=leg.kind==='hunt'?objectives.bagged:objectives.seen;
    const missing=leg.targets.find(k=>!interested.includes(k)&&!animals.some(a=>a.species===k&&a.x>-.08&&a.x<1.08));
    if(missing&&animals.length<7){spawn(missing);nextSpawn=1.25;return;}
    if(animals.length<4){
      spawn(nextSpecies(),undefined,nextRare<=0?'ivory':'common');
      if(nextRare<=0)nextRare=22;
    }
    nextSpawn=1.7;
  }
  function afterAction(){
    if(leg&&routes.complete(leg,objectives)){
      checkpoint();
      if(!effects.some(e=>e.reaction))endLeg();
      return;
    }
    updateHud();checkpoint();
  }
  function endLeg(){
    if(!trip?.active||!fieldOpen)return;
    updateHud();fieldOpen=false;round.done=true;mode='debrief';aim=null;playAmbience();legOutcome=routes.settle(leg,objectives,round);
    if(!legOutcome.clear){trip.active.field=null;if(saveTrip())failScreen();return;}
    const result=routes.finishLeg(trip,legOutcome);
    if(!result||!saveTrip())return;
    note(392,.12,'triangle');note(587,.15,'triangle',.04,.12);note(784,.23,'sine',.05,.26);
    if(result.final){tripFinal=result;endScreen();}else campScreen();
  }
  function starBar(count,total=3){return '<span class="star-bar" aria-label="'+count+' of '+total+' stars">'+'★'.repeat(count)+'<i>'+'☆'.repeat(total-count)+'</i></span>';}
  function campScreen(){
    const r=routes.byId[trip.id],a=trip.active,step=routes.legFor(r.id,a.index+1),mark=legOutcome||a.legs.at(-1);
    showDialog('trail-summary','<div class="leg-banner" style="--cover:url(assets/'+leg.reserve+'.webp)"><small>'+r.name+' · Leg '+routes.letters[a.index]+'</small><h2>Leg complete</h2>'+starBar(mark.stars)+'</div><div class="camp-score"><b>'+fmt(mark.score)+' pts</b><span>'+mark.seconds+' seconds · '+mark.tags+' tagged · '+mark.hits+' bagged</span></div><div class="star-detail">'+(mark.clean?'✓':'○')+' No missed shots<br>'+(mark.extra?'✓':'○')+' '+routes.bonusText(leg.kind)+'</div><h3>Next · '+HuntRules.byKey[step.reserve].name+'</h3><p>'+routes.describe(step)+'</p><div class="actions"><button class="primary" id="next-leg">Start leg '+routes.letters[a.index+1]+'</button><button class="dark-btn" id="leave-camp">Return to camp</button></div>','Leg complete');
    $('next-leg').onclick=()=>{if(routes.nextLeg(trip)&&saveTrip())startLeg();};$('leave-camp').onclick=()=>goCamp(r.id);
  }
  function failScreen(){
    showDialog('trail-fail','<p class="kicker">'+routes.byId[trip.id].name+' · Leg '+routes.letters[trip.active.index]+'</p><h2>Time ran out</h2><p>'+routes.describe(leg)+'</p><p class="lodge-note">Completed legs, postcards and animal trophies are saved. Retry this leg with a fresh clock.</p><div class="actions"><button class="primary" id="retry-leg">Retry leg</button><button class="dark-btn" id="leave-camp">Return to camp</button></div>','Leg timed out');
    $('retry-leg').onclick=startLeg;$('leave-camp').onclick=()=>goCamp(selectedRoute);
  }
  function endScreen(){
    const r=routes.byId[selectedRoute],f=tripFinal,p=routes.read(r.id);
    const legend=round?.trophies.find(e=>e.t.coat==='legend')?.t;
    const list=f.legs.map((v,i)=>'<li><span>'+routes.legFor(r.id,i).name+'</span>'+starBar(v.stars)+'</li>').join('');
    showDialog('route-end','<div class="finish-emblem" style="--cover:url('+routes.cover(r.id)+')"><img src="'+routes.patchSrc(r.id)+'" alt="'+r.patch+'"></div><p class="kicker">'+(f.first?'New expedition patch':'Expedition complete')+'</p><h2>'+r.patch+'</h2><div class="camp-score"><b>'+fmt(f.score)+' pts</b><span>'+f.stars+'/9 stars · '+f.seconds+' seconds</span></div><ul class="result-legs">'+list+'</ul><p class="lodge-note">'+(f.personalBest?'New personal best. ':'')+'Route best '+fmt(p.best)+' pts · Fastest '+p.fastest+'s · '+p.clears+' completed.</p><div class="actions"><button class="primary" id="back-trails">Expedition camp</button>'+(legend?'<button class="dark-btn" id="replay-finale">Replay legend</button>':'')+'<button class="dark-btn" id="see-patches">View patches</button></div>','Expedition complete');
    if(legend)$('replay-finale').onclick=()=>lodge.replay(legend,endScreen);
    $('back-trails').onclick=()=>goCamp(r.id);$('see-patches').onclick=()=>lodge.open('Expeditions');
  }

  function title(){
    const words=reserve.name.split(' ');
    $('region-title').innerHTML=words.map(w=>'<span>'+w+'</span>').join(' ');
    $('reserve-region').textContent=reserve.region+' · Hunting reserve';
    $('species-line').textContent=reserve.species.slice(0,3).map(k=>wildlife[k].name).join('  ·  ')+(reserve.species.length>3?'  +'+(reserve.species.length-3):'');
    $('track-label').textContent=target?'Tracking '+wildlife[target].name:'Track species';
    $('scene').dataset.reserve=reserve.key;
    $('condition').textContent=reserve.light;$('best').textContent=fmt(records.bests[reserve.key]);
    $('landscape').style.backgroundImage='url("assets/'+reserve.key+'.webp")';
    document.querySelectorAll('.reserve-card').forEach(b=>{
      const r=HuntRules.byKey[b.dataset.key];b.setAttribute('aria-pressed',String(r===reserve));
      b.hidden=!inZone(r,zone);
      const logged=r.species.filter(k=>records.bag[k]>0).length;
      b.querySelector('.coverage').textContent=logged+'/'+r.species.length+' logged';
    });
    document.querySelectorAll('[data-zone]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.zone===zone)));
  }
  function inZone(r,z){return z==='All'||(z==='Africa'?r.region==='Africa':z==='Big game'?r.species.some(k=>HuntRules.giantKeys.includes(k)):r.species.some(k=>wildlife[k].group==='Bears'));}
  for(const z of ['All','Africa','Bear country','Big game']){
    const b=document.createElement('button');b.dataset.zone=z;b.textContent=z;b.onclick=()=>{
      zone=z;if(!inZone(reserve,z)){reserve=reserves.find(r=>inZone(r,z));target=null;}title();
    };document.querySelector('.ground-filters').appendChild(b);
  }
  for(const [i,r] of reserves.entries()){
    const b=document.createElement('button');b.className='reserve-card';b.dataset.key=r.key;b.setAttribute('aria-label',r.name+', '+r.habitat);
    b.style.backgroundImage='url("assets/'+r.key+'.webp")';
    b.innerHTML='<span><b>'+r.name+'</b><small>'+r.habitat+'</small></span><span class="coverage"></span><span class="selected-mark">'+icon('check')+'</span>';
    b.onclick=()=>{if(mode!=='lobby')return;reserve=reserves[i];target=null;title();audioReady();note(260,.07,'triangle');};
    document.querySelector('.cards').appendChild(b);
  }
  function resetHome(){
    exitPursuits();
    mode='lobby';round=null;trip=null;leg=null;objectives=null;animals=[];effects=[];aim=null;lastHud='';fieldOpen=false;
    $('legend-reveal').hidden=true;playAmbience();scene.hidden=false;$('trail-home').hidden=true;$('field-deck').hidden=true;setCamera(false);navState(false);
    scene.classList.remove('playing');$('hud').hidden=true;$('lobby').hidden=false;$('grounds').hidden=false;
    canvas.tabIndex=-1;closeDialog();title();$('start').focus({preventScroll:true});
  }
  function prepareRound(restored=null){
    $('legend-reveal').hidden=true;closeDialog();audioReady();note(392,.10,'triangle');note(587,.16,'triangle',.027,.10);
    mode='playing';scene.hidden=false;$('trail-home').hidden=true;$('field-deck').hidden=false;round=HuntRules.round(reserve,records.equipped);round.tags=0;animals=[];effects=[];spawnOrder=[];aim=null;lastHud='';
    nextRare=random(15,23);legendTime=random(44,49);nextSpawn=1.3;toastUntil=0;$('trophy-toast').hidden=true;
    scene.classList.add('playing');$('lobby').hidden=true;$('grounds').hidden=true;$('hud').hidden=false;canvas.tabIndex=0;
    resize();
    if(restored?.state){
      Object.assign(round,restored.state,{reserve});animals=restored.animals;objectives=restored.objectives;spawnOrder=restored.order;
      nextRare=restored.nextRare;nextSpawn=restored.nextSpawn;legendTime=restored.legendTime;setCamera(!!restored.camera);
    }else{
      setCamera(!!leg&&leg.kind!=='hunt');
      const pair=leg?leg.targets:[target||reserve.species[0],reserve.species.find(k=>k!==(target||reserve.species[0]))];
      spawn(pair[0],.63);spawn(pair[1],.28);
      if(leg)animals.forEach(a=>{a.rest=2.3;a.untilRest=5;});
    }
    last=0;fieldOpen=true;checkpointTime=round.elapsed;playAmbience();
    tip(leg?(camera?'Camera ready · tap a target to tag it':'Hunt ready · tap a target to bag it'):(matchMedia('(pointer: coarse)').matches?'Tap an animal to shoot':'Click an animal to shoot'),3.0);
    canvas.focus({preventScroll:true});window.scrollTo(0,0);updateHud();checkpoint();
  }
  function spawn(k,x,coat='common'){
    LandingArt.warm(k);
    const specimen=HuntRules.roll(k,coat),direction=x==null?(Math.random()<.5?1:-1):(x<.5?1:-1);
    const floor=['blue','kodiak','arctic','cedar','riverforest'].includes(reserve.key)?.88:.80;
    const y=k==='pheasant'?random(.40,.61):random(floor,.944);
    const trait=wildlife[k].group==='Bears'?'bear':HuntRules.herdKeys.includes(k)?'herd':
      ['lion','leopard','snowleopard','andeanfox','fox','arcticfox'].includes(k)?'cat':k==='warthog'||k==='boar'?'hog':'roam';
    animals.push({uid:routes.stamp(),tagged:false,species:k,x:x??(direction===1?-.12:1.12),y,rare:coat!=='common',specimen,trait,direction,phase:random(0,Math.PI*2),
      speed:wildlife[k].speed*random(.84,1.1),scale:specimen.size,rest:0,untilRest:random(2.1,4.8),flee:0,age:0});
  }
  function nextSpecies(){
    if(!spawnOrder.length){
      spawnOrder=target?[...reserve.species,target]:[...reserve.species];
      for(let i=spawnOrder.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[spawnOrder[i],spawnOrder[j]]=[spawnOrder[j],spawnOrder[i]];}
    }
    return spawnOrder.pop();
  }
  function advance(dt){
    const objectiveMet=leg&&routes.complete(leg,objectives);
    if(!objectiveMet)HuntRules.tick(round,dt);
    for(const e of effects)e.age+=dt;
    effects=effects.filter(e=>e.age<e.life);
    if(round.done||objectiveMet){
      if(!effects.some(e=>e.reaction))finish();
      return;
    }
    nextSpawn-=dt;nextRare-=dt;
    for(const a of animals){
      a.age+=dt;a.flee=Math.max(0,a.flee-dt);a.untilRest-=dt;
      if(a.untilRest<=0&&a.species!=='pheasant'&&!a.flee){a.rest=a.trait==='bear'?random(1.2,2.2):a.trait==='cat'?random(.45,1.8):random(.4,1.15);a.untilRest=random(2.8,5.5);
        if(a.trait==='hog'&&a.x>.13&&a.x<.87&&Math.random()<.48)a.direction*=-1;}
      a.rest=Math.max(0,a.rest-dt);
      a.velocity=0;a.gaitRate=0;
      if(a.rest===0||a.flee>0){
        const pacing=a.flee>0?(a.trait==='bear'?1.35:1.85):
          a.trait==='herd'?1+.2*Math.sin(a.age*1.4):a.trait==='cat'?1+.35*Math.max(0,Math.sin(a.age*1.7)):1;
        a.velocity=a.direction*a.speed*pacing;
        a.x+=a.velocity*dt;
        a.gaitRate=(a.species==='pheasant'?9:a.species==='hare'?8:5)*pacing;
        a.phase+=dt*a.gaitRate;
      }
    }
    animals=animals.filter(a=>a.x>-.30&&a.x<1.3&&a.age<34);
    if(leg){
      expeditionSpawns();
      updateHud();
      if(round.elapsed-checkpointTime>=3)checkpoint();
      return;
    }
    const speciesLogged=Object.values(round.bag).filter(n=>n>0).length;
    if(!round.legendSeen&&(speciesLogged>=3||round.elapsed>=legendTime)){
      round.legendSeen=true;spawn(reserve.legendSpecies,undefined,'legend');tip('Legend on the trail · '+reserve.legend,4.5);
      note(587,.15,'sine',.035);note(880,.22,'sine',.025,.17);
    }else if(nextRare<=0&&animals.length<6){
      const k=target||nextSpecies();spawn(k,undefined,'ivory');nextRare=random(22,29);tip('Ivory '+wildlife[k].name.toLowerCase()+' sighted · 3× points',3.5);
    }else if(nextSpawn<=0&&animals.length<5){
      spawn(nextSpecies());nextSpawn=random(1.20,2.2);
    }
    if(!animals.some(a=>a.x>.02&&a.x<.98)&&nextSpawn>1)nextSpawn=.6;
    updateHud();
  }
  function geometry(a){
    const base=Math.min(height*.38,width*.31);
    const depth=a.species==='pheasant'?.86:clamp(.80+(a.y-.82)*1.9,.78,1.08);
    const h=Math.max(a.species==='hare'?36:43,base*wildlife[a.species].size*depth*a.scale);
    const wave=a.species==='pheasant'?Math.sin(a.phase*.38)*height*.026:
      a.species==='hare'?Math.max(0,Math.sin(a.phase))*h*.17:Math.abs(Math.sin(a.phase))*h*.014;
    const rate=a.gaitRate||0, sine=Math.sin(a.phase);
    const liftRate=a.species==='pheasant'?Math.cos(a.phase*.38)*height*.026*.38*rate:
      Math.cos(a.phase)*rate*h*(a.species==='hare'?(sine>0?.17:0):Math.sign(sine)*.014);
    return {x:a.x*width,y:a.y*height-wave,h,verticalVelocity:-liftRate};
  }
  function tip(text,seconds){notice=text;noticeUntil=(round?.elapsed||0)+seconds;$('announcer').textContent=text;}
  function reload(){
    if(mode!=='playing')return;
    if(HuntRules.reload(round)){note(230,.08,'triangle',.03,0,320);note(310,.10,'triangle',.025,.18,430);updateHud();}
  }
  function hitAt(x,y,pad){
    const ordered=[...animals].sort((a,b)=>b.y-a.y);
    return ordered.find(a=>{const g=geometry(a);return TimberWildlife.hitTest(a.species,g.x,g.y,g.h,a.direction,a.phase,x,y,pad,TrophyLodge.palette(a.specimen));});
  }
  function setCamera(value){
    camera=value;scene.classList.toggle('camera-on',camera);$('camera-frame').hidden=!camera;
    $('shoot-mode').setAttribute('aria-pressed',String(!camera));$('photo-mode').setAttribute('aria-pressed',String(camera));lastHud='';
  }
  function switchTool(value){if(mode!=='playing')return;setCamera(value);note(value?720:360,.07,'sine',.025);tip(value?'Camera · tap wildlife to tag and photograph':'Hunt · tap wildlife to shoot',2);canvas.focus({preventScroll:true});updateHud();checkpoint();}
  function tagAnimal(x,y,pad){
    const a=hitAt(x,y,Math.max(9,pad));
    if(!a){tip('Frame an animal and tap it',1.2);return;}
    if(a.tagged){tip('Already tagged · switch to Hunt to bag it',1.5);return;}
    a.tagged=true;round.tags++;round.score+=50;
    const photo=FieldAlbum.capture(a,reserve);let kept=false;changeRecords(rec=>{kept=FieldAlbum.keep(rec,photo);});
    if(leg)routes.event(leg,objectives,'tag',a);
    const label=TrophyLodge.name(photo);
    $('trophy-toast').innerHTML=icon('camera')+'<span><small>'+(kept?'Postcard saved':'Field tag')+' · +50</small><b>'+label+'</b><small>'+photo.medal+' · Est. '+TrophyLodge.weight(photo.kg*.95)+'–'+TrophyLodge.weight(photo.kg*1.05)+'</small></span>';
    $('trophy-toast').hidden=false;toastUntil=round.elapsed+2.5;
    note(850,.06,'triangle',.035);note(1190,.09,'sine',.025,.07);$('announcer').textContent=label+' tagged';
    if(!reduced){scene.classList.remove('shutter');void scene.offsetWidth;scene.classList.add('shutter');}
    if(leg?.kind==='legend'&&objectives.seen.length===leg.targets.length&&!round.legendSeen){bringLegend();}
    else if(!leg||!routes.complete(leg,objectives))tip('Tagged · +75 if you bag this animal',1.9);
    afterAction();
  }
  function shoot(x,y,pad){
    if(mode!=='playing'||round.done||(leg&&routes.complete(leg,objectives)))return;
    if(trip&&routes.read(trip.id).rev!==trip.rev){saveTrip();return;}
    audioReady();if(camera){tagAnimal(x,y,pad);return;}
    if(round.reload)return;
    if(!round.bullets){reload();return;}
    const hit=hitAt(x,y,pad);
    const result=HuntRules.shoot(round,hit);if(!result)return;
    note(168,.10,'sawtooth',.038,0,40);
    if(!reduced){scene.classList.remove('shot');void scene.offsetWidth;scene.classList.add('shot');}
    if(hit){
      animals.splice(animals.indexOf(hit),1);nextSpawn=Math.min(nextSpawn,.35);
      const g=geometry(hit),spec=hit.specimen;
      const t={id:hit.uid,date:Date.now(),species:hit.species,reserve:reserve.key,kg:spec.kg,cm:spec.cm,medal:spec.medal,coat:spec.coat};
      let filing;changeRecords(rec=>{filing=HuntRules.file(rec,t);});
      round.trophies.push({t,...filing});if(leg)routes.event(leg,objectives,'bag',hit);
      const label=TrophyLodge.name(t);
      const groundY=t.species==='pheasant' ? height*.90 : hit.y*height;
      effects.push({reaction:TrophyReaction.capture(t.species,g.x,g.y,g.h,hit.direction,hit.phase,TrophyLodge.palette(t),width,height,groundY,TrophyReaction.terrain(reserve.key),(hit.velocity||0)*width,g.verticalVelocity),x:clamp(x/width,.17,.83),y:clamp((g.y-.55*g.h)/height,.2,.84),score:'+'+fmt(result.points),name:label,rare:hit.rare,age:0,life:TrophyReaction.life});
      const change=filing.first?'First trophy':filing.weightRecord?'New weight record':filing.lengthRecord?'New length record':'Trophy logged';
      const delta=filing.weightRecord&&filing.previous?TrophyLodge.weight(filing.previous.kg)+' → ':'';
      $('trophy-toast').innerHTML=TrophyLodge.medal(t.medal)+'<span><small>'+(filing.newGift?'Gift unlocked · '+reserve.gift:result.tagged?'Tagged trophy · +75':change)+'</small><b>'+label+'</b><small>'+delta+TrophyLodge.weight(t.kg)+' · '+TrophyLodge.length(t.cm)+'</small></span>';
      $('trophy-toast').hidden=false;toastUntil=round.elapsed+(t.coat==='legend'?4:2.35);
      note(hit.rare?784:520,.14,'triangle',.045,.075);
      if(result.bonus){note(784,.2,'triangle',.036,.16);tip('Trail bonus complete  +'+result.bonus,3);}
      else if(t.coat==='legend'){note(1047,.23,'triangle',.04,.2);tip(filing.newGift?'Legendary gift · '+reserve.gift:'Legend logged · '+reserve.legend,3);}
      else{noticeUntil=0;$('announcer').textContent=label+', '+change+', '+TrophyLodge.weight(t.kg);}
    }else{
      effects.push({x:x/width,y:y/height,miss:true,age:0,life:.55});
      for(const a of animals){if(Math.abs(a.x-x/width)<.30){a.flee=random(.8,1.8);a.rest=0;}}
      if(result.protectedStreak)tip('Moonstone protected your streak',2);else{noticeUntil=0;$('announcer').textContent='Miss';}
    }
    if(round.bullets===0){reload();}afterAction();
  }
  function updateHud(){
    if(!round)return;
    if(round.elapsed>=(round.revealUntil||0))$('legend-reveal').hidden=true;
    if(round.elapsed>=toastUntil)$('trophy-toast').hidden=true;
    const t=Math.ceil(60-round.elapsed),show=noticeUntil>round.elapsed;
    const text=show?notice:'';
    const mission=leg?routes.checklist(leg,objectives):'';
    const key=[mission,camera,t,round.score,round.streak,round.bullets,round.reload>0,round.scouts,Math.ceil(round.scan),round.contract,...reserve.goals.map(k=>round.bag[k]>0),text].join('|');
    if(lastHud===key)return;lastHud=key;
    $('score').textContent=fmt(round.score);$('time').textContent=Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
    $('time').classList.toggle('urgent',t<=10);
    $('multiplier').hidden=round.streak<2;$('factor').textContent=(1+Math.min(4,Math.max(0,round.streak-1))*.25)+'×';
    $('ammo').innerHTML=Array.from({length:round.capacity},(_,i)=>'<i class="'+(i<round.bullets?'':'empty')+'"></i>').join('');
    $('reload-label').textContent=round.reload?'Reloading…':'Reload';
    $('reload').setAttribute('aria-label',round.reload?'Reloading':'Reload, '+round.bullets+' shots left');
    $('reload').disabled=round.reload>0||round.bullets===round.capacity;
    $('scout').disabled=round.scan>0||!round.scouts;$('scout-label').textContent=round.scan>0?'Scan '+Math.ceil(round.scan)+'s':'Scout ×'+round.scouts;
    $('contract').previousElementSibling.textContent=leg?'Leg '+(trip.active.index+1)+' / 3 · '+leg.name:'Trail bonus';
    $('contract').textContent=leg?mission:round.contract?'Complete · +'+(reserve.bonus+(round.gift==='riverforest'?150:0)):reserve.goals.map(k=>(round.bag[k]?'✓ ':'')+wildlife[k].name).join(' + ');
    $('aim-hint').textContent=text;$('aim-hint').hidden=!text;
  }
  function showDialog(kind,html,label){
    ambience?.pause();modal=kind;dialog.classList.toggle('room-dialog',kind==='room');dialog.classList.toggle('lodge-dialog',kind==='lodge');$('dialog-content').innerHTML=html;dialog.scrollTop=0;dialog.setAttribute('aria-label',label);
    if(!dialog.open)dialog.showModal();if(mode==='range')playAmbience();$('close-dialog').setAttribute('aria-label',kind==='pause'?'Resume hunt':'Close');
  }
  function closeDialog(){modal='';if(dialog.open)dialog.close();if(mode==='range')playAmbience();}
  function resume(){
    if(!round||round.done)return resetHome();
    closeDialog();mode='playing';last=0;playAmbience();canvas.focus({preventScroll:true});
  }
  function pause(){
    if(mode!=='playing'&&mode!=='paused')return;
    checkpoint();if(mode==='camp')return;mode='paused';aim=null;
    if(trip){
      showDialog('pause','<p class="kicker">'+routes.byId[trip.id].name+'</p><h2>Expedition paused</h2><p>'+routes.describe(leg)+'</p><p class="lodge-note">'+Math.ceil(60-round.elapsed)+' seconds left on this leg.</p><div class="actions"><button class="primary" id="resume">Resume leg</button><button class="dark-btn" id="camp-return">Return to camp</button></div>','Expedition paused');
      $('resume').onclick=resume;$('camp-return').onclick=()=>goCamp(trip.id);return;
    }
    showDialog('pause','<p class="kicker">'+reserve.name+'</p><h2>Hunt paused</h2><p>'+Math.ceil(60-round.elapsed)+' seconds left in this hunt.</p><div class="actions"><button class="primary" id="resume">'+icon('play')+'Resume hunt</button><button class="dark-btn" id="end">Finish hunt</button></div>','Hunt paused');
    $('resume').onclick=resume;$('end').onclick=finish;
  }
  function journal(){
    if(mode==='pursuit')pursuits.pause();
    if(mode==='playing'||mode==='paused'){checkpoint();mode='paused';aim=null;}
    lodge.open();
  }
  function scout(){
    if(mode!=='playing'||!HuntRules.scout(round))return;
    note(480,.18,'sine',.025,0,850);tip('Scout active · spot species and medal tiers',2);updateHud();
  }
  function tracker(){
    let scope='This reserve';
    showDialog('track','<p class="kicker">'+reserve.name+'</p><h2>Track species</h2><p>Choose an opening encounter. Tracking also makes that animal appear more often.</p><div class="book-tools"><label>Find an animal<input type="search" id="track-search" placeholder="Elephant, lion, polar bear…" autocomplete="off"></label><label>Browse<select id="track-scope"><option>This reserve</option><option>All wildlife</option><option>Bears</option><option>Big game</option><option>Safari</option></select></label></div><div id="track-grid" class="track-grid"></div><div class="lodge-actions"><button id="free-hunt" class="dark-btn">Free hunt</button></div>','Track a species');
    function list(){
      const text=$('track-search').value.trim().toLowerCase();
      const source=scope==='This reserve'&&!text?reserve.species:Object.keys(wildlife);
      const choices=source.filter(k=>(scope!=='Bears'||wildlife[k].bearFamily)&&(scope!=='Safari'||wildlife[k].group==='Safari')&&(scope!=='Big game'||HuntRules.giantKeys.includes(k))&&
        (wildlife[k].name+' '+(HuntRules.aliases[k]||'')+' '+(wildlife[k].bearFamily||'')).toLowerCase().includes(text));
      $('track-grid').innerHTML=choices.map(k=>{
        const ground=reserve.species.includes(k)?reserve:reserves.find(r=>r.species.includes(k));
        return '<button data-target="'+k+'" aria-pressed="'+(k===target)+'">'+TrophyLodge.portrait({species:k},140,67)+'<b>'+wildlife[k].name+'</b><small>'+ground.name+'</small></button>';
      }).join('')||'<p class="empty-state">No matching animals.</p>';
      TrophyLodge.paint($('track-grid'));
    }
    $('track-search').oninput=()=>{if($('track-search').value&&scope==='This reserve'){scope='All wildlife';$('track-scope').value=scope;}list();};
    $('track-scope').onchange=e=>{scope=e.target.value;if(scope==='This reserve')$('track-search').value='';list();};list();
    function choose(k){target=k;if(k&&!reserve.species.includes(k)){reserve=reserves.find(r=>r.species.includes(k));zone='All';}closeDialog();title();$('start').focus({preventScroll:true});}
    $('track-grid').onclick=e=>{const b=e.target.closest('[data-target]');if(b)choose(b.dataset.target);};$('free-hunt').onclick=()=>choose(null);
  }
  function help(){
    showDialog('help','<p class="kicker">Field guide</p><h2>How to play</h2><ul class="instructions"><li><b>Tap or click an animal.</b> Each 60-second hunt saves a weight, length, and medal for every animal you bag. Larger animals of the same type tend to weigh more.</li><li><b>Switch to Camera</b> and tap wildlife to tag it, keep a postcard, and earn 50 points. Bag a tagged animal for 75 extra points.</li><li><b>Tap Scout</b> to reveal species and medal tiers for five seconds. You start with two scans.</li><li><b>Find the named legend.</b> Bag three different species to trigger its crossing early, or watch for it late in the hunt. It earns a permanent equippable gift. Ivory animals score 3× and legends score 4×.</li><li><b>Chain successful shots</b> for up to 2× points. Complete the trail bonus for another reward. Reload early or let it reload when empty.</li><li><b>Visit the Trophy lodge</b> to compare records, hang plaques, replay sightings, and equip gifts.</li></ul><p class="keyboard">Arrow keys aim, Space shoots, C switches camera, S scouts, R reloads, and Escape pauses.</p><div class="actions"><button id="got-it" class="primary">Got it</button></div>','How to play');$('got-it').onclick=dismiss;
  }
  function finish(){
    if(!round||mode==='results')return;
    if(trip){endLeg();return;}
    mode='results';round.done=true;aim=null;
    let oldBest;changeRecords(rec=>{oldBest=rec.bests[reserve.key];HuntRules.finish(rec,round);});
    report={newBest:round.score>oldBest,accuracy:round.shots?Math.round(round.hits/round.shots*100):0};
    note(392,.12,'triangle');note(523,.15,'triangle',.035,.12);note(660,.22,'triangle',.03,.26);
    results();
  }
  function results(){
    const rank=e=>(e.t.coat==='legend'?100:0)+HuntRules.grades.indexOf(e.t.medal)*8+(e.weightRecord?4:0)+(e.t.coat==='ivory'?2:0);
    const top=[...round.trophies].sort((a,b)=>rank(b)-rank(a)||b.t.kg-a.t.kg)[0];
    const changed=new Set(round.trophies.filter(e=>e.weightRecord||e.lengthRecord).map(e=>e.t.species)).size;
    const prize=top?'<div class="result-trophy"><div>'+TrophyLodge.portrait(top.t,210,96)+'</div><div><small>Trophy of the hunt</small><b>'+TrophyLodge.name(top.t)+'</b>'+TrophyLodge.medal(top.t.medal)+'<span>'+TrophyLodge.weight(top.t.kg)+' · '+TrophyLodge.length(top.t.cm)+'</span></div></div><div class="lodge-actions"><button class="lodge-action" id="result-room">Trophy room</button><button class="lodge-action" id="review">View plaque</button><button class="lodge-action" id="replay-result">Replay sighting</button></div>':'';
    const gift=round.trophies.find(e=>e.newGift);
    showDialog('results','<p class="kicker">'+reserve.name+'</p><h2>Hunt complete</h2><div class="total">'+fmt(round.score)+'</div><small>'+(report.newBest?'New reserve best':'Points scored')+'</small><div class="stats"><div><small>Bagged</small><b>'+round.hits+'</b></div><div><small>Accuracy</small><b>'+report.accuracy+'%</b></div><div><small>Best streak</small><b>'+round.bestStreak+'</b></div></div>'+prize+(gift?'<button class="gift-result" id="gift-result">Gift unlocked · '+reserve.gift+' · Equip gift</button>':'')+(changed?'<p class="recap">'+changed+' species with a new weight or length record.</p>':'')+(round.contract?'<p class="recap">Trail bonus earned · +'+(reserve.bonus+(round.gift==='riverforest'?150:0))+' points</p>':'')+(saveFailed?'<p>Browser storage is unavailable. Trophies are available in this session.</p>':'')+'<div class="actions"><button class="primary" id="again">'+icon('play')+'Hunt again</button><button class="dark-btn" id="return">Choose reserve</button></div>','Hunt complete');
    TrophyLodge.paint(dialog);
    if(top){$('result-room').onclick=()=>openRoom();$('review').onclick=()=>lodge.record(top.t);$('replay-result').onclick=()=>lodge.replay(top.t,results);}
    if(gift)$('gift-result').onclick=()=>lodge.open('Gifts & badges');
    $('again').onclick=prepareRound;$('return').onclick=resetHome;
  }
  function dismiss(){
    if(modal==='room'){room.back();return;}
    if(modal==='lodge'&&lodge.back())return;
    if(['trail-summary','route-end','trail-fail'].includes(modal)){goCamp(selectedRoute);return;}
    if(modal==='lodge'&&mode==='debrief'){if(tripFinal)endScreen();else if(legOutcome?.clear)campScreen();else failScreen();return;}
    if(modal==='trail-plan'){closeDialog();return;}
    if(modal==='pause'){resume();return;}if(modal==='results'){resetHome();return;}
    closeDialog();if(mode==='paused')pause();else if(mode==='results')results();
  }
  function homeNav(){if(['playing','paused'].includes(mode)){pause();return;}resetHome();}
  $('shoot-mode').onclick=()=>switchTool(false);$('photo-mode').onclick=()=>switchTool(true);
  $('brand').onclick=e=>{e.preventDefault();goRange();};$('range-nav').onclick=goRange;
  $('pursuit-nav').onclick=$('trail-pursuits').onclick=$('grounds-pursuits').onclick=goPursuits;
  $('exp-nav').onclick=e=>{e.preventDefault();if(['playing','paused'].includes(mode))pause();else goCamp(selectedRoute);};
  $('open-quick').onclick=homeNav;$('grounds-camp').onclick=()=>goCamp(selectedRoute);
  $('scout').onclick=scout;$('track-picker').onclick=tracker;$('start').onclick=()=>{leg=null;trip=null;prepareRound();};$('reload').onclick=reload;$('pause').onclick=pause;
  $('room-nav').onclick=()=>openRoom();$('journal-nav').onclick=journal;$('help').onclick=help;$('hunt-nav').onclick=homeNav;
  $('close-dialog').onclick=dismiss;
  dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss();});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dismiss();});
  function position(e){const b=canvas.getBoundingClientRect();return {x:(e.clientX-b.left)*width/b.width,y:(e.clientY-b.top)*height/b.height};}
  canvas.addEventListener('pointermove',e=>{if(mode==='playing'&&e.pointerType==='mouse')aim=position(e);});
  canvas.addEventListener('pointerleave',()=>{aim=null;});
  canvas.addEventListener('pointerdown',e=>{
    if(mode!=='playing'||e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});
    const p=position(e),touch=e.pointerType!=='mouse';aim=touch?null:p;shoot(p.x,p.y,touch?13:4);
  });
  document.addEventListener('keydown',e=>{
    if(dialog.open||mode!=='playing')return;
    if(e.key==='Escape'||e.key.toLowerCase()==='p'){e.preventDefault();pause();return;}
    if(e.key.toLowerCase()==='c'){e.preventDefault();if(!e.repeat)switchTool(!camera);return;}
    if(e.key.toLowerCase()==='s'){e.preventDefault();scout();return;}
    if(e.key.toLowerCase()==='r'){e.preventDefault();reload();return;}
    if(e.target!==canvas)return;
    if(e.code==='Space'){e.preventDefault();if(!e.repeat){aim??={x:width*.5,y:height*.72};shoot(aim.x,aim.y,6);}return;}
    const dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!dir)return;
    e.preventDefault();aim??={x:width*.5,y:height*.72};
    const step=e.shiftKey?4:15;aim.x=clamp(aim.x+dir[0]*step,0,width);aim.y=clamp(aim.y+dir[1]*step,0,height);
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();if(document.hidden&&mode==='pursuit')pursuits.pause();if(mode==='range'){if(document.hidden)openRange.pauseRush();playAmbience();}last=0;});
  window.addEventListener('pagehide',()=>{if(mode==='playing')pause();if(mode==='pursuit')pursuits.pause();});
  function resize(){
    if(mode==='range')openRange.resize();
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.imageSmoothingEnabled=false;
  }
  new ResizeObserver(resize).observe(canvas);
  function shadow(x,y,w,h){
    ctx.save();ctx.fillStyle=reserve.key==='frost'?'rgba(42,43,65,.27)':'rgba(34,36,23,.29)';ctx.beginPath();ctx.ellipse(x,y-2,w,h,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function lobbyAnimal(){
    const mobile=width<630,main=target||reserve.species[0];
    const max=mobile?Math.min(width*.44,height*.45):Math.min(width*.28,height*.53);
    const natural=TimberWildlife.bounds(main,1).width;
    const h=Math.min(max*(.6+wildlife[main].size*.4),width*(mobile?.49:.36)/natural);
    const x=width*(mobile?(main==='fox'?.73:.76):.723);
    const y=height*(reserve.key==='blue'?.94:mobile?.89:.91);
    shadow(x,y,TimberWildlife.bounds(main,h).width*.40,Math.max(2,h*.029));
    TimberWildlife.draw(ctx,main,x,y,h,-1,reduced?1:1.1+.12*Math.sin(time*.8));
    if(!mobile){
      const other=reserve.species.find(k=>k!==main),hh=Math.min(max*.38*wildlife[other].size,width*.12/TimberWildlife.bounds(other,1).width),xx=width*.91,yy=height*(other==='pheasant'?.56:.88);
      if(other!=='pheasant')shadow(xx,yy,hh*.36,2);
      TimberWildlife.draw(ctx,other,xx,yy,hh,-1,reduced?.8:time*(other==='pheasant'?3.2:.4));
    }
  }
  function atmosphere(){
    if(reduced)return;
    const snow=reserve.key==='frost'||reserve.key==='arctic';ctx.save();ctx.fillStyle=snow?'#f4eeff':'#fce7ac';
    const num=snow?29:13;
    for(let i=0;i<num;i++){
      const x=((i*93.61+time*(snow?6:2.5)+Math.sin(time*.55+i*7)*7)%(width+30))-10;
      const y=snow?((i*59.27+time*(11+i%6))%(height+15))-5:height*(.65+.24*Math.sin(i*17.1+time*.13)) + 3*Math.sin(time*.6+i);
      ctx.globalAlpha=(snow?.38:.27)+.16*Math.sin(i+time*1.4);ctx.fillRect(Math.round(x),Math.round(y),i%3===0?2:1,2);
    }ctx.restore();
  }
  function crosshair(){
    if(!aim||mode!=='playing')return;ctx.save();ctx.translate(Math.round(aim.x),Math.round(aim.y));
    for(const [color,lw] of [['#243027',3.5],['#fff4d0',1.5]]){
      ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);
      for(const [x,y] of [[0,1],[1,0],[0,-1],[-1,0]]){ctx.moveTo(x*5,y*5);ctx.lineTo(x*15,y*15);}ctx.stroke();
    }ctx.fillStyle='#f6b165';ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  function drawEffects(){
    for(const e of effects){
      const p=e.age/e.life,x=e.x*width,y=e.y*height-(reduced?0:p*28);
      ctx.save();ctx.globalAlpha=Math.min(1,(1-p)*4);ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.lineWidth=3;ctx.strokeStyle='#263121';ctx.lineJoin='round';
      if(e.miss){ctx.font='bold 14px monospace';ctx.strokeText('MISS',x,y);ctx.fillStyle='#fff5d8';ctx.fillText('MISS',x,y);}
      else{
        ctx.font='24px Timber,monospace';ctx.strokeText(e.score,x,y);ctx.fillStyle=e.rare?'#ffe887':'#fff1bd';ctx.fillText(e.score,x,y);
        ctx.font='bold 13px system-ui';ctx.strokeText(e.name,x,y+19);ctx.fillText(e.name,x,y+19);
      }ctx.restore();
    }
  }
  function render(){
    ctx.clearRect(0,0,width,height);
    if(mode==='lobby')lobbyAnimal();
    else drawFieldAnimals();
    atmosphere();if(mode!=='lobby'){drawEffects();crosshair();}
  }
  function drawFieldAnimals(){
    const layers=animals.slice();
    for(const e of effects){
      if(e.reaction)layers.push({y:e.reaction.ground,effect:e});
    }
    layers.sort((a,b)=>a.y-b.y);
    for(const a of layers){
      if(a.effect){
        const pose=a.effect.reaction;pose.age=a.effect.age;
        TrophyReaction.paint(ctx,pose,width,height,reduced);continue;
      }
      const g=geometry(a);if(a.species!=='pheasant')shadow(g.x,a.y*height,TimberWildlife.bounds(a.species,g.h).width*.35,g.h*.03);
      TimberWildlife.draw(ctx,a.species,g.x,g.y,g.h,a.direction,a.phase,TrophyLodge.palette(a.specimen),true);
      if(a.tagged){
        ctx.save();ctx.fillStyle='#abf2d3';ctx.strokeStyle='#152c26';ctx.lineWidth=3;const xx=g.x,yy=g.y-g.h-5;
        ctx.beginPath();ctx.moveTo(xx-5,yy-6);ctx.lineTo(xx+5,yy-6);ctx.lineTo(xx,yy);ctx.closePath();ctx.stroke();ctx.fill();ctx.restore();
      }
      if(mode==='playing'&&(round.scan>0||camera)&&g.x>0&&g.x<width){
        const label=(a.tagged?'✓ ':'')+(a.specimen.coat==='legend'?reserve.legend:wildlife[a.species].name)+(round.scan>0?' · '+a.specimen.medal:'');
        ctx.save();ctx.font='bold 12px system-ui';const w=ctx.measureText(label).width+14;
        const x=clamp(g.x,w/2+3,width-w/2-3),y=Math.max(58,g.y-g.h-14);
        ctx.fillStyle='#16251feb';ctx.fillRect(x-w/2,y-11,w,20);ctx.textAlign='center';ctx.fillStyle=a.rare?'#ffe098':'#fff3d8';ctx.fillText(label,x,y+3);ctx.restore();
      }
      if(a.rare){
        ctx.save();ctx.fillStyle='#fff3ad';
        for(let i=0;i<3;i++){const xx=g.x+Math.sin(a.phase*.13+i*2.2)*g.h*.6,yy=g.y-g.h*(.3+i*.26);ctx.fillRect(xx-3,yy,7,1);ctx.fillRect(xx,yy-3,1,7);}ctx.restore();
      }
    }
  }
  function frame(stamp){
    const dt=last?Math.min(.20,(stamp-last)/1000):0;last=stamp;
    if(mode==='pursuit'&&!dialog.open)pursuits.tick(dt);if(mode==='range'&&!dialog.open&&!document.hidden)openRange.tick(dt);
    if(mode==='playing'||mode==='lobby'){time+=dt;if(mode==='playing')advance(dt);render();}
    requestAnimationFrame(frame);
  }
  setupTrails();goRange();soundButton();resize();requestAnimationFrame(frame);
  function openLinkedRoom(){if(window.location?.hash==='#trophy-room'&&modal!=='room')openRoom();}
  window.addEventListener('hashchange',openLinkedRoom);openLinkedRoom();
})();
