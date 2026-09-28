import { speechText } from "./speechText";
import { applyLearningAction, resetLearning } from './profile';
import { useEffect } from 'react';
import { useAppStore } from '../app/AppStoreContext';
import { NicoCostumeFigure } from '../nico/NicoCostumeFigure';
import { NarrationControls, useNarration } from '../nico/Narration';
import { cancelNarration } from '../nico/speechCoordinator';
import { demonstrated, normalizeProgress, type Action } from './engine';
import { lessonItem, missions, workedExample } from './lessons';
import './learning-lab.css';

export function LearningParent() {
 const {profile,commitProfile}=useAppStore();const es=profile.language==='es-MX';
 const p=normalizeProgress(profile.learningLab);
 const n=useNarration(profile.language,profile.nico.speechEnabled);
 return <section className="settings-card learning-parent" aria-label={es?'Aprendizaje local':'Local learning'}>
  <h2>{es?'Laboratorio de Aprendizaje de Nico':'Nico’s Learning Lab'}</h2>
  <p>{es?'Estas actividades registran práctica, ayuda y dos comprobaciones sin ayuda, incluida una de aplicación. No son una evaluación educativa validada ni demuestran dominio general.':'These activities record practice, help, and two unassisted checks, including transfer. They are not a validated educational assessment or evidence of general mastery.'}</p>
  <ul>{missions.map((m,index)=><li key={m.id}><strong>{m.title[profile.language]}</strong>: {(['gentle','challenge'] as const).map(b=><span key={b}> {b==='gentle'?(es?'Inicial':'Gentle'):(es?'Reto':'Challenge')} — {demonstrated(p,index,b)?(es?'demostrado en estas actividades':'demonstrated in these activities'):(es?'aún no demostrado':'not yet demonstrated')}; </span>)}</li>)}</ul>
  <p>{es?'El respaldo de perfil incluye este progreso. Usa los controles de respaldo y restauración de esta página. No hay sincronización entre dispositivos. Usa una sola pestaña para evitar cambios simultáneos.':'Profile backups include this progress. Use this page’s backup and restore controls. There is no cross-device sync. Use one tab to avoid simultaneous edits.'}</p>
  <NarrationControls allowPause={false} narrator={n} language={profile.language}/>
  <button type="button" onClick={()=>{
   if(!window.confirm(es?'¿Borrar solo el progreso del laboratorio? Las estrellas y los demás juegos se conservan.':'Reset only Learning Lab progress? Stars and other games are preserved.'))return;
   cancelNarration();const id=profile.id;
   commitProfile(current=>current.id!==id?current:resetLearning(current));
  }}>{es?'Restablecer solo el laboratorio':'Reset Learning Lab only'}</button>
 </section>;
}

