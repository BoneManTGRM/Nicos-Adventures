import pranceUrl from '../assets/art/unicorn-prance-v2.webp';
import floatUrl from '../assets/art/unicorn-float-v2.webp';
import turnUrl from '../assets/art/unicorn-turn-v2.webp';
import restUrl from '../assets/art/unicorn-rest-v2.webp';

/** The same approved artwork used by BeccaCorner, not a second character design. */
export const UNICORN_ART = { prance: pranceUrl, float: floatUrl, turn: turnUrl, rest: restUrl } as const;
export type UnicornPose = keyof typeof UNICORN_ART;
type ImageLoader = (url: string) => Promise<HTMLImageElement>;
let images: Partial<Record<UnicornPose, HTMLImageElement>> = {};
let pending: Promise<void> | null = null;
const tinted = new Map<string, HTMLCanvasElement>();

function browserImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => image.naturalWidth ? resolve(image) : reject(new Error('Empty unicorn image'));
    image.onerror = () => reject(new Error('Unicorn artwork could not be loaded'));
    image.src = url;
  });
}
export function unicornArtReady(): boolean {
  return Object.keys(UNICORN_ART).every(pose => !!images[pose as UnicornPose]);
}
export function loadUnicornArt(loader: ImageLoader = browserImage): Promise<void> {
  if (unicornArtReady()) return Promise.resolve();
  if (pending) return pending;
  pending = Promise.all(Object.entries(UNICORN_ART).map(async ([pose, url]) => [pose, await loader(url)] as const))
    .then(loaded => { images = Object.fromEntries(loaded); })
    .catch(error => { pending = null; throw error; });
  return pending;
}

/** Cache palette changes once, rather than relying on Canvas filter support or
 * repeatedly processing pixels. Low-saturation coat pixels retain their shading. */
function sprite(pose: UnicornPose, color: number): CanvasImageSource | null {
  const image = images[pose];
  if (!image) return null;
  const palette = Math.max(0, Math.min(3, Math.floor(color)));
  if (!palette || typeof document === 'undefined') return image;
  const key = `${pose}:${palette}`;
  const cached = tinted.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return image;
  context.drawImage(image, 0, 0, 512, 512);
  const pixels = context.getImageData(0, 0, 512, 512);
  const hue = (p: number, q: number, raw: number) => {
    const t = (raw + 1) % 1;
    return t < 1/6 ? p+(q-p)*6*t : t < 1/2 ? q : t < 2/3 ? p+(q-p)*(2/3-t)*6 : p;
  };
  for (let i = 0; i < pixels.data.length; i += 4) {
    const d = pixels.data;
    if (d[i+3] < 8) continue;
    const r=d[i]/255, g=d[i+1]/255, b=d[i+2]/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b), range=max-min, light=(max+min)/2;
    // Keep the coat, eye highlights, and yellow/gold horn unchanged.
    if (range < .12 || (r > b*1.3 && g > b*1.2 && r > g*.9) || (light>.62 && r>g && r>b && range<.34)) continue;
    let h = max===r ? (g-b)/range+(g<b?6:0) : max===g ? (b-r)/range+2 : (r-g)/range+4;
    h = ((h/6) % 1 + 1) % 1;
    if (palette===1) h = .40 + h*.12;
    if (palette===2) h = (.87 + h*.16)%1;
    if (palette===3) h = .10 + h*.05;
    const saturation=range/(1-Math.abs(2*light-1));
    const q=light<.5 ? light*(1+saturation) : light+saturation-light*saturation, p=2*light-q;
    d[i]=Math.round(hue(p,q,h+1/3)*255); d[i+1]=Math.round(hue(p,q,h)*255); d[i+2]=Math.round(hue(p,q,h-1/3)*255);
  }
  context.putImageData(pixels, 0, 0);
  tinted.set(key, canvas);
  return canvas;
}

// All source poses share an 820-square canvas and the ground baseline y=760.
// A fixed shared scale prevents the character changing size between poses.
export const UNICORN_FRAME = { sourceSize: 820, feetY: 760, centerX: 410, drawSize: 156 } as const;
const sourceFacing: Record<UnicornPose, number> = { prance: -1, float: 1, turn: 1, rest: -1 };
export function drawUnicornSprite(
  c: CanvasRenderingContext2D, x: number, y: number, t=0, color=0,
  direction=1, pose: UnicornPose='turn', reduced=false,
): boolean {
  const image=sprite(pose,color);
  if (!image) return false;
  const size=UNICORN_FRAME.drawSize, scale=size/UNICORN_FRAME.sourceSize;
  const bounce=pose==='prance'&&!reduced ? Math.sin(t*9)*1.5 : 0;
  c.save(); c.translate(x,y+bounce); c.scale((direction<0?-1:1)*sourceFacing[pose],1);
  c.imageSmoothingEnabled=true; c.imageSmoothingQuality='high';
  c.drawImage(image,-UNICORN_FRAME.centerX*scale,-UNICORN_FRAME.feetY*scale,size,size);
  c.restore();
  return true;
}

type MotionSample = { x:number; t:number; direction:number; moving:boolean };
const samples = new WeakMap<object, MotionSample>();
/** Render-only observation: never writes movement, reward, or saved profile state. */
export function unicornMotion(ride: {x:number;t:number;grounded:boolean;completed:boolean}) {
  const old=samples.get(ride);
  const delta=old ? ride.x-old.x : 0;
  const advanced=!old||ride.t!==old.t;
  const direction=Math.abs(delta)>.1 ? (delta<0?-1:1) : old?.direction??1;
  const moving=advanced ? Math.abs(delta)>.1 : old?.moving??false;
  if (advanced) samples.set(ride,{x:ride.x,t:ride.t,direction,moving});
  const pose:UnicornPose=ride.completed?'rest':!ride.grounded?'float':moving?'prance':'turn';
  return {direction,pose};
}
