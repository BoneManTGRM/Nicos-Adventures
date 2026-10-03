import {num,type Build,type Drive} from './save';
import {tickSmash} from './smashObjects';
import {coursePosition} from './courseLayout';
import {tickTurbo} from './turbo';
import {initialSkyState,tickSkyObjects,type SkyObject} from './skyObjects';
export type DriveInput={gas:boolean;brake:boolean;tool:boolean;boost?:boolean};
export const has=(b:Build,id:number)=>b.parts.includes(id);
export function carStats(b:Build){
 const f=b.parts[0]-1,w=b.parts[1]-11,m=b.parts[2]-21,s=b.parts[3]-31;
 const radius=[25,35,24,22,28,29,36,30,27,31][w];
 let mass=[8,10,15,6,14,11,8,9,9,14][f]+[3,7,3,2,4,5,4,4,5,3][w]+[6,5,4,8,7,2,10,5,4,12][m];
 mass+=(b.parts[5]?3:0)+(has(b,48)?7:0)+(b.parts[6]?2:0)+(b.parts[11]?2:0)+(has(b,69)&&has(b,68)?5:0);
 const width=[64,88,82,67,65,94,76,70,60,82][f],clearance=[25,17,30,23,25,28,22,36,20,34][f]+[0,0,4,10,-3,-3,14,0,3,4][s];
 const power=[390,435,305,385,320,300,465,350,240,490][m],speed=[410,440,340,295,525,345,275,390,240,480][m];
 return {mass,radius,width,wheelbase:width*.76*b.span*(has(b,50)?1.2:1),clearance,power:power*1.07*(has(b,41)?1.35:has(b,42)?.75:1),speed:speed*1.08*(has(b,41)?.7:has(b,42)?1.2:1),spring:[1,1.45,.65,.8,.7,1.25,.8,1.1,1,.9][s],damping:[.85,1.2,1.05,.85,.75,1.1,.9,1.65,1.05,1][s],grip:[1.05,1,.48,.9,1,1.25,.9,1.12,1.3,.92][w],strength:[1,1.2,1.5,.85,1.45,1.1,1,1.05,1.25,1.2][f]*1.10*(b.parts[5]?1.12:1),comX:b.engineX*(has(b,49)?28:18)+(f===4?9:0)+(b.parts[5]===51?5:0),comY:b.engineY*18+(has(b,48)?12:0)-(f===9?7:0),wheelCount:has(b,39)||has(b,45)?3:2};
}
const profile=[[0,0],[300,0],[490,-90],[535,-90],[585,30],[780,30],[950,-15],[1090,0],[1170,0],[1340,-125],[1380,-125],[1420,35],[1680,35],[1840,-30],[2000,0]];
export function waterGap(x:number){const mapped=coursePosition(x);if(mapped===null)return false;x=mapped;const p=((x-280)%2000+2000)%2000;return x>280&&p>1430&&p<1660;}
export function terrainAt(x:number,track=0,bridges:number[]=[]):number{
 const mapped=coursePosition(x);if(mapped===null)return 330;x=mapped;
 if(x<280)return 330;const cell=Math.floor((x-280)/2000),p=(x-280)%2000;
 if(bridges.includes(cell)&&p>=1390&&p<=1690)return 325;
 const scale=1+Math.min(cell*.08,.55)+(track===1?.12:track===2?.05:0);
 for(let i=1;i<profile.length;i++)if(p<=profile[i][0]){const [a,ay]=profile[i-1],[b,by]=profile[i];const h=ay+(by-ay)*(p-a)/(b-a);return 330+h*scale+(track===1?Math.sin(p*.018)*9:track===2?Math.sin(p*.038)*5:0);}
 return 330;
}
export function makeDrive(build:Build,id=1,track=0,practice=false):Drive{const st=carStats(build);return {id,track,practice,build:structuredClone(build),t:0,x:90,y:330-st.radius-st.clearance-4,vx:0,vy:0,a:0,av:0,air:0,launchX:90,bestJump:0,distance:0,broken:[],debris:[],ended:false,reason:0,landings:0,contacts:0,cargo:true,bridges:[],toolAt:-100,rope:0,boostCharge:100,boostLocked:false,boostActive:false,sky:initialSkyState()};}
export function wheelPoints(r:Drive){const s=carStats(r.build);return Array.from({length:s.wheelCount},(_,i)=>{const localX=(i===0?-s.wheelbase:i===1?s.wheelbase:0)-s.comX,localY=s.clearance-s.comY;return {i,lx:localX,ly:localY,x:r.x+Math.cos(r.a)*localX-Math.sin(r.a)*localY,y:r.y+Math.sin(r.a)*localX+Math.cos(r.a)*localY};});}
function detach(r:Drive,kind:number,id:number,x:number,y:number,radius=18){if(!id||r.broken.includes(kind))return;r.broken.push(kind);r.debris.push({id,kind,x,y,vx:r.vx+(kind%2?80:-65),vy:Math.min(r.vy,-60)-80-kind*5,a:r.a,av:kind%2?4:-3,r:radius});if(r.debris.length>22)r.debris.shift();}
function impact(r:Drive,s:ReturnType<typeof carStats>,speed:number,roof=false){
 const severity=speed/(s.strength*(.85+s.damping*.18));if(severity<560)return;const p=r.build.parts;
 detach(r,12,p[8],r.x-45,r.y-30);detach(r,13,p[9],r.x+15,r.y-55);
 if(severity>580){detach(r,11,p[7],r.x,r.y-18,30);r.cargo=false;}
 if(severity>670){const w=wheelPoints(r).find(w=>!r.broken.includes(w.i));if(w)detach(r,w.i,p[1],w.x,w.y,s.radius);}
 if(severity>870||roof&&severity>650){for(const w of wheelPoints(r))detach(r,w.i,p[1],w.x,w.y,s.radius);detach(r,14,p[2],r.x+s.comX,r.y-6);detach(r,15,p[5],r.x+s.width,r.y);detach(r,16,p[6],r.x-25,r.y-45);r.ended=true;r.reason=1;}
}
/** A drop is a bounded impact, not an instant total-loss or an ownership penalty. */
function skyImpact(r:Drive,s:ReturnType<typeof carStats>,drop:SkyObject){
 const resistance=s.strength;
 r.vx*=Math.max(.76,1-.16/resistance);
 r.vy=Math.min(1200,r.vy+(60+drop.kind*12)/resistance);
 r.av=num(r.av+(drop.x<r.x?-.22:.22)/resistance,-8,8);
 // Roof accessories absorb the first hits; only later hits can remove a wheel.
 if(resistance>1.7+drop.kind*.15)return;
 const p=r.build.parts;
 for(const [kind,id,x,y,size]of [[13,p[9],r.x+15,r.y-55,18],[12,p[8],r.x-45,r.y-30,18],[11,p[7],r.x,r.y-18,30],[15,p[5],r.x+s.width,r.y,18]]){
  if(id&&!r.broken.includes(kind)){detach(r,kind,id,x,y,size);if(kind===11)r.cargo=false;return;}
 }
 const wheel=wheelPoints(r).find(w=>!r.broken.includes(w.i));
 if(wheel)detach(r,wheel.i,p[1],wheel.x,wheel.y,s.radius);
}
/** Fixed 120 Hz simulation; the renderer is a read-only consumer. */
export function stepDrive(r:Drive,input:DriveInput,dt=1/120):void{
 const previousX=r.x;
 dt=num(dt,0,1/60,1/120);if(!dt)return;r.t+=dt;const s=carStats(r.build),b=r.build,wasEnded=r.ended;
 for(const d of r.debris){d.vy+=850*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.a+=d.av*dt;const ground=terrainAt(d.x,r.track,r.bridges);if(d.y+d.r>ground){d.y=ground-d.r;if(d.vy>0)d.vy*=-.36;d.vx*=.985;d.av*=.988;}d.vx*=.999;}
 if(wasEnded){r.boostActive=false;r.vx*=.98;r.av*=.96;return;}
 // The turbo pedal also accelerates, so children can use it with one thumb.
 const gas=input.gas||!!input.boost;
 const poweredContact=r.contacts>0&&wheelPoints(r).some(w=>!r.broken.includes(w.i)&&(w.i===0||has(b,44)||has(b,45))&&w.y+s.radius>=terrainAt(w.x,r.track,r.bridges)-3);
 const boosting=tickTurbo(r,!!input.boost,input.brake,dt,poweredContact);
 if(input.tool&&r.t-r.toolAt>1.2){const phase=((r.x-280)%2000+2000)%2000;
  if(has(b,61)){const post=Math.ceil((r.x+50)/500)*500;if(post-r.x<300){r.vx+=110;r.vy-=80;r.rope=r.t+.65;r.toolAt=r.t;}}
  if(has(b,62)&&phase>1150&&phase<1720){const cell=Math.floor((r.x-280)/2000);if(!r.bridges.includes(cell))r.bridges.push(cell);r.bridges=r.bridges.slice(-12);r.toolAt=r.t;}
  if(has(b,70)){r.av=-r.a*3;r.vy=-200;r.toolAt=r.t;}}
 const inertia=s.mass*(s.width*s.width/3+600),c=Math.cos(r.a),sn=Math.sin(r.a);
 // Stronger pitch damping keeps the small speed increase controllable on landings.
 // Impacts, component loss, braking and signed air-tilt inputs remain active.
 let fx=-r.vx*s.mass*.09,fy=900*s.mass,torque=-r.av*inertia*9,contacts=0,maxImpact=0;
 // More pulling force at low speed, tapering back to the original drive force.
 // Keep each motor's top-speed limit, mass, grip and gearbox trade-offs.
 const lowSpeedPull=1+4.5*Math.max(0,1-Math.abs(r.vx)/260);
 const ground=(x:number)=>waterGap(x)&&has(b,63)?Math.min(terrainAt(x,r.track,r.bridges),333):terrainAt(x,r.track,r.bridges);
 for(const w of wheelPoints(r)){
  if(r.broken.includes(w.i))continue;const gy=ground(w.x),slope=num((ground(w.x+3)-ground(w.x-3))/6,-2,2),len=Math.hypot(1,slope),nx=slope/len,ny=-1/len;
  const rx=w.x-r.x,ry=w.y-r.y,pvx=r.vx-r.av*ry,pvy=r.vy+r.av*rx,penetration=w.y+s.radius-gy;
  if(penetration>0){contacts++;maxImpact=Math.max(maxImpact,-(pvx*nx+pvy*ny));
   const k=s.mass*90*s.spring/s.wheelCount,damp=s.mass*7*s.damping/s.wheelCount,normal=num(k*penetration-damp*(pvx*nx+pvy*ny),0,s.mass*6500/s.wheelCount);
   let wx=normal*nx,wy=normal*ny;const powered=w.i===0||has(b,44)||has(b,45),gear=has(b,43)?(slope<-.2?1.3:.93):1;
   let drive=powered&&gas&&!r.broken.includes(14)?s.power*21*lowSpeedPull*gear*s.grip*(boosting?1.65:1)/s.wheelCount:0;if(r.vx>s.speed*(boosting?1.15:1))drive=0;
   if(input.brake)drive=r.vx>12?-s.mass*(has(b,47)?300:600)/s.wheelCount:-s.mass*150/s.wheelCount;
   if(!gas&&!input.brake&&has(b,46))drive=-s.mass*r.vx*8/s.wheelCount;drive-=pvx*s.mass*.4/s.wheelCount;
   if(waterGap(w.x)&&!has(b,63)&&!has(b,64))drive-=pvx*s.mass*(b.parts[1]===16?.35:.8)/s.wheelCount;
   if(has(b,63)&&!waterGap(w.x))drive*=.87;if(has(b,64)&&waterGap(w.x)&&gas)drive+=s.mass*190/s.wheelCount;
   wx+=drive/len;wy+=drive*slope/len;fx+=wx;fy+=wy;torque+=rx*wy-ry*wx;
  }
 }
 for(const lx of [-s.width,s.width])for(const ly of [-28,8]){const rx=c*(lx-s.comX)-sn*(ly-s.comY),ry=sn*(lx-s.comX)+c*(ly-s.comY),x=r.x+rx,y=r.y+ry,pen=y-ground(x);if(pen>0){const vy=r.vy+r.av*rx,force=num(pen*s.mass*110-vy*s.mass*6,0,s.mass*7000);fy-=force;torque-=rx*force;fx-=r.vx*s.mass*(has(b,56)||has(b,60)||b.parts[0]===7?.8:2.5);if(vy>450)impact(r,s,vy,ly<0);if(pen>50){r.y-=Math.min(pen-45,8);r.vy=Math.min(r.vy,100);}}}
 if(has(b,58)&&r.a<-.35)torque+=Math.abs(r.a)*inertia*4;if(has(b,55)&&Math.abs(r.a)>1.65)torque+=Math.sign(r.a)*inertia*1.5;
 if(!contacts){torque-=r.a*inertia*1.5;if(r.contacts>0)r.launchX=r.x;r.air+=dt;if(input.gas)torque-=inertia*.55;if(input.brake)torque+=inertia*.55;if(has(b,65)&&r.air>.2&&r.vy>0&&Math.abs(r.vx)>90){fy*=.3;r.vy=Math.min(r.vy,140);}}
 else{if(r.air>.16){r.landings++;if(Math.abs(r.a)<.8)r.bestJump=Math.max(r.bestJump,Math.max(0,r.x-r.launchX)/12);impact(r,s,maxImpact);}r.air=0;}
 r.contacts=contacts;r.vx=num(r.vx+fx/s.mass*dt,-160,700);r.vy=num(r.vy+fy/s.mass*dt,-1000,1200);r.av=num(r.av+torque/inertia*dt,-8,8);r.x=Math.max(40,r.x+r.vx*dt);r.y+=r.vy*dt;r.a=Math.atan2(Math.sin(r.a+r.av*dt),Math.cos(r.a+r.av*dt));
 if(!r.ended)r.distance=Math.max(r.distance,Math.min(10000,Math.max(0,r.x-90)/12));
 if(r.y>1200||r.x>=120090||r.broken.filter(i=>i<3).length>=s.wheelCount){r.ended=true;r.reason=r.x>=120090?4:1;}
 if(!r.ended){
  tickSmash(r,previousX,s.width,(x)=>terrainAt(x,r.track,r.bridges));
  const skyHit=tickSkyObjects(r,dt,{width:s.width,comX:s.comX,comY:s.comY,wheels:wheelPoints(r).filter(w=>!r.broken.includes(w.i)).map(w=>({x:w.x,y:w.y,r:s.radius})),ground:(x)=>terrainAt(x,r.track,r.bridges)});
  if(skyHit)skyImpact(r,s,skyHit);
  if(r.broken.filter(i=>i<3).length>=s.wheelCount){r.ended=true;r.reason=1;}
 }
 if(r.ended&&r.reason===0)r.reason=1;
}
