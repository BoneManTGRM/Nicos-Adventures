import {useEffect,useRef,useState} from 'react';
import type {Language} from '../types';
import {clearHeld,HoldButton,useHeldControls,useReducedMotion} from './controls';
import {drawKingdom,gardenCamera,gardenOffset,gardenScale} from './kingdomArt';
import {bells,localName,friends,nearbyBell} from './kingdomDiscoveries';
import {makeRide,padAt,PADS,STARTER_COURSE,stepRide,type Ride} from './kingdomPhysics';
import type {KingdomSave} from './save';

type Props={
 save:KingdomSave;island:number;ride:boolean;selected:number;language:Language;
 onRescue:(id:number)=>void;onFinish:(run:Ride)=>void;onBell:(index:number)=>void;
 onPhrase:(index:number)=>void;onPlace:(pad:number)=>void;
};
export default function KingdomStage(props:Props){
 const {save,island,ride,selected,language}=props,es=language==='es-MX';
 const canvas=useRef<HTMLCanvasElement>(null),run=useRef(makeRide(save.sequence)),reduced=useReducedMotion();
 const latest=useRef(props);latest.current=props;
 const paused=useRef(false),[pause,setPause]=useState(false);
 const [hint,setHint]=useState(''),sang=useRef(-100);
 const [info,setInfo]=useState({found:0,falls:0,done:false,x:75,y:335,grounded:true});
 function setPaused(value:boolean){paused.current=value;setPause(value);clearHeld(held);}
 const held=useHeldControls({ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump'},()=>setPaused(true),ride);
 function sing(){
  const r=run.current;if(!ride||paused.current||r.completed||r.t-sang.current<.6)return;
  sang.current=r.t;const index=nearbyBell(r.x,r.y);
  if(index<0){setHint(es?'Acércate a una flor con una nota musical.':'Move closer to a flower with a music note.');return;}
  latest.current.onPhrase(index);latest.current.onBell(island*3+index);
  setHint(es?'¡La flor cantó contigo!':'The flower sang back!');
 }
 useEffect(()=>{
  if(!ride)return;
  const key=(event:KeyboardEvent)=>{if(event.code==='KeyE'&&!event.repeat&&!event.altKey&&!event.metaKey&&!event.ctrlKey){event.preventDefault();sing();}};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[ride,island]);
 useEffect(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  let frame=0,last=0,acc=0,ui=0,found=0,finished=false,visible=true;
  function draw(now:number){
   frame=0;if(!visible||document.hidden||!el||!ctx){last=0;return;}
   const dt=last?Math.min((now-last)/1000,.08):0;last=now;
   const w=el.clientWidth||800,h=el.clientHeight||390,d=Math.min(2,window.devicePixelRatio||1),scale=gardenScale(w,h);
   if(el.width!==Math.round(w*d)||el.height!==Math.round(h*d)){el.width=Math.round(w*d);el.height=Math.round(h*d);}
   ctx.setTransform(d*scale,0,0,d*scale,0,0);
   const current=latest.current,r=run.current,layout=current.save.layouts[island];
   const pieces=layout.some(Boolean)?layout:STARTER_COURSE;
   if(ride&&!paused.current){
    acc+=dt;let steps=0;
    while(acc>=1/120&&steps++<10){stepRide(r,pieces,island,{left:!!held.current.left,right:!!held.current.right,jump:!!held.current.jump});acc-=1/120;}
   }else if(!ride&&!reduced.current){r.t+=dt;}
   drawKingdom(ctx,r,pieces,island,current.save.color,w/scale,h/scale,ride?null:current.selected,reduced.current,
    {companion:current.save.companion,bells:current.save.bells,sangAt:sang.current});
   if(ride){
    while(found<r.found.length){const id=island*3+r.found[found++];current.onRescue(id);setHint((es?'¡Encontraste a ':'You found ')+localName(friends[id],language)+'!');}
    if(r.completed&&!finished){finished=true;current.onFinish(structuredClone(r));}
    ui+=dt;if(ui>.1){ui=0;setInfo({found:r.found.length,falls:r.falls,done:r.completed,x:r.x,y:r.y,grounded:r.grounded});}
   }
   frame=requestAnimationFrame(draw);
  }
  const wake=()=>{if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;wake();});observer.observe(el);
  document.addEventListener('visibilitychange',wake);wake();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',wake);};
 },[ride,island,language]);
 const count=save.bells.filter(id=>Math.floor(id/3)===island).length;
 const closeToBell=nearbyBell(info.x,info.y)>=0;
 return <>
  <div className="cg-kingdom-stage" data-testid="kingdom-stage" data-world-x={info.x} data-world-y={info.y} data-grounded={info.grounded} data-friends={info.found}>
   <canvas ref={canvas} className="cg-kingdom-canvas" role="img" aria-label={es?'Tu unicornio en el jardín mágico':'Your unicorn in the magic garden'}
    onClick={event=>{
     if(ride)return;const rect=event.currentTarget.getBoundingClientRect(),scale=gardenScale(rect.width,rect.height);
     const x=(event.clientX-rect.left)/scale+gardenCamera(rect.width/scale,0,selected,island);
     const y=(event.clientY-rect.top)/scale-gardenOffset(rect.height/scale);
     const hit=PADS.findIndex((_,i)=>{const p=padAt(i,island);return Math.hypot(p.x-x,p.y-28-y)<=37;});
     if(hit>=0)props.onPlace(hit);
    }}/>
   {!ride&&!save.layouts[island].some(Boolean)&&<span className="bk-preview-label">{es?'Vista del camino inicial':'Starter trail preview'}</span>}
   {ride&&<div className="cg-kingdom-hud"><span data-testid="kingdom-friends">{info.found}/3 {es?'amigos':'friends'}</span><span aria-label={es?'Flores musicales':'Bellflowers'}>♫ {count}/{bells.length}</span><button type="button" onClick={()=>setPaused(!pause)}>{pause?(es?'Continuar':'Resume'):(es?'Pausa':'Pause')}</button></div>}
   {ride&&!info.done&&<div className="bk-route-progress" aria-hidden="true"><i style={{width:Math.min(100,info.x/20.1)+'%'}}/></div>}
   {pause&&ride&&!info.done&&<div className="cg-pause-card"><strong>{es?'Aventura en pausa':'Adventure paused'}</strong><button type="button" onClick={()=>setPaused(false)}>{es?'Continuar aventura':'Continue adventure'}</button></div>}
   {info.done&&<div className="cg-crash-card cg-kingdom-complete" role="status"><span>✦ ✦ ✦</span><h3>{es?'Todos llegaron a casa.':'Everyone made it home.'}</h3><p>{es?'Tres amigos a salvo':'Three friends safely home'} · ♫ {count}/3</p></div>}
  </div>
  {ride&&<>
   <div className="cg-controls cg-unicorn-controls">
    <HoldButton held={held} action="left" label={es?'Mover a la izquierda':'Move left'} disabled={pause||info.done}>←</HoldButton>
    <HoldButton held={held} action="jump" label={es?'Saltar o subir':'Jump or climb'} className="cg-jump" disabled={pause||info.done}>↑ <span>{es?'Saltar':'Jump'}</span></HoldButton>
    <button className={'bk-sing'+(closeToBell?' bk-near':'')} data-testid="kingdom-sing" type="button" disabled={pause||info.done} onClick={sing}>♫ {es?'Cantar':'Sing'}</button>
    <HoldButton held={held} action="right" label={es?'Mover a la derecha':'Move right'} disabled={pause||info.done}>→</HoldButton>
   </div>
   <p className="bk-feedback" aria-live="polite">{hint||(es?'Busca las tres flores musicales y rescata a tus amigos.':'Find the three bellflowers and bring your friends home.')}</p>
   <p className="cg-help">{es?'← → para moverte. Pulsa Saltar dos veces para saltar en el aire. Canta con E junto a una flor. Mantén Saltar para trepar enredaderas.':'Use ← → to move. Tap Jump twice to leap in midair. Sing with E beside a bellflower. Hold Jump to climb vines.'} {info.x>1870&&info.found<3?(es?'Rescata a los tres amigos para abrir el portal.':'Rescue all three friends to open the gate.'):''}</p>
  </>}
 </>;
}