export default function LearningLab() {
 const {profile,commitProfile,saveState}=useAppStore();const language=profile.language,es=language==='es-MX';
 const p=normalizeProgress(profile.learningLab),m=missions[p.mission],item=lessonItem(p.mission,p.position,p.band);
 const narrator=useNarration(language,profile.nico.speechEnabled);
 const result=p.results[item.id];const fingerprint=JSON.stringify(p);
 const send=(action:Action)=>{
  narrator.stop();const id=profile.id;
  commitProfile(current=>applyLearningAction(current,id,fingerprint,action));
 };
 useEffect(()=>()=>cancelNarration(),[]);
 const intro=p.phase==='introduction',complete=p.phase==='completion',feedback=p.phase==='feedback';
 const explanation=workedExample(p.mission,p.band)[language];
 const response=feedback?(result?.correct?(es?'¡Funciona! Comprobaste tu respuesta.':'It works! You checked your answer.'):(item.feedback[p.lastAnswer]?.[language]??item.hints[0][language])):'';
 const readText=[m.title[language],intro?m.objective[language]:'',intro?explanation:item.prompt[language],!intro&&!complete?item.visual[language]:'',response,p.hints?item.hints[p.hints-1][language]:'',p.alternative?item.alternative[language]:''].filter(Boolean).join('. ');
 return <div className="learning-lab" data-testid="learning-lab" data-item-id={item.id}>
  <header className="learning-hero">
   <div className="learning-guide"><NicoCostumeFigure profession="teacher" wardrobe={profile.nico.wardrobe} alt={es?'Nico, guía por computadora':'Nico, a computer learning guide'}/></div>
   <div><small>{es?'AVENTURA DE APRENDIZAJE · VISTA PREVIA':'LEARNING ADVENTURE · PREVIEW'}</small><h2>{es?'Rescate Robot':'Robot Rescue'}</h2><p>{es?'Enciende las señales y ayuda a los robots a volver a casa. Puedes parar cuando quieras.':'Light the signals and help the robots get home. You can stop whenever you want.'}</p><p className="learning-save" role="status">{saveState.status==='saved'?(es?'Progreso guardado en este navegador.':'Progress saved in this browser.'):saveState.status==='error'?(es?'Solo esta sesión: no se guardó. Descarga un respaldo.':'Session only: not saved. Download a backup.'):(es?'Guardando…':'Saving…')}</p></div>
  </header>
  <nav className="learning-missions" aria-label={es?'Misiones de rescate':'Rescue missions'}>{missions.map((mission,index)=><button type="button" key={mission.id} aria-current={p.mission===index?'step':undefined} onClick={()=>send({type:'mission',mission:index})}><span>{index+1}</span>{mission.title[language]}{p.rewarded.includes(mission.id)?' ✓':''}</button>)}</nav>
  <section className="learning-station" aria-labelledby="learning-objective">
   <div className="learning-heading"><div><small>{es?'MISIÓN':'MISSION'} {p.mission+1} / 6 · {p.band==='gentle'?(es?'INICIAL':'GENTLE'):(es?'RETO':'CHALLENGE')}</small><h2 id="learning-objective">{m.title[language]}</h2></div><label>{es?'Idioma':'Language'}<select aria-label={es?'Idioma':'Language'} value={language} onChange={e=>{cancelNarration();const next=e.target.value==='es-MX'?'es-MX':'en',id=profile.id;commitProfile(c=>c.id===id?{...c,language:next}:c);}}><option value="en">English</option><option value="es-MX">Español de México</option></select></label></div>
   {intro?<div className="learning-example"><h3>{es?'Tu objetivo':'Your objective'}</h3><p>{m.objective[language]}</p><h3>{es?'Veamos un ejemplo':'Let’s try an example'}</h3><p>{explanation}</p><button className="fw-primary" type="button" onClick={()=>send({type:'begin'})}>{es?'Me toca':'My turn'}</button></div>:complete?<div className="learning-example"><h3>{es?'¡Misión completada!':'Mission complete!'}</h3><p>{es?'La recompensa celebra tu esfuerzo. Aprender con ayuda también cuenta como práctica.':'The reward celebrates your effort. Learning with help counts as practice too.'}</p><p>{demonstrated(p,p.mission,p.band)?(es?'Dos comprobaciones distintas sin ayuda, incluida una de aplicación.':'Two distinct unassisted checks, including a transfer question.'):(es?'Completaste la misión. Todavía no hay dos comprobaciones sin ayuda en este nivel.':'You completed the mission. Two unassisted checks are not yet recorded in this band.')}</p><button type="button" onClick={()=>send({type:'mission',mission:(p.mission+1)%6})}>{p.mission===5?(es?'Volver a explorar':'Explore again'):(es?'Siguiente misión':'Next mission')}</button></div>:<>
    <p className="learning-stage">{item.transfer?(es?'APLICA LO APRENDIDO':'USE WHAT YOU LEARNED'):item.check?(es?'COMPRUEBA SIN AYUDA':'CHECK ON YOUR OWN'):(es?'PRACTICA':'PRACTICE')} · {p.position+1} / 4</p>
    <h3>{item.prompt[language]}</h3><div className="learning-visual">{item.visual[language]}</div>
    <div className="learning-answers" role="group" aria-label={es?'Elige una respuesta':'Choose an answer'}>{item.options.map(option=><button type="button" key={option.id} disabled={feedback} data-answer-id={option.id} onClick={()=>send({type:'answer',item:item.id,answer:option.id})}>{option.label[language]}</button>)}</div>
    {feedback&&<div className="learning-feedback" role="status"><p>{response}</p>{!result?.correct&&(result?.attempts??0)>=2&&<p>{item.alternative[language]}</p>}<button className="fw-primary" type="button" onClick={()=>send({type:result?.correct?'next':'retry',item:item.id})}>{result?.correct?(es?'Continuar':'Continue'):(es?'Intentar con esta pista':'Retry with this clue')}</button></div>}
    {p.hints>0&&<aside className="learning-hint">{item.hints[p.hints-1][language]}</aside>}{p.alternative&&<aside className="learning-hint">{item.alternative[language]}</aside>}
    <div className="learning-tools"><button type="button" disabled={feedback||p.hints===2} onClick={()=>send({type:'hint',item:item.id})}>{es?'Dame una pista':'Give me a hint'} ({p.hints}/2)</button><button type="button" disabled={feedback||p.alternative} onClick={()=>send({type:'alternative',item:item.id})}>{es?'Explícalo de otra manera':'Explain another way'}</button></div>
    {(p.hints===2||feedback)&&<p>{es?'Las pistas quedan visibles. Elige una respuesta si aún no la has enviado; después podrás continuar o volver a intentarlo.':'The hints stay visible. Choose an answer if you have not submitted one; then you can continue or retry.'}</p>}
   </>}
   <div className="learning-tools"><button type="button" disabled={p.nextBand==='gentle'} onClick={()=>send({type:'difficulty',band:'gentle'})}>{es?'Más fácil':'Make it easier'}</button><button type="button" disabled={p.nextBand==='challenge'} onClick={()=>send({type:'difficulty',band:'challenge'})}>{es?'Más difícil':'Make it harder'}</button></div>
   <p>{es?'Nivel del próximo ejercicio: ':'Next exercise difficulty: '}{p.nextBand==='gentle'?(es?'Inicial':'Gentle'):(es?'Reto':'Challenge')}. {es?'La respuesta actual no cambia.':'The current answer stays the same.'}</p>
   <div className="learning-tools"><button type="button" disabled={!narrator.canSpeak||complete} onClick={()=>narrator.speak([{text:speechText(readText,language)}])}>{es?'Repetir':'Repeat'}</button><button type="button" onClick={narrator.stop}>{es?'Detener':'Stop'}</button></div>
   {!narrator.canSpeak&&<p role="status">{es?'Modo de texto. Abre Voz y lectura para ver las voces locales disponibles.':'Text mode. Open Voice & reading to see available local voices.'}</p>}
   <NarrationControls allowPause={false} narrator={narrator} language={language}/>
  </section>
  <p>{es?'Sin micrófono ni chat. Las lecciones ya cargadas pueden funcionar sin internet cuando el navegador las haya guardado. La voz sin conexión depende del dispositivo.':'No microphone or chat. Loaded lessons can work offline once cached by the browser. Offline speech depends on the device.'}</p>
 </div>;
}
