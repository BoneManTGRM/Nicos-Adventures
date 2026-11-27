import type { Friend } from '../friendsMap/simulation';
import { chapterKey, COURSES, ledgeAt, relicAt } from './levels';

export type Controls = { axis: number; heldJump: boolean };
export type Pickup = 'owl' | 'feather' | 'chime';
export type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
export type Run = ReturnType<typeof startRun>;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const approach = (a: number, b: number, amount: number) => a + clamp(b - a, -amount, amount);
export function startRun(stage: number, missions: readonly string[] = [], friend: Friend = 'nico') {
  const level = COURSES[stage],
    key = chapterKey(stage),
    replay = missions.includes(key + ':home');
  const bits = (kind: Pickup, n: number) =>
    Array.from({ length: n }, (_, i) => !replay && missions.includes(key + ':' + kind + i));
  const checkpoint = replay
    ? 0
    : ([...level.saves].reverse().find((i) => missions.includes(key + ':post' + i)) ?? 0);
  const spawn = level.ledges[checkpoint];
  return {
    stage,
    friend,
    x: checkpoint ? spawn.x + 28 : 66,
    y: spawn.y,
    vx: 0,
    vy: 0,
    facing: 1,
    ground: checkpoint,
    checkpoint,
    time: 0,
    elapsed: 0,
    resumed: checkpoint > 0 || (!replay && missions.some((id) => id.startsWith(key + ':'))),
    travel: 0,
    falls: 0,
    grace: 0.12,
    dropTime: 0,
    buffer: 0,
    used: false,
    ability: 0,
    abilityFriend: friend,
    anchorX: 0,
    anchorY: 0,
    originX: 0,
    originY: 0,
    land: 0,
    respawnGlow: 0,
    gustRest: 0,
    arrival: 0,
    won: false,
    nearNest: false,
    revision: 0,
    feedback: '' as '' | Pickup | 'save' | 'fall' | 'finish' | 'gust',
    feedbackTime: 0,
    owls: bits('owl', 3),
    feathers: bits('feather', 3),
    chimes: bits('chime', level.chimes.length),
    crumbles: level.ledges.map(() => 0),
    particles: [] as Spark[],
    trail: [] as { x: number; y: number }[],
    sample: 0,
  };
}
export const count = (flags: readonly boolean[]) => flags.filter(Boolean).length;
export function savedEvents(s: Run) {
  const ids: string[] = [],
    key = chapterKey(s.stage);
  for (const [list, kind] of [
    [s.owls, 'owl'],
    [s.feathers, 'feather'],
    [s.chimes, 'chime'],
  ] as const)
    list.forEach((got, i) => {
      if (got) ids.push(key + ':' + kind + i);
    });
  for (const i of COURSES[s.stage].saves) if (i <= s.checkpoint) ids.push(key + ':post' + i);
  if (s.won) ids.push(key + ':home');
  return ids;
}
export function jump(s: Run) {
  if (!s.won) s.buffer = 0.15;
}
export function dropPerch(s: Run) {
  if (s.won || s.ground < 0 || COURSES[s.stage].ledges[s.ground].kind !== 'perch') return;
  s.dropTime = 0.34;
  s.ground = -1;
  s.grace = s.buffer = 0;
  s.vy = 85;
  s.y += 4;
}
export function changeLeader(s: Run, f: Friend) {
  s.friend = f;
}
export function power(s: Run) {
  if (s.won || s.used) return false;
  s.used = true;
  s.grace = 0;
  s.ground = -1;
  s.buffer = 0;
  s.abilityFriend = s.friend;
  const forward = s.facing;
  switch (s.friend) {
    case 'nico':
      s.vy = -432;
      s.ability = 0.52;
      break;
    case 'lua':
      s.vy = Math.min(-130, s.vy);
      s.ability = 1.35;
      break;
    case 'boltbot':
      s.vy = -230;
      s.ability = 0.48;
      break;
    case 'sparky':
      s.vy = -300;
      s.vx = forward * 360;
      s.ability = 0.54;
      break;
    case 'becca': {
      const ahead = COURSES[s.stage].ledges
        .filter((p) => p.kind !== 'perch')
        .map((p) => ledgeAt(p, s.time))
        .map((p) => ({ x: clamp(s.x + forward * 170, p.x + 15, p.x + p.width - 15), y: p.y }))
        .filter((p) => (p.x - s.x) * forward > 55 && (p.x - s.x) * forward < 245 && p.y < s.y + 120)
        .sort((a, b) => Math.abs(a.x - s.x - forward * 165) - Math.abs(b.x - s.x - forward * 165))[0];
      s.originX = s.x;
      s.originY = s.y;
      s.anchorX = ahead?.x ?? s.x + forward * 125;
      s.anchorY = ahead?.y ?? s.y;
      s.ability = 0.64;
      s.vy = -240;
      break;
    }
  }
  scatter(s, s.x, s.y - 15, '#fff3b8', 7);
  return true;
}
function scatter(s: Run, x: number, y: number, color: string, total: number) {
  for (let i = 0; i < total; i++) {
    const a = (i / total) * Math.PI * 2,
      speed = 24 + ((i * 13) % 56);
    s.particles.push({
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 24,
      life: 0.42 + (i % 3) * 0.1,
      color,
    });
  }
}
function feedback(s: Run, kind: Run['feedback']) {
  s.feedback = kind;
  s.feedbackTime = 1.5;
}
function respawn(s: Run) {
  const p = ledgeAt(COURSES[s.stage].ledges[s.checkpoint], s.time);
  s.x = s.checkpoint ? p.x + 28 : 66;
  s.y = p.y;
  s.vx = s.vy = 0;
  s.ground = s.checkpoint;
  s.used = false;
  s.ability = s.buffer = 0;
  s.grace = 0.12;
  s.respawnGlow = 0.7;
  s.falls++;
  s.trail.length = 0;
  feedback(s, 'fall');
}
function takeItems(s: Run, kind: Pickup) {
  const course = COURSES[s.stage],
    list = kind === 'owl' ? course.owlets : kind === 'feather' ? course.feathers : course.chimes;
  const flags = kind === 'owl' ? s.owls : kind === 'feather' ? s.feathers : s.chimes;
  list.forEach((r, i) => {
    if (flags[i] || (kind === 'chime' && s.ground >= 0)) return;
    const p = relicAt(course, r, s.time);
    const radius =
      kind === 'owl' && s.ability > 0 && s.abilityFriend === 'sparky' ? 90 : kind === 'owl' ? 32 : 28;
    if (Math.hypot(p.x - s.x, p.y - s.y + 24) > radius) return;
    flags[i] = true;
    s.revision++;
    feedback(s, kind);
    scatter(s, p.x, p.y, kind === 'feather' ? '#ffda75' : kind === 'chime' ? '#9bf7ec' : '#b7f5ff', 14);
  });
}
export function gustAt(x: number, time: number) {
  const phase = (time + x * 0.002) % 4.5;
  return { phase, warning: phase < 1, active: phase >= 1 && phase < 2.1 };
}
export function nextObjective(s: Run) {
  const level = COURSES[s.stage];
  const options = [
    ...level.owlets.flatMap((p, i) =>
      s.owls[i] ? [] : [{ ...relicAt(level, p, s.time), kind: 'owl' as const }],
    ),
    ...level.chimes.flatMap((p, i) =>
      s.chimes[i] ? [] : [{ ...relicAt(level, p, s.time), kind: 'chime' as const }],
    ),
  ];
  return (
    options.sort((a, b) => Math.abs(a.x - s.x) - Math.abs(b.x - s.x))[0] ?? {
      x: level.end,
      y: level.ledges.filter((p) => p.kind !== 'perch').at(-1)!.y,
      kind: 'nest' as const,
    }
  );
}
export function step(s: Run, input: Controls, dt: number) {
  if (!Number.isFinite(dt) || dt <= 0 || dt > 0.04) return;
  s.time += dt;
  for (const p of s.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 95 * dt;
    p.life -= dt;
  }
  s.particles = s.particles.filter((p) => p.life > 0);
  if (s.won) {
    s.arrival += dt;
    return;
  }
  s.elapsed += dt;
  s.dropTime = Math.max(0, s.dropTime - dt);
  s.buffer = Math.max(0, s.buffer - dt);
  s.land = Math.max(0, s.land - dt);
  s.respawnGlow = Math.max(0, s.respawnGlow - dt);
  s.gustRest = Math.max(0, s.gustRest - dt);
  s.feedbackTime = Math.max(0, s.feedbackTime - dt);
  const level = COURSES[s.stage],
    axis = clamp(input.axis || 0, -1, 1),
    oldX = s.x;
  for (let i = 0; i < s.crumbles.length; i++) s.crumbles[i] = Math.max(0, s.crumbles[i] - dt);
  if (s.ground >= 0) {
    const ledge = level.ledges[s.ground],
      p = ledgeAt(ledge, s.time),
      before = ledgeAt(ledge, s.time - dt);
    s.x += p.x - before.x;
    s.y = p.y;
    if (
      s.x < p.x - 7 ||
      s.x > p.x + p.width + 7 ||
      (s.crumbles[s.ground] > 0 && s.crumbles[s.ground] < 1.75)
    ) {
      s.ground = -1;
      s.grace = 0.12;
    } else {
      s.grace = 0.12;
      s.used = false;
    }
  } else s.grace = Math.max(0, s.grace - dt);
  if (s.buffer > 0 && s.grace > 0) {
    const spring = s.ground >= 0 && level.ledges[s.ground].kind === 'spring';
    s.vy = spring ? -635 : -462;
    s.ground = -1;
    s.grace = s.buffer = 0;
    scatter(s, s.x, s.y, spring ? '#acffe6' : '#ebd7a3', spring ? 12 : 4);
  }
  if (axis) s.facing = axis > 0 ? 1 : -1;
  const active = s.ability > 0 ? s.abilityFriend : null;
  s.ability = Math.max(0, s.ability - dt);
  const target = axis * (active === 'lua' ? 230 : 210);
  if (active !== 'sparky') s.vx = approach(s.vx, target, (s.ground >= 0 ? 1450 : 850) * dt);
  if (active === 'sparky') s.vx = s.vx < 0 ? -350 : 350;
  const beforeY = s.y;
  if (active === 'becca') {
    const t = 1 - s.ability / 0.64;
    s.x = s.originX + (s.anchorX - s.originX) * t;
    s.y = s.originY + (s.anchorY - 24 - s.originY) * t - Math.sin(t * Math.PI) * 98;
    s.vy = t < 0.5 ? -130 : 130;
  } else {
    s.x += s.vx * dt;
    if (s.ground < 0) {
      if (active === 'boltbot') s.vy = Math.max(-380, s.vy - 530 * dt);
      else if (active === 'lua') s.vy = Math.min(38, s.vy + 440 * dt);
      else s.vy = Math.min(640, s.vy + (!input.heldJump && s.vy < 0 && !active ? 2000 : 1060) * dt);
      s.y += s.vy * dt;
    }
  }
  s.x = clamp(s.x, 12, level.end + 60);
  s.travel += Math.abs(s.x - oldX);
  if (s.ground < 0 && s.vy >= 0 && active !== 'becca') {
    let ground = -1,
      top = Infinity;
    level.ledges.forEach((ledge, i) => {
      const p = ledgeAt(ledge, s.time),
        previous = ledgeAt(ledge, s.time - dt);
      if ((ledge.kind === 'perch' && s.dropTime > 0) || (s.crumbles[i] > 0 && s.crumbles[i] < 1.75)) return;
      if (
        s.x >= p.x - 7 &&
        s.x <= p.x + p.width + 7 &&
        beforeY <= previous.y + 3 &&
        s.y >= p.y &&
        p.y < top
      ) {
        ground = i;
        top = p.y;
      }
    });
    if (ground >= 0) {
      s.ground = ground;
      s.y = top;
      s.vy = 0;
      s.land = 0.14;
      s.used = false;
      s.ability = 0;
      s.grace = 0.12;
      if (level.ledges[ground].kind === 'crumble' && s.crumbles[ground] === 0) s.crumbles[ground] = 2.5;
      if (level.saves.includes(ground) && ground > s.checkpoint) {
        s.checkpoint = ground;
        s.revision++;
        feedback(s, 'save');
      }
      scatter(s, s.x, top, '#eee1ae', 4);
    }
  }
  for (const x of level.gusts)
    if (Math.abs(x - s.x) < 27 && gustAt(x, s.time).active && s.gustRest === 0 && s.ground < 0) {
      s.vy = Math.min(s.vy, -308);
      s.gustRest = 0.85;
      feedback(s, 'gust');
      scatter(s, s.x, s.y, '#d8f8ef', 8);
    }
  if (s.y > 435) {
    respawn(s);
    return;
  }
  takeItems(s, 'owl');
  takeItems(s, 'feather');
  takeItems(s, 'chime');
  s.nearNest = Math.abs(s.x - level.end) < 55;
  if (s.nearNest && s.ground >= 0 && s.owls.every(Boolean) && s.chimes.every(Boolean)) {
    s.won = true;
    s.revision++;
    feedback(s, 'finish');
    scatter(s, s.x, s.y - 25, '#ffec9a', 24);
  }
  s.sample -= dt;
  if (s.sample <= 0) {
    s.sample = 0.09;
    s.trail.unshift({ x: s.x, y: s.y - 30 });
    if (s.trail.length > 28) s.trail.pop();
  }
}
