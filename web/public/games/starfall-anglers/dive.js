"use strict";
const Dive = (() => {
 const depthY=y=>.18+(y-.55)*1.72;
 const surfaceY=y=>Math.min(.92,Math.max(.55,.55+(y-.18)/1.72));
 function school(place,time,conditions){
  const pool=Waters.pools[place];
  return [0,4,1,5,2].map((index,lane)=>{
   const f=pool[index],u=time*[.25,.20,.18,.16,.14][lane]+lane*2.20+place*.8;
   let y=.29+lane*.105+Math.cos(1.31*u)*.05;
   if(conditions){
    const original=Waters.layerOf(f.id),effective=Voyage.layer(f,original,conditions);
    if(effective<original||(conditions.time===2&&f.id==="lanternjaw"))y=.23+.10*Math.sin(u*.67)**2;
   }
   return {f,x:.5+Math.sin(u)*(.35-.012*lane),y,
    flip:Math.cos(u)<0,size:[.085,.112,.135,.105,.157][lane],angle:.044*Math.cos(u*1.5)};
  });
 }
 function swim(ctx,img,x,y,len,flip,angle,time,opacity=1){
  if(!img?.naturalWidth)return;
  ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.scale(flip?-1:1,1);ctx.globalAlpha=opacity;
  const h=len*img.height/img.width, slices=8;
  for(let i=0;i<slices;i++){
   const a=Math.round(img.width*i/slices),b=Math.round(img.width*(i+1)/slices);
   const bend=Math.sin(time*5.6+i*.45)*Math.max(0,1-i/5)**2*h*.10;
   ctx.drawImage(img,a,0,b-a,img.height,-len/2+len*i/slices,-h/2+bend,len/slices+.25,h);
  }
  ctx.restore();
 }
 function paint(ctx,v){
  const {w,h,t,phase,place,target,hot,fight,active,catchInfo,lure,sprite,clock}=v;
  const circle=(x,y,r,color)=>{ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=1;ctx.arc(x,y,r,0,2*Math.PI);ctx.stroke();};
  for(let i=0;i<25;i++){
   const x=w*((i*.618+0.12)%1)+Math.sin(t*.65+i)*3,y=h*(1-((i*.283+t*(i%3+1)*.023)%1));
   circle(x,y,i%4===0?2.2:1,"#ceffed7f");
  }
  const list=school(place,t,v.conditions);
  for(const s of list)swim(ctx,sprite(s.f.id),w*s.x,h*s.y,w*s.size,s.flip,s.angle,t+s.f.tier,.84);
  const gx=hot.x*w,gy=depthY(hot.y)*h;
  for(let i=0;i<5;i++){
   const a=i*1.257+t*.5,xx=gx+Math.cos(a)*w*.029,yy=gy+Math.sin(a)*h*.03;
   ctx.fillStyle="#ffdd8c";ctx.fillRect(Math.round(xx),Math.round(yy),2,2);
  }
  let x=target.x*w,y=depthY(target.y)*h;
  if(phase==="ready"||phase==="escape"||phase==="charge"){
   const sz=Math.max(10,w*.031);
   ctx.strokeStyle="#fff2b8";ctx.lineWidth=1.3;
   for(const [dx,dy] of [[-1,-1],[-1,1],[1,-1],[1,1]]){
    ctx.beginPath();ctx.moveTo(x+dx*(sz-4),y+dy*sz*.65);ctx.lineTo(x+dx*sz,y+dy*sz*.65);ctx.lineTo(x+dx*sz,y+dy*(sz*.65-4));ctx.stroke();
   }
   return;
  }
  if(phase==="released"&&catchInfo){
   const u=Math.min(1,clock/1.25);swim(ctx,sprite(catchInfo.f.id),w*(.7-.57*u),h*(.58-.12*Math.sin(u*Math.PI)),w*(.24-.12*u),true,Math.sin(u*4)*.14,t);return;
  }
  if(phase==="catch"||!active)return;
  if(Number.isInteger(v.seaLayer))y=h*(.27+.21*v.seaLayer)+Math.sin(t*2)*h*(v.trolling?.016:.005);
  if(phase==="flight")y*=Math.min(1,clock/.68);
  if(phase==="fight"){x+=Lantern.pullOffset(fight)*w;x+=Math.sin(t*3.2)*w*.035+fight.progress*w*.055;y+=Math.cos(t*3.6)*h*.04;if(fight.burstLeft>0)y+=Math.sin((1.35-fight.burstLeft)*Math.PI/1.35)*h*.18;}
  ctx.strokeStyle="#e8f5d3ce";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+w*.06,0);ctx.quadraticCurveTo(x+w*.02,y*.45,x,y);ctx.stroke();
  const bait=sprite(lure);if(bait.naturalWidth){const size=Math.max(13,w*.042);ctx.drawImage(bait,x-size*.5,y-size*.6,size,size);}
  if(["wait","bite","fight"].includes(phase)){
   const approach=phase==="wait"?Math.min(1,clock/v.biteAfter):1;
   const length=w*(.095+.022*active.tier+(fight?.progress||0)*.085);
   swim(ctx,sprite(active.id),x-length*.42-(1-approach)*w*.31,y+(1-approach)*h*.15+Math.sin(t*2)*2,length,false,Math.cos(t*3)*.075,t);
  }
 }
 return{swim,school,depthY,surfaceY,paint};
})();
