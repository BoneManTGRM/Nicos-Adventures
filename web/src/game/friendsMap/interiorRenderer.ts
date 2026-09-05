import type { MapAssets } from './renderer';
import { indoorFriends, ROOM_FURNITURE, ROOM_HEIGHT, ROOM_PARTS, ROOM_WIDTH, ROOMS, WORKSTATION } from './interiors';
import type { InteriorState } from './interiors';
import type { Friend, StopId, Viewport } from './simulation';

const cache = new WeakMap<MapAssets, { room: StopId; background: HTMLCanvasElement }>();
function box(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, radius = 5) {
  c.fillStyle = color; c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill();
}
function ellipse(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color; c.beginPath(); c.ellipse(x, y, w, h, 0, 0, Math.PI * 2); c.fill();
}
function gem(c: CanvasRenderingContext2D, x: number, y: number, color: string, size = 16) {
  c.beginPath(); c.moveTo(x, y - size); c.lineTo(x + size * .6, y); c.lineTo(x, y + size); c.lineTo(x - size * .6, y); c.closePath(); c.fillStyle = color; c.fill();
  c.strokeStyle = '#fff8d3'; c.lineWidth = 1.5; c.stroke();
}
function plant(c: CanvasRenderingContext2D, x: number, y: number, color: string) {
  box(c, x - 13, y - 20, 26, 23, '#b77855'); box(c, x - 16, y - 25, 32, 8, '#e8ba81');
  c.strokeStyle = '#80a873'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 22); c.lineTo(x, y - 65); c.stroke();
  ellipse(c, x - 10, y - 39, 12, 5, '#729d72'); ellipse(c, x + 10, y - 50, 12, 5, '#a4c987');
  for (let i = 0; i < 5; i++) ellipse(c, x + Math.cos(i * 1.256) * 9, y - 66 + Math.sin(i * 1.256) * 9, 7, 7, color);
  ellipse(c, x, y - 66, 5, 5, '#ffeaba');
}
function prop(c: CanvasRenderingContext2D, room: StopId, x: number, y: number) {
  if (room === 'garden') { plant(c, x - 26, y, '#f0acbc'); plant(c, x + 25, y, '#c3b5e4'); }
  else if (room === 'workshop') {
    box(c, x - 37, y - 52, 74, 53, '#283b4c', 10); box(c, x - 30, y - 45, 60, 27, '#96dddc', 7);
    for (let i = 0; i < 3; i++) { ellipse(c, x - 23 + i * 23, y - 7, 7, 7, '#d7b476'); c.strokeStyle = '#3a4553'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 23 + i * 23, y - 7); c.lineTo(x - 20 + i * 23, y - 12); c.stroke(); }
    c.strokeStyle = '#92d9df'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 37, y - 18); c.lineTo(x + 48, y - 18); c.lineTo(x + 48, y - 61); c.stroke();
  } else if (room === 'treehouse') {
    ellipse(c, x, y - 3, 45, 15, '#b48657'); ellipse(c, x, y - 9, 34, 12, '#efd6a6');
    ellipse(c, x, y - 28, 20, 22, '#e8bd8e'); ellipse(c, x - 11, y - 49, 7, 13, '#edd9b6'); ellipse(c, x + 11, y - 49, 7, 13, '#edd9b6');
    ellipse(c, x - 7, y - 29, 2, 3, '#3e3029'); ellipse(c, x + 7, y - 29, 2, 3, '#3e3029'); ellipse(c, x, y - 22, 3, 2, '#ba8882');
  } else if (room === 'castle') {
    ellipse(c, x, y, 41, 9, '#241d43'); gem(c, x, y - 40, '#c8b0ed', 33); gem(c, x - 26, y - 20, '#e2adc9', 19); gem(c, x + 24, y - 19, '#98d9e3', 20);
  } else {
    c.save(); c.translate(x, y - 45); c.rotate(-.5); box(c, -40, -15, 74, 28, '#d5b87d'); box(c, 26, -20, 15, 38, '#a78b5a'); ellipse(c, 41, -1, 5, 17, '#49788b'); c.restore();
    c.strokeStyle = '#c3b085'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y - 32); c.lineTo(x - 24, y + 2); c.moveTo(x, y - 32); c.lineTo(x + 24, y + 2); c.stroke();
  }
}
/** Architecture and decorations are baked once per room entry, not each frame. */
export function bakeRoom(room: StopId): HTMLCanvasElement {
  const canvas = document.createElement('canvas'); canvas.width = ROOM_WIDTH; canvas.height = ROOM_HEIGHT;
  const c = canvas.getContext('2d')!; const theme = ROOMS[room];
  c.fillStyle = '#10242e'; c.fillRect(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
  const wall = c.createLinearGradient(0, 18, 0, 235); wall.addColorStop(0, '#142f40'); wall.addColorStop(1, theme.wall);
  c.fillStyle = wall; c.beginPath(); c.roundRect(27, 20, 586, 432, 20); c.fill();
  c.strokeStyle = '#b89c705c'; c.lineWidth = 3; c.stroke();
  c.fillStyle = theme.floor; c.fillRect(42, 237, 556, 217);
  for (let y = 237; y < 454; y += 26) for (let x = 42 - (y % 2) * 50; x < 598; x += 82) {
    c.fillStyle = (Math.floor(x / 82) + y) % 3 === 0 ? '#ffedc20a' : '#13243813'; c.fillRect(x, y, Math.min(80, 598 - x), 24);
    c.strokeStyle = '#1a26371a'; c.lineWidth = 1; c.strokeRect(x, y, Math.min(82, 598 - x), 26);
  }
  box(c, 42, 229, 556, 12, '#baa079', 0); box(c, 28, 451, 584, 24, '#473e3c', 4); box(c, 28, 451, 584, 6, '#d0ad7b', 2);
  for (const x of [37, 212, 419, 593]) { box(c, x - 5, 29, 10, 210, '#87765c'); box(c, x - 8, 219, 16, 22, '#c1aa7d'); }
  box(c, 32, 28, 576, 13, '#bca77a');
  for (const [j, x] of [105, 279, 454].entries()) {
    c.save(); c.beginPath(); c.roundRect(x, 64, 81, 101, [38, 38, 3, 3]); c.clip();
    c.fillStyle = room === 'observatory' || room === 'castle' ? '#172e53' : '#98c9bc'; c.fillRect(x, 64, 81, 101);
    if (room === 'observatory' || room === 'castle') { for (let i = 0; i < 11; i++) ellipse(c, x + 8 + i * 17 % 65, 75 + i * 23 % 71, 1.5, 1.5, '#f7e6bc'); ellipse(c, x + 52, 85, 13, 13, '#ead8b1'); }
    else { c.fillStyle = '#73986a'; c.beginPath(); c.moveTo(x, 146); c.quadraticCurveTo(x + 32, 95 + j * 4, x + 81, 145); c.lineTo(x + 81, 168); c.lineTo(x, 168); c.fill(); }
    c.restore(); c.strokeStyle = '#d2b98c'; c.lineWidth = 5; c.beginPath(); c.roundRect(x, 64, 81, 101, [38, 38, 3, 3]); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo(x + 40, 67); c.lineTo(x + 40, 165); c.moveTo(x, 122); c.lineTo(x + 81, 122); c.stroke();
  }
  for (const f of ROOM_FURNITURE) { box(c, f.x + 3, f.y + 12, f.w, f.h, '#10273836'); box(c, f.x, f.y, f.w, f.h, '#57483e'); box(c, f.x - 4, f.y - 6, f.w + 8, 13, '#ccb084'); box(c, f.x + 8, f.y + 15, f.w - 16, 24, '#776453'); }
  prop(c, room, 142, 177); prop(c, room, 496, 177); prop(c, room, 320, 176);
  ellipse(c, 320, 349, 121, 62, '#13283d35'); ellipse(c, 320, 348, 113, 56, theme.wall);
  c.strokeStyle = theme.color; c.lineWidth = 2; c.beginPath(); c.ellipse(320, 348, 104, 48, 0, 0, Math.PI * 2); c.stroke();
  box(c, 282, 436, 76, 23, '#183c41'); c.strokeStyle = '#e4d2a7'; c.lineWidth = 2; c.strokeRect(282, 436, 76, 23);
  c.fillStyle = '#eee4c7'; c.font = 'bold 18px system-ui'; c.textAlign = 'center'; c.fillText('↓', 320, 454);
  c.fillStyle = '#dcc9a1'; c.font = 'bold 11px system-ui'; c.fillText('NICO & FRIENDS', 320, 52);
  return canvas;
}
export function drawInterior(c: CanvasRenderingContext2D, assets: MapAssets, s: InteriorState, leader: Friend, view: Viewport): void {
  if (!s.room) return;
  let cached = cache.get(assets);
  if (!cached || cached.room !== s.room) { if (cached) cached.background.width = cached.background.height = 1; cached = { room: s.room, background: bakeRoom(s.room) }; cache.set(assets, cached); }
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#10242e'; c.fillRect(0, 0, view.width, view.height);
  c.setTransform(view.scale, 0, 0, view.scale, -view.x * view.scale, -view.y * view.scale); c.drawImage(cached.background, 0, 0);
  ROOM_PARTS.forEach((p, i) => {
    if (s.found.includes(i)) return;
    ellipse(c, p.x, p.y, 25, 10, '#eee1a559'); gem(c, p.x, p.y - 15, ROOMS[s.room!].color);
    c.fillStyle = '#16313e'; c.font = 'bold 12px system-ui'; c.textAlign = 'center'; c.fillText(String(i + 1), p.x, p.y - 11);
  });
  c.strokeStyle = s.found.length === 2 ? '#fff1a8' : '#a4baba'; c.lineWidth = 3; c.beginPath(); c.ellipse(WORKSTATION.x, WORKSTATION.y, 25, 9, 0, 0, Math.PI * 2); c.stroke();
  if (s.completed.includes(s.room)) { gem(c, 320, 190, '#f7d58f', 16); }
  const target = s.path.at(-1); if (target) { c.strokeStyle = '#fef8ca'; c.lineWidth = 2; c.beginPath(); c.ellipse(target.x, target.y, 10, 5, 0, 0, Math.PI * 2); c.stroke(); }
  for (const actor of indoorFriends(s, leader).sort((a, b) => a.y - b.y)) {
    const art = assets.sprites[actor.friend], x = actor.x, y = actor.y;
    ellipse(c, x, y, art.width * .33, 5, '#12233266');
    if (actor.friend === leader) { c.strokeStyle = '#fff0b1'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, art.width * .48, 7, 0, 0, Math.PI * 2); c.stroke(); }
    c.save(); c.translate(x, y); c.scale(s.facing, 1);
    c.drawImage(art, -art.width / 2, -art.height - (s.moving ? Math.abs(Math.sin(s.time * 12)) * 2 : 0)); c.restore();
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
