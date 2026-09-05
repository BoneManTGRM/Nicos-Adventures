import mapSource from '../../assets/world/nicos-world-map-restored-1672.webp';
import beccaSource from '../../assets/art/becca-premium-v2.webp';
import luaSource from '../../assets/art/lua-premium-v2.webp';
import boltSource from '../../assets/boltbot/boltbot-premium-poses-atlas.webp';
import sparkySource from '../../assets/pets/sparky-idle-v2.webp';
import { loadCanonicalNicoImage } from '../../nico/canonicalNicoArt';
import type { NicoProfessionId } from '../../types';
import { companionPositions, MAP_HEIGHT, MAP_WIDTH, STOPS, TOKENS } from './simulation';
import type { Friend, MapState, Viewport } from './simulation';
export const FRIEND_NAMES: Record<Friend, string> = { nico: 'Nico', becca: 'Becca', lua: 'Lua', boltbot: 'BoltBot', sparky: 'Sparky' };
export type MapAssets = { map: HTMLImageElement; sprites: Record<Friend, HTMLCanvasElement> };
function image(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const art = new Image(), timer = window.setTimeout(() => fail(), 15000);
    function fail() { clearTimeout(timer); art.onload = art.onerror = null; reject(new Error('Map artwork could not load.')); }
    art.onload = () => { clearTimeout(timer); art.onload = art.onerror = null; resolve(art); };
    art.onerror = fail; art.src = src;
  });
}
/** Trim alpha bounds once, then retain only game-sized sprites. Do not key out white. */
function sprite(art: HTMLImageElement, height: number, atlas = false): HTMLCanvasElement {
  const src = document.createElement('canvas');
  src.width = atlas ? art.naturalWidth / 4 : art.naturalWidth;
  src.height = atlas ? art.naturalHeight / 2 : art.naturalHeight;
  const ctx = src.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D is unavailable.');
  ctx.drawImage(art, 0, 0, src.width, src.height, 0, 0, src.width, src.height);
  const data = ctx.getImageData(0, 0, src.width, src.height).data;
  let minX = src.width, minY = src.height, maxX = 0, maxY = 0;
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) if (data[(y * src.width + x) * 4 + 3] > 15) {
    minX = Math.min(x, minX); minY = Math.min(y, minY); maxX = Math.max(x, maxX); maxY = Math.max(y, maxY);
  }
  if (minX > maxX) throw new Error('Character artwork is empty.');
  const out = document.createElement('canvas'), w = maxX - minX + 1, h = maxY - minY + 1;
  out.width = Math.max(1, Math.ceil(height * w / h)); out.height = height;
  out.getContext('2d')!.drawImage(src, minX, minY, w, h, 0, 0, out.width, out.height);
  src.width = src.height = 1;
  return out;
}
export async function loadMapAssets(profession: NicoProfessionId): Promise<MapAssets> {
  const [map, nico, becca, lua, boltbot, sparky] = await Promise.all([image(mapSource), loadCanonicalNicoImage(profession), image(beccaSource), image(luaSource), image(boltSource), image(sparkySource)]);
  return { map, sprites: { nico: sprite(nico, 88), becca: sprite(becca, 86), lua: sprite(lua, 76), boltbot: sprite(boltbot, 91, true), sparky: sprite(sparky, 51) } };
}
function disc(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function star(c: CanvasRenderingContext2D, x: number, y: number, size: number) {
  c.beginPath(); for (let i = 0; i < 10; i++) { const angle = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? size * .45 : size; c.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r); }
  c.closePath(); c.fillStyle = '#ffe697'; c.fill(); c.strokeStyle = '#986517'; c.lineWidth = 1.5; c.stroke();
}
function activityArt(c: CanvasRenderingContext2D, id: string, x: number, y: number, phase: number) {
  c.save(); c.translate(x, y - 60);
  if (id === 'castle') {
    ['#ffacb7', '#ffe6a1', '#a7efd0', '#acd5ff'].forEach((color, i) => { c.strokeStyle = color; c.lineWidth = 6; c.beginPath(); c.arc(0, 2, 32 - i * 6, Math.PI, 0); c.stroke(); });
  } else if (id === 'garden') {
    for (let i = -1; i < 2; i++) { c.fillStyle = '#529158'; c.fillRect(i * 22, 4, 3, 20); for (let j = 0; j < 5; j++) disc(c, i * 22 + Math.cos(j * 1.256) * 7, Math.sin(j * 1.256) * 7, 5, i % 2 ? '#ffbac5' : '#c4b2f2'); disc(c, i * 22, 0, 4, '#ffe9a5'); }
  } else if (id === 'workshop') {
    c.fillStyle = '#483943'; c.fillRect(-12, -24, 24, 33); c.fillStyle = '#ffeaaa'; c.fillRect(-8, -19, 16, 21); c.strokeStyle = '#f0c671'; c.lineWidth = 3; c.strokeRect(-12, -24, 24, 33);
  } else if (id === 'treehouse') {
    for (let i = 0; i < 3; i++) { disc(c, i * 16 - 16, i % 2 * 12, 5, '#fbe7b2'); for (let j = 0; j < 3; j++) disc(c, i * 16 - 22 + j * 5, i % 2 * 12 - 8, 2, '#fbe7b2'); }
  } else star(c, 0, -8, 23);
  if (phase > 0) for (let i = 0; i < 5; i++) star(c, Math.cos(i * 1.256 + phase) * 40, Math.sin(i * 1.256 + phase) * 30, 4);
  c.restore();
}
export function drawMap(c: CanvasRenderingContext2D, assets: MapAssets, s: MapState, view: Viewport): void {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#143b49'; c.fillRect(0, 0, view.width, view.height);
  c.setTransform(view.scale, 0, 0, view.scale, -view.x * view.scale, -view.y * view.scale);
  c.drawImage(assets.map, 0, 0, MAP_WIDTH, MAP_HEIGHT);
  for (const token of TOKENS) if (!s.collected.includes(token.id)) star(c, token.x, token.y, 12);
  STOPS.forEach((stop, i) => {
    if (s.completed.includes(stop.id) || s.action?.id === stop.id) activityArt(c, stop.id, stop.x, stop.y, s.action?.id === stop.id ? s.action.elapsed : 0);
    disc(c, stop.x, stop.y, 18, '#123642'); c.strokeStyle = s.completed.includes(stop.id) ? '#8be6b4' : '#ffe5a4'; c.lineWidth = 2.5; c.stroke();
    c.fillStyle = '#fff3cd'; c.font = 'bold 17px system-ui'; c.textAlign = 'center'; c.fillText(s.completed.includes(stop.id) ? '✓' : String(i + 1), stop.x, stop.y + 6);
  });
  const target = s.path.at(-1);
  if (target) { c.strokeStyle = '#fff8d3'; c.lineWidth = 2; c.beginPath(); c.ellipse(target.x, target.y, 14, 6, 0, 0, Math.PI * 2); c.stroke(); }
  for (const actor of companionPositions(s).sort((a, b) => a.y - b.y)) {
    const art = assets.sprites[actor.friend], x = Math.round(actor.x), y = Math.round(actor.y);
    c.fillStyle = '#112b4270'; c.beginPath(); c.ellipse(x, y, art.width * .35, 5, 0, 0, Math.PI * 2); c.fill();
    if (actor.friend === s.leader) { c.strokeStyle = '#fff6b4'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, art.width * .46, 7, 0, 0, Math.PI * 2); c.stroke(); }
    c.save(); c.translate(x, y); c.scale(actor.facing, 1);
    const bob = actor.moving ? Math.abs(Math.sin(s.time * 12 + ROSTER_INDEX[actor.friend])) * 3 : 0;
    c.drawImage(art, Math.round(-art.width / 2), Math.round(-art.height - bob)); c.restore();
    if (actor.friend === s.leader) {
      c.font = 'bold 13px system-ui'; const name = FRIEND_NAMES[actor.friend], w = c.measureText(name).width + 14;
      c.fillStyle = '#102538e6'; c.fillRect(x - w / 2, y + 7, w, 21); c.fillStyle = '#fff6d6'; c.fillText(name, x, y + 22);
      if (s.celebration > 0) star(c, x, y - art.height - 15, 11);
    }
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
const ROSTER_INDEX: Record<Friend, number> = { nico: 0, becca: 1, lua: 2, boltbot: 3, sparky: 4 };
