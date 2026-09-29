import {useEffect,useRef,type MutableRefObject,type ReactNode} from 'react';
import './playfield.css';
export type Held=Record<string,boolean>;
export function useHeldControls(keys:Record<string,string>,pause:()=>void,enabled=true){
 const held=useRef<Held>({}),pauseRef=useRef(pause);pauseRef.current=pause;
 const mapping=JSON.stringify(keys);
 useEffect(()=>{if(!enabled)return;const map=JSON.parse(mapping) as Record<string,string>;
  const editable=(e:KeyboardEvent)=>e.target instanceof HTMLElement&&!!e.target.closest('input,select,textarea,[contenteditable="true"]');
  const down=(e:KeyboardEvent)=>{if(editable(e))return;const action=map[e.code];if(action){e.preventDefault();held.current[action]=true;}if(e.code==='Escape'){e.preventDefault();pauseRef.current();}};
  const up=(e:KeyboardEvent)=>{const action=map[e.code];if(action){held.current[action]=false;if(!editable(e))e.preventDefault();}};
  const lost=()=>{held.current={};pauseRef.current();};const visibility=()=>{if(document.hidden)lost();};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',lost);document.addEventListener('visibilitychange',visibility);
  return()=>{held.current={};window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',lost);document.removeEventListener('visibilitychange',visibility);};
 },[mapping,enabled]);return held;
}
export function HoldButton({held,action,children,label,className='',disabled=false}:{held:MutableRefObject<Held>;action:string;children:ReactNode;label:string;className?:string;disabled?:boolean}){
 return <button type="button" className={`cg-pedal ${className}`} aria-label={label} data-control={action} disabled={disabled}
 onPointerDown={e=>{e.preventDefault();e.currentTarget.focus({preventScroll:true});e.currentTarget.setPointerCapture(e.pointerId);held.current[action]=true;}}
 onPointerUp={()=>{held.current[action]=false;}} onPointerCancel={()=>{held.current[action]=false;}} onLostPointerCapture={()=>{held.current[action]=false;}}
 onKeyDown={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();held.current[action]=true;}}} onKeyUp={e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();held.current[action]=false;}}} onBlur={()=>{held.current[action]=false;}}>{children}</button>;
}
export function useReducedMotion(){const value=useRef(false);useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{value.current=media.matches;};change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);return value;}
