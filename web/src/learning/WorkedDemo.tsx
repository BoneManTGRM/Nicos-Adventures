import { useState } from 'react';
import type { Band,Text } from './lessons';
import type { Language } from '../types';
const t=(en:string,es:string):Text=>({en,'es-MX':es});
type Step={visual:string;text:Text};
const steps:Record<Band,Step[][]>={
 gentle:[
  [{visual:'● ●',text:t('Start with two bolts.','Empieza con dos tornillos.')},{visual:'● ● + ●',text:t('One more bolt arrives.','Llega un tornillo más.')},{visual:'1 · 2 · 3',text:t('Count each bolt once. There are three.','Cuenta cada tornillo una vez. Hay tres.')}],
  [{visual:'● ● ● ●',text:t('Start with four batteries.','Empieza con cuatro baterías.')},{visual:'4 + 2',text:t('Add two more: count five, then six.','Agrega dos: cuenta cinco y luego seis.')},{visual:'4 + 2 = 6',text:t('Both groups together make six.','Los dos grupos juntos forman seis.')}],
  [{visual:'🔴 🔵',text:t('The block is red, blue.','El bloque es rojo, azul.')},{visual:'🔴 🔵 | 🔴 🔵',text:t('The same two-color block repeats.','Se repite el mismo bloque de dos colores.')},{visual:'🔴 🔵 | 🔴 🔵 | 🔴',text:t('Start the next block with red.','Empieza el siguiente bloque con rojo.')}],
  [{visual:'A → B',text:t('A must happen before B.','A debe ocurrir antes de B.')},{visual:'B → C',text:t('B must happen before C.','B debe ocurrir antes de C.')},{visual:'A → B → C',text:t('This order follows both rules.','Este orden cumple las dos reglas.')}],
  [{visual:'A B C\nA C C',text:t('Compare the required row with the program.','Compara la fila requerida con el programa.')},{visual:'B ≠ C',text:t('At step two, the symbols differ.','En el paso dos, los símbolos son distintos.')},{visual:'A → B → C',text:t('Replace the symbol at step two with B.','Cambia el símbolo del segundo paso por B.')}],
  [{visual:'● ●',text:t('Two passengers are aboard.','Hay dos pasajeros a bordo.')},{visual:'● ● + ● ● ●',text:t('Three more passengers board.','Suben tres pasajeros más.')},{visual:'2 + 3 = 5',text:t('Count both groups: five passengers.','Cuenta los dos grupos: cinco pasajeros.')}],
 ],
 challenge:[
  [{visual:'13 ↔ 11',text:t('Compare groups of thirteen and eleven.','Compara grupos de trece y once.')},{visual:'11 = 11',text:t('Pair eleven objects from each group.','Forma once parejas, con un objeto de cada grupo.')},{visual:'13 = 11 + 2',text:t('Two remain in the first group, so thirteen is greater.','Sobran dos en el primer grupo, así que trece es mayor.')}],
  [{visual:'7 + 6',text:t('Split six into three and three.','Separa seis en tres y tres.')},{visual:'7 + 3 = 10',text:t('Use the first three to reach ten.','Usa los primeros tres para llegar a diez.')},{visual:'10 + 3 = 13',text:t('Add the other three: thirteen.','Suma los otros tres: trece.')}],
  [{visual:'2 → 6 → 10 → 14',text:t('Compare neighboring numbers.','Compara números vecinos.')},{visual:'+4 · +4 · +4',text:t('Each jump adds four.','Cada salto suma cuatro.')},{visual:'14 + 4 = 18',text:t('One more equal jump reaches eighteen.','Otro salto igual llega a dieciocho.')}],
  [{visual:'D → A',text:t('Start with D, before A.','Empieza con D, antes de A.')},{visual:'D → A → B',text:t('A must come before B.','A debe ir antes de B.')},{visual:'D → A → B → C',text:t('B goes before C. All rules now fit.','B va antes de C. Ahora se cumplen todas las reglas.')}],
  [{visual:'D A B C\nD A A C',text:t('Compare the rows from left to right.','Compara las filas de izquierda a derecha.')},{visual:'B ≠ A',text:t('Steps one and two match; step three differs.','Los pasos uno y dos coinciden; el tercero es distinto.')},{visual:'D → A → B → C',text:t('Replace A with B at step three.','Cambia A por B en el paso tres.')}],
  [{visual:'18',text:t('There are eighteen seats.','Hay dieciocho asientos.')},{visual:'18 − 6',text:t('Six are occupied, so subtract six from the total of eighteen.','Seis están ocupados; resta seis del total de dieciocho.')},{visual:'18 − 6 = 12',text:t('Twelve seats remain free.','Quedan doce asientos libres.')}],
 ]
};
export function WorkedDemo({mission,band,language}:{mission:number;band:Band;language:Language}){
 const [step,setStep]=useState(0),es=language==='es-MX',demo=steps[band][mission][step];
 return <section className="learning-demo" aria-label={es?'Ejemplo paso a paso':'Step-by-step example'}>
  <p>{es?'Paso':'Step'} {step+1} / 3</p>
  <div className="learning-demo-visual">{demo.visual}</div>
  <p>{demo.text[language]}</p>
  <div className="learning-tools"><button type="button" disabled={step===0} onClick={()=>setStep(s=>s-1)}>{es?'Paso anterior':'Previous step'}</button><button type="button" disabled={step===2} onClick={()=>setStep(s=>s+1)}>{es?'Ver siguiente paso':'Show next step'}</button></div>
 </section>;
}
