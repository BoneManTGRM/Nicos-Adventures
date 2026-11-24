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
  return {region:trails.some(t=>t.id===raw?.region)?raw.region:"forest",steady:typeof raw?.steady==="boolean"?raw.steady:null,records};
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
  const markers=[],world=el("section","trail-hunt"),banner=el("header","trail-head");
  const title=el("h2");title.id="modalTitle";
  const lang=button("",()=>{changeLanguage();render();},"trail-lang");banner.append(title,lang);
  const nav=el("div","trail-areas"),stage=el("div","trail-stage"),panel=el("div","trail-panel");
  const message=el("p","trail-message");message.setAttribute("role","status");
  root.append(world);world.append(banner,nav,stage,panel,message);
  let actor,ring,prompt,markerList,cast;
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
  function journal(){
   const ledger=el("details","trail-journal"),counts=Object.keys(data.records).length;
   ledger.append(el("summary","",tr("Trophy journal","Diario de trofeos")+" · "+counts+"/9"));
   const rows=el("div","trail-records");
   animals.forEach(([id],i)=>{
    const row=el("div","trail-record"),r=data.records[id];row.append(sprite(i),el("strong","",name(i)),el("span","",r?tr("Tags","Marcas")+" "+r.count+" · "+tr("Best","Récord")+" "+r.best+"/100":tr("Undiscovered","Por descubrir")));rows.append(row);
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
   const actions=el("div","trail-actions"),start=button(tr("Track ","Rastrear a ")+name(target),begin,"trail-main");
   start.disabled=!unlocked(target,data.records);
   const label=el("label","trail-easy"),check=document.createElement("input");check.type="checkbox";check.checked=steady();check.disabled=reduced;
   check.onchange=()=>{data.steady=check.checked;persist();};label.append(check,document.createTextNode(tr("Relaxed timing","Sin prisa")));
   actions.append(start,label);panel.append(choices,actions,journal());
   if(start.disabled)note("Tag both other animals in this habitat to unlock its legend.","Marca a los otros dos animales de este hábitat para desbloquear su leyenda.");
  }
  function choicesFocus(i){world.querySelector('[data-target="'+animals[i][0]+'"]')?.focus({preventScroll:true});}
  function begin(){sequence=makeTrail(target);step=0;errors=0;throws=0;moveTo("watch");}
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
   actions.append(replay,button(tr("Leave hunt","Salir de la cacería"),()=>moveTo("lodge"),"trail-sub"));
   panel.append(el("h3","",tr("Track ","Rastrear a ")+name(target)),markerList,actions);
   markerList.textContent=phase==="watch"?tr("Remember the order of the glowing marks.","Recuerda el orden de las marcas luminosas."):tr("Tap the marks in the same order.","Toca las marcas en el mismo orden.")+" "+step+"/"+sequence.length;
   if(steady())markerList.textContent+="  "+sequence.map(s=>trails[region].marks[s][0]+" "+pick(trails[region].marks[s].slice(1))).join(" · ");
  }
  function choose(i){
   if(phase!=="track")return;
   if(i!==sequence[step]){errors++;rerun();note("A different trail. Watch the marks once more.","Es otro rastro. Observa las marcas otra vez.");return;}
   beep([490+step*100],.045);step++;
   if(step===sequence.length){animalX=steady()?.5:.13;direction=1;moveTo("chase");cast.focus({preventScroll:true});return;}
   markerList.textContent=tr("Tracks found","Huellas encontradas")+" · "+step+"/"+sequence.length;
   if(steady())markerList.textContent+=" · "+sequence.slice(step).map(s=>pick(trails[region].marks[s].slice(1))).join(" · ");
   message.textContent=pick(trails[region].marks[i].slice(1))+" ✓";
  }
  function chase(){
   badge(regionLabel());ring=el("div","trail-ring");ring.setAttribute("aria-hidden","true");stage.append(ring);
   actor=subject(target,"trail-runner");position();
   // The final clue click bubbles after its marker has been replaced by the encounter.
   stage.onclick=event=>{if(stage.contains(event.target))throwNet();};
   panel.append(el("h3","",name(target)),el("p","trail-cue",tr("Cast when the animal crosses the golden ring.","Lanza cuando el animal cruce el aro dorado.")));
   const actions=el("div","trail-actions");cast=button(tr("Cast star net","Lanzar red estelar"),throwNet,"trail-main");
   actions.append(cast,button(tr("Leave hunt","Salir de la cacería"),()=>moveTo("lodge"),"trail-sub"));panel.append(actions);
  }
  function position(){
   actor.style.left=(animalX*100)+"%";
   actor.style.setProperty("--face",direction);
   actor.style.setProperty("--hop",steady()?"0px":(-3*Math.abs(Math.sin(elapsed/115)))+"px");
   ring.classList.toggle("in-range",Math.abs(animalX-.5)<=radius());
  }
  function radius(){return .135-(target%3)*.018;}
  function throwNet(){
   if(phase!=="chase")return;
   const distance=Math.abs(animalX-.5);throws++;
   if(distance>radius()){
    beep([242,189],.05);
    if(throws>=3){moveTo("escaped");return;}
    note("The net missed. Cast again on the next pass.","La red cayó fuera. Lanza otra vez en la siguiente vuelta.");
    return;
   }
   phase="landed";finishDelay=450;cast.disabled=true;stage.onclick=null;stage.classList.add("trail-netted");
   score=Math.max(10,100-Math.round(22*distance/radius())-5*errors-8*(throws-1));
   wasBest=record(data.records,animals[target][0],score);stored=persist();beep([540,716,908],.065);
  }
  function result(){
   badge(regionLabel());subject(target,"trail-preview");const caption=el("div","trail-caption");stage.append(caption);
   caption.append(el("span","",phase==="reward"?tr("Tagged & released","Marcado y liberado"):tr("Trail lost","Rastro perdido")),el("h3","",name(target)));
   if(phase==="reward"){
    const r=data.records[animals[target][0]];panel.append(el("h3","",wasBest?tr("Personal best","Récord personal"):tr("Hunt complete","Cacería completada")),el("p","trail-cue",tr("Score","Puntos")+" "+score+"/100 · "+tr("Best","Récord")+" "+r.best+"/100"));
    if(target%3<2&&r.count===1&&unlocked(region*3+2,data.records))note("Legend unlocked: "+name(region*3+2),"Leyenda desbloqueada: "+name(region*3+2));
    if(!stored)note("Your trophy is here for this session. Check device storage to save it.","El trofeo está disponible en esta sesión. Revisa el almacenamiento para guardarlo.");
   }else panel.append(el("p","trail-cue",tr("The animal slipped away. You can follow a fresh trail.","El animal se escapó. Puedes seguir un rastro nuevo.")));
   const actions=el("div","trail-actions");actions.append(button(tr("Choose a hunt","Elegir cacería"),()=>moveTo("lodge"),"trail-main"),button(tr("Track again","Volver a rastrear"),begin,"trail-sub"));panel.append(actions,journal());
  }
  function render(){
   title.textContent=tr("Starfall Hunting","Cacería estelar");lang.textContent=tr("ES","EN");lang.setAttribute("aria-label",tr("Cambiar a español","Switch to English"));
   nav.replaceChildren();stage.replaceChildren();panel.replaceChildren();message.textContent="";stage.onclick=null;stage.className="trail-stage";world.dataset.phase=phase;landscape();
   if(phase==="lodge")lodge();else if(phase==="watch"||phase==="track")track();else if(phase==="chase"||phase==="landed"){chase();if(phase==="landed"){cast.disabled=true;stage.classList.add("trail-netted");}}else result();
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
    const angle=elapsed/(1050-120*(target%3));animalX=.50-.38*Math.cos(angle);direction=Math.sin(angle)>=0?1:-1;position();
   }else if(phase==="landed"&&(finishDelay-=dt)<=0){moveTo("reward");panel.querySelector("button")?.focus({preventScroll:true});}
  };
 }
 return {trails,animals,clean,unlocked,makeTrail,record,open};
})();
