/** Tiny original local tones: no asset requests, voices, trackers or paid APIs. */
export class TruckAudio {
 private context:AudioContext|null=null;
 private voices=new Set<OscillatorNode>();
 private last=-100;
 muted=false;
 get activeCount(){return this.voices.size;}
 unlock(){
  if(this.muted)return;
  try{this.context??=new AudioContext();void this.context.resume().catch(()=>{});}catch{/* Gameplay remains silent if the device denies audio. */}
 }
 play(kind:'smash'|'warning'|'shield'|'damage'|'landing'){
  const c=this.context;if(this.muted||!c||c.state!=='running'||this.voices.size>=4||c.currentTime-this.last<.08)return;
  this.last=c.currentTime;
  const o=c.createOscillator(),g=c.createGain(),freq={smash:150,warning:520,shield:740,damage:100,landing:320}[kind];
  o.type=kind==='smash'?'triangle':'sine';o.frequency.setValueAtTime(freq,c.currentTime);o.frequency.exponentialRampToValueAtTime(kind==='damage'?60:freq*1.4,c.currentTime+.12);
  g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.045,c.currentTime+.012);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.14);
  o.connect(g);g.connect(c.destination);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};o.start();o.stop(c.currentTime+.15);
 }
 rev(){
  this.unlock();const c=this.context;
  if(!c||this.muted)return;
  void c.resume().then(()=>{
   if(this.context!==c||this.voices.size>=4)return;
   const o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter(),t=c.currentTime;
   o.type='sawtooth';filter.type='lowpass';filter.frequency.value=520;
   o.frequency.setValueAtTime(43,t);o.frequency.exponentialRampToValueAtTime(125,t+.42);o.frequency.exponentialRampToValueAtTime(46,t+.95);
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.044,t+.09);g.gain.exponentialRampToValueAtTime(.0001,t+1);
   o.connect(filter);filter.connect(g);g.connect(c.destination);this.voices.add(o);
   o.onended=()=>{this.voices.delete(o);o.disconnect();filter.disconnect();g.disconnect();};o.start();o.stop(t+1);
  }).catch(()=>{});
 }
 close(){for(const v of this.voices){try{v.stop();}catch{/* already ended */}}this.voices.clear();if(this.context)void this.context.close().catch(()=>{});this.context=null;}
}
