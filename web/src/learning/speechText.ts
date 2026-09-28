import type { Language } from '../types';
// Only authored lesson text passes here. Keep visible and spoken content equivalent.
export function speechText(text:string,language:Language):string {
 const es=language==='es-MX';
 const symbols:Record<string,string>={'+':es?' más ':' plus ','−':es?' menos ':' minus ','=':es?' es igual a ':' equals ','→':es?' después ':' then ','●':es?' punto ':' dot ','○':es?' círculo ':' circle ','△':es?' triángulo ':' triangle ','□':es?' cuadrado ':' square ','◇':es?' rombo ':' diamond '};
 return text.replace(/(\d)\s*-\s*(?=\d)/g,(_,n:string)=>`${n}${es?' menos ':' minus '}`).replace(/[+−=→●○△□◇]/g,s=>symbols[s]).replace(/\s+/g,' ').trim();
}
