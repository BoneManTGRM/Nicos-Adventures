'use strict';
class LuchaBout {
  static countInterval=.92;
  constructor(round, emit=()=>{}, random=Math.random, options={}) {
    this.round=round; this.emit=emit; this.random=random; this.time=0; this.mode='intro'; this.intro=1.65;
    this.hero=this.fighter([0,4,5].includes(options.hero)?options.hero:0,253,1);
    this.rival=this.fighter([1,6,2,7,3][round]??1,546,-1);
    this.level=['family','arcade','legend'].includes(options.level)?options.level:'arcade';
    this.power={family:.68,arcade:1,legend:1.28}[this.level];
    this.energy=this.level==='family'?52:28; this.ropeUntil=0; this.pending=null;this.streak=0;this.chainUntil=0;
    this.stats={points:0,hits:0,throws:0,counters:0,springs:0,bestChain:0,specials:0};
    this.aiWait=0.8; this.wind=null; this.pin=null; this.toss=null; this.escapes=0;
  }
  fighter(id,x,face){return {id,x,face,hp:100,state:'idle',elapsed:0,duration:0,hit:false,cd:0,height:0,angle:0,steps:0,guardAge:0};}
  state(f,s,d=0){f.state=s;f.elapsed=0;f.duration=d;f.hit=false;}
  ready(f){return ['idle','walk','guard'].includes(f.state);}
  ground(f){return Math.max(62,Math.min(738,f));}
  energyBy(n){this.energy=Math.max(0,Math.min(100,this.energy+n));}
  approach(f,other,amount){const diff=other.x-f.x;f.x=this.ground(f.x+Math.sign(diff)*Math.min(amount,Math.max(0,Math.abs(diff)-51)));}
  byRopes(f=this.hero){return f.x<=151||f.x>=649;}
  springReady(){return this.byRopes()&&this.time>=this.ropeUntil;}
  reward(points){this.stats.points+=points;}
  startMove(f,name,other){
    if(!this.ready(f)||f.cd>0)return;
    if(other.state==='down'&&name!=='throw'){if(f===this.hero)this.emit('hint','down');return;}
    if(other.state==='down' && f===this.hero && name==='throw'){
      if(Math.abs(f.x-other.x)<=122){this.startPin(f,other);return;}
      this.emit('hint','closer');return;
    }
    if(name==='dive'){
      if(f===this.hero&&this.energy<100){
        if(this.springReady()){name='spring';this.ropeUntil=this.time+3.4;}
        else{this.emit('hint',this.byRopes()?'ropeWait':'charge');return;}
      }
      if(f===this.hero&&name==='dive')this.energy=0;
    }
    if(f===this.hero&&name==='throw'&&this.streak>=2&&this.time<this.chainUntil)name='combo';
    f.face=other.x>=f.x?1:-1;
    const speed=f===this.hero&&f.id===4?.88:1;
    this.state(f,name,{strike:.34,throw:.57,dive:.86,spring:.87,charge:.77,combo:.66}[name]*speed);
    f.origin=f.x; f.cd=f.duration+.055;
    if(name==='dive'||name==='spring'||name==='charge'){
      const limit=name==='charge'?230:name==='spring'?450:800;
      f.target=this.ground(f.x+f.face*Math.min(limit,Math.max(0,Math.abs(other.x-f.x)-24)));
      f.ropeX=f.x<400?62:738;
      this.emit(name==='spring'?'spring':name==='charge'?'rush':'air',f);
    }
  }
  action(name){
    if(this.mode==='pin' && this.pin.def===this.hero && name==='strike'){
      this.pin.taps++;if(this.pin.taps>=this.pin.needed && this.pin.t<2.83 && this.escapes<2){
        if(!this.pin.willEscape)this.escapes++;this.hero.hp=Math.max(this.hero.hp,25);this.endPin(false);
      } return;
    }
    if(this.mode==='fight'){
      if(!this.ready(this.hero)||this.hero.cd>0){this.pending={name,until:this.time+.17};return;}
      this.startMove(this.hero,name,this.rival);
    }
  }
  startPin(atk,def){this.wind=null;this.toss=null;this.pending=null;this.mode='pin';this.pin={atk,def,t:0,count:0,taps:0,needed:(this.level==='family'?2:this.level==='legend'?4:3)+Math.floor(this.round/2),willEscape:def.hp>19};
    atk.face=def.x>=atk.x?1:-1;atk.x=this.ground(def.x-atk.face*15);this.state(atk,'pin');this.state(def,'down',4);this.emit('pin',def===this.hero);}
  endPin(win){const {atk,def}=this.pin;this.pin=null;
    if(win){if(atk===this.hero)this.reward(250+this.round*50+Math.round(this.hero.hp*3));this.mode='end';this.state(atk,'win');this.emit('end',atk===this.hero);return;}
    this.state(def,'idle');this.state(atk,'hit',.42);atk.x=this.ground(atk.x-atk.face*73);this.mode='fight';this.aiWait=.8;this.emit('kickout',def===this.hero);}
  damage(atk,def,kind){
    if(def.state==='down'||def.state==='pin'||this.toss)return;
    const grapple=kind==='throw'||kind==='combo'||(kind==='dive'&&atk===this.hero&&atk.id===5);
    const guarded=def.state==='guard'&&!grapple;
    if(guarded){
      const perfect=def===this.hero&&def.guardAge<.26;
      if(def===this.hero)this.energyBy(perfect?26:10);
      if(perfect){
        this.state(atk,'hit',.65);this.state(def,'counter',.24);this.wind=null;
        this.stats.counters++;this.reward(140);atk.hp=Math.max(0,atk.hp-8);
        this.emit('counter',def);if(!atk.hp)this.down(atk);
      }else this.emit('block',def);
      return;
    }
    const base={strike:10,throw:19,dive:37,spring:17,charge:22,combo:29}[kind];
    const bonus=atk===this.hero?(atk.id===5&&grapple?5:atk.id===4&&kind==='spring'?6:0):0;
    const amount=atk===this.hero?base+bonus:Math.round(base*(.54+.085*this.round)*this.power);
    def.hp=Math.max(0,def.hp-amount);
    if(atk===this.hero){
      this.stats.hits++;this.reward(amount*4);this.energyBy(kind==='dive'?0:grapple?21:16);
      if(kind==='strike'){
        this.streak=this.time<=this.chainUntil?this.streak+1:1;this.chainUntil=this.time+1.65;
        this.stats.bestChain=Math.max(this.stats.bestChain,this.streak);
        if(this.streak===2)this.emit('chain',2);
      }else{
        if(kind==='combo'){this.stats.bestChain=Math.max(this.stats.bestChain,this.streak+1);this.reward(160);this.emit('combo',this.streak+1);}
        if(grapple)this.stats.throws++;
        if(kind==='dive'){this.stats.specials++;this.reward(120);}
        if(kind==='spring'){this.stats.springs++;this.reward(100);}
        this.streak=0;
      }
    }else{this.energyBy(7);this.streak=0;}
    if(def===this.rival)this.wind=null;this.emit('impact',{def,kind});
    if(grapple){
      const dir=atk.face,boost=kind!=='throw',duration=boost?.66:.53,land=this.ground(atk.x-dir*(boost?134:78));
      this.toss={atk,def,s:0,from:def.x,to:land,dir,duration,boost};
      this.state(def,'hit',duration);this.state(atk,kind==='combo'?'combo':'throw',duration);atk.hit=true;this.emit('toss',atk);return;
    }
    def.x=this.ground(def.x+atk.face*(kind==='dive'?49:13));def.height=0;def.angle=0;
    if(def.hp===0||kind==='dive'||kind==='spring'||kind==='charge'){this.down(def);}else this.state(def,'hit',.22);
  }
  down(f){this.state(f,'down',f.hp<=19?4.0:1.75);f.height=0;f.angle=0;if(f===this.rival)this.wind=null;this.emit('down',f===this.hero);}
  advance(f,other,dt){
    f.cd=Math.max(0,f.cd-dt);f.elapsed+=dt;
    if(this.toss&&(this.toss.def===f||this.toss.atk===f))return;
    const s=f.state,p=f.duration?Math.min(1,f.elapsed/f.duration):0;
    if(['strike','throw','combo','dive','spring','charge'].includes(s)){
      if(s==='dive'){f.x=f.origin+(f.target-f.origin)*p;f.height=(f.id===4?130:f.id===5?45:93)*Math.sin(Math.PI*p);}
      else if(s==='spring'){
        if(p<.23){f.x=f.origin+(f.ropeX-f.origin)*p/.23;f.height=32*p/.23;}
        else{const fly=(p-.23)/.77;f.x=f.ropeX+(f.target-f.ropeX)*fly;f.height=32*(1-fly)+111*Math.sin(Math.PI*fly);}
      }else if(s==='charge'){const slide=Math.max(0,(p-.22)/.78);f.x=f.origin+(f.target-f.origin)*slide;}
      else if(p<.37)this.approach(f,other, (s==='throw'?135:90)*dt);
      const when={strike:.34,throw:.42,combo:.42,dive:.80,spring:.83,charge:.75}[s],reach={strike:99,throw:94,combo:111,dive:145,spring:135,charge:112}[s];
      if(p>=when && !f.hit){f.hit=true;if(Math.abs(f.x-other.x)<=reach && other.height<50)this.damage(f,other,s);else if(f===this.hero)this.emit('hint','range');}
    }
    if(f.state!==s||this.toss)return;
    if(f.duration>0&&f.elapsed>=f.duration){
      if(s==='down'&&f.hp===0)f.hp=16;
      f.height=0;this.state(f,'idle');
    }
  }
  update(dt,input={}){
    if(this.mode==='end')return;this.time+=dt;
    if(this.mode==='intro'){this.intro-=dt;if(this.intro<=0){this.mode='fight';this.emit('bell');}return;}
    if(this.mode==='pin'){
      const p=this.pin;p.t+=dt;const count=Math.min(3,Math.floor(p.t/LuchaBout.countInterval));
      if(count>p.count){p.count=count;this.emit('count',count);if(count===2&&p.willEscape){this.endPin(false);return;}if(count===3)this.endPin(true);}return;
    }
    const h=this.hero,r=this.rival;this.advance(h,r,dt);this.advance(r,h,dt);
    if(this.toss){const t=this.toss;t.s+=dt;const p=Math.min(1,t.s/t.duration);t.def.x=t.from+(t.to-t.from)*p;
      t.def.height=(t.boost?112:76)*Math.sin(Math.PI*p);t.def.angle=-t.dir*p*Math.PI*(t.boost?1.9:1.04);
      if(p>=1){this.toss=null;t.def.angle=0;this.down(t.def);this.state(t.atk,'idle');this.emit('land',t.def);}return;}
    if(this.ready(h)){
      h.face=r.x>=h.x?1:-1;let dx=(input.right?1:0)-(input.left?1:0);
      if(input.guard){if(h.state!=='guard')h.guardAge=0;h.guardAge+=dt;h.state='guard';}
      else {h.guardAge=0;h.state=dx?'walk':'idle';h.x=this.ground(h.x+dx*(h.id===4?276:h.id===5?213:240)*dt);h.steps+=Math.abs(dx)*dt;}
    }
    if(this.pending){
      if(this.pending.until<this.time)this.pending=null;
      else if(this.ready(h)&&h.cd<=0){const name=this.pending.name;this.pending=null;this.startMove(h,name,r);if(this.mode!=='fight')return;}
    }
    if(this.ready(r)&&r.state!=='guard')r.face=h.x>=r.x?1:-1;
    const dist=Math.abs(h.x-r.x);
    if(this.ready(h)&&this.ready(r)&&dist<48){const shift=(48-dist)*.5,dir=h.x>=r.x?1:-1;h.x=this.ground(h.x+dir*shift);r.x=this.ground(r.x-dir*shift);}
    if(!this.ready(r))return;
    r.face=h.x>=r.x?1:-1;
    if(h.state==='down'){this.wind=null;r.state='walk';this.approach(r,h,145*dt);if(h.elapsed>.65&&dist<105)this.startPin(r,h);return;}
    if(this.wind){this.wind.t-=dt;if(this.wind.t<=0){const type=this.wind.kind;this.wind=null;r.state='idle';this.startMove(r,type,h);this.aiWait=(this.level==='family'?.82:this.level==='legend'?.21:.44)+this.random()*.33;}return;}
    this.aiWait-=dt;
    const leap=r.id===6||r.id===2,rusher=r.id===7||r.id===3;
    const range=leap?210:rusher?152:86;
    if(dist>range||this.aiWait>0&&dist>87){
      r.state='walk';this.approach(r,h,(r.id===7?96:110+this.round*9)*dt);r.steps+=dt;
    }else if(this.aiWait<=0){
      const n=this.random();
      let kind='strike';
      if(leap&&(dist>110||n<(r.id===6?.49:.32)))kind='dive';
      else if(rusher&&(dist>112||n<.32))kind='charge';
      else if(n<(r.id===3?.70:r.id===2?.56:.38))kind='throw';
      const windTime=(kind==='charge'?.77:kind==='dive'?.68:.54)+(this.level==='family'?.20:this.level==='legend'?-.10:0);
      this.wind={kind,t:windTime,total:windTime};r.state=kind==='throw'?'guard':'idle';
      this.emit('wind',kind);
    }else r.state=(r.id===2||r.id===3)&&h.state==='strike'?'guard':'idle';
  }
}
if(typeof module!=='undefined')module.exports=LuchaBout;
