import {useState} from 'react';
import type {Language} from '../types';
import {answerDance,collectStar,danceSteps,starTiles,type UnicornMove} from './unicornPlay';
import './unicorn-playground.css';
const moves:Record<UnicornMove,{icon:string;en:string;'es-MX':string}>={prance:{icon:'🐎',en:'Prance','es-MX':'Trotar'},turn:{icon:'↪️',en:'Turn','es-MX':'Voltear'},float:{icon:'☁️',en:'Float','es-MX':'Flotar'},rest:{icon:'🌙',en:'Rest','es-MX':'Descansar'}};
export function UnicornPlayground({language,name,poses}:{language:Language;name:string;poses:Record<UnicornMove,string>}){
 const es=language==='es-MX';
 const [activity,setActivity]=useState<'care'|'dance'|'stars'>('care'),[pose,setPose]=useState<UnicornMove>('prance');
 const [reaction,setReaction]=useState<'hello'|'feed'|'brush'|'hug'|'right'|'retry'|'star'|'other'>('hello');
 const [round,setRound]=useState(0),[step,setStep]=useState(0),[show,setShow]=useState(true),[found,setFound]=useState<number[]>([]);
 const sequence=danceSteps(round),board=starTiles(round),total=board.filter(t=>t.kind==='star').length;
 const done=activity==='dance'?step===sequence.length:activity==='stars'&&found.length===total;
 const feedback={hello:es?'¡Vamos a jugar!':'Let’s play!',feed:es?'¡Ñam! Tu unicornio disfruta su manzana.':'Crunch! Your unicorn enjoys her apple.',brush:es?'¡Su crin brilla después del cepillado!':'Her mane sparkles after brushing!',hug:es?'Tu unicornio se acurruca para recibir cariño.':'Your unicorn snuggles up for a cuddle.',right:es?'¡Ese es el movimiento! Sigue con el siguiente.':'That’s the move! Try the next one.',retry:es?'Ese no era el siguiente paso. Puedes mirar la secuencia otra vez.':'That was not the next step. You can look at the sequence again.',star:es?'¡Encontraste una estrella!':'You found a star!',other:es?'Busca las figuras con cinco puntas: las estrellas.':'Look for the shapes with five points: stars.'}[reaction];
 const reset=()=>{setStep(0);setShow(true);setFound([]);setReaction('hello');};
 return <section className="unicorn-playground" aria-label={es?'Juega con tu unicornio':'Play with your unicorn'}>
  <header><small>{es?'CUIDA · RECUERDA · DESCUBRE':'CARE · REMEMBER · DISCOVER'}</small><h2>{es?`Juega con ${name}`:`Play with ${name}`}</h2></header>
  <div className="unicorn-play-tabs" role="group" aria-label={es?'Actividades':'Activities'}>{(['care','dance','stars'] as const).map((id,i)=><button type="button" key={id} aria-pressed={activity===id} onClick={()=>{setActivity(id);reset();}}>{['💗','💃','⭐'][i]} {es?['Cuidados','Baile mágico','Busca estrellas'][i]:['Care time','Magic dance','Star hunt'][i]}</button>)}</div>
  <div className={`unicorn-play-scene unicorn-play-scene--${reaction}`}>
   <img src={poses[pose]} alt={es?`${name}: ${moves[pose][language]}`:`${name}: ${moves[pose][language]}`}/>
   <span className="unicorn-play-reaction" aria-hidden="true">{reaction==='feed'?'🍎':reaction==='brush'?'✨':reaction==='hug'?'💗':done?'🌈':'🦋'}</span>
  </div>
  <p role="status">{done?(es?'¡Lo lograste! Tu unicornio celebra contigo.':'You did it! Your unicorn celebrates with you.'):feedback}</p>
  {activity==='care'?<><p>{es?'Elige un gesto de cariño. No hay hambre ni felicidad que bajen cuando te vas.':'Choose a kind action. Hunger and happiness never run down while you are away.'}</p><div className="unicorn-play-buttons">{(['feed','brush','hug'] as const).map((id,i)=><button type="button" key={id} onClick={()=>{setReaction(id);setPose((['turn','float','rest'] as const)[i]);}}>{['🍎','🪮','💗'][i]} {es?['Dar una manzana','Cepillar la crin','Dar un abrazo'][i]:['Feed an apple','Brush her mane','Give a cuddle'][i]}</button>)}</div></>:activity==='dance'?<>
   <p>{es?'Mira los pasos de izquierda a derecha. Después repite el baile tocando los botones.':'Look at the steps from left to right. Then repeat the dance by tapping the buttons.'}</p>
   {show?<><ol className="unicorn-dance-sequence">{sequence.map((move,i)=><li key={i}>{moves[move].icon} {moves[move][language]}</li>)}</ol><button type="button" onClick={()=>{setShow(false);setStep(0);setReaction('hello');}}>{es?'¡A bailar!':'Let’s dance!'}</button></>:<><p>{es?'Pasos completados':'Steps completed'}: {step} / {sequence.length}</p><div className="unicorn-play-buttons">{(Object.keys(moves) as UnicornMove[]).map(move=><button type="button" disabled={done} key={move} onClick={()=>{const next=answerDance(round,step,move);setReaction(next>step?'right':'retry');if(next>step)setPose(move);setStep(next);}}>{moves[move].icon} {moves[move][language]}</button>)}</div>{!done&&<button type="button" onClick={()=>setShow(true)}>{es?'Ver los pasos otra vez':'See the steps again'}</button>}</>}
  </>:<><p>{es?'Toca todas las estrellas para iluminar el prado.':'Tap all the stars to light up the meadow.'} {found.length} / {total}</p><div className="unicorn-star-board">{board.map(tile=><button type="button" key={tile.id} disabled={found.includes(tile.id)} aria-label={`${es?({star:'Estrella',moon:'Luna',flower:'Flor'}[tile.kind]):tile.kind} ${tile.id+1}`} onClick={()=>{const next=collectStar(round,found,tile.id);setFound(next);setReaction(next.length>found.length?'star':'other');if(next.length>found.length)setPose('float');}}>{found.includes(tile.id)?'✨':tile.kind==='star'?'⭐':tile.kind==='moon'?'🌙':'🌸'}</button>)}</div></>}
  {done&&<button type="button" onClick={()=>{setRound(r=>(r+1)%3);reset();}}>{es?'Otro reto':'Another challenge'}</button>}
  <small>{es?'Sin cronómetro. Puedes parar cuando quieras. Este juego se reinicia al salir.':'No timer. Stop whenever you like. This play session resets when you leave.'}</small>
 </section>;
}
