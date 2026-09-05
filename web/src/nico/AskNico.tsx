import { lazy, Suspense } from 'react';
import type { Language,NicoProfessionId,NicoWardrobe } from '../types';
const Club=lazy(()=>import('./AskNicoClub').then(module=>({default:module.AskNico})));
export function AskNico(props:{language:Language;speechEnabled:boolean;aboutSource?:string;baseArtSource?:string;outfitArtSource?:string;profession?:NicoProfessionId;wardrobe?:NicoWardrobe;accentColor?:string}){
 return <Suspense fallback={<div role="status">{props.language==='es-MX'?'Abriendo el club de curiosos…':'Opening the Curiosity Club…'}</div>}><Club {...props}/></Suspense>;
}
