/** Renderer-independent, bounded walking simulation. All coordinates are world pixels. */
export type Point = { x: number; y: number };
export const MAP_WIDTH = 1672;
export const MAP_HEIGHT = 941;
export const FRAME_MS = 1000 / 30;
export const ROSTER = ['nico', 'becca', 'lua', 'boltbot', 'sparky'] as const;
export type Friend = typeof ROSTER[number];
export type Mode = 'explore' | 'stars' | 'parade';
export type Status = 'ready' | 'playing' | 'paused';
export type Input = { x: number; y: number; interact: boolean };
export type StopId = 'garden' | 'workshop' | 'treehouse' | 'castle' | 'observatory';
export type Stop = Point & { id: StopId; friend: Friend; en: string; es: string; action: string; accion: string; result: string; resultado: string };
export const STOPS: readonly Stop[] = [
  { id: 'garden', x: 480, y: 688, friend: 'becca', en: 'Friendship Garden', es: 'Jardín de la amistad', action: 'Water the flowers', accion: 'Regar las flores', result: 'Becca and Nico helped the flowers grow!', resultado: '¡Becca y Nico ayudaron a crecer las flores!' },
  { id: 'workshop', x: 402, y: 363, friend: 'boltbot', en: 'BoltBot’s Workshop', es: 'Taller de BoltBot', action: 'Repair the lantern', accion: 'Reparar la linterna', result: 'BoltBot repaired the lantern with the team!', resultado: '¡BoltBot reparó la linterna con el equipo!' },
  { id: 'treehouse', x: 778, y: 365, friend: 'sparky', en: 'Animal Treehouse', es: 'Casa del árbol', action: 'Follow the paw prints', accion: 'Seguir las huellas', result: 'Sparky found the little animals’ trail!', resultado: '¡Sparky encontró el sendero de los animalitos!' },
  { id: 'castle', x: 1080, y: 369, friend: 'lua', en: 'Moonlight Castle', es: 'Castillo de la luna', action: 'Make a rainbow', accion: 'Crear un arcoíris', result: 'Lua made a rainbow for everyone!', resultado: '¡Lua creó un arcoíris para todos!' },
  { id: 'observatory', x: 1230, y: 694, friend: 'nico', en: 'Star Observatory', es: 'Observatorio estelar', action: 'Send a star signal', accion: 'Enviar una señal estelar', result: 'Nico sent a star signal across the island!', resultado: '¡Nico envió una señal estelar por toda la isla!' },
];
// Authored corridors trace the illustration's paths, not roofs or open water.
export const TRAILS: readonly (readonly Point[])[] = [
  [{ x: 622, y: 816 }, { x: 577, y: 780 }, { x: 525, y: 718 }, { x: 480, y: 688 }, { x: 558, y: 665 }, { x: 607, y: 610 }, { x: 645, y: 555 }, { x: 625, y: 485 }],
  [{ x: 480, y: 688 }, { x: 503, y: 637 }, { x: 524, y: 577 }, { x: 520, y: 526 }, { x: 551, y: 486 }, { x: 509, y: 450 }, { x: 477, y: 410 }, { x: 442, y: 382 }, { x: 402, y: 363 }],
  [{ x: 551, y: 486 }, { x: 630, y: 463 }, { x: 706, y: 451 }, { x: 786, y: 451 }, { x: 866, y: 451 }, { x: 937, y: 463 }, { x: 1017, y: 486 }, { x: 1091, y: 520 }, { x: 1157, y: 529 }],
  [{ x: 937, y: 463 }, { x: 980, y: 426 }, { x: 1003, y: 388 }, { x: 1043, y: 352 }, { x: 1080, y: 369 }],
  [{ x: 1003, y: 388 }, { x: 955, y: 350 }, { x: 892, y: 345 }, { x: 839, y: 366 }, { x: 778, y: 365 }],
  [{ x: 1157, y: 529 }, { x: 1127, y: 586 }, { x: 1114, y: 646 }, { x: 1176, y: 685 }, { x: 1230, y: 694 }, { x: 1286, y: 716 }, { x: 1340, y: 692 }],
  [{ x: 1157, y: 529 }, { x: 1210, y: 469 }, { x: 1274, y: 445 }, { x: 1346, y: 414 }, { x: 1407, y: 367 }],
];
const SPAWN = { x: 528, y: 720 };
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const finite = (n: number) => Number.isFinite(n) ? n : 0;
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
function segmentDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
const SEGMENTS = TRAILS.flatMap(trail => trail.slice(1).map((end, i) => [trail[i], end] as const));
export function walkable(p: Point, clearance = 0): boolean {
  if (!Number.isFinite(p.x + p.y) || p.x < 20 || p.y < 20 || p.x > MAP_WIDTH - 20 || p.y > MAP_HEIGHT - 20) return false;
  return STOPS.some(stop => distance(stop, p) <= 31 - clearance) || SEGMENTS.some(([a, b]) => segmentDistance(p, a, b) <= 22 - clearance);
}
const GRID = 12, COLS = Math.ceil(MAP_WIDTH / GRID), ROWS = Math.ceil(MAP_HEIGHT / GRID);
const cells: Point[] = Array.from({ length: COLS * ROWS }, (_, i) => ({ x: i % COLS * GRID, y: Math.floor(i / COLS) * GRID }));
const free = cells.map(p => walkable(p, 6));
const nearest = (p: Point): number => {
  let best = -1, d = Infinity;
  for (let i = 0; i < cells.length; i++) if (free[i]) {
    const next = distance(cells[i], p);
    if (next < d) { best = i; d = next; }
  }
  return best;
};
/** One bounded breadth-first search on a click, never per animation frame. */
export function findPath(start: Point, target: Point): Point[] {
  if (!Number.isFinite(target.x + target.y)) return [];
  const first = nearest(start), last = nearest(target);
  if (first < 0 || last < 0) return [];
  const previous = new Int32Array(cells.length).fill(-2), queue = new Int32Array(cells.length);
  previous[first] = -1; queue[0] = first;
  let head = 0, tail = 1;
  while (head < tail) {
    const at = queue[head++]; if (at === last) break;
    for (const next of [at - 1, at + 1, at - COLS, at + COLS]) {
      if (next < 0 || next >= cells.length || !free[next] || previous[next] !== -2 || distance(cells[at], cells[next]) > GRID + 1) continue;
      previous[next] = at; queue[tail++] = next;
    }
  }
  if (previous[last] === -2) return [];
  const route: Point[] = [];
  for (let at = last; at >= 0; at = previous[at]) route.unshift({ ...cells[at] });
  return route;
}
export const TOKENS: readonly (Point & { id: string })[] = [
  { id: 'dock', x: 577, y: 780 }, { id: 'garden', x: 558, y: 665 },
  { id: 'lab', x: 477, y: 410 }, { id: 'bridge', x: 706, y: 451 },
  { id: 'tree', x: 839, y: 366 }, { id: 'castle', x: 980, y: 426 },
  { id: 'sky', x: 1274, y: 445 }, { id: 'stars', x: 1114, y: 646 },
];
export type MapState = {
  status: Status; mode: Mode; leader: Friend; player: Point; facing: number;
  trail: Point[]; path: Point[]; action: { id: StopId; elapsed: number } | null;
  completed: StopId[]; collected: string[]; greeted: Friend[]; time: number;
  traveled: number; moving: boolean; celebration: number; revision: number;
};
export function createMapState(missions: readonly string[] = []): MapState {
  return { status: 'ready', mode: 'explore', leader: 'nico', player: { ...SPAWN }, facing: 1,
    trail: Array.from({ length: 70 }, (_, i) => ({ x: SPAWN.x + i * .7, y: SPAWN.y + i * .8 })), path: [], action: null,
    completed: STOPS.filter(s => missions.includes(`friends-map:stop:${s.id}`)).map(s => s.id),
    collected: TOKENS.filter(t => missions.includes(`friends-map:star:${t.id}`)).map(t => t.id),
    greeted: ROSTER.filter(f => missions.includes(`friends-map:friend:${f}`)),
    time: 0, traveled: 0, moving: false, celebration: 0, revision: 0 };
}
export function nearbyStop(s: MapState): Stop | undefined { return STOPS.find(stop => distance(stop, s.player) < 42); }
export function destination(s: MapState, p: Point): void { s.path = findPath(s.player, p); s.action = null; }
export function selectFriend(s: MapState, friend: Friend): void { if (ROSTER.includes(friend)) { s.leader = friend; s.action = null; } }
export function pauseMap(s: MapState): void { s.status = 'paused'; s.path = []; s.action = null; s.moving = false; s.celebration = 0; }
export function busy(s: MapState, input: Input): boolean { return s.status === 'playing' && Boolean(input.x || input.y || input.interact || s.path.length || s.action || s.celebration > 0); }
export function progress(s: MapState): { count: number; total: number } {
  return s.mode === 'stars' ? { count: s.collected.length, total: TOKENS.length } : s.mode === 'parade' ? { count: s.greeted.length, total: ROSTER.length } : { count: s.completed.length, total: STOPS.length };
}
export function score(s: MapState): number { return s.collected.length * 10 + s.completed.length * 25 + s.greeted.length * 5; }
export function missionIds(s: MapState): string[] { return [...s.completed.map(id => `friends-map:stop:${id}`), ...s.collected.map(id => `friends-map:star:${id}`), ...s.greeted.map(id => `friends-map:friend:${id}`)]; }
export function companionPositions(s: MapState): (Point & { friend: Friend; facing: number; moving: boolean })[] {
  const order = [s.leader, ...ROSTER.filter(f => f !== s.leader)];
  return order.map((friend, i) => {
    const at = i === 0 ? s.player : s.trail[Math.min(s.trail.length - 1, i * 15)];
    return { ...at, friend, facing: s.facing, moving: s.moving };
  });
}
function move(s: MapState, dx: number, dy: number): void {
  const before = { ...s.player };
  if (walkable({ x: s.player.x + dx, y: s.player.y + dy })) { s.player.x += dx; s.player.y += dy; }
  else {
    if (walkable({ x: s.player.x + dx, y: s.player.y })) s.player.x += dx;
    if (walkable({ x: s.player.x, y: s.player.y + dy })) s.player.y += dy;
  }
  const d = distance(before, s.player); s.moving = d > .001; s.traveled += d;
  if (Math.abs(dx) > .01) s.facing = dx < 0 ? -1 : 1;
  if (distance(s.player, s.trail[0]) >= 1.7) { s.trail.unshift({ ...s.player }); if (s.trail.length > 90) s.trail.length = 90; }
}
export function stepMap(s: MapState, input: Input, delta: number): void {
  if (s.status !== 'playing' || !Number.isFinite(delta) || delta <= 0) return;
  const dt = Math.min(delta, .05); s.time += dt; s.moving = false;
  s.celebration = Math.max(0, s.celebration - dt);
  let x = clamp(finite(input.x), -1, 1), y = clamp(finite(input.y), -1, 1);
  if (x || y) { s.path = []; s.action = null; }
  else if (s.path.length) {
    const target = s.path[0], d = distance(s.player, target);
    if (d < 2) s.path.shift();
    else { x = (target.x - s.player.x) / d; y = (target.y - s.player.y) / d; }
  }
  if (x || y) {
    const d = s.path.length ? distance(s.player, s.path[0]) : Infinity;
    const speed = Math.min(170 * dt, d) / Math.max(1, Math.hypot(x, y));
    move(s, x * speed, y * speed);
  }
  for (const token of TOKENS) if (!s.collected.includes(token.id) && distance(token, s.player) < 21) { s.collected.push(token.id); s.revision++; s.celebration = .6; }
  if (input.interact) {
    const stop = nearbyStop(s); input.interact = false;
    if (stop && !s.action) { s.path = []; s.action = { id: stop.id, elapsed: 0 }; }
  }
  if (s.action) {
    const stop = STOPS.find(p => p.id === s.action!.id)!;
    if (distance(s.player, stop) >= 44) s.action = null;
    else if ((s.action.elapsed += dt) >= 1.2) {
      if (!s.completed.includes(stop.id)) s.completed.push(stop.id);
      if (!s.greeted.includes(s.leader)) s.greeted.push(s.leader);
      s.action = null; s.celebration = 1; s.revision++;
    }
  }
}
export type Viewport = { width: number; height: number; scale: number; x: number; y: number };
export function cameraFor(p: Point, width: number, height: number, overview = false): Viewport {
  const w = Math.max(1, width), h = Math.max(1, height);
  const scale = overview ? Math.min(w / MAP_WIDTH, h / MAP_HEIGHT) : Math.min(1.25, Math.max(.72, w / 1120));
  return { width: w, height: h, scale,
    x: clamp(p.x - w / scale / 2, Math.min(0, (MAP_WIDTH - w / scale) / 2), Math.max(0, MAP_WIDTH - w / scale)),
    y: clamp(p.y - h / scale / 2, Math.min(0, (MAP_HEIGHT - h / scale) / 2), Math.max(0, MAP_HEIGHT - h / scale)) };
}
export function screenToWorld(view: Viewport, p: Point): Point { return { x: view.x + p.x / view.scale, y: view.y + p.y / view.scale }; }
