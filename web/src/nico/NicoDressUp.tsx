import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import professionData from "../catalogs/nico-professions.json";
import professionPhase2Extra from "../catalogs/nico-professions-phase2-extra.json";
import type { Language, LocalizedText, NicoPreferences, NicoProfessionId } from "../types";
import { NicoCostumeFigure } from "./NicoCostumeFigure";
import { wardrobeForPreset } from "./wardrobe/catalog";
import { CLOSET_CATEGORIES, CATEGORY_NAMES, OUTFIT_GROUPS, STUDIO_BACKDROPS, toggleFavorite } from "./closet";
const ClosetVisuals = lazy(() => import("./ClosetVisuals"));

export type ProfessionOption = {
  id: NicoProfessionId;
  emoji: string;
  name: LocalizedText;
  tagline: LocalizedText;
  costume: string;
  accent: string;
};

export const NICO_PROFESSIONS = [...professionData, ...professionPhase2Extra] as ProfessionOption[];

export function filterNicoProfessions(query: string, language: Language): ProfessionOption[] {
  const locale = language === "es-MX" ? "es-MX" : "en-US";
  const normalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase(locale);
  if (!normalized) return NICO_PROFESSIONS;
  return NICO_PROFESSIONS.filter((profession) =>
    `${profession.name[language]} ${profession.tagline[language]}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase(locale).includes(normalized),
  );
}

export function applyNicoProfession(
  preferences: NicoPreferences,
  profession: Pick<ProfessionOption, "id" | "accent">,
): NicoPreferences {
  return {
    ...preferences,
    profession: profession.id,
    accentColor: profession.accent,
    wardrobe: wardrobeForPreset(profession.id, profession.accent),
  };
}

const copy = {
  en: {
    eyebrow: "Premium illustrated outfits · local and private",
    title: "Nico’s Wardrobe",
    intro: "Choose a complete illustrated outfit. Every choice keeps the same high-quality Nico artwork across the whole site.",
    search: "Search outfits…",
    selected: "Wearing now",
    empty: "No outfits match that search.",
    voice: "Let Nico read answers aloud",
  },
  "es-MX": {
    eyebrow: "Conjuntos ilustrados premium · local y privado",
    title: "El guardarropa de Nico",
    intro: "Elige un conjunto ilustrado completo. Cada opción conserva el mismo arte de alta calidad de Nico en todo el sitio.",
    search: "Buscar conjuntos…",
    selected: "Conjunto actual",
    empty: "Ningún conjunto coincide con la búsqueda.",
    voice: "Permitir que Nico lea las respuestas en voz alta",
  },
} as const;

export function NicoDressUp({language,preferences,onSave}:{language:Language;artSource?:string;outfitArtSource?:string;baseArtSource?:string;dragOutfitSource?:string;preferences:NicoPreferences;onSave:(p:NicoPreferences)=>void}){
 const es=language==='es-MX',text=copy[language];
 const [query,setQuery]=useState(''),[category,setCategory]=useState<typeof CLOSET_CATEGORIES[number]>('all'),[backdrop,setBackdrop]=useState<typeof STUDIO_BACKDROPS[number]>('night'),[pose,setPose]=useState('idle'),[message,setMessage]=useState(''),[saving,setSaving]=useState(false);
 const history=useRef<NicoPreferences[]>([]),timer=useRef(0);
 const favorites=preferences.favoriteOutfits??[];
 const selected=NICO_PROFESSIONS.find(p=>p.id===preferences.profession)??NICO_PROFESSIONS[0];
 const professions=useMemo(()=>filterNicoProfessions(query,language).filter(p=>category==='all'||category==='favorites'&&favorites.includes(p.id)||(OUTFIT_GROUPS[category]??[]).includes(p.id)),[query,language,category,favorites.join(',')]);
 useEffect(()=>()=>window.clearTimeout(timer.current),[]);
 const choose=(option:ProfessionOption)=>{history.current=[...history.current.slice(-8),preferences];onSave(applyNicoProfession(preferences,option));setMessage(es?`${option.name[language]} listo para la aventura.`:`${option.name[language]} is ready for an adventure.`);};
 const perform=(action:string)=>{clearTimeout(timer.current);setPose(action);timer.current=window.setTimeout(()=>setPose('idle'),1100);};
 const surprise=()=>{const pool=professions.filter(p=>p.id!==selected.id);if(pool.length)choose(pool[Math.floor(Math.random()*pool.length)]);};
 const portrait=async()=>{setSaving(true);setMessage('');try{const module=await import('./outfitPortrait');await module.saveOutfitPortrait(selected.id,selected.name[language],backdrop);setMessage(es?'Retrato creado en este dispositivo.':'Portrait created on this device.');}catch{setMessage(es?'No se pudo crear el retrato. Intenta de nuevo.':'The portrait could not be created. Please try again.');}finally{setSaving(false);}};
 return <section className="nico-dress-up nico-premium-wardrobe closet-studio" aria-labelledby="nico-wardrobe-title"><Suspense fallback={null}><ClosetVisuals /></Suspense>
  <header className="nico-feature-heading"><div><small>{es?'VESTUARIO · FOTOGRAFÍA · AVENTURA':'COSTUMES · PORTRAITS · ADVENTURE'}</small><h2 id="nico-wardrobe-title">{text.title}</h2><p>{es?'Elige un personaje para la próxima aventura, guarda tus favoritos y crea su retrato. El mismo Nico aparece en todo el mundo y en tus películas.':'Choose a role for the next adventure, save your favorites, and make a character portrait. The same Nico appears across the world and in your movies.'}</p></div></header>
  <div className="nico-dress-layout"><aside className="nico-dress-preview" data-closet-backdrop={backdrop}>
   <div className={`closet-stage closet-stage--${pose}`}><NicoCostumeFigure profession={preferences.profession} wardrobe={preferences.wardrobe} accentColor={preferences.accentColor} alt={`${selected.name[language]} Nico`}/></div>
   <div className="nico-dress-readout" role="status"><span aria-hidden="true">{selected.emoji}</span><div><small>{text.selected}</small><h3>{selected.name[language]}</h3><p>{selected.tagline[language]}</p></div></div>
   <div className="closet-quick"><button type="button" data-testid="favorite-outfit" aria-pressed={favorites.includes(selected.id)} onClick={()=>onSave({...preferences,favoriteOutfits:toggleFavorite(favorites,selected.id)})}>{favorites.includes(selected.id)?'★':'☆'} {es?'Favorito':'Favorite'}</button><button type="button" disabled={!history.current.length} onClick={()=>{const previous=history.current.pop();if(previous)onSave({...previous,favoriteOutfits:favorites,speechEnabled:preferences.speechEnabled});}}>{es?'Deshacer cambio':'Undo outfit'}</button></div>
   <div className="closet-backdrops" role="group" aria-label={es?'Fondo del estudio':'Studio backdrop'}>{STUDIO_BACKDROPS.map((b,i)=><button type="button" key={b} data-closet-background={b} aria-pressed={backdrop===b} onClick={()=>setBackdrop(b)}>{(es?['Noche','Jardín','Atardecer','Papel']:['Night','Garden','Sunset','Paper'])[i]}</button>)}</div>
   <div className="closet-quick"><button type="button" onClick={()=>perform('wave')}>{es?'Saludar':'Wave'}</button><button type="button" onClick={()=>perform('celebrate')}>{es?'Celebrar':'Celebrate'}</button><button type="button" disabled={saving} data-testid="outfit-portrait" onClick={()=>void portrait()}>{saving?(es?'Preparando…':'Preparing…'):(es?'Crear retrato':'Make portrait')}</button></div><p className="closet-message" role="status">{message}</p>
  </aside>
  <div className="nico-premium-wardrobe__controls"><div className="closet-categories" role="group" aria-label={es?'Colecciones de conjuntos':'Outfit collections'}>{CLOSET_CATEGORIES.map((id,i)=><button type="button" key={id} data-closet-category={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{CATEGORY_NAMES[language][i]}{id==='favorites'?` (${favorites.length})`:''}</button>)}</div>
   <label className="nico-premium-wardrobe__search"><span className="sr-only">{text.search}</span><input type="search" value={query} placeholder={text.search} onChange={e=>setQuery(e.target.value)}/></label>
   <div className="closet-count"><span>{professions.length} / {NICO_PROFESSIONS.length} {es?'conjuntos ilustrados':'illustrated outfits'}</span><button type="button" onClick={surprise} disabled={professions.length<2}>{es?'¡Sorpréndeme!':'Surprise outfit!'}</button></div>
   {professions.length?<div className="nico-profession-grid" role="list" aria-label={text.title}>{professions.map(p=><button type="button" role="listitem" key={p.id} className={p.id===preferences.profession?'selected':''} aria-pressed={p.id===preferences.profession} style={{'--nico-costume-accent':p.accent} as CSSProperties} onClick={()=>choose(p)}><span className="nico-profession-grid__art" aria-hidden="true"><NicoCostumeFigure profession={p.id} wardrobe={wardrobeForPreset(p.id,p.accent)} accentColor={p.accent} alt=""/></span><strong>{favorites.includes(p.id)?'★ ':''}{p.name[language]}</strong><small>{p.tagline[language]}</small></button>)}</div>:<p role="status">{category==='favorites'?(es?'Marca un conjunto con la estrella para guardarlo aquí.':'Star an outfit to save it here.'):text.empty}</p>}
   <label className="nico-speech-toggle"><input type="checkbox" checked={preferences.speechEnabled} onChange={e=>onSave({...preferences,speechEnabled:e.target.checked})}/><span>{text.voice}</span></label>
  </div></div>
 </section>;
}
