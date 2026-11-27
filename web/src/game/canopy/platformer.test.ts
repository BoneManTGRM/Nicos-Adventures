import { describe, expect, it } from 'vitest';
import { chapterKey, COURSES, ledgeAt, relicAt } from './levels';
import {
  changeLeader,
  count,
  dropPerch,
  jump,
  nextObjective,
  power,
  savedEvents,
  startRun,
  step,
} from './platformer';
import type { Run } from './platformer';
import { ROSTER } from '../friendsMap/simulation';
const frame = (s: Run, axis = 0, heldJump = true) => step(s, { axis, heldJump }, 1 / 120);
function walkToNest(stage: number) {
  const s = startRun(stage),
    level = COURSES[stage],
    main = level.ledges.filter((p) => p.kind !== 'perch');
  let goal = 0;
  for (let i = 0; i < 120 * 210 && !s.won; i++) {
    const p = ledgeAt(main[goal], s.time);
    let target = p.x + Math.min(48, p.width / 2);
    const tasks = [
      ...level.owlets.flatMap((r, n) => (r.ledge === goal && !s.owls[n] ? [r] : [])),
      ...level.chimes.flatMap((r, n) => (r.ledge === goal && !s.chimes[n] ? [r] : [])),
    ];
    if (tasks.length) {
      const item = relicAt(level, tasks[0], s.time);
      target = item.x;
      if (s.ground === goal && Math.abs(target - s.x) < 10 && tasks[0].rise > 50) jump(s);
    } else if (goal === main.length - 1) target = level.end;
    else if (s.ground === goal) {
      target = p.x + p.width + 12;
      if (s.x > p.x + p.width - 18) {
        jump(s);
        goal++;
      }
    } else if (s.ground >= 0 && s.ground < goal) {
      const prev = ledgeAt(main[s.ground], s.time);
      target = prev.x + prev.width + 12;
      if (s.x >= prev.x + prev.width - 18) jump(s);
    }
    if (s.ground >= main.length) dropPerch(s);
    const dx = target - s.x;
    frame(s, Math.abs(dx) < 3 ? 0 : Math.sign(dx));
    if (s.respawnGlow > 0.69) goal = s.checkpoint;
  }
  return s;
}
describe('Clockwork Canopy', () => {
  for (const [i, c] of COURSES.entries())
    it('rescues every chick and reaches the nest in ' + c.name[0] + ' using ordinary controls', () => {
      const s = walkToNest(i);
      expect({
        won: s.won,
        owls: s.owls,
        chimes: s.chimes,
        ground: s.ground,
        x: Math.round(s.x),
        falls: s.falls,
      }).toMatchObject({ won: true, owls: [true, true, true] });
      expect(savedEvents(s)).toContain(chapterKey(i) + ':home');
    });
  it('gives every friend a usable airborne move and prevents endless boosts by switching', () => {
    for (const f of ROSTER) {
      const s = startRun(0, [], f);
      jump(s);
      for (let n = 0; n < 16; n++) frame(s, 1);
      expect(power(s)).toBe(true);
      expect(s.abilityFriend).toBe(f);
      changeLeader(s, f === 'nico' ? 'lua' : 'nico');
      expect(power(s)).toBe(false);
      const before = { x: s.x, y: s.y };
      for (let n = 0; n < 20; n++) frame(s, 1);
      expect(Math.hypot(s.x - before.x, s.y - before.y)).toBeGreaterThan(12);
      expect(s.ground).toBe(-1);
    }
  });
  it('makes a held jump higher than a tap and accepts a buffered landing jump', () => {
    const high = startRun(0),
      low = startRun(0);
    jump(high);
    jump(low);
    for (let i = 0; i < 32; i++) {
      frame(high);
      frame(low, 0, false);
    }
    expect(high.y).toBeLessThan(low.y - 15);
    high.y = 322;
    high.vy = 100;
    high.ground = -1;
    high.grace = 0;
    jump(high);
    for (let i = 0; i < 12; i++) frame(high);
    expect(high.vy).toBeLessThan(0);
  });
  it('keeps rescued chicks and checkpoints when reopening and starts a completed trail fresh', () => {
    const s = startRun(0);
    for (let i = 0; i < 95; i++) frame(s, 1);
    expect(count(s.owls)).toBe(1);
    const events = [...savedEvents(s), chapterKey(0) + ':post3'];
    const loaded = startRun(0, events);
    expect(loaded.owls).toEqual(s.owls);
    expect(loaded.checkpoint).toBe(3);
    expect(loaded.resumed).toBe(true);
    loaded.y = 450;
    loaded.ground = -1;
    frame(loaded);
    expect(loaded.ground).toBe(3);
    expect(count(loaded.owls)).toBe(1);
    const replay = startRun(0, [...events, chapterKey(0) + ':home']);
    expect(count(replay.owls)).toBe(0);
    expect(replay.resumed).toBe(false);
  });
  it('points back to missing chicks at the nest and gives each golden feather a reachable perch', () => {
    for (let i = 0; i < 3; i++) {
      const s = startRun(i);
      s.x = COURSES[i].end;
      expect(nextObjective(s).x).toBeLessThan(s.x);
      for (const [n, r] of COURSES[i].feathers.entries()) {
        const p = relicAt(COURSES[i], r, 0);
        s.x = p.x;
        s.y = p.y + 24;
        s.ground = -1;
        frame(s);
        expect(s.feathers[n]).toBe(true);
      }
    }
  });
});
