import { learningLabEnabled } from '../learning/enabled';
import type { LearningGame } from '../learning/LearningArcade';
import '../learning/learning-arcade.css';
import { lazy,Suspense,useEffect,useState } from 'react';
import type { LocalProfile } from '../types';
import type { Announce,UpdateProfile } from './common';
import { Arcade as Collection } from './ArcadeCollection';
import {CreativeEntries,type CreativeGame} from '../creativeGames/CreativeEntries';
import './monster-entry.css';
import './signal-run.css';
const MonsterRift=lazy(()=>import('./MonsterRift').then(module=>({default:module.MonsterRift})));
const LearningArcade=lazy(()=>import('../learning/LearningArcade').then(module=>({default:module.LearningArcade})));
const MonsterGarage=lazy(()=>import('../creativeGames/MonsterGarage'));
const RainbowKingdom=lazy(()=>import('../creativeGames/RainbowKingdom'));
export function Arcade(props:{profile:LocalProfile;update:UpdateProfile;announce:Announce}){
 const [learningGame,setLearningGame]=useState<LearningGame|null>(null);
 const [game,setGame]=useState<CreativeGame|null>(()=>{if(typeof window==='undefined')return null;const value=new URLSearchParams(window.location.search).get('play');return value==='monster-garage'?'garage':value==='rainbow-kingdom'?'kingdom':null;});
 const [play,setPlay]=useState(false),es=props.profile.language==='es-MX';
 useEffect(()=>{if(!game)return;window.scrollTo({top:0,behavior:'auto'});},[game]);
 const closeGame=()=>{setGame(null);const url=new URL(window.location.href);if(['monster-garage','rainbow-kingdom'].includes(url.searchParams.get('play')??'')){url.searchParams.delete('play');window.history.replaceState(null,'',url);}window.scrollTo({top:0,behavior:'auto'});};
 if(game)return <Suspense fallback={<div className="fw-empty" role="status">{es?'Preparando tu creación…':'Preparing your creation…'}</div>}>{game==='garage'?<MonsterGarage key={`${props.profile.id}:garage`} close={closeGame}/>:<RainbowKingdom key={`${props.profile.id}:kingdom`} close={closeGame}/>}</Suspense>;
 if(learningGame&&learningLabEnabled)return <Suspense fallback={<p role="status">{es?'Cargando…':'Loading…'}</p>}><LearningArcade key={`${props.profile.id}:${learningGame}`} game={learningGame} close={()=>setLearningGame(null)}/></Suspense>;
 if(play)return <Suspense fallback={<div className="fw-empty" role="status">{es?'Abriendo el portal…':'Opening the rift…'}</div>}><MonsterRift {...props} close={()=>setPlay(false)}/></Suspense>;
 return <div className="monster-arcade-shell"><CreativeEntries language={props.profile.language} open={setGame}/>{learningLabEnabled&&<article className="learning-arcade-entry"><div><small>{es?'APRENDE JUGANDO':'LEARN THROUGH PLAY'}</small><h2>{es?'Inglés y español en la sala de juegos':'English & Spanish Arcade'}</h2><p>{es?'Encuentra parejas y construye mensajes para el robot. Sin voz obligatoria ni límite de tiempo.':'Find matching pairs and build messages for the robot. No voice required and no time limit.'}</p></div><div><button type="button" data-testid="open-word-match" onClick={()=>setLearningGame('word-match')}>{es?'Parejas de palabras':'Word Match'}</button><button type="button" data-testid="open-sentence-builder" onClick={()=>setLearningGame('sentence-builder')}>{es?'Constructor de frases':'Sentence Builder'}</button></div></article>}<article className="monster-arcade-entry"><div><small>{es?'NUEVO · TUS MONSTRUOS JUEGAN':'NEW · YOUR MONSTERS CAN PLAY'}</small><h2>{es?'Rescate del portal monstruoso':'Monster Rift Rescue'}</h2><p>{es?'Tu creación es el héroe. Tres arenas, nueve crías para rescatar, poderes especiales y un gran guardián travieso.':'Your creation is the hero. Three arenas, nine hatchlings to rescue, special powers, and a giant mischievous guardian.'}</p><span>{es?'Acción 2D ligera · Controles táctiles y teclado':'Lightweight 2D action · Touch and keyboard controls'}</span></div><button type="button" data-testid="open-monster-rift" onClick={()=>{setPlay(true);window.scrollTo({top:0,behavior:'auto'});}}>{es?'Jugar con mis monstruos':'Play with my monsters'} →</button></article><Collection {...props}/></div>;
}
