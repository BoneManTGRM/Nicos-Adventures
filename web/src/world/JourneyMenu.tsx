import { useEffect, useRef, type KeyboardEvent } from 'react';
import type { Language, SectionId } from '../types';
import type { JourneyMenuKind } from './JourneyNavigation';
import { openNicoWorld } from '../nico/NicoWorldExperience';
import { WORLD_SECTIONS } from './catalogs';
import { tr, ui } from '../i18n/core';
import './journey-menu.css';

/** One modal shared by every navigation surface; native focus containment keeps games inert. */
export function JourneyMenu({kind,language,open,close}:{kind:JourneyMenuKind;language:Language;open:(id:SectionId)=>void;close:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const es=language==='es-MX';
  useEffect(()=>{
    if(!kind||!dialog.current) return;
    const element=dialog.current;
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const overflow=document.body.style.overflow;
    // Hand input focus away using the existing game-wide blur suspension path.
    // This clears held keys/walking routes and pauses action games; closing never resumes them.
    window.dispatchEvent(new Event('blur'));
    element.showModal(); document.body.style.overflow='hidden';
    return ()=>{element.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[kind]);
  function keepFocus(event:KeyboardEvent<HTMLDialogElement>) {
    event.stopPropagation();
    if(event.key!=='Tab') return;
    const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(element=>element.getClientRects().length>0);
    const first=controls[0],last=controls.at(-1);
    if(!first||!last) {event.preventDefault();return;}
    // Native modality makes the page inert, but Tab may still reach browser chrome.
    // Wrap only the edges; Escape retains its native cancel behavior.
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
  if(!kind) return null;
  const ids:SectionId[]=kind==='create'?['art-studio','story-castle','monster-lab','pet-workshop']:['world-map','memory-book','badge-book','parent-settings'];
  const visit=(id:SectionId)=>{close();open(id);};
  return <dialog className="journey-dialog" ref={dialog} aria-labelledby="journey-menu-title" onCancel={close} onKeyDown={keepFocus} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}}}>
    <header><div><small>{es?'TU MUNDO':'YOUR WORLD'}</small><h2 id="journey-menu-title">{kind==='create'?(es?'¿Qué vas a crear?':'What will you create?'):(es?'Más de tu mundo':'More of your world')}</h2></div><button type="button" onClick={close} aria-label={es?'Cerrar menú':'Close menu'}>×</button></header>
    <div className="journey-menu-grid">{ids.map(id=>{const s=WORLD_SECTIONS.find(item=>item.id===id)!;return <button type="button" key={id} data-menu-destination={id} onClick={()=>visit(id)} aria-label={`${tr(ui.openDestination,language)}: ${tr(s.name,language)}`}><span aria-hidden="true">{s.emoji}</span><strong>{tr(s.name,language)}</strong><small>{tr(s.description,language)}</small></button>;})}</div>
    <button type="button" className="journey-clubhouse" onClick={()=>{close();openNicoWorld(kind==='create'?'showtime':'ask');}}>{kind==='create'?(es?'Hacer una película con mis amigos':'Make a movie with my friends'):(es?'Pedir ayuda a Nico':'Ask Nico for help')} →</button>
    <p>{es?'Tus creaciones se quedan en este dispositivo.':'Your creations stay on this device.'}</p>
  </dialog>;
}
