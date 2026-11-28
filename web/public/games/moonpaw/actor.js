'use strict';

// Angles are in degrees. Each local joint is applied within its parent's motion.
const idlePose={dx:0,dy:0,roll:0,stretch:1,shoulder:4,elbow:-13,wrist:4,head:0,
  freeArm:0,thigh:0,shin:0,otherLeg:0,tail:0,tailTip:0,cape:0};
const coilPose={dx:-38,dy:15,roll:9,stretch:.93,shoulder:38,elbow:-95,wrist:16,
  head:-10,freeArm:28,thigh:22,shin:-34,otherLeg:-10,tail:14,tailTip:-19,cape:-12};
const thrustPose={dx:43,dy:-8,roll:-8,stretch:1.055,shoulder:-7,elbow:10,wrist:-6,
  head:6,freeArm:-18,thigh:-18,shin:25,otherLeg:15,tail:-18,tailTip:25,cape:17};
const followPose={dx:8,dy:8,roll:4,stretch:.985,shoulder:12,elbow:13,wrist:4,
  head:-4,freeArm:-6,thigh:-5,shin:14,otherLeg:8,tail:-7,tailTip:21,cape:8};
const gestures={
  nova:{wind:{},strike:{}},
  solar:{wind:{shoulder:-27,elbow:-86,roll:-12},strike:{shoulder:24,elbow:8,wrist:14,roll:8}},
  cryo:{wind:{dx:-48,roll:6,shoulder:30,elbow:-101},strike:{dx:54,shoulder:-4,elbow:5,stretch:1.075}},
  gravity:{wind:{shoulder:55,elbow:-76,freeArm:34,dy:26},strike:{shoulder:-34,elbow:3,freeArm:-28,dy:-20}},
  comet:{wind:{shoulder:23,elbow:-88,head:10},strike:{shoulder:-42,elbow:-3,head:-9,freeArm:-25,dy:-21}},
  storm:{wind:{roll:13,shoulder:49,elbow:-104},strike:{roll:-12,wrist:-15,freeArm:-26},follow:{shoulder:-19,elbow:19}},
  super:{wind:{dx:-51,dy:25,stretch:.88,roll:18,elbow:-110,thigh:31,shin:-45,freeArm:43},strike:{dx:56,stretch:1.09,roll:-15,shoulder:-24,wrist:-16,freeArm:-45,thigh:-27,otherLeg:26},time:1.35},
  frost:{wind:{shoulder:23,elbow:-55,freeArm:28},strike:{shoulder:-29,elbow:9,freeArm:-38}},
  blink:{wind:{dx:-21,stretch:.92,shoulder:27,elbow:-59},strike:{dx:17,roll:-14,stretch:1.1,thigh:-25,otherLeg:-15}}
};
const poseKeys=Object.keys(idlePose);
let actorPose={...idlePose},acting=null,actorMotion=0,actorTime=0;
function mixPose(from,to,t){
  const k=t*t*(3-2*t),out={};
  for(const id of poseKeys)out[id]=from[id]+(to[id]-from[id])*k;
  return out;
}
function resetActor(){acting=null;actorPose={...idlePose};actorTime=0;actorMotion=0}
function actorPending(){return !!acting?.onContact}
function beginGesture(kind,power,onContact,urgent=false){
  if(actorPending()&&!urgent)return false;
  const shape=gestures[kind]||gestures.nova,scale=shape.time||1;
  const longCharge=power>=3;
  const prep=(longCharge?.09:.12)*scale,hit=prep+.095*scale;
  acting={kind,age:0,prep,hit,end:hit+.39*scale,from:{...actorPose},onContact,
    wind:{...coilPose,...shape.wind},strike:{...thrustPose,...shape.strike},follow:{...followPose,...shape.follow}};
  return true;
}
function advanceActor(dt,charge,motion,reduced){
  actorTime+=dt*(reduced?.36:1);actorMotion=motion;
  const a=acting;
  if(!a){
    const target=charge>0?mixPose(idlePose,coilPose,Math.min(.88,charge*.92)):idlePose;
    actorPose=mixPose(actorPose,target,Math.min(1,Math.sqrt(dt*8)));
    return;
  }
  a.age+=dt;
  if(a.age<a.prep)actorPose=mixPose(a.from,a.wind,a.age/a.prep);
  else if(a.age<a.hit)actorPose=mixPose(a.wind,a.strike,(a.age-a.prep)/(a.hit-a.prep));
  else{
    const recovery=(a.age-a.hit)/(a.end-a.hit);
    actorPose=recovery<.37?mixPose(a.strike,a.follow,recovery/.37):mixPose(a.follow,idlePose,Math.min(1,(recovery-.37)/.63));
    if(a.onContact){
      const effect=a.onContact;a.onContact=null;effect();
    }
    if(a.age>=a.end&&acting===a)acting=null;
  }
}
const unitMatrix=[1,0,0,1,0,0];
function joint(parent,x,y,degrees,sx=1,sy=1,dx=0,dy=0){
  const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  const a=c*sx,b=s*sx,d=c*sy,k=-s*sy;
  const tx=x+dx-a*x-k*y,ty=y+dy-b*x-d*y;
  return[parent[0]*a+parent[2]*b,parent[1]*a+parent[3]*b,parent[0]*k+parent[2]*d,parent[1]*k+parent[3]*d,
    parent[0]*tx+parent[2]*ty+parent[4],parent[1]*tx+parent[3]*ty+parent[5]];
}
function actorBones(){
  const p=actorPose,t=actorTime,wave=Math.sin(t*3.7),lag=Math.sin(t*3.7-.9);
  const root=joint(unitMatrix,419,286,p.roll,p.stretch,1/Math.sqrt(p.stretch)+wave*.006,p.dx,p.dy+Math.sin(t*2.1)*3);
  const arm=joint(root,557,276,p.shoulder);
  const elbow=joint(arm,618,246,p.elbow);
  const wrist=joint(elbow,679,207,p.wrist);
  const thigh=joint(root,252,415,p.thigh+wave*2.8);
  const shin=joint(thigh,229,432,p.shin-lag*3);
  const ankle=joint(shin,189,451,p.shin*.31+wave*2);
  const tail=joint(root,161,355,p.tail+wave*4+actorMotion*3);
  const tip=joint(tail,53,247,p.tailTip+lag*7);
  const curl=joint(tip,138,143,p.tailTip*.42+Math.sin(t*3.7-1.6)*5);
  return {root,arm,elbow,wrist,thigh,shin,ankle,tail,tip,curl,
    head:joint(root,513,248,p.head-wave*1.3),
    free:joint(root,359,291,p.freeArm-wave*2.4),
    cape:joint(root,365,302,p.cape+lag*4,1,1,0,Math.sin(t*4.6)*5),
    foot:joint(root,253,367,p.otherLeg-lag*4)};
}
function skinPoint(m,x,y){return{x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]};}
function unitEase(x){const u=Math.max(0,Math.min(1,x));return u*u*(3-2*u)}
function boneWeights(layer,x,y){
  function radial(cx,cy,rx,ry){
    const d=((x-cx)/rx)**2+((y-cy)/ry)**2;
    return 1-unitEase((d-.25)/.75);
  }
  function chain(first,second,last,t,u){
    return[[first,1-t],[second,t*(1-u)],[last,t*u]];
  }
  if(layer==='arm'){
    const t=unitEase(((x-601)*.72-(y-264)*.38)/40);
    const u=unitEase(((x-650)*.84-(y-232)*.45)/39);
    return chain('arm','elbow','wrist',t,u);
  }
  if(layer==='leg'){
    const k=unitEase(((248-x)*.77+(y-415)*.38)/29);
    const ankle=unitEase(((208-x)*.8+(y-439)*.48)/31);
    return chain('thigh','shin','ankle',k,ankle);
  }
  if(layer==='tail'){
    const t=unitEase((322-y)/85),u=unitEase((x-108)/145)*unitEase((282-y)/62);
    return chain('tail','tip','curl',t,u);
  }
  const head=unitEase((296-y)/83)*unitEase((x-313)/82);
  const free=radial(412,286,115,63)*(1-head);
  const cape=unitEase((371-x)/180)*unitEase((y-174)/87)*(1-unitEase((y-381)/45))*(1-head)*(1-free);
  const foot=unitEase((y-362)/57)*unitEase((353-x)/140)*(1-head)*(1-free)*(1-cape);
  return[['root',Math.max(0,1-head-free-cape-foot)],['head',head],['free',free],['cape',cape],['foot',foot]];
}
