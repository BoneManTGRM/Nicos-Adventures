import {useMemo,useState} from 'react';
import {useAppStore} from '../app/AppStoreContext';
import type {Language} from '../types';
import {arcadeWords,hasScoreCapacity,checkSentence,clearMismatch,initialMatch,makeDeck,sentencesForLevel,type SentenceLevel,shuffled,turnCard} from './arcadeLearning';
import './learning-arcade.css';
export type LearningGame='word-match'|'sentence-builder';
export function LearningArcade({game,close}:{game:LearningGame;close:()=>void}){
 const {profile,commitProfile,saveState}=useAppStore(),es=profile.language==='es-MX';
 const [target,setTarget]=useState<Language>(es?'en':'es-MX'),[round,setRound]=useState(0),[sentenceSet,setSentenceSet]=useState(0),[sentenceLevel,setSentenceLevel]=useState<SentenceLevel>('all');
 const [match,setMatch]=useState(initialMatch),[position,setPosition]=useState(0),[order,setOrder]=useState<number[]>([]);
 const [feedback,setFeedback]=useState<'none'|'wrong'|'right'>('none'),[hint,setHint]=useState(false),[done,setDone]=useState(false);
 const deck=useMemo(()=>makeDeck(37+round,round%2),[round]);
 const phrases=sentencesForLevel(sentenceLevel);
 const phrase=phrases[sentenceSet*4+position],tokens=phrase.tokens[target];
 const tiles=useMemo(()=>{const ids=shuffled(tokens.map((_,i)=>i),91+position);return ids.every((n,i)=>n===i)?ids.reverse():ids;},[tokens,position]);
 const reset=()=>{setRound(r=>(r+1)%10000);setMatch(initialMatch());setPosition(0);setOrder([]);setFeedback('none');setHint(false);setDone(false);};
 const saveBest=(score:number)=>{const id=profile.id;commitProfile(c=>c.id!==id||!hasScoreCapacity(c.arcadeScores,`learning:${game}:${target}`)?c:{...c,arcadeScores:{...c.arcadeScores,[`learning:${game}:${target}`]:Math.max(c.arcadeScores[`learning:${game}:${target}`]??0,score)}});};
 const flip=(id:string)=>{const next=turnCard(match,deck,id);if(next===match)return;setMatch(next);if(next.matched.length===4){setDone(true);saveBest(4);}};
 const title=game==='word-match'?(es?'Parejas de palabras':'Word Match'):(es?'Constructor de frases':'Sentence Builder');
 const other=target==='en'?'es-MX':'en';
 const scoreCapacity=hasScoreCapacity(profile.arcadeScores,`learning:${game}:${target}`);
 return <section className="learning-arcade" data-testid="learning-arcade">
  <header><button type="button" onClick={close}>← {es?'Todos los juegos':'All games'}</button><h2>{title}</h2></header>
  <label>{es?'Idioma para practicar':'Practice language'}<select value={target} onChange={e=>{setTarget(e.target.value as Language);reset();}}><option value="en">English · USA</option><option value="es-MX">Español · México</option></select></label>
  {game==='sentence-builder'&&<label>{es?'Nivel de práctica de inglés':'English practice level'}<select value={sentenceLevel} onChange={e=>{setSentenceLevel(e.target.value as SentenceLevel);setSentenceSet(0);reset();}}><option value="all">{es?'Todas las frases':'All sentences'}</option><option value="pre-a1">Pre A1 · Starters</option><option value="a1">A1 · Movers</option><option value="a2">A2 · Flyers</option></select></label>}
  {game==='sentence-builder'&&<label>{es?'Ronda de frases':'Sentence round'}<select value={sentenceSet} onChange={e=>{setSentenceSet(Number(e.target.value));reset();}}>{Array.from({length:phrases.length/4},(_,i)=><option key={i} value={i}>{i+1} / {phrases.length/4} · {es?'Frases':'Sentences'} {i*4+1}–{i*4+4}</option>)}</select></label>}
  {done?<div className="learning-arcade-win"><span aria-hidden="true">🤖 ✨</span><h3>{es?'¡Rescate completado!':'Rescue complete!'}</h3><p>{game==='word-match'?(es?'¡Practicaste cuatro palabras!':'You practiced four words!'):(es?'¡Construiste cuatro mensajes!':'You built four messages!')}</p><button type="button" onClick={()=>{if(game==='sentence-builder')setSentenceSet(s=>(s+1)%(phrases.length/4));reset();}}>{es?'Otra ronda':'Another round'}</button></div>:game==='word-match'?<>
   <p>{es?'Voltea dos tarjetas. Une cada palabra con su imagen. Las pistas de abajo te ayudan a aprender primero.':'Turn two cards. Match each word to its picture. Use the guide below to learn them first.'}</p>
   <details><summary>{es?'Ver las palabras':'See the words'}</summary><div className="learning-word-guide">{arcadeWords.slice(round%2?4:0,round%2?8:4).map(w=><p key={w.id}>{w.picture} <strong lang={target}>{w.label[target]}</strong> · {w.label[other]}</p>)}</div></details>
   <p>{es?'Parejas encontradas':'Pairs found'}: {match.matched.length} / 4</p>
   <div className="learning-memory-board">{deck.map((card,i)=>{const w=arcadeWords.find(w=>w.id===card.word)!,matched=match.matched.includes(card.word),open=matched||match.open.includes(card.id);return <button type="button" key={card.id} data-memory-card={card.id} className={matched?'is-matched':''} disabled={matched||match.feedback==='mismatch'} lang={open&&card.kind==='word'?target:profile.language} aria-label={open?(card.kind==='picture'?`${es?'Imagen':'Picture'}: ${w.label[profile.language]}`:`${target==='en'?'Word':'Palabra'}: ${w.label[target]}`):`${es?'Tarjeta':'Card'} ${i+1}`} aria-pressed={open} onClick={()=>flip(card.id)}><span aria-hidden="true" lang={card.kind==='word'?target:undefined}>{open?(card.kind==='picture'?w.picture:w.label[target]):'✦'}</span>{matched&&<small>✓</small>}</button>;})}</div>
   <div role="status">{match.feedback==='match'?(es?'¡Son pareja!':'They match!'):match.feedback==='mismatch'?<><p>{es?'Estas no son pareja. Mira lo que significa cada una:':'These do not match. Here is what each one means:'}</p>{match.open.map(id=>{const card=deck.find(c=>c.id===id)!,w=arcadeWords.find(w=>w.id===card.word)!;return <p key={id}>{w.picture} {w.label[target]} = {w.label[other]}</p>;})}<button type="button" onClick={()=>setMatch(clearMismatch(match))}>{es?'Volver a voltear':'Turn them back'}</button></>:null}</div>
  </>:<>
   <p>{es?'Toca las palabras para formar el mensaje.':'Tap the words to build the message.'}</p>
   <div className="learning-sentence-scene"><span aria-hidden="true">{phrase.picture}</span><h3 lang={other}>{phrase.tokens[other].join(' ')}.</h3><p>{es?'Mensaje':'Message'} {position+1} / 4</p></div>
   <div className="learning-sentence-slots" lang={target} aria-label={es?'Tu frase':'Your sentence'}>{order.length?order.map(i=><span key={i}>{tokens[i]}</span>):<p>{es?'Coloca las palabras aquí.':'Place the words here.'}</p>}</div>
   <div className="learning-word-tiles">{tiles.map(i=><button type="button" key={i} data-word-tile={i} lang={target} disabled={order.includes(i)||feedback==='right'} onClick={()=>{setOrder(o=>[...o,i]);setFeedback('none');}}>{tokens[i]}</button>)}</div>
   <div className="learning-game-tools"><button type="button" disabled={!order.length||feedback==='right'} onClick={()=>{setOrder(o=>o.slice(0,-1));setFeedback('none');}}>{es?'Deshacer':'Undo'}</button><button type="button" disabled={order.length!==tokens.length||feedback==='right'} onClick={()=>setFeedback(checkSentence(tokens,order)?'right':'wrong')}>{es?'Probar mensaje':'Try message'}</button><button type="button" disabled={hint} onClick={()=>setHint(true)}>{es?'Mostrar ejemplo':'Show example'}</button></div>
   {hint&&<p lang={target}>{tokens.join(' ')}.</p>}
   {feedback!=='none'&&<div className="learning-game-feedback" role="status">{feedback==='right'?<><p>{es?'¡El robot entiende el mensaje!':'The robot understands the message!'}</p><button type="button" onClick={()=>{if(position===3){setDone(true);saveBest(4);}else{setPosition(p=>p+1);setOrder([]);setHint(false);setFeedback('none');}}}>{es?'Siguiente':'Next'}</button></>:<p>{es?'Revisa la primera palabra que está fuera de lugar. Debe ser: ':'Check the first word out of place. It should be: '}{tokens[order.findIndex((id,i)=>tokens[id]!==tokens[i])]}. {es?'Usa Deshacer o mira el ejemplo.':'Use Undo or look at the example.'}</p>}</div>}
  </>}
  <details><summary>{es?'Mi progreso y cómo jugar':'My progress & how to play'}</summary>
  <p>{es?'Mejor ronda completada: ':'Best completed round: '}{profile.arcadeScores[`learning:${game}:${target}`]??0} / 4</p>
  {game==='sentence-builder'&&<p>{es?'Niveles sugeridos para practicar inglés, con traducciones al español. Material independiente; no es un curso oficial ni una evaluación de Cambridge. Cambiar el nivel empieza otra ronda.':'Suggested English practice levels, with Spanish translations. Independent material; not an official Cambridge course or assessment. Changing level starts a new round.'}</p>}
  <p className="learning-arcade-note">{es?'Los resultados completados se pueden guardar aquí. Si sales o cambias el idioma de práctica, empieza otra ronda.':'Completed results can be saved here. Leaving or changing the practice language starts a new round.'}</p>
</details>
  <p role="status">{!scoreCapacity?(es?'La lista de resultados está llena. Esta ronda no se guardará; tus otros resultados se conservan.':'The results list is full. This round will not be saved; your other results are preserved.'):saveState.status==='error'?(es?'No se pudo guardar. Puedes seguir jugando en esta sesión.':'Could not save. You can keep playing this session.'):(es?'Datos locales de este navegador.':'Local data in this browser.')}</p>
 </section>;
}
