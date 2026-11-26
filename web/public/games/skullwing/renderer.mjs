import {drawAirRaid} from './air-raids.mjs';
import {drawStructure} from './demolition-art.mjs';
import {drawVehicle} from './vehicle-art.mjs';
import {SmashFX} from './smash-fx.mjs';
import {drawBackdrop,drawStreet} from './city-art.mjs';
import {drawRex} from './rex.mjs';
import {clamp} from './simulation.mjs';

export class Renderer {
  constructor(canvas,reduced) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
    this.reduced=reduced;this.smashFX=new SmashFX(reduced);this.reset();
  }
  reset(){this.smashFX.clear();this.camera=0;this.lift=0;this.shake=0;this.parts=[];this.rings=[];this.frame=0;this.foot=0;this.turnFace=1;}
  resize(){
    const box=this.canvas.getBoundingClientRect();if(!box.width||!box.height)return;
    const ratio=Math.min(window.devicePixelRatio||1,1.75);
    const w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
    this.scale=Math.min(box.width/318,Math.max(.80,box.height/303),2.22);
    this.width=box.width/this.scale;this.height=box.height/this.scale;
    this.pixel=this.canvas.width/this.width;
  }
  burst(x,y,count,type,dir=0){
    const colors=type==='chips'?['#f5bc77','#abadbc','#8e769e','#506685','#fce4a0']:
      type==='spark'?['#fff3ad','#ffaa5a','#ffd661']:['#dbc6ca','#8d8da6','#d3bdad'];
    const n=this.reduced?Math.ceil(count*.46):count;
    for(let i=0;i<n;i++){
      const dust=type==='dust',life=dust?.48+Math.random()*.43:.45+Math.random()*.8;
      this.parts.push({x,y,vx:(Math.random()-.5)*(dust?110:230)+dir*(dust?15:45),vy:30+Math.random()*(dust?75:190),life,max:life,
        size:dust?4+Math.random()*7:2+Math.random()*5,spin:(Math.random()-.5)*9,angle:Math.random()*6,color:colors[i%colors.length],type});
    }
    if(this.parts.length>205)this.parts.splice(0,this.parts.length-205);
  }
  event(e) {
    this.smashFX.reduced=this.reduced;
    this.smashFX.event(e);
    if(e.kind==='hit')this.shake=Math.max(this.shake,1.35);
    else if(e.kind==='collapse')this.shake=Math.max(this.shake,3.2);
    else if(e.kind==='floorImpact')this.shake=Math.max(this.shake,1.7);
    else if(e.kind==='vehicleExplosion')this.shake=Math.max(this.shake,e.type==='tank'?3.7:2.1);
    else if(e.kind==='stomp'||e.kind==='land'||e.kind==='leap'){
      this.burst(e.x,e.y+3,e.kind==='stomp'?22:7,'dust');
      if(e.kind==='stomp'){
        this.rings.push({x:e.x,y:e.y,age:0,max:.45,size:120,type:'floor'});
        this.shake=Math.max(this.shake,5);
      }
    }else if(e.kind==='swing')this.rings.push({x:e.x,y:e.y,dir:e.face,age:0,max:.22,size:35,type:'swipe'});
    else if(e.kind==='flap')this.rings.push({x:e.x,y:e.y,age:0,max:.38,size:65,type:'wind'});
    else if(e.kind==='aircraftHit'||e.kind==='aircraftBoltHit')this.burst(e.x,e.y,8,'spark',e.direction);
    else if(e.kind==='ricochet')this.burst(e.x,e.y,9,'spark');
    else if(e.kind==='roar')this.shake=Math.max(this.shake,3.5);
  }
  render(s,dt){
    const c=this.ctx,W=this.width,H=this.height;if(!W||!H)return;
    this.frame+=dt;const a=s.actor, look=W*.42-clamp(a.vx*.15,-27,27);
    const target=clamp(a.x-look,0,Math.max(0,s.length-W));
    this.camera+=(target-this.camera)*(1-Math.exp(-7.5*dt));
    const base=H*(H<W*.63?.84:.78);
    const up=Math.max(0,a.y+152+36-base);
    this.lift+=(up-this.lift)*(1-Math.exp(-11*dt));
    const ground=base+this.lift, camera=this.camera,t=s.time;
    this.shake=Math.max(0,this.shake-dt*15);
    c.setTransform(this.pixel,0,0,this.pixel,0,0);
    c.save();
    const shake=this.reduced?0:this.shake;
    c.translate(Math.sin(t*73)*shake*.62,Math.cos(t*88)*shake*.4);
    const v={district:s.district,width:W,height:H,ground,camera,time:t,levelWidth:s.length,reduced:this.reduced};
    drawBackdrop(c,v);drawStreet(c,v);
    c.save();c.translate(-camera,ground);
    for(const b of s.buildings){
      if(b.x+b.w+124<camera || b.x-b.w-124>camera+W) continue;
      c.save();c.translate(b.x,0);drawStructure(c,b,v);c.restore();
    }
    for(const car of s.cars){
      if(car.x>=camera-55&&car.x<=camera+W+55)drawVehicle(c,car,t,this.reduced);
    }
    drawAirRaid(c,s.airRaid,camera,W,t,this.reduced);
    const shadeHeight=a.support?.h||0;
    c.fillStyle='rgba(15,13,28,.37)';c.beginPath();c.ellipse(a.x,-shadeHeight+2,Math.max(11,40-(a.y-shadeHeight)*.09),5,0,0,Math.PI*2);c.fill();
    const foot=Math.floor(a.stride*1.14);
    if(foot!==this.foot && a.walk>.48 && a.grounded && !this.reduced)this.burst(a.x-a.face*13,a.y+3,3,'dust',-a.face);
    this.foot=foot;
    if(a.dive || a.glide>.35){
      const length=a.dive?35:22;
      c.save();c.strokeStyle='rgba(171,233,255,.46)';c.lineWidth=1.2;
      for(let i=0;i<4;i++){const ox=a.x-(27+i*6)*a.face,oy=-a.y-42-i*10;const wave=Math.sin(t*9+i)*4;
        c.beginPath();c.moveTo(ox,oy);c.quadraticCurveTo(ox-a.face*(11+wave),oy-(a.dive?24:3),ox-a.face*length,oy-(a.dive?45:1));c.stroke();}
      c.restore();
    }
    c.save();c.translate(a.x,-a.y);
    this.turnFace+=(a.face-this.turnFace)*(1-Math.exp(-17*dt));
    c.scale(.54+.46*Math.abs(this.turnFace)+a.land*.045,1-a.land*.07);
    drawRex(c,{time:t,walk:a.walk,facing:Math.sign(this.turnFace)||a.face,air:a.flight,slam:a.dive?1:a.land,swipe:a.swipe,roar:a.roar,charge:s.charge,reduced:this.reduced,glide:a.glide,flap:a.flap,stride:a.stride,hand:a.hand,slide:a.slide});
    c.restore();
    this.smashFX.draw(c,dt,v);
    for(const wave of s.waves){
      const r=Math.max(2,wave.age*470);
      c.save();c.globalAlpha=clamp(1-wave.age/.62,0,1);
      for(let i=0;i<3;i++){
        c.strokeStyle=['#dffcff','#a8a9ff','#f5ceff'][i];c.lineWidth=3-i*.55;
        c.beginPath();c.ellipse(wave.x,-wave.y,Math.max(1,r-i*8),Math.max(1,r*.62-i*5),0,0,Math.PI*2);c.stroke();
      }c.restore();
    }
    for(const ring of this.rings){
      const k=ring.age/ring.max;c.save();c.translate(ring.x,-ring.y);c.globalAlpha=1-k;
      c.lineWidth=2.6*(1-k)+.6;c.strokeStyle=ring.type==='floor'?'#ffe6a2':'#c1faff';
      if(ring.type==='swipe'){
        c.scale(ring.dir,1);for(let i=0;i<3;i++){c.beginPath();c.moveTo(-24+i*3,-23+i*8);c.quadraticCurveTo(23+k*12,-8+i*7,17+k*10,14+i*6);c.stroke();}
      }else{c.beginPath();c.ellipse(0,0,Math.max(1,ring.size*k),Math.max(1,ring.size*k*(ring.type==='floor'?.14:.29)),0,0,Math.PI*2);c.stroke();}
      c.restore();ring.age+=dt;
    }this.rings=this.rings.filter(r=>r.age<r.max);
    for(const p of this.parts){
      p.life-=dt;if(p.life<=0)continue;
      const dust=p.type==='dust';p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt;p.vy-=(dust?65:380)*dt;
      if(p.y<0){p.y=0;p.vy=Math.abs(p.vy)*.27;p.vx*=.72;}
      c.save();c.translate(p.x,-p.y);c.rotate(p.angle);c.fillStyle=p.color;
      c.globalAlpha=Math.min(1,p.life*4)*(dust?.42:1);
      if(dust){c.beginPath();c.ellipse(0,0,p.size*(1.9-p.life/p.max),p.size*.72,0,0,Math.PI*2);c.fill();}
      else{c.beginPath();c.moveTo(-p.size,0);c.lineTo(1,-p.size*.7);c.lineTo(p.size*.76,1);c.lineTo(0,p.size*.55);c.closePath();c.fill();}
      c.restore();
    }this.parts=this.parts.filter(p=>p.life>0);
    c.restore();c.restore();
  }
}
