"use strict";
const Bluewater=(()=>{
 const sites=[
  {name:["Gull Cove","Caleta Gaviota"],port:7,sign:["Follow the diving gulls","Sigue las gaviotas"],fish:["yellowfin","thunderblue","rainbowrunner"],x:.25,y:.32,icon:"🕊️"},
  {name:["The Sunken Bell","La Campana Hundida"],port:6,sign:["Sound the wreck","Sondea el naufragio"],fish:["snook","lookdown","snapper"],x:.74,y:.62,icon:"⚓"},
  {name:["The Lights Beneath Cabo","Las luces bajo Cabo"],port:8,sign:["Follow the glowing baitfish","Sigue los peces luminosos"],fish:["greatwhite","mantastar","coronet"],x:.61,y:.28,icon:"✦"}
 ];
 const styles=[["Pop","Salpicar"],["Twitch","Sacudir"],["Sink","Hundir"]];
 const manoeuvres=[
  {cue:["It leaps! Lower the rod","¡Salta! Baja la caña"],action:["Lower rod","Bajar caña"],icon:"↘"},
  {cue:["It dives for cover! Lift the rod","¡Busca refugio! Levanta la caña"],action:["Lift rod","Levantar caña"],icon:"↗"},
  {cue:["It circles the boat! Give slack","¡Rodea el barco! Suelta sedal"],action:["Give line","Soltar sedal"],icon:"↻"}
 ];
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function clean(raw){
  const obj=raw&&typeof raw==="object"?raw:{};
  const marks=Array.isArray(obj.marks)?sites.map((_,i)=>obj.marks[i]===true):[];
  const gear=Number.isInteger(obj.gear)?clamp(obj.gear,0,2):1;
  return {marks,gear,nightPhoto:typeof obj.nightPhoto==="string"?obj.nightPhoto:"",plaques:obj.plaques||{},design:obj.design||{},secrets:obj.secrets||{},photos:obj.photos||{},crew:Array.isArray(obj.crew)?obj.crew.slice(0,2).map(n=>String(n).slice(0,18)):[],active:Number.isInteger(obj.active)&&marks[obj.active]?obj.active:null};
 }
 function technique(f){const layer=Waters.layerOf(f.id);return layer<0?(f.tier+f.place)%3:layer;}
 function signature(f){
  if(/shark|greatwhite|mako|hammerhead|mantastar/.test(f.id))return 2;
  if(/marlin|sail|trout|brook|flyer|saury|bass|moss/.test(f.id))return 0;
  if(/grouper|eel|cat|gar|snapper|tripod/.test(f.id))return 1;
  return (f.place+f.tier)%3;
 }
 function visitCandidate(f,place,data,worked,random=Math.random){
  const site=sites[data.active];
  if(site&&site.port===place&&random()<.42){
   const available=Waters.pools[place].filter(s=>site.fish.includes(s.id)&&s.tier!==3);
   if(available.length)return available[Math.floor(random()*available.length)];
  }
  if(worked&&f.tier!==3&&random()<.57){
   const list=Waters.pools[place].filter(s=>s.tier!==3&&technique(s)===data.gear);
   if(list.length)return list[Math.floor(random()*list.length)];
  }
  return f;
 }
 function openChart(ui,expedition=false){
  const {root,save,data,el,btn,pick,persist,anchor,sprite}=ui;
  const text=(a,b)=>pick([a,b]);let index=expedition?2:0,boat={x:.50,y:.87},dest={...boat},stage=0,last=0;
  const art=new Image();art.src="assets/chart-coast.webp";
  const deep=new Image();deep.src="assets/dive-cabo.png";
  const map=el("canvas","bw-map");map.width=560;map.height=300;map.tabIndex=0;map.setAttribute("aria-label",text("Steer the boat on the chart","Pilota el barco en la carta"));
  const status=el("p","bw-note"),routes=el("div","bw-actions"),buttons=el("div","bw-actions"),boatArt=sprite("panga");
  const cue=()=>stage===1?{x:(sites[index].x+.5)/2,y:.57}:sites[index];
  function refresh(){
   const site=sites[index];buttons.replaceChildren();status.textContent=pick(site.name)+" · "+(stage===0?(index===2?text("At the dock, a keeper saw blue lights beneath Cabo after sunset.","En el muelle vieron luces azules bajo Cabo después del atardecer."):text("Choose a bearing and steer toward the signal.","Elige un rumbo y navega hacia la señal.")):stage===1?pick(site.sign):stage===2?text("Approach the marked water.","Acércate al agua marcada."):text("On station. Look overboard.","Llegaste. Mira al agua."));
   if(!stage)buttons.append(btn(index===2?text("Leave at sunset","Zarpar al atardecer"):text("Cast off","Zarpar"),()=>{stage=1;refresh();}));
   if(stage===1||stage===2)buttons.append(btn(stage===1?pick(site.sign):text("Approach signal","Acercarse a la señal"),()=>{dest={...cue()};}));
   if(stage===3)buttons.append(btn(index===2?text("Photograph the glowing school","Fotografiar el cardumen"):text("Mark this spot","Marcar este sitio"),()=>{
    data.marks[index]=true;
    const photoSaved=index===2&&Voyage.storePhoto(data,"nightPhoto",map.toDataURL("image/jpeg",.62),persist);
    const markSaved=photoSaved||persist();stage=4;refresh();
    if(!markSaved)status.textContent=text("This spot is marked for this session. Check device storage.","Sitio marcado para esta sesión. Revisa el almacenamiento.");
    else if(index===2&&!photoSaved)status.textContent=text("Fishing spot saved. There wasn’t enough space for the photo.","Sitio de pesca guardado. No hubo espacio para la foto.");
   }));
   if(data.marks[index])buttons.append(btn(text("Fish here","Pescar aquí"),()=>anchor(index)));
   if(index===2&&data.nightPhoto){const photo=el("img","bw-photo");photo.src=data.nightPhoto;photo.alt=text("Cabo night expedition photograph","Foto nocturna de la expedición");buttons.append(photo);}
  }
  function select(i){index=i;stage=0;boat={x:.5,y:.87};dest={...boat};refresh();}
  for(const [i,s] of sites.entries())routes.append(btn(pick(s.name),()=>select(i),"secondary"));
  map.onclick=e=>{if(stage!==1&&stage!==2)return;const r=map.getBoundingClientRect();dest={x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};};
  root.append(routes,map,status,buttons);refresh();
  return now=>{
   const dt=Math.min(.12,(now-(last||now))/1000);last=now;const dx=dest.x-boat.x,dy=dest.y-boat.y,len=Math.hypot(dx,dy),k=Math.min(1,dt*.55/(len||1));boat.x+=dx*k;boat.y+=dy*k;
   if((stage===1||stage===2)&&Math.hypot(boat.x-cue().x,boat.y-cue().y)<.055){stage++;refresh();}
   const c=map.getContext("2d"),w=map.width,h=map.height,t=now/1000,night=index===2;
   c.fillStyle=night?"#102743":"#276d79";c.fillRect(0,0,w,h);
   if(art.naturalWidth){c.globalAlpha=night?.24:.58;c.drawImage(art,0,0,w,h);c.globalAlpha=1;}
   for(let j=0;j<25;j++){const x=(j*69+Math.sin(t+j)*6)%w,y=(j*41)%h;c.fillStyle=night?"#386482":"#74b5ac";c.fillRect(x,y,12,2);}
   for(let j=0;j<8;j++){const x=(sites[index].x+Math.sin(t*.65+j)*.07)*w,y=(sites[index].y+Math.cos(j+t*.4)*.035)*h;c.fillStyle=night?"#96ffed":"#f5ead0";c.beginPath();c.ellipse(x,y,5,2,0,0,7);c.fill();}
   if(night&&stage>=3&&deep.naturalWidth){
    c.drawImage(deep,0,0,w,h);c.fillStyle="#05152b77";c.fillRect(0,0,w,h);
    for(let j=0;j<19;j++){const px=w*(.49+.32*Math.sin(j*1.2+t*.36)),py=h*(.49+.16*Math.cos(j*.8+t*.51));c.save();c.shadowColor="#a2ffef";c.shadowBlur=12;Dive.swim(c,sprite("sergeant"),px,py,23,false,0,t+j);c.fillStyle="#aeffdf";c.fillRect(px+5,py,3,2);c.restore();}
    return;
   }
   if(index===0){c.strokeStyle="#fff0cd";c.lineWidth=2;for(let j=0;j<3;j++){const x=w*.27+j*13,y=h*.36+Math.sin(t*2+j)*5;c.beginPath();c.moveTo(x-6,y-4);c.lineTo(x,y);c.lineTo(x+6,y-4);c.stroke();}}
   if(index===1){c.strokeStyle="#99e9c0";c.beginPath();c.arc(w*.74,h*.62,8+(t*16)%26,0,7);c.stroke();c.fillStyle="#8a6959";c.fillRect(w*.74-11,h*.62,22,5);}
   const spot=cue();c.strokeStyle="#ffe9a2";c.beginPath();c.arc(spot.x*w,spot.y*h,13+3*Math.sin(t*3),0,7);c.stroke();
   if(boatArt?.naturalWidth)c.drawImage(boatArt,boat.x*w-15,boat.y*h-24,30,48);
  };
 }
 return {sites,styles,manoeuvres,clean,signature,technique,visitCandidate,openChart};
})();
