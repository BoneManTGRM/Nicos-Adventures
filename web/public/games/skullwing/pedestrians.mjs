// Times in seconds. The hand closes on the street before it lifts the person.
export const CONTACT = .16;
export const LIFT = .49;
export const BITE = .38;
export const RELEASE = .7;
export const BITE_POINTS = 75;

export function makePedestrians(buildings, district) {
  return buildings.map((b, i) => {
    const x = i === 0 ? 112 : b.x + (i % 2 ? -.21 : .26) * b.w;
    return {x, home: x, span: i === 0 ? 15 : 30, dir: i % 2 ? -1 : 1,
      style: (i + district) % 6, stride: i * 1.7, pace: 7 + i % 5, onStreet: true};
  });
}

export function grabTarget(s) {
  const a = s.actor;
  if (!a.grounded || a.support || a.dive || a.y > 3) return null;
  let target = null, distance = Infinity;
  for (const person of s.people) {
    const dx = (person.x - a.x) * a.face;
    if (!person.onStreet || dx < -4 || dx > 66) continue;
    const gap = Math.abs(dx - 32);
    if (gap < distance) { target = person; distance = gap; }
  }
  return target;
}

export function grabOrEat(s) {
  const grip = s.actor.grip;
  if (grip) {
    if (grip.phase === 'lift') grip.eatQueued = true;
    if (grip.phase === 'hold') { grip.phase = 'eat'; grip.age = 0; }
    return;
  }
  const person = grabTarget(s);
  if (!person) { s.events.push({kind: 'grabMiss'}); return; }
  person.onStreet = false;
  s.actor.grip = {person, phase: 'lift', age: 0, eatQueued: false};
  s.events.push({kind: 'grab'});
}

export function stepPedestrians(s, dt) {
  for (const p of s.people) {
    if (!p.onStreet) continue;
    const near = Math.abs(s.actor.x - p.x) < 110 && Math.abs(s.actor.vx) > 16;
    const speed = near ? p.pace * 3 : p.pace;
    p.x += p.dir * speed * dt;
    if (p.x >= p.home + p.span) { p.x = p.home + p.span; p.dir = -1; }
    if (p.x <= p.home - p.span) { p.x = p.home - p.span; p.dir = 1; }
    p.stride += dt * (near ? 13 : 5);
  }
  const g = s.actor.grip;
  if (!g || g.phase === 'hold') return;
  const previousAge = g.age;
  g.age += dt;
  if (g.phase === 'lift' && g.age >= LIFT) {
    g.phase = g.eatQueued ? 'eat' : 'hold'; g.age = 0;
  } else if (g.phase === 'eat') {
    if (previousAge < BITE && g.age >= BITE && !s.outcome && !s.finishWait) {
      const healed = !!s.defense && s.defense.hp < s.defense.maxHp;
      if (healed) s.defense.hp++;
      s.score += BITE_POINTS;
      s.events.push({kind: 'chomp', points: BITE_POINTS, healed});
    }
    if (g.age >= RELEASE) s.actor.grip = null;
  }
}
