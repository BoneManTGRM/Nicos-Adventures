/* Ring official. His count follows the bout clock, including interrupted covers. */
(() => {
  'use strict';
  const frames = [[3,3,144,253],[153,3,169,254],[328,3,173,252],[507,3,196,255],[3,264,203,204],[212,264,209,246],[427,264,247,162],[680,264,210,239],[3,516,217,248],[226,516,224,248],[456,516,158,264],[620,516,178,272]];
  const sprite=new Image();
  sprite.decoding='async';
  sprite.src='ring-referee.webp';
  const ready=()=>sprite.complete&&sprite.naturalWidth>0;
  const poses={watch:0,stepLeft:1,stepRight:2,bell:3,drop:4,raise:5,slap:6,one:7,two:8,three:9,nearFall:10,winner:11};
  const scale=114/frames[0][3];
  const anchors=[.48,.49,.49,.31,.43,.43,.40,.45,.45,.45,.47,.36];
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const step=(from,to,amount)=>from+clamp(to-from,-amount,amount);

  class LuchaOfficial{
    constructor(){
      this.x=385;this.y=286;this.face=1;this.side=-1;this.stride=0;this.lastTime=0;
      this.pinX=400;this.count=0;this.nearUntil=-1;
    }
    notice(event,arg,bout){
      if(event==='pin'){
        this.pinX=bout.pin.def.x;this.count=0;this.nearUntil=-1;
      }else if(event==='count')this.count=arg;
      else if(event==='kickout')this.nearUntil=bout.time+.72;
    }
    countPose(age){
      const beat=LuchaBout.countInterval,phase=(age-this.count*beat)/beat;
      if(this.count===0&&age<.31)return poses.drop;
      if(this.count>0&&phase<.15)return poses.slap;
      if(this.count>0&&phase<.60)return poses.one+this.count-1;
      return phase<.89?poses.raise:poses.drop;
    }
    draw(ctx,bout,finishSeconds,motion){
      const finishing=bout.mode==='end',now=bout.time+(finishing?finishSeconds:0);
      const dt=clamp(now-this.lastTime,0,.09);this.lastTime=now;
      const close=!!bout.pin||finishing,near=bout.time<this.nearUntil&&!close;
      const midpoint=(bout.hero.x+bout.rival.x)/2;
      const target=close||near?this.pinX:midpoint;
      // Switch sides near the ropes to leave room for the official and his raised hand.
      if(target<215)this.side=1;
      else if(target>585)this.side=-1;
      const destination=clamp(target+this.side*(close?110:104),63,737);
      const oldX=this.x;
      this.x=motion?step(this.x,destination,(close?530:148)*dt):destination;
      const signalWinner=finishing&&finishSeconds>=.75;
      const mat=close&&!signalWinner;
      this.y=motion?step(this.y,mat?337:286,190*dt):(mat?337:286);
      if(Math.abs(target-this.x)>8)this.face=target>this.x?1:-1;
      const distance=Math.abs(oldX-this.x);this.stride+=distance;
      let cel=poses.watch;
      if(finishing){
        cel=finishSeconds<.13?poses.slap:signalWinner?poses.winner:poses.three;
      }else if(bout.pin){
        cel=this.countPose(bout.pin.t);
      }else if(near&&this.count>0){
        cel=this.count===2?poses.nearFall:poses.one;
      }else if(bout.mode==='intro'||bout.time<2.23){
        cel=bout.time<.88?poses.watch:poses.bell;
      }else if(motion&&distance>.12){
        cel=Math.floor(this.stride/19)%2?poses.stepLeft:poses.stepRight;
      }
      if(!ready()){
        window.drawReferee(ctx,{x:this.x,y:this.y,time:now,count:this.count,pinning:mat,motion});return;
      }
      const [sx,sy,sw,sh]=frames[cel],height=sh*scale,width=sw*scale;
      const walk=cel===poses.stepLeft||cel===poses.stepRight;
      const lift=motion?(walk?Math.abs(Math.sin(this.stride*Math.PI/19))*1.7:cel===poses.watch?Math.sin(now*3.5)*.55:0):0;
      ctx.save();ctx.translate(this.x,this.y);ctx.scale(this.face,1);
      ctx.fillStyle='rgba(29,38,39,.23)';ctx.beginPath();ctx.ellipse(0,1.1,mat?27:18,3.3,0,0,Math.PI*2);ctx.fill();
      ctx.drawImage(sprite,sx,sy,sw,sh,-width*anchors[cel],-height-lift,width,height);
      ctx.restore();
    }
  }
  window.LuchaOfficial=LuchaOfficial;
})();
