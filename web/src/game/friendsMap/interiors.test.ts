import { describe, expect, it } from 'vitest';
import { atWorkstation, claimRoomTreasure, createInterior, enterInterior, indoorFriends, interiorMissions, leaveInterior, openRoomPuzzle, playPuzzle, replayPuzzle, roomAction, roomBusy, roomCamera, roomDestination, ROOM_IDS, ROOM_PARTS, roomPath, roomWalkable, stepInterior, stopInterior, WORKSTATION } from './interiors';
import type { InteriorState } from './interiors';
const input = () => ({ x: 0, y: 0, interact: false });
const routes = { garden: [0,0,1,1,2,2], workshop: [0,1,1,1,2,2], treehouse: [2,0,1], castle: [1,0,2,1], observatory: [0,1,2,3,4] };
function walk(s: InteriorState, p: {x: number;y: number}) {
  roomDestination(s, p); let n = 0; while (s.path.length && n++ < 1000) stepInterior(s, input(), 1/30);
  expect(s.path).toHaveLength(0); expect(Math.hypot(p.x-s.player.x, p.y-s.player.y)).toBeLessThan(12);
}
describe('enterable buildings', () => {
  it.each(ROOM_IDS)('lets all friends walk, gather supplies and solve %s', room => {
    const s = createInterior(); enterInterior(s, room);
    expect(openRoomPuzzle(s)).toBe(false);
    for (const p of ROOM_PARTS) walk(s,p);
    expect(s.found).toHaveLength(2); walk(s, WORKSTATION); expect(atWorkstation(s)).toBe(true);
    expect(openRoomPuzzle(s)).toBe(true);
    for (const n of routes[room]) playPuzzle(s,n);
    expect(s.puzzle.solved).toBe(true); expect(s.completed).toEqual([room]);
    for (const leader of ['nico','becca','lua','boltbot','sparky'] as const) expect(indoorFriends(s,leader).every(roomWalkable)).toBe(true);
    const revision = s.revision; playPuzzle(s,0); expect(s.revision).toBe(revision);
    replayPuzzle(s); for (const n of routes[room]) playPuzzle(s,n); expect(s.revision).toBe(revision);
    leaveInterior(s); expect(s.room).toBeNull(); expect(s.path).toHaveLength(0);
  });
  it('makes all points reachable around furniture and prevents escape through walls', () => {
    const s = createInterior(); enterInterior(s, 'workshop');
    for (const start of [{x:320,y:422}, ...ROOM_PARTS, WORKSTATION]) for (const goal of [...ROOM_PARTS,WORKSTATION]) { s.player={...start}; walk(s,goal); }
    for(let i=0;i<600;i++) stepInterior(s,{x:-1,y:-1,interact:false},1/30);
    expect(roomWalkable(s.player)).toBe(true); expect(s.player.x).toBeGreaterThanOrEqual(56);
    expect(roomWalkable({x:100,y:200})).toBe(false);
  });
  it('remains idle and drops invalid or background time', () => {
    const s = createInterior(); enterInterior(s,'garden'); expect(roomBusy(s,input())).toBe(false);
    stepInterior(s,input(),NaN); expect(s.time).toBe(0); stepInterior(s,input(),100); expect(s.time).toBe(.05);
    roomAction(s); expect(s.path.length).toBeGreaterThan(0); stopInterior(s); expect(roomBusy(s,input())).toBe(false);
    expect(roomPath(s.player,{x:NaN,y:0})).toEqual([]);
  });
  it('does not advance the character while a puzzle is open', () => {
    const s=createInterior(); enterInterior(s,'garden'); s.player={...WORKSTATION}; s.found=[0,1]; openRoomPuzzle(s);
    const previous={...s.player}; for(let i=0;i<30;i++) stepInterior(s,{x:1,y:1,interact:true},.03);
    expect(s.player).toEqual(previous); expect(roomBusy(s,{x:1,y:1,interact:false})).toBe(false);
  });
  it('rejects wrong choices without awarding a badge', () => {
    const s=createInterior(); enterInterior(s,'castle'); s.found=[0,1]; s.player={...WORKSTATION}; openRoomPuzzle(s);
    playPuzzle(s,0); expect(s.puzzle.mistakes).toBe(1); expect(s.puzzle.step).toBe(0); expect(s.completed).toHaveLength(0);
    const p=JSON.stringify(s.puzzle); playPuzzle(s,99); playPuzzle(s,NaN); playPuzzle(s,-1); expect(JSON.stringify(s.puzzle)).toBe(p);
  });
  it('awards the team treasure once, only after all five room badges', () => {
    const s=createInterior(); expect(claimRoomTreasure(s)).toBe(false);
    for(const room of ROOM_IDS) { enterInterior(s,room); s.found=[0,1]; s.player={...WORKSTATION}; openRoomPuzzle(s); for(const n of routes[room])playPuzzle(s,n); }
    expect(claimRoomTreasure(s)).toBe(true); expect(claimRoomTreasure(s)).toBe(false);
    expect(interiorMissions(s)).toHaveLength(6); expect(new Set(interiorMissions(s)).size).toBe(6);
    const loaded=createInterior(interiorMissions(s)); expect(loaded.completed).toEqual(s.completed); expect(loaded.claimed).toBe(true); expect(loaded.room).toBeNull();
  });
  it('keeps pre-existing outdoor saves and unknown ledger entries intact', () => {
    const ledger=['friends-map:stop:garden','friends-map:friend:nico','other:mission']; const s=createInterior(ledger);
    expect(s.completed).toHaveLength(0); expect(interiorMissions(s)).toEqual([]); expect(ledger).toHaveLength(3);
  });
  it('fits the complete room inside phone and landscape drawing buffers', () => {
    for(const [w,h] of [[390,445],[1024,640],[800,265]]) { const v=roomCamera(w,h); expect(640*v.scale).toBeLessThanOrEqual(w+.01); expect(500*v.scale).toBeLessThanOrEqual(h+.01); }
  });
});
