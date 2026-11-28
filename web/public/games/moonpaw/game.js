'use strict';
const $ = id => document.getElementById(id);
const screenEl=$('screen'), field=$('field'), ctx=field.getContext('2d'), cat=$('familiar');
const animateCat=createFamiliar(cat,$('catImage'),$('catCanvas'));

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stages=[
  {name:'Charms Hall',art:'hall',speed:1,goal:'Hit gold stars with Star Bolt',target:3},
  {name:'Potions Lab',art:'alchemy',speed:1.08,goal:'Freeze practice potions with Frost Wave',target:2},
  {name:'Astronomy Tower',art:'observatory',speed:1.14,goal:'Blink through the star hoops',target:2}
];
for(const lesson of stages){
  lesson.image=new Image();
  lesson.image.src='assets/'+lesson.art+'.webp';
}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const six=n=>Math.round(n).toString().padStart(6,'0');
function read(key,fallback){try{return localStorage.getItem('moonpaw.v1.'+key)??fallback}catch{return fallback}}
function save(key,val){try{localStorage.setItem('moonpaw.v1.'+key,val)}catch{}}
let difficulty=read('difficulty','easy')==='hard'?'hard':'easy';
// Scores saved before Easy existed came from the original asteroid game.
function bestKey(){return difficulty==='hard'?'best':'best.easy'}
let best=Number(read(bestKey(),'0'))||0, sound=read('sound','off')==='on', audio;
function saveRecord(){
  if(score<=best)return false;
  best=score;save(bestKey(),best);return true;
}
function syncDifficulty(){
  for(const choice of ['easy','hard'])$('difficulty-'+choice).checked=choice===difficulty;
}
for(const choice of ['easy','hard']){
  $('difficulty-'+choice).onchange=()=>{
    if(mode!=='title'||!$('difficulty-'+choice).checked)return;
    difficulty=choice;save('difficulty',choice);
    best=Number(read(bestKey(),'0'))||0;
    syncDifficulty();hud();
  };
}
syncDifficulty();
function tone(freq,end,duration,type='sine',volume=.055,delay=0){
  if(!sound||!audio||audio.state!=='running')return;
  const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+delay;
  osc.type=type;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
  gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+duration+.025);
}
function unlock(){if(!sound)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio??=new Audio();audio.resume().catch(()=>{})}}catch{}}
function tune(notes){notes.forEach((n,i)=>tone(n,n*1.01,.18,'triangle',.08,i*.075))}
function soundUI(){$('soundIcon').setAttribute('href',sound?'#i-sound':'#i-mute');$('soundLabel').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));$('sound').setAttribute('aria-label',sound?'Turn sound off':'Turn sound on')}
$('sound').onclick=()=>{sound=!sound;save('sound',sound?'on':'off');soundUI();unlock();if(sound)setTimeout(()=>tune([660,880]),60)};
soundUI();
const keys=new Set();
let W=1,H=1,dpr=1,mode='title',clock=0,previous=0,stage=0,elapsed=0,score=0,lives=3,charge=0;
let invulnerable=0,castFlash=0,cooldown=0,burstTime=0,trailClock=0,noticeTime=0,shake=0,enemyClock=0,gemClock=0,wave=0,scroll=0;
let entities=[],shots=[],particles=[],rings=[],labels=[],gate=null,drag=null,castPointer=null;
let mastery=0,practiceTimer=0,frostCooldown=0,blinkCooldown=0;
const coarse=matchMedia('(pointer: coarse)').matches;
if(coarse)$('boltKey').textContent='HOLD';
const player={x:0,y:0,vx:0,vy:0,w:80,tilt:0};
const starfield=Array.from({length:58},(_,i)=>({x:((i*1831+351)%1009)/1009,y:((i*1069+71)%853)/853,a:(i*3)%7,n:i%7===0?2:1}));
function resize(){
  const r=screenEl.getBoundingClientRect(),oldW=W,oldH=H;W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(2,window.devicePixelRatio||1);
  field.width=Math.round(W*dpr);field.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  if(oldW>2&&oldH>2&&mode!=='title'){
    for(const obj of [player,...entities,...shots,...particles,...rings,...labels,...(gate?[gate]:[])]){obj.x*=W/oldW;obj.y*=H/oldH;if('base'in obj)obj.base*=H/oldH;}
    if(flight&&flight.beam){
      flight.beam.x0*=W/oldW;flight.beam.x1*=W/oldW;
      flight.beam.y0*=H/oldH;flight.beam.y1*=H/oldH;
    }
    if(drag){drag=null;}
  }
  player.w=clamp(Math.min(W*.17,H*.26),63,127);if(mode!=='title')placePlayer();
}
new ResizeObserver(resize).observe(screenEl);resize();
function hud(){
  const showPlanets=!!flight||mode==='title';
  $('meterName').textContent=showPlanets?'PLANETS':'MOONSHARDS';
  $('meterSymbol').setAttribute('href',showPlanets?'#i-orbit':'#i-gem');
  $('meterGroup').title=showPlanets?'Planets destroyed':'Collect five moonshards to cast Starburst';
  $('score').textContent=six(score);$('shards').textContent=showPlanets?(flight?.destroyed||0)+' / '+(worlds.length-(flight?.first||0)):charge+' / 5';$('best').textContent=six(best);
  $('bestLabel').textContent=difficulty==='easy'?'EASY BEST':'HARD BEST';
  $('hearts').hidden=$('lifeLabel').hidden=difficulty==='easy';
  $('hearts').innerHTML=Array.from({length:3},(_,i)=>'<svg aria-hidden="true" class="'+(i<lives?'':'spent')+'"><use href="#i-heart"/></svg>').join('');
  $('hearts').setAttribute('aria-label',lives+' lives');$('stageNum').textContent='0'+(stage+1)+' / 03';$('district').textContent=flight?'DEEP SPACE':stages[stage].name.toUpperCase();
  if(flight)$('stageNum').textContent=String(flight.index+1).padStart(2,'0')+' / '+String(worlds.length).padStart(2,'0');
  if(mode==='title'){$('district').textContent='ASTRONOMY TOWER';$('stageNum').textContent='LAUNCH PAD'}
}
function clearInput(){keys.clear();drag=null;castPointer=null}
function setMode(next){
  mode=next;screenEl.dataset.mode=mode;screenEl.dataset.zone=flight?'space':'school';
  const castName=flight?planetSpells[selectedSpell].name:'Star Bolt';
  $('boltName').textContent=castName;$('cast').setAttribute('aria-label','Cast '+castName);
  $('cast').title=castName+(flight?' · Hold to charge · Space':' · Hold to fire · Space');
  $('boltKey').textContent=coarse?'HOLD':flight?'HOLD SPACE':'SPACE';
  $('missionLabel').textContent=difficulty.toUpperCase()+(flight?' ORBIT':' LESSON');
  showSupernova();
  $('arsenal').hidden=mode!=='title'&&!(flight&&mode==='play');
  if(!flight){$('weakness').hidden=true;$('cast').style.color='';$('castSymbol').setAttribute('href','#i-spark')}
  else chooseSpell(selectedSpell,false);
  $('graduationLaunch').hidden=!!flight||mode!=='won';const title=mode==='title',play=mode==='play';
  $('intro').hidden=!title;$('dialog').hidden=play||title;$('pause').hidden=!play;$('track').hidden=title;$('spellDeck').hidden=!play;$('idleControls').hidden=play;$('lesson').hidden=!play;
  if(!play){if(flight)flight.charge=0;clearInput();$('notice').textContent='';noticeTime=0}
}
function home(){
  resetActor();
  if(flight)worlds[flight.index].releaseSkin();
  flight=null;setMode('title');stage=score=charge=0;lives=3;cat.style.cssText='';$('result').textContent='';hud();$('launch').focus({preventScroll:true});
}
function level(first){
  resetActor();
  mastery=0;practiceTimer=2.5;frostCooldown=blinkCooldown=0;scroll=0;
  elapsed=0;enemyClock=3.2;gemClock=.85;wave=0;entities=[];shots=[];particles=[];rings=[];labels=[];gate=null;
  cooldown=castFlash=burstTime=shake=trailClock=0;invulnerable=first?1.3:2.2;
  player.x=W*.23;player.y=H*.49;player.vx=player.vy=player.tilt=0;
  clearInput();setMode('play');spawnPractice(true);placePlayer();hud();lessonUI();spellUI();
  showNotice(stages[stage].name.toUpperCase(),1.6);
}
function start(){unlock();flight=null;stage=0;score=0;lives=3;charge=0;scroll=0;clearInput();level(true);tune([392,494,587,784]);$('start').blur()}
function showNotice(message,duration){$('notice').textContent=message;noticeTime=duration}
function modal(state,title,copy,action){
  setMode(state);$('modalSymbol').setAttribute('href',state==='won'?'#i-crest':'#i-spark');$('dialogTitle').textContent=title;$('dialogCopy').textContent=copy;$('continueLabel').textContent=action;$('continue').focus({preventScroll:true});
}
function pause(){if(mode==='play')modal('paused','PAUSED','Your flight will resume right here.','RESUME');else if(mode==='paused'){setMode('play');previous=performance.now();$('continue').blur()}}
function finish(won){
  if(flight){endOrbit(won);return}
  const record=saveRecord();
  hud();const text=(record?'New personal best! ':'')+score.toLocaleString()+' points · '+(won?'All 3 classes passed. You earned the Wizard Crest!':'Class '+(stage+1)+' of 3.');
  modal(won?'won':'lost',won?'GRADUATED!':'CLASS ENDED',text,'PLAY AGAIN');$('result').textContent=text;
  tune(won?[523,659,784,1047]:[392,330,247]);
}
$('start').onclick=start;$('pause').onclick=pause;$('continue').onclick=()=>{if(mode==='paused')pause();else if(flight)launchOrbit(false);else start()};$('back').onclick=home;
$('destination').innerHTML=worlds.map((world,i)=>'<option value="'+i+'">'+world.name+'</option>').join('');
$('launch').onclick=()=>launchOrbit(false);
$('graduationLaunch').onclick=()=>launchOrbit(true);
const wide=$('wide'),shell=$('shell');
function wideUI(){const on=!!document.fullscreenElement||shell.classList.contains('expanded');wide.setAttribute('aria-label',on?'Exit fullscreen':'Enter fullscreen');wide.setAttribute('aria-pressed',String(on))}
wide.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(shell.classList.contains('expanded'))shell.classList.remove('expanded');else if(shell.requestFullscreen)await shell.requestFullscreen();else shell.classList.add('expanded')}catch{shell.classList.toggle('expanded')}wideUI()};
document.addEventListener('fullscreenchange',wideUI);
window.addEventListener('blur',()=>{if(mode==='play')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause()});
$('supernova').onclick=unleashSupernova;
for(const id of spellOrder)$('pick-'+id).onclick=()=>chooseSpell(id);
const playKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD','Space','KeyF','KeyB','KeyP','Escape'];
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&shell.classList.contains('expanded')){shell.classList.remove('expanded');wideUI()}
  if((mode==='title'||(flight&&mode==='play'))&&/^Digit[1-6]$/.test(e.code)){
    e.preventDefault();if(!e.repeat)chooseSpell(spellOrder[Number(e.code.slice(-1))-1]);return;
  }
  if(e.code==='KeyR'&&flight&&mode==='play'){e.preventDefault();if(!e.repeat)unleashSupernova();return}
  if(!playKeys.includes(e.code)||!['play','paused'].includes(mode))return;
  if(mode==='paused'&&!['KeyP','Escape'].includes(e.code))return;
  e.preventDefault();if(['KeyP','Escape'].includes(e.code)){if(!e.repeat)pause();return}
  if(e.code==='KeyF'||e.code==='KeyB'){
    if(!e.repeat){if(e.code==='KeyF')frostWave();else blink()}
    return;
  }
  keys.add(e.code);
});
window.addEventListener('keyup',e=>{
  if(e.code==='Space'&&keys.has('Space')&&flight&&mode==='play')releaseNova();
  keys.delete(e.code);
});
function localPoint(e){const r=screenEl.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
screenEl.addEventListener('pointerdown',e=>{
  if(mode!=='play'||drag||e.target.closest('button'))return;
  e.preventDefault();const p=localPoint(e);
  if(flight&&flight.phase==='fight'&&pointOnWorld(p.x,p.y)){shootNova(1,p);return}
  drag={id:e.pointerId,last:p,x:player.x,y:player.y};
  screenEl.setPointerCapture(e.pointerId);if(!flight)fire();
});
screenEl.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const p=localPoint(e);
  const gain=e.pointerType==='touch'?1.5:1.14;drag.x=clamp(drag.x+(p.x-drag.last.x)*gain,player.w*.35,W-player.w*.43);
  drag.y=clamp(drag.y+(p.y-drag.last.y)*gain,player.w*.36,H-player.w*.37);drag.last=p;
});
function lift(e){if(drag?.id===e.pointerId)drag=null;if(castPointer===e.pointerId){castPointer=null;if(flight&&mode==='play'){if(e.type==='pointerup')releaseNova();else flight.charge=0}}}
for(const evt of ['pointerup','pointercancel','lostpointercapture']){screenEl.addEventListener(evt,lift);$('cast').addEventListener(evt,lift)}
$('cast').addEventListener('pointerdown',e=>{if(mode!=='play')return;e.preventDefault();castPointer=e.pointerId;$('cast').setPointerCapture(e.pointerId);if(!flight)fire()});
$('cast').addEventListener('click',e=>{if(e.detail===0){if(flight)shootNova(1);else fire()}});
$('frost').onclick=frostWave;
$('blink').onclick=blink;
function lessonUI(){
  const current=stages[stage];
  $('lessonText').textContent=mastery>=current.target?'Fly into the school gate':current.goal;
  $('lessonCount').textContent=mastery+' / '+current.target;
  $('progress').style.width=(100*mastery/current.target)+'%';
}
function learn(){
  if(mastery>=stages[stage].target)return;
  mastery++;lessonUI();
  if(mastery===stages[stage].target){showNotice('LESSON PASSED!',1.35);tune([523,659,784])}
}
function spellUI(){
  for(const [id,key,timer] of [['frost','F',frostCooldown],['blink','B',blinkCooldown]]){
    const wait=Math.ceil(timer),button=$(id),label=$(id+'State');
    const message=wait?wait+'s':coarse?'READY':key+' · READY';
    if(label.textContent!==message)label.textContent=message;
    button.disabled=wait>0;
  }
}
function isHazard(e){return ['bat','lantern','wraith','potion','meteor'].includes(e.kind)}
function frostWave(){
  if(mode!=='play'||frostCooldown>0)return;
  frostCooldown=5;castFlash=1;if(!actorPending())beginGesture('frost',1,null);
  if(flight)flight.frostHalo={x:player.x/W,y:player.y/H,age:0};
  showNotice('FROST WAVE',.8);
  ring(player.x,player.y,'#b4f6ff',Math.hypot(W,H));spark(player.x,player.y,'#d7fbff',26,145);
  for(const e of entities){
    if(e.dead||!isHazard(e)||e.x>W+e.r*.3)continue;
    e.ice=2.8;spark(e.x,e.y,'#b7efff',9,75);
    if(e.kind==='potion'&&!e.studied){
      e.studied=true;addScore(140,e.x,e.y-e.r);if(stage===1)learn();
    }
  }
  tune([988,784,659]);spellUI();
}
function blink(){
  if(mode!=='play'||blinkCooldown>0)return;
  const startX=player.x,startY=player.y;
  let hoop=null,bestDistance=Infinity;
  for(const e of entities){
    if(e.kind!=='hoop'||e.dead||e.x>W-e.r*.45)continue;
    const dx=(e.x-startX)/W,dy=(e.y-startY)/H,d=Math.hypot(dx,dy);
    if(d<bestDistance&&Math.abs(dx)<.52&&Math.abs(dy)<.37){hoop=e;bestDistance=d}
  }
  const left=keys.has('ArrowLeft')||keys.has('KeyA'),up=keys.has('ArrowUp')||keys.has('KeyW'),down=keys.has('ArrowDown')||keys.has('KeyS');
  const vertical=Number(down)-Number(up);
  const direction=left?-1:1;
  const dx=vertical&&!left&&!keys.has('ArrowRight')&&!keys.has('KeyD')?0:direction;
  const destX=hoop?hoop.x+(hoop.x>=startX?1:-1)*hoop.r*.85:startX+dx*W*.24;
  const destY=hoop?hoop.y:startY+vertical*H*.24;
  player.x=clamp(destX,player.w*.35,W-player.w*.43);
  player.y=clamp(destY,player.w*.36,H-player.w*.37);
  player.vx=player.vy=0;
  if(drag){drag.x=player.x;drag.y=player.y}
  if(!actorPending())beginGesture('blink',1,null);
  blinkCooldown=3.2;invulnerable=Math.max(invulnerable,.95);castFlash=1;
  if(flight)flight.blinkEcho={x:startX/W,y:startY/H,dx:(player.x-startX)/W,dy:(player.y-startY)/H,age:0};
  for(let i=0;i<=6;i++){const f=i/6;spark(startX+(player.x-startX)*f,startY+(player.y-startY)*f,'#ddb7ff',4,47)}
  ring(startX,startY,'#c598ff',player.w*.42);ring(player.x,player.y,'#f1caff',player.w*.52);
  showNotice('BLINK!',.7);
  if(hoop){hoop.dead=true;spark(hoop.x,hoop.y,'#ffe19b',15,95);addScore(160,hoop.x,hoop.y-hoop.r);if(stage===2)learn()}
  tune([392,784,1175]);spellUI();placePlayer();
}
function spawnPractice(first=false){
  const kind=['rune','potion','hoop'][stage];
  const x=first?W*.66:W+24;
  const y=first?player.y-player.w*.13:clamp(player.y-player.w*.14+Math.sin(elapsed*.81)*H*.11,H*.16,H*.81);
  const e=makeEntity(kind,x,y,0);
  e.r=clamp(Math.min(W,H)*(kind==='hoop'?.079:.047),kind==='hoop'?26:16,kind==='hoop'?48:30);
  entities.push(e);
}
function placePlayer(){
  const w=playerArtWidth();
  cat.style.left=player.x+'px';cat.style.top=player.y+'px';cat.style.width=w+'px';cat.style.height=(w*502/768)+'px';cat.style.maxWidth='none';
  const scale=1+castFlash*.025;cat.style.transform='translate(-50%,-50%) rotate('+player.tilt+'deg) scale('+scale+','+(2-scale)+')';
  if(flight){
    const bank=clamp(player.vx/40,-10,10),depth=1+.07*(player.y/H-.5);
    cat.style.transform='translate(-50%,-50%) perspective(600px) rotateY('+bank+'deg) rotateZ('+player.tilt+'deg) scale('+(scale*depth)+')';
  }
  cat.style.opacity=invulnerable>.15&&Math.floor(invulnerable*9)%2&&mode==='play'?'.62':'1';
}
function fire(){
  if(mode!=='play'||cooldown>0||actorPending())return;
  beginGesture('nova',1,()=>{
    if(mode==='play'&&!flight)releaseStarBolt();
  });
}
function releaseStarBolt(){
  cooldown=burstTime>0?.055:.13;castFlash=1;
  const {x,y}=castingPaw();
  for(const dy of (burstTime>0?[-.19,0,.19]:[0]))shots.push({x,y,vx:Math.max(330,W*.82),vy:dy*H,dead:false});
  tone(620,285,.105,'triangle',.045);spark(x,y,'#b9fff0',3,35);
}
function spark(x,y,color,count,power){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,r=(.2+Math.random()*.8)*power;
  particles.push({x,y,vx:Math.cos(a)*r,vy:Math.sin(a)*r,life:.2+Math.random()*.5,cap:.7,color,size:1+Math.random()*3})}}
