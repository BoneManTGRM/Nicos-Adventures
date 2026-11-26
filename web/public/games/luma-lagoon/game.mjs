import {colors, thresholds, meters, hatch, advance, stage, care} from './pet.mjs';
import {openLagoon} from './save.mjs';

const $ = id => document.getElementById(id);
const words = {
  en: {
    title:'Luma Lagoon', tagline:'Your little axolotl by moonlight.', world:'Nico’s World', locale:'Español', soundOn:'Sound on', soundOff:'Sound off',
    egg:'Mystery egg', baby:'Hatchling', swimmer:'Swimmer', guardian:'Lagoon guardian', choose:'Hatch a friend', pick:'Pick an egg and name your axolotl.', name:'Pet name', hatch:'Hatch egg', eggs:'Egg color', coral:'Coral', mint:'Mint', violet:'Violet',
    inside:'Who’s inside?', newPet:'Hello, little one!', care:'Care for', needs:'Pet needs', growth:'Growing together', star:'star', stars:'stars', to:'Next stage', grown:'Your lagoon guardian is fully grown.', feed:'Feed', play:'Play', wash:'Wash', nap:'Nap', wake:'Wake', cancel:'Finish later',
    belly:'Food', joy:'Joy', energy:'Energy', clean:'Clean', calm:'Just floating with you.', hungry:'A little snack sounds good.', dusty:'Ready for a splash!', bored:'Can we catch fireflies?', tired:'Time for a little nap.', sleeping:'Dreaming among the lilies…',
    fed:'Crunch! A tasty moon berry.', full:'All full. Let’s play!', washed:'Splash! Squeaky clean.', shiny:'Already sparkling clean.', napping:'Cozy under the moon.', woke:'Good morning, little swimmer!', rested:'Full of energy already!', asleep:'Let’s wake up first.', played:'Five fireflies! +3 bond stars.', cancelled:'The fireflies will be back.', level:'Grew into a', fireflies:'Fireflies', catch:'Tap the glowing firefly!', bug:'Catch the firefly', storage:'Saving is unavailable. You can still play during this visit.', habitat:'Moonlit axolotl lagoon', eggAlt:'A speckled axolotl egg', petAlt:'A pixel axolotl', retry:'Try again', wave:'A happy little wave!'
  },
  'es-MX': {
    title:'Laguna Luma', tagline:'Tu ajolotito a la luz de la luna.', world:'El Mundo de Nico', locale:'English', soundOn:'Sonido sí', soundOff:'Sin sonido',
    egg:'Huevo misterioso', baby:'Cría', swimmer:'Nadador', guardian:'Guardián de la laguna', choose:'Conoce a tu ajolote', pick:'Elige un huevo y ponle nombre a tu ajolote.', name:'Nombre', hatch:'Abrir huevo', eggs:'Color del huevo', coral:'Coral', mint:'Menta', violet:'Violeta',
    inside:'¿Quién estará adentro?', newPet:'¡Hola, pequeñín!', care:'Cuida a', needs:'Necesidades', growth:'Crecemos juntos', star:'estrella', stars:'estrellas', to:'Siguiente etapa', grown:'Tu guardián de la laguna ya creció por completo.', feed:'Comida', play:'Jugar', wash:'Baño', nap:'Siesta', wake:'Despertar', cancel:'Terminar después',
    belly:'Comida', joy:'Alegría', energy:'Energía', clean:'Aseo', calm:'Qué bonito flotar contigo.', hungry:'Se me antoja una frutita.', dusty:'¡Hora de un chapuzón!', bored:'¿Atrapamos luciérnagas?', tired:'Ya me dio sueñito.', sleeping:'Soñando entre los lirios…',
    fed:'¡Ñam! Una rica baya lunar.', full:'Ya comí. ¿Jugamos?', washed:'¡Splash! Qué refrescante.', shiny:'¡Ya estoy reluciente!', napping:'A dormir bajo la luna.', woke:'¡Buenos días, pequeñín!', rested:'¡Tengo mucha energía!', asleep:'Primero hay que despertar.', played:'¡Cinco luciérnagas! +3 estrellas.', cancelled:'Las luciérnagas volverán.', level:'Ahora soy', fireflies:'Luciérnagas', catch:'¡Toca la luciérnaga que brilla!', bug:'Atrapar la luciérnaga', storage:'No se pudo guardar. Puedes jugar durante esta visita.', habitat:'Laguna de ajolotes a la luz de la luna', eggAlt:'Huevo moteado de ajolote', petAlt:'Ajolote pixelado', retry:'Intenta de nuevo', wave:'¡Un saludito feliz!'
  }
};
let saves, pet = null, unavailable = false;
try { saves = openLagoon(localStorage); pet = saves.read(); } catch { saves = null; unavailable = true; }
const queryLang = new URLSearchParams(location.search).get('lang');
let lang = (queryLang || saves?.language || navigator.language || 'en').startsWith('es') ? 'es-MX' : 'en';
let eggColor = 'coral', sound = false, audio, game = null, busy = false;
let message = '', messageUntil = 0, pose = 0, poseUntil = 0, animationId, blinkUntil = 0;
let displaySleeping = false;
let nextBlink = Date.now() + 3100;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const stageKeys = ['egg', 'baby', 'swimmer', 'guardian'];
const icons = {feed:'🍓', play:'✨', wash:'🫧', nap:'🌙'};
const tones = {coral:'#ffa899', mint:'#94ebc0', violet:'#d7a9fb'};
const t = key => words[lang][key] || key;
const atlas = new Image();
atlas.onload = () => drawPet(Date.now());
atlas.src = './pets.png';

