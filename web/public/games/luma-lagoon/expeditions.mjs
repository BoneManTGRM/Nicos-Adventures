import { care } from './pet.mjs';

export const destinations = [
  {
    name: ['Lily Run', 'Ruta de los lirios'], game: ['Berry Drift', 'Bayas a la deriva'],
    mission: ['Swim between the lily pads to catch five drifting berries.', 'Nada entre los lirios para atrapar cinco bayas flotantes.'],
    threshold: 0, art: 'lilies.webp', color: '#a4e1ac',
    relics: [
      ['☘', 'Painted clover', 'Trébol pintado', 'Each leaf points to a different lily pad.', 'Cada hoja señala un lirio distinto.'],
      ['✿', 'Sunrise lotus', 'Loto del alba', 'Its petals open as your axolotl swims past.', 'Sus pétalos se abren cuando pasa tu ajolote.'],
      ['✧', 'Dewdrop lens', 'Lente de rocío', 'Look through it to see a rainbow in every ripple.', 'Al mirar a través de él, cada ola tiene un arcoíris.'],
    ],
  },
  {
    name: ['Echo Grotto', 'Gruta del Eco'], game: ['Crystal Choir', 'Coro de cristales'],
    mission: ['Watch the crystals sing, then play their melody back.', 'Observa el canto de los cristales y repite su melodía.'],
    threshold: 0, art: 'grotto.webp', color:'#c8a1ff',
    relics: [
      ['♦','Humming crystal','Cristal cantor','Hold it near water and it hums the first note.','Junto al agua tararea la primera nota.'],
      ['♫','Echo shell','Concha de ecos','Two little echoes inside are always singing a duet.','Dos ecos diminutos cantan a dúo en su interior.'],
      ['❖','Violet prism','Prisma violeta','One beam enters. A whole choir of colors comes out.','Entra un rayo de luz y sale un coro de colores.'],
    ],
  },
  {
    name:['Sunken Cenote','Cenote Sumergido'], game:['Pearl Pairs','Pares de perlas'],
    mission:['Lift the shells and match all three hidden pairs.', 'Levanta las conchas y encuentra los tres pares.'],
    threshold:1, art:'cenote.webp',color:'#73dce2',
    relics:[
      ['◉','Moon pearl','Perla lunar','It glows even on nights when the moon is hiding.','Brilla hasta en las noches sin luna.'],
      ['❧','Jade feather','Pluma de jade','A stone feather so light it floats on the water.','Una pluma de piedra tan ligera que flota.'],
      ['☀','Sunstone','Piedra solar','It keeps a little of the afternoon sun under the water.','Guarda un poco del sol de la tarde bajo el agua.'],
    ],
  },
  {
    name:['Starfall Summit','Cima Estelar'],game:['Starlight Circuit','Camino estelar'],
    mission:['Turn the sky tiles to carry moonlight all the way to the star.', 'Gira las piezas del cielo para llevar la luz de luna hasta la estrella.'],
    threshold:3,art:'summit.webp',color:'#ffcf91',
    relics:[
      ['☽','Moon compass','Brújula lunar','The needle always points to the lagoon.','La aguja siempre apunta hacia la laguna.'],
      ['✶','Comet ember','Brasa de cometa','A fallen star that feels warm in a tiny paw.','Una estrella caída que calienta la patita.'],
      ['✵','Aurora pearl','Perla de aurora','A whole northern sky is tucked inside this pearl.','Un cielo de auroras cabe dentro de esta perla.'],
    ],
  },
];
export const outfits = [
  {name:['Just me','Así soy'],cost:0,icon:'♡'},
  {name:['Daisy','Margarita'],cost:4,icon:'✿'},
  {name:['Captain’s cap','Gorra de capitán'],cost:7,icon:'⚓'},
  {name:['Star crown','Corona estelar'],cost:10,icon:'♛'},
  {name:['Explorer goggles','Gogles de explorador'],cost:12,icon:'◎'},
];
export const wishes = [
  ['love','Give me a little head rub.','¿Me acaricias la cabecita?'],
  ['feed','Can I have a moon berry?','¿Me das una baya lunar?'],
  ['fireflies','Catch five fireflies with me!','¡Atrapemos cinco luciérnagas!'],
  ['wash','Let’s make some bubbles!','¡Hagamos burbujas!'],
  ['trip','Take me on an expedition.','Llévame de expedición.'],
  ['nap','Tuck me in for a little nap.','Arrópame para una siestecita.'],
];
export function grantWish(pet,action){
  const j=journey(pet);
  if(wishes[j.wishes % wishes.length][0]!==action) return null;
  return {...pet,journey:{...j,wishes:Math.min(j.wishes+1,999999),pearls:Math.min(j.pearls+2,99999)}};
}
const integer = (value, maximum) => Number.isFinite(value) ? Math.max(0,Math.min(maximum,Math.floor(value))) : 0;
export function journey(pet) {
  const j = pet?.journey || {};
  const wins = destinations.map((_,i)=>integer(j.wins?.[i],9999));
  const owned = integer(j.owned,31) | 1;
  const wear = integer(j.wear,4), home = integer(j.home,4);
  return {wins, wishes:integer(j.wishes,999999), pearls:integer(j.pearls,99999), owned, wear:owned & (1 << wear) ? wear : 0,
    home:home && wins[home-1] > 0 ? home : 0};
}
export function discoveries(j) { return j.wins.reduce((sum,n)=>sum+Math.min(3,n),0); }
export function canVisit(j,route) {
  return Number.isInteger(route) && !!destinations[route] && discoveries(j) >= destinations[route].threshold;
}
export function completeTrip(pet,route,now) {
  const j=journey(pet);
  if(!canVisit(j,route)) return null;
  const reward=care(pet,'play',now);
  if(reward.note==='asleep') return null;
  const next={...j,wins:[...j.wins],pearls:Math.min(99999,j.pearls+4)};
  next.wins[route]=Math.min(9999,next.wins[route]+1);
  return {...reward.pet,journey:next};
}
export function dress(pet,id) {
  const j=journey(pet);
  if(!Number.isInteger(id)||!outfits[id]) return null;
  const owned=Boolean(j.owned & (1 << id));
  if(!owned && j.pearls<outfits[id].cost) return null;
  return {...pet,journey:{...j,pearls:j.pearls-(owned?0:outfits[id].cost),owned:j.owned|(1<<id),wear:id}};
}
export function moveHome(pet,n) {
  const j=journey(pet);
  if(!Number.isInteger(n)||n<0||n>4||(n && !j.wins[n-1])) return null;
  return {...pet,journey:{...j,home:n}};
}
export function shuffle(items,random=Math.random) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

// Six rotatable elbows on a two-by-three board. Direction 0 points north.
export const solvedCircuit=[2,1,2,0,3,0];
export const ports=rotation=>[rotation,(rotation+1)%4];
export function traceCircuit(turns) {
  let cell=0, entered=3;
  const lit=[];
  while(!lit.includes(cell)) {
    const ends=ports(turns[cell]);
    if(!ends.includes(entered))break;
    lit.push(cell);
    const exit=ends.find(dir=>dir!==entered);
    if(cell===5 && exit===1)return {lit,complete:true};
    const x=cell%3+[0,1,0,-1][exit], y=Math.floor(cell/3)+[-1,0,1,0][exit];
    if(x<0||x>2||y<0||y>1)break;
    cell=y*3+x; entered=(exit+2)%4;
  }
  return {lit,complete:false};
}
