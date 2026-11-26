import {kingdoms} from './kingdomDiscoveries';
const files=import.meta.glob<string>('../assets/art/kingdom/kingdom-*.webp',{eager:true,query:'?url',import:'default'});
export const kingdomArtUrl=(name:string)=>files['../assets/art/kingdom/kingdom-'+name+'.webp'];
const images=new Map<string,{image:HTMLImageElement;ready:Promise<void>}>();
function get(name:string){
 const cached=images.get(name);if(cached)return cached;
 const url=kingdomArtUrl(name);if(!url||typeof Image==='undefined')return;
 const image=new Image(),ready=new Promise<void>(resolve=>{image.onload=()=>resolve();image.onerror=()=>resolve();});
 image.decoding='async';image.src=url;const entry={image,ready};images.set(name,entry);return entry;
}
export const waitForKingdomArt=(name:string)=>get(name)?.ready;
function art(name:string){const image=get(name)?.image;return image?.complete&&image.naturalWidth?image:undefined;}
type C=CanvasRenderingContext2D;
export function drawTile(c:C,name:string,cols:number,rows:number,cell:number,x:number,y:number,w:number,h:number){
 const image=art(name);if(!image)return false;
 const sw=image.width/cols,sh=image.height/rows;c.drawImage(image,cell%cols*sw,Math.floor(cell/cols)*sh,sw,sh,x,y,w,h);return true;
}
export function gardenVista(c:C,island:number,w:number,h:number,camera:number){
 const image=art(kingdoms[island]);if(!image)return false;
 const scale=Math.max(h/image.height,w/image.width),width=image.width*scale,height=image.height*scale;
 const offset=(camera*.2+width*.16)%width;
 c.drawImage(image,-offset,(h-height)*.48,width+.5,height);
 c.save();c.translate(2*width-offset,0);c.scale(-1,1);c.drawImage(image,0,(h-height)*.48,width+.5,height);c.restore();
 return true;
}
