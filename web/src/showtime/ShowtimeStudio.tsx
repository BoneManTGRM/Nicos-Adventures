import { lazy, Suspense } from 'react';
import type { LocalProfile, MovieProject } from '../types';
const Director=lazy(()=>import('./DirectorStudio').then(module=>({default:module.ShowtimeStudio})));
export function ShowtimeStudio(props:{profile:LocalProfile;nicoBaseSource?:string;nicoOutfitSource?:string;initialProject?:MovieProject|null;onProjectSaved:(project:MovieProject)=>void;onProjectDownloaded:(id:string,mime:string)=>void}){
 return <Suspense fallback={<div role="status">{props.profile.language==='es-MX'?'Abriendo el estudio…':'Opening the studio…'}</div>}><Director key={`${props.profile.id}:${props.initialProject?.id??'new'}`} {...props}/></Suspense>;
}
