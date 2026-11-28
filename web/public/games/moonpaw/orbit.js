'use strict';

// Each planet uses the same regions for its glowing faults and moving fragments.
const worlds = [
  {name:'Cinder', art:'ember', color:'#ff915e', core:'#fff1a5', health:20, weak:'cryo', seed:17, breakArt:'flare', material:'lava'},
  {name:'Glacielle', art:'glacier', color:'#72dcff', core:'#ecffff', health:27, weak:'solar', seed:37, breakArt:'ice', material:'ice'},
  {name:'Prismara', art:'prism', color:'#dc91ff', core:'#ffedac', health:34, weak:'gravity', seed:83, breakArt:'vortex', material:'crystal', rings:'amethyst'},
  {name:'Viridia', color:'#62dda0', core:'#ffe58d', health:35, weak:'solar', seed:101, breakArt:'flare', material:'jade'},
  {name:'Duneveil', color:'#edb267', core:'#90f1df', health:37, weak:'comet', seed:139, breakArt:'flare', material:'sandstone'},
  {name:'Tempestra', color:'#729bff', core:'#dcf5ff', health:39, weak:'cryo', seed:193, breakArt:'storm', material:'fulgurite'},
  {name:'Ferrum', color:'#ef8460', core:'#ffe1a4', health:41, weak:'storm', seed:229, breakArt:'flare', material:'iron', rings:'copper'},
  {name:'Pelagia', color:'#5edbdb', core:'#ffe7c8', health:43, weak:'solar', seed:269, breakArt:'ice', material:'reef'},
  {name:'Noctis', color:'#c6678d', core:'#ffe2e9', health:46, weak:'gravity', seed:313, breakArt:'vortex', material:'obsidian'}
];
const planetSpells={
  nova:{name:'Nova Beam',icon:'spark',color:'#ffd497',core:'#fff5dc',hint:'Punch through the planet. Hit the rim to blast off chunks.'},
  solar:{name:'Solar Flare',icon:'solar',color:'#ff9359',core:'#fff1a6',hint:'Melt a tunnel. Its walls keep burning wider.'},
  cryo:{name:'Ice Lance',icon:'frost',color:'#83eaff',core:'#e9ffff',hint:'Freeze the crust, then break it with Nova Beam.'},
  gravity:{name:'Gravity Well',icon:'gravity',color:'#cb98ff',core:'#f5dcff',hint:'Pull in nearby meteors. Combine with Pocket Moon to drill into the core.'},
  comet:{name:'Comet Rain',icon:'comet',color:'#ffae84',core:'#fff6ca',hint:'Call down a volley. Charge your cast for more comets.'},
  storm:{name:'Chain Lightning',icon:'storm',color:'#afbbff',core:'#f8ffff',hint:'Arc through meteors and split the crust at two points.'},
  crescent:{name:'Crescent Saw',icon:'crescent',color:'#a0ffdb',core:'#fff8d3',hint:'Send a spinning crescent carving a curved trench. Charge for a longer cut.',attack:crescentSpell},
  bloom:{name:'Crystal Bloom',icon:'bloom',color:'#ffb9e2',core:'#ecfff9',hint:'Plant a crystal seed and watch it erupt through the crust.',attack:bloomSpell},
  wormhole:{name:'Wormhole Punch',icon:'wormhole',color:'#ef9bff',core:'#fff0ff',hint:'Punch through linked portals to open two holes in the planet.',attack:wormholeSpell},
  dragon:{name:'Flaming Dragon',icon:'dragon',color:'#ffa453',core:'#fff2a5',hint:'Aim through Phantom Claws trenches to send dragon fire racing down the cuts.',attack:dragonSpell},
  fleet:{name:'Starfleet Raid',icon:'fleet',color:'#7feaff',core:'#e5ffff',hint:'Call in a squadron for a strafing run. Hold to summon more ships.',attack:fleetSpell},
  yarn:{name:'Cosmic Yarn',icon:'yarn',color:'#ffabda',core:'#fff3cf',hint:'Cast to wrap the planet in yarn. Tap again to pull the loops tight.',attack:yarnSpell},
  claws:{name:'Phantom Claws',icon:'claws',color:'#8af3e2',core:'#e9fffb',hint:'Swipe across the planet to carve three trenches. Cross an earlier slash to tear out a chunk.',attack:clawSpell},
  purr:{name:'Faultline Purr',icon:'purr',color:'#ffde8a',core:'#fff6d1',hint:'Hold Cast to build a purr. Release to split existing faults or snap a yarn wrap.',attack:purrSpell},
  heist:{name:'Core Heist',icon:'heist',color:'#ffae72',core:'#fff2bb',hint:'Reach through a portal, steal the glowing core and watch the shell buckle.',attack:heistSpell},
  pinball:{name:'Meteor Pinball',icon:'pinball',color:'#94eaff',core:'#f3fbff',hint:'Cast to set up three bumpers. Tap Cast as the meteor returns to Moonpaw to bat it back.',attack:pinballSpell},
  mirror:{name:'Mirror Pounce',icon:'mirror',color:'#c6a1ff',core:'#f7f1ff',hint:'Summon three mirror cats to pounce from different sides and hollow out one cavern.',attack:mirrorSpell},
  moon:{name:'Pocket Moon',icon:'moon',color:'#ffe8a2',core:'#ffffed',hint:'Cast to orbit, then tap to drop. Add Gravity Well to spiral down to the core.',attack:moonSpell},
  potion:{name:'Potion Roulette',icon:'potion',color:'#a8ef92',core:'#f4ffe3',hint:'Toss a potion for candy glass, an inflating shell or wobbling blobs. Hit it again to see what happens.',attack:potionSpell},
  monster:{name:'World Eater',icon:'monster',color:'#72edeb',core:'#ffdfa8',hint:'Bite away half the planet. Cast again to eat the rest, or select Spitball ready to fling the chunk.',attack:monsterSpell},
  spitball:{name:'Planet Spitball',icon:'spitball',color:'#ffd898',core:'#fff3d2',hint:'Load up with World Eater. Tap the exposed core to spit your planet chunk through it.',attack:spitballSpell},
  zipper:{name:'Cosmic Zipper',icon:'zipper',color:'#7ff3d9',core:'#fff3d2',hint:'Swipe a path across the planet to unzip the crust. Tap or press Cast for an automatic path.',attack:zipperSpell},
  stampede:{name:'Nine Lives Stampede',icon:'stampede',color:'#c6a7ff',core:'#fff3d2',hint:'Tap to the beat as eight ghost cats open a tunnel. Nail the ninth beat to ride the core out.',attack:stampedeSpell},
  cutter:{name:'Constellation Cutter',icon:'cutter',color:'#ffdc89',core:'#fff3d2',hint:'Tap three points to cut a triangle out of the planet. Tap a fourth spot to launch the wedge.',attack:cutterSpell}
};
const spellOrder=Object.keys(planetSpells);
const specialAttacks=Object.values(planetSpells).map(spell=>spell.attack).filter(Boolean);
let selectedSpell='nova',flight=null;
const bookPages=[...document.querySelectorAll('#arsenal .spell-options')];
const lastSpellOnPage=new Map();
function showSpellPage(kind){
  const page=$('pick-'+kind).parentElement;
  lastSpellOnPage.set(page.id,kind);
  for(const panel of bookPages){
    panel.hidden=panel!==page;
    $('book-'+panel.id).setAttribute('aria-pressed',String(panel===page));
  }
}
function chooseSpell(kind,feedback=true){
  if(!planetSpells[kind])return;
  if(selectedSpell!==kind)clawStroke=null;
  selectedSpell=kind;showSpellPage(kind);
  for(const id of spellOrder)$('pick-'+id).setAttribute('aria-pressed',String(id===kind));
  $('spellTip').textContent=planetSpells[kind].hint;
  if(flight){
    flight.charge=0;
    $('boltName').textContent=planetSpells[kind].name;
    $('cast').setAttribute('aria-label','Cast '+planetSpells[kind].name);
    $('cast').title=planetSpells[kind].name+' · Hold to charge';
    $('castSymbol').setAttribute('href','#i-'+planetSpells[kind].icon);
    $('cast').style.color=planetSpells[kind].color;
    if(feedback&&mode==='play')tone(440+spellOrder.indexOf(kind)*100,680,.10,'triangle');
  }
}
function spinAngle(){return (flight?flight.spin:0)+(flight?flight.index*.19:.29)}

