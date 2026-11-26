import {useState} from 'react';
import type {Language} from '../types';
import type {KingdomSave} from './save';
import {friends,songs,localName} from './kingdomDiscoveries';
import {kingdomArtUrl} from './kingdomArtwork';
import {ISLANDS} from './catalog';

export default function GardenJournal({save,language,choose,play}:{save:KingdomSave;language:Language;choose:(id:number)=>void;play:(island:number)=>void}){
 const [selected,setSelected]=useState(save.companion>=0?save.companion:save.island*3);
 const es=language==='es-MX',found=save.rescued.includes(selected),name=localName(friends[selected],language);
 return <section className="bk-journal" id="kingdom-journal" tabIndex={-1}>
  <header><h3>{es?'Álbum de amigos':'Friend album'}</h3><span>{save.rescued.length}/9</span></header>
  <div className="bk-friends">{friends.map((pair,id)=><button type="button" key={id} data-friend={id} aria-pressed={id===selected} onClick={()=>setSelected(id)} className={save.rescued.includes(id)?'known':''}>
   <i aria-hidden="true" style={{backgroundImage:'url('+kingdomArtUrl('friends')+')',backgroundPosition:(id%3*50)+'% '+(Math.floor(id/3)*50)+'%'}}/>
   <span>{localName(pair,language)}</span>
  </button>)}</div>
  <div className="bk-friend-info"><span>{found?(save.companion===selected?(es?name+' te acompaña.':name+' is riding with you.'):(es?name+' llegó a casa.':name+' is home.')):(es?'Busca a '+name+' en ':'Find '+name+' in ')+ISLANDS[Math.floor(selected/3)][language]+'.'}</span>
  {found&&<button type="button" onClick={()=>choose(save.companion===selected?-1:selected)}>{save.companion===selected?(es?'Viajar sin compañía':'Ride solo'):(es?'Llevar conmigo':'Ride together')}</button>}</div>
  <h3>{es?'Cancionero':'Songbook'}</h3>
  <div className="bk-songs">{songs.map((song,island)=>{
   const count=save.bells.filter(id=>Math.floor(id/3)===island).length;
   return <button type="button" key={island} data-song={island} disabled={count<3||save.chimesMuted} onClick={()=>play(island)}>
    <b>{count===3?'♫':'♪'} {localName(song,language)}</b><span>{count===3?(es?'Reproducir':'Play song'):count+'/3 '+(es?'flores':'flowers')}</span>
   </button>;
  })}</div>
 </section>;
}
