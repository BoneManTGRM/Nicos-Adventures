import {destinations, ports, shuffle, solvedCircuit, traceCircuit} from './expeditions.mjs';

const el=(tag,cls,text)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
};
const button=(cls,text,act)=>{
  const node=el('button',cls,text);
  node.type='button';node.onclick=act;
  return node;
};

export function expeditionTrial({route,lang,pet,tone,finish,afterClose}) {
  const es=lang==='es-MX', pick=(en,mx)=>es?mx:en, idx=es?1:0, info=destinations[route];
  const dialog=document.getElementById('tripDialog'), timers=new Set();
  const title=el('h2',null,info.game[idx]);title.id='tripTitle';
  const backdrop=el('div','tripBackdrop');backdrop.style.backgroundImage='url('+info.art+')';
  const place=el('span','tripPlace',info.name[idx]);
  const exit=button('tripClose','×',()=>dialog.close());
  exit.setAttribute('aria-label',pick('Leave expedition','Salir de la expedición'));
  backdrop.append(place,exit,title);
  const content=el('div','tripContent'), board=el('div','trialBoard');
  const instruction=el('p','trialInstruction',info.mission[idx]), status=el('p','trialStatus');
  status.setAttribute('aria-live','polite');
  dialog.replaceChildren(backdrop,content);content.append(instruction,board,status);
  dialog.setAttribute('aria-labelledby','tripTitle'); dialog.showModal();
  let active=true, frame=0, done=false;
  function later(fn,ms){
    const timer=setTimeout(()=>{timers.delete(timer);if(active)fn();},ms);
    timers.add(timer);
  }
  function stop(){for(const timer of timers)clearTimeout(timer);timers.clear();cancelAnimationFrame(frame);}
  dialog.onclose=()=>{active=false;stop();dialog.onkeydown=null;afterClose();};
  async function win(){
    if(done||!active)return;
    done=true;stop();
    const reward=await finish();
    if(!active)return;
    board.replaceChildren();instruction.textContent='';
    if(!reward) {
      status.textContent=pick('Wake your friend at home and try again.','Despierta a tu amigo en casa y vuelve a intentarlo.');
    } else {
      tone(784,.18);later(()=>tone(988,.24),140);
      const relic=reward.relic;
      board.append(el('div','treasureMedal',relic ? relic[0] : '◈'),
        el('h3','prizeTitle',relic ? relic[1+idx] : pick('Expedition complete!','¡Expedición completada!')),
        el('p','prizeLore',relic ? relic[3+idx] : pick('Your friend knows this trail by heart.','Tu amigo ya se sabe esta ruta de memoria.')));
      status.textContent=pick('+4 pearls · +3 bond stars','+4 perlas · +3 estrellas');
      if(reward.mastered) board.append(el('p','mastered',pick('All 12 treasures found! Your Aurora Halo is glowing.','¡Encontraste los 12 tesoros! Tu halo de aurora está brillando.')));
    }
    const back=button('goldButton',pick('Back to the map','Volver al mapa'),()=>dialog.close());
    board.append(back);back.focus({preventScroll:true});
  }
  if(route===0) {
    const water=el('div','berryWater'), overlay=el('div','waterLanes');
    water.style.backgroundImage='linear-gradient(#172a4077,#16263a88), url('+info.art+')';
    const swimmer=el('i','tinySwimmer '+pet.color), berry=el('span','driftingBerry','🍓');
    swimmer.setAttribute('aria-hidden','true');berry.setAttribute('aria-hidden','true');
    const controls=el('div','laneControls');
    const names=es?['Izquierda','Centro','Derecha']:['Left','Middle','Right'];
    let lane=1,target=1,score=0,elapsed=0,previous=0,wave=0;
    const lanes=names.map((name,i)=>{
      const b=button('laneButton',name,()=>select(i));
      controls.append(b);
      const strip=button('waterLane','',()=>select(i));strip.tabIndex=-1;strip.setAttribute('aria-label',name);overlay.append(strip);
      return b;
    });
    function select(i){
      lane=Math.max(0,Math.min(2,i));swimmer.style.left=((lane+.5)*100/3)+'%';
      lanes.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===lane)));
    }
    function newWave(){
      wave++;
      target=wave===1?1:(target+1+Math.floor(Math.random()*2))%3;
      berry.style.left=((target+.5)*100/3)+'%';
      elapsed=0;
    }
    function feedback(caught){
      status.textContent=(caught?pick('Nice catch!','¡Buena atrapada!'):pick('Another berry is drifting in.','Viene otra baya.'))+' '+score+'/5';
    }
    function tick(ts){
      if(!active||done)return;
      if(!document.hidden && previous) elapsed+=Math.min(70,ts-previous);
      previous=ts;
      const progress=Math.min(1,elapsed/(wave===1?2600:2200));
      berry.style.top=(9+progress*65)+'%';
      if(progress===1) {
        const caught=lane===target;
        if(caught) {score++;tone(440+score*60);}
        feedback(caught);
        if(score===5){void win();return;}
        newWave();
      }
      frame=requestAnimationFrame(tick);
    }
    dialog.onkeydown=event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
        event.preventDefault();select(lane+(event.key==='ArrowLeft'?-1:1));
      }
    };
    water.append(overlay,swimmer,berry);board.append(water,controls);
    status.textContent=pick('Choose a lane to meet each berry.','Elige un carril para atrapar cada baya.')+' 0/5';
    select(1);newWave();frame=requestAnimationFrame(tick);
  }
  if(route===1) {
    const glyphs=['◆','●','▲'], names=es?['Amatista','Jade','Ámbar']:['Amethyst','Jade','Amber'];
    const notes=[392,523.25,659.25], group=el('div','crystalGroup');
    const pads=names.map((name,i)=>{
      const pad=button('crystal crystal'+i,'',()=>press(i));
      pad.append(el('strong',null,glyphs[i]),el('small',null,name)); group.append(pad);return pad;
    });
    const repeat=button('outlineButton',pick('Hear it again','Repetir melodía'),()=>demo());
    const sequence=[...shuffle([0,1,2]),Math.floor(Math.random()*3)];
    let length=2, index=0, listening=true, playback=0;
    function pulse(i,tag) {
      pads.forEach(b=>b.classList.remove('lit'));pads[i].classList.add('lit');tone(notes[i],.33);
      later(()=>{if(tag===playback)pads[i].classList.remove('lit');},390);
    }
    function demo(){
      const tag=++playback;index=0;listening=true;repeat.disabled=true;
      pads.forEach(b=>{b.disabled=true;b.classList.remove('lit');});
      status.textContent=pick('Watch and listen','Mira y escucha')+' · '+(length-1)+'/3';
      sequence.slice(0,length).forEach((v,i)=>later(()=>{if(tag===playback)pulse(v,tag);},380+i*730));
      later(()=>{if(tag!==playback)return;listening=false;repeat.disabled=false;pads.forEach(b=>b.disabled=false);
        status.textContent=pick('Your turn. Play ','Tu turno. Toca ')+length+pick(' notes.',' notas.');},410+length*730);
    }
    function press(i){
      if(listening||done)return;
      pulse(i,playback);
      if(i!==sequence[index]){
        listening=true;repeat.disabled=true;
        status.textContent=pick('Listen once more. You can try again.','Escucha otra vez. Puedes intentarlo de nuevo.');
        later(demo,850);return;
      }
      index++;
      if(index===length){
        listening=true;repeat.disabled=true;
        if(length===4){void win();return;}
        length++;status.textContent=pick('Beautiful! One more note…','¡Muy bien! Una nota más…');later(demo,700);
      }else status.textContent=pick('Your turn','Tu turno')+' · '+index+'/'+length;
    }
    board.append(group,repeat);demo();
  }
  if(route===2) {
    const deck=shuffle([0,0,1,1,2,2]), symbols=['✶','☽','❖'];
    const names=es?['Sol','Luna','Jade']:['Sun','Moon','Jade'];
    const grid=el('div','shellGrid');let selected=null,locked=false,matched=0;
    const cards=deck.map((value,i)=>{
      const card=button('shellCard','◒',()=>flip(i));card.setAttribute('aria-label',pick('Shell ','Concha ')+(i+1));
      grid.append(card);return card;
    });
    function flip(i){
      const card=cards[i];
      if(locked||card.disabled||selected===i||done)return;
      card.classList.add('revealed');card.textContent=symbols[deck[i]];card.setAttribute('aria-label',names[deck[i]]);tone(450+deck[i]*92);
      if(selected===null){selected=i;return;}
      const first=selected;selected=null;
      if(deck[first]===deck[i]){
        cards[first].disabled=card.disabled=true;matched++;status.textContent=matched+'/3 '+pick('pairs','pares');
        if(matched===3)later(win,380);
      }else {
        locked=true;later(()=>{for(const n of [first,i]){
          cards[n].classList.remove('revealed');cards[n].textContent='◒';cards[n].setAttribute('aria-label',pick('Shell ','Concha ')+(n+1));
        }locked=false;},900);
      }
    }
    board.append(grid);status.textContent='0/3 '+pick('pairs','pares');
  }
  if(route===3) {
    const grid=el('div','circuitGrid');
    const turns=solvedCircuit.map(r=>(r+Math.floor(Math.random()*3)+1)%4);
    const labels=es?['arriba','derecha','abajo','izquierda']:['up','right','down','left'];
    const cells=turns.map((_,i)=>{
      const b=button('skyTile','',()=>{turns[i]=(turns[i]+1)%4;tone(410+i*50);paint();});
      b.append(el('span','wire a'),el('span','wire b'),el('i','hub'));grid.append(b);return b;
    });
    function paint(){
      const {lit,complete}=traceCircuit(turns);
      cells.forEach((b,i)=>{
        b.classList.toggle('powered',lit.includes(i));
        const [a,c]=ports(turns[i]);b.children[0].dataset.dir=a;b.children[1].dataset.dir=c;
        b.setAttribute('aria-label',pick('Tile ','Pieza ')+(i+1)+', '+labels[a]+' + '+labels[c]);
      });
      status.textContent=pick('Moonlight reaches ','La luz llega a ')+lit.length+'/6 '+pick('tiles.','piezas.');
      if(complete){cells.forEach(b=>b.disabled=true);later(win,400);}
    }
    const wrap=el('div','circuitWrap');wrap.append(el('span','source','☽'),grid,el('span','sink','✦'));
    board.append(wrap);paint();
  }
}