const nebula = new Image();
nebula.src = 'assets/veil-nebula.webp';
for (const world of worlds) {
  // Keep full resolution surface and cutaway buffers for the current encounter.
  let skin;
  Object.defineProperty(world,'skin',{get(){return skin??=createPlanetSkin(world)}});
  world.releaseSkin=()=>{skin=null};
  world.image = new Image();
  if(world.art)world.image.src = 'assets/' + world.art + '.png';
  world.cells = fractureCells(world.seed);
}

function fractureCells(seed) {
  let state=seed;
  function next(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}
  const centers=[{x:0,y:0}];
  for (const [count,radius] of [[6,.45],[10,.87]]) {
    for (let i=0;i<count;i++) {
      const theta=(i+.34+next()*.24)*Math.PI*2/count, r=radius*(.84+next()*.22);
      centers.push({x:r*Math.cos(theta),y:r*Math.sin(theta)});
    }
  }
  return centers.map((c,index)=>{
    let polygon=[[-1,-1],[1,-1],[1,1],[-1,1]];
    for(const other of centers){
      if(other===c)continue;
      const dx=other.x-c.x,dy=other.y-c.y,mid=(other.x**2+other.y**2-c.x**2-c.y**2)/2;
      const nextPolygon=[];
      for(let i=0;i<polygon.length;i++){
        const a=polygon[i],b=polygon[(i+1)%polygon.length];
        const da=a[0]*dx+a[1]*dy-mid,db=b[0]*dx+b[1]*dy-mid;
        if(da<=0)nextPolygon.push(a);
        if((da<=0)!==(db<=0)){const t=da/(da-db);nextPolygon.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])}
      }
      polygon=nextPolygon;
    }
    const angle=index?Math.atan2(c.y,c.x):next()*Math.PI*2;
    const speed=.6+next()*1.3;
    // Subdivide each seam identically on its two neighboring plates.
    const jagged=[];
    for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length];
      const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);
      jagged.push(a);if(n<.09)continue;
      const reverse=Math.abs(dx)>.001?dx<0:dy<0;
      const sign=reverse?-1:1;
      const seedAngle=Math.round((a[0]+b[0])*890)*.431+Math.round((a[1]+b[1])*700)*.786;
      for(let j=1;j<6;j++){
        const k=reverse?6-j:j,f=j/6;
        const bend=sign*Math.min(.037,n*.10)*Math.sin(seedAngle+k*2.43)*Math.sin(k*Math.PI/6);
        jagged.push([a[0]+dx*f-dy/n*bend,a[1]+dy*f+dx/n*bend]);
      }
    }
    return{polygon:jagged,cx:c.x,cy:c.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,spin:(next()-.5)*2.3};
  });
}

