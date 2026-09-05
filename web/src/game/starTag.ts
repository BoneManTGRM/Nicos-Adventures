// Gameplay owns state. Renderers only display it; no browser or renderer dependencies.
export type Point = { x: number; z: number };
export type Wall = { x: number; z: number; w: number; d: number };
export const ARENA_WALLS: Wall[] = [
  { x: -11, z: 0, w: 1, d: 23 }, { x: 11, z: 0, w: 1, d: 23 },
  { x: 0, z: -11, w: 23, d: 1 }, { x: 0, z: 11, w: 23, d: 1 },
  { x: -5, z: 0, w: 1.5, d: 3 }, { x: 5, z: 0, w: 1.5, d: 3 },
];
export type ArenaInput = { forward: number; side: number; turn: number; fire: boolean; dash: boolean };
export const emptyArenaInput = (): ArenaInput => ({ forward: 0, side: 0, turn: 0, fire: false, dash: false });
export type TagMonster = Point & { id: number; hp: number; kind: number; clock: number; flash: number };
export type TagShot = Point & { id: number; vx: number; vz: number; life: number; friendly: boolean };
export type TagSpark = Point & { id: number; life: number; friendly: boolean };
export type TagState = {
  status: 'ready' | 'playing' | 'paused' | 'won' | 'rest';
  player: Point; yaw: number; shield: number; score: number; wave: number;
  tags: number; shotsFired: number; time: number; distance: number; cooldown: number;
  dashCooldown: number; invulnerable: number; nextWave: number; nextId: number;
  monsters: TagMonster[]; shots: TagShot[]; sparks: TagSpark[];
  crystals: (Point & { id: number })[];
};
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const finite = (n: number) => Number.isFinite(n) ? n : 0;
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.z - b.z);
export function blocked(p: Point, radius = .32, walls = ARENA_WALLS): boolean {
  return walls.some(w => Math.abs(p.x - w.x) < w.w / 2 + radius && Math.abs(p.z - w.z) < w.d / 2 + radius);
}
export function slide(p: Point, dx: number, dz: number, radius = .32, walls = ARENA_WALLS): Point {
  const next = { ...p };
  if (!blocked({ x: p.x + dx, z: p.z }, radius, walls)) next.x += dx;
  if (!blocked({ x: next.x, z: p.z + dz }, radius, walls)) next.z += dz;
  return next;
}
function spawnWave(s: TagState) {
  s.monsters = Array.from({ length: 3 + s.wave }, (_, i) => ({
    id: s.nextId++, x: (i % 4 - 1.5) * 3, z: -6 - Math.floor(i / 4) * 2,
    hp: s.wave === 3 ? 3 : 2, kind: i % 3, clock: 2.5 + i * .6, flash: 0,
  }));
  s.crystals = [{ id: s.nextId++, x: -8, z: 4 }, { id: s.nextId++, x: 8, z: -4 }];
}
export function createTagState(): TagState {
  const s: TagState = {
    status: 'ready', player: { x: 0, z: 7 }, yaw: 0, shield: 100, score: 0, wave: 1,
    tags: 0, shotsFired: 0, time: 0, distance: 0, cooldown: 0, dashCooldown: 0,
    invulnerable: 0, nextWave: 0, nextId: 1, monsters: [], shots: [], sparks: [], crystals: [],
  };
  spawnWave(s);
  return s;
}
function damage(s: TagState, amount: number) {
  if (s.invulnerable > 0) return;
  s.shield = Math.max(0, s.shield - amount);
  s.invulnerable = .8;
  if (s.shield === 0) s.status = 'rest';
}
function substep(s: TagState, input: ArenaInput, dt: number) {
  s.time += dt;
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.dashCooldown = Math.max(0, s.dashCooldown - dt);
  s.invulnerable = Math.max(0, s.invulnerable - dt);
  s.yaw += clamp(finite(input.turn), -1, 1) * dt * 2.4;
  if (input.dash && s.dashCooldown === 0) { s.dashCooldown = 3; s.invulnerable = .35; }
  const forward = clamp(finite(input.forward), -1, 1), side = clamp(finite(input.side), -1, 1);
  const norm = Math.max(1, Math.hypot(forward, side));
  const speed = s.dashCooldown > 2.72 ? 9 : 3.6;
  const dx = (Math.sin(s.yaw) * forward + Math.cos(s.yaw) * side) / norm * speed * dt;
  const dz = (-Math.cos(s.yaw) * forward + Math.sin(s.yaw) * side) / norm * speed * dt;
  const moved = slide(s.player, dx, dz);
  s.distance += distance(s.player, moved);
  s.player = moved;
  if (input.fire && s.cooldown === 0 && s.shots.length < 64) {
    let aim = s.yaw;
    // Gentle aim assistance only inside the reticle cone, never through scenery.
    const target = s.monsters.filter(m => {
      const angle = Math.atan2(m.x - s.player.x, -(m.z - s.player.z));
      return Math.abs(Math.atan2(Math.sin(angle - aim), Math.cos(angle - aim))) < .12;
    }).sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
    if (target) aim = Math.atan2(target.x - s.player.x, -(target.z - s.player.z));
    s.shots.push({ id: s.nextId++, ...s.player, vx: Math.sin(aim) * 19, vz: -Math.cos(aim) * 19, life: 1.4, friendly: true });
    s.cooldown = .3;
    s.shotsFired++;
  }
  for (const m of s.monsters) {
    m.flash = Math.max(0, m.flash - dt);
    m.clock -= dt;
    const d = distance(m, s.player);
    if (d > 1.2) {
      const speed = (.55 + s.wave * .18) * dt / d;
      const next = slide(m, (s.player.x - m.x) * speed, (s.player.z - m.z) * speed, .42);
      m.x = next.x; m.z = next.z;
    } else damage(s, 8);
    if (m.clock <= 0 && d > 1 && s.shots.length < 64) {
      m.clock = 3.8 - s.wave * .35;
      s.shots.push({ id: s.nextId++, x: m.x, z: m.z, vx: (s.player.x - m.x) / d * 3.5, vz: (s.player.z - m.z) / d * 3.5, life: 5, friendly: false });
    }
  }
  for (const shot of s.shots) {
    shot.x += shot.vx * dt; shot.z += shot.vz * dt; shot.life -= dt;
    if (blocked(shot, .1)) { shot.life = 0; continue; }
    if (shot.friendly) {
      const target = s.monsters.find(m => m.hp > 0 && distance(m, shot) < .68);
      if (target) {
        target.hp--; target.flash = .18; shot.life = 0; s.score += 5;
        s.sparks.push({ id: s.nextId++, x: target.x, z: target.z, life: .5, friendly: true });
        if (target.hp === 0) { s.tags++; s.score += 50; }
      }
    } else if (distance(shot, s.player) < .5) {
      damage(s, 10); shot.life = 0;
      s.sparks.push({ id: s.nextId++, ...s.player, life: .35, friendly: false });
    }
  }
  s.monsters = s.monsters.filter(m => m.hp > 0);
  s.shots = s.shots.filter(p => p.life > 0);
  s.sparks = s.sparks.filter(p => (p.life -= dt) > 0).slice(-24);
  s.crystals = s.crystals.filter(c => {
    if (distance(c, s.player) > .8) return true;
    s.shield = Math.min(100, s.shield + 20); s.score += 20; return false;
  });
  if (s.status !== 'playing') return;
  if (s.monsters.length === 0) {
    if (s.wave === 3) { s.status = 'won'; s.score += Math.round(s.shield) * 3; s.shots = []; }
    else {
      if (s.nextWave === 0) { s.nextWave = 2; s.shots = []; }
      s.nextWave -= dt;
      if (s.nextWave <= 0) {
        s.wave++; s.nextWave = 0; s.shield = Math.min(100, s.shield + 15);
        // Start each round with a fair distance to the new friends.
        s.player = { x: 0, z: 7 }; s.yaw = 0; s.invulnerable = 1;
        spawnWave(s);
      }
    }
  }
}
export function stepTag(s: TagState, input: ArenaInput, delta: number): void {
  if (s.status !== 'playing' || !Number.isFinite(delta) || delta <= 0) return;
  // Drop background-tab time rather than fast-forwarding the player into a loss.
  let remaining = Math.min(delta, .05);
  while (remaining > .000001 && s.status === 'playing') {
    const dt = Math.min(remaining, 1 / 120);
    substep(s, input, dt); remaining -= dt;
  }
}

