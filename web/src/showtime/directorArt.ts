import type { NicoProfessionId } from '../types';
import type { RenderableMovieCharacter } from './movieRenderer';
import { composeNicoImage } from './composeNicoImage';
import { drawWildlifeCell,loadPremiumWildlifeAtlas } from '../world/wildlifeAtlas';
import { monsterBodyArtStyle } from '../world/monsterArt';
import becca from '../assets/art/becca-premium-v2.webp';
import lua from '../assets/art/lua-premium-v2.webp';
import boltbot from '../assets/boltbot/boltbot-premium-poses-atlas.webp';
import sparky from '../assets/pets/sparky-idle-v2.webp';
import { PetArt } from '../world/PetArt';
import { createElement } from 'react';
import { monsterColorSwatch } from '../world/monsterCreatureStudio';
import habitatSource from '../assets/habitats/animal-forest-premium-habitats-atlas.webp';
import { bakeRoom } from '../game/friendsMap/interiorRenderer';
export type DirectorArt={cast:Map<string,HTMLCanvasElement>;scenes:Map<string,HTMLCanvasElement>};
export async function localImage(source:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const art=new Image(),timer=window.setTimeout(()=>{art.onload=art.onerror=null;reject(new Error('Artwork timed out.'));},12000);art.onload=()=>{clearTimeout(timer);resolve(art);};art.onerror=()=>{clearTimeout(timer);reject(new Error('Artwork could not load.'));};art.src=source;});}
export function trimArt(source:CanvasImageSource,w:number,h:number,cap=360):HTMLCanvasElement{const scan=document.createElement('canvas');scan.width=w;scan.height=h;const c=scan.getContext('2d',{willReadFrequently:true})!;c.drawImage(source,0,0,w,h);const a=c.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=0,y1=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(a[(y*w+x)*4+3]>12){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}if(x0>x1)throw new Error('Empty character artwork.');const out=document.createElement('canvas'),height=Math.min(cap,y1-y0+1);out.width=Math.ceil((x1-x0+1)*height/(y1-y0+1));out.height=height;out.getContext('2d')!.drawImage(scan,x0,y0,x1-x0+1,y1-y0+1,0,0,out.width,out.height);scan.width=scan.height=1;return out;}
async function castArt(ch:RenderableMovieCharacter,profession:NicoProfessionId):Promise<HTMLCanvasElement>{
 if(ch.kind==='animal'&&ch.animal){const atlas=await loadPremiumWildlifeAtlas(),c=document.createElement('canvas');c.width=c.height=320;drawWildlifeCell(c.getContext('2d')!,atlas,ch.animal.id,0,0,320);const out=trimArt(c,320,320);c.width=c.height=1;return out;}
 let image:HTMLImageElement;
 if(ch.kind==='nico')image=await composeNicoImage(profession);
 else if(ch.kind==='friend')image=await localImage(ch.id==='lua'?lua:becca);
 else if(ch.kind==='robot'){image=await localImage(boltbot);const c=document.createElement('canvas');c.width=image.naturalWidth/4;c.height=image.naturalHeight/2;c.getContext('2d')!.drawImage(image,0,0,c.width,c.height,0,0,c.width,c.height);const out=trimArt(c,c.width,c.height);c.width=c.height=1;return out;}
 else if(ch.kind==='monster'&&ch.monster){const style=monsterBodyArtStyle(ch.monster.body,monsterColorSwatch(ch.monster.color),ch.monster.arms),raw=String(style['--monster-body-image' as keyof typeof style]);image=await localImage(raw.replace(/^url\(["']?|["']?\)$/g,''));}
 else if(ch.pet?.species==='Robot Dog')image=await localImage(sparky);
 else if(ch.pet){const {renderToStaticMarkup}=await import('react-dom/server');const html=renderToStaticMarkup(createElement(PetArt,{pet:ch.pet,language:'en'})),svg=html.match(/<svg[\s\S]*?<\/svg>/)?.[0];if(!svg)throw new Error('Pet artwork missing.');const url=URL.createObjectURL(new Blob([svg.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"')],{type:'image/svg+xml'}));try{image=await localImage(url);}finally{URL.revokeObjectURL(url);}}
 else throw new Error('Character is unavailable.');
 return trimArt(image,image.naturalWidth,image.naturalHeight);
}
export async function loadDirectorArt(characters:RenderableMovieCharacter[],profession:NicoProfessionId,scenes:string[]):Promise<DirectorArt>{
 const cast=new Map<string,HTMLCanvasElement>(),backdrops=new Map<string,HTMLCanvasElement>();
 const habitats=scenes.some(s=>s==='jungle'||s==='dinosaur-valley')?localImage(habitatSource):null;
 const results=await Promise.allSettled([
  ...characters.map(async c=>cast.set(c.key,await castArt(c,profession))),
  ...[...new Set(scenes)].map(async scene=>backdrops.set(scene,await backdrop(scene,habitats)))
 ]);
 if(results.some(r=>r.status==='rejected')){disposeDirectorArt({cast,scenes:backdrops});throw new Error('A movie asset did not load.');}
 return{cast,scenes:backdrops};
}
export function disposeDirectorArt(art:DirectorArt|null){art?.cast.forEach(c=>{c.width=c.height=1;});art?.scenes.forEach(c=>{c.width=c.height=1;});}

/** Character-free scenery, baked once. Story pages contain painted people and
 * must not become movie backdrops behind an independently chosen cast. */
async function backdrop(scene:string,habitats:Promise<HTMLImageElement>|null):Promise<HTMLCanvasElement>{
 if(scene==='robot-home'||scene==='castle')return bakeRoom(scene==='robot-home'?'workshop':'castle');
 const art=document.createElement('canvas');art.width=960;art.height=540;const c=art.getContext('2d')!;
 if((scene==='jungle'||scene==='dinosaur-valley')&&habitats){const image=await habitats;const w=image.naturalWidth/3,h=image.naturalHeight/3;const x=scene==='jungle'?0:1;c.drawImage(image,x*w+3,3,w-6,h-6,0,0,960,540);return art;}
 const sky=c.createLinearGradient(0,0,0,540);sky.addColorStop(0,scene==='space'?'#101631':'#161538');sky.addColorStop(1,scene==='space'?'#2e4267':'#405274');c.fillStyle=sky;c.fillRect(0,0,960,540);
 for(let i=0;i<82;i++){const x=(i*149+41)%960,y=(i*71+23)%410;c.fillStyle=i%5?'#d7edf3':'#ffd791';c.beginPath();c.arc(x,y,i%7===0?2:1,0,Math.PI*2);c.fill();}
 if(scene==='space'){const glow=c.createRadialGradient(770,135,18,770,135,90);glow.addColorStop(0,'#88b8b8');glow.addColorStop(1,'#35557b');c.fillStyle=glow;c.beginPath();c.arc(770,135,78,0,Math.PI*2);c.fill();c.strokeStyle='#a3c7d17a';c.lineWidth=5;c.beginPath();c.ellipse(770,135,112,22,-.28,0,Math.PI*2);c.stroke();c.fillStyle='#111f3b';c.beginPath();c.moveTo(0,440);c.quadraticCurveTo(380,370,960,455);c.lineTo(960,540);c.lineTo(0,540);c.fill();}
 else{for(const x of [0,850]){const curtain=c.createLinearGradient(x,0,x+110,0);curtain.addColorStop(0,'#463466');curtain.addColorStop(.5,'#80528c');curtain.addColorStop(1,'#392e59');c.fillStyle=curtain;c.fillRect(x,0,110,540);}c.fillStyle='#a9956b';c.fillRect(100,25,760,8);c.fillStyle='#d0bd86';for(let x=155;x<850;x+=130){c.beginPath();c.moveTo(x,31);c.lineTo(x+30,31);c.lineTo(x+23,48);c.lineTo(x+7,48);c.fill();}c.fillStyle='#88765e';c.fillRect(110,425,740,115);for(let y=440;y<540;y+=23){c.strokeStyle='#453e53';c.beginPath();c.moveTo(110,y);c.lineTo(850,y);c.stroke();}}
 return art;
}
