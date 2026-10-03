import {useEffect,useRef,useState} from 'react';
import type {Language} from '../types';
import type {Drive} from './save';
import {carStats,has,stepDrive} from './carPhysics';
import {truckCamera} from './truckCamera';
import {drawTrack} from './carArt';
import {drawSkyObjects} from './skyArt';
import SkyAlert from './SkyAlert';
import {TruckAudio} from './truckAudio';
import {courseSection} from './survival';
import {HoldButton,clearHeld,useHeldControls,useReducedMotion} from './controls';
import {landingFeedback,nextRampDistance,runHint,wheelsRemaining} from './garageExperience';
import './truck-upgrade.css';

type Props={muted:boolean;onMute:()=>void;onRecover:(r:Drive)=>void;initial:Drive;language:Language;best:number;onSample:(r:Drive)=>void;onCheckpoint:(r:Drive)=>void;onEnd:(r:Drive)=>void;onReturn:(r:Drive)=>void;onRetry:(r:Drive)=>void};
const copy=(run:Drive)=>structuredClone(run);
const snapshot=(r:Drive)=>({health:Math.ceil(r.survival?.health??100),shield:r.survival?.shield??false,protection:Math.max(0,Math.ceil((r.survival?.protectedUntil??0)-r.t)),combo:r.survival?.combo??0,comboAwards:r.survival?.comboAwards??0,near:r.survival?.nearMisses.length??0,stunts:r.survival?.stunts.length??0,checkpoint:r.survival?.checkpoint??0,stuck:r.survival?.stuck??0,reason:r.reason,reward:(r.smash?.bolts??0)+(r.survival?.reward??0),smashIds:r.smash?.cleared.join(',')??'',smashBolts:r.smash?.bolts??0,elapsed:r.t,distance:Math.floor(r.distance),jump:Math.floor(r.bestJump),broken:r.broken.length,ended:r.ended,charge:Math.floor(r.boostCharge??100),boosting:r.boostActive===true,x:r.x,air:r.air,hint:runHint(r),wheels:wheelsRemaining(r),sky:r.sky?structuredClone(r.sky):null});

