'use strict';
const volcanPairs = {
  '0-4': {name:'Eclipse Doble', damage:52, downTime:2.1, energy:0},
  '0-5': {name:'La Campana de Hierro', damage:43, downTime:3.5, energy:0},
  '4-5': {name:'Órbita Rosa', damage:44, downTime:2.1, energy:22}
};
const rivalPartners = [2,7,3,1,6];

class LuchaTeamBout extends LuchaBout {
  constructor(round, emit, random, options = {}) {
    super(round, emit, random, options);
    const reserves=[0,4,5].filter(id=>id!==this.hero.id);
    this.partner=this.fighter(reserves.includes(options.partner)?options.partner:reserves[0],76,1);
    this.opponentPartner=this.fighter(rivalPartners[round],724,-1);
    this.pair=volcanPairs[[this.hero.id,this.partner.id].sort().join('-')];
    this.nextTag={hero:0,rival:9};
    this.rescue={hero:true,rival:true};
    this.exchange=null;
  }
  canExchange(side) {
    if(this.mode!=='fight'||this.toss||this.time<this.nextTag[side])return false;
    const own=side==='hero'?this.hero:this.rival,other=side==='hero'?this.rival:this.hero;
    return this.ready(own)&&own.cd<=0&&other.state!=='down';
  }
  action(name) {
    if(name!=='tag'){super.action(name);return;}
    if(this.mode==='pin'&&this.pin.def===this.hero&&this.rescue.hero){this.startExchange('hero','save');return;}
    if(this.canExchange('hero'))this.startExchange('hero',this.energy>=100?'duo':'tag');
    else if(this.mode==='fight')this.emit('hint',this.time<this.nextTag.hero?'tagCooldown':'tagOpening');
  }
  startExchange(side,kind) {
    const friendly=side==='hero';
    const out=friendly?this.hero:this.rival, incoming=friendly?this.partner:this.opponentPartner;
    const target=friendly?this.rival:this.hero;
    if(kind==='save'){
      this.rescue[side]=false;
      this.endPin(false);
      out.hp=Math.max(22,out.hp);
    }
    if(kind==='duo')this.energy=0;
    if(kind!=='save'){target.height=0;target.angle=0;target.cd=0;this.state(target,'idle');}
    this.pending=null;this.wind=null;this.streak=0;this.chainUntil=0;
    const corner=friendly?76:724;
    const direction=target.x>=corner?1:-1;
    const landing=this.ground(target.x-direction*(kind==='duo'?65:106));
    this.exchange={side,kind,out,incoming,target,corner,landing,start:out.x,targetX:target.x,
      duration:kind==='tag'?1.05:kind==='duo'?1.44:.93,elapsed:0,contact:false};
    this.mode='exchange';
    this.emit('exchangeStart',{side,kind});
  }
  // Both the simulation and the renderer use the same entrance and landing marks.
  choreography() {
    const e=this.exchange;if(!e)return null;
    const p=Math.min(1,e.elapsed/e.duration),dir=e.side==='hero'?1:-1;
    const slide=(a,b,progress)=>{const t=Math.max(0,Math.min(1,progress));return a+(b-a)*t*t*(3-2*t);};
    const arc=t=>Math.sin(Math.PI*Math.max(0,Math.min(1,t)));
    const actor=(fighter,x,y,face,pose,phase,teamRole=0)=>({fighter,x,y,face,pose,phase,teamRole});
    if(e.kind==='tag'){
      const leave=slide(e.start,e.corner+dir*29,p/.47);
      const outgoing=actor(e.out,slide(leave,e.corner,(p-.48)/.52),slide(350,303,(p-.49)/.51),-dir,p<.8?'tagOut':'apron',Math.min(1,p/.65));
      const rush=(p-.42)/.58;
      const arriving=actor(e.incoming,slide(e.corner,e.landing,rush),slide(303,350,rush)-arc(rush)*41,dir,p<.35?'apron':'tagIn',Math.max(0,rush));
      return {p,actors:[outgoing,arriving],effect:'clap',x:e.corner+dir*11,y:222,progress:(p-.36)/.38};
    }
    if(e.kind==='save'){
      const inward=p/.5,retreat=(p-.50)/.50,contact=e.targetX-dir*25;
      const x=p<=.5?slide(e.corner,contact,inward):slide(contact,e.corner,retreat);
      const y=p<=.5?slide(303,350,inward)-arc(inward)*55:slide(350,303,retreat)-arc(retreat)*24;
      return {p,actors:[actor(e.out,e.start,350,e.targetX>=e.start?1:-1,p<.48?'down':'tagOut',p),actor(e.incoming,x,y,dir,p<.56?'doubleTeam':'tagOut',p,1)],
        effect:'save',x:contact,y:248,progress:(p-.40)/.45};
    }
    const leap=(p-.19)/.54,exit=(p-.71)/.29;
    const contact=e.targetX-dir*22,other=e.targetX-dir*63;
    const outgoing=actor(e.out,p<.71?slide(e.start,other,leap):slide(other,e.corner,exit),
      p<.71?350-arc(leap)*57:slide(350,303,exit)-arc(exit)*19,dir,'doubleTeam',p,0);
    const incoming=actor(e.incoming,p<.71?slide(e.corner,contact,leap):slide(contact,e.landing,exit),
      p<.71?slide(303,350,leap)-arc(leap)*92:350,dir,'doubleTeam',p,1);
    return {p,actors:[outgoing,incoming],effect:'duo',x:e.targetX,y:249,progress:(p-.58)/.42};
  }
  updateExchange(dt) {
    const e=this.exchange;e.elapsed+=dt;const p=e.elapsed/e.duration;
    if(!e.contact&&p>=(e.kind==='tag'?.43:e.kind==='save'?.49:.68)){
      e.contact=true;
      if(e.kind==='duo'){
        const target=e.target;target.hp=Math.max(0,target.hp-this.pair.damage);
        target.height=0;target.angle=0;this.down(target);target.duration=Math.max(target.duration,this.pair.downTime);
        this.stats.hits++;this.stats.specials++;this.reward(260);this.energyBy(this.pair.energy);
      }
      this.emit('exchangeHit',{side:e.side,kind:e.kind});
    }
    if(p<1)return;
    for(const f of [e.out,e.incoming]){f.height=0;f.angle=0;f.cd=0;this.state(f,'idle');}
    if(e.kind!=='save'){
      e.out.x=e.corner;e.incoming.x=e.landing;e.incoming.face=e.target.x>=e.incoming.x?1:-1;
      if(e.side==='hero'){this.hero=e.incoming;this.partner=e.out;}
      else{this.rival=e.incoming;this.opponentPartner=e.out;}
    } else {
      e.incoming.x=e.corner;e.out.x=e.start;
    }
    this.nextTag[e.side]=this.time+(e.side==='hero'?7:13);
    this.aiWait=e.side==='hero'?.75:.55;
    this.exchange=null;this.mode='fight';
  }
  update(dt,input={}) {
    if(this.mode==='exchange'){this.time+=dt;this.updateExchange(dt);return;}
    if(this.mode==='pin'&&this.pin.def===this.rival&&this.rescue.rival&&!this.pin.willEscape&&this.pin.t+dt>=1.98){
      this.startExchange('rival','save');return;
    }
    if(this.mode==='fight'){
      // A tired reserve recovers up to two thirds of a health bar while resting.
      for(const reserve of [this.partner,this.opponentPartner])if(reserve.hp<65)reserve.hp=Math.min(65,reserve.hp+1.35*dt);
      if(this.canExchange('rival')&&this.rival.hp<48&&this.opponentPartner.hp>this.rival.hp+24){
        this.startExchange('rival','tag');return;
      }
    }
    super.update(dt,input);
  }
}
