import type { Friend, Input, Point, StopId, Viewport } from './simulation';

export const ROOM_WIDTH = 640, ROOM_HEIGHT = 500;
export const ROOM_IDS: readonly StopId[] = ['garden', 'workshop', 'treehouse', 'castle', 'observatory'];
export const ROOM_ENTRY = { x: 320, y: 422 };
export const WORKSTATION = { x: 320, y: 265 };
export const ROOM_PARTS = [{ x: 140, y: 333 }, { x: 500, y: 333 }] as const;
export const ROOM_FURNITURE = [
  { x: 76, y: 179, w: 132, h: 56 }, { x: 432, y: 179, w: 132, h: 56 },
  { x: 261, y: 176, w: 118, h: 53 },
] as const;
export const ROOMS: Record<StopId, { en: string; es: string; part: string; pieza: string; goal: string; meta: string; color: string; wall: string; floor: string }> = {
  garden: { en: 'Becca’s Garden House', es: 'Casa jardín de Becca', part: 'watering supplies', pieza: 'materiales de riego', goal: 'Find the supplies, then help three flowers bloom.', meta: 'Encuentra los materiales y ayuda a florecer a tres plantas.', color: '#a3dbad', wall: '#305446', floor: '#967152' },
  workshop: { en: 'BoltBot’s Workshop', es: 'Taller de BoltBot', part: 'spare gears', pieza: 'engranajes', goal: 'Collect the gears and align the power dials.', meta: 'Recoge los engranajes y alinea los controles de energía.', color: '#92d9df', wall: '#294b5b', floor: '#6c737b' },
  treehouse: { en: 'Sparky’s Animal House', es: 'Casa de animales de Sparky', part: 'snack baskets', pieza: 'canastas de comida', goal: 'Find the baskets and give each animal its snack.', meta: 'Encuentra las canastas y da su comida a cada animal.', color: '#efc487', wall: '#556246', floor: '#966445' },
  castle: { en: 'Lua’s Rainbow Room', es: 'Sala arcoíris de Lua', part: 'magic crystals', pieza: 'cristales mágicos', goal: 'Collect the crystals and remember the magic sequence.', meta: 'Recoge los cristales y recuerda la secuencia mágica.', color: '#d2b2ee', wall: '#55456f', floor: '#8a7795' },
  observatory: { en: 'Nico’s Star Observatory', es: 'Observatorio estelar de Nico', part: 'telescope lenses', pieza: 'lentes del telescopio', goal: 'Find the lenses, then connect a new constellation.', meta: 'Encuentra los lentes y conecta una nueva constelación.', color: '#f0d598', wall: '#263f61', floor: '#626279' },
};
export type Puzzle = { values: number[]; step: number; mistakes: number; solved: boolean };
export type InteriorState = {
  room: StopId | null; player: Point; trail: Point[]; path: Point[]; moving: boolean; facing: number;
  found: number[]; puzzleOpen: boolean; puzzle: Puzzle; completed: StopId[]; claimed: boolean;
  revision: number; time: number; celebration: number;
};
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const freshPuzzle = (): Puzzle => ({ values: [0, 0, 0], step: 0, mistakes: 0, solved: false });
export function createInterior(missions: readonly string[] = []): InteriorState {
  return { room: null, player: { ...ROOM_ENTRY }, trail: [], path: [], moving: false, facing: 1,
    found: [], puzzleOpen: false, puzzle: freshPuzzle(), completed: ROOM_IDS.filter(id => missions.includes(`friends-map:room:${id}`)),
    claimed: missions.includes('friends-map:rooms:treasure'), revision: 0, time: 0, celebration: 0 };
}
export function enterInterior(s: InteriorState, room: StopId): void {
  if (!ROOM_IDS.includes(room)) return;
  s.room = room; s.player = { ...ROOM_ENTRY }; s.path = []; s.moving = false; s.facing = 1;
  s.trail = Array.from({ length: 90 }, (_, i) => ({ x: 320 + i * 1.8, y: 422 }));
  s.found = []; s.puzzle = freshPuzzle(); s.puzzleOpen = false; s.celebration = 0;
}
export function leaveInterior(s: InteriorState): void { s.room = null; stopInterior(s); }
export function stopInterior(s: InteriorState): void { s.path = []; s.moving = false; s.puzzleOpen = false; s.celebration = 0; }
export function roomWalkable(p: Point): boolean {
  return Number.isFinite(p.x + p.y) && p.x >= 56 && p.x <= 584 && p.y >= 239 && p.y <= 442 &&
    !ROOM_FURNITURE.some(r => p.x > r.x - 9 && p.x < r.x + r.w + 9 && p.y > r.y - 9 && p.y < r.y + r.h + 9);
}
const GRID = 12, COLS = 54;
const CELLS = Array.from({ length: COLS * 42 }, (_, i) => ({ x: i % COLS * GRID, y: Math.floor(i / COLS) * GRID }));
const FREE = CELLS.map(roomWalkable);
export function roomPath(start: Point, target: Point): Point[] {
  if (!Number.isFinite(target.x + target.y)) return [];
  const nearest = (p: Point) => { let best = -1, d = Infinity; CELLS.forEach((n, i) => { const v = dist(n, p); if (FREE[i] && v < d) { best = i; d = v; } }); return best; };
  const first = nearest(start), last = nearest(target);
  if (first < 0 || last < 0) return [];
  const queue = [first], prev = new Int32Array(CELLS.length).fill(-2); prev[first] = -1;
  for (let i = 0; i < queue.length; i++) {
    const at = queue[i]; if (at === last) break;
    for (const n of [at - 1, at + 1, at - COLS, at + COLS]) if (n >= 0 && n < CELLS.length && FREE[n] && prev[n] === -2 && dist(CELLS[n], CELLS[at]) <= GRID) { prev[n] = at; queue.push(n); }
  }
  if (prev[last] === -2) return [];
  const route: Point[] = []; for (let n = last; n >= 0; n = prev[n]) route.unshift({ ...CELLS[n] });
  return route;
}
export function roomDestination(s: InteriorState, p: Point): void { if (s.room && !s.puzzleOpen) s.path = roomPath(s.player, p); }
export function atWorkstation(s: InteriorState): boolean { return Boolean(s.room) && dist(s.player, WORKSTATION) < 43; }
export function openRoomPuzzle(s: InteriorState): boolean {
  if (!s.room || s.found.length !== 2 || !atWorkstation(s)) return false;
  s.path = []; s.moving = false; s.puzzleOpen = true; return true;
}
export function roomAction(s: InteriorState): void {
  if (!s.room || s.puzzleOpen) return;
  const missing = ROOM_PARTS.find((_, i) => !s.found.includes(i));
  if (missing) roomDestination(s, missing);
  else if (!openRoomPuzzle(s)) roomDestination(s, WORKSTATION);
}
export function roomBusy(s: InteriorState, input: Input): boolean { return Boolean(s.room) && !s.puzzleOpen && Boolean(input.x || input.y || input.interact || s.path.length || s.celebration); }
export function stepInterior(s: InteriorState, input: Input, delta: number): void {
  if (!s.room || s.puzzleOpen || !Number.isFinite(delta) || delta <= 0) return;
  const dt = Math.min(delta, .05); s.time += dt; s.moving = false; s.celebration = Math.max(0, s.celebration - dt);
  const axis = (n: number) => Number.isFinite(n) ? Math.max(-1, Math.min(1, n)) : 0;
  let x = axis(input.x), y = axis(input.y);
  if (x || y) s.path = [];
  else if (s.path.length) {
    const n = s.path[0], d = dist(s.player, n);
    if (d < 1.5) s.path.shift(); else { x = (n.x - s.player.x) / d; y = (n.y - s.player.y) / d; }
  }
  if (x || y) {
    const speed = Math.min(155 * dt, s.path.length ? dist(s.player, s.path[0]) : Infinity) / Math.max(1, Math.hypot(x, y));
    const before = { ...s.player };
    if (roomWalkable({ x: s.player.x + x * speed, y: s.player.y })) s.player.x += x * speed;
    if (roomWalkable({ x: s.player.x, y: s.player.y + y * speed })) s.player.y += y * speed;
    s.moving = dist(before, s.player) > .001; if (x) s.facing = x < 0 ? -1 : 1;
    if (dist(s.player, s.trail[0]) > 1.7) { s.trail.unshift({ ...s.player }); s.trail.length = Math.min(s.trail.length, 90); }
  }
  ROOM_PARTS.forEach((p, i) => { if (dist(p, s.player) < 22 && !s.found.includes(i)) { s.found.push(i); s.celebration = .5; } });
  if (input.interact) { input.interact = false; roomAction(s); }
}
/** Pure game rules, shared by the accessible controls and regression tests. */
export function playPuzzle(s: InteriorState, choice: number): boolean {
  if (!s.room || !s.puzzleOpen || s.puzzle.solved || !Number.isInteger(choice)) return false;
  const p = s.puzzle;
  if (s.room === 'garden' && choice >= 0 && choice < 3) { p.values[choice] = Math.min(2, p.values[choice] + 1); p.solved = p.values.every(n => n === 2); }
  else if (s.room === 'workshop' && choice >= 0 && choice < 3) { p.values[choice] = (p.values[choice] + 1) % 4; p.solved = p.values.every((n, i) => n === [1, 3, 2][i]); }
  else if (s.room === 'treehouse' && choice >= 0 && choice < 3) { if (choice === [2, 0, 1][p.step]) p.step++; else p.mistakes++; p.solved = p.step === 3; }
  else if (s.room === 'castle' && choice >= 0 && choice < 3) { if (choice === [1, 0, 2, 1][p.step]) p.step++; else { p.mistakes++; p.step = 0; } p.solved = p.step === 4; }
  else if (s.room === 'observatory' && choice >= 0 && choice < 5) { if (choice === p.step) p.step++; else p.mistakes++; p.solved = p.step === 5; }
  if (p.solved && !s.completed.includes(s.room)) { s.completed.push(s.room); s.revision++; }
  return p.solved;
}
export function replayPuzzle(s: InteriorState): void { s.puzzle = freshPuzzle(); }
export function claimRoomTreasure(s: InteriorState): boolean {
  if (s.claimed || !ROOM_IDS.every(id => s.completed.includes(id))) return false;
  s.claimed = true; s.revision++; return true;
}
export function interiorMissions(s: InteriorState): string[] { return [...s.completed.map(id => `friends-map:room:${id}`), ...(s.claimed ? ['friends-map:rooms:treasure'] : [])]; }
export function roomCamera(width: number, height: number): Viewport {
  const scale = Math.min(width / ROOM_WIDTH, height / ROOM_HEIGHT);
  return { width, height, scale, x: (ROOM_WIDTH - width / scale) / 2, y: (ROOM_HEIGHT - height / scale) / 2 };
}
export function indoorFriends(s: InteriorState, leader: Friend): (Point & { friend: Friend })[] {
  const roster: Friend[] = ['nico', 'becca', 'lua', 'boltbot', 'sparky'];
  return [leader, ...roster.filter(f => f !== leader)].map((friend, i) => ({ friend, ...(i === 0 ? s.player : s.trail[Math.min(i * 14, s.trail.length - 1)] ?? s.player) }));
}
