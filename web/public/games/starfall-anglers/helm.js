"use strict";
const Helm=(()=>{
 function open({root,save,place,el,button,pick,sprite,persist,say,reduced,onAnchor,onLog,initialBoat}){
  const v=save.voyage,port=place.id,txt=(en,es)=>pick([en,es]);
  const boat={...(initialBoat||v.anchors[port]||Voyage.start)},marks=Voyage.marks(port);
  const wrap=el("section","helm"),screen=el("div","helm-screen"),canvas=el("canvas","helm-chart");
  canvas.width=720;canvas.height=540;canvas.tabIndex=0;
  canvas.setAttribute("aria-label",txt("Sea chart. Tap water to steer, or use the arrow keys.","Carta náutica. Toca el agua para navegar o usa las flechas."));
  const chart=new Image();chart.src="assets/chart-"+(["bank","seamount","aurora"].includes(port)?"blue":"coast")+".webp";
  const state=el("div","helm-readout"),live=el("p","helm-report"),routes=el("div","helm-waypoints"),actions=el("div","helm-actions");
  live.setAttribute("role","status");screen.append(canvas,state);
  const chartHelp=el("p","helm-help",txt("Tap the water to steer, or pick a sign to follow. Drop anchor anywhere to fish.","Toca el agua para navegar o elige una señal. Echa el ancla donde quieras pescar."));
  let goal=null,nextWaypoint=null,archVisited=false,near=null,watch=null,last=0,elapsed=0,reported="",picture=null,shotTaken=false;
  const placeWeather=el("div","helm-weather"),weatherLabel=el("label","helm-sky"),select=el("select");
  for(const [id,en,es] of [["auto","Changing skies","Cielo cambiante"],["clear","Clear skies","Cielo despejado"],["rain","Rain shower","Lluvia"]]){
   const o=el("option","",txt(en,es));o.value=id;select.append(o);
  }
  select.value=v.sky;weatherLabel.append(el("span","",txt("Weather","Clima")),select);
  const timeBtns=el("div","helm-times");let lastConditions="";
  for(const [i,en,es] of [[0,"Wait for daylight","Esperar al día"],[1,"Wait until dusk","Esperar al atardecer"],[2,"Wait for moonlight","Esperar a la noche"]]){
   const b=button(txt(en,es),()=>{Voyage.waitFor(v,port,i);persist();updateConditions();}, "theme");
   b.dataset.time=i;timeBtns.append(b);
  }
  select.onchange=()=>{v.sky=select.value;persist();updateConditions();};
  const seaNote=el("p","helm-sea-note");placeWeather.append(weatherLabel,timeBtns,seaNote);
  const controls=el("div","helm-course"),markerTitle=el("h3","",txt("Follow a sign","Sigue una señal"));
  function setCourse(x,y,label){
   if(watch)return;nextWaypoint=null;
   goal={x:Math.max(.07,Math.min(.93,x)),y:Math.max(.09,Math.min(.91,y))};
   message(label||txt("Under way","En marcha"));
  }
  function message(text){if(text!==reported){live.textContent=text;reported=text;}}
  for(const mark of marks){
   const b=button("",()=>setCourse(mark.x,mark.y,txt("Steering toward ","Rumbo a ")+pick(mark.sign)), "helm-mark");
   const im=el("img");im.src="assets/"+mark.id+".png";im.alt="";b.append(im,el("span","",pick(mark.sign)));routes.append(b);
  }
  const arch={x:.20,y:.23};
  if(port==="cabo"){
   const crossing=button(txt("Sail through Cabo Arch","Cruzar el Arco de Cabo"),()=>{
    archVisited=false;setCourse(arch.x,arch.y+.14,txt("Approaching the arch","Rumbo al arco"));
    nextWaypoint={x:arch.x,y:arch.y-.12};
   },"theme helm-arch");routes.append(crossing);
  }
  const anchor=button(txt("Drop anchor & fish","Echar el ancla y pescar"),()=>{
   v.anchors[port]={...boat};persist();onAnchor(near);
  },"primary");
  const camera=button(txt("Wildlife camera","Cámara de fauna"),()=>{if(near)openCamera(near);},"theme");
  camera.disabled=true;
  const journal=button(txt("Wildlife journal","Cuaderno de fauna"),()=>onLog({...boat}),"theme");
  actions.append(anchor,camera,journal);controls.append(chartHelp,markerTitle,routes,placeWeather);
  const cameraTools=el("div","helm-actions");cameraTools.hidden=true;
  const shutter=button(txt("Take wildlife photo","Fotografiar fauna"),()=>{
   if(!watch||shotTaken)return;
   const conditions=Voyage.conditions(v,port);
   if(!paintCamera(conditions))return;
   const stored=Voyage.storePhoto(v.album,watch.id,Voyage.photo(port,conditions,canvas),persist);
   shotTaken=stored;shutter.disabled=stored;
   message(!stored?txt("Couldn’t save this photo. Check device storage and try again.","No se pudo guardar la foto. Revisa el almacenamiento e inténtalo otra vez."):
    txt("Photo in your wildlife journal · ","Foto en tu cuaderno de fauna · ")+pick(watch.name));
   say(live.textContent);
  },"primary");
  const leave=button(txt("Back to the helm","Volver al timón"),()=>{watch=null;screen.classList.remove("camera-view");canvas.height=540;controls.hidden=false;actions.hidden=false;cameraTools.hidden=true;lastConditions="";message("");updateConditions();camera.focus();},"theme");
  cameraTools.append(shutter,leave,button(txt("Open wildlife journal","Abrir cuaderno de fauna"),()=>onLog({...boat}),"theme"));
  function openCamera(mark){
   goal=null;nextWaypoint=null;watch=mark;shotTaken=false;picture=sprite(mark.id);canvas.height=405;screen.classList.add("camera-view");
   controls.hidden=true;actions.hidden=true;cameraTools.hidden=false;shutter.disabled=true;shutter.focus();
   state.textContent=pick(mark.name);message(pick(mark.note));
  }
  wrap.append(screen,live,actions,cameraTools,controls);root.append(wrap);
  const ctx=canvas.getContext("2d");
  const sea=new Image();sea.src="assets/"+port+".png";
  const underwater=new Image();underwater.src="assets/dive-"+Waters.habitats[Waters.places.indexOf(place)]+".png";
  function updateConditions(){
   const c=Voyage.conditions(v,port);
   if(!watch)state.textContent=pick(Voyage.times[c.time])+" · "+pick(Voyage.weather[+c.rain]);
   const tips=[];
   if(c.rain)tips.push(txt("Rain brings small baitfish toward the surface.","La lluvia acerca los peces pequeños a la superficie."));
   if(c.time===2)tips.push(txt("Some deep swimmers rise in the moonlight.","Algunos peces de las profundidades suben bajo la luz de la luna."));
   seaNote.textContent=tips.join(" ");seaNote.hidden=!tips.length;
   for(const b of timeBtns.children)b.setAttribute("aria-pressed",String(Number(b.dataset.time)===c.time));
   return c;
  }
  function input(e){if(watch||e.button!==0)return;const r=canvas.getBoundingClientRect();setCourse((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);}
  canvas.onpointerdown=e=>{input(e);if(!watch&&e.isPrimary)canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(canvas.hasPointerCapture(e.pointerId)&&e.buttons===1)input(e);};
  canvas.onkeydown=e=>{
   const vec={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
   if(watch||!vec)return;e.preventDefault();const from=goal||boat;
   setCourse(from.x+.12*vec[0],from.y+.12*vec[1]);
  };
  function stamp(img,x,y,width,flip=false){
   if(!img?.naturalWidth)return;
   const h=width*img.naturalHeight/img.naturalWidth;
   ctx.save();ctx.translate(x,y);ctx.scale(flip?-1:1,1);ctx.drawImage(img,-width/2,-h/2,width,h);ctx.restore();
  }
  function atmosphere(c,t){
   const w=canvas.width,h=canvas.height;
   if(c.time!==0){ctx.fillStyle=c.time===2?"rgba(17,16,85,.33)":"rgba(221,115,84,.15)";ctx.fillRect(0,0,w,h);}
   if(c.rain){ctx.strokeStyle="#e6f9ff8c";ctx.lineWidth=1.5;ctx.beginPath();for(let i=0;i<36;i++){
    const x=((i*.618+t*.09)%1)*w,y=((i*.283+t*.53)%1)*h;ctx.moveTo(x,y);ctx.lineTo(x-3,y+9);
   }ctx.stroke();}
  }
  function paintChart(c,tm){
   const w=canvas.width,h=canvas.height;
   ctx.fillStyle="#246270";ctx.fillRect(0,0,w,h);
   if(chart.naturalWidth)ctx.drawImage(chart,0,0,w,h);
   atmosphere(c,tm);
   for(const m of marks){
    const x=m.x*w,y=m.y*h,bob=Math.sin(tm*1.3+m.x*7);ctx.strokeStyle=m.id===near?.id?"#ffe399":"#d2f1e2";ctx.lineWidth=2;ctx.setLineDash([5,6]);ctx.beginPath();ctx.ellipse(x,y,35,19,0,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);
    if(m.id==="pelican"){
     const dip=Math.max(0,Math.sin(tm*1.7));
     stamp(sprite(m.id),x-8+12*Math.sin(tm*.85),y-17+dip*18,50);
     for(let i=0;i<4;i++){ctx.fillStyle="#d1f8dc";ctx.fillRect(x-16+i*8+dip*(i-1.5)*6,y+6+Math.sin(tm*2+i)*3,4,1.5);}
    }else if(m.id==="dolphin"&&near?.id===m.id){
     const bx=boat.x*w,by=boat.y*h;ctx.save();ctx.translate(bx,by);ctx.rotate(boat.angle-Math.PI/2);
     stamp(sprite(m.id),12,25+bob*2,43);stamp(sprite(m.id),-11,-25-bob*2,32);ctx.restore();
    }else if(m.id==="whale-shark"&&near?.id===m.id){
     stamp(sprite(m.id),boat.x*w+28*Math.sin(tm*.55),boat.y*h+12*Math.cos(tm*.55),85);
    }else stamp(sprite(m.id),x+bob*9,y-6+Math.cos(tm*.65)*3,m.id==="whale-shark"?80:54);

   }
   if(goal){ctx.strokeStyle="#fce5a5";ctx.setLineDash([4,7]);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(boat.x*w,boat.y*h);ctx.lineTo(goal.x*w,goal.y*h);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(goal.x*w,goal.y*h,7,0,2*Math.PI);ctx.stroke();}
   ctx.save();ctx.translate(boat.x*w,boat.y*h);ctx.rotate(boat.angle);
   if(goal){ctx.strokeStyle="#c8f8ecaa";ctx.lineWidth=3;for(let i=0;i<3;i++){const y=22+(tm*22+i*9)%26;ctx.beginPath();ctx.moveTo(-12,y-2);ctx.quadraticCurveTo(0,y+6,12,y-2);ctx.stroke();}}
   const art=sprite("panga");if(art.naturalWidth)stamp(art,0,0,28);else{ctx.fillStyle="#ffe0a2";ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(11,17);ctx.lineTo(-11,17);ctx.closePath();ctx.fill();}
   ctx.restore();
   if(port==="cabo")stamp(sprite("arch-gate"),arch.x*w,arch.y*h,w*.19);
  }
  function paintCamera(c){
   const w=canvas.width,h=canvas.height,tm=reduced?1.3:elapsed;
   const surface=Voyage.backdrop(place,c);if(sea.getAttribute("src")!==surface)sea.src=surface;
   const submerged=watch.id==="whale-shark",back=submerged?underwater:sea;
   ctx.fillStyle=submerged?"#156068":"#477988";ctx.fillRect(0,0,w,h);if(back.naturalWidth)ctx.drawImage(back,0,0,w,h);
   atmosphere(c,tm);const x=w*(.49+.17*Math.sin(tm*.53)),wave=Math.sin(tm*1.2),y=h*(submerged?.55:watch.id==="pelican"?.30+.12*wave:.59-.14*Math.abs(wave));
   if(watch.id==="dolphin")stamp(picture,x-100,y+18,w*.21);
   ctx.save();ctx.translate(x,y);ctx.rotate(submerged?.035*wave:watch.id==="dolphin"?wave*.16:wave*.08);stamp(picture,0,0,w*(submerged?.70:watch.id==="pelican"?.33:.42));ctx.restore();
   return Boolean(back.naturalWidth&&picture?.naturalWidth);
  }
  updateConditions();
  return now=>{
   if(last&&now-last<32)return;const dt=last?Math.min(.10,(now-last)/1000):0;last=now;elapsed+=dt;
   const c=Voyage.conditions(v,port),key=c.time+"/"+c.rain;
   if(key!==lastConditions){updateConditions();lastConditions=key;}
   ctx.imageSmoothingEnabled=false;
   if(watch){const ready=paintCamera(c);shutter.disabled=shotTaken||!ready;return;}
   const moving=goal&&Voyage.steer(boat,goal,dt);
   if(goal&&!moving&&dt){
    goal=nextWaypoint;nextWaypoint=null;
    if(!goal&&!near&&!archVisited)message(txt("Engine idle. You can anchor here.","Motor en reposo. Aquí puedes echar el ancla."));
   }
   const next=Voyage.nearest(port,boat);
   if(next?.id!==near?.id||!last||!live.textContent){
    near=next;camera.disabled=!near;
    if(near)message(pick(near.name)+txt(" in view. Open the wildlife camera."," a la vista. Abre la cámara de fauna."));
    else if(!goal)message(txt("Open water. Follow a sign to find wildlife.","Mar abierto. Sigue una señal para encontrar fauna."));
   }
   if(port==="cabo"&&!archVisited&&Math.abs(boat.x-arch.x)<.05&&Math.abs(boat.y-arch.y)<.035){
    archVisited=true;message(txt("You sailed under Cabo Arch!","¡Pasaste por debajo del Arco de Cabo!"));
   }
   camera.disabled=!near;paintChart(c,reduced?0:elapsed);
  };
 }
 return {open};
})();
