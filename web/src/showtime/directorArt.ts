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
const sceneUrls=import.meta.glob('../assets/art/story-*-1.webp',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const FAMILY:Record<string,string>={'star-stage':'star','robot-home':'castle',jungle:'rainbow',space:'moon','dinosaur-valley':'dino',castle:'castle'};
export type DirectorArt={cast:Map<string,HTMLCanvasElement>;scenes:Map<string,HTMLImageElement>};
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
 const cast=new Map<string,HTMLCanvasElement>(),backdrops=new Map<string,HTMLImageElement>();
 const results=await Promise.allSettled([
  ...characters.map(async c=>cast.set(c.key,await castArt(c,profession))),
  ...[...new Set(scenes)].map(async scene=>{const url=sceneUrls[`../assets/art/story-${FAMILY[scene]??'star'}-1.webp`];backdrops.set(scene,await localImage(url));})
 ]);
 if(results.some(r=>r.status==='rejected')){disposeDirectorArt({cast,scenes:backdrops});throw new Error('A movie asset did not load.');}
 return{cast,scenes:backdrops};
}
export function disposeDirectorArt(art:DirectorArt|null){art?.cast.forEach(c=>{c.width=c.height=1;});}
