const files = import.meta.glob<string>('../assets/art/garage/garage-*.webp', {
  eager: true, query: '?url', import: 'default',
});
export const routeArtwork = ['meadow', 'dunes', 'crystal'];
export const garageArtUrl = (name: string) => files[`../assets/art/garage/garage-${name}.webp`];
type Artwork = { image: HTMLImageElement; ready: Promise<void> };
const images = new Map<string, Artwork>();

function load(name: string) {
  const cached = images.get(name);
  if (cached) return cached;
  const url = garageArtUrl(name);
  if (!url || typeof Image === 'undefined') return undefined;
  const image = new Image();
  const ready = new Promise<void>(resolve => { image.onload = () => resolve(); image.onerror = () => resolve(); });
  image.decoding = 'async';
  image.src = url;
  const entry = {image, ready};
  images.set(name, entry);
  return entry;
}
export function artImage(name: string) {
  const image = load(name)?.image;
  return image?.complete && image.naturalWidth ? image : undefined;
}

// Each source sheet uses a regular grid. The same part is sampled in the shop,
// on the assembled truck, and again if it breaks off during a drive.
const groups = ['mechanics','wheels','mechanics','running','running','gear','gear','bodies','trim','trim'];
function sheetName(group: number, paint: number) {
  return group === 7 ? 'bodies-' + paint : groups[group];
}
export function waitForPart(id: number, paint = 0) {
  return load(sheetName(Math.floor((id-1)/10),paint))?.ready;
}
type C = CanvasRenderingContext2D;
function tile(c: C, sheet: string, cols: number, rows: number, index: number, x: number, y: number, w: number, h: number) {
  const image = artImage(sheet);
  if (!image) return false;
  const sw = image.naturalWidth / cols, sh = image.naturalHeight / rows;
  c.drawImage(image, (index%cols)*sw, Math.floor(index/cols)*sh, sw, sh, x, y, w, h);
  return true;
}
export function illustratedPart(c: C, id: number, paint: number, x: number, y: number, w: number, h: number) {
  const group = Math.floor((id-1)/10), variant=(id-1)%10;
  if (group === 7) return tile(c,sheetName(group,paint),2,5,variant,x,y,w,h);
  if (group === 1) return tile(c,'wheels',5,3,variant,x,y,w,h);
  const bottom = group === 2 || group === 4 || group === 6 || group === 9;
  return tile(c,sheetName(group,paint),5,4,variant+(bottom?10:0),x,y,w,h);
}
export function illustratedDriver(c: C, id: number, x: number, y: number, w: number, h: number) {
  return tile(c,'wheels',5,3,10+id,x,y,w,h);
}
export function drawRouteVista(c: C, track: number, width: number, height: number, camera: number, elevation: number) {
  const image=artImage(routeArtwork[track]);
  if (!image) return false;
  const scale=Math.max(width/image.width,height*1.14/image.height);
  const w=image.width*scale, h=image.height*scale;
  const top=Math.min(0,Math.max(height-h,(height-h)*.48-elevation*.06));
  const offset=camera*.18, first=Math.floor(offset/w);
  // A mirrored second tile carries the distant view continuously across each seam.
  for(let i=first;i<=Math.floor((offset+width)/w);i++) {
    const left=i*w-offset, mirrored=(i%2)!==0;
    c.save();c.translate(left+(mirrored?w:0),top);c.scale(mirrored?-1:1,1);
    c.drawImage(image,0,0,w+.5,h);c.restore();
  }
  return true;
}

const roadPatterns = new WeakMap<C, Map<number, CanvasPattern>>();
export function roadTexture(c: C, track: number) {
  let textures = roadPatterns.get(c);
  if (!textures) { textures = new Map(); roadPatterns.set(c, textures); }
  const cached = textures.get(track);
  if (cached) return cached;
  const image = artImage('soil-' + routeArtwork[track]);
  if (!image) return undefined;
  const pattern = c.createPattern(image, 'repeat');
  if (!pattern) return undefined;
  pattern.setTransform(new DOMMatrix().scale(.72));
  textures.set(track, pattern);
  return pattern;
}
