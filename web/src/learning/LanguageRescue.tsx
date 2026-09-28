import {useState,useEffect} from 'react';
import {useAppStore} from '../app/AppStoreContext';
import {NarrationControls,useNarration} from '../nico/Narration';
import {cancelNarration} from '../nico/speechCoordinator';
import {normalizeProgress} from './engine';
import {freshLanguageProgress,languageCards,languageTransition,wordPictures,type LanguageAction} from './languageRescue';
import type {Language} from '../types';

export function LanguageRescue(){
 const {profile,commitProfile,saveState}=useAppStore(),ui=profile.language,es=ui==='es-MX';
 const [target,setTarget]=useState<Language>(es?'en':'es-MX');
 const [ready,setReady]=useState('');
 const progress=normalizeProgress(profile.learningLab),p=progress.languageRescue?.[target]??freshLanguageProgress();
 const card=languageCards[p.position],word=wordPictures.find(w=>w.id===card.answer)!;
 const n=useNarration(target,profile.nico.speechEnabled),result=p.results[card.id];
 const learning=!card.check&&ready!==`${profile.id}:${target}:${card.id}`&&!p.feedback;
 useEffect(()=>()=>cancelNarration(),[]);
 const send=(action:LanguageAction)=>{n.stop();const id=profile.id,fingerprint=JSON.stringify(progress);commitProfile(c=>{
  const current=normalizeProgress(c.learningLab);if(c.id!==id||JSON.stringify(current)!==fingerprint)return c;
  const saves=current.languageRescue??{en:freshLanguageProgress(),'es-MX':freshLanguageProgress()};
  return {...c,learningLab:{...current,languageRescue:{...saves,[target]:languageTransition(saves[target],action)}}};
 });};
 return <section className="learning-station language-rescue" aria-label={es?'Rescate de palabras':'Word rescue'}>
  <div className="learning-tools" role="group" aria-label={es?'Idioma para aprender':'Language to learn'}><button type="button" aria-pressed={target==='en'} onClick={()=>{n.stop();setTarget('en');}}>{es?'Aprender inglés':'Learn English'}</button><button type="button" aria-pressed={target==='es-MX'} onClick={()=>{n.stop();setTarget('es-MX');}}>{es?'Aprender español':'Learn Spanish'}</button></div>
  <p role="status">{saveState.status==='saved'?(es?'Progreso guardado en este navegador.':'Progress saved in this browser.'):saveState.status==='error'?(es?'Solo esta sesión: no se guardó.':'Session only: not saved.'):(es?'Progreso local':'Local progress')}</p>
  {p.complete?<div className="learning-demo"><div aria-hidden="true" className="language-picture">🤖 🔑 🚪 🔋</div><h3>{es?'¡El robot está listo!':'The robot is ready!'}</h3><p>{es?'Practicaste cuatro palabras y dos mensajes. Puedes cambiar de idioma para otra aventura.':'You practiced four words and two messages. Switch languages for another adventure.'}</p><p>{es?'Comprobaciones sin ayuda: ':'Unassisted checks: '}{Object.values(p.results).filter(r=>r.independent).length} / 2</p><p>{es?'Esto registra estas actividades, no fluidez en el idioma.':'This records these activities, not language fluency.'}</p><button type="button" onClick={()=>{setReady('');send({type:'replay',item:card.id});}}>{es?'Jugar otra vez':'Play again'}</button></div>:<>
   <p className="learning-stage">{p.position+1} / 6 · {card.check?(es?'USA LO QUE APRENDISTE':'USE WHAT YOU LEARNED'):(es?'DESCUBRE UNA PALABRA':'DISCOVER A WORD')}</p>
   {learning?<div className="learning-demo"><span aria-hidden="true" className="language-picture">{word.picture}</span><h3 lang={target}>{word.word[target]}</h3><p>{es?'Significa: ':'Meaning: '}{word.word[ui]}</p><p lang={target}>{card.phrase[target]}</p><p>{card.phrase[ui]}</p><button type="button" className="fw-primary" onClick={()=>setReady(`${profile.id}:${target}:${card.id}`)}>{es?'Buscar la imagen':'Find the picture'}</button></div>:<>
    <h3 lang={target}>{card.phrase[target]}</h3><p>{es?'Elige lo que pide el mensaje.':'Choose what the message asks for.'}</p>
    <div className="language-picture-choices">{wordPictures.map(w=><button type="button" key={w.id} disabled={Boolean(p.feedback)} aria-label={w.word[ui]} data-word-answer={w.id} onClick={()=>send({type:'answer',item:card.id,answer:w.id})}><span aria-hidden="true">{w.picture}</span><span>{w.word[ui]}</span></button>)}</div>
    {p.feedback&&<div className="learning-feedback" role="status"><p>{result?.correct?(es?'¡Lo encontraste!':'You found it!'):(es?'Elegiste ':'You chose ')+(wordPictures.find(w=>w.id===p.feedback)?.word[ui]??'')+'.'}</p><p><strong lang={target}>{word.word[target]}</strong> {es?'significa':'means'} <strong>{word.word[ui]}</strong>. {card.phrase[ui]}</p><button type="button" className="fw-primary" onClick={()=>send({type:result?.correct?'next':'retry',item:card.id})}>{result?.correct?(es?'Continuar':'Continue'):(es?'Volver a buscar':'Look again')}</button></div>}
    {!p.feedback&&<button type="button" disabled={p.help} onClick={()=>send({type:'help',item:card.id})}>{es?'Mostrar significado (con ayuda)':'Show meaning (with help)'}</button>}
    {p.help&&<p className="learning-hint">{word.picture} {word.word[target]} = {word.word[ui]}. {card.phrase[ui]}</p>}
   </>}
   <div className="learning-tools"><button type="button" disabled={!n.canSpeak} onClick={()=>n.speak([{text:learning?`${word.word[target]}. ${card.phrase[target]}`:card.phrase[target]}])}>{es?'Escuchar':'Listen'}</button><button type="button" onClick={n.stop}>{es?'Detener':'Stop'}</button></div>
  </>}
  {!n.canSpeak&&<p>{es?'Puedes jugar leyendo. No hay una voz local adecuada seleccionada para el idioma que estás aprendiendo.':'You can play by reading. No suitable local voice is selected for the language you are learning.'}</p>}
  <NarrationControls narrator={n} language={target} uiLanguage={ui} allowPause={false}/>
 </section>;
}
