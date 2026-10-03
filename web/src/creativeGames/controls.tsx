import {useEffect,useRef,type MutableRefObject,type ReactNode} from 'react';
import './playfield.css';
export type Held=Record<string,boolean>;
const sources=new WeakMap<MutableRefObject<Held>,Map<string,Set<string>>>();
function input(held:MutableRefObject<Held>,action:string,source:string,down:boolean){
 let map=sources.get(held);if(!map){map=new Map();sources.set(held,map);}
 let set=map.get(action);if(!set){set=new Set();map.set(action,set);}
 if(!held.current[action]&&set.size>0)set.clear();
 if(down)set.add(source);else set.delete(source);held.current[action]=set.size>0;
}
export function clearHeld(held:MutableRefObject<Held>){sources.get(held)?.clear();held.current={};}
export function useHeldControls(keys:Record<string,string>,pause:()=>void,enabled=true){
 const held=useRef<Held>({}),pauseRef=useRef(pause);pauseRef.current=pause;
 const mapping=JSON.stringify(keys);
 useEffect(()=>{if(!enabled)return;const map=JSON.parse(mapping) as Record<string,string>;
  const editable=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('input,select,textarea,[contenteditable="true"]');
  const down=(e:KeyboardEvent)=>{if(editable(e))return;const action=map[e.code];if(action){e.preventDefault();input(held,action,'key:'+e.code,true);}if(e.code==='Escape'){e.preventDefault();clearHeld(held);pauseRef.current();}};
  const up=(e:KeyboardEvent)=>{const action=map[e.code];if(action){input(held,action,'key:'+e.code,false);if(!editable(e))e.preventDefault();}};
  const lost=()=>{clearHeld(held);pauseRef.current();};const visibility=()=>{if(document.hidden)lost();};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',lost);document.addEventListener('visibilitychange',visibility);
  return()=>{clearHeld(held);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',lost);document.removeEventListener('visibilitychange',visibility);};
 },[mapping,enabled]);return held;
}
export function HoldButton({held,action,children,label,className='',disabled=false}:{held:MutableRefObject<Held>;action:string;children:ReactNode;label:string;className?:string;disabled?:boolean}){
 const pointers=useRef(new Set<number>());
 const release=(id:number)=>{pointers.current.delete(id);input(held,action,'pointer:'+id,false);};
 const clearButton=()=>{for(const id of pointers.current)input(held,action,'pointer:'+id,false);pointers.current.clear();for(const key of ['Space','Enter'])input(held,action,'button:'+key,false);};
 useEffect(()=>{if(disabled)clearButton();return clearButton;},[disabled,action,held]);
 return <button type="button" className={`cg-pedal ${className}`} aria-label={label} data-control={action} disabled={disabled}
 onPointerDown={e=>{e.preventDefault();pointers.current.add(e.pointerId);input(held,action,'pointer:'+e.pointerId,true);e.currentTarget.focus({preventScroll:true});try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* A canceled/removed pointer is still released by cancel/up. */}}}
 onPointerUp={e=>release(e.pointerId)} onPointerCancel={e=>release(e.pointerId)} onLostPointerCapture={e=>release(e.pointerId)}
 onKeyDown={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();input(held,action,'button:'+e.code,true);}}} onKeyUp={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();input(held,action,'button:'+e.code,false);}}} onBlur={()=>{for(const key of ['Space','Enter'])input(held,action,'button:'+key,false);}}>{children}</button>;
}
export function useReducedMotion(){const value=useRef(false);useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{value.current=media.matches;};change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);return value;}
