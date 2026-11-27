import { describe, it, expect } from 'vitest';
import { advanceFlight, finaleUnlocked, flightMission, newFlight, PILOT_X, steer, usePower, VOYAGES } from './voyage';
import { createMapState, destination, distance, missionIds, moveSkill, pauseMap, SKY_BELLS, stepMap } from './simulation';

describe('Starwhale campaign', () => {
  for (const [i,chapter] of VOYAGES.entries()) it('can finish '+chapter.title[0]+' by steering and using the pilot’s power', () => {
    const s = newFlight(i,true);
    for (let tick=0;tick<5500 && s.result==='flying';tick++) {
      const target=s.objects.filter(o=>o.kind==='target' && o.x>=PILOT_X-.02 && (i!==4 || o.number===s.collected+1)).sort((a,b)=>a.x-b.x)[0];
      const storm=s.objects.find(o=>o.kind==='storm' && o.x>=PILOT_X-.065 && o.x<PILOT_X+.14);
      if(storm && (!target || target.x>PILOT_X+.22) && storm.lane===s.lane) steer(s,(s.lane+1)%3);
      else if (target && (!storm || target.lane!==storm.lane)) { steer(s,target.lane); if (target.x<PILOT_X+.25) usePower(s); }
      advanceFlight(s,1/30);
    }
    expect(s.result).toBe('won'); expect(s.collected).toBe(chapter.goal); expect(s.score).toBeGreaterThan(0);
    const final=JSON.stringify(s); advanceFlight(s,.03); expect(JSON.stringify(s)).toBe(final);
  });
  it('requires every individual beacon before the whale flight', () => {
    const ids=VOYAGES.slice(0,5).map((_,i)=>flightMission(i)); expect(finaleUnlocked(ids)).toBe(true);
    for(const id of ids)expect(finaleUnlocked(ids.filter(x=>x!==id))).toBe(false);
  });
  it('distinguishes storm damage in calm and wild skies, and respects shield and cooldown',()=>{
    for(const wild of [false,true]) {
      const s=newFlight(3,wild);s.nextWave=100;
      const cloud=()=>s.objects.push({id:12,kind:'storm',x:PILOT_X,lane:1,y:1,lit:false,number:0});
      expect(usePower(s)).toBe(true); expect(usePower(s)).toBe(false); cloud(); advanceFlight(s,.03); expect(s.hull).toBe(3);
      for(let i=0;i<3;i++){s.shield=0;s.hit=0;cloud();advanceFlight(s,.03);}
      expect(s.result).toBe(wild?'lost':'flying');
    }
  });
});
describe('island moves',()=>{
  it('rings each sky bell only while jumping and restores it from saved missions',()=>{
    const s=createMapState();s.status='playing';const idle={x:0,y:0,interact:false};
    for(const b of SKY_BELLS){
      destination(s,b);for(let i=0;i<2000&&s.path.length;i++)stepMap(s,idle,1/30);
      expect(distance(s.player,b)).toBeLessThan(20);expect(s.bells).not.toContain(b.id);
      moveSkill(s,'jump');for(let i=0;i<40;i++)stepMap(s,idle,1/30);expect(s.bells).toContain(b.id);
    }
    expect(createMapState(missionIds(s)).bells).toEqual(s.bells);
  });
  it('dashes along a selected route and cancels both moves on pause',()=>{
    const a=createMapState(),b=createMapState();a.status=b.status='playing';
    for(const s of [a,b])destination(s,SKY_BELLS[1]);moveSkill(a,'dash');moveSkill(a,'jump');
    for(let i=0;i<12;i++)for(const s of [a,b])stepMap(s,{x:0,y:0,interact:false},1/30);
    expect(a.traveled).toBeGreaterThan(b.traveled*1.3);pauseMap(a);expect(a.dashTime+a.jumpTime).toBe(0);
  });
});
