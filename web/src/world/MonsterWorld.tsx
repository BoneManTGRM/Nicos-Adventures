import { lazy,Suspense,useState } from 'react';
import type { LocalProfile } from '../types';
import type { Announce,UpdateProfile } from './common';
import { MonsterLab as Workshop,MonsterHabitats as Habitats } from './MonsterWorkshop';
import './monster-clean-stage.css';
import './monster-entry.css';
const MonsterRift=lazy(()=>import('./MonsterRift').then(module=>({default:module.MonsterRift})));
type Props={profile:LocalProfile;update:UpdateProfile;announce:Announce};
export function MonsterLab(props:Props){const [play,setPlay]=useState(false),es=props.profile.language==='es-MX';
 if(play)return <Suspense fallback={<div role="status">{es?'Abriendo el portal…':'Opening the rift…'}</div>}><MonsterRift {...props} close={()=>setPlay(false)}/></Suspense>;
 return <><div className="monster-lab-play"><div><strong>{es?'¡Tu monstruo tiene una aventura!':'Your monster has an adventure!'}</strong><small>{es?'Guarda tu creación y llévala a Rescate monstruoso.':'Save your creation and take it into Monster Rift Rescue.'}</small></div><button type="button" data-testid="lab-play-monsters" onClick={()=>setPlay(true)}>{es?'Jugar con monstruos':'Play with monsters'} →</button></div><Workshop {...props}/></>;
}
export function MonsterHabitats(props:Props){return <Habitats {...props}/>;}
