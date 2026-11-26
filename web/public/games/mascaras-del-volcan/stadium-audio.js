/* Original, synthesized ring music and effects. No downloads or autoplay.
 * const stadium = new LuchaAudio({enabled: true});
 * stadium.unlock();                     // call from a player gesture
 * stadium.scene('intro'|'fight'|'pin'|'pause'|'home'|'finished', round);
 * stadium.setEnabled(boolean);
 * stadium.event(name, detail);          // documented at event() below
 */
(() => {
  'use strict';
  const concert = note => 440 * Math.pow(2, (note - 69) / 12);
  // Eighth-note rhythms, bass figures and call motifs are original arrangements.
  const venues = [
    { bpm:105, tonic:55, bass:[0,7,0,5], accents:[2,5,7], call:[7,12,10,7] },
    { bpm:111, tonic:60, bass:[0,4,7,2], accents:[1,4,6], call:[12,9,7,4] },
    { bpm:118, tonic:57, bass:[0,7,3,5], accents:[2,4,7], call:[3,7,10,12] },
    { bpm:102, tonic:62, bass:[0,9,7,5], accents:[1,3,6], call:[4,9,7,12] },
    { bpm:126, tonic:53, bass:[0,3,7,10], accents:[2,5,6], call:[7,10,12,15] }
  ];
  class LuchaAudio {
    constructor({enabled=true}={}) {
      this.enabled=!!enabled;
      this.mode='home';
      this.round=0;
      this.active=new Set();
      this.timer=null;
      this.nap=null;
      this.epoch=0;
      this.heat=0;
      this.lastCheer=-10;
      this.lastImpact=-10;
      this.ctx=null;
      this.wasUnlocked=false;
      this.visibility=()=> {
        if(document.hidden)this.silence();
        else if(this.isPlaying() && this.wasUnlocked)this.wake();
      };
      if(typeof document!=='undefined')document.addEventListener('visibilitychange',this.visibility);
    }
    isVisible(){return typeof document==='undefined'||!document.hidden;}
    isPlaying(){return this.mode==='fight'||this.mode==='intro'||this.mode==='pin';}
    build(){
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)return;
      this.ctx=new Context();
      const c=this.ctx;
      this.master=c.createGain();
      this.master.gain.value=.62;
      const compressor=c.createDynamicsCompressor();
      compressor.threshold.value=-12;
      compressor.knee.value=14;
      compressor.ratio.value=5;
      this.master.connect(compressor);
      compressor.connect(c.destination);
      this.noise=c.createBuffer(1,Math.ceil(c.sampleRate*.75),c.sampleRate);
      const samples=this.noise.getChannelData(0);
      let seed=65029;
      for(let i=0;i<samples.length;i++){
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;
        samples[i]=seed/2147483648-1;
      }
      this.brass=c.createPeriodicWave(new Float32Array(7),new Float32Array([0,1,.49,.38,.17,.095,.055]));
    }
    unlock(){
      if(!this.enabled||!this.isVisible())return;
      this.wasUnlocked=true;
      try {
        if(!this.ctx)this.build();
        if(this.ctx)this.wake();
      } catch {this.enabled=false;this.silence();}
    }
    wake(){
      if(!this.ctx||!this.enabled||!this.isVisible()||!this.wasUnlocked)return;
      clearTimeout(this.nap);
      const c=this.ctx,version=++this.epoch;
      const ready=()=>{
        if(version!==this.epoch||!this.enabled||!this.isVisible()||c.state!=='running')return;
        if(this.mode==='fight' && this.timer===null)this.beatStart();
        if(!this.isPlaying()&&this.mode!=='finished')this.sleepAfter(400);
      };
      if(c.state==='running'){ready();return;}
      try {const r=c.resume();if(r&&r.then)r.then(ready,()=>{});else ready();}catch{}
    }
    sleepAfter(ms){
      clearTimeout(this.nap);
      this.nap=setTimeout(()=>{
        if(this.ctx&&this.ctx.state==='running'&&!this.isPlaying()){this.ctx.suspend().catch(()=>{});}
      },ms);
    }
    stopBeat(){if(this.timer!==null)clearInterval(this.timer);this.timer=null;}
    silence(){
      ++this.epoch;
      this.stopBeat();
      clearTimeout(this.nap);
      for(const voice of this.active){try{voice.stop();}catch{}}
      this.active.clear();
      if(this.ctx&&this.ctx.state!=='closed')this.ctx.suspend().catch(()=>{});
    }
    setEnabled(value){this.enabled=!!value;if(this.enabled)this.unlock();else this.silence();}
    scene(name,round=this.round){
      if(name==='end')name='finished';
      if(name==='paused')name='pause';
      const nextRound=Math.min(venues.length-1,Math.max(0,Math.trunc(Number(round)||0)));
      if(this.mode===name&&this.round===nextRound)return;
      const was=this.mode;
      this.mode=name;
      this.round=nextRound;
      this.stopBeat();
      if(name==='home'||name==='pause'||name==='hidden'){this.silence();return;}
      if(name==='finished'){this.sleepAfter(2200);return;}
      if(name==='intro'||(name==='fight'&&was==='home'))this.heat=0;
      if(this.isPlaying())this.wake();
    }
    /* Voices disconnect after playback. A pin or a pause never owns a scheduler. */
    play(source,at,length,level,attack,filter){
      const c=this.ctx, volume=c.createGain(),tail=at+length;
      volume.gain.setValueAtTime(.0001,at);
      volume.gain.exponentialRampToValueAtTime(Math.max(.0002,level),at+Math.min(length*.28,attack));
      volume.gain.exponentialRampToValueAtTime(.0001,tail);
      if(filter){source.connect(filter);filter.connect(volume);}
      else source.connect(volume);
      volume.connect(this.master);
      this.active.add(source);
      source.onended=()=>{this.active.delete(source);source.disconnect();volume.disconnect();if(filter)filter.disconnect();};
      source.start(at);
      source.stop(tail+.008);
    }
    note(at,freq,length,level,type='triangle',end=freq,attack=.007){
      const osc=this.ctx.createOscillator();
      if(type==='brass')osc.setPeriodicWave(this.brass);else osc.type=type;
      osc.frequency.setValueAtTime(freq,at);
      if(freq!==end)osc.frequency.exponentialRampToValueAtTime(end,at+length*.8);
      this.play(osc,at,length,level,attack);
    }
    hiss(at,length,level,freq,q=.72,attack=.004,finish=freq){
      const c=this.ctx,src=c.createBufferSource(),filter=c.createBiquadFilter();
      src.buffer=this.noise;src.loop=true;
      filter.type='bandpass';filter.Q.value=q;filter.frequency.setValueAtTime(freq,at);
      if(finish!==freq)filter.frequency.exponentialRampToValueAtTime(finish,at+length);
      this.play(src,at,length,level,attack,filter);
    }
    horns(at,notes,spacing=.12,level=.077){
      notes.forEach((pitch,i)=>{
        const f=concert(pitch),time=at+i*spacing,len=(i===notes.length-1?2.65:.91)*spacing;
        this.note(time,f*.981,len,level,'brass',f,.019);
        this.note(time+.01,concert(pitch-5)*1.003,len*.91,level*.43,'brass',concert(pitch-5),.022);
      });
    }
    mat(at,intensity){
      this.note(at,131,.23,.37*intensity,'sine',45,.004);
      this.note(at,78,.30,.16*intensity,'triangle',36,.009);
      this.hiss(at,.12,.28*intensity,1100,1,.003,510);
    }
    crowd(at,strength){
      if(at-this.lastCheer<.43)return;
      this.lastCheer=at;
      this.hiss(at,.67,.15*strength,715,.65,.15,1250);
      this.hiss(at+.1,.46,.09*strength,1500,.72,.12,925);
      for(const d of [0,.057,.191,.257])this.hiss(at+.14+d,.048,.07*strength,1650,.62);
    }
    beatStart(){
      if(this.timer!==null)return;
      let step=0, next=this.ctx.currentTime+.045;
      const v=venues[this.round],gap=30/v.bpm;
      const schedule=()=>{
        if(this.mode!=='fight'||!this.enabled||!this.isVisible()||this.ctx.state!=='running'){this.stopBeat();return;}
        const now=this.ctx.currentTime;
        if(next<now-.09)next=now+.015;
        while(next<now+.32){
          const i=step%8,bar=Math.floor(step/8),root=v.tonic+v.bass[bar%4];
          if(i===0||i===4){
            this.note(next,concert(root-12+(i===4?7:0)),.23,.095,'sine');
            this.note(next,88,.12,.062,'triangle',49);
          }
          if(v.accents.includes(i)){
            this.note(next,concert(root+7),.087,.028,'triangle');
            this.hiss(next,.044,.047,1820,.7);
          }
          if(i===2||i===6)this.hiss(next,.055,.035,3300,1);
          if(bar%4===3&&i%2===0){
            this.note(next,concert(v.tonic+v.call[i/2]),.155,.025,'brass',concert(v.tonic+v.call[i/2]),.023);
          }
          if(this.heat>=.6&&(i===3||i===7))this.hiss(next,.052,.048,1170);
          if(i===7)this.heat=Math.max(0,this.heat-.09);
          step++; next+=gap;
        }
      };
      schedule();
      this.timer=setInterval(schedule,200);
    }
    /* Event detail: impact {kind:'strike'|'throw'|'dive'|...} or kind string;
       count/combo number; heat 0..1 or 0..100; end boolean or {won}; others optional.
       Supported aliases follow existing bout event names. */
    event(name,detail){
      if(!this.enabled||!this.ctx||!this.wasUnlocked||!this.isVisible())return;
      if(this.mode==='pause'||this.mode==='hidden'||this.mode==='home')return;
      if(this.ctx.state!=='running')return;
      const n=this.ctx.currentTime+.005,v=venues[this.round],key=v.tonic;
      switch(name){
        case 'bell':
          for(const d of [0,.18])for(const [f,a] of [[786,.11],[1249,.063],[2017,.032],[2873,.018]])
            this.note(n+d,f,.46,a,'sine',f*.996,.002);
          break;
        case 'impact':{
          const kind=typeof detail==='string'?detail:detail?.kind;
          if(n-this.lastImpact<.03)break;
          this.lastImpact=n;
          this.heat=Math.min(1,this.heat+.075);
          if(kind==='throw'||kind==='dive'||kind==='spring'||kind==='springboard'||kind==='heavy'){this.mat(n,.82);}
          else {this.hiss(n,.092,.29,1700,.8,.002,600);this.note(n,160,.10,.18,'triangle',66);}
          break;
        }
        case 'land':this.mat(n,1);break;
        case 'block':this.note(n,510,.091,.095,'triangle',286);this.hiss(n,.076,.15,2200,1.9);break;
        case 'wind':this.note(n,detail==='throw'?191:279,.073,.041,'triangle');break;
        case 'air':case 'toss':case 'throw':
          this.hiss(n,.29,.21,430,.9,.04,2200);this.note(n,179,.21,.058,'sine',420);break;
        case 'spring':case 'springboard':
          this.note(n,115,.38,.17,'triangle',510);this.note(n+.038,200,.29,.057,'sine',790);
          this.hiss(n+.08,.26,.16,900,.8,.023,2600);break;
        case 'counter':
          this.note(n,concert(key+14),.09,.12,'triangle');this.note(n+.073,concert(key+19),.18,.11,'brass');
          this.hiss(n,.12,.11,1950,1);break;
        case 'combo':{
          const count=Math.max(1,Math.min(8,Number(detail?.count??detail)||1));
          this.heat=Math.min(1,this.heat+.10);
          this.horns(n,[key+7,key+10+count*.5],.072,.046);
          if(count>=4)this.crowd(n,.78);break;
        }
        case 'roar':this.heat=Math.min(1,this.heat+.28);this.crowd(n,1);break;
        case 'heat':{
          const num=Number(detail?.value??detail);
          if(Number.isFinite(num))this.heat=Math.max(0,Math.min(1,num>1?num/100:num));
          if(this.heat>=.75)this.crowd(n,.86);break;
        }
        case 'pin':this.note(n,concert(key-5),.18,.13,'triangle');break;
        case 'count':{
          const count=Math.max(1,Math.min(3,Number(detail?.count??detail)||1));
          this.hiss(n,.083,.21,1260,.9,.002,630);this.note(n,90+count*14,.18,.29,'triangle',45);
          if(count===3)this.crowd(n,.95);break;
        }
        case 'kickout':this.horns(n,[key+2,key+7],.09,.059);this.crowd(n,.75);break;
        case 'end':case 'victory':case 'defeat':{
          const win=name==='victory'||(name==='end'&&!!(detail?.won??detail));
          if(win){this.horns(n,[key+7,key+12,key+10,key+14,key+19],.135,.099);this.crowd(n+.18,1);}
          else {this.horns(n,[key+7,key+3,key],.19,.067);this.mat(n+.38,.39);}
          if(this.mode==='finished')this.sleepAfter(1800);
          break;
        }
      }
    }
  }
  window.LuchaAudio=LuchaAudio;
})();
