"use strict";
const TrailField=(()=>{
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const gifts=[
  {id:"moonstag",name:["Moon Bell","Campana lunar"],effect:["Ring it to reveal the next track once per hunt.","Hazla sonar para revelar una huella por cacería."]},
  {id:"lynx",name:["Aurora Hourglass","Reloj de aurora"],effect:["Slow the animal for four seconds once per chase.","Ralentiza al animal cuatro segundos, una vez por persecución."]},
  {id:"sunjaguar",name:["Sunweave Net","Red de sol"],effect:["Its golden mesh makes the catching ring wider.","Su malla dorada amplía el aro de captura."]}
 ];
 const behavior=[
  ["Doubles back, then dashes through the pines.","Cambia de rumbo y corre entre los pinos."],
  ["Bounds across the clearing in long, even leaps.","Cruza el claro con saltos largos y regulares."],
  ["Floats across the clearing in the moonlight.","Flota por el claro bajo la luz de la luna."],
  ["Takes three quick hops, then pauses in the snow.","Da tres saltitos y se detiene en la nieve."],
  ["Trots steadily, then slows to look around.","Trota a paso firme y se detiene a mirar."],
  ["Slips through the aurora in short, sudden bursts.","Se desliza bajo la aurora en carreras cortas."],
  ["Shuffles along the canyon floor in little steps.","Recorre el suelo del cañón a pasitos."],
  ["Sprints from shade to shade, stopping between runs.","Corre de sombra en sombra y se detiene entre carreras."],
  ["Crouches low before a sunlit pounce.","Se agacha antes de saltar bajo el sol."]
 ];
 const lap=[5800,6800,6200,5750,6900,5300,7900,4850,5900];
 function motion(index,time){
  const wave=time/lap[index]*Math.PI*2;
  const stride=time/175;
  let path=wave,lift=0,tilt=0,stretch=1;
  switch(index){
   case 0:path+=.54*Math.sin(3*wave);lift=3*Math.abs(Math.sin(stride));tilt=2*Math.sin(stride);break;
   case 1:lift=15*Math.abs(Math.sin(time/380));tilt=5*Math.sin(time/190);break;
   case 2:path+=.12*Math.sin(2*wave);lift=11+7*Math.sin(time/580);tilt=2*Math.sin(time/550);break;
   case 3:path-=.19*Math.sin(4*wave);lift=15*Math.abs(Math.sin(stride))*(.5+.5*Math.cos(2*wave));stretch=1+.042*Math.sin(2*stride);break;
   case 4:path-=.38*Math.sin(2*wave);lift=3*Math.abs(Math.sin(time/215));break;
   case 5:path-=.30*Math.sin(3*wave);lift=6*Math.abs(Math.sin(time/300));tilt=3*Math.sin(stride);break;
   case 6:path-=.09*Math.sin(5*wave);lift=1.7*Math.abs(Math.sin(time/130));tilt=3*Math.sin(time/240);break;
   case 7:path-=.32*Math.sin(3*wave);lift=3*Math.abs(Math.sin(time/100));tilt=4*Math.cos(3*wave);break;
   case 8:path-=.43*Math.sin(2*wave);lift=20*Math.max(0,Math.sin(2*wave))**2;stretch=1+.045*Math.sin(2*wave);tilt=4*Math.sin(4*wave);break;
  }
  return {x:.5-.37*Math.cos(path),lift,tilt,stretch};
 }
 function dayKey(date=new Date()){
  return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
 }
 function rallyTargets(day){
  let seed=0;
  for(const char of day)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
  const start=seed%3;
  return [0,1,2].map((_,i)=>((start+i)%3)*3+((seed>>>(i+4))&1));
 }
 function cleanRally(raw){
  const day=typeof raw?.day==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(raw.day)?raw.day:"";
  const scores=[];
  if(day&&Array.isArray(raw.scores)){
   for(const n of raw.scores.slice(0,3)){if(!Number.isInteger(n)||n<0||n>100)break;scores.push(n);}
  }
  return {day,scores,best:Number.isInteger(raw?.best)?clamp(raw.best,0,300):0};
 }
 function advanceRally(rally,day,target,score){
  if(!Number.isInteger(score)||score<0||score>100||rally.scores.length>=3)return false;
  if(rally.day!==day||rallyTargets(day)[rally.scores.length]!==target)return false;
  rally.scores.push(score);
  if(rally.scores.length===3)rally.best=Math.max(rally.best,rally.scores.reduce((sum,n)=>sum+n,0));
  return true;
 }
 // The clearing is wider than the binoculars. Normalized animal and lens positions
 // stay consistent when a phone rotates or a player uses the keyboard slider.
 const minPan=.22,maxPan=.78,zoom=1/minPan/2;
 function sightings(region,random=Math.random){
  const ids=[region*3,region*3+1,region*3+2];
  for(let i=2;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
  return ids.map((id,i)=>({id,x:.26+i*.24+(random()-.5)*.05}));
 }
 function binoculars({stage,panel,el,button,sprite,name,tr,scout,target,onFound,onMistake,onLeave}){
  const clearing=el("div","trail-panorama"),lens=el("div","trail-lens");lens.setAttribute("aria-hidden","true");
  clearing.style.width=zoom*100+"%";
  for(const sight of scout.sights){
   const animal=el("div","trail-distant");animal.style.left=sight.x*100+"%";animal.append(sprite(sight.id));clearing.append(animal);
  }
  const readout=el("span","trail-lens-readout");
  readout.setAttribute("role","status");
  stage.append(clearing,lens,readout);
  panel.append(el("h3","",tr("Find ","Busca a ")+name(target)),el("p","trail-cue",tr("Sweep the clearing. Center the animal in the binoculars, then identify it.","Explora el claro. Centra al animal en los binoculares y luego identifícalo.")));
  const slider=document.createElement("input");slider.type="range";slider.min="22";slider.max="78";slider.step=".5";
  slider.setAttribute("aria-label",tr("Pan binoculars","Mover binoculares"));slider.className="trail-pan-slider";
  function centered(){return scout.sights.find(s=>Math.abs(scout.pan-s.x)<=.054);}
  function pan(value){
   scout.pan=clamp(value,minPan,maxPan);
   clearing.style.left=(.5-zoom*scout.pan)*100+"%";slider.value=String(100*scout.pan);
   const sight=centered();
   const label=sight?tr("In view · ","A la vista · ")+name(sight.id):tr("Search the clearing","Explora el claro");
   if(readout.textContent!==label){readout.textContent=label;slider.setAttribute("aria-valuetext",label);}
  }
  slider.oninput=()=>pan(Number(slider.value)/100);pan(scout.pan);
  const bar=el("div","trail-actions");
  bar.append(button(tr("Identify animal","Identificar animal"),()=>{
   const seen=centered();
   if(seen?.id===target)onFound();else onMistake(seen?.id);
  },"trail-main"),button(tr("Leave hunt","Salir de la cacería"),onLeave,"trail-sub"));
  panel.append(slider,bar);
  let down=null;
  stage.onpointerdown=event=>{
   if(!event.isPrimary||event.button!==0)return;
   down={id:event.pointerId,x:event.clientX,pan:scout.pan};stage.setPointerCapture(event.pointerId);
  };
  stage.onpointermove=event=>{
   if(down?.id===event.pointerId)pan(down.pan-(event.clientX-down.x)/(stage.clientWidth*zoom));
  };
  stage.onpointerup=stage.onpointercancel=()=>{down=null;};
 }
 return {gifts,behavior,motion,dayKey,rallyTargets,cleanRally,advanceRally,sightings,binoculars,clamp};
})();
