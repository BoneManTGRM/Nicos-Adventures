import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocalProfile, MonsterRecord } from '../types';
import type { Announce,UpdateProfile } from './common';
import { MonsterStage } from '../FeatureArt';
import { completeOnce } from './progression';
import { createRift, pauseRift, powerKind, RIFT_SAMPLE, stepRift } from '../game/monsterRift';
import type { RiftInput,RiftState } from '../game/monsterRift';
import { drawRift,releaseRiftArt } from '../game/monsterRiftRenderer';
import './monster-rift.css';
import './monster-clean-stage.css';
const empty=():RiftInput=>({x:0,y:0,fire:false,power:false});
const stateView=(s:RiftState)=>({status:s.status,health:Math.round(s.health),level:s.level,score:s.score,rescued:s.rescued,enemies:s.enemies.length,cooldown:Math.ceil(s.powerCooldown),portal:s.portal,combo:s.combo});
export function MonsterRift({profile,update,announce,close,initialMonster}:{profile:LocalProfile;update:UpdateProfile;announce:Announce;close:()=>void;initialMonster?:MonsterRecord}){
 const es=profile.language==='es-MX',roster=initialMonster?[initialMonster,...profile.monsters.filter(m=>m.id!==initialMonster.id)]:profile.monsters.length?profile.monsters:[RIFT_SAMPLE];
 const [selected,setSelected]=useState<MonsterRecord>(()=>roster[0]),[generation,setGeneration]=useState(0),[view,setView]=useState(()=>stateView(createRift()));
 const sim=useRef(createRift()),input=useRef(empty()),keys=useRef(new Set<string>()),touch=useRef({x:0,y:0,fire:false}),queued=useRef({fire:false,power:false});
 const canvas=useRef<HTMLCanvasElement>(null),stage=useRef<HTMLDivElement>(null),avatar=useRef<HTMLDivElement>(null),region=useRef<HTMLElement>(null),controller=useRef({wake:()=>{},cancel:()=>{}}),saved=useRef(false);
 const latest=useRef({profile,update,announce,selected});latest.current={profile,update,announce,selected};
 const sync=useCallback(()=>setView(old=>{const next=stateView(sim.current);return JSON.stringify(old)===JSON.stringify(next)?old:next;}),[]);
 const clear=useCallback(()=>{input.current=empty();keys.current.clear();touch.current={x:0,y:0,fire:false};queued.current={fire:false,power:false};},[]);
 const save=useCallback(()=>{const s=sim.current;if(saved.current||s.score===0)return;saved.current=true;const p=latest.current.profile,key=`monster-rift:${latest.current.selected.id}`;let next:LocalProfile={...p,arcadeScores:{...p.arcadeScores,[key]:Math.max(p.arcadeScores[key]??0,s.score),'monster-rift':Math.max(p.arcadeScores['monster-rift']??0,s.score)}};if(s.status==='won')next=completeOnce(next,`arcade:monster-rift:complete:${latest.current.selected.id}`,3).profile;latest.current.profile=next;latest.current.update(next);},[]);
 const pause=useCallback(()=>{clear();pauseRift(sim.current);controller.current.cancel();sync();},[clear,sync]);
 useEffect(()=>{document.body.classList.add('monster-rift-open');const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.classList.remove('monster-rift-open');document.body.style.overflow=previous;};},[]);
 useEffect(()=>{
  let active=true,timer=0,frame=0,last=0,frames=0,w=960,h=640;
  const c=canvas.current!,ctx=c.getContext('2d',{alpha:false});if(!ctx)return;
  const cancel=()=>{clearTimeout(timer);cancelAnimationFrame(frame);timer=frame=0;};
  const paint=()=>{if(!active)return;const s=sim.current,view=drawRift(ctx,s,w,h),rect=stage.current!.getBoundingClientRect();const sx=rect.width/w,sy=rect.height/h;if(avatar.current){const node=avatar.current;node.style.left=`${(s.player.x-view.x)*view.scale*sx}px`;node.style.top=`${(s.player.y-view.y)*view.scale*sy}px`;node.style.transform=`translate(-50%,-80%) scale(${view.scale*sx}) scaleX(${s.facing})`;}
    Object.assign(c.dataset,{frames:String(++frames),shots:String(s.shotsFired),traveled:s.traveled.toFixed(2),powerUses:String(s.powerUses),renderer:'canvas2d',frameCap:'30'});};
  const wake=()=>{if(!active||document.hidden||timer||frame)return;timer=window.setTimeout(()=>{timer=0;frame=requestAnimationFrame(tick);},Math.max(0,34-(performance.now()-last)));};
  const tick=()=>{frame=0;if(!active||document.hidden)return;const now=performance.now();if(last&&now-last<1000/30){wake();return;}const s=sim.current,k=keys.current,t=touch.current,shots=s.shotsFired;
   input.current={x:Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft'))+t.x,y:Number(k.has('KeyS')||k.has('ArrowDown'))-Number(k.has('KeyW')||k.has('ArrowUp'))+t.y,fire:k.has('Space')||t.fire||queued.current.fire,power:queued.current.power};queued.current.power=false;
   stepRift(s,input.current,last?(now-last)/1000:1/30,latest.current.selected.power);last=now;if(s.shotsFired>shots)queued.current.fire=false;paint();sync();if(s.status==='playing')wake();else if(s.status==='won'||s.status==='rest'){clear();save();latest.current.announce(s.status==='won'?(es?'¡Rescate completo!':'Rescue complete!'):(es?'Recarga y prueba de nuevo.':'Recharge and try again.'));}
  };
  const resize=()=>{const r=stage.current!.getBoundingClientRect(),ratio=Math.min(1,1024/Math.max(1,r.width),640/Math.max(1,r.height));w=c.width=Math.max(1,Math.round(r.width*ratio));h=c.height=Math.max(1,Math.round(r.height*ratio));paint();};
  const observer=new ResizeObserver(resize);observer.observe(stage.current!);resize();controller.current={wake,cancel};
  const down=(e:KeyboardEvent)=>{if(!region.current?.contains(document.activeElement))return;if(e.code==='Escape'){e.preventDefault();pause();return;}if(sim.current.status!=='playing'||(e.target as HTMLElement)?.matches('input,select,textarea'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)||(e.code==='Space'&&e.target===c)){e.preventDefault();keys.current.add(e.code);}if(e.code==='KeyE'&&!e.repeat){e.preventDefault();queued.current.power=true;}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.code),hidden=()=>{if(document.hidden)pause();};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',pause);document.addEventListener('visibilitychange',hidden);
  return()=>{active=false;cancel();observer.disconnect();clear();releaseRiftArt();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',hidden);controller.current={wake:()=>{},cancel:()=>{}};};
 },[generation,clear,pause,sync,save,es]);
 const start=(reset=false)=>{clear();if(reset||['won','rest'].includes(sim.current.status)){sim.current=createRift();saved.current=false;}sim.current.status='playing';sync();canvas.current?.focus({preventScroll:true});controller.current.wake();};
 const choose=(id:string)=>{const monster=roster.find(m=>m.id===id);if(!monster)return;clear();setSelected(monster);sim.current=createRift();saved.current=false;setGeneration(n=>n+1);sync();};
 const pulseTimers=useRef<number[]>([]); useEffect(()=>()=>pulseTimers.current.forEach(clearTimeout),[]);
 const playing=view.status==='playing',names=es?['Cueva de cristal','Jardín lunar','Ciudadela del cielo']:['Crystal Cove','Moon Garden','Sky Citadel'];
 return <section className="monster-rift" ref={region} aria-label={es?'Rescate del portal monstruoso':'Monster Rift Rescue'} data-rift-status={view.status} data-rift-level={view.level} data-rift-monster={selected.id}>
  <header className="monster-rift__header"><button type="button" onClick={()=>{pause();save();close();}}>← {es?'Volver':'Back'}</button><strong>{es?'Rescate monstruoso':'Monster Rift Rescue'}</strong><button type="button" disabled={!playing} onClick={pause}>{es?'Pausa':'Pause'} Ⅱ</button></header>
  <div className="monster-rift__hud"><span>♥ {view.health}</span><span>★ {view.score}</span><span>{es?'Rescates':'Rescued'} {view.rescued}/9</span><span>{view.level}/3</span>{view.combo>1&&<b>×{view.combo}</b>}</div>
  <div className="monster-rift__playfield" ref={stage}><canvas ref={canvas} tabIndex={0} data-testid="rift-canvas" aria-label={es?'Arena. Flechas para moverte, espacio para lanzar, E para poder.':'Arena. Arrows to move, Space to launch, E for power.'}/><div ref={avatar} className="monster-rift__avatar" aria-hidden="true"><MonsterStage monster={selected}/></div>
   {playing&&<div className="monster-rift__objective">{view.portal?(es?'¡Portal abierto! Ve hacia arriba.':'Portal open! Head to the top.'):names[view.level-1]+` · ${view.enemies} `+(es?'traviesos':'mischief puffs')}</div>}
   {!playing&&<div className="monster-rift__overlay"><small>{es?'TU CREACIÓN ES EL HÉROE':'YOUR CREATION IS THE HERO'}</small><h2>{view.status==='won'?(es?'¡Los nueve están a salvo!':'All nine are safe!'):view.status==='rest'?(es?'Un descanso de héroe':'A hero’s breather'):view.status==='paused'?(es?'Aventura en pausa':'Adventure paused'):(es?'¡Abre el portal!':'Open the rift!')}</h2><p>{es?'Lleva a tu monstruo por tres arenas. Rescata crías, esquiva burbujas y despeja el camino con destellos. Tu poder especial cambia según tu monstruo.':'Take your monster through three arenas. Rescue hatchlings, dodge bubbles, and clear the path with spark bolts. Your monster’s special power changes how you play.'}</p>
    {view.status==='ready'&&<label>{es?'Elige tu monstruo':'Choose your monster'}<select value={selected.id} onChange={e=>choose(e.target.value)}>{roster.map(m=><option key={m.id} value={m.id}>{m.name} · {m.body}</option>)}</select></label>}
    <p className="monster-rift__identity">{selected.name} · {selected.power}</p><button type="button" className="monster-rift__start" data-testid="rift-start" onClick={()=>start()}>{view.status==='paused'?(es?'Continuar':'Resume'):(es?'Jugar':'Play')}</button>{view.status==='paused'&&<button type="button" onClick={()=>start(true)}>{es?'Nueva partida':'New run'}</button>}
    <small>{es?'Mejor puntuación':'Best score'}: {profile.arcadeScores[`monster-rift:${selected.id}`]??0}</small><small>{es?'2D ligero. Sin jugadores desconocidos.':'Lightweight 2D. No unknown players.'}</small>
   </div>}
  </div>
  <footer className="monster-rift__controls"><div className="monster-rift__dpad" role="group" aria-label={es?'Mover':'Move'}>{[{id:'up',x:0,y:-1,t:'↑'},{id:'left',x:-1,y:0,t:'←'},{id:'down',x:0,y:1,t:'↓'},{id:'right',x:1,y:0,t:'→'}].map(d=><button type="button" key={d.id} data-rift-direction={d.id} disabled={!playing} aria-label={es?({up:'Arriba',left:'Izquierda',down:'Abajo',right:'Derecha'} as Record<string,string>)[d.id]:d.id} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);touch.current.x=d.x;touch.current.y=d.y;}} onPointerUp={()=>{touch.current.x=touch.current.y=0;}} onPointerCancel={()=>{touch.current.x=touch.current.y=0;}} onLostPointerCapture={()=>{touch.current.x=touch.current.y=0;}} onClick={e=>{if(e.detail===0){const code=d.id==='up'?'ArrowUp':d.id==='down'?'ArrowDown':d.id==='left'?'ArrowLeft':'ArrowRight';keys.current.add(code);const timer=window.setTimeout(()=>{keys.current.delete(code);pulseTimers.current=pulseTimers.current.filter(t=>t!==timer);},150);pulseTimers.current.push(timer);}}}>{d.t}</button>)}</div>
   <div className="monster-rift__action-buttons"><button type="button" data-testid="rift-fire" className="monster-rift__fire" disabled={!playing} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);touch.current.fire=true;queued.current.fire=true;}} onPointerUp={()=>{touch.current.fire=false;}} onPointerCancel={()=>{touch.current.fire=false;queued.current.fire=false;}} onLostPointerCapture={()=>{touch.current.fire=false;}} onClick={e=>{if(e.detail===0)queued.current.fire=true;}}>{es?'Destello':'Spark'} ✦</button><button type="button" data-testid="rift-power" disabled={!playing||view.cooldown>0} onClick={()=>{queued.current.power=true;}}>{view.cooldown>0?`${view.cooldown}s`:(es?({shield:'Escudo',heal:'Recargar',dash:'Impulso',burst:'Superpoder'})[powerKind(selected.power)]:({shield:'Shield',heal:'Recharge',dash:'Dash',burst:'Superpower'})[powerKind(selected.power)])}</button></div>
  </footer>
 </section>;
}