/** Rendering and ephemeral feedback never own the reward ledger or save data. */
export default function TruckDriveStage(props:Props) {
  const {initial,language}=props,es=language==='es-MX';
  const canvas=useRef<HTMLCanvasElement>(null),run=useRef(copy(initial)),callbacks=useRef(props);
  callbacks.current=props;
  const recordToBeat=useRef(props.best),reduced=useReducedMotion(),pausedRef=useRef(false),endedSent=useRef(false);
  const history=useRef<Drive[]>([]),replay=useRef(-1),audio=useRef<TruckAudio|null>(null);
  const metrics=useRef({frames:0,slow:0,total:0,max:0});
  const [paused,setPaused]=useState(false),[replaying,setReplaying]=useState(false),[view,setView]=useState(()=>snapshot(initial));
  const [landing,setLanding]=useState<{meters:number;until:number}|null>(null);
  const pause=()=>{clearHeld(held);pausedRef.current=true;setPaused(true);callbacks.current.onCheckpoint(copy(run.current));};
  const held=useHeldControls({ArrowRight:'gas',KeyD:'gas',ArrowLeft:'brake',KeyA:'brake',Space:'tool',ShiftLeft:'boost',ShiftRight:'boost',KeyB:'boost'},pause);
  const togglePause=()=>{pausedRef.current=!pausedRef.current;clearHeld(held);setPaused(pausedRef.current);callbacks.current.onCheckpoint(copy(run.current));};
  const returnToGarage=()=>{clearHeld(held);callbacks.current.onReturn(copy(run.current));};
  const retry=()=>{clearHeld(held);callbacks.current.onRetry(copy(run.current));};
  useEffect(()=>{
    const el=canvas.current,c=el?.getContext('2d');if(!el||!c)return;
    audio.current=new TruckAudio();audio.current.muted=callbacks.current.muted;
    const unlock=()=>audio.current?.unlock();window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);
    let raf=0,last=0,accumulator=0,ui=0,save=0,sample=0;
    const draw=(now:number)=>{
      const raw=last?Math.max(0,(now-last)/1000):0,delta=Math.min(raw,.08);last=now;
      if(raw>0&&!pausedRef.current){const m=metrics.current;m.frames++;m.total+=raw;m.max=Math.max(m.max,raw);if(raw>1/30)m.slow++;}
      if(audio.current)audio.current.muted=callbacks.current.muted;
      const low=metrics.current.frames>120&&metrics.current.slow/metrics.current.frames>.2;
      const w=el.clientWidth||800,h=el.clientHeight||360,dpr=Math.min(low?1.5:2,window.devicePixelRatio||1);
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
        const skyPhaseBefore=run.current.sky?.active?.phase,smashBefore=run.current.smash?.cleared.length??0,shieldBefore=run.current.survival?.shield,healthBefore=run.current.survival?.health??100;
        if(!pausedRef.current){
          accumulator+=delta;let steps=0;
          while(accumulator>=1/120&&steps++<10){
            const r=run.current;
            const before={air:r.air,broken:[...r.broken],landings:r.landings,x:r.x,launchX:r.launchX,a:r.a,ended:r.ended};
            stepDrive(r,{gas:!!held.current.gas,brake:!!held.current.brake,tool:!!held.current.tool,boost:!!held.current.boost});
            const meters=landingFeedback(before,r);
            if(meters!==null){setLanding({meters,until:r.t+2});audio.current?.play('landing');}
            accumulator-=1/120;
          }
          sample+=delta;
          if(sample>.08&&!run.current.ended){sample=0;history.current.push(copy(run.current));if(history.current.length>150)history.current.shift();}
        }
        if((run.current.smash?.cleared.length??0)>smashBefore)audio.current?.play('smash');
        if(skyPhaseBefore!==run.current.sky?.active?.phase&&run.current.sky?.active?.phase==='warning')audio.current?.play('warning');
        if(shieldBefore&&!run.current.survival?.shield)audio.current?.play('shield');
        if((run.current.survival?.health??100)<healthBefore)audio.current?.play('damage');
        // Show safety-critical phase changes on their simulation frame, not the next 10 Hz HUD sample.
        if(skyPhaseBefore!==run.current.sky?.active?.phase)setView(snapshot(run.current));
        drawTrack(c,run.current,w/scale,h/scale,recordToBeat.current,reduced.current||low);
        drawSkyObjects(c,run.current,w/scale,h/scale,reduced.current||low);
        if(run.current.boostActive&&!run.current.ended&&!reduced.current&&!low){
          const r=run.current,cam=truckCamera(r,w/scale,h/scale),camera=cam.x,cy=cam.y,rear=-carStats(r.build).width-8;
          c.save();c.translate(r.x-camera,r.y-cy);c.rotate(r.a);
          c.beginPath();c.moveTo(rear,-3);c.lineTo(rear-43-Math.sin(r.t*28)*7,8);c.lineTo(rear,19);c.closePath();c.fillStyle='#ffb361bb';c.fill();
          c.beginPath();c.moveTo(rear,2);c.lineTo(rear-26,8);c.lineTo(rear,14);c.closePath();c.fillStyle='#fff0bb';c.fill();c.restore();
        }
        ui+=delta;save+=delta;
        if(ui>.1){ui=0;callbacks.current.onSample(run.current);setView(snapshot(run.current));}
        if(save>1.5){save=0;if(!run.current.ended)callbacks.current.onCheckpoint(copy(run.current));}
        if(run.current.ended&&!endedSent.current){
          endedSent.current=true;clearHeld(held);history.current.push(copy(run.current));
          callbacks.current.onSample(run.current);callbacks.current.onEnd(copy(run.current));setView(snapshot(run.current));
        }
      }
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);audio.current?.close();audio.current=null;if(!run.current.ended)callbacks.current.onCheckpoint(copy(run.current));};
  },[initial.id]);
  const section=courseSection(view.distance),ramp=nextRampDistance(view.x),newBest=!initial.practice&&view.distance>recordToBeat.current;
  const tools=has(initial.build,61)||has(initial.build,62)||has(initial.build,70);
  return <div data-effects={metrics.current.frames>120&&metrics.current.slow/metrics.current.frames>.2?'low':'full'} data-run-seed={run.current.sky?.seed} data-health={view.health} data-reward={view.reward} data-checkpoint={view.checkpoint} data-frame-count={metrics.current.frames} data-slow-frames={metrics.current.slow} data-frame-total={metrics.current.total} data-frame-max={metrics.current.max} data-hazards={run.current.sky?.active?1:0} data-debris={run.current.debris.length} data-history={history.current.length} data-smash-ids={view.smashIds} data-smash-bolts={view.smashBolts} data-active-seconds={view.elapsed} className="cg-drive cg-drive-v2" data-boosting={view.boosting} data-sky-duration={view.sky?.active?.warning??1.6} data-sky-safe={view.sky?.active?.safeAction??'brake'} data-sky-kind={view.sky?.active?.kind??-1} data-sky-target={view.sky?.active?.targetX??view.sky?.active?.x??0} data-sky-phase={view.sky?.active?.phase??'none'} data-sky-count={view.sky?.spawnCount??0} data-sky-hits={view.sky?.hits??0} data-sky-dodged={view.sky?.dodged??0}>
    <div className="cg-drive-hud">
      <div><small>{es?'DISTANCIA':'DISTANCE'}</small><strong data-testid="garage-distance">{view.distance}<span> m</span></strong></div>
      <div className="cg-health"><small>{es?'SALUD':'HEALTH'} {view.shield?'◇':''}</small><strong>{view.health}<span> /100</span></strong><meter min={0} max={100} value={view.health} aria-label={es?'Salud del camión':'Truck health'}/></div>
      <div><small>{es?'PREMIOS':'REWARDS'}</small><strong>{view.reward}<span> ⬡</span></strong></div>
      <button type="button" onClick={togglePause} data-testid="garage-pause" disabled={view.ended||replaying}>{paused?(es?'Continuar':'Resume'):(es?'Pausa':'Pause')}</button>
    </div>
    <div className="cg-track-wrap">
      <canvas ref={canvas} className="cg-track" role="img" aria-label={es?'Tu auto en una pista con rampas y objetos que caen después de 300 metros. Los controles están debajo.':'Your car on a ramp course with falling objects after 300 meters. Controls are below.'}/>
      {!view.ended&&!paused&&!replaying&&<SkyAlert sky={view.sky} spanish={es}/>}
      {!view.ended&&!paused&&<div className="cg-track-chips" aria-hidden="true"><span>{(es?['ROMPE Y MANEJA','ESQUIVA EL CIELO','RETO DE SALTOS']:['SMASH & DRIVE','SKY DODGE','STUNT GAUNTLET'])[section]} · {section+1}/3</span>
        {view.protection>0?<span>{es?'PROTECCIÓN':'PROTECTION'} {view.protection}s</span>:view.combo>=2?<span>{es?'COMBO':'COMBO'} ×{view.combo} · +{view.comboAwards}/10 ⬡</span>:newBest&&recordToBeat.current>0?<span className="cg-best-chip">{es?'NUEVO RÉCORD':'NEW PERSONAL BEST'}</span>:<span>{es?'RUEDAS':'WHEELS'} {view.wheels.remaining}/{view.wheels.total}</span>}
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
        <span>{view.reason===4?(es?'¡RETO COMPLETADO!':'COURSE CLEARED!'):newBest?(es?'NUEVO RÉCORD':'NEW PERSONAL BEST'):(es?'OTRA IDEA PARA PROBAR':'ANOTHER IDEA TO TRY')}</span>
        <h3>{view.distance} m</h3>
        <p>{es?'Tu piloto está a salvo. Conservas todas tus piezas y premios.':'Your driver is safe. Every part and earned reward is yours to keep.'}</p>
        <p className="cg-damage-note">{view.hint[language]} · {view.reward} ⬡ · {view.near} {es?'esquivas cercanas':'near misses'} · {view.stunts} {es?'saltos turbo':'turbo landings'}</p>
        <div>
          <button type="button" className="cg-primary" data-testid="garage-race-again" onClick={retry}>{es?'Reconstruir y correr':'Rebuild & race again'}</button>
          {view.reason!==4&&<button type="button" data-testid="garage-recover" onClick={()=>{clearHeld(held);callbacks.current.onRecover(copy(run.current));}}>{es?'Volver al punto de control':'Restart at checkpoint'}</button>}
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
      <button type="button" data-testid="garage-mute" aria-label={es?'Silenciar efectos':'Mute effects'} aria-pressed={props.muted} onClick={props.onMute}>{props.muted?'♫ ×':'♫'}</button>
      {(paused||view.stuck>2)&&!view.ended&&<button type="button" data-testid="garage-recover" onClick={()=>{clearHeld(held);callbacks.current.onRecover(copy(run.current));}}>{es?'Recuperar':'Recover'}</button>}
      <span data-testid="garage-drive-condition">{view.hint[language]}</span>
      {tools&&<HoldButton held={held} action="tool" label={es?'Usar herramienta':'Use tool'} disabled={paused||view.ended||replaying}>{es?'Herramienta':'Tool'}</HoldButton>}
      <button type="button" className="cg-return" onClick={returnToGarage}>{es?'Guardar y volver':'Bank & return'}</button>
    </div>
    <p className="cg-help">{initial.practice?(es?'Práctica: sin premios, cambios de récord ni objetos que caen.':'Practice: no rewards, record changes, or falling objects.'):(es?'Turbo gratis. Objetos que caen después de 300 m: observa la flecha. Flechas ← → · Mayús: turbo.':'Free turbo. Falling objects after 300 m: watch the arrow. ← → pedals · Shift: turbo.')} {view.broken>0?(es?`${view.broken} piezas desprendidas.`:`${view.broken} detached pieces.`):''}</p>
  </div>;
}
