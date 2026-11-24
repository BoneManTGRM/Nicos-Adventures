"use strict";
const FishingRod=(()=>{
 const base={x:113,y:77}, pivot={x:154,y:134};
 const clamp=(value,lo,hi)=>Math.max(lo,Math.min(hi,value));
 function pose({phase,clock,time,power,fight,held,reduced,biteAfter}){
  let swing=0,flex=0,side=0;
  const motion=reduced?0:1;
  if(phase==="charge"){swing=power*23;flex=-power*12;}
  if(phase==="flight"){const u=clamp(clock/.68,0,1);swing=17*Math.exp(-u*11)-24*Math.sin(u*Math.PI)*Math.exp(-u*1.2);flex=23*Math.sin(2.5*Math.PI*u)*Math.exp(-u*2);}
  if(phase==="wait"&&clock>biteAfter-.82)flex=2+3*Math.sin(clock*18)*motion;
  if(phase==="bite"){swing=-5;flex=12+5*Math.sin(time*13)*motion;}
  if(phase==="fight"){
   const hook=Math.max(0,1-fight.age/.48),surge=fight.burstLeft>0?1:0;
   const counter=Math.max(0,1-(fight.age-(fight.turnAge??-8))/.8);
   side=(fight.turnSide==="left"?-1:1)*counter;
   swing=9*hook+(held?5:-2)-7*surge+side*13;
   flex=7+37*fight.tension+6*Number(!!fight.pulling)+surge*11-9*hook;
   flex+=motion*(Math.sin(time*(held?8:4))*1.9+side*3);
  }
  return {angle:swing*Math.PI/180,c1:{x:93+side*3,y:47+flex*.025},c2:{x:51+side*6,y:7+flex*.16},tip:{x:8+flex*.22+side*12,y:8+flex}};
 }
 function point(p,k){
  const a=1-k;
  return {x:a*a*a*base.x+3*a*a*k*p.c1.x+3*a*k*k*p.c2.x+k*k*k*p.tip.x,
   y:a*a*a*base.y+3*a*a*k*p.c1.y+3*a*k*k*p.c2.y+k*k*k*p.tip.y};
 }
 function draw(ctx,art,view,state,spool){
  const {w,h,rodW}=view,scale=rodW/160,p=pose(state);
  ctx.save();ctx.translate(w-(160-pivot.x)*scale,h-(140-pivot.y)*scale);ctx.rotate(p.angle);ctx.scale(scale,scale);ctx.translate(-pivot.x,-pivot.y);
  function stroke(a,b,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  ctx.lineCap="round";
  for(let i=0;i<16;i++){
   const k=i/16,a=point(p,k),b=point(p,(i+1)/16),diameter=1.15+(1-k)*3.8;
   stroke(a,b,"#423627",diameter+1.35);stroke({x:a.x,y:a.y-.5},{x:b.x,y:b.y-.5},i%4===2?"#e6bd71":"#d69753",diameter*.69);
  }
  const guides=[.04,.23,.46,.68,.85,1].map(k=>point(p,k));
  for(let i=0;i<guides.length;i++){
   const g=guides[i],r=2.35-i*.24;
   ctx.strokeStyle="#24363b";ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(g.x-1,g.y+1.1,r,r*.81,-.4,0,Math.PI*2);ctx.stroke();
  }
  ctx.beginPath();ctx.moveTo(108,97);for(const g of guides)ctx.lineTo(g.x-1,g.y+2);
  ctx.strokeStyle="#fff1c5a1";ctx.lineWidth=.8;ctx.stroke();
  // The lower half retains the original illustrated hand, cork grip and reel housing.
  if(art.naturalWidth)ctx.drawImage(art,0,75,160,65,0,75,160,65);
  const rx=109,ry=102;
  for(let i=0;i<3;i++){
   const a=spool+i*Math.PI*2/3;
   stroke({x:rx,y:ry},{x:rx+Math.cos(a)*5.3,y:ry+Math.sin(a)*4.6},"#96bdb5",1.35);
  }
  const crank={x:rx+Math.cos(spool+.5)*7.3,y:ry+Math.sin(spool+.5)*7.2};
  stroke({x:rx,y:ry},crank,"#4e4b39",2.4);ctx.fillStyle="#f3bb6c";ctx.fillRect(crank.x-1.3,crank.y-1.3,2.6,2.6);ctx.restore();
  const dx=p.tip.x-pivot.x,dy=p.tip.y-pivot.y;
  return {x:w-(160-pivot.x)*scale+(dx*Math.cos(p.angle)-dy*Math.sin(p.angle))*scale,
   y:h-(140-pivot.y)*scale+(dx*Math.sin(p.angle)+dy*Math.cos(p.angle))*scale};
 }
 function splash(ctx,x,y,age,amplitude){
  if(age<=0||age>=.7)return;
  const u=age/.7;
  ctx.save();ctx.globalAlpha=1-u;
  for(let i=0;i<10;i++){
   const side=i%2?-1:1,reach=amplitude*(.31+((i*7)%11)*.085),arc=amplitude*(.28+(i%4)*.18);
   ctx.fillStyle=i%3===0?"#ffebbd":"#dbffef";
   ctx.fillRect(Math.round(x+side*reach*u),Math.round(y-4*arc*u*(1-u)),i%3===0?3:2,2);
  }
  ctx.restore();
 }
 return{pose,point,draw,splash};
})();
