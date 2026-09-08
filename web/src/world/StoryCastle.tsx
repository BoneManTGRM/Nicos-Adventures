import { lazy, Suspense } from 'react';
import type { LocalProfile } from '../types';
import type { Announce, UpdateProfile } from './common';
const Book = lazy(() => import('./StoryCastleBook').then(module=>({default:module.StoryCastle})));
export function StoryCastle(props:{profile:LocalProfile;update:UpdateProfile;announce:Announce}){
 return <Suspense fallback={<div className="fw-empty" role="status">{props.profile.language==='es-MX'?'Abriendo tu libro…':'Opening your storybook…'}</div>}><Book key={props.profile.id} {...props}/></Suspense>;
}
