import {describe,it,expect} from 'vitest';
import {newCity,press,step} from '../public/games/skullwing/simulation.mjs';
import {jointPose} from '../public/games/skullwing/jointed-motion.mjs';
import {carryAnchor} from '../public/games/skullwing/nacho-moves.mjs';

const idle={left:false,right:false};
const right={...idle,right:true};
const left={...idle,left:true};
const dt=1/120;

describe.each(['skullwing','nacho'])('%s limb motion',monster=>{
  it.each([false,true])('alternates planted and swinging feet while carrying a car (%s)',loaded=>{
    const city=newCity(0,'easy',monster),a=city.actor;
    if(loaded){
      press(city,monster==='nacho'?'grab':'extra');
      for(let i=0;i<65;i++)step(city,idle,dt);
      expect(a.haul?.phase).toBe('hold');
    }
    const tracks=[[],[]],contacts=[0,0];
    for(let i=0;i<195;i++){
      step(city,right,dt);
      if(i<70)continue;
      const joints=jointPose(a,monster,city.time);
      for(const [side,limb] of joints.limbs.entries()){
        const t=a.stride/(2*Math.PI)+(side===1?0:.5),phase=t-Math.floor(t);
        const ankle=limb.leg.end,foot={x:a.x+ankle.x,y:ankle.y,phase};
        const last=tracks[side].at(-1);
        if(last&&last.phase>.055&&last.phase<phase&&phase<.45){
          expect(Math.abs(foot.x-last.x)).toBeLessThan(.15);
          contacts[side]++;
        }
        tracks[side].push(foot);
      }
      if(loaded){
        const hand=carryAnchor(a);
        const wrists=joints.limbs.map(l=>l.arm.end);
        expect(Math.abs((wrists[0].x+wrists[1].x)/2-(hand.x-a.x))).toBeLessThan(6);
        expect(Math.abs((wrists[0].y+wrists[1].y)/2+hand.y-a.y)).toBeLessThan(6);
      }
    }
    for(const track of tracks)expect(Math.max(...track.map(f=>f.y))-Math.min(...track.map(f=>f.y))).toBeGreaterThan(12);
    expect(Math.min(...contacts)).toBeGreaterThan(24);
  });

  it('continues the step during a punch and turns through front-facing',()=>{
    const s=newCity(0,'easy',monster),a=s.actor;
    for(let i=0;i<65;i++)step(s,right,dt);
    press(s,'attack');
    const armX=[],initial=a.stride;
    for(let i=0;i<40;i++){
      step(s,right,dt);
      armX.push(jointPose(a,monster,s.time).limbs[1].arm.end.x);
    }
    expect(a.stride).toBeGreaterThan(initial+1);
    expect(Math.max(...armX)-Math.min(...armX)).toBeGreaterThan(30);
    const headings=[];
    for(let i=0;i<24;i++){step(s,left,dt);headings.push(a.yaw);}
    expect(headings.some(v=>Math.abs(v)<.11)).toBe(true);
    expect(headings.at(-1)).toBe(-1);
  });
});