function ring(x,y,color,max){rings.push({x,y,color,max,age:0})}
function addScore(n,x,y){score+=n;$('score').textContent=six(score);if(x!==undefined)labels.push({x,y,val:'+'+n,life:.72})}
function smash(e){if(e.dead)return;e.dead=true;spark(e.x,e.y,e.kind==='lantern'?'#ffd878':'#ce9fff',14,95);ring(e.x,e.y,'#d7a7ff',e.r*1.8);addScore(e.kind==='wraith'?100:60,e.x,e.y-e.r);tone(230,70,.15,'sawtooth',.026)}
function collect(e){
  e.dead=true;addScore(100,e.x,e.y-e.r);spark(e.x,e.y,'#e3bbff',11,70);charge++;tune([554+charge*38,830+charge*40]);
  if(charge>=5){charge=0;burstTime=3.6;invulnerable=Math.max(invulnerable,3.6);ring(player.x,player.y,'#b2fff0',Math.max(W,H)*.9);
    for(const other of entities)if(isHazard(other)&&other.kind!=='potion'&&other.x<W+other.r)smash(other);
    showNotice('STARBURST!',1.35);tune([523,659,784,1047])}
  hud();
}
function hit(e){
  e.dead=true;if(difficulty==='easy'||invulnerable>0)return;lives--;invulnerable=1.7;shake=reduceMotion?0:.36;charge=Math.max(0,charge-1);spark(player.x,player.y,'#ff93b6',17,110);tone(180,55,.28,'sawtooth',.047);hud();if(!lives)finish(false);
}
function makeEntity(kind,x,y,phase=0){
  const unit=clamp(Math.min(W,H)*.052,14,29);
  return{kind,x,y,base:y,phase,age:0,ice:0,studied:false,r:kind==='gem'?unit*.62:kind==='wraith'?unit*1.14:unit,dead:false};
}
function spawnGems(){const n=3,margin=Math.max(39,player.w*.46),center=clamp(H*(.46+.28*Math.sin(wave*2.17)),margin+12,H-margin-12);
  for(let i=0;i<n;i++){const y=center+Math.sin(i*1.45+wave)*H*.065;entities.push(makeEntity('gem',W+25+i*clamp(W*.061,25,72),clamp(y,margin,H-margin),i*.6+wave))}
  wave++;
}
function spawnEnemy(){
  const n=Math.floor(elapsed*.5)+wave,kind=stage===2&&n%3===1?'wraith':stage>=1&&n%3===0?'lantern':'bat';
  const y=clamp(Math.random()*H*.72+H*.12,36,H-45);
  entities.push(makeEntity(kind,W+35,y,n*.73));
  if(stage===2&&n%4===0)entities.push(makeEntity('bat',W+70,clamp(y+H*.27,40,H-40),n));
}
function update(dt){
  const levelData=stages[stage];elapsed+=dt;const speed=clamp(W*.19,91,212)*(flight?1.7:levelData.speed);scroll+=speed*dt;
  invulnerable=Math.max(0,invulnerable-dt);cooldown=Math.max(0,cooldown-dt);burstTime=Math.max(0,burstTime-dt);shake=Math.max(0,shake-dt);castFlash=Math.max(0,castFlash-dt*4.7);
  frostCooldown=Math.max(0,frostCooldown-dt);blinkCooldown=Math.max(0,blinkCooldown-dt);spellUI();
  if(noticeTime>0&&(noticeTime-=dt)<=0)$('notice').textContent='';
  const px=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
  const py=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));
  const norm=Math.hypot(px,py)||1;
  const wantX=drag?clamp((drag.x-player.x)*13,-W*3,W*3):px/norm*Math.max(260,W*.58);
  const wantY=drag?clamp((drag.y-player.y)*13,-H*3,H*3):py/norm*Math.max(220,H*.87);
  const smooth=1-Math.exp(-dt*(drag?24:14));
  player.vx+=(wantX-player.vx)*smooth;player.vy+=(wantY-player.vy)*smooth;
  player.x=clamp(player.x+player.vx*dt,player.w*.35,W-player.w*.43);player.y=clamp(player.y+player.vy*dt,player.w*.36,H-player.w*.37);
  player.tilt+=(clamp(player.vy*.021,-11,11)-player.tilt)*smooth;
  advanceActor(dt,flight?.charge||0,clamp(player.vy/200,-1,1),reduceMotion);
  if(flight){
    updateOrbit(dt);
    if(mode==='play'){updateEffects(dt);placePlayer()}
    return;
  }
  if(keys.has('Space')||drag||castPointer!==null)fire();
  trailClock-=dt;if(trailClock<=0){trailClock=.05;spark(player.x-player.w*.28,player.y+player.w*.19,burstTime?'#ffea9d':'#a4f2ed',1,18);particles[particles.length-1].vx-=speed*.4}
  const goalOpen=mastery>=levelData.target;
  if(!goalOpen){
    gemClock-=dt;practiceTimer-=dt;
    if(practiceTimer<=0){spawnPractice();practiceTimer=stage===2?2.8:2.3}
    if(gemClock<=0){spawnGems();gemClock=3.6}
    if(difficulty==='hard'){
      enemyClock-=dt;
      if(enemyClock<=0){spawnEnemy();enemyClock=(1.9+Math.random()*.72)/(1+.13*stage)}
    }
  }else if(!gate){
    gate={x:W+55,y:H*.46,r:clamp(Math.min(W,H)*.14,39,70),age:0};
    if(noticeTime<=0)showNotice('FLY INTO THE GATE',2);
  }
  const cx=player.x+player.w*.07,cy=player.y-player.w*.035,pr=player.w*.205;
  for(const e of entities){
    if(e.dead)continue;
    if(e.ice>0){e.ice=Math.max(0,e.ice-dt)}
    else{
      e.age+=dt;
      e.x-=speed*dt*(e.kind==='wraith'?1.17:e.kind==='hoop'||e.kind==='potion'?.72:e.kind==='lantern'?.82:1);
      const amplitude=e.kind==='gem'||e.kind==='rune'?4:e.kind==='bat'?H*.042:e.kind==='wraith'?H*.098:H*.024;
      e.y=clamp(e.base+Math.sin(e.age*(e.kind==='bat'?3.3:2)+e.phase)*amplitude,e.r,H-e.r);
    }
    const reach=e.kind==='gem'?pr+e.r+9:pr+e.r*.69;
    if(Math.hypot(e.x-cx,e.y-cy)<reach){
      if(e.kind==='gem')collect(e);
      else if(isHazard(e)&&!e.ice&&e.kind!=='potion')hit(e);
      if(mode!=='play')return;
    }
  }
  for(const s of shots){
    const from=s.x;s.x+=s.vx*dt;s.y+=s.vy*dt;
    for(const e of entities){if(e.dead||e.kind==='gem'||e.kind==='hoop'||(e.kind==='potion'&&!e.studied)||e.x<from-e.r||e.x>s.x+e.r)continue;
      if(Math.abs(e.y-s.y)<e.r*.92+4){
        if(e.kind==='rune'){
          e.dead=true;spark(e.x,e.y,'#ffe394',15,95);ring(e.x,e.y,'#ffd888',e.r*2);
          addScore(120,e.x,e.y-e.r);if(stage===0)learn();tone(920,1100,.1);
        }else smash(e);
        s.dead=true;break;
      }}
  }
  entities=entities.filter(e=>!e.dead&&e.x> -55);shots=shots.filter(s=>!s.dead&&s.x<W+30&&s.y>-10&&s.y<H+10);
  if(gate){
    gate.age+=dt;gate.x=Math.max(W*.62,gate.x-speed*dt*.8);
    if(gate.age>7&&noticeTime<=0)showNotice('FLY INTO THE GATE',2.8);
    if(Math.hypot(cx-gate.x,cy-gate.y)<gate.r*.76+pr){
      addScore(500);if(stage===stages.length-1){finish(true);return}stage++;lives=Math.min(3,lives+1);level(false);tune([440,554,659,880]);return;
    }
  }
  updateEffects(dt);placePlayer();
}
function updateEffects(dt){
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=26*dt;p.life-=dt}
  particles=particles.filter(p=>p.life>0);
  for(const r of rings)r.age+=dt;rings=rings.filter(r=>r.age<.48);
  for(const l of labels){l.y-=dt*28;l.life-=dt}labels=labels.filter(l=>l.life>0);
}
const palettes={
  bat:{x:'#281a44',a:'#755095',b:'#b084d1',c:'#533a79',d:'#f59bb8',e:'#ffdf96',f:'#eee4ff'},
  lantern:{x:'#312034',a:'#ae6f4c',b:'#ffe497',c:'#eaa756',d:'#806797',e:'#f9c674',f:'#fff2c0'},
  wraith:{x:'#312653',a:'#6978c4',b:'#9abdf1',c:'#4c548d',d:'#ece0ff',e:'#f5a0db',f:'#eff7ff'}
};
const batBody=['.x.....x.','.bx...xb.','.baxxxab.','..xxxxxx.','.xaaaaaxx','xabbaabax','xaeaaaeax','.xaaddax.','..xcfcx..','...xxx...'];
const wingFrames=[
 ['xx.......','xax......','xbax.....','.xbax....','..xbax...','...xbaaax','....xcabb','.....xxca','.......xx'],
 ['.........','.........','.........','..xxxx...','xxbbbax..','xaaaaabax','.xcxccaba','..x..xxcc','.......xx'],
 ['.........','.........','.........','.........','.....xxxx','....xbaab','...xbaacc','..xbacxx.','.xaccx...','.xccx....','..xx.....']
];
const lanternGrid=['.....xx.....','....xddx....','....xddx....','..xxxxxxx...','.xaaacccax..','..xxxxxxx...','..xcbcbcx...','..xbfbfbx...','.xcffbffcx..','.xcbbebbcx..','..xcececx...','..xxxxxxx...','...xcccxx...','....xxx.....','.....cx.....','.....ex.....'];
const wraithGrid=['......xxx......','....xxbbbxx....','...xbbbbabbx...','..xbbbaaaabax..','.xbbbaaaaaaax..','.xbaaaxxaxaax..','.xbaaexaexacx..','.xbaaaadaacax..','..xbaaacaacax..','..xbaaacccacax.','.xaaaaccxcccax.','.xaaxccx.xxax..','..xx.xx....x...'];
function makeSprites(){
  function bitmap(width,height,draw){const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');draw((grid,x,y,colors,flip=false)=>{
    grid.forEach((row,i)=>Array.from(row).forEach((v,j)=>{if(colors[v]){g.fillStyle=colors[v];g.fillRect(flip?x-j:x+j,y+i,1,1)}}));
  });return c}
  return{bat:wingFrames.map(wing=>bitmap(25,18,plot=>{plot(wing,0,2,palettes.bat);plot(wing,24,2,palettes.bat,true);plot(batBody,8,4,palettes.bat)})),
    lantern:bitmap(12,16,plot=>plot(lanternGrid,0,0,palettes.lantern)),wraith:bitmap(15,13,plot=>plot(wraithGrid,0,0,palettes.wraith))};
}
const sprites=makeSprites();
function star(x,y,r,color,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;const u=r/4;
  ctx.fillRect(x-u*.5,y-r,u,r*2);ctx.fillRect(x-r,y-u*.5,r*2,u);ctx.fillRect(x-u*1.25,y-u*1.25,u*2.5,u*2.5);ctx.restore();
}
function skies(){
  const sceneImage=stages[stage].image;
  if(!sceneImage.naturalWidth)return;
  const fit=Math.max(W/sceneImage.width,H/sceneImage.height),bw=Math.ceil(sceneImage.width*fit),bh=Math.ceil(sceneImage.height*fit);
  const offset=scroll*.115+Math.max(0,(bw-W)*.53);const first=Math.floor(offset/bw);
  for(let i=first;i<=first+1;i++){const left=Math.round(i*bw-offset);
    ctx.save();if(i%2){ctx.translate(left+bw,0);ctx.scale(-1,1)}else ctx.translate(left,0);
    ctx.drawImage(sceneImage,0,Math.round((H-bh)*.32),bw+1,bh);ctx.restore()}
  ctx.fillStyle='rgba(18,13,33,.19)';ctx.fillRect(0,0,W,H);
  const shadow=ctx.createLinearGradient(0,H*.80,0,H);shadow.addColorStop(0,'transparent');shadow.addColorStop(1,'#130f2b7a');ctx.fillStyle=shadow;ctx.fillRect(0,H*.8,W,H*.2);
}
function menuMagic(){
  const tall=W/H<.95;const centerX=tall?W*.51:W*.73,centerY=tall?H*.265:H*.49;
  const radiusX=tall?W*.37:Math.min(W*.23,H*.53),radiusY=tall?H*.17:H*.32;
  const t=reduceMotion?0:clock;
  for(let i=0;i<29;i++){
    const a=i*2.39996,rr=.88+((i*17)%13)*.017;
    const x=centerX+Math.cos(a)*radiusX*rr,y=centerY+Math.sin(a)*radiusY*rr+Math.sin(t*.45+i)*2;
    const glow=.58+.32*Math.sin(t*1.8+i);
    if(i%3===0)star(x,y,i%2?4:7,i%4?'#ebd5ff':'#fff0ba',glow);
    else {ctx.globalAlpha=glow;ctx.fillStyle=i%3?'#d5bbff':'#ffe5ac';ctx.fillRect(x,y,i%4?2:3,i%4?2:3);ctx.globalAlpha=1}
  }
  const sx=centerX-radiusX*.47,sy=centerY+radiusY*.96;
  for(let i=0;i<35;i++){
    const f=(i/35+(reduceMotion?0:clock*.06))%1;
    const x=sx-radiusX*1.12*f,y=sy+Math.sin(f*5)*radiusY*.14+f*f*radiusY*.15+Math.sin(i*3)*5;
    if(tall&&x<W*.05)continue;
    star(x,y,1+(1-f)*2.2,i%2?'#c6a7fa':'#9aeeef',.65*(1-f));
  }
}
function drawGem(e){
  const r=e.r,w=r*(.72+.11*Math.sin(clock*4+e.phase)),x=e.x,y=e.y;
  ctx.save();ctx.translate(x,y);ctx.shadowColor='#bfa1ff';ctx.shadowBlur=9;ctx.fillStyle='#6551a0';
  ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(w,0);ctx.lineTo(0,r);ctx.lineTo(-w,0);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#c9a3ff';ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(w,0);ctx.lineTo(-w,0);ctx.fill();
  ctx.fillStyle='#efe8ff';ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(-w*.18,-1);ctx.lineTo(-w,0);ctx.fill();
  ctx.fillStyle='#956ce0';ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w*.15,1);ctx.lineTo(0,r);ctx.fill();ctx.restore();
  if(Math.sin(clock*4+e.phase)>.83)star(x-w*.65,y-r*.35,3,'#fff5ff');
}
function drawEnemy(e){
  const r=e.r;let sprite;
  if(e.kind==='bat'){
    sprite=sprites.bat[[0,1,2,1][Math.floor(e.age*11+e.phase)%4]];ctx.drawImage(sprite,e.x-r*1.45,e.y-r*1.04,r*2.9,r*2.08);
  }else if(e.kind==='lantern'){
    sprite=sprites.lantern;ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.sin(clock*2+e.phase)*.12);ctx.shadowColor='#f7b967';ctx.shadowBlur=11;
    ctx.drawImage(sprite,-r*.75,-r,r*1.5,r*2);ctx.restore();
  }else{
    sprite=sprites.wraith;ctx.save();ctx.globalAlpha=.34;ctx.drawImage(sprite,e.x-r*.7,e.y-r*.83,r*2,r*1.68);ctx.globalAlpha=1;
    ctx.drawImage(sprite,e.x-r,e.y-r,r*2,r*1.85);ctx.restore();
  }
}
function drawPractice(e){
  const {x,y,r,kind}=e;
  ctx.save();ctx.translate(x,y);ctx.lineWidth=2;
  if(kind==='potion'){
    ctx.fillStyle='#322745';ctx.strokeStyle='#d4f8ff';
    ctx.beginPath();ctx.moveTo(-r*.31,-r*.9);ctx.lineTo(r*.31,-r*.9);ctx.lineTo(r*.31,-r*.38);
    ctx.lineTo(r*.78,r*.15);ctx.lineTo(r*.78,r*.63);ctx.lineTo(r*.46,r*.91);ctx.lineTo(-r*.46,r*.91);ctx.lineTo(-r*.78,r*.63);ctx.lineTo(-r*.78,r*.15);ctx.lineTo(-r*.31,-r*.38);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=e.studied?'#91e2fc':'#7bf2b8';ctx.fillRect(-r*.6,r*.18,r*1.2,r*.46);ctx.fillRect(-r*.36,r*.62,r*.72,r*.13);
    ctx.fillStyle='#f3b57a';ctx.fillRect(-r*.31,-r,r*.62,r*.19);star(-r*.29,r*.12,r*.18,'#ffffef');
  }else if(kind==='rune'){
    ctx.shadowColor='#ffa63a';ctx.shadowBlur=7;ctx.fillStyle='#5c3a63';ctx.strokeStyle='#ffe097';
    ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=r*(i%2?.46:1);const xx=Math.cos(a)*rad,yy=Math.sin(a)*rad;if(!i)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy)}ctx.closePath();ctx.fill();ctx.stroke();star(0,0,r*.4,'#fff1a8');
  }else{
    ctx.strokeStyle='#f1caff';ctx.shadowBlur=8;ctx.shadowColor='#b75ce5';ctx.lineWidth=4;
    ctx.beginPath();ctx.ellipse(0,0,r*.65,r,.11,0,Math.PI*2);ctx.stroke();
    const a=clock*2;star(Math.cos(a)*r*.66,Math.sin(a)*r,5,'#fff0ad');star(0,0,r*.28,'#f2c8ff',.8);
  }
  ctx.restore();
}
function drawIce(e){
  const r=e.r*1.15;ctx.save();ctx.translate(e.x,e.y);
  ctx.strokeStyle='#c5faff';ctx.fillStyle='#76defa63';ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<6;i++){const angle=(i+.5)*Math.PI/3;const x=Math.cos(angle)*r,y=Math.sin(angle)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
  ctx.closePath();ctx.fill();ctx.stroke();star(-r*.53,-r*.58,4,'#eeffff');ctx.restore();
}
function drawGate(){
  const {x,y,r}=gate;ctx.save();ctx.translate(x,y);
  const haze=ctx.createRadialGradient(0,0,0,0,0,r*1.55);haze.addColorStop(0,'#29244988');haze.addColorStop(.56,'#bc98ff77');haze.addColorStop(1,'#ad8df900');ctx.fillStyle=haze;ctx.fillRect(-r*1.6,-r*1.6,r*3.2,r*3.2);
  for(let i=0;i<3;i++){
    ctx.beginPath();ctx.strokeStyle=['#61509d','#c6a9ff','#fbe5a9'][i];ctx.lineWidth=i===0?6:i===1?3:2;
    const rad=r*(1-i*.09);ctx.ellipse(0,0,rad*.76,rad,0,0,Math.PI*2);ctx.stroke();
  }
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7+clock*.6;star(Math.cos(a)*r*.76,Math.sin(a)*r,4,'#fff0bc')}
  star(0,0,r*.24,'#ffeca7',.72+.22*Math.sin(clock*3));ctx.restore();
}
function drawScene(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.imageSmoothingEnabled=false;ctx.save();
  if(mode!=='title'){if(shake>0)ctx.translate(Math.sin(clock*92)*shake*6,Math.cos(clock*78)*shake*5);if(flight)drawOrbitBackground();else skies()}
  for(const s of starfield){
    const depth=flight&&!reduceMotion?.35+s.a*.24:1;
    const drift=flight&&!reduceMotion?(player.y-H*.5)*.034*depth:0;
    const x=((s.x*W-(mode==='title'?0:scroll*.03*depth))%W+W)%W,y=s.y*H*(flight?1:.76)-drift;
    ctx.globalAlpha=.18+(.5+.5*Math.sin((reduceMotion?0:clock)*1.5+s.a))*.48;ctx.fillStyle='#ece6ff';ctx.fillRect(x,y,s.n,s.n)}
  ctx.globalAlpha=1;
  if(mode==='title'){ctx.restore();return}
  if(flight)drawOrbitForeground();
  if(gate)drawGate();
  for(const e of entities){if(!e.dead){if(e.kind==='meteor')drawMeteor(e);else if(e.kind==='gem')drawGem(e);else if(['potion','rune','hoop'].includes(e.kind))drawPractice(e);else drawEnemy(e);if(e.ice>0)drawIce(e)}}
  for(const s of shots){ctx.fillStyle='#55cacd';ctx.fillRect(s.x-13,s.y-2,13,4);ctx.fillStyle='#d9fffb';ctx.fillRect(s.x-5,s.y-2,8,4);star(s.x,s.y,5,'#c0fff6')}
  for(const p of particles){
    ctx.globalAlpha=clamp(p.life*2.6,0,1);
    if(flight){
      ctx.strokeStyle=p.color;ctx.lineWidth=Math.max(.7,p.size*.59);ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(p.x-p.vx*.033,p.y-p.vy*.033);ctx.lineTo(p.x,p.y);ctx.stroke();
    }else{ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size)}
  }
  ctx.globalAlpha=1;for(const r of rings){const f=r.age/.48;ctx.globalAlpha=(1-f)*.82;ctx.strokeStyle=r.color;ctx.lineWidth=3*(1-f)+1;ctx.beginPath();ctx.arc(r.x,r.y,Math.max(0,r.max*(1-(1-f)**2)),0,Math.PI*2);ctx.stroke()}
  if(burstTime>0){ctx.globalAlpha=.36+.1*Math.sin(clock*7);ctx.strokeStyle='#b1ffeb';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(player.x,player.y,player.w*.49,player.w*.47,0,0,Math.PI*2);ctx.stroke()}
  ctx.font='bold '+clamp(W*.015,12,17)+'px monospace';ctx.textAlign='center';
  for(const l of labels){ctx.globalAlpha=Math.min(1,l.life*3);ctx.fillStyle='#332649';ctx.fillText(l.val,l.x+1,l.y+2);ctx.fillStyle='#fff3b6';ctx.fillText(l.val,l.x,l.y)}
  ctx.restore();
}
function frame(now){
  const dt=previous?Math.min(.5,Math.max(0,(now-previous)/1000)):0;previous=now;
  if(mode==='play'||mode==='title')clock+=dt;
  if(mode==='play'){
    // Keep collisions stable while retaining elapsed time on lower frame rates.
    const steps=Math.max(1,Math.ceil(dt/.032));
    for(let i=0;i<steps&&mode==='play';i++)update(dt/steps);
  }
  if(mode==='play')animateCat(actorTime);
  drawScene();requestAnimationFrame(frame);
}
hud();requestAnimationFrame(frame);