export const HOME_FURNITURE: Wall[] = [
  { x: 23, z: 51, w: 22, d: 10 }, { x: 53, z: 48, w: 20, d: 6 },
  { x: 80, z: 54, w: 13, d: 9 },
];
export function homeFree(p: Point): boolean {
  return p.x >= 8 && p.x <= 92 && p.z >= 48 && p.z <= 90 && !blocked(p, 1, HOME_FURNITURE);
}
export function moveHome(p: Point, dx: number, dz: number): Point {
  const x = { x: clamp(p.x + finite(dx), 8, 92), z: p.z };
  const next = homeFree(x) ? x : { ...p };
  const z = { x: next.x, z: clamp(p.z + finite(dz), 48, 90) };
  return homeFree(z) ? z : next;
}
export function homePath(start: Point, target: Point): Point[] {
  const nodes: Point[] = [];
  for (let z = 48; z <= 88; z += 4) for (let x = 8; x <= 92; x += 4) if (homeFree({ x, z })) nodes.push({ x, z });
  const nearest = (p: Point) => nodes.reduce((best, n) => distance(p, n) < distance(p, best) ? n : best, nodes[0]);
  const first = nearest(start), last = nearest(target);
  const key = (p: Point) => `${p.x},${p.z}`;
  const queue = [first], previous = new Map<string, Point | null>([[key(first), null]]);
  const valid = new Map(nodes.map(n => [key(n), n]));
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    if (key(p) === key(last)) break;
    for (const [dx, dz] of [[4, 0], [-4, 0], [0, 4], [0, -4]]) {
      const n = valid.get(key({ x: p.x + dx, z: p.z + dz }));
      if (n && !previous.has(key(n))) { previous.set(key(n), p); queue.push(n); }
    }
  }
  if (!previous.has(key(last))) return [];
  const path: Point[] = [];
  let cursor: Point | null = last;
  while (cursor) { path.unshift(cursor); cursor = previous.get(key(cursor)) ?? null; }
  return path;
}
