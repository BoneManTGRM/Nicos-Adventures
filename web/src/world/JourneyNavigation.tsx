import type { LocalProfile, SectionId } from '../types';
import { WORLD_SECTIONS } from './catalogs';
import { tr, ui } from '../i18n/core';

export type JourneyMenuKind = 'create' | 'more' | null;
export function JourneyNavigation({profile,open,showMenu,compact=false}:{profile:LocalProfile;open:(id:SectionId)=>void;showMenu?:(kind:JourneyMenuKind)=>void;compact?:boolean}) {
  const es=profile.language==='es-MX';
  const current = ['art-studio','story-castle','monster-lab','pet-workshop','becca-corner'].includes(profile.selectedSection)?'create':profile.selectedSection==='robot-home'?'home':['parent-settings','memory-book','badge-book'].includes(profile.selectedSection)?'more':'explore';
  const tabs = [
    {id:'explore',icon:'🧭',label:es?'Explorar':'Explore',go:()=>open('world-map')},
    {id:'create',icon:'🎨',label:es?'Crear':'Create',go:()=>showMenu?showMenu('create'):open('art-studio')},
    {id:'home',icon:'⌂',label:es?'Casa':'Home',go:()=>open('robot-home')},
    {id:'more',icon:'☰',label:es?'Más':'More',go:()=>showMenu?showMenu('more'):open('parent-settings')},
  ];
  return <nav className={compact?'world-travel journey-nav':'fw-bottom-nav journey-nav'} aria-label={compact?(es?'Viajar por el mundo':'Travel the world'):tr(ui.mainNavigation,profile.language)}>
    {tabs.map(tab=>{const active=tab.id===current;return <button type="button" key={tab.id} data-journey-nav={tab.id} aria-label={active ? `${tab.label}: ${tr(WORLD_SECTIONS.find(item=>item.id===profile.selectedSection)!.name,profile.language)}` : tab.label} aria-current={active ? "page" : undefined} aria-haspopup={tab.id==='create'||tab.id==='more'?'dialog':undefined} onClick={event=>{event.currentTarget.focus({preventScroll:true});tab.go();}}><span aria-hidden="true">{tab.icon}</span><small>{tab.label}</small></button>;})}
  </nav>;
}
