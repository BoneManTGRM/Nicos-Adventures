'use strict';
(() => {
  const get=id=>document.getElementById(id), ring=get('ring'), ctx=ring.getContext('2d');
  const places=['Tlalmanalco','Xochimilco','Puebla','Oaxaca','Ciudad de México'];
  const rivals=['Coyote de Cobre','Reina Relámpago','Garza Nocturna','Mamut de Obsidiana','Rey del Cráter'];
  const rivalIds=[1,6,2,7,3],hues=['#f28e49','#e5b33d','#ce9be8','#db937c','#f37651'],wash=['#514137','#564a39','#513f52','#3e444d','#55413b'];
  const masks=[
    {id:0,name:'Rayo de Jade',short:'Rayo',img:'rayo.webp',finisher:'Plancha del Volcán',en:'An all-rounder with a flying body press.',es:'Técnico completo con una plancha aérea.'},
    {id:4,name:'Ajolote Rosa',short:'Ajolote',img:'ajolote.webp',finisher:'Salto del Ajolote',en:'The fastest mask, with a high-flying springboard.',es:'La más veloz, con un salto especial desde las cuerdas.'},
    {id:5,name:'El Mil Usos',short:'Mil Usos',img:'mil-usos.webp',finisher:'Llave de Taller',en:'A powerhouse with a rolling signature suplex.',es:'Potencia y técnica con un súplex giratorio.'}
  ];
  const strings={
    en:{tag:'Three rivals. One championship belt. Step into the ring as Rayo de Jade.',start:'Enter the ring',help:'How to play',card:'Tonight’s fight card',belt:'Belts won',helpTitle:'How to wrestle',ok:'Got it',pause:'Pause',resume:'Resume',you:'YOU',sound:'Sound',on:'on',off:'off',bout:'Bout',guard:'Guard',strike:'Chop',throw:'Throw',pin:'Pin',kick:'Kick out',dive:'Vuelo',next:'Next arena',retry:'Rematch',again:'Defend the belt',back:'Fight card',paused:'Time out',pausedText:'The referee has stopped the action.',win:'¡Victoria!',lost:'Three-count!',champ:'¡Campeón!',wonText:'Rayo de Jade wins by pinfall.',lostText:'Your rival got the pin. Try a throw when they raise their guard.',champText:'Rayo de Jade takes the Volcán championship belt!',stage:'CHAMPIONSHIP TOUR',defaultTip:'Move close to chop or throw.',range:'Move closer to land your move.',charge:'Fill Vuelo with chops, throws, or blocks.',ready:'Vuelo ready! Tap to fly across the ring.',down:'Get close and tap Pin!',youDown:'Get ready to kick out!',closer:'Move closer, then tap Pin.',escape:'Kick-out!',counter:'Blocked!',ref:'Cover!',pinTip:'Hold the cover for three.',warnStrike:'CHOP',warnThrow:'THROW',warnDive:'VUELO',tap:'Tap Kick out',escapesUsed:'No kick-outs left.',rules:[
      ['Move','Hold ◀ or ▶, or use the arrow keys. Get close enough to reach your rival.'],
      ['Chop / Throw','Tap Chop (X) for a quick hit. Throw (C) sends a nearby rival over your shoulder and breaks their guard.'],
      ['Guard / Vuelo','Hold Guard (Z) against chops. Back away from throws. At full gold meter, tap Vuelo (V) for a flying press.'],
      ['Pin / Kick out','After a knockdown, use Pin (C). A tired rival stays down for three. If you get pinned, tap Chop (X) quickly. You can escape twice per bout.']]},
    es:{tag:'Tres rivales. Un cinturón. Sube al cuadrilátero con la máscara de Rayo de Jade.',start:'Subir al ring',help:'Cómo jugar',card:'Cartel de esta noche',belt:'Cinturones',helpTitle:'Cómo luchar',ok:'Entendido',pause:'Pausa',resume:'Continuar',you:'TÚ',sound:'Sonido',on:'sí',off:'no',bout:'Lucha',guard:'Cubrir',strike:'Tajo',throw:'Lanzar',pin:'Cubrir rival',kick:'Escapar',dive:'Vuelo',next:'Siguiente arena',retry:'Revancha',again:'Defender el título',back:'Cartel',paused:'Tiempo fuera',pausedText:'El réferi ha detenido la lucha.',win:'¡Victoria!',lost:'¡Cuenta de tres!',champ:'¡Campeón!',wonText:'Rayo de Jade gana por cuenta de tres.',lostText:'Tu rival ganó. Prueba un lance cuando se cubra.',champText:'¡Rayo de Jade gana el cinturón del Volcán!',stage:'GIRA POR EL CAMPEONATO',defaultTip:'Acércate para dar un tajo o lanzar.',range:'Acércate para conectar.',charge:'Carga el vuelo con tajos, lances o bloqueos.',ready:'¡Vuelo listo! Toca para saltar desde lejos.',down:'¡Acércate y cubre al rival!',youDown:'¡Prepárate para escapar!',closer:'Acércate para cubrir al rival.',escape:'¡Se zafa!',counter:'¡Bloqueo!',ref:'¡Espaldas planas!',pinTip:'Mantén la cobertura hasta tres.',warnStrike:'TAJO',warnThrow:'LANCE',warnDive:'VUELO',tap:'Toca Escapar',escapesUsed:'Ya usaste tus escapes.',rules:[
      ['Moverse','Mantén pulsado ◀ o ▶, o usa las flechas del teclado. Acércate a tu rival.'],
      ['Tajo / Lanzar','Tajo (X) da un golpe rápido. Lanzar (C) manda al rival sobre tu hombro y rompe su guardia.'],
      ['Cubrir / Vuelo','Mantén Cubrir (Z) para bloquear tajos. Aléjate de los lances. Con la barra dorada llena, usa Vuelo (V) para una plancha.'],
      ['Espaldas planas','Al derribar al rival, cúbrelo con C. Si está agotado, el réferi contará tres. Si te cubre, pulsa Tajo (X) varias veces. Tienes dos escapes por lucha.']]}
  };
  Object.assign(strings.en,{start:'Start tour',card:'Exhibition matches',mask:'Choose your mask',difficulty:'Difficulty',levels:['Family','Arcade','Legend'],continue:'Continue tour',explain:'Pick any opponent for a single bout.',exhibition:'Exhibition',points:'Points',chain:'Chop twice, then throw for a Hurricane!',combo:'HURACÁN',spring:'SPRINGBOARD',reversal:'REVERSAL',rush:'RUSH',rope:'Rebound',ropeWait:'Give the ropes a moment to settle.',charge:'Try Vuelo near the ropes, or fill the gold meter.',guard:'Guard',hits:'hits',best:'Best',record:'Arena best',stars:'stars',again:'New tour',replay:'Wrestle again',next:'Next arena',youWin:'wins by pinfall!',champion:'wins the Volcán belt!',ready:'Signature ready! Tap Vuelo.',ruleCombo:'Land two chops, then a throw for a Hurricane combo. Time a guard just before a hit for a reversal.',ruleRope:'Move to either set of ropes and tap Vuelo (V) for a springboard before the gold meter fills. At full meter, use your mask’s signature from anywhere.'});
  Object.assign(strings.es,{start:'Iniciar gira',card:'Luchas de exhibición',mask:'Elige tu máscara',difficulty:'Dificultad',levels:['Familiar','Arcade','Leyenda'],continue:'Continuar gira',explain:'Elige un rival para una sola lucha.',exhibition:'Exhibición',points:'Puntos',chain:'¡Dos tajos y un lance para un Huracán!',combo:'HURACÁN',spring:'RESORTE',reversal:'CONTRAATAQUE',rush:'EMBESTIDA',rope:'Resorte',ropeWait:'Espera a que se estabilicen las cuerdas.',charge:'Usa Vuelo cerca de las cuerdas o llena la barra dorada.',hits:'golpes',best:'Récord',record:'Récord de la arena',stars:'estrellas',again:'Nueva gira',replay:'Luchar otra vez',next:'Siguiente arena',youWin:'gana por cuenta de tres.',champion:'gana el cinturón del Volcán.',ready:'¡Especial listo! Toca Vuelo.',ruleCombo:'Conecta dos tajos seguidos y un lance para un Huracán. Cúbrete justo antes de un golpe para contraatacar.',ruleRope:'Acércate a las cuerdas y toca Vuelo (V) para un resorte con la barra sin llenar. Con la barra llena puedes usar el especial desde cualquier punto.'});
  function saved(key,alt){try{return localStorage.getItem('volcan.'+key)??alt;}catch{return alt;}}
  function persist(key,val){try{localStorage.setItem('volcan.'+key,val);}catch{}}
  const queryLang=new URLSearchParams(location.search).get('lang');
  let lang=queryLang==='es-MX'||queryLang==='es'?'es':queryLang==='en'?'en':saved('lang','en')==='es'?'es':'en';
  let sound=saved('sound','1')!=='0',belts=Number(saved('belts','0'))||0;
  function readObj(key){try{return JSON.parse(saved(key,'null'));}catch{return null;}}
  let selected=masks.find(m=>m.id===Number(saved('mask','0')))??masks[0];
  let level=saved('level','family');if(!['family','arcade','legend'].includes(level))level='family';
  let checkpoint=readObj('tour2');
  if(!checkpoint||!Number.isInteger(checkpoint.round)||checkpoint.round<1||checkpoint.round>4||!masks.some(m=>m.id===checkpoint.mask)||!['family','arcade','legend'].includes(checkpoint.level))checkpoint=null;
  let records=readObj('records2');if(!records||typeof records!=='object'||Array.isArray(records))records={};
  let tour=true, bout=null, paused=false, won=false, active=false, raf=0, previous=0, buffer=0, uiStamp='',announceUntil=0,tipKey='',tipUntil=0,shake=0;
  let particles=[],ghosts=[],ghostTime=0;const audio=new LuchaAudio({enabled:sound});const inputs=new Map(),buttons={};
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=k=>strings[lang][k];
  function selectMask(id){selected=masks.find(m=>m.id===id)||masks[0];persist('mask',String(selected.id));labels();}
  function markRound(round){checkpoint=round?{round,mask:selected.id,level}:null;persist('tour2',JSON.stringify(checkpoint));}
  function stars(){return won?1+Number(bout.hero.hp>=48)+Number(bout.stats.counters+bout.stats.specials+bout.stats.springs>0||bout.stats.bestChain>=3):0;}
  function recordKey(i){return level+':'+i;}
  function offerings(){
    get('tag').textContent=selected[lang];get('chooseMask').textContent=t('mask');get('levelLabel').textContent=t('difficulty');
    get('posterArt').src=selected.img;get('posterArt').alt=selected.name;get('signature').textContent=selected.name;
    get('explain').textContent=t('explain');get('level').value=level;Array.from(get('level').options).forEach((o,i)=>o.textContent=t('levels')[i]);
    get('continueTour').hidden=!checkpoint;if(checkpoint)get('continueTour').textContent=t('continue')+' · '+(checkpoint.round+1)+'/5';
    Array.from(get('maskPick').children).forEach((b,i)=>{b.setAttribute('aria-pressed',String(masks[i]===selected));b.setAttribute('aria-label',masks[i].name);});
  }
  function maskPicker(){for(const m of masks){const b=document.createElement('button'),img=document.createElement('img');b.className='maskChoice';img.src=m.img;img.alt='';b.append(img,document.createTextNode(m.short));b.onclick=()=>selectMask(m.id);get('maskPick').append(b);}}
  function drawCards(){
    const root=get('lineup');root.replaceChildren();
    rivals.forEach((name,i)=>{const card=document.createElement('button');card.className='rivalCard';card.style.setProperty('--color',hues[i]);card.style.setProperty('--wash',wash[i]);const c=document.createElement('canvas');c.width=145;c.height=145;const d=document.createElement('div'),s=document.createElement('strong'),p=document.createElement('small');s.textContent=name;p.textContent=places[i];d.append(s,p);const rec=records[recordKey(i)];if(rec?.stars){const best=document.createElement('em');best.textContent='★'.repeat(rec.stars)+' · '+rec.points;d.append(best);}card.append(c,d);card.onclick=()=>{tour=false;launch(i);};card.setAttribute('aria-label',t('exhibition')+' · '+name+', '+places[i]);root.append(card);window.drawLuchador(c.getContext('2d'),{id:rivalIds[i],x:76,y:314,scale:2.65,pose:'idle',face:1,time:i});});
  }
  function labels(){
    document.documentElement.lang=lang==='es'?'es-MX':'en';get('lang').textContent=lang==='en'?'ES':'EN';get('lang').setAttribute('aria-label',lang==='en'?'Cambiar a español':'Switch to English');get('sound').textContent=t('sound')+' '+t(sound?'on':'off');get('sound').setAttribute('aria-pressed',String(sound));get('sound').setAttribute('aria-label',get('sound').textContent);
    for(const [id,key] of Object.entries({start:'start',help:'help',cardtitle:'card',helpTitle:'helpTitle',closeHelp:'ok',you:'you',oQuit:'back',pause:'pause'}))get(id).textContent=t(key);
    get('career').textContent=belts?t('belt')+' · '+belts:'';
    const rules=t('rules').map(pair=>pair.slice());rules[2][1]=t('ruleRope');rules.splice(2,0,[lang==='en'?'Combos & reversals':'Combos y contraataques',t('ruleCombo')]);get('ruleList').replaceChildren(...rules.map(([name,txt])=>{const p=document.createElement('p'),b=document.createElement('b');b.textContent=name+'. ';p.append(b,txt);return p;}));
    uiStamp='';if(active){get('stage').textContent=tour?t('bout')+' '+(bout.round+1)+' / 5':t('exhibition');if(paused||bout.mode==='end')showOverlay();setHUD();}
    else{offerings();drawCards();}
  }
  get('level').onchange=()=>{level=get('level').value;persist('level',level);drawCards();};
  get('sound').onclick=()=>{sound=!sound;persist('sound',sound?'1':'0');audio.setEnabled(sound);audio.unlock();labels();};
  get('lang').onclick=()=>{lang=lang==='en'?'es':'en';persist('lang',lang);labels();};
  get('help').onclick=()=>get('rules').showModal();get('closeHelp').onclick=()=>get('rules').close();
  function clearInputs(){inputs.clear();for(const b of Object.values(buttons))b.classList.remove('pressed');}
  function banner(text,secs){get('announce').textContent=text;announceUntil=bout.time+secs;}
  function hint(key,secs=1.4){tipKey=key;tipUntil=bout.time+secs;}
  function sparks(x,y,col,n){for(let i=0;i<n;i++){const a=Math.PI*2*(i/n)+Math.random()*.45,sp=34+Math.random()*120;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-22,life:.24+Math.random()*.26,col});}}
  function onEvent(ev,arg){
    if(ev==='bell'||ev==='kickout')audio.scene('fight',bout.round);
    else if(ev==='pin')audio.scene('pin',bout.round);
    else if(ev==='end')audio.scene('finished',bout.round);
    audio.event(ev,arg);
    switch(ev){
      case 'bell':banner('¡Lucha!',.84);break;
      case 'impact':{const heavy=arg.kind!=='strike';shake=reduced?0:heavy?6:2;sparks(arg.def.x,252,heavy?'#ffc23e':'#fff5b6',heavy?17:9);break;}
      case 'land':shake=reduced?0:6;sparks(arg.x,350,'#fbe3a0',19);break;
      case 'block':sparks(arg.x+arg.face*22,249,'#9afbe9',8);banner(t('counter'),.38);break;
      case 'counter':sparks(arg.x+arg.face*17,252,'#72ffdf',18);banner(t('reversal'),.68);break;
      case 'air':if(arg===bout.hero)banner('¡'+selected.finisher+'!',.8);break;
      case 'spring':banner('¡'+t('spring')+'!',.6);break;
      case 'chain':hint('chain',1.8);break;
      case 'combo':banner('¡'+t('combo')+' ×'+arg+'!',.85);break;
      case 'down':hint(arg?'youDown':'down',2);break;
      case 'hint':hint(arg);break;
      case 'pin':banner(t('ref'),.84);break;
      case 'count':banner(['','¡Uno!','¡Dos!','¡Tres!'][arg],.85);break;
      case 'kickout':banner(t('escape'),.8);break;
      case 'end':{
        won=arg;if(won){const key=recordKey(bout.round),prior=records[key]||{};records[key]={points:Math.max(prior.points||0,bout.stats.points),stars:Math.max(prior.stars||0,stars())};persist('records2',JSON.stringify(records));
          if(tour){if(bout.round===4){belts++;persist('belts',String(belts));markRound(0);}else markRound(bout.round+1);}}
        clearInputs();setHUD();showOverlay();break;}
    }
  }
  function launch(round){
    audio.unlock();audio.scene('intro',round);cancelAnimationFrame(raf);bout=new LuchaBout(round,onEvent,Math.random,{hero:selected.id,level});
    active=true;paused=false;won=false;particles=[];ghosts=[];ghostTime=0;shake=0;clearInputs();buffer=0;previous=0;uiStamp='';tipKey='';tipUntil=0;get('home').hidden=true;get('match').hidden=false;get('battleOverlay').hidden=true;get('announce').textContent='';document.body.classList.add('ingame');get('yourName').textContent=selected.name;get('rival').textContent=rivals[round];get('venue').textContent=places[round];labels();window.scrollTo(0,0);setHUD();draw();raf=requestAnimationFrame(frame);
  }
  function showHome(){active=false;audio.scene('home');cancelAnimationFrame(raf);clearInputs();get('home').hidden=false;get('match').hidden=true;document.body.classList.remove('ingame');labels();get('start').focus({preventScroll:true});}
  function showOverlay(){
    const champion=won&&tour&&bout.round===4;get('battleOverlay').hidden=false;get('trophy').hidden=paused||!champion;
    get('overline').textContent=places[bout.round].toUpperCase()+(paused?'':'  ·  1 / 2 / 3');
    get('oTitle').textContent=(champion&&!paused&&selected.id===4?'¡Campeona!':t(paused?'paused':won?(champion?'champ':'win'):'lost'));get('oText').textContent=paused?t('pausedText'):won?selected.name+' '+t(champion?'champion':'youWin'):t('lostText');
    get('scoreline').hidden=paused;get('scoreline').textContent=(won?'★'.repeat(stars())+'  ·  ':'')+bout.stats.points+' '+t('points')+'  ·  '+bout.stats.hits+' '+t('hits');
    get('oAction').textContent=t(paused?'resume':!won?'retry':!tour?'replay':champion?'again':'next');get('oQuit').textContent=t('back');get('oAction').focus({preventScroll:true});
  }
  function togglePause(){if(!active||bout.mode==='end')return;clearInputs();paused=!paused;audio.scene(paused?'pause':bout.mode==='pin'?'pin':bout.mode==='intro'?'intro':'fight',bout.round);if(paused)showOverlay();else{get('battleOverlay').hidden=true;previous=0;}}
  get('pause').onclick=togglePause;get('oQuit').onclick=showHome;get('oAction').onclick=()=>{if(paused)togglePause();else launch(won&&tour?(bout.round+1)%5:bout.round);};
  get('continueTour').onclick=()=>{if(!checkpoint)return;const cp=checkpoint;selected=masks.find(m=>m.id===cp.mask);level=cp.level;tour=true;launch(cp.round);};
  get('start').onclick=()=>{tour=true;markRound(0);launch(0);};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused&&bout.mode!=='end')togglePause();});window.addEventListener('blur',()=>{clearInputs();if(active&&!paused&&bout.mode!=='end')togglePause();});
  function press(id,key){
    if(!active||paused||bout.mode==='end')return;
    inputs.set(id,key);buttons[key].classList.add('pressed');
    if(['strike','throw','dive'].includes(key))bout.action(key);
  }
  function release(id){const k=inputs.get(id);inputs.delete(id);if(k&&![...inputs.values()].includes(k))buttons[k].classList.remove('pressed');}
  document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;buttons[k]=b;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(e.pointerId,k);});
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>release(e.pointerId));
    b.addEventListener('contextmenu',e=>e.preventDefault());b.addEventListener('click',e=>{if(e.detail===0){press('access',k);release('access');}});
  });
  const keys={ArrowLeft:'left',ArrowRight:'right',KeyA:'left',KeyD:'right',KeyZ:'guard',KeyX:'strike',KeyC:'throw',KeyV:'dive'};
  window.addEventListener('keydown',e=>{if(!active)return;if(e.code==='Escape'&&!e.repeat){togglePause();return;}if(keys[e.code]&&!paused&&bout.mode!=='end'){e.preventDefault();if(!e.repeat)press(e.code,keys[e.code]);}});
  window.addEventListener('keyup',e=>release(e.code));
  function setHUD(){
    const h=bout.hero,r=bout.rival,p=bout.pin,pinned=p&&p.def===h;
    const isDown=r.state==='down'&&bout.mode==='fight';
    const tip=pinned?(bout.escapes<2?t('tap')+' · '+p.taps+' / '+p.needed:t('escapesUsed')):p?t('pinTip'):isDown?t('down'):tipUntil>bout.time?t(tipKey):bout.energy>=100?t('ready'):t('defaultTip');
    const canSpring=bout.springReady()&&bout.energy<100;const chain=bout.time<bout.chainUntil?bout.streak:0;const stamp=[h.hp,r.hp,bout.energy,isDown,!!pinned,canSpring,chain,bout.stats.points,tip,lang].join('|');if(uiStamp===stamp)return;uiStamp=stamp;
    get('points').textContent=t('points')+'  '+bout.stats.points;get('comboInfo').textContent=chain>0?'×'+chain+'  '+t('hits'):selected.finisher;get('php').style.width=h.hp+'%';get('ehp').style.width=r.hp+'%';get('charge').style.width=bout.energy+'%';get('tip').textContent=tip;
    for(const k of ['guard','strike','throw','dive']){const label=t(k==='strike'&&pinned?'kick':k==='throw'&&isDown?'pin':k==='dive'&&canSpring?'rope':k);buttons[k].querySelector('b').textContent=label;buttons[k].setAttribute('aria-label',label);}
    buttons.dive.classList.toggle('ready',bout.energy>=100||canSpring);buttons.throw.classList.toggle('ready',isDown);buttons.strike.classList.toggle('ready',!!pinned);
  }
  function draw(){
    const h=bout.hero,r=bout.rival, time=bout.time,aspect={time,round:bout.round,motion:!reduced};
    ctx.save();if(shake>.2)ctx.translate(Math.sin(time*97)*shake,Math.cos(time*103)*shake*.55);
    window.drawArena(ctx,aspect);
    const midpoint=(h.x+r.x)/2,refX=bout.pin?Math.max(90,Math.min(710,bout.pin.def.x-76)):400+Math.sin(time*.61)*50+(midpoint-400)*.18;
    window.drawReferee(ctx,{x:refX,y:bout.pin?333:283,count:bout.pin?.count||0,time,pinning:!!bout.pin,motion:!reduced});
    for(const g of ghosts){ctx.save();ctx.globalAlpha=g.life*.6;window.drawLuchador(ctx,g);ctx.restore();}
    for(const f of [r,h]){ctx.fillStyle='#192d3540';ctx.beginPath();ctx.ellipse(f.x,352,Math.max(17,40-f.height*.19),7,0,0,Math.PI*2);ctx.fill();}
    let fighters=bout.pin?[bout.pin.def,bout.pin.atk]:[r,h];if(bout.toss)fighters=[bout.toss.atk,bout.toss.def];
    fighters.forEach(f=>{const pose=f.state,scale=f.id===3||f.id===7?1.49:f.id===4?1.26:1.36;
      const phase=f.duration?Math.min(1,f.elapsed/f.duration):f.state==='walk'?(f.steps*3)%1:0;
      if(!reduced&&f===h&&['spring','dive'].includes(pose)&&time>ghostTime){
        ghosts.push({id:f.id,x:f.x,y:350-f.height,face:f.face,scale,pose,phase,time,life:.22});ghostTime=time+.08;
      }
      ctx.save();ctx.translate(f.x,350-f.height);if(f.angle){ctx.translate(0,-55);ctx.rotate(f.angle);ctx.translate(0,55);}
      window.drawLuchador(ctx,{x:0,y:0,scale,face:f.face,id:f.id,pose,phase,time});ctx.restore();});
    window.drawForeRopes(ctx,aspect);
    if(bout.wind){const text=t({strike:'warnStrike',throw:'warnThrow',dive:'warnDive',charge:'rush'}[bout.wind.kind]);ctx.save();ctx.font='bold 16px system-ui';const w=ctx.measureText(text).width+20,x=Math.max(w/2,Math.min(800-w/2,r.x));ctx.fillStyle='#702e2b';ctx.fillRect(x-w/2,164,w,25);ctx.fillStyle='#ffe9a5';ctx.textAlign='center';ctx.fillText(text,x,182);ctx.restore();}
    for(const p of particles){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.life*5);ctx.globalAlpha=Math.min(1,p.life*5);ctx.fillStyle=p.col;ctx.fillRect(-3,-1.7,7,3.5);ctx.restore();}
    if(bout.mode==='intro'){ctx.save();ctx.fillStyle='#17262acd';ctx.fillRect(0,164,800,76);ctx.textAlign='center';ctx.fillStyle='#ffd173';ctx.font='900 17px system-ui';ctx.fillText(tour?t('bout').toUpperCase()+' '+(bout.round+1)+' / 5':t('exhibition').toUpperCase(),400,190);ctx.fillStyle='#fff1c5';ctx.font='italic bold 31px Georgia';ctx.fillText(selected.name+'  vs.  '+rivals[bout.round],400,222);ctx.restore();}
    ctx.restore();
  }
  function frame(now){if(!active)return;const elapsed=previous?Math.min(.075,(now-previous)/1000):0;previous=now;
    if(!paused&&bout.mode!=='end'){buffer+=elapsed;const held={};for(const i of inputs.values())held[i]=true;
      while(buffer>=1/60){bout.update(1/60,held);buffer-=1/60;}
      for(const g of ghosts)g.life-=elapsed;ghosts=ghosts.filter(g=>g.life>0);
      for(const p of particles){p.life-=elapsed;p.x+=p.vx*elapsed;p.y+=p.vy*elapsed;p.vy+=145*elapsed;}particles=particles.filter(p=>p.life>0);shake*=Math.exp(-elapsed*13);
      if(bout.time>announceUntil&&get('announce').textContent)get('announce').textContent='';setHUD();draw();
    }else if(!paused&&bout.mode==='end'){draw();return;}
    raf=requestAnimationFrame(frame);
  }
  function drawBelt(){
    const c=get('trophy').getContext('2d');
    const polygon=(pts,fill,stroke)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}};
    polygon([[4,26],[46,22],[72,18],[92,10],[148,10],[167,18],[195,22],[236,26],[236,53],[193,54],[166,59],[147,67],[93,67],[71,58],[45,54],[4,52]],'#473b37','#192d30');
    for(const x of [47,193]){polygon([[x-12,30],[x,25],[x+12,30],[x+12,48],[x,52],[x-12,47]],'#efa842','#6b482b');}
    const plate=(w,h,color)=>polygon([[120,38-h],[120+w*.69,38-h*.81],[120+w,38-h*.4],[120+w*.96,38+h*.52],[120+w*.55,38+h*.85],[120,38+h],[120-w*.55,38+h*.85],[120-w*.96,38+h*.52],[120-w,38-h*.4],[120-w*.69,38-h*.81]],color,'#73512f');
    plate(45,34,'#efbb57');plate(35,26,'#ffe29b');plate(26,19,'#226a61');
    polygon([[125,19],[106,40],[117,40],[113,54],[134,32],[123,32]],'#ffdb6a');
    for(const x of [12,21,29,211,219,228]){c.fillStyle='#d4a966';c.beginPath();c.arc(x,38,2.2,0,Math.PI*2);c.fill();}
  }
  drawBelt();maskPicker();labels();
})();
