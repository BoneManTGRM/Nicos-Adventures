"use strict";
const ExpeditionPhoto=(()=>{
 const backgrounds=["trail-forest","trail-alpine","trail-canyon","trail-alpine"];
 const W=900,H=540, images=new Map();
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function loadImage(asset){
  if(!images.has(asset)){
   const pending=new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(asset));
    image.src="assets/"+asset+".webp";
   }).catch(error=>{images.delete(asset);throw error;});
   images.set(asset,pending);
  }
  return images.get(asset);
 }
 async function load(region){
  const [land,animal]=await Promise.all([loadImage(backgrounds[region]),loadImage(region===3?"expedition-party":"trail-animals")]);
  return {land,animal};
 }
 function moment(region,time,steady){
  const t=steady?0:time/1000,period=[1.10,.98,1.28,.84][region],wave=Math.sin(t*period);
  const x=.5+(region===1?.25*Math.sin(t*2.1)+.075*wave:.32*wave);
  const y=[.64,.68,.68,.47][region]-.055*Math.cos(t*(region===3?2.2:2.8));
  const glow=steady||Math.cos(t*1.45)>.40;
  return {x,y,flip:region===3?Math.cos(t*period)>0:Math.cos(t*period)<0,glow};
 }
 function capture(pose,aim){
  const distance=Math.abs(pose.x-aim);
  if(distance>.19)return null;
  const stars=1+Number(distance<=.085)+Number(distance<=.085&&pose.glow);
  return {...pose,aim,stars};
 }
 function clean(shot){
  if(!shot||![shot.x,shot.y,shot.aim].every(n=>Number.isFinite(n)&&n>=0&&n<=1)||typeof shot.glow!=="boolean"||typeof shot.flip!=="boolean")return null;
  return capture({x:shot.x,y:shot.y,flip:shot.flip,glow:shot.glow},shot.aim);
 }
 function createCanvas(){
  const canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;canvas.className="exp-film";return canvas;
 }
 function draw(canvas,art,region,pose,aim,{print=false,gold=false}={}){
  const ctx=canvas.getContext("2d");if(!ctx)return;
  ctx.save();ctx.clearRect(0,0,W,H);
  if(print){
   const zoom=1.38,sourceLeft=clamp(aim-1/(2*zoom),0,1-1/zoom);
   ctx.scale(zoom,zoom);ctx.translate(-W*sourceLeft,-H*.125);
  }
  const bw=art.land.naturalWidth,bh=art.land.naturalHeight,fit=Math.max(W/bw,H/bh);
  ctx.drawImage(art.land,(W-bw*fit)/2,(H-bh*fit)/2,bw*fit,bh*fit);
  if(region===3){
   const twilight=ctx.createLinearGradient(0,0,0,H);twilight.addColorStop(0,"rgba(22,10,75,.57)");twilight.addColorStop(1,"rgba(19,55,72,.12)");
   ctx.fillStyle=twilight;ctx.fillRect(0,0,W,H);
   ctx.fillStyle="#fff0ba";for(let i=0;i<26;i++)ctx.fillRect((i*179+71)%W,(i*97+39)%161,i%4===0?3:1.5,i%4===0?3:1.5);
  }
  const boss=region===3,sw=art.animal.naturalWidth/3,sh=art.animal.naturalHeight/(boss?1:3);
  const size=boss?224:185,ah=size*sh/sw;
  ctx.save();ctx.translate(W*pose.x,H*pose.y);
  if(!boss){ctx.fillStyle="#1b281655";ctx.beginPath();ctx.ellipse(0,ah*.30,size*.30,7,0,0,7);ctx.fill();}
  if(pose.glow){ctx.shadowColor=["#ddc5ff","#9bffec","#ffc66f","#ffd58c"][region];ctx.shadowBlur=16;}
  ctx.scale(pose.flip?-1:1,1);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(art.animal,(boss?1:2)*sw,(boss?0:region)*sh,sw,sh,-size/2,-ah/2,size,ah);ctx.restore();ctx.restore();
  if(!print){
   const cx=W*aim,cy=H*(boss?.47:.63),qw=91,qh=85;
   ctx.save();ctx.lineJoin="round";ctx.lineWidth=5;ctx.strokeStyle=pose.glow?"#ffe89b":"#edf4e8";ctx.shadowColor="#20372a";ctx.shadowBlur=4;
   for(const dx of [-1,1])for(const dy of [-1,1]){
    const x=cx+dx*qw,y=cy+dy*qh;ctx.beginPath();ctx.moveTo(x-dx*26,y);ctx.lineTo(x,y);ctx.lineTo(x,y-dy*24);ctx.stroke();
   }
   ctx.restore();
  }else{
   ctx.strokeStyle=gold?"#edc86c":"#f5eed8";ctx.lineWidth=16;ctx.strokeRect(8,8,W-16,H-16);
   if(gold){ctx.strokeStyle="#76562c";ctx.lineWidth=2;ctx.strokeRect(14,14,W-28,H-28);}
  }
 }
 return {load,moment,capture,clean,createCanvas,draw};
})();
