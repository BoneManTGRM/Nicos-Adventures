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
  it('rotates into the aerial special and unwinds through touchdown',()=>{
    const city=newCity(0,'easy',monster),a=city.actor;
    press(city,'jump');
    for(let i=0;i<30;i++)step(city,{...idle,jump:true},dt);
    press(city,'attack');
    const pitch=[],wings=[];
    let landed=false;
    for(let i=0;i<180;i++){
      step(city,idle,dt);
      const pose=jointPose(a,monster,city.time);
      pitch.push(pose.root.angle);wings.push(pose.wing.angle);
      if(a.splashPose>0)landed=true;
      if(i)expect(Math.abs(pitch[i]-pitch[i-1])).toBeLessThan(.24);
    }
    expect(landed).toBe(true);
    expect(Math.max(...pitch)).toBeGreaterThan(monster==='nacho'?1.35:.60);
    expect(pitch.at(-1)).toBeLessThan(.01);
    if(monster==='skullwing')expect(Math.max(...wings)-Math.min(...wings)).toBeGreaterThan(.08);
  });

});

describe('Nacho eating a vehicle',()=>{
  it.each([
    ['car',1,false],['car',-1,true],['tank',1,true],['tank',-1,false]
  ])('lowers the %s in front of his face and returns both elbows to guard (%i, walking %s)',(kind,facing,walking)=>{
    const s=newCity(0,'easy','nacho'),a=s.actor,car=s.cars[0];
    Object.assign(car,{type:kind,width:kind==='tank'?62:44});
    a.face=a.yaw=facing;
    a.x=car.x-facing*28;
    const moving=walking?(facing===1?right:left):idle;
    press(s,'grab');press(s,'extra');
    for(let i=0;i<60&&a.haul.phase==='lift';i++)step(s,moving,dt);
    expect(a.haul.phase).toBe('eat');
    let previous,atBite;
    for(let i=0;i<88;i++){
      const {limbs}=jointPose(a,'nacho',s.time);
      const arms=limbs.map(limb=>limb.arm);
      if(previous){
        for(const [side,arm] of arms.entries()){
          const prior=previous[side];
          expect(Math.hypot(arm.mid.x-prior.mid.x,arm.mid.y-prior.mid.y)).toBeLessThan(7);
          expect(Math.hypot(arm.mid.x-arm.start.x,arm.mid.y-arm.start.y)).toBeGreaterThan(15);
        }
      }
      if(i===22){
        const carPos=carryAnchor(a);
        expect((carPos.x-a.x)*facing-car.width*.46).toBeGreaterThan(9);
      }
      if(a.haul?.bit&&!atBite)atBite=arms;
      previous=arms;step(s,moving,dt);
    }
    expect(atBite).toBeDefined();
    const [guide,support]=atBite;
    expect(support.mid.y).toBeGreaterThan(support.start.y+8);
    expect(guide.end.y).toBeGreaterThan(support.end.y+14);
    expect(a.haul).toBeNull();expect(s.score).toBe(125);
  });
});
