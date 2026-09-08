import {loadCanonicalNicoImage} from './canonicalNicoArt';
import type {NicoProfessionId} from '../types';
import {BACKDROP_COLORS} from './closet';
export async function saveOutfitPortrait(profession:NicoProfessionId,name:string,backdrop:keyof typeof BACKDROP_COLORS){
 const image=await loadCanonicalNicoImage(profession),canvas=document.createElement('canvas');canvas.width=720;canvas.height=960;const c=canvas.getContext('2d');if(!c)throw new Error('Canvas unavailable');
 const colors=BACKDROP_COLORS[backdrop],g=c.createLinearGradient(0,0,0,960);g.addColorStop(0,colors[0]);g.addColorStop(1,colors[1]);c.fillStyle=g;c.fillRect(0,0,720,960);c.strokeStyle='#f6e7b8';c.lineWidth=4;c.strokeRect(26,26,668,908);
 const scale=Math.min(600/image.naturalWidth,740/image.naturalHeight);c.drawImage(image,(720-image.naturalWidth*scale)/2,100,image.naturalWidth*scale,image.naturalHeight*scale);
 c.fillStyle='#15243c';c.fillRect(54,840,612,76);c.fillStyle='#fff0c6';c.textAlign='center';c.font='700 30px system-ui';c.fillText(`${name} Nico`,360,885,570);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Portrait unavailable')),'image/png'));
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`nico-${profession}-portrait.png`;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30000);canvas.width=canvas.height=1;
}
