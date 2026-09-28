import { useState } from 'react';
import type { LessonItem } from './lessons';
import type { Language } from '../types';

/** Ungraded scaffolding. Parent must record assistance before mounting. */
export function TeachingWorkbench({item,language}:{item:LessonItem;language:Language}) {
 const es=language==='es-MX',d=item.diagram;
 const [marked,setMarked]=useState<string[]>([]),[order,setOrder]=useState<string[]>([]);
 const toggle=(id:string)=>setMarked(m=>m.includes(id)?m.filter(x=>x!==id):[...m,id]);
 const arithmetic=item.visual.en.match(/^(\d+) ([+-]) (\d+) = \?$/);
 const subtract=arithmetic?.[2]==='-';
 const sequence=/^[a-d]{3,4}$/.test(item.options[0]?.id??'');
 const cards=sequence?item.options[0].id.split('').sort():[];
 return <section className="learning-workbench" aria-label={es?'Mesa de práctica con ayuda':'Hands-on practice with help'}>
  <h3>{es?'Vamos a probarlo':'Let’s work it out'}</h3>
  <p>{es?'Esta es práctica con ayuda. Explora aquí y después elige tu respuesta.':'This is practice with help. Explore here, then choose your answer.'}</p>
  {d?.kind==='groups'?<>
   <p>{subtract?(es?`Toca ${arithmetic![3]} objetos para tacharlos. Cuenta los que quedan.`:`Tap ${arithmetic![3]} objects to cross them out. Count what remains.`):(es?'Toca cada objeto para marcarlo. Tócalo otra vez para desmarcarlo.':'Tap each object to mark it. Tap again to unmark it.')}</p>
   <div className="learning-workspace-groups">{d.groups.map((n,g)=><div className="learning-workspace-group" key={g}>
    <strong>{d.groups.length>1?(g===0?(es?'Grupo izquierdo':'Left group'):(es?'Grupo derecho':'Right group')):(es?'Objetos':'Objects')}</strong>
    <div className="learning-manipulatives">{Array.from({length:n},(_,i)=>{const id=`${g}:${i}`,selected=marked.includes(id);return <button type="button" key={id} aria-pressed={selected} aria-label={`${es?'Objeto':'Object'} ${i+1}, ${es?'grupo':'group'} ${g+1}`} onClick={()=>toggle(id)}>{selected?(subtract?'×':'✓'):'●'}</button>;})}</div>
    <p>{subtract?(es?'Sin tachar: ':'Remaining: '):(es?'Marcados: ':'Marked: ')}{subtract?n-marked.filter(x=>x.startsWith(`${g}:`)).length:marked.filter(x=>x.startsWith(`${g}:`)).length}</p>
   </div>)}</div>
  </>:sequence?<>
   <p>{es?'Toca las tarjetas en el orden que quieras probar. Revisa las reglas de arriba.':'Tap the cards in the order you want to try. Check the rules above.'}</p>
   <div className="learning-manipulatives">{cards.map(c=><button type="button" disabled={order.includes(c)} key={c} onClick={()=>setOrder(o=>[...o,c])}>{c.toUpperCase()}</button>)}</div>
   <p className="learning-built-order">{order.length?order.join(' → ').toUpperCase():(es?'Tu programa aparece aquí.':'Your program appears here.')}</p>
   <button type="button" disabled={!order.length} onClick={()=>setOrder(o=>o.slice(0,-1))}>{es?'Quitar último paso':'Undo last step'}</button>
  </>:d?.kind==='tiles'&&d.rows.length===2?<>
   <p>{es?'Compara una columna a la vez. Toca un paso para ver si coincide.':'Compare one column at a time. Tap a step to see whether it matches.'}</p>
   <div className="learning-manipulatives">{d.rows[0].map((v,i)=><button type="button" aria-pressed={marked.includes(String(i))} key={i} onClick={()=>toggle(String(i))}>{es?'Paso':'Step'} {i+1}<br/>{v} / {d.rows[1][i]}{marked.includes(String(i))&&<span><br/>{v===d.rows[1][i]?(es?'Coinciden':'Match'):(es?'Son distintos':'Different')}</span>}</button>)}</div>
  </>:<>
   <p>{es?'Prueba una pieza para el espacio vacío. Compárala con el patrón; todavía no estás enviando una respuesta.':'Try a piece in the empty space. Compare it with the pattern; this does not submit an answer.'}</p>
   <div className="learning-manipulatives">{item.options.map(o=><button type="button" key={o.id} aria-pressed={order[0]===o.id} onClick={()=>setOrder([o.id])}>{o.label[language]}</button>)}</div>
   <p>{item.visual[language].replace('?',item.options.find(o=>o.id===order[0])?.label[language]??'?')}</p>
  </>}
  <button type="button" onClick={()=>{setMarked([]);setOrder([]);}}>{es?'Limpiar la mesa':'Clear workspace'}</button>
 </section>;
}
