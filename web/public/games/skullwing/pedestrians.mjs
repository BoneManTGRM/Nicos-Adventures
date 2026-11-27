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

export function stepPedestrians(s, dt) {
  for (const p of s.people) {
    if (!p.onStreet) continue;
    const near = Math.abs(s.actor.x - p.x) < 110 && Math.abs(s.actor.vx) > 16;
    const alarm=near||s.actor.dive||s.actor.roar>.65;
    p.panic=Math.max(0,(p.panic||0)-dt);
    if(alarm&&Math.abs(s.actor.x-p.x)<120)p.panic=.9;
    if(p.panic>0&&Math.abs(p.x-p.home)<p.span*.8)p.dir=Math.sign(p.x-s.actor.x)||p.dir;
    const speed = p.panic>0 ? p.pace * 3 : p.pace;
    p.x += p.dir * speed * dt;
    if (p.x >= p.home + p.span) { p.x = p.home + p.span; p.dir = -1; }
    if (p.x <= p.home - p.span) { p.x = p.home - p.span; p.dir = 1; }
    p.stride += dt * (p.panic>0 ? 13 : 5);
  }
}
