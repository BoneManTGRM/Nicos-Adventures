import {useEffect,useRef,useState} from 'react';
import type {Language} from '../types';
import type {Build} from './save';
import {carStats,has,makeDrive} from './carPhysics';
import {drawCar} from './carArt';
import {garageArtUrl} from './garageArtwork';
import {useReducedMotion} from './controls';
import {TruckAudio} from './truckAudio';

type StandTest = 'rev'|'bounce';
export default function GarageStand({build,language,muted}:{build:Build;language:Language;muted:boolean}){
  const canvas=useRef<HTMLCanvasElement>(null),reduced=useReducedMotion();
  const test=useRef<{kind:StandTest;start:number}|null>(null), lights=useRef(false);
  const audio=useRef<TruckAudio|null>(null);
  const [active,setActive]=useState<StandTest|null>(null),[lit,setLit]=useState(false);
  const es=language==='es-MX', key=JSON.stringify(build);
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
    const run=makeDrive(build,0,0,true,1), stats=carStats(build);
    run.x=0;run.y=0;
    let frame=0,visible=true,rotation=0,last=0;
    const paint=(now:number)=>{
      frame=0;
      if(!visible||document.hidden){last=0;return;}
      const w=el.clientWidth||360,h=el.clientHeight||250,dpr=Math.min(2,window.devicePixelRatio||1);
      if(el.width!==Math.round(w*dpr)||el.height!==Math.round(h*dpr)){el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      const timer=test.current, age=timer?(now-timer.start)/1000:0;
      if(timer && age>=1.65){test.current=null;setActive(null);}
      const rev=timer?.kind==='rev'?Math.max(0,Math.sin(Math.min(1,age/1.55)*Math.PI)):0;
      const bounce=timer?.kind==='bounce'?Math.sin(age*14)*Math.exp(-age*2.8)*17/stats.spring:0;
      const motion=reduced.current?0:1,dt=last?Math.min(.05,(now-last)/1000):0;last=now;
      rotation+=dt*rev*23*motion;
      const trailer=has(build,68)&&has(build,69);
      const scale=Math.min(w/(stats.width*2.9+(trailer?105:36)),h/170,4);
      const center=w*(trailer ? .61 : .50), floor=h*.85;
      const ground=stats.clearance+stats.radius-stats.comY;
      ctx.save();ctx.translate(center,floor);
      ctx.scale(scale,scale);
      const shadow=ctx.createRadialGradient(0,0,0,0,0,stats.width*1.45);
      shadow.addColorStop(0,'#091015d9');shadow.addColorStop(.67,'#14171a89');shadow.addColorStop(1,'#11192200');
      ctx.save();ctx.scale(1,.12);ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,stats.width*1.45,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.translate(0,-ground);
      run.t=reduced.current?0:now/1000;
      drawCar(ctx,run,true,{compression:motion*(bounce+Math.sin(now*.06)*rev*1.4),wheelAngle:rotation,lights:lights.current});
      if(rev>.05 && motion){
        for(let i=0;i<5;i++){
          const p=(age*1.65+i/5)%1, size=3+p*7;
          ctx.fillStyle='rgba(216,231,231,'+((1-p)*rev*.24)+')';ctx.beginPath();
          ctx.arc(-stats.width*1.05-p*30,-16-p*20+Math.sin(i*3)*3,size,0,2*Math.PI);ctx.fill();
        }
      }
      ctx.restore();
      frame=requestAnimationFrame(paint);
    };
    const wake=()=>{if(visible && !document.hidden && !frame)frame=requestAnimationFrame(paint);};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;wake();});observer.observe(el);
    document.addEventListener('visibilitychange',wake);wake();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',wake);};
  },[key]);
  useEffect(()=>()=>audio.current?.close(),[]);
  function start(kind:StandTest){
    test.current={kind,start:performance.now()};setActive(kind);
    if(kind==='rev'&&!muted){audio.current??=new TruckAudio();audio.current.rev();}
  }
  return <>
    <div className="mg-bay" style={{backgroundImage:`url("${garageArtUrl('workshop')}")`}}>
      <canvas ref={canvas} className="cg-garage-art" role="img" aria-label={build.name}/>
    </div>
    <div className="mg-stand-controls" role="group" aria-label={es?'Banco de pruebas':'Test stand'}>
      <button type="button" onClick={()=>start('rev')} className={active==='rev'?'is-running':''}>{es?'Acelerar':'Rev engine'}</button>
      <button type="button" onClick={()=>start('bounce')} className={active==='bounce'?'is-running':''}>{es?'Probar resortes':'Test springs'}</button>
      <button type="button" aria-pressed={lit} onClick={()=>{lights.current=!lights.current;setLit(lights.current);}}>{es?'Faros':'Headlights'}</button>
    </div>
    <span className="mg-sr" role="status">{active==='rev'?(es?'Motor acelerando':'Engine revving'):active==='bounce'?(es?'Probando la suspensión':'Testing suspension'):''}</span>
  </>;
}
