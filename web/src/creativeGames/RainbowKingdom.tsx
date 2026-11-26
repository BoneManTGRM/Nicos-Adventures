import {useUnicornArt} from './useUnicornArt';
import {useEffect,useRef,useState} from 'react';
import {ISLANDS,MAGIC} from './catalog';
import {buyMagic,rescueFriend} from './save';
import {settleKingdomRide} from './kingdomRewards';
import {PADS,STARTER_COURSE,type Ride} from './kingdomPhysics';
import {magicArt,propAspect,creatureArt,unicornArt} from './kingdomArt';
import KingdomStage from './KingdomStage';
import GardenJournal from './GardenJournal';
import {kingdomArtUrl,drawTile,waitForKingdomArt} from './kingdomArtwork';
import {kingdoms,GardenChimes} from './kingdomDiscoveries';
import {useGameSave} from './useGameSave';
import type {Language} from '../types';
import './creative-games.css';
import './rainbow-gardens.css';
function MagicPicture({id}:{id:number}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const c=ref.current?.getContext('2d');if(!c)return;let active=true;
  const draw=()=>{if(!active)return;c.clearRect(0,0,160,110);const aspect=propAspect[id-1],h=Math.min(100,148/aspect),w=h*aspect;
   if(!drawTile(c,'magic',3,4,id-1,(160-w)/2,(110-h)/2,w,h)){c.save();c.translate(80,75);c.scale(.64,.64);magicArt(c,id,0,0,160,0);c.restore();}
  };draw();void waitForKingdomArt('magic')?.then(draw);return()=>{active=false;};
 },[id]);
 return <canvas ref={ref} width="160" height="110" aria-hidden="true"/>;
}
function GardenPortrait({color,name,rescued}:{color:number;name:string;rescued:number[]}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const c=ref.current?.getContext('2d');if(!c)return;let active=true;
  const draw=()=>{if(!active)return;c.clearRect(0,0,320,170);unicornArt(c,184,162,0,color);
   rescued.slice(-2).forEach((id,i)=>{c.save();c.translate(72+i*190,138);c.scale(.68,.68);creatureArt(c,0,0,id);c.restore();});};
  draw();void waitForKingdomArt('friends')?.then(draw);return()=>{active=false;};
 },[color,rescued.join(',')]);
 return <canvas ref={ref} width="320" height="170" role="img" aria-label={name}/>;
}
export default function RainbowKingdom({close}:{close:()=>void}){
 const {profile,games,setKingdom,saveState}=useGameSave(),k=games.kingdom,language=profile.language,es=language==='es-MX';
 const [selected,setSelected]=useState(0),[magic,setMagic]=useState(1),[ride,setRide]=useState(false),[session,setSession]=useState(0),[undo,setUndo]=useState<number[]|null>(null),[message,setMessage]=useState('');
 const art=useUnicornArt(),audio=useRef<GardenChimes|null>(null);
 useEffect(()=>()=>audio.current?.close(),[]);
 function chime(island:number,phrase:number|null){if(k.chimesMuted)return;audio.current??=new GardenChimes();audio.current.play(island,phrase);}

 const island=k.island,item=MAGIC[magic-1],canPlace=k.owned.includes(magic),awarded=useRef(false);
 const place=(index:number)=>{setSelected(index);if(!canPlace){setMessage(es?'Desbloquea esta pieza antes de colocarla.':'Unlock this piece before placing it.');return;}setUndo([...k.layouts[island]]);setKingdom(current=>{const layouts=current.layouts.map(row=>[...row]);layouts[island][index]=magic;return {...current,layouts};});setMessage(es?`${item.name[language]} colocada en el lugar ${index+1}.`:`${item.name[language]} placed at spot ${index+1}.`);};
 const start=()=>{awarded.current=false;setKingdom(current=>({...current,sequence:current.sequence+1,lastReward:0}));setSession(n=>n+1);setRide(true);window.scrollTo({top:0,behavior:'auto'});};
 const finish=(run:Ride)=>{if(awarded.current)return;awarded.current=true;setKingdom(current=>settleKingdomRide(current,run,island));};
 if(art.status!=='ready')return <section className="cg-shell cg-kingdom" data-testid="rainbow-kingdom"><header className="cg-topbar"><button type="button" onClick={close}>← {es?'Sala de juegos':'Arcade'}</button><span className="cg-wordmark">BECCA’S <b>RAINBOW KINGDOM</b></span></header><div className="cg-art-loading" role={art.status==='error'?'alert':'status'}><h2>{art.status==='error'?(es?'No se pudo cargar el unicornio':'The unicorn artwork could not load'):(es?'Preparando a tu unicornio…':'Getting your unicorn ready…')}</h2><p>{es?'Tu jardín y tus premios siguen guardados.':'Your garden and rewards remain saved.'}</p>{art.status==='error'&&<button type="button" className="cg-primary" onClick={art.retry}>{es?'Volver a intentar':'Try again'}</button>}</div></section>;
 return <section className="cg-shell cg-kingdom" data-testid="rainbow-kingdom"><header className="cg-topbar"><button type="button" onClick={close}>← {es?'Sala de juegos':'Arcade'}</button><span className="cg-wordmark">BECCA’S <b>RAINBOW KINGDOM</b></span><div className="cg-wallet"><span aria-hidden="true">✿</span><strong data-testid="kingdom-petals">{k.petals}</strong><small>{es?'pétalos':'petals'}</small></div></header>
 {saveState.status==='error'&&<p role="alert" className="cg-save-error">{es?'Este navegador no pudo guardar tu progreso.':'This browser could not save your progress.'}</p>}
 <div className="cg-intro bk-banner" style={{backgroundImage:'linear-gradient(90deg,#211835e8 2%,#241d3860 62%,transparent),url('+kingdomArtUrl(kingdoms[island])+')'}}><div><h2>{ISLANDS[island][language]}</h2><p>{es?'Rescata a tres amigos y descubre la canción secreta del jardín.':'Rescue three friends and discover the garden’s secret song.'}</p></div><GardenPortrait color={k.color} name={k.name} rescued={k.rescued}/></div>
 <div className="cg-kingdom-toolbar"><label>{es?'Mi unicornio':'My unicorn'}<input maxLength={26} value={k.name} onChange={e=>setKingdom(current=>({...current,name:e.target.value}))}/></label><label>{es?'Paleta del unicornio':'Unicorn palette'}<select value={k.color} onChange={e=>setKingdom(current=>({...current,color:Number(e.target.value)}))}>{[es?'Arcoíris':'Rainbow',es?'Turquesa':'Turquoise',es?'Atardecer':'Sunset',es?'Dorado':'Golden'].map((name,i)=><option key={i} value={i}>{name}</option>)}</select></label><label>{es?'Jardín':'Garden'}<select disabled={ride} value={island} onChange={e=>{setUndo(null);setKingdom(current=>({...current,island:Number(e.target.value)}));}}>{ISLANDS.map((name,i)=><option key={i} value={i}>{name[language]}</option>)}</select></label></div>
 <KingdomStage key={`${session}-${island}-${ride}`} save={k} island={island} ride={ride} selected={selected} onRescue={id=>setKingdom(current=>rescueFriend(current,id))} onFinish={finish} language={language} onPlace={place} onPhrase={index=>chime(island,index)} onBell={id=>setKingdom(current=>current.bells.includes(id)?current:{...current,bells:[...current.bells,id]})}/>
 {ride&&k.lastReward>0&&<div className="cg-discovery" role="status"><strong>+{k.lastReward} {es?'pétalos por completar el recorrido':'petals for completing the ride'}</strong></div>}
 <div className="cg-kingdom-actions">{ride?<button type="button" className="cg-primary" onClick={()=>setRide(false)}>{es?'Volver a construir':'Back to building'}</button>:<><button type="button" className="cg-primary" data-testid="kingdom-ride" onClick={start}>{k.layouts[island].some(Boolean)?(es?'Recorrer mi aventura':'Ride my adventure'):(es?'Recorrer el camino inicial':'Ride the starter trail')} →</button><button type="button" onClick={()=>{setUndo([...k.layouts[island]]);setKingdom(current=>{const layouts=current.layouts.map(row=>[...row]);layouts[island]=[...STARTER_COURSE];return {...current,layouts};});setMessage(es?'Camino inicial listo. Puedes cambiarlo.':'Starter course ready. Make it your own.');}}>{es?'Preparar camino inicial':'Set up starter course'}</button><button type="button" onClick={()=>document.getElementById('kingdom-journal')?.focus()}>{es?'Abrir álbum':'Open friend album'}</button></>}</div>
 {!ride&&<><p className="cg-build-instruction">{es?'Elige una pieza y toca un lugar numerado para colocarla. Luego recorre lo que construiste.':'Choose a piece, then tap a numbered spot to place it. Then ride what you built.'}</p><div className="cg-pad-grid">{PADS.map((_,i)=><button type="button" key={i} data-build-pad={i} aria-pressed={selected===i} onClick={()=>place(i)}><span>{i+1}</span><small>{k.layouts[island][i]?MAGIC[k.layouts[island][i]-1].name[language]:(es?'Lugar libre':'Open spot')}</small></button>)}</div><div className="cg-two-buttons"><button type="button" disabled={!undo} onClick={()=>{if(!undo)return;const previous=undo;setKingdom(current=>{const layouts=current.layouts.map(row=>[...row]);layouts[island]=previous;return {...current,layouts};});setUndo(null);}}>{es?'Deshacer':'Undo'}</button><button type="button" onClick={()=>{setUndo([...k.layouts[island]]);setKingdom(current=>{const layouts=current.layouts.map(row=>[...row]);layouts[island][selected]=0;return {...current,layouts};});}}>{es?'Quitar pieza seleccionada':'Remove selected piece'}</button></div>
 <div className="cg-shop-heading"><div><span className="cg-eyebrow">{es?'PIEZAS QUE HACEN COSAS':'PIECES THAT DO THINGS'}</span><h3>{es?'Taller de magia':'The magic workshop'}</h3></div><span>{k.owned.length}/12 {es?'piezas tuyas':'pieces owned'}</span></div><div className="cg-magic-grid">{MAGIC.map(p=><button type="button" key={p.id} data-magic-id={p.id} className={`cg-part-card ${magic===p.id?'is-selected':''}`} aria-pressed={magic===p.id} onClick={()=>setMagic(p.id)}><MagicPicture id={p.id}/><strong>{p.name[language]}</strong><small>{k.owned.includes(p.id)?(es?'Tuya · coloca donde quieras':'Owned · place freely'):`✿ ${p.price}`}</small></button>)}</div><div className="cg-magic-detail"><div><h3>{item.name[language]}</h3><p>{item.description[language]}</p></div>{!canPlace&&<button type="button" className="cg-primary" disabled={k.petals<item.price} onClick={()=>setKingdom(current=>buyMagic(current,magic))}>{es?'Desbloquear':'Unlock'} · ✿ {item.price}</button>}</div></>}
 <p className="cg-feedback" role="status">{message}</p>
 <div className="bk-sound"><button type="button" aria-pressed={!k.chimesMuted} onClick={()=>{audio.current?.close();audio.current=null;setKingdom(current=>({...current,chimesMuted:!current.chimesMuted}));}}>{k.chimesMuted?(es?'Sonido desactivado':'Sound off'):(es?'Sonido activado':'Sound on')}</button></div>
 {!ride&&<GardenJournal save={k} language={language} choose={id=>setKingdom(current=>id===-1||current.rescued.includes(id)?{...current,companion:id}:current)} play={i=>chime(i,null)}/>}
 <p className="cg-help">{es?'Cada amigo nuevo da 15 pétalos. Completar un jardín da 15, más 30 la primera vez.':'Each new friend earns 15 petals. Finishing a garden earns 15, plus 30 the first time.'}</p></section>;
}
