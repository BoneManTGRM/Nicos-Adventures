import type {Language} from '../types';
export const kingdoms = ['cloud','dragon','fox'] as const;
export const friends = [
 ['Cirrus','Cirrus'],['Wisp','Brisa'],['Peaches','Duraznito'],
 ['Jade','Jade'],['Ember','Chispa'],['Plum','Ciruela'],
 ['Luna','Luna'],['Comet','Cometa'],['Aurora','Aurora'],
];
export const songs = [
 ['Cloud Waltz','Vals de las nubes'],['Blossom Bells','Campanas en flor'],['Moonlit Lullaby','Arrullo lunar'],
];
export function localName(pair:string[],language:Language){return pair[language==='es-MX'?1:0];}
export const bells = [185,805,1720];
export function nearbyBell(x:number,y:number) {
 return bells.findIndex(bell=>Math.abs(x-bell)<95 && Math.abs(y-300)<145);
}
// Each flower plays a phrase. Their three phrases form the garden's song.
const melodies=[
 [[72,76,79],[81,79,76],[74,71,72]],
 [[69,72,76],[79,76,74],[72,67,69]],
 [[74,77,81],[84,81,77],[76,72,74]],
];
export class GardenChimes {
 private context?:AudioContext;
 private next=0;
 play(island:number,phrase:number|null) {
  try {
   this.context??=new AudioContext();const ctx=this.context;
   void ctx.resume().then(()=>{
    if(this.context!==ctx||ctx.currentTime<this.next)return;
    this.next=ctx.currentTime+(phrase===null?1.85:.45);
    const notes=phrase===null?melodies[island].flat():melodies[island][phrase];
    notes.forEach((note,i)=>{
     const oscillator=ctx.createOscillator(),volume=ctx.createGain(),start=ctx.currentTime+.015+i*.21;
     oscillator.type='sine';oscillator.frequency.value=440*2**((note-69)/12);
     volume.gain.setValueAtTime(.0001,start);volume.gain.exponentialRampToValueAtTime(.105,start+.014);
     volume.gain.exponentialRampToValueAtTime(.0001,start+.54);
     oscillator.connect(volume);volume.connect(ctx.destination);
     oscillator.onended=()=>{oscillator.disconnect();volume.disconnect();};oscillator.start(start);oscillator.stop(start+.56);
    });
   }).catch(()=>{});
  }catch{/* Visual notes remain available on devices without audio. */}
 }
 close(){if(this.context)void this.context.close().catch(()=>{});this.context=undefined;this.next=0;}
}
