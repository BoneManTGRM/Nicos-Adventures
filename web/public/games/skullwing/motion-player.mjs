import {transitions,textureScale} from './motion/poses.mjs';

const images=new Map(), playback=new WeakMap();
const limit=n=>Math.max(0,Math.min(1,n));
export function artImage(path) {
  if(typeof Image!=='function')return null;
  if(!images.has(path)){
    const image=new Image();image.decoding='async';image.src=new URL(path,import.meta.url).href;
    images.set(path,image);
  }
  return images.get(path);
}
const loaded=image=>image?.complete&&image.naturalWidth>0;
export function preloadTransitions(monster){
  for(const name of transitions[monster].pages)artImage('./motion/'+name+'.webp');
}

export const pose=(from,to=from,t=0)=>({from,to,t:limit(t)});
export function timeline(names,ends,t) {
  for(let i=1;i<ends.length;i++)if(t<=ends[i])return pose(names[i-1],names[i],(t-ends[i-1])/(ends[i]-ends[i-1]));
  return pose(names[names.length-1]);
}
export function visualYaw(a){return Number.isFinite(a.yaw)?a.yaw:a.face;}
export const signedReach=a=>Math.sin(visualYaw(a)*Math.PI/2);

function cel(catalog,entry){
  if(!entry)return null;
  const [page,sx,sy,sw,sh,l,t]=entry,img=artImage('./motion/'+catalog.pages[page]+'.webp');
  return loaded(img)?{img,sx,sy,sw,sh,x:l/textureScale,y:t/textureScale,w:sw/textureScale,h:sh/textureScale}:null;
}
export function paintedCel(img,frame,rect) {
  if(!loaded(img))return null;
  const [sx,sy,sw,sh]=rect,h=frame.height,w=h*sw/sh;
  return {img,sx,sy,sw,sh,x:-w*frame.pivot,y:-h+(frame.bottom||0),w,h};
}
function resolve(catalog,p,original){
  const {from,to,t}=p;
  const key=name=>catalog.clips[name]?cel(catalog,catalog.clips[name][0])||original(name):original(name);
  if(from===to||t<=0)return key(from);
  if(t>=1)return key(to);
  const direct=catalog.clips[from+'-'+to],strip=direct||catalog.clips[to+'-'+from];
  if(strip){
    const sample=(direct?t:1-t)*(strip.length+1),i=Math.floor(sample);
    const entry=n=>n===0?key(direct?from:to):n>strip.length?key(direct?to:from):cel(catalog,strip[n-1]);
    const left=entry(i),right=entry(i+1),mix=sample-i;
    if(left&&right&&mix>.015)return {left,right,mix};
    if(left||right)return left||right;
  }
  return key(t<.5?from:to);
}
function surface(){
  const layer=document.createElement('canvas');layer.width=448;layer.height=288;
  return layer;
}
function surfaceContext(layer){
  const g=layer.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,448,288);
  g.setTransform(textureScale,0,0,textureScale,224,255);return g;
}
function drawSurface(c,layer){c.drawImage(layer,-224/textureScale,-255/textureScale,448/textureScale,288/textureScale);}
let interpolated;
function paint(c,f){
  if(f.left){
    interpolated??=surface();
    const g=surfaceContext(interpolated);
    g.globalAlpha=1-f.mix;g.globalCompositeOperation='source-over';paint(g,f.left);
    g.globalAlpha=f.mix;g.globalCompositeOperation='lighter';paint(g,f.right);
    g.globalAlpha=1;g.globalCompositeOperation='source-over';drawSurface(c,interpolated);return;
  }
  if(f.paint){f.paint(c);return;}
  c.drawImage(f.img,f.sx,f.sy,f.sw,f.sh,f.x,f.y,f.w,f.h);
}
function renderBody(c,f,angle,bob,face,stretch){
  c.save();c.scale(face,1);c.translate(0,bob);c.rotate(angle);c.scale(stretch,1/stretch);
  paint(c,f);c.restore();
}

// Contact poses follow the simulation clock. Only an interruption with an
// unrelated starting pose needs a short bridge from the last drawing on screen.
export function drawMotion(c,a,time,monster,s,original) {
  const catalog=transitions[monster];
  let f=s.figure;
  if(s.loop){
    const strip=catalog.clips['loop-'+s.loop],phase=s.phase-Math.floor(s.phase);
    if(strip)f=cel(catalog,strip[Math.round(phase*strip.length)%strip.length]);
  }
  f??=resolve(catalog,s.p,original);
  if(!f)return false;
  let state=playback.get(a);
  if(!state){state={};playback.set(a,state);}
  let face=s.face;
  if((s.p.t===1&&s.p.to==='turn')||s.p.from==='turn'&&s.p.to==='turn')face=1;
  const now={f,angle:s.angle||0,bob:s.bob||0,face,stretch:s.stretch||1};
  if(state.mode!==s.mode){
    const near=state.p&&(state.p.t<.5?state.p.from:state.p.to);
    const related=state.p&&(near===s.p.from||near===s.p.to);
    state.bridge=state.last&&(!related||Boolean(f.paint)!==Boolean(state.last.f.paint))&&time-state.time<.09?state.last:null;
    state.start=time;
  }
  const mix=limit((time-state.start)/.07);
  if(state.bridge&&mix<1){
    const layer=state.layer??=surface(),g=surfaceContext(layer);
    const buffer=state.buffer??=surface();
    for(const [sample,alpha] of [[state.bridge,1-mix],[now,mix]]){
      const full=surfaceContext(buffer);
      renderBody(full,sample.f,sample.angle,sample.bob,sample.face,sample.stretch);
      g.globalAlpha=alpha;g.globalCompositeOperation='lighter';drawSurface(g,buffer);
    }
    g.globalAlpha=1;g.globalCompositeOperation='source-over';drawSurface(c,layer);
  }else{
    state.bridge=null;renderBody(c,f,now.angle,now.bob,face,now.stretch);
  }
  state.last=now;state.mode=s.mode;state.p=s.p;state.time=time;
  return true;
}
