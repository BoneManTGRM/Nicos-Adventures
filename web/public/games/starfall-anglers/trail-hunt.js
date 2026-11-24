"use strict";
const TrailHunt=(()=>{
 const trails=[
  {id:"forest",name:["Firefly Pines","Pinar de luciérnagas"],marks:[["❧","Leaf","Hoja"],["☾","Moon","Luna"],["✦","Star","Estrella"]]},
  {id:"alpine",name:["Aurora Ridge","Sierra de la aurora"],marks:[["❄","Snowflake","Copo"],["◆","Crystal","Cristal"],["☾","Moon","Luna"]]},
  {id:"canyon",name:["Canyon of the Sun","Cañón del Sol"],marks:[["☀","Sun","Sol"],["✿","Blossom","Flor"],["◆","Crystal","Cristal"]]}
 ];
 const animals=[
  ["fox","Red Fox","Zorro rojo"],["deer","Roe Deer","Corzo"],["moonstag","Moon Stag","Ciervo lunar"],
  ["hare","Snow Hare","Liebre de nieve"],["wolf","Gray Wolf","Lobo gris"],["lynx","Aurora Lynx","Lince de la aurora"],
  ["armadillo","Armadillo","Armadillo"],["roadrunner","Roadrunner","Correcaminos"],["sunjaguar","Sun Jaguar","Jaguar del sol"]
 ];
 function clean(raw){
  const records={};
  for(const [id] of animals){
   const old=raw?.records?.[id];
   if(Number.isSafeInteger(old?.count)&&old.count>0&&Number.isInteger(old.best)&&old.best>=0&&old.best<=100){
    records[id]={count:Math.min(1000000,old.count),best:old.best};
   }
  }
  const gift=TrailField.gifts.some(g=>g.id===raw?.gift&&records[g.id])?raw.gift:null;
  return {gift,rally:TrailField.cleanRally(raw?.rally),region:trails.some(t=>t.id===raw?.region)?raw.region:"forest",steady:typeof raw?.steady==="boolean"?raw.steady:null,records};
 }
 function unlocked(index,records){
  return index%3!==2||animals.slice(index-2,index).every(([id])=>records[id]);
 }
 function makeTrail(index,random=Math.random){
  const sequence=[];
  for(let step=0;step<2+index%3;step++){
   const previous=sequence[step-1];
   const choices=[0,1,2].filter(mark=>mark!==previous);
   sequence.push(choices[Math.floor(random()*choices.length)]);
  }
  return sequence;
 }
 function record(records,id,score){
  const old=records[id];
  records[id]={count:Math.min(1000000,(old?.count||0)+1),best:Math.max(score,old?.best||0)};
  return !old||score>old.best;
 }
 function open({root,data,pick,el,button,persist,beep,reduced,calm,changeLanguage}){
  const tr=(en,es)=>pick([en,es]);
  const name=i=>pick(animals[i].slice(1));
  let region=trails.findIndex(trail=>trail.id===data.region);
  let target=region*3,phase="lodge",sequence=[],step=0,errors=0,throws=0;
  let elapsed=0,last=null,lit=-1,animalX=.50,wasBest=false,score=0,stored=true,finishDelay=0,direction=1;
  let aim=.5,motionTime=0,pose=null,scout=null,fromScout=false,slowLeft=0,usedGift=false,runDay=null;
  let archive=null,journalOpen=false;
  const markers=[],world=el("section","trail-hunt"),banner=el("header","trail-head");
  const title=el("h2");title.id="modalTitle";
  const lang=button("",()=>{changeLanguage();render();},"trail-lang");banner.append(title,lang);
  const nav=el("div","trail-areas"),stage=el("div","trail-stage"),panel=el("div","trail-panel");
  const message=el("p","trail-message");message.setAttribute("role","status");
  root.append(world);world.append(banner,nav,stage,panel,message);
  let actor,ring,prompt,markerList,cast,castsLeft,powerButton;
  const steady=()=>reduced||(data.steady??calm);
  const landscape=()=>{stage.style.backgroundImage='url("assets/trail-'+trails[region].id+'.webp")';};
  function sprite(i){
   const art=el("span","trail-sprite");
   art.style.backgroundPosition=(i%3)*50+"% "+Math.floor(i/3)*50+"%";
   art.setAttribute("aria-hidden","true");return art;
  }
  function note(en,es){message.textContent=tr(en,es);}
  function moveTo(next){phase=next;elapsed=0;last=null;lit=-1;render();}
  function regionMenu(){
   trails.forEach((trail,i)=>{
    const b=button(pick(trail.name),()=>{
     region=i;data.region=trail.id;target=i*3;persist();moveTo("lodge");
    },"trail-region");
    b.setAttribute("aria-pressed",String(i===region));nav.append(b);
   });
  }
  function badge(text){const b=el("span","trail-badge",text);stage.append(b);}
  function subject(i,cls=""){
   const b=el("div","trail-subject "+cls);b.append(sprite(i));stage.append(b);return b;
  }
  function regionLabel(){return pick(trails[region].name);}
  function giftArt(index){
   const art=el("span","trail-gift-art");art.setAttribute("aria-hidden","true");art.style.backgroundPosition=index*50+"% 50%";return art;
  }
  function giftCard(g){
   const i=TrailField.gifts.indexOf(g),owned=!!data.records[g.id],card=el("div","trail-gift-card");
   card.append(giftArt(i));const copy=el("div");copy.append(el("strong","",pick(g.name)),el("p","",pick(g.effect)));
   if(owned){
    const equip=button(data.gift===g.id?tr("Equipped","Equipado"):tr("Equip gift","Equipar don"),()=>{
     data.gift=data.gift===g.id?null:g.id;
     const saved=persist();render();world.querySelector('[data-equip="'+g.id+'"]')?.focus({preventScroll:true});
     if(!saved)note("Gift equipped for this session only.","Don equipado solo para esta sesión.");
    },"trail-sub");
    equip.dataset.equip=g.id;equip.setAttribute("aria-pressed",String(data.gift===g.id));copy.append(equip);
   }else copy.append(el("small","",tr("Earned by tagging ","Se consigue al marcar a ")+name(i*3+2)));
   card.append(copy);return card;
  }
  function collectionTitle(){
   const owned=TrailField.gifts.filter(g=>data.records[g.id]).length;
   return tr("Legendary gifts","Dones legendarios")+" · "+owned+"/3";
  }
  function extras(){
   const gifts=el("details","trail-gifts");
   gifts.open=world.dataset.giftsOpen==="yes";
   gifts.ontoggle=()=>{if(gifts.isConnected)world.dataset.giftsOpen=gifts.open?"yes":"no";};
   gifts.append(el("summary","",collectionTitle()));
   const cards=el("div","trail-gift-grid");TrailField.gifts.forEach(g=>cards.append(giftCard(g)));gifts.append(cards);return gifts;
  }
  function rallyEntry(){
   const rally=data.rally,today=TrailField.dayKey(),done=rally.day===today?rally.scores.length:0;
   const box=el("div","trail-rally"),copy=el("div");
   copy.append(el("strong","",tr("Three-Trail Rally","Rally de los tres senderos")),el("small","",done===3?tr("Today’s score","Puntos de hoy")+" "+rally.scores.reduce((a,b)=>a+b,0)+"/300":tr("Today’s route","Ruta de hoy")+" · "+done+"/3"));
   if(rally.best)copy.append(el("small","",tr("Best rally","Mejor rally")+" "+rally.best+"/300"));
   box.append(copy);
   if(done<3)box.append(button(done?tr("Continue rally","Continuar rally"):tr("Start rally","Empezar rally"),beginRally,"trail-sub"));
   return box;
  }
  function beginRally(){
   const day=TrailField.dayKey(),rally=data.rally;
   if(rally.day!==day){rally.day=day;rally.scores=[];}
   if(rally.scores.length>=3){goLodge();return;}
   runDay=day;target=TrailField.rallyTargets(day)[rally.scores.length];region=Math.floor(target/3);data.region=trails[region].id;persist();startHunt(true);
  }
  function goLodge(){runDay=null;moveTo("lodge");}
  function journal(){
   const ledger=el("details","trail-journal"),counts=Object.keys(data.records).length;
   ledger.open=journalOpen;ledger.ontoggle=()=>{if(ledger.isConnected)journalOpen=ledger.open;};
   ledger.append(el("summary","",tr("Trophy journal","Diario de trofeos")+" · "+counts+"/9"));
   const rows=el("div","trail-records");
   animals.forEach(([id],i)=>{
    const row=el("div","trail-record"),r=data.records[id];row.append(sprite(i),el("strong","",name(i)),el("span","",r?tr("Tags","Marcas")+" "+r.count+" · "+tr("Best","Récord")+" "+r.best+"/100":tr("Undiscovered","Por descubrir")));if(i%3===2&&r){
     const replay=button(tr("View encounter","Ver encuentro"),()=>{archive={id:i,back:phase};moveTo("album");},"trail-sub");
     replay.setAttribute("aria-label",tr("View encounter","Ver encuentro")+" · "+name(i));row.append(replay);
    }
    rows.append(row);
   });
   ledger.append(rows);return ledger;
  }
  function lodge(){
   regionMenu();const caption=el("div","trail-caption");
   caption.append(el("span","",tr("Hunting ground","Terreno de cacería")),el("h3","",regionLabel()));stage.append(caption);
   subject(target,"trail-preview");if(target%3===2)badge(tr("Legendary","Legendario"));
   const choices=el("div","trail-targets");choices.setAttribute("role","group");choices.setAttribute("aria-label",tr("Choose an animal","Elige un animal"));
   for(let i=region*3;i<region*3+3;i++){
    const id=animals[i][0],b=button("",()=>{target=i;render();choicesFocus(i);},"trail-target");
    b.dataset.target=id;b.setAttribute("aria-pressed",String(i===target));b.setAttribute("aria-label",name(i));
    const label=el("span","trail-target-copy");label.append(el("strong","",name(i)),el("small","",!unlocked(i,data.records)?tr("Tag both to unlock","Marca a los otros dos"):data.records[id]?tr("Best","Récord")+" "+data.records[id].best+"/100":i%3===2?tr("Legendary","Legendario"):tr("On the trail","En el sendero")));
    b.append(sprite(i),label);choices.append(b);
   }
   const actions=el("div","trail-actions"),start=button(tr("Track ","Rastrear a ")+name(target),()=>{runDay=null;startHunt(false);},"trail-main");
   start.disabled=!unlocked(target,data.records);
   const label=el("label","trail-easy"),check=document.createElement("input");check.type="checkbox";check.checked=steady();check.disabled=reduced;
   check.onchange=()=>{data.steady=check.checked;persist();};label.append(check,document.createTextNode(tr("Relaxed timing","Sin prisa")));
   const scoutButton=button(tr("Scout with binoculars","Explorar con binoculares"),()=>{runDay=null;startHunt(true);},"trail-sub");
   scoutButton.disabled=start.disabled;
   actions.append(start,scoutButton,label);
   panel.append(choices,el("p","trail-behavior",pick(TrailField.behavior[target])),actions,rallyEntry(),journal(),extras());
   if(start.disabled)note("Tag both other animals in this habitat to unlock its legend.","Marca a los otros dos animales de este hábitat para desbloquear su leyenda.");
  }
  function choicesFocus(i){world.querySelector('[data-target="'+animals[i][0]+'"]')?.focus({preventScroll:true});}
  function startHunt(scouting){
   step=0;errors=0;throws=0;usedGift=false;slowLeft=0;pose=null;fromScout=scouting;
   if(scouting){scout={pan:.5,sights:TrailField.sightings(region)};moveTo("scout");}
   else{sequence=makeTrail(target);moveTo("watch");}
  }
  function startChase(){
   aim=.5;motionTime=0;direction=1;pose=steady()?{x:.5,lift:0,tilt:0,stretch:1}:TrailField.motion(target,0);
   animalX=pose.x;moveTo("chase");cast.focus({preventScroll:true});
  }
  function scoutView(){
   TrailField.binoculars({stage,panel,el,button,sprite,name,tr,scout,target,onLeave:goLodge,onFound:()=>{
    beep([560,780],.05);startChase();
   },onMistake:id=>{
    errors++;message.textContent=id===undefined?tr("The lens is over an empty clearing.","El claro está vacío."):
     tr("You spotted ","Encontraste a ")+name(id)+". "+tr("Keep looking for ","Sigue buscando a ")+name(target)+".";
   }});
  }
  function rerun(){step=0;moveTo("watch");}
  function progress(){return phase==="watch"?tr("Watch the tracks","Observa las huellas"):tr("Repeat the trail","Repite el rastro");}
  function track(){
   badge(regionLabel());prompt=el("div","trail-prompt");prompt.setAttribute("aria-live","polite");stage.append(prompt);
   markers.length=0;
   trails[region].marks.forEach(([icon,en,es],i)=>{
    const b=button("",()=>choose(i),"trail-mark");b.append(el("b","",icon),el("span","",tr(en,es)));b.setAttribute("aria-label",tr(en,es));b.disabled=phase==="watch";
    markers.push(b);stage.append(b);
   });
   prompt.textContent=progress();
   markerList=el("p","trail-sequence");markerList.setAttribute("aria-live","polite");
   const actions=el("div","trail-actions"),replay=button(tr("Show trail again","Ver el rastro otra vez"),rerun,"trail-sub");
   actions.append(replay,button(tr("Leave hunt","Salir de la cacería"),goLodge,"trail-sub"));
   if(data.gift==="moonstag"&&phase==="track"){
    const bell=button(tr("Ring Moon Bell","Tocar campana lunar"),()=>{
     if(usedGift)return;usedGift=true;bell.disabled=true;const next=sequence[step];
     markers[next].classList.add("glow");message.textContent=tr("Next track","Siguiente huella")+" · "+pick(trails[region].marks[next].slice(1));beep([660,820,990],.07);
    },"trail-sub");bell.disabled=usedGift;actions.prepend(bell);
   }
   panel.append(el("h3","",tr("Track ","Rastrear a ")+name(target)),markerList,actions);
   markerList.textContent=phase==="watch"?tr("Remember the order of the glowing marks.","Recuerda el orden de las marcas luminosas."):tr("Tap the marks in the same order.","Toca las marcas en el mismo orden.")+" "+step+"/"+sequence.length;
   if(steady())markerList.textContent+="  "+sequence.map(s=>trails[region].marks[s][0]+" "+pick(trails[region].marks[s].slice(1))).join(" · ");
  }
  function choose(i){
   if(phase!=="track")return;
   markers.forEach(b=>b.classList.remove("glow"));
   if(i!==sequence[step]){errors++;rerun();note("A different trail. Watch the marks once more.","Es otro rastro. Observa las marcas otra vez.");return;}
   beep([490+step*100],.045);step++;
   if(step===sequence.length){startChase();return;}
   markerList.textContent=tr("Tracks found","Huellas encontradas")+" · "+step+"/"+sequence.length;
   if(steady())markerList.textContent+=" · "+sequence.slice(step).map(s=>pick(trails[region].marks[s].slice(1))).join(" · ");
   message.textContent=pick(trails[region].marks[i].slice(1))+" ✓";
  }
  function chase(){
   badge(regionLabel());ring=el("div","trail-ring");ring.setAttribute("aria-hidden","true");stage.append(ring);
   actor=subject(target,"trail-runner");position();
   const placeAim=x=>{aim=TrailField.clamp(x,.08,.92);position();};
   let drag=null;
   stage.onpointerdown=e=>{
    if(phase!=="chase"||!e.isPrimary||e.button!==0)return;
    const r=stage.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,aim};stage.setPointerCapture(e.pointerId);placeAim((e.clientX-r.left)/r.width);
   };
   stage.onpointermove=e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const r=stage.getBoundingClientRect();placeAim((e.clientX-r.left)/r.width);
   };
   stage.onpointerup=e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const tap=Math.abs(drag.x-e.clientX)<7;drag=null;
    if(tap)throwNet();
   };
   stage.onpointercancel=()=>{if(drag){placeAim(drag.aim);drag=null;}};
   panel.append(el("h3","",name(target)),el("p","trail-cue",tr("Tap to cast where you aim, or drag the ring and press Cast. Arrow keys move the ring.","Toca para lanzar donde apuntas, o arrastra el aro y pulsa Lanzar. Las flechas mueven el aro.")));
   const actions=el("div","trail-actions");cast=button(tr("Cast star net","Lanzar red estelar"),throwNet,"trail-main");
   cast.onkeydown=e=>{
    if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
    e.preventDefault();placeAim(aim+(e.key==="ArrowLeft"?-.055:.055));
   };
   actions.append(cast);
   if(data.gift==="lynx"&&!steady()){
    powerButton=button(tr("Slow time","Ralentizar tiempo"),()=>{
     if(usedGift||phase!=="chase")return;
     usedGift=true;slowLeft=4000;powerButton.disabled=true;stage.classList.add("trail-frozen");beep([880,660,440],.07);
    },"trail-sub");powerButton.disabled=usedGift;actions.append(powerButton);
   }
   actions.append(button(tr("Leave hunt","Salir de la cacería"),goLodge,"trail-sub"));panel.append(actions);
   castsLeft=el("span","trail-casts");stage.append(castsLeft);showCasts();
  }
  function showCasts(){castsLeft.textContent=tr("Casts","Lances")+" · "+(3-throws)+"/3";}
  function position(){
   actor.style.left=(animalX*100)+"%";actor.style.setProperty("--face",direction);
   actor.style.setProperty("--hop",(-pose.lift)+"px");actor.style.setProperty("--tilt",pose.tilt+"deg");
   actor.style.setProperty("--stretch",pose.stretch);actor.dataset.species=animals[target][0];
   ring.style.left=aim*100+"%";ring.style.width=radius()*200+"%";
   stage.style.setProperty("--net-x",aim*100+"%");
   ring.classList.toggle("in-range",Math.abs(animalX-aim)<=radius());
   ring.classList.toggle("sunweave",data.gift==="sunjaguar");
   stage.classList.toggle("trail-frozen",slowLeft>0);
  }
  function radius(){return (.135-(target%3)*.018)*(data.gift==="sunjaguar"?1.5:1);}
  function throwNet(){
   if(phase!=="chase")return;
   const distance=Math.abs(animalX-aim);throws++;showCasts();
   if(distance>radius()){
    beep([242,189],.05);
    if(throws>=3){moveTo("escaped");return;}
    const ripple=el("i","trail-miss");ripple.style.left=aim*100+"%";stage.append(ripple);
    note("The net missed. Move the ring or wait for another pass.","La red cayó fuera. Mueve el aro o espera otra vuelta.");
    return;
   }
   phase="landed";world.dataset.phase="landed";finishDelay=target%3===2&&!reduced?950:450;cast.disabled=true;stage.onclick=null;stage.classList.add("trail-netted");
   score=Math.max(10,100-Math.round(22*distance/radius())-5*errors-8*(throws-1));
   wasBest=record(data.records,animals[target][0],score);
   if(runDay)TrailField.advanceRally(data.rally,runDay,target,score);
   stored=persist();beep([540,716,908],.065);
  }
  function encounterCard(index){
   stage.classList.add("trail-postcard","trail-postcard-"+animals[index][0]);
   stage.style.backgroundImage='url("assets/trail-card-'+animals[index][0]+'.webp")';
  }
  function album(){
   const i=archive.id,g=TrailField.gifts[Math.floor(i/3)];encounterCard(i);
   const caption=el("div","trail-caption");caption.append(el("span","",tr("Legendary encounter","Encuentro legendario")),el("h3","",name(i)));stage.append(caption);
   panel.append(giftCard(g),button(tr("Back to journal","Volver al diario"),()=>{const back=archive.back;archive=null;journalOpen=true;moveTo(back);world.querySelector(".trail-journal summary")?.focus({preventScroll:true});},"trail-sub"));
  }
  function result(){
   const legendary=target%3===2&&phase==="reward";
   if(legendary)encounterCard(target);else subject(target,"trail-preview");
   badge(regionLabel());const caption=el("div","trail-caption");stage.append(caption);
   caption.append(el("span","",phase==="reward"?tr("Tagged & released","Marcado y liberado"):tr("Trail lost","Rastro perdido")),el("h3","",name(target)));
   if(phase==="reward"){
    const r=data.records[animals[target][0]];panel.append(el("h3","",wasBest?tr("Personal best","Récord personal"):tr("Hunt complete","Cacería completada")),el("p","trail-cue",tr("Score","Puntos")+" "+score+"/100 · "+tr("Best","Récord")+" "+r.best+"/100"));
    if(legendary)panel.append(giftCard(TrailField.gifts[region]));
    if(runDay){
     const route=data.rally;
     panel.append(el("p","trail-rally-score",tr("Three-Trail Rally","Rally de los tres senderos")+" · "+route.scores.length+"/3 · "+route.scores.reduce((sum,n)=>sum+n,0)+"/300"));
    }
    if(target%3<2&&r.count===1&&unlocked(region*3+2,data.records))note("Legend unlocked: "+name(region*3+2),"Leyenda desbloqueada: "+name(region*3+2));
    if(!stored)note("Your trophy is here for this session. Check device storage to save it.","El trofeo está disponible en esta sesión. Revisa el almacenamiento para guardarlo.");
   }else panel.append(el("p","trail-cue",tr("The animal slipped away. You can follow a fresh trail.","El animal se escapó. Puedes seguir un rastro nuevo.")));
   const actions=el("div","trail-actions");
   if(phase==="reward"&&runDay&&data.rally.scores.length<3)actions.append(button(tr("Next rally stop","Siguiente parada"),beginRally,"trail-main"));
   actions.append(button(tr("Choose a hunt","Elegir cacería"),goLodge,"trail-main"),button(tr("Track again","Volver a rastrear"),()=>{if(phase==="reward")runDay=null;startHunt(fromScout);},"trail-sub"));panel.append(actions,journal());
  }
  function render(){
   title.textContent=tr("Starfall Hunting","Cacería estelar");lang.textContent=tr("ES","EN");lang.setAttribute("aria-label",tr("Cambiar a español","Switch to English"));
   nav.replaceChildren();stage.replaceChildren();panel.replaceChildren();message.textContent="";stage.onclick=null;
   stage.onpointerdown=stage.onpointerup=stage.onpointermove=stage.onpointercancel=null;
   stage.className="trail-stage";stage.dataset.region=trails[region].id;world.dataset.phase=phase;landscape();
   if(phase==="lodge")lodge();else if(phase==="album")album();else if(phase==="scout")scoutView();else if(phase==="watch"||phase==="track")track();else if(phase==="chase"||phase==="landed"){chase();if(phase==="landed"){cast.disabled=true;stage.classList.add("trail-netted");}}else result();
  }
  render();
  return now=>{
   const dt=last===null?0:Math.min(100,Math.max(0,now-last));last=now;elapsed+=dt;
   if(phase==="watch"){
    const index=Math.floor((elapsed-420)/780);
    if(index>=sequence.length){moveTo("track");markers[0].focus({preventScroll:true});return;}
    const active=index>=0&&(elapsed-420)%780<570?index:-1;
    if(lit!==active){lit=active;markers.forEach((b,i)=>b.classList.toggle("glow",active>=0&&sequence[active]===i));if(active>=0){const mark=trails[region].marks[sequence[active]];prompt.textContent=(active+1)+"/"+sequence.length+" · "+pick(mark.slice(1));beep([380+sequence[active]*120],.04);}}
   }else if(phase==="chase"&&!steady()){
    motionTime+=slowLeft>0?dt*.30:dt;slowLeft=Math.max(0,slowLeft-dt);
    pose=TrailField.motion(target,motionTime);if(Math.abs(pose.x-animalX)>.00001)direction=pose.x>=animalX?1:-1;
    animalX=pose.x;position();
   }else if(phase==="landed"&&(finishDelay-=dt)<=0){moveTo("reward");panel.querySelector("button")?.focus({preventScroll:true});}
  };
 }
 return {trails,animals,clean,unlocked,makeTrail,record,open};
})();
