"use strict";
const Legends=(()=>{
 const W=680,H=340,TAU=Math.PI*2;
 const stories={
  moonpaddle:{"water":"fresh","color":"#cce7ff","motif":"crown","swim":[0.081,0.07,0.67,0.06],"signs":[["Find the silver paddle under the dock","Busca la espátula plateada bajo el muelle"],["Follow the moon marks along its back","Sigue las lunas de su lomo"],["Spot its bill catching the sunrise","Mira el reflejo del amanecer en su hocico"]]},
  obsidiangiant:{"water":"reef","color":"#ff9c73","motif":"phoenix","swim":[0.073,0.15,0.8,0.12],"signs":[["Find one ember-red scale","Busca una escama color brasa"],["Follow the arapaima up for air","Sigue al arapaima mientras sube a respirar"],["Spot its tail sweeping below the cliffs","Encuentra su cola al pasar bajo los riscos"]]},
  prismeel:{"water":"ice","color":"#d5b1ff","motif":"veil","swim":[0.093,0.085,1.65,0.22],"signs":[["Find a violet ribbon in the dark","Busca una cinta violeta en la oscuridad"],["Follow the bend in its rainbow fin","Sigue la curva de la aleta arcoíris"],["Find the pale face beyond the ribbon","Encuentra la cara pálida al final de la cinta"]]},
  sunlion:{"water":"reef","color":"#ffdd82","motif":"goldrooster","swim":[0.045,0.065,0.74,0.12],"signs":[["Spot the first golden spine","Busca la primera espina dorada"],["Follow the opening fan","Sigue el abanico al abrirse"],["Find its striped face between the rays","Encuentra su cara rayada entre los radios"]]},
  jadesaw:{"water":"fresh","color":"#b0f2bb","motif":"narwhal","swim":[0.092,0.06,1.05,0.11],"signs":[["Find a saw-shaped shadow","Busca una sombra en forma de sierra"],["Follow the green saw past the roots","Sigue la sierra verde entre las raíces"],["Spot the paired fins turning upstream","Encuentra las dos aletas que giran río arriba"]]},
  auroraskate:{"water":"ice","color":"#97ffdf","motif":"mantastar","swim":[0.1,0.105,0.75,0.18],"signs":[["Find a green glow below the ice","Busca el resplandor verde bajo el hielo"],["Follow the light across its wings","Sigue la luz a través de sus alas"],["Spot the skate banking into the fjord","Encuentra la raya al girar hacia el fiordo"]]},
  beaconsail:{"water":"reef","color":"#ffe6aa","motif":"goldrooster","swim":[0.12,0.13,1.45,0.16],"signs":[["Find a sail in the lighthouse beam","Busca una vela en el haz del faro"],["Follow its red and cream stripes","Sigue las franjas rojas y crema"],["Spot the bill emerging from the spray","Encuentra el pico entre la espuma"]]},
  thunderblue:{"water":"bank","color":"#ffdc75","motif":"marlin","swim":[0.12,0.09,1.95,0.12],"signs":[["Find the golden zigzag","Busca el zigzag dorado"],["Follow the streak across the bank","Sigue el destello por el banco"],["Spot its crescent tail in the wake","Encuentra la cola de media luna en la estela"]]},
  greatwhite:{"water":"cabo","color":"#c5f0f3","motif":"marlin","swim":[0.13,0.145,1.16,0.21],"signs":[["Find the gray dorsal fin","Busca la aleta dorsal gris"],["Follow the shark along the outer ledge","Sigue al tiburón por la cornisa exterior"],["Spot the white belly as it breaches","Encuentra el vientre blanco al saltar"]]},
  eclipseangler:{"water":"seamount","color":"#ffd286","motif":"star","swim":[0.041,0.065,0.48,0.065],"signs":[["Find the little ring of gold","Busca el pequeño anillo de oro"],["Follow its lure through the dark","Sigue su señuelo en la oscuridad"],["Spot the purple fins behind the eclipse","Encuentra las aletas moradas detrás del eclipse"]]},
  crown:{water:"fresh",color:"#ffe18c",signs:[
   ["Find the first golden fin.","Busca la primera aleta dorada."],["Follow the koi as it turns.","Sigue al koi cuando dé la vuelta."],["Touch the crown of three fins.","Toca la corona de tres aletas."]]},
  phoenix:{water:"reef",color:"#ffa376",signs:[
   ["Find the drifting ember.","Busca la brasa que flota."],["Follow the copper streak.","Sigue el destello cobrizo."],["Touch the flame-shaped tail.","Toca la cola con forma de llama."]]},
  star:{water:"ice",color:"#cbe9ff",signs:[
   ["Find the first star on its back.","Busca la primera estrella en su lomo."],["Trace the next group of stars.","Sigue el siguiente grupo de estrellas."],["Find the seventh star at the snout.","Busca la séptima estrella junto al hocico."]]},
  dragon:{water:"reef",color:"#a9edb8",signs:[
   ["Find the leaf that swims against the current.","Busca la hoja que nada contra la corriente."],["Follow its curling leafy tail.","Sigue la cola de hojas cuando se enrosque."],["Spot the dragon peeking out.","Encuentra al dragón que se asoma."]]},
  axolotl:{water:"fresh",color:"#ffd17d",signs:[
   ["Find the amber bud near the stones.","Busca el botón ámbar junto a las piedras."],["Follow the opening petals.","Sigue los pétalos que se abren."],["Find the face inside the frill.","Busca la cara en el centro de la gola."]]},
  narwhal:{water:"ice",color:"#affbde",signs:[
   ["Find the green ribbon under the ice.","Busca la cinta verde bajo el hielo."],["Follow the twisting light.","Sigue la luz que gira en espiral."],["Find the bright tip of its lance.","Busca la punta brillante de su lanza."]]},
  goldrooster:{water:"reef",color:"#ffe099",signs:[
   ["Spot a fin in the lighthouse beam.","Busca una aleta en el haz del faro."],["Follow its golden comb.","Sigue la cresta dorada."],["Find the seventh golden streamer.","Busca la séptima cinta dorada."]]},
  marlin:{water:"bank",color:"#a9dcff",signs:[
   ["Find the V-shaped wake.","Busca la estela en forma de V."],["Follow the marlin into its jump.","Sigue al marlín cuando salte."],["Find where its bill breaks the water.","Busca el pico cuando atraviese el agua."]]},
  mantastar:{water:"cabo",color:"#ffdd86",signs:[
   ["Find the gold wing circling your boat.","Busca el ala dorada que rodea tu lancha."],["Follow the manta around the stern.","Sigue a la manta por la popa."],["Spot it diving beneath the hull.","Encuéntrala cuando pase bajo la lancha."]]},
  veil:{water:"seamount",color:"#eac3ff",signs:[
   ["Find the glimmering end of the ribbon.","Busca la punta brillante del listón."],["Follow the glowing middle section.","Sigue el tramo luminoso del centro."],["Find the red crest at its head.","Busca la cresta roja en la cabeza."]]}
 };
 function position(id,step,time){
  const lane=[.26,.64,.49][step],wave=Math.sin(time*.8+step),sway=Math.cos(time*.72+step);
  let x=lane+.065*wave,y=.5+.09*sway,scale=1,flip=false,tilt=.045*sway;
  const swim=stories[id]?.swim;
  if(swim){
   const [reach,lift,pace,bank]=swim,beat=time*pace+step;
   return {x:lane+reach*Math.sin(beat),y:.53+lift*Math.cos(beat*1.2)-step*.04,scale:.78+step*.14,
    flip:Math.cos(beat)<0,tilt:bank*Math.sin(beat*1.2)};
  }
  switch(id){
   case "crown":x+=.025*Math.sin(time*2.2);y=.63-step*.08+.055*sway;flip=step===1;break;
   case "phoenix":x=lane+.09*wave;y=.70-step*.13+.04*Math.sin(time*1.8);tilt=-.15+wave*.07;break;
   case "star":x=lane+.035*wave;y=[.67,.40,.49][step]+.025*sway;break;
   case "dragon":x=lane+.035*Math.sin(time*1.7);y=.49+.15*wave;tilt=sway*.16;flip=step===0;break;
   case "axolotl":x=lane+.022*sway;y=.68-step*.09+.018*wave;scale=.74+.10*step+.06*wave;break;
   case "narwhal":x=lane+.105*wave;y=.52+.09*Math.sin(time*1.3+step);tilt=-.15*sway;break;
   case "goldrooster":x=lane+.10*Math.sin(time*.95+step);y=.48+.035*sway;flip=step===1;break;
   case "marlin":{
    const jump=Math.abs(Math.sin(time*.8+.40));
    x=lane+.12*wave;y=step===1?.73-.44*jump:.62+.035*sway;tilt=step===1?-.34*sway:.08*wave;break;
   }
   case "mantastar":{
    const a=time*.58+step*2.1-2.45;
    const dive=step===2?(1+Math.sin(time*.7-.5))*.5:0;
    x=.50+(.29-.15*dive)*Math.cos(a);y=.49+(.24+.035*dive)*Math.sin(a)+.06*dive;
    scale=.95-.45*dive;tilt=.16*Math.cos(a);flip=Math.sin(a)>0;break;
   }
   case "veil":x=[.23,.50,.72][step]+.033*wave;y=.5+.095*Math.sin(time*.73+step*1.25);tilt=.10*sway;break;
  }
  return {x,y,scale,flip,tilt};
 }
 function star(ctx,x,y,r){
  ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.25,y-r*.25);ctx.lineTo(x+r,y);ctx.lineTo(x+r*.25,y+r*.25);
  ctx.lineTo(x,y+r);ctx.lineTo(x-r*.25,y+r*.25);ctx.lineTo(x-r,y);ctx.lineTo(x-r*.25,y-r*.25);ctx.closePath();ctx.fill();
 }
 function mark(ctx,id,step,time,color){
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.2;ctx.lineCap="round";
  switch(stories[id]?.motif||id){
   case "crown":
    for(let i=0;i<step+1;i++){ctx.beginPath();ctx.moveTo(i*14-13,0);ctx.lineTo(i*14-9,-14-i%2*7);ctx.lineTo(i*14+1,-1);ctx.fill();}break;
   case "phoenix":
    for(let i=0;i<6;i++){const k=(time*.3+i/6)%1;ctx.globalAlpha=1-k;star(ctx,-34*k,(i%2?1:-1)*10*k,5*(1-k)+2);}break;
   case "star":
    ctx.beginPath();for(let i=0;i<=step*2+2;i++){const x=(i-2)*9,y=-6*Math.sin(i*1.5);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();
    for(let i=0;i<=step*2+2;i++)star(ctx,(i-2)*9,-6*Math.sin(i*1.5),4);break;
   case "dragon":
    for(let i=0;i<4;i++){ctx.save();ctx.translate((i-1.5)*9,Math.sin(time+i)*4);ctx.rotate(i*.7+time*.15);ctx.beginPath();ctx.ellipse(0,0,4,10,0,0,TAU);ctx.fill();ctx.restore();}break;
   case "axolotl":
    for(let i=0;i<6;i++){const a=i*TAU/6;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,-8-step*3,3+step,6+step,0,0,TAU);ctx.stroke();ctx.restore();}break;
   case "narwhal":
    ctx.beginPath();for(let i=0;i<=32;i++){const x=i-16,y=Math.sin(i*.51-time*2)*(7-i*.17);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();star(ctx,17,0,4);break;
   case "goldrooster":
    for(let i=0;i<3+step*2;i++){const x=-14+i*5;ctx.beginPath();ctx.moveTo(x,0);ctx.quadraticCurveTo(x+8,-15,x-2,-16-Math.sin(i*.6+time)*4);ctx.stroke();}break;
   case "marlin":
    for(let i=0;i<3;i++){const x=i*-9;ctx.beginPath();ctx.moveTo(x-8,-8);ctx.lineTo(x+4,0);ctx.lineTo(x-8,8);ctx.stroke();}break;
   case "mantastar":
    for(let i=0;i<3;i++){const a=time*.7+i*2.09;star(ctx,Math.cos(a)*14,Math.sin(a)*6,4.5);}break;
   case "veil":
    ctx.strokeStyle=step<2?color:"#ff897d";ctx.beginPath();
    for(let i=0;i<29;i++){const y=Math.sin(i*.30-time*2)*5;if(i)ctx.lineTo(i-14,y);else ctx.moveTo(i-14,y);}ctx.stroke();break;
  }
  ctx.restore();
 }
 function drawAnimal(ctx,img,id,step,p){
  if(!img?.naturalWidth)return;
  const sw=img.naturalWidth,sh=img.naturalHeight;
  ctx.save();ctx.translate(p.x*W,p.y*H);ctx.rotate(p.tilt);ctx.scale(p.flip?-1:1,1);
  ctx.globalAlpha=[.54,.76,1][step];
  if(id==="veil"){
   const start=[0,.29,.55][step],portion=[.42,.49,.45][step];
   const sx=sw*start,width=sw*portion,length=(205+step*3)*p.scale;
   const fullLength=length/portion,height=Math.min(118,fullLength*sh/sw);
   ctx.drawImage(img,sx,0,width,sh,-length*.5,-height*.5,length,height);
  }else{
   const length=Math.min(164,118*sw/sh)*p.scale,height=length*sh/sw;
   ctx.drawImage(img,-length/2,-height/2,length,height);
  }
  ctx.restore();
 }
 function backdropDetail(ctx,id,step,t,color){
  ctx.save();
  if(id==="mantastar"){
   ctx.strokeStyle="#fff2ad54";ctx.setLineDash([4,8]);ctx.beginPath();ctx.ellipse(W*.5,H*.49,W*.29,H*.24,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle="#071c2bbf";ctx.beginPath();ctx.moveTo(W*.5,H*.31);ctx.quadraticCurveTo(W*.56,H*.42,W*.528,H*.60);ctx.lineTo(W*.47,H*.60);ctx.quadraticCurveTo(W*.445,H*.43,W*.5,H*.31);ctx.fill();
  }else if(id==="veil"){
   for(let n=0;n<=step;n++){
    ctx.globalAlpha=.22+n*.09;ctx.strokeStyle=color;ctx.lineWidth=4;
    ctx.beginPath();for(let i=0;i<=50;i++){const x=(.08+n*.225+i*.0047)*W,y=H*(.50+.09*Math.sin(t*.73+x/W*5));if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();
   }
  }else if(id==="goldrooster"){
   ctx.fillStyle="#ffefae29";ctx.beginPath();ctx.moveTo(0,H*.13);ctx.lineTo(W*(.61+.19*Math.sin(t*.6)),H*.53);ctx.lineTo(W*(.67+.19*Math.sin(t*.6)),H*.77);ctx.closePath();ctx.fill();
  }else if(id==="narwhal"){
   for(let n=0;n<3;n++){ctx.strokeStyle=["#86f6b14d","#95a8ff47","#8de8ed54"][n];ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<=45;i++){const x=W*i/45,y=H*(.22+.045*n+.065*Math.sin(i*.14+t*.4+n*.2));if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}
  }
  ctx.restore();
 }
 function open({root,f,lang,el,button,sprite,reduced=false,onComplete,backdrop}){
  const story=stories[f.id];
  if(!story)throw new RangeError("Unknown legend "+f.id);
  const es=lang===1||lang===true||/^es/.test(String(lang)),pick=pair=>pair[es?1:0];
  let step=0,finished=false,start=null,lastTime=0,lastPaint=-Infinity;
  const panel=el("section","legend-sighting"),header=el("div","legend-progress"),
   counter=el("strong"),clue=el("p"),stage=el("div","legend-water"),canvas=el("canvas"),feedback=el("div");
  const hint=pick(["Tap the glowing trail, or use the clue button.","Toca el rastro brillante o usa el botón de la pista."]);
  const cue=button("",advance,"display-button"),target=button("",advance,"legend-trail-target");
  const animal=sprite(f.id);
  counter.style.color=story.color;header.append(counter);clue.setAttribute("aria-live","polite");
  feedback.setAttribute("role","status");feedback.style.minHeight="1.4em";feedback.style.marginTop="5px";
  Object.assign(stage.style,{position:"relative",width:"100%",aspectRatio:"2 / 1",minHeight:"165px",overflow:"hidden",border:"2px solid #789a98",borderRadius:"9px",backgroundColor:"#163a4b",backgroundPosition:"center",backgroundSize:"cover",backgroundImage:'linear-gradient(180deg,#0e25362b,#071f3291),url("'+(backdrop||"assets/dive-"+story.water+".png")+'")'});
  canvas.width=W;canvas.height=H;canvas.setAttribute("aria-hidden","true");Object.assign(canvas.style,{width:"100%",height:"100%",position:"absolute",inset:"0",imageRendering:"pixelated"});
  Object.assign(target.style,{position:"absolute",transform:"translate(-50%,-50%)",width:"14%",height:"28%",minWidth:"48px",minHeight:"48px",background:"transparent",color:"transparent",border:"0",padding:"0",boxShadow:"none",cursor:"pointer",touchAction:"manipulation"});
  target.type="button";cue.style.marginTop="8px";
  const instructions=el("p","",hint);instructions.style.margin="7px 0 4px";instructions.style.fontSize="14px";
  stage.append(canvas,target);panel.append(header,clue,stage,instructions,cue,feedback);root.append(panel);
  const ctx=canvas.getContext("2d");ctx.imageSmoothingEnabled=false;
  canvas.addEventListener("click",()=>{if(!finished)feedback.textContent=pick(["Look for the gold brackets around the next clue.","Busca la siguiente pista entre las marcas doradas."]);});
  function update(){
   const words=pick(story.signs[step]);
   counter.textContent=pick(["Sighting","Avistamiento"])+" · "+(step+1)+" / "+story.signs.length;
   clue.textContent=words;cue.textContent=words.replace(/[.]$/,"");target.setAttribute("aria-label",cue.textContent);
   feedback.textContent="";lastPaint=-Infinity;
  }
  function advance(){
   if(finished)return;
   if(step===story.signs.length-1){
    finished=true;cue.disabled=true;target.disabled=true;
    feedback.textContent=pick(["Legend spotted!","¡Leyenda avistada!"]);onComplete?.(f.id);return;
   }
   step++;update();frame(lastTime);
  }
  function frame(now){
   if(finished||!Number.isFinite(now))return;
   if(start===null)start=now;
   lastTime=now;
   if(now-lastPaint<40)return;
   lastPaint=now;const t=reduced?0:Math.max(0,(now-start)/1000),p=position(f.id,step,t);
   ctx.clearRect(0,0,W,H);backdropDetail(ctx,f.id,step,t,story.color);
   drawAnimal(ctx,animal,f.id,step,p);
   const direction=p.flip?-1:1;
   const x=p.x*W+direction*(f.id==="veil"?[0,17,55][step]:27*p.scale),y=p.y*H;
   ctx.save();ctx.translate(x,y);
   const r=31+Math.sin(t*2.2)*2;
   ctx.fillStyle="#112b3a34";ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
   ctx.lineWidth=3;ctx.strokeStyle="#ffe4a2";
   for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(0,0,r,i*Math.PI/2+.13,i*Math.PI/2+.83);ctx.stroke();}
   mark(ctx,f.id,step,t,story.color);ctx.restore();
   target.style.left=(x/W*100)+"%";target.style.top=(y/H*100)+"%";
  }
  update();frame(typeof performance!=="undefined"?performance.now():0);
  return frame;
 }
 return {open,position,stories};
})();