function launchOrbit(carryScore){
  resetActor();unlock();
  if(flight)worlds[flight.index].releaseSkin();
  const picked=Number($('destination').value);
  const first=Number.isInteger(picked)&&worlds[picked]?picked:0;
  const world=worlds[first];void world.skin;
  if(!carryScore)score=0;
  charge=0;lives=3;elapsed=scroll=0;gate=null;
  entities=[];shots=[];particles=[];rings=[];labels=[];
  cooldown=invulnerable=burstTime=castFlash=shake=frostCooldown=trailClock=0;
  flight={index:first,first,destroyed:0,hp:world.health,phase:'launch',age:0,charge:0,beam:null,
    blastX:0,blastY:0,impact:0,meteorTimer:2.6,energy:0,supers:0,hitSites:world.skin.hitSites,clawScars:[],specialAttackFX:[],effects:[],comets:[],arcs:[],trail:0,spin:0,scars:0,ejecta:[],fragments:[],burnCut:null,burn:0,burnTick:0,brittle:0,well:0,wellAge:0,combos:0};
  player.x=W*.23;player.y=H*.65;player.vx=player.vy=player.tilt=0;
  clearInput();setMode('play');hud();spellUI();orbitUI();placePlayer();
  showNotice('LEAVING THE ASTRONOMY TOWER',1.55);tune([294,392,494,659,880]);
  $('launch').blur();$('graduationLaunch').blur();$('continue').blur();
}
function orbitUI(){
  const world=worlds[flight.index];showSupernova();
  $('lessonText').textContent=flight.phase==='launch'?'Flying to orbit':world.name;
  $('lessonCount').textContent=flight.phase==='launch'?'':flight.phase==='break'?'SHATTERED':flight.hp+' / '+world.health;
  const state=[];
  if(flight.brittle>0)state.push('Brittle');
  if(flight.burn>0)state.push('Burning');
  if(flight.well>0)state.push('Gravity pull');
  $('weakness').hidden=flight.phase!=='fight';
  $('weakness').textContent=state.length?state.join(' · '):'Weak to '+planetSpells[world.weak].name;
  $('progress').style.width=(100*flight.hp/world.health)+'%';
}
function orbitTarget(){
  const r=clamp(Math.min(W*.227,H*.31),42,180);
  if(flight.phase==='break')return{x:flight.blastX*W,y:flight.blastY*H,r};
  const drift=flight.index*.91+flight.age*.48;
  return{x:W*(.73+.032*Math.sin(drift*.72)),y:H*(.48+.11*Math.sin(drift)),r};
}
function pointOnWorld(x,y){const p=orbitTarget();return Math.hypot(x-p.x,y-p.y)<=p.r*1.17+5}
function beginEncounter(){
  resetActor();
  flight.phase='fight';flight.age=0;flight.impact=0;flight.charge=0;flight.beam=null;
  const world=worlds[flight.index];world.skin.reset();
  flight.hitSites=world.skin.hitSites;flight.clawScars=[];clawStroke=null;
  flight.hp=world.health;flight.meteorTimer=1.5;flight.spin=0;flight.scars=0;
  flight.burn=flight.burnTick=flight.brittle=flight.well=flight.wellAge=0;
  flight.specialAttackFX.length=0;
  flight.burnCut=null;flight.fragments=[];flight.ejecta=[];flight.effects=[];flight.comets=[];flight.arcs=[];
  flight.frostHalo=null;
  cooldown=0;hud();orbitUI();
  showNotice(flight.index===0?'TAP TO BLAST A HOLE':worlds[flight.index].name.toUpperCase(),flight.index===0?3:1.2);
  hatchlings.begin();
}
function releaseNova(){
  if(!flight||flight.phase!=='fight')return;
  const power=flight.charge>=.78?3:flight.charge>=.32?2:1;
  flight.charge=0;
  shootNova(power);
}
function applyWorldDamage(amount){
  if(flight.phase!=='fight')return;
  flight.hp=Math.max(0,flight.hp-amount);
  if(worlds[flight.index].skin.remaining<.22)flight.hp=0;
  if(!flight.hp)shatterWorld(orbitTarget());else orbitUI();
}
function projectedAim(p,aim){
  // Aim assist distributes button casts across the visible hemisphere.
  const angle=flight.scars*2.4+.7;
  let x=aim?(aim.x-p.x)/p.r:Math.cos(angle)*.43;
  let y=aim?(aim.y-p.y)/p.r:Math.sin(angle)*.37;
  const d=Math.hypot(x,y);if(d>.94){x*=.94/d;y*=.94/d}
  return{x,y};
}
function shootNova(power,aim,path){
  if(!flight||mode!=='play'||flight.phase!=='fight')return;
  const kind=selectedSpell,spot=projectedAim(orbitTarget(),aim),encounter=flight,index=flight.index;
  if(kind==='spitball'&&!spitballSpell.loaded()){showNotice('USE WORLD EATER TO LOAD A CHUNK',1.5);return}
  if(kind==='cutter'&&cooldown<=0){
    beginGesture(kind,power,null);
    fireOrbitSpell(kind,power,spot,path);
    return;
  }
  const loadedShot=kind==='spitball'&&spitballSpell.loaded();
  const twoPart=kind==='moon'||kind==='yarn';
  if(twoPart&&actorPending()&&acting.kind===kind){
    acting.followUp??={spot,power};
    return;
  }
  if(cooldown>0&&!loadedShot&&!(twoPart&&planetSpells[kind].attack.actionLabel()))return;
  beginGesture(kind,power,()=>{
    if(flight!==encounter||flight.index!==index||flight.phase!=='fight'||mode!=='play')return;
    const followUp=acting.followUp;
    fireOrbitSpell(kind,power,spot,path);
    if(twoPart&&followUp&&flight.phase==='fight')planetSpells[kind].attack.cast(followUp.spot,followUp.power);
  });
}
function fireOrbitSpell(kind,power,spot,path){
  const world=worlds[flight.index],p=orbitTarget(),spell=planetSpells[kind];
  const x1=p.x+p.r*spot.x,y1=p.y+p.r*spot.y;
  if(hatchlings.observeCast(spot,kind,power))return;
  flight.scars++;
  if(kind!=='potion')potionSpell.onHit(spot,kind);
  if(kind==='purr')yarnSpell.pullForPurr();
  if(spell.attack){
    spell.attack.cast(spot,power,path);
    return;
  }
  if(kind==='comet'||kind==='storm'){
    if(kind==='comet')callComets(spot,power);else chainLightning(spot,power);
    return;
  }
  const paw=castingPaw(),x0=paw.x,y0=paw.y;
  const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1;
  flight.beam={x0,y0,x1,y1,power,age:0,kind};
  const shatterIce=kind==='nova'&&flight.brittle>0;
  const breakPower=power+(shatterIce?1.4:0);
  const cut=strikeSurface(spot,kind,breakPower);
  gainEnergy(19+power*2+(shatterIce?10:0));hitSound(kind,power);
  if(kind==='gravity'){
    flight.well=3;flight.wellAge=0;
  }else{
    for(const e of entities){
      if(e.dead||e.kind!=='meteor')continue;
      const t=clamp(((e.x-x0)*dx+(e.y-y0)*dy)/(len*len),0,1);
      if(Math.hypot(e.x-x0-dx*t,e.y-y0-dy*t)>e.r+4*power)continue;
      if(kind==='cryo'){e.ice=3;continue}
      e.dead=true;spark(e.x,e.y,spell.color,12,79);addScore(40,e.x,e.y);
    }
  }
  let damage=kind==='solar'||kind==='cryo'?power:power+1;
  if(kind===world.weak)damage+=2;
  let message='';
  if(shatterIce){
    damage+=3+power;flight.brittle=0;flight.combos++;message='ICE SHATTER';addScore(100);
    spark(x1,y1,'#bff6ff',24,137);
  }else if(kind==='solar'){
    if(flight.burn<=0)flight.burnTick=.7;
    flight.burn=3.05;flight.burnCut=cut;
  }else if(kind==='cryo')flight.brittle=5.5;
  if(message)showNotice(message+'  +100',1.05);
  labels.push({x:x1,y:y1-p.r*.16,val:'−'+damage,life:.72});
  castFlash=1;cooldown=(kind==='gravity'?.64:kind==='solar'?.46:.30)+(power===3?.12:0);flight.impact=1;
  spark(x1,y1,spell.core,9+power*4,88+power*16);ring(x1,y1,spell.color,10+power*9);
  if(kind==='solar')tone(180,58,.34,'sawtooth',.042);
  else if(kind==='cryo')tune([1080,1420,960]);
  else if(kind==='gravity')tone(135,34,.44,'triangle',.09);
  else tone(340+power*80,80,.18,'sawtooth',.039);
  applyWorldDamage(damage);
}
function shatterWorld(p){
  const world=worlds[flight.index];
  flight.specialAttackFX=flight.specialAttackFX.filter(effect=>effect.kind==='monster');
  flight.phase='break';flight.age=0;flight.charge=0;flight.comets=[];
  flight.fragments=prepareFragments(world);
  flight.blastX=p.x/W;flight.blastY=p.y/H;flight.destroyed++;
  entities=[];shake=reduceMotion?0:.36;
  spark(p.x,p.y,world.color,65,p.r*2.25);spark(p.x,p.y,world.core,26,p.r*3);
  ring(p.x,p.y,world.core,p.r*2.3);ring(p.x,p.y,world.color,p.r*3);
  addScore((flight.index+1)*600,p.x,p.y-p.r);hud();orbitUI();
  showNotice(world.name.toUpperCase()+' SHATTERED!',1.2);
  hitSound('super',4);tone(110,32,.68,'sawtooth',.075);tune([330,494,660]);
}
function endOrbit(won){
  const record=saveRecord();
  hud();
  const copy=(record?'New personal best! ':'')+score.toLocaleString()+' points · '+flight.destroyed+' of '+(worlds.length-flight.first)+' planets shattered.'+(flight.combos?' Ice shatters: '+flight.combos+'.':'');
  modal(won?'won':'lost',won?'STAR BREAKER!':'FLIGHT ENDED',copy,won?'FLY AGAIN':'RETRY FLIGHT');
  $('result').textContent=copy;
  tune(won?[440,554,659,880]:[392,330,247]);
}
function spawnMeteor(){
  const r=clamp(Math.min(W,H)*(.023+Math.random()*.016),7,20);
  const y=H*(.15+Math.random()*.7),vx=-Math.max(100,W*(.18+.025*Math.min(5,flight.index)));
  const time=Math.max(.7,(W+25-player.x)/-vx);
  entities.push({kind:'meteor',x:W+25,y,r,vx,vy:clamp((player.y-y)/time,-H*.18,H*.18),
    ice:0,dead:false,age:Math.random()*5,spin:Math.random()-.5});
}
function updateOrbit(dt){
  stampedeSpell.advanceRide(dt);
  if(flight.frostHalo&&(flight.frostHalo.age+=dt)>.65)flight.frostHalo=null;
  for(const list of [flight.effects,flight.arcs])for(const effect of list)effect.age+=dt;
  flight.effects=flight.effects.filter(e=>e.age<e.life);flight.arcs=flight.arcs.filter(e=>e.age<.48);
  for(const chip of flight.ejecta)chip.age+=dt;
  flight.ejecta=flight.ejecta.filter(chip=>chip.age<chip.life);
  flight.age+=dt;flight.impact=Math.max(0,flight.impact-dt*4);
  if(flight.beam){flight.beam.age+=dt;if(flight.beam.age>(flight.beam.kind==='gravity'?.58:.38))flight.beam=null}
  flight.trail-=dt;
  if(flight.trail<=0&&monsterSpell.playerOpacity()>.15){
    flight.trail=.045;
    spark(player.x-player.w*.28,player.y+player.w*.18,flight.phase==='launch'?'#acdfff':'#c9a6ff',2,30);
    particles[particles.length-1].vx-=70;
  }
  if(flight.phase==='launch'){
    if(!drag&&!keys.size){player.y=Math.max(H*.43,player.y-H*dt*.13);player.tilt=reduceMotion?0:-11*(1-Math.min(flight.age/1.8,1))}
    if(flight.age>=1.8)beginEncounter();
    return;
  }
  if(flight.phase==='break'){
    if(flight.specialAttackFX.length)monsterSpell.update(dt);
    if(flight.age>=2.45){
      if(flight.index===worlds.length-1){endOrbit(true);return}
      worlds[flight.index].releaseSkin();flight.index++;beginEncounter();
    }
    return;
  }
  flight.spin+=(reduceMotion||hatchlings.chipping())?0:dt*(.030+flight.index*.005)*(flight.brittle>0?.57:1);
  const spinningWorld=worlds[flight.index];
  spinningWorld.skin.advance(dt,spinAngle(),(p,size,kind)=>peelCrust(spinningWorld,p,size,kind));
  updateComets(dt);if(flight.phase!=='fight')return;
  if(flight.specialAttackFX.length){
    for(const attack of specialAttacks){
      attack.update(dt);
      if(flight.phase!=='fight')return;
    }
  }
  const wasBurning=flight.burn>0;
  if(flight.burn>0){
    flight.burn=Math.max(0,flight.burn-dt);flight.burnTick-=dt;
    if(flight.burnTick<=0){
      flight.burnTick+=.75;
      const p=orbitTarget(),skin=worlds[flight.index].skin;
      skin.widen(flight.burnCut,.026);
      const spot=skin.project(flight.burnCut,spinAngle()),bx=p.x+spot.x*p.r,by=p.y+spot.y*p.r;
      if(spot.z>0)spark(bx,by,'#ffab57',6,55);
      labels.push({x:bx,y:by-p.r*.15,val:'−1 BURN',life:.62});
      applyWorldDamage(1);if(flight.phase!=='fight')return;
    }
  }
  const oldBrittle=flight.brittle,oldWell=flight.well;
  flight.brittle=Math.max(0,flight.brittle-dt);flight.well=Math.max(0,flight.well-dt);
  if((oldBrittle>0&&!flight.brittle)||(oldWell>0&&!flight.well)||(wasBurning&&!flight.burn))orbitUI();
  flight.wellAge+=dt;
  if((keys.has('Space')||castPointer!==null)&&cooldown<=0&&!actorPending()){
    flight.charge=Math.min(1,flight.charge+dt/.92);
    if(flight.charge>=1&&!['purr','pinball','moon','yarn','cutter','stampede'].includes(selectedSpell)){flight.charge=0;shootNova(3)}
  }
  if(flight.phase!=='fight')return;
  if(difficulty==='hard'){
    flight.meteorTimer-=dt;
    if(flight.meteorTimer<=0){spawnMeteor();flight.meteorTimer=Math.max(1.12,2.15-.24*flight.index)*(.88+Math.random()*.38)}
  }
  for(const e of entities){
    if(e.dead)continue;
    if(flight.well>0){
      const p=orbitTarget(),dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy);
      if(d<Math.max(p.r*3.8,W*.51)){
        const step=1-Math.exp(-dt*3.5);e.x+=dx*step;e.y+=dy*step;
        if(d<p.r+e.r*.4){
          e.dead=true;const spot=projectedAim(p,e);
          strikeSurface(spot,'gravity',2);hitSound('gravity',2);
          spark(e.x,e.y,'#ffb486',19,101);addScore(75,e.x,e.y);
          labels.push({x:e.x,y:e.y-e.r,val:'−3 IMPACT',life:.75});
          applyWorldDamage(3);if(flight.phase!=='fight')return;
        }
        continue;
      }
    }
    if(e.ice>0){e.ice=Math.max(0,e.ice-dt);continue}
    e.age+=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;
    if(monsterSpell.playerOpacity()>.35&&Math.hypot(e.x-player.x-player.w*.07,e.y-player.y+player.w*.035)<e.r+player.w*.19){
      hit(e);if(mode!=='play')return;
    }
  }
  entities=entities.filter(e=>!e.dead&&e.x>-e.r&&e.y>-e.r&&e.y<H+e.r);
}
function drawCover(img,offset=0){
  if(!img.naturalWidth)return;
  const fit=Math.max(W/img.width,H/img.height)*1.055;
  const w=img.width*fit,h=img.height*fit;
  ctx.drawImage(img,(W-w)*.5+Math.min((w-W)*.40,W*.022)*Math.sin(offset),(H-h)*.5,w,h);
}
function drawOrbitBackground(){
  ctx.imageSmoothingEnabled=true;ctx.fillStyle='#080d1e';ctx.fillRect(0,0,W,H);drawCover(nebula,scroll*.00032);
  if(flight.index){ctx.fillStyle=flight.index===1?'#0a456f26':'#69377523';ctx.fillRect(0,0,W,H)}
  // A distant star cluster stays in the sky as the planet moves across it.
  for(let i=0;i<45;i++){
    const x=W*(.45+.49*((i*.618034+.19)%1)),y=H*(.19+.62*((i*.414214+.23)%1));
    const size=i%8===0?1.6:1;
    ctx.fillStyle=i%5===0?'#bed9f7':'#a5a3c5';
    ctx.fillRect(x,y,size,size);
    if(i%13===0){ctx.fillStyle='#e0e9f9';ctx.fillRect(x-1.8,y+.3,4.8,.7);ctx.fillRect(x+.3,y-1.8,.7,4.8)}
  }
  if(flight.phase!=='launch')return;
  const t=clamp(flight.age/1.8,0,1),ease=t*t*(3-2*t);
  ctx.save();
  if(reduceMotion)ctx.globalAlpha=1-ease;else ctx.translate(0,H*ease);
  ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();drawCover(stages[2].image);ctx.restore();
  if(!reduceMotion){
    for(let i=0;i<33;i++){
      const x=(i*.618%1)*W,y=((i*.327+ease*1.88)%1)*H;
      ctx.fillStyle='rgba(194,223,255,'+(Math.sin(Math.PI*t)*.5)+')';
      ctx.fillRect(x,y,1.4,H*.10*Math.sin(Math.PI*t));
    }
    const edge=H*ease,glow=ctx.createLinearGradient(0,edge-30,0,edge+18);
    glow.addColorStop(0,'transparent');glow.addColorStop(.65,'#b3c4ffa0');glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow;ctx.fillRect(0,edge-30,W,48);
  }
}
function cellPath(points){
  ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
  ctx.closePath();
}
function planetDisc(world,turn=spinAngle()){
  const rendered=world.skin.frame(turn);
  if(rendered){ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(rendered,-1,-1,2,2);ctx.restore();return}
  if(world.image.naturalWidth){ctx.drawImage(world.image,-1,-1,2,2);return}
  const g=ctx.createRadialGradient(-.3,-.4,.1,0,0,1.1);
  g.addColorStop(0,world.core);g.addColorStop(.38,world.color);g.addColorStop(1,'#26223e');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();
}
const ringBands={
  amethyst:[[1.42,.09,'#b986b3'],[1.56,.045,'#e2b29c'],[1.63,.025,'#ae92cb'],[1.74,.065,'#b6a6dd'],[1.85,.013,'#f6d1b1']],
  copper:[[1.30,.027,'#ffdda3'],[1.39,.067,'#da8658'],[1.56,.018,'#ffe2c2']]
};
function drawOrbitRing(near,alpha=1,ring='amethyst'){
  ctx.save();ctx.rotate(ring==='copper'?.34:-.29);
  for(const [scale,width,color] of ringBands[ring]){
    ctx.globalAlpha=alpha*(near?.78:.49);ctx.lineWidth=width;ctx.strokeStyle=color;
    ctx.beginPath();ctx.ellipse(0,0,scale,scale*.24,0,near?0:Math.PI,near?Math.PI:Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}
function satellite(x,y,r,phase,color){
  ctx.save();ctx.translate(x,y);ctx.scale(r,r);
  const g=ctx.createRadialGradient(-.45,-.42,.04,0,0,1.1);
  g.addColorStop(0,'#ffedcf');g.addColorStop(.31,color);g.addColorStop(.74,'#53415e');g.addColorStop(1,'#161425');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.clip();
  for(let i=0;i<5;i++){
    const a=phase+i*2.4;
    ctx.fillStyle='#38274b73';ctx.beginPath();ctx.ellipse(Math.sin(a)*.74,Math.sin(i*3.1+.4)*.75,.11+i*.015,.07+i*.014,a,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}
function drawTitleOrbit(){
  const portrait=W/H<.98,r=portrait?W*.224:H*.279;
  const x=portrait?W*.88:W*.91,y=portrait?H*.335:H*.64;
  const t=reduceMotion?.26:clock*.013+.26;
  ctx.save();ctx.translate(x,y);ctx.scale(r,r);
  drawOrbitRing(false,.86);planetDisc(worlds[2],t);drawOrbitRing(true,.91);ctx.restore();
  if(!portrait)satellite(W*.51,H*.23,H*.021,t*3,'#c6b0eb');
}
function drawPlanet(){
  const p=orbitTarget(),world=worlds[flight.index];
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.r,p.r);
  const broken=flight.phase==='break',t=broken?flight.age:0;
  const glow=ctx.createRadialGradient(0,0,.12,0,0,1.34+t*.52);
  glow.addColorStop(0,world.core+(broken?'ee':'30'));glow.addColorStop(.73,world.color+(broken?'5c':'49'));glow.addColorStop(1,world.color+'00');
  ctx.save();ctx.globalAlpha=Math.max(0,1-t/1.75);ctx.fillStyle=glow;
  ctx.beginPath();ctx.rect(-3,-3,6,6);ctx.moveTo(1,0);ctx.arc(0,0,1,0,Math.PI*2);ctx.fill('evenodd');ctx.restore();
  const ringAlpha=Math.max(0,1-t*1.5);
  if(world.rings&&ringAlpha>0)drawOrbitRing(false,ringAlpha,world.rings);
  const phase=spinAngle()*Math.PI*3+.4;
  const sx=Math.sin(phase)*1.56,sy=Math.cos(phase)*.27-.27,sz=Math.cos(phase);
  if(!broken&&sz<0)satellite(sx,sy,.104+sz*.018,phase,world.color);
  if(broken){
    drawFragments(flight.fragments,t,world);
  }else{
    ctx.save();potionSpell.deformDisc();planetDisc(world);ctx.restore();
    if(flight.well>0){
      ctx.save();ctx.lineWidth=.023;
      for(let i=0;i<3;i++){
        const a=flight.wellAge*2.8+i*2.09;
        ctx.strokeStyle=i%2?'#c991eb9f':'#a895e28a';ctx.beginPath();
        ctx.ellipse(0,0,1.18+i*.055,.28+i*.04,-.52,a,a+1.5);ctx.stroke();
      }
      ctx.restore();
    }
  }
  if(world.rings&&ringAlpha>0)drawOrbitRing(true,ringAlpha,world.rings);
  if(!broken&&sz>=0)satellite(sx,sy,.104+sz*.018,phase,world.color);
  ctx.restore();
}
function drawMeteor(e){
  const {x,y,r}=e;ctx.save();ctx.translate(x,y);
  const tail=ctx.createLinearGradient(0,0,r*3.3,0);tail.addColorStop(0,'#ffa780c9');tail.addColorStop(1,'#bd72ae00');
  ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-r*.2,-r*.75);ctx.lineTo(r*3.3,-r*.45);ctx.lineTo(r*.2,r*.68);ctx.fill();
  if(drawRockArt('meteor',0,0,r*2.45,r*2.29,e.age*e.spin)){ctx.restore();return}
  ctx.rotate(e.age*e.spin);
  const rock=ctx.createRadialGradient(-r*.42,-r*.47,r*.08,0,0,r*1.2);
  rock.addColorStop(0,'#ffce95');rock.addColorStop(.31,'#a87b6f');rock.addColorStop(.78,'#584458');rock.addColorStop(1,'#29233a');
  ctx.fillStyle=rock;ctx.strokeStyle='#d39c83';ctx.lineWidth=1.4;
  ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=r*(i%3===0?.78:1);if(i)ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);else ctx.moveTo(rr,0)}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#49343f99';ctx.beginPath();ctx.ellipse(-r*.23,-r*.11,r*.27,r*.19,-.5,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(r*.33,r*.26,r*.13,r*.10,-.8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ebb4a2';ctx.fillRect(-r*.4,-r*.6,r*.45,r*.13);ctx.restore();
}
function drawOrbitForeground(){
  if(flight.phase==='launch')return;
  const p=orbitTarget(),world=worlds[flight.index];
  const mageOpacity=monsterSpell.playerOpacity()*stampedeSpell.riderOpacity();
  if(mageOpacity>0){ctx.save();ctx.globalAlpha=mageOpacity;drawCatTrail();drawFrostHalo();ctx.restore()}
  if(flight.phase==='break')drawBreakLight(p,world,flight.age,false);
  drawPlanet();hatchlings.drawWorld();spitballSpell.drawAim();drawEjecta();drawComets();drawArcs();drawImpactArt();
  if(clawStroke?.points.length){
    const points=clawStroke.points;
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.r,p.r);
    ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=.019;
    ctx.strokeStyle='#b5ffef';ctx.fillStyle='#d9fff9';
    ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
    ctx.stroke();
    const tip=points.at(-1);ctx.beginPath();ctx.arc(tip.x,tip.y,.032,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  if(flight.phase==='break'){
    drawBreakLight(p,world,flight.age,true);
    if(flight.specialAttackFX.length)monsterSpell.draw();
  }else if(flight.specialAttackFX.length){
    for(const attack of specialAttacks)attack.draw();
  }
  if(flight.charge>0){
    const f=flight.charge,{x,y}=castingPaw();
    if(selectedSpell==='purr')purrSpell.drawCharge(f);
    const style=impactStyles[selectedSpell],diameter=12+f*45;
    lightSprite(style.map,x,y,diameter,diameter,clock*.4,.35+f*.55);
    ctx.save();ctx.shadowBlur=12;ctx.shadowColor='#ffd4b5';star(x,y,5+f*15,'#fff4c8');
    ctx.strokeStyle='#d5adff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,10+f*7,-Math.PI/2,-Math.PI/2+Math.PI*2*f);ctx.stroke();ctx.restore();
  }
  stampedeSpell.drawRide();
  if(mageOpacity>.12)drawCastingGesture();
  if(!flight.beam)return;
  const b=flight.beam,spell=planetSpells[b.kind],life=b.kind==='gravity'?.58:.38;
  const t=b.age/life,fade=1-t;
  ctx.save();ctx.lineCap='round';ctx.globalAlpha=Math.max(0,fade);
  const source=castingPaw(),dx=b.x1-source.x,dy=b.y1-source.y,len=Math.hypot(dx,dy)||1;
  const angle=Math.atan2(dy,dx);
  ctx.translate(source.x,source.y);ctx.rotate(angle);
  if(b.kind==='solar'){
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<4;i++){
      const pts=[];for(let n=0;n<=18;n++){
        const f=n/18,wiggle=Math.sin(f*Math.PI)*Math.sin(f*14-t*10+i*1.7)*(4+2*b.power);
        pts.push([len*f,wiggle]);
      }
      penLine(ctx,pts,i===0?'#ff691b99':i===1?'#ffac2a':'#ffda84',i===0?12+b.power*2:i===1?5:2);
    }
    ctx.fillStyle='#fff2a5';ctx.beginPath();ctx.arc(len,0,(4+t*14)*b.power,0,Math.PI*2);ctx.fill();
  }else if(b.kind==='cryo'){
    penLine(ctx,[[0,0],[len,0]],'#7ce4ff66',6);
    for(let i=1;i<=6;i++){
      const x=len*((i-1+t)/6),w=5+b.power,h=w*.73;
      ctx.fillStyle=i%2?'#8be6fe':'#ccf9ff';ctx.beginPath();ctx.moveTo(x-2*w,0);ctx.lineTo(x,-h);ctx.lineTo(x+w,0);ctx.lineTo(x,h);ctx.closePath();ctx.fill();
    }
    for(let i=0;i<7;i++){const a=i*.9+t*.3,l=(8+t*18)*b.power;
      penLine(ctx,[[len,0],[len+Math.cos(a)*l*.6,Math.sin(a)*l*.5],[len+Math.cos(a+.19)*l,Math.sin(a+.19)*l]],'#d1fcff',2);}
  }else if(b.kind==='gravity'){
    ctx.lineWidth=1.5;ctx.strokeStyle='#c591fa';ctx.beginPath();ctx.moveTo(0,0);
    ctx.bezierCurveTo(len*.27,14*(1-t),len*.73,-22*(1-t),len,0);ctx.stroke();
    ctx.translate(len,0);ctx.rotate(-angle+t*1.9);
    const r=(9+b.power*4)*(1+.5*Math.sin(t*Math.PI));
    const dark=ctx.createRadialGradient(0,0,1,0,0,r*2);dark.addColorStop(0,'#080518');dark.addColorStop(.40,'#1f1133');dark.addColorStop(.59,'#c58af5');dark.addColorStop(1,'#a777dc00');
    ctx.fillStyle=dark;ctx.fillRect(-2*r,-2*r,4*r,4*r);
    for(let i=0;i<3;i++){ctx.rotate(2.09);ctx.strokeStyle='#dcc4ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,r*1.7,r*.63,.25,t,Math.PI+t);ctx.stroke()}
  }else{
    const pts=[];
    for(let i=0;i<=10;i++){const f=i/10;pts.push([len*f,Math.sin(f*Math.PI)*Math.sin(i*2.77+Math.floor(t*6))*b.power])}
    for(const [color,width] of [['#bd79ff66',8],['#ffb9d6',3.3],['#fff8d8',1.45]])penLine(ctx,pts,color,width*(1+b.power*.57)*(.6+fade*.4));
    star(len,0,7+5*b.power,spell.core,fade);
  }
  ctx.restore();
}
