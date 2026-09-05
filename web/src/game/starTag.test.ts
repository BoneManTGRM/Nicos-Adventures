import { describe, expect, it } from 'vitest';
import { createTagState, emptyArenaInput, stepTag, blocked, homePath, homeFree, moveHome, distance } from './starTag';

describe('Star Tag real-time simulation', () => {
  it('waits for explicit start and pauses without advancing time or projectiles', () => {
    const s = createTagState(); const initial = JSON.stringify(s);
    stepTag(s, { ...emptyArenaInput(), fire: true, forward: 1 }, .05);
    expect(JSON.stringify(s)).toBe(initial);
    s.status = 'paused'; const paused = JSON.stringify(s);
    stepTag(s, { ...emptyArenaInput(), fire: true }, .05); expect(JSON.stringify(s)).toBe(paused);
  });
  it('moves and shoots only while playing', () => {
    const s = createTagState(); s.status = 'playing';
    stepTag(s, { ...emptyArenaInput(), forward: 1, fire: true }, .05);
    expect(s.player.z).toBeLessThan(7); expect(s.distance).toBeGreaterThan(0); expect(s.shotsFired).toBe(1);
  });
  it('normalizes diagonal movement and prevents walking through arena walls', () => {
    const a = createTagState(), b = createTagState(); a.status = b.status = 'playing';
    stepTag(a, { ...emptyArenaInput(), forward: 1 }, .05); stepTag(b, { ...emptyArenaInput(), forward: 1, side: 1 }, .05);
    expect(a.distance).toBeCloseTo(b.distance, 5);
    a.player = { x: 10, z: 7 };
    for (let i = 0; i < 100; i++) stepTag(a, { ...emptyArenaInput(), side: 1 }, .05);
    expect(a.player.x).toBeLessThan(10.2); expect(blocked(a.player)).toBe(false);
  });
  it('caps long frame delays and rejects nonfinite time', () => {
    const s = createTagState(); s.status = 'playing';
    stepTag(s, emptyArenaInput(), NaN); expect(s.time).toBe(0);
    stepTag(s, emptyArenaInput(), 999); expect(s.time).toBeCloseTo(.05);
  });
  it('consumes healing crystals only once and caps shield at 100', () => {
    const s = createTagState(); s.status = 'playing'; s.player = { x: -8, z: 4 }; s.shield = 90;
    stepTag(s, emptyArenaInput(), .01); expect(s.shield).toBe(100); expect(s.score).toBe(20);
    stepTag(s, emptyArenaInput(), .01); expect(s.score).toBe(20); expect(s.crystals).toHaveLength(1);
  });
  it('uses a dash cooldown rather than allowing an unlimited speed boost', () => {
    const s = createTagState(); s.status = 'playing';
    for (let i = 0; i < 30; i++) stepTag(s, { ...emptyArenaInput(), dash: true }, 1 / 60);
    expect(s.dashCooldown).toBeGreaterThan(2); expect(s.dashCooldown).toBeLessThan(2.6);
  });
  it('stops hostile bubbles at cover and prevents damage through walls', () => {
    const s = createTagState(); s.status = 'playing'; s.player = { x: 5, z: 2.3 };
    s.shots.push({ id: 999, x: 5, z: -2.5, vx: 0, vz: 8, life: 2, friendly: false });
    for (let i = 0; i < 60; i++) stepTag(s, emptyArenaInput(), 1 / 60);
    expect(s.shots.some(p => p.id === 999)).toBe(false); expect(s.shield).toBe(100);
  });
  it('supports an entire three-wave run using ordinary player inputs', () => {
    const s = createTagState(); s.status = 'playing';
    for (let i = 0; i < 24000 && s.status === 'playing'; i++) {
      const target = [...s.monsters].sort((a, b) => distance(a, s.player) - distance(b, s.player))[0];
      if (!target) { stepTag(s, emptyArenaInput(), 1 / 60); continue; }
      const angle = Math.atan2(target.x - s.player.x, -(target.z - s.player.z));
      const error = Math.atan2(Math.sin(angle - s.yaw), Math.cos(angle - s.yaw));
      stepTag(s, { turn: Math.max(-1, Math.min(1, error * 25)), forward: distance(target, s.player) < 2.3 ? -1 : 0, side: .35, fire: Math.abs(error) < .14, dash: distance(target, s.player) < 1.5 }, 1 / 60);
    }
    expect(s.status).toBe('won'); expect(s.wave).toBe(3); expect(s.tags).toBe(15); expect(s.score).toBeGreaterThan(900);
    const terminal = JSON.stringify(s); stepTag(s, { ...emptyArenaInput(), fire: true }, .05); expect(JSON.stringify(s)).toBe(terminal);
  });
  it('provides a clean restart without reusing prior score or projectile state', () => {
    const s = createTagState(); s.status = 'playing'; stepTag(s, { ...emptyArenaInput(), fire: true }, .05);
    const next = createTagState(); expect(next.score).toBe(0); expect(next.shots).toHaveLength(0); expect(next.shield).toBe(100); expect(next.monsters).toHaveLength(4);
  });
});

describe('living home navigation', () => {
  it('keeps movement in the room and blocks furniture', () => {
    const p = moveHome({ x: 92, z: 90 }, 20, 20); expect(p).toEqual({ x: 92, z: 90 });
    expect(homeFree({ x: 23, z: 51 })).toBe(false);
    const near = moveHome({ x: 23, z: 58 }, 0, -2); expect(near.z).toBe(58);
  });
  it('finds reachable paths to all five activities from all initial characters', () => {
    for (const start of [{ x: 44, z: 80 }, { x: 24, z: 72 }, { x: 68, z: 84 }]) {
      for (const target of [{ x: 12, z: 68 }, { x: 28, z: 64 }, { x: 52, z: 60 }, { x: 80, z: 68 }, { x: 48, z: 76 }]) {
        const path = homePath(start, target); expect(path.length).toBeGreaterThan(0); expect(path.every(homeFree)).toBe(true); expect(distance(path.at(-1)!, target)).toBeLessThan(4);
        for (let i = 1; i < path.length; i++) expect(distance(path[i], path[i - 1])).toBe(4);
      }
    }
  });
});
