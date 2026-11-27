import {paintNachoPoster} from './nacho-art.mjs';
import {cities} from './cities.mjs';
import {newCity,step,press} from './simulation.mjs';
import {Renderer} from './renderer.mjs';
import {drawDistrictThumb} from './city-art.mjs';

const el=id=>document.getElementById(id);
const q=new URLSearchParams(location.search);
function read(key,fallback){try{return JSON.parse(localStorage.getItem('skullwing.'+key))??fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem('skullwing.'+key,JSON.stringify(value));}catch{/* The current session remains playable. */}}
let es=q.has('lang')?q.get('lang').startsWith('es'):read('spanish',false);
const t=(en,mx)=>es?mx:en;
const names=()=>cities.map(c=>t(c.en,c.es));
const savedMode=read('difficulty','easy');
let difficulty=(['easy','hard'].includes(q.get('mode'))?q.get('mode'):savedMode)==='hard'?'hard':'easy';
const requestedMonster=q.get('monster');
let monster=(['nacho','skullwing'].includes(requestedMonster)?requestedMonster:read('monster','skullwing'))==='nacho'?'nacho':'skullwing';
let selected=Math.max(0,cities.findIndex(c=>c.slug===q.get('city')));
let mode='menu',dialog='',sound=read('sound',true),records=read('records',{});
const recordKey=index=>(monster==='nacho'?'nacho-':'')+(difficulty==='hard'?'hard-':'')+index;
function reflectSelection(){
  const url=new URL(location.href);
  url.searchParams.set('city',cities[selected].slug);url.searchParams.set('mode',difficulty);
  url.searchParams.set('monster',monster);
  history.replaceState(null,'',url);
}
if(!records||typeof records!=='object')records={};
let audio=null,city=null,acc=0,last=0,raf=0,nextHud=0,previousFocus=null;
let hintUntil=0,callUntil=0,hadFlight=false,helpStage=0,recordBefore=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const render=new Renderer(el('world'),reduced.matches);
reduced.addEventListener?.('change',e=>{render.reduced=e.matches;});
const keys=new Map(),pointers=new Map(),buttons=new Map();
let input={};let audioStamp=0,blastStamp=0,floorStamp=0,noiseBuffer;
function unlock(){
  if(!sound)return;
  try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;audio??=new A();
    if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}
}
function tone(from,to,length,volume=.04,type='sine',offset=0){
  if(!sound||!audio||audio.state!=='running')return;
  const at=audio.currentTime+offset,osc=audio.createOscillator(),gain=audio.createGain();
  osc.type=type;osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(to,at+length);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.012);
  gain.gain.exponentialRampToValueAtTime(.0001,at+length);
  osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+length+.01);
}
function crunch(length,cutoff,volume){
  if(!sound||!audio||audio.state!=='running')return;
  if(!noiseBuffer){
    noiseBuffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*.55),audio.sampleRate);
    const data=noiseBuffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  }
  const at=audio.currentTime,source=audio.createBufferSource();
  const filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=noiseBuffer;
  filter.type='lowpass';filter.frequency.setValueAtTime(cutoff,at);
  filter.frequency.exponentialRampToValueAtTime(180,at+length);
  gain.gain.setValueAtTime(volume,at);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
  source.connect(filter);filter.connect(gain);gain.connect(audio.destination);
  source.start(at);source.stop(at+length);
}
function effect(e){
  if(!sound)return;
  if(e.kind==='roar'){tone(182,36,.62,.09,'sawtooth');tone(260,72,.48,.04,'triangle',.045);}
  if(e.kind==='flap'||e.kind==='leap')tone(e.kind==='flap'?230:115,365,.16,.034,'triangle');
  if(e.kind==='collapse'&&city.time-audioStamp>.08){tone(118,32,.34,.074,'triangle');tone(195,55,.16,.032,'sawtooth',.06);audioStamp=city.time;}
  if(e.kind==='vehicleHit'&&e.type==='tank')tone(510,172,.13,.034,'triangle');
  if(e.kind==='vehicleExplosion'&&city.time-blastStamp>.07){
    const tank=e.type==='tank';blastStamp=city.time;
    crunch(tank?.47:.30,tank?2400:3700,.18);
    tone(tank?105:150,33,tank?.48:.29,.095,'sine');
  }
  if(e.kind==='floorImpact'&&city.time-floorStamp>.095){
    floorStamp=city.time;crunch(.24,1250,.11);tone(102,38,.19,.057,'triangle');
  }
  if(e.kind==='lift'){tone(116,252,.19,.040,'triangle');}
  if(e.kind==='toss'){tone(330,125,.20,.052,'sawtooth');}
  if(e.belly){crunch(.24,1450,.16);tone(82,30,.37,.11);}
  if(e.kind==='grab')tone(230,400,.13,.032,'triangle');
  if(e.kind==='chomp'){tone(260,94,.10,.05,'square');tone(370,620,.16,.035,'triangle',.09);}
  if(e.kind==='swing')tone(e.hit?160:250,e.hit?43:100,.115,.039,'triangle');
  if(e.kind==='stomp'){tone(110,29,.31,.10,'sine');tone(154,41,.14,.04,'triangle');}
  if(e.kind==='land')tone(82,42,.12,.028,'sine');
  if(e.kind==='warning')tone(480,690,.14,.023,'triangle');
  if(e.kind==='bolt')tone(710,220,.19,.026,'sine');
  if(e.kind==='droneHit')tone(390,92,.27,.041,'triangle');
  if(e.kind==='hurt'){tone(185,62,.21,.069,'triangle');crunch(.13,1800,.06);}
  if(e.kind==='knockout')[246.94,196,146.83].forEach((n,i)=>tone(n,n*.84,.32,.05,'triangle',i*.16));
  if(e.kind==='clear')[261.63,329.63,392,523.25].forEach((n,i)=>tone(n,n*1.01,.22,.045,'triangle',i*.095));
}
function cardArt(){
  document.querySelectorAll('.district-card canvas').forEach(cv=>{
    const i=Number(cv.dataset.district);
    const box=cv.getBoundingClientRect();if(!box.width)return;
    const dpr=Math.min(1.5,devicePixelRatio||1);
    cv.width=Math.round(box.width*dpr);cv.height=Math.round(box.height*dpr);
    const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);drawDistrictThumb(c,i,box.width,box.height);
  });
}
function audibleLabel(){
  el('audio').setAttribute('aria-pressed',String(sound));
  el('audio').setAttribute('aria-label',sound?t('Mute sound','Silenciar sonido'):t('Turn sound on','Activar sonido'));
}
function refreshCards(){
  el('launchCity').textContent=t('Play ','Jugar en ')+names()[selected];
  [...el('cards').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
}
function makeCards(){
  el('cards').replaceChildren(...names().map((name,i)=>{
    const b=document.createElement('button');b.className='district-card';b.type='button';
    let art;
    if(cities[i].painting){
      art=document.createElement('img');art.alt='';art.loading='lazy';art.decoding='async';
      art.src=new URL(cities[i].painting,import.meta.url).href;
      art.style.objectPosition=(100*cities[i].focus)+'% center';
    }else{
      art=document.createElement('canvas');art.dataset.district=String(i);art.setAttribute('aria-hidden','true');
    }
    const label=document.createElement('b');label.textContent=name;b.append(art,label);
    if(Number(records[recordKey(i)])>0){const best=document.createElement('small');best.className='record';best.textContent=t('Best ','Récord ')+Number(records[recordKey(i)]).toLocaleString(es?'es-MX':'en-US');b.append(best);}
    b.addEventListener('click',()=>{selected=i;reflectSelection();el('launchCity').hidden=false;refreshCards();tone(290+i*60,360+i*60,.09,.02,'sine');});
    return b;
  }));refreshCards();requestAnimationFrame(cardArt);
}
function localize(){
  document.documentElement.lang=es?'es-MX':'en';el('lang').textContent=es?'EN':'ES';
  el('lang').setAttribute('aria-label',es?'Switch to English':'Cambiar a español');
  const copy={
    easy:t('Easy','Fácil'),hard:t('Hard','Difícil'),
    startText:t('Smash the city','Aplasta la ciudad'),choose:t('Choose your city','Elige tu ciudad'),
    districtCount:cities.length+t(' cities',' ciudades'),districtLabel:t('DISTRICT','DISTRITO'),
    scoreLabel:t('SCORE','PUNTOS'),jumpName:t('Flap','Volar'),smashName:t('Smash','Golpe'),roarName:t('Roar','Rugir')
  };
  for(const [id,value] of Object.entries(copy))el(id).textContent=value;
  el('pause').setAttribute('aria-label',t('Pause','Pausa'));el('arena').setAttribute('aria-label',t('Skullwing game','Juego de Skullwing'));
  buttons.get('left')?.setAttribute('aria-label',t('Move left','Mover a la izquierda'));
  buttons.get('right')?.setAttribute('aria-label',t('Move right','Mover a la derecha'));
  el('world').setAttribute('aria-label',t('City destruction playfield','Ciudad para demoler'));
  el('modes').setAttribute('aria-label',t('Difficulty','Dificultad'));
  updateFighter();updateGrabButton();updateDifficulty();audibleLabel();makeCards();
  if(city){el('districtName').textContent=names()[city.district];if(mode==='play'){setHint();hud();}}
  if(dialog)showDialog(dialog);
}
function updateFighter(){
  const nacho=monster==='nacho';
  el('app').dataset.monster=monster;
  el('fighters').setAttribute('aria-label',t('Choose your monster','Elige tu monstruo'));
  el('nacho').setAttribute('aria-pressed',String(nacho));el('skullwing').setAttribute('aria-pressed',String(!nacho));
  el('heroTitle').setAttribute('aria-label',nacho?'Nacho':'Skullwing');
  el('heroFirst').hidden=nacho;el('heroLast').textContent=nacho?'NACHO':'WING';
  el('nachoPoster').hidden=!nacho;
  el('jumpName').textContent=nacho?t('Jump','Saltar'):t('Flap','Volar');
  el('chargeBar').hidden=nacho;
}
function updateDifficulty(){
  const hard=difficulty==='hard';
  el('easy').setAttribute('aria-pressed',String(!hard));
  el('hard').setAttribute('aria-pressed',String(hard));
  el('pitch').textContent=hard?t('Five hearts. Dodge the amber target.','Cinco corazones. Esquiva la mira ámbar.'):
    monster==='nacho'?t('Body-slam a tower. Throw a car.','Cae de panza sobre una torre. Lanza un auto.'):t('Smash at your own pace.','Derriba la ciudad a tu ritmo.');
}
function setMode(value){
  mode=value;el('app').dataset.view=value;el('menu').hidden=value!=='menu';el('arena').hidden=value!=='play';
}
function syncInput(){
  const values=[...keys.values(),...pointers.values()];input=Object.fromEntries([...buttons.keys()].map(k=>[k,values.includes(k)]));
  buttons.forEach((b,k)=>b.classList.toggle('held',!!input[k]));
}
function clearInput(){keys.clear();pointers.clear();syncInput();}
function hint(text,seconds){el('hint').textContent=text;hintUntil=(city?.time||0)+seconds;}
function setHint(){
  const touch=matchMedia('(pointer: coarse)').matches;
  if(city.monster==='nacho'){
    if(city.actor.haul){
      const key=city.actor.haul.kind==='car'?'E':'C';
      hint(t(touch?'Face your target, then tap Throw.':'Face your target, then press '+key+' again to throw.',
        touch?'Mira hacia tu objetivo y toca Lanzar.':'Mira hacia tu objetivo y pulsa '+key+' otra vez para lanzar.'),6);
    }else hint(t(touch?'Tap Jump, then Flop in midair. Lift a car or person from the street.':'Space to jump, X in midair to belly flop. E lifts a car, C grabs a person.',
      touch?'Salta y toca Plancha en el aire. Levanta autos o personas en la calle.':'Espacio para saltar, X en el aire para una plancha. E levanta autos y C agarra personas.'),7);
    return;
  }
  if(city.actor.grip)hint(t(touch?'Tap Eat to take a bite.':'Press E again to eat.',touch?'Toca Comer para dar una mordida.':'Pulsa E otra vez para comer.'),6);
  else if(city.defense&&helpStage===0)hint(t('See the amber target? Move or jump to dodge.','¿Ves la mira ámbar? Muévete o salta para esquivar.'),7);
  else if(helpStage===0)hint(t(touch?'Tap Grab beside a person, then tap Eat.':'Move with ← → or A / D. Press E near a person, then E to eat.',touch?'Toca Agarrar junto a alguien y luego toca Comer.':'Muévete con ← → o A / D. Pulsa E para agarrar y otra vez para comer.'),8);
  else if(helpStage===1)hint(t(touch?'Tap Flap twice to fly. Hold it to glide.':'Tap Space twice to fly. Hold it to glide.',touch?'Toca Volar dos veces. Mantenlo para planear.':'Pulsa Espacio dos veces. Mantenlo para planear.'),6);
  else if(helpStage===2)hint(t(touch?'Tap Smash in midair to dive.':'Press X in midair to dive.',touch?'Toca Golpe en el aire para caer con fuerza.':'Pulsa X en el aire para caer con fuerza.'),5);
  else hint(t(touch?'Roar shakes every nearby building.':'Press C to roar through nearby buildings.',touch?'Ruge para sacudir los edificios cercanos.':'Pulsa C para sacudir los edificios cercanos.'),6);
}
function callout(text,seconds=.9){el('callout').textContent=text;callUntil=city.time+seconds;}
function begin(index){
  selected=index;city=newCity(index,difficulty,monster);reflectSelection();recordBefore=Number(records[recordKey(index)])||0;audioStamp=blastStamp=floorStamp=-1;
  clearInput();closeDialog(false);setMode('play');render.reset();render.resize();last=0;acc=0;nextHud=0;
  hadFlight=false;helpStage=0;el('callout').textContent='';el('districtName').textContent=names()[index];
  el('minimap').replaceChildren(...city.buildings.map(b=>{const n=document.createElement('i');n.style.height=(3+b.h/20)+'px';if(b.landmark)n.dataset.landmark='true';return n;}));
  window.scrollTo(0,0);el('pause').focus({preventScroll:true});setHint();hud();render.render(city,0);schedule();
}
function leave(){
  clearInput();closeDialog(false);city=null;setMode('menu');makeCards();el('start').focus({preventScroll:true});
}
function updateGrabButton(){
  const car=buttons.get('grab'),person=buttons.get('roar');
  if(monster==='nacho'){
    const held=city?.actor.haul?.kind;
    const throwText=t('Throw','Lanzar'),carText=held==='car'?throwText:t('Car','Auto'),personText=held==='person'?throwText:t('Person','Persona');
    if(el('grabName').textContent!==carText)el('grabName').textContent=carText;
    if(el('roarName').textContent!==personText)el('roarName').textContent=personText;
    const airborne=city&&!city.actor.grounded;
    const attack=airborne?t('Flop','Plancha'):t('Punch','Golpe');
    if(el('smashName').textContent!==attack)el('smashName').textContent=attack;
    car.setAttribute('aria-label',held==='car'?t('Throw car','Lanzar auto'):t('Lift car','Levantar auto'));
    person.setAttribute('aria-label',held==='person'?t('Throw person','Lanzar persona'):t('Grab person','Agarrar persona'));
    car.title=car.getAttribute('aria-label')+' (E)';person.title=person.getAttribute('aria-label')+' (C)';
    car.classList.toggle('carrying',held==='car');person.classList.toggle('carrying',held==='person');
    car.setAttribute('aria-disabled',String(held==='person'));person.setAttribute('aria-disabled',String(held==='car'));
    return;
  }
  car.removeAttribute('aria-label');person.removeAttribute('aria-label');
  car.removeAttribute('aria-disabled');person.classList.remove('carrying');person.title=t('Roar','Rugir')+' (C)';
  const holding=!!city?.actor.grip;
  const label=holding?t('Eat','Comer'):t('Grab','Agarrar');
  const button=buttons.get('grab');
  if(el('grabName').textContent!==label)el('grabName').textContent=label;
  button.classList.toggle('carrying',holding);
  button.title=label+' (E)';
}
function hud(){
  updateGrabButton();
  el('score').textContent=city.score.toLocaleString(es?'es-MX':'en-US');
  el('clearCount').textContent=city.cleared+' / '+city.buildings.length;
  el('clearCount').setAttribute('aria-label',t('Buildings down','Edificios derribados')+' '+el('clearCount').textContent);
  const wrecks=city.wrecks.car+city.wrecks.police+city.wrecks.tank;
  el('wreckCount').hidden=!wrecks;
  el('wreckCount').textContent=t('Wrecks ','Destrozos ')+wrecks;
  el('health').hidden=!city.defense;
  if(city.defense){
    const {hp,maxHp}=city.defense;
    el('hearts').textContent='♥'.repeat(hp)+'♡'.repeat(maxHp-hp);
    const label=t('Health ','Salud ')+hp+' / '+maxHp;
    if(el('hpText').textContent!==label)el('hpText').textContent=label;
  }
  const near=city.buildings.reduce((best,b,i)=>!best||Math.abs(b.x-city.actor.x)<best.dist?{dist:Math.abs(b.x-city.actor.x),i}:best,null)?.i;
  const dots=el('minimap').children;
  city.buildings.forEach((b,i)=>{dots[i].className=b.hp<=0?'down':i===near?'near':'';});
  const combo=el('combo');combo.hidden=city.combo<2;if(city.combo>=2)combo.textContent='×'+city.combo+' '+t('chain','en cadena');
  if(city.monster!=='nacho')buttons.get('roar').setAttribute('aria-disabled',String(city.charge<.999));
  el('chargeBar').style.transform='scaleX('+city.charge.toFixed(2)+')';
}
function receive(e){
  render.event(e);effect(e);
  if(e.kind==='collapse'){
    if(helpStage===0){helpStage=1;setHint();}
    if(e.b.landmark){
      const landmark=cities[city.district].landmark;callout(t(landmark.en,landmark.es)+' +250',1.2);
    }else if(e.combo>=2)callout(t('CHAIN REACTION','¡EN CADENA!')+' ×'+e.combo);
  }
  if(e.kind==='lift'){updateGrabButton();setHint();}
  if(e.kind==='liftMiss')hint(e.target==='car'?t('Face a nearby vehicle on the street.','Acércate a un vehículo y mira hacia él.'):t('Face someone nearby on the street.','Acércate a una persona y mira hacia ella.'),2.3);
  if(e.kind==='toss') {
    updateGrabButton();callout(e.punched?t('POWER PUNCH!','¡PUÑETAZO!'):e.target==='car'?t('CAR TOSS!','¡AUTO AL AIRE!'):t('FLYING TOSS!','¡POR LOS AIRES!'),.9);
    el('hint').textContent='';hintUntil=0;
  }
  if(e.kind==='stomp'&&e.belly)callout(t('BELLY FLOP!','¡PLANCHAZO!'),1.05);
  if(e.kind==='grab') {updateGrabButton();setHint();}
  if(e.kind==='grabMiss')hint(t('Face someone on the street and move closer.','Acércate a alguien en la calle y mira hacia esa persona.'),2.4);
  if(e.kind==='chomp'){
    callout(t('CHOMP!','¡ÑAM!')+' +'+e.points+(e.healed?'  ♥ +1':''),1.1);
    hintUntil=0;el('hint').textContent='';
  }
  if(e.kind==='ricochet')callout(t('CRASH BONUS +55','¡CHOQUE! +55'),.7);
  if(e.kind==='vehicleExplosion'){
    if(e.chain)callout(t('CHAIN BLAST','EXPLOSIÓN EN CADENA')+' ×'+(e.chain+1));
    else if(e.type==='tank')callout(t('TANK WRECKED!','¡TANQUE DESTROZADO!'));
  }
  if(e.kind==='flap'&&!hadFlight){hadFlight=true;helpStage=2;setHint();}
  if(e.kind==='stomp'&&helpStage===2){helpStage=3;setHint();}
  if(e.kind==='defeat')showDialog('defeat');
  if(e.kind==='clear'){
    const key=recordKey(city.district);records[key]=Math.max(Number(records[key])||0,city.score);
    write('records',records);showDialog('clear');
  }
}
function schedule(){if(!raf&&mode==='play'&&!dialog)raf=requestAnimationFrame(frame);}
function frame(ts){
  raf=0;if(!city||dialog||mode!=='play')return;
  const dt=last?Math.min((ts-last)/1000,.075):0;last=ts;acc+=dt;
  while(acc>=1/120&&!city.done){step(city,input,1/120);acc-=1/120;}
  for(const e of city.events)receive(e);city.events.length=0;
  render.render(city,dt);if(city.time>=nextHud||city.done){hud();nextHud=city.time+.075;}
  if(hintUntil&&city.time>hintUntil){hintUntil=0;el('hint').textContent='';}
  if(callUntil&&city.time>callUntil){callUntil=0;el('callout').textContent='';}
  schedule();
}
function closeDialog(focus=true){
  el('veil').hidden=true;dialog='';el('arena').inert=false;document.querySelector('.bar').inert=false;
  if(focus&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});last=0;acc=0;
}
function showDialog(which){
  if(!city)return;
  if(!dialog)previousFocus=document.activeElement;
  dialog=which;clearInput();el('arena').inert=true;document.querySelector('.bar').inert=true;el('veil').hidden=false;
  el('dialogDistrict').textContent=names()[city.district].toUpperCase();
  const done=which==='clear',lost=which==='defeat';
  el('dialogTitle').textContent=lost?(city.monster==='nacho'?t('Nacho is down!','¡Nacho cayó!'):t('Skullwing is down!','¡Skullwing cayó!')):done?t('City flattened!','¡Ciudad demolida!'):t('Paused','En pausa');
  const touch=matchMedia('(pointer: coarse)').matches;
  const tally=city.wrecks;
  el('dialogText').textContent=lost?
    t('Jump when a warning locks on, or roar to knock the drone out of the sky.','Cuando aparezca la mira, salta o ruge para derribar el dron.'):done?
    [t('Cars','Autos')+' '+tally.car,t('Police cruisers','Patrullas')+' '+tally.police,t('Tanks','Tanques')+' '+tally.tank].join(' · '):
    t(touch?'Tap Flap twice to climb. Hold to glide. Smash in the air to dive. Tap Grab by a person, then Eat.':'Arrows or A/D to move. Space to flap or glide, X to smash or dive, C to roar. Press E to grab, then E to eat.',
      touch?'Toca Volar dos veces para subir. Mantén para planear. Golpea en el aire para caer. Toca Agarrar y luego Comer.':'Flechas o A/D para moverte. Espacio para volar o planear, X para golpear o caer, C para rugir. Pulsa E para agarrar y otra vez para comer.');
  if(city.monster==='nacho'&&!done){
    el('dialogText').textContent=lost?t('Jump to dodge the amber target.','Salta para esquivar la mira ámbar.'):
      t(touch?'Punch on the ground. Jump, then tap Flop over a car or rooftop. Tap Car or Person to lift, then Throw.':'Move with A/D or the arrows. Space jumps. X punches on the ground or belly flops in the air. E lifts cars and C grabs people. Press the same key again to throw.',
      touch?'Golpea en el suelo. Salta y toca Plancha sobre un auto o un techo. Toca Auto o Persona para levantar y luego Lanzar.':'Muévete con A/D o las flechas. Espacio salta. X golpea en el suelo o hace una plancha en el aire. E levanta autos y C agarra personas. Repite la tecla para lanzar.');
  }
  el('results').hidden=!done&&!lost;
  if(lost)el('results').textContent=city.cleared+' / '+city.buildings.length+' '+t('buildings down','edificios derribados')+' · '+city.score+' '+t('points','puntos');
  if(done){
    const pts=city.score.toLocaleString(es?'es-MX':'en-US');
    el('results').textContent=pts+' '+t('points','puntos')+' · '+(city.score>recordBefore?t('New best!','¡Nuevo récord!'):t('Best','Récord')+' '+recordBefore.toLocaleString());
  }
  const options=lost?[[t('Try again','Reintentar'),()=>begin(selected)]]:done?[[t('Next city','Siguiente ciudad'),()=>begin((selected+1)%cities.length)],[t('Play again','Repetir'),()=>begin(selected)]]:
    [[t('Resume','Continuar'),()=>{closeDialog();schedule();}]];
  options.push([t('City select','Elegir ciudad'),leave]);
  el('dialogActions').replaceChildren(...options.map(([label,fn])=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;return b;}));
  el('dialogActions').firstElementChild.focus({preventScroll:true});
}
const mapping={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',KeyZ:'jump',KeyX:'attack',KeyJ:'attack',KeyE:'grab',KeyC:'roar',KeyK:'roar'};
function act(action){
  if(city.monster!=='nacho'&&action==='roar'&&city.charge<.999)hint(t('Roar is recharging. Smash a tower to charge it faster.','El rugido se recarga. Golpea una torre para cargarlo antes.'),2.6);
  press(city,action);if(city.monster==='nacho')updateGrabButton();
}
document.querySelectorAll('[data-action]').forEach(b=>{
  const action=b.dataset.action;buttons.set(action,b);
  b.addEventListener('pointerdown',e=>{
    if(dialog||mode!=='play'||e.button!==0)return;e.preventDefault();unlock();
    b.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,action);syncInput();act(action);
  });
  const up=e=>{pointers.delete(e.pointerId);syncInput();};
  for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,up);
  b.addEventListener('click',e=>{if(e.detail===0&&mode==='play'&&!dialog){unlock();act(action);}});
});
window.addEventListener('keydown',e=>{
  if(mode!=='play')return;
  if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(e.repeat)return;if(dialog==='pause'){closeDialog();schedule();}else if(!dialog)showDialog('pause');return;}
  if(dialog){
    if(e.code==='Tab'){const list=[...el('dialogActions').children],i=list.indexOf(document.activeElement);
      if((e.shiftKey&&i===0)||(!e.shiftKey&&i===list.length-1)){e.preventDefault();list[e.shiftKey?list.length-1:0].focus();}}
    return;
  }
  const action=mapping[e.code];if(!action)return;e.preventDefault();if(keys.has(e.code)||e.repeat)return;
  unlock();keys.set(e.code,action);syncInput();act(action);
});
window.addEventListener('keyup',e=>{if(keys.delete(e.code)){e.preventDefault();syncInput();}});
function autoPause(){if(mode==='play'&&!dialog&&!city?.done)showDialog('pause');}
window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});
window.addEventListener('resize',()=>{if(mode==='play')render.resize();else cardArt();});
new ResizeObserver(()=>{if(mode==='play')render.resize();}).observe(el('stage'));
el('audio').onclick=()=>{sound=!sound;write('sound',sound);audibleLabel();if(sound){unlock();tone(320,430,.12,.035);}};
el('lang').onclick=()=>{es=!es;write('spanish',es);const url=new URL(location.href);url.searchParams.set('lang',es?'es-MX':'en');history.replaceState(null,'',url);localize();};
for(const value of ['easy','hard'])el(value).onclick=()=>{
  difficulty=value;write('difficulty',value);reflectSelection();updateDifficulty();makeCards();
};
for(const id of ['skullwing','nacho'])el(id).onclick=()=>{
  monster=id;write('monster',id);reflectSelection();localize();
};
paintNachoPoster(el('nachoPoster'));
el('launchCity').onclick=el('start').onclick=()=>{unlock();begin(selected);};
el('pause').onclick=()=>showDialog('pause');
el('controls').addEventListener('contextmenu',e=>e.preventDefault());
localize();
