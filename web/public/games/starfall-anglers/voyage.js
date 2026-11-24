"use strict";
const Voyage=(()=>{
 const times=[["Daylight","Día"],["Dusk","Atardecer"],["Moonlight","Luz de luna"]];
 const weather=[["Clear","Despejado"],["Rain","Lluvia"]];
 const wildlife=[
  {id:"pelican",name:["Diving pelican","Pelícano pescador"],sign:["Diving birds","Aves en picada"],x:.30,y:.35,layer:0,
   note:["Follow its bill as it tips toward the sea. The splash marks a school of baitfish below.","Sigue su pico cuando apunta al mar. La salpicadura marca un cardumen bajo la superficie."]},
  {id:"dolphin",name:["Bottlenose dolphin","Delfín nariz de botella"],sign:["Bow riders","Delfines en la proa"],x:.69,y:.29,layer:1,
   note:["A second fin slips into the first dolphin’s wake. From the bow you can see the pair rise and dive together.","Otra aleta entra en la estela del primer delfín. Desde la proa se ve cómo suben y se sumergen juntos."]},
  {id:"whale-shark",name:["Whale shark","Tiburón ballena"],sign:["Spotted shadow","Sombra moteada"],x:.65,y:.69,layer:2,
   note:["The white spots appear before the whole shark comes into view. Watch its broad tail pass beneath the boat.","Las manchas blancas aparecen antes de que se vea el tiburón entero. Mira cómo pasa su enorme cola bajo la lancha."]}
 ];
 const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
 const period=240000;
 const start={x:.33,y:.65,angle:-.4};
 function validPoint(p){return p&&Number.isFinite(p.x)&&p.x>=.07&&p.x<=.93&&Number.isFinite(p.y)&&p.y>=.09&&p.y<=.91;}
 function clean(raw,world,now=Date.now()){
  const epoch=Number.isSafeInteger(raw?.epoch)&&raw.epoch>0&&raw.epoch<=now?raw.epoch:now;
  const base=Number.isInteger(raw?.base)&&raw.base>=0&&raw.base<12?raw.base:0;
  const sky=["auto","clear","rain"].includes(raw?.sky)?raw.sky:"auto";
  const anchors={},album={},legends={},hunts={};
  for(const p of world.places){
   const selected=raw?.hunts?.[p.id];
   if(world.pools[world.places.indexOf(p)].some(f=>f.tier===3&&f.id===selected))hunts[p.id]=selected;
   if(p.salt&&validPoint(raw?.anchors?.[p.id])){
    const a=raw.anchors[p.id];anchors[p.id]={x:a.x,y:a.y,angle:Number.isFinite(a.angle)?a.angle:0};
   }
  }
  for(const animal of wildlife){
   const shot=raw?.album?.[animal.id];
   if(shot&&world.places.some(p=>p.salt&&p.id===shot.port)&&Number.isInteger(shot.time)&&times[shot.time]&&typeof shot.photo==="string"&&shot.photo.length<=85000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(shot.photo))
    album[animal.id]={port:shot.port,time:shot.time,photo:shot.photo};
  }
  for(const f of world.fish)if(f.tier===3&&raw?.legends?.[f.id]===true)legends[f.id]=true;
  return {epoch,base,sky,anchors,album,legends,hunts};
 }
 function conditions(v,id,now=Date.now()){
  const step=v.base+Math.max(0,Math.floor((now-v.epoch)/period));
  const local=id==="seamount"||id==="aurora"?2:id==="cabo"?1:0;
  return {time:(step+local)%3,rain:v.sky==="rain"||(v.sky==="auto"&&[2,5,9].includes(step%12))};
 }
 function waitFor(v,id,time,now=Date.now()){
  const step=v.base+Math.max(0,Math.floor((now-v.epoch)/period));
  const delta=(time-conditions(v,id,now).time+3)%3;
  v.base=(step+(delta||3))%12;v.epoch=now;
 }
 function marks(id){
  // Each chart keeps its landmarks when revisited.
  const mirror=["reef","aurora","seamount"].includes(id),shift=id==="bank"||id==="reef"?.07:0;
  return wildlife.map(a=>({...a,x:mirror?1-a.x:a.x,y:a.y+shift}));
 }
 function nearest(id,point){
  if(!point)return null;
  const found=marks(id).map(m=>({m,d:Math.hypot(point.x-m.x,(point.y-m.y)*.76)})).sort((a,b)=>a.d-b.d)[0];
  return found.d<.145?found.m:null;
 }
 function steer(boat,goal,dt){
  const dx=goal.x-boat.x,dy=(goal.y-boat.y)*.76,d=Math.hypot(dx,dy);
  if(d<.004)return false;
  const portion=Math.min(1,dt*.29/d);
  boat.x=clamp(boat.x+dx*portion,.07,.93);boat.y=clamp(boat.y+dy*portion/.76,.09,.91);
  boat.angle=Math.atan2(dx,-dy);return true;
 }
 function anchorRing(v,id,fallback){
  const a=v.anchors[id];return a?{x:.14+a.x*.74,y:.59+a.y*.28}:fallback;
 }
 function applyRig(rig,v,place){
  if(!rig)return;
  rig.conditions=conditions(v,place.id);
  rig.layers=Object.fromEntries(Waters.pools[Waters.places.indexOf(place)].map(f=>[f.id,layer(f,Waters.layerOf(f.id),rig.conditions)]));
  const mark=nearest(place.id,v.anchors[place.id]);rig.anchorLayer=mark?.layer;
  if(rig.depth===rig.anchorLayer)rig.wait*=.76;
 }
 // Moonrise lifts deep swimmers one layer. Rain gathers small fish at the surface.
 function layer(f,depth,c){
  if(c?.time===2&&["lanternjaw","hatchet","moonopah","dorado","flyer","sail","ribbon","hawk"].includes(f.id))return 0;
  if(c?.rain&&f.tier===0)return 0;
  return depth;
 }
 function backdrop(place,c){
  if(place.id==="cabo"&&c.time===2)return "assets/cabo-night.webp";
  if(place.id==="seamount"&&c.time!==2)return "assets/seamount-day.webp";
  return "assets/"+place.id+".png";
 }
 function photo(port,c,canvas){
  const small=document.createElement("canvas");small.width=320;small.height=180;
  small.getContext("2d").drawImage(canvas,0,0,320,180);
  return {port,time:c.time,photo:small.toDataURL("image/jpeg",.72)};
 }
 return {start,times,weather,wildlife,clean,conditions,waitFor,marks,nearest,steer,anchorRing,applyRig,layer,backdrop,photo};
})();