function tone(frequency, length = .12) {
  if (!sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gain); gain.connect(audio.destination);
    gain.gain.setValueAtTime(.09, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + length);
    oscillator.start(); oscillator.stop(audio.currentTime + length);
  } catch { /* Sound is optional. */ }
}
function say(key, seconds = 4) { message = key; messageUntil = Date.now() + seconds * 1000; }
function react(frame, effect) {
  pose = frame; poseUntil = Date.now() + 1400;
  $('effect').textContent = effect;
  $('effect').classList.remove('pop'); void $('effect').offsetWidth; $('effect').classList.add('pop');
  if (!motion.matches) {
    $('habitat').classList.remove('cheer'); void $('habitat').offsetWidth; $('habitat').classList.add('cheer');
  }
}
function drawPet(now) {
  const ctx = $('creature').getContext('2d');
  if (!atlas.complete || !atlas.naturalWidth || !ctx) return;
  const s = pet ? stage(pet.bond) : 0;
  const color = colors.indexOf(pet?.color || eggColor);
  if (now >= nextBlink) { blinkUntil = now + 155; nextBlink = now + 2700 + Math.random() * 3300; }
  const frame = displaySleeping ? 3 : now < poseUntil ? pose : pet && now < blinkUntil && !motion.matches ? 1 : 0;
  ctx.clearRect(0, 0, 100, 82); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(atlas, frame * 100, (color * 4 + s) * 82, 100, 82, 0, 0, 100, 82);
  if (now >= poseUntil) $('effect').textContent = '';
}
function mood(p) {
  if (!p) return 'inside';
  if (p.sleeping) return 'sleeping';
  const low = meters.reduce((a,b) => p[a] < p[b] ? a : b);
  return p[low] > 46 ? 'calm' : ({belly:'hungry', joy:'bored', energy:'tired', clean:'dusty'})[low];
}
function setText(id, value) { if ($(id).textContent !== value) $(id).textContent = value; }
function render() {
  const now = Date.now(), p = pet && advance(pet, now), s = p ? stage(p.bond) : 0;
  displaySleeping = Boolean(p?.sleeping);
  const translated = {title:'title', tagline:'tagline', chooseTitle:'choose', chooseHint:'pick', nameLabel:'name', hatch:'hatch', needsTitle:'needs', bondTitle:'growth', quitPlay:'cancel'};
  for (const [id,key] of Object.entries(translated)) setText(id,t(key));
  document.documentElement.lang=lang; document.title=t('title')+' · Nico’s World';
  setText('world','‹  '+t('world')); setText('lang',t('locale'));
  $('lang').lang=lang==='en'?'es-MX':'en';
  $('audio').querySelector('span').textContent=t(sound?'soundOn':'soundOff');
  $('audio').setAttribute('aria-pressed',String(sound));
  $('habitat').setAttribute('aria-label',t('habitat'));
  $('creature').setAttribute('aria-label',p ? t('petAlt')+' · '+p.name : t('eggAlt'));
  $('eggs').setAttribute('aria-label',t('eggs'));
  for (const button of $('eggs').children) {
    button.lastChild.textContent=t(button.dataset.color);
    button.setAttribute('aria-pressed',String(eggColor===button.dataset.color));
  }
  $('saveWarning').hidden=!unavailable; setText('saveWarning',t('storage'));
  $('nursery').hidden=!!p; $('home').hidden=!p;
  for (const key of stageKeys) $('habitat').classList.toggle(key, key===stageKeys[s]);
  $('habitat').classList.toggle('asleep',displaySleeping);
  setText('phase',p ? p.name+' · '+t(stageKeys[s]) : t('egg'));
  const bubble = game ? t('catch') : now < messageUntil ?
    (message==='level' ? t('level')+' '+t(stageKeys[s])+'!' : t(message)) : t(mood(p));
  setText('say',bubble); $('quitPlay').hidden=!game; $('bug').hidden=!game; $('gameScore').hidden=!game;
  if (game) {
    setText('gameScore',t('fireflies')+' '+game.score+'/5');
    $('bug').setAttribute('aria-label',t('bug')+' '+(game.score+1));
    const [x,y]=game.points[game.score]; $('bug').style.left=x+'%'; $('bug').style.top=y+'%';
  }
  if (p) {
    setText('careTitle',t('care')+' '+p.name);
    for(const b of $('actions').children) {
      const key=b.dataset.action;
      b.lastChild.textContent=t(key==='nap' && p.sleeping?'wake':key);
      b.disabled=busy || !!game || (p.sleeping && key!=='nap');
    }
    for(const key of meters) {
      const row=$('meter-'+key), n=Math.round(p[key]);
      row.firstChild.textContent=t(key); row.lastChild.textContent=n;
      row.children[1].firstChild.style.width=n+'%';
      row.children[1].setAttribute('aria-label',t(key)); row.children[1].setAttribute('aria-valuenow',String(n));
    }
    const target=thresholds[s];
    setText('bondCount','✦ '+p.bond+' '+t(p.bond===1?'star':'stars'));
    $('bondFill').style.width=(target ? (p.bond-thresholds[s-1])/(target-thresholds[s-1])*100 : 100)+'%';
    setText('bondHint',target ? t('to')+' · '+t(stageKeys[s+1])+' ('+p.bond+'/'+target+')' : t('grown'));
  }
  drawPet(now);
}
async function update(change) {
  if (busy) return false;
  busy=true;
  const run=() => {
    let current=pet;
    if(saves && !unavailable) {
      try {current=saves.read();} catch {unavailable=true;}
    }
    const result=change(current);
    if(!result) {pet=current;return false;}
    if(saves) {
      try {saves.write(result.pet);unavailable=false;} catch {unavailable=true;}
    }
    const grew=current && stage(result.pet.bond)>stage(current.bond);
    pet=result.pet; say(grew?'level':result.note,grew?6:4);
    return true;
  };
  try {return navigator.locks && saves ? await navigator.locks.request(saves.lock,run) : run();}
  finally {busy=false; render();}
}
function startPlay() {
  const points=[[20,42],[72,60],[42,33],[82,40],[29,64],[58,48],[69,31],[17,56]];
  for(let i=points.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1)); [points[i],points[j]]=[points[j],points[i]];
  }
  game={score:0,points}; tone(622); render(); $('bug').focus({preventScroll:true});
}
async function action(key) {
  if (!pet || busy || game) return;
  if (key==='play') {startPlay();return;}
  const done=await update(current => current && care(current,key,Date.now()));
  if(done) {
    const effect = key==='feed'?'♥':key==='wash'?'◌':pet.sleeping?'zZ':'☀';
    react(key==='feed'?4:2,effect);tone(key==='wash'?740:key==='feed'?523:392);
  }
}
$('bug').onclick=async()=>{
  if(!game || busy) return;
  game.score++;tone(510+game.score*85);
  if(game.score<5) {render();return;}
  game=null;
  if(await update(current => current && care(current,'play',Date.now()))) react(2,'✦');
  document.querySelector('[data-action="play"]').focus({preventScroll:true});
};
$('quitPlay').onclick=()=>{game=null;say('cancelled');render();document.querySelector('[data-action="play"]').focus({preventScroll:true});};
$('hatchForm').onsubmit=async event=>{
  event.preventDefault();
  const name=$('petName').value;
  if(await update(current=>current ? null : {pet:hatch(name,eggColor,Date.now()),note:'newPet'})) {
    react(2,'♡');tone(784,.22);document.querySelector('[data-action="feed"]').focus({preventScroll:true});
  }
};
$('lang').onclick=()=>{lang=lang==='en'?'es-MX':'en';const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);render();};
$('audio').onclick=()=>{sound=!sound;tone(659);render();};
for(const color of colors) {
  const button=document.createElement('button'), dot=document.createElement('i'), label=document.createElement('span');
  dot.className='eggDot'; dot.style.backgroundColor=tones[color]; button.dataset.color=color;button.className='eggChoice';
  button.append(dot,label);button.onclick=()=>{eggColor=color;render();tone(440+colors.indexOf(color)*90);};
  $('eggs').append(button);
}
for(const [key,icon] of Object.entries(icons)) {
  const button=document.createElement('button'), mark=document.createElement('span'), label=document.createElement('span');
  mark.textContent=icon;mark.setAttribute('aria-hidden','true');button.className='action';button.dataset.action=key;
  button.append(mark,label);button.onclick=()=>action(key);$('actions').append(button);
}
for (const [i,key] of meters.entries()) {
  const row=document.createElement('div'),label=document.createElement('span'),track=document.createElement('div'),fill=document.createElement('i'),value=document.createElement('b');
  row.id='meter-'+key;row.className='meter';track.className='track';track.setAttribute('role','meter');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
  fill.style.background=['#ffb3a3','#f6cd7a','#95dbcd','#aebcf7'][i];track.append(fill);row.append(label,track,value);$('meters').append(row);
}
for(const [i,[x,y]] of [[10,43],[19,61],[25,41],[75,32],[61,60],[78,71],[84,52],[38,34],[93,42]].entries()) {
  const speck=document.createElement('i');speck.className='spark';speck.style.cssText='left:'+x+'%;top:'+y+'%;animation-delay:-'+i*.37+'s';document.querySelector('.sky-dust').append(speck);
}
function sync() {
  if(document.hidden) {clearInterval(animationId);return;}
  if(saves && !unavailable) {
    try {pet=saves.read();} catch {unavailable=true;}
  }
  if (pet?.sleeping || !pet) game=null;
  clearInterval(animationId); animationId=setInterval(()=>drawPet(Date.now()),120); render();
}
document.addEventListener('visibilitychange',sync);
window.addEventListener('storage',sync);
window.addEventListener('pageshow',sync);
setInterval(()=>{if(!document.hidden)render();},1500);
sync();
