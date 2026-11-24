"use strict";
const Aquarium = (() => {
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const seed=id=>Array.from(id).reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,7);
 const traits=[
  {name:["Curious","Curioso"],note:["Comes close to inspect a tap.","Se acerca a investigar cuando tocas el cristal."]},
  {name:["Shy","Tímido"],note:["Peeks out from cover until it learns your hand.","Se asoma desde su refugio hasta que reconoce tu mano."]},
  {name:["Playful","Juguetón"],note:["Swims a loop around a visitor.","Da una vuelta alrededor de quien lo visita."]},
  {name:["Explorer","Explorador"],note:["Swims past you, then comes back for a second look.","Pasa de largo y vuelve para mirar otra vez."]}
 ];
 function personality(key){
  const [family,n]=key.split("~");
  return (seed(family)+(Number(n)||1)-1)%traits.length;
 }
 function greet(tank,key,x,y,meals=0,instant=false){
  const s=tank.swimmers.find(f=>f.key===key);if(!s)return false;
  s.greeting={x:clamp(x,.16,.84),y:clamp(y,.25,.75),age:0,trust:Math.min(1,meals/3)};
  if(meals>=3)s.heart=1;
  if(instant){const at=greetingTarget(s);s.x=clamp(at.x,.11,.89);s.y=clamp(at.y,.13,.88);s.greeting=null;}
  return true;
 }
 function greetingTarget(s){
  const {x,y,age,trust}=s.greeting,angle=age*2;
  if(s.trait===1){const peek=trust+(1-trust)*Math.min(.32,age*.08),cover=s.index%2?.80:.20;return{x:cover+(x-cover)*peek,y:.76+(y-.76)*peek};}
  if(s.trait===2)return {x:x+.095*Math.cos(angle),y:y+.065*Math.sin(angle)};
  if(s.trait===3)return {x:x+.16*Math.sin(angle*.6),y:y+.05*Math.cos(angle)};
  return {x,y};
 }
 function swimmer(key,index,total,byId){
  const f=byId(Waters.speciesId(key)),n=seed(key),phase=n%628/100;
  const size=clamp(.115+.029*Math.log2(1+f.max)+((n%9)/650),.12,.265);
  return {key,f,phase,size,index,trait:personality(key),greeting:null,x:total>8?.20+.29*(index%3):.16+((index*.57+.22)% .68),y:total>8?.13+.75*(Math.floor(index/3)+.5)/Math.ceil(total/3):.24+.5*(index+.5)/total,
   depth:(n%100)/100,speed:.076+(n%32)/850,dx:index%2?-.045:.045,dy:0,face:index%2?-1:1,chew:0,heart:0};
 }
 function create(ids,habitat,byId,{visitors=ids.length===0,away=[]}={}){
  const keys=visitors?Waters.residentRoster[habitat].map(id=>habitat+":"+id).filter(k=>!away.includes(k)):ids;
  return {swimmers:keys.map((key,i)=>swimmer(key,i,keys.length,byId)),visitors,habitat,time:0,food:[],ripples:[],departures:[],focused:null,lit:true,lead:null};
 }
 function stock(tank,key,byId){
  if(tank.swimmers.some(s=>s.key===key))return false;
  tank.departures=tank.departures.filter(d=>d.fish.key!==key);
  const lanes=new Set(tank.swimmers.map(s=>s.index));
  let index=0;while(lanes.has(index))index++;
  const s=swimmer(key,index,tank.swimmers.length+1,byId);
  s.x=.82;s.y=.54;s.face=-1;tank.swimmers.push(s);return true;
 }
 function release(tank,key,animated=true){
  const s=tank.swimmers.find(s=>s.key===key);if(!s)return false;
  tank.swimmers=tank.swimmers.filter(f=>f!==s);tank.food=tank.food.filter(p=>p.forKey!==key);
  if(tank.lead?.key===key)tank.lead=null;
  if(tank.focused===key)tank.focused=null;
  if(animated)tank.departures.push({fish:s,x:s.x,y:s.y,age:0});
  return true;
 }
 function treat(tank,key,instant=false){
  const s=tank.swimmers.find(s=>s.key===key);if(!s||tank.food.some(p=>p.forKey===key))return false;
  s.greeting=null;
  if(instant){s.heart=1;s.chew=.64;return true;}
  tank.food.push({forKey:key,x:clamp(s.x+(s.face>=0?.10:-.10),.13,.87),y:clamp(s.y-.045,.14,.79),age:0,seed:s.index});
  if(tank.lead?.key===key)tank.lead=null;
  return true;
 }
 function guide(tank,key,x,y){
  if(!tank.swimmers.some(s=>s.key===key))return false;
  tank.lead={key,x:clamp(x,.13,.87),y:clamp(y,.17,.83),left:6};return true;
 }
 function feed(tank,x,y){
  const cx=clamp(x,.15,.85),cy=clamp(y,.16,.73);
  // Bound work even if the glass is tapped repeatedly.
  tank.food=[...tank.food.filter(p=>p.forKey),...tank.food.filter(p=>!p.forKey).slice(-10)];
  for(let i=0;i<6;i++)tank.food.push({x:clamp(cx+(i-2.5)*.019,.09,.91),y:cy-.1-Math.abs(i-2.5)*.015,age:0,seed:i});
  tank.ripples.push({x:cx,y:cy-.11,age:0});tank.ripples=tank.ripples.slice(-12);
 }
 function advance(tank,dt){
  tank.time+=dt;
  const eaten=[];
  if(tank.lead){tank.lead.left-=dt;if(tank.lead.left<=0)tank.lead=null;}
  for(const d of tank.departures)d.age+=dt;
  tank.departures=tank.departures.filter(d=>d.age<2.2);
  for(const p of tank.food){p.age+=dt;p.y=Math.min(.9,p.y+dt*.030);p.x+=Math.sin(tank.time*1.3+p.seed)*.004*dt;}
  tank.food=tank.food.filter(p=>p.age<11);
  for(const r of tank.ripples)r.age+=dt;
  tank.ripples=tank.ripples.filter(r=>r.age<.85);
  const crowded=tank.swimmers.length>8;
  const rows=crowded?Math.ceil((1+Math.max(...tank.swimmers.map(f=>f.index)))/3):1;
  for(const s of tank.swimmers){
   const clock=tank.time*s.speed*3+s.phase;
   let gx=.50+.34*Math.sin(clock)+.038*Math.sin(clock*2.7+s.index);
   let gy=.28+.36*s.depth+.13*Math.sin(clock*.81+s.phase);
   if(crowded){
    gx=.20+.30*(s.index%3)+.13*Math.sin(clock);
    gy=.13+.75*(Math.floor(s.index/3)+.5)/rows+.045*Math.sin(clock*.81+s.phase);
   }
   if(tank.decor?.length&&!s.greeting&&!tank.lead&&(Math.cos(clock*.34)>.35)){
    const pref=/eel|cat|shark/.test(s.f.id)?0:/ray|skate/.test(s.f.id)?3:s.trait===1?2:1;
    const home=tank.decor.find(o=>o.type===pref)||tank.decor[s.index%tank.decor.length];
    gx=home.x+.055*Math.sin(clock);gy=home.y-.04+.03*Math.cos(clock);
   }
   if(s.trickTime>0)s.trickTime=Math.max(0,s.trickTime-dt);
   if(s.greeting){
    s.greeting.age+=dt;
    if(s.greeting.age<5){const at=greetingTarget(s);gx=at.x;gy=at.y;}else s.greeting=null;
   }else if((tank.time%18)>9){
    if(s.trait===1){gy=Math.min(.83,gy+.12);}
    if(s.trait===2){gx+=.04*Math.cos(clock*3);gy+=.075*Math.sin(clock*3);}
    if(s.trait===3){gx+=.045*Math.sin(clock*.5);}
   }
   let food=null,dist=Infinity;
   s.heart=Math.max(0,s.heart-dt*.8);
   const follow=tank.lead?.key===s.key;
   for(const p of tank.food){
    if(p.forKey&&p.forKey!==s.key)continue;
    if(p.forKey===s.key){food=p;break;}
    if(follow)continue;
    const d=Math.hypot(p.x-s.x,(p.y-s.y)*.65);if(d<dist){food=p;dist=d;}
   }
   if(follow){gx=tank.lead.x;gy=tank.lead.y;}
   const hunting=food&&s.chew<=0;
   if(hunting){gx=food.x;gy=food.y;}
   // Keep silhouettes legible when two animals round the same corner.
   let repelX=0,repelY=0;
   for(const other of tank.swimmers){
    if(other===s)continue;
    const vx=s.x-other.x,vy=s.y-other.y,d=Math.hypot(vx,vy*.7);
    if(d>.001&&d<.12){const force=(.12-d)*(hunting?.28:1);repelX+=vx/d*force;repelY+=vy/d*force;}
   }
   const dx=gx-s.x+repelX,dy=gy-s.y+repelY,span=Math.max(.065,Math.hypot(dx,dy*.65)),speed=s.speed*(hunting||follow?1.85:s.greeting?1.45+.4*s.greeting.trust:1);
   const ease=1-Math.exp(-dt*(hunting?3.1:1.65));
   s.dx+=(dx/span*speed-s.dx)*ease;s.dy+=(dy/span*speed-s.dy)*ease;
   s.x=clamp(s.x+s.dx*dt,.11,.89);s.y=clamp(s.y+s.dy*dt,.13,.88);
   if(Math.abs(s.dx)>.009)s.face+=(Math.sign(s.dx)-s.face)*(1-Math.exp(-dt*4.6));
   s.chew=Math.max(0,s.chew-dt);
   if(hunting&&Math.hypot(s.x-food.x,(s.y-food.y)*.65)<s.size*.30){
    tank.food.splice(tank.food.indexOf(food),1);s.chew=.68;
    if(food.forKey){s.heart=1;eaten.push(s.key);}
    tank.ripples.push({x:s.x+s.size*.24*Math.sign(s.face),y:s.y,age:.22});
   }
  }
  return eaten;
 }
 function drawSize(tank,s){
  return s.size*Math.sqrt(8/Math.max(8,tank.swimmers.length));
 }
 function nearest(tank,x,y,aspect){
  let result=null,best=1;
  for(const s of tank.swimmers){
   const size=drawSize(tank,s);
   const d=Math.hypot((s.x-x)/Math.max(.05,size*.51),(s.y-y)/(Math.min(.16,size*aspect*.26)+.025));
   if(d<=best){best=d;result=s;}
  }
  return result;
 }
 function paint(ctx,w,h,tank,sprite){
  const t=tank.time;
  ctx.clearRect(0,0,w,h);
  if(!tank.lit){ctx.fillStyle="rgba(7,17,46,.57)";ctx.fillRect(0,0,w,h);}
  ctx.save();
  for(let i=0;i<4;i++){
   const x=(.1+i*.26+Math.sin(t*.14+i)*.018)*w;
   const grad=ctx.createLinearGradient(x,0,x,h*.88);
   grad.addColorStop(0,tank.lit?"rgba(255,255,198,.11)":"rgba(121,186,244,.13)");grad.addColorStop(1,"rgba(157,238,204,0)");
   ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+w*.043,0);ctx.lineTo(x-w*.16,h*.86);ctx.lineTo(x-w*.28,h*.86);ctx.fill();
  }
  for(let i=0;i<24;i++){
   const x=w*((i*.618+.009*Math.sin(t*.7+i)+1)%1),y=h*(1-(i*.283+t*(.018+i%3*.005))%1),r=Math.max(1,w*(i%4===0?.0032:.0016));
   if(i%3){ctx.fillStyle=tank.lit?"#d1fff178":"#baffbcb3";ctx.fillRect(x,y,r,r);}
   else{ctx.strokeStyle="#c7fff380";ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.stroke();}
  }
  if(tank.decor?.length)ReefStudio.paint(ctx,w,h,tank.decor);
  for(const s of tank.swimmers.slice().sort((a,b)=>a.depth-b.depth)){
   const x=s.x*w,y=s.y*h,len=drawSize(tank,s)*w,img=sprite(s.f.id);
   if(s.trickTime>0&&s.trick==="jet"){ctx.fillStyle="#c2fbff";for(let j=1;j<11;j++){const u=j/11;ctx.fillRect(x+(w*.5-x)*u,y+(h*.24-y)*u-Math.sin(u*Math.PI)*h*.1,3,3);}}
   if(!img.naturalWidth)continue;
   const angle=clamp(s.dy*Math.sign(s.face)*1.65,-.19,.19);
   ctx.save();ctx.translate(x,y);ctx.scale(.52+.48*Math.abs(s.face),1);
   if(s.key===tank.focused){ctx.strokeStyle="#ffe9a6d9";ctx.lineWidth=Math.max(1,w/600);ctx.setLineDash([3,4]);ctx.beginPath();ctx.ellipse(0,0,len*.54,Math.min(len*img.height/img.width*.54,h*.18)+3,0,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);}
   const capped=Math.min(len,(h*.36)*img.width/img.height);
   Dive.swim(ctx,img,0,0,capped,s.face<0,angle,(t*(s.chew>0?1.65:1)+s.phase),.9+.10*s.depth);ctx.restore();
  }
  for(const s of tank.swimmers){
   if(s.heart<=0)continue;
   const px=Math.max(2,Math.round(w*.003)),x=s.x*w,y=s.y*h-(.11+.07*(1-s.heart))*h;
   ctx.save();ctx.globalAlpha=Math.min(1,s.heart*2);ctx.fillStyle="#ff8e9e";
   for(const [yy,row] of ["0110110","1111111","1111111","0111110","0011100","0001000"].entries())for(let i=0;i<row.length;i++)if(row[i]==="1")ctx.fillRect(x+(i-3)*px,y+yy*px,px,px);
   ctx.restore();
  }
  if(tank.lead){
   const x=tank.lead.x*w,y=tank.lead.y*h;ctx.save();ctx.strokeStyle="#b6ffe6";ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(x,y,6+2*Math.sin(t*5),0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  // The open passage shows the departing animal's actual home water.
  if(tank.departures.length){
   const d=tank.departures[tank.departures.length-1],aperture=Math.min(1,d.age*3,(2.2-d.age)*3);
   const x=w*.90,y=h*.48,rx=w*.048,ry=h*.15;
   const home=sprite(Waters.places[d.fish.f.place].id);
   ctx.save();ctx.globalAlpha=clamp(aperture,0,1);ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
   ctx.fillStyle="#658f89";ctx.fill();ctx.save();ctx.clip();
   if(home.naturalWidth)ctx.drawImage(home,x-rx,y-ry,rx*2,ry*2);
   const shutter=rx*(1-clamp(d.age*2.5,0,1));ctx.fillStyle="#9d7f55";ctx.fillRect(x-rx,y-ry,shutter,2*ry);ctx.fillRect(x+rx-shutter,y-ry,shutter,2*ry);
   ctx.restore();ctx.strokeStyle="#313d39";ctx.lineWidth=Math.max(5,w*.009);ctx.stroke();
   ctx.strokeStyle="#e3bd76";ctx.lineWidth=Math.max(2,w*.004);ctx.stroke();
   for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillStyle="#ffedbb";ctx.fillRect(x+rx*Math.cos(a)-1,y+ry*Math.sin(a)-1,2,2);}
   ctx.restore();
  }
  for(const d of tank.departures){
   const s=d.fish,k=clamp((d.age-.10)/1.70,0,1),ease=k*k*(3-2*k);
   const x=(d.x+(.90-d.x)*ease)*w,y=(d.y+(.48-d.y)*ease-.10*Math.sin(k*Math.PI))*h;
   const alpha=clamp((1-k)*5,0,1);
   Dive.swim(ctx,sprite(s.f.id),x,y,drawSize(tank,s)*w*(1-.88*k),false,-.09*Math.sin(k*5),t*1.8,alpha);
   ctx.save();ctx.globalAlpha=alpha;
   for(let i=0;i<4;i++){ctx.strokeStyle="#cefff3ad";ctx.beginPath();ctx.arc(x-(.04+.018*i)*w,y-i*3,1+i*.6,0,2*Math.PI);ctx.stroke();}
   ctx.restore();
  }
  for(const p of tank.food){const x=p.x*w,y=p.y*h,r=Math.max(2,w*.004);ctx.fillStyle="#523123";ctx.fillRect(x-r,y-r,r*2,r*2);ctx.fillStyle=p.forKey?"#fff2a7":"#ffcf7e";ctx.fillRect(x-r,y-r,r*1.6,r);if(p.forKey){ctx.strokeStyle="#ffdf80";ctx.beginPath();ctx.arc(x,y,2*r+1,0,Math.PI*2);ctx.stroke();}}
  for(const r of tank.ripples){ctx.globalAlpha=1-r.age/.85;ctx.strokeStyle="#fff1c3";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(r.x*w,r.y*h,(.008+r.age*.045)*w,(.004+r.age*.024)*h,0,0,2*Math.PI);ctx.stroke();}
  ctx.restore();
 }
 return {create,stock,release,treat,guide,greet,traits,personality,feed,advance,nearest,drawSize,paint};
})();
