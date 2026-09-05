import { describe, expect, it } from 'vitest';
import { busy, cameraFor, companionPositions, createMapState, destination, distance, findPath, frameDue, FRAME_MS, missionIds, pauseMap, progress, ROSTER, screenToWorld, selectFriend, STOPS, stepMap, TOKENS, walkable } from './simulation';
const idle = () => ({ x: 0, y: 0, interact: false });
function walkTo(s: ReturnType<typeof createMapState>, p: { x: number; y: number }) {
  destination(s, p); let frames = 0;
  while (s.path.length && frames++ < 2000) stepMap(s, idle(), 1 / 30);
  expect(s.path).toHaveLength(0); expect(distance(s.player, p)).toBeLessThan(12);
}
describe('lightweight Nico and friends map', () => {
  it('never renders above the cap on 60, 90, 120 or 144 Hz callbacks', () => {
    for (const hz of [60, 90, 120, 144]) {
      let last = 0, frames = 0;
      for (let tick = 1; tick <= hz * 10; tick++) { const now = tick * 1000 / hz; if (frameDue(now, last)) { frames++; last = now; } }
      expect(frames).toBeLessThanOrEqual(301);
    }
    expect(walkable({ x: 645, y: 555 })).toBe(false);
    expect(walkable({ x: 524, y: 620 })).toBe(false);
    const team = companionPositions(createMapState());
    expect(team.every(p => walkable(p))).toBe(true);
    expect(distance(team[0], team[1])).toBeGreaterThan(40);
  });
  it('is idle on start, pauses without advancing, and has a 30 FPS cap', () => {
    const s = createMapState(), before = JSON.stringify(s);
    stepMap(s, { x: 1, y: 0, interact: true }, 1); expect(JSON.stringify(s)).toBe(before);
    s.status = 'playing'; expect(busy(s, idle())).toBe(false); expect(FRAME_MS).toBeCloseTo(33.333, 2);
    pauseMap(s); const paused = JSON.stringify(s); stepMap(s, { x: 1, y: 1, interact: true }, 1);
    expect(JSON.stringify(s)).toBe(paused); expect(busy(s, idle())).toBe(false);
  });
  it('walks with normalized diagonals and blocks the ocean and buildings', () => {
    expect(walkable({ x: 30, y: 800 })).toBe(false); expect(walkable({ x: 1200, y: 240 })).toBe(false);
    const a = createMapState(), b = createMapState(); a.status = b.status = 'playing';
    stepMap(a, { x: 1, y: 0, interact: false }, 1 / 30); stepMap(b, { x: 1, y: 1, interact: false }, 1 / 30);
    expect(a.traveled).toBeCloseTo(b.traveled, 5);
    for (let i = 0; i < 1000; i++) stepMap(a, { x: 0, y: 1, interact: false }, 1 / 30);
    expect(walkable(a.player)).toBe(true); expect(a.player.y).toBeLessThan(900);
  });
  it('drops long background time and rejects invalid input', () => {
    const s = createMapState(); s.status = 'playing'; stepMap(s, idle(), NaN); expect(s.time).toBe(0);
    stepMap(s, { x: Infinity, y: NaN, interact: false }, 200); expect(s.time).toBe(.05); expect(s.traveled).toBe(0);
    expect(findPath(s.player, { x: NaN, y: 3 })).toEqual([]);
  });
  it('reaches every activity from every other activity using normal paths', () => {
    for (const from of STOPS) for (const to of STOPS) {
      const s = createMapState(); s.status = 'playing'; s.player = { x: from.x, y: from.y };
      walkTo(s, to); expect(s.trail.length).toBeLessThanOrEqual(90);
    }
  });
  it('completes all five activities, eight collectibles and five playable friends', () => {
    const s = createMapState(); s.status = 'playing';
    for (const [i, stop] of STOPS.entries()) {
      selectFriend(s, ROSTER[i]); walkTo(s, stop);
      stepMap(s, { ...idle(), interact: true }, 1 / 30);
      for (let n = 0; n < 42; n++) stepMap(s, idle(), 1 / 30);
      expect(s.completed).toContain(stop.id); expect(s.greeted).toContain(ROSTER[i]);
    }
    for (const token of TOKENS) walkTo(s, token);
    expect(s.collected).toHaveLength(8); expect(s.completed).toHaveLength(5); expect(s.greeted).toHaveLength(5);
    for (const mode of ['explore', 'stars', 'parade'] as const) { s.mode = mode; expect(progress(s).count).toBe(progress(s).total); }
    expect(new Set(missionIds(s)).size).toBe(18);
    const loaded = createMapState(missionIds(s)); expect(loaded.completed).toEqual(s.completed); expect(loaded.collected.length).toBe(8);
    expect(companionPositions(s)).toHaveLength(5); expect(companionPositions(s).every(p => walkable(p))).toBe(true);
  });
  it('manual movement cancels a route and an activity, without awarding incomplete work', () => {
    const s = createMapState(); s.status = 'playing'; walkTo(s, STOPS[0]);
    stepMap(s, { ...idle(), interact: true }, .03); expect(s.action).not.toBeNull();
    stepMap(s, { x: 1, y: 0, interact: false }, .03); expect(s.action).toBeNull(); expect(s.completed).toHaveLength(0);
    destination(s, STOPS[4]); expect(s.path.length).toBeGreaterThan(0);
    stepMap(s, { x: 1, y: 0, interact: false }, .03); expect(s.path).toHaveLength(0);
  });
  it('does not duplicate activity or star IDs on a replay', () => {
    const s = createMapState(); s.status = 'playing'; walkTo(s, STOPS[0]);
    for (let round = 0; round < 2; round++) { stepMap(s, { ...idle(), interact: true }, .03); for (let i = 0; i < 50; i++) stepMap(s, idle(), .03); }
    expect(s.completed).toEqual(['garden']); expect(s.greeted).toEqual(['nico']);
    walkTo(s, TOKENS[0]); const count = s.collected.length; stepMap(s, idle(), .03); expect(s.collected.length).toBe(count);
  });
  it('maps touch coordinates back to the same world point at phone and desktop sizes', () => {
    for (const width of [320, 390, 1024]) for (const overview of [false, true]) {
      const v = cameraFor({ x: 840, y: 450 }, width, 530, overview);
      const p = { x: 820, y: 475 };
      const screen = { x: (p.x - v.x) * v.scale, y: (p.y - v.y) * v.scale };
      const result = screenToWorld(v, screen); expect(result.x).toBeCloseTo(p.x); expect(result.y).toBeCloseTo(p.y);
    }
  });
});
