import { lazy,Suspense,useState } from 'react';
import type { LocalProfile } from '../types';
import type { Announce,UpdateProfile } from './common';
import { Arcade as Collection } from './ArcadeCollection';
import './monster-entry.css';
const MonsterRift=lazy(()=>import('./MonsterRift').then(module=>({default:module.MonsterRift})));
export function Arcade(props:{profile:LocalProfile;update:UpdateProfile;announce:Announce}){
 const [play,setPlay]=useState(false),es=props.profile.language==='es-MX';
 if(play)return <Suspense fallback={<div className="fw-empty" role="status">{es?'Abriendo el portal…':'Opening the rift…'}</div>}><MonsterRift {...props} close={()=>setPlay(false)}/></Suspense>;
 return <div className="monster-arcade-shell"><article className="monster-arcade-entry"><div><small>{es?'NUEVO · TUS MONSTRUOS JUEGAN':'NEW · YOUR MONSTERS CAN PLAY'}</small><h2>{es?'Rescate del portal monstruoso':'Monster Rift Rescue'}</h2><p>{es?'Tu creación es el héroe. Tres arenas, nueve crías para rescatar, poderes especiales y un gran guardián travieso.':'Your creation is the hero. Three arenas, nine hatchlings to rescue, special powers, and a giant mischievous guardian.'}</p><span>{es?'Acción 2D ligera · Controles táctiles y teclado':'Lightweight 2D action · Touch and keyboard controls'}</span></div><button type="button" data-testid="open-monster-rift" onClick={()=>{setPlay(true);window.scrollTo({top:0,behavior:'auto'});}}>{es?'Jugar con mis monstruos':'Play with my monsters'} →</button></article><Collection {...props}/></div>;
}
