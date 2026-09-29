import {useEffect,useRef,useState} from 'react';
import type {Language} from '../types';
import type {Drive} from './save';
import {carStats,has,stepDrive} from './carPhysics';
import {drawTrack} from './carArt';
import {drawSkyObjects} from './skyArt';
import SkyAlert from './SkyAlert';
import {HoldButton,useHeldControls,useReducedMotion} from './controls';
import {landingFeedback,nextRampDistance,runHint,wheelsRemaining} from './garageExperience';
import './truck-upgrade.css';

type Props={initial:Drive;language:Language;best:number;onSample:(r:Drive)=>void;onCheckpoint:(r:Drive)=>void;onEnd:(r:Drive)=>void;onReturn:(r:Drive)=>void;onRetry:(r:Drive)=>void};
const copy=(run:Drive)=>structuredClone(run);
const snapshot=(r:Drive)=>({distance:Math.floor(r.distance),jump:Math.floor(r.bestJump),broken:r.broken.length,ended:r.ended,charge:Math.floor(r.boostCharge??100),boosting:r.boostActive===true,x:r.x,air:r.air,hint:runHint(r),wheels:wheelsRemaining(r),sky:r.sky?structuredClone(r.sky):null});

/** Rendering and ephemeral feedback never own the reward ledger or save data. */
export default function TruckDriveStage(props:Props) {
  const {initial,language}=props,es=language==='es-MX';
  const canvas=useRef<HTMLCanvasElement>(null),run=useRef(copy(initial)),callbacks=useRef(props);
  callbacks.current=props;
  const recordToBeat=useRef(props.best),reduced=useReducedMotion(),pausedRef=useRef(false),endedSent=useRef(false);
  const history=useRef<Drive[]>([]),replay=useRef(-1);
  const [paused,setPaused]=useState(false),[replaying,setReplaying]=useState(false),[view,setView]=useState(()=>snapshot(initial));
  const [landing,setLanding]=useState<{meters:number;until:number}|null>(null);
  const pause=()=>{pausedRef.current=true;setPaused(true);callbacks.current.onCheckpoint(copy(run.current));};
  const held=useHeldControls({ArrowRight:'gas',KeyD:'gas',ArrowLeft:'brake',KeyA:'brake',Space:'tool',ShiftLeft:'boost',ShiftRight:'boost',KeyB:'boost'},pause);
  const togglePause=()=>{pausedRef.current=!pausedRef.current;held.current={};setPaused(pausedRef.current);callbacks.current.onCheckpoint(copy(run.current));};
  const returnToGarage=()=>{held.current={};callbacks.current.onReturn(copy(run.current));};
  const retry=()=>{held.current={};callbacks.current.onRetry(copy(run.current));};
  useEffect(()=>{
    const el=canvas.current,c=el?.getContext('2d');if(!el||!c)return;
    let raf=0,last=0,accumulator=0,ui=0,save=0,sample=0;
    const draw=(now:number)=>{
      const delta=last?Math.min((now-last)/1000,.08):0;last=now;
      const w=el.clientWidth||800,h=el.clientHeight||360,dpr=Math.min(2,window.devicePixelRatio||1);
      // Keep the ground visible on a short landscape phone as well as portrait.
      const scale=Math.min(Math.max(.7,Math.min(1.1,w/820)),h/400);
      if(el.width!==Math.round(w*dpr)||el.height!==Math.round(h*dpr)){el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);}
      c.setTransform(dpr*scale,0,0,dpr*scale,0,0);
      if(replay.current>=0){
        replay.current+=delta*8;
        const index=Math.min(history.current.length-1,Math.floor(replay.current));
        const replayFrame=history.current[index]??run.current;
        drawTrack(c,replayFrame,w/scale,h/scale,recordToBeat.current,true);
        drawSkyObjects(c,replayFrame,w/scale,h/scale,true);
        if(index===history.current.length-1){replay.current=-1;setReplaying(false);}
      }else{
        if(!pausedRef.current){
          accumulator+=delta;let steps=0;
          while(accumulator>=1/120&&steps++<10){
            const r=run.current;
            const before={air:r.air,broken:[...r.broken],landings:r.landings,x:r.x,launchX:r.launchX,a:r.a,ended:r.ended};
            stepDrive(r,{gas:!!held.current.gas,brake:!!held.current.brake,tool:!!held.current.tool,boost:!!held.current.boost});
            const meters=landingFeedback(before,r);
            if(meters!==null)setLanding({meters,until:r.t+2});
            accumulator-=1/120;
          }
          sample+=delta;
          if(sample>.08&&!run.current.ended){sample=0;history.current.push(copy(run.current));if(history.current.length>150)history.current.shift();}
        }
        drawTrack(c,run.current,w/scale,h/scale,recordToBeat.current,reduced.current);
        drawSkyObjects(c,run.current,w/scale,h/scale,reduced.current);
        if(run.current.boostActive&&!run.current.ended&&!reduced.current){
          const r=run.current,camera=Math.max(0,r.x-(w/scale)*.28),cy=Math.min(0,r.y-180),rear=-carStats(r.build).width-8;
          c.save();c.translate(r.x-camera,r.y-cy);c.rotate(r.a);
          c.beginPath();c.moveTo(rear,-3);c.lineTo(rear-43-Math.sin(r.t*28)*7,8);c.lineTo(rear,19);c.closePath();c.fillStyle='#ffb361bb';c.fill();
          c.beginPath();c.moveTo(rear,2);c.lineTo(rear-26,8);c.lineTo(rear,14);c.closePath();c.fillStyle='#fff0bb';c.fill();c.restore();
        }
        ui+=delta;save+=delta;
        if(ui>.1){ui=0;callbacks.current.onSample(run.current);setView(snapshot(run.current));}
        if(save>1.5){save=0;if(!run.current.ended)callbacks.current.onCheckpoint(copy(run.current));}
        if(run.current.ended&&!endedSent.current){
          endedSent.current=true;held.current={};history.current.push(copy(run.current));
          callbacks.current.onSample(run.current);callbacks.current.onEnd(copy(run.current));setView(snapshot(run.current));
        }
      }
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);if(!run.current.ended)callbacks.current.onCheckpoint(copy(run.current));};
  },[initial.id]);
  const ramp=nextRampDistance(view.x),newBest=!initial.practice&&view.distance>recordToBeat.current;
  const tools=has(initial.build,61)||has(initial.build,62)||has(initial.build,70);
  return <div className="cg-drive cg-drive-v2" data-boosting={view.boosting} data-sky-phase={view.sky?.active?.phase??'none'} data-sky-count={view.sky?.spawnCount??0} data-sky-hits={view.sky?.hits??0} data-sky-dodged={view.sky?.dodged??0}>
    <div className="cg-drive-hud">
      <div><small>{es?'DISTANCIA':'DISTANCE'}</small><strong data-testid="garage-distance">{view.distance}<span> m</span></strong></div>
      <div><small>{es?'RÉCORD A SUPERAR':'RECORD TO BEAT'}</small><strong>{recordToBeat.current}<span> m</span></strong></div>
      <div><small>{es?'MEJOR SALTO':'BEST JUMP'}</small><strong>{view.jump}<span> m</span></strong></div>
      <button type="button" onClick={togglePause} data-testid="garage-pause" disabled={view.ended||replaying}>{paused?(es?'Continuar':'Resume'):(es?'Pausa':'Pause')}</button>
    </div>
    <div className="cg-track-wrap">
      <canvas ref={canvas} className="cg-track" role="img" aria-label={es?'Tu auto en una pista con rampas y objetos que caen después de 300 metros. Los controles están debajo.':'Your car on a ramp course with falling objects after 300 meters. Controls are below.'}/>
      {!view.ended&&!paused&&!replaying&&<SkyAlert sky={view.sky} spanish={es}/>}
      {!view.ended&&!paused&&<div className="cg-track-chips" aria-hidden="true">
        {newBest&&recordToBeat.current>0?<span className="cg-best-chip">{es?'NUEVO RÉCORD':'NEW PERSONAL BEST'}</span>:<span>{es?'RUEDAS':'WHEELS'} {view.wheels.remaining}/{view.wheels.total}</span>}
        {landing&&landing.until>run.current.t?<span className="cg-landing-chip">{es?'BUEN ATERRIZAJE':'NICE LANDING'} · {landing.meters} m</span>:ramp<26&&view.air<.18?<span>{es?'RAMPA EN':'RAMP IN'} {ramp} m</span>:null}
      </div>}
      {replaying&&<button type="button" className="cg-replay-stop" onClick={()=>{replay.current=-1;setReplaying(false);}}>{es?'Repetición · Cerrar':'Replay · Close'}</button>}
      {paused&&!view.ended&&<div className="cg-pause-card">
        <strong>{es?'Tu aventura está en pausa':'Your adventure is paused'}</strong>
        <p>{es?'Turbo: mantén el botón o Mayús para acelerar. Se recarga mientras manejas sin turbo.':'Turbo: hold the button or Shift to accelerate. Recharges while you drive without turbo.'}</p>
        <p>{es?'Después de 300 m pueden caer objetos. La flecha marca un punto fijo: frena o acelera para esquivarlo. La práctica no tiene objetos.':'After 300 m, objects may fall. The arrow marks a fixed target: brake or accelerate to dodge. Practice has no falling objects.'}</p>
        <button type="button" className="cg-primary" onClick={togglePause}>{es?'Seguir manejando':'Keep driving'}</button>
        <button type="button" onClick={returnToGarage}>{es?'Cobrar y editar auto':'Bank rewards & edit car'}</button>
      </div>}
      {view.ended&&!replaying&&<div className="cg-crash-card" role="status">
        <span>{newBest?(es?'NUEVO RÉCORD':'NEW PERSONAL BEST'):(es?'OTRA IDEA PARA PROBAR':'ANOTHER IDEA TO TRY')}</span>
        <h3>{view.distance} m</h3>
        <p>{es?'Tu piloto está a salvo. Conservas todas tus piezas y premios.':'Your driver is safe. Every part and earned reward is yours to keep.'}</p>
        <p className="cg-damage-note">{view.hint[language]}</p>
        <div>
          <button type="button" className="cg-primary" data-testid="garage-race-again" onClick={retry}>{es?'Reconstruir y correr':'Rebuild & race again'}</button>
          <button type="button" onClick={returnToGarage}>{es?'Reconstruir gratis':'Rebuild for free'}</button>
          <button type="button" disabled={history.current.length<2} onClick={()=>{replay.current=0;setReplaying(true);}}>{es?'Ver repetición':'Watch replay'}</button>
        </div>
      </div>}
    </div>
    <div className="cg-controls">
      <HoldButton held={held} action="brake" label={es?'Frenar o retroceder':'Brake or reverse'} disabled={paused||view.ended||replaying}>◀ <span>{es?'FRENO':'BRAKE'}</span></HoldButton>
      <HoldButton held={held} action="boost" label={es?'Turbo: mantener para acelerar':'Turbo: hold to accelerate'} className="cg-turbo" disabled={paused||view.ended||replaying}>
        <span>TURBO <b data-testid="garage-turbo-charge">{view.charge}%</b><i aria-hidden="true" style={{width:`${view.charge}%`}}/></span>
      </HoldButton>
      <HoldButton held={held} action="gas" label={es?'Acelerar':'Accelerate'} className="cg-gas" disabled={paused||view.ended||replaying}><span>{es?'ACELERAR':'GAS'}</span> ▶</HoldButton>
    </div>
    <div className="cg-drive-support">
      <span data-testid="garage-drive-condition">{view.hint[language]}</span>
      {tools&&<HoldButton held={held} action="tool" label={es?'Usar herramienta':'Use tool'} disabled={paused||view.ended||replaying}>{es?'Herramienta':'Tool'}</HoldButton>}
      <button type="button" className="cg-return" onClick={returnToGarage}>{es?'Guardar y volver':'Bank & return'}</button>
    </div>
    <p className="cg-help">{initial.practice?(es?'Práctica: sin premios, cambios de récord ni objetos que caen.':'Practice: no rewards, record changes, or falling objects.'):(es?'Turbo gratis. Objetos que caen después de 300 m: observa la flecha. Flechas ← → · Mayús: turbo.':'Free turbo. Falling objects after 300 m: watch the arrow. ← → pedals · Shift: turbo.')} {view.broken>0?(es?`${view.broken} piezas desprendidas.`:`${view.broken} detached pieces.`):''}</p>
  </div>;
}
