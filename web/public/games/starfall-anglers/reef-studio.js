"use strict";
const ReefStudio=(()=>{
 const items=[["Rock cave","Cueva"],["Kelp garden","Jardín de algas"],["Driftwood","Tronco"],["Wreck bow","Proa hundida"]];
 const secrets=[["Mill key","Llave del molino"],["Pearl compass","Brújula de perla"],["Ice crystal","Cristal de hielo"],["Brass sextant","Sextante de latón"],["Amber seed","Semilla de ámbar"],["Lantern pearl","Perla luminosa"]];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function paint(c,w,h,list){
  for(const o of list||[]){
   c.save();c.translate(o.x*w,o.y*h);const k=w/490;c.scale(k,k);
   if(o.type===0){c.fillStyle="#668181";c.beginPath();c.ellipse(0,-8,23,16,0,Math.PI,2*Math.PI);c.lineTo(23,2);c.lineTo(-23,2);c.fill();c.fillStyle="#18343f";c.beginPath();c.ellipse(2,1,11,14,0,Math.PI,2*Math.PI);c.fill();}
   if(o.type===1){for(let i=-2;i<3;i++){c.strokeStyle=i%2?"#579d75":"#88c184";c.lineWidth=4;c.beginPath();c.moveTo(i*3,0);c.bezierCurveTo(i*9,-10,i*2,-19,i*5,-26+Math.abs(i)*5);c.stroke();}}
   if(o.type===2){c.strokeStyle="#a37855";c.lineWidth=5;c.beginPath();c.moveTo(-23,1);c.lineTo(-6,-3);c.lineTo(15,-13);c.moveTo(-4,-5);c.lineTo(-7,-15);c.stroke();}
   if(o.type===3){c.fillStyle="#946b56";c.beginPath();c.moveTo(-23,-11);c.lineTo(23,-16);c.lineTo(13,1);c.lineTo(-14,1);c.fill();c.strokeStyle="#d7b588";c.beginPath();c.moveTo(1,-10);c.lineTo(-2,-34);c.stroke();}
   c.restore();
  }
 }
 function open({root,model,save,el,button,pick,persist,sprite,label,meal,moving,back},edit=false){
  const data=save.adventures,tank=save.tank,index=Waters.tankIds.indexOf(tank),decor=data.design[tank]??=[];
  const tr=(a,b)=>pick([a,b]);let x=.5,y=.52,type=0,follow=null,remove=false;
  const secret={x:.15+.68*((index*3+1)%7)/6,y:.24+.59*((index*2+4)%7)/6};
  const frame=el("canvas","bw-map");frame.width=600;frame.height=330;frame.tabIndex=0;
  frame.setAttribute("aria-label",edit?tr("Tap to place decoration","Toca para decorar"):tr("Swim left, right, up or down","Nada en cualquier dirección"));
  const bg=new Image();bg.src="assets/exhibit-"+tank+".webp";const c=frame.getContext("2d");
  const controls=el("div","bw-actions"),tools=el("div","bw-actions"),status=el("p","bw-note"),album=el("div","bw-actions");
  const notify=s=>status.textContent=s;
  const draw=()=>{
   const z=edit?1:2,sw=frame.width,sh=frame.height;
   if(follow){const f=model.swimmers.find(s=>s.key===follow);if(f){x=clamp(f.x,.25,.75);y=clamp(f.y,.25,.75);}}
   const left=edit?0:x-.25,top=edit?0:y-.25;
   c.save();c.scale(z,z);c.translate(-left*sw,-top*sh);c.fillStyle="#163b48";c.fillRect(0,0,sw,sh);
   if(bg.naturalWidth)c.drawImage(bg,0,0,sw,sh);paint(c,sw,sh,decor);
   if(!edit){c.fillStyle="#ffdc8a";c.font="12px serif";c.fillText("✦",secret.x*sw,secret.y*sh);}
   for(const s of model.swimmers){const img=sprite(s.f.id);if(img.naturalWidth)Dive.swim(c,img,s.x*sw,s.y*sh,(.07+.05*s.depth)*sw,s.face<0,0,model.time);}
   c.restore();
   if(!model.lit){c.fillStyle="rgba(5,12,35,.42)";c.fillRect(0,0,sw,sh);}
   if(edit){c.strokeStyle="#ffe9a4";c.strokeRect(x*sw-5,y*sh-5,10,10);}
  };
  function move(dx,dy){follow=null;const edge=edit?.04:.25;x=clamp(x+dx,edge,1-edge);y=clamp(y+dy,edge,1-edge);draw();}
  function place(){
   if(remove){let near=decor.reduce((n,o,i)=>Math.hypot(x-o.x,y-o.y)<(n.i<0?.1:n.d)?{i,d:Math.hypot(x-o.x,y-o.y)}:n,{i:-1,d:.1});if(near.i>=0)decor.splice(near.i,1);}
   else if(decor.length<24)decor.push({type,x,y});else{notify(tr("24 decorations placed. Remove one to make room.","Ya hay 24 adornos. Retira uno para hacer espacio."));return;}
   model.decor=decor;persist();draw();notify(decor.length+"/24");
  }
  frame.onclick=e=>{const r=frame.getBoundingClientRect(),a=(e.clientX-r.left)/r.width,b=(e.clientY-r.top)/r.height;if(edit){x=a;y=b;place();}else move((a-.5)*.35,(b-.5)*.35);};
  for(const [symbol,dx,dy] of [["←",-.10,0],["→",.10,0],["↑",0,-.1],["↓",0,.1]])controls.append(button(symbol,()=>move(dx,dy),"secondary"));
  frame.onkeydown=e=>{const keys={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]};if(keys[e.key]){e.preventDefault();move(...keys[e.key]);}};
  if(edit){
   items.forEach((item,i)=>tools.append(button(pick(item),()=>{type=i;remove=false;notify(pick(item));},"secondary")));
   tools.append(button(tr("Remove","Retirar"),()=>{remove=true;notify(tr("Tap a decoration to remove it.","Toca el adorno para retirarlo."));},"secondary"));
   controls.append(button(tr("Place at cursor","Aplicar aquí"),place));
   notify(tr("Choose a decoration and tap a spot in the tank.","Elige un adorno y toca un lugar del acuario."));
  }else{
   if(model.swimmers.length){const select=el("select");select.setAttribute("aria-label",tr("Follow a swimmer","Seguir un pez"));select.append(new Option(tr("Free swim","Nadar libre"),""));model.swimmers.forEach(s=>select.append(new Option(label(s.key),s.key)));select.onchange=()=>follow=select.value;tools.append(select);}
   function showPhoto(){album.replaceChildren();if(data.photos[tank]){const im=el("img","bw-photo");im.src=data.photos[tank];im.alt=tr("Tank photograph","Foto del acuario");album.append(im);}}
   tools.append(button(tr("Take dive photo","Fotografiar inmersión"),()=>{
    draw();const stored=Voyage.storePhoto(data.photos,tank,frame.toDataURL("image/jpeg",.55),persist);
    showPhoto();notify(stored?tr("Dive photo saved.","Foto de la inmersión guardada."):tr("Couldn’t save this photo. Check device storage.","No se pudo guardar la foto. Revisa el almacenamiento."));
   }));
   tools.append(button(tr("Inspect glint","Investigar destello"),()=>{if(Math.hypot(x-secret.x,y-secret.y)<.22){data.secrets[tank]=true;persist();notify(pick(secrets[index]));}else notify((secret.x<x?"←":"→")+" "+(secret.y<y?"↑":"↓"));},"secondary"));
   notify(data.secrets[tank]?pick(secrets[index]):tr("Swim toward the gold glint and inspect it.","Nada hacia el destello dorado e investígalo."));showPhoto();
  }
  root.append(frame,controls,tools,status,album,button(tr("Back to aquarium","Volver al acuario"),back,"secondary"));
  let last=0;return now=>{if(now-last<40)return;
   if(moving){for(const key of Aquarium.advance(model,Math.min(.1,(now-(last||now))/1000)))meal(key);}
   last=now;draw();};
 }
 return {paint,open};
})();
